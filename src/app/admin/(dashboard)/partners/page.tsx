"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, RefreshCw, Building, Hotel, PartyPopper, Warehouse, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

type Pole = "ALL" | "IMMOBILIER" | "HOTELLERIE" | "EVENEMENTIEL" | "ENTREPOSAGE"
type StatusFilter = "ALL" | "ACTIVE" | "PENDING" | "SUSPENDED"
type AccountTypeFilter = "ALL" | "PRO" | "PARTICULIER"

const POLE_TABS: { id: Pole; label: string; icon: typeof Building }[] = [
  { id: "ALL", label: "Tous les pôles", icon: LayoutGrid },
  { id: "IMMOBILIER", label: "Immobilier", icon: Building },
  { id: "HOTELLERIE", label: "Hôtellerie & Hébergement", icon: Hotel },
  { id: "EVENEMENTIEL", label: "Événementiel", icon: PartyPopper },
  { id: "ENTREPOSAGE", label: "Entreposage & Stockage", icon: Warehouse },
]

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

const SUB_CATEGORY_LABELS: Record<string, string> = {
  AGENCE_IMMOBILIERE: "Agence Immobilière",
  PROMOTEUR_IMMOBILIER: "Promoteur Immobilier",
  ADMINISTRATEUR_BIENS: "Administrateur de biens",
  AUTRES_PROFESSIONNELS: "Autres Professionnels",
  HOTELLERIE_HEBERGEMENT: "Hôtellerie & Hébergement",
  HOTEL: "Hôtel",
  COMPLEXE_TOURISTIQUE: "Complexe Touristique",
  VILLAGE_VACANCES: "Village de vacances",
  APPART_HOTEL: "Appart Hôtel",
  RESIDENCE_HOTELIERE: "Résidence Hôtelière",
  MOTEL: "Motel",
  RELAIS_ROUTIER: "Relais routier",
  CAMPING_TOURISTIQUE: "Camping Touristique",
  AUTRES_STRUCTURES: "Autres Structures hôtelières",
  SALLE_DES_FETES: "Salle des fêtes",
  SALLES_DINATOIRES: "Salles Dînatoires",
  SALLE_FORMATION: "Salle de formation",
  SALLE_CONFERENCE: "Salle de conférence",
  AUTRES_EVENEMENTIEL: "Autres espaces événementiels",
  ENTREPOSAGE_FRIGORIFIQUE: "Entrepôt Frigorifique",
  ENTREPOSAGE_NON_FRIGORIFIQUE: "Entrepôt non Frigorifique",
  AUTRES_ENTREPOSAGE_STOCKAGE: "Autre espace de stockage",
}

const POLE_LABELS: Record<string, string> = {
  IMMOBILIER: "Immobilier",
  HOTELLERIE: "Hôtellerie",
  EVENEMENTIEL: "Événementiel",
  ENTREPOSAGE: "Entreposage",
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Actif", className: "bg-green-100 text-green-800" },
  SUSPENDED: { label: "Suspendu", className: "bg-amber-100 text-amber-800" },
  BLOCKED: { label: "Bloqué", className: "bg-red-100 text-red-800" },
}

interface Partner {
  id: number
  firstName: string | null
  lastName: string | null
  email: string
  companyName: string | null
  userType: "PARTICULIER" | "SOCIETE"
  companyActivity: string | null
  pole: string | null
  location: string | null
  announcesCount: number
  accountStatus: keyof typeof STATUS_BADGE
  adminVerified: boolean
  phone: string | null
}

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<StatusFilter>("ALL")
  const [accountType, setAccountType] = useState<AccountTypeFilter>("ALL")
  const [pole, setPole] = useState<Pole>("ALL")

  const fetchPartners = useCallback(async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (status !== 'ALL') params.set('status', status)
      if (accountType !== 'ALL') params.set('accountType', accountType)
      if (pole !== 'ALL') params.set('pole', pole)
      const response = await fetch(`${API_URL}/admin/partners?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      if (response.ok) setPartners(await response.json())
    } catch (error) {
      console.error("Failed to fetch partners", error)
    } finally {
      setIsLoading(false)
    }
  }, [search, status, accountType, pole])

  useEffect(() => {
    fetchPartners()
    const interval = setInterval(fetchPartners, 15000)
    return () => clearInterval(interval)
  }, [fetchPartners])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Partenaires & Activités</h1>
          <p className="text-gray-500">Vue segmentée par pôle d'activité — Immobilier, Hôtellerie, Événementiel, Entreposage.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchPartners} title="Actualiser">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Recherche globale */}
      <div className="bg-white px-3 py-2 rounded-xl border-2 border-gray-200 flex items-center gap-2">
        <Search className="h-4 w-4 text-gray-400 shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nom, prénom, raison sociale, email, téléphone ou numéro d'identification..."
          className="outline-none text-sm w-full"
        />
      </div>

      {/* Filtres transversaux : statut & type de compte */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-0.5 flex-wrap">
          {STATUS_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setStatus(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${status === t.id ? 'bg-[#00BFA6] text-white' : 'text-gray-500 hover:text-gray-800'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-0.5">
          {ACCOUNT_TYPE_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setAccountType(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${accountType === t.id ? 'bg-[#003B4A] text-white' : 'text-gray-500 hover:text-gray-800'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Segmentation par pôle d'activité */}
      <div className="flex flex-wrap gap-2">
        {POLE_TABS.map((t) => {
          const Icon = t.icon
          const isActive = pole === t.id
          return (
            <button
              key={t.id}
              onClick={() => setPole(t.id)}
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

      {/* Tableau synthétique de gestion */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-4 font-semibold text-gray-900">Nom / Utilisateur</th>
                <th className="px-4 py-4 font-semibold text-gray-900">Pôle d'Activité</th>
                <th className="px-4 py-4 font-semibold text-gray-900">Sous-Catégorie</th>
                <th className="px-4 py-4 font-semibold text-gray-900">Type de Compte</th>
                <th className="px-4 py-4 font-semibold text-gray-900">Localisation</th>
                <th className="px-4 py-4 font-semibold text-gray-900">Volume / Capacité</th>
                <th className="px-4 py-4 font-semibold text-gray-900">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">Chargement...</td></tr>
              ) : partners.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">Aucun partenaire.</td></tr>
              ) : (
                partners.map((p) => {
                  const statusDef = STATUS_BADGE[p.accountStatus] || STATUS_BADGE.ACTIVE
                  const isPro = p.userType === 'SOCIETE'
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900">{p.companyName || `${p.firstName || ''} ${p.lastName || ''}`.trim()}</div>
                        <div className="text-xs text-gray-500">{p.email}</div>
                      </td>
                      <td className="px-4 py-4 text-gray-700">{p.pole ? POLE_LABELS[p.pole] : <span className="text-gray-300">—</span>}</td>
                      <td className="px-4 py-4 text-gray-700">
                        {p.companyActivity ? (SUB_CATEGORY_LABELS[p.companyActivity] || p.companyActivity) : (isPro ? '—' : 'Propriétaire')}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isPro ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                          {isPro ? '🟢 Pro (B2B)' : '🔵 Particulier'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-700 whitespace-nowrap">{p.location || <span className="text-gray-300">—</span>}</td>
                      <td className="px-4 py-4 text-gray-700 whitespace-nowrap">{p.announcesCount} annonce{p.announcesCount > 1 ? 's' : ''} active{p.announcesCount > 1 ? 's' : ''}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex w-fit items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusDef.className}`}>
                            {statusDef.label}
                          </span>
                          {!p.adminVerified && <span className="text-[10px] text-yellow-600 font-bold">Docs en attente</span>}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
