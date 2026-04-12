import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import { LangProvider } from '@/contexts/lang';

export const metadata: Metadata = {
  title: 'Washapp - Lavage de vehicule a Abidjan',
  description: 'Reservez un lavage de votre vehicule a domicile ou en entreprise a Abidjan. Washers professionnels, paiement Orange Money, photos avant/apres.',
  keywords: 'lavage voiture, Abidjan, mobile, Orange Money, wash, auto',
  openGraph: {
    title: 'Washapp - Lavage vehicule Abidjan',
    description: 'Le lavage de votre vehicule, ou que vous soyez a Abidjan.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body>
        <LangProvider>
          <Header />
          {children}
        </LangProvider>
      </body>
    </html>
  );
}