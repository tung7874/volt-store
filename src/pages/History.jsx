import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function History({ navigate }) {
  const { user } = useAuth();
  
  const mockOrders = [
    { id: 'ORD123', date: '2026-04-10 14:30', name: user?.name || '陳馬克', store: '7-11 鑫湖門市', items: '經典款鴨舌帽 x1', status: '已寄出' },
    { id: 'ORD124', date: '2026-04-12 10:15', name: user?.name || '陳馬克', store: '全家 大安店', items: '純棉短T恤 x2', status: '已訂購' }
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      <div className="flex items-center p-4 bg-white border-b border-gray-100 shrink-0 sticky top-0 z-10">
        <button onClick={() => navigate('shop')} className="p-2 -ml-2 text-black">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold ml-2">訂購歷史</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {mockOrders.map(order => (
          <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-gray-400 font-medium">{order.date}</span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${order.status === '已寄出' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                {order.status}
              </span>
            </div>
            
            <div className="space-y-2 mb-2">
              <div className="flex font-medium text-sm text-gray-900 border-b border-gray-50 pb-2">
                <span className="w-16 text-gray-400 shrink-0">購買人</span> 
                <span className="truncate">{order.name}</span>
              </div>
              <div className="flex font-medium text-sm text-gray-900 border-b border-gray-50 pb-2">
                <span className="w-16 text-gray-400 shrink-0">取貨店</span> 
                <span className="truncate">{order.store}</span>
              </div>
              <div className="flex font-medium text-sm text-gray-900">
                <span className="w-16 text-gray-400 shrink-0">商品</span> 
                <span className="line-clamp-2">{order.items}</span>
              </div>
            </div>
          </div>
        ))}
        {/* Placeholder if empty */}
        {mockOrders.length === 0 && (
          <div className="text-center py-20 text-gray-400 font-medium text-sm">
            目前沒有訂購歷史
          </div>
        )}
      </div>
    </div>
  );
}
