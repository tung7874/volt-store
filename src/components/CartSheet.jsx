import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartSheet({ isOpen, onClose }) {
  const { cart, addItem, removeItem } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-xl max-w-md mx-auto overflow-hidden flex flex-col max-h-[85vh]"
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-xl font-bold">購物車</h2>
              <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:text-black transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto flex-grow p-5 space-y-4">
              {cart.items.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p>購物車是空的</p>
                </div>
              ) : (
                cart.items.map(item => (
                  <div key={item.id} className="flex items-center gap-4">
                    <img src={item.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=F3F4F6&color=9CA3AF&size=100`} 
                         className="w-16 h-16 rounded-xl object-contain bg-gray-50 p-1" />
                    <div className="flex-grow">
                      <h4 className="font-bold text-sm leading-tight text-gray-900">{item.name}</h4>
                      <p className="text-gray-500 text-xs mt-1">${item.price}</p>
                    </div>
                    <div className="flex items-center bg-gray-100 rounded-full px-2 py-1">
                      <button onClick={() => removeItem(item.id)} className="p-1"><Minus size={14} /></button>
                      <span className="text-sm font-bold w-6 text-center">{item.qty}</span>
                      <button onClick={() => addItem(item)} className="p-1"><Plus size={14} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {cart.items.length > 0 && (
              <div className="p-5 border-t border-gray-100 bg-gray-50 safe-area-pb pb-8">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-500 font-medium">總計</span>
                  <span className="text-2xl font-bold">${cart.total}</span>
                </div>
                <button className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg hover:bg-gray-800 transition-colors shadow-lg active:scale-95 duration-200">
                  結帳 (${cart.total})
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
