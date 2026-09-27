// Structures d'accueil proposées pour « Hébergement & Séjour » en LOCATION — dépôt d'annonce ET « Confier votre
// recherche ». Mêmes intitulés que les activités hôtellerie de l'inscription professionnelle (voir
// `data/activityPoles.ts`, pôle HOTELLERIE). Chaque fiche est « en cours de construction » : elles seront
// travaillées une à une (voir les panneaux « fiche en cours de construction » du dépôt et de la recherche).
export const HEBERGEMENT_SEJOUR_TYPES: { id: string; label: string }[] = [
  { id: "HOTEL", label: "Hôtel" },
  { id: "COMPLEXE_TOURISTIQUE", label: "Complexe touristique" },
  { id: "VILLAGE_VACANCES", label: "Village de vacances" },
  { id: "APPART_HOTEL", label: "Appart hôtel" },
  { id: "RESIDENCE_HOTELIERE", label: "Résidence hôtelière" },
  { id: "MOTEL", label: "Motel" },
  { id: "RELAIS_ROUTIER", label: "Relais routier" },
  { id: "CAMPING_TOURISTIQUE", label: "Camping touristique" },
  { id: "AUTRES_STRUCTURES", label: "Autres structures" },
]

export const isHebergementSejourType = (id?: string | null) =>
  !!id && HEBERGEMENT_SEJOUR_TYPES.some((t) => t.id === id)

// Structures déjà pourvues d'une vraie fiche (voir hotelConfig.ts pour "HOTEL", ajoutée le 27/09/2026 à
// la demande du client) — les autres continuent d'afficher le panneau « en cours de construction »,
// à retirer de cette liste au fur et à mesure qu'elles seront travaillées à leur tour.
export const HEBERGEMENT_SEJOUR_IMPLEMENTED_TYPES = ["HOTEL"]

export const isHebergementSejourConstructionType = (id?: string | null) =>
  isHebergementSejourType(id) && !HEBERGEMENT_SEJOUR_IMPLEMENTED_TYPES.includes(id as string)
