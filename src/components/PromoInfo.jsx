import React, { useMemo, useState } from 'react';
import { BadgePercent, ChevronRight, X } from 'lucide-react';
import { defaultConfig, getCachedConfig, preloadConfig } from '../lib/config';

export default function PromoInfo() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [configData, setConfigData] = useState(() => getCachedConfig() || defaultConfig);

  const config = useMemo(() => configData || defaultConfig, [configData]);

  const openModal = async () => {
    setIsOpen(true);
    if (configData || loading) return;

    setLoading(true);
    const nextConfig = await preloadConfig();
    setConfigData(nextConfig);
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={openModal}
        className="mb-2 flex w-full items-center justify-between border-l-[3px] border-gray-300 bg-white px-3 py-3.5 text-left text-[12px] font-black text-gray-800 transition-all hover:bg-gray-50 dark:border-ios-separator dark:bg-ios-surface dark:text-white dark:hover:bg-ios-surface-2"
      >
        <span className="flex items-center gap-2">
          <BadgePercent size={14} />
          優惠資訊
        </span>
        <ChevronRight size={14} className="shrink-0 text-gray-400 dark:text-ios-secondary" />
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center sm:p-0">
          <div className="w-full max-w-sm overflow-hidden rounded-[32px] bg-white shadow-2xl animate-in slide-in-from-bottom-10 dark:bg-ios-bg sm:zoom-in">
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

              <div className="max-h-[50vh] overflow-y-auto pb-2 text-[14px] leading-7 text-gray-900 dark:text-white">
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((index) => (
                      <div key={index} className="h-4 animate-pulse rounded bg-gray-200 dark:bg-ios-surface-2" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {config.promotions.map((content, index) => (
                      <p key={`${index}-${content}`} className="whitespace-pre-wrap font-medium">
                        {content}
                      </p>
                    ))}
                  </div>
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
