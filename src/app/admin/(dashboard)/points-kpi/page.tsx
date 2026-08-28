"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import {
  BarChart3, RefreshCw, Loader2, ListChecks, Wallet, Sparkles, TrendingUp, Home, Building2, LayoutGrid, Hotel,
  PartyPopper, Warehouse, User, FileDown, FileSpreadsheet, Users, Repeat,
} from "lucide-react"
import { POLE_LABELS, subCategoriesForPole, type ActivityPole } from "@/data/activityPoles"
import { PeriodFilterBar } from "@/components/admin/PeriodFilterBar"
import { DATE_PRESETS, todayStr, periodLabel } from "@/lib/datePresets"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

type GeoAgg = { id: number; name: string; count: number; points: number; revenue?: number }
type ClientAgg = { id: number; name: string; type: 'PARTICULIER' | 'SOCIETE'; count: number; points: number; revenue?: number }
type ActivityAgg = { id: string; count: number; points: number; revenue?: number }
type PointsKpi = {
  purchases: { count: number; points: number; revenue: number; byWilaya: GeoAgg[]; byCommune: GeoAgg[]; byClient: ClientAgg[]; byActivity: ActivityAgg[] }
  usage: {
    count: number
    points: number
    byType: Record<'LOCATION' | 'VENTE' | 'NON_CLASSE', { count: number; points: number }>
    byWilaya: GeoAgg[]
    byCommune: GeoAgg[]
    byClient: ClientAgg[]
    byActivity: ActivityAgg[]
  }
}

const ACTIVITY_ID_LABELS: Record<string, string> = {
  PARTICULIER: 'Particuliers',
  IMMOBILIER: POLE_LABELS.IMMOBILIER,
  HOTELLERIE: POLE_LABELS.HOTELLERIE,
  EVENEMENTIEL: POLE_LABELS.EVENEMENTIEL,
  ENTREPOSAGE: POLE_LABELS.ENTREPOSAGE,
  NON_CLASSE: 'Professionnel non classé',
}

