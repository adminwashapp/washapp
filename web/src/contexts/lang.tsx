'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Lang = 'fr' | 'en';

export const translations = {
  fr: {
    nav_concept: 'Concept',
    nav_tarifs: 'Tarifs',
    nav_washer: 'Devenir washer',
    nav_faq: 'FAQ',
    nav_book: 'Reserver',
    nav_login: 'Se connecter',
    nav_home: 'Accueil',
  },
  en: {
    nav_concept: 'How it works',
    nav_tarifs: 'Pricing',
    nav_washer: 'Become a washer',
    nav_faq: 'FAQ',
    nav_book: 'Book now',
    nav_login: 'Sign in',
    nav_home: 'Home',
  },
} as const;

type Keys = keyof typeof translations.fr;

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: Keys) => string;
}

const LangContext = createContext<LangCtx>({ lang: 'fr', setLang: () => {}, t: (k) => k });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('fr');

  useEffect(() => {
    const saved = localStorage.getItem('washapp_lang');
    if (saved === 'fr' || saved === 'en') setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('washapp_lang', l);
  };

  const t = (k: Keys): string => translations[lang][k] ?? k;

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);