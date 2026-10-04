"use client"

import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Search, Handshake, CalendarDays, X, ArrowUpDown } from "lucide-react"
import { EntrustedResearchCard, CATEGORY_ICONS } from "@/components/EntrustedResearchCard"
import { getCategoryColor } from "@/data/categoryColors"

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
  const [sort, setSort] = useState<"RECENT" | "OLDEST" | "BUDGET">("RECENT")
  const [query, setQuery] = useState("")

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
    list.sort((a, b) => {
      if (sort === "OLDEST") return activity(a) - activity(b)
      if (sort === "BUDGET") return (b.maxBudget || 0) - (a.maxBudget || 0)
      return activity(b) - activity(a)
    })
    return list
  }, [requests, transaction, category, period, dateFrom, dateTo, sort, query])

  const hasFilters = !!(transaction || category || period !== "ALL" || dateFrom || dateTo || query)
  const reset = () => { setTransaction(""); setCategory(""); setPeriod("ALL"); setDateFrom(""); setDateTo(""); setQuery("") }

  const chip = (active: boolean) =>
    `inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold border-2 transition-all ${
      active
        ? "border-[#0094BD] bg-[#0094BD] text-white shadow-sm"
        : "border-gray-200 dark:border-white/15 bg-white dark:bg-white/5 text-gray-600 dark:text-white/70 hover:border-[#0094BD]"
    }`
  const dateInput = "h-10 px-3 rounded-xl border-2 border-gray-200 dark:border-white/15 bg-white dark:bg-white/5 text-sm font-medium text-gray-800 dark:text-white outline-none focus:border-[#0094BD]"

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtres */}
        <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl p-5 md:p-6 shadow-sm space-y-5 -mt-16 relative z-10">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="w-full h-11 ps-10 pe-4 rounded-xl border-2 border-gray-200 dark:border-white/15 bg-white dark:bg-white/5 text-sm font-medium text-gray-800 dark:text-white outline-none focus:border-[#0094BD]"
              />
            </div>
            <div className="flex gap-2">
              {([["", t("filterAll")], ["SALE", t("sale")], ["RENTAL", t("rental")]] as const).map(([id, label]) => (
                <button
                  key={id || "all"}
                  type="button"
                  onClick={() => setTransaction(id as any)}
                  className={`px-5 h-11 rounded-xl text-sm font-bold border-2 transition-all ${
                    transaction === id
                      ? id === "SALE" ? "bg-[#00BFA6] border-[#00BFA6] text-white" : id === "RENTAL" ? "bg-[#003B4A] border-[#003B4A] text-white" : "bg-gray-800 border-gray-800 text-white"
                      : "border-gray-200 dark:border-white/15 text-gray-600 dark:text-white/70 hover:border-gray-400"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Activité */}
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setCategory("")} className={chip(category === "")}>{t("filterAllActivities")}</button>
            {FILTER_CATEGORIES.map((id) => {
              const Icon = CATEGORY_ICONS[id]
              const active = category === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setCategory(active ? "" : id)}
                  className={chip(false)}
                  style={active ? { backgroundColor: getCategoryColor(id).hex, borderColor: getCategoryColor(id).hex, color: "#fff" } : undefined}
                >
                  <Icon className="h-3.5 w-3.5" /> {tc(id)}
                </button>
              )
            })}
          </div>

          {/* Date */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-gray-100 dark:border-white/10 pt-4">
            <div className="flex flex-wrap items-center gap-2">
              <CalendarDays className="h-4 w-4 text-[#0094BD]" />
              {([["ALL", t("periodAll")], ["TODAY", t("periodToday")], ["WEEK", t("periodWeek")], ["MONTH", t("periodMonth")]] as const).map(([id, label]) => (
                <button key={id} type="button" onClick={() => { setPeriod(id); setDateFrom(""); setDateTo("") }} className={chip(period === id && !dateFrom && !dateTo)}>{label}</button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-gray-500 dark:text-white/60">
              <span>{t("dateFrom")}</span>
              <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPeriod("ALL") }} className={dateInput} />
              <span>{t("dateTo")}</span>
              <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPeriod("ALL") }} className={dateInput} />
            </div>
            <div className="flex items-center gap-2 ms-auto">
              <ArrowUpDown className="h-4 w-4 text-gray-400" />
              <select value={sort} onChange={(e) => setSort(e.target.value as any)} className={dateInput}>
                <option value="RECENT">{t("sortRecent")}</option>
                <option value="OLDEST">{t("sortOldest")}</option>
                <option value="BUDGET">{t("sortBudget")}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Résultats */}
        <div className="mt-6 mb-4 flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-gray-600 dark:text-white/70">{t("resultsCount", { count: filtered.length })}</p>
          {hasFilters && (
            <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0094BD] hover:underline">
              <X className="h-4 w-4" /> {t("resetFilters")}
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500 dark:text-white/50">{t("loading")}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Search className="h-10 w-10 mx-auto text-gray-300 dark:text-white/20 mb-3" />
            <p className="text-gray-500 dark:text-white/60 font-medium">{hasFilters ? t("noMatch") : t("noResults")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((r) => (
              <EntrustedResearchCard key={r.id} research={r} variant="public" />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
