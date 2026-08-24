"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Coins, Check, X, Loader2, AlertCircle, RefreshCw, User, MapPin, Search } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const BOUTIQUE_PACK_LABELS: Record<string, { label: string; pts: number }> = {
  STANDARD:   { label: "Boutique Standard",   pts: 50  },
  AVANCEE:    { label: "Boutique Avancée",     pts: 100 },
  ENTREPRISE: { label: "Boutique Entreprise",  pts: 200 },
}

const POINT_PACK_LABELS: Record<string, { label: string; pts: number }> = {
  PACK_50:  { label: "Starter", pts: 50 },
  PACK_100: { label: "Pro",     pts: 100 },
  PACK_200: { label: "Premium", pts: 200 },
}

type Purchase = {
  id: number
  source: 'POINTS' | 'BOUTIQUE'
  pack: string
  price: number
  points: number
  status: 'PENDING' | 'VALIDATED' | 'REJECTED'
  createdAt: string
  validatedAt: string | null
  expiresAt: string | null
  user: {
    id: number
    firstName: string
    lastName: string
    email: string
    companyName: string | null
    userType: 'PARTICULIER' | 'SOCIETE' | 'ADMIN'
    location: string | null
  }
}

export default function AdminPointsPage() {
  const router = useRouter()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'VALIDATED' | 'REJECTED'>('PENDING')
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'POINTS' | 'BOUTIQUE'>('ALL')
  const [accountTypeFilter, setAccountTypeFilter] = useState<'ALL' | 'PARTICULIER' | 'SOCIETE'>('ALL')
  const [search, setSearch] = useState("")
  const [wilaya, setWilaya] = useState("")
  const [commune, setCommune] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [cities, setCities] = useState<any[]>([])
  const [towns, setTowns] = useState<any[]>([])
  const [processing, setProcessing] = useState<number | null>(null)
  const [toast, setToast] = useState("")
  const [error, setError] = useState("")

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500) }
  const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('admin_token')}` })

  useEffect(() => {
    fetch(`${API_URL}/cities`).then((r) => r.json()).then(setCities).catch(() => {})
  }, [])

  useEffect(() => {
    if (!wilaya) { setTowns([]); return }
    fetch(`${API_URL}/cities/${wilaya}/towns`).then((r) => r.json()).then(setTowns).catch(() => {})
  }, [wilaya])

  const load = useCallback(async () => {
    setLoading(true); setError("")
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'ALL') params.set('status', statusFilter)
      if (search) params.set('search', search)
      if (wilaya) params.set('wilaya', wilaya)
      if (commune) params.set('commune', commune)
      const res = await axios.get(`${API_URL}/admin/purchases?${params.toString()}`, { headers: getHeaders() })
      setPurchases(res.data)
    } catch (e: any) {
      if (e?.response?.status === 401) { router.push('/admin/login'); return }
      setError("Erreur lors du chargement.")
    } finally {
      setLoading(false)
    }
  }, [statusFilter, search, wilaya, commune, router])

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => {
    return purchases.filter((p) => {
      if (sourceFilter !== 'ALL' && p.source !== sourceFilter) return false
      if (accountTypeFilter !== 'ALL' && p.user.userType !== accountTypeFilter) return false
      if (dateFrom && new Date(p.createdAt) < new Date(dateFrom)) return false
      if (dateTo && new Date(p.createdAt) > new Date(`${dateTo}T23:59:59`)) return false
      return true
    })
  }, [purchases, sourceFilter, accountTypeFilter, dateFrom, dateTo])

  const validate = async (p: Purchase) => {
    setProcessing(p.id)
    try {
      const base = p.source === 'BOUTIQUE' ? 'boutique-sub/admin' : 'points/admin/purchases'
      await axios.put(`${API_URL}/${base}/${p.id}/validate`, {}, { headers: getHeaders() })
      showToast(p.source === 'BOUTIQUE' ? "✅ Boutique activée et points crédités !" : "✅ Points crédités !")
      await load()
    } catch (e: any) {
      showToast("❌ " + (e?.response?.data?.message || "Erreur"))
    } finally {
      setProcessing(null)
    }
  }

  const reject = async (p: Purchase) => {
    if (!confirm("Rejeter cette demande ?")) return
    setProcessing(p.id)
    try {
      const base = p.source === 'BOUTIQUE' ? 'boutique-sub/admin' : 'points/admin/purchases'
      await axios.put(`${API_URL}/${base}/${p.id}/reject`, {}, { headers: getHeaders() })
      showToast("Demande refusée.")
      await load()
    } catch (e: any) {
      showToast("❌ " + (e?.response?.data?.message || "Erreur"))
    } finally {
      setProcessing(null)
    }
  }

  const pendingCount = purchases.filter(p => p.status === 'PENDING').length

  return (
    <div>
      {toast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-medium">{toast}</div>
      )}

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Coins className="h-7 w-7 text-[#00BFA6]" /> Points & Achats
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Demandes envoyées par tous les comptes (particuliers et professionnels)</p>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <span className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
              {pendingCount} en attente
            </span>
          )}
          <button onClick={load} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
            <RefreshCw className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" /> {error}
        </div>
      )}

      {/* Filtres */}
      <div className="space-y-3 mb-6">
        <div className="flex gap-2 flex-wrap">
          {(['PENDING', 'ALL', 'VALIDATED', 'REJECTED'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${statusFilter === s ? 'bg-[#00BFA6] text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#00BFA6] hover:text-[#00BFA6]'}`}>
              {s === 'ALL' ? 'Tous' : s === 'PENDING' ? '⏳ En attente' : s === 'VALIDATED' ? '✓ Validées' : '✗ Refusées'}
            </button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <select value={accountTypeFilter} onChange={(e) => setAccountTypeFilter(e.target.value as any)} className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium bg-white outline-none">
            <option value="ALL">Type de client : Tous</option>
            <option value="PARTICULIER">Particulier</option>
            <option value="SOCIETE">Professionnel</option>
          </select>

          <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value as any)} className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium bg-white outline-none">
            <option value="ALL">Type de pack : Tous</option>
            <option value="POINTS">Pack points</option>
            <option value="BOUTIQUE">Pack boutique</option>
          </select>

          <select value={wilaya} onChange={(e) => { setWilaya(e.target.value); setCommune("") }} className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium bg-white outline-none">
            <option value="">Toutes wilayas</option>
            {cities.map((c: any) => <option key={c.id} value={c.id}>{c.nameFr}</option>)}
          </select>

          {wilaya && (
            <select value={commune} onChange={(e) => setCommune(e.target.value)} className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium bg-white outline-none">
              <option value="">Toutes communes</option>
              {towns.map((t: any) => <option key={t.id} value={t.id}>{t.nameFr}</option>)}
            </select>
          )}

          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <span className="text-xs font-medium">Du</span>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-2 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium bg-white outline-none" />
            <span className="text-xs font-medium">au</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-2 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium bg-white outline-none" />
          </div>

          <div className="bg-white px-3 py-2 rounded-xl border-2 border-gray-200 flex items-center gap-2 flex-1 min-w-[220px]">
            <Search className="h-4 w-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nom du client ou du professionnel..." className="outline-none text-sm w-full" />
          </div>
        </div>
      </div>

      {/* Info packs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {sourceFilter !== 'POINTS' && Object.entries(BOUTIQUE_PACK_LABELS).map(([key, val]) => (
          <div key={key} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <div className="font-black text-gray-900 text-sm">{val.label}</div>
            <div className="text-[#00BFA6] font-bold">{val.pts} pts</div>
            <div className="text-xs text-gray-400">{key === 'STANDARD' ? '5 000' : key === 'AVANCEE' ? '10 000' : '15 000'} DA/mois</div>
          </div>
        ))}
        {sourceFilter !== 'BOUTIQUE' && Object.entries(POINT_PACK_LABELS).map(([key, val]) => (
          <div key={key} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <div className="font-black text-gray-900 text-sm">{val.label}</div>
            <div className="text-[#00BFA6] font-bold">{val.pts} pts</div>
            <div className="text-xs text-gray-400">{key === 'PACK_50' ? '1 500' : key === 'PACK_100' ? '2 500' : '3 500'} DA</div>
          </div>
        ))}
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin h-7 w-7 text-[#00BFA6]" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Coins className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Aucune demande ne correspond aux filtres.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <span>#</span><span>Compte</span><span>Pack</span><span>Prix</span><span>Date</span><span>Actions</span>
            </div>
            <div className="divide-y divide-gray-50">
              {filtered.map((p) => {
                const isBoutique = p.source === 'BOUTIQUE'
                const packDef = isBoutique ? BOUTIQUE_PACK_LABELS[p.pack] : POINT_PACK_LABELS[p.pack]
                const isCompany = p.user.userType === 'SOCIETE'
                return (
                  <div key={`${p.source}-${p.id}`} className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-6 py-4 items-center hover:bg-gray-50">
                    <span className="text-xs text-gray-400 font-mono w-10">#{p.id}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-[#00BFA6]/10 flex items-center justify-center shrink-0">
                          <User className="h-4 w-4 text-[#00BFA6]" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 text-sm truncate">{p.user.companyName || `${p.user.firstName} ${p.user.lastName}`}</p>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${isCompany ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                              {isCompany ? 'Société' : 'Particulier'}
                            </span>
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${isBoutique ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'}`}>
                              {isBoutique ? 'Boutique' : 'Points'}
                            </span>
                            <p className="text-xs text-gray-400 truncate">{p.user.email}</p>
                          </div>
                          {p.user.location && (
                            <div className="flex items-center gap-1 mt-0.5 text-[10px] text-gray-400">
                              <MapPin className="h-2.5 w-2.5" /> {p.user.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="px-3 py-1 bg-[#00BFA6]/10 text-[#00BFA6] rounded-full text-xs font-bold whitespace-nowrap">
                        {packDef?.label || p.pack}
                      </span>
                      <div className="text-[10px] text-gray-400 mt-0.5">{p.points} pts</div>
                    </div>
                    <div className="text-center">
                      <span className="font-black text-gray-900">{p.price.toLocaleString()}</span>
                      <span className="text-xs text-gray-400 ml-1">DA{isBoutique ? '/mois' : ''}</span>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleDateString('fr-FR')}</p>
                      {isBoutique && p.validatedAt && p.expiresAt && (
                        <p className="text-[10px] text-green-600 mt-0.5">exp. {new Date(p.expiresAt).toLocaleDateString('fr-FR')}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      {p.status === 'PENDING' ? (
                        <>
                          <button onClick={() => validate(p)} disabled={processing === p.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 disabled:opacity-60 transition-colors">
                            {processing === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                            Valider
                          </button>
                          <button onClick={() => reject(p)} disabled={processing === p.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 disabled:opacity-60 transition-colors">
                            <X className="h-3.5 w-3.5" /> Rejeter
                          </button>
                        </>
                      ) : (
                        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${p.status === 'VALIDATED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {p.status === 'VALIDATED' ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                          {p.status === 'VALIDATED' ? 'Validée' : 'Refusée'}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
      {!loading && filtered.length > 0 && (
        <div className="mt-4 flex items-center gap-6 text-sm text-gray-500">
          <span>{filtered.length} demande{filtered.length > 1 ? 's' : ''}</span>
          {statusFilter === 'ALL' && (
            <>
              <span className="text-amber-600 font-bold">{filtered.filter(p => p.status === 'PENDING').length} en attente</span>
              <span className="text-green-600 font-bold">{filtered.filter(p => p.status === 'VALIDATED').length} validées</span>
              <span className="text-red-500 font-bold">{filtered.filter(p => p.status === 'REJECTED').length} refusées</span>
            </>
          )}
        </div>
      )}
    </div>
  )
}
