"use client"

import { useState } from "react"
import axios from "axios"
import { useLocale, useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { MapPin, Calendar, Wallet, Ruler, ArrowRight, Home, User, Store, Factory, Briefcase, Trees, Hotel, PartyPopper, Zap, Loader2, RefreshCw } from "lucide-react"
import { getCategoryColor } from "@/data/categoryColors"
import { REAL_ESTATE_CATEGORIES, PROPERTY_TYPES } from "@/data/propertyTypes"
import { RESEARCH_PROPERTY_TYPES, ENVIRONMENT_OPTIONS, VILLA_LEVEL_ENTRANCE_OPTIONS } from "@/data/researchConfig"
import { CenterToast } from "@/components/CenterToast"
import { OwnerBadge } from "@/components/OwnerBadge"
import { ScrollingTitle } from "@/components/ScrollingTitle"

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
  const [refreshMsg, setRefreshMsg] = useState<{ ok: boolean; text: string; wait?: boolean } | null>(null)

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
      const data = e?.response?.data
      setRefreshMsg({
        ok: false,
        wait: data?.code === "REFRESH_COOLDOWN",
        // Délai de 45 min entre deux actualisations — distinct du solde insuffisant (autre 400).
        text: data?.code === "REFRESH_COOLDOWN"
          ? t("refreshCooldown", { minutes: data.remainingMinutes })
          : e?.response?.status === 400 ? t("refreshNoPoints") : t("refreshError"),
      })
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

  // Unité du budget — vit dans amenities (un des 4 emplacements possibles selon la fiche), pas
  // dans une colonne dédiée. L'afficher est nécessaire : minBudget/maxBudget stockent le chiffre
  // SAISI tel quel ("25" si l'utilisateur a choisi "Millions"), jamais converti en DA brut — sans
  // l'unité, "25" se lirait à tort comme 25 DA (retour client du 17/10/2026).
  const budgetUnit: string =
    amenities?.residentiel?.location?.budgetUnit ||
    amenities?.residentiel?.achatHabitation?.budgetUnit ||
    amenities?.bureaux?.groupee?.budgetUnit ||
    amenities?.bureaux?.blocAdministratif?.budgetUnit ||
    "DA"
  const BUDGET_UNIT_LABELS: Record<string, string> = {
    DA: "DA", DA_M2: "DA/m²", MILLION: t("curMillions"), MILLION_M2: t("curMillionsM2"), MILLIARD: t("curMilliards"),
  }
  const budgetUnitLabel = BUDGET_UNIT_LABELS[budgetUnit] || "DA"
  const fmtBudget = (n: number) => `${new Intl.NumberFormat("fr-DZ").format(n)} ${budgetUnitLabel}`
  const budgetLabel = r.minBudget && r.maxBudget
    ? `${new Intl.NumberFormat("fr-DZ").format(r.minBudget)} - ${fmtBudget(r.maxBudget)}`
    : r.maxBudget
    ? `${t("upTo")} ${fmtBudget(r.maxBudget)}`
    : r.minBudget
    ? `${t("from")} ${fmtBudget(r.minBudget)}`
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

  // Carte publique (/demandes) — STRICTEMENT la même structure que PropertyCard (demande client du
  // 06/11/2026 : « même affichage que les annonces ») : photo + badge transaction, catégorie en
  // capitales vertes, titre qui défile + budget à la place du prix, localisation, puis le pied auteur
  // partagé (OwnerBadge : photo du particulier ou logo du professionnel). Vue liste = vue liste des annonces.
  if (variant === "public") {
    const isList = display === "list"
    const isLarge = display === "large"
    const categoryText = propertyTypeLabels.length > 0 ? propertyTypeLabels.slice(0, 3).join(" · ") : (getCategoryLabel(r.realEstateType) || "")
    const cardTitle = r.title || [getCategoryLabel(r.realEstateType), locationLabel].filter(Boolean).join(" — ")
    const specChips = [surfaceLabel, typologyLabel, floorLabel].filter(Boolean) as string[]
    const transactionBadge = (
      <span className={`rounded-full font-bold uppercase tracking-wide text-white ${isList ? "px-3.5 py-1.5 text-xs" : "px-2.5 py-1 text-[10px] rtl:text-xs"} ${r.transaction === "SALE" ? "bg-[#00BFA6]" : r.transaction === "RENTAL" ? "bg-[#003B4A]" : "bg-gray-700"}`}>
        {r.transaction === "SALE" ? t("sale") : r.transaction === "RENTAL" ? t("rental") : t("holiday")}
      </span>
    )
    const budget = budgetLabel && (
      <span dir="ltr" className={`shrink-0 whitespace-nowrap font-extrabold tabular-nums leading-none text-[#003B4A] dark:text-[#5EEAD4] ${isList ? "text-2xl" : "text-base"}`}>{budgetLabel}</span>
    )
    const footer = (
      <div className={`mt-auto flex items-center justify-between gap-3 border-t border-gray-100 dark:border-white/10 ${isList ? "pt-3" : "pt-2"}`}>
        <OwnerBadge user={r.user} size="md" className="flex-1" />
        <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-gray-400 dark:text-white/40"><Calendar className="h-3 w-3" />{relativeTime}</span>
      </div>
    )
    return (
      <Link href={`/demandes/${r.id}`} className="block h-full w-full">
        <div className={`bg-white dark:bg-[#03303c] rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer border border-gray-100 dark:border-white/10 h-full w-full overflow-hidden ${isList ? "flex flex-row items-start" : "flex flex-col"}`}>
          {/* Image — mêmes dimensions que la photo d'une annonce */}
          <div
            className={`relative overflow-hidden shrink-0 ${isList ? "w-52 sm:w-72 lg:w-[22rem] h-[230px] sm:h-[250px] self-start" : isLarge ? "h-[280px] min-h-[280px]" : "h-[240px] min-h-[240px]"}`}
            style={{ backgroundColor: catColor.hex }}
          >
            {coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={encodeURI(coverImage)} alt="" loading="lazy" className="w-full h-full object-cover object-bottom group-hover:scale-[1.04] transition-transform duration-500" />
            ) : (
              <CatIcon className="absolute -bottom-3 -end-1 h-24 w-24 text-white/20" />
            )}
            <span className="absolute top-3.5 left-3.5">{transactionBadge}</span>
            {wasRefreshed && (
              <span className="absolute top-3 right-3 flex items-center gap-1 h-8 px-2.5 rounded-full bg-black/45 backdrop-blur-sm text-white text-[11px] font-bold">
                <Zap className="h-3.5 w-3.5 text-amber-300" /> {t("refreshedBadge")}
              </span>
            )}
          </div>

          {isList ? (
            <div className="p-5 sm:p-6 flex flex-col flex-1 min-w-0 gap-3 self-stretch">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <span dir="auto" className="block text-start text-[#00BFA6] font-bold text-xs rtl:text-sm uppercase tracking-wide">{categoryText}</span>
                  <ScrollingTitle text={cardTitle} className="mt-1 text-xl font-bold leading-snug text-gray-900 dark:text-white" />
                  {locationLabel && (
                    <div className="mt-1.5 flex min-w-0 items-center gap-1.5 text-sm text-gray-500 dark:text-white/50 font-medium">
                      <MapPin className="h-4 w-4 text-[#00BFA6] shrink-0" />
                      <span dir="auto" className="truncate">{locationLabel}</span>
                    </div>
                  )}
                </div>
                <div className="shrink-0 text-end">
                  {budget}
                  <span className="mt-2 block">{transactionBadge}</span>
                </div>
              </div>
              {specChips.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {specChips.map((item, i) => (
                    <span key={i} className="inline-flex items-center rounded-full bg-gray-100 dark:bg-white/10 px-3 py-1 text-xs rtl:text-[13px] font-semibold text-gray-700 dark:text-white/80">{item}</span>
                  ))}
                </div>
              )}
              {r.comment && (
                <p dir="auto" className="text-sm rtl:text-[15px] leading-relaxed text-gray-500 dark:text-white/50 line-clamp-2 break-words">{r.comment}</p>
              )}
              {footer}
            </div>
          ) : (
            <div className="p-4 flex flex-col flex-1 min-w-0 min-h-36">
              <span dir="auto" className="block w-full truncate text-start text-[#00BFA6] font-bold text-[11px] rtl:text-xs leading-4 uppercase tracking-wide">
                {categoryText}
              </span>
              <div className="mt-2 flex min-w-0 items-center justify-between gap-3">
                <ScrollingTitle text={cardTitle} className="text-[15px] font-semibold leading-5 text-gray-900 dark:text-white" />
                {budget}
              </div>
              {locationLabel && (
                <div className="mt-1.5 flex min-w-0 items-center text-gray-400 dark:text-white/40 text-xs rtl:text-[13px] font-medium gap-1">
                  <MapPin className="h-3.5 w-3.5 text-gray-300 dark:text-white/30 shrink-0" />
                  <span dir="auto" className="truncate">{locationLabel}</span>
                </div>
              )}
              {isLarge && specChips.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {specChips.map((item, i) => (
                    <span key={i} className="inline-flex items-center rounded-full bg-gray-100 dark:bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-gray-700 dark:text-white/80">{item}</span>
                  ))}
                </div>
              )}
              {isLarge && r.comment && (
                <p className="mt-2 text-sm text-gray-500 dark:text-white/50 leading-relaxed line-clamp-3 whitespace-pre-line break-words [overflow-wrap:anywhere]">{r.comment}</p>
              )}
              <div className="mt-3 flex flex-1 flex-col justify-end">{footer}</div>
            </div>
          )}
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
          {/* Retour d'actualisation au centre de l'écran (succès, délai de 45 min, points insuffisants). */}
          <CenterToast
            message={refreshMsg?.text}
            variant={refreshMsg?.ok ? "success" : refreshMsg?.wait ? "wait" : "error"}
            onClose={() => setRefreshMsg(null)}
            action={refreshMsg && !refreshMsg.ok && !refreshMsg.wait
              ? <Link href="/profile/points" className="font-bold text-[#0094BD] underline">{t("buyPoints")}</Link>
              : undefined}
          />
        </div>
      )}
      </div>
    </div>
  )
}
