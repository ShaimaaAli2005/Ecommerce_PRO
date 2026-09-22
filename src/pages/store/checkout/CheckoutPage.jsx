import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Truck, CreditCard, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import orderService from '../../../services/orderService';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || 'ar').startsWith('ar');
  const navigate = useNavigate();
  const { cart, fetchCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    country: 'Egypt',
    city: '',
    address: '',
    postalCode: '',
    paymentMethod: 'cash',
    customerNote: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.city || !formData.address) {
      toast.error(isRtl ? 'يرجى ملء جميع حقول عنوان الشحن الأساسية' : 'Please fill in all required shipping address fields');
      return;
    }

    if (!cart.items || cart.items.length === 0) {
      toast.error(isRtl ? 'سلة المشتريات فارغة' : 'Your cart is empty');
      navigate('/cart');
      return;
    }

    try {
      setLoading(true);
      const orderPayload = {
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          country: formData.country,
          city: formData.city,
          address: formData.address,
          postalCode: formData.postalCode || '11511'
        },
        paymentMethod: formData.paymentMethod,
        customerNote: formData.customerNote
      };

      const response = await orderService.createOrder(orderPayload);
      if (response && response.success) {
        toast.success(isRtl ? 'تم إنشاء الطلب بنجاح!' : 'Order created successfully!');
        await fetchCart(true); // تحديث السلة لتصبح فارغة
        navigate('/order-success', { state: { order: response.order } });
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message || (isRtl ? 'فشل إنشاء الطلب، تأكد من بيانات السلة أو المخزون' : 'Failed to create order');
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] dark:bg-[#0F172A] text-slate-900 dark:text-white py-10 px-4 sm:px-6 lg:px-8 font-['Inter'] transition-colors duration-300" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* الترويسة */}
        <div className="border-b border-slate-200 dark:border-gray-800 pb-6">
          <h1 className="text-2xl sm:text-3xl font-bold font-['Poppins'] text-[#17233C] dark:text-white">
            {t('store.checkout.title', 'Checkout & Shipping')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-1">
            {t('store.checkout.subtitle', 'Complete your shipping address and payment method to place the order.')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* نموذج بيانات الشحن والدفع (يمتد لعمودين) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* عنوان الشحن */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-slate-200 dark:border-gray-700 p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-gray-700 pb-4">
                <Truck className="w-5 h-5 text-[#E89A5B]" />
                <h2 className="text-base font-bold font-['Poppins'] text-slate-900 dark:text-white">
                  {t('store.checkout.shipping_address', 'Shipping Address')}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-gray-300">{t('store.checkout.fullname', 'Full Name *')}</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:border-[#E89A5B] text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-gray-300">{t('store.checkout.phone', 'Phone Number *')}</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="+201234567890"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:border-[#E89A5B] text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-gray-300">{t('store.checkout.country', 'Country *')}</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:border-[#E89A5B] text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-gray-300">{t('store.checkout.city', 'City *')}</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    placeholder="Cairo"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:border-[#E89A5B] text-slate-900 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-gray-300">{t('store.checkout.address', 'Street Address *')}</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    placeholder="123 Main Street, Apt 4"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:border-[#E89A5B] text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-gray-300">{t('store.checkout.postal_code', 'Postal Code')}</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="11511"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:border-[#E89A5B] text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-gray-300">{t('store.checkout.note', 'Order Notes (Optional)')}</label>
                  <textarea
                    name="customerNote"
                    value={formData.customerNote}
                    onChange={handleChange}
                    rows="2"
                    placeholder="Please call before delivery..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:border-[#E89A5B] text-slate-900 dark:text-white resize-none"
                  />
                </div>
              </div>
            </div>

            {/* طريقة الدفع */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-slate-200 dark:border-gray-700 p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-gray-700 pb-4">
                <CreditCard className="w-5 h-5 text-[#E89A5B]" />
                <h2 className="text-base font-bold font-['Poppins'] text-slate-900 dark:text-white">
                  {t('store.checkout.payment_method', 'Payment Method')}
                </h2>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-3 p-4 rounded-2xl border-2 border-[#E89A5B] bg-amber-50/50 dark:bg-amber-950/20 cursor-pointer flex-1 text-xs font-bold">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={formData.paymentMethod === 'cash'}
                    onChange={handleChange}
                    className="accent-[#E89A5B] w-4 h-4"
                  />
                  <span>{t('store.checkout.cash_on_delivery', 'Cash on Delivery (COD)')}</span>
                </label>
              </div>
            </div>

          </div>

          {/* ملخص السلة وإتمام الطلب */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-slate-200 dark:border-gray-700 p-6 space-y-6 shadow-xs sticky top-28">
            <h3 className="text-base font-bold font-['Poppins'] text-slate-900 dark:text-white border-b border-slate-100 dark:border-gray-700 pb-4">
              {t('store.checkout.order_summary', 'Order Summary')}
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.items?.map((item, idx) => (
                <div key={item._id || idx} className="flex justify-between items-center text-xs text-slate-600 dark:text-gray-400">
                  <span className="line-clamp-1 flex-1">{item.name || 'Product'} × {item.quantity}</span>
                  <span className="font-mono font-bold">${(Number(item.price || 0) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 text-xs pt-4 border-t border-slate-100 dark:border-gray-700">
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

            <button
              type="submit"
              disabled={loading || !cart.items || cart.items.length === 0}
              className="w-full py-3.5 px-6 rounded-xl bg-[#17233C] dark:bg-[#E89A5B] hover:opacity-90 text-white text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-xl cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? (isRtl ? 'جاري إتمام الطلب...' : 'Placing Order...') : (isRtl ? 'تأكيد وإتمام الطلب' : 'Place Order')}</span>
              {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 dark:text-gray-500 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>{t('store.checkout.secure_checkout', 'Secure SSL Checkout & Guaranteed Delivery')}</span>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}