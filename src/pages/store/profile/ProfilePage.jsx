import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  User, 
  Mail, 
  Shield, 
  LogOut, 
  Package, 
  Heart, 
  ShoppingBag, 
  TrendingUp, 
  Sparkles, 
  Activity, 
  ArrowRight, 
  ArrowLeft, 
  Edit3, 
  X, 
  Check, 
  Loader2, 
  Home,
  Crown,
  CreditCard,
  MapPin,
  Calendar,
  Globe2,
  CheckCircle2
} from 'lucide-react';
import axiosInstance from '../../../api/axiosInstance';
import { useWishlist } from '../../../context/WishlistContext';
import { useCart } from '../../../context/CartContext';
import { useSettings } from '../../../context/SettingsContext';
import orderService from '../../../services/orderService';
import userService from '../../../services/userService';
import AddressManager from './components/AddressManager';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || 'ar').startsWith('ar');
  const navigate = useNavigate();

  const { wishlistIds } = useWishlist();
  const { cart } = useCart();
  const { formatPrice, currencyLabel } = useSettings();

  const [user, setUser] = useState(null);
  const [ordersSummary, setOrdersSummary] = useState({ 
    totalOrders: 0, 
    totalSpent: 0, 
    recentStatus: 'N/A', 
    pendingCount: 0 
  });
  const [loading, setLoading] = useState(true);

  // حالة نافذة التعديل المتقدمة
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    city: '',
    country: 'Saudi Arabia'
  });

  useEffect(() => {
    const fetchUserDataAndAnalytics = async () => {
      try {
        setLoading(true);
        
        let userData = null;
        try {
          const profileRes = await axiosInstance.get('/auth/profile');
          userData = profileRes.data?.user || profileRes.data;
        } catch (e) {
          const meRes = await axiosInstance.get('/auth/me');
          userData = meRes.data?.user || meRes.data;
        }

        if (userData) {
          setUser(userData);
          setFormData({
            username: userData.username || userData.name || '',
            phone: userData.phone || '',
            city: userData.city || 'Jeddah',
            country: userData.country || 'Saudi Arabia'
          });
        }

        try {
          const ordersRes = await orderService.getMyOrders({ limit: 100 });
          const rawOrders = ordersRes?.orders || ordersRes?.data?.orders || (Array.isArray(ordersRes) ? ordersRes : []);
          
          if (Array.isArray(rawOrders) && rawOrders.length > 0) {
            const totalOrders = rawOrders.length;
            const totalSpent = rawOrders.reduce((acc, order) => acc + Number(order.totalPrice || order.total || 0), 0);
            const recentStatus = rawOrders[0]?.status || rawOrders[0]?.orderStatus || 'Confirmed';
            const pendingCount = rawOrders.filter(o => ['pending', 'processing'].includes((o.status || '').toLowerCase())).length;
            
            setOrdersSummary({ totalOrders, totalSpent, recentStatus, pendingCount });
          }
        } catch (orderErr) {
          console.error("Orders analytics fetch error:", orderErr);
        }

      } catch (err) {
        console.error("Profile fetch error:", err);
        toast.error(t('store.auth.login_required_profile', 'Please log in to view profile details'));
        if (err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndAnalytics();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [navigate, t]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin_token');
    toast.success(t('store.auth.logout_success', 'Logged out successfully'));
    navigate('/');
    window.location.reload();
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!formData.username.trim()) {
      toast.error(isRtl ? 'اسم المستخدم مطلوب' : 'Username is required');
      return;
    }

    try {
      setUpdating(true);
      const res = await userService.updateUserProfile(user, {
        username: formData.username.trim(),
        phone: formData.phone.trim(),
        city: formData.city.trim(),
        country: formData.country.trim()
      });

      const updatedUser = res?.user || res?.data || { ...user, ...formData };
      setUser(updatedUser);
      toast.success(t('store.profile.update_success', 'Profile updated successfully!'));
      setIsEditModalOpen(false);
    } catch (err) {
      const msg = err?.response?.data?.message || t('store.profile.update_failed', 'Failed to update profile');
      toast.error(msg);
    } finally {
      setUpdating(false);
    }
  };

  // احتساب مستوى العضوية الراقي
  const spentTarget = 5000;
  const progressPercent = Math.min(Math.round((ordersSummary.totalSpent / spentTarget) * 100), 100);

  if (loading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-[#FAF8F5] dark:bg-[#070D1E]">
        <div className="w-10 h-10 border-4 border-[#0B132B] dark:border-[#E89A5B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#070D1E] text-[#0B132B] dark:text-white py-8 px-4 sm:px-6 lg:px-8 font-['Poppins'] transition-colors duration-300" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* شريط التنقل العلوي النقي (بدون ID) */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-[#121c38] border border-black/5 dark:border-white/10 hover:border-[#E89A5B] text-xs font-black uppercase tracking-wider transition-all shadow-xs cursor-pointer group"
          >
            {isRtl ? <ArrowRight className="w-4 h-4 text-[#E89A5B] group-hover:translate-x-1 transition-transform" /> : <ArrowLeft className="w-4 h-4 text-[#E89A5B] group-hover:-translate-x-1 transition-transform" />}
            <Home className="w-4 h-4 text-slate-400 group-hover:text-[#E89A5B] transition-colors" />
            <span>{t('store.profile.back_home', 'Home')}</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{t('store.profile.account_verified', 'Verified Client')}</span>
            </span>
          </div>
        </div>

        {/* 1. الترويسة الرئيسية الفاخرة (The Executive Profile Banner) */}
        <div className="bg-white dark:bg-[#121c38] rounded-[32px] border border-black/5 dark:border-white/10 p-6 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 end-0 w-96 h-96 bg-gradient-to-br from-[#E89A5B]/15 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
            
            {/* تفاصيل المستخدم */}
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-start">
              <div className="relative group">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[28px] bg-gradient-to-br from-[#0B132B] to-[#17233C] dark:from-[#E89A5B] dark:to-[#d4894d] text-white dark:text-[#0B132B] flex items-center justify-center text-3xl sm:text-4xl font-black shadow-xl ring-4 ring-[#E89A5B]/20">
                  {user?.username ? user.username.charAt(0).toUpperCase() : (user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-12 h-12" />)}
                </div>
                <div className="absolute -bottom-2 -end-2 p-1.5 rounded-xl bg-white dark:bg-[#070D1E] shadow-md border border-black/5 dark:border-white/10 text-[#E89A5B]">
                  <Crown className="w-4 h-4 fill-current" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                    {user?.username || user?.name || t('store.profile.vip_client', 'VIP Client')}
                  </h1>
                  <span className="px-3 py-0.5 rounded-full bg-[#E89A5B] text-[#0B132B] text-[10px] font-black uppercase tracking-wider shadow-xs">
                    {t('store.profile.vip_tier', 'Gold Tier')}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-2 font-mono">
                  <Mail className="w-3.5 h-3.5 text-[#E89A5B]" />
                  <span>{user?.email || 'user@example.com'}</span>
                  <span>•</span>
                  <span>{user?.phone || '+966 ••••••••'}</span>
                </p>

                <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formData.city || 'Jeddah'}, {formData.country || 'Saudi Arabia'}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t('store.profile.member_since', 'Member since 2026')}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* أزرار الإجراء السريع */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="flex-1 sm:flex-initial px-6 py-3.5 rounded-2xl bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] text-xs font-black uppercase tracking-wider hover:opacity-90 transition flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
              >
                <Edit3 className="w-4 h-4" />
                <span>{t('store.profile.edit_profile_btn', 'Edit Profile')}</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="p-3.5 rounded-2xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition cursor-pointer active:scale-95"
                title={t('store.nav.logout', 'Logout')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* شريط ترقية العضوية VIP Tier Progress */}
          <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/10 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#E89A5B]" />
                <span>{t('store.profile.tier_progress', 'Progress to Platinum VIP Tier')}</span>
              </span>
              <span className="font-mono text-[#E89A5B]">
                {currencyLabel} {formatPrice(ordersSummary.totalSpent)} / {currencyLabel} {formatPrice(spentTarget)} ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#0B132B] via-[#E89A5B] to-[#d4894d] dark:from-white dark:via-[#E89A5B] dark:to-[#E89A5B] transition-all duration-1000 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* 2. مؤشرات النشاط والإحصائيات التفاعلية (Luxury Metrics Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white dark:bg-[#121c38] rounded-3xl border border-black/5 dark:border-white/10 p-6 space-y-3 shadow-xs hover:border-[#E89A5B]/40 transition-colors">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">{t('store.profile.total_orders', 'Total Orders')}</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-black font-mono">{ordersSummary.totalOrders}</p>
              <p className="text-[11px] text-slate-400 font-medium mt-1">
                {ordersSummary.pendingCount > 0 
                  ? `${ordersSummary.pendingCount} ${t('store.profile.orders_in_transit', 'in active transit')}`
                  : t('store.profile.all_delivered', 'All shipments up to date')}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#121c38] rounded-3xl border border-black/5 dark:border-white/10 p-6 space-y-3 shadow-xs hover:border-[#E89A5B]/40 transition-colors">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">{t('store.profile.total_spent', 'Total Acquired')}</span>
              <div className="p-2 rounded-xl bg-[#E89A5B]/10 text-[#E89A5B]">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-black font-mono text-[#E89A5B]">
                {currencyLabel} {formatPrice(ordersSummary.totalSpent)}
              </p>
              <p className="text-[11px] text-slate-400 font-medium mt-1">
                {t('store.profile.luxury_investment', 'Exclusive collection investment')}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#121c38] rounded-3xl border border-black/5 dark:border-white/10 p-6 space-y-3 shadow-xs hover:border-[#E89A5B]/40 transition-colors">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">{t('store.profile.bag_items', 'Shopping Bag')}</span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-black font-mono">{cart.itemCount || 0}</p>
              <Link to="/cart" className="text-[11px] text-[#E89A5B] font-bold hover:underline inline-flex items-center gap-1 mt-1">
                <span>{t('store.profile.view_cart_link', 'Review Bag')}</span>
                {isRtl ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
              </Link>
            </div>
          </div>

          <div className="bg-white dark:bg-[#121c38] rounded-3xl border border-black/5 dark:border-white/10 p-6 space-y-3 shadow-xs hover:border-[#E89A5B]/40 transition-colors">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">{t('store.profile.wishlist_items', 'Wishlist Curation')}</span>
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                <Heart className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-black font-mono">{wishlistIds.length}</p>
              <Link to="/wishlist" className="text-[11px] text-rose-500 font-bold hover:underline inline-flex items-center gap-1 mt-1">
                <span>{t('store.profile.explore_wishlist_link', 'Curated Archive')}</span>
                {isRtl ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
              </Link>
            </div>
          </div>

        </div>

        {/* 3. قسم دفتر عناوين الشحن الفاخر */}
        <div>
          <AddressManager />
        </div>

        {/* 4. تفاصيل الأمان ومتابعة الطلبات المزدوجة */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-white dark:bg-[#121c38] rounded-3xl border border-black/5 dark:border-white/10 p-6 sm:p-8 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-4">
              <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#E89A5B]" />
                <span>{t('store.profile.security_title', 'Security & Preferences')}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="text-xs font-bold text-[#E89A5B] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{t('store.profile.edit_profile_btn', 'Edit')}</span>
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between py-2 border-b border-black/5 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400 font-medium">{t('store.profile.username_label', 'Client Full Name')}</span>
                <span className="font-bold">{user?.username || user?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-black/5 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400 font-medium">{t('store.profile.phone_label', 'Direct Phone')}</span>
                <span className="font-mono font-bold">{user?.phone || t('store.profile.not_registered', 'Not registered')}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-black/5 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400 font-medium">{t('store.profile.preferred_currency', 'Active Currency')}</span>
                <span className="font-bold font-mono text-[#E89A5B]">{currencyLabel} (SAR / EGP Supported)</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500 dark:text-slate-400 font-medium">{t('store.profile.membership_label', 'Client Level')}</span>
                <span className="font-black text-[#E89A5B] uppercase tracking-wider flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 fill-current" />
                  <span>{t('store.profile.membership_tier', 'LUMA Elite Tier')}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#121c38] rounded-3xl border border-black/5 dark:border-white/10 p-6 sm:p-8 space-y-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="text-sm font-black uppercase tracking-wider border-b border-black/5 dark:border-white/10 pb-4 flex items-center gap-2">
                <Package className="w-4 h-4 text-[#E89A5B]" />
                <span>{t('store.profile.orders_shipping_title', 'Orders & Private Concierge')}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                {t('store.profile.orders_shipping_desc', 'Track high-priority dispatches, manage verified addresses, and inspect full invoices anytime with end-to-end encrypted order histories.')}
              </p>
            </div>
            
            <button
              type="button"
              onClick={() => navigate('/my-orders')}
              className="w-full py-4 px-6 rounded-2xl bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] text-xs font-black uppercase tracking-wider transition hover:opacity-90 flex items-center justify-center gap-2.5 cursor-pointer shadow-xl active:scale-[0.99]"
            >
              <span>{t('store.profile.go_to_orders', 'Access Orders Archive')}</span>
              {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>

        </div>

      </div>

      {/* نافذة التعديل الفاخرة (Edit Modal) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-[#121c38] border border-black/10 dark:border-white/10 rounded-[32px] p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto no-scrollbar">
            
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-4">
              <h3 className="text-base font-black uppercase tracking-wider flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#E89A5B]" />
                <span>{t('store.profile.edit_profile_title', 'Update Client Profile')}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-slate-400 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  {t('store.profile.username_label', 'Full Name / Username *')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="e.g. Ahmed Ibrahim"
                  className="w-full px-4 py-3 bg-[#FAF8F5] dark:bg-[#070D1E] border border-black/10 dark:border-white/10 rounded-xl outline-none focus:border-[#E89A5B] transition font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  {t('store.profile.phone_label', 'Phone Number')}
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+966 50 000 0000"
                  className="w-full px-4 py-3 bg-[#FAF8F5] dark:bg-[#070D1E] border border-black/10 dark:border-white/10 rounded-xl outline-none focus:border-[#E89A5B] transition font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    {t('store.profile.city_label', 'City')}
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Jeddah / Cairo"
                    className="w-full px-4 py-3 bg-[#FAF8F5] dark:bg-[#070D1E] border border-black/10 dark:border-white/10 rounded-xl outline-none focus:border-[#E89A5B] transition font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    {t('store.profile.country_label', 'Country')}
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Saudi Arabia / Egypt"
                    className="w-full px-4 py-3 bg-[#FAF8F5] dark:bg-[#070D1E] border border-black/10 dark:border-white/10 rounded-xl outline-none focus:border-[#E89A5B] transition font-medium"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3.5 rounded-xl border border-black/10 dark:border-white/10 text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
                >
                  {t('store.profile.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 py-3.5 rounded-xl bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] text-xs font-black uppercase tracking-wider hover:opacity-90 transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {updating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>{updating ? t('store.profile.saving', 'Saving...') : t('store.profile.save_changes', 'Save Changes')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}