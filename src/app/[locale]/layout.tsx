import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import "../globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/components/layout/ThemeProvider";

// Geist Sans en local (version .ttf)
const geistSans = localFont({
  src: "../../fonts/Geist-Regular.ttf",
  variable: "--font-geist-sans",
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
    <html lang={locale} dir={dir} className={geistSans.variable}>
      <body
        suppressHydrationWarning
        className="antialiased min-h-screen flex flex-col"
      >
        <NextIntlClientProvider>
          <ThemeProvider>
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
