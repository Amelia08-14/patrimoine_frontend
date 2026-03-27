"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft, MapPin, BedDouble, Bath, Square, Heart, Share2, 
  Phone, Mail, User, Check, Building2, Car, Wind, Sun, 
  Warehouse, Archive, ParkingCircle, DoorOpen, Flower2, Cctv, Waves, Search, ChevronDown, X, Layers
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
    
    // Bathroom
    italian_shower: "Douche Italienne",
    bathtub: "Baignoire",
    both: "Les deux",
    none: "Non spécifié",

    // Kitchen
    OPEN: "Ouverte",
    CLOSED: "Fermée",
    SEMI_OPEN: "Semi-ouverte",
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
  const [selectedContactIndex, setSelectedContactIndex] = useState(0)

  const [isContactModalOpen, setIsContactModalOpen] = useState(false)

  const allImages = announce?.property?.images || [];
  
  // Find the main image
  const mainImageIndex = allImages.findIndex((img: any) => img.isMain);
  
  // Reorder images to put main image first if it exists
  const orderedAllImages = [...allImages];
  if (mainImageIndex > 0) {
      const mainImg = orderedAllImages.splice(mainImageIndex, 1)[0];
      orderedAllImages.unshift(mainImg);
  }

  // Re-group for categories but use ordered images
  const imagesByCategory = orderedAllImages.reduce((acc: any, img: any) => {
    const cat = img.category || 'general';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(img);
    return acc;
  }, {});

  const [activeTab, setActiveTab] = useState('ALL')
  
  const displayImages = activeTab === 'ALL' ? orderedAllImages : (imagesByCategory[activeTab] || []);

  let videosList: string[] = [];
  try {
      if (announce?.property?.videos) {
          videosList = JSON.parse(announce.property.videos);
      }
  } catch (e) {
      console.error("Failed to parse videos", e);
  }

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
  const parseAmenitiesIds = (raw: any): string[] => {
    if (!raw) return []
    if (Array.isArray(raw)) return raw.map((x) => String(x))
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw)
        return parseAmenitiesIds(parsed)
      } catch {
        return []
      }
    }
    if (typeof raw === "object") {
      const out: string[] = []
      for (const v of Object.values(raw as Record<string, any>)) {
        if (Array.isArray(v)) out.push(...v.map((x) => String(x)))
      }
      return out
    }
    return []
  }

  const amenitiesIds = parseAmenitiesIds(property.amenities)

  // Parse specific amenities categories based on JSON structure in DB
  let kitchenEquipments: string[] = [];
  let bathroomTypes: string[] = [];
  
  if (property.amenities) {
      try {
          // It could be a stringified JSON string, or already parsed object depending on API
          let parsedAmenities = property.amenities;
          if (typeof property.amenities === 'string') {
             try {
                parsedAmenities = JSON.parse(property.amenities);
             } catch (e) {
                // If it fails, maybe it's just a raw string, ignore
             }
          }
          
          if (parsedAmenities && typeof parsedAmenities === 'object') {
              if (parsedAmenities.kitchenEquipment && Array.isArray(parsedAmenities.kitchenEquipment)) {
                  kitchenEquipments = parsedAmenities.kitchenEquipment;
              }
              
              if (parsedAmenities.bathroomType) {
                  if (Array.isArray(parsedAmenities.bathroomType)) {
                      bathroomTypes = parsedAmenities.bathroomType;
                  } else if (typeof parsedAmenities.bathroomType === 'string') {
                      bathroomTypes = [parsedAmenities.bathroomType];
                  }
              }
          }
      } catch (e) {
          console.error("Failed to parse amenities for specific categories", e);
      }
  }

  // Helper to map equipment IDs to labels
  const getEquipmentLabel = (id: string) => {
      const map: any = {
          plates: "Plaques",
          oven: "Four",
          hood: "Hotte",
          dishwasher: "Lave-vaisselle",
          microwave: "Micro-onde",
          fridge: "Frigo",
          washing_machine: "Machine à laver",
          no_appliances: "Vide"
      };
      return map[id] || id;
  };

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

      {/* --- ADVANCED SEARCH BAR REPLACED WITH AD SPACE --- */}
      <div className="bg-[#00BFA6] py-6 shadow-md relative z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="bg-white/20 rounded-xl p-8 flex flex-col items-center justify-center border-2 border-dashed border-white/40 min-h-[120px]">
                  <p className="text-white font-bold text-xl mb-2">Espace Publicitaire</p>
                  <p className="text-white/80 text-sm">
                      Publicité ciblée pour la catégorie : <span className="font-bold">{announce?.realEstateCategory || 'Immobilier'}</span>
                  </p>
             </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Images Grid - Modern Layout */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 px-2">{announce?.title || 'Galerie Photos'}</h2>
            
            {/* Gallery Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-4 hide-scrollbar px-2">
                {Object.keys(imagesByCategory).map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setActiveTab(cat)}
                        className={`px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap shadow-sm border-2 ${(activeTab === cat || (activeTab === 'ALL' && cat === Object.keys(imagesByCategory)[0])) ? 'border-[#00BFA6] bg-[#00BFA6] text-white' : 'border-gray-100 bg-white text-gray-600 hover:border-gray-300'}`}
                    >
                        {LABELS[cat] || cat} ({imagesByCategory[cat].length})
                    </button>
                ))}
                {videosList.length > 0 && (
                    <button 
                        onClick={() => setActiveTab('VIDEO')}
                        className={`px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap shadow-sm border-2 animate-pulse ${activeTab === 'VIDEO' ? 'border-blue-600 bg-blue-600 text-white shadow-blue-500/50' : 'border-blue-500 bg-blue-500 text-white shadow-blue-500/50'}`}
                    >
                        Vidéo ({videosList.length})
                    </button>
                )}
            </div>

            <div className="h-[400px] md:h-[500px] rounded-2xl overflow-hidden relative bg-gray-50">
                {activeTab === 'VIDEO' && videosList.length > 0 ? (
                    <div className="w-full h-full flex items-center justify-center bg-black">
                        <video 
                            src={getImageUrl(videosList[0]) || ''} 
                            controls 
                            className="w-full h-full object-contain"
                        />
                    </div>
                ) : displayImages.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">Aucune image disponible</div>
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
                        </div>

                        {/* Middle Column (Stacked - previously top middle) */}
                        <div className="hidden md:flex flex-col gap-2 col-span-1 row-span-2 h-full">
                            <div 
                                className={`flex-1 relative overflow-hidden ${displayImages[1] ? 'cursor-pointer group' : ''}`}
                                onClick={() => { if(displayImages[1]) { setActiveImage(allImages.indexOf(displayImages[1])); setShowGallery(true); } }}
                            >
                                {displayImages[1] ? (
                                    <>
                                        <img 
                                            src={getImageUrl(displayImages[1]?.url) || ''} 
                                            alt="View 2" 
                                            className="w-full h-full object-cover hover:opacity-95 transition-opacity"
                                        />
                                    </>
                                ) : (
                                    <div className="w-full h-full bg-gray-50 flex items-center justify-center border border-gray-100/50 rounded-lg">
                                    </div>
                                )}
                            </div>
                            <div 
                                className={`flex-1 relative overflow-hidden ${displayImages[2] ? 'cursor-pointer group' : ''}`}
                                onClick={() => { if(displayImages[2]) { setActiveImage(allImages.indexOf(displayImages[2])); setShowGallery(true); } }}
                            >
                                {displayImages[2] ? (
                                    <>
                                        <img 
                                            src={getImageUrl(displayImages[2]?.url) || ''} 
                                            alt="View 3" 
                                            className="w-full h-full object-cover hover:opacity-95 transition-opacity"
                                        />
                                    </>
                                ) : (
                                    <div className="w-full h-full bg-gray-50 flex items-center justify-center border border-gray-100/50 rounded-lg">
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column (Stacked) */}
                        <div className="hidden md:flex flex-col gap-2 col-span-1 row-span-2 h-full">
                            <div 
                                className={`flex-1 relative overflow-hidden rounded-tr-2xl ${displayImages[3] ? 'cursor-pointer group' : ''}`}
                                onClick={() => { if(displayImages[3]) { setActiveImage(allImages.indexOf(displayImages[3])); setShowGallery(true); } }}
                            >
                                {displayImages[3] ? (
                                    <>
                                        <img 
                                            src={getImageUrl(displayImages[3]?.url) || ''} 
                                            alt="View 4" 
                                            className="w-full h-full object-cover hover:opacity-95 transition-opacity"
                                        />
                                    </>
                                ) : (
                                    <div className="w-full h-full bg-gray-50 flex items-center justify-center border border-gray-100/50 rounded-lg">
                                    </div>
                                )}
                            </div>
                            <div 
                                className={`flex-1 relative overflow-hidden rounded-br-2xl ${displayImages[4] ? 'cursor-pointer group' : ''}`}
                                onClick={() => { if(displayImages[4]) { setActiveImage(allImages.indexOf(displayImages[4])); setShowGallery(true); } }}
                            >
                                {displayImages[4] ? (
                                    <>
                                        <img 
                                            src={getImageUrl(displayImages[4]?.url) || ''} 
                                            alt="View 5" 
                                            className="w-full h-full object-cover hover:opacity-95 transition-opacity"
                                        />
                                    </>
                                ) : (
                                    <div className="w-full h-full bg-gray-50 flex items-center justify-center border border-gray-100/50 rounded-lg">
                                    </div>
                                )}
                                
                                {/* "Show All" Button Overlay - Always visible on the last block if there are more images */}
                                <div className="absolute inset-0 bg-black/40 hover:bg-black/50 transition-colors flex flex-col items-center justify-center text-white cursor-pointer" onClick={(e) => {
                                             e.stopPropagation();
                                             setShowGallery(true);
                                             setActiveImage(0);
                                         }}>
                                    {displayImages.length > 5 && (
                                        <span className="text-3xl font-bold mb-2">+{displayImages.length - 5}</span>
                                    )}
                                    <Button 
                                        variant="secondary" 
                                        size="sm" 
                                        className="bg-white/90 text-gray-900 font-bold hover:bg-white gap-2 shadow-lg pointer-events-none"
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-8">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Header Information */}
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
                  <div className="text-sm text-gray-500 uppercase font-semibold mt-1 tracking-wide">{announce.type === 'RENTAL' ? 'Location' : announce.type === 'SALE' ? 'Vente' : announce.type}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-t border-b border-gray-100 mt-6">
                {/* 1. Typologie */}
                {property.typology && (
                    <div className="flex items-center gap-4 text-gray-700">
                        <Building2 className="h-8 w-8 text-gray-400 stroke-1" />
                        <div>
                            <div className="font-bold text-xl">{property.typology}</div>
                            <div className="text-sm text-gray-500">Typologie</div>
                        </div>
                    </div>
                )}
                
                {/* 2. Nombre d'étages */}
                {property.nbFloors && (
                    <div className="flex items-center gap-4 text-gray-700">
                        <Layers className="h-8 w-8 text-gray-400 stroke-1" />
                        <div>
                            <div className="font-bold text-xl">{property.nbFloors}</div>
                            <div className="text-sm text-gray-500">Étages</div>
                        </div>
                    </div>
                )}

                {/* 3. Surface (Terrain) */}
                {(property.landArea || property.builtArea) && (
                    <div className="flex items-center gap-4 text-gray-700">
                        <Square className="h-8 w-8 text-gray-400 stroke-1" />
                        <div>
                            <div className="font-bold text-xl">{property.landArea || property.builtArea} m²</div>
                            <div className="text-sm text-gray-500">Surface</div>
                        </div>
                    </div>
                )}

                {/* 4. Parking (Garage) */}
                {(property.garageCount > 0 || property.parkingCount > 0) && (
                    <div className="flex items-center gap-4 text-gray-700">
                        <Car className="h-8 w-8 text-gray-400 stroke-1" />
                        <div>
                            <div className="font-bold text-xl">{property.garageCount || property.parkingCount}</div>
                            <div className="text-sm text-gray-500">Parking</div>
                        </div>
                    </div>
                )}
              </div>

              {/* Contacts Row */}
              <div className="mt-8 flex flex-wrap gap-4 text-gray-600">
                  {(() => {
                      let contactsList = [];
                      try {
                          if (property.contacts) {
                              contactsList = JSON.parse(property.contacts);
                          }
                      } catch (e) {
                          console.error("Failed to parse contacts", e);
                      }

                      // If no contacts list but user has phone, use that
                      if (contactsList.length === 0 && announce.user?.phone) {
                          contactsList.push({ phone: announce.user.phone, hasWhatsapp: false, hasViber: false, hasTelegram: false });
                      }

                      return contactsList.map((contact: any, index: number) => (
                          <div key={index} className="relative group">
                              {/* Phone Button */}
                              <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl cursor-pointer transition-colors font-bold text-gray-900">
                                  <Phone className="h-4 w-4 text-[#00BFA6]" /> 
                                  {contact.phone}
                              </div>

                              {/* Hover Icons Dropdown */}
                              {(contact.hasWhatsapp || contact.hasViber || contact.hasTelegram) && (
                                  <div className="absolute top-full left-0 mt-2 p-2 bg-white rounded-xl shadow-xl border border-gray-100 flex gap-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 w-max">
                                      <a href={`tel:${contact.phone}`} className="p-2 hover:bg-gray-50 rounded-lg text-gray-600 transition-colors" title="Appeler">
                                          <Phone className="h-5 w-5" />
                                      </a>
                                      {contact.hasWhatsapp && (
                                          <a href={`https://wa.me/${contact.phone.replace(/\s+/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-[#25D366]/10 text-[#25D366] rounded-lg transition-colors" title="WhatsApp">
                                              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                          </a>
                                      )}
                                      {contact.hasViber && (
                                          <a href={`viber://add?number=${contact.phone.replace(/^0/, '+213').replace(/\s+/g, '')}`} className="p-2 hover:bg-[#7360f2]/10 text-[#7360f2] rounded-lg transition-colors" title="Viber">
                                              <svg viewBox="0 0 512 512" className="h-5 w-5 fill-current"><path d="M437.1 146.4c-6.1-24.5-22.3-43.9-46.7-48.4-38.3-6.9-106.8-6.9-134.4-6.9-27.6 0-96.1 0-134.4 6.9-24.4 4.5-40.6 23.9-46.7 48.4-5.3 21.6-5.3 64.1-5.3 109.6s0 88 5.3 109.6c6.1 24.5 22.3 43.9 46.7 48.4 38.3 6.9 106.8 6.9 134.4 6.9 27.6 0 96.1 0 134.4-6.9 24.4-4.5 40.6-23.9 46.7-48.4 5.3-21.6 5.3-64.1 5.3-109.6s0-88-5.3-109.6zm-175 145.4v13.5c0 23.8-19.3 43.1-43.1 43.1h-43.1c-23.8 0-43.1-19.3-43.1-43.1v-43.1c0-23.8 19.3-43.1 43.1-43.1h13.5v-67h-13.5c-23.8 0-43.1-19.3-43.1-43.1V66c0-23.8 19.3-43.1 43.1-43.1h43.1c23.8 0 43.1 19.3 43.1 43.1v43.1c0 23.8-19.3 43.1-43.1 43.1h-13.5v67zm120.3 43.1c0 23.8-19.3 43.1-43.1 43.1h-43.1c-23.8 0-43.1-19.3-43.1-43.1v-43.1c0-23.8 19.3-43.1 43.1-43.1h13.5v-67h-13.5c-23.8 0-43.1-19.3-43.1-43.1V66c0-23.8 19.3-43.1 43.1-43.1h43.1c23.8 0 43.1 19.3 43.1 43.1v43.1c0 23.8-19.3 43.1-43.1 43.1h-13.5v67h13.5c23.8 0 43.1 19.3 43.1 43.1v43.1z"/></svg>
                                          </a>
                                      )}
                                      {contact.hasTelegram && (
                                          <a href={`tg://resolve?domain=${contact.phone.replace(/^0/, '+213').replace(/\s+/g, '')}`} className="p-2 hover:bg-[#0088cc]/10 text-[#0088cc] rounded-lg transition-colors" title="Telegram">
                                              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12zm5.894-17.502L15.34 20.35c-.208.92-.746 1.144-1.503.682l-4.16-3.07-2.006 1.93c-.22.22-.405.405-.83.405l.3-4.225 7.684-6.94c.334-.3-.074-.466-.518-.214L4.8 15.38.704 14.1c-.89-.28-.908-.89.186-1.316l15.68-6.04c.725-.268 1.356.168 1.324 1.15z"/></svg>
                                          </a>
                                      )}
                                  </div>
                              )}
                          </div>
                      ));
                  })()}
            </div>
        </div>

          </div>

          {/* Sidebar - Contact */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-[100px] z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 bg-gray-200 rounded-full overflow-hidden">
                    {announce.user?.userType === 'SOCIETE' && announce.user?.agencyLogoUrl ? (
                        <img src={getImageUrl(announce.user.agencyLogoUrl) || ''} alt="Agency Logo" className="w-full h-full object-cover" />
                    ) : announce.user?.imageUrl ? (
                        <img src={getImageUrl(announce.user.imageUrl) || ''} alt="Agent" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                            <User className="h-8 w-8" />
                        </div>
                    )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">
                      {announce.user?.userType === 'SOCIETE' ? announce.user?.companyName : 'Annonceur'}
                  </h3>
                  <p className="text-sm text-gray-500">
                      {announce.user?.userType === 'SOCIETE' ? announce.user?.activity : 'Annonceur particulier'}
                  </p>
                </div>
              </div>

              {/* Contact Button */}
              <Button 
                  onClick={() => setIsContactModalOpen(true)}
                  className="w-full py-6 text-lg bg-[#00BFA6] hover:bg-[#00908A] text-white rounded-xl shadow-lg shadow-[#00BFA6]/20 flex items-center justify-center gap-2"
              >
                  <Mail className="h-5 w-5" />
                  Envoyer un message
              </Button>
            </div>
          </div>
        </div>

      {/* Details & Amenities Full Width */}
      <div className="w-full mb-8">
          {/* Caractéristiques Détaillées */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Caractéristiques Détaillées</h2>

              <div className="space-y-8">
                  {/* Ligne 01: Informations générales */}
                  <div>
                      <div className="flex items-center gap-2 mb-4">
                          <Building2 className="h-5 w-5 text-[#00BFA6]" />
                          <h3 className="text-lg font-bold text-gray-900">Informations générales</h3>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
                          {property.typology && (
                              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                  <span className="text-gray-500 font-medium text-sm">Typologie</span>
                                  <span className="font-bold text-gray-900 text-sm">{property.typology}</span>
                              </div>
                          )}
                          {property.nbFloors !== undefined && (
                              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                  <span className="text-gray-500 font-medium text-sm">Nombre d'étages</span>
                                  <span className="font-bold text-gray-900 text-sm">{property.nbFloors}</span>
                              </div>
                          )}
                          {property.landArea !== undefined && (
                              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                  <span className="text-gray-500 font-medium text-sm">Surface terrain</span>
                                  <span className="font-bold text-gray-900 text-sm">{property.landArea} m²</span>
                              </div>
                          )}
                          {property.state && (
                              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                  <span className="text-gray-500 font-medium text-sm">État général</span>
                                  <span className="font-bold text-gray-900 text-sm">{LABELS[property.state] || property.state}</span>
                              </div>
                          )}
                      </div>
                  </div>

                  {/* Ligne 02: Espace de Vie */}
                  <div>
                      <div className="flex items-center gap-2 mb-4">
                          <BedDouble className="h-5 w-5 text-[#00BFA6]" />
                          <h3 className="text-lg font-bold text-gray-900">Espace de Vie</h3>
                      </div>
                      <div className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
                              {property.nbBedrooms !== undefined && (
                                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                      <span className="text-gray-500 font-medium text-sm">Nombre de chambres</span>
                                      <span className="font-bold text-gray-900 text-sm">{property.nbBedrooms}</span>
                                  </div>
                              )}
                              {property.nbSuites !== undefined && (
                                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                      <span className="text-gray-500 font-medium text-sm">Suites parentales</span>
                                      <span className="font-bold text-gray-900 text-sm">{property.nbSuites}</span>
                                  </div>
                              )}
                              {property.nbLivingRooms !== undefined && (
                                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                      <span className="text-gray-500 font-medium text-sm">Salons</span>
                                      <span className="font-bold text-gray-900 text-sm">{property.nbLivingRooms}</span>
                                  </div>
                              )}
                              {property.nbToilets !== undefined && (
                                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                      <span className="text-gray-500 font-medium text-sm">Toilettes</span>
                                      <span className="font-bold text-gray-900 text-sm">{property.nbToilets}</span>
                                  </div>
                              )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
                              {property.nbBathrooms !== undefined && (
                                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                      <span className="text-gray-500 font-medium text-sm">Salles de bain</span>
                                      <span className="font-bold text-gray-900 text-sm">{property.nbBathrooms}</span>
                                  </div>
                              )}
                              {(property.bathroomType || bathroomTypes.length > 0) && (
                                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                      <span className="text-gray-500 font-medium text-sm">Type de salle de bain</span>
                                      <span className="font-bold text-gray-900 text-sm text-right">
                                          {bathroomTypes.length > 0 
                                              ? bathroomTypes.map(t => LABELS[t] || t).join(', ')
                                              : ((property.bathroomType === 'LES_DEUX' || property.bathroomType === 'les_deux' || property.bathroomType === 'both') 
                                                  ? 'Baignoire et douche italienne' 
                                                  : (LABELS[property.bathroomType] || property.bathroomType))}
                                      </span>
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>

                  {/* Ligne 03: Cuisine et équipements */}
                  <div>
                      <div className="flex items-center gap-2 mb-4">
                          <Wind className="h-5 w-5 text-[#00BFA6]" />
                          <h3 className="text-lg font-bold text-gray-900">Cuisine et équipements</h3>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
                          {property.kitchenType && (
                              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                  <span className="text-gray-500 font-medium text-sm">Type de cuisine</span>
                                  <span className="font-bold text-gray-900 text-sm">{LABELS[property.kitchenType] || property.kitchenType}</span>
                              </div>
                          )}
                          {(kitchens.length > 0 || kitchenEquipments.length > 0) && (
                              <div className="flex justify-between items-center py-2 border-b border-gray-100 md:col-span-3">
                                  <span className="text-gray-500 font-medium text-sm">Équipements</span>
                                  <span className="font-bold text-gray-900 text-sm text-right">
                                      {kitchenEquipments.length > 0 
                                          ? kitchenEquipments.map(k => getEquipmentLabel(k)).join(', ')
                                          : kitchens.map(k => k.label).join(', ')}
                                  </span>
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      </div>
      </div>
      
      {/* Contact Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-bold text-gray-900 text-xl flex items-center gap-2">
                        <Mail className="h-5 w-5 text-[#00BFA6]" />
                        Contacter l'annonceur
                    </h3>
                    <button 
                        onClick={() => setIsContactModalOpen(false)}
                        className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-gray-600 shadow-sm"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="p-6">
                    <form className="space-y-4">
                        <input type="text" placeholder="Nom et Prénom" className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-[#00BFA6] focus:ring-0 outline-none bg-white placeholder-gray-400 font-medium text-gray-900 transition-colors" />
                        <input type="tel" placeholder="Téléphone" className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-[#00BFA6] focus:ring-0 outline-none bg-white placeholder-gray-400 font-medium text-gray-900 transition-colors" />
                        <textarea rows={4} placeholder="Bonjour, je suis intéressé par ce bien. J'aimerais avoir plus de détails..." className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-[#00BFA6] focus:ring-0 outline-none bg-white placeholder-gray-400 font-medium text-gray-900 transition-colors resize-none"></textarea>
                        
                        <Button 
                            className="w-full py-6 text-lg bg-[#00BFA6] hover:bg-[#00908A] text-white rounded-xl shadow-lg shadow-[#00BFA6]/20 mt-4 font-bold"
                            onClick={(e) => {
                                e.preventDefault();
                                // TODO: Handle message submission
                                setIsContactModalOpen(false);
                            }}
                        >
                            Envoyer
                        </Button>
                    </form>
                </div>
            </div>
        </div>
      )}

    </div>
  )
}
