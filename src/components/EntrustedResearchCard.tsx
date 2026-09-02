"use client"

import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { MapPin, Calendar, Wallet, Ruler, ArrowRight, Home, User, Store } from "lucide-react"
import { REAL_ESTATE_CATEGORIES, PROPERTY_TYPES } from "@/data/propertyTypes"
import { RESEARCH_PROPERTY_TYPES, ENVIRONMENT_OPTIONS, VILLA_LEVEL_ENTRANCE_OPTIONS } from "@/data/researchConfig"

// Table de correspondance id -> libellé, construite à partir de toutes les branches (recherche + dépôt)
const PROPERTY_TYPE_LABELS: Record<string, string> = {}
Object.values(RESEARCH_PROPERTY_TYPES).forEach((list) => list.forEach((t) => { PROPERTY_TYPE_LABELS[t.id] ||= t.label }))
PROPERTY_TYPES.forEach((t) => { PROPERTY_TYPE_LABELS[t.id] ||= t.label })

const ENVIRONMENT_LABELS: Record<string, string> = {}
ENVIRONMENT_OPTIONS.forEach((o) => { ENVIRONMENT_LABELS[o.id] = o.label })

const VILLA_ENTRANCE_LABELS: Record<string, string> = {}
VILLA_LEVEL_ENTRANCE_OPTIONS.forEach((o) => { VILLA_ENTRANCE_LABELS[o.id] = o.label })

/**
 * Carte d'une recherche confiée — extraite pour être partagée entre la liste publique (/demandes,
 * où l'on veut contacter le demandeur) et "Mes recherches confiées" (/profile/researches, où l'on
 * est le demandeur : pas de bouton "contacter", juste la date de dépôt).
 */