export default function AdminPointsKpiPage() {
  const router = useRouter()
  const [kpi, setKpi] = useState<PointsKpi | null>(null)
  const [loading, setLoading] = useState(true)
  const [accountType, setAccountType] = useState<'ALL' | 'PARTICULIER' | 'SOCIETE'>('ALL')
  const [pole, setPole] = useState<'ALL' | ActivityPole>('ALL')
  const [subCategory, setSubCategory] = useState<string>('ALL')
  const [source, setSource] = useState<'ALL' | 'POINTS' | 'BOUTIQUE'>('ALL')
  const [transactionType, setTransactionType] = useState<'ALL' | 'LOCATION' | 'VENTE'>('ALL')
  const [wilaya, setWilaya] = useState("")
  const [commune, setCommune] = useState("")
  const [cities, setCities] = useState<any[]>([])
  const [towns, setTowns] = useState<any[]>([])
  const [geoView, setGeoView] = useState<'wilaya' | 'commune'>('wilaya')
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [activePreset, setActivePreset] = useState("")
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null)

  const applyPreset = (preset: typeof DATE_PRESETS[number]) => {
    setActivePreset(preset.id); setDateFrom(preset.from()); setDateTo(preset.to())
  }
  const clearPeriod = () => { setActivePreset(""); setDateFrom(""); setDateTo("") }

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
      if (pole !== 'ALL') params.set('pole', pole)
      if (subCategory !== 'ALL') params.set('subCategory', subCategory)
      if (source !== 'ALL') params.set('source', source)
      if (transactionType !== 'ALL') params.set('transactionType', transactionType)
      if (wilaya) params.set('wilaya', wilaya)
      if (commune) params.set('commune', commune)
      if (dateFrom) params.set('from', dateFrom)
      if (dateTo) params.set('to', dateTo)
      const res = await axios.get(`${API_URL}/admin/points-kpi?${params.toString()}`, { headers: getHeaders() })
      setKpi(res.data)
    } catch (e: any) {
      if (e?.response?.status === 401) { router.push('/admin/login'); return }
    } finally {
      setLoading(false)
    }
  }, [accountType, pole, subCategory, source, transactionType, wilaya, commune, dateFrom, dateTo, router])

  useEffect(() => { load() }, [load])

  // Le filtre par pôle/sous-catégorie ne s'applique qu'aux comptes professionnels
  useEffect(() => { if (accountType !== 'SOCIETE') { setPole('ALL'); setSubCategory('ALL') } }, [accountType])

  const usageTotal = kpi?.usage.points || 0
  const locationPct = usageTotal ? Math.round(((kpi?.usage.byType.LOCATION.points || 0) / usageTotal) * 100) : 0
  const ventePct = usageTotal ? Math.round(((kpi?.usage.byType.VENTE.points || 0) / usageTotal) * 100) : 0

  const purchGeo: GeoAgg[] = (geoView === 'wilaya' ? kpi?.purchases.byWilaya : kpi?.purchases.byCommune) || []
  const usageGeo: GeoAgg[] = (geoView === 'wilaya' ? kpi?.usage.byWilaya : kpi?.usage.byCommune) || []

  const exportExcel = async () => {
    if (!kpi) return
    setExporting('excel')
    try {
      const XLSX = await import('xlsx')
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ['KPI Points & Boutiques — Patrimoine Immobilier'],
        [`Période : ${periodLabel(dateFrom, dateTo)}`],
        [`Généré le ${new Date().toLocaleString('fr-FR')}`],
        [],
        ['Indicateur', 'Valeur'],
        ['Achats validés', kpi.purchases.count],
        ['Points achetés', kpi.purchases.points],
        [`Chiffre d'affaires (DA)`, kpi.purchases.revenue],
        ['Points dépensés', kpi.usage.points],
        ['Mises en avant', kpi.usage.count],
        ['Dont Location (pts)', kpi.usage.byType.LOCATION.points],
        ['Dont Vente (pts)', kpi.usage.byType.VENTE.points],
      ]), 'Résumé')
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ['Compte', 'Type', 'Fréquence (achats)', 'Points achetés', 'Montant (DA)'],
        ...kpi.purchases.byClient.map((c) => [c.name, c.type === 'SOCIETE' ? 'Professionnel' : 'Particulier', c.count, c.points, c.revenue ?? 0]),
      ]), 'Achats par client')
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ['Compte', 'Type', 'Fréquence (dépenses)', 'Points dépensés'],
        ...kpi.usage.byClient.map((c) => [c.name, c.type === 'SOCIETE' ? 'Professionnel' : 'Particulier', c.count, c.points]),
      ]), 'Dépenses par client')
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ['Type de professionnel', 'Fréquence (dépenses)', 'Points dépensés'],
        ...kpi.usage.byActivity.map((a) => [ACTIVITY_ID_LABELS[a.id] || a.id, a.count, a.points]),
      ]), 'Dépenses par activité')
      XLSX.writeFile(wb, `kpi-points-boutiques-${todayStr()}.xlsx`)
    } finally { setExporting(null) }
  }

  const exportPDF = async () => {
    if (!kpi) return
    setExporting('pdf')
    try {
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')])
      const doc = new jsPDF()
      doc.setFontSize(16); doc.setTextColor(0, 59, 74)
      doc.text('KPI Points & Boutiques — Patrimoine Immobilier', 14, 18)
      doc.setFontSize(10); doc.setTextColor(120)
      doc.text(`Période : ${periodLabel(dateFrom, dateTo)}`, 14, 25)
      doc.text(`Généré le ${new Date().toLocaleString('fr-FR')}`, 14, 30)
      autoTable(doc, {
        startY: 36,
        head: [['Indicateur', 'Valeur']],
        body: [
          ['Achats validés', String(kpi.purchases.count)],
          ['Points achetés', String(kpi.purchases.points)],
          [`Chiffre d'affaires`, `${kpi.purchases.revenue.toLocaleString()} DA`],
          ['Points dépensés', String(kpi.usage.points)],
          ['Mises en avant', String(kpi.usage.count)],
        ],
        headStyles: { fillColor: [0, 191, 166] },
        styles: { fontSize: 10 },
      })
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [['Dépenses par client', 'Type', 'Fréquence', 'Points']],
        body: kpi.usage.byClient.map((c) => [c.name, c.type === 'SOCIETE' ? 'Pro' : 'Particulier', String(c.count), String(c.points)]),
        headStyles: { fillColor: [0, 59, 74] },
        styles: { fontSize: 9 },
      })
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [['Dépenses par type de professionnel', 'Fréquence', 'Points']],
        body: kpi.usage.byActivity.map((a) => [ACTIVITY_ID_LABELS[a.id] || a.id, String(a.count), String(a.points)]),
        headStyles: { fillColor: [0, 59, 74] },
        styles: { fontSize: 9 },
      })
      doc.save(`kpi-points-boutiques-${todayStr()}.pdf`)
    } finally { setExporting(null) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#003B4A] font-brand flex items-center gap-3">
            <BarChart3 className="h-7 w-7 text-[#00BFA6]" /> KPI Points & Boutiques
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Achats de points/packs boutique et dépenses (mises en avant), pour cibler les actions commerciales.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportExcel} disabled={!kpi || exporting !== null} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-600 disabled:opacity-60">
            <FileSpreadsheet className="h-4 w-4" /> {exporting === 'excel' ? 'Export...' : 'Excel'}
          </button>
          <button onClick={exportPDF} disabled={!kpi || exporting !== null} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-600 disabled:opacity-60">
            <FileDown className="h-4 w-4" /> {exporting === 'pdf' ? 'Export...' : 'PDF'}
          </button>
          <button onClick={load} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
            <RefreshCw className={`h-4 w-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="mb-6">
        <PeriodFilterBar
          dateFrom={dateFrom} dateTo={dateTo} activePreset={activePreset}
          onApplyPreset={applyPreset} onClear={clearPeriod}
          onChangeFrom={(v) => { setDateFrom(v); setActivePreset("") }}
          onChangeTo={(v) => { setDateTo(v); setActivePreset("") }}
        />
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

        {/* Activité des professionnels — affine "Professionnel" par pôle puis sous-catégorie */}
        {accountType === 'SOCIETE' && (
          <div className="pl-1 space-y-2">
            <div className="flex gap-2 flex-wrap items-center">
              {([
                { id: 'ALL', label: 'Toutes activités', icon: LayoutGrid },
                { id: 'IMMOBILIER', label: POLE_LABELS.IMMOBILIER, icon: Building2 },
                { id: 'HOTELLERIE', label: POLE_LABELS.HOTELLERIE, icon: Hotel },
                { id: 'EVENEMENTIEL', label: POLE_LABELS.EVENEMENTIEL, icon: PartyPopper },
                { id: 'ENTREPOSAGE', label: POLE_LABELS.ENTREPOSAGE, icon: Warehouse },
              ] as const).map((t) => (
                <button key={t.id} onClick={() => { setPole(t.id as any); setSubCategory('ALL') }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${pole === t.id ? 'bg-[#003B4A] text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-[#003B4A]'}`}>
                  <t.icon className="h-3.5 w-3.5" /> {t.label}
                </button>
              ))}
            </div>
            {pole !== 'ALL' && (
              <div className="flex gap-2 flex-wrap items-center pl-1">
                <button onClick={() => setSubCategory('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${subCategory === 'ALL' ? 'bg-[#00BFA6] text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-[#00BFA6]'}`}>
                  Toutes sous-catégories
                </button>
                {subCategoriesForPole(pole).map((sub) => (
                  <button key={sub.id} onClick={() => setSubCategory(sub.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${subCategory === sub.id ? 'bg-[#00BFA6] text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-[#00BFA6]'}`}>
                    {sub.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

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

          {/* Dépense par client — pour savoir qui dépense et à quelle fréquence */}
          <div className="flex items-center gap-2 mb-3 mt-8">
            <Users className="h-4 w-4 text-[#003B4A]" />
            <h2 className="text-sm font-bold text-[#003B4A]">Dépense par client — comment et à quelle fréquence</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ClientRankPanel title="Meilleurs clients — Achats" items={kpi?.purchases.byClient || []} accent="#00BFA6" unit="pts" freqLabel="achat" showRevenue />
            <ClientRankPanel title="Meilleurs clients — Dépenses" items={kpi?.usage.byClient || []} accent="#003B4A" unit="pts" freqLabel="mise en avant" />
          </div>

          {/* Dépense par type de professionnel */}
          <div className="flex items-center gap-2 mb-3 mt-8">
            <Building2 className="h-4 w-4 text-[#003B4A]" />
            <h2 className="text-sm font-bold text-[#003B4A]">Par type de professionnel</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ActivityRankPanel title="Achats par type de professionnel" items={kpi?.purchases.byActivity || []} accent="#00BFA6" unit="pts" freqLabel="achat" showRevenue />
            <ActivityRankPanel title="Dépenses par type de professionnel" items={kpi?.usage.byActivity || []} accent="#003B4A" unit="pts" freqLabel="mise en avant" />
          </div>
        </>
      )}
    </div>
  )
}

function ClientRankPanel({ title, items, accent, unit, freqLabel, showRevenue }: { title: string; items: ClientAgg[]; accent: string; unit: string; freqLabel: string; showRevenue?: boolean }) {
  const max = items.length ? Math.max(...items.map((i) => i.points)) : 0
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-xs font-bold text-gray-500 uppercase mb-4">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">Aucune donnée pour ce filtre.</p>
      ) : (
        <div className="space-y-3">
          {items.slice(0, 10).map((item, i) => (
            <div key={item.id}>
              <div className="flex items-center justify-between text-xs mb-1 gap-2">
                <span className="font-bold text-gray-700 flex items-center gap-1.5 min-w-0">
                  <span className="text-gray-300 font-mono w-4 shrink-0">{i + 1}.</span>
                  <span className="truncate">{item.name}</span>
                  <span className={`shrink-0 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${item.type === 'SOCIETE' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                    {item.type === 'SOCIETE' ? 'Pro' : 'Particulier'}
                  </span>
                </span>
                <span className="text-gray-500 shrink-0 text-right">
                  <span className="flex items-center gap-1 justify-end text-amber-600 font-bold"><Repeat className="h-3 w-3" /> {item.count} {freqLabel}{item.count > 1 ? 's' : ''}</span>
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

function ActivityRankPanel({ title, items, accent, unit, freqLabel, showRevenue }: { title: string; items: ActivityAgg[]; accent: string; unit: string; freqLabel: string; showRevenue?: boolean }) {
  const max = items.length ? Math.max(...items.map((i) => i.points)) : 0
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-xs font-bold text-gray-500 uppercase mb-4">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">Aucune donnée pour ce filtre.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id}>
              <div className="flex items-center justify-between text-xs mb-1 gap-2">
                <span className="font-bold text-gray-700 flex items-center gap-1.5 min-w-0">
                  {item.id === 'PARTICULIER' ? <User className="h-3.5 w-3.5 text-gray-400 shrink-0" /> : <Building2 className="h-3.5 w-3.5 text-gray-400 shrink-0" />}
                  <span className="truncate">{ACTIVITY_ID_LABELS[item.id] || item.id}</span>
                </span>
                <span className="text-gray-500 shrink-0 text-right">
                  <span className="flex items-center gap-1 justify-end text-amber-600 font-bold"><Repeat className="h-3 w-3" /> {item.count} {freqLabel}{item.count > 1 ? 's' : ''}</span>
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
