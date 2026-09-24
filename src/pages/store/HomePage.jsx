import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  Award, 
  Flame, 
  ShoppingBag, 
  Compass, 
  ArrowUpRight,
  TrendingUp,
  Layers,
  CheckCircle2,
  Clock,
  Zap,
  Globe2,
  Crown
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import FlashSaleBanner from '../store/products/components/FlashSaleBanner';
import RecentlyViewed from '../store/products/components/RecentlyViewed';
import toast from 'react-hot-toast';

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || 'ar').startsWith('ar');
  const navigate = useNavigate();

  // 1. التخزين المؤقت اللحظي للأقسام والقطعة الاستثنائية
  const [categories, setCategories] = useState(() => {
    try {
      const cached = sessionStorage.getItem('luma_home_categories');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [spotlightProduct, setSpotlightProduct] = useState(() => {
    try {
      const cached = sessionStorage.getItem('luma_home_spotlight');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [loadingCats, setLoadingCats] = useState(() => categories.length === 0);
  const [recentItems, setRecentItems] = useState([]);

  // 2. المؤشرات الحية التفاعلية
  const [liveVisitors, setLiveVisitors] = useState(164);
  const [tickerIndex, setTickerIndex] = useState(0);

  // 3. محرك الإمالة ثلاثي الأبعاد والضوء المحيطي (3D Physics)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  const { addToCartGlobal } = useCart();
  const { formatPrice, currencyLabel } = useSettings();

  // إعلانات الأنشطة الحية اللحظية المتغيرة
  const liveActivities = useMemo(() => [
    isRtl ? 'طلب حصري جديد تم شحنه للرياض قبل دقيقة' : 'Bespoke piece dispatched to Riyadh 1m ago',
    isRtl ? 'تم التحقق من أصالة 32 قطعة فاخرة اليوم' : '32 Authenticity certificates issued today',
    isRtl ? 'طلب خاص قيد التجهيز الفندقي بجدة' : 'Private VIP curation preparing in Jeddah',
    isRtl ? 'شحن فوري مع خدمة التسليم المباشر' : 'White-glove priority courier active'
  ], [isRtl]);

  useEffect(() => {
    const visitorTimer = setInterval(() => {
      setLiveVisitors(prev => {
        const delta = Math.floor(Math.random() * 9) - 4;
        return Math.max(130, Math.min(290, prev + delta));
      });
    }, 4000);

    const tickerTimer = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % liveActivities.length);
    }, 5000);

    return () => {
      clearInterval(visitorTimer);
      clearInterval(tickerTimer);
    };
  }, [liveActivities.length]);

  useEffect(() => {
    let isMounted = true;

    const fetchHomeExperience = async () => {
      try {
        const res = await axiosInstance.get('/products?limit=50&select=name,price,discountPrice,stock,category,images,image');
        const products = res?.data?.products || res?.data || [];

        if (isMounted && Array.isArray(products) && products.length > 0) {
          const heroItem = products.find(p => (Number(p.stock) > 0 && Number(p.price) > 100)) || products[0];
          setSpotlightProduct(heroItem);
          sessionStorage.setItem('luma_home_spotlight', JSON.stringify(heroItem));

          const categoryMap = new Map();
          products.forEach(p => {
            let catName = null;
            if (typeof p.category === 'object' && p.category !== null) {
              catName = p.category.name || p.category.title || p.category.slug;
            } else if (typeof p.category === 'string') {
              catName = p.category;
            }

            if (catName && catName.trim()) {
              const cleanKey = catName.trim().toLowerCase();
              if (!categoryMap.has(cleanKey)) {
                categoryMap.set(cleanKey, catName.trim());
              }
            }
          });

          const uniqueList = Array.from(categoryMap.values());
          setCategories(uniqueList);
          sessionStorage.setItem('luma_home_categories', JSON.stringify(uniqueList));
        }
      } catch (err) {
        console.error('Home discovery sync error:', err);
      } finally {
        if (isMounted) setLoadingCats(false);
      }
    };

    fetchHomeExperience();

    try {
      const stored = localStorage.getItem('luma_recently_viewed');
      if (stored) setRecentItems(JSON.parse(stored));
    } catch {
      // Ignore storage errors
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    return () => { isMounted = false; };
  }, []);

  const handleSpotlightAddToCart = async () => {
    if (!spotlightProduct) return;
    const stock = Number(spotlightProduct.stock ?? 10);
    if (stock <= 0) {
      toast.error(isRtl ? 'هذه القطعة غير متاحة حالياً' : 'Piece temporarily unavailable');
      return;
    }
    await addToCartGlobal(spotlightProduct, 1);
  };

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#070D1E] text-[#0B132B] dark:text-white font-['Poppins'] transition-colors duration-300 selection:bg-[#E89A5B] selection:text-white" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* ─── 0. شريط الأنشطة الحية اللحظي (Global Real-Time Activity Ticker) ─── */}
      <div className="border-b border-black/5 dark:border-white/10 bg-white/70 dark:bg-[#0B132B]/85 backdrop-blur-xl sticky top-20 z-30 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-4 text-xs font-bold">
          
          {/* عداد الزوار المتفاعل */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span><strong>{liveVisitors}</strong> {isRtl ? 'متسوق يتصفح المتجر الآن' : 'discerning clients online'}</span>
            </span>

            <span className="hidden md:inline-block text-slate-300 dark:text-gray-700">|</span>

            {/* شريط الإشعارات اللحظية المتحركة */}
            <div className="hidden md:flex items-center gap-2 text-slate-600 dark:text-slate-300 text-[11px] overflow-hidden h-5">
              <Zap className="w-3.5 h-3.5 text-[#E89A5B] shrink-0 animate-pulse" />
              <span className="animate-fadeIn key={tickerIndex} font-medium">
                {liveActivities[tickerIndex]}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] text-[10px] font-black uppercase tracking-wider shadow-xs">
              <Crown className="w-3 h-3 fill-current" />
              <span>{isRtl ? 'تجربة النخبة 2026' : 'Elite Curation 2026'}</span>
            </span>
          </div>

        </div>
      </div>

      {/* ─── 1. الترويسة التوجيهية العالمية والبانر الفني التفاعلي ─── */}
      <section className="relative pt-12 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        
        {/* خلفية ضوئية ذهبية متدرجة محيطية */}
        <div className="absolute top-0 start-1/2 -translate-x-1/2 w-full max-w-5xl h-[550px] bg-gradient-to-b from-[#E89A5B]/15 via-[#E89A5B]/5 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* الجانب الإبداعي النصي */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-start">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 shadow-xs text-[#E89A5B] text-xs font-black uppercase tracking-widest backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('store.home.edition', 'Season 2026 Collection')}</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] uppercase">
              {t('store.home.hero_heading_1', 'Design Beyond')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0B132B] via-[#E89A5B] to-[#0B132B] dark:from-white dark:via-[#E89A5B] dark:to-white">
                {t('store.home.hero_heading_2', 'Ordinary Living')}
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 font-light leading-relaxed">
              {t('store.home.hero_desc', 'A private curation of signature pieces and smart luxury gadgets, engineered for discerning individuals.')}
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-3">
              <Link
                to="/products"
                className="px-8 py-4 rounded-2xl bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] text-xs font-black uppercase tracking-wider hover:opacity-90 transition shadow-2xl flex items-center gap-3 cursor-pointer group active:scale-95"
              >
                <Compass className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
                <span>{t('store.home.explore_catalog', 'Open Collections')}</span>
                {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </Link>
              
              <Link
                to="/my-orders"
                className="px-7 py-4 rounded-2xl border border-black/10 dark:border-white/15 bg-white/70 dark:bg-white/[0.03] hover:bg-black/5 dark:hover:bg-white/5 text-xs font-bold uppercase tracking-wider transition cursor-pointer backdrop-blur-sm active:scale-95"
              >
                <span>{t('store.home.track_shipment', 'Concierge Service')}</span>
              </Link>
            </div>

            {/* مؤشرات المصداقية المعتمدة */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-black/5 dark:border-white/10 max-w-md mx-auto lg:mx-0">
              <div className="space-y-1">
                <p className="text-2xl sm:text-3xl font-black font-mono tracking-tight">100%</p>
                <p className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">{t('store.home.metric_auth', 'Certified Authentic')}</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl sm:text-3xl font-black font-mono tracking-tight">48h</p>
                <p className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">{t('store.home.metric_dispatch', 'Priority Dispatch')}</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl sm:text-3xl font-black font-mono tracking-tight">VIP</p>
                <p className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">{t('store.home.metric_care', 'White-glove Care')}</p>
              </div>
            </div>
          </div>

          {/* البانر الترويجي الفني ثلاثي الأبعاد (The Kinetic Tilt Artifact) */}
          <div className="lg:col-span-5 relative perspective-1000">
            
            {/* وهج ضوئي ذهبي تفاعلي خلف البطاقة */}
            <div 
              className="absolute -inset-4 bg-gradient-to-tr from-[#E89A5B]/35 via-transparent to-[#0B132B]/30 rounded-[48px] blur-3xl transition-opacity duration-700 pointer-events-none"
              style={{ opacity: isHovered ? 0.95 : 0.4 }}
            />

            <div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => {
                setIsHovered(false);
                setMousePos({ x: 0, y: 0 });
              }}
              className="relative aspect-[4/5] rounded-[40px] overflow-hidden border border-black/10 dark:border-white/20 shadow-2xl transition-all duration-300 ease-out cursor-pointer group"
              style={{
                transform: isHovered 
                  ? `rotateY(${mousePos.x * 16}deg) rotateX(${-mousePos.y * 16}deg) scale3d(1.025, 1.025, 1.025)` 
                  : 'rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)',
                transformStyle: 'preserve-3d'
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=85"
                alt="LUMA Architecture"
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070D1E] via-[#070D1E]/40 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />

              {/* شارة المعرض العائمة العلوية */}
              <div 
                className="absolute top-6 start-6 z-20 transition-transform duration-300"
                style={{ transform: isHovered ? 'translateZ(40px)' : 'translateZ(0px)' }}
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-xl border border-white/20 text-white text-[10px] font-black uppercase tracking-widest shadow-xl">
                  <Layers className="w-3.5 h-3.5 text-[#E89A5B]" />
                  <span>{t('store.home.featured_room', 'Exhibition Concept')}</span>
                </div>
              </div>

              {/* بطاقة الشرح الزجاجية التفاعلية السفلية */}
              <div 
                className="absolute bottom-6 inset-x-6 p-6 rounded-3xl backdrop-blur-2xl bg-white/15 dark:bg-black/50 border border-white/25 text-white space-y-3 shadow-2xl transition-transform duration-300"
                style={{ transform: isHovered ? 'translateZ(50px)' : 'translateZ(0px)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#E89A5B] block">
                    Curated Space 2026
                  </span>
                  <span className="text-[10px] text-white/70 font-mono tracking-wider">LUMA // LIVING</span>
                </div>
                
                <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
                  {isRtl ? 'حياة عصرية بلمسات حرفية' : 'Minimalist Artisanal Living'}
                </h3>
                
                <p className="text-xs text-white/85 font-light leading-relaxed">
                  {isRtl 
                    ? 'خامات منتقاة بعناية، إضاءة متوازنة، وتناغم هندسي داخلي فاخر يجمع بين البساطة والرفاهية.' 
                    : 'Carefully sculpted textures, balanced lighting, and bespoke interior aesthetics crafted for timeless elegance.'}
                </p>

                <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-[#E89A5B]">
                  <span className="group-hover:underline inline-flex items-center gap-1.5">
                    <span>{isRtl ? 'استكشف المفهوم المعماري' : 'Discover the architectural concept'}</span>
                    {isRtl ? <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1.5 transition-transform" /> : <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />}
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ─── 2. شريط العروض الموقوتة ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <FlashSaleBanner />
      </section>

      {/* ─── 3. موجّه الأقسام السريع (Editorial Taxonomy Showcase) ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-black/5 dark:border-white/10 pb-5">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-[#E89A5B] uppercase tracking-widest">
              {t('store.home.departments', 'Browse Departments')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              {t('store.home.catalog_pathways', 'Explore By Category')}
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs font-black uppercase tracking-wider text-[#E89A5B] hover:underline flex items-center gap-1.5"
          >
            <span>{t('store.home.all_collections', 'View Complete Archive')}</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingCats && categories.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-6 rounded-3xl bg-white/40 dark:bg-[#121c38]/40 border border-black/5 dark:border-white/10 animate-pulse space-y-3 flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-black/10 dark:bg-white/10" />
                <div className="w-20 h-3 bg-black/10 dark:bg-white/10 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => navigate(`/products?category=${encodeURIComponent(cat)}`)}
                className="group p-6 rounded-3xl bg-white dark:bg-[#121c38] border border-black/5 dark:border-white/10 hover:border-[#E89A5B] dark:hover:border-[#E89A5B] transition-all duration-300 shadow-xs hover:shadow-xl text-center space-y-3 cursor-pointer flex flex-col items-center justify-between active:scale-95 relative overflow-hidden"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#FAF8F5] dark:bg-white/5 group-hover:bg-[#E89A5B]/10 flex items-center justify-center text-[#0B132B] dark:text-white group-hover:text-[#E89A5B] transition-all duration-300 group-hover:scale-110 shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="w-full">
                  <h4 className="text-xs font-black uppercase tracking-wider truncate" title={cat}>
                    {cat}
                  </h4>
                  <span className="text-[10px] text-slate-400 block mt-1 font-medium group-hover:text-[#E89A5B] transition-colors">
                    {t('store.home.discover_now', 'Explore Collection →')}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ─── 4. ركن القطعة النجمية (The Signature Piece Showcase) ─── */}
      {spotlightProduct && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <div className="relative rounded-[40px] bg-white dark:bg-[#0E1730] border border-black/5 dark:border-white/10 overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center p-8 sm:p-12 lg:p-16">
              
              <div className="lg:col-span-6 relative aspect-square sm:aspect-[4/3] rounded-[32px] overflow-hidden bg-[#FAF8F5] dark:bg-black/30 border border-black/5 dark:border-white/10">
                <img
                  src={spotlightProduct.images?.[0]?.url || spotlightProduct.image || 'https://placehold.co/800'}
                  alt={spotlightProduct.name}
                  onError={(e) => { e.currentTarget.src = 'https://placehold.co/800'; }}
                  className="w-full h-full object-cover hover:scale-108 transition-transform duration-700 ease-out"
                />
                <div className="absolute top-4 start-4 bg-[#0B132B]/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg border border-white/10">
                  <Flame className="w-3.5 h-3.5 text-[#E89A5B]" />
                  <span>{t('store.home.spotlight_badge', 'Curator Signature Choice')}</span>
                </div>
              </div>

              <div className="lg:col-span-6 space-y-6">
                <span className="text-xs font-black uppercase tracking-widest text-[#E89A5B] block">
                  {typeof spotlightProduct.category === 'object' ? spotlightProduct.category?.name : spotlightProduct.category}
                </span>

                <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-tight leading-tight">
                  {spotlightProduct.name}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-light leading-relaxed line-clamp-3">
                  {spotlightProduct.description || t('store.home.spotlight_default_desc', 'Masterfully crafted luxury design engineered to exceed functional expectations with bespoke elegance.')}
                </p>

                <div className="flex items-baseline gap-4 pt-1">
                  <span className="font-mono text-3xl sm:text-4xl font-black text-[#0B132B] dark:text-white">
                    {currencyLabel} {formatPrice(spotlightProduct.discountPrice || spotlightProduct.price)}
                  </span>
                  {spotlightProduct.discountPrice && spotlightProduct.discountPrice < spotlightProduct.price && (
                    <span className="font-mono text-base text-slate-400 line-through">
                      {currencyLabel} {formatPrice(spotlightProduct.price)}
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-3">
                  <button
                    type="button"
                    onClick={handleSpotlightAddToCart}
                    className="flex-1 py-4 px-8 rounded-2xl bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] text-xs font-black uppercase tracking-wider hover:opacity-90 transition flex items-center justify-center gap-2.5 shadow-2xl cursor-pointer active:scale-95"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{t('store.home.acquire_piece', 'Acquire This Piece')}</span>
                  </button>

                  <Link
                    to={`/products/${spotlightProduct._id || spotlightProduct.id}`}
                    className="py-4 px-7 rounded-2xl border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/5 text-xs font-bold uppercase tracking-wider text-center transition cursor-pointer active:scale-95"
                  >
                    <span>{t('store.home.full_specs', 'Full Inspection')}</span>
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* ─── 5. ميثاق العلامة الفاخرة (The Provenance Pillars) ─── */}
      <section className="border-t border-black/5 dark:border-white/10 bg-white/40 dark:bg-[#070D1E] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex gap-4 p-5 rounded-3xl bg-white dark:bg-[#121c38] border border-black/5 dark:border-white/10 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#E89A5B]/10 text-[#E89A5B] flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-xs uppercase tracking-wider">{t('store.home.dist_shipping', 'Global Courier Priority')}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                {isRtl ? 'شحن سريع ومؤمن مباشرة إلى باب منزلك في المملكة العربية السعودية ومصر.' : 'Direct insured express delivery to your doorstep across Saudi Arabia and Egypt.'}
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-5 rounded-3xl bg-white dark:bg-[#121c38] border border-black/5 dark:border-white/10 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-xs uppercase tracking-wider">{t('store.home.dist_auth', 'Certificate of Provenance')}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                {isRtl ? 'كل قطعة تأتي مصحوبة بوثائق الأصالة المتسلسلة وضمان المصنع المعتمد.' : 'Every acquisition arrives with serial authenticity documentation and manufacturer warranty.'}
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-5 rounded-3xl bg-white dark:bg-[#121c38] border border-black/5 dark:border-white/10 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-xs uppercase tracking-wider">{t('store.home.dist_clientele', 'Concierge Privilege')}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                {isRtl ? 'فريق استشاري خاص لطلبات التجهيز الفندقي، تغليف الهدايا الفاخر، والتوريدات المعمارية.' : 'Dedicated private advisory for custom inquiries, gift wrapping, and bulk architectural furnishing.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. المنتجات المشاهدة مؤخراً ─── */}
      {recentItems.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <RecentlyViewed 
            items={recentItems} 
            onAddToCart={(prod, qty) => addToCartGlobal(prod, qty)} 
          />
        </section>
      )}

    </div>
  );
}