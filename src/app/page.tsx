"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, Heart, MapPin, BedDouble, Bath, Square, ChevronLeft, ChevronRight, Camera, Video, Search, ChevronDown, Eye, Building2, Check, Home as HomeIcon, Hotel, Tent, Factory, ConciergeBell, Plus, Briefcase, BedDouble as BedDoubleIcon, PartyPopper, Warehouse, Star, Building, Store, Trees, CalendarDays, Users, Mountain, Sparkles } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import axios from "axios"
import { useRouter } from "next/navigation"
import { PROPERTY_TYPES, REAL_ESTATE_CATEGORIES } from "@/data/propertyTypes"
import { PropertyCard } from "@/components/PropertyCard"

// Helper for Icons
const getIcon = (name: string) => {
  const icons: any = {
    Building2, Hotel, Tent, Factory, Home: HomeIcon, ConciergeBell,
    Briefcase, BedDouble: BedDoubleIcon, PartyPopper, Warehouse, Star,
    Building, Store, Trees, CalendarDays, Users, Mountain, Sparkles
  }
  return icons[name] || HomeIcon
}

// Mapping des couleurs par ID de catégorie
const getCategoryColorById = (categoryId: string) => {
  switch (categoryId) {
    case "HEBERGEMENT": return "bg-yellow-400";
    case "BUREAUX_COMMERCES": return "bg-blue-500";
    case "HOTELIER": return "bg-orange-500";
    case "EVENEMENTIEL": return "bg-red-500";
    case "INDUSTRIEL": return "bg-gray-500";
    case "RESIDENTIEL": return "bg-green-500";
    default: return "bg-[#00BFA6]";
  }
}

// Mapping des couleurs d'icônes
const getIconColorById = (categoryId: string) => {
  switch (categoryId) {
    case "HEBERGEMENT": return "text-yellow-500";
    case "BUREAUX_COMMERCES": return "text-blue-500";
    case "HOTELIER": return "text-orange-500";
    case "EVENEMENTIEL": return "text-red-500";
    case "INDUSTRIEL": return "text-gray-500";
    case "RESIDENTIEL": return "text-green-500";
    default: return "text-[#00BFA6]";
  }
}

