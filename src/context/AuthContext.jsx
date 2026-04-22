import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, updateProfile } from '../lib/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const phone = localStorage.getItem('userPhone');
    return phone ? { phone } : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedPhone = localStorage.getItem('userPhone');
    if (savedPhone) {
      // 在背景悄悄更新使用者最新資料，不卡住畫面
      loginUser(savedPhone).then(res => {
        if (res.status === 'success' && res.data) {
          setUser(res.data);
        }
      }).catch(console.error);
    }
  }, []);

  const login = async (phone) => {
    const res = await loginUser(phone);
    if (res.status === 'success') {
      if (res.data) {
        setUser(res.data);
        localStorage.setItem('userPhone', phone);
      }
      return res;
    }
    return res;
  };

  const register = async (data) => {
    const res = await updateProfile(data); // Calls GAS updateProfile
    if (res.status === 'success') {
      setUser({ phone: data.phone, refPhone: data.refPhone });
      localStorage.setItem('userPhone', data.phone);
    }
    return res;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userPhone');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
