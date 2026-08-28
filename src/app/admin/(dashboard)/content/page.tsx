"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  FileText, HelpCircle, Handshake, Phone, Plus, Trash2, Save, Loader2,
  ArrowUp, ArrowDown, Check, Upload, Eye, EyeOff, Building, Hotel, PartyPopper, Warehouse, Pencil, ImageOff,
  Mail, MapPin, MessageCircle, Send, Briefcase, Scale, Wrench, Globe,
} from "lucide-react"
import { LegalRichEditor } from "@/components/admin/LegalRichEditor"
import { SUB_CATEGORY_LABELS, subCategoriesForPole, type ActivityPole } from "@/data/activityPoles"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const getHeaders = (json = true) => {
  const token = localStorage.getItem('admin_token')
  return json
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { Authorization: `Bearer ${token}` }
}

type Tab = 'LEGAL' | 'FAQ' | 'PARTNERS' | 'CONTACT'

const PARTNER_CATEGORIES: { id: ActivityPole; label: string; icon: typeof Building }[] = [
  { id: 'IMMOBILIER', label: 'Activité immobilière', icon: Building },
  { id: 'HOTELLERIE', label: 'Activité hôtelière et hébergement', icon: Hotel },
  { id: 'EVENEMENTIEL', label: 'Activité évènementiel', icon: PartyPopper },
  { id: 'ENTREPOSAGE', label: "Activité d'entreposage et stockage", icon: Warehouse },
]

// Libellés courts pour l'affichage compact (badges, puces déjà annotées d'une icône)
const POLE_SHORT_LABELS: Record<string, string> = {
  IMMOBILIER: 'Immobilier',
  HOTELLERIE: 'Hôtellerie',
  EVENEMENTIEL: 'Événementiel',
  ENTREPOSAGE: 'Entreposage',
}

