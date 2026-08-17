"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, FileText, ExternalLink, Search, RefreshCw, AlertTriangle, ShieldOff, ShieldCheck, ShieldAlert, ChevronDown, KeyRound } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Actif", className: "bg-green-100 text-green-800" },
  SUSPENDED: { label: "Suspendu", className: "bg-amber-100 text-amber-800" },
  BLOCKED: { label: "Bloqué", className: "bg-red-100 text-red-800" },
}

function agreementBadge(expiry?: string | null) {
  if (!expiry) return null
  const days = Math.ceil((new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (days < 0) return <span className="text-[10px] font-bold text-red-600">Expiré le {new Date(expiry).toLocaleDateString()}</span>
  if (days <= 30) return <span className="text-[10px] font-bold text-amber-600">Expire dans {days}j</span>
  return <span className="text-[10px] text-gray-400">Valide jusqu'au {new Date(expiry).toLocaleDateString()}</span>
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
  const [typeFilter, setTypeFilter] = useState<"ALL" | "PARTICULIER" | "SOCIETE">("ALL")
  const [statusMenuFor, setStatusMenuFor] = useState<number | null>(null)

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
  }, [search, wilaya, commune])

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

  const handleStatusChange = async (userId: number, status: string) => {
    let reason: string | null = null
    if (status !== 'ACTIVE') {
      reason = prompt(`Motif (${status === 'SUSPENDED' ? 'suspension' : 'blocage'}) — optionnel`) || undefined as any
    }
    setStatusMenuFor(null)
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${API_URL}/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason }),
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

  const filteredUsers = typeFilter === "ALL" ? users : users.filter(u => (typeFilter === "SOCIETE" ? !!u.companyName : !u.companyName))

  const docLink = (url: string | null | undefined, label: string) => url ? (
    <a href={`${API_URL}${url}`} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors" title={label}>
        <FileText className="h-3.5 w-3.5" />
    </a>
  ) : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Utilisateurs & Conformité</h1>
          <p className="text-gray-500">Annuaire global, validation documentaire et statuts de compte.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchUsers} title="Actualiser">
            <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-0.5">
          {(["ALL", "PARTICULIER", "SOCIETE"] as const).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${typeFilter === t ? 'bg-[#00BFA6] text-white' : 'text-gray-500 hover:text-gray-800'}`}>
              {t === "ALL" ? "Tous" : t === "PARTICULIER" ? "Particuliers" : "Professionnels"}
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

        <div className="bg-white px-3 py-2 rounded-xl border-2 border-gray-200 flex items-center gap-2 flex-1 min-w-[220px]">
            <Search className="h-4 w-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nom, email, société, téléphone..." className="outline-none text-sm w-full" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-4 font-semibold text-gray-900">Type</th>
                <th className="px-4 py-4 font-semibold text-gray-900">Identité</th>
                <th className="px-4 py-4 font-semibold text-gray-900">Conformité</th>
                <th className="px-4 py-4 font-semibold text-gray-900">Inscription</th>
                <th className="px-4 py-4 font-semibold text-gray-900 text-center">Documents</th>
                <th className="px-4 py-4 font-semibold text-gray-900 text-center">Compte</th>
                <th className="px-4 py-4 font-semibold text-gray-900 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">Chargement...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">Aucun utilisateur.</td></tr>
              ) : (
                filteredUsers.map((user) => {
                  const status = user.accountStatus || 'ACTIVE'
                  const statusDef = STATUS_LABELS[status] || STATUS_LABELS.ACTIVE
                  return (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors align-top">
                    <td className="px-4 py-4">
                      {user.companyName ? (
                          <div>
                              <div className="font-medium text-gray-900">{user.companyName}</div>
                              <div className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-1">Société</div>
                          </div>
                      ) : (
                          <div className="text-xs text-gray-600 font-medium bg-gray-100 px-2 py-0.5 rounded-full inline-block">Particulier</div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-gray-900 font-medium">{user.firstName} {user.lastName}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-500">{user.phone}</div>
                    </td>
                    <td className="px-4 py-4">
                      {user.companyName ? (
                        <div className="space-y-0.5">
                          <div className="text-[10px] text-gray-400">RC: {user.commercialRegister || '—'}</div>
                          <div className="text-[10px] text-gray-400">NIF: {user.nif || '—'}</div>
                          <div className="text-[10px] text-gray-400">NIS: {user.nis || '—'}</div>
                          {agreementBadge(user.agreementExpiryDate)}
                        </div>
                      ) : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-4 text-gray-500 whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1.5 justify-center flex-wrap max-w-[140px]">
                        {docLink(user.rcDocumentUrl, "Registre de Commerce")}
                        {docLink(user.agreementDocumentUrl, "Agrément")}
                        {docLink(user.nifDocumentUrl, "NIF")}
                        {docLink(user.nisDocumentUrl, "NIS")}
                        {docLink(user.inapiDocumentUrl, "Justificatif INAPI")}
                        {user.imageUrl && (
                            <a href={`${API_URL}${user.imageUrl}`} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors" title="Logo">
                                <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                        )}
                      </div>
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
                              {status !== 'ACTIVE' && (
                                <button onClick={() => handleStatusChange(user.id, 'ACTIVE')} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-green-700 hover:bg-green-50">
                                  <ShieldCheck className="h-4 w-4" /> Réactiver
                                </button>
                              )}
                              {status !== 'SUSPENDED' && (
                                <button onClick={() => handleStatusChange(user.id, 'SUSPENDED')} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-amber-700 hover:bg-amber-50">
                                  <AlertTriangle className="h-4 w-4" /> Suspendre
                                </button>
                              )}
                              {status !== 'BLOCKED' && (
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
