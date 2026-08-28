"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, Heart, MapPin, BedDouble, Bath, Square, ChevronLeft, ChevronRight, Camera, Video, Search, ChevronDown, Eye, Building2, Check, Home as HomeIcon, Hotel, Tent, Factory, ConciergeBell, Plus, Briefcase, BedDouble as BedDoubleIcon, PartyPopper, Warehouse, Star, Building, Store, Trees, CalendarDays, Users, Mountain, Sparkles, ShieldCheck, Globe2, Headset } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"
import { Link, useRouter } from "@/i18n/navigation"
import axios from "axios"
import { PROPERTY_TYPES, REAL_ESTATE_CATEGORIES } from "@/data/propertyTypes"
import { PropertyCard } from "@/components/PropertyCard"

// Helper for Icons
const getIcon = (name: string) => {
  const icons: any = {
    Building2, Hotel, Tent, Factory, Home: HomeIcon, ConciergeBell,
    Briefcase, BedDouble: BedDoubleIcon, PartyPopper, Warehouse, Star,
    Building, Store, Trees, CalendarDays, Users, Mountain, Sparkles
  }
  return icons[name] || HomeIcon
}

// Mapping des couleurs par ID de catégorie
const getCategoryColorById = (categoryId: string) => {
  switch (categoryId) {
    case "HEBERGEMENT": return "bg-yellow-400";
    case "BUREAUX_COMMERCES": return "bg-blue-500";
    case "HOTELIER": return "bg-orange-500";
    case "EVENEMENTIEL": return "bg-red-500";
    case "INDUSTRIEL": return "bg-gray-500";
    case "RESIDENTIEL": return "bg-green-500";
    default: return "bg-[#00BFA6]";
  }
}

// Mapping des couleurs d'icônes
const getIconColorById = (categoryId: string) => {
  switch (categoryId) {
    case "HEBERGEMENT": return "text-yellow-500";
    case "BUREAUX_COMMERCES": return "text-blue-500";
    case "HOTELIER": return "text-orange-500";
    case "EVENEMENTIEL": return "text-red-500";
    case "INDUSTRIEL": return "text-gray-500";
    case "RESIDENTIEL": return "text-green-500";
    default: return "text-[#00BFA6]";
  }
}

const getCategoryHeroGradientById = (categoryId: string) => {
  switch (categoryId) {
    case "HEBERGEMENT": return "from-yellow-500 to-amber-400";
    case "BUREAUX_COMMERCES": return "from-blue-600 to-sky-400";
    case "HOTELIER": return "from-orange-600 to-amber-400";
    case "EVENEMENTIEL": return "from-red-600 to-rose-400";
    case "INDUSTRIEL": return "from-gray-700 to-gray-500";
    case "RESIDENTIEL": return "from-green-700 to-emerald-500";
    default: return "from-[#00BFA6] to-emerald-400";
  }
}

const getCategoryHeroImageById = (categoryId: string) => {
  switch (categoryId) {
    case "RESIDENTIEL": return "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=2400&q=80"
    case "INDUSTRIEL": return "https://unsplash.com/fr/photos/usine-industrielle-dans-un-paysage-enneige-5BpJ33Oetm0"
    case "BUREAUX_COMMERCES": return "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2400&q=80"
    case "HOTELIER": return "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2400&q=80"
    case "EVENEMENTIEL": return "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=2400&q=80"
    case "HEBERGEMENT": return "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2400&q=80"
    default: return "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=2400&q=80"
  }
}