// Section Carousel avec flèches rapprochées du titre
const CarouselSection = ({ title, categoryId, items }: { title: string, categoryId: string, items: any[] }) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -400 : 400,
        behavior: 'smooth'
      })
    }
  }

  if (items.length === 0) return null;

  return (
    <section className="py-8 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-900 capitalize">{title}</h2>
            <div className="flex gap-1">
              <button 
                onClick={() => scroll('left')} 
                className="p-1.5 rounded-full border border-gray-200 hover:bg-gray-50 hover:border-[#00BFA6] transition-all group"
                aria-label="Défiler vers la gauche"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600 group-hover:text-[#00BFA6]" />
              </button>
              <button 
                onClick={() => scroll('right')} 
                className="p-1.5 rounded-full border border-gray-200 hover:bg-gray-50 hover:border-[#00BFA6] transition-all group"
                aria-label="Défiler vers la droite"
              >
                <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-[#00BFA6]" />
              </button>
            </div>
          </div>
        </div>
        <div className={cn("w-16 h-1 rounded-full mb-6", getCategoryColorById(categoryId))}></div>

        <div 
          ref={scrollRef} 
          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item) => (
            <PropertyCard key={item.id} announce={item} />
          ))}
        </div>
      </div>
    </section>
  )
}
export default function HomePage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [announces, setAnnounces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchType, setSearchType] = useState<'all' | 'rent' | 'buy'>('all');

  const handleCategoryClick = (categoryId: string) => {
    const params = new URLSearchParams()
    if (searchType === 'rent') params.append('transactionType', 'RENTAL')
    if (searchType === 'buy') params.append('transactionType', 'SALE')
    params.append('realEstateCategory', categoryId)
    router.push(`/announces?${params.toString()}`)
  }

  const heroImages = [
    "/hero1.jpg",
    "/hero2.jpg",
    "/hero3.png",
    "/hero4.png",
    "/Hero5.jpg"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchAnnounces = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await axios.get(`${apiUrl}/announces`);
        setAnnounces(res.data);
      } catch (err) {
        console.error("Error fetching announces:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnnounces();
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);

  const filteredAnnounces = announces.filter(a => {
    return searchType === 'all' ? true :
           searchType === 'rent' ? a.type === 'RENTAL' :
           a.type === 'SALE';
  });

  const groupedAnnounces = filteredAnnounces.reduce((acc, announce) => {
    const pType = PROPERTY_TYPES.find(t => t.id === announce.property?.propertyType);
    if (pType) {
      const cat = REAL_ESTATE_CATEGORIES.find(c => c.id === pType.categoryId);
      if (cat) {
        if (!acc[cat.id]) {
          acc[cat.id] = { label: cat.label, items: [] };
        }
        acc[cat.id].items.push(announce);
      }
    }
    return acc;
  }, {} as Record<string, { label: string, items: any[] }>);

  // Ordre d'affichage des catégories
  const orderedCategoryIds = [
    "RESIDENTIEL",
    "INDUSTRIEL",
    "BUREAUX_COMMERCES",
    "HOTELIER",
    "EVENEMENTIEL",
    "HEBERGEMENT"
  ];

  return (
    <div className="flex flex-col min-h-screen font-sans bg-gray-50">

      {/* HERO SECTION */}
      <div className="relative h-[450px] w-full group">
        <div className="absolute inset-0 overflow-hidden rounded-b-[50px] bg-gray-900">
          {heroImages.map((img, index) => (
            <div 
              key={img}
              className={cn(
                "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                index === currentSlide ? "opacity-100" : "opacity-0"
              )}
            >
              <img src={img} alt={`Hero Slide ${index + 1}`} className="w-full h-full object-cover"/>
            </div>
          ))}
          <button onClick={prevSlide} className="absolute left-8 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 backdrop-blur-md p-3 rounded-full text-white transition-all opacity-0 group-hover:opacity-100 z-20">
            <ChevronLeft className="h-8 w-8" />
          </button>
          <button onClick={nextSlide} className="absolute right-8 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 backdrop-blur-md p-3 rounded-full text-white transition-all opacity-0 group-hover:opacity-100 z-20">
            <ChevronRight className="h-8 w-8" />
          </button>
        </div>
      </div>

      {/* CATEGORY BUBBLES */}
      <div className="relative py-6 px-4 z-40 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          
          {/* Transaction Type Tabs */}
          <div className="flex justify-center items-center mb-6">
            <div className="bg-white p-1.5 rounded-full shadow-sm border border-gray-200 flex gap-1">
              {['all','rent','buy'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSearchType(type as 'all'|'rent'|'buy')}
                  className={cn(
                    "px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300",
                    type === 'all' 
                      ? searchType === 'all' 
                        ? "bg-green-600 text-white shadow-md" 
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                      : searchType === type 
                        ? "bg-[#003B4A] text-white shadow-md" 
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  {type === 'all' ? 'VOIR TOUT' : type === 'rent' ? 'LOUER' : 'ACHETER'}
                </button>
              ))}
            </div>
          </div>

          {/* Category Bubbles */}
          <div className="mb-4 flex flex-wrap gap-4 justify-center">
            {REAL_ESTATE_CATEGORIES.map((category) => {
              const Icon = getIcon(category.iconName);
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className="group flex flex-col items-center gap-2 p-2 min-w-[100px] hover:scale-105 transition-transform duration-200"
                >
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center border-2 border-gray-100 bg-white shadow-sm group-hover:shadow-md transition-all">
                    <Icon className={cn("h-8 w-8", getIconColorById(category.id))} />
                  </div>
                  <span className="text-xs font-medium text-gray-700 text-center group-hover:text-[#00BFA6] transition-colors">
                    {category.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* PROPERTIES BY CATEGORY */}
      {loading ? (
        <div className="py-12 text-center text-gray-500">Chargement des annonces...</div>
      ) : (
        <>
          {Object.keys(groupedAnnounces).length === 0 ? (
            <div className="py-12 text-center text-gray-500">Aucune annonce validée pour le moment.</div>
          ) : (
            orderedCategoryIds.map((catId) => {
              const catData = groupedAnnounces[catId];
              if (catData && catData.items.length > 0) {
                return (
                  <CarouselSection 
                    key={catId} 
                    categoryId={catId} 
                    title={catData.label} 
                    items={catData.items} 
                  />
                );
              }
              return null;
            })
          )}
        </>
      )}

      {/* WHY CHOOSE US */}
      <section className="py-16 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 uppercase tracking-widest text-green-400">Pourquoi nous choisir ?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Une expertise reconnue et des outils performants pour concrétiser vos projets.</p>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 uppercase">Je confie mon projet</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative h-[350px] rounded-3xl overflow-hidden group cursor-pointer shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80" 
                alt="Propriétaire" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                <h3 className="text-xl font-bold text-white mb-4">Vous êtes Propriétaire ?</h3>
                <Link href="/deposit">
                  <Button className="bg-green-600 hover:bg-green-700 text-white font-bold py-5 px-6 rounded-full">
                    Confier mon bien
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative h-[350px] rounded-3xl overflow-hidden group cursor-pointer shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80" 
                alt="Locataire" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                <h3 className="text-xl font-bold text-white mb-4">Vous cherchez un bien ?</h3>
                <Link href="/research">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 px-6 rounded-full">
                    Confier ma recherche
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-gray-100 bg-[#003B4A] text-white p-6 text-center shadow-lg">
            <p className="text-base font-semibold tracking-wide">Application disponible bientôt</p>
          </div>
        </div>
      </section>

    </div>
  )
}