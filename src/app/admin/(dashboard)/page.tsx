"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Users, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react"

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({
    pendingAnnounces: 0,
    totalUsers: 0
  })

  useEffect(() => {
    // Check admin access mock
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
    }
    // Fetch stats here
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Administration</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 p-3 rounded-lg text-orange-600">
                <AlertCircle className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-gray-500">En attente</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">--</h3>
            <p className="text-sm text-gray-500 mt-1">Annonces à valider</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                <Users className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-gray-500">Utilisateurs</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">--</h3>
            <p className="text-sm text-gray-500 mt-1">Inscrits sur la plateforme</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg text-green-600">
                <FileText className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-gray-500">Total Annonces</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">--</h3>
            <p className="text-sm text-gray-500 mt-1">Actives sur le site</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Actions Rapides</h2>
            <div className="space-y-4">
              <Button className="w-full justify-start text-left" variant="outline">
                <CheckCircle className="mr-2 h-4 w-4" /> Valider les annonces en attente
              </Button>
              <Button className="w-full justify-start text-left" variant="outline">
                <Users className="mr-2 h-4 w-4" /> Gérer les utilisateurs
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
