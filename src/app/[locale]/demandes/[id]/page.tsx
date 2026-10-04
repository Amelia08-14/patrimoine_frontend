"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import axios from "axios"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { ArrowLeft, Send, Mail, UserCheck, Loader2, CheckCircle2, Lock } from "lucide-react"
import { EntrustedResearchCard } from "@/components/EntrustedResearchCard"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Fiche interne d'une demande : critères en clair (sans galerie) + trois façons de joindre le demandeur.
export default function DemandeDetailPage() {
  const t = useTranslations("Demandes")
  const params = useParams()
  const id = Number(params?.id)

  const [research, setResearch] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)

  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState<"" | "message" | "mail" | "contact">("")
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    try {
      setToken(localStorage.getItem("token"))
      const u = localStorage.getItem("user")
      if (u) setCurrentUserId(JSON.parse(u)?.id ?? null)
    } catch {}
  }, [])

  useEffect(() => {
    if (!id) return
    axios.get(`${API_URL}/entrusted-research/${id}`)
      .then((res) => setResearch(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } }
  const isOwn = currentUserId !== null && research?.ownerId === currentUserId
  const hasAccount = !!research?.ownerId

  const sendMessage = async () => {
    if (!message.trim() || !research?.ownerId) return
    setBusy("message"); setFeedback(null)
    try {
      await axios.post(`${API_URL}/messages`, { receiverId: research.ownerId, content: message.trim() }, authHeaders)
      setMessage("")
      setFeedback({ ok: true, text: t("msgSent") })
    } catch {
      setFeedback({ ok: false, text: t("actionError") })
    } finally { setBusy("") }
  }

  const sendMail = async () => {
    setBusy("mail"); setFeedback(null)
    try {
      const res = await axios.get(`${API_URL}/entrusted-research/${id}/email`, authHeaders)
      if (res.data?.email) {
        const subject = encodeURIComponent(t("mailSubject", { id }))
        const body = message.trim() ? `&body=${encodeURIComponent(message.trim())}` : ""
        window.location.href = `mailto:${res.data.email}?subject=${subject}${body}`
      } else {
        setFeedback({ ok: false, text: t("noEmail") })
      }
    } catch {
      setFeedback({ ok: false, text: t("actionError") })
    } finally { setBusy("") }
  }

  const requestContact = async () => {
    setBusy("contact"); setFeedback(null)
    try {
      await axios.post(`${API_URL}/entrusted-research/${id}/contact-request`, {}, authHeaders)
      setFeedback({ ok: true, text: t("contactRequested") })
    } catch (e: any) {
      setFeedback({ ok: false, text: e?.response?.data?.message || t("actionError") })
    } finally { setBusy("") }
  }

  const btn = "w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-colors disabled:opacity-50"

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#022229]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/demandes" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-white/60 hover:text-[#00BFA6] mb-6">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("backToRequests")}
        </Link>

        {loading ? (
          <div className="text-center py-20 text-gray-500 dark:text-white/50">{t("loading")}</div>
        ) : notFound || !research ? (
          <div className="text-center py-20 text-gray-500 dark:text-white/60 font-medium">{t("requestNotFound")}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            <div className="lg:col-span-3">
              <EntrustedResearchCard research={research} variant="detail" />
            </div>

            {/* Actions de contact */}
            <aside className="lg:col-span-2 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl p-6 shadow-sm space-y-4 lg:sticky lg:top-24">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">{t("contactTitle")}</h2>
              <p className="text-sm text-gray-500 dark:text-white/60">{t("contactSubtitle")}</p>

              {!token ? (
                <Link href="/auth/login" className={`${btn} bg-[#0094BD] hover:bg-[#003B4A] text-white`}>
                  <Lock className="h-4 w-4" /> {t("loginToContact")}
                </Link>
              ) : isOwn ? (
                <p className="text-sm font-bold text-amber-600">{t("ownRequest")}</p>
              ) : (
                <>
                  <textarea
                    rows={4}
                    maxLength={5000}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t("messagePlaceholder")}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-white/10 focus:border-[#00BFA6] outline-none bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 font-medium resize-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={sendMessage}
                    disabled={!message.trim() || busy !== "" || !hasAccount}
                    className={`${btn} bg-[#00BFA6] hover:bg-[#00908A] text-white`}
                  >
                    {busy === "message" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {t("sendMessage")}
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button type="button" onClick={sendMail} disabled={busy !== ""} className={`${btn} border-2 border-gray-200 dark:border-white/15 text-gray-700 dark:text-white/80 hover:border-[#0094BD]`}>
                      {busy === "mail" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                      {t("sendMail")}
                    </button>
                    <button type="button" onClick={requestContact} disabled={busy !== "" || !hasAccount} className={`${btn} border-2 border-gray-200 dark:border-white/15 text-gray-700 dark:text-white/80 hover:border-[#0094BD]`}>
                      {busy === "contact" ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
                      {t("requestContact")}
                    </button>
                  </div>
                  {!hasAccount && <p className="text-xs text-gray-400">{t("noAccountHint")}</p>}
                </>
              )}

              {feedback && (
                <p className={`text-sm font-bold flex items-start gap-2 ${feedback.ok ? "text-emerald-600" : "text-red-500"}`}>
                  {feedback.ok && <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />} {feedback.text}
                </p>
              )}
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}
