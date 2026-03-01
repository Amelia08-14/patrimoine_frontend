"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { 
  Check, Upload, Building2, Warehouse, Home, Key, Building, Store, Hotel, 
  Briefcase, BedDouble, PartyPopper, Factory, Tent, X, Flower2, Sun, 
  Waves, Wind, Archive, ParkingCircle, DoorOpen, Trees, Landmark, 
  Users, Hotel as HotelIcon, Star,
  LayoutGrid, Layers, Warehouse as WarehouseIcon, ThermometerSnowflake,
  Mic, Utensils, Sparkles,
  Mountain, Palmtree, Wifi, Dumbbell, Shield, Share2,
  ArrowLeftRight, Heart, Clock, GraduationCap, Stethoscope, ShoppingBag,
  HeartPulse, School, Church, Footprints, Dog, Bike, Lock, Eye,
  Battery, Droplet, Flame, Snowflake, Fan, CookingPot,
  Bath, Sofa, Armchair, Table, Lamp, Bed,
  Ruler, MapPin, Navigation, Compass, Camera, Video, Speaker,
  Microscope, FlaskConical, Atom, Leaf, Flower, Cloud, CloudRain, CloudSun,
  Moon, Stars, Sunset, Sunrise, Wind as WindIcon, Umbrella, ArrowLeft,
  GripVertical, Image as ImageIcon,
  Bath as BathIcon, Bed as BedIcon, Utensils as UtensilsIcon, Flower2 as GardenIcon, Zap, FileText, Phone
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { WILAYAS } from "@/data/wilayas"
import { COMMUNES } from "@/data/communes"
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'

// Types pour le formulaire
type FormData = {
  // Étape 1-2-3
  transactionType: "SALE" | "RENTAL"
  realEstateType: string
  propertyType: string
  
  // Étape 4 - Villa
  floorCount?: string
  extraFloor?: "basement" | "entresol" | "attic" | "none"
  typology?: string
  typologyCustom?: string
  bedrooms?: string
  nbSuites?: string
  livingRooms?: string
  bathrooms?: string
  bathroomType?: "shower" | "bathtub" | "both" | "none"
  wc?: string
  landArea?: string
  builtArea?: string
  habitableArea?: string
  state?: "NEUF" | "RENOVE" | "BON_ETAT"
  parkingCount?: string // Garage
  outdoorParking?: string
  usageType?: "UNIQUE" | "SEPARE"
  
  // Kitchen
  kitchenType?: "AMERICAINE" | "FERMEE" | "SEMI_OUVERTE"
  kitchenState?: "EQUIPEE" | "AMENAGEE" | "VIDE"

  // Tech & Comfort
  heatingType?: "CENTRAL" | "SOL" | "GAZ"
  acType?: "CENTRAL" | "SPLIT" | "SANS"
  
  // Counters
  waterCounter?: "INDIVIDUEL" | "COMMUN"
  elecCounter?: "INDIVIDUEL" | "COMMUN"
  gasCounter?: "INDIVIDUEL" | "COMMUN"

  // Rental specific
  depositMonths?: string
  rentalUsage?: "HABITATION" | "PROFESSIONNEL"
  chargesIncluded?: boolean
  availableDate?: string

  kitchenEquipment?: string[]
  exteriorFeatures?: string[]
  utilities?: string[]
  securityFeatures?: string[]
  connectivity?: string[]
  
  garageCapacity?: string
  additionalDescription?: string
  
  // Étape 5 - Localisation & Prix
  city?: string
  commune?: string
  address?: string
  price?: string
  priceUnit?: "DA" | "MILLION" | "MILLIARD"
  
  // Étape 6 - Photos (géré séparément)
  description?: string
  
  // Champs génériques (parfois calculés ou implicites)
  area?: string
  rooms?: string
}

// Icon mapping
const IconMap: Record<string, React.ElementType> = {
  Home, Building, Building2, Warehouse, Hotel, Briefcase, Store, BedDouble, 
  PartyPopper, Factory, Tent, Archive, ParkingCircle, DoorOpen, Trees, Sun,
  Utensils, CookingPot, Droplet, Battery, Flame, Video, Lock, Shield, Wifi, Phone,
  Villa: Home,
  VillaLevel: Layers,
  Apartment: Building,
  Duplex: LayoutGrid,
  Triplex: Layers,
  ApartmentBuilding: Building2,
  Studio: Home,
  ResidentialLand: Trees,
  Hangar: WarehouseIcon,
  Usine: Factory,
  ChambreFroide: ThermometerSnowflake,
  TerrainIndustriel: Landmark,
  CoStockage: Archive,
  SalleFormation: Users,
  SalleConference: Mic,
  SalleDiner: Utensils,
  SalleFetes: PartyPopper,
  TerrainHotel: Palmtree,
  HotelEtoile: Star,
  StructureHoteliere: HotelIcon,
  CentreAffaires: Building2,
  Coworking: Users,
  BureauFlexible: Briefcase,
  ImmeubleBureaux: Building,
  Showroom: Store,
  VillaBureau: Home,
  NiveauVillaBureau: Layers,
  AppartementBureau: Building,
  LocalCommercial: Store,
  HebergementEtoile: Star,
  HebergementSansEtoile: Hotel,
  ComplexeEtoile: Sparkles,
  ComplexeSansEtoile: Trees,
  Arbre: Trees,
  Palmier: Palmtree,
  Montagne: Mountain,
  Plage: Waves,
  Piscine: Droplet,
  Sport: Dumbbell,
  Securite: Shield,
  Reseau: Share2,
  Echange: ArrowLeftRight,
  Favori: Heart,
  Temps: Clock,
  Education: GraduationCap,
  Sante: Stethoscope,
  Shopping: ShoppingBag,
  Medical: HeartPulse,
  Ecole: School,
  Eglise: Church,
  Pieton: Footprints,
  Animal: Dog,
  Velos: Bike,
  Serrure: Lock,
  Vue: Eye,
  Batterie: Battery,
  Eau: Droplet,
  Flamme: Flame,
  Neige: Snowflake,
  Ventilateur: Fan,
  Cuisine: CookingPot,
  Evier: Bath,
  Baignoire: Bath,
  Douche: Bath,
  Canape: Sofa,
  Fauteuil: Armchair,
  Table: Table,
  Lampe: Lamp,
  Lit: Bed,
  Armoire: Sofa,
  Regle: Ruler,
  Carte: MapPin,
  Navigation: Navigation,
  Boussole: Compass,
  Camera: Camera,
  HautParleur: Speaker,
  Microscope: Microscope,
  Labo: FlaskConical,
  Atome: Atom,
  Feuille: Leaf,
  Fleur: Flower,
  Nuage: Cloud,
  Pluie: CloudRain,
  SoleilNuage: CloudSun,
  Lune: Moon,
  Etoiles: Stars,
  CoucherSoleil: Sunset,
  LeverSoleil: Sunrise,
  Vent: WindIcon,
  Parapluie: Umbrella
}

// Types d'immobilier de base
const BASE_REAL_ESTATE_CATEGORIES = [
  { id: "RESIDENTIEL", label: "Immobilier Résidentiel", iconName: "Home" },
  { id: "INDUSTRIEL", label: "Immobilier Industriel", iconName: "Factory" },
  { id: "EVENEMENTIEL", label: "Immobilier Évènementiel", iconName: "PartyPopper" },
  { id: "HOTELIER", label: "Immobilier Hôtelier", iconName: "Hotel" },
  { id: "BUREAUX_COMMERCES", label: "Bureaux et Commerces", iconName: "Briefcase" },
  { id: "HEBERGEMENT", label: "Hébergement et Séjours", iconName: "BedDouble" },
]

