'use client';

import { Zap, Car, Sparkles, Shield, CheckCircle } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { useLang } from '@/contexts/lang';

export default function ConceptPage() {
  const { lang } = useLang();
  const txt = {
    fr: {
      eyebrow: 'Le concept',
      hero_title: 'Lavage auto à domicile,\nsimple et rapide.',
      hero_sub: 'Réservez en quelques secondes. Un professionnel se déplace et nettoie votre véhicule sur place.',
      book_now: 'Réserver maintenant',
      how_eyebrow: 'Fonctionnement',
      how_title: 'Comment ça marche',
      feat1_title: 'Réservation rapide',
      feat1_desc: 'Choisissez votre formule et réservez en quelques clics.',
      feat2_title: 'Intervention sur place',
      feat2_desc: 'Un washer se déplace directement à votre position.',
      feat3_title: 'Résultat impeccable',
      feat3_desc: 'Votre véhicule est nettoyé sur place, sans effort de votre part.',
      feat4_title: 'Paiement sécurisé',
      feat4_desc: "Vous payez à l'avance. L'intervention démarre uniquement après validation.",
      commit_eyebrow: 'Nos engagements',
      commit_title: 'Un service conçu pour vous rassurer',
      commit1: 'Des professionnels fiables — Washers sélectionnés pour leur sérieux.',
      commit2: 'Qualité garantie — Photos avant / après pour chaque prestation.',
      commit3: 'Transparence totale — Le prix affiché est le prix payé, sans surprise.',
      commit4: 'Paiement sécurisé — Transactions protégées via Wave Money.',
      commit5: 'Support disponible — Une équipe prête à vous aider en cas de besoin.',
      cta_title: "Essayez Washapp dès aujourd'hui.",
      cta_sub: 'Disponible à Abidjan. Réservez votre lavage en quelques secondes.',
    },
    en: {
      eyebrow: 'The concept',
      hero_title: 'At-home car wash,\nsimple and fast.',
      hero_sub: 'Book in seconds. A professional comes to you and cleans your vehicle on the spot.',
      book_now: 'Book now',
      how_eyebrow: 'How it works',
      how_title: 'How it works',
      feat1_title: 'Quick booking',
      feat1_desc: 'Choose your plan and book in a few clicks.',
      feat2_title: 'On-site service',
      feat2_desc: 'A washer comes directly to your location.',
      feat3_title: 'Impeccable result',
      feat3_desc: 'Your vehicle is cleaned on the spot, without any effort on your part.',
      feat4_title: 'Secure payment',
      feat4_desc: 'You pay upfront. The service starts only after validation.',
      commit_eyebrow: 'Our commitments',
      commit_title: 'A service built to reassure you',
      commit1: 'Reliable professionals — Washers selected for their professionalism.',
      commit2: 'Guaranteed quality — Before / after photos for every service.',
      commit3: 'Full transparency — The displayed price is the price you pay, no surprises.',
      commit4: 'Secure payment — Transactions protected via Wave Money.',
      commit5: 'Support available — A team ready to help you when needed.',
      cta_title: 'Try Washapp today.',
      cta_sub: 'Available in Abidjan. Book your wash in seconds.',
    },
  }[lang];

  const heroLines = txt.hero_title.split('\n');

  return (
    <div className="min-h-screen bg-white">

      {/* HERO */}
      <section className="py-24 px-6 text-center bg-gradient-to-b from-[#f0f6ff] to-white">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block text-[11px] font-extrabold tracking-[0.25em] uppercase text-[#1558f5] mb-4">{txt.eyebrow}</span>
          <h1 className="text-[2.6rem] sm:text-[3.4rem] font-extrabold text-gray-900 leading-tight mb-5">
            {heroLines[0]}<br className="hidden sm:block" /> {heroLines[1]}
          </h1>
          <p className="text-[17px] text-gray-500 leading-relaxed max-w-xl mx-auto mb-8">
            {txt.hero_sub}
          </p>
          <Link href="/booking" className="inline-flex items-center gap-2 bg-[#1558f5] text-white font-bold py-3.5 px-8 rounded-2xl text-[15px] hover:bg-[#1045e1] transition-colors">
            <Zap className="w-4 h-4" /> {txt.book_now}
          </Link>
        </div>
      </section>

      {/* COMMENT CA MARCHE */}
      <section className="py-20 px-6">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-[11px] font-extrabold tracking-[0.25em] uppercase text-[#1558f5] mb-3">{txt.how_eyebrow}</span>
            <h2 className="text-[2rem] sm:text-[2.4rem] font-extrabold text-gray-900">{txt.how_title}</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { icon: Zap,      color: '#1558f5', bg: '#eff4ff', title: txt.feat1_title, desc: txt.feat1_desc },
              { icon: Car,      color: '#0891b2', bg: '#f0f9ff', title: txt.feat2_title, desc: txt.feat2_desc },
              { icon: Sparkles, color: '#d97706', bg: '#fffbeb', title: txt.feat3_title, desc: txt.feat3_desc },
              { icon: Shield,   color: '#16a34a', bg: '#f0fdf4', title: txt.feat4_title, desc: txt.feat4_desc },
            ].map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className="flex items-start gap-4 p-6 rounded-2xl border border-gray-100 bg-white shadow-[0_1px_6px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-gray-900 mb-1">{title}</h3>
                  <p className="text-[14px] text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NOS ENGAGEMENTS */}
      <section className="py-20 px-6 bg-[#f8fafc]">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-[11px] font-extrabold tracking-[0.25em] uppercase text-[#1558f5] mb-3">{txt.commit_eyebrow}</span>
            <h2 className="text-[2rem] sm:text-[2.4rem] font-extrabold text-gray-900">{txt.commit_title}</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {[txt.commit1, txt.commit2, txt.commit3, txt.commit4, txt.commit5].map((item) => (
              <div key={item} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                <CheckCircle className="w-5 h-5 text-[#1558f5] flex-shrink-0 mt-0.5" />
                <p className="text-[14px] text-gray-700 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BANDEAU CTA */}
      <section className="py-20 px-6">
        <div className="max-w-[900px] mx-auto">
          <div className="bg-[#1558f5] rounded-3xl p-12 text-center text-white">
            <h2 className="text-[2rem] sm:text-[2.4rem] font-extrabold mb-3">{txt.cta_title}</h2>
            <p className="text-blue-100 mb-8 text-[16px]">{txt.cta_sub}</p>
            <Link href="/booking" className="inline-flex items-center gap-2 bg-white text-[#1558f5] font-bold py-3.5 px-8 rounded-2xl text-[15px] hover:bg-blue-50 transition-colors">
              <Zap className="w-4 h-4" /> {txt.book_now}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