export default function AdminContentPage() {
  const [tab, setTab] = useState<Tab>('LEGAL')

  const TABS: { id: Tab; label: string; icon: any }[] = [
    { id: 'LEGAL', label: 'Pages légales', icon: FileText },
    { id: 'FAQ', label: 'FAQ', icon: HelpCircle },
    { id: 'PARTNERS', label: 'Partenaires', icon: Handshake },
    { id: 'CONTACT', label: 'Contact & Support', icon: Phone },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#003B4A] font-brand">Contenu du site</h1>
        <p className="text-gray-500">CGU, Confidentialité, FAQ, Partenaires, Contact — modifiables sans intervention développeur.</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${tab === t.id ? 'bg-[#00BFA6] text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#00BFA6] hover:text-[#00BFA6]'}`}>
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'LEGAL' && <LegalTab />}
      {tab === 'FAQ' && <FaqTab />}
      {tab === 'PARTNERS' && <PartnersTab />}
      {tab === 'CONTACT' && <ContactTab />}
    </div>
  )
}

// ───────────────────────── Pages légales ─────────────────────────

function LegalTab() {
  const [page, setPage] = useState<'CGU' | 'CONFIDENTIALITE'>('CGU')
  const [sections, setSections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<number | null>(null)
  const [newTitle, setNewTitle] = useState("")
  const [newBody, setNewBody] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/admin/content/legal/${page}`, { headers: getHeaders(false) as any })
      if (res.ok) setSections(await res.json())
    } finally { setLoading(false) }
  }, [page])

  useEffect(() => { load() }, [load])

  const updateSection = async (id: number, data: any) => {
    setSaving(id)
    try {
      const res = await fetch(`${API_URL}/admin/content/legal/section/${id}`, { method: 'PUT', headers: getHeaders() as any, body: JSON.stringify(data) })
      if (res.ok) await load()
    } finally { setSaving(null) }
  }

  const deleteSection = async (id: number) => {
    if (!confirm("Supprimer cette section ?")) return
    await fetch(`${API_URL}/admin/content/legal/section/${id}`, { method: 'DELETE', headers: getHeaders() as any })
    await load()
  }

  const move = async (index: number, dir: -1 | 1) => {
    const target = sections[index + dir]
    if (!target) return
    const current = sections[index]
    await Promise.all([
      updateSection(current.id, { order: target.order }),
      updateSection(target.id, { order: current.order }),
    ])
  }

  const addSection = async () => {
    if (!newTitle.trim() || !newBody.trim()) return
    await fetch(`${API_URL}/admin/content/legal/${page}`, {
      method: 'POST', headers: getHeaders() as any,
      body: JSON.stringify({ title: newTitle, body: newBody, order: sections.length }),
    })
    setNewTitle(""); setNewBody("")
    await load()
  }

  return (
    <div className="space-y-4">
      <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-0.5 w-fit">
        {(['CGU', 'CONFIDENTIALITE'] as const).map(p => (
          <button key={p} onClick={() => setPage(p)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${page === p ? 'bg-gray-900 text-white' : 'text-gray-500'}`}>
            {p === 'CGU' ? 'CGU' : 'Politique de Confidentialité'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
      ) : (
        <div className="space-y-3">
          {sections.map((s, i) => (
            <div key={s.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <input
                  defaultValue={s.title}
                  onBlur={(e) => e.target.value !== s.title && updateSection(s.id, { title: e.target.value })}
                  className="font-bold text-gray-900 text-sm flex-1 outline-none border-b border-transparent focus:border-[#00BFA6] pb-1"
                />
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => move(i, -1)} disabled={i === 0} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ArrowUp className="h-3.5 w-3.5" /></button>
                  <button onClick={() => move(i, 1)} disabled={i === sections.length - 1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ArrowDown className="h-3.5 w-3.5" /></button>
                  <button onClick={() => deleteSection(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                  {saving === s.id && <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />}
                </div>
              </div>
              <LegalRichEditor
                initialHtml={s.body}
                published={s.published}
                saving={saving === s.id}
                onSave={(html) => updateSection(s.id, { body: html })}
                onPublish={(html) => updateSection(s.id, { body: html, published: true })}
              />
            </div>
          ))}

          <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-5 space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ajouter une section</p>
            <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Titre de la section" className="w-full text-sm font-bold outline-none border border-gray-200 rounded-xl p-3 bg-white" />
            <textarea value={newBody} onChange={(e) => setNewBody(e.target.value)} placeholder="Contenu..." rows={3} className="w-full text-sm outline-none border border-gray-200 rounded-xl p-3 bg-white" />
            <Button onClick={addSection} className="bg-[#00BFA6] hover:bg-[#00908A] text-white"><Plus className="h-4 w-4 mr-1" /> Ajouter</Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ───────────────────────── FAQ ─────────────────────────

function FaqTab() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newQ, setNewQ] = useState("")
  const [newA, setNewA] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/admin/content/faq`, { headers: getHeaders(false) as any })
      if (res.ok) setItems(await res.json())
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const update = async (id: number, data: any) => {
    await fetch(`${API_URL}/admin/content/faq/${id}`, { method: 'PUT', headers: getHeaders() as any, body: JSON.stringify(data) })
    await load()
  }

  const remove = async (id: number) => {
    if (!confirm("Supprimer cette question ?")) return
    await fetch(`${API_URL}/admin/content/faq/${id}`, { method: 'DELETE', headers: getHeaders() as any })
    await load()
  }

  const move = async (index: number, dir: -1 | 1) => {
    const target = items[index + dir]
    if (!target) return
    const current = items[index]
    await Promise.all([
      update(current.id, { order: target.order }),
      update(target.id, { order: current.order }),
    ])
  }

  const add = async () => {
    if (!newQ.trim() || !newA.trim()) return
    await fetch(`${API_URL}/admin/content/faq`, { method: 'POST', headers: getHeaders() as any, body: JSON.stringify({ question: newQ, answer: newA, order: items.length }) })
    setNewQ(""); setNewA("")
    await load()
  }

  if (loading) return <div className="text-center py-10 text-gray-400"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>

  return (
    <div className="space-y-3">
      {items.map((f, i) => (
        <div key={f.id} className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <input defaultValue={f.question} onBlur={(e) => e.target.value !== f.question && update(f.id, { question: e.target.value })}
              className="font-bold text-gray-900 text-sm flex-1 outline-none border-b border-transparent focus:border-[#00BFA6] pb-1" />
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => update(f.id, { published: !f.published })} className="p-1.5 rounded-lg hover:bg-gray-100" title={f.published ? 'Publié' : 'Masqué'}>
                {f.published ? <Eye className="h-3.5 w-3.5 text-green-600" /> : <EyeOff className="h-3.5 w-3.5 text-gray-400" />}
              </button>
              <button onClick={() => move(i, -1)} disabled={i === 0} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ArrowUp className="h-3.5 w-3.5" /></button>
              <button onClick={() => move(i, 1)} disabled={i === items.length - 1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ArrowDown className="h-3.5 w-3.5" /></button>
              <button onClick={() => remove(f.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
          <textarea defaultValue={f.answer} onBlur={(e) => e.target.value !== f.answer && update(f.id, { answer: e.target.value })} rows={2}
            className="w-full text-sm text-gray-600 outline-none border border-gray-200 rounded-xl p-3 focus:border-[#00BFA6]" />
        </div>
      ))}

      <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-5 space-y-3">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ajouter une question</p>
        <input value={newQ} onChange={(e) => setNewQ(e.target.value)} placeholder="Question" className="w-full text-sm font-bold outline-none border border-gray-200 rounded-xl p-3 bg-white" />
        <textarea value={newA} onChange={(e) => setNewA(e.target.value)} placeholder="Réponse" rows={2} className="w-full text-sm outline-none border border-gray-200 rounded-xl p-3 bg-white" />
        <Button onClick={add} className="bg-[#00BFA6] hover:bg-[#00908A] text-white"><Plus className="h-4 w-4 mr-1" /> Ajouter</Button>
      </div>
    </div>
  )
}

// ───────────────────────── Partenaires ─────────────────────────

// Ligne de puces cliquables : sélection unique parmi une liste d'options
function ChipRow({ options, value, onChange, activeClassName }: {
  options: { id: string; label: string; icon?: typeof Building }[]
  value: string
  onChange: (id: string) => void
  activeClassName: string
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((o) => {
        const Icon = o.icon
        const isActive = value === o.id
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(isActive ? "" : o.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${
              isActive ? activeClassName : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

function PartnerLogo({ logoUrl, name, size = "h-16 w-16" }: { logoUrl: string | null; name: string; size?: string }) {
  return (
    <div className={`${size} rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 shrink-0`}>
      {logoUrl ? (
        <img src={`${API_URL}${logoUrl}`} alt={name} className="h-full w-full object-contain p-1.5" />
      ) : (
        <div className="flex flex-col items-center gap-1 text-gray-300">
          <ImageOff className="h-5 w-5" />
        </div>
      )}
    </div>
  )
}

function PartnersTab() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState("")
  const [newUrl, setNewUrl] = useState("")
  const [newCategory, setNewCategory] = useState<string>("")
  const [newSubCategory, setNewSubCategory] = useState<string>("")
  const [newLogo, setNewLogo] = useState<File | null>(null)
  const [adding, setAdding] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL")
  const [subCategoryFilter, setSubCategoryFilter] = useState<string>("ALL")
  const [editingId, setEditingId] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/admin/content/partners`, { headers: getHeaders(false) as any })
      if (res.ok) setItems(await res.json())
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const togglePublished = async (p: any) => {
    const fd = new FormData()
    fd.append('published', String(!p.published))
    await fetch(`${API_URL}/admin/content/partners/${p.id}`, { method: 'PUT', headers: getHeaders(false) as any, body: fd })
    await load()
  }

  const changeCategory = async (p: any, category: string) => {
    const fd = new FormData()
    fd.append('category', category)
    // Changer de pôle invalide la sous-catégorie précédente (elle appartenait à l'ancien pôle)
    fd.append('subCategory', '')
    await fetch(`${API_URL}/admin/content/partners/${p.id}`, { method: 'PUT', headers: getHeaders(false) as any, body: fd })
    await load()
  }

  const changeSubCategory = async (p: any, subCategory: string) => {
    const fd = new FormData()
    fd.append('subCategory', subCategory)
    await fetch(`${API_URL}/admin/content/partners/${p.id}`, { method: 'PUT', headers: getHeaders(false) as any, body: fd })
    await load()
  }

  const remove = async (id: number) => {
    if (!confirm("Supprimer ce partenaire ?")) return
    await fetch(`${API_URL}/admin/content/partners/${id}`, { method: 'DELETE', headers: getHeaders(false) as any })
    await load()
  }

  const add = async () => {
    if (!newName.trim()) return
    setAdding(true)
    try {
      const fd = new FormData()
      fd.append('name', newName)
      if (newUrl) fd.append('websiteUrl', newUrl)
      if (newCategory) fd.append('category', newCategory)
      if (newSubCategory) fd.append('subCategory', newSubCategory)
      fd.append('order', String(items.length))
      if (newLogo) fd.append('logo', newLogo)
      await fetch(`${API_URL}/admin/content/partners`, { method: 'POST', headers: getHeaders(false) as any, body: fd })
      setNewName(""); setNewUrl(""); setNewCategory(""); setNewSubCategory(""); setNewLogo(null)
      await load()
    } finally { setAdding(false) }
  }

  if (loading) return <div className="text-center py-10 text-gray-400"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>

  const filteredItems = items.filter((p) => {
    if (categoryFilter !== "ALL" && p.category !== categoryFilter) return false
    if (subCategoryFilter !== "ALL" && p.subCategory !== subCategoryFilter) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Filtre par catégorie — cliquable */}
      <ChipRow
        options={[{ id: "ALL", label: "Toutes catégories" }, ...PARTNER_CATEGORIES]}
        value={categoryFilter}
        onChange={(id) => { setCategoryFilter(id || "ALL"); setSubCategoryFilter("ALL") }}
        activeClassName="bg-[#003B4A] border-[#003B4A] text-white"
      />

      {/* Sous-catégories de la catégorie filtrée, pour affiner */}
      {categoryFilter !== "ALL" && (
        <ChipRow
          options={[{ id: "ALL", label: "Toutes sous-catégories" }, ...subCategoriesForPole(categoryFilter as ActivityPole)]}
          value={subCategoryFilter}
          onChange={(id) => setSubCategoryFilter(id || "ALL")}
          activeClassName="bg-[#00BFA6] border-[#00BFA6] text-white"
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((p) => {
          const catDef = PARTNER_CATEGORIES.find(c => c.id === p.category)
          const isEditing = editingId === p.id
          return (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col items-center text-center gap-2.5 hover:shadow-sm transition-shadow">
              <PartnerLogo logoUrl={p.logoUrl} name={p.name} />
              <p className="font-bold text-gray-900 text-sm">{p.name}</p>
              {p.websiteUrl && <p className="text-xs text-gray-400 truncate max-w-full">{p.websiteUrl}</p>}

              {!isEditing ? (
                <div className="flex flex-col items-center gap-1">
                  {catDef ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold rounded-full px-2.5 py-1 bg-[#00BFA6]/10 text-[#00BFA6]">
                      <catDef.icon className="h-3 w-3" /> {POLE_SHORT_LABELS[p.category] || catDef.label}
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold rounded-full px-2.5 py-1 bg-gray-100 text-gray-400">Sans catégorie</span>
                  )}
                  {p.subCategory && (
                    <span className="text-[10px] text-gray-400">{SUB_CATEGORY_LABELS[p.subCategory] || p.subCategory}</span>
                  )}
                </div>
              ) : (
                <div className="w-full space-y-2 text-left bg-gray-50 rounded-xl p-3">
                  <ChipRow
                    options={PARTNER_CATEGORIES.map(c => ({ id: c.id, label: POLE_SHORT_LABELS[c.id], icon: c.icon }))}
                    value={p.category || ""}
                    onChange={(id) => changeCategory(p, id)}
                    activeClassName="bg-[#00BFA6] border-[#00BFA6] text-white"
                  />
                  {p.category && (
                    <ChipRow
                      options={subCategoriesForPole(p.category as ActivityPole)}
                      value={p.subCategory || ""}
                      onChange={(id) => changeSubCategory(p, id)}
                      activeClassName="bg-[#003B4A] border-[#003B4A] text-white"
                    />
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 mt-1">
                <button onClick={() => setEditingId(isEditing ? null : p.id)} className="p-1.5 rounded-lg hover:bg-gray-100" title="Modifier la catégorie">
                  <Pencil className={`h-4 w-4 ${isEditing ? 'text-[#00BFA6]' : 'text-gray-400'}`} />
                </button>
                <button onClick={() => togglePublished(p)} className="p-1.5 rounded-lg hover:bg-gray-100" title={p.published ? 'Publié' : 'Masqué'}>
                  {p.published ? <Eye className="h-4 w-4 text-green-600" /> : <EyeOff className="h-4 w-4 text-gray-400" />}
                </button>
                <button onClick={() => remove(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          )
        })}
        {filteredItems.length === 0 && (
          <p className="col-span-full text-center text-gray-400 text-sm py-6">Aucun partenaire dans cette catégorie.</p>
        )}
      </div>

      <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-5 space-y-3 max-w-lg">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ajouter un partenaire</p>
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nom du partenaire" className="w-full text-sm font-bold outline-none border border-gray-200 rounded-xl p-3 bg-white" />
        <input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="Site web (optionnel)" className="w-full text-sm outline-none border border-gray-200 rounded-xl p-3 bg-white" />

        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500">Sous-catégorie (optionnelle)</p>
          <ChipRow
            options={PARTNER_CATEGORIES}
            value={newCategory}
            onChange={(id) => { setNewCategory(id); setNewSubCategory("") }}
            activeClassName="bg-[#00BFA6] border-[#00BFA6] text-white"
          />
          {newCategory && (
            <ChipRow
              options={subCategoriesForPole(newCategory as ActivityPole)}
              value={newSubCategory}
              onChange={setNewSubCategory}
              activeClassName="bg-[#003B4A] border-[#003B4A] text-white"
            />
          )}
        </div>

        <label className="flex items-center gap-2 w-full text-sm border border-gray-200 rounded-xl p-3 bg-white cursor-pointer">
          <Upload className="h-4 w-4 text-gray-400" /> {newLogo ? newLogo.name : "Logo (optionnel)"}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setNewLogo(e.target.files?.[0] || null)} />
        </label>
        <Button onClick={add} disabled={adding} className="bg-[#00BFA6] hover:bg-[#00908A] text-white">
          {adding ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />} Ajouter
        </Button>
      </div>
    </div>
  )
}

// ───────────────────────── Contact & Support ─────────────────────────

// Un département = 5 canaux indépendants (email/téléphone/WhatsApp/Viber/Telegram),
// tous optionnels — seuls ceux renseignés apparaissent, cliquables, sur la page publique.
const DEPARTMENTS: { id: string; label: string; icon: typeof Briefcase; prefix: string; placeholder: { email: string; phone: string } }[] = [
  { id: 'COMMERCIAL', label: 'Service Commercial', icon: Briefcase, prefix: 'SUPPORT_COMMERCIAL', placeholder: { email: 'commercial@votreplateforme.com', phone: '+213 XX XXX XXX' } },
  { id: 'JURIDIQUE', label: 'Service Légal & Juridique', icon: Scale, prefix: 'SUPPORT_JURIDIQUE', placeholder: { email: 'juridique@votreplateforme.com', phone: '+213 XX XXX XXX' } },
  { id: 'TECHNIQUE', label: 'Support Technique', icon: Wrench, prefix: 'SUPPORT_TECHNIQUE', placeholder: { email: 'technique@votreplateforme.com', phone: '+213 XX XXX XXX' } },
]

function ChannelFields({ prefix, settings, set }: { prefix: string; settings: Record<string, string>; set: (key: string, value: string) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label className="text-xs font-bold text-gray-500 mb-1 flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-gray-400" /> E-mail</label>
        <input value={settings[`${prefix}_EMAIL`] || ''} onChange={(e) => set(`${prefix}_EMAIL`, e.target.value)} placeholder="contact@votreplateforme.com" className="w-full text-sm outline-none border border-gray-200 rounded-xl p-2.5 focus:border-[#00BFA6]" />
      </div>
      <div>
        <label className="text-xs font-bold text-gray-500 mb-1 flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-gray-400" /> Téléphone</label>
        <input value={settings[`${prefix}_PHONE`] || ''} onChange={(e) => set(`${prefix}_PHONE`, e.target.value)} placeholder="+213 XX XXX XXX" className="w-full text-sm outline-none border border-gray-200 rounded-xl p-2.5 focus:border-[#00BFA6]" />
      </div>
      <div>
        <label className="text-xs font-bold text-gray-500 mb-1 flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5 text-green-500" /> WhatsApp</label>
        <input value={settings[`${prefix}_WHATSAPP`] || ''} onChange={(e) => set(`${prefix}_WHATSAPP`, e.target.value)} placeholder="+213 XX XXX XXX" className="w-full text-sm outline-none border border-gray-200 rounded-xl p-2.5 focus:border-[#00BFA6]" />
      </div>
      <div>
        <label className="text-xs font-bold text-gray-500 mb-1 flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5 text-purple-500" /> Viber</label>
        <input value={settings[`${prefix}_VIBER`] || ''} onChange={(e) => set(`${prefix}_VIBER`, e.target.value)} placeholder="+213 XX XXX XXX" className="w-full text-sm outline-none border border-gray-200 rounded-xl p-2.5 focus:border-[#00BFA6]" />
      </div>
      <div className="sm:col-span-2">
        <label className="text-xs font-bold text-gray-500 mb-1 flex items-center gap-1.5"><Send className="h-3.5 w-3.5 text-blue-500" /> Telegram</label>
        <input value={settings[`${prefix}_TELEGRAM`] || ''} onChange={(e) => set(`${prefix}_TELEGRAM`, e.target.value)} placeholder="@NomDuBot_Support ou nom d'utilisateur" className="w-full text-sm outline-none border border-gray-200 rounded-xl p-2.5 focus:border-[#00BFA6]" />
      </div>
    </div>
  )
}

function ContactTab() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/content/settings`).then(r => r.json()).then(setSettings).finally(() => setLoading(false))
  }, [])

  const set = (key: string, value: string) => { setSettings(prev => ({ ...prev, [key]: value })); setSaved(false) }

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch(`${API_URL}/admin/content/settings`, { method: 'PUT', headers: getHeaders() as any, body: JSON.stringify(settings) })
      if (res.ok) setSaved(true)
    } finally { setSaving(false) }
  }

  if (loading) return <div className="text-center py-10 text-gray-400"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Contact général */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#003B4A] flex items-center gap-2"><Globe className="h-4 w-4 text-[#00BFA6]" /> Contact Général</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-gray-400" /> Téléphone</label>
            <input value={settings.CONTACT_PHONE || ''} onChange={(e) => set('CONTACT_PHONE', e.target.value)} className="w-full text-sm outline-none border border-gray-200 rounded-xl p-2.5 focus:border-[#00BFA6]" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-gray-400" /> E-mail</label>
            <input value={settings.CONTACT_EMAIL || ''} onChange={(e) => set('CONTACT_EMAIL', e.target.value)} className="w-full text-sm outline-none border border-gray-200 rounded-xl p-2.5 focus:border-[#00BFA6]" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5 text-green-500" /> WhatsApp</label>
            <input value={settings.CONTACT_WHATSAPP || ''} onChange={(e) => set('CONTACT_WHATSAPP', e.target.value)} placeholder="+213 XX XXX XXX" className="w-full text-sm outline-none border border-gray-200 rounded-xl p-2.5 focus:border-[#00BFA6]" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5 text-purple-500" /> Viber</label>
            <input value={settings.CONTACT_VIBER || ''} onChange={(e) => set('CONTACT_VIBER', e.target.value)} placeholder="+213 XX XXX XXX" className="w-full text-sm outline-none border border-gray-200 rounded-xl p-2.5 focus:border-[#00BFA6]" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 flex items-center gap-1.5"><Send className="h-3.5 w-3.5 text-blue-500" /> Telegram</label>
            <input value={settings.CONTACT_TELEGRAM || ''} onChange={(e) => set('CONTACT_TELEGRAM', e.target.value)} placeholder="@NomDuBot_Support" className="w-full text-sm outline-none border border-gray-200 rounded-xl p-2.5 focus:border-[#00BFA6]" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-gray-400" /> Adresse</label>
            <input value={settings.CONTACT_ADDRESS || ''} onChange={(e) => set('CONTACT_ADDRESS', e.target.value)} className="w-full text-sm outline-none border border-gray-200 rounded-xl p-2.5 focus:border-[#00BFA6]" />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 mb-1 block">Texte "Service Support"</label>
          <textarea value={settings.SUPPORT_CONTENT || ''} onChange={(e) => set('SUPPORT_CONTENT', e.target.value)} rows={3} className="w-full text-sm outline-none border border-gray-200 rounded-xl p-2.5 focus:border-[#00BFA6]" />
        </div>
      </div>

      {/* Un bloc par département : email + téléphone + WhatsApp + Viber + Telegram */}
      {DEPARTMENTS.map((dept) => {
        const Icon = dept.icon
        return (
          <div key={dept.id} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#003B4A] flex items-center gap-2"><Icon className="h-4 w-4 text-[#00BFA6]" /> {dept.label}</h3>
            <ChannelFields prefix={dept.prefix} settings={settings} set={set} />
          </div>
        )
      })}

      <div className="flex items-center gap-3 sticky bottom-4">
        <Button onClick={save} disabled={saving} className="bg-[#00BFA6] hover:bg-[#00908A] text-white shadow-lg">
          {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />} Enregistrer
        </Button>
        {saved && <span className="text-sm text-green-600 font-bold flex items-center gap-1"><Check className="h-4 w-4" /> Enregistré</span>}
      </div>
    </div>
  )
}
