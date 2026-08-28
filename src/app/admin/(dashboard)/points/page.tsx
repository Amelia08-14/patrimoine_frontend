"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Coins, Check, X, Loader2, AlertCircle, RefreshCw, User, MapPin, Search, Pencil, Save, Trash2, Plus, FileDown, FileSpreadsheet } from "lucide-react"
import { DATE_PRESETS, todayStr, periodLabel } from "@/lib/datePresets"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

type OfferPack = {
  id: number
  kind: 'POINTS' | 'BOUTIQUE'
  key: string
  title: string
  description: string | null
  price: number
  points: number
  order: number
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
  const [activePreset, setActivePreset] = useState("")
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null)
  const [cities, setCities] = useState<any[]>([])
  const [towns, setTowns] = useState<any[]>([])
  const [processing, setProcessing] = useState<number | null>(null)
  const [toast, setToast] = useState("")
  const [error, setError] = useState("")
  const [packs, setPacks] = useState<OfferPack[]>([])
  const [editingPackId, setEditingPackId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<{ title: string; description: string; price: string; points: string }>({ title: "", description: "", price: "", points: "" })
  const [savingPack, setSavingPack] = useState(false)
  const [deletingPackId, setDeletingPackId] = useState<number | null>(null)
  const [creatingPack, setCreatingPack] = useState(false)
  const [creatingKind, setCreatingKind] = useState<'POINTS' | 'BOUTIQUE' | null>(null)
  const [createForm, setCreateForm] = useState<{ key: string; title: string; description: string; price: string; points: string }>({ key: "", title: "", description: "", price: "", points: "" })

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500) }
  const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('admin_token')}` })

  const loadPacks = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/offer-packs`)
      setPacks(res.data)
    } catch {
      // silencieux : les cartes garderont leur dernier état connu
    }
  }, [])

  useEffect(() => {
    fetch(`${API_URL}/cities`).then((r) => r.json()).then(setCities).catch(() => {})
    loadPacks()
  }, [loadPacks])

  const startEditPack = (pack: OfferPack) => {
    setEditingPackId(pack.id)
    setEditForm({ title: pack.title, description: pack.description || "", price: String(pack.price), points: String(pack.points) })
  }

  const savePack = async (pack: OfferPack) => {
    // Garde-fou : ne jamais écraser une offre publiée avec des champs vides/invalides.
    if (!editForm.title.trim()) { showToast("❌ Le titre est obligatoire"); return }
    const price = Number(editForm.price)
    const points = Number(editForm.points)
    if (!Number.isFinite(price) || price < 0) { showToast("❌ Prix invalide"); return }
    if (!Number.isFinite(points) || points < 0) { showToast("❌ Nombre de points invalide"); return }

    setSavingPack(true)
    try {
      await axios.put(`${API_URL}/admin/offer-packs/${pack.id}`, {
        title: editForm.title.trim(),
        description: editForm.description.trim() || null,
        price,
        points,
      }, { headers: getHeaders() })
      showToast("✅ Offre mise à jour")
      setEditingPackId(null)
      await loadPacks()
    } catch (e: any) {
      showToast("❌ " + (e?.response?.data?.message || "Erreur"))
    } finally {
      setSavingPack(false)
    }
  }

  const deletePack = async (pack: OfferPack) => {
    if (!confirm(`Supprimer l'offre "${pack.title}" ? Cette action est irréversible (l'historique des achats déjà effectués est conservé).`)) return
    setDeletingPackId(pack.id)
    try {
      await axios.delete(`${API_URL}/admin/offer-packs/${pack.id}`, { headers: getHeaders() })
      showToast("✅ Offre supprimée")
      await loadPacks()
    } catch (e: any) {
      showToast("❌ " + (e?.response?.data?.message || "Erreur"))
    } finally {
      setDeletingPackId(null)
    }
  }

  const startCreatePack = (kind: 'POINTS' | 'BOUTIQUE') => {
    setCreatingKind(kind)
    setCreateForm({ key: "", title: "", description: "", price: "", points: "" })
  }

  const createPack = async () => {
    if (!creatingKind) return
    setCreatingPack(true)
    try {
      await axios.post(`${API_URL}/admin/offer-packs`, {
        kind: creatingKind,
        key: createForm.key || createForm.title,
        title: createForm.title,
        description: createForm.description || null,
        price: Number(createForm.price),
        points: Number(createForm.points),
      }, { headers: getHeaders() })
      showToast("✅ Nouvelle offre créée")
      setCreatingKind(null)
      await loadPacks()
    } catch (e: any) {
      showToast("❌ " + (e?.response?.data?.message || "Erreur"))
    } finally {
      setCreatingPack(false)
    }
  }

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

  const applyPreset = (preset: typeof DATE_PRESETS[number]) => {
    setActivePreset(preset.id); setDateFrom(preset.from()); setDateTo(preset.to())
  }
  const clearPeriod = () => { setActivePreset(""); setDateFrom(""); setDateTo("") }

  const exportRows = () => filtered.map((p) => ({
    compte: p.user.companyName || `${p.user.firstName} ${p.user.lastName}`,
    type: p.user.userType === 'SOCIETE' ? 'Professionnel' : 'Particulier',
    offre: p.source === 'BOUTIQUE' ? 'Boutique' : 'Points',
    pack: packs.find((pk) => pk.kind === p.source && pk.key === p.pack)?.title || p.pack,
    points: p.points,
    prix: `${p.price.toLocaleString()} DA`,
    statut: p.status === 'VALIDATED' ? 'Validée' : p.status === 'REJECTED' ? 'Refusée' : 'En attente',
    localisation: p.user.location || '',
    date: new Date(p.createdAt).toLocaleDateString('fr-FR'),
  }))

  const exportExcel = async () => {
    setExporting('excel')
    try {
      const XLSX = await import('xlsx')
      const rows = exportRows()
      const sheet = XLSX.utils.aoa_to_sheet([
        ['Points & Achats — Patrimoine Immobilier'],
        [`Période : ${periodLabel(dateFrom, dateTo)}`],
        [`Généré le ${new Date().toLocaleString('fr-FR')}`],
        [],
        ['Compte', 'Type', 'Offre', 'Pack', 'Points', 'Prix', 'Statut', 'Localisation', 'Date'],
        ...rows.map((r) => [r.compte, r.type, r.offre, r.pack, r.points, r.prix, r.statut, r.localisation, r.date]),
      ])
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, sheet, 'Points & Achats')
      XLSX.writeFile(wb, `points-achats-patrimoine-${todayStr()}.xlsx`)
    } finally { setExporting(null) }
  }

  const exportPDF = async () => {
    setExporting('pdf')
    try {
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')])
      const doc = new jsPDF({ orientation: 'landscape' })
      doc.setFontSize(16); doc.setTextColor(0, 59, 74)
      doc.text('Points & Achats — Patrimoine Immobilier', 14, 18)
      doc.setFontSize(10); doc.setTextColor(120)
      doc.text(`Période : ${periodLabel(dateFrom, dateTo)}`, 14, 25)
      doc.text(`Généré le ${new Date().toLocaleString('fr-FR')}`, 14, 30)
      autoTable(doc, {
        startY: 36,
        head: [['Compte', 'Type', 'Offre', 'Pack', 'Points', 'Prix', 'Statut', 'Localisation', 'Date']],
        body: exportRows().map((r) => [r.compte, r.type, r.offre, r.pack, String(r.points), r.prix, r.statut, r.localisation, r.date]),
        headStyles: { fillColor: [0, 191, 166] },
        styles: { fontSize: 8 },
      })
      doc.save(`points-achats-patrimoine-${todayStr()}.pdf`)
    } finally { setExporting(null) }
  }

  return (
    <div>
      {toast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-medium">{toast}</div>
      )}

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#003B4A] font-brand flex items-center gap-3">
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
          <button onClick={exportExcel} disabled={exporting !== null} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-600 disabled:opacity-60">
            <FileSpreadsheet className="h-4 w-4" /> {exporting === 'excel' ? 'Export...' : 'Excel'}
          </button>
          <button onClick={exportPDF} disabled={exporting !== null} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-600 disabled:opacity-60">
            <FileDown className="h-4 w-4" /> {exporting === 'pdf' ? 'Export...' : 'PDF'}
          </button>
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

          <div className="flex items-center gap-1 flex-wrap">
            <button onClick={clearPeriod} className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${!dateFrom && !dateTo ? 'bg-[#00BFA6] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Tout</button>
            {DATE_PRESETS.map((p) => (
              <button key={p.id} onClick={() => applyPreset(p)} className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${activePreset === p.id ? 'bg-[#00BFA6] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{p.label}</button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <span className="text-xs font-medium">Du</span>
            <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setActivePreset("") }} className="px-2 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium bg-white outline-none" />
            <span className="text-xs font-medium">au</span>
            <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setActivePreset("") }} className="px-2 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium bg-white outline-none" />
          </div>

          <div className="bg-white px-3 py-2 rounded-xl border-2 border-gray-200 flex items-center gap-2 flex-1 min-w-[220px]">
            <Search className="h-4 w-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nom du client ou du professionnel..." className="outline-none text-sm w-full" />
          </div>
        </div>
      </div>

      {/* Offres — modifiables (titre, description, prix, points) */}
      <div className="mb-6">
        <h2 className="text-sm font-bold text-[#003B4A] mb-3">Offres proposées</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {packs
            .filter((p) => (sourceFilter === 'ALL' || p.kind === sourceFilter))
            .map((pack) => {
              const isBoutique = pack.kind === 'BOUTIQUE'
              const isEditing = editingPackId === pack.id
              return (
                <div key={pack.id} className="bg-white rounded-xl border border-gray-100 p-4">
                  {!isEditing ? (
                    <div className="text-center relative">
                      <div className="absolute -top-1 -right-1 flex items-center gap-0.5">
                        <button
                          onClick={() => startEditPack(pack)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#00BFA6]"
                          title="Modifier cette offre"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => deletePack(pack)}
                          disabled={deletingPackId === pack.id}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 disabled:opacity-60"
                          title="Supprimer cette offre"
                        >
                          {deletingPackId === pack.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                      <div className="font-black text-gray-900 text-sm">{pack.title}</div>
                      {pack.description && <p className="text-[11px] text-gray-400 mt-1">{pack.description}</p>}
                      <div className="text-[#00BFA6] font-bold mt-1">{pack.points} pts</div>
                      <div className="text-xs text-gray-400">{pack.price.toLocaleString()} DA{isBoutique ? '/mois' : ''}</div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-left">
                      <input
                        value={editForm.title}
                        onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                        placeholder="Titre"
                        className="w-full text-sm font-bold text-gray-900 outline-none border border-gray-200 rounded-lg p-2 focus:border-[#00BFA6]"
                      />
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                        placeholder="Description (optionnelle)"
                        rows={2}
                        className="w-full text-xs text-gray-900 outline-none border border-gray-200 rounded-lg p-2 focus:border-[#00BFA6]"
                      />
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Prix (DA)</label>
                          <input
                            type="number"
                            value={editForm.price}
                            onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                            className="w-full text-sm font-bold text-gray-900 outline-none border border-gray-200 rounded-lg p-2 focus:border-[#00BFA6]"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Points</label>
                          <input
                            type="number"
                            value={editForm.points}
                            onChange={(e) => setEditForm((f) => ({ ...f, points: e.target.value }))}
                            className="w-full text-sm font-bold text-gray-900 outline-none border border-gray-200 rounded-lg p-2 focus:border-[#00BFA6]"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => savePack(pack)}
                          disabled={savingPack}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#00BFA6] text-white rounded-lg text-xs font-bold hover:bg-[#00908A] disabled:opacity-60 transition-colors"
                        >
                          {savingPack ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Enregistrer
                        </button>
                        <button
                          onClick={() => setEditingPackId(null)}
                          className="px-3 py-1.5 bg-gray-50 text-gray-500 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

          {/* Créer une nouvelle offre */}
          {(sourceFilter === 'ALL' || sourceFilter === 'POINTS') && creatingKind !== 'POINTS' && (
            <button
              onClick={() => startCreatePack('POINTS')}
              className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:border-[#00BFA6] hover:text-[#00BFA6] transition-colors min-h-[110px]"
            >
              <Plus className="h-5 w-5" />
              <span className="text-xs font-bold">Nouveau pack de points</span>
            </button>
          )}
          {(sourceFilter === 'ALL' || sourceFilter === 'BOUTIQUE') && creatingKind !== 'BOUTIQUE' && (
            <button
              onClick={() => startCreatePack('BOUTIQUE')}
              className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:border-[#00BFA6] hover:text-[#00BFA6] transition-colors min-h-[110px]"
            >
              <Plus className="h-5 w-5" />
              <span className="text-xs font-bold">Nouveau pack boutique</span>
            </button>
          )}

          {creatingKind && (
            <div className="bg-white rounded-xl border-2 border-[#00BFA6]/40 p-4">
              <p className="text-xs font-bold text-[#00BFA6] uppercase tracking-wide mb-2">
                Nouveau pack {creatingKind === 'BOUTIQUE' ? 'boutique' : 'de points'}
              </p>
              <div className="space-y-2 text-left">
                <input
                  value={createForm.title}
                  onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Titre (ex. Starter)"
                  className="w-full text-sm font-bold outline-none border border-gray-200 rounded-lg p-2"
                />
                <input
                  value={createForm.key}
                  onChange={(e) => setCreateForm((f) => ({ ...f, key: e.target.value }))}
                  placeholder="Identifiant technique (optionnel, déduit du titre)"
                  className="w-full text-xs outline-none border border-gray-200 rounded-lg p-2 text-gray-500"
                />
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Description (optionnelle)"
                  rows={2}
                  className="w-full text-xs outline-none border border-gray-200 rounded-lg p-2"
                />
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Prix (DA)</label>
                    <input
                      type="number"
                      value={createForm.price}
                      onChange={(e) => setCreateForm((f) => ({ ...f, price: e.target.value }))}
                      className="w-full text-sm outline-none border border-gray-200 rounded-lg p-2"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Points</label>
                    <input
                      type="number"
                      value={createForm.points}
                      onChange={(e) => setCreateForm((f) => ({ ...f, points: e.target.value }))}
                      className="w-full text-sm outline-none border border-gray-200 rounded-lg p-2"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={createPack}
                    disabled={creatingPack || !createForm.title || !createForm.price || !createForm.points}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#00BFA6] text-white rounded-lg text-xs font-bold hover:bg-[#00908A] disabled:opacity-60 transition-colors"
                  >
                    {creatingPack ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />} Créer
                  </button>
                  <button
                    onClick={() => setCreatingKind(null)}
                    className="px-3 py-1.5 bg-gray-50 text-gray-500 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
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
          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <span>#</span><span>Compte</span><span>Pack</span><span>Prix</span><span>Date</span><span>Actions</span>
            </div>
            <div className="divide-y divide-gray-50">
              {filtered.map((p) => {
                const isBoutique = p.source === 'BOUTIQUE'
                const packDef = packs.find((pk) => pk.kind === p.source && pk.key === p.pack)
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
                        {packDef?.title || p.pack}
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
            </div>
          </div>
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
