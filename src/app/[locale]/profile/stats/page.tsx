"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useTranslations } from "next-intl"
import {
  PieChart as PieChartIcon, MousePointerClick, Phone, Mail, MessageSquare, Flag,
  Store, Play, Bell, Loader2, TrendingUp, FileSpreadsheet, FileDown, Presentation, BarChart3,
} from "lucide-react"
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts"
import { PeriodFilterBar } from "@/components/admin/PeriodFilterBar"
import { DATE_PRESETS, todayStr, periodLabel } from "@/lib/datePresets"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

type Stats = {
  announceClicks: number
  calls: { total: number; byChannel: { CALL: number; WHATSAPP: number; TELEGRAM: number; VIBER: number } }
  emails: number
  internalMessages: number
  reports: number
  boutiqueContacts: number
  boutiqueFollowers: number
}

type TimeseriesBucket = {
  date: string
  views: number
  clicks: number
  sale: number
  rental: number
  boutiqueContacts: number
  reports: number
  pointsUsed: number
}
type TimeseriesResponse = {
  granularity: 'day' | 'week' | 'month'
  from: string
  to: string
  series: TimeseriesBucket[]
  totals: Omit<TimeseriesBucket, 'date'>
}

// Carte KPI générique — même gabarit pour toutes les statistiques, particulier ou pro.
function StatCard({ icon: Icon, value, title, desc, color = "#00BFA6", sub }: {
  icon: any; value: number; title: string; desc: string; color?: string; sub?: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start gap-3">
        <span className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: color + '1A' }}>
          <Icon className="h-5 w-5" style={{ color }} />
        </span>
        <div className="min-w-0">
          <div className="text-2xl font-black text-gray-900 leading-none">{value.toLocaleString()}</div>
          <p className="font-bold text-gray-900 text-sm mt-1.5">{title}</p>
          <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
        </div>
      </div>
      {sub}
    </div>
  )
}

