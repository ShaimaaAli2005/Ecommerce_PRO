import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import authService from '../../../services/authService';
import { useAuth } from '../../../context/AuthContext';
import { useWishlist } from '../../../context/WishlistContext';
import { useCart } from '../../../context/CartContext';

const Login = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const { loginUser } = useAuth();
  const { fetchWishlist } = useWishlist();
  const { fetchCart } = useCart();

  const currentLang = i18n.language || 'en';
  const isRtl = currentLang === 'ar';
  
  // استخراج وجهة التوجيه بأمان للمتجر مع استبعاد مسارات الأدمن
  const getDestinationPath = () => {
    if (location.state?.from?.pathname) {
      const fromPath = location.state.from.pathname;
      if (!fromPath.startsWith('/admin')) {
        return fromPath;
      }
    }
    const params = new URLSearchParams(location.search);
    const redirectParam = params.get('redirect');
    if (redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('/admin')) {
      return redirectParam;
    }
    return '/';
  };

  const destination = getDestinationPath();

  const [formData, setFormData] = useState({
    email: localStorage.getItem('luma_remembered_email') || '',
    password: '',
    rememberMe: Boolean(localStorage.getItem('luma_remembered_email')),
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = t('login.errors.emailRequired', 'Email is required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      newErrors.email = t('login.errors.emailInvalid', 'Invalid email address');
    }

    if (!formData.password) {
      newErrors.password = t('login.errors.passwordRequired', 'Password is required');
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const res = await authService.login({
        email: formData.email.trim(),
        password: formData.password,
      });

      // 1. تحديث سياق المصادقة فورياً
      loginUser(res);

      // 2. إدارة خاصية تذكر البريد
      if (formData.rememberMe) {
        localStorage.setItem('luma_remembered_email', formData.email.trim());
      } else {
        localStorage.removeItem('luma_remembered_email');
      }

      // 3. مزامنة بيانات السلة والمفضلة الخاصة بالمستخدم فوراً
      if (typeof fetchWishlist === 'function') fetchWishlist();
      if (typeof fetchCart === 'function') fetchCart(true);

      toast.success(t('login.success.loginSuccess', 'Logged in successfully'));

      // 4. التوجيه المباشر لمسارات المتجر فقط
      navigate(destination, { replace: true });
    } catch (err) {
      const errorMsg = err.response?.data?.message || t('login.errors.loginFailed', 'Login failed, please check your credentials');
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    timerRef.current = setTimeout(() => {
      const mockGoogleUser = {
        _id: 'google-oauth-user-id',
        username: 'Google VIP Member',
        email: formData.email || 'vip@luma.store',
        role: 'customer'
      };
      
      loginUser(mockGoogleUser, 'sample-google-oauth-token-999');
      setIsGoogleLoading(false);
      toast.success(t('login.success.googleSuccess', 'Google login successful'));
      navigate(destination, { replace: true });
    }, 1000);
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
                {t('brand', 'LUMA')}
              </span>
            </Link>
            <div className="h-1 w-12 bg-[#E89A5B] mt-2 rounded-full shadow-lg"></div>
          </div>

          <div className="relative z-10 my-8 backdrop-blur-md bg-black/30 p-5 rounded-2xl border border-white/10 shadow-2xl">
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#E89A5B] uppercase block mb-2">
              {t('login.showcase.tagline', 'Curated Excellence')}
            </span>
            <p className="text-xl sm:text-2xl font-light leading-snug font-['Poppins'] text-white/95">
              {t('login.showcase.quote', 'Where uncompromising luxury meets flawless digital architecture.')}
            </p>
          </div>

          <div className="relative z-10 backdrop-blur-xl bg-white/10 border border-white/20 p-4 rounded-2xl flex items-center gap-3.5 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E89A5B] to-[#b86d30] text-white flex items-center justify-center font-bold text-base shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-white tracking-wide">
                {t('login.showcase.badgeTitle', 'Secure Global Access')}
              </p>
              <p className="text-[11px] text-slate-300 font-light">
                {t('login.showcase.badgeDesc', 'Encrypted sessions tailored for VIP clients.')}
              </p>
            </div>
          </div>
        </div>

        {/* الجانب الأيمن (نموذج تسجيل الدخول) */}
        <div className="md:w-7/12 p-8 sm:p-12 lg:p-14 flex flex-col justify-center bg-white dark:bg-[#111A35] transition-colors duration-300">
          <div className="max-w-md w-full mx-auto">
            
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-black text-[#17233C] dark:text-white tracking-tight font-['Poppins']">
                {t('login.title', 'Welcome Back')}
              </h2>
              <p className="text-xs sm:text-sm text-[#7B8190] dark:text-slate-400 mt-2 leading-relaxed font-light">
                {t('login.subtitle', 'Enter your credentials to access your curated dashboard.')}
              </p>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading || isLoading}
              className="w-full bg-[#F9FAFB] dark:bg-white/5 hover:bg-[#F3F4F6] dark:hover:bg-white/10 border border-[#E5E7EB] dark:border-white/15 text-[#1F2937] dark:text-white py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 shadow-xs flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
            >
              {isGoogleLoading ? (
                <svg className="animate-spin h-4 w-4 text-[#17233C] dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
              )}
              <span>{t('login.googleBtn', 'Continue with Google')}</span>
            </button>

            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E5E7EB] dark:border-white/10"></div>
              </div>
              <span className="relative bg-white dark:bg-[#111A35] px-3 text-[11px] uppercase font-bold tracking-widest text-[#7B8190] dark:text-slate-400">
                {t('login.showcase.orDivider', 'Or')}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1F2937] dark:text-slate-300 mb-2">
                  {t('login.emailLabel', 'Email Address')}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t('login.emailPlaceholder', 'name@example.com')}
                  className={`w-full px-4 py-3 rounded-xl border text-xs outline-none transition-all duration-300 bg-[#FAFAFA] dark:bg-white/5 text-[#1F2937] dark:text-white ${
                    errors.email
                      ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-[#E5E7EB] dark:border-white/15 focus:border-[#17233C] dark:focus:border-[#E89A5B]'
                  }`}
                />
                {errors.email && (
                  <span className="text-[11px] text-rose-500 dark:text-rose-400 mt-1.5 flex items-center gap-1 font-medium">
                    <span>⚠</span> {errors.email}
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1F2937] dark:text-slate-300">
                    {t('login.passwordLabel', 'Password')}
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] font-medium text-[#17233C] dark:text-[#E89A5B] hover:underline transition-colors"
                  >
                    {t('login.forgotPassword', 'Forgot Password?')}
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={t('login.passwordPlaceholder', '••••••••')}
                    className={`w-full px-4 py-3 rounded-xl border text-xs outline-none transition-all duration-300 bg-[#FAFAFA] dark:bg-white/5 text-[#1F2937] dark:text-white ${
                      isRtl ? 'pl-11' : 'pr-11'
                    } ${
                      errors.password
                        ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                        : 'border-[#E5E7EB] dark:border-white/15 focus:border-[#17233C] dark:focus:border-[#E89A5B]'
                    }`}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute top-1/2 -translate-y-1/2 ${
                      isRtl ? 'left-3' : 'right-3'
                    } text-[#7B8190] dark:text-slate-400 hover:text-[#17233C] dark:hover:text-white p-1 cursor-pointer transition-colors`}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-[11px] text-rose-500 dark:text-rose-400 mt-1.5 flex items-center gap-1 font-medium">
                    <span>⚠</span> {errors.password}
                  </span>
                )}
              </div>

              <div className="flex items-center pt-1">
                <label className="flex items-center gap-2.5 text-xs text-[#7B8190] dark:text-slate-300 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 rounded text-[#17233C] dark:text-[#E89A5B] border-[#D1D5DB] dark:border-white/20 bg-transparent focus:ring-0 cursor-pointer accent-[#17233C] dark:accent-[#E89A5B]"
                  />
                  <span className="group-hover:text-[#17233C] dark:group-hover:text-white transition-colors font-light">
                    {t('login.rememberMe', 'Remember me')}
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full bg-[#17233C] hover:bg-[#223354] dark:bg-[#E89A5B] dark:hover:bg-[#d4894d] text-white dark:text-[#0B132B] py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 group mt-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white dark:text-[#0B132B]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{t('login.submitting', 'Signing in...')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('login.submitBtn', 'Sign In')}</span>
                    {isRtl ? (
                      <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
                    ) : (
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    )}
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-[#7B8190] dark:text-slate-400 font-light">
              {t('login.noAccountPrompt', "Don't have an account?")}{' '}
              <Link
                to="/register"
                className="text-[#17233C] dark:text-[#E89A5B] font-bold hover:underline transition-colors"
              >
                {t('login.registerAction', 'Create an account')}
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;