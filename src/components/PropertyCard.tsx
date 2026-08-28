import { useState } from "react";
import { Link } from "@/i18n/navigation";
import axios from "axios";
import { useTranslations } from "next-intl";
import { Camera, Heart, Square, BedDouble, MapPin, Building2, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

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

const INDUSTRIAL_TYPES = ["HANGAR", "USINE", "CHAMBRE_FROIDE", "CO_STOCKAGE", "DEPOT"];
const HOTEL_TYPES = ["HOTEL", "COMPLEXE_TOURISTIQUE", "BUNGALOW", "TERRAIN_HOTELIER", "AUTRE_HOTEL"];

// Extrait les critères d'affichage adaptés à la catégorie du bien (résidentiel / industriel / hôtelier)
const getCategorySpecs = (announce: any) => {
    const property = announce.property || {};
    const pType = (property._displayPropertyType || property.propertyType || "").toUpperCase();

    let amenities: any = {};
    try {
        amenities = property.amenities ? JSON.parse(property.amenities) : {};
    } catch {
        amenities = {};
    }

    if (INDUSTRIAL_TYPES.includes(pType)) {
        const factory = amenities.industrialFactory;
        const coldRoom = amenities.coldRoom;
        const hangar = amenities.hangar;

        let height: number | undefined;
        let width: number | undefined;
        let typeLabel: string | undefined;

        if (coldRoom) {
            height = coldRoom.dimensions?.height;
            width = coldRoom.dimensions?.width;
            typeLabel = coldRoom.typeFroid?.[0] || coldRoom.techniqueFroid?.[0];
        } else if (factory) {
            height = factory.structure?.hspMeters;
            typeLabel = factory.sector?.[0];
        } else if (hangar) {
            height = hangar.dimensions?.height;
            width = hangar.dimensions?.width;
        }

        return {
            kind: "industrial" as const,
            area: property.area,
            height,
            width,
            typeLabel,
        };
    }

    if (HOTEL_TYPES.includes(pType)) {
        return {
            kind: "hotel" as const,
            area: property.area,
            nbSuites: property.nbSuites || property.nbRooms,
        };
    }

    return {
        kind: "residential" as const,
        area: property.area,
        nbRooms: property.nbRooms,
    };
};

// Ligne de caractéristiques sobre : texte + icône, séparés par un point médian — plus de "pills"
function SpecLine({ specs }: { specs: ReturnType<typeof getCategorySpecs> }) {
    const t = useTranslations("PropertyCard");
    const parts: { icon: typeof Square; label: string }[] = [
        { icon: Square, label: `${specs.area ?? 0} m²` },
    ];
    if (specs.kind === "residential" && specs.nbRooms) parts.push({ icon: BedDouble, label: t("rooms", { count: specs.nbRooms }) });
    if (specs.kind === "hotel" && specs.nbSuites) parts.push({ icon: BedDouble, label: t("bedrooms", { count: specs.nbSuites }) });
    if (specs.kind === "industrial" && specs.height) parts.push({ icon: ArrowUpDown, label: `${specs.height} m` });

    return (
        <div className="flex items-center gap-3 text-[13px] text-gray-500 font-medium">
            {parts.map((p, i) => (
                <span key={i} className="flex items-center gap-1.5">
                    {i > 0 && <span className="text-gray-300">·</span>}
                    <p.icon className="h-3.5 w-3.5 text-gray-400" />
                    {p.label}
                </span>
            ))}
        </div>
    )
}

export const PropertyCard = ({ announce }: { announce: any }) => {
  const t = useTranslations("PropertyCard");
  const isCompany = announce.user?.companyName || announce.user?.userType === 'SOCIETE';
  const locationName = announce.property?.address?.town?.nameFr || announce.property?.address?.town?.city?.nameFr || t("defaultCountry");

  // Normalize Property Type for Display — use cross-display type if available (cross-category context)
  const pType = announce.property?._displayPropertyType || announce.property?.propertyType;
  const typeObj = require("@/data/propertyTypes").PROPERTY_TYPES.find((t: any) => t.id === pType?.toUpperCase() || t.label === pType);
  const categoryName = typeObj ? typeObj.label : (pType || t("defaultCategory"));
  const specs = getCategorySpecs(announce);
  const isSale = announce.type === "SALE";

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

          {/* Nombre de photos — discret */}
          {images.length > 0 && (
            <span className="absolute bottom-3.5 left-3.5 flex items-center gap-1 text-white text-[11px] font-semibold [text-shadow:0_1px_3px_rgb(0_0_0_/_0.5)]">
              <Camera className="h-3.5 w-3.5" /> {images.length}
            </span>
          )}

          {/* Favori */}
          <button
              onClick={toggleFavorite}
              aria-label={t("loginToFavorite")}
              className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-500 hover:text-[#00BFA6] transition-colors"
          >
              <Heart className={cn("h-4 w-4", isFavorite && "fill-[#00BFA6] text-[#00BFA6]")} />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-5 flex flex-col gap-3 flex-1">
            <div className="flex flex-col gap-1">
                <span className="text-[#00BFA6] font-bold text-[11px] uppercase tracking-wide">
                    {categoryName}
                    {specs.kind === "industrial" && specs.typeLabel && (
                        <span className="text-gray-400 font-medium normal-case tracking-normal"> · {specs.typeLabel}</span>
                    )}
                </span>
                <h3 className="text-gray-900 font-bold text-[15px] leading-snug line-clamp-1" title={announce.title || t("titleFallback", { category: categoryName, location: locationName })}>
                    {announce.title ? announce.title : t("titleFallback", { category: categoryName, location: locationName })}
                </h3>
            </div>

            <SpecLine specs={specs} />

            <div className="mt-auto pt-3 border-t border-gray-50 flex items-end justify-between gap-3">
                <div className="min-w-0">
                    <div className="text-xl font-bold text-[#003B4A] leading-none">
                        {new Intl.NumberFormat('fr-DZ').format(announce.price)}
                        <span className="text-xs text-gray-400 font-semibold ml-1">DA</span>
                    </div>
                    <div className="flex items-center text-gray-400 text-xs font-medium gap-1 mt-2 truncate">
                        <MapPin className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                        {locationName}
                    </div>
                </div>

                {isCompany && (
                    <div className="shrink-0" title={announce.user?.companyName}>
                        {announce.user?.imageUrl ? (
                            <img
                                src={getImageUrl(announce.user.imageUrl) || ''}
                                alt={announce.user.companyName}
                                className="w-8 h-8 rounded-full object-cover border border-gray-100"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 border border-gray-100">
                                <Building2 className="h-4 w-4" />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
      </div>
    </Link>
  )
}
