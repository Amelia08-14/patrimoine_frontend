"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import axios from "axios"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Search, Handshake, CalendarDays, X, LayoutGrid, LayoutDashboard, List } from "lucide-react"
import { EntrustedResearchCard } from "@/components/EntrustedResearchCard"
import { AnnounceFilter } from "@/components/AnnounceFilter"
import { WILAYAS } from "@/data/wilayas"
import { COMMUNES } from "@/data/communes"
import { AdBanner } from "@/components/AdBanner"
import { AdSidebar, AdStrip } from "@/components/AdSidebar"
import { getCategoryColor } from "@/data/categoryColors"
import { useLocalizedPlaceName } from "@/lib/typeLabels"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

type Period = "ALL" | "TODAY" | "WEEK" | "MONTH"
const PERIOD_DAYS: Record<Exclude<Period, "ALL">, number> = { TODAY: 1, WEEK: 7, MONTH: 30 }
// Filtre IDENTIQUE à celui de /announces (composant partagé AnnounceFilter, demande client du
// 08/11/2026) : transaction (Achat / Location), immobilier, type de bien, wilaya, commune et « Plus de
// critères » (surface, budget + période de la demande). Les correspondances avec les données d'une
// demande sont faites ici (une demande n'a pas les mêmes champs qu'une annonce).

// Type(s) de bien d'une demande, dans le vocabulaire du filtre (ids de DEPOSIT_PROPERTY_TYPES) — déduits
// du champ propertyType ET du détail enregistré (fiche Industriel / Bureaux / Terrain choisie).
const COMMERCIAL_OF: Record<string, string> = {
  APPARTEMENT: "APPARTEMENT_COMMERCIAL", STUDIO: "APPARTEMENT_COMMERCIAL", DUPLEX: "APPARTEMENT_COMMERCIAL", TRIPLEX: "APPARTEMENT_COMMERCIAL",
  VILLA: "VILLA_COMMERCIALE", NIVEAU_VILLA: "NIVEAU_VILLA_COMMERCIAL",
}
const BUREAUX_SCOPE_TYPE: Record<string, string> = {
  IMMEUBLE: "IMMEUBLE_BUREAU", BLOC_ADMINISTRATIF: "BLOC_ADMINISTRATIF", BLOC_COMMERCIAL: "IMMEUBLE_COMMERCIAL",
  LOCAL_COMMERCIAL: "LOCAL_COMMERCIAL", SHOWROOM: "SHOWROOM",
}
const parseAmenities = (r: any) => { try { return r.amenities ? JSON.parse(r.amenities) : {} } catch { return {} } }
function researchTypeIds(r: any): string[] {
  const a = parseAmenities(r)
  const ids = new Set(String(r.propertyType || "").split(",").map((x) => x.trim()).filter(Boolean))
  if (a.residentiel?.immeuble) ids.add("IMMEUBLE_RESIDENTIEL")
  if (a.industriel?.searchScope) ids.add(a.industriel.searchScope)
  const b = a.bureaux
  if (b?.searchScope === "GROUPEE") (b.groupee?.propertyTypes || []).forEach((id: string) => ids.add(COMMERCIAL_OF[id] || id))
  else if (b?.searchScope && BUREAUX_SCOPE_TYPE[b.searchScope]) ids.add(BUREAUX_SCOPE_TYPE[b.searchScope])
  if (a.terrain?.searchScope) ids.add(`TERRAIN_${a.terrain.searchScope}`)
  return [...ids]
}
// Budget d'une demande en DA bruts (null si l'unité est un prix au m², non comparable).
const BUDGET_FACTORS: Record<string, number> = { DA: 1, MILLION: 1_000_000, MILLIARD: 1_000_000_000 }
function researchBudgetRange(r: any): [number, number] | null {
  const a = parseAmenities(r)
  const unit = a.residentiel?.location?.budgetUnit || a.residentiel?.achatHabitation?.budgetUnit || a.bureaux?.groupee?.budgetUnit || a.bureaux?.blocAdministratif?.budgetUnit || "DA"
  const f = BUDGET_FACTORS[unit]
  if (!f || (!r.minBudget && !r.maxBudget)) return null
  return [(r.minBudget || 0) * f, r.maxBudget ? r.maxBudget * f : Infinity]
}
// Surface d'une demande en m² (hectares convertis), ou capacité en m³ pour une chambre froide.
function researchAreaRange(r: any): [number, number] | null {
  const a = parseAmenities(r)
  const cf = a.industriel?.chambreFroide
  let min = cf ? cf.capaciteMin : r.minSurface
  let max = cf ? cf.capaciteMax : r.maxSurface
  if (!min && !max) return null
  const f = !cf && a.terrain?.surfaceUnit === "HA" ? 10_000 : 1
  return [(min || 0) * f, max ? max * f : Infinity]
}
const normalize = (v?: string) => (v || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "")

