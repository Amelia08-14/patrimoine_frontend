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

// Section Carousel avec flèches de navigation
const CarouselSection = ({ title, categoryId, items }: { title: string, categoryId: string, items: any[] }) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  if (items.length === 0) return null;

  return (
    <section className="py-8 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900 capitalize">{title}</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => scroll('left')}
                className="p-2 rounded-full border border-gray-200 hover:bg-[#00BFA6] hover:text-white hover:border-[#00BFA6] text-gray-600 transition-all shadow-sm"
                aria-label="Défiler à gauche"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button 
                onClick={() => scroll('right')}
                className="p-2 rounded-full border border-gray-200 hover:bg-[#00BFA6] hover:text-white hover:border-[#00BFA6] text-gray-600 transition-all shadow-sm"
                aria-label="Défiler à droite"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        <div className={cn("w-16 h-1 rounded-full mb-6", getCategoryColorById(categoryId))}></div>

        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item) => (
            <div key={item.id} className="min-w-[280px] md:min-w-[300px] lg:min-w-[calc(25%-1.2rem)] snap-start">
              <PropertyCard announce={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Carousel des Catégories avec effet loupe
const CategoryCarousel = ({ categories, onCategoryClick }: { categories: any[], onCategoryClick: (id: string) => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scales, setScales] = useState<number[]>([]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    
    const newScales = categories.map((_, index) => {
        const item = container.children[index] as HTMLElement;
        if (!item) return 0.9;
        const itemCenter = item.offsetLeft + item.offsetWidth / 2;
        const distance = Math.abs(containerCenter - itemCenter);
        
        // Logic de scaling
        const range = 250; 
        let scale = 1.4 - (distance / range) * 0.5; 
        return Math.max(0.9, Math.min(1.4, scale));
    });
    setScales(newScales);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    
    // Trouver l'élément le plus proche du centre actuel
    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    let closestIndex = 0;
    let minDistance = Infinity;

    Array.from(container.children).forEach((child, index) => {
        const item = child as HTMLElement;
        const itemCenter = item.offsetLeft + item.offsetWidth / 2;
        const distance = Math.abs(containerCenter - itemCenter);
        if (distance < minDistance) {
            minDistance = distance;
            closestIndex = index;
        }
    });

    // Calculer l'index cible (un par un)
    let targetIndex = direction === 'left' ? closestIndex - 1 : closestIndex + 1;
    targetIndex = Math.max(0, Math.min(categories.length - 1, targetIndex));

    const targetItem = container.children[targetIndex] as HTMLElement;
    if (targetItem) {
        targetItem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  useEffect(() => {
    handleScroll();
    const container = containerRef.current;
    if (container) {
        container.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleScroll);
        
        // Center initial view
        setTimeout(() => {
            if(container) {
                const middleIndex = Math.floor(categories.length / 2);
                const targetItem = container.children[middleIndex] as HTMLElement;
                if(targetItem) {
                    targetItem.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
                    handleScroll();
                }
            }
        }, 100);

        return () => {
            container.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        }
    }
  }, [categories]);

  return (
    <div className="relative w-full py-12 group px-4 md:px-12">
        {/* Navigation Arrows */}
        <button 
            onClick={() => scroll('left')}
            className="absolute left-0 md:left-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg text-gray-800 hover:text-[#00BFA6] hover:scale-110 border border-gray-100 transition-all opacity-0 group-hover:opacity-100 hidden md:block"
        >
            <ChevronLeft className="h-6 w-6" />
        </button>
        <button 
            onClick={() => scroll('right')}
            className="absolute right-0 md:right-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg text-gray-800 hover:text-[#00BFA6] hover:scale-110 border border-gray-100 transition-all opacity-0 group-hover:opacity-100 hidden md:block"
        >
            <ChevronRight className="h-6 w-6" />
        </button>

        <div 
            ref={containerRef}
            className="flex overflow-x-auto gap-8 px-[calc(50%-60px)] snap-x snap-mandatory hide-scrollbar pb-12 pt-8 items-center"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
            {categories.map((category, index) => {
                const Icon = getIcon(category.iconName);
                const scale = scales[index] || 0.9;
                const isActive = scale > 1.2;

                return (
                    <button
                        key={category.id}
                        onClick={() => {
                            onCategoryClick(category.id);
                            if (containerRef.current) {
                                const item = containerRef.current.children[index] as HTMLElement;
                                if (item) {
                                    item.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                                }
                            }
                        }}
                        className="snap-center flex flex-col items-center gap-6 transition-all duration-300 ease-out min-w-[120px] outline-none"
                        style={{ 
                            transform: `scale(${scale})`,
                            zIndex: isActive ? 10 : 1,
                            opacity: isActive ? 1 : 0.6
                        }}
                    >
                        <div className={cn(
                            "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300",
                            isActive 
                                ? cn("shadow-2xl shadow-gray-200 border-2 border-transparent ring-4 ring-gray-50", getCategoryColorById(category.id).replace('bg-', 'bg-').replace('500', '100').replace('400', '100'))
                                : "bg-white shadow-md border border-gray-100"
                        )}>
                            <Icon className={cn(
                                "h-10 w-10 transition-colors duration-300",
                                isActive ? getIconColorById(category.id) : getIconColorById(category.id)
                            )} />
                        </div>
                        <span className={cn(
                            "text-[10px] md:text-xs uppercase font-bold text-center transition-colors duration-300 max-w-[140px] px-3 py-1.5 rounded-full tracking-widest leading-tight",
                            isActive 
                                ? cn("bg-gray-100", getIconColorById(category.id))
                                : "text-gray-400"
                        )}>
                            {category.label}
                        </span>
                    </button>
                )
            })}
        </div>
        
        {/* Gradients */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none z-20" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none z-20" />
    </div>
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
    // Attempt to find property type by ID (case-insensitive) or Label
    let pType = PROPERTY_TYPES.find(t => t.id === announce.property?.propertyType?.toUpperCase());
    
    // Fallback: try matching by label if ID match fails
    if (!pType) {
        pType = PROPERTY_TYPES.find(t => t.label === announce.property?.propertyType);
    }

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

          {/* Category Bubbles - Carousel */}
          <CategoryCarousel 
            categories={REAL_ESTATE_CATEGORIES}
            onCategoryClick={handleCategoryClick}
          />
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
