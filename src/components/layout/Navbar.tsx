"use client"

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, LogOut, Plus, ChevronDown, List, CreditCard, Search, PieChart, Bell, Globe, Heart, MessageSquare, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname(); // Get current path
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInitials, setUserInitials] = useState("");
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  const getCompanyActivityLabel = (companyActivity?: string) => {
    if (!companyActivity) return null
    const map: Record<string, string> = {
      AGENCE_IMMOBILIERE: "Agence Immobilière",
      PROMOTEUR_IMMOBILIER: "Promoteur Immobilier",
      ADMINISTRATEUR_BIENS: "Administrateur de biens",
      AUTRES_PROFESSIONNELS: "Autres Professionnels",
      HOTEL: "Hôtel",
      COMPLEXE_TOURISTIQUE: "Complexe Touristiques",
      VILLAGE_VACANCES: "Village de vacances",
      APPART_HOTEL: "Appart Hôtel",
      RESIDENCE_HOTELIERE: "Résidence Hôtelière",
      MOTEL: "Motel",
      RELAIS_ROUTIER: "Relais routier",
      CAMPING_TOURISTIQUE: "Camping Touristique",
      AUTRES_STRUCTURES: "Autres Structures",
      SALLE_DES_FETES: "Salle Des fêtes",
      SALLES_DINATOIRES: "Salles Dinatoires",
      SALLE_FORMATION: "Salle de formation",
      SALLE_CONFERENCE: "Salle de conférence",
      AUTRES_EVENEMENTIEL: "Autres",
      ENTREPOSAGE_FRIGORIFIQUE: "Entreposage et stockage frigorifiques",
      ENTREPOSAGE_NON_FRIGORIFIQUE: "Entreposage et stockage non frigorifiques",
      AUTRES_ENTREPOSAGE_STOCKAGE: "Autres",
      HOTELLERIE_HEBERGEMENT: "Hôtellerie / hébergement",
    }
    return map[companyActivity] || companyActivity
  }

  const getNavbarTitle = (u: any) => {
    if (!u) return ""
    if (u.userType === "SOCIETE") return u.companyName || u.email || ""
    return `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email || ""
  }

  // Fonction pour obtenir le libellé du type de compte
  const getUserTypeLabel = (userType: string) => {
    switch(userType) {
      case 'PARTICULIER':
        return 'Compte Particulier';
      case 'SOCIETE':
        return 'Compte Société';
      case 'ADMIN':
        return 'Administrateur';
      default:
        return 'Espace Client';
    }
  };

  const getNavbarSubtitle = (u: any) => {
    if (!u) return ""
    if (u.userType === "SOCIETE") return getCompanyActivityLabel(u.companyActivity) || "Compte Société"
    return getUserTypeLabel(u.userType)
  }

  // Fonction pour obtenir l'icône du type de compte
  const getUserTypeIcon = (userType: string) => {
    switch(userType) {
      case 'SOCIETE':
        return <Building2 className="h-3 w-3 mr-1" />;
      default:
        return <User className="h-3 w-3 mr-1" />;
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        setIsActionsOpen(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Simple check based on token existence
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
        setIsLoggedIn(true);
        const userData = JSON.parse(userStr);
        setUser(userData);
        // Si c'est un ADMIN, on ne l'affiche pas comme connecté sur le site public
        if (userData.userType === 'ADMIN') {
            setIsLoggedIn(false);
            setUserInitials("AD");
        } else {
            if (userData.userType === 'SOCIETE' && userData.companyName) {
              const parts = String(userData.companyName).trim().split(/\s+/).filter(Boolean)
              const initials = (parts[0]?.[0] || "") + (parts[1]?.[0] || parts[0]?.[1] || "")
              setUserInitials(initials.toUpperCase() || "PR")
            } else {
              setUserInitials(`${userData.firstName?.[0] || ''}${userData.lastName?.[0] || ''}`.toUpperCase() || "AB");
            }
        }
    } else {
        setIsLoggedIn(false);
    }
  }, []);

  // Don't render Navbar on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setIsMenuOpen(false);
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 h-[72px] md:h-[80px]">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 h-full">
        <div className="flex justify-between items-center h-full">
          
          <div className="flex items-center">
            <Link href="/" className="flex items-center h-full">
              <img src="/logo.png" alt="Patrimoine Logo" className="h-11 md:h-12 w-auto object-contain" />
            </Link>
          </div>

          {/* 2. Center Actions (Buttons) - Centered in the remaining space */}
          <div className="hidden lg:flex items-center gap-3 flex-1 justify-center">
             <Link href="/deposit">
               <Button className="bg-[#00BFA6] hover:bg-[#00908A] text-white rounded-full px-5 py-4 text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300">
                 <Plus className="h-4 w-4 mr-2 stroke-[3]" />
                 Déposer votre annonce
               </Button>
             </Link>
             <Link href="/research">
               <Button variant="outline" className="border-[#00BFA6] text-[#00BFA6] hover:bg-[#E6F8F6] hover:text-[#00908A] rounded-full px-5 py-4 text-sm font-bold border-2 transition-all duration-300">
                 <Plus className="h-4 w-4 mr-2 stroke-[3]" />
                 Confier votre recherche
               </Button>
             </Link>
          </div>

          {/* 3. Right Section (Auth & Language) */}
          <div className="flex items-center gap-3 md:gap-6 ml-auto">
             <div className="relative lg:hidden" ref={actionsRef}>
               <Button variant="outline" size="icon" className="border-[#00BFA6] text-[#00BFA6] hover:bg-[#E6F8F6]" onClick={() => setIsActionsOpen(!isActionsOpen)}>
                 <Plus className="h-4 w-4" />
               </Button>
               {isActionsOpen && (
                 <div className="fixed top-[76px] left-3 right-3 w-auto bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-[100]">
                   <Link href="/deposit" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00BFA6] whitespace-nowrap" onClick={() => setIsActionsOpen(false)}>
                     <Plus className="h-4 w-4 mr-3" /> Déposer votre annonce
                   </Link>
                   <Link href="/research" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00BFA6] whitespace-nowrap" onClick={() => setIsActionsOpen(false)}>
                     <Plus className="h-4 w-4 mr-3" /> Confier votre recherche
                   </Link>
                 </div>
               )}
             </div>
             {/* Auth Links */}
             {isLoggedIn ? (
               <div className="flex items-center gap-4 relative" ref={menuRef}>
                  <div className="hidden lg:flex flex-col text-right cursor-pointer" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                     <span className="text-sm font-bold text-gray-800">{getNavbarTitle(user)}</span>
                     <div className="flex items-center justify-end text-[#00908A]">
                       {getUserTypeIcon(user?.userType)}
                       <span className="text-xs font-medium">{getNavbarSubtitle(user)}</span>
                     </div>
                  </div>
                  {user?.userType === 'SOCIETE' && user?.agencyLogoUrl ? (
                      <div 
                        className="h-10 w-10 rounded-full cursor-pointer hover:ring-4 hover:ring-[#00BFA6]/20 transition-all overflow-hidden border border-gray-200 bg-white flex items-center justify-center"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                      >
                          <img 
                              src={user.agencyLogoUrl.startsWith('http') ? user.agencyLogoUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/${user.agencyLogoUrl.replace(/^\/+/, '')}`} 
                              alt="Logo agence" 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                  // Fallback to initials if image fails to load
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.parentElement!.innerHTML = userInitials;
                                  e.currentTarget.parentElement!.className = "h-10 w-10 bg-[#003B4A] rounded-full flex items-center justify-center text-white font-bold cursor-pointer hover:ring-4 hover:ring-[#00BFA6]/20 transition-all";
                              }}
                          />
                      </div>
                  ) : (
                      <div 
                        className="h-10 w-10 bg-[#003B4A] rounded-full flex items-center justify-center text-white font-bold cursor-pointer hover:ring-4 hover:ring-[#00BFA6]/20 transition-all" 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                      >
                         {userInitials}
                      </div>
                  )}

                  {/* Dropdown Menu */}
                  {isMenuOpen && (
                    <div className="absolute top-14 right-0 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in zoom-in-95 duration-200 z-[100]">
                        <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-sm font-bold text-gray-900">{getNavbarTitle(user)}</p>
                            <div className="flex items-center text-xs text-[#00908A] mt-1">
                              {getUserTypeIcon(user?.userType)}
                              <span>{getNavbarSubtitle(user)}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                        </div>
                        
                        <div className="py-2">
                            <Link href="/profile/announces" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00BFA6]">
                                <List className="h-4 w-4 mr-3" /> Annonces déposées
                            </Link>
                            <Link href="/profile/favorites" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00BFA6]">
                                <Heart className="h-4 w-4 mr-3" /> Mes favoris
                            </Link>
                            <Link href="/profile/messages" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00BFA6]">
                                <MessageSquare className="h-4 w-4 mr-3" /> Ma messagerie
                            </Link>
                            <Link href="/profile/points" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00BFA6]">
                                <CreditCard className="h-4 w-4 mr-3" /> Mes points
                            </Link>
                            <Link href="/profile/packs" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00BFA6]">
                                <CreditCard className="h-4 w-4 mr-3" /> Packs de points
                            </Link>
                            <Link href="/profile/researches" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00BFA6]">
                                <Search className="h-4 w-4 mr-3" /> Recherches confiées
                            </Link>
                            <Link href="/profile/stats" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00BFA6]">
                                <PieChart className="h-4 w-4 mr-3" /> Statistiques
                            </Link>
                        </div>

                        <div className="border-t border-gray-100 py-2">
                            <Link href="/profile/info" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00BFA6]">
                                <User className="h-4 w-4 mr-3" /> Mon profil
                            </Link>
                            <Link href="/profile/notifications" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00BFA6]">
                                <Bell className="h-4 w-4 mr-3" /> Mes notifications
                            </Link>
                            <div className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00BFA6] cursor-pointer">
                                <Globe className="h-4 w-4 mr-3" /> Langue
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-2 pb-1">
                            <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                <LogOut className="h-4 w-4 mr-3" /> Déconnexion
                            </button>
                        </div>
                    </div>
                  )}
               </div>
             ) : (
               <div className="flex items-center gap-2">
                 <Link href="/auth/login">
                   <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full px-4 py-2 h-auto text-xs md:text-sm font-bold">
                     Se connecter
                   </Button>
                 </Link>
                 <Link href="/auth/register">
                   <Button className="bg-[#00BFA6] hover:bg-[#00908A] text-white rounded-full px-4 py-2 h-auto text-xs md:text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300">
                     Créer un compte
                   </Button>
                 </Link>
               </div>
             )}

             {/* Language Selector */}
             <div className="hidden md:flex items-center gap-1 border border-gray-200 rounded-full px-3 py-1.5 cursor-pointer hover:border-[#00BFA6] transition-colors group">
                <span className="text-xs font-bold text-gray-600 group-hover:text-[#00908A]">Français</span>
                <ChevronDown className="h-3 w-3 text-gray-400 group-hover:text-[#00908A]" />
             </div>
          </div>

        </div>
      </div>
      <div className="md:hidden" ref={langRef}>
        <button
          type="button"
          className="fixed bottom-3 right-3 h-10 w-10 rounded-full bg-white border border-gray-200 shadow-lg flex items-center justify-center text-[#00908A] z-[60]"
          onClick={() => setIsLangOpen(!isLangOpen)}
        >
          <Globe className="h-4 w-4" />
        </button>
        {isLangOpen && (
          <div className="fixed bottom-16 right-3 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-[60]">
            <button type="button" className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00BFA6]" onClick={() => setIsLangOpen(false)}>
              Français
            </button>
            <button type="button" className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00BFA6]" onClick={() => setIsLangOpen(false)}>
              العربية
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
