const normalizeProductPart = (value) =>
  String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase();

const toFnv1aHex = (value) => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).toUpperCase().padStart(8, '0');
};

export const buildProductIdentitySource = (product) =>
  [
    normalizeProductPart(product.mainCategory),
    normalizeProductPart(product.subCategory),
    normalizeProductPart(product.name),
  ].join('|');

export const deriveProductId = (product) => toFnv1aHex(buildProductIdentitySource(product));

export const normalizeProductRecord = (product) => {
  const normalized = {};
  Object.keys(product || {}).forEach((key) => {
    normalized[String(key).trim()] = product[key];
  });

  const rawId = String(normalized.id || '').trim();
  return {
    ...normalized,
    id: rawId || deriveProductId(normalized),
  };
};

export const shouldShowProduct = (product) => {
  const stock = Number(product.stock) || 0;
  const displayMode = String(product.displaymode || '').trim().toLowerCase();

  if (displayMode === 'show_sold_out') return true;
  return stock > 0;
};
