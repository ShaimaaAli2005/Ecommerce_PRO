import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import CartItemRow from './components/CartItemRow';
import CouponForm from './components/CouponForm';

export default function CartPage() {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || 'ar').startsWith('ar');
  const { cart, clearCartGlobal } = useCart();
  const items = cart.items || [];

  return (
    <div className="min-h-screen bg-[#F7F5F0] dark:bg-[#0F172A] text-slate-900 dark:text-white py-10 px-4 sm:px-6 lg:px-8 font-['Inter'] transition-colors duration-300" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* الترويسة */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-gray-800 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-['Poppins'] text-[#17233C] dark:text-white">
              {t('store.cart_page.title', 'Shopping Cart')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-1">
              {t('store.cart_page.items_count', { count: cart.itemCount })}
            </p>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={clearCartGlobal}
              className="px-3 py-2 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl text-xs font-semibold transition cursor-pointer self-start md:self-auto"
            >
              {t('store.cart_page.clear_cart', 'Clear Cart')}
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-slate-200/80 dark:border-gray-700 p-12 text-center max-w-md mx-auto shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/40 text-[#E89A5B] flex items-center justify-center mx-auto text-2xl font-bold">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-['Poppins']">
              {t('store.cart_page.empty_title', 'Your shopping cart is empty')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
              {t('store.cart_page.empty_desc', 'Explore our luxury product catalog and add your favorites to the cart.')}
            </p>
            <Link
              to="/products"
              className="inline-block px-6 py-3 bg-[#17233C] hover:bg-[#E89A5B] dark:bg-[#E89A5B] dark:hover:bg-[#d4894d] text-white text-xs font-semibold rounded-xl transition shadow-xs cursor-pointer"
            >
              {t('store.cart_page.explore_catalog', 'Explore Catalog')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* قائمة المنتجات */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <CartItemRow key={item._id || item.product} item={item} />
              ))}
            </div>

            {/* ملخص الطلب والفواتير */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-slate-200 dark:border-gray-700 p-6 space-y-6 shadow-xs">
              <h3 className="text-base font-bold font-['Poppins'] text-slate-900 dark:text-white border-b border-slate-100 dark:border-gray-700 pb-4">
                {t('store.cart_page.order_summary', 'Order Summary')}
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-gray-400">
                  <span>{t('store.cart_page.subtotal', 'Subtotal')}</span>
                  <span className="font-mono font-bold">${Number(cart.subtotal || 0).toFixed(2)}</span>
                </div>
                {cart.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>{t('store.cart_page.discount', 'Discount')}</span>
                    <span className="font-mono">-${Number(cart.discountAmount || 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-900 dark:text-white text-sm font-bold pt-3 border-t border-slate-100 dark:border-gray-700">
                  <span>{t('store.cart_page.total', 'Total')}</span>
                  <span className="font-mono text-base text-[#E89A5B]">${Number(cart.total || 0).toFixed(2)}</span>
                </div>
              </div>

              <CouponForm />

              <Link
                to="/checkout"
                className="w-full py-3.5 px-6 rounded-xl bg-[#17233C] dark:bg-[#E89A5B] hover:opacity-90 text-white text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-xl cursor-pointer text-center block"
              >
                <span>{t('store.cart_page.checkout_btn', 'Proceed to Checkout')}</span>
                {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </Link>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}