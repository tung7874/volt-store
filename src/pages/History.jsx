import React, { useState, useEffect } from 'react';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getOrders } from '../lib/api';

export default function History({ navigate }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const isShipped = status => String(status || '').toLowerCase() === 'shipped';

  useEffect(() => {
    if (!user?.phone) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    let retries = 0;
    let retryTimer;

    const loadOrders = async () => {
      try {
        const res = await getOrders(user.phone);
        if (cancelled) return;

        if (res.status === 'success' && Array.isArray(res.data)) {
          setOrders(res.data);
          setLoading(false);

          if (res.data.length === 0 && retries < 5) {
            retries += 1;
            retryTimer = window.setTimeout(loadOrders, 2000);
          }
          return;
        }
      } catch (_) {
        // retry below
      }

      if (cancelled) return;
      setLoading(false);
      if (retries < 5) {
        retries += 1;
        retryTimer = window.setTimeout(loadOrders, 2000);
      }
    };

    loadOrders();

    return () => {
      cancelled = true;
      if (retryTimer) window.clearTimeout(retryTimer);
    };
  }, [user]);

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-ios-bg relative">
      <div className="flex items-center p-4 bg-white dark:bg-ios-bg border-b border-gray-100 dark:border-ios-separator shrink-0 sticky top-0 z-10">
        <button onClick={() => navigate('shop')} className="p-2 -ml-2 text-black dark:text-white">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold ml-2 text-black dark:text-white">訂購歷史</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
             <Loader2 className="animate-spin text-gray-400" size={32} />
          </div>
        ) : orders.length > 0 ? (
          orders.map(order => (
            <div key={order.id} className="bg-white dark:bg-ios-surface rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-ios-separator">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-gray-400 font-medium">{order.date}</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${isShipped(order.status) ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                  {isShipped(order.status) ? '已出貨' : '確認中'}
                </span>
              </div>
              
              <div className="space-y-2 mb-2">
                <div className="flex font-medium text-sm text-gray-900 dark:text-white border-b border-gray-50 dark:border-ios-separator pb-2">
                  <span className="w-16 text-gray-400 shrink-0">訂單總額</span> 
                  <span className="truncate text-red-500 font-bold">NT$ {order.total}</span>
                </div>
                <div className="flex font-medium text-sm text-gray-900 dark:text-white">
                  <span className="w-16 text-gray-400 shrink-0 pt-0.5">商品清單</span> 
                  <span className="whitespace-pre-line flex-1 text-gray-700 dark:text-ios-secondary leading-[1.6] text-[13px]">{order.items}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 text-gray-400 font-medium text-sm">
            目前沒有訂購歷史
          </div>
        )}
      </div>
    </div>
  );
}

