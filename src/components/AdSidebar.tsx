"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAds, type Ad } from "@/lib/useAds"

const isExternal = (href: string) => /^https?:\/\//i.test(href)

function AdLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  return isExternal(href)
    ? <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>
    : <Link href={href as any} className={className}>{children}</Link>
}

/** Fait tourner les annonces d'un emplacement (fondu enchaîné), avec un décalage propre à chaque colonne. */
function useRotation(count: number, everyMs: number, offsetMs: number) {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    if (count <= 1) return
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return
    let interval: ReturnType<typeof setInterval> | undefined
    const start = setTimeout(() => { interval = setInterval(() => setIndex((i) => (i + 1) % count), everyMs) }, offsetMs)
    return () => { clearTimeout(start); if (interval) clearInterval(interval) }
  }, [count, everyMs, offsetMs])
  return index % Math.max(count, 1)
}

/**
 * Colonne publicitaire verticale, collée sous l'en-tête pendant le défilement. Elle s'adapte à l'espace libre :
 * largeur et hauteur suivent la fenêtre (clamp), et l'appelant choisit à partir de quelle largeur d'écran
 * elle apparaît (classes `hidden xl:block`, `hidden 2xl:block`…). Deux colonnes se partagent la liste
 * d'annonces (paires / impaires) et tournent en décalé.
 */
export function AdSidebar({ side, className }: { side: "start" | "end"; className?: string }) {
  const t = useTranslations("AnnouncesPage")
  const all = useAds()
  const mine = all.filter((_, i) => i % 2 === (side === "start" ? 0 : 1))
  const ads: Ad[] = mine.length > 0 ? mine : all
  const index = useRotation(ads.length, 7000, side === "start" ? 0 : 3500)

  return (
    <aside aria-label={t("adLabel")} className={cn("sticky top-24 shrink-0 self-start", className)}>
      <div className="relative w-[clamp(10.5rem,11vw,17rem)] h-[clamp(20rem,64vh,38rem)] overflow-hidden rounded-3xl bg-[#003B4A] shadow-md">
        {ads.map((ad, i) => (
          <AdLink
            key={ad.key}
            href={ad.href}
            className={cn("absolute inset-0 block transition-opacity duration-1000", i === index ? "opacity-100" : "pointer-events-none opacity-0")}
          >
            <img src={ad.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#003B4A] via-[#003B4A]/70 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-4">
              {ad.title && <h3 className="font-brand text-lg leading-tight text-white line-clamp-3">{ad.title}</h3>}
              {ad.subtitle && <p className="text-xs leading-snug text-white/75 line-clamp-4">{ad.subtitle}</p>}
              <span className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-[#00BFA6] px-3.5 py-2 text-xs font-extrabold text-white shadow-lg shadow-black/10">
                {ad.cta} <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
              </span>
            </div>
          </AdLink>
        ))}
        <span className="absolute top-3 end-3 z-10 rounded-full bg-black/40 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white/80 backdrop-blur-sm">
          {t("adLabel")}
        </span>
      </div>
    </aside>
  )
}

/**
 * Pendant mobile / tablette des colonnes : quand l'écran est trop étroit pour des colonnes, la publicité passe
 * en bandeau bas et compact, inséré dans la liste. Même source, même rotation.
 */
export function AdStrip({ className }: { className?: string }) {
  const t = useTranslations("AnnouncesPage")
  const ads = useAds()
  const index = useRotation(ads.length, 6000, 1500)
  const ad = ads[index]
  if (!ad) return null

  return (
    <aside aria-label={t("adLabel")} className={cn("relative overflow-hidden rounded-2xl bg-[#003B4A] shadow-sm", className)}>
      <AdLink href={ad.href} className="relative flex h-24 sm:h-28 items-center">
        <img key={ad.key} src={ad.image} alt="" className="absolute inset-0 h-full w-full object-cover animate-in fade-in duration-700" />
        <div className="absolute inset-0 bg-gradient-to-r rtl:bg-gradient-to-l from-[#003B4A] via-[#003B4A]/80 to-transparent" />
        <div className="relative z-10 flex min-w-0 flex-1 items-center gap-3 px-4">
          <div className="min-w-0 flex-1">
            {ad.title && <p className="truncate font-brand text-base sm:text-lg leading-tight text-white">{ad.title}</p>}
            {ad.subtitle && <p className="mt-0.5 truncate text-xs text-white/70">{ad.subtitle}</p>}
          </div>
          <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[#00BFA6] px-3.5 py-2 text-xs font-extrabold text-white">
            {ad.cta} <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
          </span>
        </div>
      </AdLink>
      <span className="absolute top-2 end-2 z-10 rounded-full bg-black/40 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white/80 backdrop-blur-sm">
        {t("adLabel")}
      </span>
    </aside>
  )
}
