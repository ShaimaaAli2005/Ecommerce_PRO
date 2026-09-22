import React from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../../../../context/CartContext';

export default function CartItemRow({ item }) {
  const { t } = useTranslation();
  const { updateQuantityGlobal, removeFromCartGlobal } = useCart();
  
  const pId = item.product || item._id;
  const name = item.name || t('store.cart_item.default_name', 'Product');
  const price = Number(item.price) || 0;
  const quantity = Number(item.quantity) || 1;
  const image = item.image || 'https://placehold.co/200?text=LUMA';

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 shadow-xs transition-all duration-200 hover:shadow-md">
      
      {/* تفاصيل المنتج والصورة */}
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-50 dark:bg-gray-900 shrink-0 border border-slate-100 dark:border-gray-700">
          <img src={image} alt={name} className="w-full h-full object-cover" loading="lazy" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{name}</h3>
          <span className="text-xs font-mono text-slate-500 dark:text-gray-400 mt-1 block">${price.toFixed(2)}</span>
        </div>
      </div>

      {/* أدوات التحكم والكميات */}
      <div className="flex items-center justify-between w-full sm:w-auto gap-6">
        
        {/* أزرار التحكم بالكمية */}
        <div className="flex items-center border border-slate-200 dark:border-gray-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-gray-900">
          <button
            type="button"
            onClick={() => updateQuantityGlobal(pId, quantity - 1)}
            className="p-2.5 hover:bg-slate-200 dark:hover:bg-gray-800 transition cursor-pointer"
            aria-label="Decrease quantity"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="px-4 text-xs font-bold font-mono">{quantity}</span>
          <button
            type="button"
            onClick={() => updateQuantityGlobal(pId, quantity + 1)}
            className="p-2.5 hover:bg-slate-200 dark:hover:bg-gray-800 transition cursor-pointer"
            aria-label="Increase quantity"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* السعر الإجمالي للعنصر */}
        <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
          ${(price * quantity).toFixed(2)}
        </span>

        {/* زر الحذف */}
        <button
          type="button"
          onClick={() => removeFromCartGlobal(pId)}
          className="p-2.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition cursor-pointer"
          title={t('store.cart_item.remove_tooltip', 'Remove')}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
    </div>
  );
}