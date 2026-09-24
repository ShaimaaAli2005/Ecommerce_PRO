import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CreditCard } from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import orderService from '../../../services/orderService';
import toast from 'react-hot-toast';

// استيراد المكونات الفرعية المقسمة
import ShippingAddressForm from '../checkout/components/ShippingAddressForm';
import OrdersSummaryCard from '../checkout/components/OrderSummaryCard';

export default function CheckoutPage() {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || 'ar').startsWith('ar');
  const navigate = useNavigate();
  const { cart, fetchCart, clearCart } = useCart();

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
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    // 1. التحقق من حقول الشحن الأساسية
    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.city.trim() || !formData.address.trim()) {
      toast.error(isRtl ? 'يرجى ملء جميع حقول عنوان الشحن الأساسية' : 'Please fill in all required shipping address fields');
      return;
    }

    // 2. التحقق من وجود عناصر في السلة
    if (!cart?.items || cart.items.length === 0) {
      toast.error(isRtl ? 'سلة المشتريات فارغة' : 'Your cart is empty');
      navigate('/cart');
      return;
    }

    try {
      setLoading(true);

      // تجهيز البيانات وفق توثيق السيرفر السحابي
      const orderPayload = {
        shippingAddress: {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          country: formData.country.trim(),
          city: formData.city.trim(),
          address: formData.address.trim(),
          postalCode: (formData.postalCode || '11511').trim()
        },
        paymentMethod: formData.paymentMethod,
        customerNote: formData.customerNote?.trim() || ''
      };

      const response = await orderService.createOrder(orderPayload);

      if (response && (response.success || response.order)) {
        toast.success(isRtl ? 'تم إنشاء الطلب بنجاح!' : 'Order created successfully!');

        // تفريغ السلة وتحديث عداد المتجر
        if (typeof clearCart === 'function') {
          await clearCart();
        } else if (typeof fetchCart === 'function') {
          await fetchCart(true);
        }

        // التوجيه لصفحة تأكيد الطلب مع تمرير بيانات الطلب
        navigate('/order-success', { 
          state: { order: response.order || response } 
        });
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
        
        {/* الترويسة العليا */}
        <div className="border-b border-slate-200 dark:border-gray-800 pb-6">
          <h1 className="text-2xl sm:text-3xl font-bold font-['Poppins'] text-[#17233C] dark:text-white tracking-tight">
            {t('store.checkout.title', 'Checkout & Shipping')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-1">
            {t('store.checkout.subtitle', 'Complete your shipping address and payment method to place the order.')}
          </p>
        </div>

        {/* نموذج الطلب الرئيسي */}
        <form id="checkout-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* العمود الرئيسي: تفاصيل الشحن وطريقة الدفع */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. مكون عنوان الشحن */}
            <ShippingAddressForm 
              formData={formData} 
              onChange={handleChange} 
              isRtl={isRtl} 
            />

            {/* 2. بطاقة اختيار طريقة الدفع */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-slate-200 dark:border-gray-700 p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-gray-700 pb-4">
                <CreditCard className="w-5 h-5 text-[#E89A5B]" />
                <h2 className="text-base font-bold font-['Poppins'] text-slate-900 dark:text-white">
                  {t('store.checkout.payment_method', 'Payment Method')}
                </h2>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-3 p-4 rounded-2xl border-2 border-[#E89A5B] bg-amber-50/50 dark:bg-amber-950/20 cursor-pointer flex-1 text-xs font-bold transition">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={formData.paymentMethod === 'cash'}
                    onChange={handleChange}
                    className="accent-[#E89A5B] w-4 h-4 cursor-pointer"
                  />
                  <span>{t('store.checkout.cash_on_delivery', 'Cash on Delivery (COD)')}</span>
                </label>
              </div>
            </div>

          </div>

          {/* العمود الجانبي: ملخص السلة وزر التأكيد */}
          <OrdersSummaryCard 
            cart={cart} 
            loading={loading} 
            isRtl={isRtl} 
            formId="checkout-form"
            onSubmit={handleSubmit}
          />

        </form>

      </div>
    </div>
  );
}