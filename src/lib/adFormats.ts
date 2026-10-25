// Formats publicitaires du site — SOURCE UNIQUE des dimensions communiquées aux annonceurs (écran
// /admin/ads) ET des ratios appliqués par les composants (AdSidebar, AdStrip, AdBanner). Changer un
// ratio ici sans changer les classes `aspect-*` correspondantes (et inversement) fausse les visuels.
//
// Deux formats seulement (demande client du 25/10/2026 : "afficher les dimensions réelles des espaces
// publicitaires pour les donner au client afin de créer les visuels") :
// - VERTICAL : colonnes latérales (SIDEBAR), ratio fixe 1:2, jamais recadré.
// - HORIZONTAL : bandeau principal (BANNER) + bandeaux compacts (STRIP), même ratio 6:1 sur grand
//   écran ; sous 1024 px l'espace passe en 3:1 et n'affiche que la moitié centrale du visuel (zone
//   de sécurité) — textes et logos doivent donc tenir dans cette zone.
// Une même publicité ne doit cibler qu'UN format : une image portrait ne peut pas remplir un bandeau.

export type AdFormatId = "VERTICAL" | "HORIZONTAL"

export const AD_FORMATS: Record<AdFormatId, {
  label: string
  placements: readonly string[]
  /** Taille du visuel à fournir (px), pensée pour les écrans haute densité. */
  width: number
  height: number
  ratio: string
  /** Zone toujours visible, centrée (px, dans le visuel) — null si le visuel n'est jamais recadré. */
  safeZone: { width: number; height: number } | null
  /** Taille réellement affichée à l'écran (px CSS), pour information. */
  displayed: string
}> = {
  VERTICAL: {
    label: "Vertical — colonnes latérales",
    placements: ["SIDEBAR"],
    width: 600,
    height: 1200,
    ratio: "1:2",
    safeZone: null,
    displayed: "de 168 × 336 à 272 × 544 px selon la largeur de l'écran (grands écrans uniquement)",
  },
  HORIZONTAL: {
    label: "Horizontal — bandeau principal et bandeaux compacts",
    placements: ["BANNER", "STRIP"],
    width: 1800,
    height: 300,
    ratio: "6:1",
    safeZone: { width: 900, height: 300 },
    displayed: "jusqu'à ~1550 × 258 px sur ordinateur (6:1) ; sur mobile et tablette, 3:1 (ex. 360 × 120 px) en ne montrant que les 900 px centraux",
  },
}

export const formatOfPlacement = (placement: string): AdFormatId =>
  AD_FORMATS.VERTICAL.placements.includes(placement) ? "VERTICAL" : "HORIZONTAL"
