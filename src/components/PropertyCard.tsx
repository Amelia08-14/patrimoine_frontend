import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { Camera, Eye, Heart, Square, BedDouble, MapPin, Building2 } from "lucide-react";
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

export const PropertyCard = ({ announce }: { announce: any }) => {
  const isCompany = announce.user?.companyName || announce.user?.userType === 'SOCIETE';
  const locationName = announce.property?.address?.town?.nameFr || announce.property?.address?.town?.city?.nameFr || "Algérie";
  
  // Normalize Property Type for Display
  const pType = announce.property?.propertyType;
  // Try to find label in constants if it's an ID like "VILLA"
  const typeObj = require("@/data/propertyTypes").PROPERTY_TYPES.find((t: any) => t.id === pType?.toUpperCase() || t.label === pType);
  const categoryName = typeObj ? typeObj.label : (pType || "Immobilier");

  const [isFavorite, setIsFavorite] = useState(false); 
  
  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Veuillez vous connecter pour ajouter aux favoris");
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
    <Link href={`/announces/${announce.id}`} className="block h-full">
      <div className="bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 group cursor-pointer border border-gray-100 h-full flex flex-col overflow-hidden relative">
        
        {/* Image Section - Full Bleed */}
        <div className="relative h-[260px] overflow-hidden">
          {announce.property?.images?.[0] ? (
            <img 
                src={getImageUrl(announce.property.images[0].url) || ''}
                alt={announce.reference} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                <Camera className="h-12 w-12 opacity-20" />
            </div>
          )}
          
          {/* Gradient for text readability */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

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

          {/* Bottom Info Overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <div className="flex items-center gap-4 text-white font-bold drop-shadow-md">
                   <div className="flex items-center gap-1.5">
                        <Square className="h-4 w-4 text-[#00BFA6]"/> 
                        <span className="text-sm">{announce.property?.area} m²</span>
                   </div>
                   {announce.property?.nbRooms && (
                    <div className="flex items-center gap-1.5">
                            <BedDouble className="h-4 w-4 text-[#00BFA6]"/> 
                            <span className="text-sm">{announce.property?.nbRooms} p.</span>
                    </div>
                   )}
              </div>
              
              <span className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg",
                  announce.type === "SALE" ? "bg-red-600 text-white" : "bg-blue-600 text-white"
                )}>
                  {announce.type === 'SALE' ? 'VENTE' : 'LOCATION'}
              </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 flex flex-col gap-2 flex-1 relative">
            {/* Category */}
            <span className="text-[#00BFA6] font-extrabold text-[11px] uppercase tracking-widest">
                {categoryName}
            </span>
            
            {/* Title */}
            <h3 className="text-gray-900 font-bold text-lg leading-tight line-clamp-1 group-hover:text-[#00BFA6] transition-colors">
                {announce.property?.description ? announce.property.description.substring(0, 40) + (announce.property.description.length > 40 ? "..." : "") : `${categoryName} à ${locationName}`}
            </h3>
            
            {/* Price & Location & Agency */}
            <div className="flex items-center justify-between mt-1">
                <div className="flex flex-col">
                    <span className="text-2xl font-black text-gray-900">
                        {new Intl.NumberFormat('fr-DZ').format(announce.price)} <span className="text-sm text-gray-500 font-bold">DA</span>
                    </span>
                    <div className="flex items-center text-gray-400 text-xs font-semibold gap-1.5 mt-1">
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