export default function StatsPage() {
  const t = useTranslations("ProfileStats")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats | null>(null)
  const [isPro, setIsPro] = useState(false)
  const [storyViews, setStoryViews] = useState(0)

  // Période + granularité pour les graphiques du bas de page
  const [dateFrom, setDateFrom] = useState(DATE_PRESETS[2].from())
  const [dateTo, setDateTo] = useState(DATE_PRESETS[2].to())
  const [activePreset, setActivePreset] = useState(DATE_PRESETS[2].id)
  const [timeseries, setTimeseries] = useState<TimeseriesResponse | null>(null)
  const [chartsLoading, setChartsLoading] = useState(true)
  const [exporting, setExporting] = useState<'excel' | 'pdf' | 'pptx' | null>(null)

  const applyPreset = (preset: typeof DATE_PRESETS[number]) => {
    setActivePreset(preset.id); setDateFrom(preset.from()); setDateTo(preset.to())
  }
  const clearPeriod = () => { setActivePreset(""); setDateFrom(""); setDateTo("") }

  // Granularité auto : quotidienne sur un mois, hebdo jusqu'à 6 mois, mensuelle au-delà.
  const granularity: 'day' | 'week' | 'month' = useMemo(() => {
    if (!dateFrom || !dateTo) return 'day'
    const days = Math.max(1, Math.round((new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / 86400000) + 1)
    if (days <= 31) return 'day'
    if (days <= 180) return 'week'
    return 'month'
  }, [dateFrom, dateTo])

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('token')
      if (!token) { setLoading(false); return }

      let userId: number | null = null
      let pro = false
      try {
        const userStr = localStorage.getItem('user')
        const user = userStr ? JSON.parse(userStr) : null
        userId = user?.id ?? null
        pro = user?.userType === 'SOCIETE'
        setIsPro(pro)
      } catch { /* ignore */ }

      try {
        const res = await fetch(`${API_URL}/users/me/stats`, { headers: { Authorization: `Bearer ${token}` } })
        if (res.ok) setStats(await res.json())
      } catch { /* ignore */ }

      // Vues des stories — vivent dans la config JSON de la boutique (pas dans la base
      // principale), somme des stories actives + archivées pour garder l'historique complet
      // même après suppression d'une story.
      if (pro && userId) {
        try {
          const cfgRes = await fetch(`/api/boutique/${userId}`)
          const cfg = cfgRes.ok ? await cfgRes.json() : null
          const active = (cfg?.stories || []).reduce((s: number, story: any) => s + (story.views || 0), 0)
          const archived = (cfg?.archivedStories || []).reduce((s: number, story: any) => s + (story.views || 0), 0)
          setStoryViews(active + archived)
        } catch { /* ignore */ }
      }

      setLoading(false)
    }
    load()
  }, [])

  const loadTimeseries = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) { setChartsLoading(false); return }
    setChartsLoading(true)
    try {
      const params = new URLSearchParams()
      if (dateFrom) params.set('from', dateFrom)
      if (dateTo) params.set('to', dateTo)
      params.set('granularity', granularity)
      const res = await fetch(`${API_URL}/users/me/stats/timeseries?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) setTimeseries(await res.json())
    } catch { /* ignore */ } finally { setChartsLoading(false) }
  }, [dateFrom, dateTo, granularity])

  useEffect(() => { loadTimeseries() }, [loadTimeseries])

  const formatBucketLabel = (dateStr: string) => {
    const d = new Date(`${dateStr}T00:00:00`)
    if (granularity === 'month') return d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
  }

  const chartData = useMemo(
    () => (timeseries?.series || []).map((b) => ({ ...b, label: formatBucketLabel(b.date) })),
    [timeseries, granularity],
  )

  const distributionData = useMemo(() => {
    if (!timeseries) return []
    return [
      { name: t("chartViews"), value: timeseries.totals.views, color: '#00BFA6' },
      { name: t("chartClicks"), value: timeseries.totals.clicks, color: '#1E40AF' },
      ...(isPro ? [{ name: t("chartBoutiqueContacts"), value: timeseries.totals.boutiqueContacts, color: '#7C3AED' }] : []),
      { name: t("chartReports"), value: timeseries.totals.reports, color: '#EA580C' },
      { name: t("chartPointsUsed"), value: timeseries.totals.pointsUsed, color: '#D97706' },
    ].filter((d) => d.value > 0)
  }, [timeseries, isPro, t])

  const hasChartData = chartData.some((b) => b.views || b.clicks || b.sale || b.rental || b.boutiqueContacts || b.reports || b.pointsUsed)

  const exportExcel = async () => {
    if (!timeseries || !stats) return
    setExporting('excel')
    try {
      const XLSX = await import('xlsx')
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ['Mes statistiques — Patrimoine Immobilier'],
        [`Période (graphiques) : ${periodLabel(dateFrom, dateTo)}`],
        [`Généré le ${new Date().toLocaleString('fr-FR')}`],
        [],
        ['Indicateur', 'Valeur (total cumulé)'],
        [t("announceClicksTitle"), stats.announceClicks],
        [t("callsTitle"), stats.calls.total],
        [t("emailsTitle"), stats.emails],
        [t("internalMessagesTitle"), stats.internalMessages],
        [t("reportsTitle"), stats.reports],
        ...(isPro ? [
          [t("boutiqueContactsTitle"), stats.boutiqueContacts],
          [t("storyViewsTitle"), storyViews],
          [t("boutiqueFollowersTitle"), stats.boutiqueFollowers],
        ] : []),
      ]), 'Résumé')
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ['Date', t("chartViews"), t("chartClicks"), t("chartSale"), t("chartRental"), t("chartBoutiqueContacts"), t("chartReports"), t("chartPointsUsed")],
        ...timeseries.series.map((b) => [b.date, b.views, b.clicks, b.sale, b.rental, b.boutiqueContacts, b.reports, b.pointsUsed]),
      ]), `Détail (${timeseries.granularity})`)
      XLSX.writeFile(wb, `statistiques-${todayStr()}.xlsx`)
    } finally { setExporting(null) }
  }

  const exportPDF = async () => {
    if (!timeseries || !stats) return
    setExporting('pdf')
    try {
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')])
      const doc = new jsPDF()
      doc.setFontSize(16); doc.setTextColor(0, 59, 74)
      doc.text('Mes statistiques — Patrimoine Immobilier', 14, 18)
      doc.setFontSize(10); doc.setTextColor(120)
      doc.text(`Période (graphiques) : ${periodLabel(dateFrom, dateTo)}`, 14, 25)
      doc.text(`Généré le ${new Date().toLocaleString('fr-FR')}`, 14, 30)

      autoTable(doc, {
        startY: 36,
        head: [['Indicateur', 'Valeur (total cumulé)']],
        body: [
          [t("announceClicksTitle"), String(stats.announceClicks)],
          [t("callsTitle"), String(stats.calls.total)],
          [t("emailsTitle"), String(stats.emails)],
          [t("internalMessagesTitle"), String(stats.internalMessages)],
          [t("reportsTitle"), String(stats.reports)],
          ...(isPro ? [
            [t("boutiqueContactsTitle"), String(stats.boutiqueContacts)],
            [t("storyViewsTitle"), String(storyViews)],
            [t("boutiqueFollowersTitle"), String(stats.boutiqueFollowers)],
          ] : []),
        ],
        headStyles: { fillColor: [0, 191, 166] },
        styles: { fontSize: 10 },
      })

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [['Date', t("chartViews"), t("chartClicks"), t("chartSale"), t("chartRental"), t("chartBoutiqueContacts"), t("chartReports"), t("chartPointsUsed")]],
        body: timeseries.series.map((b) => [b.date, String(b.views), String(b.clicks), String(b.sale), String(b.rental), String(b.boutiqueContacts), String(b.reports), String(b.pointsUsed)]),
        headStyles: { fillColor: [0, 59, 74] },
        styles: { fontSize: 8 },
      })

      doc.save(`statistiques-${todayStr()}.pdf`)
    } finally { setExporting(null) }
  }

  const exportPPTX = async () => {
    if (!timeseries || !stats) return
    setExporting('pptx')
    try {
      const { default: pptxgen } = await import('pptxgenjs')
      const pres = new pptxgen()
      pres.defineLayout({ name: 'PATRIMOINE', width: 10, height: 5.63 })
      pres.layout = 'PATRIMOINE'
      const NAVY = '003B4A', TEAL = '00BFA6', GRAY = '6B7280'

      const title = pres.addSlide()
      title.background = { color: NAVY }
      title.addText('Patrimoine Immobilier', { x: 0.6, y: 1.9, w: 8.8, h: 0.7, fontSize: 30, bold: true, color: 'FFFFFF', fontFace: 'Arial' })
      title.addText('Mes statistiques', { x: 0.6, y: 2.6, w: 8.8, h: 0.5, fontSize: 16, color: TEAL, fontFace: 'Arial' })
      title.addText(`Période : ${periodLabel(dateFrom, dateTo)}`, { x: 0.6, y: 3.3, w: 8.8, h: 0.35, fontSize: 12, color: 'C7D6DA', fontFace: 'Arial' })
      title.addText(`Généré le ${new Date().toLocaleString('fr-FR')}`, { x: 0.6, y: 3.6, w: 8.8, h: 0.35, fontSize: 12, color: 'C7D6DA', fontFace: 'Arial' })

      const kpiSlide = pres.addSlide()
      kpiSlide.addText('Indicateurs clés (total cumulé)', { x: 0.5, y: 0.3, w: 9, h: 0.5, fontSize: 22, bold: true, color: NAVY, fontFace: 'Arial' })
      const kpiLabels = [t("announceClicksTitle"), t("callsTitle"), t("emailsTitle"), t("internalMessagesTitle"), t("reportsTitle")]
      const kpiValues = [stats.announceClicks, stats.calls.total, stats.emails, stats.internalMessages, stats.reports]
      kpiSlide.addChart(pres.ChartType.bar, [{ name: 'Total', labels: kpiLabels, values: kpiValues }], {
        x: 0.5, y: 1.0, w: 9, h: 4.3, barDir: 'col', chartColors: [TEAL], showLegend: false, showValue: true,
        dataLabelColor: NAVY, dataLabelFontSize: 11, catAxisLabelColor: GRAY, valAxisLabelColor: GRAY, catAxisLabelFontSize: 9,
      })

      if (chartData.length > 0) {
        const trendSlide = pres.addSlide()
        trendSlide.addText(`Évolution — ${t("chartViews")} & ${t("chartClicks")}`, { x: 0.5, y: 0.3, w: 9, h: 0.5, fontSize: 20, bold: true, color: NAVY, fontFace: 'Arial' })
        trendSlide.addChart(pres.ChartType.line, [
          { name: t("chartViews"), labels: chartData.map((c) => c.label), values: chartData.map((c) => c.views) },
          { name: t("chartClicks"), labels: chartData.map((c) => c.label), values: chartData.map((c) => c.clicks) },
        ], {
          x: 0.5, y: 1.0, w: 9, h: 4.3, chartColors: [TEAL, NAVY], showLegend: true, legendPos: 'b',
          catAxisLabelColor: GRAY, valAxisLabelColor: GRAY, catAxisLabelFontSize: 8, lineDataSymbol: 'circle',
        })
      }

      const distSlide = pres.addSlide()
      distSlide.addText(t("chartDistributionTitle"), { x: 0.5, y: 0.3, w: 9, h: 0.5, fontSize: 20, bold: true, color: NAVY, fontFace: 'Arial' })
      if (distributionData.length > 0) {
        distSlide.addChart(pres.ChartType.pie, [{ name: 'Activité', labels: distributionData.map((d) => d.name), values: distributionData.map((d) => d.value) }], {
          x: 1.5, y: 1.0, w: 7, h: 4.3, chartColors: distributionData.map((d) => d.color.replace('#', '')), showLegend: true, legendPos: 'b',
          showValue: true, dataLabelColor: 'FFFFFF', dataLabelFontSize: 12,
        })
      } else {
        distSlide.addText(t("noChartData"), { x: 0.5, y: 2.5, w: 9, h: 0.5, fontSize: 14, color: GRAY, align: 'center' })
      }

      await pres.writeFile({ fileName: `statistiques-${todayStr()}.pptx` })
    } finally { setExporting(null) }
  }

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-10 flex items-center justify-center min-h-[50vh]">
      <Loader2 className="h-8 w-8 animate-spin text-[#00BFA6]" />
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-3 text-gray-900">
        <PieChartIcon className="text-[#00BFA6] fill-current" /> {t("title")}
      </h1>
      <p className="text-gray-500 mb-8 text-sm">{t("subtitle")}</p>

      {!stats ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 py-20 flex flex-col items-center gap-3">
          <div className="h-14 w-14 rounded-2xl bg-[#00BFA6]/10 flex items-center justify-center">
            <PieChartIcon className="h-6 w-6 text-[#00BFA6]" />
          </div>
          <p className="text-gray-500 font-medium">{t("noData")}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Statistiques communes — particulier et professionnel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard
              icon={MousePointerClick}
              value={stats.announceClicks}
              title={t("announceClicksTitle")}
              desc={t("announceClicksDesc")}
              color="#00BFA6"
            />
            <StatCard
              icon={Phone}
              value={stats.calls.total}
              title={t("callsTitle")}
              desc={t("callsDesc")}
              color="#1E40AF"
              sub={
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="font-black text-gray-900">{stats.calls.byChannel.CALL}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{t("callChannelCall")}</div>
                  </div>
                  <div>
                    <div className="font-black text-gray-900">{stats.calls.byChannel.WHATSAPP}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{t("callChannelWhatsapp")}</div>
                  </div>
                  <div>
                    <div className="font-black text-gray-900">{stats.calls.byChannel.TELEGRAM}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{t("callChannelTelegram")}</div>
                  </div>
                </div>
              }
            />
            <StatCard
              icon={Mail}
              value={stats.emails}
              title={t("emailsTitle")}
              desc={t("emailsDesc")}
              color="#DC2626"
            />
            <StatCard
              icon={MessageSquare}
              value={stats.internalMessages}
              title={t("internalMessagesTitle")}
              desc={t("internalMessagesDesc")}
              color="#7C3AED"
            />
            <StatCard
              icon={Flag}
              value={stats.reports}
              title={t("reportsTitle")}
              desc={t("reportsDesc")}
              color="#EA580C"
            />
          </div>

          {/* Statistiques boutique — professionnel uniquement */}
          {isPro && (
            <div>
              <h2 className="font-black text-gray-900 text-lg flex items-center gap-2 mb-4">
                <Store className="h-5 w-5 text-[#00BFA6]" /> {t("boutiqueSectionTitle")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                  icon={Store}
                  value={stats.boutiqueContacts}
                  title={t("boutiqueContactsTitle")}
                  desc={t("boutiqueContactsDesc")}
                  color="#00BFA6"
                />
                <StatCard
                  icon={Play}
                  value={storyViews}
                  title={t("storyViewsTitle")}
                  desc={t("storyViewsDesc")}
                  color="#D97706"
                />
                <StatCard
                  icon={Bell}
                  value={stats.boutiqueFollowers}
                  title={t("boutiqueFollowersTitle")}
                  desc={t("boutiqueFollowersDesc")}
                  color="#1E40AF"
                />
              </div>
            </div>
          )}

          {/* Graphiques — évolution par période + export de rapports */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="font-black text-gray-900 text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-[#00BFA6]" /> {t("chartsTitle")}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">{t("chartsSubtitle")}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={exportExcel} disabled={exporting !== null || !timeseries}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-gray-200 text-gray-600 text-xs font-bold hover:border-[#00BFA6] hover:text-[#00BFA6] disabled:opacity-50 transition-colors">
                  <FileSpreadsheet className="h-3.5 w-3.5" /> {exporting === 'excel' ? t("exporting") : 'Excel'}
                </button>
                <button onClick={exportPDF} disabled={exporting !== null || !timeseries}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-gray-200 text-gray-600 text-xs font-bold hover:border-[#00BFA6] hover:text-[#00BFA6] disabled:opacity-50 transition-colors">
                  <FileDown className="h-3.5 w-3.5" /> {exporting === 'pdf' ? t("exporting") : 'PDF'}
                </button>
                <button onClick={exportPPTX} disabled={exporting !== null || !timeseries}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-gray-200 text-gray-600 text-xs font-bold hover:border-[#00BFA6] hover:text-[#00BFA6] disabled:opacity-50 transition-colors">
                  <Presentation className="h-3.5 w-3.5" /> {exporting === 'pptx' ? t("exporting") : 'PowerPoint'}
                </button>
              </div>
            </div>

            <div className="mb-4">
              <PeriodFilterBar
                dateFrom={dateFrom} dateTo={dateTo} activePreset={activePreset}
                onApplyPreset={applyPreset} onClear={clearPeriod}
                onChangeFrom={(v) => { setDateFrom(v); setActivePreset("") }}
                onChangeTo={(v) => { setDateTo(v); setActivePreset("") }}
              />
            </div>

            {chartsLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-[#00BFA6]" /></div>
            ) : !hasChartData ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 flex flex-col items-center gap-2">
                <TrendingUp className="h-8 w-8 text-gray-300" />
                <p className="text-gray-400 text-sm">{t("noChartData")}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-bold text-gray-900 text-sm mb-4">{t("chartViewsClicksTitle")}</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00BFA6" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#00BFA6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1E40AF" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#1E40AF" stopOpacity={0} />
                        </linearGradient>
                        {isPro && (
                          <linearGradient id="colorBoutique" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                          </linearGradient>
                        )}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={30} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F3F4F6', fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Area type="monotone" dataKey="views" name={t("chartViews")} stroke="#00BFA6" fill="url(#colorViews)" strokeWidth={2} />
                      <Area type="monotone" dataKey="clicks" name={t("chartClicks")} stroke="#1E40AF" fill="url(#colorClicks)" strokeWidth={2} />
                      {isPro && <Area type="monotone" dataKey="boutiqueContacts" name={t("chartBoutiqueContacts")} stroke="#7C3AED" fill="url(#colorBoutique)" strokeWidth={2} />}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-bold text-gray-900 text-sm mb-4">{t("chartAnnouncesTitle")}</h3>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={30} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F3F4F6', fontSize: 12 }} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Bar dataKey="sale" name={t("chartSale")} stackId="a" fill="#00BFA6" />
                        <Bar dataKey="rental" name={t("chartRental")} stackId="a" fill="#003B4A" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-bold text-gray-900 text-sm mb-4">{t("chartDistributionTitle")}</h3>
                    {distributionData.length === 0 ? (
                      <div className="h-[240px] flex items-center justify-center text-sm text-gray-400">{t("noChartData")}</div>
                    ) : (
                      <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                          <Pie data={distributionData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                            {distributionData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F3F4F6', fontSize: 12 }} />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
