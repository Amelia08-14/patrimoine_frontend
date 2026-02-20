"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { AnnounceFilter } from "@/components/AnnounceFilter"
import { Button } from "@/components/ui/button"
import { Heart, MapPin, BedDouble, Bath, Square, Building2, Camera, Eye, ArrowRight } from "lucide-react"
import Link from "next/link"
import { PROPERTY_TYPES } from "@/data/propertyTypes"
import { cn } from "@/lib/utils"

// Helper for Image URLs
const getImageUrl = (url: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    
    // Fix Windows backslashes to forward slashes
    let cleanUrl = url.replace(/\\/g, '/');
    
    // Remove leading slash if present to avoid double slashes with base URL
    if (cleanUrl.startsWith('/')) {
        cleanUrl = cleanUrl.substring(1);
    }
    
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/${cleanUrl}`;
}

function AnnouncesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [announces, setAnnounces] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Initialize filters from URL params
  const [filters, setFilters] = useState({
    sortBy: searchParams.get('sortBy') || 'LAST_MODIFIED_DATE_DESC',
    transactionType: searchParams.get('transactionType') || 'RENTAL',
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
      transactionType: searchParams.get('transactionType') || 'RENTAL',
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
          
          // CLIENT-SIDE FILTERING (Temporary until Backend Search is ready)
          if (filters.transactionType) {
            data = data.filter((a: any) => a.type === filters.transactionType)
          }
          
          if (filters.realEstateCategory) {
            // Find all property types that belong to this category
            const validTypes = PROPERTY_TYPES
                .filter(t => t.categoryId === filters.realEstateCategory)
                .map(t => t.id);
            
            // Filter announces where propertyType matches one of the valid types
            if (validTypes.length > 0) {
                data = data.filter((a: any) => {
                    // Try to match by ID first (if propertyType is stored as ID like "APPARTEMENT")
                    if (validTypes.includes(a.property?.propertyType)) return true;
                    
                    // Fallback: Try to match by Label (if propertyType is stored as Label like "Appartement")
                    // This handles potential inconsistency in how propertyType is stored in DB
                    const typeObj = PROPERTY_TYPES.find(t => t.label === a.property?.propertyType);
                    return typeObj && typeObj.categoryId === filters.realEstateCategory;
                });
            }
          }

          if (filters.propertyType) {
            // Precise filter by Property Type
            data = data.filter((a: any) => {
                // Check direct ID match
                if (a.property?.propertyType === filters.propertyType) return true;
                
                // Check label match (e.g. if DB has "Maison d'hôtes" instead of "MAISON_HOTES")
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
                {announces.map((announce) => {
                    const isCompany = announce.user?.companyName || announce.user?.userType === 'SOCIETE';
                    return (
                    <Link href={`/announces/${announce.id}`} key={announce.id} className="block group">
                        <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 relative h-full flex flex-col">
                            <div className="relative h-[280px] overflow-hidden">
                                {/* Image */}
                                {announce.property?.images?.[0] ? (
                                    <img 
                                    src={getImageUrl(announce.property.images[0].url) || ''} 
                                    alt={announce.property.propertyType} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                                        <Building2 className="h-12 w-12 opacity-20" />
                                    </div>
                                )}
                                
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                                {/* Top Actions */}
                                <div className="absolute top-4 right-4 flex gap-2 z-10">
                                    <button 
                                        className="p-2.5 bg-white/20 backdrop-blur-md hover:bg-white rounded-full text-white hover:text-red-500 transition-all shadow-sm active:scale-95"
                                        onClick={(e) => { e.preventDefault(); /* Add fav logic */ }}
                                    >
                                        <Heart className="h-5 w-5 fill-transparent hover:fill-current transition-colors" />
                                    </button>
                                </div>

                                {/* Top Left Badges */}
                                <div className="absolute top-4 left-4 flex gap-2 z-10">
                                    <div className="bg-black/50 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border border-white/10">
                                        <Camera className="h-3.5 w-3.5" />
                                        {announce.property?.images?.length || 0}
                                    </div>
                                    <div className="bg-black/50 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border border-white/10">
                                        <Eye className="h-3.5 w-3.5" />
                                        {announce.nbViews || 0}
                                    </div>
                                    {announce.exclusive && (
                                        <div className="bg-green-600/90 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg border border-white/10">
                                            Exclusivité
                                        </div>
                                    )}
                                </div>

                                {/* Bottom Content Overlay */}
                                <div className="absolute bottom-0 left-0 right-0 p-5 text-white z-10">
                                    
                                    {/* Company Info (If applicable) */}
                                    {isCompany && (
                                        <div className="flex items-center gap-2 mb-3 bg-white/10 backdrop-blur-md p-1.5 rounded-full w-fit border border-white/20">
                                            {announce.user?.imageUrl ? (
                                                <img 
                                                    src={getImageUrl(announce.user.imageUrl) || ''} 
                                                    alt={announce.user.companyName}
                                                    className="w-6 h-6 rounded-full object-cover bg-white"
                                                />
                                            ) : (
                                                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                                                    <Building2 className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                            <span className="text-xs font-bold pr-2 truncate max-w-[150px]">
                                                {announce.user.companyName}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between mb-2">
                                        <span className={cn(
                                        "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg",
                                        announce.type === "SALE" ? "bg-red-500 text-white" : "bg-[#00BFA6] text-white"
                                        )}>
                                        {announce.type === 'SALE' ? 'Vente' : 'Location'}
                                        </span>
                                        <span className="font-bold text-xl drop-shadow-md">{new Intl.NumberFormat('fr-DZ').format(announce.price)} DA</span>
                                    </div>
                                    
                                    <h3 className="font-bold text-lg leading-tight truncate mb-1 drop-shadow-sm">
                                        {announce.property?.propertyType} <span className="font-normal text-gray-300 text-sm">à</span> {announce.property?.address?.town?.nameFr}
                                    </h3>
                                    
                                    <div className="flex items-center text-gray-300 text-xs font-medium">
                                    <MapPin className="h-3.5 w-3.5 mr-1 text-[#00BFA6]" />
                                    {announce.property?.address?.town?.nameFr}, {announce.property?.address?.town?.city?.nameFr}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-4 flex justify-between items-center bg-white mt-auto">
                                <div className="flex gap-4 text-gray-500 text-sm font-bold">
                                    <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg">
                                            <Square className="h-4 w-4 text-gray-400"/> 
                                            {announce.property?.area} m²
                                    </div>
                                    {announce.property?.nbRooms && (
                                        <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg">
                                                <BedDouble className="h-4 w-4 text-gray-400"/> 
                                                {announce.property?.nbRooms} p.
                                        </div>
                                    )}
                                </div>
                                <Button variant="ghost" className="text-[#00BFA6] hover:text-[#00908A] hover:bg-green-50 p-0 h-auto font-bold text-sm group-hover:translate-x-1 transition-transform">
                                    Détails <ArrowRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    </Link>
                )})}
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
