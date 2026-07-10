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
function HeroPreview({ config, logoShape, secondLogoShape, logoAlignment }: { config: any; logoShape: string; secondLogoShape?: string; logoAlignment?: string }) {
  const hc = config.headerColor || config.primaryColor || '#00BFA6'
  const htc = config.headerTextColor || '#ffffff'
  const sc1 = logoShape === 'round' ? 'rounded-full' : logoShape === 'rectangle' ? 'rounded-xl' : 'rounded-none'
  const sc2 = (secondLogoShape || 'round') === 'round' ? 'rounded-full' : (secondLogoShape || 'round') === 'rectangle' ? 'rounded-xl' : 'rounded-none'
  const border = 'border-2 border-white shadow'
  const isSides = logoAlignment === 'sides' && config.logoUrl && config.secondLogoUrl
  const ff = config.fontFamily || undefined

  return (
    <div className="text-center" style={{ background: `linear-gradient(135deg, ${hc} 0%, ${hc}cc 100%)`, minHeight: 160, fontFamily: ff }}>
      <div className="px-4 py-5 flex flex-col items-center">
        {isSides ? (
          <div className="w-full flex items-center justify-between px-4 mb-2">
            <img src={getImageUrl(config.logoUrl)} alt="logo" className={`h-10 w-10 object-contain ${sc1} ${border}`} />
            <img src={getImageUrl(config.secondLogoUrl)} alt="logo2" className={`h-10 w-10 object-contain ${sc2} ${border}`} />
          </div>
        ) : (
          <div className="flex items-center gap-3 mb-2 justify-center">
            {config.logoUrl && <img src={getImageUrl(config.logoUrl)} alt="logo" className={`h-12 w-12 object-contain ${sc1} ${logoShape !== 'none' ? border : ''}`} />}
            {config.secondLogoUrl && <img src={getImageUrl(config.secondLogoUrl)} alt="logo2" className={`h-10 w-10 object-contain ${sc2} ${(secondLogoShape || 'round') !== 'none' ? border : ''}`} />}
          </div>
        )}
        <div className="font-black text-base leading-tight" style={{ color: htc }}>{config.companyName || 'Ma Boutique'}</div>
        {config.slogan && <div className="text-xs mt-1" style={{ color: htc, opacity: 0.8 }}>{config.slogan}</div>}
        {config.description && <div className="text-[10px] mt-1 line-clamp-2" style={{ color: htc, opacity: 0.6 }}>{config.description}</div>}
        <div className="flex flex-wrap gap-1.5 mt-3 justify-center">
          {config.phone && <span className="text-[10px] bg-white text-gray-800 px-2 py-0.5 rounded-full font-bold">{config.phone}</span>}
          {config.whatsapp && <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">WhatsApp</span>}
          {config.email && <span className="text-[10px] bg-white/20 border border-white/40 px-2 py-0.5 rounded-full font-bold" style={{ color: htc }}>Email</span>}
          {config.facebook && <span className="text-[10px] bg-white/20 border border-white/40 px-1.5 py-0.5 rounded-full" style={{ color: htc }}>f</span>}
          {config.instagram && <span className="text-[10px] bg-white/20 border border-white/40 px-1.5 py-0.5 rounded-full" style={{ color: htc }}>ig</span>}
          {config.linkedin && <span className="text-[10px] bg-white/20 border border-white/40 px-1.5 py-0.5 rounded-full" style={{ color: htc }}>in</span>}
        </div>
      </div>
    </div>
  )
}

export default function BoutiqueConfigPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [activeSub, setActiveSub] = useState<any | null | 'loading'>('loading')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const storyInputRef = useRef<HTMLInputElement>(null)

  const [logoSource, setLogoSource] = useState<'account' | 'custom'>('account')
  const [logoShape, setLogoShape] = useState<'round' | 'rectangle' | 'none'>('round')
  const [secondLogoShape, setSecondLogoShape] = useState<'round' | 'rectangle' | 'none'>('round')
  const [logoAlignment, setLogoAlignment] = useState<'center' | 'sides'>('center')
  const secondLogoInputRef = useRef<HTMLInputElement>(null)
  const aboutImageInputRef = useRef<HTMLInputElement>(null)

  const [config, setConfig] = useState({
    headerColor: "#00BFA6",
    headerTextColor: "#ffffff",
    footerColor: "#00BFA6",
    footerTextColor: "#ffffff",
    bodyColor: "#F9FAFB",
    filterColor: "#00BFA6",
    storyColor: "#00BFA6",
    fontFamily: "",
    primaryColor: "#00BFA6",
    companyName: "",
    slogan: "",
    description: "",
    bannerUrl: "",
    bannerUrls: [] as string[],
    logoUrl: "",
    secondLogoUrl: "",
    phone: "",
    email: "",
    whatsapp: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    website: "",
    stories: [] as { url: string; type: 'image' | 'video'; label: string }[],
    menuItems: [] as { label: string; href: string }[],
    aboutImage: "",
    aboutDescription: "",
    aboutButtonLabel: "",
    aboutButtonUrl: "",
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    if (!token || !userStr) { router.push('/auth/login'); return }
    const userData = JSON.parse(userStr)
    if (userData.userType !== 'SOCIETE') { router.push('/profile'); return }
    setUser(userData)

    // Vérifier abonnement boutique actif
    fetch(`${API_URL}/boutique-sub/active`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setActiveSub(data || null))
      .catch(() => setActiveSub(null))

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
            headerTextColor: data.headerTextColor || "#ffffff",
            footerColor: data.footerColor || data.primaryColor || "#00BFA6",
            footerTextColor: data.footerTextColor || "#ffffff",
            bodyColor: data.bodyColor || "#F9FAFB",
            filterColor: data.filterColor || data.primaryColor || "#00BFA6",
            storyColor: data.storyColor || data.primaryColor || "#00BFA6",
            fontFamily: data.fontFamily || "",
            stories: data.stories || [],
            bannerUrls: data.bannerUrls || [],
            menuItems: data.menuItems || [],
            secondLogoUrl: data.secondLogoUrl || "",
          }))
          if (data.logoShape) setLogoShape(data.logoShape)
          if (data.secondLogoShape) setSecondLogoShape(data.secondLogoShape)
          if (data.logoAlignment) setLogoAlignment(data.logoAlignment)
          if (data.logoUrl && data.logoUrl !== accountLogo) setLogoSource('custom')
          // About fields
          if (data.aboutImage) setConfig(prev => ({ ...prev, aboutImage: data.aboutImage }))
          if (data.aboutDescription) setConfig(prev => ({ ...prev, aboutDescription: data.aboutDescription }))
          if (data.aboutButtonLabel) setConfig(prev => ({ ...prev, aboutButtonLabel: data.aboutButtonLabel }))
          if (data.aboutButtonUrl) setConfig(prev => ({ ...prev, aboutButtonUrl: data.aboutButtonUrl }))
        }
      })
      .catch(() => {})
  }, [router])

  const handleChange = (k: string, v: any) => setConfig(prev => ({ ...prev, [k]: v }))

  const uploadImage = async (file: File, field: 'bannerUrl' | 'logoUrl' | 'secondLogoUrl') => {
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

  const uploadAboutImage = async (file: File) => {
    try {
      const token = localStorage.getItem('token')
      const form = new FormData()
      form.append('file', file)
      const res = await axios.post(`${API_URL}/uploads`, form, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } })
      handleChange('aboutImage', res.data?.url || res.data?.path || res.data)
    } catch {
      setError("Erreur lors de l'upload de l'image à propos.")
    }
  }

  const stripBlob = (val: string) => (val?.startsWith('blob:') ? '' : val)

  const handleSave = async () => {
    setSaving(true); setError(""); setSaved(false)
    try {
      const payload = {
        ...config,
        primaryColor: config.headerColor,
        logoShape,
        secondLogoShape,
        logoAlignment,
        // Ne jamais persister des blob: URLs
        logoUrl: stripBlob(config.logoUrl),
        secondLogoUrl: stripBlob(config.secondLogoUrl),
        bannerUrl: stripBlob(config.bannerUrl),
        bannerUrls: config.bannerUrls.filter(u => !u.startsWith('blob:')),
        stories: config.stories.filter(s => !s.url.startsWith('blob:')),
        aboutImage: stripBlob(config.aboutImage),
      }
      await fetch(`/api/boutique/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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

  if (!user || activeSub === 'loading') return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin h-8 w-8 text-[#00BFA6]" /></div>

  // Garde : boutique inactive → page d'activation
  if (!activeSub) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 max-w-lg w-full p-8 text-center">
        <div className="h-16 w-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-5">
          <Store className="h-8 w-8 text-amber-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Boutique non activée</h2>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          Votre vitrine publique n&apos;est pas encore active. Achetez un pack boutique — après validation par l&apos;administrateur, vous pourrez personnaliser et publier votre boutique.
        </p>
        <div className="grid grid-cols-3 gap-3 mb-6 text-left">
          {[
            { pack: 'Standard', price: '5 000 DA', pts: '50 pts' },
            { pack: 'Avancée', price: '10 000 DA', pts: '100 pts', hot: true },
            { pack: 'Entreprise', price: '15 000 DA', pts: '200 pts' },
          ].map(p => (
            <div key={p.pack} className={`p-3 rounded-xl border-2 text-center ${p.hot ? 'border-[#00BFA6] bg-[#00BFA6]/5' : 'border-gray-200'}`}>
              <div className="font-black text-gray-900 text-xs">{p.pack}</div>
              <div className="font-bold text-[#00BFA6] text-sm mt-0.5">{p.pts}</div>
              <div className="text-xs text-gray-500 mt-0.5">{p.price}/mois</div>
            </div>
          ))}
        </div>
        <button
          onClick={() => router.push('/profile/points')}
          className="w-full py-3 bg-[#00BFA6] text-white rounded-xl font-bold hover:bg-[#009e88] transition-colors flex items-center justify-center gap-2"
        >
          <Store className="h-5 w-5" /> Activer ma boutique
        </button>
      </div>
    </div>
  )

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
                          className={`h-16 w-16 object-contain border-4 border-gray-100 ${logoShape === 'round' ? 'rounded-full' : logoShape === 'rectangle' ? 'rounded-xl' : 'rounded-none'}`}
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

                {/* Second logo / Commercial */}
                <div className="mb-5 pb-5 border-b border-gray-100">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Logo secondaire <span className="text-gray-400 font-normal text-xs">(commercial, partenaire…)</span>
                  </label>
                  <input ref={secondLogoInputRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) uploadImage(e.target.files[0], 'secondLogoUrl') }} />
                  <div className="flex items-center gap-4">
                    {config.secondLogoUrl ? (
                      <div className="relative">
                        <img src={getImageUrl(config.secondLogoUrl)} alt="Logo 2" className={`h-14 w-14 object-contain border-4 border-gray-100 ${secondLogoShape === 'round' ? 'rounded-full' : secondLogoShape === 'rectangle' ? 'rounded-xl' : 'rounded-none'}`} />
                        <button onClick={() => handleChange('secondLogoUrl', '')} className="absolute -top-1 -right-1 p-1 bg-white border border-gray-200 rounded-full shadow"><X className="h-3 w-3 text-gray-600" /></button>
                      </div>
                    ) : (
                      <button onClick={() => secondLogoInputRef.current?.click()} className="h-14 w-14 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-[#00BFA6] transition-colors">
                        <Upload className="h-5 w-5 text-gray-400" />
                      </button>
                    )}
                    <div>
                      <p className="text-xs font-bold text-gray-500 mb-1.5">Forme</p>
                      <div className="flex gap-1.5">
                        {([{ v: 'round', label: 'Rond' }, { v: 'rectangle', label: 'Rect' }, { v: 'none', label: 'Sans' }] as { v: 'round'|'rectangle'|'none'; label: string }[]).map(({ v, label }) => (
                          <button key={v} onClick={() => setSecondLogoShape(v)} className={`px-2 py-1 rounded-lg border text-xs font-bold ${secondLogoShape === v ? 'border-[#00BFA6] text-[#00BFA6] bg-[#00BFA6]/5' : 'border-gray-200 text-gray-500'}`}>{label}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 mb-1.5">Alignement</p>
                      <div className="flex gap-1.5">
                        {([{ v: 'center', label: 'Centré' }, { v: 'sides', label: 'Côte à côte' }] as { v: 'center'|'sides'; label: string }[]).map(({ v, label }) => (
                          <button key={v} onClick={() => setLogoAlignment(v)} className={`px-2 py-1 rounded-lg border text-xs font-bold ${logoAlignment === v ? 'border-[#00BFA6] text-[#00BFA6] bg-[#00BFA6]/5' : 'border-gray-200 text-gray-500'}`}>{label}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bannière slider */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Bannière(s) <span className="text-gray-400 font-normal text-xs">1920×400 px recommandé · slider auto si plusieurs</span>
                  </label>
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
              <h2 className="font-black text-gray-900 mb-5 flex items-center gap-2 text-base"><Palette className="h-5 w-5 text-[#00BFA6]" /> Couleurs</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Couleurs de fond */}
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Fonds</p>
                  <ColorPicker label="En-tête" value={config.headerColor} onChange={v => handleChange('headerColor', v)} />
                  <ColorPicker label="Pied de page" value={config.footerColor} onChange={v => handleChange('footerColor', v)} />
                  <ColorPicker label="Fond de page" value={config.bodyColor} onChange={v => handleChange('bodyColor', v)} />
                  <ColorPicker label="Barre filtres" value={config.filterColor} onChange={v => handleChange('filterColor', v)} />
                  <ColorPicker label="Bordure stories" value={config.storyColor} onChange={v => handleChange('storyColor', v)} />
                </div>
                {/* Couleurs de texte */}
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Textes</p>
                  <ColorPicker label="Texte en-tête" value={config.headerTextColor} onChange={v => handleChange('headerTextColor', v)} />
                  <ColorPicker label="Texte pied page" value={config.footerTextColor} onChange={v => handleChange('footerTextColor', v)} />
                </div>
              </div>
              {/* Preview bande couleurs */}
              <div className="mt-5 rounded-xl overflow-hidden border border-gray-200 text-xs">
                <div className="h-8 flex items-center px-4 font-bold" style={{ backgroundColor: config.headerColor, color: config.headerTextColor }}>En-tête — texte exemple</div>
                <div className="h-8 flex items-center px-4 text-gray-500 font-medium" style={{ backgroundColor: config.bodyColor }}>Contenu de la page</div>
                <div className="h-8 flex items-center px-4 font-bold" style={{ backgroundColor: config.footerColor, color: config.footerTextColor }}>Pied de page — texte exemple</div>
              </div>
            </div>

            {/* Typographie */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-black text-gray-900 mb-4 flex items-center gap-2 text-base">
                <span className="text-[#00BFA6] font-black text-lg">Aa</span> Typographie
              </h2>
              <p className="text-xs text-gray-500 mb-4">Choisissez une police Google Fonts pour votre boutique</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { name: "", label: "Par défaut" },
                  { name: "Inter", label: "Inter" },
                  { name: "Poppins", label: "Poppins" },
                  { name: "Montserrat", label: "Montserrat" },
                  { name: "Raleway", label: "Raleway" },
                  { name: "Nunito", label: "Nunito" },
                  { name: "Lato", label: "Lato" },
                  { name: "Open Sans", label: "Open Sans" },
                  { name: "Playfair Display", label: "Playfair" },
                  { name: "Roboto Slab", label: "Roboto Slab" },
                  { name: "Cairo", label: "Cairo (Arabe)" },
                  { name: "Tajawal", label: "Tajawal (Arabe)" },
                ].map(f => (
                  <button
                    key={f.name}
                    onClick={() => handleChange('fontFamily', f.name)}
                    className={`px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all text-left ${config.fontFamily === f.name ? 'border-[#00BFA6] bg-[#00BFA6]/5 text-[#00BFA6]' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
                    style={{ fontFamily: f.name || undefined }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              {config.fontFamily && (
                <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <p className="text-lg font-bold text-gray-900" style={{ fontFamily: config.fontFamily }}>Agence Immobilière Horizon</p>
                  <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: config.fontFamily }}>Votre bien, notre passion — Patrimoine.dz</p>
                </div>
              )}
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

            {/* Menu de navigation */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-black text-gray-900 mb-2 flex items-center gap-2 text-base">
                <span className="text-[#00BFA6] font-black">≡</span> Menu de navigation
              </h2>
              <p className="text-xs text-gray-500 mb-4">Ajoutez des liens dans la barre de navigation de votre boutique</p>
              <div className="space-y-2 mb-3">
                {config.menuItems.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      value={item.label}
                      onChange={e => {
                        const next = [...config.menuItems]
                        next[idx] = { ...next[idx], label: e.target.value }
                        handleChange('menuItems', next)
                      }}
                      className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium focus:border-[#00BFA6] outline-none"
                      placeholder="Libellé (ex: À propos)"
                    />
                    <input
                      value={item.href}
                      onChange={e => {
                        const next = [...config.menuItems]
                        next[idx] = { ...next[idx], href: e.target.value }
                        handleChange('menuItems', next)
                      }}
                      className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium focus:border-[#00BFA6] outline-none"
                      placeholder="Lien (ex: /boutique/123/about)"
                    />
                    <button onClick={() => handleChange('menuItems', config.menuItems.filter((_, i) => i !== idx))} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => handleChange('menuItems', [...config.menuItems, { label: '', href: '' }])}
                className="flex items-center gap-2 text-sm font-bold text-[#00BFA6] hover:underline"
              >
                <Plus className="h-4 w-4" /> Ajouter un lien
              </button>
            </div>

            {/* Page À propos */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-black text-gray-900 mb-2 flex items-center gap-2 text-base">
                <Building2 className="h-5 w-5 text-[#00BFA6]" /> Page À propos
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                Disponible sur <span className="font-mono">/boutique/{user.id}/about</span> — ajoutez un lien dans votre menu
              </p>
              <input ref={aboutImageInputRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) uploadAboutImage(e.target.files[0]) }} />
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Image de présentation</label>
                  {config.aboutImage ? (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50">
                      <img src={getImageUrl(config.aboutImage)} alt="À propos" className="w-full h-full object-cover" />
                      <button onClick={() => handleChange('aboutImage', '')} className="absolute top-2 right-2 p-1.5 bg-white border border-gray-200 rounded-full shadow hover:bg-red-50">
                        <X className="h-3.5 w-3.5 text-gray-600" />
                      </button>
                      <button onClick={() => aboutImageInputRef.current?.click()} className="absolute bottom-2 right-2 px-3 py-1.5 bg-white/90 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 shadow hover:bg-white">
                        <Upload className="h-3 w-3 inline mr-1" />Changer
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => aboutImageInputRef.current?.click()}
                      className="w-full py-8 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[#00BFA6] hover:text-[#00BFA6] transition-colors"
                    >
                      <Upload className="h-7 w-7" />
                      <span className="text-sm font-medium">Cliquer pour télécharger une image</span>
                      <span className="text-xs">JPG, PNG, WebP — max 10 Mo</span>
                    </button>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Description de l'entreprise</label>
                  <textarea
                    value={config.aboutDescription || ''}
                    onChange={e => handleChange('aboutDescription', e.target.value)}
                    rows={5}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#00BFA6] outline-none text-sm resize-none"
                    placeholder="Présentez votre entreprise, votre histoire, vos valeurs..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Libellé du bouton</label>
                    <input
                      value={config.aboutButtonLabel || ''}
                      onChange={e => handleChange('aboutButtonLabel', e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#00BFA6] outline-none text-sm"
                      placeholder="Nous contacter"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">URL du bouton</label>
                    <input
                      value={config.aboutButtonUrl || ''}
                      onChange={e => handleChange('aboutButtonUrl', e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#00BFA6] outline-none text-sm"
                      placeholder="https://... ou /boutique/..."
                    />
                  </div>
                </div>
              </div>
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
                <HeroPreview config={config} logoShape={logoShape} secondLogoShape={secondLogoShape} logoAlignment={logoAlignment} />

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
