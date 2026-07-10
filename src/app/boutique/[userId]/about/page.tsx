"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { ArrowLeft, ExternalLink } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function getImageUrl(url: string) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  let clean = url.replace(/\\/g, '/')
  if (clean.startsWith('/')) clean = clean.substring(1)
  return `${API_URL}/${clean}`
}

export default function BoutiqueAboutPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params)
  const [config, setConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/boutique/${userId}`)
      .then(r => r.json())
      .then(data => { setConfig(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [userId])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="h-8 w-8 border-4 border-[#00BFA6] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!config) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-500">Page introuvable</p>
    </div>
  )

  const hc = config.headerColor || config.primaryColor || '#00BFA6'
  const htc = config.headerTextColor || '#ffffff'
  const fc = config.footerColor || hc
  const ftc = config.footerTextColor || '#ffffff'
  const bc = config.bodyColor || '#F9FAFB'
  const ff = config.fontFamily || undefined

  return (
    <div className="min-h-screen" style={{ backgroundColor: bc, fontFamily: ff }}>
      {ff && <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(ff)}:wght@400;600;700;900&display=swap`} />}

      {/* Header */}
      <div className="py-5 px-6" style={{ backgroundColor: hc }}>
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href={`/boutique/${userId}`} className="flex items-center gap-2 text-sm font-bold rounded-full px-4 py-1.5 bg-white/20 hover:bg-white/30 transition-colors" style={{ color: htc }}>
            <ArrowLeft className="h-4 w-4" /> Retour à la boutique
          </Link>
          <span className="font-black text-lg" style={{ color: htc }}>{config.companyName}</span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-black text-gray-900 mb-8">À propos de {config.companyName || 'nous'}</h1>

        {config.aboutImage && (
          <div className="rounded-3xl overflow-hidden mb-8 shadow-lg">
            <img src={getImageUrl(config.aboutImage)} alt="À propos" className="w-full h-72 object-cover" />
          </div>
        )}

        {config.aboutDescription && (
          <div className="prose max-w-none mb-10">
            <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">{config.aboutDescription}</p>
          </div>
        )}

        {config.aboutButtonLabel && (
          <a
            href={config.aboutButtonUrl || `mailto:${config.email}`}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            style={{ backgroundColor: hc, color: htc }}
          >
            {config.aboutButtonLabel}
            <ExternalLink className="h-5 w-5" />
          </a>
        )}

        {!config.aboutImage && !config.aboutDescription && !config.aboutButtonLabel && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">Cette page est en cours de configuration.</p>
            <Link href={`/boutique/${userId}`} className="mt-4 inline-block font-bold" style={{ color: hc }}>
              Voir les annonces →
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-sm font-bold" style={{ backgroundColor: fc, color: ftc }}>
        {config.companyName} · Patrimoine.dz
      </footer>
    </div>
  )
}
