"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function FAQPage() {
  const t = useTranslations("FAQ")
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/content/faq`)
      .then((r) => r.json())
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#003B4A] text-white py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold">{t("title")}</h1>
          <p className="mt-3 text-white/80 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-4">
        {loading ? (
          <p className="text-center text-gray-400">{t("loading")}</p>
        ) : items.length === 0 ? (
          <p className="text-center text-gray-400">{t("noItems")}</p>
        ) : (
          items.map((f) => (
            <div key={f.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2">{f.question}</h2>
              <p className="text-gray-600 whitespace-pre-line leading-relaxed">{f.answer}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
