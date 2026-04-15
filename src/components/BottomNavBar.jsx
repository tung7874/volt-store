import React from 'react';
import { Home, ShoppingBag, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';

export default function BottomNavBar({ activeTab, setActiveTab }) {
  const { cart } = useCart();
  const totalItems = cart.items.reduce((acc, item) => acc + item.qty, 0);

  const tabs = [
    { id: 'home', label: '首頁', icon: Home },
    { id: 'cart', label: '購物車', icon: ShoppingBag, badge: totalItems },
    { id: 'profile', label: '會員', icon: User }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-t border-gray-200 safe-area-pb">
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
              activeTab === tab.id ? 'text-black' : 'text-gray-400'
            }`}
          >
            <tab.icon className="w-6 h-6" strokeWidth={activeTab === tab.id ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{tab.label}</span>
            {tab.badge > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                key={tab.badge}
                className="absolute top-1.5 right-6 w-4 h-4 bg-red-500 text-white flex items-center justify-center rounded-full text-[9px] font-bold"
              >
                {tab.badge}
              </motion.span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
