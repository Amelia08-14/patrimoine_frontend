"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Calendar, MapPin, Zap, Star, Loader2, AlertCircle, Check, X, Coins, Edit, Eye } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function getImageUrl(url: string) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  let clean = url.replace(/\\/g, '/')
  if (clean.startsWith('/')) clean = clean.substring(1)
  return `${API_URL}/${clean}`
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
      onSuccess()
      onClose()
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

export default function MyAnnouncesPage() {
  const router = useRouter()
  const [announces, setAnnounces] = useState<any[]>([])
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [boosting, setBoosting] = useState<number | null>(null)
  const [featureTarget, setFeatureTarget] = useState<any | null>(null)
  const [toast, setToast] = useState("")

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
    if (balance < 1) { showToast("⚠️ Solde insuffisant — achetez des points"); return }
    setBoosting(id)
    try {
      const token = localStorage.getItem('token')
      await axios.put(`${API_URL}/points/announces/${id}/boost`, {}, { headers: { Authorization: `Bearer ${token}` } })
      showToast("✅ Annonce actualisée ! Elle remonte en tête de sa catégorie.")
      await load()
    } catch (e: any) {
      showToast("❌ " + (e?.response?.data?.message || "Erreur"))
    } finally {
      setBoosting(null)
    }
  }

  const isCurrentlyFeatured = (a: any) => {
    if (!a.featuredUntil) return false
    return new Date(a.featuredUntil) > new Date()
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-[#00BFA6]" /></div>

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-medium">
          {toast}
        </div>
      )}

      {featureTarget && (
        <FeatureModal announce={featureTarget} onClose={() => setFeatureTarget(null)} onSuccess={() => { load(); showToast("⭐ Publicité activée !") }} />
      )}

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes Annonces</h1>
            <p className="text-gray-500 text-sm mt-0.5">{announces.length} annonce{announces.length !== 1 ? 's' : ''} déposée{announces.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/profile/points')} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:border-[#00BFA6] hover:text-[#00BFA6] transition-colors">
              <Coins className="h-4 w-4" /> {balance} pts
            </button>
            <button onClick={() => router.push('/deposit')} className="px-5 py-2 bg-[#00BFA6] text-white rounded-xl font-bold text-sm hover:bg-[#009e88] transition-colors">
              + Déposer
            </button>
          </div>
        </div>

        {announces.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-gray-500 mb-4">Vous n'avez pas encore déposé d'annonce.</p>
            <button onClick={() => router.push('/deposit')} className="px-6 py-3 bg-[#00BFA6] text-white rounded-xl font-bold text-sm">
              Déposer une annonce
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Légende */}
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-4 text-xs text-gray-500 font-medium">
              <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-[#00BFA6]" /> Actualiser = 1 pt → remonte en tête</span>
              <span className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-amber-500" /> Publicité = 2 pts/jour → page d'accueil</span>
            </div>

            {/* Liste */}
            <div className="divide-y divide-gray-100">
              {announces.map(a => {
                const img = a.property?.images?.find((i: any) => i.isMain) || a.property?.images?.[0]
                const city = a.property?.address?.town?.city?.nameFr || a.property?.address?.town?.nameFr || ''
                const commune = a.property?.address?.town?.nameFr || ''
                const featured = isCurrentlyFeatured(a)
                const refreshed = a.refreshDate && (new Date().getTime() - new Date(a.refreshDate).getTime()) < 24 * 3600 * 1000

                return (
                  <div key={a.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                    {/* ID */}
                    <span className="text-xs text-gray-400 font-mono w-10 shrink-0">#{a.id}</span>

                    {/* Image */}
                    <div className="h-14 w-20 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                      {img ? <img src={getImageUrl(img.url)} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200" />}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-gray-900 text-sm truncate">{a.title || a.reference}</span>
                        <span className="text-xs text-gray-400 shrink-0 font-mono">{a.reference}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className={`px-1.5 py-0.5 rounded font-bold ${
                          a.status === 'VALIDATED' ? 'bg-green-100 text-green-700' :
                          a.status === 'WAITING_VALIDATION' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>{a.status === 'VALIDATED' ? 'Validée' : a.status === 'WAITING_VALIDATION' ? 'En attente' : a.status}</span>
                        <span>{a.type === 'SALE' ? 'Vente' : 'Location'}</span>
                        {city && <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{commune}{city && commune !== city ? `, ${city}` : ''}</span>}
                        {a.price && <span className="font-bold text-[#00BFA6]">{Number(a.price).toLocaleString()} DA</span>}
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2 shrink-0">
                      {featured && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                          <Star className="h-3 w-3" /> Publicité jusqu'au {new Date(a.featuredUntil).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                      {refreshed && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-[#00BFA6]/10 text-[#00BFA6] rounded-full text-xs font-bold">
                          <Zap className="h-3 w-3" /> Actualisée
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <a href={`/announces/${a.id}`} target="_blank"
                        className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors" title="Voir">
                        <Eye className="h-4 w-4" />
                      </a>
                      {a.status === 'VALIDATED' && (
                        <>
                          <button
                            onClick={() => boost(a.id)}
                            disabled={boosting === a.id || balance < 1}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-[#00BFA6]/30 text-[#00BFA6] text-xs font-bold hover:bg-[#00BFA6]/5 disabled:opacity-50 transition-colors"
                            title="Actualiser (1 point)"
                          >
                            {boosting === a.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
                            Actualiser
                          </button>
                          <button
                            onClick={() => setFeatureTarget(a)}
                            disabled={balance < 2}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-amber-200 text-amber-600 text-xs font-bold hover:bg-amber-50 disabled:opacity-50 transition-colors"
                            title="Publicité accueil (2 pts/jour)"
                          >
                            <Star className="h-3.5 w-3.5" />
                            {featured ? 'Renouveler' : 'Publier'}
                          </button>
                        </>
                      )}
                    </div>

                    {/* Date */}
                    <span className="text-xs text-gray-400 shrink-0 flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(a.createdAt).toLocaleDateString('fr-FR')}</span>
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
