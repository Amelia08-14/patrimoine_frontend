import localFont from "next/font/local";
import { Playfair_Display } from "next/font/google";
import "../globals.css";

// L'espace admin n'est pas traduit (outil interne) — il garde son propre
// layout racine, séparé de celui des routes publiques sous [locale].
const geistSans = localFont({
  src: "../../fonts/Geist-Regular.ttf",
  variable: "--font-geist-sans",
});

// Écho de la serif du logo ("Patrimoine") — réservée aux titres de page (classe .font-brand),
// jamais au texte courant qui reste en Montserrat comme sur le reste de la plateforme.
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-serif-brand",
});

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${playfairDisplay.variable}`}>
      <body suppressHydrationWarning className="antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
