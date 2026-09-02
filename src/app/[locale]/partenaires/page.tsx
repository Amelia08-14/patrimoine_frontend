"use client"

import { useEffect, useState, useMemo, useRef } from "react"
import { useTranslations } from "next-intl"
import { Handshake, Building, Hotel, PartyPopper, Warehouse, ImageOff, ExternalLink, ChevronLeft, ChevronRight, Send, Loader2, CheckCircle2, Upload, ArrowRight } from "lucide-react"
import { subCategoriesForPole, type ActivityPole } from "@/data/activityPoles"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const CATEGORIES: { id: ActivityPole; label: string; icon: typeof Building }[] = [
  { id: 'IMMOBILIER', label: 'Activité immobilière', icon: Building },
  { id: 'HOTELLERIE', label: 'Activité hôtelière et hébergement', icon: Hotel },
  { id: 'EVENEMENTIEL', label: 'Activité évènementiel', icon: PartyPopper },
  { id: 'ENTREPOSAGE', label: "Activité d'entreposage et stockage", icon: Warehouse },
]

function getTranslatedCategories(t: ReturnType<typeof useTranslations>) {
  return [
    { id: 'IMMOBILIER', label: t('activityImmobilier'), icon: Building },
    { id: 'HOTELLERIE', label: t('activityHotellerie'), icon: Hotel },
    { id: 'EVENEMENTIEL', label: t('activityEvenementiel'), icon: PartyPopper },
    { id: 'ENTREPOSAGE', label: t('activityEntreposage'), icon: Warehouse },
  ] as const
}

