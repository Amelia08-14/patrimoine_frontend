"use client"

import { useEffect, useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { useLocalizedContent } from "@/lib/typeLabels"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export type AdPage = "HOME" | "ANNOUNCES" | "DEMANDES"
export type AdPlacement = "SIDEBAR" | "STRIP" | "BANNER"
export type Ad = { key: string; id?: number; categoryId?: string; categoryLabel?: string; image: string; title: string; subtitle: string; cta: string; href: string }

// Un seul appel réseau par page pour tous ses emplacements (bandeau, colonnes latérales, bandeaux inter-sections).
const adsCache: Partial<Record<AdPage, Promise<any[]>>> = {}
function loadAds(page: AdPage): Promise<any[]> {
  if (!adsCache[page]) {
    adsCache[page] = fetch(`${API_URL}/ads?page=${page}`)
      .then((r) => r.json())
      .then((d) => (Array.isArray(d) ? d : []))
      .catch(() => {
        delete adsCache[page] // on retentera au prochain rendu
        return []
      })
  }
  return adsCache[page]!
}

// Un seul appel pour les slides d'accueil (ancienne source, conservée comme repli).
let slidesPromise: Promise<any[]> | null = null
function loadSlides(): Promise<any[]> {
  if (!slidesPromise) {
    slidesPromise = fetch(`${API_URL}/content/hero-slides`)
      .then((r) => r.json())
      .then((d) => (Array.isArray(d) ? d : []))
      .catch(() => {
        slidesPromise = null
        return []
      })
  }
  return slidesPromise
}

/** Statistiques : une impression par affichage d'une publicité, un clic au clic (sans bloquer la navigation). */
const seenViews = new Set<number>()
export function trackAdView(id?: number) {
  if (!id || seenViews.has(id)) return
  seenViews.add(id)
  fetch(`${API_URL}/ads/${id}/view`, { method: "POST", keepalive: true }).catch(() => {})
}
export function trackAdClick(id?: number) {
  if (!id) return
  fetch(`${API_URL}/ads/${id}/click`, { method: "POST", keepalive: true }).catch(() => {})
}

/**
 * Publicités d'un emplacement du site (filtrables par page, emplacement et catégorie). Source : le module Publicités de l'admin (`/admin/ads` — image, textes
 * en 3 langues, lien, pages et emplacements visés, période, ordre). Tant qu'aucune publicité n'est configurée
 * pour la page, repli sur les slides d'accueil publiés puis sur deux encarts maison (déposer / boutique), pour
 * que les emplacements ne restent jamais vides.
 */
export function useAds(page: AdPage = "ANNOUNCES", placement?: AdPlacement, categoryId?: string): Ad[] {
  const category = categoryId === "HEBERGEMENT" ? "HOTELIER" : categoryId // même libellé / même couleur
  const t = useTranslations("AnnouncesPage")
  const tc = useTranslations("Categories")
  const lc = useLocalizedContent()
  const [managed, setManaged] = useState<any[] | null>(null)
  const [slides, setSlides] = useState<any[]>([])

  useEffect(() => {
    let alive = true
    loadAds(page).then((d) => { if (alive) setManaged(d) })
    loadSlides().then((d) => { if (alive) setSlides(d) })
    return () => { alive = false }
  }, [page])

  return useMemo(() => {
    const has = (csv: string, v?: string) => !v || String(csv || "").split(",").map((x) => x.trim()).includes(v)
    const fromAdmin: Ad[] = (managed || [])
      .filter((a) => a?.imageUrl && has(a.placements, placement))
      // Catégorie : sans catégorie choisie sur la page, toutes les publicités tournent ; avec une catégorie,
      // seules celles qui la ciblent (ou qui n'en ciblent aucune) restent, les ciblées passant en premier.
      .filter((a) => {
        const cats = String(a.categories || "").split(",").map((x: string) => x.trim()).filter(Boolean)
        return !category || cats.length === 0 || cats.includes(category)
      })
      .sort((a, b) => {
        const t = (x: any) => (category && String(x.categories || "").split(",").includes(category) ? 0 : 1)
        return t(a) - t(b)
      })
      .map((a) => ({
        key: `ad-${a.id}`,
        id: a.id,
        // Étiquette de catégorie affichée sur la publicité (la 1re catégorie ciblée)
        categoryId: String(a.categories || "").split(",").map((x: string) => x.trim()).filter(Boolean)[0],
        categoryLabel: (() => { const c = String(a.categories || "").split(",").map((x: string) => x.trim()).filter(Boolean)[0]; return c && tc.has(c) ? tc(c) : "" })(),
        image: `${API_URL}${a.imageUrl}`,
        title: lc(a.title, a.titleAr, a.titleEn),
        subtitle: lc(a.subtitle, a.subtitleAr, a.subtitleEn),
        cta: lc(a.buttonLabel, a.buttonLabelAr, a.buttonLabelEn),
        href: a.link || "/announces",
      }))
    if (fromAdmin.length > 0) return fromAdmin
    if (managed === null) return [] // pas encore chargé : évite d'afficher un instant les encarts de repli
    const fromSlides = slides
      .filter((s) => s?.imageUrl)
      .map((s) => ({
        key: `slide-${s.id}`,
        image: `${API_URL}${s.imageUrl}`,
        title: lc(s.title, s.titleAr, s.titleEn),
        subtitle: lc(s.subtitle, s.subtitleAr, s.subtitleEn),
        cta: lc(s.buttonLabel, s.buttonLabelAr, s.buttonLabelEn) || t("adCta"),
        href: s.link || "/announces",
      }))
    if (fromSlides.length > 0) return fromSlides
    return [
      { key: "deposit", image: "/points-bg.jpg", title: t("adDepositTitle"), subtitle: t("adDepositText"), cta: t("adDepositCta"), href: "/deposit" },
      { key: "boutique", image: "/boutique-bg.jpg", title: t("adBoutiqueTitle"), subtitle: t("adBoutiqueText"), cta: t("adBoutiqueCta"), href: "/profile/boutique" },
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [managed, slides, placement, category, lc, tc])
}
