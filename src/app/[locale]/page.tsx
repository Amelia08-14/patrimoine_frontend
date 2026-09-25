"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, MapPin, ChevronLeft, ChevronRight, Search, Building2, Home as HomeIcon, Hotel, Tent, Factory, ConciergeBell, Briefcase, BedDouble as BedDoubleIcon, PartyPopper, Warehouse, Star, Building, Store, Trees, CalendarDays, Users, Mountain, Sparkles, ShieldCheck, Globe2, Headset, Coins, ClipboardList, HandHeart, Apple, PlayCircle, LayoutGrid, ChevronDown, Check, TrendingUp, ShoppingBag } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useTranslations, useLocale } from "next-intl"
import { Link, useRouter } from "@/i18n/navigation"
import axios from "axios"
import { motion, useReducedMotion, type Variants } from "framer-motion"
import { PROPERTY_TYPES, REAL_ESTATE_CATEGORIES, PUBLIC_CATEGORIES } from "@/data/propertyTypes"
import { useLocalizedGeoName, useLocalizedContent } from "@/lib/typeLabels"
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

// Pièce dorée du bandeau « Points » de l'accueil (SVG : dégradé or, liseré, étoile centrale).
function PointsCoin({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} aria-hidden="true">
      <defs>
        <linearGradient id="coinGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFF3B0" />
          <stop offset="0.55" stopColor="#FFC933" />
          <stop offset="1" stopColor="#E08A00" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#coinGold)" stroke="#B45309" strokeWidth="2" />
      <circle cx="32" cy="32" r="22" fill="none" stroke="#FFF3B0" strokeWidth="2" strokeDasharray="3 3" />
      <path d="M32 18l4.2 8.6 9.5 1.4-6.9 6.7 1.6 9.4L32 39.5l-8.4 4.6 1.6-9.4-6.9-6.7 9.5-1.4z" fill="#B45309" opacity="0.85" />
    </svg>
  )
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
          <Link href={`/announces?realEstateCategory=${categoryId}`} className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-xs rtl:text-sm font-bold hover:underline sm:text-sm" style={{ color: catColor.hex }}>
            {t("viewAllListings")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
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

// Liste déroulante « Type de bien » du hero : mêmes pastilles icône + couleur que les tuiles
// « Explorer par type de bien » (en petit), à la place du <select> natif qui ne sait afficher
// que du texte. Fermeture au clic extérieur et à Échap ; le popover s'aligne sur le début de la ligne
// (gauche en LTR, droite en arabe).
function CategorySelect({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  const tc = useTranslations("Categories")
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const options = PUBLIC_CATEGORIES.filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i)
  const selected = options.find((c) => c.id === value)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey) }
  }, [open])

  const chip = (hex: string, Icon: ReturnType<typeof getIcon>, size = "h-7 w-7") => (
    <span className={cn("shrink-0 rounded-lg flex items-center justify-center", size)} style={{ backgroundColor: `${hex}1A` }}>
      <Icon className="h-3.5 w-3.5" style={{ color: hex }} />
    </span>
  )

  return (
    <div ref={ref} className="relative w-full min-w-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 py-1.5 text-sm font-semibold text-gray-800 dark:text-white text-start"
      >
        {selected ? chip(getCategoryColor(selected.id).hex, getIcon(selected.iconName), "h-7 w-7") : <Building2 className="h-4 w-4 text-gray-400 shrink-0" />}
        <span className={cn("flex-1 truncate", !selected && "text-gray-800 dark:text-white")}>{selected ? tc(selected.id) : placeholder}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-gray-400 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div role="listbox" className="absolute start-0 top-full z-30 mt-3 w-64 max-w-[85vw] rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#03303c] p-1.5 shadow-xl shadow-black/10">
          <button
            type="button"
            role="option"
            aria-selected={!value}
            onClick={() => { onChange(""); setOpen(false) }}
            className={cn("w-full flex items-center gap-2.5 rounded-xl px-2 py-2 text-start transition-colors hover:bg-gray-50 dark:hover:bg-white/5", !value && "bg-gray-50 dark:bg-white/5")}
          >
            <span className="h-7 w-7 shrink-0 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center"><LayoutGrid className="h-3.5 w-3.5 text-gray-500 dark:text-white/60" /></span>
            <span className="flex-1 truncate text-[13px] font-semibold text-gray-700 dark:text-white/80">{placeholder}</span>
            {!value && <Check className="h-3.5 w-3.5 text-gray-400" />}
          </button>
          {options.map((c) => {
            const color = getCategoryColor(c.id)
            const active = c.id === value
            return (
              <button
                key={c.id}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => { onChange(c.id); setOpen(false) }}
                className="w-full flex items-center gap-2.5 rounded-xl px-2 py-2 text-start transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
                style={active ? { backgroundColor: `${color.hex}12` } : undefined}
              >
                {chip(color.hex, getIcon(c.iconName))}
                <span className="flex-1 truncate text-[13px] font-semibold text-gray-800 dark:text-white/90" style={active ? { color: color.hex } : undefined}>{tc(c.id)}</span>
                {active && <Check className="h-3.5 w-3.5" style={{ color: color.hex }} />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Liste déroulante générique du hero (wilaya, commune) : même style que « Type de bien », avec une
// pastille (ex. le numéro de la wilaya) devant chaque libellé et une recherche en haut de liste
// (58 wilayas / des centaines de communes : défiler ne suffit pas). Remplace le <select> natif.
type ListOption = { value: string; label: string; badge?: string }
function ListSelect({ value, onChange, options, placeholder, searchPlaceholder, disabled }: {
  value: string; onChange: (v: string) => void; options: ListOption[]; placeholder: string; searchPlaceholder: string; disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const ref = useRef<HTMLDivElement>(null)
  const selected = options.find((o) => o.value === value)
  const q = query.trim().toLowerCase()
  const shown = q ? options.filter((o) => o.label.toLowerCase().includes(q) || (o.badge ? o.badge.startsWith(q) : false)) : options

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey) }
  }, [open])
  useEffect(() => { if (!open) setQuery("") }, [open])
  useEffect(() => { if (disabled) setOpen(false) }, [disabled])

  const badge = (text: string, active = false) => (
    <span className={cn("shrink-0 min-w-[1.9rem] h-6 px-1.5 rounded-md flex items-center justify-center text-[11px] font-bold tabular-nums", active ? "bg-[#00BFA6] text-white" : "bg-[#00BFA6]/10 text-[#00BFA6]")}>{text}</span>
  )

  return (
    <div ref={ref} className="relative w-full min-w-0">
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn("w-full flex items-center gap-2 py-1.5 text-sm font-semibold text-start", disabled ? "text-gray-400 cursor-not-allowed" : "text-gray-800 dark:text-white")}
      >
        <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
        {selected?.badge && badge(selected.badge)}
        <span className="flex-1 truncate">{selected ? selected.label : placeholder}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-gray-400 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute start-0 top-full z-30 mt-3 w-72 max-w-[85vw] rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#03303c] shadow-xl shadow-black/10">
          <div className="p-2 border-b border-gray-100 dark:border-white/10">
            <div className="flex items-center gap-2 rounded-xl bg-gray-50 dark:bg-white/5 px-3">
              <Search className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent py-2 text-[13px] font-medium text-gray-800 dark:text-white outline-none placeholder:text-gray-400"
              />
            </div>
          </div>
          <div role="listbox" className="max-h-64 overflow-y-auto p-1.5">
            {!q && (
              <button
                type="button"
                role="option"
                aria-selected={!value}
                onClick={() => { onChange(""); setOpen(false) }}
                className={cn("w-full flex items-center gap-2.5 rounded-xl px-2 py-2 text-start transition-colors hover:bg-gray-50 dark:hover:bg-white/5", !value && "bg-gray-50 dark:bg-white/5")}
              >
                <span className="shrink-0 min-w-[1.9rem] h-6 rounded-md bg-gray-100 dark:bg-white/10 flex items-center justify-center"><LayoutGrid className="h-3 w-3 text-gray-500 dark:text-white/60" /></span>
                <span className="flex-1 truncate text-[13px] font-semibold text-gray-700 dark:text-white/80">{placeholder}</span>
                {!value && <Check className="h-3.5 w-3.5 text-gray-400" />}
              </button>
            )}
            {shown.map((o) => {
              const active = o.value === value
              return (
                <button
                  key={o.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => { onChange(o.value); setOpen(false) }}
                  className={cn("w-full flex items-center gap-2.5 rounded-xl px-2 py-2 text-start transition-colors hover:bg-gray-50 dark:hover:bg-white/5", active && "bg-[#00BFA6]/10")}
                >
                  {o.badge && badge(o.badge, active)}
                  <span className={cn("flex-1 truncate text-[13px] font-semibold", active ? "text-[#00BFA6]" : "text-gray-800 dark:text-white/90")}>{o.label}</span>
                  {active && <Check className="h-3.5 w-3.5 text-[#00BFA6]" />}
                </button>
              )
            })}
            {shown.length === 0 && <p className="px-3 py-4 text-center text-xs text-gray-400">—</p>}
          </div>
        </div>
      )}
    </div>
  )
}

