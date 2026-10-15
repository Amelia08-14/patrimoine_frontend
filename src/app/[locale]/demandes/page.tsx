"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import axios from "axios"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Search, Handshake, CalendarDays, X, LayoutGrid, LayoutDashboard, List, ChevronDown, Check } from "lucide-react"
import { EntrustedResearchCard, CATEGORY_ICONS } from "@/components/EntrustedResearchCard"
import { AdBanner } from "@/components/AdBanner"
import { AdSidebar, AdStrip } from "@/components/AdSidebar"
import { getCategoryColor } from "@/data/categoryColors"
import { useLocalizedPlaceName } from "@/lib/typeLabels"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

type Period = "ALL" | "TODAY" | "WEEK" | "MONTH"
const PERIOD_DAYS: Record<Exclude<Period, "ALL">, number> = { TODAY: 1, WEEK: 7, MONTH: 30 }
// Catégories proposées au public (Évènementiel et Hébergement chez l'habitant sont masquées côté
// site) — Hébergement & Séjour volontairement en dernier (demande client du 15/10/2026, même choix
// que REAL_ESTATE_CATEGORIES/RESEARCH_BRANCHES).
const FILTER_CATEGORIES = ["RESIDENTIEL", "BUREAUX_COMMERCES", "INDUSTRIEL", "TERRAIN_FONCIER", "HOTELIER"] as const

const ctl = "h-10 rounded-xl border-2 border-gray-200 dark:border-white/15 bg-white dark:bg-white/5 text-sm font-semibold text-gray-800 dark:text-white outline-none focus:border-[#0094BD]"

// Pastille à icône colorée par catégorie — même traitement que le filtre de /announces
// (AnnounceFilter) : icône dans un rond teinté à la couleur de la catégorie.
const chip = (hex: string, Icon: any) => (
  <span className="shrink-0 h-7 w-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${hex}1A` }}>
    <Icon className="h-3.5 w-3.5" style={{ color: hex }} />
  </span>
)

