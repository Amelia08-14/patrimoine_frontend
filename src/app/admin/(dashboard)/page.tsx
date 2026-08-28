"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  FileText, AlertCircle, User, Briefcase, Building2, Hotel, PartyPopper, Warehouse, RefreshCw,
  FileDown, FileSpreadsheet, Calendar,
} from "lucide-react"
import { format, subDays, startOfMonth } from "date-fns"
import { subCategoriesForPole, type ActivityPole } from "@/data/activityPoles"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const ACTIVITY_LABELS: Record<string, { label: string; icon: typeof Building2; pole?: ActivityPole }> = {
  IMMOBILIER: { label: "Activité immobilière", icon: Building2, pole: "IMMOBILIER" },
  HOTELLERIE: { label: "Activité touristique et hébergement", icon: Hotel, pole: "HOTELLERIE" },
  EVENEMENTIEL: { label: "Activité évènementiel", icon: PartyPopper, pole: "EVENEMENTIEL" },
  ENTREPOSAGE: { label: "Activité de stockage", icon: Warehouse, pole: "ENTREPOSAGE" },
  NON_CLASSE: { label: "Non classé", icon: Briefcase },
}

interface DashboardStats {
  pendingAnnounces: number
  totalOnlineAnnounces: number
  totalParticuliers: number
  totalProfessionnels: number
  professionnelsByActivity: Record<string, number>
  professionnelsBySubCategory: Record<string, number>
}

const todayStr = () => format(new Date(), 'yyyy-MM-dd')

