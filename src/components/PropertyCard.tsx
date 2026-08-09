import { useState } from "react";
import { Link } from "@/i18n/navigation";
import axios from "axios";
import { useTranslations } from "next-intl";
import { Camera, Eye, Heart, Square, BedDouble, MapPin, Building2, ArrowUpDown, Thermometer, Factory } from "lucide-react";
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

export const PropertyCard = ({ announce }: { announce: any }) => {
  const t = useTranslations("PropertyCard");
  const isCompany = announce.user?.companyName || announce.user?.userType === 'SOCIETE';
  const locationName = announce.property?.address?.town?.nameFr || announce.property?.address?.town?.city?.nameFr || t("defaultCountry");

  // Normalize Property Type for Display — use cross-display type if available (cross-category context)
  const pType = announce.property?._displayPropertyType || announce.property?.propertyType;
  const typeObj = require("@/data/propertyTypes").PROPERTY_TYPES.find((t: any) => t.id === pType?.toUpperCase() || t.label === pType);
  const categoryName = typeObj ? typeObj.label : (pType || t("defaultCategory"));
  const specs = getCategorySpecs(announce);

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
      <div className="bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 group cursor-pointer border border-gray-100 h-full w-full flex flex-col overflow-hidden relative">
        
        {/* Image Section - Full Bleed */}
        <div className="relative h-[260px] min-h-[260px] overflow-hidden">
          {mainImage ? (
            <img 
                src={getImageUrl(mainImage.url) || ''}
                alt={announce.reference} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                <Camera className="h-12 w-12 opacity-20" />
            </div>
          )}
          
          {/* Gradient for text readability */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

          {/* Top Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
              <div className="bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 border border-white/10">
                  <Camera className="h-3.5 w-3.5" />
                  {announce.property?.images?.length || 0}
              </div>
              <div className="bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 border border-white/10">
                  <Eye className="h-3.5 w-3.5" />
                  {announce.nbViews || 0}
              </div>
          </div>

          {/* Favorite Button */}
          <div className="absolute top-4 right-4 z-10">
              <button
                  onClick={toggleFavorite}
                  className={cn(
                      "p-2.5 rounded-full transition-colors shadow-lg hover:scale-110 duration-200",
                      isFavorite ? "bg-red-50 text-red-500" : "bg-white text-gray-400 hover:text-red-500"
                  )}
              >
                  <Heart className={cn("h-4 w-4", isFavorite ? "fill-current" : "fill-transparent hover:fill-current")} />
              </button>
          </div>

          {/* Transaction Badge */}
          <div className="absolute bottom-4 left-4">
              <span className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg",
                  announce.type === "SALE" ? "bg-red-600 text-white" : "bg-blue-600 text-white"
                )}>
                  {announce.type === 'SALE' ? t("sale") : t("rental")}
              </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 flex flex-col justify-between flex-1 relative min-h-[160px]">
            <div className="flex flex-col gap-2">
                {/* Category */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[#00BFA6] font-extrabold text-[11px] uppercase tracking-widest">
                        {categoryName}
                    </span>
                    {specs.kind === "industrial" && specs.typeLabel && (
                        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full">
                            {pType === "CHAMBRE_FROIDE" ? <Thermometer className="h-3 w-3" /> : <Factory className="h-3 w-3" />}
                            {specs.typeLabel}
                        </span>
                    )}
                </div>

                {/* Title */}
                <h3 className="text-gray-900 font-bold text-lg leading-tight line-clamp-1 group-hover:text-[#00BFA6] transition-colors" title={announce.title || t("titleFallback", { category: categoryName, location: locationName })}>
                    {announce.title ? announce.title : t("titleFallback", { category: categoryName, location: locationName })}
                </h3>

                {/* Specs Row */}
                <div className="flex items-center gap-2 flex-wrap mt-1">
                    <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg text-xs font-bold text-gray-600">
                        <Square className="h-3.5 w-3.5 text-[#00BFA6]" />
                        {specs.area} m²
                    </div>
                    {specs.kind === "residential" && specs.nbRooms && (
                        <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg text-xs font-bold text-gray-600">
                            <BedDouble className="h-3.5 w-3.5 text-[#00BFA6]" />
                            {t("rooms", { count: specs.nbRooms })}
                        </div>
                    )}
                    {specs.kind === "hotel" && specs.nbSuites && (
                        <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg text-xs font-bold text-gray-600">
                            <BedDouble className="h-3.5 w-3.5 text-[#00BFA6]" />
                            {t("bedrooms", { count: specs.nbSuites })}
                        </div>
                    )}
                    {specs.kind === "industrial" && specs.height && (
                        <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg text-xs font-bold text-gray-600">
                            <ArrowUpDown className="h-3.5 w-3.5 text-[#00BFA6]" />
                            {specs.height} m
                        </div>
                    )}
                    {specs.kind === "industrial" && specs.width && (
                        <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg text-xs font-bold text-gray-600">
                            <ArrowUpDown className="h-3.5 w-3.5 text-[#00BFA6] rotate-90" />
                            {specs.width} m
                        </div>
                    )}
                </div>
            </div>

            {/* Price & Location & Agency */}
            <div className="flex items-end justify-between mt-auto pt-2">
                <div className="flex flex-col">
                    <span className="text-2xl font-black text-gray-900 leading-none">
                        {new Intl.NumberFormat('fr-DZ').format(announce.price)} <span className="text-sm text-gray-500 font-bold">DA</span>
                    </span>
                    <div className="flex items-center text-gray-400 text-xs font-semibold gap-1.5 mt-2">
                        <MapPin className="h-4 w-4 text-[#00BFA6]" />
                        {locationName}
                    </div>
                </div>

                {/* Agency Footer (Right Side) */}
                {isCompany && (
                    <div className="flex flex-col items-center gap-1 min-w-[80px]">
                        {announce.user?.imageUrl ? (
                            <div className="p-0.5 rounded-full border border-gray-100 shadow-sm">
                              <img 
                                  src={getImageUrl(announce.user.imageUrl) || ''} 
                                  alt={announce.user.companyName}
                                  className="w-10 h-10 rounded-full object-cover"
                              />
                            </div>
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                                <Building2 className="h-5 w-5" />
                            </div>
                        )}
                        <span className="text-gray-400 text-[8px] font-bold uppercase tracking-widest text-center truncate max-w-[100px]">
                            {announce.user?.companyName}
                        </span>
                    </div>
                )}
            </div>
        </div>
      </div>
    </Link>
  )
}