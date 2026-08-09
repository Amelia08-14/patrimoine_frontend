import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['fr', 'en', 'ar'],
  defaultLocale: 'fr',
  // Le français (langue par défaut) reste sans préfixe (/announces),
  // l'anglais et l'arabe sont préfixés (/en/announces, /ar/announces).
  localePrefix: 'as-needed',
});

export type AppLocale = (typeof routing.locales)[number];