const DATE_PRESETS: { id: string; label: string; from: () => string; to: () => string }[] = [
  { id: 'today', label: "Aujourd'hui", from: todayStr, to: todayStr },
  { id: '7d', label: '7 jours', from: () => format(subDays(new Date(), 6), 'yyyy-MM-dd'), to: todayStr },
  { id: '30d', label: '30 jours', from: () => format(subDays(new Date(), 29), 'yyyy-MM-dd'), to: todayStr },
  { id: 'month', label: 'Ce mois-ci', from: () => format(startOfMonth(new Date()), 'yyyy-MM-dd'), to: todayStr },
]

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [activePreset, setActivePreset] = useState<string>("")
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null)

  const loadStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const params = new URLSearchParams()
      if (dateFrom) params.set('from', dateFrom)
      if (dateTo) params.set('to', dateTo)
      const response = await fetch(`${API_URL}/admin/dashboard-stats?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      if (response.ok) {
        setStats(await response.json())
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats", error)
    } finally {
      setIsLoading(false)
    }
  }, [dateFrom, dateTo])

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
      return
    }
    loadStats()
    const interval = setInterval(loadStats, 20000)
    return () => clearInterval(interval)
  }, [router, loadStats])

  const fmt = (n: number | undefined) => (isLoading || n === undefined ? "--" : n.toLocaleString())

  const applyPreset = (preset: typeof DATE_PRESETS[number]) => {
    setActivePreset(preset.id)
    setDateFrom(preset.from())
    setDateTo(preset.to())
  }

  const clearPeriod = () => {
    setActivePreset("")
    setDateFrom("")
    setDateTo("")
  }

  const periodLabel = useMemo(() => {
    if (!dateFrom && !dateTo) return "Toutes les données"
    return `Du ${dateFrom || '…'} au ${dateTo || '…'}`
  }, [dateFrom, dateTo])

  // Lignes "Pôle" + "Sous-catégorie" partagées par les deux exports
  const activityRows = useMemo(() => {
    if (!stats) return []
    return Object.entries(ACTIVITY_LABELS)
      .filter(([id]) => id !== 'NON_CLASSE' || (stats.professionnelsByActivity?.NON_CLASSE ?? 0) > 0)
      .flatMap(([id, def]) => [
        { label: def.label, value: stats.professionnelsByActivity?.[id] ?? 0, isPole: true },
        ...(def.pole
          ? subCategoriesForPole(def.pole).map((sub) => ({
              label: sub.label,
              value: stats.professionnelsBySubCategory?.[sub.id] ?? 0,
              isPole: false,
            }))
          : []),
      ])
  }, [stats])

  const exportExcel = async () => {
    if (!stats) return
    setExporting('excel')
    try {
      const XLSX = await import('xlsx')
      const summarySheet = XLSX.utils.aoa_to_sheet([
        ['Tableau de bord — Patrimoine Immobilier'],
        [`Période : ${periodLabel}`],
        [`Généré le ${new Date().toLocaleString('fr-FR')}`],
        [],
        ['Indicateur', 'Valeur'],
        ['Annonces en attente', stats.pendingAnnounces],
        ['Total annonces en ligne', stats.totalOnlineAnnounces],
        ['Particuliers inscrits', stats.totalParticuliers],
        ['Professionnels inscrits', stats.totalProfessionnels],
      ])
      const activitySheet = XLSX.utils.aoa_to_sheet([
        ['Type de professionnel', 'Nombre'],
        ...activityRows.map((r) => [r.isPole ? r.label : `   ${r.label}`, r.value]),
      ])
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, summarySheet, 'Résumé')
      XLSX.utils.book_append_sheet(wb, activitySheet, 'Type de professionnel')
      XLSX.writeFile(wb, `dashboard-patrimoine-${todayStr()}.xlsx`)
    } finally {
      setExporting(null)
    }
  }

  const exportPDF = async () => {
    if (!stats) return
    setExporting('pdf')
    try {
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
      ])
      const doc = new jsPDF()

      doc.setFontSize(16)
      doc.setTextColor(0, 59, 74)
      doc.text('Tableau de bord — Patrimoine Immobilier', 14, 18)
      doc.setFontSize(10)
      doc.setTextColor(120)
      doc.text(`Période : ${periodLabel}`, 14, 25)
      doc.text(`Généré le ${new Date().toLocaleString('fr-FR')}`, 14, 30)

      autoTable(doc, {
        startY: 36,
        head: [['Indicateur', 'Valeur']],
        body: [
          ['Annonces en attente', String(stats.pendingAnnounces)],
          ['Total annonces en ligne', String(stats.totalOnlineAnnounces)],
          ['Particuliers inscrits', String(stats.totalParticuliers)],
          ['Professionnels inscrits', String(stats.totalProfessionnels)],
        ],
        headStyles: { fillColor: [0, 191, 166] },
        styles: { fontSize: 10 },
      })

      const afterFirstTable = (doc as any).lastAutoTable.finalY + 10

      autoTable(doc, {
        startY: afterFirstTable,
        head: [['Type de professionnel', 'Nombre']],
        body: activityRows.map((r) => [r.isPole ? r.label : `   ${r.label}`, String(r.value)]),
        headStyles: { fillColor: [0, 59, 74] },
        styles: { fontSize: 9 },
        didParseCell: (data: any) => {
          if (data.section === 'body' && activityRows[data.row.index]?.isPole) {
            data.cell.styles.fontStyle = 'bold'
          }
        },
      })

      doc.save(`dashboard-patrimoine-${todayStr()}.pdf`)
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#003B4A] font-brand">Vue d'ensemble</h1>
          <p className="text-gray-500">Activité de la plateforme en temps réel.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportExcel} disabled={!stats || exporting !== null} title="Exporter en Excel">
            <FileSpreadsheet className="h-4 w-4 mr-1.5" /> {exporting === 'excel' ? 'Export...' : 'Excel'}
          </Button>
          <Button variant="outline" size="sm" onClick={exportPDF} disabled={!stats || exporting !== null} title="Exporter en PDF">
            <FileDown className="h-4 w-4 mr-1.5" /> {exporting === 'pdf' ? 'Export...' : 'PDF'}
          </Button>
          <Button variant="outline" size="sm" onClick={loadStats} title="Actualiser">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filtre de période */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-[#003B4A] shrink-0">
          <Calendar className="h-4 w-4" /> Période
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={clearPeriod}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${!dateFrom && !dateTo ? 'bg-[#00BFA6] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Tout
          </button>
          {DATE_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => applyPreset(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activePreset === p.id ? 'bg-[#00BFA6] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-sm ml-auto">
          <span className="text-xs text-gray-400">Du</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setActivePreset("") }}
            className="px-2 py-1.5 border-2 border-gray-200 rounded-lg text-xs font-medium bg-white outline-none"
          />
          <span className="text-xs text-gray-400">au</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setActivePreset("") }}
            className="px-2 py-1.5 border-2 border-gray-200 rounded-lg text-xs font-medium bg-white outline-none"
          />
        </div>
      </div>

      {/* Annonces */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-xl text-orange-600">
              <AlertCircle className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium text-gray-500">En attente</span>
          </div>
          <h3 className="text-2xl font-bold text-[#003B4A]">{fmt(stats?.pendingAnnounces)}</h3>
          <p className="text-sm text-gray-500 mt-1">Annonces à valider</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-xl text-green-600">
              <FileText className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium text-gray-500">Total Annonces</span>
          </div>
          <h3 className="text-2xl font-bold text-[#003B4A]">{fmt(stats?.totalOnlineAnnounces)}</h3>
          <p className="text-sm text-gray-500 mt-1">Annonces en ligne (validées)</p>
        </div>
      </div>

      {/* Inscriptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
              <User className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium text-gray-500">Particuliers</span>
          </div>
          <h3 className="text-2xl font-bold text-[#003B4A]">{fmt(stats?.totalParticuliers)}</h3>
          <p className="text-sm text-gray-500 mt-1">Comptes particuliers inscrits</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-[#E6F8F6] p-3 rounded-xl text-[#00908A]">
              <Briefcase className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium text-gray-500">Professionnels</span>
          </div>
          <h3 className="text-2xl font-bold text-[#003B4A]">{fmt(stats?.totalProfessionnels)}</h3>
          <p className="text-sm text-gray-500 mt-1">Comptes professionnels inscrits</p>
        </div>
      </div>

      {/* Répartition des professionnels par type d'activité, détaillée par sous-catégorie */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-[#003B4A] mb-4">Type de professionnel</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {Object.entries(ACTIVITY_LABELS).filter(([id]) => id !== 'NON_CLASSE' || (stats?.professionnelsByActivity?.NON_CLASSE ?? 0) > 0).map(([id, def]) => {
            const Icon = def.icon
            const subCategories = def.pole ? subCategoriesForPole(def.pole) : []
            return (
              <div key={id} className="border border-gray-100 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-2.5 rounded-xl text-gray-600 shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-[#003B4A]">{fmt(stats?.professionnelsByActivity?.[id])}</div>
                    <div className="text-xs text-gray-500">{def.label}</div>
                  </div>
                </div>
                {subCategories.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
                    {subCategories.map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-gray-500 truncate">{sub.label}</span>
                        <span className="font-bold text-[#003B4A] shrink-0">{fmt(stats?.professionnelsBySubCategory?.[sub.id])}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
