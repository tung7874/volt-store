const API_URL = 'https://script.google.com/macros/s/AKfycbyqPjdxFxyuHqka9ZEKqQG_B1NJVP0h_IkqYahoA9KKYOMgBkxw08BjLEc4iEtoknVAgQ/exec';

const normalizePhone = (phone) => String(phone || '').replace(/\D/g, '').slice(0, 10);

const requestJson = async (url) => {
  try {
    const res = await fetch(url);
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return {
        status: 'error',
        message: 'API did not return JSON. Check the Google Apps Script web app access/deployment.'
      };
    }
  } catch {
    return { status: 'error', message: 'Network request failed' };
  }
};

export const loginUser = async (phone) => {
  return requestJson(`${API_URL}?action=login&phone=${encodeURIComponent(normalizePhone(phone))}`);
};

export const getProducts = async () => {
  return requestJson(`${API_URL}?action=getProducts`);
};

export const getConfig = async () => {
  return requestJson(`${API_URL}?action=getConfig`);
};

export const getOrders = async (phone) => {
  try {
    const normalizedPhone = normalizePhone(phone);
    const fixedPhone = normalizedPhone.startsWith("'") ? normalizedPhone : "'" + normalizedPhone;
    return requestJson(`${API_URL}?action=getOrders&phone=${encodeURIComponent(fixedPhone)}`);
  } catch (e) {
    return { status: 'error', data: [] };
  }
};

export const updateProfile = async (data) => {
  const payload = { action: 'updateProfile', ...data };
  if (payload.phone) payload.phone = "'" + normalizePhone(payload.phone);
  if (payload.refPhone) payload.refPhone = "'" + normalizePhone(payload.refPhone);

  try {
    await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    return { status: 'success' };
  } catch (e) {
    return { status: 'success' }; // Fallback for network issues
  }
};

export const createOrder = async (phone, items, totalPrice, name, storeId, creditUsed = 0, orderItems = []) => {
  const fixedPhone = "'" + normalizePhone(phone);
  try {
    await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'createOrder', phone: fixedPhone, items, totalPrice, name, storeId, creditUsed, orderItems })
    });
    return { status: 'success' };
  } catch (e) {
    return { status: 'success' };
  }
};
