"use client"

import { useEffect, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAds } from "@/lib/useAds"

/**
 * Espace publicitaire défilant du haut de `/announces` (à la place de l'ancien bandeau sombre du filtre).
 *
 * Source : les visuels gérés dans l'admin (Contenu du site > Slides d'accueil — titre/sous-titre/bouton/lien en
 * 3 langues). Il n'existe pas encore de module de publicité dédié : tant que ce n'est pas le cas, les slides
 * publiés servent d'annonces publicitaires, et à défaut deux encarts maison (déposer une annonce / boutique).
 * Défilement automatique, pause au survol, flèches et points ; respecte `prefers-reduced-motion`.
 */
export function AdBanner() {
  const t = useTranslations("AnnouncesPage")
  const isRtl = useLocale() === "ar"
  const ads = useAds()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || ads.length <= 1) return
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return
    const id = setInterval(() => setIndex((i) => (i + 1) % ads.length), 5000)
    return () => clearInterval(id)
  }, [paused, ads.length])

  const current = index % ads.length
  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + ads.length) % ads.length)
  const isExternal = (href: string) => /^https?:\/\//i.test(href)

  return (
    <section
      aria-label={t("adLabel")}
      className="relative overflow-hidden rounded-3xl bg-[#003B4A] shadow-md"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Piste qui glisse : chaque annonce occupe 100 % de la largeur */}
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(${isRtl ? "" : "-"}${current * 100}%)` }}
      >
        {ads.map((ad) => {
          const inner = (
            <div className="relative h-44 sm:h-52 lg:h-60 w-full">
              <img src={ad.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r rtl:bg-gradient-to-l from-[#003B4A] via-[#003B4A]/75 to-transparent" />
              <div className="relative z-10 flex h-full max-w-xl flex-col justify-center gap-2 px-6 sm:ps-20 sm:pe-10">
                {ad.title && <h2 className="font-brand text-xl sm:text-3xl leading-tight text-white">{ad.title}</h2>}
                {ad.subtitle && <p className="text-sm sm:text-base text-white/75 line-clamp-2">{ad.subtitle}</p>}
                <span className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-[#00BFA6] px-5 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-black/10">
                  {ad.cta} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </span>
              </div>
            </div>
          )
          return (
            <div key={ad.key} className="w-full shrink-0" aria-hidden={ads[current]?.key !== ad.key}>
              {isExternal(ad.href) ? (
                <a href={ad.href} target="_blank" rel="noopener noreferrer" className="block">{inner}</a>
              ) : (
                <Link href={ad.href as any} className="block">{inner}</Link>
              )}
            </div>
          )
        })}
      </div>

      <span className="absolute top-3 end-3 z-20 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white/80 backdrop-blur-sm">
        {t("adLabel")}
      </span>

      {ads.length > 1 && (
        <>
          <button type="button" onClick={() => go(-1)} aria-label="‹" className="absolute start-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white/80 p-2 text-[#003B4A] transition hover:bg-white sm:block">
            <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
          </button>
          <button type="button" onClick={() => go(1)} aria-label="›" className="absolute end-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white/80 p-2 text-[#003B4A] transition hover:bg-white sm:block">
            <ChevronRight className="h-5 w-5 rtl:rotate-180" />
          </button>
          <div className="absolute bottom-3 start-1/2 z-20 flex -translate-x-1/2 gap-1.5 rtl:translate-x-1/2">
            {ads.map((ad, i) => (
              <button
                key={ad.key}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={String(i + 1)}
                className={cn("h-1.5 rounded-full transition-all", i === current ? "w-6 bg-[#00BFA6]" : "w-1.5 bg-white/50 hover:bg-white/80")}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
