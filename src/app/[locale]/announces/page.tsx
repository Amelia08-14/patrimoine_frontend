"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { AnnounceFilter } from "@/components/AnnounceFilter"
import { Button } from "@/components/ui/button"
import { PROPERTY_TYPES } from "@/data/propertyTypes"
import { PropertyCard } from "@/components/PropertyCard"
import { getCategoryColor } from "@/data/categoryColors"
import { LayoutGrid, LayoutDashboard, List, Building2, MapPin } from "lucide-react"

const getImageUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  let cleanUrl = url.replace(/\\/g, '/')
  if (cleanUrl.startsWith('/')) cleanUrl = cleanUrl.substring(1)
  return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/${cleanUrl}`
}

function AnnouncesContent() {
  const t = useTranslations("AnnouncesPage")
  const searchParams = useSearchParams()
  const router = useRouter()
  const [announces, setAnnounces] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'large' | 'list'>('grid')

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

  // Synchronise l'URL avec les filtres actuels (permet de partager/mettre en favori une recherche) —
  // le filtrage lui-même n'attend plus ce clic, il se déclenche déjà en direct (cf. useEffect ci-dessous).
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

  // Filtrage "intelligent" : on refait tourner la recherche à chaque changement de filtre, sans
  // attendre le clic sur "Rechercher". Un léger debounce évite de relancer un fetch à chaque
  // frappe dans les champs Budget/Surface — les sélecteurs (catégorie, wilaya...) restent quasi
  // instantanés puisqu'ils ne changent qu'une fois par clic.
  useEffect(() => {
    setLoading(true)
    const handle = setTimeout(() => {
      const fetchAnnounces = async () => {
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

          if (filters.sortBy === 'PRICE_ASC') {
            data = [...data].sort((a: any, b: any) => (a.price || 0) - (b.price || 0))
          } else if (filters.sortBy === 'PRICE_DESC') {
            data = [...data].sort((a: any, b: any) => (b.price || 0) - (a.price || 0))
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
    }, 350)

    return () => clearTimeout(handle)
  }, [filters]) // Filtrage en direct — se redéclenche à chaque changement de filtre (debounce 350ms)

  const catColor = getCategoryColor(filters.realEstateCategory)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-transparent pb-12">
      {/* Header Search */}
      <div className="bg-gray-900 dark:bg-[#011419] py-8 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-[1600px] mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">{t("heroTitle")}</h1>
          <AnnounceFilter
              filters={filters}
              onFilterChange={handleFilterChange}
              onSearch={handleSearch}
              accentColor={filters.realEstateCategory ? catColor.hex : undefined}
          />
        </div>
      </div>

      {/* Transaction Type Tabs */}
      <div className="bg-white dark:bg-white/5 border-b border-gray-100 dark:border-white/10 shadow-sm py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            {[
              { value: '', label: t("viewAll") },
              { value: 'RENTAL', label: t("rent") },
              { value: 'SALE', label: t("buy") },
            ].map(opt => {
              const active = (filters.transactionType || '') === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    handleFilterChange('transactionType', opt.value)
                    const params = new URLSearchParams(searchParams.toString())
                    if (opt.value) params.set('transactionType', opt.value)
                    else params.delete('transactionType')
                    router.push(`/announces?${params.toString()}`)
                  }}
                  className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${active ? 'text-white shadow-sm' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-white/20'}`}
                  style={active ? { backgroundColor: catColor.hex } : undefined}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>

          {/* Bascule d'affichage — grille / grandes cartes / liste (même principe que la boutique) */}
          <div className="flex bg-gray-100 dark:bg-white/10 rounded-lg p-0.5 gap-0.5">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-white/20 shadow text-gray-900 dark:text-white' : 'text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/70'}`} title={t('viewGrid')}>
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode('large')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'large' ? 'bg-white dark:bg-white/20 shadow text-gray-900 dark:text-white' : 'text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/70'}`} title={t('viewLarge')}>
              <LayoutDashboard className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-white/20 shadow text-gray-900 dark:text-white' : 'text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/70'}`} title={t('viewList')}>
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">

          {/* Listings Grid */}
          <div className="flex-grow">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600 dark:text-white/60">
                <span className="font-bold text-gray-900 dark:text-white">{announces.length}</span> {t("resultsFound")}
              </p>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500 dark:text-white/50">{t("loading")}</div>
            ) : announces.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-white/50">{t("noResults")}</div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {announces.map((announce) => (
                    <PropertyCard key={announce.id} announce={announce} />
                ))}
                </div>
            ) : viewMode === 'large' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {announces.map((a) => {
                    const img = a.property?.images?.find((i: any) => i.isMain) || a.property?.images?.[0]
                    const city = a.property?.address?.town?.city?.nameFr || a.property?.address?.town?.nameFr || ''
                    const tx = a.type || a.transactionType || a.transaction
                    return (
                      <a key={a.id} href={`/announces/${a.id}`} className="group bg-white dark:bg-white/5 rounded-3xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden hover:shadow-xl transition-all duration-300">
                        <div className="h-56 bg-gray-100 dark:bg-white/10 overflow-hidden relative">
                          {img ? <img src={getImageUrl(img.url || '')} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-100 dark:from-white/10 dark:to-white/5 flex items-center justify-center"><Building2 className="h-12 w-12 text-gray-300 dark:text-white/20" /></div>}
                          <div className="absolute top-3 left-3">
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: tx === 'SALE' ? '#ef4444' : catColor.hex }}>{tx === 'SALE' ? t('buy') : tx === 'RENTAL' ? t('rent') : ''}</span>
                          </div>
                        </div>
                        <div className="p-5">
                          <h3 className="font-bold text-gray-900 dark:text-white text-base group-hover:text-[#0094BD] transition-colors line-clamp-2">
                            {a.title || PROPERTY_TYPES?.find((pt: any) => pt.id === a.property?.propertyType?.toUpperCase())?.label || a.property?.propertyType}
                          </h3>
                          {city && <p className="flex items-center gap-1 text-gray-500 dark:text-white/50 text-sm mt-2"><MapPin className="h-3.5 w-3.5 shrink-0" />{city}</p>}
                          <div className="mt-4 flex items-center justify-between">
                            <span className="font-black text-xl" style={{ color: catColor.hex }}>{a.price ? `${Number(a.price).toLocaleString()} DA` : t('priceOnRequest')}</span>
                            <span className="text-xs text-gray-400 dark:text-white/30">{a.reference}</span>
                          </div>
                        </div>
                      </a>
                    )
                  })}
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                  {announces.map((a) => {
                    const img = a.property?.images?.find((i: any) => i.isMain) || a.property?.images?.[0]
                    const city = a.property?.address?.town?.city?.nameFr || a.property?.address?.town?.nameFr || ''
                    const tx = a.type || a.transactionType || a.transaction
                    const pType = PROPERTY_TYPES?.find((pt: any) => pt.id === a.property?.propertyType?.toUpperCase())?.label || a.property?.propertyType
                    return (
                      <a key={a.id} href={`/announces/${a.id}`} className="group flex bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden hover:shadow-lg transition-all">
                        <div className="w-44 h-36 shrink-0 overflow-hidden bg-gray-100 dark:bg-white/10">
                          {img ? <img src={getImageUrl(img.url || '')} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center"><Building2 className="h-8 w-8 text-gray-300 dark:text-white/20" /></div>}
                        </div>
                        <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-bold text-gray-900 dark:text-white text-base group-hover:text-[#0094BD] transition-colors line-clamp-1">{a.title || pType}</h3>
                              <span className="shrink-0 px-2.5 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: tx === 'SALE' ? '#ef4444' : catColor.hex }}>{tx === 'SALE' ? t('buy') : tx === 'RENTAL' ? t('rent') : ''}</span>
                            </div>
                            {pType && a.title && <p className="text-sm text-gray-500 dark:text-white/50 mt-0.5">{pType}</p>}
                            {city && <p className="flex items-center gap-1 text-gray-500 dark:text-white/50 text-sm mt-1"><MapPin className="h-3.5 w-3.5 shrink-0" />{city}</p>}
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <span className="font-black text-lg" style={{ color: catColor.hex }}>{a.price ? `${Number(a.price).toLocaleString()} DA` : t('priceOnRequest')}</span>
                            <span className="text-xs text-gray-400 dark:text-white/30 font-medium">{a.reference}</span>
                          </div>
                        </div>
                      </a>
                    )
                  })}
                </div>
            )}

            <div className="mt-12 flex justify-center">
              <Button variant="outline" size="lg">{t("viewMore")}</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AnnouncesFallback() {
  const t = useTranslations("AnnouncesPage")
  return <div className="min-h-screen flex items-center justify-center">{t("loading")}</div>
}

export default function AnnouncesPage() {
  return (
    <Suspense fallback={<AnnouncesFallback />}>
      <AnnouncesContent />
    </Suspense>
  )
}
