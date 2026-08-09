import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Exclut l'espace admin (garde des URLs neutres, non traduit), l'API,
  // les assets Next.js et les fichiers statiques.
  matcher: ['/((?!api|admin|_next|_vercel|.*\\..*).*)'],
};
