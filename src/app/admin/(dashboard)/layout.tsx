"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, FileText, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const navigation = [
    { name: "Tableau de bord", href: "/admin", icon: LayoutDashboard },
    { name: "Utilisateurs", href: "/admin/users", icon: Users },
    { name: "Annonces", href: "/admin/announces", icon: FileText },
    // { name: "Paramètres", href: "/admin/settings", icon: Settings },
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
        <header className="flex justify-end mb-8">
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