// Section Carousel avec flèches de navigation et auto-scroll
const CarouselSection = ({ title, categoryId, items }: { title: string, categoryId: string, items: any[], maxItems?: number }) => {
  const t = useTranslations("HomePage")
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  // Auto-scroll effect
  useEffect(() => {
    if (items.length <= 4 || isHovered) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        // Calculate exact width of one card + gap (using an approximation based on current layout)
        // lg:min-w-[calc(25%-1.125rem)] + 1.5rem gap (gap-6 = 24px)
        const itemWidth = (clientWidth / 4); // Roughly one item's width including gap
        
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          // Reached the end, scroll back to start smoothly
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Scroll one item width to the right
          scrollRef.current.scrollBy({ left: itemWidth, behavior: 'smooth' });
        }
      }
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [items.length, isHovered]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth / 4; // Scroll by roughly one item width
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  if (items.length === 0) return null;

  return (
    <section 
      className="py-8 bg-white border-b border-gray-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900 capitalize">{title}</h2>
            <div className="flex gap-2">
              <button
                onClick={() => scroll('left')}
                className="p-2 rounded-full border border-gray-200 hover:bg-[#00BFA6] hover:text-white hover:border-[#00BFA6] text-gray-600 transition-all shadow-sm"
                aria-label="Défiler à gauche"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="p-2 rounded-full border border-gray-200 hover:bg-[#00BFA6] hover:text-white hover:border-[#00BFA6] text-gray-600 transition-all shadow-sm"
                aria-label="Défiler à droite"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
          <Link href={`/announces?realEstateCategory=${categoryId}`} className="flex items-center gap-1.5 text-sm font-bold text-[#00BFA6] hover:underline whitespace-nowrap">
            {t("viewAllListings")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className={cn("w-16 h-1 rounded-full mb-6", getCategoryColorById(categoryId))}></div>

        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar scroll-smooth items-stretch"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item) => (
            <div key={item.id} className="min-w-[280px] md:min-w-[300px] lg:w-[calc(25%-1.125rem)] lg:min-w-[calc(25%-1.125rem)] flex-shrink-0 snap-start flex">
              <div className="w-full">
                <PropertyCard announce={item} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Carousel des Catégories avec effet loupe
const CategoryCarousel = ({ categories, onCategoryClick }: { categories: any[], onCategoryClick: (id: string) => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scales, setScales] = useState<number[]>([]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    
    const newScales = categories.map((_, index) => {
        const item = container.children[index] as HTMLElement;
        if (!item) return 0.9;
        const itemCenter = item.offsetLeft + item.offsetWidth / 2;
        const distance = Math.abs(containerCenter - itemCenter);
        
        // Logic de scaling
        const range = 250; 
        let scale = 1.4 - (distance / range) * 0.5; 
        return Math.max(0.9, Math.min(1.4, scale));
    });
    setScales(newScales);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    
    // Trouver l'élément le plus proche du centre actuel
    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    let closestIndex = 0;
    let minDistance = Infinity;

    Array.from(container.children).forEach((child, index) => {
        const item = child as HTMLElement;
        const itemCenter = item.offsetLeft + item.offsetWidth / 2;
        const distance = Math.abs(containerCenter - itemCenter);
        if (distance < minDistance) {
            minDistance = distance;
            closestIndex = index;
        }
    });

    // Calculer l'index cible (un par un)
    let targetIndex = direction === 'left' ? closestIndex - 1 : closestIndex + 1;
    targetIndex = Math.max(0, Math.min(categories.length - 1, targetIndex));

    const targetItem = container.children[targetIndex] as HTMLElement;
    if (targetItem) {
        targetItem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  useEffect(() => {
    handleScroll();
    const container = containerRef.current;
    if (container) {
        container.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleScroll);
        
        // Center initial view
        setTimeout(() => {
            if(container) {
                const middleIndex = Math.floor(categories.length / 2);
                const targetItem = container.children[middleIndex] as HTMLElement;
                if(targetItem) {
                    targetItem.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
                    handleScroll();
                }
            }
        }, 100);

        return () => {
            container.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        }
    }
  }, [categories]);

  return (
    <div className="relative w-full py-12 group px-4 md:px-12">
        {/* Navigation Arrows */}
        <button 
            onClick={() => scroll('left')}
            className="absolute left-0 md:left-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg text-gray-800 hover:text-[#00BFA6] hover:scale-110 border border-gray-100 transition-all opacity-0 group-hover:opacity-100 hidden md:block"
        >
            <ChevronLeft className="h-6 w-6" />
        </button>
        <button 
            onClick={() => scroll('right')}
            className="absolute right-0 md:right-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg text-gray-800 hover:text-[#00BFA6] hover:scale-110 border border-gray-100 transition-all opacity-0 group-hover:opacity-100 hidden md:block"
        >
            <ChevronRight className="h-6 w-6" />
        </button>

        <div 
            ref={containerRef}
            className="flex overflow-x-auto gap-8 px-[calc(50%-60px)] snap-x snap-mandatory hide-scrollbar pb-12 pt-8 items-center"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
            {categories.map((category, index) => {
                const Icon = getIcon(category.iconName);
                const scale = scales[index] || 0.9;
                const isActive = scale > 1.2;

                return (
                    <button
                        key={category.id}
                        onClick={() => {
                            onCategoryClick(category.id);
                            if (containerRef.current) {
                                const item = containerRef.current.children[index] as HTMLElement;
                                if (item) {
                                    item.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                                }
                            }
                        }}
                        className="snap-center flex flex-col items-center gap-6 transition-all duration-300 ease-out min-w-[120px] outline-none"
                        style={{ 
                            transform: `scale(${scale})`,
                            zIndex: isActive ? 10 : 1,
                            opacity: isActive ? 1 : 0.6
                        }}
                    >
                        <div className={cn(
                            "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300",
                            isActive 
                                ? cn("shadow-2xl shadow-gray-200 border-2 border-transparent ring-4 ring-gray-50", getCategoryColorById(category.id).replace('bg-', 'bg-').replace('500', '100').replace('400', '100'))
                                : "bg-white shadow-md border border-gray-100"
                        )}>
                            <Icon className={cn(
                                "h-10 w-10 transition-colors duration-300",
                                isActive ? getIconColorById(category.id) : getIconColorById(category.id)
                            )} />
                        </div>
                        <span className={cn(
                            "text-[10px] md:text-xs uppercase font-bold text-center transition-colors duration-300 max-w-[140px] px-3 py-1.5 rounded-full tracking-widest leading-tight",
                            isActive 
                                ? cn("bg-gray-100", getIconColorById(category.id))
                                : "text-gray-400"
                        )}>
                            {category.label}
                        </span>
                    </button>
                )
            })}
        </div>
        
        {/* Gradients */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none z-20" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none z-20" />
    </div>
  )
}

export default function HomePage() {
  const router = useRouter();
  const t = useTranslations("HomePage");
  const tc = useTranslations("Categories");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [announces, setAnnounces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/announces?realEstateCategory=${categoryId}`)
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % REAL_ESTATE_CATEGORIES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchAnnounces = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await axios.get(`${apiUrl}/announces`);
        setAnnounces(res.data);
      } catch (err) {
        console.error("Error fetching announces:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnnounces();
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % REAL_ESTATE_CATEGORIES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + REAL_ESTATE_CATEGORIES.length) % REAL_ESTATE_CATEGORIES.length);

  const now = new Date();
  const filteredAnnounces = announces.filter(a =>
    a.featuredFrom && a.featuredUntil &&
    new Date(a.featuredFrom) <= now && new Date(a.featuredUntil) >= now
  );

  const CROSS_TYPE_MAP: Record<string, string> = {
    'APPARTEMENT_COMMERCIAL': 'APPARTEMENT',
    'VILLA_COMMERCIALE': 'VILLA',
    'NIVEAU_VILLA_COMMERCIAL': 'NIVEAU_VILLA',
    'IMMEUBLE_BUREAU': 'IMMEUBLE_RESIDENTIEL',
    'APPARTEMENT': 'APPARTEMENT_COMMERCIAL',
    'VILLA': 'VILLA_COMMERCIALE',
    'NIVEAU_VILLA': 'NIVEAU_VILLA_COMMERCIAL',
    'IMMEUBLE_RESIDENTIEL': 'IMMEUBLE_BUREAU',
  };

  const groupedAnnounces = filteredAnnounces.reduce((acc, announce) => {
    let pType = PROPERTY_TYPES.find(t => t.id === announce.property?.propertyType?.toUpperCase());
    if (!pType) pType = PROPERTY_TYPES.find(t => t.label === announce.property?.propertyType);

    if (pType) {
      // Catégorie principale
      const cat = REAL_ESTATE_CATEGORIES.find(c => c.id === pType!.categoryId);
      if (cat) {
        if (!acc[cat.id]) acc[cat.id] = { label: tc(cat.id), items: [] };
        acc[cat.id].items.push(announce);
      }

      // Catégorie miroir si cross-usage activé
      const crossCatId = announce.property?.crossRealEstateType;
      if (announce.property?.acceptsCrossUsage && crossCatId) {
        const crossCat = REAL_ESTATE_CATEGORIES.find(c => c.id === crossCatId);
        if (crossCat && crossCatId !== pType!.categoryId) {
          if (!acc[crossCatId]) acc[crossCatId] = { label: tc(crossCatId), items: [] };
          const originalType = announce.property?.propertyType?.toUpperCase();
          const mappedType = CROSS_TYPE_MAP[originalType] || originalType;
          acc[crossCatId].items.push({
            ...announce,
            property: { ...announce.property, _displayPropertyType: mappedType }
          });
        }
      }
    }
    return acc;
  }, {} as Record<string, { label: string, items: any[] }>);

  // Ordre d'affichage des catégories
  const orderedCategoryIds = [
    "RESIDENTIEL",
    "INDUSTRIEL",
    "HOTELIER",
    "BUREAUX_COMMERCES",
    "TERRAIN_FONCIER",
  ];

  return (
    <div className="flex flex-col min-h-screen font-sans bg-gray-50">

      {/* HERO SECTION */}
      <div className="relative h-[480px] sm:h-[520px] lg:h-[560px] w-full group">
        <div className="absolute inset-0 overflow-hidden bg-[#04222b]">
          {REAL_ESTATE_CATEGORIES.filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i).map((category, index) => (
            <div
              key={category.id}
              className={cn(
                "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                index === currentSlide ? "opacity-100" : "opacity-0"
              )}
            >
              <img
                src={getCategoryHeroImageById(category.id)}
                alt={tc(category.id)}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          ))}
          {/* Voile de marque — navy en dégradé, constant quelle que soit la catégorie affichée */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#022229] via-[#003B4A]/85 to-[#003B4A]/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#022229]/95 via-[#003B4A]/50 to-transparent" />

          {/* Signature : voûte inspirée de l'architecture algérienne, détourant le bas du hero */}
          <svg className="absolute -bottom-px left-0 w-full h-[70px] sm:h-[90px] text-gray-50" viewBox="0 0 1200 90" preserveAspectRatio="none" fill="currentColor" aria-hidden="true">
            <path d="M0,90 L0,55 C120,55 130,10 240,10 C350,10 360,55 480,55 C600,55 600,10 720,10 C840,10 850,55 960,55 C1080,55 1090,10 1200,10 L1200,90 Z" />
          </svg>

          <button onClick={prevSlide} aria-label="Catégorie précédente" className="absolute left-4 sm:left-8 top-[42%] -translate-y-1/2 bg-white/10 hover:bg-white/25 backdrop-blur-md p-2.5 sm:p-3 rounded-full text-white transition-all opacity-0 group-hover:opacity-100 z-20">
            <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" />
          </button>
          <button onClick={nextSlide} aria-label="Catégorie suivante" className="absolute right-4 sm:right-8 top-[42%] -translate-y-1/2 bg-white/10 hover:bg-white/25 backdrop-blur-md p-2.5 sm:p-3 rounded-full text-white transition-all opacity-0 group-hover:opacity-100 z-20">
            <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7" />
          </button>
        </div>

        {/* Contenu : titre + badge catégorie vivant */}
        <div className="relative h-full w-full flex flex-col justify-center pb-10 sm:pb-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 w-full">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-white/80 text-[11px] font-bold uppercase tracking-[0.22em] mb-5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00BFA6]" />
                {t("heroEyebrow")}
              </div>
              <h1 className="font-brand text-[2.3rem] sm:text-5xl lg:text-[3.4rem] leading-[1.08] text-white">
                {t("heroTitle")}<br />
                <span className="text-[#5EEAD4]">{t("heroTitleAccent")}</span>
              </h1>
              <p className="mt-5 text-white/80 text-base sm:text-lg leading-relaxed max-w-xl">
                {t("heroSubtitle")}
              </p>

              <button
                onClick={() => handleCategoryClick(REAL_ESTATE_CATEGORIES.filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i)[currentSlide]?.id)}
                className="mt-7 inline-flex items-center gap-3 bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md rounded-2xl pl-2 pr-4 py-2 transition-colors"
              >
                {(() => {
                  const cats = REAL_ESTATE_CATEGORIES.filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i)
                  const cat = cats[currentSlide]
                  if (!cat) return null
                  const Icon = getIcon(cat.iconName)
                  return (
                    <>
                      <span className="h-8 w-8 rounded-xl bg-[#00BFA6]/20 flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-[#5EEAD4]" />
                      </span>
                      <span className="text-white text-sm font-bold">{tc(cat.id)}</span>
                      <ArrowRight className="h-4 w-4 text-white/60" />
                    </>
                  )
                })()}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chiffres clés — donnée réelle, pas d'avis ou de notes fabriqués */}
      <div className="bg-gray-50 pt-6 sm:pt-8 pb-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-3 divide-x divide-gray-200">
          {[
            { value: `${announces.length || 0}+`, label: t("statListings") },
            { value: "58", label: t("statWilayas") },
            { value: String(REAL_ESTATE_CATEGORIES.filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i).length), label: t("statCategories") },
          ].map((s) => (
            <div key={s.label} className="text-center px-2">
              <div className="font-brand text-2xl sm:text-3xl text-[#003B4A]">{s.value}</div>
              <div className="text-[11px] sm:text-xs text-gray-500 font-medium mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CATÉGORIES EN BULLES — plus de bandeau autour, juste les pastilles */}
      <div className="bg-gray-50 pb-8">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="flex gap-2 items-center justify-center min-w-max mx-auto w-fit">
            {orderedCategoryIds.map(catId => {
              const catDef = REAL_ESTATE_CATEGORIES.find(c => c.id === catId)
              if (!catDef) return null
              const Icon = getIcon(catDef.iconName)
              return (
                <Link
                  key={catId}
                  href={`/announces?realEstateCategory=${catId}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white text-gray-700 text-sm font-bold hover:border-[#00BFA6] hover:text-[#00BFA6] whitespace-nowrap transition-colors shrink-0"
                >
                  <Icon className={`h-4 w-4 ${getIconColorById(catId)}`} />
                  {tc(catId)}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* PROPERTIES BY CATEGORY */}
      {loading ? (
        <div className="py-12 text-center text-gray-500">{t("loadingListings")}</div>
      ) : (
        <>
          {Object.keys(groupedAnnounces).length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-5xl mb-4">🏙️</div>
              <p className="text-gray-500 font-medium">{t("noFeaturedListings")}</p>
              <p className="text-gray-400 text-sm mt-1">{t("browseByCategory")}</p>
            </div>
          ) : (
            orderedCategoryIds.map((catId) => {
              const catData = groupedAnnounces[catId];
              if (catData && catData.items.length > 0) {
                return (
                  <CarouselSection 
                    key={catId} 
                    categoryId={catId} 
                    title={catData.label} 
                    items={catData.items} 
                  />
                );
              }
              return null;
            })
          )}
        </>
      )}

      {/* WHY CHOOSE US */}
      <section className="py-16 sm:py-20 bg-[#003B4A] text-white relative overflow-hidden">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#00BFA6]/10 blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-14">
            <h2 className="font-brand text-3xl md:text-4xl text-white mb-3">{t("whyChooseUsTitle")}</h2>
            <p className="text-white/60 max-w-2xl mx-auto">{t("whyChooseUsSubtitle")}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: ShieldCheck, title: t("whyVerifiedTitle"), desc: t("whyVerifiedDesc") },
              { icon: Globe2, title: t("whyCoverageTitle"), desc: t("whyCoverageDesc") },
              { icon: Users, title: t("whyProfilesTitle"), desc: t("whyProfilesDesc") },
              { icon: Headset, title: t("whySupportTitle"), desc: t("whySupportDesc") },
            ].map((card) => (
              <div key={card.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 hover:bg-white/[0.07] transition-colors">
                <div className="h-11 w-11 rounded-xl bg-[#00BFA6]/15 flex items-center justify-center mb-5">
                  <card.icon className="h-5 w-5 text-[#5EEAD4]" />
                </div>
                <h3 className="font-bold text-white text-[15px] mb-2">{card.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-brand text-3xl text-[#003B4A]">{t("entrustProjectTitle")}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative h-[320px] sm:h-[350px] rounded-3xl overflow-hidden group cursor-pointer shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80"
                alt={t("ownerQuestion")}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#003B4A] via-[#003B4A]/30 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-7 text-center">
                <h3 className="text-xl font-bold text-white mb-4">{t("ownerQuestion")}</h3>
                <Link href="/deposit">
                  <Button className="bg-[#00BFA6] hover:bg-[#00A896] text-white font-bold py-5 px-7 rounded-full">
                    {t("entrustMyProperty")}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative h-[320px] sm:h-[350px] rounded-3xl overflow-hidden group cursor-pointer shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80"
                alt={t("seekerQuestion")}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#003B4A] via-[#003B4A]/30 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-7 text-center">
                <h3 className="text-xl font-bold text-white mb-4">{t("seekerQuestion")}</h3>
                <Link href="/research">
                  <Button className="bg-white text-[#003B4A] hover:bg-white/90 font-bold py-5 px-7 rounded-full">
                    {t("entrustMySearch")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-gray-100 bg-[#003B4A] text-white p-6 text-center shadow-lg">
            <p className="text-base font-semibold tracking-wide">{t("appComingSoon")}</p>
          </div>
        </div>
      </section>

    </div>
  )
}
