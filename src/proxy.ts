import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Habilita redirects na raiz
    '/',
    
    // Suporta qualquer rota que comece com os locales definidos
    '/(pt|en|es)/:path*',
    
    // Permite que qualquer outra rota sem locale receba o redirect,
    // a menos que seja algo interno (_next, api, arquivos com ponto)
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};
