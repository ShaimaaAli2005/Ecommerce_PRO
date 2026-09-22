import React, { useRef, useEffect } from 'react';

export const OtpInputGroup = ({ length = 6, value = '', onChange, isRtl = false }) => {
  const inputRefs = useRef([]);

  // تحويل القيمة النصية إلى مصفوفة خانات
  const digits = value.split('').slice(0, length);
  while (digits.length < length) {
    digits.push('');
  }

  const handleChange = (e, index) => {
    const val = e.target.value;
    // السماح بأرقام فقط
    if (val && !/^\d+$/.test(val)) return;

    const newDigits = [...digits];
    // أخذ آخر حرف مدخل في حال كتب أكثر من حرف
    newDigits[index] = val.slice(-1);
    
    const combined = newDigits.join('');
    onChange(combined);

    // الانتقال التلقائي للخنة التالية
    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // إذا كانت الخنة فارغة وتم الضغط على مسح، نرجع للخنة السابقة ونمسحها
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
        inputRefs.current[index - 1]?.focus();
      } else if (digits[index]) {
        // مسح الخنة الحالية
        const newDigits = [...digits];
        newDigits[index] = '';
        onChange(newDigits.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d+$/.test(pasteData)) {
      const pastedDigits = pasteData.slice(0, length);
      onChange(pastedDigits);
      const nextIndex = Math.min(pastedDigits.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3" dir={isRtl ? 'rtl' : 'ltr'}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className="w-11 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold font-mono rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-slate-900/60 text-[#0B132B] dark:text-white focus:border-[#E89A5B] focus:ring-2 focus:ring-[#E89A5B]/20 outline-none transition-all shadow-xs"
        />
      ))}
    </div>
  );
};

export default OtpInputGroup;