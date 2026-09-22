import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Mail, Shield, LogOut, Package, Heart, ShoppingBag, TrendingUp, Sparkles, Activity, ArrowRight, ArrowLeft } from 'lucide-react';
import axiosInstance from '../../../api/axiosInstance';
import { useWishlist } from '../../../context/WishlistContext';
import { useCart } from '../../../context/CartContext';
import orderService from '../../../services/orderService';
import AddressManager from './components/AddressManager'; // استيراد مكون العناوين الذي أنشأناه
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || 'ar').startsWith('ar');
  const navigate = useNavigate();

  const { wishlistIds } = useWishlist();
  const { cart } = useCart();

  const [user, setUser] = useState(null);
  const [ordersSummary, setOrdersSummary] = useState({ totalOrders: 0, totalSpent: 0, recentStatus: 'N/A' });
  const [loading, setLoading] = useState(true);

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
        }

        try {
          const ordersRes = await orderService.getMyOrders(1, 20);
          if (ordersRes && ordersRes.success) {
            const userOrders = ordersRes.orders || [];
            const totalOrders = userOrders.length;
            const totalSpent = userOrders.reduce((acc, order) => acc + Number(order.totalPrice || 0), 0);
            const recentStatus = totalOrders > 0 ? userOrders[0].status : (isRtl ? 'لا توجد طلبات' : 'No orders yet');
            
            setOrdersSummary({ totalOrders, totalSpent, recentStatus });
          }
        } catch (orderErr) {
          console.error("Orders analytics fetch error:", orderErr);
        }

      } catch (err) {
        console.error("Profile fetch error:", err);
        toast.error(isRtl ? 'يرجى تسجيل الدخول لعرض بيانات الملف الشخصي' : 'Please log in to view profile details');
        if (err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndAnalytics();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [navigate, isRtl]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success(isRtl ? 'تم تسجيل الخروج بنجاح' : 'Logged out successfully');
    navigate('/');
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#FDFBF7] dark:bg-[#0B132B]">
        <div className="w-10 h-10 border-4 border-[#0B132B] dark:border-[#E89A5B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0B132B] text-[#0B132B] dark:text-white py-12 px-4 sm:px-6 lg:px-8 font-['Poppins'] transition-colors duration-300" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* ترويسة البروفايل */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-black/5 dark:border-white/10 p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 end-0 w-64 h-64 bg-[#E89A5B]/5 dark:bg-[#E89A5B]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-start">
            <div className="w-24 h-24 rounded-full bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] flex items-center justify-center text-3xl font-black shadow-xl shrink-0">
              {user?.username ? user.username.charAt(0).toUpperCase() : (user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-10 h-10" />)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-black">{user?.username || user?.name || (isRtl ? 'مستخدم مميز' : 'VIP Client')}</h1>
                <Sparkles className="w-4 h-4 text-[#E89A5B]" />
              </div>
              <p className="text-xs text-slate-500 dark:text-gray-400 flex items-center justify-center sm:justify-start gap-1.5 font-mono">
                <Mail className="w-3.5 h-3.5 text-[#E89A5B]" />
                <span>{user?.email || 'user@example.com'}</span>
              </p>
              <div className="pt-2 flex items-center justify-center sm:justify-start gap-2">
                <span className="px-3 py-1 rounded-full bg-[#E89A5B]/10 text-[#E89A5B] text-[10px] font-bold uppercase tracking-wider">
                  {user?.role || 'VIP Client'}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
                  {isRtl ? 'حساب نشط ومؤمن' : 'Active & Secure'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="px-5 py-2.5 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('store.nav.logout', 'Logout')}</span>
          </button>
        </div>

        {/* إحصائيات ونشاط الحساب */}
        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-slate-700 dark:text-gray-300">
            <Activity className="w-4 h-4 text-[#E89A5B]" />
            <span>{isRtl ? 'تحليلات ونشاط الحساب في المتجر' : 'Store Activity & Analytics'}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-black/5 dark:border-white/10 p-5 space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-gray-400">
                <span className="text-xs font-bold">{isRtl ? 'إجمالي الطلبات' : 'Total Orders'}</span>
                <Package className="w-4 h-4 text-[#E89A5B]" />
              </div>
              <p className="text-2xl font-black font-mono">{ordersSummary.totalOrders}</p>
              <p className="text-[10px] text-emerald-500 font-bold truncate">{isRtl ? 'حالة آخر طلب: ' : 'Latest status: '}{ordersSummary.recentStatus}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-black/5 dark:border-white/10 p-5 space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-gray-400">
                <span className="text-xs font-bold">{isRtl ? 'إجمالي المشتريات' : 'Total Spent'}</span>
                <TrendingUp className="w-4 h-4 text-[#E89A5B]" />
              </div>
              <p className="text-2xl font-black font-mono text-[#E89A5B]">${ordersSummary.totalSpent.toFixed(2)}</p>
              <p className="text-[10px] text-slate-400">{isRtl ? 'قيمة الاستثمار بمنتجاتنا الفاخرة' : 'Investment in luxury assets'}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-black/5 dark:border-white/10 p-5 space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-gray-400">
                <span className="text-xs font-bold">{isRtl ? 'منتجات السلة الحالية' : 'Bag Items'}</span>
                <ShoppingBag className="w-4 h-4 text-[#E89A5B]" />
              </div>
              <p className="text-2xl font-black font-mono">{cart.itemCount || 0}</p>
              <Link to="/cart" className="text-[10px] text-[#E89A5B] font-bold hover:underline inline-block">{isRtl ? 'عرض تفاصيل السلة ←' : 'View Cart Details →'}</Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-black/5 dark:border-white/10 p-5 space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-gray-400">
                <span className="text-xs font-bold">{isRtl ? 'قائمة المفضلة' : 'Wishlist Items'}</span>
                <Heart className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-2xl font-black font-mono">{wishlistIds.length}</p>
              <Link to="/wishlist" className="text-[10px] text-rose-500 font-bold hover:underline inline-block">{isRtl ? 'استعراض المفضلة ←' : 'Explore Wishlist →'}</Link>
            </div>

          </div>
        </div>

        {/* ─── قسم إدارة عناوين الشحن (AddressManager) ─── */}
        <div>
          <AddressManager />
        </div>

        {/* معلومات الحساب والإجراءات */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-black/5 dark:border-white/10 p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-wider border-b border-black/5 dark:border-white/10 pb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#E89A5B]" />
              <span>{isRtl ? 'معلومات الأمان والحساب' : 'Security & Account Info'}</span>
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2.5 border-b border-black/5 dark:border-white/5">
                <span className="text-slate-500">{isRtl ? 'اسم المستخدم' : 'Username'}</span>
                <span className="font-bold">{user?.username || user?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-black/5 dark:border-white/5">
                <span className="text-slate-500">{isRtl ? 'رقم الهاتف' : 'Phone Number'}</span>
                <span className="font-mono font-bold">{user?.phone || (isRtl ? 'غير مسجل' : 'Not registered')}</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-slate-500">{isRtl ? 'مستوى الحساب' : 'Membership Level'}</span>
                <span className="font-bold text-[#E89A5B]">{isRtl ? 'عضوية لجوما الفاخرة' : 'LUMA Elite Member'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-black/5 dark:border-white/10 p-6 space-y-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="text-sm font-black uppercase tracking-wider border-b border-black/5 dark:border-white/10 pb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-[#E89A5B]" />
                <span>{isRtl ? 'إدارة الطلبات والشحن' : 'Orders & Shipping'}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
                {isRtl 
                  ? 'لديك وصول كامل لتتبع حالة الطرود، فحص الفواتير السابقة، وإدارة عناوين الشحن المفضلة لديك بضغطة زر واحدة.'
                  : 'You have full access to track parcel statuses, inspect past invoices, and manage your preferred shipping addresses with a single click.'}
              </p>
            </div>
            
            <button
              type="button"
              onClick={() => navigate('/my-orders')}
              className="w-full py-3.5 px-4 rounded-xl bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] text-xs font-bold uppercase tracking-wider transition hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <span>{isRtl ? 'الانتقال إلى لوحة طلباتي' : 'Go to My Orders Dashboard'}</span>
              {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}