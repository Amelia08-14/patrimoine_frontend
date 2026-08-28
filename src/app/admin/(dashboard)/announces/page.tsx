"use client"

import { useState, useEffect, useCallback, Suspense, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Eye, MapPin, Building, Search, RefreshCw, Star, StarOff } from "lucide-react"
import { PROPERTY_TYPES } from "@/data/propertyTypes"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Regroupement des catégories de biens pour le filtre "Type d'immobilier" du dashboard admin
const PROPERTY_FILTER_CATEGORIES: { id: string; label: string; categoryIds: string[] }[] = [
  { id: "RESIDENTIEL", label: "Résidentiel", categoryIds: ["RESIDENTIEL"] },
  { id: "INDUSTRIEL", label: "Industriel", categoryIds: ["INDUSTRIEL"] },
  { id: "HEBERGEMENT_SEJOUR", label: "Hébergement et séjours", categoryIds: ["HOTELIER", "HEBERGEMENT"] },
  { id: "BUREAUX_COMMERCES", label: "Bureaux et commerce", categoryIds: ["BUREAUX_COMMERCES"] },
  { id: "TERRAIN_FONCIER", label: "Terrain et foncier", categoryIds: ["TERRAIN_FONCIER"] },
]

const PROPERTY_TYPE_TO_CATEGORY: Record<string, string> = Object.fromEntries(
  PROPERTY_TYPES.map((pt) => [pt.id, pt.categoryId])
)

// Sous-catégories (types de bien précis) disponibles pour une catégorie du filtre "Type d'immobilier"
function propertyTypesForFilterCategory(categoryIds: string[]) {
  return PROPERTY_TYPES.filter((pt) => categoryIds.includes(pt.categoryId))
}

const TRANSACTION_FILTERS: { id: string; label: string; types?: string[] }[] = [
  { id: "ALL", label: "Tous" },
  { id: "LOCATION", label: "Location", types: ["RENTAL", "HOLIDAY_RENTAL"] },
  { id: "VENTE", label: "Vente", types: ["SALE"] },
]

// Pôles d'activité professionnels (annonceurs pro) — synchronisé avec ACTIVITY_POLES côté backend
const ACTIVITY_POLE_FILTERS = [
  { id: "ALL", label: "Toutes activités" },
  { id: "IMMOBILIER", label: "Activité immobilière" },
  { id: "HOTELLERIE", label: "Activité touristique et hébergement" },
  { id: "EVENEMENTIEL", label: "Activité évènementiel" },
  { id: "ENTREPOSAGE", label: "Activité de stockage" },
] as const

