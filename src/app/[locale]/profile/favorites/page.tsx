"use client"

import { useEffect, useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import axios from "axios"
import { Heart, Loader2, Search } from "lucide-react"
import { PropertyCard } from "@/components/PropertyCard"
import { PROPERTY_TYPES, REAL_ESTATE_CATEGORIES } from "@/data/propertyTypes"
import { getCategoryColor } from "@/data/categoryColors"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Même logique que PropertyCard/announces pour retrouver la catégorie d'une annonce à partir de
// son type de bien brut (propertyType) — il n'y a pas de champ "catégorie" stocké directement.
const getCategoryIdForAnnounce = (announce: any): string | undefined => {
  const pType = announce?.property?._displayPropertyType || announce?.property?.propertyType
  const typeObj = PROPERTY_TYPES.find((pt) => pt.id === pType?.toUpperCase() || pt.label === pType)
  return typeObj?.categoryId
}

export default function FavoritesPage() {
  const t = useTranslations("ProfileFavorites")
  const tc = useTranslations("Categories")
  const router = useRouter()
  const [favorites, setFavorites] = useState<any[] | null>(null)
  const [transactionFilter, setTransactionFilter] = useState<"" | "SALE" | "RENTAL">("")
  const [categoryFilter, setCategoryFilter] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { router.push("/auth/login"); return }
    axios.get(`${API_URL}/favorites/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setFavorites(res.data))
      .catch((e) => {
        if (e?.response?.status === 401) { localStorage.removeItem("token"); router.push("/auth/login"); return }
        setFavorites([])
      })
  }, [router])

  // Retire un favori de la liste dès qu'il est retiré (cœur re-cliqué sur la carte), sans re-fetch.
  const handleFavoriteChange = (announceId: number, isFav: boolean) => {
    if (!isFav) setFavorites((prev) => (prev || []).filter((f) => f.announceId !== announceId))
  }

  // Catégories réellement présentes dans les favoris — évite d'afficher des filtres vides.
  const presentCategories = useMemo(() => {
    if (!favorites) return []
    const ids = new Set<string>()
    favorites.forEach((f) => {
      const cat = getCategoryIdForAnnounce(f.announce)
      if (cat) ids.add(cat)
    })
    return REAL_ESTATE_CATEGORIES.filter((c, i, arr) => ids.has(c.id) && arr.findIndex((x) => x.id === c.id) === i)
  }, [favorites])

  const filtered = useMemo(() => {
    if (!favorites) return []
    return favorites.filter((f) => {
      const a = f.announce
      if (!a) return false
      if (transactionFilter && a.type !== transactionFilter) return false
      if (categoryFilter && getCategoryIdForAnnounce(a) !== categoryFilter) return false
      return true
    })
  }, [favorites, transactionFilter, categoryFilter])

  if (favorites === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0094BD]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-transparent py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-2 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Heart className="h-6 w-6 text-[#00BFA6] fill-[#00BFA6]" /> {t("title")}
            </h1>
            <p className="text-gray-500 dark:text-white/60 text-sm mt-0.5">{t("subtitle")}</p>
          </div>
          {favorites.length > 0 && (
            <span className="text-sm font-bold text-gray-500 dark:text-white/50">{t("count", { count: favorites.length })}</span>
          )}
        </div>

        {favorites.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-6 mb-6">
            {([
              ["", t("filterAll")],
              ["SALE", t("filterSale")],
              ["RENTAL", t("filterRental")],
            ] as const).map(([id, label]) => (
              <button
                key={id || "all"}
                onClick={() => setTransactionFilter(id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                  transactionFilter === id
                    ? "bg-[#00BFA6] border-[#00BFA6] text-white"
                    : "bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/60 hover:border-[#00BFA6] hover:text-[#00BFA6]"
                }`}
              >
                {label}
              </button>
            ))}

            {presentCategories.length > 1 && (
              <>
                <span className="w-px h-4 bg-gray-200 dark:bg-white/15 mx-1" />
                {presentCategories.map((cat) => {
                  const active = categoryFilter === cat.id
                  const catColor = getCategoryColor(cat.id)
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryFilter(active ? "" : cat.id)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                        active
                          ? "text-white"
                          : "bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/60 hover:border-current"
                      }`}
                      style={active ? { backgroundColor: catColor.hex, borderColor: catColor.hex } : undefined}
                    >
                      {tc(cat.id)}
                    </button>
                  )
                })}
              </>
            )}
          </div>
        )}

        {favorites.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
            <Heart className="h-10 w-10 mx-auto text-gray-200 dark:text-white/15 mb-4" />
            <p className="text-gray-500 dark:text-white/60 mb-5">{t("noFavorites")}</p>
            <button
              onClick={() => router.push("/announces")}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00BFA6] hover:bg-[#00908A] text-white rounded-xl font-bold text-sm transition-colors"
            >
              <Search className="h-4 w-4" /> {t("browseListings")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((f) => (
              <PropertyCard
                key={f.id}
                announce={f.announce}
                initialFavorite
                onFavoriteChange={(isFav) => handleFavoriteChange(f.announceId, isFav)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
