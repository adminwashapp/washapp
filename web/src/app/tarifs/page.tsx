'use client';
import { useState, useEffect } from 'react';
import { clientsApi } from '@/lib/api';
import { useAuthStore } from '@/store';
import Link from 'next/link';
import Footer from '@/components/layout/Footer';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { useLang } from '@/contexts/lang';

export default function TarifsPage() {
  const { lang } = useLang();
  const txt = {
    fr: {
      eyebrow: 'Formules',
      hero_title_1: 'Des prix clairs,',
      hero_title_2: 'pensés pour vous',
      hero_sub: "Commandez en toute simplicité. Le prix affiché est le prix payé, avec un service clair et sans mauvaise surprise.",
      services_title: "Prestations à l'unité",
      services_sub: 'Choisissez la formule adaptée à votre véhicule, réservez en quelques secondes.',
      badge_popular: 'Le plus populaire',
      book_now: 'Réserver maintenant',
      subs_eyebrow: 'Abonnements',
      subs_title: 'Gagnez en confort avec nos abonnements',
      subs_sub: "Pour les besoins réguliers, profitez d'une formule plus avantageuse avec 12 lavages et 1 lavage offert.",
      sub_12: '12 lavages — 1 offert',
      best_value: 'Meilleure valeur',
      economy: 'Économie de',
      see_sub: 'Voir mon abonnement →',
      subscribe: "S'abonner →",
      help_title: "Besoin d'aide pour choisir ?",
      help_sub: 'Notre équipe vous accompagne pour trouver la formule adaptée à votre usage.',
      see_faq: 'Voir la FAQ',
      // Service names / descriptions / features
      ext_name: 'Lavage extérieur',
      ext_desc: 'Carrosserie, vitres, jantes et finition propre.',
      ext_f1: 'Carrosserie complète', ext_f2: 'Vitres et pare-brise', ext_f3: 'Jantes et pneus', ext_f4: 'Séchage finition',
      full_name: 'Lavage complet',
      full_desc: "L'extérieur et l'intérieur réunis dans une formule simple.",
      full_f1: 'Carrosserie complète', full_f2: 'Vitres et pare-brise', full_f3: 'Jantes et pneus', full_f4: 'Sièges et tissu', full_f5: 'Tableau de bord', full_f6: 'Tapis et aspiration',
      int_name: 'Lavage intérieur',
      int_desc: 'Sièges, tableau de bord, tapis et aspiration.',
      int_f1: 'Sièges et tissu', int_f2: 'Tableau de bord', int_f3: 'Tapis complets', int_f4: 'Aspiration profonde',
      sub_ext: 'Abonnement Extérieur',
      sub_full: 'Abonnement Complet',
      sub_int: 'Abonnement Intérieur',
    },
    en: {
      eyebrow: 'Plans',
      hero_title_1: 'Clear prices,',
      hero_title_2: 'designed for you',
      hero_sub: 'Order with ease. The displayed price is the price you pay, with a clear service and no bad surprises.',
      services_title: 'Single services',
      services_sub: 'Choose the plan that suits your vehicle and book in seconds.',
      badge_popular: 'Most popular',
      book_now: 'Book now',
      subs_eyebrow: 'Subscriptions',
      subs_title: 'More comfort with our subscriptions',
      subs_sub: 'For regular needs, enjoy a more advantageous plan with 12 washes and 1 wash free.',
      sub_12: '12 washes — 1 free',
      best_value: 'Best value',
      economy: 'Save',
      see_sub: 'View my subscription →',
      subscribe: 'Subscribe →',
      help_title: 'Need help choosing?',
      help_sub: 'Our team will help you find the right plan for your needs.',
      see_faq: 'See FAQ',
      ext_name: 'Exterior wash',
      ext_desc: 'Body, windows, rims and clean finish.',
      ext_f1: 'Full body', ext_f2: 'Windows & windscreen', ext_f3: 'Rims & tyres', ext_f4: 'Drying & finish',
      full_name: 'Full wash',
      full_desc: 'Exterior and interior combined in one simple plan.',
      full_f1: 'Full body', full_f2: 'Windows & windscreen', full_f3: 'Rims & tyres', full_f4: 'Seats & fabric', full_f5: 'Dashboard', full_f6: 'Mats & vacuuming',
      int_name: 'Interior wash',
      int_desc: 'Seats, dashboard, mats and vacuuming.',
      int_f1: 'Seats & fabric', int_f2: 'Dashboard', int_f3: 'Full mats', int_f4: 'Deep vacuuming',
      sub_ext: 'Exterior subscription',
      sub_full: 'Full subscription',
      sub_int: 'Interior subscription',
    },
  }[lang];

  const services = [
    {
      id: 'exterior',
      badge: null,
      name: txt.ext_name,
      desc: txt.ext_desc,
      price: '1 500',
      features: [txt.ext_f1, txt.ext_f2, txt.ext_f3, txt.ext_f4],
      highlight: false,
    },
    {
      id: 'full',
      badge: txt.badge_popular,
      name: txt.full_name,
      desc: txt.full_desc,
      price: '4 000',
      features: [txt.full_f1, txt.full_f2, txt.full_f3, txt.full_f4, txt.full_f5, txt.full_f6],
      highlight: true,
    },
    {
      id: 'interior',
      badge: null,
      name: txt.int_name,
      desc: txt.int_desc,
      price: '2 500',
      features: [txt.int_f1, txt.int_f2, txt.int_f3, txt.int_f4],
      highlight: false,
    },
  ];

  const subscriptions = [
    { name: txt.sub_ext, price: '16 500', saving: '1 500', highlight: false, plan: 'EXTERIOR' },
    { name: txt.sub_full, price: '44 000', saving: '4 000', highlight: true, plan: 'FULL' },
    { name: txt.sub_int, price: '27 500', saving: '2 500', highlight: false, plan: 'INTERIOR' },
  ];

  const { isAuthenticated } = useAuthStore();
  const [hasActiveSub, setHasActiveSub] = useState(false);
  useEffect(() => { if (!isAuthenticated) return; clientsApi.getSubscription().then((r: any) => { if (r.data?.isSubscribed) setHasActiveSub(true); }).catch(() => {}); }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-[#f9fafb]">

      {/* ── HERO ─────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <span className="inline-block text-[11px] font-bold tracking-[0.18em] text-[#1558f5] uppercase mb-5">
            {txt.eyebrow}
          </span>
          <h1 className="text-[2.75rem] sm:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight mb-5">
            {txt.hero_title_1}<br className="hidden sm:block" /> {txt.hero_title_2}
          </h1>
          <p className="text-[1.05rem] text-gray-500 max-w-xl mx-auto leading-relaxed">
            {txt.hero_sub}
          </p>
        </div>
      </section>

      {/* ── PRESTATIONS ──────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-[1.6rem] font-bold text-gray-900 mb-2">{txt.services_title}</h2>
        <p className="text-gray-400 text-[0.95rem] mb-10">
          {txt.services_sub}
        </p>

        <div className="grid md:grid-cols-3 gap-5 items-start">
          {services.map((s) => (
            <div
              key={s.id}
              className={`relative rounded-3xl p-7 flex flex-col gap-5 transition-all ${
                s.highlight
                  ? 'bg-[#1558f5] text-white shadow-[0_20px_60px_rgba(21,88,245,0.28)] md:-mt-4 md:mb-4'
                  : 'bg-white text-gray-900 shadow-[0_2px_24px_rgba(0,0,0,0.06)] border border-gray-100'
              }`}
            >
              {/* Badge */}
              {s.badge && (
                <span className="inline-flex items-center gap-1.5 self-start text-[11px] font-bold tracking-wide bg-white/20 text-white px-3 py-1.5 rounded-full">
                  <Sparkles className="w-3 h-3" />
                  {s.badge}
                </span>
              )}

              {/* Nom + description */}
              <div>
                <h3 className={`text-[1.15rem] font-bold mb-1.5 ${s.highlight ? 'text-white' : 'text-gray-900'}`}>
                  {s.name}
                </h3>
                <p className={`text-[0.875rem] leading-relaxed ${s.highlight ? 'text-blue-100' : 'text-gray-500'}`}>
                  {s.desc}
                </p>
              </div>

              {/* Prix */}
              <div>
                <span className={`text-[2.6rem] font-extrabold leading-none ${s.highlight ? 'text-white' : 'text-[#1558f5]'}`}>
                  {s.price}
                </span>
                <span className={`text-[0.85rem] font-medium ml-1.5 ${s.highlight ? 'text-blue-200' : 'text-gray-400'}`}>
                  FCFA
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-2.5 flex-1">
                {s.features.map((f) => (
                  <li key={f} className={`flex items-center gap-2.5 text-[0.875rem] ${s.highlight ? 'text-blue-100' : 'text-gray-600'}`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${s.highlight ? 'bg-white/20' : 'bg-blue-50'}`}>
                      <Check className={`w-2.5 h-2.5 ${s.highlight ? 'text-white' : 'text-[#1558f5]'}`} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href="/booking"
                className={`mt-2 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[0.9rem] font-bold transition-all ${
                  s.highlight
                    ? 'bg-white text-[#1558f5] hover:bg-blue-50'
                    : 'bg-[#1558f5] text-white hover:bg-[#1045e1]'
                }`}
              >
                {txt.book_now}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── ABONNEMENTS ──────────────────────────── */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="mb-10">
            <span className="inline-block text-[11px] font-bold tracking-[0.18em] text-[#1558f5] uppercase mb-3">
              {txt.subs_eyebrow}
            </span>
            <h2 className="text-[1.7rem] font-bold text-gray-900 mb-3">
              {txt.subs_title}
            </h2>
            <p className="text-gray-400 text-[0.95rem] max-w-xl">
              {txt.subs_sub}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {subscriptions.map((s) => (
              <div
                key={s.name}
                className={`rounded-3xl p-7 flex flex-col gap-4 ${
                  s.highlight
                    ? 'bg-[#0f172a] text-white shadow-[0_20px_48px_rgba(15,23,42,0.2)]'
                    : 'bg-[#f9fafb] border border-gray-100'
                }`}
              >
                {s.highlight && (
                  <span className="self-start text-[11px] font-bold tracking-wide bg-white/10 text-white px-3 py-1.5 rounded-full">
                    {txt.best_value}
                  </span>
                )}

                <div>
                  <h3 className={`text-[1.05rem] font-bold mb-1 ${s.highlight ? 'text-white' : 'text-gray-900'}`}>
                    {s.name}
                  </h3>
                  <p className={`text-[0.8rem] ${s.highlight ? 'text-slate-400' : 'text-gray-400'}`}>
                    {txt.sub_12}
                  </p>
                </div>

                <div className="flex items-end gap-2">
                  <span className={`text-[2.2rem] font-extrabold leading-none ${s.highlight ? 'text-white' : 'text-gray-900'}`}>
                    {s.price}
                  </span>
                  <span className={`text-[0.8rem] mb-1.5 ${s.highlight ? 'text-slate-400' : 'text-gray-400'}`}>
                    FCFA
                  </span>
                </div>

                <p className={`text-[0.8rem] font-semibold ${s.highlight ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  {txt.economy} {s.saving} FCFA
                </p>

                <Link
                  href={hasActiveSub ? '/compte/abonnement?existing=1' : ('/abonnements/activer?plan=' + s.plan)}
                  className={`mt-auto flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[0.875rem] font-bold transition-all ${
                    s.highlight
                      ? 'bg-white text-[#0f172a] hover:bg-gray-100'
                      : 'bg-[#1558f5] text-white hover:bg-[#1045e1]'
                  }`}
                >
                  {hasActiveSub ? txt.see_sub : txt.subscribe}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA / FAQ ────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-[1.6rem] font-bold text-gray-900 mb-3">
          {txt.help_title}
        </h2>
        <p className="text-gray-400 text-[0.95rem] mb-8 max-w-md mx-auto leading-relaxed">
          {txt.help_sub}
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/faq"
            className="px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold text-[0.9rem] hover:border-[#1558f5] hover:text-[#1558f5] transition-all"
          >
            {txt.see_faq}
          </Link>
          <Link
            href="/booking"
            className="px-6 py-3 rounded-xl bg-[#1558f5] text-white font-semibold text-[0.9rem] hover:bg-[#1045e1] transition-all flex items-center gap-2 shadow-[0_4px_16px_rgba(21,88,245,0.3)]"
          >
            {txt.book_now}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
