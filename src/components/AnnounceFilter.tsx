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
  onSearch: () => void
  /** Couleur de la catégorie active (hex) — repeint le bouton "Rechercher" et les états actifs ; par défaut le bleu de marque. */
  accentColor?: string
}

export function AnnounceFilter({ filters, onFilterChange, onSearch, accentColor }: AnnounceFilterProps) {
  const t = useTranslations("AnnounceFilter")
  const ptLabel = usePropertyTypeLabel()
  const catLabel = useCategoryLabel()
  const geoName = useLocalizedGeoName()
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Couleur d'accent : celle de la catégorie active, sinon le bleu de marque par défaut — utilisée
  // pour tous les états actifs (anneaux de focus, pastilles sélectionnées) afin que le filtre entier
  // se "teinte" avec la catégorie en cours, comme demandé.
  const accent = accentColor || "#0094BD"

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
    { id: "SALE", label: t("transactionSale"), active: "bg-[#00BFA6] text-white shadow-sm" },
    { id: "RENTAL", label: t("transactionRental"), active: "bg-[#003B4A] text-white shadow-sm" },
  ]

  // Critères secondaires (repliés sous "Plus de critères") — comptés pour afficher un badge.
  const secondaryActiveCount = [
    !!filters.minArea,
    !!filters.maxArea,
    !!filters.minPrice,
    !!filters.maxPrice,
  ].filter(Boolean).length

  const hasAnyFilter = !!(
    filters.transactionType || filters.realEstateCategory || filters.propertyType ||
    filters.wilaya || filters.commune || filters.minPrice || filters.maxPrice || filters.minArea || filters.maxArea
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
    setOpenDropdown(null)
  }

  // Cellule "sélecteur" homogène : icône + libellé sur une ligne, pas de cadre visible au repos —
  // seul un léger fond apparaît au survol / à l'ouverture, comme sur la barre de recherche d'accueil.
  const cellBase = "w-full h-full flex items-center gap-2.5 px-4 py-3 cursor-pointer transition-colors text-start"

  return (
    <div className="w-full" ref={dropdownRef}>
      <div className="bg-white dark:bg-[#03303c] rounded-2xl sm:rounded-full shadow-xl shadow-black/[0.06] border border-gray-100 dark:border-white/10 p-1.5 flex flex-col sm:flex-row items-stretch gap-1.5">

        {/* Transaction — bascule segmentée, même langage que la barre d'accueil */}
        <div className="flex bg-gray-50 dark:bg-white/5 rounded-full p-1 shrink-0 overflow-x-auto">
          {TRANSACTION_OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => onFilterChange("transactionType", filters.transactionType === o.id ? "" : o.id)}
              className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${filters.transactionType === o.id ? o.active : "text-gray-500 dark:text-white/60 hover:text-[#003B4A] dark:hover:text-white"}`}
            >
              {o.label}
            </button>
          ))}
        </div>

        {/* Cellules qui s'enchaînent, séparées par de fins traits — pas de cases encadrées */}
        <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 rounded-xl lg:rounded-none border border-gray-100 dark:border-white/10 lg:border-0 divide-x divide-y lg:divide-y-0 divide-gray-100 dark:divide-white/10 overflow-hidden lg:overflow-visible min-w-0">

          {/* Catégorie */}
          <div className="relative min-w-0">
            <button
              type="button"
              onClick={() => toggleDropdown("realEstateCategory")}
              className={cellBase + " hover:bg-gray-50 dark:hover:bg-white/5"}
              style={openDropdown === "realEstateCategory" ? { boxShadow: `inset 0 0 0 2px ${accent}` } : undefined}
            >
              {selectedCatColor ? chip(selectedCatColor, SelectedCatIcon) : <Building2 className="h-4 w-4 text-gray-400 dark:text-white/40 shrink-0" />}
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] text-gray-400 dark:text-white/40 font-bold uppercase tracking-wider leading-none mb-0.5 whitespace-nowrap truncate">{t("realEstateCategory")}</span>
                <span className="block font-bold text-sm text-gray-800 dark:text-white truncate">{selectedCategoryLabel}</span>
              </span>
              <ChevronDown className={`h-3.5 w-3.5 text-gray-400 dark:text-white/40 shrink-0 transition-transform ${openDropdown === "realEstateCategory" ? "rotate-180" : ""}`} />
            </button>

            {openDropdown === "realEstateCategory" && (
              <div className="absolute top-full start-0 mt-2 w-64 bg-white dark:bg-[#03303c] rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 z-50 overflow-hidden p-1.5">
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
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        onFilterChange("realEstateCategory", cat.id)
                        onFilterChange("propertyType", "") // Reset sub-filter
                        setOpenDropdown(null)
                      }}
                      className="w-full flex items-center gap-2.5 rounded-xl px-2 py-2 text-start transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
                      style={active ? { backgroundColor: `${color}12` } : undefined}
                    >
                      {chip(color, Icon)}
                      <span className="flex-1 truncate text-[13px] font-semibold text-gray-800 dark:text-white/90" style={active ? { color } : undefined}>{catLabel(cat.id, cat.label)}</span>
                      {active && <Check className="h-3.5 w-3.5" style={{ color }} />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Type de bien */}
          <div className="relative min-w-0">
            <button
              type="button"
              onClick={() => toggleDropdown("propertyType")}
              className={cellBase + " hover:bg-gray-50 dark:hover:bg-white/5"}
              style={openDropdown === "propertyType" ? { boxShadow: `inset 0 0 0 2px ${accent}` } : undefined}
            >
              <Home className="h-4 w-4 text-gray-400 dark:text-white/40 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] text-gray-400 dark:text-white/40 font-bold uppercase tracking-wider leading-none mb-0.5 whitespace-nowrap truncate">{t("propertyType")}</span>
                <span className={`block font-bold text-sm truncate ${!filters.realEstateCategory ? "text-gray-400 dark:text-white/30" : "text-gray-800 dark:text-white"}`}>
                  {selectedPropertyTypeLabel}
                </span>
              </span>
              <ChevronDown className={`h-3.5 w-3.5 text-gray-400 dark:text-white/40 shrink-0 transition-transform ${openDropdown === "propertyType" ? "rotate-180" : ""}`} />
            </button>

            {openDropdown === "propertyType" && (
              <div className="absolute top-full start-0 mt-2 w-72 bg-white dark:bg-[#03303c] rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 z-50 overflow-hidden p-1.5">
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
          <div className="relative min-w-0">
            <button
              type="button"
              onClick={() => toggleDropdown("wilaya")}
              className={cellBase + " hover:bg-gray-50 dark:hover:bg-white/5"}
              style={openDropdown === "wilaya" ? { boxShadow: `inset 0 0 0 2px ${accent}` } : undefined}
            >
              <MapPin className="h-4 w-4 text-gray-400 dark:text-white/40 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] text-gray-400 dark:text-white/40 font-bold uppercase tracking-wider leading-none mb-0.5 whitespace-nowrap truncate">{t("wilaya")}</span>
                <span className="block font-bold text-sm text-gray-800 dark:text-white truncate">
                  {filters.wilaya ? `${filters.wilaya} - ${selectedWilayaName}` : t("allFeminine")}
                </span>
              </span>
              <ChevronDown className={`h-3.5 w-3.5 text-gray-400 dark:text-white/40 shrink-0 transition-transform ${openDropdown === "wilaya" ? "rotate-180" : ""}`} />
            </button>

            {openDropdown === "wilaya" && (
              <div className="absolute top-full start-0 mt-2 w-64 bg-white dark:bg-[#03303c] rounded-xl shadow-xl border border-gray-100 dark:border-white/10 z-50 overflow-hidden flex flex-col max-h-80">
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
          <div className="relative min-w-0">
            <button
              type="button"
              onClick={() => toggleDropdown("commune")}
              className={cellBase + " hover:bg-gray-50 dark:hover:bg-white/5"}
              style={openDropdown === "commune" ? { boxShadow: `inset 0 0 0 2px ${accent}` } : undefined}
            >
              <MapPin className="h-4 w-4 text-gray-400 dark:text-white/40 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] text-gray-400 dark:text-white/40 font-bold uppercase tracking-wider leading-none mb-0.5 whitespace-nowrap truncate">{t("commune")}</span>
                <span className={`block font-bold text-sm truncate ${!filters.wilaya ? "text-gray-400 dark:text-white/30" : "text-gray-800 dark:text-white"}`}>
                  {selectedCommuneName || t("allFeminine")}
                </span>
              </span>
              <ChevronDown className={`h-3.5 w-3.5 text-gray-400 dark:text-white/40 shrink-0 transition-transform ${openDropdown === "commune" ? "rotate-180" : ""}`} />
            </button>

            {openDropdown === "commune" && (
              <div className="absolute top-full end-0 lg:end-auto lg:start-0 mt-2 w-64 bg-white dark:bg-[#03303c] rounded-xl shadow-xl border border-gray-100 dark:border-white/10 z-50 overflow-hidden flex flex-col max-h-80">
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
        </div>

        {/* Plus de critères — Surface et Budget (min / max), repliés pour garder la barre principale épurée */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => toggleDropdown("more")}
            className="w-full sm:w-auto h-full flex items-center justify-center gap-2 px-4 py-3 rounded-full text-sm font-bold text-gray-600 dark:text-white/70 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors whitespace-nowrap"
            style={openDropdown === "more" ? { boxShadow: `inset 0 0 0 2px ${accent}`, color: accent } : undefined}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>{t("moreFilters")}</span>
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
            <div className="absolute top-full end-0 mt-2 w-80 max-w-[90vw] bg-white dark:bg-[#03303c] rounded-xl shadow-xl border border-gray-100 dark:border-white/10 z-50 p-4 space-y-4">
              {/* Surface : minimum / maximum (saisie libre, pas de valeurs proposées) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-white/50 mb-1.5 block whitespace-nowrap truncate">{t("surfaceMinLabel")}</label>
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={filters.minArea}
                    onChange={(e) => onFilterChange("minArea", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-white/10 bg-transparent text-gray-800 dark:text-white rounded-lg outline-none transition-all"
                    placeholder="Ex: 50"
                    onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 2px ${accent}`; e.currentTarget.style.borderColor = "transparent" }}
                    onBlur={(e) => { e.currentTarget.style.boxShadow = "none" }}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-white/50 mb-1.5 block whitespace-nowrap truncate">{t("surfaceMaxLabel")}</label>
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={filters.maxArea}
                    onChange={(e) => onFilterChange("maxArea", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-white/10 bg-transparent text-gray-800 dark:text-white rounded-lg outline-none transition-all"
                    placeholder="Ex: 300"
                    onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 2px ${accent}`; e.currentTarget.style.borderColor = "transparent" }}
                    onBlur={(e) => { e.currentTarget.style.boxShadow = "none" }}
                  />
                </div>
              </div>

              {/* Budget : minimum / maximum */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100 dark:border-white/10">
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-white/50 mb-1.5 block whitespace-nowrap truncate">{t("budgetMinLabel")}</label>
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={filters.minPrice}
                    onChange={(e) => onFilterChange("minPrice", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-white/10 bg-transparent text-gray-800 dark:text-white rounded-lg outline-none transition-all"
                    placeholder="Ex: 10000"
                    onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 2px ${accent}`; e.currentTarget.style.borderColor = "transparent" }}
                    onBlur={(e) => { e.currentTarget.style.boxShadow = "none" }}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-white/50 mb-1.5 block whitespace-nowrap truncate">{t("budgetMaxLabel")}</label>
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={filters.maxPrice}
                    onChange={(e) => onFilterChange("maxPrice", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-white/10 bg-transparent text-gray-800 dark:text-white rounded-lg outline-none transition-all"
                    placeholder="Ex: 50000"
                    onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 2px ${accent}`; e.currentTarget.style.borderColor = "transparent" }}
                    onBlur={(e) => { e.currentTarget.style.boxShadow = "none" }}
                  />
                </div>
              </div>

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

        {/* Rechercher — les résultats se filtrent déjà en direct ; ce bouton confirme / partage l'URL */}
        <div className="shrink-0">
          <Button
            className="w-full sm:w-auto text-white rounded-full px-6 h-[46px] sm:h-full font-bold text-sm shadow-md transition-all active:scale-95"
            style={{ backgroundColor: accent }}
            onClick={onSearch}
          >
            <Search className="h-4 w-4 me-2" />
            {t("search")}
          </Button>
        </div>
      </div>
    </div>
  )
}
