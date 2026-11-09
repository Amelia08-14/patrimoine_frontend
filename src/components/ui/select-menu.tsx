"use client"

import { Children, Fragment, forwardRef, isValidElement, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Check, ChevronDown, Search } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

/**
 * Remplaçant « drop-in » de `<select>` (retour client du 08/11/2026 : « toutes les listes déroulantes à
 * revoir » — la liste native s'affiche à la taille du bureau en émulation mobile et sort de l'écran).
 *
 * - S'utilise EXACTEMENT comme un `<select>` : mêmes props, mêmes `<option>` enfants, compatible
 *   `{...register("x")}` de react-hook-form (le vrai `<select>` reste dans le DOM, masqué : c'est lui qui
 *   porte la valeur, le `name`, le `ref` et reçoit l'événement `change` — `valueAsNumber`, `reset`,
 *   `setValue` continuent de fonctionner).
 * - Le bouton reprend la `className` du select (même apparence) ; le menu est rendu dans un portail en
 *   position fixe, recalé dans l'écran (largeur bornée, ouverture vers le haut s'il manque de place),
 *   donc jamais coupé par un parent `overflow-hidden` ni hors de l'écran sur mobile.
 * - Recherche intégrée au-delà de 12 options (wilayas, communes…).
 * - Si la `className` contient `appearance-none`, l'appelant dessine déjà son propre chevron : on n'en
 *   ajoute pas.
 */

type Opt = { value: string; label: string; disabled: boolean }

const textOf = (node: React.ReactNode): string => {
  if (node === null || node === undefined || typeof node === "boolean") return ""
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(textOf).join("")
  if (isValidElement(node)) return textOf((node.props as any).children)
  return ""
}

const collectOptions = (children: React.ReactNode, out: Opt[] = []): Opt[] => {
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return
    const props = child.props as any
    if (child.type === Fragment || child.type === "optgroup") { collectOptions(props.children, out); return }
    if (child.type === "option") {
      const label = textOf(props.children)
      out.push({ value: props.value !== undefined ? String(props.value) : label, label, disabled: !!props.disabled })
    }
  })
  return out
}

// Un seul minuteur partagé pour relire la valeur des selects non contrôlés (react-hook-form `reset` /
// `setValue` modifient le DOM sans événement) — évite un minuteur par champ.
const watchers = new Set<() => void>()
let ticker: ReturnType<typeof setInterval> | null = null
const watch = (fn: () => void) => {
  watchers.add(fn)
  if (!ticker) ticker = setInterval(() => watchers.forEach((w) => w()), 400)
  return () => {
    watchers.delete(fn)
    if (watchers.size === 0 && ticker) { clearInterval(ticker); ticker = null }
  }
}

type Props = React.SelectHTMLAttributes<HTMLSelectElement>

