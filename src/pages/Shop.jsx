import React, { useEffect, useState, useMemo } from 'react';
import { ShoppingCart, History as HistoryIcon, Plus, Minus } from 'lucide-react';
import { getProducts } from '../lib/api';
import { useCart } from '../context/CartContext';
import InstallPrompt from '../components/InstallPrompt';

let globalProductsCache = [];
let globalActiveCatCache = '';

export default function Shop({ navigate }) {
  const [products, setProducts] = useState(globalProductsCache);
  const [loading, setLoading] = useState(globalProductsCache.length === 0);
  const [activeCat, setActiveCat] = useState(globalActiveCatCache);
  const { cart, addItem, removeItem } = useCart();

  useEffect(() => {
    getProducts().then(res => {
      if (res.status === 'success' && res.data) {
        // Bulletproof: automatically clean up any accidental spaces in Google Sheet headers
        const cleanedData = res.data.map(item => {
           const cleanItem = {};
           for (let key in item) {
              cleanItem[key.trim()] = item[key];
           }
           return cleanItem;
        });
        
        globalProductsCache = cleanedData;
        setProducts(cleanedData);
        // Default to the first subCategory only if none was active
        const filteredCats = [...new Set(cleanedData.map(p => p.subCategory).filter(Boolean))];
        if (filteredCats.length > 0 && !globalActiveCatCache) {
          setActiveCat(filteredCats[0]);
          globalActiveCatCache = filteredCats[0];
        }
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Update global cache anytime activeCat changes so we remember where they were
  useEffect(() => {
    if (activeCat) globalActiveCatCache = activeCat;
  }, [activeCat]);

  const categories = useMemo(() => {
    const map = new Map();
    products.forEach(p => {
      const main = p.mainCategory || '未分類';
      const sub = p.subCategory || '全部';
      
      if (!map.has(main)) {
        map.set(main, []);
      }
      // Avoid duplicate subCategories under the same mainCategory
      const subs = map.get(main);
      if (!subs.some(s => s.sub === sub)) {
        subs.push({ sub });
      }
    });
    return Object.fromEntries(map);
  }, [products]);

  const filtered = products.filter(p => (p.subCategory || '全部') === activeCat && Number(p.stock) !== 0);
  const totalAmount = cart.total;

  return (
    <div className="flex flex-col h-screen bg-gray-50 relative">
      {/* Top Header */}
      <div className="bg-white px-4 py-3 shadow-sm z-10 flex justify-between items-center sticky top-0 border-b border-gray-100">
        <h1 className="text-xl font-black tracking-tighter text-black flex items-center gap-2">
          VOLT
        </h1>
        <button onClick={() => navigate('history')} className="text-sm font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full flex flex-row gap-1 border border-gray-100">
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
           訂購歷史
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar (25%ish - min/max width for mobile) */}
        <div className="w-[28%] bg-gray-50 h-full overflow-y-auto no-scrollbar border-r border-gray-100 pb-20">
          <InstallPrompt variant="sidebar" />
          {Object.entries(categories).map(([mainTitle, subItems]) => (
            <div key={mainTitle} className="mb-2">
              <div className="px-3 py-2 text-[11px] font-black text-gray-400 uppercase tracking-widest sticky top-0 bg-gray-50/90 backdrop-blur-sm z-10">
                {mainTitle}
              </div>
              <div className="flex flex-col">
                {subItems.map(item => (
                  <button 
                    key={item.sub}
                    onClick={() => setActiveCat(item.sub)}
                    className={`w-full text-left pl-4 pr-2 py-3 text-[13px] font-bold transition-all ${
                      activeCat === item.sub ? 'bg-white text-black border-l-[3px] border-black' : 'text-gray-500 hover:bg-gray-100'
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
                     <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center border border-gray-200 p-[2px]">
                       {product.imageUrl ? (
                         <img src={product.imageUrl} className="w-full h-full object-cover rounded-lg" alt={product.name} />
                       ) : (
                         <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                           <span className="text-gray-300 text-2xl">📦</span>
                         </div>
                       )}
                     </div>
                     <div className="flex flex-col flex-1">
                       <h3 className="font-bold text-sm leading-tight text-gray-900 line-clamp-2">{product.name}</h3>
                       <div className="mt-auto pt-2 flex justify-between items-center w-full">
                         <span className="font-bold text-black">${product.price}</span>
                         {(() => {
                            const stock = Number(product.stock) || 0;
                            const atMax = qty >= stock;
                            return qty === 0 ? (
                               <button onClick={() => addItem(product)} className="w-7 h-7 bg-black text-white rounded-full flex items-center justify-center shadow-md">
                                 <Plus size={16} />
                               </button>
                            ) : (
                               <div className="flex items-center gap-2 bg-gray-100 rounded-full px-1 py-0.5">
                                 <button onClick={() => removeItem(product.id)} className="w-7 h-7 flex items-center justify-center text-black bg-white rounded-full shadow-sm">
                                   <Minus size={14}/>
                                 </button>
                                 <span className="text-xs font-bold w-4 text-center">{qty}</span>
                                 <button
                                   onClick={() => !atMax && addItem(product)}
                                   disabled={atMax}
                                   className={`w-7 h-7 flex items-center justify-center rounded-full shadow-sm transition-all ${
                                     atMax ? 'bg-gray-300 text-gray-400 cursor-not-allowed' : 'text-white bg-black'
                                   }`}
                                 >
                                   <Plus size={14}/>
                                 </button>
                               </div>
                            );
                          })()}
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
