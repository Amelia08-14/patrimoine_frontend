"use client"

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocalizedContent } from "@/lib/typeLabels";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const telHref = (v: string) => `tel:${v.replace(/[^0-9+]/g, '')}`;
const mailHref = (v: string) => `mailto:${v}`;

export function Footer() {
  const t = useTranslations("Footer");
  const lc = useLocalizedContent();
  const [usefulLinks, setUsefulLinks] = useState<{ id: number; title: string; titleAr?: string | null; titleEn?: string | null; url: string }[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`${API_URL}/content/useful-links`).then((r) => r.json()).then((d) => setUsefulLinks(Array.isArray(d) ? d : [])).catch(() => {});
    fetch(`${API_URL}/content/settings`).then((r) => r.json()).then(setSettings).catch(() => {});
  }, []);

  const hasContact = settings.CONTACT_PHONE || settings.CONTACT_EMAIL || settings.CONTACT_ADDRESS;

  // Réseaux sociaux — pilotés depuis l'admin (Contenu du site > Contact & Support), même système
  // SiteSetting clé/valeur générique que le reste du bloc contact ; une icône n'apparaît que si son
  // lien a été renseigné.
  const SOCIAL_LINKS = [
    { key: "SOCIAL_FACEBOOK", icon: Facebook, label: "Facebook" },
    { key: "SOCIAL_INSTAGRAM", icon: Instagram, label: "Instagram" },
    { key: "SOCIAL_LINKEDIN", icon: Linkedin, label: "LinkedIn" },
    { key: "SOCIAL_YOUTUBE", icon: Youtube, label: "YouTube" },
  ].filter((s) => settings[s.key]);

  return (
    <footer className="bg-[#022229] text-white relative overflow-hidden dark:border-t dark:border-white/10">
      <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-[#00BFA6]/[0.06] blur-3xl" />
      <div className="max-w-7xl mx-auto py-14 sm:py-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={cn("grid grid-cols-2 gap-x-8 gap-y-10", usefulLinks.length > 0 ? "sm:grid-cols-3 lg:grid-cols-6" : "sm:grid-cols-3 lg:grid-cols-5")}>
          <div className="col-span-2">
            <span className="font-brand text-2xl text-white">Patrimoine</span>
            <p className="mt-3 text-white/50 text-sm leading-relaxed max-w-xs">
              {t("tagline")}
            </p>
            {hasContact && (
              <ul className="mt-6 space-y-2.5">
                {settings.CONTACT_PHONE && (
                  <li>
                    <a href={telHref(settings.CONTACT_PHONE)} className="flex items-center gap-2.5 text-sm text-white/60 hover:text-white transition-colors">
                      <Phone className="h-3.5 w-3.5 text-[#5EEAD4] shrink-0" /> {settings.CONTACT_PHONE}
                    </a>
                  </li>
                )}
                {settings.CONTACT_EMAIL && (
                  <li>
                    <a href={mailHref(settings.CONTACT_EMAIL)} className="flex items-center gap-2.5 text-sm text-white/60 hover:text-white transition-colors">
                      <Mail className="h-3.5 w-3.5 text-[#5EEAD4] shrink-0" /> {settings.CONTACT_EMAIL}
                    </a>
                  </li>
                )}
                {settings.CONTACT_ADDRESS && (
                  <li className="flex items-center gap-2.5 text-sm text-white/60">
                    <MapPin className="h-3.5 w-3.5 text-[#5EEAD4] shrink-0" /> {settings.CONTACT_ADDRESS}
                  </li>
                )}
              </ul>
            )}
          </div>

          <FooterColumn title={t("searchTitle")}>
            <FooterLink href="/announces">{t("browseProperties")}</FooterLink>
            <FooterLink href="/demandes">{t("pendingRequests")}</FooterLink>
            <FooterLink href="/research">{t("entrustSearch")}</FooterLink>
          </FooterColumn>

          <FooterColumn title={t("supportTitle")}>
            <FooterLink href="/a-propos">{t("aboutUs")}</FooterLink>
            <FooterLink href="/contact">{t("contact")}</FooterLink>
            <FooterLink href="/faq">{t("faq")}</FooterLink>
            <FooterLink href="/partenaires">{t("partners")}</FooterLink>
          </FooterColumn>

          <FooterColumn title={t("legalTitle")}>
            <FooterLink href="/cgu">{t("cgu")}</FooterLink>
            <FooterLink href="/confidentialite">{t("privacy")}</FooterLink>
          </FooterColumn>

          {/* Liens Utiles — gérés depuis l'administration (Contenu du site), n'apparaît que s'il y en a au moins un */}
          {usefulLinks.length > 0 && (
            <FooterColumn title={t("usefulLinksTitle")}>
              {usefulLinks.map((l) => (
                <li key={l.id}>
                  <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-[15px] text-white/55 hover:text-white transition-colors">
                    {lc(l.title, l.titleAr, l.titleEn)}
                  </a>
                </li>
              ))}
            </FooterColumn>
          )}
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-center gap-6">
          <p className="text-sm text-white/40 text-center">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
          {SOCIAL_LINKS.length > 0 && (
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.key}
                  href={settings[s.key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="h-9 w-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-[#00BFA6]/20 hover:border-[#00BFA6]/40 transition-colors"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[11px] font-bold text-white/40 tracking-[0.16em] uppercase">{title}</h3>
      <ul className="mt-4 space-y-3">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-[15px] text-white/55 hover:text-white transition-colors">
        {children}
      </Link>
    </li>
  );
}
