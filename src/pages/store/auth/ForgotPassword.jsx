import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import authService from '../../../services/authService';

const ForgotPassword = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const currentLang = i18n.language || 'en';
  const isRtl = currentLang === 'ar';

  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isStrongPassword = (pass) => {
    return pass.length >= 8 && /[A-Z]/.test(pass) && /[a-z]/.test(pass) && /[0-9]/.test(pass);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email.trim())) {
      toast.error(t('forgot.errors.invalidEmail'));
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.sendForgotPasswordOtp(email.trim());
      toast.success(res?.message || t('forgot.success.otpSent'));
      setStep('verify');
    } catch (err) {
      const errorMsg = err.response?.data?.message || t('forgot.errors.sendFailed');
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndReset = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length !== 6) {
      toast.error(t('forgot.errors.invalidOtp'));
      return;
    }

    if (!isStrongPassword(newPassword)) {
      toast.error(t('forgot.errors.weakPassword'));
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t('forgot.errors.passwordMismatch'));
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
      toast.success(res?.message || t('forgot.success.passwordUpdated'));
      navigate('/login', { replace: true });
    } catch (err) {
      const errorMsg = err.response?.data?.message || t('forgot.errors.resetFailed');
      toast.error(errorMsg);
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
              src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=85"
              alt="LUMA Luxury Interior"
              className="w-full h-full object-cover opacity-60 contrast-[1.1] brightness-[0.8] scale-100 hover:scale-105 transition-transform duration-1000 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B] via-[#0B132B]/50 to-transparent" />
          </div>

          <div className="relative z-10">
            <Link to="/" className="inline-block">
              <span className="text-3xl font-black tracking-[0.25em] font-['Poppins'] text-white drop-shadow-lg">
                {t('brand')}
              </span>
            </Link>
            <div className="h-1 w-12 bg-[#E89A5B] mt-2 rounded-full shadow-lg"></div>
          </div>

          <div className="relative z-10 my-8 backdrop-blur-md bg-black/30 p-5 rounded-2xl border border-white/10 shadow-2xl">
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#E89A5B] uppercase block mb-2">
              {t('forgot.showcase.tagline')}
            </span>
            <p className="text-xl sm:text-2xl font-light leading-snug font-['Poppins'] text-white/95">
              {t('forgot.showcase.quote')}
            </p>
          </div>

          <div className="relative z-10 backdrop-blur-xl bg-white/10 border border-white/20 p-4 rounded-2xl flex items-center gap-3.5 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E89A5B] to-[#b86d30] text-white flex items-center justify-center font-bold text-base shadow-md">
              ✦
            </div>
            <div>
              <p className="text-xs font-bold text-white tracking-wide">
                {t('forgot.showcase.badgeTitle')}
              </p>
              <p className="text-[11px] text-slate-300 font-light">
                {t('forgot.showcase.badgeDesc')}
              </p>
            </div>
          </div>
        </div>

        {/* الجانب الأيمن (النموذج) */}
        <div className="md:w-7/12 p-8 sm:p-12 lg:p-14 flex flex-col justify-center bg-white dark:bg-[#111A35] transition-colors duration-300">
          <div className="max-w-md w-full mx-auto">
            
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-black text-[#17233C] dark:text-white tracking-tight font-['Poppins']">
                {step === 'email' ? t('forgot.title') : t('forgot.resetTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-[#7B8190] dark:text-slate-400 mt-2 leading-relaxed font-light">
                {step === 'email' ? t('forgot.subtitle') : t('forgot.resetSubtitle')}
              </p>
            </div>

            {step === 'email' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1F2937] dark:text-slate-300 mb-2">
                    {t('forgot.emailLabel')}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('forgot.emailPlaceholder')}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] dark:border-white/15 text-xs outline-none transition-all duration-300 bg-[#FAFAFA] dark:bg-white/5 text-[#1F2937] dark:text-white focus:border-[#17233C] dark:focus:border-[#E89A5B]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#17233C] hover:bg-[#223354] dark:bg-[#E89A5B] dark:hover:bg-[#d4894d] text-white dark:text-[#0B132B] py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 mt-4"
                >
                  {isLoading ? t('forgot.submitting') : t('forgot.submitBtn')}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyAndReset} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1F2937] dark:text-slate-300 mb-1.5">
                    {t('forgot.otpLabel')}
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    required
                    className="w-full px-4 py-3.5 rounded-xl border border-[#E5E7EB] dark:border-white/15 text-sm tracking-widest text-center font-bold outline-none bg-[#FAFAFA] dark:bg-white/5 text-[#1F2937] dark:text-white focus:border-[#17233C] dark:focus:border-[#E89A5B]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1F2937] dark:text-slate-300 mb-1.5">
                    {t('forgot.passwordLabel')}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={t('forgot.passwordPlaceholder')}
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
                      } text-xs text-[#7B8190] dark:text-slate-400 hover:text-[#17233C] dark:hover:text-white p-1 cursor-pointer`}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1F2937] dark:text-slate-300 mb-1.5">
                    {t('forgot.confirmPasswordLabel')}
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('forgot.passwordPlaceholder')}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] dark:border-white/15 text-xs outline-none transition-all duration-300 bg-[#FAFAFA] dark:bg-white/5 text-[#1F2937] dark:text-white focus:border-[#17233C] dark:focus:border-[#E89A5B]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#17233C] hover:bg-[#223354] dark:bg-[#E89A5B] dark:hover:bg-[#d4894d] text-white dark:text-[#0B132B] py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 mt-4"
                >
                  {isLoading ? t('forgot.submitting') : t('forgot.resetBtn')}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="w-full text-center text-xs text-[#7B8190] dark:text-slate-400 hover:underline pt-2 cursor-pointer"
                >
                  {t('forgot.backAction')}
                </button>
              </form>
            )}

            <div className="mt-6 text-center text-xs text-[#7B8190] dark:text-slate-400 font-light">
              {t('forgot.rememberPrompt')}{' '}
              <Link
                to="/login"
                className="text-[#17233C] dark:text-[#E89A5B] font-bold hover:underline transition-colors"
              >
                {t('forgot.signInAction')}
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;