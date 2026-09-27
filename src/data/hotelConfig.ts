// Fiche « Hôtel » de Hébergement & Séjour — champs demandés par le client (email aquarius-tech du
// 27/09/2026, sujet "hotel"). Source unique des options, réutilisée par le dépôt d'annonce (formulaire)
// et la fiche de lecture (`announces/[id]/page.tsx`, `PropertyCard.tsx`) pour ne jamais désynchroniser
// les libellés. Les traductions vivent dans `DepositOptions.HTL_*` (fr/en/ar) ; le `label`/`desc` codé en
// dur ici sert de repli tant qu'une clé n'existe pas (même convention que le reste du dépôt, voir `tGroup`).

export const HTL_CLASSEMENT = [1, 2, 3, 4, 5] as const

export const HTL_CIBLE_CLIENTELE = [
  { id: "FAMILIAL", label: "Exclusivement Familial", desc: "Idéal pour le repos des familles, non adapté aux célibataires ou affaires" },
  { id: "PROFESSIONNEL", label: "Professionnel / Affaires", desc: "Adapté aux séjours professionnels, séminaires, cadres et travailleurs" },
  { id: "GROUPES", label: "Groupes d'amis / Groupements", desc: "Adapté aux groupes voyageant ensemble, randonneurs, etc." },
  { id: "TOUS", label: "Tout type de clientèle légalement admissible", desc: "Ouvert à tous les profils respectant la réglementation en vigueur" },
]

export const HTL_AMBIANCE = [
  { id: "BALNEAIRE", label: "Balnéaire", desc: "Mer et plage", iconName: "Waves" },
  { id: "SAHARIEN", label: "Saharien", desc: "Désert, Oasis, Grand Sud", iconName: "Sun" },
  { id: "THERMAL", label: "Thermal", desc: "Proche d'un Hammam / station thermale", iconName: "Droplet" },
  { id: "CLIMATIQUE", label: "Climatique", desc: "Montagne, Ski, Nature, Forêt", iconName: "Mountain" },
]

export const HTL_ROOM_TYPES = [
  { id: "STANDARD", label: "Chambre standard" },
  { id: "DOUBLE", label: "Chambre double" },
  { id: "TRIPLE", label: "Chambre triple" },
  { id: "QUADRUPLE", label: "Chambre quadruple" },
  { id: "FAMILIALE", label: "Chambre familiale" },
  { id: "PMR", label: "Chambre PMR" },
  { id: "SUITE_JUNIOR", label: "Suite junior" },
  { id: "SUITE", label: "Suite" },
  { id: "SUITE_EXECUTIVE", label: "Suite Executive" },
  { id: "SUITE_PRESIDENTIELLE", label: "Suite présidentielle" },
]

export const HTL_BATHROOM_TYPES = [
  { id: "PRIVATIVE", label: "Privative" },
  { id: "PARTAGEE", label: "Partagée" },
]

export const HTL_BED_TYPES = [
  { id: "KING_PREMIUM", label: "Lit Double King Size Premium", dimensions: "200 x 200 cm" },
  { id: "KING", label: "Lit Double King Size", dimensions: "180 x 200 cm" },
  { id: "QUEEN", label: "Lit Double Queen Size", dimensions: "160 x 200 cm" },
  { id: "STANDARD_DOUBLE", label: "Lit Double Standard", dimensions: "140 x 190 cm" },
  { id: "SIMPLE_ADULTE", label: "Lit Simple Adulte / Canapé-lit", dimensions: "90 x 190 cm" },
  { id: "SIMPLE_ENFANT", label: "Lit Simple Enfant", dimensions: "80 x 190 cm" },
  { id: "SUPERPOSE", label: "Lit Superposé (2 places séparées)", dimensions: "90 x 190 cm x2" },
]

export const HTL_LINGE = [
  { id: "DRAPS", label: "Draps fournis" },
  { id: "SERVIETTES", label: "Serviettes fournies" },
  { id: "AUCUN", label: "Aucun linge fourni" },
]

export const HTL_HYGIENE = [
  { id: "SHAMPOING_SAVON", label: "Shampoing / Savon fournis" },
  { id: "PAPIER_TOILETTE", label: "Papier toilette fourni" },
]

export type HotelBedConfig = { bedType: string; quantity: string }

export type HotelRoomConfig = {
  id: string
  roomType: string
  roomCount: string
  surface: string
  bathroomType: string
  capacity: string
  beds: HotelBedConfig[]
}

export const emptyHotelRoom = (): HotelRoomConfig => ({
  id: Math.random().toString(36).slice(2),
  roomType: "",
  roomCount: "",
  surface: "",
  bathroomType: "",
  capacity: "",
  beds: [],
})
