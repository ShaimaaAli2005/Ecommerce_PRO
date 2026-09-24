import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Sparkles, KeyRound, RotateCcw, Loader2, Check, X, ArrowRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import authService from '../../../services/authService';
import { useAuth } from '../../../context/AuthContext';
import { OtpInputGroup } from '../../../components/common/OtpInputGroup';

const Register = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const currentLang = i18n.language || 'en';
  const isRtl = currentLang === 'ar';

  const [step, setStep] = useState('form');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    otp: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // إدارة مؤقت إعادة إرسال OTP
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // معايير قوة كلمة المرور
  const passwordCriteria = {
    length: formData.password.length >= 8,
    upper: /[A-Z]/.test(formData.password),
    lower: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
  };
  const isStrongPassword = Object.values(passwordCriteria).every(Boolean);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();

    if (!formData.username.trim() || !formData.email.trim() || !formData.password || !formData.phone.trim()) {
      toast.error(t('register.errors.allFieldsRequired', 'All fields are required'));
      return;
    }

    if (!isStrongPassword) {
      toast.error(t('register.errors.passwordWeak', 'Password must be at least 8 characters with upper, lower, and numbers'));
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.sendRegisterOtp({
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim(),
      });

      if (res?.success !== false) {
        toast.success(t('register.success.otpSent', 'Verification code sent to your email'));
        setStep('otp');
        setResendTimer(60);
      } else {
        toast.error(res?.message || t('register.errors.generalError', 'Failed to send OTP'));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || t('register.errors.generalError', 'Failed to send OTP'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || isLoading) return;
    await handleSendOtp();
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!formData.otp.trim() || formData.otp.trim().length !== 6) {
      toast.error(t('register.errors.otpRequired', 'Please enter a valid 6-digit verification code'));
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.verifyRegisterOtp({
        email: formData.email.trim().toLowerCase(),
        otp: formData.otp.trim(),
      });

      if (res?.success !== false) {
        toast.success(t('register.success.accountCreated', 'Account created successfully! Welcome to LUMA.'));
        
        // تسجيل الدخول الفوري إذا وفر السيرفر جلسة
        if (res?.token || res?.user) {
          loginUser(res);
          navigate('/', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      } else {
        toast.error(res?.message || t('register.errors.invalidOtp', 'Invalid verification code'));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || t('register.errors.invalidOtp', 'Invalid verification code'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-[85vh] w-full flex flex-col justify-center items-center py-12 px-4 font-['Inter'] select-none transition-colors duration-300"
    >
      <div className="w-full max-w-5xl bg-white dark:bg-[#111A35] md:rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.5)] border border-[#E5E7EB] dark:border-white/10 overflow-hidden flex flex-col md:flex-row min-h-[640px] transition-colors duration-300">
        
        {/* الجانب البصري الفاخر */}
        <div className="relative md:w-5/12 bg-[#0B132B] text-white p-8 md:p-12 flex flex-col justify-between overflow-hidden">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85"
              alt="LUMA Luxury Exterior"
              className="w-full h-full object-cover opacity-60 contrast-[1.1] brightness-[0.8] scale-100 hover:scale-105 transition-transform duration-1000 ease-out"
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
              {t('register.showcase.tagline', 'Bespoke Experience')}
            </span>
            <p className="text-xl sm:text-2xl font-light leading-snug font-['Poppins'] text-white/95">
              {t('register.showcase.quote', 'Join the private circle of refined aesthetic living.')}
            </p>
          </div>

          <div className="relative z-10 backdrop-blur-xl bg-white/10 border border-white/20 p-4 rounded-2xl flex items-center gap-3.5 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E89A5B] to-[#b86d30] text-white flex items-center justify-center font-bold text-base shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-white tracking-wide">
                {t('register.showcase.badgeTitle', 'Verified Membership')}
              </p>
              <p className="text-[11px] text-slate-300 font-light">
                {t('register.showcase.badgeDesc', 'Direct verification for authenticated access.')}
              </p>
            </div>
          </div>
        </div>

        {/* الجانب الأيمن (النموذج) */}
        <div className="md:w-7/12 p-8 sm:p-12 lg:p-14 flex flex-col justify-center bg-white dark:bg-[#111A35] transition-colors duration-300">
          <div className="max-w-md w-full mx-auto">
            
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-black text-[#17233C] dark:text-white tracking-tight font-['Poppins']">
                {step === 'form' ? t('register.title', 'Create Account') : t('register.verifyTitle', 'Verify Email')}
              </h2>
              <p className="text-xs sm:text-sm text-[#7B8190] dark:text-slate-400 mt-2 leading-relaxed font-light">
                {step === 'form' 
                  ? t('register.subtitle', 'Fill in your details to receive an authentication OTP code.') 
                  : `${t('register.verifySubtitle', 'Enter the 6-digit code sent to')} ${formData.email}`}
              </p>
            </div>

            {step === 'form' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1F2937] dark:text-slate-300 mb-1.5">
                    {t('register.usernameLabel', 'Full Name / Username')}
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] dark:border-white/15 text-xs outline-none transition-all duration-300 bg-[#FAFAFA] dark:bg-white/5 text-[#1F2937] dark:text-white focus:border-[#17233C] dark:focus:border-[#E89A5B]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1F2937] dark:text-slate-300 mb-1.5">
                    {t('register.emailLabel', 'Email Address')}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] dark:border-white/15 text-xs outline-none transition-all duration-300 bg-[#FAFAFA] dark:bg-white/5 text-[#1F2937] dark:text-white focus:border-[#17233C] dark:focus:border-[#E89A5B]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1F2937] dark:text-slate-300 mb-1.5">
                    {t('register.phoneLabel', 'Phone Number')}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+201234567890"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] dark:border-white/15 text-xs outline-none transition-all duration-300 bg-[#FAFAFA] dark:bg-white/5 text-[#1F2937] dark:text-white focus:border-[#17233C] dark:focus:border-[#E89A5B]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1F2937] dark:text-slate-300 mb-1.5">
                    {t('register.passwordLabel', 'Password')}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
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
                      } text-[#7B8190] dark:text-slate-400 hover:text-[#17233C] dark:hover:text-white p-1 cursor-pointer transition-colors`}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* قائمة التحقق المرئية من شروط كلمة المرور */}
                  {formData.password.length > 0 && (
                    <div className="grid grid-cols-2 gap-1 mt-2 text-[10px] text-slate-500 dark:text-slate-400">
                      <span className={`flex items-center gap-1 ${passwordCriteria.length ? 'text-emerald-500 font-bold' : ''}`}>
                        {passwordCriteria.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-rose-400" />}
                        {t('register.criteriaLength', '8+ Characters')}
                      </span>
                      <span className={`flex items-center gap-1 ${passwordCriteria.upper ? 'text-emerald-500 font-bold' : ''}`}>
                        {passwordCriteria.upper ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-rose-400" />}
                        {t('register.criteriaUpper', 'Uppercase letter')}
                      </span>
                      <span className={`flex items-center gap-1 ${passwordCriteria.lower ? 'text-emerald-500 font-bold' : ''}`}>
                        {passwordCriteria.lower ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-rose-400" />}
                        {t('register.criteriaLower', 'Lowercase letter')}
                      </span>
                      <span className={`flex items-center gap-1 ${passwordCriteria.number ? 'text-emerald-500 font-bold' : ''}`}>
                        {passwordCriteria.number ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-rose-400" />}
                        {t('register.criteriaNumber', 'Number')}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !isStrongPassword}
                  className="w-full bg-[#17233C] hover:bg-[#223354] dark:bg-[#E89A5B] dark:hover:bg-[#d4894d] text-white dark:text-[#0B132B] py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 mt-4"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('register.sendingOtp', 'Sending OTP...')}</span>
                    </>
                  ) : (
                    <>
                      <span>{t('register.continueBtn', 'Continue with Verification')}</span>
                      {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1F2937] dark:text-slate-300">
                      {t('register.otpLabel', 'Verification Code (OTP)')}
                    </label>
                    <KeyRound className="w-4 h-4 text-[#E89A5B]" />
                  </div>

                  {/* استخدام مكون OtpInputGroup المعتمد لسهولة الإدخال */}
                  <OtpInputGroup
                    length={6}
                    value={formData.otp}
                    onChange={(val) => setFormData((prev) => ({ ...prev, otp: val }))}
                    isRtl={isRtl}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || formData.otp.length < 6}
                  className="w-full bg-[#17233C] hover:bg-[#223354] dark:bg-[#E89A5B] dark:hover:bg-[#d4894d] text-white dark:text-[#0B132B] py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 mt-4"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('register.verifying', 'Verifying...')}</span>
                    </>
                  ) : (
                    <span>{t('register.verifyBtn', 'Confirm & Create Account')}</span>
                  )}
                </button>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('form');
                      setFormData((prev) => ({ ...prev, otp: '' }));
                    }}
                    className="text-xs text-[#7B8190] dark:text-slate-400 hover:underline cursor-pointer"
                  >
                    ← {t('register.backToForm', 'Edit Registration Details')}
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0 || isLoading}
                    className="text-xs font-bold text-[#E89A5B] hover:underline disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>
                      {resendTimer > 0 
                        ? `${t('register.resendIn', 'Resend in')} ${resendTimer}s` 
                        : t('register.resendNow', 'Resend OTP')}
                    </span>
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 text-center text-xs text-[#7B8190] dark:text-slate-400 font-light">
              {t('register.hasAccount', 'Already have an account?')}{' '}
              <Link
                to="/login"
                className="text-[#17233C] dark:text-[#E89A5B] font-bold hover:underline transition-colors"
              >
                {t('register.loginAction', 'Sign In')}
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;