const EMPTY_FILTERS = {
  sortBy: "LAST_MODIFIED_DATE_DESC", transactionType: "", realEstateCategory: "", propertyType: "",
  wilaya: "", commune: "", minPrice: "", maxPrice: "", minArea: "", maxArea: "", nbPieces: "",
}

export default function DemandesPage() {
  const t = useTranslations("Demandes")
  const place = useLocalizedPlaceName()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [cities, setCities] = useState<Array<{ id: number; nameFr?: string; nameAr?: string; code?: number }>>([])
  const [towns, setTowns] = useState<Array<{ id: number; nameFr?: string; nameAr?: string }>>([])

  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const onFilterChange = (key: string, value: any) => setFilters((prev) => ({ ...prev, [key]: value }))
  const category = filters.realEstateCategory
  const [period, setPeriod] = useState<Period>("ALL")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "large" | "list">("grid")

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get(`${API_URL}/entrusted-research`)
        setRequests(res.data)
      } catch (err) {
        console.error("Error fetching entrusted researches:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchRequests()
    axios.get(`${API_URL}/cities`).then((r) => setCities(Array.isArray(r.data) ? r.data : [])).catch(() => {})
  }, [])

  const filtered = useMemo(() => {
    const activity = (r: any) => new Date(r.lastActivityAt || r.refreshDate || r.createdAt).getTime()
    const now = Date.now()
    const from = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null
    const to = dateTo ? new Date(`${dateTo}T23:59:59`).getTime() : null
    const list = requests.filter((r) => {
      if (filters.transactionType && r.transaction !== filters.transactionType) return false
      if (category) {
        const rc = r.realEstateType === "HEBERGEMENT" ? "HOTELIER" : r.realEstateType
        if (rc !== category) return false
      }
      if (filters.propertyType && !researchTypeIds(r).includes(filters.propertyType)) return false
      // Wilaya : code du filtre (« 16 ») ↔ code de la wilaya en base (cityId -> City.code).
      if (filters.wilaya) {
        const code = cities.find((c) => c.id === r.cityId)?.code
        if (code === undefined || Number(code) !== Number(filters.wilaya)) return false
      }
      // Commune : par nom (communes du filtre = liste statique, communes d'une demande = base).
      if (filters.commune) {
        const name = normalize(COMMUNES.find((c) => c.id === filters.commune)?.name)
        if (!(r.townNames || []).some((tn: string) => normalize(tn) === name)) return false
      }
      // Budget / surface : la fourchette de la demande doit croiser celle du filtre.
      if (filters.minPrice || filters.maxPrice) {
        const range = researchBudgetRange(r)
        if (range) {
          if (filters.minPrice && range[1] < Number(filters.minPrice)) return false
          if (filters.maxPrice && range[0] > Number(filters.maxPrice)) return false
        }
      }
      if (filters.minArea || filters.maxArea) {
        const range = researchAreaRange(r)
        if (range) {
          if (filters.minArea && range[1] < Number(filters.minArea)) return false
          if (filters.maxArea && range[0] > Number(filters.maxArea)) return false
        }
      }
      const a = activity(r)
      if (period !== "ALL" && now - a > PERIOD_DAYS[period] * 86400000) return false
      if (from !== null && a < from) return false
      if (to !== null && a > to) return false
      return true
    })
    // Plus récentes d'abord (dernière activité : une demande actualisée avec des points remonte).
    list.sort((a, b) => activity(b) - activity(a))
    return list
  }, [requests, filters, category, cities, period, dateFrom, dateTo])

  const periodActiveCount = (period !== "ALL" ? 1 : 0) + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0)
  const hasFilters = !!(filters.transactionType || category || filters.propertyType || filters.wilaya || filters.commune ||
    filters.minPrice || filters.maxPrice || filters.minArea || filters.maxArea || periodActiveCount > 0)
  const resetPeriod = () => { setPeriod("ALL"); setDateFrom(""); setDateTo("") }
  const reset = () => { setFilters(EMPTY_FILTERS); resetPeriod() }

  // Période de la demande — ajoutée en bas de « Plus de critères » du filtre partagé.
  const periodCriteria = (
    <div className="space-y-2">
      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-white/40">{t("filterPeriodLabel")}</span>
      <div className="flex flex-wrap gap-1.5">
        {(["ALL", "TODAY", "WEEK", "MONTH"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => { setPeriod(p); setDateFrom(""); setDateTo("") }}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${period === p && !dateFrom && !dateTo ? "bg-[#0094BD] text-white" : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60 hover:bg-gray-200"}`}
          >
            {t(p === "ALL" ? "periodAll" : p === "TODAY" ? "periodToday" : p === "WEEK" ? "periodWeek" : "periodMonth")}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        <CalendarDays className="h-4 w-4 text-[#0094BD] shrink-0" />
        <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPeriod("ALL") }} className="min-w-0 flex-1 px-2 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-transparent text-sm text-gray-800 dark:text-white outline-none" aria-label={t("dateFrom")} />
        <span className="text-xs font-bold text-gray-400">→</span>
        <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPeriod("ALL") }} className="min-w-0 flex-1 px-2 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-transparent text-sm text-gray-800 dark:text-white outline-none" aria-label={t("dateTo")} />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-transparent pb-12">
      <h1 className="sr-only">{t("title")}</h1>

      {/* Espace publicitaire défilant — même structure que /announces (plus de bandeau photo avec
          overlay sombre, retiré à la demande du client du 15/10/2026). */}
      <div className="px-4 sm:px-6 lg:px-8 pt-6">
        <div className="max-w-[1600px] mx-auto">
          <AdBanner page="DEMANDES" category={category || undefined} />
        </div>
      </div>

      {/* Repère + CTA "Confier ma recherche" — déplacés hors du bandeau photo supprimé. */}
      <div className="px-4 sm:px-6 lg:px-8 pt-5">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-500 dark:text-white/50">
            <span className="font-bold text-gray-900 dark:text-white">{requests.length}</span> {t("totalRequests")}
          </p>
          <Link
            href="/research"
            className="inline-flex items-center gap-2 bg-[#00BFA6] hover:bg-[#00a893] text-white rounded-full px-5 py-2.5 text-sm font-bold transition-colors shrink-0"
          >
            <Handshake className="h-4 w-4" /> {t("entrustMySearch")}
          </Link>
        </div>
      </div>

      {/* Filtre — même composant et même place que sur /announces (pleine largeur, sous la pub). */}
      <div className="relative z-20 px-4 sm:px-6 lg:px-8 pt-5">
        <div className="max-w-[1600px] mx-auto">
          <AnnounceFilter
            filters={filters}
            onFilterChange={onFilterChange}
            accentColor={category ? getCategoryColor(category).hex : undefined}
            transactionLabels={{ SALE: t("sale"), RENTAL: t("rental") }}
            moreExtra={periodCriteria}
            moreExtraActiveCount={periodActiveCount}
            onResetExtra={resetPeriod}
          />
        </div>
      </div>

      {/* Colonnes publicitaires latérales (mêmes règles que /announces) */}
      <div className="mx-auto flex max-w-[1700px] items-start gap-6 px-4 sm:px-6 lg:px-8 py-8">
        <AdSidebar page="DEMANDES" category={category || undefined} side="start" className="hidden 2xl:block" />
        <div className="min-w-0 flex-1">
        {/* Résultats */}
        <div className="mt-6 mb-4 flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-gray-600 dark:text-white/70">{t("resultsCount", { count: filtered.length })}</p>
          <div className="flex items-center gap-3">
            {hasFilters && (
              <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0094BD] hover:underline">
                <X className="h-4 w-4" /> {t("resetFilters")}
              </button>
            )}
            {/* Bascule d'affichage — grille / grandes cartes / liste, comme sur /announces */}
            <div className="flex bg-gray-100 dark:bg-white/10 rounded-lg p-0.5 gap-0.5">
              {([["grid", LayoutGrid, "viewGrid"], ["large", LayoutDashboard, "viewLarge"], ["list", List, "viewList"]] as const).map(([id, Icon, key]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setViewMode(id)}
                  title={t(key)}
                  aria-label={t(key)}
                  className={`p-2.5 sm:p-1.5 rounded-md transition-colors ${viewMode === id ? "bg-white dark:bg-white/20 shadow text-gray-900 dark:text-white" : "text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/70"}`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <AdStrip page="DEMANDES" category={category || undefined} className="mb-5 xl:hidden" />

        {loading ? (
          <div className="text-center py-12 text-gray-500 dark:text-white/50">{t("loading")}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Search className="h-10 w-10 mx-auto text-gray-300 dark:text-white/20 mb-3" />
            <p className="text-gray-500 dark:text-white/60 font-medium">{hasFilters ? t("noMatch") : t("noResults")}</p>
          </div>
        ) : (
          <div className={viewMode === "list" ? "flex flex-col gap-4" : viewMode === "large" ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"}>
            {filtered.map((r) => (
              <EntrustedResearchCard key={r.id} research={r} variant="public" display={viewMode} />
            ))}
          </div>
        )}
        </div>
        <AdSidebar page="DEMANDES" category={category || undefined} side="end" className="hidden xl:block" />
      </div>
    </div>
  )
}
