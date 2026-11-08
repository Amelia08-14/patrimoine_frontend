"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { NextIntlClientProvider } from "next-intl"
import {
  Handshake, Check, X, Loader2, RefreshCw, Search, User, Building2, MapPin, Wallet, CalendarDays,
  ChevronDown, ChevronUp, MessageSquare, Send, Mail, Phone, AlertCircle,
} from "lucide-react"
import { CenterToast } from "@/components/CenterToast"
import { ResearchCriteriaDetails } from "@/components/ResearchCriteriaDetails"
import { getCategoryColor } from "@/data/categoryColors"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

type Status = "PENDING" | "VALIDATED" | "REJECTED"
type Research = {
  id: number; title: string | null; comment: string | null; transaction: "SALE" | "RENTAL" | string
  realEstateType: string | null; propertyType: string | null; amenities: string | null
  minBudget: number | null; maxBudget: number | null; installationDate: string | null
  status: Status; statusReason: string | null; createdAt: string; validatedAt: string | null
  cityName: string | null; townNames: string[]
  firstName: string | null; lastName: string | null; email: string | null; phone: string | null; companyName: string | null
  userId: number | null
  user: { id: number; firstName: string | null; lastName: string | null; companyName: string | null; email: string; phone: string | null; userType: string } | null
}

const CATEGORY_LABELS: Record<string, string> = {
  RESIDENTIEL: "Résidentiel", BUREAUX_COMMERCES: "Bureaux & Commerces", INDUSTRIEL: "Industriel",
  TERRAIN_FONCIER: "Terrains et Foncier", HOTELIER: "Hôtellerie & Séjour", HEBERGEMENT: "Hôtellerie & Séjour",
}
const STATUS_TABS: { id: Status | "ALL"; label: string }[] = [
  { id: "PENDING", label: "⏳ En attente" }, { id: "ALL", label: "Toutes" },
  { id: "VALIDATED", label: "✓ Validées" }, { id: "REJECTED", label: "✗ Refusées" },
]
const BUDGET_UNITS: Record<string, string> = { DA: "DA", DA_M2: "DA/m²", MILLION: "Millions", MILLION_M2: "Millions/m²", MILLIARD: "Milliards" }

const requesterName = (r: Research) =>
  r.user?.companyName || r.companyName || [r.user?.firstName || r.firstName, r.user?.lastName || r.lastName].filter(Boolean).join(" ") || "Visiteur sans compte"
const fmt = (n: number) => new Intl.NumberFormat("fr-DZ").format(n)

function budgetLabel(r: Research) {
  let unit = "DA"
  try {
    const a = r.amenities ? JSON.parse(r.amenities) : {}
    unit = BUDGET_UNITS[a.residentiel?.location?.budgetUnit || a.residentiel?.achatHabitation?.budgetUnit || a.bureaux?.groupee?.budgetUnit || a.bureaux?.blocAdministratif?.budgetUnit] || "DA"
  } catch { /* JSON invalide : DA par défaut */ }
  if (r.minBudget && r.maxBudget) return `${fmt(r.minBudget)} – ${fmt(r.maxBudget)} ${unit}`
  if (r.maxBudget) return `jusqu'à ${fmt(r.maxBudget)} ${unit}`
  if (r.minBudget) return `à partir de ${fmt(r.minBudget)} ${unit}`
  return null
}

/**
 * Recherches confiées — validation par l'administration (08/11/2026) : une recherche déposée via
 * « Confier votre recherche » reste EN ATTENTE et n'apparaît dans /demandes qu'une fois validée, comme
 * une annonce. Rubrique séparée des annonces pour s'y retrouver.
 */
