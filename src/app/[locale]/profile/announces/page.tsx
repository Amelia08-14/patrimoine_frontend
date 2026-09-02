"use client"

import { useEffect, useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import axios from "axios"
import { Calendar, MapPin, Zap, Star, Loader2, AlertCircle, Check, X, Coins, Edit, Eye, Filter, RotateCcw, ListChecks, TrendingUp, Images } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const DATE_LOCALES: Record<string, string> = { fr: 'fr-FR', en: 'en-US', ar: 'ar-DZ' }

function getImageUrl(url: string) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  let clean = url.replace(/\\/g, '/')
  if (clean.startsWith('/')) clean = clean.substring(1)
  return `${API_URL}/${clean}`
}

// Modal publicité
function FeatureModal({ announce, onClose, onSuccess }: { announce: any; onClose: () => void; onSuccess: () => void }) {
  const t = useTranslations("ProfileAnnounces")
  const [days, setDays] = useState(7)
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const cost = days * 2

  const submit = async () => {
    setLoading(true); setError("")
    try {
      const token = localStorage.getItem('token')
      await axios.post(`${API_URL}/points/announces/${announce.id}/feature`, { days, startDate }, { headers: { Authorization: `Bearer ${token}` } })
      onSuccess()
      onClose()
    } catch (e: any) {
      setError(e?.response?.data?.message || t("errorGeneric"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-white/5 rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-black text-gray-900 dark:text-white flex items-center gap-2"><Star className="h-5 w-5 text-amber-500" /> {t("featureModalTitle")}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 mb-5">
          <strong>{t("featureModalRefRate", { reference: announce.reference })}</strong>
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex gap-2"><AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-white/70 mb-1.5">{t("startDate")}</label>
            <input type="date" value={startDate} min={new Date().toISOString().split('T')[0]} onChange={e => setStartDate(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:border-[#00BFA6] outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-white/70 mb-2">{t("durationLabel")} <span className="text-[#00BFA6]">{t("daysCount", { days })}</span></label>
            <input type="range" min={1} max={30} value={days} onChange={e => setDays(Number(e.target.value))} className="w-full accent-[#00BFA6]" />
            <div className="flex justify-between text-xs text-gray-400 dark:text-white/40 mt-1"><span>{t("oneDay")}</span><span>{t("thirtyDays")}</span></div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-transparent rounded-xl border border-gray-200 dark:border-white/10 text-center">
            <div className="text-2xl font-black text-[#00BFA6]">{t("costPoints", { cost })}</div>
            <div className="text-xs text-gray-500 dark:text-white/50 mt-0.5">{t("costBreakdown", { days })}</div>
          </div>
          <button onClick={submit} disabled={loading}
            className="w-full py-3 bg-amber-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-amber-600 disabled:opacity-60 transition-colors">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Coins className="h-4 w-4" />}
            {t("launchAd", { cost })}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MyAnnouncesPage() {
  const t = useTranslations("ProfileAnnounces")
  const locale = useLocale()
  const router = useRouter()
  const [announces, setAnnounces] = useState<any[]>([])
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [boosting, setBoosting] = useState<number | null>(null)
  const [featureTarget, setFeatureTarget] = useState<any | null>(null)
  const [toast, setToast] = useState("")

  // Filtres — statut (actualisée/boostée), période, tri
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'REFRESHED' | 'NOT_REFRESHED' | 'FEATURED' | 'NOT_FEATURED'>('ALL')
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [sortBy, setSortBy] = useState<'RECENT' | 'OLDEST' | 'POINTS_DESC' | 'POINTS_ASC'>('RECENT')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500) }

  const load = async () => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/auth/login'); return }
    const headers = { Authorization: `Bearer ${token}` }
    try {
      const [ann, bal] = await Promise.all([
        axios.get(`${API_URL}/announces/user/my-announces`, { headers }),
        axios.get(`${API_URL}/points/balance`, { headers }).catch(() => ({ data: { points: 0 } }))
      ])
      setAnnounces(ann.data)
      setBalance(bal.data.points)
    } catch (e: any) {
      if (e?.response?.status === 401) { localStorage.removeItem('token'); router.push('/auth/login') }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const boost = async (id: number) => {
    if (balance < 1) { showToast(t("insufficientBalance")); return }
    setBoosting(id)
    try {
      const token = localStorage.getItem('token')
      await axios.put(`${API_URL}/points/announces/${id}/boost`, {}, { headers: { Authorization: `Bearer ${token}` } })
      showToast(t("adRefreshedSuccess"))
      await load()
    } catch (e: any) {
      showToast("❌ " + (e?.response?.data?.message || t("errorGeneric")))
    } finally {
      setBoosting(null)
    }
  }

  const isCurrentlyFeatured = (a: any) => {
    if (!a.featuredUntil) return false
    return new Date(a.featuredUntil) > new Date()
  }

  const isRecentlyRefreshed = (a: any) => !!a.refreshDate && (new Date().getTime() - new Date(a.refreshDate).getTime()) < 24 * 3600 * 1000

  // KPI de positionnement — calculés sur l'ensemble des annonces, indépendamment des filtres actifs,
  // pour donner au client une vue d'ensemble stable pendant qu'il filtre la liste en dessous.
  const kpiRefreshedCount = announces.filter(isRecentlyRefreshed).length
  const kpiFeaturedCount = announces.filter(isCurrentlyFeatured).length
  const kpiPointsSpent = announces.reduce((sum, a) => sum + (a.pointsUsageTotal || 0), 0)

  const hasActiveFilters = statusFilter !== 'ALL' || dateFrom || dateTo || sortBy !== 'RECENT'
  const resetFilters = () => { setStatusFilter('ALL'); setDateFrom(""); setDateTo(""); setSortBy('RECENT') }

  const filteredAnnounces = announces
    .filter((a) => {
      if (statusFilter === 'REFRESHED' && !isRecentlyRefreshed(a)) return false
      if (statusFilter === 'NOT_REFRESHED' && isRecentlyRefreshed(a)) return false
      if (statusFilter === 'FEATURED' && !isCurrentlyFeatured(a)) return false
      if (statusFilter === 'NOT_FEATURED' && isCurrentlyFeatured(a)) return false
      if (dateFrom && new Date(a.createdAt) < new Date(dateFrom)) return false
      if (dateTo && new Date(a.createdAt) > new Date(`${dateTo}T23:59:59`)) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'POINTS_DESC') return (b.pointsUsageTotal || 0) - (a.pointsUsageTotal || 0)
      if (sortBy === 'POINTS_ASC') return (a.pointsUsageTotal || 0) - (b.pointsUsageTotal || 0)
      const da = new Date(a.createdAt).getTime(), db = new Date(b.createdAt).getTime()
      return sortBy === 'OLDEST' ? da - db : db - da
    })

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-[#00BFA6]" /></div>

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-transparent py-8 px-4">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-medium">
          {toast}
        </div>
      )}

      {featureTarget && (
        <FeatureModal announce={featureTarget} onClose={() => setFeatureTarget(null)} onSuccess={() => { load(); showToast(t("adFeaturedSuccess")) }} />
      )}

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
            <p className="text-gray-500 dark:text-white/50 text-sm mt-0.5">{t("countDeposited", { count: announces.length })}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/profile/points')} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-bold text-gray-700 dark:text-white/70 hover:border-[#00BFA6] hover:text-[#00BFA6] transition-colors">
              <Coins className="h-4 w-4" /> {balance} pts
            </button>
            <button onClick={() => router.push('/deposit')} className="px-5 py-2 bg-[#00BFA6] text-white rounded-xl font-bold text-sm hover:bg-[#009e88] transition-colors">
              {t("depositBtn")}
            </button>
          </div>
        </div>

        {announces.length > 0 && (
          <>
            {/* KPI — vue d'ensemble pour aider le client à se positionner, indépendante des filtres */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm p-4 flex items-center gap-3">
                <span className="h-9 w-9 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center shrink-0"><ListChecks className="h-4.5 w-4.5 text-gray-500 dark:text-white/50" /></span>
                <div className="min-w-0"><div className="text-lg font-black text-gray-900 dark:text-white leading-none">{announces.length}</div><div className="text-xs text-gray-500 dark:text-white/50 mt-1 truncate">{t("kpiTotal")}</div></div>
              </div>
              <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm p-4 flex items-center gap-3">
                <span className="h-9 w-9 rounded-xl bg-[#00BFA6]/10 flex items-center justify-center shrink-0"><Zap className="h-4.5 w-4.5 text-[#00BFA6]" /></span>
                <div className="min-w-0"><div className="text-lg font-black text-gray-900 dark:text-white leading-none">{kpiRefreshedCount}</div><div className="text-xs text-gray-500 dark:text-white/50 mt-1 truncate">{t("kpiRefreshed")}</div></div>
              </div>
              <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm p-4 flex items-center gap-3">
                <span className="h-9 w-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0"><Star className="h-4.5 w-4.5 text-amber-500" /></span>
                <div className="min-w-0"><div className="text-lg font-black text-gray-900 dark:text-white leading-none">{kpiFeaturedCount}</div><div className="text-xs text-gray-500 dark:text-white/50 mt-1 truncate">{t("kpiFeatured")}</div></div>
              </div>
              <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm p-4 flex items-center gap-3">
                <span className="h-9 w-9 rounded-xl bg-purple-100 flex items-center justify-center shrink-0"><TrendingUp className="h-4.5 w-4.5 text-purple-500" /></span>
                <div className="min-w-0"><div className="text-lg font-black text-gray-900 dark:text-white leading-none">{kpiPointsSpent}</div><div className="text-xs text-gray-500 dark:text-white/50 mt-1 truncate">{t("kpiPointsSpent")}</div></div>
              </div>
            </div>

            {/* Filtres */}
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm p-4 mb-5 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400 dark:text-white/40 uppercase tracking-wide shrink-0"><Filter className="h-3.5 w-3.5" /></span>

              <div className="flex flex-wrap gap-1.5">
                {([
                  ['ALL', t("filterAll")],
                  ['REFRESHED', t("filterRefreshed")],
                  ['NOT_REFRESHED', t("filterNotRefreshed")],
                  ['FEATURED', t("filterFeatured")],
                  ['NOT_FEATURED', t("filterNotFeatured")],
                ] as const).map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => setStatusFilter(id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${statusFilter === id ? 'bg-[#00BFA6] border-[#00BFA6] text-white' : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/60 hover:border-[#00BFA6] hover:text-[#00BFA6]'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 ml-auto">
                <span className="text-xs font-medium text-gray-500 dark:text-white/50">{t("periodFrom")}</span>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="text-xs border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 focus:border-[#00BFA6] outline-none" />
                <span className="text-xs font-medium text-gray-500 dark:text-white/50">{t("periodTo")}</span>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="text-xs border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 focus:border-[#00BFA6] outline-none" />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs font-bold border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 bg-white dark:bg-white/5 text-gray-700 dark:text-white/70 focus:border-[#00BFA6] outline-none"
                title={t("sortLabel")}
              >
                <option value="RECENT">{t("sortRecent")}</option>
                <option value="OLDEST">{t("sortOldest")}</option>
                <option value="POINTS_DESC">{t("sortMostPoints")}</option>
                <option value="POINTS_ASC">{t("sortLeastPoints")}</option>
              </select>

              {hasActiveFilters && (
                <button onClick={resetFilters} className="flex items-center gap-1.5 text-xs font-bold text-gray-400 dark:text-white/40 hover:text-gray-600 shrink-0">
                  <RotateCcw className="h-3.5 w-3.5" /> {t("resetFilters")}
                </button>
              )}
            </div>
          </>
        )}

        {announces.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm">
            <p className="text-gray-500 dark:text-white/50 mb-4">{t("noAnnouncesYet")}</p>
            <button onClick={() => router.push('/deposit')} className="px-6 py-3 bg-[#00BFA6] text-white rounded-xl font-bold text-sm">
              {t("depositAd")}
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden">
            {/* Légende */}
            <div className="px-5 py-3 border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-transparent flex items-center gap-4 text-xs text-gray-500 dark:text-white/50 font-medium">
              <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-[#00BFA6]" /> {t("legendRefresh")}</span>
              <span className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-amber-500" /> {t("legendFeature")}</span>
            </div>

            {filteredAnnounces.length === 0 && (
              <div className="text-center py-12 text-sm text-gray-400 dark:text-white/40">{t("noResultsFiltered")}</div>
            )}

            {/* Liste */}
            <div className="divide-y divide-gray-100">
              {filteredAnnounces.map(a => {
                const img = a.property?.images?.find((i: any) => i.isMain) || a.property?.images?.[0]
                const city = a.property?.address?.town?.city?.nameFr || a.property?.address?.town?.nameFr || ''
                const commune = a.property?.address?.town?.nameFr || ''
                const featured = isCurrentlyFeatured(a)
                const refreshed = isRecentlyRefreshed(a)
                let videoCount = 0
                try { videoCount = a.property?.videos ? JSON.parse(a.property.videos).length : 0 } catch { videoCount = 0 }
                const mediaCount = (a.property?.images?.length || 0) + videoCount

                return (
                  <div key={a.id} className="flex flex-wrap sm:flex-nowrap items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                    {/* ID */}
                    <span className="text-xs text-gray-400 dark:text-white/40 font-mono w-8 shrink-0 pt-1">#{a.id}</span>

                    {/* Image — badge galerie si plusieurs photos/vidéos */}
                    <div className="relative h-14 w-20 rounded-xl overflow-hidden shrink-0 bg-gray-100 dark:bg-white/10">
                      {img ? <img src={getImageUrl(img.url)} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200 dark:bg-white/10" />}
                      {mediaCount > 1 && (
                        <span className="absolute bottom-0.5 right-0.5 flex items-center gap-0.5 px-1 py-0.5 rounded bg-black/60 text-white text-[9px] font-bold leading-none">
                          <Images className="h-2.5 w-2.5" /> {mediaCount}
                        </span>
                      )}
                    </div>

                    {/* Info : titre, méta, puis badges sur leur propre ligne pour ne rien chevaucher */}
                    <div className="flex-1 min-w-[220px] space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 dark:text-white text-sm truncate max-w-[220px]">{a.title || a.reference}</span>
                        <span className="text-xs text-gray-400 dark:text-white/40 shrink-0 font-mono">{a.reference}</span>
                      </div>
                      <div className="flex items-center gap-x-3 gap-y-1 flex-wrap text-xs text-gray-500 dark:text-white/50">
                        <span className={`px-1.5 py-0.5 rounded font-bold ${
                          a.status === 'VALIDATED' ? 'bg-green-100 text-green-700' :
                          a.status === 'WAITING_VALIDATION' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>{a.status === 'VALIDATED' ? t("statusValidated") : a.status === 'WAITING_VALIDATION' ? t("statusPending") : a.status}</span>
                        <span>{a.type === 'SALE' ? t("typeSale") : t("typeRental")}</span>
                        {city && <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{commune}{city && commune !== city ? `, ${city}` : ''}</span>}
                        {a.price && <span className="font-bold text-[#00BFA6]">{Number(a.price).toLocaleString()} DA</span>}
                      </div>

                      {/* Badges — sur leur propre ligne, passent à la ligne suivante entre eux si besoin */}
                      {(featured || refreshed || a.pointsUsageCount > 0) && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                          {featured && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold whitespace-nowrap">
                              <Star className="h-3 w-3 shrink-0" /> {t("featuredUntil", { date: new Date(a.featuredUntil).toLocaleDateString(DATE_LOCALES[locale] || 'fr-FR') })}
                            </span>
                          )}
                          {refreshed && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-[#00BFA6]/10 text-[#00BFA6] rounded-full text-xs font-bold whitespace-nowrap">
                              <Zap className="h-3 w-3 shrink-0" /> {t("refreshedBadge")}
                            </span>
                          )}
                          {a.pointsUsageCount > 0 && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-bold whitespace-nowrap" title={t("kpiPointsSpent")}>
                              <Coins className="h-3 w-3 shrink-0" /> {t("pointsUsageBadge", { count: a.pointsUsageCount, total: a.pointsUsageTotal })}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Date + Actions — colonne à droite, empilées pour limiter la largeur requise */}
                    <div className="flex flex-col items-end gap-2 shrink-0 ml-auto">
                      <span className="text-xs text-gray-400 dark:text-white/40 flex items-center gap-1 whitespace-nowrap"><Calendar className="h-3 w-3" />{new Date(a.createdAt).toLocaleDateString(DATE_LOCALES[locale] || 'fr-FR')}</span>
                      <div className="flex items-center gap-1.5">
                        <a href={`/announces/${a.id}`} target="_blank"
                          className="p-2 rounded-xl border border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/50 hover:border-gray-300 hover:text-gray-700 transition-colors" title={t("viewTitle")}>
                          <Eye className="h-4 w-4" />
                        </a>
                        {a.status === 'VALIDATED' && (
                          <>
                            <button
                              onClick={() => boost(a.id)}
                              disabled={boosting === a.id || balance < 1}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-[#00BFA6]/30 text-[#00BFA6] text-xs font-bold hover:bg-[#00BFA6]/5 disabled:opacity-50 transition-colors whitespace-nowrap"
                              title={t("refreshTitle")}
                            >
                              {boosting === a.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
                              {t("refreshBtn")}
                            </button>
                            <button
                              onClick={() => setFeatureTarget(a)}
                              disabled={balance < 2}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-amber-200 text-amber-600 text-xs font-bold hover:bg-amber-50 disabled:opacity-50 transition-colors whitespace-nowrap"
                              title={t("featureTitle")}
                            >
                              <Star className="h-3.5 w-3.5" />
                              {featured ? t("renewBtn") : t("publishBtn")}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
