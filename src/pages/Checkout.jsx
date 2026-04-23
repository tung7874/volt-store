import { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { createOrder, getConfig, updateProfile } from '../lib/api';
import { parseConfigData } from '../lib/config';

export default function Checkout({ navigate }) {
  const { user, login } = useAuth();
  const { cart, clearCart } = useCart();

  const [name, setName] = useState(user?.name || localStorage.getItem('last_name') || '');
  const [phone] = useState(user?.phone || localStorage.getItem('userPhone') || '');
  const [store, setStore] = useState(user?.storeName || localStorage.getItem('last_store') || '');
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState(() => parseConfigData(null));
  const creditBalance = Math.max(Number(user?.creditBalance) || 0, 0);
  const creditUsed = Math.min(cart.total, creditBalance);
  const payableTotal = Math.max(cart.total - creditUsed, 0);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type !== 'CVS_STORE_SELECTED') return;

      const payload = event.data.payload || {};
      const storeName = payload.storename || payload.CVSStoreName || '';
      const storeId = payload.storeid || payload.CVSStoreID || '';

      if (storeName) {
        setStore(`7-11 ${storeName}門市(${storeId})`);
      } else {
        setStore(`7-11 ${JSON.stringify(payload)}`);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    let mounted = true;

    getConfig().then((res) => {
      if (!mounted || res.status !== 'success') return;
      setPaymentConfig(parseConfigData(res.data));
    });

    return () => {
      mounted = false;
    };
  }, []);

  const handleOpenMap = () => {
    const returnUrl = encodeURIComponent('https://volt-in.vercel.app/api/cvs');
    const mapUrl = `https://emap.presco.com.tw/c2cemap.ashx?eshopid=870&servicetype=1&url=${returnUrl}`;
    const width = 800;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    window.open(mapUrl, 'CVSMap', `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (cart.items.length === 0) return;
    setShowConfirm(true);
  };

  const confirmSubmit = async () => {
    setShowConfirm(false);
    setLoading(true);

    await updateProfile({ phone, name, storeName: store });
    localStorage.setItem('last_name', name);
    localStorage.setItem('last_store', store);

    const items = cart.items.map((item) => {
      const subCategory = item.subCategory && item.subCategory !== '未分類' ? `${item.subCategory}-` : '';
      return `${subCategory}${item.name} x ${item.qty}`;
    });

    const res = await createOrder(phone, items, payableTotal, name, store, creditUsed);

    setLoading(false);
    if (res.status === 'success') {
      await login(phone);
      clearCart();
      alert(payableTotal > 0 ? '訂單成功！請確認完成匯款，感謝您的購買！' : '訂單成功！本次已由購物金全額折抵。');
      navigate('history');
    } else {
      alert('訂單建立失敗，請稍後再試。');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-ios-bg relative">
      <div className="flex items-center p-4 border-b border-gray-100 dark:border-ios-separator shrink-0 sticky top-0 z-10 bg-white dark:bg-ios-bg shadow-sm">
        <button onClick={() => navigate('cart')} className="p-2 -ml-2 text-black dark:text-white flex items-center">
          <ChevronLeft size={24} />
        </button>
        <span className="text-lg font-bold ml-2 text-black dark:text-white">結帳資料</span>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <form id="checkoutForm" onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">真實姓名</label>
            <input
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full bg-white dark:bg-ios-surface border border-gray-200 dark:border-ios-separator text-black dark:text-white text-lg rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all shadow-sm"
              placeholder="您的姓名"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">聯絡手機</label>
            <input
              type="tel"
              required
              readOnly
              value={phone}
              className="w-full bg-gray-100 dark:bg-ios-surface border border-gray-200 dark:border-ios-separator text-gray-500 dark:text-ios-secondary text-lg rounded-xl px-4 py-3 focus:outline-none"
              placeholder="0912345678"
            />
            <p className="text-[10px] text-gray-400 mt-1 pl-1">手機號碼綁定登入帳號，無法在此修改。</p>
          </div>

          <div>
            <div className="flex justify-between items-end mb-2 gap-3">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">取件門市名稱</label>
              <button
                type="button"
                onClick={handleOpenMap}
                className="text-[11px] font-bold text-white bg-black dark:bg-ios-blue hover:bg-gray-800 px-3 py-1.5 rounded-full shadow-md active:scale-95 transition-all shrink-0"
              >
                選擇門市
              </button>
            </div>
            <input
              type="text"
              required
              value={store}
              onChange={(event) => setStore(event.target.value)}
              className="w-full bg-white dark:bg-ios-surface border border-gray-200 dark:border-ios-separator text-black dark:text-white text-lg rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all shadow-sm mb-2"
              placeholder="點選右上按鈕選擇 7-11 門市"
            />
            <p className="text-[10px] text-gray-400 mt-2 pl-1 leading-normal mb-6">
              系統會開啟 7-11 電子地圖，選取門市後自動帶回此欄位。
            </p>

            <div className="bg-gray-50 dark:bg-ios-surface border border-gray-200 dark:border-ios-separator rounded-xl p-4 space-y-4">
              {creditBalance > 0 ? (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900/40 dark:bg-green-950/20">
                  <div className="flex items-center justify-between text-sm font-bold text-green-700 dark:text-green-300">
                    <span>購物金餘額</span>
                    <span>${creditBalance}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm font-medium text-green-700/80 dark:text-green-300/80">
                    <span>本次自動折抵</span>
                    <span>-${creditUsed}</span>
                  </div>
                </div>
              ) : null}
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">銀行代碼</label>
                <div className="text-black dark:text-white font-mono text-sm font-bold bg-white dark:bg-ios-bg px-3 py-2 rounded-lg border border-gray-100 dark:border-ios-separator">
                  {paymentConfig.bankCode}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">銀行帳號</label>
                <div className="text-black dark:text-white font-mono text-sm font-bold bg-white dark:bg-ios-bg px-3 py-2 rounded-lg border border-gray-100 dark:border-ios-separator">
                  {paymentConfig.bankAccount}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">街口帳號</label>
                <div className="text-black dark:text-white font-mono text-sm font-bold bg-white dark:bg-ios-bg px-3 py-2 rounded-lg border border-gray-100 dark:border-ios-separator">
                  {paymentConfig.jkoAccount}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div className="p-4 border-t border-gray-100 dark:border-ios-separator bg-white dark:bg-ios-bg mt-auto z-20">
        {creditUsed > 0 ? (
          <div className="mb-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:border-green-900/40 dark:bg-green-950/20 dark:text-green-300">
            已自動折抵購物金 ${creditUsed}，本次應付 ${payableTotal}
          </div>
        ) : null}
        <button
          form="checkoutForm"
          type="submit"
          disabled={loading || cart.items.length === 0}
          className="w-full bg-black dark:bg-white text-white dark:text-black rounded-2xl py-4 font-bold text-lg shadow-xl active:scale-95 transition-transform disabled:opacity-50 flex justify-center items-center"
        >
          {loading ? <span className="animate-pulse">訂單建立中...</span> : `確認送出 ($${payableTotal})`}
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-ios-surface rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">確認送出訂單？</h3>
              <p className="text-sm text-gray-500 dark:text-ios-secondary mb-6 leading-relaxed">
                {payableTotal > 0
                  ? `請確認您已完成匯款 $${payableTotal}，並確認所有資料正確。`
                  : '本次訂單將由購物金全額折抵，請確認所有資料正確。'}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3.5 rounded-xl font-bold text-gray-700 dark:text-ios-secondary bg-gray-100 dark:bg-ios-surface-2 hover:bg-gray-200 dark:hover:bg-ios-surface-2 active:scale-95 transition-all"
                >
                  返回檢查
                </button>
                <button
                  onClick={confirmSubmit}
                  className="flex-1 py-3.5 rounded-xl font-bold text-white dark:text-black bg-black dark:bg-white hover:bg-gray-800 shadow-md active:scale-95 transition-all"
                >
                  確認送出
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

