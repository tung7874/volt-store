import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Login from './pages/Login';
import Shop from './pages/Shop';
import History from './pages/History';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';

function AppContent() {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState('shop'); // login, shop, history, cart, checkout

  // Splash screen removed for instant loading

  // 如果使用者沒登入，強制顯示 Login
  if (!user) {
    return (
      <div className="bg-gray-100 dark:bg-gray-950 min-h-screen">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-950 min-h-screen relative shadow-2xl overflow-hidden flex flex-col">
          <Login />
        </div>
      </div>
    );
  }

  // Router switch
  const renderPage = () => {
    switch (activePage) {
      case 'shop':
        return <Shop navigate={setActivePage} />;
      case 'history':
        return <History navigate={setActivePage} />;
      case 'cart':
        return <Cart navigate={setActivePage} />;
      case 'checkout':
        return <Checkout navigate={setActivePage} />;
      default:
        return <Shop navigate={setActivePage} />;
    }
  };

  return (
    <div className="bg-gray-200 dark:bg-gray-950 min-h-screen sm:py-8">
      {/* Mobile constraint wrapper */}
      <div className="max-w-md mx-auto bg-white dark:bg-gray-950 min-h-screen sm:min-h-[800px] sm:h-[800px] relative shadow-2xl sm:rounded-[40px] overflow-hidden flex flex-col">
        {renderPage()}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
