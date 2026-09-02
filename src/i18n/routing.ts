import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['fr', 'en', 'ar'],
  defaultLocale: 'fr',
  // Le français reste la langue par défaut du site public,
  // tandis que l'anglais et l'arabe restent disponibles via leurs routes.
  localePrefix: 'as-needed',
});

export type AppLocale = (typeof routing.locales)[number];
