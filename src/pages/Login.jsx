import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft } from 'lucide-react';

export default function Login() {
  const { login, register } = useAuth();
  const [phone, setPhone] = useState('');
  const [refPhone, setRefPhone] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkUser = async (e) => {
    e.preventDefault();
    if (!phone) return;
    setLoading(true);

    const res = await login(phone);
    if (res.status === 'success' && (!res.data || res.message === 'New user' || res.message === '新用戶')) {
      setIsNewUser(true);
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    await register({ phone, refPhone });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center overflow-hidden relative">
      <AnimatePresence mode="wait">
        {!isNewUser ? (
          <motion.div 
            key="login"
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="w-full max-w-sm bg-white rounded-[32px] p-8 shadow-2xl mx-6"
          >
            <div className="text-center mb-8">
              <h1 className="text-4xl font-black tracking-tighter text-black uppercase">VOLT</h1>
            </div>
            
            <form onSubmit={checkUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">登入手機號碼</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-black text-lg rounded-[14px] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                  placeholder="0912345678"
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white font-bold text-lg rounded-2xl px-4 py-4 mt-6 hover:bg-gray-900 active:scale-95 transition-transform flex justify-center items-center shadow-xl"
              >
                {loading ? <span className="animate-pulse">檢查資料中...</span> : '下一步'}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="register"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="w-full h-full bg-white flex flex-col absolute inset-0 z-50 overflow-y-auto"
          >
            <div className="flex items-center p-4 border-b border-gray-100 sticky top-0 bg-white shadow-sm z-10">
              <button 
                type="button"
                onClick={() => setIsNewUser(false)} 
                className="p-2 -ml-2 text-black flex items-center hover:bg-gray-100 rounded-xl"
              >
                <ChevronLeft size={24} />
                <span className="font-bold text-base text-black">上一頁</span>
              </button>
            </div>

            <div className="p-8">
              <h2 className="text-2xl font-black mb-1">歡迎新帳號註冊</h2>
              <p className="text-gray-500 mb-8 text-sm">請確認您的手機號碼，並輸入推薦人</p>

              <form onSubmit={handleRegister} className="space-y-6">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">本人手機號碼</label>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-gray-200 text-black text-lg rounded-[14px] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                    required
                  />
                  <p className="text-[10px] text-gray-400 mt-2 pl-1">若發現輸入錯誤，可直接在此修改，或點擊左上角上一頁。</p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">推薦人手機號碼 (選填)</label>
                  <input 
                    type="tel" 
                    value={refPhone}
                    onChange={(e) => setRefPhone(e.target.value)}
                    className="w-full bg-orange-50 border border-orange-200 text-orange-900 text-lg rounded-[14px] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                    placeholder="例如: 0911222333"
                  />
                  <p className="text-[10px] text-orange-600/70 mt-2 pl-1">綁定好後即可開始購物。</p>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white font-bold text-lg rounded-2xl px-4 py-4 hover:bg-gray-900 active:scale-95 transition-transform flex justify-center items-center shadow-xl"
                  >
                    {loading ? <span className="animate-pulse">系統登錄中...</span> : '綁定並開始購物'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
