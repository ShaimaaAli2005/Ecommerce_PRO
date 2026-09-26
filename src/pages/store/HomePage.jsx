import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  Award, 
  Compass, 
  Sparkles,
  ArrowUpRight,
  Maximize2,
  Building2,
  Layers,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  X,
  Plus,
  Flame,
  CheckCircle2,
  PhoneCall,
  Crown
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { useSettings } from '../../context/SettingsContext';
import FlashSaleBanner from '../store/products/components/FlashSaleBanner';
import RecentlyViewed from '../store/products/components/RecentlyViewed';

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || 'ar').startsWith('ar');
  const navigate = useNavigate();
  const { formatPrice, currencyLabel } = useSettings();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentItems, setRecentItems] = useState([]);

  // 1. حالة الـ Hotspot في مشهد الغرفة الافتراضية
  const [activeHotspot, setActiveHotspot] = useState(null);

  // 2. حالة محدد المقتنيات الذكي
  const [finderSpace, setFinderSpace] = useState('living');
  const [finderBudget, setFinderBudget] = useState('any');

  const defaultCategoryImages = {
    electronics: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    living: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
    lighting: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
    decor: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80",
    kitchenware: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
    accessories: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    watches: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
  };

  // نقاط تفاعلية حقيقية داخل مشهد الغرفة المعمارية
  const roomHotspots = [
    {
      id: 'hs-1',
      title: isRtl ? 'وحدة إضاءة متدلية من الأونيكس' : 'Aura Brass Pendant Lamp',
      price: 940,
      category: 'Lighting',
      top: '28%',
      left: '46%'
    },
    {
      id: 'hs-2',
      title: isRtl ? 'كرسي استرخاء نورديك من قماش البوكليه' : 'Nordic Minimalist Armchair',
      price: 1850,
      category: 'Living',
      top: '64%',
      left: '26%'
    },
    {
      id: 'hs-3',
      title: isRtl ? 'طاولة قهوة زجاجية مدخنة' : 'Monolith Smoked Glass Table',
      price: 2400,
      category: 'Living',
      top: '74%',
      left: '60%'
    }
  ];

  // مصفوفة الخامات المعمارية الفاخرة
  const luxuryMaterials = [
    {
      name: isRtl ? 'حجر الترافرتين الروماني' : 'Monolithic Travertine',
      origin: isRtl ? 'محاجر تيفولي، إيطاليا' : 'Tivoli Quarries, Italy',
      desc: isRtl ? 'حجر مسامي طبيعي مقطوع بدقة هندسية ومصقول يدوياً لمنح إحساس بالنقاء العضوي.' : 'Naturally porous sedimentary limestone precision-honed for pure brutalist tactile warmth.',
      img: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80',
      categoryQuery: 'Decor'
    },
    {
      name: isRtl ? 'خشب الجوز الأمريكي' : 'Solid American Walnut',
      origin: isRtl ? 'غابات الأبالاش، فرجينيا' : 'Appalachian Valley, USA',
      desc: isRtl ? 'أخشاب صلبة معالجة بزيوت طبيعية تبرز تموجات الألياف العميقة دون أي أصباغ صناعية.' : 'Dense architectural hardwood hand-finished with organic drying oils to honor native grain contours.',
      img: 'https://images.unsplash.com/photo-1533779283484-8da4979d70c0?auto=format&fit=crop&w=600&q=80',
      categoryQuery: 'Living'
    },
    {
      name: isRtl ? 'النحاس المطروق يدوياً' : 'Brushed Raw Brass',
      origin: isRtl ? 'ورش الصياغة الهندسية' : 'Bespoke Atelier Forges',
      desc: isRtl ? 'معدن نبيل يكتسب بمرور السنين طبقة أكسدة راقية تحكي قصة استخدام القطعة وتاريخها.' : 'A living metallic alloy engineered to develop an authentic temporal patina unique to its environment.',
      img: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
      categoryQuery: 'Lighting'
    },
    {
      name: isRtl ? 'زجاج البورسليكات المقاوم' : 'Architectural Borosilicate',
      origin: isRtl ? 'استوديوهات الزجاج المنفوخ' : 'Artisanal Glassworks',
      desc: isRtl ? 'نقاء بلوري لا تشوبه شائبة مع مقاومة فائقة للحرارة والكسر بتناغم هندسي استثنائي.' : 'Lead-free blown glass with diamond clarity and elevated structural thermal resistance.',
      img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
      categoryQuery: 'Kitchenware'
    }
  ];

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get('/products?limit=50');
        const items = res?.data?.products || res?.data || [];

        if (isMounted && Array.isArray(items)) {
          const catMap = new Map();
          items.forEach(p => {
            const cat = typeof p.category === 'object' ? p.category?.name : p.category;
            if (cat && typeof cat === 'string') {
              const clean = cat.trim();
              const key = clean.toLowerCase();
              if (!catMap.has(key)) {
                catMap.set(key, {
                  name: clean,
                  image: defaultCategoryImages[key] || p.images?.[0]?.url || p.image || "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80"
                });
              }
            }
          });

          setCategories(Array.from(catMap.values()));
        }
      } catch (err) {
        console.error("Home categories sync error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCategories();

    try {
      const stored = localStorage.getItem('luma_recently_viewed');
      if (stored) setRecentItems(JSON.parse(stored));
    } catch {
      // Ignore
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    return () => { isMounted = false; };
  }, []);

  const handleFinderSearch = (e) => {
    e.preventDefault();
    let queryUrl = `/products?category=${encodeURIComponent(finderSpace)}`;
    if (finderBudget !== 'any') {
      queryUrl += `&maxPrice=${finderBudget}`;
    }
    navigate(queryUrl);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#070D1E] text-[#0B132B] dark:text-white font-['Poppins'] transition-colors duration-300 selection:bg-[#E89A5B]/30" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* ─── 1. البطل السينمائي الكامل (Full-Width Cinematic Hero) ─── */}
      <section className="relative h-[86vh] min-h-[580px] max-h-[850px] w-full flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=85"
          alt="LUMA Living Horizon"
          className="absolute inset-0 w-full h-full object-cover object-center scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070D1E] via-[#070D1E]/60 to-black/40" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#E89A5B] text-xs font-black uppercase tracking-[0.25em] shadow-xl">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isRtl ? 'مجموعات 2026 الحصرية' : 'Exclusive 2026 Collection'}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight uppercase leading-[1.08]">
            {isRtl ? (
              <>
                الفخامة في <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#E89A5B] to-white">
                  أبسط تفاصيلها
                </span>
              </>
            ) : (
              <>
                Bespoke Luxury <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#E89A5B] to-white">
                  Redefined
                </span>
              </>
            )}
          </h1>

          <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto font-light leading-relaxed">
            {isRtl 
              ? 'مقتنيات مختارة بعناية تجمع بين التصميم المعماري الهادئ، الخامات الأصيلة، والأناقة الدائمة.' 
              : 'Curated architectural pieces and intuitive electronics designed for those who appreciate timeless aesthetics.'}
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/products"
              className="px-9 py-4 rounded-2xl bg-[#E89A5B] text-[#0B132B] text-xs font-black uppercase tracking-wider hover:bg-white transition-all duration-300 shadow-2xl flex items-center gap-3 cursor-pointer group active:scale-95"
            >
              <Compass className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
              <span>{isRtl ? 'استكشف الكتالوج الكامل' : 'Explore Collections'}</span>
              {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 2. ركائز القيمة والخدمة المعتمدة ─── */}
      <section className="border-y border-black/5 dark:border-white/10 bg-white dark:bg-[#121c38] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-2xl bg-[#E89A5B]/10 text-[#E89A5B] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-xs uppercase tracking-wider">{isRtl ? 'أصالة معتمدة 100%' : 'Certified Authenticity'}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-light mt-0.5">{isRtl ? 'قطع موثقة ومضمونة مباشرة من المصدر' : 'Every acquisition is fully verified and documented'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-2xl bg-[#E89A5B]/10 text-[#E89A5B] flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-xs uppercase tracking-wider">{isRtl ? 'شحن فوري ومؤمن' : 'Insured Express Courier'}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-light mt-0.5">{isRtl ? 'تسليم خاص ومباشر في السعودية ومصر' : 'Direct priority shipping to your doorstep'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-2xl bg-[#E89A5B]/10 text-[#E89A5B] flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-xs uppercase tracking-wider">{isRtl ? 'خدمة كونسيرج متميزة' : 'White-Glove Support'}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-light mt-0.5">{isRtl ? 'استشارات خاصة ومتابعة مستمرة لطلباتك' : 'Dedicated concierge team at your service'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. صالة الأقسام البصرية ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-black/5 dark:border-white/10 pb-5">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-[#E89A5B] uppercase tracking-[0.2em]">
              {isRtl ? 'الأقسام المتاحة' : 'Curated Departments'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
              {isRtl ? 'تصفح حسب القسم' : 'Browse By Discipline'}
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs font-black uppercase tracking-wider text-[#E89A5B] hover:underline flex items-center gap-1.5"
          >
            <span>{isRtl ? 'عرض كل الكتالوج' : 'View Full Catalog'}</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(n => (
              <div key={n} className="aspect-[16/10] rounded-[32px] bg-black/5 dark:bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, idx) => (
              <div
                key={idx}
                onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}
                className="group relative aspect-[16/10] rounded-[32px] overflow-hidden border border-black/5 dark:border-white/10 cursor-pointer shadow-xs hover:shadow-2xl transition-all duration-500"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070D1E] via-[#070D1E]/40 to-transparent opacity-85 group-hover:opacity-75 transition-opacity" />

                <div className="absolute inset-0 p-7 flex flex-col justify-between text-white">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-[#E89A5B] uppercase">
                    0{idx + 1} // ARCHIVE
                  </span>

                  <div className="space-y-1">
                    <h3 className="text-2xl font-black uppercase tracking-tight group-hover:text-[#E89A5B] transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-white/70 font-light flex items-center gap-1.5 pt-1">
                      <span>{isRtl ? 'استكشف المعروضات' : 'Explore Archive'}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── 4. [إضافة 1]: تجربة الغرفة الافتراضية التفاعلية (Shop The Living Space) ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-black/5 dark:border-white/10 pb-5">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-[#E89A5B] uppercase tracking-[0.2em]">
              {isRtl ? 'التنسيق المعماري الحي' : 'Spatial Atmosphere'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
              {isRtl ? 'تسوق المشهد المعماري المتكامل' : 'Shop The Curated Space'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-light max-w-sm">
            {isRtl ? 'انقر على النقاط الذهبية التفاعلية لمعرفة تفاصيل القطع الموزعة في الغرفة واقتنائها فوراً.' : 'Click any glowing focal point to inspect and acquire signature pieces within this space.'}
          </p>
        </div>

        <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-[36px] overflow-hidden border border-black/10 dark:border-white/15 shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=85"
            alt="Interactive Living Room"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/25" />

          {/* نقاط النبض الذهبية (Interactive Hotspots) */}
          {roomHotspots.map((hs) => {
            const isActive = activeHotspot === hs.id;
            return (
              <div
                key={hs.id}
                className="absolute z-20"
                style={{ top: hs.top, left: hs.left }}
              >
                <button
                  type="button"
                  onClick={() => setActiveHotspot(isActive ? null : hs.id)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-white text-[#0B132B] scale-110 shadow-2xl' 
                      : 'bg-[#E89A5B] text-[#0B132B] hover:scale-110 shadow-xl'
                  }`}
                >
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E89A5B] opacity-40" />
                  {isActive ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4 stroke-[3]" />}
                </button>

                {/* البطاقة التفاعلية المنبثقة */}
                {isActive && (
                  <div className={`absolute bottom-12 ${isRtl ? 'right-0' : 'left-0'} w-64 p-4 rounded-2xl bg-white/95 dark:bg-[#0B132B]/95 backdrop-blur-xl border border-black/10 dark:border-white/15 shadow-2xl space-y-2.5 animate-fadeIn z-30 text-start`}>
                    <span className="text-[9px] font-black uppercase tracking-wider text-[#E89A5B] block">
                      {hs.category}
                    </span>
                    <h4 className="text-xs font-black uppercase text-[#0B132B] dark:text-white line-clamp-1">
                      {hs.title}
                    </h4>
                    <p className="font-mono text-xs font-black text-[#0B132B] dark:text-white">
                      {currencyLabel} {formatPrice(hs.price)}
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate(`/products?category=${encodeURIComponent(hs.category)}`)}
                      className="w-full py-2 rounded-xl bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] text-[10px] font-black uppercase tracking-wider hover:opacity-90 transition cursor-pointer"
                    >
                      {isRtl ? 'معاينة في الكتالوج ←' : 'View in Catalog →'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── 5. [إضافة 2]: محدد المقتنيات الذكي المخصص (Curated Space Finder) ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="bg-white dark:bg-[#121c38] rounded-[36px] border border-black/5 dark:border-white/10 p-8 sm:p-12 shadow-xl space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#E89A5B] block">
              {isRtl ? 'المساعد الاستشاري' : 'Bespoke Advisory'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
              {isRtl ? 'حدد مقتنياتك المثالية في خطوتين' : 'Curate Your Ideal Living Piece'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-light leading-relaxed">
              {isRtl ? 'اختر نوع المساحة والميزانية لنقوم بتوجيهك فوراً للتشكيلة المتوافقة مع احتياجك الهندسي.' : 'Select your desired spatial category and investment range to launch a custom filtered vault.'}
            </p>
          </div>

          <form onSubmit={handleFinderSearch} className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                {isRtl ? 'المساحة أو الغرض' : '1. Space or Purpose'}
              </label>
              <select
                value={finderSpace}
                onChange={(e) => setFinderSpace(e.target.value)}
                className="w-full py-3.5 px-4 rounded-2xl border border-black/10 dark:border-white/10 bg-[#FAF8F5] dark:bg-[#070D1E] text-xs font-bold outline-none focus:border-[#E89A5B] transition cursor-pointer appearance-none"
              >
                <option value="living">{isRtl ? 'أثاث الصالون وغرف المعيشة (Living)' : 'Living & Lounges'}</option>
                <option value="lighting">{isRtl ? 'وحدات الإنارة المعمارية (Lighting)' : 'Architectural Lighting'}</option>
                <option value="decor">{isRtl ? 'القطع الفنية والديكور (Decor)' : 'Artisan Centerpieces'}</option>
                <option value="kitchenware">{isRtl ? 'أدوات القهوة والضيافة (Kitchenware)' : 'Beverage & Pour-Over'}</option>
                <option value="electronics">{isRtl ? 'الأجهزة والتقنيات الذكية (Electronics)' : 'Bespoke Gadgets'}</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                {isRtl ? 'الميزانية المستهدفة' : '2. Investment Tier'}
              </label>
              <select
                value={finderBudget}
                onChange={(e) => setFinderBudget(e.target.value)}
                className="w-full py-3.5 px-4 rounded-2xl border border-black/10 dark:border-white/10 bg-[#FAF8F5] dark:bg-[#070D1E] text-xs font-bold outline-none focus:border-[#E89A5B] transition cursor-pointer appearance-none"
              >
                <option value="any">{isRtl ? 'كافة الفئات السعرية' : 'All Tiers'}</option>
                <option value="500">{isRtl ? 'حتى 500 ' + currencyLabel : 'Under 500 ' + currencyLabel}</option>
                <option value="1500">{isRtl ? 'حتى 1500 ' + currencyLabel : 'Up to 1,500 ' + currencyLabel}</option>
                <option value="3000">{isRtl ? 'حتى 3000 ' + currencyLabel : 'Up to 3,000 ' + currencyLabel}</option>
                <option value="5000">{isRtl ? 'قطع استثنائية (5000+)' : 'Signature Vault (5,000+)'}</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-4 px-6 rounded-2xl bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] text-xs font-black uppercase tracking-wider hover:opacity-90 transition shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Compass className="w-4 h-4" />
              <span>{isRtl ? 'استعراض التشكيلة المطابقة' : 'Launch Curated Selection'}</span>
            </button>
          </form>
        </div>
      </section>

      {/* ─── 6. [إضافة 3]: معرض الحركة السينمائي الفاخر (Ambient Visual Loop) ─── */}
      <section className="relative h-[65vh] min-h-[460px] max-h-[600px] w-full flex items-center justify-center overflow-hidden mb-24">
        <img
          src="https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=2000&q=85"
          alt="Architectural Material Mastery"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/80 backdrop-blur-[1px]" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center text-white space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#E89A5B] text-[10px] font-black uppercase tracking-[0.2em]">
            <Crown className="w-3.5 h-3.5" />
            <span>{isRtl ? 'فلسفة الصنعة والحرفة' : 'Material Mastery'}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight">
            {isRtl ? 'خامات حية تتنفس مع المكان' : 'Matter Engineered to Transcend Utility'}
          </h2>

          <p className="text-xs sm:text-sm text-white/80 font-light leading-relaxed max-w-xl mx-auto">
            {isRtl 
              ? 'نختار الحجر والخشب والزجاج والمعادن التي تزداد أصالة مع الوقت؛ لتصنع توازناً بصرياً يمنحك شعوراً دائماً بالسكينة والاتزان.' 
              : 'Our ateliers select tactile, self-patinating raw minerals and seasoned hardwoods that mature in harmony with your environment.'}
          </p>

          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white text-[#0B132B] text-xs font-black uppercase tracking-wider hover:bg-[#E89A5B] transition cursor-pointer active:scale-95 shadow-2xl"
            >
              <span>{isRtl ? 'استكشف المعايير الكاملة' : 'Discover Standards'}</span>
              {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 7. [إضافة 4]: شريط الخامات المعمارية والأصالة (Tactile Materials Codex) ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-black/5 dark:border-white/10 pb-5">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-[#E89A5B] uppercase tracking-[0.2em]">
              {isRtl ? 'مخطط الخامات' : 'Material Provenance'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
              {isRtl ? 'ركائز الجودة والهيكل' : 'The Tactile Elements'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-light max-w-xs">
            {isRtl ? 'خامات معتمدة بيئياً وفندقياً تدوم لأجيال.' : 'Certified sustainable noble minerals engineered to endure generations.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {luxuryMaterials.map((mat, idx) => (
            <div
              key={idx}
              onClick={() => navigate(`/products?category=${encodeURIComponent(mat.categoryQuery)}`)}
              className="group bg-white dark:bg-[#121c38] rounded-[32px] border border-black/5 dark:border-white/10 overflow-hidden shadow-xs hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-black/20">
                  <img
                    src={mat.img}
                    alt={mat.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                  />
                </div>
                <div className="p-6 pt-0 space-y-2">
                  <span className="text-[10px] font-mono font-bold text-[#E89A5B] uppercase tracking-wider block">
                    {mat.origin}
                  </span>
                  <h4 className="text-base font-black uppercase tracking-tight group-hover:text-[#E89A5B] transition-colors">
                    {mat.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                    {mat.desc}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0">
                <span className="text-[11px] font-bold text-[#E89A5B] flex items-center gap-1 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                  <span>{isRtl ? 'استعراض القطع المصنوعة منه' : 'Explore Pieces'}</span>
                  {isRtl ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 8. [إضافة 5]: دليل المقاييس المعماري للمساحات (Spatial Dimension Guide) ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="bg-white dark:bg-[#121c38] rounded-[36px] border border-black/5 dark:border-white/10 p-8 sm:p-12 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-5">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#E89A5B] block">
              {isRtl ? 'دليل الأبعاد والراحة' : 'Dimensional Scale'}
            </span>
            <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-tight leading-tight">
              {isRtl ? 'مقاييس هندسية تتناغم مع مساحتك' : 'Proportioned For Human Movement'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-light leading-relaxed">
              {isRtl 
                ? 'تخضع جميع قطعنا لمعادلات الأبعاد المعمارية الصارمة؛ لتضمن أن كل كرسي، وحدة إضاءة، أو طاولة تحافظ على المسار الانسيابي للمكان دون ازدحام بصري.' 
                : 'Every archive item adheres to rigorous architectural Golden-Ratio metrics, ensuring intuitive clearance and ergonomic equilibrium.'}
            </p>

            <div className="pt-2 flex items-center gap-6 border-t border-black/5 dark:border-white/5">
              <div>
                <p className="text-xl font-black font-mono">1:1.618</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{isRtl ? 'النسبة الذهبية' : 'Golden Ratio'}</p>
              </div>
              <div className="w-px h-8 bg-black/10 dark:bg-white/10" />
              <div>
                <p className="text-xl font-black font-mono">100%</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{isRtl ? 'تطابق واقعي' : 'Scale Precision'}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-3xl bg-[#FAF8F5] dark:bg-[#070D1E] border border-black/5 dark:border-white/10 space-y-2">
              <span className="text-[#E89A5B] font-mono text-xs font-black block">01 // CLEARANCE</span>
              <h5 className="font-bold text-xs uppercase">{isRtl ? 'حساب مسارات الحركة' : 'Circulation Space'}</h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                {isRtl ? 'نصمم أبعاد الطاولات ومقاعد الجلوس لتترك ما لا يقل عن 80 سم للمرور المريح.' : 'Engineered dimensions retain optimal 80cm walkways for effortless spatial flow.'}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#FAF8F5] dark:bg-[#070D1E] border border-black/5 dark:border-white/10 space-y-2">
              <span className="text-[#E89A5B] font-mono text-xs font-black block">02 // LUMENS</span>
              <h5 className="font-bold text-xs uppercase">{isRtl ? 'معايرة درجة الإضاءة' : 'Photometric Balance'}</h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                {isRtl ? 'حرارة إضاءة دافئة 2700K لا تسبب أي إجهاد للعين وتبرز دفء الخامات.' : 'Pre-calibrated 2700K warmth curves that flatter organic stone and walnut grains.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 9. [إضافة 6]: بوابة النخبة واستشارات الكونسيرج (VIP & Architectural Concierge) ─── */}
      <section className="bg-gradient-to-b from-[#0B132B] to-[#070D1E] text-white py-24 mb-16 border-t border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-7">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[#E89A5B] text-[11px] font-black uppercase tracking-[0.25em]">
            <Building2 className="w-3.5 h-3.5" />
            <span>{isRtl ? 'خدمات المشاريع والكونسيرج الخاص' : 'VIP & Corporate Atelier'}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight">
            {isRtl ? 'تجهيزات المشاريع الفندقية والمكاتب التنفيذية' : 'Bespoke Outfitting For Distinguished Spaces'}
          </h2>

          <p className="text-xs sm:text-sm text-white/80 font-light leading-relaxed max-w-2xl mx-auto">
            {isRtl 
              ? 'نقدم استشارات تصميم وتوريد مخصصة لشركات التطوير العقاري، المكاتب الإدارية الفاخرة، والهدايا التنفيذية الخاصة مع إمكانية التخصيص والنقش بالليزر.' 
              : 'Our private advisory coordinates end-to-end furnishings for boutique hotels, executive boardrooms, and branded VIP gifting commissions.'}
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/products"
              className="px-9 py-4 rounded-2xl bg-[#E89A5B] text-[#0B132B] text-xs font-black uppercase tracking-wider hover:bg-white transition shadow-2xl active:scale-95 cursor-pointer"
            >
              {isRtl ? 'تصفح الكتالوج بالكامل' : 'Explore Entire Vault'}
            </Link>
            <a
              href="mailto:concierge@luma.store"
              className="px-8 py-4 rounded-2xl border border-white/20 hover:bg-white/10 text-xs font-bold uppercase tracking-wider transition active:scale-95 cursor-pointer backdrop-blur-md"
            >
              {isRtl ? 'تواصل مع مستشار الكونسيرج' : 'Contact Private Concierge'}
            </a>
          </div>
        </div>
      </section>

      {/* ─── 10. المنتجات المشاهدة مؤخراً ─── */}
      {recentItems.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <RecentlyViewed items={recentItems} />
        </section>
      )}

    </div>
  );
}