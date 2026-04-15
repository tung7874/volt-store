import React, { useEffect, useState } from 'react';
import { ShoppingCart, History as HistoryIcon, Plus, Minus } from 'lucide-react';
import { getProducts } from '../lib/api';
import { useCart } from '../context/CartContext';

export default function Shop({ navigate }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState('');
  const { cart, addItem, removeItem } = useCart();

  useEffect(() => {
    getProducts().then(res => {
      if (res.status === 'success' && res.data) {
        setProducts(res.data);
        const cats = [...new Set(res.data.map(p => p.category).filter(Boolean))];
        if (cats.length > 0) setActiveCat(cats[0]);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const groupedCategories = {};
  products.forEach(p => {
    if (!p.category) return;
    const parts = p.category.split('-');
    const main = parts[0].trim();
    // Default to '全部' (All) if no dash is provided
    const sub = parts.length > 1 ? parts.slice(1).join('-').trim() : '全部';
    
    if (!groupedCategories[main]) groupedCategories[main] = [];
    if (!groupedCategories[main].find(item => item.sub === sub)) {
      groupedCategories[main].push({ fullCat: p.category, sub });
    }
  });

  // Sort sub-categories A to Z
  Object.keys(groupedCategories).forEach(main => {
    groupedCategories[main].sort((a, b) => a.sub.localeCompare(b.sub));
  });

  const filtered = products.filter(p => p.category === activeCat);
  const totalAmount = cart.total;

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
        <h1 className="text-xl font-black tracking-tighter">VOLT</h1>
        <button onClick={() => navigate('history')} className="flex items-center text-sm font-bold text-gray-500 hover:text-black">
          <HistoryIcon size={16} className="mr-1" />
          訂購歷史
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar (25%ish - min/max width for mobile) */}
        <div className="w-[28%] bg-gray-50 h-full overflow-y-auto no-scrollbar border-r border-gray-100 pb-20">
          {Object.entries(groupedCategories).map(([mainTitle, subItems]) => (
            <div key={mainTitle} className="mb-2">
              <div className="px-3 py-2 text-[11px] font-black text-gray-400 uppercase tracking-widest sticky top-0 bg-gray-50/90 backdrop-blur-sm z-10">
                {mainTitle}
              </div>
              <div className="flex flex-col">
                {subItems.map(item => (
                  <button 
                    key={item.fullCat}
                    onClick={() => setActiveCat(item.fullCat)}
                    className={`w-full text-left pl-4 pr-2 py-3 text-[13px] font-bold transition-all ${
                      activeCat === item.fullCat ? 'bg-white text-black border-l-[3px] border-black' : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {item.sub}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right Product list (72%) */}
        <div className="flex-1 h-full overflow-y-auto p-4 pb-24 relative">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}
            </div>
          ) : (
             <div className="flex flex-col gap-4">
               {filtered.map(product => {
                 const cartItem = cart.items.find(i => i.id === product.id);
                 const qty = cartItem ? cartItem.qty : 0;
                 return (
                   <div key={product.id} className="flex gap-3 pb-4 border-b border-gray-50 last:border-0">
                     <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden shrink-0 p-1">
                       <img src={product.imageUrl || `https://ui-avatars.com/api/?name=${product.name}&background=F3F4F6`} className="w-full h-full object-contain mix-blend-multiply" />
                     </div>
                     <div className="flex flex-col flex-1">
                       <h3 className="font-bold text-sm leading-tight text-gray-900 line-clamp-2">{product.name}</h3>
                       <p className="text-[10px] text-gray-400 mt-1 uppercase">剩餘: {product.stock || '666'}</p>
                       <div className="mt-auto pt-2 flex justify-between items-center w-full">
                         <span className="font-bold text-black">${product.price}</span>
                         
                         {qty === 0 ? (
                            <button onClick={() => addItem(product)} className="w-7 h-7 bg-black text-white rounded-full flex items-center justify-center shadow-md">
                              <Plus size={16} />
                            </button>
                         ) : (
                            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-1 py-0.5">
                              <button onClick={() => removeItem(product.id)} className="w-7 h-7 flex items-center justify-center text-black bg-white rounded-full shadow-sm">
                                <Minus size={14}/>
                              </button>
                              <span className="text-xs font-bold w-4 text-center">{qty}</span>
                              <button onClick={() => addItem(product)} className="w-7 h-7 flex items-center justify-center text-white bg-black rounded-full shadow-sm">
                                <Plus size={14}/>
                              </button>
                            </div>
                         )}
                       </div>
                     </div>
                   </div>
                 );
               })}
             </div>
          )}
        </div>
      </div>

      <div className="absolute right-4 bottom-4 left-[30%]">
        <button 
          onClick={() => navigate('cart')}
          className="w-full bg-black text-white rounded-2xl p-4 flex justify-between items-center shadow-xl active:scale-95 transition-transform"
        >
          <div className="flex items-center">
            <ShoppingCart size={20} className="mr-2" />
            <span className="font-bold text-sm">購物車</span>
          </div>
          <span className="font-black text-lg">${totalAmount}</span>
        </button>
      </div>
    </div>
  );
}
