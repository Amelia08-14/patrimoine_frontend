"use client"

import { SelectMenu } from "@/components/ui/select-menu"
import { useState, useEffect, useMemo, use, useRef } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import axios from "axios"
import {
  Phone, Mail, MessageCircle, Globe, Facebook, Instagram, Linkedin,
  ChevronDown, Search, Building2, X, ArrowRight,
  Store, LayoutGrid, List, LayoutDashboard, ChevronLeft, ChevronRight,
  Star, Crown, MapPin, Bell, Send, Heart, Share2, Eye, Link2
} from "lucide-react"
import { PROPERTY_TYPES, PUBLIC_CATEGORIES } from "@/data/propertyTypes"
import { usePropertyTypeLabel } from "@/lib/typeLabels"
import { PropertyCard } from "@/components/PropertyCard"
import { WILAYAS } from "@/data/wilayas"
import { COMMUNES } from "@/data/communes"

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
  headerColor?: string
  footerColor?: string
  bodyColor?: string
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
  logoShape?: 'round' | 'rectangle' | 'none'
  filterColor?: string
  storyColor?: string
  fontFamily?: string
  headerTextColor?: string
  footerTextColor?: string
  secondLogoUrl?: string
  secondLogoShape?: 'round' | 'rectangle' | 'none'
  logoAlignment?: 'center' | 'sides'
  aboutImage?: string
  aboutDescription?: string
  aboutButtonLabel?: string
  aboutButtonUrl?: string
  stories?: { url: string; type: 'image' | 'video'; label?: string; link?: string; linkLabel?: string; views?: number; likes?: number }[]
}

type Story = { url: string; type: 'image' | 'video'; label?: string; link?: string; linkLabel?: string; views?: number; likes?: number }

const DEFAULT_CONFIG: BoutiqueConfig = {
  primaryColor: "#00BFA6",
}

// Un simple rond cliquable — l'ouverture est gérée par le parent pour permettre de naviguer
// entre toutes les stories (compteur + précédent/suivant), pas seulement celle-ci.
function StoryCircle({ story, color, onOpen }: { story: Story; color: string; onOpen: () => void }) {
  return (
    <button onClick={onOpen} className="flex flex-col items-center gap-1.5 shrink-0 group">
      <div className="h-16 w-16 rounded-full overflow-hidden border-[3px] p-0.5 transition-transform group-hover:scale-105" style={{ borderColor: color }}>
        <div className="h-full w-full rounded-full overflow-hidden bg-gray-100">
          {story.type === 'video' ? (
            <video src={getImageUrl(story.url)} className="h-full w-full object-cover" muted playsInline />
          ) : (
            <img src={getImageUrl(story.url)} alt="" className="h-full w-full object-cover" />
          )}
        </div>
      </div>
      {/* `block` est indispensable : max-width n'a aucun effet sur un <span> inline, ce qui
          laissait le titre déborder du rond au lieu d'être tronqué. `title` permet de voir le
          titre complet au survol quand il est tronqué. */}
      <span className="block text-[10px] font-semibold text-gray-600 max-w-[64px] truncate" title={story.label || undefined}>
        {story.label || 'Story'}
      </span>
    </button>
  )
}

