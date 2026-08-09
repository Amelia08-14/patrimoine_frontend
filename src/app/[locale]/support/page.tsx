"use client"

import { useEffect, useState } from "react"
import { LifeBuoy, Phone, HelpCircle, MessageSquare } from "lucide-react"
import { Link } from "@/i18n/navigation"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function SupportPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/content/settings`).then((r) => r.json()).then(setSettings).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#003B4A] text-white py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <LifeBuoy className="h-10 w-10 mx-auto mb-4 text-[#00BFA6]" />
          <h1 className="text-3xl md:text-4xl font-extrabold">Service Support</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          {loading ? (
            <p className="text-gray-400 text-center">Chargement...</p>
          ) : (
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{settings.SUPPORT_CONTENT}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/faq" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center gap-2 hover:shadow-md transition-shadow">
            <HelpCircle className="h-6 w-6 text-[#00BFA6]" />
            <p className="font-bold text-gray-900 text-sm">FAQ</p>
          </Link>
          <Link href="/contact" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center gap-2 hover:shadow-md transition-shadow">
            <MessageSquare className="h-6 w-6 text-[#00BFA6]" />
            <p className="font-bold text-gray-900 text-sm">Formulaire de contact</p>
          </Link>
          {settings.CONTACT_PHONE && (
            <a href={`tel:${settings.CONTACT_PHONE}`} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center gap-2 hover:shadow-md transition-shadow">
              <Phone className="h-6 w-6 text-[#00BFA6]" />
              <p className="font-bold text-gray-900 text-sm">{settings.CONTACT_PHONE}</p>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