// Types de biens par catégorie
const BASE_PROPERTY_TYPES = [
  { id: "VILLA", label: "Villa", categoryId: "RESIDENTIEL", iconName: "Villa" },
  { id: "NIVEAU_VILLA", label: "Niveau de villa", categoryId: "RESIDENTIEL", iconName: "VillaLevel" },
  { id: "APPARTEMENT", label: "Appartement", categoryId: "RESIDENTIEL", iconName: "Apartment" },
  { id: "DUPLEX", label: "Duplex", categoryId: "RESIDENTIEL", iconName: "Duplex" },
  { id: "TRIPLEX", label: "Triplex", categoryId: "RESIDENTIEL", iconName: "Triplex" },
  { id: "IMMEUBLE_RESIDENTIEL", label: "Immeuble d'appartements", categoryId: "RESIDENTIEL", iconName: "ApartmentBuilding" },
  { id: "STUDIO", label: "Studio", categoryId: "RESIDENTIEL", iconName: "Studio" },
  { id: "TERRAIN_RESIDENTIEL", label: "Terrain résidentiel", categoryId: "RESIDENTIEL", iconName: "ResidentialLand" },
  { id: "HANGAR", label: "Hangar", categoryId: "INDUSTRIEL", iconName: "Hangar" },
  { id: "USINE", label: "Usine", categoryId: "INDUSTRIEL", iconName: "Usine" },
  { id: "CHAMBRE_FROIDE", label: "Chambre froide", categoryId: "INDUSTRIEL", iconName: "ChambreFroide" },
  { id: "TERRAIN_INDUSTRIEL", label: "Terrain industriel", categoryId: "INDUSTRIEL", iconName: "TerrainIndustriel" },
  { id: "CO_STOCKAGE", label: "Co-stockage et entreposage", categoryId: "INDUSTRIEL", iconName: "CoStockage" },
  { id: "SALLE_FORMATION", label: "Salle de formation", categoryId: "EVENEMENTIEL", iconName: "SalleFormation" },
  { id: "SALLE_CONFERENCE", label: "Salle de conférence", categoryId: "EVENEMENTIEL", iconName: "SalleConference" },
  { id: "SALLE_DINER", label: "Salle de dîner", categoryId: "EVENEMENTIEL", iconName: "SalleDiner" },
  { id: "SALLE_FETES", label: "Salle des fêtes", categoryId: "EVENEMENTIEL", iconName: "SalleFetes" },
  { id: "TERRAIN_HOTELIER", label: "Terrain hôtelier", categoryId: "HOTELIER", iconName: "TerrainHotel" },
  { id: "HOTEL", label: "Hôtel", categoryId: "HOTELIER", iconName: "HotelEtoile" },
  { id: "AUTRE_HOTEL", label: "Autre structure hôtelière", categoryId: "HOTELIER", iconName: "StructureHoteliere" },
  { id: "CENTRE_AFFAIRES", label: "Centre d'affaires", categoryId: "BUREAUX_COMMERCES", iconName: "CentreAffaires" },
  { id: "COWORKING", label: "Espace co-working", categoryId: "BUREAUX_COMMERCES", iconName: "Coworking" },
  { id: "BUREAU_FLEXIBLE", label: "Bureau flexible", categoryId: "BUREAUX_COMMERCES", iconName: "BureauFlexible" },
  { id: "IMMEUBLE_BUREAU", label: "Immeuble de bureaux", categoryId: "BUREAUX_COMMERCES", iconName: "ImmeubleBureaux" },
  { id: "SHOWROOM", label: "Showroom", categoryId: "BUREAUX_COMMERCES", iconName: "Showroom" },
  { id: "VILLA_COMMERCIALE", label: "Villa commerciale", categoryId: "BUREAUX_COMMERCES", iconName: "VillaBureau" },
  { id: "NIVEAU_VILLA_COMMERCIAL", label: "Niveau de villa commerciale", categoryId: "BUREAUX_COMMERCES", iconName: "NiveauVillaBureau" },
  { id: "APPARTEMENT_COMMERCIAL", label: "Appartement commercial", categoryId: "BUREAUX_COMMERCES", iconName: "AppartementBureau" },
  { id: "LOCAL_COMMERCIAL", label: "Local commercial", categoryId: "BUREAUX_COMMERCES", iconName: "LocalCommercial" },
  { id: "HEBERGEMENT_HOTELIER", label: "Hébergement hôtelier étoilé", categoryId: "HEBERGEMENT", iconName: "HebergementEtoile" },
  { id: "AUTRE_HEBERGEMENT", label: "Hébergement hôtelier sans étoile", categoryId: "HEBERGEMENT", iconName: "HebergementSansEtoile" },
  { id: "COMPLEXE_TOURISTIQUE_HEBERGEMENT", label: "Complexe touristique étoilé", categoryId: "HEBERGEMENT", iconName: "ComplexeEtoile" },
  { id: "COMPLEXE_TOURISTIQUE", label: "Complexe touristique sans étoile", categoryId: "HEBERGEMENT", iconName: "ComplexeSansEtoile" },
]

// Types d'étages supplémentaires
const EXTRA_FLOOR_TYPES = [
  { id: "basement", label: "Sous-sol" },
  { id: "entresol", label: "Entre-sol" },
  { id: "attic", label: "Grenier" },
]

// Types de typologies
const TYPOLOGIES = [
  { id: "F3", label: "F3" },
  { id: "F4", label: "F4" },
  { id: "F5", label: "F5" },
]

// Types de salles de bain
const BATHROOM_TYPES = [
  { id: "shower", label: "Douche italienne", icon: "Droplet" },
  { id: "bathtub", label: "Baignoire", icon: "Bath" },
]

const PROPERTY_STATES = [
    { id: "NEUF", label: "Neuf (Jamais habité)" },
    { id: "RENOVE", label: "Rénové" },
    { id: "BON_ETAT", label: "Bon état" }
]

const USAGE_TYPES = [
    { id: "UNIQUE", label: "Unique (Une seule famille)" },
    { id: "SEPARE", label: "Séparé (Plusieurs familles)" }
]

const KITCHEN_TYPES = [
    { id: "AMERICAINE", label: "Américaine (Ouverte)" },
    { id: "FERMEE", label: "Fermée" },
    { id: "SEMI_OUVERTE", label: "Semi-ouverte" }
]

const KITCHEN_STATES = [
    { id: "EQUIPEE", label: "Équipée (Meubles + Électroménager)" },
    { id: "AMENAGEE", label: "Aménagée (Meubles seulement)" },
    { id: "VIDE", label: "Vide" }
]

const HEATING_TYPES = [
    { id: "CENTRAL", label: "Chauffage Central" },
    { id: "SOL", label: "Chauffage au Sol" },
    { id: "GAZ", label: "Chauffage à Gaz (Poêle)" }
]

const AC_TYPES = [
    { id: "CENTRAL", label: "Climatisation Centrale" },
    { id: "SPLIT", label: "Split System (Climatiseurs muraux)" },
    { id: "SANS", label: "Sans climatisation" }
]

// Types d'équipements avec icônes
const VILLA_EQUIPMENTS = {
  kitchen: [
    { id: "kitchen_fitted", label: "Cuisine aménagée", icon: "Utensils" },
    { id: "kitchen_equipped", label: "Cuisine équipée", icon: "CookingPot" },
  ],
  exterior: [
    { id: "garden", label: "Jardin", icon: "Trees" },
    { id: "terrace", label: "Terrasse", icon: "Sun" },
    { id: "balcony", label: "Balcon", icon: "Home" },
  ],
  utilities: [
    { id: "water_tank", label: "Bâche à eau", icon: "Droplet" },
    { id: "generator", label: "Groupe électrogène", icon: "Battery" },
    { id: "central_heating", label: "Chauffage central", icon: "Flame" },
  ],
  security: [
    { id: "cameras", label: "Caméras de surveillance", icon: "Video" },
    { id: "alarm", label: "Alarme", icon: "Lock" },
    { id: "guardian", label: "Gardiennage 24/7", icon: "Shield" },
  ],
  connectivity: [
    { id: "fiber", label: "Fibre optique", icon: "Wifi" },
    { id: "adsl", label: "ADSL", icon: "Reseau" },
    { id: "phone_line", label: "Ligne téléphonique", icon: "Phone" },
  ]
}

// Interface pour les catégories de photos
interface PhotoCategory {
  id: string
  label: string
  icon: React.ElementType
  photos: File[]
}

// Schéma de validation
const formSchema = z.object({
  transactionType: z.enum(["SALE", "RENTAL"]),
  realEstateType: z.string().min(1, "Type d'immobilier requis"),
  propertyType: z.string().min(1, "Type de bien requis"),
  typologyCustom: z.string().optional(), // Ajout de ce champ
  
  city: z.string().min(2, "Wilaya requise").optional(),
  commune: z.string().min(2, "Commune requise").optional(),
  address: z.string().min(5, "Adresse du bien requise").optional(),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Prix invalide").optional(),
  priceUnit: z.enum(["DA", "MILLION", "MILLIARD"]).default("DA").optional(),
  description: z.string().min(10, "Description requise (min 10 caractères)").optional(),
  floorCount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 5, "Nombre d'étages invalide (0-5)").optional(),
  extraFloor: z.enum(["basement", "entresol", "attic", "none"]).default("none").optional(),
  typology: z.string().optional(),
  bedrooms: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Nombre de chambres invalide").optional(),
  nbSuites: z.string().optional(),
  livingRooms: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Nombre de salons invalide").optional(),
  bathrooms: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, "Nombre de salles de bain invalide").optional(),
  bathroomType: z.enum(["shower", "bathtub", "both", "none"]).default("none").optional(),
  wc: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, "Nombre de WC invalide").optional(),
  landArea: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Surface du terrain invalide").optional(),
  builtArea: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Surface bâtie invalide").optional(),
  habitableArea: z.string().optional(),
  state: z.enum(["NEUF", "RENOVE", "BON_ETAT"]).optional(),
  parkingCount: z.string().optional(),
  outdoorParking: z.string().optional(),
  usageType: z.enum(["UNIQUE", "SEPARE"]).optional(),
  kitchenType: z.enum(["AMERICAINE", "FERMEE", "SEMI_OUVERTE"]).optional(),
  kitchenState: z.enum(["EQUIPEE", "AMENAGEE", "VIDE"]).optional(),
  heatingType: z.enum(["CENTRAL", "SOL", "GAZ"]).optional(),
  acType: z.enum(["CENTRAL", "SPLIT", "SANS"]).optional(),
  waterCounter: z.enum(["INDIVIDUEL", "COMMUN"]).optional(),
  elecCounter: z.enum(["INDIVIDUEL", "COMMUN"]).optional(),
  gasCounter: z.enum(["INDIVIDUEL", "COMMUN"]).optional(),
  depositMonths: z.string().optional(),
  rentalUsage: z.enum(["HABITATION", "PROFESSIONNEL"]).optional(),
  chargesIncluded: z.boolean().optional(),
  availableDate: z.string().optional(),
  
  kitchenEquipment: z.array(z.string()).optional(),
  exteriorFeatures: z.array(z.string()).optional(),
  utilities: z.array(z.string()).optional(),
  securityFeatures: z.array(z.string()).optional(),
  connectivity: z.array(z.string()).optional(),
  garageCapacity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, "Capacité du garage invalide").optional(),
  additionalDescription: z.string().optional(),
})

