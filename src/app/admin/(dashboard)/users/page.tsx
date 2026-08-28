"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  CheckCircle, XCircle, FileText, Search, RefreshCw, AlertTriangle, ShieldOff, ShieldCheck,
  ShieldAlert, ChevronDown, KeyRound, LayoutGrid, Building, Hotel, PartyPopper, Warehouse, MapPin,
  FileDown, FileSpreadsheet,
} from "lucide-react"
import { POLE_LABELS, SUB_CATEGORY_LABELS, subCategoriesForPole, type ActivityPole } from "@/data/activityPoles"
import { PeriodFilterBar } from "@/components/admin/PeriodFilterBar"
import { DATE_PRESETS, todayStr, periodLabel } from "@/lib/datePresets"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

type StatusFilter = "ALL" | "ACTIVE" | "PENDING" | "SUSPENDED"
type AccountTypeFilter = "ALL" | "PRO" | "PARTICULIER"
type PoleFilter = "ALL" | ActivityPole

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: "ALL", label: "Tous les profils" },
  { id: "ACTIVE", label: "Actifs" },
  { id: "PENDING", label: "En attente de validation" },
  { id: "SUSPENDED", label: "Suspendus / Inactifs" },
]

const ACCOUNT_TYPE_TABS: { id: AccountTypeFilter; label: string }[] = [
  { id: "ALL", label: "Tous" },
  { id: "PRO", label: "Professionnel (B2B)" },
  { id: "PARTICULIER", label: "Particulier (B2C)" },
]

const POLE_TABS: { id: PoleFilter; label: string; icon: typeof Building }[] = [
  { id: "ALL", label: "Tous les pôles", icon: LayoutGrid },
  { id: "IMMOBILIER", label: POLE_LABELS.IMMOBILIER, icon: Building },
  { id: "HOTELLERIE", label: POLE_LABELS.HOTELLERIE, icon: Hotel },
  { id: "EVENEMENTIEL", label: POLE_LABELS.EVENEMENTIEL, icon: PartyPopper },
  { id: "ENTREPOSAGE", label: POLE_LABELS.ENTREPOSAGE, icon: Warehouse },
]

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Actif", className: "bg-green-100 text-green-800" },
  SUSPENDED: { label: "Suspendu", className: "bg-amber-100 text-amber-800" },
  BLOCKED: { label: "Bloqué", className: "bg-red-100 text-red-800" },
}

const DOCUMENT_DEFS = [
  { key: "rcDocumentUrl", label: "RC", full: "Registre de Commerce" },
  { key: "agreementDocumentUrl", label: "AGR", full: "Agrément" },
  { key: "nifDocumentUrl", label: "NIF", full: "Justificatif NIF" },
  { key: "nisDocumentUrl", label: "NIS", full: "Justificatif NIS" },
  { key: "inapiDocumentUrl", label: "INAPI", full: "Justificatif INAPI" },
  { key: "imageUrl", label: "LOGO", full: "Logo de l'agence" },
] as const

