import React from 'react';
import { ChevronLeft, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Cart({ navigate }) {
  const { cart, addItem, removeItem } = useCart();

  const handleFullRemove = (item) => {
    let remaining = item.qty;
    while(remaining > 0) { 
      removeItem(item.id); 
      remaining--; 
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-ios-bg relative">
      <div className="flex items-center p-4 border-b border-gray-100 dark:border-ios-separator shrink-0 sticky top-0 z-10 bg-white dark:bg-ios-bg">
        <button onClick={() => navigate('shop')} className="p-2 -ml-2 text-black dark:text-white flex items-center hover:bg-gray-50 dark:hover:bg-ios-surface rounded-lg">
          <ChevronLeft size={24} />
          <span className="font-bold text-sm">上一頁</span>
        </button>
        <span className="text-lg font-bold mx-auto pr-16 text-black dark:text-white">購物車</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
        {cart.items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 pt-20">
            <span className="text-sm font-medium">您的購物車是空的</span>
            <button onClick={() => navigate('shop')} className="border border-gray-300 dark:border-ios-separator text-black dark:text-white active:bg-gray-100 dark:active:bg-ios-surface px-6 py-2 rounded-full font-bold">去選購</button>
          </div>
        ) : (
          cart.items.map(item => (
            <div key={item.id} className="flex items-center gap-3 border-b border-gray-50 dark:border-ios-separator pb-4 last:border-0 relative">
              <div className="absolute top-0 right-0">
                 <button onClick={() => handleFullRemove(item)} className="text-gray-300 hover:text-red-500 p-1">
                    <Trash2 size={16} />
                 </button>
              </div>
              <div className="w-20 h-20 bg-gray-100 dark:bg-ios-surface rounded-xl overflow-hidden shrink-0 flex items-center justify-center border border-gray-200 dark:border-ios-separator p-[2px]">
                {item.imageUrl ? (
                  <img src={item.imageUrl} className="w-full h-full object-cover rounded-lg" alt={item.name} />
                ) : (
                  <div className="w-full h-full bg-gray-100 dark:bg-ios-surface rounded-lg" />
                )}
              </div>
              <div className="flex flex-col flex-1 h-20 justify-between">
                <h3 className="font-bold text-sm leading-tight text-gray-900 dark:text-white pr-6 line-clamp-2">{item.name}</h3>
                
                <div className="mt-auto flex justify-between items-end w-full">
                  <span className="font-bold text-black dark:text-white">${item.price * item.qty}</span>
                  <div className="flex items-center gap-2 bg-gray-200/50 dark:bg-ios-surface rounded-full px-1 py-0.5">
                    <button onClick={() => removeItem(item.id)} className="w-7 h-7 flex items-center justify-center text-black dark:text-white bg-white dark:bg-ios-surface-2 rounded-full shadow-sm">
                      <Minus size={14}/>
                    </button>
                    <span className="text-xs font-bold w-4 text-center text-black dark:text-white">{item.qty}</span>
                    <button onClick={() => addItem(item)} className="w-7 h-7 flex items-center justify-center text-white bg-black dark:bg-ios-surface-2 rounded-full shadow-sm">
                      <Plus size={14}/>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {cart.items.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-ios-bg border-t border-gray-100 dark:border-ios-separator shadow-[0_-10px_20px_rgba(0,0,0,0.03)] z-50">
           <div className="mb-4">
             <div className="flex justify-between items-center mb-1 px-2 text-sm">
               <span className="text-gray-500">商品小計</span>
               <span className="font-bold text-gray-700 dark:text-ios-secondary">${cart.itemsTotal || cart.total}</span>
             </div>
             <div className="flex justify-between items-center px-2 text-sm border-b border-gray-50 dark:border-ios-separator pb-2 mb-2">
               <span className="text-gray-500">運費</span>
               <span className="font-bold text-gray-700 dark:text-ios-secondary">
                 {cart.shippingFee === 0 ? <span className="text-green-600">免運費</span> : `$${cart.shippingFee}`}
               </span>
             </div>
             <div className="flex justify-between items-end px-2">
               <div className="flex flex-col">
                 <span className="text-gray-900 dark:text-white font-bold mb-1">總計金額</span>
                 {cart.itemsTotal < 1000 && (
                   <span className="text-[10px] text-orange-500 dark:text-ios-orange font-bold bg-orange-50 dark:bg-ios-surface px-2 py-0.5 rounded">
                     再買 ${(1000 - cart.itemsTotal)} 即可享免運費！
                   </span>
                 )}
                 {cart.itemsTotal >= 1000 && (
                   <span className="text-[10px] text-green-600 dark:text-ios-green font-bold bg-green-50 dark:bg-ios-surface px-2 py-0.5 rounded">
                     已達滿千免運門檻 🎉
                   </span>
                 )}
               </div>
               <span className="text-3xl font-black text-black dark:text-white">${cart.total}</span>
             </div>
           </div>
           <button 
             onClick={() => navigate('checkout')}
             className="w-full bg-black dark:bg-white text-white dark:text-black rounded-2xl py-4 font-bold text-lg shadow-xl active:scale-95 transition-transform"
           >
             下一步：結帳
           </button>
        </div>
      )}
    </div>
  );
}

