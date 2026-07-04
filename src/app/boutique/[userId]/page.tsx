"use client"

import { useState, useEffect, useMemo, use, useRef } from "react"
import Link from "next/link"
import axios from "axios"
import {
  Phone, Mail, MessageCircle, Globe, Facebook, Instagram, Linkedin,
  ChevronDown, Search, Building2, X, ArrowRight,
  Store, LayoutGrid, List, LayoutDashboard, ChevronLeft, ChevronRight,
  Star, Crown, MapPin
} from "lucide-react"
import { PROPERTY_TYPES, REAL_ESTATE_CATEGORIES } from "@/data/propertyTypes"
import { PropertyCard } from "@/components/PropertyCard"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function getImageUrl(url: string) {
  if (!url) return ''
  if (url.startsWith('blob:')) return url
  if (url.startsWith('http')) return url
  let clean = url.replace(/\\/g, '/')
  if (clean.startsWith('/')) clean = clean.substring(1)
  return `${API_URL}/${clean}`
}

function lighten(hex: string, pct: number) {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, (n >> 16) + Math.round(pct * 255))
  const g = Math.min(255, ((n >> 8) & 0xff) + Math.round(pct * 255))
  const b = Math.min(255, (n & 0xff) + Math.round(pct * 255))
  return `rgb(${r},${g},${b})`
}

type BoutiqueConfig = {
  primaryColor: string
  companyName?: string
  slogan?: string
  description?: string
  bannerUrl?: string
  bannerUrls?: string[]
  logoUrl?: string
  phone?: string
  email?: string
  whatsapp?: string
  facebook?: string
  instagram?: string
  linkedin?: string
  website?: string
  menuItems?: { label: string; href: string }[]
  subscriptionPlan?: 'STARTER' | 'PRO' | 'PREMIUM'
}

const DEFAULT_CONFIG: BoutiqueConfig = {
  primaryColor: "#00BFA6",
}

