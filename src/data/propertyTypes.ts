export const REAL_ESTATE_CATEGORIES = [
  { id: "HEBERGEMENT", label: "Hébergements et séjours", iconName: "BedDouble" },
  { id: "BUREAUX_COMMERCES", label: "Bureaux et Commerces", iconName: "Building2" },
  { id: "HOTELIER", label: "Immobiliers Hôteliers", iconName: "Hotel" },
  { id: "EVENEMENTIEL", label: "Immobiliers Évènementiels", iconName: "Tent" },
  { id: "INDUSTRIEL", label: "Immobiliers Industriels", iconName: "Factory" },
  { id: "RESIDENTIEL", label: "Immobiliers Résidentiels", iconName: "Home" },
];

export const PROPERTY_TYPES = [
  // Résidentiel
  { id: "APPARTEMENT", label: "Appartement", categoryId: "RESIDENTIEL", iconName: "Building" },
  { id: "VILLA", label: "Villa", categoryId: "RESIDENTIEL", iconName: "Home" },
  { id: "STUDIO", label: "Studio", categoryId: "RESIDENTIEL", iconName: "LayoutTemplate" },
  { id: "NIVEAU_VILLA", label: "Niveau de villa", categoryId: "RESIDENTIEL", iconName: "Layers" },
  { id: "DUPLEX", label: "Duplex", categoryId: "RESIDENTIEL", iconName: "Copy" },
  { id: "TRIPLEX", label: "Triplex", categoryId: "RESIDENTIEL", iconName: "Layers" },
  { id: "LOFT", label: "Loft", categoryId: "RESIDENTIEL", iconName: "Maximize" },
  { id: "IMMEUBLE_RESIDENTIEL", label: "Immeuble Résidentiel", categoryId: "RESIDENTIEL", iconName: "Building" },
  { id: "TERRAIN_RESIDENTIEL", label: "Terrain Résidentiel", categoryId: "RESIDENTIEL", iconName: "Trees" },
  
  // Bureaux et Commerces
  { id: "CENTRE_AFFAIRES", label: "Centre d'affaires", categoryId: "BUREAUX_COMMERCES", iconName: "Building2" },
  { id: "BUREAU_FLEXIBLE", label: "Bureau flexible", categoryId: "BUREAUX_COMMERCES", iconName: "Briefcase" },
  { id: "COWORKING", label: "Espace Co-Travail", categoryId: "BUREAUX_COMMERCES", iconName: "Users" },
  { id: "SHOWROOM", label: "Showroom", categoryId: "BUREAUX_COMMERCES", iconName: "Store" },
  { id: "IMMEUBLE_BUREAU", label: "Immeuble Bureau", categoryId: "BUREAUX_COMMERCES", iconName: "Building2" },
  { id: "NIVEAU_VILLA_COMMERCIAL", label: "Niveau de Villa Commercial", categoryId: "BUREAUX_COMMERCES", iconName: "Layers" },
  { id: "VILLA_COMMERCIALE", label: "Villa Commerciale", categoryId: "BUREAUX_COMMERCES", iconName: "Home" },
  { id: "APPARTEMENT_COMMERCIAL", label: "Appartement Commercial", categoryId: "BUREAUX_COMMERCES", iconName: "Building" },
  { id: "LOCAL_COMMERCIAL", label: "Local Commercial", categoryId: "BUREAUX_COMMERCES", iconName: "Store" },

  // Hôteliers
  { id: "HOTEL", label: "Hôtel", categoryId: "HOTELIER", iconName: "Hotel" },
  { id: "COMPLEXE_TOURISTIQUE", label: "Complexe Touristique", categoryId: "HOTELIER", iconName: "Palmtree" },
  { id: "BUNGALOW", label: "Bungalow", categoryId: "HOTELIER", iconName: "Tent" },
  { id: "TERRAIN_HOTELIER", label: "Terrain Hôtelier", categoryId: "HOTELIER", iconName: "Trees" },
  { id: "AUTRE_HOTEL", label: "Autre structure hôtelière", categoryId: "HOTELIER", iconName: "Hotel" },

  // Industriels
  { id: "HANGAR", label: "Hangar", categoryId: "INDUSTRIEL", iconName: "Warehouse" },
  { id: "DEPOT", label: "Dépôt", categoryId: "INDUSTRIEL", iconName: "Container" },
  { id: "USINE", label: "Usine", categoryId: "INDUSTRIEL", iconName: "Factory" },
  { id: "TERRAIN_INDUSTRIEL", label: "Terrain Industriel", categoryId: "INDUSTRIEL", iconName: "LandPlot" },
  { id: "CHAMBRE_FROIDE", label: "Chambre Froide", categoryId: "INDUSTRIEL", iconName: "Snowflake" },
  { id: "CO_STOCKAGE", label: "Co-Stockage", categoryId: "INDUSTRIEL", iconName: "Archive" },
  
  // Hébergements (Updated per user request)
  { id: "HEBERGEMENT_HOTELIER", label: "Hébergement Hôtelier", categoryId: "HEBERGEMENT", iconName: "ConciergeBell" },
  { id: "MAISON_HOTES", label: "Maison d'hôtes", categoryId: "HEBERGEMENT", iconName: "Home" },
  { id: "COMPLEXE_TOURISTIQUE_HEBERGEMENT", label: "Complexe Touristique", categoryId: "HEBERGEMENT", iconName: "Palmtree" },
  
  // Évènementiels
  { id: "SALLE_FETES", label: "Salle des fêtes", categoryId: "EVENEMENTIEL", iconName: "PartyPopper" },
  { id: "SALLE_CONFERENCE", label: "Salle de conférence", categoryId: "EVENEMENTIEL", iconName: "Presentation" },
  { id: "SALLE_FORMATION", label: "Salle de formation", categoryId: "EVENEMENTIEL", iconName: "GraduationCap" },
  { id: "SALLE_DINER", label: "Salle de dîner", categoryId: "EVENEMENTIEL", iconName: "Utensils" },
];
