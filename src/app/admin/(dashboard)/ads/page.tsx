"use client"

import { useCallback, useEffect, useState } from "react"
import axios from "axios"
import { Megaphone, Plus, Pencil, Trash2, Loader2, Eye, MousePointerClick, X, Save, ImageIcon } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const PLACEMENTS = [
  { id: "SIDEBAR", label: "Colonnes latérales", hint: "Grands encarts verticaux (grands écrans)" },
  { id: "STRIP", label: "Bandeaux compacts", hint: "Entre les catégories de l'accueil, et sur mobile / tablette" },
  { id: "BANNER", label: "Bandeau principal", hint: "Grand bandeau défilant en haut de /announces" },
] as const
const CATEGORIES = [
  { id: "RESIDENTIEL", label: "Résidentiel" },
  { id: "BUREAUX_COMMERCES", label: "Bureaux et Commerces" },
  { id: "INDUSTRIEL", label: "Industriel" },
  { id: "TERRAIN_FONCIER", label: "Terrains et Foncier" },
  { id: "HOTELIER", label: "Hôtellerie & Séjour" },
] as const
const PAGES = [
  { id: "HOME", label: "Accueil" },
  { id: "ANNOUNCES", label: "Annonces" },
  { id: "DEMANDES", label: "Demandes en cours" },
] as const

type Ad = {
  id: number; name: string; imageUrl: string; link: string | null
  title: string | null; titleAr: string | null; titleEn: string | null
  subtitle: string | null; subtitleAr: string | null; subtitleEn: string | null
  buttonLabel: string | null; buttonLabelAr: string | null; buttonLabelEn: string | null
  placements: string; pages: string; categories: string; isActive: boolean
  startDate: string | null; endDate: string | null; order: number
  views: number; clicks: number
}

type Draft = {
  name: string; link: string
  title: string; titleAr: string; titleEn: string
  subtitle: string; subtitleAr: string; subtitleEn: string
  buttonLabel: string; buttonLabelAr: string; buttonLabelEn: string
  placements: string[]; pages: string[]; categories: string[]; isActive: boolean
  startDate: string; endDate: string; order: string
}

const emptyDraft = (): Draft => ({
  name: "", link: "", title: "", titleAr: "", titleEn: "", subtitle: "", subtitleAr: "", subtitleEn: "",
  buttonLabel: "", buttonLabelAr: "", buttonLabelEn: "",
  placements: PLACEMENTS.map((p) => p.id), pages: PAGES.map((p) => p.id), categories: [], isActive: true, startDate: "", endDate: "", order: "0",
})
const toDraft = (a: Ad): Draft => ({
  name: a.name, link: a.link || "",
  title: a.title || "", titleAr: a.titleAr || "", titleEn: a.titleEn || "",
  subtitle: a.subtitle || "", subtitleAr: a.subtitleAr || "", subtitleEn: a.subtitleEn || "",
  buttonLabel: a.buttonLabel || "", buttonLabelAr: a.buttonLabelAr || "", buttonLabelEn: a.buttonLabelEn || "",
  placements: a.placements.split(",").filter(Boolean), pages: a.pages.split(",").filter(Boolean), categories: (a.categories || "").split(",").filter(Boolean), isActive: a.isActive,
  startDate: a.startDate ? a.startDate.slice(0, 10) : "", endDate: a.endDate ? a.endDate.slice(0, 10) : "", order: String(a.order),
})

const input = "w-full h-10 px-3 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 outline-none focus:border-[#0094BD] focus:ring-1 focus:ring-[#0094BD]"

