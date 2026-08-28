// Filtre de période partagé (dashboard, utilisateurs, annonces, points & achats) :
// mêmes raccourcis (Aujourd'hui/7 jours/30 jours/Ce mois-ci) + plage personnalisée.
import { format, subDays, startOfMonth } from "date-fns"

export const todayStr = () => format(new Date(), 'yyyy-MM-dd')

export type DatePreset = { id: string; label: string; from: () => string; to: () => string }

export const DATE_PRESETS: DatePreset[] = [
  { id: 'today', label: "Aujourd'hui", from: todayStr, to: todayStr },
  { id: '7d', label: '7 jours', from: () => format(subDays(new Date(), 6), 'yyyy-MM-dd'), to: todayStr },
  { id: '30d', label: '30 jours', from: () => format(subDays(new Date(), 29), 'yyyy-MM-dd'), to: todayStr },
  { id: 'month', label: 'Ce mois-ci', from: () => format(startOfMonth(new Date()), 'yyyy-MM-dd'), to: todayStr },
]

export function periodLabel(dateFrom: string, dateTo: string) {
  if (!dateFrom && !dateTo) return "Toutes les données"
  return `Du ${dateFrom || '…'} au ${dateTo || '…'}`
}