const steps = [
  { id: 1, name: "Type de transaction" },
  { id: 2, name: "Type d'immobilier" },
  { id: 3, name: "Type de bien" },
  { id: 4, name: "Fiche descriptive" },
  { id: 5, name: "Localisation & Prix" },
  { id: 6, name: "Photos du bien" },
]

export default function DepositPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [photoCategories, setPhotoCategories] = useState<PhotoCategory[]>([
    { id: "bedrooms", label: "Chambres", icon: BedIcon, photos: [] },
    { id: "bathrooms", label: "Salles de bain & WC", icon: BathIcon, photos: [] },
    { id: "kitchen", label: "Cuisine", icon: UtensilsIcon, photos: [] },
    { id: "exterior", label: "Extérieur (jardin, piscine)", icon: GardenIcon, photos: [] },
    { id: "common", label: "Espaces communs", icon: Home, photos: [] },
    { id: "other", label: "Autres photos", icon: ImageIcon, photos: [] },
  ])
  const [photoOrganizationStep, setPhotoOrganizationStep] = useState<"upload" | "organize">("upload")
  const [userType, setUserType] = useState<string>("PARTICULIER")
  const [availabilityMode, setAvailabilityMode] = useState<'IMMEDIATE' | 'DATE'>('IMMEDIATE')

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    
    if (!token || !userStr) {
      router.push('/auth/login')
      return
    }

    const user = JSON.parse(userStr)
    if (!user.adminVerified) {
        alert("Votre compte est en attente de validation par un administrateur. Vous ne pouvez pas encore déposer d'annonce.")
        router.push('/')
    }
    
    setUserType(user.userType || "PARTICULIER")
  }, [router])

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transactionType: "SALE",
      extraFloor: "none",
      bathroomType: "none",
      priceUnit: "DA",
    },
  })

   const transactionType = watch("transactionType")
  const realEstateType = watch("realEstateType")
  const propertyType = watch("propertyType")
  const selectedCity = watch("city")
  const garageHasCapacity = watch("garageCapacity")


  // Filtrer les catégories selon le type d'utilisateur et la transaction
  const getFilteredCategories = () => {
    let categories = [...BASE_REAL_ESTATE_CATEGORIES]
    if (userType === "PARTICULIER") {
      categories = categories.filter(cat => cat.id !== "EVENEMENTIEL" && cat.id !== "HOTELIER")
    }
    if (transactionType === "SALE") {
      categories = categories.filter(cat => cat.id !== "HEBERGEMENT")
      if (userType === "SOCIETE") {
        categories = categories.filter(cat => cat.id !== "EVENEMENTIEL")
      }
    }
    return categories
  }

  // Filtrer les types de biens
  const getFilteredPropertyTypes = () => {
    let types = [...BASE_PROPERTY_TYPES]
    types = types.filter(t => t.categoryId === realEstateType)
    if (userType === "PARTICULIER") {
      types = types.filter(t => t.id !== "CO_STOCKAGE")
      types = types.filter(t => !["CENTRE_AFFAIRES", "COWORKING", "BUREAU_FLEXIBLE"].includes(t.id))
      if (realEstateType === "HEBERGEMENT" && transactionType === "RENTAL") {
        types = [{
          id: "HEBERGEMENT_HABITANT",
          label: "FORMULE HEBERGEMENT CHEZ L'HABITANT",
          categoryId: "HEBERGEMENT",
          iconName: "Home"
        }]
      }
    }
    if (userType === "SOCIETE") {
      types = types.filter(t => t.id !== "CO_STOCKAGE")
      if (transactionType === "SALE") {
        types = types.filter(t => !["CENTRE_AFFAIRES", "COWORKING", "BUREAU_FLEXIBLE"].includes(t.id))
      }
    }
    return types
  }

  const filteredCommunes = selectedCity 
    ? COMMUNES.filter(c => {
        const wilaya = WILAYAS.find(w => w.name === selectedCity)
        return wilaya ? c.wilayaCode === wilaya.code : false
      })
    : []

  // Gestion des photos - Upload initial
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      if (selectedFiles.length + newFiles.length > 30) {
        alert("Vous ne pouvez pas ajouter plus de 30 photos au total")
        return
      }
      setSelectedFiles(prev => [...prev, ...newFiles])
      e.target.value = ''
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Passer à l'organisation des photos
  const proceedToPhotoOrganization = () => {
    if (selectedFiles.length < 3) {
      alert("Veuillez ajouter au moins 3 photos")
      return
    }
    
    // Répartir les photos dans les catégories (aléatoirement pour l'instant)
    const categorized = [...photoCategories]
    const shuffled = [...selectedFiles].sort(() => 0.5 - Math.random())
    
    categorized.forEach((cat, index) => {
      if (index < shuffled.length) {
        cat.photos = [shuffled[index]]
      }
    })
    
    setPhotoCategories(categorized)
    setPhotoOrganizationStep("organize")
  }

  // Drag and drop pour réorganisation
  const handleDragEnd = (categoryId: string, result: DropResult) => {
    if (!result.destination) return
    
    const category = photoCategories.find(c => c.id === categoryId)
    if (!category) return
    
    const items = Array.from(category.photos)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    
    setPhotoCategories(prev => 
      prev.map(c => c.id === categoryId ? { ...c, photos: items } : c)
    )
  }

  // Déplacer une photo entre catégories
  const movePhoto = (photo: File, fromCategoryId: string, toCategoryId: string) => {
    setPhotoCategories(prev => {
      const fromCategory = prev.find(c => c.id === fromCategoryId)
      const toCategory = prev.find(c => c.id === toCategoryId)
      
      if (!fromCategory || !toCategory) return prev
      
      return prev.map(c => {
        if (c.id === fromCategoryId) {
          return { ...c, photos: c.photos.filter(p => p !== photo) }
        }
        if (c.id === toCategoryId) {
          return { ...c, photos: [...c.photos, photo] }
        }
        return c
      })
    })
  }

  const handleTransactionTypeClick = (type: "SALE" | "RENTAL") => {
    setValue("transactionType", type)
    setCurrentStep(2)
  }

  const handleCategoryClick = (categoryId: string) => {
    setValue("realEstateType", categoryId)
    setCurrentStep(3)
  }

  const handlePropertyTypeClick = (propertyId: string) => {
    setValue("propertyType", propertyId)
    // Après le choix du bien, aller à la fiche descriptive
    setCurrentStep(4)
  }

  const handleDescriptiveSubmit = async () => {
    let isValid = false;
    
    // Validation selon le type de bien
    if (propertyType === "VILLA") {
        isValid = await trigger([
            "typology", "floorCount", 
            "landArea", "builtArea", "habitableArea",
            "state", "parkingCount", "outdoorParking",
            "usageType", "bedrooms", "nbSuites", "livingRooms", "bathrooms", "wc", "bathroomType",
            "kitchenType", "kitchenState",
            "depositMonths", "availableDate",
            "typologyCustom"
        ]);
        
        console.log("Villa validation result:", isValid);
        if (!isValid) console.log("Errors:", errors);
        
    } else {
        // Autres types de biens
        isValid = await trigger([
            "floorCount", "extraFloor", "typology", "bedrooms", "livingRooms",
            "bathrooms", "bathroomType", "wc", "landArea", "builtArea"
        ]);
    }
    
    if (isValid) {
      setCurrentStep(5)
    }
  }

  const handleLocationSubmit = async () => {
    const isValid = await trigger(["city", "commune", "address", "price", "priceUnit"])
    if (isValid) {
      setCurrentStep(6)
    }
  }

  const goToStep = (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step)
    }
  }

  const prevStep = () => setCurrentStep((prev) => prev - 1)

  const onSubmit = async (data: FormData) => {
    // Récupérer toutes les photos organisées
    const allPhotos = photoCategories.flatMap(c => c.photos)
    
    if (allPhotos.length < 3) {
      alert("Veuillez ajouter au moins 3 photos pour votre annonce")
      return
    }

    // Validation et préparation des données pour l'API
    const formData = new FormData()

    // 1. Mapping des champs obligatoires pour le backend (DTO)
    // Le backend attend: area, rooms, description, transactionType, propertyType, city, address, price
    
    // Calcul du prix final en fonction de l'unité
    let finalPrice = Number(data.price?.replace(/\s/g, '') || 0);
    if (data.priceUnit === 'MILLION') {
        finalPrice *= 1000000;
    } else if (data.priceUnit === 'MILLIARD') {
        finalPrice *= 1000000000;
    }
    
    // Si c'est une Villa, on mappe les champs spécifiques vers les champs génériques
    if (data.propertyType === 'VILLA') {
        if (!data.area && data.habitableArea) formData.append('area', data.habitableArea)
        else if (!data.area && data.builtArea) formData.append('area', data.builtArea)
        else if (data.area) formData.append('area', data.area)
        else formData.append('area', '0') // Valeur par défaut pour éviter 400

        if (!data.rooms && data.bedrooms) formData.append('rooms', data.bedrooms)
        else if (data.rooms) formData.append('rooms', data.rooms)
        else formData.append('rooms', '0')

        if (!data.description && data.additionalDescription) formData.append('description', data.additionalDescription)
        else if (data.description) formData.append('description', data.description)
        else formData.append('description', 'Pas de description fournie')
    }

    // Ajouter toutes les autres données du formulaire
    Object.entries(data).forEach(([key, value]) => {
      // On traite le prix manuellement
      if (key === 'price') return;
      
      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value))
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value))
      }
    })
    
    // Ajouter le prix calculé
    formData.append('price', String(finalPrice));
    
    // 2. Gestion des images (Le backend attend 'images')
    const finalPhotos = photoCategories.flatMap(c => c.photos)
    finalPhotos.forEach(photo => {
        formData.append('images', photo)
    })

    // 2b. Métadonnées des images (Catégories)
    const imagesMetadata = photoCategories.flatMap(c => 
        c.photos.map(p => ({
            filename: p.name,
            category: c.id
        }))
    );
    formData.append('imagesMetadata', JSON.stringify(imagesMetadata));
    
    // Debug
    console.log("Submitting form data:")
    for (const [key, val] of Array.from(formData.entries())) {
        console.log(`${key}: ${val}`)
    }

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/announces`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        setIsSuccess(true)
      } else {
        const errorData = await response.json()
        console.error("Erreur création annonce:", errorData)
        alert(`Erreur lors de la création de l'annonce: ${errorData.message || response.statusText}`)
      }
    } catch (error) {
      console.error("Erreur réseau:", error)
      alert("Erreur réseau lors de la soumission du formulaire")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full animate-fade-in-up">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Annonce créée !</h2>
          <p className="text-gray-600 mb-8">
            Votre annonce a été soumise avec succès. Elle sera visible après validation par notre équipe.
          </p>
          <Button className="w-full py-6 text-lg bg-[#00BFA6] hover:bg-[#00908A]" onClick={() => window.location.href = '/'}>
            Retour à l&apos;accueil
          </Button>
        </div>
      </div>
    )
  }

  const filteredCategories = getFilteredCategories()
  const filteredPropertyTypes = getFilteredPropertyTypes()

  const getStepTitle = () => {
    switch(currentStep) {
      case 1: return "Choisissez votre type de transaction"
      case 2: return "Type d'immobilier"
      case 3: return "Décrivez-nous votre bien"
      case 4: return propertyType === "VILLA" ? "Fiche descriptive - Villa" : "Fiche descriptive"
      case 5: return "Localisation & Prix"
      case 6: return "Photos du bien"
      default: return ""
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-[#00908A] h-[200px] w-full absolute top-0 left-0 z-0"></div>

        <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-4">
            
            {/* Progress Stepper */}
            <div className="bg-white rounded-full px-8 py-4 shadow-lg mb-8">
                <div className="flex items-center gap-4">
                    {steps.map((step) => (
                        <div 
                            key={step.id} 
                            className={cn("flex items-center cursor-pointer hover:opacity-80 transition-opacity", step.id > currentStep && "cursor-not-allowed opacity-50")}
                            onClick={() => goToStep(step.id)}
                        >
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all",
                                currentStep > step.id ? "bg-[#00BFA6] border-[#00BFA6] text-white" : 
                                currentStep === step.id ? "border-[#00BFA6] text-[#00BFA6]" : "border-gray-200 text-gray-300"
                            )}>
                                {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
                            </div>
                            {step.id < steps.length && (
                                <div className={cn("w-8 h-0.5 mx-2", currentStep > step.id ? "bg-[#00BFA6]" : "bg-gray-200")}></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden min-h-[500px] flex flex-col">
                <div className="p-8 border-b border-gray-100 flex items-center">
                    {currentStep > 1 && (
                        <button 
                            onClick={prevStep}
                            className="flex items-center gap-2 text-gray-500 hover:text-[#00BFA6] transition-colors font-medium mr-4"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            Retour
                        </button>
                    )}
                    <h1 className="text-2xl font-bold text-gray-800">{getStepTitle()}</h1>
                </div>

                <div className="p-12 flex-1 flex flex-col items-center justify-center text-left">
                    
                    {/* Step 1: Transaction Type */}
                    {currentStep === 1 && (
                        <div className="w-full max-w-2xl animate-fade-in">
                            <div className="grid grid-cols-2 gap-8">
                                <div 
                                    onClick={() => handleTransactionTypeClick("RENTAL")}
                                    className={cn(
                                        "cursor-pointer border-2 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 transition-all hover:shadow-lg",
                                        transactionType === "RENTAL" ? "border-[#00BFA6] bg-green-50/30" : "border-gray-200 hover:border-gray-300"
                                    )}
                                >
                                    <Home className={cn("h-16 w-16", transactionType === "RENTAL" ? "text-[#00BFA6]" : "text-gray-400")} />
                                    <span className={cn("text-xl font-medium", transactionType === "RENTAL" ? "text-[#00BFA6]" : "text-gray-500")}>Location</span>
                                </div>
                                <div 
                                    onClick={() => handleTransactionTypeClick("SALE")}
                                    className={cn(
                                        "cursor-pointer border-2 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 transition-all hover:shadow-lg",
                                        transactionType === "SALE" ? "border-[#00BFA6] bg-green-50/30" : "border-gray-200 hover:border-gray-300"
                                    )}
                                >
                                    <Key className={cn("h-16 w-16", transactionType === "SALE" ? "text-[#00BFA6]" : "text-gray-400")} />
                                    <span className={cn("text-xl font-medium", transactionType === "SALE" ? "text-[#00BFA6]" : "text-gray-500")}>Vente</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Real Estate Type */}
                    {currentStep === 2 && (
                        <div className="w-full max-w-4xl animate-fade-in">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                                {filteredCategories.map((cat) => {
                                    const Icon = IconMap[cat.iconName] || Home
                                    return (
                                        <div 
                                            key={cat.id}
                                            onClick={() => handleCategoryClick(cat.id)}
                                            className={cn(
                                                "cursor-pointer border-2 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 transition-all hover:shadow-lg h-48 text-center",
                                                realEstateType === cat.id ? "border-[#00BFA6] bg-green-50/30" : "border-gray-200 hover:border-gray-300"
                                            )}
                                        >
                                            <Icon className={cn("h-12 w-12", realEstateType === cat.id ? "text-[#00BFA6]" : "text-gray-400")} />
                                            <span className={cn("text-lg font-medium", realEstateType === cat.id ? "text-[#00BFA6]" : "text-gray-500")}>{cat.label}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Property Type */}
                    {currentStep === 3 && (
                        <div className="w-full max-w-4xl animate-fade-in">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {filteredPropertyTypes.map((type) => {
                                    const Icon = IconMap[type.iconName] || Home
                                    return (
                                        <div 
                                            key={type.id}
                                            onClick={() => handlePropertyTypeClick(type.id)}
                                            className={cn(
                                                "cursor-pointer border rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-all hover:shadow-md h-40 text-center",
                                                propertyType === type.id ? "border-[#00BFA6] bg-green-50/30 shadow-md" : "border-gray-200 hover:border-gray-300"
                                            )}
                                        >
                                            <Icon className={cn("h-8 w-8", propertyType === type.id ? "text-[#00BFA6]" : "text-gray-400")} />
                                            <span className={cn("text-sm font-medium", propertyType === type.id ? "text-[#00BFA6]" : "text-gray-500")}>{type.label}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Step 4: Fiche descriptive - Villa (Location) */}
                    {currentStep === 4 && propertyType === "VILLA" && transactionType === "RENTAL" && (
                        <div className="w-full max-w-4xl animate-fade-in space-y-10">
                            
                            {/* 1. Caractéristiques Générales & Structure */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Building2 className="text-[#00BFA6]" /> Caractéristiques Générales & Structure
                                </h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Typologie */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">Typologie <span className="text-red-500">*</span></label>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-900 text-2xl">F</span>
                                            <input 
                                                type="number" 
                                                min="1" max="10"
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setValue("typology", `F${val}`);
                                                    setValue("typologyCustom", val);
                                                }}
                                                className="w-full p-3 border-2 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-lg" 
                                                placeholder="Ex: 4"
                                            />
                                        </div>
                                        {errors.typology && <p className="text-red-500 text-sm mt-1">{errors.typology.message}</p>}
                                    </div>

                                    {/* Configuration R+ */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">Configuration (Nombre d&apos;étages) <span className="text-red-500">*</span></label>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-900 text-2xl">R +</span>
                                            <input 
                                                {...register("floorCount")} 
                                                type="number" 
                                                min="0" max="10"
                                                className="w-full p-3 border-2 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-lg" 
                                                placeholder="Ex: 2"
                                            />
                                        </div>
                                        {errors.floorCount && <p className="text-red-500 text-sm mt-1">{errors.floorCount.message}</p>}
                                    </div>

                                    {/* Surfaces */}
                                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-2">Surface Totale du Terrain (m²) <span className="text-red-500">*</span></label>
                                            <input {...register("landArea")} type="number" className="w-full p-3 border-2 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900" placeholder="Ex: 400" />
                                            {errors.landArea && <p className="text-red-500 text-sm mt-1">{errors.landArea.message}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-2">Surface Bâtie (m²) <span className="text-red-500">*</span></label>
                                            <input {...register("builtArea")} type="number" className="w-full p-3 border-2 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900" placeholder="Ex: 250" />
                                            {errors.builtArea && <p className="text-red-500 text-sm mt-1">{errors.builtArea.message}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-2">Surface Habitable Totale (m²)</label>
                                            <input {...register("habitableArea")} type="number" className="w-full p-3 border-2 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900" placeholder="Ex: 200" />
                                            {errors.habitableArea && <p className="text-red-500 text-sm mt-1">{errors.habitableArea.message}</p>}
                                        </div>
                                    </div>

                                    {/* État Général */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">État Général</label>
                                        <select {...register("state")} className="w-full p-3 border-2 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900">
                                            <option value="">Sélectionner</option>
                                            {PROPERTY_STATES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                        </select>
                                        {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>}
                                    </div>

                                    {/* Stationnement */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">Garage & Stationnement</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <input {...register("parkingCount")} type="number" className="w-full p-3 border-2 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900" placeholder="Garage (places)" />
                                            <input {...register("outdoorParking")} type="number" className="w-full p-3 border-2 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900" placeholder="Extérieur (places)" />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 2. Mode de vie */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Users className="text-[#00BFA6]" /> Mode de vie
                                </h2>
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-3">Usage Autorisé <span className="text-red-500">*</span></label>
                                    <div className="flex flex-wrap gap-4">
                                        {USAGE_TYPES.map((u) => (
                                            <label key={u.id} className="cursor-pointer">
                                                <input type="radio" value={u.id} {...register("usageType")} className="peer sr-only" />
                                                <div className="px-6 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-900 peer-checked:border-[#00BFA6] peer-checked:bg-[#00BFA6]/10 peer-checked:text-[#00BFA6] transition-all bg-white shadow-sm hover:border-gray-400">
                                                    {u.label}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.usageType && <p className="text-red-500 text-sm mt-1">{errors.usageType.message}</p>}
                                </div>
                            </section>

                            {/* 3. Espaces de Vie */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <BedDouble className="text-[#00BFA6]" /> Espaces de Vie
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">Chambres <span className="text-red-500">*</span></label>
                                        <input {...register("bedrooms")} type="number" className="w-full p-3 border-2 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900" />
                                        {errors.bedrooms && <p className="text-red-500 text-sm mt-1">{errors.bedrooms.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">Dont Suites</label>
                                        <input {...register("nbSuites")} type="number" className="w-full p-3 border-2 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">Salons <span className="text-red-500">*</span></label>
                                        <input {...register("livingRooms")} type="number" className="w-full p-3 border-2 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900" />
                                        {errors.livingRooms && <p className="text-red-500 text-sm mt-1">{errors.livingRooms.message}</p>}
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">Salles de bain <span className="text-red-500">*</span></label>
                                        <input {...register("bathrooms")} type="number" className="w-full p-3 border-2 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900" />
                                        {errors.bathrooms && <p className="text-red-500 text-sm mt-1">{errors.bathrooms.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">Toilettes (WC) <span className="text-red-500">*</span></label>
                                        <input {...register("wc")} type="number" className="w-full p-3 border-2 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900" />
                                        {errors.wc && <p className="text-red-500 text-sm mt-1">{errors.wc.message}</p>}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-3">Type de Salle de Bain</label>
                                    <div className="flex gap-4 flex-wrap">
                                        <label className="flex items-center gap-2 cursor-pointer bg-white p-2 border-2 border-gray-200 rounded-lg hover:border-[#00BFA6]">
                                            <input type="radio" value="shower" {...register("bathroomType")} className="accent-[#00BFA6] w-5 h-5" /> 
                                            <span className="font-medium text-gray-900">Douche Italienne</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer bg-white p-2 border-2 border-gray-200 rounded-lg hover:border-[#00BFA6]">
                                            <input type="radio" value="bathtub" {...register("bathroomType")} className="accent-[#00BFA6] w-5 h-5" /> 
                                            <span className="font-medium text-gray-900">Baignoire</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer bg-white p-2 border-2 border-gray-200 rounded-lg hover:border-[#00BFA6]">
                                            <input type="radio" value="both" {...register("bathroomType")} className="accent-[#00BFA6] w-5 h-5" /> 
                                            <span className="font-medium text-gray-900">Les deux</span>
                                        </label>
                                    </div>
                                </div>
                            </section>

                            {/* 4. Cuisine et équipements */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Utensils className="text-[#00BFA6]" /> Cuisine et équipements
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-3">Type de Cuisine</label>
                                        <div className="flex flex-col gap-3">
                                            {KITCHEN_TYPES.map(k => (
                                                <label key={k.id} className="flex items-center gap-3 cursor-pointer p-3 border-2 rounded-xl hover:bg-gray-50 transition-colors bg-white">
                                                    <input type="radio" value={k.id} {...register("kitchenType")} className="accent-[#00BFA6] w-5 h-5" />
                                                    <span className="font-bold text-gray-900">{k.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-3">État de la Cuisine</label>
                                        <div className="flex flex-col gap-3">
                                            {KITCHEN_STATES.map(k => (
                                                <label key={k.id} className="flex items-center gap-3 cursor-pointer p-3 border-2 rounded-xl hover:bg-gray-50 transition-colors bg-white">
                                                    <input type="radio" value={k.id} {...register("kitchenState")} className="accent-[#00BFA6] w-5 h-5" />
                                                    <span className="font-bold text-gray-900">{k.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 5. Extérieurs & Commodités */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Trees className="text-[#00BFA6]" /> Extérieurs & Commodités
                                </h2>
                                
                                {/* Extérieur Checkboxes */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-3">Espaces Extérieurs</label>
                                    <div className="flex flex-wrap gap-4">
                                        {VILLA_EQUIPMENTS.exterior.map((item) => (
                                            <label key={item.id} className="cursor-pointer">
                                                <input type="checkbox" value={item.id} {...register("exteriorFeatures")} className="peer sr-only" />
                                                <div className="px-4 py-2 border-2 rounded-lg text-sm font-bold text-gray-900 peer-checked:bg-[#00BFA6] peer-checked:text-white transition-all bg-white hover:border-[#00BFA6]">
                                                    {item.label}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Commodités Techniques (Heating, AC) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-3">Chauffage</label>
                                        <div className="flex flex-col gap-2">
                                            {HEATING_TYPES.map(h => (
                                                <label key={h.id} className="flex items-center gap-3 cursor-pointer bg-white p-2 rounded-lg border-2 border-transparent hover:border-gray-200">
                                                    <input type="radio" value={h.id} {...register("heatingType")} className="accent-[#00BFA6] w-5 h-5" /> 
                                                    <span className="font-medium text-gray-900">{h.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-3">Climatisation</label>
                                        <div className="flex flex-col gap-2">
                                            {AC_TYPES.map(a => (
                                                <label key={a.id} className="flex items-center gap-3 cursor-pointer bg-white p-2 rounded-lg border-2 border-transparent hover:border-gray-200">
                                                    <input type="radio" value={a.id} {...register("acType")} className="accent-[#00BFA6] w-5 h-5" /> 
                                                    <span className="font-medium text-gray-900">{a.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Sécurité & Connectivité */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-3">Sécurité</label>
                                        <div className="flex flex-col gap-2">
                                            {VILLA_EQUIPMENTS.security.map(s => (
                                                <label key={s.id} className="flex items-center gap-3 cursor-pointer bg-white p-2 rounded-lg border-2 border-transparent hover:border-gray-200">
                                                    <input type="checkbox" value={s.id} {...register("securityFeatures")} className="accent-[#00BFA6] w-5 h-5" /> 
                                                    <span className="font-medium text-gray-900">{s.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-3">Connectivité</label>
                                        <div className="flex flex-col gap-2">
                                            {VILLA_EQUIPMENTS.connectivity.map(c => (
                                                <label key={c.id} className="flex items-center gap-3 cursor-pointer bg-white p-2 rounded-lg border-2 border-transparent hover:border-gray-200">
                                                    <input type="checkbox" value={c.id} {...register("connectivity")} className="accent-[#00BFA6] w-5 h-5" /> 
                                                    <span className="font-medium text-gray-900">{c.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 6. Énergie, Eau & Technique */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Zap className="text-[#00BFA6]" /> Énergie, Eau & Technique
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Eau */}
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <h4 className="font-bold mb-3 flex items-center gap-2 text-gray-900"><Droplet className="w-4 h-4 text-blue-500"/> Eau</h4>
                                        <div className="flex flex-col gap-2">
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900"><input type="radio" value="INDIVIDUEL" {...register("waterCounter")} className="accent-[#00BFA6] w-4 h-4"/> Compteur Individuel</label>
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900"><input type="radio" value="COMMUN" {...register("waterCounter")} className="accent-[#00BFA6] w-4 h-4"/> Compteur Commun</label>
                                        </div>
                                    </div>
                                    {/* Électricité */}
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <h4 className="font-bold mb-3 flex items-center gap-2 text-gray-900"><Zap className="w-4 h-4 text-yellow-500"/> Électricité</h4>
                                        <div className="flex flex-col gap-2">
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900"><input type="radio" value="INDIVIDUEL" {...register("elecCounter")} className="accent-[#00BFA6] w-4 h-4"/> Compteur Individuel</label>
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900"><input type="radio" value="COMMUN" {...register("elecCounter")} className="accent-[#00BFA6] w-4 h-4"/> Compteur Commun</label>
                                        </div>
                                    </div>
                                    {/* Gaz */}
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <h4 className="font-bold mb-3 flex items-center gap-2 text-gray-900"><Flame className="w-4 h-4 text-orange-500"/> Gaz</h4>
                                        <div className="flex flex-col gap-2">
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900"><input type="radio" value="INDIVIDUEL" {...register("gasCounter")} className="accent-[#00BFA6] w-4 h-4"/> Compteur Individuel</label>
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900"><input type="radio" value="COMMUN" {...register("gasCounter")} className="accent-[#00BFA6] w-4 h-4"/> Compteur Commun</label>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 7. Conditions de Location */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <FileText className="text-[#00BFA6]" /> Conditions de Location
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">Caution (Mois)</label>
                                        <input {...register("depositMonths")} type="number" className="w-full p-3 border-2 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900" placeholder="Ex: 1" />
                                        {errors.depositMonths && <p className="text-red-500 text-sm mt-1">{errors.depositMonths.message}</p>}
                                    </div>
                                    
                                    {/* Disponibilité */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">Disponibilité</label>
                                        <div className="flex flex-col gap-3">
                                            <div className="flex gap-4">
                                                <label className="flex items-center gap-2 cursor-pointer bg-white border-2 border-gray-200 p-2 rounded-lg hover:border-[#00BFA6] transition-colors flex-1 justify-center">
                                                    <input type="radio" name="availabilityMode" value="IMMEDIATE" checked={availabilityMode === 'IMMEDIATE'} onChange={() => setAvailabilityMode('IMMEDIATE')} className="accent-[#00BFA6] w-4 h-4" />
                                                    <span className="text-gray-900 font-medium text-sm">Immédiate</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer bg-white border-2 border-gray-200 p-2 rounded-lg hover:border-[#00BFA6] transition-colors flex-1 justify-center">
                                                    <input type="radio" name="availabilityMode" value="DATE" checked={availabilityMode === 'DATE'} onChange={() => setAvailabilityMode('DATE')} className="accent-[#00BFA6] w-4 h-4" />
                                                    <span className="text-gray-900 font-medium text-sm">À partir d&apos;une date</span>
                                                </label>
                                            </div>
                                            {availabilityMode === 'DATE' && (
                                                <input {...register("availableDate")} type="date" className="w-full p-3 border-2 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900" />
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">Usage Autorisé</label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" value="HABITATION" {...register("rentalUsage")} className="accent-[#00BFA6]" /> 
                                                <span className="font-bold text-gray-900">Habitation</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" value="PROFESSIONNEL" {...register("rentalUsage")} className="accent-[#00BFA6]" /> 
                                                <span className="font-bold text-gray-900">Professionnel / Bureau</span>
                                            </label>
                                        </div>
                                        {errors.rentalUsage && <p className="text-red-500 text-sm mt-1">{errors.rentalUsage.message}</p>}
                                    </div>
                                    <div className="flex items-center">
                                        <label className="flex items-center gap-3 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 w-full transition-colors bg-white">
                                            <input type="checkbox" {...register("chargesIncluded")} className="accent-[#00BFA6] w-5 h-5" />
                                            <span className="font-bold text-gray-900">Charges Comprises dans le Loyer</span>
                                        </label>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* Step 4: Fiche descriptive - Autres (Ancien formulaire) */}
                    {currentStep === 4 && !(propertyType === "VILLA" && transactionType === "RENTAL") && (
                        <div className="w-full max-w-3xl animate-fade-in">
                            <div className="space-y-8">
                                {/* Nombre d'étages - Limité à R+5 */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">Nombre d&apos;étages R+</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {[0,1,2,3,4,5].map((num) => (
                                            <label key={num} className="cursor-pointer">
                                                <input 
                                                    type="radio" 
                                                    value={num} 
                                                    {...register("floorCount")} 
                                                    className="peer sr-only" 
                                                />
                                                <div className="w-12 h-12 border-2 rounded-xl flex items-center justify-center font-medium text-gray-600 peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 peer-checked:text-[#00BFA6] transition-all hover:border-gray-400 bg-gray-50">
                                                    R+{num}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.floorCount && <p className="text-red-500 text-sm mt-1">{errors.floorCount.message}</p>}
                                </div>

                                {/* Niveaux supplémentaires */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">Niveaux supplémentaires</label>
                                    <div className="flex gap-4 flex-wrap">
                                        {EXTRA_FLOOR_TYPES.map((floor) => (
                                            <label key={floor.id} className="cursor-pointer">
                                                <input 
                                                    type="radio" 
                                                    value={floor.id} 
                                                    {...register("extraFloor")} 
                                                    className="peer sr-only" 
                                                />
                                                <div className="px-6 py-3 border-2 rounded-xl font-medium text-gray-600 peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 peer-checked:text-[#00BFA6] transition-all hover:border-gray-400 bg-gray-50">
                                                    {floor.label}
                                                </div>
                                            </label>
                                        ))}
                                        <label className="cursor-pointer">
                                            <input 
                                                type="radio" 
                                                value="none" 
                                                {...register("extraFloor")} 
                                                className="peer sr-only" 
                                            />
                                            <div className="px-6 py-3 border-2 rounded-xl font-medium text-gray-600 peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 peer-checked:text-[#00BFA6] transition-all hover:border-gray-400 bg-gray-50">
                                                Aucun
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Typologie - Sans chiffres prédéfinis */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">Typologie</label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {TYPOLOGIES.map((t) => (
                                            <label key={t.id} className="cursor-pointer">
                                                <input 
                                                    type="radio" 
                                                    value={t.id} 
                                                    {...register("typology")} 
                                                    className="peer sr-only" 
                                                />
                                                <div className="p-4 border-2 rounded-xl text-center peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 peer-checked:text-[#00BFA6] transition-all hover:border-gray-400 bg-gray-50">
                                                    <div className="font-bold text-lg text-gray-700 peer-checked:text-[#00BFA6]">{t.label}</div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.typology && <p className="text-red-500 text-sm mt-1">{errors.typology.message}</p>}
                                </div>

                                {/* Pièces */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Nombre de chambres</label>
                                        <input 
                                            {...register("bedrooms")} 
                                            type="number" 
                                            min="1"
                                            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all text-gray-900 bg-gray-50 focus:bg-white" 
                                            placeholder="Ex: 3"
                                        />
                                        {errors.bedrooms && <p className="text-red-500 text-sm mt-1">{errors.bedrooms.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Nombre de salons</label>
                                        <input 
                                            {...register("livingRooms")} 
                                            type="number" 
                                            min="1"
                                            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all text-gray-900 bg-gray-50 focus:bg-white" 
                                            placeholder="Ex: 2"
                                        />
                                        {errors.livingRooms && <p className="text-red-500 text-sm mt-1">{errors.livingRooms.message}</p>}
                                    </div>
                                </div>

                                {/* Salles de bain et WC */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Nombre de salles de bain</label>
                                        <input 
                                            {...register("bathrooms")} 
                                            type="number" 
                                            min="0"
                                            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all text-gray-900 bg-gray-50 focus:bg-white" 
                                            placeholder="Ex: 2"
                                        />
                                        {errors.bathrooms && <p className="text-red-500 text-sm mt-1">{errors.bathrooms.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Nombre de WC</label>
                                        <input 
                                            {...register("wc")} 
                                            type="number" 
                                            min="0"
                                            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all text-gray-900 bg-gray-50 focus:bg-white" 
                                            placeholder="Ex: 3"
                                        />
                                        {errors.wc && <p className="text-red-500 text-sm mt-1">{errors.wc.message}</p>}
                                    </div>
                                </div>

                                {/* Type de salle de bain */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">Type de salle de bain principale</label>
                                    <div className="grid grid-cols-4 gap-4">
                                        {BATHROOM_TYPES.map((type) => {
                                            const Icon = IconMap[type.icon] || Bath
                                            return (
                                                <label key={type.id} className="cursor-pointer">
                                                    <input 
                                                        type="radio" 
                                                        value={type.id} 
                                                        {...register("bathroomType")} 
                                                        className="peer sr-only" 
                                                    />
                                                    <div className="p-4 border-2 rounded-xl flex flex-col items-center justify-center gap-2 peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 peer-checked:text-[#00BFA6] transition-all hover:border-gray-400 bg-gray-50">
                                                        <Icon className="h-6 w-6 text-gray-500 peer-checked:text-[#00BFA6]" />
                                                        <span className="text-sm font-medium text-gray-600 peer-checked:text-[#00BFA6]">{type.label}</span>
                                                    </div>
                                                </label>
                                            )
                                        })}
                                        <label className="cursor-pointer">
                                            <input 
                                                type="radio" 
                                                value="both" 
                                                {...register("bathroomType")} 
                                                className="peer sr-only" 
                                            />
                                            <div className="p-4 border-2 rounded-xl flex flex-col items-center justify-center gap-2 peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 peer-checked:text-[#00BFA6] transition-all hover:border-gray-400 bg-gray-50">
                                                <span className="text-sm font-medium text-gray-600 peer-checked:text-[#00BFA6]">Les deux</span>
                                            </div>
                                        </label>
                                        <label className="cursor-pointer">
                                            <input 
                                                type="radio" 
                                                value="none" 
                                                {...register("bathroomType")} 
                                                className="peer sr-only" 
                                            />
                                            <div className="p-4 border-2 rounded-xl flex flex-col items-center justify-center gap-2 peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 peer-checked:text-[#00BFA6] transition-all hover:border-gray-400 bg-gray-50">
                                                <span className="text-sm font-medium text-gray-600 peer-checked:text-[#00BFA6]">Non spécifié</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Mesures & Capacité */}
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Mesures & Capacité</h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Surface Terrain (m²)</label>
                                            <input 
                                                {...register("landArea")} 
                                                type="number" 
                                                min="1"
                                                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all text-gray-900 bg-gray-50 focus:bg-white" 
                                                placeholder="Ex: 500"
                                            />
                                            {errors.landArea && <p className="text-red-500 text-sm mt-1">{errors.landArea.message}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Surface Bâtie (m²)</label>
                                            <input 
                                                {...register("builtArea")} 
                                                type="number" 
                                                min="1"
                                                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all text-gray-900 bg-gray-50 focus:bg-white" 
                                                placeholder="Ex: 250"
                                            />
                                            {errors.builtArea && <p className="text-red-500 text-sm mt-1">{errors.builtArea.message}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Équipements & Commodités avec icônes */}
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Équipements & Commodités</h3>
                                    
                                    {/* Cuisine */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-bold text-gray-700 mb-3">Cuisine</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            {VILLA_EQUIPMENTS.kitchen.map((item) => {
                                                const Icon = IconMap[item.icon] || Utensils
                                                return (
                                                    <label key={item.id} className="cursor-pointer">
                                                        <input 
                                                            type="checkbox" 
                                                            value={item.id} 
                                                            {...register("kitchenEquipment")} 
                                                            className="peer sr-only" 
                                                        />
                                                        <div className="p-4 border-2 rounded-xl flex items-center gap-3 peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 peer-checked:text-[#00BFA6] transition-all hover:border-gray-400 bg-gray-50">
                                                            <Icon className="h-5 w-5 text-gray-500 peer-checked:text-[#00BFA6]" />
                                                            <span className="text-sm font-medium text-gray-600 peer-checked:text-[#00BFA6]">{item.label}</span>
                                                        </div>
                                                    </label>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Extérieur */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-bold text-gray-700 mb-3">Extérieur</label>
                                        <div className="grid grid-cols-3 gap-4">
                                            {VILLA_EQUIPMENTS.exterior.map((item) => {
                                                const Icon = IconMap[item.icon] || Trees
                                                return (
                                                    <label key={item.id} className="cursor-pointer">
                                                        <input 
                                                            type="checkbox" 
                                                            value={item.id} 
                                                            {...register("exteriorFeatures")} 
                                                            className="peer sr-only" 
                                                        />
                                                        <div className="p-4 border-2 rounded-xl flex flex-col items-center gap-2 text-center peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 peer-checked:text-[#00BFA6] transition-all hover:border-gray-400 bg-gray-50">
                                                            <Icon className="h-6 w-6 text-gray-500 peer-checked:text-[#00BFA6]" />
                                                            <span className="text-sm font-medium text-gray-600 peer-checked:text-[#00BFA6]">{item.label}</span>
                                                        </div>
                                                    </label>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Eau/Énergie */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-bold text-gray-700 mb-3">Eau/Énergie</label>
                                        <div className="grid grid-cols-3 gap-4">
                                            {VILLA_EQUIPMENTS.utilities.map((item) => {
                                                const Icon = IconMap[item.icon] || Droplet
                                                return (
                                                    <label key={item.id} className="cursor-pointer">
                                                        <input 
                                                            type="checkbox" 
                                                            value={item.id} 
                                                            {...register("utilities")} 
                                                            className="peer sr-only" 
                                                        />
                                                        <div className="p-4 border-2 rounded-xl flex flex-col items-center gap-2 text-center peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 peer-checked:text-[#00BFA6] transition-all hover:border-gray-400 bg-gray-50">
                                                            <Icon className="h-6 w-6 text-gray-500 peer-checked:text-[#00BFA6]" />
                                                            <span className="text-sm font-medium text-gray-600 peer-checked:text-[#00BFA6]">{item.label}</span>
                                                        </div>
                                                    </label>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Stationnement */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-bold text-gray-700 mb-3">Garage</label>
                                        <div className="space-y-4">
                                            <label className="flex items-center gap-4 cursor-pointer p-4 border-2 rounded-xl hover:border-gray-400 bg-gray-50 peer-checked:border-[#00BFA6]">
                                                <input 
                                                    type="checkbox" 
                                                    {...register("garageCapacity")} 
                                                    onChange={(e) => {
                                                        if (!e.target.checked) {
                                                            setValue("garageCapacity", "")
                                                        }
                                                    }}
                                                    className="w-5 h-5 text-[#00BFA6] rounded border-gray-300 focus:ring-[#00BFA6]" 
                                                />
                                                <span className="text-gray-700 font-medium">Présence d&apos;un garage</span>
                                            </label>
                                            
                                            {garageHasCapacity && (
                                                <div className="ml-8">
                                                    <label className="block text-sm font-medium text-gray-600 mb-2">Capacité (Volume)</label>
                                                    <input 
                                                        {...register("garageCapacity")} 
                                                        type="number" 
                                                        min="1"
                                                        placeholder="Nombre de véhicules"
                                                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all bg-gray-50 focus:bg-white" 
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Description Complémentaire */}
                                <div className="border-t pt-6">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Description Complémentaire</label>
                                    <textarea 
                                        {...register("additionalDescription")} 
                                        rows={4}
                                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all text-gray-900 placeholder:text-gray-400 bg-gray-50 focus:bg-white"
                                        placeholder="Ensoleillement, voisinage, sécurité, état des finitions..."
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Localisation & Prix */}
                    {currentStep === 5 && (
                        <div className="w-full max-w-xl animate-fade-in">
                            <div className="space-y-6">
                                {/* Localisation */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Localisation</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Wilaya</label>
                                            <select {...register("city")} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all text-gray-900 bg-white">
                                                <option value="">Sélectionner...</option>
                                                {WILAYAS.map((wilaya) => (
                                                    <option key={wilaya.id} value={wilaya.name}>{wilaya.code} - {wilaya.name}</option>
                                                ))}
                                            </select>
                                            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Commune</label>
                                            <select {...register("commune")} disabled={!selectedCity} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all text-gray-900 bg-white disabled:bg-gray-100">
                                                <option value="">Sélectionner...</option>
                                                {filteredCommunes.map((commune) => (
                                                    <option key={commune.id} value={commune.name}>{commune.name}</option>
                                                ))}
                                            </select>
                                            {errors.commune && <p className="text-red-500 text-sm mt-1">{errors.commune.message}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Adresse complète</label>
                                            <input 
                                                {...register("address")} 
                                                type="text" 
                                                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all text-gray-900" 
                                                placeholder="N° de rue, nom de la rue, quartier..." 
                                            />
                                            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Prix */}
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Prix</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Unité de prix</label>
                                            <div className="flex gap-4">
                                                {[
                                                    { value: "DA", label: "Dinars" },
                                                    { value: "MILLION", label: "Millions" },
                                                    { value: "MILLIARD", label: "Milliards" },
                                                ].map((unit) => (
                                                    <label key={unit.value} className="cursor-pointer flex-1">
                                                        <input 
                                                            type="radio" 
                                                            value={unit.value} 
                                                            {...register("priceUnit")} 
                                                            className="peer sr-only" 
                                                        />
                                                        <div className="p-3 border-2 rounded-xl text-center font-medium text-gray-600 peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 peer-checked:text-[#00BFA6] transition-all hover:border-gray-400 bg-gray-50">
                                                            {unit.label}
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Montant</label>
                                            <div className="relative">
                                                <input 
                                                    type="text" 
                                                    onChange={(e) => {
                                                        const rawValue = e.target.value.replace(/\s/g, '');
                                                        if (!/^\d*$/.test(rawValue)) return;
                                                        
                                                        const formatted = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                                                        e.target.value = formatted;
                                                        setValue("price", rawValue);
                                                    }}
                                                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all text-gray-900 bg-gray-50 focus:bg-white text-lg font-bold" 
                                                    placeholder="Saisissez le prix" 
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">
                                                    {watch("priceUnit") === "DA" ? "DA" : watch("priceUnit") === "MILLION" ? "Millions" : "Milliards"}
                                                </span>
                                            </div>
                                            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 6: Photos du bien */}
                    {currentStep === 6 && (
                        <div className="w-full max-w-3xl animate-fade-in">
                            {photoOrganizationStep === "upload" ? (
                                /* Étape 1: Upload brut */
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-4">Téléchargez vos photos</label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:bg-gray-50 transition-colors cursor-pointer relative bg-gray-50">
                                            <input 
                                                type="file" 
                                                multiple 
                                                accept="image/*" 
                                                onChange={onFileChange} 
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                            />
                                            <Upload className="h-12 w-12 text-[#00BFA6] mx-auto mb-4" />
                                            <p className="text-lg text-gray-600 mb-2">
                                                {selectedFiles.length > 0 
                                                    ? `${selectedFiles.length} photo(s) sélectionnée(s)` 
                                                    : "Cliquez ou glissez vos photos ici"}
                                            </p>
                                            <p className="text-sm text-gray-400">
                                                Formats acceptés : JPG, PNG (max 10MB par photo)
                                            </p>
                                        </div>
                                    </div>

                                    {selectedFiles.length > 0 && (
                                        <>
                                            <div className="grid grid-cols-4 gap-4">
                                                {selectedFiles.map((file, idx) => (
                                                    <div key={idx} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group border-2 border-gray-200">
                                                        <img 
                                                            src={URL.createObjectURL(file)} 
                                                            alt={`preview-${idx}`} 
                                                            className="w-full h-full object-cover" 
                                                        />
                                                        <button 
                                                            onClick={() => removeFile(idx)}
                                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                            type="button"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            <Button 
                                                onClick={proceedToPhotoOrganization}
                                                className="w-full bg-[#00BFA6] hover:bg-[#00908A] text-white rounded-xl py-4 text-lg font-bold"
                                            >
                                                Organiser les photos
                                            </Button>
                                        </>
                                    )}
                                </div>
                            ) : (
                                /* Étape 2: Organisation par catégorie */
                                <div className="space-y-8">
                                    <p className="text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                        Organisez vos photos par catégorie. Vous pouvez glisser-déposer pour les réorganiser.
                                    </p>

                                    {photoCategories.map((category) => (
                                        <div key={category.id} className="border rounded-xl p-6 bg-gray-50">
                                            <div className="flex items-center gap-3 mb-4">
                                                <category.icon className="h-6 w-6 text-[#00BFA6]" />
                                                <h3 className="text-lg font-bold text-gray-700">{category.label}</h3>
                                                <span className="text-sm text-gray-500 ml-auto bg-white px-3 py-1 rounded-full border border-gray-200">
                                                    {category.photos.length} photo(s)
                                                </span>
                                            </div>

                                            <DragDropContext onDragEnd={(result) => handleDragEnd(category.id, result)}>
                                                <Droppable droppableId={category.id} direction="horizontal">
                                                    {(provided) => (
                                                        <div 
                                                            ref={provided.innerRef}
                                                            {...provided.droppableProps}
                                                            className="grid grid-cols-4 gap-4 min-h-[120px]"
                                                        >
                                                            {category.photos.map((photo, index) => (
                                                                <Draggable 
                                                                    key={`${category.id}-${index}`} 
                                                                    draggableId={`${category.id}-${index}`} 
                                                                    index={index}
                                                                >
                                                                    {(provided) => (
                                                                        <div
                                                                            ref={provided.innerRef}
                                                                            {...provided.draggableProps}
                                                                            {...provided.dragHandleProps}
                                                                            className="relative aspect-square bg-white rounded-lg overflow-hidden group cursor-move border-2 border-gray-200 hover:border-[#00BFA6] transition-all"
                                                                        >
                                                                            <img 
                                                                                src={URL.createObjectURL(photo)} 
                                                                                alt={`${category.label}-${index}`} 
                                                                                className="w-full h-full object-cover" 
                                                                            />
                                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                                <GripVertical className="h-6 w-6 text-white" />
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </Draggable>
                                                            ))}
                                                            {provided.placeholder}
                                                        </div>
                                                    )}
                                                </Droppable>
                                            </DragDropContext>

                                            {/* Menu pour déplacer vers d'autres catégories */}
                                            {category.photos.length > 0 && (
                                                <div className="mt-4 flex gap-2 flex-wrap">
                                                    {photoCategories
                                                        .filter(c => c.id !== category.id)
                                                        .map(targetCat => (
                                                            <button
                                                                key={targetCat.id}
                                                                onClick={() => movePhoto(category.photos[0], category.id, targetCat.id)}
                                                                className="text-sm px-3 py-1 bg-white border border-gray-300 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
                                                            >
                                                                Déplacer vers {targetCat.label}
                                                            </button>
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    <div className="flex justify-between pt-4">
                                        <Button 
                                            onClick={() => setPhotoOrganizationStep("upload")}
                                            variant="outline"
                                            className="px-8 py-3 border-gray-300 text-gray-600 hover:bg-gray-50"
                                        >
                                            Retour à l&apos;upload
                                        </Button>
                                        <Button 
                                            onClick={handleSubmit(onSubmit)} 
                                            disabled={isSubmitting}
                                            className="bg-[#00BFA6] hover:bg-[#00908A] text-white px-8 py-3 text-lg font-bold"
                                        >
                                            {isSubmitting ? "Publication..." : "Publier l'annonce"}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-8 border-t border-gray-100 flex justify-end items-center bg-gray-50/50">
                    {currentStep === 4 && (
                        <Button onClick={handleDescriptiveSubmit} className="bg-[#00BFA6] hover:bg-[#00908A] text-white rounded-full px-8 py-6 text-lg font-bold shadow-lg shadow-[#00BFA6]/20 transition-all">
                            Continuer
                        </Button>
                    )}
                    {currentStep === 5 && (
                        <Button onClick={handleLocationSubmit} className="bg-[#00BFA6] hover:bg-[#00908A] text-white rounded-full px-8 py-6 text-lg font-bold shadow-lg shadow-[#00BFA6]/20 transition-all">
                            Continuer
                        </Button>
                    )}
                    {currentStep === 6 && photoOrganizationStep === "upload" && selectedFiles.length >= 3 && (
                        <Button onClick={proceedToPhotoOrganization} className="bg-[#00BFA6] hover:bg-[#00908A] text-white rounded-full px-8 py-6 text-lg font-bold shadow-lg shadow-[#00BFA6]/20 transition-all">
                            Organiser les photos
                        </Button>
                    )}
                </div>
            </div>
        </div>
    </div>
  )
}
