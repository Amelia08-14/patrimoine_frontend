"use client"

import { useState } from "react"
import { Home, Tag, CalendarDays, Building, Hotel, PartyPopper, Warehouse } from "lucide-react"
import { useRouter } from "@/i18n/navigation"
import { cn } from "@/lib/utils"

type TransactionType = "RENTAL" | "SALE" | "HOLIDAY_RENTAL"
type Pole = "IMMOBILIER" | "HOTELLERIE" | "EVENEMENTIEL" | "ENTREPOSAGE"

const TRANSACTIONS: { id: TransactionType; label: string; icon: typeof Home }[] = [
  { id: "RENTAL", label: "Location", icon: Home },
  { id: "SALE", label: "Vente", icon: Tag },
  { id: "HOLIDAY_RENTAL", label: "Réservation", icon: CalendarDays },
]

// Catégorie d'annonces (REAL_ESTATE_CATEGORIES) associée à chaque pôle, quand elle existe.
// Événementiel et Entreposage n'ont pas encore de catégorie d'annonce dédiée dans le
// catalogue — les deux boutons restent visibles (conformément à la demande) mais désactivés
// jusqu'à ce que ces catégories soient ajoutées au modèle d'annonce.
const POLES: { id: Pole; label: string; icon: typeof Building; realEstateCategory: string | null }[] = [
  { id: "IMMOBILIER", label: "Immobilier", icon: Building, realEstateCategory: "RESIDENTIEL" },
  { id: "HOTELLERIE", label: "Hôtellerie & Hébergement", icon: Hotel, realEstateCategory: "HOTELIER" },
  { id: "EVENEMENTIEL", label: "Événementiel", icon: PartyPopper, realEstateCategory: null },
  { id: "ENTREPOSAGE", label: "Entreposage & Stockage", icon: Warehouse, realEstateCategory: null },
]

export function QuickSearchBar() {
  const router = useRouter()
  const [transaction, setTransaction] = useState<TransactionType>("RENTAL")
  const [pole, setPole] = useState<Pole>("IMMOBILIER")

  const handleSearch = () => {
    const poleDef = POLES.find((p) => p.id === pole)
    const params = new URLSearchParams({ transactionType: transaction })
    if (poleDef?.realEstateCategory) params.set("realEstateCategory", poleDef.realEstateCategory)
    router.push(`/announces?${params.toString()}`)
  }

  return (
    <div className="relative z-30 -mt-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-5 space-y-4">
        {/* Sélection de l'action / transaction */}
        <div className="flex flex-wrap gap-2">
          {TRANSACTIONS.map((tItem) => {
            const Icon = tItem.icon
            const isActive = transaction === tItem.id
            return (
              <button
                key={tItem.id}
                onClick={() => setTransaction(tItem.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border-2 transition-all",
                  isActive ? "bg-[#00BFA6] border-[#00BFA6] text-white" : "border-gray-200 text-gray-600 hover:border-gray-300"
                )}
              >
                <Icon className="h-4 w-4" /> {tItem.label}
              </button>
            )
          })}
        </div>

        {/* Sélection du pôle d'activité */}
        <div className="flex flex-wrap gap-2">
          {POLES.map((p) => {
            const Icon = p.icon
            const isActive = pole === p.id
            const disabled = !p.realEstateCategory
            return (
              <button
                key={p.id}
                onClick={() => !disabled && setPole(p.id)}
                disabled={disabled}
                title={disabled ? "Bientôt disponible" : undefined}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all",
                  disabled
                    ? "border-gray-100 text-gray-300 cursor-not-allowed"
                    : isActive
                      ? "bg-[#003B4A] border-[#003B4A] text-white"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                )}
              >
                <Icon className="h-4 w-4" /> {p.label}
              </button>
            )
          })}
        </div>

        <button
          onClick={handleSearch}
          className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-2xl transition-colors"
        >
          Rechercher
        </button>
      </div>
    </div>
  )
}
