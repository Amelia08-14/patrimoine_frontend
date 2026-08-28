"use client"

import { useEffect, useState, useMemo, useRef } from "react"
import { useTranslations } from "next-intl"
import { Handshake, Mail, Building, Hotel, PartyPopper, Warehouse, ImageOff, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react"
import { subCategoriesForPole, type ActivityPole } from "@/data/activityPoles"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const CATEGORIES: { id: ActivityPole; label: string; icon: typeof Building }[] = [
  { id: 'IMMOBILIER', label: 'Activité immobilière', icon: Building },
  { id: 'HOTELLERIE', label: 'Activité hôtelière et hébergement', icon: Hotel },
  { id: 'EVENEMENTIEL', label: 'Activité évènementiel', icon: PartyPopper },
  { id: 'ENTREPOSAGE', label: "Activité d'entreposage et stockage", icon: Warehouse },
]

function PartnerCard({ partner }: { partner: any }) {
  const card = (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center gap-3 h-full hover:shadow-lg hover:border-[#00BFA6]/30 hover:-translate-y-0.5 transition-all">
      <div className="h-16 w-16 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
        {partner.logoUrl ? (
          <img src={`${API_URL}${partner.logoUrl}`} alt={partner.name} className="h-full w-full object-contain p-1.5" />
        ) : (
          <ImageOff className="h-5 w-5 text-gray-300" />
        )}
      </div>
      <p className="font-bold text-gray-900 text-sm text-center leading-tight">{partner.name}</p>
      {partner.websiteUrl && (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#00BFA6] opacity-0 group-hover:opacity-100 transition-opacity">
          Visiter le site <ExternalLink className="h-3 w-3" />
        </span>
      )}
    </div>
  )
  return partner.websiteUrl ? (
    <a href={partner.websiteUrl} target="_blank" rel="noopener noreferrer">{card}</a>
  ) : (
    <div>{card}</div>
  )
}

// Défilement horizontal des partenaires d'une (sous-)catégorie — flèches visibles
// uniquement quand il y a réellement de quoi défiler dans ce sens.
function PartnerCarousel({ partners }: { partners: any[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const updateArrows = () => {
    const el = scrollerRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 4)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    updateArrows()
    const el = scrollerRef.current
    if (!el) return
    el.addEventListener('scroll', updateArrows)
    window.addEventListener('resize', updateArrows)
    return () => { el.removeEventListener('scroll', updateArrows); window.removeEventListener('resize', updateArrows) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partners.length])

  const scroll = (dir: -1 | 1) => scrollerRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' })

  return (
    <div className="relative">
      {canLeft && (
        <button
          onClick={() => scroll(-1)}
          aria-label="Précédent"
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#00BFA6] hover:border-[#00BFA6] transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}
      <div
        ref={scrollerRef}
        className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {partners.map((p) => (
          <div key={p.id} className="snap-start shrink-0 w-[150px] sm:w-[170px]">
            <PartnerCard partner={p} />
          </div>
        ))}
      </div>
      {canRight && (
        <button
          onClick={() => scroll(1)}
          aria-label="Suivant"
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#00BFA6] hover:border-[#00BFA6] transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export default function PartenairesPage() {
  const t = useTranslations("Partners")
  const [partners, setPartners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | ActivityPole>("ALL")
  const [subCategoryFilter, setSubCategoryFilter] = useState<string>("ALL")

  useEffect(() => {
    fetch(`${API_URL}/content/partners`)
      .then((r) => r.json())
      .then(setPartners)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const availableCategories = useMemo(
    () => CATEGORIES.filter((c) => partners.some((p) => p.category === c.id)),
    [partners]
  )

  const selectCategory = (id: "ALL" | ActivityPole) => {
    setCategoryFilter(id)
    setSubCategoryFilter("ALL")
  }

  // Classement catégorie → sous-catégorie, dans l'ordre métier fixe (pas l'ordre d'insertion),
  // affiné par la sous-catégorie sélectionnée le cas échéant.
  const sections = useMemo(() => {
    const cats = categoryFilter === "ALL" ? CATEGORIES : CATEGORIES.filter((c) => c.id === categoryFilter)
    const refiningBySub = categoryFilter !== "ALL" && subCategoryFilter !== "ALL"
    return cats
      .map((cat) => {
        const catPartners = partners.filter((p) => p.category === cat.id)
        const subDefs = refiningBySub
          ? subCategoriesForPole(cat.id).filter((s) => s.id === subCategoryFilter)
          : subCategoriesForPole(cat.id)
        const subGroups = subDefs
          .map((sub) => ({ sub, partners: catPartners.filter((p) => p.subCategory === sub.id) }))
          .filter((g) => g.partners.length > 0)
        const unclassified = refiningBySub ? [] : catPartners.filter((p) => !p.subCategory)
        const total = subGroups.reduce((sum, g) => sum + g.partners.length, 0) + unclassified.length
        return { cat, subGroups, unclassified, total }
      })
      .filter((s) => s.total > 0)
  }, [partners, categoryFilter, subCategoryFilter])

  const uncategorized = useMemo(() => partners.filter((p) => !p.category), [partners])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative bg-[#003B4A] text-white py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none" aria-hidden>
          <Handshake className="absolute -right-10 -top-10 h-72 w-72 text-[#00BFA6]" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-[#00BFA6]/15 mb-5">
            <Handshake className="h-7 w-7 text-[#00BFA6]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold">{t("title")}</h1>
          <p className="mt-3 text-white/70 max-w-2xl mx-auto leading-relaxed">
            {t("intro")}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {loading ? (
          <div className="text-center py-20 text-gray-400">Chargement des partenaires...</div>
        ) : partners.length === 0 ? (
          <div className="text-center py-20 text-gray-400">Aucun partenaire à afficher pour le moment.</div>
        ) : (
          <>
            {/* Filtre par catégorie */}
            {availableCategories.length > 1 && (
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                <button
                  onClick={() => selectCategory("ALL")}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${categoryFilter === "ALL" ? 'bg-[#00BFA6] text-white shadow-md shadow-[#00BFA6]/20' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#00BFA6] hover:text-[#00BFA6]'}`}
                >
                  Tous les partenaires
                </button>
                {availableCategories.map((c) => {
                  const Icon = c.icon
                  return (
                    <button
                      key={c.id}
                      onClick={() => selectCategory(c.id)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all ${categoryFilter === c.id ? 'bg-[#00BFA6] text-white shadow-md shadow-[#00BFA6]/20' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#00BFA6] hover:text-[#00BFA6]'}`}
                    >
                      <Icon className="h-3.5 w-3.5" /> {c.label}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Sous-catégories de la catégorie sélectionnée, pour affiner */}
            {categoryFilter !== "ALL" && (
              <div className="flex flex-wrap justify-center gap-2 mb-14">
                <button
                  onClick={() => setSubCategoryFilter("ALL")}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${subCategoryFilter === "ALL" ? 'bg-[#003B4A] text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-[#003B4A] hover:text-[#003B4A]'}`}
                >
                  Toutes sous-catégories
                </button>
                {subCategoriesForPole(categoryFilter).map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setSubCategoryFilter(sub.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${subCategoryFilter === sub.id ? 'bg-[#003B4A] text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-[#003B4A] hover:text-[#003B4A]'}`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            )}
            {categoryFilter === "ALL" && <div className="mb-10" />}

            {/* Sections par catégorie, sous-groupées par sous-catégorie, en carrousel */}
            <div className="space-y-16">
              {sections.map(({ cat, subGroups, unclassified, total }) => {
                const Icon = cat.icon
                return (
                  <section key={cat.id}>
                    <div className="flex items-center gap-3 mb-8">
                      <div className="h-11 w-11 rounded-xl bg-[#00BFA6]/10 flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-[#00BFA6]" />
                      </div>
                      <div>
                        <h2 className="text-xl font-extrabold text-[#003B4A]">{cat.label}</h2>
                        <p className="text-xs text-gray-400">{total} partenaire{total > 1 ? 's' : ''}</p>
                      </div>
                    </div>

                    <div className="space-y-10 px-1">
                      {subGroups.map(({ sub, partners: subPartners }) => (
                        <div key={sub.id}>
                          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4 pb-2 border-b border-gray-200">
                            {sub.label}
                          </h3>
                          <PartnerCarousel partners={subPartners} />
                        </div>
                      ))}

                      {unclassified.length > 0 && (
                        <div>
                          {subGroups.length > 0 && (
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4 pb-2 border-b border-gray-200">
                              Autres
                            </h3>
                          )}
                          <PartnerCarousel partners={unclassified} />
                        </div>
                      )}
                    </div>
                  </section>
                )
              })}

              {categoryFilter === "ALL" && uncategorized.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="h-11 w-11 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                      <Handshake className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold text-[#003B4A]">Autres partenaires</h2>
                      <p className="text-xs text-gray-400">{uncategorized.length} partenaire{uncategorized.length > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="px-1">
                    <PartnerCarousel partners={uncategorized} />
                  </div>
                </section>
              )}
            </div>
          </>
        )}
      </div>

      <div className="bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-bold text-[#003B4A] mb-3">{t("becomePartnerTitle")}</h2>
          <p className="text-gray-500 mb-6 max-w-xl mx-auto">
            {t("becomePartnerText")}
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 bg-[#00BFA6] hover:bg-[#00908A] text-white rounded-full px-6 py-3 font-bold shadow-lg shadow-[#00BFA6]/20 transition-colors"
          >
            <Mail className="h-4 w-4" />
            {t("contactUs")}
          </a>
        </div>
      </div>
    </div>
  )
}
