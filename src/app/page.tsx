"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, Heart, MapPin, BedDouble, Bath, Square, ChevronLeft, ChevronRight, Camera, Video, Search, ChevronDown, Eye, Building2, Check, Home as HomeIcon, Hotel, Tent, Factory, ConciergeBell, Plus, Briefcase, BedDouble as BedDoubleIcon, PartyPopper, Warehouse, Star, Building, Store, Trees, CalendarDays, Users, Mountain, Sparkles } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import axios from "axios"
import { useRouter } from "next/navigation"
import { PROPERTY_TYPES, REAL_ESTATE_CATEGORIES } from "@/data/propertyTypes"
import { WILAYAS } from "@/data/wilayas"
import { COMMUNES } from "@/data/communes"
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

// Helper pour les couleurs des catégories (surlignements)
const getCategoryColor = (label: string) => {
  switch (label) {
    case "Hébergement et Séjours": return "bg-yellow-400";
    case "Bureaux et Commerces": return "bg-blue-500";
    case "Immobilier Hôtelier": return "bg-orange-500";
    case "Immobilier Évènementiel": return "bg-red-500";
    case "Immobilier Industriel": return "bg-gray-500";
    case "Immobilier Résidentiel": return "bg-green-500";
    default: return "bg-[#00BFA6]";
  }
}

// Helper pour les couleurs des icônes
const getIconColor = (label: string) => {
  switch (label) {
    case "Hébergement et Séjours": return "text-yellow-500";
    case "Bureaux et Commerces": return "text-blue-500";
    case "Immobilier Hôtelier": return "text-orange-500";
    case "Immobilier Évènementiel": return "text-red-500";
    case "Immobilier Industriel": return "text-gray-500";
    case "Immobilier Résidentiel": return "text-green-500";
    default: return "text-[#00BFA6]";
  }
}

