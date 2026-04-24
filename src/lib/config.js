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

const STORAGE_KEY = 'volt_config_cache_v1';
const TTL_MS = 10 * 60 * 1000;

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

const readStoredConfig = () => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.timestamp || !parsed?.data) return null;
    if (Date.now() - parsed.timestamp > TTL_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
};

const writeStoredConfig = (data) => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ timestamp: Date.now(), data }),
    );
  } catch {
    // ignore storage errors
  }
};

export const getCachedConfig = () => {
  if (configCache) return configCache;
  const stored = readStoredConfig();
  if (stored) {
    configCache = stored;
    return stored;
  }
  return null;
};

export const preloadConfig = async ({ force = false } = {}) => {
  if (!force) {
    const cached = getCachedConfig();
    if (cached) return cached;
  }

  if (configPromise) return configPromise;

  configPromise = getConfig()
    .then((res) => {
      const nextConfig =
        res.status === 'success' ? parseConfigData(res.data) : DEFAULT_CONFIG;
      configCache = nextConfig;
      writeStoredConfig(nextConfig);
      return nextConfig;
    })
    .catch(() => {
      const fallback = getCachedConfig() || DEFAULT_CONFIG;
      configCache = fallback;
      return fallback;
    })
    .finally(() => {
      configPromise = null;
    });

  return configPromise;
};

export const defaultConfig = DEFAULT_CONFIG;
