import React, { useRef } from 'react';
import { motion } from 'framer-motion';

export default function CategoryBar({ categories, activeCat, setActiveCat }) {
  const scrollRef = useRef(null);

  return (
    <div className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-30 pt-4 pb-2 px-4 shadow-sm">
      <div 
        ref={scrollRef}
        className="flex space-x-3 overflow-x-auto no-scrollbar pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className={`relative whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
              activeCat === cat 
                ? 'text-white bg-black shadow-md' 
                : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
