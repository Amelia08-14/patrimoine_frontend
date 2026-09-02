"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function CGUPage() {
  const t = useTranslations("Cgu")
  const [sections, setSections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/content/legal/CGU`)
      .then((r) => r.json())
      .then(setSections)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-transparent">
      <div className="bg-[#003B4A] text-white py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold">{t("title")}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white dark:bg-white/5 rounded-3xl shadow-sm border border-gray-100 dark:border-white/10 p-6 sm:p-10 text-gray-800 dark:text-white/90">
          {loading ? (
            <p className="text-center text-gray-400 dark:text-white/40">{t("loading")}</p>
          ) : (
            sections.map((s) => (
              <section key={s.id} className="mb-8 last:mb-0">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{s.title}</h2>
                <div
                  className="legal-rich-content text-gray-600 dark:text-white/60 leading-relaxed"
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
