"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
  RefreshCw, Star, MousePointerClick, Phone, FileDown, FileSpreadsheet, LayoutGrid, Building2,
  Hotel, PartyPopper, Warehouse, Home, MapPin, User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { PROPERTY_TYPES, REAL_ESTATE_CATEGORIES } from "@/data/propertyTypes"
import { POLE_LABELS, subCategoriesForPole, type ActivityPole } from "@/data/activityPoles"
import { PeriodFilterBar } from "@/components/admin/PeriodFilterBar"
import { DATE_PRESETS, todayStr, periodLabel } from "@/lib/datePresets"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface FeaturedAnnounce {
  id: number
  reference: string
  title: string | null
  status: string
  type: 'SALE' | 'RENTAL' | 'HOLIDAY_RENTAL'
  nbViews: number
  nbCalls: number
  featuredFrom: string | null
  featuredUntil: string | null
  property: { propertyType: string | null } | null
  location: string | null
  user: { userType: 'PARTICULIER' | 'SOCIETE'; pole: ActivityPole | null; companyName: string | null; firstName: string | null; lastName: string | null } | null
}

function categoryLabelForPropertyType(propertyType: string | null) {
  if (!propertyType) return "Non catégorisé"
  const pType = PROPERTY_TYPES.find((p) => p.id === propertyType)
  const cat = pType ? REAL_ESTATE_CATEGORIES.find((c) => c.id === pType.categoryId) : null
  return cat?.label || "Non catégorisé"
}

