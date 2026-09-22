import React from 'react';
import { useTranslation } from 'react-i18next';
import { Truck } from 'lucide-react';

export default function ShippingAddressForm({ formData, onChange, isRtl }) {
  const { t } = useTranslation();

  return (
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
            onChange={onChange}
            required
            placeholder="John Doe"
            className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:border-[#E89A5B] text-slate-900 dark:text-white transition"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-bold text-slate-700 dark:text-gray-300">{t('store.checkout.phone', 'Phone Number *')}</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={onChange}
            required
            placeholder="+201234567890"
            className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:border-[#E89A5B] text-slate-900 dark:text-white font-mono transition"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-bold text-slate-700 dark:text-gray-300">{t('store.checkout.country', 'Country *')}</label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={onChange}
            required
            className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:border-[#E89A5B] text-slate-900 dark:text-white transition"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-bold text-slate-700 dark:text-gray-300">{t('store.checkout.city', 'City *')}</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={onChange}
            required
            placeholder="Cairo"
            className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:border-[#E89A5B] text-slate-900 dark:text-white transition"
          />
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <label className="font-bold text-slate-700 dark:text-gray-300">{t('store.checkout.address', 'Street Address *')}</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={onChange}
            required
            placeholder="123 Main Street, Apt 4"
            className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:border-[#E89A5B] text-slate-900 dark:text-white transition"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-bold text-slate-700 dark:text-gray-300">{t('store.checkout.postal_code', 'Postal Code')}</label>
          <input
            type="text"
            name="postalCode"
            value={formData.postalCode}
            onChange={onChange}
            placeholder="11511"
            className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:border-[#E89A5B] text-slate-900 dark:text-white font-mono transition"
          />
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <label className="font-bold text-slate-700 dark:text-gray-300">{t('store.checkout.note', 'Order Notes (Optional)')}</label>
          <textarea
            name="customerNote"
            value={formData.customerNote}
            onChange={onChange}
            rows="2"
            placeholder="Please call before delivery..."
            className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:border-[#E89A5B] text-slate-900 dark:text-white resize-none transition"
          />
        </div>
      </div>
    </div>
  );
}