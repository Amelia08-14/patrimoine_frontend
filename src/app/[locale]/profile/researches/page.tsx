"use client"

import { useEffect, useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import axios from "axios"
import { Search, Loader2, Handshake } from "lucide-react"
import { EntrustedResearchCard } from "@/components/EntrustedResearchCard"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export default function ResearchesPage() {
  const t = useTranslations("ProfileResearches")
  const router = useRouter()
  const [researches, setResearches] = useState<any[] | null>(null)
  const [transactionFilter, setTransactionFilter] = useState<"" | "SALE" | "RENTAL">("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { router.push("/auth/login"); return }
    axios.get(`${API_URL}/entrusted-research/mine`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setResearches(res.data))
      .catch((e) => {
        if (e?.response?.status === 401) { localStorage.removeItem("token"); router.push("/auth/login"); return }
        setResearches([])
      })
  }, [router])

  const filtered = useMemo(() => {
    if (!researches) return []
    if (!transactionFilter) return researches
    return researches.filter((r) => r.transaction === transactionFilter)
  }, [researches, transactionFilter])

  if (researches === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0094BD]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-transparent py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-2 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Handshake className="h-6 w-6 text-[#0094BD]" /> {t("title")}
            </h1>
            <p className="text-gray-500 dark:text-white/60 text-sm mt-0.5">{t("subtitle")}</p>
          </div>
          {researches.length > 0 && (
            <span className="text-sm font-bold text-gray-500 dark:text-white/50">{t("count", { count: researches.length })}</span>
          )}
        </div>

        {researches.length > 0 && (
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
                    ? "bg-[#0094BD] border-[#0094BD] text-white"
                    : "bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/60 hover:border-[#0094BD] hover:text-[#0094BD]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {researches.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
            <Search className="h-10 w-10 mx-auto text-gray-200 dark:text-white/15 mb-4" />
            <p className="text-gray-500 dark:text-white/60 mb-5">{t("noResearches")}</p>
            <button
              onClick={() => router.push("/research")}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0094BD] hover:bg-[#003B4A] text-white rounded-xl font-bold text-sm transition-colors"
            >
              <Handshake className="h-4 w-4" /> {t("entrustNew")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((r) => (
              <EntrustedResearchCard key={r.id} research={r} variant="mine" />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