export default function BoutiquePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params)

  const [config, setConfig] = useState<BoutiqueConfig>(DEFAULT_CONFIG)
  const [announces, setAnnounces] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // Filters
  const [txType, setTxType] = useState<"ALL" | "SALE" | "RENTAL">("ALL")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  // Display style: grid | list | large
  const [displayStyle, setDisplayStyle] = useState<"grid" | "list" | "large">("grid")

  // Banner slider
  const [bannerIndex, setBannerIndex] = useState(0)
  const bannerTimerRef = useRef<any>(null)

  const color = config.primaryColor || "#00BFA6"

  const bannerImages = useMemo(() => {
    if (config.bannerUrls && config.bannerUrls.length > 0) return config.bannerUrls
    if (config.bannerUrl) return [config.bannerUrl]
    return []
  }, [config.bannerUrl, config.bannerUrls])

  useEffect(() => {
    if (bannerImages.length <= 1) return
    bannerTimerRef.current = setInterval(() => {
      setBannerIndex(i => (i + 1) % bannerImages.length)
    }, 5000)
    return () => clearInterval(bannerTimerRef.current)
  }, [bannerImages.length])

  useEffect(() => {
    const fetchAll = async () => {
      let hasConfig = false

      // Boutique config (non bloquant)
      try {
        const cfgRes = await fetch(`/api/boutique/${userId}`)
        if (cfgRes.ok) {
          const cfgData = await cfgRes.json()
          if (cfgData && typeof cfgData === 'object') {
            setConfig({ ...DEFAULT_CONFIG, ...cfgData })
            hasConfig = true
          }
        }
      } catch { /* config optionnelle */ }

      // Announces — endpoint public dédié
      let data: any[] = []
      try {
        const res = await axios.get(`${API_URL}/announces/user/${userId}`)
        data = Array.isArray(res.data) ? res.data : (res.data?.data || [])
      } catch {
        // Fallback: get all and filter client-side
        try {
          const res = await axios.get(`${API_URL}/announces`)
          const all = Array.isArray(res.data) ? res.data : (res.data?.data || [])
          const uid = Number(userId)
          data = all.filter((a: any) => a.user?.id === uid || a.userId === uid)
        } catch { /* réseau inaccessible */ }
      }

      setAnnounces(data)
      // Boutique introuvable seulement si aucune donnée du tout
      if (!hasConfig && data.length === 0) setNotFound(true)
      setLoading(false)
    }
    fetchAll()
  }, [userId])

  const filtered = useMemo(() => {
    return announces.filter(a => {
      const tx = a.type || a.transactionType || a.transaction || a.property?.transaction
      if (txType === "SALE" && tx !== "SALE") return false
      if (txType === "RENTAL" && tx !== "RENTAL") return false

      if (categoryFilter) {
        const pType = a.property?._displayPropertyType || a.property?.propertyType || ""
        const typeObj = PROPERTY_TYPES.find(t => t.id === pType.toUpperCase())
        if (typeObj?.categoryId !== categoryFilter) return false
      }

      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const loc = (a.property?.address?.town?.nameFr || a.property?.address?.town?.city?.nameFr || "").toLowerCase()
        const title = (a.title || "").toLowerCase()
        const ref = (a.reference || "").toLowerCase()
        if (!loc.includes(q) && !title.includes(q) && !ref.includes(q)) return false
      }

      return true
    })
  }, [announces, txType, categoryFilter, searchQuery])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 border-4 border-gray-200 border-t-[#00BFA6] rounded-full animate-spin" />
        <p className="text-gray-500 font-medium">Chargement de la boutique...</p>
      </div>
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">Boutique introuvable</h1>
        <p className="text-gray-500 mt-2">Cette boutique n&apos;existe pas ou n&apos;est plus disponible.</p>
        <Link href="/" className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#00BFA6] text-white rounded-xl font-bold">
          Retour à l&apos;accueil <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )

  const hasContact = config.phone || config.email || config.whatsapp || config.website
  const hasSocial = config.facebook || config.instagram || config.linkedin

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HERO SECTION ── */}
      <div className="relative overflow-hidden" style={{ minHeight: 340 }}>
        {/* Banner: slider or gradient */}
        {bannerImages.length > 0 ? (
          <>
            {bannerImages.map((url, i) => (
              <img
                key={i}
                src={getImageUrl(url)}
                alt="Bannière"
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
                style={{ opacity: i === bannerIndex ? 1 : 0 }}
              />
            ))}
            <div className="absolute inset-0 bg-black/55" />
            {bannerImages.length > 1 && (
              <>
                <button onClick={() => { setBannerIndex(i => (i - 1 + bannerImages.length) % bannerImages.length); clearInterval(bannerTimerRef.current) }} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-colors">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button onClick={() => { setBannerIndex(i => (i + 1) % bannerImages.length); clearInterval(bannerTimerRef.current) }} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-colors">
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                  {bannerImages.map((_, i) => (
                    <button key={i} onClick={() => setBannerIndex(i)} className="h-1.5 rounded-full transition-all" style={{ width: i === bannerIndex ? 20 : 6, backgroundColor: i === bannerIndex ? 'white' : 'rgba(255,255,255,0.4)' }} />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${color} 0%, ${lighten(color, 0.1)} 50%, ${lighten(color, 0.25)} 100%)` }}
          />
        )}

        {/* Immeubles décoratifs SVG */}
        {!config.bannerUrl && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
            viewBox="0 0 1440 400"
          >
            {/* Immeuble tour gauche */}
            <g opacity="0.12" fill="none" stroke="white" strokeWidth="1.5">
              <rect x="30" y="80" width="70" height="320" />
              <rect x="30" y="80" width="70" height="15" fill="white" fillOpacity="0.2" />
              {[110,140,170,200,230,260,290,320,350].map(y => (
                <g key={y}>
                  <rect x="38" y={y} width="14" height="18" rx="1" />
                  <rect x="58" y={y} width="14" height="18" rx="1" />
                  <rect x="78" y={y} width="14" height="18" rx="1" />
                </g>
              ))}
              <line x1="65" y1="75" x2="65" y2="50" />
              <line x1="55" y1="50" x2="75" y2="50" />
            </g>

            {/* Résidence centrale gauche */}
            <g opacity="0.10" fill="none" stroke="white" strokeWidth="1.5">
              <rect x="120" y="160" width="90" height="240" />
              {[185,215,245,275,305,335,365].map(y => (
                <g key={y}>
                  <rect x="130" y={y} width="16" height="20" rx="1" />
                  <rect x="154" y={y} width="16" height="20" rx="1" />
                  <rect x="178" y={y} width="16" height="20" rx="1" />
                </g>
              ))}
              <rect x="148" y="340" width="20" height="60" />
              <path d="M120 160 L165 130 L210 160" />
            </g>

            {/* Petits immeubles milieu gauche */}
            <g opacity="0.08" fill="none" stroke="white" strokeWidth="1.2">
              <rect x="230" y="230" width="55" height="170" />
              {[250,275,300,325,350,375].map(y => (
                <g key={y}>
                  <rect x="238" y={y} width="12" height="14" rx="1" />
                  <rect x="258" y={y} width="12" height="14" rx="1" />
                  <rect x="274" y={y} width="4" height="14" rx="1" />
                </g>
              ))}
            </g>

            {/* Grande tour droite */}
            <g opacity="0.12" fill="none" stroke="white" strokeWidth="1.5">
              <rect x="1320" y="40" width="80" height="360" />
              <rect x="1320" y="40" width="80" height="12" fill="white" fillOpacity="0.15" />
              {[65,95,125,155,185,215,245,275,305,335,365].map(y => (
                <g key={y}>
                  <rect x="1328" y={y} width="16" height="19" rx="1" />
                  <rect x="1352" y={y} width="16" height="19" rx="1" />
                  <rect x="1376" y={y} width="16" height="19" rx="1" />
                </g>
              ))}
              <line x1="1360" y1="35" x2="1360" y2="10" />
              <circle cx="1360" cy="8" r="3" fill="white" fillOpacity="0.3" />
            </g>

            {/* Immeuble résidence droite */}
            <g opacity="0.10" fill="none" stroke="white" strokeWidth="1.5">
              <rect x="1210" y="150" width="95" height="250" />
              <path d="M1210 150 L1257 115 L1305 150" />
              {[170,200,230,260,290,320,350].map(y => (
                <g key={y}>
                  <rect x="1220" y={y} width="17" height="20" rx="1" />
                  <rect x="1245" y={y} width="17" height="20" rx="1" />
                  <rect x="1270" y={y} width="17" height="20" rx="1" />
                </g>
              ))}
              <rect x="1245" y="345" width="18" height="55" />
            </g>

            {/* Petite maison droite */}
            <g opacity="0.08" fill="none" stroke="white" strokeWidth="1.2">
              <rect x="1135" y="260" width="60" height="140" />
              <path d="M1130 260 L1165 225 L1200 260" />
              <rect x="1148" y="325" width="16" height="75" />
              <rect x="1140" y="280" width="14" height="16" rx="1" />
              <rect x="1162" y="280" width="14" height="16" rx="1" />
              <rect x="1140" y="305" width="14" height="16" rx="1" />
              <rect x="1162" y="305" width="14" height="16" rx="1" />
            </g>

            {/* Skyline silhouette légère au sol */}
            <polyline
              points="0,400 0,340 40,340 40,290 80,290 80,260 110,260 110,220 140,220 140,200 200,200 200,240 240,240 240,270 290,270 290,400"
              opacity="0.06" fill="white" stroke="none"
            />
            <polyline
              points="1440,400 1440,330 1400,330 1400,270 1370,270 1370,240 1330,240 1330,200 1295,200 1295,180 1260,180 1260,210 1215,210 1215,250 1170,250 1170,280 1130,280 1130,400"
              opacity="0.06" fill="white" stroke="none"
            />

            {/* Petits points lumineux (fenêtres éclairées) */}
            {[[60,120],[60,150],[60,200],[60,260],[155,175],[155,225],[155,285],[1355,70],[1355,120],[1355,190],[1355,250],[1245,175],[1245,235]].map(([x,y],i) => (
              <circle key={i} cx={x} cy={y} r="2" fill="white" opacity="0.25" />
            ))}
          </svg>
        )}

        {/* Hero content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 flex flex-col items-center text-center">
          {/* Logo */}
          {config.logoUrl && (
            <div className="mb-6">
              <img
                src={getImageUrl(config.logoUrl)}
                alt="Logo"
                className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-xl mx-auto"
              />
            </div>
          )}

          <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-sm leading-tight">
            {config.companyName || "Boutique Immobilière"}
          </h1>

          {config.slogan && (
            <p className="mt-3 text-xl text-white/90 font-medium max-w-xl">
              {config.slogan}
            </p>
          )}

          {config.description && (
            <p className="mt-4 text-white/75 max-w-2xl text-sm leading-relaxed">
              {config.description}
            </p>
          )}

          {/* Stats */}
          <div className="mt-8 flex items-center gap-6 flex-wrap justify-center">
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-5 py-3 text-white text-center">
              <div className="text-2xl font-black">{announces.length}</div>
              <div className="text-xs font-medium opacity-80">Annonces</div>
            </div>
            {announces.filter(a => (a.type || a.transactionType) === 'SALE').length > 0 && (
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-5 py-3 text-white text-center">
                <div className="text-2xl font-black">{announces.filter(a => (a.type || a.transactionType) === 'SALE').length}</div>
                <div className="text-xs font-medium opacity-80">Vente</div>
              </div>
            )}
            {announces.filter(a => (a.type || a.transactionType) === 'RENTAL').length > 0 && (
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-5 py-3 text-white text-center">
                <div className="text-2xl font-black">{announces.filter(a => (a.type || a.transactionType) === 'RENTAL').length}</div>
                <div className="text-xs font-medium opacity-80">Location</div>
              </div>
            )}
          </div>

          {/* Contact + Social buttons */}
          <div className="mt-8 flex flex-col items-center gap-3">
            {hasContact && (
              <div className="flex flex-wrap gap-3 justify-center">
                {config.phone && (
                  <a href={`tel:${config.phone}`} className="flex items-center gap-2 bg-white text-gray-900 px-5 py-2.5 rounded-full font-bold text-sm shadow hover:shadow-lg transition-all">
                    <Phone className="h-4 w-4" style={{ color }} /> {config.phone}
                  </a>
                )}
                {config.whatsapp && (
                  <a href={`https://wa.me/${config.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" className="flex items-center gap-2 bg-green-500 text-white px-5 py-2.5 rounded-full font-bold text-sm shadow hover:shadow-lg transition-all">
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                )}
                {config.email && (
                  <a href={`mailto:${config.email}`} className="flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/40 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-white/30 transition-all">
                    <Mail className="h-4 w-4" /> Email
                  </a>
                )}
                {config.website && (
                  <a href={config.website} target="_blank" className="flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/40 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-white/30 transition-all">
                    <Globe className="h-4 w-4" /> Site web
                  </a>
                )}
              </div>
            )}

            {/* Social icons row */}
            {hasSocial && (
              <div className="flex items-center gap-3 mt-1">
                {config.facebook && (
                  <a href={config.facebook} target="_blank" className="h-9 w-9 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 flex items-center justify-center text-white transition-all" title="Facebook">
                    <Facebook className="h-4 w-4" />
                  </a>
                )}
                {config.instagram && (
                  <a href={config.instagram.startsWith('http') ? config.instagram : `https://instagram.com/${config.instagram.replace('@', '')}`} target="_blank" className="h-9 w-9 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 flex items-center justify-center text-white transition-all" title="Instagram">
                    <Instagram className="h-4 w-4" />
                  </a>
                )}
                {config.linkedin && (
                  <a href={config.linkedin} target="_blank" className="h-9 w-9 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 flex items-center justify-center text-white transition-all" title="LinkedIn">
                    <Linkedin className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Badge abonnement */}
          {config.subscriptionPlan && config.subscriptionPlan !== 'STARTER' && (
            <div className="mt-5">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-white/20 border border-white/40 text-white">
                {config.subscriptionPlan === 'PREMIUM' ? <Crown className="h-3.5 w-3.5 text-yellow-300" /> : <Star className="h-3.5 w-3.5 text-blue-300" />}
                Boutique {config.subscriptionPlan === 'PREMIUM' ? 'Premium' : 'Pro'} · Patrimoine.dz
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── MENU NAVIGATION ── */}
      {config.menuItems && config.menuItems.length > 0 && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-4">
            <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0">
              {config.menuItems.map((item, i) => (
                <a
                  key={i}
                  href={item.href || '#'}
                  className="px-5 py-3.5 text-sm font-bold text-gray-600 hover:text-gray-900 whitespace-nowrap border-b-2 border-transparent hover:border-gray-300 transition-all"
                  style={{}}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* ── FILTER BAR ── */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Transaction type tabs */}
            <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
              {[
                { id: "ALL", label: "Tout" },
                { id: "SALE", label: "Vente" },
                { id: "RENTAL", label: "Location" },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTxType(t.id as any)}
                  className="px-4 py-1.5 rounded-lg text-sm font-bold transition-all"
                  style={txType === t.id ? { backgroundColor: color, color: 'white' } : { color: '#6b7280' }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex-1 min-w-[180px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Rechercher une ville, référence..."
                className="w-full pl-9 pr-4 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-[#00BFA6] outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Category filter */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="appearance-none pl-4 pr-8 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium focus:border-[#00BFA6] outline-none bg-white cursor-pointer"
              >
                <option value="">Toutes catégories</option>
                {REAL_ESTATE_CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            </div>

            {/* Results count + display style toggle */}
            <div className="flex items-center gap-3 ml-auto">
              <div className="text-sm text-gray-500 font-medium">
                <span className="font-bold text-gray-900">{filtered.length}</span> annonce{filtered.length !== 1 ? 's' : ''}
              </div>
              <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
                <button onClick={() => setDisplayStyle("grid")} className={`p-1.5 rounded-md transition-colors ${displayStyle === "grid" ? "bg-white shadow text-gray-900" : "text-gray-400 hover:text-gray-600"}`} title="Grille classique">
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button onClick={() => setDisplayStyle("large")} className={`p-1.5 rounded-md transition-colors ${displayStyle === "large" ? "bg-white shadow text-gray-900" : "text-gray-400 hover:text-gray-600"}`} title="Grandes cartes">
                  <LayoutDashboard className="h-4 w-4" />
                </button>
                <button onClick={() => setDisplayStyle("list")} className={`p-1.5 rounded-md transition-colors ${displayStyle === "list" ? "bg-white shadow text-gray-900" : "text-gray-400 hover:text-gray-600"}`} title="Liste">
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ANNOUNCES ── */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <Building2 className="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-500">Aucune annonce trouvée</h3>
            <p className="text-gray-400 mt-2 text-sm">Essayez de modifier vos filtres de recherche</p>
            {(txType !== "ALL" || categoryFilter || searchQuery) && (
              <button
                onClick={() => { setTxType("ALL"); setCategoryFilter(""); setSearchQuery(""); }}
                className="mt-4 px-5 py-2 rounded-xl font-bold text-sm text-white"
                style={{ backgroundColor: color }}
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        ) : displayStyle === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(a => <PropertyCard key={a.id} announce={a} />)}
          </div>
        ) : displayStyle === "large" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(a => {
              const img = a.property?.images?.find((i: any) => i.isMain) || a.property?.images?.[0]
              const city = a.property?.address?.town?.city?.nameFr || a.property?.address?.town?.nameFr || ''
              const tx = a.type || a.transactionType || a.transaction
              return (
                <a key={a.id} href={`/announces/${a.id}`} className="group bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="h-56 bg-gray-100 overflow-hidden relative">
                    {img ? <img src={`${API_URL}/${img.url?.replace(/\\/g, '/')}`} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-100 flex items-center justify-center"><Building2 className="h-12 w-12 text-gray-300" /></div>}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: tx === 'SALE' ? '#ef4444' : color }}>{tx === 'SALE' ? 'Vente' : tx === 'RENTAL' ? 'Location' : 'Annonce'}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 text-base group-hover:text-[#00BFA6] transition-colors line-clamp-2">
                      {a.title || PROPERTY_TYPES?.find((t: any) => t.id === a.property?.propertyType?.toUpperCase())?.label || a.property?.propertyType}
                    </h3>
                    {city && <p className="flex items-center gap-1 text-gray-500 text-sm mt-2"><MapPin className="h-3.5 w-3.5 shrink-0" />{city}</p>}
                    <div className="mt-4 flex items-center justify-between">
                      <span className="font-black text-xl" style={{ color }}>{a.price ? `${Number(a.price).toLocaleString()} DZD` : 'Prix sur demande'}</span>
                      <span className="text-xs text-gray-400">{a.reference}</span>
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
        ) : (
          // Liste horizontale
          <div className="flex flex-col gap-4">
            {filtered.map(a => {
              const img = a.property?.images?.find((i: any) => i.isMain) || a.property?.images?.[0]
              const city = a.property?.address?.town?.city?.nameFr || a.property?.address?.town?.nameFr || ''
              const tx = a.type || a.transactionType || a.transaction
              const pType = PROPERTY_TYPES?.find((t: any) => t.id === a.property?.propertyType?.toUpperCase())?.label || a.property?.propertyType
              return (
                <a key={a.id} href={`/announces/${a.id}`} className="group flex bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
                  <div className="w-44 h-36 shrink-0 overflow-hidden bg-gray-100">
                    {img ? <img src={`${API_URL}/${img.url?.replace(/\\/g, '/')}`} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full bg-gray-100 flex items-center justify-center"><Building2 className="h-8 w-8 text-gray-300" /></div>}
                  </div>
                  <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-gray-900 text-base group-hover:text-[#00BFA6] transition-colors line-clamp-1">{a.title || pType}</h3>
                        <span className="shrink-0 px-2.5 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: tx === 'SALE' ? '#ef4444' : color }}>{tx === 'SALE' ? 'Vente' : tx === 'RENTAL' ? 'Location' : 'Annonce'}</span>
                      </div>
                      {pType && a.title && <p className="text-sm text-gray-500 mt-0.5">{pType}</p>}
                      {city && <p className="flex items-center gap-1 text-gray-500 text-sm mt-1"><MapPin className="h-3.5 w-3.5 shrink-0" />{city}</p>}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-black text-lg" style={{ color }}>{a.price ? `${Number(a.price).toLocaleString()} DZD` : 'Prix sur demande'}</span>
                      <span className="text-xs text-gray-400 font-medium">Réf: {a.reference}</span>
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <footer className="mt-10 text-white" style={{ backgroundColor: color }}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Column 1: Brand */}
            <div>
              {config.logoUrl && (
                <img src={getImageUrl(config.logoUrl)} alt="Logo" className="h-16 w-16 rounded-full object-cover border-2 border-white/30 mb-4" />
              )}
              <h3 className="text-xl font-black">{config.companyName || "Notre Boutique"}</h3>
              {config.slogan && <p className="mt-2 text-white/75 text-sm">{config.slogan}</p>}
              {config.description && <p className="mt-3 text-white/60 text-xs leading-relaxed">{config.description}</p>}
            </div>

            {/* Column 2: Contact */}
            {hasContact && (
              <div>
                <h4 className="font-bold text-white/90 mb-4 uppercase text-xs tracking-widest">Contact</h4>
                <div className="space-y-3">
                  {config.phone && (
                    <a href={`tel:${config.phone}`} className="flex items-center gap-3 text-white/80 hover:text-white transition-colors text-sm">
                      <Phone className="h-4 w-4 shrink-0" /> {config.phone}
                    </a>
                  )}
                  {config.whatsapp && (
                    <a href={`https://wa.me/${config.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" className="flex items-center gap-3 text-white/80 hover:text-white transition-colors text-sm">
                      <MessageCircle className="h-4 w-4 shrink-0" /> WhatsApp: {config.whatsapp}
                    </a>
                  )}
                  {config.email && (
                    <a href={`mailto:${config.email}`} className="flex items-center gap-3 text-white/80 hover:text-white transition-colors text-sm">
                      <Mail className="h-4 w-4 shrink-0" /> {config.email}
                    </a>
                  )}
                  {config.website && (
                    <a href={config.website} target="_blank" className="flex items-center gap-3 text-white/80 hover:text-white transition-colors text-sm">
                      <Globe className="h-4 w-4 shrink-0" /> {config.website.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Column 3: Social */}
            {hasSocial && (
              <div>
                <h4 className="font-bold text-white/90 mb-4 uppercase text-xs tracking-widest">Réseaux sociaux</h4>
                <div className="flex flex-wrap gap-3">
                  {config.facebook && (
                    <a href={config.facebook} target="_blank" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-4 py-2.5 text-white text-sm font-medium transition-colors">
                      <Facebook className="h-4 w-4" /> Facebook
                    </a>
                  )}
                  {config.instagram && (
                    <a href={config.instagram.startsWith('http') ? config.instagram : `https://instagram.com/${config.instagram.replace('@', '')}`} target="_blank" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-4 py-2.5 text-white text-sm font-medium transition-colors">
                      <Instagram className="h-4 w-4" /> Instagram
                    </a>
                  )}
                  {config.linkedin && (
                    <a href={config.linkedin} target="_blank" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-4 py-2.5 text-white text-sm font-medium transition-colors">
                      <Linkedin className="h-4 w-4" /> LinkedIn
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-10 pt-6 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/50 text-xs">
              © {new Date().getFullYear()} {config.companyName || "Boutique"} — Tous droits réservés
            </p>
            <Link href="/" className="flex items-center gap-1.5 text-white/50 hover:text-white/80 transition-colors text-xs">
              Propulsé par <span className="font-bold">Patrimoine.dz</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
