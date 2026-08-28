"use client"

import { Bell, MessageSquareText, Inbox, Star, CheckCircle2, CircleEllipsis, SlidersHorizontal, Mail, Search, ArrowLeft, Send, PencilLine, Trash2, ChevronDown, Grid2x2 } from "lucide-react"

const notifications = [
  {
    label: "notification confirmer votre recherche",
    title: "Nouvelle recherche Un particulier a confié une recherche de bien qui correspond à votre profil.",
    type: "confirmation",
  },
  {
    label: "notification message annonce",
    title: "Nouveau message Vous avez reçu un message relatif à votre annonce [Référence : [Numéro de référence]]. [ Bouton : Consulter ]",
    type: "message",
  },
  {
    label: "annonce et favoris",
    title: "Structure des Filtres\n• Type de transaction : Vente, Location\n• Type de bien : Appartement, Villa, Terrain, Local...\n• Wilaya : Sélection de la wilaya\n• Commune : Filtre dynamique basé sur la wilaya",
    type: "filter",
  },
  {
    label: "nombre de point manque delai valable jusqua quand",
    title: "Proposition d'affichage (Espace Publicitaire & Points)\nMon Espace Publicitaire\n• Solde actuel : 150 points\n• Validité : Valable jusqu'au 30/09/2026\n• [ Bouton : Recharger mes points ]",
    type: "points",
  },
]

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-[#f3f3f3] px-4 py-6 text-[#111827]"> 
      <div className="mx-auto max-w-[1500px]">
        <div className="rounded-[28px] border border-[#e7e7e7] bg-[#f9f9f9] p-4 shadow-[0_8px_30px_rgba(17,24,39,0.04)]">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-[18px] font-medium text-[#1f2937]">
              <span className="text-[38px] font-light leading-none">notification</span>
              <div className="flex items-center gap-2 rounded-lg bg-[#e5e7eb] px-3 py-1 text-[14px] text-[#374151]">
                <span>Boîte de réception</span>
                <span className="text-lg">×</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[#4b5563]">
              <Inbox className="h-5 w-5" />
              <Mail className="h-5 w-5" />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <aside className="w-full lg:w-[330px] shrink-0 rounded-[26px] border border-[#dfe6eb] bg-[#dfeaf3] p-5 text-[#1f2937]">
              <button className="mb-5 flex w-full items-center gap-3 rounded-[18px] border border-[#cfe0ec] bg-[#cfe8f5] px-4 py-4 text-left text-[16px] font-medium shadow-sm">
                <PencilLine className="h-5 w-5" />
                Nouveau message
              </button>

              <nav className="space-y-2 text-[17px]">
                <button className="flex w-full items-center gap-3 rounded-xl bg-[#cfe8f5] px-3 py-3 font-semibold text-[#1f2937]">
                  <Inbox className="h-5 w-5" />
                  Boîte de réception
                </button>
                <button className="flex w-full items-center gap-3 px-3 py-3 text-[#374151]">
                  <Star className="h-5 w-5" />
                  Messages suivis
                </button>
                <button className="flex w-full items-center gap-3 px-3 py-3 text-[#374151]">
                  <ClockIcon />
                  En attente
                </button>
                <button className="flex w-full items-center gap-3 px-3 py-3 text-[#374151]">
                  <Send className="h-5 w-5 rotate-45" />
                  Messages envoyés
                </button>
                <button className="flex w-full items-center gap-3 px-3 py-3 text-[#374151]">
                  <Trash2 className="h-5 w-5" />
                  Brouillons
                </button>
                <button className="flex w-full items-center gap-3 px-3 py-3 text-[#374151]">
                  <Grid2x2 className="h-5 w-5" />
                  Factures
                </button>
                <button className="flex w-full items-center gap-3 px-3 py-3 text-[#374151]">
                  <Bell className="h-5 w-5" />
                  Notifications
                </button>
              </nav>
            </aside>

            <main className="flex-1 rounded-[26px] border border-[#e5e7eb] bg-[#f9f9f9] p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-[78px] w-[78px] items-center justify-center rounded-full bg-[#4b443f] text-[32px] font-bold text-white">
                    A
                  </div>
                  <div>
                    <h2 className="text-[28px] font-extrabold tracking-[-0.04em] text-[#1f2937]">AQUARIUS TECH WELCOME</h2>
                    <div className="mt-2 flex items-center gap-2 text-[18px] text-[#374151]">
                      <span>À moi</span>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-5 text-[#4b5563]">
                  <span className="text-[18px]">01:00</span>
                  <Star className="h-5 w-5" />
                  <MessageSquareText className="h-5 w-5" />
                  <ArrowLeft className="h-5 w-5" />
                  <button className="text-lg">⋮</button>
                </div>
              </div>

              <div className="mt-8 space-y-6">
                {notifications.map((item, index) => (
                  <div key={index} className="rounded-[20px] border border-[#e7e7e7] bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between gap-4">
                      <p className="text-[26px] font-medium text-[#1f2937] capitalize">{item.label}</p>
                      <div className="rounded-lg bg-[#e5e7eb] px-3 py-1 text-[13px] text-[#374151]">Boîte de réception ×</div>
                    </div>
                    <p className="whitespace-pre-line text-[20px] leading-relaxed text-[#1f2937]">{item.title}</p>
                  </div>
                ))}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}

function ClockIcon() {
  return <div className="h-5 w-5 rounded-full border-2 border-current p-[2px]" aria-label="En attente" />
}
