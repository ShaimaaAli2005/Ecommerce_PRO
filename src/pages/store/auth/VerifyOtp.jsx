import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { OtpInputGroup } from '../../../components/common/OtpInputGroup';
import authService from '../../../services/authService';
import toast from 'react-hot-toast';

export const VerifyOtp = () => {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || 'ar').startsWith('ar');
  const navigate = useNavigate();
  const location = useLocation();

  // استقبال البريد الإلكتروني الممرر من صفحة التسجيل أو نسيت كلمة المرور
  const email = location.state?.email || '';

  const [otp, setOtp] = useState('');
  <OtpInputGroup length={6} value={otp} onChange={setOtp} isRtl={isRtl} />
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const timerRef = useRef(null);

  useEffect(() => {
    if (!email) {
      navigate('/login');
      return;
    }

    // تشغيل مؤقت إعادة الإرسال
    timerRef.current = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [email, navigate]);

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (otp.length < 6) {
      toast.error(isRtl ? 'يرجى إدخال رموز التحقق الستة كاملاً' : 'Please enter the 6-digit verification code');
      return;
    }

    setIsLoading(true);
    try {
      // استدعاء خدمة التحقق من الـ OTP (تعدل بحسب اسم الدالة لديك مثل verifyRegisterOtp أو verifyForgotPasswordOtp)
      await authService.verifyRegisterOtp({ email, otp });
      
      toast.success(isRtl ? 'تم التحقق بنجاح!' : 'Verified successfully!');
      navigate('/login', { replace: true });
    } catch (err) {
      const errorMsg = err.response?.data?.message || (isRtl ? 'رمز التحقق غير صحيح أو انتهت صلاحيته' : 'Invalid or expired code');
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;

    setIsResending(true);
    try {
      await authService.sendRegisterOtp({ email });
      toast.success(isRtl ? 'تم إرسال رمز جديد إلى بريدك' : 'New code sent to your email');
      setCountdown(60);
    } catch (err) {
      toast.error(isRtl ? 'تعذر إعادة إرسال الرمز' : 'Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-[85vh] w-full flex flex-col justify-center items-center py-12 px-4 font-['Inter'] select-none transition-colors duration-300"
    >
      <div className="w-full max-w-md bg-white dark:bg-[#111A35] rounded-3xl shadow-xl border border-[#E5E7EB] dark:border-white/10 p-8 sm:p-10 space-y-8">
        
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#E89A5B] to-[#b86d30] text-white flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-[#17233C] dark:text-white font-['Poppins']">
            {isRtl ? 'التحقق من الحساب' : 'Security Verification'}
          </h2>
          <p className="text-xs text-[#7B8190] dark:text-slate-400 leading-relaxed">
            {isRtl ? 'أدخل رمز التحقق المكون من 6 أرقام المرسل إلى بريدك:' : 'Enter the 6-digit code sent to your email:'}
            <span className="block font-bold text-[#17233C] dark:text-white mt-1">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerifySubmit} className="space-y-6">
          {/* استخدام مكون OtpInputGroup الذي أنشأناه للتو */}
          <OtpInputGroup length={6} value={otp} onChange={setOtp} isRtl={isRtl} />

          <button
            type="submit"
            disabled={isLoading || otp.length < 6}
            className="w-full bg-[#17233C] hover:bg-[#223354] dark:bg-[#E89A5B] dark:hover:bg-[#d4894d] text-white dark:text-[#0B132B] py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4" />
                <span>{isRtl ? 'جاري التحقق...' : 'Verifying...'}</span>
              </>
            ) : (
              <>
                <span>{isRtl ? 'تأكيد الرمز' : 'Verify Code'}</span>
                {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-[#7B8190] dark:text-slate-400 space-y-2">
          <p>{isRtl ? 'لم تستلم الرمز؟' : "Didn't receive code?"}</p>
          <button
            type="button"
            onClick={handleResendCode}
            disabled={countdown > 0 || isResending}
            className="font-bold text-[#17233C] dark:text-[#E89A5B] hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
          >
            {countdown > 0
              ? (isRtl ? `إعادة الإرسال خلال ${countdown} ثانية` : `Resend code in ${countdown}s`)
              : (isRtl ? 'إعادة إرسال الرمز الآن' : 'Resend Code Now')}
          </button>
        </div>

      </div>
    </div>
  );
};

export default VerifyOtp;