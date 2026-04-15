'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLang } from '@/contexts/lang';

export default function NotFound() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { lang } = useLang();

  const txt = {
    fr: {
      title: 'Page introuvable',
      sub: "La page que vous recherchez n'existe pas ou a été déplacée. Revenez à l'accueil pour continuer.",
      home: "Retour à l'accueil",
      book: 'Réserver un lavage',
      tagline: 'Washapp — Lavage auto à domicile à Abidjan',
    },
    en: {
      title: 'Page not found',
      sub: "The page you are looking for doesn't exist or has been moved. Head back home to continue.",
      home: 'Back to home',
      book: 'Book a wash',
      tagline: 'Washapp — At-home car wash in Abidjan',
    },
  }[lang];

  return (
    <div className="min-h-screen bg-[#040c24] flex flex-col items-center justify-center px-6 text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 bg-[#1558f5] rounded-xl flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 17H5C3.9 17 3 16.1 3 15V9C3 7.9 3.9 7 5 7H19C20.1 7 21 7.9 21 9V15C21 16.1 20.1 17 19 17H17M12 17V21M8 21H16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="8" cy="12" r="1.5" fill="white"/>
            <circle cx="12" cy="12" r="1.5" fill="white"/>
            <circle cx="16" cy="12" r="1.5" fill="white"/>
          </svg>
        </div>
        <span className="text-xl font-bold tracking-wide">Washapp</span>
      </div>

      {/* 404 Display */}
      <div
        className="text-[120px] font-black leading-none text-transparent bg-clip-text mb-4"
        style={{ backgroundImage: 'linear-gradient(135deg, #1558f5 0%, #3b82f6 100%)', opacity: mounted ? 1 : 0, transition: 'opacity 0.5s' }}
      >
        404
      </div>

      {/* Message */}
      <h1 className="text-2xl font-semibold mb-3 text-center">{txt.title}</h1>
      <p className="text-gray-400 text-center max-w-md mb-10 leading-relaxed">
        {txt.sub}
      </p>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/"
          className="px-8 py-3 bg-[#1558f5] text-white rounded-xl font-semibold text-center hover:bg-blue-600 transition-colors"
        >
          {txt.home}
        </Link>
        <Link
          href="/booking"
          className="px-8 py-3 border border-white/20 text-white rounded-xl font-semibold text-center hover:bg-white/10 transition-colors"
        >
          {txt.book}
        </Link>
      </div>

      {/* Bottom hint */}
      <p className="mt-12 text-xs text-gray-600 text-center">
        {txt.tagline}
      </p>
    </div>
  );
}
