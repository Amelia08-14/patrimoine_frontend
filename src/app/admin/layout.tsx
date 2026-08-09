import localFont from "next/font/local";
import "../globals.css";

// L'espace admin n'est pas traduit (outil interne) — il garde son propre
// layout racine, séparé de celui des routes publiques sous [locale].
const geistSans = localFont({
  src: "../../fonts/Geist-Regular.ttf",
  variable: "--font-geist-sans",
});

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={geistSans.variable}>
      <body suppressHydrationWarning className="antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
