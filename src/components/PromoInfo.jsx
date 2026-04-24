import React, { useMemo, useState } from 'react';
import { BadgePercent, ChevronDown, ChevronRight } from 'lucide-react';
import { getConfig } from '../lib/api';
import { parseConfigData } from '../lib/config';

export default function PromoInfo() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [configData, setConfigData] = useState(null);

  const config = useMemo(() => parseConfigData(configData), [configData]);

  const toggleOpen = async () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);

    if (!nextOpen || configData || loading) return;

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
    <div className="mb-2">
      <button
        onClick={toggleOpen}
        className="flex w-full items-center justify-between border-l-[3px] border-gray-300 bg-white px-3 py-3.5 text-left text-[12px] font-black text-gray-800 transition-all hover:bg-gray-50 dark:border-ios-separator dark:bg-ios-surface dark:text-white dark:hover:bg-ios-surface-2"
      >
        <span className="flex items-center gap-2">
          <BadgePercent size={14} />
          優惠資訊
        </span>
        {isOpen ? (
          <ChevronDown size={14} className="shrink-0 text-gray-400 dark:text-ios-secondary" />
        ) : (
          <ChevronRight size={14} className="shrink-0 text-gray-400 dark:text-ios-secondary" />
        )}
      </button>

      {isOpen ? (
        <div className="px-3 pb-3 pt-2 text-[12px] leading-6 text-gray-600 dark:text-ios-secondary">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="h-4 animate-pulse rounded bg-gray-200 dark:bg-ios-surface-2"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {config.promotions.map((content, index) => (
                <p key={`${index}-${content}`} className="whitespace-pre-wrap">
                  {content}
                </p>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
