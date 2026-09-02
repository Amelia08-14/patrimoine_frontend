"use client"

import { useEffect, useState, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, useRouter, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { User, LogOut, Plus, ChevronDown, List, Coins, Megaphone, Search, PieChart, Bell, Globe, Heart, MessageSquare, Building2, Store, ClipboardList, Handshake, LifeBuoy, LayoutTemplate, Check, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

const LOCALE_LABELS: Record<string, string> = { fr: 'Français', en: 'English', ar: 'العربية' };

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname(); // Get current path (locale-agnostic)
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const t = useTranslations('Navbar');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInitials, setUserInitials] = useState("");
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifPreview, setNotifPreview] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const desktopLangRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const getCompanyActivityLabel = (companyActivity?: string) => {
    if (!companyActivity) return null
    const map: Record<string, string> = {
      AGENCE_IMMOBILIERE: locale === 'ar' ? 'وكالة عقارية' : locale === 'en' ? 'Real Estate Agency' : 'Agence Immobilière',
      PROMOTEUR_IMMOBILIER: locale === 'ar' ? 'مطور عقاري' : locale === 'en' ? 'Real Estate Developer' : 'Promoteur Immobilier',
      ADMINISTRATEUR_BIENS: locale === 'ar' ? 'مدير عقارات' : locale === 'en' ? 'Property Manager' : 'Administrateur de biens',
      AUTRES_PROFESSIONNELS: locale === 'ar' ? 'مهن أخرى' : locale === 'en' ? 'Other Professionals' : 'Autres Professionnels',
      HOTEL: locale === 'ar' ? 'فندق' : locale === 'en' ? 'Hotel' : 'Hôtel',
      COMPLEXE_TOURISTIQUE: locale === 'ar' ? 'مجمع سياحي' : locale === 'en' ? 'Tourist Complex' : 'Complexe Touristiques',
      VILLAGE_VACANCES: locale === 'ar' ? 'قرية سياحية' : locale === 'en' ? 'Holiday Village' : 'Village de vacances',
      APPART_HOTEL: locale === 'ar' ? 'شقق فندقية' : locale === 'en' ? 'Serviced Apartments' : 'Appart Hôtel',
      RESIDENCE_HOTELIERE: locale === 'ar' ? 'إقامة فندقية' : locale === 'en' ? 'Hotel Residence' : 'Résidence Hôtelière',
      MOTEL: locale === 'ar' ? 'موتيل' : locale === 'en' ? 'Motel' : 'Motel',
      RELAIS_ROUTIER: locale === 'ar' ? 'استراحة طريق' : locale === 'en' ? 'Roadside Inn' : 'Relais routier',
      CAMPING_TOURISTIQUE: locale === 'ar' ? 'مخيم سياحي' : locale === 'en' ? 'Tourist Camp' : 'Camping Touristique',
      AUTRES_STRUCTURES: locale === 'ar' ? 'هياكل أخرى' : locale === 'en' ? 'Other Structures' : 'Autres Structures',
      SALLE_DES_FETES: locale === 'ar' ? 'قاعة أفراح' : locale === 'en' ? 'Event Hall' : 'Salle Des fêtes',
      SALLES_DINATOIRES: locale === 'ar' ? 'قاعات مأدبة' : locale === 'en' ? 'Banquet Halls' : 'Salles Dinatoires',
      SALLE_FORMATION: locale === 'ar' ? 'قاعة تدريب' : locale === 'en' ? 'Training Room' : 'Salle de formation',
      SALLE_CONFERENCE: locale === 'ar' ? 'قاعة اجتماعات' : locale === 'en' ? 'Conference Room' : 'Salle de conférence',
      AUTRES_EVENEMENTIEL: locale === 'ar' ? 'أخرى' : locale === 'en' ? 'Other' : 'Autres',
      ENTREPOSAGE_FRIGORIFIQUE: locale === 'ar' ? 'تخزين تبريد' : locale === 'en' ? 'Cold Storage' : 'Entreposage et stockage frigorifiques',
      ENTREPOSAGE_NON_FRIGORIFIQUE: locale === 'ar' ? 'تخزين عادي' : locale === 'en' ? 'Non-Refrigerated Storage' : 'Entreposage et stockage non frigorifiques',
      AUTRES_ENTREPOSAGE_STOCKAGE: locale === 'ar' ? 'أخرى' : locale === 'en' ? 'Other' : 'Autres',
      HOTELLERIE_HEBERGEMENT: locale === 'ar' ? 'الفندقة / الإقامة' : locale === 'en' ? 'Hospitality / Accommodation' : 'Hôtellerie / hébergement',
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
        return t('particulierAccount');
      case 'SOCIETE':
        return t('societeAccount');
      case 'ADMIN':
        return t('administrator');
      default:
        return t('clientSpace');
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
        return <Building2 className={cn("h-3 w-3", isRTL ? "ml-1" : "mr-1")} />;
      default:
        return <User className={cn("h-3 w-3", isRTL ? "ml-1" : "mr-1")} />;
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (
        langRef.current && !langRef.current.contains(event.target as Node) &&
        desktopLangRef.current && !desktopLangRef.current.contains(event.target as Node)
      ) {
        setIsLangOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
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

  // Badge "non lues" — cloche du dropdown compte + petit point sur l'avatar. Rafraîchi toutes les
  // 60s : léger (juste un count), pas besoin de websocket pour ce niveau de fraîcheur.
  useEffect(() => {
    if (!isLoggedIn) { setUnreadNotifications(0); return; }
    const token = localStorage.getItem('token');
    if (!token) return;
    const fetchCount = () => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((d) => setUnreadNotifications(d?.count || 0))
        .catch(() => {});
    };
    fetchCount();
    const interval = setInterval(fetchCount, 60000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const notifApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Aperçu rapide (8 dernières) chargé à l'ouverture du panneau — pas à chaque frappe/rendu,
  // pour ne pas multiplier les requêtes en plus du compteur déjà rafraîchi toutes les 60s.
  const toggleNotifDropdown = () => {
    const next = !isNotifOpen;
    setIsNotifOpen(next);
    if (next) {
      setNotifLoading(true);
      const token = localStorage.getItem('token');
      fetch(`${notifApiUrl}/notifications`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((d) => setNotifPreview(Array.isArray(d) ? d.slice(0, 8) : []))
        .catch(() => {})
        .finally(() => setNotifLoading(false));
    }
  };

  const handleOpenNotif = (n: any) => {
    setIsNotifOpen(false);
    if (!n.isRead) {
      setUnreadNotifications((c) => Math.max(0, c - 1));
      const token = localStorage.getItem('token');
      fetch(`${notifApiUrl}/notifications/${n.id}/read`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
    }
    if (n.link) router.push(n.link);
  };

  const handleMarkAllNotifsRead = () => {
    setUnreadNotifications(0);
    setNotifPreview((prev) => prev.map((x) => ({ ...x, isRead: true })));
    const token = localStorage.getItem('token');
    fetch(`${notifApiUrl}/notifications/read-all`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
  };

  // Horodatage compact ("à l'instant", "il y a 5 min", "il y a 3h", puis date) pour le panneau.
  const timeAgo = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const min = Math.floor(diffMs / 60000);
    if (min < 1) return locale === 'ar' ? 'الآن' : locale === 'en' ? 'just now' : "à l'instant";
    if (min < 60) return locale === 'ar' ? `قبل ${min} دقيقة` : locale === 'en' ? `${min} min ago` : `il y a ${min} min`;
    const h = Math.floor(min / 60);
    if (h < 24) return locale === 'ar' ? `قبل ${h} ساعة` : locale === 'en' ? `${h} hr ago` : `il y a ${h} h`;
    const d = Math.floor(h / 24);
    if (d < 7) return locale === 'ar' ? `قبل ${d} يوم` : locale === 'en' ? `${d} day ago` : `il y a ${d} j`;
    return new Date(dateStr).toLocaleDateString(locale === 'ar' ? 'ar-DZ' : locale === 'en' ? 'en-GB' : 'fr-FR', { day: '2-digit', month: '2-digit' });
  };

  const isCompanyAccount = user?.userType === 'SOCIETE';

  const switchLocale = (newLocale: string) => {
    setIsLangOpen(false);
    router.replace(pathname, { locale: newLocale });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setIsMenuOpen(false);
    router.push('/');
  };

  return (
    <nav className="bg-white dark:bg-[#022229] dark:border-b dark:border-white/10 shadow-sm sticky top-0 z-50 h-[72px] md:h-[80px] transition-colors">
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
                 {t('depositAd')}
               </Button>
             </Link>
             <Link href="/research">
               <Button variant="outline" className="border-[#0094BD] text-[#0094BD] hover:bg-[#E3F4FA] hover:text-[#003B4A] rounded-full px-5 py-4 text-sm font-bold border-2 transition-all duration-300">
                 <Plus className="h-4 w-4 mr-2 stroke-[3]" />
                 {t('entrustSearch')}
               </Button>
             </Link>
             <Link href="/demandes" className="flex items-center gap-1.5 text-sm font-bold text-gray-600 dark:text-white/70 hover:text-[#00BFA6] dark:hover:text-[#0094BD] transition-colors px-2">
               <ClipboardList className="h-4 w-4" />
               {t('pendingRequests')}
             </Link>
          </div>

          {/* 3. Right Section (Auth & Language) */}
          <div className={cn("flex items-center gap-3 md:gap-6", isRTL ? "mr-auto" : "ml-auto")}>
             {/* Quick access: Confier */}
             <Link
               href="/research"
               title={t('entrustSearch')}
               className="hidden md:flex items-center gap-1.5 border border-gray-200 rounded-full px-3 py-1.5 text-xs font-bold text-gray-600 hover:border-[#0094BD] hover:text-[#003B4A] transition-colors"
             >
               <Handshake className={cn("h-3.5 w-3.5", isRTL ? "ml-1.5" : "mr-1.5")} />
               {t('entrustQuick')}
             </Link>
             {/* Cloche de notifications — aperçu rapide sans quitter la page, avec marquer-comme-lu */}
             {isLoggedIn && (
               <div className="relative" ref={notifRef}>
                 <button
                   onClick={toggleNotifDropdown}
                   aria-label={t('notification')}
                   className="relative h-9 w-9 flex items-center justify-center rounded-full text-gray-500 dark:text-white/60 hover:bg-gray-50 dark:hover:bg-white/10 hover:text-[#0094BD] transition-colors"
                 >
                   <Bell className="h-5 w-5" />
                   {unreadNotifications > 0 && (
                     <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 border border-white dark:border-[#022229]" />
                   )}
                 </button>

                 {isNotifOpen && (
                   <div className={cn("absolute top-full mt-2 w-80 bg-white dark:bg-[#03303c] rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 overflow-hidden z-[100]", isRTL ? "left-0" : "right-0")}>
                     <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/10">
                       <span className="font-bold text-sm text-gray-900 dark:text-white">{t('notification')}</span>
                       {unreadNotifications > 0 && (
                         <button onClick={handleMarkAllNotifsRead} className="text-xs font-bold text-[#00BFA6] hover:underline whitespace-nowrap">
                           {t('markAllRead')}
                         </button>
                       )}
                     </div>
                     <div className="max-h-96 overflow-y-auto">
                       {notifLoading ? (
                         <div className="px-4 py-8 flex items-center justify-center">
                           <span className="h-5 w-5 border-2 border-gray-200 dark:border-white/20 border-t-[#00BFA6] rounded-full animate-spin" />
                         </div>
                       ) : notifPreview.length === 0 ? (
                         <p className="px-4 py-8 text-center text-sm text-gray-400 dark:text-white/40">{t('noNotifications')}</p>
                       ) : (
                         notifPreview.map((n) => (
                           <button
                             key={n.id}
                             onClick={() => handleOpenNotif(n)}
                             className={cn(
                               "w-full text-start px-4 py-3 border-b border-gray-50 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors",
                               !n.isRead && "bg-[#00BFA6]/[0.05]"
                             )}
                           >
                             <div className="flex items-start justify-between gap-2">
                               <p className={cn("text-xs leading-snug", !n.isRead ? "font-bold text-gray-900 dark:text-white" : "font-medium text-gray-600 dark:text-white/60")}>
                                 {n.title}
                               </p>
                               {!n.isRead && <span className="h-1.5 w-1.5 rounded-full bg-[#00BFA6] shrink-0 mt-1" />}
                             </div>
                             <span className="text-[10px] text-gray-400 dark:text-white/30">{timeAgo(n.createdAt)}</span>
                           </button>
                         ))
                       )}
                     </div>
                     <Link
                       href="/profile/notifications"
                       onClick={() => setIsNotifOpen(false)}
                       className="block text-center py-2.5 text-xs font-bold text-[#00BFA6] hover:bg-gray-50 dark:hover:bg-white/5 border-t border-gray-100 dark:border-white/10 transition-colors"
                     >
                       {t('viewAllNotifications')}
                     </Link>
                   </div>
                 )}
               </div>
             )}

             {/* Auth Links */}
             {isLoggedIn ? (
               <div className="flex items-center gap-4 relative" ref={menuRef}>
                  <div className={cn("hidden lg:flex flex-col cursor-pointer", isRTL ? "text-left" : "text-right")} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                     <span className="text-sm font-bold text-gray-800">{getNavbarTitle(user)}</span>
                     <div className={cn("flex items-center text-[#00908A]", isRTL ? "justify-start" : "justify-end")}>
                       {getUserTypeIcon(user?.userType)}
                       <span className="text-xs font-medium">{getNavbarSubtitle(user)}</span>
                     </div>
                  </div>
                  <div className="relative shrink-0">
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 z-10 h-3.5 w-3.5 rounded-full bg-red-500 border-2 border-white dark:border-[#022229]" aria-label={`${unreadNotifications} notifications non lues`} />
                  )}
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
                  </div>

                  {/* Dropdown Menu */}
                  {isMenuOpen && (
                    <div className={cn("absolute top-14 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in zoom-in-95 duration-200 z-[100]", isRTL ? "left-0" : "right-0")}>
                        <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-sm font-bold text-gray-900">{getNavbarTitle(user)}</p>
                            <div className={cn("flex items-center text-xs text-[#00908A] mt-1", isRTL ? "justify-start" : "justify-end")}>
                              {getUserTypeIcon(user?.userType)}
                              <span>{getNavbarSubtitle(user)}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                        </div>
                        
                        <div className="max-h-[70vh] overflow-y-auto">
                            {/* 1. Mon Espace Personnel / Professionnel */}
                            <div className="py-2 border-b border-gray-100">
                                <p className="px-4 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    {isCompanyAccount ? t('professionalSpace') : t('personalSpace')}
                                </p>
                                <Link href="/profile/info" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00BFA6]">
                                    <User className={cn("h-4 w-4", isRTL ? "ml-3" : "mr-3")} /> {t('myProfile')}
                                </Link>
                                <Link href="/profile/notifications" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00BFA6]">
                                    <Bell className={cn("h-4 w-4", isRTL ? "ml-3" : "mr-3")} /> {t('notification')}
                                    {unreadNotifications > 0 && (
                                      <span className={cn("h-5 min-w-[20px] px-1.5 rounded-full bg-[#00BFA6] text-white text-[11px] font-black flex items-center justify-center", isRTL ? "mr-auto" : "ml-auto") }>
                                        {unreadNotifications}
                                      </span>
                                    )}
                                </Link>
                                <div className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00BFA6] cursor-pointer">
                                    <Globe className={cn("h-4 w-4", isRTL ? "ml-3" : "mr-3")} /> {t('languageItem')}
                                </div>
                            </div>

                            {/* 2. Annonces & Favoris */}
                            <div className="py-2 border-b border-gray-100">
                                <p className="px-4 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('adsAndFavorites')}</p>
                                <Link href="/profile/announces" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00BFA6]">
                                    <List className={cn("h-4 w-4", isRTL ? "ml-3" : "mr-3")} /> {t('ads')}
                                </Link>
                                <Link href="/profile/favorites" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00BFA6]">
                                    <Heart className={cn("h-4 w-4", isRTL ? "ml-3" : "mr-3")} /> {t('favorites')}
                                </Link>
                                <Link href="/profile/researches" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00BFA6]">
                                    <Search className={cn("h-4 w-4", isRTL ? "ml-3" : "mr-3")} /> {isCompanyAccount ? t('entrustedShort') : t('entrustedSearches')}
                                </Link>
                            </div>

                            {/* 3. Ma Boutique & Type de Vitrine — Société uniquement */}
                            {isCompanyAccount && (
                              <div className="py-2 border-b border-gray-100">
                                <p className="px-4 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('myShopAndShowcase')}</p>
                                <Link href="/profile/boutique" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00BFA6]">
                                    <Store className={cn("h-4 w-4", isRTL ? "ml-3" : "mr-3")} /> {t('myShopItem')}
                                </Link>
                                <Link href="/profile/vitrine" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00BFA6]">
                                    <LayoutTemplate className={cn("h-4 w-4", isRTL ? "ml-3" : "mr-3")} /> {t('showcaseType')}
                                </Link>
                              </div>
                            )}

                            {/* 4. Communication & Actions */}
                            <div className="py-2 border-b border-gray-100">
                                <p className="px-4 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('communicationAndActions')}</p>
                                <Link href="/profile/messages" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00BFA6]">
                                    <MessageSquare className={cn("h-4 w-4", isRTL ? "ml-3" : "mr-3")} /> {t('messaging')}
                                </Link>
                            </div>

                            {/* 4. Fidélité, Visibilité & Performances */}
                            <div className="py-2 border-b border-gray-100">
                                <p className="px-4 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('loyaltyVisibilityPerformance')}</p>
                                <Link href="/profile/points" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00BFA6]">
                                    <Coins className={cn("h-4 w-4", isRTL ? "ml-3" : "mr-3")} /> {t('myPoints')}
                                </Link>
                                <Link href="/profile/advertising" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00BFA6]">
                                    <Megaphone className={cn("h-4 w-4", isRTL ? "ml-3" : "mr-3")} /> {t('adSpace')}
                                </Link>
                                <Link href="/profile/stats" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00BFA6]">
                                    <PieChart className={cn("h-4 w-4", isRTL ? "ml-3" : "mr-3")} /> {t('statistics')}
                                </Link>
                            </div>

                            {/* 5. Assistance */}
                            <div className="py-2">
                                <p className="px-4 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('assistance')}</p>
                                <Link href="/contact?motif=technique" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00BFA6]">
                                    <LifeBuoy className={cn("h-4 w-4", isRTL ? "ml-3" : "mr-3")} /> {t('technicalAssistance')}
                                </Link>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-2 pb-1">
                            <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                <LogOut className={cn("h-4 w-4", isRTL ? "ml-3" : "mr-3")} /> {t('logout')}
                            </button>
                        </div>
                    </div>
                  )}
               </div>
             ) : (
               <div className="flex items-center gap-2">
                 <Link href="/auth/login">
                   <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full px-4 py-2 h-auto text-xs md:text-sm font-bold">
                     {t('login')}
                   </Button>
                 </Link>
                 <Link href="/auth/register">
                   <Button className="bg-[#00BFA6] hover:bg-[#00908A] text-white rounded-full px-4 py-2 h-auto text-xs md:text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300">
                     {t('register')}
                   </Button>
                 </Link>
               </div>
             )}

             {/* Bascule thème clair / sombre */}
             <button
               type="button"
               onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
               aria-label={t('toggleTheme')}
               className="hidden md:flex items-center justify-center h-8 w-8 rounded-full border border-gray-200 dark:border-white/20 text-gray-500 dark:text-white/70 hover:border-[#0094BD] hover:text-[#0094BD] transition-colors"
             >
               {mounted && resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
             </button>

             {/* Language Selector */}
             <div className="relative hidden md:block" ref={desktopLangRef}>
               <div
                 className="flex items-center gap-1 border border-gray-200 dark:border-white/20 rounded-full px-3 py-1.5 cursor-pointer hover:border-[#00BFA6] transition-colors group"
                 onClick={() => setIsLangOpen(!isLangOpen)}
               >
                  <span className="text-xs font-bold text-gray-600 dark:text-white/70 group-hover:text-[#00908A]">{LOCALE_LABELS[locale]}</span>
                  <ChevronDown className="h-3 w-3 text-gray-400 dark:text-white/50 group-hover:text-[#00908A]" />
               </div>
               {isLangOpen && (
                 <div className={cn("absolute top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-[100]", isRTL ? "left-0" : "right-0")}>
                   {routing.locales.map((l) => (
                     <button
                       key={l}
                       type="button"
                       className={cn("w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00BFA6]", isRTL ? "flex-row-reverse" : "")}
                       onClick={() => switchLocale(l)}
                     >
                       {LOCALE_LABELS[l]}
                       {locale === l && <Check className="h-3.5 w-3.5 text-[#00BFA6]" />}
                     </button>
                   ))}
                 </div>
               )}
             </div>
          </div>

        </div>
      </div>
      <div className="md:hidden" ref={langRef}>
        <button
          type="button"
          className="fixed bottom-[calc(76px+env(safe-area-inset-bottom))] right-3 h-10 w-10 rounded-full bg-white dark:bg-[#03303c] border border-gray-200 dark:border-white/10 shadow-lg flex items-center justify-center text-[#00908A] dark:text-[#0094BD] z-[60]"
          onClick={() => setIsLangOpen(!isLangOpen)}
        >
          <Globe className="h-4 w-4" />
        </button>
        {isLangOpen && (
          <div className="fixed bottom-[calc(132px+env(safe-area-inset-bottom))] right-3 w-40 bg-white dark:bg-[#03303c] rounded-xl shadow-xl border border-gray-100 dark:border-white/10 py-2 z-[60]">
            {routing.locales.map((l) => (
              <button
                key={l}
                type="button"
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-[#00BFA6]"
                onClick={() => switchLocale(l)}
              >
                {LOCALE_LABELS[l]}
                {locale === l && <Check className="h-3.5 w-3.5 text-[#00BFA6]" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
