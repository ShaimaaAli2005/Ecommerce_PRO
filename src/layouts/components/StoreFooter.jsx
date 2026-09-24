import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Truck, ShieldCheck, Mail } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";
import toast from "react-hot-toast";

export default function StoreFooter() {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || "ar").startsWith("ar");
  const { settings } = useSettings();
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newsletterEmail || !emailRegex.test(newsletterEmail.trim())) {
      toast.error(t("store.validation.invalid_email", "Please enter a valid email address"));
      return;
    }
    toast.success(t("store.newsletter.success", "Thank you for subscribing!"));
    setNewsletterEmail("");
  };

  return (
    <footer 
      className="bg-[#070D1F] text-white pt-16 pb-12 border-t border-white/10 mt-20 font-['Poppins']" 
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10 text-xs">
        
        {/* معلومات العلامة التجارية */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E89A5B] text-[#0B132B] flex items-center justify-center font-black text-xl shadow-md">
              L
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-widest uppercase">LUMA</span>
              <span className="text-[9px] tracking-widest text-[#E89A5B] font-bold uppercase">
                {t("store.brand_subtitle", "Curated Luxury")}
              </span>
            </div>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px] font-light max-w-xs">
            {t("store.footer.desc", "Redefining curated digital and physical commerce with uncompromising luxury, minimalist aesthetics, and flawless engineering.")}
          </p>
        </div>

        {/* الروابط السريعة المتوافقة مع الهوية الجديدة */}
        <div>
          <h4 className="font-bold uppercase tracking-widest text-[#E89A5B] mb-4">
            {t("store.footer.quick_links", "Quick Links")}
          </h4>
          <ul className="space-y-3 text-slate-300">
            <li>
              <Link to="/products" className="hover:text-[#E89A5B] transition-colors">
                {t("store.nav.collections", "Collections")}
              </Link>
            </li>
            <li>
              <Link to="/my-orders" className="hover:text-[#E89A5B] transition-colors">
                {t("store.nav.orders", "My Orders")}
              </Link>
            </li>
            <li>
              <Link to="/wishlist" className="hover:text-[#E89A5B] transition-colors">
                {t("store.nav.wishlist", "Wishlist")}
              </Link>
            </li>
            <li>
              <Link to="/profile" className="hover:text-[#E89A5B] transition-colors">
                {t("store.nav.profile", "Profile")}
              </Link>
            </li>
          </ul>
        </div>

        {/* خدمة العملاء وتواصل الدعم */}
        <div>
          <h4 className="font-bold uppercase tracking-widest text-[#E89A5B] mb-4">
            {t("store.footer.customer_care", "Customer Care")}
          </h4>
          <ul className="space-y-3 text-slate-300">
            <li className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-[#E89A5B] shrink-0" />
              <span>{t("store.footer.shipping", "Shipping & Delivery")}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#E89A5B] shrink-0" />
              <span>{t("store.footer.returns", "Returns & Exchanges")}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[#E89A5B] shrink-0" />
              <span className="font-mono text-[11px] text-slate-400">
                {settings?.supportEmail || "concierge@luma-store.com"}
              </span>
            </li>
          </ul>
        </div>

        {/* النشرة البريدية الحصرية */}
        <div className="space-y-4">
          <h4 className="font-bold uppercase tracking-widest text-[#E89A5B] mb-4">
            {t("store.footer.newsletter", "Private Newsletter")}
          </h4>
          <p className="text-[11px] text-slate-400 font-light leading-relaxed">
            {t("store.footer.newsletter_desc", "Subscribe to receive updates and access to exclusive releases.")}
          </p>
          
          <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder={t("store.footer.email_placeholder", "Enter your email")}
              className="bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#E89A5B] flex-1 transition"
            />
            <button 
              type="submit" 
              className="bg-[#E89A5B] text-[#0B132B] px-4 py-2.5 rounded-xl font-black uppercase tracking-wider text-xs hover:opacity-90 transition cursor-pointer shadow-sm shrink-0"
            >
              {t("store.footer.join", "Join")}
            </button>
          </form>
        </div>

      </div>

      {/* الحقوق والروابط القانونية */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px]">
        <p>© 2026 LUMA Store. {t("store.footer.rights", "All rights reserved.")}</p>
        <div className="flex gap-6 mt-3 sm:mt-0 font-medium">
          <span className="hover:text-slate-300 transition cursor-pointer">
            {t("store.footer.privacy", "Privacy Policy")}
          </span>
          <span className="hover:text-slate-300 transition cursor-pointer">
            {t("store.footer.terms", "Terms of Service")}
          </span>
        </div>
      </div>
    </footer>
  );
}