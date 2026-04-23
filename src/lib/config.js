const DEFAULT_CONFIG = {
  shippingTitle: '滿千免運',
  shippingNotice: '單筆訂單滿 NT$1000 即享免運，未滿則酌收 NT$60 運費。',
  promoTitle: '推薦優惠',
  promoNotice: '新會員加入時填寫推薦人手機號碼，累積已出貨實收滿 NT$1000，推薦會員即可獲得 NT$200 購物金，供下次消費折抵。',
  bankCode: '13',
  bankAccount: '24506026551',
  jkoAccount: '906063778',
};

const normalizeValue = (value) => String(value ?? '').trim();

const getItemValue = (item, keys) => {
  if (!item) return '';
  for (const key of keys) {
    if (item[key] !== undefined && item[key] !== null) {
      const value = normalizeValue(item[key]);
      if (value) return value;
    }
  }
  return '';
};

export const parseConfigData = (data) => {
  const items = Array.isArray(data?.items) ? data.items : [];
  const map = data?.map || {};
  const firstRow = items[0] || null;
  const promoLines = items
    .map((item) => getItemValue(item, ['Promotions', 'promotions', 'title', 'name', 'value']))
    .filter(Boolean);

  const shippingTitle =
    normalizeValue(map.shipping_title || map.shippingTitle) ||
    promoLines[0] ||
    DEFAULT_CONFIG.shippingTitle;

  const promoNotice =
    normalizeValue(map.promo_notice || map.promoNotice || map.referral_notice || map.referralNotice) ||
    promoLines[1] ||
    DEFAULT_CONFIG.promoNotice;

  const shippingNotice =
    normalizeValue(map.shipping_notice || map.shippingNotice) ||
    DEFAULT_CONFIG.shippingNotice;

  return {
    shippingTitle,
    shippingNotice,
    promoTitle: normalizeValue(map.promo_title || map.promoTitle) || DEFAULT_CONFIG.promoTitle,
    promoNotice,
    bankCode:
      normalizeValue(map.bankcode || map.bankCode) ||
      getItemValue(firstRow, ['bankcode', 'bankCode']) ||
      DEFAULT_CONFIG.bankCode,
    bankAccount:
      normalizeValue(map['bank account'] || map.bankAccount) ||
      getItemValue(firstRow, ['bank account', 'bankAccount']) ||
      DEFAULT_CONFIG.bankAccount,
    jkoAccount:
      normalizeValue(map['街口 account'] || map.jkoAccount || map.jko_account) ||
      getItemValue(firstRow, ['街口 account', 'jkoAccount', 'jko account']) ||
      DEFAULT_CONFIG.jkoAccount,
  };
};

export const defaultConfig = DEFAULT_CONFIG;
