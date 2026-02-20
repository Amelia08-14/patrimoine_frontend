"use client"

import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

  // Don't render Footer on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <span className="text-2xl font-bold text-white">Patrimoine</span>
            <p className="mt-2 text-gray-300 text-sm">
              Votre partenaire de confiance pour l'immobilier. Trouvez le bien de vos rêves ou vendez au meilleur prix.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Support</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="/contact" className="text-base text-gray-300 hover:text-white">
                  Contact
                </a>
              </li>
              <li>
                <a href="/faq" className="text-base text-gray-300 hover:text-white">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Légal</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="/cgu" className="text-base text-gray-300 hover:text-white">
                  Confidentialité
                </a>
              </li>
              <li>
                <a href="/cgu" className="text-base text-gray-300 hover:text-white">
                  CGU
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8">
          <p className="text-base text-gray-400 text-center">
            &copy; 2026 Patrimoine Immobilier. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
