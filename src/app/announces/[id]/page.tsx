"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft, MapPin, BedDouble, Square, Heart, Share2,
  Phone, Mail, User, Check, Building2, Car, Wind, Sun,
  Warehouse, Archive, ParkingCircle, DoorOpen, Flower2, Cctv, Waves, X, Layers, Users, FileText, Handshake,
  Factory, Key, Zap, Truck, Shield, Ruler, LayoutGrid, Store, Search
} from "lucide-react"
import { AMENITIES_DATA } from "@/data/amenities"
import { PROPERTY_TYPES } from "@/data/propertyTypes"
import Link from "next/link"

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
    
    // Categories (Images) - Résidentiel
    bedrooms: "Chambres",
    bathrooms: "Salles de bain & WC",
    kitchen: "Cuisine",
    exterior: "Extérieur",
    common: "Espaces communs",
    other: "Autres",
    general: "Général",
    // Categories (Images) - Industriel
    equipements: "Équipements",
    bureaux: "Bureaux et Annexes",
    hebergement: "Hébergement",
    espaces_communs: "Espaces Communs",
    autres: "Autres",
    non_classees: "Autres",
    // Industrial labels
    MURS_NUS: "Murs nus (Vide)",
    EQUIPEE: "Équipée (Clé en main)",
    NEUF: "Neuf (Jamais servi)",
    BON_ETAT_MARCHE: "Bon état",
    ANCIEN: "Ancien (À réviser)",
    PLAIN_PIED: "Plain-pied (RDC)",
    ETAGES: "À étages",
    ZONE_INDUSTRIELLE: "Zone industrielle (ZI/ZAC)",
    ZONE_URBAINE: "Zone urbaine (Ville)",
    SEMI_REMORQUE: "Semi-remorque (40 T)",
    CAMIONNETTE: "Camionnette (3.5 T)",
    PETIT_PORTEUR: "Petit porteur (10T)",
    QUAI_DECHARGEMENT: "Quai de déchargement",
    ENTREE_PLAIN_PIED: "Entrée de plain-pied",
    VESTIAIRES: "Vestiaires",
    REFECTOIRE: "Réfectoire",
    SANITAIRES_HF: "Sanitaires H/F",
    LOGEMENT_FONCTION: "Logement",
    DORTOIRS: "Dortoirs",
    POSTE_GARDE: "Poste de garde",
    CLOTURE_MACONNEE: "Clôture maçonnée",
    CAMERAS: "Caméras",
    INDUSTRIEL: "Industriel",
    VILLE: "De ville",
    AUCUN: "Aucun",
    RESEAU_ADE: "Réseau ADE",
    FORAGE: "Forage",
    BACHE_EAU: "Bâche à eau",
    RESEAU_PUBLIC: "Réseau public",
    FOSSE_INDUSTRIELLE: "Fosse septique",
    RIA: "R.I.A",
    SPRINKLERS: "Sprinklers",
    COLONNES_SECHES: "Colonnes sèches",
    MOTOPOMPE: "Motopompe",
    AGROALIMENTAIRE: "Agroalimentaire",
    PHARMACEUTIQUE_COSMETIQUE: "Pharmaceutique / Cosmétique",
    CHIMIQUE: "Chimique",
    MATERIAUX_CONSTRUCTION: "Matériaux de construction",
    PLASTURGIE_EMBALLAGE: "Plasturgie & Emballage",
    SIDERURGIE_METALLURGIE: "Sidérurgie & Métallurgie",
    TEXTILE_CUIR: "Textile & Cuir",
    ELECTROMENAGER_ELECTRONIQUE: "Électroménager & Électronique",
    MECANIQUE_AUTOMOBILE: "Mécanique & Automobile",
    RECYCLAGE_ENVIRONNEMENT: "Recyclage & Environnement",
    PAPIER_EDITION: "Papier & Édition",
    AUTRE_ACTIVITE: "Autre activité",

    // Chambre froide - Secteurs
    AGROALIMENTAIRE_CF: "Agroalimentaire",
    GLACES_SURGELES: "Glaces & Surgelés",
    PHARMACEUTIQUE_CF: "Pharmaceutique",
    CHIMIQUE_CF: "Chimique",
    HORTICOLE_AGRICOLE: "Horticole & Agricole",
    AUTRE_CF: "Autre activité",
    // Chambre froide - Structure
    CELLULE_UNIQUE: "Cellule unique (Une seule chambre)",
    COMPLEXE_FRIGORIFIQUE: "Plusieurs cellules (Complexe frigorifique)",
    // Chambre froide - Zone déchargement
    QUAI_NIVELEUR_SAS: "Quai niveleur SAS étanche",
    QUAI_SIMPLE: "Quai simple",
    PLAIN_PIED_DECHARGT: "Plain-pied",
    // Chambre froide - Traçabilité
    ENREGISTREUR_T24: "Enregistreur T° H24",
    SYSTEME_ALERTE_SMS: "Système d'alerte SMS",
    // Chambre froide - Technique froid
    SOL_CHAUFFANT: "Sol chauffant (Anti-gel dalle)",
    DEGIVRAGE_AUTO: "Dégivrage automatique",
    // Chambre froide - Mode de gestion
    SANS_GESTION: "Sans gestion (Murs seuls)",
    AVEC_GESTION: "Avec gestion (Service complet)",
    // Chambre froide - Flexibilité
    SURFACE_DEDIEE: "Surface dédiée",
    CO_STOCKAGE: "Co-stockage",
    // Chambre froide - Type de froid
    POSITIF: "Positif",
    NEGATIF: "Négatif",
    ULTRA_FROID: "Ultra Froid",
    // Chambre froide - Mode de diffusion
    FROID_VENTILE: "Froid Ventilé",
    FROID_STATIQUE: "Froid Statique",
    // Chambre froide - Durée engagement
    ANNUELLE: "Annuelle (Bail long terme)",
    MENSUELLE_HEBDO: "Mensuelle / Hebdomadaire",
    JOURNEE_SPOT: "À la journée (Stockage Spot)",
    // Logistique verticale
    RAMPE: "Rampe d'accès",
    MONTE_CHARGE: "Monte-charge",

    // Terrain
    PLAT: "Plat",
    EN_PENTE: "En pente",
    ACCIDENTE: "Accidenté (escarpé)",
    LOTISSEMENT_CLASSIQUE: "Lotissement classique",
    COOPERATIVE_IMMOBILIERE: "Coopérative immobilière",
    RESIDENCE_FERMEE: "Résidence fermée",
    ACTE_PROPRIETE: "Acte de propriété (Notarié)",
    LIVRET_FONCIER: "Livret foncier",
    CERTIFICAT_URBANISME: "Certificat d'urbanisme",
    PERMIS_CONSTRUIRE: "Permis de construire",
    PLAN_MASSE: "Plan de masse",
    EAU: "Eau (ADE)",
    ELECTRICITE: "Électricité (Sonelgaz)",
    ASSAINISSEMENT: "Assainissement",
    INTERNET: "Internet / Fibre",
    // Terrain photo categories
    vue_generale: "Vue générale",
    environnement: "Environnement",

    // Hangar - Usage
    STOCKAGE_LOGISTIQUE: "Stockage",
    PRODUCTION_INDUSTRIEL: "Production",

    // Terrain Agricole
    M2: "m²", HA: "Hectare (ha)", DOUNEM: "Dounem",
    MARAICHAGE: "Maraîchage", ARBORICULTURE: "Arboriculture fruitière", VITICULTURE: "Viticulture",
    CEREALES: "Céréales", ELEVAGE: "Élevage", APICULTURE: "Apiculture", SERRES: "Serres / hors-sol",
    PUITS: "Puits", CANAL_IRRIGATION: "Canal d'irrigation", BARRAGE_RETENUE: "Barrage / retenue d'eau",
    BASSIN_COLLECTE: "Bassin de collecte",
    NORD: "Nord", SUD: "Sud", EST: "Est", OUEST: "Ouest",
    NORD_EST: "Nord-Est", NORD_OUEST: "Nord-Ouest", SUD_EST: "Sud-Est", SUD_OUEST: "Sud-Ouest",
    ELEVE: "Élevé", MOYEN: "Moyen", FAIBLE: "Faible",

    // Showroom
    MODERNE: "Moderne / Contemporain", CLASSIQUE: "Classique / Traditionnel",
    INDUSTRIEL_STYLE: "Industriel (Loft)", HAUSSMANNIEN: "Haussmannien / Prestige",
    BETON_ARME: "Béton armé", STRUCTURE_METALLIQUE: "Structure métallique",

    // Local Commercial
    GALERIE_MARCHANDE: "Galerie marchande / Centre commercial",
    RUE_COMMERCANTE: "Rue commerçante",
    ZONE_ACTIVITE: "Zone d'activité commerciale",
    MARCHE: "Marché / souk",
    COMMERCIALE: "Zone commerciale", RESIDENTIELLE: "Zone résidentielle",
    MAGASIN_VENTE: "Magasin de vente / Boutique",
    SHOWROOM_USAGE: "Showroom / Exposition", DEPOT_VENTE: "Dépôt-vente / Stockage",
    PHARMACIE: "Pharmacie", ALIMENTATION: "Alimentation générale",
    CAFE_RESTAURANT: "Café / Restaurant", BUREAU: "Bureau / Cabinet",

    // Bloc Administratif
    OPEN_SPACE: "Open-space (bureaux paysagers)", CLOISONNE: "Bureaux cloisonnés",
    AMOVIBLE: "Amovible (modulable)", FIXE: "Fixe", VITRE: "Vitré",
    FIBRE_OPTIQUE: "Fibre optique", ADSL_VDSL: "ADSL / VDSL", PAS_RESEAU: "Pas de réseau",
    CABLEE: "Câblée (RJ45)", WIFI: "Wi-Fi",
    ARMOIRE_SERVEUR: "Armoire serveur", DATA_ROOM: "Data room / Salle serveurs",
    GROUPE_ELECTROGENE: "Groupe électrogène", ONDULEUR_UPS: "Onduleur (UPS)",

    // Heating & AC Types
    CENTRAL: "Central",
    SOL: "Au Sol",
    GAZ: "À Gaz",
    SPLIT: "Split",
    NONE: "Sans",
    SANS: "Sans",
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
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [reportReason, setReportReason] = useState("")
  const [reportSent, setReportSent] = useState(false)
  const [boutiqueAnnounces, setBoutiqueAnnounces] = useState<any[]>([])

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
          if (data?.user?.userType === 'SOCIETE' && data?.user?.id) {
            try {
              const boutiqueRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/announces/user/${data.user.id}`)
              if (boutiqueRes.ok) {
                const boutiqueData = await boutiqueRes.json()
                setBoutiqueAnnounces(boutiqueData.filter((a: any) => a.id !== data.id).slice(0, 4))
              }
            } catch {}
          }
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
  let securityFeatures: string[] = [];
  let connectivityFeatures: string[] = [];
  let exteriorFeatures: string[] = [];
  let buildingTypology: any = null;
  let industrialFactory: any = null;
  let coldRoom: any = null;
  let hangar: any = null;
  let terrain: any = null;
  let showroom: any = null;
  let local: any = null;
  let bloc: any = null;
  
  if (property.amenities) {
      try {
          // It could be a stringified JSON string, or already parsed object depending on API
          let parsedAmenities = property.amenities;
          if (typeof property.amenities === 'string') {
             let jsonStr = property.amenities.trim();
             try {
                parsedAmenities = JSON.parse(jsonStr);
             } catch (e) {
                // Try to recover truncated JSON object
                if (jsonStr.startsWith('{') && !jsonStr.endsWith('}')) {
                    try {
                        const lastValidBracket = jsonStr.lastIndexOf(']');
                        if (lastValidBracket > 0) {
                            jsonStr = jsonStr.substring(0, lastValidBracket + 1) + '}';
                            parsedAmenities = JSON.parse(jsonStr);
                        }
                    } catch (innerE) {
                        console.error("Failed to recover amenities JSON string", innerE);
                    }
                }
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

              if (parsedAmenities.securityFeatures && Array.isArray(parsedAmenities.securityFeatures)) {
                  securityFeatures = parsedAmenities.securityFeatures;
              }
              
              if (parsedAmenities.connectivity && Array.isArray(parsedAmenities.connectivity)) {
                  connectivityFeatures = parsedAmenities.connectivity;
              }

              if (parsedAmenities.exteriorFeatures && Array.isArray(parsedAmenities.exteriorFeatures)) {
                  exteriorFeatures = parsedAmenities.exteriorFeatures;
              } else if (parsedAmenities.exterior && Array.isArray(parsedAmenities.exterior)) {
                  exteriorFeatures = parsedAmenities.exterior;
              }
              
              if (parsedAmenities.buildingTypology && typeof parsedAmenities.buildingTypology === 'object') {
                  buildingTypology = parsedAmenities.buildingTypology;
              }

              if (parsedAmenities.industrialFactory && typeof parsedAmenities.industrialFactory === 'object') {
                  industrialFactory = parsedAmenities.industrialFactory;
              }

              if (parsedAmenities.coldRoom && typeof parsedAmenities.coldRoom === 'object') {
                  coldRoom = parsedAmenities.coldRoom;
              }

              if (parsedAmenities.hangar && typeof parsedAmenities.hangar === 'object') {
                  hangar = parsedAmenities.hangar;
              }

              if (parsedAmenities.terrain && typeof parsedAmenities.terrain === 'object') {
                  terrain = parsedAmenities.terrain;
              }

              if (parsedAmenities.showroom && typeof parsedAmenities.showroom === 'object') {
                  showroom = parsedAmenities.showroom;
              }

              if (parsedAmenities.local && typeof parsedAmenities.local === 'object') {
                  local = parsedAmenities.local;
              }

              if (parsedAmenities.bloc && typeof parsedAmenities.bloc === 'object') {
                  bloc = parsedAmenities.bloc;
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
          no_appliances: "Vide",
          // Security
          cameras: "Caméras",
          alarm: "Alarme",
          guard: "Gardiennage 24/7",
          intercom: "Interphone",
          digicode: "Digicode",
          // Connectivity
          fiber: "Fibre",
          adsl: "ADSL",
          phone_line: "Ligne fixe",
          // Exterior
          garden: "Jardin",
          terrace: "Terrasse",
          balcony: "Balcon",
          elevator: "Ascenseur",
          pool: "Piscine",
          playground: "Espace de jeux",
          barbecue: "Barbecue"
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
  const normalizedTransactionType = (() => {
      const t = typeof announce?.type === "string" ? announce.type.toUpperCase() : ""
      if (t === "VENTE") return "SALE"
      if (t === "LOCATION") return "RENTAL"
      return t
  })()
  const isRental = normalizedTransactionType === 'RENTAL';
  const isVillaRental = isVilla && isRental;
  const isSale = normalizedTransactionType === 'SALE';
  const normalizedState = typeof property?.state === "string" ? property.state.toUpperCase() : ""
  const isSaleVillaDemolition = isSale && isVilla && (normalizedState === "A_DEMOLIR" || normalizedState.includes("DEMOLIR"))
  
  const normalizedPropertyType = typeof property.propertyType === "string" ? property.propertyType.toUpperCase() : "";
  const isFactoryRental = isRental && normalizedPropertyType === "USINE"
  const isColdRoomRental = isRental && normalizedPropertyType === "CHAMBRE_FROIDE"
  const isHangarRental = isRental && normalizedPropertyType === "HANGAR"
  const isTerrainRental = isRental && (normalizedPropertyType === "TERRAIN_RESIDENTIEL" || normalizedPropertyType === "TERRAIN_INDUSTRIEL")
  const isTerrainAgricoleProperty = normalizedPropertyType === "TERRAIN_AGRICOLE"
  const isTerrainTouristiqueProperty = normalizedPropertyType === "TERRAIN_TOURISTIQUE"
  const isIndustrialRental = isFactoryRental || isColdRoomRental || isHangarRental
  const isSpecialRental = isIndustrialRental || isTerrainRental || isTerrainTouristiqueProperty || isTerrainAgricoleProperty
  const isShowroomProperty = normalizedPropertyType === "SHOWROOM"
  const isLocalCommercialProperty = normalizedPropertyType === "LOCAL_COMMERCIAL"
  const isBlocAdministratifProperty = normalizedPropertyType === "BLOC_ADMINISTRATIF"
  const isSaleBuildingDemolition =
      isSale &&
      normalizedPropertyType === "IMMEUBLE_RESIDENTIEL" &&
      (normalizedState === "A_DEMOLIR" || normalizedState.includes("DEMOLIR"))
  const isSaleDemolition = isSaleVillaDemolition || isSaleBuildingDemolition
  const propertyTypeLabel = PROPERTY_TYPES.find((t) => t.id === normalizedPropertyType)?.label || property.propertyType;
  const hasElevator = exteriorFeatures.includes("elevator");
  const displayArea = property.area ?? property.habitableArea ?? property.builtArea ?? property.landArea;
  const formatUnitFloor = (v: any) => {
      const n = Number(v);
      if (!Number.isFinite(n)) return String(v);
      const i = Math.trunc(n);
      if (i === 0) return "RDC";
      if (i === 1) return "1er";
      return `${i}ème`;
  }

  const formatFloorsLabel = (v: any) => {
      const n = Number(v)
      if (!Number.isFinite(n)) return "Étages"
      return n === 1 ? "Étage" : "Étages"
  }
  
  const tagBaseClass = "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold leading-none";
  const tagNeutralClass = `${tagBaseClass} bg-white text-gray-700 border-gray-200`;
  const tagPrimaryClass = `${tagBaseClass} bg-[#00BFA6]/10 text-[#007B73] border-[#00BFA6]/25`;

  const legalDocuments = (() => {
      const v: any = (property as any)?.legalDocuments
      if (!v) return []
      if (Array.isArray(v)) return v.filter(Boolean).map(String)
      if (typeof v === "string") {
          const s = v.trim()
          if (!s) return []
          try {
              const j = JSON.parse(s)
              if (Array.isArray(j)) return j.filter(Boolean).map(String)
          } catch {}
          if (s.includes(",")) return s.split(",").map(x => x.trim()).filter(Boolean)
          return [s]
      }
      return []
  })()

  const getLegalDocumentLabel = (id: string) => {
      const up = String(id || "").toUpperCase()
      if (up.includes("ACTE")) return "Acte de propriété"
      if (up.includes("LIVRET")) return "Livret foncier"
      if (up.includes("CONFORM")) return "Certificat de conformité"
      return (LABELS as any)[id] || id
  }

  const acceptsBankCreditValue: any = (property as any)?.acceptsBankCredit ?? (announce as any)?.acceptsBankCredit
  const acceptsBankCreditLabel =
      acceptsBankCreditValue === "YES" ? "Oui" :
      acceptsBankCreditValue === "NO" ? "Non" :
      acceptsBankCreditValue === "NO_PREFERENCE" ? "Pas de préférence" :
      acceptsBankCreditValue ? String(acceptsBankCreditValue) : "Non spécifié"

  const toIntlDigits = (raw: string) => {
      const digits = String(raw || "").replace(/\D/g, "")
      if (!digits) return ""
      if (digits.startsWith("2130")) return "213" + digits.slice(4)
      if (digits.startsWith("213")) return digits
      if (digits.startsWith("0")) return "213" + digits.slice(1)
      return digits
  }
  const formatDisplayPhone = (raw: string) => {
      const digits = String(raw || "").replace(/\D/g, "")
      if (!digits) return raw
      if (digits.startsWith("213")) return `+213 ${digits.slice(3)}`
      return raw
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header / Nav Removed */}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Images Grid - Modern Layout */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
            <div className="flex justify-between items-center mb-6 px-2">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="h-6 w-6 text-gray-700" />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-900">{announce?.title || 'Galerie Photos'}</h2>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="text-gray-500 border-gray-200 hover:text-gray-900 hover:bg-gray-50 shadow-sm">
                        <Heart className="h-5 w-5" />
                    </Button>
                    <Button variant="outline" size="icon" className="text-gray-500 border-gray-200 hover:text-gray-900 hover:bg-gray-50 shadow-sm">
                        <Share2 className="h-5 w-5" />
                    </Button>
                </div>
            </div>
            
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

            <div className="h-[360px] md:h-[440px] lg:h-[500px] rounded-2xl overflow-hidden relative bg-gray-50">
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
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                      <h1 className="text-3xl font-bold text-gray-900">{propertyTypeLabel}</h1>
                      {isHangarRental && hangar?.globalState && (
                          <span className="px-3 py-1 bg-[#00BFA6]/10 text-[#00BFA6] text-xs font-bold rounded-full border border-[#00BFA6]/20">
                              {LABELS[hangar.globalState] || hangar.globalState}
                          </span>
                      )}
                      {isFactoryRental && industrialFactory?.globalState && (
                          <span className="px-3 py-1 bg-[#00BFA6]/10 text-[#00BFA6] text-xs font-bold rounded-full border border-[#00BFA6]/20">
                              {LABELS[industrialFactory.globalState] || industrialFactory.globalState}
                          </span>
                      )}
                      {isColdRoomRental && coldRoom?.etatGlobal && (
                          <span className="px-3 py-1 bg-[#00BFA6]/10 text-[#00BFA6] text-xs font-bold rounded-full border border-[#00BFA6]/20">
                              {LABELS[coldRoom.etatGlobal] || coldRoom.etatGlobal}
                          </span>
                      )}
                      {property.state && (
                          <span className="px-3 py-1 bg-[#00BFA6]/10 text-[#00BFA6] text-xs font-bold rounded-full border border-[#00BFA6]/20">
                              {LABELS[property.state] || property.state}
                          </span>
                      )}
                  </div>
                  <div className="flex items-center text-gray-500 text-lg">
                    <MapPin className="h-5 w-5 mr-2 text-[#00BFA6]" />
                    {property.address?.town?.nameFr || property.address?.street}, {property.address?.town?.city?.nameFr}
                    {property.mapsLink && (
                      <a href={property.mapsLink} target="_blank" rel="noopener noreferrer" className="ml-3 flex items-center gap-1 text-sm text-blue-500 hover:text-blue-700 font-medium">
                        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current shrink-0"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                        Voir sur Maps
                      </a>
                    )}
                  </div>
                  {property.availableDate && (() => {
                    try {
                      const d = new Date(property.availableDate)
                      if (!isNaN(d.getTime()) && d > new Date()) {
                        return (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold rounded-full">
                              🕐 Disponible à partir du {d.toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        )
                      }
                    } catch {}
                    return null
                  })()}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-[#00BFA6]">
                      {isSpecialRental
                          ? (announce.price !== undefined && announce.price !== null && Number(announce.price) > 0
                              ? `${Number(announce.price).toLocaleString()} DZD`
                              : "Prix après visite")
                          : (announce.price !== undefined && announce.price !== null
                              ? `${announce.price.toLocaleString()} DZD`
                              : "Non spécifié")}
                  </div>
                  <div className="text-sm text-gray-500 font-semibold mt-1 tracking-wide flex items-center justify-end gap-2">
                      <span className="uppercase">{isRental ? 'Location' : isSale ? 'Vente' : announce.type}</span>
                      {(!isSpecialRental || (announce.price !== undefined && announce.price !== null && Number(announce.price) > 0)) && announce.priceType && (
                          <>
                              <span className="text-gray-300">|</span>
                              <span className="text-gray-600">{announce.priceType === 'FIXED' ? 'Prix Fixe' : announce.priceType === 'NEGOTIABLE' ? 'Prix Négociable' : 'Offert'}</span>
                          </>
                      )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-between items-center gap-6 py-5 border-t border-b border-gray-100 mt-5">
                {isFactoryRental ? (
                  <div className="w-full flex items-center justify-between gap-3">
                    {/* Secteur d'activité */}
                    {industrialFactory?.sector?.[0] && (
                      <div className="flex items-center gap-2 text-gray-700 min-w-0">
                        <Factory className="h-6 w-6 text-gray-400 stroke-1 shrink-0" />
                        <div className="min-w-0">
                          <div className="font-bold text-base truncate">
                            {industrialFactory.sector[0] === "AUTRE_ACTIVITE"
                              ? (industrialFactory.sectorOther || "Autre activité")
                              : (LABELS[industrialFactory.sector[0]] || industrialFactory.sector[0])}
                          </div>
                          <div className="text-xs text-gray-500">Activité compatible</div>
                        </div>
                      </div>
                    )}
                    <div className="h-8 w-px bg-gray-200 shrink-0" />
                    {/* Surface Terrain */}
                    {industrialFactory?.surfaces?.landArea != null && (
                      <div className="flex items-center gap-2 text-gray-700 shrink-0">
                        <Ruler className="h-6 w-6 text-gray-400 stroke-1 shrink-0" />
                        <div>
                          <div className="font-bold text-base">{industrialFactory.surfaces.landArea} m²</div>
                          <div className="text-xs text-gray-500">Surf. Terrain</div>
                        </div>
                      </div>
                    )}
                    <div className="h-8 w-px bg-gray-200 shrink-0" />
                    {/* Surface Bâtie */}
                    {industrialFactory?.surfaces?.builtArea != null && (
                      <div className="flex items-center gap-2 text-gray-700 shrink-0">
                        <Warehouse className="h-6 w-6 text-gray-400 stroke-1 shrink-0" />
                        <div>
                          <div className="font-bold text-base">{industrialFactory.surfaces.builtArea} m²</div>
                          <div className="text-xs text-gray-500">Surf. Bâtie</div>
                        </div>
                      </div>
                    )}
                    <div className="h-8 w-px bg-gray-200 shrink-0" />
                    {/* Surface Libre */}
                    {industrialFactory?.surfaces?.freeArea != null && (
                      <div className="flex items-center gap-2 text-gray-700 shrink-0">
                        <Square className="h-6 w-6 text-gray-400 stroke-1 shrink-0" />
                        <div>
                          <div className="font-bold text-base">{industrialFactory.surfaces.freeArea} m²</div>
                          <div className="text-xs text-gray-500">Surf. Libre</div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : isColdRoomRental ? (
                  <div className="w-full flex items-center justify-between gap-3">
                    {coldRoom?.structureType && (
                      <div className="flex items-center gap-2 text-gray-700 shrink-0">
                        <Layers className="h-6 w-6 text-gray-400 stroke-1 shrink-0" />
                        <div>
                          <div className="font-bold text-base">{LABELS[coldRoom.structureType] || coldRoom.structureType}</div>
                          <div className="text-xs text-gray-500">Structure</div>
                        </div>
                      </div>
                    )}
                    <div className="h-8 w-px bg-gray-200 shrink-0" />
                    {coldRoom?.dimensions?.length != null && (
                      <div className="flex items-center gap-2 text-gray-700 shrink-0">
                        <Square className="h-6 w-6 text-gray-400 stroke-1 shrink-0" />
                        <div>
                          <div className="font-bold text-base">{coldRoom.dimensions.length} ml</div>
                          <div className="text-xs text-gray-500">Longueur</div>
                        </div>
                      </div>
                    )}
                    <div className="h-8 w-px bg-gray-200 shrink-0" />
                    {coldRoom?.dimensions?.width != null && (
                      <div className="flex items-center gap-2 text-gray-700 shrink-0">
                        <Square className="h-6 w-6 text-gray-400 stroke-1 shrink-0" />
                        <div>
                          <div className="font-bold text-base">{coldRoom.dimensions.width} ml</div>
                          <div className="text-xs text-gray-500">Largeur</div>
                        </div>
                      </div>
                    )}
                    <div className="h-8 w-px bg-gray-200 shrink-0" />
                    {coldRoom?.dimensions?.height != null && (
                      <div className="flex items-center gap-2 text-gray-700 shrink-0">
                        <Layers className="h-6 w-6 text-gray-400 stroke-1 shrink-0" />
                        <div>
                          <div className="font-bold text-base">{coldRoom.dimensions.height} ml</div>
                          <div className="text-xs text-gray-500">Hauteur</div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : isHangarRental ? (
                  <div className="w-full flex items-center justify-between gap-3">
                    {hangar?.surfaces?.terrain != null && (
                      <div className="flex items-center gap-2 text-gray-700 shrink-0">
                        <Ruler className="h-6 w-6 text-gray-400 stroke-1 shrink-0" />
                        <div>
                          <div className="font-bold text-base">{hangar.surfaces.terrain} m²</div>
                          <div className="text-xs text-gray-500">Surf. Terrain</div>
                        </div>
                      </div>
                    )}
                    <div className="h-8 w-px bg-gray-200 shrink-0" />
                    {hangar?.surfaces?.covered != null && (
                      <div className="flex items-center gap-2 text-gray-700 shrink-0">
                        <Ruler className="h-6 w-6 text-gray-400 stroke-1 shrink-0" />
                        <div>
                          <div className="font-bold text-base">{hangar.surfaces.covered} m²</div>
                          <div className="text-xs text-gray-500">Surf. Couverte</div>
                        </div>
                      </div>
                    )}
                    <div className="h-8 w-px bg-gray-200 shrink-0" />
                    {hangar?.dimensions?.length != null && (
                      <div className="flex items-center gap-2 text-gray-700 shrink-0">
                        <Square className="h-6 w-6 text-gray-400 stroke-1 shrink-0" />
                        <div>
                          <div className="font-bold text-base">{hangar.dimensions.length} ml</div>
                          <div className="text-xs text-gray-500">Longueur</div>
                        </div>
                      </div>
                    )}
                    <div className="h-8 w-px bg-gray-200 shrink-0" />
                    {hangar?.dimensions?.width != null && (
                      <div className="flex items-center gap-2 text-gray-700 shrink-0">
                        <Square className="h-6 w-6 text-gray-400 stroke-1 shrink-0" />
                        <div>
                          <div className="font-bold text-base">{hangar.dimensions.width} ml</div>
                          <div className="text-xs text-gray-500">Largeur</div>
                        </div>
                      </div>
                    )}
                    <div className="h-8 w-px bg-gray-200 shrink-0" />
                    {hangar?.dimensions?.height != null && (
                      <div className="flex items-center gap-2 text-gray-700 shrink-0">
                        <Layers className="h-6 w-6 text-gray-400 stroke-1 shrink-0" />
                        <div>
                          <div className="font-bold text-base">{hangar.dimensions.height} ml</div>
                          <div className="text-xs text-gray-500">Ht. sous crochet</div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (isTerrainRental || isTerrainTouristiqueProperty || isTerrainAgricoleProperty) ? (
                  <div className="w-full flex items-center justify-between gap-3 flex-wrap">
                    {/* Surface terrain */}
                    {property.landArea != null && (
                      <div className="flex items-center gap-2 text-gray-700 shrink-0">
                        <Ruler className="h-6 w-6 text-gray-400 stroke-1 shrink-0" />
                        <div>
                          <div className="font-bold text-base">{property.landArea} m²</div>
                          <div className="text-xs text-gray-500">Surf. Terrain</div>
                        </div>
                      </div>
                    )}
                    {/* Longueur */}
                    {terrain?.facadeLength != null && (
                      <>
                        <div className="h-8 w-px bg-gray-200 shrink-0" />
                        <div className="flex items-center gap-2 text-gray-700 shrink-0">
                          <Ruler className="h-6 w-6 text-gray-400 stroke-1 shrink-0" />
                          <div>
                            <div className="font-bold text-base">{terrain.facadeLength} ml</div>
                            <div className="text-xs text-gray-500">Longueur</div>
                          </div>
                        </div>
                      </>
                    )}
                    {/* Largeur */}
                    {terrain?.depth != null && (
                      <>
                        <div className="h-8 w-px bg-gray-200 shrink-0" />
                        <div className="flex items-center gap-2 text-gray-700 shrink-0">
                          <Ruler className="h-6 w-6 text-gray-400 stroke-1 shrink-0" />
                          <div>
                            <div className="font-bold text-base">{terrain.depth} m</div>
                            <div className="text-xs text-gray-500">Largeur</div>
                          </div>
                        </div>
                      </>
                    )}
                    {/* Topographie */}
                    {terrain?.topographie && (
                      <>
                        <div className="h-8 w-px bg-gray-200 shrink-0" />
                        <div className="flex items-center gap-2 text-gray-700 shrink-0">
                          <Layers className="h-6 w-6 text-gray-400 stroke-1 shrink-0" />
                          <div>
                            <div className="font-bold text-base">{LABELS[terrain.topographie] || terrain.topographie}</div>
                            <div className="text-xs text-gray-500">Topographie</div>
                          </div>
                        </div>
                      </>
                    )}
                    {/* Façades */}
                    {property.facadesCount != null && (
                      <>
                        <div className="h-8 w-px bg-gray-200 shrink-0" />
                        <div className="flex items-center gap-2 text-gray-700 shrink-0">
                          <Square className="h-6 w-6 text-gray-400 stroke-1 shrink-0" />
                          <div>
                            <div className="font-bold text-base">{property.facadesCount} face{Number(property.facadesCount) > 1 ? "s" : ""}</div>
                            <div className="text-xs text-gray-500">Façades</div>
                          </div>
                        </div>
                      </>
                    )}
                    {/* Viabilisé */}
                    <div className="h-8 w-px bg-gray-200 shrink-0" />
                    <div className="flex items-center gap-2 text-gray-700 shrink-0">
                      <Key className="h-6 w-6 text-gray-400 stroke-1 shrink-0" />
                      <div>
                        <div className="font-bold text-base">{terrain?.viabilise ? "Viabilisé" : "Non viabilisé"}</div>
                        <div className="text-xs text-gray-500">Viabilisation</div>
                      </div>
                    </div>
                  </div>
                ) : isSaleBuildingDemolition ? (
                    <div className="flex items-center gap-4 text-gray-700 min-w-max flex-1 sm:flex-none justify-center sm:justify-start">
                        <Square className="h-8 w-8 text-gray-400 stroke-1 shrink-0" />
                        <div>
                            {property.landArea !== undefined && property.landArea !== null && Number(property.landArea) > 0 ? (
                                <div className="font-bold text-xl">{property.landArea} m²</div>
                            ) : (
                                <div className="font-bold text-xl text-gray-400">Non spécifié</div>
                            )}
                            <div className="text-sm text-gray-500">Surf. terrain</div>
                        </div>
                    </div>
                ) : (
                <>
                {normalizedPropertyType !== "IMMEUBLE_RESIDENTIEL" && property.typology && (
                    <div className="flex items-center gap-4 text-gray-700 min-w-max flex-1 sm:flex-none justify-center sm:justify-start">
                        <Building2 className="h-8 w-8 text-gray-400 stroke-1 shrink-0" />
                        <div>
                            <div className="font-bold text-xl">{property.typology}</div>
                            <div className="text-sm text-gray-500">Typologie</div>
                        </div>
                    </div>
                )}

                {normalizedPropertyType === "VILLA" && property.landArea !== undefined && (
                    <div className="flex items-center gap-4 text-gray-700 min-w-max flex-1 sm:flex-none justify-center sm:justify-start">
                        <Square className="h-8 w-8 text-gray-400 stroke-1 shrink-0" />
                        <div>
                            <div className="font-bold text-xl">{property.landArea} m²</div>
                            <div className="text-sm text-gray-500">Surf. terrain</div>
                        </div>
                    </div>
                )}

                {normalizedPropertyType === "VILLA" && property.builtArea !== undefined && (
                    <div className="flex items-center gap-4 text-gray-700 min-w-max flex-1 sm:flex-none justify-center sm:justify-start">
                        <Square className="h-8 w-8 text-gray-400 stroke-1 shrink-0" />
                        <div>
                            <div className="font-bold text-xl">{property.builtArea} m²</div>
                            <div className="text-sm text-gray-500">Surf. bâtie</div>
                        </div>
                    </div>
                )}

                {/* Surface — shown before étage for appartement types */}
                {normalizedPropertyType !== "VILLA" && normalizedPropertyType !== "IMMEUBLE_RESIDENTIEL" && displayArea !== undefined && (
                    <div className="flex items-center gap-4 text-gray-700 min-w-max flex-1 sm:flex-none justify-center sm:justify-start">
                        <Square className="h-8 w-8 text-gray-400 stroke-1 shrink-0" />
                        <div>
                            <div className="font-bold text-xl">{displayArea} m²</div>
                            <div className="text-sm text-gray-500">Surface</div>
                        </div>
                    </div>
                )}

                {property.nbFloors !== undefined && normalizedPropertyType !== "IMMEUBLE_RESIDENTIEL" && (
                    <div className="flex items-center gap-4 text-gray-700 min-w-max flex-1 sm:flex-none justify-center sm:justify-start">
                        <Layers className="h-8 w-8 text-gray-400 stroke-1 shrink-0" />
                        <div>
                            <div className="font-bold text-xl">
                                {normalizedPropertyType === "VILLA" ? property.nbFloors : formatUnitFloor(property.nbFloors)}
                            </div>
                            <div className="text-sm text-gray-500">{normalizedPropertyType === "VILLA" ? formatFloorsLabel(property.nbFloors) : "Étage"}</div>
                        </div>
                    </div>
                )}

                {normalizedPropertyType === "VILLA" && property.facadesCount !== undefined && property.facadesCount !== null && (
                    <div className="flex items-center gap-4 text-gray-700 min-w-max flex-1 sm:flex-none justify-center sm:justify-start">
                        <Building2 className="h-8 w-8 text-gray-400 stroke-1 shrink-0" />
                        <div>
                            <div className="font-bold text-xl">{property.facadesCount}</div>
                            <div className="text-sm text-gray-500">Façades</div>
                        </div>
                    </div>
                )}

                {normalizedPropertyType !== "VILLA" && normalizedPropertyType !== "IMMEUBLE_RESIDENTIEL" && hasElevator && (
                    <div className="flex items-center gap-4 text-gray-700 min-w-max flex-1 sm:flex-none justify-center sm:justify-start">
                        <Layers className="h-8 w-8 text-gray-400 stroke-1 shrink-0" />
                        <div>
                            <div className="font-bold text-xl">Oui</div>
                            <div className="text-sm text-gray-500">Ascenseur</div>
                        </div>
                    </div>
                )}

                {normalizedPropertyType === "IMMEUBLE_RESIDENTIEL" && (
                    <>
                        {buildingTypology?.mode && (
                            <div className="flex items-center gap-4 text-gray-700 min-w-max flex-1 sm:flex-none justify-center sm:justify-start">
                                <Building2 className="h-8 w-8 text-gray-400 stroke-1 shrink-0" />
                                <div>
                                    <div className="font-bold text-xl">
                                        {buildingTypology.mode === "SIMILAIRES" ? "Similaires" : buildingTypology.mode === "DIFFERENTES" ? "Différentes" : buildingTypology.mode}
                                    </div>
                                    <div className="text-sm text-gray-500">Typologie</div>
                                </div>
                            </div>
                        )}
                        {buildingTypology?.totalApartments !== undefined && (
                            <div className="flex items-center gap-4 text-gray-700 min-w-max flex-1 sm:flex-none justify-center sm:justify-start">
                                <Building2 className="h-8 w-8 text-gray-400 stroke-1 shrink-0" />
                                <div>
                                    <div className="font-bold text-xl">{buildingTypology.totalApartments}</div>
                                    <div className="text-sm text-gray-500">Appartements</div>
                                </div>
                            </div>
                        )}
                        {property.nbFloors !== undefined && (
                            <div className="flex items-center gap-4 text-gray-700 min-w-max flex-1 sm:flex-none justify-center sm:justify-start">
                                <Layers className="h-8 w-8 text-gray-400 stroke-1 shrink-0" />
                                <div>
                                    <div className="font-bold text-xl">{property.nbFloors}</div>
                                    <div className="text-sm text-gray-500">{formatFloorsLabel(property.nbFloors)}</div>
                                </div>
                            </div>
                        )}
                        {hasElevator && (
                            <div className="flex items-center gap-4 text-gray-700 min-w-max flex-1 sm:flex-none justify-center sm:justify-start">
                                <Layers className="h-8 w-8 text-gray-400 stroke-1 shrink-0" />
                                <div>
                                    <div className="font-bold text-xl">Oui</div>
                                    <div className="text-sm text-gray-500">Ascenseur</div>
                                </div>
                            </div>
                        )}
                        {buildingTypology?.mode === "SIMILAIRES" && property.area !== undefined && property.area !== null && Number(property.area) > 0 ? (
                            <div className="flex items-center gap-4 text-gray-700 min-w-max flex-1 sm:flex-none justify-center sm:justify-start">
                                <Square className="h-8 w-8 text-gray-400 stroke-1 shrink-0" />
                                <div>
                                    <div className="font-bold text-xl">{property.area} m²</div>
                                    <div className="text-sm text-gray-500">Surface unique</div>
                                </div>
                            </div>
                        ) : buildingTypology?.mode === "DIFFERENTES" ? (
                            <div className="flex items-center gap-4 text-gray-700 min-w-max flex-1 sm:flex-none justify-center sm:justify-start">
                                <Square className="h-8 w-8 text-gray-400 stroke-1 shrink-0" />
                                <div>
                                    <div className="font-bold text-xl">Variable</div>
                                    <div className="text-sm text-gray-500">Surfaces</div>
                                </div>
                            </div>
                        ) : null}
                    </>
                )}

                {(property.parkingCount > 0 || property.outdoorParking > 0) && (
                    <div className="flex items-center gap-4 text-gray-700 min-w-max flex-1 sm:flex-none justify-center sm:justify-start">
                        <Car className="h-8 w-8 text-gray-400 stroke-1 shrink-0" />
                        <div className="flex flex-col gap-1.5">
                            <div className="font-bold text-gray-900 leading-none">Parking</div>
                            <div className="flex flex-col gap-1">
                                {property.parkingCount > 0 && (
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-bold rounded uppercase w-fit">
                                        INTÉRIEUR: {property.parkingCount}
                                    </span>
                                )}
                                {property.outdoorParking > 0 && (
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-bold rounded uppercase w-fit">
                                        EXTÉRIEUR: {property.outdoorParking}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                </>
                )}
              </div>

              {/* Contacts Row */}
              <div className="mt-5 flex flex-wrap gap-4 text-gray-600">
                  {(() => {
                      let contactsList = [];
                      try {
                          if (property.contacts) {
                              if (typeof property.contacts === 'string') {
                                  // Attempt to fix common JSON string issues before parsing
                                  let jsonStr = property.contacts.trim();
                                  
                                  // If it looks like it might be truncated or invalid, try to parse what we can
                                  try {
                                      contactsList = JSON.parse(jsonStr);
                                  } catch (e) {
                                      console.warn("Initial JSON parse failed, attempting to fix string:", jsonStr);
                                      // If it starts with [ but doesn't end with ], append ]
                                      if (jsonStr.startsWith('[') && !jsonStr.endsWith(']')) {
                                          try {
                                              // Find the last complete object
                                              const lastValidBrace = jsonStr.lastIndexOf('}');
                                              if (lastValidBrace > 0) {
                                                  jsonStr = jsonStr.substring(0, lastValidBrace + 1) + ']';
                                                  contactsList = JSON.parse(jsonStr);
                                              }
                                          } catch (innerE) {
                                              console.error("Failed to recover JSON string", innerE);
                                          }
                                      }
                                  }
                              } else if (Array.isArray(property.contacts)) {
                                  contactsList = property.contacts;
                              }
                          }
                      } catch (e) {
                          console.error("Failed to parse contacts", e);
                      }

                      // Ensure contactsList is an array
                      if (!Array.isArray(contactsList)) {
                          contactsList = [];
                      }

                      // If no contacts list but user has phone, use that
                      if (contactsList.length === 0 && announce.user?.phone) {
                          contactsList.push({ 
                              phone: announce.user.phone, 
                              email: announce.user.email,
                              hasWhatsapp: false, 
                              hasViber: false, 
                              hasTelegram: false 
                          });
                      }

                      // Ensure email is present in contacts if it's missing but user has it
                      contactsList = contactsList.map((c: any) => ({
                          ...c,
                          email: c.email || announce.user?.email
                      }));

                      return contactsList.map((contact: any, index: number) => (
                          <div key={index} className="relative group">
                              {/* Phone Button */}
                              <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl cursor-pointer transition-colors font-bold text-gray-900">
                                  <Phone className="h-4 w-4 text-[#00BFA6]" /> 
                                  {formatDisplayPhone(contact.phone)}
                              </div>

                              {/* Hover Icons Dropdown */}
                              {(contact.hasWhatsapp || contact.hasViber || contact.hasTelegram) && (
                                  <div className="absolute top-full left-0 mt-2 p-2 bg-white rounded-xl shadow-xl border border-gray-100 flex gap-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 w-max">
                                      <a href={`tel:+${toIntlDigits(contact.phone)}`} className="p-2 hover:bg-gray-50 rounded-lg text-gray-600 transition-colors" title="Appeler">
                                          <Phone className="h-5 w-5" />
                                      </a>
                                      {contact.email && (
                                          <a href={`mailto:${contact.email}`} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors" title="Email">
                                              <Mail className="h-5 w-5" />
                                          </a>
                                      )}
                                      {contact.hasWhatsapp && (
                                          <a href={`https://wa.me/${toIntlDigits(contact.phone)}`} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-[#25D366]/10 text-[#25D366] rounded-lg transition-colors" title="WhatsApp">
                                              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                          </a>
                                      )}
                                      {contact.hasViber && (
                                          <a href={`viber://add?number=+${toIntlDigits(contact.phone)}`} className="p-2 hover:bg-[#7360f2]/10 text-[#7360f2] rounded-lg transition-colors" title="Viber">
                                              <svg viewBox="0 0 512 512" className="h-5 w-5 fill-current"><path d="M437.1 146.4c-6.1-24.5-22.3-43.9-46.7-48.4-38.3-6.9-106.8-6.9-134.4-6.9-27.6 0-96.1 0-134.4 6.9-24.4 4.5-40.6 23.9-46.7 48.4-5.3 21.6-5.3 64.1-5.3 109.6s0 88 5.3 109.6c6.1 24.5 22.3 43.9 46.7 48.4 38.3 6.9 106.8 6.9 134.4 6.9 27.6 0 96.1 0 134.4-6.9 24.4-4.5 40.6-23.9 46.7-48.4 5.3-21.6 5.3-64.1 5.3-109.6s0-88-5.3-109.6zm-175 145.4v13.5c0 23.8-19.3 43.1-43.1 43.1h-43.1c-23.8 0-43.1-19.3-43.1-43.1v-43.1c0-23.8 19.3-43.1 43.1-43.1h13.5v-67h-13.5c-23.8 0-43.1-19.3-43.1-43.1V66c0-23.8 19.3-43.1 43.1-43.1h43.1c23.8 0 43.1 19.3 43.1 43.1v43.1c0 23.8-19.3 43.1-43.1 43.1h-13.5v67zm120.3 43.1c0 23.8-19.3 43.1-43.1 43.1h-43.1c-23.8 0-43.1-19.3-43.1-43.1v-43.1c0-23.8 19.3-43.1 43.1-43.1h13.5v-67h-13.5c-23.8 0-43.1-19.3-43.1-43.1V66c0-23.8 19.3-43.1 43.1-43.1h43.1c23.8 0 43.1 19.3 43.1 43.1v43.1c0 23.8-19.3 43.1-43.1 43.1h-13.5v67h13.5c23.8 0 43.1 19.3 43.1 43.1v43.1z"/></svg>
                                          </a>
                                      )}
                                      {contact.hasTelegram && (
                                          <a href={`https://t.me/+${toIntlDigits(contact.phone)}`} className="p-2 hover:bg-[#0088cc]/10 text-[#0088cc] rounded-lg transition-colors" title="Telegram">
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

              {announce.user?.email && (
                  <a
                      href={`mailto:${announce.user.email}`}
                      className="mt-3 w-full py-4 text-base bg-white hover:bg-gray-50 text-gray-900 rounded-xl border border-gray-200 shadow-sm flex items-center justify-center gap-2 font-bold"
                  >
                      <Mail className="h-5 w-5 text-red-500" />
                      Envoyer un email
                  </a>
              )}

              {/* Signaler un problème */}
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="mt-4 w-full py-2.5 text-xs text-gray-400 hover:text-red-500 flex items-center justify-center gap-1.5 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current shrink-0"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                Signaler un problème avec cette annonce
              </button>
            </div>

            {/* Section Boutique — pour les professionnels */}
            {announce.user?.userType === 'SOCIETE' && (
              <div className="mt-4 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-[#00BFA6] to-[#0088cc] p-5 flex items-center gap-3">
                  {announce.user?.agencyLogoUrl ? (
                    <img src={getImageUrl(announce.user.agencyLogoUrl) || ''} alt="Logo" className="h-14 w-14 rounded-full object-cover border-2 border-white shadow" />
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                      <Store className="h-7 w-7 text-white" />
                    </div>
                  )}
                  <div>
                    <div className="text-white font-black text-base leading-tight">{announce.user?.companyName}</div>
                    <div className="text-white/70 text-xs mt-0.5">{announce.user?.activity || 'Professionnel immobilier'}</div>
                    <div className="text-white/60 text-xs mt-1">{boutiqueAnnounces.length + 1} annonce{boutiqueAnnounces.length > 0 ? 's' : ''} active{boutiqueAnnounces.length > 0 ? 's' : ''}</div>
                  </div>
                </div>

                {boutiqueAnnounces.length > 0 && (
                  <div className="p-4 space-y-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Autres annonces</p>
                    {boutiqueAnnounces.map((a: any) => {
                      const img = a.property?.images?.find((i: any) => i.isMain) || a.property?.images?.[0]
                      const city = a.property?.address?.town?.city?.nameFr || a.property?.address?.town?.nameFr || ''
                      return (
                        <a key={a.id} href={`/announces/${a.id}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors group">
                          <div className="h-14 w-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                            {img ? <img src={getImageUrl(img.url) || ''} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-gray-200" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-gray-900 truncate group-hover:text-[#00BFA6] transition-colors">
                              {a.title || PROPERTY_TYPES?.find((t: any) => t.id === a.property?.propertyType)?.label || a.property?.propertyType}
                            </div>
                            {city && <div className="text-xs text-gray-500 truncate mt-0.5">📍 {city}</div>}
                            <div className="text-xs font-bold text-[#00BFA6] mt-0.5">
                              {a.price ? `${Number(a.price).toLocaleString()} DZD` : 'Prix sur demande'}
                            </div>
                          </div>
                        </a>
                      )
                    })}
                  </div>
                )}

                <div className="px-4 pb-4">
                  <a
                    href={`/boutique/${announce.user?.id}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#00BFA6]/10 hover:bg-[#00BFA6]/20 text-[#00BFA6] rounded-xl text-sm font-bold transition-colors"
                  >
                    <Store className="h-4 w-4" /> Voir la boutique complète
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

      {/* Details & Amenities Full Width */}
      <div className="w-full mb-8">

          {/* ===== SECTION USINE ===== */}
          {isFactoryRental && (
            <>
              {/* 4 colonnes Informations Générales */}
              {industrialFactory && (
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-100">Informations Générales</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                    {/* Colonne 1: État & Type de location */}
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-5 flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <Key className="h-5 w-5 text-[#00BFA6]" />
                        <h3 className="text-[17px] font-bold text-gray-900">État &amp; Types d&apos;offre</h3>
                      </div>
                      <div className="space-y-3">
                        {industrialFactory.rentalType && (
                          <div className="flex flex-col gap-1 py-1.5 border-b border-gray-100">
                            <span className="text-gray-500 text-xs">Type de location</span>
                            <span className="font-bold text-gray-900 text-sm">{LABELS[industrialFactory.rentalType] || industrialFactory.rentalType}</span>
                          </div>
                        )}
                        {industrialFactory.globalState && (
                          <div className="flex flex-col gap-1 py-1.5 border-b border-gray-100">
                            <span className="text-gray-500 text-xs">État global</span>
                            <span className="font-bold text-gray-900 text-sm">{LABELS[industrialFactory.globalState] || industrialFactory.globalState}</span>
                          </div>
                        )}
                        {industrialFactory.configuration && (
                          <div className="flex flex-col gap-1 py-1.5 border-b border-gray-100">
                            <span className="text-gray-500 text-xs">Configuration</span>
                            <span className="font-bold text-gray-900 text-sm">
                              {LABELS[industrialFactory.configuration] || industrialFactory.configuration}
                              {industrialFactory.configuration === "ETAGES" && industrialFactory.floorsCount ? ` — ${industrialFactory.floorsCount} étage(s)` : ""}
                            </span>
                          </div>
                        )}
                        {industrialFactory.rentalType === "EQUIPEE" && industrialFactory.serviceYear && (
                          <div className="flex flex-col gap-1 py-1.5">
                            <span className="text-gray-500 text-xs">Mise en service</span>
                            <span className="font-bold text-gray-900 text-sm">{industrialFactory.serviceYear}</span>
                          </div>
                        )}
                        {industrialFactory.productDetail && (
                          <div className="flex flex-col gap-1 py-1.5">
                            <span className="text-gray-500 text-xs">Produit fabriqué</span>
                            <span className="font-bold text-gray-900 text-sm">{industrialFactory.productDetail}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Colonne 2: Emplacement & Logistique */}
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-5 flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-[#00BFA6]" />
                        <h3 className="text-[17px] font-bold text-gray-900">Emplacement</h3>
                      </div>
                      <div className="space-y-3">
                        {industrialFactory.logistics?.situation?.length > 0 && (
                          <div className="flex flex-col gap-2 py-1.5 border-b border-gray-100">
                            <span className="text-gray-500 text-xs">Situation</span>
                            <div className="flex flex-wrap gap-1.5">
                              {industrialFactory.logistics.situation.map((s: string) => (
                                <span key={s} className="px-2 py-0.5 bg-[#00BFA6]/10 text-[#00BFA6] text-xs font-bold rounded-full">{LABELS[s] || s}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {industrialFactory.logistics?.accessTransport?.length > 0 && (
                          <div className="flex flex-col gap-2 py-1.5 border-b border-gray-100">
                            <span className="text-gray-500 text-xs">Accès transport</span>
                            <div className="flex flex-wrap gap-1.5">
                              {industrialFactory.logistics.accessTransport.map((a: string) => (
                                <span key={a} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">{LABELS[a] || a}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {industrialFactory.logistics?.highwayDistanceKm != null && (
                          <div className="flex flex-col gap-1 py-1.5">
                            <span className="text-gray-500 text-xs">Distance autoroute</span>
                            <span className="font-bold text-gray-900 text-sm">{industrialFactory.logistics.highwayDistanceKm} km</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Colonne 3: Annexes & Commodités */}
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-5 flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <Layers className="h-5 w-5 text-[#00BFA6]" />
                        <h3 className="text-[17px] font-bold text-gray-900">Annexes</h3>
                      </div>
                      <div className="space-y-3">
                        {industrialFactory.annexes?.offices != null && (
                          <div className="flex flex-col gap-1 py-1.5 border-b border-gray-100">
                            <span className="text-gray-500 text-xs">Bureaux</span>
                            <span className="font-bold text-gray-900 text-sm">
                              {industrialFactory.annexes.offices ? `Oui${industrialFactory.annexes.officesArea ? ` — ${industrialFactory.annexes.officesArea} m²` : ""}` : "Non"}
                            </span>
                          </div>
                        )}
                        {industrialFactory.annexes?.socialLocales?.length > 0 && (
                          <div className="flex flex-col gap-2 py-1.5 border-b border-gray-100">
                            <span className="text-gray-500 text-xs">Locaux sociaux</span>
                            <div className="flex flex-wrap gap-1.5">
                              {industrialFactory.annexes.socialLocales.map((s: string) => (
                                <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">{LABELS[s] || s}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {industrialFactory.annexes?.hebergement?.length > 0 && (
                          <div className="flex flex-col gap-2 py-1.5 border-b border-gray-100">
                            <span className="text-gray-500 text-xs">Hébergement</span>
                            <div className="flex flex-wrap gap-1.5">
                              {industrialFactory.annexes.hebergement.map((h: string) => (
                                <span key={h} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">{LABELS[h] || h}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {industrialFactory.annexes?.security?.length > 0 && (
                          <div className="flex flex-col gap-2 py-1.5">
                            <span className="text-gray-500 text-xs">Sécurité</span>
                            <div className="flex flex-wrap gap-1.5">
                              {industrialFactory.annexes.security.map((s: string) => (
                                <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">{LABELS[s] || s}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Colonne 4: Énergie & Fluides + Sécurité incendie */}
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-5 flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-[#00BFA6]" />
                        <h3 className="text-[17px] font-bold text-gray-900">Énergie &amp; Fluides</h3>
                      </div>
                      <div className="space-y-3">
                        {(industrialFactory.energy?.transformerKva != null || industrialFactory.energy?.forceMotrice380) && (
                          <div className="flex flex-col gap-1 py-1.5 border-b border-gray-100">
                            <span className="text-gray-500 text-xs">Électricité</span>
                            <div className="flex flex-wrap gap-1.5">
                              {industrialFactory.energy.transformerKva != null && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">Transfo {industrialFactory.energy.transformerKva} KVA</span>
                              )}
                              {industrialFactory.energy.forceMotrice380 && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">Force motrice 380V</span>
                              )}
                            </div>
                          </div>
                        )}
                        {Array.isArray(industrialFactory.energy?.gas)
                          ? industrialFactory.energy.gas.filter((g: string) => g !== "AUCUN").length > 0 && (
                            <div className="flex flex-col gap-2 py-1.5 border-b border-gray-100">
                              <span className="text-gray-500 text-xs">Gaz</span>
                              <div className="flex flex-wrap gap-1.5">
                                {industrialFactory.energy.gas.filter((g: string) => g !== "AUCUN").map((g: string) => (
                                  <span key={g} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">{LABELS[g] || g}</span>
                                ))}
                              </div>
                            </div>
                          )
                          : industrialFactory.energy?.gas && industrialFactory.energy.gas !== "AUCUN" && (
                            <div className="flex flex-col gap-1 py-1.5 border-b border-gray-100">
                              <span className="text-gray-500 text-xs">Gaz</span>
                              <span className="font-bold text-gray-900 text-sm">{LABELS[industrialFactory.energy.gas] || industrialFactory.energy.gas}</span>
                            </div>
                          )
                        }
                        {industrialFactory.energy?.waterSources?.length > 0 && (
                          <div className="flex flex-col gap-2 py-1.5 border-b border-gray-100">
                            <span className="text-gray-500 text-xs">Eau</span>
                            <div className="flex flex-wrap gap-1.5">
                              {industrialFactory.energy.waterSources.map((w: string) => (
                                <span key={w} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">{LABELS[w] || w}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {Array.isArray(industrialFactory.energy?.sanitation)
                          ? industrialFactory.energy.sanitation.length > 0 && (
                            <div className="flex flex-col gap-2 py-1.5 border-b border-gray-100">
                              <span className="text-gray-500 text-xs">Assainissement</span>
                              <div className="flex flex-wrap gap-1.5">
                                {industrialFactory.energy.sanitation.map((s: string) => (
                                  <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">{LABELS[s] || s}</span>
                                ))}
                              </div>
                            </div>
                          )
                          : industrialFactory.energy?.sanitation && (
                            <div className="flex flex-col gap-1 py-1.5 border-b border-gray-100">
                              <span className="text-gray-500 text-xs">Assainissement</span>
                              <span className="font-bold text-gray-900 text-sm">{LABELS[industrialFactory.energy.sanitation] || industrialFactory.energy.sanitation}</span>
                            </div>
                          )
                        }
                        {industrialFactory.fireSafety?.network?.length > 0 && (
                          <div className="flex flex-col gap-2 py-1.5 border-b border-gray-100">
                            <span className="text-gray-500 text-xs flex items-center gap-1"><Shield className="h-3 w-3" /> Réseau anti-incendie</span>
                            <div className="flex flex-wrap gap-1.5">
                              {industrialFactory.fireSafety.network.map((n: string) => (
                                <span key={n} className="px-2 py-0.5 bg-red-50 text-red-700 text-xs font-bold rounded-full">{LABELS[n] || n}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {industrialFactory.fireSafety?.equipment?.length > 0 && (
                          <div className="flex flex-col gap-2 py-1.5">
                            <span className="text-gray-500 text-xs">Équipements complémentaires</span>
                            <div className="flex flex-wrap gap-1.5">
                              {industrialFactory.fireSafety.equipment.map((e: string) => (
                                <span key={e} className="px-2 py-0.5 bg-red-50 text-red-700 text-xs font-bold rounded-full">
                                  {LABELS[e] || e}
                                  {e === "BACHE_EAU" && industrialFactory.energy?.waterTankCapacityLiters
                                    ? ` — ${industrialFactory.energy.waterTankCapacityLiters.toLocaleString("fr-DZ")} L`
                                    : ""}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Description */}
              {announce.shortDescription && (
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#00BFA6]" />
                    Description
                  </h2>
                  <p className="text-gray-600 leading-relaxed">{announce.shortDescription}</p>
                </div>
              )}
            </>
          )}
          {/* ===== FIN SECTION USINE ===== */}

          {/* ===== SECTION CHAMBRE FROIDE ===== */}
          {isColdRoomRental && (
            <>
              {coldRoom && (
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-100">Informations Générales</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                    {/* Col 1 — Configuration & Structure */}
                    {/* Col 1 — Configuration */}
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-5 flex flex-col">
                      <div className="flex items-start gap-2 min-h-[40px] mb-3">
                        <Layers className="h-5 w-5 text-[#00BFA6] mt-0.5 shrink-0" />
                        <h3 className="text-[17px] font-bold text-gray-900 leading-tight">Configuration</h3>
                      </div>
                      <div className="space-y-3">
                        {coldRoom.structureType && (
                          <div className="flex flex-col gap-1 py-1.5 border-b border-gray-100">
                            <span className="text-gray-500 text-xs">Structure</span>
                            <span className="font-bold text-gray-900 text-sm">{(LABELS[coldRoom.structureType] || coldRoom.structureType).replace(/\s*\([^)]*\)/g, '').trim()}</span>
                          </div>
                        )}
                        {coldRoom.configuration && (
                          <div className="flex flex-col gap-1 py-1.5 border-b border-gray-100">
                            <span className="text-gray-500 text-xs">Configuration</span>
                            <span className="font-bold text-gray-900 text-sm">
                              {LABELS[coldRoom.configuration] || coldRoom.configuration}
                              {coldRoom.configuration === "ETAGES" && coldRoom.floorsCount ? ` — ${coldRoom.floorsCount} étage(s)` : ""}
                            </span>
                          </div>
                        )}
                        {coldRoom.logistiqueVerticale && coldRoom.logistiqueVerticale !== "AUCUN" && (
                          <div className="flex flex-col gap-1 py-1.5 border-b border-gray-100">
                            <span className="text-gray-500 text-xs">Logistique verticale</span>
                            <span className="font-bold text-gray-900 text-sm">
                              {LABELS[coldRoom.logistiqueVerticale] || coldRoom.logistiqueVerticale}
                              {coldRoom.logistiqueVerticale === "MONTE_CHARGE" && coldRoom.monteChargeCapacity ? ` — ${coldRoom.monteChargeCapacity} Tonnes` : ""}
                            </span>
                          </div>
                        )}
                        {coldRoom.zoneDechargement?.length > 0 && (
                          <div className="flex flex-col gap-2 py-1.5 border-b border-gray-100">
                            <span className="text-gray-500 text-xs">Zone de déchargement</span>
                            <div className="flex flex-wrap gap-1.5">
                              {coldRoom.zoneDechargement.map((z: string) => (
                                <span key={z} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">{LABELS[z] || z}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Col 2 — Équipements */}
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-5 flex flex-col">
                      <div className="flex items-start gap-2 min-h-[40px] mb-3">
                        <Zap className="h-5 w-5 text-[#00BFA6] mt-0.5 shrink-0" />
                        <h3 className="text-[17px] font-bold text-gray-900 leading-tight">Équipements</h3>
                      </div>
                      <div className="space-y-3">
                        {coldRoom.typeFroid?.length > 0 && (
                          <div className="flex flex-col gap-2 py-1.5 border-b border-gray-100">
                            <span className="text-gray-500 text-xs">Type de froid</span>
                            <div className="flex flex-wrap gap-1.5">
                              {coldRoom.typeFroid.map((t: string) => (
                                <span key={t} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">{LABELS[t] || t}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {coldRoom.modeDiffusion?.length > 0 && (
                          <div className="flex flex-col gap-2 py-1.5 border-b border-gray-100">
                            <span className="text-gray-500 text-xs">Mode de diffusion</span>
                            <div className="flex flex-wrap gap-1.5">
                              {coldRoom.modeDiffusion.map((m: string) => (
                                <span key={m} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">{LABELS[m] || m}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {coldRoom.techniqueFroid?.length > 0 && (
                          <div className="flex flex-col gap-2 py-1.5 border-b border-gray-100">
                            <span className="text-gray-500 text-xs">Technique froid</span>
                            <div className="flex flex-wrap gap-1.5">
                              {coldRoom.techniqueFroid.map((t: string) => (
                                <span key={t} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">{LABELS[t] || t}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {coldRoom.tracabilite?.length > 0 && (
                          <div className="flex flex-col gap-2 py-1.5 border-b border-gray-100">
                            <span className="text-gray-500 text-xs">Traçabilité</span>
                            <div className="flex flex-wrap gap-1.5">
                              {coldRoom.tracabilite.map((t: string) => (
                                <span key={t} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">{LABELS[t] || t}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {coldRoom.generateur && (
                          <div className="flex flex-col gap-1 py-1.5 border-b border-gray-100">
                            <span className="text-gray-500 text-xs">Générateur de secours</span>
                            <span className="font-bold text-gray-900 text-sm">
                              Oui{coldRoom.generateurKva ? ` — ${coldRoom.generateurKva} KVA` : ""}
                            </span>
                          </div>
                        )}
                        {coldRoom.securiteHumaine && (
                          <div className="flex flex-col gap-1 py-1.5">
                            <span className="text-gray-500 text-xs">Sécurité humaine</span>
                            <span className="font-bold text-gray-900 text-sm">Dispositif anti-enfermement</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Col 3 — Localisation et modalités */}
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-5 flex flex-col">
                      <div className="flex items-start gap-2 min-h-[40px] mb-3">
                        <MapPin className="h-5 w-5 text-[#00BFA6] mt-0.5 shrink-0" />
                        <h3 className="text-[17px] font-bold text-gray-900 leading-tight">Localisation et modalités</h3>
                      </div>
                      <div className="space-y-3">
                        {coldRoom.localisation?.length > 0 && (
                          <div className="flex flex-col gap-2 py-1.5 border-b border-gray-100">
                            <span className="text-gray-500 text-xs">Situation</span>
                            <div className="flex flex-wrap gap-1.5">
                              {coldRoom.localisation.map((l: string) => (
                                <span key={l} className="px-2 py-0.5 bg-[#00BFA6]/10 text-[#00BFA6] text-xs font-bold rounded-full">{LABELS[l] || l}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {coldRoom.accessibilite?.length > 0 && (
                          <div className="flex flex-col gap-2 py-1.5 border-b border-gray-100">
                            <span className="text-gray-500 text-xs">Accès camions</span>
                            <div className="flex flex-wrap gap-1.5">
                              {coldRoom.accessibilite.map((a: string) => (
                                <span key={a} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">{LABELS[a] || a}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="border-b border-gray-100" />
                        {coldRoom.modeGestion && (
                          <div className="flex flex-col gap-1 py-1.5 border-b border-gray-100">
                            <span className="text-gray-500 text-xs">Mode de gestion</span>
                            <span className="font-bold text-gray-900 text-sm">{LABELS[coldRoom.modeGestion] || coldRoom.modeGestion}</span>
                          </div>
                        )}
                        {coldRoom.flexibilite?.length > 0 && (
                          <div className="flex flex-col gap-2 py-1.5 border-b border-gray-100">
                            <span className="text-gray-500 text-xs">Flexibilité d&apos;espace</span>
                            <div className="flex flex-wrap gap-1.5">
                              {coldRoom.flexibilite.map((f: string) => (
                                <span key={f} className="px-2 py-0.5 bg-[#00BFA6]/10 text-[#00BFA6] text-xs font-bold rounded-full">{LABELS[f] || f}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {coldRoom.dureeEngagement?.length > 0 && (
                          <div className="flex flex-col gap-2 py-1.5">
                            <span className="text-gray-500 text-xs">Durée d&apos;engagement</span>
                            <div className="flex flex-wrap gap-1.5">
                              {coldRoom.dureeEngagement.map((d: string) => (
                                <span key={d} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">{LABELS[d] || d}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Col 4 — Annexes */}
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-5 flex flex-col">
                      <div className="flex items-start gap-2 min-h-[40px] mb-3">
                        <LayoutGrid className="h-5 w-5 text-[#00BFA6] mt-0.5 shrink-0" />
                        <h3 className="text-[17px] font-bold text-gray-900 leading-tight">Annexes</h3>
                      </div>
                      <div className="space-y-3">
                        {coldRoom.annexes?.offices != null && (
                          <div className="flex flex-col gap-1 py-1.5 border-b border-gray-100">
                            <span className="text-gray-500 text-xs">Bureaux</span>
                            <span className="font-bold text-gray-900 text-sm">{coldRoom.annexes.offices ? "Oui" : "Non"}</span>
                          </div>
                        )}
                        {coldRoom.annexes?.socialLocales?.length > 0 && (
                          <div className="flex flex-col gap-2 py-1.5 border-b border-gray-100">
                            <span className="text-gray-500 text-xs">Locaux sociaux</span>
                            <div className="flex flex-wrap gap-1.5">
                              {coldRoom.annexes.socialLocales.map((s: string) => (
                                <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">{LABELS[s] || s}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {coldRoom.annexes?.hebergement?.length > 0 && (
                          <div className="flex flex-col gap-2 py-1.5 border-b border-gray-100">
                            <span className="text-gray-500 text-xs">Hébergement</span>
                            <div className="flex flex-wrap gap-1.5">
                              {coldRoom.annexes.hebergement.map((h: string) => (
                                <span key={h} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">{LABELS[h] || h}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {coldRoom.annexes?.security?.length > 0 && (
                          <div className="flex flex-col gap-2 py-1.5">
                            <span className="text-gray-500 text-xs">Sécurité</span>
                            <div className="flex flex-wrap gap-1.5">
                              {coldRoom.annexes.security.map((s: string) => (
                                <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">{LABELS[s] || s}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Description */}
              {announce.shortDescription && (
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#00BFA6]" />
                    Description
                  </h2>
                  <p className="text-gray-600 leading-relaxed">{announce.shortDescription}</p>
                </div>
              )}
            </>
          )}
          {/* ===== FIN SECTION CHAMBRE FROIDE ===== */}

          {/* ===== SECTION TERRAIN ===== */}
          {(isTerrainRental || isTerrainTouristiqueProperty || isTerrainAgricoleProperty) && (
            <>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-100">Informations Générales</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                  {/* Col 1 — Caractéristiques physiques */}
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-5 flex flex-col">
                    <div className="flex items-start gap-2 min-h-[40px] mb-3">
                      <Ruler className="h-5 w-5 text-[#00BFA6] mt-0.5 shrink-0" />
                      <h3 className="text-[17px] font-bold text-gray-900 leading-tight">Caractéristiques</h3>
                    </div>
                    <div className="space-y-3">
                      {property.landArea != null && (
                        <div className="flex flex-col gap-1 py-1.5 border-b border-gray-100">
                          <span className="text-gray-500 text-xs">Surface terrain</span>
                          <span className="font-bold text-gray-900 text-sm">{property.landArea} m²</span>
                        </div>
                      )}
                      {property.facadesCount != null && (
                        <div className="flex flex-col gap-1 py-1.5 border-b border-gray-100">
                          <span className="text-gray-500 text-xs">Nombre de façades</span>
                          <span className="font-bold text-gray-900 text-sm">{property.facadesCount} face{Number(property.facadesCount) > 1 ? "s" : ""}</span>
                        </div>
                      )}
                      {terrain?.facadeLength != null && (
                        <div className="flex flex-col gap-1 py-1.5 border-b border-gray-100">
                          <span className="text-gray-500 text-xs">Longueur</span>
                          <span className="font-bold text-gray-900 text-sm">{terrain.facadeLength} ml</span>
                        </div>
                      )}
                      {terrain?.depth != null && (
                        <div className="flex flex-col gap-1 py-1.5 border-b border-gray-100">
                          <span className="text-gray-500 text-xs">Largeur</span>
                          <span className="font-bold text-gray-900 text-sm">{terrain.depth} m</span>
                        </div>
                      )}
                      {terrain?.topographie && (
                        <div className="flex flex-col gap-1 py-1.5">
                          <span className="text-gray-500 text-xs">Topographie (Relief)</span>
                          <span className="font-bold text-gray-900 text-sm">{LABELS[terrain.topographie] || terrain.topographie}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Col 2 — Statut & Documents */}
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-5 flex flex-col">
                    <div className="flex items-start gap-2 min-h-[40px] mb-3">
                      <FileText className="h-5 w-5 text-[#00BFA6] mt-0.5 shrink-0" />
                      <h3 className="text-[17px] font-bold text-gray-900 leading-tight">Statut & Documents</h3>
                    </div>
                    <div className="space-y-3">
                      {terrain?.statutZone?.length > 0 && (
                        <div className="flex flex-col gap-2 py-1.5 border-b border-gray-100">
                          <span className="text-gray-500 text-xs">Statut de la zone</span>
                          <div className="flex flex-wrap gap-1.5">
                            {terrain.statutZone.map((s: string) => (
                              <span key={s} className="px-2 py-0.5 bg-[#00BFA6]/10 text-[#00BFA6] text-xs font-bold rounded-full">{LABELS[s] || s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {terrain?.documents?.length > 0 && (
                        <div className="flex flex-col gap-2 py-1.5">
                          <span className="text-gray-500 text-xs">Documents disponibles</span>
                          <div className="flex flex-wrap gap-1.5">
                            {terrain.documents.map((d: string) => (
                              <span key={d} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">{LABELS[d] || d}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Col 3 — Viabilisation (non affiché pour agricole et touristique) */}
                  {!isTerrainAgricoleProperty && !isTerrainTouristiqueProperty && (
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-5 flex flex-col">
                    <div className="flex items-start gap-2 min-h-[40px] mb-3">
                      <Zap className="h-5 w-5 text-[#00BFA6] mt-0.5 shrink-0" />
                      <h3 className="text-[17px] font-bold text-gray-900 leading-tight">Viabilisation</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex flex-col gap-1 py-1.5 border-b border-gray-100">
                        <span className="text-gray-500 text-xs">État de viabilisation</span>
                        <span className={`font-bold text-sm ${terrain?.viabilise ? "text-[#00BFA6]" : "text-orange-600"}`}>
                          {terrain?.viabilise ? "Terrain viabilisé" : "Non viabilisé"}
                        </span>
                      </div>
                      {!terrain?.viabilise && terrain?.raccordements?.length > 0 && (
                        <div className="flex flex-col gap-2 py-1.5">
                          <span className="text-gray-500 text-xs">Raccordements à proximité</span>
                          <div className="flex flex-wrap gap-1.5">
                            {terrain.raccordements.map((r: string) => (
                              <span key={r} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">{LABELS[r] || r}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  )}

                </div>
              </div>

              {/* Description */}
              {announce.shortDescription && (
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#00BFA6]" />
                    Description
                  </h2>
                  <p className="text-gray-600 leading-relaxed">{announce.shortDescription}</p>
                </div>
              )}
            </>
          )}
          {/* ===== FIN SECTION TERRAIN ===== */}

          {/* ===== SECTION HANGAR ===== */}
          {isHangarRental && (
            <>
              {hangar && (
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-100">Informations Générales</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                    {/* Col 1 — Infrastructure */}
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-5 flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <Ruler className="h-5 w-5 text-[#00BFA6]" />
                        <h3 className="text-[17px] font-bold text-gray-900">Infrastructure</h3>
                      </div>

                      <div className="space-y-3">
                        {/* Matériaux Infrastructure */}
                        {(hangar.usage?.length > 0 || hangar.toiture?.toleTH40 || hangar.toiture?.panneauxSandwich || hangar.toiture?.autre || hangar.sol?.beton || hangar.sol?.resineEpoxy || hangar.sol?.autre) && (
                          <div className="space-y-3">
                            {hangar.usage?.length > 0 && (
                              <div className="flex flex-col gap-2 py-1.5 border-b border-gray-100">
                                <span className="text-gray-500 text-xs">Type d&apos;utilisation</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {hangar.usage.map((u: string) => (
                                    <span key={u} className="px-2 py-0.5 bg-[#00BFA6]/10 text-[#00BFA6] text-xs font-bold rounded-full">{LABELS[u] || u}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {(hangar.toiture?.toleTH40 || hangar.toiture?.panneauxSandwich || hangar.toiture?.autre) && (
                              <div className="flex flex-col gap-2 py-1.5 border-b border-gray-100">
                                <span className="text-gray-500 text-xs">Toiture</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {hangar.toiture.toleTH40 && <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">Tôle TH40</span>}
                                  {hangar.toiture.panneauxSandwich && <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">Panneaux Sandwich</span>}
                                  {hangar.toiture.autre && <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">Autre</span>}
                                </div>
                              </div>
                            )}
                            {(hangar.sol?.beton || hangar.sol?.resineEpoxy || hangar.sol?.autre) && (
                              <div className="flex flex-col gap-2 py-1.5">
                                <span className="text-gray-500 text-xs">Sol</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {hangar.sol.beton && <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">Béton</span>}
                                  {hangar.sol.resineEpoxy && <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">Résine Époxy</span>}
                                  {hangar.sol.autre && <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">Autre</span>}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Col 2 — Emplacement */}
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-5 flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-[#00BFA6]" />
                        <h3 className="text-[17px] font-bold text-gray-900">Emplacement</h3>
                      </div>
                      <div className="space-y-3">
                        {hangar.logistics?.situation?.length > 0 && (
                          <div className="flex flex-col gap-2 py-1.5 border-b border-gray-100">
                            <span className="text-gray-500 text-xs">Situation</span>
                            <div className="flex flex-wrap gap-1.5">
                              {hangar.logistics.situation.map((s: string) => (
                                <span key={s} className="px-2 py-0.5 bg-[#00BFA6]/10 text-[#00BFA6] text-xs font-bold rounded-full">{LABELS[s] || s}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {hangar.logistics?.accessTransport?.length > 0 && (
                          <div className="flex flex-col gap-2 py-1.5">
                            <span className="font-bold text-gray-900 text-sm mb-1">Logistique</span>
                            <span className="text-gray-500 text-xs">Accès transport</span>
                            <div className="flex flex-wrap gap-1.5">
                              {hangar.logistics.accessTransport.map((a: string) => (
                                <span key={a} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">{LABELS[a] || a}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Col 3 — Annexes & Commodités */}
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-5 flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <Layers className="h-5 w-5 text-[#00BFA6]" />
                        <h3 className="text-[17px] font-bold text-gray-900">Annexes</h3>
                      </div>
                      <div className="space-y-3">
                        {hangar.annexes?.offices != null && (
                          <div className="flex flex-col gap-1 py-1.5 border-b border-gray-100">
                            <span className="text-gray-500 text-xs">Bureaux</span>
                            <span className="font-bold text-gray-900 text-sm">
                              {hangar.annexes.offices ? `Oui${hangar.annexes.officesArea ? ` — ${hangar.annexes.officesArea} m²` : ""}` : "Non"}
                            </span>
                          </div>
                        )}
                        {hangar.annexes?.socialLocales?.length > 0 && (
                          <div className="flex flex-col gap-2 py-1.5 border-b border-gray-100">
                            <span className="text-gray-500 text-xs">Locaux sociaux</span>
                            <div className="flex flex-wrap gap-1.5">
                              {hangar.annexes.socialLocales.map((s: string) => (
                                <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">{LABELS[s] || s}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {hangar.annexes?.hebergement?.length > 0 && (
                          <div className="flex flex-col gap-2 py-1.5 border-b border-gray-100">
                            <span className="text-gray-500 text-xs">Hébergement</span>
                            <div className="flex flex-wrap gap-1.5">
                              {hangar.annexes.hebergement.map((h: string) => (
                                <span key={h} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">{LABELS[h] || h}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {hangar.annexes?.security?.length > 0 && (
                          <div className="flex flex-col gap-2 py-1.5">
                            <span className="text-gray-500 text-xs">Sécurité</span>
                            <div className="flex flex-wrap gap-1.5">
                              {hangar.annexes.security.map((s: string) => (
                                <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">{LABELS[s] || s}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Col 4 — Énergie & Fluides + Sécurité incendie */}
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-5 flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-[#00BFA6]" />
                        <h3 className="text-[17px] font-bold text-gray-900">Énergie &amp; Fluides</h3>
                      </div>
                      <div className="space-y-3">
                        {(hangar.energy?.transformerKva != null || hangar.energy?.forceMotrice380) && (
                          <div className="flex flex-col gap-1 py-1.5 border-b border-gray-100">
                            <span className="text-gray-500 text-xs">Électricité</span>
                            <div className="flex flex-wrap gap-1.5">
                              {hangar.energy.transformerKva != null && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">Transfo {hangar.energy.transformerKva} KVA</span>
                              )}
                              {hangar.energy.forceMotrice380 && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">Force motrice 380V</span>
                              )}
                            </div>
                          </div>
                        )}
                        {hangar.energy?.gas && hangar.energy.gas !== "AUCUN" && (
                          <div className="flex flex-col gap-1 py-1.5 border-b border-gray-100">
                            <span className="text-gray-500 text-xs">Gaz</span>
                            <span className="font-bold text-gray-900 text-sm">{LABELS[hangar.energy.gas] || hangar.energy.gas}</span>
                          </div>
                        )}
                        {hangar.energy?.waterSources?.length > 0 && (
                          <div className="flex flex-col gap-2 py-1.5 border-b border-gray-100">
                            <span className="text-gray-500 text-xs">Eau</span>
                            <div className="flex flex-wrap gap-1.5">
                              {hangar.energy.waterSources.map((w: string) => (
                                <span key={w} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">{LABELS[w] || w}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {hangar.energy?.sanitation && (
                          <div className="flex flex-col gap-1 py-1.5 border-b border-gray-100">
                            <span className="text-gray-500 text-xs">Assainissement</span>
                            <span className="font-bold text-gray-900 text-sm">{LABELS[hangar.energy.sanitation] || hangar.energy.sanitation}</span>
                          </div>
                        )}
                        {hangar.fireSafety?.network?.length > 0 && (
                          <div className="flex flex-col gap-2 py-1.5 border-b border-gray-100">
                            <span className="text-gray-500 text-xs flex items-center gap-1"><Shield className="h-3 w-3" /> Réseau anti-incendie</span>
                            <div className="flex flex-wrap gap-1.5">
                              {hangar.fireSafety.network.map((n: string) => (
                                <span key={n} className="px-2 py-0.5 bg-red-50 text-red-700 text-xs font-bold rounded-full">{LABELS[n] || n}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {hangar.fireSafety?.equipment?.length > 0 && (
                          <div className="flex flex-col gap-2 py-1.5">
                            <span className="text-gray-500 text-xs">Équipements incendie</span>
                            <div className="flex flex-wrap gap-1.5">
                              {hangar.fireSafety.equipment.map((e: string) => (
                                <span key={e} className="px-2 py-0.5 bg-red-50 text-red-700 text-xs font-bold rounded-full">
                                  {LABELS[e] || e}
                                  {e === "BACHE_EAU" && hangar.energy?.waterTankCapacityLiters
                                    ? ` — ${hangar.energy.waterTankCapacityLiters.toLocaleString("fr-DZ")} L`
                                    : ""}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Description */}
              {announce.shortDescription && (
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#00BFA6]" />
                    Description
                  </h2>
                  <p className="text-gray-600 leading-relaxed">{announce.shortDescription}</p>
                </div>
              )}
            </>
          )}
          {/* ===== FIN SECTION HANGAR ===== */}

          {/* ===== SECTION SHOWROOM ===== */}
          {isShowroomProperty && showroom && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-100">Fiche Showroom</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Superficies & Dimensions */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Ruler className="h-5 w-5 text-[#00BFA6]" />Superficies &amp; Dimensions</h3>
                  <div className="space-y-2">
                    {showroom.surfaces?.terrain != null && <div className="flex justify-between text-sm"><span className="text-gray-500">Surface terrain</span><span className="font-bold">{showroom.surfaces.terrain} m²</span></div>}
                    {showroom.surfaces?.batie != null && <div className="flex justify-between text-sm"><span className="text-gray-500">Surface bâtie / expo</span><span className="font-bold">{showroom.surfaces.batie} m²</span></div>}
                    {showroom.dimensions?.niveaux != null && <div className="flex justify-between text-sm"><span className="text-gray-500">Niveaux</span><span className="font-bold">{showroom.dimensions.niveaux}</span></div>}
                    {showroom.dimensions?.hauteurPlafond != null && <div className="flex justify-between text-sm"><span className="text-gray-500">Hauteur plafond</span><span className="font-bold">{showroom.dimensions.hauteurPlafond} m</span></div>}
                    {showroom.dimensions?.facadeWidth != null && <div className="flex justify-between text-sm"><span className="text-gray-500">Longueur façade</span><span className="font-bold">{showroom.dimensions.facadeWidth} m</span></div>}
                    {showroom.dimensions?.facadeDepth != null && <div className="flex justify-between text-sm"><span className="text-gray-500">Profondeur</span><span className="font-bold">{showroom.dimensions.facadeDepth} m</span></div>}
                  </div>
                </div>
                {/* Style & Visibilité */}
                <div className="space-y-6">
                  {(showroom.style || showroom.structure) && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Building2 className="h-5 w-5 text-[#00BFA6]" />Style Architectural</h3>
                      <div className="space-y-2">
                        {showroom.style && <div className="flex justify-between text-sm"><span className="text-gray-500">Style</span><span className="font-bold">{LABELS[showroom.style] || showroom.style}</span></div>}
                        {showroom.structure && <div className="flex justify-between text-sm"><span className="text-gray-500">Structure</span><span className="font-bold">{LABELS[showroom.structure] || showroom.structure}</span></div>}
                      </div>
                    </div>
                  )}
                  {showroom.visibilite && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><MapPin className="h-5 w-5 text-[#00BFA6]" />Visibilité</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Visible depuis autoroute</span><span className="font-bold">{showroom.visibilite.autoroute ? "Oui" : "Non"}</span></div>
                        {showroom.visibilite.axeRoutier && <div className="flex justify-between text-sm"><span className="text-gray-500">Axe routier</span><span className="font-bold">{showroom.visibilite.axeRoutier}</span></div>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {/* ===== FIN SECTION SHOWROOM ===== */}

          {/* ===== SECTION LOCAL COMMERCIAL ===== */}
          {isLocalCommercialProperty && local && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-100">Fiche Local Commercial</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Environnement & Usage */}
                <div className="space-y-6">
                  {local.environnement && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2"><MapPin className="h-5 w-5 text-[#00BFA6]" />Environnement</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="font-bold">{LABELS[local.environnement] || local.environnement}</span></div>
                        {local.environnementAutre && <div className="flex justify-between"><span className="text-gray-500">Précision</span><span className="font-bold">{local.environnementAutre}</span></div>}
                      </div>
                    </div>
                  )}
                  {local.emplacement && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2"><Truck className="h-5 w-5 text-[#00BFA6]" />Emplacement &amp; Flux</h3>
                      <div className="space-y-1 text-sm">
                        {local.emplacement.zoneType && <div className="flex justify-between"><span className="text-gray-500">Zone</span><span className="font-bold">{LABELS[local.emplacement.zoneType] || local.emplacement.zoneType}</span></div>}
                        {local.emplacement.fluxPieton && <div className="flex justify-between"><span className="text-gray-500">Flux piéton</span><span className="font-bold">{LABELS[local.emplacement.fluxPieton] || local.emplacement.fluxPieton}</span></div>}
                        {local.emplacement.fluxVehicules && <div className="flex justify-between"><span className="text-gray-500">Flux véhicules</span><span className="font-bold">{LABELS[local.emplacement.fluxVehicules] || local.emplacement.fluxVehicules}</span></div>}
                      </div>
                    </div>
                  )}
                  {local.usage && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2"><Key className="h-5 w-5 text-[#00BFA6]" />Usage</h3>
                      <span className="inline-block bg-[#00BFA6]/10 text-[#00BFA6] px-3 py-1 rounded-full text-sm font-bold">{LABELS[local.usage] || local.usage}</span>
                    </div>
                  )}
                </div>
                {/* Dimensions */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Ruler className="h-5 w-5 text-[#00BFA6]" />Superficies &amp; Dimensions</h3>
                  <div className="space-y-2 text-sm">
                    {local.surfaces?.total != null && <div className="flex justify-between"><span className="text-gray-500">Surface totale</span><span className="font-bold">{local.surfaces.total} m²</span></div>}
                    {local.surfaces?.vitrineLongueur != null && <div className="flex justify-between"><span className="text-gray-500">Longueur vitrine</span><span className="font-bold">{local.surfaces.vitrineLongueur} ml</span></div>}
                    {local.surfaces?.largeur != null && <div className="flex justify-between"><span className="text-gray-500">Largeur</span><span className="font-bold">{local.surfaces.largeur} m</span></div>}
                    {local.surfaces?.profondeur != null && <div className="flex justify-between"><span className="text-gray-500">Profondeur</span><span className="font-bold">{local.surfaces.profondeur} m</span></div>}
                    {local.surfaces?.hauteurPlafond != null && <div className="flex justify-between"><span className="text-gray-500">Hauteur plafond</span><span className="font-bold">{local.surfaces.hauteurPlafond} m</span></div>}
                    {local.mezzanine?.present === true && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <div className="flex justify-between"><span className="text-gray-500">Mezzanine</span><span className="font-bold text-[#00BFA6]">Oui</span></div>
                        {local.mezzanine.surface != null && <div className="flex justify-between"><span className="text-gray-500">Surface mezzanine</span><span className="font-bold">{local.mezzanine.surface} m²</span></div>}
                      </div>
                    )}
                    {local.style && <div className="flex justify-between mt-2"><span className="text-gray-500">Style</span><span className="font-bold">{LABELS[local.style] || local.style}</span></div>}
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* ===== FIN SECTION LOCAL COMMERCIAL ===== */}

          {/* ===== SECTION BLOC ADMINISTRATIF ===== */}
          {isBlocAdministratifProperty && bloc && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-100">Fiche Bloc Administratif</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Structure */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Building2 className="h-5 w-5 text-[#00BFA6]" />Structure</h3>
                  <div className="space-y-2 text-sm">
                    {bloc.surfaces?.terrain != null && <div className="flex justify-between"><span className="text-gray-500">Surface terrain</span><span className="font-bold">{bloc.surfaces.terrain} m²</span></div>}
                    {bloc.surfaces?.batie != null && <div className="flex justify-between"><span className="text-gray-500">Surface bâtie</span><span className="font-bold">{bloc.surfaces.batie} m²</span></div>}
                    {bloc.structure?.etages != null && <div className="flex justify-between"><span className="text-gray-500">Étages (R+)</span><span className="font-bold">{bloc.structure.etages}</span></div>}
                    {bloc.structure?.facades != null && <div className="flex justify-between"><span className="text-gray-500">Façades</span><span className="font-bold">{bloc.structure.facades}</span></div>}
                    <div className="flex justify-between"><span className="text-gray-500">Sous-sol</span><span className="font-bold">{bloc.structure?.sousSol ? "Oui" : "Non"}</span></div>
                  </div>
                </div>
                {/* Espace */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Users className="h-5 w-5 text-[#00BFA6]" />Type d&apos;Espace</h3>
                  <div className="space-y-2 text-sm">
                    {bloc.espace?.typeEspace && <div className="flex justify-between"><span className="text-gray-500">Espace</span><span className="font-bold">{LABELS[bloc.espace.typeEspace] || bloc.espace.typeEspace}</span></div>}
                    {bloc.espace?.typeCloisonnement?.length > 0 && (
                      <div>
                        <span className="text-gray-500 block mb-1">Cloisonnement</span>
                        <div className="flex flex-wrap gap-1">{bloc.espace.typeCloisonnement.map((c: string) => <span key={c} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium">{LABELS[c] || c}</span>)}</div>
                      </div>
                    )}
                  </div>
                </div>
                {/* Connectivité */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Zap className="h-5 w-5 text-[#00BFA6]" />Connectivité</h3>
                  <div className="space-y-2 text-sm">
                    {bloc.connectivite?.type && <div className="flex justify-between"><span className="text-gray-500">Connexion</span><span className="font-bold">{LABELS[bloc.connectivite.type] || bloc.connectivite.type}</span></div>}
                    {bloc.connectivite?.typeConnexion?.length > 0 && (
                      <div>
                        <span className="text-gray-500 block mb-1">Mode</span>
                        <div className="flex flex-wrap gap-1">{bloc.connectivite.typeConnexion.map((c: string) => <span key={c} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium">{LABELS[c] || c}</span>)}</div>
                      </div>
                    )}
                    {bloc.connectivite?.equipementServeur?.length > 0 && (
                      <div className="mt-2">
                        <span className="text-gray-500 block mb-1">Équipements serveur</span>
                        <div className="flex flex-wrap gap-1">{bloc.connectivite.equipementServeur.map((e: string) => <span key={e} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">{LABELS[e] || e}</span>)}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* ===== FIN SECTION BLOC ADMINISTRATIF ===== */}

          {/* ===== SECTION TERRAIN AGRICOLE ===== */}
          {isTerrainAgricoleProperty && terrain?.agricole && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-100">Caractéristiques Agricoles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  {(terrain.agricole.unite) && (
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Unité de mesure</span><span className="font-bold">{LABELS[terrain.agricole.unite] || terrain.agricole.unite}</span></div>
                  )}
                  {terrain.agricole.vocation?.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-500 block mb-2">Vocation / Culture</span>
                      <div className="flex flex-wrap gap-2">{terrain.agricole.vocation.map((v: string) => <span key={v} className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">{LABELS[v] || v}</span>)}</div>
                      {terrain.agricole.vocationAutre && <p className="text-sm text-gray-600 mt-2">{terrain.agricole.vocationAutre}</p>}
                    </div>
                  )}
                  {terrain.agricole.ensoleillement && (
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Ensoleillement</span><span className="font-bold">{LABELS[terrain.agricole.ensoleillement] || terrain.agricole.ensoleillement}</span></div>
                  )}
                </div>
                <div className="space-y-4">
                  {terrain.agricole.ressourcesEau?.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-500 block mb-2">Ressources en eau</span>
                      <div className="flex flex-wrap gap-2">{terrain.agricole.ressourcesEau.map((r: string) => <span key={r} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">{LABELS[r] || r}</span>)}</div>
                      {terrain.agricole.debitForage && <p className="text-sm text-gray-600 mt-1">Débit forage : {terrain.agricole.debitForage} m³/h</p>}
                    </div>
                  )}
                  {terrain.agricole.exposition?.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-500 block mb-2">Exposition</span>
                      <div className="flex flex-wrap gap-2">{terrain.agricole.exposition.map((e: string) => <span key={e} className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">{LABELS[e] || e}</span>)}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {/* ===== FIN SECTION TERRAIN AGRICOLE ===== */}

          {/* Nouvelle section : Description et informations spécifiques */}
          {!isSpecialRental && !isSaleDemolition && (announce.shortDescription || property.usageType) && (
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Description Courte */}
                      {announce.shortDescription && (
                          <div>
                              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                  <Layers className="h-5 w-5 text-[#00BFA6]" />
                                  Description
                              </h2>
                              <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                                  {announce.shortDescription}
                              </p>
                          </div>
                      )}

                      {/* Mode de vie */}
                      {property.usageType && normalizedPropertyType !== "IMMEUBLE_RESIDENTIEL" && (
                          <div>
                              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                  <Users className="h-5 w-5 text-[#00BFA6]" />
                                  {normalizedPropertyType === "NIVEAU_VILLA" ? "Mode de vie et type d'accès" : "Promotion immobilière"}
                              </h2>
                              <div className="flex gap-4">
                                  {property.usageType === 'UNIQUE' ? (
                                      <div className="flex flex-col gap-1 w-full py-2">
                                          <span className="font-bold text-gray-900 text-lg">Usage unique (Communicante)</span>
                                          <span className="text-gray-500 text-sm">(les étages de la villa communiquent de l'intérieur)</span>
                                      </div>
                                  ) : property.usageType === 'SEPARE' ? (
                                      <div className="flex flex-col gap-1 w-full py-2">
                                          <span className="font-bold text-gray-900 text-lg">Usage séparé (appartement)</span>
                                          <span className="text-gray-500 text-sm">(chaque étage est indépendant)</span>
                                      </div>
                                  ) : property.usageType === 'ENTREE_INDEPENDANTE' ? (
                                      <div className="flex flex-col gap-1 w-full py-2">
                                          <span className="font-bold text-gray-900 text-lg">Entrée indépendante</span>
                                          <span className="text-gray-500 text-sm">(accès indépendant au niveau de villa)</span>
                                      </div>
                                  ) : property.usageType === 'ENTREE_COMMUNE' ? (
                                      <div className="flex flex-col gap-1 w-full py-2">
                                          <span className="font-bold text-gray-900 text-lg">Entrée commune</span>
                                          <span className="text-gray-500 text-sm">(accès partagé / entrée commune)</span>
                                      </div>
                                  ) : property.usageType === 'QUARTIER_OUVERT' ? (
                                      <div className="flex flex-col gap-1 w-full py-2">
                                          <span className="font-bold text-gray-900 text-lg">Quartier classique</span>
                                      </div>
                                  ) : property.usageType === 'RESIDENCE_CLOTUREE' ? (
                                      <div className="flex flex-col gap-1 w-full py-2">
                                          <span className="font-bold text-gray-900 text-lg">Résidence clôturée</span>
                                      </div>
                                  ) : property.usageType === 'PROMOTION_IMMOBILIERE' ? (
                                      <div className="flex flex-col gap-1 w-full py-2">
                                          <span className="font-bold text-gray-900 text-lg">Promotion immobilière</span>
                                      </div>
                                  ) : (
                                      <div className="flex flex-col gap-1 w-full py-2">
                                          <span className="font-bold text-gray-900 text-lg">{LABELS[property.usageType] || property.usageType}</span>
                                      </div>
                                  )}
                              </div>
                          </div>
                      )}

                  </div>
              </div>
          )}

          {/* Informations Générales (Detailed) - Résidentiel uniquement */}
          {!isSpecialRental && <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-100">Informations Générales</h2>

              <div className={isSaleDemolition ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"}>
                  {/* Colonne 01: Espace de Vie */}
                  {!isSaleDemolition && (
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-5 flex flex-col">
                      <div className="flex items-start gap-2 min-h-[40px] mb-3">
                          <BedDouble className="h-5 w-5 text-[#00BFA6] mt-0.5" />
                          <h3 className="text-[17px] font-bold text-gray-900 leading-tight">
                              {normalizedPropertyType === "APPARTEMENT_COMMERCIAL" ? "Espace exploité" : "Espace de Vie"}
                          </h3>
                      </div>
                      <div className="space-y-4 flex-1">
                          <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                              <span className="text-gray-500 text-sm">Chambres</span>
                              <span className="font-bold text-gray-900">{property.nbPieces || 0}</span>
                          </div>
                          <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                              <span className="text-gray-500 text-sm">Suites parentales</span>
                              <span className="font-bold text-gray-900">{property.nbSuites || 0}</span>
                          </div>
                          <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                              <span className="text-gray-500 text-sm">Salons</span>
                              <span className="font-bold text-gray-900">{property.nbLivingRooms || 0}</span>
                          </div>
                          <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                              <span className="text-gray-500 text-sm">WC / Toilettes</span>
                              <span className="font-bold text-gray-900">{property.nbToilets || 0}</span>
                          </div>
                          <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                              <span className="text-gray-500 text-sm">Salles de bain</span>
                              <span className="font-bold text-gray-900">{property.nbBathrooms || 0}</span>
                          </div>
                          <div className="flex flex-col gap-2 pt-1">
                              <span className="text-gray-500 text-sm">Type de salle de bain</span>
                              <div className="flex flex-wrap gap-2">
                                  {bathroomTypes.length > 0 ? (
                                      bathroomTypes.map((t, i) => (
                                          <span key={i} className={tagNeutralClass}>
                                              {LABELS[t] || t}
                                          </span>
                                      ))
                                  ) : (
                                      (property.bathroomType === 'LES_DEUX' || property.bathroomType === 'both') ? (
                                          <>
                                              <span className={tagNeutralClass}>Baignoire</span>
                                              <span className={tagNeutralClass}>Douche italienne</span>
                                          </>
                                      ) : property.bathroomType ? (
                                          <span className={tagNeutralClass}>
                                              {LABELS[property.bathroomType] || property.bathroomType}
                                          </span>
                                      ) : null
                                  )}
                              </div>
                          </div>
                      </div>
                  </div>
                  )}

                  {/* Colonne 02: Cuisine et équipements */}
                  {!isSaleDemolition && normalizedPropertyType !== "IMMEUBLE_RESIDENTIEL" && (
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-5 flex flex-col">
                      <div className="flex items-start gap-2 min-h-[40px] mb-3">
                          <Wind className="h-5 w-5 text-[#00BFA6] mt-0.5" />
                          <h3 className="text-[17px] font-bold text-gray-900 leading-tight">
                              <span className="xl:hidden">Cuisine</span>
                              <span className="hidden xl:inline">Cuisine &amp; équipements</span>
                          </h3>
                      </div>
                      <div className="space-y-4 flex-1">
                          <div className="flex flex-col gap-2 border-b border-gray-50 pb-4">
                              <span className="text-gray-500 text-sm">Type de cuisine</span>
                              {property.kitchenType && (
                                  <span className={tagPrimaryClass}>
                                      {LABELS[property.kitchenType] || property.kitchenType}
                                  </span>
                              )}
                          </div>
                          <div className="flex flex-col gap-3">
                              <span className="text-gray-500 text-sm">Équipements</span>
                              <div className="flex flex-wrap gap-2">
                                  {kitchenEquipments.length > 0 ? (
                                      kitchenEquipments.map((k, i) => (
                                          <span key={i} className={tagNeutralClass}>
                                              {getEquipmentLabel(k)}
                                          </span>
                                      ))
                                  ) : kitchens.length > 0 ? (
                                      kitchens.map((k, i) => (
                                          <span key={i} className={tagNeutralClass}>
                                              {k.label}
                                          </span>
                                      ))
                                  ) : (
                                      <span className="text-gray-400 text-xs italic">Non équipé</span>
                                  )}
                              </div>
                          </div>
                      </div>
                  </div>
                  )}

                  {/* Colonne 02 (Immeuble): Composition de l'immeuble */}
                  {normalizedPropertyType === "IMMEUBLE_RESIDENTIEL" && !isSaleBuildingDemolition && buildingTypology && (
                      <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-5 flex flex-col">
                          <div className="flex items-start gap-2 min-h-[40px] mb-3">
                              <Building2 className="h-5 w-5 text-[#00BFA6] mt-0.5" />
                              <h3 className="text-[17px] font-bold text-gray-900 leading-tight">Composition</h3>
                          </div>
                          <div className="space-y-3 flex-1">
                              {buildingTypology.apartmentTypology && (
                                  <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                                      <span className="text-gray-500 text-sm">Typologie des appartements</span>
                                      <span className="font-bold text-gray-900">{buildingTypology.apartmentTypology}</span>
                                  </div>
                              )}
                              {buildingTypology.totalApartments !== undefined && (
                                  <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                                      <span className="text-gray-500 text-sm">Nombre d'appartements</span>
                                      <span className="font-bold text-gray-900">{buildingTypology.totalApartments}</span>
                                  </div>
                              )}
                              {(buildingTypology.apartmentTypologies?.length || buildingTypology.apartmentTypologiesOther?.length) && (
                                  <div className="flex flex-col gap-2 py-1.5 border-b border-gray-50">
                                      <span className="text-gray-500 text-sm">Typologies</span>
                                      <div className="flex flex-wrap gap-2">
                                          {[...(Array.isArray(buildingTypology.apartmentTypologies) ? buildingTypology.apartmentTypologies : []), ...(Array.isArray(buildingTypology.apartmentTypologiesOther) ? buildingTypology.apartmentTypologiesOther : [])].map((t: string, i: number) => (
                                              <span key={i} className={tagNeutralClass}>
                                                  {t}
                                              </span>
                                          ))}
                                      </div>
                                  </div>
                              )}
                              {(Array.isArray(buildingTypology.apartmentStyle) ? buildingTypology.apartmentStyle.length > 0 : !!buildingTypology.apartmentStyle) && (
                                  <div className="flex flex-col gap-2 py-1.5 border-b border-gray-50">
                                      <span className="text-gray-500 text-sm">Style d&apos;appartement</span>
                                      <div className="flex flex-wrap gap-1.5">
                                          {(Array.isArray(buildingTypology.apartmentStyle) ? buildingTypology.apartmentStyle : [buildingTypology.apartmentStyle]).map((s: string, i: number) => (
                                              <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">
                                                  {s === "SIMPLEX" ? "Simplex" : s === "DUPLEX" ? "Duplex" : s === "TRIPLEX" ? "Triplex" : s}
                                              </span>
                                          ))}
                                      </div>
                                  </div>
                              )}
                              {buildingTypology.mode === "SIMILAIRES" ? (
                                  (property.area !== undefined && property.area !== null && Number(property.area) > 0) ? (
                                      <div className="flex justify-between items-center py-1.5">
                                          <span className="text-gray-500 text-sm">Surface</span>
                                          <span className="font-bold text-gray-900">{property.area} m²</span>
                                      </div>
                                  ) : (
                                      <div className="flex justify-between items-center py-1.5">
                                          <span className="text-gray-500 text-sm">Surface</span>
                                          <span className="text-gray-400 text-xs italic">Non spécifié</span>
                                      </div>
                                  )
                              ) : (
                                  buildingTypology.surfaceMode && (
                                      <div className="flex justify-between items-center py-1.5">
                                          <span className="text-gray-500 text-sm">Surface</span>
                                          <span className="font-bold text-gray-900">{buildingTypology.surfaceMode === "UNIQUE" ? "Unique" : buildingTypology.surfaceMode === "MULTI" ? "Multi-surfaces" : buildingTypology.surfaceMode}</span>
                                      </div>
                                  )
                              )}
                          </div>
                      </div>
                  )}

                  {/* Colonne 03: Commodités et compteurs */}
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-5 flex flex-col">
                      <div className="flex items-start gap-2 min-h-[40px] mb-3">
                          <Check className="h-5 w-5 text-[#00BFA6] mt-0.5" />
                          <h3 className="text-[17px] font-bold text-gray-900 leading-tight">Commodités</h3>
                      </div>
                      <div className="space-y-6 flex-1">
                          
                          {/* Espaces Extérieurs */}
                          {(exteriorFeatures.length > 0) && (
                              <div className="space-y-2">
                                  <h4 className="text-sm font-bold text-gray-900 mb-2">Espaces Extérieurs</h4>
                                  <div className="flex flex-wrap gap-2">
                                      {exteriorFeatures.map((item, idx) => (
                                          <span key={`ext-${idx}`} className={tagNeutralClass}>
                                              {getEquipmentLabel(item)}
                                          </span>
                                      ))}
                                  </div>
                              </div>
                          )}

                          {/* Chauffage et Climatisation */}
                          {(property.heatingType || property.acType) && (
                              <div className="grid grid-cols-2 gap-4">
                                  {property.heatingType && (
                                      <div className="space-y-2">
                                          <h4 className="text-sm font-bold text-gray-900 mb-2">Chauffage</h4>
                                          <span className={tagNeutralClass}>
                                              {LABELS[property.heatingType] || property.heatingType}
                                          </span>
                                      </div>
                                  )}
                                  {property.acType && (
                                      <div className="space-y-2">
                                          <h4 className="text-sm font-bold text-gray-900 mb-2">Climatisation</h4>
                                          <span className={tagNeutralClass}>
                                              {LABELS[property.acType] || property.acType}
                                          </span>
                                      </div>
                                  )}
                              </div>
                          )}

                          {/* Sécurité et Connectivité */}
                          {(securityFeatures.length > 0 || connectivityFeatures.length > 0) && (
                              <div className="grid grid-cols-2 gap-4">
                                  {securityFeatures.length > 0 && (
                                      <div className="space-y-2">
                                          <h4 className="text-sm font-bold text-gray-900 mb-2">Sécurité</h4>
                                          <div className="flex flex-wrap gap-2">
                                              {securityFeatures.map((item, idx) => (
                                                  <span key={`sec-${idx}`} className={tagNeutralClass}>
                                                      {getEquipmentLabel(item)}
                                                  </span>
                                              ))}
                                          </div>
                                      </div>
                                  )}
                                  {connectivityFeatures.length > 0 && (
                                      <div className="space-y-2">
                                          <h4 className="text-sm font-bold text-gray-900 mb-2">Connectivité</h4>
                                          <div className="flex flex-wrap gap-2">
                                              {connectivityFeatures.map((item, idx) => (
                                                  <span key={`con-${idx}`} className={tagNeutralClass}>
                                                      {getEquipmentLabel(item)}
                                                  </span>
                                              ))}
                                          </div>
                                      </div>
                                  )}
                              </div>
                          )}

                          {/* Other active amenities fallback */}
                          {[...conveniences, ...heaters, ...otherPieces, ...advantages].length > 0 && (
                              <div className="space-y-2">
                                  <h4 className="text-sm font-bold text-gray-900 mb-2">Autres Commodités</h4>
                                  <div className="flex flex-wrap gap-2">
                                      {[...conveniences, ...heaters, ...otherPieces, ...advantages].slice(0, 10).map((item, idx) => (
                                          <span key={idx} className={tagNeutralClass}>
                                              {item.label}
                                          </span>
                                      ))}
                                  </div>
                              </div>
                          )}

                          {/* Counters Section */}
                          <div className="space-y-3 pt-4 border-t border-gray-100">
                              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Compteurs</h4>
                              <div className="flex flex-col gap-2">
                                  {property.waterCounter && (
                                      <div className="flex justify-between items-center px-3 py-2 bg-blue-50/50 rounded-lg border border-blue-100">
                                          <span className="text-blue-700 text-[10px] font-bold uppercase">Eau</span>
                                          <span className="text-blue-900 text-[10px] font-black uppercase">{property.waterCounter === 'INDIVIDUAL' || property.waterCounter === 'INDIVIDUEL' ? 'Individuel' : 'Collectif'}</span>
                                      </div>
                                  )}
                                  {property.elecCounter && (
                                      <div className="flex justify-between items-center px-3 py-2 bg-yellow-50/50 rounded-lg border border-yellow-100">
                                          <span className="text-yellow-700 text-[10px] font-bold uppercase">Électricité</span>
                                          <span className="text-yellow-900 text-[10px] font-black uppercase">{property.elecCounter === 'INDIVIDUAL' || property.elecCounter === 'INDIVIDUEL' ? 'Individuel' : 'Collectif'}</span>
                                      </div>
                                  )}
                                  {property.gasCounter && (
                                      <div className="flex justify-between items-center px-3 py-2 bg-orange-50/50 rounded-lg border border-orange-100">
                                          <span className="text-orange-700 text-[10px] font-bold uppercase">Gaz</span>
                                          <span className="text-orange-900 text-[10px] font-black uppercase">{property.gasCounter === 'INDIVIDUAL' || property.gasCounter === 'INDIVIDUEL' ? 'Individuel' : 'Collectif'}</span>
                                      </div>
                                  )}
                              </div>
                          </div>
                      </div>
                  </div>

                  {isSaleDemolition && (
                      <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-5 flex flex-col">
                          <div className="flex items-start gap-2 min-h-[40px] mb-3">
                              <FileText className="h-5 w-5 text-[#00BFA6] mt-0.5" />
                              <h3 className="text-[17px] font-bold text-gray-900 leading-tight">Documents</h3>
                          </div>
                          <div className="space-y-4 flex-1">
                              <div className="flex flex-wrap gap-2">
                                  {legalDocuments.length > 0 ? (
                                      legalDocuments.map((d: string, i: number) => (
                                          <span key={i} className={tagNeutralClass}>
                                              {getLegalDocumentLabel(d)}
                                          </span>
                                      ))
                                  ) : (
                                      <span className="text-gray-400 text-xs italic">Non spécifié</span>
                                  )}
                              </div>
                          </div>
                      </div>
                  )}

                  {isSaleDemolition && (
                      <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-5 flex flex-col">
                          <div className="flex items-start gap-2 min-h-[40px] mb-3">
                              <Handshake className="h-5 w-5 text-[#00BFA6] mt-0.5" />
                              <h3 className="text-[17px] font-bold text-gray-900 leading-tight">Conditions de vente</h3>
                          </div>
                          <div className="space-y-4 flex-1">
                              <div className="flex flex-col gap-1.5 py-1.5 border-b border-gray-50">
                                  <span className="text-gray-500 text-sm">Accepte crédit bancaire</span>
                                  <span className="font-bold text-gray-900 text-sm">{acceptsBankCreditLabel}</span>
                              </div>
                          </div>
                      </div>
                  )}

                  {isSale && !isSaleDemolition && (
                      <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-5 flex flex-col">
                          <div className="flex items-start gap-2 min-h-[40px] mb-3">
                              <Handshake className="h-5 w-5 text-[#00BFA6] mt-0.5" />
                              <h3 className="text-[17px] font-bold text-gray-900 leading-tight">Vente</h3>
                          </div>
                          <div className="space-y-5 flex-1">
                              <div className="space-y-2">
                                  <div className="text-gray-500 text-sm">Conditions de vente</div>
                                  <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                                      <span className="text-gray-500 text-sm">Accepte crédit bancaire</span>
                                      <span className="font-bold text-gray-900 text-sm">{acceptsBankCreditLabel}</span>
                                  </div>
                              </div>
                              <div className="space-y-2 pt-3 border-t border-gray-100">
                                  <div className="text-gray-500 text-sm">Documents</div>
                                  <div className="flex flex-wrap gap-2">
                                      {legalDocuments.length > 0 ? (
                                          legalDocuments.map((d: string, i: number) => (
                                              <span key={i} className={tagNeutralClass}>
                                                  {getLegalDocumentLabel(d)}
                                              </span>
                                          ))
                                      ) : (
                                          <span className="text-gray-400 text-xs italic">Non spécifié</span>
                                      )}
                                  </div>
                              </div>
                          </div>
                      </div>
                  )}

                  {isRental && (
                      <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-5 flex flex-col">
                          <div className="flex items-start gap-2 min-h-[40px] mb-3">
                              <Search className="h-5 w-5 text-[#00BFA6] mt-0.5" />
                              <h3 className="text-[17px] font-bold text-gray-900 leading-tight">Conditions</h3>
                          </div>
                          <div className="space-y-4 flex-1">
                              <div className="flex flex-col gap-1.5 py-1.5 border-b border-gray-50">
                                  <span className="text-gray-500 text-sm">Usage Autorisé</span>
                                  <span className="font-bold text-gray-900 text-sm">
                                      {property.rentalUsage ? 
                                          (typeof property.rentalUsage === 'string' && property.rentalUsage.startsWith('[')) 
                                              ? JSON.parse(property.rentalUsage).map((u: string) => LABELS[u] || u).join(', ')
                                              : (LABELS[property.rentalUsage] || property.rentalUsage)
                                          : 'Non spécifié'}
                                  </span>
                              </div>
                              <div className="flex flex-col gap-1.5 py-1.5 border-b border-gray-50">
                                  <span className="text-gray-500 text-sm">Cautionnement</span>
                                  <span className="font-bold text-gray-900 text-sm">
                                      {property.depositMonths > 0 
                                          ? `${property.depositMonths} Mois` 
                                          : 'Aucune Caution'}
                                  </span>
                              </div>
                              <div className="flex flex-col gap-1.5 py-1.5 border-b border-gray-50">
                                  <span className="text-gray-500 text-sm">Charges</span>
                                  <span className="font-bold text-gray-900 text-sm">
                                      {property.chargesIncluded === 1 || property.chargesIncluded === true || String(property.chargesIncluded).trim() === '1' || String(property.chargesIncluded).trim() === '01' || String(property.chargesIncluded).toLowerCase() === 'true'
                                          ? 'Charges incluses' 
                                          : 'Sans charges'}
                                  </span>
                              </div>
                              <div className="flex flex-col gap-1.5 py-1.5 border-b border-gray-50">
                                  <span className="text-gray-500 text-sm">Disponibilité</span>
                                  <span className="font-bold text-[#00BFA6] text-sm">
                                      {property.availableDate
                                          ? (() => {
                                              try {
                                                  const dateObj = new Date(property.availableDate);
                                                  if (!isNaN(dateObj.getTime())) {
                                                      return `À partir du ${dateObj.toLocaleDateString('fr-FR')}`;
                                                  }
                                                  return 'Immédiate';
                                              } catch (e) {
                                                  return 'Immédiate';
                                              }
                                          })()
                                          : 'Immédiate'}
                                  </span>
                              </div>
                          </div>
                      </div>
                  )}
              </div>
          </div>}

          {isSaleDemolition && (announce.shortDescription || property.usageType) && (
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mt-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {announce.shortDescription && (
                          <div>
                              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                  <Layers className="h-5 w-5 text-[#00BFA6]" />
                                  Description
                              </h2>
                              <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                                  {announce.shortDescription}
                              </p>
                          </div>
                      )}

                      {property.usageType && normalizedPropertyType !== "IMMEUBLE_RESIDENTIEL" && (
                          <div>
                              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                  <Users className="h-5 w-5 text-[#00BFA6]" />
                                  {normalizedPropertyType === "NIVEAU_VILLA" ? "Mode de vie et type d'accès" : "Promotion immobilière"}
                              </h2>
                              <div className="flex gap-4">
                                  {property.usageType === 'UNIQUE' ? (
                                      <div className="flex flex-col gap-1 w-full py-2">
                                          <span className="font-bold text-gray-900 text-lg">Usage unique (Communicante)</span>
                                          <span className="text-gray-500 text-sm">(les étages de la villa communiquent de l'intérieur)</span>
                                      </div>
                                  ) : property.usageType === 'SEPARE' ? (
                                      <div className="flex flex-col gap-1 w-full py-2">
                                          <span className="font-bold text-gray-900 text-lg">Usage séparé (appartement)</span>
                                          <span className="text-gray-500 text-sm">(chaque étage est indépendant)</span>
                                      </div>
                                  ) : property.usageType === 'ENTREE_INDEPENDANTE' ? (
                                      <div className="flex flex-col gap-1 w-full py-2">
                                          <span className="font-bold text-gray-900 text-lg">Entrée indépendante</span>
                                          <span className="text-gray-500 text-sm">(accès indépendant au niveau de villa)</span>
                                      </div>
                                  ) : property.usageType === 'ENTREE_COMMUNE' ? (
                                      <div className="flex flex-col gap-1 w-full py-2">
                                          <span className="font-bold text-gray-900 text-lg">Entrée commune</span>
                                          <span className="text-gray-500 text-sm">(accès partagé / entrée commune)</span>
                                      </div>
                                  ) : property.usageType === 'QUARTIER_OUVERT' ? (
                                      <div className="flex flex-col gap-1 w-full py-2">
                                          <span className="font-bold text-gray-900 text-lg">Quartier classique</span>
                                      </div>
                                  ) : property.usageType === 'RESIDENCE_CLOTUREE' ? (
                                      <div className="flex flex-col gap-1 w-full py-2">
                                          <span className="font-bold text-gray-900 text-lg">Résidence clôturée</span>
                                      </div>
                                  ) : property.usageType === 'PROMOTION_IMMOBILIERE' ? (
                                      <div className="flex flex-col gap-1 w-full py-2">
                                          <span className="font-bold text-gray-900 text-lg">Promotion immobilière</span>
                                      </div>
                                  ) : (
                                      <div className="flex flex-col gap-1 w-full py-2">
                                          <span className="font-bold text-gray-900 text-lg">{LABELS[property.usageType] || property.usageType}</span>
                                      </div>
                                  )}
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          )}
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

    {/* ── MODAL SIGNALEMENT ── */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setIsReportModalOpen(false); setReportSent(false); setReportReason("") }}>
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-red-500 fill-current"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                Signaler un problème
              </h3>
              <button onClick={() => { setIsReportModalOpen(false); setReportSent(false); setReportReason("") }} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              {reportSent ? (
                <div className="text-center py-6">
                  <div className="h-14 w-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="h-7 w-7 text-green-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-lg">Signalement envoyé</h4>
                  <p className="text-gray-500 text-sm mt-2">Notre équipe examinera cette annonce. Merci pour votre contribution.</p>
                  <button onClick={() => { setIsReportModalOpen(false); setReportSent(false); setReportReason("") }} className="mt-5 px-6 py-2.5 bg-[#00BFA6] text-white rounded-xl font-bold text-sm">Fermer</button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">Pourquoi signalez-vous cette annonce ?</p>
                  <div className="space-y-2">
                    {["Annonce frauduleuse", "Prix incorrect / trompeur", "Photos non conformes", "Bien déjà vendu / loué", "Informations incorrectes", "Autre raison"].map(r => (
                      <label key={r} className="flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors hover:border-gray-300" style={reportReason === r ? { borderColor: '#ef4444', backgroundColor: '#fef2f2' } : { borderColor: '#f3f4f6' }}>
                        <input type="radio" name="reportReason" value={r} checked={reportReason === r} onChange={() => setReportReason(r)} className="sr-only" />
                        <div className={`h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center ${reportReason === r ? 'border-red-500 bg-red-500' : 'border-gray-300'}`}>
                          {reportReason === r && <div className="h-1.5 w-1.5 bg-white rounded-full" />}
                        </div>
                        <span className={`text-sm font-medium ${reportReason === r ? 'text-red-600' : 'text-gray-700'}`}>{r}</span>
                      </label>
                    ))}
                  </div>
                  <Button
                    disabled={!reportReason}
                    className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold disabled:opacity-40"
                    onClick={() => { if (reportReason) setReportSent(true) }}
                  >
                    Envoyer le signalement
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
