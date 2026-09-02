import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import axios from "axios";
import { useTranslations } from "next-intl";
import { Camera, Eye, Heart, MapPin, Building2, Play, Images, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { PROPERTY_TYPES } from "@/data/propertyTypes";
import { getCategoryColor } from "@/data/categoryColors";

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

// Bandeau inférieur de la photo : 2-3 critères clés, propres à chaque domaine.
// Hébergement & Séjour non traité pour l'instant (aucun bandeau affiché).
function PhotoOverlaySpecs({ announce }: { announce: any }) {
    const property = announce.property || {};
    const pType = (property._displayPropertyType || property.propertyType || "").toUpperCase();
    const typeObj = PROPERTY_TYPES.find((t) => t.id === pType);
    const categoryId = typeObj?.categoryId;

    let amenities: any = {};
    try { amenities = property.amenities ? JSON.parse(property.amenities) : {}; } catch { amenities = {}; }

    let items: string[] = [];
    if (categoryId === "RESIDENTIEL" || categoryId === "BUREAUX_COMMERCES") {
        if (property.typology) items.push(property.typology);
        if (property.area) items.push(`${property.area} m²`);
        if (property.nbFloors !== null && property.nbFloors !== undefined) items.push(`Étage ${property.nbFloors}`);
    } else if (categoryId === "INDUSTRIEL") {
        if (property.landArea) items.push(`Terrain ${property.landArea} m²`);
        if (property.builtArea) items.push(`Couverte ${property.builtArea} m²`);
    } else if (categoryId === "TERRAIN_FONCIER") {
        if (property.landArea || property.area) items.push(`Terrain ${property.landArea || property.area} m²`);
        const topo = amenities?.terrain?.topographie;
        if (topo) items.push(TERRAIN_TOPOGRAPHIE_LABELS[topo] || topo);
    }

    if (items.length === 0) return null;

    return (
        <div className={cn(
            "absolute bottom-0 inset-x-0 px-3.5 pt-9 pb-2.5 flex items-end gap-2 flex-wrap bg-gradient-to-t to-transparent",
            CATEGORY_OVERLAY_COLOR[categoryId as string] || "from-[#003B4A]/90"
        )}>
            {items.map((item, i) => (
                <span key={i} className="flex items-center gap-2 text-white text-[11px] font-bold [text-shadow:0_1px_2px_rgb(0_0_0_/_0.4)]">
                    {i > 0 && <span className="h-1 w-1 rounded-full bg-white/50" />}
                    {item}
                </span>
            ))}
        </div>
    )
}

// Titre de carte trop long pour tenir sur une ligne : défile tout seul jusqu'au bout puis revient,
// plutôt que de couper avec "..." derrière une icône (i) qu'il fallait survoler pour lire la
// suite — surtout gênant au tactile, où le survol n'existe pas. Ne s'anime que si ça déborde
// vraiment (mesuré à l'affichage), sinon le titre reste simplement affiché tel quel.
function ScrollingTitle({ text, className, dir = "auto" }: { text: string; className?: string; dir?: "auto" | "ltr" | "rtl" }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [overflowPx, setOverflowPx] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (!containerRef.current || !textRef.current) return;
      const diff = textRef.current.scrollWidth - containerRef.current.clientWidth;
      setOverflowPx(diff > 2 ? diff : 0);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [text]);

  return (
    <div ref={containerRef} dir={dir} className={cn("min-w-0 overflow-hidden", className)}>
      <span
        ref={textRef}
        className={cn("inline-block whitespace-nowrap", overflowPx > 0 && "animate-marquee-title")}
        style={overflowPx > 0 ? ({ "--scroll-distance": `${overflowPx}px` } as React.CSSProperties) : undefined}
      >
        {text}
      </span>
    </div>
  );
}

