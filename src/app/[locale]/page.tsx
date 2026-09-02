"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, MapPin, ChevronLeft, ChevronRight, Search, Building2, Home as HomeIcon, Hotel, Tent, Factory, ConciergeBell, Briefcase, BedDouble as BedDoubleIcon, PartyPopper, Warehouse, Star, Building, Store, Trees, CalendarDays, Users, Mountain, Sparkles, ShieldCheck, Globe2, Headset, Coins, ClipboardList, HandHeart, Apple, PlayCircle, LayoutGrid } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useTranslations, useLocale } from "next-intl"
import { Link, useRouter } from "@/i18n/navigation"
import axios from "axios"
import { motion, useReducedMotion, type Variants } from "framer-motion"
import { PROPERTY_TYPES, REAL_ESTATE_CATEGORIES } from "@/data/propertyTypes"
import { PropertyCard } from "@/components/PropertyCard"
import { WILAYAS } from "@/data/wilayas"
import { COMMUNES } from "@/data/communes"
import { getCategoryColor } from "@/data/categoryColors"

// Entrée du hero — le seul moment chorégraphié de la page (le reste reste calme), chaque ligne
// arrive légèrement après la précédente. `prefers-reduced-motion` désactive le mouvement en
// gardant le contenu visible d'emblée (cf. usage de useReducedMotion plus bas).
const heroStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}
const heroItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}

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
const getCategoryColorById = (categoryId: string) => getCategoryColor(categoryId).bg500;

// Dégradé du hero par catégorie — couleur dynamique par id, donc appliqué via style inline
// (Tailwind ne peut pas générer une classe arbitraire construite au runtime) : à consommer comme
// style={{ backgroundImage: getCategoryHeroGradientById(id) }}.
const getCategoryHeroGradientById = (categoryId: string) => {
  const c = getCategoryColor(categoryId);
  return `linear-gradient(135deg, ${c.hex} 0%, ${c.hex}B3 100%)`;
}

