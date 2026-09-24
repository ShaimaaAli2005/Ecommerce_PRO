import React from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../../../../context/CartContext';
import { useSettings } from '../../../../context/SettingsContext';

// دالة مساعدة لاستخراج رابط الصورة بأمان
const resolveItemImage = (item) => {
  if (!item) return 'https://placehold.co/200?text=LUMA';
  if (typeof item.image === 'string' && item.image) return item.image;
  if (item.product && typeof item.product === 'object') {
    if (Array.isArray(item.product.images) && item.product.images.length > 0) {
      const first = item.product.images[0];
      return typeof first === 'string' ? first : first?.url || 'https://placehold.co/200?text=LUMA';
    }
    if (item.product.image) return item.product.image;
    if (item.product.imageUrl) return item.product.imageUrl;
  }
  return 'https://placehold.co/200?text=LUMA';
};

export default function CartItemRow({ item }) {
  const { t } = useTranslation();
  const { formatPrice } = useSettings();
  const { updateQuantityGlobal, removeFromCartGlobal } = useCart();
  
  if (!item) return null;

  // استخراج معرّف المنتج الحقيقي بدقة تامة ليتوافق مع API السلة
  const pId = String(item.product?._id || item.product || item.productId || item._id || '').trim();
  const name = item.name || item.product?.name || t('store.cart_item.default_name', 'Product');
  const price = Number(item.price || item.product?.price || 0);
  const quantity = Number(item.quantity) || 1;
  const image = resolveItemImage(item);

  // فحص المخزون المتاح
  const availableStock = item.product?.stock !== undefined ? Number(item.product.stock) : item.stock;

  const handleDecrease = () => {
    if (quantity > 1) {
      updateQuantityGlobal(pId, quantity - 1);
    } else {
      removeFromCartGlobal(pId);
    }
  };

  const handleIncrease = () => {
    if (availableStock !== undefined && quantity >= availableStock) {
      return; // الوصول إلى الحد الأقصى للمخزون
    }
    updateQuantityGlobal(pId, quantity + 1);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 shadow-xs transition-all duration-200 hover:shadow-md font-['Poppins']">
      
      {/* تفاصيل المنتج والصورة */}
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-50 dark:bg-gray-900 shrink-0 border border-slate-100 dark:border-gray-700 relative">
          <img 
            src={image} 
            alt={name} 
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://placehold.co/200?text=LUMA';
            }}
            className="w-full h-full object-cover" 
            loading="lazy" 
          />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1" title={name}>
            {name}
          </h3>
          <span className="text-xs font-mono font-bold text-[#E89A5B] block">
            ${formatPrice ? formatPrice(price) : price.toFixed(2)}
          </span>
        </div>
      </div>

      {/* أدوات التحكم والكميات */}
      <div className="flex items-center justify-between w-full sm:w-auto gap-6">
        
        {/* أزرار التحكم بالكمية */}
        <div className="flex items-center border border-slate-200 dark:border-gray-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-gray-900">
          <button
            type="button"
            onClick={handleDecrease}
            className="p-2.5 hover:bg-slate-200 dark:hover:bg-gray-800 transition cursor-pointer text-slate-600 dark:text-gray-300"
            aria-label="Decrease quantity"
            title={quantity === 1 ? t('common.remove', 'Remove') : t('store.cart.decrease', 'Decrease')}
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          
          <span className="px-4 text-xs font-bold font-mono text-slate-900 dark:text-white">
            {quantity}
          </span>
          
          <button
            type="button"
            onClick={handleIncrease}
            disabled={availableStock !== undefined && quantity >= availableStock}
            className="p-2.5 hover:bg-slate-200 dark:hover:bg-gray-800 transition cursor-pointer text-slate-600 dark:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Increase quantity"
            title={t('store.cart.increase', 'Increase')}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* السعر الإجمالي للعنصر */}
        <span className="text-sm font-black font-mono text-slate-900 dark:text-white min-w-[70px] text-end">
          ${formatPrice ? formatPrice(price * quantity) : (price * quantity).toFixed(2)}
        </span>

        {/* زر الحذف الفوري */}
        <button
          type="button"
          onClick={() => removeFromCartGlobal(pId)}
          className="p-2.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition cursor-pointer"
          title={t('store.cart_item.remove_tooltip', 'Remove item')}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
    </div>
  );
}