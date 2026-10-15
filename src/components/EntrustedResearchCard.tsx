"use client"

import { useState } from "react"
import axios from "axios"
import { useLocale, useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { MapPin, Calendar, Wallet, Ruler, ArrowRight, Home, User, Store, Factory, Briefcase, Trees, Hotel, PartyPopper, Zap, Loader2, RefreshCw } from "lucide-react"
import { getCategoryColor } from "@/data/categoryColors"
import { REAL_ESTATE_CATEGORIES, PROPERTY_TYPES } from "@/data/propertyTypes"
import { RESEARCH_PROPERTY_TYPES, ENVIRONMENT_OPTIONS, VILLA_LEVEL_ENTRANCE_OPTIONS } from "@/data/researchConfig"

// Tables de correspondance id -> libellé FRANÇAIS (repli), construites à partir de toutes les branches
// (recherche + dépôt). La traduction se fait au rendu via les namespaces i18n (voir le composant).
const PROPERTY_TYPE_LABELS_FR: Record<string, string> = {}
Object.values(RESEARCH_PROPERTY_TYPES).forEach((list) => list.forEach((t) => { PROPERTY_TYPE_LABELS_FR[t.id] ||= t.label }))
PROPERTY_TYPES.forEach((t) => { PROPERTY_TYPE_LABELS_FR[t.id] ||= t.label })
const RESEARCH_BRANCH_IDS = Object.keys(RESEARCH_PROPERTY_TYPES)

const ENVIRONMENT_LABELS_FR: Record<string, string> = {}
ENVIRONMENT_OPTIONS.forEach((o) => { ENVIRONMENT_LABELS_FR[o.id] = o.label })

const VILLA_ENTRANCE_LABELS_FR: Record<string, string> = {}
VILLA_LEVEL_ENTRANCE_OPTIONS.forEach((o) => { VILLA_ENTRANCE_LABELS_FR[o.id] = o.label })

// Visuels générés par activité (mention « Patrimoine Immobilier » + catégorie incrustées en bas à gauche,
// d'où le cadrage `object-bottom`). Sans visuel, la carte retombe sur un aplat de la couleur de la catégorie.
export const CATEGORY_IMAGES: Record<string, string> = {
  RESIDENTIEL: "/demandes/residentiel.jpg",
  BUREAUX_COMMERCES: "/demandes/bureaux.jpg",
  INDUSTRIEL: "/demandes/industriel.jpg",
  TERRAIN_FONCIER: "/demandes/terrain.jpg",
  HOTELIER: "/demandes/hotellerie.jpg",
  HEBERGEMENT: "/demandes/hotellerie.jpg",
  EVENEMENTIEL: "/event.jpg",
}
export const CATEGORY_ICONS: Record<string, any> = {
  RESIDENTIEL: Home, BUREAUX_COMMERCES: Briefcase, INDUSTRIEL: Factory, TERRAIN_FONCIER: Trees,
  HOTELIER: Hotel, HEBERGEMENT: Hotel, EVENEMENTIEL: PartyPopper,
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

/**
 * Carte d'une recherche confiée — extraite pour être partagée entre la liste publique (/demandes,
 * où l'on veut contacter le demandeur) et "Mes recherches confiées" (/profile/researches, où l'on
 * est le demandeur : pas de bouton "contacter", juste la date de dépôt).
 */
export function EntrustedResearchCard({ research: r, variant = "public", onRefreshed, display = "grid" }: { research: any; variant?: "public" | "mine" | "detail"; onRefreshed?: () => void; display?: "grid" | "large" | "list" }) {
  const t = useTranslations("Demandes")
  const locale = useLocale()
  const [refreshing, setRefreshing] = useState(false)
  const [refreshMsg, setRefreshMsg] = useState<{ ok: boolean; text: string } | null>(null)

  // Actualiser (1 point) : la demande remonte en tête de /demandes, comme « actualiser » une annonce.
  const refresh = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) return
    setRefreshing(true)
    setRefreshMsg(null)
    try {
      await axios.put(`${API_URL}/points/researches/${r.id}/boost`, {}, { headers: { Authorization: `Bearer ${token}` } })
      setRefreshMsg({ ok: true, text: t("refreshDone") })
      onRefreshed?.()
    } catch (e: any) {
      setRefreshMsg({ ok: false, text: e?.response?.status === 400 ? t("refreshNoPoints") : t("refreshError") })
    } finally {
      setRefreshing(false)
    }
  }
  const lastActivity = new Date(r.lastActivityAt || r.refreshDate || r.createdAt)
  const relativeTime = (() => {
    const diffMs = lastActivity.getTime() - Date.now()
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })
    const mins = Math.round(diffMs / 60000)
    if (Math.abs(mins) < 60) return rtf.format(mins, "minute")
    const hours = Math.round(mins / 60)
    if (Math.abs(hours) < 24) return rtf.format(hours, "hour")
    const days = Math.round(hours / 24)
    if (Math.abs(days) < 30) return rtf.format(days, "day")
    return rtf.format(Math.round(days / 30), "month")
  })()
  const wasRefreshed = !!r.refreshDate
  const catColor = getCategoryColor(r.realEstateType || "RESIDENTIEL")
  const CatIcon = CATEGORY_ICONS[r.realEstateType] || Home
  const coverImage = CATEGORY_IMAGES[r.realEstateType]
  const tOpt = useTranslations("ResearchOptions")
  const tCat = useTranslations("Categories")
  const tPt = useTranslations("PropertyTypes")

  const getCategoryLabel = (id?: string) =>
    id ? (tCat.has(id) ? tCat(id) : REAL_ESTATE_CATEGORIES.find((c) => c.id === id)?.label) : undefined
  const resolvePropertyType = (id: string) => {
    if (tPt.has(id)) return tPt(id)
    for (const br of RESEARCH_BRANCH_IDS) {
      const k = `RESEARCH_PROPERTY_TYPES.${br}.${id}`
      if (tOpt.has(k)) return tOpt(k)
    }
    return PROPERTY_TYPE_LABELS_FR[id] || id
  }
  const resolveEnvironment = (id: string) =>
    tOpt.has(`ENVIRONMENT_OPTIONS.${id}`) ? tOpt(`ENVIRONMENT_OPTIONS.${id}`) : (ENVIRONMENT_LABELS_FR[id] || id)
  const resolveVillaEntrance = (id: string) =>
    tOpt.has(`VILLA_LEVEL_ENTRANCE_OPTIONS.${id}`) ? tOpt(`VILLA_LEVEL_ENTRANCE_OPTIONS.${id}`) : VILLA_ENTRANCE_LABELS_FR[id]

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
  const propertyTypeLabels: string[] = propertyTypeIds.map((id: string) => resolvePropertyType(id))

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
  const villaEntranceLabel = locationCriteria?.villaLevelEntrance ? resolveVillaEntrance(locationCriteria.villaLevelEntrance) : null
  const environmentLabels: string[] = (locationCriteria?.environment || []).map((id: string) => resolveEnvironment(id)).filter(Boolean)

  // Carte publique (/demandes) — même échelle visuelle que PropertyCard (image généreuse, mêmes
  // badges, même rythme typographique) mais SANS ligne "prix" en haut à côté du titre : une
  // recherche confiée n'a pas de prix fixe, seulement une fourchette de budget, qui reste affichée
  // plus bas avec les autres critères (surface, typologie) plutôt que forcée en haut comme sur une
  // annonce. L'image gagne l'espace ainsi libéré (demande client du 15/10/2026).
  if (variant === "public") {
    const isList = display === "list"
    const isLarge = display === "large"
    const shownTypes = propertyTypeLabels.slice(0, isList || isLarge ? 4 : 2)
    const extraTypes = propertyTypeLabels.length - shownTypes.length
    const specChips = [budgetLabel, surfaceLabel, typologyLabel].filter(Boolean) as string[]
    return (
      <Link
        href={`/demandes/${r.id}`}
        className={`group bg-white dark:bg-[#03303c] rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 dark:border-white/10 overflow-hidden flex ${isList ? "flex-row items-start" : "flex-col"}`}
      >
        <div
          className={`relative overflow-hidden shrink-0 ${isList ? "w-52 sm:w-72 lg:w-[22rem] h-[230px] sm:h-[250px] self-start" : isLarge ? "h-[280px]" : "h-[240px] min-h-[240px]"}`}
          style={{ backgroundColor: catColor.hex }}
        >
          {coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={encodeURI(coverImage)} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover object-bottom transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <CatIcon className="absolute -bottom-3 -end-1 h-24 w-24 text-white/20" />
          )}
          <span className={`absolute top-3.5 start-3.5 rounded-full font-bold uppercase tracking-wide text-white ${isList ? "px-3.5 py-1.5 text-xs" : "px-2.5 py-1 text-[10px] rtl:text-xs"} ${r.transaction === "SALE" ? "bg-[#00BFA6]" : r.transaction === "RENTAL" ? "bg-[#003B4A]" : "bg-gray-700"}`}>
            {r.transaction === "SALE" ? t("sale") : r.transaction === "RENTAL" ? t("rental") : t("holiday")}
          </span>
          {wasRefreshed && (
            <span className="absolute top-3 end-3 inline-flex items-center gap-1 h-8 px-2.5 rounded-full text-[11px] font-bold uppercase bg-amber-400 text-amber-950">
              <Zap className="h-3 w-3" /> {t("refreshedBadge")}
            </span>
          )}
        </div>
        <div className={`flex flex-col gap-2.5 flex-1 min-w-0 ${isList ? "p-5 sm:p-6" : "p-4"}`}>
          {shownTypes.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {shownTypes.map((label, i) => (
                <span key={i} className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#00BFA6]/10 text-[#00908A] dark:text-[#5EEAD4]">{label}</span>
              ))}
              {extraTypes > 0 && <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/60">+{extraTypes}</span>}
            </div>
          )}
          {r.title && (
            <h3 className={`font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 break-words [overflow-wrap:anywhere] ${isList ? "text-xl" : "text-[15px]"}`}>{r.title}</h3>
          )}
          {locationLabel && (
            <div className="flex items-start gap-1.5 text-sm text-gray-500 dark:text-white/50 font-medium">
              <MapPin className="h-4 w-4 text-[#00BFA6] shrink-0 mt-0.5" />
              <span className="line-clamp-2 break-words">{locationLabel}</span>
            </div>
          )}
          {specChips.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {specChips.map((label, i) => (
                <span key={i} className="inline-flex items-center rounded-full bg-gray-100 dark:bg-white/10 px-3 py-1 text-xs font-semibold text-gray-700 dark:text-white/80">{label}</span>
              ))}
            </div>
          )}
          {(isList || isLarge) && r.comment && (
            <p className={`text-sm text-gray-500 dark:text-white/50 leading-relaxed whitespace-pre-line break-words [overflow-wrap:anywhere] ${isList ? "line-clamp-2" : "line-clamp-3"}`}>{r.comment}</p>
          )}
          <div className="mt-auto flex items-center justify-between gap-2 border-t border-gray-100 dark:border-white/10 pt-3 text-xs text-gray-400 dark:text-white/40 font-medium">
            <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{relativeTime}</span>
            <span className="inline-flex items-center gap-1 font-bold text-[#00BFA6]">{t("viewRequest")} <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" /></span>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div className="group bg-white dark:bg-white/5 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 dark:border-white/10 overflow-hidden flex flex-col">
      {/* Bandeau photo selon l'activité — agrandi pour la même échelle que les cartes /announces */}
      <div className="relative h-48 overflow-hidden" style={{ backgroundColor: catColor.hex }}>
        {coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={encodeURI(coverImage)} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover object-bottom transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <CatIcon className="absolute -bottom-4 -end-2 h-32 w-32 text-white/20" />
        )}
        {!coverImage && <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />}
        <div className="absolute top-3 inset-x-3 flex items-start justify-between gap-2">
          <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-white/95 text-[#003B4A] shadow-sm">
            {r.transaction === "SALE" ? t("sale") : r.transaction === "RENTAL" ? t("rental") : t("holiday")}
          </span>
          {wasRefreshed && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide bg-amber-400 text-amber-950 shadow-sm">
              <Zap className="h-3 w-3" /> {t("refreshedBadge")}
            </span>
          )}
        </div>
        {!coverImage && (
          <div className="absolute bottom-3 inset-x-3 flex items-center gap-2 text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm shrink-0">
              <CatIcon className="h-4 w-4" />
            </span>
            <span className="text-sm font-bold drop-shadow">{getCategoryLabel(r.realEstateType) || r.realEstateType}</span>
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col gap-4 flex-1">
      {r.title && <h2 className="text-lg font-extrabold text-gray-900 dark:text-white leading-snug break-words [overflow-wrap:anywhere]">{r.title}</h2>}

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
        <p className="text-gray-600 dark:text-white/60 text-sm leading-relaxed line-clamp-4 whitespace-pre-line break-words [overflow-wrap:anywhere]">{r.comment}</p>
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
            {new Date(r.installationDate).toLocaleDateString(locale)}
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

      {variant !== "mine" ? (
        <>
          {requesterName && (
            <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-white/40 font-bold uppercase tracking-wide">
              {r.user?.companyName ? <Store className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
              {requesterName}
            </div>
          )}
          <div className="mt-auto flex items-center justify-between gap-2 text-xs text-gray-400 dark:text-white/40 font-medium">
            <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{relativeTime}</span>
          </div>
        </>
      ) : (
        <div className="mt-auto pt-2 space-y-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-white/40 font-medium">
            <Calendar className="h-3.5 w-3.5" />
            {t("submittedOn", { date: new Date(r.createdAt).toLocaleDateString(locale) })}
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={refreshing}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#003B4A] hover:bg-[#0094BD] disabled:opacity-60 text-white text-sm font-bold py-2.5 transition-colors"
          >
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {t("refreshBtn")}
          </button>
          {refreshMsg && (
            <p className={refreshMsg.ok ? "text-xs font-bold text-emerald-600" : "text-xs font-bold text-red-500"}>
              {refreshMsg.text}{!refreshMsg.ok && <> — <Link href="/profile/points" className="underline">{t("buyPoints")}</Link></>}
            </p>
          )}
        </div>
      )}
      </div>
    </div>
  )
}
