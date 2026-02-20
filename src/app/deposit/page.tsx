"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { 
  Check, Upload, Building2, Warehouse, Home, Key, Building, Store, Hotel, 
  Briefcase, BedDouble, PartyPopper, Factory, Tent, X, Flower2, Cctv, Sun, 
  Waves, Car, Wind, Archive, ParkingCircle, DoorOpen, Trees, Landmark, 
  CalendarDays, Users, Box, Hotel as HotelIcon,
  LayoutGrid, Layers, Warehouse as WarehouseIcon, ThermometerSnowflake,
  Truck, PenTool, Mic, Utensils, Coffee, Globe, Star, Sparkles,
  Mountain, Palmtree, Wifi, Dumbbell, Shield, Share2,
  ArrowLeftRight, Heart, Clock, GraduationCap, Stethoscope, ShoppingBag,
  HeartPulse, School, Church, Footprints, Dog, Bike, Lock, Eye,
  Battery, Droplet, Flame, Snowflake, Fan, CookingPot,
  Bath, Sofa, Armchair, Table, Lamp, Bed,
  Ruler, MapPin, Navigation, Compass, Camera, Video, Speaker,
  Microscope, FlaskConical, Atom, Leaf, Flower, Cloud, CloudRain, CloudSun,
  Moon, Stars, Sunset, Sunrise, Wind as WindIcon, Umbrella
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { WILAYAS } from "@/data/wilayas"
import { COMMUNES } from "@/data/communes"
import { AMENITIES_DATA } from "@/data/amenities"

