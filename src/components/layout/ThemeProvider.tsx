"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

// Bascule clair/sombre pour tout le site. `attribute="class"` pose/retire la classe `.dark` sur
// <html>, que le variant Tailwind personnalisé (voir globals.css) utilise pour activer les
// `dark:` — cohérent avec `suppressHydrationWarning` déjà posé sur <body> dans le layout racine.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  );
}