function PartnerCard({ partner }: { partner: any }) {
  const t = useTranslations('Partners')
  const card = (
    <div className="group bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm p-5 flex flex-col items-center gap-3 h-full hover:shadow-lg hover:border-[#00BFA6]/30 hover:-translate-y-0.5 transition-all">
      <div className="h-16 w-16 rounded-xl bg-gray-50 dark:bg-transparent flex items-center justify-center overflow-hidden shrink-0">
        {partner.logoUrl ? (
          <img src={`${API_URL}${partner.logoUrl}`} alt={partner.name} className="h-full w-full object-contain p-1.5" />
        ) : (
          <ImageOff className="h-5 w-5 text-gray-300 dark:text-white/30" />
        )}
      </div>
      <p className="font-bold text-gray-900 dark:text-white text-sm text-center leading-tight">{partner.name}</p>
      {partner.websiteUrl && (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#00BFA6] opacity-0 group-hover:opacity-100 transition-opacity">
          {t('visitWebsite')} <ExternalLink className="h-3 w-3" />
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
  const t = useTranslations('Partners')
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
          aria-label={t('previous')}
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-white dark:bg-white/5 shadow-md border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-white/50 hover:text-[#00BFA6] hover:border-[#00BFA6] transition-colors"
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
          aria-label={t('next')}
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-white dark:bg-white/5 shadow-md border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-white/50 hover:text-[#00BFA6] hover:border-[#00BFA6] transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

// Formulaire "Devenir partenaire" — envoie une vraie candidature étudiée et validée depuis le dashboard admin.
function PartnerApplicationForm() {
  const t = useTranslations("Partners")
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [companyName, setCompanyName] = useState("")
  const [contactName, setContactName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [category, setCategory] = useState<ActivityPole | "">("")
  const [subCategory, setSubCategory] = useState("")
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [message, setMessage] = useState("")
  const [logo, setLogo] = useState<File | null>(null)

  const partnerCategories = getTranslatedCategories(t)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("submitting")
    try {
      const fd = new FormData()
      fd.append("companyName", companyName)
      fd.append("contactName", contactName)
      fd.append("email", email)
      fd.append("phone", phone)
      if (category) fd.append("category", category)
      if (subCategory) fd.append("subCategory", subCategory)
      if (websiteUrl) fd.append("websiteUrl", websiteUrl)
      if (message) fd.append("message", message)
      if (logo) fd.append("logo", logo)

      const res = await fetch(`${API_URL}/content/partner-applications`, { method: "POST", body: fd })
      if (!res.ok) throw new Error("failed")
      setStatus("success")
    } catch {
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <div className="text-center py-10">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-[#00BFA6]/10 mb-5">
          <CheckCircle2 className="h-7 w-7 text-[#00BFA6]" />
        </div>
        <h3 className="text-xl font-bold text-[#003B4A] mb-2">{t("formSuccessTitle")}</h3>
        <p className="text-gray-500 dark:text-white/50 max-w-md mx-auto">{t("formSuccessText")}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
      <div>
        <label className="block text-xs font-bold text-gray-600 dark:text-white/60 mb-1.5">{t("formCompanyName")}</label>
        <input required value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full rounded-xl border border-gray-200 dark:border-white/10 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00BFA6]/30 focus:border-[#00BFA6]" />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-600 dark:text-white/60 mb-1.5">{t("formContactName")}</label>
        <input required value={contactName} onChange={(e) => setContactName(e.target.value)} className="w-full rounded-xl border border-gray-200 dark:border-white/10 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00BFA6]/30 focus:border-[#00BFA6]" />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-600 dark:text-white/60 mb-1.5">{t("formEmail")}</label>
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-gray-200 dark:border-white/10 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00BFA6]/30 focus:border-[#00BFA6]" />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-600 dark:text-white/60 mb-1.5">{t("formPhone")}</label>
        <input required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-xl border border-gray-200 dark:border-white/10 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00BFA6]/30 focus:border-[#00BFA6]" />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-600 dark:text-white/60 mb-1.5">{t("formCategory")}</label>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value as ActivityPole | ""); setSubCategory("") }}
          className="w-full rounded-xl border border-gray-200 dark:border-white/10 px-3.5 py-2.5 text-sm bg-white dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[#00BFA6]/30 focus:border-[#00BFA6]"
        >
          <option value="">{t("formCategoryPlaceholder")}</option>
          {partnerCategories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-600 dark:text-white/60 mb-1.5">{t("formSubCategory")}</label>
        <select
          value={subCategory}
          onChange={(e) => setSubCategory(e.target.value)}
          disabled={!category}
          className="w-full rounded-xl border border-gray-200 dark:border-white/10 px-3.5 py-2.5 text-sm bg-white dark:bg-white/5 disabled:bg-gray-50 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00BFA6]/30 focus:border-[#00BFA6]"
        >
          <option value="">{t("formSubCategoryPlaceholder")}</option>
          {category && subCategoriesForPole(category).map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-600 dark:text-white/60 mb-1.5">{t("formWebsite")}</label>
        <input type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://" className="w-full rounded-xl border border-gray-200 dark:border-white/10 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00BFA6]/30 focus:border-[#00BFA6]" />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-600 dark:text-white/60 mb-1.5">{t("formLogo")}</label>
        <label className="flex items-center gap-2 w-full rounded-xl border border-dashed border-gray-300 dark:border-white/15 px-3.5 py-2.5 text-sm text-gray-500 dark:text-white/50 cursor-pointer hover:border-[#00BFA6] hover:text-[#00BFA6] transition-colors">
          <Upload className="h-4 w-4 shrink-0" />
          <span className="truncate">{logo ? logo.name : t("formLogo")}</span>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setLogo(e.target.files?.[0] || null)} />
        </label>
      </div>
      <div className="sm:col-span-2">
        <label className="block text-xs font-bold text-gray-600 dark:text-white/60 mb-1.5">{t("formMessage")}</label>
        <textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} className="w-full rounded-xl border border-gray-200 dark:border-white/10 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00BFA6]/30 focus:border-[#00BFA6]" />
      </div>
      <div className="sm:col-span-2 flex flex-col items-center gap-3 pt-2">
        {status === "error" && <p className="text-sm text-red-500 font-semibold">{t("formErrorText")}</p>}
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex items-center gap-2 bg-[#00BFA6] hover:bg-[#00908A] disabled:opacity-60 text-white rounded-full px-7 py-3 font-bold shadow-lg shadow-[#00BFA6]/20 transition-colors"
        >
          {status === "submitting" ? <><Loader2 className="h-4 w-4 animate-spin" /> {t("formSubmitting")}</> : <><Send className="h-4 w-4" /> {t("formSubmit")}</>}
        </button>
      </div>
    </form>
  )
}

export default function PartenairesPage() {
  const t = useTranslations("Partners")
  const partnerCategories = useMemo(() => getTranslatedCategories(t), [t])
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
    () => partnerCategories.filter((c) => partners.some((p) => p.category === c.id)),
    [partnerCategories, partners]
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
    <div className="min-h-screen bg-gray-50 dark:bg-transparent">
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
          <a
            href="#devenir-partenaire"
            onClick={(e) => { e.preventDefault(); document.getElementById("devenir-partenaire")?.scrollIntoView({ behavior: "smooth", block: "start" }) }}
            className="mt-7 inline-flex items-center gap-2 bg-[#00BFA6] hover:bg-[#00908A] text-white rounded-full px-6 py-3 font-bold shadow-lg shadow-[#00BFA6]/20 transition-colors"
          >
            {t("becomePartnerCta")} <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {loading ? (
          <div className="text-center py-20 text-gray-400 dark:text-white/40">{t('loadingPartners')}</div>
        ) : partners.length === 0 ? (
          <div className="text-center py-20 text-gray-400 dark:text-white/40">{t('noPartners')}</div>
        ) : (
          <>
            {/* Filtre par catégorie */}
            {availableCategories.length > 1 && (
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                <button
                  onClick={() => selectCategory("ALL")}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${categoryFilter === "ALL" ? 'bg-[#00BFA6] text-white shadow-md shadow-[#00BFA6]/20' : 'bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/60 hover:border-[#00BFA6] hover:text-[#00BFA6]'}`}
                >
                  {t('allPartners')}
                </button>
                {availableCategories.map((c) => {
                  const Icon = c.icon
                  return (
                    <button
                      key={c.id}
                      onClick={() => selectCategory(c.id)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all ${categoryFilter === c.id ? 'bg-[#00BFA6] text-white shadow-md shadow-[#00BFA6]/20' : 'bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/60 hover:border-[#00BFA6] hover:text-[#00BFA6]'}`}
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
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${subCategoryFilter === "ALL" ? 'bg-[#003B4A] text-white' : 'bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/50 hover:border-[#003B4A] hover:text-[#003B4A]'}`}
                >
                  Toutes sous-catégories
                </button>
                {subCategoriesForPole(categoryFilter).map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setSubCategoryFilter(sub.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${subCategoryFilter === sub.id ? 'bg-[#003B4A] text-white' : 'bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/50 hover:border-[#003B4A] hover:text-[#003B4A]'}`}
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
                        <p className="text-xs text-gray-400 dark:text-white/40">{total} partenaire{total > 1 ? 's' : ''}</p>
                      </div>
                    </div>

                    <div className="space-y-10 px-1">
                      {subGroups.map(({ sub, partners: subPartners }) => (
                        <div key={sub.id}>
                          <h3 className="text-sm font-bold text-gray-500 dark:text-white/50 uppercase tracking-wide mb-4 pb-2 border-b border-gray-200 dark:border-white/10">
                            {sub.label}
                          </h3>
                          <PartnerCarousel partners={subPartners} />
                        </div>
                      ))}

                      {unclassified.length > 0 && (
                        <div>
                          {subGroups.length > 0 && (
                            <h3 className="text-sm font-bold text-gray-500 dark:text-white/50 uppercase tracking-wide mb-4 pb-2 border-b border-gray-200 dark:border-white/10">
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
                    <div className="h-11 w-11 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center shrink-0">
                      <Handshake className="h-5 w-5 text-gray-400 dark:text-white/40" />
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold text-[#003B4A]">Autres partenaires</h2>
                      <p className="text-xs text-gray-400 dark:text-white/40">{uncategorized.length} partenaire{uncategorized.length > 1 ? 's' : ''}</p>
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

      <div id="devenir-partenaire" className="bg-white dark:bg-white/5 border-t border-gray-100 dark:border-white/10 scroll-mt-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-[#00BFA6]/10 mb-5">
              <Handshake className="h-6 w-6 text-[#00BFA6]" />
            </div>
            <h2 className="text-2xl font-bold text-[#003B4A] mb-3">{t("becomePartnerTitle")}</h2>
            <p className="text-gray-500 dark:text-white/50 max-w-xl mx-auto">
              {t("becomePartnerText")}
            </p>
          </div>
          <PartnerApplicationForm />
        </div>
      </div>
    </div>
  )
}
