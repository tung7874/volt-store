const API_URL = 'https://script.google.com/macros/s/AKfycbxn4-Sf92Y-mvhPsZ4PWCJeTdRF4vuvr8E02rzMq6jkSdH9_ySyqShY0MLfgGAQCuYH1Q/exec';

export const loginUser = async (phone) => {
  const res = await fetch(`${API_URL}?action=login&phone=${phone}`);
  const json = await res.json();
  return json;
};

export const getProducts = async () => {
  const res = await fetch(`${API_URL}?action=getProducts`);
  const json = await res.json();
  return json;
};

export const getOrders = async (phone) => {
  try {
    const fixedPhone = phone.startsWith("'") ? phone : "'" + phone;
    const res = await fetch(`${API_URL}?action=getOrders&phone=${encodeURIComponent(fixedPhone)}`);
    const json = await res.json();
    return json;
  } catch (e) {
    return { status: 'error', data: [] };
  }
};

export const updateProfile = async (data) => {
  const payload = { action: 'updateProfile', ...data };
  if (payload.phone) payload.phone = "'" + payload.phone;
  if (payload.refPhone) payload.refPhone = "'" + payload.refPhone;

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

export const createOrder = async (phone, items, totalPrice) => {
  const fixedPhone = "'" + phone;
  try {
    await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'createOrder', phone: fixedPhone, items, totalPrice })
    });
    return { status: 'success' };
  } catch (e) {
    return { status: 'success' };
  }
};
