// Configuration du module "Confier votre recherche" — dynamique par branche immobilière

export const RESEARCH_BRANCHES = [
  { id: "RESIDENTIEL", label: "Résidentiel", iconName: "Home" },
  { id: "INDUSTRIEL", label: "Industriel", iconName: "Factory" },
  { id: "HOTELIER", label: "Hôtelier", iconName: "Hotel" },
  { id: "BUREAUX_COMMERCES", label: "Bureaux et Commerces", iconName: "Briefcase" },
  { id: "TERRAIN_FONCIER", label: "Terrains et Foncier", iconName: "Trees" },
] as const;

export type ResearchBranchId = typeof RESEARCH_BRANCHES[number]["id"];

// Type de bien recherché, par branche
export const RESEARCH_PROPERTY_TYPES: Record<ResearchBranchId, { id: string; label: string }[]> = {
  RESIDENTIEL: [
    { id: "STUDIO", label: "Studio" },
    { id: "APPARTEMENT_SIMPLEX", label: "Appartement Simplex" },
    { id: "APPARTEMENT_DUPLEX_TRIPLEX", label: "Appartement Duplex / Triplex" },
    { id: "NIVEAU_VILLA", label: "Niveau de Villa" },
    { id: "VILLA_INDIVIDUELLE_JUMELEE", label: "Villa individuelle / Jumelée" },
    { id: "IMMEUBLE_COMPLET", label: "Immeuble complet" },
  ],
  INDUSTRIEL: [
    { id: "ENTREPOT", label: "Entrepôt" },
    { id: "USINE", label: "Usine" },
    { id: "LOCAL_ACTIVITE", label: "Local d'activité" },
    { id: "CENTRE_LOGISTIQUE", label: "Centre logistique" },
    { id: "CHAMBRE_FROIDE", label: "Chambre froide" },
    { id: "AUTRE", label: "Autre" },
  ],
  BUREAUX_COMMERCES: [
    { id: "BUREAU_FERME", label: "Bureau fermé" },
    { id: "OPEN_SPACE", label: "Open space" },
    { id: "LOCAL_COMMERCIAL", label: "Local commercial" },
    { id: "BOUTIQUE", label: "Boutique" },
    { id: "RESTAURANT_CAFE", label: "Restaurant / Café" },
    { id: "SHOWROOM", label: "Showroom" },
    { id: "AUTRE", label: "Autre" },
  ],
  TERRAIN_FONCIER: [
    { id: "TERRAIN_CONSTRUCTIBLE", label: "Terrain constructible" },
    { id: "TERRAIN_AGRICOLE", label: "Terrain agricole" },
    { id: "FONCIER_INDUSTRIEL", label: "Foncier industriel" },
    { id: "TERRAIN_VIABILISE", label: "Terrain viabilisé" },
    { id: "TERRAIN_NON_VIABILISE", label: "Terrain non viabilisé" },
  ],
  HOTELIER: [
    { id: "HOTEL", label: "Hôtel" },
    { id: "COMPLEXE_TOURISTIQUE", label: "Complexe touristique" },
    { id: "BUNGALOW", label: "Bungalow" },
    { id: "RESIDENCE_HOTELIERE", label: "Résidence hôtelière" },
    { id: "AUTRE", label: "Autre" },
  ],
};

// Interlocuteurs souhaités, par branche
export const RESEARCH_INTERLOCUTORS: Record<ResearchBranchId, { id: string; label: string }[]> = {
  RESIDENTIEL: [
    { id: "PARTICULIER", label: "Particulier" },
    { id: "AGENCE_IMMOBILIERE", label: "Agence immobilière" },
    { id: "PROMOTEUR_IMMOBILIER", label: "Promoteur immobilier" },
  ],
  INDUSTRIEL: [
    { id: "PARTICULIER", label: "Particulier" },
    { id: "AGENCE_IMMOBILIERE", label: "Agence immobilière" },
    { id: "PROFESSIONNEL_INDUSTRIE_LOGISTIQUE", label: "Professionnel de l'industrie / Logistique" },
  ],
  BUREAUX_COMMERCES: [
    { id: "PARTICULIER", label: "Particulier" },
    { id: "AGENCE_IMMOBILIERE", label: "Agence immobilière" },
    { id: "PROFESSIONNEL_IMMOBILIER_ENTREPRISE", label: "Professionnel de l'immobilier d'entreprise" },
  ],
  TERRAIN_FONCIER: [
    { id: "PARTICULIER", label: "Particulier" },
    { id: "AGENCE_IMMOBILIERE", label: "Agence immobilière" },
    { id: "PROMOTEUR_AMENAGEUR_FONCIER", label: "Promoteur / Aménageur foncier" },
  ],
  HOTELIER: [
    { id: "PARTICULIER", label: "Particulier" },
    { id: "AGENCE_IMMOBILIERE", label: "Agence immobilière" },
    { id: "PROFESSIONNEL_HOTELLERIE_TOURISME", label: "Professionnel de l'hôtellerie / tourisme" },
  ],
};

