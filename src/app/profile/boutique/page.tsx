"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import {
  Store, Save, Eye, Palette, Image as ImageIcon, Phone, Mail,
  Globe, Facebook, Instagram, Linkedin, MessageCircle, Check,
  Loader2, AlertCircle, ExternalLink, Upload, X, Building2,
  User, Square, Circle, Minus, Play, Plus
} from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const PALETTE = [
  "#00BFA6", "#1E40AF", "#7C3AED", "#DC2626",
  "#EA580C", "#16A34A", "#DB2777", "#374151",
  "#0891B2", "#D97706", "#065F46", "#1D4ED8",
]

function getImageUrl(url: string) {
  if (!url) return ''
  if (url.startsWith('blob:') || url.startsWith('data:')) return url
  if (url.startsWith('http')) return url
  let clean = url.replace(/\\/g, '/')
  if (clean.startsWith('/')) clean = clean.substring(1)
  return `${API_URL}/${clean}`
}

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-32 shrink-0">
        <span className="text-sm font-bold text-gray-700">{label}</span>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap flex-1">
        {PALETTE.map(p => (
          <button key={p} onClick={() => onChange(p)} className="h-6 w-6 rounded-md border-2 transition-all hover:scale-110 shrink-0" style={{ backgroundColor: p, borderColor: value === p ? '#111' : 'transparent' }} title={p}>
            {value === p && <Check className="h-3 w-3 text-white mx-auto" />}
          </button>
        ))}
        <input type="color" value={value} onChange={e => onChange(e.target.value)} className="h-6 w-8 border border-gray-200 rounded cursor-pointer" />
        <span className="text-xs font-mono text-gray-400">{value}</span>
      </div>
    </div>
  )
}

