import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, Trash2, ArrowRight, ArrowLeft, Truck, Check, Tag, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { useSettings } from '../../../context/SettingsContext';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || 'ar').startsWith('ar');
  const { formatPrice } = useSettings();
  const navigate = useNavigate();
  
  const { 
    cart, 
    updateQuantityGlobal, 
    removeFromCartGlobal, 
    clearCartGlobal,
    applyCouponGlobal,
    removeCouponGlobal
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // استخراج المبالغ المالية بأمان
  const subtotal = Number(cart?.subtotal || 0);
  const discountAmount = Number(cart?.discountAmount || 0);
  const couponApplied = typeof cart?.coupon === 'object' ? cart.coupon?.code : cart?.coupon;

  const freeShippingThreshold = 200; // حد الشحن المجاني
  const progress = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const shippingCost = remainingForFreeShipping === 0 ? 0 : 15;
  
  // الإجمالي النهائي مع مراعاة الخصم وحساب الشحن بدقة
  const finalTotal = cart?.total !== undefined && Number(cart.total) > 0
    ? Number(cart.total) + (remainingForFreeShipping === 0 ? 0 : shippingCost)
    : Math.max(0, subtotal - discountAmount) + shippingCost;

  // معالجة تطبيق الكوبون
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    const cleanCode = couponCode.trim().toUpperCase();
    if (!cleanCode) {
      toast.error(isRtl ? 'يرجى إدخال رمز الكوبون' : 'Please enter a coupon code');
      return;
    }

    try {
      setCouponLoading(true);
      if (typeof applyCouponGlobal === 'function') {
        await applyCouponGlobal(cleanCode);
      }
      setCouponCode('');
    } catch (err) {
      // تتم معالجة الرسائل عبر التوست داخل الـ Context أو الخدمة
    } finally {
      setCouponLoading(false);
    }
  };

  // معالجة حذف الكوبون
  const handleRemoveCoupon = async () => {
    try {
      setCouponLoading(true);
      if (typeof removeCouponGlobal === 'function') {
        await removeCouponGlobal();
      }
    } finally {
      setCouponLoading(false);
    }
  };

  // فحص تسجيل الدخول قبل التوجه للدفع
  const handleProceedToCheckout = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
    if (!token) {
      toast.error(t('store.auth.unauthorized', 'Please sign in first'));
      navigate('/login?redirect=/checkout');
      return;
    }
    navigate('/checkout');
  };

  // حالة السلة الفارغة
  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-[#FDFBF7] dark:bg-[#0B132B] text-[#0B132B] dark:text-white py-16 px-4 flex flex-col items-center justify-center font-['Poppins']" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-black/5 dark:border-white/10 p-12 text-center max-w-lg mx-auto space-y-6 shadow-sm">
          <div className="w-20 h-20 mx-auto rounded-full bg-[#E89A5B]/10 text-[#E89A5B] flex items-center justify-center">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-black uppercase tracking-wider">{t('store.cart.empty_title', 'Your Shopping Bag is Empty')}</h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 font-light">
              {t('store.cart.empty_desc', 'Explore our luxury collection and add assets to your bag.')}
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] text-xs font-black uppercase tracking-wider transition hover:opacity-90 shadow-lg cursor-pointer"
          >
            <span>{t('store.cart.explore_btn', 'Explore Catalog')}</span>
            {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-['Poppins'] space-y-8" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* ترويسة السلة */}
      <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#17233C] dark:text-white">
            {t('store.cart.page_title', 'Shopping Bag')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 font-light">
            {cart.items.length} {t('store.cart.items_count_label', 'items in your bag')}
          </p>
        </div>
        <button
          type="button"
          onClick={clearCartGlobal}
          className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
        >
          {t('store.cart.clear_all', 'Clear Bag')}
        </button>
      </div>

      {/* شريط التقدم المجاني للشحن */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-black/5 dark:border-white/10 p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#E89A5B]" />
            <span>
              {remainingForFreeShipping === 0 ? (
                <span className="text-emerald-500 flex items-center gap-1 font-black">
                  <Check className="w-4 h-4" />
                  {t('store.cart.free_shipping_achieved', 'Congratulations! You qualify for Free Shipping.')}
                </span>
              ) : (
                <span>
                  {t('store.cart.free_shipping_left', 'Add')} <strong className="text-[#E89A5B] font-mono">${formatPrice ? formatPrice(remainingForFreeShipping) : remainingForFreeShipping.toFixed(2)}</strong> {t('store.cart.more_for_free_shipping', 'more to get Free Worldwide Shipping!')}
                </span>
              )}
            </span>
          </div>
          <span className="font-mono text-slate-400">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#E89A5B] to-emerald-500 transition-all duration-700 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* محتوى السلة وقائمة المنتجات */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* قائمة عناصر السلة */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item, idx) => {
            const pId = String(item.product?._id || item.product || item.productId || item._id || '').trim();
            const title = item.name || item.product?.name || 'Luxury Item';
            const price = Number(item.price || item.product?.price || 0);
            const img = item.image || item.product?.images?.[0]?.url || item.product?.image || 'https://placehold.co/200';
            const availableStock = item.product?.stock !== undefined ? Number(item.product.stock) : item.stock;

            return (
              <div key={item._id || pId || idx} className="bg-white dark:bg-gray-800 rounded-3xl border border-black/5 dark:border-white/10 p-4 sm:p-6 flex items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-4">
                  <img 
                    src={img} 
                    alt={title} 
                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/200'; }}
                    className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-black/5 dark:border-white/10" 
                  />
                  <div className="space-y-1">
                    <h3 className="text-xs sm:text-sm font-black uppercase line-clamp-1">{title}</h3>
                    <p className="text-sm font-black text-[#E89A5B] font-mono">
                      ${formatPrice ? formatPrice(price) : price.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* أزرار زيادة ونقص الكمية */}
                  <div className="flex items-center border border-black/10 dark:border-white/10 rounded-xl overflow-hidden bg-slate-50 dark:bg-gray-900">
                    <button
                      type="button"
                      onClick={() => {
                        if (item.quantity > 1) {
                          updateQuantityGlobal(pId, item.quantity - 1);
                        } else {
                          removeFromCartGlobal(pId);
                        }
                      }}
                      className="px-3 py-1.5 font-bold hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-black font-mono">{item.quantity}</span>
                    <button
                      type="button"
                      disabled={availableStock !== undefined && item.quantity >= availableStock}
                      onClick={() => updateQuantityGlobal(pId, item.quantity + 1)}
                      className="px-3 py-1.5 font-bold hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>

                  {/* زر حذف السلعة نهائياً */}
                  <button
                    type="button"
                    onClick={() => removeFromCartGlobal(pId)}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                    title={t('common.remove', 'Remove')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ملخص الطلب والكوبونات والـ Checkout */}
        <div className="space-y-6 sticky top-6">
          
          {/* صندوق تطبيق الكوبون */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-black/5 dark:border-white/10 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-gray-200">
              <Tag className="w-4 h-4 text-[#E89A5B]" />
              <span>{t('store.cart.coupon_code', 'Coupon / Promo Code')}</span>
            </div>

            {couponApplied || discountAmount > 0 ? (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  ✓ {couponApplied || 'COUPON'} ({t('store.cart.applied', 'Applied')})
                </span>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  disabled={couponLoading}
                  className="p-1 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition cursor-pointer disabled:opacity-50"
                  title={t('common.remove', 'Remove')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder={t('store.cart.enter_coupon', 'Enter coupon code')}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-gray-900 border border-black/10 dark:border-white/10 text-xs font-mono font-bold uppercase outline-none focus:border-[#E89A5B] text-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={couponLoading || !couponCode.trim()}
                  className="px-5 py-2.5 bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] rounded-xl text-xs font-black uppercase tracking-wider hover:opacity-90 transition cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {couponLoading ? '...' : t('store.cart.apply', 'Apply')}
                </button>
              </form>
            )}
          </div>

          {/* بطاقة ملخص الحساب */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-black/5 dark:border-white/10 p-6 sm:p-8 space-y-6 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-wider border-b border-black/5 dark:border-white/10 pb-4">
              {t('store.cart.order_summary', 'Order Summary')}
            </h3>

            <div className="space-y-3 text-xs font-medium">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-gray-400">{t('store.cart.subtotal', 'Subtotal')}</span>
                <span className="font-mono font-bold">${formatPrice ? formatPrice(subtotal) : subtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>{t('store.cart.discount', 'Coupon Discount')}</span>
                  <span className="font-mono">-${formatPrice ? formatPrice(discountAmount) : discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-gray-400">{t('store.cart.shipping', 'Shipping')}</span>
                <span className="font-bold text-emerald-500">
                  {remainingForFreeShipping === 0 ? t('store.cart.free', 'FREE') : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>

              <div className="pt-3 border-t border-black/5 dark:border-white/10 flex justify-between text-sm font-black">
                <span>{t('store.cart.total', 'Total')}</span>
                <span className="font-mono text-[#E89A5B]">${formatPrice ? formatPrice(finalTotal) : finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleProceedToCheckout}
              className="w-full py-4 rounded-2xl bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] text-xs font-black uppercase tracking-wider transition hover:opacity-90 flex items-center justify-center gap-2 shadow-xl cursor-pointer"
            >
              <span>{t('store.cart.proceed_checkout', 'Proceed to Checkout')}</span>
              {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}