function agreementBadge(expiry?: string | null) {
  if (!expiry) return null
  const days = Math.ceil((new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (days < 0) return <span className="text-[10px] font-bold text-red-600">Expiré le {new Date(expiry).toLocaleDateString()}</span>
  if (days <= 30) return <span className="text-[10px] font-bold text-amber-600">Expire dans {days}j</span>
  return <span className="text-[10px] text-gray-400">Valide jusqu'au {new Date(expiry).toLocaleDateString()}</span>
}

// Vignettes documents : compactes, organisées, distinguent clairement fourni / manquant
function DocumentsCell({ user }: { user: any }) {
  if (!user.companyName) return <span className="text-gray-300 text-xs">—</span>

  const provided = DOCUMENT_DEFS.filter((d) => user[d.key]).length

  return (
    <div className="flex flex-col gap-1.5 min-w-[160px]">
      <span className={`text-[10px] font-bold ${provided === DOCUMENT_DEFS.length ? 'text-green-600' : 'text-gray-400'}`}>
        {provided}/{DOCUMENT_DEFS.length} documents fournis
      </span>
      <div className="flex flex-wrap gap-1">
        {DOCUMENT_DEFS.map((d) =>
          user[d.key] ? (
            <a
              key={d.key}
              href={`${API_URL}${user[d.key]}`}
              target="_blank"
              rel="noopener noreferrer"
              title={d.full}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-[#00BFA6]/10 text-[#00BFA6] hover:bg-[#00BFA6]/20 transition-colors"
            >
              <FileText className="h-2.5 w-2.5" /> {d.label}
            </a>
          ) : (
            <span
              key={d.key}
              title={`${d.full} — non fourni`}
              className="px-1.5 py-0.5 rounded-md text-[9px] font-bold text-gray-300 border border-dashed border-gray-200"
            >
              {d.label}
            </span>
          )
        )}
      </div>
    </div>
  )
}

function AdminUsersContent() {
  const searchParams = useSearchParams()
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || "")
  const [wilaya, setWilaya] = useState("")
  const [commune, setCommune] = useState("")
  const [cities, setCities] = useState<any[]>([])
  const [towns, setTowns] = useState<any[]>([])
  const [status, setStatus] = useState<StatusFilter>("ALL")
  const [accountType, setAccountType] = useState<AccountTypeFilter>("ALL")
  const [pole, setPole] = useState<PoleFilter>("ALL")
  const [subCategory, setSubCategory] = useState<string>("ALL")
  const [statusMenuFor, setStatusMenuFor] = useState<number | null>(null)
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

  const fetchUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (wilaya) params.set('wilaya', wilaya)
      if (commune) params.set('commune', commune)
      if (status !== 'ALL') params.set('status', status)
      if (accountType !== 'ALL') params.set('accountType', accountType)
      if (pole !== 'ALL') params.set('pole', pole)
      if (subCategory !== 'ALL') params.set('subCategory', subCategory)
      if (dateFrom) params.set('from', dateFrom)
      if (dateTo) params.set('to', dateTo)
      const response = await fetch(`${API_URL}/admin/users?${params.toString()}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
        },
        cache: 'no-store'
      })
      if (response.ok) {
        setUsers(await response.json())
      }
    } catch (error) {
      console.error("Failed to fetch users", error)
    } finally {
      setIsLoading(false)
    }
  }, [search, wilaya, commune, status, accountType, pole, subCategory, dateFrom, dateTo])

  useEffect(() => {
    fetchUsers()
    const interval = setInterval(fetchUsers, 15000)
    return () => clearInterval(interval)
  }, [fetchUsers])

  const handleValidate = async (userId: number) => {
    if (!confirm("Valider les documents de cet utilisateur ?")) return
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${API_URL}/admin/users/${userId}/validate`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, adminVerified: true } : u))
      } else {
        alert("Erreur lors de la validation")
      }
    } catch {
      alert("Erreur technique")
    }
  }

  const handleDelete = async (userId: number) => {
    if (!confirm("Supprimer cet utilisateur ? Cette action est irréversible.")) return
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        setUsers(users.filter(u => u.id !== userId))
      } else {
        alert("Erreur lors de la suppression")
      }
    } catch {
      alert("Erreur technique")
    }
  }

  const handleStatusChange = async (userId: number, newStatus: string) => {
    let reason: string | null = null
    if (newStatus !== 'ACTIVE') {
      reason = prompt(`Motif (${newStatus === 'SUSPENDED' ? 'suspension' : 'blocage'}) — optionnel`) || undefined as any
    }
    setStatusMenuFor(null)
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${API_URL}/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, reason }),
      })
      if (response.ok) {
        const updated = await response.json()
        setUsers(users.map(u => u.id === userId ? { ...u, ...updated } : u))
      } else {
        alert("Erreur lors du changement de statut")
      }
    } catch {
      alert("Erreur technique")
    }
  }

  const handleResetPassword = async (userId: number) => {
    const newPassword = prompt("Nouveau mot de passe pour cet utilisateur (min. 6 caractères)")
    if (!newPassword) return
    if (newPassword.length < 6) {
      alert("Le mot de passe doit contenir au moins 6 caractères")
      return
    }
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${API_URL}/admin/users/${userId}/password`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      })
      if (response.ok) {
        alert("Mot de passe réinitialisé avec succès")
      } else {
        alert("Erreur lors de la réinitialisation du mot de passe")
      }
    } catch {
      alert("Erreur technique")
    }
  }

  const exportRows = () => users.map((u) => ({
    compte: u.companyName || `${u.firstName || ''} ${u.lastName || ''}`.trim(),
    type: u.companyName ? 'Professionnel' : 'Particulier',
    email: u.email || '',
    telephone: u.phone || '',
    activite: u.companyActivity ? (SUB_CATEGORY_LABELS[u.companyActivity] || u.companyActivity) : '',
    localisation: u.location || '',
    statut: STATUS_BADGE[u.accountStatus || 'ACTIVE']?.label || u.accountStatus || '',
    inscritLe: new Date(u.createdAt).toLocaleDateString('fr-FR'),
  }))

  const exportExcel = async () => {
    setExporting('excel')
    try {
      const XLSX = await import('xlsx')
      const rows = exportRows()
      const sheet = XLSX.utils.aoa_to_sheet([
        ['Utilisateurs — Patrimoine Immobilier'],
        [`Période : ${periodLabel(dateFrom, dateTo)}`],
        [`Généré le ${new Date().toLocaleString('fr-FR')}`],
        [],
        ['Compte', 'Type', 'Email', 'Téléphone', 'Activité', 'Localisation', 'Statut', 'Inscrit le'],
        ...rows.map((r) => [r.compte, r.type, r.email, r.telephone, r.activite, r.localisation, r.statut, r.inscritLe]),
      ])
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, sheet, 'Utilisateurs')
      XLSX.writeFile(wb, `utilisateurs-patrimoine-${todayStr()}.xlsx`)
    } finally { setExporting(null) }
  }

  const exportPDF = async () => {
    setExporting('pdf')
    try {
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')])
      const doc = new jsPDF({ orientation: 'landscape' })
      doc.setFontSize(16); doc.setTextColor(0, 59, 74)
      doc.text('Utilisateurs — Patrimoine Immobilier', 14, 18)
      doc.setFontSize(10); doc.setTextColor(120)
      doc.text(`Période : ${periodLabel(dateFrom, dateTo)}`, 14, 25)
      doc.text(`Généré le ${new Date().toLocaleString('fr-FR')}`, 14, 30)
      autoTable(doc, {
        startY: 36,
        head: [['Compte', 'Type', 'Email', 'Téléphone', 'Activité', 'Localisation', 'Statut', 'Inscrit le']],
        body: exportRows().map((r) => [r.compte, r.type, r.email, r.telephone, r.activite, r.localisation, r.statut, r.inscritLe]),
        headStyles: { fillColor: [0, 191, 166] },
        styles: { fontSize: 8 },
      })
      doc.save(`utilisateurs-patrimoine-${todayStr()}.pdf`)
    } finally { setExporting(null) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#003B4A] font-brand">Utilisateurs</h1>
          <p className="text-gray-500">Annuaire global — segmentation par pôle d'activité, conformité documentaire et statuts de compte.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportExcel} disabled={exporting !== null} title="Exporter en Excel">
            <FileSpreadsheet className="h-4 w-4 mr-1.5" /> {exporting === 'excel' ? 'Export...' : 'Excel'}
          </Button>
          <Button variant="outline" size="sm" onClick={exportPDF} disabled={exporting !== null} title="Exporter en PDF">
            <FileDown className="h-4 w-4 mr-1.5" /> {exporting === 'pdf' ? 'Export...' : 'PDF'}
          </Button>
          <Button variant="outline" size="sm" onClick={fetchUsers} title="Actualiser">
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

      {/* Recherche */}
      <div className="bg-white px-3 py-2 rounded-xl border-2 border-gray-200 flex items-center gap-2">
        <Search className="h-4 w-4 text-gray-400 shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nom, prénom, raison sociale, email, téléphone, wilaya, commune..."
          className="outline-none text-sm w-full"
        />
      </div>

      {/* Filtres transversaux : statut, type de compte, localisation */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-0.5 flex-wrap">
          {STATUS_TABS.map((t) => (
            <button key={t.id} onClick={() => setStatus(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${status === t.id ? 'bg-[#00BFA6] text-white' : 'text-gray-500 hover:text-gray-800'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-0.5">
          {ACCOUNT_TYPE_TABS.map((t) => (
            <button key={t.id} onClick={() => setAccountType(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${accountType === t.id ? 'bg-[#003B4A] text-white' : 'text-gray-500 hover:text-gray-800'}`}>
              {t.label}
            </button>
          ))}
        </div>

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
      </div>

      {/* Segmentation par pôle d'activité */}
      <div className="flex flex-wrap gap-2">
        {POLE_TABS.map((t) => {
          const Icon = t.icon
          const isActive = pole === t.id
          return (
            <button
              key={t.id}
              onClick={() => { setPole(t.id); setSubCategory("ALL") }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                isActive ? 'bg-[#00BFA6] border-[#00BFA6] text-white shadow-lg shadow-[#00BFA6]/20' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Sous-catégories du pôle sélectionné, pour affiner le filtre */}
      {pole !== "ALL" && (
        <div className="flex flex-wrap gap-2 pl-1">
          <button
            onClick={() => setSubCategory("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${subCategory === "ALL" ? 'bg-[#003B4A] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}
          >
            Toutes sous-catégories
          </button>
          {subCategoriesForPole(pole).map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSubCategory(sub.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${subCategory === sub.id ? 'bg-[#003B4A] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}
            >
              {sub.label}
            </button>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-4 font-semibold text-gray-900">Compte</th>
                <th className="px-4 py-4 font-semibold text-gray-900">Activité</th>
                <th className="px-4 py-4 font-semibold text-gray-900">Conformité</th>
                <th className="px-4 py-4 font-semibold text-gray-900">Documents</th>
                <th className="px-4 py-4 font-semibold text-gray-900">Localisation</th>
                <th className="px-4 py-4 font-semibold text-gray-900 text-center">Statut</th>
                <th className="px-4 py-4 font-semibold text-gray-900 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">Chargement...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">Aucun utilisateur.</td></tr>
              ) : (
                users.map((user) => {
                  const accountStatus = user.accountStatus || 'ACTIVE'
                  const statusDef = STATUS_BADGE[accountStatus] || STATUS_BADGE.ACTIVE
                  const isCompany = !!user.companyName
                  const poleDef = POLE_TABS.find((p) => p.id === user.pole)
                  return (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors align-top">
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold mb-1 ${isCompany ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                        {isCompany ? 'Professionnel' : 'Particulier'}
                      </span>
                      <div className="font-medium text-gray-900">{user.companyName || `${user.firstName || ''} ${user.lastName || ''}`.trim()}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-500">{user.phone}</div>
                      <div className="text-[10px] text-gray-400 mt-1">Inscrit le {new Date(user.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-4 py-4">
                      {poleDef && poleDef.id !== 'ALL' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700">
                          <poleDef.icon className="h-3.5 w-3.5 text-gray-400" /> {poleDef.label}
                        </span>
                      ) : <span className="text-gray-300 text-xs">—</span>}
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        {user.companyActivity ? (SUB_CATEGORY_LABELS[user.companyActivity] || user.companyActivity) : (isCompany ? '—' : 'Propriétaire')}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{user.announcesCount ?? 0} annonce{(user.announcesCount ?? 0) > 1 ? 's' : ''} active{(user.announcesCount ?? 0) > 1 ? 's' : ''}</div>
                    </td>
                    <td className="px-4 py-4">
                      {isCompany ? (
                        <div className="space-y-0.5">
                          <div className="text-[10px] text-gray-400">RC: {user.commercialRegister || '—'}</div>
                          <div className="text-[10px] text-gray-400">NIF: {user.nif || '—'}</div>
                          <div className="text-[10px] text-gray-400">NIS: {user.nis || '—'}</div>
                          {agreementBadge(user.agreementExpiryDate)}
                        </div>
                      ) : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-4">
                      <DocumentsCell user={user} />
                    </td>
                    <td className="px-4 py-4 text-gray-700 whitespace-nowrap">
                      {user.location ? (
                        <div>
                          <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3 text-gray-400" /> {user.location}</span>
                          {user.locationIsApproximate && (
                            <div className="text-[10px] text-amber-600 mt-0.5" title="Wilaya/commune non renseignées — adresse texte libre saisie par l'utilisateur">Adresse libre (non structurée)</div>
                          )}
                        </div>
                      ) : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusDef.className}`}>
                              {statusDef.label}
                          </span>
                          {user.adminVerified ? (
                              <span className="text-[10px] text-green-600 font-bold">Documents validés</span>
                          ) : (
                              <span className="text-[10px] text-yellow-600 font-bold">Docs en attente</span>
                          )}
                          {user.statusReason && <span className="text-[10px] text-gray-400 max-w-[120px] truncate" title={user.statusReason}>{user.statusReason}</span>}
                        </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 relative">
                        {!user.adminVerified && (
                            <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleValidate(user.id)}
                                title="Valider les documents"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                        )}

                        <div className="relative">
                          <Button size="sm" variant="outline" onClick={() => setStatusMenuFor(statusMenuFor === user.id ? null : user.id)}>
                            <ShieldAlert className="h-4 w-4 mr-1" /> Statut <ChevronDown className="h-3 w-3 ml-1" />
                          </Button>
                          {statusMenuFor === user.id && (
                            <div className="absolute top-full right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-20">
                              {accountStatus !== 'ACTIVE' && (
                                <button onClick={() => handleStatusChange(user.id, 'ACTIVE')} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-green-700 hover:bg-green-50">
                                  <ShieldCheck className="h-4 w-4" /> Réactiver
                                </button>
                              )}
                              {accountStatus !== 'SUSPENDED' && (
                                <button onClick={() => handleStatusChange(user.id, 'SUSPENDED')} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-amber-700 hover:bg-amber-50">
                                  <AlertTriangle className="h-4 w-4" /> Suspendre
                                </button>
                              )}
                              {accountStatus !== 'BLOCKED' && (
                                <button onClick={() => handleStatusChange(user.id, 'BLOCKED')} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-700 hover:bg-red-50">
                                  <ShieldOff className="h-4 w-4" /> Bloquer
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResetPassword(user.id)}
                            title="Changer le mot de passe"
                        >
                          <KeyRound className="h-4 w-4" />
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50 border-red-200"
                            onClick={() => handleDelete(user.id)}
                            title="Supprimer"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Chargement...</div>}>
      <AdminUsersContent />
    </Suspense>
  )
}
