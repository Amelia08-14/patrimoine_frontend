"use client"

import { useState, useEffect, useRef } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import {
  ChevronDown, Search, MapPin, Building2, Home, Hotel, Tent, Factory, BedDouble,
  Check, LayoutGrid, ArrowUpDown, SlidersHorizontal, RotateCcw,
  Briefcase, Users, Store, LayoutTemplate, Layers, Copy, Maximize,
  Palmtree, Warehouse, Container, LandPlot, ConciergeBell, PartyPopper, Presentation, Trees, Snowflake, Archive, Utensils
} from "lucide-react"
import { WILAYAS } from "@/data/wilayas"
import { COMMUNES } from "@/data/communes"
import { REAL_ESTATE_CATEGORIES, PUBLIC_CATEGORIES, PROPERTY_TYPES } from "@/data/propertyTypes"
import { DEPOSIT_PROPERTY_TYPES } from "@/data/depositPropertyTypes"
import { getCategoryColor } from "@/data/categoryColors"
import { isLockedCategory } from "@/data/lockedCategories"
import { usePropertyTypeLabel, useCategoryLabel, useLocalizedGeoName } from "@/lib/typeLabels"

// Icon mapping helper
const getIcon = (name: string) => {
  const icons: any = {
    BedDouble, Building2, Hotel, Tent, Factory, Home,
    Briefcase, Users, Store, LayoutTemplate, Layers, Copy, Maximize,
    Palmtree, Warehouse, Container, LandPlot, ConciergeBell, PartyPopper, Presentation,
    Trees, Snowflake, Archive, Utensils,
    Building: Building2 // Fallback or alias
  }
  return icons[name] || Home
}

interface FilterState {
  sortBy: string
  transactionType: string
  realEstateCategory: string
  propertyType: string
  wilaya: string
  commune: string
  minPrice: string
  maxPrice: string
  minArea: string
  maxArea: string
  nbPieces: string
}

interface AnnounceFilterProps {
  filters: FilterState
  onFilterChange: (key: string, value: any) => void
  /** Couleur de la catégorie active (hex) — repeint les états actifs ; par défaut le bleu de marque. */
  accentColor?: string
  /** Libellés de la bascule de transaction (ex. « Achat / Location » sur /demandes) ; défaut « Vente / Location ». */
  transactionLabels?: { SALE: string; RENTAL: string }
  /** Critères supplémentaires ajoutés en bas de « Plus de critères » (ex. période sur /demandes). */
  moreExtra?: React.ReactNode
  /** Nombre de critères supplémentaires actifs (badge de « Plus de critères »). */
  moreExtraActiveCount?: number
  /** Remise à zéro des critères supplémentaires (appelée par « Réinitialiser »). */
  onResetExtra?: () => void
}