export function EntrustedResearchCard({ research: r, variant = "public" }: { research: any; variant?: "public" | "mine" }) {
  const t = useTranslations("Demandes")

  const getCategoryLabel = (id?: string) => REAL_ESTATE_CATEGORIES.find((c) => c.id === id)?.label

  const getLocationLabel = () => {
    const parts = [r.cityName, ...(r.townNames || [])].filter(Boolean)
    return parts.length ? parts.join(" — ") : null
  }
  const locationLabel = getLocationLabel()

  let amenities: any = {}
  try { amenities = r.amenities ? JSON.parse(r.amenities) : {} } catch { amenities = {} }
  const locationCriteria = amenities?.residentiel?.location

  const propertyTypeIds: string[] = locationCriteria?.propertyTypes?.length
    ? locationCriteria.propertyTypes
    : (r.propertyType ? r.propertyType.split(",") : [])
  const propertyTypeLabels: string[] = propertyTypeIds.map((id: string) => PROPERTY_TYPE_LABELS[id] || id)

  const requesterName = r.user?.companyName || r.user?.firstName || null

  const budgetLabel = r.minBudget && r.maxBudget
    ? `${new Intl.NumberFormat("fr-DZ").format(r.minBudget)} - ${new Intl.NumberFormat("fr-DZ").format(r.maxBudget)} DA`
    : r.maxBudget
    ? `${t("upTo")} ${new Intl.NumberFormat("fr-DZ").format(r.maxBudget)} DA`
    : r.minBudget
    ? `${t("from")} ${new Intl.NumberFormat("fr-DZ").format(r.minBudget)} DA`
    : null

  const surfaceMin = locationCriteria?.minSurface || r.minSurface
  const surfaceMax = locationCriteria?.maxSurface || r.maxSurface
  const surfaceLabel = surfaceMin && surfaceMax
    ? (surfaceMin === surfaceMax ? `${surfaceMax} m²` : `${surfaceMin} - ${surfaceMax} m²`)
    : surfaceMax
    ? `${t("upTo")} ${surfaceMax} m²`
    : surfaceMin
    ? `${t("from")} ${surfaceMin} m²`
    : null

  const cleanTypology = (v?: string) => (v ? v.replace(/^F/i, "") : v)
  const typMin = cleanTypology(locationCriteria?.typologyMin)
  const typMax = cleanTypology(locationCriteria?.typologyMax)
  const typologyLabel = typMin || typMax
    ? (typMin && typMax ? (typMin === typMax ? `F${typMin}` : `F${typMin} - F${typMax}`) : `F${typMin || typMax}`)
    : null

  const floorMin = locationCriteria?.floorMin
  const floorMax = locationCriteria?.floorMax
  const floorLabel = floorMin && floorMax
    ? (floorMin === floorMax ? `${t("floor")} ${floorMax}` : `${t("floor")} ${floorMin} - ${floorMax}`)
    : floorMax
    ? `${t("upTo")} ${t("floor")} ${floorMax}`
    : floorMin
    ? `${t("from")} ${t("floor")} ${floorMin}`
    : null
  const villaEntranceLabel = locationCriteria?.villaLevelEntrance ? VILLA_ENTRANCE_LABELS[locationCriteria.villaLevelEntrance] : null
  const environmentLabels: string[] = (locationCriteria?.environment || []).map((id: string) => ENVIRONMENT_LABELS[id] || id).filter(Boolean)

  return (
    <div className="bg-white dark:bg-white/5 rounded-3xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100 dark:border-white/10 p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-[#00BFA6]/10 text-[#00908A] dark:text-[#5EEAD4]">
          {r.transaction === "SALE" ? t("sale") : r.transaction === "RENTAL" ? t("rental") : t("holiday")}
        </span>
        {r.realEstateType && (
          <span className="text-xs font-bold text-gray-500 dark:text-white/50 uppercase tracking-wide">
            {getCategoryLabel(r.realEstateType) || r.realEstateType}
          </span>
        )}
      </div>

      {propertyTypeLabels.length > 0 && (
        propertyTypeLabels.length === 1 ? (
          <div className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-white/90">
            <Home className="h-4 w-4 text-[#00BFA6] shrink-0" />
            {propertyTypeLabels[0]}
          </div>
        ) : (
          <div className="flex items-start gap-2">
            <Home className="h-4 w-4 text-[#00BFA6] shrink-0 mt-1" />
            <div className="flex flex-wrap gap-1.5">
              {propertyTypeLabels.map((label, i) => (
                <span key={i} className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#00BFA6]/10 text-[#00908A] dark:text-[#5EEAD4]">{label}</span>
              ))}
            </div>
          </div>
        )
      )}

      {r.comment && (
        <p className="text-gray-600 dark:text-white/60 text-sm leading-relaxed line-clamp-4">{r.comment}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-white/60 border-t border-gray-50 dark:border-white/10 pt-4">
        {budgetLabel && (
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-[#00BFA6] shrink-0" />
            {budgetLabel}
          </div>
        )}
        {surfaceLabel && (
          <div className="flex items-center gap-2">
            <Ruler className="h-4 w-4 text-[#00BFA6] shrink-0" />
            {surfaceLabel}
          </div>
        )}
        {typologyLabel && (
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4 text-[#00BFA6] shrink-0" />
            {typologyLabel}
          </div>
        )}
        {floorLabel && (
          <div className="flex items-center gap-2">
            <Ruler className="h-4 w-4 text-[#00BFA6] shrink-0" />
            {floorLabel}
          </div>
        )}
        {villaEntranceLabel && (
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4 text-[#00BFA6] shrink-0" />
            {villaEntranceLabel}
          </div>
        )}
        {locationLabel && (
          <div className="flex items-center gap-2 col-span-2">
            <MapPin className="h-4 w-4 text-[#00BFA6] shrink-0" />
            {locationLabel}
          </div>
        )}
        {r.installationDate && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#00BFA6] shrink-0" />
            {new Date(r.installationDate).toLocaleDateString("fr-FR")}
          </div>
        )}
      </div>

      {environmentLabels.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {environmentLabels.map((label) => (
            <span key={label} className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60">{label}</span>
          ))}
        </div>
      )}

      {variant === "public" ? (
        <>
          {requesterName && (
            <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-white/40 font-bold uppercase tracking-wide">
              {r.user?.companyName ? <Store className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
              {requesterName}
            </div>
          )}
          <Link href="/contact" className="mt-auto pt-2 flex items-center gap-1.5 text-[#00BFA6] font-bold text-sm hover:underline">
            {t("contactToRespond")} <ArrowRight className="h-4 w-4" />
          </Link>
        </>
      ) : (
        <div className="mt-auto pt-2 flex items-center gap-1.5 text-xs text-gray-400 dark:text-white/40 font-medium">
          <Calendar className="h-3.5 w-3.5" />
          {t("submittedOn", { date: new Date(r.createdAt).toLocaleDateString("fr-FR") })}
        </div>
      )}
    </div>
  )
}
