"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import {
  Coins, Star, Zap, Crown, Check, Loader2, Clock,
  ArrowDownCircle, AlertCircle, Sparkles, Store, X,
  CalendarDays, ShieldCheck
} from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const BOUTIQUE_PACKS = [
  {
    id: "STANDARD",
    label: "Boutique Standard",
    price: 5000,
    points: 50,
    icon: Store,
    color: "#6B7280",
    border: "border-gray-200",
    features: ["Boutique publique activée", "50 points inclus / mois", "50 actualisations d'annonces", "25 jours de publicité à l'accueil"],
  },
  {
    id: "AVANCEE",
    label: "Boutique Avancée",
    price: 10000,
    points: 100,
    icon: Star,
    color: "#1E40AF",
    border: "border-blue-200",
    features: ["Boutique publique activée", "100 points inclus / mois", "100 actualisations d'annonces", "50 jours de publicité à l'accueil"],
    popular: true,
  },
  {
    id: "ENTREPRISE",
    label: "Boutique Entreprise",
    price: 15000,
    points: 200,
    icon: Crown,
    color: "#D97706",
    border: "border-amber-200",
    features: ["Boutique publique activée", "200 points inclus / mois", "200 actualisations d'annonces", "100 jours de publicité à l'accueil", "Support prioritaire"],
  },
]

const POINT_PACKS = [
  { id: "PACK_50",  label: "Starter",  points: 50,  price: 1500, color: "#6B7280" },
  { id: "PACK_100", label: "Pro",      points: 100, price: 2500, color: "#1E40AF", popular: true },
  { id: "PACK_200", label: "Premium",  points: 200, price: 3500, color: "#D97706" },
]

