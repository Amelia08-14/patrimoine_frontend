"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter, Link } from "@/i18n/navigation"
import axios from "axios"
import { MessageSquare, Loader2, Send, ArrowLeft, User, Building2, Search } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface RawUser { id: number; firstName?: string; lastName?: string; companyName?: string; imageUrl?: string }
interface RawMessage {
  id: number; content: string; createdAt: string; isRead: boolean
  senderId: number; sender: RawUser
  receiverId: number; receiver: RawUser
  announceId: number | null; announce: { id: number; reference: string } | null
}

const getImageUrl = (url?: string) => {
  if (!url) return ""
  if (url.startsWith("http")) return url
  let clean = url.replace(/\\/g, "/")
  if (clean.startsWith("/")) clean = clean.substring(1)
  return `${API_URL}/${clean}`
}

export default function MessagesPage() {
  const t = useTranslations("ProfileMessages")
  const router = useRouter()
  const [me, setMe] = useState<{ id: number } | null>(null)
  const [messages, setMessages] = useState<RawMessage[] | null>(null)
  const [activeConvId, setActiveConvId] = useState<number | null>(null)
  const [replyText, setReplyText] = useState("")
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userStr = localStorage.getItem("user")
    if (!token || !userStr) { router.push("/auth/login"); return }
    try { setMe(JSON.parse(userStr)) } catch { router.push("/auth/login"); return }
    axios.get(`${API_URL}/messages`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setMessages(res.data))
      .catch((e) => {
        if (e?.response?.status === 401) { localStorage.removeItem("token"); router.push("/auth/login"); return }
        setMessages([])
      })
  }, [router])

  // Regroupe le flux plat de messages (sender/receiver) en "conversations" par interlocuteur —
  // il n'y a pas de notion de conversation côté backend, on la reconstruit ici.
  const conversations = useMemo(() => {
    if (!messages || !me) return []
    const byPartner = new Map<number, { partner: RawUser; messages: RawMessage[] }>()
    for (const m of messages) {
      const isMine = m.senderId === me.id
      const partnerId = isMine ? m.receiverId : m.senderId
      const partner = isMine ? m.receiver : m.sender
      if (!byPartner.has(partnerId)) byPartner.set(partnerId, { partner, messages: [] })
      byPartner.get(partnerId)!.messages.push(m)
    }
    return Array.from(byPartner.entries())
      .map(([partnerId, v]) => {
        const sorted = [...v.messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        const last = sorted[sorted.length - 1]
        const unread = v.messages.filter((m) => m.receiverId === me.id && !m.isRead).length
        const announce = [...sorted].reverse().find((m) => m.announce)?.announce || null
        return { partnerId, partner: v.partner, messages: sorted, last, unread, announce }
      })
      .sort((a, b) => new Date(b.last.createdAt).getTime() - new Date(a.last.createdAt).getTime())
  }, [messages, me])

  const activeConv = conversations.find((c) => c.partnerId === activeConvId) || null

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [activeConv?.messages.length])

  const partnerLabel = (partner?: RawUser) =>
    partner?.companyName || [partner?.firstName, partner?.lastName].filter(Boolean).join(" ") || t("unknownUser")

  const handleReply = async () => {
    if (!replyText.trim() || !activeConv || !me) return
    setSending(true)
    try {
      const token = localStorage.getItem("token")
      const res = await axios.post(
        `${API_URL}/messages`,
        { receiverId: activeConv.partnerId, announceId: activeConv.announce?.id, content: replyText.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const sent: RawMessage = { ...res.data, sender: { id: me.id }, receiver: activeConv.partner }
      setMessages((prev) => [...(prev || []), sent])
      setReplyText("")
    } catch {
      // Silencieux — le message reste dans le champ, l'utilisateur peut réessayer.
    } finally {
      setSending(false)
    }
  }

  if (messages === null || me === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0094BD]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-transparent py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-[#00BFA6]" /> {t("title")}
          </h1>
          <p className="text-gray-500 dark:text-white/60 text-sm mt-0.5">{t("subtitle")}</p>
        </div>

        {conversations.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
            <MessageSquare className="h-10 w-10 mx-auto text-gray-200 dark:text-white/15 mb-4" />
            <p className="text-gray-500 dark:text-white/60 mb-1.5">{t("noMessages")}</p>
            <p className="text-gray-400 dark:text-white/40 text-sm mb-5">{t("noConversationsHint")}</p>
            <button
              onClick={() => router.push("/announces")}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00BFA6] hover:bg-[#00908A] text-white rounded-xl font-bold text-sm transition-colors"
            >
              <Search className="h-4 w-4" /> {t("browseListings")}
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden md:flex md:h-[70vh] md:min-h-[480px]">
            {/* Liste des conversations — masquée sur mobile une fois une conv ouverte */}
            <div className={`md:w-80 md:border-r border-gray-100 dark:border-white/10 overflow-y-auto ${activeConv ? "hidden md:block" : ""}`}>
              {conversations.map((c) => (
                <button
                  key={c.partnerId}
                  onClick={() => setActiveConvId(c.partnerId)}
                  className={`w-full flex items-start gap-3 px-4 py-3.5 text-left border-b border-gray-50 dark:border-white/5 transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${
                    activeConvId === c.partnerId ? "bg-gray-50 dark:bg-white/10" : ""
                  }`}
                >
                  <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                    {c.partner?.imageUrl ? (
                      <img src={getImageUrl(c.partner.imageUrl)} alt="" className="h-full w-full object-cover" />
                    ) : c.partner?.companyName ? (
                      <Building2 className="h-4.5 w-4.5 text-gray-400 dark:text-white/40" />
                    ) : (
                      <User className="h-4.5 w-4.5 text-gray-400 dark:text-white/40" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm truncate ${c.unread > 0 ? "font-black text-gray-900 dark:text-white" : "font-bold text-gray-700 dark:text-white/80"}`}>
                        {partnerLabel(c.partner)}
                      </span>
                      {c.unread > 0 && (
                        <span className="h-4.5 min-w-[18px] px-1 rounded-full bg-[#00BFA6] text-white text-[10px] font-black flex items-center justify-center shrink-0">
                          {c.unread}
                        </span>
                      )}
                    </div>
                    {c.announce && (
                      <span className="text-[10px] text-[#00BFA6] font-bold">{t("reference", { reference: c.announce.reference })}</span>
                    )}
                    <p className={`text-xs truncate mt-0.5 ${c.unread > 0 ? "text-gray-600 dark:text-white/70 font-semibold" : "text-gray-400 dark:text-white/40"}`}>
                      {c.last.senderId === me.id && t("youPrefix")}{c.last.content}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Thread actif — plein écran sur mobile, sinon dans la colonne de droite */}
            <div className={`flex-1 flex flex-col ${!activeConv ? "hidden md:flex" : ""}`}>
              {activeConv ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 dark:border-white/10 shrink-0">
                    <button onClick={() => setActiveConvId(null)} className="md:hidden text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/70">
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="h-9 w-9 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                      {activeConv.partner?.imageUrl ? (
                        <img src={getImageUrl(activeConv.partner.imageUrl)} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-4 w-4 text-gray-400 dark:text-white/40" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{partnerLabel(activeConv.partner)}</p>
                      {activeConv.announce && (
                        <Link href={`/announces/${activeConv.announce.id}`} className="text-[11px] text-[#00BFA6] font-bold hover:underline">
                          {t("reference", { reference: activeConv.announce.reference })}
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                    {activeConv.messages.map((m) => {
                      const isMine = m.senderId === me.id
                      return (
                        <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                            isMine
                              ? "bg-[#00BFA6] text-white rounded-br-sm"
                              : "bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-white/90 rounded-bl-sm"
                          }`}>
                            <p className="whitespace-pre-wrap break-words">{m.content}</p>
                            <span className={`block text-[10px] mt-1 ${isMine ? "text-white/70" : "text-gray-400 dark:text-white/40"}`}>
                              {new Date(m.createdAt).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={bottomRef} />
                  </div>

                  <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-100 dark:border-white/10 shrink-0">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply() } }}
                      placeholder={t("replyPlaceholder")}
                      className="flex-1 px-4 py-2.5 rounded-full bg-gray-100 dark:bg-white/10 text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#00BFA6] transition-all"
                    />
                    <button
                      onClick={handleReply}
                      disabled={!replyText.trim() || sending}
                      className="h-10 w-10 shrink-0 rounded-full bg-[#00BFA6] hover:bg-[#00908A] text-white flex items-center justify-center disabled:opacity-40 transition-colors"
                    >
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 hidden md:flex items-center justify-center text-gray-400 dark:text-white/40 text-sm">
                  {t("selectConversation")}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
