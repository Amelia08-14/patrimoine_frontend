"use client"

import { useState, useEffect } from "react"
import { useRouter, Link } from "@/i18n/navigation"
import { useTranslations, useLocale } from "next-intl"
import axios from "axios"
import {
  Coins, Star, Zap, Loader2,
  ArrowDownCircle, AlertCircle, Sparkles, X,
  CalendarDays, Crown, Check, ShieldCheck
} from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const DATE_LOCALES: Record<string, string> = { fr: 'fr-FR', en: 'en-US', ar: 'ar-DZ' }

type OfferPack = { id: number; kind: 'POINTS' | 'BOUTIQUE'; key: string; title: string; description: string | null; price: number; points: number }

// Habillage visuel (icône/couleur/bordure, mise en avant) des packs connus — le contenu
// (titre/description/prix/points) vient de l'admin. Tout pack créé depuis l'admin sans style
// connu reçoit une couleur par défaut (cycle ci-dessous) : la liste affichée n'est jamais figée
// à 3 entrées.
const POINT_PACK_STYLE: Record<string, { icon: typeof Coins; color: string; border: string; popular?: boolean }> = {
  PACK_50: { icon: Coins, color: "#6B7280", border: "border-gray-200" },
  PACK_100: { icon: Star, color: "#1E40AF", border: "border-blue-200", popular: true },
  PACK_200: { icon: Crown, color: "#D97706", border: "border-amber-200" },
}
const DEFAULT_COLORS = ["#0EA5E9", "#059669", "#DB2777", "#7C3AED", "#EA580C"]

