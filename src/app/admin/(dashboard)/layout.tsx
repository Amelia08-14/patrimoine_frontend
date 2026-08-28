"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { LayoutDashboard, Users, FileText, Coins, LogOut, Search, User as UserIcon, Building2, Loader2, BookOpen, Mail, Star, ChevronDown, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function GlobalSearch() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<{ users: any[]; announces: any[] }>({ users: [], announces: [] })
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ users: [], announces: [] })
      return
    }
    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        const token = localStorage.getItem('admin_token')
        const res = await fetch(`${API_URL}/admin/search?q=${encodeURIComponent(query)}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) setResults(await res.json())
      } catch { /* réseau indisponible */ }
      finally { setLoading(false) }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const hasResults = results.users.length > 0 || results.announces.length > 0

  return (
    <div className="relative w-full max-w-md" ref={boxRef}>
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-2.5 focus-within:border-[#00BFA6]/40 transition-colors">
        <Search className="h-4 w-4 text-gray-400 shrink-0" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Rechercher un utilisateur, une annonce..."
          className="w-full text-sm outline-none bg-transparent"
        />
        {loading && <Loader2 className="h-4 w-4 text-gray-300 animate-spin shrink-0" />}
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 max-h-96 overflow-y-auto">
          {!loading && !hasResults ? (
            <p className="px-4 py-3 text-sm text-gray-400">Aucun résultat pour « {query} »</p>
          ) : (
            <>
              {results.users.length > 0 && (
                <div className="py-1">
                  <p className="px-4 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Utilisateurs</p>
                  {results.users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => { router.push(`/admin/users?search=${encodeURIComponent(u.email)}`); setOpen(false) }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 text-left"
                    >
                      {u.companyName ? <Building2 className="h-4 w-4 text-[#00BFA6] shrink-0" /> : <UserIcon className="h-4 w-4 text-gray-400 shrink-0" />}
                      <span className="truncate">
                        <span className="font-bold text-gray-900">{u.companyName || `${u.firstName || ''} ${u.lastName || ''}`.trim()}</span>
                        <span className="text-gray-400"> — {u.email}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {results.announces.length > 0 && (
                <div className="py-1 border-t border-gray-50">
                  <p className="px-4 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Annonces</p>
                  {results.announces.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => { router.push(`/admin/announces?search=${encodeURIComponent(a.reference)}`); setOpen(false) }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 text-left"
                    >
                      <FileText className="h-4 w-4 text-gray-400 shrink-0" />
                      <span className="truncate">
                        <span className="font-bold text-gray-900">{a.title || a.reference}</span>
                        <span className="text-gray-400"> — Réf. {a.reference}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

function ProfileMenu({ adminUser }: { adminUser: { firstName?: string; lastName?: string; email?: string } | null }) {
  const [open, setOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const name = adminUser?.firstName ? `${adminUser.firstName} ${adminUser.lastName || ''}`.trim() : (adminUser?.email || 'Admin')
  const initial = (adminUser?.firstName || adminUser?.email || 'A').charAt(0).toUpperCase()

  const logout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    window.location.href = '/admin/login'
  }

  return (
    <div className="relative shrink-0" ref={boxRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-2xl border border-gray-200 bg-white hover:border-gray-300 transition-colors"
      >
        <span className="h-8 w-8 rounded-full bg-[#00BFA6] text-white flex items-center justify-center text-sm font-bold shrink-0">
          {initial}
        </span>
        <span className="text-sm font-semibold text-[#003B4A] max-w-[120px] truncate">{name}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-gray-400 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" /> Déconnexion
          </button>
        </div>
      )}
    </div>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [adminUser, setAdminUser] = useState<any>(null)

  const navigation = [
    { name: "Tableau de bord", href: "/admin", icon: LayoutDashboard },
    { name: "Annonces", href: "/admin/announces", icon: FileText },
    { name: "Utilisateurs", href: "/admin/users", icon: Users },
    { name: "Points & Achats", href: "/admin/points", icon: Coins },
    { name: "Contenu du site", href: "/admin/content", icon: BookOpen },
    { name: "Requêtes Contact", href: "/admin/contacts", icon: Mail },
    { name: "KPI Première Page", href: "/admin/kpis", icon: Star },
    { name: "KPI Points & Boutiques", href: "/admin/points-kpi", icon: BarChart3 },
  ]

  useEffect(() => {
    // Check for ADMIN user specifically
    const adminUserStr = localStorage.getItem('admin_user')
    const adminToken = localStorage.getItem('admin_token')

    if (!adminUserStr || !adminToken) {
      window.location.href = '/admin/login'
      return
    }

    try {
        const user = JSON.parse(adminUserStr)
        if (user.userType !== 'ADMIN') {
          // Should not happen if login page logic is correct, but double check
          localStorage.removeItem('admin_token')
          localStorage.removeItem('admin_user')
          window.location.href = '/admin/login'
          return
        }
        setAdminUser(user)
    } catch (e) {
        window.location.href = '/admin/login'
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-100 flex flex-col fixed h-full inset-y-0 z-50">
        <div className="p-6 border-b border-gray-100">
          <img src="/logo.png" alt="Patrimoine Immobilier" className="h-11 w-auto object-contain" />
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-2xl transition-colors",
                  isActive
                    ? "bg-[#00BFA6] text-white shadow-lg shadow-[#00BFA6]/25"
                    : "text-[#003B4A]/70 hover:bg-[#00BFA6]/[0.06] hover:text-[#003B4A]"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#003B4A]/60 hover:text-[#003B4A] hover:bg-gray-50 rounded-2xl w-full transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Retour au site
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
        <header className="flex items-center justify-between mb-8 gap-4 flex-wrap">
            <div>
              <p className="text-lg font-bold text-[#003B4A] font-brand">
                Bonjour{adminUser?.firstName ? `, ${adminUser.firstName}` : ''}
              </p>
              <p className="text-xs text-gray-400">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-1 justify-end min-w-0">
              <GlobalSearch />
              <ProfileMenu adminUser={adminUser} />
            </div>
        </header>
        {children}
      </div>
    </div>
  )
}
