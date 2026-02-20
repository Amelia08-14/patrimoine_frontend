"use client"

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, LogOut, Plus, ChevronDown, List, CreditCard, Search, PieChart, Bell, Globe, Heart, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname(); // Get current path
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInitials, setUserInitials] = useState("");
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
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
        // OU on affiche un bouton "Admin"
        if (userData.userType === 'ADMIN') {
            setIsLoggedIn(false); // Option: Hide login state for admin on public site
            // Or redirect/handle differently. 
            // The user requested: "quand je me connecte à l'admin je trouve juste le compte société à valider et en haut ya mon compte particulier connecter l'administration doit être distinctes"
            // This suggests session leak or shared local storage.
            // Admin should have their own separate view, which they do (/admin).
            // But if they go to /, they might see "Amel Benelhadj" if local storage is shared/not cleared.
            
            // Correction: If user is ADMIN, show Admin Link or nothing specific
            setUserInitials("AD");
        } else {
            setUserInitials(`${userData.firstName?.[0] || ''}${userData.lastName?.[0] || ''}`.toUpperCase() || "AB");
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
    <nav className="bg-white shadow-sm sticky top-0 z-50 h-[80px]">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 h-full relative">
        <div className="flex justify-between items-center h-full">
          
          {/* 1. Logo Section (Left) - Overlapping */}
          <div className="absolute top-0 left-4 sm:left-6 lg:left-12 h-[130px] z-50 flex items-start pt-0">
            <Link href="/" className="flex flex-col items-center justify-center group bg-white px-6 pb-6 pt-4 rounded-b-2xl shadow-lg border-x border-b border-gray-100 h-full w-[140px]">
              <img src="/logo.png" alt="Patrimoine Logo" className="h-full w-auto object-contain transition-transform group-hover:scale-105" />
            </Link>
          </div>

          {/* Spacer for Logo to not overlap content if screen is small (though logo is absolute) */}
          <div className="w-[140px] hidden lg:block"></div>

          {/* 2. Center Actions (Buttons) - Centered in the remaining space */}
          <div className="hidden md:flex items-center gap-4 flex-1 justify-center pl-20 lg:pl-0">
             <Link href="/deposit">
               <Button className="bg-[#00BFA6] hover:bg-[#00908A] text-white rounded-full px-6 py-5 text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300">
                 <Plus className="h-4 w-4 mr-2 stroke-[3]" />
                 Déposer votre annonce
               </Button>
             </Link>
             <Link href="/research">
               <Button variant="outline" className="border-[#00BFA6] text-[#00BFA6] hover:bg-[#E6F8F6] hover:text-[#00908A] rounded-full px-6 py-5 text-sm font-bold border-2 transition-all duration-300">
                 <Plus className="h-4 w-4 mr-2 stroke-[3]" />
                 Confier votre recherche
               </Button>
             </Link>
          </div>

          {/* 3. Right Section (Auth & Language) */}
          <div className="flex items-center gap-6 ml-auto">
             {/* Auth Links */}
             {isLoggedIn ? (
               <div className="flex items-center gap-4 relative" ref={menuRef}>
                  <div className="hidden lg:flex flex-col text-right cursor-pointer" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                     <span className="text-sm font-bold text-gray-800">{user?.firstName} {user?.lastName}</span>
                     <span className="text-xs text-[#00908A] font-medium">Espace Client</span>
                  </div>
                  <div 
                    className="h-10 w-10 bg-[#003B4A] rounded-full flex items-center justify-center text-white font-bold cursor-pointer hover:ring-4 hover:ring-[#00BFA6]/20 transition-all" 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                  >
                     {userInitials}
                  </div>

                  {/* Dropdown Menu */}
                  {isMenuOpen && (
                    <div className="absolute top-14 right-0 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in zoom-in-95 duration-200 z-[100]">
                        <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-sm font-bold text-gray-900">{user?.firstName} {user?.lastName}</p>
                            <p className="text-xs text-[#00908A]">{user?.email}</p>
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
               <div className="hidden sm:flex items-center gap-4 text-sm font-medium text-gray-600">
                 <Link href="/auth/login" className="hover:text-[#00908A] transition-colors">
                   Se connecter
                 </Link>
                 <div className="h-4 w-px bg-gray-300"></div>
                 <Link href="/auth/register" className="text-[#00908A] hover:text-[#00706A] transition-colors">
                   Créer un compte
                 </Link>
               </div>
             )}

             {/* Language Selector */}
             <div className="flex items-center gap-1 border border-gray-200 rounded-full px-3 py-1.5 cursor-pointer hover:border-[#00BFA6] transition-colors group">
                <span className="text-xs font-bold text-gray-600 group-hover:text-[#00908A]">Français</span>
                <ChevronDown className="h-3 w-3 text-gray-400 group-hover:text-[#00908A]" />
             </div>
          </div>

        </div>
      </div>
    </nav>
  );
}