// Modal achat de points seuls
function PointPackModal({ offerPacks, onClose, onSuccess }: { offerPacks: OfferPack[]; onClose: () => void; onSuccess: () => void }) {
  const t = useTranslations("ProfilePoints")
  const [ordering, setOrdering] = useState<string | null>(null)
  const [error, setError] = useState("")

  // Repli si l'API est injoignable (les 3 packs d'origine) ; sinon, tout ce qui est en base.
  const FALLBACK: { id: string; label: string; description: string | null; points: number; price: number; color: string; popular?: boolean }[] = [
    { id: "PACK_50", label: t("pointPackStarterLabel"), description: null, points: 50, price: 1500, color: "#6B7280" },
    { id: "PACK_100", label: t("pointPackProLabel"), description: null, points: 100, price: 2500, color: "#1E40AF", popular: true },
    { id: "PACK_200", label: t("pointPackPremiumLabel"), description: null, points: 200, price: 3500, color: "#D97706" },
  ]

  const live = offerPacks.filter((p) => p.kind === 'POINTS')
  const POINT_PACKS = live.length > 0
    ? live.map((p, i) => ({
        id: p.key,
        label: p.title,
        description: p.description,
        points: p.points,
        price: p.price,
        ...(POINT_PACK_STYLE[p.key] || { icon: Coins, color: DEFAULT_COLORS[i % DEFAULT_COLORS.length], border: "border-gray-200" }),
      }))
    : FALLBACK

  const order = async (packId: string) => {
    setOrdering(packId); setError("")
    try {
      const token = localStorage.getItem('token')
      await axios.post(`${API_URL}/points/purchase`, { pack: packId }, { headers: { Authorization: `Bearer ${token}` } })
      onSuccess()
      onClose()
    } catch (e: any) {
      setError(e?.response?.data?.message || t("orderError"))
    } finally {
      setOrdering(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-black text-gray-900 text-xl flex items-center gap-2">
              <Coins className="h-6 w-6 text-[#00BFA6]" /> {t("buyPointsTitle")}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{t("buyPointsSubtitle")}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100"><X className="h-5 w-5" /></button>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> {error}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {POINT_PACKS.map(pack => (
            <div key={pack.id} className={`relative bg-white rounded-2xl border-2 overflow-hidden ${pack.popular ? 'ring-2 ring-[#00BFA6] border-[#00BFA6]/30' : 'border-gray-200'}`}>
              {pack.popular && (
                <div className="text-center py-1.5 text-xs font-black text-white bg-[#00BFA6]">{t("mostPopular")}</div>
              )}
              <div className={`p-5 text-center ${pack.popular ? '' : ''}`}>
                <div className="text-3xl font-black mb-1" style={{ color: pack.color }}>{pack.points}</div>
                <div className="text-sm font-bold text-gray-500 mb-3">{t("pointsUnit")}</div>
                <div className="text-xl font-black text-gray-900 mb-1">{pack.price.toLocaleString()}</div>
                <div className="text-xs text-gray-400">{t("oneTimePayment")}</div>
                <div className="text-[11px] text-gray-400 mb-4 min-h-[1em]">{pack.description || ''}</div>
                <button
                  onClick={() => order(pack.id)}
                  disabled={ordering === pack.id}
                  className="w-full py-2.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
                  style={{ backgroundColor: pack.color }}
                >
                  {ordering === pack.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Coins className="h-4 w-4" />}
                  {t("order")}
                </button>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 text-center mt-4">{t("pointsValidityNote")}</p>
      </div>
    </div>
  )
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
      onSuccess(); onClose()
    } catch (e: any) {
      setError(e?.response?.data?.message || t("errorGeneric"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-black text-gray-900 flex items-center gap-2"><Star className="h-5 w-5 text-amber-500" /> {t("featureModalTitle")}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 mb-5">
          <strong>{t("featureModalRefRate", { reference: announce.reference })}</strong>
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex gap-2"><AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">{t("startDate")}</label>
            <input type="date" value={startDate} min={new Date().toISOString().split('T')[0]} onChange={e => setStartDate(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#00BFA6] outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{t("durationLabel")} <span className="text-[#00BFA6]">{t("daysCount", { days })}</span></label>
            <input type="range" min={1} max={30} value={days} onChange={e => setDays(Number(e.target.value))} className="w-full accent-[#00BFA6]" />
            <div className="flex justify-between text-xs text-gray-400 mt-1"><span>{t("oneDay")}</span><span>{t("thirtyDays")}</span></div>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
            <div className="text-2xl font-black text-[#00BFA6]">{t("costPoints", { cost })}</div>
            <div className="text-xs text-gray-500 mt-0.5">{t("costBreakdown", { days })}</div>
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

export default function EspacePublicitairePage() {
  const t = useTranslations("ProfilePoints")
  const ta = useTranslations("ProfileAnnounces")
  const locale = useLocale()
  const router = useRouter()
  const [balance, setBalance] = useState(0)
  const [expirationDate, setExpirationDate] = useState<string | null>(null)
  const [expired, setExpired] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [announces, setAnnounces] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [boosting, setBoosting] = useState<number | null>(null)
  const [featureTarget, setFeatureTarget] = useState<any>(null)
  const [showPointPackModal, setShowPointPackModal] = useState(false)
  const [toast, setToast] = useState("")
  const [offerPacks, setOfferPacks] = useState<OfferPack[]>([])
  // La boutique est réservée aux comptes professionnels — jamais proposée à un particulier.
  const [isPro, setIsPro] = useState(false)

  // Achats de points (formule choisie + total gagné) et filtre période pour l'historique
  const [purchases, setPurchases] = useState<any[]>([])
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [historyLoading, setHistoryLoading] = useState(false)
  // Filtre par type d'action + pagination — purement côté client, sur l'historique déjà
  // récupéré (lui-même filtré par période côté serveur).
  const [actionFilter, setActionFilter] = useState<'ALL' | 'BOOST' | 'FEATURE'>('ALL')
  const [historyPage, setHistoryPage] = useState(1)
  const HISTORY_PAGE_SIZE = 8

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user')
      if (userStr) setIsPro(JSON.parse(userStr).userType === 'SOCIETE')
    } catch { /* ignore */ }
  }, [])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500) }

  const load = async () => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/auth/login'); return }
    const headers = { Authorization: `Bearer ${token}` }
    try {
      const [bal, hist, ann, packs, purch] = await Promise.all([
        axios.get(`${API_URL}/points/balance`, { headers }).catch(() => ({ data: { points: 0 } })),
        axios.get(`${API_URL}/points/history`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/announces/user/my-announces`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/offer-packs`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/points/purchases`, { headers }).catch(() => ({ data: [] })),
      ])
      setBalance(bal.data.points || 0)
      setExpirationDate(bal.data.expirationDate || null)
      setExpired(bal.data.expired || false)
      setHistory(hist.data)
      setAnnounces(ann.data)
      setOfferPacks(packs.data)
      setPurchases(purch.data)
    } catch (e: any) {
      if (e?.response?.status === 401) { localStorage.removeItem('token'); router.push('/auth/login') }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // Filtre période — ne recharge que l'historique de consommation (les achats/solde restent
  // affichés en cumul global, indépendamment de la période choisie).
  useEffect(() => {
    if (!dateFrom && !dateTo) return
    const token = localStorage.getItem('token')
    if (!token) return
    setHistoryLoading(true)
    const params = new URLSearchParams()
    if (dateFrom) params.set('from', dateFrom)
    if (dateTo) params.set('to', dateTo)
    axios.get(`${API_URL}/points/history?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setHistory(r.data))
      .catch(() => {})
      .finally(() => setHistoryLoading(false))
  }, [dateFrom, dateTo])

  const resetPeriod = () => { setDateFrom(""); setDateTo(""); setHistoryPage(1); load() }

  // Revenir à la 1ère page dès que le filtre d'action ou les données changent, pour ne jamais
  // rester bloqué sur une page devenue vide.
  useEffect(() => { setHistoryPage(1) }, [actionFilter, history])

  const filteredHistory = history.filter((h: any) => actionFilter === 'ALL' || h.action === actionFilter)
  const historyTotalPages = Math.max(1, Math.ceil(filteredHistory.length / HISTORY_PAGE_SIZE))
  const pagedHistory = filteredHistory.slice((historyPage - 1) * HISTORY_PAGE_SIZE, historyPage * HISTORY_PAGE_SIZE)

  const pointPackLabel = (pack: string) => {
    const live = offerPacks.find((p) => p.kind === 'POINTS' && p.key === pack)
    if (live) return live.title
    const fallback: Record<string, string> = {
      PACK_50: t("pointPackStarterLabel"),
      PACK_100: t("pointPackProLabel"),
      PACK_200: t("pointPackPremiumLabel"),
    }
    return fallback[pack] || pack
  }

  // Formule de points actuellement choisie = dernier achat validé (le plus récent).
  const latestValidatedPurchase = purchases.find((p) => p.status === 'VALIDATED')
  const totalPointsEarned = purchases.filter((p) => p.status === 'VALIDATED').reduce((sum, p) => sum + p.points, 0)
  const consumedInPeriod = history.reduce((sum: number, h: any) => sum + h.pointsUsed, 0)

  // Ce que rapportent concrètement N points, dérivé des mécaniques réelles (1 pt = actualiser,
  // 2 pts/jour = publicité accueil) — pas de fonctionnalité inventée.
  const pointPackFeatures = (points: number) => [
    t("packFeaturePoints", { points }),
    t("packFeatureBoosts", { count: points }),
    t("packFeatureDays", { days: Math.floor(points / 2) }),
  ]

  // Grille des formules de points disponibles, affichée en ligne sur la page (même logique que
  // la grille des formules boutique sur "Ma boutique") — pas seulement dans la modale d'achat.
  const INLINE_POINT_FALLBACK = [
    { id: "PACK_50", label: t("pointPackStarterLabel"), points: 50, price: 1500, ...POINT_PACK_STYLE.PACK_50 },
    { id: "PACK_100", label: t("pointPackProLabel"), points: 100, price: 2500, ...POINT_PACK_STYLE.PACK_100 },
    { id: "PACK_200", label: t("pointPackPremiumLabel"), points: 200, price: 3500, ...POINT_PACK_STYLE.PACK_200 },
  ]
  const livePointPacks = offerPacks.filter((p) => p.kind === 'POINTS')
  const inlinePointPacks = livePointPacks.length > 0
    ? livePointPacks.map((p, i) => ({
        id: p.key,
        label: p.title,
        points: p.points,
        price: p.price,
        ...(POINT_PACK_STYLE[p.key] || { icon: Coins, color: DEFAULT_COLORS[i % DEFAULT_COLORS.length], border: "border-gray-200" }),
      }))
    : INLINE_POINT_FALLBACK

  const boost = async (id: number) => {
    if (balance < 1) { showToast(t("insufficientBalanceBoutique")); return }
    setBoosting(id)
    try {
      const token = localStorage.getItem('token')
      await axios.put(`${API_URL}/points/announces/${id}/boost`, {}, { headers: { Authorization: `Bearer ${token}` } })
      showToast(t("adRefreshedSuccessBoutique"))
      await load()
    } catch (e: any) {
      showToast("❌ " + (e?.response?.data?.message || ta("errorGeneric")))
    } finally {
      setBoosting(null)
    }
  }

  const isCurrentlyFeatured = (a: any) => a.featuredUntil && new Date(a.featuredUntil) > new Date()

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-[#00BFA6]" /></div>

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {toast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-medium">{toast}</div>
      )}
      {showPointPackModal && <PointPackModal offerPacks={offerPacks} onClose={() => setShowPointPackModal(false)} onSuccess={() => { showToast(t("pointsPurchaseSuccess")); load() }} />}
      {featureTarget && <FeatureModal announce={featureTarget} onClose={() => setFeatureTarget(null)} onSuccess={() => { load(); showToast(ta("adFeaturedSuccess")) }} />}

      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header solde */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Sparkles className="h-7 w-7 text-[#00BFA6]" /> {t("pageTitle")}
            </h1>
            <p className="text-gray-500 mt-1 text-sm">{t("pageSubtitle")}</p>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <div>
              <div className={`text-4xl font-black ${expired ? 'text-red-400' : 'text-[#00BFA6]'}`}>{balance}</div>
              <div className="text-sm text-gray-500 font-medium">{t("pointsAvailable")}</div>
              {expirationDate && !expired && (
                <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1 justify-end">
                  <CalendarDays className="h-3 w-3" /> {t("expiresOn", { date: new Date(expirationDate).toLocaleDateString(DATE_LOCALES[locale] || 'fr-FR') })}
                </div>
              )}
              {expired && <div className="text-xs text-red-500 font-bold mt-0.5">{t("pointsExpired")}</div>}
            </div>
            <button onClick={() => setShowPointPackModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#00BFA6] text-white rounded-xl text-sm font-bold hover:bg-[#009e88] transition-colors">
              <Coins className="h-4 w-4" /> {t("buyPointsBtn")}
            </button>
          </div>
        </div>

        {/* Résumé formule choisie / total / consommés / restants */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-black text-gray-900 mb-4 flex items-center gap-2 text-base"><Coins className="h-5 w-5 text-[#00BFA6]" /> {t("summaryTitle")}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-xs text-gray-500 font-medium mb-1">{t("chosenFormula")}</p>
              <p className="font-black text-gray-900 text-sm truncate">{latestValidatedPurchase ? pointPackLabel(latestValidatedPurchase.pack) : t("noFormulaYet")}</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-xs text-gray-500 font-medium mb-1">{t("totalPointsLabel")}</p>
              <p className="font-black text-gray-900 text-xl">{totalPointsEarned}</p>
            </div>
            <div className="p-4 rounded-xl bg-red-50 border border-red-100">
              <p className="text-xs text-red-500 font-medium mb-1">{t("consumedPointsLabel")}</p>
              <p className="font-black text-red-600 text-xl">{consumedInPeriod}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#00BFA6]/5 border border-[#00BFA6]/20">
              <p className="text-xs text-[#00BFA6] font-medium mb-1">{t("remainingPointsLabel")}</p>
              <p className={`font-black text-xl ${expired ? 'text-red-400' : 'text-[#00BFA6]'}`}>{balance}</p>
            </div>
          </div>
        </div>

        {/* Formules de points disponibles — toujours visible, comme la grille des formules
            boutique sur "Ma boutique" (les packs de points s'additionnent, ne se remplacent pas :
            pas de badge "formule actuelle" désactivant les autres). */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="mb-5">
            <h2 className="font-black text-gray-900 text-lg flex items-center gap-2"><Coins className="h-5 w-5 text-[#00BFA6]" /> {t("pointPacksAvailableTitle")}</h2>
            <p className="text-sm text-gray-500 mt-1">{t("pointPacksAvailableSubtitle")}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {inlinePointPacks.map(pack => {
              const Icon = pack.icon
              const isLatest = latestValidatedPurchase?.pack === pack.id
              return (
                <div key={pack.id} className={`relative bg-white rounded-2xl border-2 overflow-hidden flex flex-col ${pack.popular ? 'ring-2 ring-[#00BFA6] border-[#00BFA6]/30' : pack.border}`}>
                  {isLatest ? (
                    <div className="text-center py-1.5 text-xs font-black text-white bg-[#00BFA6] flex items-center justify-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5" /> {t("lastPurchasedBadge")}
                    </div>
                  ) : pack.popular && (
                    <div className="text-center py-1.5 text-xs font-black text-white bg-[#00BFA6]">{t("mostPopular")}</div>
                  )}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: pack.color + '20' }}>
                        <Icon className="h-5 w-5" style={{ color: pack.color }} />
                      </div>
                      <div className="font-black text-gray-900 text-sm">{pack.label}</div>
                    </div>
                    <div className="text-lg font-black" style={{ color: pack.color }}>{t("ptsIncluded", { points: pack.points })}</div>
                    <div className="text-xl font-black text-gray-900 mb-3">{pack.price.toLocaleString()} <span className="text-sm font-bold text-gray-500">{t("oneTimePayment")}</span></div>
                    <ul className="space-y-1.5 mb-4 flex-1">
                      {pointPackFeatures(pack.points).map(f => (
                        <li key={f} className="flex items-start gap-2 text-xs text-gray-600">
                          <Check className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: pack.color }} /> {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => setShowPointPackModal(true)}
                      className="w-full py-2.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all"
                      style={{ backgroundColor: pack.color }}
                    >
                      <Coins className="h-4 w-4" /> {t("order")}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Comment utiliser */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-black text-gray-900 mb-4 flex items-center gap-2 text-base"><Sparkles className="h-5 w-5 text-[#00BFA6]" /> {t("howToUseTitle")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex gap-3 p-4 bg-[#00BFA6]/5 rounded-xl border border-[#00BFA6]/20">
              <div className="h-9 w-9 rounded-full bg-[#00BFA6] text-white flex items-center justify-center font-black text-sm shrink-0">1</div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{t("step1Title")}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t("step1Text")} <strong>{t("step1Points")}</strong></p>
              </div>
            </div>
            <div className="flex gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="h-9 w-9 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-sm shrink-0">2</div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{t("step2Title")}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t("step2Text")} <strong>{t("step2Points")}</strong></p>
              </div>
            </div>
          </div>
        </div>

        {/* Mes annonces — actions boost/publicité */}
        {announces.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h2 className="font-black text-gray-900 text-base flex items-center gap-2"><Zap className="h-4 w-4 text-[#00BFA6]" /> {t("myAnnouncesTitle")}</h2>
              <Link href="/profile/announces" className="text-sm text-[#00BFA6] font-bold hover:underline">{t("viewAll")}</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {announces.slice(0, 5).map(a => {
                const featured = isCurrentlyFeatured(a)
                const refreshed = a.refreshDate && (new Date().getTime() - new Date(a.refreshDate).getTime()) < 24 * 3600 * 1000
                return (
                  <div key={a.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50">
                    <span className="text-xs text-gray-400 font-mono w-8 shrink-0">#{a.id}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{a.title || a.reference}</p>
                      <p className="text-xs text-gray-400">{a.reference}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {featured && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold flex items-center gap-1"><Star className="h-2.5 w-2.5" />{t("featuredBadge")}</span>}
                      {refreshed && <span className="px-2 py-0.5 bg-[#00BFA6]/10 text-[#00BFA6] rounded-full text-[10px] font-bold flex items-center gap-1"><Zap className="h-2.5 w-2.5" />{t("refreshedBadge")}</span>}
                      {a.status === 'VALIDATED' && (
                        <>
                          <button onClick={() => boost(a.id)} disabled={boosting === a.id || balance < 1}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border-2 border-[#00BFA6]/30 text-[#00BFA6] text-xs font-bold hover:bg-[#00BFA6]/5 disabled:opacity-50 transition-colors">
                            {boosting === a.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />} {t("boostBtn1pt")}
                          </button>
                          <button onClick={() => setFeatureTarget(a)} disabled={balance < 2}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border-2 border-amber-200 text-amber-600 text-xs font-bold hover:bg-amber-50 disabled:opacity-50 transition-colors">
                            <Star className="h-3 w-3" /> {featured ? t("renewBtn") : t("publishBtn")}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Historique utilisation points, avec filtre période + type d'action + pagination */}
        {(history.length > 0 || dateFrom || dateTo) && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="font-black text-gray-900 flex items-center gap-2 text-base"><ArrowDownCircle className="h-5 w-5 text-gray-400" /> {t("pointsUsageTitle")}</h2>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                  <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#00BFA6]" />
                  <span>→</span>
                  <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#00BFA6]" />
                </div>
                {(dateFrom || dateTo) && (
                  <button onClick={resetPeriod} className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-200 text-gray-500 text-xs font-bold hover:bg-gray-50 transition-colors">
                    <X className="h-3 w-3" /> {t("resetFilterBtn")}
                  </button>
                )}
              </div>
            </div>

            {/* Filtre par type d'action */}
            <div className="flex flex-wrap gap-2 mb-4">
              {([
                { id: 'ALL' as const, label: t("historyFilterAll") },
                { id: 'BOOST' as const, label: t("actionBoost") },
                { id: 'FEATURE' as const, label: t("actionFeature") },
              ]).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActionFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${actionFilter === f.id ? 'bg-[#00BFA6] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {historyLoading ? (
              <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-[#00BFA6]" /></div>
            ) : filteredHistory.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">{t("noHistoryForPeriod")}</p>
            ) : (
              <>
                <div className="space-y-3">
                  {pagedHistory.map((h: any) => (
                    <div key={h.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div>
                        <span className="font-bold text-gray-900 text-sm">
                          {h.action === 'BOOST' ? t("actionBoost") : t("actionFeature")}
                        </span>
                        <span className="text-gray-500 text-xs ml-2">— {t("refLabel", { ref: h.announce?.reference || `#${h.announceId}` })}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">{new Date(h.usageDate).toLocaleDateString(DATE_LOCALES[locale] || 'fr-FR')}</span>
                        <span className="font-bold text-red-600 text-sm">{t("minusPoints", { points: h.pointsUsed })}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {historyTotalPages > 1 && (
                  <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-400">{t("historyPageIndicator", { page: historyPage, total: historyTotalPages })}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                        disabled={historyPage === 1}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                      >
                        {t("historyPrevBtn")}
                      </button>
                      <button
                        onClick={() => setHistoryPage((p) => Math.min(historyTotalPages, p + 1))}
                        disabled={historyPage === historyTotalPages}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                      >
                        {t("historyNextBtn")}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