// Barre de recherche du hero — réellement câblée vers /announces (mêmes paramètres que la page
// de recherche : transactionType, realEstateCategory, wilaya, minPrice/maxPrice, nbPieces).
type SearchFilters = { transactionType: "" | "SALE" | "RENTAL"; category: string; wilaya: string; commune: string }
const EMPTY_SEARCH_FILTERS: SearchFilters = { transactionType: "", category: "", wilaya: "", commune: "" }

// L'état des filtres vit dans HomePage : chaque clic met à jour immédiatement les annonces affichées
// sous la barre (filtrage en direct) ; le bouton « Rechercher » ne fait plus qu'ouvrir la page complète.
function HeroSearchBar({ filters, onChange }: { filters: SearchFilters; onChange: (patch: Partial<SearchFilters>) => void }) {
  const router = useRouter();
  const t = useTranslations("HomePage");
  const geoName = useLocalizedGeoName();
  const { transactionType, category, wilaya, commune } = filters
  const setTransactionType = (v: "" | "SALE" | "RENTAL") => onChange({ transactionType: v })
  const setCategory = (v: string) => onChange({ category: v })
  const setCommune = (v: string) => onChange({ commune: v })

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
              transactionType === o.id ? (o.id === "SALE" ? "bg-[#00BFA6] text-white shadow-sm" : "bg-[#003B4A] text-white shadow-sm") : "text-gray-500 dark:text-white/60 hover:text-[#003B4A] dark:hover:text-white"
            )}
          >
            {o.label}
          </button>
        ))}
      </div>

      <div className="flex-1 flex items-center gap-2 px-3 border-y lg:border-y-0 lg:border-x border-gray-100 dark:border-white/10 min-w-0">
        <CategorySelect value={category} onChange={setCategory} placeholder={t("searchCategoryPlaceholder")} />
      </div>

      <div className="flex-1 flex items-center gap-2 px-3 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-white/10 min-w-0">
        <ListSelect
          value={wilaya}
          onChange={(v) => onChange({ wilaya: v, commune: "" })}
          options={WILAYAS.map((w) => ({ value: w.code, label: geoName(w), badge: w.code }))}
          placeholder={t("searchWilayaPlaceholder")}
          searchPlaceholder={t("searchFilterPlaceholder")}
        />
      </div>

      <div className="flex-1 flex items-center gap-2 px-3 min-w-0">
        <ListSelect
          value={commune}
          onChange={setCommune}
          options={filteredCommunes.map((c) => ({ value: String(c.id), label: geoName(c) }))}
          placeholder={t("searchCommunePlaceholder")}
          searchPlaceholder={t("searchFilterPlaceholder")}
          disabled={!wilaya}
        />
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
  const [heroSlides, setHeroSlides] = useState<{ id: number; categoryId: string | null; imageUrl: string; title: string | null; titleAr?: string | null; titleEn?: string | null; subtitle: string | null; subtitleAr?: string | null; subtitleEn?: string | null; buttonLabel?: string | null; buttonLabelAr?: string | null; buttonLabelEn?: string | null; showButton1?: boolean; button2Label?: string | null; button2LabelAr?: string | null; button2LabelEn?: string | null; button2Link?: string | null; showButton2?: boolean; link?: string | null }[]>([]);
  const lc = useLocalizedContent();
  const [searchFilters, setSearchFilters] = useState<SearchFilters>(EMPTY_SEARCH_FILTERS);
  const [partners, setPartners] = useState<{ id: number; name: string; nameAr?: string | null; nameEn?: string | null; logoUrl: string | null; websiteUrl: string | null }[]>([]);

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/announces?realEstateCategory=${categoryId}`)
  }

  // Slides gérés depuis l'admin (Contenu du site > Slides d'accueil). À défaut, on retombe sur
  // un visuel par domaine généré depuis REAL_ESTATE_CATEGORIES, pour que la page ne soit jamais vide.
  const uniqueCategories = PUBLIC_CATEGORIES.filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i)
  const fallbackSlides = uniqueCategories.map((c) => ({ id: -1, categoryId: c.id, imageUrl: getCategoryHeroImageById(c.id), title: null, titleAr: null, titleEn: null, subtitle: null, subtitleAr: null, subtitleEn: null, buttonLabel: null, buttonLabelAr: null, buttonLabelEn: null, showButton1: true, button2Label: null, button2LabelAr: null, button2LabelEn: null, button2Link: null, showButton2: true, link: null }))
  const activeSlides = heroSlides.length > 0 ? heroSlides : fallbackSlides
  const activeSlide = activeSlides[currentSlide % activeSlides.length]
  const heroButtonLabel = lc(activeSlide?.buttonLabel, activeSlide?.buttonLabelAr, activeSlide?.buttonLabelEn) || t("viewListings")
  const heroButton2Label = lc(activeSlide?.button2Label, activeSlide?.button2LabelAr, activeSlide?.button2LabelEn) || t("howItWorks")
  const showHeroButton1 = activeSlide?.showButton1 !== false
  const showHeroButton2 = activeSlide?.showButton2 !== false
  const renderHeroLink = (href: string, node: React.ReactNode) =>
    /^https?:\/\//i.test(href)
      ? <a href={href} target="_blank" rel="noopener noreferrer">{node}</a>
      : <Link href={href as any}>{node}</Link>
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
  const featuredAnnounces = announces.filter(a =>
    a.featuredFrom && a.featuredUntil &&
    new Date(a.featuredFrom) <= now && new Date(a.featuredUntil) >= now
  );

  // Filtrage en direct depuis la barre de recherche : mêmes règles que /announces (type de
  // transaction, wilaya par préfixe du code postal, commune par id) pour que les résultats de
  // l'accueil soient exactement ceux de la page complète. La catégorie est appliquée au regroupement.
  const hasLiveFilter = Object.values(searchFilters).some(Boolean);
  const matchesSearchFilters = (a: any) => {
    if (searchFilters.transactionType && a.type !== searchFilters.transactionType) return false;
    if (searchFilters.wilaya) {
      const cityCode = a.property?.address?.town?.city?.code;
      if (!cityCode || !cityCode.toString().startsWith(searchFilters.wilaya)) return false;
    }
    if (searchFilters.commune && a.property?.address?.town?.id?.toString() !== searchFilters.commune) return false;
    return true;
  };
  // Sans filtre : les annonces mises en avant (comportement d'origine). Avec un filtre : toutes les
  // annonces en ligne qui correspondent, sinon un filtre sur peu d'annonces vedettes ne montrerait rien.
  const filteredAnnounces = (hasLiveFilter ? announces : featuredAnnounces).filter(matchesSearchFilters);

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

  const groupedAll = filteredAnnounces.reduce((acc, announce) => {
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

  const groupedAnnounces: Record<string, { label: string; items: any[] }> = searchFilters.category
    ? (groupedAll[searchFilters.category] ? { [searchFilters.category]: groupedAll[searchFilters.category] } : {})
    : groupedAll;
  const liveResultsCount = Object.values(groupedAnnounces).reduce((n, g) => n + g.items.length, 0);
  const liveResultsHref = (() => {
    const params = new URLSearchParams();
    if (searchFilters.transactionType) params.set('transactionType', searchFilters.transactionType);
    if (searchFilters.category) params.set('realEstateCategory', searchFilters.category);
    if (searchFilters.wilaya) params.set('wilaya', searchFilters.wilaya);
    if (searchFilters.commune) params.set('commune', searchFilters.commune);
    return `/announces?${params.toString()}`;
  })();

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
  const countsByCategory = announces.filter(matchesSearchFilters).reduce((acc: Record<string, number>, announce: any) => {
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
                alt={lc(slide.title, slide.titleAr, slide.titleEn) || (slide.categoryId ? tc(slide.categoryId) : "")}
                className={cn("absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out", index === currentSlide ? "opacity-100" : "opacity-0")}
              />
            ))}

            {/* Fondu : vert/navy de la charte plein sur le texte, dégradé vers la photo à droite */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#003B4A] via-[#003B4A]/85 to-[#00BFA6]/10 sm:via-[#003B4A]/80 sm:to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#00BFA6]/40 via-transparent to-transparent" />
            {/* Léger fondu bas pour la transition vers la barre de recherche */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#003B4A]/70 to-transparent" />
          </div>

          {/* Lien de renvoi du slide sur la photo elle-même (pas seulement sur le bouton CTA) :
              calque cliquable sous le texte (z-[5] < z-10) ; le conteneur de texte est en
              pointer-events-none et seul son contenu réel reprend les clics. */}
          {activeSlide?.link && (/^https?:\/\//i.test(activeSlide.link) ? (
            <a
              href={activeSlide.link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={lc(activeSlide.title, activeSlide.titleAr, activeSlide.titleEn) || t("viewListings")}
              className="absolute inset-0 z-[5] cursor-pointer"
            />
          ) : (
            <Link
              href={activeSlide.link as any}
              aria-label={lc(activeSlide.title, activeSlide.titleAr, activeSlide.titleEn) || t("viewListings")}
              className="absolute inset-0 z-[5] cursor-pointer"
            />
          ))}

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
              className="absolute top-4 right-4 sm:top-6 sm:right-6 inline-flex items-center gap-2 bg-white/90 backdrop-blur-md rounded-full pl-1.5 pr-3.5 py-1.5 text-xs rtl:text-sm font-bold text-[#003B4A] hover:bg-white transition-colors z-20"
            >
              {(() => {
                const Icon = getIcon(activeSlideCategory.iconName)
                return <><span className="h-6 w-6 rounded-full bg-[#00BFA6]/15 flex items-center justify-center"><Icon className="h-3.5 w-3.5 text-[#00BFA6]" /></span>{tc(activeSlideCategory.id)}</>
              })()}
            </button>
          )}

          {/* Contenu texte — posé sur le fondu, aligné à gauche ; ne fixe plus sa propre hauteur,
              c'est lui qui détermine celle de la section (au moins min-h-*, plus si besoin). */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-14 sm:py-0 pointer-events-none">
            <motion.div
              className="max-w-xl pointer-events-auto"
              initial={heroReducedMotion ? "visible" : "hidden"}
              animate="visible"
              variants={heroStagger}
            >
              <motion.div variants={heroItem} className="inline-flex items-center gap-2 text-[#00BFA6] text-[11px] rtl:text-xs font-bold uppercase tracking-[0.22em] mb-5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00BFA6]" />
                {t("heroEyebrow")}
              </motion.div>
              {lc(activeSlide?.title, activeSlide?.titleAr, activeSlide?.titleEn) ? (
                <motion.h1 variants={heroItem} className="font-brand text-[1.9rem] sm:text-5xl lg:text-[3.4rem] leading-[1.15] sm:leading-[1.08] tracking-tight text-white">
                  {lc(activeSlide?.title, activeSlide?.titleAr, activeSlide?.titleEn)}
                </motion.h1>
              ) : (
                <motion.h1 variants={heroItem} className="font-brand text-[1.9rem] sm:text-5xl lg:text-[3.4rem] leading-[1.15] sm:leading-[1.08] tracking-tight text-white">
                  {t("heroTitle")}<br />
                  <span className="text-[#00BFA6]">{t("heroTitleAccent")}</span>
                </motion.h1>
              )}
              <motion.p variants={heroItem} className="mt-4 sm:mt-5 text-white/70 text-sm sm:text-lg leading-relaxed max-w-lg">
                {lc(activeSlide?.subtitle, activeSlide?.subtitleAr, activeSlide?.subtitleEn) || t("heroSubtitle")}
              </motion.p>

              {/* Deux boutons pilotés par le slide (texte FR/AR/EN + lien chacun), affichables séparément :
                  un seul, les deux, ou aucun. Valeurs par défaut : « Voir les annonces » → /announces et
                  « Comment ça marche » → /faq. */}
              {(showHeroButton1 || showHeroButton2) && (
                <motion.div variants={heroItem} className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3">
                  {showHeroButton1 && renderHeroLink(activeSlide?.link || "/announces",
                    <Button className="bg-[#00BFA6] hover:bg-[#00A896] text-white rounded-full px-7 py-6 text-sm font-extrabold shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-[#00BFA6]/20 hover:-translate-y-0.5 transition-all">
                      {heroButtonLabel} <ArrowRight className="h-4 w-4 ml-2 rtl:rotate-180" />
                    </Button>
                  )}
                  {showHeroButton2 && renderHeroLink(activeSlide?.button2Link || "/faq",
                    <Button variant="outline" className="rounded-full px-7 py-6 text-sm font-extrabold border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:-translate-y-0.5 transition-all">
                      {heroButton2Label}
                    </Button>
                  )}
                </motion.div>
              )}

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
          <HeroSearchBar filters={searchFilters} onChange={(patch) => setSearchFilters((f) => ({ ...f, ...patch }))} />
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
                  style={searchFilters.category === catId ? { borderColor: catColor.hex } : undefined}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = catColor.hex }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = searchFilters.category === catId ? catColor.hex : '' }}
                >
                  <span className="h-9 w-9 shrink-0 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: `${catColor.hex}1A` }}>
                    <Icon className="h-4.5 w-4.5" style={{ color: catColor.hex }} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-gray-800 dark:text-white/90 truncate">{tc(catId)}</span>
                    <span className="block text-[11px] rtl:text-xs text-gray-400 dark:text-white/40 font-medium">{countsByCategory[catId] || 0} {t("listingsCount")}</span>
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
          {hasLiveFilter && (
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-10 pb-2 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-bold text-[#003B4A] dark:text-white">{t("liveResultsCount", { count: liveResultsCount })}</p>
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => setSearchFilters(EMPTY_SEARCH_FILTERS)} className="text-sm font-semibold text-gray-500 dark:text-white/60 hover:text-[#003B4A] dark:hover:text-white">{t("liveResultsReset")}</button>
                <Link href={liveResultsHref as any} className="inline-flex items-center gap-1.5 text-sm font-bold text-[#00BFA6] hover:underline">
                  {t("liveResultsSeeAll")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Link>
              </div>
            </div>
          )}
          {Object.keys(groupedAnnounces).length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-5xl mb-4">🏙️</div>
              <p className="text-gray-500 dark:text-white/60 font-medium">{hasLiveFilter ? t("noFilteredListings") : t("noFeaturedListings")}</p>
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
        {/* Photo en fond en rapport avec l'activité (immeuble résidentiel), visible au centre et fondue
            dans le navy en haut et en bas ; le panneau de garanties reste lisible grâce à son propre voile. */}
        <img src="/why-bg.jpg" alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#003B4A] via-[#003B4A]/55 to-[#003B4A]" />
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#00BFA6]/10 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-[#00BFA6]/[0.06] blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="font-brand text-3xl md:text-4xl text-white mb-3">{t("whyChooseUsTitle")}</h2>
            <p className="text-white/60 max-w-2xl mx-auto">{t("whyChooseUsSubtitle")}</p>
          </div>

          {/* Panneau "certificat" — perforations en pointillés entre chaque garantie, comme un acte officiel */}
          <div className="relative rounded-[28px] border border-dashed border-white/25 bg-[#003B4A]/60 backdrop-blur-sm px-2 py-2 sm:px-4">
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
            <div className="relative bg-white dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/10 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-[#00BFA6]/10 hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#00BFA6] z-10" />
              <div className="relative h-36 overflow-hidden">
                <img src="/société.jpg" alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#03303c] to-transparent" />
              </div>
              <div className="p-8 sm:p-10 pt-0">
              <div className="h-12 w-12 rounded-2xl bg-[#00BFA6]/10 flex items-center justify-center mb-6 -mt-6 relative">
                <Building2 className="h-6 w-6 text-[#00BFA6]" />
              </div>
              <h3 className="text-xl font-bold text-[#003B4A] dark:text-white mb-3">{t("ownerTitle")}</h3>
              <p className="text-gray-500 dark:text-white/60 leading-relaxed mb-7">{t("ownerDesc")}</p>
              <Link href="/deposit">
                <Button className="bg-[#00BFA6] hover:bg-[#00A896] text-white font-bold py-5 px-7 rounded-full">
                  {t("entrustMyProperty")} <ArrowRight className="h-4 w-4 ml-2 rtl:rotate-180" />
                </Button>
              </Link>
              </div>
            </div>
            <div className="relative bg-[#003B4A] dark:border dark:border-white/10 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-[#003B4A]/30 hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#5EEAD4] z-10" />
              {/* Même principe que la carte "déposer" : bandeau photo qui fond dans la couleur de la carte */}
              <div className="relative h-36 overflow-hidden">
                <img src="/seeker-bg.jpg" alt="" loading="lazy" className="h-full w-full object-cover object-[50%_30%]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#003B4A] to-transparent" />
              </div>
              <div className="p-8 sm:p-10 pt-0">
                <div className="h-12 w-12 rounded-2xl bg-[#0b4a5a] flex items-center justify-center mb-6 -mt-6 relative">
                  <HandHeart className="h-6 w-6 text-[#5EEAD4]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{t("seekerTitle")}</h3>
                <p className="text-white/60 leading-relaxed mb-7">{t("seekerDesc")}</p>
                <Link href="/research">
                  <Button className="bg-white text-[#003B4A] hover:bg-white/90 font-bold py-5 px-7 rounded-full">
                    {t("entrustMySearch")} <ArrowRight className="h-4 w-4 ml-2 rtl:rotate-180" />
                  </Button>
                </Link>
              </div>
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
            <div className="group rounded-3xl border border-gray-100 dark:border-white/10 overflow-hidden flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              {/* Bandeau POINTS : dégradé chaud (or → orange → framboise), pièces qui flottent, étincelles */}
              <div className="relative h-40 overflow-hidden" style={{ backgroundImage: "linear-gradient(135deg,#FFC93C 0%,#FF8A1F 48%,#F43F5E 100%)" }}>
                <div className="absolute -top-12 -start-10 h-44 w-44 rounded-full bg-white/30 blur-2xl" />
                <div className="absolute -bottom-14 end-4 h-48 w-48 rounded-full bg-[#F43F5E]/40 blur-2xl" />
                <TrendingUp className="absolute bottom-3 end-5 h-24 w-24 text-white/25 rtl:-scale-x-100" strokeWidth={2.5} />
                <PointsCoin className="absolute start-[10%] top-[24%] h-16 w-16 animate-float drop-shadow-lg" style={{ ["--float-rot" as any]: "-8deg" }} />
                <PointsCoin className="absolute start-[38%] top-[8%] h-10 w-10 animate-float drop-shadow-md" style={{ animationDelay: "-1.6s", ["--float-rot" as any]: "10deg" }} />
                <PointsCoin className="absolute start-[30%] bottom-[10%] h-12 w-12 animate-float drop-shadow-md" style={{ animationDelay: "-3.1s", ["--float-rot" as any]: "-4deg" }} />
                <Star className="absolute start-[58%] top-[18%] h-5 w-5 fill-white text-white animate-twinkle" />
                <Star className="absolute start-[70%] bottom-[22%] h-3.5 w-3.5 fill-white text-white animate-twinkle" style={{ animationDelay: "-1.2s" }} />
                <Sparkles className="absolute start-[52%] bottom-[12%] h-6 w-6 text-white animate-twinkle" style={{ animationDelay: "-0.6s" }} />
              </div>
              <div className="p-8 sm:p-10 pt-0 flex flex-col flex-1">
              <div className="h-12 w-12 rounded-2xl bg-[#F59E0B]/10 flex items-center justify-center mb-6 -mt-6 relative backdrop-blur-sm">
                <Coins className="h-6 w-6 text-[#C2570C]" />
              </div>
              <span className="text-[11px] rtl:text-xs font-bold uppercase tracking-wide text-[#C2570C]">{t("pointsAllTitle")}</span>
              <p className="text-gray-500 dark:text-white/60 leading-relaxed mt-3 mb-7">{t("pointsAllDesc")}</p>

              {/* Schéma explicatif : 3 étapes (acheter → booster → visibilité), puis avant/après d'une annonce */}
              <div className="mt-auto space-y-5 pt-4">
                <div className="flex items-start justify-between gap-2">
                  {[
                    { icon: Coins, label: t("pointsStep1") },
                    { icon: Sparkles, label: t("pointsStep2") },
                    { icon: Star, label: t("pointsStep3") },
                  ].map((step, i) => (
                    <div key={step.label} className="flex flex-1 items-start gap-2">
                      <div className="flex flex-1 flex-col items-center text-center gap-2">
                        <span className="relative h-11 w-11 rounded-full bg-[#F59E0B]/10 border border-dashed border-[#F59E0B]/40 flex items-center justify-center">
                          <step.icon className="h-5 w-5 text-[#C2570C]" />
                          <span className="absolute -top-1 -left-1 h-4 w-4 rounded-full bg-[#003B4A] text-white text-[9px] font-bold flex items-center justify-center">{i + 1}</span>
                        </span>
                        <span className="text-[11px] rtl:text-xs font-semibold leading-tight text-[#003B4A] dark:text-white/80">{step.label}</span>
                      </div>
                      {i < 2 && <ArrowRight className="h-4 w-4 mt-3.5 shrink-0 text-gray-300 dark:text-white/30 rtl:rotate-180" />}
                    </div>
                  ))}
                </div>

                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <div className="rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-3">
                      <div className="h-10 rounded-md bg-gray-200 dark:bg-white/10 mb-2" />
                      <div className="h-2 w-12 rounded-full bg-gray-200 dark:bg-white/10 mb-1.5" />
                      <div className="h-1.5 w-20 rounded-full bg-gray-200 dark:bg-white/10" />
                    </div>
                    <p className="mt-1.5 text-center text-[10px] rtl:text-xs text-gray-400 dark:text-white/40">{t("pointsVisualStandard")}</p>
                  </div>
                  <div className="flex-1">
                    <div className="relative rounded-xl border border-[#F59E0B]/40 bg-[#F59E0B]/[0.06] p-3 shadow-md shadow-[#F59E0B]/10">
                      <span className="absolute -top-2 ltr:-right-2 rtl:-left-2 inline-flex items-center gap-1 rounded-full bg-[#F59E0B] px-2 py-0.5 text-[9px] font-bold text-white">
                        <Star className="h-2.5 w-2.5 fill-white" /> {t("pointsFeaturedBadge")}
                      </span>
                      <div className="h-10 rounded-md bg-[#F59E0B]/25 mb-2" />
                      <div className="h-2 w-12 rounded-full bg-[#F59E0B]/50 mb-1.5" />
                      <div className="h-1.5 w-20 rounded-full bg-[#F59E0B]/30" />
                    </div>
                    <p className="mt-1.5 text-center text-[10px] rtl:text-xs font-semibold text-[#C2570C]">{t("pointsVisualFeatured")}</p>
                  </div>
                </div>
              </div>

              <Link href="/profile/points" className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-[#003B4A] dark:text-white hover:text-[#C2570C] transition-colors">
                {t("pointsParticulierCta")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </div>
            </div>

            {/* Boutique — aperçu schématique de la vraie vitrine personnalisable (logo, bannière, réseaux) */}
            <div className="group rounded-3xl border border-gray-100 dark:border-white/10 overflow-hidden flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              {/* Bandeau BOUTIQUE : dégradé froid (turquoise → bleu → violet), auvent rayé, vitrine et étiquettes */}
              <div className="relative h-40 overflow-hidden" style={{ backgroundImage: "linear-gradient(135deg,#00D4B4 0%,#0094BD 46%,#5B4DE6 100%)" }}>
                <div className="absolute -bottom-16 -start-8 h-48 w-48 rounded-full bg-[#5B4DE6]/50 blur-2xl" />
                <div className="absolute -top-10 end-6 h-40 w-40 rounded-full bg-white/25 blur-2xl" />
                <svg viewBox="0 0 400 40" preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-9 w-full drop-shadow-md" aria-hidden="true">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <path key={i} d={`M${i * 40} 0h40v14a20 20 0 0 1 -40 0z`} fill={i % 2 === 0 ? "#FFFFFF" : "#FFE27A"} />
                  ))}
                </svg>
                <Store className="absolute bottom-3 start-1/2 h-20 w-20 -translate-x-1/2 rtl:translate-x-1/2 text-white drop-shadow-lg" strokeWidth={1.6} />
                <ShoppingBag className="absolute start-[12%] top-[46%] h-9 w-9 text-white/85 animate-float" style={{ ["--float-rot" as any]: "-10deg" }} />
                <span className="absolute end-[12%] top-[40%] animate-float rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[#5B4DE6] shadow-lg" style={{ animationDelay: "-2s", ["--float-rot" as any]: "8deg" }}>-20%</span>
                <span className="absolute start-[26%] bottom-[16%] animate-float rounded-full bg-[#FFE27A] px-2.5 py-0.5 text-[10px] font-extrabold text-[#5B4DE6] shadow-md" style={{ animationDelay: "-3.4s" }}>NEW</span>
                <Star className="absolute end-[26%] bottom-[18%] h-4 w-4 fill-white text-white animate-twinkle" />
              </div>
              <div className="p-8 sm:p-10 pt-0 flex flex-col flex-1">
              <div className="h-12 w-12 rounded-2xl bg-[#00BFA6]/10 flex items-center justify-center mb-6 -mt-6 relative backdrop-blur-sm">
                <Store className="h-6 w-6 text-[#00BFA6]" />
              </div>
              <span className="text-[11px] rtl:text-xs font-bold uppercase tracking-wide text-[#00BFA6]">{t("pointsProTitle")}</span>
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
                {t("pointsProCta")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </div>
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
                {t("partnersSeeAll")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
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
                        alt={lc(p.name, p.nameAr, p.nameEn)}
                        className="h-20 sm:h-24 max-w-full object-contain opacity-90 hover:opacity-100 hover:scale-105 transition-all"
                      />
                    ) : (
                      <span className="text-gray-400 dark:text-white/40 font-bold text-sm text-center">{lc(p.name, p.nameAr, p.nameEn)}</span>
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
            <div className="inline-flex items-center gap-2 text-[#00BFA6] text-[11px] rtl:text-xs font-bold uppercase tracking-[0.22em] mb-5">
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
                  <p className="text-xs rtl:text-sm text-white/50">{t("whyVerifiedDesc")}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="h-9 w-9 shrink-0 rounded-lg bg-[#00BFA6]/10 flex items-center justify-center"><Globe2 className="h-4.5 w-4.5 text-[#00BFA6]" /></span>
                <div className="text-left">
                  <p className="text-sm font-bold text-white">{t("whyCoverageTitle")}</p>
                  <p className="text-xs rtl:text-sm text-white/50">{t("whyCoverageDesc")}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="h-9 w-9 shrink-0 rounded-lg bg-[#00BFA6]/10 flex items-center justify-center"><Users className="h-4.5 w-4.5 text-[#00BFA6]" /></span>
                <div className="text-left">
                  <p className="text-sm font-bold text-white">{t("whyProfilesTitle")}</p>
                  <p className="text-xs rtl:text-sm text-white/50">{t("whyProfilesDesc")}</p>
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
              <p className="text-xs rtl:text-sm font-bold text-[#003B4A] whitespace-nowrap">{t("whyVerifiedTitle")}</p>
            </div>

            <div className="hidden lg:flex flex-col gap-2 absolute bottom-16 -right-6 bg-white rounded-2xl shadow-xl shadow-black/20 px-4 py-3.5 z-20 min-w-[168px]">
              <div className="flex items-center gap-2.5">
                <span className="h-8 w-8 shrink-0 rounded-lg bg-[#00BFA6]/10 flex items-center justify-center"><Building2 className="h-4 w-4 text-[#00BFA6]" /></span>
                <div>
                  <p className="text-sm font-extrabold text-[#003B4A] leading-none">{announces.length}</p>
                  <p className="text-[10px] rtl:text-xs text-gray-400">{t("mobileAppStatListings")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="h-8 w-8 shrink-0 rounded-lg bg-[#00BFA6]/10 flex items-center justify-center"><Globe2 className="h-4 w-4 text-[#00BFA6]" /></span>
                <div>
                  <p className="text-sm font-extrabold text-[#003B4A] leading-none">58</p>
                  <p className="text-[10px] rtl:text-xs text-gray-400">{t("mobileAppStatWilayas")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="h-8 w-8 shrink-0 rounded-lg bg-[#00BFA6]/10 flex items-center justify-center"><LayoutGrid className="h-4 w-4 text-[#00BFA6]" /></span>
                <div>
                  <p className="text-sm font-extrabold text-[#003B4A] leading-none">{PUBLIC_CATEGORIES.length}</p>
                  <p className="text-[10px] rtl:text-xs text-gray-400">{t("mobileAppStatCategories")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
