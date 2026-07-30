"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Link from "next/link"
import { Search, MapPin, Calendar, Wallet, Ruler, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { REAL_ESTATE_CATEGORIES } from "@/data/propertyTypes"

export default function DemandesPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const res = await axios.get(`${apiUrl}/entrusted-research`)
        setRequests(res.data)
      } catch (err) {
        console.error("Error fetching entrusted researches:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchRequests()
  }, [])

  const getCategoryLabel = (id?: string) => REAL_ESTATE_CATEGORIES.find(c => c.id === id)?.label

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#003B4A] text-white py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold">Demandes en cours de recherche</h1>
          <p className="mt-3 text-white/80 max-w-2xl mx-auto">
            Parcourez les recherches confiées par nos clients et proposez-leur le bien qui correspond à leurs critères.
          </p>
          <Link href="/research">
            <Button className="mt-6 bg-[#00BFA6] hover:bg-[#00908A] text-white rounded-full px-6 py-5 font-bold">
              Confier ma propre recherche
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Chargement des demandes...</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16">
            <Search className="h-10 w-10 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">Aucune demande en cours pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {requests.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-[#00BFA6]/10 text-[#00908A]">
                    {r.transaction === 'SALE' ? 'Achat' : r.transaction === 'RENTAL' ? 'Location' : 'Vacances'}
                  </span>
                  {r.realEstateType && (
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      {getCategoryLabel(r.realEstateType) || r.realEstateType}
                    </span>
                  )}
                </div>

                {r.comment && (
                  <p className="text-gray-700 text-sm line-clamp-3">{r.comment}</p>
                )}

                <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                  {(r.minBudget || r.maxBudget) && (
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-[#00BFA6]" />
                      {r.minBudget ? new Intl.NumberFormat('fr-DZ').format(r.minBudget) : '0'} - {r.maxBudget ? new Intl.NumberFormat('fr-DZ').format(r.maxBudget) : '?'} DA
                    </div>
                  )}
                  {(r.minSurface || r.maxSurface) && (
                    <div className="flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-[#00BFA6]" />
                      {r.minSurface || 0} - {r.maxSurface || '?'} m²
                    </div>
                  )}
                  {r.towns && (
                    <div className="flex items-center gap-2 col-span-2">
                      <MapPin className="h-4 w-4 text-[#00BFA6]" />
                      {r.towns}
                    </div>
                  )}
                  {r.installationDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-[#00BFA6]" />
                      {new Date(r.installationDate).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                </div>

                <Link href="/contact" className="mt-auto flex items-center gap-1.5 text-[#00BFA6] font-bold text-sm hover:underline">
                  Contacter pour répondre à cette demande <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