function AdminAnnouncesContent() {
  const searchParams = useSearchParams()
  const [announces, setAnnounces] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || "")
  const [wilaya, setWilaya] = useState("")
  const [commune, setCommune] = useState("")
  const [cities, setCities] = useState<any[]>([])
  const [towns, setTowns] = useState<any[]>([])
  const [statusFilter, setStatusFilter] = useState<"ALL" | "WAITING_VALIDATION" | "VALIDATED" | "REJECTED">("WAITING_VALIDATION")
  const [propertyCategoryFilter, setPropertyCategoryFilter] = useState<string>("ALL")
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>("ALL")
  const [transactionFilter, setTransactionFilter] = useState<string>("ALL")
  const [accountTypeFilter, setAccountTypeFilter] = useState<"ALL" | "PARTICULIER" | "SOCIETE">("ALL")
  const [activityPoleFilter, setActivityPoleFilter] = useState<string>("ALL")

  useEffect(() => {
    fetch(`${API_URL}/cities`).then((r) => r.json()).then(setCities).catch(() => {})
  }, [])

  useEffect(() => {
    if (!wilaya) { setTowns([]); return }
    fetch(`${API_URL}/cities/${wilaya}/towns`).then((r) => r.json()).then(setTowns).catch(() => {})
  }, [wilaya])

  const fetchAnnounces = useCallback(async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (wilaya) params.set('wilaya', wilaya)
      if (commune) params.set('commune', commune)
      const response = await fetch(`${API_URL}/admin/announces?${params.toString()}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
        },
        cache: 'no-store'
      })
      if (response.ok) {
        const data = await response.json()
        setAnnounces(data)
      }
    } catch (error) {
      console.error("Failed to fetch announces", error)
    } finally {
      setIsLoading(false)
    }
  }, [search, wilaya, commune])

  useEffect(() => {
    fetchAnnounces()
    const interval = setInterval(fetchAnnounces, 10000)
    return () => clearInterval(interval)
  }, [fetchAnnounces])

  const handleUpdateStatus = async (id: number, status: string) => {
    if (!confirm(`Confirmer l'action : ${status} ?`)) return

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${API_URL}/admin/announces/${id}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        setAnnounces(announces.map(a => a.id === id ? { ...a, status } : a))
      } else {
        alert("Erreur lors de la mise à jour")
      }
    } catch (error) {
      alert("Erreur technique")
    }
  }

  const handleFeature = async (id: number) => {
    const input = prompt("Durée de mise en avant (en jours) :", "30")
    if (input === null) return
    const durationDays = Number(input) || 30
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${API_URL}/admin/announces/${id}/feature`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ durationDays }),
      })
      if (response.ok) {
        const updated = await response.json()
        setAnnounces(announces.map(a => a.id === id ? { ...a, ...updated } : a))
      } else {
        alert("Erreur lors de la mise en avant")
      }
    } catch {
      alert("Erreur technique")
    }
  }

  const handleUnfeature = async (id: number) => {
    if (!confirm("Retirer cette annonce de la première page ?")) return
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${API_URL}/admin/announces/${id}/unfeature`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (response.ok) {
        const updated = await response.json()
        setAnnounces(announces.map(a => a.id === id ? { ...a, ...updated } : a))
      } else {
        alert("Erreur lors du retrait")
      }
    } catch {
      alert("Erreur technique")
    }
  }

  const isFeatured = (a: any) => a.featuredUntil && new Date(a.featuredUntil) > new Date()

  // Réinitialise le sous-filtre "Type d'activité" quand l'annonceur n'est plus "Professionnel"
  useEffect(() => {
    if (accountTypeFilter !== "SOCIETE") setActivityPoleFilter("ALL")
  }, [accountTypeFilter])

  const filtered = useMemo(() => {
    const transactionDef = TRANSACTION_FILTERS.find(t => t.id === transactionFilter)
    const propertyCategoryDef = PROPERTY_FILTER_CATEGORIES.find(c => c.id === propertyCategoryFilter)

    return announces.filter((a) => {
      if (statusFilter !== "ALL" && a.status !== statusFilter) return false

      if (propertyTypeFilter !== "ALL") {
        if (a.property?.propertyType !== propertyTypeFilter) return false
      } else if (propertyCategoryDef) {
        const catId = PROPERTY_TYPE_TO_CATEGORY[a.property?.propertyType]
        if (!catId || !propertyCategoryDef.categoryIds.includes(catId)) return false
      }

      if (transactionDef?.types && !transactionDef.types.includes(a.type)) return false

      if (accountTypeFilter !== "ALL" && (a.user?.userType || "PARTICULIER") !== accountTypeFilter) return false

      if (accountTypeFilter === "SOCIETE" && activityPoleFilter !== "ALL" && a.user?.pole !== activityPoleFilter) return false

      return true
    })
  }, [announces, statusFilter, propertyCategoryFilter, propertyTypeFilter, transactionFilter, accountTypeFilter, activityPoleFilter])

  const pendingCount = announces.filter(a => a.status === 'WAITING_VALIDATION').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#003B4A] font-brand flex items-center gap-3">
            Validation des Annonces
            {pendingCount > 0 && (
              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">{pendingCount} en attente</span>
            )}
          </h1>
          <p className="text-gray-500">Examinez, validez ou rejetez les annonces publiées.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAnnounces} title="Actualiser">
            <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-0.5">
          {([
            { id: "WAITING_VALIDATION", label: "En attente" },
            { id: "ALL", label: "Toutes" },
            { id: "VALIDATED", label: "Validées" },
            { id: "REJECTED", label: "Rejetées" },
          ] as const).map(s => (
            <button key={s.id} onClick={() => setStatusFilter(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === s.id ? 'bg-[#00BFA6] text-white' : 'text-gray-500 hover:text-gray-800'}`}>
              {s.label}
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
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Référence, titre..." className="outline-none text-sm w-full" />
        </div>
      </div>

      {/* Filtres avancés : transaction, annonceur */}
      <div className="flex flex-wrap items-center gap-2">
        <select value={transactionFilter} onChange={(e) => setTransactionFilter(e.target.value)} className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium bg-white outline-none">
          {TRANSACTION_FILTERS.map((t) => <option key={t.id} value={t.id}>{t.id === "ALL" ? "Type & Prix : Tous" : t.label}</option>)}
        </select>

        <select value={accountTypeFilter} onChange={(e) => setAccountTypeFilter(e.target.value as "ALL" | "PARTICULIER" | "SOCIETE")} className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium bg-white outline-none">
          <option value="ALL">Annonceur : Tous</option>
          <option value="PARTICULIER">Particulier</option>
          <option value="SOCIETE">Professionnel</option>
        </select>

        {accountTypeFilter === "SOCIETE" && (
          <select value={activityPoleFilter} onChange={(e) => setActivityPoleFilter(e.target.value)} className="px-3 py-2 border-2 border-[#00BFA6]/40 rounded-xl text-sm font-medium bg-[#E6F8F6] outline-none">
            {ACTIVITY_POLE_FILTERS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        )}
      </div>

      {/* Type d'immobilier — catégories cliquables */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setPropertyCategoryFilter("ALL"); setPropertyTypeFilter("ALL") }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${propertyCategoryFilter === "ALL" ? 'bg-[#00BFA6] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}
        >
          Toutes catégories
        </button>
        {PROPERTY_FILTER_CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => { setPropertyCategoryFilter(c.id); setPropertyTypeFilter("ALL") }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${propertyCategoryFilter === c.id ? 'bg-[#00BFA6] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Sous-catégories (types de bien précis) de la catégorie sélectionnée */}
      {propertyCategoryFilter !== "ALL" && (
        <div className="flex flex-wrap gap-2 pl-1">
          <button
            onClick={() => setPropertyTypeFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${propertyTypeFilter === "ALL" ? 'bg-[#003B4A] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}
          >
            Tous les types
          </button>
          {propertyTypesForFilterCategory(PROPERTY_FILTER_CATEGORIES.find((c) => c.id === propertyCategoryFilter)?.categoryIds ?? []).map((pt) => (
            <button
              key={pt.id}
              onClick={() => setPropertyTypeFilter(pt.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${propertyTypeFilter === pt.id ? 'bg-[#003B4A] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}
            >
              {pt.label}
            </button>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-900">Bien</th>
                <th className="px-6 py-4 font-semibold text-gray-900">Type & Prix</th>
                <th className="px-6 py-4 font-semibold text-gray-900">Annonceur</th>
                <th className="px-6 py-4 font-semibold text-gray-900">Localisation</th>
                <th className="px-6 py-4 font-semibold text-gray-900 text-center">Statut</th>
                <th className="px-6 py-4 font-semibold text-gray-900 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Chargement...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Aucune annonce.</td></tr>
              ) : (
                filtered.map((announce) => (
                  <tr key={announce.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        {announce.title || announce.property?.propertyType || 'Bien immobilier'}
                        {isFeatured(announce) && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                            <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> À la une
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">ID #{announce.id} — Réf. {announce.reference}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-1">
                        {announce.type === 'SALE' ? 'Vente' : 'Location'}
                      </div>
                      <div className="font-bold text-gray-900">{announce.price?.toLocaleString()} DZD</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{announce.user?.companyName || `${announce.user?.firstName} ${announce.user?.lastName}`}</div>
                      <div className="text-xs text-gray-500">{announce.user?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-1 text-gray-600">
                         <MapPin className="h-3 w-3" />
                         {announce.property?.address?.town?.nameFr || announce.property?.address?.street}
                       </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                        {announce.status === 'VALIDATED' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Validé
                            </span>
                        )}
                        {announce.status === 'WAITING_VALIDATION' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                En attente
                            </span>
                        )}
                        {announce.status === 'REJECTED' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Rejeté
                            </span>
                        )}
                        {announce.status === 'DRAFT' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Brouillon
                            </span>
                        )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a href={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/announces/${announce.id}`} target="_blank" rel="noopener noreferrer">
                          <Button
                              size="sm"
                              variant="outline"
                              className="text-gray-600 border-gray-200"
                              title="Voir l'annonce"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </a>
                        {announce.status !== 'VALIDATED' && (
                            <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleUpdateStatus(announce.id, 'VALIDATED')}
                            >
                            <CheckCircle className="h-4 w-4 mr-1" /> Valider
                            </Button>
                        )}
                        {announce.status !== 'REJECTED' && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:bg-red-50 border-red-200"
                                onClick={() => handleUpdateStatus(announce.id, 'REJECTED')}
                            >
                            <XCircle className="h-4 w-4" />
                            </Button>
                        )}
                        {isFeatured(announce) ? (
                            <Button
                                size="sm"
                                variant="outline"
                                className="text-amber-600 hover:bg-amber-50 border-amber-200"
                                onClick={() => handleUnfeature(announce.id)}
                                title="Retirer de la première page"
                            >
                              <StarOff className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                variant="outline"
                                className="text-amber-600 hover:bg-amber-50 border-amber-200"
                                onClick={() => handleFeature(announce.id)}
                                title="Mettre en première page"
                            >
                              <Star className="h-4 w-4" />
                            </Button>
                        )}
                      </div>
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

export default function AdminAnnouncesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Chargement...</div>}>
      <AdminAnnouncesContent />
    </Suspense>
  )
}
