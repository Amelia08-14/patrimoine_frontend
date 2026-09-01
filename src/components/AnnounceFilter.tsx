"use client"

import { useState, useEffect, useRef } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import {
  ChevronDown, Search, MapPin, Building2, Home, Hotel, Tent, Factory, BedDouble,
  Check, LayoutGrid, ArrowUpDown, SlidersHorizontal, RotateCcw,
  Briefcase, Users, Store, LayoutTemplate, Layers, Copy, Maximize,
  Palmtree, Warehouse, Container, LandPlot, ConciergeBell, PartyPopper, Presentation
} from "lucide-react"
import { WILAYAS } from "@/data/wilayas"
import { COMMUNES } from "@/data/communes"
import { REAL_ESTATE_CATEGORIES, PROPERTY_TYPES } from "@/data/propertyTypes"

// Icon mapping helper
const getIcon = (name: string) => {
  const icons: any = {
    BedDouble, Building2, Hotel, Tent, Factory, Home,
    Briefcase, Users, Store, LayoutTemplate, Layers, Copy, Maximize,
    Palmtree, Warehouse, Container, LandPlot, ConciergeBell, PartyPopper, Presentation,
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
  const filteredPropertyTypes = filters.realEstateCategory
    ? PROPERTY_TYPES.filter(t => t.categoryId === filters.realEstateCategory)
    : []

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

  const selectedWilayaName = filters.wilaya ? WILAYAS.find(w => w.code === filters.wilaya)?.name : ""
  const selectedCommuneName = filters.commune ? filteredCommunes.find(c => c.id === filters.commune)?.name : ""
  const selectedCategoryLabel = filters.realEstateCategory ? REAL_ESTATE_CATEGORIES.find(c => c.id === filters.realEstateCategory)?.label : t("all")
  const selectedPropertyTypeLabel = filters.propertyType ? PROPERTY_TYPES.find(pt => pt.id === filters.propertyType)?.label : t("all")

  const TRANSACTION_OPTIONS = [
    { id: "", label: t("all") },
    { id: "SALE", label: t("transactionSale") },
    { id: "RENTAL", label: t("transactionRental") },
    { id: "HOLIDAY_RENTAL", label: t("transactionHoliday") },
  ]

  // Critères secondaires (repliés sous "Plus de critères") — comptés pour afficher un badge.
  const secondaryActiveCount = [
    filters.sortBy && filters.sortBy !== "LAST_MODIFIED_DATE_DESC",
    !!filters.maxPrice,
    !!filters.minArea,
  ].filter(Boolean).length

  const hasAnyFilter = !!(
    filters.transactionType || filters.realEstateCategory || filters.propertyType ||
    filters.wilaya || filters.commune || filters.maxPrice || filters.minArea ||
    (filters.sortBy && filters.sortBy !== "LAST_MODIFIED_DATE_DESC")
  )

  const resetAll = () => {
    onFilterChange("transactionType", "")
    onFilterChange("realEstateCategory", "")
    onFilterChange("propertyType", "")
    onFilterChange("wilaya", "")
    onFilterChange("commune", "")
    onFilterChange("maxPrice", "")
    onFilterChange("minArea", "")
    onFilterChange("sortBy", "LAST_MODIFIED_DATE_DESC")
    setOpenDropdown(null)
  }

  // Cellule "sélecteur" homogène : icône + libellé sur une ligne, pas de cadre visible au repos —
  // seul un léger fond apparaît au survol / à l'ouverture, comme sur la barre de recherche d'accueil.
  const cellBase = "w-full h-full flex items-center gap-2.5 px-4 py-3 cursor-pointer transition-colors text-left"

  return (
    <div className="w-full" ref={dropdownRef}>
      <div className="bg-white dark:bg-[#03303c] rounded-2xl sm:rounded-full shadow-xl shadow-black/[0.06] border border-gray-100 dark:border-white/10 p-1.5 flex flex-col sm:flex-row items-stretch gap-1.5">

        {/* Transaction — bascule segmentée, même langage que la barre d'accueil */}
        <div className="flex bg-gray-50 dark:bg-white/5 rounded-full p-1 shrink-0 overflow-x-auto">
          {TRANSACTION_OPTIONS.map((o) => (
            <button
              key={o.id || "all"}
              type="button"
              onClick={() => onFilterChange("transactionType", o.id)}
              className={`px-3.5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${filters.transactionType === o.id ? "bg-[#003B4A] text-white shadow-sm" : "text-gray-500 dark:text-white/60 hover:text-[#003B4A] dark:hover:text-white"}`}
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
              <Building2 className="h-4 w-4 text-gray-400 dark:text-white/40 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] text-gray-400 dark:text-white/40 font-bold uppercase tracking-wider leading-none mb-0.5 whitespace-nowrap truncate">{t("realEstateCategory")}</span>
                <span className="block font-bold text-sm text-gray-800 dark:text-white truncate">{selectedCategoryLabel}</span>
              </span>
              <ChevronDown className={`h-3.5 w-3.5 text-gray-400 dark:text-white/40 shrink-0 transition-transform ${openDropdown === "realEstateCategory" ? "rotate-180" : ""}`} />
            </button>

            {openDropdown === "realEstateCategory" && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-[#03303c] rounded-xl shadow-xl border border-gray-100 dark:border-white/10 z-50 overflow-hidden p-2 grid grid-cols-2 gap-2">
                <div
                  onClick={() => {
                    onFilterChange("realEstateCategory", "")
                    onFilterChange("propertyType", "") // Reset sub-filter
                    setOpenDropdown(null)
                  }}
                  className="p-2 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer flex flex-col items-center justify-center gap-2 border border-gray-100 dark:border-white/10 text-gray-600 dark:text-white/70"
                  style={!filters.realEstateCategory ? { borderColor: accent, backgroundColor: `${accent}14`, color: accent } : undefined}
                >
                  <LayoutGrid className="h-5 w-5" />
                  <span className="font-medium text-center">{t("all")}</span>
                </div>
                {REAL_ESTATE_CATEGORIES.map((cat) => {
                  const Icon = getIcon(cat.iconName)
                  const active = filters.realEstateCategory === cat.id
                  return (
                    <div
                      key={cat.id}
                      onClick={() => {
                        onFilterChange("realEstateCategory", cat.id)
                        onFilterChange("propertyType", "") // Reset sub-filter
                        setOpenDropdown(null)
                      }}
                      className="p-2 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer flex flex-col items-center justify-center gap-2 border border-gray-100 dark:border-white/10 text-gray-600 dark:text-white/70"
                      style={active ? { borderColor: accent, backgroundColor: `${accent}14`, color: accent } : undefined}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium text-center text-xs leading-tight">{cat.label}</span>
                    </div>
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
              <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-[#03303c] rounded-xl shadow-xl border border-gray-100 dark:border-white/10 z-50 overflow-hidden p-3">
                {!filters.realEstateCategory ? (
                  <div className="text-center py-4 text-gray-500 dark:text-white/50 text-sm">
                    {t("chooseCategoryFirst")}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    <div
                      onClick={() => {
                        onFilterChange("propertyType", "")
                        setOpenDropdown(null)
                      }}
                      className="p-2 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer flex flex-col items-center justify-center gap-1 border border-gray-100 dark:border-white/10 text-gray-600 dark:text-white/70"
                      style={!filters.propertyType ? { borderColor: accent, backgroundColor: `${accent}14`, color: accent } : undefined}
                    >
                      <LayoutGrid className="h-4 w-4" />
                      <span className="font-medium">{t("all")}</span>
                    </div>
                    {filteredPropertyTypes.map((type) => {
                      const Icon = getIcon(type.iconName || "Home")
                      const active = filters.propertyType === type.id
                      return (
                        <div
                          key={type.id}
                          onClick={() => {
                            onFilterChange("propertyType", type.id)
                            setOpenDropdown(null)
                          }}
                          className="p-2 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer flex flex-col items-center justify-center gap-1 border border-gray-100 dark:border-white/10 text-gray-600 dark:text-white/70"
                          style={active ? { borderColor: accent, backgroundColor: `${accent}14`, color: accent } : undefined}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="font-medium text-center text-xs leading-tight">{type.label}</span>
                        </div>
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
              <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-[#03303c] rounded-xl shadow-xl border border-gray-100 dark:border-white/10 z-50 overflow-hidden flex flex-col max-h-80">
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
                        <span>{w.code} - {w.name}</span>
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
              <div className="absolute top-full right-0 lg:right-auto lg:left-0 mt-2 w-64 bg-white dark:bg-[#03303c] rounded-xl shadow-xl border border-gray-100 dark:border-white/10 z-50 overflow-hidden flex flex-col max-h-80">
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
                            <span>{c.name}</span>
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

        {/* Plus de critères — Tri, Budget, Surface, repliés pour garder la barre principale épurée */}
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
            <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-[#03303c] rounded-xl shadow-xl border border-gray-100 dark:border-white/10 z-50 p-4 space-y-4">
              {/* Tri */}
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-white/50 mb-1.5 block flex items-center gap-1.5">
                  <ArrowUpDown className="h-3.5 w-3.5" /> {t("sortBy")}
                </label>
                <div className="flex flex-col gap-1">
                  {[
                    { value: "LAST_MODIFIED_DATE_DESC", label: t("sortRecent") },
                    { value: "PRICE_ASC", label: t("sortPriceAsc") },
                    { value: "PRICE_DESC", label: t("sortPriceDesc") },
                  ].map((option) => {
                    const active = filters.sortBy === option.value
                    return (
                      <div
                        key={option.value}
                        onClick={() => onFilterChange("sortBy", option.value)}
                        className="px-3 py-2 rounded-lg text-sm cursor-pointer flex items-center justify-between text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/5"
                        style={active ? { color: accent, fontWeight: 700, backgroundColor: `${accent}14` } : undefined}
                      >
                        {option.label}
                        {active && <Check className="h-4 w-4" />}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Budget */}
              <div className="pt-3 border-t border-gray-100 dark:border-white/10">
                <label className="text-xs font-bold text-gray-500 dark:text-white/50 mb-1.5 block">{t("budgetMaxLabel")}</label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => onFilterChange("maxPrice", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-white/10 bg-transparent text-gray-800 dark:text-white rounded-lg outline-none transition-all"
                  placeholder={t("budgetPlaceholder")}
                  onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 2px ${accent}`; e.currentTarget.style.borderColor = "transparent" }}
                  onBlur={(e) => { e.currentTarget.style.boxShadow = "none" }}
                />
                <div className="grid grid-cols-3 gap-1.5 mt-2">
                  {[10000, 20000, 30000, 40000, 50000, 100000].map(price => (
                    <button
                      key={price}
                      type="button"
                      onClick={() => onFilterChange("maxPrice", price.toString())}
                      className="px-2 py-1 bg-gray-50 dark:bg-white/5 rounded text-xs hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-white/60"
                    >
                      {price.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Surface */}
              <div className="pt-3 border-t border-gray-100 dark:border-white/10">
                <label className="text-xs font-bold text-gray-500 dark:text-white/50 mb-1.5 block">{t("surfaceMinLabel")}</label>
                <input
                  type="number"
                  value={filters.minArea}
                  onChange={(e) => onFilterChange("minArea", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-white/10 bg-transparent text-gray-800 dark:text-white rounded-lg outline-none transition-all"
                  placeholder={t("surfacePlaceholder")}
                  onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 2px ${accent}`; e.currentTarget.style.borderColor = "transparent" }}
                  onBlur={(e) => { e.currentTarget.style.boxShadow = "none" }}
                />
                <div className="grid grid-cols-3 gap-1.5 mt-2">
                  {[50, 80, 100, 120, 150, 200].map(area => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => onFilterChange("minArea", area.toString())}
                      className="px-2 py-1 bg-gray-50 dark:bg-white/5 rounded text-xs hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-white/60"
                    >
                      {area} m²
                    </button>
                  ))}
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
            <Search className="h-4 w-4 mr-2" />
            {t("search")}
          </Button>
        </div>
      </div>
    </div>
  )
}
