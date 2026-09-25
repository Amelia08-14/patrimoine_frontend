import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import "../globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/components/layout/ThemeProvider";

// Geist Sans en local (version .ttf)
const geistSans = localFont({
  src: "../../fonts/Geist-Regular.ttf",
  variable: "--font-geist-sans",
});

// Almarai (Google Fonts, licence OFL) — police arabe du site, fichiers en local (aucun appel réseau
// au build ni à l'exécution). Poids disponibles : 300, 400, 700, 800. Appliquée uniquement quand
// la langue est l'arabe (voir globals.css : html[lang="ar"] { --font-sans: ... }).
const almarai = localFont({
  src: [
    { path: "../../fonts/Almarai-Light.ttf", weight: "300", style: "normal" },
    { path: "../../fonts/Almarai-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../fonts/Almarai-Bold.ttf", weight: "700", style: "normal" },
    { path: "../../fonts/Almarai-ExtraBold.ttf", weight: "800", style: "normal" },
  ],
  variable: "--font-almarai",
  display: "swap",
});
const RTL_LOCALES = ["ar"];

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Rend cette locale disponible aux Server Components de la page
  setRequestLocale(locale);

  const dir = RTL_LOCALES.includes(locale) ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className={`${geistSans.variable} ${almarai.variable}`} suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="antialiased min-h-screen flex flex-col"
      >
        <NextIntlClientProvider>
          <ThemeProvider>
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
            {/* Réserve la hauteur de la bottom tab bar mobile pour qu'elle ne recouvre pas le bas du footer */}
            <div className="h-16 lg:hidden" aria-hidden="true" style={{ paddingBottom: "env(safe-area-inset-bottom)" }} />
            <MobileBottomNav />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
