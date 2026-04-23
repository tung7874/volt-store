import React, { useState } from 'react';
import { Download, X, Share, PlusSquare, MoreVertical, Smartphone, ChevronRight } from 'lucide-react';

export default function InstallPrompt({ variant = 'banner' }) {
  const [isOpen, setIsOpen] = useState(false);

  // Render trigger button based on variant
  const trigger = variant === 'banner' ? (
    <button onClick={() => setIsOpen(true)} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-4 flex items-center justify-between shadow-lg active:scale-95 transition-all mb-4">
      <div className="flex items-center gap-3">
        <div className="bg-white/20 p-2.5 rounded-xl"><Download size={24} /></div>
        <div className="text-left">
          <h3 className="font-black text-sm">安裝V-CLUB APP 蘋果版 跟 安卓版的</h3>
          <p className="text-white/80 text-[11px] mt-1 font-medium">點此看安裝教學，享受專屬體驗</p>
        </div>
      </div>
    </button>
  ) : (
    <button
      onClick={() => setIsOpen(true)}
      className="mb-2 flex w-full items-center justify-between border-l-[3px] border-gray-300 bg-white px-3 py-3.5 text-left text-[12px] font-black text-gray-800 transition-all hover:bg-gray-50 dark:border-ios-separator dark:bg-ios-surface dark:text-white dark:hover:bg-ios-surface-2"
    >
      <span className="flex items-center gap-2">
        <Download size={14} />
        安裝APP
      </span>
      <ChevronRight size={14} className="shrink-0 text-gray-400 dark:text-ios-secondary" />
    </button>
  );

  return (
    <>
      {trigger}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-0">
          <div className="bg-white dark:bg-ios-surface rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in duration-300">
            <div className="p-6 relative">
              <button onClick={() => setIsOpen(false)} className="absolute right-5 top-5 w-8 h-8 bg-gray-100/80 dark:bg-ios-surface-2 hover:bg-gray-200 dark:hover:bg-ios-surface-2 rounded-full flex items-center justify-center text-gray-500 dark:text-ios-secondary transition-colors">
                <X size={18} />
              </button>
              
              <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                <span className="font-black text-2xl tracking-tighter">VOLT</span>
              </div>
              <h2 className="text-[19px] font-black text-center mb-6 leading-tight text-gray-900 dark:text-white">
                安裝V-CLUB APP<br/>蘋果版 跟 安卓版的
              </h2>
              
              <div className="space-y-4 max-h-[50vh] overflow-y-auto no-scrollbar pb-2">
                {/* iOS */}
                <div className="bg-gray-50 dark:bg-ios-bg p-4.5 rounded-2xl border border-gray-100 dark:border-ios-separator shadow-sm">
                  <h3 className="font-black flex items-center gap-2 mb-3 text-black dark:text-white text-sm"><Smartphone size={16}/> 蘋果 iPhone 教學</h3>
                  <div className="text-[13px] text-gray-600 dark:text-ios-secondary space-y-3 font-semibold">
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400 font-bold">1.</span>
                      <span>點擊 Safari 畫面正下方的 <span className="p-1 bg-white dark:bg-ios-surface rounded shadow-sm inline-flex border border-gray-100 dark:border-ios-separator align-text-bottom"><Share size={12}/></span> (分享按鈕)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400 font-bold">2.</span>
                      <span>選單往下捲動，點擊 <span className="p-1 bg-white dark:bg-ios-surface rounded shadow-sm inline-flex border border-gray-100 dark:border-ios-separator align-text-bottom"><PlusSquare size={12}/></span> 加入主畫面</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400 font-bold">3.</span>
                      <span>點擊右上角的「新增」即可完成！</span>
                    </div>
                  </div>
                </div>

                {/* Android */}
                <div className="bg-gray-50 dark:bg-ios-bg p-4.5 rounded-2xl border border-gray-100 dark:border-ios-separator shadow-sm">
                  <h3 className="font-black flex items-center gap-2 mb-3 text-black dark:text-white text-sm"><Smartphone size={16}/> 安卓 Android 教學</h3>
                  <div className="text-[13px] text-gray-600 dark:text-ios-secondary space-y-3 font-semibold">
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400 font-bold">1.</span>
                      <span>點擊 Chrome 右上角的 <span className="p-1 bg-white dark:bg-ios-surface rounded shadow-sm inline-flex border border-gray-100 dark:border-ios-separator align-text-bottom"><MoreVertical size={12}/></span> (三個點)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400 font-bold">2.</span>
                      <span>選單中選擇「加到主畫面」或「安裝應用程式」</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400 font-bold">3.</span>
                      <span>點擊「新增」即可完成！</span>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsOpen(false)} 
                className="w-full bg-black hover:bg-gray-900 text-white font-bold py-4 rounded-2xl mt-6 active:scale-95 transition-all text-[15px] shadow-lg sticky bottom-0"
              >
                我知道了，馬上去安裝！
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

