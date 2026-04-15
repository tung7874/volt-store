import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  const handleAdd = (e) => {
    e.stopPropagation();
    addItem(product);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.97 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100/50 flex flex-col"
    >
      <div className="aspect-square bg-gray-50 flex items-center justify-center p-4 relative">
        <img 
          src={product.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=F3F4F6&color=9CA3AF&size=200`} 
          alt={product.name}
          className="object-contain w-full h-full mix-blend-multiply"
        />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="text-xs text-gray-400 font-medium tracking-wide mb-1 uppercase">
          {product.category}
        </div>
        <h3 className="font-bold text-gray-900 leading-snug line-clamp-2 mb-2 flex-grow">
          {product.name}
        </h3>
        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="font-bold text-lg text-black">
            ${product.price}
          </span>
          <button 
            onClick={handleAdd}
            className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors shadow-sm"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
