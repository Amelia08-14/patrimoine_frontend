"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { RefreshCw, Star, MousePointerClick, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PROPERTY_TYPES, REAL_ESTATE_CATEGORIES } from "@/data/propertyTypes"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface FeaturedAnnounce {
  id: number
  reference: string
  title: string | null
  status: string
  nbViews: number
  nbCalls: number
  featuredFrom: string | null
  featuredUntil: string | null
  property: { propertyType: string | null } | null
}

function categoryLabelForPropertyType(propertyType: string | null) {
  if (!propertyType) return "Non catégorisé"
  const pType = PROPERTY_TYPES.find((p) => p.id === propertyType)
  const cat = pType ? REAL_ESTATE_CATEGORIES.find((c) => c.id === pType.categoryId) : null
  return cat?.label || "Non catégorisé"
}

export default function AdminKpisPage() {
  const [items, setItems] = useState<FeaturedAnnounce[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState("ALL")

  const load = useCallback(async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const res = await fetch(`${API_URL}/admin/announces/featured-kpis`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      if (res.ok) setItems(await res.json())
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, 20000)
    return () => clearInterval(interval)
  }, [load])

  const byCategory = useMemo(() => {
    const map = new Map<string, { count: number; clicks: number; calls: number }>()
    for (const item of items) {
      const label = categoryLabelForPropertyType(item.property?.propertyType || null)
      const entry = map.get(label) || { count: 0, clicks: 0, calls: 0 }
      entry.count += 1
      entry.clicks += item.nbViews
      entry.calls += item.nbCalls
      map.set(label, entry)
    }
    return Array.from(map.entries()).map(([category, stats]) => ({ category, ...stats }))
  }, [items])

  const isActive = (a: FeaturedAnnounce) => a.featuredUntil && new Date(a.featuredUntil) > new Date()

  const filteredItems = categoryFilter === "ALL"
    ? items
    : items.filter((item) => categoryLabelForPropertyType(item.property?.propertyType || null) === categoryFilter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">KPI — Annonces "Première Page"</h1>
          <p className="text-gray-500">Historique et performances des annonces mises en avant.</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} title="Actualiser">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Tableau historique par catégorie */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 font-bold text-sm text-gray-700">Historique par catégorie</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-900">Catégorie</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Total Annonces Mises en Avant</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Clics Totaux</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Appels Totaux</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-500">Chargement...</td></tr>
              ) : byCategory.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-500">Aucune annonce mise en avant pour le moment.</td></tr>
              ) : (
                byCategory.map((c) => (
                  <tr key={c.category}>
                    <td className="px-4 py-3 font-medium text-gray-900">{c.category}</td>
                    <td className="px-4 py-3">{c.count}</td>
                    <td className="px-4 py-3">{c.clicks.toLocaleString()}</td>
                    <td className="px-4 py-3">{c.calls.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suivi des performances par annonce */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
          <span className="font-bold text-sm text-gray-700">Suivi des performances par annonce</span>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="text-xs font-medium border border-gray-200 rounded-lg px-2 py-1.5 bg-white outline-none">
            <option value="ALL">Toutes catégories</option>
            {byCategory.map((c) => <option key={c.category} value={c.category}>{c.category}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-900">ID / Titre</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Catégorie</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Clics</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Appels</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Période de mise en avant</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-500">Chargement...</td></tr>
              ) : filteredItems.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-500">Aucune annonce mise en avant pour le moment.</td></tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{item.title || `Annonce #${item.id}`}</div>
                      <div className="text-xs text-gray-500">ID #{item.id} — Réf. {item.reference}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{categoryLabelForPropertyType(item.property?.propertyType || null)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-gray-700"><MousePointerClick className="h-3.5 w-3.5 text-gray-400" /> {item.nbViews.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-gray-700"><Phone className="h-3.5 w-3.5 text-gray-400" /> {item.nbCalls.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                      {item.featuredFrom ? new Date(item.featuredFrom).toLocaleDateString() : '—'}
                      {' → '}
                      {item.featuredUntil ? new Date(item.featuredUntil).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {isActive(item) ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Expirée</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
