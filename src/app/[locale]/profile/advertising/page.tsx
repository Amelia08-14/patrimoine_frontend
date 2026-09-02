"use client"

import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Megaphone, Coins, ArrowLeft } from "lucide-react"

export default function AdvertisingSpacePage() {
  const t = useTranslations("ProfileAdvertising")

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="bg-white dark:bg-white/5 rounded-3xl shadow-sm border border-gray-100 dark:border-white/10 py-16 px-8 flex flex-col items-center text-center gap-4">
        <div className="h-16 w-16 rounded-2xl bg-[#00BFA6]/10 flex items-center justify-center">
          <Megaphone className="h-8 w-8 text-[#00BFA6]" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">{t("title")}</h1>
        <p className="text-gray-500 dark:text-white/50 max-w-md leading-relaxed">{t("text")}</p>
        <Link
          href="/profile/points"
          className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-[#00BFA6] text-white rounded-xl font-bold text-sm hover:bg-[#009e88] transition-colors"
        >
          <Coins className="h-4 w-4" /> {t("goToPoints")}
        </Link>
        <Link href="/profile" className="mt-1 inline-flex items-center gap-1.5 text-sm text-gray-400 dark:text-white/40 hover:text-gray-600 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> {t("backToProfile")}
        </Link>
      </div>
    </div>
  )
}
