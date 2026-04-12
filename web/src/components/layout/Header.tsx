'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLang } from '@/contexts/lang';

function LangToggle() {
  const { lang, setLang } = useLang();
  const isScrolled = useScrolled();
  const pathname = usePathname();
  const isHome = pathname === '/';
  const dark = !isHome || isScrolled;

  return (
    <button
      onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
      className={`flex items-center gap-1 text-[12px] font-semibold px-3 py-1.5 rounded-full border transition-all ${
        dark
          ? 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
          : 'border-white/30 text-white/70 hover:border-white/60 hover:text-white'
      }`}
    >
      <span className={lang === 'fr' ? (dark ? 'text-gray-900 font-bold' : 'text-white font-bold') : ''}>FR</span>
      <span className={dark ? 'text-gray-300' : 'text-white/30'}>|</span>
      <span className={lang === 'en' ? (dark ? 'text-gray-900 font-bold' : 'text-white font-bold') : ''}>EN</span>
    </button>
  );
}

function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return scrolled;
}

export default function Header() {
  const pathname = usePathname();
  const { t } = useLang();
  const isHome = pathname === '/';
  const scrolled = useScrolled();

  const navLinks = [
    { href: '/concept',        label: t('nav_concept') },
    { href: '/tarifs',         label: t('nav_tarifs') },
    { href: '/devenir-washer', label: t('nav_washer') },
    { href: '/faq',            label: t('nav_faq') },
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 h-[60px] transition-all duration-300 ${
        isHome
          ? scrolled
            ? 'bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm'
            : 'bg-transparent'
          : 'bg-white/95 backdrop-blur-md border-b border-gray-100'
      }`}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-full flex items-center justify-between">

          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logowashapp.png" alt="Washapp" width={32} height={32} className="object-contain" priority />
            <span className={`text-[18px] font-extrabold tracking-tight transition-colors ${
              isHome && !scrolled ? 'text-white' : 'text-gray-900'
            }`}>Washapp</span>
          </Link>

          <nav className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map(({ href, label }) => (
                <Link key={href} href={href} className={`text-[14px] font-medium transition-colors ${
                  isHome && !scrolled ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}>{label}</Link>
              ))}
            </div>

            <LangToggle />

            <Link href="/booking?mode=booking" className="flex items-center gap-2 text-[13px] font-bold text-white bg-[#1558f5] hover:bg-[#1045e1] px-5 py-2.5 rounded-xl transition-all shadow-[0_2px_10px_rgba(21,88,245,0.35)]">
              {t('nav_book')}
            </Link>

            {!isHome && (
              <Link href="/" className="hidden sm:flex items-center gap-2 text-[13px] font-semibold text-gray-600 hover:text-[#1558f5] transition-colors px-4 py-2 rounded-xl hover:bg-gray-50">
                <Home className="w-4 h-4" />
                {t('nav_home')}
              </Link>
            )}

            {isHome && (
              <Link href="/login" className={`hidden sm:inline-flex text-[14px] font-semibold transition-colors px-4 py-2 rounded-xl ${
                scrolled ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-50' : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}>
                {t('nav_login')}
              </Link>
            )}
          </nav>
        </div>
      </header>
      {!isHome && <div className="h-[60px]" />}
    </>
  );
}