// Visionneuse plein écran — navigation précédent/suivant avec compteur, titre en haut,
// et colonne d'actions à droite (aimer, partager, vues, lien externe optionnel).
function StoryViewer({
  stories, index, onIndex, onClose, color, userId,
}: {
  stories: Story[]; index: number; onIndex: (i: number) => void; onClose: () => void; color: string; userId: string
}) {
  const story = stories[index]
  const [views, setViews] = useState(story.views || 0)
  const [likes, setLikes] = useState(story.likes || 0)
  const [liked, setLiked] = useState(false)
  const [shared, setShared] = useState(false)
  const viewedRef = useRef<Set<number>>(new Set())

  useEffect(() => {
    const current = stories[index]
    setViews(current.views || 0)
    setLikes(current.likes || 0)
    setLiked(typeof window !== 'undefined' && localStorage.getItem(`story-liked-${userId}-${index}`) === '1')

    // Une vue comptée par ouverture de story dans cette session de visionnage (évite qu'un
    // aller-retour immédiat entre deux stories ne gonfle artificiellement le compteur).
    if (!viewedRef.current.has(index)) {
      viewedRef.current.add(index)
      fetch(`/api/boutique/${userId}/stories/${index}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'view' }),
      })
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d) setViews(d.views) })
        .catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, userId])

  const toggleLike = async () => {
    const nextLiked = !liked
    setLiked(nextLiked)
    setLikes(l => l + (nextLiked ? 1 : -1))
    try {
      localStorage.setItem(`story-liked-${userId}-${index}`, nextLiked ? '1' : '0')
    } catch { /* ignore */ }
    try {
      const res = await fetch(`/api/boutique/${userId}/stories/${index}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: nextLiked ? 'like' : 'unlike' }),
      })
      if (res.ok) { const d = await res.json(); setLikes(d.likes) }
    } catch { /* ignore */ }
  }

  const share = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    try {
      if (navigator.share) {
        await navigator.share({ title: story.label || 'Story', url })
      } else {
        await navigator.clipboard.writeText(url)
        setShared(true)
        setTimeout(() => setShared(false), 2000)
      }
    } catch { /* partage annulé par l'utilisateur */ }
  }

  const goPrev = () => onIndex(index > 0 ? index - 1 : stories.length - 1)
  const goNext = () => onIndex(index < stories.length - 1 ? index + 1 : 0)

  return (
    <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center" onClick={onClose}>
      <div className="relative flex items-center gap-3" onClick={e => e.stopPropagation()}>
        {/* Précédent */}
        {stories.length > 1 && (
          <button onClick={goPrev} aria-label="Story précédente" className="hidden sm:flex h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center text-white shrink-0">
            <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
          </button>
        )}

        <div className="relative" style={{ width: 'min(100vw, 400px)', aspectRatio: '9/16' }}>
          {/* Fondu léger derrière la barre du haut — lisible sur n'importe quelle image, sans l'assombrir */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/35 to-transparent rounded-t-2xl pointer-events-none" />

          {/* Barre de progression + titre — en haut */}
          <div className="absolute top-0 left-0 right-0 z-10 px-3 pt-3">
            {stories.length > 1 && (
              <div className="flex gap-1 mb-2">
                {stories.map((_, i) => (
                  <div key={i} className="h-1 flex-1 rounded-full bg-white/30 overflow-hidden">
                    <div className="h-full bg-white" style={{ width: i < index ? '100%' : i === index ? '100%' : '0%', opacity: i <= index ? 1 : 0 }} />
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {/* Petit fond derrière le titre — juste assez pour rester lisible sans être trop sombre */}
                <p className="text-white font-bold text-sm truncate bg-black/35 backdrop-blur-sm rounded-full px-2.5 py-1">{story.label || 'Story'}</p>
                {stories.length > 1 && (
                  <span className="text-white/80 text-xs font-bold shrink-0 bg-black/35 backdrop-blur-sm rounded-full px-2 py-1">{index + 1}/{stories.length}</span>
                )}
              </div>
              <button onClick={onClose} className="h-8 w-8 bg-black/40 rounded-full flex items-center justify-center text-white shrink-0">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {story.type === 'video' ? (
            <video key={story.url} src={getImageUrl(story.url)} className="w-full h-full object-contain rounded-2xl" autoPlay controls />
          ) : (
            <img key={story.url} src={getImageUrl(story.url)} alt="" className="w-full h-full object-contain rounded-2xl" />
          )}

          {/* Zones cliquables gauche/droite pour naviguer (mobile, en plus des flèches) */}
          {stories.length > 1 && (
            <>
              <button onClick={goPrev} aria-label="Précédent" className="absolute inset-y-0 left-0 w-1/4 sm:hidden" />
              <button onClick={goNext} aria-label="Suivant" className="absolute inset-y-0 right-0 w-1/4 sm:hidden" />
            </>
          )}
        </div>

        {/* Colonne d'actions à droite : aimer, partager, vues, lien externe */}
        <div className="flex flex-col items-center gap-4 shrink-0">
          <button onClick={toggleLike} className="flex flex-col items-center gap-1 text-white">
            <span className="h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <Heart className={`h-5 w-5 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
            </span>
            <span className="text-xs font-bold">{likes}</span>
          </button>
          <button onClick={share} className="flex flex-col items-center gap-1 text-white">
            <span className="h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <Share2 className="h-5 w-5" />
            </span>
            <span className="text-xs font-bold">{shared ? 'Copié' : 'Partager'}</span>
          </button>
          <div className="flex flex-col items-center gap-1 text-white">
            <span className="h-11 w-11 rounded-full bg-white/10 flex items-center justify-center">
              <Eye className="h-5 w-5" />
            </span>
            <span className="text-xs font-bold">{views}</span>
          </div>
          {story.link && (
            <a href={story.link} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 text-white" style={{ color }}>
              <span className="h-11 w-11 rounded-full flex items-center justify-center" style={{ backgroundColor: color }}>
                <Link2 className="h-5 w-5 text-white" />
              </span>
              <span className="text-[10px] font-bold text-white max-w-[64px] truncate text-center">{story.linkLabel || 'Lien'}</span>
            </a>
          )}
        </div>

        {/* Suivant */}
        {stories.length > 1 && (
          <button onClick={goNext} aria-label="Story suivante" className="hidden sm:flex h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center text-white shrink-0">
            <ChevronRight className="h-5 w-5 rtl:rotate-180" />
          </button>
        )}
      </div>
    </div>
  )
}

export default function BoutiquePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId: rawParam } = use(params)

  const [resolvedUserId, setResolvedUserId] = useState<string | null>(
    /^\d+$/.test(rawParam) ? rawParam : null
  )
  const [config, setConfig] = useState<BoutiqueConfig>(DEFAULT_CONFIG)
  const [announces, setAnnounces] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [boutiqueInactive, setBoutiqueInactive] = useState(false)

  // Filters
  const [txType, setTxType] = useState<"ALL" | "SALE" | "RENTAL">("ALL")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [wilayas, setWilayas] = useState("")
  const [commune, setCommune] = useState("")

  // Display style: grid | list | large
  const [displayStyle, setDisplayStyle] = useState<"grid" | "list" | "large">("grid")

  // Banner slider
  const [bannerIndex, setBannerIndex] = useState(0)

  // Visionneuse de story plein écran — null = fermée, sinon index de la story affichée
  // (permet la navigation précédent/suivant avec compteur entre toutes les stories).
  const [storyViewerIndex, setStoryViewerIndex] = useState<number | null>(null)

  // Abonnés à la boutique — compteur réel (repris ensuite dans les statistiques du pro).
  const [followerCount, setFollowerCount] = useState(0)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  // Messagerie interne — "Envoyer un message" ouvre une fenêtre qui poste un vrai Message vers le
  // propriétaire de la boutique (avant : lien vers /messages?to=, une route qui n'existe pas → 404).
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [msgOpen, setMsgOpen] = useState(false)
  const [msgText, setMsgText] = useState("")
  const [msgSending, setMsgSending] = useState(false)
  const [msgSent, setMsgSent] = useState(false)
  const [msgError, setMsgError] = useState("")
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user')
      if (userStr) setCurrentUserId(JSON.parse(userStr)?.id ?? null)
    } catch {}
  }, [])
  const bannerTimerRef = useRef<any>(null)

  const headerColor = config.headerColor || config.primaryColor || "#00BFA6"
  const footerColor = config.footerColor || config.primaryColor || "#00BFA6"
  const bodyColor = config.bodyColor || "#F9FAFB"
  const filterColor = config.filterColor || headerColor
  const storyColor = config.storyColor || headerColor
  const headerTextColor = config.headerTextColor || "#ffffff"
  const footerTextColor = config.footerTextColor || "#ffffff"
  const fontFamily = config.fontFamily || ""
  const color = headerColor

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

      // Résoudre slug → userId si le param n'est pas numérique
      let userId = rawParam
      if (!/^\d+$/.test(rawParam)) {
        try {
          const slugRes = await fetch(`/api/boutique/slug/${rawParam}`)
          if (!slugRes.ok) { setNotFound(true); setLoading(false); return }
          const slugData = await slugRes.json()
          if (!slugData?.userId) { setNotFound(true); setLoading(false); return }
          userId = String(slugData.userId)
          setResolvedUserId(userId)
          setConfig({ ...DEFAULT_CONFIG, ...slugData })
          hasConfig = true
        } catch { setNotFound(true); setLoading(false); return }
      }

      // Vérifier que la boutique est active (abonnement validé)
      try {
        const subRes = await fetch(`${API_URL}/boutique-sub/public/${userId}/active`)
        const subData = subRes.ok ? await subRes.json() : null
        if (!subData) { setBoutiqueInactive(true); setLoading(false); return }
      } catch { setBoutiqueInactive(true); setLoading(false); return }

      // Boutique config (seulement si pas déjà chargée via slug)
      if (!hasConfig) {
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
      }

      // Announces — endpoint public dédié
      let data: any[] = []
      try {
        const res = await axios.get(`${API_URL}/announces/user/${userId}`)
        data = Array.isArray(res.data) ? res.data : (res.data?.data || [])
      } catch {
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
  }, [rawParam])

  const ownerId = resolvedUserId

  useEffect(() => {
    if (!ownerId) return
    let followerId: number | undefined
    try {
      const userStr = localStorage.getItem('user')
      if (userStr) followerId = JSON.parse(userStr)?.id
    } catch { /* ignore */ }
    const qs = followerId ? `?followerId=${followerId}` : ''
    fetch(`${API_URL}/boutique-sub/follow/${ownerId}/status${qs}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) { setFollowerCount(d.count); setIsFollowing(d.following) } })
      .catch(() => {})
  }, [ownerId])

  // Suivi des clics sur les boutons de contact de la boutique (pas liés à une annonce précise) —
  // repris dans "Mes statistiques" du pro sous "Contacts via boutique".
  const trackBoutiqueContact = (channel: 'CALL' | 'WHATSAPP' | 'EMAIL') => {
    if (!ownerId) return
    fetch(`${API_URL}/boutique-sub/${ownerId}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel }),
      keepalive: true,
    }).catch(() => {})
  }

  const sendBoutiqueMessage = async () => {
    if (!msgText.trim() || !ownerId) return
    setMsgSending(true)
    setMsgError("")
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('NO_TOKEN')
      const res = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ receiverId: Number(ownerId), content: msgText.trim() }),
      })
      if (!res.ok) throw new Error()
      setMsgSent(true)
    } catch {
      setMsgError(tm('messageErrorGeneric'))
    } finally {
      setMsgSending(false)
    }
  }

  const toggleFollow = async () => {
    if (!ownerId) return
    const token = localStorage.getItem('token')
    if (!token) { window.location.href = '/auth/login'; return }
    setFollowLoading(true)
    try {
      const nextFollowing = !isFollowing
      const res = await fetch(`${API_URL}/boutique-sub/${nextFollowing ? 'follow' : 'unfollow'}/${ownerId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const d = await res.json()
        setIsFollowing(d.following)
        setFollowerCount(d.count)
      }
    } catch { /* ignore */ } finally {
      setFollowLoading(false)
    }
  }

  const availableCategories = useMemo(() => {
    const catIds = new Set<string>()
    announces.forEach(a => {
      const pType = (a.property?.propertyType || "").toUpperCase()
      const typeObj = PROPERTY_TYPES.find(t => t.id === pType)
      if ((typeObj as any)?.categoryId) catIds.add((typeObj as any).categoryId)
    })
    return PUBLIC_CATEGORIES.filter(c => catIds.has(c.id))
  }, [announces])

  // Toutes les wilayas et communes d'Algérie — pas seulement celles où ce pro a déjà une
  // annonce, pour que le filtre reste complet même quand la boutique démarre avec peu de biens.
  const availableWilayas = useMemo(() => WILAYAS.map(w => w.name), [])

  const availableCommunes = useMemo(() => {
    const selected = WILAYAS.find(w => w.name === wilayas)
    if (!selected) return []
    return COMMUNES.filter(c => c.wilayaCode === selected.code).map(c => c.name)
  }, [wilayas])

  const filtered = useMemo(() => {
    return announces.filter(a => {
      const tx = a.type || a.transactionType || a.transaction || a.property?.transaction
      if (txType === "SALE" && tx !== "SALE") return false
      if (txType === "RENTAL" && tx !== "RENTAL") return false

      if (categoryFilter) {
        const pType = (a.property?.propertyType || "").toUpperCase()
        const typeObj = PROPERTY_TYPES.find(t => t.id === pType)
        if ((typeObj as any)?.categoryId !== categoryFilter) return false
      }

      if (wilayas) {
        const city = a.property?.address?.town?.city?.nameFr || ""
        if (city !== wilayas) return false
      }

      if (commune) {
        const town = a.property?.address?.town?.nameFr || ""
        if (town !== commune) return false
      }

      return true
    })
  }, [announces, txType, categoryFilter, wilayas, commune])

  const t = useTranslations('Boutique')
  const tm = useTranslations('AnnounceDetail')
  const ptLabel = usePropertyTypeLabel()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 border-4 border-gray-200 border-t-[#00BFA6] rounded-full animate-spin" />
        <p className="text-gray-500 font-medium">{t('loadingStore')}</p>
      </div>
    </div>
  )

  if (boutiqueInactive) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-sm">
        <div className="h-20 w-20 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-5">
          <Store className="h-10 w-10 text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{t('storeUnavailable')}</h1>
        <p className="text-gray-500 mt-2 text-sm">{t('storeUnavailableDesc')}</p>
        <Link href="/" className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#00BFA6] text-white rounded-xl font-bold text-sm">
          {t('backHome')} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
        </Link>
      </div>
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">{t('storeNotFound')}</h1>
        <p className="text-gray-500 mt-2">{t('storeNotFoundDesc')}</p>
        <Link href="/" className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#00BFA6] text-white rounded-xl font-bold">
          {t('backHome')} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
        </Link>
      </div>
    </div>
  )

  const hasContact = config.phone || config.email || config.whatsapp || config.website
  const hasSocial = config.facebook || config.instagram || config.linkedin

  return (
    <div className="min-h-screen" style={{ backgroundColor: bodyColor, fontFamily: fontFamily || undefined }}>
      {/* Google Font loader */}
      {fontFamily && (
        <link
          rel="stylesheet"
          href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@400;500;600;700;900&display=swap`}
        />
      )}

      {/* ── EN-TÊTE DE LA BOUTIQUE ── (retour client du 09/11/2026) : l'ancienne grande bande colorée
          (logos, nom, slogan, contacts, boutons) est fusionnée avec la barre de menu en UNE barre compacte,
          avant la bannière : identité à gauche, menu au centre, contacts / réseaux / actions à droite. Sur
          mobile les trois groupes passent les uns sous les autres, le menu défile horizontalement. */}
      {(() => {
        const shape1 = config.logoShape || 'round'
        const shape2 = config.secondLogoShape || 'round'
        const sc = (sh: string) => sh === 'round' ? 'rounded-full' : sh === 'rectangle' ? 'rounded-xl' : 'rounded-none'
        const ring = (sh: string) => sh !== 'none' ? 'border-2 border-white/80 shadow-md' : ''
        const secondAtEnd = config.logoAlignment === 'sides' && !!config.logoUrl && !!config.secondLogoUrl
        const iconBtn = "h-9 w-9 shrink-0 rounded-full bg-white/15 hover:bg-white/25 border border-white/30 flex items-center justify-center text-white transition-colors"
        return (
          <header className="relative" style={{ background: `linear-gradient(135deg, ${color} 0%, ${lighten(color, 0.1)} 55%, ${lighten(color, 0.22)} 100%)` }}>
            <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap lg:flex-nowrap items-center gap-x-6 gap-y-3">
              {/* Identité */}
              <div className="flex min-w-0 items-center gap-3">
                {config.logoUrl && <img src={getImageUrl(config.logoUrl)} alt="Logo" className={`h-12 w-12 shrink-0 object-contain bg-white ${sc(shape1)} ${ring(shape1)}`} />}
                {config.secondLogoUrl && !secondAtEnd && <img src={getImageUrl(config.secondLogoUrl)} alt="Logo 2" className={`h-10 w-10 shrink-0 object-contain bg-white ${sc(shape2)} ${ring(shape2)}`} />}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <h1 className="truncate text-lg md:text-xl font-black leading-tight" style={{ color: headerTextColor }}>
                      {config.companyName || "Boutique Immobilière"}
                    </h1>
                    {config.subscriptionPlan && config.subscriptionPlan !== 'STARTER' && (
                      <span className="hidden sm:inline-flex shrink-0 items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 border border-white/40 text-white">
                        {config.subscriptionPlan === 'PREMIUM' ? <Crown className="h-3 w-3 text-yellow-300" /> : <Star className="h-3 w-3 text-blue-300" />}
                        {config.subscriptionPlan === 'PREMIUM' ? 'Premium' : 'Pro'}
                      </span>
                    )}
                  </div>
                  {config.slogan && <p className="truncate text-xs md:text-sm font-medium" style={{ color: headerTextColor, opacity: 0.85 }}>{config.slogan}</p>}
                </div>
              </div>

              {/* Menu de la boutique */}
              {config.menuItems && config.menuItems.length > 0 && (
                <nav className="order-last lg:order-none w-full lg:w-auto lg:flex-1 min-w-0 flex items-center gap-1 overflow-x-auto hide-scrollbar lg:justify-center border-t border-white/20 pt-2 lg:border-0 lg:pt-0">
                  {config.menuItems.map((item, i) => (
                    <a
                      key={i}
                      href={item.href || '#'}
                      className="px-3 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors hover:bg-white/15"
                      style={{ color: headerTextColor }}
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
              )}

              {/* Contacts, réseaux et actions */}
              <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap lg:ms-auto">
                {config.phone && (
                  <a href={`tel:${config.phone}`} onClick={() => trackBoutiqueContact('CALL')} className="flex items-center gap-1.5 bg-white text-gray-900 px-3 py-2 rounded-full font-bold text-xs md:text-sm shadow-sm hover:shadow transition-all whitespace-nowrap">
                    <Phone className="h-3.5 w-3.5" style={{ color }} /> {config.phone}
                  </a>
                )}
                {config.whatsapp && (
                  <a href={`https://wa.me/${config.whatsapp.replace(/[^0-9]/g, '')}`} onClick={() => trackBoutiqueContact('WHATSAPP')} target="_blank" title="WhatsApp" aria-label="WhatsApp" className="h-9 w-9 shrink-0 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white transition-colors">
                    <MessageCircle className="h-4 w-4" />
                  </a>
                )}
                {config.email && (
                  <a href={`mailto:${config.email}`} onClick={() => trackBoutiqueContact('EMAIL')} title="Email" aria-label="Email" className={iconBtn}>
                    <Mail className="h-4 w-4" />
                  </a>
                )}
                {config.website && (
                  <a href={config.website} target="_blank" title="Web" aria-label="Web" className={iconBtn}>
                    <Globe className="h-4 w-4" />
                  </a>
                )}
                {config.facebook && (
                  <a href={config.facebook} target="_blank" aria-label="Facebook" className={iconBtn}><Facebook className="h-4 w-4" /></a>
                )}
                {config.instagram && (
                  <a href={config.instagram.startsWith('http') ? config.instagram : `https://instagram.com/${config.instagram.replace('@', '')}`} target="_blank" aria-label="Instagram" className={iconBtn}><Instagram className="h-4 w-4" /></a>
                )}
                {config.linkedin && (
                  <a href={config.linkedin} target="_blank" aria-label="LinkedIn" className={iconBtn}><Linkedin className="h-4 w-4" /></a>
                )}
                {(hasContact || hasSocial) && <span className="h-6 w-px bg-white/30 mx-0.5" />}
                <button
                  type="button"
                  onClick={() => setMsgOpen(true)}
                  title={tm('sendMessage')}
                  className="flex items-center gap-1.5 bg-white/15 border border-white/40 px-3 py-2 rounded-full font-bold text-xs md:text-sm hover:bg-white/25 transition-colors whitespace-nowrap"
                  style={{ color: headerTextColor }}
                >
                  <Send className="h-3.5 w-3.5" /> <span className="hidden sm:inline">{tm('sendMessage')}</span>
                </button>
                <button
                  className={`flex items-center gap-1.5 border px-3 py-2 rounded-full font-bold text-xs md:text-sm transition-colors whitespace-nowrap disabled:opacity-60 ${isFollowing ? 'bg-white/35 border-white/60' : 'bg-white/15 border-white/40 hover:bg-white/25'}`}
                  style={{ color: headerTextColor }}
                  onClick={toggleFollow}
                  disabled={followLoading}
                >
                  <Bell className={`h-3.5 w-3.5 ${isFollowing ? 'fill-current' : ''}`} />
                  {isFollowing ? 'Abonné' : "S'abonner"}
                  {followerCount > 0 && <span className="opacity-80">· {followerCount}</span>}
                </button>
                {secondAtEnd && <img src={getImageUrl(config.secondLogoUrl!)} alt="Logo 2" className={`hidden lg:block h-11 w-11 shrink-0 object-contain bg-white ${sc(shape2)} ${ring(shape2)}`} />}
              </div>
            </div>
            {config.description && (
              <div className="max-w-6xl mx-auto px-4 pb-3 -mt-1">
                <p className="text-xs md:text-sm leading-relaxed line-clamp-2 whitespace-pre-line break-words [overflow-wrap:anywhere]" style={{ color: headerTextColor, opacity: 0.75 }}>
                  {config.description}
                </p>
              </div>
            )}
          </header>
        )
      })()}

      {/* ── BANNIÈRE ── bloc à part, APRÈS le menu et AVANT le hero (retour client du 25/10/2026) :
          ratio fixe 1920×400 (= 24/5, la taille exigée dans l'éditeur) pour que l'image s'affiche
          entière, sans voile ni texte par-dessus. Avant, elle servait de fond au hero : recadrée en
          haut/bas selon la hauteur du texte et assombrie à 55 %. */}
      {bannerImages.length > 0 && (
        <div className="relative w-full aspect-[24/5] overflow-hidden" style={{ backgroundColor: color }}>
            {bannerImages.map((url, i) => (
              <img
                key={i}
                src={getImageUrl(url)}
                alt="Bannière"
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
                style={{ opacity: i === bannerIndex ? 1 : 0 }}
              />
            ))}
            {bannerImages.length > 1 && (
              <>
                <button onClick={() => { setBannerIndex(i => (i - 1 + bannerImages.length) % bannerImages.length); clearInterval(bannerTimerRef.current) }} className="absolute start-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-colors">
                  <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
                </button>
                <button onClick={() => { setBannerIndex(i => (i + 1) % bannerImages.length); clearInterval(bannerTimerRef.current) }} className="absolute end-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-colors">
                  <ChevronRight className="h-5 w-5 rtl:rotate-180" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                  {bannerImages.map((_, i) => (
                    <button key={i} onClick={() => setBannerIndex(i)} className="h-1.5 rounded-full transition-all" style={{ width: i === bannerIndex ? 20 : 6, backgroundColor: i === bannerIndex ? 'white' : 'rgba(255,255,255,0.4)' }} />
                  ))}
                </div>
              </>
            )}
        </div>
      )}

      {/* ── STORIES ── */}
      {(() => {
        const stories = config.stories || []
        if (stories.length === 0) return null
        return (
          <div className="bg-white border-b border-gray-100 py-4">
            <div className="max-w-6xl mx-auto px-4">
              <div className="flex gap-4 overflow-x-auto scrollbar-none pb-1">
                {stories.map((s, idx) => (
                  <StoryCircle key={idx} story={s} color={storyColor} onOpen={() => setStoryViewerIndex(idx)} />
                ))}
              </div>
            </div>
          </div>
        )
      })()}
      {storyViewerIndex !== null && config.stories && config.stories.length > 0 && (
        <StoryViewer
          stories={config.stories}
          index={storyViewerIndex}
          onIndex={setStoryViewerIndex}
          onClose={() => setStoryViewerIndex(null)}
          color={storyColor}
          userId={resolvedUserId || rawParam}
        />
      )}

      {/* ── FILTER BAR ── */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-2">
          <div className="relative flex items-center justify-center">
            {/* Filters — centered */}
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              <div className="flex bg-gray-100 rounded-xl p-1 gap-0.5">
                {[
                  { id: "ALL", label: "Tout" },
                  { id: "SALE", label: "Vente" },
                  { id: "RENTAL", label: "Location" },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTxType(t.id as any)}
                    className="px-3.5 py-1.5 rounded-lg text-sm font-bold transition-all"
                    style={txType === t.id ? { backgroundColor: filterColor, color: 'white' } : { color: '#6b7280' }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {availableCategories.length > 0 && (
                <div className="relative">
                  <SelectMenu value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="appearance-none pl-3 pr-6 py-1.5 border-2 border-gray-200 rounded-xl text-sm font-medium focus:border-[#00BFA6] outline-none bg-white cursor-pointer">
                    <option value="">Catégorie</option>
                    {availableCategories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </SelectMenu>
                  <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                </div>
              )}

              {availableWilayas.length > 0 && (
                <div className="relative">
                  <SelectMenu value={wilayas} onChange={e => { setWilayas(e.target.value); setCommune("") }} className="appearance-none pl-3 pr-6 py-1.5 border-2 border-gray-200 rounded-xl text-sm font-medium focus:border-[#00BFA6] outline-none bg-white cursor-pointer">
                    <option value="">Wilaya</option>
                    {availableWilayas.map(w => <option key={w} value={w}>{w}</option>)}
                  </SelectMenu>
                  <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                </div>
              )}

              {wilayas && availableCommunes.length > 0 && (
                <div className="relative">
                  <SelectMenu value={commune} onChange={e => setCommune(e.target.value)} className="appearance-none pl-3 pr-6 py-1.5 border-2 border-gray-200 rounded-xl text-sm font-medium focus:border-[#00BFA6] outline-none bg-white cursor-pointer">
                    <option value="">Commune</option>
                    {availableCommunes.map(c => <option key={c} value={c}>{c}</option>)}
                  </SelectMenu>
                  <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                </div>
              )}
            </div>

            {/* Count + display — absolute right */}
            <div className="absolute right-0 flex items-center gap-2">
              <span className="text-sm text-gray-500 font-medium hidden sm:inline">
                <span className="font-bold text-gray-900">{filtered.length}</span> annonce{filtered.length !== 1 ? 's' : ''}
              </span>
              <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
                <button onClick={() => setDisplayStyle("grid")} className={`p-1.5 rounded-md transition-colors ${displayStyle === "grid" ? "bg-white shadow text-gray-900" : "text-gray-400 hover:text-gray-600"}`} title="Grille">
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
            {(txType !== "ALL" || categoryFilter || wilayas || commune) && (
              <button
                onClick={() => { setTxType("ALL"); setCategoryFilter(""); setWilayas(""); setCommune(""); }}
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
                    {img ? <img src={getImageUrl(img.url || '')} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-100 flex items-center justify-center"><Building2 className="h-12 w-12 text-gray-300" /></div>}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: tx === 'SALE' ? '#ef4444' : color }}>{tx === 'SALE' ? 'Vente' : tx === 'RENTAL' ? 'Location' : 'Annonce'}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 text-base group-hover:text-[#00BFA6] transition-colors line-clamp-2">
                      {a.title || ptLabel(a.property?.propertyType, a.property?.propertyType)}
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
              const pType = ptLabel(a.property?.propertyType, a.property?.propertyType)
              return (
                <a key={a.id} href={`/announces/${a.id}`} className="group flex bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
                  <div className="w-44 h-36 shrink-0 overflow-hidden bg-gray-100">
                    {img ? <img src={getImageUrl(img.url || '')} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full bg-gray-100 flex items-center justify-center"><Building2 className="h-8 w-8 text-gray-300" /></div>}
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
      <footer className="mt-10" style={{ backgroundColor: footerColor, color: footerTextColor }}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Column 1: Brand */}
            <div>
              {config.logoUrl && (
                <img src={getImageUrl(config.logoUrl)} alt="Logo" className="h-16 w-16 rounded-full object-cover border-2 border-white/30 mb-4" />
              )}
              <h3 className="text-xl font-black">{config.companyName || "Notre Boutique"}</h3>
              {config.slogan && <p className="mt-2 text-white/75 text-sm">{config.slogan}</p>}
              {config.description && <p className="mt-3 text-white/60 text-xs leading-relaxed whitespace-pre-line break-words [overflow-wrap:anywhere]">{config.description}</p>}
            </div>

            {/* Column 2: Contact */}
            {hasContact && (
              <div>
                <h4 className="font-bold text-white/90 mb-4 uppercase text-xs tracking-widest">Contact</h4>
                <div className="space-y-3">
                  {config.phone && (
                    <a href={`tel:${config.phone}`} onClick={() => trackBoutiqueContact('CALL')} className="flex items-center gap-3 text-white/80 hover:text-white transition-colors text-sm">
                      <Phone className="h-4 w-4 shrink-0" /> {config.phone}
                    </a>
                  )}
                  {config.whatsapp && (
                    <a href={`https://wa.me/${config.whatsapp.replace(/[^0-9]/g, '')}`} onClick={() => trackBoutiqueContact('WHATSAPP')} target="_blank" className="flex items-center gap-3 text-white/80 hover:text-white transition-colors text-sm">
                      <MessageCircle className="h-4 w-4 shrink-0" /> WhatsApp: {config.whatsapp}
                    </a>
                  )}
                  {config.email && (
                    <a href={`mailto:${config.email}`} onClick={() => trackBoutiqueContact('EMAIL')} className="flex items-center gap-3 text-white/80 hover:text-white transition-colors text-sm">
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

      {/* Fenêtre "Envoyer un message" — vrai envoi vers /messages (nécessite d'être connecté) */}
      {msgOpen && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden text-gray-900">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-xl flex items-center gap-2">
                <Mail className="h-5 w-5 text-[#00BFA6]" /> {tm('contactAdvertiser')}
              </h3>
              <button onClick={() => { setMsgOpen(false); setMsgSent(false); setMsgError("") }} className="p-2 hover:bg-white rounded-full text-gray-400 hover:text-gray-600 shadow-sm">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              {!currentUserId ? (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-5">{tm('messageLoginPrompt')}</p>
                  <Link href="/auth/login" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#00BFA6] hover:bg-[#00908A] text-white rounded-xl font-bold">{tm('messageLoginCta')}</Link>
                </div>
              ) : msgSent ? (
                <div className="text-center py-6">
                  <h4 className="font-bold text-lg">{tm('messageSentTitle')}</h4>
                  <p className="text-gray-500 text-sm mt-2">{tm('messageSentText')}</p>
                  <div className="flex items-center justify-center gap-3 mt-5">
                    <button onClick={() => { setMsgOpen(false); setMsgSent(false); setMsgText("") }} className="px-5 py-2.5 border-2 border-gray-200 rounded-xl font-bold text-sm text-gray-700">{tm('close')}</button>
                    <Link href="/profile/messages" className="px-5 py-2.5 bg-[#00BFA6] text-white rounded-xl font-bold text-sm">{tm('viewMyMessages')}</Link>
                  </div>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <textarea
                    rows={4}
                    maxLength={5000}
                    placeholder={tm('messagePlaceholder')}
                    value={msgText}
                    onChange={(e) => setMsgText(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-[#00BFA6] outline-none bg-white placeholder-gray-400 font-medium resize-none"
                  />
                  {msgError && <p className="text-red-500 text-xs">{msgError}</p>}
                  <button
                    type="button"
                    disabled={!msgText.trim() || msgSending}
                    onClick={sendBoutiqueMessage}
                    className="w-full py-4 text-lg bg-[#00BFA6] hover:bg-[#00908A] text-white rounded-xl shadow-lg shadow-[#00BFA6]/20 font-bold disabled:opacity-50"
                  >
                    {msgSending ? tm('sending') : tm('send')}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
