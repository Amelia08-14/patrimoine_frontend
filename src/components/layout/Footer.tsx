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
      {/* Filet de marque en haut + halos discrets */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00BFA6]/70 to-transparent" />
      <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-[#00BFA6]/[0.07] blur-3xl" />
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#0094BD]/[0.08] blur-3xl" />

      <div className="max-w-7xl mx-auto pt-14 pb-8 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-12">
          {/* Marque + contact + réseaux */}
          <div className="col-span-2 lg:col-span-4">
            {/* Même hauteur de ligne (h-8) que les titres de colonnes : tout démarre sur la même ligne */}
            <div className="h-8 flex items-center">
              <span className="font-brand text-3xl leading-none text-white inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#00BFA6]" />
                Patrimoine
              </span>
            </div>
            <span className="mt-2 block h-0.5 w-8 rounded-full bg-[#00BFA6]" />
            <p className="mt-5 text-white/55 text-sm leading-relaxed max-w-sm">
              {t("tagline")}
            </p>
          </div>

          <div className="lg:col-span-2">
            <FooterColumn title={t("searchTitle")}>
              <FooterLink href="/announces">{t("browseProperties")}</FooterLink>
              <FooterLink href="/demandes">{t("pendingRequests")}</FooterLink>
              <FooterLink href="/research">{t("entrustSearch")}</FooterLink>
            </FooterColumn>
          </div>

          <div className="lg:col-span-2">
            <FooterColumn title={t("supportTitle")}>
              <FooterLink href="/a-propos">{t("aboutUs")}</FooterLink>
              <FooterLink href="/contact">{t("contact")}</FooterLink>
              <FooterLink href="/faq">{t("faq")}</FooterLink>
              <FooterLink href="/partenaires">{t("partners")}</FooterLink>
            </FooterColumn>
          </div>

          <div className="lg:col-span-2">
            <FooterColumn title={t("legalTitle")}>
              <FooterLink href="/cgu">{t("cgu")}</FooterLink>
              <FooterLink href="/confidentialite">{t("privacy")}</FooterLink>
            </FooterColumn>
          </div>

          {/* Liens Utiles — gérés depuis l'administration (Contenu du site), n'apparaît que s'il y en a au moins un */}
          {usefulLinks.length > 0 && (
            <div className="lg:col-span-2">
              <FooterColumn title={t("usefulLinksTitle")}>
                {usefulLinks.map((l) => (
                  <li key={l.id}>
                    <a href={l.url} target="_blank" rel="noopener noreferrer" className="inline-block py-2 sm:py-0 text-[15px] leading-snug text-white/55 hover:text-white hover:translate-x-1 rtl:hover:-translate-x-1 transition-all">
                      {lc(l.title, l.titleAr, l.titleEn)}
                    </a>
                  </li>
                ))}
              </FooterColumn>
            </div>
          )}
        </div>

        {/* Bande contact + réseaux : une seule ligne, pour que la colonne marque ne soit pas plus haute que les autres */}
        {(hasContact || SOCIAL_LINKS.length > 0) && (
          <div className="mt-12 border-t border-white/10 pt-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            {hasContact && (
              <ul className="flex flex-col sm:flex-row sm:flex-wrap gap-x-8 gap-y-3">
                {settings.CONTACT_PHONE && (
                  <ContactRow icon={Phone} href={telHref(settings.CONTACT_PHONE)}>{settings.CONTACT_PHONE}</ContactRow>
                )}
                {settings.CONTACT_EMAIL && (
                  <ContactRow icon={Mail} href={mailHref(settings.CONTACT_EMAIL)}>{settings.CONTACT_EMAIL}</ContactRow>
                )}
                {settings.CONTACT_ADDRESS && (
                  <ContactRow icon={MapPin}>{settings.CONTACT_ADDRESS}</ContactRow>
                )}
              </ul>
            )}
            {SOCIAL_LINKS.length > 0 && (
              <div className="flex items-center gap-2.5">
                {SOCIAL_LINKS.map((s) => (
                  <a
                    key={s.key}
                    href={settings[s.key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-[#00BFA6] hover:border-[#00BFA6] hover:-translate-y-0.5 transition-all"
                  >
                    <s.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-white/40 text-center sm:text-start">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
          <div className="flex items-center gap-5 text-xs text-white/40">
            <Link href="/cgu" className="hover:text-white transition-colors">{t("cgu")}</Link>
            <Link href="/confidentialite" className="hover:text-white transition-colors">{t("privacy")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function ContactRow({ icon: Icon, href, children }: { icon: any; href?: string; children: React.ReactNode }) {
  const inner = (
    <>
      <span className="h-8 w-8 rounded-lg bg-[#00BFA6]/10 border border-[#00BFA6]/20 flex items-center justify-center shrink-0">
        <Icon className="h-3.5 w-3.5 text-[#5EEAD4]" />
      </span>
      <span className="min-w-0 break-words">{children}</span>
    </>
  );
  const cls = "flex items-center gap-3 py-1.5 sm:py-0 text-sm text-white/65";
  return (
    <li>
      {href ? <a href={href} className={cn(cls, "hover:text-white transition-colors")}>{inner}</a> : <div className={cls}>{inner}</div>}
    </li>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="h-8 flex items-center text-xs font-bold text-white tracking-[0.16em] uppercase">{title}</h3>
      <span className="mt-2 block h-0.5 w-8 rounded-full bg-[#00BFA6]" />
      <ul className="mt-3 sm:mt-5 space-y-0 sm:space-y-3.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="inline-block py-2 sm:py-0 text-[15px] leading-snug text-white/55 hover:text-white hover:translate-x-1 rtl:hover:-translate-x-1 transition-all">
        {children}
      </Link>
    </li>
  );
}
