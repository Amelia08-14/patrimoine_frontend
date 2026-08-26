// Segmentation des comptes professionnels par pôle d'activité — utilisée à l'inscription,
// au dépôt d'annonce, dans le dashboard Utilisateurs et dans la catégorisation des partenaires.
// Doit rester synchronisée avec ACTIVITY_POLES côté backend (admin.service.ts).

export type ActivityPole = "IMMOBILIER" | "HOTELLERIE" | "EVENEMENTIEL" | "ENTREPOSAGE"

export const POLE_LABELS: Record<ActivityPole, string> = {
  IMMOBILIER: "Immobilier",
  HOTELLERIE: "Hôtellerie & Hébergement",
  EVENEMENTIEL: "Événementiel",
  ENTREPOSAGE: "Entreposage & Stockage",
}

export const ACTIVITY_POLES: Record<ActivityPole, string[]> = {
  IMMOBILIER: [
    "AGENCE_IMMOBILIERE",
    "PROMOTEUR_IMMOBILIER",
    "ADMINISTRATEUR_BIENS",
    "AUTRES_PROFESSIONNELS",
  ],
  HOTELLERIE: [
    "HOTELLERIE_HEBERGEMENT",
    "HOTEL",
    "COMPLEXE_TOURISTIQUE",
    "VILLAGE_VACANCES",
    "APPART_HOTEL",
    "RESIDENCE_HOTELIERE",
    "MOTEL",
    "RELAIS_ROUTIER",
    "CAMPING_TOURISTIQUE",
    "AUTRES_STRUCTURES",
  ],
  EVENEMENTIEL: [
    "SALLE_DES_FETES",
    "SALLES_DINATOIRES",
    "SALLE_FORMATION",
    "SALLE_CONFERENCE",
    "AUTRES_EVENEMENTIEL",
  ],
  ENTREPOSAGE: [
    "ENTREPOSAGE_FRIGORIFIQUE",
    "ENTREPOSAGE_NON_FRIGORIFIQUE",
    "AUTRES_ENTREPOSAGE_STOCKAGE",
  ],
}

export const SUB_CATEGORY_LABELS: Record<string, string> = {
  AGENCE_IMMOBILIERE: "Agence Immobilière",
  PROMOTEUR_IMMOBILIER: "Promoteur Immobilier",
  ADMINISTRATEUR_BIENS: "Administrateur de biens",
  AUTRES_PROFESSIONNELS: "Autres Professionnels",
  HOTELLERIE_HEBERGEMENT: "Hôtellerie & Hébergement",
  HOTEL: "Hôtel",
  COMPLEXE_TOURISTIQUE: "Complexe Touristique",
  VILLAGE_VACANCES: "Village de vacances",
  APPART_HOTEL: "Appart Hôtel",
  RESIDENCE_HOTELIERE: "Résidence Hôtelière",
  MOTEL: "Motel",
  RELAIS_ROUTIER: "Relais routier",
  CAMPING_TOURISTIQUE: "Camping Touristique",
  AUTRES_STRUCTURES: "Autres Structures hôtelières",
  SALLE_DES_FETES: "Salle des fêtes",
  SALLES_DINATOIRES: "Salles Dînatoires",
  SALLE_FORMATION: "Salle de formation",
  SALLE_CONFERENCE: "Salle de conférence",
  AUTRES_EVENEMENTIEL: "Autres espaces événementiels",
  ENTREPOSAGE_FRIGORIFIQUE: "Entrepôt Frigorifique",
  ENTREPOSAGE_NON_FRIGORIFIQUE: "Entrepôt non Frigorifique",
  AUTRES_ENTREPOSAGE_STOCKAGE: "Autre espace de stockage",
}

// Sous-catégories (CompanyActivity) disponibles pour un pôle donné, prêtes à l'affichage
export function subCategoriesForPole(pole: ActivityPole): { id: string; label: string }[] {
  return ACTIVITY_POLES[pole].map((id) => ({ id, label: SUB_CATEGORY_LABELS[id] || id }))
}
