"use client"

import { useTranslations } from "next-intl"
import { Building2, UserRound } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLocalizedContent } from "@/lib/typeLabels"
import { ScrollingTitle } from "@/components/ScrollingTitle"

const getImageUrl = (url?: string | null) => {
  if (!url) return ""
  if (url.startsWith("http")) return url
  const clean = url.replace(/\\/g, "/").replace(/^\//, "")
  return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/${clean}`
}

/**
 * Identité de l'auteur en pied de carte — PARTAGÉE par les cartes d'annonce (PropertyCard) et de
 * demande (EntrustedResearchCard) pour un rendu strictement identique (demande client du 06/11/2026) :
 * professionnel = logo + nom de l'entreprise (défile s'il est long) ; particulier = sa photo de profil
 * (icône à défaut) + « Particulier » (jamais son nom).
 */
export function OwnerBadge({ user, size = "md", className }: { user: any; size?: "sm" | "md"; className?: string }) {
  const t = useTranslations("PropertyCard")
  const lc = useLocalizedContent()
  const isCompany = !!(user?.companyName || user?.userType === "SOCIETE")
  const image = isCompany ? (user?.agencyLogoUrl || user?.imageUrl) : user?.imageUrl
  const name = isCompany ? (lc(user?.companyName, user?.companyNameAr, user?.companyNameEn) || t("professionalSeller")) : t("privateSeller")
  const box = size === "sm" ? "h-7 w-7" : "h-9 w-9"
  const icon = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"
  const text = size === "sm" ? "text-xs rtl:text-[13px] text-gray-500 dark:text-white/50" : "text-sm text-gray-600 dark:text-white/60"

  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      <div className={cn("shrink-0 overflow-hidden rounded-full border border-gray-100 dark:border-white/10 flex items-center justify-center", box, isCompany ? "bg-white dark:bg-white/5" : "bg-gray-50 dark:bg-white/5")}>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={getImageUrl(image)} alt={name} className={cn("h-full w-full", isCompany ? "object-contain" : "object-cover")} />
        ) : isCompany ? (
          <Building2 className={cn(icon, "text-gray-300 dark:text-white/30")} />
        ) : (
          <UserRound className={cn(icon, "text-gray-400 dark:text-white/40")} />
        )}
      </div>
      {isCompany
        ? <ScrollingTitle text={name} className={cn("flex-1 font-semibold", text)} />
        : <span className={cn("truncate font-semibold", text)}>{name}</span>}
    </div>
  )
}
