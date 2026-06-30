"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import {
  Store, Save, Eye, Palette, Image as ImageIcon, Phone, Mail,
  Globe, Facebook, Instagram, Linkedin, MessageCircle, Check,
  Loader2, AlertCircle, ExternalLink, Upload, X
} from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const PALETTE = [
  { label: "Teal", value: "#00BFA6" },
  { label: "Bleu", value: "#1E40AF" },
  { label: "Violet", value: "#7C3AED" },
  { label: "Rouge", value: "#DC2626" },
  { label: "Orange", value: "#EA580C" },
  { label: "Vert", value: "#16A34A" },
  { label: "Rose", value: "#DB2777" },
  { label: "Gris", value: "#374151" },
]

function getImageUrl(url: string) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  let clean = url.replace(/\\/g, '/')
  if (clean.startsWith('/')) clean = clean.substring(1)
  return `${API_URL}/${clean}`
}

export default function BoutiqueConfigPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const [config, setConfig] = useState({
    primaryColor: "#00BFA6",
    companyName: "",
    slogan: "",
    description: "",
    bannerUrl: "",
    logoUrl: "",
    phone: "",
    email: "",
    whatsapp: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    website: "",
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    if (!token || !userStr) { router.push('/auth/login'); return }
    const userData = JSON.parse(userStr)
    if (userData.userType !== 'SOCIETE') { router.push('/profile'); return }
    setUser(userData)
    // Pre-fill from user profile
    setConfig(prev => ({
      ...prev,
      companyName: userData.companyName || "",
      email: userData.email || "",
      phone: userData.phone || "",
      logoUrl: userData.agencyLogoUrl || userData.imageUrl || "",
    }))
    // Load saved config
    fetch(`/api/boutique/${userData.id}`)
      .then(r => r.json())
      .then(data => {
        if (data) setConfig(prev => ({ ...prev, ...data }))
      })
      .catch(() => {})
  }, [router])

  const handleChange = (k: string, v: string) => setConfig(prev => ({ ...prev, [k]: v }))

  const uploadImage = async (file: File, field: 'bannerUrl' | 'logoUrl') => {
    try {
      const token = localStorage.getItem('token')
      const form = new FormData()
      form.append('file', file)
      const res = await axios.post(`${API_URL}/uploads`, form, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      })
      const url = res.data?.url || res.data?.path || res.data
      handleChange(field, url)
    } catch {
      // Fallback: use object URL for preview only
      handleChange(field, URL.createObjectURL(file))
    }
  }

  const handleSave = async () => {
    setSaving(true); setError(""); setSaved(false)
    try {
      await fetch(`/api/boutique/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError("Erreur lors de la sauvegarde.")
    } finally {
      setSaving(false)
    }
  }

  if (!user) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin h-8 w-8 text-[#00BFA6]" /></div>

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Store className="h-7 w-7 text-[#00BFA6]" />
              Ma Boutique
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Personnalisez votre vitrine professionnelle publique</p>
          </div>
          <div className="flex gap-3">
            <a
              href={`/boutique/${user.id}`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:border-[#00BFA6] hover:text-[#00BFA6] transition-colors"
            >
              <Eye className="h-4 w-4" /> Prévisualiser
            </a>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-[#00BFA6] text-white rounded-xl font-bold text-sm hover:bg-[#009e88] transition-colors disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {saved ? "Sauvegardé !" : "Enregistrer"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" /> {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Identité */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
              <Store className="h-5 w-5 text-[#00BFA6]" /> Identité
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nom de l&apos;agence / société</label>
                <input
                  value={config.companyName}
                  onChange={e => handleChange('companyName', e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#00BFA6] outline-none font-medium"
                  placeholder="Ex: Agence Horizon Immobilier"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Slogan</label>
                <input
                  value={config.slogan}
                  onChange={e => handleChange('slogan', e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#00BFA6] outline-none font-medium"
                  placeholder="Ex: Votre bien, notre passion"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description / Présentation</label>
                <textarea
                  value={config.description}
                  onChange={e => handleChange('description', e.target.value)}
                  rows={3}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#00BFA6] outline-none font-medium resize-none"
                  placeholder="Quelques mots sur votre agence..."
                />
              </div>
            </div>
          </div>

          {/* Couleur */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
              <Palette className="h-5 w-5 text-[#00BFA6]" /> Couleur principale
            </h2>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {PALETTE.map(p => (
                <button
                  key={p.value}
                  onClick={() => handleChange('primaryColor', p.value)}
                  className={`h-12 rounded-xl border-2 transition-all ${config.primaryColor === p.value ? 'border-gray-900 scale-105' : 'border-transparent hover:scale-105'}`}
                  style={{ backgroundColor: p.value }}
                  title={p.label}
                >
                  {config.primaryColor === p.value && <Check className="h-5 w-5 text-white mx-auto" />}
                </button>
              ))}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Ou couleur personnalisée</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.primaryColor}
                  onChange={e => handleChange('primaryColor', e.target.value)}
                  className="h-10 w-16 border-2 border-gray-200 rounded-lg cursor-pointer"
                />
                <span className="text-sm font-mono text-gray-600">{config.primaryColor}</span>
              </div>
            </div>

            {/* Aperçu */}
            <div className="mt-5 rounded-xl overflow-hidden border border-gray-100">
              <div className="h-10 flex items-center px-4 text-white text-xs font-bold" style={{ backgroundColor: config.primaryColor }}>
                Aperçu de la couleur
              </div>
              <div className="p-3 flex gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: config.primaryColor }}>Tag</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold border-2" style={{ borderColor: config.primaryColor, color: config.primaryColor }}>Bouton</span>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-[#00BFA6]" /> Visuels
            </h2>
            {/* Banner */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">Bannière (1920×400 px recommandé)</label>
              <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0], 'bannerUrl')} />
              {config.bannerUrl ? (
                <div className="relative rounded-xl overflow-hidden h-28 bg-gray-100">
                  <img src={getImageUrl(config.bannerUrl)} alt="Bannière" className="w-full h-full object-cover" />
                  <button onClick={() => handleChange('bannerUrl', '')} className="absolute top-2 right-2 p-1 bg-white/80 rounded-full hover:bg-white">
                    <X className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              ) : (
                <button onClick={() => bannerInputRef.current?.click()} className="w-full h-28 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[#00BFA6] hover:text-[#00BFA6] text-gray-400 transition-colors">
                  <Upload className="h-6 w-6" />
                  <span className="text-sm font-medium">Cliquer pour uploader une bannière</span>
                </button>
              )}
            </div>
            {/* Logo */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Logo de l&apos;agence</label>
              <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0], 'logoUrl')} />
              <div className="flex items-center gap-4">
                {config.logoUrl ? (
                  <div className="relative">
                    <img src={getImageUrl(config.logoUrl)} alt="Logo" className="h-20 w-20 rounded-full object-cover border-4 border-gray-100" />
                    <button onClick={() => handleChange('logoUrl', '')} className="absolute -top-1 -right-1 p-1 bg-white border border-gray-200 rounded-full shadow">
                      <X className="h-3 w-3 text-gray-600" />
                    </button>
                  </div>
                ) : (
                  <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-200">
                    <ImageIcon className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <button onClick={() => logoInputRef.current?.click()} className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:border-[#00BFA6] hover:text-[#00BFA6] transition-colors flex items-center gap-2">
                  <Upload className="h-4 w-4" /> Changer le logo
                </button>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
              <Phone className="h-5 w-5 text-[#00BFA6]" /> Coordonnées & Réseaux
            </h2>
            <div className="space-y-3">
              {[
                { key: 'phone', label: 'Téléphone', icon: Phone, placeholder: 'Ex: +213 555 123 456' },
                { key: 'email', label: 'Email', icon: Mail, placeholder: 'contact@agence.dz' },
                { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, placeholder: '+213 555 123 456' },
                { key: 'website', label: 'Site web', icon: Globe, placeholder: 'https://www.monagence.dz' },
                { key: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/...' },
                { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: '@monagence' },
                { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/...' },
              ].map(({ key, label, icon: Icon, placeholder }) => (
                <div key={key} className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-gray-400 shrink-0" />
                  <input
                    value={(config as any)[key]}
                    onChange={e => handleChange(key, e.target.value)}
                    className="flex-1 p-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-[#00BFA6] outline-none font-medium"
                    placeholder={`${label} — ${placeholder}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Link to boutique */}
        <div className="mt-6 p-5 bg-[#00BFA6]/5 border border-[#00BFA6]/20 rounded-2xl flex items-center justify-between">
          <div>
            <p className="font-bold text-gray-900">Lien de votre boutique publique</p>
            <p className="text-sm text-gray-500 mt-0.5 font-mono">/boutique/{user.id}</p>
          </div>
          <a
            href={`/boutique/${user.id}`}
            target="_blank"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white"
            style={{ backgroundColor: config.primaryColor }}
          >
            <ExternalLink className="h-4 w-4" />
            Voir ma boutique
          </a>
        </div>
      </div>
    </div>
  )
}
