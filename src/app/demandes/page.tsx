"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Link from "next/link"
import { Search, MapPin, Calendar, Wallet, Ruler, ArrowRight, Home, Handshake, User, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { REAL_ESTATE_CATEGORIES, PROPERTY_TYPES } from "@/data/propertyTypes"
import { RESEARCH_PROPERTY_TYPES, RESEARCH_INTERLOCUTORS, ACHAT_INTERLOCUTOR_OPTIONS } from "@/data/researchConfig"

// Table de correspondance id -> libellé, construite à partir de toutes les branches (recherche + dépôt)
const PROPERTY_TYPE_LABELS: Record<string, string> = {}
Object.values(RESEARCH_PROPERTY_TYPES).forEach((list) => list.forEach((t) => { PROPERTY_TYPE_LABELS[t.id] ||= t.label }))
PROPERTY_TYPES.forEach((t) => { PROPERTY_TYPE_LABELS[t.id] ||= t.label })

const INTERLOCUTOR_LABELS: Record<string, string> = {}
Object.values(RESEARCH_INTERLOCUTORS).forEach((list) => list.forEach((o) => { INTERLOCUTOR_LABELS[o.id] ||= o.label }))
ACHAT_INTERLOCUTOR_OPTIONS.forEach((o) => { INTERLOCUTOR_LABELS[o.id] ||= o.label })

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

  const getLocationLabel = (r: any) => {
    const parts = [r.cityName, ...(r.townNames || [])].filter(Boolean)
    return parts.length ? parts.join(' — ') : null
  }

  const getInterlocutors = (r: any): string[] => {
    try {
      const parsed = r.amenities ? JSON.parse(r.amenities) : null
      const ids: string[] = parsed?.interlocutors || []
      return ids.map((id) => INTERLOCUTOR_LABELS[id] || id)
    } catch {
      return []
    }
  }

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
            {requests.map((r) => {
              const locationLabel = getLocationLabel(r)
              const interlocutors = getInterlocutors(r)
              const propertyTypeLabel = r.propertyType
                ? r.propertyType.split(',').map((id: string) => PROPERTY_TYPE_LABELS[id] || id).join(', ')
                : null
              const requesterName = r.user?.companyName || r.user?.firstName || null

              return (
                <div key={r.id} className="bg-white rounded-3xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100 p-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-[#00BFA6]/10 text-[#00908A]">
                      {r.transaction === 'SALE' ? 'Achat' : r.transaction === 'RENTAL' ? 'Location' : 'Vacances'}
                    </span>
                    {r.realEstateType && (
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        {getCategoryLabel(r.realEstateType) || r.realEstateType}
                      </span>
                    )}
                  </div>

                  {propertyTypeLabel && (
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                      <Home className="h-4 w-4 text-[#00BFA6] shrink-0" />
                      {propertyTypeLabel}
                    </div>
                  )}

                  {r.comment && (
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-4">{r.comment}</p>
                  )}

                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 border-t border-gray-50 pt-4">
                    {(r.minBudget || r.maxBudget) && (
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-[#00BFA6] shrink-0" />
                        {r.minBudget ? new Intl.NumberFormat('fr-DZ').format(r.minBudget) : '0'} - {r.maxBudget ? new Intl.NumberFormat('fr-DZ').format(r.maxBudget) : '?'} DA
                      </div>
                    )}
                    {(r.minSurface || r.maxSurface) && (
                      <div className="flex items-center gap-2">
                        <Ruler className="h-4 w-4 text-[#00BFA6] shrink-0" />
                        {r.minSurface || 0} - {r.maxSurface || '?'} m²
                      </div>
                    )}
                    {locationLabel && (
                      <div className="flex items-center gap-2 col-span-2">
                        <MapPin className="h-4 w-4 text-[#00BFA6] shrink-0" />
                        {locationLabel}
                      </div>
                    )}
                    {r.installationDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[#00BFA6] shrink-0" />
                        {new Date(r.installationDate).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </div>

                  {interlocutors.length > 0 && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <Handshake className="h-4 w-4 text-[#00BFA6] shrink-0 mt-0.5" />
                      <span>{interlocutors.join(' · ')}</span>
                    </div>
                  )}

                  {requesterName && (
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-wide">
                      {r.user?.companyName ? <Store className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                      {requesterName}
                    </div>
                  )}

                  <Link href="/contact" className="mt-auto pt-2 flex items-center gap-1.5 text-[#00BFA6] font-bold text-sm hover:underline">
                    Contacter pour répondre à cette demande <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
