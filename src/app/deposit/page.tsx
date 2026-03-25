"use client"

import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addDays, getDay, isBefore, startOfDay } from "date-fns"
import { fr } from "date-fns/locale"
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
  Bath as BathIcon, Bed as BedIcon, Utensils as UtensilsIcon, Flower2 as GardenIcon, Zap, FileText, Phone, RotateCw, Crop, Info,
  Thermometer, Network, Bell, Ban, Siren, Calendar as CalendarIcon, Video as VideoIcon
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { WILAYAS } from "@/data/wilayas"
import { COMMUNES } from "@/data/communes"
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

// Icon mapping
const IconMap: Record<string, React.ElementType> = {
  Home, Building, Building2, Warehouse, Hotel, Briefcase, Store, BedDouble, 
  PartyPopper, Factory, Tent, Archive, ParkingCircle, DoorOpen, Trees, Sun,
  Utensils, CookingPot, Droplet, Battery, Flame, Video, Lock, Shield, Wifi, Phone,
  LayoutGrid, Zap, Snowflake, Waves, Fan, Ban,
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
    { 
        id: "UNIQUE", 
        label: "Usage unique (Communicante)",
        description: "les étages de la villa communiquent de l’intérieur"
    },
    { 
        id: "SEPARE", 
        label: "Usage séparé (appartement)",
        description: "chaque étage est indépendant"
    }
]

const KITCHEN_TYPES = [
    { 
        id: "AMERICAINE", 
        label: "Ouverte",
        description: "Cuisine ouverte sur le salon (style américain)"
    },
    { 
        id: "FERMEE", 
        label: "Fermée",
        description: "Cuisine séparée par des murs et une porte"
    },
    { 
        id: "SEMI_OUVERTE", 
        label: "Semi-ouverte",
        description: "Partiellement ouverte (verrière, bar, passe-plat)"
    }
]

const KITCHEN_STATES = [
    { id: "EQUIPEE", label: "Équipée (Meubles + Électroménager)" },
    { id: "AMENAGEE", label: "Aménagée (Meubles seulement)" },
    { id: "VIDE", label: "Vide" }
]

const HEATING_TYPES = [
    { id: "CENTRAL", label: "Central", icon: "Thermometer" },
    { id: "SOL", label: "Au Sol", icon: "Waves" },
    { id: "GAZ", label: "À Gaz", icon: "Flame" }
]

const AC_TYPES = [
    { id: "CENTRAL", label: "Centrale", icon: "Wind" },
    { id: "SPLIT", label: "Split", icon: "Fan" },
    { id: "SANS", label: "Sans", icon: "X" }
]

// Types d'équipements avec icônes
const VILLA_EQUIPMENTS = {
  kitchen: [
    { id: "plates", label: "Plaques", icon: "LayoutGrid" },
    { id: "oven", label: "Four", icon: "CookingPot" },
    { id: "hood", label: "Hotte", icon: "Fan" },
    { id: "dishwasher", label: "Lave-vaisselle", icon: "Droplet" },
    { id: "microwave", label: "Micro-onde", icon: "Zap" },
    { id: "fridge", label: "Frigo", icon: "Snowflake" },
    { id: "washing_machine", label: "Machine à laver", icon: "Waves" },
    { id: "no_appliances", label: "Vide", icon: "Ban" },
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

interface Contact {
    phone: string
    hasWhatsapp: boolean
    hasViber: boolean
    hasTelegram: boolean
}

// Schéma de validation
const stringArrayOptional = z.preprocess((v) => {
  if (v === "" || v === null || v === undefined) return undefined
  if (Array.isArray(v)) return v
  return [v]
}, z.array(z.string()).optional())

const formSchema = z.object({
  transactionType: z.enum(["SALE", "RENTAL"]),
  realEstateType: z.string().min(1, "Type d'immobilier requis"),
  propertyType: z.string().min(1, "Type de bien requis"),
  typologyCustom: z.string().optional(), // Ajout de ce champ
  
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères").max(100, "Le titre est trop long").optional().or(z.literal("")),
  shortDescription: z.string().max(300, "La description est trop longue").optional().or(z.literal("")),
  
  city: z.string().min(2, "Wilaya requise"),
  commune: z.string().min(2, "Commune requise"),
  address: z.string().min(5, "Adresse du bien requise"),
  mapsLink: z.string().url("Le lien doit être une URL valide").optional().or(z.literal("")),
  price: z.string().min(1, "Prix requis").refine((val) => {
      const num = Number(val.replace(/\s/g, ''));
      return !isNaN(num) && num > 0;
  }, "Prix invalide"),
  priceUnit: z.enum(["DA", "MILLION", "MILLIARD"]),
  priceType: z.enum(["FIXED", "NEGOTIABLE"]),
  paymentModality: z.enum(["MONTHLY", "QUARTERLY", "SEMI_ANNUAL", "ANNUAL"]).optional(),
  
  // Champs techniques pour le mapping
  area: z.string().optional(),
  rooms: z.string().optional(),

  floorCount: z.string().min(1, "Requis").refine((val) => !isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 5, "Nombre d'étages invalide (0-5)"),
  extraFloor: z.enum(["basement", "entresol", "attic", "none"]),
  typology: z.string().min(1, "Typologie requise"),
  bedrooms: z.string().min(1, "Requis").refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Nombre de chambres invalide"),
  nbSuites: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), "Nombre invalide"),
  livingRooms: z.string().min(1, "Requis").refine((val) => !isNaN(Number(val)) && Number(val) >= 0, "Nombre de salons invalide"),
  bathrooms: z.string().min(1, "Requis").refine((val) => !isNaN(Number(val)) && Number(val) >= 0, "Nombre de salles de bain invalide"),
  bathroomType: z.enum(["shower", "bathtub", "both", "none"]).optional(),
  wc: z.string().min(1, "Requis").refine((val) => !isNaN(Number(val)) && Number(val) >= 0, "Nombre de WC invalide"),
  landArea: z.string().min(1, "Requis").refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Surface du terrain invalide"),
  builtArea: z.string().min(1, "Requis").refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Surface bâtie invalide"),
  habitableArea: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), "Surface invalide"),
  state: z.enum(["NEUF", "RENOVE", "BON_ETAT"]),
  parkingCount: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), "Nombre invalide"),
  outdoorParking: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), "Nombre invalide"),
  usageType: z.enum(["UNIQUE", "SEPARE"]),
  kitchenType: z.enum(["AMERICAINE", "FERMEE", "SEMI_OUVERTE"]),
  kitchenState: z.enum(["EQUIPEE", "AMENAGEE", "VIDE"]).optional(),
  heatingType: z.enum(["CENTRAL", "SOL", "GAZ"]),
  acType: z.enum(["CENTRAL", "SPLIT", "SANS"]),
  waterCounter: z.enum(["INDIVIDUEL", "COMMUN"]),
  elecCounter: z.enum(["INDIVIDUEL", "COMMUN"]),
  gasCounter: z.enum(["INDIVIDUEL", "COMMUN"]),
  depositMonths: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), "Nombre invalide"),
  rentalUsage: stringArrayOptional,
  chargesIncluded: z.preprocess((v) => {
    if (v === "true") return true
    if (v === "false") return false
    return v
  }, z.boolean().optional()),
  availableDate: z.string().optional(),
  
  kitchenEquipment: stringArrayOptional,
  exteriorFeatures: stringArrayOptional,
  utilities: stringArrayOptional,
  securityFeatures: stringArrayOptional,
  connectivity: stringArrayOptional,
  garageCapacity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, "Capacité du garage invalide").optional(),
  
  contacts: z.array(z.object({
      phone: z.string().min(9, "Numéro invalide"),
      hasWhatsapp: z.boolean(),
      hasViber: z.boolean(),
      hasTelegram: z.boolean()
  })).optional(),
}).superRefine((data, ctx) => {
    if (!data.state) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "État du bien requis", path: ["state"] })
    }
    if (!data.usageType) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Type d'usage requis", path: ["usageType"] })
    }
    if (!data.kitchenType) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Type de cuisine requis", path: ["kitchenType"] })
    }
    if (!data.heatingType) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Type de chauffage requis", path: ["heatingType"] })
    }
    if (!data.acType) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Type de climatisation requis", path: ["acType"] })
    }
    if (!data.waterCounter) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Compteur d'eau requis", path: ["waterCounter"] })
    }
    if (!data.elecCounter) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Compteur électrique requis", path: ["elecCounter"] })
    }
    if (!data.gasCounter) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Compteur gaz requis", path: ["gasCounter"] })
    }

    if (data.transactionType === "RENTAL") {
        if (!data.depositMonths) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Caution requise",
                path: ["depositMonths"]
            })
        }
        if (!data.rentalUsage || data.rentalUsage.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Usage requis",
                path: ["rentalUsage"]
            })
        }
    }
})

type DepositFormValues = z.infer<typeof formSchema>

const steps = [
  { id: 1, name: "Type de transaction" },
  { id: 2, name: "Type d'immobilier" },
  { id: 3, name: "Type de bien" },
  { id: 4, name: "Fiche descriptive" },
  { id: 5, name: "Prix & Modalités" },
  { id: 6, name: "Informations et Contact" },
  { id: 7, name: "Photos du bien" },
]

