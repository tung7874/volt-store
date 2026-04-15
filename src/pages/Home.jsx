import React, { useEffect, useState } from 'react';
import { getProducts } from '../lib/api';
import CategoryBar from '../components/CategoryBar';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState('All');

  useEffect(() => {
    getProducts().then(res => {
      if (res.status === 'success') {
        setProducts(res.data);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

  const filtered = activeCat === 'All' 
    ? products 
    : products.filter(p => p.category === activeCat);

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24">
      {/* Header */}
      <div className="bg-white pt-10 pb-4 px-5">
        <h1 className="text-2xl font-black tracking-tight text-gray-900">
          Volt STORE
        </h1>
        <p className="text-gray-500 text-sm mt-1">為您推薦的專屬好物</p>
      </div>

      <CategoryBar categories={categories} activeCat={activeCat} setActiveCat={setActiveCat} />

      <div className="px-4 py-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="animate-pulse bg-gray-200 rounded-2xl aspect-[3/4]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
