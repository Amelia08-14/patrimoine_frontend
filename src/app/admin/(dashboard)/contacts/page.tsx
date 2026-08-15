"use client"

import { useState, useEffect, useCallback } from "react"
import { RefreshCw, Briefcase, Scale, Wrench, Globe, Paperclip, Mail, Check, Archive } from "lucide-react"
import { Button } from "@/components/ui/button"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

type Motif = "ALL" | "COMMERCIAL" | "JURIDIQUE" | "TECHNIQUE" | "GENERAL"
type Status = "ALL" | "NEW" | "READ" | "ARCHIVED"

const MOTIF_TABS: { id: Motif; label: string; icon: typeof Briefcase }[] = [
  { id: "ALL", label: "Tous", icon: Mail },
  { id: "COMMERCIAL", label: "Commercial", icon: Briefcase },
  { id: "JURIDIQUE", label: "Juridique", icon: Scale },
  { id: "TECHNIQUE", label: "Technique", icon: Wrench },
  { id: "GENERAL", label: "Général", icon: Globe },
]

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  NEW: { label: "Nouveau", className: "bg-blue-100 text-blue-700" },
  READ: { label: "Lu", className: "bg-gray-100 text-gray-600" },
  ARCHIVED: { label: "Archivé", className: "bg-gray-100 text-gray-400" },
}

interface ContactRequest {
  id: number
  name: string
  email: string
  subject: string
  message: string
  motif: string
  attachmentUrl: string | null
  status: string
  createdAt: string
}

export default function AdminContactsPage() {
  const [items, setItems] = useState<ContactRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [motif, setMotif] = useState<Motif>("ALL")
  const [status, setStatus] = useState<Status>("ALL")

  const load = useCallback(async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const params = new URLSearchParams()
      if (motif !== 'ALL') params.set('motif', motif)
      if (status !== 'ALL') params.set('status', status)
      const res = await fetch(`${API_URL}/admin/contacts?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      if (res.ok) setItems(await res.json())
    } finally {
      setIsLoading(false)
    }
  }, [motif, status])

  useEffect(() => {
    load()
    const interval = setInterval(load, 15000)
    return () => clearInterval(interval)
  }, [load])

  const updateStatus = async (id: number, newStatus: string) => {
    const token = localStorage.getItem('admin_token')
    const res = await fetch(`${API_URL}/admin/contacts/${id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i)))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Requêtes "Nous Contacter"</h1>
          <p className="text-gray-500">Demandes soumises par motif — Commercial, Juridique, Technique, Général.</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} title="Actualiser">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-0.5 flex-wrap">
          {MOTIF_TABS.map((m) => {
            const Icon = m.icon
            return (
              <button
                key={m.id}
                onClick={() => setMotif(m.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${motif === m.id ? 'bg-[#00BFA6] text-white' : 'text-gray-500 hover:text-gray-800'}`}
              >
                <Icon className="h-3.5 w-3.5" /> {m.label}
              </button>
            )
          })}
        </div>
        <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-0.5">
          {(['ALL', 'NEW', 'READ', 'ARCHIVED'] as Status[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${status === s ? 'bg-[#003B4A] text-white' : 'text-gray-500 hover:text-gray-800'}`}
            >
              {s === 'ALL' ? 'Tous statuts' : STATUS_BADGE[s].label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">Chargement...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-gray-400">Aucune requête.</div>
        ) : (
          items.map((item) => {
            const badge = STATUS_BADGE[item.status] || STATUS_BADGE.NEW
            const motifTab = MOTIF_TABS.find((m) => m.id === item.motif)
            const Icon = motifTab?.icon || Mail
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{item.subject}</p>
                      <p className="text-xs text-gray-500">{item.name} — {item.email}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{new Date(item.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>{badge.label}</span>
                </div>
                <p className="text-sm text-gray-600 mt-3 whitespace-pre-line">{item.message}</p>
                {item.attachmentUrl && (
                  <a href={`${API_URL}${item.attachmentUrl}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-[#00BFA6] font-bold mt-2 hover:underline">
                    <Paperclip className="h-3.5 w-3.5" /> Voir la pièce jointe
                  </a>
                )}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-50">
                  {item.status !== 'READ' && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus(item.id, 'READ')}>
                      <Check className="h-3.5 w-3.5 mr-1" /> Marquer comme lu
                    </Button>
                  )}
                  {item.status !== 'ARCHIVED' && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus(item.id, 'ARCHIVED')}>
                      <Archive className="h-3.5 w-3.5 mr-1" /> Archiver
                    </Button>
                  )}
                  <a href={`mailto:${item.email}`} className="ml-auto text-xs font-bold text-gray-500 hover:text-[#00BFA6]">Répondre par e-mail</a>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
