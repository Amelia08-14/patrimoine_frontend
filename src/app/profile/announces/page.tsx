"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Calendar, MapPin, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Announce {
  id: number
  reference: string
  type: string
  price: number
  status: string
  createdAt: string
  property: {
    address: {
      town: {
        nameFr: string
        city: {
          nameFr: string
        }
      }
    }
    images: { url: string }[]
  }
}

export default function MyAnnouncesPage() {
  const router = useRouter()
  const [announces, setAnnounces] = useState<Announce[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnnounces = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/auth/login')
          return
        }
        
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/announces/user/my-announces`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        setAnnounces(res.data)
      } catch (error) {
        console.error("Error fetching announces", error)
      } finally {
        setLoading(false)
      }
    }
    fetchAnnounces()
  }, [router])

  if (loading) return <div className="p-8 text-center">Chargement...</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Mes Annonces</h1>

      {announces.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
            <p className="text-gray-500 mb-4">Vous n'avez pas encore déposé d'annonce.</p>
            <Button onClick={() => router.push('/deposit')} className="bg-[#00BFA6]">
                Déposer une annonce
            </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {announces.map(ad => (
                <div key={ad.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 group hover:shadow-lg transition-shadow">
                    <div className="h-48 bg-gray-200 relative overflow-hidden">
                        {ad.property?.images?.[0] ? (
                            <img 
                                src={ad.property.images[0].url.startsWith('http') ? ad.property.images[0].url : `http://localhost:8000/${ad.property.images[0].url}`} 
                                alt="Property" 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">Pas d'image</div>
                        )}
                        <div className="absolute top-2 right-2 bg-white px-2 py-1 text-xs font-bold rounded shadow">
                            {ad.type === 'SALE' ? 'Vente' : 'Location'}
                        </div>
                        <div className={`absolute top-2 left-2 px-2 py-1 text-xs font-bold rounded shadow text-white
                            ${ad.status === 'VALIDATED' ? 'bg-green-500' : 
                              ad.status === 'WAITING_VALIDATION' ? 'bg-orange-500' : 'bg-red-500'}`}>
                            {ad.status === 'VALIDATED' ? 'Validée' : 
                             ad.status === 'WAITING_VALIDATION' ? 'En attente' : ad.status}
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg truncate flex-1">{ad.reference}</h3>
                            <span className="text-[#00BFA6] font-bold whitespace-nowrap">{ad.price.toLocaleString()} DA</span>
                        </div>
                        <div className="flex items-center text-gray-500 text-sm mb-4">
                            <MapPin className="h-4 w-4 mr-1" />
                            {ad.property?.address?.town?.nameFr}, {ad.property?.address?.town?.city?.nameFr}
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                            <span className="text-xs text-gray-400 flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(ad.createdAt).toLocaleDateString()}
                            </span>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50">
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:bg-red-50">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  )
}
