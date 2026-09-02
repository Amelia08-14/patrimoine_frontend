"use client"

import { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { Link, usePathname } from "@/i18n/navigation"
import { Home, Search, Plus, MessageSquare, User, ClipboardList, X } from "lucide-react"

/**
 * Navigation mobile persistante (bottom tab bar), calquée sur l'IA de l'app mobile à venir :
 * Accueil / Rechercher / [+ action centrale] / Messages / Profil. Remplace, sous `lg`, l'ancien
 * système de dropdowns improvisés (voir Navbar.tsx — le mini-menu "+" du haut a été retiré).
 * Ne s'affiche que sur le site public ([locale]/layout.tsx) : l'admin garde son propre layout.
 */
export function MobileBottomNav() {
  const t = useTranslations("Navbar")
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userStr = localStorage.getItem("user")
    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr)
        setIsLoggedIn(userData.userType !== "ADMIN")
      } catch {
        setIsLoggedIn(false)
      }
    }
  }, [])

  // Ferme le tiroir d'actions si on tape en dehors, ou si on navigue.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(event.target as Node)) {
        setIsSheetOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])
  useEffect(() => { setIsSheetOpen(false) }, [pathname])

  const isHome = pathname === "/"
  const isSearch = pathname.startsWith("/announces") || pathname.startsWith("/demandes")
  const isMessages = pathname.startsWith("/profile/messages")
  const isProfile = pathname.startsWith("/profile") && !isMessages || pathname.startsWith("/auth")

  const tabClass = (active: boolean) =>
    `flex flex-col items-center justify-center gap-1 flex-1 h-full text-[11px] font-bold transition-colors ${
      active ? "text-[#0094BD] dark:text-[#0094BD]" : "text-gray-400 dark:text-white/40"
    }`

  return (
    <>
      {/* Tiroir d'actions rapides — Déposer / Confier / Demandes en cours, ouvert par le "+" central */}
      {isSheetOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden bg-black/30 backdrop-blur-[1px]" aria-hidden="true">
          <div
            ref={sheetRef}
            className="absolute left-3 right-3 bottom-[calc(84px+env(safe-area-inset-bottom))] bg-white dark:bg-[#03303c] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/10">
              <span className="text-sm font-bold text-gray-800 dark:text-white">{t("navAddSheetTitle")}</span>
              <button type="button" onClick={() => setIsSheetOpen(false)} className="text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/70">
                <X className="h-4 w-4" />
              </button>
            </div>
            <Link href="/deposit" className="flex items-center gap-3 px-4 py-3.5 text-sm font-semibold text-gray-700 dark:text-white/80 hover:bg-gray-50 dark:hover:bg-white/5" onClick={() => setIsSheetOpen(false)}>
              <span className="h-9 w-9 shrink-0 rounded-full bg-[#00BFA6]/10 flex items-center justify-center"><Plus className="h-4.5 w-4.5 text-[#00BFA6]" /></span>
              {t("depositAd")}
            </Link>
            <Link href="/research" className="flex items-center gap-3 px-4 py-3.5 text-sm font-semibold text-gray-700 dark:text-white/80 hover:bg-gray-50 dark:hover:bg-white/5" onClick={() => setIsSheetOpen(false)}>
              <span className="h-9 w-9 shrink-0 rounded-full bg-[#0094BD]/10 flex items-center justify-center"><Plus className="h-4.5 w-4.5 text-[#0094BD]" /></span>
              {t("entrustSearch")}
            </Link>
            <Link href="/demandes" className="flex items-center gap-3 px-4 py-3.5 text-sm font-semibold text-gray-700 dark:text-white/80 hover:bg-gray-50 dark:hover:bg-white/5" onClick={() => setIsSheetOpen(false)}>
              <span className="h-9 w-9 shrink-0 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center"><ClipboardList className="h-4.5 w-4.5 text-gray-500 dark:text-white/60" /></span>
              {t("pendingRequests")}
            </Link>
          </div>
        </div>
      )}

      <nav
        className="fixed bottom-0 inset-x-0 z-[65] lg:hidden bg-white dark:bg-[#022229] border-t border-gray-100 dark:border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]"
        aria-label={t("navHome")}
      >
        <div className="flex items-stretch h-16">
          <Link href="/" className={tabClass(isHome)}>
            <Home className="h-5 w-5" strokeWidth={isHome ? 2.5 : 2} />
            {t("navHome")}
          </Link>
          <Link href="/announces" className={tabClass(isSearch)}>
            <Search className="h-5 w-5" strokeWidth={isSearch ? 2.5 : 2} />
            {t("navSearch")}
          </Link>

          {/* Action centrale surélevée — ouvre le tiroir Déposer / Confier / Demandes */}
          <div className="flex-1 flex items-center justify-center relative">
            <button
              type="button"
              onClick={() => setIsSheetOpen((v) => !v)}
              aria-label={t("navAddSheetTitle")}
              className="absolute -top-5 h-12 w-12 rounded-full bg-[#00BFA6] hover:bg-[#00A896] text-white shadow-lg shadow-[#00BFA6]/30 flex items-center justify-center ring-4 ring-white dark:ring-[#022229] transition-transform active:scale-95"
            >
              <Plus className="h-6 w-6 stroke-[2.5]" />
            </button>
          </div>

          <Link href="/profile/messages" className={tabClass(isMessages)}>
            <MessageSquare className="h-5 w-5" strokeWidth={isMessages ? 2.5 : 2} />
            {t("navMessages")}
          </Link>
          <Link href={isLoggedIn ? "/profile/info" : "/auth/login"} className={tabClass(isProfile)}>
            <User className="h-5 w-5" strokeWidth={isProfile ? 2.5 : 2} />
            {t("navProfile")}
          </Link>
        </div>
      </nav>
    </>
  )
}
