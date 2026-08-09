"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Handshake, Mail } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function PartenairesPage() {
  const t = useTranslations("Partners")
  const [partners, setPartners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/content/partners`)
      .then((r) => r.json())
      .then(setPartners)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#003B4A] text-white py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Handshake className="h-10 w-10 mx-auto mb-4 text-[#00BFA6]" />
          <h1 className="text-3xl md:text-4xl font-extrabold">{t("title")}</h1>
          <p className="mt-3 text-white/80 max-w-2xl mx-auto">
            {t("intro")}
          </p>
        </div>
      </div>

      {!loading && partners.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {partners.map((p) => {
              const card = (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center gap-3 h-full hover:shadow-md transition-shadow">
                  <div className="h-16 w-16 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden">
                    {p.logoUrl ? (
                      <img src={`${API_URL}${p.logoUrl}`} alt={p.name} className="h-full w-full object-contain" />
                    ) : (
                      <Handshake className="h-6 w-6 text-gray-300" />
                    )}
                  </div>
                  <p className="font-bold text-gray-900 text-sm text-center">{p.name}</p>
                </div>
              )
              return p.websiteUrl ? (
                <a key={p.id} href={p.websiteUrl} target="_blank" rel="noopener noreferrer">{card}</a>
              ) : (
                <div key={p.id}>{card}</div>
              )
            })}
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">{t("becomePartnerTitle")}</h2>
        <p className="text-gray-600 mb-6">
          {t("becomePartnerText")}
        </p>
        <a
          href="/contact"
          className="inline-flex items-center gap-2 bg-[#00BFA6] hover:bg-[#00908A] text-white rounded-full px-6 py-3 font-bold transition-colors"
        >
          <Mail className="h-4 w-4" />
          {t("contactUs")}
        </a>
      </div>
    </div>
  )
}
