import { useTranslations, useLocale } from "next-intl";
import { PROPERTY_TYPES, REAL_ESTATE_CATEGORIES } from "@/data/propertyTypes";
import { COMMUNES } from "@/data/communes";
import { WILAYAS } from "@/data/wilayas";

// Tables de secours nom FR -> nom AR réel (les données `city`/`town` de la BDD stockent souvent la
// translittération latine dans `nameAr`, pas de l'arabe). Construites une seule fois.
const COMMUNE_AR = new Map(COMMUNES.map((c) => [c.name, c.nameAr]));
const WILAYA_AR = new Map(WILAYAS.map((w) => [w.name, w.nameAr]));
const hasArabic = (s?: string | null) => !!s && /[؀-ۿ]/.test(s);

/**
 * Renvoie le nom localisé d'une entité géo (wilaya, commune, ville) : les données portent
 * `nameAr` / `nameFr` / `name`. En arabe on prend `nameAr`, sinon `nameFr` puis `name`.
 */
export function useLocalizedGeoName() {
  const locale = useLocale();
  return (obj?: { name?: string; nameFr?: string; nameAr?: string } | null) => {
    if (!obj) return "";
    if (locale === "ar") return obj.nameAr || obj.nameFr || obj.name || "";
    return obj.nameFr || obj.name || obj.nameAr || "";
  };
}

/**
 * Nom localisé d'une commune / wilaya venant de l'API (`town` / `town.city`), pour l'affichage des
 * cartes. En arabe : on prend `nameAr` s'il est réellement en arabe, sinon on retombe sur la table
 * statique COMMUNES / WILAYAS (arabe réel), matchée par le nom français.
 */
export function useLocalizedPlaceName() {
  const locale = useLocale();
  const resolve = (obj: any, arMap: Map<string, string>) => {
    if (!obj) return "";
    const fr = obj.nameFr || obj.name || "";
    if (locale !== "ar") return fr || obj.nameAr || "";
    if (hasArabic(obj.nameAr)) return obj.nameAr as string;
    return arMap.get(fr) || fr || obj.nameAr || "";
  };
  return {
    town: (obj?: { nameFr?: string; nameAr?: string; name?: string } | null) => resolve(obj, COMMUNE_AR),
    city: (obj?: { nameFr?: string; nameAr?: string; name?: string } | null) => resolve(obj, WILAYA_AR),
  };
}

/**
 * Couche d'affichage i18n pour les libellés de `src/data/propertyTypes.ts`.
 *
 * ⚠️ Ne PAS traduire les `label` dans `propertyTypes.ts` : ce champ sert aussi de clé de
 * rapprochement contre `announce.property.propertyType` stocké en français en base
 * (`PROPERTY_TYPES.find(t => t.label === a.property.propertyType)`). On garde donc les données
 * en français et on traduit uniquement au rendu, par id, via les namespaces :
 *   - `PropertyTypes` : un id de type de bien → libellé (46 entrées, mêmes ids que PROPERTY_TYPES)
 *   - `Categories`    : un id de catégorie → libellé (déjà utilisé partout ailleurs sur le site)
 *
 * `.has()` retombe sur le libellé français en dur puis sur l'id brut si une clé manque.
 */
export function usePropertyTypeLabel() {
  const t = useTranslations("PropertyTypes");
  return (id?: string | null, fallback?: string) => {
    if (!id) return fallback ?? "";
    const key = String(id).toUpperCase();
    if (t.has(key)) return t(key);
    return fallback ?? PROPERTY_TYPES.find((p) => p.id === key)?.label ?? String(id);
  };
}

export function useCategoryLabel() {
  const t = useTranslations("Categories");
  return (id?: string | null, fallback?: string) => {
    if (!id) return fallback ?? "";
    const key = String(id);
    if (t.has(key)) return t(key);
    return fallback ?? REAL_ESTATE_CATEGORIES.find((c) => c.id === key)?.label ?? key;
  };
}
