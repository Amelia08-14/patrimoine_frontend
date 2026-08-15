"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { LayoutDashboard, Users, FileText, Coins, LogOut, Search, User as UserIcon, Building2, Loader2, BookOpen, LayoutGrid, Mail, Star } from "lucide-react"
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
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
        <Search className="h-4 w-4 text-gray-400 shrink-0" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Rechercher un utilisateur, une annonce..."
          className="w-full text-sm outline-none"
        />
        {loading && <Loader2 className="h-4 w-4 text-gray-300 animate-spin shrink-0" />}
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 max-h-96 overflow-y-auto">
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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const navigation = [
    { name: "Annonces", href: "/admin/announces", icon: FileText },
    { name: "Tableau de bord", href: "/admin", icon: LayoutDashboard },
    { name: "Utilisateurs", href: "/admin/users", icon: Users },
    { name: "Partenaires", href: "/admin/partners", icon: LayoutGrid },
    { name: "Points & Achats", href: "/admin/points", icon: Coins },
    { name: "Contenu du site", href: "/admin/content", icon: BookOpen },
    { name: "Requêtes Contact", href: "/admin/contacts", icon: Mail },
    { name: "KPI Première Page", href: "/admin/kpis", icon: Star },
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
        }
    } catch (e) {
        window.location.href = '/admin/login'
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#003B4A] text-white flex flex-col fixed h-full inset-y-0 z-50">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-bold tracking-tight">Patrimoine<span className="text-[#00BFA6]">.Admin</span></h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors",
                  isActive 
                    ? "bg-[#00BFA6] text-white shadow-lg shadow-[#00BFA6]/20" 
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={() => window.location.href = '/'} 
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-xl w-full transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Retour au site
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
        <header className="flex items-center justify-between mb-8 gap-4">
            <GlobalSearch />
            <button
                onClick={() => {
                    localStorage.removeItem('admin_token');
                    localStorage.removeItem('admin_user');
                    window.location.href = '/admin/login';
                }}
                className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-2"
            >
                <LogOut className="h-4 w-4" />
                Déconnexion Admin
            </button>
        </header>
        {children}
      </div>
    </div>
  )
}