export default function AdminKpisPage() {
  const [items, setItems] = useState<FeaturedAnnounce[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState("ALL")

  // Filtre puissant : type de client (+ pôle/sous-catégorie), type de bien, localisation, période
  const [accountType, setAccountType] = useState<'ALL' | 'PARTICULIER' | 'SOCIETE'>('ALL')
  const [pole, setPole] = useState<'ALL' | ActivityPole>('ALL')
  const [subCategory, setSubCategory] = useState<string>('ALL')
  const [transactionType, setTransactionType] = useState<'ALL' | 'LOCATION' | 'VENTE'>('ALL')
  const [wilaya, setWilaya] = useState("")
  const [commune, setCommune] = useState("")
  const [cities, setCities] = useState<any[]>([])
  const [towns, setTowns] = useState<any[]>([])
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [activePreset, setActivePreset] = useState("")
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null)

  const applyPreset = (preset: typeof DATE_PRESETS[number]) => {
    setActivePreset(preset.id); setDateFrom(preset.from()); setDateTo(preset.to())
  }
  const clearPeriod = () => { setActivePreset(""); setDateFrom(""); setDateTo("") }

  useEffect(() => {
    fetch(`${API_URL}/cities`).then((r) => r.json()).then(setCities).catch(() => {})
  }, [])

  useEffect(() => {
    if (!wilaya) { setTowns([]); return }
    fetch(`${API_URL}/cities/${wilaya}/towns`).then((r) => r.json()).then(setTowns).catch(() => {})
  }, [wilaya])

  useEffect(() => { if (accountType !== 'SOCIETE') { setPole('ALL'); setSubCategory('ALL') } }, [accountType])

  const load = useCallback(async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const params = new URLSearchParams()
      if (accountType !== 'ALL') params.set('accountType', accountType)
      if (pole !== 'ALL') params.set('pole', pole)
      if (subCategory !== 'ALL') params.set('subCategory', subCategory)
      if (transactionType !== 'ALL') params.set('transactionType', transactionType)
      if (wilaya) params.set('wilaya', wilaya)
      if (commune) params.set('commune', commune)
      if (dateFrom) params.set('from', dateFrom)
      if (dateTo) params.set('to', dateTo)
      const res = await fetch(`${API_URL}/admin/announces/featured-kpis?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      if (res.ok) setItems(await res.json())
    } finally {
      setIsLoading(false)
    }
  }, [accountType, pole, subCategory, transactionType, wilaya, commune, dateFrom, dateTo])

  useEffect(() => {
    load()
    const interval = setInterval(load, 20000)
    return () => clearInterval(interval)
  }, [load])

  const byCategory = useMemo(() => {
    const map = new Map<string, { count: number; clicks: number; calls: number }>()
    for (const item of items) {
      const label = categoryLabelForPropertyType(item.property?.propertyType || null)
      const entry = map.get(label) || { count: 0, clicks: 0, calls: 0 }
      entry.count += 1
      entry.clicks += item.nbViews
      entry.calls += item.nbCalls
      map.set(label, entry)
    }
    return Array.from(map.entries()).map(([category, stats]) => ({ category, ...stats }))
  }, [items])

  const isActive = (a: FeaturedAnnounce) => a.featuredUntil && new Date(a.featuredUntil) > new Date()

  const filteredItems = categoryFilter === "ALL"
    ? items
    : items.filter((item) => categoryLabelForPropertyType(item.property?.propertyType || null) === categoryFilter)

  const accountLabel = (item: FeaturedAnnounce) => {
    if (!item.user) return '—'
    if (item.user.userType === 'PARTICULIER') return 'Particulier'
    return item.user.companyName || `${item.user.firstName || ''} ${item.user.lastName || ''}`.trim() || 'Professionnel'
  }

  const exportExcel = async () => {
    setExporting('excel')
    try {
      const XLSX = await import('xlsx')
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ['KPI — Annonces Première Page — Patrimoine Immobilier'],
        [`Période (mise en avant) : ${periodLabel(dateFrom, dateTo)}`],
        [`Généré le ${new Date().toLocaleString('fr-FR')}`],
        [],
        ['Catégorie', 'Total mises en avant', 'Clics totaux', 'Appels totaux'],
        ...byCategory.map((c) => [c.category, c.count, c.clicks, c.calls]),
      ]), 'Historique par catégorie')
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ['ID', 'Référence', 'Titre', 'Catégorie', 'Type', 'Annonceur', 'Localisation', 'Clics', 'Appels', 'Début', 'Fin', 'Statut'],
        ...filteredItems.map((item) => [
          item.id, item.reference, item.title || '', categoryLabelForPropertyType(item.property?.propertyType || null),
          item.type === 'SALE' ? 'Vente' : 'Location', accountLabel(item), item.location || '',
          item.nbViews, item.nbCalls,
          item.featuredFrom ? new Date(item.featuredFrom).toLocaleDateString('fr-FR') : '',
          item.featuredUntil ? new Date(item.featuredUntil).toLocaleDateString('fr-FR') : '',
          isActive(item) ? 'Active' : 'Expirée',
        ]),
      ]), 'Suivi par annonce')
      XLSX.writeFile(wb, `kpi-premiere-page-${todayStr()}.xlsx`)
    } finally { setExporting(null) }
  }

  const exportPDF = async () => {
    setExporting('pdf')
    try {
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')])
      const doc = new jsPDF({ orientation: 'landscape' })
      doc.setFontSize(16); doc.setTextColor(0, 59, 74)
      doc.text('KPI — Annonces Première Page — Patrimoine Immobilier', 14, 18)
      doc.setFontSize(10); doc.setTextColor(120)
      doc.text(`Période (mise en avant) : ${periodLabel(dateFrom, dateTo)}`, 14, 25)
      doc.text(`Généré le ${new Date().toLocaleString('fr-FR')}`, 14, 30)
      autoTable(doc, {
        startY: 36,
        head: [['Catégorie', 'Total mises en avant', 'Clics totaux', 'Appels totaux']],
        body: byCategory.map((c) => [c.category, String(c.count), String(c.clicks), String(c.calls)]),
        headStyles: { fillColor: [0, 191, 166] },
        styles: { fontSize: 9 },
      })
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [['ID/Titre', 'Catégorie', 'Type', 'Annonceur', 'Localisation', 'Clics', 'Appels', 'Statut']],
        body: filteredItems.map((item) => [
          item.title || `#${item.id}`, categoryLabelForPropertyType(item.property?.propertyType || null),
          item.type === 'SALE' ? 'Vente' : 'Location', accountLabel(item), item.location || '—',
          String(item.nbViews), String(item.nbCalls), isActive(item) ? 'Active' : 'Expirée',
        ]),
        headStyles: { fillColor: [0, 59, 74] },
        styles: { fontSize: 8 },
      })
      doc.save(`kpi-premiere-page-${todayStr()}.pdf`)
    } finally { setExporting(null) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#003B4A] font-brand">KPI — Annonces "Première Page"</h1>
          <p className="text-gray-500">Historique et performances des annonces mises en avant.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportExcel} disabled={exporting !== null} title="Exporter en Excel">
            <FileSpreadsheet className="h-4 w-4 mr-1.5" /> {exporting === 'excel' ? 'Export...' : 'Excel'}
          </Button>
          <Button variant="outline" size="sm" onClick={exportPDF} disabled={exporting !== null} title="Exporter en PDF">
            <FileDown className="h-4 w-4 mr-1.5" /> {exporting === 'pdf' ? 'Export...' : 'PDF'}
          </Button>
          <Button variant="outline" size="sm" onClick={load} title="Actualiser">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <PeriodFilterBar
        dateFrom={dateFrom} dateTo={dateTo} activePreset={activePreset}
        onApplyPreset={applyPreset} onClear={clearPeriod}
        onChangeFrom={(v) => { setDateFrom(v); setActivePreset("") }}
        onChangeTo={(v) => { setDateTo(v); setActivePreset("") }}
      />

      {/* Filtre puissant : type de client, activité, type de bien, localisation */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs font-bold text-gray-400 uppercase mr-1">Type de client</span>
          {(['ALL', 'PARTICULIER', 'SOCIETE'] as const).map((v) => (
            <button key={v} onClick={() => setAccountType(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${accountType === v ? 'bg-[#003B4A] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#003B4A]'}`}>
              {v === 'ALL' ? 'Tous' : v === 'PARTICULIER' ? 'Particulier' : 'Professionnel'}
            </button>
          ))}
        </div>

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
          <span className="text-xs font-bold text-gray-400 uppercase mr-1">Type de bien</span>
          {(['ALL', 'LOCATION', 'VENTE'] as const).map((v) => (
            <button key={v} onClick={() => setTransactionType(v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${transactionType === v ? 'bg-[#00BFA6] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#00BFA6]'}`}>
              {v === 'LOCATION' && <Home className="h-3 w-3" />}
              {v === 'VENTE' && <Building2 className="h-3 w-3" />}
              {v === 'ALL' ? 'Tous' : v === 'LOCATION' ? 'Location' : 'Vente'}
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

      {/* Tableau historique par catégorie */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 font-bold text-sm text-gray-700">Historique par catégorie</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-900">Catégorie</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Total Annonces Mises en Avant</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Clics Totaux</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Appels Totaux</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-500">Chargement...</td></tr>
              ) : byCategory.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-500">Aucune annonce mise en avant pour ce filtre.</td></tr>
              ) : (
                byCategory.map((c) => (
                  <tr key={c.category}>
                    <td className="px-4 py-3 font-medium text-gray-900">{c.category}</td>
                    <td className="px-4 py-3">{c.count}</td>
                    <td className="px-4 py-3">{c.clicks.toLocaleString()}</td>
                    <td className="px-4 py-3">{c.calls.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suivi des performances par annonce */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
          <span className="font-bold text-sm text-gray-700">Suivi des performances par annonce</span>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="text-xs font-medium border border-gray-200 rounded-lg px-2 py-1.5 bg-white outline-none">
            <option value="ALL">Toutes catégories</option>
            {byCategory.map((c) => <option key={c.category} value={c.category}>{c.category}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-900">ID / Titre</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Catégorie</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Annonceur</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Clics</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Appels</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Période de mise en avant</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-500">Chargement...</td></tr>
              ) : filteredItems.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-500">Aucune annonce mise en avant pour ce filtre.</td></tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{item.title || `Annonce #${item.id}`}</div>
                      <div className="text-xs text-gray-500">ID #{item.id} — Réf. {item.reference}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {categoryLabelForPropertyType(item.property?.propertyType || null)}
                      <div className="text-[10px] text-gray-400">{item.type === 'SALE' ? 'Vente' : 'Location'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-gray-700 text-xs">
                        <User className="h-3 w-3 text-gray-400" /> {accountLabel(item)}
                      </div>
                      {item.location && (
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                          <MapPin className="h-2.5 w-2.5" /> {item.location}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-gray-700"><MousePointerClick className="h-3.5 w-3.5 text-gray-400" /> {item.nbViews.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-gray-700"><Phone className="h-3.5 w-3.5 text-gray-400" /> {item.nbCalls.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                      {item.featuredFrom ? new Date(item.featuredFrom).toLocaleDateString() : '—'}
                      {' → '}
                      {item.featuredUntil ? new Date(item.featuredUntil).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {isActive(item) ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Expirée</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
