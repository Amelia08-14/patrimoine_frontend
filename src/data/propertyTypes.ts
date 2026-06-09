export const REAL_ESTATE_CATEGORIES = [
  { id: "RESIDENTIEL", label: "Immobiliers Résidentiels", iconName: "Home" },
  { id: "INDUSTRIEL", label: "Immobiliers Industriels", iconName: "Factory" },
  { id: "TERRAIN_FONCIER", label: "Terrains et Foncier", iconName: "Trees" },
  { id: "EVENEMENTIEL", label: "Immobiliers Évènementiels", iconName: "Tent" },
  { id: "HOTELIER", label: "Immobiliers Hôteliers", iconName: "Hotel" },
  { id: "BUREAUX_COMMERCES", label: "Bureaux et Commerces", iconName: "Building2" },
  { id: "HEBERGEMENT", label: "Hébergements et séjours", iconName: "BedDouble" },
];

export const PROPERTY_TYPES = [
  // Résidentiel
  { id: "APPARTEMENT", label: "Appartement", categoryId: "RESIDENTIEL", iconName: "Building" },
  { id: "VILLA", label: "Villa", categoryId: "RESIDENTIEL", iconName: "Home" },
  { id: "NIVEAU_VILLA", label: "Niveau de villa", categoryId: "RESIDENTIEL", iconName: "Layers" },
  { id: "IMMEUBLE_RESIDENTIEL", label: "Immeuble Résidentiel", categoryId: "RESIDENTIEL", iconName: "Building" },
  { id: "DUPLEX", label: "Duplex", categoryId: "RESIDENTIEL", iconName: "Copy" },
  { id: "TRIPLEX", label: "Triplex", categoryId: "RESIDENTIEL", iconName: "Layers" },
  { id: "STUDIO", label: "Studio", categoryId: "RESIDENTIEL", iconName: "LayoutTemplate" },
  { id: "LOFT", label: "Loft", categoryId: "RESIDENTIEL", iconName: "Maximize" },

  // Terrains et Foncier
  { id: "TERRAIN_RESIDENTIEL", label: "Terrain Résidentiel", categoryId: "TERRAIN_FONCIER", iconName: "Trees" },
  { id: "TERRAIN_INDUSTRIEL", label: "Terrain Industriel", categoryId: "TERRAIN_FONCIER", iconName: "Trees" },
  { id: "TERRAIN_AGRICOLE", label: "Terrain Agricole", categoryId: "TERRAIN_FONCIER", iconName: "Trees" },
  { id: "TERRAIN_TOURISTIQUE", label: "Terrain Touristique", categoryId: "TERRAIN_FONCIER", iconName: "Palmtree" },

  // Bureaux et Commerces
  { id: "APPARTEMENT_COMMERCIAL", label: "Appartement Commercial", categoryId: "BUREAUX_COMMERCES", iconName: "Building" },
  { id: "VILLA_COMMERCIALE", label: "Villa Commerciale", categoryId: "BUREAUX_COMMERCES", iconName: "Home" },
  { id: "NIVEAU_VILLA_COMMERCIAL", label: "Niveau de Villa Commercial", categoryId: "BUREAUX_COMMERCES", iconName: "Layers" },
  { id: "IMMEUBLE_BUREAU", label: "Immeuble Bureau", categoryId: "BUREAUX_COMMERCES", iconName: "Building2" },
  { id: "LOCAL_COMMERCIAL", label: "Local Commercial", categoryId: "BUREAUX_COMMERCES", iconName: "Store" },
  { id: "SHOWROOM", label: "Showroom", categoryId: "BUREAUX_COMMERCES", iconName: "Store" },
  { id: "CENTRE_AFFAIRES", label: "Centre d'affaires", categoryId: "BUREAUX_COMMERCES", iconName: "Building2" },
  { id: "COWORKING", label: "Espace Co-Travail", categoryId: "BUREAUX_COMMERCES", iconName: "Users" },
  { id: "BUREAU_FLEXIBLE", label: "Bureau flexible", categoryId: "BUREAUX_COMMERCES", iconName: "Briefcase" },
  { id: "BLOC_ADMINISTRATIF", label: "Bloc Administratif", categoryId: "BUREAUX_COMMERCES", iconName: "Building2" },

  // Hôteliers
  { id: "HOTEL", label: "Hôtel", categoryId: "HOTELIER", iconName: "Hotel" },
  { id: "COMPLEXE_TOURISTIQUE", label: "Complexe Touristique", categoryId: "HOTELIER", iconName: "Palmtree" },
  { id: "BUNGALOW", label: "Bungalow", categoryId: "HOTELIER", iconName: "Tent" },
  { id: "TERRAIN_HOTELIER", label: "Terrain Hôtelier", categoryId: "HOTELIER", iconName: "Trees" },
  { id: "AUTRE_HOTEL", label: "Autre structure hôtelière", categoryId: "HOTELIER", iconName: "Hotel" },

  // Industriels
  { id: "HANGAR", label: "Hangar", categoryId: "INDUSTRIEL", iconName: "Warehouse" },
  { id: "USINE", label: "Usine", categoryId: "INDUSTRIEL", iconName: "Factory" },
  { id: "CHAMBRE_FROIDE", label: "Chambre Froide", categoryId: "INDUSTRIEL", iconName: "Snowflake" },
  { id: "CO_STOCKAGE", label: "Co-Stockage", categoryId: "INDUSTRIEL", iconName: "Archive" },
  { id: "DEPOT", label: "Dépôt", categoryId: "INDUSTRIEL", iconName: "Archive" },

  // Hébergements
  { id: "HEBERGEMENT_HOTELIER", label: "Hébergement Hôtelier", categoryId: "HEBERGEMENT", iconName: "BedDouble" },
  { id: "MAISON_HOTES", label: "Maison d'hôtes", categoryId: "HEBERGEMENT", iconName: "Home" },
  { id: "COMPLEXE_TOURISTIQUE_HEBERGEMENT", label: "Complexe Touristique", categoryId: "HEBERGEMENT", iconName: "Palmtree" },
  { id: "AUTRE_HEBERGEMENT", label: "Autre hébergement", categoryId: "HEBERGEMENT", iconName: "BedDouble" },

  // Évènementiels
  { id: "SALLE_FETES", label: "Salle des fêtes", categoryId: "EVENEMENTIEL", iconName: "PartyPopper" },
  { id: "SALLE_CONFERENCE", label: "Salle de conférence", categoryId: "EVENEMENTIEL", iconName: "Building2" },
  { id: "SALLE_FORMATION", label: "Salle de formation", categoryId: "EVENEMENTIEL", iconName: "Users" },
  { id: "SALLE_DINER", label: "Salle de dîner", categoryId: "EVENEMENTIEL", iconName: "Utensils" },
];
