import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Zap } from 'lucide-react';

export default function FlashSaleBanner() {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || 'ar').startsWith('ar');

  // حساب وقت انتهاء افتراضي (12 ساعة من الآن) لحساب فارق زمني دقيق لا يتأثر بالخلفية
  const [targetTime] = useState(() => Date.now() + (11 * 3600 + 45 * 60 + 30) * 1000);

  const calculateTimeLeft = () => {
    const diff = Math.max(0, targetTime - Date.now());
    return {
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      isFinished: diff <= 0,
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining.isFinished) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetTime]);

  return (
    <div 
      className="w-full bg-gradient-to-r from-[#17233C] via-[#1E2E4F] to-[#17233C] text-white py-3.5 px-5 rounded-2xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-700/60 font-['Poppins']" 
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center gap-3.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E89A5B] text-[#0B132B] shadow-md shrink-0">
          <Zap className="w-4 h-4 fill-current" />
        </span>
        <div>
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider block text-white">
            {t('store.flash_sale.title', 'Weekend Flash Deals!')}
          </span>
          <span className="text-[11px] text-slate-300 font-medium">
            {t('store.flash_sale.subtitle', 'Up to 40% discount on selected audio & tech gadgets.')}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0" dir="ltr">
        <div className="flex flex-col items-center bg-black/40 px-2.5 py-1.5 rounded-xl min-w-[42px] border border-white/5">
          <span className="text-xs font-black text-[#E89A5B] font-mono">
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
          <span className="text-[9px] text-slate-400 font-bold">{t('store.flash_sale.hours', 'HRS')}</span>
        </div>
        <span className="font-black text-slate-400">:</span>
        <div className="flex flex-col items-center bg-black/40 px-2.5 py-1.5 rounded-xl min-w-[42px] border border-white/5">
          <span className="text-xs font-black text-[#E89A5B] font-mono">
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span className="text-[9px] text-slate-400 font-bold">{t('store.flash_sale.mins', 'MIN')}</span>
        </div>
        <span className="font-black text-slate-400">:</span>
        <div className="flex flex-col items-center bg-black/40 px-2.5 py-1.5 rounded-xl min-w-[42px] border border-white/5">
          <span className="text-xs font-black text-[#E89A5B] font-mono">
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className="text-[9px] text-slate-400 font-bold">{t('store.flash_sale.secs', 'SEC')}</span>
        </div>
      </div>
    </div>
  );
}