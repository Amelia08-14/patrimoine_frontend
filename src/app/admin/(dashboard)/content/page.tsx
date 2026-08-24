"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  FileText, HelpCircle, Handshake, Phone, Plus, Trash2, Save, Loader2,
  ArrowUp, ArrowDown, Check, Upload, Eye, EyeOff
} from "lucide-react"
import { LegalRichEditor } from "@/components/admin/LegalRichEditor"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const getHeaders = (json = true) => {
  const token = localStorage.getItem('admin_token')
  return json
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { Authorization: `Bearer ${token}` }
}

type Tab = 'LEGAL' | 'FAQ' | 'PARTNERS' | 'CONTACT'

const PARTNER_CATEGORIES: { id: string; label: string }[] = [
  { id: 'IMMOBILIER', label: 'Activité immobilière' },
  { id: 'HOTELLERIE', label: 'Activité hôtelière et hébergement' },
  { id: 'EVENEMENTIEL', label: 'Activité évènementiel' },
  { id: 'ENTREPOSAGE', label: "Activité d'entreposage et stockage" },
]

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
        <h1 className="text-2xl font-bold text-gray-900">Contenu du site</h1>
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

function PartnersTab() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState("")
  const [newUrl, setNewUrl] = useState("")
  const [newCategory, setNewCategory] = useState("")
  const [newLogo, setNewLogo] = useState<File | null>(null)
  const [adding, setAdding] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL")

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
      fd.append('order', String(items.length))
      if (newLogo) fd.append('logo', newLogo)
      await fetch(`${API_URL}/admin/content/partners`, { method: 'POST', headers: getHeaders(false) as any, body: fd })
      setNewName(""); setNewUrl(""); setNewCategory(""); setNewLogo(null)
      await load()
    } finally { setAdding(false) }
  }

  if (loading) return <div className="text-center py-10 text-gray-400"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>

  const filteredItems = categoryFilter === "ALL" ? items : items.filter(p => p.category === categoryFilter)

  return (
    <div className="space-y-6">
      {/* Filtre par sous-catégorie */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setCategoryFilter("ALL")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${categoryFilter === "ALL" ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'}`}>
          Toutes catégories
        </button>
        {PARTNER_CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setCategoryFilter(c.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${categoryFilter === c.id ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'}`}>
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col items-center text-center gap-2">
            <div className="h-16 w-16 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100">
              {p.logoUrl ? <img src={`${API_URL}${p.logoUrl}`} alt={p.name} className="h-full w-full object-contain" /> : <Handshake className="h-6 w-6 text-gray-300" />}
            </div>
            <p className="font-bold text-gray-900 text-sm">{p.name}</p>
            {p.websiteUrl && <p className="text-xs text-gray-400 truncate max-w-full">{p.websiteUrl}</p>}
            <select
              value={p.category || ""}
              onChange={(e) => changeCategory(p, e.target.value)}
              className={`text-[11px] font-bold rounded-full px-2.5 py-1 outline-none border-none ${p.category ? 'bg-[#00BFA6]/10 text-[#00BFA6]' : 'bg-gray-100 text-gray-400'}`}
            >
              <option value="">Sans catégorie</option>
              {PARTNER_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            <div className="flex items-center gap-2 mt-2">
              <button onClick={() => togglePublished(p)} className="p-1.5 rounded-lg hover:bg-gray-100" title={p.published ? 'Publié' : 'Masqué'}>
                {p.published ? <Eye className="h-4 w-4 text-green-600" /> : <EyeOff className="h-4 w-4 text-gray-400" />}
              </button>
              <button onClick={() => remove(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
        {filteredItems.length === 0 && (
          <p className="col-span-full text-center text-gray-400 text-sm py-6">Aucun partenaire dans cette catégorie.</p>
        )}
      </div>

      <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-5 space-y-3 max-w-md">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ajouter un partenaire</p>
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nom du partenaire" className="w-full text-sm font-bold outline-none border border-gray-200 rounded-xl p-3 bg-white" />
        <input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="Site web (optionnel)" className="w-full text-sm outline-none border border-gray-200 rounded-xl p-3 bg-white" />
        <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full text-sm outline-none border border-gray-200 rounded-xl p-3 bg-white">
          <option value="">Sous-catégorie (optionnelle)</option>
          {PARTNER_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
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
    <div className="bg-white rounded-2xl border border-gray-100 p-6 max-w-2xl space-y-5">
      <div>
        <label className="text-sm font-bold text-gray-700 mb-1.5 block">Téléphone</label>
        <input value={settings.CONTACT_PHONE || ''} onChange={(e) => set('CONTACT_PHONE', e.target.value)} className="w-full text-sm outline-none border border-gray-200 rounded-xl p-3" />
      </div>
      <div>
        <label className="text-sm font-bold text-gray-700 mb-1.5 block">E-mail</label>
        <input value={settings.CONTACT_EMAIL || ''} onChange={(e) => set('CONTACT_EMAIL', e.target.value)} className="w-full text-sm outline-none border border-gray-200 rounded-xl p-3" />
      </div>
      <div>
        <label className="text-sm font-bold text-gray-700 mb-1.5 block">Adresse</label>
        <input value={settings.CONTACT_ADDRESS || ''} onChange={(e) => set('CONTACT_ADDRESS', e.target.value)} className="w-full text-sm outline-none border border-gray-200 rounded-xl p-3" />
      </div>
      <div>
        <label className="text-sm font-bold text-gray-700 mb-1.5 block">Texte "Service Support"</label>
        <textarea value={settings.SUPPORT_CONTENT || ''} onChange={(e) => set('SUPPORT_CONTENT', e.target.value)} rows={4} className="w-full text-sm outline-none border border-gray-200 rounded-xl p-3" />
      </div>

      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest pt-2">E-mails dédiés par département</p>
      <div>
        <label className="text-sm font-bold text-gray-700 mb-1.5 block">🛠️ Support Technique</label>
        <input value={settings.SUPPORT_TECHNIQUE_EMAIL || ''} onChange={(e) => set('SUPPORT_TECHNIQUE_EMAIL', e.target.value)} placeholder="technique@votreplateforme.com" className="w-full text-sm outline-none border border-gray-200 rounded-xl p-3" />
      </div>
      <div>
        <label className="text-sm font-bold text-gray-700 mb-1.5 block">💼 Service Commercial</label>
        <input value={settings.SUPPORT_COMMERCIAL_EMAIL || ''} onChange={(e) => set('SUPPORT_COMMERCIAL_EMAIL', e.target.value)} placeholder="commercial@votreplateforme.com" className="w-full text-sm outline-none border border-gray-200 rounded-xl p-3" />
      </div>
      <div>
        <label className="text-sm font-bold text-gray-700 mb-1.5 block">⚖️ Service Légal & Juridique</label>
        <input value={settings.SUPPORT_JURIDIQUE_EMAIL || ''} onChange={(e) => set('SUPPORT_JURIDIQUE_EMAIL', e.target.value)} placeholder="juridique@votreplateforme.com" className="w-full text-sm outline-none border border-gray-200 rounded-xl p-3" />
      </div>

      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest pt-2">Canaux de messagerie instantanée</p>
      <div>
        <label className="text-sm font-bold text-gray-700 mb-1.5 block">🟢 WhatsApp Pro</label>
        <input value={settings.WHATSAPP_PRO_NUMBER || ''} onChange={(e) => set('WHATSAPP_PRO_NUMBER', e.target.value)} placeholder="+213 XX XXX XXX" className="w-full text-sm outline-none border border-gray-200 rounded-xl p-3" />
      </div>
      <div>
        <label className="text-sm font-bold text-gray-700 mb-1.5 block">🟣 Viber Business</label>
        <input value={settings.VIBER_NUMBER || ''} onChange={(e) => set('VIBER_NUMBER', e.target.value)} placeholder="+213 XX XXX XXX" className="w-full text-sm outline-none border border-gray-200 rounded-xl p-3" />
      </div>
      <div>
        <label className="text-sm font-bold text-gray-700 mb-1.5 block">🔵 Telegram Support Bot</label>
        <input value={settings.TELEGRAM_BOT_USERNAME || ''} onChange={(e) => set('TELEGRAM_BOT_USERNAME', e.target.value)} placeholder="@NomDuBot_Support" className="w-full text-sm outline-none border border-gray-200 rounded-xl p-3" />
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={saving} className="bg-[#00BFA6] hover:bg-[#00908A] text-white">
          {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />} Enregistrer
        </Button>
        {saved && <span className="text-sm text-green-600 font-bold flex items-center gap-1"><Check className="h-4 w-4" /> Enregistré</span>}
      </div>
    </div>
  )
}
