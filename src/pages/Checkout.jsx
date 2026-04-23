import { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { createOrder, updateProfile } from '../lib/api';

export default function Checkout({ navigate }) {
  const { user } = useAuth();
  const { cart, clearCart } = useCart();

  const [name, setName] = useState(user?.name || localStorage.getItem('last_name') || '');
  const [phone] = useState(user?.phone || localStorage.getItem('userPhone') || '');
  const [store, setStore] = useState(user?.storeName || localStorage.getItem('last_store') || '');
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
      let category = '';
      if (item.mainCategory && item.mainCategory !== '未分類') category += item.mainCategory;
      if (item.subCategory && item.subCategory !== '未分類') category += `${category ? ' - ' : ''}${item.subCategory}`;
      return `${category ? `[${category}] ` : ''}${item.name} x ${item.qty}`;
    });

    if (cart.shippingFee > 0) {
      items.push('物流運費 x 1');
    }

    const res = await createOrder(phone, items, cart.total, name, store);

    setLoading(false);
    if (res.status === 'success') {
      clearCart();
      alert('訂單成功！請確認完成匯款，感謝您的購買！');
      navigate('history');
    } else {
      alert('訂單建立失敗，請稍後再試。');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      <div className="flex items-center p-4 border-b border-gray-100 shrink-0 sticky top-0 z-10 bg-white shadow-sm">
        <button onClick={() => navigate('cart')} className="p-2 -ml-2 text-black flex items-center">
          <ChevronLeft size={24} />
        </button>
        <span className="text-lg font-bold ml-2">結帳資料</span>
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
              className="w-full bg-white border border-gray-200 text-black text-lg rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition-all shadow-sm"
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
              className="w-full bg-gray-100 border border-gray-200 text-gray-500 text-lg rounded-xl px-4 py-3 focus:outline-none"
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
                className="text-[11px] font-bold text-white bg-black hover:bg-gray-800 px-3 py-1.5 rounded-full shadow-md active:scale-95 transition-all shrink-0"
              >
                選擇門市
              </button>
            </div>
            <input
              type="text"
              required
              value={store}
              onChange={(event) => setStore(event.target.value)}
              className="w-full bg-white border border-gray-200 text-black text-lg rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition-all shadow-sm mb-2"
              placeholder="點選右上按鈕選擇 7-11 門市"
            />
            <p className="text-[10px] text-gray-400 mt-2 pl-1 leading-normal mb-6">
              系統會開啟 7-11 電子地圖，選取門市後自動帶回此欄位。
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">銀行代碼</label>
                <div className="text-black font-mono text-sm font-bold bg-white px-3 py-2 rounded-lg border border-gray-100">013 (國泰世華)</div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">銀行帳號</label>
                <div className="text-black font-mono text-sm font-bold bg-white px-3 py-2 rounded-lg border border-gray-100">024506026551</div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">人工客服 LINE ID</label>
                <div className="text-black font-mono text-sm font-bold bg-white px-3 py-2 rounded-lg border border-gray-100">Markchitung</div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div className="p-4 border-t border-gray-100 bg-white mt-auto z-20">
        <button
          form="checkoutForm"
          type="submit"
          disabled={loading || cart.items.length === 0}
          className="w-full bg-black text-white rounded-2xl py-4 font-bold text-lg shadow-xl active:scale-95 transition-transform disabled:opacity-50 flex justify-center items-center"
        >
          {loading ? <span className="animate-pulse">訂單建立中...</span> : `確認送出 ($${cart.total})`}
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">確認送出訂單？</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                請確認您已完成匯款，並確認所有資料正確。
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3.5 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all"
                >
                  返回檢查
                </button>
                <button
                  onClick={confirmSubmit}
                  className="flex-1 py-3.5 rounded-xl font-bold text-white bg-black hover:bg-gray-800 shadow-md active:scale-95 transition-all"
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