// Options additionnelles pour les critères spécifiques
export const OUTDOOR_SPACE_OPTIONS = [
  { id: "JARDIN", label: "Jardin" },
  { id: "TERRASSE", label: "Terrasse" },
  { id: "BALCON", label: "Balcon" },
];

export const PROXIMITY_OPTIONS = [
  { id: "TRANSPORTS", label: "Proximité transports" },
  { id: "ECOLES", label: "Proximité écoles" },
  { id: "COMMERCES", label: "Proximité commerces" },
];

export const BUREAUX_EQUIPMENT_OPTIONS = [
  { id: "CLIMATISATION", label: "Climatisation" },
  { id: "CABLAGE_RESEAU", label: "Câblage réseau" },
  { id: "ACCES_PMR", label: "Accès PMR" },
];

export const VIABILISATION_OPTIONS = [
  { id: "EAU", label: "Eau" },
  { id: "ELECTRICITE", label: "Électricité" },
  { id: "TOUT_A_LEGOUT", label: "Tout-à-l'égout" },
  { id: "INTERNET", label: "Internet" },
];

// Équipements génériques pour l'Hôtelier (en attendant le formulaire détaillé dédié)
export const HOTELIER_EQUIPMENT_OPTIONS = [
  { id: "PISCINE", label: "Piscine" },
  { id: "RESTAURANT", label: "Restaurant" },
  { id: "SPA", label: "Spa / Centre de bien-être" },
  { id: "PARKING", label: "Parking" },
  { id: "SALLE_CONFERENCE", label: "Salle de conférence" },
];

// --- Fiche détaillée "Résidentiel — Achat / Habitation" ---

export const SITUATION_OPTIONS = [
  { id: "RESIDENT_NATIONAL", label: "Résident national" },
  { id: "DIASPORA", label: "Membre de la diaspora (résident à l'étranger)" },
];

export const ACHAT_INTERLOCUTOR_OPTIONS = [
  { id: "PROMOTEUR_IMMOBILIER", label: "Promoteur immobilier" },
  { id: "AGENCE_IMMOBILIERE", label: "Agence immobilière" },
  { id: "PARTICULIER", label: "Particulier" },
  { id: "PEU_IMPORTE", label: "Peu importe" },
];

export const REALISATION_STAGE_OPTIONS = [
  { id: "FINI", label: "Bien fini (Clé en main)", description: "Prêt à habiter ou à louer immédiatement." },
  { id: "EN_FINALISATION", label: "En cours de finalisation", description: "Travaux avancés (finitions, équipements), emménagement à court terme." },
  { id: "SUR_PLAN", label: "Projet sur plan (VSP)", description: "Prix préférentiels avant lancement et choix de l'étage/vue." },
];

export const DELIVERY_STATE_OPTIONS = [
  { id: "VIDE", label: "Vide", description: "Prêt à être aménagé par vos soins." },
  { id: "MEUBLE", label: "Meublé / Semi-meublé", description: "Prêt à vivre avec mobilier et équipements inclus." },
  { id: "PEU_IMPORTE", label: "Peu importe" },
];

export const ACHAT_DESTINATION_OPTIONS = [
  { id: "HABITATION", label: "Habitation" },
  { id: "COMMERCIAL", label: "Commercial" },
  { id: "MIXTE", label: "Mixte (Habitation & Commercial)" },
];

// Étage(s) applicable seulement si Appartement Simplex/Duplex-Triplex ou Niveau de Villa
export const FLOOR_APPLICABLE_TYPES = ["STUDIO", "APPARTEMENT_SIMPLEX", "APPARTEMENT_DUPLEX_TRIPLEX", "NIVEAU_VILLA"];

export const FLOOR_PREFERENCE_OPTIONS = [
  { id: "RDC", label: "Rez-de-chaussée (RDC)" },
  { id: "RDC_SURELEVE", label: "RDC surélevé" },
  { id: "ENTRESOL", label: "Entre-sol" },
  { id: "ETAGE_INTERMEDIAIRE", label: "Étage intermédiaire" },
  { id: "DERNIER_ETAGE", label: "Dernier étage / Attique" },
  { id: "PEU_IMPORTE", label: "Peu importe" },
];

export const APARTMENTS_PER_FLOOR_OPTIONS = [
  { id: "UN_SEUL", label: "1 seul (Privatisation)" },
  { id: "DEUX", label: "2 par palier" },
  { id: "TROIS_QUATRE", label: "3 à 4" },
  { id: "CINQ_HUIT", label: "5 à 8" },
  { id: "JUSQUA_DOUZE", label: "Jusqu'à 12" },
  { id: "PEU_IMPORTE", label: "Peu importe" },
];

