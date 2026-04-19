'use client';

import { useState } from 'react';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import Image from 'next/image';
import {
  Zap, Calendar, MapPin, Camera, Shield,
  Star, Wallet, Download, CheckCircle2, Car, ArrowRight,
} from 'lucide-react';
import { useLang } from '@/contexts/lang';

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="text-[15px] font-semibold text-gray-800 group-hover:text-[#1558f5] transition-colors pr-4">
          {q}
        </span>
        <span
          className="flex-shrink-0 w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center transition-all duration-300"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', background: open ? '#1558f5' : 'white', borderColor: open ? '#1558f5' : undefined }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4l4 4 4-4" stroke={open ? 'white' : '#6b7280'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>
      {open && (
        <div className="pb-5 pr-10">
          <p className="text-[14px] text-gray-500 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const { lang } = useLang();
  const txt = {
    fr: {
      eyebrow: 'Service à domicile · Abidjan',
      hero_title_1: 'Votre voiture lavée',
      hero_title_2: 'là où vous êtes',
      hero_sub: 'Un washer se déplace chez vous ou à votre bureau. Réservation en 30 secondes, sans vous déplacer.',
      cta_instant: 'Demande instantanée',
      cta_book: 'Réserver un créneau',
      benefit_1: 'À domicile ou au bureau',
      benefit_2: 'Photos avant/après',
      benefit_3: 'Wave Money securise',
      benefit_4: 'Disponible à Abidjan',
      scroll: 'Découvrir',
      steps_title: 'Lavez votre voiture en 3 étapes simples',
      step_label: 'ÉTAPE',
      step1_title: 'Choisissez votre emplacement',
      step1_desc: 'Entrez votre adresse ou utilisez votre position.',
      step2_title: 'Lancez votre demande en quelques secondes',
      step2_desc: 'Choisissez votre lavage et confirmez.',
      step3_title: 'Votre voiture est lavée sur place',
      step3_desc: 'Recevez les photos et validez.',
      video_eyebrow: 'Présentation',
      video_title: 'Comprendre Washapp en 2 minutes',
      video_sub: 'Découvrez comment commander un lavage à domicile ou au bureau, en instantané ou sur réservation.',
      video_cta: 'Tout comprendre en 2 minutes',
      video_founder: 'Koffi, fondateur de Washapp',
      video_soon: 'Vidéo de présentation · Disponible prochainement',
      tarifs_eyebrow: 'Tarifs',
      tarifs_title: 'Des tarifs clairs et sans surprise.',
      tarifs_sub: 'Payez en toute transparence : ce que vous voyez est ce que vous payez.',
      ext_name: 'Lavage\nExtérieur',
      ext_desc: 'Carrosserie, vitres,\njantes, séchage.',
      int_name: 'Lavage\nIntérieur',
      int_desc: 'Sièges, tableau de\nbord, tapis, aspiration.',
      full_name: 'Complet',
      full_badge: 'Le plus populaire',
      full_desc: 'Lavage extérieur +\nintérieur. La totale.',
      choose: 'Choisir ce forfait',
      sub_title: '✶ Abonnement 12 Lavages',
      sub_desc: 'Un lavage offert. Tarif :',
      sub_cta: 'Découvrir les abonnements',
      why_eyebrow: 'Pourquoi choisir Washapp',
      why_title: 'Un service pensé pour vous faire gagner du temps',
      why_sub: "Avec Washapp, vous commandez un lavage simplement, où que vous soyez. À domicile, au bureau ou sur parking, votre washer intervient directement sur place avec un service clair, encadré et rassurant.",
      badge_certified: 'Washers certifiés',
      badge_trained: 'Formés et validés',
      feat1_title: 'Paiement sécurisé',
      feat1_desc: 'Le paiement via Wave Money est valide dans un cadre clair et securise.',
      feat2_title: 'Photos avant / après',
      feat2_desc: 'Vous recevez des preuves visuelles du service réalisé avant de valider la mission.',
      feat3_title: 'Washers sélectionnés',
      feat3_desc: "Chaque washer est formé, testé et validé avant d'être activé sur la plateforme.",
      feat4_title: 'Tarifs transparents',
      feat4_desc: 'Le prix affiché est le prix payé, sans mauvaise surprise.',
      faq_eyebrow: 'FAQ',
      faq_title: 'Les réponses à vos questions sont ici',
      faq_see_all: 'Voir toutes les questions',
      faq1_q: 'Comment réserver un lavage sur Washapp ?',
      faq1_a: "Vous pouvez réserver directement depuis Washapp en indiquant votre localisation, le type de lavage souhaité, les informations sur votre véhicule et le créneau disponible proposé sur la plateforme.",
      faq2_q: 'Quand dois-je payer la prestation ?',
      faq2_a: "Le paiement doit être effectué avant le début de la prestation. Sans paiement préalable, le washer n'est pas tenu de commencer le lavage.",
      faq3_q: 'Puis-je payer en espèces ?',
      faq3_a: "Oui. Le paiement en espèces est autorisé, mais il doit obligatoirement être remis avant le début du lavage.",
      faq4_q: 'Puis-je annuler ma réservation ?',
      faq4_a: "Oui. Vous pouvez annuler sans frais jusqu'à 1 heure avant l'heure prévue de la prestation.",
      faq5_q: "Que se passe-t-il si j'annule moins d'1 heure avant ?",
      faq5_a: "En cas d'annulation tardive, 50 % du prix de la prestation peuvent être retenus pour couvrir les frais de déplacement, d'organisation et de mobilisation du washer.",
      app_eyebrow: 'Application mobile',
      app_title: "Téléchargez l'app Washapp",
      app_sub: 'Réservez en 30 secondes, suivez votre washer en temps réel, payez en toute sécurité.',
      blog_eyebrow: 'Blog',
      blog_title: 'Conseils & astuces auto',
      blog_see_all: 'Voir tous les articles',
      blog1_title: 'Le lavage à domicile : la solution pratique pour les conducteurs pressés',
      blog1_cat: 'Pratique',
      blog1_excerpt: 'Entre le travail et les trajets du quotidien, faire nettoyer sa voiture demande du temps. Le lavage à domicile change la donne.',
      blog1_date: '10 Avr 2026',
      blog2_title: 'Pourquoi choisir Washapp pour le nettoyage de votre véhicule',
      blog2_cat: 'Washapp',
      blog2_excerpt: 'Une plateforme pensée pour les conducteurs qui veulent gagner du temps sans sacrifier la propreté de leur véhicule.',
      blog2_date: '8 Avr 2026',
      blog3_title: 'Les bons gestes pour laver votre voiture sans abîmer la carrosserie',
      blog3_cat: 'Conseils',
      blog3_excerpt: "Mauvais chiffon, plein soleil, pression excessive : évitez les erreurs qui abîment la peinture de votre véhicule.",
      blog3_date: '5 Avr 2026',
      read_min_8: '8 min',
      read_min_7: '7 min',
      read_min_6: '6 min',
    },
    en: {
      eyebrow: 'At-home service · Abidjan',
      hero_title_1: 'Your car washed',
      hero_title_2: 'wherever you are',
      hero_sub: 'A washer comes to your home or office. Book in 30 seconds, without moving.',
      cta_instant: 'Instant request',
      cta_book: 'Schedule a slot',
      benefit_1: 'At home or at the office',
      benefit_2: 'Before/after photos',
      benefit_3: 'Secure Wave Money',
      benefit_4: 'Available in Abidjan',
      scroll: 'Discover',
      steps_title: 'Get your car washed in 3 simple steps',
      step_label: 'STEP',
      step1_title: 'Choose your location',
      step1_desc: 'Enter your address or use your current position.',
      step2_title: 'Send your request in seconds',
      step2_desc: 'Choose your wash type and confirm.',
      step3_title: 'Your car is washed on the spot',
      step3_desc: 'Receive the photos and validate.',
      video_eyebrow: 'Overview',
      video_title: 'Understand Washapp in 2 minutes',
      video_sub: 'Discover how to order a car wash at home or at the office, instantly or by appointment.',
      video_cta: 'Everything in 2 minutes',
      video_founder: 'Koffi, founder of Washapp',
      video_soon: 'Presentation video · Coming soon',
      tarifs_eyebrow: 'Pricing',
      tarifs_title: 'Clear pricing, no surprises.',
      tarifs_sub: 'Pay with full transparency: what you see is what you pay.',
      ext_name: 'Exterior\nWash',
      ext_desc: 'Body, windows,\nrims, drying.',
      int_name: 'Interior\nWash',
      int_desc: 'Seats, dashboard,\nmats, vacuuming.',
      full_name: 'Full Wash',
      full_badge: 'Most popular',
      full_desc: 'Exterior +\ninterior. The complete deal.',
      choose: 'Choose this plan',
      sub_title: '✶ 12-Wash Subscription',
      sub_desc: '1 wash free. Price:',
      sub_cta: 'Explore subscriptions',
      why_eyebrow: 'Why choose Washapp',
      why_title: 'A service designed to save you time',
      why_sub: 'With Washapp, you order a car wash simply, wherever you are. At home, at the office or in a parking lot, your washer comes directly to your location with a clear, structured and reassuring service.',
      badge_certified: 'Certified washers',
      badge_trained: 'Trained & validated',
      feat1_title: 'Secure payment',
      feat1_desc: 'Payment via Wave Money is processed within a clear and secure framework.',
      feat2_title: 'Before / after photos',
      feat2_desc: 'You receive visual proof of the completed service before validating the job.',
      feat3_title: 'Selected washers',
      feat3_desc: 'Each washer is trained, tested and validated before being activated on the platform.',
      feat4_title: 'Transparent pricing',
      feat4_desc: 'The displayed price is the price you pay, no bad surprises.',
      faq_eyebrow: 'FAQ',
      faq_title: 'Your answers are right here',
      faq_see_all: 'See all questions',
      faq1_q: 'How do I book a wash on Washapp?',
      faq1_a: 'You can book directly on Washapp by providing your location, the type of wash you want, your vehicle details and an available time slot offered on the platform.',
      faq2_q: 'When do I pay for the service?',
      faq2_a: 'Payment must be made before the service begins. Without prior payment, the washer is not required to start the wash.',
      faq3_q: 'Can I pay in cash?',
      faq3_a: 'Yes. Cash payment is allowed, but it must be handed over before the wash begins.',
      faq4_q: 'Can I cancel my booking?',
      faq4_a: 'Yes. You can cancel free of charge up to 1 hour before the scheduled service time.',
      faq5_q: 'What happens if I cancel less than 1 hour before?',
      faq5_a: 'In the event of a late cancellation, 50% of the service price may be retained to cover the washer\'s travel, organisation and mobilisation costs.',
      app_eyebrow: 'Mobile app',
      app_title: 'Download the Washapp app',
      app_sub: 'Book in 30 seconds, track your washer in real time, pay securely.',
      blog_eyebrow: 'Blog',
      blog_title: 'Car tips & tricks',
      blog_see_all: 'See all articles',
      blog1_title: 'At-home car wash: the practical solution for busy drivers',
      blog1_cat: 'Practical',
      blog1_excerpt: 'Between work and daily commutes, getting your car cleaned takes time. At-home washing changes everything.',
      blog1_date: '10 Apr 2026',
      blog2_title: 'Why choose Washapp for your vehicle cleaning',
      blog2_cat: 'Washapp',
      blog2_excerpt: 'A platform built for drivers who want to save time without compromising on cleanliness.',
      blog2_date: '8 Apr 2026',
      blog3_title: 'The right way to wash your car without damaging the paintwork',
      blog3_cat: 'Tips',
      blog3_excerpt: 'Wrong cloth, direct sunlight, excessive pressure: avoid the mistakes that ruin your car\'s paint.',
      blog3_date: '5 Apr 2026',
      read_min_8: '8 min',
      read_min_7: '7 min',
      read_min_6: '6 min',
    },
  }[lang];

  return (
    <main className="min-h-screen bg-white">

      {/* ── HERO PLEIN ÉCRAN ─────────────────────── */}
      <section className="relative h-screen min-h-[600px] flex items-start overflow-hidden">

        {/* Image de fond */}
        <div className="absolute inset-0">
          <Image
            src="/Herowashapp.png"
            alt="Washapp — Lavage professionnel"
            fill
            className="object-cover object-top"
            priority
            quality={95}
          />
          {/* Gradient overlay : sombre à gauche, s'estompe vers la droite */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to right, rgba(4,8,22,0.65) 0%, rgba(4,8,22,0.50) 38%, rgba(4,8,22,0.25) 65%, rgba(4,8,22,0.05) 100%)',
            }}
          />
          {/* Gradient subtil en bas pour lire les textes */}
          <div
            className="absolute inset-x-0 bottom-0 h-40"
            style={{ background: 'linear-gradient(to top, rgba(4,8,22,0.35), transparent)' }}
          />
        </div>

        {/* Contenu */}
        <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 pt-[100px]">
          <div className="max-w-[560px]">

            {/* Eyebrow */}
            <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.22em] uppercase text-[#5b9fff] mb-5">
              <span className="w-6 h-px bg-[#5b9fff]" />
              {txt.eyebrow}
            </span>

            {/* Titre */}
            <h1 className="text-[2.4rem] sm:text-[3rem] font-bold text-white leading-[1.12] tracking-[-0.01em] mb-5">
              {txt.hero_title_1}<br />
              <span className="text-[#5b9fff]">{txt.hero_title_2}</span>
            </h1>

            {/* Sous-titre */}
            <p className="text-[16px] leading-relaxed text-white/70 mb-8 max-w-[440px]">
              {txt.hero_sub}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-9">
              <Link href="/booking"
                className="inline-flex items-center justify-center gap-2.5 text-[15px] font-bold text-white rounded-2xl py-4 px-8 transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: 'linear-gradient(135deg, #2f78ff 0%, #1558f5 60%, #1045e1 100%)',
                  boxShadow: '0 6px 24px rgba(21, 88, 245, 0.50)',
                }}>
                <Zap className="w-[17px] h-[17px]" />
                {txt.cta_instant}
              </Link>
              <Link href="/booking?mode=booking"
                className="inline-flex items-center justify-center gap-2.5 text-[14px] font-semibold text-white border border-white/30 rounded-2xl py-4 px-7 hover:bg-white/10 hover:border-white/50 transition-all duration-200 backdrop-blur-sm">
                <Calendar className="w-[15px] h-[15px]" />
                {txt.cta_book}
              </Link>
            </div>

            {/* Bénéfices client */}
            <div className="flex flex-wrap gap-x-6 gap-y-2.5">
              {[txt.benefit_1, txt.benefit_2, txt.benefit_3, txt.benefit_4].map((item) => (
                <span key={item} className="flex items-center gap-2 text-[13px] text-white/75 font-medium">
                  <CheckCircle2 className="w-[14px] h-[14px] text-[#5b9fff] flex-shrink-0" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Indicateur scroll */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/40 text-[11px] font-medium tracking-widest uppercase">
          <span>{txt.scroll}</span>
          <div className="w-px h-8 bg-white/20 animate-pulse" />
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-[2rem] sm:text-[2.8rem] font-extrabold text-gray-900">
              {txt.steps_title}
            </h2>
          </div>

          {/* Container avec fond image voiture */}
          <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-8 sm:p-12">
            {/* Image de fond voiture */}
            <div className="absolute inset-0 opacity-30">
              <Image
                src="/Voiture.png"
                alt="Voiture"
                fill
                className="object-cover object-center"
              />
            </div>
            
            {/* Overlay léger */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-transparent to-white/60" />

            {/* Contenu */}
            <div className="relative z-10">
              {/* Ligne de connexion entre les étapes */}
              <div className="hidden lg:block absolute top-[4.5rem] left-[20%] right-[20%] h-px">
                <div className="w-full h-full border-t-2 border-dashed border-blue-300/50" />
              </div>

              <div className="grid sm:grid-cols-3 gap-6 lg:gap-8">
                {[
                  {
                    num: '1',
                    icon: MapPin,
                    title: txt.step1_title,
                    desc: txt.step1_desc,
                  },
                  {
                    num: '2',
                    icon: Zap,
                    title: txt.step2_title,
                    desc: txt.step2_desc,
                  },
                  {
                    num: '3',
                    icon: Car,
                    title: txt.step3_title,
                    desc: txt.step3_desc,
                  },
                ].map(({ num, icon: Icon, title, desc }) => (
                  <div key={num} className="relative">
                    {/* Numéro */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md z-20">
                      <span className="text-[14px] font-bold text-gray-700">{num}</span>
                    </div>
                    
                    {/* Carte */}
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 pt-10 shadow-lg border border-white/50 h-full">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-[#1558f5]" />
                      </div>
                      <span className="text-[11px] font-bold tracking-widest text-gray-400 mb-2 block">
                        {txt.step_label} {num}
                      </span>
                      <h3 className="text-[16px] font-bold text-gray-900 mb-2 leading-tight">
                        {title}
                      </h3>
                      <p className="text-[14px] text-gray-500 leading-relaxed">
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bouton CTA */}
              <div className="text-center mt-10">
                <Link 
                  href="/booking"
                  className="inline-flex items-center gap-2 text-[14px] font-bold text-white bg-[#1558f5] hover:bg-[#1045e1] px-8 py-4 rounded-xl transition-all shadow-[0_4px_20px_rgba(21,88,245,0.4)]"
                >
                  <Zap className="w-4 h-4" />
                  {txt.cta_instant}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VIDÉO EXPLICATIVE ───────────────────── */}
      <section className="py-20 bg-[#f8fafc]">
        <div className="max-w-[1000px] mx-auto px-6">
          <div className="text-center mb-10">
            <span className="inline-block text-[11px] font-extrabold tracking-[0.2em] uppercase text-[#1558f5] mb-1">
              {txt.video_eyebrow}
            </span>
            <h2 className="text-[2rem] sm:text-[2.4rem] font-extrabold text-gray-900 mb-3">
              {txt.video_title}
            </h2>
            <p className="text-gray-500 text-[16px] max-w-2xl mx-auto">
              {txt.video_sub}
            </p>
          </div>

          {/* Container vidéo style Stairling */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gray-900 aspect-video group cursor-pointer">
            {/* Thumbnail placeholder - remplacer par vraie image */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900">
              <Image
                src="/Herowashapp.png"
                alt="Vidéo présentation Washapp"
                fill
                className="object-cover opacity-60 group-hover:opacity-50 transition-opacity duration-500"
              />
            </div>

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Bouton Play */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="w-20 h-20 bg-white/95 hover:bg-white rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all duration-300">
                <svg className="w-8 h-8 text-[#1558f5] ml-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>

            {/* Logo en haut à gauche */}
            <div className="absolute top-6 left-6">
              <div className="w-10 h-10 bg-[#1558f5] rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
            </div>

            {/* Texte en bas */}
            <div className="absolute bottom-0 left-0 right-0 p-8 text-center">
              <p className="text-white text-[18px] font-semibold mb-1">
                {txt.video_cta}
              </p>
              <p className="text-white/70 text-[14px]">
                {txt.video_founder}
              </p>
            </div>
          </div>

          {/* Mention légale */}
          <p className="text-center text-[13px] text-gray-400 mt-6">
            {txt.video_soon}
          </p>
        </div>
      </section>

      {/* ── TARIFS ──────────────────────────── */}
      <section className="relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #e8f4ff 0%, #f4f9ff 50%, #ffffff 100%)' }}>

        {/* En-tête de section */}
        <div className="sm:hidden text-center py-2 px-4 relative z-10"
          style={{ background: 'linear-gradient(180deg, #cce5ff 0%, #e8f4ff 60%, #f4f9ff 100%)' }}>
          <span className="inline-block text-[11px] font-extrabold tracking-[0.25em] uppercase text-[#1558f5] mb-3">{txt.tarifs_eyebrow}</span>
          <h2 className="text-[1.3rem] sm:text-[1.7rem] font-extrabold text-gray-900 leading-tight">
            {txt.tarifs_title}
          </h2>
          <p className="text-gray-400 mt-1 text-[13px] max-w-md mx-auto hidden sm:block">
            {txt.tarifs_sub}
          </p>
        </div>

        {/* ===== DESKTOP : image pleine largeur + overlays ===== */}
        <div className="hidden sm:block relative w-full max-w-5xl mx-auto">

          {/* Image de fond — pleine largeur */}
          <Image
            src="/Phonehero.png"
            alt="Tarifs Washapp"
            width={1536}
            height={1024}
            className="w-full h-auto block" style={{ maxHeight: "calc(100vh - 120px)", objectFit: "contain" }}
            priority
          />

          {/* ---- Titre overlay (desktop only) ---- */}
          <div className="absolute top-0 left-0 right-0 text-center pt-2">
            <span className="inline-block text-[13px] font-extrabold tracking-[0.25em] uppercase text-[#1558f5]">{txt.tarifs_eyebrow}</span>
            <h2 className="text-[1.6rem] font-extrabold text-gray-900 leading-tight">
              {txt.tarifs_title}
            </h2>
          </div>

          {/* ---- Smartphone GAUCHE ---- */}
          <div className="absolute flex flex-col items-center justify-start text-center overflow-hidden"
            style={{ left: '20%', right: '64%', top: '28%', bottom: '27%', gap: '0.4vw', paddingTop: 'clamp(10px, 1.5vw, 22px)', paddingBottom: 'clamp(6px, 0.8%, 12px)', paddingLeft: 'clamp(4px, 0.5%, 10px)', paddingRight: 'clamp(4px, 0.5%, 10px)' }}>
            <h3 className="font-bold text-gray-800 leading-tight w-full"
              style={{ fontSize: 'clamp(11px, 1.4vw, 18px)' }}>
              {txt.ext_name.split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
            </h3>
            <p className="text-gray-500 leading-snug w-full"
              style={{ fontSize: 'clamp(8px, 0.8vw, 11px)' }}>
              {txt.ext_desc.split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
            </p>
            <p className="text-[#1558f5] font-black leading-none w-full"
              style={{ fontSize: 'clamp(16px, 2.2vw, 30px)' }}>
              1 500
            </p>
            <p className="text-gray-400 font-semibold w-full"
              style={{ fontSize: 'clamp(7px, 0.7vw, 10px)' }}>
              FCFA
            </p>
            <Link href="/booking"
              className="block mx-auto bg-[#1558f5] text-white font-bold rounded-lg hover:bg-[#1045e1] transition-colors text-center"
              style={{ fontSize: 'clamp(8px, 0.8vw, 11px)', padding: 'clamp(4px, 0.5vw, 8px) clamp(6px, 0.8vw, 12px)', width: 'fit-content' }}>
              {txt.choose}
            </Link>
          </div>

          {/* ---- Smartphone CENTRE ---- */}
          <div className="absolute flex flex-col items-center justify-start text-center overflow-hidden"
            style={{
              left: '39%',
              right: '42%',
              top: '24%',
              bottom: '13%',
              gap: '0.4vw',
              paddingTop: 'clamp(10px, 1.8vw, 28px)',
              paddingBottom: 'clamp(6px, 0.8%, 12px)',
              paddingLeft: 'clamp(6px, 1%, 14px)',
              paddingRight: 'clamp(6px, 1%, 14px)',
            }}>
            <span className="inline-block text-white font-black uppercase rounded-full"
              style={{
                fontSize: 'clamp(7px, 0.7vw, 10px)',
                padding: '3px 10px',
                letterSpacing: '0.12em',
                background: 'rgba(255,255,255,0.18)',
                flexShrink: 0,
              }}>
              {txt.full_badge}
            </span>
            <h3 className="font-black text-white leading-tight w-full"
              style={{ fontSize: 'clamp(14px, 1.8vw, 24px)', flexShrink: 0 }}>
              {txt.full_name}
            </h3>
            <p className="leading-snug w-full"
              style={{ fontSize: 'clamp(9px, 0.9vw, 13px)', flexShrink: 0, color: 'rgba(255,255,255,0.82)' }}>
              {txt.full_desc.split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
            </p>
            <p className="text-white font-black leading-none w-full"
              style={{ fontSize: 'clamp(18px, 3.2vw, 40px)', flexShrink: 0 }}>
              4 000
            </p>
            <p className="font-semibold w-full"
              style={{ fontSize: 'clamp(8px, 0.8vw, 12px)', flexShrink: 0, color: 'rgba(255,255,255,0.7)' }}>
              FCFA
            </p>
            <Link href="/booking"
              className="bg-white text-[#1558f5] font-bold rounded-xl hover:bg-blue-50 transition-colors text-center"
              style={{ fontSize: 'clamp(8px, 0.8vw, 11px)', padding: 'clamp(4px, 0.5vw, 8px) clamp(8px, 1vw, 14px)', flexShrink: 0 }}>
              {txt.choose}
            </Link>
          </div>

          {/* ---- Smartphone DROITE ---- */}
          <div className="absolute flex flex-col items-center justify-start text-center overflow-hidden"
            style={{ left: '64%', right: '23%', top: '28%', bottom: '27%', gap: '0.4vw', paddingTop: 'clamp(10px, 1.5vw, 22px)', paddingBottom: 'clamp(6px, 0.8%, 12px)', paddingLeft: 'clamp(4px, 0.5%, 10px)', paddingRight: 'clamp(4px, 0.5%, 10px)' }}>
            <h3 className="font-bold text-gray-800 leading-tight w-full"
              style={{ fontSize: 'clamp(11px, 1.4vw, 18px)' }}>
              {txt.int_name.split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
            </h3>
            <p className="text-gray-500 leading-snug w-full"
              style={{ fontSize: 'clamp(8px, 0.8vw, 11px)' }}>
              {txt.int_desc.split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
            </p>
            <p className="text-[#1558f5] font-black leading-none w-full"
              style={{ fontSize: 'clamp(16px, 2.2vw, 30px)' }}>
              2 500
            </p>
            <p className="text-gray-400 font-semibold w-full"
              style={{ fontSize: 'clamp(7px, 0.7vw, 10px)' }}>
              FCFA
            </p>
            <Link href="/booking"
              className="block mx-auto bg-[#1558f5] text-white font-bold rounded-lg hover:bg-[#1045e1] transition-colors text-center"
              style={{ fontSize: 'clamp(8px, 0.8vw, 11px)', padding: 'clamp(4px, 0.5vw, 8px) clamp(6px, 0.8vw, 12px)', width: 'fit-content' }}>
              {txt.choose}
            </Link>
          </div>

          {/* ---- Rectangle ABONNEMENT bas ---- */}
          <div className="absolute flex flex-col items-center text-center"
            style={{ left: '26%', top: '77%', width: '44%' }}>
            <p className="font-black text-[#1558f5] flex items-center justify-center gap-1"
              style={{ fontSize: 'clamp(13px, 1.5vw, 22px)' }}>
              {txt.sub_title}
            </p>
            <p className="text-gray-500 mt-0.5"
              style={{ fontSize: 'clamp(8px, 0.8vw, 11px)' }}>
              {txt.sub_desc}{' '}
              <strong className="text-gray-800">40 000 FCFA</strong>
            </p>
            <Link href="/tarifs"
              className="mt-2 inline-block bg-[#1558f5] text-white font-bold rounded-xl hover:bg-[#1045e1] transition-colors"
              style={{ fontSize: 'clamp(11px, 1.1vw, 15px)', padding: 'clamp(8px, 0.9vw, 12px) clamp(18px, 2vw, 30px)' }}>
              {txt.sub_cta}
            </Link>
          </div>

        </div>

        {/* ===== MOBILE : cartes simples ===== */}
        <div className="sm:hidden px-4 py-8 space-y-4"
          style={{ background: 'linear-gradient(180deg, #cce5ff 0%, #f4f9ff 100%)' }}>
          {[
            { name: lang === 'fr' ? 'Lavage Extérieur' : 'Exterior Wash', price: '1 500', desc: lang === 'fr' ? 'Carrosserie, vitres, jantes, séchage.' : 'Body, windows, rims, drying.', featured: false },
            { name: lang === 'fr' ? 'Complet' : 'Full Wash', price: '4 000', desc: lang === 'fr' ? 'Lavage extérieur + intérieur. La totale.' : 'Exterior + interior. The complete deal.', featured: true },
            { name: lang === 'fr' ? 'Lavage Intérieur' : 'Interior Wash', price: '2 500', desc: lang === 'fr' ? 'Sièges, tableau de bord, tapis, aspiration.' : 'Seats, dashboard, mats, vacuuming.', featured: false },
          ].map(({ name, price, desc, featured }) => (
            <div key={name}
              className={`rounded-2xl p-6 text-center ${featured ? '' : 'bg-white border border-gray-100 shadow-sm'}`}
              style={featured ? { background: 'linear-gradient(145deg, #2f78ff 0%, #1045e1 100%)' } : {}}>
              {featured && (
                <span className="inline-block text-[9px] font-black bg-white/20 text-white px-3 py-1 rounded-full mb-3 tracking-widest uppercase">
                  {txt.full_badge}
                </span>
              )}
              <h3 className={`text-[16px] font-bold mb-1 ${featured ? 'text-white' : 'text-gray-900'}`}>{name}</h3>
              <p className={`text-[12px] mb-4 ${featured ? 'text-blue-100' : 'text-gray-400'}`}>{desc}</p>
              <p className={`text-[2.2rem] font-black leading-none ${featured ? 'text-white' : 'text-[#1558f5]'}`}>{price}</p>
              <p className={`text-[11px] mb-5 mt-0.5 ${featured ? 'text-blue-200' : 'text-gray-400'}`}>FCFA</p>
              <Link href="/booking"
                className={`block font-bold py-3 rounded-xl text-[13px] ${featured ? 'bg-white text-[#1558f5]' : 'bg-[#1558f5] text-white'}`}>
                {txt.choose}
              </Link>
            </div>
          ))}
          <div className="border border-blue-100 rounded-2xl p-5 text-center bg-white shadow-sm">
            <p className="text-[#1558f5] font-black text-[16px] mb-1">{txt.sub_title}</p>
            <p className="text-gray-500 text-[13px] mb-3">{txt.sub_desc} <strong>40 000 FCFA</strong></p>
            <Link href="/tarifs" className="inline-block bg-[#1558f5] text-white font-bold px-6 py-3 rounded-xl text-[13px]">
              {txt.sub_cta}
            </Link>
          </div>
        </div>

      </section>

      {/* ── POURQUOI WASHAPP ───────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-14">

            {/* Colonne gauche — Image */}
            <div className="w-full lg:w-[45%] flex-shrink-0">
              <div className="relative rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
                <Image
                  src="/Travailleur.png"
                  alt="Washer Washapp en action"
                  width={800}
                  height={900}
                  className="w-full h-auto object-cover"
                />
                {/* Badge flottant */}
                <div className="absolute bottom-5 left-5 bg-white rounded-2xl px-4 py-3 shadow-lg flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#1558f5] flex items-center justify-center flex-shrink-0">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-[12px] font-extrabold text-gray-900">{txt.badge_certified}</p>
                    <p className="text-[11px] text-gray-400">{txt.badge_trained}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne droite — Texte */}
            <div className="w-full lg:w-[55%]">
              <span className="inline-block text-[11px] font-extrabold tracking-[0.25em] uppercase text-[#1558f5] mb-4">
                {txt.why_eyebrow}
              </span>
              <h2 className="text-[1.9rem] sm:text-[2.4rem] font-extrabold text-gray-900 leading-tight mb-5">
                {txt.why_title}
              </h2>
              <p className="text-[15px] text-gray-500 leading-relaxed mb-10 max-w-lg">
                {txt.why_sub}
              </p>

              {/* Points de réassurance */}
              <div className="space-y-6">
                {[
                  {
                    icon: Shield,
                    color: '#1558f5',
                    bg: '#eff4ff',
                    title: txt.feat1_title,
                    desc: txt.feat1_desc,
                  },
                  {
                    icon: Camera,
                    color: '#0891b2',
                    bg: '#f0f9ff',
                    title: txt.feat2_title,
                    desc: txt.feat2_desc,
                  },
                  {
                    icon: Star,
                    color: '#d97706',
                    bg: '#fffbeb',
                    title: txt.feat3_title,
                    desc: txt.feat3_desc,
                  },
                  {
                    icon: Wallet,
                    color: '#16a34a',
                    bg: '#f0fdf4',
                    title: txt.feat4_title,
                    desc: txt.feat4_desc,
                  },
                ].map(({ icon: Icon, color, bg, title, desc }) => (
                  <div key={title} className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: bg }}>
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <div>
                      <h3 className="text-[15px] font-bold text-gray-900 mb-0.5">{title}</h3>
                      <p className="text-[14px] text-gray-500 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────── */}
      <section className="py-20 bg-[#f8fafc]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-start">

            {/* Colonne gauche */}
            <div className="lg:w-[38%] flex-shrink-0 lg:sticky lg:top-24">
              <span className="inline-block text-[11px] font-extrabold tracking-[0.25em] uppercase text-[#1558f5] mb-5">
                {txt.faq_eyebrow}
              </span>
              <h2 className="text-[2rem] sm:text-[2.6rem] font-extrabold text-gray-900 leading-tight">
                {txt.faq_title}
              </h2>
            </div>

            {/* Colonne droite — Accordéon */}
            <div className="lg:w-[62%] w-full">
              {[
                { q: txt.faq1_q, a: txt.faq1_a },
                { q: txt.faq2_q, a: txt.faq2_a },
                { q: txt.faq3_q, a: txt.faq3_a },
                { q: txt.faq4_q, a: txt.faq4_a },
                { q: txt.faq5_q, a: txt.faq5_a },
              ].map(({ q, a }) => (
                <FAQItem key={q} q={q} a={a} />
              ))}

              {/* Bouton Voir plus */}
              <div className="mt-8">
                <Link
                  href="/faq"
                  className="inline-flex items-center gap-2 bg-[#1558f5] text-white font-bold px-7 py-3.5 rounded-xl text-[14px] hover:bg-[#1045e1] transition-colors"
                >
                  {txt.faq_see_all}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7h8M8 4l3 3-3 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── DOWNLOAD CTA ──────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="rounded-3xl overflow-hidden relative"
            style={{ background: 'linear-gradient(135deg, #040c24 0%, #0f2260 50%, #1558f5 100%)' }}>
            <div className="px-8 sm:px-14 py-14 text-center relative z-10">
              <span className="inline-block text-[11px] font-extrabold tracking-[0.2em] uppercase text-blue-400 mb-4">
                {txt.app_eyebrow}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
                {txt.app_title}
              </h2>
              <p className="text-white/60 text-[16px] mb-9 max-w-md mx-auto leading-relaxed">
                {txt.app_sub}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {/* Apple App Store badge */}
                <a href="#" className="hover:opacity-90 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" width="160" height="54" viewBox="0 0 160 54">
                    <rect width="160" height="54" rx="9" fill="white"/>
                    <text x="47" y="19" fontFamily="-apple-system, BlinkMacSystemFont, Arial, sans-serif" fontSize="10" fill="#1a1a1a" letterSpacing="0.3">Download on the</text>
                    <text x="40" y="40" fontFamily="-apple-system, BlinkMacSystemFont, Arial, sans-serif" fontSize="21" fontWeight="700" fill="#1a1a1a">App Store</text>
                    <path d="M27 10.5c-1.7 2-1.6 5 .2 6.9-1 .1-2.5-.5-3.5-1.6-1.3-1.5-1.3-4 0-5.4.9-1 2.2-1.6 3.3-1.5zm.4-3.5c1.5 0 2.8.7 3.6 1.9-1.5.8-2.4 2.4-2.4 4.1 0 1.8 1 3.4 2.6 4.2-.5 1.3-1.1 2.3-2 3.1-.8.8-1.5 1.2-2.4 1.2-.8 0-1.4-.3-2-.6-.6-.3-1.2-.6-2-.6-.8 0-1.4.3-2 .6-.6.3-1.2.6-2 .6-1.9 0-3.8-2.1-4.6-4.3-.5-1.3-.8-2.7-.8-4 0-3.8 2.4-5.8 4.8-5.8.9 0 1.7.3 2.4.6.6.3 1.1.5 1.6.5.5 0 1-.2 1.6-.5.7-.3 1.5-.6 2.6-.5zm-.2-4c.1 1-.3 2-1 2.8-.7.8-1.7 1.3-2.7 1.2-.1-1 .3-2 1-2.7.7-.8 1.8-1.3 2.7-1.3z" fill="#1a1a1a"/>
                  </svg>
                </a>
                {/* Google Play badge */}
                <a href="#" className="hover:opacity-90 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" width="175" height="54" viewBox="0 0 175 54">
                    <rect width="175" height="54" rx="9" fill="white"/>
                    <text x="47" y="19" fontFamily="Arial, sans-serif" fontSize="10" fill="#1a1a1a" letterSpacing="0.3">GET IT ON</text>
                    <text x="40" y="40" fontFamily="Arial, sans-serif" fontSize="21" fontWeight="700" fill="#1a1a1a">Google Play</text>
                    <path d="M13 9.5l14.5 14.5L13 38.5V9.5z" fill="#00C853"/>
                    <path d="M13 9.5l14.5 14.5 5.5-5.5-16-9h-4z" fill="#F44336"/>
                    <path d="M13 38.5l14.5-14.5 5.5 5.5-16 9h-4z" fill="#2196F3"/>
                    <path d="M33 18.5l-5.5 5.5 5.5 5.5 4-5.5-4-5.5z" fill="#FFC107"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BLOG SECTION ────────────────────────── */}
      <section className="py-20 bg-[#f9fafb]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="inline-block text-[11px] font-bold tracking-[0.18em] text-[#1558f5] uppercase mb-3">
                {txt.blog_eyebrow}
              </span>
              <h2 className="text-[1.9rem] font-extrabold text-gray-900 leading-tight">
                {txt.blog_title}
              </h2>
            </div>
            <Link href="/blog" className="hidden sm:flex items-center gap-1.5 text-[13px] font-semibold text-[#1558f5] hover:underline">
              {txt.blog_see_all}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { slug: 'lavage-domicile-solution-pratique', title: txt.blog1_title, category: txt.blog1_cat, categoryColor: '#059669', categoryBg: '#ecfdf5', excerpt: txt.blog1_excerpt, date: txt.blog1_date, readTime: txt.read_min_8, gradient: 'from-blue-500 to-blue-700' },
              { slug: 'pourquoi-choisir-washapp', title: txt.blog2_title, category: txt.blog2_cat, categoryColor: '#1558f5', categoryBg: '#eff6ff', excerpt: txt.blog2_excerpt, date: txt.blog2_date, readTime: txt.read_min_7, gradient: 'from-emerald-500 to-teal-600' },
              { slug: 'bons-gestes-laver-voiture-carrosserie', title: txt.blog3_title, category: txt.blog3_cat, categoryColor: '#d97706', categoryBg: '#fffbeb', excerpt: txt.blog3_excerpt, date: txt.blog3_date, readTime: txt.read_min_6, gradient: 'from-amber-500 to-orange-600' },
            ].map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all duration-300 group flex flex-col"
              >
                <div className={`h-36 bg-gradient-to-br ${post.gradient} relative overflow-hidden`}>
                  <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.4) 0%, transparent 50%)'}} />
                  <div className="absolute bottom-3 left-4">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: post.categoryBg, color: post.categoryColor }}>
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-[0.9rem] font-bold text-gray-900 leading-snug mb-2 group-hover:text-[#1558f5] transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-[0.8rem] text-gray-500 leading-relaxed mb-4 line-clamp-2 flex-1">{post.excerpt}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <span className="text-[11px] text-gray-400">{post.date} · {post.readTime}</span>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#1558f5] group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8 sm:hidden">
            <Link href="/blog" className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#1558f5] hover:underline">
              {txt.blog_see_all} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────── */}

      <Footer />
    </main>
  );
}