// Icon mapping avec des icônes variées (noms corrigés)
const IconMap: Record<string, any> = {
  // Icônes de base
  Home, Building, Building2, Warehouse, Hotel, Briefcase, Store, BedDouble, 
  PartyPopper, Factory, Tent, Archive, ParkingCircle, DoorOpen,
  
  // Icônes résidentielles
  Villa: Home,
  VillaLevel: Layers,
  Apartment: Building,
  Duplex: LayoutGrid,
  Triplex: Layers,
  ApartmentBuilding: Building2,
  Studio: Home,
  ResidentialLand: Trees,
  
  // Icônes industrielles
  Hangar: WarehouseIcon,
  Usine: Factory,
  ChambreFroide: ThermometerSnowflake,
  TerrainIndustriel: Landmark,
  CoStockage: Archive,
  
  // Icônes évènementielles
  SalleFormation: Users,
  SalleConference: Mic,
  SalleDiner: Utensils,
  SalleFetes: PartyPopper,
  
  // Icônes hôtelières
  TerrainHotel: Palmtree,
  HotelEtoile: Star,
  StructureHoteliere: HotelIcon,
  
  // Icônes bureaux et commerces
  CentreAffaires: Building2,
  Coworking: Users,
  BureauFlexible: Briefcase,
  ImmeubleBureaux: Building,
  Showroom: Store,
  VillaBureau: Home,
  NiveauVillaBureau: Layers,
  AppartementBureau: Building,
  LocalCommercial: Store,
  
  // Icônes hébergement
  HebergementEtoile: Star,
  HebergementSansEtoile: Hotel,
  ComplexeEtoile: Sparkles,
  ComplexeSansEtoile: Trees,
  
  // Icônes supplémentaires
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
  Evier: Bath,  // Remplacé Sink par Bath
  Baignoire: Bath,
  Douche: Bath,  // Remplacé Shower par Bath
  Canape: Sofa,
  Fauteuil: Armchair,
  Table: Table,
  Lampe: Lamp,
  Lit: Bed,
  Armoire: Sofa,  // Remplacé Cabinet par Sofa
  Regle: Ruler,
  Carte: MapPin,
  Navigation: Navigation,
  Boussole: Compass,
  Camera: Camera,
  Video: Video,
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

// Types d'immobilier
const REAL_ESTATE_CATEGORIES = [
  { id: "residential", label: "Immobilier Résidentiel", iconName: "Home" },
  { id: "industrial", label: "Immobilier Industriel", iconName: "Factory" },
  { id: "event", label: "Immobilier Évènementiel", iconName: "PartyPopper" },
  { id: "hotel", label: "Immobilier Hôtelier", iconName: "Hotel" },
  { id: "office", label: "Bureaux et Commerces", iconName: "Briefcase" },
  { id: "accommodation", label: "Hébergement et Séjours", iconName: "BedDouble" },
]

// Types de biens par catégorie avec icônes variées
const PROPERTY_TYPES = [
  // Immobilier Résidentiel
  { id: "villa", label: "Villa", categoryId: "residential", iconName: "Villa" },
  { id: "villa-level", label: "Niveau de villa", categoryId: "residential", iconName: "VillaLevel" },
  { id: "apartment", label: "Appartement", categoryId: "residential", iconName: "Apartment" },
  { id: "duplex", label: "Duplex", categoryId: "residential", iconName: "Duplex" },
  { id: "triplex", label: "Triplex", categoryId: "residential", iconName: "Triplex" },
  { id: "apartment-building", label: "Immeuble d'appartements", categoryId: "residential", iconName: "ApartmentBuilding" },
  { id: "studio", label: "Studio", categoryId: "residential", iconName: "Studio" },
  { id: "residential-land", label: "Terrain résidentiel", categoryId: "residential", iconName: "ResidentialLand" },

  // Immobilier Industriel
  { id: "warehouse", label: "Hangar", categoryId: "industrial", iconName: "Hangar" },
  { id: "factory", label: "Usine", categoryId: "industrial", iconName: "Usine" },
  { id: "cold-room", label: "Chambre froide", categoryId: "industrial", iconName: "ChambreFroide" },
  { id: "industrial-land", label: "Terrain industriel", categoryId: "industrial", iconName: "TerrainIndustriel" },
  { id: "co-storage", label: "Co-stockage et entreposage", categoryId: "industrial", iconName: "CoStockage" },

  // Immobilier Évènementiel
  { id: "training-room", label: "Salle de formation", categoryId: "event", iconName: "SalleFormation" },
  { id: "conference-room", label: "Salle de conférence", categoryId: "event", iconName: "SalleConference" },
  { id: "dining-room", label: "Salle de dîner", categoryId: "event", iconName: "SalleDiner" },
  { id: "party-room", label: "Salle des fêtes", categoryId: "event", iconName: "SalleFetes" },

  // Immobilier Hôtelier
  { id: "hotel-land", label: "Terrain hôtelier", categoryId: "hotel", iconName: "TerrainHotel" },
  { id: "hotel", label: "Hôtel", categoryId: "hotel", iconName: "HotelEtoile" },
  { id: "other-hotel", label: "Autre structure hôtelière", categoryId: "hotel", iconName: "StructureHoteliere" },

  // Bureaux et Commerces
  { id: "business-center", label: "Centre d'affaires", categoryId: "office", iconName: "CentreAffaires" },
  { id: "coworking", label: "Espace co-working", categoryId: "office", iconName: "Coworking" },
  { id: "flex-office", label: "Bureau flexible", categoryId: "office", iconName: "BureauFlexible" },
  { id: "office-building", label: "Immeuble de bureaux", categoryId: "office", iconName: "ImmeubleBureaux" },
  { id: "showroom", label: "Showroom", categoryId: "office", iconName: "Showroom" },
  { id: "office-villa", label: "Villa", categoryId: "office", iconName: "VillaBureau" },
  { id: "office-villa-level", label: "Niveau de villa", categoryId: "office", iconName: "NiveauVillaBureau" },
  { id: "office-apartment", label: "Appartement", categoryId: "office", iconName: "AppartementBureau" },
  { id: "commercial-local", label: "Local commercial", categoryId: "office", iconName: "LocalCommercial" },

  // Hébergements et Séjours
  { id: "star-hotel", label: "Hébergement hôtelier étoilé", categoryId: "accommodation", iconName: "HebergementEtoile" },
  { id: "unstarred-hotel", label: "Hébergement hôtelier sans étoile", categoryId: "accommodation", iconName: "HebergementSansEtoile" },
  { id: "star-resort", label: "Complexe touristique étoilé", categoryId: "accommodation", iconName: "ComplexeEtoile" },
  { id: "unstarred-resort", label: "Complexe touristique sans étoile", categoryId: "accommodation", iconName: "ComplexeSansEtoile" },
]

// Schéma de validation
const formSchema = z.object({
  transactionType: z.enum(["SALE", "RENTAL"]),
  realEstateType: z.string().min(1, "Type d'immobilier requis"),
  propertyType: z.string().min(1, "Type de bien requis"),
  city: z.string().min(2, "Wilaya requise"),
  commune: z.string().min(2, "Commune requise"),
  address: z.string().min(5, "Adresse requise"),
  area: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Surface invalide"),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Prix invalide"),
  rooms: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Nombre de pièces invalide"),
  description: z.string().min(10, "Description requise (min 10 caractères)"),
  amenities: z.array(z.string()).optional(),
})