export const SelectMenu = forwardRef<HTMLSelectElement, Props>(function SelectMenu(
  { className, children, value, defaultValue, disabled, style, ...rest },
  forwardedRef,
) {
  const t = useTranslations("Common")
  const selectRef = useRef<HTMLSelectElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [active, setActive] = useState(-1)
  const [domValue, setDomValue] = useState<string>(value !== undefined ? String(value) : defaultValue !== undefined ? String(defaultValue) : "")
  const [pos, setPos] = useState<{ top: number; left: number; width: number; maxHeight: number; up: boolean } | null>(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const options = useMemo(() => collectOptions(children), [children])
  const controlled = value !== undefined
  const current = controlled ? String(value ?? "") : domValue
  const selected = options.find((o) => o.value === current) ?? (current === "" ? options.find((o) => o.value === "") : undefined)

  const setRefs = useCallback((el: HTMLSelectElement | null) => {
    selectRef.current = el
    if (typeof forwardedRef === "function") forwardedRef(el)
    else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLSelectElement | null>).current = el
  }, [forwardedRef])

  // Valeur des selects non contrôlés : lue au montage puis surveillée.
  useEffect(() => {
    if (controlled) return
    const sync = () => { const el = selectRef.current; if (el && el.value !== domValue) setDomValue(el.value) }
    sync()
    return watch(sync)
  }, [controlled, domValue])

  const q = query.trim().toLowerCase()
  const shown = q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options
  const searchable = options.length > 12

  const place = useCallback(() => {
    const b = buttonRef.current
    if (!b) return
    const r = b.getBoundingClientRect()
    const vw = window.innerWidth, vh = window.innerHeight
    const width = Math.min(Math.max(r.width, 200), vw - 16)
    const left = Math.min(Math.max(r.left, 8), vw - width - 8)
    const below = vh - r.bottom - 12, above = r.top - 12
    const wanted = Math.min(320, options.length * 40 + (searchable ? 52 : 0) + 12)
    const up = below < Math.min(wanted, 220) && above > below
    const maxHeight = Math.max(140, Math.min(320, up ? above : below))
    setPos({ top: up ? r.top - 6 : r.bottom + 6, left, width, maxHeight, up })
  }, [options.length, searchable])

  useLayoutEffect(() => { if (open) place() }, [open, place])
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      const tgt = e.target as Node
      if (panelRef.current?.contains(tgt) || buttonRef.current?.contains(tgt)) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); buttonRef.current?.focus() } }
    const onMove = () => place()
    document.addEventListener("pointerdown", onDown)
    document.addEventListener("keydown", onKey)
    window.addEventListener("resize", onMove)
    window.addEventListener("scroll", onMove, true)
    return () => {
      document.removeEventListener("pointerdown", onDown)
      document.removeEventListener("keydown", onKey)
      window.removeEventListener("resize", onMove)
      window.removeEventListener("scroll", onMove, true)
    }
  }, [open, place])
  useEffect(() => {
    if (!open) { setQuery(""); return }
    setActive(Math.max(0, shown.findIndex((o) => o.value === current)))
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (disabled) setOpen(false) }, [disabled])
  // Garde l'option active visible pendant la navigation au clavier.
  useEffect(() => {
    if (!open || active < 0) return
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`)?.scrollIntoView({ block: "nearest" })
  }, [active, open])

  const choose = (o: Opt) => {
    if (o.disabled) return
    const el = selectRef.current
    if (el) {
      // Passe par le vrai <select> : React / react-hook-form reçoivent un « change » natif normal.
      const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value")?.set
      setter ? setter.call(el, o.value) : (el.value = o.value)
      el.dispatchEvent(new Event("change", { bubbles: true }))
      if (!controlled) setDomValue(el.value)
    }
    setOpen(false)
    buttonRef.current?.focus()
  }

  const onButtonKey = (e: React.KeyboardEvent) => {
    if (disabled) return
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ")) { e.preventDefault(); setOpen(true); return }
    if (!open) return
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(shown.length - 1, i + 1)) }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(0, i - 1)) }
    else if (e.key === "Enter") { e.preventDefault(); const o = shown[active]; if (o) choose(o) }
  }

  const ownChevron = !(className || "").includes("appearance-none")
  const isPlaceholder = !selected || selected.value === ""
  const finePointer = typeof window !== "undefined" && window.matchMedia?.("(pointer: fine)").matches

  return (
    <>
      <select
        ref={setRefs}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        {...rest}
      >
        {children}
      </select>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onButtonKey}
        style={style}
        className={cn(className, "flex items-center justify-between gap-2 text-start disabled:cursor-not-allowed")}
      >
        {/* Pas de flex-1 : un select compact (unité de prix dans un champ) garde la largeur de son texte. */}
        <span className={cn("min-w-0 truncate", isPlaceholder && "opacity-70")}>{selected?.label ?? ""}</span>
        {ownChevron && <ChevronDown className={cn("h-4 w-4 shrink-0 opacity-60 transition-transform", open && "rotate-180")} />}
      </button>
      {mounted && open && pos && createPortal(
        <div
          ref={panelRef}
          role="listbox"
          className="fixed z-[200] flex flex-col overflow-hidden rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#03303c] shadow-2xl shadow-black/15 animate-in fade-in zoom-in-95 duration-100"
          style={{ left: pos.left, width: pos.width, maxHeight: pos.maxHeight, ...(pos.up ? { bottom: window.innerHeight - pos.top } : { top: pos.top }) }}
        >
          {searchable && (
            <div className="p-2 border-b border-gray-100 dark:border-white/10 shrink-0">
              <div className="flex items-center gap-2 rounded-lg bg-gray-50 dark:bg-white/5 px-2.5">
                <Search className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <input
                  autoFocus={finePointer}
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setActive(0) }}
                  onKeyDown={onButtonKey}
                  placeholder={t("searchPlaceholder")}
                  className="w-full bg-transparent py-2 text-sm text-gray-800 dark:text-white outline-none placeholder:text-gray-400"
                />
              </div>
            </div>
          )}
          <div ref={listRef} className="overflow-y-auto overscroll-contain p-1">
            {shown.length === 0 ? (
              <p className="px-3 py-3 text-center text-sm text-gray-400">{t("noResults")}</p>
            ) : shown.map((o, i) => {
              const isSel = o.value === current
              return (
                <button
                  key={`${o.value}-${i}`}
                  type="button"
                  role="option"
                  data-idx={i}
                  aria-selected={isSel}
                  disabled={o.disabled}
                  onClick={() => choose(o)}
                  onMouseEnter={() => setActive(i)}
                  className={cn(
                    "w-full flex items-center gap-2 rounded-lg px-3 py-2 text-start text-sm transition-colors",
                    o.disabled ? "cursor-not-allowed text-gray-300 dark:text-white/25" : "text-gray-800 dark:text-white/90",
                    i === active && !o.disabled && "bg-gray-50 dark:bg-white/5",
                    isSel && "font-bold text-[#00908A] dark:text-[#5EEAD4] bg-[#00BFA6]/10",
                    o.value === "" && !isSel && "text-gray-500 dark:text-white/50",
                  )}
                >
                  <span className="min-w-0 flex-1">{o.label}</span>
                  {isSel && <Check className="h-3.5 w-3.5 shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>,
        document.body,
      )}
    </>
  )
})
