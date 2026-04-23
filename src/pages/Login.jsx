import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../lib/api';

const PHONE_HINT = '請以09開頭,一共十碼之號碼,請詳細檢查';

const sanitizePhoneInput = (value) => String(value || '').replace(/\D/g, '');
const isValidPhone = (value) => /^09\d{8}$/.test(value);

export default function Login() {
  const { login, register } = useAuth();
  const [phone, setPhone] = useState('');
  const [refPhone, setRefPhone] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [phoneHint, setPhoneHint] = useState('');
  const [refPhoneHint, setRefPhoneHint] = useState('');

  const handlePhoneChange = (value, setter, hintSetter) => {
    const nextValue = sanitizePhoneInput(value);
    hintSetter('');

    if (!nextValue) {
      setter('');
      return;
    }

    if (nextValue.length > 10 || (nextValue.length >= 2 && !nextValue.startsWith('09'))) {
      setter('');
      hintSetter(PHONE_HINT);
      return;
    }

    setter(nextValue);
  };

  const checkUser = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!isValidPhone(phone)) {
      setPhone('');
      setPhoneHint(PHONE_HINT);
      return;
    }

    setLoading(true);
    setRegisterError('');

    const res = await login(phone);
    if (res.status === 'success' && (!res.data || res.message === 'New user' || res.message === '新用戶')) {
      setIsNewUser(true);
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');

    if (!isValidPhone(phone)) {
      setPhone('');
      setPhoneHint(PHONE_HINT);
      return;
    }

    if (!isValidPhone(refPhone)) {
      setRefPhone('');
      setRefPhoneHint(PHONE_HINT);
      return;
    }

    if (phone === refPhone) {
      setRegisterError('推薦人手機號碼不可與本人相同。');
      return;
    }

    setLoading(true);

    const refRes = await loginUser(refPhone);
    const refExists =
      refRes.status === 'success' &&
      !!refRes.data &&
      refRes.message !== 'New user' &&
      refRes.message !== '新用戶';

    if (!refExists) {
      setLoading(false);
      setRegisterError('推薦人必須是已註冊會員，請確認手機號碼。');
      return;
    }

    await register({ phone, refPhone });
    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        {!isNewUser ? (
          <motion.div
            key="login"
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="mx-6 w-full max-w-sm rounded-[32px] bg-white p-8 shadow-2xl dark:bg-ios-surface"
          >
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-black uppercase tracking-tighter text-black dark:text-white">VOLT</h1>
            </div>

            <form onSubmit={checkUser} noValidate className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400">登入手機號碼</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value, setPhone, setPhoneHint)}
                  className="w-full rounded-[14px] border border-gray-200 bg-gray-50 px-4 py-3 text-lg text-black transition-all focus:outline-none focus:ring-2 focus:ring-black dark:border-ios-separator dark:bg-ios-surface-2 dark:text-white dark:focus:ring-white"
                  placeholder="0912345678"
                  maxLength={10}
                />
                <p className="mt-2 pl-1 text-[10px] text-gray-400">{phoneHint || '\u00A0'}</p>
                {loginError ? <p className="mt-1 text-sm font-medium text-red-500">{loginError}</p> : null}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 flex w-full items-center justify-center rounded-2xl bg-black px-4 py-4 text-lg font-bold text-white shadow-xl transition-transform hover:bg-gray-900 active:scale-95 disabled:cursor-wait dark:bg-white dark:text-black dark:hover:bg-ios-secondary"
              >
                {loading ? <span className="animate-pulse">檢查資料中...</span> : '下一步'}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="register"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="absolute inset-0 z-50 flex h-full w-full flex-col overflow-y-auto bg-white dark:bg-ios-bg"
          >
            <div className="sticky top-0 z-10 flex items-center border-b border-gray-100 bg-white p-4 shadow-sm dark:border-ios-separator dark:bg-ios-bg">
              <button
                type="button"
                onClick={() => {
                  setIsNewUser(false);
                  setRegisterError('');
                  setPhoneHint('');
                  setRefPhoneHint('');
                }}
                className="ml-[-0.5rem] flex items-center rounded-xl p-2 text-black hover:bg-gray-100 dark:text-white dark:hover:bg-ios-surface"
              >
                <ChevronLeft size={24} />
                <span className="text-base font-bold text-black dark:text-white">上一頁</span>
              </button>
            </div>

            <div className="p-8">
              <h2 className="mb-1 text-2xl font-black text-black dark:text-white">歡迎新帳號註冊</h2>
              <p className="mb-8 text-sm text-gray-500">請確認您的手機號碼，並輸入已註冊會員的推薦人手機號碼</p>

              <form onSubmit={handleRegister} noValidate className="space-y-6">
                <div>
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-gray-400">本人手機號碼</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value, setPhone, setPhoneHint)}
                    className="w-full rounded-[14px] border border-gray-200 bg-white px-4 py-3 text-lg text-black transition-all focus:outline-none focus:ring-2 focus:ring-black dark:border-ios-separator dark:bg-ios-surface dark:text-white dark:focus:ring-white"
                    maxLength={10}
                  />
                  <p className="mt-2 pl-1 text-[10px] text-gray-400">{phoneHint || '若發現輸入錯誤，可直接在此修改，或點擊左上角上一頁。'}</p>
                </div>

                <div>
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-gray-400">推薦人手機號碼 (必填)</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    value={refPhone}
                    onChange={(e) => handlePhoneChange(e.target.value, setRefPhone, setRefPhoneHint)}
                    className="w-full rounded-[14px] border border-orange-200 bg-orange-50 px-4 py-3 text-lg font-medium text-orange-900 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-100"
                    placeholder="例如: 0911222333"
                    maxLength={10}
                  />
                  <p className="mt-2 pl-1 text-[10px] text-gray-400">{refPhoneHint || '推薦人必須是已註冊會員，綁定後即可開始購物。'}</p>
                </div>

                {registerError ? (
                  <p className="text-sm font-medium text-red-500">{registerError}</p>
                ) : null}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center rounded-2xl bg-black px-4 py-4 text-lg font-bold text-white shadow-xl transition-transform hover:bg-gray-900 active:scale-95 disabled:cursor-wait dark:bg-white dark:text-black dark:hover:bg-ios-secondary"
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