type FormData = z.infer<typeof formSchema>

const steps = [
  { id: 1, name: "Type de transaction" },
  { id: 2, name: "Type d'immobilier" },
  { id: 3, name: "Type de bien" },
  { id: 4, name: "Localisation" },
  { id: 5, name: "Caractéristiques" },
  { id: 6, name: "Commodités" },
  { id: 7, name: "Description & Photos" },
]

export default function DepositPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

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
    },
  })

  const transactionType = watch("transactionType")
  const realEstateType = watch("realEstateType")
  const propertyType = watch("propertyType")
  const selectedCity = watch("city")

  const filteredCommunes = selectedCity 
    ? COMMUNES.filter(c => {
        const wilaya = WILAYAS.find(w => w.name === selectedCity)
        return wilaya ? c.wilayaCode === wilaya.code : false
      })
    : []

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      if (selectedFiles.length + newFiles.length > 10) {
        alert("Vous ne pouvez pas ajouter plus de 10 photos au total")
        return
      }
      setSelectedFiles(prev => [...prev, ...newFiles])
      e.target.value = ''
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const nextStep = async () => {
    let fieldsToValidate: (keyof FormData)[] = []
    
    if (currentStep === 1) fieldsToValidate = ["transactionType"]
    if (currentStep === 2) fieldsToValidate = ["realEstateType"]
    if (currentStep === 3) fieldsToValidate = ["propertyType"]
    if (currentStep === 4) fieldsToValidate = ["city", "commune", "address"]
    if (currentStep === 5) fieldsToValidate = ["area", "price", "rooms"]
    if (currentStep === 6) fieldsToValidate = ["amenities"]

    const isValid = await trigger(fieldsToValidate)
    if (isValid) setCurrentStep((prev) => prev + 1)
  }

  const prevStep = () => setCurrentStep((prev) => prev - 1)

  const onSubmit = async (data: FormData) => {
    if (selectedFiles.length < 3) {
      alert("Veuillez ajouter au moins 3 photos pour votre annonce")
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('transactionType', data.transactionType)
      formData.append('realEstateType', data.realEstateType)
      formData.append('propertyType', data.propertyType)
      formData.append('city', data.city)
      formData.append('commune', data.commune)
      formData.append('address', data.address)
      formData.append('area', data.area)
      formData.append('price', data.price)
      formData.append('rooms', data.rooms)
      formData.append('description', data.description)
      if (data.amenities) {
        formData.append('amenities', JSON.stringify(data.amenities))
      }
      
      selectedFiles.forEach((file) => {
        formData.append('images', file)
      })

      const token = localStorage.getItem('token')
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/announces`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        setIsSuccess(true)
      } else {
        alert("Erreur lors de la création de l'annonce")
      }
    } catch (error) {
      alert("Erreur réseau")
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
            Retour à l'accueil
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Top Header Background */}
        <div className="bg-[#00908A] h-[200px] w-full absolute top-0 left-0 z-0"></div>

        <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-4">
            
            {/* Progress Stepper */}
            <div className="bg-white rounded-full px-8 py-4 shadow-lg mb-8 flex items-center gap-4">
                {steps.map((step) => (
                    <div 
                        key={step.id} 
                        className={cn("flex items-center cursor-pointer hover:opacity-80 transition-opacity", step.id > currentStep && "cursor-not-allowed opacity-50")}
                        onClick={() => {
                            if (step.id < currentStep) setCurrentStep(step.id)
                        }}
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

            {/* Main Card */}
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden min-h-[500px] flex flex-col">
                <div className="p-12 flex-1 flex flex-col items-center justify-center text-center">
                    
                    {/* Step 1: Transaction Type */}
                    {currentStep === 1 && (
                        <div className="w-full max-w-2xl animate-fade-in">
                            <h2 className="text-3xl font-bold text-gray-700 mb-12">Choisissez votre type de transaction</h2>
                            <div className="grid grid-cols-2 gap-8">
                                <div 
                                    onClick={() => setValue("transactionType", "RENTAL")}
                                    className={cn(
                                        "cursor-pointer border-2 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 transition-all hover:shadow-lg",
                                        transactionType === "RENTAL" ? "border-[#00BFA6] bg-green-50/30" : "border-gray-200 hover:border-gray-300"
                                    )}
                                >
                                    <Home className={cn("h-16 w-16", transactionType === "RENTAL" ? "text-[#00BFA6]" : "text-gray-400")} />
                                    <span className={cn("text-xl font-medium", transactionType === "RENTAL" ? "text-[#00BFA6]" : "text-gray-500")}>Location</span>
                                </div>
                                <div 
                                    onClick={() => setValue("transactionType", "SALE")}
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
                            <h2 className="text-3xl font-bold text-gray-700 mb-12">Type d'immobilier</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                                {REAL_ESTATE_CATEGORIES.map((cat) => {
                                    const Icon = IconMap[cat.iconName] || Home
                                    return (
                                        <div 
                                            key={cat.id}
                                            onClick={() => setValue("realEstateType", cat.id)}
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
                            <h2 className="text-3xl font-bold text-gray-700 mb-12">Décrivez-nous votre bien</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {PROPERTY_TYPES.filter(t => t.categoryId === realEstateType).map((type) => {
                                    const Icon = IconMap[type.iconName] || Home
                                    return (
                                        <div 
                                            key={type.id}
                                            onClick={() => setValue("propertyType", type.id)}
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

                    {/* Step 4: Location */}
                    {currentStep === 4 && (
                        <div className="w-full max-w-xl animate-fade-in text-left">
                            <h2 className="text-3xl font-bold text-gray-700 mb-8 text-center">Localisation</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Wilaya</label>
                                    <select {...register("city")} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all text-gray-900 bg-white">
                                        <option value="" className="text-gray-900 font-medium">Sélectionner...</option>
                                        {WILAYAS.map((wilaya) => (
                                            <option key={wilaya.id} value={wilaya.name} className="text-gray-900">{wilaya.code} - {wilaya.name}</option>
                                        ))}
                                    </select>
                                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Commune</label>
                                    <select {...register("commune")} disabled={!selectedCity} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all text-gray-900 bg-white disabled:bg-gray-100 disabled:text-gray-400">
                                        <option value="" className="text-gray-900 font-medium">Sélectionner...</option>
                                        {filteredCommunes.map((commune) => (
                                            <option key={commune.id} value={commune.name} className="text-gray-900">{commune.name}</option>
                                        ))}
                                    </select>
                                    {errors.commune && <p className="text-red-500 text-sm mt-1">{errors.commune.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Adresse exacte</label>
                                    <input 
                                      {...register("address")} 
                                      type="text" 
                                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all text-gray-900 placeholder:text-gray-400" 
                                      placeholder="Ex: 12 Rue Didouche Mourad" 
                                    />
                                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Caractéristiques */}
                    {currentStep === 5 && (
                        <div className="w-full max-w-xl animate-fade-in text-left">
                            <h2 className="text-3xl font-bold text-gray-700 mb-8 text-center">Caractéristiques</h2>
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Surface (m²)</label>
                                        <input {...register("area")} type="number" className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all text-gray-900 placeholder:text-gray-400" />
                                        {errors.area && <p className="text-red-500 text-sm mt-1">{errors.area.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Pièces</label>
                                        <input {...register("rooms")} type="number" className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all text-gray-900 placeholder:text-gray-400" />
                                        {errors.rooms && <p className="text-red-500 text-sm mt-1">{errors.rooms.message}</p>}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Prix (DA)</label>
                                    <input {...register("price")} type="number" className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all text-gray-900 placeholder:text-gray-400" />
                                    {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 6: Commodités */}
                    {currentStep === 6 && (
                        <div className="w-full max-w-4xl animate-fade-in text-left">
                            <h2 className="text-3xl font-bold text-gray-700 mb-8 text-center">Commodités</h2>
                            <div className="space-y-12">
                                {/* Advantages */}
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">Avantages et catégories</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {AMENITIES_DATA.advantages.map((item) => (
                                            <label key={item.id} className="cursor-pointer">
                                                <input type="checkbox" value={item.id} {...register("amenities")} className="peer sr-only" />
                                                <div className="border border-gray-200 rounded-xl p-4 text-center peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 peer-checked:text-[#00BFA6] transition-all hover:border-gray-300">
                                                    <span className="font-medium text-gray-700 peer-checked:text-[#00BFA6]">{item.label}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Conveniences */}
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">Commodités et services</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {AMENITIES_DATA.conveniences.map((item) => {
                                            const Icon = IconMap[item.icon!] || Home
                                            return (
                                                <label key={item.id} className="cursor-pointer">
                                                    <input type="checkbox" value={item.id} {...register("amenities")} className="peer sr-only" />
                                                    <div className="border border-gray-200 rounded-xl p-4 flex flex-col items-center gap-3 peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 peer-checked:text-[#00BFA6] transition-all hover:border-gray-300">
                                                        <Icon className="h-6 w-6 text-gray-500 peer-checked:text-[#00BFA6]" />
                                                        <span className="text-sm font-medium text-center text-gray-700 peer-checked:text-[#00BFA6]">{item.label}</span>
                                                    </div>
                                                </label>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Heaters, Kitchens, Other Pieces */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-4">Chauffage</h3>
                                        <div className="space-y-3">
                                            {AMENITIES_DATA.heaters.map((item) => (
                                                <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
                                                    <input type="checkbox" value={item.id} {...register("amenities")} className="w-5 h-5 text-[#00BFA6] rounded border-gray-300 focus:ring-[#00BFA6]" />
                                                    <span className="text-gray-700 font-medium group-hover:text-gray-900">{item.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-4">Cuisine</h3>
                                        <div className="space-y-3">
                                            {AMENITIES_DATA.kitchens.map((item) => (
                                                <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
                                                    <input type="checkbox" value={item.id} {...register("amenities")} className="w-5 h-5 text-[#00BFA6] rounded border-gray-300 focus:ring-[#00BFA6]" />
                                                    <span className="text-gray-700 font-medium group-hover:text-gray-900">{item.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-4">Autres pièces</h3>
                                        <div className="space-y-3">
                                            {AMENITIES_DATA.otherPieces.map((item) => (
                                                <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
                                                    <input type="checkbox" value={item.id} {...register("amenities")} className="w-5 h-5 text-[#00BFA6] rounded border-gray-300 focus:ring-[#00BFA6]" />
                                                    <span className="text-gray-700 font-medium group-hover:text-gray-900">{item.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 7: Description & Photos */}
                    {currentStep === 7 && (
                        <div className="w-full max-w-xl animate-fade-in text-left">
                            <h2 className="text-3xl font-bold text-gray-700 mb-8 text-center">Description & Photos</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                    <textarea {...register("description")} rows={5} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all text-gray-900 placeholder:text-gray-400" placeholder="Décrivez votre bien..."></textarea>
                                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Photos (Min 3, Max 10)</label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                        <input type="file" multiple accept="image/*" onChange={onFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                        <Upload className="h-10 w-10 text-[#00BFA6] mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">
                                            {selectedFiles.length > 0 
                                                ? `${selectedFiles.length} photo(s) sélectionnée(s)` 
                                                : "Cliquez ou glissez vos photos ici"}
                                        </p>
                                    </div>
                                    {selectedFiles.length > 0 && (
                                        <div className="mt-4 grid grid-cols-5 gap-2">
                                            {selectedFiles.map((file, idx) => (
                                                <div key={idx} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
                                                    <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            removeFile(idx)
                                                        }}
                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                        type="button"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer Actions */}
                <div className="p-8 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
                    {currentStep > 1 ? (
                        <button onClick={prevStep} className="text-gray-500 font-bold hover:text-gray-800 transition-colors underline decoration-2 underline-offset-4">
                            Retour
                        </button>
                    ) : (
                        <div></div>
                    )}

                    {currentStep < steps.length ? (
                        <Button onClick={nextStep} className="bg-[#00BFA6] hover:bg-[#00908A] text-white rounded-full px-8 py-6 text-lg font-bold shadow-lg shadow-[#00BFA6]/20 transition-all">
                            Continuer
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="bg-[#00BFA6] hover:bg-[#00908A] text-white rounded-full px-8 py-6 text-lg font-bold shadow-lg shadow-[#00BFA6]/20 transition-all">
                            {isSubmitting ? "Publication..." : "Publier l'annonce"}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    </div>
  )
}