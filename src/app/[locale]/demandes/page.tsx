"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EntrustedResearchCard } from "@/components/EntrustedResearchCard"

export default function DemandesPage() {
  const t = useTranslations("Demandes")
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const res = await axios.get(`${apiUrl}/entrusted-research`)
        setRequests(res.data)
      } catch (err) {
        console.error("Error fetching entrusted researches:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchRequests()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#022229]">
      <div className="bg-[#003B4A] text-white py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold">{t("title")}</h1>
          <p className="mt-3 text-white/80 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
          <Link href="/research">
            <Button className="mt-6 bg-[#0094BD] hover:bg-[#00B4E5] text-white rounded-full px-6 py-5 font-bold">
              {t("entrustMySearch")}
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="text-center py-12 text-gray-500 dark:text-white/50">{t("loading")}</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16">
            <Search className="h-10 w-10 mx-auto text-gray-300 dark:text-white/20 mb-3" />
            <p className="text-gray-500 dark:text-white/60 font-medium">{t("noResults")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {requests.map((r) => (
              <EntrustedResearchCard key={r.id} research={r} variant="public" />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