const getCategoryHeroImageById = (categoryId: string) => {
  switch (categoryId) {
    case "RESIDENTIEL": return "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=2400&q=80"
    case "INDUSTRIEL": return "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=2400&q=80"
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
  // En arabe (RTL), la ligne de titre s'inverse visuellement (le flex mirror automatique du
  // navigateur place le titre à droite, les boutons à gauche) — mais les chevrons eux-mêmes ne se
  // retournent jamais tout seuls : on les échange ici pour que chacun pointe encore vers "avant"/
  // "arrière" une fois la ligne inversée, au lieu de pointer dans le mauvais sens visuel.
  const locale = useLocale()
  const isRtl = locale === "ar"
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
  const catColor = getCategoryColor(categoryId);

  return (
    <section
      className="py-8 bg-white dark:bg-transparent border-b border-gray-100 dark:border-white/10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize sm:text-2xl">{title}</h2>
            <div className="hidden gap-2 sm:flex">
              <button
                onClick={() => scroll('left')}
                className="p-2 rounded-full border border-gray-200 dark:border-white/15 text-gray-600 dark:text-white/60 hover:text-white transition-all shadow-sm"
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = catColor.hex; e.currentTarget.style.borderColor = catColor.hex }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.borderColor = '' }}
                aria-label={t("scrollLeft")}
              >
                {isRtl ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
              </button>
              <button
                onClick={() => scroll('right')}
                className="p-2 rounded-full border border-gray-200 dark:border-white/15 text-gray-600 dark:text-white/60 hover:text-white transition-all shadow-sm"
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = catColor.hex; e.currentTarget.style.borderColor = catColor.hex }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.borderColor = '' }}
                aria-label={t("scrollRight")}
              >
                {isRtl ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <Link href={`/announces?realEstateCategory=${categoryId}`} className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-xs font-bold hover:underline sm:text-sm" style={{ color: catColor.hex }}>
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
            <div key={item.id} className="flex w-[calc(100vw-2rem)] min-w-[280px] max-w-[300px] flex-shrink-0 snap-start md:w-[300px] md:min-w-[300px] lg:w-[calc(23%-1.1rem)] lg:min-w-[calc(23%-1.1rem)] lg:max-w-none">
              <div className="min-w-0 w-full">
                <PropertyCard announce={item} autoPlay variant="home" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Mot rotatif — fait défiler les 5 catégories réelles du bien dans le titre "Je confie mon projet [catégorie]".
// Respecte prefers-reduced-motion en figeant sur la première catégorie.
const RotatingCategoryWord = ({ categories, tc }: { categories: { id: string, iconName: string }[], tc: (id: string) => string }) => {
  const [index, setIndex] = useState(0)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  useEffect(() => {
    if (reduced || categories.length <= 1) return
    const id = setInterval(() => setIndex((i) => (i + 1) % categories.length), 2200)
    return () => clearInterval(id)
  }, [reduced, categories.length])

  if (categories.length === 0) return null
  const cat = categories[index]
  const Icon = getIcon(cat.iconName)

  return (
    <span className="relative inline-flex h-[1.2em] overflow-hidden align-bottom">
      <span key={cat.id} className={cn("inline-flex items-center gap-2.5 text-[#00BFA6]", !reduced && "animate-rotate-word-in")}>
        <Icon className="h-[0.78em] w-[0.78em] shrink-0" />
        {tc(cat.id)}
      </span>
    </span>
  )
}

// Barre de recherche du hero — réellement câblée vers /announces (mêmes paramètres que la page
// de recherche : transactionType, realEstateCategory, wilaya, minPrice/maxPrice, nbPieces).
function HeroSearchBar() {
  const router = useRouter();
  const t = useTranslations("HomePage");
  const tc = useTranslations("Categories");
  const [transactionType, setTransactionType] = useState<"" | "SALE" | "RENTAL">("")
  const [category, setCategory] = useState("")
  const [wilaya, setWilaya] = useState("")
  const [commune, setCommune] = useState("")

  // Mêmes données et mêmes valeurs (wilaya.code / commune.id) que le filtre de la page
  // /announces (AnnounceFilter), pour que la recherche depuis l'accueil retombe exactement
  // sur les mêmes résultats que si on affinait ensuite depuis la liste.
  const filteredCommunes = wilaya ? COMMUNES.filter((c) => c.wilayaCode === wilaya) : []

  const submit = () => {
    const params = new URLSearchParams()
    if (transactionType) params.set('transactionType', transactionType)
    if (category) params.set('realEstateCategory', category)
    if (wilaya) params.set('wilaya', wilaya)
    if (commune) params.set('commune', commune)
    router.push(`/announces?${params.toString()}`)
  }

  return (
    <div className="w-full bg-white dark:bg-[#03303c] rounded-[26px] shadow-xl shadow-black/[0.06] border border-gray-100 dark:border-white/10 p-2 sm:p-2.5 flex flex-col lg:flex-row items-stretch gap-2">
      <div className="flex bg-gray-50 dark:bg-white/5 rounded-2xl p-1 shrink-0">
        {([{ id: "SALE", label: t("searchBuy") }, { id: "RENTAL", label: t("searchRent") }] as const).map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => setTransactionType(transactionType === o.id ? "" : (o.id as "SALE" | "RENTAL"))}
            className={cn(
              "px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
              transactionType === o.id ? "bg-[#003B4A] text-white shadow-sm" : "text-gray-500 dark:text-white/60 hover:text-[#003B4A] dark:hover:text-white"
            )}
          >
            {o.label}
          </button>
        ))}
      </div>

      <div className="flex-1 flex items-center gap-2 px-3 border-y lg:border-y-0 lg:border-x border-gray-100 dark:border-white/10 min-w-0">
        <Building2 className="h-4 w-4 text-gray-400 shrink-0" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-transparent text-sm font-semibold text-gray-800 dark:text-white outline-none py-2.5 truncate">
          <option value="">{t("searchCategoryPlaceholder")}</option>
          {REAL_ESTATE_CATEGORIES.filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i).map((c) => (
            <option key={c.id} value={c.id}>{tc(c.id)}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 flex items-center gap-2 px-3 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-white/10 min-w-0">
        <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
        <select value={wilaya} onChange={(e) => { setWilaya(e.target.value); setCommune("") }} className="w-full bg-transparent text-sm font-semibold text-gray-800 dark:text-white outline-none py-2.5 truncate">
          <option value="">{t("searchWilayaPlaceholder")}</option>
          {WILAYAS.map((w) => <option key={w.code} value={w.code}>{w.name}</option>)}
        </select>
      </div>

      <div className="flex-1 flex items-center gap-2 px-3 min-w-0">
        <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
        <select value={commune} onChange={(e) => setCommune(e.target.value)} disabled={!wilaya} className="w-full bg-transparent text-sm font-semibold text-gray-800 dark:text-white outline-none py-2.5 truncate disabled:text-gray-400">
          <option value="">{t("searchCommunePlaceholder")}</option>
          {filteredCommunes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <Button onClick={submit} className="bg-[#00BFA6] hover:bg-[#00A896] text-white rounded-2xl px-6 py-6 lg:py-0 text-sm font-extrabold shrink-0">
        <Search className="h-4 w-4 mr-2" /> {t("searchButton")}
      </Button>
    </div>
  )
}

export default function HomePage() {
  const router = useRouter();
  const t = useTranslations("HomePage");
  const tc = useTranslations("Categories");
  const isRtl = useLocale() === "ar";
  const heroReducedMotion = useReducedMotion();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [announces, setAnnounces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroSlides, setHeroSlides] = useState<{ id: number; categoryId: string | null; imageUrl: string; title: string | null; subtitle: string | null }[]>([]);
  const [partners, setPartners] = useState<{ id: number; name: string; logoUrl: string | null; websiteUrl: string | null }[]>([]);

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/announces?realEstateCategory=${categoryId}`)
  }

  // Slides gérés depuis l'admin (Contenu du site > Slides d'accueil). À défaut, on retombe sur
  // un visuel par domaine généré depuis REAL_ESTATE_CATEGORIES, pour que la page ne soit jamais vide.
  const uniqueCategories = REAL_ESTATE_CATEGORIES.filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i)
  const fallbackSlides = uniqueCategories.map((c) => ({ id: -1, categoryId: c.id, imageUrl: getCategoryHeroImageById(c.id), title: null, subtitle: null }))
  const activeSlides = heroSlides.length > 0 ? heroSlides : fallbackSlides
  const activeSlide = activeSlides[currentSlide % activeSlides.length]
  const activeSlideCategory = activeSlide ? REAL_ESTATE_CATEGORIES.find((c) => c.id === activeSlide.categoryId) : undefined

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.max(activeSlides.length, 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const fetchAnnounces = async () => {
      try {
        const res = await axios.get(`${apiUrl}/announces`);
        setAnnounces(res.data);
      } catch (err) {
        console.error("Error fetching announces:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnnounces();
    fetch(`${apiUrl}/content/hero-slides`).then((r) => r.json()).then((d) => setHeroSlides(Array.isArray(d) ? d : [])).catch(() => {});
    fetch(`${apiUrl}/content/partners`).then((r) => r.json()).then((d) => setPartners(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % Math.max(activeSlides.length, 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % Math.max(activeSlides.length, 1));

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

  // Comptes réels par domaine (toutes les annonces en ligne, pas seulement celles en vedette)
  // pour la rangée "Explorer par type de bien".
  const countsByCategory = announces.reduce((acc: Record<string, number>, announce: any) => {
    let pType = PROPERTY_TYPES.find(t => t.id === announce.property?.propertyType?.toUpperCase());
    if (!pType) pType = PROPERTY_TYPES.find(t => t.label === announce.property?.propertyType);
    if (pType) acc[pType.categoryId] = (acc[pType.categoryId] || 0) + 1;
    return acc;
  }, {});

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  return (
    <div className="flex flex-col min-h-screen font-sans bg-gray-50 dark:bg-transparent">

      {/* HERO SECTION — plein écran, photo edge-to-edge avec fondu texte/image */}
      <div className="bg-white dark:bg-transparent">
        <div className="relative min-h-[560px] sm:min-h-[440px] lg:min-h-[480px] flex items-center group">
          {/* Calque photo — couvre toute la hauteur réelle de la section (variable sur mobile
              selon la longueur du texte traduit), jamais la hauteur fixe d'avant qui rognait le
              contenu en overflow-hidden dès que le texte dépassait 400px sur un petit écran. */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Photo plein cadre, rotation par catégorie */}
            {activeSlides.map((slide, index) => (
              <img
                key={slide.id === -1 ? `fallback-${slide.categoryId}` : slide.id}
                src={slide.id === -1 ? slide.imageUrl : `${apiUrl}${slide.imageUrl}`}
                alt={slide.title || (slide.categoryId ? tc(slide.categoryId) : "")}
                className={cn("absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out", index === currentSlide ? "opacity-100" : "opacity-0")}
              />
            ))}

            {/* Fondu : vert/navy de la charte plein sur le texte, dégradé vers la photo à droite */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#003B4A] via-[#003B4A]/85 to-[#00BFA6]/10 sm:via-[#003B4A]/80 sm:to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#00BFA6]/40 via-transparent to-transparent" />
            {/* Léger fondu bas pour la transition vers la barre de recherche */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#003B4A]/70 to-transparent" />
          </div>

          {/* left-3/right-3 en dur ne s'inverse jamais tout seul en RTL (contrairement à un ordre
              flex) — position ET chevron sont donc échangés ensemble ici pour l'arabe, "précédent"
              restant du côté d'où vient la lecture. */}
          <button onClick={prevSlide} aria-label="Catégorie précédente" className={cn("absolute top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full text-[#003B4A] transition-all opacity-0 group-hover:opacity-100 z-20 hidden sm:block", isRtl ? "right-3" : "left-3")}>
            {isRtl ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
          <button onClick={nextSlide} aria-label="Catégorie suivante" className={cn("absolute top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full text-[#003B4A] transition-all opacity-0 group-hover:opacity-100 z-20 hidden sm:block", isRtl ? "left-3" : "right-3")}>
            {isRtl ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
          {activeSlideCategory && (
            <button
              onClick={() => handleCategoryClick(activeSlideCategory.id)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 inline-flex items-center gap-2 bg-white/90 backdrop-blur-md rounded-full pl-1.5 pr-3.5 py-1.5 text-xs font-bold text-[#003B4A] hover:bg-white transition-colors z-20"
            >
              {(() => {
                const Icon = getIcon(activeSlideCategory.iconName)
                return <><span className="h-6 w-6 rounded-full bg-[#00BFA6]/15 flex items-center justify-center"><Icon className="h-3.5 w-3.5 text-[#00BFA6]" /></span>{tc(activeSlideCategory.id)}</>
              })()}
            </button>
          )}

          {/* Contenu texte — posé sur le fondu, aligné à gauche ; ne fixe plus sa propre hauteur,
              c'est lui qui détermine celle de la section (au moins min-h-*, plus si besoin). */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-14 sm:py-0">
            <motion.div
              className="max-w-xl"
              initial={heroReducedMotion ? "visible" : "hidden"}
              animate="visible"
              variants={heroStagger}
            >
              <motion.div variants={heroItem} className="inline-flex items-center gap-2 text-[#00BFA6] text-[11px] font-bold uppercase tracking-[0.22em] mb-5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00BFA6]" />
                {t("heroEyebrow")}
              </motion.div>
              {activeSlide?.title ? (
                <motion.h1 variants={heroItem} className="font-brand text-[1.9rem] sm:text-5xl lg:text-[3.4rem] leading-[1.15] sm:leading-[1.08] tracking-tight text-white">
                  {activeSlide.title}
                </motion.h1>
              ) : (
                <motion.h1 variants={heroItem} className="font-brand text-[1.9rem] sm:text-5xl lg:text-[3.4rem] leading-[1.15] sm:leading-[1.08] tracking-tight text-white">
                  {t("heroTitle")}<br />
                  <span className="text-[#00BFA6]">{t("heroTitleAccent")}</span>
                </motion.h1>
              )}
              <motion.p variants={heroItem} className="mt-4 sm:mt-5 text-white/70 text-sm sm:text-lg leading-relaxed max-w-lg">
                {activeSlide?.subtitle || t("heroSubtitle")}
              </motion.p>

              <motion.div variants={heroItem} className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3">
                <Link href="/announces">
                  <Button className="bg-[#00BFA6] hover:bg-[#00A896] text-white rounded-full px-7 py-6 text-sm font-extrabold shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-[#00BFA6]/20 hover:-translate-y-0.5 transition-all">
                    {t("viewListings")} <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/faq">
                  <Button variant="outline" className="rounded-full px-7 py-6 text-sm font-extrabold border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:-translate-y-0.5 transition-all">
                    {t("howItWorks")}
                  </Button>
                </Link>
              </motion.div>

              {/* Signaux de confiance réels — pas d'avatars ni de compteurs fictifs ; masqués sur
                  mobile pour laisser respirer la carte de recherche juste en dessous. */}
              <motion.div variants={heroItem} className="mt-6 sm:mt-8 hidden sm:flex flex-wrap items-center gap-x-6 gap-y-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-white/80">
                  <ShieldCheck className="h-4 w-4 text-[#00BFA6]" /> {t("whyVerifiedTitle")}
                </span>
                <span className="flex items-center gap-2 text-sm font-semibold text-white/80">
                  <Globe2 className="h-4 w-4 text-[#00BFA6]" /> {t("statWilayas")}
                </span>
              </motion.div>
            </motion.div>
          </div>

        </div>

        {/* Barre de recherche — chevauche le bas du hero */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 relative -mt-8 z-10">
          <HeroSearchBar />
        </div>
      </div>

      {/* EXPLORER PAR TYPE DE BIEN — comptes réels, rangées compactes pour libérer de la hauteur */}
      <div className="bg-gray-50 dark:bg-transparent pt-6 lg:pt-8 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <h2 className="font-brand text-xl text-[#003B4A] dark:text-white mb-4">{t("exploreTypesTitle")}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {orderedCategoryIds.map(catId => {
              const catDef = REAL_ESTATE_CATEGORIES.find(c => c.id === catId)
              if (!catDef) return null
              const Icon = getIcon(catDef.iconName)
              const catColor = getCategoryColor(catId)
              return (
                <Link
                  key={catId}
                  href={`/announces?realEstateCategory=${catId}`}
                  className="flex items-center gap-3 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-3.5 py-3 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = catColor.hex }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '' }}
                >
                  <span className="h-9 w-9 shrink-0 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: `${catColor.hex}1A` }}>
                    <Icon className="h-4.5 w-4.5" style={{ color: catColor.hex }} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-gray-800 dark:text-white/90 truncate">{tc(catId)}</span>
                    <span className="block text-[11px] text-gray-400 dark:text-white/40 font-medium">{countsByCategory[catId] || 0} {t("listingsCount")}</span>
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* PROPERTIES BY CATEGORY */}
      {loading ? (
        <div className="py-12 text-center text-gray-500 dark:text-white/50">{t("loadingListings")}</div>
      ) : (
        <>
          {Object.keys(groupedAnnounces).length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-5xl mb-4">🏙️</div>
              <p className="text-gray-500 dark:text-white/60 font-medium">{t("noFeaturedListings")}</p>
              <p className="text-gray-400 dark:text-white/40 text-sm mt-1">{t("browseByCategory")}</p>
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

      {/* WHY CHOOSE US — présenté comme un acte certifié, pas une grille de cartes générique */}
      <section className="py-16 sm:py-20 bg-[#003B4A] text-white relative overflow-hidden">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#00BFA6]/10 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-[#00BFA6]/[0.06] blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="font-brand text-3xl md:text-4xl text-white mb-3">{t("whyChooseUsTitle")}</h2>
            <p className="text-white/60 max-w-2xl mx-auto">{t("whyChooseUsSubtitle")}</p>
          </div>

          {/* Panneau "certificat" — perforations en pointillés entre chaque garantie, comme un acte officiel */}
          <div className="relative rounded-[28px] border border-dashed border-white/20 bg-white/[0.03] px-2 py-2 sm:px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: ShieldCheck, title: t("whyVerifiedTitle"), desc: t("whyVerifiedDesc") },
                { icon: Globe2, title: t("whyCoverageTitle"), desc: t("whyCoverageDesc") },
                { icon: Users, title: t("whyProfilesTitle"), desc: t("whyProfilesDesc") },
                { icon: Headset, title: t("whySupportTitle"), desc: t("whySupportDesc") },
              ].map((card, i) => (
                <div
                  key={card.title}
                  className={cn(
                    "px-6 py-8 text-center sm:text-left group",
                    i > 0 && "sm:border-l sm:border-dashed sm:border-white/15",
                    i === 2 && "sm:border-l-0 lg:border-l"
                  )}
                >
                  <div className="mx-auto sm:mx-0 h-12 w-12 rounded-full border border-dashed border-[#00BFA6]/40 flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 group-hover:border-[#00BFA6]/70">
                    <div className="h-8 w-8 rounded-full bg-[#00BFA6]/15 flex items-center justify-center">
                      <card.icon className="h-4 w-4 text-[#5EEAD4]" />
                    </div>
                  </div>
                  <h3 className="font-bold text-white text-[15px] mb-2">{card.title}</h3>
                  <p className="text-white/55 text-sm leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* JE CONFIE MON PROJET — le mot de catégorie défile dans le titre, deux profils distincts */}
      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-brand text-3xl text-[#003B4A] dark:text-white">
              {t("entrustProjectTitle")}{" "}
              <RotatingCategoryWord
                categories={orderedCategoryIds.map(id => REAL_ESTATE_CATEGORIES.find(c => c.id === id)).filter(Boolean) as { id: string, iconName: string }[]}
                tc={tc}
              />
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative bg-white dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/10 p-8 sm:p-10 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-[#00BFA6]/10 hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#00BFA6]" />
              <div className="h-12 w-12 rounded-2xl bg-[#00BFA6]/10 flex items-center justify-center mb-6">
                <Building2 className="h-6 w-6 text-[#00BFA6]" />
              </div>
              <h3 className="text-xl font-bold text-[#003B4A] dark:text-white mb-3">{t("ownerTitle")}</h3>
              <p className="text-gray-500 dark:text-white/60 leading-relaxed mb-7">{t("ownerDesc")}</p>
              <Link href="/deposit">
                <Button className="bg-[#00BFA6] hover:bg-[#00A896] text-white font-bold py-5 px-7 rounded-full">
                  {t("entrustMyProperty")} <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="relative bg-[#003B4A] dark:border dark:border-white/10 rounded-3xl p-8 sm:p-10 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-[#003B4A]/30 hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#5EEAD4]" />
              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                <HandHeart className="h-6 w-6 text-[#5EEAD4]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{t("seekerTitle")}</h3>
              <p className="text-white/60 leading-relaxed mb-7">{t("seekerDesc")}</p>
              <Link href="/research">
                <Button className="bg-white text-[#003B4A] hover:bg-white/90 font-bold py-5 px-7 rounded-full">
                  {t("entrustMySearch")} <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* NOS OFFRES POINTS & BOUTIQUES — la boutique se montre plutôt que de se décrire */}
      <section className="py-16 sm:py-20 bg-white dark:bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-brand text-3xl text-[#003B4A] dark:text-white">{t("pointsSectionTitle")}</h2>
            <p className="text-gray-500 dark:text-white/60 mt-3 max-w-xl mx-auto">{t("pointsSectionSubtitle")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Points — visualisation d'une annonce qui gagne en visibilité */}
            <div className="rounded-3xl border border-gray-100 dark:border-white/10 p-8 sm:p-10 flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="h-12 w-12 rounded-2xl bg-[#00BFA6]/10 flex items-center justify-center mb-6">
                <Coins className="h-6 w-6 text-[#00BFA6]" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wide text-[#00BFA6]">{t("pointsParticulierTitle")}</span>
              <p className="text-gray-500 dark:text-white/60 leading-relaxed mt-3 mb-7">{t("pointsParticulierDesc")}</p>

              {/* Mini-visuel : annonce standard vs annonce boostée par les points */}
              <div className="mt-auto flex items-end gap-4 pt-4">
                <div className="flex-1 rounded-xl border border-gray-100 bg-gray-50 p-3">
                  <div className="h-2 w-10 rounded-full bg-gray-200 mb-2" />
                  <div className="h-1.5 w-16 rounded-full bg-gray-200" />
                </div>
                <div className="flex-1 rounded-xl border border-[#00BFA6]/30 bg-[#00BFA6]/[0.06] p-3 relative">
                  <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-[#00BFA6] flex items-center justify-center">
                    <Star className="h-2.5 w-2.5 text-white fill-white" />
                  </span>
                  <div className="h-2 w-10 rounded-full bg-[#00BFA6]/50 mb-2" />
                  <div className="h-1.5 w-16 rounded-full bg-[#00BFA6]/30" />
                </div>
              </div>

              <Link href="/profile/points" className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-[#003B4A] dark:text-white hover:text-[#00BFA6] transition-colors">
                {t("pointsParticulierCta")} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Boutique — aperçu schématique de la vraie vitrine personnalisable (logo, bannière, réseaux) */}
            <div className="rounded-3xl border border-gray-100 dark:border-white/10 p-8 sm:p-10 flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="h-12 w-12 rounded-2xl bg-[#00BFA6]/10 flex items-center justify-center mb-6">
                <Store className="h-6 w-6 text-[#00BFA6]" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wide text-[#00BFA6]">{t("pointsProTitle")}</span>
              <p className="text-gray-500 dark:text-white/60 leading-relaxed mt-3 mb-7">{t("pointsProDesc")}</p>

              {/* Mini-maquette de la boutique : barre de navigateur + logo + bannière + réseaux */}
              <div className="mt-auto rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="flex items-center gap-1.5 bg-gray-50 border-b border-gray-100 px-3 py-2">
                  <span className="h-2 w-2 rounded-full bg-gray-300" />
                  <span className="h-2 w-2 rounded-full bg-gray-300" />
                  <span className="h-2 w-2 rounded-full bg-gray-300" />
                  <span className="ml-2 text-[10px] text-gray-400 truncate">patrimoine.dz/boutique/votre-marque</span>
                </div>
                <div className="bg-gradient-to-r from-[#003B4A] to-[#00BFA6] h-10" />
                <div className="bg-white px-3 pt-3 pb-3 -mt-5">
                  <div className="h-10 w-10 rounded-full bg-white border-2 border-white shadow flex items-center justify-center overflow-hidden">
                    <div className="h-full w-full bg-[#00BFA6]/15 flex items-center justify-center">
                      <Store className="h-4 w-4 text-[#00BFA6]" />
                    </div>
                  </div>
                  <div className="flex gap-1.5 mt-3">
                    <span className="h-5 rounded-full bg-[#003B4A] px-2.5 flex items-center text-[9px] font-bold text-white">{t("boutiquePreviewLabel")}</span>
                    <span className="h-5 w-10 rounded-full bg-gray-100" />
                    <span className="h-5 w-10 rounded-full bg-gray-100" />
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 mt-3">
                    <div className="h-8 rounded-md bg-gray-100" />
                    <div className="h-8 rounded-md bg-gray-100" />
                    <div className="h-8 rounded-md bg-gray-100" />
                  </div>
                </div>
              </div>

              <Link href="/profile/boutique" className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-[#003B4A] dark:text-white hover:text-[#00BFA6] transition-colors">
                {t("pointsProCta")} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* NOS PARTENAIRES — défilement continu confiné au cadre du titre, n'apparaît que s'il y a des partenaires publiés */}
      {partners.length > 0 && (
        <section className="py-16 sm:py-20 bg-gray-50 dark:bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
              <div>
                <h2 className="font-brand text-3xl text-[#003B4A] dark:text-white">{t("partnersSectionTitle")}</h2>
                <p className="text-gray-500 dark:text-white/60 mt-2">{t("partnersSectionSubtitle")}</p>
              </div>
              <Link href="/partenaires" className="flex items-center gap-1.5 text-sm font-bold text-[#00BFA6] hover:underline whitespace-nowrap">
                {t("partnersSeeAll")} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 py-10">
              <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-white dark:from-[#022229] to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-white dark:from-[#022229] to-transparent z-10 pointer-events-none" />
              <div className="flex w-max animate-marquee">
                {[...partners, ...partners, ...partners, ...partners].map((p, i) => (
                  <div key={`${p.id}-${i}`} className="w-52 sm:w-64 shrink-0 flex items-center justify-center px-8">
                    {p.logoUrl ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${p.logoUrl}`}
                        alt={p.name}
                        className="h-20 sm:h-24 max-w-full object-contain opacity-90 hover:opacity-100 hover:scale-105 transition-all"
                      />
                    ) : (
                      <span className="text-gray-400 dark:text-white/40 font-bold text-sm text-center">{p.name}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* APPLICATION MOBILE — capture réelle de l'app (public/app_mobile.png) */}
      <section className="py-16 sm:py-20 bg-[#022229] relative overflow-hidden">
        <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-[#00BFA6]/[0.06] blur-3xl" />
        <div className="absolute -right-16 top-0 h-80 w-80 rounded-full bg-[#00BFA6]/[0.05] blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-8 items-center">
          {/* Colonne texte */}
          <div className="order-2 md:order-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-[#00BFA6] text-[11px] font-bold uppercase tracking-[0.22em] mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00BFA6]" />
              {t("heroEyebrow")}
            </div>
            <h2 className="font-brand text-[2rem] sm:text-4xl leading-[1.15] text-white mb-4">
              {t("mobileAppHeadline")}<br />
              <span className="text-[#00BFA6]">{t("mobileAppHeadlineAccent")}</span>
            </h2>
            <p className="text-white/60 leading-relaxed max-w-md mx-auto md:mx-0 mb-8">{t("heroSubtitle")}</p>

            <div className="flex flex-col gap-4 max-w-sm mx-auto md:mx-0">
              <div className="flex items-start gap-3">
                <span className="h-9 w-9 shrink-0 rounded-lg bg-[#00BFA6]/10 flex items-center justify-center"><ShieldCheck className="h-4.5 w-4.5 text-[#00BFA6]" /></span>
                <div className="text-left">
                  <p className="text-sm font-bold text-white">{t("whyVerifiedTitle")}</p>
                  <p className="text-xs text-white/50">{t("whyVerifiedDesc")}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="h-9 w-9 shrink-0 rounded-lg bg-[#00BFA6]/10 flex items-center justify-center"><Globe2 className="h-4.5 w-4.5 text-[#00BFA6]" /></span>
                <div className="text-left">
                  <p className="text-sm font-bold text-white">{t("whyCoverageTitle")}</p>
                  <p className="text-xs text-white/50">{t("whyCoverageDesc")}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="h-9 w-9 shrink-0 rounded-lg bg-[#00BFA6]/10 flex items-center justify-center"><Users className="h-4.5 w-4.5 text-[#00BFA6]" /></span>
                <div className="text-left">
                  <p className="text-sm font-bold text-white">{t("whyProfilesTitle")}</p>
                  <p className="text-xs text-white/50">{t("whyProfilesDesc")}</p>
                </div>
              </div>
            </div>

            {/* Badges App Store / Google Play — application pas encore publiée, badges non cliquables */}
            <div className="mt-8 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
                <Apple className="h-6 w-6 text-white" />
                <div className="text-left leading-tight">
                  <p className="text-[9px] text-white/50 uppercase tracking-wide">{t("mobileAppStoreSoon")}</p>
                  <p className="text-sm font-bold text-white">{t("mobileAppStoreApple")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
                <PlayCircle className="h-6 w-6 text-white" />
                <div className="text-left leading-tight">
                  <p className="text-[9px] text-white/50 uppercase tracking-wide">{t("mobileAppStoreSoon")}</p>
                  <p className="text-sm font-bold text-white">{t("mobileAppStoreGoogle")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne téléphone — capture réelle de l'application + chiffres réels en cartes flottantes */}
          <div className="order-1 md:order-2 relative flex justify-center">
            <img
              src="/app_mobile.png"
              alt={t("mobileAppTitle")}
              className="relative z-10 w-[240px] sm:w-[280px] lg:w-[320px] h-auto drop-shadow-2xl"
            />

            <div className="hidden lg:flex items-center gap-2.5 absolute top-8 -left-4 bg-white rounded-2xl shadow-xl shadow-black/20 px-4 py-3 z-20">
              <span className="h-8 w-8 rounded-lg bg-[#00BFA6]/10 flex items-center justify-center"><ShieldCheck className="h-4 w-4 text-[#00BFA6]" /></span>
              <p className="text-xs font-bold text-[#003B4A] whitespace-nowrap">{t("whyVerifiedTitle")}</p>
            </div>

            <div className="hidden lg:flex flex-col gap-2 absolute bottom-16 -right-6 bg-white rounded-2xl shadow-xl shadow-black/20 px-4 py-3.5 z-20 min-w-[168px]">
              <div className="flex items-center gap-2.5">
                <span className="h-8 w-8 shrink-0 rounded-lg bg-[#00BFA6]/10 flex items-center justify-center"><Building2 className="h-4 w-4 text-[#00BFA6]" /></span>
                <div>
                  <p className="text-sm font-extrabold text-[#003B4A] leading-none">{announces.length}</p>
                  <p className="text-[10px] text-gray-400">{t("mobileAppStatListings")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="h-8 w-8 shrink-0 rounded-lg bg-[#00BFA6]/10 flex items-center justify-center"><Globe2 className="h-4 w-4 text-[#00BFA6]" /></span>
                <div>
                  <p className="text-sm font-extrabold text-[#003B4A] leading-none">58</p>
                  <p className="text-[10px] text-gray-400">{t("mobileAppStatWilayas")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="h-8 w-8 shrink-0 rounded-lg bg-[#00BFA6]/10 flex items-center justify-center"><LayoutGrid className="h-4 w-4 text-[#00BFA6]" /></span>
                <div>
                  <p className="text-sm font-extrabold text-[#003B4A] leading-none">{REAL_ESTATE_CATEGORIES.length}</p>
                  <p className="text-[10px] text-gray-400">{t("mobileAppStatCategories")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