const InlineCalendar = ({ value, onChange }: { value?: Date, onChange: (date: Date) => void }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    
    // Sync currentMonth if value changes and is valid
    useEffect(() => {
        if (value) setCurrentMonth(value)
    }, [])

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

    const days = eachDayOfInterval({
        start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }),
        end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 })
    })

    const weekDays = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"]

    return (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
                <button type="button" onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <span className="font-bold text-gray-900 capitalize">
                    {format(currentMonth, "MMMM yyyy", { locale: fr })}
                </span>
                <button type="button" onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600 rotate-180" />
                </button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map(d => (
                    <div key={d} className="text-center text-xs font-bold text-gray-400 py-1">
                        {d}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {days.map((day, idx) => {
                    const isSelected = value ? isSameDay(day, value) : false
                    const isCurrentMonth = isSameMonth(day, currentMonth)
                    const isPast = isBefore(day, startOfDay(new Date()))

                    return (
                        <button
                            key={day.toString()}
                            type="button"
                            disabled={isPast}
                            onClick={() => onChange(day)}
                            className={cn(
                                "h-10 w-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all",
                                !isCurrentMonth && "text-gray-300",
                                isCurrentMonth && !isSelected && !isPast && "text-gray-700 hover:bg-gray-100 hover:text-[#00BFA6]",
                                isSelected && "bg-[#00BFA6] text-white shadow-md shadow-[#00BFA6]/20",
                                isPast && "text-gray-300 cursor-not-allowed opacity-50"
                            )}
                        >
                            {format(day, "d")}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

export default function DepositPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [selectedVideos, setSelectedVideos] = useState<File[]>([])
  const [photoCategories, setPhotoCategories] = useState<PhotoCategory[]>([
    { id: "other", label: "Autres photos", icon: ImageIcon, photos: [] },
    { id: "bedrooms", label: "Chambres", icon: BedIcon, photos: [] },
    { id: "bathrooms", label: "Salles de bain & WC", icon: BathIcon, photos: [] },
    { id: "kitchen", label: "Cuisine", icon: UtensilsIcon, photos: [] },
    { id: "exterior", label: "Extérieur (jardin, piscine)", icon: GardenIcon, photos: [] },
    { id: "common", label: "Espaces communs", icon: Home, photos: [] },
  ])
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([])
  const [mainPhoto, setMainPhoto] = useState<File | null>(null)
  const [photoOrganizationStep, setPhotoOrganizationStep] = useState<"upload" | "organize">("upload")
  const [userType, setUserType] = useState<string>("PARTICULIER")
  const [userCompanyActivity, setUserCompanyActivity] = useState<string | null>(null)
  const [availabilityMode, setAvailabilityMode] = useState<'IMMEDIATE' | 'DATE'>('IMMEDIATE')
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  
  // Contacts
  const [contacts, setContacts] = useState<Contact[]>([{ phone: "", hasWhatsapp: false, hasViber: false, hasTelegram: false }])
  const [userProfilePhone, setUserProfilePhone] = useState<string | null>(null)
  const [priceCentimes, setPriceCentimes] = useState<string>("")
  
  // Canvas Ref for rotation
  const canvasRef = useRef<HTMLCanvasElement>(null)

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
    setUserCompanyActivity(user.companyActivity || null)
    
    // Fetch fresh profile data to ensure we have the phone number
    const fetchProfile = async () => {
        try {
            // Fallback to localStorage IMMEDIATELY to avoid delay
            // We update it later if API succeeds
            if (user.phone) {
                setUserProfilePhone(user.phone)
                setContacts(prev => {
                    if (prev.length === 1 && prev[0].phone === "") {
                        return [{ phone: user.phone, hasWhatsapp: false, hasViber: false, hasTelegram: false }];
                    }
                    return prev;
                });
            }

            // Using full URL to avoid port issues
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            
            // Correct endpoint is /users/me based on UsersController
            let response = await fetch(`${apiUrl}/users/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // If /users/me fails (e.g. older backend version), try /users/profile as fallback
            if (!response.ok) {
                 response = await fetch(`${apiUrl}/users/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }
            
            if (response.ok) {
                const profile = await response.json();
                console.log("Profile fetched successfully:", profile);
                // Profile phone might be under 'phone' or 'phoneNumber' depending on backend version
                const phone = profile.phone || profile.phoneNumber;
                
                if (phone) {
                    setUserProfilePhone(phone);
                    // Update contact if it was empty or matched old user.phone from localStorage
                    setContacts(prev => {
                        if (prev.length === 1 && (prev[0].phone === "" || (user.phone && prev[0].phone === user.phone))) {
                            return [{ phone: phone, hasWhatsapp: false, hasViber: false, hasTelegram: false }];
                        }
                        return prev;
                    });
                }
            } else {
                console.error("Failed to fetch profile from endpoints");
                // LocalStorage fallback already applied at start
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            // LocalStorage fallback already applied at start
        }
    };
    
    fetchProfile();
    
  }, [router])

  useEffect(() => {
    if (!userProfilePhone) return
    setContacts((prev) => {
      if (prev.length === 1 && prev[0].phone === "") {
        return [{ phone: userProfilePhone, hasWhatsapp: false, hasViber: false, hasTelegram: false }]
      }
      return prev
    })
  }, [userProfilePhone])

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setValue,
    getValues,
    setError,
    formState: { errors },
  } = useForm<DepositFormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      transactionType: "SALE",
      realEstateType: "",
      propertyType: "",
      city: "",
      commune: "",
      address: "",
      title: "",
      shortDescription: "",
      price: "",
      floorCount: "",
      typology: "",
      bedrooms: "",
      livingRooms: "",
      bathrooms: "",
      wc: "",
      landArea: "",
      builtArea: "",
      extraFloor: "none",
      bathroomType: "none",
      priceUnit: "DA",
      priceType: "FIXED",
      depositMonths: "",
      rentalUsage: [],
      chargesIncluded: false,
    },
  })

   const transactionType = watch("transactionType")
  const realEstateType = watch("realEstateType")
  const propertyType = watch("propertyType")
  const selectedCity = watch("city")
  const garageHasCapacity = watch("garageCapacity")
  const availableDate = watch("availableDate")
  
  // Re-hook the useEffect for price calculation since watch comes from useForm
  // We need to move the useEffect logic AFTER useForm
  const currentPrice = watch("price")
  const currentPriceUnit = watch("priceUnit")

  useEffect(() => {
    if (!currentPrice) {
        setPriceCentimes("")
        return
    }
    
    const val = Number(currentPrice.replace(/\s/g, ''))
    if (isNaN(val)) {
        setPriceCentimes("")
        return
    }

    // Calcul en Centimes (1 DA = 100 Centimes)
    let totalCentimes = 0;
    // La valeur saisie est déjà dans l'unité choisie
    if (currentPriceUnit === 'DA') totalCentimes = val * 100;
    else if (currentPriceUnit === 'MILLION') totalCentimes = val * 1000000;
    else if (currentPriceUnit === 'MILLIARD') totalCentimes = val * 1000000000;

    // Affichage texte
    if (totalCentimes >= 1000000000) { 
        const milliards = totalCentimes / 1000000000;
        setPriceCentimes(`${milliards.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} Milliards de centimes`)
    } else if (totalCentimes >= 1000000) { 
        const millions = totalCentimes / 1000000;
        setPriceCentimes(`${millions.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} Millions de centimes`)
    } else {
        setPriceCentimes(`${totalCentimes.toLocaleString('fr-FR')} Centimes`)
    }
  }, [currentPrice, currentPriceUnit])

  // Conversion lors du changement d'unité
  const handlePriceUnitChange = (newUnit: "DA" | "MILLION" | "MILLIARD") => {
      const currentVal = Number(watch("price")?.replace(/\s/g, '') || 0);
      
      // Update unit immediately
      setValue("priceUnit", newUnit);

      if (currentVal === 0) return;
      
      // Convert logic
      let valInDA = currentVal;
      // FROM
      if (currentPriceUnit === 'MILLION') valInDA = currentVal * 10000;
      else if (currentPriceUnit === 'MILLIARD') valInDA = currentVal * 10000000;
      
      // TO
      let newVal = valInDA;
      if (newUnit === 'MILLION') newVal = valInDA / 10000;
      else if (newUnit === 'MILLIARD') newVal = valInDA / 10000000;
      
      const formatted = Number.isInteger(newVal) ? newVal.toString() : newVal.toFixed(2);
      setValue("price", formatted);
  }
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
      
      // Si aucune photo principale, on met la première
      if (!mainPhoto && newFiles.length > 0) {
          setMainPhoto(newFiles[0])
      }
      
      e.target.value = ''
    }
  }

  const removeFile = (index: number) => {
    const fileToRemove = selectedFiles[index];
    if (fileToRemove === mainPhoto) {
        setMainPhoto(null);
    }
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }
  
  const onVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const newVideos = Array.from(event.target.files)
      
      // Limit to 2 videos max
      if (selectedVideos.length + newVideos.length > 2) {
          alert("Vous ne pouvez ajouter que 2 vidéos maximum")
          return
      }

      // Max size 50MB
      const validVideos = newVideos.filter(file => file.size <= 50 * 1024 * 1024)
      if (validVideos.length < newVideos.length) {
          alert("Certaines vidéos dépassent la taille limite de 50MB")
      }

      setSelectedVideos((prev) => [...prev, ...validVideos])
    }
  }

  const removeVideo = (index: number) => {
    setSelectedVideos((prev) => prev.filter((_, i) => i !== index))
  }

  // Rotation d'image
  const rotateImage = async (file: File) => {
      // Create an image element
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise(r => img.onload = r);
      
      // Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Rotate 90 degrees
      canvas.width = img.height;
      canvas.height = img.width;
      
      ctx.translate(canvas.width/2, canvas.height/2);
      ctx.rotate(90 * Math.PI / 180);
      ctx.drawImage(img, -img.width/2, -img.height/2);
      
      // Convert back to file
      canvas.toBlob((blob) => {
          if (blob) {
              const newFile = new File([blob], file.name, { type: file.type, lastModified: Date.now() });
              
              // Replace in selectedFiles
              setSelectedFiles(prev => prev.map(f => f === file ? newFile : f));
              
              // Update categories if organized
              setPhotoCategories(prev => prev.map(c => ({
                  ...c,
                  photos: c.photos.map(p => p === file ? newFile : p)
              })));
              
              // Update main photo if needed
              if (mainPhoto === file) setMainPhoto(newFile);
          }
      }, file.type);
  }

  // Passer à l'organisation des photos
  const proceedToPhotoOrganization = () => {
    if (selectedFiles.length < 3) {
      alert("Veuillez ajouter au moins 3 photos")
      return
    }
    
    // Mettre TOUTES les photos dans la catégorie "Autres" par défaut
    // L'utilisateur devra ensuite les trier
    setPhotoCategories(prev => prev.map(cat => {
        if (cat.id === "other") {
            // On met toutes les photos ici
            return { ...cat, photos: [...selectedFiles] }
        } else {
            // On vide les autres catégories pour commencer proprement
            return { ...cat, photos: [] }
        }
    }))
    
    setPhotoOrganizationStep("organize")
  }

  // Drag and drop pour réorganisation
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return
    const { source, destination } = result

    if (source.droppableId === destination.droppableId) {
        const categoryId = source.droppableId
        const category = photoCategories.find(c => c.id === categoryId)
        if (!category) return
        
        const items = Array.from(category.photos)
        const [reorderedItem] = items.splice(source.index, 1)
        items.splice(destination.index, 0, reorderedItem)
        
        setPhotoCategories(prev => 
            prev.map(c => c.id === categoryId ? { ...c, photos: items } : c)
        )
    } else {
        setPhotoCategories(prev => {
            const sourceCategory = prev.find(c => c.id === source.droppableId)
            const destCategory = prev.find(c => c.id === destination.droppableId)
            
            if (!sourceCategory || !destCategory) return prev
            
            const sourceItems = Array.from(sourceCategory.photos)
            const destItems = Array.from(destCategory.photos)
            
            const [movedItem] = sourceItems.splice(source.index, 1)
            destItems.splice(destination.index, 0, movedItem)
            
            return prev.map(c => {
                if (c.id === source.droppableId) return { ...c, photos: sourceItems }
                if (c.id === destination.droppableId) return { ...c, photos: destItems }
                return c
            })
        })
    }
  }

  const togglePhotoSelection = (photo: File) => {
      setSelectedPhotos(prev => 
          prev.includes(photo) ? prev.filter(p => p !== photo) : [...prev, photo]
      )
  }

  const moveSelectedPhotos = (targetCategoryId: string) => {
      if (selectedPhotos.length === 0) return;
      
      setPhotoCategories(prev => {
          return prev.map(cat => {
              // Remove from all categories
              let newPhotos = cat.photos.filter(p => !selectedPhotos.includes(p));
              
              // Add to target category
              if (cat.id === targetCategoryId) {
                  newPhotos = [...newPhotos, ...selectedPhotos];
              }
              return { ...cat, photos: newPhotos };
          })
      });
      
      setSelectedPhotos([]);
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
            "landArea", "builtArea",
            "state", "parkingCount", "outdoorParking",
            "usageType", "bedrooms", "nbSuites", "livingRooms", "bathrooms", "wc", "bathroomType",
            "kitchenType", "kitchenState",
            "heatingType", "acType",
            "waterCounter", "elecCounter", "gasCounter",
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

  const handlePriceSubmit = async () => {
    // Basic price fields - paymentModality removed as it is hidden
    const fieldsToValidate: any[] = ["price", "priceUnit", "priceType"]
    
    // Add rental specific fields if needed
    if (transactionType === "RENTAL") {
        fieldsToValidate.push("depositMonths")
        fieldsToValidate.push("rentalUsage")
        fieldsToValidate.push("chargesIncluded")
        if (availabilityMode === 'DATE') {
             fieldsToValidate.push("availableDate")
        }
    }

    const isValid = await trigger(fieldsToValidate)
    
    // Debugging
    console.log("Validation fields:", fieldsToValidate)
    console.log("Validation result:", isValid)
    if (!isValid) {
        console.log("Validation errors:", errors)
        // Force update to show errors
        trigger(fieldsToValidate)
    }

    if (isValid) {
      setCurrentStep(6)
    }
  }

  const handleLocationAndContactsSubmit = async () => {
      const isLocationValid = await trigger(["title", "shortDescription", "city", "commune", "address", "mapsLink"])
      
      // Validate contacts
      const isContactsValid = contacts.every(c => c.phone.length >= 9);
      
      if (isLocationValid && isContactsValid) {
          setCurrentStep(7)
      } else if (!isContactsValid) {
          alert("Veuillez saisir au moins un numéro de téléphone valide")
      }
  }

  const goToStep = (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step)
    }
  }

  const prevStep = () => setCurrentStep((prev) => prev - 1)

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    // Récupérer toutes les photos organisées
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
    // Le prix stocké doit toujours être en DA
    // Si l'utilisateur a choisi MILLION, il a rentré "10" pour "10 Millions". 
    // Or 1 Million de centimes = 10 000 DA. Donc 10 * 10 000 = 100 000 DA.
    if (data.priceUnit === 'MILLION') {
        finalPrice *= 10000;
    } else if (data.priceUnit === 'MILLIARD') {
        finalPrice *= 10000000;
    } else if (data.priceUnit === 'DA') {
        // Si c'est en DA, pas de conversion, c'est la valeur brute
        // Mais attention si le backend attend des centimes ? 
        // Non, standard = DA. 
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
    }

    // Ajouter toutes les autres données du formulaire
    Object.entries(data).forEach(([key, value]) => {
      // On traite le prix manuellement, et description est déjà traité ou présent
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
    
    // 2b. Gestion des vidéos (Le backend attend 'videos')
    // Le backend peut ne pas accepter le champ 'videos' si aucune vidéo n'est envoyée ou s'il n'est pas configuré pour.
    // L'erreur 400 "Unexpected field" suggère que Multer (backend) ne s'attend pas à recevoir ce champ.
    // On l'ajoute seulement si des vidéos sont présentes.
    if (selectedVideos.length > 0) {
        selectedVideos.forEach(video => {
            formData.append('videos', video)
        })
    }

    // 2c. Métadonnées des images (Catégories)
    const imagesMetadata = photoCategories.flatMap(c => 
        c.photos.map(p => ({
            filename: p.name,
            category: c.id,
            isMain: p === mainPhoto
        }))
    );
    formData.append('imagesMetadata', JSON.stringify(imagesMetadata));
    
    // 3. Contacts
    if (contacts.length > 0 && contacts[0].phone) {
        formData.append('contacts', JSON.stringify(contacts));
    }
    
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
        let errorData;
        try {
            const text = await response.text();
            try {
                errorData = JSON.parse(text);
            } catch {
                errorData = { message: text || response.statusText };
            }
        } catch (e) {
            errorData = { message: "Erreur inconnue" };
        }
        
        console.error("Erreur création annonce:", response.status, errorData)
        
        if (response.status === 401) {
            alert("Votre session a expiré. Veuillez vous reconnecter.")
            // router.push('/auth/login') // Impossible d'utiliser router ici si non déclaré ou hors contexte, mais on peut utiliser window.location
            window.location.href = '/auth/login'
            return
        }

        alert(`Erreur (${response.status}): ${errorData.message || JSON.stringify(errorData)}`)
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
      case 5: return "Prix & Modalités"
      case 6: return "Informations et Contact"
      case 7: return "Médias du bien"
      default: return ""
    }
  }

  // Helper pour les contacts
  const addContact = () => {
      setContacts([...contacts, { phone: "", hasWhatsapp: false, hasViber: false, hasTelegram: false }])
  }

  const removeContact = (index: number) => {
      if (contacts.length > 1) {
          setContacts(contacts.filter((_, i) => i !== index))
      }
  }

  const updateContact = (index: number, field: keyof Contact, value: any) => {
      const newContacts = [...contacts]
      newContacts[index] = { ...newContacts[index], [field]: value }
      setContacts(newContacts)
  }

  const isEligibleUser = userType === "PARTICULIER" || 
      (userType === "SOCIETE" && userCompanyActivity && ["AGENCE_IMMOBILIERE", "PROMOTEUR_IMMOBILIER", "ADMINISTRATEUR_BIENS", "AUTRES_PROFESSIONNELS"].includes(userCompanyActivity));

  const isEligibleProperty = propertyType === "VILLA" && (transactionType === "RENTAL" || transactionType === "SALE");

  const isFormAvailable = isEligibleUser && isEligibleProperty;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-[#00908A] h-[200px] w-full absolute top-0 left-0 z-0"></div>

        <div className="flex-1 flex flex-col items-center justify-start md:justify-center relative z-10 p-4 pt-[96px] md:pt-4">
            
            {/* Progress Stepper */}
            <div className="bg-white rounded-xl px-3 py-2 md:rounded-full md:px-6 md:py-3 border border-[#00BFA6]/25 shadow-lg mb-4 md:mb-8 w-full max-w-4xl flex justify-center">
                <div className="flex items-center w-full max-w-3xl">
                    {steps.map((step, idx) => (
                        <div key={step.id} className="flex items-center flex-1 min-w-0">
                            <div
                                className={cn(
                                    "w-7 h-7 md:w-7 md:h-7 rounded-full flex items-center justify-center text-xs md:text-xs font-bold border-2 transition-all cursor-pointer hover:opacity-80",
                                    step.id > currentStep && "cursor-not-allowed opacity-50",
                                    currentStep > step.id ? "bg-[#00BFA6] border-[#00BFA6] text-white" :
                                    currentStep === step.id ? "border-[#00BFA6] text-[#00BFA6]" : "border-gray-400 text-gray-600"
                                )}
                                onClick={() => goToStep(step.id)}
                            >
                                {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
                            </div>
                            {idx < steps.length - 1 && (
                                <div className={cn("flex-1 min-w-0 h-0.5 mx-2", currentStep > step.id ? "bg-[#00BFA6]" : "bg-gray-300")}></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-4xl overflow-visible min-h-[500px] flex flex-col">
                <div className="p-4 md:p-8 border-b border-gray-100 flex items-center">
                    {currentStep > 1 && (
                        <button 
                            onClick={prevStep}
                            className="flex items-center gap-2 text-gray-500 hover:text-[#00BFA6] transition-colors font-medium mr-4"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            Retour
                        </button>
                    )}
                    <h1 className="text-lg md:text-2xl font-bold text-gray-800">{getStepTitle()}</h1>
                </div>

                <div className="p-6 md:p-12 flex-1 flex flex-col items-center justify-center text-left">
                    {!isFormAvailable && currentStep > 3 ? (
                        <div className="w-full max-w-2xl text-center space-y-6 py-12">
                            <div className="bg-orange-50 text-orange-600 p-8 rounded-2xl border border-orange-200">
                                <Info className="h-12 w-12 mx-auto mb-4 opacity-80" />
                                <h3 className="text-xl font-bold mb-2">Formulaire en cours de création</h3>
                                <p className="text-orange-700/80">
                                    Le formulaire détaillé pour ce type de bien ({(filteredPropertyTypes.find(t => t.id === propertyType) || {}).label || propertyType}) 
                                    et votre profil ({userType === "SOCIETE" ? "Société" : "Particulier"}) sera bientôt disponible.
                                </p>
                                <p className="text-sm mt-4 text-orange-600/60">
                                    Actuellement, seul le dépôt pour les Villas (Résidentiel) est actif.
                                </p>
                            </div>
                            <Button 
                                onClick={() => setCurrentStep(1)}
                                className="bg-gray-900 text-white rounded-full px-8"
                            >
                                Recommencer
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Step 1: Transaction Type */}
                    {currentStep === 1 && (
                        <div className="w-full max-w-4xl animate-fade-in py-6 md:py-10">
                            <div className="flex justify-center gap-8 md:gap-32">
                                {/* Location */}
                                <div 
                                    onClick={() => handleTransactionTypeClick("RENTAL")}
                                    className="flex flex-col items-center gap-6 cursor-pointer group"
                                >
                                    <div className={cn(
                                        "w-28 h-28 md:w-40 md:h-40 rounded-full flex items-center justify-center transition-all duration-300 border-4 relative",
                                        transactionType === "RENTAL" 
                                            ? "bg-white border-[#00BFA6] shadow-[0_10px_20px_rgba(0,191,166,0.3)] transform -translate-y-2" 
                                            : "bg-white border-gray-100 shadow-[0_10px_20px_rgba(0,0,0,0.05)] group-hover:border-[#00BFA6]/30 group-hover:-translate-y-1"
                                    )}>
                                        <div className={cn(
                                            "w-20 h-20 md:w-32 md:h-32 rounded-full flex items-center justify-center transition-colors duration-300",
                                            transactionType === "RENTAL" ? "bg-[#00BFA6] text-white" : "bg-gray-50 text-gray-400 group-hover:bg-[#00BFA6]/10 group-hover:text-[#00BFA6]"
                                        )}>
                                            <Home className="h-10 w-10 md:h-16 md:w-16" />
                                        </div>
                                    </div>
                                    <span className={cn(
                                        "text-lg md:text-2xl font-bold transition-colors",
                                        transactionType === "RENTAL" ? "text-[#00BFA6]" : "text-gray-500 group-hover:text-[#00BFA6]"
                                    )}>
                                        Location
                                    </span>
                                </div>

                                {/* Vente */}
                                <div 
                                    onClick={() => handleTransactionTypeClick("SALE")}
                                    className="flex flex-col items-center gap-6 cursor-pointer group"
                                >
                                    <div className={cn(
                                        "w-28 h-28 md:w-40 md:h-40 rounded-full flex items-center justify-center transition-all duration-300 border-4 relative",
                                        transactionType === "SALE" 
                                            ? "bg-white border-[#00BFA6] shadow-[0_10px_20px_rgba(0,191,166,0.3)] transform -translate-y-2" 
                                            : "bg-white border-gray-100 shadow-[0_10px_20px_rgba(0,0,0,0.05)] group-hover:border-[#00BFA6]/30 group-hover:-translate-y-1"
                                    )}>
                                        <div className={cn(
                                            "w-20 h-20 md:w-32 md:h-32 rounded-full flex items-center justify-center transition-colors duration-300",
                                            transactionType === "SALE" ? "bg-[#00BFA6] text-white" : "bg-gray-50 text-gray-400 group-hover:bg-[#00BFA6]/10 group-hover:text-[#00BFA6]"
                                        )}>
                                            <Key className="h-10 w-10 md:h-16 md:w-16" />
                                        </div>
                                    </div>
                                    <span className={cn(
                                        "text-lg md:text-2xl font-bold transition-colors",
                                        transactionType === "SALE" ? "text-[#00BFA6]" : "text-gray-500 group-hover:text-[#00BFA6]"
                                    )}>
                                        Vente
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Real Estate Type */}
                    {currentStep === 2 && (
                        <div className="w-full max-w-5xl animate-fade-in py-8">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8 justify-items-center">
                                {filteredCategories.map((cat) => {
                                    const Icon = IconMap[cat.iconName] || Home
                                    const isSelected = realEstateType === cat.id
                                    return (
                                        <div 
                                            key={cat.id}
                                            onClick={() => handleCategoryClick(cat.id)}
                                            className="flex flex-col items-center gap-4 cursor-pointer group w-full"
                                        >
                                            <div className={cn(
                                                "w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 border-4 relative",
                                                isSelected 
                                                    ? "bg-white border-[#00BFA6] shadow-[0_8px_16px_rgba(0,191,166,0.3)] transform -translate-y-2" 
                                                    : "bg-white border-gray-100 shadow-[0_8px_16px_rgba(0,0,0,0.05)] group-hover:border-[#00BFA6]/30 group-hover:-translate-y-1"
                                            )}>
                                                <div className={cn(
                                                    "w-24 h-24 rounded-full flex items-center justify-center transition-colors duration-300",
                                                    isSelected ? "bg-[#00BFA6] text-white" : "bg-gray-50 text-gray-400 group-hover:bg-[#00BFA6]/10 group-hover:text-[#00BFA6]"
                                                )}>
                                                    <Icon className="h-10 w-10" />
                                                </div>
                                            </div>
                                            <span className={cn(
                                                "text-lg font-bold text-center max-w-[180px] transition-colors",
                                                isSelected ? "text-[#00BFA6]" : "text-gray-500 group-hover:text-[#00BFA6]"
                                            )}>
                                                {cat.label}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Property Type */}
                    {currentStep === 3 && (
                        <div className="w-full max-w-5xl animate-fade-in py-8">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-6 justify-items-center">
                                {filteredPropertyTypes.map((type) => {
                                    const Icon = IconMap[type.iconName] || Home
                                    const isSelected = propertyType === type.id
                                    return (
                                        <div 
                                            key={type.id}
                                            onClick={() => handlePropertyTypeClick(type.id)}
                                            className="flex flex-col items-center gap-3 cursor-pointer group w-full"
                                        >
                                            <div className={cn(
                                                "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 border-4 relative",
                                                isSelected 
                                                    ? "bg-white border-[#00BFA6] shadow-[0_6px_12px_rgba(0,191,166,0.3)] transform -translate-y-1" 
                                                    : "bg-white border-gray-100 shadow-[0_6px_12px_rgba(0,0,0,0.05)] group-hover:border-[#00BFA6]/30 group-hover:-translate-y-1"
                                            )}>
                                                <div className={cn(
                                                    "w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300",
                                                    isSelected ? "bg-[#00BFA6] text-white" : "bg-gray-50 text-gray-400 group-hover:bg-[#00BFA6]/10 group-hover:text-[#00BFA6]"
                                                )}>
                                                    <Icon className="h-8 w-8" />
                                                </div>
                                            </div>
                                            <span className={cn(
                                                "text-sm font-bold text-center max-w-[140px] transition-colors",
                                                isSelected ? "text-[#00BFA6]" : "text-gray-500 group-hover:text-[#00BFA6]"
                                            )}>
                                                {type.label}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Step 4: Fiche descriptive - Villa */}
                    {currentStep === 4 && propertyType === "VILLA" && (transactionType === "RENTAL" || transactionType === "SALE") && (
                        <div className="w-full max-w-4xl animate-fade-in space-y-10">
                            
                            {/* 1. Caractéristiques Générales & Structure */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Building2 className="text-[#00BFA6]" /> Caractéristiques Générales & Structure
                                </h2>
                                
                                <div className="flex flex-col gap-5">
                                    {/* Row 1: Typologie, Nombre d'étages, Surface terrain, Surface bâtie */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-5 items-end">
                                        <div className="min-w-0">
                                            <label className="block text-sm font-bold text-gray-900 mb-2">Typologie <span className="text-red-500">*</span></label>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-700 text-lg">F</span>
                                                <input 
                                                    type="number" 
                                                    min="1" max="10"
                                                    onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setValue("typology", `F${val}`);
                                                        setValue("typologyCustom", val);
                                                    }}
                                                    className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base" 
                                                    placeholder="Ex: 4"
                                                />
                                            </div>
                                            {errors.typology && <p className="text-red-500 text-xs mt-1">{errors.typology.message}</p>}
                                        </div>

                                        <div className="min-w-0">
                                            <label className="block text-sm font-bold text-gray-900 mb-2">Nombre d&apos;étages <span className="text-red-500">*</span></label>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-700 text-lg whitespace-nowrap">R +</span>
                                                <input 
                                                    {...register("floorCount")} 
                                                    type="number" 
                                                    min="0" max="10"
                                                    onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                    className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base" 
                                                    placeholder="Ex: 2"
                                                />
                                            </div>
                                            {errors.floorCount && <p className="text-red-500 text-xs mt-1">{errors.floorCount.message}</p>}
                                        </div>

                                        <div className="min-w-0">
                                            <label className="block text-sm font-bold text-gray-900 mb-2">Surface terrain (m²) <span className="text-red-500">*</span></label>
                                            <input 
                                                {...register("landArea")} 
                                                type="number" 
                                                min="0"
                                                onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base" 
                                                placeholder="Ex: 400" 
                                            />
                                            {errors.landArea && <p className="text-red-500 text-xs mt-1">{errors.landArea.message}</p>}
                                        </div>
                                        <div className="min-w-0">
                                            <label className="block text-sm font-bold text-gray-900 mb-2">Surface bâtie (m²) <span className="text-red-500">*</span></label>
                                            <input 
                                                {...register("builtArea")} 
                                                type="number" 
                                                min="0"
                                                onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base" 
                                                placeholder="Ex: 250" 
                                            />
                                            {errors.builtArea && <p className="text-red-500 text-xs mt-1">{errors.builtArea.message}</p>}
                                        </div>
                                    </div>

                                    {/* Row 2: État Général, Garage, Stationnement */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
                                        <div className="min-w-0">
                                            <label className="block text-sm font-bold text-gray-900 mb-2">État Général</label>
                                            <select {...register("state")} className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base">
                                                <option value="">Sélectionner</option>
                                                {PROPERTY_STATES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                            </select>
                                            {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                                        </div>
                                        <div className="min-w-0">
                                            <label className="block text-sm font-bold text-gray-900 mb-2">Garage (places)</label>
                                            <input 
                                                {...register("parkingCount")} 
                                                type="number" 
                                                min="0"
                                                onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base" 
                                                placeholder="Ex: 1" 
                                            />
                                            {errors.parkingCount && <p className="text-red-500 text-xs mt-1">{errors.parkingCount.message}</p>}
                                        </div>
                                        <div className="min-w-0">
                                            <label className="block text-sm font-bold text-gray-900 mb-2">Stationnement extérieur (places)</label>
                                            <input 
                                                {...register("outdoorParking")} 
                                                type="number" 
                                                min="0"
                                                onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base" 
                                                placeholder="Ex: 2" 
                                            />
                                            {errors.outdoorParking && <p className="text-red-500 text-xs mt-1">{errors.outdoorParking.message}</p>}
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
                                    <div className="flex flex-wrap gap-4">
                                        {USAGE_TYPES.map((u) => (
                                            <label key={u.id} className="cursor-pointer group relative">
                                                <input type="radio" value={u.id} {...register("usageType")} className="peer sr-only" />
                                                <div className="px-6 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-900 peer-checked:border-[#00BFA6] peer-checked:bg-[#00BFA6]/10 peer-checked:text-[#00BFA6] transition-all bg-white shadow-sm hover:border-gray-400 flex items-center gap-2">
                                                    {u.label}
                                                    <div className="relative group/info ml-1">
                                                        <Info className="h-4 w-4 text-gray-400 hover:text-[#00BFA6]" />
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none z-50 text-center font-normal">
                                                            {u.description}
                                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900"></div>
                                                        </div>
                                                    </div>
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
                                
                                <div className="flex flex-col gap-5">
                                    {/* Ligne 1: Chambres, Suites, Salons, Toilettes */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-2">Nombre de Chambres <span className="text-red-500">*</span></label>
                                            <input 
                                                {...register("bedrooms")} 
                                                type="number" 
                                                min="0"
                                                onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                className="w-full p-3 border-2 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900" 
                                            />
                                            {errors.bedrooms && <p className="text-red-500 text-sm mt-1">{errors.bedrooms.message}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-2">Dont Suites Parentales</label>
                                            <input 
                                                {...register("nbSuites")} 
                                                type="number" 
                                                min="0"
                                                onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                className="w-full p-3 border-2 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-2">Nombre de Salons <span className="text-red-500">*</span></label>
                                            <input 
                                                {...register("livingRooms")} 
                                                type="number" 
                                                min="0"
                                                onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                className="w-full p-3 border-2 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900" 
                                            />
                                            {errors.livingRooms && <p className="text-red-500 text-sm mt-1">{errors.livingRooms.message}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-2">Nombre de Toilettes (WC) <span className="text-red-500">*</span></label>
                                            <input 
                                                {...register("wc")} 
                                                type="number" 
                                                min="0"
                                                onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                className="w-full p-3 border-2 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900" 
                                            />
                                            {errors.wc && <p className="text-red-500 text-sm mt-1">{errors.wc.message}</p>}
                                        </div>
                                    </div>

                                    {/* Ligne 2: SDB, Type SDB */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-2">Nombre de Salles de Bain <span className="text-red-500">*</span></label>
                                            <input 
                                                {...register("bathrooms")} 
                                                type="number" 
                                                min="0"
                                                onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                className="w-full p-3 border-2 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900" 
                                            />
                                            {errors.bathrooms && <p className="text-red-500 text-sm mt-1">{errors.bathrooms.message}</p>}
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-gray-900 mb-2">Type de Salle de Bain</label>
                                            <div className="flex flex-wrap gap-4">
                                                <label className="flex items-center gap-2 cursor-pointer bg-white p-3 border-2 border-gray-200 rounded-xl hover:border-[#00BFA6] transition-colors flex-1 justify-center">
                                                    <input type="radio" value="shower" {...register("bathroomType")} className="accent-[#00BFA6] w-4 h-4" /> 
                                                    <span className="text-sm font-bold text-gray-900">Douche Italienne</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer bg-white p-3 border-2 border-gray-200 rounded-xl hover:border-[#00BFA6] transition-colors flex-1 justify-center">
                                                    <input type="radio" value="bathtub" {...register("bathroomType")} className="accent-[#00BFA6] w-4 h-4" /> 
                                                    <span className="text-sm font-bold text-gray-900">Baignoire</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer bg-white p-3 border-2 border-gray-200 rounded-xl hover:border-[#00BFA6] transition-colors flex-1 justify-center">
                                                    <input type="radio" value="both" {...register("bathroomType")} className="accent-[#00BFA6] w-4 h-4" /> 
                                                    <span className="text-sm font-bold text-gray-900">Les deux</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 4. Cuisine et équipements */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Utensils className="text-[#00BFA6]" /> Cuisine et équipements
                                </h2>
                                
                                <div className="space-y-6">
                                    {/* Type de Cuisine */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-3">Type de Cuisine</label>
                                        <div className="flex flex-wrap gap-4">
                                            {KITCHEN_TYPES.map(k => (
                                                <label key={k.id} className="flex items-center gap-2 cursor-pointer bg-white p-3 border-2 border-gray-200 rounded-xl hover:border-[#00BFA6] transition-colors flex-1 justify-center relative group min-w-[140px]">
                                                    <input type="radio" value={k.id} {...register("kitchenType")} className="accent-[#00BFA6] w-4 h-4" /> 
                                                    <span className="text-sm font-bold text-gray-900">{k.label}</span>
                                                    <div className="relative group/info ml-1">
                                                        <Info className="h-4 w-4 text-gray-400 hover:text-[#00BFA6]" />
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none z-50 font-normal text-left">
                                                            {k.description}
                                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                                        </div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                        {errors.kitchenType && <p className="text-red-500 text-sm mt-1">{errors.kitchenType.message}</p>}
                                    </div>

                                    {/* Équipements de la cuisine */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-3">Équipements de la cuisine</label>
                                        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                                            {VILLA_EQUIPMENTS.kitchen.map((item) => {
                                                const Icon = IconMap[item.icon] || Utensils
                                                return (
                                                    <label key={item.id} className="cursor-pointer group">
                                                        <input 
                                                            type="checkbox" 
                                                            value={item.id} 
                                                            {...register("kitchenEquipment")} 
                                                            className="peer sr-only" 
                                                        />
                                                        <div className="p-2 border-2 border-gray-200 rounded-xl flex flex-col items-center gap-1 text-center peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 peer-checked:text-[#00BFA6] transition-all hover:border-gray-300 bg-white h-20 justify-start">
                                                            <div className="h-7 flex items-center justify-center">
                                                                <Icon className="h-5 w-5 text-gray-400 group-hover:text-gray-600 peer-checked:text-[#00BFA6] transition-colors" />
                                                            </div>
                                                            <div className="min-h-[36px] flex items-start justify-center px-1">
                                                                <span className="text-xs font-bold text-center leading-tight text-gray-700 peer-checked:text-[#00BFA6]">{item.label}</span>
                                                            </div>
                                                        </div>
                                                    </label>
                                                )
                                            })}
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
                                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                                        {VILLA_EQUIPMENTS.exterior.map((item) => {
                                            const Icon = IconMap[item.icon] || Trees
                                            return (
                                                <label key={item.id} className="cursor-pointer group">
                                                    <input type="checkbox" value={item.id} {...register("exteriorFeatures")} className="peer sr-only" />
                                                    <div className="flex flex-col items-center justify-center gap-2 p-3 border-2 border-gray-200 rounded-xl hover:border-[#00BFA6] peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 peer-checked:text-[#00BFA6] transition-all bg-white h-24">
                                                        <Icon className="h-6 w-6 text-gray-400 group-hover:text-gray-600 peer-checked:text-[#00BFA6]" />
                                                        <span className="text-xs font-bold text-center leading-tight text-gray-700 peer-checked:text-[#00BFA6]">{item.label}</span>
                                                    </div>
                                                </label>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Commodités, Sécurité & Connectivité */}
                                <div className="space-y-8 border-t border-gray-100 pt-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Chauffage */}
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-3">Chauffage</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {HEATING_TYPES.map(h => {
                                                    const Icon = IconMap[h.icon] || Flame
                                                    return (
                                                        <label key={h.id} className="cursor-pointer group">
                                                            <input type="radio" value={h.id} {...register("heatingType")} className="peer sr-only" />
                                                            <div className="flex flex-col items-center justify-center gap-2 p-3 border-2 border-gray-200 rounded-xl hover:border-[#00BFA6] peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 peer-checked:text-[#00BFA6] transition-all bg-white h-24">
                                                                <Icon className="h-6 w-6 text-gray-400 group-hover:text-gray-600 peer-checked:text-[#00BFA6]" />
                                                                <span className="text-xs font-bold text-center leading-tight text-gray-700 peer-checked:text-[#00BFA6]">{h.label}</span>
                                                            </div>
                                                        </label>
                                                    )
                                                })}
                                            </div>
                                            {errors.heatingType && <p className="text-red-500 text-sm mt-1">{errors.heatingType.message}</p>}
                                        </div>

                                        {/* Climatisation */}
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-3">Climatisation</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {AC_TYPES.map(a => {
                                                    const Icon = IconMap[a.icon] || Fan
                                                    return (
                                                        <label key={a.id} className="cursor-pointer group">
                                                            <input type="radio" value={a.id} {...register("acType")} className="peer sr-only" />
                                                            <div className="flex flex-col items-center justify-center gap-2 p-3 border-2 border-gray-200 rounded-xl hover:border-[#00BFA6] peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 peer-checked:text-[#00BFA6] transition-all bg-white h-24">
                                                                <Icon className="h-6 w-6 text-gray-400 group-hover:text-gray-600 peer-checked:text-[#00BFA6]" />
                                                                <span className="text-xs font-bold text-center leading-tight text-gray-700 peer-checked:text-[#00BFA6]">{a.label}</span>
                                                            </div>
                                                        </label>
                                                    )
                                                })}
                                            </div>
                                            {errors.acType && <p className="text-red-500 text-sm mt-1">{errors.acType.message}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Sécurité */}
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-3">Sécurité</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {VILLA_EQUIPMENTS.security.map(s => {
                                                    const Icon = IconMap[s.icon] || Shield
                                                    return (
                                                        <label key={s.id} className="cursor-pointer group">
                                                            <input type="checkbox" value={s.id} {...register("securityFeatures")} className="peer sr-only" />
                                                            <div className="flex flex-col items-center gap-2 p-3 border-2 border-gray-200 rounded-xl hover:border-[#00BFA6] peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 peer-checked:text-[#00BFA6] transition-all bg-white h-24">
                                                                <div className="h-7 flex items-center justify-center">
                                                                    <Icon className="h-6 w-6 text-gray-400 group-hover:text-gray-600 peer-checked:text-[#00BFA6]" />
                                                                </div>
                                                                <div className="min-h-[32px] flex items-center justify-center">
                                                                    <span className="text-xs font-bold text-center leading-tight text-gray-700 peer-checked:text-[#00BFA6]">{s.label}</span>
                                                                </div>
                                                            </div>
                                                        </label>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        {/* Connectivité */}
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-3">Connectivité</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {VILLA_EQUIPMENTS.connectivity.map(c => {
                                                    const Icon = IconMap[c.icon] || Wifi
                                                    return (
                                                        <label key={c.id} className="cursor-pointer group">
                                                            <input type="checkbox" value={c.id} {...register("connectivity")} className="peer sr-only" />
                                                            <div className="flex flex-col items-center gap-2 p-3 border-2 border-gray-200 rounded-xl hover:border-[#00BFA6] peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 peer-checked:text-[#00BFA6] transition-all bg-white h-24">
                                                                <div className="h-7 flex items-center justify-center">
                                                                    <Icon className="h-6 w-6 text-gray-400 group-hover:text-gray-600 peer-checked:text-[#00BFA6]" />
                                                                </div>
                                                                <div className="min-h-[32px] flex items-center justify-center">
                                                                    <span className="text-xs font-bold text-center leading-tight text-gray-700 peer-checked:text-[#00BFA6]">{c.label}</span>
                                                                </div>
                                                            </div>
                                                        </label>
                                                    )
                                                })}
                                            </div>
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
                                        {errors.waterCounter && <p className="text-red-500 text-sm mt-1">{errors.waterCounter.message}</p>}
                                    </div>
                                    {/* Électricité */}
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <h4 className="font-bold mb-3 flex items-center gap-2 text-gray-900"><Zap className="w-4 h-4 text-yellow-500"/> Électricité</h4>
                                        <div className="flex flex-col gap-2">
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900"><input type="radio" value="INDIVIDUEL" {...register("elecCounter")} className="accent-[#00BFA6] w-4 h-4"/> Compteur Individuel</label>
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900"><input type="radio" value="COMMUN" {...register("elecCounter")} className="accent-[#00BFA6] w-4 h-4"/> Compteur Commun</label>
                                        </div>
                                        {errors.elecCounter && <p className="text-red-500 text-sm mt-1">{errors.elecCounter.message}</p>}
                                    </div>
                                    {/* Gaz */}
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <h4 className="font-bold mb-3 flex items-center gap-2 text-gray-900"><Flame className="w-4 h-4 text-orange-500"/> Gaz</h4>
                                        <div className="flex flex-col gap-2">
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900"><input type="radio" value="INDIVIDUEL" {...register("gasCounter")} className="accent-[#00BFA6] w-4 h-4"/> Compteur Individuel</label>
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900"><input type="radio" value="COMMUN" {...register("gasCounter")} className="accent-[#00BFA6] w-4 h-4"/> Compteur Commun</label>
                                        </div>
                                        {errors.gasCounter && <p className="text-red-500 text-sm mt-1">{errors.gasCounter.message}</p>}
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
                                            min="0"
                                            onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
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
                                            min="0"
                                            onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
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
                                            onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
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
                                            onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
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
                                                min="0"
                                                onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
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
                                                min="0"
                                                onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
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
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
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
                                                        <div className="p-2 border-2 rounded-xl flex flex-col items-center justify-center gap-1 peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 peer-checked:text-[#00BFA6] transition-all hover:border-gray-400 bg-gray-50 h-24">
                                                            <div className="flex-1 flex items-end justify-center pb-2">
                                                                <Icon className="h-6 w-6 text-gray-500 peer-checked:text-[#00BFA6]" />
                                                            </div>
                                                            <div className="flex-1 flex items-start justify-center pt-0">
                                                                <span className="text-[10px] md:text-[11px] font-bold text-gray-600 peer-checked:text-[#00BFA6] text-center leading-tight">{item.label}</span>
                                                            </div>
                                                        </div>
                                                    </label>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Extérieur */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-bold text-gray-700 mb-3">Extérieur</label>
                                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
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
                                                        <div className="p-2 border-2 rounded-xl flex flex-col items-center justify-center gap-1 peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 peer-checked:text-[#00BFA6] transition-all hover:border-gray-400 bg-gray-50 h-24">
                                                            <div className="flex-1 flex items-end justify-center pb-2">
                                                                <Icon className="h-6 w-6 text-gray-500 peer-checked:text-[#00BFA6]" />
                                                            </div>
                                                            <div className="flex-1 flex items-start justify-center pt-0">
                                                                <span className="text-[10px] md:text-[11px] font-bold text-gray-600 peer-checked:text-[#00BFA6] text-center leading-tight">{item.label}</span>
                                                            </div>
                                                        </div>
                                                    </label>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Eau/Énergie */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-bold text-gray-700 mb-3">Eau/Énergie</label>
                                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
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
                                                        <div className="p-2 border-2 rounded-xl flex flex-col items-center justify-center gap-1 peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 peer-checked:text-[#00BFA6] transition-all hover:border-gray-400 bg-gray-50 h-24">
                                                            <div className="flex-1 flex items-end justify-center pb-2">
                                                                <Icon className="h-6 w-6 text-gray-500 peer-checked:text-[#00BFA6]" />
                                                            </div>
                                                            <div className="flex-1 flex items-start justify-center pt-0">
                                                                <span className="text-[10px] md:text-[11px] font-bold text-gray-600 peer-checked:text-[#00BFA6] text-center leading-tight">{item.label}</span>
                                                            </div>
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
                                                        min="0"
                                                        onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                        placeholder="Nombre de véhicules"
                                                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all bg-gray-50 focus:bg-white" 
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Prix & Modalités */}
                    {currentStep === 5 && (
                        <div className="w-full max-w-2xl animate-fade-in">
                            <div className="space-y-8">
                                {/* Prix & Unité */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Prix</h3>
                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                                {transactionType === 'RENTAL' ? "Loyer mensuel" : "Montant"}
                                            </label>
                                            <div className="flex flex-col md:flex-row gap-4">
                                                <div className="relative flex-1">
                                                    <input 
                                                        {...register("price")} 
                                                        type="text"
                                                        onChange={(e) => {
                                                            const val = e.target.value.replace(/[^0-9]/g, '');
                                                            const formatted = val.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                                                            setValue("price", formatted, { shouldValidate: true });
                                                        }}
                                                        className="w-full p-4 pr-32 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all text-gray-900 bg-white font-bold text-lg" 
                                                        placeholder="0"
                                                    />
                                                    <div className="absolute right-2 top-2 bottom-2 flex items-center bg-gray-100 rounded-lg px-2">
                                                        <select 
                                                            value={currentPriceUnit}
                                                            onChange={(e) => handlePriceUnitChange(e.target.value as any)}
                                                            className="bg-transparent border-none focus:ring-0 text-gray-700 font-bold text-sm cursor-pointer outline-none"
                                                        >
                                                            <option value="DA">DA</option>
                                                            <option value="MILLION">Millions</option>
                                                            <option value="MILLIARD">Milliards</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                
                                                {/* Type de prix - Inline */}
                                                <div className="flex gap-2">
                                                    <label className="cursor-pointer">
                                                        <input type="radio" value="FIXED" {...register("priceType")} className="peer sr-only" />
                                                        <div className="h-full px-6 flex items-center justify-center border-2 rounded-xl font-bold text-gray-600 peer-checked:border-[#00BFA6] peer-checked:text-[#00BFA6] peer-checked:bg-green-50 transition-all hover:border-gray-300 bg-white min-w-[100px]">
                                                            Fixe
                                                        </div>
                                                    </label>
                                                    <label className="cursor-pointer">
                                                        <input type="radio" value="NEGOTIABLE" {...register("priceType")} className="peer sr-only" />
                                                        <div className="h-full px-6 flex items-center justify-center border-2 rounded-xl font-bold text-gray-600 peer-checked:border-[#00BFA6] peer-checked:text-[#00BFA6] peer-checked:bg-green-50 transition-all hover:border-gray-300 bg-white min-w-[120px]">
                                                            Négociable
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>
                                            {priceCentimes && (
                                                <p className="text-[#00BFA6] text-sm mt-2 font-medium flex items-center gap-1">
                                                    <Info className="h-4 w-4" /> {priceCentimes}
                                                </p>
                                            )}
                                            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Conditions de Location (Moved from Step 4) */}
                                {transactionType === 'RENTAL' && (
                                    <section className="space-y-6 pt-6 border-t">
                                        <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                            <FileText className="text-[#00BFA6]" /> Conditions de Location
                                        </h2>
                                        <div className="space-y-6">
                                            {/* Caution & Charges & Disponibilité Group */}
                                            <div className="flex flex-col gap-6">
                                                <div className="flex items-end gap-4 flex-wrap md:flex-nowrap">
                                                    {/* Caution */}
                                                    <div className="w-32 flex-shrink-0">
                                                        <label className="block text-sm font-bold text-gray-900 mb-2">Caution (Mois)</label>
                                                        <input 
                                                            {...register("depositMonths")} 
                                                            type="number" 
                                                            min="0"
                                                            onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                            className="w-full p-3 border-2 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900" 
                                                            placeholder="1" 
                                                        />
                                                    </div>
                                                    
                                                    {/* Charges */}
                                                    <div className="flex-shrink-0">
                                                         <label className="flex items-center gap-3 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-[#00BFA6] transition-colors bg-white group h-[52px]">
                                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 group-hover:bg-[#00BFA6]/10 text-gray-500 group-hover:text-[#00BFA6] transition-colors">
                                                                <Zap className="w-4 h-4" />
                                                            </div>
                                                            <input type="checkbox" {...register("chargesIncluded")} className="accent-[#00BFA6] w-5 h-5" />
                                                            <span className="font-bold text-gray-900 text-sm">Charges Comprises</span>
                                                        </label>
                                                    </div>

                                                    {/* Disponibilité */}
                                                    <div className="flex-1 relative">
                                                        <label className="block text-sm font-bold text-gray-900 mb-2">Disponibilité</label>
                                                        <div className="flex gap-4">
                                                            <label className="flex items-center gap-2 cursor-pointer bg-white border-2 border-gray-200 p-3 rounded-xl hover:border-[#00BFA6] transition-colors flex-1 justify-center group h-[52px]">
                                                                <input type="radio" name="availabilityMode" value="IMMEDIATE" checked={availabilityMode === 'IMMEDIATE'} onChange={() => { setAvailabilityMode('IMMEDIATE'); setIsCalendarOpen(false); }} className="accent-[#00BFA6] w-4 h-4" />
                                                                <span className="text-gray-900 font-bold text-sm group-hover:text-[#00BFA6]">Immédiate</span>
                                                            </label>
                                                            <label className="flex items-center gap-2 cursor-pointer bg-white border-2 border-gray-200 p-3 rounded-xl hover:border-[#00BFA6] transition-colors flex-1 justify-center group h-[52px]" onClick={() => { if (availabilityMode === 'DATE') setIsCalendarOpen(!isCalendarOpen); }}>
                                                                <input type="radio" name="availabilityMode" value="DATE" checked={availabilityMode === 'DATE'} onChange={() => { setAvailabilityMode('DATE'); setIsCalendarOpen(true); }} className="accent-[#00BFA6] w-4 h-4" />
                                                                <span className="text-gray-900 font-bold text-sm group-hover:text-[#00BFA6]">
                                                                    {availabilityMode === 'DATE' && availableDate ? format(new Date(availableDate), "dd MMM yyyy", { locale: fr }) : "Date précise"}
                                                                </span>
                                                            </label>
                                                        </div>
                                                        {errors.availableDate && <p className="text-red-500 text-sm mt-1">{errors.availableDate.message}</p>}

                                                        {/* Calendar Popover */}
                                                        {availabilityMode === 'DATE' && isCalendarOpen && (
                                                            <div className="absolute right-0 top-full mt-2 z-[100] animate-fade-in">
                                                                <div className="bg-white shadow-2xl rounded-xl p-4 border border-gray-200 relative">
                                                                    <button type="button" onClick={() => setIsCalendarOpen(false)} className="absolute top-2 right-2 p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-colors">
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                    <div className="pt-2">
                                                                        <InlineCalendar 
                                                                            value={availableDate ? new Date(availableDate) : undefined}
                                                                            onChange={(date) => {
                                                                                setValue("availableDate", format(date, "yyyy-MM-dd"), { shouldValidate: true });
                                                                                setIsCalendarOpen(false);
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {errors.depositMonths && <p className="text-red-500 text-sm mt-1">{errors.depositMonths.message}</p>}
                                            </div>

                                            {/* Usage Autorisé - Card Style */}
                                            <div>
                                                <label className="block text-sm font-bold text-gray-900 mb-3">Usage Autorisé</label>
                                                <div className="flex gap-4 flex-wrap">
                                                    <label className="cursor-pointer">
                                                        <input 
                                                            type="radio" 
                                                            name="usage_selection"
                                                            className="peer sr-only"
                                                            checked={watch("rentalUsage")?.length === 1 && watch("rentalUsage")?.includes("HABITATION")}
                                                            onChange={() => setValue("rentalUsage", ["HABITATION"])}
                                                        />
                                                        <div className="px-6 py-3 border-2 rounded-xl font-medium text-gray-600 peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 peer-checked:text-[#00BFA6] transition-all hover:border-gray-400 bg-gray-50">
                                                            Habitation uniquement
                                                        </div>
                                                    </label>

                                                    <label className="cursor-pointer">
                                                        <input 
                                                            type="radio" 
                                                            name="usage_selection"
                                                            className="peer sr-only"
                                                            checked={watch("rentalUsage")?.length === 1 && watch("rentalUsage")?.includes("PROFESSIONNEL")}
                                                            onChange={() => setValue("rentalUsage", ["PROFESSIONNEL"])}
                                                        />
                                                        <div className="px-6 py-3 border-2 rounded-xl font-medium text-gray-600 peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 peer-checked:text-[#00BFA6] transition-all hover:border-gray-400 bg-gray-50">
                                                            Bureau / Professionnel
                                                        </div>
                                                    </label>

                                                    <label className="cursor-pointer">
                                                        <input 
                                                            type="radio" 
                                                            name="usage_selection"
                                                            className="peer sr-only"
                                                            checked={watch("rentalUsage")?.length === 2}
                                                            onChange={() => setValue("rentalUsage", ["HABITATION", "PROFESSIONNEL"])}
                                                        />
                                                        <div className="px-6 py-3 border-2 rounded-xl font-medium text-gray-600 peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 peer-checked:text-[#00BFA6] transition-all hover:border-gray-400 bg-gray-50">
                                                            Les deux
                                                        </div>
                                                    </label>
                                                </div>
                                                {errors.rentalUsage && <p className="text-red-500 text-sm mt-1">{errors.rentalUsage.message}</p>}
                                            </div>
                                        </div>
                                    </section>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 6: Informations et Contact */}
                    {currentStep === 6 && (
                        <div className="w-full max-w-4xl animate-fade-in">
                            <div className="space-y-8">
                                {/* Informations de l'annonce */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <FileText className="text-[#00BFA6]" /> Informations de l'annonce
                                    </h3>
                                    
                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                                Titre accrocheur <span className="text-gray-400 font-normal">(Optionnel)</span>
                                            </label>
                                            <input 
                                                type="text" 
                                                {...register("title")}
                                                placeholder="Ex: Magnifique villa avec piscine vue sur mer..." 
                                                className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all text-gray-900 placeholder:text-gray-500 bg-white font-medium"
                                            />
                                            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                                Description courte <span className="text-gray-400 font-normal">(Optionnel)</span>
                                            </label>
                                            <textarea 
                                                {...register("shortDescription")}
                                                rows={4}
                                                placeholder="Décrivez brièvement les points forts de votre bien..." 
                                                className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all text-gray-900 placeholder:text-gray-500 bg-white resize-none font-medium"
                                            ></textarea>
                                            {errors.shortDescription && <p className="text-red-500 text-sm mt-1">{errors.shortDescription.message}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Contacts */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <Phone className="text-[#00BFA6]" /> Contacts
                                    </h3>
                                    <p className="text-gray-600 mb-4 text-sm">
                                        Ajoutez les numéros de téléphone sur lesquels les clients peuvent vous contacter.
                                    </p>

                                    {/* Option to use profile phone if not already used */}
                                    {userProfilePhone && contacts[0]?.phone !== userProfilePhone && (
                                        <div className="mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center justify-between animate-fade-in">
                                            <div>
                                                <p className="font-bold text-blue-900 text-sm">Numéro de votre profil ({userProfilePhone})</p>
                                                <p className="text-blue-700 text-xs">Voulez-vous utiliser ce numéro pour cette annonce ?</p>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    const newContacts = [...contacts]
                                                    newContacts[0] = { ...newContacts[0], phone: userProfilePhone }
                                                    setContacts(newContacts)
                                                }}
                                                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors shadow-sm"
                                            >
                                                Utiliser
                                            </button>
                                        </div>
                                    )}
                                    
                                    <div className="space-y-4">
                                        {contacts.map((contact, index) => (
                                            <div key={index} className="bg-gray-50 p-6 rounded-xl border border-gray-200 relative flex flex-col md:flex-row gap-6 items-start">
                                                {contacts.length > 1 && (
                                                    <button 
                                                        onClick={() => removeContact(index)}
                                                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors z-10"
                                                    >
                                                        <X className="h-5 w-5" />
                                                    </button>
                                                )}
                                                
                                                <div className="flex-1 w-full">
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                                        {index === 0 ? "Numéro principal" : "Autre numéro"}
                                                    </label>
                                                    <div className="relative">
                                                        <PhoneInput
                                                            country={'dz'}
                                                            value={contact.phone}
                                                            onChange={(phone) => updateContact(index, 'phone', phone)}
                                                            enableSearch={true}
                                                            containerClass="!w-full"
                                                            inputClass="!w-full !h-[58px] !pl-[60px] !pr-4 !py-4 !border-gray-300 !rounded-xl focus:!ring-2 focus:!ring-[#00BFA6] !bg-white !text-gray-900 !font-bold !text-base !outline-none"
                                                            buttonClass="!border-gray-300 !rounded-l-xl !bg-white !hover:bg-gray-50 !pl-2 !w-[50px]"
                                                            dropdownClass="!shadow-xl !rounded-xl !border-gray-200 !mt-2 !z-50 !bg-white !text-gray-900"
                                                            searchClass="!p-2 !border-b !border-gray-100 !bg-white !text-gray-900"
                                                            placeholder="550..."
                                                        />
                                                    </div>
                                                    {index === 0 && userProfilePhone && contact.phone === userProfilePhone && (
                                                        <div className="mt-2 flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded-lg text-xs font-bold border border-green-100">
                                                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                                            Numéro de profil utilisé
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="flex gap-4 flex-wrap pt-8">
                                                    <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded-lg border border-gray-200 hover:border-[#25D366] transition-colors">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={contact.hasWhatsapp}
                                                            onChange={(e) => updateContact(index, 'hasWhatsapp', e.target.checked)}
                                                            className="accent-[#25D366] w-4 h-4" 
                                                        />
                                                        <span className="font-medium text-gray-700 text-sm">WhatsApp</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded-lg border border-gray-200 hover:border-[#7360f2] transition-colors">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={contact.hasViber}
                                                            onChange={(e) => updateContact(index, 'hasViber', e.target.checked)}
                                                            className="accent-[#7360f2] w-4 h-4" 
                                                        />
                                                        <span className="font-medium text-gray-700 text-sm">Viber</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded-lg border border-gray-200 hover:border-[#0088cc] transition-colors">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={contact.hasTelegram}
                                                            onChange={(e) => updateContact(index, 'hasTelegram', e.target.checked)}
                                                            className="accent-[#0088cc] w-4 h-4" 
                                                        />
                                                        <span className="font-medium text-gray-700 text-sm">Telegram</span>
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        <Button 
                                            onClick={addContact}
                                            variant="outline"
                                            className="w-full py-4 border-dashed border-2 border-gray-300 text-gray-500 hover:border-[#00BFA6] hover:text-[#00BFA6]"
                                        >
                                            + Ajouter un autre numéro
                                        </Button>
                                    </div>
                                </div>

                                {/* Localisation */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <MapPin className="text-[#00BFA6]" /> Localisation
                                    </h3>
                                    <div className="space-y-6 bg-gray-50 p-6 rounded-xl border border-gray-200">
                                        {/* Wilaya, Commune, Quartier - Inline */}
                                        <div className="flex flex-col md:flex-row gap-4">
                                            <div className="flex-1">
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Wilaya</label>
                                                <select {...register("city")} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all text-gray-900 bg-white">
                                                    <option value="">Sélectionner...</option>
                                                    {WILAYAS.map((wilaya) => (
                                                        <option key={wilaya.id} value={wilaya.name}>{wilaya.code} - {wilaya.name}</option>
                                                    ))}
                                                </select>
                                                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
                                            </div>

                                            <div className="flex-1">
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Commune</label>
                                                <select {...register("commune")} disabled={!selectedCity} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all text-gray-900 bg-white disabled:bg-gray-100 disabled:text-gray-400">
                                                    <option value="">Sélectionner...</option>
                                                    {filteredCommunes.map((commune) => (
                                                        <option key={commune.id} value={commune.name}>{commune.name}</option>
                                                    ))}
                                                </select>
                                                {errors.commune && <p className="text-red-500 text-sm mt-1">{errors.commune.message}</p>}
                                            </div>

                                            <div className="flex-[2]">
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Quartier (Adresse)</label>
                                                <input {...register("address")} type="text" className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all text-gray-900 bg-white" placeholder="Nom du quartier, rue..." />
                                                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Lien Google Maps (Optionnel)</label>
                                            <input 
                                                {...register("mapsLink")} 
                                                type="url" 
                                                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all text-gray-900 bg-white" 
                                                placeholder="https://maps.google.com/..." 
                                            />
                                            {errors.mapsLink && <p className="text-red-500 text-sm mt-1">{errors.mapsLink.message}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 7: Photos du bien */}
                    {currentStep === 7 && (
                        <div className="w-full max-w-4xl animate-fade-in">
                            {photoOrganizationStep === "upload" ? (
                                /* Étape 1: Upload brut */
                                <div className="space-y-8">
                                    
                                    {/* SECTION PHOTOS */}
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                            <ImageIcon className="text-[#00BFA6]" /> Photos
                                        </h3>
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative bg-gray-50 mb-6">
                                            <input 
                                                type="file" 
                                                multiple 
                                                accept="image/*" 
                                                onChange={onFileChange} 
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                            />
                                            <Upload className="h-10 w-10 text-[#00BFA6] mx-auto mb-3" />
                                            <p className="text-gray-600 mb-1 font-medium">
                                                {selectedFiles.length > 0 
                                                    ? `${selectedFiles.length} photo(s) sélectionnée(s)` 
                                                    : "Ajouter des photos"}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                JPG, PNG (max 10MB)
                                            </p>
                                        </div>

                                        {selectedFiles.length > 0 && (
                                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                                {selectedFiles.map((file, idx) => (
                                                    <div key={idx} className={cn(
                                                        "relative aspect-square bg-gray-100 rounded-lg overflow-hidden group border-2 transition-all",
                                                        mainPhoto === file ? "border-[#00BFA6] ring-2 ring-[#00BFA6] ring-offset-2" : "border-gray-200"
                                                    )}>
                                                        <img 
                                                            src={URL.createObjectURL(file)} 
                                                            alt={`preview-${idx}`} 
                                                            className="w-full h-full object-cover" 
                                                        />
                                                        
                                                        {/* Actions Overlay */}
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                                                            <button 
                                                                onClick={() => setMainPhoto(file)}
                                                                className={cn(
                                                                    "px-2 py-1 rounded-md text-[10px] font-bold w-full transition-colors",
                                                                    mainPhoto === file ? "bg-[#00BFA6] text-white" : "bg-white text-gray-900 hover:bg-gray-100"
                                                                )}
                                                            >
                                                                {mainPhoto === file ? "Couverture" : "Définir couverture"}
                                                            </button>
                                                            
                                                            <div className="flex gap-2 w-full">
                                                                <button 
                                                                    onClick={() => rotateImage(file)}
                                                                    className="flex-1 bg-white/20 hover:bg-white/40 text-white rounded-lg p-1.5 flex items-center justify-center transition-colors"
                                                                    title="Pivoter"
                                                                >
                                                                    <RotateCw className="h-3 w-3" />
                                                                </button>
                                                                <button 
                                                                    onClick={() => removeFile(idx)}
                                                                    className="flex-1 bg-red-500/80 hover:bg-red-600 text-white rounded-lg p-1.5 flex items-center justify-center transition-colors"
                                                                    title="Supprimer"
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        
                                                        {mainPhoto === file && (
                                                            <div className="absolute top-2 left-2 bg-[#00BFA6] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                                                PRINCIPALE
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* SECTION VIDEOS */}
                                    <div className="pt-6 border-t border-gray-100">
                                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                            <VideoIcon className="text-[#00BFA6]" /> Vidéos (Optionnel)
                                        </h3>
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative bg-gray-50 mb-6">
                                            <input 
                                                type="file" 
                                                multiple 
                                                accept="video/*" 
                                                onChange={onVideoChange} 
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                            />
                                            <VideoIcon className="h-10 w-10 text-[#00BFA6] mx-auto mb-3" />
                                            <p className="text-gray-600 mb-1 font-medium">
                                                {selectedVideos.length > 0 
                                                    ? `${selectedVideos.length} vidéo(s) sélectionnée(s)` 
                                                    : "Ajouter une vidéo"}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                MP4, MOV (max 50MB) - Max 2 vidéos
                                            </p>
                                        </div>

                                        {selectedVideos.length > 0 && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {selectedVideos.map((file, idx) => (
                                                    <div key={idx} className="relative bg-black rounded-lg overflow-hidden border border-gray-200 aspect-video group">
                                                        <video 
                                                            src={URL.createObjectURL(file)} 
                                                            className="w-full h-full object-contain"
                                                            controls
                                                        />
                                                        <button 
                                                            onClick={() => removeVideo(idx)}
                                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                                            {(file.size / (1024 * 1024)).toFixed(1)} MB
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-8">
                                        <Button 
                                            onClick={proceedToPhotoOrganization}
                                            disabled={selectedFiles.length < 3}
                                            className="w-full bg-[#00BFA6] hover:bg-[#00908A] text-white rounded-xl py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Continuer vers l'organisation
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                /* Étape 2: Organisation par catégorie */
                                <div className="space-y-8">
                                    <p className="text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                        Sélectionnez une ou plusieurs photos en cliquant dessus, puis utilisez les boutons pour les déplacer, ou glissez-déposez les directement.
                                    </p>

                                    <DragDropContext onDragEnd={handleDragEnd}>
                                        {photoCategories.map((category) => (
                                            <div key={category.id} className="border rounded-xl p-6 bg-gray-50">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <category.icon className="h-6 w-6 text-[#00BFA6]" />
                                                    <h3 className="text-lg font-bold text-gray-700">{category.label}</h3>
                                                    <span className="text-sm text-gray-500 ml-auto bg-white px-3 py-1 rounded-full border border-gray-200">
                                                        {category.photos.length} photo(s)
                                                    </span>
                                                </div>

                                                <Droppable droppableId={category.id} direction="horizontal">
                                                    {(provided) => (
                                                        <div 
                                                            ref={provided.innerRef}
                                                            {...provided.droppableProps}
                                                            className="grid grid-cols-2 md:grid-cols-4 gap-4 min-h-[120px]"
                                                        >
                                                            {category.photos.map((photo, index) => {
                                                                const isSelected = selectedPhotos.includes(photo);
                                                                return (
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
                                                                                onClick={() => togglePhotoSelection(photo)}
                                                                                className={cn(
                                                                                    "relative aspect-square bg-white rounded-lg overflow-hidden group cursor-move transition-all",
                                                                                    isSelected ? "border-4 border-[#00BFA6] ring-2 ring-[#00BFA6]/20 shadow-lg" : "border-2 border-gray-200 hover:border-[#00BFA6]"
                                                                                )}
                                                                            >
                                                                                <img 
                                                                                    src={URL.createObjectURL(photo)} 
                                                                                    alt={`${category.label}-${index}`} 
                                                                                    className={cn("w-full h-full object-cover transition-all", isSelected ? "scale-95 rounded-sm" : "")} 
                                                                                />
                                                                                {isSelected && (
                                                                                    <div className="absolute top-2 right-2 bg-[#00BFA6] text-white rounded-full p-1 z-10 shadow-md">
                                                                                        <Check className="h-4 w-4" />
                                                                                    </div>
                                                                                )}
                                                                                {!isSelected && (
                                                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                                        <GripVertical className="h-6 w-6 text-white" />
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </Draggable>
                                                                )
                                                            })}
                                                            {provided.placeholder}
                                                        </div>
                                                    )}
                                                </Droppable>

                                                {/* Menu pour déplacer vers d'autres catégories */}
                                                {category.photos.length > 0 && selectedPhotos.some(p => category.photos.includes(p)) && (
                                                    <div className="mt-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                                                        <p className="text-sm font-bold text-gray-700 mb-3">Déplacer la sélection vers :</p>
                                                        <div className="flex gap-2 flex-wrap">
                                                            {photoCategories
                                                                .filter(c => c.id !== category.id)
                                                                .map(targetCat => (
                                                                    <button
                                                                        key={targetCat.id}
                                                                        onClick={() => moveSelectedPhotos(targetCat.id)}
                                                                        className="text-sm px-4 py-2 bg-gray-50 border border-gray-300 rounded-full text-gray-800 hover:bg-[#00BFA6] hover:text-white hover:border-[#00BFA6] transition-all font-bold"
                                                                    >
                                                                        {targetCat.label}
                                                                    </button>
                                                                ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </DragDropContext>

                                    <div className="flex justify-between pt-4">
                                        <Button 
                                            onClick={() => setPhotoOrganizationStep("upload")}
                                            variant="outline"
                                            className="px-8 py-3 border-gray-300 text-gray-600 hover:bg-gray-50"
                                        >
                                            Retour à l&apos;upload
                                        </Button>
                                        <Button 
                                            onClick={handleSubmit(onSubmit as any, (errors) => {
                                                console.error("Erreurs de validation:", errors);
                                                alert(`Veuillez corriger les erreurs suivantes:\n${Object.keys(errors).map(key => `- ${key}: ${(errors as any)[key]?.message}`).join('\n')}`);
                                            })} 
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
                    </>
                    )}
                </div>

                {/* Footer Actions */}
                {isFormAvailable && currentStep >= 4 && currentStep <= 7 && (
                    <div className="p-8 border-t border-gray-100 flex justify-end items-center bg-gray-50/50">
                        {currentStep === 4 && (
                        <Button onClick={handleDescriptiveSubmit} className="bg-[#00BFA6] hover:bg-[#00908A] text-white rounded-full px-8 py-6 text-lg font-bold shadow-lg shadow-[#00BFA6]/20 transition-all">
                            Continuer
                        </Button>
                    )}
                    {currentStep === 5 && (
                        <Button onClick={handlePriceSubmit} className="bg-[#00BFA6] hover:bg-[#00908A] text-white rounded-full px-8 py-6 text-lg font-bold shadow-lg shadow-[#00BFA6]/20 transition-all">
                            Continuer
                        </Button>
                    )}
                    {currentStep === 6 && (
                        <Button onClick={handleLocationAndContactsSubmit} className="bg-[#00BFA6] hover:bg-[#00908A] text-white rounded-full px-8 py-6 text-lg font-bold shadow-lg shadow-[#00BFA6]/20 transition-all">
                            Continuer
                        </Button>
                    )}
                    {currentStep === 7 && photoOrganizationStep === "upload" && selectedFiles.length >= 3 && (
                        <Button onClick={proceedToPhotoOrganization} className="bg-[#00BFA6] hover:bg-[#00908A] text-white rounded-full px-8 py-6 text-lg font-bold shadow-lg shadow-[#00BFA6]/20 transition-all">
                            Organiser les photos
                        </Button>
                    )}
                    </div>
                )}
            </div>
        </div>
    </div>
  )
}
