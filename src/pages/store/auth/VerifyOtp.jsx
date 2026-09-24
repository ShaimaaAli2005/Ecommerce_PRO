import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, ArrowRight, ArrowLeft, Loader2, RotateCcw } from 'lucide-react';
import { OtpInputGroup } from '../../../components/common/OtpInputGroup';
import authService from '../../../services/authService';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

export const VerifyOtp = () => {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || 'ar').startsWith('ar');
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser } = useAuth();

  // استقبال البيانات الممررة من صفحة التسجيل أو استعادة كلمة المرور
  const email = location.state?.email || '';
  const purpose = location.state?.purpose || 'register'; // 'register' | 'forgot-password'
  const newPassword = location.state?.newPassword || '';

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const timerRef = useRef(null);

  useEffect(() => {
    if (!email) {
      toast.error(isRtl ? 'يرجى إدخال البريد الإلكتروني أولاً' : 'Please provide an email address');
      navigate(purpose === 'forgot-password' ? '/forgot-password' : '/register', { replace: true });
      return;
    }

    timerRef.current = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [email, navigate, purpose, isRtl]);

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (otp.length < 6) {
      toast.error(isRtl ? 'يرجى إدخال رموز التحقق الستة كاملة' : 'Please enter the full 6-digit verification code');
      return;
    }

    setIsLoading(true);
    try {
      if (purpose === 'forgot-password') {
        const res = await authService.verifyForgotPasswordOtp({
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
          newPassword
        });

        toast.success(res?.message || (isRtl ? 'تم تحديث كلمة المرور بنجاح!' : 'Password reset successfully!'));
        navigate('/login', { replace: true });
      } else {
        const res = await authService.verifyRegisterOtp({ 
          email: email.trim().toLowerCase(), 
          otp: otp.trim() 
        });

        toast.success(res?.message || (isRtl ? 'تم تفعيل الحساب بنجاح!' : 'Account verified successfully!'));

        // تسجيل الدخول التلقائي إذا أرجع السيرفر التوكن
        if (res?.token || res?.user) {
          loginUser(res);
          navigate('/', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || (isRtl ? 'رمز التحقق غير صحيح أو انتهت صلاحيته' : 'Invalid or expired code');
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0 || isResending) return;

    setIsResending(true);
    try {
      if (purpose === 'forgot-password') {
        await authService.sendForgotPasswordOtp(email.trim().toLowerCase());
      } else {
        // في التسجيل نمرر البريد أو بيانات التسجيل المخزنة
        await authService.sendRegisterOtp({ 
          email: email.trim().toLowerCase(),
          username: location.state?.username || 'User',
          password: location.state?.password || 'TempPassword123',
          phone: location.state?.phone || ''
        });
      }

      toast.success(isRtl ? 'تم إرسال رمز جديد إلى بريدك' : 'New code sent to your email');
      setCountdown(60);
    } catch (err) {
      toast.error(err.response?.data?.message || (isRtl ? 'تعذر إعادة إرسال الرمز' : 'Failed to resend code'));
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
            {isRtl ? 'التحقق الأمني' : 'Security Verification'}
          </h2>
          <p className="text-xs text-[#7B8190] dark:text-slate-400 leading-relaxed font-light">
            {isRtl ? 'أدخل رمز التحقق المكون من 6 أرقام المرسل إلى:' : 'Enter the 6-digit code sent to:'}
            <span className="block font-bold text-[#17233C] dark:text-white mt-1 font-mono text-sm">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerifySubmit} className="space-y-6">
          {/* حقول إدخال OTP الموزعة */}
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

        <div className="flex flex-col items-center gap-3 text-center text-xs text-[#7B8190] dark:text-slate-400">
          <button
            type="button"
            onClick={handleResendCode}
            disabled={countdown > 0 || isResending}
            className="font-bold text-[#E89A5B] hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
            <span>
              {countdown > 0
                ? (isRtl ? `إعادة الإرسال خلال ${countdown} ثانية` : `Resend code in ${countdown}s`)
                : (isRtl ? 'إعادة إرسال الرمز الآن' : 'Resend Code Now')}
            </span>
          </button>

          <Link
            to={purpose === 'forgot-password' ? '/forgot-password' : '/register'}
            className="text-[11px] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            ← {isRtl ? 'تعديل البريد الإلكتروني' : 'Edit Email Address'}
          </Link>
        </div>

      </div>
    </div>
  );
};

export default VerifyOtp;