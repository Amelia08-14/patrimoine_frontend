"use client"

import { useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { AlertCircle, ArrowLeft, Banknote, Building2, Check, Loader2, MapPin, Smartphone, Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type PaymentMethod = "CCP" | "VIREMENT" | "SUR_PLACE" | "BARIDIMOB"

const PAYMENT_METHODS: { id: PaymentMethod; icon: typeof Banknote; labelKey: string }[] = [
  { id: "CCP", icon: Banknote, labelKey: "paymentMethodCCP" },
  { id: "VIREMENT", icon: Building2, labelKey: "paymentMethodVirement" },
  { id: "SUR_PLACE", icon: MapPin, labelKey: "paymentMethodSurPlace" },
  { id: "BARIDIMOB", icon: Smartphone, labelKey: "paymentMethodBaridimob" },
]

/**
 * Étape de confirmation intercalée entre le choix d'une formule (points ou boutique) et l'envoi
 * réel de la commande : récapitulatif explicite ("vous êtes sur le point d'acheter..."), choix du
 * moyen de paiement (CCP/virement/sur place/BaridiMob) et dépôt facultatif du reçu de paiement —
 * demande client du 15/10/2026. Partagée entre /profile/points et /profile/vitrine, qui ont
 * exactement le même besoin (une formule payante validée ensuite par l'admin).
 */
export function PurchaseConfirmStep({
  packLabel, price, points, pointsUnitLabel, color, onBack, onConfirm, submitting, error,
}: {
  packLabel: string
  price: number
  points: number
  pointsUnitLabel: string
  color: string
  onBack: () => void
  onConfirm: (paymentMethod: PaymentMethod, receipt: File | null) => void
  submitting: boolean
  error: string
}) {
  const t = useTranslations("ProfilePoints")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [receipt, setReceipt] = useState<File | null>(null)
  const [methodError, setMethodError] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const submit = () => {
    if (!paymentMethod) { setMethodError(true); return }
    onConfirm(paymentMethod, receipt)
  }

  return (
    <div className="space-y-5">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-500 dark:text-white/50 hover:text-gray-700 dark:hover:text-white/80 transition-colors">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("backToPacksBtn")}
      </button>

      {/* Récapitulatif explicite de l'intention d'achat */}
      <div className="rounded-2xl border-2 p-4 flex items-start gap-3" style={{ borderColor: `${color}40`, backgroundColor: `${color}0D` }}>
        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" style={{ color }} />
        <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
          {t("confirmPurchaseText", { pack: packLabel, points, pointsUnit: pointsUnitLabel, price: price.toLocaleString() })}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {/* Moyen de paiement */}
      <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-white/70 mb-2">{t("paymentMethodLabel")}</label>
        <div className="grid grid-cols-2 gap-2.5">
          {PAYMENT_METHODS.map((m) => {
            const Icon = m.icon
            const active = paymentMethod === m.id
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => { setPaymentMethod(m.id); setMethodError(false) }}
                className={cn(
                  "flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-start",
                  active ? "border-[#00BFA6] bg-[#00BFA6]/5" : "border-gray-200 dark:border-white/10 hover:border-gray-300"
                )}
              >
                <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", active ? "bg-[#00BFA6] text-white" : "bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/50")}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className={cn("text-sm font-bold", active ? "text-[#00908A]" : "text-gray-700 dark:text-white/80")}>{t(m.labelKey)}</span>
              </button>
            )
          })}
        </div>
        {methodError && <p className="text-red-500 text-xs mt-1.5">{t("paymentMethodRequired")}</p>}
      </div>

      {/* Reçu de paiement — facultatif à ce stade, ajoutable plus tard depuis l'historique */}
      <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-white/70 mb-1">{t("receiptLabel")}</label>
        <p className="text-xs text-gray-400 dark:text-white/40 mb-2">{t("receiptHint")}</p>
        <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setReceipt(e.target.files?.[0] || null)} />
        {receipt ? (
          <div className="flex items-center justify-between gap-2 p-3 rounded-xl border-2 border-[#00BFA6] bg-[#00BFA6]/5">
            <span className="flex items-center gap-2 text-sm font-bold text-[#00908A] truncate"><Check className="h-4 w-4 shrink-0" /> {receipt.name}</span>
            <button type="button" onClick={() => setReceipt(null)} className="shrink-0 text-gray-400 hover:text-red-500 transition-colors"><X className="h-4 w-4" /></button>
          </div>
        ) : (
          <button type="button" onClick={() => fileRef.current?.click()} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-white/15 text-gray-500 dark:text-white/50 text-sm font-bold hover:border-[#00BFA6] hover:text-[#00908A] transition-colors">
            <Upload className="h-4 w-4" /> {t("receiptUploadBtn")}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={submitting}
        className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
        style={{ backgroundColor: color }}
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        {t("confirmPurchaseYes")}
      </button>
    </div>
  )
}
