"use client"

import { Bell, Bookmark, Inbox, Mail, SlidersHorizontal, Star } from "lucide-react"

export default function FavoritesPage() {
  return (
    <div className="min-h-screen bg-[#f3f3f3] px-4 py-8 text-[#1f2937]">
      <div className="mx-auto max-w-[1500px]">
        <div className="rounded-[28px] border border-[#e7e7e7] bg-[#f9f9f9] p-4 shadow-[0_8px_30px_rgba(17,24,39,0.04)]">
          <div className="mb-8 flex items-center justify-between gap-4 px-2">
            <div className="flex items-center gap-3 text-[18px] font-medium text-[#1f2937]">
              <span className="text-[38px] font-light leading-none">filtre favoris</span>
              <div className="flex items-center gap-2 rounded-lg bg-[#e5e7eb] px-3 py-1 text-[14px] text-[#374151]">
                <span>Boîte de réception</span>
                <span className="text-lg">×</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[#4b5563]">
              <Mail className="h-5 w-5" />
              <Inbox className="h-5 w-5" />
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
                <span className="text-sm">▼</span>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[22px] border border-[#e5e7eb] bg-white p-8 shadow-sm">
            <h3 className="text-[28px] font-bold text-[#1f2937]">Structure des Filtres</h3>
            <ul className="mt-8 space-y-5 text-[22px] text-[#1f2937]">
              <li>• Type de transaction : Vente, Location</li>
              <li>• type de bien :</li>
              <li>• Wilaya :</li>
              <li>• Commune :</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
