export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl text-gray-800">
      <h1 className="text-3xl font-bold text-center mb-8">FAQ</h1>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Comment déposer une annonce ?</h2>
          <p>
            Pour déposer une annonce, vous devez créer un compte (Particulier ou Professionnel). Une fois connecté, cliquez sur le bouton "Déposer une annonce" et suivez les étapes du formulaire.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Comment confier une recherche ?</h2>
          <p>
            Vous pouvez utiliser notre formulaire "Confier une recherche" accessible depuis le menu principal. Vous pourrez y spécifier vos critères (type de bien, budget, localisation) et nous nous chargerons de trouver le bien idéal pour vous.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Est-ce gratuit ?</h2>
          <p>
            L'inscription et la consultation des annonces sont gratuites. Certaines options de mise en avant ou services spécifiques peuvent être payants.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Comment contacter l'administrateur ?</h2>
          <p>
            Vous pouvez utiliser le formulaire de contact disponible sur la page "Contactez-nous" ou nous appeler directement aux numéros indiqués.
          </p>
        </div>
      </div>
    </div>
  );
}
