import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import axios from "axios";
import { useLocale, useTranslations } from "next-intl";
import { Camera, Eye, Heart, MapPin, Building2, Play, Images, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePropertyTypeLabel, useLocalizedPlaceName, useLocalizedContent } from "@/lib/typeLabels";
import { PROPERTY_TYPES } from "@/data/propertyTypes";
import { getCategoryColor } from "@/data/categoryColors";
import { ScrollingTitle } from "@/components/ScrollingTitle";

// Helper for Image URLs
const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    let cleanUrl = url.replace(/\\/g, '/');
    if (cleanUrl.startsWith('/')) {
        cleanUrl = cleanUrl.substring(1);
    }
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/${cleanUrl}`;
}

const TERRAIN_TOPOGRAPHIE_LABELS: Record<string, string> = {
    PLAT: "Plat",
    EN_PENTE: "En pente",
    ACCIDENTE: "Accidenté",
};

// Fondu par domaine (dégradé, pas un aplat) — donne un repère visuel par catégorie tout en
// gardant les infos lisibles sans écraser la photo. Indépendant du badge vente/location.
const CATEGORY_OVERLAY_COLOR: Record<string, string> = {
    RESIDENTIEL: getCategoryColor("RESIDENTIEL").overlayFrom,
    BUREAUX_COMMERCES: getCategoryColor("BUREAUX_COMMERCES").overlayFrom,
    INDUSTRIEL: getCategoryColor("INDUSTRIEL").overlayFrom,
    TERRAIN_FONCIER: getCategoryColor("TERRAIN_FONCIER").overlayFrom,
    HOTELIER: getCategoryColor("HOTELIER").overlayFrom,
    HEBERGEMENT: getCategoryColor("HEBERGEMENT").overlayFrom,
};

const IMMEUBLE_TYPES = ["IMMEUBLE_RESIDENTIEL", "IMMEUBLE_BUREAU"];

// Bandeau inférieur de la photo : 2-3 critères clés, propres à chaque domaine.
// Hébergement & Séjour non traité pour l'instant (aucun bandeau affiché).
// Critères clés (2-3 puces) — partagés entre le bandeau de la photo et la vue « liste ».
function useSpecItems(announce: any) {
    const t = useTranslations("PropertyCard");
    // Arabe : unité « م² » et typologie « F4 » -> « 4 غرف » (au lieu de « m² » / « F4 » en français)
    const isAr = useLocale() === "ar";
    const sqm = isAr ? "م²" : "m²";
    const typologyLabel = (raw: string) => {
        const m = /^F\s*(\d+)$/i.exec(String(raw).trim());
        if (!isAr || !m) return raw;
        const n = Number(m[1]);
        if (n === 1) return "غرفة واحدة";
        if (n === 2) return "غرفتان";
        return n <= 10 ? `${n} غرف` : `${n} غرفة`;
    };
    // Groupes déjà traduits côté /deposit, réutilisés tels quels pour rester cohérent entre
    // saisie et lecture (mêmes ids, mêmes libellés) sans dupliquer de traductions.
    const tDep = useTranslations("DepositOptions");
    const property = announce.property || {};
    const pType = (property._displayPropertyType || property.propertyType || "").toUpperCase();
    const typeObj = PROPERTY_TYPES.find((t) => t.id === pType);
    const categoryId = typeObj?.categoryId;

    let amenities: any = {};
    try { amenities = property.amenities ? JSON.parse(property.amenities) : {}; } catch { amenities = {}; }

    let items: string[] = [];
    // Hangar et immeubles : informations longues / en deux blocs — affichées sur deux lignes propres
    // (alignées à gauche, sans puce) plutôt que de laisser l'usage passer à la ligne avec une puce orpheline.
    const stacked = pType === "HANGAR" || IMMEUBLE_TYPES.includes(pType);
    if (categoryId === "RESIDENTIEL" || categoryId === "BUREAUX_COMMERCES") {
        if (IMMEUBLE_TYPES.includes(pType)) {
            const bt = amenities?.buildingTypology;
            // Ligne 1 : typologie seule. Ligne 2 : « N étages • N appartements ».
            if (bt?.mode) items.push(bt.mode === "SIMILAIRES" ? t("overlayTypologySimilaire") : t("overlayTypologyDifferente"));
            const line2: string[] = [];
            // Immeuble : nbFloors est un nombre d'étages ("8 étages"), pas un numéro d'étage
            if (property.nbFloors !== null && property.nbFloors !== undefined) line2.push(t("overlayFloorCount", { n: Number(property.nbFloors) }));
            if (bt?.totalApartments) line2.push(t("overlayTotalApartments", { n: bt.totalApartments }));
            if (line2.length) items.push(line2.join(" • "));
        } else if (pType === "BLOC_ADMINISTRATIF") {
            // Bloc administratif : les étages et la surface bâtie vivent dans amenities.bloc (fiche dédiée),
            // pas dans property.nbFloors/area — sans ça la carte n'affichait rien.
            const bloc = amenities?.bloc;
            const batie = bloc?.surfaces?.batie ?? property.area;
            if (batie) items.push(`${batie} ${sqm}`);
            const etages = bloc?.structure?.etages;
            if (etages !== null && etages !== undefined) items.push(t("overlayFloorCount", { n: Number(etages) }));
        } else {
            if (property.typology) items.push(typologyLabel(property.typology));
            if (property.area) items.push(`${property.area} ${sqm}`);
            if (property.nbFloors !== null && property.nbFloors !== undefined) {
                // Niveau de villa : "Rez-de-chaussée" / "Étage supérieur" plutôt que "Étage 0/1"
                if (pType === "NIVEAU_VILLA" || pType === "NIVEAU_VILLA_COMMERCIAL") items.push(Number(property.nbFloors) === 0 ? t("overlayLevelGround") : t("overlayLevelUpper"));
                // Villa : nbFloors est un nombre d'étages ("1 étage", "2 étages") ; appartement etc. : numéro d'étage
                else if (pType === "VILLA" || pType === "VILLA_COMMERCIALE") items.push(t("overlayFloorCount", { n: Number(property.nbFloors) }));
                else items.push(t("overlayFloor", { n: property.nbFloors }));
            }
        }
    } else if (categoryId === "INDUSTRIEL") {
        if (pType === "CHAMBRE_FROIDE") {
            const cr = amenities?.coldRoom;
            const capacity = cr?.dimensions?.capacity;
            // Sur la carte : "Cellule unique" / "Plusieurs cellules" et "Positif / Négatif / Ultra Froid",
            // sans la précision entre parenthèses (gardée sur la fiche détail).
            const stripParens = (label: string) => label.replace(/\s*\([^)]*\)/g, '').trim();
            if (cr?.structureType) items.push(stripParens(tDep(`CF_STRUCTURE_TYPES.${cr.structureType}.label`)));
            // Ordre : type de structure, capacité, puis type de froid
            if (capacity) items.push(t("overlayCapacity", { v: capacity }));
            const typeFroid: string[] = cr?.typeFroid || [];
            if (typeFroid.length) items.push(typeFroid.map((id) => stripParens(tDep(`CF_TYPE_FROID.${id}.label`))).join(' / '));
        } else if (pType === "USINE") {
            const uf = amenities?.industrialFactory;
            const sector = uf?.sector?.[0];
            if (sector) items.push(tDep(`INDUSTRIAL_SECTORS.${sector}.label`));
            // Carte : "Sans équipement" (murs nus) / "Avec équipement" (équipée), sans parenthèses.
            if (uf?.rentalType === "MURS_NUS") items.push(t("overlayFactoryBare"));
            else if (uf?.rentalType === "EQUIPEE") items.push(t("overlayFactoryEquipped"));
            else if (uf?.rentalType) items.push(tDep(`INDUSTRIAL_RENTAL_TYPES.${uf.rentalType}.label`).replace(/\s*\([^)]*\)/g, '').trim());
        } else if (pType === "HANGAR") {
            const hg = amenities?.hangar;
            if (hg?.surfaces?.covered) items.push(t("overlayCovered", { v: hg.surfaces.covered }));
            const usage: string[] = hg?.usage || [];
            if (usage.includes("STOCKAGE_LOGISTIQUE") && usage.includes("PRODUCTION_INDUSTRIEL")) items.push(t("overlayUsageBoth"));
            else if (usage.includes("STOCKAGE_LOGISTIQUE")) items.push(t("overlayUsageStockage"));
            else if (usage.includes("PRODUCTION_INDUSTRIEL")) items.push(t("overlayUsageProduction"));
        } else {
            if (property.landArea) items.push(t("overlayLand", { v: property.landArea }));
            if (property.builtArea) items.push(t("overlayCovered", { v: property.builtArea }));
        }
    } else if (categoryId === "TERRAIN_FONCIER") {
        // Une seule ligne : topographie • surface (sans le mot "Terrain") • nombre de façades.
        const topo = amenities?.terrain?.topographie;
        if (topo) items.push(t.has(`overlayTopo${topo}`) ? t(`overlayTopo${topo}`) : (TERRAIN_TOPOGRAPHIE_LABELS[topo] || topo));
        const landArea = property.landArea || property.area;
        if (landArea) items.push(`${landArea} ${sqm}`);
        if (property.facadesCount) items.push(t("overlayFacades", { n: Number(property.facadesCount) }));
    }

    return { items, stacked, categoryId };
}

function PhotoOverlaySpecs({ announce }: { announce: any }) {
    const { items, stacked, categoryId } = useSpecItems(announce);
    if (items.length === 0) return null;

    return (
        <div className={cn(
            "absolute bottom-0 inset-x-0 px-3.5 pt-9 pb-2.5 flex bg-gradient-to-t to-transparent",
            stacked ? "flex-col items-start gap-0.5" : "items-end gap-2 flex-wrap",
            CATEGORY_OVERLAY_COLOR[categoryId as string] || "from-[#003B4A]/90"
        )}>
            {items.map((item, i) => (
                <span key={i} className="flex items-center gap-2 text-white text-[11px] rtl:text-xs font-bold [text-shadow:0_1px_2px_rgb(0_0_0_/_0.4)]">
                    {i > 0 && !stacked && <span className="h-1 w-1 rounded-full bg-white/50" />}
                    {item}
                </span>
            ))}
        </div>
    )
}


type PropertyCardProps = {
  announce: any;
  autoPlay?: boolean;
  /** Réorganisation plus éditoriale réservée aux carrousels de la page d'accueil. */
  variant?: "default" | "home";
  /** "horizontal" = vignette à gauche + contenu à droite (vue "liste" de `/announces`). */
  layout?: "vertical" | "horizontal";
  /** État initial du cœur, fourni par les pages qui le connaissent déjà (ex. « Mes favoris »). */
  initialFavorite?: boolean;
  /** Appelé après un toggle réussi afin que la page parente puisse synchroniser sa liste. */
  onFavoriteChange?: (isFavorite: boolean) => void;
};

export const PropertyCard = ({ announce, autoPlay = false, variant = "default", layout = "vertical", initialFavorite = false, onFavoriteChange }: PropertyCardProps) => {
  const isHorizontal = layout === "horizontal";
  const listSpecs = useSpecItems(announce);
  const t = useTranslations("PropertyCard");
  const ptLabel = usePropertyTypeLabel();
  const place = useLocalizedPlaceName();
  const lc = useLocalizedContent();
  const isCompany = announce.user?.companyName || announce.user?.userType === 'SOCIETE';
  const companyDisplayName = lc(announce.user?.companyName, announce.user?.companyNameAr, announce.user?.companyNameEn);
  const listDescription = lc(announce.shortDescription, announce.shortDescriptionAr, announce.shortDescriptionEn);
  const isHomeVariant = variant === "home";
  const isArabicUi = useLocale() === "ar";

  const commune = place.town(announce.property?.address?.town);
  const wilaya = place.city(announce.property?.address?.town?.city);
  const locationLabel = [commune, wilaya].filter(Boolean).join(" - ") || t("defaultCountry");

  // Normalize Property Type for Display — use cross-display type if available (cross-category context)
  const pType = announce.property?._displayPropertyType || announce.property?.propertyType;
  const typeObj = PROPERTY_TYPES.find((pt) => pt.id === pType?.toUpperCase() || pt.label === pType);
  const categoryName = typeObj ? ptLabel(typeObj.id, typeObj.label) : (pType || t("defaultCategory"));
  const isSale = announce.type === "SALE";

  // Titre corrigé/traduit automatiquement à la création (fr = repli) : affiché dans la langue du visiteur
  const fullTitle = lc(announce.title, announce.titleAr, announce.titleEn) || t("titleFallback", { category: categoryName, location: locationLabel });
  const formattedPrice = new Intl.NumberFormat('fr-DZ').format(announce.price);

  const images = announce.property?.images || [];

  // Média principal — mélange photos + vidéos (vidéo de couverture en tête si le déposant en a
  // choisi une), pour un aperçu qui défile au survol de la carte, comme sur la fiche annonce.
  const coverVideoIndex: number | null = typeof announce.property?.coverVideoIndex === 'number' ? announce.property.coverVideoIndex : null;
  let videosList: string[] = [];
  try { videosList = announce.property?.videos ? JSON.parse(announce.property.videos) : []; } catch { videosList = []; }

  const mediaList = useMemo(() => {
    const orderedImages = [...images];
    const mainIdx = orderedImages.findIndex((img: any) => img.isMain);
    if (mainIdx > 0) orderedImages.unshift(orderedImages.splice(mainIdx, 1)[0]);
    const photos = orderedImages.map((img: any) => ({ type: 'photo' as const, url: img.url }));
    const videos = videosList.map((v) => ({ type: 'video' as const, url: v }));
    if (coverVideoIndex !== null && videos[coverVideoIndex]) {
      const cover = videos[coverVideoIndex];
      const rest = videos.filter((_, i) => i !== coverVideoIndex);
      return [cover, ...photos, ...rest];
    }
    return [...photos, ...videos];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images, videosList.join('|'), coverVideoIndex]);

  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [isHovering, setIsHovering] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);

  // Défile pendant le survol partout, et en continu (sans survol) là où `autoPlay` est activé —
  // réservé aux carrousels vitrine (accueil) qui n'affichent qu'une poignée de cartes à la fois,
  // pour ne pas faire tourner des dizaines de minuteurs/vidéos sur une grande grille.
  const isCycling = autoPlay || isHovering;
  useEffect(() => {
    if (!isCycling || mediaList.length <= 1) return;
    const id = setInterval(() => setHeroIndex((i) => (i + 1) % mediaList.length), 3200);
    return () => clearInterval(id);
  }, [isCycling, mediaList.length]);

  const currentMedia = mediaList[heroIndex] || mediaList[0];

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem('token');
    if (!token) {
        alert(t("loginToFavorite"));
        return;
    }

    try {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/favorites/${announce.id}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const next = !isFavorite;
        setIsFavorite(next);
        onFavoriteChange?.(next);
    } catch (error) {
        console.error("Error toggling favorite", error);
    }
  };

  return (
    <Link href={`/announces/${announce.id}`} className="block h-full w-full">
      <div className={cn(
        "bg-white dark:bg-[#03303c] rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer border border-gray-100 dark:border-white/10 h-full w-full overflow-hidden",
        isHorizontal ? "flex flex-row" : "flex flex-col"
      )}>

        {/* Image */}
        <div
          className={cn(
            "relative overflow-hidden bg-gray-100 shrink-0",
            isHorizontal ? "w-52 sm:w-72 lg:w-[22rem] h-full min-h-[230px] sm:min-h-[250px]" : "h-[240px] min-h-[240px]"
          )}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => { setIsHovering(false); setHeroIndex(0) }}
        >
          {currentMedia ? (
            currentMedia.type === 'video' ? (
              <video
                key={heroIndex}
                src={getImageUrl(currentMedia.url) || ''}
                autoPlay muted loop playsInline
                className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 animate-media-fade"
              />
            ) : (
              <img
                  key={heroIndex}
                  src={getImageUrl(currentMedia.url) || ''}
                  alt={announce.reference}
                  className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 animate-media-fade"
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
                <Camera className="h-10 w-10" strokeWidth={1.5} />
            </div>
          )}

          {/* Aperçu galerie au survol — mélange photos et vidéos, comme sur la fiche annonce */}
          {isHovering && mediaList.length > 1 && (
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white gap-2 pointer-events-none">
              <span className="text-2xl font-black [text-shadow:0_1px_3px_rgb(0_0_0_/_0.4)]">+{mediaList.length - 1}</span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 text-gray-900 text-xs rtl:text-sm font-bold shadow-lg">
                <Images className="h-3.5 w-3.5" /> {t("seeGallery")}
              </span>
            </div>
          )}

          {currentMedia?.type === 'video' && (
            <span className="absolute bottom-3 left-3 flex items-center gap-1 h-6 w-6 rounded-full bg-black/55 backdrop-blur-sm text-white justify-center">
              <Play className="h-3 w-3 fill-white" />
            </span>
          )}

          {/* Transaction — un seul badge, aux couleurs de la marque */}
          <span className={cn(
              "absolute top-3.5 left-3.5 rounded-full font-bold uppercase tracking-wide text-white",
              isHorizontal ? "px-3.5 py-1.5 text-xs" : "px-2.5 py-1 text-[10px] rtl:text-xs",
              isSale ? "bg-[#00BFA6]" : "bg-[#003B4A]"
            )}>
              {isSale ? t("sale") : t("rental")}
          </span>

          {/* Photos, vues puis favori — regroupés en haut à droite */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
              {mediaList.length > 0 && (
                <span className="flex items-center gap-1 h-8 px-2.5 rounded-full bg-black/45 backdrop-blur-sm text-white text-[11px] font-bold">
                  <Camera className="h-3.5 w-3.5" /> {mediaList.length}
                </span>
              )}
              <span className="flex items-center gap-1 h-8 px-2.5 rounded-full bg-black/45 backdrop-blur-sm text-white text-[11px] font-bold">
                <Eye className="h-3.5 w-3.5" /> {announce.nbViews || 0}
              </span>
              <button
                  onClick={toggleFavorite}
                  aria-label={t("loginToFavorite")}
                  className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-500 hover:text-[#00BFA6] transition-colors shrink-0"
              >
                  <Heart className={cn("h-4 w-4", isFavorite && "fill-[#00BFA6] text-[#00BFA6]")} />
              </button>
          </div>

          {!isHorizontal && <PhotoOverlaySpecs announce={announce} />}
        </div>

        {/* Contenu — sur l'accueil, la catégorie reste entière puis titre et prix partagent la ligne suivante. */}
        {isHorizontal ? (
        /* Vue « liste » : contenu généreux (titre et prix plus grands, critères en puces, description), sans vide */
        <div className="p-5 sm:p-6 flex flex-col flex-1 min-w-0 gap-3">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <span dir="auto" className="block text-start text-[#00BFA6] font-bold text-xs rtl:text-sm uppercase tracking-wide">{categoryName}</span>
                    <ScrollingTitle
                        text={fullTitle}
                        className="mt-1 text-xl font-bold leading-snug text-gray-900 dark:text-white"
                    />
                    <div className="mt-1.5 flex min-w-0 items-center gap-1.5 text-sm text-gray-500 dark:text-white/50 font-medium">
                        <MapPin className="h-4 w-4 text-[#00BFA6] shrink-0" />
                        <span dir="auto" className="truncate">{locationLabel}</span>
                    </div>
                </div>
                <div className="shrink-0 text-end">
                    <span dir="ltr" className="block whitespace-nowrap text-2xl font-extrabold tabular-nums leading-none text-[#003B4A] dark:text-[#5EEAD4]">
                        {formattedPrice}
                        <span className="ms-1 text-xs font-semibold text-gray-400 dark:text-white/40">DA</span>
                    </span>
                    <span className={cn("mt-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white", isSale ? "bg-[#00BFA6]" : "bg-[#003B4A]")}>
                        {isSale ? t("sale") : t("rental")}
                    </span>
                </div>
            </div>

            {listSpecs.items.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {listSpecs.items.map((item, i) => (
                        <span key={i} className="inline-flex items-center rounded-full bg-gray-100 dark:bg-white/10 px-3 py-1 text-xs rtl:text-[13px] font-semibold text-gray-700 dark:text-white/80">{item}</span>
                    ))}
                </div>
            )}

            {listDescription && (
                <p dir="auto" className="text-sm rtl:text-[15px] leading-relaxed text-gray-500 dark:text-white/50 line-clamp-2 break-words">{listDescription}</p>
            )}

            <div className="mt-auto flex items-center gap-2.5 border-t border-gray-100 pt-3 dark:border-white/10">
                {isCompany ? (
                    <>
                        <div className="h-9 w-9 rounded-full border border-gray-100 dark:border-white/10 shrink-0 overflow-hidden flex items-center justify-center bg-white dark:bg-white/5">
                            {announce.user?.agencyLogoUrl || announce.user?.imageUrl ? (
                                <img src={getImageUrl(announce.user.agencyLogoUrl || announce.user.imageUrl) || ''} alt={companyDisplayName || t("professionalSeller")} className="h-full w-full object-contain" />
                            ) : (
                                <Building2 className="h-4 w-4 text-gray-300 dark:text-white/30" />
                            )}
                        </div>
                        <ScrollingTitle text={companyDisplayName || t("professionalSeller")} className="flex-1 text-sm font-semibold text-gray-600 dark:text-white/60" />
                    </>
                ) : (
                    <>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-100 bg-gray-50 dark:border-white/10 dark:bg-white/5">
                            <UserRound className="h-4 w-4 text-gray-400 dark:text-white/40" />
                        </div>
                        <span className="truncate text-sm font-semibold text-gray-600 dark:text-white/60">{t("privateSeller")}</span>
                    </>
                )}
            </div>
        </div>
        ) : (
        <div className={cn("p-4 flex flex-col flex-1 min-w-0", isHomeVariant ? "min-h-36" : "gap-1.5")}>
            {isHomeVariant ? (
                <span dir="auto" className="block w-full break-words text-start text-[#00BFA6] font-bold text-[11px] rtl:text-xs leading-4 uppercase tracking-wide">
                    {categoryName}
                </span>
            ) : (
                <>
                    <span className="text-[#00BFA6] font-bold text-[11px] rtl:text-xs uppercase tracking-wide truncate">
                        {categoryName}
                    </span>
                    <div className="text-right">
                        <span className="text-base font-bold text-[#003B4A] dark:text-[#5EEAD4] leading-none whitespace-nowrap">
                            {formattedPrice}
                            <span className="text-[10px] text-gray-400 dark:text-white/40 font-semibold ml-1">DA</span>
                        </span>
                    </div>
                </>
            )}

            {isHomeVariant ? (
                <div dir={isArabicUi ? "rtl" : "ltr"} className="mt-2 flex min-w-0 items-center justify-between gap-3">
                    <ScrollingTitle
                        text={fullTitle}
                        className="text-[15px] font-semibold leading-5 text-gray-900 dark:text-white"
                    />
                    <span dir="ltr" className="shrink-0 whitespace-nowrap text-right text-base font-extrabold tabular-nums text-[#003B4A] dark:text-[#5EEAD4] leading-none">
                        {formattedPrice}
                        <span className="ml-1 text-[10px] font-semibold text-gray-400 dark:text-white/40">DA</span>
                    </span>
                </div>
            ) : (
                <ScrollingTitle
                    text={fullTitle}
                    className="text-gray-900 dark:text-white font-semibold text-[15px] leading-snug"
                />
            )}

            <div className={cn("flex min-w-0 items-center text-gray-400 dark:text-white/40 text-xs rtl:text-[13px] font-medium gap-1", isHomeVariant && "mt-1.5")}>
                <MapPin className="h-3.5 w-3.5 text-gray-300 dark:text-white/30 shrink-0" />
                <span dir="auto" className="truncate">{locationLabel}</span>
            </div>

            {/* L'identité du vendeur forme un pied stable ; les particuliers sont nommés sur l'accueil. */}
            <div className={cn(
                "mt-auto flex items-center gap-2",
                isHomeVariant ? "border-t border-gray-100 pt-2 dark:border-white/10" : "h-8 pt-2"
            )}>
                {isCompany ? (
                    <>
                        <div className={cn("rounded-full border border-gray-100 dark:border-white/10 shrink-0 overflow-hidden flex items-center justify-center bg-white dark:bg-white/5", isHomeVariant ? "h-9 w-9" : "h-7 w-7")}>
                            {announce.user?.agencyLogoUrl || announce.user?.imageUrl ? (
                                <img
                                    src={getImageUrl(announce.user.agencyLogoUrl || announce.user.imageUrl) || ''}
                                    alt={companyDisplayName || t("professionalSeller")}
                                    className="h-full w-full object-contain"
                                />
                            ) : (
                                <Building2 className="h-3.5 w-3.5 text-gray-300 dark:text-white/30" />
                            )}
                        </div>
                        {/* Nom d'agence trop long : défile comme le titre plutôt que d'être coupé. */}
                        <ScrollingTitle
                            text={companyDisplayName || (isHomeVariant ? t("professionalSeller") : "")}
                            className="flex-1 text-xs rtl:text-[13px] font-semibold text-gray-500 dark:text-white/50"
                        />
                    </>
                ) : isHomeVariant ? (
                    <>
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gray-100 bg-gray-50 dark:border-white/10 dark:bg-white/5">
                            <UserRound className="h-3.5 w-3.5 text-gray-400 dark:text-white/40" />
                        </div>
                        <span className="truncate text-xs rtl:text-[13px] font-semibold text-gray-500 dark:text-white/50">{t("privateSeller")}</span>
                    </>
                ) : null}
            </div>
        </div>
        )}
      </div>
    </Link>
  )
}
