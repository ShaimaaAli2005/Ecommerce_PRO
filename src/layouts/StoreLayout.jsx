import React, { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  User, 
  Menu, 
  X, 
  Globe, 
  Sparkles,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Sun,
  Moon,
  Package,
  LogIn,
  LogOut,
  Mail,
  ShieldCheck,
  Truck
} from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

export const StoreLayout = () => {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || "ar").startsWith("ar");
  const { currencyLabel, theme, toggleTheme } = useSettings();
  const { wishlistIds } = useWishlist(); 
  const { cart, updateQuantityGlobal, removeFromCartGlobal } = useCart();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const isAuthenticated = Boolean(localStorage.getItem("token"));

  const toggleLanguage = () => {
    const newLang = isRtl ? "en" : "ar";
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success(isRtl ? "تم تسجيل الخروج بنجاح" : "Logged out successfully");
    navigate("/");
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      toast.error(isRtl ? "يرجى إدخال بريد إلكتروني صالح" : "Please enter a valid email");
      return;
    }
    toast.success(isRtl ? "تم الاشتراك في النشرة البريدية بنجاح!" : "Successfully subscribed to newsletter!");
    setNewsletterEmail("");
  };

  const cartItems = cart.items || [];

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0B132B] text-[#0B132B] dark:text-slate-100 flex flex-col font-['Poppins',sans-serif] transition-colors duration-300 selection:bg-[#E89A5B]/20 selection:text-[#0B132B]" dir={isRtl ? "rtl" : "ltr"}>
      
      {/* ─── الشريط العلوي: تثبيت أزرار اللغة والدارك مود وأزرار المصادقة (بروفايل / تسجيل دخول / خروج) في أقصى اليمين دائماً ─── */}
      <div className="bg-[#070D1F] text-slate-300 px-4 sm:px-8 py-2 text-[11px] font-bold border-b border-white/5 flex items-center justify-between z-50" dir="ltr">
        <div className="w-1/4 hidden sm:block"></div>
        
        <div className="flex-1 text-center text-[#E89A5B] flex items-center justify-center gap-1.5 truncate px-2" dir={isRtl ? "rtl" : "ltr"}>
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{t("store.announcement", "Free Express Shipping Worldwide on Orders Over $200")}</span>
        </div>

        {/* مجموعة الأزرار الثابتة في أقصى اليمين (الدارك مود، اللغة، وتليها أزرار المصادقة) */}
        <div className="w-1/3 flex items-center justify-end gap-2">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 transition text-white cursor-pointer shrink-0"
            title="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-[#E89A5B]" /> : <Moon className="w-3.5 h-3.5 text-slate-300" />}
            <span className="text-[10px] uppercase">{theme === "dark" ? "Light" : "Dark"}</span>
          </button>

          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 transition text-white cursor-pointer shrink-0"
            title="Change Language"
          >
            <Globe className="w-3.5 h-3.5 text-[#E89A5B]" />
            <span className="text-[10px] uppercase">{i18n.language === "ar" ? "EN" : "AR"}</span>
          </button>

          {/* أزرار الحساب (بروفايل / دخول / خروج) ثابتة هنا بجوارهم مباشرة */}
          {isAuthenticated ? (
            <div className="flex items-center gap-1.5 ms-1">
              <Link 
                to="/profile" 
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white transition flex items-center justify-center"
                title={t("store.nav.profile", "Profile")}
              >
                <User className="w-3.5 h-3.5 text-[#E89A5B]" />
              </Link>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 transition flex items-center justify-center cursor-pointer"
                title={t("store.nav.logout", "Logout")}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#E89A5B] text-[#0B132B] hover:opacity-90 transition text-[10px] font-black uppercase shrink-0 ms-1"
            >
              <LogIn className="w-3 h-3" />
              <span>{t("store.nav.login", "Login")}</span>
            </Link>
          )}
        </div>
      </div>

      {/* شريط التنقل الرئيسي (Navbar) بمحاذاة وعرض دقيق */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#FDFBF7]/90 dark:bg-[#0B132B]/90 border-b border-black/5 dark:border-white/10 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-[#0B132B] dark:bg-white text-white dark:text-[#0B132B] flex items-center justify-center font-black text-xl shadow-lg transition-transform group-hover:scale-105">
                L
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-widest uppercase">LUMA</span>
                <span className="text-[9px] tracking-widest text-[#E89A5B] font-bold uppercase">{t("store.brand_subtitle", "Curated Luxury")}</span>
              </div>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-wider">
            <Link to="/" className="hover:text-[#E89A5B] transition-colors">{t("store.nav.home", "Home")}</Link>
            <Link to="/products" className="hover:text-[#E89A5B] transition-colors">{t("store.nav.catalog", "Catalog")}</Link>
            <Link to="/my-orders" className="hover:text-[#E89A5B] transition-colors flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-[#E89A5B]" />
              <span>{t("store.nav.orders", "My Orders")}</span>
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative w-44 lg:w-56">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("store.search_placeholder", "Search luxury items...")}
                className="w-full py-2 pe-4 ps-9 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-xs font-bold outline-none focus:border-[#E89A5B] transition-all"
              />
              <Search className="w-3.5 h-3.5 text-secondary-muted absolute start-3 top-1/2 -translate-y-1/2" />
            </form>

            <Link 
              to="/wishlist" 
              className="p-2.5 rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors relative"
              title={t("store.nav.wishlist", "Wishlist")}
            >
              <Heart className="w-4 h-4" />
              {wishlistIds.length > 0 && (
                <span className="absolute -top-1 -end-1 w-4 h-4 bg-[#E89A5B] text-[#0B132B] text-[10px] font-black rounded-full flex items-center justify-center shadow-md">
                  {wishlistIds.length}
                </span>
              )}
            </Link>

            <button 
              onClick={() => setCartDrawerOpen(true)}
              className="px-3.5 py-2.5 rounded-full bg-[#0B132B] dark:bg-white text-white dark:text-[#0B132B] hover:brightness-125 transition-all flex items-center gap-2 text-xs font-black shadow-lg relative cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-[#E89A5B]" />
              <span className="hidden sm:inline">{currencyLabel}</span>
              {cart.itemCount > 0 && (
                <span className="absolute -top-1.5 -end-1.5 w-5 h-5 bg-[#E89A5B] text-[#0B132B] text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-[#0B132B]">
                  {cart.itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

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
              <Search className="w-4 h-4 text-secondary-muted absolute start-3.5 top-1/2 -translate-y-1/2" />
            </form>
            <div className="flex flex-col space-y-3 text-xs font-bold uppercase tracking-wider">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl">{t("store.nav.home", "Home")}</Link>
              <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl">{t("store.nav.catalog", "Catalog")}</Link>
              <Link to="/my-orders" onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl flex items-center gap-2">
                <Package className="w-4 h-4 text-[#E89A5B]" />
                <span>{t("store.nav.orders", "My Orders")}</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Cart Drawer */}
      {cartDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setCartDrawerOpen(false)} />
          <div className={`absolute inset-y-0 ${isRtl ? "left-0" : "right-0"} max-w-full flex pl-10`}>
            <div className="w-screen max-w-md bg-[#FDFBF7] dark:bg-[#0B132B] shadow-2xl flex flex-col border-s border-white/10">
              <div className="p-6 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#E89A5B]" />
                  <h3 className="font-black text-sm uppercase tracking-wider">{t("store.cart.title", "Shopping Cart")}</h3>
                  <span className="text-xs bg-[#E89A5B]/10 text-[#E89A5B] px-2 py-0.5 rounded-full font-bold">
                    {cart.itemCount}
                  </span>
                </div>
                <button onClick={() => setCartDrawerOpen(false)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="text-center py-20 space-y-3">
                    <ShoppingBag className="w-12 h-12 mx-auto text-secondary-muted opacity-40" />
                    <p className="text-xs font-bold text-secondary-muted">{t("store.cart.empty", "Your cart is empty")}</p>
                  </div>
                ) : (
                  cartItems.map((item, idx) => {
                    const rawProd = item.product;
                    const pId = item._uniqueKey || ((typeof rawProd === 'object' && rawProd !== null) ? (rawProd._id || rawProd.id) : (rawProd || item._id || item.id || idx));
                    return (
                      <div key={pId} className="flex gap-4 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 items-center">
                        <img src={item.image || "https://placehold.co/100"} alt={item.name} className="w-16 h-16 object-cover rounded-xl border border-black/10 dark:border-white/10" />
                        <div className="flex-1">
                          <h4 className="font-bold text-xs line-clamp-1">{item.name}</h4>
                          <p className="text-xs font-black text-[#E89A5B] mt-1">${item.price}</p>
                          <div className="flex items-center gap-3 mt-3">
                            <div className="flex items-center border border-black/10 dark:border-white/10 rounded-lg overflow-hidden bg-white dark:bg-[#0B132B]">
                              <button onClick={() => updateQuantityGlobal(pId, item.quantity - 1)} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-3 text-xs font-black">{item.quantity}</span>
                              <button onClick={() => updateQuantityGlobal(pId, item.quantity + 1)} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <button onClick={() => removeFromCartGlobal(pId)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer">
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
                    <span className="font-mono text-[#E89A5B]">${cart.subtotal}</span>
                  </div>
                  <div className="flex gap-3">
                    <Link
                      to="/cart"
                      onClick={() => setCartDrawerOpen(false)}
                      className="flex-1 py-3 px-4 rounded-xl border border-black/10 dark:border-white/10 text-center text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 transition"
                    >
                      {t("store.cart.view_cart", "View Cart")}
                    </Link>
                    <Link
                      to="/checkout"
                      onClick={() => setCartDrawerOpen(false)}
                      className="flex-1 py-3 px-4 rounded-xl bg-[#0B132B] dark:bg-[#E89A5B] text-white text-center text-xs font-bold hover:opacity-90 transition shadow-lg flex items-center justify-center gap-2"
                    >
                      <span>{t("store.cart.checkout", "Checkout")}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1">
        <Outlet />
      </main>

      {/* الفوتر */}
      <footer className="bg-[#070D1F] text-white pt-16 pb-12 border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10 text-xs">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#E89A5B] text-[#0B132B] flex items-center justify-center font-black text-lg">
                L
              </div>
              <span className="text-lg font-black tracking-widest uppercase">LUMA</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              {t("store.footer.desc", "Redefining curated digital and physical commerce with uncompromising luxury, minimalist aesthetics, and flawless engineering.")}
            </p>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-wider text-[#E89A5B] mb-4">{t("store.footer.quick_links", "Quick Links")}</h4>
            <ul className="space-y-2.5 text-slate-300">
              <li><Link to="/products" className="hover:text-[#E89A5B] transition-colors">{t("store.nav.catalog", "Catalog")}</Link></li>
              <li><Link to="/my-orders" className="hover:text-[#E89A5B] transition-colors">{t("store.nav.orders", "My Orders")}</Link></li>
              <li><Link to="/profile" className="hover:text-[#E89A5B] transition-colors">{t("store.nav.profile", "Profile")}</Link></li>
              <li><Link to="/wishlist" className="hover:text-[#E89A5B] transition-colors">{t("store.nav.wishlist", "Wishlist")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-wider text-[#E89A5B] mb-4">{t("store.footer.customer_care", "Customer Care")}</h4>
            <ul className="space-y-2.5 text-slate-300">
              <li className="flex items-center gap-2"><Truck className="w-3.5 h-3.5 text-[#E89A5B]" /><span>{t("store.footer.shipping", "Shipping & Delivery")}</span></li>
              <li className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-[#E89A5B]" /><span>{t("store.footer.returns", "Returns & Exchanges")}</span></li>
              <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-[#E89A5B]" /><span>support@lumastore.com</span></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold uppercase tracking-wider text-[#E89A5B] mb-4">{t("store.footer.newsletter", "Newsletter")}</h4>
            <p className="text-[11px] text-slate-400">{t("store.footer.newsletter_desc", "Subscribe to receive updates and access to exclusive releases.")}</p>
            
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder={t("store.footer.email_placeholder", "Enter your email")}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#E89A5B] flex-1"
              />
              <button type="submit" className="bg-[#E89A5B] text-[#0B132B] px-4 py-2 rounded-xl font-bold uppercase tracking-wider text-xs hover:opacity-90 transition cursor-pointer">
                {t("store.footer.join", "Join")}
              </button>
            </form>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px]">
          <p>© 2026 LUMA Store. {t("store.footer.rights", "All rights reserved.")}</p>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default StoreLayout;