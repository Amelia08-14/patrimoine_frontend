"use client"

import { useState, useEffect } from "react"
import { useRouter, Link } from "@/i18n/navigation"
import { useTranslations, useLocale } from "next-intl"
import axios from "axios"
import {
  Store, Star, Crown, Check, Loader2, Clock,
  AlertCircle, X, ShieldCheck, LayoutTemplate, ArrowRight,
} from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const DATE_LOCALES: Record<string, string> = { fr: 'fr-FR', en: 'en-US', ar: 'ar-DZ' }

type OfferPack = { id: number; kind: 'POINTS' | 'BOUTIQUE'; key: string; title: string; description: string | null; price: number; points: number }

const DEFAULT_COLORS = ["#0EA5E9", "#059669", "#DB2777", "#7C3AED", "#EA580C"]

// Habillage visuel (icône/couleur/bordure/mise en avant) des formules connues — le contenu
// (titre/description/prix/points) vient de l'admin (Points & Achats).
const BOUTIQUE_PACK_STYLE: Record<string, { icon: typeof Store; color: string; border: string; popular?: boolean }> = {
  STANDARD: { icon: Store, color: "#6B7280", border: "border-gray-200 dark:border-white/10" },
  AVANCEE: { icon: Star, color: "#1E40AF", border: "border-blue-200", popular: true },
  ENTREPRISE: { icon: Crown, color: "#D97706", border: "border-amber-200" },
}

