"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function AProposPage() {
  const t = useTranslations("APropos")
  const [sections, setSections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/content/legal/A_PROPOS`)
      .then((r) => r.json())
      .then(setSections)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#003B4A] text-white py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold">{t("title")}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-10 text-gray-800">
          {loading ? (
            <p className="text-center text-gray-400">{t("loading")}</p>
          ) : sections.length === 0 ? (
            <p className="text-center text-gray-400">{t("empty")}</p>
          ) : (
            sections.map((s) => (
              <section key={s.id} className="mb-10 last:mb-0">
                {s.imageUrl && (
                  <img
                    src={`${API_URL}${s.imageUrl}`}
                    alt={s.title}
                    className="w-full h-56 sm:h-72 object-cover rounded-2xl mb-5"
                  />
                )}
                <h2 className="text-xl font-bold mb-4 text-gray-900">{s.title}</h2>
                <div
                  className="legal-rich-content text-gray-600 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: s.body }}
                />
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