type PropertyCardProps = {
  announce: any;
  autoPlay?: boolean;
  /** Réorganisation plus éditoriale réservée aux carrousels de la page d'accueil. */
  variant?: "default" | "home";
  /** État initial du cœur, fourni par les pages qui le connaissent déjà (ex. « Mes favoris »). */
  initialFavorite?: boolean;
  /** Appelé après un toggle réussi afin que la page parente puisse synchroniser sa liste. */
  onFavoriteChange?: (isFavorite: boolean) => void;
};

export const PropertyCard = ({ announce, autoPlay = false, variant = "default", initialFavorite = false, onFavoriteChange }: PropertyCardProps) => {
  const t = useTranslations("PropertyCard");
  const isCompany = announce.user?.companyName || announce.user?.userType === 'SOCIETE';
  const isHomeVariant = variant === "home";

  const commune = announce.property?.address?.town?.nameFr;
  const wilaya = announce.property?.address?.town?.city?.nameFr;
  const locationLabel = [commune, wilaya].filter(Boolean).join(" - ") || t("defaultCountry");

  // Normalize Property Type for Display — use cross-display type if available (cross-category context)
  const pType = announce.property?._displayPropertyType || announce.property?.propertyType;
  const typeObj = PROPERTY_TYPES.find((pt) => pt.id === pType?.toUpperCase() || pt.label === pType);
  const categoryName = typeObj ? typeObj.label : (pType || t("defaultCategory"));
  const isSale = announce.type === "SALE";

  const fullTitle = announce.title || t("titleFallback", { category: categoryName, location: locationLabel });
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
      <div className="bg-white dark:bg-[#03303c] rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer border border-gray-100 dark:border-white/10 h-full w-full flex flex-col overflow-hidden">

        {/* Image */}
        <div
          className="relative h-[240px] min-h-[240px] overflow-hidden bg-gray-100"
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
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 text-gray-900 text-xs font-bold shadow-lg">
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
              "absolute top-3.5 left-3.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide text-white",
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

          <PhotoOverlaySpecs announce={announce} />
        </div>

        {/* Contenu — sur l'accueil, la catégorie reste entière puis titre et prix partagent la ligne suivante. */}
        <div className={cn("p-4 flex flex-col flex-1", isHomeVariant ? "min-h-36" : "gap-1.5")}>
            {isHomeVariant ? (
                <span dir="auto" className="block w-full break-words text-left text-[#00BFA6] font-bold text-[11px] leading-4 uppercase tracking-wide">
                    {categoryName}
                </span>
            ) : (
                <>
                    <span className="text-[#00BFA6] font-bold text-[11px] uppercase tracking-wide truncate">
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
                <div dir="ltr" className="mt-2 flex min-w-0 items-center justify-between gap-3">
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

            <div className={cn("flex min-w-0 items-center text-gray-400 dark:text-white/40 text-xs font-medium gap-1", isHomeVariant && "mt-1.5")}>
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
                        <div className="h-7 w-7 rounded-full border border-gray-100 dark:border-white/10 shrink-0 overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-white/5">
                            {announce.user?.imageUrl ? (
                                <img
                                    src={getImageUrl(announce.user.imageUrl) || ''}
                                    alt={announce.user.companyName || t("professionalSeller")}
                                    className="h-full w-full object-contain"
                                />
                            ) : (
                                <Building2 className="h-3.5 w-3.5 text-gray-300 dark:text-white/30" />
                            )}
                        </div>
                        <span className="truncate text-xs font-semibold text-gray-500 dark:text-white/50">
                            {announce.user?.companyName || (isHomeVariant ? t("professionalSeller") : "")}
                        </span>
                    </>
                ) : isHomeVariant ? (
                    <>
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gray-100 bg-gray-50 dark:border-white/10 dark:bg-white/5">
                            <UserRound className="h-3.5 w-3.5 text-gray-400 dark:text-white/40" />
                        </div>
                        <span className="truncate text-xs font-semibold text-gray-500 dark:text-white/50">{t("privateSeller")}</span>
                    </>
                ) : null}
            </div>
        </div>
      </div>
    </Link>
  )
}
