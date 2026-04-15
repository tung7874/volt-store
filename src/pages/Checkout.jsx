import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { createOrder, updateProfile } from '../lib/api';

export default function Checkout({ navigate }) {
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  
  const [name, setName] = useState(user?.name || localStorage.getItem('last_name') || '');
  // AuthContext stores the confirmed phone securely
  const [phone] = useState(user?.phone || localStorage.getItem('userPhone') || '');
  const [store, setStore] = useState(user?.storeName || localStorage.getItem('last_store') || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.items.length === 0) return;
    setLoading(true);
    
    // 儲存最新的會員聯絡與店家資料
    await updateProfile({ phone, name, storeName: store });
    localStorage.setItem('last_name', name);
    localStorage.setItem('last_store', store);
    
    // 建立訂單，寫入 Google Sheet
    const items = cart.items.map(i => ({ id: i.id, name: i.name, qty: i.qty, price: i.price }));
    const res = await createOrder(phone, items, cart.total);
    
    setLoading(false);
    if(res.status === 'success') {
      clearCart();
      alert('訂購成功！感謝您的購買！');
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
              onChange={e => setName(e.target.value)}
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
            <p className="text-[10px] text-gray-400 mt-1 pl-1">手機號碼綁定於您的登入帳號，無法在此更改。</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">取件店家名稱 (7-11)</label>
            <input 
              type="text" 
              required
              value={store}
              onChange={e => setStore(e.target.value)}
              className="w-full bg-white border border-gray-200 text-black text-lg rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition-all shadow-sm"
              placeholder="例如：7-11 鑫湖門市"
            />
            <p className="text-[10px] text-gray-400 mt-2 pl-1 leading-normal">此為預約單系統，目前採用文字填寫。請正確輸入門市名稱以便我們後續寄送。</p>
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
          {loading ? (
             <span className="animate-pulse">訂單建立中...</span>
          ) : (
             `確認送出 ($${cart.total})`
          )}
        </button>
      </div>
    </div>
  );
}