// Filtre DYNAMIQUE : les résultats se mettent à jour à chaque changement (pas de bouton
// « Rechercher », retiré le 08/11/2026). Partagé par /announces et /demandes pour un rendu identique.
export function AnnounceFilter({ filters, onFilterChange, accentColor, transactionLabels, moreExtra, moreExtraActiveCount = 0, onResetExtra }: AnnounceFilterProps) {
  const t = useTranslations("AnnounceFilter")
  const ptLabel = usePropertyTypeLabel()
  const catLabel = useCategoryLabel()
  const geoName = useLocalizedGeoName()
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)
  const minAreaBoxRef = useRef<HTMLDivElement>(null)
  const maxAreaBoxRef = useRef<HTMLDivElement>(null)
  const minPriceBoxRef = useRef<HTMLDivElement>(null)
  const maxPriceBoxRef = useRef<HTMLDivElement>(null)

  // Couleur d'accent : celle de la catégorie active, sinon le bleu de marque par défaut — utilisée
  // pour tous les états actifs (anneaux de focus, pastilles sélectionnées) afin que le filtre entier
  // se "teinte" avec la catégorie en cours, comme demandé.
  const accent = accentColor || "#0094BD"

  // Anneau de focus posé sur l'ENCADRÉ (input + pastille d'unité), pas seulement l'input, pour que
  // la pastille "DA"/"m²" reste visuellement à l'intérieur du même champ surligné.
  const setBoxFocus = (ref: React.RefObject<HTMLDivElement | null>, focused: boolean) => {
    if (!ref.current) return
    ref.current.style.boxShadow = focused ? `0 0 0 2px ${accent}` : "none"
    ref.current.style.borderColor = focused ? "transparent" : ""
  }

  // "Capacité (m³)" au lieu de "Surface (m²)" pour une Chambre Froide — même distinction que sur
  // la fiche de dépôt/lecture d'annonce (demande client du 15/10/2026 : adapter l'unité au type
  // de bien choisi dans le filtre).
  const isCapacityUnit = filters.propertyType === "CHAMBRE_FROIDE"

  // Même formatage que le prix d'une annonce (séparateur de milliers fr-DZ), pour la saisie du
  // budget min/max — la valeur stockée dans les filtres reste un nombre brut, seul l'affichage
  // est habillé (cf. onChange qui retire tout sauf les chiffres).
  const formatThousands = (v: string) => (v ? new Intl.NumberFormat("fr-DZ").format(Number(v)) : "")

  // Unités de saisie pour Surface et Budget — purement locales à ce composant (pas dans
  // `filters`/l'URL) : `filters.minPrice`/`maxPrice`/`minArea`/`maxArea` restent toujours le
  // nombre brut comparé à `announce.price`/`property.area`, seul l'AFFICHAGE/la SAISIE convertit
  // via l'unité choisie (ex. taper "25" avec "Millions" pousse 25000000 dans le filtre). Retour
  // client du 17/10/2026 : la simplification du 15/10/2026 ("tout en DA/m²") est revenue en
  // arrière — les unités Million/Milliard/hectare manquaient réellement.
  const [priceUnit, setPriceUnit] = useState<'DA' | 'MILLION' | 'MILLIARD'>('DA')
  const [areaUnit, setAreaUnit] = useState<'M2' | 'HECTARE'>('M2')
  const PRICE_UNIT_FACTORS: Record<string, number> = { DA: 1, MILLION: 1_000_000, MILLIARD: 1_000_000_000 }
  const AREA_UNIT_FACTORS: Record<string, number> = { M2: 1, HECTARE: 10_000 }
  const priceFactor = PRICE_UNIT_FACTORS[priceUnit]
  const areaFactor = isCapacityUnit ? 1 : AREA_UNIT_FACTORS[areaUnit]
  const displayMinPrice = filters.minPrice ? String(Math.round(Number(filters.minPrice) / priceFactor)) : ''
  const displayMaxPrice = filters.maxPrice ? String(Math.round(Number(filters.maxPrice) / priceFactor)) : ''
  const displayMinArea = filters.minArea ? String(Math.round(Number(filters.minArea) / areaFactor)) : ''
  const displayMaxArea = filters.maxArea ? String(Math.round(Number(filters.maxArea) / areaFactor)) : ''
  const onPriceUnitChange = (unit: 'DA' | 'MILLION' | 'MILLIARD') => {
    const newFactor = PRICE_UNIT_FACTORS[unit]
    if (filters.minPrice) onFilterChange("minPrice", String(Math.round(Number(displayMinPrice) * newFactor)))
    if (filters.maxPrice) onFilterChange("maxPrice", String(Math.round(Number(displayMaxPrice) * newFactor)))
    setPriceUnit(unit)
  }
  const onAreaUnitChange = (unit: 'M2' | 'HECTARE') => {
    const newFactor = AREA_UNIT_FACTORS[unit]
    if (filters.minArea) onFilterChange("minArea", String(Math.round(Number(displayMinArea) * newFactor)))
    if (filters.maxArea) onFilterChange("maxArea", String(Math.round(Number(displayMaxArea) * newFactor)))
    setAreaUnit(unit)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const toggleDropdown = (key: string) => {
    if (openDropdown === key) {
      setOpenDropdown(null)
    } else {
      setOpenDropdown(key)
      setSearchTerm("") // Reset search when opening new dropdown
    }
  }

  // Derived data
  // Uniquement les types que l'on peut choisir à la création d'une annonce dans cette catégorie
  // (voir data/depositPropertyTypes.ts) ; l'icône vient du catalogue général, à défaut celle de la catégorie.
  const filteredPropertyTypes = filters.realEstateCategory
    ? DEPOSIT_PROPERTY_TYPES.filter(t => t.categoryId === filters.realEstateCategory)
    : []
  const iconForType = (typeId: string, categoryId: string) => {
    const known = PROPERTY_TYPES.find(pt => pt.id === typeId)
    const cat = REAL_ESTATE_CATEGORIES.find(c => c.id === categoryId)
    return getIcon(known?.iconName || cat?.iconName || "Home")
  }

  const filteredCommunes = filters.wilaya
    ? COMMUNES.filter(c => c.wilayaCode === filters.wilaya)
    : []

  // Filter lists based on search term
  const displayedWilayas = searchTerm
    ? WILAYAS.filter(w => w.name.toLowerCase().includes(searchTerm.toLowerCase()) || w.code.includes(searchTerm))
    : WILAYAS

  const displayedCommunes = searchTerm
    ? filteredCommunes.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : filteredCommunes

  const selectedWilayaName = filters.wilaya ? geoName(WILAYAS.find(w => w.code === filters.wilaya)) : ""
  const selectedCommuneName = filters.commune ? geoName(filteredCommunes.find(c => c.id === filters.commune)) : ""
  const selectedCategoryLabel = filters.realEstateCategory ? catLabel(filters.realEstateCategory, REAL_ESTATE_CATEGORIES.find(c => c.id === filters.realEstateCategory)?.label) : t("all")
  const selectedPropertyTypeLabel = filters.propertyType ? ptLabel(filters.propertyType, DEPOSIT_PROPERTY_TYPES.find(pt => pt.id === filters.propertyType)?.label ?? PROPERTY_TYPES.find(pt => pt.id === filters.propertyType)?.label) : t("all")
  const selectedCat = REAL_ESTATE_CATEGORIES.find(c => c.id === filters.realEstateCategory)
  const selectedCatColor = filters.realEstateCategory ? getCategoryColor(filters.realEstateCategory).hex : null
  const SelectedCatIcon = selectedCat ? getIcon(selectedCat.iconName) : Building2
  const chip = (hex: string, Icon: any, size = "h-7 w-7") => (
    <span className={`shrink-0 rounded-lg flex items-center justify-center ${size}`} style={{ backgroundColor: `${hex}1A` }}>
      <Icon className="h-3.5 w-3.5" style={{ color: hex }} />
    </span>
  )

  // Comme sur l'accueil : deux boutons seulement ; recliquer sur le bouton actif revient à « tout ».
  const TRANSACTION_OPTIONS = [
    { id: "SALE", label: transactionLabels?.SALE || t("transactionSale"), active: "bg-[#00BFA6] text-white shadow-sm" },
    { id: "RENTAL", label: transactionLabels?.RENTAL || t("transactionRental"), active: "bg-[#003B4A] text-white shadow-sm" },
  ]

  // Critères secondaires (repliés sous "Plus de critères") — comptés pour afficher un badge.
  const secondaryActiveCount = [
    !!filters.minArea,
    !!filters.maxArea,
    !!filters.minPrice,
    !!filters.maxPrice,
  ].filter(Boolean).length + moreExtraActiveCount

  const hasAnyFilter = !!(
    filters.transactionType || filters.realEstateCategory || filters.propertyType ||
    filters.wilaya || filters.commune || filters.minPrice || filters.maxPrice || filters.minArea || filters.maxArea ||
    moreExtraActiveCount > 0
  )

  const resetAll = () => {
    onFilterChange("transactionType", "")
    onFilterChange("realEstateCategory", "")
    onFilterChange("propertyType", "")
    onFilterChange("wilaya", "")
    onFilterChange("commune", "")
    onFilterChange("minPrice", "")
    onFilterChange("maxPrice", "")
    onFilterChange("minArea", "")
    onFilterChange("maxArea", "")
    onFilterChange("sortBy", "LAST_MODIFIED_DATE_DESC")
    onResetExtra?.()
    setOpenDropdown(null)
  }

  // Bascule d'unité compacte (une par ligne de « Plus de critères »).
  const unitToggle = (options: { id: string; label: string }[], value: string, onChange: (v: string) => void) => (
    <div className="inline-flex rounded-lg bg-gray-100 dark:bg-white/10 p-0.5">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${value === o.id ? "bg-white dark:bg-white/20 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-white/50 hover:text-gray-700 dark:hover:text-white/80"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
  const areaSuffix = isCapacityUnit ? "m³" : areaUnit === "HECTARE" ? "ha" : "m²"
  const priceSuffix = priceUnit === "MILLION" ? t("curMillions") : priceUnit === "MILLIARD" ? t("curMilliards") : t("curDA")
  // Champ numérique + unité en texte fixe à droite (même rendu que « m³ » de la Chambre Froide).
  const numberBox = (label: string, ref: React.RefObject<HTMLDivElement | null>, value: string, placeholder: string, suffix: string, onDigits: (raw: string) => void) => (
    <div className="min-w-0">
      <label className="text-xs font-bold text-gray-500 dark:text-white/50 mb-1.5 block whitespace-nowrap truncate">{label}</label>
      <div className="flex items-center rounded-lg border border-gray-200 dark:border-white/10 bg-transparent overflow-hidden transition-all" ref={ref}>
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => onDigits(e.target.value.replace(/[^\d]/g, ""))}
          className="w-full min-w-0 px-3 py-2 bg-transparent text-gray-800 dark:text-white outline-none"
          placeholder={placeholder}
          onFocus={() => setBoxFocus(ref, true)}
          onBlur={() => setBoxFocus(ref, false)}
        />
        <span className="shrink-0 pe-3 text-xs font-semibold text-gray-400 dark:text-white/40">{suffix}</span>
      </div>
    </div>
  )

  // Cellule "sélecteur" homogène : icône + libellé sur une ligne, pas de cadre visible au repos —
  // seul un léger fond apparaît au survol / à l'ouverture, comme sur la barre de recherche d'accueil.
  // Valeur « vide » d'une cellule : sur mobile le libellé en capitales est masqué, on affiche donc le nom
  // du champ (« Wilaya ») ; dès lg, « Tout / Toutes » sous le libellé comme avant.
  const emptyValue = (fieldLabel: string, allLabel: string) => (
    <>
      <span className="lg:hidden font-semibold text-gray-500 dark:text-white/50">{fieldLabel}</span>
      <span className="hidden lg:inline">{allLabel}</span>
    </>
  )
  const cellBase = "w-full h-full flex items-center gap-1.5 lg:gap-2.5 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl lg:rounded-none bg-gray-50 dark:bg-white/5 lg:bg-transparent lg:dark:bg-transparent cursor-pointer transition-colors text-start"

  return (
    <div className="w-full" ref={dropdownRef}>
      {/* Mobile (retour client du 08/11/2026) : DEUX lignes — [Vente|Location] [Immobilier] [Type de bien]
          puis [Wilaya] [Commune] [Plus de critères]. Chaque ligne est `relative` pour que les menus
          déroulants s'ouvrent sur toute sa largeur ; dès lg les lignes passent en `contents` et l'on
          retrouve la barre horizontale d'origine (cellules égales séparées par un filet). */}
      <div className="bg-white dark:bg-[#03303c] rounded-2xl lg:rounded-full shadow-xl shadow-black/[0.06] border border-gray-100 dark:border-white/10 p-1.5 flex flex-col lg:flex-row items-stretch gap-1.5">

        <div className="relative flex items-stretch gap-1.5 lg:contents">
        {/* Transaction — bascule segmentée, même langage que la barre d'accueil */}
        <div className="flex bg-gray-50 dark:bg-white/5 rounded-xl lg:rounded-full p-1 shrink-0">
          {TRANSACTION_OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => onFilterChange("transactionType", filters.transactionType === o.id ? "" : o.id)}
              className={`px-2.5 sm:px-4 py-2 lg:py-2.5 rounded-lg lg:rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${filters.transactionType === o.id ? o.active : "text-gray-500 dark:text-white/60 hover:text-[#003B4A] dark:hover:text-white"}`}
            >
              {o.label}
            </button>
          ))}
        </div>

          {/* Catégorie */}
          <div className="min-w-0 flex-1 lg:basis-0 lg:relative">
            <button
              type="button"
              onClick={() => toggleDropdown("realEstateCategory")}
              className={cellBase + " hover:bg-gray-50 dark:hover:bg-white/5"}
              style={openDropdown === "realEstateCategory" ? { boxShadow: `inset 0 0 0 2px ${accent}` } : undefined}
            >
              <span className="hidden lg:contents">{selectedCatColor ? chip(selectedCatColor, SelectedCatIcon) : <Building2 className="h-4 w-4 text-gray-400 dark:text-white/40 shrink-0" />}</span>
              <span className="min-w-0 flex-1">
                <span className="hidden lg:block text-[10px] text-gray-400 dark:text-white/40 font-bold uppercase tracking-wider leading-none mb-0.5 whitespace-nowrap truncate">{t("realEstateCategory")}</span>
                <span className="block font-bold text-[13px] lg:text-sm text-gray-800 dark:text-white truncate">{filters.realEstateCategory ? selectedCategoryLabel : emptyValue(t("realEstateCategory"), t("all"))}</span>
              </span>
              <ChevronDown className={`h-3.5 w-3.5 text-gray-400 dark:text-white/40 shrink-0 transition-transform ${openDropdown === "realEstateCategory" ? "rotate-180" : ""}`} />
            </button>

            {openDropdown === "realEstateCategory" && (
              <div className="absolute top-full inset-x-0 lg:inset-x-auto lg:start-0 mt-2 lg:w-64 bg-white dark:bg-[#03303c] rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 z-50 overflow-hidden p-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onFilterChange("realEstateCategory", "")
                    onFilterChange("propertyType", "") // Reset sub-filter
                    setOpenDropdown(null)
                  }}
                  className={`w-full flex items-center gap-2.5 rounded-xl px-2 py-2 text-start transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${!filters.realEstateCategory ? "bg-gray-50 dark:bg-white/5" : ""}`}
                >
                  <span className="h-7 w-7 shrink-0 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center"><LayoutGrid className="h-3.5 w-3.5 text-gray-500 dark:text-white/60" /></span>
                  <span className="flex-1 truncate text-[13px] font-semibold text-gray-700 dark:text-white/80">{t("all")}</span>
                  {!filters.realEstateCategory && <Check className="h-3.5 w-3.5 text-gray-400" />}
                </button>
                {PUBLIC_CATEGORIES.map((cat) => {
                  const Icon = getIcon(cat.iconName)
                  const color = getCategoryColor(cat.id).hex
                  const active = filters.realEstateCategory === cat.id
                  // Hébergement & Séjour : visible mais non sélectionnable (« Bientôt disponible »).
                  const locked = isLockedCategory(cat.id)
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      disabled={locked}
                      aria-disabled={locked}
                      onClick={() => {
                        if (locked) return
                        onFilterChange("realEstateCategory", cat.id)
                        onFilterChange("propertyType", "") // Reset sub-filter
                        setOpenDropdown(null)
                      }}
                      className={`w-full flex items-center gap-2.5 rounded-xl px-2 py-2 text-start transition-colors ${locked ? "cursor-not-allowed opacity-60" : "hover:bg-gray-50 dark:hover:bg-white/5"}`}
                      style={active ? { backgroundColor: `${color}12` } : undefined}
                    >
                      {chip(color, Icon)}
                      <span className="flex-1 truncate text-[13px] font-semibold text-gray-800 dark:text-white/90" style={active ? { color } : undefined}>{catLabel(cat.id, cat.label)}</span>
                      {locked && <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">{t("comingSoonBadge")}</span>}
                      {active && <Check className="h-3.5 w-3.5" style={{ color }} />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Type de bien */}
          <div className="min-w-0 flex-1 lg:basis-0 lg:relative lg:border-s lg:border-gray-100 lg:dark:border-white/10">
            <button
              type="button"
              onClick={() => toggleDropdown("propertyType")}
              className={cellBase + " hover:bg-gray-50 dark:hover:bg-white/5"}
              style={openDropdown === "propertyType" ? { boxShadow: `inset 0 0 0 2px ${accent}` } : undefined}
            >
              <Home className="hidden lg:block h-4 w-4 text-gray-400 dark:text-white/40 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="hidden lg:block text-[10px] text-gray-400 dark:text-white/40 font-bold uppercase tracking-wider leading-none mb-0.5 whitespace-nowrap truncate">{t("propertyType")}</span>
                <span className={`block font-bold text-[13px] lg:text-sm truncate ${!filters.realEstateCategory ? "text-gray-400 dark:text-white/30" : "text-gray-800 dark:text-white"}`}>
                  {filters.propertyType ? selectedPropertyTypeLabel : emptyValue(t("propertyType"), t("all"))}
                </span>
              </span>
              <ChevronDown className={`h-3.5 w-3.5 text-gray-400 dark:text-white/40 shrink-0 transition-transform ${openDropdown === "propertyType" ? "rotate-180" : ""}`} />
            </button>

            {openDropdown === "propertyType" && (
              <div className="absolute top-full inset-x-0 lg:inset-x-auto lg:start-0 mt-2 lg:w-72 bg-white dark:bg-[#03303c] rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 z-50 overflow-hidden p-1.5">
                {!filters.realEstateCategory ? (
                  <div className="text-center py-4 px-3 text-gray-500 dark:text-white/50 text-sm">
                    {t("chooseCategoryFirst")}
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => {
                        onFilterChange("propertyType", "")
                        setOpenDropdown(null)
                      }}
                      className={`w-full flex items-center gap-2.5 rounded-xl px-2 py-2 text-start transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${!filters.propertyType ? "bg-gray-50 dark:bg-white/5" : ""}`}
                    >
                      <span className="h-7 w-7 shrink-0 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center"><LayoutGrid className="h-3.5 w-3.5 text-gray-500 dark:text-white/60" /></span>
                      <span className="flex-1 truncate text-[13px] font-semibold text-gray-700 dark:text-white/80">{t("all")}</span>
                      {!filters.propertyType && <Check className="h-3.5 w-3.5 text-gray-400" />}
                    </button>
                    {filteredPropertyTypes.map((type) => {
                      const Icon = iconForType(type.id, type.categoryId)
                      const color = getCategoryColor(type.categoryId).hex
                      const active = filters.propertyType === type.id
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => {
                            onFilterChange("propertyType", type.id)
                            setOpenDropdown(null)
                          }}
                          className="w-full flex items-center gap-2.5 rounded-xl px-2 py-2 text-start transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
                          style={active ? { backgroundColor: `${color}12` } : undefined}
                        >
                          {chip(color, Icon)}
                          <span className="flex-1 truncate text-[13px] font-semibold text-gray-800 dark:text-white/90" style={active ? { color } : undefined}>{ptLabel(type.id, type.label)}</span>
                          {active && <Check className="h-3.5 w-3.5" style={{ color }} />}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Wilaya */}
        </div>

        <div className="relative flex items-stretch gap-1.5 lg:contents">
          <div className="min-w-0 flex-1 lg:basis-0 lg:relative lg:border-s lg:border-gray-100 lg:dark:border-white/10">
            <button
              type="button"
              onClick={() => toggleDropdown("wilaya")}
              className={cellBase + " hover:bg-gray-50 dark:hover:bg-white/5"}
              style={openDropdown === "wilaya" ? { boxShadow: `inset 0 0 0 2px ${accent}` } : undefined}
            >
              <MapPin className="hidden lg:block h-4 w-4 text-gray-400 dark:text-white/40 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="hidden lg:block text-[10px] text-gray-400 dark:text-white/40 font-bold uppercase tracking-wider leading-none mb-0.5 whitespace-nowrap truncate">{t("wilaya")}</span>
                <span className="block font-bold text-[13px] lg:text-sm text-gray-800 dark:text-white truncate">
                  {filters.wilaya ? `${filters.wilaya} - ${selectedWilayaName}` : emptyValue(t("wilaya"), t("allFeminine"))}
                </span>
              </span>
              <ChevronDown className={`h-3.5 w-3.5 text-gray-400 dark:text-white/40 shrink-0 transition-transform ${openDropdown === "wilaya" ? "rotate-180" : ""}`} />
            </button>

            {openDropdown === "wilaya" && (
              <div className="absolute top-full inset-x-0 lg:inset-x-auto lg:start-0 mt-2 lg:w-64 bg-white dark:bg-[#03303c] rounded-xl shadow-xl border border-gray-100 dark:border-white/10 z-50 overflow-hidden flex flex-col max-h-80">
                <div className="p-2 border-b border-gray-100 dark:border-white/10 sticky top-0 bg-white dark:bg-[#03303c]">
                  <input
                    type="text"
                    placeholder={t("searchPlaceholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-white rounded-lg text-sm outline-none focus:ring-1 transition-all"
                    style={{ boxShadow: `0 0 0 1px transparent` }}
                    onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 1px ${accent}` }}
                    onBlur={(e) => { e.currentTarget.style.boxShadow = "none" }}
                  />
                </div>
                <div className="overflow-y-auto flex-1">
                  <div
                    onClick={() => {
                      onFilterChange("wilaya", "")
                      onFilterChange("commune", "") // Reset commune
                      setOpenDropdown(null)
                    }}
                    className="px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer text-gray-700 dark:text-white/70"
                    style={!filters.wilaya ? { color: accent, fontWeight: 700, backgroundColor: `${accent}14` } : undefined}
                  >
                    {t("allWilayas")}
                  </div>
                  {displayedWilayas.map((w) => {
                    const active = filters.wilaya === w.code
                    return (
                      <div
                        key={w.id}
                        onClick={() => {
                          onFilterChange("wilaya", w.code)
                          onFilterChange("commune", "") // Reset commune
                          setOpenDropdown(null)
                        }}
                        className="px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer flex justify-between items-center text-gray-700 dark:text-white/70"
                        style={active ? { color: accent, fontWeight: 700, backgroundColor: `${accent}14` } : undefined}
                      >
                        <span>{w.code} - {geoName(w)}</span>
                        {active && <Check className="h-4 w-4" />}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Commune */}
          <div className="min-w-0 flex-1 lg:basis-0 lg:relative lg:border-s lg:border-gray-100 lg:dark:border-white/10">
            <button
              type="button"
              onClick={() => toggleDropdown("commune")}
              className={cellBase + " hover:bg-gray-50 dark:hover:bg-white/5"}
              style={openDropdown === "commune" ? { boxShadow: `inset 0 0 0 2px ${accent}` } : undefined}
            >
              <MapPin className="hidden lg:block h-4 w-4 text-gray-400 dark:text-white/40 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="hidden lg:block text-[10px] text-gray-400 dark:text-white/40 font-bold uppercase tracking-wider leading-none mb-0.5 whitespace-nowrap truncate">{t("commune")}</span>
                <span className={`block font-bold text-[13px] lg:text-sm truncate ${!filters.wilaya ? "text-gray-400 dark:text-white/30" : "text-gray-800 dark:text-white"}`}>
                  {selectedCommuneName || emptyValue(t("commune"), t("allFeminine"))}
                </span>
              </span>
              <ChevronDown className={`h-3.5 w-3.5 text-gray-400 dark:text-white/40 shrink-0 transition-transform ${openDropdown === "commune" ? "rotate-180" : ""}`} />
            </button>

            {openDropdown === "commune" && (
              <div className="absolute top-full inset-x-0 lg:inset-x-auto lg:start-0 mt-2 lg:w-64 bg-white dark:bg-[#03303c] rounded-xl shadow-xl border border-gray-100 dark:border-white/10 z-50 overflow-hidden flex flex-col max-h-80">
                {!filters.wilaya ? (
                  <div className="p-4 text-center text-gray-500 dark:text-white/50 text-sm">{t("chooseWilayaFirst")}</div>
                ) : (
                  <>
                    <div className="p-2 border-b border-gray-100 dark:border-white/10 sticky top-0 bg-white dark:bg-[#03303c]">
                      <input
                        type="text"
                        placeholder={t("searchPlaceholder")}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-white rounded-lg text-sm outline-none transition-all"
                        onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 1px ${accent}` }}
                        onBlur={(e) => { e.currentTarget.style.boxShadow = "none" }}
                      />
                    </div>
                    <div className="overflow-y-auto flex-1">
                      <div
                        onClick={() => {
                          onFilterChange("commune", "")
                          setOpenDropdown(null)
                        }}
                        className="px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer text-gray-700 dark:text-white/70"
                        style={!filters.commune ? { color: accent, fontWeight: 700, backgroundColor: `${accent}14` } : undefined}
                      >
                        {t("allCommunes")}
                      </div>
                      {displayedCommunes.map((c) => {
                        const active = filters.commune === c.id
                        return (
                          <div
                            key={c.id}
                            onClick={() => {
                              onFilterChange("commune", c.id)
                              setOpenDropdown(null)
                            }}
                            className="px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer flex justify-between items-center text-gray-700 dark:text-white/70"
                            style={active ? { color: accent, fontWeight: 700, backgroundColor: `${accent}14` } : undefined}
                          >
                            <span>{geoName(c)}</span>
                            {active && <Check className="h-4 w-4" />}
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

        {/* Plus de critères — Surface et Budget (min / max), repliés pour garder la barre principale épurée */}
        <div className="shrink-0 lg:relative">
          <button
            type="button"
            onClick={() => toggleDropdown("more")}
            aria-label={t("moreFilters")}
            title={t("moreFilters")}
            className="h-full flex items-center justify-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl lg:rounded-full text-sm font-bold text-gray-600 dark:text-white/70 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors whitespace-nowrap"
            style={openDropdown === "more" ? { boxShadow: `inset 0 0 0 2px ${accent}`, color: accent } : undefined}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden lg:inline">{t("moreFilters")}</span>
            {secondaryActiveCount > 0 && (
              <span
                className="h-4.5 min-w-[18px] px-1 rounded-full text-[10px] font-black text-white flex items-center justify-center"
                style={{ backgroundColor: accent }}
              >
                {secondaryActiveCount}
              </span>
            )}
          </button>

          {openDropdown === "more" && (
            <div className="absolute top-full inset-x-0 lg:inset-x-auto lg:end-0 mt-2 lg:w-96 bg-white dark:bg-[#03303c] rounded-xl shadow-xl border border-gray-100 dark:border-white/10 z-50 p-4 space-y-4">
              {/* Valeurs toujours lisibles (retour client du 08/11/2026) : l'unité se choisit UNE fois par
                  ligne (bascule au-dessus des deux champs) et s'affiche en texte fixe dans le champ, comme
                  « m³ » pour une Chambre Froide — au lieu d'un menu déroulant dans chaque champ qui
                  mangeait la moitié de la largeur et coupait la valeur saisie. Les filtres restent en
                  valeur brute (m² / DA), seule la saisie est convertie (cf. areaFactor / priceFactor). */}
              <div>
                {!isCapacityUnit && (
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-white/40">{t("unitLabel")}</span>
                    {unitToggle([{ id: "M2", label: "m²" }, { id: "HECTARE", label: t("unitHectare") }], areaUnit, (v) => onAreaUnitChange(v as 'M2' | 'HECTARE'))}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {numberBox(isCapacityUnit ? t("capacityMinLabel") : t("surfaceMinLabel"), minAreaBoxRef, displayMinArea, "Ex: 50", areaSuffix,
                    (raw) => onFilterChange("minArea", raw ? String(Number(raw) * areaFactor) : ""))}
                  {numberBox(isCapacityUnit ? t("capacityMaxLabel") : t("surfaceMaxLabel"), maxAreaBoxRef, displayMaxArea, "Ex: 300", areaSuffix,
                    (raw) => onFilterChange("maxArea", raw ? String(Number(raw) * areaFactor) : ""))}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-white/10">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-white/40">{t("unitLabel")}</span>
                  {unitToggle([{ id: "DA", label: t("curDA") }, { id: "MILLION", label: t("curMillions") }, { id: "MILLIARD", label: t("curMilliards") }], priceUnit, (v) => onPriceUnitChange(v as 'DA' | 'MILLION' | 'MILLIARD'))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {numberBox(t("budgetMinLabel"), minPriceBoxRef, formatThousands(displayMinPrice), "Ex: 10 000", priceSuffix,
                    (raw) => onFilterChange("minPrice", raw ? String(Math.round(Number(raw) * priceFactor)) : ""))}
                  {numberBox(t("budgetMaxLabel"), maxPriceBoxRef, formatThousands(displayMaxPrice), "Ex: 50 000", priceSuffix,
                    (raw) => onFilterChange("maxPrice", raw ? String(Math.round(Number(raw) * priceFactor)) : ""))}
                </div>
              </div>

              {moreExtra && <div className="pt-3 border-t border-gray-100 dark:border-white/10">{moreExtra}</div>}

              {hasAnyFilter && (
                <button
                  type="button"
                  onClick={resetAll}
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/70 pt-2 border-t border-gray-100 dark:border-white/10"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> {t("resetFilters")}
                </button>
              )}
            </div>
          )}
        </div>
        </div>

      </div>
    </div>
  )
}
