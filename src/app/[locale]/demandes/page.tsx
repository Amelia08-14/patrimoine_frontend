"use client"

import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Search, Handshake, CalendarDays, X, LayoutGrid, LayoutDashboard, List } from "lucide-react"
import { EntrustedResearchCard } from "@/components/EntrustedResearchCard"
import { AdSidebar, AdStrip } from "@/components/AdSidebar"

type Period = "ALL" | "TODAY" | "WEEK" | "MONTH"
const PERIOD_DAYS: Record<Exclude<Period, "ALL">, number> = { TODAY: 1, WEEK: 7, MONTH: 30 }
// Catégories proposées au public (Évènementiel et Hébergement chez l'habitant sont masquées côté site).
const FILTER_CATEGORIES = ["RESIDENTIEL", "BUREAUX_COMMERCES", "INDUSTRIEL", "TERRAIN_FONCIER", "HOTELIER"] as const

export default function DemandesPage() {
  const t = useTranslations("Demandes")
  const tc = useTranslations("Categories")
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [transaction, setTransaction] = useState<"" | "SALE" | "RENTAL">("")
  const [category, setCategory] = useState("")
  const [period, setPeriod] = useState<Period>("ALL")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [query, setQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "large" | "list">("grid")

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const res = await axios.get(`${apiUrl}/entrusted-research`)
        setRequests(res.data)
      } catch (err) {
        console.error("Error fetching entrusted researches:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchRequests()
  }, [])

  const filtered = useMemo(() => {
    const activity = (r: any) => new Date(r.lastActivityAt || r.refreshDate || r.createdAt).getTime()
    const now = Date.now()
    const from = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null
    const to = dateTo ? new Date(`${dateTo}T23:59:59`).getTime() : null
    const q = query.trim().toLowerCase()
    const list = requests.filter((r) => {
      if (transaction && r.transaction !== transaction) return false
      if (category) {
        const rc = r.realEstateType === "HEBERGEMENT" ? "HOTELIER" : r.realEstateType
        if (rc !== category) return false
      }
      const a = activity(r)
      if (period !== "ALL" && now - a > PERIOD_DAYS[period] * 86400000) return false
      if (from !== null && a < from) return false
      if (to !== null && a > to) return false
      if (q) {
        const hay = [r.comment, r.cityName, ...(r.townNames || []), r.propertyType].filter(Boolean).join(" ").toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
    // Plus récentes d'abord (dernière activité : une demande actualisée avec des points remonte).
    list.sort((a, b) => activity(b) - activity(a))
    return list
  }, [requests, transaction, category, period, dateFrom, dateTo, query])

  const hasFilters = !!(transaction || category || period !== "ALL" || dateFrom || dateTo || query)
  const reset = () => { setTransaction(""); setCategory(""); setPeriod("ALL"); setDateFrom(""); setDateTo(""); setQuery("") }

  const ctl = "h-10 rounded-xl border-2 border-gray-200 dark:border-white/15 bg-white dark:bg-white/5 text-sm font-semibold text-gray-800 dark:text-white outline-none focus:border-[#0094BD]"

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#022229]">
      {/* En-tête */}
      <div className="relative overflow-hidden bg-[#003B4A] text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/seeker-bg.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#003B4A] via-[#003B4A]/85 to-[#0094BD]/40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-extrabold">{t("title")}</h1>
            <p className="mt-3 text-white/80">{t("subtitle")}</p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="rounded-2xl bg-white/10 backdrop-blur px-5 py-3 text-center">
              <div className="text-3xl font-black leading-none">{requests.length}</div>
              <div className="mt-1 text-[11px] font-bold uppercase tracking-wider text-white/70">{t("totalRequests")}</div>
            </div>
            <Link
              href="/research"
              className="inline-flex items-center gap-2 bg-[#00BFA6] hover:bg-[#00a893] text-white rounded-full px-6 py-3.5 font-bold transition-colors"
            >
              <Handshake className="h-4 w-4" /> {t("entrustMySearch")}
            </Link>
          </div>
        </div>
      </div>

      {/* Colonnes publicitaires latérales (mêmes règles que /announces) */}
      <div className="mx-auto flex max-w-[1700px] items-start gap-6 px-4 sm:px-6 lg:px-8 py-8">
        <AdSidebar page="DEMANDES" category={category || undefined} side="start" className="hidden 2xl:block mt-24" />
        <div className="min-w-0 flex-1">
        {/* Filtres — une seule barre compacte, comme sur /announces */}
        <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-3 md:p-4 shadow-sm -mt-14 relative z-10">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className={`${ctl} w-full ps-9 pe-3`}
              />
            </div>

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

            <select value={category} onChange={(e) => setCategory(e.target.value)} className={`${ctl} px-3 pe-8 min-w-0 basis-[calc(50%-0.3rem)] grow sm:basis-auto sm:grow-0`} aria-label={t("filterAllActivities")}>
              <option value="">{t("filterAllActivities")}</option>
              {FILTER_CATEGORIES.map((id) => <option key={id} value={id}>{tc(id)}</option>)}
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
        <AdSidebar page="DEMANDES" category={category || undefined} side="end" className="hidden xl:block mt-24" />
      </div>
    </div>
  )
}