export const ORIENTATION_OPTIONS = [
  { id: "SUD", label: "Plein Sud" },
  { id: "EST", label: "Est" },
  { id: "OUEST", label: "Ouest" },
  { id: "NORD", label: "Nord" },
  { id: "PEU_IMPORTE", label: "Peu importe" },
];

export const VIEW_OPTIONS = [
  { id: "SANS_VIS_A_VIS", label: "Sans vis-à-vis (priorité absolue)" },
  { id: "VUE_DEGAGEE", label: "Vue dégagée" },
  { id: "VUE_MER", label: "Vue sur Mer" },
  { id: "VUE_BAIE", label: "Vue sur la Baie" },
  { id: "VUE_MONTAGNE", label: "Vue sur Montagne" },
  { id: "VUE_FORET", label: "Vue sur Forêt" },
  { id: "VUE_GRAND_AXE", label: "Vue sur grand axe (commercial)" },
  { id: "VUE_COUR_JARDIN", label: "Vue sur Cour ou Jardin de la résidence" },
  { id: "PEU_IMPORTE", label: "Peu importe" },
];

export const AIRPORT_PROXIMITY_OPTIONS = [
  { id: "MOINS_15", label: "Moins de 15 min" },
  { id: "MOINS_30", label: "Moins de 30 min" },
  { id: "MOINS_45", label: "Moins de 45 min" },
  { id: "PEU_IMPORTE", label: "Peu importe" },
];

export const CURRENCY_OPTIONS = [
  { id: "DA", label: "DA" },
  { id: "EUR", label: "€" },
  { id: "USD", label: "$" },
];

export const FINANCING_OPTIONS = [
  { id: "CASH", label: "Autofinancement (Cash)" },
  { id: "CREDIT", label: "Crédit immobilier" },
  { id: "MIXTE", label: "Mixte" },
];

export const ENVIRONMENT_OPTIONS = [
  { id: "PROMOTION_IMMOBILIERE", label: "Promotion immobilière" },
  { id: "RESIDENCE_CLOTUREE", label: "Résidence clôturée" },
  { id: "QUARTIER_CLASSIQUE", label: "Quartier classique" },
];

export const RESIDENCE_AMENITIES_OPTIONS = [
  { id: "ASCENSEUR", label: "Ascenseur fonctionnel (impératif si étage élevé)" },
  { id: "PISCINE", label: "Piscine dans la résidence / l'immeuble" },
  { id: "SALLE_SPORT", label: "Salle de sport / Fitness intégrée" },
  { id: "ESPACE_JEUX_ENFANTS", label: "Espace de jeux extérieur pour enfants sécurisé" },
  { id: "COMMERCES_BAS_IMMEUBLE", label: "Commerces au bas de l'immeuble" },
];

export const PARENTAL_SUITE_OPTIONS = [
  { id: "NON", label: "Non nécessaire" },
  { id: "1", label: "1 suite parentale" },
  { id: "2", label: "2 suites parentales" },
  { id: "3_PLUS", label: "3 suites parentales ou plus" },
];

export const KITCHEN_TYPE_OPTIONS = [
  { id: "OUVERTE", label: "Ouverte (Américaine)" },
  { id: "FERMEE", label: "Fermée" },
  { id: "SEMI_OUVERTE", label: "Semi-ouverte" },
];

export const KITCHEN_EQUIPMENT_OPTIONS = [
  { id: "EQUIPEE", label: "Entièrement équipée (électroménager)" },
  { id: "NON_EQUIPEE", label: "Non équipée" },
];

export const HEATING_OPTIONS = [
  { id: "CENTRAL", label: "Chauffage central (radiateurs)" },
  { id: "INDIVIDUEL", label: "Chauffage individuel" },
];

export const AC_OPTIONS = [
  { id: "CENTRALE", label: "Climatisation centrale" },
  { id: "SPLIT", label: "Climatisation par Split individuel" },
];

export const SECURITY_OPTIONS = [
  { id: "GARDIENNAGE", label: "Gardiennage & Conciergerie 24h/24" },
  { id: "CAMERAS", label: "Caméras de vidéosurveillance" },
  { id: "DIGICODE_BADGE", label: "Accès Digicode / Badge" },
  { id: "GARAGE_AUTOMATIQUE", label: "Garage en sous-sol à ouverture automatique" },
];

export const CONNECTIVITY_OPTIONS = [
  { id: "FIBRE", label: "Fibre optique (Internet Très Haut Débit)" },
  { id: "LIGNE_FIXE", label: "Ligne téléphonique fixe" },
];
