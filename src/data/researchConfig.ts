// Configuration du module "Confier votre recherche" — dynamique par branche immobilière

export const RESEARCH_BRANCHES = [
  { id: "RESIDENTIEL", label: "Résidentiel", iconName: "Home" },
  { id: "INDUSTRIEL", label: "Industriel", iconName: "Factory" },
  { id: "HOTELIER", label: "Hébergement & Séjour", iconName: "Hotel" },
  { id: "BUREAUX_COMMERCES", label: "Bureaux et Commerces", iconName: "Briefcase" },
  { id: "TERRAIN_FONCIER", label: "Terrains et Foncier", iconName: "Trees" },
] as const;

export type ResearchBranchId = typeof RESEARCH_BRANCHES[number]["id"];

// Type de bien recherché, par branche
export const RESEARCH_PROPERTY_TYPES: Record<ResearchBranchId, { id: string; label: string }[]> = {
  RESIDENTIEL: [
    { id: "STUDIO", label: "Studio" },
    { id: "APPARTEMENT", label: "Appartement" },
    { id: "DUPLEX", label: "Duplex" },
    { id: "TRIPLEX", label: "Triplex" },
    { id: "VILLA", label: "Villa" },
    { id: "NIVEAU_VILLA", label: "Niveau de Villa" },
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
    { id: "PROMOTEUR_IMMOBILIER", label: "Promoteur immobilier" },
    { id: "AGENCE_IMMOBILIERE", label: "Agence immobilière" },
    { id: "PARTICULIER", label: "Propriétaire particulier" },
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

// Équipements génériques pour l'Hébergement & Séjour (en attendant le formulaire détaillé dédié)
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

// --- Fiche "Résidentiel" (Location et Achat partagent la même fiche) ---

// Types de bien réunis en choix multiple (le studio jusqu'à la villa, plus le niveau de villa
// qui a son propre critère d'entrée ci-dessous) — utilisé par Location ET Achat.
export const RESIDENTIEL_TYPE_IDS = [
  "STUDIO",
  "APPARTEMENT",
  "DUPLEX",
  "TRIPLEX",
  "VILLA",
  "NIVEAU_VILLA",
];

// --- Fiche "Recherche Immeuble d'appartements" (Résidentiel — recherche d'un immeuble entier) ---

export const BUILDING_APARTMENT_STYLE_OPTIONS = [
  { id: "SIMPLEX", label: "Simplex" },
  { id: "DUPLEX", label: "Duplex" },
  { id: "TRIPLEX", label: "Triplex" },
];

// --- Fiches "Bureaux et Commerces" — Bloc Administratif / Bloc Commercial / Local Commercial ---

export const OFFICE_SPACE_TYPE_OPTIONS = [
  { id: "OPEN_SPACE", label: "Open space" },
  { id: "SEPARE_BUREAUX", label: "Séparé en bureaux" },
];

export const OFFICE_ENERGY_OPTIONS = [
  { id: "ELECTRICITE", label: "Électricité" },
  { id: "GAZ", label: "Gaz" },
  { id: "EAU", label: "Eau" },
  { id: "ASSAINISSEMENT", label: "Assainissement" },
];

export const GENERAL_STATE_OPTIONS = [
  { id: "NEUF", label: "Neuf" },
  { id: "BON_ETAT", label: "Bon état" },
  { id: "A_RENOVER", label: "À rénover" },
];

export const ZONE_TYPE_OPTIONS = [
  { id: "COMMERCIAL", label: "Commercial" },
  { id: "RESIDENTIEL", label: "Résidentiel" },
  { id: "INDUSTRIEL", label: "Industriel" },
];

export const VISIBILITY_OPTIONS = [
  { id: "AUTOROUTE", label: "Visible autoroute" },
  { id: "FACADE_COMMERCIALE", label: "Façade commerciale" },
  { id: "PIETONNE", label: "Forte visibilité piétonne" },
  { id: "ROUTIERE", label: "Bonne visibilité routière" },
];

export const LOCAL_STYLE_ETAT_OPTIONS = [
  { id: "MODERNE", label: "Moderne" },
  { id: "CLASSIQUE", label: "Classique" },
  { id: "A_RENOVER", label: "À rénover" },
];

export const LOCAL_ENVIRONMENT_OPTIONS = [
  { id: "GALERIE_MARCHANDE", label: "Galerie marchande" },
  { id: "CENTRE_COMMERCIAL", label: "Centre commercial" },
  { id: "RUE_COMMERCIALE", label: "Rue commerciale" },
  { id: "ZONE_ACTIVITE_COMMERCIALE", label: "Zone d'activité commerciale" },
  { id: "ZONE_INDUSTRIELLE", label: "Zone industrielle" },
  { id: "AUTRE", label: "Autre" },
];

export const LOCAL_USAGE_OPTIONS = [
  { id: "MAGASIN", label: "Magasin" },
  { id: "DEPOT", label: "Dépôt" },
  { id: "BUREAU", label: "Bureau" },
  { id: "SHOWROOM", label: "Showroom" },
  { id: "AUTRE", label: "Autre" },
];

// Critère spécifique affiché uniquement quand "Niveau de Villa" est sélectionné
export const VILLA_LEVEL_ENTRANCE_OPTIONS = [
  { id: "SEPAREE", label: "Entrée séparée" },
  { id: "COMMUNE", label: "Entrée commune" },
];

// Typologie recherchée, exprimée en fourchette "de F? à F?" — le préfixe "F" est affiché une
// seule fois à part (unité), ces libellés ne portent que le chiffre.
export const TYPOLOGY_RANGE_OPTIONS = [
  { id: "F1", label: "1" },
  { id: "F2", label: "2" },
  { id: "F3", label: "3" },
  { id: "F4", label: "4" },
  { id: "F5", label: "5" },
  { id: "F6", label: "6" },
  { id: "F7", label: "7" },
  { id: "F8", label: "8" },
  { id: "F9_PLUS", label: "9+" },
];

// --- Fiche "Confier votre recherche — Hébergement et Séjour" ---

export const HTL_PROFIL_GROUPE_OPTIONS = [
  { id: "FAMILIAL", label: "Exclusivement Familial" },
  { id: "PROFESSIONNEL", label: "Professionnel / Affaires" },
  { id: "GROUPE_AMIS", label: "Groupe d'amis" },
];

export const HTL_CLASSEMENT_OPTIONS = [
  { id: "5", label: "5★" },
  { id: "4", label: "4★" },
  { id: "3", label: "3★" },
  { id: "2", label: "2★" },
  { id: "1", label: "1★" },
];

export const HTL_TYPE_ETABLISSEMENT_OPTIONS = [
  { id: "HOTEL", label: "Hôtel" },
  { id: "COMPLEXE_TOURISTIQUE", label: "Complexe touristique" },
  { id: "APPART_HOTEL", label: "Appart-hôtel" },
  { id: "MOTEL_RELAIS", label: "Motel / Relais" },
  { id: "CAMPING_CLASSE", label: "Camping classé" },
];

export const HTL_FORMULE_OPTIONS = [
  { id: "LOGEMENT_ENTIER", label: "Logement complet / Entier", description: "Accès exclusif à la totalité du logement et de ses équipements." },
  { id: "CHAMBRE_PRIVEE", label: "Chambre privée", description: "Chambre personnelle privative, mais certains espaces (cuisine, salon) sont partagés." },
  { id: "A_LA_PLACE", label: "À la place / Au lit", description: "Location partagée type dortoir ou espace traditionnel." },
];

export const HTL_GAMME_CHAMBRE_OPTIONS = [
  { id: "STANDARD", label: "Standard" },
  { id: "SUITE", label: "Suite" },
  { id: "PREMIUM", label: "Premium / Présidentielle" },
];

export const HTL_TYPE_COUCHAGE_OPTIONS = [
  { id: "LIT_SIMPLE", label: "Lit simple individuel" },
  { id: "LIT_SUPERPOSE", label: "Lit superposé" },
  { id: "MATELAS_SOL", label: "Matelas au sol (Style traditionnel saharien)" },
];

export const HTL_NATURE_BIEN_OPTIONS = [
  { id: "VILLA_NIVEAU", label: "Villa / Niveau de Villa" },
  { id: "APPARTEMENT", label: "Appartement" },
  { id: "STUDIO", label: "Studio" },
  { id: "DUPLEX_TRIPLEX", label: "Duplex / Triplex" },
  { id: "BUNGALOW_CHALET", label: "Bungalow / Chalet" },
  { id: "INSOLITE", label: "Hébergement insolite" },
];

export const HTL_ACCESSIBILITE_OPTIONS = [
  { id: "INDIFFERENT", label: "Indifférent" },
  { id: "PLAIN_PIED", label: "Plain-pied (RDC)" },
  { id: "ETAGE_ASCENSEUR", label: "Étage AVEC ascenseur obligatoire" },
];

export const HTL_AMBIANCE_OPTIONS = [
  { id: "BALNEAIRE", label: "Balnéaire" },
  { id: "URBAIN", label: "Urbain" },
  { id: "SAHARIEN", label: "Saharien" },
  { id: "THERMAL", label: "Thermal" },
  { id: "CLIMATIQUE", label: "Climatique" },
];

export const HTL_BALNEAIRE_OPTIONS = [
  { id: "PLAGE_PRIVEE", label: "Proximité plage privée obligatoirement" },
  { id: "PLAGE_PUBLIQUE", label: "Plage publique acceptée" },
];

export const HTL_URBAIN_OPTIONS = [
  { id: "COMMERCES", label: "Commerces" },
  { id: "RESTAURANTS", label: "Restaurants" },
  { id: "CENTRES_COMMERCIAUX", label: "Centres commerciaux / Souks" },
];

export const HTL_SAHARIEN_OPTIONS = [
  { id: "CIRCUITS_4X4", label: "Circuits 4x4 / Quad" },
  { id: "MEHAREE", label: "Méharée" },
  { id: "BIVOUAC", label: "Bivouac sous les étoiles" },
];

export const HTL_THERMAL_OPTIONS = [
  { id: "SOURCE_PROXIMITE", label: "Source thermale à proximité" },
  { id: "HAMMAM_INTEGRE", label: "Hammam intégré à l'établissement obligatoire" },
];

export const HTL_CLIMATIQUE_OPTIONS = [
  { id: "FORET_MONTAGNE_PIED", label: "Forêt / Montagne accessible à pied" },
  { id: "PISTE_SKI_MATERIEL", label: "Piste de ski + location de matériel" },
];

export const HTL_VUE_OPTIONS = [
  { id: "MER", label: "Vue sur mer" },
  { id: "DUNES_OASIS", label: "Vue sur les Dunes / Oasis" },
  { id: "MONTAGNE", label: "Vue sur montagne" },
  { id: "JARDIN_PISCINE", label: "Vue sur jardin / Piscine" },
  { id: "SANS_IMPORTANCE", label: "Sans importance" },
];

export const HTL_SERVICES_REPAS_OPTIONS = [
  { id: "PETIT_DEJEUNER", label: "Petit-déjeuner inclus" },
  { id: "DEMI_PENSION", label: "Demi-pension / Pension complète" },
  { id: "LINGE_FOURNI", label: "Linge de maison fourni" },
];

export const HTL_CUISINE_OPTIONS = [
  { id: "CUISINE_EQUIPEE", label: "Cuisine équipée autonome" },
  { id: "REFRIGERATEUR", label: "Réfrigérateur" },
  { id: "MICRO_ONDES", label: "Micro-ondes" },
  { id: "MACHINE_CAFE", label: "Machine à café" },
];

export const HTL_CONFORT_OPTIONS = [
  { id: "CLIMATISATION", label: "Climatisation" },
  { id: "CHAUFFAGE", label: "Chauffage" },
  { id: "WIFI", label: "Connexion Wi-Fi Internet" },
  { id: "MACHINE_LAVER", label: "Machine à laver" },
];

export const HTL_FLUIDES_OPTIONS = [
  { id: "CITERNE", label: "Citerne / Réservoir avec pompe (Eau H24)" },
  { id: "GROUPE_ELECTROGENE", label: "Groupe électrogène (Secours électricité)" },
  { id: "CHAUFFE_EAU", label: "Chauffe-eau opérationnel (Eau chaude en permanence)" },
];

export const HTL_LOISIRS_OPTIONS = [
  { id: "PISCINE", label: "Piscine privée / résidents" },
  { id: "SPA_SAUNA", label: "Espace Spa / Sauna" },
  { id: "AIRE_JEUX", label: "Aire de jeux enfants" },
  { id: "BARBECUE", label: "Zone Barbecue" },
];

export const HTL_PAIEMENTS_LOCAUX_OPTIONS = [
  { id: "ESPECES", label: "Espèces" },
  { id: "BARIDIMOB", label: "BaridiMob" },
  { id: "CCP", label: "CCP" },
  { id: "EDAHABIA", label: "Carte Edahabia" },
];

export const HTL_PAIEMENTS_INTL_OPTIONS = [
  { id: "VISA", label: "Carte VISA" },
  { id: "MASTERCARD", label: "MasterCard" },
];

// --- Fiches "Confier votre recherche — Terrains et Foncier" ---

export const TER_AGRI_CULTURE_OPTIONS = [
  { id: "MARAICHAGE", label: "Maraîchage" },
  { id: "ARBORICULTURE", label: "Arboriculture" },
  { id: "VITICULTURE", label: "Viticulture" },
  { id: "CEREALICULTURE", label: "Céréaliculture" },
  { id: "ELEVAGE", label: "Élevage" },
  { id: "AUTRE", label: "Autre" },
];

export const TER_AGRI_ETAT_OPTIONS = [
  { id: "VIDE", label: "Terrain vide" },
  { id: "PLANTE", label: "Terrain planté" },
  { id: "EXPLOITE", label: "Exploité" },
];

export const TER_IND_ZONE_OPTIONS = [
  { id: "INDUSTRIELLE", label: "Industrielle" },
  { id: "URBAINE", label: "Urbaine" },
  { id: "ACTIVITE", label: "Activité" },
];

export const TER_RES_ZONE_OPTIONS = [
  { id: "LOTISSEMENT_CLASSIQUE", label: "Lotissement classique" },
  { id: "COOPERATIVE_IMMOBILIERE", label: "Coopérative immobilière" },
  { id: "RESIDENCE_FERMEE", label: "Résidence fermée" },
];

export const TER_TOU_VOCATION_OPTIONS = [
  { id: "BALNEAIRE", label: "Balnéaire" },
  { id: "URBAINE", label: "Urbaine" },
  { id: "CLIMATIQUE", label: "Climatique" },
  { id: "SAHARIENNE", label: "Saharienne" },
  { id: "THERMALE", label: "Thermale" },
  { id: "AUTRE", label: "Autre situation" },
];

// --- Fiches "Industriel" (Location) — Hangar / Usine / Chambre Froide ---

export const HANGAR_USAGE_OPTIONS = [
  { id: "STOCKAGE", label: "Stockage" },
  { id: "PRODUCTION", label: "Production" },
];

export const INDUSTRIAL_ZONE_OPTIONS = [
  { id: "ZONE_INDUSTRIELLE", label: "Zone industrielle" },
  { id: "ZONE_URBAINE", label: "Zone urbaine" },
];

// Même liste que "Énergie et fluide" des fiches Bureaux (Électricité/Gaz/Eau/Assainissement) —
// réutilisée telle quelle via OFFICE_ENERGY_OPTIONS, pas de doublon ici.

// Même liste que "Type de location" du dépôt d'annonce Usine (Murs nus / Équipée).
export const USINE_EQUIPMENT_OPTIONS = [
  { id: "MURS_NUS", label: "Murs nus (Vide)" },
  { id: "EQUIPEE", label: "Équipée (Clé en main avec lignes)" },
];

// Même liste que "Secteur d'activité" du dépôt d'annonce Usine (INDUSTRIAL_SECTORS).
export const USINE_ACTIVITY_OPTIONS = [
  { id: "AGROALIMENTAIRE", label: "Agroalimentaire" },
  { id: "PHARMACEUTIQUE_COSMETIQUE", label: "Pharmaceutique / Cosmétique" },
  { id: "CHIMIQUE", label: "Chimique" },
  { id: "MATERIAUX_CONSTRUCTION", label: "Matériaux de construction" },
  { id: "PLASTURGIE_EMBALLAGE", label: "Plasturgie & Emballage" },
  { id: "SIDERURGIE_METALLURGIE", label: "Sidérurgie & Métallurgie" },
  { id: "TEXTILE_CUIR", label: "Textile & Cuir" },
  { id: "ELECTROMENAGER_ELECTRONIQUE", label: "Électroménager & Électronique" },
  { id: "MECANIQUE_AUTOMOBILE", label: "Mécanique & Automobile" },
  { id: "RECYCLAGE_ENVIRONNEMENT", label: "Recyclage & Environnement" },
  { id: "PAPIER_EDITION", label: "Papier & Édition" },
  { id: "AUTRE_ACTIVITE", label: "Autre activité" },
];

// Même liste que "Secteur compatible" du dépôt d'annonce Chambre Froide (CF_SECTORS).
export const CF_ACTIVITY_OPTIONS = [
  { id: "AGROALIMENTAIRE_CF", label: "Agroalimentaire" },
  { id: "GLACES_SURGELES", label: "Glaces & Surgelés" },
  { id: "PHARMACEUTIQUE_CF", label: "Pharmaceutique" },
  { id: "CHIMIQUE_CF", label: "Chimique" },
  { id: "HORTICOLE_AGRICOLE", label: "Horticole & Agricole" },
  { id: "AUTRE_CF", label: "Autre activité" },
];

// Même liste que "Type de froid" du dépôt d'annonce Chambre Froide.
export const CF_TYPE_FROID_OPTIONS = [
  { id: "POSITIF", label: "Positif" },
  { id: "NEGATIF", label: "Négatif" },
  { id: "ULTRA_FROID", label: "Ultra Froid (Tunnel de congélation)" },
];

// Même liste que "Mode de gestion" du dépôt d'annonce Chambre Froide (CF_MODE_GESTION).
export const CF_MODE_GESTION_OPTIONS = [
  { id: "SANS_GESTION", label: "Sans gestion (Murs seuls)" },
  { id: "AVEC_GESTION", label: "Avec gestion (Service complet)" },
];

// Interlocuteur — seulement 2 choix pour les fiches Industriel (Location), contrairement au
// Résidentiel/Bureaux qui en proposent 3.
export const INDUSTRIEL_LOCATION_INTERLOCUTOR_OPTIONS = [
  { id: "AGENCE_IMMOBILIERE", label: "Agence immobilière" },
  { id: "PARTICULIER", label: "Particulier" },
];
