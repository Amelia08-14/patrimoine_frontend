"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useLocale, useTranslations } from "next-intl"
import axios from "axios"
import { Coins, Store, FileText, Upload, Loader2, Receipt, Clock } from "lucide-react"
import { useLocalizedContent } from "@/lib/typeLabels"
import { CenterToast } from "@/components/CenterToast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
const DATE_LOCALES: Record<string, string> = { fr: "fr-FR", en: "en-US", ar: "ar-DZ" }
const PAYMENT_KEYS: Record<string, string> = {
  CCP: "paymentMethodCCP", VIREMENT: "paymentMethodVirement", SUR_PLACE: "paymentMethodSurPlace", BARIDIMOB: "paymentMethodBaridimob",
}

type OfferPack = { kind: "POINTS" | "BOUTIQUE"; key: string; title: string; titleAr?: string | null; titleEn?: string | null }
type Order = {
  id: number; source: "POINTS" | "BOUTIQUE"; pack: string; price: number; points: number
  status: "PENDING" | "VALIDATED" | "REJECTED"; createdAt: string; paymentMethod: string | null; receiptUrl: string | null
}

/**
 * Message d'erreur d'une commande refusée par l'API : "commande déjà en cours de validation" (code
 * ORDER_PENDING, avec sa date et son montant) traduit, sinon le message brut de l'API. Partagé par
 * les fenêtres d'achat de points (/profile/points) et de boutique (/profile/vitrine).
 */
export function useOrderErrorMessage() {
  const t = useTranslations("ProfilePoints")
  const locale = useLocale()
  return (e: any) => {
    const data = e?.response?.data
    if (data?.code === "ORDER_PENDING") {
      return t("orderPendingError", {
        date: new Date(data.createdAt).toLocaleDateString(DATE_LOCALES[locale] || "fr-FR"),
        amount: Number(data.price).toLocaleString(DATE_LOCALES[locale] || "fr-FR"),
      })
    }
    return data?.message || t("orderError")
  }
}

/**
 * "Mes commandes" — packs de points ET abonnements boutique du client, avec leur statut (en attente /
 * validée / refusée) et le reçu de paiement : consultable, et à joindre ou remplacer tant que la
 * commande est en attente (demande client du 25/10/2026). Affiché sur /profile/points et
 * /profile/vitrine. `reloadKey` : à incrémenter après une nouvelle commande pour rafraîchir la liste.
 */
export function MyOrders({ offerPacks, includeBoutique, reloadKey = 0 }: { offerPacks: OfferPack[]; includeBoutique: boolean; reloadKey?: number }) {
  const t = useTranslations("ProfilePoints")
  const lc = useLocalizedContent()
  const locale = useLocale()
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [uploading, setUploading] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const targetRef = useRef<Order | null>(null)

  const load = useCallback(async () => {
    const token = localStorage.getItem("token")
    if (!token) return
    const headers = { Authorization: `Bearer ${token}` }
    const [points, boutique] = await Promise.all([
      axios.get(`${API_URL}/points/purchases`, { headers }).then((r) => r.data).catch(() => []),
      includeBoutique ? axios.get(`${API_URL}/boutique-sub/my`, { headers }).then((r) => r.data).catch(() => []) : Promise.resolve([]),
    ])
    const merged: Order[] = [
      ...(points as any[]).map((p) => ({ ...p, source: "POINTS" as const })),
      ...(boutique as any[]).map((b) => ({ ...b, source: "BOUTIQUE" as const, points: b.pointsIncluded })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    setOrders(merged)
  }, [includeBoutique])

  useEffect(() => { load() }, [load, reloadKey])

  const packLabel = (o: Order) => {
    const live = offerPacks.find((p) => p.kind === o.source && p.key === o.pack)
    return live ? lc(live.title, live.titleAr, live.titleEn) : o.pack
  }

  const pickReceipt = (o: Order) => {
    targetRef.current = o
    setFeedback(null)
    fileRef.current?.click()
  }

  const uploadReceipt = async (file: File) => {
    const o = targetRef.current
    if (!o) return
    const key = `${o.source}-${o.id}`
    setUploading(key)
    try {
      const fd = new FormData()
      fd.append("receipt", file)
      const url = o.source === "BOUTIQUE" ? `${API_URL}/boutique-sub/${o.id}/receipt` : `${API_URL}/points/purchases/${o.id}/receipt`
      await axios.put(url, fd, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
      setFeedback({ ok: true, text: t("ordersReceiptSent") })
      await load()
    } catch (e: any) {
      setFeedback({ ok: false, text: e?.response?.data?.message || t("ordersReceiptError") })
    } finally {
      setUploading(null)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  if (!orders || orders.length === 0) return null
  const pending = orders.find((o) => o.status === "PENDING")
  const fmtDate = (d: string) => new Date(d).toLocaleDateString(DATE_LOCALES[locale] || "fr-FR")

  return (
    <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm p-5">
      <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => e.target.files?.[0] && uploadReceipt(e.target.files[0])} />
      <h2 className="font-black text-gray-900 dark:text-white mb-1 flex items-center gap-2 text-base"><Receipt className="h-5 w-5 text-[#00BFA6]" /> {t("ordersTitle")}</h2>
      <p className="text-sm text-gray-500 dark:text-white/50 mb-4">{t("ordersSubtitle")}</p>

      {pending && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <Clock className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{t("ordersPendingBanner", { date: fmtDate(pending.createdAt), amount: pending.price.toLocaleString(DATE_LOCALES[locale] || "fr-FR") })}</span>
        </div>
      )}
      <CenterToast message={feedback?.text} variant={feedback?.ok ? "success" : "error"} onClose={() => setFeedback(null)} />

      <div className="divide-y divide-gray-100 dark:divide-white/10">
        {orders.map((o) => {
          const key = `${o.source}-${o.id}`
          const Icon = o.source === "BOUTIQUE" ? Store : Coins
          return (
            <div key={key} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="h-9 w-9 shrink-0 rounded-lg bg-[#00BFA6]/10 flex items-center justify-center">
                  <Icon className="h-4.5 w-4.5 text-[#00BFA6]" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                    {o.source === "BOUTIQUE" ? t("ordersKindBoutique") : t("ordersKindPoints")} · {packLabel(o)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-white/50">
                    {t("ordersLine", { id: o.id, date: fmtDate(o.createdAt), amount: o.price.toLocaleString(DATE_LOCALES[locale] || "fr-FR") })}
                    {o.paymentMethod && PAYMENT_KEYS[o.paymentMethod] ? ` · ${t(PAYMENT_KEYS[o.paymentMethod])}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                  o.status === "VALIDATED" ? "bg-green-100 text-green-700" : o.status === "REJECTED" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                }`}>
                  {o.status === "VALIDATED" ? t("validated") : o.status === "REJECTED" ? t("rejected") : t("pending")}
                </span>
                {o.receiptUrl && (
                  <a href={`${API_URL}${o.receiptUrl}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-[#0094BD] hover:underline">
                    <FileText className="h-3.5 w-3.5" /> {t("ordersViewReceipt")}
                  </a>
                )}
                {o.status === "PENDING" && (
                  <button
                    onClick={() => pickReceipt(o)}
                    disabled={uploading === key}
                    className="inline-flex items-center gap-1.5 rounded-lg border-2 border-[#00BFA6]/40 px-2.5 py-1 text-xs font-bold text-[#00908A] hover:bg-[#00BFA6]/5 disabled:opacity-60 transition-colors"
                  >
                    {uploading === key ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                    {o.receiptUrl ? t("ordersReplaceReceipt") : t("ordersAttachReceipt")}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