export default function AdminResearchesPage() {
  const router = useRouter()
  const [items, setItems] = useState<Research[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [status, setStatus] = useState<Status | "ALL">("PENDING")
  const [category, setCategory] = useState("ALL")
  const [search, setSearch] = useState("")
  const [openId, setOpenId] = useState<number | null>(null)
  const [processing, setProcessing] = useState<number | null>(null)
  const [toast, setToast] = useState("")
  const [rejectTarget, setRejectTarget] = useState<Research | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [messageTarget, setMessageTarget] = useState<Research | null>(null)
  const [messageText, setMessageText] = useState("")
  const [sending, setSending] = useState(false)
  // Libellés du formulaire (namespaces Research / Deposit…) chargés à la première ouverture d'une
  // fiche : l'admin n'a pas de fournisseur de traductions, ResearchCriteriaDetails en a besoin.
  const [messages, setMessages] = useState<any>(null)

  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("admin_token")}` })

  const load = useCallback(async () => {
    setLoading(true); setError("")
    try {
      const res = await axios.get(`${API_URL}/entrusted-research/admin/list${status !== "ALL" ? `?status=${status}` : ""}`, { headers: headers() })
      setItems(res.data)
    } catch (e: any) {
      if (e?.response?.status === 401) { router.push("/admin/login"); return }
      setError("Erreur lors du chargement.")
    } finally {
      setLoading(false)
    }
  }, [status, router])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (openId === null || messages) return
    import("../../../../../messages/fr.json").then((m) => setMessages(m.default || m)).catch(() => {})
  }, [openId, messages])

  const filtered = useMemo(() => items.filter((r) => {
    if (category !== "ALL" && (r.realEstateType === "HEBERGEMENT" ? "HOTELIER" : r.realEstateType) !== category) return false
    const q = search.trim().toLowerCase()
    if (!q) return true
    return [requesterName(r), r.user?.email || r.email || "", r.title || "", r.comment || "", r.cityName || "", String(r.id)]
      .some((v) => v.toLowerCase().includes(q))
  }), [items, category, search])

  const notifyNav = () => window.dispatchEvent(new Event("admin-researches-changed"))

  const validate = async (r: Research) => {
    setProcessing(r.id)
    try {
      await axios.put(`${API_URL}/entrusted-research/admin/${r.id}/validate`, {}, { headers: headers() })
      setToast("✅ Recherche validée : elle est visible dans les demandes en cours.")
      notifyNav(); await load()
    } catch (e: any) {
      setToast("❌ " + (e?.response?.data?.message || "Erreur"))
    } finally { setProcessing(null) }
  }

  const reject = async () => {
    if (!rejectTarget) return
    setProcessing(rejectTarget.id)
    try {
      await axios.put(`${API_URL}/entrusted-research/admin/${rejectTarget.id}/reject`, { reason: rejectReason }, { headers: headers() })
      setToast("Recherche refusée — le demandeur a été prévenu.")
      setRejectTarget(null); setRejectReason("")
      notifyNav(); await load()
    } catch (e: any) {
      setToast("❌ " + (e?.response?.data?.message || "Erreur"))
    } finally { setProcessing(null) }
  }

  const openMessage = (r: Research) => {
    setMessageTarget(r)
    setMessageText(`Bonjour,\n\nConcernant votre recherche n°${r.id}${r.title ? ` « ${r.title} »` : ""} : \n\n`)
  }
  const sendMessage = async () => {
    if (!messageTarget?.userId || !messageText.trim()) return
    setSending(true)
    try {
      await axios.post(`${API_URL}/messages`, { receiverId: messageTarget.userId, content: messageText.trim() }, { headers: headers() })
      setToast("✅ Message envoyé au demandeur")
      setMessageTarget(null)
    } catch (e: any) {
      setToast("❌ " + (e?.response?.data?.message || "Envoi impossible"))
    } finally { setSending(false) }
  }

  const pendingCount = items.filter((r) => r.status === "PENDING").length

  return (
    <div>
      <CenterToast message={toast} onClose={() => setToast("")} />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#003B4A] font-brand flex items-center gap-3">
            <Handshake className="h-7 w-7 text-[#00BFA6]" /> Recherches confiées
          </h1>
          <p className="mt-1 text-sm text-gray-500">Recherches déposées via « Confier votre recherche » — visibles dans les demandes en cours une fois validées.</p>
        </div>
        <div className="flex items-center gap-3">
          {status === "PENDING" && pendingCount > 0 && (
            <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700">{pendingCount} en attente</span>
          )}
          <button onClick={load} className="rounded-xl border border-gray-200 p-2 hover:bg-gray-50" title="Actualiser"><RefreshCw className="h-4 w-4 text-gray-600" /></button>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle className="h-5 w-5 shrink-0" /> {error}</div>
      )}

      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((s) => (
            <button key={s.id} onClick={() => setStatus(s.id)}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${status === s.id ? "bg-[#00BFA6] text-white shadow-sm" : "border border-gray-200 bg-white text-gray-600 hover:border-[#00BFA6] hover:text-[#00BFA6]"}`}>
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-sm font-medium outline-none">
            <option value="ALL">Catégorie : Toutes</option>
            {["RESIDENTIEL", "BUREAUX_COMMERCES", "INDUSTRIEL", "TERRAIN_FONCIER", "HOTELIER"].map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
          </select>
          <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-3 py-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Demandeur, email, titre, wilaya, n°…" className="w-full text-sm outline-none" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-[#00BFA6]" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center text-gray-400">
          <Handshake className="mx-auto mb-3 h-12 w-12 opacity-30" />
          <p className="font-medium">Aucune recherche ne correspond aux filtres.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const cat = r.realEstateType === "HEBERGEMENT" ? "HOTELIER" : (r.realEstateType || "")
            const color = cat ? getCategoryColor(cat).hex : "#6B7280"
            const isPro = r.user?.userType === "SOCIETE" || !!(r.user?.companyName || r.companyName)
            const budget = budgetLabel(r)
            const place = [r.cityName, ...(r.townNames || [])].filter(Boolean).join(" — ")
            const open = openId === r.id
            return (
              <div key={r.id} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="flex flex-wrap items-start gap-4 p-4">
                  <span className="w-10 shrink-0 font-mono text-xs text-gray-400">#{r.id}</span>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ backgroundColor: `${color}1A`, color }}>{CATEGORY_LABELS[cat] || cat || "—"}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white ${r.transaction === "SALE" ? "bg-[#00BFA6]" : "bg-[#003B4A]"}`}>{r.transaction === "SALE" ? "Achat" : "Location"}</span>
                      {r.status === "PENDING" && <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">En attente</span>}
                      {r.status === "VALIDATED" && <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-bold text-green-700">Validée</span>}
                      {r.status === "REJECTED" && <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-bold text-red-700">Refusée</span>}
                    </div>
                    <p className="font-bold text-gray-900 break-words">{r.title || r.comment?.slice(0, 90) || "Sans titre"}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1">{isPro ? <Building2 className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />} {requesterName(r)}</span>
                      {(r.user?.email || r.email) && <a href={`mailto:${r.user?.email || r.email}`} className="inline-flex items-center gap-1 hover:text-[#0094BD]"><Mail className="h-3.5 w-3.5" /> {r.user?.email || r.email}</a>}
                      {(r.user?.phone || r.phone) && <a href={`tel:${r.user?.phone || r.phone}`} className="inline-flex items-center gap-1 hover:text-[#0094BD]"><Phone className="h-3.5 w-3.5" /> {r.user?.phone || r.phone}</a>}
                      {place && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {place}</span>}
                      {budget && <span className="inline-flex items-center gap-1"><Wallet className="h-3.5 w-3.5" /> {budget}</span>}
                      <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> déposée le {new Date(r.createdAt).toLocaleDateString("fr-FR")}</span>
                    </div>
                    {r.status === "REJECTED" && r.statusReason && <p className="text-xs text-red-600">Motif du refus : {r.statusReason}</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => setOpenId(open ? null : r.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50">
                      {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />} Détail
                    </button>
                    {r.status !== "VALIDATED" && (
                      <button onClick={() => validate(r)} disabled={processing === r.id} className="inline-flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-600 disabled:opacity-60">
                        {processing === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Valider
                      </button>
                    )}
                    {r.status !== "REJECTED" && (
                      <button onClick={() => { setRejectTarget(r); setRejectReason("") }} disabled={processing === r.id} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 disabled:opacity-60">
                        <X className="h-3.5 w-3.5" /> {r.status === "VALIDATED" ? "Retirer" : "Refuser"}
                      </button>
                    )}
                    {r.userId && (
                      <button onClick={() => openMessage(r)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#0094BD]/40 bg-white px-3 py-1.5 text-xs font-bold text-[#0094BD] hover:bg-[#0094BD]/5">
                        <MessageSquare className="h-3.5 w-3.5" /> Message
                      </button>
                    )}
                  </div>
                </div>
                {open && (
                  <div className="space-y-4 border-t border-gray-100 bg-gray-50/60 p-4">
                    {r.comment && <p className="whitespace-pre-line break-words rounded-xl bg-white p-4 text-sm text-gray-700">{r.comment}</p>}
                    {r.installationDate && <p className="text-xs text-gray-500">Date souhaitée : <b>{new Date(r.installationDate).toLocaleDateString("fr-FR")}</b></p>}
                    {messages ? (
                      <NextIntlClientProvider locale="fr" messages={messages}>
                        <ResearchCriteriaDetails research={r} />
                      </NextIntlClientProvider>
                    ) : (
                      <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={(e) => e.target === e.currentTarget && setRejectTarget(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-gray-900">{rejectTarget.status === "VALIDATED" ? "Retirer cette recherche des demandes en cours" : "Refuser cette recherche"}</h2>
            <p className="mt-1 text-sm text-gray-500">Recherche n°{rejectTarget.id} — {requesterName(rejectTarget)}. Le motif est envoyé au demandeur dans sa notification.</p>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={4} maxLength={1000}
              placeholder="Motif (ex. informations incomplètes, doublon, contenu non conforme…)"
              className="mt-4 w-full rounded-xl border-2 border-gray-200 p-3 text-sm text-gray-900 outline-none focus:border-red-400" />
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setRejectTarget(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Annuler</button>
              <button onClick={reject} disabled={processing === rejectTarget.id} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60">
                {processing === rejectTarget.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />} Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {messageTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={(e) => e.target === e.currentTarget && setMessageTarget(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900"><MessageSquare className="h-5 w-5 text-[#0094BD]" /> Message au demandeur</h2>
                <p className="mt-0.5 text-sm text-gray-500">{requesterName(messageTarget)} — recherche n°{messageTarget.id}</p>
              </div>
              <button onClick={() => setMessageTarget(null)} className="text-gray-400 hover:text-gray-700" aria-label="Fermer"><X className="h-5 w-5" /></button>
            </div>
            <textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} rows={8} maxLength={5000}
              className="w-full rounded-xl border-2 border-gray-200 p-3 text-sm text-gray-900 outline-none focus:border-[#0094BD]" />
            <p className="mt-1 text-xs text-gray-400">Le demandeur le reçoit dans « Mes messages », avec une notification. Sa réponse arrivera dans Messages.</p>
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setMessageTarget(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Annuler</button>
              <button onClick={sendMessage} disabled={sending || !messageText.trim()} className="inline-flex items-center gap-2 rounded-lg bg-[#0094BD] px-5 py-2 text-sm font-bold text-white hover:bg-[#003B4A] disabled:opacity-60">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Envoyer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
