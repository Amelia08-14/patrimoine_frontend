"use client"

import { useEffect, useState, useMemo } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Search, Plus, HelpCircle, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function FAQPage() {
  const t = useTranslations("FAQ")
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [openId, setOpenId] = useState<number | null>(null)

  useEffect(() => {
    fetch(`${API_URL}/content/faq`)
      .then((r) => r.json())
      .then((data) => {
        setItems(data)
        if (data.length > 0) setOpenId(data[0].id)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q))
  }, [items, query])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-[#003B4A] relative overflow-hidden">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#00BFA6]/10 blur-3xl" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 text-center relative z-10">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-[#00BFA6]/15 mb-5">
            <HelpCircle className="h-6 w-6 text-[#5EEAD4]" />
          </div>
          <h1 className="font-brand text-3xl md:text-4xl text-white">{t("title")}</h1>
          <p className="mt-3 text-white/70 max-w-xl mx-auto">{t("subtitle")}</p>
        </div>
      </div>

      {/* Barre de recherche — chevauche le hero */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 -mt-9 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl shadow-black/10 border border-gray-100 flex items-center gap-3 px-5 py-4">
          <Search className="h-4 w-4 text-gray-400 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full outline-none text-sm text-gray-800 placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <p className="text-center text-gray-400">{t("loading")}</p>
        ) : items.length === 0 ? (
          <p className="text-center text-gray-400">{t("noItems")}</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-400">{t("noResults")}</p>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm divide-y divide-gray-100 overflow-hidden">
            {filtered.map((f) => {
              const isOpen = openId === f.id
              return (
                <div key={f.id}>
                  <button
                    onClick={() => setOpenId(isOpen ? null : f.id)}
                    className="w-full flex items-center justify-between gap-4 text-left px-5 sm:px-7 py-5 hover:bg-gray-50/70 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span className={cn("font-bold text-[15px] transition-colors", isOpen ? "text-[#00BFA6]" : "text-gray-900")}>
                      {f.question}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 h-7 w-7 rounded-full flex items-center justify-center border transition-all duration-300",
                        isOpen ? "bg-[#00BFA6] border-[#00BFA6] rotate-45" : "bg-white border-gray-200 text-gray-400"
                      )}
                    >
                      <Plus className={cn("h-3.5 w-3.5", isOpen && "text-white")} />
                    </span>
                  </button>
                  <div
                    className="grid transition-all duration-300 ease-out"
                    style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 sm:px-7 pb-6 text-gray-600 whitespace-pre-line leading-relaxed text-sm">
                        {f.answer}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-dashed border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-gray-400 shrink-0" /> {t("stillNeedHelp")}
            </p>
            <Link href="/contact" className="shrink-0 text-sm font-bold text-[#00BFA6] hover:underline">
              {t("contactSupport")} →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
