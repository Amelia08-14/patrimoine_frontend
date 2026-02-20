"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Eye, MapPin, Building, Search, RefreshCw } from "lucide-react"

export default function AdminAnnouncesPage() {
  const [announces, setAnnounces] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchAnnounces = useCallback(async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/admin/announces`, {
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
  }, [])

  useEffect(() => {
    fetchAnnounces()
    // Poll every 10 seconds
    const interval = setInterval(fetchAnnounces, 10000)
    return () => clearInterval(interval)
  }, [fetchAnnounces])

  const handleUpdateStatus = async (id: number, status: string) => {
    if (!confirm(`Confirmer l'action : ${status} ?`)) return

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/admin/announces/${id}/status`, {
        method: 'PATCH',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        setAnnounces(announces.map(a => a.id === id ? { ...a, status } : a))
        alert("Statut mis à jour avec succès")
      } else {
        alert("Erreur lors de la mise à jour")
      }
    } catch (error) {
      alert("Erreur technique")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Validation des Annonces</h1>
          <p className="text-gray-500">Examinez et validez les nouvelles annonces.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchAnnounces} title="Actualiser">
                <RefreshCw className="h-4 w-4" />
            </Button>
            <div className="bg-white p-2 rounded-lg border border-gray-200 flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-400" />
                <input placeholder="Rechercher..." className="outline-none text-sm" />
            </div>
        </div>
      </div>

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
              ) : announces.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Aucune annonce.</td></tr>
              ) : (
                announces.map((announce) => (
                  <tr key={announce.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        {announce.property?.propertyType || 'Bien immobilier'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-1">{announce.property?.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-1">
                        {announce.type}
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
                        <Button 
                            size="sm" 
                            variant="outline"
                            className="text-gray-600 border-gray-200"
                            title="Voir les détails"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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
