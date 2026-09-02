"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export default function PacksPage() {
  const t = useTranslations("ProfilePacks")
  const packs = [
    {
      name: t("packDecouverteName"),
      points: 50,
      price: "1 000 DA",
      features: [t("packDecouverteFeature1"), t("packDecouverteFeature2"), t("packDecouverteFeature3")]
    },
    {
      name: t("packProName"),
      points: 200,
      price: "3 500 DA",
      features: [t("packProFeature1"), t("packProFeature2"), t("packProFeature3"), t("packProFeature4")],
      popular: true
    },
    {
      name: t("packAgenceName"),
      points: 1000,
      price: "15 000 DA",
      features: [t("packAgenceFeature1"), t("packAgenceFeature2"), t("packAgenceFeature3"), t("packAgenceFeature4")]
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-4 text-center text-gray-800 dark:text-white/90">{t("title")}</h1>
      <p className="text-center text-gray-500 dark:text-white/50 mb-12 max-w-2xl mx-auto">
        {t("subtitle")}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {packs.map((pack, index) => (
            <div key={index} className={`bg-white dark:bg-white/5 rounded-2xl shadow-lg overflow-hidden border-2 relative transition-transform hover:-translate-y-1
                ${pack.popular ? 'border-[#00BFA6]' : 'border-gray-100 dark:border-white/10'}`}>
                
                {pack.popular && (
                    <div className="absolute top-0 right-0 bg-[#00BFA6] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                        {t("popular")}
                    </div>
                )}

                <div className="p-8 text-center border-b border-gray-50 dark:border-white/5">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white/90 mb-2">{pack.name}</h3>
                    <div className="text-4xl font-bold text-[#003B4A] mb-1">{pack.points} pts</div>
                    <div className="text-gray-500 dark:text-white/50 font-medium">{pack.price}</div>
                </div>

                <div className="p-8">
                    <ul className="space-y-4 mb-8">
                        {pack.features.map((feat, i) => (
                            <li key={i} className="flex items-start text-sm text-gray-600 dark:text-white/60">
                                <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                                {feat}
                            </li>
                        ))}
                    </ul>
                    <Button className={`w-full py-6 text-lg rounded-xl font-bold
                        ${pack.popular ? 'bg-[#00BFA6] hover:bg-[#00908A]' : 'bg-gray-800 hover:bg-gray-900'}`}>
                        {t("choosePlan")}
                    </Button>
                </div>
            </div>
        ))}
      </div>

      <div className="mt-12 bg-blue-50 p-8 rounded-xl text-center">
        <h3 className="text-lg font-bold text-blue-900 mb-2">{t("needHelp")}</h3>
        <p className="text-blue-700 mb-4">{t("needHelpText")}</p>
        <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
            {t("contactSales")}
        </Button>
      </div>
    </div>
  )
}
