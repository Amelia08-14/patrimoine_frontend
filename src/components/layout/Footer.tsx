"use client"

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="col-span-1 md:col-span-2">
            <span className="text-2xl font-bold text-white">Patrimoine</span>
            <p className="mt-2 text-gray-300 text-sm">
              {t("tagline")}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">{t("searchTitle")}</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/announces" className="text-base text-gray-300 hover:text-white">
                  {t("browseProperties")}
                </Link>
              </li>
              <li>
                <Link href="/demandes" className="text-base text-gray-300 hover:text-white">
                  {t("pendingRequests")}
                </Link>
              </li>
              <li>
                <Link href="/research" className="text-base text-gray-300 hover:text-white">
                  {t("entrustSearch")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">{t("supportTitle")}</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/contact" className="text-base text-gray-300 hover:text-white">
                  {t("contact")}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-base text-gray-300 hover:text-white">
                  {t("faq")}
                </Link>
              </li>
              <li>
                <Link href="/partenaires" className="text-base text-gray-300 hover:text-white">
                  {t("partners")}
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-base text-gray-300 hover:text-white">
                  {t("supportService")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">{t("legalTitle")}</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/cgu" className="text-base text-gray-300 hover:text-white">
                  {t("cgu")}
                </Link>
              </li>
              <li>
                <Link href="/confidentialite" className="text-base text-gray-300 hover:text-white">
                  {t("privacy")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8">
          <p className="text-base text-gray-400 text-center">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
}