// Modal pour choisir/renouveler la formule boutique
function PackModal({ offerPacks, onClose, onSuccess }: { offerPacks: OfferPack[]; onClose: () => void; onSuccess: () => void }) {
  const t = useTranslations("ProfilePoints")

  const FEATURES: Record<string, string[]> = {
    STANDARD: [t("boutiqueStandardFeature1"), t("boutiqueStandardFeature2"), t("boutiqueStandardFeature3"), t("boutiqueStandardFeature4")],
    AVANCEE: [t("boutiqueAvanceeFeature1"), t("boutiqueAvanceeFeature2"), t("boutiqueAvanceeFeature3"), t("boutiqueAvanceeFeature4")],
    ENTREPRISE: [t("boutiqueEntrepriseFeature1"), t("boutiqueEntrepriseFeature2"), t("boutiqueEntrepriseFeature3"), t("boutiqueEntrepriseFeature4"), t("boutiqueEntrepriseFeature5")],
  }

  const FALLBACK = [
    { id: "STANDARD", label: t("boutiqueStandardLabel"), description: null as string | null, price: 5000, points: 50, features: FEATURES.STANDARD, ...BOUTIQUE_PACK_STYLE.STANDARD },
    { id: "AVANCEE", label: t("boutiqueAvanceeLabel"), description: null as string | null, price: 10000, points: 100, features: FEATURES.AVANCEE, ...BOUTIQUE_PACK_STYLE.AVANCEE },
    { id: "ENTREPRISE", label: t("boutiqueEntrepriseLabel"), description: null as string | null, price: 15000, points: 200, features: FEATURES.ENTREPRISE, ...BOUTIQUE_PACK_STYLE.ENTREPRISE },
  ]

  const live = offerPacks.filter((p) => p.kind === 'BOUTIQUE')
  const BOUTIQUE_PACKS = live.length > 0
    ? live.map((p, i) => ({
        id: p.key,
        label: p.title,
        description: p.description,
        price: p.price,
        points: p.points,
        features: FEATURES[p.key] || [],
        ...(BOUTIQUE_PACK_STYLE[p.key] || { icon: Store, color: DEFAULT_COLORS[i % DEFAULT_COLORS.length], border: "border-gray-200 dark:border-white/10" }),
      }))
    : FALLBACK

  const [ordering, setOrdering] = useState<string | null>(null)
  const [error, setError] = useState("")

  const order = async (packId: string) => {
    setOrdering(packId); setError("")
    try {
      const token = localStorage.getItem('token')
      await axios.post(`${API_URL}/boutique-sub/purchase`, { pack: packId }, { headers: { Authorization: `Bearer ${token}` } })
      onSuccess()
      onClose()
    } catch (e: any) {
      setError(e?.response?.data?.message || t("orderError"))
    } finally {
      setOrdering(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-white/5 rounded-2xl shadow-xl w-full max-w-4xl p-6 my-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-black text-gray-900 dark:text-white text-xl flex items-center gap-2">
              <Store className="h-6 w-6 text-[#00BFA6]" /> {t("activateBoutiqueTitle")}
            </h3>
            <p className="text-sm text-gray-500 dark:text-white/50 mt-1">{t("activateBoutiqueSubtitle")}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100"><X className="h-5 w-5" /></button>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> {error}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {BOUTIQUE_PACKS.map(pack => {
            const Icon = pack.icon
            return (
              <div key={pack.id} className={`relative bg-white dark:bg-white/5 rounded-2xl border-2 ${pack.border} overflow-hidden ${pack.popular ? 'ring-2 ring-[#00BFA6]' : ''}`}>
                {pack.popular && (
                  <div className="absolute top-0 inset-x-0 text-center py-1.5 text-xs font-black text-white bg-[#00BFA6]">{t("mostPopular")}</div>
                )}
                <div className={`p-5 ${pack.popular ? 'pt-9' : ''}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: pack.color + '20' }}>
                      <Icon className="h-5 w-5" style={{ color: pack.color }} />
                    </div>
                    <div>
                      <div className="font-black text-gray-900 dark:text-white text-sm">{pack.label}</div>
                      <div className="text-lg font-black" style={{ color: pack.color }}>{t("ptsIncluded", { points: pack.points })}</div>
                    </div>
                  </div>
                  <div className="text-xl font-black text-gray-900 dark:text-white mb-1">{pack.price.toLocaleString()} <span className="text-sm font-bold text-gray-500 dark:text-white/50">{t("perMonth")}</span></div>
                  {pack.description && <p className="text-[11px] text-gray-400 dark:text-white/40 mb-3">{pack.description}</p>}
                  <ul className={`space-y-1.5 mb-4 ${pack.description ? '' : 'mt-2'}`}>
                    {pack.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-xs text-gray-600 dark:text-white/60">
                        <Check className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: pack.color }} /> {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => order(pack.id)}
                    disabled={ordering === pack.id}
                    className="w-full py-2.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
                    style={{ backgroundColor: pack.color }}
                  >
                    {ordering === pack.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Store className="h-4 w-4" />}
                    {t("order")}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function VitrineTypePage() {
  const t = useTranslations("ProfilePoints")
  const locale = useLocale()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [isPro, setIsPro] = useState<boolean | null>(null)
  const [activeSub, setActiveSub] = useState<any>(null)
  const [mySubs, setMySubs] = useState<any[]>([])
  const [offerPacks, setOfferPacks] = useState<OfferPack[]>([])
  const [showPackModal, setShowPackModal] = useState(false)
  const [toast, setToast] = useState("")
  const [boutiqueSlug, setBoutiqueSlug] = useState<string | null>(null)
  const [userId, setUserId] = useState<number | null>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500) }

  const packLabel = (pack: string) => {
    const live = offerPacks.find((p) => p.kind === 'BOUTIQUE' && p.key === pack)
    if (live) return live.title
    const fallback: Record<string, string> = {
      STANDARD: t("boutiqueStandardLabel"),
      AVANCEE: t("boutiqueAvanceeLabel"),
      ENTREPRISE: t("boutiqueEntrepriseLabel"),
    }
    return fallback[pack] || pack
  }

  const TAGLINES: Record<string, string> = {
    STANDARD: t("boutiqueStandardTagline"),
    AVANCEE: t("boutiqueAvanceeTagline"),
    ENTREPRISE: t("boutiqueEntrepriseTagline"),
  }
  const FEATURES_INLINE: Record<string, string[]> = {
    STANDARD: [t("boutiqueStandardFeature1"), t("boutiqueStandardFeature2"), t("boutiqueStandardFeature3"), t("boutiqueStandardFeature4")],
    AVANCEE: [t("boutiqueAvanceeFeature1"), t("boutiqueAvanceeFeature2"), t("boutiqueAvanceeFeature3"), t("boutiqueAvanceeFeature4")],
    ENTREPRISE: [t("boutiqueEntrepriseFeature1"), t("boutiqueEntrepriseFeature2"), t("boutiqueEntrepriseFeature3"), t("boutiqueEntrepriseFeature4"), t("boutiqueEntrepriseFeature5")],
  }
  const INLINE_FALLBACK = [
    { id: "STANDARD", label: t("boutiqueStandardLabel"), price: 5000, points: 50, features: FEATURES_INLINE.STANDARD, tagline: TAGLINES.STANDARD, ...BOUTIQUE_PACK_STYLE.STANDARD },
    { id: "AVANCEE", label: t("boutiqueAvanceeLabel"), price: 10000, points: 100, features: FEATURES_INLINE.AVANCEE, tagline: TAGLINES.AVANCEE, ...BOUTIQUE_PACK_STYLE.AVANCEE },
    { id: "ENTREPRISE", label: t("boutiqueEntrepriseLabel"), price: 15000, points: 200, features: FEATURES_INLINE.ENTREPRISE, tagline: TAGLINES.ENTREPRISE, ...BOUTIQUE_PACK_STYLE.ENTREPRISE },
  ]
  const liveBoutiquePacks = offerPacks.filter((p) => p.kind === 'BOUTIQUE')
  const inlineBoutiquePacks = liveBoutiquePacks.length > 0
    ? liveBoutiquePacks.map((p, i) => ({
        id: p.key,
        label: p.title,
        price: p.price,
        points: p.points,
        features: FEATURES_INLINE[p.key] || [],
        tagline: TAGLINES[p.key] || p.description || "",
        ...(BOUTIQUE_PACK_STYLE[p.key] || { icon: Store, color: DEFAULT_COLORS[i % DEFAULT_COLORS.length], border: "border-gray-200 dark:border-white/10" }),
      }))
    : INLINE_FALLBACK

  const load = async () => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/auth/login'); return }

    // Cette page est réservée aux comptes professionnels — un particulier n'a pas de vitrine.
    try {
      const userStr = localStorage.getItem('user')
      const user = userStr ? JSON.parse(userStr) : null
      if (user?.userType !== 'SOCIETE') { router.push('/profile'); return }
      setIsPro(true)
      setUserId(user.id)
    } catch { /* ignore */ }

    const headers = { Authorization: `Bearer ${token}` }
    try {
      const [sub, subs, packs] = await Promise.all([
        axios.get(`${API_URL}/boutique-sub/active`, { headers }).catch(() => ({ data: null })),
        axios.get(`${API_URL}/boutique-sub/my`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/offer-packs`).catch(() => ({ data: [] })),
      ])
      setActiveSub(sub.data)
      setMySubs(subs.data)
      setOfferPacks(packs.data)
    } catch (e: any) {
      if (e?.response?.status === 401) { localStorage.removeItem('token'); router.push('/auth/login') }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    // Récupère le slug de la boutique (s'il existe) pour construire le lien "Personnaliser ma boutique".
    if (!userId) return
    fetch(`/api/boutique/${userId}`).then(r => r.ok ? r.json() : null).then(d => { if (d?.slug) setBoutiqueSlug(d.slug) }).catch(() => {})
  }, [userId])

  if (loading || isPro === null) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-[#00BFA6]" /></div>

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-transparent py-8 px-4">
      {toast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-medium">{toast}</div>
      )}
      {showPackModal && <PackModal offerPacks={offerPacks} onClose={() => setShowPackModal(false)} onSuccess={() => { showToast(t("subPurchaseSuccess")); load() }} />}

      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm p-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <LayoutTemplate className="h-7 w-7 text-[#00BFA6]" /> {t("vitrineTitle")}
            </h1>
            <p className="text-gray-500 dark:text-white/50 mt-1 text-sm">{t("vitrineSubtitle")}</p>
          </div>
          {activeSub && (
            <Link href={`/boutique/${boutiqueSlug || userId}`} target="_blank" className="text-sm font-bold text-[#00BFA6] hover:underline flex items-center gap-1.5">
              {t("vitrineCustomizeCta")} <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {/* Formule active */}
        {activeSub && (
          <div className="bg-white dark:bg-white/5 rounded-2xl border border-[#00BFA6]/30 shadow-sm p-5 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-[#00BFA6]/10 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-[#00BFA6]" />
              </div>
              <div>
                <p className="font-black text-gray-900 dark:text-white">{packLabel(activeSub.pack)}</p>
                <p className="text-sm text-gray-500 dark:text-white/50">
                  {t("activeUntil", { date: new Date(activeSub.expiresAt).toLocaleDateString(DATE_LOCALES[locale] || 'fr-FR'), points: activeSub.pointsIncluded })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/profile/boutique" className="px-4 py-2 bg-[#00BFA6] text-white rounded-xl text-sm font-bold hover:bg-[#009e88] transition-colors">
                {t("vitrineCustomizeCta")}
              </Link>
              <button onClick={() => setShowPackModal(true)} className="px-4 py-2 border border-[#00BFA6] text-[#00BFA6] rounded-xl text-sm font-bold hover:bg-[#00BFA6]/5 transition-colors">
                {t("renewBtn")}
              </button>
            </div>
          </div>
        )}

        {/* Grille des 3 offres — toujours visible, même avec un abonnement actif, pour pouvoir
            comparer et changer de formule à tout moment. */}
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm p-5">
          <div className="mb-5">
            <h2 className="font-black text-gray-900 dark:text-white text-lg flex items-center gap-2"><Store className="h-5 w-5 text-[#00BFA6]" /> {t("boutiqueOffersTitle")}</h2>
            <p className="text-sm text-gray-500 dark:text-white/50 mt-1">{activeSub ? t("boutiqueOffersActiveSubtitle") : t("boutiqueOffersSubtitle")}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {inlineBoutiquePacks.map(pack => {
              const Icon = pack.icon
              const isCurrent = activeSub?.pack === pack.id
              return (
                <div key={pack.id} className={`relative bg-white dark:bg-white/5 rounded-2xl border-2 overflow-hidden flex flex-col ${isCurrent ? 'border-[#00BFA6] ring-2 ring-[#00BFA6]' : pack.border} ${pack.popular && !isCurrent ? 'ring-2 ring-[#00BFA6]' : ''}`}>
                  {isCurrent ? (
                    <div className="text-center py-1.5 text-xs font-black text-white bg-[#00BFA6] flex items-center justify-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5" /> {t("currentPlanBadge")}
                    </div>
                  ) : pack.popular && (
                    <div className="text-center py-1.5 text-xs font-black text-white bg-[#00BFA6]">{t("mostPopular")}</div>
                  )}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: pack.color + '20' }}>
                        <Icon className="h-5 w-5" style={{ color: pack.color }} />
                      </div>
                      <div className="font-black text-gray-900 dark:text-white text-sm">{pack.label}</div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-white/50 leading-snug mb-3">{pack.tagline}</p>
                    <div className="text-lg font-black" style={{ color: pack.color }}>{t("ptsIncluded", { points: pack.points })}</div>
                    <div className="text-xl font-black text-gray-900 dark:text-white mb-3">{pack.price.toLocaleString()} <span className="text-sm font-bold text-gray-500 dark:text-white/50">{t("perMonth")}</span></div>
                    <ul className="space-y-1.5 mb-4 flex-1">
                      {pack.features.slice(0, 3).map(f => (
                        <li key={f} className="flex items-start gap-2 text-xs text-gray-600 dark:text-white/60">
                          <Check className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: pack.color }} /> {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => !isCurrent && setShowPackModal(true)}
                      disabled={isCurrent}
                      className="w-full py-2.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-default"
                      style={{ backgroundColor: isCurrent ? '#9CA3AF' : pack.color }}
                    >
                      {isCurrent ? <><ShieldCheck className="h-4 w-4" /> {t("currentPlanBadge")}</> : <><Store className="h-4 w-4" /> {activeSub ? t("switchToPlanBtn") : t("activateMyBoutique")}</>}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Historique abonnements boutique */}
        {mySubs.length > 0 && (
          <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm p-6">
            <h2 className="font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-base"><Clock className="h-5 w-5 text-amber-500" /> {t("subsHistoryTitle")}</h2>
            <div className="space-y-3">
              {mySubs.map(s => (
                <div key={s.id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-white/10 last:border-0">
                  <div>
                    <span className="font-bold text-gray-900 dark:text-white">{packLabel(s.pack)}</span>
                    <span className="text-gray-500 dark:text-white/50 text-sm ml-2">— {s.price.toLocaleString()} {t("perMonthShort")}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 dark:text-white/40">{new Date(s.createdAt).toLocaleDateString(DATE_LOCALES[locale] || 'fr-FR')}</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      s.status === 'VALIDATED' ? 'bg-green-100 text-green-700' :
                      s.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {s.status === 'VALIDATED' ? t("validated") : s.status === 'REJECTED' ? t("rejected") : t("pending")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
