import { redirect } from "@/i18n/navigation"

// Ancienne page de packs (contenu figé, jamais relié à l'administration) : les offres réelles — titres,
// descriptions et prix gérés depuis l'admin — sont sur « Mes points » (et « Ma boutique » pour les formules pro).
export default async function PacksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  redirect({ href: "/profile/points", locale })
}
