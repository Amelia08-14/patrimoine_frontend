"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { BarChart3, RefreshCw, Loader2, ListChecks, Wallet, Sparkles, TrendingUp, Home, Building2 } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

type GeoAgg = { id: number; name: string; count: number; points: number; revenue?: number }
type PointsKpi = {
  purchases: { count: number; points: number; revenue: number; byWilaya: GeoAgg[]; byCommune: GeoAgg[] }
  usage: {
    count: number
    points: number
    byType: Record<'LOCATION' | 'VENTE' | 'NON_CLASSE', { count: number; points: number }>
    byWilaya: GeoAgg[]
    byCommune: GeoAgg[]
  }
}

export default function AdminPointsKpiPage() {
  const router = useRouter()
  const [kpi, setKpi] = useState<PointsKpi | null>(null)
  const [loading, setLoading] = useState(true)
  const [accountType, setAccountType] = useState<'ALL' | 'PARTICULIER' | 'SOCIETE'>('ALL')
  const [source, setSource] = useState<'ALL' | 'POINTS' | 'BOUTIQUE'>('ALL')
  const [transactionType, setTransactionType] = useState<'ALL' | 'LOCATION' | 'VENTE'>('ALL')
  const [wilaya, setWilaya] = useState("")
  const [commune, setCommune] = useState("")
  const [cities, setCities] = useState<any[]>([])
  const [towns, setTowns] = useState<any[]>([])
  const [geoView, setGeoView] = useState<'wilaya' | 'commune'>('wilaya')

  const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('admin_token')}` })

  useEffect(() => {
    fetch(`${API_URL}/cities`).then((r) => r.json()).then(setCities).catch(() => {})
  }, [])

  useEffect(() => {
    if (!wilaya) { setTowns([]); return }
    fetch(`${API_URL}/cities/${wilaya}/towns`).then((r) => r.json()).then(setTowns).catch(() => {})
  }, [wilaya])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (accountType !== 'ALL') params.set('accountType', accountType)
      if (source !== 'ALL') params.set('source', source)
      if (transactionType !== 'ALL') params.set('transactionType', transactionType)
      if (wilaya) params.set('wilaya', wilaya)
      if (commune) params.set('commune', commune)
      const res = await axios.get(`${API_URL}/admin/points-kpi?${params.toString()}`, { headers: getHeaders() })
      setKpi(res.data)
    } catch (e: any) {
      if (e?.response?.status === 401) { router.push('/admin/login'); return }
    } finally {
      setLoading(false)
    }
  }, [accountType, source, transactionType, wilaya, commune, router])

  useEffect(() => { load() }, [load])

  const usageTotal = kpi?.usage.points || 0
  const locationPct = usageTotal ? Math.round(((kpi?.usage.byType.LOCATION.points || 0) / usageTotal) * 100) : 0
  const ventePct = usageTotal ? Math.round(((kpi?.usage.byType.VENTE.points || 0) / usageTotal) * 100) : 0

  const purchGeo: GeoAgg[] = (geoView === 'wilaya' ? kpi?.purchases.byWilaya : kpi?.purchases.byCommune) || []
  const usageGeo: GeoAgg[] = (geoView === 'wilaya' ? kpi?.usage.byWilaya : kpi?.usage.byCommune) || []

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#003B4A] font-brand flex items-center gap-3">
            <BarChart3 className="h-7 w-7 text-[#00BFA6]" /> KPI Points & Boutiques
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Achats de points/packs boutique et dépenses (mises en avant), pour cibler les actions commerciales.</p>
        </div>
        <button onClick={load} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
          <RefreshCw className={`h-4 w-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filtres */}
      <div className="space-y-3 mb-6">
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs font-bold text-gray-400 uppercase mr-1">Type de client</span>
          {(['ALL', 'PARTICULIER', 'SOCIETE'] as const).map((v) => (
            <button key={v} onClick={() => setAccountType(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${accountType === v ? 'bg-[#003B4A] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#003B4A]'}`}>
              {v === 'ALL' ? 'Tous' : v === 'PARTICULIER' ? 'Particulier' : 'Professionnel'}
            </button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs font-bold text-gray-400 uppercase mr-1">Type de bien (dépenses)</span>
          {(['ALL', 'LOCATION', 'VENTE'] as const).map((v) => (
            <button key={v} onClick={() => setTransactionType(v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${transactionType === v ? 'bg-[#00BFA6] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#00BFA6]'}`}>
              {v === 'LOCATION' && <Home className="h-3 w-3" />}
              {v === 'VENTE' && <Building2 className="h-3 w-3" />}
              {v === 'ALL' ? 'Tous' : v === 'LOCATION' ? 'Location' : 'Vente'}
            </button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs font-bold text-gray-400 uppercase mr-1">Type d'offre (achats)</span>
          {(['ALL', 'POINTS', 'BOUTIQUE'] as const).map((v) => (
            <button key={v} onClick={() => setSource(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${source === v ? 'bg-amber-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-amber-500'}`}>
              {v === 'ALL' ? 'Tous' : v === 'POINTS' ? 'Pack points' : 'Pack boutique'}
            </button>
          ))}

          <select value={wilaya} onChange={(e) => { setWilaya(e.target.value); setCommune("") }} className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium bg-white outline-none ml-2">
            <option value="">Toutes wilayas</option>
            {cities.map((c: any) => <option key={c.id} value={c.id}>{c.nameFr}</option>)}
          </select>
          {wilaya && (
            <select value={commune} onChange={(e) => setCommune(e.target.value)} className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium bg-white outline-none">
              <option value="">Toutes communes</option>
              {towns.map((t: any) => <option key={t.id} value={t.id}>{t.nameFr}</option>)}
            </select>
          )}
        </div>
      </div>

      {loading && !kpi ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin h-7 w-7 text-[#00BFA6]" /></div>
      ) : (
        <>
          {/* Cartes de synthèse */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase mb-2"><ListChecks className="h-4 w-4" /> Achats validés</div>
              <p className="text-2xl font-black text-[#003B4A]">{kpi?.purchases.count ?? 0}</p>
              <p className="text-xs text-gray-400 mt-1">{(kpi?.purchases.points ?? 0).toLocaleString()} pts achetés</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase mb-2"><Wallet className="h-4 w-4" /> Chiffre d'affaires</div>
              <p className="text-2xl font-black text-[#003B4A]">{(kpi?.purchases.revenue ?? 0).toLocaleString()} <span className="text-sm font-bold text-gray-400">DA</span></p>
              <p className="text-xs text-gray-400 mt-1">achats de points &amp; boutique</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase mb-2"><Sparkles className="h-4 w-4" /> Points dépensés</div>
              <p className="text-2xl font-black text-[#003B4A]">{usageTotal.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">{kpi?.usage.count ?? 0} mises en avant</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase mb-2"><TrendingUp className="h-4 w-4" /> Location vs Vente</div>
              {usageTotal ? (
                <>
                  <div className="flex h-2.5 rounded-full overflow-hidden bg-gray-100 mt-1">
                    <div className="bg-[#00BFA6]" style={{ width: `${locationPct}%` }} title={`Location ${locationPct}%`} />
                    <div className="bg-[#003B4A]" style={{ width: `${ventePct}%` }} title={`Vente ${ventePct}%`} />
                  </div>
                  <div className="flex justify-between text-xs mt-2 font-bold">
                    <span className="text-[#00BFA6] flex items-center gap-1"><Home className="h-3 w-3" /> {locationPct}%</span>
                    <span className="text-[#003B4A] flex items-center gap-1"><Building2 className="h-3 w-3" /> {ventePct}%</span>
                  </div>
                </>
              ) : (
                <p className="text-xs text-gray-400 mt-1">Aucune dépense de points sur la période/le filtre choisi.</p>
              )}
            </div>
          </div>

          {/* Classement géographique */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[#003B4A]">Meilleures {geoView === 'wilaya' ? 'wilayas' : 'communes'}</h2>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              {(['wilaya', 'commune'] as const).map((v) => (
                <button key={v} onClick={() => setGeoView(v)}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${geoView === v ? 'bg-white text-[#003B4A] shadow-sm' : 'text-gray-500'}`}>
                  {v === 'wilaya' ? 'Par wilaya' : 'Par commune'}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RankPanel title="Achats de points/boutique" items={purchGeo} accent="#00BFA6" unit="pts" showRevenue />
            <RankPanel title="Points dépensés (mises en avant)" items={usageGeo} accent="#003B4A" unit="pts" />
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Classement basé sur la localisation des comptes (wilaya du profil). Les comptes sans localisation renseignée n'apparaissent pas dans ce classement.
          </p>
        </>
      )}
    </div>
  )
}

function RankPanel({ title, items, accent, unit, showRevenue }: { title: string; items: GeoAgg[]; accent: string; unit: string; showRevenue?: boolean }) {
  const max = items.length ? Math.max(...items.map((i) => i.points)) : 0
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-xs font-bold text-gray-500 uppercase mb-4">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">Aucune donnée localisée pour ce filtre.</p>
      ) : (
        <div className="space-y-3">
          {items.slice(0, 10).map((item, i) => (
            <div key={item.id}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-gray-700 flex items-center gap-1.5">
                  <span className="text-gray-300 font-mono w-4">{i + 1}.</span> {item.name}
                </span>
                <span className="text-gray-500">
                  <span className="font-black text-gray-900">{item.points.toLocaleString()}</span> {unit}
                  {showRevenue && item.revenue !== undefined && <span className="text-gray-400"> · {item.revenue.toLocaleString()} DA</span>}
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${max ? (item.points / max) * 100 : 0}%`, backgroundColor: accent }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
