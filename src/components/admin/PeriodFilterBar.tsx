"use client"

import { Calendar } from "lucide-react"
import { DATE_PRESETS } from "@/lib/datePresets"

// Barre de filtre de période réutilisée sur le tableau de bord, Utilisateurs, Annonces et
// Points & Achats — mêmes raccourcis + plage personnalisée, même apparence partout.
export function PeriodFilterBar({
  dateFrom, dateTo, activePreset,
  onApplyPreset, onClear, onChangeFrom, onChangeTo,
}: {
  dateFrom: string
  dateTo: string
  activePreset: string
  onApplyPreset: (preset: (typeof DATE_PRESETS)[number]) => void
  onClear: () => void
  onChangeFrom: (v: string) => void
  onChangeTo: (v: string) => void
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5 text-sm font-semibold text-[#003B4A] shrink-0">
        <Calendar className="h-4 w-4" /> Période
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onClear}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${!dateFrom && !dateTo ? 'bg-[#00BFA6] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Tout
        </button>
        {DATE_PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => onApplyPreset(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activePreset === p.id ? 'bg-[#00BFA6] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1.5 text-sm ml-auto">
        <span className="text-xs text-gray-400">Du</span>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => onChangeFrom(e.target.value)}
          className="px-2 py-1.5 border-2 border-gray-200 rounded-lg text-xs font-medium bg-white outline-none"
        />
        <span className="text-xs text-gray-400">au</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => onChangeTo(e.target.value)}
          className="px-2 py-1.5 border-2 border-gray-200 rounded-lg text-xs font-medium bg-white outline-none"
        />
      </div>
    </div>
  )
}
