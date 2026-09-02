"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter, Link } from "@/i18n/navigation"
import axios from "axios"
import { Bell, MessageSquare, Search, CheckCircle2, XCircle, Loader2, CheckCheck } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface RawNotification {
  id: number
  type: "MESSAGE" | "RESEARCH_MATCH" | "ANNOUNCE_VALIDATED" | "ANNOUNCE_REJECTED" | "POINTS_EXPIRING"
  title: string
  body: string | null
  link: string | null
  isRead: boolean
  createdAt: string
}

const TYPE_ICON: Record<string, any> = {
  MESSAGE: MessageSquare,
  RESEARCH_MATCH: Search,
  ANNOUNCE_VALIDATED: CheckCircle2,
  ANNOUNCE_REJECTED: XCircle,
  POINTS_EXPIRING: Bell,
}

const TYPE_COLOR: Record<string, string> = {
  MESSAGE: "#0094BD",
  RESEARCH_MATCH: "#00BFA6",
  ANNOUNCE_VALIDATED: "#22C55E",
  ANNOUNCE_REJECTED: "#EF4444",
  POINTS_EXPIRING: "#F59E0B",
}

export default function NotificationsPage() {
  const t = useTranslations("ProfileNotifications")
  const router = useRouter()
  const [notifications, setNotifications] = useState<RawNotification[] | null>(null)

  const load = () => {
    const token = localStorage.getItem("token")
    if (!token) { router.push("/auth/login"); return }
    axios.get(`${API_URL}/notifications`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setNotifications(res.data))
      .catch((e) => {
        if (e?.response?.status === 401) { localStorage.removeItem("token"); router.push("/auth/login"); return }
        setNotifications([])
      })
  }

  useEffect(load, [router])

  const unreadCount = (notifications || []).filter((n) => !n.isRead).length

  const handleOpen = async (n: RawNotification) => {
    if (!n.isRead) {
      setNotifications((prev) => (prev || []).map((x) => (x.id === n.id ? { ...x, isRead: true } : x)))
      const token = localStorage.getItem("token")
      axios.patch(`${API_URL}/notifications/${n.id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {})
    }
    if (n.link) router.push(n.link)
  }

  const handleMarkAllRead = async () => {
    setNotifications((prev) => (prev || []).map((x) => ({ ...x, isRead: true })))
    const token = localStorage.getItem("token")
    try {
      await axios.post(`${API_URL}/notifications/read-all`, {}, { headers: { Authorization: `Bearer ${token}` } })
    } catch {}
  }

  if (notifications === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0094BD]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-transparent py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-2 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="h-6 w-6 text-[#00BFA6]" /> {t("title")}
              {unreadCount > 0 && (
                <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-[#00BFA6] text-white text-[11px] font-black flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-gray-500 dark:text-white/60 text-sm mt-0.5">{t("subtitle")}</p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-white/50 hover:text-[#00BFA6] transition-colors shrink-0"
            >
              <CheckCheck className="h-3.5 w-3.5" /> {t("markAllRead")}
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 mt-6">
            <Bell className="h-10 w-10 mx-auto text-gray-200 dark:text-white/15 mb-4" />
            <p className="text-gray-500 dark:text-white/60">{t("noNotifications")}</p>
          </div>
        ) : (
          <div className="mt-6 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden divide-y divide-gray-50 dark:divide-white/5">
            {notifications.map((n) => {
              const Icon = TYPE_ICON[n.type] || Bell
              const color = TYPE_COLOR[n.type] || "#0094BD"
              const content = (
                <div className={`flex items-start gap-3.5 px-5 py-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${!n.isRead ? "bg-[#00BFA6]/[0.04]" : ""}`}>
                  <span className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}1A` }}>
                    <Icon className="h-4.5 w-4.5" style={{ color }} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${!n.isRead ? "font-black text-gray-900 dark:text-white" : "font-semibold text-gray-700 dark:text-white/70"}`}>
                        {n.title}
                      </p>
                      {!n.isRead && <span className="h-2 w-2 rounded-full bg-[#00BFA6] shrink-0 mt-1.5" />}
                    </div>
                    {n.body && <p className="text-xs text-gray-500 dark:text-white/50 mt-1 line-clamp-2">{n.body}</p>}
                    <span className="text-[11px] text-gray-400 dark:text-white/30 mt-1.5 block">
                      {new Date(n.createdAt).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              )
              return n.link ? (
                <button key={n.id} onClick={() => handleOpen(n)} className="w-full">{content}</button>
              ) : (
                <div key={n.id}>{content}</div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
