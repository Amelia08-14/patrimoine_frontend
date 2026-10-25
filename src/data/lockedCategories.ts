// Catégories visibles mais verrouillées ("Bientôt disponible") dans le dépôt d'annonce (location ET
// vente) et dans "Confier votre recherche" — demande client du 25/10/2026 : Hébergement & Séjour
// verrouillé partout. HOTELIER et HEBERGEMENT portent le même libellé côté site. Retirer un id d'ici
// rouvre la catégorie dans les deux parcours ; penser aussi à LOCKED_RESEARCH_CATEGORIES dans
// patrimoine-api/src/entrusted-research/entrusted-research.service.ts (verrou serveur des recherches —
// pas d'équivalent serveur pour les annonces, dont la catégorie n'est déduite du type de bien que côté front).
export const LOCKED_CATEGORIES: readonly string[] = ["HOTELIER", "HEBERGEMENT"]

export const isLockedCategory = (id?: string | null) => !!id && LOCKED_CATEGORIES.includes(id)