export default function AdminAdsPage() {
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Ad | "new" | null>(null)
  const [draft, setDraft] = useState<Draft>(emptyDraft())
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("admin_token")}` })

  const load = useCallback(() => {
    setLoading(true)
    axios.get(`${API_URL}/admin/ads`, { headers: headers() })
      .then((r) => setAds(r.data))
      .catch(() => setAds([]))
      .finally(() => setLoading(false))
  }, [])
  useEffect(load, [load])

  const openNew = () => { setDraft(emptyDraft()); setFile(null); setError(""); setEditing("new") }
  const openEdit = (a: Ad) => { setDraft(toDraft(a)); setFile(null); setError(""); setEditing(a) }
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }))
  const toggle = (k: "placements" | "pages" | "categories", id: string) =>
    setDraft((d) => ({ ...d, [k]: d[k].includes(id) ? d[k].filter((x) => x !== id) : [...d[k], id] }))

  const save = async () => {
    if (!draft.name.trim()) { setError("Donnez un nom interne à la publicité."); return }
    if (editing === "new" && !file) { setError("Ajoutez une image."); return }
    if (draft.placements.length === 0 || draft.pages.length === 0) { setError("Choisissez au moins une page et un emplacement."); return }
    setSaving(true); setError("")
    try {
      const fd = new FormData()
      Object.entries({
        name: draft.name, link: draft.link,
        title: draft.title, titleAr: draft.titleAr, titleEn: draft.titleEn,
        subtitle: draft.subtitle, subtitleAr: draft.subtitleAr, subtitleEn: draft.subtitleEn,
        buttonLabel: draft.buttonLabel, buttonLabelAr: draft.buttonLabelAr, buttonLabelEn: draft.buttonLabelEn,
        placements: draft.placements.join(","), pages: draft.pages.join(","), categories: draft.categories.join(","),
        isActive: String(draft.isActive), startDate: draft.startDate, endDate: draft.endDate, order: draft.order || "0",
      }).forEach(([k, v]) => fd.append(k, v))
      if (file) fd.append("image", file)
      if (editing === "new") await axios.post(`${API_URL}/admin/ads`, fd, { headers: headers() })
      else if (editing) await axios.put(`${API_URL}/admin/ads/${editing.id}`, fd, { headers: headers() })
      setEditing(null)
      load()
    } catch (e: any) {
      setError(e?.response?.data?.message || "Enregistrement impossible.")
    } finally { setSaving(false) }
  }

  const quickToggle = async (a: Ad) => {
    const fd = new FormData(); fd.append("isActive", String(!a.isActive))
    await axios.put(`${API_URL}/admin/ads/${a.id}`, fd, { headers: headers() }).catch(() => {})
    load()
  }
  const remove = async (a: Ad) => {
    if (!confirm(`Supprimer la publicité « ${a.name} » ?`)) return
    await axios.delete(`${API_URL}/admin/ads/${a.id}`, { headers: headers() }).catch(() => {})
    load()
  }

  const statusOf = (a: Ad) => {
    const now = Date.now()
    if (!a.isActive) return { label: "Désactivée", cls: "bg-gray-100 text-gray-600" }
    if (a.startDate && new Date(a.startDate).getTime() > now) return { label: "Programmée", cls: "bg-blue-100 text-blue-700" }
    if (a.endDate && new Date(a.endDate).getTime() < now) return { label: "Expirée", cls: "bg-red-100 text-red-700" }
    return { label: "En ligne", cls: "bg-emerald-100 text-emerald-700" }
  }
  const label = (list: readonly { id: string; label: string }[], csv: string) =>
    csv.split(",").filter(Boolean).map((id) => list.find((x) => x.id === id)?.label || id).join(" · ")
  const ctr = (a: Ad) => (a.views > 0 ? `${((a.clicks / a.views) * 100).toFixed(1)} %` : "—")

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Megaphone className="h-6 w-6 text-[#0094BD]" /> Publicités</h1>
          <p className="text-sm text-gray-500 mt-1">Colonnes latérales, bandeaux et bandeau principal — pour l'accueil, les annonces et les demandes en cours.</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 rounded-lg bg-[#0094BD] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#003B4A]">
          <Plus className="h-4 w-4" /> Nouvelle publicité
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
      ) : ads.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
          Aucune publicité. Tant qu'il n'y en a pas, le site affiche ses encarts par défaut (slides d'accueil, « Déposer une annonce », « Boutique »).
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {ads.map((a) => {
            const st = statusOf(a)
            return (
              <div key={a.id} className="flex gap-4 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${API_URL}${a.imageUrl}`} alt="" className="h-28 w-24 sm:w-32 shrink-0 rounded-lg object-cover bg-gray-100" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-gray-900 truncate">{a.name}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${st.cls}`}>{st.label}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 truncate">{label(PAGES, a.pages)}</p>
                  <p className="text-xs text-gray-500 truncate">Catégories : {a.categories ? label(CATEGORIES, a.categories) : "toutes"}</p>
                  <p className="text-xs text-gray-500 truncate">{label(PLACEMENTS, a.placements)}</p>
                  {(a.startDate || a.endDate) && (
                    <p className="text-xs text-gray-400">{a.startDate ? new Date(a.startDate).toLocaleDateString("fr-FR") : "…"} → {a.endDate ? new Date(a.endDate).toLocaleDateString("fr-FR") : "…"}</p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
                    <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {a.views}</span>
                    <span className="inline-flex items-center gap-1"><MousePointerClick className="h-3.5 w-3.5" /> {a.clicks}</span>
                    <span>Taux de clic {ctr(a)}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <button onClick={() => quickToggle(a)} className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                      {a.isActive ? "Désactiver" : "Activer"}
                    </button>
                    <button onClick={() => openEdit(a)} className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"><Pencil className="h-3 w-3" /> Modifier</button>
                    <button onClick={() => remove(a)} className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"><Trash2 className="h-3 w-3" /> Supprimer</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
          <div className="my-8 w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{editing === "new" ? "Nouvelle publicité" : "Modifier la publicité"}</h2>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-700"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block text-sm font-semibold text-gray-700">Nom interne *
                  <input className={`${input} mt-1`} value={draft.name} onChange={(e) => set("name", e.target.value)} placeholder="Ex : Promotion Résidence El Yasmine" />
                </label>
                <label className="block text-sm font-semibold text-gray-700">Lien au clic
                  <input className={`${input} mt-1`} value={draft.link} onChange={(e) => set("link", e.target.value)} placeholder="/announces ou https://…" />
                </label>
              </div>

              <div>
                <p className="mb-1 text-sm font-semibold text-gray-700">Image {editing === "new" && "*"}</p>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed border-gray-300 p-3 hover:border-[#0094BD]">
                  <ImageIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">{file ? file.name : editing !== "new" ? "Remplacer l'image (facultatif)" : "Choisir une image"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </label>
                <p className="mt-1 text-xs text-gray-400">Idéalement en portrait pour les colonnes (ex. 600×1000) ; elle est recadrée automatiquement pour les bandeaux.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {([["", "Français"], ["Ar", "العربية"], ["En", "English"]] as const).map(([sfx, lang]) => (
                  <div key={lang} className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-400">{lang}</p>
                    <input className={input} dir={sfx === "Ar" ? "rtl" : undefined} placeholder="Titre" value={(draft as any)[`title${sfx}`]} onChange={(e) => set(`title${sfx}` as keyof Draft, e.target.value as any)} />
                    <input className={input} dir={sfx === "Ar" ? "rtl" : undefined} placeholder="Sous-titre" value={(draft as any)[`subtitle${sfx}`]} onChange={(e) => set(`subtitle${sfx}` as keyof Draft, e.target.value as any)} />
                    <input className={input} dir={sfx === "Ar" ? "rtl" : undefined} placeholder="Texte du bouton" value={(draft as any)[`buttonLabel${sfx}`]} onChange={(e) => set(`buttonLabel${sfx}` as keyof Draft, e.target.value as any)} />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <p className="mb-2 text-sm font-semibold text-gray-700">Pages</p>
                  <div className="flex flex-wrap gap-2">
                    {PAGES.map((p) => (
                      <button key={p.id} type="button" onClick={() => toggle("pages", p.id)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-bold ${draft.pages.includes(p.id) ? "border-[#0094BD] bg-[#0094BD] text-white" : "border-gray-300 text-gray-600 hover:border-[#0094BD]"}`}>{p.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-semibold text-gray-700">Emplacements</p>
                  <div className="space-y-1.5">
                    {PLACEMENTS.map((p) => (
                      <label key={p.id} className="flex items-start gap-2 text-sm text-gray-700">
                        <input type="checkbox" className="mt-1 accent-[#0094BD]" checked={draft.placements.includes(p.id)} onChange={() => toggle("placements", p.id)} />
                        <span><b>{p.label}</b> <span className="text-xs text-gray-400">— {p.hint}</span></span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-1 text-sm font-semibold text-gray-700">Catégories ciblées</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button key={c.id} type="button" onClick={() => toggle("categories", c.id)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-bold ${draft.categories.includes(c.id) ? "border-[#0094BD] bg-[#0094BD] text-white" : "border-gray-300 text-gray-600 hover:border-[#0094BD]"}`}>{c.label}</button>
                  ))}
                </div>
                <p className="mt-1 text-xs text-gray-400">Aucune sélection = affichée partout. Avec une sélection, la publicité passe en priorité quand le visiteur consulte cette catégorie (filtre de /announces, de l'accueil ou des demandes) et reste visible sans filtre.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="block text-sm font-semibold text-gray-700">Début
                  <input type="date" className={`${input} mt-1`} value={draft.startDate} onChange={(e) => set("startDate", e.target.value)} />
                </label>
                <label className="block text-sm font-semibold text-gray-700">Fin
                  <input type="date" className={`${input} mt-1`} value={draft.endDate} onChange={(e) => set("endDate", e.target.value)} />
                </label>
                <label className="block text-sm font-semibold text-gray-700">Ordre
                  <input type="number" className={`${input} mt-1`} value={draft.order} onChange={(e) => set("order", e.target.value)} />
                </label>
                <label className="flex items-end gap-2 pb-2 text-sm font-semibold text-gray-700">
                  <input type="checkbox" className="h-4 w-4 accent-[#0094BD]" checked={draft.isActive} onChange={(e) => set("isActive", e.target.checked)} /> Active
                </label>
              </div>

              {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setEditing(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Annuler</button>
                <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-[#0094BD] px-5 py-2 text-sm font-bold text-white hover:bg-[#003B4A] disabled:opacity-60">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
