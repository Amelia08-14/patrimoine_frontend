"use client"

import { useEffect, useRef } from "react"
import { CheckCircle2, AlertCircle, Clock, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"

type Variant = "success" | "error" | "wait" | "info"

// Les pages préfixaient leurs messages d'un emoji ("✅ Points crédités", "❌ Erreur", "⏳ ...") : on en
// déduit le ton, et l'emoji est remplacé par une vraie icône.
const PREFIXES: [string, Variant][] = [["✅", "success"], ["❌", "error"], ["⏳", "wait"]]
function parse(message: string, variant?: Variant): { text: string; variant: Variant } {
  for (const [prefix, v] of PREFIXES) {
    if (message.startsWith(prefix)) return { text: message.slice(prefix.length).trim(), variant: variant || v }
  }
  return { text: message, variant: variant || "info" }
}

const STYLES: Record<Variant, { icon: typeof Info; iconBg: string }> = {
  success: { icon: CheckCircle2, iconBg: "bg-emerald-100 text-emerald-600" },
  error: { icon: AlertCircle, iconBg: "bg-red-100 text-red-600" },
  wait: { icon: Clock, iconBg: "bg-amber-100 text-amber-600" },
  info: { icon: Info, iconBg: "bg-[#0094BD]/10 text-[#0094BD]" },
}

/**
 * Message de retour affiché AU CENTRE de l'écran (demande client du 25/10/2026 : les anciens toasts
 * en haut à droite passaient inaperçus). Léger voile derrière, fermeture au clic sur le voile, sur ✕
 * ou avec Échap, et automatique après `durationMs` (0 = reste affiché jusqu'à fermeture).
 * `action` : lien/bouton facultatif sous le texte (ex. "Acheter des points").
 */
export function CenterToast({
  message, onClose, variant, durationMs = 5000, action,
}: { message: string | null | undefined; onClose: () => void; variant?: Variant; durationMs?: number; action?: React.ReactNode }) {
  // Ref : les pages passent souvent `onClose` en fonction inline — sans ref, chaque rendu du parent
  // relancerait le minuteur de fermeture.
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  useEffect(() => {
    if (!message) return
    const close = () => onCloseRef.current()
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close() }
    window.addEventListener("keydown", onKey)
    const timer = durationMs > 0 ? setTimeout(close, durationMs) : undefined
    return () => { window.removeEventListener("keydown", onKey); if (timer) clearTimeout(timer) }
  }, [message, durationMs])

  if (!message) return null
  const { text, variant: v } = parse(message, variant)
  const { icon: Icon, iconBg } = STYLES[v]

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/30 p-4 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role={v === "error" ? "alert" : "status"}
        aria-live={v === "error" ? "assertive" : "polite"}
        className="relative w-full max-w-md rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#03303c] p-6 pe-12 shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <button type="button" onClick={onClose} aria-label="Fermer" className="absolute top-3 end-3 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10">
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-start gap-4">
          <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full", iconBg)}>
            <Icon className="h-6 w-6" />
          </span>
          <div className="min-w-0 pt-1">
            <p className="text-base font-bold leading-snug text-gray-900 dark:text-white">{text}</p>
            {action && <div className="mt-3 text-sm">{action}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
