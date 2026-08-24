"use client"

import { ArrowLeft, Bell, ChevronDown, Mail, MessageSquareText, PencilLine, Reply, Send, Share2, Smile, Star, Trash2 } from "lucide-react"

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-[#f3f3f3] px-4 py-8 text-[#1f2937]">
      <div className="mx-auto max-w-[1500px]">
        <div className="rounded-[28px] border border-[#e7e7e7] bg-[#f9f9f9] p-4 shadow-[0_8px_30px_rgba(17,24,39,0.04)]">
          <div className="mb-8 flex items-center justify-between gap-4 px-2">
            <div className="flex items-center gap-3 text-[18px] font-medium text-[#1f2937]">
              <span className="text-[38px] font-light leading-none">messagerie du profil client</span>
              <div className="flex items-center gap-2 rounded-lg bg-[#e5e7eb] px-3 py-1 text-[14px] text-[#374151]">
                <span>Boîte de réception</span>
                <span className="text-lg">×</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[#4b5563]">
              <Mail className="h-5 w-5" />
              <Bell className="h-5 w-5" />
            </div>
          </div>

          <div className="flex items-center gap-4 py-4">
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

          <div className="mt-8 rounded-[22px] border border-[#e5e7eb] bg-white p-8 shadow-sm">
            <h3 className="text-[28px] font-bold text-[#1f2937]">Structure des 3 Types de Messagerie</h3>
            <div className="mt-8 space-y-6 text-[22px] leading-relaxed text-[#1f2937]">
              <p>1. Messagerie des annonces : Pour les échanges concernant les biens mis en vente ou en location (négociations, questions sur une annonce spécifique).</p>
              <p>2. Messagerie de patrimoine immobilier : pour les messages technique financier ou autre</p>
              <p>3. Messagerie de la boutique ("Nous contacter") : Pour les messages de prospects ou clients qui proviennent directement du formulaire de contact de la boutique/profil professionnel.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
