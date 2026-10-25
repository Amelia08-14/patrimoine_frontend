"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import axios from "axios"
import { MessageSquare, Search, Loader2, Send, ArrowLeft, Mail, Phone, ExternalLink, PenSquare, X, Inbox, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { CenterToast } from "@/components/CenterToast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

type MsgUser = {
  id: number; email: string; firstName: string | null; lastName: string | null; companyName: string | null
  imageUrl: string | null; phone: string | null; userType: "PARTICULIER" | "SOCIETE" | "ADMIN"
  adminVerified: boolean; accountStatus: string
}
type Msg = {
  id: number; content: string; createdAt: string; isRead: boolean
  senderId: number; receiverId: number; sender: MsgUser; receiver: MsgUser
  announce: { id: number; reference: string } | null
}
type Conversation = { user: MsgUser; messages: Msg[]; last: Msg | null; unread: number }

const nameOf = (u: Pick<MsgUser, "companyName" | "firstName" | "lastName" | "email">) =>
  u.companyName || [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email
const initials = (u: MsgUser) => nameOf(u).split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("")

// Date courte façon messagerie : heure si aujourd'hui, sinon jour/mois (+ année si différente).
const shortDate = (iso: string) => {
  const d = new Date(iso)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", ...(d.getFullYear() !== now.getFullYear() ? { year: "numeric" } : {}) })
}
const fullDate = (iso: string) => new Date(iso).toLocaleString("fr-FR", { weekday: "short", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })

/**
 * Messagerie de l'administration — boîte "service client" partagée par tous les comptes admin,
 * regroupée par utilisateur comme une messagerie mail (liste à gauche, échange complet à droite).
 * Réception : réponses des clients (ex. au sujet d'une commande contactée depuis Points & Achats).
 * Envoi : POST /messages avec le jeton admin — le client le voit sous "Patrimoine-Immobilier".
 */
export default function AdminMessagesPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Msg[] | null>(null)
  const [adminIds, setAdminIds] = useState<Set<number>>(new Set())
  const [activeId, setActiveId] = useState<number | null>(null)
  const [draftUser, setDraftUser] = useState<MsgUser | null>(null) // nouvelle conversation sans message
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL")
  const [search, setSearch] = useState("")
  const [reply, setReply] = useState("")
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState("")
  const [composeOpen, setComposeOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const replyRef = useRef<HTMLTextAreaElement>(null)

  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("admin_token")}` })

  const load = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/messages`, { headers: headers() })
      const list: Msg[] = res.data
      setAdminIds(new Set(list.flatMap((m) => [m.sender, m.receiver]).filter((u) => u?.userType === "ADMIN").map((u) => u.id)))
      setMessages(list)
    } catch (e: any) {
      if (e?.response?.status === 401) { router.push("/admin/login"); return }
      setMessages((prev) => prev || [])
    }
  }, [router])

  useEffect(() => {
    load()
    const id = setInterval(load, 30000) // nouvelles réponses sans recharger la page
    return () => clearInterval(id)
  }, [load])

  // Regroupement par utilisateur (l'interlocuteur non-admin de chaque message).
  const conversations = useMemo<Conversation[]>(() => {
    if (!messages) return []
    const byUser = new Map<number, Conversation>()
    for (const m of messages) {
      const user = m.sender?.userType === "ADMIN" ? m.receiver : m.sender
      if (!user || user.userType === "ADMIN") continue
      if (!byUser.has(user.id)) byUser.set(user.id, { user, messages: [], last: null, unread: 0 })
      const c = byUser.get(user.id)!
      c.messages.push(m)
      c.last = m
      if (m.senderId === user.id && !m.isRead) c.unread++
    }
    return [...byUser.values()].sort((a, b) => new Date(b.last!.createdAt).getTime() - new Date(a.last!.createdAt).getTime())
  }, [messages])

  const visible = conversations.filter((c) => {
    if (filter === "UNREAD" && c.unread === 0) return false
    const q = search.trim().toLowerCase()
    if (!q) return true
    return [nameOf(c.user), c.user.email, c.user.phone || ""].some((v) => v.toLowerCase().includes(q))
  })
  const totalUnread = conversations.reduce((n, c) => n + c.unread, 0)

  const active: Conversation | null =
    conversations.find((c) => c.user.id === activeId) ||
    (draftUser && draftUser.id === activeId ? { user: draftUser, messages: [], last: null, unread: 0 } : null)

  // Ouvrir une conversation non lue → lue (en base + ici), et le badge du menu se met à jour.
  useEffect(() => {
    if (!active || active.unread === 0) return
    const userId = active.user.id
    setMessages((prev) => (prev || []).map((m) => (m.senderId === userId ? { ...m, isRead: true } : m)))
    axios.patch(`${API_URL}/admin/messages/read/${userId}`, {}, { headers: headers() })
      .then(() => window.dispatchEvent(new Event("admin-messages-read")))
      .catch(() => {})
  }, [active?.user.id, active?.unread])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [active?.user.id, active?.messages.length])

  const send = async () => {
    if (!active || !reply.trim()) return
    setSending(true)
    try {
      await axios.post(`${API_URL}/messages`, { receiverId: active.user.id, content: reply.trim() }, { headers: headers() })
      setReply("")
      setDraftUser(null)
      await load()
    } catch (e: any) {
      setToast("❌ " + (e?.response?.data?.message || "Envoi impossible"))
    } finally {
      setSending(false)
    }
  }

  const openUser = (u: MsgUser) => {
    if (!conversations.some((c) => c.user.id === u.id)) setDraftUser(u)
    setActiveId(u.id)
    setComposeOpen(false)
    setTimeout(() => replyRef.current?.focus(), 50)
  }

  if (messages === null) {
    return <div className="flex justify-center py-24"><Loader2 className="h-7 w-7 animate-spin text-[#00BFA6]" /></div>
  }

  return (
    <div>
      <CenterToast message={toast} onClose={() => setToast("")} />
      {composeOpen && <ComposeDialog onClose={() => setComposeOpen(false)} onPick={openUser} />}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#003B4A] font-brand flex items-center gap-3">
            <MessageSquare className="h-7 w-7 text-[#00BFA6]" /> Messages
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Échanges avec les utilisateurs, regroupés par personne{totalUnread > 0 ? ` — ${totalUnread} non lu${totalUnread > 1 ? "s" : ""}` : ""}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="rounded-xl border border-gray-200 p-2 hover:bg-gray-50" title="Actualiser"><RefreshCw className="h-4 w-4 text-gray-600" /></button>
          <button onClick={() => setComposeOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-[#00BFA6] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#00A896]">
            <PenSquare className="h-4 w-4" /> Nouveau message
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm md:flex md:h-[calc(100vh-220px)] md:min-h-[520px]">
        {/* Liste des conversations */}
        <div className={cn("flex flex-col md:w-96 md:shrink-0 md:border-r border-gray-100", active ? "hidden md:flex" : "flex")}>
          <div className="space-y-2 border-b border-gray-100 p-3">
            <div className="flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-3 py-2">
              <Search className="h-4 w-4 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nom, email ou téléphone…" className="w-full text-sm outline-none" />
            </div>
            <div className="flex gap-1.5">
              {([["ALL", "Tous"], ["UNREAD", `Non lus${totalUnread ? ` (${totalUnread})` : ""}`]] as const).map(([id, label]) => (
                <button key={id} onClick={() => setFilter(id)} className={cn("rounded-lg px-3 py-1.5 text-xs font-bold transition-colors", filter === id ? "bg-[#00BFA6] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {visible.length === 0 ? (
              <div className="px-6 py-16 text-center text-sm text-gray-400">
                <Inbox className="mx-auto mb-3 h-10 w-10 opacity-40" />
                {conversations.length === 0 ? "Aucun message pour le moment." : "Aucune conversation ne correspond."}
              </div>
            ) : visible.map((c) => (
              <button
                key={c.user.id}
                onClick={() => setActiveId(c.user.id)}
                className={cn("flex w-full items-start gap-3 border-b border-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-50", activeId === c.user.id && "bg-[#00BFA6]/[0.07]")}
              >
                <Avatar user={c.user} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn("truncate text-sm", c.unread ? "font-black text-gray-900" : "font-semibold text-gray-700")}>{nameOf(c.user)}</span>
                    <span className={cn("shrink-0 text-[11px]", c.unread ? "font-bold text-[#00908A]" : "text-gray-400")}>{shortDate(c.last!.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn("truncate text-xs", c.unread ? "font-semibold text-gray-700" : "text-gray-400")}>
                      {c.last!.senderId !== c.user.id && "Vous : "}{c.last!.content}
                    </p>
                    {c.unread > 0 && (
                      <span className="flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-[#00BFA6] px-1.5 text-[10px] font-black text-white">{c.unread}</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Conversation ouverte */}
        <div className={cn("flex min-w-0 flex-1 flex-col", !active && "hidden md:flex")}>
          {active ? (
            <>
              <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 px-4 py-3">
                <button onClick={() => setActiveId(null)} className="text-gray-400 hover:text-gray-700 md:hidden" aria-label="Retour"><ArrowLeft className="h-5 w-5" /></button>
                <Avatar user={active.user} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-bold text-gray-900">{nameOf(active.user)}</p>
                    <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold uppercase", active.user.userType === "SOCIETE" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600")}>
                      {active.user.userType === "SOCIETE" ? "Professionnel" : "Particulier"}
                    </span>
                    {!active.user.adminVerified && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-700">Non validé</span>}
                    {active.user.accountStatus !== "ACTIVE" && <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-red-700">{active.user.accountStatus === "BLOCKED" ? "Bloqué" : "Suspendu"}</span>}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-gray-500">
                    <a href={`mailto:${active.user.email}`} className="inline-flex items-center gap-1 hover:text-[#0094BD]"><Mail className="h-3 w-3" /> {active.user.email}</a>
                    {active.user.phone && <a href={`tel:${active.user.phone}`} className="inline-flex items-center gap-1 hover:text-[#0094BD]"><Phone className="h-3 w-3" /> {active.user.phone}</a>}
                  </div>
                </div>
                <Link href={`/admin/users?search=${encodeURIComponent(active.user.email)}`} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-50">
                  <ExternalLink className="h-3.5 w-3.5" /> Voir le compte
                </Link>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50/60 px-4 py-4">
                {active.messages.length === 0 && (
                  <p className="py-10 text-center text-sm text-gray-400">Nouvelle conversation — écrivez votre premier message ci-dessous.</p>
                )}
                {active.messages.map((m) => {
                  const fromAdmin = adminIds.has(m.senderId) || m.sender?.userType === "ADMIN"
                  return (
                    <div key={m.id} className={cn("flex", fromAdmin ? "justify-end" : "justify-start")}>
                      <div className={cn("max-w-[85%] rounded-2xl border px-4 py-3 text-sm shadow-sm", fromAdmin ? "border-[#00BFA6]/30 bg-[#00BFA6]/[0.08]" : "border-gray-200 bg-white")}>
                        <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-4 text-[11px]">
                          <span className="font-bold text-gray-700">{fromAdmin ? "Vous (Patrimoine-Immobilier)" : nameOf(m.sender)}</span>
                          <span className="text-gray-400">{fullDate(m.createdAt)}</span>
                        </div>
                        {m.announce && <p className="mb-1 text-[11px] font-bold text-[#00908A]">Annonce {m.announce.reference}</p>}
                        <p className="whitespace-pre-wrap break-words text-gray-800">{m.content}</p>
                      </div>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>

              <div className="border-t border-gray-100 p-3">
                <textarea
                  ref={replyRef}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); send() } }}
                  rows={4}
                  maxLength={5000}
                  placeholder={`Répondre à ${nameOf(active.user)}…`}
                  className="w-full resize-none rounded-xl border-2 border-gray-200 p-3 text-sm text-gray-900 outline-none focus:border-[#00BFA6]"
                />
                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-xs text-gray-400">Ctrl + Entrée pour envoyer · le client reçoit une notification</span>
                  <button onClick={send} disabled={sending || !reply.trim()} className="inline-flex items-center gap-2 rounded-xl bg-[#00BFA6] px-5 py-2 text-sm font-bold text-white hover:bg-[#00A896] disabled:opacity-50">
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Envoyer
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-sm text-gray-400">
              <MessageSquare className="h-10 w-10 opacity-30" />
              Sélectionnez une conversation
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Avatar({ user }: { user: MsgUser }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#003B4A] text-xs font-black text-white">
      {user.imageUrl
        ? <img src={user.imageUrl.startsWith("http") ? user.imageUrl : `${API_URL}/${user.imageUrl.replace(/^\//, "")}`} alt="" className="h-full w-full object-cover" />
        : initials(user)}
    </div>
  )
}

// "Nouveau message" : recherche d'un utilisateur (même endpoint que la page Utilisateurs) puis
// ouverture d'une conversation vide avec lui.
function ComposeDialog({ onClose, onPick }: { onClose: () => void; onPick: (u: MsgUser) => void }) {
  const [q, setQ] = useState("")
  const [results, setResults] = useState<MsgUser[] | null>(null)

  useEffect(() => {
    const term = q.trim()
    if (term.length < 2) { setResults(null); return }
    const id = setTimeout(() => {
      axios.get(`${API_URL}/admin/users?search=${encodeURIComponent(term)}`, { headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` } })
        .then((r) => setResults((r.data as any[]).slice(0, 20).map((u) => ({ ...u, accountStatus: u.accountStatus || "ACTIVE" }))))
        .catch(() => setResults([]))
    }, 300)
    return () => clearTimeout(id)
  }, [q])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="my-16 w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900"><PenSquare className="h-5 w-5 text-[#00BFA6]" /> Nouveau message</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700" aria-label="Fermer"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex items-center gap-2 rounded-xl border-2 border-gray-200 px-3 py-2 focus-within:border-[#00BFA6]">
          <Search className="h-4 w-4 text-gray-400" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Destinataire : nom, email, téléphone…" className="w-full text-sm outline-none" />
        </div>
        <div className="mt-3 max-h-80 overflow-y-auto">
          {results === null ? (
            <p className="py-6 text-center text-xs text-gray-400">Tapez au moins 2 caractères.</p>
          ) : results.length === 0 ? (
            <p className="py-6 text-center text-xs text-gray-400">Aucun utilisateur trouvé.</p>
          ) : results.map((u) => (
            <button key={u.id} onClick={() => onPick(u)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-gray-50">
              <Avatar user={u} />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-gray-900">{nameOf(u)}</p>
                <p className="truncate text-xs text-gray-500">{u.email}{u.phone ? ` · ${u.phone}` : ""}</p>
              </div>
              <span className={cn("ml-auto shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase", u.userType === "SOCIETE" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600")}>
                {u.userType === "SOCIETE" ? "Pro" : "Particulier"}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
