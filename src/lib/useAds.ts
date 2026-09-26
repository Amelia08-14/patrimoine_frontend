"use client"

import { useEffect, useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { useLocalizedContent } from "@/lib/typeLabels"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export type Ad = { key: string; image: string; title: string; subtitle: string; cta: string; href: string }

// Un seul appel réseau pour tous les emplacements publicitaires de la page (bandeau + colonnes latérales).
let slidesPromise: Promise<any[]> | null = null
function loadSlides(): Promise<any[]> {
  if (!slidesPromise) {
    slidesPromise = fetch(`${API_URL}/content/hero-slides`)
      .then((r) => r.json())
      .then((d) => (Array.isArray(d) ? d : []))
      .catch(() => {
        slidesPromise = null // on retentera au prochain rendu
        return []
      })
  }
  return slidesPromise
}

/**
 * Publicités affichables dans les emplacements du site (bandeau du haut et colonnes latérales de `/announces`).
 *
 * Source : les visuels gérés dans l'admin (Contenu du site > Slides d'accueil — titre / sous-titre / bouton /
 * lien en 3 langues). Il n'existe pas encore de module de publicité dédié : tant que ce n'est pas le cas, les
 * slides publiés servent d'annonces publicitaires, et à défaut deux encarts maison (déposer une annonce /
 * boutique). Tous les emplacements lisent cette même liste.
 */
export function useAds(): Ad[] {
  const t = useTranslations("AnnouncesPage")
  const lc = useLocalizedContent()
  const [slides, setSlides] = useState<any[]>([])

  useEffect(() => {
    let alive = true
    loadSlides().then((d) => { if (alive) setSlides(d) })
    return () => { alive = false }
  }, [])

  return useMemo(() => {
    const fromAdmin = slides
      .filter((s) => s?.imageUrl)
      .map((s) => ({
        key: `slide-${s.id}`,
        image: `${API_URL}${s.imageUrl}`,
        title: lc(s.title, s.titleAr, s.titleEn),
        subtitle: lc(s.subtitle, s.subtitleAr, s.subtitleEn),
        cta: lc(s.buttonLabel, s.buttonLabelAr, s.buttonLabelEn) || t("adCta"),
        href: s.link || "/announces",
      }))
    if (fromAdmin.length > 0) return fromAdmin
    return [
      { key: "deposit", image: "/points-bg.jpg", title: t("adDepositTitle"), subtitle: t("adDepositText"), cta: t("adDepositCta"), href: "/deposit" },
      { key: "boutique", image: "/boutique-bg.jpg", title: t("adBoutiqueTitle"), subtitle: t("adBoutiqueText"), cta: t("adBoutiqueCta"), href: "/profile/boutique" },
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides, lc])
}
