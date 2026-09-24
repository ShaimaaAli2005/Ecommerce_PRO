import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  Menu, 
  X, 
  Package, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ArrowLeft
} from "lucide-react";
import { useSettings } from "../../context/SettingsContext";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";

export default function StoreNavbar() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || "en";
  const isRtl = currentLang.startsWith("ar");

  const { currencyLabel, formatPrice } = useSettings();
  const { wishlistIds } = useWishlist(); 
  const { cart, updateQuantityGlobal, removeFromCartGlobal } = useCart();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const cartItems = cart.items || [];

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#FDFBF7]/90 dark:bg-[#0B132B]/90 border-b border-black/5 dark:border-white/10 transition-colors shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* الشعار والقائمة للجوال */}
          <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-2xl bg-[#0B132B] dark:bg-white text-white dark:text-[#0B132B] flex items-center justify-center font-black text-xl shadow-md transition-transform group-hover:scale-105">
                L
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-widest uppercase">LUMA</span>
                <span className="text-[9px] tracking-widest text-[#E89A5B] font-bold uppercase">{t("store.brand_subtitle", "Curated Luxury")}</span>
              </div>
            </Link>
          </div>

          {/* روابط التنقل الرئيسية لسطح المكتب */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-black uppercase tracking-widest">
            <NavLink 
              to="/" 
              className={({ isActive }) => `transition-colors hover:text-[#E89A5B] ${isActive ? 'text-[#E89A5B]' : 'text-slate-600 dark:text-slate-300'}`}
            >
              {t("store.nav.discover", "Discover")}
            </NavLink>

            <NavLink 
              to="/products" 
              className={({ isActive }) => `transition-colors hover:text-[#E89A5B] ${isActive ? 'text-[#E89A5B]' : 'text-slate-600 dark:text-slate-300'}`}
            >
              {t("store.nav.collections", "Collections")}
            </NavLink>

            <NavLink 
              to="/my-orders" 
              className={({ isActive }) => `transition-colors hover:text-[#E89A5B] flex items-center gap-1.5 ${isActive ? 'text-[#E89A5B]' : 'text-slate-600 dark:text-slate-300'}`}
            >
              <Package className="w-3.5 h-3.5 text-[#E89A5B]" />
              <span>{t("store.nav.orders", "My Orders")}</span>
            </NavLink>
          </nav>

          {/* عناصر البحث والمفضلة وسلة الشراء */}
          <div className="flex items-center gap-2 sm:gap-3">
            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative w-40 lg:w-56">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("store.search_placeholder", "Search luxury items...")}
                className="w-full py-2.5 pe-4 ps-10 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-xs font-bold outline-none focus:border-[#E89A5B] transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </form>

            {/* زر المفضلة */}
            <Link 
              to="/wishlist" 
              className="p-2.5 rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors relative cursor-pointer"
              title={t("store.nav.wishlist", "Wishlist")}
            >
              <Heart className="w-4 h-4" />
              {wishlistIds.length > 0 && (
                <span className="absolute -top-1 -end-1 w-4 h-4 bg-[#E89A5B] text-[#0B132B] text-[10px] font-black rounded-full flex items-center justify-center shadow-md">
                  {wishlistIds.length}
                </span>
              )}
            </Link>

            {/* زر سلة التسوق (Drawer Trigger) */}
            <button 
              type="button"
              onClick={() => setCartDrawerOpen(true)}
              className="px-4 py-2.5 rounded-full bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] hover:opacity-90 transition-all flex items-center gap-2 text-xs font-black shadow-lg relative cursor-pointer"
              title={t("store.nav.cart", "Shopping Bag")}
            >
              <ShoppingBag className="w-4 h-4 text-[#E89A5B] dark:text-[#0B132B]" />
              <span className="hidden sm:inline font-mono">{currencyLabel} {formatPrice(cart.total || 0)}</span>
              {cart.itemCount > 0 && (
                <span className="absolute -top-1.5 -end-1.5 w-5 h-5 bg-[#E89A5B] dark:bg-[#0B132B] text-[#0B132B] dark:text-[#E89A5B] text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#FDFBF7] dark:border-[#0B132B]">
                  {cart.itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* القائمة المنسدلة لشاشات الموبايل */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full start-0 w-full bg-[#FDFBF7] dark:bg-[#0B132B] border-b border-black/5 dark:border-white/10 p-6 space-y-4 shadow-2xl animate-fadeIn">
            <form onSubmit={handleSearchSubmit} className="flex items-center relative w-full mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("store.search_placeholder", "Search luxury items...")}
                className="w-full py-3 pe-4 ps-10 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-xs font-bold outline-none focus:border-[#E89A5B]"
              />
              <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </form>
            <div className="flex flex-col space-y-3 text-xs font-black uppercase tracking-wider">
              <Link 
                to="/" 
                onClick={() => setMobileMenuOpen(false)} 
                className="p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition"
              >
                {t("store.nav.discover", "Discover")}
              </Link>
              <Link 
                to="/products" 
                onClick={() => setMobileMenuOpen(false)} 
                className="p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition"
              >
                {t("store.nav.collections", "Collections")}
              </Link>
              <Link 
                to="/my-orders" 
                onClick={() => setMobileMenuOpen(false)} 
                className="p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl flex items-center gap-2 transition"
              >
                <Package className="w-4 h-4 text-[#E89A5B]" />
                <span>{t("store.nav.orders", "My Orders")}</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Cart Drawer الجانبي */}
      {cartDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
            onClick={() => setCartDrawerOpen(false)} 
          />
          <div className={`absolute inset-y-0 ${isRtl ? "left-0" : "right-0"} max-w-full flex ${isRtl ? "pr-10" : "pl-10"}`}>
            <div className="w-screen max-w-md bg-[#FDFBF7] dark:bg-[#0B132B] shadow-2xl flex flex-col border-s border-black/5 dark:border-white/10">
              
              <div className="p-6 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#E89A5B]" />
                  <h3 className="font-black text-sm uppercase tracking-wider">{t("store.cart.title", "Shopping Bag")}</h3>
                  <span className="text-xs bg-[#E89A5B]/10 text-[#E89A5B] px-2.5 py-0.5 rounded-full font-bold">
                    {cart.itemCount}
                  </span>
                </div>
                <button 
                  type="button"
                  onClick={() => setCartDrawerOpen(false)} 
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="text-center py-20 space-y-3">
                    <ShoppingBag className="w-12 h-12 mx-auto text-slate-400 opacity-40" />
                    <p className="text-xs font-bold text-slate-400">{t("store.cart.empty", "Your cart is empty")}</p>
                  </div>
                ) : (
                  cartItems.map((item, idx) => {
                    const rawProd = item.product;
                    const pId = item._uniqueKey || ((typeof rawProd === 'object' && rawProd !== null) ? (rawProd._id || rawProd.id) : (rawProd || item._id || item.id || idx));
                    return (
                      <div key={pId} className="flex gap-4 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 items-center">
                        <img 
                          src={item.image || "https://placehold.co/100"} 
                          alt={item.name} 
                          onError={(e) => { e.currentTarget.src = "https://placehold.co/100"; }}
                          className="w-16 h-16 object-cover rounded-xl border border-black/10 dark:border-white/10" 
                        />
                        <div className="flex-1">
                          <h4 className="font-bold text-xs line-clamp-1">{item.name}</h4>
                          <p className="text-xs font-mono font-black text-[#E89A5B] mt-1">
                            {currencyLabel} {formatPrice(item.price || 0)}
                          </p>
                          <div className="flex items-center gap-3 mt-3">
                            <div className="flex items-center border border-black/10 dark:border-white/10 rounded-lg overflow-hidden bg-white dark:bg-[#0B132B]">
                              <button 
                                type="button"
                                onClick={() => updateQuantityGlobal(pId, item.quantity - 1)} 
                                className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-3 text-xs font-mono font-black">{item.quantity}</span>
                              <button 
                                type="button"
                                onClick={() => updateQuantityGlobal(pId, item.quantity + 1)} 
                                className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <button 
                              type="button"
                              onClick={() => removeFromCartGlobal(pId)} 
                              className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Remove"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="p-6 border-t border-black/5 dark:border-white/10 space-y-4 bg-black/5 dark:bg-white/5">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span>{t("store.cart_page.subtotal", "Subtotal")}:</span>
                    <span className="font-mono text-base font-black text-[#E89A5B]">
                      {currencyLabel} {formatPrice(cart.subtotal || 0)}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <Link
                      to="/cart"
                      onClick={() => setCartDrawerOpen(false)}
                      className="flex-1 py-3 px-4 rounded-xl border border-black/10 dark:border-white/10 text-center text-xs font-black uppercase tracking-wider hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
                    >
                      {t("store.cart.view_cart", "View Bag")}
                    </Link>
                    <Link
                      to="/checkout"
                      onClick={() => setCartDrawerOpen(false)}
                      className="flex-1 py-3 px-4 rounded-xl bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] text-center text-xs font-black uppercase tracking-wider hover:opacity-90 transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>{t("store.cart.checkout", "Checkout")}</span>
                      {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}