// Listes d'options des fiches Industriel (Usine / Hangar / Chambre froide) et Terrain, partagées entre
// le dépôt d'annonce (/deposit) et "Confier votre recherche" (/research) — sorties de deposit/page.tsx
// le 25/10/2026 pour que la recherche clone exactement les commodités de la fiche annonce. Libellés
// français de repli : la traduction passe par le namespace DepositOptions.<NOM_DU_GROUPE>.<id>.

export const INDUSTRIAL_SITUATIONS = [
    { id: "ZONE_INDUSTRIELLE", label: "Zone industrielle (ZI/ZAC)" },
    { id: "ZONE_URBAINE", label: "Zone urbaine (Ville)" },
]

export const INDUSTRIAL_ACCESS_TRANSPORT = [
    { id: "SEMI_REMORQUE", label: "Semi-remorque (40 T)" },
    { id: "CAMIONNETTE", label: "Camionnette (3.5 T)" },
    { id: "PETIT_PORTEUR", label: "Petit porteur (10T)" },
]

export const INDUSTRIAL_SOCIAL_LOCALES = [
    { id: "VESTIAIRES", label: "Vestiaires" },
    { id: "REFECTOIRE", label: "Réfectoire" },
    { id: "SANITAIRES_HF", label: "Sanitaires H/F" },
]

export const INDUSTRIAL_HEBERGEMENT = [
    { id: "LOGEMENT_FONCTION", label: "Logement" },
    { id: "DORTOIRS", label: "Dortoirs" },
]

export const INDUSTRIAL_SECURITY = [
    { id: "POSTE_GARDE", label: "Poste de garde" },
    { id: "CLOTURE_MACONNEE", label: "Clôture maçonnée" },
    { id: "CAMERAS", label: "Caméras" },
]

export const INDUSTRIAL_WATER_SOURCES = [
    { id: "RESEAU_ADE", label: "Réseau ADE" },
    { id: "FORAGE", label: "Forage" },
    { id: "BACHE_EAU", label: "Bâche à eau" },
]

export const INDUSTRIAL_FIRE_NETWORK = [
    { id: "RIA", label: "R.I.A (Robinets d'Incendie Armés)" },
    { id: "SPRINKLERS", label: "Système Sprinklers" },
    { id: "COLONNES_SECHES", label: "Colonnes sèches" },
]

export const INDUSTRIAL_FIRE_EQUIPMENT = [
    { id: "BACHE_EAU", label: "Bâche à eau anti-incendie (réserve dédiée)" },
    { id: "MOTOPOMPE", label: "Motopompe / Groupe de surpression" },
]

export const CF_ZONE_DECHARGEMENT = [
    { id: "QUAI_NIVELEUR_SAS", label: "Quai niveleur SAS étanche" },
    { id: "QUAI_SIMPLE", label: "Quai simple" },
    { id: "PLAIN_PIED_DECHARGT", label: "Plain-pied" },
]

export const CF_TECHNIQUE_FROID = [
    { id: "SOL_CHAUFFANT", label: "Sol chauffant (Anti-gel dalle)" },
    { id: "DEGIVRAGE_AUTO", label: "Dégivrage Auto" },
]

export const CF_MODE_DIFFUSION = [
    { id: "FROID_VENTILE", label: "Froid Ventilé" },
    { id: "FROID_STATIQUE", label: "Froid Statique" },
]

export const TERRAIN_RACCORDEMENTS = [
    { id: "EAU", label: "Eau (ADE)" },
    { id: "ELECTRICITE", label: "Électricité (Sonelgaz)" },
    { id: "GAZ", label: "Gaz" },
    { id: "ASSAINISSEMENT", label: "Assainissement" },
    { id: "INTERNET", label: "Internet / Fibre" },
]

export const TERRAIN_AGRICOLE_RESSOURCES_EAU = [
    { id: "PUITS", label: "Puits" },
    { id: "CANAL_IRRIGATION", label: "Canal d'irrigation" },
    { id: "BARRAGE_RETENUE", label: "Barrage / retenue d'eau" },
    { id: "BASSIN_COLLECTE", label: "Bassin de collecte" },
    { id: "RESEAU_ADE", label: "Réseau ADE" },
    { id: "FORAGE", label: "Forage" },
]

export const TERRAIN_AGRICOLE_EQUIPEMENT_HYDRAULIQUE = [
    { id: "BASSIN_RETENTION", label: "Bassin de rétention / Réservoir" },
    { id: "IRRIGATION_GOUTTE", label: "Système d'irrigation goutte-à-goutte" },
    { id: "AUTRE_SYSTEME", label: "Autre système" },
]

export const TERRAIN_AGRICOLE_ACCES = [
    { id: "ROUTE_GOUDRON", label: "Route goudronnée" },
    { id: "PISTE_CARROSSABLE", label: "Piste carrossable (accessible en voiture)" },
    { id: "ACCES_DIFFICILE", label: "Accès difficile (nécessite 4x4)" },
]

export const TERRAIN_AGRICOLE_ACCES_LOURDS = [
    { id: "CAMION_PORTEUR", label: "Accessible en Camion porteur" },
    { id: "SEMI_REMORQUE", label: "Accessible en Semi-remorque" },
]

export const TERRAIN_AGRICOLE_CONSTRUCTIONS = [
    { id: "HANGAR_STOCKAGE", label: "Hangar de stockage" },
    { id: "ECURIES_ELEVAGE", label: "Bâtiment d'élevage" },
    { id: "MAISON_GARDIENNAGE", label: "Logement de fonction" },
    { id: "AUCUNE", label: "Aucune construction" },
]

export const TERRAIN_AGRICOLE_CLOTURE = [
    { id: "OUVERT", label: "Terrain non clôturé" },
    { id: "GRILLAGE", label: "Clôture en grillage" },
    { id: "MURS_ENCEINTE", label: "Murs d'enceinte" },
    { id: "HAIES", label: "Haies naturelles" },
]

export const TERRAIN_TOURISTIQUE_ZONE = [
    { id: "BALNEAIRE", label: "Zone balnéaire (Littoral, bord de mer)" },
    { id: "SAHARIEN", label: "Zone saharienne (Sud, oasis, tourisme saharien)" },
    { id: "CLIMATIQUE", label: "Zone climatique (Montagne, forêt, tourisme vert)" },
    { id: "THERMAL", label: "Zone thermale (Sources thermales, hammams)" },
    { id: "URBAINE", label: "Zone urbaine (Centre-ville, tourisme d'affaires)" },
    { id: "AUTRE_ZONE", label: "Autre situation" },
]

export const TERRAIN_TOURISTIQUE_PAT = [
    { id: "OUI_APPROUVE", label: "Oui (Approuvé et publié)" },
    { id: "EN_COURS", label: "En cours d'étude / En cours d'approbation" },
    { id: "NON", label: "Non / Aucun plan d'aménagement disponible" },
]

// Fiche Showroom (Bureaux & Commerces) — partagée avec « Confier votre recherche » depuis le 08/11/2026.
export const SHOWROOM_STYLE = [
    { id: "MODERNE", label: "Moderne" },
    { id: "CLASSIQUE", label: "Classique" },
    { id: "INDUSTRIEL", label: "Industriel" },
]

export const SHOWROOM_STRUCTURE = [
    { id: "BETON_ARME", label: "Béton armé" },
    { id: "STRUCTURE_METALLIQUE", label: "Structure métallique" },
    { id: "AUTRE", label: "Autre" },
]
