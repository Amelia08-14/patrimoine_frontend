"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { User, MapPin, Calendar, CreditCard, Plus } from "lucide-react"

interface UserProfile {
  id: number
  email: string
  firstName: string
  lastName: string
  adminVerified: boolean // Added field
  points: {
    currentPoints: number
  } | null
  announces: any[]
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => {
      if (res.ok) return res.json()
      throw new Error('Unauthorized')
    })
    .then(data => {
      setUser(data)
      setLoading(false)
    })
    .catch(() => {
      localStorage.removeItem('token')
      router.push('/auth/login')
    })
  }, [router])

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Chargement...</div>
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Banner Alert for Unverified Users */}
        {!user.adminVerified && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-md shadow-sm sticky top-[90px] z-40">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <span className="font-bold">Compte en attente de validation.</span> Votre dossier est en cours d'examen par nos administrateurs. 
                  Vous ne pouvez pas encore publier d'annonces ni contacter les annonceurs.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
          <div className="bg-green-600 h-32 sm:h-48"></div>
          <div className="px-4 sm:px-6 pb-6">
            <div className="relative flex items-end -mt-12 sm:-mt-16 mb-6">
              <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full ring-4 ring-white bg-gray-200 flex items-center justify-center text-gray-500 text-4xl font-bold">
                {user.firstName?.[0]?.toUpperCase() || <User />}
              </div>
              <div className="ml-4 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{user.firstName} {user.lastName}</h1>
                <p className="text-gray-500">{user.email}</p>
              </div>
              <div className="ml-auto mb-1 hidden sm:block">
                <Button variant="outline" onClick={() => {
                  localStorage.removeItem('token')
                  router.push('/')
                }}>
                  Se déconnecter
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-gray-100 pt-6">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Crédits disponibles</p>
                  <p className="text-xl font-bold">{user.points?.currentPoints || 0} pts</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Annonces publiées</p>
                  <p className="text-xl font-bold">{user.announces?.length || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Mes Annonces</h2>
          <Button 
            onClick={() => router.push('/deposit')} 
            disabled={!user.adminVerified}
            className={!user.adminVerified ? "opacity-50 cursor-not-allowed" : ""}
            title={!user.adminVerified ? "Compte non validé" : ""}
          >
            <Plus className="h-4 w-4 mr-2" />
            Déposer une annonce
          </Button>
        </div>

        {user.announces && user.announces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user.announces.map((announce) => (
              <div key={announce.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100">
                <div className="h-48 bg-gray-200 relative">
                   {/* Placeholder pour l'image */}
                   <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                      {announce.type}
                   </div>
                   <div className="absolute top-2 left-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                      {announce.status}
                   </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1 truncate">Réf: {announce.reference}</h3>
                  <p className="text-green-600 font-bold text-xl mb-2">{announce.price.toLocaleString()} DA</p>
                  <div className="text-sm text-gray-500 flex items-center mb-4">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(announce.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm">Modifier</Button>
                    <Button variant="destructive" size="sm">Supprimer</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-200">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <Plus className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Aucune annonce</h3>
            <p className="mt-2 text-gray-500">Commencez par déposer votre première annonce.</p>
            <div className="mt-6">
              <Button 
                onClick={() => router.push('/deposit')}
                disabled={!user.adminVerified}
                className={!user.adminVerified ? "opacity-50 cursor-not-allowed" : ""}
              >
                Créer une annonce
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
