"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import {
  PieChart, MousePointerClick, Phone, Mail, MessageSquare, Flag,
  Store, Play, Bell, Loader2,
} from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

type Stats = {
  announceClicks: number
  calls: { total: number; byChannel: { CALL: number; WHATSAPP: number; TELEGRAM: number; VIBER: number } }
  emails: number
  internalMessages: number
  reports: number
  boutiqueContacts: number
  boutiqueFollowers: number
}

// Carte KPI générique — même gabarit pour toutes les statistiques, particulier ou pro.
function StatCard({ icon: Icon, value, title, desc, color = "#00BFA6", sub }: {
  icon: any; value: number; title: string; desc: string; color?: string; sub?: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start gap-3">
        <span className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: color + '1A' }}>
          <Icon className="h-5 w-5" style={{ color }} />
        </span>
        <div className="min-w-0">
          <div className="text-2xl font-black text-gray-900 leading-none">{value.toLocaleString()}</div>
          <p className="font-bold text-gray-900 text-sm mt-1.5">{title}</p>
          <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
        </div>
      </div>
      {sub}
    </div>
  )
}

export default function StatsPage() {
  const t = useTranslations("ProfileStats")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats | null>(null)
  const [isPro, setIsPro] = useState(false)
  const [storyViews, setStoryViews] = useState(0)

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('token')
      if (!token) { setLoading(false); return }

      let userId: number | null = null
      let pro = false
      try {
        const userStr = localStorage.getItem('user')
        const user = userStr ? JSON.parse(userStr) : null
        userId = user?.id ?? null
        pro = user?.userType === 'SOCIETE'
        setIsPro(pro)
      } catch { /* ignore */ }

      try {
        const res = await fetch(`${API_URL}/users/me/stats`, { headers: { Authorization: `Bearer ${token}` } })
        if (res.ok) setStats(await res.json())
      } catch { /* ignore */ }

      // Vues des stories — vivent dans la config JSON de la boutique (pas dans la base
      // principale), somme des stories actives + archivées pour garder l'historique complet
      // même après suppression d'une story.
      if (pro && userId) {
        try {
          const cfgRes = await fetch(`/api/boutique/${userId}`)
          const cfg = cfgRes.ok ? await cfgRes.json() : null
          const active = (cfg?.stories || []).reduce((s: number, story: any) => s + (story.views || 0), 0)
          const archived = (cfg?.archivedStories || []).reduce((s: number, story: any) => s + (story.views || 0), 0)
          setStoryViews(active + archived)
        } catch { /* ignore */ }
      }

      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-10 flex items-center justify-center min-h-[50vh]">
      <Loader2 className="h-8 w-8 animate-spin text-[#00BFA6]" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-3 text-gray-900">
        <PieChart className="text-[#00BFA6] fill-current" /> {t("title")}
      </h1>
      <p className="text-gray-500 mb-8 text-sm">{t("subtitle")}</p>

      {!stats ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 py-20 flex flex-col items-center gap-3">
          <div className="h-14 w-14 rounded-2xl bg-[#00BFA6]/10 flex items-center justify-center">
            <PieChart className="h-6 w-6 text-[#00BFA6]" />
          </div>
          <p className="text-gray-500 font-medium">{t("noData")}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Statistiques communes — particulier et professionnel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard
              icon={MousePointerClick}
              value={stats.announceClicks}
              title={t("announceClicksTitle")}
              desc={t("announceClicksDesc")}
              color="#00BFA6"
            />
            <StatCard
              icon={Phone}
              value={stats.calls.total}
              title={t("callsTitle")}
              desc={t("callsDesc")}
              color="#1E40AF"
              sub={
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="font-black text-gray-900">{stats.calls.byChannel.CALL}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{t("callChannelCall")}</div>
                  </div>
                  <div>
                    <div className="font-black text-gray-900">{stats.calls.byChannel.WHATSAPP}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{t("callChannelWhatsapp")}</div>
                  </div>
                  <div>
                    <div className="font-black text-gray-900">{stats.calls.byChannel.TELEGRAM}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{t("callChannelTelegram")}</div>
                  </div>
                </div>
              }
            />
            <StatCard
              icon={Mail}
              value={stats.emails}
              title={t("emailsTitle")}
              desc={t("emailsDesc")}
              color="#DC2626"
            />
            <StatCard
              icon={MessageSquare}
              value={stats.internalMessages}
              title={t("internalMessagesTitle")}
              desc={t("internalMessagesDesc")}
              color="#7C3AED"
            />
            <StatCard
              icon={Flag}
              value={stats.reports}
              title={t("reportsTitle")}
              desc={t("reportsDesc")}
              color="#EA580C"
            />
          </div>

          {/* Statistiques boutique — professionnel uniquement */}
          {isPro && (
            <div>
              <h2 className="font-black text-gray-900 text-lg flex items-center gap-2 mb-4">
                <Store className="h-5 w-5 text-[#00BFA6]" /> {t("boutiqueSectionTitle")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                  icon={Store}
                  value={stats.boutiqueContacts}
                  title={t("boutiqueContactsTitle")}
                  desc={t("boutiqueContactsDesc")}
                  color="#00BFA6"
                />
                <StatCard
                  icon={Play}
                  value={storyViews}
                  title={t("storyViewsTitle")}
                  desc={t("storyViewsDesc")}
                  color="#D97706"
                />
                <StatCard
                  icon={Bell}
                  value={stats.boutiqueFollowers}
                  title={t("boutiqueFollowersTitle")}
                  desc={t("boutiqueFollowersDesc")}
                  color="#1E40AF"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