// Modal achat de points seuls
function PointPackModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [ordering, setOrdering] = useState<string | null>(null)
  const [error, setError] = useState("")

  const order = async (packId: string) => {
    setOrdering(packId); setError("")
    try {
      const token = localStorage.getItem('token')
      await axios.post(`${API_URL}/points/purchase`, { pack: packId }, { headers: { Authorization: `Bearer ${token}` } })
      onSuccess()
      onClose()
    } catch (e: any) {
      setError(e?.response?.data?.message || "Erreur lors de la commande.")
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
              <Coins className="h-6 w-6 text-[#00BFA6]" /> Acheter des points
            </h3>
            <p className="text-sm text-gray-500 mt-1">Points crédités après validation par l'administrateur</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100"><X className="h-5 w-5" /></button>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> {error}
          </div>
        )}
        <div className="grid grid-cols-3 gap-4">
          {POINT_PACKS.map(pack => (
            <div key={pack.id} className={`relative bg-white rounded-2xl border-2 overflow-hidden ${pack.popular ? 'ring-2 ring-[#00BFA6] border-[#00BFA6]/30' : 'border-gray-200'}`}>
              {pack.popular && (
                <div className="text-center py-1.5 text-xs font-black text-white bg-[#00BFA6]">⭐ LE PLUS POPULAIRE</div>
              )}
              <div className={`p-5 text-center ${pack.popular ? '' : ''}`}>
                <div className="text-3xl font-black mb-1" style={{ color: pack.color }}>{pack.points}</div>
                <div className="text-sm font-bold text-gray-500 mb-3">points</div>
                <div className="text-xl font-black text-gray-900 mb-1">{pack.price.toLocaleString()}</div>
                <div className="text-xs text-gray-400 mb-4">DA (paiement unique)</div>
                <button
                  onClick={() => order(pack.id)}
                  disabled={ordering === pack.id}
                  className="w-full py-2.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
                  style={{ backgroundColor: pack.color }}
                >
                  {ordering === pack.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Coins className="h-4 w-4" />}
                  Commander
                </button>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 text-center mt-4">Les points sont valables 1 mois à compter de la validation</p>
      </div>
    </div>
  )
}

// Modal pour choisir le pack boutique
function PackModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
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
      setError(e?.response?.data?.message || "Erreur lors de la commande.")
    } finally {
      setOrdering(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl p-6 my-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-black text-gray-900 text-xl flex items-center gap-2">
              <Store className="h-6 w-6 text-[#00BFA6]" /> Activer ma boutique
            </h3>
            <p className="text-sm text-gray-500 mt-1">Choisissez un pack — votre boutique sera activée après validation par l'administrateur</p>
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
              <div key={pack.id} className={`relative bg-white rounded-2xl border-2 ${pack.border} overflow-hidden ${pack.popular ? 'ring-2 ring-[#00BFA6]' : ''}`}>
                {pack.popular && (
                  <div className="absolute top-0 inset-x-0 text-center py-1.5 text-xs font-black text-white bg-[#00BFA6]">⭐ LE PLUS POPULAIRE</div>
                )}
                <div className={`p-5 ${pack.popular ? 'pt-9' : ''}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: pack.color + '20' }}>
                      <Icon className="h-5 w-5" style={{ color: pack.color }} />
                    </div>
                    <div>
                      <div className="font-black text-gray-900 text-sm">{pack.label}</div>
                      <div className="text-lg font-black" style={{ color: pack.color }}>{pack.points} pts inclus</div>
                    </div>
                  </div>
                  <div className="text-xl font-black text-gray-900 mb-3">{pack.price.toLocaleString()} <span className="text-sm font-bold text-gray-500">DA/mois</span></div>
                  <ul className="space-y-1.5 mb-4">
                    {pack.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-xs text-gray-600">
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
                    Commander
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

// Modal publicité
function FeatureModal({ announce, onClose, onSuccess }: { announce: any; onClose: () => void; onSuccess: () => void }) {
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
      setError(e?.response?.data?.message || "Erreur")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-black text-gray-900 flex items-center gap-2"><Star className="h-5 w-5 text-amber-500" /> Publicité à l'accueil</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 mb-5">
          <strong>Réf: {announce.reference}</strong> — Tarif : 2 points/jour
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex gap-2"><AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Date de début</label>
            <input type="date" value={startDate} min={new Date().toISOString().split('T')[0]} onChange={e => setStartDate(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#00BFA6] outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Durée : <span className="text-[#00BFA6]">{days} jours</span></label>
            <input type="range" min={1} max={30} value={days} onChange={e => setDays(Number(e.target.value))} className="w-full accent-[#00BFA6]" />
            <div className="flex justify-between text-xs text-gray-400 mt-1"><span>1 jour</span><span>30 jours</span></div>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
            <div className="text-2xl font-black text-[#00BFA6]">{cost} points</div>
            <div className="text-xs text-gray-500 mt-0.5">{days} jour{days > 1 ? 's' : ''} × 2 points/jour</div>
          </div>
          <button onClick={submit} disabled={loading}
            className="w-full py-3 bg-amber-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-amber-600 disabled:opacity-60 transition-colors">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Coins className="h-4 w-4" />}
            Lancer la publicité ({cost} pts)
          </button>
        </div>
      </div>
    </div>
  )
}

export default function EspacePublicitairePage() {
  const router = useRouter()
  const [balance, setBalance] = useState(0)
  const [expirationDate, setExpirationDate] = useState<string | null>(null)
  const [expired, setExpired] = useState(false)
  const [activeSub, setActiveSub] = useState<any>(null)
  const [mySubs, setMySubs] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [announces, setAnnounces] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [boosting, setBoosting] = useState<number | null>(null)
  const [featureTarget, setFeatureTarget] = useState<any>(null)
  const [showPackModal, setShowPackModal] = useState(false)
  const [showPointPackModal, setShowPointPackModal] = useState(false)
  const [toast, setToast] = useState("")

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500) }

  const load = async () => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/auth/login'); return }
    const headers = { Authorization: `Bearer ${token}` }
    try {
      const [bal, sub, subs, hist, ann] = await Promise.all([
        axios.get(`${API_URL}/points/balance`, { headers }).catch(() => ({ data: { points: 0 } })),
        axios.get(`${API_URL}/boutique-sub/active`, { headers }).catch(() => ({ data: null })),
        axios.get(`${API_URL}/boutique-sub/my`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/points/history`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/announces/user/my-announces`, { headers }).catch(() => ({ data: [] })),
      ])
      setBalance(bal.data.points || 0)
      setExpirationDate(bal.data.expirationDate || null)
      setExpired(bal.data.expired || false)
      setActiveSub(sub.data)
      setMySubs(subs.data)
      setHistory(hist.data)
      setAnnounces(ann.data)
    } catch (e: any) {
      if (e?.response?.status === 401) { localStorage.removeItem('token'); router.push('/auth/login') }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const boost = async (id: number) => {
    if (balance < 1) { showToast("⚠️ Solde insuffisant — rechargez votre boutique"); return }
    setBoosting(id)
    try {
      const token = localStorage.getItem('token')
      await axios.put(`${API_URL}/points/announces/${id}/boost`, {}, { headers: { Authorization: `Bearer ${token}` } })
      showToast("✅ Annonce actualisée — elle remonte en tête de sa catégorie !")
      await load()
    } catch (e: any) {
      showToast("❌ " + (e?.response?.data?.message || "Erreur"))
    } finally {
      setBoosting(null)
    }
  }

  const isCurrentlyFeatured = (a: any) => a.featuredUntil && new Date(a.featuredUntil) > new Date()

  const packLabel = (pack: string) => BOUTIQUE_PACKS.find(p => p.id === pack)?.label || pack

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-[#00BFA6]" /></div>

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {toast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-medium">{toast}</div>
      )}
      {showPackModal && <PackModal onClose={() => setShowPackModal(false)} onSuccess={() => { showToast("✅ Demande envoyée — en attente de validation admin"); load() }} />}
      {showPointPackModal && <PointPackModal onClose={() => setShowPointPackModal(false)} onSuccess={() => { showToast("✅ Commande envoyée — points crédités après validation"); load() }} />}
      {featureTarget && <FeatureModal announce={featureTarget} onClose={() => setFeatureTarget(null)} onSuccess={() => { load(); showToast("⭐ Publicité activée !") }} />}

      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header solde */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Sparkles className="h-7 w-7 text-[#00BFA6]" /> Espace Publicitaire et Points
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Gérez votre boutique, boostez vos annonces</p>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <div>
              <div className={`text-4xl font-black ${expired ? 'text-red-400' : 'text-[#00BFA6]'}`}>{balance}</div>
              <div className="text-sm text-gray-500 font-medium">points disponibles</div>
              {expirationDate && !expired && (
                <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1 justify-end">
                  <CalendarDays className="h-3 w-3" /> expire le {new Date(expirationDate).toLocaleDateString('fr-FR')}
                </div>
              )}
              {expired && <div className="text-xs text-red-500 font-bold mt-0.5">Points expirés — renouvelez votre boutique</div>}
            </div>
            <button onClick={() => setShowPointPackModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#00BFA6] text-white rounded-xl text-sm font-bold hover:bg-[#009e88] transition-colors">
              <Coins className="h-4 w-4" /> Acheter des points
            </button>
          </div>
        </div>

        {/* Abonnement boutique actif */}
        {activeSub ? (
          <div className="bg-white rounded-2xl border border-[#00BFA6]/30 shadow-sm p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-[#00BFA6]/10 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-[#00BFA6]" />
              </div>
              <div>
                <p className="font-black text-gray-900">{packLabel(activeSub.pack)}</p>
                <p className="text-sm text-gray-500">
                  Actif jusqu'au {new Date(activeSub.expiresAt).toLocaleDateString('fr-FR')} · {activeSub.pointsIncluded} pts/mois inclus
                </p>
              </div>
            </div>
            <button onClick={() => setShowPackModal(true)} className="px-4 py-2 border border-[#00BFA6] text-[#00BFA6] rounded-xl text-sm font-bold hover:bg-[#00BFA6]/5 transition-colors">
              Renouveler
            </button>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Store className="h-8 w-8 text-amber-500" />
              <div>
                <p className="font-black text-gray-900">Boutique non activée</p>
                <p className="text-sm text-gray-600">Achetez un pack boutique pour activer votre vitrine publique et obtenir des points</p>
              </div>
            </div>
            <button onClick={() => setShowPackModal(true)} className="px-5 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition-colors flex items-center gap-2">
              <Store className="h-4 w-4" /> Activer ma boutique
            </button>
          </div>
        )}

        {/* Comment utiliser */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-black text-gray-900 mb-4 flex items-center gap-2 text-base"><Sparkles className="h-5 w-5 text-[#00BFA6]" /> Comment utiliser vos points ?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex gap-3 p-4 bg-[#00BFA6]/5 rounded-xl border border-[#00BFA6]/20">
              <div className="h-9 w-9 rounded-full bg-[#00BFA6] text-white flex items-center justify-center font-black text-sm shrink-0">1</div>
              <div>
                <p className="font-bold text-gray-900 text-sm">Actualiser une annonce</p>
                <p className="text-xs text-gray-500 mt-0.5">Remonte en 1ère position dans sa catégorie · <strong>1 point</strong></p>
              </div>
            </div>
            <div className="flex gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="h-9 w-9 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-sm shrink-0">2</div>
              <div>
                <p className="font-bold text-gray-900 text-sm">Publicité page d'accueil</p>
                <p className="text-xs text-gray-500 mt-0.5">Mise en avant en page principale · <strong>2 points/jour</strong></p>
              </div>
            </div>
          </div>
        </div>

        {/* Mes annonces — actions boost/publicité */}
        {announces.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h2 className="font-black text-gray-900 text-base flex items-center gap-2"><Zap className="h-4 w-4 text-[#00BFA6]" /> Mes annonces</h2>
              <a href="/profile/announces" className="text-sm text-[#00BFA6] font-bold hover:underline">Voir tout →</a>
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
                      {featured && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold flex items-center gap-1"><Star className="h-2.5 w-2.5" />Publicité</span>}
                      {refreshed && <span className="px-2 py-0.5 bg-[#00BFA6]/10 text-[#00BFA6] rounded-full text-[10px] font-bold flex items-center gap-1"><Zap className="h-2.5 w-2.5" />Actualisée</span>}
                      {a.status === 'VALIDATED' && (
                        <>
                          <button onClick={() => boost(a.id)} disabled={boosting === a.id || balance < 1}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border-2 border-[#00BFA6]/30 text-[#00BFA6] text-xs font-bold hover:bg-[#00BFA6]/5 disabled:opacity-50 transition-colors">
                            {boosting === a.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />} 1pt
                          </button>
                          <button onClick={() => setFeatureTarget(a)} disabled={balance < 2}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border-2 border-amber-200 text-amber-600 text-xs font-bold hover:bg-amber-50 disabled:opacity-50 transition-colors">
                            <Star className="h-3 w-3" /> {featured ? 'Renouveler' : 'Publier'}
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

        {/* Historique abonnements boutique */}
        {mySubs.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-black text-gray-900 mb-4 flex items-center gap-2 text-base"><Clock className="h-5 w-5 text-amber-500" /> Historique abonnements</h2>
            <div className="space-y-3">
              {mySubs.map(s => (
                <div key={s.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <span className="font-bold text-gray-900">{packLabel(s.pack)}</span>
                    <span className="text-gray-500 text-sm ml-2">— {s.price.toLocaleString()} DA/mois</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{new Date(s.createdAt).toLocaleDateString('fr-FR')}</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      s.status === 'VALIDATED' ? 'bg-green-100 text-green-700' :
                      s.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {s.status === 'VALIDATED' ? '✓ Validé' : s.status === 'REJECTED' ? '✗ Refusé' : '⏳ En attente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Historique utilisation points */}
        {history.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-black text-gray-900 mb-4 flex items-center gap-2 text-base"><ArrowDownCircle className="h-5 w-5 text-gray-400" /> Utilisation des points</h2>
            <div className="space-y-3">
              {history.map((h: any) => (
                <div key={h.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <span className="font-bold text-gray-900 text-sm">
                      {h.action === 'BOOST' ? '📤 Actualisation' : '⭐ Publicité accueil'}
                    </span>
                    <span className="text-gray-500 text-xs ml-2">— Réf: {h.announce?.reference || `#${h.announceId}`}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{new Date(h.usageDate).toLocaleDateString('fr-FR')}</span>
                    <span className="font-bold text-red-600 text-sm">-{h.pointsUsed} pts</span>
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
