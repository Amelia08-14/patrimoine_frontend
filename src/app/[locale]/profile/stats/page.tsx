"use client"

import { PieChart } from "lucide-react"

export default function StatsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3 text-gray-900">
        <PieChart className="text-[#00BFA6] fill-current" /> Statistiques
      </h1>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 py-20 flex flex-col items-center gap-3">
        <div className="h-14 w-14 rounded-2xl bg-[#00BFA6]/10 flex items-center justify-center">
          <PieChart className="h-6 w-6 text-[#00BFA6]" />
        </div>
        <p className="text-gray-500 font-medium">Aucune donnée statistique disponible pour le moment.</p>
      </div>
    </div>
  )
}
