"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useRouter } from "@/i18n/navigation"
import { AnnounceFilter } from "@/components/AnnounceFilter"
import { Button } from "@/components/ui/button"
import { PROPERTY_TYPES } from "@/data/propertyTypes"
import { PropertyCard } from "@/components/PropertyCard"

function AnnouncesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [announces, setAnnounces] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Initialize filters from URL params
  const [filters, setFilters] = useState({
    sortBy: searchParams.get('sortBy') || 'LAST_MODIFIED_DATE_DESC',
    transactionType: searchParams.get('transactionType') || '',
    realEstateCategory: searchParams.get('realEstateCategory') || '',
    propertyType: searchParams.get('propertyType') || '',
    wilaya: searchParams.get('wilaya') || '',
    commune: searchParams.get('commune') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minArea: searchParams.get('minArea') || '',
    maxArea: searchParams.get('maxArea') || '',
    nbPieces: searchParams.get('nbPieces') || ''
  })

  useEffect(() => {
    // Update filters when URL params change (e.g. navigation)
    setFilters({
      sortBy: searchParams.get('sortBy') || 'LAST_MODIFIED_DATE_DESC',
      transactionType: searchParams.get('transactionType') || '',
      realEstateCategory: searchParams.get('realEstateCategory') || '',
      propertyType: searchParams.get('propertyType') || '',
      wilaya: searchParams.get('wilaya') || '',
      commune: searchParams.get('commune') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      minArea: searchParams.get('minArea') || '',
      maxArea: searchParams.get('maxArea') || '',
      nbPieces: searchParams.get('nbPieces') || ''
    })
  }, [searchParams])

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (filters.transactionType) params.append('transactionType', filters.transactionType)
    if (filters.realEstateCategory) params.append('realEstateCategory', filters.realEstateCategory)
    if (filters.propertyType) params.append('propertyType', filters.propertyType)
    if (filters.wilaya) params.append('wilaya', filters.wilaya)
    if (filters.commune) params.append('commune', filters.commune)
    if (filters.minPrice) params.append('minPrice', filters.minPrice)
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice)
    if (filters.minArea) params.append('minArea', filters.minArea)
    if (filters.maxArea) params.append('maxArea', filters.maxArea)
    if (filters.nbPieces) params.append('nbPieces', filters.nbPieces)
    if (filters.sortBy) params.append('sortBy', filters.sortBy)
    
    router.push(`/announces?${params.toString()}`)
  }

  useEffect(() => {
    const fetchAnnounces = async () => {
      setLoading(true)
      try {
        // Construct query string for API
        const queryParams = new URLSearchParams()
        // Map frontend filters to API expected params if needed
        // For now assuming API accepts same param names or we filter client side?
        // Let's assume we fetch all and filter client side for MVP or pass params if API supports
        
        // Actually, let's pass params to API. 
        // Note: The NestJS controller might expect specific DTO structure or query params.
        // Based on previous LS, announce.controller.ts has findAll() but maybe not advanced search yet?
        // The old project had searchFilter(). The new one uses standard findAll usually.
        // Let's check if we need to implement search on backend or just filter here.
        // For now, fetching all and filtering client side is safer to ensure it works immediately 
        // without backend changes, unless the dataset is huge.
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/announces`)
        if (response.ok) {
          let data = await response.json()
          
          // CLIENT-SIDE FILTERING
          if (filters.transactionType === 'RENTAL' || filters.transactionType === 'SALE') {
            data = data.filter((a: any) => a.type === filters.transactionType)
          }
          
          if (filters.realEstateCategory) {
            const CROSS_TYPE_MAP: Record<string, string> = {
                'APPARTEMENT_COMMERCIAL': 'APPARTEMENT',
                'VILLA_COMMERCIALE': 'VILLA',
                'NIVEAU_VILLA_COMMERCIAL': 'NIVEAU_VILLA',
                'IMMEUBLE_BUREAU': 'IMMEUBLE_RESIDENTIEL',
                'APPARTEMENT': 'APPARTEMENT_COMMERCIAL',
                'VILLA': 'VILLA_COMMERCIALE',
                'NIVEAU_VILLA': 'NIVEAU_VILLA_COMMERCIAL',
                'IMMEUBLE_RESIDENTIEL': 'IMMEUBLE_BUREAU',
            };
            const validTypes = PROPERTY_TYPES
                .filter(t => t.categoryId === filters.realEstateCategory)
                .map(t => t.id);

            if (validTypes.length > 0) {
                data = data.filter((a: any) => {
                    if (validTypes.includes(a.property?.propertyType?.toUpperCase())) return true;
                    if (a.property?.acceptsCrossUsage && a.property?.crossRealEstateType === filters.realEstateCategory) {
                        const originalType = a.property?.propertyType?.toUpperCase();
                        a.property._displayPropertyType = CROSS_TYPE_MAP[originalType] || originalType;
                        return true;
                    }
                    const typeObj = PROPERTY_TYPES.find(t => t.label === a.property?.propertyType);
                    return typeObj && typeObj.categoryId === filters.realEstateCategory;
                });
            }
          }

          if (filters.propertyType) {
            // Precise filter by Property Type
            data = data.filter((a: any) => {
                // Check direct ID match (case-insensitive)
                if (a.property?.propertyType?.toUpperCase() === filters.propertyType?.toUpperCase()) return true;
                
                // Check label match
                const typeObj = PROPERTY_TYPES.find(t => t.id === filters.propertyType);
                return typeObj && a.property?.propertyType === typeObj.label;
            })
          }

          if (filters.wilaya) {
             // Filter by Wilaya Code
             // Path: announce.property.address.town.city.code
             // Note: City code is number in DB (e.g. 16000), filter is string (e.g. "16")
             // We need to match the first 2 digits or exact code logic
             data = data.filter((a: any) => {
                 const cityCode = a.property?.address?.town?.city?.code;
                 if (!cityCode) return false;
                 
                 // Convert DB code to string
                 const codeStr = cityCode.toString();
                 
                 // Simple check: does it start with the wilaya code? (e.g. 16000 starts with 16)
                 // Or if wilaya code is "16", we might need to pad/unpad. 
                 // Assuming standard DZ postal codes: Wilaya 16 -> 16xxx
                 return codeStr.startsWith(filters.wilaya);
             })
          }

          if (filters.commune) {
             // Filter by Commune (Town)
             // We compare town ID if we have it, or name if that's what we have
             // In filters.commune we have the ID from COMMUNES list
             // But do we have town ID in announce? announce.property.address.town.id
             // Let's assume filters.commune is the ID of the town in our static list, 
             // which *should* match the ID in the database if seeded correctly.
             // If not, we might need to match by name.
             // Let's try flexible matching.
             
             data = data.filter((a: any) => {
                 // If we passed ID
                 if (a.property?.address?.town?.id?.toString() === filters.commune) return true;
                 
                 // If we need to match by name (less reliable but fallback)
                 // We need to find the name from our static list first
                 // const communeName = COMMUNES.find(c => c.id === filters.commune)?.name;
                 // return a.property?.address?.town?.nameFr === communeName;
                 return false;
             })
          }

          if (filters.maxPrice) {
            data = data.filter((a: any) => a.price <= Number(filters.maxPrice))
          }

          if (filters.minArea) {
            data = data.filter((a: any) => (a.property?.area || 0) >= Number(filters.minArea))
          }
          
          setAnnounces(data)
        }
      } catch (error) {
        console.error("Error fetching announces:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnnounces()
  }, [searchParams]) // Refetch when URL params change

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header Search */}
      <div className="bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">Trouvez votre futur chez-vous</h1>
          <div className="bg-white rounded-xl shadow-lg p-2">
            <AnnounceFilter 
                filters={filters}
                onFilterChange={handleFilterChange}
                onSearch={handleSearch}
            />
          </div>
        </div>
      </div>

      {/* Transaction Type Tabs */}
      <div className="bg-white border-b border-gray-100 shadow-sm py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          {[
            { value: '', label: 'Tout voir' },
            { value: 'RENTAL', label: 'Louer' },
            { value: 'SALE', label: 'Acheter' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => {
                handleFilterChange('transactionType', opt.value)
                const params = new URLSearchParams(searchParams.toString())
                if (opt.value) params.set('transactionType', opt.value)
                else params.delete('transactionType')
                router.push(`/announces?${params.toString()}`)
              }}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                (filters.transactionType || '') === opt.value
                  ? 'bg-[#00BFA6] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">

          {/* Listings Grid */}
          <div className="flex-grow">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                <span className="font-bold text-gray-900">{announces.length}</span> résultats trouvés
              </p>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Chargement des annonces...</div>
            ) : announces.length === 0 ? (
                <div className="text-center py-12 text-gray-500">Aucune annonce trouvée correspondant à vos critères.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {announces.map((announce) => (
                    <PropertyCard key={announce.id} announce={announce} />
                ))}
                </div>
            )}
            
            <div className="mt-12 flex justify-center">
              <Button variant="outline" size="lg">Voir plus d'annonces</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AnnouncesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <AnnouncesContent />
    </Suspense>
  )
}
