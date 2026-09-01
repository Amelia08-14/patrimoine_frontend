// Palette de couleurs par catégorie d'annonce — source unique, réutilisée partout où une
// catégorie a besoin de sa propre couleur : ligne sous les titres de l'accueil, dégradé du hero,
// pastilles de sélection (dépôt d'annonce ET confier votre recherche), superposition des photos.
//
// HEBERGEMENT et HOTELIER affichent tous les deux "Hébergement & Séjour" (deux entrées historiques
// pour le même domaine) — ils partagent donc la même couleur.

export type CategoryColorId =
  | "RESIDENTIEL"
  | "INDUSTRIEL"
  | "BUREAUX_COMMERCES"
  | "TERRAIN_FONCIER"
  | "HOTELIER"
  | "HEBERGEMENT"
  | "EVENEMENTIEL";

export interface CategoryColor {
  hex: string;
  rgb: string; // "R,G,B" — pour composer des rgba(...) dans les ombres
  /** Tailwind: fond plein (icône active, pastille sélectionnée) */
  bg500: string;
  /** Tailwind: fond plein plus foncé (dégradé, hover) */
  bg700: string;
  /** Tailwind: texte / icône */
  text500: string;
  /** Tailwind: fond très clair (badge, halo) */
  bgSoft: string;
  /** Tailwind: dégradé quasi-noir teinté (superposition photo — PropertyCard) */
  overlayFrom: string;
}

export const CATEGORY_COLORS: Record<CategoryColorId, CategoryColor> = {
  RESIDENTIEL: { hex: "#22C55E", rgb: "34,197,94", bg500: "bg-green-500", bg700: "bg-green-700", text500: "text-green-500", bgSoft: "bg-green-50", overlayFrom: "from-emerald-950/90" },
  BUREAUX_COMMERCES: { hex: "#3B82F6", rgb: "59,130,246", bg500: "bg-blue-500", bg700: "bg-blue-700", text500: "text-blue-500", bgSoft: "bg-blue-50", overlayFrom: "from-sky-950/90" },
  INDUSTRIEL: { hex: "#6B7280", rgb: "107,114,128", bg500: "bg-gray-500", bg700: "bg-gray-700", text500: "text-gray-500", bgSoft: "bg-gray-100", overlayFrom: "from-slate-950/90" },
  TERRAIN_FONCIER: { hex: "#F59E0B", rgb: "245,158,11", bg500: "bg-amber-500", bg700: "bg-amber-700", text500: "text-amber-500", bgSoft: "bg-amber-50", overlayFrom: "from-amber-950/90" },
  HOTELIER: { hex: "#F97316", rgb: "249,115,22", bg500: "bg-orange-500", bg700: "bg-orange-700", text500: "text-orange-500", bgSoft: "bg-orange-50", overlayFrom: "from-orange-950/90" },
  HEBERGEMENT: { hex: "#F97316", rgb: "249,115,22", bg500: "bg-orange-500", bg700: "bg-orange-700", text500: "text-orange-500", bgSoft: "bg-orange-50", overlayFrom: "from-orange-950/90" },
  EVENEMENTIEL: { hex: "#EF4444", rgb: "239,68,68", bg500: "bg-red-500", bg700: "bg-red-700", text500: "text-red-500", bgSoft: "bg-red-50", overlayFrom: "from-red-950/90" },
};

// Couleur de repli pour un id de catégorie inconnu — le bleu de marque du site.
export const DEFAULT_CATEGORY_COLOR: CategoryColor = {
  hex: "#0094BD", rgb: "0,148,189", bg500: "bg-[#0094BD]", bg700: "bg-[#003B4A]", text500: "text-[#0094BD]", bgSoft: "bg-[#0094BD]/10", overlayFrom: "from-[#003B4A]/90",
};

export const getCategoryColor = (categoryId?: string | null): CategoryColor =>
  (categoryId && CATEGORY_COLORS[categoryId as CategoryColorId]) || DEFAULT_CATEGORY_COLOR;
