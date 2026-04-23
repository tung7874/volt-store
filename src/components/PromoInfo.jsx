import React, { useMemo, useState } from 'react';
import { BadgePercent, Gift, Truck, X } from 'lucide-react';
import { getConfig } from '../lib/api';
import { parseConfigData } from '../lib/config';

const toneClasses = {
  shipping:
    'border-green-200 bg-green-50 text-green-700 dark:border-green-900/40 dark:bg-green-950/20 dark:text-green-300',
  promo:
    'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/40 dark:bg-orange-950/20 dark:text-orange-300',
};

const cardsFromConfig = (config) => [
  {
    title: config.shippingTitle,
    content: config.shippingNotice,
    tone: 'shipping',
    Icon: Truck,
  },
  {
    title: config.promoTitle,
    content: config.promoNotice,
    tone: 'promo',
    Icon: Gift,
  },
];

export default function PromoInfo() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [configData, setConfigData] = useState(null);

  const config = useMemo(() => parseConfigData(configData), [configData]);
  const cards = useMemo(() => cardsFromConfig(config), [config]);

  const openModal = async () => {
    setIsOpen(true);
    if (configData || loading) return;

    setLoading(true);
    const res = await getConfig();
    if (res.status === 'success' && res.data) {
      setConfigData(res.data);
    } else {
      setConfigData({ items: [], map: {} });
    }
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={openModal}
        className="mb-2 flex w-full flex-col justify-center gap-1 border-l-[3px] border-orange-500 bg-orange-50 py-3.5 pl-3 pr-2 text-left text-[12px] font-black text-orange-600 transition-all hover:bg-orange-100 dark:bg-orange-950/40 dark:text-orange-300 dark:hover:bg-orange-950/60"
      >
        <span className="flex items-center gap-1">
          <BadgePercent size={14} />
          優惠資訊
        </span>
        <span className="text-[10px] font-bold leading-tight text-orange-400">
          滿千免運 / 推薦優惠
        </span>
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center sm:p-0">
          <div className="w-full max-w-sm overflow-hidden rounded-[32px] bg-white shadow-2xl duration-300 animate-in slide-in-from-bottom-10 dark:bg-ios-surface sm:zoom-in">
            <div className="relative p-6">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100/80 text-gray-500 transition-colors hover:bg-gray-200 dark:bg-ios-surface-2 dark:text-ios-secondary dark:hover:bg-ios-surface-2"
              >
                <X size={18} />
              </button>

              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-white shadow-xl">
                <BadgePercent size={28} />
              </div>
              <h2 className="mb-6 text-center text-[19px] font-black leading-tight text-gray-900 dark:text-white">
                優惠資訊
              </h2>

              <div className="max-h-[50vh] space-y-4 overflow-y-auto pb-2">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2].map((index) => (
                      <div
                        key={index}
                        className="h-24 animate-pulse rounded-2xl bg-gray-100 dark:bg-ios-bg"
                      />
                    ))}
                  </div>
                ) : (
                  cards.map(({ title, content, tone, Icon }) => (
                    <div
                      key={`${title}-${content}`}
                      className={`rounded-2xl border p-4 shadow-sm ${toneClasses[tone]}`}
                    >
                      <div className="mb-2 flex items-center gap-2 text-sm font-black">
                        <Icon size={16} />
                        <span>{title}</span>
                      </div>
                      <p className="text-[13px] font-medium leading-6">{content}</p>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="sticky bottom-0 mt-6 w-full rounded-2xl bg-black py-4 text-[15px] font-bold text-white shadow-lg transition-all hover:bg-gray-900 active:scale-95"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
