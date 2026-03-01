"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft, MapPin, BedDouble, Bath, Square, Heart, Share2, 
  Phone, Mail, User, Check, Building2, Car, Wind, Sun, 
  Warehouse, Archive, ParkingCircle, DoorOpen, Flower2, Cctv, Waves, Search, ChevronDown, X
} from "lucide-react"
import { AMENITIES_DATA } from "@/data/amenities"
import Link from "next/link"
import { AnnounceFilter } from "@/components/AnnounceFilter"

  // Helper for Image URLs
  const getImageUrl = (url: string) => {
      if (!url) return null;
      if (url.startsWith('http')) return url;
      // Fix Windows backslashes to forward slashes
      const cleanUrl = url.replace(/\\/g, '/');
      return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/${cleanUrl}`;
  }
  const getIcon = (iconName: string) => {
  const icons: any = { Flower2, Cctv, Sun, Waves, Car, Wind, Warehouse, Archive, ParkingCircle, DoorOpen }
  return icons[iconName] || Check
}

const LABELS: any = {
    // State
    NEW: "Neuf / Première main",
    GOOD: "Bon état",
    RENOVATED: "Rénové",
    TO_RENOVATE: "A rénover",
    UNDER_CONSTRUCTION: "En construction",
    
    // Usage
    HABITATION: "Habitation",
    PROFESSIONAL: "Professionnel / Bureau",
    COMMERCIAL: "Commercial",
    
    // Kitchen
    KITCHEN_EQUIPPED: "Cuisine Équipée",
    KITCHEN_SEMI_EQUIPPED: "Semi-équipée",
    KITCHEN_EMPTY: "Vide",
    KITCHEN_OPEN: "Ouverte (Américaine)",
    KITCHEN_CLOSED: "Fermée",
    KITCHEN_ISLAND: "Avec Ilot",
    
    // Heating/AC
    HEATING_CENTRAL: "Chauffage Central",
    HEATING_GAS: "Chauffage à Gaz",
    HEATING_ELEC: "Chauffage Électrique",
    HEATING_FLOOR: "Chauffage au Sol",
    AC_CENTRAL: "Climatisation Centrale",
    AC_SPLIT: "Split System",
    
    // Counters
    INDIVIDUAL: "Individuel",
    COLLECTIVE: "Collectif",
    
    // Categories (Images)
    bedrooms: "Chambres",
    bathrooms: "Salles de bain & WC",
    kitchen: "Cuisine",
    exterior: "Extérieur",
    common: "Espaces communs",
    other: "Autres",
    general: "Général"
};

export default function AnnounceDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [announce, setAnnounce] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [showGallery, setShowGallery] = useState(false)
  const [activeTab, setActiveTab] = useState('ALL')

  // Group images by category
  const imagesByCategory = (announce?.property?.images || []).reduce((acc: any, img: any) => {
    const cat = img.category || 'general';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(img);
    return acc;
  }, {});

  const allImages = announce?.property?.images || [];
  const displayImages = activeTab === 'ALL' ? allImages : (imagesByCategory[activeTab] || []);

  // Filter State
  const [filters, setFilters] = useState({
    sortBy: 'LAST_MODIFIED_DATE_DESC',
    transactionType: 'RENTAL',
    realEstateCategory: '',
    propertyType: '',
    wilaya: '',
    commune: '',
    minPrice: '',
    maxPrice: '',
    minArea: '',
    maxArea: '',
    nbPieces: ''
  })

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
    
    // Redirect to listing page with params
    router.push(`/announces?${params.toString()}`)
  }

  useEffect(() => {
    const fetchAnnounce = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/announces/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setAnnounce(data)
        }
      } catch (error) {
        console.error("Error fetching announce:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchAnnounce()
    }
  }, [params.id])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>
  if (!announce) return <div className="min-h-screen flex items-center justify-center">Annonce introuvable</div>

  const property = announce.property
  const images = property.images || []
  const amenitiesIds = property.amenities ? JSON.parse(property.amenities) : []

  // Helper to filter amenities
  const getAmenitiesList = (sourceList: any[]) => {
    return sourceList.filter(item => amenitiesIds.includes(item.id))
  }

  const conveniences = getAmenitiesList(AMENITIES_DATA.conveniences)
  const heaters = getAmenitiesList(AMENITIES_DATA.heaters)
  const kitchens = getAmenitiesList(AMENITIES_DATA.kitchens)
  const otherPieces = getAmenitiesList(AMENITIES_DATA.otherPieces)
  const advantages = getAmenitiesList(AMENITIES_DATA.advantages)

  // Helper to determine if we should show Villa-specific layout
  const isVilla = announce?.property?.propertyType === 'VILLA' || announce?.property?.propertyType === 'Villa' || announce?.property?.propertyType === 'villa';
  const isRental = announce?.type === 'RENTAL';
  const isVillaRental = isVilla && isRental;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header / Nav */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
            Retour
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="icon"><Heart className="h-5 w-5" /></Button>
            <Button variant="outline" size="icon"><Share2 className="h-5 w-5" /></Button>
          </div>
        </div>
      </div>

      {/* --- ADVANCED SEARCH BAR (From Home) --- */}
      <div className="bg-[#00BFA6] py-6 shadow-md relative z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <h2 className="text-white text-center font-bold text-xl mb-4">Remplissez Les Filtres <span className="font-normal text-white/90">Pour un bon resultat de recherche</span></h2>
             
             <div className="bg-white rounded-xl shadow-lg p-2 flex flex-col md:flex-row items-center gap-2">
                  <AnnounceFilter 
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onSearch={handleSearch}
                  />
             </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Images Grid - Modern Layout */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 px-2">Galerie Photos</h2>
            
            {/* Gallery Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-4 hide-scrollbar px-2">
                <button 
                    onClick={() => setActiveTab('ALL')}
                    className={`px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap shadow-sm border-2 ${activeTab === 'ALL' ? 'border-[#00BFA6] bg-[#00BFA6] text-white' : 'border-gray-100 bg-white text-gray-600 hover:border-gray-300'}`}
                >
                    Tout ({allImages.length})
                </button>
                {Object.keys(imagesByCategory).map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setActiveTab(cat)}
                        className={`px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap shadow-sm border-2 ${activeTab === cat ? 'border-[#00BFA6] bg-[#00BFA6] text-white' : 'border-gray-100 bg-white text-gray-600 hover:border-gray-300'}`}
                    >
                        {LABELS[cat] || cat} ({imagesByCategory[cat].length})
                    </button>
                ))}
            </div>

            <div className="h-[400px] md:h-[500px] rounded-2xl overflow-hidden relative bg-gray-50">
                {displayImages.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">Aucune image dans cette catégorie</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-2 h-full">
                        {/* Main Image (Left Half) */}
                        <div 
                            className="col-span-1 md:col-span-2 row-span-2 relative cursor-pointer group h-full"
                            onClick={() => { setActiveImage(allImages.indexOf(displayImages[0])); setShowGallery(true); }}
                        >
                            <img 
                                src={getImageUrl(displayImages[0]?.url) || ''} 
                                alt="Main view" 
                                className="w-full h-full object-cover hover:opacity-95 transition-opacity rounded-l-2xl"
                            />
                            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-bold">
                                {LABELS[displayImages[0]?.category] || displayImages[0]?.category || 'Général'}
                            </div>
                        </div>

                        {/* Top Middle */}
                        <div 
                            className="hidden md:block col-span-1 row-span-2 relative cursor-pointer group h-full"
                            onClick={() => { setActiveImage(allImages.indexOf(displayImages[1])); setShowGallery(true); }}
                        >
                            {displayImages[1] ? (
                                <>
                                    <img 
                                        src={getImageUrl(displayImages[1]?.url) || ''} 
                                        alt="View 2" 
                                        className="w-full h-full object-cover hover:opacity-95 transition-opacity"
                                    />
                                    <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-bold">
                                        {LABELS[displayImages[1]?.category] || displayImages[1]?.category || 'Général'}
                                    </div>
                                </>
                            ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                    <Building2 className="h-8 w-8 text-gray-300" />
                                </div>
                            )}
                        </div>

                        {/* Right Column (Stacked) */}
                        <div className="hidden md:flex flex-col gap-2 col-span-1 row-span-2 h-full">
                            <div 
                                className="flex-1 relative cursor-pointer group overflow-hidden rounded-tr-2xl"
                                onClick={() => { setActiveImage(allImages.indexOf(displayImages[2])); setShowGallery(true); }}
                            >
                                {displayImages[2] ? (
                                    <>
                                        <img 
                                            src={getImageUrl(displayImages[2]?.url) || ''} 
                                            alt="View 3" 
                                            className="w-full h-full object-cover hover:opacity-95 transition-opacity"
                                        />
                                        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-bold">
                                            {LABELS[displayImages[2]?.category] || displayImages[2]?.category || 'Général'}
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                        <Building2 className="h-8 w-8 text-gray-300" />
                                    </div>
                                )}
                            </div>
                            <div 
                                className="flex-1 relative cursor-pointer group overflow-hidden rounded-br-2xl"
                                onClick={() => { setActiveImage(allImages.indexOf(displayImages[3] || displayImages[0])); setShowGallery(true); }}
                            >
                                {displayImages[3] ? (
                                    <>
                                        <img 
                                            src={getImageUrl(displayImages[3]?.url) || ''} 
                                            alt="View 4" 
                                            className="w-full h-full object-cover hover:opacity-95 transition-opacity"
                                        />
                                        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-bold">
                                            {LABELS[displayImages[3]?.category] || displayImages[3]?.category || 'Général'}
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                        <Building2 className="h-8 w-8 text-gray-300" />
                                    </div>
                                )}
                                
                                {/* "Show All" Button Overlay - Always visible on the last block if there are more images */}
                                <div className="absolute inset-0 bg-black/40 hover:bg-black/50 transition-colors flex flex-col items-center justify-center text-white cursor-pointer">
                                    <span className="text-3xl font-bold mb-2">+{displayImages.length > 4 ? displayImages.length - 4 : ''}</span>
                                    <Button 
                                        variant="secondary" 
                                        size="sm" 
                                        className="bg-white/90 text-gray-900 font-bold hover:bg-white gap-2 shadow-lg"
                                    >
                                        <Square className="h-4 w-4" />
                                        Voir la galerie
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Fullscreen Gallery Modal */}
        {showGallery && (
            <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-4 text-white">
                    <span className="text-sm font-medium">{activeImage + 1} / {images.length}</span>
                    <button onClick={() => setShowGallery(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Main View */}
                <div className="flex-1 flex items-center justify-center relative px-4 md:px-20">
                    <img 
                        src={getImageUrl(images[activeImage]?.url) || ''} 
                        alt="Gallery view" 
                        className="max-h-[80vh] max-w-full object-contain shadow-2xl"
                    />
                    
                    {/* Navigation Arrows */}
                    <button 
                        onClick={(e) => { e.stopPropagation(); setActiveImage(prev => (prev > 0 ? prev - 1 : images.length - 1)) }}
                        className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setActiveImage(prev => (prev < images.length - 1 ? prev + 1 : 0)) }}
                        className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all rotate-180"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                </div>

                {/* Thumbnails Strip */}
                <div className="h-24 bg-black/50 overflow-x-auto flex items-center gap-2 px-4 snap-x">
                    {images.map((img: any, idx: number) => (
                        <div 
                            key={idx}
                            onClick={() => setActiveImage(idx)}
                            className={`flex-shrink-0 h-16 w-24 cursor-pointer rounded-lg overflow-hidden border-2 transition-all snap-center ${activeImage === idx ? 'border-[#00BFA6] opacity-100' : 'border-transparent opacity-50 hover:opacity-80'}`}
                        >
                            <img 
                                src={getImageUrl(img.url) || ''} 
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Header Info */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.propertyType}</h1>
                  <div className="flex items-center text-gray-500 text-lg">
                    <MapPin className="h-5 w-5 mr-2 text-[#00BFA6]" />
                    {property.address?.town?.nameFr || property.address?.street}, {property.address?.town?.city?.nameFr}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-[#00BFA6]">{announce.price?.toLocaleString()} DZD</div>
                  <div className="text-sm text-gray-500 uppercase font-semibold mt-1 tracking-wide">{announce.type}</div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 py-6 border-t border-b border-gray-100 mt-6">
                {isVillaRental ? (
                    // Layout spécifique Villa
                    <>
                        {(property.landArea || property.area) && (
                            <div className="flex items-center gap-3 text-gray-700">
                                <Square className="h-6 w-6 text-gray-400" />
                                <div>
                                    <div className="font-bold text-lg">{property.landArea || property.area} m²</div>
                                    <div className="text-xs text-gray-500">Surface Terrain</div>
                                </div>
                            </div>
                        )}
                        {property.typology && (
                            <div className="flex items-center gap-3 text-gray-700">
                                <Building2 className="h-6 w-6 text-gray-400" />
                                <div>
                                    <div className="font-bold text-lg">{property.typology}</div>
                                    <div className="text-xs text-gray-500">Typologie</div>
                                </div>
                            </div>
                        )}
                        {(property.bedrooms || property.nbPieces) && (
                            <div className="flex items-center gap-3 text-gray-700">
                                <BedDouble className="h-6 w-6 text-gray-400" />
                                <div>
                                    <div className="font-bold text-lg">{property.bedrooms || property.nbPieces}</div>
                                    <div className="text-xs text-gray-500">Chambres</div>
                                </div>
                            </div>
                        )}
                        {property.configuration && (
                            <div className="flex items-center gap-3 text-gray-700">
                                <Building2 className="h-6 w-6 text-gray-400" />
                                <div>
                                    <div className="font-bold text-lg">R+{property.configuration}</div>
                                    <div className="text-xs text-gray-500">Niveaux</div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    // Layout standard
                    <>
                        <div className="flex items-center gap-3 text-gray-700">
                        <Square className="h-6 w-6 text-gray-400" />
                        <div>
                            <div className="font-bold text-lg">{property.area} m²</div>
                            <div className="text-xs text-gray-500">Surface</div>
                        </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                        <BedDouble className="h-6 w-6 text-gray-400" />
                        <div>
                            <div className="font-bold text-lg">{property.nbRooms || '-'}</div>
                            <div className="text-xs text-gray-500">Pièces</div>
                        </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                        <Bath className="h-6 w-6 text-gray-400" />
                        <div>
                            <div className="font-bold text-lg">{property.nbPieces || '-'}</div>
                            <div className="text-xs text-gray-500">Chambres</div>
                        </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                        <Building2 className="h-6 w-6 text-gray-400" />
                        <div>
                            <div className="font-bold text-lg">{property.nbFloors || '-'}</div>
                            <div className="text-xs text-gray-500">Etage</div>
                        </div>
                        </div>
                    </>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-4 text-gray-600">
                <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-[#00BFA6]" /> {announce.user?.phone || 'Non spécifié'}</div>
                <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-[#00BFA6]" /> {announce.user?.email}</div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Caractéristiques Détaillées (New Section) */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Caractéristiques Détaillées</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                    {/* Structure */}
                    {property.typology && (
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                            <span className="text-gray-500 font-medium">Typologie</span>
                            <span className="font-bold text-gray-900">{property.typology}</span>
                        </div>
                    )}
                    {property.configuration && (
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                            <span className="text-gray-500 font-medium">Configuration</span>
                            <span className="font-bold text-gray-900">R + {property.configuration}</span>
                        </div>
                    )}
                    {property.state && (
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                            <span className="text-gray-500 font-medium">État Général</span>
                            <span className="font-bold text-gray-900">{LABELS[property.state] || property.state}</span>
                        </div>
                    )}
                    {property.usageType && (
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                            <span className="text-gray-500 font-medium">Usage Autorisé</span>
                            <span className="font-bold text-gray-900">{LABELS[property.usageType] || property.usageType}</span>
                        </div>
                    )}

                    {/* Surfaces */}
                    {property.landArea && (
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                            <span className="text-gray-500 font-medium">Surface Terrain</span>
                            <span className="font-bold text-gray-900">{property.landArea} m²</span>
                        </div>
                    )}
                    {property.builtArea && (
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                            <span className="text-gray-500 font-medium">Surface Bâtie</span>
                            <span className="font-bold text-gray-900">{property.builtArea} m²</span>
                        </div>
                    )}

                    {/* Pièces */}
                    {property.nbSuites && (
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                            <span className="text-gray-500 font-medium">Suites</span>
                            <span className="font-bold text-gray-900">{property.nbSuites}</span>
                        </div>
                    )}
                    {property.nbLivingRooms && (
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                            <span className="text-gray-500 font-medium">Salons</span>
                            <span className="font-bold text-gray-900">{property.nbLivingRooms}</span>
                        </div>
                    )}
                    {property.nbBathrooms && (
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                            <span className="text-gray-500 font-medium">Salles de bain</span>
                            <span className="font-bold text-gray-900">{property.nbBathrooms}</span>
                        </div>
                    )}
                    {property.nbToilets && (
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                            <span className="text-gray-500 font-medium">Toilettes (WC)</span>
                            <span className="font-bold text-gray-900">{property.nbToilets}</span>
                        </div>
                    )}

                    {/* Cuisine */}
                    {property.kitchenType && (
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                            <span className="text-gray-500 font-medium">Type Cuisine</span>
                            <span className="font-bold text-gray-900">{LABELS[property.kitchenType] || property.kitchenType}</span>
                        </div>
                    )}
                    {property.kitchenState && (
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                            <span className="text-gray-500 font-medium">État Cuisine</span>
                            <span className="font-bold text-gray-900">{LABELS[property.kitchenState] || property.kitchenState}</span>
                        </div>
                    )}

                    {/* Confort & Energie */}
                    {property.heatingType && (
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                            <span className="text-gray-500 font-medium">Chauffage</span>
                            <span className="font-bold text-gray-900">{LABELS[property.heatingType] || property.heatingType}</span>
                        </div>
                    )}
                    {property.acType && (
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                            <span className="text-gray-500 font-medium">Climatisation</span>
                            <span className="font-bold text-gray-900">{LABELS[property.acType] || property.acType}</span>
                        </div>
                    )}
                    
                    {/* Compteurs */}
                    {(property.waterCounter || property.elecCounter || property.gasCounter) && (
                        <div className="col-span-1 md:col-span-2 mt-2">
                            <span className="text-gray-500 font-medium block mb-2">Compteurs</span>
                            <div className="flex gap-4">
                                {property.waterCounter && (
                                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100">
                                        Eau: {LABELS[property.waterCounter] || property.waterCounter}
                                    </span>
                                )}
                                {property.elecCounter && (
                                    <span className="px-3 py-1 bg-yellow-50 text-yellow-700 text-xs font-bold rounded-lg border border-yellow-100">
                                        Élec: {LABELS[property.elecCounter] || property.elecCounter}
                                    </span>
                                )}
                                {property.gasCounter && (
                                    <span className="px-3 py-1 bg-orange-50 text-orange-700 text-xs font-bold rounded-lg border border-orange-100">
                                        Gaz: {LABELS[property.gasCounter] || property.gasCounter}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {/* Stationnement */}
                    {(property.parkingCount || property.outdoorParking) && (
                         <div className="col-span-1 md:col-span-2 mt-2 pt-2 border-t border-gray-100">
                            <span className="text-gray-500 font-medium block mb-2">Stationnement</span>
                            <div className="flex gap-6">
                                {property.parkingCount > 0 && (
                                    <div className="flex items-center gap-2">
                                        <div className="bg-gray-100 p-2 rounded-full"><ParkingCircle className="h-4 w-4 text-gray-600"/></div>
                                        <span className="font-bold text-gray-900">{property.parkingCount} Garage</span>
                                    </div>
                                )}
                                {property.outdoorParking > 0 && (
                                    <div className="flex items-center gap-2">
                                        <div className="bg-gray-100 p-2 rounded-full"><Car className="h-4 w-4 text-gray-600"/></div>
                                        <span className="font-bold text-gray-900">{property.outdoorParking} Extérieur</span>
                                    </div>
                                )}
                            </div>
                         </div>
                    )}
                </div>
            </div>

            {/* Amenities Sections */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Commodités</h2>

              {heaters.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Chauffage et climatisation</h3>
                  <div className="flex flex-wrap gap-3">
                    {heaters.map(item => (
                      <span key={item.id} className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-700 font-medium">
                        {item.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {kitchens.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Cuisine et équipements</h3>
                  <div className="flex flex-wrap gap-3">
                    {kitchens.map(item => (
                      <span key={item.id} className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-700 font-medium">
                        {item.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {conveniences.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Commodités et services</h3>
                  <div className="flex flex-wrap gap-3">
                    {conveniences.map(item => {
                        const Icon = getIcon(item.icon!)
                        return (
                          <span key={item.id} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 font-medium flex items-center gap-2 shadow-sm">
                            <Icon className="h-4 w-4 text-[#00BFA6]" />
                            {item.label}
                          </span>
                        )
                    })}
                  </div>
                </div>
              )}

              {advantages.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Avantages et catégories</h3>
                  <div className="flex flex-wrap gap-3">
                    {advantages.map(item => (
                      <span key={item.id} className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-700 font-medium">
                        {item.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {otherPieces.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Autres pièces</h3>
                  <div className="flex flex-wrap gap-3">
                    {otherPieces.map(item => (
                      <span key={item.id} className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-700 font-medium">
                        {item.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Sidebar - Contact */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 bg-gray-200 rounded-full overflow-hidden">
                    {announce.user?.imageUrl ? (
                        <img src={getImageUrl(announce.user.imageUrl) || ''} alt="Agent" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                            <User className="h-8 w-8" />
                        </div>
                    )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{announce.user?.companyName || `${announce.user?.firstName} ${announce.user?.lastName}`}</h3>
                  <p className="text-sm text-gray-500">Annonceur</p>
                </div>
              </div>

              <form className="space-y-4">
                <input type="text" placeholder="Votre nom" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00BFA6] outline-none bg-gray-50 placeholder-gray-400" />
                <input type="email" placeholder="Votre email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00BFA6] outline-none bg-gray-50 placeholder-gray-400" />
                <input type="tel" placeholder="Votre téléphone" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00BFA6] outline-none bg-gray-50 placeholder-gray-400" />
                <textarea rows={4} placeholder="Bonjour, je suis intéressé par ce bien..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00BFA6] outline-none bg-gray-50 placeholder-gray-400"></textarea>
                
                <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" className="mt-1 rounded text-[#00BFA6] focus:ring-[#00BFA6]" />
                    <span className="text-xs text-gray-500">Je ne souhaite pas recevoir les annonces similaires et les suggestions personnalisées</span>
                </label>

                <Button className="w-full py-6 text-lg bg-[#00BFA6] hover:bg-[#00908A] text-white rounded-xl shadow-lg shadow-[#00BFA6]/20">
                  Envoyer
                </Button>
              </form>
            </div>
            
            {/* Similar Articles Placeholder */}
            <div className="mt-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 text-lg mb-4">Biens Similaires</h3>
                <div className="space-y-4">
                    <div className="bg-gray-50 rounded-xl p-3 flex gap-3 cursor-pointer hover:bg-gray-100 transition-colors">
                        <div className="h-16 w-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
                        <div>
                            <div className="font-bold text-sm text-gray-800 line-clamp-1">Appartement F3 à Alger</div>
                            <div className="text-[#00BFA6] font-bold text-xs mt-1">15 000 000 DA</div>
                        </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 flex gap-3 cursor-pointer hover:bg-gray-100 transition-colors">
                        <div className="h-16 w-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
                        <div>
                            <div className="font-bold text-sm text-gray-800 line-clamp-1">Villa R+2 à Oran</div>
                            <div className="text-[#00BFA6] font-bold text-xs mt-1">45 000 000 DA</div>
                        </div>
                    </div>
                </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}
