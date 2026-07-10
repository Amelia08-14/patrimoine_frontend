"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Coins, Check, X, Clock, Loader2, AlertCircle, RefreshCw, User, Store } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const BOUTIQUE_PACK_LABELS: Record<string, { label: string; pts: number }> = {
  STANDARD:   { label: "Boutique Standard",   pts: 50  },
  AVANCEE:    { label: "Boutique Avancée",     pts: 100 },
  ENTREPRISE: { label: "Boutique Entreprise",  pts: 200 },
}

type BoutiqueSub = {
  id: number
  pack: string
  price: number
  pointsIncluded: number
  status: 'PENDING' | 'VALIDATED' | 'REJECTED'
  createdAt: string
  validatedAt: string | null
  expiresAt: string | null
  user: { id: number; firstName: string; lastName: string; email: string; companyName: string | null }
}

export default function AdminPointsPage() {
  const router = useRouter()
  const [subs, setSubs] = useState<BoutiqueSub[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'VALIDATED' | 'REJECTED'>('PENDING')
  const [processing, setProcessing] = useState<number | null>(null)
  const [toast, setToast] = useState("")
  const [error, setError] = useState("")

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500) }

  const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('admin_token')}` })

  const load = async () => {
    setLoading(true); setError("")
    try {
      const params = filter !== 'ALL' ? `?status=${filter}` : ''
      const res = await axios.get(`${API_URL}/boutique-sub/admin/all${params}`, { headers: getHeaders() })
      setSubs(res.data)
    } catch (e: any) {
      if (e?.response?.status === 401) { router.push('/admin/login'); return }
      setError("Erreur lors du chargement.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filter])

  const validate = async (id: number) => {
    setProcessing(id)
    try {
      await axios.put(`${API_URL}/boutique-sub/admin/${id}/validate`, {}, { headers: getHeaders() })
      showToast("✅ Boutique activée et points crédités !")
      await load()
    } catch (e: any) {
      showToast("❌ " + (e?.response?.data?.message || "Erreur"))
    } finally {
      setProcessing(null)
    }
  }

  const reject = async (id: number) => {
    if (!confirm("Rejeter cette demande d'activation boutique ?")) return
    setProcessing(id)
    try {
      await axios.put(`${API_URL}/boutique-sub/admin/${id}/reject`, {}, { headers: getHeaders() })
      showToast("Demande refusée.")
      await load()
    } catch (e: any) {
      showToast("❌ " + (e?.response?.data?.message || "Erreur"))
    } finally {
      setProcessing(null)
    }
  }

  const pendingCount = subs.filter(s => s.status === 'PENDING').length

  return (
    <div>
      {toast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-medium">{toast}</div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Store className="h-7 w-7 text-[#00BFA6]" /> Boutiques & Points
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Valider les demandes d'activation de boutique — les points sont crédités automatiquement</p>
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
      <div className="flex gap-2 mb-6">
        {(['PENDING', 'ALL', 'VALIDATED', 'REJECTED'] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === s ? 'bg-[#00BFA6] text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#00BFA6] hover:text-[#00BFA6]'}`}>
            {s === 'ALL' ? 'Tous' : s === 'PENDING' ? '⏳ En attente' : s === 'VALIDATED' ? '✓ Activées' : '✗ Refusées'}
          </button>
        ))}
      </div>

      {/* Info packs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {Object.entries(BOUTIQUE_PACK_LABELS).map(([key, val]) => (
          <div key={key} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <div className="font-black text-gray-900 text-sm">{val.label}</div>
            <div className="text-[#00BFA6] font-bold">{val.pts} pts</div>
            <div className="text-xs text-gray-400">{key === 'STANDARD' ? '5 000' : key === 'AVANCEE' ? '10 000' : '15 000'} DA/mois</div>
          </div>
        ))}
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin h-7 w-7 text-[#00BFA6]" /></div>
        ) : subs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Store className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Aucune demande {filter !== 'ALL' ? `"${filter}"` : ''}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <span>#</span><span>Société</span><span>Pack</span><span>Prix</span><span>Date</span><span>Actions</span>
            </div>
            <div className="divide-y divide-gray-50">
              {subs.map(s => {
                const packDef = BOUTIQUE_PACK_LABELS[s.pack]
                return (
                  <div key={s.id} className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-6 py-4 items-center hover:bg-gray-50">
                    <span className="text-xs text-gray-400 font-mono w-10">#{s.id}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-[#00BFA6]/10 flex items-center justify-center shrink-0">
                          <User className="h-4 w-4 text-[#00BFA6]" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 text-sm truncate">{s.user.companyName || `${s.user.firstName} ${s.user.lastName}`}</p>
                          <p className="text-xs text-gray-400 truncate">{s.user.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="px-3 py-1 bg-[#00BFA6]/10 text-[#00BFA6] rounded-full text-xs font-bold whitespace-nowrap">
                        {packDef?.label || s.pack}
                      </span>
                      <div className="text-[10px] text-gray-400 mt-0.5">{s.pointsIncluded} pts inclus</div>
                    </div>
                    <div className="text-center">
                      <span className="font-black text-gray-900">{s.price.toLocaleString()}</span>
                      <span className="text-xs text-gray-400 ml-1">DA/mois</span>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">{new Date(s.createdAt).toLocaleDateString('fr-FR')}</p>
                      {s.validatedAt && s.expiresAt && (
                        <p className="text-[10px] text-green-600 mt-0.5">exp. {new Date(s.expiresAt).toLocaleDateString('fr-FR')}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      {s.status === 'PENDING' ? (
                        <>
                          <button onClick={() => validate(s.id)} disabled={processing === s.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 disabled:opacity-60 transition-colors">
                            {processing === s.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                            Activer
                          </button>
                          <button onClick={() => reject(s.id)} disabled={processing === s.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 disabled:opacity-60 transition-colors">
                            <X className="h-3.5 w-3.5" /> Rejeter
                          </button>
                        </>
                      ) : (
                        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${s.status === 'VALIDATED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {s.status === 'VALIDATED' ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                          {s.status === 'VALIDATED' ? 'Activée' : 'Refusée'}
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
      {!loading && subs.length > 0 && (
        <div className="mt-4 flex items-center gap-6 text-sm text-gray-500">
          <span>{subs.length} demande{subs.length > 1 ? 's' : ''}</span>
          {filter === 'ALL' && (
            <>
              <span className="text-amber-600 font-bold">{subs.filter(s => s.status === 'PENDING').length} en attente</span>
              <span className="text-green-600 font-bold">{subs.filter(s => s.status === 'VALIDATED').length} activées</span>
              <span className="text-red-500 font-bold">{subs.filter(s => s.status === 'REJECTED').length} refusées</span>
            </>
          )}
        </div>
      )}
    </div>
  )
}