// Mini aperçu du hero pour le panel de droite
function HeroPreview({ config, logoShape }: { config: any; logoShape: string }) {
  const hc = config.headerColor || config.primaryColor || '#00BFA6'
  const shapeClass = logoShape === 'round' ? 'rounded-full' : logoShape === 'rectangle' ? 'rounded-xl' : 'rounded-none'
  const border = logoShape !== 'none' ? 'border-2 border-white shadow' : ''

  return (
    <div className="text-white text-center" style={{ background: `linear-gradient(135deg, ${hc} 0%, ${hc}cc 100%)`, minHeight: 160 }}>
      <div className="px-4 py-5 flex flex-col items-center">
        {config.logoUrl && (
          <img src={getImageUrl(config.logoUrl)} alt="logo" className={`h-12 w-12 object-cover mb-2 ${shapeClass} ${border}`} />
        )}
        <div className="font-black text-base leading-tight">{config.companyName || 'Ma Boutique'}</div>
        {config.slogan && <div className="text-xs text-white/80 mt-1">{config.slogan}</div>}
        {config.description && <div className="text-[10px] text-white/60 mt-1 line-clamp-2">{config.description}</div>}
        <div className="flex flex-wrap gap-1.5 mt-3 justify-center">
          {config.phone && <span className="text-[10px] bg-white text-gray-800 px-2 py-0.5 rounded-full font-bold">{config.phone}</span>}
          {config.whatsapp && <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">WhatsApp</span>}
          {config.email && <span className="text-[10px] bg-white/20 border border-white/40 text-white px-2 py-0.5 rounded-full font-bold">Email</span>}
          {config.facebook && <span className="text-[10px] bg-white/20 border border-white/40 text-white px-1.5 py-0.5 rounded-full">f</span>}
          {config.instagram && <span className="text-[10px] bg-white/20 border border-white/40 text-white px-1.5 py-0.5 rounded-full">ig</span>}
          {config.linkedin && <span className="text-[10px] bg-white/20 border border-white/40 text-white px-1.5 py-0.5 rounded-full">in</span>}
        </div>
      </div>
    </div>
  )
}

export default function BoutiqueConfigPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const storyInputRef = useRef<HTMLInputElement>(null)

  const [logoSource, setLogoSource] = useState<'account' | 'custom'>('account')
  const [logoShape, setLogoShape] = useState<'round' | 'rectangle' | 'none'>('round')

  const [config, setConfig] = useState({
    headerColor: "#00BFA6",
    footerColor: "#00BFA6",
    bodyColor: "#F9FAFB",
    filterColor: "#00BFA6",
    storyColor: "#00BFA6",
    primaryColor: "#00BFA6",
    companyName: "",
    slogan: "",
    description: "",
    bannerUrl: "",
    bannerUrls: [] as string[],
    logoUrl: "",
    phone: "",
    email: "",
    whatsapp: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    website: "",
    stories: [] as { url: string; type: 'image' | 'video'; label: string }[],
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    if (!token || !userStr) { router.push('/auth/login'); return }
    const userData = JSON.parse(userStr)
    if (userData.userType !== 'SOCIETE') { router.push('/profile'); return }
    setUser(userData)
    const accountLogo = userData.agencyLogoUrl || userData.imageUrl || ""
    setConfig(prev => ({
      ...prev,
      companyName: userData.companyName || "",
      email: userData.email || "",
      phone: userData.phone || "",
      logoUrl: accountLogo,
    }))
    fetch(`/api/boutique/${userData.id}`)
      .then(r => r.json())
      .then(data => {
        if (data) {
          setConfig(prev => ({
            ...prev,
            ...data,
            headerColor: data.headerColor || data.primaryColor || "#00BFA6",
            footerColor: data.footerColor || data.primaryColor || "#00BFA6",
            bodyColor: data.bodyColor || "#F9FAFB",
            stories: data.stories || [],
            bannerUrls: data.bannerUrls || [],
          }))
          if (data.logoShape) setLogoShape(data.logoShape)
          if (data.logoUrl && data.logoUrl !== accountLogo) setLogoSource('custom')
        }
      })
      .catch(() => {})
  }, [router])

  const handleChange = (k: string, v: any) => setConfig(prev => ({ ...prev, [k]: v }))

  const uploadImage = async (file: File, field: 'bannerUrl' | 'logoUrl') => {
    try {
      const token = localStorage.getItem('token')
      const form = new FormData()
      form.append('file', file)
      const res = await axios.post(`${API_URL}/uploads`, form, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } })
      handleChange(field, res.data?.url || res.data?.path || res.data)
    } catch {
      handleChange(field, URL.createObjectURL(file))
    }
  }

  const addBannerSlide = async (file: File) => {
    try {
      const token = localStorage.getItem('token')
      const form = new FormData()
      form.append('file', file)
      const res = await axios.post(`${API_URL}/uploads`, form, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } })
      const url = res.data?.url || res.data?.path || res.data
      setConfig(prev => ({ ...prev, bannerUrls: [...prev.bannerUrls, url] }))
    } catch {
      setConfig(prev => ({ ...prev, bannerUrls: [...prev.bannerUrls, URL.createObjectURL(file)] }))
    }
  }

  const removeBannerSlide = (idx: number) => setConfig(prev => ({ ...prev, bannerUrls: prev.bannerUrls.filter((_, i) => i !== idx) }))

  const addStory = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) { alert('Fichier trop lourd (max 10 Mo)'); return }
    const type: 'image' | 'video' = file.type.startsWith('video/') ? 'video' : 'image'
    const previewUrl = URL.createObjectURL(file)
    const tempStory = { url: previewUrl, type, label: file.name.replace(/\.[^.]+$/, '') }
    setConfig(prev => ({ ...prev, stories: [...prev.stories, tempStory] }))
    try {
      const token = localStorage.getItem('token')
      const form = new FormData()
      form.append('file', file)
      const res = await axios.post(`${API_URL}/uploads`, form, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } })
      const url = res.data?.url || res.data?.path || res.data
      setConfig(prev => ({ ...prev, stories: prev.stories.map(s => s.url === previewUrl ? { ...s, url } : s) }))
    } catch {}
  }

  const removeStory = (idx: number) => setConfig(prev => ({ ...prev, stories: prev.stories.filter((_, i) => i !== idx) }))
  const updateStoryLabel = (idx: number, label: string) => setConfig(prev => ({ ...prev, stories: prev.stories.map((s, i) => i === idx ? { ...s, label } : s) }))

  const handleSave = async () => {
    setSaving(true); setError(""); setSaved(false)
    try {
      await fetch(`/api/boutique/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...config, primaryColor: config.headerColor, logoShape })
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError("Erreur lors de la sauvegarde.")
    } finally {
      setSaving(false)
    }
  }

  const COMPANY_NAME_LABELS: Record<string, string> = {
    AGENCE_IMMOBILIERE:            "Nom de l'agence immobilière",
    PROMOTEUR_IMMOBILIER:          "Nom du promoteur immobilier",
    ADMINISTRATEUR_BIENS:          "Nom de la société d'administration de biens",
    AUTRES_PROFESSIONNELS:         "Nom de la société",
    HOTEL:                         "Nom de l'hôtel",
    COMPLEXE_TOURISTIQUE:          "Nom du complexe touristique",
    VILLAGE_VACANCES:              "Nom du village de vacances",
    APPART_HOTEL:                  "Nom de l'appart hôtel",
    RESIDENCE_HOTELIERE:           "Nom de la résidence hôtelière",
    MOTEL:                         "Nom du motel",
    RELAIS_ROUTIER:                "Nom du relais routier",
    CAMPING_TOURISTIQUE:           "Nom du camping touristique",
    AUTRES_STRUCTURES:             "Nom de la structure",
    SALLE_DES_FETES:               "Nom de la salle des fêtes",
    SALLES_DINATOIRES:             "Nom de la salle dinatoire",
    SALLE_FORMATION:               "Nom de la salle de formation",
    SALLE_CONFERENCE:              "Nom de la salle de conférence",
    AUTRES_EVENEMENTIEL:           "Nom de la structure",
    ENTREPOSAGE_FRIGORIFIQUE:      "Nom de l'entrepôt",
    ENTREPOSAGE_NON_FRIGORIFIQUE:  "Nom de l'entrepôt",
    AUTRES_ENTREPOSAGE_STOCKAGE:   "Nom de la structure",
  }
  const activityType = user?.activityType || user?.activity || ""
  const companyNameLabel = COMPANY_NAME_LABELS[activityType] || "Nom de la société"

  const accountLogo = user?.agencyLogoUrl || user?.imageUrl || ""

  const SaveBar = () => (
    <div className="flex gap-3">
      <a href={`/boutique/${user?.id}`} target="_blank" className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:border-[#00BFA6] hover:text-[#00BFA6] transition-colors">
        <Eye className="h-4 w-4" /> Prévisualiser
      </a>
      <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-[#00BFA6] text-white rounded-xl font-bold text-sm hover:bg-[#009e88] transition-colors disabled:opacity-60">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
        {saved ? "Sauvegardé !" : "Enregistrer"}
      </button>
    </div>
  )

  if (!user) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin h-8 w-8 text-[#00BFA6]" /></div>

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3"><Store className="h-7 w-7 text-[#00BFA6]" /> Ma Vitrine</h1>
            <p className="text-gray-500 mt-1 text-sm">Personnalisez votre vitrine professionnelle publique</p>
          </div>
          <SaveBar />
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" /> {error}
          </div>
        )}

        {/* Layout 2 colonnes : config | aperçu live */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6 items-start">

          {/* ── COLONNE CONFIG ── */}
          <div className="space-y-6">

            {/* Ligne 1 : Identité + Visuels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Identité */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-black text-gray-900 mb-5 flex items-center gap-2 text-base"><Building2 className="h-5 w-5 text-[#00BFA6]" /> Identité</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">{companyNameLabel}</label>
                    <input value={config.companyName} onChange={e => handleChange('companyName', e.target.value)} className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#00BFA6] outline-none font-medium text-sm" placeholder="Ex: Agence Horizon Immobilier" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Slogan</label>
                    <input value={config.slogan} onChange={e => handleChange('slogan', e.target.value)} className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#00BFA6] outline-none font-medium text-sm" placeholder="Votre bien, notre passion" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                    <textarea value={config.description} onChange={e => handleChange('description', e.target.value)} rows={3} className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#00BFA6] outline-none font-medium resize-none text-sm" placeholder="Quelques mots sur votre agence..." />
                  </div>
                </div>
              </div>

              {/* Visuels */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-black text-gray-900 mb-5 flex items-center gap-2 text-base"><ImageIcon className="h-5 w-5 text-[#00BFA6]" /> Visuels</h2>

                {/* Logo */}
                <div className="mb-5">
                  <label className="block text-sm font-bold text-gray-700 mb-3">Logo</label>

                  {/* Source: compte ou custom */}
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => { setLogoSource('account'); handleChange('logoUrl', accountLogo) }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${logoSource === 'account' ? 'border-[#00BFA6] text-[#00BFA6] bg-[#00BFA6]/5' : 'border-gray-200 text-gray-600'}`}
                    >
                      <User className="h-3.5 w-3.5" /> Photo du compte
                    </button>
                    <button
                      onClick={() => { setLogoSource('custom'); logoInputRef.current?.click() }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${logoSource === 'custom' ? 'border-[#00BFA6] text-[#00BFA6] bg-[#00BFA6]/5' : 'border-gray-200 text-gray-600'}`}
                    >
                      <Upload className="h-3.5 w-3.5" /> Logo personnalisé
                    </button>
                  </div>

                  <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) { setLogoSource('custom'); uploadImage(e.target.files[0], 'logoUrl') } }} />

                  {/* Aperçu + forme */}
                  <div className="flex items-center gap-4">
                    {config.logoUrl ? (
                      <div className="relative">
                        <img
                          src={getImageUrl(config.logoUrl)}
                          alt="Logo"
                          className={`h-16 w-16 object-cover border-4 border-gray-100 ${logoShape === 'round' ? 'rounded-full' : logoShape === 'rectangle' ? 'rounded-xl' : 'rounded-none'}`}
                        />
                        {logoSource === 'custom' && (
                          <button onClick={() => { handleChange('logoUrl', accountLogo); setLogoSource('account') }} className="absolute -top-1 -right-1 p-1 bg-white border border-gray-200 rounded-full shadow">
                            <X className="h-3 w-3 text-gray-600" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                        <User className="h-6 w-6 text-gray-400" />
                      </div>
                    )}

                    {/* Forme du logo */}
                    <div>
                      <p className="text-xs font-bold text-gray-500 mb-2">Forme</p>
                      <div className="flex gap-2">
                        {([
                          { v: 'round', icon: Circle, label: 'Rond' },
                          { v: 'rectangle', icon: Square, label: 'Rectangle' },
                          { v: 'none', icon: Minus, label: 'Sans' },
                        ] as { v: 'round' | 'rectangle' | 'none'; icon: any; label: string }[]).map(({ v, icon: Icon, label }) => (
                          <button key={v} onClick={() => setLogoShape(v)} className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg border-2 transition-all text-xs ${logoShape === v ? 'border-[#00BFA6] bg-[#00BFA6]/5 text-[#00BFA6]' : 'border-gray-200 text-gray-500'}`}>
                            <Icon className="h-4 w-4" />
                            <span>{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bannière slider */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Bannière(s) <span className="text-gray-400 font-normal text-xs">(slider auto si plusieurs)</span></label>
                  <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && addBannerSlide(e.target.files[0])} />
                  {config.bannerUrls.length > 0 ? (
                    <div className="space-y-2">
                      {config.bannerUrls.map((url, idx) => (
                        <div key={idx} className="relative rounded-xl overflow-hidden h-16 bg-gray-100">
                          <img src={getImageUrl(url)} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute top-1.5 left-2 bg-black/50 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{idx + 1}</div>
                          <button onClick={() => removeBannerSlide(idx)} className="absolute top-1.5 right-1.5 p-1 bg-white/80 rounded-full hover:bg-white"><X className="h-3 w-3 text-gray-700" /></button>
                        </div>
                      ))}
                      <button onClick={() => bannerInputRef.current?.click()} className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 hover:border-[#00BFA6] hover:text-[#00BFA6] text-gray-400 text-sm transition-colors">
                        <Plus className="h-4 w-4" /> Ajouter une slide
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => bannerInputRef.current?.click()} className="w-full h-20 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1.5 hover:border-[#00BFA6] hover:text-[#00BFA6] text-gray-400 transition-colors">
                      <Upload className="h-5 w-5" />
                      <span className="text-sm font-medium">Uploader une bannière</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Couleurs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-black text-gray-900 mb-4 flex items-center gap-2 text-base"><Palette className="h-5 w-5 text-[#00BFA6]" /> Couleurs</h2>
              <ColorPicker label="En-tête" value={config.headerColor} onChange={v => handleChange('headerColor', v)} />
              <ColorPicker label="Pied de page" value={config.footerColor} onChange={v => handleChange('footerColor', v)} />
              <ColorPicker label="Fond de page" value={config.bodyColor} onChange={v => handleChange('bodyColor', v)} />
              <ColorPicker label="Barre de filtres" value={config.filterColor} onChange={v => handleChange('filterColor', v)} />
              <ColorPicker label="Bordure stories" value={config.storyColor} onChange={v => handleChange('storyColor', v)} />
              <div className="mt-4 rounded-xl overflow-hidden border border-gray-200 text-xs">
                <div className="h-7 flex items-center px-4 text-white font-bold" style={{ backgroundColor: config.headerColor }}>En-tête</div>
                <div className="h-8 flex items-center px-4 text-gray-500 font-medium text-[11px]" style={{ backgroundColor: config.bodyColor }}>Contenu de la page</div>
                <div className="h-7 flex items-center px-4 text-white font-bold" style={{ backgroundColor: config.footerColor }}>Pied de page</div>
              </div>
            </div>

            {/* Coordonnées & Réseaux */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-black text-gray-900 mb-5 flex items-center gap-2 text-base"><Phone className="h-5 w-5 text-[#00BFA6]" /> Coordonnées &amp; Réseaux sociaux</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'phone', label: 'Téléphone', icon: Phone, placeholder: '+213 555 123 456', type: 'tel' },
                  { key: 'email', label: 'Email', icon: Mail, placeholder: 'contact@agence.dz', type: 'email' },
                  { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, placeholder: '+213 555 123 456', type: 'tel' },
                  { key: 'website', label: 'Site web', icon: Globe, placeholder: 'https://www.monagence.dz', type: 'url' },
                  { key: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/...', type: 'url' },
                  { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: '@monagence', type: 'text' },
                  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/...', type: 'url' },
                ].map(({ key, label, icon: Icon, placeholder, type }) => (
                  <div key={key} className="flex items-center gap-3 p-3 border-2 border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
                    <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0"><Icon className="h-4 w-4 text-gray-400" /></div>
                    <input type={type} value={(config as any)[key]} onChange={e => handleChange(key, e.target.value)} className="flex-1 outline-none text-sm font-medium text-gray-900 bg-transparent placeholder-gray-400" placeholder={`${label} — ${placeholder}`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Stories */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-black text-gray-900 mb-2 flex items-center gap-2 text-base"><Play className="h-5 w-5 text-[#00BFA6]" /> Stories</h2>
              <p className="text-xs text-gray-500 mb-5">Format mobile 9:16 · Images ou vidéos · Max 10 Mo par fichier</p>

              <input ref={storyInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={e => { if (e.target.files?.[0]) { addStory(e.target.files[0]); e.target.value = '' } }} />

              {config.stories.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                  {config.stories.map((s, idx) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden bg-gray-100" style={{ aspectRatio: '9/16' }}>
                      {s.type === 'video' ? (
                        <video src={getImageUrl(s.url)} className="w-full h-full object-cover" muted />
                      ) : (
                        <img src={getImageUrl(s.url)} alt="" className="w-full h-full object-cover" />
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-black/50 p-2">
                        <input
                          value={s.label}
                          onChange={e => updateStoryLabel(idx, e.target.value)}
                          className="w-full bg-transparent text-white text-xs outline-none placeholder-white/60 font-medium"
                          placeholder="Titre..."
                        />
                      </div>
                      <button onClick={() => removeStory(idx)} className="absolute top-1.5 right-1.5 h-6 w-6 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors">
                        <X className="h-3.5 w-3.5" />
                      </button>
                      {s.type === 'video' && <div className="absolute top-1.5 left-1.5 bg-black/50 rounded-full p-1"><Play className="h-3 w-3 text-white" /></div>}
                    </div>
                  ))}
                </div>
              ) : null}

              <button onClick={() => storyInputRef.current?.click()} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 hover:border-[#00BFA6] hover:text-[#00BFA6] text-gray-400 transition-colors text-sm font-medium">
                <Plus className="h-4 w-4" /> Ajouter une story (image ou vidéo 9:16)
              </button>
            </div>

            {/* Link to boutique */}
            <div className="p-5 bg-[#00BFA6]/5 border border-[#00BFA6]/20 rounded-2xl flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900">Lien de votre boutique publique</p>
                <p className="text-sm text-gray-500 mt-0.5 font-mono">/boutique/{user.id}</p>
              </div>
              <a href={`/boutique/${user.id}`} target="_blank" className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white" style={{ backgroundColor: config.headerColor }}>
                <ExternalLink className="h-4 w-4" /> Voir ma vitrine
              </a>
            </div>

            {/* Boutons du bas */}
            <div className="flex justify-end pb-4">
              <SaveBar />
            </div>
          </div>

          {/* ── APERÇU LIVE ── */}
          <div className="xl:sticky xl:top-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-black text-gray-700">Aperçu en direct</span>
                <a href={`/boutique/${user.id}`} target="_blank" className="text-xs text-[#00BFA6] font-bold flex items-center gap-1 hover:underline">
                  <ExternalLink className="h-3 w-3" /> Ouvrir
                </a>
              </div>

              {/* Aperçu web */}
              <div className="overflow-hidden rounded-b-2xl" style={{ background: config.bodyColor }}>

                {/* Hero */}
                <HeroPreview config={config} logoShape={logoShape} />

                {/* Mini filter bar */}
                <div className="bg-white shadow-sm border-b border-gray-200 px-3 py-2.5 flex gap-2">
                  {["Tout", "Vente", "Location"].map((t, i) => (
                    <span
                      key={t}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold"
                      style={i === 0
                        ? { backgroundColor: config.filterColor, color: 'white' }
                        : { backgroundColor: '#f3f4f6', color: '#6b7280' }
                      }
                    >{t}</span>
                  ))}
                </div>

                {/* Stories */}
                {config.stories.length > 0 && (
                  <div className="bg-white px-4 py-3 flex gap-3 overflow-x-auto border-b border-gray-100">
                    {config.stories.slice(0, 5).map((s, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1 shrink-0">
                        <div className="h-11 w-11 rounded-full overflow-hidden border-2" style={{ borderColor: config.storyColor }}>
                          {s.type === 'video'
                            ? <video src={getImageUrl(s.url)} className="h-full w-full object-cover" muted />
                            : <img src={getImageUrl(s.url)} alt="" className="h-full w-full object-cover" />}
                        </div>
                        <span className="text-[9px] text-gray-500 truncate max-w-[44px] font-medium">{s.label || 'Story'}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Annonces placeholder grid */}
                <div className="p-4 grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm">
                      <div className="h-20 bg-gray-100" />
                      <div className="p-2.5">
                        <div className="h-2.5 bg-gray-200 rounded w-3/4 mb-1.5" />
                        <div className="h-2 bg-gray-100 rounded w-1/2 mb-1.5" />
                        <div className="h-2.5 rounded w-2/3 font-bold" style={{ backgroundColor: config.headerColor + '40' }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="py-4 text-center text-xs text-white font-bold" style={{ backgroundColor: config.footerColor }}>
                  {config.companyName || 'Ma Boutique'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