// Liste déroulante Catégorie — icône + couleur par option, même esprit que le sélecteur de
// catégorie de /announces (demande client du 15/10/2026 : "ajouter les icônes et les couleurs").
function CategoryDropdown({ value, onChange, allLabel }: { value: string; onChange: (v: string) => void; allLabel: string }) {
  const tc = useTranslations("Categories")
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selectedColor = value ? getCategoryColor(value).hex : null
  const SelectedIcon = value ? (CATEGORY_ICONS[value] || LayoutGrid) : LayoutGrid

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [open])

  return (
    <div ref={ref} className="relative min-w-0 basis-[calc(50%-0.3rem)] grow sm:basis-auto sm:grow-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${ctl} w-full flex items-center gap-2 px-2.5`}
      >
        {value ? chip(selectedColor!, SelectedIcon) : <span className="shrink-0 h-7 w-7 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center"><LayoutGrid className="h-3.5 w-3.5 text-gray-500 dark:text-white/60" /></span>}
        <span className="flex-1 truncate text-start">{value ? tc(value) : allLabel}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute start-0 top-full z-30 mt-2 w-60 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#03303c] p-1.5 shadow-xl">
          <button
            type="button"
            onClick={() => { onChange(""); setOpen(false) }}
            className={`w-full flex items-center gap-2.5 rounded-xl px-2 py-2 text-start transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${!value ? "bg-gray-50 dark:bg-white/5" : ""}`}
          >
            <span className="shrink-0 h-7 w-7 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center"><LayoutGrid className="h-3.5 w-3.5 text-gray-500 dark:text-white/60" /></span>
            <span className="flex-1 truncate text-[13px] font-semibold text-gray-700 dark:text-white/80">{allLabel}</span>
            {!value && <Check className="h-3.5 w-3.5 text-gray-400" />}
          </button>
          {FILTER_CATEGORIES.map((id) => {
            const color = getCategoryColor(id).hex
            const Icon = CATEGORY_ICONS[id] || LayoutGrid
            const active = value === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => { onChange(id); setOpen(false) }}
                className="w-full flex items-center gap-2.5 rounded-xl px-2 py-2 text-start transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
                style={active ? { backgroundColor: `${color}12` } : undefined}
              >
                {chip(color, Icon)}
                <span className="flex-1 truncate text-[13px] font-semibold text-gray-800 dark:text-white/90" style={active ? { color } : undefined}>{tc(id)}</span>
                {active && <Check className="h-3.5 w-3.5" style={{ color }} />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function DemandesPage() {
  const t = useTranslations("Demandes")
  const place = useLocalizedPlaceName()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [cities, setCities] = useState<Array<{ id: number; nameFr?: string; nameAr?: string }>>([])
  const [towns, setTowns] = useState<Array<{ id: number; nameFr?: string; nameAr?: string }>>([])

  const [transaction, setTransaction] = useState<"" | "SALE" | "RENTAL">("")
  const [category, setCategory] = useState("")
  const [wilaya, setWilaya] = useState("")
  const [commune, setCommune] = useState("")
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

  // Communes de la wilaya choisie — même endpoint que /research et /announces.
  useEffect(() => {
    if (!wilaya) { setTowns([]); setCommune(""); return }
    axios.get(`${API_URL}/cities/${wilaya}/towns`).then((r) => setTowns(Array.isArray(r.data) ? r.data : [])).catch(() => setTowns([]))
  }, [wilaya])

  const filtered = useMemo(() => {
    const activity = (r: any) => new Date(r.lastActivityAt || r.refreshDate || r.createdAt).getTime()
    const now = Date.now()
    const from = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null
    const to = dateTo ? new Date(`${dateTo}T23:59:59`).getTime() : null
    const list = requests.filter((r) => {
      if (transaction && r.transaction !== transaction) return false
      if (category) {
        const rc = r.realEstateType === "HEBERGEMENT" ? "HOTELIER" : r.realEstateType
        if (rc !== category) return false
      }
      // Wilaya/commune : mêmes champs bruts que le backend (cityId, towns en JSON) — cf.
      // entrusted-research.service.ts `enrich()`, qui renvoie aussi cityName/townNames résolus
      // pour l'affichage mais garde les ids bruts pour un filtrage précis côté client.
      if (wilaya && String(r.cityId) !== wilaya) return false
      if (commune) {
        let townIds: number[] = []
        try { townIds = JSON.parse(r.towns || "[]").map(Number) } catch { townIds = [] }
        if (!townIds.includes(Number(commune))) return false
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
  }, [requests, transaction, category, wilaya, commune, period, dateFrom, dateTo])

  const hasFilters = !!(transaction || category || wilaya || commune || period !== "ALL" || dateFrom || dateTo)
  const reset = () => { setTransaction(""); setCategory(""); setWilaya(""); setCommune(""); setPeriod("ALL"); setDateFrom(""); setDateTo("") }

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

      {/* Colonnes publicitaires latérales (mêmes règles que /announces) */}
      <div className="mx-auto flex max-w-[1700px] items-start gap-6 px-4 sm:px-6 lg:px-8 py-8">
        <AdSidebar page="DEMANDES" category={category || undefined} side="start" className="hidden 2xl:block" />
        <div className="min-w-0 flex-1">
        {/* Filtres — même filtre que sur /announces (icônes/couleurs par catégorie, wilaya +
            commune, pas de recherche libre) — demande client du 15/10/2026. */}
        <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-3 md:p-4 shadow-sm relative z-10">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex w-full sm:w-auto rounded-xl border-2 border-gray-200 dark:border-white/15 overflow-hidden h-11 sm:h-10">
              {([["SALE", t("sale"), "#00BFA6"], ["RENTAL", t("rental"), "#003B4A"]] as const).map(([id, label, color]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTransaction(transaction === id ? "" : id)}
                  className={`flex-1 sm:flex-none px-4 text-sm font-bold transition-colors ${transaction === id ? "text-white" : "text-gray-600 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/10"}`}
                  style={transaction === id ? { backgroundColor: color } : undefined}
                >
                  {label}
                </button>
              ))}
            </div>

            <CategoryDropdown value={category} onChange={setCategory} allLabel={t("filterAllActivities")} />

            <select
              value={wilaya}
              onChange={(e) => setWilaya(e.target.value)}
              className={`${ctl} px-3 pe-8 min-w-0 basis-[calc(50%-0.3rem)] grow sm:basis-auto sm:grow-0`}
              aria-label={t("wilayaPlaceholder")}
            >
              <option value="">{t("wilayaPlaceholder")}</option>
              {cities.map((c) => <option key={c.id} value={c.id}>{place.city(c)}</option>)}
            </select>

            <select
              value={commune}
              onChange={(e) => setCommune(e.target.value)}
              disabled={!wilaya}
              className={`${ctl} px-3 pe-8 min-w-0 basis-[calc(50%-0.3rem)] grow sm:basis-auto sm:grow-0 disabled:opacity-50`}
              aria-label={t("communePlaceholder")}
            >
              <option value="">{t("communePlaceholder")}</option>
              {towns.map((tw) => <option key={tw.id} value={tw.id}>{place.town(tw)}</option>)}
            </select>

            <select
              value={period}
              onChange={(e) => { setPeriod(e.target.value as Period); setDateFrom(""); setDateTo("") }}
              className={`${ctl} px-3 pe-8 min-w-0 basis-[calc(50%-0.3rem)] grow sm:basis-auto sm:grow-0`}
              aria-label={t("periodAll")}
            >
              <option value="ALL">{t("periodAll")}</option>
              <option value="TODAY">{t("periodToday")}</option>
              <option value="WEEK">{t("periodWeek")}</option>
              <option value="MONTH">{t("periodMonth")}</option>
            </select>

            <div className="flex w-full sm:w-auto items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-[#0094BD] shrink-0" />
              <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPeriod("ALL") }} className={`${ctl} px-2 min-w-0 flex-1 sm:flex-none sm:w-[8.5rem]`} aria-label={t("dateFrom")} />
              <span className="text-xs font-bold text-gray-400">→</span>
              <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPeriod("ALL") }} className={`${ctl} px-2 min-w-0 flex-1 sm:flex-none sm:w-[8.5rem]`} aria-label={t("dateTo")} />
            </div>

            {hasFilters && (
              <button type="button" onClick={reset} className="h-10 w-10 inline-flex items-center justify-center rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-white/10 transition-colors" aria-label={t("resetFilters")} title={t("resetFilters")}>
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

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
