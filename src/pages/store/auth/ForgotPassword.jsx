import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Sparkles, KeyRound, RotateCcw, ArrowRight, ArrowLeft, Loader2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import authService from '../../../services/authService';
import { OtpInputGroup } from '../../../components/common/OtpInputGroup';

const ForgotPassword = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const currentLang = i18n.language || 'en';
  const isRtl = currentLang === 'ar';

  const [step, setStep] = useState('email'); // 'email' | 'verify'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // مؤقت إعادة إرسال الرمز
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // التحقق من قوة كلمة المرور
  const passwordCriteria = {
    length: newPassword.length >= 8,
    upper: /[A-Z]/.test(newPassword),
    lower: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
  };
  const isStrongPassword = Object.values(passwordCriteria).every(Boolean);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !/\S+@\S+\.\S+/.test(cleanEmail)) {
      toast.error(t('forgot.errors.invalidEmail', 'Please enter a valid email address'));
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.sendForgotPasswordOtp(cleanEmail);
      toast.success(res?.message || t('forgot.success.otpSent', 'Reset code sent to your email'));
      setStep('verify');
      setResendTimer(60);
    } catch (err) {
      const errorMsg = err.response?.data?.message || t('forgot.errors.sendFailed', 'Failed to send reset code');
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || isResending) return;
    setIsResending(true);
    try {
      const res = await authService.sendForgotPasswordOtp(email.trim().toLowerCase());
      toast.success(res?.message || t('forgot.success.otpSent', 'Reset code resent to your email'));
      setResendTimer(60);
    } catch (err) {
      toast.error(err.response?.data?.message || t('forgot.errors.sendFailed', 'Failed to resend reset code'));
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyAndReset = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length !== 6) {
      toast.error(t('forgot.errors.invalidOtp', 'Please enter the full 6-digit code'));
      return;
    }

    if (!isStrongPassword) {
      toast.error(t('forgot.errors.weakPassword', 'Password must meet all security requirements'));
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t('forgot.errors.passwordMismatch', 'Passwords do not match'));
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        newPassword: newPassword,
      };

      const res = await authService.verifyForgotPasswordOtp(payload);
      toast.success(res?.message || t('forgot.success.passwordUpdated', 'Password reset successfully! Please sign in.'));
      navigate('/login', { replace: true });
    } catch (err) {
      const errorMsg = err.response?.data?.message || t('forgot.errors.resetFailed', 'Invalid code or failed to reset password');
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-[85vh] w-full flex flex-col justify-center items-center py-12 px-4 font-['Inter'] select-none transition-colors duration-300"
    >
      <div className="w-full max-w-5xl bg-white dark:bg-[#111A35] md:rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.5)] border border-[#E5E7EB] dark:border-white/10 overflow-hidden flex flex-col md:flex-row min-h-[640px] transition-colors duration-300">
        
        {/* الجانب البصري */}
        <div className="relative md:w-5/12 bg-[#0B132B] text-white p-8 md:p-12 flex flex-col justify-between overflow-hidden">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=85"
              alt="LUMA Interior"
              className="w-full h-full object-cover opacity-60 contrast-[1.1] brightness-[0.8]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B] via-[#0B132B]/50 to-transparent" />
          </div>

          <div className="relative z-10">
            <Link to="/" className="inline-block">
              <span className="text-3xl font-black tracking-[0.25em] font-['Poppins'] text-white drop-shadow-lg">
                {t('brand', 'LUMA')}
              </span>
            </Link>
            <div className="h-1 w-12 bg-[#E89A5B] mt-2 rounded-full shadow-lg"></div>
          </div>

          <div className="relative z-10 my-8 backdrop-blur-md bg-black/30 p-5 rounded-2xl border border-white/10 shadow-2xl">
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#E89A5B] uppercase block mb-2">
              {t('forgot.showcase.tagline', 'Account Recovery')}
            </span>
            <p className="text-xl sm:text-2xl font-light leading-snug font-['Poppins'] text-white/95">
              {t('forgot.showcase.quote', 'Restore your private access with encrypted credentials security.')}
            </p>
          </div>

          <div className="relative z-10 backdrop-blur-xl bg-white/10 border border-white/20 p-4 rounded-2xl flex items-center gap-3.5 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E89A5B] to-[#b86d30] text-white flex items-center justify-center font-bold text-base shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-white tracking-wide">
                {t('forgot.showcase.badgeTitle', 'Encrypted Reset')}
              </p>
              <p className="text-[11px] text-slate-300 font-light">
                {t('forgot.showcase.badgeDesc', 'Authenticated tokens for verified account owners.')}
              </p>
            </div>
          </div>
        </div>

        {/* الجانب الأيمن (النموذج) */}
        <div className="md:w-7/12 p-8 sm:p-12 lg:p-14 flex flex-col justify-center bg-white dark:bg-[#111A35] transition-colors duration-300">
          <div className="max-w-md w-full mx-auto">
            
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-black text-[#17233C] dark:text-white tracking-tight font-['Poppins']">
                {step === 'email' ? t('forgot.title', 'Forgot Password') : t('forgot.resetTitle', 'Set New Password')}
              </h2>
              <p className="text-xs sm:text-sm text-[#7B8190] dark:text-slate-400 mt-2 leading-relaxed font-light">
                {step === 'email' 
                  ? t('forgot.subtitle', 'Enter your registered email address to receive an OTP reset code.') 
                  : `${t('forgot.resetSubtitle', 'Enter the 6-digit code sent to')} ${email}`}
              </p>
            </div>

            {step === 'email' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1F2937] dark:text-slate-300 mb-2">
                    {t('forgot.emailLabel', 'Email Address')}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('forgot.emailPlaceholder', 'name@example.com')}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] dark:border-white/15 text-xs outline-none transition-all duration-300 bg-[#FAFAFA] dark:bg-white/5 text-[#1F2937] dark:text-white focus:border-[#17233C] dark:focus:border-[#E89A5B]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#17233C] hover:bg-[#223354] dark:bg-[#E89A5B] dark:hover:bg-[#d4894d] text-white dark:text-[#0B132B] py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 mt-4"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('forgot.submitting', 'Sending Code...')}</span>
                    </>
                  ) : (
                    <>
                      <span>{t('forgot.submitBtn', 'Send Reset Code')}</span>
                      {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyAndReset} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1F2937] dark:text-slate-300">
                      {t('forgot.otpLabel', 'Verification Code (OTP)')}
                    </label>
                    <KeyRound className="w-4 h-4 text-[#E89A5B]" />
                  </div>
                  
                  <OtpInputGroup 
                    length={6} 
                    value={otp} 
                    onChange={setOtp} 
                    isRtl={isRtl} 
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1F2937] dark:text-slate-300 mb-1.5">
                    {t('forgot.passwordLabel', 'New Password')}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={t('forgot.passwordPlaceholder', '••••••••')}
                      required
                      className={`w-full px-4 py-3 rounded-xl border border-[#E5E7EB] dark:border-white/15 text-xs outline-none transition-all duration-300 bg-[#FAFAFA] dark:bg-white/5 text-[#1F2937] dark:text-white ${
                        isRtl ? 'pl-11' : 'pr-11'
                      } focus:border-[#17233C] dark:focus:border-[#E89A5B]`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute top-1/2 -translate-y-1/2 ${
                        isRtl ? 'left-3' : 'right-3'
                      } text-slate-400 hover:text-[#17233C] dark:hover:text-white p-1 cursor-pointer transition-colors`}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* تفاصيل متطلبات كلمة المرور */}
                  {newPassword.length > 0 && (
                    <div className="grid grid-cols-2 gap-1 mt-2 text-[10px] text-slate-500 dark:text-slate-400">
                      <span className={`flex items-center gap-1 ${passwordCriteria.length ? 'text-emerald-500 font-bold' : ''}`}>
                        {passwordCriteria.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-rose-400" />}
                        {t('forgot.criteriaLength', '8+ Characters')}
                      </span>
                      <span className={`flex items-center gap-1 ${passwordCriteria.upper ? 'text-emerald-500 font-bold' : ''}`}>
                        {passwordCriteria.upper ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-rose-400" />}
                        {t('forgot.criteriaUpper', 'Uppercase letter')}
                      </span>
                      <span className={`flex items-center gap-1 ${passwordCriteria.lower ? 'text-emerald-500 font-bold' : ''}`}>
                        {passwordCriteria.lower ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-rose-400" />}
                        {t('forgot.criteriaLower', 'Lowercase letter')}
                      </span>
                      <span className={`flex items-center gap-1 ${passwordCriteria.number ? 'text-emerald-500 font-bold' : ''}`}>
                        {passwordCriteria.number ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-rose-400" />}
                        {t('forgot.criteriaNumber', 'Number')}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1F2937] dark:text-slate-300 mb-1.5">
                    {t('forgot.confirmPasswordLabel', 'Confirm New Password')}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t('forgot.passwordPlaceholder', '••••••••')}
                      required
                      className={`w-full px-4 py-3 rounded-xl border border-[#E5E7EB] dark:border-white/15 text-xs outline-none transition-all duration-300 bg-[#FAFAFA] dark:bg-white/5 text-[#1F2937] dark:text-white ${
                        isRtl ? 'pl-11' : 'pr-11'
                      } focus:border-[#17233C] dark:focus:border-[#E89A5B]`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={`absolute top-1/2 -translate-y-1/2 ${
                        isRtl ? 'left-3' : 'right-3'
                      } text-slate-400 hover:text-[#17233C] dark:hover:text-white p-1 cursor-pointer transition-colors`}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.length < 6 || !isStrongPassword}
                  className="w-full bg-[#17233C] hover:bg-[#223354] dark:bg-[#E89A5B] dark:hover:bg-[#d4894d] text-white dark:text-[#0B132B] py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 mt-4"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('forgot.submitting', 'Updating...')}</span>
                    </>
                  ) : (
                    <span>{t('forgot.resetBtn', 'Reset Password & Proceed')}</span>
                  )}
                </button>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleBackToEmail}
                    className="text-xs text-[#7B8190] dark:text-slate-400 hover:underline cursor-pointer"
                  >
                    ← {t('forgot.backAction', 'Change Email')}
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0 || isResending}
                    className="text-xs font-bold text-[#E89A5B] hover:underline disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
                    <span>
                      {resendTimer > 0 
                        ? `${t('forgot.resendIn', 'Resend in')} ${resendTimer}s` 
                        : t('forgot.resendNow', 'Resend OTP')}
                    </span>
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 text-center text-xs text-[#7B8190] dark:text-slate-400 font-light">
              {t('forgot.rememberPrompt', 'Remembered your credentials?')}{' '}
              <Link
                to="/login"
                className="text-[#17233C] dark:text-[#E89A5B] font-bold hover:underline transition-colors"
              >
                {t('forgot.signInAction', 'Sign In')}
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;