// Section Carousel (comme avant)
const CarouselSection = ({ title, items }: { title: string, items: any[] }) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef
      const scrollAmount = direction === 'left' ? -400 : 400
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  if (items.length === 0) return null;

  return (
    <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
               <h2 className="text-3xl font-bold text-gray-900 mb-2 capitalize">{title}</h2>
               <div className={cn("w-20 h-1 rounded-full", getCategoryColor(title))}></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => scroll('left')} className="p-3 rounded-full border border-gray-200 hover:bg-gray-50 transition-all">
                 <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <button onClick={() => scroll('right')} className="p-3 rounded-full border border-gray-200 hover:bg-gray-50 transition-all">
                 <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div 
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar"
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
  
  // Custom Filter State for Home Page
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
    "/Hero4.jpg"
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
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/announces`);
            console.log("=== DONNÉES REÇUES ===");
            console.log("Announces:", res.data);
            setAnnounces(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }
    fetchAnnounces();
  }, []);

  useEffect(() => {
    console.log("=== CONFIGURATION ===");
    console.log("REAL_ESTATE_CATEGORIES:", REAL_ESTATE_CATEGORIES);
    console.log("PROPERTY_TYPES:", PROPERTY_TYPES);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);

  // Filter announces based on searchType
  const filteredAnnounces = announces.filter(a => {
      return searchType === 'all' ? true :
             searchType === 'rent' ? a.type === 'RENTAL' : 
             a.type === 'SALE';
  });

  // Debug: voir les property types des annonces
  useEffect(() => {
    if (filteredAnnounces.length > 0) {
      console.log("=== ANALYSE DES ANNONCES ===");
      filteredAnnounces.forEach((a, index) => {
        console.log(`Annonce ${index + 1}:`, {
          id: a.id,
          propertyType: a.property?.propertyType,
          category: PROPERTY_TYPES.find(t => t.id === a.property?.propertyType)?.categoryId
        });
      });
    }
  }, [filteredAnnounces]);

  // Group announces by category
  const groupedAnnounces = filteredAnnounces.reduce((acc, announce) => {
    const pType = PROPERTY_TYPES.find(t => t.id === announce.property?.propertyType);
    
    if (pType) {
        const cat = REAL_ESTATE_CATEGORIES.find(c => c.id === pType.categoryId);
        if (cat) {
            if (!acc[cat.id]) {
              acc[cat.id] = {
                  label: cat.label,
                  items: []
              };
            }
            acc[cat.id].items.push(announce);
        } else {
            // Si la catégorie n'est pas trouvée
            if (!acc['unknown']) {
              acc['unknown'] = {
                  label: 'Non catégorisé',
                  items: []
              };
            }
            acc['unknown'].items.push(announce);
        }
    } else {
        // Si le property type n'est pas trouvé
        if (!acc['unknown']) {
          acc['unknown'] = {
              label: 'Non catégorisé',
              items: []
          };
        }
        acc['unknown'].items.push(announce);
    }
    return acc;
  }, {} as Record<string, { label: string, items: any[] }>);

  console.log("=== RÉSULTAT DU GROUPEMENT ===");
  console.log("groupedAnnounces:", groupedAnnounces);

  // Afficher toutes les catégories qui ont des annonces
  const categoriesWithAnnounces = Object.keys(groupedAnnounces).filter(key => groupedAnnounces[key].items.length > 0);
  console.log("Catégories avec annonces:", categoriesWithAnnounces);

  return (
    <div className="flex flex-col min-h-screen font-sans bg-gray-50">
      
      {/* --- HERO SECTION --- */}
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
              <img
                src={img}
                alt={`Hero Slide ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          
          <button 
            onClick={prevSlide}
            className="absolute left-8 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 backdrop-blur-md p-3 rounded-full text-white transition-all opacity-0 group-hover:opacity-100 z-20"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-8 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 backdrop-blur-md p-3 rounded-full text-white transition-all opacity-0 group-hover:opacity-100 z-20"
          >
            <ChevronRight className="h-8 w-8" />
          </button>

          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
            {heroImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  idx === currentSlide ? "bg-white w-8" : "bg-white/50 hover:bg-white/80"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* --- CATEGORY BUBBLES --- */}
      <div className="relative py-8 px-4 z-40 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          
{/* Transaction Type Tabs with Deposit Button */}
<div className="flex flex-col items-center gap-4 mb-6">
  <div className="bg-white p-1.5 rounded-full shadow-sm border border-gray-200 flex gap-1">
    <button 
      onClick={() => setSearchType('all')}
      className={cn(
        "px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300",
        searchType === 'all' 
          ? "bg-[#003B4A] text-white shadow-md" 
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      TOUS
    </button>
    <button 
      onClick={() => setSearchType('rent')}
      className={cn(
        "px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300",
        searchType === 'rent' 
          ? "bg-[#003B4A] text-white shadow-md" 
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      LOUER
    </button>
    <button 
      onClick={() => setSearchType('buy')}
      className={cn(
        "px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300",
        searchType === 'buy' 
          ? "bg-[#003B4A] text-white shadow-md" 
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      ACHETER
    </button>
  </div>
  
  <Link href="/deposit">
    <Button className="bg-[#00BFA6] hover:bg-[#00908A] text-white rounded-full px-6 py-2.5 text-sm font-bold shadow-lg shadow-[#00BFA6]/20 transition-all flex items-center gap-2">
      <Plus className="h-4 w-4" />
      Déposer votre annonce
    </Button>
  </Link>
</div>

         {/* Category Bubbles avec couleurs */}
<div className="mb-4">
  <div className="flex flex-wrap gap-4 justify-center">
    {REAL_ESTATE_CATEGORIES.map((category) => {
      const Icon = getIcon(category.iconName);
      const iconColor = getIconColor(category.label);
      return (
        <button
          key={category.id}
          onClick={() => handleCategoryClick(category.id)}
          className="group flex flex-col items-center gap-2 p-3 min-w-[120px] hover:scale-105 transition-transform duration-200"
        >
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center border-2 border-gray-100 bg-white shadow-md group-hover:shadow-lg transition-all">
            <Icon className={cn("h-10 w-10", iconColor)} />
          </div>
          <span className="text-sm font-medium text-gray-700 text-center group-hover:text-[#00BFA6] transition-colors">
            {category.label}
          </span>
        </button>
      );
    })}
  </div>
</div>
        </div>
      </div>

      {/* --- PROPERTIES BY CATEGORY --- */}
      {loading ? (
        <div className="py-20 text-center text-gray-500">Chargement des annonces...</div>
      ) : (
        <>
          {Object.keys(groupedAnnounces).length === 0 ? (
            <div className="py-20 text-center text-gray-500">Aucune annonce validée pour le moment.</div>
          ) : (
            Object.keys(groupedAnnounces).map((catId) => (
              <CarouselSection 
                key={catId} 
                title={groupedAnnounces[catId].label} 
                items={groupedAnnounces[catId].items} 
              />
            ))
          )}
        </>
      )}

      {/* --- WHY CHOOSE US --- */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 uppercase tracking-widest text-green-400">Pourquoi nous choisir ?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Une expertise reconnue et des outils performants pour concrétiser vos projets.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { id: "01", title: "Réseau Certifié", desc: "Transactions avec professionnels agréés et particuliers vérifiés." },
              { id: "02", title: "Expertise Locale", desc: "Des professionnels à votre service maitrisant le marché." },
              { id: "03", title: "Visibilité Maximale", desc: "Large diffusion de votre bien immobilier sur nos réseaux." },
              { id: "04", title: "Mise en Relation", desc: "Connexion gratuite et directe entre utilisateurs." },
            ].map((feature, idx) => (
              <div key={idx} className="relative p-6 group">
                <div className="absolute -top-6 -left-6 text-8xl font-black text-white/5 select-none transition-all group-hover:text-green-500/10 group-hover:scale-110 duration-500">
                  {feature.id}
                </div>
                <h3 className="text-xl font-bold mb-4 relative z-10 group-hover:text-green-400 transition-colors">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed relative z-10">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA SECTION (CONFIER) --- */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                 <h2 className="text-3xl font-bold text-gray-900 uppercase">Je confie mon projet</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Card Owner */}
                <div className="relative h-[400px] rounded-3xl overflow-hidden group cursor-pointer shadow-xl">
                    <img 
                      src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80" 
                      alt="Propriétaire" 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-8 text-center">
                         <h3 className="text-2xl font-bold text-white mb-6">Vous êtes Propriétaire ?</h3>
                         <Link href="/deposit">
                            <Button className="bg-green-600 hover:bg-green-700 text-white font-bold py-6 px-8 rounded-full shadow-lg hover:shadow-green-500/30 transition-all transform hover:-translate-y-1">
                                Confier mon bien à un spécialiste
                            </Button>
                         </Link>
                    </div>
                </div>

                {/* Card Seeker */}
                <div className="relative h-[400px] rounded-3xl overflow-hidden group cursor-pointer shadow-xl">
                    <img 
                      src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80" 
                      alt="Locataire / Acquéreur" 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-8 text-center">
                         <h3 className="text-2xl font-bold text-white mb-6">Vous cherchez un bien ?</h3>
                         <Link href="/research">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-8 rounded-full shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-1">
                                Confier ma recherche à un spécialiste
                            </Button>
                         </Link>
                    </div>
                </div>
            </div>
        </div>
      </section>
      
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-gray-100 bg-[#003B4A] text-white p-8 text-center shadow-lg">
            <p className="text-lg font-semibold tracking-wide">Application disponible bientôt</p>
          </div>
        </div>
      </section>

    </div>
  );
}