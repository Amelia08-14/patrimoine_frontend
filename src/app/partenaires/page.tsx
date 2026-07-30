import { Handshake, Mail } from "lucide-react"

export default function PartenairesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#003B4A] text-white py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Handshake className="h-10 w-10 mx-auto mb-4 text-[#00BFA6]" />
          <h1 className="text-3xl md:text-4xl font-extrabold">Nos Partenaires</h1>
          <p className="mt-3 text-white/80 max-w-2xl mx-auto">
            Agences immobilières, promoteurs, administrateurs de biens et professionnels de l'hôtellerie :
            Patrimoine collabore avec des acteurs reconnus du secteur pour vous garantir des annonces fiables et vérifiées.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Vous souhaitez devenir partenaire ?</h2>
        <p className="text-gray-600 mb-6">
          Contactez-nous pour rejoindre notre réseau de partenaires et bénéficier d'une visibilité accrue auprès de nos utilisateurs.
        </p>
        <a
          href="/contact"
          className="inline-flex items-center gap-2 bg-[#00BFA6] hover:bg-[#00908A] text-white rounded-full px-6 py-3 font-bold transition-colors"
        >
          <Mail className="h-4 w-4" />
          Nous contacter
        </a>
      </div>
    </div>
  )
}
