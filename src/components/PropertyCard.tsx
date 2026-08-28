import { useState } from "react";
import { Link } from "@/i18n/navigation";
import axios from "axios";
import { useTranslations } from "next-intl";
import { Camera, Eye, Heart, MapPin, Building2, Info } from "lucide-react";
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

// Couleur du bandeau inférieur par domaine — donne un repère visuel immédiat par catégorie,
// indépendant du badge vente/location (qui reste aux couleurs de marque).
const CATEGORY_OVERLAY_COLOR: Record<string, string> = {
    RESIDENTIEL: "bg-emerald-800/90",
    BUREAUX_COMMERCES: "bg-sky-800/90",
    INDUSTRIEL: "bg-slate-700/90",
    TERRAIN_FONCIER: "bg-amber-900/90",
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
        <div className={cn("absolute bottom-0 inset-x-0 px-3.5 py-2 flex items-center gap-2 flex-wrap", CATEGORY_OVERLAY_COLOR[categoryId as string] || "bg-[#003B4A]/90")}>
            {items.map((item, i) => (
                <span key={i} className="flex items-center gap-2 text-white text-[11px] font-bold">
                    {i > 0 && <span className="h-1 w-1 rounded-full bg-white/40" />}
                    {item}
                </span>
            ))}
        </div>
    )
}

export const PropertyCard = ({ announce }: { announce: any }) => {
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

  // Get main image (first image with isMain = true, fallback to first image)
  const images = announce.property?.images || [];
  const mainImage = images.find((img: any) => img.isMain) || images[0];

  const [isFavorite, setIsFavorite] = useState(false);

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
        <div className="relative h-[240px] min-h-[240px] overflow-hidden bg-gray-100">
          {mainImage ? (
            <img
                src={getImageUrl(mainImage.url) || ''}
                alt={announce.reference}
                className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
                <Camera className="h-10 w-10" strokeWidth={1.5} />
            </div>
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
              {images.length > 0 && (
                <span className="flex items-center gap-1 h-8 px-2.5 rounded-full bg-black/45 backdrop-blur-sm text-white text-[11px] font-bold">
                  <Camera className="h-3.5 w-3.5" /> {images.length}
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

        {/* Contenu — ordre : sous-catégorie + prix, titre, localisation, agence */}
        <div className="p-4 flex flex-col gap-1.5 flex-1">
            <div className="flex items-center justify-between gap-2">
                <span className="text-[#00BFA6] font-bold text-[11px] uppercase tracking-wide truncate">
                    {categoryName}
                </span>
                <span className="text-base font-bold text-[#003B4A] leading-none shrink-0">
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
