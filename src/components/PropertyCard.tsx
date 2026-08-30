import { useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import axios from "axios";
import { useTranslations } from "next-intl";
import { Camera, Eye, Heart, MapPin, Building2, Info, Play, Images } from "lucide-react";
import { cn } from "@/lib/utils";
import { PROPERTY_TYPES } from "@/data/propertyTypes";

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
    RESIDENTIEL: "from-emerald-950/90",
    BUREAUX_COMMERCES: "from-sky-950/90",
    INDUSTRIEL: "from-slate-950/90",
    TERRAIN_FONCIER: "from-amber-950/90",
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

export const PropertyCard = ({ announce, autoPlay = false }: { announce: any; autoPlay?: boolean }) => {
  const t = useTranslations("PropertyCard");
  const isCompany = announce.user?.companyName || announce.user?.userType === 'SOCIETE';

  const commune = announce.property?.address?.town?.nameFr;
  const wilaya = announce.property?.address?.town?.city?.nameFr;
  const locationLabel = [commune, wilaya].filter(Boolean).join(" - ") || t("defaultCountry");

  // Normalize Property Type for Display — use cross-display type if available (cross-category context)
  const pType = announce.property?._displayPropertyType || announce.property?.propertyType;
  const typeObj = PROPERTY_TYPES.find((pt) => pt.id === pType?.toUpperCase() || pt.label === pType);
  const categoryName = typeObj ? typeObj.label : (pType || t("defaultCategory"));
  const isSale = announce.type === "SALE";

  const fullTitle = announce.title || t("titleFallback", { category: categoryName, location: locationLabel });
  const shortTitle = fullTitle.length > 15 ? `${fullTitle.slice(0, 15).trimEnd()}…` : fullTitle;

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

  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);

  // Défile pendant le survol partout, et en continu (sans survol) là où `autoPlay` est activé —
  // réservé aux carrousels vitrine (accueil) qui n'affichent qu'une poignée de cartes à la fois,
  // pour ne pas faire tourner des dizaines de minuteurs/vidéos sur une grande grille.
  const isCycling = autoPlay || isHovering;
  useEffect(() => {
    if (!isCycling || mediaList.length <= 1) return;
    const id = setInterval(() => setHeroIndex((i) => (i + 1) % mediaList.length), 1600);
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
        setIsFavorite(!isFavorite);
    } catch (error) {
        console.error("Error toggling favorite", error);
    }
  };

  return (
    <Link href={`/announces/${announce.id}`} className="block h-full w-full">
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 group cursor-pointer border border-gray-100 h-full w-full flex flex-col overflow-hidden">

        {/* Image */}
        <div
          className="relative h-[240px] min-h-[240px] overflow-hidden bg-gray-100"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => { setIsHovering(false); setHeroIndex(0) }}
        >
          {currentMedia ? (
            currentMedia.type === 'video' ? (
              <video
                key={currentMedia.url}
                src={getImageUrl(currentMedia.url) || ''}
                autoPlay muted loop playsInline
                className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
              />
            ) : (
              <img
                  key={currentMedia.url}
                  src={getImageUrl(currentMedia.url) || ''}
                  alt={announce.reference}
                  className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
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

        {/* Contenu — ordre : sous-catégorie, prix (seul, aligné à droite), titre, localisation, agence */}
        <div className="p-4 flex flex-col gap-1.5 flex-1">
            <span className="text-[#00BFA6] font-bold text-[11px] uppercase tracking-wide truncate">
                {categoryName}
            </span>

            <div className="text-right">
                <span className="text-base font-bold text-[#003B4A] leading-none whitespace-nowrap">
                    {new Intl.NumberFormat('fr-DZ').format(announce.price)}
                    <span className="text-[10px] text-gray-400 font-semibold ml-1">DA</span>
                </span>
            </div>

            <div className="flex items-center gap-1.5 min-w-0">
                <h3 className="text-gray-900 font-bold text-[15px] leading-snug truncate">
                    {shortTitle}
                </h3>
                {fullTitle.length > 15 && (
                    <span title={fullTitle} className="shrink-0 text-gray-300 hover:text-gray-500 cursor-help">
                        <Info className="h-3.5 w-3.5" />
                    </span>
                )}
            </div>

            <div className="flex items-center text-gray-400 text-xs font-medium gap-1 truncate">
                <MapPin className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                {locationLabel}
            </div>

            {/* Agence : logo rond + nom si société, sinon ligne vide de même hauteur pour garder l'alignement des cartes */}
            <div className="mt-auto pt-2 flex items-center gap-2 h-8">
                {isCompany ? (
                    <>
                        <div className="h-7 w-7 rounded-full border border-gray-100 shrink-0 overflow-hidden flex items-center justify-center bg-gray-50">
                            {announce.user?.imageUrl ? (
                                <img
                                    src={getImageUrl(announce.user.imageUrl) || ''}
                                    alt={announce.user.companyName}
                                    className="h-full w-full object-contain"
                                />
                            ) : (
                                <Building2 className="h-3.5 w-3.5 text-gray-300" />
                            )}
                        </div>
                        <span className="text-gray-500 text-xs font-semibold truncate">{announce.user?.companyName}</span>
                    </>
                ) : null}
            </div>
        </div>
      </div>
    </Link>
  )
}
