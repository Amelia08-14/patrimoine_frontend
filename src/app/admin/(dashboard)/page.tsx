"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Users, FileText, CheckCircle, AlertCircle, User, Briefcase, Building2, Hotel, PartyPopper, Warehouse, RefreshCw } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const ACTIVITY_LABELS: Record<string, { label: string; icon: typeof Building2 }> = {
  IMMOBILIER: { label: "Activité immobilière", icon: Building2 },
  HOTELLERIE: { label: "Activité touristique et hébergement", icon: Hotel },
  EVENEMENTIEL: { label: "Activité évènementiel", icon: PartyPopper },
  ENTREPOSAGE: { label: "Activité de stockage", icon: Warehouse },
  NON_CLASSE: { label: "Non classé", icon: Briefcase },
}

interface DashboardStats {
  pendingAnnounces: number
  totalOnlineAnnounces: number
  totalParticuliers: number
  totalProfessionnels: number
  professionnelsByActivity: Record<string, number>
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${API_URL}/admin/dashboard-stats`, {
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
  }, [])

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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
          <Button variant="outline" size="sm" onClick={loadStats} title="Actualiser">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Annonces */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 p-3 rounded-lg text-orange-600">
                <AlertCircle className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-gray-500">En attente</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{fmt(stats?.pendingAnnounces)}</h3>
            <p className="text-sm text-gray-500 mt-1">Annonces à valider</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg text-green-600">
                <FileText className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-gray-500">Total Annonces</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{fmt(stats?.totalOnlineAnnounces)}</h3>
            <p className="text-sm text-gray-500 mt-1">Annonces en ligne (validées)</p>
          </div>
        </div>

        {/* Inscriptions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                <User className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-gray-500">Particuliers</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{fmt(stats?.totalParticuliers)}</h3>
            <p className="text-sm text-gray-500 mt-1">Comptes particuliers inscrits</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-[#E6F8F6] p-3 rounded-lg text-[#00908A]">
                <Briefcase className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-gray-500">Professionnels</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{fmt(stats?.totalProfessionnels)}</h3>
            <p className="text-sm text-gray-500 mt-1">Comptes professionnels inscrits</p>
          </div>
        </div>

        {/* Répartition des professionnels par type d'activité */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Type de professionnel</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(ACTIVITY_LABELS).filter(([id]) => id !== 'NON_CLASSE' || (stats?.professionnelsByActivity?.NON_CLASSE ?? 0) > 0).map(([id, def]) => {
              const Icon = def.icon
              return (
                <div key={id} className="border border-gray-100 rounded-xl p-4 flex items-center gap-3">
                  <div className="bg-gray-100 p-2.5 rounded-lg text-gray-600 shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-900">{fmt(stats?.professionnelsByActivity?.[id])}</div>
                    <div className="text-xs text-gray-500">{def.label}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Actions Rapides</h2>
            <div className="space-y-4">
              <Button className="w-full justify-start text-left" variant="outline" onClick={() => router.push('/admin/announces')}>
                <CheckCircle className="mr-2 h-4 w-4" /> Valider les annonces en attente
              </Button>
              <Button className="w-full justify-start text-left" variant="outline" onClick={() => router.push('/admin/users')}>
                <Users className="mr-2 h-4 w-4" /> Gérer les utilisateurs
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
