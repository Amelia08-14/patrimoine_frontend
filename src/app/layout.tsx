import { Playfair_Display } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// Geist Sans en local (version .ttf)
const geistSans = localFont({
  src: "../fonts/Geist-Regular.ttf", // <-- ici ton fichier .ttf
  variable: "--font-geist-sans",
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${playfair.variable} antialiased min-h-screen flex flex-col`}
      >
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}