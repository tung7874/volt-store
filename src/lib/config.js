import { getConfig } from './api';

const DEFAULT_CONFIG = {
  promotions: [
    '滿千免運',
    '凡推薦好友，新會員加入填寫推薦手機號碼，新會員購買滿千，該推薦會員即可獲得兩百元購物金額折抵，供下次使用。',
  ],
  bankCode: '13',
  bankAccount: '24506026551',
  jkoAccount: '906063778',
};

let configCache = null;
let configPromise = null;

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

  const promotions = items
    .map((item) => getItemValue(item, ['Promotions', 'promotions', 'title', 'name', 'value']))
    .filter(Boolean);

  return {
    promotions: promotions.length > 0 ? promotions : DEFAULT_CONFIG.promotions,
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

export const getCachedConfig = () => configCache;

export const preloadConfig = async () => {
  if (configCache) return configCache;
  if (configPromise) return configPromise;

  configPromise = getConfig()
    .then((res) => {
      configCache = res.status === 'success' ? parseConfigData(res.data) : DEFAULT_CONFIG;
      return configCache;
    })
    .catch(() => {
      configCache = DEFAULT_CONFIG;
      return configCache;
    })
    .finally(() => {
      configPromise = null;
    });

  return configPromise;
};

export const defaultConfig = DEFAULT_CONFIG;
