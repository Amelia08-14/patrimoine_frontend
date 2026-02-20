"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, FileText, ExternalLink, Search, Download, RefreshCw } from "lucide-react"

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/admin/users`, {
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
        },
        cache: 'no-store'
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        if (response.status === 401 || response.status === 403) {
            // alert("Accès non autorisé")
            // router.push('/')
        }
      }
    } catch (error) {
      console.error("Failed to fetch users", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
    // Poll every 10 seconds to keep data fresh
    const interval = setInterval(fetchUsers, 10000)
    return () => clearInterval(interval)
  }, [fetchUsers])

  const handleValidate = async (userId: number) => {
    if (!confirm("Valider cet utilisateur ?")) return

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/admin/users/${userId}/validate`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        setUsers(users.filter(u => u.id !== userId))
        alert("Utilisateur validé avec succès")
      } else {
        alert("Erreur lors de la validation")
      }
    } catch (error) {
      alert("Erreur technique")
    }
  }

  const handleDelete = async (userId: number) => {
    if (!confirm("Supprimer cet utilisateur ? Cette action est irréversible.")) return

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        setUsers(users.filter(u => u.id !== userId))
        alert("Utilisateur supprimé avec succès")
      } else {
        alert("Erreur lors de la suppression")
      }
    } catch (error) {
      alert("Erreur technique")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Validation des Utilisateurs</h1>
          <p className="text-gray-500">Gérez les demandes d'inscription des professionnels.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchUsers} title="Actualiser">
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
                <th className="px-6 py-4 font-semibold text-gray-900">Type</th>
                <th className="px-6 py-4 font-semibold text-gray-900">Identité</th>
                <th className="px-6 py-4 font-semibold text-gray-900">Documents</th>
                <th className="px-6 py-4 font-semibold text-gray-900">Date d'inscription</th>
                <th className="px-6 py-4 font-semibold text-gray-900 text-center">Statut</th>
                <th className="px-6 py-4 font-semibold text-gray-900 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Chargement...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Aucune demande.</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      {user.companyName ? (
                          <div>
                              <div className="font-medium text-gray-900">{user.companyName}</div>
                              <div className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-1">Société</div>
                          </div>
                      ) : (
                          <div className="text-xs text-gray-600 font-medium bg-gray-100 px-2 py-0.5 rounded-full inline-block">Particulier</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 font-medium">{user.firstName} {user.lastName}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-500">{user.phone}</div>
                      {user.companyName && (
                          <div className="mt-1 space-y-0.5">
                              <div className="text-[10px] text-gray-400">RC: {user.commercialRegister || '-'}</div>
                              <div className="text-[10px] text-gray-400">Agrément: {user.agreementNumber || '-'}</div>
                          </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {user.rcDocumentUrl && (
                            <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${user.rcDocumentUrl}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors" title="Registre de Commerce">
                                <FileText className="h-4 w-4" />
                            </a>
                        )}
                        {user.agreementDocumentUrl && (
                            <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${user.agreementDocumentUrl}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors" title="Agrément">
                                <FileText className="h-4 w-4" />
                            </a>
                        )}
                        {user.imageUrl && (
                            <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${user.imageUrl}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors" title="Logo">
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                        {user.adminVerified ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Validé
                            </span>
                        ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                En attente
                            </span>
                        )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!user.adminVerified && (
                            <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleValidate(user.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" /> Valider
                            </Button>
                        )}
                        <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600 hover:bg-red-50 border-red-200"
                            onClick={() => handleDelete(user.id)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
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
