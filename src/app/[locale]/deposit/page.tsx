"use client"

import { useState, useEffect, useRef } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addDays, getDay, isBefore, startOfDay } from "date-fns"
import { fr } from "date-fns/locale"
import { useTranslations } from "next-intl"
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
  Thermometer, Network, Bell, Ban, Siren, Calendar as CalendarIcon, Video as VideoIcon, LifeBuoy,
  Paintbrush
} from "lucide-react"

import { cn } from "@/lib/utils"
import { usePropertyTypeLabel, useLocalizedGeoName } from "@/lib/typeLabels"
import { getCategoryColor } from "@/data/categoryColors"
import { useRouter, usePathname } from "@/i18n/navigation"
import { WILAYAS } from "@/data/wilayas"
import { COMMUNES } from "@/data/communes"
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

// Icon mapping
const IconMap: Record<string, React.ElementType> = {
  Home, Building, Building2, Warehouse, Hotel, Briefcase, Store, BedDouble, 
  PartyPopper, Factory, Tent, Archive, ParkingCircle, DoorOpen, Trees, Sun,
  Utensils, CookingPot, Droplet, Battery, Flame, Video, Lock, Shield, Wifi, Phone, Layers, LifeBuoy,
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
  SejourVacances: BedDouble,
  ComplexeEtoile: Sparkles,
  ComplexeSansEtoile: Trees,
  TerrainFoncier: Trees,
  TerrainAgricole: Leaf,
  TerrainTouristique: Palmtree,
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

// Catégories de dépôt. HOTELIER concerne les structures professionnelles,
// HEBERGEMENT le parcours « chez l'habitant » destiné aux particuliers.
const BASE_REAL_ESTATE_CATEGORIES = [
  { id: "RESIDENTIEL", label: "Résidentiel", iconName: "Home" },
  { id: "INDUSTRIEL", label: "Industriel", iconName: "Factory" },
  { id: "HOTELIER", label: "Hébergement & Séjour", iconName: "Hotel" },
  { id: "HEBERGEMENT", label: "Hébergement & Séjour", iconName: "Hotel" },
  { id: "BUREAUX_COMMERCES", label: "Bureaux et Commerces", iconName: "Briefcase" },
  { id: "TERRAIN_FONCIER", label: "Terrains et Foncier", iconName: "TerrainFoncier" },
]

// Types de biens par catégorie
const BASE_PROPERTY_TYPES = [
  { id: "APPARTEMENT", label: "Appartement", categoryId: "RESIDENTIEL", iconName: "Apartment" },
  { id: "VILLA", label: "Villa", categoryId: "RESIDENTIEL", iconName: "Villa" },
  { id: "NIVEAU_VILLA", label: "Niveau de villa", categoryId: "RESIDENTIEL", iconName: "VillaLevel" },
  { id: "IMMEUBLE_RESIDENTIEL", label: "Immeuble d'appartements", categoryId: "RESIDENTIEL", iconName: "ApartmentBuilding" },
  { id: "DUPLEX", label: "Duplex", categoryId: "RESIDENTIEL", iconName: "Duplex" },
  { id: "TRIPLEX", label: "Triplex", categoryId: "RESIDENTIEL", iconName: "Triplex" },
  { id: "STUDIO", label: "Studio", categoryId: "RESIDENTIEL", iconName: "Studio" },
  { id: "HANGAR", label: "Hangar", categoryId: "INDUSTRIEL", iconName: "Hangar" },
  { id: "USINE", label: "Usine", categoryId: "INDUSTRIEL", iconName: "Usine" },
  { id: "CHAMBRE_FROIDE", label: "Chambre froide", categoryId: "INDUSTRIEL", iconName: "ChambreFroide" },
  { id: "TERRAIN_RESIDENTIEL", label: "Terrain résidentiel", categoryId: "TERRAIN_FONCIER", iconName: "ResidentialLand" },
  { id: "TERRAIN_INDUSTRIEL", label: "Terrain industriel", categoryId: "TERRAIN_FONCIER", iconName: "TerrainIndustriel" },
  { id: "TERRAIN_AGRICOLE", label: "Terrain agricole", categoryId: "TERRAIN_FONCIER", iconName: "TerrainAgricole" },
  { id: "TERRAIN_TOURISTIQUE", label: "Terrain touristique", categoryId: "TERRAIN_FONCIER", iconName: "TerrainTouristique" },
  { id: "CO_STOCKAGE", label: "Co-stockage et entreposage", categoryId: "INDUSTRIEL", iconName: "CoStockage" },
  { id: "SALLE_FORMATION", label: "Salle de formation", categoryId: "EVENEMENTIEL", iconName: "SalleFormation" },
  { id: "SALLE_CONFERENCE", label: "Salle de conférence", categoryId: "EVENEMENTIEL", iconName: "SalleConference" },
  { id: "SALLE_DINER", label: "Salle de dîner", categoryId: "EVENEMENTIEL", iconName: "SalleDiner" },
  { id: "SALLE_FETES", label: "Salle des fêtes", categoryId: "EVENEMENTIEL", iconName: "SalleFetes" },
  { id: "TERRAIN_HOTELIER", label: "Terrain hôtelier", categoryId: "HOTELIER", iconName: "TerrainHotel" },
  // HOTEL et AUTRE_HOTEL n'avaient aucune fiche dédiée (fiche générique/legacy par défaut) — remplacés
  // par ETABLISSEMENT_HEBERGEMENT, qui ouvre le bloc Classification puis la fiche Type de bien
  // (Maison complète / Chambre / Place de lit), partagée avec HEBERGEMENT_SEJOUR côté particulier.
  { id: "ETABLISSEMENT_HEBERGEMENT", label: "Établissement d'hébergement", categoryId: "HOTELIER", iconName: "StructureHoteliere" },
  // Ordre volontaire : L01 (4) tronc commun résidentiel-pro, L02 (4) locaux commerciaux, L03 (3) réservé pro
  // (Centre d'affaires, Espace co-working, Bureau flexible filtrés pour les particuliers dans getFilteredPropertyTypes).
  { id: "APPARTEMENT_COMMERCIAL", label: "Appartement", categoryId: "BUREAUX_COMMERCES", iconName: "AppartementBureau" },
  { id: "VILLA_COMMERCIALE", label: "Villa", categoryId: "BUREAUX_COMMERCES", iconName: "VillaBureau" },
  { id: "NIVEAU_VILLA_COMMERCIAL", label: "Niveau de villa", categoryId: "BUREAUX_COMMERCES", iconName: "NiveauVillaBureau" },
  { id: "IMMEUBLE_BUREAU", label: "Immeuble d'appartement", categoryId: "BUREAUX_COMMERCES", iconName: "ImmeubleBureaux" },
  { id: "BLOC_ADMINISTRATIF", label: "Bloc administratif", categoryId: "BUREAUX_COMMERCES", iconName: "ImmeubleBureaux" },
  { id: "IMMEUBLE_COMMERCIAL", label: "Bloc commercial", categoryId: "BUREAUX_COMMERCES", iconName: "ImmeubleBureaux" },
  { id: "LOCAL_COMMERCIAL", label: "Local commercial", categoryId: "BUREAUX_COMMERCES", iconName: "LocalCommercial" },
  { id: "CENTRE_AFFAIRES", label: "Centre d'affaires", categoryId: "BUREAUX_COMMERCES", iconName: "CentreAffaires" },
  { id: "SHOWROOM", label: "Showroom", categoryId: "BUREAUX_COMMERCES", iconName: "Showroom" },
  { id: "COWORKING", label: "Espace co-working", categoryId: "BUREAUX_COMMERCES", iconName: "Coworking" },
  { id: "BUREAU_FLEXIBLE", label: "Bureau flexible", categoryId: "BUREAUX_COMMERCES", iconName: "BureauFlexible" },
  { id: "HEBERGEMENT_HOTELIER", label: "Hébergement hôtelier étoilé", categoryId: "HEBERGEMENT", iconName: "HebergementEtoile" },
  { id: "AUTRE_HEBERGEMENT", label: "Hébergement hôtelier sans étoile", categoryId: "HEBERGEMENT", iconName: "HebergementSansEtoile" },
  { id: "COMPLEXE_TOURISTIQUE_HEBERGEMENT", label: "Complexe touristique étoilé", categoryId: "HEBERGEMENT", iconName: "ComplexeEtoile" },
  { id: "COMPLEXE_TOURISTIQUE", label: "Complexe touristique sans étoile", categoryId: "HEBERGEMENT", iconName: "ComplexeSansEtoile" },
  // Coexiste avec HEBERGEMENT_HABITANT (formule imposée par getFilteredPropertyTypes en location pour
  // les particuliers) : fiche Type de bien (Maison complète / Chambre / Place de lit), pendant
  // particulier de ETABLISSEMENT_HEBERGEMENT côté professionnel.
  { id: "HEBERGEMENT_SEJOUR", label: "Location de séjour / vacances", categoryId: "HEBERGEMENT", iconName: "SejourVacances" },
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
    { id: "BON_ETAT", label: "Bon état" },
    { id: "A_DEMOLIR", label: "À démolir" }
]

const INDUSTRIAL_SECTORS = [
    { id: "AGROALIMENTAIRE", label: "Agroalimentaire", info: "Transformation, boissons, froid" },
    { id: "PHARMACEUTIQUE_COSMETIQUE", label: "Pharmaceutique / Cosmétique", info: "Médicaments, soins" },
    { id: "CHIMIQUE", label: "Chimique", info: "Détergents, peintures, engrais" },
    { id: "MATERIAUX_CONSTRUCTION", label: "Matériaux de construction", info: "Briqueterie, menuiserie, PVC" },
    { id: "PLASTURGIE_EMBALLAGE", label: "Plasturgie & Emballage", info: "Injection, soufflage, carton" },
    { id: "SIDERURGIE_METALLURGIE", label: "Sidérurgie & Métallurgie", info: "Fer, acier, fonderie" },
    { id: "TEXTILE_CUIR", label: "Textile & Cuir", info: "Confection, chaussures" },
    { id: "ELECTROMENAGER_ELECTRONIQUE", label: "Électroménager & Électronique", info: "Assemblage, composants" },
    { id: "MECANIQUE_AUTOMOBILE", label: "Mécanique & Automobile", info: "Pièces de rechange, maintenance" },
    { id: "RECYCLAGE_ENVIRONNEMENT", label: "Recyclage & Environnement", info: "Plastique, papier, métaux" },
    { id: "PAPIER_EDITION", label: "Papier & Édition", info: "Imprimerie, papeterie" },
    { id: "AUTRE_ACTIVITE", label: "Autre activité", info: "" },
]

const INDUSTRIAL_RENTAL_TYPES = [
    { id: "MURS_NUS", label: "Murs nus (Vide)" },
    { id: "EQUIPEE", label: "Équipée (Clé en main avec lignes)" },
]

const INDUSTRIAL_GLOBAL_STATES = [
    { id: "NEUF", label: "Neuf (Jamais servi)" },
    { id: "BON_ETAT_MARCHE", label: "Bon état" },
    { id: "ANCIEN", label: "Ancien (À réviser)" },
]

const INDUSTRIAL_CONFIGURATIONS = [
    { id: "PLAIN_PIED", label: "Plain-pied (RDC)" },
    { id: "ETAGES", label: "À étages" },
]

const INDUSTRIAL_OSSATURE = [
    { id: "CHARPENTE_METALLIQUE", label: "Charpente métallique" },
    { id: "BETON_ARME", label: "Béton armé" },
    { id: "MIXTE", label: "Mixte" },
]

const INDUSTRIAL_TOITURE = [
    { id: "PANNEAUX_SANDWICH", label: "Panneaux Sandwich" },
    { id: "TOLE_TN40", label: "Tôle TN40" },
    { id: "DALLE_BETON", label: "Dalle béton" },
]

const INDUSTRIAL_MURS = [
    { id: "MACONNERIE_BRIQUE", label: "Maçonnerie (Brique)" },
    { id: "PANNEAUX_SANDWICH", label: "Panneaux Sandwich" },
    { id: "MIXTE", label: "Mixte" },
]

const INDUSTRIAL_SITUATIONS = [
    { id: "ZONE_INDUSTRIELLE", label: "Zone industrielle (ZI/ZAC)" },
    { id: "ZONE_URBAINE", label: "Zone urbaine (Ville)" },
]

const INDUSTRIAL_ACCESS_TRANSPORT = [
    { id: "SEMI_REMORQUE", label: "Semi-remorque (40 T)" },
    { id: "CAMIONNETTE", label: "Camionnette (3.5 T)" },
    { id: "PETIT_PORTEUR", label: "Petit porteur (10T)" },
]

const INDUSTRIAL_ACCESS_PRODUCTION = [
    { id: "QUAI_DECHARGEMENT", label: "Quai de déchargement" },
    { id: "ENTREE_PLAIN_PIED", label: "Entrée de plain-pied (Portail large)" },
]

const INDUSTRIAL_SOCIAL_LOCALES = [
    { id: "VESTIAIRES", label: "Vestiaires" },
    { id: "REFECTOIRE", label: "Réfectoire" },
    { id: "SANITAIRES_HF", label: "Sanitaires H/F" },
]

const INDUSTRIAL_HEBERGEMENT = [
    { id: "LOGEMENT_FONCTION", label: "Logement" },
    { id: "DORTOIRS", label: "Dortoirs" },
]

const INDUSTRIAL_SECURITY = [
    { id: "POSTE_GARDE", label: "Poste de garde" },
    { id: "CLOTURE_MACONNEE", label: "Clôture maçonnée" },
    { id: "CAMERAS", label: "Caméras" },
]

const INDUSTRIAL_WATER_SOURCES = [
    { id: "RESEAU_ADE", label: "Réseau ADE" },
    { id: "FORAGE", label: "Forage" },
    { id: "BACHE_EAU", label: "Bâche à eau" },
]

const INDUSTRIAL_FIRE_NETWORK = [
    { id: "RIA", label: "R.I.A (Robinets d'Incendie Armés)" },
    { id: "SPRINKLERS", label: "Système Sprinklers" },
    { id: "COLONNES_SECHES", label: "Colonnes sèches" },
]

const INDUSTRIAL_FIRE_EQUIPMENT = [
    { id: "BACHE_EAU", label: "Bâche à eau anti-incendie (réserve dédiée)" },
    { id: "MOTOPOMPE", label: "Motopompe / Groupe de surpression" },
]

// ===== CHAMBRE FROIDE =====
const CF_SECTORS = [
    { id: "AGROALIMENTAIRE_CF", label: "Agroalimentaire", info: "Viandes, fruits, légumes, laitages" },
    { id: "GLACES_SURGELES", label: "Glaces & Surgelés", info: 'Spécial "Ice Cream"' },
    { id: "PHARMACEUTIQUE_CF", label: "Pharmaceutique", info: "Normes de traçabilité et hygiène" },
    { id: "CHIMIQUE_CF", label: "Chimique", info: "" },
    { id: "HORTICOLE_AGRICOLE", label: "Horticole & Agricole", info: "" },
    { id: "AUTRE_CF", label: "Autre activité", info: "" },
]
const CF_STRUCTURE_TYPES = [
    { id: "CELLULE_UNIQUE", label: "Cellule unique (Une seule chambre)" },
    { id: "COMPLEXE_FRIGORIFIQUE", label: "Plusieurs cellules (Complexe frigorifique)" },
]
const CF_ZONE_DECHARGEMENT = [
    { id: "QUAI_NIVELEUR_SAS", label: "Quai niveleur SAS étanche" },
    { id: "QUAI_SIMPLE", label: "Quai simple" },
    { id: "PLAIN_PIED_DECHARGT", label: "Plain-pied" },
]
const CF_TRACABILITE = [
    { id: "ENREGISTREUR_T24", label: "Enregistreur T° H24" },
    { id: "SYSTEME_ALERTE_SMS", label: "Système d'alerte SMS" },
]
const CF_TECHNIQUE_FROID = [
    { id: "SOL_CHAUFFANT", label: "Sol chauffant (Anti-gel dalle)" },
    { id: "DEGIVRAGE_AUTO", label: "Dégivrage Auto" },
]
const CF_MODE_GESTION = [
    { id: "SANS_GESTION", label: "SANS GESTION (Murs seuls)", desc: "Le locataire gère son personnel et ses flux." },
    { id: "AVEC_GESTION", label: "AVEC GESTION (Service complet)", desc: "Vous assurez la manutention et le stockage." },
]
const CF_FLEXIBILITE = [
    { id: "SURFACE_DEDIEE", label: "Surface dédiée", desc: "Location de la pièce entière ou du complexe total." },
    { id: "CO_STOCKAGE", label: "Co-stockage", desc: "Location flexible à la palette (espace partagé)." },
]
const CF_DUREE_ENGAGEMENT = [
    { id: "ANNUELLE", label: "Annuelle (Bail long terme)" },
    { id: "MENSUELLE_HEBDO", label: "Mensuelle / Hebdomadaire" },
    { id: "JOURNEE_SPOT", label: 'À la journée (Stockage "Spot")' },
]
// ===========================

// ===== TERRAIN =====
const TERRAIN_TOPOGRAPHIE = [
    { id: "PLAT", label: "Plat" },
    { id: "EN_PENTE", label: "En pente" },
    { id: "ACCIDENTE", label: "Accidenté (escarpé)" },
]
const TERRAIN_STATUT_ZONE = [
    { id: "LOTISSEMENT_CLASSIQUE", label: "Lotissement classique" },
    { id: "COOPERATIVE_IMMOBILIERE", label: "Coopérative immobilière" },
    { id: "RESIDENCE_FERMEE", label: "Résidence fermée" },
]
const TERRAIN_INDUSTRIEL_ZONE = [
    { id: "ZONE_INDUSTRIELLE", label: "Zone Industrielle" },
    { id: "ZONE_URBAINE_IND", label: "Zone Urbaine" },
    { id: "ZONE_ACTIVITE", label: "Zone d'Activité" },
]
const TERRAIN_DOCUMENTS = [
    { id: "ACTE_PROPRIETE", label: "Acte de propriété (Notarié)" },
    { id: "LIVRET_FONCIER", label: "Livret foncier" },
    { id: "CERTIFICAT_URBANISME", label: "Certificat d'urbanisme" },
    { id: "PERMIS_CONSTRUIRE", label: "Permis de construire (Existant)" },
    { id: "PLAN_MASSE", label: "Plan de masse" },
]
const TERRAIN_RACCORDEMENTS = [
    { id: "EAU", label: "Eau (ADE)" },
    { id: "ELECTRICITE", label: "Électricité (Sonelgaz)" },
    { id: "GAZ", label: "Gaz" },
    { id: "ASSAINISSEMENT", label: "Assainissement" },
    { id: "INTERNET", label: "Internet / Fibre" },
]
// ===== TERRAIN AGRICOLE =====
const TERRAIN_AGRICOLE_UNITE = [
    { id: "M2", label: "m²" },
    { id: "HA", label: "Hectare" },
    { id: "DOUNEM", label: "Are" },
]
const TERRAIN_AGRICOLE_VOCATION = [
    { id: "MARAICHAGE", label: "Maraîchage" },
    { id: "ARBORICULTURE", label: "Arboriculture fruitière" },
    { id: "VITICULTURE", label: "Viticulture" },
    { id: "CEREALES", label: "Céréales (blé, orge…)" },
    { id: "ELEVAGE", label: "Élevage" },
    { id: "MIXTE", label: "Autre" },
]
const TERRAIN_AGRICOLE_RESSOURCES_EAU = [
    { id: "PUITS", label: "Puits" },
    { id: "CANAL_IRRIGATION", label: "Canal d'irrigation" },
    { id: "BARRAGE_RETENUE", label: "Barrage / retenue d'eau" },
    { id: "BASSIN_COLLECTE", label: "Bassin de collecte" },
    { id: "RESEAU_ADE", label: "Réseau ADE" },
    { id: "FORAGE", label: "Forage" },
]
const TERRAIN_AGRICOLE_EXPOSITION = [
    { id: "NORD", label: "Nord" },
    { id: "SUD", label: "Sud" },
    { id: "EST", label: "Est" },
    { id: "OUEST", label: "Ouest" },
    { id: "NORD_EST", label: "Nord-Est" },
    { id: "NORD_OUEST", label: "Nord-Ouest" },
    { id: "SUD_EST", label: "Sud-Est" },
    { id: "SUD_OUEST", label: "Sud-Ouest" },
]
const TERRAIN_AGRICOLE_ENSOLEILLEMENT = [
    { id: "ELEVE", label: "Élevé (> 8h/jour)" },
    { id: "MOYEN", label: "Moyen (5 à 8h/jour)" },
    { id: "FAIBLE", label: "Faible (< 5h/jour)" },
]
const TERRAIN_AGRICOLE_NATURE_SOL = [
    { id: "ARGILEUX", label: "Argileux" },
    { id: "SABLONNEUX", label: "Sablonneux" },
    { id: "LIMONEUX", label: "Limoneux" },
    { id: "AUTRE_MIXTE", label: "Autre" },
]
const TERRAIN_AGRICOLE_QUALITE_EAU = [
    { id: "DOUCE", label: "Douce" },
    { id: "SAUMATRE", label: "Saumâtre" },
    { id: "AUTRE_EAU", label: "Autre" },
]
const TERRAIN_AGRICOLE_EQUIPEMENT_HYDRAULIQUE = [
    { id: "BASSIN_RETENTION", label: "Bassin de rétention / Réservoir" },
    { id: "IRRIGATION_GOUTTE", label: "Système d'irrigation goutte-à-goutte" },
    { id: "AUTRE_SYSTEME", label: "Autre système" },
]
const TERRAIN_AGRICOLE_TYPE_CULTURE = [
    { id: "ARBORICULTURE", label: "Arboriculture (Arbres fruitiers, oliviers…)" },
    { id: "MARAICHAGE", label: "Maraîchage (Légumes)" },
    { id: "GRANDES_CULTURES", label: "Grandes cultures (Céréales, fourrage)" },
    { id: "AUTRE_CULTURE", label: "Autre" },
]
const TERRAIN_AGRICOLE_ACCES = [
    { id: "ROUTE_GOUDRON", label: "Route goudronnée" },
    { id: "PISTE_CARROSSABLE", label: "Piste carrossable (accessible en voiture)" },
    { id: "ACCES_DIFFICILE", label: "Accès difficile (nécessite 4x4)" },
]
const TERRAIN_AGRICOLE_ACCES_LOURDS = [
    { id: "CAMION_PORTEUR", label: "Accessible en Camion porteur" },
    { id: "SEMI_REMORQUE", label: "Accessible en Semi-remorque" },
]
const TERRAIN_AGRICOLE_CONSTRUCTIONS = [
    { id: "HANGAR_STOCKAGE", label: "Hangar de stockage" },
    { id: "ECURIES_ELEVAGE", label: "Bâtiment d'élevage" },
    { id: "MAISON_GARDIENNAGE", label: "Logement de fonction" },
    { id: "AUCUNE", label: "Aucune construction" },
]
const TERRAIN_AGRICOLE_CLOTURE = [
    { id: "OUVERT", label: "Terrain non clôturé" },
    { id: "GRILLAGE", label: "Clôture en grillage" },
    { id: "MURS_ENCEINTE", label: "Murs d'enceinte" },
    { id: "HAIES", label: "Haies naturelles" },
]
const TERRAIN_AGRICOLE_ZONE = [
    { id: "URBAINE", label: "Zone urbaine" },
    { id: "ISOLEE", label: "Zone isolée" },
    { id: "SAHARIENNE", label: "Zone saharienne" },
]
// ===== TERRAIN TOURISTIQUE =====
const TERRAIN_TOURISTIQUE_ZONE = [
    { id: "BALNEAIRE", label: "Zone balnéaire (Littoral, bord de mer)" },
    { id: "SAHARIEN", label: "Zone saharienne (Sud, oasis, tourisme saharien)" },
    { id: "CLIMATIQUE", label: "Zone climatique (Montagne, forêt, tourisme vert)" },
    { id: "THERMAL", label: "Zone thermale (Sources thermales, hammams)" },
    { id: "URBAINE", label: "Zone urbaine (Centre-ville, tourisme d'affaires)" },
    { id: "AUTRE_ZONE", label: "Autre situation" },
]
const TERRAIN_TOURISTIQUE_ZET = [
    { id: "OUI", label: "Oui — Situé dans une Z.E.T décrétée" },
    { id: "NON", label: "Non" },
]
const TERRAIN_TOURISTIQUE_PAT = [
    { id: "OUI_APPROUVE", label: "Oui (Approuvé et publié)" },
    { id: "EN_COURS", label: "En cours d'étude / En cours d'approbation" },
    { id: "NON", label: "Non / Aucun plan d'aménagement disponible" },
]
const TERRAIN_TOURISTIQUE_RESEAUX = [
    { id: "ASSAINISSEMENT", label: "Assainissement (Réseau d'égouts)" },
    { id: "FIBRE_OPTIQUE", label: "Fibre optique / Télécom" },
]
// ===== IMMEUBLE BUREAU/COMMERCIAL =====
const IMMEUBLE_TYPE_ZONE = [
    { id: "ZONE_COMMERCIALE", label: "Zone Commerciale" },
    { id: "ZONE_RESIDENTIELLE", label: "Zone Résidentielle" },
    { id: "ZONE_INDUSTRIELLE", label: "Zone Industrielle" },
]
const IMMEUBLE_VISIBILITE = [
    { id: "VIS_AUTOROUTE", label: "Visible depuis l'autoroute" },
    { id: "ANGLE_RUE", label: "Façade commerciale" },
    { id: "FORTE_VISIBILITE", label: "Forte visibilité piétonne et routière" },
]
const IMMEUBLE_TYPE_ACCES = [
    { id: "ROUTE_MIXTE", label: "Route mixte (Piétonne et Voiture)", desc: "Accessible aux véhicules avec trottoirs aménagés (idéal tous commerces)" },
    { id: "PIETONNE", label: "Route uniquement piétonne", desc: "Zone 100% piétonne / Centre-ville historique (fort flux, restrictions livraisons)" },
    { id: "VOITURE", label: "Route uniquement voiture", desc: "Axe routier rapide / Voie express (fort flux véhicules, aucun passage piéton)" },
]
const IMMEUBLE_ETAT_GLOBAL = [
    { id: "NEUF", label: "Neuf / Première occupation", desc: "Prêt à l'emploi, normes récentes" },
    { id: "BON_ETAT", label: "Ancien / Bon état", desc: "Structure saine, rafraîchissement mineur possible" },
    { id: "A_RENOVER", label: "À rénover / À aménager", desc: "Travaux lourds ou aménagement intérieur complet à prévoir" },
]
// ===== SHOWROOM =====
const SHOWROOM_STYLE = [
    { id: "MODERNE", label: "Moderne" },
    { id: "CLASSIQUE", label: "Classique" },
    { id: "INDUSTRIEL", label: "Industriel" },
]
const SHOWROOM_STRUCTURE = [
    { id: "BETON_ARME", label: "Béton armé" },
    { id: "STRUCTURE_METALLIQUE", label: "Structure métallique" },
    { id: "AUTRE", label: "Autre" },
]
// ===== LOCAL COMMERCIAL =====
const LOCAL_ENVIRONNEMENT = [
    { id: "GALERIE_MARCHANDE", label: "Galerie marchande" },
    { id: "CENTRE_COMMERCIAL", label: "Centre commercial" },
    { id: "RUE_COMMERCANTE", label: "Rue commerçante" },
    { id: "ZONE_ACTIVITE", label: "Zone d'activité commerciale" },
    { id: "ZONE_INDUSTRIELLE", label: "Zone industrielle" },
    { id: "AUTRE", label: "Autre" },
]
const LOCAL_STYLE = [
    { id: "MODERNE", label: "Moderne" },
    { id: "CLASSIQUE", label: "Classique" },
    { id: "BRUT", label: "À rénover" },
]
const LOCAL_ZONE_TYPE = [
    { id: "COMMERCIALE", label: "Zone commerciale" },
    { id: "RESIDENTIELLE", label: "Zone résidentielle" },
    { id: "INDUSTRIELLE", label: "Zone industrielle" },
]
const LOCAL_FLUX = [
    { id: "ELEVE", label: "Élevé" },
    { id: "MOYEN", label: "Moyen" },
    { id: "FAIBLE", label: "Faible" },
]
const LOCAL_USAGE = [
    { id: "MAGASIN", label: "Magasin" },
    { id: "DEPOT", label: "Dépôt" },
    { id: "BUREAU", label: "Bureau" },
    { id: "SHOWROOM", label: "Showroom" },
    { id: "AUTRE", label: "Autre" },
]
// ===== BLOC ADMINISTRATIF =====
const BLOC_TYPE_ESPACE = [
    { id: "OPEN_SPACE", label: "Open space" },
    { id: "CLOISONNE", label: "Bureaux cloisonnés" },
    { id: "AUTRE", label: "Autre" },
]
const BLOC_CLOISONNEMENT = [
    { id: "AMOVIBLE", label: "Amovible (modulable)" },
    { id: "FIXE", label: "Fixe (maçonnerie)" },
    { id: "VITRE", label: "Vitré" },
]
const BLOC_CUISINE = [
    { id: "CANTINE", label: "Cantine" },
    { id: "KITCHENETTE", label: "Kitchenette à chaque étage" },
    { id: "SANS_CUISINE", label: "Sans cuisine" },
]
const BLOC_CONNECTIVITE = [
    { id: "FIBRE_OPTIQUE", label: "Fibre optique" },
    { id: "ADSL_VDSL", label: "ADSL / VDSL" },
    { id: "4G_5G", label: "4G / 5G" },
    { id: "PAS_RESEAU", label: "Pas de réseau" },
]
const BLOC_CONNEXION = [
    { id: "CABLEE", label: "Câblée (RJ45)" },
    { id: "WIFI", label: "Wi-Fi" },
    { id: "MIXTE", label: "Mixte (câblée + Wi-Fi)" },
]
const BLOC_EQUIPEMENT_SERVEUR = [
    { id: "ARMOIRE_SERVEUR", label: "Armoire serveur" },
    { id: "DATA_ROOM", label: "Data room / Salle serveurs" },
    { id: "GROUPE_ELECTROGENE", label: "Groupe électrogène" },
    { id: "ONDULEUR_UPS", label: "Onduleur (UPS)" },
]
// ===========================

// ===== HÉBERGEMENT CHEZ L'HABITANT =====
const HAB_CLIENT_PROFILES = [
  { id: "FAMILIAL", label: "Exclusivement Familial", desc: "Idéal pour le repos des familles, non adapté aux célibataires ou affaires" },
  { id: "PROFESSIONNEL", label: "Professionnel / Affaires", desc: "Adapté aux séjours professionnels, séminaires, cadres et travailleurs" },
  { id: "GROUPES", label: "Groupes d'amis / Groupements", desc: "Adapté aux groupes voyageant ensemble, randonneurs, etc." },
  { id: "TOUS", label: "Tout type de clientèle légalement admissible", desc: "Ouvert à tous les profils respectant la réglementation en vigueur" },
]
const HAB_FORMULES = [
  { id: "LOGEMENT_ENTIER", label: "Logement entier", desc: "Accès exclusif à la totalité du logement / de l'unité" },
  { id: "CHAMBRE_PRIVEE", label: "Chambre privée", desc: "Chambre seule, espaces communs partagés" },
  { id: "LIT_SEUL", label: "Lit / Place seule", desc: "Dortoir, espace partagé, type auberge/traditionnel saharien" },
]
const HAB_UNIT_TYPES = [
  { id: "APPARTEMENT", label: "Appartement" },
  { id: "STUDIO", label: "Studio" },
  { id: "VILLA", label: "Villa / Niveau de Villa" },
  { id: "DUPLEX", label: "Duplex / Triplex" },
  { id: "BUNGALOW", label: "Bungalow / Chalet / Structure légère" },
  { id: "CAMPING", label: "Emplacement de camping vide" },
  { id: "INSOLITE", label: "Hébergement insolite" },
]
const HAB_BED_TYPES = [
  { id: "KING_PREMIUM", label: "Lit King Size Premium (200×200 cm)" },
  { id: "KING", label: "Lit King Size (180×200 cm)" },
  { id: "QUEEN", label: "Lit Queen Size (160×200 cm)" },
  { id: "DOUBLE_STANDARD", label: "Lit Double Standard (140×190 cm)" },
  { id: "SIMPLE_ADULTE", label: "Lit Simple / Canapé-lit (90×190 cm)" },
  { id: "SIMPLE_ENFANT", label: "Lit Simple Enfant (80×190 cm)" },
  { id: "SUPERPOSE", label: "Lit Superposé 2 places (90×190×2 cm)" },
  { id: "MATELAS_SOL", label: "Matelas au sol / Literie traditionnelle" },
  { id: "BEBE", label: "Lit Bébé / Berceau" },
]
const HAB_AMBIANCES = [
  { id: "BALNEAIRE", label: "Balnéaire (Mer et plage)" },
  { id: "URBAIN", label: "Urbain (Centre-ville et commodités)" },
  { id: "SAHARIEN", label: "Saharien (Désert, Oasis, Grand Sud)" },
  { id: "THERMAL", label: "Thermal (Proche d'un Hammam / station thermale)" },
  { id: "CLIMATIQUE", label: "Climatique (Montagne, Ski, Nature, Forêt)" },
]
const HAB_PLAGE_ACCES = [
  { id: "PRIVEE", label: "Plage privée (Réservée exclusivement aux clients)" },
  { id: "PUBLIQUE", label: "Plage publique (Accès libre à tout le monde)" },
  { id: "LES_DEUX", label: "Les deux (Plage privée + Plage publique à côté)" },
]
const HAB_URBAIN_COMMODITES = [
  { id: "COMMERCES", label: "Commerces de proximité (Supérette, épicerie, boulangerie)" },
  { id: "RESTAURANTS", label: "Restaurants et Cafés (Fast-food, salons de thé)" },
  { id: "SHOPPING", label: "Shopping et Boutiques (Centres commerciaux, souks)" },
]
const HAB_SAHARIEN_ACTIVITES = [
  { id: "VISITES_GUIDEES", label: "Visites guidées / Excursions culturelles (Ksour, musées, gravures)" },
  { id: "QUAD_4X4", label: "Randonnées et circuits en Quad / 4x4 (dunes de sable)" },
  { id: "CHAMEAU", label: "Balades à dos de chameau (Méharée)" },
  { id: "OASIS", label: "Découverte et visite d'Oasis (Palmerais, Foggara)" },
  { id: "SANDBOARD", label: "Ski sur sable / Sandboarding (glisse sur les dunes)" },
  { id: "BIVOUAC", label: "Bivouac / Nuit étoilée dans le désert" },
]
const HAB_VUES = [
  { id: "MER", label: "Vue sur mer / Front de mer" },
  { id: "DUNES", label: "Vue sur les Dunes / Désert / Oasis" },
  { id: "MONTAGNE", label: "Vue sur montagne" },
  { id: "VILLE", label: "Vue sur la ville / Panoramique" },
  { id: "NATURE", label: "Vue sur la nature / Forêt / Campagne" },
  { id: "JARDIN", label: "Vue sur jardin / Cour intérieure / Piscine" },
  { id: "SANS_VUE", label: "Sans vue spécifique / Vis-à-vis" },
]
const HAB_ATTRACTIONS = [
  { id: "PLAGE", label: "Plage / Mer" },
  { id: "SITES_HISTORIQUES", label: "Sites historiques / Musées" },
  { id: "FORET", label: "Forêt / Sentier de randonnée" },
  { id: "RESTAURANTS", label: "Restaurants / Cafés / Salons de thé" },
  { id: "HAMMAM", label: "Station thermale (Hammam)" },
  { id: "CENTRE_COMMERCIAL", label: "Centre commercial / Souk" },
  { id: "COMMODITES", label: "Commodités (Supérette, Pharmacie, DAB)" },
]
const HAB_REPAS = [
  { id: "AUCUN", label: "Aucun repas" },
  { id: "PETIT_DEJ", label: "Petit-déjeuner inclus" },
  { id: "DEJEUNER", label: "Déjeuner" },
  { id: "DINER", label: "Dîner" },
]
const HAB_LINGE = [
  { id: "DRAPS", label: "Draps fournis" },
  { id: "SERVIETTES", label: "Serviettes fournies" },
  { id: "AUCUN", label: "Aucun linge fourni" },
]
const HAB_EQUIPEMENTS_CUISINE = [
  { id: "USTENSILES", label: "Ustensiles de base (Casseroles, couverts)" },
  { id: "RECHAUD", label: "Réchaud / Cuisinière" },
  { id: "FRIGO", label: "Réfrigérateur" },
  { id: "MICROONDES", label: "Micro-ondes" },
  { id: "CAFETIERE", label: "Machine à café" },
]
const HAB_CONFORT = [
  { id: "CLIM", label: "Climatisation" },
  { id: "CHAUFFAGE", label: "Chauffage" },
  { id: "TV", label: "Télévision (TV)" },
  { id: "WIFI", label: "Connexion Wi-Fi / Internet" },
  { id: "BUREAU", label: "Espace de travail dédié (Bureau)" },
  { id: "SECHE_CHEVEUX", label: "Sèche-cheveux" },
  { id: "MACHINE_LAVER", label: "Machine à laver" },
  { id: "FER_REPASSER", label: "Fer à repasser" },
]
const HAB_LOISIRS = [
  { id: "PISCINE", label: "Piscine privée / Réservée aux résidents" },
  { id: "AQUAPARK", label: "Parc aquatique / Toboggans (Aqua-park)" },
  { id: "SALLE_SPORT", label: "Salle de sport / Fitness" },
  { id: "SPA", label: "Spa / Centre de bien-être (Sauna, Hammam, Massages)" },
  { id: "TENNIS", label: "Terrain de Tennis" },
  { id: "PADEL", label: "Terrain de Padel" },
  { id: "MULTISPORTS", label: "Terrain Basket-ball / Multisports" },
  { id: "JEUX_ENFANTS", label: "Aire de jeux extérieure pour enfants" },
  { id: "JEUX_INTERIEUR", label: "Espace de jeux intérieur / Salle de jeux" },
  { id: "ESPACE_FAMILLE", label: "Espace loisirs famille (pique-nique, barbecue, jardin)" },
]
const HAB_SECOURS = [
  { id: "CITERNE", label: "Citerne d'eau / Réservoir avec pompe (Eau H24)" },
  { id: "CHAUFFE_EAU", label: "Chauffe-eau fonctionnel (Eau chaude en permanence)" },
  { id: "GROUPE_ELECTROGENE", label: "Groupe électrogène (Électricité de secours)" },
]
const HAB_PARKING = [
  { id: "PRIVE_GRATUIT", label: "Parking privé et sécurisé gratuit (Garage, cour fermée)" },
  { id: "PRIVE_PAYANT", label: "Parking privé payant" },
  { id: "RUE_GRATUIT", label: "Stationnement gratuit dans la rue" },
  { id: "GARDIEN_NUIT", label: "Gardien de nuit présent dans la rue" },
]
const HAB_ACCESSIBILITE = [
  { id: "PLAIN_PIED", label: "Plain-pied (Rez-de-chaussée, sans marches)" },
  { id: "ETAGE_ASCENSEUR", label: "À l'étage AVEC ascenseur" },
  { id: "ETAGE_SANS_ASCENSEUR", label: "À l'étage SANS ascenseur" },
]
const HAB_CONDITION_PAIEMENT = [
  { id: "100_AVANCE", label: "Paiement total à l'avance (100%) pour bloquer la réservation" },
  { id: "ACOMPTE", label: "Paiement d'un acompte, le reste à l'arrivée" },
  { id: "SUR_PLACE", label: "Paiement total sur place le jour de l'arrivée" },
]
const HAB_ACOMPTE_OPTIONS = [
  { id: "30", label: "30%" },
  { id: "50", label: "50%" },
]
const HAB_DELAI_ANNULATION = [
  { id: "24H", label: "24h à l'avance" },
  { id: "48H", label: "48h à l'avance" },
  { id: "7J", label: "7 jours" },
  { id: "14J", label: "14 jours" },
]
const HAB_NON_RESPECT = [
  { id: "AVANCE_CONSERVEE", label: "L'avance est conservée" },
  { id: "TOTALITE_DUE", label: "La totalité du séjour est due" },
]
const HAB_PAIEMENTS_LOCAUX = [
  { id: "ESPECES", label: "Espèces (Paiement sur place)" },
  { id: "VIREMENT_BANCAIRE", label: "Virement bancaire (Compte bancaire national)" },
  { id: "CCP", label: "Virement CCP (Compte Courant Postal)" },
  { id: "EDAHABIA", label: "Carte Edahabia (paiement en ligne ou TPE)" },
  { id: "BARIDIMOB", label: "BaridiMob (Transfert d'argent instantané)" },
]
const HAB_PAIEMENTS_INTL = [
  { id: "VISA", label: "Carte VISA" },
  { id: "MASTERCARD", label: "MasterCard" },
]
// ===========================

// ===== HÉBERGEMENT & SÉJOUR (Particulier : location de séjour / Professionnel : établissement) =====
const HS_STRUCTURE_TYPES = [
  { id: "VILLA", label: "Villa" },
  { id: "NIVEAU_VILLA", label: "Niveau de villa (appartement ou étage indépendant dans une villa)" },
  { id: "APPARTEMENT", label: "Appartement (en immeuble)" },
  { id: "BUNGALOW", label: "Bungalow" },
  { id: "CHALET", label: "Chalet" },
  { id: "INSOLITE", label: "Hébergement insolite" },
]
const HS_TYPE_ETABLISSEMENT = [
  { id: "HOTEL", label: "Hôtel" },
  { id: "COMPLEXE_TOURISTIQUE", label: "Complexe touristique" },
  { id: "APPARTHOTEL", label: "Apparthôtel" },
  { id: "VILLA_VACANCES", label: "Villa de vacances" },
  { id: "RESIDENCE_HOTELIERE", label: "Résidence hôtelière" },
  { id: "CAMPING_TOURISTIQUE", label: "Camping touristique" },
  { id: "AUTRE", label: "Autre structure" },
]
const HS_TYPE_SALON = [
  { id: "CANAPE_CONVERTIBLE", label: "Salon avec canapé(s) convertible(s)", desc: "Espace comprenant un ou plusieurs canapés transformables en lits d'appoint pour les voyageurs" },
  { id: "ASSISES_FIXES", label: "Salon à assises fixes", desc: "Espace de vie équipé uniquement de canapés, banquettes ou fauteuils non transformables en lits, dédiés exclusivement à la détente" },
]
const HS_PROFIL_ADAPTATION = [
  { id: "FAMILLES", label: "Adaptée aux familles", desc: "Espace idéal pour voyager avec des enfants, configuration adaptée" },
  { id: "GROUPES_AMIS", label: "Adaptée aux groupes d'amis", desc: "Plusieurs couchages simples ou superposés pour partager le séjour" },
  { id: "PROFESSIONNELS", label: "Adaptée aux professionnels (Corporate)", desc: "Espace bureau dédié avec plan de travail et chaise confortable, bonne connexion Wi-Fi" },
]
const HS_PROFIL_ADAPTATION_PLACE_LIT = [
  { id: "SOLO_TRAVELERS", label: "Adapté aux Solo Travelers / Voyageurs solitaires", desc: "Randonneurs, routards, baroudeurs, personnes voyageant seules pour le travail ou le tourisme" },
  { id: "GROUPES_AMIS", label: "Adapté aux Groupes d'amis", desc: "Amis souhaitant partager la même chambre ou le même espace lors d'un séjour, d'un week-end ou d'un événement" },
  { id: "PROFESSIONNELS_NOMADS", label: "Adapté aux Professionnels / Digital Nomads", desc: "Voyageurs d'affaires ou travailleurs à distance recherchant une solution économique ou un espace bureau" },
  { id: "FAMILLES", label: "Adapté aux Familles", desc: "Convient uniquement si la famille réserve l'intégralité d'une chambre partagée pour elle seule" },
  { id: "STAGIAIRES_ETUDIANTS", label: "Adapté aux Stagiaires, Étudiants ou Travailleurs en mission temporaire", desc: "Personnes ayant besoin d'un pied-à-terre pour quelques semaines ou mois" },
]
const HS_ESPACES_COMMUNS = [
  { id: "SDB_PARTAGEE", label: "Salle de bain partagée" },
  { id: "CUISINE_PARTAGEE", label: "Cuisine partagée et équipée" },
  { id: "SALON_PARTAGE", label: "Salon / Espace détente partagé" },
  { id: "JARDIN_TERRASSE", label: "Jardin, terrasse ou espace extérieur" },
]
const HS_EQUIPEMENTS_PLACE_LIT = [
  { id: "CASIER_SECURISE", label: "Casier sécurisé / Coffre" },
  { id: "LINGE_FOURNI", label: "Linge de lit fourni (draps, oreiller)" },
  { id: "PRISE_LISEUSE", label: "Prise de courant / liseuse individuelle près du lit" },
]
// ===========================

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

// Type d'accès — spécifique au niveau de villa, à choix unique. Le "cadre" (quartier classique /
// résidence clôturée / promotion immobilière) est géré séparément par APARTMENT_LIFESTYLE_TYPES,
// à choix multiple, commun à tous les types de biens d'habitation.
const ENTRY_ACCESS_TYPES = [
    {
        id: "ENTREE_INDEPENDANTE",
        label: "Entrée indépendante",
        description: "Accès indépendant au niveau de villa"
    },
    {
        id: "ENTREE_COMMUNE",
        label: "Entrée commune",
        description: "Accès partagé (entrée commune)"
    },
]

const APARTMENT_LIFESTYLE_TYPES = [
    {
        id: "QUARTIER_OUVERT",
        label: "Quartier classique",
        description: "Quartier classique"
    },
    {
        id: "RESIDENCE_CLOTUREE",
        label: "Résidence clôturée",
        description: "Résidence clôturée"
    },
    {
        id: "PROMOTION_IMMOBILIERE",
        label: "Promotion immobilière",
        description: "Promotion immobilière"
    }
]

const BUILDING_TYPOLOGY_MODES = [
    { id: "SIMILAIRES", label: "Immeuble avec Appartements de typologies similaires" },
    { id: "DIFFERENTES", label: "Immeuble avec Appartements de typologies différentes" }
]

const BUILDING_SURFACE_MODES = [
    { id: "UNIQUE", label: "Surface unique" },
    { id: "MULTI", label: "Multi-surfaces" }
]

const BUILDING_APARTMENT_STYLES = [
    { id: "SIMPLEX", label: "Simplex" },
    { id: "DUPLEX", label: "Duplex" },
    { id: "TRIPLEX", label: "Triplex" }
]

const BUILDING_APARTMENT_TYPOLOGIES = [
    { id: "F2", label: "F2" },
    { id: "F3", label: "F3" },
    { id: "F4", label: "F4" },
    { id: "F5", label: "F5" },
    { id: "F6", label: "F6" },
    { id: "F7", label: "F7" },
    { id: "F8", label: "F8" },
    { id: "F9", label: "F9" },
    { id: "F10", label: "F10" },
    { id: "F10_PLUS", label: "+ de F10" },
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
    { id: "pool", label: "Piscine", icon: "LifeBuoy" },
    { id: "playground", label: "Espace extérieur", icon: "Dumbbell" },
    { id: "barbecue", label: "Barbecue", icon: "Flame" },
    { id: "elevator", label: "Ascenseur", icon: "Layers" },
  ],
  utilities: [
    { id: "water_tank", label: "Bâche à eau", icon: "Droplet" },
    { id: "generator", label: "Groupe électrogène", icon: "Battery" },
    { id: "central_heating", label: "Chauffage central", icon: "Flame" },
  ],
  security: [
    { id: "cameras", label: "Caméras", icon: "Video" },
    { id: "alarm", label: "Alarme", icon: "Lock" },
    { id: "guardian", label: "Gardiennage 24/7", icon: "Shield" },
  ],
  connectivity: [
    { id: "fiber", label: "Fibre", icon: "Wifi" },
    { id: "adsl", label: "ADSL", icon: "Reseau" },
    { id: "phone_line", label: "Ligne fixe", icon: "Phone" },
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

const upsertArrayValue = (arr: unknown, value: string, checked: boolean) => {
    const base = Array.isArray(arr) ? arr.map(String) : []
    if (checked) return Array.from(new Set([...base, value]))
    return base.filter((v) => v !== value)
}

const normalizeDzPhoneToIntlDigits = (raw: string) => {
    const digits = String(raw || "").replace(/\D/g, "")
    if (!digits) return ""
    if (digits.startsWith("2130")) return "213" + digits.slice(4)
    if (digits.startsWith("213")) return digits
    if (digits.startsWith("0")) return "213" + digits.slice(1)
    if (digits.length === 9) return "213" + digits
    return digits
}

const normalizeToStringArray = (v: unknown) => {
  if (!v) return [] as string[]
  if (Array.isArray(v)) return v.filter(Boolean).map(String)
  if (typeof v === "string") return v ? [v] : []
  return []
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
  price: z.string().optional().or(z.literal("")),
  priceUnit: z.enum(["DA", "DA_M2", "MILLION", "MILLION_M2", "MILLIARD"]),
  priceType: z.enum(["FIXED", "NEGOTIABLE"]),
  paymentModality: z.enum(["MONTHLY", "QUARTERLY", "SEMI_ANNUAL", "ANNUAL"]).optional(),
  
  // Champs techniques pour le mapping
  area: z.string().optional(),
  rooms: z.string().optional(),

  floorCount: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 50), "Nombre d'étages invalide (0-50)"),
  extraFloor: z.enum(["basement", "entresol", "attic", "none"]),
  typology: z.string().optional(),
  buildingTypologyMode: z.enum(["SIMILAIRES", "DIFFERENTES"]).optional(),
  buildingApartmentTypologyCustom: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), "Typologie invalide"),
  buildingTotalApartments: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), "Nombre invalide"),
  buildingSurfaceMode: z.enum(["UNIQUE", "MULTI"]).optional(),
  buildingApartmentTypologies: stringArrayOptional,
  buildingApartmentTypologyOther: z.string().optional(),
  buildingApartmentStyle: stringArrayOptional,
  buildingUsageTypes: stringArrayOptional,
  buildingCountF3: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), "Nombre invalide"),
  buildingCountF4: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), "Nombre invalide"),
  buildingCountF5: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), "Nombre invalide"),
  bedrooms: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), "Nombre de chambres invalide"),
  nbSuites: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), "Nombre invalide"),
  livingRooms: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), "Nombre de salons invalide"),
  bathrooms: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), "Nombre de salles de bain invalide"),
  bathroomType: z.enum(["italian_shower", "bathtub", "both", "none"]).optional(),
  wc: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), "Nombre de WC invalide"),
  landArea: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), "Surface du terrain invalide"),
  builtArea: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), "Surface bâtie invalide"),
  habitableArea: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), "Surface invalide"),
  facadesCount: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), "Nombre invalide"),
  state: z.enum(["NEUF", "RENOVE", "BON_ETAT", "A_DEMOLIR"]).optional(),
  parkingCount: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), "Nombre invalide"),
  outdoorParking: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), "Nombre invalide"),
  usageType: z.enum([
      "UNIQUE",
      "SEPARE",
      "ENTREE_INDEPENDANTE",
      "ENTREE_COMMUNE",
      "QUARTIER_OUVERT",
      "RESIDENCE_CLOTUREE",
      "PROMOTION_IMMOBILIERE"
  ]).optional(),
  cadreModeVie: z.enum([
      "RESIDENCE_FERMEE_PROMOTION",
      "QUARTIER_RESIDENTIEL_STANDING",
      "QUARTIER_CLASSIQUE"
  ]).optional(),
  kitchenType: z.enum(["AMERICAINE", "FERMEE", "SEMI_OUVERTE"]).optional(),
  kitchenState: z.enum(["EQUIPEE", "AMENAGEE", "VIDE"]).optional(),
  heatingType: z.enum(["CENTRAL", "SOL", "GAZ"]).optional(),
  acType: z.enum(["CENTRAL", "SPLIT", "SANS"]).optional(),
  waterCounter: z.enum(["INDIVIDUEL", "COMMUN"]).optional(),
  elecCounter: z.enum(["INDIVIDUEL", "COMMUN"]).optional(),
  gasCounter: z.enum(["INDIVIDUEL", "COMMUN"]).optional(),
  depositMonths: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), "Nombre invalide"),
  rentalUsage: stringArrayOptional,
  chargesIncluded: z.preprocess((v) => {
    if (v === "true") return true
    if (v === "false") return false
    return v
  }, z.boolean().optional()),
  availableDate: z.string().optional(),

  industrialSector: stringArrayOptional,
  industrialSectorOther: z.string().optional().or(z.literal("")),
  industrialProductDetail: z.string().optional().or(z.literal("")),
  industrialRentalType: z.enum(["MURS_NUS", "EQUIPEE"]).optional(),
  industrialGlobalState: z.enum(["NEUF", "BON_ETAT_MARCHE", "ANCIEN"]).optional(),
  industrialServiceYear: z.string().optional().or(z.literal("")),
  industrialConfiguration: z.enum(["PLAIN_PIED", "ETAGES"]).optional(),
  industrialFloorsCount: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), "Nombre invalide"),
  industrialSurfaceFree: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), "Surface invalide"),
  industrialStructureOssature: stringArrayOptional,
  industrialStructureToiture: stringArrayOptional,
  industrialStructureMurs: stringArrayOptional,
  industrialHsp: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), "Hauteur invalide"),
  industrialSituation: stringArrayOptional,
  industrialAccessTransport: stringArrayOptional,
  industrialHighwayDistanceKm: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), "Distance invalide"),
  industrialAccessProduction: stringArrayOptional,
  industrialOffices: z.preprocess((v) => {
    if (v === "true") return true
    if (v === "false") return false
    return v
  }, z.boolean().optional()),
  industrialOfficesArea: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), "Surface invalide"),
  industrialSocialLocales: stringArrayOptional,
  industrialHebergement: stringArrayOptional,
  industrialDormitoryCapacity: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), "Capacité invalide"),
  industrialSecurity: stringArrayOptional,
  industrialElectricityTransformerKva: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), "KVA invalide"),
  industrialElectricityForceMotrice: z.preprocess((v) => {
    if (v === "true") return true
    if (v === "false") return false
    return v
  }, z.boolean().optional()),
  industrialGas: stringArrayOptional,
  industrialWaterSources: stringArrayOptional,
  industrialWaterTankCapacityLiters: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), "Capacité invalide"),
  industrialSanitation: stringArrayOptional,
  industrialFireNetwork: stringArrayOptional,
  industrialFireEquipment: stringArrayOptional,
  industrialFireWaterReserveLiters: z.string().optional().refine((val) => { const n = Number((val || '').replace(/\s/g, '')); return !val || (!isNaN(n) && n > 0) }, "Volume invalide"),

  // Hangar
  hangarUsage: stringArrayOptional,
  hangarZone: stringArrayOptional,
  hangarConfiguration: stringArrayOptional,
  hangarSurfaceCovered: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), "Surface invalide"),
  hangarSurfaceTerrain: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), "Surface invalide"),
  hangarLength: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), "Valeur invalide"),
  hangarWidth: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), "Valeur invalide"),
  hangarHeight: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), "Valeur invalide"),
  hangarAccessSemiRemorque: z.preprocess((v) => { if (v === "true") return true; if (v === "false") return false; return v }, z.boolean().optional()),
  hangarAccessQuai: z.preprocess((v) => { if (v === "true") return true; if (v === "false") return false; return v }, z.boolean().optional()),
  hangarStructureBeton: z.preprocess((v) => { if (v === "true") return true; if (v === "false") return false; return v }, z.boolean().optional()),
  hangarStructureMetallique: z.preprocess((v) => { if (v === "true") return true; if (v === "false") return false; return v }, z.boolean().optional()),
  hangarStructureToleTH40: z.preprocess((v) => { if (v === "true") return true; if (v === "false") return false; return v }, z.boolean().optional()),
  hangarStructurePanneauxSandwich: z.preprocess((v) => { if (v === "true") return true; if (v === "false") return false; return v }, z.boolean().optional()),
  hangarSolBetonQuartz: z.preprocess((v) => { if (v === "true") return true; if (v === "false") return false; return v }, z.boolean().optional()),
  hangarSolResineEpoxy: z.preprocess((v) => { if (v === "true") return true; if (v === "false") return false; return v }, z.boolean().optional()),
  hangarPosteTransfo: z.preprocess((v) => { if (v === "true") return true; if (v === "false") return false; return v }, z.boolean().optional()),
  hangarPosteTransfoKva: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), "KVA invalide"),
  hangarForceMotrice: z.preprocess((v) => { if (v === "true") return true; if (v === "false") return false; return v }, z.boolean().optional()),
  hangarGazIndustriel: z.preprocess((v) => { if (v === "true") return true; if (v === "false") return false; return v }, z.boolean().optional()),
  hangarEauReseau: z.preprocess((v) => { if (v === "true") return true; if (v === "false") return false; return v }, z.boolean().optional()),
  hangarEauPuits: z.preprocess((v) => { if (v === "true") return true; if (v === "false") return false; return v }, z.boolean().optional()),
  hangarFireRia: z.preprocess((v) => { if (v === "true") return true; if (v === "false") return false; return v }, z.boolean().optional()),
  hangarFireBacheEau: z.preprocess((v) => { if (v === "true") return true; if (v === "false") return false; return v }, z.boolean().optional()),
  hangarFireBacheEauFeu: z.preprocess((v) => { if (v === "true") return true; if (v === "false") return false; return v }, z.boolean().optional()),
  hangarFireBacheEauProduction: z.preprocess((v) => { if (v === "true") return true; if (v === "false") return false; return v }, z.boolean().optional()),
  hangarJuridiqueActe: z.preprocess((v) => { if (v === "true") return true; if (v === "false") return false; return v }, z.boolean().optional()),
  hangarJuridiqueCertificat: z.preprocess((v) => { if (v === "true") return true; if (v === "false") return false; return v }, z.boolean().optional()),
  hangarToitureAutre: z.preprocess((v) => { if (v === "true") return true; if (v === "false") return false; return v }, z.boolean().optional()),
  hangarSolAutre: z.preprocess((v) => { if (v === "true") return true; if (v === "false") return false; return v }, z.boolean().optional()),

  // Chambre froide
  cfSector: stringArrayOptional,
  cfSectorOther: z.string().optional().or(z.literal("")),
  cfLocalisation: stringArrayOptional,
  cfStructureType: z.string().optional(),
  cfConfiguration: z.string().optional(),
  cfFloorsCount: z.string().optional(),
  cfLogistiqueVerticale: z.string().optional(),
  cfMonteChargeCapacity: z.string().optional(),
  cfAccessibilite: stringArrayOptional,
  cfZoneDechargement: stringArrayOptional,
  cfGenerateur: z.preprocess((v) => { if (v === "true") return true; if (v === "false") return false; return v }, z.boolean().optional()),
  cfGenerateurKva: z.string().optional(),
  cfTracabilite: stringArrayOptional,
  cfTechniqueFroid: stringArrayOptional,
  cfSecuriteHumaine: z.preprocess((v) => { if (v === "true") return true; if (v === "false") return false; return v }, z.boolean().optional()),
  cfLength: z.string().optional(),
  cfWidth: z.string().optional(),
  cfHeight: z.string().optional(),
  cfCapacity: z.string().optional(),
  cfEtatGlobal: z.enum(["NEUF", "BON_ETAT_MARCHE", "ANCIEN"]).optional(),
  cfTypeFroid: stringArrayOptional,
  cfModeDiffusion: stringArrayOptional,
  cfModeGestion: z.string().optional(),
  cfFlexibilite: stringArrayOptional,
  cfDureeEngagement: stringArrayOptional,

  // Terrain
  terrainFacadeLength: z.string().optional(),
  terrainDepth: z.string().optional(),
  terrainTopographie: z.string().optional(),
  terrainStatutZone: stringArrayOptional,
  terrainDocuments: stringArrayOptional,
  terrainViabilise: z.preprocess((v) => { if (v === "true") return true; if (v === "false") return false; return v }, z.boolean().optional()),
  terrainRaccordements: stringArrayOptional,

  // Terrain Agricole (champs spécifiques)
  terrainAgricoleUnite: z.string().optional(),
  terrainAgricoleVocation: stringArrayOptional,
  terrainAgricoleVocationAutre: z.string().optional(),
  terrainAgricoleRessourcesEau: stringArrayOptional,
  terrainAgricoleDebitForage: z.string().optional(),
  terrainAgricoleExposition: stringArrayOptional,
  terrainAgricoleEnsoleillement: z.string().optional(),
  terrainAgricoleNatureSol: stringArrayOptional,
  terrainAgricoleAltitude: z.string().optional(),
  terrainAgricoleQualiteEau: z.string().optional(),
  terrainAgricoleEquipementHydro: stringArrayOptional,
  terrainAgricoleEtatCulture: z.string().optional(),
  terrainAgricoleTypeCulture: stringArrayOptional,
  terrainAgricoleTypeCultureAutre: z.string().optional(),
  terrainAgricoleAcces: stringArrayOptional,
  terrainAgricoleAccesLourds: stringArrayOptional,
  terrainAgricoleConstructions: stringArrayOptional,
  terrainAgricoleCloture: z.string().optional(),
  terrainAgricoleZone: z.string().optional(),
  // Terrain Touristique
  terrainTouristiqueZone: z.string().optional(),
  terrainTouristiqueZoneAutre: z.string().optional(),
  terrainTouristiqueZet: z.string().optional(),
  terrainTouristiqueZetNom: z.string().optional(),
  terrainTouristiquePat: z.string().optional(),
  terrainTouristiqueReseaux: stringArrayOptional,
  // Immeuble Bureau/Commercial
  immeubleSurfaceTerrain: z.string().optional(),
  immeubleSurfaceBatie: z.string().optional(),
  immeubleLargeur: z.string().optional(),
  immeubleNbEtages: z.string().optional(),
  immeubleHsp: z.string().optional(),
  immeubleEtatGlobal: z.string().optional(),
  immeubleTypeZone: stringArrayOptional,
  immeubleVisibilite: stringArrayOptional,
  immeubleNbRideaux: z.string().optional(),
  immeubleFacadeLineaire: z.string().optional(),
  immeubleTypeAcces: z.string().optional(),

  // Showroom
  showroomSurfaceTerrain: z.string().optional(),
  showroomSurfaceBatie: z.string().optional(),
  showroomNiveaux: z.string().optional(),
  showroomFacadeWidth: z.string().optional(),
  showroomFacadeDepth: z.string().optional(),
  showroomHauteurPlafond: z.string().optional(),
  showroomStyle: stringArrayOptional,
  showroomStructure: stringArrayOptional,
  showroomStructureAutre: z.string().optional(),
  showroomVisibiliteAutoroute: z.preprocess((v) => { if (v === "true") return true; if (v === "false") return false; return v }, z.boolean().optional()),
  showroomAxeRoutier: z.string().optional(),

  // Local Commercial
  localEnvironnement: stringArrayOptional,
  localEnvironnementAutre: z.string().optional(),
  localSurfaceTotal: z.string().optional(),
  localVitrineLongueur: z.string().optional(),
  localLargeur: z.string().optional(),
  localProfondeur: z.string().optional(),
  localHauteurPlafond: z.string().optional(),
  localNbEtages: z.string().optional(),
  localMezzanine: z.preprocess((v) => { if (v === "true") return true; if (v === "false") return false; return v }, z.boolean().optional()),
  localMezzanineSurface: z.string().optional(),
  localStyle: z.string().optional(),
  localZoneType: stringArrayOptional,
  localFluxPieton: z.string().optional(),
  localFluxVehicules: z.string().optional(),
  localUsage: stringArrayOptional,

  // Bloc Administratif
  blocSurfaceTerrain: z.string().optional(),
  blocSurfaceBatie: z.string().optional(),
  blocEtages: z.string().optional(),
  blocSousSol: z.preprocess((v) => { if (v === "true") return true; if (v === "false") return false; return v }, z.boolean().optional()),
  blocFacades: z.string().optional(),
  blocTypeEspace: stringArrayOptional,
  blocTypeCloisonnement: stringArrayOptional,
  blocCuisine: z.string().optional(),
  blocLogementFonction: z.preprocess((v) => { if (v === "true") return true; if (v === "false") return false; return v }, z.boolean().optional()),
  blocConnectivite: z.string().optional(),
  blocTypeConnexion: stringArrayOptional,
  blocEquipementServeur: stringArrayOptional,

  // Hébergement chez l'habitant
  habClientProfile: z.string().optional(),
  habFormule: z.string().optional(),
  habTypeChambre: z.string().optional(),
  habUnitType: z.string().optional(),
  habUnitTypeInsolite: z.string().optional(),
  habArea: z.string().optional(),
  habFloor: z.string().optional(),
  habNbNiveaux: z.string().optional(),
  habNbSalons: z.string().optional(),
  habNbSdb: z.string().optional(),
  habSuiteParentale: z.preprocess((v) => { if (v === "true") return true; if (v === "false") return false; return v }, z.boolean().optional()),
  habNbChambres: z.string().optional(),
  habBedKingPremium: z.string().optional(),
  habBedKing: z.string().optional(),
  habBedQueen: z.string().optional(),
  habBedDoubleStd: z.string().optional(),
  habBedSimpleAdulte: z.string().optional(),
  habBedSimpleEnfant: z.string().optional(),
  habBedSuperpose: z.string().optional(),
  habBedMatelasSol: z.string().optional(),
  habBedBebe: z.string().optional(),
  habAmbiances: stringArrayOptional,
  habPlageAcces: z.string().optional(),
  habUrbainCommodites: stringArrayOptional,
  habSaharienActivites: stringArrayOptional,
  habThermalLocalisation: z.string().optional(),
  habThermalDistance: z.string().optional(),
  habThermalAcces: z.string().optional(),
  habClimatAcces: z.string().optional(),
  habClimatTempsVoiture: z.string().optional(),
  habClimatVisitesGuidees: z.preprocess((v) => { if (v === "true") return true; if (v === "false") return false; return v }, z.boolean().optional()),
  habClimatPisteSki: z.preprocess((v) => { if (v === "true") return true; if (v === "false") return false; return v }, z.boolean().optional()),
  habVues: stringArrayOptional,
  habAirport: z.string().optional(),
  habAirportKm: z.string().optional(),
  habTransportCommuns: z.string().optional(),
  habAttractions: stringArrayOptional,
  habRepas: stringArrayOptional,
  habLinge: stringArrayOptional,
  habHygiene: z.preprocess((v) => { if (v === "true") return true; if (v === "false") return false; return v }, z.boolean().optional()),
  habLivraison: z.preprocess((v) => { if (v === "true") return true; if (v === "false") return false; return v }, z.boolean().optional()),
  habCuisineEquipements: stringArrayOptional,
  habConfort: stringArrayOptional,
  habLoisirs: stringArrayOptional,
  habSecours: stringArrayOptional,
  habParking: stringArrayOptional,
  habAccessibilite: z.string().optional(),
  habAgeMin: z.string().optional(),
  habFumeurs: z.preprocess((v) => { if (v === "true") return true; if (v === "false") return false; return v }, z.boolean().optional()),
  habAnimaux: z.preprocess((v) => { if (v === "true") return true; if (v === "false") return false; return v }, z.boolean().optional()),
  habFetes: z.preprocess((v) => { if (v === "true") return true; if (v === "false") return false; return v }, z.boolean().optional()),
  habCheckIn: z.string().optional(),
  habCheckOut: z.string().optional(),
  habReceptionMode: z.string().optional(),
  habReceptionStart: z.string().optional(),
  habReceptionEnd: z.string().optional(),
  habRemiseCles: z.string().optional(),
  habControleIdentite: z.string().optional(),
  habConditionPaiement: z.string().optional(),
  habAcompte: z.string().optional(),
  habAnnulation: z.string().optional(),
  habDelaiAnnulation: z.string().optional(),
  habNonRespect: z.string().optional(),
  habCaution: z.preprocess((v) => { if (v === "true") return true; if (v === "false") return false; return v }, z.boolean().optional()),
  habCautionMontant: z.string().optional(),
  habFraisMenage: z.string().optional(),
  habFraisMenageMontant: z.string().optional(),
  habPaiements: stringArrayOptional,
  habDureeMin: z.string().optional(),
  habPeriodeOuverture: z.string().optional(),
  habDebutSaison: z.string().optional(),
  habFinSaison: z.string().optional(),
  habDelaiPreparation: z.string().optional(),

  // Hébergement & Séjour (fiche "Type de bien" — particulier : location de séjour, professionnel :
  // établissement précédé du bloc classification)
  hsClassification: z.string().optional(),
  hsNombreEtoiles: z.string().optional(),
  hsTypeEtablissement: z.string().optional(),
  hsTypeEtablissementAutre: z.string().optional(),
  hsTypeBien: z.string().optional(),
  hsStructureType: z.string().optional(),
  hsStructureTypeInsolite: z.string().optional(),
  hsMcSurface: z.string().optional(),
  hsMcEtage: z.string().optional(),
  hsMcAscenseur: z.string().optional(),
  hsMcNbChambres: z.string().optional(),
  hsMcSuiteParentale: z.preprocess((v) => { if (v === "true") return true; if (v === "false") return false; return v }, z.boolean().optional()),
  hsMcNbSalons: z.string().optional(),
  hsMcNbSdb: z.string().optional(),
  hsMcNbWc: z.string().optional(),
  hsMcLitsTotal: z.string().optional(),
  hsMcLitKing: z.string().optional(),
  hsMcLitQueen: z.string().optional(),
  hsMcLitDouble: z.string().optional(),
  hsMcLitSimple: z.string().optional(),
  hsMcLitSuperpose: z.string().optional(),
  hsMcLitGigogne: z.string().optional(),
  hsMcLitBebe: z.string().optional(),
  hsMcTypeSalon: z.string().optional(),
  hsMcNbCanapesConvertibles: z.string().optional(),
  hsMcNbCouchagesAppoint: z.string().optional(),
  hsMcProfilAdaptation: stringArrayOptional,
  hsMcVoyageursMax: z.string().optional(),
  hsMcPolitiqueEnfants: z.string().optional(),
  hsChPrecision: z.string().optional(),
  hsChChezHabitant: z.preprocess((v) => { if (v === "true") return true; if (v === "false") return false; return v }, z.boolean().optional()),
  hsChSurface: z.string().optional(),
  hsChLitsTotal: z.string().optional(),
  hsChLitKing: z.string().optional(),
  hsChLitQueen: z.string().optional(),
  hsChLitDouble: z.string().optional(),
  hsChLitSimple: z.string().optional(),
  hsChLitSuperpose: z.string().optional(),
  hsChLitBebe: z.string().optional(),
  hsChEspacesCommuns: stringArrayOptional,
  hsChNbDouches: z.string().optional(),
  hsChNbWc: z.string().optional(),
  hsChProfilAdaptation: stringArrayOptional,
  hsChVoyageursMax: z.string().optional(),
  hsChPolitiqueEnfants: z.string().optional(),
  hsPlTypeCouchage: z.string().optional(),
  hsPlPosition: z.string().optional(),
  hsPlNbLitsPiece: z.string().optional(),
  hsPlEquipements: stringArrayOptional,
  hsPlEspacesCommuns: stringArrayOptional,
  hsPlNbDouches: z.string().optional(),
  hsPlNbWc: z.string().optional(),
  hsPlProfilAdaptation: stringArrayOptional,
  hsPlVoyageursMax: z.string().optional(),
  hsPlPolitiqueEnfants: z.string().optional(),

  acceptsCrossUsage: z.preprocess((v) => { if (v === "true") return true; if (v === "false") return false; return v }, z.boolean().optional()),
  acceptsBankCredit: z.enum(["YES", "NO", "NO_PREFERENCE"]).optional(),
  legalDocuments: stringArrayOptional,
  
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
    const isVillaDemolition = data.propertyType === "VILLA" && data.state === "A_DEMOLIR"
    const isBuildingDemolition = data.transactionType === "SALE" && data.propertyType === "IMMEUBLE_RESIDENTIEL" && data.state === "A_DEMOLIR"
    const isFactoryRental =
        data.transactionType === "RENTAL" &&
        data.realEstateType === "INDUSTRIEL" &&
        data.propertyType === "USINE"
    const isColdRoomRental =
        data.transactionType === "RENTAL" &&
        data.realEstateType === "INDUSTRIEL" &&
        data.propertyType === "CHAMBRE_FROIDE"
    const isHangarRental =
        data.transactionType === "RENTAL" &&
        data.realEstateType === "INDUSTRIEL" &&
        data.propertyType === "HANGAR"
    const isTerrainRental =
        data.transactionType === "RENTAL" &&
        ["TERRAIN_RESIDENTIEL", "TERRAIN_INDUSTRIEL", "TERRAIN_AGRICOLE", "TERRAIN_TOURISTIQUE"].includes(data.propertyType)
    // Types purement commerciaux sans champs résidentiels
    const isSpecialBureauCommerce = ["SHOWROOM", "LOCAL_COMMERCIAL", "BLOC_ADMINISTRATIF", "IMMEUBLE_COMMERCIAL", "IMMEUBLE_BUREAU"].includes(data.propertyType)
    // Commerciaux hybrides (ont state/bedrooms mais pas cuisine/chauffage/compteurs)
    const isBureauCommerceHybrid = ["VILLA_COMMERCIALE", "NIVEAU_VILLA_COMMERCIAL", "APPARTEMENT_COMMERCIAL"].includes(data.propertyType)
    const isAnyCommercial = isSpecialBureauCommerce || isBureauCommerceHybrid

    if (isFactoryRental || isColdRoomRental || isHangarRental || isTerrainRental) {
        return
    } else {
        if (!data.price || data.price.trim().length === 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Prix requis", path: ["price"] })
        } else {
            const num = Number(String(data.price).replace(/\s/g, ""))
            if (isNaN(num) || num <= 0) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Prix invalide", path: ["price"] })
            }
        }

        if (!data.state && !isSpecialBureauCommerce) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "État du bien requis", path: ["state"] })
        }

    const shouldRequireFloorCount =
        data.propertyType === "VILLA" ||
        data.propertyType === "NIVEAU_VILLA" ||
        data.propertyType === "APPARTEMENT" ||
        data.propertyType === "DUPLEX" ||
        data.propertyType === "TRIPLEX" ||
        data.propertyType === "STUDIO" ||
        (data.propertyType === "IMMEUBLE_RESIDENTIEL" && !isBuildingDemolition)
    if (shouldRequireFloorCount && !data.floorCount) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: data.propertyType === "IMMEUBLE_RESIDENTIEL" ? "Nombre d'étages requis" : "Requis",
            path: ["floorCount"],
        })
    }
    
    if (
        data.propertyType === "VILLA" ||
        data.propertyType === "NIVEAU_VILLA" ||
        data.propertyType === "APPARTEMENT" ||
        data.propertyType === "DUPLEX" ||
        data.propertyType === "TRIPLEX" ||
        data.propertyType === "STUDIO"
    ) {
        const shouldRequireTypology = !(data.propertyType === "VILLA" && data.state === "A_DEMOLIR")
        if (shouldRequireTypology && !data.typology) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Typologie requise", path: ["typology"] })
        }
    }

    if (data.propertyType === "VILLA" || data.propertyType === "VILLA_COMMERCIALE") {
        if (!data.landArea) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Surface terrain requise", path: ["landArea"] })
        }
        if (!data.builtArea) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Surface bâtie requise", path: ["builtArea"] })
        }
        if (!isVillaDemolition) {
            if (!(data.usageType === "UNIQUE" || data.usageType === "SEPARE")) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Mode de vie requis", path: ["usageType"] })
            }
        }
    }

    if (data.propertyType === "NIVEAU_VILLA" || data.propertyType === "NIVEAU_VILLA_COMMERCIAL") {
        if (!data.area || isNaN(Number(data.area)) || Number(data.area) <= 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Surface requise", path: ["area"] })
        }
        if (!["ENTREE_INDEPENDANTE", "ENTREE_COMMUNE"].includes(data.usageType || "")) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Type d'accès requis", path: ["usageType"] })
        }
    }

    if (data.propertyType === "APPARTEMENT" || data.propertyType === "APPARTEMENT_COMMERCIAL") {
        if (!data.area || isNaN(Number(data.area)) || Number(data.area) <= 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Surface requise", path: ["area"] })
        }
    }

    if (data.propertyType === "DUPLEX" || data.propertyType === "TRIPLEX" || data.propertyType === "STUDIO") {
        if (!data.area || isNaN(Number(data.area)) || Number(data.area) <= 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Surface requise", path: ["area"] })
        }
    }
    
    if (data.propertyType === "IMMEUBLE_RESIDENTIEL" || data.propertyType === "IMMEUBLE_BUREAU") {
        if (isBuildingDemolition) {
            if (!data.landArea || isNaN(Number(data.landArea)) || Number(data.landArea) <= 0) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Surface terrain requise", path: ["landArea"] })
            }
        } else {
            if (!data.buildingTypologyMode) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Typologie requise", path: ["buildingTypologyMode"] })
            }
            
            if (data.buildingTypologyMode === "SIMILAIRES") {
                if (!data.buildingApartmentTypologyCustom) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Typologie des appartements requise", path: ["buildingApartmentTypologyCustom"] })
                }
                if (!data.buildingTotalApartments) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Nombre d'appartements requis", path: ["buildingTotalApartments"] })
                }
                if (!data.buildingSurfaceMode) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Choisissez le type de surface", path: ["buildingSurfaceMode"] })
                } else if (data.buildingSurfaceMode === "UNIQUE") {
                    if (!data.area || isNaN(Number(data.area)) || Number(data.area) <= 0) {
                        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Surface requise", path: ["area"] })
                    }
                }
            }
            
            if (data.buildingTypologyMode === "DIFFERENTES") {
                const selected = data.buildingApartmentTypologies || []
                if (selected.length === 0) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Sélectionnez au moins une typologie", path: ["buildingApartmentTypologies"] })
                }
                if (!data.buildingTotalApartments) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Nombre d'appartements requis", path: ["buildingTotalApartments"] })
                }
                if (selected.includes("F10_PLUS") && (!data.buildingApartmentTypologyOther || data.buildingApartmentTypologyOther.trim().length === 0)) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Saisissez les typologies au-delà de F10", path: ["buildingApartmentTypologyOther"] })
                }
                if (!data.buildingApartmentStyle || data.buildingApartmentStyle.length === 0) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Style d'appartement requis", path: ["buildingApartmentStyle"] })
                }
            }
        }
    }

    if (!isVillaDemolition && !isBuildingDemolition && !isAnyCommercial && !data.kitchenType) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Type de cuisine requis", path: ["kitchenType"] })
    }
    if (!isVillaDemolition && !isBuildingDemolition && !isAnyCommercial && !data.heatingType) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Type de chauffage requis", path: ["heatingType"] })
    }
    if (!isVillaDemolition && !isBuildingDemolition && !isAnyCommercial && !data.acType) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Type de climatisation requis", path: ["acType"] })
    }
    if (!isAnyCommercial && !data.waterCounter) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Compteur d'eau requis", path: ["waterCounter"] })
    }
    if (!isAnyCommercial && !data.elecCounter) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Compteur électrique requis", path: ["elecCounter"] })
    }
    if (!isAnyCommercial && !data.gasCounter) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Compteur gaz requis", path: ["gasCounter"] })
    }

    if (!isVillaDemolition && !isBuildingDemolition && !isAnyCommercial) {
        if (!data.bedrooms) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Requis", path: ["bedrooms"] })
        }
        if (!data.livingRooms) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Requis", path: ["livingRooms"] })
        }
        if (!data.bathrooms) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Requis", path: ["bathrooms"] })
        }
        if (!data.wc) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Requis", path: ["wc"] })
        }
    }

    if (data.transactionType === "RENTAL") {
        if (!data.depositMonths) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Caution requise",
                path: ["depositMonths"]
            })
        }
    }
    if (data.transactionType === "SALE") {
        if (!data.acceptsBankCredit) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Requis", path: ["acceptsBankCredit"] })
        }
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

function DepositPageComponent() {
  const t = useTranslations("Deposit")
  // BASE_REAL_ESTATE_CATEGORIES porte des `label` en français en dur — Categories a déjà la
  // traduction de chaque catégorie (mêmes ids), utilisée partout ailleurs sur le site.
  const tc = useTranslations("Categories")
  // DepositOptions couvre pour l'instant la branche Résidentiel (+ son pendant Bureaux et
  // Commerces qui partage les mêmes écrans) — .has() retombe sur le libellé français en dur tant
  // qu'un groupe d'options n'a pas encore été migré, même mécanisme que optLabel dans research/page.tsx.
  const tOpt = useTranslations("DepositOptions")
  const ptLabel = usePropertyTypeLabel()
  const geoName = useLocalizedGeoName()
  const optLabel = (group: string, item: { id: string; label: string }) => {
    const nestedKey = `${group}.${item.id}.label` // groupes label+description (USAGE_TYPES...)
    if (tOpt.has(nestedKey)) return tOpt(nestedKey)
    const flatKey = `${group}.${item.id}` // groupes à simple libellé
    if (tOpt.has(flatKey)) return tOpt(flatKey)
    return item.label
  }
  const optDesc = (group: string, item: { id: string; description?: string; desc?: string }) => {
    const key = `${group}.${item.id}.description`
    if (tOpt.has(key)) return tOpt(key)
    return item.description ?? item.desc ?? ""
  }
  // Renvoie une copie localisée d'un tableau d'options {id,label,info?,desc?,description?}.
  // Chaque champ retombe sur la valeur française en dur tant que la clé n'existe pas dans
  // DepositOptions.<group> — donc on peut migrer branche par branche sans rien casser.
  // Utilisé sur chaque `.map`/`.filter` des tableaux d'options du wizard (voir DepositOptions
  // dans messages/{fr,en,ar}.json).
  const tGroup = <T extends { id: string; label?: string; info?: string; desc?: string; description?: string }>(
    group: string,
    arr: readonly T[],
  ): T[] =>
    arr.map((it) => {
      const out: Record<string, unknown> = { ...it }
      const nested = `${group}.${it.id}.label`
      const flat = `${group}.${it.id}`
      if (tOpt.has(nested)) out.label = tOpt(nested)
      else if (tOpt.has(flat)) out.label = tOpt(flat)
      if (tOpt.has(`${group}.${it.id}.info`)) out.info = tOpt(`${group}.${it.id}.info`)
      if (tOpt.has(`${group}.${it.id}.description`)) {
        const d = tOpt(`${group}.${it.id}.description`)
        out.description = d
        if ("desc" in it) out.desc = d
      }
      return out as T
    })
  // Libellés des catégories de photos (state figé en français ci-dessous) traduits au rendu par id.
  const photoCatLabel = (id: string, fallback: string) => {
    const map: Record<string, string> = {
      other: "photoCatOther", bedrooms: "adBedrooms", bathrooms: "photoCatBathrooms",
      kitchen: "f166", exterior: "photoCatExterior", common: "photoCatCommon",
    }
    const k = map[id]
    return k && t.has(k) ? t(k) : fallback
  }
  const router = useRouter()
  const pathname = usePathname()
  const forcedUserType: "PARTICULIER" | "SOCIETE" | undefined =
    pathname === "/deposit/particulier" ? "PARTICULIER"
    : pathname === "/deposit/professionnel" ? "SOCIETE"
    : undefined
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
  const [mainVideo, setMainVideo] = useState<File | null>(null) // Couverture vidéo — exclusive avec mainPhoto
  const [photoOrganizationStep, setPhotoOrganizationStep] = useState<"upload" | "organize">("upload")
  const [userType, setUserType] = useState<string>(forcedUserType || "PARTICULIER")
  const [userCompanyActivity, setUserCompanyActivity] = useState<string | null>(null)
  const [availabilityMode, setAvailabilityMode] = useState<'IMMEDIATE' | 'DATE'>('IMMEDIATE')
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [usineShowPrice, setUsineShowPrice] = useState(false)
  
  // Contacts
  const [contacts, setContacts] = useState<Contact[]>([{ phone: "", hasWhatsapp: false, hasViber: false, hasTelegram: false }])
  const [userProfilePhone, setUserProfilePhone] = useState<string | null>(null)
  const [priceCentimes, setPriceCentimes] = useState<string>("")
  
  // Canvas Ref for rotation
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const didFetchProfileRef = useRef(false)

  useEffect(() => {
    if (didFetchProfileRef.current) return
    didFetchProfileRef.current = true

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
        return
    }

    // Rediriger si le type de compte ne correspond pas à la page
    if (forcedUserType === "PARTICULIER" && user.userType === "SOCIETE") {
        router.replace('/deposit/professionnel')
        return
    }
    if (forcedUserType === "SOCIETE" && user.userType !== "SOCIETE") {
        router.replace('/deposit/particulier')
        return
    }

    setUserType(forcedUserType || user.userType || "PARTICULIER")
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
                        return [{ phone: normalizeDzPhoneToIntlDigits(user.phone), hasWhatsapp: false, hasViber: false, hasTelegram: false }];
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
                // Profile phone might be under 'phone' or 'phoneNumber' depending on backend version
                const phone = profile.phone || profile.phoneNumber;
                
                if (phone) {
                    setUserProfilePhone(phone);
                    // Update contact if it was empty or matched old user.phone from localStorage
                    setContacts(prev => {
                        if (prev.length === 1 && (prev[0].phone === "" || (user.phone && prev[0].phone === user.phone))) {
                            return [{ phone: normalizeDzPhoneToIntlDigits(phone), hasWhatsapp: false, hasViber: false, hasTelegram: false }];
                        }
                        return prev;
                    });
                }
            } else {
                console.warn("Failed to fetch profile from endpoints", { apiUrl, status: response.status })
            }
        } catch (error) {
            console.warn("Error fetching profile:", error)
        }
    };
    
    fetchProfile();
    
  }, [router])

  useEffect(() => {
    if (!userProfilePhone) return
    setContacts((prev) => {
      if (prev.length === 1 && prev[0].phone === "") {
        return [{ phone: normalizeDzPhoneToIntlDigits(userProfilePhone), hasWhatsapp: false, hasViber: false, hasTelegram: false }]
      }
      return prev
    })
  }, [userProfilePhone])

  const initialDefaultValues = {
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
    acceptsBankCredit: "NO_PREFERENCE",
    legalDocuments: [],
  } satisfies Partial<DepositFormValues>

  const {
    control,
    register,
    handleSubmit,
    watch,
    trigger,
    reset,
    setValue,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<DepositFormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: initialDefaultValues as any,
  })

  // Brouillon auto-enregistré — si l'utilisateur quitte accidentellement (fermeture d'onglet,
  // coupure réseau...), il retrouve sa saisie en revenant sur la page. Les photos/vidéos (objets
  // File) ne peuvent pas être sérialisées dans localStorage : seuls les champs texte/choix sont
  // restaurés, il faudra ré-ajouter les médias. Expire après 7 jours.
  const DEPOSIT_DRAFT_KEY = 'deposit-draft-v1'
  const DEPOSIT_DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000
  const [depositDraftAvailable, setDepositDraftAvailable] = useState<{ savedAt: number } | null>(null)
  const depositDraftCheckedRef = useRef(false)

  useEffect(() => {
    if (depositDraftCheckedRef.current) return
    depositDraftCheckedRef.current = true
    try {
      const raw = localStorage.getItem(DEPOSIT_DRAFT_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (!parsed?.savedAt || Date.now() - parsed.savedAt > DEPOSIT_DRAFT_MAX_AGE_MS) {
        localStorage.removeItem(DEPOSIT_DRAFT_KEY)
        return
      }
      setDepositDraftAvailable({ savedAt: parsed.savedAt })
    } catch { /* brouillon corrompu — on l'ignore silencieusement */ }
  }, [])

  useEffect(() => {
    const subscription = watch((values) => {
      const timeout = setTimeout(() => {
        try {
          if (!values.realEstateType) return
          localStorage.setItem(DEPOSIT_DRAFT_KEY, JSON.stringify({ values, step: currentStep, savedAt: Date.now() }))
        } catch { /* quota localStorage dépassé ou navigation privée — on ignore */ }
      }, 800)
      return () => clearTimeout(timeout)
    })
    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch, currentStep])

  const resumeDepositDraft = () => {
    try {
      const raw = localStorage.getItem(DEPOSIT_DRAFT_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      reset(parsed.values)
      if (typeof parsed.step === 'number') setCurrentStep(parsed.step)
    } catch { /* ignore */ }
    setDepositDraftAvailable(null)
  }

  const discardDepositDraft = () => {
    localStorage.removeItem(DEPOSIT_DRAFT_KEY)
    setDepositDraftAvailable(null)
  }

  const clearDepositDraft = () => {
    try { localStorage.removeItem(DEPOSIT_DRAFT_KEY) } catch { /* ignore */ }
  }

   const transactionType = watch("transactionType")
  const realEstateType = watch("realEstateType")
  const propertyType = watch("propertyType")
  const selectedCity = watch("city")
  const garageHasCapacity = watch("garageCapacity")
  const availableDate = watch("availableDate")
  const buildingTypologyMode = watch("buildingTypologyMode")
  const buildingApartmentTypologies = watch("buildingApartmentTypologies")
  const buildingApartmentTypologyOther = watch("buildingApartmentTypologyOther")
  const buildingSurfaceMode = watch("buildingSurfaceMode")
  const industrialConfiguration = watch("industrialConfiguration")
  const industrialSector = watch("industrialSector")
  const industrialRentalType = watch("industrialRentalType")
  const industrialOffices = watch("industrialOffices")
  const industrialHebergement = watch("industrialHebergement")
  const industrialWaterSources = watch("industrialWaterSources")
  const industrialFireEquipment = watch("industrialFireEquipment")
  const industrialSectorList = normalizeToStringArray(industrialSector)
  const industrialHebergementList = normalizeToStringArray(industrialHebergement)
  const industrialWaterSourcesList = normalizeToStringArray(industrialWaterSources)
  const industrialFireEquipmentList = normalizeToStringArray(industrialFireEquipment)
  const currentState = useWatch({ control, name: "state" })
  const isUsineRentalParticulier =
    transactionType === "RENTAL" &&
    propertyType === "USINE"
  const isChambreFroideRentalParticulier =
    transactionType === "RENTAL" &&
    propertyType === "CHAMBRE_FROIDE"
  const isHangarRentalParticulier =
    transactionType === "RENTAL" &&
    propertyType === "HANGAR"
  const isIndustrialRentalParticulier = isUsineRentalParticulier || isChambreFroideRentalParticulier || isHangarRentalParticulier
  const isCommercialPropertyType = ["VILLA_COMMERCIALE", "NIVEAU_VILLA_COMMERCIAL", "APPARTEMENT_COMMERCIAL", "IMMEUBLE_BUREAU"].includes(propertyType)
  const isTerrainRentalParticulier =
    transactionType === "RENTAL" &&
    ["TERRAIN_RESIDENTIEL", "TERRAIN_INDUSTRIEL", "TERRAIN_AGRICOLE", "TERRAIN_TOURISTIQUE"].includes(propertyType)
  const isShowroomParticulier =
    ["RENTAL", "SALE"].includes(transactionType) &&
    propertyType === "SHOWROOM"
  const isLocalCommercialParticulier =
    ["RENTAL", "SALE"].includes(transactionType) &&
    propertyType === "LOCAL_COMMERCIAL"
  const isBlocAdministratifParticulier =
    ["RENTAL", "SALE"].includes(transactionType) &&
    propertyType === "BLOC_ADMINISTRATIF"
  const isBureauCommerceSpecialParticulier = isShowroomParticulier || isLocalCommercialParticulier || isBlocAdministratifParticulier
  const isTerrainAgricole = propertyType === "TERRAIN_AGRICOLE"
  const isTerrainTouristique = propertyType === "TERRAIN_TOURISTIQUE"
  const isImmeubleCommercialParticulier =
    (transactionType === "RENTAL" || transactionType === "SALE") &&
    propertyType === "IMMEUBLE_COMMERCIAL"
  const isHebergementHabitant =
    transactionType === "RENTAL" &&
    propertyType === "HEBERGEMENT_HABITANT"
  // Fiche "Type de bien" (Maison complète / Chambre / Place de lit), partagée entre le particulier
  // (location de séjour/vacances) et le professionnel (établissement d'hébergement, précédé du bloc
  // Classification). Coexiste avec isHebergementHabitant (formule "chez l'habitant", inchangée).
  const isHebergementSejourParticulier =
    transactionType === "RENTAL" &&
    propertyType === "HEBERGEMENT_SEJOUR"
  const isEtablissementHebergement =
    propertyType === "ETABLISSEMENT_HEBERGEMENT"
  const isHebergementSejourFiche = isHebergementSejourParticulier || isEtablissementHebergement
  const hsClassification = watch("hsClassification")
  const hsTypeEtablissement = watch("hsTypeEtablissement")
  const hsTypeBien = watch("hsTypeBien")
  const hsMcEtage = watch("hsMcEtage")
  const hsMcTypeSalon = watch("hsMcTypeSalon")
  const hsChEspacesCommunsList = normalizeToStringArray(watch("hsChEspacesCommuns"))
  const hsPlTypeCouchage = watch("hsPlTypeCouchage")
  const hsPlEspacesCommunsList = normalizeToStringArray(watch("hsPlEspacesCommuns"))

  const cfSector = watch("cfSector")
  const cfConfiguration = watch("cfConfiguration")
  const cfLogistiqueVerticale = watch("cfLogistiqueVerticale")
  const cfGenerateur = watch("cfGenerateur")
  const cfSectorList = normalizeToStringArray(cfSector)
  const terrainViabilise = watch("terrainViabilise")
  const terrainAgricoleVocation = watch("terrainAgricoleVocation")
  const terrainAgricoleRessourcesEau = watch("terrainAgricoleRessourcesEau")
  const terrainAgricoleVocationList = normalizeToStringArray(terrainAgricoleVocation)
  const terrainAgricoleRessourcesEauList = normalizeToStringArray(terrainAgricoleRessourcesEau)
  const terrainAgricoleEtatCulture = watch("terrainAgricoleEtatCulture")
  const terrainTouristiqueZone = watch("terrainTouristiqueZone")
  const terrainTouristiqueZet = watch("terrainTouristiqueZet")
  const localMezzanine = watch("localMezzanine")
  const localEnvironnement = watch("localEnvironnement")
  const showroomVisibiliteAutoroute = watch("showroomVisibiliteAutoroute")
  const showroomStructureList = (watch("showroomStructure") as string[] | undefined) ?? []
  const blocLogementFonction = watch("blocLogementFonction")
  const blocSousSolVal = watch("blocSousSol")
  const habAmbiancesList = normalizeToStringArray(watch("habAmbiances"))
  const habConditionPaiement = watch("habConditionPaiement")
  const habAnnulation = watch("habAnnulation")
  const habCaution = watch("habCaution")
  const habFraisMenage = watch("habFraisMenage")
  const habPeriodeOuverture = watch("habPeriodeOuverture")
  const habFormule = watch("habFormule")
  const habUnitType = watch("habUnitType")
  const habReceptionMode = watch("habReceptionMode")
  const habClimatAcces = watch("habClimatAcces")
  const isSaleParticulierApartment =
    transactionType === "SALE" &&
    ["APPARTEMENT", "DUPLEX", "TRIPLEX", "STUDIO"].includes(propertyType)
  const isSaleParticulierNiveauVilla =
    transactionType === "SALE" &&
    propertyType === "NIVEAU_VILLA"
  const isSaleBuilding = (propertyType === "IMMEUBLE_RESIDENTIEL" || propertyType === "IMMEUBLE_BUREAU") && transactionType === "SALE"
  const isBuildingDemolition = propertyType === "IMMEUBLE_RESIDENTIEL" && transactionType === "SALE" && currentState === "A_DEMOLIR"
  const allowDemolirOption = propertyType === "VILLA" || (propertyType === "IMMEUBLE_RESIDENTIEL" && transactionType === "SALE")
  const isVillaDemolition =
    propertyType === "VILLA" &&
    (currentState === "A_DEMOLIR" || String(currentState || "").toUpperCase().includes("DEMOLIR"))
  const isSaleVillaDemolition = propertyType === "VILLA" && transactionType === "SALE" && isVillaDemolition
  
  // Re-hook the useEffect for price calculation since watch comes from useForm
  // We need to move the useEffect logic AFTER useForm
  const currentPrice = watch("price")
  const currentPriceUnit = watch("priceUnit")

  useEffect(() => {
    if (propertyType !== "IMMEUBLE_RESIDENTIEL") return
    if (buildingTypologyMode !== "DIFFERENTES") return
    const selected = Array.isArray(buildingApartmentTypologies) ? buildingApartmentTypologies : []
    const normalized = selected.filter((t) => t && t !== "F10_PLUS")
    const otherRaw = typeof buildingApartmentTypologyOther === "string" ? buildingApartmentTypologyOther : ""
    const other = otherRaw
        .split(/[,\s]+/)
        .map((x) => x.trim())
        .filter(Boolean)
    setValue("typology", [...normalized, ...other].join(","), { shouldValidate: true })
  }, [propertyType, buildingTypologyMode, buildingApartmentTypologies, buildingApartmentTypologyOther, setValue])

  useEffect(() => {
    if (propertyType !== "IMMEUBLE_RESIDENTIEL") return
    if (buildingTypologyMode !== "SIMILAIRES") return
    if (buildingSurfaceMode !== "MULTI") return
    setValue("area", "", { shouldValidate: true })
  }, [propertyType, buildingTypologyMode, buildingSurfaceMode, setValue])

  useEffect(() => {
    if (propertyType !== "IMMEUBLE_RESIDENTIEL") return
    if (!buildingTypologyMode) return

    if (buildingTypologyMode === "SIMILAIRES") {
      setValue("buildingApartmentTypologies", [], { shouldValidate: false })
      setValue("buildingApartmentTypologyOther", "", { shouldValidate: false })
      setValue("buildingApartmentStyle", [], { shouldValidate: false })
      clearErrors(["buildingApartmentTypologies", "buildingApartmentTypologyOther", "buildingApartmentStyle"] as any)
      return
    }

    if (buildingTypologyMode === "DIFFERENTES") {
      setValue("buildingApartmentTypologyCustom", "", { shouldValidate: false })
      setValue("buildingSurfaceMode", undefined as any, { shouldValidate: false })
      setValue("area", "", { shouldValidate: false })
      setValue("typologyCustom", "", { shouldValidate: false })
      clearErrors(["buildingApartmentTypologyCustom", "buildingSurfaceMode", "area"] as any)
    }
  }, [propertyType, buildingTypologyMode, setValue, clearErrors])

  useEffect(() => {
    if (!industrialSectorList.includes("AUTRE_ACTIVITE")) {
      const v = getValues("industrialSectorOther")
      if (v) {
        setValue("industrialSectorOther", "", { shouldValidate: false })
        clearErrors(["industrialSectorOther"])
      }
    }
  }, [industrialSectorList.join("|"), getValues, setValue, clearErrors])

  useEffect(() => {
    if (!isIndustrialRentalParticulier && !isTerrainRentalParticulier) {
      if (usineShowPrice) setUsineShowPrice(false)
      return
    }
    if (!usineShowPrice) {
      const v = getValues("price")
      if (v) setValue("price", "", { shouldValidate: false })
    }
  }, [isIndustrialRentalParticulier, isTerrainRentalParticulier, usineShowPrice, getValues, setValue])

  useEffect(() => {
    setPhotoCategories(prev => {
      const allPhotos = prev.flatMap(c => c.photos)
      if (isIndustrialRentalParticulier) {
        return [
          { id: "non_classees", label: "Photos uploadées", icon: ImageIcon, photos: allPhotos },
          { id: "equipements", label: "Équipements", icon: WarehouseIcon, photos: [] },
          { id: "bureaux", label: "Bureaux et Annexes", icon: Briefcase, photos: [] },
          { id: "hebergement", label: "Hébergement", icon: BedIcon, photos: [] },
          { id: "espaces_communs", label: "Espaces Communs", icon: Home, photos: [] },
          { id: "autres", label: "Autres", icon: ImageIcon, photos: [] },
        ]
      }
      if (isTerrainRentalParticulier) {
        return [
          { id: "non_classees", label: "Photos uploadées", icon: ImageIcon, photos: allPhotos },
          { id: "vue_generale", label: "Vue générale", icon: ImageIcon, photos: [] },
          { id: "environnement", label: "Environnement / Voisinage", icon: Home, photos: [] },
          { id: "autres", label: "Autres", icon: ImageIcon, photos: [] },
        ]
      }
      return [
        { id: "other", label: "Autres photos", icon: ImageIcon, photos: allPhotos },
        { id: "bedrooms", label: "Chambres", icon: BedIcon, photos: [] },
        { id: "bathrooms", label: "Salles de bain & WC", icon: BathIcon, photos: [] },
        { id: "kitchen", label: "Cuisine", icon: UtensilsIcon, photos: [] },
        { id: "exterior", label: "Extérieur (jardin, piscine)", icon: GardenIcon, photos: [] },
        { id: "common", label: "Espaces communs", icon: Home, photos: [] },
      ]
    })
  }, [isIndustrialRentalParticulier, isTerrainRentalParticulier])

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
    if (currentPriceUnit === 'DA' || currentPriceUnit === 'DA_M2') totalCentimes = val * 100;
    else if (currentPriceUnit === 'MILLION' || currentPriceUnit === 'MILLION_M2') totalCentimes = val * 1000000;
    else if (currentPriceUnit === 'MILLIARD') totalCentimes = val * 1000000000;

    // Affichage texte
    if (totalCentimes >= 1000000000) { 
        const milliards = totalCentimes / 1000000000;
        setPriceCentimes(t('depCentimesMilliards', { v: milliards.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) }))
    } else if (totalCentimes >= 1000000) { 
        const millions = totalCentimes / 1000000;
        setPriceCentimes(t('depCentimesMillions', { v: millions.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) }))
    } else {
        setPriceCentimes(t('depCentimes', { v: totalCentimes.toLocaleString('fr-FR') }))
    }
  }, [currentPrice, currentPriceUnit])

  // Conversion lors du changement d'unité
  const handlePriceUnitChange = (newUnit: "DA" | "DA_M2" | "MILLION" | "MILLION_M2" | "MILLIARD") => {
      const currentVal = Number(watch("price")?.replace(/\s/g, '') || 0);
      
      // Update unit immediately
      setValue("priceUnit", newUnit);

      if (currentVal === 0) return;
      
      // Convert logic
      let valInDA = currentVal;
      // FROM
      if (currentPriceUnit === 'MILLION' || currentPriceUnit === 'MILLION_M2') valInDA = currentVal * 10000;
      else if (currentPriceUnit === 'MILLIARD') valInDA = currentVal * 10000000;
      
      // TO
      let newVal = valInDA;
      if (newUnit === 'MILLION' || newUnit === 'MILLION_M2') newVal = valInDA / 10000;
      else if (newUnit === 'MILLIARD') newVal = valInDA / 10000000;
      
      const formatted = Number.isInteger(newVal) ? newVal.toString() : newVal.toFixed(2);
      setValue("price", formatted);
  }

  useEffect(() => {
    if (!isVillaDemolition) return

    // Le bloc "Cadre et mode de vie" (dont ces cases "Environnement / type d'habitat") disparaît
    // en mode démolition — sans ce reset, une case cochée puis décochée (ou un état intermédiaire
    // laissé par react-hook-form quand les inputs se démontent) peut rester en mémoire et faire
    // échouer la validation finale avec une erreur "buildingUsageTypes" sans message visible.
    setValue("buildingUsageTypes", [], { shouldValidate: false })
    setValue("usageType", undefined as any, { shouldValidate: false })
    setValue("bedrooms", "", { shouldValidate: false })
    setValue("nbSuites", "", { shouldValidate: false })
    setValue("livingRooms", "", { shouldValidate: false })
    setValue("bathrooms", "", { shouldValidate: false })
    setValue("wc", "", { shouldValidate: false })
    setValue("bathroomType", "none" as any, { shouldValidate: false })

    setValue("kitchenType", undefined as any, { shouldValidate: false })
    setValue("kitchenState", undefined as any, { shouldValidate: false })
    setValue("kitchenEquipment", undefined as any, { shouldValidate: false })

    setValue("exteriorFeatures", undefined as any, { shouldValidate: false })
    setValue("securityFeatures", undefined as any, { shouldValidate: false })
    setValue("connectivity", undefined as any, { shouldValidate: false })

    setValue("heatingType", undefined as any, { shouldValidate: false })
    setValue("acType", undefined as any, { shouldValidate: false })

    clearErrors([
      "buildingUsageTypes",
      "usageType",
      "bedrooms",
      "nbSuites",
      "livingRooms",
      "bathrooms",
      "wc",
      "bathroomType",
      "kitchenType",
      "kitchenState",
      "kitchenEquipment",
      "exteriorFeatures",
      "securityFeatures",
      "connectivity",
      "heatingType",
      "acType",
    ] as any)
  }, [isVillaDemolition, setValue, clearErrors])

  useEffect(() => {
    if (!isBuildingDemolition) return

    setValue("landArea", "", { shouldValidate: false })
    setValue("builtArea", "", { shouldValidate: false })
    setValue("buildingTypologyMode", undefined as any, { shouldValidate: false })
    setValue("buildingApartmentTypologyCustom", "", { shouldValidate: false })
    setValue("buildingTotalApartments", "", { shouldValidate: false })
    setValue("buildingSurfaceMode", undefined as any, { shouldValidate: false })
    setValue("buildingApartmentTypologies", [], { shouldValidate: false })
    setValue("buildingApartmentTypologyOther", "", { shouldValidate: false })
    setValue("buildingApartmentStyle", [], { shouldValidate: false })
    setValue("buildingCountF3", "", { shouldValidate: false })
    setValue("buildingCountF4", "", { shouldValidate: false })
    setValue("buildingCountF5", "", { shouldValidate: false })

    setValue("floorCount", "", { shouldValidate: false })
    setValue("area", "", { shouldValidate: false })
    setValue("typology", "", { shouldValidate: false })
    setValue("typologyCustom", "", { shouldValidate: false })

    setValue("parkingCount", "", { shouldValidate: false })
    setValue("outdoorParking", "", { shouldValidate: false })

    // Voir le commentaire du bloc isVillaDemolition ci-dessus — même bloc "Cadre et mode de vie"
    // masqué en mode démolition, même risque d'erreur "buildingUsageTypes" fantôme au submit.
    setValue("buildingUsageTypes", [], { shouldValidate: false })
    setValue("usageType", undefined as any, { shouldValidate: false })
    setValue("bedrooms", "", { shouldValidate: false })
    setValue("nbSuites", "", { shouldValidate: false })
    setValue("livingRooms", "", { shouldValidate: false })
    setValue("bathrooms", "", { shouldValidate: false })
    setValue("wc", "", { shouldValidate: false })
    setValue("bathroomType", "none" as any, { shouldValidate: false })

    setValue("kitchenType", undefined as any, { shouldValidate: false })
    setValue("kitchenState", undefined as any, { shouldValidate: false })
    setValue("kitchenEquipment", undefined as any, { shouldValidate: false })

    setValue("exteriorFeatures", undefined as any, { shouldValidate: false })
    setValue("securityFeatures", undefined as any, { shouldValidate: false })
    setValue("connectivity", undefined as any, { shouldValidate: false })
    setValue("heatingType", undefined as any, { shouldValidate: false })
    setValue("acType", undefined as any, { shouldValidate: false })

    clearErrors([
      "landArea",
      "builtArea",
      "buildingTypologyMode",
      "buildingApartmentTypologyCustom",
      "buildingTotalApartments",
      "buildingSurfaceMode",
      "buildingApartmentTypologies",
      "buildingApartmentTypologyOther",
      "buildingApartmentStyle",
      "buildingUsageTypes",
      "buildingCountF3",
      "buildingCountF4",
      "buildingCountF5",
      "floorCount",
      "area",
      "typology",
      "typologyCustom",
      "parkingCount",
      "outdoorParking",
      "usageType",
      "bedrooms",
      "nbSuites",
      "livingRooms",
      "bathrooms",
      "wc",
      "bathroomType",
      "kitchenType",
      "kitchenState",
      "kitchenEquipment",
      "exteriorFeatures",
      "securityFeatures",
      "connectivity",
      "heatingType",
      "acType",
    ] as any)
  }, [isBuildingDemolition, setValue, clearErrors])

  useEffect(() => {
    if (propertyType === "VILLA") return
    if (currentState !== "A_DEMOLIR") return
    if (propertyType === "IMMEUBLE_RESIDENTIEL" && transactionType === "SALE") return
    setValue("state", "" as any, { shouldValidate: true })
  }, [propertyType, transactionType, currentState, setValue])
  const getFilteredCategories = () => {
    let categories = [...BASE_REAL_ESTATE_CATEGORIES]
    if (userType === "PARTICULIER") {
      categories = categories.filter(cat => cat.id !== "EVENEMENTIEL" && cat.id !== "HOTELIER")
    } else {
      // Évite deux cartes au même libellé pour les comptes professionnels.
      categories = categories.filter(cat => cat.id !== "HEBERGEMENT")
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
        types = [
          {
            id: "HEBERGEMENT_HABITANT",
            label: "FORMULE HEBERGEMENT CHEZ L'HABITANT",
            categoryId: "HEBERGEMENT",
            iconName: "Home"
          },
          {
            id: "HEBERGEMENT_SEJOUR",
            label: "Location de séjour / vacances",
            categoryId: "HEBERGEMENT",
            iconName: "SejourVacances"
          },
        ]
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
    const fileToRemove = selectedVideos[index]
    if (fileToRemove === mainVideo) setMainVideo(null)
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
    
    // Mettre TOUTES les photos dans la catégorie initiale par défaut
    // L'utilisateur devra ensuite les trier
    setPhotoCategories(prev => {
        const defaultCat = prev.find(c => c.id === "non_classees" || c.id === "other") ?? prev[0]
        return prev.map(cat => {
            if (cat.id === defaultCat.id) {
                return { ...cat, photos: [...selectedFiles] }
            } else {
                return { ...cat, photos: [] }
            }
        })
    })
    
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
    reset(
      {
        ...initialDefaultValues,
        transactionType: getValues("transactionType"),
        realEstateType: categoryId,
      } as any,
      { keepDefaultValues: true }
    )
    setCurrentStep(3)
  }

  const handlePropertyTypeClick = (propertyId: string) => {
    reset(
      {
        ...initialDefaultValues,
        transactionType: getValues("transactionType"),
        realEstateType: getValues("realEstateType"),
        propertyType: propertyId,
      } as any,
      { keepDefaultValues: true }
    )
    // Après le choix du bien, aller à la fiche descriptive
    setCurrentStep(4)
  }

  const handleDescriptiveSubmit = async () => {
    let isValid = false;
    
    // Validation selon le type de bien
    if (isChambreFroideRentalParticulier) {
        isValid = await trigger([
            "cfSector",
            "cfSectorOther",
            "cfLocalisation",
            "cfStructureType",
            "cfConfiguration",
            "cfFloorsCount",
            "cfLogistiqueVerticale",
            "cfMonteChargeCapacity",
            "cfAccessibilite",
            "cfZoneDechargement",
            "cfModeGestion",
        ], { shouldFocus: true })
    } else if (isTerrainRentalParticulier) {
        isValid = await trigger([
            "landArea",
            "terrainTopographie",
        ], { shouldFocus: true })
    } else if (isShowroomParticulier || isLocalCommercialParticulier || isBlocAdministratifParticulier) {
        isValid = true
    } else if (isUsineRentalParticulier) {
        isValid = await trigger([
            "industrialSector",
            "industrialSectorOther",
            "industrialProductDetail",
            "industrialRentalType",
            "industrialGlobalState",
            "industrialServiceYear",
            "industrialConfiguration",
            "industrialFloorsCount",
            "landArea",
            "builtArea",
            "industrialSituation",
            "industrialAccessTransport",
            "industrialHighwayDistanceKm",
            "industrialAccessProduction",
            "industrialOffices",
            "industrialOfficesArea",
            "industrialHebergement",
            "industrialDormitoryCapacity",
            "industrialGas",
            "industrialWaterSources",
            "industrialWaterTankCapacityLiters",
            "industrialSanitation",
            "industrialFireEquipment",
            "industrialFireWaterReserveLiters",
        ], { shouldFocus: true })
    } else if (propertyType === "VILLA") {
        if (isVillaDemolition) {
            isValid = await trigger([
                "floorCount",
                "landArea",
                "builtArea",
                "facadesCount",
                "state",
                "waterCounter",
                "elecCounter",
                "gasCounter",
            ], { shouldFocus: true })
        } else {
            isValid = await trigger([
                "typology", "floorCount", 
                "landArea", "builtArea",
                "facadesCount",
                "state", "parkingCount", "outdoorParking",
                "usageType", "bedrooms", "nbSuites", "livingRooms", "bathrooms", "wc", "bathroomType",
                "kitchenType", "kitchenState",
                "heatingType", "acType",
                "waterCounter", "elecCounter", "gasCounter",
                "typologyCustom"
            ], { shouldFocus: true })
        }
    } else if (propertyType === "NIVEAU_VILLA") {
        isValid = await trigger([
            "typology", "floorCount", "area",
            "state", "parkingCount", "outdoorParking",
            "facadesCount",
            "usageType", "bedrooms", "nbSuites", "livingRooms", "bathrooms", "wc", "bathroomType",
            "kitchenType", "kitchenState",
            "heatingType", "acType",
            "waterCounter", "elecCounter", "gasCounter",
            "typologyCustom"
        ], { shouldFocus: true });
    } else if (propertyType === "APPARTEMENT" || propertyType === "DUPLEX" || propertyType === "TRIPLEX" || propertyType === "STUDIO") {
        isValid = await trigger([
            "typology", "floorCount", "area",
            "state", "parkingCount", "outdoorParking",
            "facadesCount",
            "usageType", "bedrooms", "nbSuites", "livingRooms", "bathrooms", "wc", "bathroomType",
            "kitchenType", "kitchenState",
            "heatingType", "acType",
            "waterCounter", "elecCounter", "gasCounter",
            "typologyCustom"
        ], { shouldFocus: true });
    } else if (propertyType === "IMMEUBLE_RESIDENTIEL") {
        if (isBuildingDemolition) {
            isValid = await trigger([
                "state",
                "landArea",
                "waterCounter",
                "elecCounter",
                "gasCounter",
            ], { shouldFocus: true })
        } else {
            isValid = await trigger([
                "buildingTypologyMode",
                "buildingApartmentTypologyCustom",
                "buildingTotalApartments",
                "buildingSurfaceMode",
                "buildingApartmentTypologies",
                "buildingApartmentTypologyOther",
                "buildingApartmentStyle",
                "floorCount",
                "area",
                "state",
                "parkingCount",
                "outdoorParking",
                "bedrooms",
                "nbSuites",
                "livingRooms",
                "bathrooms",
                "wc",
                "bathroomType",
                "kitchenType",
                "kitchenState",
                "heatingType",
                "acType",
                "waterCounter",
                "elecCounter",
                "gasCounter",
                "typologyCustom",
                "typology",
            ], { shouldFocus: true })
        }
    } else if (isHebergementHabitant) {
        isValid = await trigger([
            "habClientProfile",
            "habFormule",
            "habUnitType",
        ], { shouldFocus: true })
    } else if (isHebergementSejourFiche) {
        const hsFields: any[] = ["hsTypeBien"]
        if (isEtablissementHebergement) hsFields.push("hsClassification", "hsTypeEtablissement")
        isValid = await trigger(hsFields, { shouldFocus: true })
    } else if (isImmeubleCommercialParticulier) {
        isValid = true
    } else if (propertyType === "VILLA_COMMERCIALE") {
        isValid = await trigger([
            "state", "landArea", "builtArea", "usageType",
        ], { shouldFocus: true })
    } else if (propertyType === "NIVEAU_VILLA_COMMERCIAL") {
        isValid = await trigger([
            "state", "area", "usageType",
        ], { shouldFocus: true })
    } else if (propertyType === "IMMEUBLE_BUREAU") {
        isValid = await trigger([
            "buildingTypologyMode",
            "state",
        ], { shouldFocus: true })
    } else if (propertyType === "APPARTEMENT_COMMERCIAL") {
        isValid = await trigger([
            "state", "area",
        ], { shouldFocus: true })
    } else {
        // Autres types de biens
        isValid = await trigger([
            "floorCount", "extraFloor", "typology", "bedrooms", "livingRooms",
            "bathrooms", "bathroomType", "wc", "landArea", "builtArea"
        ], { shouldFocus: true });
    }

    if (isValid) {
      setCurrentStep(5)
    }
  }

  const handlePriceSubmit = async () => {
    const skipPrice = isIndustrialRentalParticulier || isTerrainRentalParticulier || isHebergementHabitant
    const fieldsToValidate: any[] = skipPrice ? [] : ["price", "priceUnit", "priceType"]

    // Add rental specific fields if needed
    if (transactionType === "RENTAL") {
        if (!skipPrice) {
            fieldsToValidate.push("depositMonths")
            fieldsToValidate.push("rentalUsage")
            fieldsToValidate.push("chargesIncluded")
        }
        if (availabilityMode === 'DATE') {
             fieldsToValidate.push("availableDate")
        }
    }
    if (transactionType === "SALE") {
        fieldsToValidate.push("acceptsBankCredit")
    }

    if (!skipPrice && transactionType === "RENTAL" && availabilityMode === "DATE" && (!availableDate || String(availableDate).trim().length === 0)) {
        setError("availableDate", { type: "custom", message: "Date requise" } as any)
        return
    }

    const isValid = await trigger(fieldsToValidate, { shouldFocus: true })

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

  const handleIndustrialSectorChange = (sectorId: string) => {
    setValue("industrialSector", [sectorId], { shouldValidate: true })
  }

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
    if (data.priceUnit === 'MILLION' || data.priceUnit === 'MILLION_M2') {
        finalPrice *= 10000;
    } else if (data.priceUnit === 'MILLIARD') {
        finalPrice *= 10000000;
    } else if (data.priceUnit === 'DA' || data.priceUnit === 'DA_M2') {
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

    if (data.transactionType === "SALE" && data.propertyType === 'IMMEUBLE_RESIDENTIEL' && data.state === "A_DEMOLIR") {
        if (!data.area && data.landArea) formData.append('area', data.landArea)
        else if (data.area) formData.append('area', data.area)
        else formData.append('area', '0')

        if (!data.rooms) formData.append('rooms', '0')
    }

    const isBuildingDemolitionPayload = data.transactionType === "SALE" && data.propertyType === 'IMMEUBLE_RESIDENTIEL' && data.state === "A_DEMOLIR"
    const shouldSkipAreaRooms = data.propertyType === "VILLA" || isBuildingDemolitionPayload
    const isFactoryRentalPayload =
        data.transactionType === "RENTAL" &&
        data.propertyType === "USINE"

    if (isFactoryRentalPayload) {
        const toNum = (v?: string) => {
            const n = v ? Number(v.replace(/\s/g, '')) : NaN
            return isNaN(n) ? undefined : n
        }
        const amenitiesPayload: any = {
            industrialFactory: {
                sector: data.industrialSector?.length ? data.industrialSector : undefined,
                sectorOther: data.industrialSectorOther?.trim() || undefined,
                productDetail: data.industrialProductDetail?.trim() || undefined,
                rentalType: data.industrialRentalType,
                globalState: data.industrialGlobalState,
                serviceYear: data.industrialServiceYear?.trim() || undefined,
                configuration: data.industrialConfiguration,
                floorsCount: data.industrialConfiguration === "ETAGES" ? toNum(data.industrialFloorsCount) : undefined,
                surfaces: {
                    landArea: toNum(data.landArea),
                    builtArea: toNum(data.builtArea),
                    freeArea: toNum(data.industrialSurfaceFree),
                },
                structure: {
                    ossature: data.industrialStructureOssature?.length ? data.industrialStructureOssature : undefined,
                    toiture: data.industrialStructureToiture?.length ? data.industrialStructureToiture : undefined,
                    murs: data.industrialStructureMurs?.length ? data.industrialStructureMurs : undefined,
                    hspMeters: toNum(data.industrialHsp),
                },
                logistics: {
                    situation: data.industrialSituation?.length ? data.industrialSituation : undefined,
                    accessTransport: data.industrialAccessTransport?.length ? data.industrialAccessTransport : undefined,
                    highwayDistanceKm: toNum(data.industrialHighwayDistanceKm),
                    accessProduction: data.industrialAccessProduction?.length ? data.industrialAccessProduction : undefined,
                },
                annexes: {
                    offices: (data.industrialOffices as any) === true,
                    officesArea: toNum(data.industrialOfficesArea),
                    socialLocales: data.industrialSocialLocales?.length ? data.industrialSocialLocales : undefined,
                    hebergement: data.industrialHebergement?.length ? data.industrialHebergement : undefined,
                    dormitoryCapacity: toNum(data.industrialDormitoryCapacity),
                    security: data.industrialSecurity?.length ? data.industrialSecurity : undefined,
                },
                energy: {
                    transformerKva: toNum(data.industrialElectricityTransformerKva),
                    forceMotrice380: (data.industrialElectricityForceMotrice as any) === true,
                    gas: data.industrialGas,
                    waterSources: data.industrialWaterSources?.length ? data.industrialWaterSources : undefined,
                    waterTankCapacityLiters: toNum(data.industrialWaterTankCapacityLiters),
                    sanitation: data.industrialSanitation,
                },
                fireSafety: {
                    network: data.industrialFireNetwork?.length ? data.industrialFireNetwork : undefined,
                    equipment: data.industrialFireEquipment?.length ? data.industrialFireEquipment : undefined,
                    waterReserveLiters: toNum(data.industrialFireWaterReserveLiters),
                },
            },
        }
        formData.append("amenities", JSON.stringify(amenitiesPayload))
    }

    const isColdRoomRentalPayload =
        data.transactionType === "RENTAL" &&
        data.propertyType === "CHAMBRE_FROIDE"

    if (isColdRoomRentalPayload) {
        const toNum = (v?: string) => {
            const n = v ? Number(v.replace(/\s/g, '')) : NaN
            return isNaN(n) ? undefined : n
        }
        const amenitiesPayload: any = {
            coldRoom: {
                sector: data.cfSector?.length ? data.cfSector : undefined,
                sectorOther: data.cfSectorOther?.trim() || undefined,
                dimensions: {
                    length: toNum(data.cfLength),
                    width: toNum(data.cfWidth),
                    height: toNum(data.cfHeight),
                    capacity: toNum(data.cfCapacity),
                },
                etatGlobal: data.cfEtatGlobal,
                localisation: data.cfLocalisation?.length ? data.cfLocalisation : undefined,
                structureType: data.cfStructureType,
                configuration: data.cfConfiguration,
                floorsCount: data.cfConfiguration === "ETAGES" ? toNum(data.cfFloorsCount) : undefined,
                logistiqueVerticale: data.cfLogistiqueVerticale,
                monteChargeCapacity: data.cfLogistiqueVerticale === "MONTE_CHARGE" ? toNum(data.cfMonteChargeCapacity) : undefined,
                accessibilite: data.cfAccessibilite?.length ? data.cfAccessibilite : undefined,
                zoneDechargement: data.cfZoneDechargement?.length ? data.cfZoneDechargement : undefined,
                generateur: (data.cfGenerateur as any) === true,
                generateurKva: (data.cfGenerateur as any) === true ? toNum(data.cfGenerateurKva) : undefined,
                techniqueFroid: data.cfTechniqueFroid?.length ? data.cfTechniqueFroid : undefined,
                typeFroid: data.cfTypeFroid?.length ? data.cfTypeFroid : undefined,
                modeDiffusion: data.cfModeDiffusion?.length ? data.cfModeDiffusion : undefined,
                modeGestion: data.cfModeGestion,
                flexibilite: data.cfFlexibilite?.length ? data.cfFlexibilite : undefined,
                dureeEngagement: data.cfDureeEngagement?.length ? data.cfDureeEngagement : undefined,
                annexes: {
                    offices: (data.industrialOffices as any) === true || (data.industrialOffices as any) === "true",
                    socialLocales: data.industrialSocialLocales?.length ? data.industrialSocialLocales : undefined,
                    hebergement: data.industrialHebergement?.length ? data.industrialHebergement : undefined,
                    security: data.industrialSecurity?.length ? data.industrialSecurity : undefined,
                },
            }
        }
        formData.append("amenities", JSON.stringify(amenitiesPayload))
    }

    const isHangarRentalPayload =
        data.transactionType === "RENTAL" &&
        data.propertyType === "HANGAR"

    if (isHangarRentalPayload) {
        const toNum = (v?: string) => { const n = v ? Number(v.replace(/\s/g, '')) : NaN; return isNaN(n) ? undefined : n }
        const amenitiesPayload: any = {
            hangar: {
                usage: data.hangarUsage?.length ? data.hangarUsage : undefined,
                globalState: data.industrialGlobalState,
                surfaces: {
                    covered: toNum(data.hangarSurfaceCovered),
                    terrain: toNum(data.hangarSurfaceTerrain),
                },
                dimensions: {
                    length: toNum(data.hangarLength),
                    width: toNum(data.hangarWidth),
                    height: toNum(data.hangarHeight),
                },
                toiture: {
                    toleTH40: (data.hangarStructureToleTH40 as any) === true,
                    panneauxSandwich: (data.hangarStructurePanneauxSandwich as any) === true,
                    autre: (data.hangarToitureAutre as any) === true,
                },
                sol: {
                    beton: (data.hangarSolBetonQuartz as any) === true,
                    resineEpoxy: (data.hangarSolResineEpoxy as any) === true,
                    autre: (data.hangarSolAutre as any) === true,
                },
                logistics: {
                    situation: data.industrialSituation?.length ? data.industrialSituation : undefined,
                    accessTransport: data.industrialAccessTransport?.length ? data.industrialAccessTransport : undefined,
                },
                annexes: {
                    offices: (data.industrialOffices as any) === true,
                    officesArea: toNum(data.industrialOfficesArea),
                    socialLocales: data.industrialSocialLocales?.length ? data.industrialSocialLocales : undefined,
                    hebergement: data.industrialHebergement?.length ? data.industrialHebergement : undefined,
                    security: data.industrialSecurity?.length ? data.industrialSecurity : undefined,
                },
                energy: {
                    transformerKva: toNum(data.industrialElectricityTransformerKva),
                    forceMotrice380: (data.industrialElectricityForceMotrice as any) === true,
                    gas: data.industrialGas,
                    waterSources: data.industrialWaterSources?.length ? data.industrialWaterSources : undefined,
                    sanitation: data.industrialSanitation,
                },
                fireSafety: {
                    network: data.industrialFireNetwork?.length ? data.industrialFireNetwork : undefined,
                    equipment: data.industrialFireEquipment?.length ? data.industrialFireEquipment : undefined,
                    waterReserveLiters: toNum(data.industrialFireWaterReserveLiters),
                },
            },
        }
        formData.append("amenities", JSON.stringify(amenitiesPayload))
    }

    const isTerrainRentalPayload =
        data.transactionType === "RENTAL" &&
        ["TERRAIN_RESIDENTIEL", "TERRAIN_INDUSTRIEL", "TERRAIN_AGRICOLE", "TERRAIN_TOURISTIQUE"].includes(data.propertyType)

    if (isTerrainRentalPayload) {
        const toNum = (v?: string) => { const n = v ? Number(v) : NaN; return isNaN(n) ? undefined : n }
        const agricolePayload = data.propertyType === "TERRAIN_AGRICOLE" ? {
            unite: data.terrainAgricoleUnite,
            vocation: data.terrainAgricoleVocation?.length ? data.terrainAgricoleVocation : undefined,
            vocationAutre: data.terrainAgricoleVocationAutre || undefined,
            ressourcesEau: data.terrainAgricoleRessourcesEau?.length ? data.terrainAgricoleRessourcesEau : undefined,
            debitForage: data.terrainAgricoleDebitForage || undefined,
            exposition: data.terrainAgricoleExposition?.length ? data.terrainAgricoleExposition : undefined,
            ensoleillement: data.terrainAgricoleEnsoleillement || undefined,
        } : undefined
        const amenitiesPayload: any = {
            terrain: {
                facadeLength: toNum(data.terrainFacadeLength),
                depth: toNum(data.terrainDepth),
                topographie: data.terrainTopographie,
                statutZone: data.terrainStatutZone?.length ? data.terrainStatutZone : undefined,
                documents: data.terrainDocuments?.length ? data.terrainDocuments : undefined,
                viabilise: (data.terrainViabilise as any) === true,
                raccordements: (data.terrainViabilise as any) === true ? undefined : (data.terrainRaccordements?.length ? data.terrainRaccordements : undefined),
                agricole: agricolePayload,
            }
        }
        formData.append("amenities", JSON.stringify(amenitiesPayload))
    }

    const isShowroomPayload =
        data.propertyType === "SHOWROOM" && ["RENTAL", "SALE"].includes(data.transactionType)
    if (isShowroomPayload) {
        const toNum = (v?: string) => { const n = v ? Number(v) : NaN; return isNaN(n) ? undefined : n }
        const amenitiesPayload: any = {
            showroom: {
                surfaces: {
                    terrain: toNum(data.showroomSurfaceTerrain),
                    batie: toNum(data.showroomSurfaceBatie),
                },
                dimensions: {
                    niveaux: toNum(data.showroomNiveaux),
                    facadeWidth: toNum(data.showroomFacadeWidth),
                    facadeDepth: toNum(data.showroomFacadeDepth),
                    hauteurPlafond: toNum(data.showroomHauteurPlafond),
                },
                style: data.showroomStyle || undefined,
                structure: data.showroomStructure || undefined,
                visibilite: {
                    autoroute: (data.showroomVisibiliteAutoroute as any) === true,
                    axeRoutier: data.showroomAxeRoutier || undefined,
                },
            }
        }
        formData.append("amenities", JSON.stringify(amenitiesPayload))
    }

    const isLocalCommercialPayload =
        data.propertyType === "LOCAL_COMMERCIAL" && ["RENTAL", "SALE"].includes(data.transactionType)
    if (isLocalCommercialPayload) {
        const toNum = (v?: string) => { const n = v ? Number(v) : NaN; return isNaN(n) ? undefined : n }
        const amenitiesPayload: any = {
            local: {
                environnement: data.localEnvironnement || undefined,
                environnementAutre: data.localEnvironnementAutre || undefined,
                surfaces: {
                    total: toNum(data.localSurfaceTotal),
                    vitrineLongueur: toNum(data.localVitrineLongueur),
                    largeur: toNum(data.localLargeur),
                    profondeur: toNum(data.localProfondeur),
                    hauteurPlafond: toNum(data.localHauteurPlafond),
                },
                mezzanine: {
                    present: (data.localMezzanine as any) === true,
                    surface: toNum(data.localMezzanineSurface),
                },
                style: data.localStyle || undefined,
                emplacement: {
                    zoneType: data.localZoneType || undefined,
                    fluxPieton: data.localFluxPieton || undefined,
                    fluxVehicules: data.localFluxVehicules || undefined,
                },
                usage: data.localUsage || undefined,
            }
        }
        formData.append("amenities", JSON.stringify(amenitiesPayload))
    }

    const isBlocAdministratifPayload =
        data.propertyType === "BLOC_ADMINISTRATIF" && ["RENTAL", "SALE"].includes(data.transactionType)
    if (isBlocAdministratifPayload) {
        const toNum = (v?: string) => { const n = v ? Number(v) : NaN; return isNaN(n) ? undefined : n }
        const amenitiesPayload: any = {
            bloc: {
                surfaces: {
                    terrain: toNum(data.blocSurfaceTerrain),
                    batie: toNum(data.blocSurfaceBatie),
                },
                structure: {
                    etages: toNum(data.blocEtages),
                    sousSol: (data.blocSousSol as any) === true,
                    facades: toNum(data.blocFacades),
                },
                espace: {
                    typeEspace: data.blocTypeEspace || undefined,
                    typeCloisonnement: data.blocTypeCloisonnement?.length ? data.blocTypeCloisonnement : undefined,
                },
                connectivite: {
                    type: data.blocConnectivite || undefined,
                    typeConnexion: data.blocTypeConnexion?.length ? data.blocTypeConnexion : undefined,
                    equipementServeur: data.blocEquipementServeur?.length ? data.blocEquipementServeur : undefined,
                },
            }
        }
        formData.append("amenities", JSON.stringify(amenitiesPayload))
    }

    // Hébergement chez l'habitant — bien plus de champs (~65) que ce que le backend accepte
    // individuellement (CreateAnnounceDto + ValidationPipe whitelist:true) : sans ce bloc, tous les
    // champs habXxx envoyés à plat seraient silencieusement supprimés avant même d'atteindre le
    // contrôleur. On les regroupe donc dans amenities.hebergement, comme pour les autres catégories.
    const isHebergementHabitantPayload =
        data.transactionType === "RENTAL" &&
        data.propertyType === "HEBERGEMENT_HABITANT"
    if (isHebergementHabitantPayload) {
        const toNum = (v?: string) => { const n = v ? Number(v) : NaN; return isNaN(n) ? undefined : n }
        const amenitiesPayload: any = {
            hebergement: {
                clientProfile: data.habClientProfile || undefined,
                formule: data.habFormule || undefined,
                typeChambre: data.habTypeChambre || undefined,
                unitType: data.habUnitType || undefined,
                unitTypeInsolite: data.habUnitTypeInsolite || undefined,
                caracteristiques: {
                    area: toNum(data.habArea),
                    floor: toNum(data.habFloor),
                    nbNiveaux: toNum(data.habNbNiveaux),
                    nbChambres: toNum(data.habNbChambres),
                    nbSalons: toNum(data.habNbSalons),
                    nbSdb: toNum(data.habNbSdb),
                    suiteParentale: (data.habSuiteParentale as any) === true,
                },
                lits: {
                    kingPremium: toNum(data.habBedKingPremium),
                    king: toNum(data.habBedKing),
                    queen: toNum(data.habBedQueen),
                    doubleStd: toNum(data.habBedDoubleStd),
                    simpleAdulte: toNum(data.habBedSimpleAdulte),
                    simpleEnfant: toNum(data.habBedSimpleEnfant),
                    superpose: toNum(data.habBedSuperpose),
                    matelasSol: toNum(data.habBedMatelasSol),
                    bebe: toNum(data.habBedBebe),
                },
                cadre: {
                    ambiances: data.habAmbiances?.length ? data.habAmbiances : undefined,
                    plageAcces: data.habPlageAcces || undefined,
                    urbainCommodites: data.habUrbainCommodites?.length ? data.habUrbainCommodites : undefined,
                    saharienActivites: data.habSaharienActivites?.length ? data.habSaharienActivites : undefined,
                    thermalLocalisation: data.habThermalLocalisation || undefined,
                    thermalDistance: data.habThermalDistance || undefined,
                    thermalAcces: data.habThermalAcces || undefined,
                    climatAcces: data.habClimatAcces || undefined,
                    climatTempsVoiture: toNum(data.habClimatTempsVoiture),
                    climatVisitesGuidees: (data.habClimatVisitesGuidees as any) === true,
                    climatPisteSki: (data.habClimatPisteSki as any) === true,
                    vues: data.habVues?.length ? data.habVues : undefined,
                },
                transports: {
                    airport: data.habAirport || undefined,
                    airportKm: toNum(data.habAirportKm),
                    transportCommuns: data.habTransportCommuns || undefined,
                    attractions: data.habAttractions?.length ? data.habAttractions : undefined,
                },
                services: {
                    repas: data.habRepas?.length ? data.habRepas : undefined,
                    linge: data.habLinge?.length ? data.habLinge : undefined,
                    hygiene: (data.habHygiene as any) === true,
                    livraison: (data.habLivraison as any) === true,
                    cuisineEquipements: data.habCuisineEquipements?.length ? data.habCuisineEquipements : undefined,
                    confort: data.habConfort?.length ? data.habConfort : undefined,
                    loisirs: data.habLoisirs?.length ? data.habLoisirs : undefined,
                    secours: data.habSecours?.length ? data.habSecours : undefined,
                },
                parking: {
                    options: data.habParking?.length ? data.habParking : undefined,
                    accessibilite: data.habAccessibilite || undefined,
                },
                reglement: {
                    ageMin: data.habAgeMin || undefined,
                    fumeurs: (data.habFumeurs as any) === true,
                    animaux: (data.habAnimaux as any) === true,
                    fetes: (data.habFetes as any) === true,
                    checkIn: data.habCheckIn || undefined,
                    checkOut: data.habCheckOut || undefined,
                    receptionMode: data.habReceptionMode || undefined,
                    receptionStart: data.habReceptionStart || undefined,
                    receptionEnd: data.habReceptionEnd || undefined,
                    remiseCles: data.habRemiseCles || undefined,
                    controleIdentite: data.habControleIdentite || undefined,
                },
                paiement: {
                    condition: data.habConditionPaiement || undefined,
                    acompte: data.habAcompte || undefined,
                    annulation: data.habAnnulation || undefined,
                    delaiAnnulation: data.habDelaiAnnulation || undefined,
                    nonRespect: data.habNonRespect || undefined,
                    caution: (data.habCaution as any) === true,
                    cautionMontant: data.habCautionMontant || undefined,
                    fraisMenage: data.habFraisMenage || undefined,
                    fraisMenageMontant: data.habFraisMenageMontant || undefined,
                    modes: data.habPaiements?.length ? data.habPaiements : undefined,
                },
                disponibilite: {
                    dureeMin: toNum(data.habDureeMin),
                    delaiPreparation: data.habDelaiPreparation || undefined,
                    periodeOuverture: data.habPeriodeOuverture || undefined,
                    debutSaison: data.habDebutSaison || undefined,
                    finSaison: data.habFinSaison || undefined,
                },
            },
        }
        formData.append("amenities", JSON.stringify(amenitiesPayload))

        // area/rooms génériques (requis par le backend) — mappés depuis habArea/habNbChambres,
        // comme le fait déjà le cas spécial VILLA plus haut.
        if (!data.area && data.habArea) formData.append('area', data.habArea)
        else if (data.area) formData.append('area', data.area)
        else formData.append('area', '0')

        if (!data.rooms && data.habNbChambres) formData.append('rooms', data.habNbChambres)
        else if (data.rooms) formData.append('rooms', data.rooms)
        else formData.append('rooms', '0')
    }

    // Fiche "Type de bien" Hébergement & Séjour (particulier : location de séjour ; professionnel :
    // établissement, précédé du bloc classification) — mêmes champs `hsXxx` non déclarés
    // individuellement dans le DTO, regroupés dans amenities.hebergementSejour comme ci-dessus pour
    // isHebergementHabitantPayload.
    const isHebergementSejourPayload =
        (data.transactionType === "RENTAL" && data.propertyType === "HEBERGEMENT_SEJOUR") ||
        data.propertyType === "ETABLISSEMENT_HEBERGEMENT"
    if (isHebergementSejourPayload) {
        const toNum = (v?: string) => { const n = v ? Number(v) : NaN; return isNaN(n) ? undefined : n }
        const isPro = data.propertyType === "ETABLISSEMENT_HEBERGEMENT"
        const amenitiesPayload: any = {
            hebergementSejour: {
                classification: isPro ? {
                    type: data.hsClassification || undefined,
                    nombreEtoiles: toNum(data.hsNombreEtoiles),
                    typeEtablissement: data.hsTypeEtablissement || undefined,
                    typeEtablissementAutre: data.hsTypeEtablissementAutre || undefined,
                } : undefined,
                typeBien: data.hsTypeBien || undefined,
                structure: {
                    type: data.hsStructureType || undefined,
                    insolitePrecision: data.hsStructureTypeInsolite || undefined,
                },
                maisonComplete: data.hsTypeBien === "MAISON_COMPLETE" ? {
                    surface: toNum(data.hsMcSurface),
                    etage: data.hsMcEtage || undefined,
                    ascenseur: data.hsMcAscenseur === "OUI",
                    nbChambres: toNum(data.hsMcNbChambres),
                    suiteParentale: (data.hsMcSuiteParentale as any) === true,
                    nbSalons: toNum(data.hsMcNbSalons),
                    nbSdb: toNum(data.hsMcNbSdb),
                    nbWc: toNum(data.hsMcNbWc),
                    lits: {
                        total: toNum(data.hsMcLitsTotal),
                        king: toNum(data.hsMcLitKing),
                        queen: toNum(data.hsMcLitQueen),
                        double: toNum(data.hsMcLitDouble),
                        simple: toNum(data.hsMcLitSimple),
                        superpose: toNum(data.hsMcLitSuperpose),
                        gigogne: toNum(data.hsMcLitGigogne),
                        bebe: toNum(data.hsMcLitBebe),
                    },
                    typeSalon: data.hsMcTypeSalon || undefined,
                    nbCanapesConvertibles: toNum(data.hsMcNbCanapesConvertibles),
                    nbCouchagesAppoint: toNum(data.hsMcNbCouchagesAppoint),
                    profilAdaptation: data.hsMcProfilAdaptation?.length ? data.hsMcProfilAdaptation : undefined,
                    voyageursMax: toNum(data.hsMcVoyageursMax),
                    politiqueEnfants: data.hsMcPolitiqueEnfants || undefined,
                } : undefined,
                chambre: data.hsTypeBien === "CHAMBRE" ? {
                    precision: data.hsChPrecision || undefined,
                    chezHabitant: (data.hsChChezHabitant as any) === true,
                    surface: toNum(data.hsChSurface),
                    lits: {
                        total: toNum(data.hsChLitsTotal),
                        king: toNum(data.hsChLitKing),
                        queen: toNum(data.hsChLitQueen),
                        double: toNum(data.hsChLitDouble),
                        simple: toNum(data.hsChLitSimple),
                        superpose: toNum(data.hsChLitSuperpose),
                        bebe: toNum(data.hsChLitBebe),
                    },
                    espacesCommuns: data.hsChEspacesCommuns?.length ? data.hsChEspacesCommuns : undefined,
                    nbDouches: toNum(data.hsChNbDouches),
                    nbWc: toNum(data.hsChNbWc),
                    profilAdaptation: data.hsChProfilAdaptation?.length ? data.hsChProfilAdaptation : undefined,
                    voyageursMax: toNum(data.hsChVoyageursMax),
                    politiqueEnfants: data.hsChPolitiqueEnfants || undefined,
                } : undefined,
                placeDeLit: data.hsTypeBien === "PLACE_DE_LIT" ? {
                    typeCouchage: data.hsPlTypeCouchage || undefined,
                    position: data.hsPlPosition || undefined,
                    nbLitsPiece: toNum(data.hsPlNbLitsPiece),
                    equipements: data.hsPlEquipements?.length ? data.hsPlEquipements : undefined,
                    espacesCommuns: data.hsPlEspacesCommuns?.length ? data.hsPlEspacesCommuns : undefined,
                    nbDouches: toNum(data.hsPlNbDouches),
                    nbWc: toNum(data.hsPlNbWc),
                    profilAdaptation: data.hsPlProfilAdaptation?.length ? data.hsPlProfilAdaptation : undefined,
                    voyageursMax: toNum(data.hsPlVoyageursMax),
                    politiqueEnfants: data.hsPlPolitiqueEnfants || undefined,
                } : undefined,
            },
        }
        formData.append("amenities", JSON.stringify(amenitiesPayload))

        // area/rooms génériques (requis par le backend) — mappés depuis la surface/le nombre de
        // chambres du type de bien sélectionné, comme pour isHebergementHabitantPayload ci-dessus.
        const derivedArea = data.hsTypeBien === "CHAMBRE" ? data.hsChSurface : data.hsMcSurface
        const derivedRooms = data.hsTypeBien === "MAISON_COMPLETE" ? data.hsMcNbChambres : undefined
        if (!data.area && derivedArea) formData.append('area', derivedArea)
        else if (data.area) formData.append('area', data.area)
        else formData.append('area', '0')

        if (!data.rooms && derivedRooms) formData.append('rooms', derivedRooms)
        else if (data.rooms) formData.append('rooms', data.rooms)
        else formData.append('rooms', '0')
    }

    const shouldSkipIndustrialFields = isFactoryRentalPayload || isColdRoomRentalPayload || isHangarRentalPayload

    // Usage Autorisé (affiché dans la carte "Conditions" de l'annonce, location uniquement) — dérivé
    // automatiquement de la catégorie du bien et de la case "usage croisé", pas saisi directement :
    // coché => Habitation + Commercial ; sinon Habitation (résidentiel) ou Commercial (bureaux et commerces).
    // On réutilise le champ `rentalUsage` déjà déclaré dans le schéma (array) pour qu'il passe par la
    // boucle générique ci-dessous sans créer de doublon de clé dans le FormData.
    if (data.transactionType === 'RENTAL') {
        const category = BASE_PROPERTY_TYPES.find(t => t.id === data.propertyType)?.categoryId
        const isCommercialCategory = category === 'BUREAUX_COMMERCES'
        data.rentalUsage = data.acceptsCrossUsage
            ? ['HABITATION', 'COMMERCIAL']
            : isCommercialCategory
                ? ['COMMERCIAL']
                : ['HABITATION']
    } else {
        data.rentalUsage = []
    }

    // Ajouter toutes les autres données du formulaire
    Object.entries(data).forEach(([key, value]) => {
      // On traite le prix manuellement, et description est déjà traité ou présent
      if (key === 'price') return;
      if (shouldSkipAreaRooms && (key === "area" || key === "rooms")) return;
      if (shouldSkipIndustrialFields && (key.startsWith("industrial") || key.startsWith("cf"))) return;
      if (isTerrainRentalPayload && (key.startsWith("terrain"))) return;
      if (isShowroomPayload && key.startsWith("showroom")) return;
      if (isLocalCommercialPayload && key.startsWith("local")) return;
      if (isBlocAdministratifPayload && key.startsWith("bloc")) return;
      if (isHebergementHabitantPayload && (key.startsWith("hab") || key === "area" || key === "rooms")) return;
      if (isHebergementSejourPayload && (key.startsWith("hs") || key === "area" || key === "rooms")) return;

      // On regroupe UNIQUEMENT bathroomType (qui n'est pas géré par le backend dans featuresPayload)
      // Les autres (kitchenEquipment, etc.) doivent être envoyés comme champs séparés car le backend
      // les lit individuellement (parseJsonArray(kitchenEquipment)) pour les remettre dans amenities.
      if (key === 'bathroomType') {
          return;
      }
      
      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value))
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value))
      }
    })
    
    // Ajouter le type de salle de bain explicitement dans son propre champ maintenant qu'il existe dans la BDD
    if (data.bathroomType) {
        formData.append('bathroomType', data.bathroomType);
    }

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
        // Couverture vidéo — index dans `selectedVideos`, envoyé seulement si le déposant a
        // choisi une vidéo comme couverture (exclusif avec la couverture photo).
        if (mainVideo) {
            const coverVideoIndex = selectedVideos.indexOf(mainVideo)
            if (coverVideoIndex >= 0) formData.append('coverVideoIndex', String(coverVideoIndex))
        }
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
        clearDepositDraft()
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
            alert(t("sessionExpired"))
            // router.push('/auth/login') // Impossible d'utiliser router ici si non déclaré ou hors contexte, mais on peut utiliser window.location
            window.location.href = '/auth/login'
            return
        }

        alert(`Erreur (${response.status}): ${errorData.message || JSON.stringify(errorData)}`)
      }
    } catch (error) {
      console.error("Erreur réseau:", error)
      alert(t("networkError"))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#022229] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full animate-fade-in-up">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("successTitle")}</h2>
          <p className="text-gray-600 mb-8">
            {t("successText")}
          </p>
          <Button className="w-full py-6 text-lg bg-[#00BFA6] hover:bg-[#00908A]" onClick={() => window.location.href = '/'}>
            {t("backHome")}
          </Button>
        </div>
      </div>
    )
  }

  const filteredCategories = getFilteredCategories()
  const filteredPropertyTypes = getFilteredPropertyTypes()

  const getStepTitle = () => {
    switch(currentStep) {
      case 1: return t("stepTransactionType")
      case 2: return t("stepRealEstateType")
      case 3: return t("stepDescribeProperty")
      case 4: {
          const sheet = t("stepDescriptiveSheet")
          const typeObj = BASE_PROPERTY_TYPES.find(p => p.id === propertyType)
          return typeObj ? `${sheet} - ${ptLabel(typeObj.id, typeObj.label)}` : sheet
      }
      case 5: return (isIndustrialRentalParticulier || isTerrainRentalParticulier) ? t("stepAvailability") : t("stepPriceModalities")
      case 6: return t("stepContactInfo")
      case 7: return t("stepMedia")
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

  // Les professionnels (SOCIETE) ont accès à tous les types de biens en vente et location
  const isEligibleProperty =
      (userType === "SOCIETE" && ["RENTAL", "SALE"].includes(transactionType) && !!propertyType) ||
      (propertyType === "VILLA" && (transactionType === "RENTAL" || transactionType === "SALE")) ||
      (userType === "PARTICULIER" && transactionType === "RENTAL" && propertyType === "NIVEAU_VILLA") ||
      (userType === "PARTICULIER" && transactionType === "SALE" && propertyType === "NIVEAU_VILLA") ||
      (userType === "PARTICULIER" && transactionType === "RENTAL" && (propertyType === "APPARTEMENT" || propertyType === "DUPLEX" || propertyType === "TRIPLEX" || propertyType === "STUDIO" || propertyType === "IMMEUBLE_RESIDENTIEL")) ||
      (userType === "PARTICULIER" && transactionType === "SALE" && (propertyType === "APPARTEMENT" || propertyType === "DUPLEX" || propertyType === "TRIPLEX" || propertyType === "STUDIO" || propertyType === "IMMEUBLE_RESIDENTIEL")) ||
      (userType === "PARTICULIER" && transactionType === "RENTAL" && propertyType === "USINE") ||
      (userType === "PARTICULIER" && transactionType === "RENTAL" && propertyType === "CHAMBRE_FROIDE") ||
      (userType === "PARTICULIER" && transactionType === "RENTAL" && propertyType === "HANGAR") ||
      (userType === "PARTICULIER" && transactionType === "RENTAL" && ["VILLA_COMMERCIALE", "NIVEAU_VILLA_COMMERCIAL", "APPARTEMENT_COMMERCIAL", "IMMEUBLE_BUREAU", "IMMEUBLE_COMMERCIAL"].includes(propertyType)) ||
      (userType === "PARTICULIER" && transactionType === "SALE" && ["VILLA_COMMERCIALE", "NIVEAU_VILLA_COMMERCIAL", "APPARTEMENT_COMMERCIAL", "IMMEUBLE_BUREAU", "IMMEUBLE_COMMERCIAL"].includes(propertyType)) ||
      (userType === "PARTICULIER" && ["RENTAL", "SALE"].includes(transactionType) && ["SHOWROOM", "LOCAL_COMMERCIAL", "BLOC_ADMINISTRATIF"].includes(propertyType)) ||
      (userType === "PARTICULIER" && transactionType === "RENTAL" && ["TERRAIN_RESIDENTIEL", "TERRAIN_INDUSTRIEL", "TERRAIN_AGRICOLE", "TERRAIN_TOURISTIQUE"].includes(propertyType)) ||
      (userType === "PARTICULIER" && transactionType === "RENTAL" && propertyType === "HEBERGEMENT_HABITANT") ||
      (userType === "PARTICULIER" && transactionType === "RENTAL" && propertyType === "HEBERGEMENT_SEJOUR");

  const isFormAvailable = isEligibleUser && isEligibleProperty;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#022229] flex flex-col">
        <div className="bg-[#00908A] h-[200px] w-full absolute top-0 left-0 z-0"></div>

        <div className="flex-1 flex flex-col items-center justify-start md:justify-center relative z-10 p-4 pt-[96px] md:pt-4">

            {depositDraftAvailable && (
                <div className="w-full max-w-5xl mb-4 md:mb-6 bg-white border-2 border-[#0094BD]/30 rounded-2xl shadow-lg px-4 py-3 md:px-6 md:py-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <span className="h-9 w-9 rounded-full bg-[#0094BD]/10 flex items-center justify-center shrink-0">
                            <Sparkles className="h-4.5 w-4.5 text-[#0094BD]" />
                        </span>
                        <div>
                            <p className="font-bold text-gray-900 text-sm">{t("draftFoundTitle")}</p>
                            <p className="text-xs text-gray-500">{t("draftFoundDesc", { time: new Date(depositDraftAvailable.savedAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) })}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button type="button" onClick={discardDepositDraft} className="text-sm font-bold text-gray-500 hover:text-gray-700 px-3 py-2">
                            {t("draftDiscard")}
                        </button>
                        <button type="button" onClick={resumeDepositDraft} className="bg-[#0094BD] hover:bg-[#003B4A] text-white rounded-full px-5 py-2 text-sm font-bold transition-all">
                            {t("draftResume")}
                        </button>
                    </div>
                </div>
            )}

            {/* Progress Stepper */}
            <div className="bg-white rounded-xl px-3 py-2 md:rounded-full md:px-6 md:py-3 border border-[#00BFA6]/25 shadow-lg mb-4 md:mb-8 w-full max-w-5xl flex justify-center">
                <div className="flex items-center w-full max-w-4xl">
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
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-5xl overflow-visible min-h-[500px] flex flex-col">
                <div className="p-4 md:p-8 border-b border-gray-100 flex flex-wrap items-center gap-x-4 gap-y-1">
                    {currentStep > 1 && (
                        <button
                            onClick={prevStep}
                            className="flex items-center gap-2 text-gray-500 hover:text-[#00BFA6] transition-colors font-medium shrink-0"
                        >
                            <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
                            {t("back")}
                        </button>
                    )}
                    <h1 className="text-lg md:text-2xl font-bold text-gray-800">{getStepTitle()}</h1>
                </div>

                {/* Repère de contexte — rappelle catégorie/transaction en cours pour ne pas se
                    perdre dans un parcours à plusieurs étapes ; n'apparaît qu'une fois choisis. */}
                {realEstateType && (
                    <div className="px-4 md:px-8 pt-4 flex flex-wrap items-center gap-2">
                        <span
                            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
                            style={{ backgroundColor: `${getCategoryColor(realEstateType).hex}14`, color: getCategoryColor(realEstateType).hex }}
                        >
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: getCategoryColor(realEstateType).hex }} />
                            {tc(realEstateType)}
                        </span>
                        {transactionType && (
                            <>
                                <span className="text-gray-300">/</span>
                                <span className="text-xs font-bold text-gray-500 px-3 py-1.5 rounded-full bg-gray-100">
                                    {transactionType === "RENTAL" ? t("rentalOption") : t("saleOption")}
                                </span>
                            </>
                        )}
                    </div>
                )}

                <div className="p-6 md:p-10 flex-1 flex flex-col items-center justify-center text-start">
                    {!isFormAvailable && currentStep > 3 ? (
                        <div className="w-full max-w-2xl text-center space-y-6 py-12">
                            <div className="bg-orange-50 text-orange-600 p-8 rounded-2xl border border-orange-200">
                                <Info className="h-12 w-12 mx-auto mb-4 opacity-80" />
                                <h3 className="text-xl font-bold mb-2">{t("formInProgressTitle")}</h3>
                                <p className="text-orange-700/80">
                                    {t("formInProgressText", {
                                        type: (filteredPropertyTypes.find(pt => pt.id === propertyType) || {}).label || propertyType,
                                        profile: userType === "SOCIETE" ? t("societeLabel") : t("particulierLabel"),
                                    })}
                                </p>
                                <p className="text-sm mt-4 text-orange-600/60">
                                    {t("formInProgressHint")}
                                </p>
                            </div>
                            <Button
                                onClick={() => setCurrentStep(1)}
                                className="bg-gray-900 text-white rounded-full px-8"
                            >
                                {t("restart")}
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
                                        {t("rentalOption")}
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
                                        {t("saleOption")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Real Estate Type */}
                    {currentStep === 2 && (
                        <div className="w-full max-w-7xl animate-fade-in py-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-12 gap-x-6 justify-items-center">
                                {filteredCategories.map((cat) => {
                                    const Icon = IconMap[cat.iconName] || Home
                                    const isSelected = realEstateType === cat.id
                                    const catColor = getCategoryColor(cat.id)
                                    return (
                                        <div
                                            key={cat.id}
                                            onClick={() => handleCategoryClick(cat.id)}
                                            className="flex flex-col items-center gap-4 cursor-pointer group w-full"
                                        >
                                            <div
                                                className={cn(
                                                    "w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 border-4 relative bg-white",
                                                    isSelected ? "transform -translate-y-2" : "border-gray-100 shadow-[0_8px_16px_rgba(0,0,0,0.05)] group-hover:-translate-y-1"
                                                )}
                                                style={isSelected ? { borderColor: catColor.hex, boxShadow: `0 8px 16px rgba(${catColor.rgb},0.3)` } : undefined}
                                            >
                                                <div
                                                    className={cn(
                                                        "w-24 h-24 rounded-full flex items-center justify-center transition-colors duration-300",
                                                        isSelected ? "text-white" : "bg-gray-50 text-gray-400 group-hover:bg-gray-100"
                                                    )}
                                                    style={isSelected ? { backgroundColor: catColor.hex } : undefined}
                                                >
                                                    <Icon className="h-10 w-10" />
                                                </div>
                                            </div>
                                            <span
                                                className={cn("text-lg font-bold text-center max-w-[180px] transition-colors", !isSelected && "text-gray-500")}
                                                style={isSelected ? { color: catColor.hex } : undefined}
                                            >
                                                {tc(cat.id)}
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-6 justify-items-center">
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
                                                {ptLabel(type.id, type.label)}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && isUsineRentalParticulier && (
                        <div className="w-full max-w-7xl animate-fade-in space-y-10">
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Factory className="h-5 w-5 text-[#00BFA6]" />{t('f001')}</h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-3">{t('f002')}</label>
                                        <input type="hidden" {...register("industrialSector")} />
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                            {tGroup('INDUSTRIAL_SECTORS', INDUSTRIAL_SECTORS).map((s) => (
                                                <label key={s.id} className="cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="industrialSector_radio"
                                                        className="peer sr-only"
                                                        checked={industrialSectorList.includes(s.id)}
                                                        onChange={() => handleIndustrialSectorChange(s.id)}
                                                    />
                                                    <div className="w-full min-h-[52px] flex items-center justify-between gap-3 px-4 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-900 peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 peer-checked:text-[#00BFA6] transition-all hover:border-gray-400 bg-white shadow-sm min-w-0">
                                                        <span className="text-sm leading-snug truncate min-w-0" title={s.label}>{s.label}</span>
                                                        {s.info ? (
                                                            <span title={s.info} className="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full border border-gray-300 text-gray-600 text-xs font-bold">i</span>
                                                        ) : null}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                        {errors.industrialSector && <p className="text-red-500 text-sm mt-1">{errors.industrialSector.message as any}</p>}
                                    </div>

                                    {industrialSectorList.includes("AUTRE_ACTIVITE") && (
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-2">{t('f003')}</label>
                                            <input
                                                {...register("industrialSectorOther")}
                                                type="text"
                                                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all bg-white"
                                                placeholder={t('f347')}
                                            />
                                            {errors.industrialSectorOther && <p className="text-red-500 text-sm mt-1">{errors.industrialSectorOther.message as any}</p>}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f004')}</label>
                                        <input
                                            {...register("industrialProductDetail")}
                                            type="text"
                                            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all bg-white"
                                            placeholder={t('f347')}
                                        />
                                        {errors.industrialProductDetail && <p className="text-red-500 text-sm mt-1">{errors.industrialProductDetail.message as any}</p>}
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Key className="h-5 w-5 text-[#00BFA6]" />{t('f005')}</h2>

                                <div className="space-y-6">
                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-3 whitespace-nowrap">{t('f006')}</label>
                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-start">
                                                {tGroup('INDUSTRIAL_RENTAL_TYPES', INDUSTRIAL_RENTAL_TYPES).map((t) => (
                                                    <label key={t.id} className="flex items-center gap-3 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 bg-white min-w-0">
                                                        <input type="radio" value={t.id} {...register("industrialRentalType")} className="accent-[#00BFA6] w-4 h-4" />
                                                        <span className="font-bold text-gray-900 text-sm truncate whitespace-nowrap min-w-0" title={t.label}>{t.label}</span>
                                                    </label>
                                                ))}

                                                {industrialRentalType === "EQUIPEE" && (
                                                    <div className="lg:col-start-3">
                                                        <input
                                                            {...register("industrialServiceYear")}
                                                            type="number"
                                                            min="1900"
                                                            max={new Date().getFullYear() + 1}
                                                            onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                            className="w-full h-[52px] px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] outline-none transition-all bg-white font-bold text-sm text-gray-900"
                                                            placeholder={t('f348')}
                                                        />
                                                        {errors.industrialServiceYear && <p className="text-red-500 text-sm mt-1">{errors.industrialServiceYear.message as any}</p>}
                                                    </div>
                                                )}
                                            </div>
                                            {errors.industrialRentalType && <p className="text-red-500 text-sm mt-1">{errors.industrialRentalType.message as any}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-3 whitespace-nowrap">{t('f007')}</label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            {tGroup('INDUSTRIAL_GLOBAL_STATES', INDUSTRIAL_GLOBAL_STATES).map((t) => (
                                                <label key={t.id} className="flex items-center gap-3 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 bg-white min-w-0">
                                                    <input type="radio" value={t.id} {...register("industrialGlobalState")} className="accent-[#00BFA6] w-4 h-4" />
                                                    <span className="font-bold text-gray-900 text-sm truncate whitespace-nowrap min-w-0" title={t.label}>{t.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                        {errors.industrialGlobalState && <p className="text-red-500 text-sm mt-1">{errors.industrialGlobalState.message as any}</p>}
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Ruler className="h-5 w-5 text-[#00BFA6]" />{t('f008')}</h2>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-3">{t('f009')}</label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-900 mb-2">{t('f010')}</label>
                                                <input
                                                    {...register("landArea")}
                                                    type="number"
                                                    min="0"
                                                    onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all bg-white"
                                                    placeholder={t('f349')}
                                                />
                                                {errors.landArea && <p className="text-red-500 text-sm mt-1">{errors.landArea.message as any}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-900 mb-2">{t('f011')}</label>
                                                <input
                                                    {...register("builtArea")}
                                                    type="number"
                                                    min="0"
                                                    onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all bg-white"
                                                    placeholder={t('f350')}
                                                />
                                                {errors.builtArea && <p className="text-red-500 text-sm mt-1">{errors.builtArea.message as any}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-900 mb-2">{t('f012')}</label>
                                                <input
                                                    {...register("industrialSurfaceFree")}
                                                    type="number"
                                                    min="0"
                                                    onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all bg-white"
                                                    placeholder={t('f351')}
                                                />
                                                {errors.industrialSurfaceFree && <p className="text-red-500 text-sm mt-1">{errors.industrialSurfaceFree.message as any}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-[#00BFA6]" />{t('f013')}</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f014')}</div>
                                        <div className="space-y-2">
                                            {tGroup('INDUSTRIAL_SITUATIONS', INDUSTRIAL_SITUATIONS).map((x) => (
                                                <label key={x.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={x.id} {...register("industrialSituation")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {x.label}
                                                </label>
                                            ))}
                                        </div>
                                        {errors.industrialSituation && <p className="text-red-500 text-sm mt-1">{errors.industrialSituation.message as any}</p>}
                                    </div>

                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f015')}</div>
                                        <div className="space-y-2">
                                            {tGroup('INDUSTRIAL_ACCESS_TRANSPORT', INDUSTRIAL_ACCESS_TRANSPORT).map((x) => (
                                                <label key={x.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={x.id} {...register("industrialAccessTransport")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {x.label}
                                                </label>
                                            ))}
                                        </div>
                                        {errors.industrialAccessTransport && <p className="text-red-500 text-sm mt-1">{errors.industrialAccessTransport.message as any}</p>}
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <LayoutGrid className="h-5 w-5 text-[#00BFA6]" />{t('f016')}</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl h-full">
                                        <div className="font-bold text-gray-900 mb-3">{t('f017')}</div>
                                        <div className="flex gap-4 flex-wrap">
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                <input type="radio" name="industrialOffices_choice" checked={!!industrialOffices} onChange={() => { setValue("industrialOffices", true as any, { shouldValidate: true }); }} className="accent-[#00BFA6] w-4 h-4" />{t('f018')}</label>
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                <input type="radio" name="industrialOffices_choice" checked={!industrialOffices} onChange={() => { setValue("industrialOffices", false as any, { shouldValidate: true }); setValue("industrialOfficesArea", "", { shouldValidate: false }); clearErrors(["industrialOfficesArea"]); }} className="accent-[#00BFA6] w-4 h-4" />{t('f019')}</label>
                                            {!!industrialOffices && (
                                                <div className="w-full mt-2">
                                                    <label className="block text-sm font-bold text-gray-900 mb-2">{t('f020')}</label>
                                                    <input
                                                        {...register("industrialOfficesArea")}
                                                        type="number"
                                                        min="0"
                                                        onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                        className="w-full p-3 border-2 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900"
                                                        placeholder={t('f352')}
                                                    />
                                                    {errors.industrialOfficesArea && <p className="text-red-500 text-sm mt-1">{errors.industrialOfficesArea.message as any}</p>}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl h-full">
                                        <div className="font-bold text-gray-900 mb-3">{t('f021')}</div>
                                        <div className="space-y-2">
                                            {tGroup('INDUSTRIAL_SOCIAL_LOCALES', INDUSTRIAL_SOCIAL_LOCALES).map((x) => (
                                                <label key={x.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={x.id} {...register("industrialSocialLocales")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {x.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl h-full">
                                        <div className="font-bold text-gray-900 mb-3">{t('f022')}</div>
                                        <div className="space-y-2">
                                            {tGroup('INDUSTRIAL_HEBERGEMENT', INDUSTRIAL_HEBERGEMENT).map((x) => (
                                                <label key={x.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={x.id} {...register("industrialHebergement")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {x.label}
                                                </label>
                                            ))}
                                        </div>

                                    </div>

                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl h-full">
                                        <div className="font-bold text-gray-900 mb-3">{t('f023')}</div>
                                        <div className="space-y-2">
                                            {tGroup('INDUSTRIAL_SECURITY', INDUSTRIAL_SECURITY).map((x) => (
                                                <label key={x.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={x.id} {...register("industrialSecurity")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {x.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-[#00BFA6]" />{t('f024')}</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl space-y-4 h-full">
                                        <div className="font-bold text-gray-900">{t('f025')}</div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-900 mb-2">{t('f026')}</label>
                                                <input
                                                    {...register("industrialElectricityTransformerKva")}
                                                    type="number"
                                                    min="0"
                                                    onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                    className="w-full p-3 border-2 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900"
                                                    placeholder={t('f353')}
                                                />
                                                {errors.industrialElectricityTransformerKva && <p className="text-red-500 text-sm mt-1">{errors.industrialElectricityTransformerKva.message as any}</p>}
                                            </div>
                                            <label className="flex items-center gap-3 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 bg-white">
                                                <input type="checkbox" {...register("industrialElectricityForceMotrice")} className="accent-[#00BFA6] w-5 h-5" />
                                                <span className="font-bold text-gray-900 text-sm">{t('f027')}</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl space-y-4 h-full">
                                        <div className="font-bold text-gray-900">{t('f028')}</div>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                <input type="checkbox" value="INDUSTRIEL" {...register("industrialGas")} className="accent-[#00BFA6] w-4 h-4" />{t('f029')}</label>
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                <input type="checkbox" value="VILLE" {...register("industrialGas")} className="accent-[#00BFA6] w-4 h-4" />{t('f030')}</label>
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                <input type="checkbox" value="AUCUN" {...register("industrialGas")} className="accent-[#00BFA6] w-4 h-4" />{t('f031')}</label>
                                        </div>
                                        {errors.industrialGas && <p className="text-red-500 text-sm mt-1">{errors.industrialGas.message as any}</p>}
                                    </div>

                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl space-y-4 h-full">
                                        <div className="font-bold text-gray-900">{t('f032')}</div>
                                        <div className="space-y-2">
                                            {tGroup('INDUSTRIAL_WATER_SOURCES', INDUSTRIAL_WATER_SOURCES).map((x) => (
                                                <label key={x.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={x.id} {...register("industrialWaterSources")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {x.label}
                                                </label>
                                            ))}
                                        </div>
                                        {errors.industrialWaterSources && <p className="text-red-500 text-sm mt-1">{errors.industrialWaterSources.message as any}</p>}

                                    </div>

                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl space-y-4 h-full">
                                        <div className="font-bold text-gray-900">{t('f033')}</div>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                <input type="checkbox" value="RESEAU_PUBLIC" {...register("industrialSanitation")} className="accent-[#00BFA6] w-4 h-4" />{t('f034')}</label>
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                <input type="checkbox" value="FOSSE_INDUSTRIELLE" {...register("industrialSanitation")} className="accent-[#00BFA6] w-4 h-4" />{t('f035')}</label>
                                        </div>
                                        {errors.industrialSanitation && <p className="text-red-500 text-sm mt-1">{errors.industrialSanitation.message as any}</p>}
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Siren className="h-5 w-5 text-[#00BFA6]" />{t('f036')}</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f037')}</div>
                                        <div className="space-y-2">
                                            {tGroup('INDUSTRIAL_FIRE_NETWORK', INDUSTRIAL_FIRE_NETWORK).map((x) => (
                                                <label key={x.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={x.id} {...register("industrialFireNetwork")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {x.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl space-y-4">
                                        <div className="font-bold text-gray-900">{t('f038')}</div>
                                        <div className="space-y-2">
                                            {tGroup('INDUSTRIAL_FIRE_EQUIPMENT', INDUSTRIAL_FIRE_EQUIPMENT).map((x) => (
                                                <label key={x.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={x.id} {...register("industrialFireEquipment")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {x.label}
                                                </label>
                                            ))}
                                        </div>

                                        {industrialFireEquipmentList.includes("BACHE_EAU") && (
                                            <div>
                                                <label className="block text-sm font-bold text-gray-900 mb-2">{t('f172')} <span className="text-red-500">*</span></label>
                                                <input
                                                    {...register("industrialFireWaterReserveLiters")}
                                                    type="text"
                                                    inputMode="numeric"
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/[^0-9]/g, "")
                                                        const formatted = val.replace(/\B(?=(\d{3})+(?!\d))/g, " ")
                                                        setValue("industrialFireWaterReserveLiters", formatted, { shouldValidate: true })
                                                    }}
                                                    className="w-full p-3 border-2 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900"
                                                    placeholder={t('f354')}
                                                />
                                                {errors.industrialFireWaterReserveLiters && <p className="text-red-500 text-sm mt-1">{errors.industrialFireWaterReserveLiters.message as any}</p>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* Step 4: Fiche descriptive - Hangar */}
                    {currentStep === 4 && isHangarRentalParticulier && (
                        <div className="w-full max-w-7xl animate-fade-in space-y-10">

                            {/* Section 1 : Dimensions & Surface */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Ruler className="h-5 w-5 text-[#00BFA6]" />{t('f039')}</h2>

                                <div className="space-y-5">
                                    {/* Ligne 1 : Surface terrain | Surface couverte | État global */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-2">{t('f040')}</label>
                                            <input
                                                {...register("hangarSurfaceTerrain")}
                                                type="number"
                                                min="0"
                                                onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all bg-white"
                                                placeholder={t('f350')}
                                            />
                                            {errors.hangarSurfaceTerrain && <p className="text-red-500 text-sm mt-1">{errors.hangarSurfaceTerrain.message as any}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-2">{t('f041')}</label>
                                            <input
                                                {...register("hangarSurfaceCovered")}
                                                type="number"
                                                min="0"
                                                onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all bg-white"
                                                placeholder={t('f355')}
                                            />
                                            {errors.hangarSurfaceCovered && <p className="text-red-500 text-sm mt-1">{errors.hangarSurfaceCovered.message as any}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-2">{t('f007')}</label>
                                            <select
                                                {...register("industrialGlobalState")}
                                                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all bg-white font-medium text-gray-900"
                                            >
                                                <option value="">{t('f042')}</option>
                                                {tGroup('INDUSTRIAL_GLOBAL_STATES', INDUSTRIAL_GLOBAL_STATES).map((s) => (
                                                    <option key={s.id} value={s.id}>{s.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Ligne 2 : Longueur | Largeur | Hauteur sous crochet */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-2">{t('f043')}</label>
                                            <input
                                                {...register("hangarLength")}
                                                type="number"
                                                min="0"
                                                onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all bg-white"
                                                placeholder={t('f356')}
                                            />
                                            {errors.hangarLength && <p className="text-red-500 text-sm mt-1">{errors.hangarLength.message as any}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-2">{t('f044')}</label>
                                            <input
                                                {...register("hangarWidth")}
                                                type="number"
                                                min="0"
                                                onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all bg-white"
                                                placeholder={t('f357')}
                                            />
                                            {errors.hangarWidth && <p className="text-red-500 text-sm mt-1">{errors.hangarWidth.message as any}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-2">{t('f045')}</label>
                                            <input
                                                {...register("hangarHeight")}
                                                type="number"
                                                min="0"
                                                onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all bg-white"
                                                placeholder={t('f358')}
                                            />
                                            {errors.hangarHeight && <p className="text-red-500 text-sm mt-1">{errors.hangarHeight.message as any}</p>}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 2 : Infrastructure */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Warehouse className="h-5 w-5 text-[#00BFA6]" />{t('f046')}</h2>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl space-y-3">
                                        <div className="font-bold text-gray-900">{t('f047')}</div>
                                        <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                            <input type="checkbox" value="STOCKAGE_LOGISTIQUE" {...register("hangarUsage")} className="accent-[#00BFA6] w-4 h-4" />{t('f048')}</label>
                                        <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                            <input type="checkbox" value="PRODUCTION_INDUSTRIEL" {...register("hangarUsage")} className="accent-[#00BFA6] w-4 h-4" />{t('f049')}</label>
                                    </div>

                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl space-y-3">
                                        <div className="font-bold text-gray-900">{t('f050')}</div>
                                        <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                            <input type="checkbox" {...register("hangarStructureToleTH40")} className="accent-[#00BFA6] w-4 h-4" />{t('f051')}</label>
                                        <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                            <input type="checkbox" {...register("hangarStructurePanneauxSandwich")} className="accent-[#00BFA6] w-4 h-4" />{t('f052')}</label>
                                        <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                            <input type="checkbox" {...register("hangarToitureAutre")} className="accent-[#00BFA6] w-4 h-4" />{t('f053')}</label>
                                    </div>

                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl space-y-3">
                                        <div className="font-bold text-gray-900">{t('f054')}</div>
                                        <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                            <input type="checkbox" {...register("hangarSolBetonQuartz")} className="accent-[#00BFA6] w-4 h-4" />{t('f055')}</label>
                                        <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                            <input type="checkbox" {...register("hangarSolResineEpoxy")} className="accent-[#00BFA6] w-4 h-4" />{t('f056')}</label>
                                        <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                            <input type="checkbox" {...register("hangarSolAutre")} className="accent-[#00BFA6] w-4 h-4" />{t('f053')}</label>
                                    </div>
                                </div>
                            </section>

                            {/* Section 3 : Emplacement */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-[#00BFA6]" />{t('f057')}</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f014')}</div>
                                        <div className="space-y-2">
                                            {tGroup('INDUSTRIAL_SITUATIONS', INDUSTRIAL_SITUATIONS).map((x) => (
                                                <label key={x.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={x.id} {...register("industrialSituation")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {x.label}
                                                </label>
                                            ))}
                                        </div>
                                        {errors.industrialSituation && <p className="text-red-500 text-sm mt-1">{errors.industrialSituation.message as any}</p>}
                                    </div>

                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f058')}</div>
                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{t('f015')}</div>
                                        <div className="space-y-2">
                                            {tGroup('INDUSTRIAL_ACCESS_TRANSPORT', INDUSTRIAL_ACCESS_TRANSPORT).map((x) => (
                                                <label key={x.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={x.id} {...register("industrialAccessTransport")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {x.label}
                                                </label>
                                            ))}
                                        </div>
                                        {errors.industrialAccessTransport && <p className="text-red-500 text-sm mt-1">{errors.industrialAccessTransport.message as any}</p>}
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <LayoutGrid className="h-5 w-5 text-[#00BFA6]" />{t('f016')}</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl h-full">
                                        <div className="font-bold text-gray-900 mb-3">{t('f017')}</div>
                                        <div className="flex gap-4 flex-wrap">
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                <input type="radio" name="industrialOffices_choice" checked={!!industrialOffices} onChange={() => { setValue("industrialOffices", true as any, { shouldValidate: true }); }} className="accent-[#00BFA6] w-4 h-4" />{t('f018')}</label>
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                <input type="radio" name="industrialOffices_choice" checked={!industrialOffices} onChange={() => { setValue("industrialOffices", false as any, { shouldValidate: true }); setValue("industrialOfficesArea", "", { shouldValidate: false }); clearErrors(["industrialOfficesArea"]); }} className="accent-[#00BFA6] w-4 h-4" />{t('f019')}</label>
                                            {!!industrialOffices && (
                                                <div className="w-full mt-2">
                                                    <label className="block text-sm font-bold text-gray-900 mb-2">{t('f020')}</label>
                                                    <input
                                                        {...register("industrialOfficesArea")}
                                                        type="number"
                                                        min="0"
                                                        onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                        className="w-full p-3 border-2 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900"
                                                        placeholder={t('f352')}
                                                    />
                                                    {errors.industrialOfficesArea && <p className="text-red-500 text-sm mt-1">{errors.industrialOfficesArea.message as any}</p>}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl h-full">
                                        <div className="font-bold text-gray-900 mb-3">{t('f021')}</div>
                                        <div className="space-y-2">
                                            {tGroup('INDUSTRIAL_SOCIAL_LOCALES', INDUSTRIAL_SOCIAL_LOCALES).map((x) => (
                                                <label key={x.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={x.id} {...register("industrialSocialLocales")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {x.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl h-full">
                                        <div className="font-bold text-gray-900 mb-3">{t('f022')}</div>
                                        <div className="space-y-2">
                                            {tGroup('INDUSTRIAL_HEBERGEMENT', INDUSTRIAL_HEBERGEMENT).map((x) => (
                                                <label key={x.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={x.id} {...register("industrialHebergement")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {x.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl h-full">
                                        <div className="font-bold text-gray-900 mb-3">{t('f023')}</div>
                                        <div className="space-y-2">
                                            {tGroup('INDUSTRIAL_SECURITY', INDUSTRIAL_SECURITY).map((x) => (
                                                <label key={x.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={x.id} {...register("industrialSecurity")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {x.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-[#00BFA6]" />{t('f024')}</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl space-y-4 h-full">
                                        <div className="font-bold text-gray-900">{t('f025')}</div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-900 mb-2">{t('f026')}</label>
                                                <input
                                                    {...register("industrialElectricityTransformerKva")}
                                                    type="number"
                                                    min="0"
                                                    onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                    className="w-full p-3 border-2 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900"
                                                    placeholder={t('f353')}
                                                />
                                                {errors.industrialElectricityTransformerKva && <p className="text-red-500 text-sm mt-1">{errors.industrialElectricityTransformerKva.message as any}</p>}
                                            </div>
                                            <label className="flex items-center gap-3 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 bg-white">
                                                <input type="checkbox" {...register("industrialElectricityForceMotrice")} className="accent-[#00BFA6] w-5 h-5" />
                                                <span className="font-bold text-gray-900 text-sm">{t('f027')}</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl space-y-4 h-full">
                                        <div className="font-bold text-gray-900">{t('f028')}</div>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                <input type="checkbox" value="INDUSTRIEL" {...register("industrialGas")} className="accent-[#00BFA6] w-4 h-4" />{t('f029')}</label>
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                <input type="checkbox" value="VILLE" {...register("industrialGas")} className="accent-[#00BFA6] w-4 h-4" />{t('f030')}</label>
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                <input type="checkbox" value="AUCUN" {...register("industrialGas")} className="accent-[#00BFA6] w-4 h-4" />{t('f031')}</label>
                                        </div>
                                        {errors.industrialGas && <p className="text-red-500 text-sm mt-1">{errors.industrialGas.message as any}</p>}
                                    </div>

                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl space-y-4 h-full">
                                        <div className="font-bold text-gray-900">{t('f032')}</div>
                                        <div className="space-y-2">
                                            {tGroup('INDUSTRIAL_WATER_SOURCES', INDUSTRIAL_WATER_SOURCES).map((x) => (
                                                <label key={x.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={x.id} {...register("industrialWaterSources")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {x.label}
                                                </label>
                                            ))}
                                        </div>
                                        {errors.industrialWaterSources && <p className="text-red-500 text-sm mt-1">{errors.industrialWaterSources.message as any}</p>}
                                    </div>

                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl space-y-4 h-full">
                                        <div className="font-bold text-gray-900">{t('f033')}</div>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                <input type="checkbox" value="RESEAU_PUBLIC" {...register("industrialSanitation")} className="accent-[#00BFA6] w-4 h-4" />{t('f034')}</label>
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                <input type="checkbox" value="FOSSE_INDUSTRIELLE" {...register("industrialSanitation")} className="accent-[#00BFA6] w-4 h-4" />{t('f035')}</label>
                                        </div>
                                        {errors.industrialSanitation && <p className="text-red-500 text-sm mt-1">{errors.industrialSanitation.message as any}</p>}
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Siren className="h-5 w-5 text-[#00BFA6]" />{t('f036')}</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f037')}</div>
                                        <div className="space-y-2">
                                            {tGroup('INDUSTRIAL_FIRE_NETWORK', INDUSTRIAL_FIRE_NETWORK).map((x) => (
                                                <label key={x.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={x.id} {...register("industrialFireNetwork")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {x.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl space-y-4">
                                        <div className="font-bold text-gray-900">{t('f038')}</div>
                                        <div className="space-y-2">
                                            {tGroup('INDUSTRIAL_FIRE_EQUIPMENT', INDUSTRIAL_FIRE_EQUIPMENT).map((x) => (
                                                <label key={x.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={x.id} {...register("industrialFireEquipment")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {x.label}
                                                </label>
                                            ))}
                                        </div>

                                        {industrialFireEquipmentList.includes("BACHE_EAU") && (
                                            <div>
                                                <label className="block text-sm font-bold text-gray-900 mb-2">{t('f172')} <span className="text-red-500">*</span></label>
                                                <input
                                                    {...register("industrialFireWaterReserveLiters")}
                                                    type="text"
                                                    inputMode="numeric"
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/[^0-9]/g, "")
                                                        const formatted = val.replace(/\B(?=(\d{3})+(?!\d))/g, " ")
                                                        setValue("industrialFireWaterReserveLiters", formatted, { shouldValidate: true })
                                                    }}
                                                    className="w-full p-3 border-2 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900"
                                                    placeholder={t('f354')}
                                                />
                                                {errors.industrialFireWaterReserveLiters && <p className="text-red-500 text-sm mt-1">{errors.industrialFireWaterReserveLiters.message as any}</p>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>

                        </div>
                    )}

                    {/* Step 4: Fiche descriptive - Chambre froide */}
                    {currentStep === 4 && isChambreFroideRentalParticulier && (
                        <div className="w-full max-w-7xl animate-fade-in space-y-10">

                            {/* Section 1 : Activités & Usages autorisés */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Snowflake className="h-5 w-5 text-[#00BFA6]" />{t('f059')}</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-3">{t('f060')}</label>
                                        <input type="hidden" {...register("cfSector")} />
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                            {tGroup('CF_SECTORS', CF_SECTORS).map((s) => (
                                                <label key={s.id} className="cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="cfSector_radio"
                                                        className="peer sr-only"
                                                        checked={cfSectorList.includes(s.id)}
                                                        onChange={() => setValue("cfSector", [s.id], { shouldValidate: true })}
                                                    />
                                                    <div className="w-full min-h-[52px] flex items-center justify-between gap-3 px-4 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-900 peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 peer-checked:text-[#00BFA6] transition-all hover:border-gray-400 bg-white shadow-sm">
                                                        <span className="text-sm leading-snug truncate" title={s.label}>{s.label}</span>
                                                        {s.info ? <span title={s.info} className="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full border border-gray-300 text-gray-600 text-xs font-bold">i</span> : null}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    {cfSectorList.includes("AUTRE_CF") && (
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-2">{t('f061')}</label>
                                            <input {...register("cfSectorOther")} type="text" className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none bg-white" placeholder={t('f347')} />
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Section 1b : Infrastructure & Surfaces */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Ruler className="h-5 w-5 text-[#00BFA6]" />{t('f008')}</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f043')}</label>
                                        <input {...register("cfLength")} type="number" min="0" onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()} className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] font-medium" placeholder={t('f359')} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f044')}</label>
                                        <input {...register("cfWidth")} type="number" min="0" onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()} className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] font-medium" placeholder={t('f360')} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f062')}</label>
                                        <input {...register("cfHeight")} type="number" min="0" step="0.1" onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()} className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] font-medium" placeholder={t('f361')} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f063')}</label>
                                        <input {...register("cfCapacity")} type="number" min="0" onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()} className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] font-medium" placeholder={t('f362')} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f007')}</label>
                                        <select {...register("cfEtatGlobal")} className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] font-medium text-gray-900">
                                            <option value="">{t('f042')}</option>
                                            {tGroup('INDUSTRIAL_GLOBAL_STATES', INDUSTRIAL_GLOBAL_STATES).map((s) => (
                                                <option key={s.id} value={s.id}>{s.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </section>

                            {/* Annexes & Commodités */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <LayoutGrid className="h-5 w-5 text-[#00BFA6]" />{t('f016')}</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                                    {/* Bureaux */}
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f017')}</div>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                                                <input type="radio" value="true" {...register("industrialOffices")} className="accent-[#00BFA6] w-4 h-4" />{t('f018')}</label>
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                                                <input type="radio" value="false" {...register("industrialOffices")} className="accent-[#00BFA6] w-4 h-4" />{t('f019')}</label>
                                        </div>
                                    </div>
                                    {/* Locaux sociaux */}
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f021')}</div>
                                        <div className="space-y-2">
                                            {[
                                                { id: "VESTIAIRES", label: "Vestiaires" },
                                                { id: "REFECTOIRE", label: "Réfectoire" },
                                                { id: "SANITAIRES_HF", label: "Sanitaires H/F" },
                                            ].map((x) => (
                                                <label key={x.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={x.id} {...register("industrialSocialLocales")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {x.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Hébergement */}
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f022')}</div>
                                        <div className="space-y-2">
                                            {[
                                                { id: "LOGEMENT", label: "Logement" },
                                                { id: "DORTOIRS", label: "Dortoirs" },
                                            ].map((x) => (
                                                <label key={x.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={x.id} {...register("industrialHebergement")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {x.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Sécurité */}
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f023')}</div>
                                        <div className="space-y-2">
                                            {[
                                                { id: "POSTE_GARDE", label: "Poste de garde" },
                                                { id: "CLOTURE_MACONNEE", label: "Clôture maçonnée" },
                                                { id: "CAMERAS", label: "Caméras" },
                                            ].map((x) => (
                                                <label key={x.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={x.id} {...register("industrialSecurity")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {x.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 2 : Configuration & Emplacement du site */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-[#00BFA6]" />{t('f064')}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
                                    {/* Localisation */}
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f065')}</div>
                                        <div className="space-y-2">
                                            {tGroup('INDUSTRIAL_SITUATIONS', INDUSTRIAL_SITUATIONS).map((x) => (
                                                <label key={x.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={x.id} {...register("cfLocalisation")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {x.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Type de structure */}
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f066')}</div>
                                        <div className="space-y-2">
                                            {tGroup('CF_STRUCTURE_TYPES', CF_STRUCTURE_TYPES).map((x) => (
                                                <label key={x.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="radio" value={x.id} {...register("cfStructureType")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {x.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Configuration */}
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f067')}</div>
                                        <div className="flex gap-4 flex-wrap">
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                <input type="radio" value="PLAIN_PIED" {...register("cfConfiguration")} className="accent-[#00BFA6] w-4 h-4" />{t('f068')}</label>
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                <input type="radio" value="ETAGES" {...register("cfConfiguration")} className="accent-[#00BFA6] w-4 h-4" />{t('f069')}</label>
                                        </div>
                                        {cfConfiguration === "ETAGES" && (
                                            <div className="w-full mt-3">
                                                <input {...register("cfFloorsCount")} type="number" min="1" onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()} className="w-full p-3 border-2 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] font-medium" placeholder={t('f139')} />
                                            </div>
                                        )}
                                    </div>
                                    {/* Logistique verticale */}
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f070')}</div>
                                        <div className="flex gap-4 flex-wrap items-end">
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                <input type="radio" value="MONTE_CHARGE" {...register("cfLogistiqueVerticale")} className="accent-[#00BFA6] w-4 h-4" />{t('f071')}</label>
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                <input type="radio" value="AUCUN" {...register("cfLogistiqueVerticale")} className="accent-[#00BFA6] w-4 h-4" />{t('f031')}</label>
                                            {cfLogistiqueVerticale === "MONTE_CHARGE" && (
                                                <div className="w-full">
                                                    <input {...register("cfMonteChargeCapacity")} type="number" min="0" onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()} className="w-full p-3 border-2 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] font-medium" placeholder={t('f363')} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {/* Accessibilité camions */}
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f072')}</div>
                                        <div className="space-y-2">
                                            {tGroup('INDUSTRIAL_ACCESS_TRANSPORT', INDUSTRIAL_ACCESS_TRANSPORT).map((x) => (
                                                <label key={x.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={x.id} {...register("cfAccessibilite")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {x.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Zone de déchargement */}
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f073')}</div>
                                        <div className="space-y-2">
                                            {tGroup('CF_ZONE_DECHARGEMENT', CF_ZONE_DECHARGEMENT).map((x) => (
                                                <label key={x.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={x.id} {...register("cfZoneDechargement")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {x.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 3 : Équipements de sécurité & Performance */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-[#00BFA6]" />{t('f074')}</h2>
                                <div className="space-y-5">
                                    {/* Ligne 1 : Énergie de secours + Technique Froid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {/* Énergie de secours */}
                                        <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                            <div className="font-bold text-gray-900 mb-3">{t('f075')}</div>
                                            <label className="flex items-center gap-3 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 bg-white">
                                                <input type="checkbox" {...register("cfGenerateur")} className="accent-[#00BFA6] w-5 h-5" />
                                                <span className="font-bold text-gray-900 text-sm">{t('f076')}</span>
                                            </label>
                                            {cfGenerateur && (
                                                <div className="mt-3">
                                                    <input {...register("cfGenerateurKva")} type="number" min="0" onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()} className="w-full p-3 border-2 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] font-medium" placeholder={t('f364')} />
                                                </div>
                                            )}
                                        </div>
                                        {/* Technique Froid */}
                                        <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                            <div className="font-bold text-gray-900 mb-3">{t('f077')}</div>
                                            <div className="space-y-2">
                                                {tGroup('CF_TECHNIQUE_FROID', CF_TECHNIQUE_FROID).map((x) => (
                                                    <label key={x.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                        <input type="checkbox" value={x.id} {...register("cfTechniqueFroid")} className="accent-[#00BFA6] w-4 h-4" />
                                                        {x.label}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Ligne 2 : Type de froid + Mode de diffusion */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {/* Type de froid */}
                                        <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                            <div className="font-bold text-gray-900 mb-3">{t('f078')}</div>
                                            <div className="space-y-2">
                                                {[
                                                    { id: "POSITIF", label: "Positif" },
                                                    { id: "NEGATIF", label: "Négatif" },
                                                    { id: "ULTRA_FROID", label: "Ultra Froid (Tunnel de congélation)" },
                                                ].map((x) => (
                                                    <label key={x.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                        <input type="checkbox" value={x.id} {...register("cfTypeFroid")} className="accent-[#00BFA6] w-4 h-4" />
                                                        {x.label}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        {/* Mode de diffusion */}
                                        <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                            <div className="font-bold text-gray-900 mb-3">{t('f079')}</div>
                                            <div className="space-y-2">
                                                {[
                                                    { id: "FROID_VENTILE", label: "Froid Ventilé" },
                                                    { id: "FROID_STATIQUE", label: "Froid Statique" },
                                                ].map((x) => (
                                                    <label key={x.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                        <input type="checkbox" value={x.id} {...register("cfModeDiffusion")} className="accent-[#00BFA6] w-4 h-4" />
                                                        {x.label}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 4 : Modalités de location & Flexibilité */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Key className="h-5 w-5 text-[#00BFA6]" />{t('f080')}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    {/* Mode de gestion */}
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f081')}</div>
                                        <div className="space-y-3">
                                            {tGroup('CF_MODE_GESTION', CF_MODE_GESTION).map((x) => (
                                                <label key={x.id} className="flex items-start gap-2 cursor-pointer">
                                                    <input type="radio" value={x.id} {...register("cfModeGestion")} className="accent-[#00BFA6] w-4 h-4 mt-1 shrink-0" />
                                                    <div>
                                                        <div className="font-bold text-gray-900 text-sm">{x.label}</div>
                                                        <div className="text-xs text-gray-500 mt-0.5">{x.desc}</div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Flexibilité d'espace */}
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f082')}</div>
                                        <div className="space-y-3">
                                            {tGroup('CF_FLEXIBILITE', CF_FLEXIBILITE).map((x) => (
                                                <label key={x.id} className="flex items-start gap-2 cursor-pointer">
                                                    <input type="checkbox" value={x.id} {...register("cfFlexibilite")} className="accent-[#00BFA6] w-4 h-4 mt-1 shrink-0" />
                                                    <div>
                                                        <div className="font-bold text-gray-900 text-sm">{x.label}</div>
                                                        <div className="text-xs text-gray-500 mt-0.5">{x.desc}</div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Durée d'engagement */}
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f083')}</div>
                                        <div className="space-y-2">
                                            {tGroup('CF_DUREE_ENGAGEMENT', CF_DUREE_ENGAGEMENT).map((x) => (
                                                <label key={x.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={x.id} {...register("cfDureeEngagement")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {x.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                        </div>
                    )}

                    {/* Step 4: Fiche descriptive - Terrain */}
                    {currentStep === 4 && isTerrainRentalParticulier && (
                        <div className="w-full max-w-4xl animate-fade-in flex flex-col gap-10">

                            {/* Section B : Caractéristiques Physiques */}
                            <section className="space-y-6 order-1">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Ruler className="h-5 w-5 text-[#00BFA6]" />{t('f084')}</h2>
                                {/* Ligne 1 : Superficie / Altitude / Nb façades */}
                                <div className={`grid grid-cols-1 gap-5 ${isTerrainAgricole ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
                                    {/* Surface terrain */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">{isTerrainAgricole ? t('adSuperficie') : t('adLandArea')}</label>
                                        {isTerrainAgricole ? (
                                            <div className="relative">
                                                <input
                                                    {...register("landArea")}
                                                    type="number" min="0" step="0.01"
                                                    onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()}
                                                    className="w-full p-3 pe-32 border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] font-medium"
                                                    placeholder={t('f365')}
                                                />
                                                <div className="absolute end-2 top-2 bottom-2 flex items-center bg-gray-100 rounded-lg px-1">
                                                    <select {...register("terrainAgricoleUnite")} className="bg-transparent border-none focus:ring-0 text-gray-700 font-bold text-sm cursor-pointer outline-none pr-1">
                                                        <option value="">{t('f085')}</option>
                                                        {tGroup('TERRAIN_AGRICOLE_UNITE', TERRAIN_AGRICOLE_UNITE).map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        ) : (
                                            <input {...register("landArea")} type="number" min="0" onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()} className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] font-medium" placeholder={t('f366')} />
                                        )}
                                    </div>
                                    {/* Altitude — uniquement terrain agricole */}
                                    {isTerrainAgricole && (
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-2">{t('f086')}</label>
                                            <input {...register("terrainAgricoleAltitude")} type="number" min="0" onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()} className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] font-medium" placeholder={t('f367')} />
                                        </div>
                                    )}
                                    {/* Nombre de façades */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-3">{t('f087')}</label>
                                        <div className="flex gap-3">
                                            {[1, 2, 3, 4].map((n) => (
                                                <label key={n} className="cursor-pointer">
                                                    <input type="radio" value={String(n)} {...register("facadesCount")} className="peer sr-only" />
                                                    <div className="w-12 h-12 border-2 rounded-xl flex items-center justify-center font-bold text-gray-600 peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 peer-checked:text-[#00BFA6] transition-all hover:border-gray-400 bg-gray-50">{n}</div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                {/* Reste des champs en 2 colonnes */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Longueur façade principale */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f088')}</label>
                                        <input {...register("terrainFacadeLength")} type="number" min="0" step="0.1" onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()} className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] font-medium" placeholder={t('f368')} />
                                    </div>
                                    {/* Profondeur terrain */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f089')}</label>
                                        <input {...register("terrainDepth")} type="number" min="0" step="0.1" onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()} className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] font-medium" placeholder={t('f369')} />
                                    </div>
                                    {/* Topographie */}
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f090')}</div>
                                        <div className="space-y-2">
                                            {tGroup('TERRAIN_TOPOGRAPHIE', TERRAIN_TOPOGRAPHIE).map((x) => (
                                                <label key={x.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="radio" value={x.id} {...register("terrainTopographie")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {x.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Statut de la zone / Viabilité selon le type de terrain */}
                                    {isTerrainAgricole ? (
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl space-y-3">
                                        <div className="font-bold text-gray-900">{t('f091')}</div>
                                        <div className="flex gap-6 flex-wrap">
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                <input type="radio" value={"true" as any} {...register("terrainViabilise")} className="accent-[#00BFA6] w-4 h-4" onChange={() => setValue("terrainViabilise", true as any)} checked={terrainViabilise === true} />{t('f092')}</label>
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                <input type="radio" value={"false" as any} {...register("terrainViabilise")} className="accent-[#00BFA6] w-4 h-4" onChange={() => setValue("terrainViabilise", false as any)} checked={terrainViabilise === false} />{t('f093')}</label>
                                        </div>
                                    </div>
                                    ) : isTerrainTouristique ? (
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl space-y-3">
                                        <div className="font-bold text-gray-900">{t('f091')}</div>
                                        <div className="flex gap-6 flex-wrap">
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                <input type="radio" value={"true" as any} {...register("terrainViabilise")} className="accent-[#00BFA6] w-4 h-4" onChange={() => setValue("terrainViabilise", true as any)} checked={terrainViabilise === true} />{t('f092')}</label>
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                <input type="radio" value={"false" as any} {...register("terrainViabilise")} className="accent-[#00BFA6] w-4 h-4" onChange={() => setValue("terrainViabilise", false as any)} checked={terrainViabilise === false} />{t('f093')}</label>
                                        </div>
                                    </div>
                                    ) : (
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f094')}</div>
                                        <div className="space-y-2">
                                            {(propertyType === "TERRAIN_INDUSTRIEL" ? tGroup('TERRAIN_INDUSTRIEL_ZONE', TERRAIN_INDUSTRIEL_ZONE) : tGroup('TERRAIN_STATUT_ZONE', TERRAIN_STATUT_ZONE)).map((x) => (
                                                <label key={x.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={x.id} {...register("terrainStatutZone")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {x.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    )}
                                </div>
                            </section>

                            {/* Section C : État Juridique & Urbanisme */}
                            <section className={`space-y-6 ${isTerrainAgricole ? "order-3" : "order-2"}`}>
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-[#00BFA6]" />{t('f095')}</h2>
                                <div className="space-y-5">
                                    {/* Documents disponibles — tous sur une seule ligne */}
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f096')}</div>
                                        <div className="flex flex-wrap gap-x-6 gap-y-2">
                                            {tGroup('TERRAIN_DOCUMENTS', TERRAIN_DOCUMENTS).map((doc) => (
                                                <label key={doc.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-lg px-1 py-0.5">
                                                    <input type="checkbox" value={doc.id} {...register("terrainDocuments")} className="accent-[#00BFA6] w-4 h-4 shrink-0" />
                                                    <span className="font-medium text-gray-700 text-sm whitespace-nowrap">{doc.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Viabilisation & Raccordements — masqué pour agricole et touristique (viabilité déjà dans Caractéristiques Physiques) */}
                                    {!isTerrainAgricole && !isTerrainTouristique && <div className="bg-white border-2 border-gray-200 p-4 rounded-xl space-y-4">
                                        <div className="font-bold text-gray-900">{t('f091')}</div>
                                        <div className="flex gap-6">
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                <input type="radio" value={"true" as any} {...register("terrainViabilise")} className="accent-[#00BFA6] w-4 h-4" onChange={() => setValue("terrainViabilise", true as any)} checked={terrainViabilise === true} />{t('f092')}</label>
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                <input type="radio" value={"false" as any} {...register("terrainViabilise")} className="accent-[#00BFA6] w-4 h-4" onChange={() => setValue("terrainViabilise", false as any)} checked={terrainViabilise === false} />{t('f093')}</label>
                                        </div>
                                        {terrainViabilise === false && !isTerrainAgricole && !isTerrainTouristique && (
                                            <div>
                                                <div className="text-sm font-bold text-gray-700 mb-2">{t('f097')}</div>
                                                <div className="flex flex-wrap gap-x-6 gap-y-2">
                                                    {tGroup('TERRAIN_RACCORDEMENTS', TERRAIN_RACCORDEMENTS).map((r) => (
                                                        <label key={r.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                            <input type="checkbox" value={r.id} {...register("terrainRaccordements")} className="accent-[#00BFA6] w-4 h-4" />
                                                            <span className="whitespace-nowrap">{r.label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>}
                                </div>
                            </section>

                            {/* Section Agricole — uniquement pour Terrain Agricole */}
                            {isTerrainAgricole && (
                            <>
                            <section className="space-y-6 order-2">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Leaf className="h-5 w-5 text-[#00BFA6]" />{t('f098')}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Vocation agricole */}
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f099')}</div>
                                        <div className="space-y-2">
                                            {tGroup('TERRAIN_AGRICOLE_VOCATION', TERRAIN_AGRICOLE_VOCATION).map((v) => (
                                                <label key={v.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={v.id} {...register("terrainAgricoleVocation")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {v.label}
                                                </label>
                                            ))}
                                        </div>
                                        {terrainAgricoleVocationList.includes("MIXTE") && (
                                            <div className="mt-3">
                                                <input {...register("terrainAgricoleVocationAutre")} className="w-full p-2 border-2 border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] text-sm font-medium" placeholder={t('f370')} />
                                            </div>
                                        )}
                                    </div>
                                    {/* Ressources en eau */}
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f100')}</div>
                                        <div className="space-y-2">
                                            {tGroup('TERRAIN_AGRICOLE_RESSOURCES_EAU', TERRAIN_AGRICOLE_RESSOURCES_EAU).filter(r => r.id !== "FORAGE").map((r) => (
                                                <label key={r.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={r.id} {...register("terrainAgricoleRessourcesEau")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {r.label}
                                                </label>
                                            ))}
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                <input type="checkbox" value="FORAGE" {...register("terrainAgricoleRessourcesEau")} className="accent-[#00BFA6] w-4 h-4" />{t('f101')}</label>
                                        </div>
                                        {terrainAgricoleRessourcesEauList.includes("FORAGE") && (
                                            <div className="mt-3">
                                                <label className="block text-xs font-bold text-gray-700 mb-1">{t('f102')}</label>
                                                <input {...register("terrainAgricoleDebitForage")} type="number" min="0" step="0.1" className="w-full p-2 border-2 border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] text-sm font-medium" placeholder={t('f371')} onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()} />
                                            </div>
                                        )}
                                    </div>
                                    {/* Exposition */}
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f103')}</div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {tGroup('TERRAIN_AGRICOLE_EXPOSITION', TERRAIN_AGRICOLE_EXPOSITION).map((e) => (
                                                <label key={e.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={e.id} {...register("terrainAgricoleExposition")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {e.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Ensoleillement */}
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f104')}</div>
                                        <div className="space-y-2">
                                            {tGroup('TERRAIN_AGRICOLE_ENSOLEILLEMENT', TERRAIN_AGRICOLE_ENSOLEILLEMENT).map((e) => (
                                                <label key={e.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="radio" value={e.id} {...register("terrainAgricoleEnsoleillement")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {e.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Nature du sol */}
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f105')}</div>
                                        <div className="space-y-2">
                                            {tGroup('TERRAIN_AGRICOLE_NATURE_SOL', TERRAIN_AGRICOLE_NATURE_SOL).map((x) => (
                                                <label key={x.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={x.id} {...register("terrainAgricoleNatureSol")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {x.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Zone d'implantation — déplacée depuis Bâtiments */}
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f106')}</div>
                                        <div className="space-y-2">
                                            {tGroup('TERRAIN_AGRICOLE_ZONE', TERRAIN_AGRICOLE_ZONE).map((x) => (
                                                <label key={x.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="radio" value={x.id} {...register("terrainAgricoleZone")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {x.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Qualité de l'eau — juste avant Équipements hydrauliques */}
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f107')}</div>
                                        <div className="space-y-2">
                                            {tGroup('TERRAIN_AGRICOLE_QUALITE_EAU', TERRAIN_AGRICOLE_QUALITE_EAU).map((x) => (
                                                <label key={x.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="radio" value={x.id} {...register("terrainAgricoleQualiteEau")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {x.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Équipements hydrauliques */}
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f108')}</div>
                                        <div className="space-y-2">
                                            {tGroup('TERRAIN_AGRICOLE_EQUIPEMENT_HYDRAULIQUE', TERRAIN_AGRICOLE_EQUIPEMENT_HYDRAULIQUE).map((x) => (
                                                <label key={x.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={x.id} {...register("terrainAgricoleEquipementHydro")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {x.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    {/* État actuel du terrain */}
                                    <div className="md:col-span-2 bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f109')}</div>
                                        <div className="flex gap-6 flex-wrap">
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                <input type="radio" value="VIDE" {...register("terrainAgricoleEtatCulture")} className="accent-[#00BFA6] w-4 h-4" />{t('f110')}</label>
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                <input type="radio" value="EXPLOITE" {...register("terrainAgricoleEtatCulture")} className="accent-[#00BFA6] w-4 h-4" />{t('f111')}</label>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section Accessibilité & Logistique — uniquement pour Terrain Agricole */}
                            <section className="space-y-6 order-4">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Navigation className="h-5 w-5 text-[#00BFA6]" />{t('f112')}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f113')}</div>
                                        <div className="space-y-2">
                                            {tGroup('TERRAIN_AGRICOLE_ACCES', TERRAIN_AGRICOLE_ACCES).map((x) => (
                                                <label key={x.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={x.id} {...register("terrainAgricoleAcces")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {x.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f114')}</div>
                                        <div className="space-y-2">
                                            {tGroup('TERRAIN_AGRICOLE_ACCES_LOURDS', TERRAIN_AGRICOLE_ACCES_LOURDS).map((x) => (
                                                <label key={x.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={x.id} {...register("terrainAgricoleAccesLourds")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {x.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section Bâtiments & Clôture — uniquement pour Terrain Agricole */}
                            <section className="space-y-6 order-5">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Home className="h-5 w-5 text-[#00BFA6]" />{t('f115')}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f116')}</div>
                                        <div className="space-y-2">
                                            {tGroup('TERRAIN_AGRICOLE_CONSTRUCTIONS', TERRAIN_AGRICOLE_CONSTRUCTIONS).map((x) => (
                                                <label key={x.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={x.id} {...register("terrainAgricoleConstructions")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {x.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f117')}</div>
                                        <div className="space-y-2">
                                            {tGroup('TERRAIN_AGRICOLE_CLOTURE', TERRAIN_AGRICOLE_CLOTURE).map((x) => (
                                                <label key={x.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="radio" value={x.id} {...register("terrainAgricoleCloture")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {x.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>
                            </>
                            )}

                            {/* Section Touristique — uniquement pour Terrain Touristique */}
                            {isTerrainTouristique && (
                            <section className="space-y-6 order-2">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Palmtree className="h-5 w-5 text-[#00BFA6]" />{t('f118')}</h2>
                                <div className="space-y-5">
                                    {/* ZET + PAT */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                            <div className="font-bold text-gray-900 mb-1">{t('f119')}</div>
                                            <div className="text-xs text-gray-500 mb-3">{t('f120')}</div>
                                            <div className="space-y-2">
                                                {tGroup('TERRAIN_TOURISTIQUE_ZET', TERRAIN_TOURISTIQUE_ZET).map((x) => (
                                                    <label key={x.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                        <input type="radio" value={x.id} {...register("terrainTouristiqueZet")} className="accent-[#00BFA6] w-4 h-4" />
                                                        {x.label}
                                                    </label>
                                                ))}
                                            </div>
                                            {terrainTouristiqueZet === "OUI" && (
                                                <div className="mt-3">
                                                    <input {...register("terrainTouristiqueZetNom")} type="text" className="w-full p-2 border-2 border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] text-sm font-medium" placeholder={t('f372')} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                            <div className="font-bold text-gray-900 mb-1">{t('f121')}</div>
                                            <div className="text-xs text-gray-500 mb-3">{t('f122')}</div>
                                            <div className="space-y-2">
                                                {tGroup('TERRAIN_TOURISTIQUE_PAT', TERRAIN_TOURISTIQUE_PAT).map((x) => (
                                                    <label key={x.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                        <input type="radio" value={x.id} {...register("terrainTouristiquePat")} className="accent-[#00BFA6] w-4 h-4" />
                                                        {x.label}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Classification de la zone */}
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f123')}</div>
                                        <div className="text-xs text-gray-500 mb-3">{t('f124')}</div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {tGroup('TERRAIN_TOURISTIQUE_ZONE', TERRAIN_TOURISTIQUE_ZONE).map((x) => (
                                                <label key={x.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="radio" value={x.id} {...register("terrainTouristiqueZone")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {x.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>
                            )}

                        </div>
                    )}

                    {/* Step 4: Fiche descriptive - Immeuble Commercial */}
                    {currentStep === 4 && isImmeubleCommercialParticulier && (
                        <div className="w-full max-w-4xl animate-fade-in space-y-10">

                            {/* Section 1 : Informations Générales & Superficies */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Ruler className="h-5 w-5 text-[#00BFA6]" />{t('f125')}</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f020')}</label>
                                        <input {...register("immeubleSurfaceTerrain")} type="number" min="0" onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()} className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] font-medium" placeholder={t('f373')} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f126')}</label>
                                        <input {...register("immeubleSurfaceBatie")} type="number" min="0" onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()} className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] font-medium" placeholder={t('f374')} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f127')}</label>
                                        <input {...register("immeubleLargeur")} type="number" min="0" onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()} className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] font-medium" placeholder={t('f359')} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f128')}</label>
                                        <input {...register("immeubleNbEtages")} type="number" min="1" onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()} className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] font-medium" placeholder={t('f375')} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f129')}</label>
                                        <input {...register("immeubleHsp")} type="number" min="0" step="0.1" onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()} className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] font-medium" placeholder={t('f376')} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f130')}</label>
                                        <input {...register("immeubleNbRideaux")} type="number" min="0" onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()} className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] font-medium" placeholder={t('f377')} />
                                    </div>
                                    <div className="md:col-span-3">
                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f131')}</label>
                                        <input {...register("immeubleFacadeLineaire")} type="number" min="0" step="0.1" onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()} className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] font-medium" placeholder={t('f378')} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-3">{t('f132')}</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {tGroup('IMMEUBLE_ETAT_GLOBAL', IMMEUBLE_ETAT_GLOBAL).map((eg) => (
                                            <label key={eg.id} className="flex items-start gap-3 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-[#00BFA6]/40 bg-white">
                                                <input type="radio" value={eg.id} {...register("immeubleEtatGlobal")} className="accent-[#00BFA6] w-4 h-4 mt-1 shrink-0" />
                                                <div>
                                                    <div className="font-bold text-gray-900 text-sm">{eg.label}</div>
                                                    <div className="text-xs text-gray-500 mt-0.5">{eg.desc}</div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            {/* Section 2 : Emplacement, Visibilité & Accès — 3 colonnes */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-[#00BFA6]" />{t('f133')}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f134')}</div>
                                        <div className="space-y-2">
                                            {tGroup('IMMEUBLE_TYPE_ZONE', IMMEUBLE_TYPE_ZONE).map((z) => (
                                                <label key={z.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={z.id} {...register("immeubleTypeZone")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {z.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f135')}</div>
                                        <div className="space-y-2">
                                            {tGroup('IMMEUBLE_VISIBILITE', IMMEUBLE_VISIBILITE).map((v) => (
                                                <label key={v.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={v.id} {...register("immeubleVisibilite")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {v.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f136')}</div>
                                        <div className="space-y-2">
                                            {tGroup('IMMEUBLE_TYPE_ACCES', IMMEUBLE_TYPE_ACCES).map((a) => (
                                                <label key={a.id} className="flex items-center gap-2 cursor-pointer">
                                                    <input type="radio" value={a.id} {...register("immeubleTypeAcces")} className="accent-[#00BFA6] w-4 h-4 shrink-0" />
                                                    <span className="font-medium text-gray-700 text-sm">{a.label}</span>
                                                    <div className="relative group">
                                                        <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                                                        <div className="absolute start-0 bottom-6 z-20 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-normal pointer-events-none">
                                                            {a.desc}
                                                        </div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                        </div>
                    )}

                    {/* Step 4: Fiche descriptive - Showroom */}
                    {currentStep === 4 && isShowroomParticulier && (
                        <div className="w-full max-w-4xl animate-fade-in space-y-10">

                            {/* Superficies & Dimensions */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Ruler className="h-5 w-5 text-[#00BFA6]" />{t('f137')}</h2>
                                {/* Ligne 1 : 3 colonnes */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f040')}</label>
                                        <input {...register("showroomSurfaceTerrain")} type="number" min="0" onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()} className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] font-medium" placeholder={t('f373')} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f138')}</label>
                                        <input {...register("showroomSurfaceBatie")} type="number" min="0" onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()} className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] font-medium" placeholder={t('f379')} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f139')}</label>
                                        <input {...register("showroomNiveaux")} type="number" min="1" max="10" onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()} className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] font-medium" placeholder={t('f380')} />
                                    </div>
                                </div>
                                {/* Ligne 2 : 3 colonnes */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f126')}</label>
                                        <input {...register("showroomFacadeWidth")} type="number" min="0" step="0.1" onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()} className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] font-medium" placeholder={t('f359')} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f127')}</label>
                                        <input {...register("showroomFacadeDepth")} type="number" min="0" step="0.1" onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()} className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] font-medium" placeholder={t('f378')} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f129')}</label>
                                        <input {...register("showroomHauteurPlafond")} type="number" min="0" step="0.1" onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()} className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] font-medium" placeholder={t('f361')} />
                                    </div>
                                </div>
                            </section>

                            {/* État & Style Architectural */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Paintbrush className="h-5 w-5 text-[#00BFA6]" />{t('f140')}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f141')}</div>
                                        <div className="space-y-2">
                                            {tGroup('SHOWROOM_STYLE', SHOWROOM_STYLE).map((s) => (
                                                <label key={s.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={s.id} {...register("showroomStyle")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {s.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl space-y-3">
                                        <div className="font-bold text-gray-900">{t('f142')}</div>
                                        <div className="space-y-2">
                                            {tGroup('SHOWROOM_STRUCTURE', SHOWROOM_STRUCTURE).map((s) => (
                                                <label key={s.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={s.id} {...register("showroomStructure")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {s.label}
                                                </label>
                                            ))}
                                        </div>
                                        {showroomStructureList.includes("AUTRE") && (
                                            <input {...register("showroomStructureAutre")} className="w-full p-2.5 border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] font-medium text-sm" placeholder={t('f381')} />
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* Visibilité & Accessibilité */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Eye className="h-5 w-5 text-[#00BFA6]" />{t('f143')}</h2>
                                <div className="bg-white border-2 border-gray-200 p-5 rounded-xl space-y-4">
                                    <div>
                                        <div className="font-bold text-gray-900 mb-3">{t('f144')}</div>
                                        <div className="flex gap-6">
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                                                <input type="radio" value={"true" as any} {...register("showroomVisibiliteAutoroute")} className="accent-[#00BFA6] w-4 h-4" onChange={() => setValue("showroomVisibiliteAutoroute", true as any)} checked={showroomVisibiliteAutoroute === true} />{t('f018')}</label>
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                                                <input type="radio" value={"false" as any} {...register("showroomVisibiliteAutoroute")} className="accent-[#00BFA6] w-4 h-4" onChange={() => setValue("showroomVisibiliteAutoroute", false as any)} checked={showroomVisibiliteAutoroute === false} />{t('f019')}</label>
                                        </div>
                                    </div>
                                    {showroomVisibiliteAutoroute === true && (
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-2">{t('f145')}</label>
                                            <input {...register("showroomAxeRoutier")} className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] font-medium" placeholder={t('f382')} />
                                        </div>
                                    )}
                                </div>
                            </section>

                        </div>
                    )}

                    {/* Step 4: Fiche descriptive - Local Commercial */}
                    {currentStep === 4 && isLocalCommercialParticulier && (
                        <div className="w-full max-w-4xl animate-fade-in space-y-10">

                            {/* Superficies & Dimensions — PREMIÈRE SECTION */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Ruler className="h-5 w-5 text-[#00BFA6]" />{t('f137')}</h2>
                                {/* Ligne 1 : 3 colonnes */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f020')}</label>
                                        <input {...register("localSurfaceTotal")} type="number" min="0" onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()} className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] font-medium" placeholder={t('f383')} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f126')}</label>
                                        <input {...register("localVitrineLongueur")} type="number" min="0" step="0.1" onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()} className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] font-medium" placeholder={t('f384')} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f127')}</label>
                                        <input {...register("localLargeur")} type="number" min="0" step="0.1" onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()} className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] font-medium" placeholder={t('f360')} />
                                    </div>
                                </div>
                                {/* Ligne 2 : 2 colonnes */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f129')}</label>
                                        <input {...register("localHauteurPlafond")} type="number" min="0" step="0.1" onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()} className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] font-medium" placeholder={t('f376')} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f139')}</label>
                                        <input {...register("localNbEtages")} type="number" min="1" onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()} className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] font-medium" placeholder={t('f385')} />
                                    </div>
                                </div>
                            </section>

                            {/* État & Style */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Paintbrush className="h-5 w-5 text-[#00BFA6]" />{t('f146')}</h2>
                                <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                    <div className="font-bold text-gray-900 mb-3">{t('f147')}</div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {tGroup('LOCAL_STYLE', LOCAL_STYLE).map((s) => (
                                            <label key={s.id} className="cursor-pointer">
                                                <input type="radio" value={s.id} {...register("localStyle")} className="peer sr-only" />
                                                <div className="w-full p-3 border-2 border-gray-200 rounded-xl text-center font-bold text-gray-700 peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 peer-checked:text-[#00BFA6] transition-all hover:border-gray-300 bg-gray-50">
                                                    {s.label}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            {/* Emplacement & Flux */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-[#00BFA6]" />{t('f148')}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f134')}</div>
                                        <div className="space-y-2">
                                            {tGroup('LOCAL_ZONE_TYPE', LOCAL_ZONE_TYPE).map((z) => (
                                                <label key={z.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={z.id} {...register("localZoneType")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {z.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f149')}</div>
                                        <div className="space-y-2">
                                            {tGroup('LOCAL_FLUX', LOCAL_FLUX).map((f) => (
                                                <label key={f.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="radio" value={f.id} {...register("localFluxPieton")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {f.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f150')}</div>
                                        <div className="space-y-2">
                                            {tGroup('LOCAL_FLUX', LOCAL_FLUX).map((f) => (
                                                <label key={f.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="radio" value={f.id} {...register("localFluxVehicules")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {f.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Environnement & Usage — DERNIÈRE SECTION (fusionnée) */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Store className="h-5 w-5 text-[#00BFA6]" />{t('f151')}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Environnement */}
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f152')}</div>
                                        <div className="space-y-2">
                                            {tGroup('LOCAL_ENVIRONNEMENT', LOCAL_ENVIRONNEMENT).map((e) => (
                                                <label key={e.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={e.id} {...register("localEnvironnement")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {e.label}
                                                </label>
                                            ))}
                                            {(localEnvironnement as any)?.includes?.("AUTRE") && (
                                                <input {...register("localEnvironnementAutre")} className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] font-medium text-sm mt-1" placeholder={t('f386')} />
                                            )}
                                        </div>
                                    </div>
                                    {/* Usage */}
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f153')}</div>
                                        <div className="space-y-2">
                                            {tGroup('LOCAL_USAGE', LOCAL_USAGE).map((u) => (
                                                <label key={u.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={u.id} {...register("localUsage")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {u.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                        </div>
                    )}

                    {/* Step 4: Fiche descriptive - Bloc Administratif */}
                    {currentStep === 4 && isBlocAdministratifParticulier && (
                        <div className="w-full max-w-4xl animate-fade-in space-y-10">

                            {/* Caractéristiques Extérieures — redesignée */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-[#00BFA6]" />{t('f154')}</h2>
                                {/* Ligne 1 : surfaces + étages */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f040')}</label>
                                        <input {...register("blocSurfaceTerrain")} type="number" min="0" onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()} className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] font-medium" placeholder={t('f387')} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f138')}</label>
                                        <input {...register("blocSurfaceBatie")} type="number" min="0" onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()} className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] font-medium" placeholder={t('f367')} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f155')}</label>
                                        <input {...register("blocEtages")} type="number" min="0" max="20" onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()} className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] font-medium" placeholder={t('f377')} />
                                    </div>
                                </div>
                                {/* Ligne 2 : état général + garage + stationnement */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f156')}</label>
                                        <select {...register("state")} className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] font-medium text-gray-900">
                                            <option value="">{t('f042')}</option>
                                            {PROPERTY_STATES.filter(s => s.id !== "A_DEMOLIR").map(s => <option key={s.id} value={s.id}>{optLabel('PROPERTY_STATES', s)}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f157')}</label>
                                        <input {...register("parkingCount")} type="number" min="0" onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()} className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] font-medium" placeholder={t('f360')} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f158')}</label>
                                        <input {...register("outdoorParking")} type="number" min="0" onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()} className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] font-medium" placeholder={t('f359')} />
                                    </div>
                                </div>
                                {/* Ligne 3 : façades + sous-sol */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f087')}</label>
                                        <div className="flex gap-3">
                                            {[1,2,3,4].map((n) => (
                                                <label key={n} className="cursor-pointer">
                                                    <input type="radio" value={String(n)} {...register("blocFacades")} className="peer sr-only" />
                                                    <div className="w-12 h-12 border-2 rounded-xl flex items-center justify-center font-bold text-gray-600 peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 peer-checked:text-[#00BFA6] transition-all hover:border-gray-400 bg-gray-50">{n}</div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl space-y-3">
                                        <div className="font-bold text-gray-900">{t('f159')}</div>
                                        <div className="flex gap-6">
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                                                <input type="radio" value={"true" as any} {...register("blocSousSol")} className="accent-[#00BFA6] w-4 h-4" onChange={() => setValue("blocSousSol", true as any)} checked={blocSousSolVal === true} />{t('f018')}</label>
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                                                <input type="radio" value={"false" as any} {...register("blocSousSol")} className="accent-[#00BFA6] w-4 h-4" onChange={() => setValue("blocSousSol", false as any)} checked={blocSousSolVal === false} />{t('f019')}</label>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Type d'Espace (multi-choix) */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <LayoutGrid className="h-5 w-5 text-[#00BFA6]" />{t('f160')}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f161')}</div>
                                        <div className="space-y-2">
                                            {tGroup('BLOC_TYPE_ESPACE', BLOC_TYPE_ESPACE).map((e) => (
                                                <label key={e.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={e.id} {...register("blocTypeEspace")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {e.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f162')}</div>
                                        <div className="space-y-2">
                                            {tGroup('BLOC_CLOISONNEMENT', BLOC_CLOISONNEMENT).map((c) => (
                                                <label key={c.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={c.id} {...register("blocTypeCloisonnement")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {c.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Extérieurs & Commodités — comme appartement résidentiel */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Trees className="text-[#00BFA6]" />{t('f163')}</h2>
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-3">{t('f164')}</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-3">
                                        {VILLA_EQUIPMENTS.exterior.filter(item => item.id !== 'barbecue').map((item) => {
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-100 pt-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-3">{t('f023')}</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            {VILLA_EQUIPMENTS.security.map(s => {
                                                const Icon = IconMap[s.icon] || Shield
                                                return (
                                                    <label key={s.id} className="cursor-pointer group">
                                                        <input type="checkbox" value={s.id} {...register("securityFeatures")} className="peer sr-only" />
                                                        <div className="flex flex-col items-center gap-2 p-3 border-2 border-gray-200 rounded-xl hover:border-[#00BFA6] peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 peer-checked:text-[#00BFA6] transition-all bg-white h-24">
                                                            <Icon className="h-6 w-6 text-gray-400 group-hover:text-gray-600 peer-checked:text-[#00BFA6]" />
                                                            <span className="text-xs font-bold text-center leading-tight text-gray-700 peer-checked:text-[#00BFA6]">{s.label}</span>
                                                        </div>
                                                    </label>
                                                )
                                            })}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-3">{t('f165')}</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            {VILLA_EQUIPMENTS.connectivity.map(c => {
                                                const Icon = IconMap[c.icon] || Wifi
                                                return (
                                                    <label key={c.id} className="cursor-pointer group">
                                                        <input type="checkbox" value={c.id} {...register("connectivity")} className="peer sr-only" />
                                                        <div className="flex flex-col items-center gap-2 p-3 border-2 border-gray-200 rounded-xl hover:border-[#00BFA6] peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 peer-checked:text-[#00BFA6] transition-all bg-white h-24">
                                                            <Icon className="h-6 w-6 text-gray-400 group-hover:text-gray-600 peer-checked:text-[#00BFA6]" />
                                                            <span className="text-xs font-bold text-center leading-tight text-gray-700 peer-checked:text-[#00BFA6]">{c.label}</span>
                                                        </div>
                                                    </label>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Cuisine */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Utensils className="h-5 w-5 text-[#00BFA6]" />{t('f166')}</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {tGroup('BLOC_CUISINE', BLOC_CUISINE).map((c) => (
                                        <label key={c.id} className="cursor-pointer">
                                            <input type="radio" value={c.id} {...register("blocCuisine")} className="peer sr-only" />
                                            <div className="w-full p-3 border-2 border-gray-200 rounded-xl text-center font-bold text-gray-700 peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 peer-checked:text-[#00BFA6] transition-all hover:border-gray-300 bg-gray-50 text-sm">
                                                {c.label}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </section>

                            {/* Logement de fonction */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Home className="h-5 w-5 text-[#00BFA6]" />{t('f167')}</h2>
                                <div className="bg-white border-2 border-gray-200 p-4 rounded-xl space-y-3">
                                    <div className="font-bold text-gray-900">{t('f168')}</div>
                                    <div className="flex gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                                            <input type="radio" value={"true" as any} {...register("blocLogementFonction")} className="accent-[#00BFA6] w-4 h-4" onChange={() => setValue("blocLogementFonction", true as any)} checked={blocLogementFonction === true} />{t('f018')}</label>
                                        <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                                            <input type="radio" value={"false" as any} {...register("blocLogementFonction")} className="accent-[#00BFA6] w-4 h-4" onChange={() => setValue("blocLogementFonction", false as any)} checked={blocLogementFonction === false} />{t('f019')}</label>
                                    </div>
                                </div>
                            </section>

                            {/* Connectivité & Réseau */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Wifi className="h-5 w-5 text-[#00BFA6]" />{t('f169')}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f170')}</div>
                                        <div className="space-y-2">
                                            {tGroup('BLOC_CONNEXION', BLOC_CONNEXION).map((c) => (
                                                <label key={c.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="radio" value={c.id} {...register("blocTypeConnexion")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {c.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f171')}</div>
                                        <div className="space-y-2">
                                            {tGroup('BLOC_EQUIPEMENT_SERVEUR', BLOC_EQUIPEMENT_SERVEUR).map((e) => (
                                                <label key={e.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={e.id} {...register("blocEquipementServeur")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {e.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Énergie & Fluides */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-[#00BFA6]" />{t('f024')}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl space-y-4">
                                        <div className="font-bold text-gray-900">{t('f025')}</div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-900 mb-2">{t('f026')}</label>
                                                <input {...register("industrialElectricityTransformerKva")} type="number" min="0" onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()} className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] font-medium" placeholder={t('f353')} />
                                            </div>
                                            <label className="flex items-center gap-3 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 bg-white">
                                                <input type="checkbox" {...register("industrialElectricityForceMotrice")} className="accent-[#00BFA6] w-5 h-5" />
                                                <span className="font-bold text-gray-900 text-sm">{t('f027')}</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl space-y-4">
                                        <div className="font-bold text-gray-900">{t('f028')}</div>
                                        <div className="space-y-2">
                                            {[{ id: "INDUSTRIEL", label: t('f029') }, { id: "VILLE", label: t('depGasCity') }, { id: "AUCUN", label: t('f031') }].map(g => (
                                                <label key={g.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={g.id} {...register("industrialGas")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {g.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl space-y-4">
                                        <div className="font-bold text-gray-900">{t('f032')}</div>
                                        <div className="space-y-2">
                                            {tGroup('INDUSTRIAL_WATER_SOURCES', INDUSTRIAL_WATER_SOURCES).map((x) => (
                                                <label key={x.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={x.id} {...register("industrialWaterSources")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {x.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl space-y-4">
                                        <div className="font-bold text-gray-900">{t('f033')}</div>
                                        <div className="space-y-2">
                                            {[{ id: "RESEAU_PUBLIC", label: t('f034') }, { id: "FOSSE_INDUSTRIELLE", label: t('f035') }].map(a => (
                                                <label key={a.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={a.id} {...register("industrialSanitation")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {a.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Sécurité incendie & Protection */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Siren className="h-5 w-5 text-[#00BFA6]" />{t('f036')}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f037')}</div>
                                        <div className="space-y-2">
                                            {tGroup('INDUSTRIAL_FIRE_NETWORK', INDUSTRIAL_FIRE_NETWORK).map((x) => (
                                                <label key={x.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={x.id} {...register("industrialFireNetwork")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {x.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl space-y-4">
                                        <div className="font-bold text-gray-900">{t('f038')}</div>
                                        <div className="space-y-2">
                                            {tGroup('INDUSTRIAL_FIRE_EQUIPMENT', INDUSTRIAL_FIRE_EQUIPMENT).map((x) => (
                                                <label key={x.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={x.id} {...register("industrialFireEquipment")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {x.label}
                                                </label>
                                            ))}
                                        </div>
                                        {industrialFireEquipmentList.includes("BACHE_EAU") && (
                                            <div>
                                                <label className="block text-sm font-bold text-gray-900 mb-2">{t('f172')}</label>
                                                <input
                                                    {...register("industrialFireWaterReserveLiters")}
                                                    type="text"
                                                    inputMode="numeric"
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/[^0-9]/g, "")
                                                        const formatted = val.replace(/\B(?=(\d{3})+(?!\d))/g, " ")
                                                        setValue("industrialFireWaterReserveLiters", formatted, { shouldValidate: true })
                                                    }}
                                                    className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] font-medium"
                                                    placeholder={t('f354')}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>

                        </div>
                    )}

                    {/* Step 4: Fiche descriptive - Villa / Niveau de villa / Appartement / Commerciaux */}
                    {currentStep === 4 && (
                        (
                            (propertyType === "VILLA" && (transactionType === "RENTAL" || transactionType === "SALE")) ||
                            (propertyType === "NIVEAU_VILLA" && (transactionType === "RENTAL" || transactionType === "SALE")) ||
                            ((propertyType === "APPARTEMENT" || propertyType === "DUPLEX" || propertyType === "TRIPLEX" || propertyType === "STUDIO" || propertyType === "IMMEUBLE_RESIDENTIEL") && transactionType === "RENTAL") ||
                            ((propertyType === "APPARTEMENT" || propertyType === "DUPLEX" || propertyType === "TRIPLEX" || propertyType === "STUDIO" || propertyType === "IMMEUBLE_RESIDENTIEL") && transactionType === "SALE") ||
                            (propertyType === "VILLA_COMMERCIALE" && (transactionType === "RENTAL" || transactionType === "SALE")) ||
                            (propertyType === "NIVEAU_VILLA_COMMERCIAL" && (transactionType === "RENTAL" || transactionType === "SALE")) ||
                            ((propertyType === "APPARTEMENT_COMMERCIAL" || propertyType === "IMMEUBLE_BUREAU") && (transactionType === "RENTAL" || transactionType === "SALE"))
                        )
                    ) && (
                        <div className="w-full max-w-5xl animate-fade-in space-y-10">
                            
                            {/* 1. Caractéristiques Générales & Structure */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Building2 className="text-[#00BFA6]" />{t('f173')}</h2>
                                
                                <div className="flex flex-col gap-5">
                                    {(propertyType === "IMMEUBLE_RESIDENTIEL" || propertyType === "IMMEUBLE_BUREAU") ? (
                                        <div className="flex flex-col gap-5">
                                            {isSaleBuilding && (
                                                <div className={cn(
                                                    "grid grid-cols-1 gap-5 items-end",
                                                    isBuildingDemolition ? "md:grid-cols-2" : "md:grid-cols-1"
                                                )}>
                                                    <div className="min-w-0">
                                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f177')} <span className="text-red-500">*</span></label>
                                                        <select {...register("state")} className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base">
                                                            <option value="">{t('f042')}</option>
                                                            {PROPERTY_STATES.filter(s => allowDemolirOption || s.id !== "A_DEMOLIR").map(s => <option key={s.id} value={s.id}>{optLabel('PROPERTY_STATES', s)}</option>)}
                                                        </select>
                                                        {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                                                    </div>

                                                    {isBuildingDemolition && (
                                                        <div className="min-w-0">
                                                            <label className="block text-sm font-bold text-gray-900 mb-2">{t('f040')} <span className="text-red-500">*</span></label>
                                                            <input
                                                                {...register("landArea")}
                                                                type="number"
                                                                min="0"
                                                                onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                                className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base"
                                                                placeholder={t('f388')}
                                                            />
                                                            {errors.landArea && <p className="text-red-500 text-xs mt-1">{errors.landArea.message as any}</p>}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {!isBuildingDemolition && (
                                            <>
                                            <div className="min-w-0">
                                                <label className="block text-sm font-bold text-gray-900 mb-2">{t('f196')} <span className="text-red-500">*</span></label>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {BUILDING_TYPOLOGY_MODES.map((m) => (
                                                        <label key={m.id} className="cursor-pointer">
                                                            <input type="radio" value={m.id} {...register("buildingTypologyMode")} className="peer sr-only" />
                                                            <div className="w-full min-h-[64px] flex items-center justify-center px-4 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-900 peer-checked:border-[#00BFA6] peer-checked:bg-[#00BFA6]/10 peer-checked:text-[#00BFA6] transition-all bg-white shadow-sm hover:border-gray-400 text-center whitespace-normal leading-snug">
                                                                {optLabel('BUILDING_TYPOLOGY_MODES', m)}
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                                {errors.buildingTypologyMode && <p className="text-red-500 text-xs mt-1">{errors.buildingTypologyMode.message as any}</p>}
                                            </div>

                                            {buildingTypologyMode === "SIMILAIRES" && (
                                                <div className="flex flex-col gap-5">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.1fr_1.1fr_1.1fr_1.4fr] gap-3 items-end">
                                                        <div className="min-w-0">
                                                            <label className="block text-xs font-bold text-gray-900 mb-1">{t('adImmFloorsCount')} <span className="text-red-500">*</span></label>
                                                            <input 
                                                                {...register("floorCount")} 
                                                                type="number" 
                                                                min="0" max="50"
                                                                onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                                className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-sm" 
                                                                placeholder={t('f389')}
                                                            />
                                                            {errors.floorCount && <p className="text-red-500 text-xs mt-1">{errors.floorCount.message}</p>}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <label className="block text-xs font-bold text-gray-900 mb-1">{t('adAptTypology')} <span className="text-red-500">*</span></label>
                                                            <div className="flex items-center gap-2" dir="ltr">
                                                                <span className="font-bold text-gray-700 text-lg">F</span>
                                                                <input
                                                                    {...register("buildingApartmentTypologyCustom")}
                                                                    type="number" 
                                                                    min="1" max="99"
                                                                    onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value
                                                                        setValue("buildingApartmentTypologyCustom", val, { shouldValidate: true })
                                                                        setValue("typology", val ? `F${val}` : "", { shouldValidate: true })
                                                                        setValue("typologyCustom", val)
                                                                    }}
                                                                    className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-sm" 
                                                                    placeholder={t('f390')}
                                                                />
                                                            </div>
                                                            {errors.buildingApartmentTypologyCustom && <p className="text-red-500 text-xs mt-1">{errors.buildingApartmentTypologyCustom.message as any}</p>}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <label className="block text-xs font-bold text-gray-900 mb-1">{t('adAptCount')} <span className="text-red-500">*</span></label>
                                                            <input 
                                                                {...register("buildingTotalApartments")} 
                                                                type="number" 
                                                                min="1"
                                                                onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                                className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-sm" 
                                                                placeholder={t('f391')} 
                                                            />
                                                            {errors.buildingTotalApartments && <p className="text-red-500 text-xs mt-1">{errors.buildingTotalApartments.message as any}</p>}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <label className="block text-xs font-bold text-gray-900 mb-1">{t('adSurface')} <span className="text-red-500">*</span></label>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1 border-2 border-gray-200 rounded-lg bg-white">
                                                                {BUILDING_SURFACE_MODES.map((m) => (
                                                                    <label key={m.id} className="cursor-pointer">
                                                                        <input type="radio" value={m.id} {...register("buildingSurfaceMode")} className="peer sr-only" />
                                                                        <div className="w-full px-2 py-2 rounded-md text-[11px] font-bold text-gray-700 peer-checked:bg-[#00BFA6] peer-checked:text-white transition-colors text-center whitespace-nowrap">
                                                                            {optLabel('BUILDING_SURFACE_MODES', m)}
                                                                        </div>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                            {errors.buildingSurfaceMode && <p className="text-red-500 text-xs mt-1">{errors.buildingSurfaceMode.message as any}</p>}
                                                        </div>
                                                    </div>

                                                    {buildingSurfaceMode === "UNIQUE" && (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-end">
                                                            <div className="min-w-0">
                                                                <label className="block text-sm font-bold text-gray-900 mb-2">{t('f020')} <span className="text-red-500">*</span></label>
                                                                <input 
                                                                    {...register("area")} 
                                                                    type="number" 
                                                                    min="0"
                                                                    onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                                    className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base" 
                                                                    placeholder={t('f392')} 
                                                                />
                                                                {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area.message as any}</p>}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {buildingTypologyMode === "DIFFERENTES" && (
                                                <div className="flex flex-col gap-5">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
                                                        <div className="min-w-0">
                                                            <label className="block text-sm font-bold text-gray-900 mb-2">{t('adImmFloorsCount')} <span className="text-red-500">*</span></label>
                                                            <input 
                                                                {...register("floorCount")} 
                                                                type="number" 
                                                                min="0" max="50"
                                                                onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                                className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base" 
                                                                placeholder={t('f389')}
                                                            />
                                                            {errors.floorCount && <p className="text-red-500 text-xs mt-1">{errors.floorCount.message}</p>}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <label className="block text-sm font-bold text-gray-900 mb-2">{t('adAptCount')} <span className="text-red-500">*</span></label>
                                                            <input 
                                                                {...register("buildingTotalApartments")} 
                                                                type="number" 
                                                                min="1"
                                                                onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                                className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base" 
                                                                placeholder={t('f391')} 
                                                            />
                                                            {errors.buildingTotalApartments && <p className="text-red-500 text-xs mt-1">{errors.buildingTotalApartments.message as any}</p>}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <label className="block text-sm font-bold text-gray-900 mb-2">{t('adAptStyle')} <span className="text-red-500">*</span></label>
                                                            <div className="flex flex-wrap gap-3">
                                                                {BUILDING_APARTMENT_STYLES.map((s) => (
                                                                    <label key={s.id} className="cursor-pointer">
                                                                        <input type="checkbox" value={s.id} {...register("buildingApartmentStyle")} className="peer sr-only" />
                                                                        <div className="px-4 py-2 border-2 border-gray-200 rounded-full text-sm font-bold text-gray-700 peer-checked:border-[#00BFA6] peer-checked:bg-[#00BFA6]/10 peer-checked:text-[#00BFA6] transition-all bg-white hover:border-gray-300">
                                                                            {optLabel('BUILDING_APARTMENT_STYLES', s)}
                                                                        </div>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                            {errors.buildingApartmentStyle && <p className="text-red-500 text-xs mt-1">{errors.buildingApartmentStyle.message as any}</p>}
                                                        </div>
                                                    </div>

                                                    <div className="min-w-0">
                                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('adTypologies')} <span className="text-red-500">*</span></label>
                                                        <div className="flex gap-3 flex-wrap">
                                                            {BUILDING_APARTMENT_TYPOLOGIES.map((t) => (
                                                                <label key={t.id} className="cursor-pointer">
                                                                    <input type="checkbox" value={t.id} {...register("buildingApartmentTypologies")} className="peer sr-only" />
                                                                    <div className="px-4 py-2 border-2 border-gray-200 rounded-full text-sm font-bold text-gray-700 peer-checked:border-[#00BFA6] peer-checked:bg-[#00BFA6]/10 peer-checked:text-[#00BFA6] transition-all bg-white hover:border-gray-300">
                                                                        {t.label}
                                                                    </div>
                                                                </label>
                                                            ))}
                                                        </div>
                                                        {errors.buildingApartmentTypologies && <p className="text-red-500 text-xs mt-1">{errors.buildingApartmentTypologies.message as any}</p>}
                                                    </div>

                                                    {Array.isArray(buildingApartmentTypologies) && buildingApartmentTypologies.includes("F10_PLUS") && (
                                                        <div className="min-w-0">
                                                            <label className="block text-sm font-bold text-gray-900 mb-2">{t('adTypologiesBeyondF10')} <span className="text-red-500">*</span></label>
                                                            <div className="flex gap-3 flex-wrap mb-2">
                                                                {["F11","F12","F13","F14","F15","F16","F17","F18","F19","F20+"].map((f) => {
                                                                    const currentOther = typeof buildingApartmentTypologyOther === "string" ? buildingApartmentTypologyOther : ""
                                                                    const selectedOthers = currentOther.split(/[,\s]+/).map(x => x.trim()).filter(Boolean)
                                                                    const isChecked = selectedOthers.includes(f)
                                                                    return (
                                                                        <button
                                                                            key={f}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const next = isChecked
                                                                                    ? selectedOthers.filter(x => x !== f)
                                                                                    : [...selectedOthers, f]
                                                                                setValue("buildingApartmentTypologyOther", next.join(", "), { shouldValidate: true })
                                                                            }}
                                                                            className={`px-4 py-2 border-2 rounded-full text-sm font-bold transition-all ${isChecked ? "border-[#00BFA6] bg-[#00BFA6]/10 text-[#00BFA6]" : "border-gray-200 text-gray-700 bg-white hover:border-gray-300"}`}
                                                                        >
                                                                            {f}
                                                                        </button>
                                                                    )
                                                                })}
                                                            </div>
                                                            <input type="hidden" {...register("buildingApartmentTypologyOther")} />
                                                            {errors.buildingApartmentTypologyOther && <p className="text-red-500 text-xs mt-1">{errors.buildingApartmentTypologyOther.message as any}</p>}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {isSaleBuilding ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-end">
                                                    <div className="min-w-0">
                                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f157')}</label>
                                                        <input
                                                            {...register("parkingCount")}
                                                            type="number"
                                                            min="0"
                                                            onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                            className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base"
                                                            placeholder={t('f393')}
                                                        />
                                                        {errors.parkingCount && <p className="text-red-500 text-xs mt-1">{errors.parkingCount.message}</p>}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f158')}</label>
                                                        <input
                                                            {...register("outdoorParking")}
                                                            type="number"
                                                            min="0"
                                                            onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                            className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base"
                                                            placeholder={t('f394')}
                                                        />
                                                        {errors.outdoorParking && <p className="text-red-500 text-xs mt-1">{errors.outdoorParking.message}</p>}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
                                                    <div className="min-w-0">
                                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f177')} <span className="text-red-500">*</span></label>
                                                        <select {...register("state")} className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base">
                                                            <option value="">{t('f042')}</option>
                                                            {PROPERTY_STATES.filter(s => allowDemolirOption || s.id !== "A_DEMOLIR").map(s => <option key={s.id} value={s.id}>{optLabel('PROPERTY_STATES', s)}</option>)}
                                                        </select>
                                                        {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f157')}</label>
                                                        <input
                                                            {...register("parkingCount")}
                                                            type="number"
                                                            min="0"
                                                            onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                            className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base"
                                                            placeholder={t('f393')}
                                                        />
                                                        {errors.parkingCount && <p className="text-red-500 text-xs mt-1">{errors.parkingCount.message}</p>}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f158')}</label>
                                                        <input
                                                            {...register("outdoorParking")}
                                                            type="number"
                                                            min="0"
                                                            onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                            className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base"
                                                            placeholder={t('f394')}
                                                        />
                                                        {errors.outdoorParking && <p className="text-red-500 text-xs mt-1">{errors.outdoorParking.message}</p>}
                                                    </div>
                                                </div>
                                            )}
                                            </>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            {/* Row 1 */}
                                            <div className={cn(
                                                "grid grid-cols-1 gap-5 items-end",
                                                (propertyType === "VILLA" || propertyType === "VILLA_COMMERCIALE" || isSaleParticulierApartment || isSaleParticulierNiveauVilla) ? "md:grid-cols-4" : "md:grid-cols-3"
                                            )}>
                                                {!(propertyType === "VILLA" && isSaleVillaDemolition) && (
                                                    <div className="min-w-0">
                                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f196')} <span className="text-red-500">*</span></label>
                                                        <div className="flex items-center gap-2" dir="ltr">
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
                                                                placeholder={t('f390')}
                                                            />
                                                        </div>
                                                        {errors.typology && <p className="text-red-500 text-xs mt-1">{errors.typology.message}</p>}
                                                    </div>
                                                )}

                                                <div className="min-w-0">
                                                    <label className="block text-sm font-bold text-gray-900 mb-2">{(propertyType === "VILLA" || propertyType === "VILLA_COMMERCIALE") ? t('f139') : t('adFloor')} <span className="text-red-500">*</span></label>
                                                    <div className="flex items-center gap-2">
                                                        {(propertyType === "VILLA" || propertyType === "VILLA_COMMERCIALE") && (
                                                            <span className="font-bold text-gray-700 text-lg whitespace-nowrap">{t('f174')}</span>
                                                        )}
                                                        {(propertyType === "NIVEAU_VILLA" || propertyType === "NIVEAU_VILLA_COMMERCIAL") ? (
                                                            <select
                                                                {...register("floorCount")}
                                                                className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base"
                                                            >
                                                                <option value="">{t('f042')}</option>
                                                                <option value="0">{t('f175')}</option>
                                                                <option value="1">{t('f176')}</option>
                                                            </select>
                                                        ) : (
                                                            <input 
                                                                {...register("floorCount")} 
                                                                type="number" 
                                                                min="0" max="10"
                                                                onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                                className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base" 
                                                                placeholder={t('f394')}
                                                            />
                                                        )}
                                                    </div>
                                                    {errors.floorCount && <p className="text-red-500 text-xs mt-1">{errors.floorCount.message}</p>}
                                                </div>

                                                {(propertyType === "VILLA" || propertyType === "VILLA_COMMERCIALE") ? (
                                                    <>
                                                        <div className="min-w-0">
                                                            <label className="block text-sm font-bold text-gray-900 mb-2">{t('f040')} <span className="text-red-500">*</span></label>
                                                            <input 
                                                                {...register("landArea")} 
                                                                type="number" 
                                                                min="0"
                                                                onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                                className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base" 
                                                                placeholder={t('f388')} 
                                                            />
                                                            {errors.landArea && <p className="text-red-500 text-xs mt-1">{errors.landArea.message}</p>}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <label className="block text-sm font-bold text-gray-900 mb-2">{t('f138')} <span className="text-red-500">*</span></label>
                                                            <input 
                                                                {...register("builtArea")} 
                                                                type="number" 
                                                                min="0"
                                                                onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                                className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base" 
                                                                placeholder={t('f353')} 
                                                            />
                                                            {errors.builtArea && <p className="text-red-500 text-xs mt-1">{errors.builtArea.message}</p>}
                                                        </div>
                                                        {isSaleVillaDemolition && (
                                                            <div className="min-w-0">
                                                                <label className="block text-sm font-bold text-gray-900 mb-2">{t('f087')}</label>
                                                                <input
                                                                    {...register("facadesCount")}
                                                                    type="number"
                                                                    min="0"
                                                                    onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                                    className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base"
                                                                    placeholder={t('f394')}
                                                                />
                                                                {errors.facadesCount && <p className="text-red-500 text-xs mt-1">{errors.facadesCount.message as any}</p>}
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="min-w-0">
                                                            <label className="block text-sm font-bold text-gray-900 mb-2">{t('f020')} <span className="text-red-500">*</span></label>
                                                            <input 
                                                                {...register("area")} 
                                                                type="number" 
                                                                min="0"
                                                                onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                                className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base" 
                                                                placeholder={t('f392')} 
                                                            />
                                                            {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area.message as any}</p>}
                                                        </div>
                                                        {(isSaleParticulierApartment || isSaleParticulierNiveauVilla) && (
                                                            <div className="min-w-0">
                                                                <label className="block text-sm font-bold text-gray-900 mb-2">{t('f087')}</label>
                                                                <input
                                                                    {...register("facadesCount")}
                                                                    type="number"
                                                                    min="0"
                                                                    onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                                    className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base"
                                                                    placeholder={t('f394')}
                                                                />
                                                                {errors.facadesCount && <p className="text-red-500 text-xs mt-1">{errors.facadesCount.message as any}</p>}
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>

                                            {/* Row 2: État Général, Garage, Stationnement */}
                                            <div className={cn(
                                                "grid grid-cols-1 gap-5 items-end",
                                                (propertyType === "VILLA" || propertyType === "VILLA_COMMERCIALE") ? (isSaleVillaDemolition ? "md:grid-cols-1" : "md:grid-cols-4") : "md:grid-cols-3"
                                            )}>
                                                <div className="min-w-0">
                                                    <label className="block text-sm font-bold text-gray-900 mb-2">{t('f177')}</label>
                                                    <select {...register("state")} className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base">
                                                        <option value="">{t('f042')}</option>
                                                        {PROPERTY_STATES.filter(s => allowDemolirOption || s.id !== "A_DEMOLIR").map(s => <option key={s.id} value={s.id}>{optLabel('PROPERTY_STATES', s)}</option>)}
                                                    </select>
                                                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                                                </div>
                                                {(propertyType === "VILLA" || propertyType === "VILLA_COMMERCIALE") && !isSaleVillaDemolition && (
                                                    <div className="min-w-0">
                                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f087')}</label>
                                                        <input
                                                            {...register("facadesCount")}
                                                            type="number"
                                                            min="0"
                                                            onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                            className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base"
                                                            placeholder={t('f394')}
                                                        />
                                                        {errors.facadesCount && <p className="text-red-500 text-xs mt-1">{errors.facadesCount.message as any}</p>}
                                                    </div>
                                                )}
                                                {(!["VILLA", "VILLA_COMMERCIALE"].includes(propertyType) || !isSaleVillaDemolition) && (
                                                    <div className="min-w-0">
                                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f157')}</label>
                                                        <input
                                                            {...register("parkingCount")}
                                                            type="number"
                                                            min="0"
                                                            onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                            className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base"
                                                            placeholder={t('f393')}
                                                        />
                                                        {errors.parkingCount && <p className="text-red-500 text-xs mt-1">{errors.parkingCount.message}</p>}
                                                    </div>
                                                )}
                                                {(!["VILLA", "VILLA_COMMERCIALE"].includes(propertyType) || !isSaleVillaDemolition) && (
                                                    <div className="min-w-0">
                                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f158')}</label>
                                                        <input 
                                                            {...register("outdoorParking")} 
                                                            type="number" 
                                                            min="0"
                                                            onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                            className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base" 
                                                            placeholder={t('f394')} 
                                                        />
                                                        {errors.outdoorParking && <p className="text-red-500 text-xs mt-1">{errors.outdoorParking.message}</p>}
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </section>

                            {/* Cadre et mode de vie — un seul bloc, plus de doublon avec l'ancienne section "Promotion immobilière" */}
                            {!isVillaDemolition && !isBuildingDemolition && (
                                <section className="space-y-6">
                                    <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                        <MapPin className="text-[#00BFA6]" />{t('f178')}</h2>

                                    {/* Environnement — choix multiple, commun à tous les types de biens d'habitation */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-3">{t('f179')}</label>
                                        <div className="flex flex-wrap gap-4">
                                            {APARTMENT_LIFESTYLE_TYPES.map((u) => (
                                                <label key={u.id} className="cursor-pointer">
                                                    <input type="checkbox" value={u.id} {...register("buildingUsageTypes")} className="peer sr-only" />
                                                    <div className="px-6 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-900 peer-checked:border-[#00BFA6] peer-checked:bg-[#00BFA6]/10 peer-checked:text-[#00BFA6] transition-all bg-white shadow-sm hover:border-gray-400 flex items-center gap-2">
                                                        {optLabel('APARTMENT_LIFESTYLE_TYPES', u)}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Usage — choix unique, villa uniquement */}
                                    {(propertyType === "VILLA" || propertyType === "VILLA_COMMERCIALE") && (
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-3">{t('f180')}</label>
                                            <div className="flex flex-wrap gap-4">
                                                {USAGE_TYPES.map((u) => (
                                                    <label key={u.id} className="cursor-pointer group relative">
                                                        <input type="radio" value={u.id} {...register("usageType")} className="peer sr-only" />
                                                        <div className="px-6 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-900 peer-checked:border-[#00BFA6] peer-checked:bg-[#00BFA6]/10 peer-checked:text-[#00BFA6] transition-all bg-white shadow-sm hover:border-gray-400 flex items-center gap-2">
                                                            {optLabel('USAGE_TYPES', u)}
                                                            <div className="relative group/info ms-1">
                                                                <Info className="h-4 w-4 text-gray-400 hover:text-[#00BFA6]" />
                                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none z-50 text-center font-normal">
                                                                    {optDesc('USAGE_TYPES', u)}
                                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900"></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                            {errors.usageType && <p className="text-red-500 text-sm mt-1">{errors.usageType.message as any}</p>}
                                        </div>
                                    )}

                                    {/* Type d'accès — choix unique, niveau de villa uniquement */}
                                    {(propertyType === "NIVEAU_VILLA" || propertyType === "NIVEAU_VILLA_COMMERCIAL") && (
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-3">{t('f181')}</label>
                                            <div className="flex flex-wrap gap-4">
                                                {ENTRY_ACCESS_TYPES.map((u) => (
                                                    <label key={u.id} className="cursor-pointer group relative">
                                                        <input type="radio" value={u.id} {...register("usageType")} className="peer sr-only" />
                                                        <div className="px-6 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-900 peer-checked:border-[#00BFA6] peer-checked:bg-[#00BFA6]/10 peer-checked:text-[#00BFA6] transition-all bg-white shadow-sm hover:border-gray-400 flex items-center gap-2">
                                                            {optLabel('ENTRY_ACCESS_TYPES', u)}
                                                            <div className="relative group/info ms-1">
                                                                <Info className="h-4 w-4 text-gray-400 hover:text-[#00BFA6]" />
                                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none z-50 text-center font-normal">
                                                                    {optDesc('ENTRY_ACCESS_TYPES', u)}
                                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900"></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                            {errors.usageType && <p className="text-red-500 text-sm mt-1">{errors.usageType.message as any}</p>}
                                        </div>
                                    )}
                                </section>
                            )}

                            {/* 3. Espaces de Vie */}
                            {!isVillaDemolition && !isBuildingDemolition && (
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <BedDouble className="text-[#00BFA6]" /> {isCommercialPropertyType ? t('adSpaceExploited') : t('adLivingSpaces')}
                                </h2>
                                
                                <div className="flex flex-col gap-5">
                                    {/* Ligne 1: Chambres, Suites, Salons, Toilettes */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-900 mb-1">{isCommercialPropertyType ? t('adOfficesRooms') : t('adBedrooms')} <span className="text-red-500">*</span></label>
                                            <input 
                                                {...register("bedrooms")} 
                                                type="number" 
                                                min="0"
                                                onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                className="w-full p-2.5 border-2 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-sm" 
                                            />
                                            {errors.bedrooms && <p className="text-red-500 text-sm mt-1">{errors.bedrooms.message}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-900 mb-1">{isCommercialPropertyType ? t('adOfficeSuites') : t('adMasterSuites')}</label>
                                            <input 
                                                {...register("nbSuites")} 
                                                type="number" 
                                                min="0"
                                                onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                className="w-full p-2.5 border-2 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-sm" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-900 mb-1">{isCommercialPropertyType ? t('adBigRoomSalons') : t('adSalons')} <span className="text-red-500">*</span></label>
                                            <input 
                                                {...register("livingRooms")} 
                                                type="number" 
                                                min="0"
                                                onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                className="w-full p-2.5 border-2 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-sm" 
                                            />
                                            {errors.livingRooms && <p className="text-red-500 text-sm mt-1">{errors.livingRooms.message}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-900 mb-1">{t('adWC')} <span className="text-red-500">*</span></label>
                                            <input 
                                                {...register("wc")} 
                                                type="number" 
                                                min="0"
                                                onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                className="w-full p-2.5 border-2 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-sm" 
                                            />
                                            {errors.wc && <p className="text-red-500 text-sm mt-1">{errors.wc.message}</p>}
                                        </div>
                                    </div>

                                    {/* Ligne 2: SDB, Type SDB */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-900 mb-1">{t('adBathrooms')} <span className="text-red-500">*</span></label>
                                            <input 
                                                {...register("bathrooms")} 
                                                type="number" 
                                                min="0"
                                                onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                className="w-full p-2.5 border-2 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-sm" 
                                            />
                                            {errors.bathrooms && <p className="text-red-500 text-sm mt-1">{errors.bathrooms.message}</p>}
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-gray-900 mb-1">{t('f182')}</label>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 border-2 border-gray-200 rounded-xl hover:border-[#00BFA6] transition-colors justify-center">
                                                    <input type="radio" value="italian_shower" {...register("bathroomType")} className="accent-[#00BFA6] w-4 h-4" /> 
                                                    <span className="text-xs font-bold text-gray-900">{t('f183')}</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 border-2 border-gray-200 rounded-xl hover:border-[#00BFA6] transition-colors justify-center">
                                                    <input type="radio" value="bathtub" {...register("bathroomType")} className="accent-[#00BFA6] w-4 h-4" /> 
                                                    <span className="text-xs font-bold text-gray-900">{t('f184')}</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 border-2 border-gray-200 rounded-xl hover:border-[#00BFA6] transition-colors justify-center">
                                                    <input type="radio" value="both" {...register("bathroomType")} className="accent-[#00BFA6] w-4 h-4" /> 
                                                    <span className="text-xs font-bold text-gray-900">{t('f185')}</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                            )}

                            {/* 4. Cuisine et équipements */}
                            {!isVillaDemolition && !isBuildingDemolition && (
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Utensils className="text-[#00BFA6]" />{t('f186')}</h2>
                                
                                <div className="space-y-6">
                                    {/* Type de Cuisine */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-3">{t('f187')}</label>
                                        <div className="flex flex-wrap gap-4">
                                            {KITCHEN_TYPES.map(k => (
                                                <label key={k.id} className="flex items-center gap-2 cursor-pointer bg-white p-3 border-2 border-gray-200 rounded-xl hover:border-[#00BFA6] transition-colors flex-1 justify-center relative group min-w-[140px]">
                                                    <input type="radio" value={k.id} {...register("kitchenType")} className="accent-[#00BFA6] w-4 h-4" /> 
                                                    <span className="text-sm font-bold text-gray-900">{optLabel('KITCHEN_TYPES', k)}</span>
                                                    <div className="relative group/info ms-1">
                                                        <Info className="h-4 w-4 text-gray-400 hover:text-[#00BFA6]" />
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none z-50 font-normal text-start">
                                                            {optDesc('KITCHEN_TYPES', k)}
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
                                        <label className="block text-sm font-bold text-gray-900 mb-3">{t('f188')}</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-4 md:grid-cols-8 gap-3">
                                            {VILLA_EQUIPMENTS.kitchen.map((item) => {
                                                const Icon = IconMap[item.icon] || Utensils
                                                const kitchenRegister = register("kitchenEquipment")
                                                return (
                                                    <label key={item.id} className="cursor-pointer group">
                                                        <input 
                                                            type="checkbox" 
                                                            value={item.id} 
                                                            {...kitchenRegister} 
                                                            onChange={(e) => {
                                                                kitchenRegister.onChange(e)
                                                                const checked = e.target.checked
                                                                const id = String(e.target.value)
                                                                const current = getValues("kitchenEquipment")
                                                                const next =
                                                                    id === "no_appliances"
                                                                        ? checked
                                                                            ? ["no_appliances"]
                                                                            : (Array.isArray(current) ? current.filter((x) => x !== "no_appliances") : [])
                                                                        : upsertArrayValue((Array.isArray(current) ? current.filter((x) => x !== "no_appliances") : []), id, checked)
                                                                setValue("kitchenEquipment", next as any, { shouldValidate: true })
                                                            }}
                                                            className="peer sr-only"
                                                        />
                                                        <div className="p-2 border-2 border-gray-200 rounded-xl flex flex-col items-center gap-1 text-center peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 peer-checked:text-[#00BFA6] transition-all hover:border-gray-300 bg-white h-20 justify-start">
                                                            <div className="h-7 flex items-center justify-center">
                                                                <Icon className="h-5 w-5 text-gray-400 group-hover:text-gray-600 peer-checked:text-[#00BFA6] transition-colors" />
                                                            </div>
                                                            <div className="min-h-[36px] flex items-start justify-center px-1">
                                                                <span className="text-xs font-bold text-center leading-tight text-gray-700 peer-checked:text-[#00BFA6]">{optLabel('VILLA_EQUIPMENTS_KITCHEN', item)}</span>
                                                            </div>
                                                        </div>
                                                    </label>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </section>
                            )}

                            {/* 5. Extérieurs & Commodités */}
                            {!isVillaDemolition && !isBuildingDemolition && (
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Trees className="text-[#00BFA6]" />{t('f163')}</h2>
                                
                                {/* Extérieur Checkboxes */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-3">{t('f164')}</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-3">
                                        {VILLA_EQUIPMENTS.exterior.filter((item) => {
                                            if (propertyType === 'VILLA' || propertyType === 'VILLA_COMMERCIALE' || propertyType === 'NIVEAU_VILLA' || propertyType === 'NIVEAU_VILLA_COMMERCIAL') {
                                                return ['garden', 'terrace', 'balcony', 'pool', 'playground', 'barbecue'].includes(item.id)
                                            }
                                            if (['APPARTEMENT', 'DUPLEX', 'TRIPLEX', 'STUDIO', 'APPARTEMENT_COMMERCIAL'].includes(propertyType)) {
                                                return ['garden', 'terrace', 'balcony', 'pool', 'playground', 'elevator'].includes(item.id)
                                            }
                                            if (propertyType === 'IMMEUBLE_RESIDENTIEL') {
                                                return ['garden', 'terrace', 'balcony', 'pool', 'playground', 'elevator'].includes(item.id)
                                            }
                                            if (propertyType === 'IMMEUBLE_BUREAU') {
                                                return ['garden', 'terrace', 'balcony', 'pool', 'playground', 'elevator'].includes(item.id)
                                            }
                                            return item.id !== 'elevator'
                                        }).map((item) => {
                                            const Icon = IconMap[item.icon] || Trees
                                            return (
                                                <label key={item.id} className="cursor-pointer group">
                                                    <input type="checkbox" value={item.id} {...register("exteriorFeatures")} className="peer sr-only" />
                                                    <div className="flex flex-col items-center justify-center gap-2 p-3 border-2 border-gray-200 rounded-xl hover:border-[#00BFA6] peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 peer-checked:text-[#00BFA6] transition-all bg-white h-24">
                                                        <Icon className="h-6 w-6 text-gray-400 group-hover:text-gray-600 peer-checked:text-[#00BFA6]" />
                                                        <span className="text-xs font-bold text-center leading-tight text-gray-700 peer-checked:text-[#00BFA6]">{optLabel('VILLA_EQUIPMENTS_EXTERIOR', item)}</span>
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
                                            <label className="block text-sm font-bold text-gray-900 mb-3">{t('f189')}</label>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                {HEATING_TYPES.map(h => {
                                                    const Icon = IconMap[h.icon] || Flame
                                                    return (
                                                        <label key={h.id} className="cursor-pointer group">
                                                            <input type="radio" value={h.id} {...register("heatingType")} className="peer sr-only" />
                                                            <div className="flex flex-col items-center justify-center gap-2 p-3 border-2 border-gray-200 rounded-xl hover:border-[#00BFA6] peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 peer-checked:text-[#00BFA6] transition-all bg-white h-24">
                                                                <Icon className="h-6 w-6 text-gray-400 group-hover:text-gray-600 peer-checked:text-[#00BFA6]" />
                                                                <span className="text-xs font-bold text-center leading-tight text-gray-700 peer-checked:text-[#00BFA6]">{optLabel('HEATING_TYPES', h)}</span>
                                                            </div>
                                                        </label>
                                                    )
                                                })}
                                            </div>
                                            {errors.heatingType && <p className="text-red-500 text-sm mt-1">{errors.heatingType.message}</p>}
                                        </div>

                                        {/* Climatisation */}
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-3">{t('f190')}</label>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                {AC_TYPES.map(a => {
                                                    const Icon = IconMap[a.icon] || Fan
                                                    return (
                                                        <label key={a.id} className="cursor-pointer group">
                                                            <input type="radio" value={a.id} {...register("acType")} className="peer sr-only" />
                                                            <div className="flex flex-col items-center justify-center gap-2 p-3 border-2 border-gray-200 rounded-xl hover:border-[#00BFA6] peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 peer-checked:text-[#00BFA6] transition-all bg-white h-24">
                                                                <Icon className="h-6 w-6 text-gray-400 group-hover:text-gray-600 peer-checked:text-[#00BFA6]" />
                                                                <span className="text-xs font-bold text-center leading-tight text-gray-700 peer-checked:text-[#00BFA6]">{optLabel('AC_TYPES', a)}</span>
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
                                            <label className="block text-sm font-bold text-gray-900 mb-3">{t('f023')}</label>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                                                                    <span className="text-xs font-bold text-center leading-tight text-gray-700 peer-checked:text-[#00BFA6]">{optLabel('VILLA_EQUIPMENTS_SECURITY', s)}</span>
                                                                </div>
                                                            </div>
                                                        </label>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        {/* Connectivité */}
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-3">{t('f165')}</label>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                                                                    <span className="text-xs font-bold text-center leading-tight text-gray-700 peer-checked:text-[#00BFA6]">{optLabel('VILLA_EQUIPMENTS_CONNECTIVITY', c)}</span>
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
                            )}

                            {/* 6. Énergie, Eau & Technique */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Zap className="text-[#00BFA6]" />{t('f191')}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Eau */}
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <h4 className="font-bold mb-3 flex items-center gap-2 text-gray-900"><Droplet className="w-4 h-4 text-blue-500"/>{t('f032')}</h4>
                                        <div className="flex flex-col gap-2">
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900"><input type="radio" value="INDIVIDUEL" {...register("waterCounter")} className="accent-[#00BFA6] w-4 h-4"/>{t('f192')}</label>
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900"><input type="radio" value="COMMUN" {...register("waterCounter")} className="accent-[#00BFA6] w-4 h-4"/>{t('f193')}</label>
                                        </div>
                                        {errors.waterCounter && <p className="text-red-500 text-sm mt-1">{errors.waterCounter.message}</p>}
                                    </div>
                                    {/* Électricité */}
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <h4 className="font-bold mb-3 flex items-center gap-2 text-gray-900"><Zap className="w-4 h-4 text-yellow-500"/>{t('f025')}</h4>
                                        <div className="flex flex-col gap-2">
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900"><input type="radio" value="INDIVIDUEL" {...register("elecCounter")} className="accent-[#00BFA6] w-4 h-4"/>{t('f192')}</label>
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900"><input type="radio" value="COMMUN" {...register("elecCounter")} className="accent-[#00BFA6] w-4 h-4"/>{t('f193')}</label>
                                        </div>
                                        {errors.elecCounter && <p className="text-red-500 text-sm mt-1">{errors.elecCounter.message}</p>}
                                    </div>
                                    {/* Gaz */}
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <h4 className="font-bold mb-3 flex items-center gap-2 text-gray-900"><Flame className="w-4 h-4 text-orange-500"/>{t('f028')}</h4>
                                        <div className="flex flex-col gap-2">
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900"><input type="radio" value="INDIVIDUEL" {...register("gasCounter")} className="accent-[#00BFA6] w-4 h-4"/>{t('f192')}</label>
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900"><input type="radio" value="COMMUN" {...register("gasCounter")} className="accent-[#00BFA6] w-4 h-4"/>{t('f193')}</label>
                                        </div>
                                        {errors.gasCounter && <p className="text-red-500 text-sm mt-1">{errors.gasCounter.message}</p>}
                                    </div>
                                </div>
                            </section>


                        </div>
                    )}

                    {/* Step 4: Fiche descriptive - Autres (Ancien formulaire) */}
                    {currentStep === 4 && !(
                        (propertyType === "VILLA" && (transactionType === "RENTAL" || transactionType === "SALE")) ||
                        (propertyType === "NIVEAU_VILLA" && (transactionType === "RENTAL" || transactionType === "SALE")) ||
                        ((propertyType === "APPARTEMENT" || propertyType === "DUPLEX" || propertyType === "TRIPLEX" || propertyType === "STUDIO" || propertyType === "IMMEUBLE_RESIDENTIEL") && transactionType === "RENTAL") ||
                        ((propertyType === "APPARTEMENT" || propertyType === "DUPLEX" || propertyType === "TRIPLEX" || propertyType === "STUDIO" || propertyType === "IMMEUBLE_RESIDENTIEL") && transactionType === "SALE") ||
                        (propertyType === "VILLA_COMMERCIALE" && (transactionType === "RENTAL" || transactionType === "SALE")) ||
                        (propertyType === "NIVEAU_VILLA_COMMERCIAL" && (transactionType === "RENTAL" || transactionType === "SALE")) ||
                        ((propertyType === "APPARTEMENT_COMMERCIAL" || propertyType === "IMMEUBLE_BUREAU") && (transactionType === "RENTAL" || transactionType === "SALE")) ||
                        isImmeubleCommercialParticulier ||
                        isUsineRentalParticulier ||
                        isChambreFroideRentalParticulier ||
                        isHangarRentalParticulier ||
                        isTerrainRentalParticulier ||
                        isBureauCommerceSpecialParticulier ||
                        isHebergementHabitant ||
                        isHebergementSejourFiche
                    ) && (
                        <div className="w-full max-w-3xl animate-fade-in">
                            <div className="space-y-8">
                                {/* Nombre d'étages - Limité à R+5 */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">{t('f194')}</label>
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
                                    <label className="block text-sm font-bold text-gray-700 mb-3">{t('f195')}</label>
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
                                            <div className="px-6 py-3 border-2 rounded-xl font-medium text-gray-600 peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 peer-checked:text-[#00BFA6] transition-all hover:border-gray-400 bg-gray-50">{t('f031')}</div>
                                        </label>
                                    </div>
                                </div>

                                {/* Typologie - Sans chiffres prédéfinis */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">{t('f196')}</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">{isCommercialPropertyType ? t('adOfficeCount') : t('adBedroomCount')}</label>
                                        <input 
                                            {...register("bedrooms")} 
                                            type="number" 
                                            min="0"
                                            onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all text-gray-900 bg-gray-50 focus:bg-white" 
                                            placeholder={t('f395')}
                                        />
                                        {errors.bedrooms && <p className="text-red-500 text-sm mt-1">{errors.bedrooms.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">{isCommercialPropertyType ? t('adMeetingRoomCount') : t('adSalonCount')}</label>
                                        <input 
                                            {...register("livingRooms")} 
                                            type="number" 
                                            min="0"
                                            onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all text-gray-900 bg-gray-50 focus:bg-white" 
                                            placeholder={t('f394')}
                                        />
                                        {errors.livingRooms && <p className="text-red-500 text-sm mt-1">{errors.livingRooms.message}</p>}
                                    </div>
                                </div>

                                {/* Salles de bain et WC */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">{t('f197')}</label>
                                        <input 
                                            {...register("bathrooms")} 
                                            type="number" 
                                            min="0"
                                            onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all text-gray-900 bg-gray-50 focus:bg-white" 
                                            placeholder={t('f394')}
                                        />
                                        {errors.bathrooms && <p className="text-red-500 text-sm mt-1">{errors.bathrooms.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">{t('f198')}</label>
                                        <input 
                                            {...register("wc")} 
                                            type="number" 
                                            min="0"
                                            onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all text-gray-900 bg-gray-50 focus:bg-white" 
                                            placeholder={t('f395')}
                                        />
                                        {errors.wc && <p className="text-red-500 text-sm mt-1">{errors.wc.message}</p>}
                                    </div>
                                </div>

                                {/* Type de salle de bain */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">{t('f199')}</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
                                                <span className="text-sm font-medium text-gray-600 peer-checked:text-[#00BFA6]">{t('f185')}</span>
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
                                                <span className="text-sm font-medium text-gray-600 peer-checked:text-[#00BFA6]">{t('f200')}</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Mesures & Capacité */}
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">{t('f201')}</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">{t('f202')}</label>
                                            <input 
                                                {...register("landArea")} 
                                                type="number" 
                                                min="0"
                                                onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all text-gray-900 bg-gray-50 focus:bg-white" 
                                                placeholder={t('f396')}
                                            />
                                            {errors.landArea && <p className="text-red-500 text-sm mt-1">{errors.landArea.message}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">{t('f203')}</label>
                                            <input 
                                                {...register("builtArea")} 
                                                type="number" 
                                                min="0"
                                                onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all text-gray-900 bg-gray-50 focus:bg-white" 
                                                placeholder={t('f353')}
                                            />
                                            {errors.builtArea && <p className="text-red-500 text-sm mt-1">{errors.builtArea.message}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Équipements & Commodités avec icônes */}
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">{t('f204')}</h3>
                                    
                                    {/* Cuisine */}
                                    {!isVillaDemolition && !isBuildingDemolition && (
                                    <div className="mb-6">
                                        <label className="block text-sm font-bold text-gray-700 mb-3">{t('f166')}</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                                            {VILLA_EQUIPMENTS.kitchen.map((item) => {
                                                const Icon = IconMap[item.icon] || Utensils
                                                const kitchenRegister = register("kitchenEquipment")
                                                return (
                                                    <label key={item.id} className="cursor-pointer">
                                                        <input 
                                                            type="checkbox" 
                                                            value={item.id} 
                                                            {...kitchenRegister} 
                                                            onChange={(e) => {
                                                                kitchenRegister.onChange(e)
                                                                const checked = e.target.checked
                                                                const id = String(e.target.value)
                                                                const current = getValues("kitchenEquipment")
                                                                const next =
                                                                    id === "no_appliances"
                                                                        ? checked
                                                                            ? ["no_appliances"]
                                                                            : (Array.isArray(current) ? current.filter((x) => x !== "no_appliances") : [])
                                                                        : upsertArrayValue((Array.isArray(current) ? current.filter((x) => x !== "no_appliances") : []), id, checked)
                                                                setValue("kitchenEquipment", next as any, { shouldValidate: true })
                                                            }}
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
                                    )}

                                    {/* Extérieur */}
                                    {!isVillaDemolition && !isBuildingDemolition && (
                                    <div className="mb-6">
                                        <label className="block text-sm font-bold text-gray-700 mb-3">{t('f205')}</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                            {VILLA_EQUIPMENTS.exterior.filter((item) => {
                                                if (propertyType === 'VILLA' || propertyType === 'VILLA_COMMERCIALE' || propertyType === 'NIVEAU_VILLA' || propertyType === 'NIVEAU_VILLA_COMMERCIAL') {
                                                    return ['garden', 'terrace', 'balcony', 'pool', 'playground', 'barbecue'].includes(item.id)
                                                }
                                                if (['APPARTEMENT', 'DUPLEX', 'TRIPLEX', 'STUDIO', 'APPARTEMENT_COMMERCIAL'].includes(propertyType)) {
                                                    return ['garden', 'terrace', 'balcony', 'pool', 'playground', 'elevator'].includes(item.id)
                                                }
                                                if (propertyType === 'IMMEUBLE_RESIDENTIEL') {
                                                    return ['garden', 'terrace', 'balcony', 'pool', 'playground', 'elevator'].includes(item.id)
                                                }
                                                if (propertyType === 'IMMEUBLE_BUREAU') {
                                                    return ['garden', 'terrace', 'balcony', 'pool', 'playground', 'elevator'].includes(item.id)
                                                }
                                                return item.id !== 'elevator'
                                            }).map((item) => {
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
                                    )}

                                    {/* Eau/Énergie */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-bold text-gray-700 mb-3">{t('f206')}</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
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
                                        <label className="block text-sm font-bold text-gray-700 mb-3">{t('f207')}</label>
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
                                                <span className="text-gray-700 font-medium">{t('f208')}</span>
                                            </label>
                                            
                                            {garageHasCapacity && (
                                                <div className="ms-8">
                                                    <label className="block text-sm font-medium text-gray-600 mb-2">{t('f209')}</label>
                                                    <input 
                                                        {...register("garageCapacity")} 
                                                        type="number" 
                                                        min="0"
                                                        onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                        placeholder={t('f397')}
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

                    {/* Step 4: Fiche descriptive – Hébergement chez l'habitant */}
                    {currentStep === 4 && isHebergementHabitant && (
                        <div className="w-full max-w-4xl animate-fade-in space-y-10">

                            {/* Étape 1.1 – Cible clientèle */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Users className="h-5 w-5 text-[#00BFA6]" />{t('f210')}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {tGroup('HAB_CLIENT_PROFILES', HAB_CLIENT_PROFILES).map((p) => (
                                        <label key={p.id} className="cursor-pointer">
                                            <input type="radio" value={p.id} {...register("habClientProfile")} className="peer sr-only" />
                                            <div className="p-4 border-2 border-gray-200 rounded-xl bg-white peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 transition-all hover:border-gray-400">
                                                <div className="font-bold text-gray-900 text-sm">{p.label}</div>
                                                <div className="text-xs text-gray-500 mt-1">{p.desc}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                {errors.habClientProfile && <p className="text-red-500 text-sm">{errors.habClientProfile.message as any}</p>}
                            </section>

                            {/* Étape 1.2 – Formule de location */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <BedDouble className="h-5 w-5 text-[#00BFA6]" />{t('f211')}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {tGroup('HAB_FORMULES', HAB_FORMULES).map((f) => (
                                        <label key={f.id} className="cursor-pointer">
                                            <input type="radio" value={f.id} {...register("habFormule")} className="peer sr-only" />
                                            <div className="p-4 border-2 border-gray-200 rounded-xl bg-white peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 transition-all hover:border-gray-400 text-center">
                                                <div className="font-bold text-gray-900 text-sm">{f.label}</div>
                                                <div className="text-xs text-gray-500 mt-1">{f.desc}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                {errors.habFormule && <p className="text-red-500 text-sm">{errors.habFormule.message as any}</p>}

                                {/* Détails logement entier */}
                                {habFormule === "LOGEMENT_ENTIER" && (
                                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
                                        <div className="font-bold text-gray-800 text-sm">{t('f212')}</div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1">{t('f213')}</label>
                                                <input {...register("habNbChambres")} type="number" min="0" onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()} className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-sm" placeholder={t('f377')} />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1">{t('f214')}</label>
                                                <input {...register("habNbSalons")} type="number" min="0" onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()} className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-sm" placeholder={t('f385')} />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1">{t('f215')}</label>
                                                <input {...register("habNbSdb")} type="number" min="0" onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()} className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-sm" placeholder={t('f380')} />
                                            </div>
                                            <div className="flex flex-col justify-end">
                                                <label className="flex items-center gap-2 cursor-pointer p-3 border-2 border-gray-200 rounded-xl bg-white hover:border-[#00BFA6] transition-all h-[46px]">
                                                    <input type="checkbox" {...register("habSuiteParentale")} className="accent-[#00BFA6] w-4 h-4" />
                                                    <span className="text-xs font-bold text-gray-700">{t('f216')}</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Détails Chambre privée / Lit seul */}
                                {(habFormule === "CHAMBRE_PRIVEE" || habFormule === "LIT_SEUL") && (
                                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-3">
                                        <div className="font-bold text-gray-800 text-sm">{t('f217')}</div>
                                        <div className="flex flex-wrap gap-3">
                                            {[
                                                { id: "STANDARD", label: "Standard" },
                                                { id: "SUITE", label: "Suite" },
                                                { id: "PREMIUM", label: "Premium / Présidentielle" },
                                                { id: "DORTOIR", label: "Dortoir" },
                                            ].map((opt) => (
                                                <label key={opt.id} className="cursor-pointer">
                                                    <input type="radio" value={opt.id} {...register("habTypeChambre")} className="peer sr-only" />
                                                    <div className="px-4 py-2 border-2 border-gray-200 rounded-full text-sm font-bold text-gray-700 peer-checked:border-[#00BFA6] peer-checked:bg-[#00BFA6]/10 peer-checked:text-[#00BFA6] transition-all bg-white hover:border-gray-300">{opt.label}</div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </section>

                            {/* Étape 1.3 – Type de propriété */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Home className="h-5 w-5 text-[#00BFA6]" />{t('f218')}</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {tGroup('HAB_UNIT_TYPES', HAB_UNIT_TYPES).map((u) => (
                                        <label key={u.id} className="cursor-pointer">
                                            <input type="radio" value={u.id} {...register("habUnitType")} className="peer sr-only" />
                                            <div className="p-3 border-2 border-gray-200 rounded-xl bg-white peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 transition-all hover:border-gray-400 text-center">
                                                <div className="font-bold text-gray-900 text-sm">{u.label}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                {habUnitType === "INSOLITE" && (
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f219')}</label>
                                        <input {...register("habUnitTypeInsolite")} type="text" className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base" placeholder={t('f398')} />
                                    </div>
                                )}
                                {errors.habUnitType && <p className="text-red-500 text-sm">{errors.habUnitType.message as any}</p>}
                            </section>

                            {/* Étape 1.4 – Caractéristiques physiques */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Ruler className="h-5 w-5 text-[#00BFA6]" />{t('f220')}</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f221')}</label>
                                        <input {...register("habArea")} type="number" min="0" onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()} className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base" placeholder={t('f362')} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">Étage (0 = RDC)</label>
                                        <input {...register("habFloor")} type="number" min="0" onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()} className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base" placeholder="0" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f222')}</label>
                                        <input {...register("habNbNiveaux")} type="number" min="1" onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()} className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base" placeholder={t('f385')} />
                                    </div>
                                </div>

                                {/* Configuration des lits */}
                                <div>
                                    <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <Bed className="h-4 w-4 text-[#00BFA6]" />{t('f223')}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {[
                                            { field: "habBedKingPremium", label: "Lit King Size Premium (200×200 cm)" },
                                            { field: "habBedKing", label: "Lit King Size (180×200 cm)" },
                                            { field: "habBedQueen", label: "Lit Queen Size (160×200 cm)" },
                                            { field: "habBedDoubleStd", label: "Lit Double Standard (140×190 cm)" },
                                            { field: "habBedSimpleAdulte", label: "Lit Simple / Canapé-lit (90×190 cm)" },
                                            { field: "habBedSimpleEnfant", label: "Lit Simple Enfant (80×190 cm)" },
                                            { field: "habBedSuperpose", label: "Lit Superposé 2 places" },
                                            { field: "habBedMatelasSol", label: "Matelas au sol / Literie traditionnelle" },
                                            { field: "habBedBebe", label: "Lit Bébé / Berceau" },
                                        ].map((bed) => (
                                            <div key={bed.field} className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3">
                                                <span className="text-sm font-medium text-gray-700 flex-1">{bed.label}</span>
                                                <input
                                                    {...register(bed.field as any)}
                                                    type="number"
                                                    min="0"
                                                    max="20"
                                                    onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()}
                                                    className="w-20 p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-bold text-gray-900 text-center text-sm"
                                                    placeholder="0"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            {/* Étape 2.1 – Ambiance / Vocation */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-[#00BFA6]" />{t('f224')}</h2>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">{t('f225')}</label>
                                    <div className="flex flex-wrap gap-3">
                                        {tGroup('HAB_AMBIANCES', HAB_AMBIANCES).map((a) => (
                                            <label key={a.id} className="cursor-pointer">
                                                <input type="checkbox" value={a.id} {...register("habAmbiances")} className="peer sr-only" />
                                                <div className="px-4 py-2 border-2 border-gray-200 rounded-full text-sm font-bold text-gray-700 peer-checked:border-[#00BFA6] peer-checked:bg-[#00BFA6]/10 peer-checked:text-[#00BFA6] transition-all bg-white hover:border-gray-300">{a.label}</div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Balnéaire */}
                                {habAmbiancesList.includes("BALNEAIRE") && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-3">
                                        <div className="font-bold text-blue-900 text-sm flex items-center gap-2"><Waves className="h-4 w-4" />{t('f226')}</div>
                                        <div className="flex flex-wrap gap-3">
                                            {tGroup('HAB_PLAGE_ACCES', HAB_PLAGE_ACCES).map((p) => (
                                                <label key={p.id} className="cursor-pointer">
                                                    <input type="radio" value={p.id} {...register("habPlageAcces")} className="peer sr-only" />
                                                    <div className="px-4 py-2 border-2 border-blue-200 rounded-full text-sm font-bold text-blue-700 peer-checked:border-blue-500 peer-checked:bg-blue-100 transition-all bg-white">{p.label}</div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Urbain */}
                                {habAmbiancesList.includes("URBAIN") && (
                                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-3">
                                        <div className="font-bold text-gray-800 text-sm flex items-center gap-2"><Building className="h-4 w-4 text-[#00BFA6]" />{t('f227')}</div>
                                        <div className="space-y-2">
                                            {tGroup('HAB_URBAIN_COMMODITES', HAB_URBAIN_COMMODITES).map((c) => (
                                                <label key={c.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={c.id} {...register("habUrbainCommodites")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {c.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Saharien */}
                                {habAmbiancesList.includes("SAHARIEN") && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-3">
                                        <div className="font-bold text-amber-900 text-sm flex items-center gap-2"><Palmtree className="h-4 w-4" />{t('f228')}</div>
                                        <div className="space-y-2">
                                            {tGroup('HAB_SAHARIEN_ACTIVITES', HAB_SAHARIEN_ACTIVITES).map((a) => (
                                                <label key={a.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={a.id} {...register("habSaharienActivites")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {a.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Thermal */}
                                {habAmbiancesList.includes("THERMAL") && (
                                    <div className="bg-teal-50 border border-teal-200 rounded-xl p-5 space-y-4">
                                        <div className="font-bold text-teal-900 text-sm flex items-center gap-2"><Droplet className="h-4 w-4" />{t('f229')}</div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-2">{t('f230')}</label>
                                            <div className="flex flex-wrap gap-3">
                                                <label className="cursor-pointer">
                                                    <input type="radio" value="INTEGRE" {...register("habThermalLocalisation")} className="peer sr-only" />
                                                    <div className="px-4 py-2 border-2 border-gray-200 rounded-full text-sm font-bold text-gray-700 peer-checked:border-[#00BFA6] peer-checked:bg-[#00BFA6]/10 peer-checked:text-[#00BFA6] transition-all bg-white">{t('f231')}</div>
                                                </label>
                                                <label className="cursor-pointer">
                                                    <input type="radio" value="PROXIMITE" {...register("habThermalLocalisation")} className="peer sr-only" />
                                                    <div className="px-4 py-2 border-2 border-gray-200 rounded-full text-sm font-bold text-gray-700 peer-checked:border-[#00BFA6] peer-checked:bg-[#00BFA6]/10 peer-checked:text-[#00BFA6] transition-all bg-white">{t('f232')}</div>
                                                </label>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-2">{t('f233')}</label>
                                            <input {...register("habThermalDistance")} type="text" className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-sm" placeholder={t('f399')} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-2">{t('f234')}</label>
                                            <div className="flex flex-wrap gap-3">
                                                <label className="cursor-pointer">
                                                    <input type="radio" value="GRATUIT" {...register("habThermalAcces")} className="peer sr-only" />
                                                    <div className="px-4 py-2 border-2 border-gray-200 rounded-full text-sm font-bold text-gray-700 peer-checked:border-[#00BFA6] peer-checked:bg-[#00BFA6]/10 peer-checked:text-[#00BFA6] transition-all bg-white">{t('f235')}</div>
                                                </label>
                                                <label className="cursor-pointer">
                                                    <input type="radio" value="PAYANT" {...register("habThermalAcces")} className="peer sr-only" />
                                                    <div className="px-4 py-2 border-2 border-gray-200 rounded-full text-sm font-bold text-gray-700 peer-checked:border-[#00BFA6] peer-checked:bg-[#00BFA6]/10 peer-checked:text-[#00BFA6] transition-all bg-white">{t('f236')}</div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Climatique */}
                                {habAmbiancesList.includes("CLIMATIQUE") && (
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-5 space-y-4">
                                        <div className="font-bold text-green-900 text-sm flex items-center gap-2"><Trees className="h-4 w-4" />{t('f237')}</div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-2">{t('f238')}</label>
                                            <div className="flex flex-wrap gap-3">
                                                {[
                                                    { id: "INTEGRE", label: "Intégré (domaine arboré / forêt privée)" },
                                                    { id: "A_PIED", label: "À pied (directement depuis l'établissement)" },
                                                    { id: "EN_VOITURE", label: "En voiture (déplacement nécessaire)" },
                                                ].map((opt) => (
                                                    <label key={opt.id} className="cursor-pointer">
                                                        <input type="radio" value={opt.id} {...register("habClimatAcces")} className="peer sr-only" />
                                                        <div className="px-4 py-2 border-2 border-gray-200 rounded-full text-sm font-bold text-gray-700 peer-checked:border-[#00BFA6] peer-checked:bg-[#00BFA6]/10 peer-checked:text-[#00BFA6] transition-all bg-white">{opt.label}</div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        {habClimatAcces === "EN_VOITURE" && (
                                            <div>
                                                <label className="block text-sm font-bold text-gray-900 mb-2">{t('f239')}</label>
                                                <input {...register("habClimatTempsVoiture")} type="number" min="0" onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()} className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-sm" placeholder={t('f378')} />
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                                                <input type="checkbox" {...register("habClimatVisitesGuidees")} className="accent-[#00BFA6] w-4 h-4" />{t('f240')}</label>
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                                                <input type="checkbox" {...register("habClimatPisteSki")} className="accent-[#00BFA6] w-4 h-4" />{t('f241')}</label>
                                        </div>
                                    </div>
                                )}

                                {/* Étape 2.2 – Vue */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">{t('f242')}</label>
                                    <div className="flex flex-wrap gap-3">
                                        {tGroup('HAB_VUES', HAB_VUES).map((v) => (
                                            <label key={v.id} className="cursor-pointer">
                                                <input type="checkbox" value={v.id} {...register("habVues")} className="peer sr-only" />
                                                <div className="px-4 py-2 border-2 border-gray-200 rounded-full text-sm font-bold text-gray-700 peer-checked:border-[#00BFA6] peer-checked:bg-[#00BFA6]/10 peer-checked:text-[#00BFA6] transition-all bg-white hover:border-gray-300">{v.label}</div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            {/* Étape 3 – Transports & Attractions */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Navigation className="h-5 w-5 text-[#00BFA6]" />{t('f243')}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f244')}</label>
                                        <input {...register("habAirport")} type="text" className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base" placeholder={t('f400')} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f245')}</label>
                                        <input {...register("habAirportKm")} type="number" min="0" onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()} className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base" placeholder={t('f371')} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">{t('f246')}</label>
                                    <input {...register("habTransportCommuns")} type="text" className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base" placeholder={t('f401')} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">{t('f247')}</label>
                                    <div className="flex flex-wrap gap-3">
                                        {tGroup('HAB_ATTRACTIONS', HAB_ATTRACTIONS).map((a) => (
                                            <label key={a.id} className="cursor-pointer">
                                                <input type="checkbox" value={a.id} {...register("habAttractions")} className="peer sr-only" />
                                                <div className="px-4 py-2 border-2 border-gray-200 rounded-full text-sm font-bold text-gray-700 peer-checked:border-[#00BFA6] peer-checked:bg-[#00BFA6]/10 peer-checked:text-[#00BFA6] transition-all bg-white hover:border-gray-300">{a.label}</div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            {/* Étape 4 – Équipements & Services */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Utensils className="h-5 w-5 text-[#00BFA6]" />{t('f248')}</h2>

                                {/* Services et Repas */}
                                <div className="bg-white border-2 border-gray-200 p-5 rounded-xl space-y-4">
                                    <div className="font-bold text-gray-900">{t('f249')}</div>
                                    <div className="flex flex-wrap gap-3">
                                        {tGroup('HAB_REPAS', HAB_REPAS).map((r) => (
                                            <label key={r.id} className="cursor-pointer">
                                                <input type="checkbox" value={r.id} {...register("habRepas")} className="peer sr-only" />
                                                <div className="px-4 py-2 border-2 border-gray-200 rounded-full text-sm font-bold text-gray-700 peer-checked:border-[#00BFA6] peer-checked:bg-[#00BFA6]/10 peer-checked:text-[#00BFA6] transition-all bg-white hover:border-gray-300">{r.label}</div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Linge & Hygiène */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f250')}</div>
                                        <div className="space-y-2">
                                            {tGroup('HAB_LINGE', HAB_LINGE).map((l) => (
                                                <label key={l.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={l.id} {...register("habLinge")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {l.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl space-y-2">
                                        <div className="font-bold text-gray-900 mb-3">{t('f251')}</div>
                                        <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                            <input type="checkbox" {...register("habHygiene")} className="accent-[#00BFA6] w-4 h-4" />{t('f252')}</label>
                                        <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                            <input type="checkbox" {...register("habLivraison")} className="accent-[#00BFA6] w-4 h-4" />{t('f253')}</label>
                                    </div>
                                </div>

                                {/* Cuisine */}
                                <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                    <div className="font-bold text-gray-900 mb-3">{t('f254')}</div>
                                    <div className="flex flex-wrap gap-3">
                                        {tGroup('HAB_EQUIPEMENTS_CUISINE', HAB_EQUIPEMENTS_CUISINE).map((e) => (
                                            <label key={e.id} className="cursor-pointer">
                                                <input type="checkbox" value={e.id} {...register("habCuisineEquipements")} className="peer sr-only" />
                                                <div className="px-4 py-2 border-2 border-gray-200 rounded-full text-sm font-bold text-gray-700 peer-checked:border-[#00BFA6] peer-checked:bg-[#00BFA6]/10 peer-checked:text-[#00BFA6] transition-all bg-white hover:border-gray-300">{e.label}</div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Confort & Multimédia */}
                                <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                    <div className="font-bold text-gray-900 mb-3">{t('f255')}</div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                        {tGroup('HAB_CONFORT', HAB_CONFORT).map((c) => (
                                            <label key={c.id} className="cursor-pointer">
                                                <input type="checkbox" value={c.id} {...register("habConfort")} className="peer sr-only" />
                                                <div className="p-3 border-2 border-gray-200 rounded-xl text-center text-sm font-bold text-gray-700 peer-checked:border-[#00BFA6] peer-checked:bg-[#00BFA6]/10 peer-checked:text-[#00BFA6] transition-all bg-gray-50 hover:border-gray-400">{c.label}</div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Loisirs & Bien-être */}
                                <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                    <div className="font-bold text-gray-900 mb-3">{t('f256')}</div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {tGroup('HAB_LOISIRS', HAB_LOISIRS).map((l) => (
                                            <label key={l.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                <input type="checkbox" value={l.id} {...register("habLoisirs")} className="accent-[#00BFA6] w-4 h-4" />
                                                {l.label}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Équipements de Secours */}
                                <div className="bg-orange-50 border-2 border-orange-200 p-4 rounded-xl">
                                    <div className="font-bold text-orange-900 mb-3 flex items-center gap-2">
                                        <Zap className="h-4 w-4" />{t('f257')}</div>
                                    <div className="space-y-2">
                                        {tGroup('HAB_SECOURS', HAB_SECOURS).map((s) => (
                                            <label key={s.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                <input type="checkbox" value={s.id} {...register("habSecours")} className="accent-orange-500 w-4 h-4" />
                                                {s.label}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            {/* Étape 5 – Stationnement & Accessibilité */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <ParkingCircle className="h-5 w-5 text-[#00BFA6]" />{t('f258')}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f259')}</div>
                                        <div className="space-y-2">
                                            {tGroup('HAB_PARKING', HAB_PARKING).map((p) => (
                                                <label key={p.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="checkbox" value={p.id} {...register("habParking")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {p.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                        <div className="font-bold text-gray-900 mb-3">{t('f260')}</div>
                                        <div className="space-y-2">
                                            {tGroup('HAB_ACCESSIBILITE', HAB_ACCESSIBILITE).map((a) => (
                                                <label key={a.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                    <input type="radio" value={a.id} {...register("habAccessibilite")} className="accent-[#00BFA6] w-4 h-4" />
                                                    {a.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Étape 6 – Règlement intérieur & Logistique */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-[#00BFA6]" />{t('f261')}</h2>

                                {/* Âge minimal */}
                                <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                    <div className="font-bold text-gray-900 mb-3">{t('f262')}</div>
                                    <div className="flex gap-4">
                                        {[{ id: "18", label: "18 ans révolus" }, { id: "21", label: "21 ans révolus" }].map((opt) => (
                                            <label key={opt.id} className="cursor-pointer">
                                                <input type="radio" value={opt.id} {...register("habAgeMin")} className="peer sr-only" />
                                                <div className="px-6 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-700 peer-checked:border-[#00BFA6] peer-checked:bg-[#00BFA6]/10 peer-checked:text-[#00BFA6] transition-all bg-white">{opt.label}</div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Autorisations */}
                                <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                                    <div className="font-bold text-gray-900 mb-3">{t('f263')}</div>
                                    <div className="flex flex-wrap gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                                            <input type="checkbox" {...register("habFumeurs")} className="accent-[#00BFA6] w-4 h-4" />{t('f264')}</label>
                                        <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                                            <input type="checkbox" {...register("habAnimaux")} className="accent-[#00BFA6] w-4 h-4" />{t('f265')}</label>
                                        <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                                            <input type="checkbox" {...register("habFetes")} className="accent-[#00BFA6] w-4 h-4" />{t('f266')}</label>
                                    </div>
                                </div>

                                {/* Check-in / Check-out */}
                                <div className="bg-white border-2 border-gray-200 p-5 rounded-xl space-y-4">
                                    <div className="font-bold text-gray-900">{t('f267')}</div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-2">{t('f268')}</label>
                                            <input {...register("habCheckIn")} type="time" className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-2">{t('f269')}</label>
                                            <input {...register("habCheckOut")} type="time" className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">{t('f270')}</label>
                                        <div className="flex gap-4">
                                            {[
                                                { id: "24H", label: "Réception ouverte 24h/24" },
                                                { id: "HORAIRES", label: "Réception à horaires limités" },
                                            ].map((opt) => (
                                                <label key={opt.id} className="cursor-pointer flex-1">
                                                    <input type="radio" value={opt.id} {...register("habReceptionMode")} className="peer sr-only" />
                                                    <div className="p-3 border-2 border-gray-200 rounded-xl text-center text-sm font-bold text-gray-700 peer-checked:border-[#00BFA6] peer-checked:bg-[#00BFA6]/10 peer-checked:text-[#00BFA6] transition-all bg-white">{opt.label}</div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    {habReceptionMode === "HORAIRES" && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-0">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1">{t('f271')}</label>
                                                <input {...register("habReceptionStart")} type="time" className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1">{t('f272')}</label>
                                                <input {...register("habReceptionEnd")} type="time" className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base" />
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">{t('f273')}</label>
                                            <div className="flex flex-col gap-2">
                                                {[
                                                    { id: "EN_MAIN_PROPRE", label: "En main propre à l'accueil / par l'hôte" },
                                                    { id: "AUTONOMIE", label: "Autonomie (Boîte à clés sécurisée)" },
                                                ].map((opt) => (
                                                    <label key={opt.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                        <input type="radio" value={opt.id} {...register("habRemiseCles")} className="accent-[#00BFA6] w-4 h-4" />
                                                        {opt.label}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">{t('f274')}</label>
                                            <div className="flex flex-col gap-2">
                                                {[
                                                    { id: "RETENTION", label: "Rétention de la pièce d'identité originale durant le séjour" },
                                                    { id: "COPIE", label: "Une simple copie / numérisation suffit" },
                                                ].map((opt) => (
                                                    <label key={opt.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                        <input type="radio" value={opt.id} {...register("habControleIdentite")} className="accent-[#00BFA6] w-4 h-4" />
                                                        {opt.label}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* Step 4: Fiche descriptive – Hébergement & Séjour (Type de bien) */}
                    {currentStep === 4 && isHebergementSejourFiche && (
                        <div className="w-full max-w-4xl animate-fade-in space-y-10">

                            {/* Classification (Professionnel uniquement) */}
                            {isEtablissementHebergement && (
                                <section className="space-y-6">
                                    <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                        <Star className="h-5 w-5 text-[#00BFA6]" />{t('hsSectionClassification')}</h2>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-3">{t('hsClassificationLabel')}</label>
                                        <div className="flex flex-wrap gap-3">
                                            {[
                                                { id: "ETOILE", label: t('hsClassifieEtoile') },
                                                { id: "NON_ETOILE", label: t('hsClassifieNonEtoile') },
                                            ].map((opt) => (
                                                <label key={opt.id} className="cursor-pointer">
                                                    <input type="radio" value={opt.id} {...register("hsClassification")} className="peer sr-only" />
                                                    <div className="px-4 py-2 border-2 border-gray-200 rounded-full text-sm font-bold text-gray-700 peer-checked:border-[#00BFA6] peer-checked:bg-[#00BFA6]/10 peer-checked:text-[#00BFA6] transition-all bg-white hover:border-gray-300">{opt.label}</div>
                                                </label>
                                            ))}
                                        </div>
                                        {errors.hsClassification && <p className="text-red-500 text-sm mt-1">{errors.hsClassification.message as any}</p>}
                                    </div>

                                    {hsClassification === "ETOILE" && (
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-3">{t('hsNbEtoiles')}</label>
                                            <div className="flex gap-2 flex-wrap">
                                                {[1, 2, 3, 4, 5].map((n) => (
                                                    <label key={n} className="cursor-pointer">
                                                        <input type="radio" value={String(n)} {...register("hsNombreEtoiles")} className="peer sr-only" />
                                                        <div className="w-14 h-12 border-2 rounded-xl flex items-center justify-center font-bold text-gray-600 peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 peer-checked:text-[#00BFA6] transition-all hover:border-gray-400 bg-gray-50">
                                                            {n}★
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-3">{t('hsTypeEtablissementLabel')}</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                            {tGroup('HS_TYPE_ETABLISSEMENT', HS_TYPE_ETABLISSEMENT).map((opt) => (
                                                <label key={opt.id} className="cursor-pointer">
                                                    <input type="radio" value={opt.id} {...register("hsTypeEtablissement")} className="peer sr-only" />
                                                    <div className="p-3 border-2 border-gray-200 rounded-xl bg-white peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 transition-all hover:border-gray-400 text-center">
                                                        <div className="font-bold text-gray-900 text-sm">{opt.label}</div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                        {errors.hsTypeEtablissement && <p className="text-red-500 text-sm mt-1">{errors.hsTypeEtablissement.message as any}</p>}
                                        {hsTypeEtablissement === "AUTRE" && (
                                            <div className="mt-3">
                                                <label className="block text-sm font-bold text-gray-900 mb-2">{t('hsTypeEtablissementAutrePrecise')}</label>
                                                <input {...register("hsTypeEtablissementAutre")} type="text" className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base" placeholder={t('hsPlaceholderAutreEtablissement')} />
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}

                            {/* Type de bien proposé */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Home className="h-5 w-5 text-[#00BFA6]" />{t('hsSectionTypeBien')}</h2>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">{t('hsTypeBienLabel')}</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {[
                                            { id: "MAISON_COMPLETE", label: t('hsMaisonComplete'), desc: t('hsMaisonCompleteDesc'), icon: Home },
                                            { id: "CHAMBRE", label: t('hsChambre'), desc: t('hsChambreDesc'), icon: BedIcon },
                                            { id: "PLACE_DE_LIT", label: t('hsPlaceDeLit'), desc: t('hsPlaceDeLitDesc'), icon: BedDouble },
                                        ].map((opt) => {
                                            const Icon = opt.icon
                                            return (
                                                <label key={opt.id} className="cursor-pointer">
                                                    <input type="radio" value={opt.id} {...register("hsTypeBien")} className="peer sr-only" />
                                                    <div className="p-4 border-2 border-gray-200 rounded-xl bg-white peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 transition-all hover:border-gray-400 text-center flex flex-col items-center gap-2">
                                                        <Icon className="h-6 w-6 text-gray-500 peer-checked:text-[#00BFA6]" />
                                                        <div className="font-bold text-gray-900 text-sm">{opt.label}</div>
                                                        <div className="text-xs text-gray-500">{opt.desc}</div>
                                                    </div>
                                                </label>
                                            )
                                        })}
                                    </div>
                                    {errors.hsTypeBien && <p className="text-red-500 text-sm mt-1">{errors.hsTypeBien.message as any}</p>}
                                </div>
                            </section>

                            {/* ===== MAISON COMPLETE ===== */}
                            {hsTypeBien === "MAISON_COMPLETE" && (
                                <>
                                    <section className="space-y-6">
                                        <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                            <Building className="h-5 w-5 text-[#00BFA6]" />{t('hsSectionStructure')}</h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                            {tGroup('HS_STRUCTURE_TYPES', HS_STRUCTURE_TYPES).map((s) => (
                                                <label key={s.id} className="cursor-pointer">
                                                    <input type="radio" value={s.id} {...register("hsStructureType")} className="peer sr-only" />
                                                    <div className="p-3 border-2 border-gray-200 rounded-xl bg-white peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 transition-all hover:border-gray-400 text-center">
                                                        <div className="font-bold text-gray-900 text-sm">{s.label}</div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                        {watch("hsStructureType") === "INSOLITE" && (
                                            <div>
                                                <label className="block text-sm font-bold text-gray-900 mb-2">{t('hsInsolitePrecise')}</label>
                                                <input {...register("hsStructureTypeInsolite")} type="text" className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base" placeholder={t('f398')} />
                                            </div>
                                        )}
                                    </section>

                                    <section className="space-y-6">
                                        <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                            <Ruler className="h-5 w-5 text-[#00BFA6]" />{t('hsSectionCaracteristiques')}</h2>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-900 mb-2">{t('hsSurfaceHabitable')}</label>
                                                <input {...register("hsMcSurface")} type="number" min="0" onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()} className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base" placeholder={t('f362')} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-900 mb-2">{t('hsSituationBatiment')}</label>
                                                <div className="flex gap-3 flex-wrap mt-2">
                                                    {[
                                                        { id: "RDC", label: t('hsRdc') },
                                                        { id: "ETAGE_SUP", label: t('hsEtageSup') },
                                                    ].map((opt) => (
                                                        <label key={opt.id} className="cursor-pointer">
                                                            <input type="radio" value={opt.id} {...register("hsMcEtage")} className="peer sr-only" />
                                                            <div className="px-4 py-2 border-2 border-gray-200 rounded-full text-sm font-bold text-gray-700 peer-checked:border-[#00BFA6] peer-checked:bg-[#00BFA6]/10 peer-checked:text-[#00BFA6] transition-all bg-white hover:border-gray-300">{opt.label}</div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {hsMcEtage === "ETAGE_SUP" && (
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">{t('hsAscenseurQuestion')}</label>
                                                <div className="flex gap-3">
                                                    {[
                                                        { id: "OUI", label: t('hsOui') },
                                                        { id: "NON", label: t('hsNon') },
                                                    ].map((opt) => (
                                                        <label key={opt.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                            <input type="radio" value={opt.id} {...register("hsMcAscenseur")} className="accent-[#00BFA6] w-4 h-4" />
                                                            {opt.label}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <h3 className="text-base font-bold text-gray-800 mb-4">{t('hsCompositionPieces')}</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1">{t('hsNbChambres')}</label>
                                                    <input {...register("hsMcNbChambres")} type="number" min="0" onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()} className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-sm" placeholder={t('f377')} />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1">{t('hsNbSalons')}</label>
                                                    <input {...register("hsMcNbSalons")} type="number" min="0" onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()} className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-sm" placeholder={t('f385')} />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1">{t('hsNbSdb')}</label>
                                                    <input {...register("hsMcNbSdb")} type="number" min="0" onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()} className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-sm" placeholder={t('f380')} />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1">{t('hsNbWc')}</label>
                                                    <input {...register("hsMcNbWc")} type="number" min="0" onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()} className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-sm" placeholder={t('f394')} />
                                                </div>
                                                <div className="flex items-end">
                                                    <label className="flex items-center gap-2 cursor-pointer p-3 border-2 border-gray-200 rounded-xl bg-white hover:border-[#00BFA6] transition-all h-[46px] w-full">
                                                        <input type="checkbox" {...register("hsMcSuiteParentale")} className="accent-[#00BFA6] w-4 h-4" />
                                                        <span className="text-xs font-bold text-gray-700">{t('hsSuiteParentaleQuestion')}</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="space-y-6">
                                        <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                            <Bed className="h-5 w-5 text-[#00BFA6]" />{t('hsSectionLits')}</h2>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-2">{t('hsLitsTotal')}</label>
                                            <input {...register("hsMcLitsTotal")} type="number" min="0" onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()} className="w-full sm:w-48 p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base" placeholder={t('f394')} />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-gray-800 mb-4">{t('hsTypesLits')}</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {[
                                                    { field: "hsMcLitKing", label: t('hsLitKing') },
                                                    { field: "hsMcLitQueen", label: t('hsLitQueen') },
                                                    { field: "hsMcLitDouble", label: t('hsLitDouble') },
                                                    { field: "hsMcLitSimple", label: t('hsLitSimple') },
                                                    { field: "hsMcLitSuperpose", label: t('hsLitSuperpose') },
                                                    { field: "hsMcLitGigogne", label: t('hsLitGigogne') },
                                                    { field: "hsMcLitBebe", label: t('hsLitBebe') },
                                                ].map((bed) => (
                                                    <div key={bed.field} className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3">
                                                        <span className="text-sm font-medium text-gray-700 flex-1">{bed.label}</span>
                                                        <input
                                                            {...register(bed.field as any)}
                                                            type="number" min="0" max="20"
                                                            onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                            className="w-20 p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-bold text-gray-900 text-center text-sm"
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </section>

                                    <section className="space-y-6">
                                        <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                            <Sofa className="h-5 w-5 text-[#00BFA6]" />{t('hsSectionSalon')}</h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {tGroup('HS_TYPE_SALON', HS_TYPE_SALON).map((opt) => (
                                                <label key={opt.id} className="cursor-pointer">
                                                    <input type="radio" value={opt.id} {...register("hsMcTypeSalon")} className="peer sr-only" />
                                                    <div className="p-4 border-2 border-gray-200 rounded-xl bg-white peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 transition-all hover:border-gray-400">
                                                        <div className="font-bold text-gray-900 text-sm">{opt.label}</div>
                                                        <div className="text-xs text-gray-500 mt-1">{opt.desc}</div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                        {hsMcTypeSalon === "CANAPE_CONVERTIBLE" && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1">{t('hsNbCanapesConvertibles')}</label>
                                                    <input {...register("hsMcNbCanapesConvertibles")} type="number" min="0" onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()} className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-sm" placeholder="0" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1">{t('hsNbCouchagesAppoint')}</label>
                                                    <input {...register("hsMcNbCouchagesAppoint")} type="number" min="0" onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()} className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-sm" placeholder="0" />
                                                </div>
                                            </div>
                                        )}
                                    </section>

                                    <section className="space-y-6">
                                        <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                            <Users className="h-5 w-5 text-[#00BFA6]" />{t('hsSectionProfil')}</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {tGroup('HS_PROFIL_ADAPTATION', HS_PROFIL_ADAPTATION).map((p) => (
                                                <label key={p.id} className="cursor-pointer">
                                                    <input type="checkbox" value={p.id} {...register("hsMcProfilAdaptation")} className="peer sr-only" />
                                                    <div className="p-4 border-2 border-gray-200 rounded-xl bg-white peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 transition-all hover:border-gray-400">
                                                        <div className="font-bold text-gray-900 text-sm">{p.label}</div>
                                                        <div className="text-xs text-gray-500 mt-1">{p.desc}</div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-900 mb-2">{t('hsVoyageursMax')}</label>
                                                <input {...register("hsMcVoyageursMax")} type="number" min="0" onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()} className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base" placeholder={t('f394')} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-900 mb-2">{t('hsPolitiqueEnfants')}</label>
                                                <div className="flex flex-col gap-2 mt-2">
                                                    {[
                                                        { id: "ADULTES_ENFANTS", label: t('hsAdultesEnfants') },
                                                        { id: "ADULTES_UNIQUEMENT", label: t('hsAdultesUniquement') },
                                                    ].map((opt) => (
                                                        <label key={opt.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                            <input type="radio" value={opt.id} {...register("hsMcPolitiqueEnfants")} className="accent-[#00BFA6] w-4 h-4" />
                                                            {opt.label}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </>
                            )}

                            {/* ===== CHAMBRE ===== */}
                            {hsTypeBien === "CHAMBRE" && (
                                <>
                                    <section className="space-y-6">
                                        <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                            <DoorOpen className="h-5 w-5 text-[#00BFA6]" />{t('hsPrecisionChambre')}</h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {[
                                                { id: "INDIVIDUELLE", label: t('hsChambreIndividuelle'), desc: t('hsChambreIndividuelleDesc') },
                                                { id: "PARTAGEE", label: t('hsChambrePartagee'), desc: t('hsChambrePartageeDesc') },
                                            ].map((opt) => (
                                                <label key={opt.id} className="cursor-pointer">
                                                    <input type="radio" value={opt.id} {...register("hsChPrecision")} className="peer sr-only" />
                                                    <div className="p-4 border-2 border-gray-200 rounded-xl bg-white peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 transition-all hover:border-gray-400">
                                                        <div className="font-bold text-gray-900 text-sm">{opt.label}</div>
                                                        <div className="text-xs text-gray-500 mt-1">{opt.desc}</div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                        <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900 w-fit">
                                            <input type="checkbox" {...register("hsChChezHabitant")} className="accent-[#00BFA6] w-4 h-4" />
                                            {t('hsChezHabitant')}
                                        </label>
                                    </section>

                                    <section className="space-y-6">
                                        <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                            <Building className="h-5 w-5 text-[#00BFA6]" />{t('hsSectionStructure')}</h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                            {tGroup('HS_STRUCTURE_TYPES', HS_STRUCTURE_TYPES).map((s) => (
                                                <label key={s.id} className="cursor-pointer">
                                                    <input type="radio" value={s.id} {...register("hsStructureType")} className="peer sr-only" />
                                                    <div className="p-3 border-2 border-gray-200 rounded-xl bg-white peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 transition-all hover:border-gray-400 text-center">
                                                        <div className="font-bold text-gray-900 text-sm">{s.label}</div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                        {watch("hsStructureType") === "INSOLITE" && (
                                            <div>
                                                <label className="block text-sm font-bold text-gray-900 mb-2">{t('hsInsolitePrecise')}</label>
                                                <input {...register("hsStructureTypeInsolite")} type="text" className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base" placeholder={t('f398')} />
                                            </div>
                                        )}
                                    </section>

                                    <section className="space-y-6">
                                        <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                            <Ruler className="h-5 w-5 text-[#00BFA6]" />{t('hsSectionCaracteristiques')}</h2>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-2">{t('hsSurfaceChambre')}</label>
                                            <input {...register("hsChSurface")} type="number" min="0" onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()} className="w-full sm:w-48 p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base" placeholder={t('f362')} />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-2">{t('hsLitsTotal')}</label>
                                            <input {...register("hsChLitsTotal")} type="number" min="0" onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()} className="w-full sm:w-48 p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base" placeholder={t('f394')} />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-gray-800 mb-4">{t('hsTypesLits')}</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {[
                                                    { field: "hsChLitKing", label: t('hsLitKing') },
                                                    { field: "hsChLitQueen", label: t('hsLitQueen') },
                                                    { field: "hsChLitDouble", label: t('hsLitDouble') },
                                                    { field: "hsChLitSimple", label: t('hsLitSimple') },
                                                    { field: "hsChLitSuperpose", label: t('hsLitSuperpose') },
                                                    { field: "hsChLitBebe", label: t('hsLitBebe') },
                                                ].map((bed) => (
                                                    <div key={bed.field} className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3">
                                                        <span className="text-sm font-medium text-gray-700 flex-1">{bed.label}</span>
                                                        <input
                                                            {...register(bed.field as any)}
                                                            type="number" min="0" max="20"
                                                            onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                            className="w-20 p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-bold text-gray-900 text-center text-sm"
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </section>

                                    <section className="space-y-6">
                                        <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                            <Key className="h-5 w-5 text-[#00BFA6]" />{t('hsSectionEspacesCommuns')}</h2>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-3">{t('hsAccesPartiesCommunes')}</label>
                                            <div className="flex flex-wrap gap-3">
                                                {tGroup('HS_ESPACES_COMMUNS', HS_ESPACES_COMMUNS).map((c) => (
                                                    <label key={c.id} className="cursor-pointer">
                                                        <input type="checkbox" value={c.id} {...register("hsChEspacesCommuns")} className="peer sr-only" />
                                                        <div className="px-4 py-2 border-2 border-gray-200 rounded-full text-sm font-bold text-gray-700 peer-checked:border-[#00BFA6] peer-checked:bg-[#00BFA6]/10 peer-checked:text-[#00BFA6] transition-all bg-white hover:border-gray-300">{c.label}</div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        {hsChEspacesCommunsList.includes("SDB_PARTAGEE") && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1">{t('hsNbDouches')}</label>
                                                    <input {...register("hsChNbDouches")} type="number" min="0" onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()} className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-sm" placeholder="0" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1">{t('hsNbWc')}</label>
                                                    <input {...register("hsChNbWc")} type="number" min="0" onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()} className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-sm" placeholder="0" />
                                                </div>
                                            </div>
                                        )}
                                    </section>

                                    <section className="space-y-6">
                                        <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                            <Users className="h-5 w-5 text-[#00BFA6]" />{t('hsSectionProfil')}</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {tGroup('HS_PROFIL_ADAPTATION', HS_PROFIL_ADAPTATION).map((p) => (
                                                <label key={p.id} className="cursor-pointer">
                                                    <input type="checkbox" value={p.id} {...register("hsChProfilAdaptation")} className="peer sr-only" />
                                                    <div className="p-4 border-2 border-gray-200 rounded-xl bg-white peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 transition-all hover:border-gray-400">
                                                        <div className="font-bold text-gray-900 text-sm">{p.label}</div>
                                                        <div className="text-xs text-gray-500 mt-1">{p.desc}</div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-900 mb-2">{t('hsVoyageursMax')}</label>
                                                <input {...register("hsChVoyageursMax")} type="number" min="0" onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()} className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base" placeholder={t('f394')} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-900 mb-2">{t('hsPolitiqueEnfants')}</label>
                                                <div className="flex flex-col gap-2 mt-2">
                                                    {[
                                                        { id: "ADULTES_ENFANTS", label: t('hsAdultesEnfants') },
                                                        { id: "ADULTES_UNIQUEMENT", label: t('hsAdultesUniquement') },
                                                    ].map((opt) => (
                                                        <label key={opt.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                            <input type="radio" value={opt.id} {...register("hsChPolitiqueEnfants")} className="accent-[#00BFA6] w-4 h-4" />
                                                            {opt.label}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </>
                            )}

                            {/* ===== PLACE DE LIT ===== */}
                            {hsTypeBien === "PLACE_DE_LIT" && (
                                <>
                                    <section className="space-y-6">
                                        <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                            <Bed className="h-5 w-5 text-[#00BFA6]" />{t('hsSectionPlaceLit')}</h2>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-3">{t('hsTypeCouchage')}</label>
                                            <div className="flex flex-wrap gap-3">
                                                <label className="cursor-pointer">
                                                    <input type="radio" value="LIT_SIMPLE" {...register("hsPlTypeCouchage")} className="peer sr-only" />
                                                    <div className="px-4 py-2 border-2 border-gray-200 rounded-full text-sm font-bold text-gray-700 peer-checked:border-[#00BFA6] peer-checked:bg-[#00BFA6]/10 peer-checked:text-[#00BFA6] transition-all bg-white hover:border-gray-300">{t('hsLitSimpleStandard')}</div>
                                                </label>
                                                <label className="cursor-pointer">
                                                    <input type="radio" value="LIT_SUPERPOSE" {...register("hsPlTypeCouchage")} className="peer sr-only" />
                                                    <div className="px-4 py-2 border-2 border-gray-200 rounded-full text-sm font-bold text-gray-700 peer-checked:border-[#00BFA6] peer-checked:bg-[#00BFA6]/10 peer-checked:text-[#00BFA6] transition-all bg-white hover:border-gray-300">{t('hsLitSuperposePosition')}</div>
                                                </label>
                                            </div>
                                        </div>
                                        {hsPlTypeCouchage === "LIT_SUPERPOSE" && (
                                            <div className="flex gap-3">
                                                {[
                                                    { id: "HAUT", label: t('hsPositionHaut') },
                                                    { id: "BAS", label: t('hsPositionBas') },
                                                ].map((opt) => (
                                                    <label key={opt.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                        <input type="radio" value={opt.id} {...register("hsPlPosition")} className="accent-[#00BFA6] w-4 h-4" />
                                                        {opt.label}
                                                    </label>
                                                ))}
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-2">{t('hsConfigEspacePartage')}</label>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">{t('hsNbLitsPiecePartagee')}</label>
                                            <input {...register("hsPlNbLitsPiece")} type="number" min="0" onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()} className="w-full sm:w-48 p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base" placeholder={t('f394')} />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-3">{t('hsEquipementsInclus')}</label>
                                            <div className="flex flex-wrap gap-3">
                                                {tGroup('HS_EQUIPEMENTS_PLACE_LIT', HS_EQUIPEMENTS_PLACE_LIT).map((e) => (
                                                    <label key={e.id} className="cursor-pointer">
                                                        <input type="checkbox" value={e.id} {...register("hsPlEquipements")} className="peer sr-only" />
                                                        <div className="px-4 py-2 border-2 border-gray-200 rounded-full text-sm font-bold text-gray-700 peer-checked:border-[#00BFA6] peer-checked:bg-[#00BFA6]/10 peer-checked:text-[#00BFA6] transition-all bg-white hover:border-gray-300">{e.label}</div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </section>

                                    <section className="space-y-6">
                                        <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                            <Key className="h-5 w-5 text-[#00BFA6]" />{t('hsSectionEspacesCommuns')}</h2>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-3">{t('hsAccesPartiesCommunes')}</label>
                                            <div className="flex flex-wrap gap-3">
                                                {tGroup('HS_ESPACES_COMMUNS', HS_ESPACES_COMMUNS).map((c) => (
                                                    <label key={c.id} className="cursor-pointer">
                                                        <input type="checkbox" value={c.id} {...register("hsPlEspacesCommuns")} className="peer sr-only" />
                                                        <div className="px-4 py-2 border-2 border-gray-200 rounded-full text-sm font-bold text-gray-700 peer-checked:border-[#00BFA6] peer-checked:bg-[#00BFA6]/10 peer-checked:text-[#00BFA6] transition-all bg-white hover:border-gray-300">{c.label}</div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        {hsPlEspacesCommunsList.includes("SDB_PARTAGEE") && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1">{t('hsNbDouches')}</label>
                                                    <input {...register("hsPlNbDouches")} type="number" min="0" onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()} className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-sm" placeholder="0" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1">{t('hsNbWc')}</label>
                                                    <input {...register("hsPlNbWc")} type="number" min="0" onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()} className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-sm" placeholder="0" />
                                                </div>
                                            </div>
                                        )}
                                    </section>

                                    <section className="space-y-6">
                                        <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                            <Users className="h-5 w-5 text-[#00BFA6]" />{t('hsSectionProfil')}</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {tGroup('HS_PROFIL_ADAPTATION_PLACE_LIT', HS_PROFIL_ADAPTATION_PLACE_LIT).map((p) => (
                                                <label key={p.id} className="cursor-pointer">
                                                    <input type="checkbox" value={p.id} {...register("hsPlProfilAdaptation")} className="peer sr-only" />
                                                    <div className="p-4 border-2 border-gray-200 rounded-xl bg-white peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 transition-all hover:border-gray-400">
                                                        <div className="font-bold text-gray-900 text-sm">{p.label}</div>
                                                        <div className="text-xs text-gray-500 mt-1">{p.desc}</div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-900 mb-2">{t('hsVoyageursMax')}</label>
                                                <input {...register("hsPlVoyageursMax")} type="number" min="0" onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()} className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base" placeholder={t('f394')} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-900 mb-2">{t('hsPolitiqueEnfants')}</label>
                                                <div className="flex flex-col gap-2 mt-2">
                                                    {[
                                                        { id: "ADULTES_ENFANTS", label: t('hsAdultesEnfants') },
                                                        { id: "ADULTES_UNIQUEMENT", label: t('hsAdultesUniquement') },
                                                    ].map((opt) => (
                                                        <label key={opt.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                            <input type="radio" value={opt.id} {...register("hsPlPolitiqueEnfants")} className="accent-[#00BFA6] w-4 h-4" />
                                                            {opt.label}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </>
                            )}
                        </div>
                    )}

                    {/* Step 5: Tarifs & Disponibilités – Hébergement chez l'habitant */}
                    {currentStep === 5 && isHebergementHabitant && (
                        <div className="w-full max-w-3xl animate-fade-in space-y-10">

                            {/* Prix par nuitée */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Star className="h-5 w-5 text-[#00BFA6]" />{t('f275')}</h2>
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
                                    <div className="font-bold text-gray-900">{t('f276')}</div>
                                    <div className="flex gap-4 items-center">
                                        <div className="relative flex-1">
                                            <input
                                                {...register("price")}
                                                dir="ltr"
                                                type="text"
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/[^0-9]/g, "")
                                                    const formatted = val.replace(/\B(?=(\d{3})+(?!\d))/g, " ")
                                                    setValue("price", formatted, { shouldValidate: true })
                                                }}
                                                className="w-full p-4 pe-24 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all text-gray-900 bg-white font-bold text-lg"
                                                placeholder="0"
                                            />
                                            <div className="absolute end-2 top-2 bottom-2 flex items-center bg-gray-100 rounded-lg px-3 font-bold text-gray-700 text-sm">{t('f277')}</div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-700 mb-2">{t('f278')}</div>
                                        <div className="flex gap-3">
                                            {[{ id: "FIXED", label: t('depPriceFixed') }, { id: "NEGOTIABLE", label: t('depPriceNegotiable') }].map((opt) => (
                                                <label key={opt.id} className="cursor-pointer">
                                                    <input type="radio" value={opt.id} {...register("priceType")} className="peer sr-only" />
                                                    <div className="px-5 py-2 border-2 border-gray-200 rounded-full font-bold text-gray-700 peer-checked:border-[#00BFA6] peer-checked:bg-[#00BFA6]/10 peer-checked:text-[#00BFA6] transition-all bg-white text-sm">{opt.label}</div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Condition de paiement */}
                                <div className="bg-white border-2 border-gray-200 p-5 rounded-xl space-y-3">
                                    <div className="font-bold text-gray-900">{t('f279')}</div>
                                    <div className="space-y-2">
                                        {tGroup('HAB_CONDITION_PAIEMENT', HAB_CONDITION_PAIEMENT).map((c) => (
                                            <label key={c.id} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                                                <input type="radio" value={c.id} {...register("habConditionPaiement")} className="accent-[#00BFA6] w-4 h-4" />
                                                {c.label}
                                            </label>
                                        ))}
                                    </div>
                                    {habConditionPaiement === "ACOMPTE" && (
                                        <div className="ms-6 mt-3 space-y-2">
                                            <div className="text-sm font-bold text-gray-700">{t('f280')}</div>
                                            <div className="flex gap-3">
                                                {tGroup('HAB_ACOMPTE_OPTIONS', HAB_ACOMPTE_OPTIONS).map((a) => (
                                                    <label key={a.id} className="cursor-pointer">
                                                        <input type="radio" value={a.id} {...register("habAcompte")} className="peer sr-only" />
                                                        <div className="px-5 py-2 border-2 border-gray-200 rounded-full font-bold text-gray-700 peer-checked:border-[#00BFA6] peer-checked:bg-[#00BFA6]/10 peer-checked:text-[#00BFA6] transition-all bg-white text-sm">{a.label}</div>
                                                    </label>
                                                ))}
                                                <div className="flex items-center gap-2">
                                                    <input {...register("habAcompte")} type="text" placeholder={t('f402')} className="p-2 border-2 border-gray-300 rounded-lg w-24 font-medium text-gray-900 text-sm focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6]" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Politique d'annulation */}
                                <div className="bg-white border-2 border-gray-200 p-5 rounded-xl space-y-4">
                                    <div className="font-bold text-gray-900">{t('f281')}</div>
                                    <div className="flex gap-4">
                                        <label className="cursor-pointer flex-1">
                                            <input type="radio" value="NON_ACCEPTEE" {...register("habAnnulation")} className="peer sr-only" />
                                            <div className="p-3 border-2 border-gray-200 rounded-xl text-center font-bold text-gray-700 peer-checked:border-red-400 peer-checked:bg-red-50 peer-checked:text-red-600 transition-all bg-white text-sm">{t('f282')}</div>
                                        </label>
                                        <label className="cursor-pointer flex-1">
                                            <input type="radio" value="FLEXIBLE" {...register("habAnnulation")} className="peer sr-only" />
                                            <div className="p-3 border-2 border-gray-200 rounded-xl text-center font-bold text-gray-700 peer-checked:border-[#00BFA6] peer-checked:bg-green-50 peer-checked:text-[#00BFA6] transition-all bg-white text-sm">{t('f283')}</div>
                                        </label>
                                    </div>
                                    {habAnnulation === "FLEXIBLE" && (
                                        <div className="space-y-4">
                                            <div>
                                                <div className="text-sm font-bold text-gray-700 mb-2">{t('f284')}</div>
                                                <div className="flex flex-wrap gap-3">
                                                    {tGroup('HAB_DELAI_ANNULATION', HAB_DELAI_ANNULATION).map((d) => (
                                                        <label key={d.id} className="cursor-pointer">
                                                            <input type="radio" value={d.id} {...register("habDelaiAnnulation")} className="peer sr-only" />
                                                            <div className="px-4 py-2 border-2 border-gray-200 rounded-full text-sm font-bold text-gray-700 peer-checked:border-[#00BFA6] peer-checked:bg-[#00BFA6]/10 peer-checked:text-[#00BFA6] transition-all bg-white">{d.label}</div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-700 mb-2">{t('f285')}</div>
                                                <div className="flex flex-wrap gap-3">
                                                    {tGroup('HAB_NON_RESPECT', HAB_NON_RESPECT).map((n) => (
                                                        <label key={n.id} className="cursor-pointer">
                                                            <input type="radio" value={n.id} {...register("habNonRespect")} className="peer sr-only" />
                                                            <div className="px-4 py-2 border-2 border-gray-200 rounded-full text-sm font-bold text-gray-700 peer-checked:border-orange-400 peer-checked:bg-orange-50 peer-checked:text-orange-700 transition-all bg-white">{n.label}</div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Frais annexes */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl space-y-3">
                                        <div className="font-bold text-gray-900">{t('f286')}</div>
                                        <div className="flex gap-3">
                                            <label className="cursor-pointer flex-1">
                                                <input type="radio" value="false" {...register("habCaution")} className="peer sr-only" />
                                                <div className="p-2 border-2 border-gray-200 rounded-xl text-center text-sm font-bold text-gray-700 peer-checked:border-gray-500 peer-checked:bg-gray-100 transition-all bg-white">{t('f019')}</div>
                                            </label>
                                            <label className="cursor-pointer flex-1">
                                                <input type="radio" value="true" {...register("habCaution")} className="peer sr-only" />
                                                <div className="p-2 border-2 border-gray-200 rounded-xl text-center text-sm font-bold text-gray-700 peer-checked:border-[#00BFA6] peer-checked:bg-green-50 peer-checked:text-[#00BFA6] transition-all bg-white">{t('f018')}</div>
                                            </label>
                                        </div>
                                        {habCaution && (
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1">{t('f287')}</label>
                                                <input {...register("habCautionMontant")} type="text" className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-sm" placeholder={t('f403')} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="bg-white border-2 border-gray-200 p-4 rounded-xl space-y-3">
                                        <div className="font-bold text-gray-900">{t('f288')}</div>
                                        <div className="flex gap-3">
                                            <label className="cursor-pointer flex-1">
                                                <input type="radio" value="INCLUS" {...register("habFraisMenage")} className="peer sr-only" />
                                                <div className="p-2 border-2 border-gray-200 rounded-xl text-center text-sm font-bold text-gray-700 peer-checked:border-[#00BFA6] peer-checked:bg-green-50 peer-checked:text-[#00BFA6] transition-all bg-white">{t('f289')}</div>
                                            </label>
                                            <label className="cursor-pointer flex-1">
                                                <input type="radio" value="SUPPLEMENT" {...register("habFraisMenage")} className="peer sr-only" />
                                                <div className="p-2 border-2 border-gray-200 rounded-xl text-center text-sm font-bold text-gray-700 peer-checked:border-orange-400 peer-checked:bg-orange-50 peer-checked:text-orange-700 transition-all bg-white">{t('f290')}</div>
                                            </label>
                                        </div>
                                        {habFraisMenage === "SUPPLEMENT" && (
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1">{t('f287')}</label>
                                                <input {...register("habFraisMenageMontant")} type="text" className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-sm" placeholder={t('f404')} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Modes de paiement */}
                                <div className="bg-white border-2 border-gray-200 p-5 rounded-xl space-y-4">
                                    <div className="font-bold text-gray-900">{t('f291')}</div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-600 mb-2">{t('f292')}</div>
                                        <div className="flex flex-wrap gap-3">
                                            {tGroup('HAB_PAIEMENTS_LOCAUX', HAB_PAIEMENTS_LOCAUX).map((p) => (
                                                <label key={p.id} className="cursor-pointer">
                                                    <input type="checkbox" value={p.id} {...register("habPaiements")} className="peer sr-only" />
                                                    <div className="px-4 py-2 border-2 border-gray-200 rounded-full text-sm font-bold text-gray-700 peer-checked:border-[#00BFA6] peer-checked:bg-[#00BFA6]/10 peer-checked:text-[#00BFA6] transition-all bg-white hover:border-gray-300">{p.label}</div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-600 mb-2">{t('f293')}</div>
                                        <div className="flex flex-wrap gap-3">
                                            {tGroup('HAB_PAIEMENTS_INTL', HAB_PAIEMENTS_INTL).map((p) => (
                                                <label key={p.id} className="cursor-pointer">
                                                    <input type="checkbox" value={p.id} {...register("habPaiements")} className="peer sr-only" />
                                                    <div className="px-4 py-2 border-2 border-gray-200 rounded-full text-sm font-bold text-gray-700 peer-checked:border-[#00BFA6] peer-checked:bg-[#00BFA6]/10 peer-checked:text-[#00BFA6] transition-all bg-white hover:border-gray-300">{p.label}</div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Disponibilités */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <CalendarIcon className="h-5 w-5 text-[#00BFA6]" />{t('f294')}</h2>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f295')}</label>
                                        <input {...register("habDureeMin")} type="number" min="1" onKeyDown={(e) => ["-","e","E","+"].includes(e.key) && e.preventDefault()} className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base" placeholder={t('f380')} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">{t('f296')}</label>
                                        <div className="flex gap-2">
                                            {[{ id: "AUCUN", label: t('f031') }, { id: "1_NUIT", label: t('depBuffer1Night') }].map((opt) => (
                                                <label key={opt.id} className="cursor-pointer flex-1">
                                                    <input type="radio" value={opt.id} {...register("habDelaiPreparation")} className="peer sr-only" />
                                                    <div className="p-2 border-2 border-gray-200 rounded-xl text-center text-sm font-bold text-gray-700 peer-checked:border-[#00BFA6] peer-checked:bg-[#00BFA6]/10 peer-checked:text-[#00BFA6] transition-all bg-white">{opt.label}</div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">{t('f297')}</label>
                                        <div className="flex gap-2">
                                            {[{ id: "TOUTE_ANNEE", label: t('depAllYear') }, { id: "SAISONNIER", label: t('depSeasonal') }].map((opt) => (
                                                <label key={opt.id} className="cursor-pointer flex-1">
                                                    <input type="radio" value={opt.id} {...register("habPeriodeOuverture")} className="peer sr-only" />
                                                    <div className="p-2 border-2 border-gray-200 rounded-xl text-center text-sm font-bold text-gray-700 peer-checked:border-[#00BFA6] peer-checked:bg-[#00BFA6]/10 peer-checked:text-[#00BFA6] transition-all bg-white">{opt.label}</div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {habPeriodeOuverture === "SAISONNIER" && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-2">{t('f298')}</label>
                                            <input {...register("habDebutSaison")} type="text" className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base" placeholder={t('f405')} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-2">{t('f299')}</label>
                                            <input {...register("habFinSaison")} type="text" className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900 text-base" placeholder={t('f406')} />
                                        </div>
                                    </div>
                                )}

                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <div className="font-bold text-blue-900 mb-1 text-sm">{t('f300')}</div>
                                    <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                                        <li>{t('f301')}</li>
                                        <li>{t('f302')}</li>
                                        <li>{t('f303')}</li>
                                    </ul>
                                    <p className="text-xs text-blue-700 mt-2 font-medium">{t('f304')}</p>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* Step 5: Prix & Modalités */}
                    {currentStep === 5 && !isHebergementHabitant && (
                        (isIndustrialRentalParticulier || isTerrainRentalParticulier) ? (
                        <div className="w-full max-w-2xl animate-fade-in">
                            <div className="space-y-8">
                                <section className="space-y-6">
                                    <h2 className="text-xl font-bold text-gray-900 border-b pb-2">{t('f305')}</h2>
                                    <div className="relative">
                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f305')}</label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer bg-white border-2 border-gray-200 p-3 rounded-xl hover:border-[#00BFA6] transition-colors flex-1 justify-center group h-[52px]">
                                                <input type="radio" name="availabilityMode" value="IMMEDIATE" checked={availabilityMode === 'IMMEDIATE'} onChange={() => { setAvailabilityMode('IMMEDIATE'); setIsCalendarOpen(false); }} className="accent-[#00BFA6] w-4 h-4" />
                                                <span className="text-gray-900 font-bold text-sm group-hover:text-[#00BFA6]">{t('f306')}</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer bg-white border-2 border-gray-200 p-3 rounded-xl hover:border-[#00BFA6] transition-colors flex-1 justify-center group h-[52px]" onClick={() => { if (availabilityMode === 'DATE') setIsCalendarOpen(!isCalendarOpen); }}>
                                                <input type="radio" name="availabilityMode" value="DATE" checked={availabilityMode === 'DATE'} onChange={() => { setAvailabilityMode('DATE'); setIsCalendarOpen(true); }} className="accent-[#00BFA6] w-4 h-4" />
                                                <span className="text-gray-900 font-bold text-sm group-hover:text-[#00BFA6]">
                                                    {availabilityMode === 'DATE' && availableDate ? format(new Date(availableDate), "dd MMM yyyy", { locale: fr }) : "Date précise"}
                                                </span>
                                            </label>
                                        </div>
                                        {errors.availableDate && <p className="text-red-500 text-sm mt-1">{errors.availableDate.message}</p>}

                                        {availabilityMode === 'DATE' && isCalendarOpen && (
                                            <div className="absolute end-0 top-full mt-2 z-[100] animate-fade-in">
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

                                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
                                        <div className="font-bold text-gray-900">{t('f307')}</div>
                                        <div className="flex gap-4 flex-wrap">
                                            <label className="cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="usine_show_price"
                                                    className="peer sr-only"
                                                    checked={usineShowPrice === true}
                                                    onChange={() => setUsineShowPrice(true)}
                                                />
                                                <div className="px-6 py-3 border-2 rounded-xl font-medium text-gray-600 peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 peer-checked:text-[#00BFA6] transition-all hover:border-gray-400 bg-white">{t('f018')}</div>
                                            </label>
                                            <label className="cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="usine_show_price"
                                                    className="peer sr-only"
                                                    checked={usineShowPrice === false}
                                                    onChange={() => setUsineShowPrice(false)}
                                                />
                                                <div className="px-6 py-3 border-2 rounded-xl font-medium text-gray-600 peer-checked:border-[#00BFA6] peer-checked:bg-green-50/50 peer-checked:text-[#00BFA6] transition-all hover:border-gray-400 bg-white">{t('f019')}</div>
                                            </label>
                                        </div>

                                        {usineShowPrice && (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">{t('f308')}</label>
                                                    <div className="flex flex-col md:flex-row gap-4">
                                                        <div className="relative flex-1">
                                                            <input 
                                                                {...register("price")} dir="ltr"
                                                                type="text"
                                                                onChange={(e) => {
                                                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                                                    const formatted = val.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                                                                    setValue("price", formatted, { shouldValidate: true });
                                                                }}
                                                                className="w-full p-4 pe-32 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all text-gray-900 bg-white font-bold text-lg" 
                                                                placeholder="0"
                                                            />
                                                            <div className="absolute end-2 top-2 bottom-2 flex items-center bg-gray-100 rounded-lg px-2">
                                                                <select 
                                                                    value={currentPriceUnit}
                                                                    onChange={(e) => handlePriceUnitChange(e.target.value as any)}
                                                                    className="bg-transparent border-none focus:ring-0 text-gray-700 font-bold text-sm cursor-pointer outline-none"
                                                                >
                                                                    <option value="DA">{t('curDA')}</option>
                                                                    <option value="DA_M2">{t('f309')}</option>
                                                                    <option value="MILLION">{t('f310')}</option>
                                                                    <option value="MILLION_M2">{t('f311')}</option>
                                                                    <option value="MILLIARD">{t('f312')}</option>
                                                                </select>
                                                            </div>
                                                        </div>

                                                        <div className="flex gap-2">
                                                            <label className="cursor-pointer">
                                                                <input type="radio" value="FIXED" {...register("priceType")} className="peer sr-only" />
                                                                <div className="h-full px-6 flex items-center justify-center border-2 rounded-xl font-bold text-gray-600 peer-checked:border-[#00BFA6] peer-checked:text-[#00BFA6] peer-checked:bg-green-50 transition-all hover:border-gray-300 bg-white min-w-[100px]">{t('f313')}</div>
                                                            </label>
                                                            <label className="cursor-pointer">
                                                                <input type="radio" value="NEGOTIABLE" {...register("priceType")} className="peer sr-only" />
                                                                <div className="h-full px-6 flex items-center justify-center border-2 rounded-xl font-bold text-gray-600 peer-checked:border-[#00BFA6] peer-checked:text-[#00BFA6] peer-checked:bg-green-50 transition-all hover:border-gray-300 bg-white min-w-[120px]">{t('f314')}</div>
                                                            </label>
                                                        </div>
                                                    </div>
                                                    {priceCentimes && (
                                                        <p className="text-[#00BFA6] text-sm mt-2 font-medium flex items-center gap-1">
                                                            <Info className="h-4 w-4" /> {priceCentimes}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </div>
                        </div>
                        ) : (
                        <div className="w-full max-w-2xl animate-fade-in">
                            <div className="space-y-8">
                                {/* Prix & Unité */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">{t('f315')}</h3>
                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                                {transactionType === 'RENTAL' ? (propertyType === "IMMEUBLE_RESIDENTIEL" ? t('adBuildingRent') : t('adMonthlyRent')) : t('adSalePrice')}
                                            </label>
                                            <div className="flex flex-col md:flex-row gap-4">
                                                <div className="relative flex-1">
                                                    <input 
                                                        {...register("price")} dir="ltr"
                                                        type="text"
                                                        onChange={(e) => {
                                                            const val = e.target.value.replace(/[^0-9]/g, '');
                                                            const formatted = val.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                                                            setValue("price", formatted, { shouldValidate: true });
                                                        }}
                                                        className="w-full p-4 pe-32 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all text-gray-900 bg-white font-bold text-lg" 
                                                        placeholder="0"
                                                    />
                                                    <div className="absolute end-2 top-2 bottom-2 flex items-center bg-gray-100 rounded-lg px-2">
                                                        <select 
                                                            value={currentPriceUnit}
                                                            onChange={(e) => handlePriceUnitChange(e.target.value as any)}
                                                            className="bg-transparent border-none focus:ring-0 text-gray-700 font-bold text-sm cursor-pointer outline-none"
                                                        >
                                                            <option value="DA">{t('curDA')}</option>
                                                            <option value="DA_M2">{t('f309')}</option>
                                                            <option value="MILLION">{t('f310')}</option>
                                                            <option value="MILLION_M2">{t('f311')}</option>
                                                            <option value="MILLIARD">{t('f312')}</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                
                                                {/* Type de prix - Inline */}
                                                <div className="flex gap-2">
                                                    <label className="cursor-pointer">
                                                        <input type="radio" value="FIXED" {...register("priceType")} className="peer sr-only" />
                                                        <div className="h-full px-6 flex items-center justify-center border-2 rounded-xl font-bold text-gray-600 peer-checked:border-[#00BFA6] peer-checked:text-[#00BFA6] peer-checked:bg-green-50 transition-all hover:border-gray-300 bg-white min-w-[100px]">{t('f313')}</div>
                                                    </label>
                                                    <label className="cursor-pointer">
                                                        <input type="radio" value="NEGOTIABLE" {...register("priceType")} className="peer sr-only" />
                                                        <div className="h-full px-6 flex items-center justify-center border-2 rounded-xl font-bold text-gray-600 peer-checked:border-[#00BFA6] peer-checked:text-[#00BFA6] peer-checked:bg-green-50 transition-all hover:border-gray-300 bg-white min-w-[120px]">{t('f314')}</div>
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
                                            <FileText className="text-[#00BFA6]" />{t('f316')}</h2>

                                        {/* Usage croisé résidentiel <-> bureaux et commerces, sans créer ni gérer de doublon */}
                                        {!isCommercialPropertyType ? (
                                            <label className="flex items-start gap-3 cursor-pointer p-4 border-2 border-gray-200 rounded-xl hover:border-[#00BFA6] transition-colors bg-white max-w-xl">
                                                <input type="checkbox" {...register("acceptsCrossUsage")} className="accent-[#00BFA6] w-5 h-5 mt-0.5 shrink-0" />
                                                <span>
                                                    <span className="font-bold text-gray-900 text-sm block">{t('f317')}</span>
                                                    <span className="text-xs text-gray-500">{t('f318')}</span>
                                                </span>
                                            </label>
                                        ) : (
                                            <label className="flex items-start gap-3 cursor-pointer p-4 border-2 border-gray-200 rounded-xl hover:border-[#00BFA6] transition-colors bg-white max-w-xl">
                                                <input type="checkbox" {...register("acceptsCrossUsage")} className="accent-[#00BFA6] w-5 h-5 mt-0.5 shrink-0" />
                                                <span>
                                                    <span className="font-bold text-gray-900 text-sm block">{t('f319')}</span>
                                                    <span className="text-xs text-gray-500">{t('f320')}</span>
                                                </span>
                                            </label>
                                        )}

                                        <div className="space-y-6">
                                            {/* Caution & Charges & Disponibilité Group */}
                                            <div className="flex flex-col gap-6">
                                                <div className="flex items-end gap-4 flex-wrap md:flex-nowrap">
                                                    {/* Caution */}
                                                    <div className="w-32 flex-shrink-0">
                                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f321')}</label>
                                                        <input 
                                                            {...register("depositMonths")} 
                                                            type="number" 
                                                            min="0"
                                                            onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                                                            className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#00BFA6] focus:border-[#00BFA6] font-medium text-gray-900" 
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
                                                            <span className="font-bold text-gray-900 text-sm">{t('f322')}</span>
                                                        </label>
                                                    </div>

                                                    {/* Disponibilité */}
                                                    <div className="flex-1 relative">
                                                        <label className="block text-sm font-bold text-gray-900 mb-2">{t('f305')}</label>
                                                        <div className="flex gap-4">
                                                            <label className="flex items-center gap-2 cursor-pointer bg-white border-2 border-gray-200 p-3 rounded-xl hover:border-[#00BFA6] transition-colors flex-1 justify-center group h-[52px]">
                                                                <input type="radio" name="availabilityMode" value="IMMEDIATE" checked={availabilityMode === 'IMMEDIATE'} onChange={() => { setAvailabilityMode('IMMEDIATE'); setIsCalendarOpen(false); }} className="accent-[#00BFA6] w-4 h-4" />
                                                                <span className="text-gray-900 font-bold text-sm group-hover:text-[#00BFA6]">{t('f306')}</span>
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
                                                            <div className="absolute end-0 top-full mt-2 z-[100] animate-fade-in">
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

                                        </div>
                                    </section>
                                )}

                                {transactionType === "SALE" && (
                                    <section className="space-y-6 pt-6 border-t">
                                        <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                            <FileText className="text-[#00BFA6]" />{t('f323')}</h2>
                                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-900 mb-3">{t('f324')}</label>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                    <label className="cursor-pointer">
                                                        <input type="radio" value="YES" {...register("acceptsBankCredit")} className="peer sr-only" />
                                                        <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-700 peer-checked:border-[#00BFA6] peer-checked:bg-[#00BFA6]/10 peer-checked:text-[#00BFA6] transition-all bg-white text-center">{t('f018')}</div>
                                                    </label>
                                                    <label className="cursor-pointer">
                                                        <input type="radio" value="NO" {...register("acceptsBankCredit")} className="peer sr-only" />
                                                        <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-700 peer-checked:border-[#00BFA6] peer-checked:bg-[#00BFA6]/10 peer-checked:text-[#00BFA6] transition-all bg-white text-center">{t('f019')}</div>
                                                    </label>
                                                    <label className="cursor-pointer">
                                                        <input type="radio" value="NO_PREFERENCE" {...register("acceptsBankCredit")} className="peer sr-only" />
                                                        <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-700 peer-checked:border-[#00BFA6] peer-checked:bg-[#00BFA6]/10 peer-checked:text-[#00BFA6] transition-all bg-white text-center">{t('f325')}</div>
                                                    </label>
                                                </div>
                                                {errors.acceptsBankCredit && <p className="text-red-500 text-sm mt-1">{errors.acceptsBankCredit.message as any}</p>}
                                            </div>
                                        </div>
                                    </section>
                                )}

                                {transactionType === "SALE" && (
                                    <section className="space-y-6 pt-2">
                                        <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                            <FileText className="text-[#00BFA6]" />{t('f326')}</h2>
                                        <div className="flex flex-wrap gap-3">
                                            {[
                                                { id: "ACTE_PROPRIETE", label: "Acte de propriété" },
                                                { id: "LIVRET_FONCIER", label: "Livret foncier" },
                                                { id: "CERTIFICAT_CONFORMITE", label: "Certificat de conformité" },
                                            ].map((d) => (
                                                <label key={d.id} className="cursor-pointer">
                                                    <input type="checkbox" value={d.id} {...register("legalDocuments")} className="peer sr-only" />
                                                    <div className="px-4 py-2 border-2 border-gray-200 rounded-full text-sm font-bold text-gray-700 peer-checked:border-[#00BFA6] peer-checked:bg-[#00BFA6]/10 peer-checked:text-[#00BFA6] transition-all bg-white hover:border-gray-300">
                                                        {d.label}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                        {errors.legalDocuments && <p className="text-red-500 text-sm mt-1">{errors.legalDocuments.message as any}</p>}
                                    </section>
                                )}
                            </div>
                        </div>
                        )
                    )}

                    {/* Step 6: Informations et Contact */}
                    {currentStep === 6 && (
                        <div className="w-full max-w-4xl animate-fade-in">
                            <div className="space-y-8">
                                {/* Informations de l'annonce */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <FileText className="text-[#00BFA6]" />{t('f327')}</h3>
                                    
                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                                {t('depCatchTitle')} <span className="text-gray-400 font-normal">{t('f328')}</span>
                                            </label>
                                            <input 
                                                type="text" 
                                                {...register("title")}
                                                placeholder={t('f407')} 
                                                className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all text-gray-900 placeholder:text-gray-500 bg-white font-medium"
                                            />
                                            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                                {t('depShortDesc')} <span className="text-gray-400 font-normal">{t('f328')}</span>
                                            </label>
                                            <textarea 
                                                {...register("shortDescription")}
                                                rows={4}
                                                placeholder={t('f408')} 
                                                className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all text-gray-900 placeholder:text-gray-500 bg-white resize-none font-medium"
                                            ></textarea>
                                            {errors.shortDescription && <p className="text-red-500 text-sm mt-1">{errors.shortDescription.message}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Contacts */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <Phone className="text-[#00BFA6]" />{t('f329')}</h3>
                                    <p className="text-gray-600 mb-4 text-sm">{t('f330')}</p>

                                    {/* Option to use profile phone if not already used */}
                                    {userProfilePhone && contacts[0]?.phone !== normalizeDzPhoneToIntlDigits(userProfilePhone) && (
                                        <div className="mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center justify-between animate-fade-in">
                                            <div>
                                                <p className="font-bold text-blue-900 text-sm">Numéro de votre profil ({userProfilePhone})</p>
                                                <p className="text-blue-700 text-xs">{t('f331')}</p>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    const newContacts = [...contacts]
                                                    newContacts[0] = { ...newContacts[0], phone: normalizeDzPhoneToIntlDigits(userProfilePhone) }
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
                                                        {index === 0 ? t('adPrimaryNumber') : t('adOtherNumber')}
                                                    </label>
                                                    <div className="relative">
                                                        <PhoneInput
                                                            country={'dz'}
                                                            value={contact.phone}
                                                            onChange={(value, country: any) => {
                                                                const dial = country?.dialCode ? String(country.dialCode) : ""
                                                                const rawDigits = String(value || "").replace(/\D/g, "")
                                                                let normalized = rawDigits
                                                                if (dial) {
                                                                    if (!normalized.startsWith(dial)) {
                                                                        normalized = dial + normalized.replace(/^0+/, "")
                                                                    }
                                                                    if (normalized.startsWith(dial + "0")) {
                                                                        normalized = dial + normalized.slice(dial.length + 1)
                                                                    }
                                                                }
                                                                updateContact(index, 'phone', normalized)
                                                            }}
                                                            enableSearch={true}
                                                            countryCodeEditable={false}
                                                            prefix="+"
                                                            containerClass="!w-full"
                                                            inputClass="!w-full !h-[58px] !pl-[72px] !pr-4 !py-4 !border-gray-300 !rounded-xl focus:!ring-2 focus:!ring-[#00BFA6] !bg-white !text-gray-900 !font-bold !text-base !outline-none"
                                                            buttonClass="!border-gray-300 !rounded-l-xl !bg-white !hover:bg-gray-50 !pl-2 !w-[60px]"
                                                            dropdownClass="!shadow-xl !rounded-xl !border-gray-200 !mt-2 !z-50 !bg-white !text-gray-900"
                                                            searchClass="!p-2 !border-b !border-gray-100 !bg-white !text-gray-900"
                                                            placeholder="550..."
                                                        />
                                                    </div>
                                                    {index === 0 && userProfilePhone && contact.phone === normalizeDzPhoneToIntlDigits(userProfilePhone) && (
                                                        <div className="mt-2 flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded-lg text-xs font-bold border border-green-100">
                                                            <div className="h-2 w-2 rounded-full bg-green-500"></div>{t('f332')}</div>
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
                                                        <span className="font-medium text-gray-700 text-sm">{t('f333')}</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded-lg border border-gray-200 hover:border-[#7360f2] transition-colors">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={contact.hasViber}
                                                            onChange={(e) => updateContact(index, 'hasViber', e.target.checked)}
                                                            className="accent-[#7360f2] w-4 h-4" 
                                                        />
                                                        <span className="font-medium text-gray-700 text-sm">{t('f334')}</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded-lg border border-gray-200 hover:border-[#0088cc] transition-colors">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={contact.hasTelegram}
                                                            onChange={(e) => updateContact(index, 'hasTelegram', e.target.checked)}
                                                            className="accent-[#0088cc] w-4 h-4" 
                                                        />
                                                        <span className="font-medium text-gray-700 text-sm">{t('f335')}</span>
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
                                        <MapPin className="text-[#00BFA6]" />{t('f065')}</h3>
                                    <div className="space-y-6 bg-gray-50 p-6 rounded-xl border border-gray-200">
                                        {/* Wilaya, Commune, Quartier - Inline */}
                                        <div className="flex flex-col md:flex-row gap-4">
                                            <div className="flex-1">
                                                <label className="block text-sm font-bold text-gray-700 mb-2">{t('f336')}</label>
                                                <select {...register("city")} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all text-gray-900 bg-white">
                                                    <option value="">{t('f337')}</option>
                                                    {WILAYAS.map((wilaya) => (
                                                        <option key={wilaya.id} value={wilaya.name}>{wilaya.code} - {geoName(wilaya)}</option>
                                                    ))}
                                                </select>
                                                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
                                            </div>

                                            <div className="flex-1">
                                                <label className="block text-sm font-bold text-gray-700 mb-2">{t('f338')}</label>
                                                <select {...register("commune")} disabled={!selectedCity} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all text-gray-900 bg-white disabled:bg-gray-100 disabled:text-gray-400">
                                                    <option value="">{t('f337')}</option>
                                                    {filteredCommunes.map((commune) => (
                                                        <option key={commune.id} value={commune.name}>{geoName(commune)}</option>
                                                    ))}
                                                </select>
                                                {errors.commune && <p className="text-red-500 text-sm mt-1">{errors.commune.message}</p>}
                                            </div>

                                            <div className="flex-[2]">
                                                <label className="block text-sm font-bold text-gray-700 mb-2">{t('f339')}</label>
                                                <input {...register("address")} type="text" className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all text-gray-900 bg-white" placeholder={t('f409')} />
                                                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">{t('f340')}</label>
                                            <input 
                                                {...register("mapsLink")} 
                                                type="url" 
                                                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00BFA6] outline-none transition-all text-gray-900 bg-white" 
                                                placeholder={t('f410')} 
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
                                            <ImageIcon className="text-[#00BFA6]" />{t('f341')}</h3>
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
                                            <p className="text-xs text-gray-400">{t('f342')}</p>
                                        </div>

                                        {selectedFiles.length > 0 && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
                                                                onClick={() => { setMainPhoto(file); setMainVideo(null) }}
                                                                className={cn(
                                                                    "px-2 py-1 rounded-md text-[10px] font-bold w-full transition-colors",
                                                                    mainPhoto === file ? "bg-[#00BFA6] text-white" : "bg-white text-gray-900 hover:bg-gray-100"
                                                                )}
                                                            >
                                                                {mainPhoto === file ? t('adCover') : t('adSetCover')}
                                                            </button>
                                                            
                                                            <div className="flex gap-2 w-full">
                                                                <button 
                                                                    onClick={() => rotateImage(file)}
                                                                    className="flex-1 bg-white/20 hover:bg-white/40 text-white rounded-lg p-1.5 flex items-center justify-center transition-colors"
                                                                    title={t('f411')}
                                                                >
                                                                    <RotateCw className="h-3 w-3" />
                                                                </button>
                                                                <button 
                                                                    onClick={() => removeFile(idx)}
                                                                    className="flex-1 bg-red-500/80 hover:bg-red-600 text-white rounded-lg p-1.5 flex items-center justify-center transition-colors"
                                                                    title={t('f412')}
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
                                            <VideoIcon className="text-[#00BFA6]" />{t('f343')}</h3>
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
                                            <p className="text-xs text-gray-400">{t('f344')}</p>
                                        </div>

                                        {selectedVideos.length > 0 && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {selectedVideos.map((file, idx) => (
                                                    <div key={idx} className={cn(
                                                        "relative bg-black rounded-lg overflow-hidden border-2 aspect-video group",
                                                        mainVideo === file ? "border-[#00BFA6] ring-2 ring-[#00BFA6] ring-offset-2" : "border-gray-200"
                                                    )}>
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
                                                        <button
                                                            onClick={() => { setMainVideo(file); setMainPhoto(null) }}
                                                            className={cn(
                                                                "absolute top-2 left-2 px-2 py-1 rounded-md text-[10px] font-bold transition-colors",
                                                                mainVideo === file ? "bg-[#00BFA6] text-white" : "bg-white/90 text-gray-900 opacity-0 group-hover:opacity-100 hover:bg-white"
                                                            )}
                                                        >
                                                            {mainVideo === file ? t('adCover') : t('adSetCover')}
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
                                            Organiser les photos
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                /* Étape 2: Organisation par catégorie */
                                <div className="space-y-8">
                                    <p className="text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-200">{t('f345')}</p>

                                    <DragDropContext onDragEnd={handleDragEnd}>
                                        {photoCategories.map((category) => (
                                            <div key={category.id} className={cn("border rounded-xl p-6", category.id === "non_classees" ? "bg-blue-50 border-blue-200" : "bg-gray-50")}>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <category.icon className="h-6 w-6 text-[#00BFA6]" />
                                                    <h3 className="text-lg font-bold text-gray-700">{photoCatLabel(category.id, category.label)}</h3>
                                                    <span className="text-sm text-gray-500 ml-auto bg-white px-3 py-1 rounded-full border border-gray-200">
                                                        {category.photos.length} photo(s)
                                                    </span>
                                                </div>

                                                {/* Menu pour déplacer vers d'autres catégories — au-dessus des photos pour rester visible même avec beaucoup de photos */}
                                                {category.photos.length > 0 && selectedPhotos.some(p => category.photos.includes(p)) && (
                                                    <div className="mb-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                                                        <p className="text-sm font-bold text-gray-700 mb-3">{t('f346')}</p>
                                                        <div className="flex gap-2 flex-wrap">
                                                            {photoCategories
                                                                .filter(c => c.id !== category.id)
                                                                .map(targetCat => (
                                                                    <button
                                                                        key={targetCat.id}
                                                                        onClick={() => moveSelectedPhotos(targetCat.id)}
                                                                        className="text-sm px-4 py-2 bg-gray-50 border border-gray-300 rounded-full text-gray-800 hover:bg-[#00BFA6] hover:text-white hover:border-[#00BFA6] transition-all font-bold"
                                                                    >
                                                                        {photoCatLabel(targetCat.id, targetCat.label)}
                                                                    </button>
                                                                ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <Droppable droppableId={category.id} direction="horizontal">
                                                    {(provided) => (
                                                        <div 
                                                            ref={provided.innerRef}
                                                            {...provided.droppableProps}
                                                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 min-h-[120px]"
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
                                            </div>
                                        ))}
                                    </DragDropContext>

                                    <div className="flex justify-between pt-4">
                                        <Button 
                                            onClick={() => setPhotoOrganizationStep("upload")}
                                            variant="outline"
                                            className="px-8 py-3 border-gray-300 text-gray-600 hover:bg-gray-50"
                                        >
                                            {t("backToUpload")}
                                        </Button>
                                        <Button
                                            onClick={handleSubmit(onSubmit as any, (errors) => {
                                                console.error("Erreurs de validation:", errors);
                                                // Pour un champ de type tableau (cases à cocher), react-hook-form range l'erreur sous
                                                // forme de tableau (le message réel est sur l'un des éléments, pas sur le tableau lui-
                                                // même) — sans ce repli, ça affichait juste "undefined".
                                                const lines = Object.entries(errors).map(([key, err]: [string, any]) => {
                                                    const message = err?.message
                                                        || err?.root?.message
                                                        || (Array.isArray(err) ? err.find((e: any) => e?.message)?.message : undefined)
                                                        || "Champ invalide"
                                                    return `- ${key}: ${message}`
                                                });
                                                alert(`${t("fixErrorsPrefix")}\n${lines.join('\n')}`);
                                            })}
                                            disabled={isSubmitting}
                                            className="bg-[#00BFA6] hover:bg-[#00908A] text-white px-8 py-3 text-lg font-bold"
                                        >
                                            {isSubmitting ? t("publishing") : t("publishListing")}
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
                            {t("continueBtn")}
                        </Button>
                    )}
                    {currentStep === 5 && (
                        <Button onClick={handlePriceSubmit} className="bg-[#00BFA6] hover:bg-[#00908A] text-white rounded-full px-8 py-6 text-lg font-bold shadow-lg shadow-[#00BFA6]/20 transition-all">
                            {t("continueBtn")}
                        </Button>
                    )}
                    {currentStep === 6 && (
                        <Button onClick={handleLocationAndContactsSubmit} className="bg-[#00BFA6] hover:bg-[#00908A] text-white rounded-full px-8 py-6 text-lg font-bold shadow-lg shadow-[#00BFA6]/20 transition-all">
                            {t("continueBtn")}
                        </Button>
                    )}
                    </div>
                )}
            </div>
        </div>
    </div>
  )
}

export default DepositPageComponent
