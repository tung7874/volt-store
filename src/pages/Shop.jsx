import React, { useEffect, useState, useMemo } from 'react';
import { ShoppingCart, Plus, Minus, LogOut } from 'lucide-react';
import { getProducts } from '../lib/api';
import { preloadConfig, setCachedConfig } from '../lib/config';
import { normalizeProductRecord, shouldShowProduct } from '../lib/productIdentity';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import InstallPrompt from '../components/InstallPrompt';
import PromoInfo from '../components/PromoInfo';

let globalProductsCache = [];
let globalActiveCatCache = '';

export default function Shop({ navigate }) {
  const [products, setProducts] = useState(globalProductsCache);
  const [loading, setLoading] = useState(globalProductsCache.length === 0);
  const [activeCat, setActiveCat] = useState(globalActiveCatCache);
  const { cart, addItem, removeItem } = useCart();
  const { logout } = useAuth();

  useEffect(() => {
    getProducts().then(res => {
      if (res.status === 'success' && res.data) {
        const rawProducts = Array.isArray(res.data) ? res.data : res.data.products || [];
        if (res.data.config) setCachedConfig(res.data.config);
        else preloadConfig();

        const cleanedData = rawProducts.map(normalizeProductRecord);
        
        globalProductsCache = cleanedData;
        setProducts(cleanedData);
        // Default to the first subCategory only if none was active
        const filteredCats = [...new Set(cleanedData.map(p => p.subCategory).filter(Boolean))];
        if (filteredCats.length > 0 && !globalActiveCatCache) {
          setActiveCat(filteredCats[0]);
          globalActiveCatCache = filteredCats[0];
        }
      } else {
        preloadConfig();
      }
      setLoading(false);
    }).catch(() => {
      preloadConfig();
      setLoading(false);
    });
  }, []);

  // Update global cache anytime activeCat changes so we remember where they were
  useEffect(() => {
    if (activeCat) globalActiveCatCache = activeCat;
  }, [activeCat]);

  const categories = useMemo(() => {
    const map = new Map();
    products.filter(shouldShowProduct).forEach(p => {
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

  const filtered = products.filter(p => shouldShowProduct(p) && (p.subCategory || '全部') === activeCat);
  const totalAmount = cart.total;

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-ios-bg relative">
      {/* Top Header */}
      <div className="bg-white dark:bg-ios-bg px-4 py-3 shadow-sm z-10 flex justify-between items-center sticky top-0 border-b border-gray-100 dark:border-ios-separator">
        <h1 className="text-xl font-black tracking-tighter text-black dark:text-white flex items-center gap-2">
          VOLT
        </h1>
        <button onClick={() => navigate('history')} className="text-sm font-bold text-gray-400 dark:text-ios-secondary bg-gray-50 dark:bg-ios-surface px-3 py-1.5 rounded-full flex flex-row gap-1 border border-gray-100 dark:border-ios-separator">
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
           訂購歷史
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar (25%ish - min/max width for mobile) */}
        <div className="w-[28%] bg-gray-50 dark:bg-ios-bg h-full border-r border-gray-100 dark:border-ios-separator">
          <div className="flex h-full flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar">
              <InstallPrompt variant="sidebar" />
              <PromoInfo />
              {Object.entries(categories).map(([mainTitle, subItems]) => (
                <div key={mainTitle} className="mb-2">
                  <div className="px-3 py-2 text-[11px] font-black text-gray-400 dark:text-ios-tertiary uppercase tracking-widest sticky top-0 bg-gray-50/90 dark:bg-ios-bg/90 backdrop-blur-sm z-10">
                    {mainTitle}
                  </div>
                  <div className="flex flex-col">
                    {subItems.map(item => (
                      <button 
                        key={item.sub}
                        onClick={() => setActiveCat(item.sub)}
                        className={`w-full text-left pl-4 pr-2 py-3 text-[13px] font-bold transition-all ${
                          activeCat === item.sub ? 'bg-white dark:bg-ios-surface text-black dark:text-white border-l-[3px] border-black dark:border-white' : 'text-gray-500 dark:text-ios-secondary hover:bg-gray-100 dark:hover:bg-ios-surface'
                        }`}
                      >
                        {item.sub}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 p-3 pb-24 dark:border-ios-separator">
              <button
                onClick={logout}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-3 text-[13px] font-bold text-gray-600 shadow-sm dark:border-ios-separator dark:bg-ios-surface dark:text-ios-secondary"
              >
                <LogOut size={15} />
                登出
              </button>
            </div>
          </div>
        </div>

        {/* Right Product list (72%) */}
        <div className="flex-1 h-full overflow-y-auto p-4 pb-24 relative">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 dark:bg-ios-surface rounded-xl" />)}
            </div>
          ) : (
             <div className="flex flex-col gap-4">
               {filtered.map(product => {
                 const cartItem = cart.items.find(i => i.id === product.id);
                 const qty = cartItem ? cartItem.qty : 0;
                 const stock = Number(product.stock) || 0;
                 const soldOut = stock <= 0;
                 return (
                   <div key={product.id} className="flex gap-3 pb-4 border-b border-gray-50 dark:border-ios-separator last:border-0">
                     <div className="w-20 h-20 bg-gray-100 dark:bg-ios-surface rounded-xl overflow-hidden shrink-0 flex items-center justify-center border border-gray-200 dark:border-ios-separator p-[2px]">
                       {product.imageUrl ? (
                         <img src={product.imageUrl} className="w-full h-full object-cover rounded-lg" alt={product.name} />
                       ) : (
                         <div className="w-full h-full bg-gray-100 dark:bg-ios-surface rounded-lg" />
                       )}
                     </div>
                     <div className="flex flex-col flex-1">
                       <h3 className="font-bold text-sm leading-tight text-gray-900 dark:text-white line-clamp-2">{product.name}</h3>
                       {soldOut ? (
                         <span className="mt-1 text-[11px] font-bold text-gray-400 dark:text-ios-tertiary">售完</span>
                       ) : null}
                       <div className="mt-auto pt-2 flex justify-between items-center w-full">
                         <span className={`font-bold ${soldOut ? 'text-gray-400 dark:text-ios-tertiary' : 'text-black dark:text-white'}`}>${product.price}</span>
                         {(() => {
                            const atMax = qty >= stock;
                            return qty === 0 ? (
                               <button
                                 onClick={() => !soldOut && addItem(product)}
                                 disabled={soldOut}
                                 className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md ${
                                   soldOut ? 'bg-gray-300 dark:bg-ios-surface text-gray-400 dark:text-ios-tertiary cursor-not-allowed' : 'bg-black dark:bg-ios-surface-2 text-white'
                                 }`}
                               >
                                 <Plus size={16} />
                               </button>
                            ) : (
                               <div className="flex items-center gap-2 bg-gray-100 dark:bg-ios-surface rounded-full px-1 py-0.5">
                                 <button onClick={() => removeItem(product.id)} className="w-7 h-7 flex items-center justify-center text-black dark:text-white bg-white dark:bg-ios-surface-2 rounded-full shadow-sm">
                                   <Minus size={14}/>
                                 </button>
                                 <span className="text-xs font-bold w-4 text-center text-black dark:text-white">{qty}</span>
                                 <button
                                   onClick={() => !atMax && addItem(product)}
                                   disabled={atMax}
                                   className={`w-7 h-7 flex items-center justify-center rounded-full shadow-sm transition-all ${
                                     atMax ? 'bg-gray-300 dark:bg-ios-surface text-gray-400 dark:text-ios-tertiary cursor-not-allowed' : 'text-white bg-black dark:bg-ios-surface-2'
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

      <div className="absolute bottom-4 left-[30%] right-4 z-20">
        <button 
          onClick={() => navigate('cart')}
          className="flex w-full items-center justify-between rounded-2xl bg-black p-3.5 text-white shadow-xl transition-transform active:scale-95 dark:bg-ios-surface"
        >
          <div className="flex items-center">
            <ShoppingCart size={18} className="mr-2" />
            <span className="text-[13px] font-bold">購物車</span>
          </div>
          <span className="text-base font-black">${totalAmount}</span>
        </button>
      </div>
    </div>
  );
}

