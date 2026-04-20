import localFont from "next/font/local";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// Geist Sans en local (version .ttf)
const geistSans = localFont({
  src: "../fonts/Geist-Regular.ttf", // <-- ici ton fichier .ttf
  variable: "--font-geist-sans",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${montserrat.variable}`}>
      <body
        suppressHydrationWarning
        className="antialiased min-h-screen flex flex-col"
      >
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
