'use client';

import Footer from '@/components/layout/Footer';
import { Check, Wallet, Zap, Shield } from 'lucide-react';
import { useLang } from '@/contexts/lang';

export default function DevenirWasherPage() {
  const { lang } = useLang();
  const txt = {
    fr: {
      hero_badge: 'Devenez Washer independant',
      hero_title_1: 'Générez des revenus en',
      hero_title_2: 'lavant des vehicules',
      hero_sub: 'Rejoignez le reseau Washapp et recevez des missions de lavage pres de chez vous. Travaillez a votre rythme, sans commission.',
      hero_cta: 'Postuler maintenant',
      adv1_title: 'Zero commission',
      adv1_desc: "Chaque centime que vous gagnez vous appartient. Washapp se retribue uniquement via l'abonnement hebdomadaire.",
      adv2_title: 'Missions en temps reel',
      adv2_desc: 'Recevez les missions directement sur votre telephone. Acceptez, gerez et suivez tout depuis Washapp.',
      adv3_title: 'Accompagnement complet',
      adv3_desc: 'Formation, materiel, support et suivi qualite. Washapp vous donne tous les outils pour reussir.',
      steps_title: 'Comment devenir Washer ?',
      steps_sub: '5 etapes pour rejoindre le reseau Washapp',
      steps: [
        { num: '01', title: 'Formation obligatoire', desc: 'Une journee de formation complete pour maitriser les techniques de lavage professionnel, les produits et les attentes qualite Washapp.' },
        { num: '02', title: 'Test de validation', desc: 'Un test pratique evalue par notre equipe atteste que vous etes pret a servir nos clients avec le niveau de qualite requis.' },
        { num: '03', title: 'Acquisition du materiel', desc: 'Avant activation, vous devez posseder le materiel obligatoire : kit de nettoyage professionnel, produits agrees Washapp.' },
        { num: '04', title: 'Abonnement Washapp', desc: '35 000 FCFA par semaine. Sans commission sur vos missions. Tout ce que vous gagnez est a vous.' },
        { num: '05', title: 'Activation et premiere mission', desc: "Votre profil est valide par l'equipe Washapp. Vous passez en ligne sur la carte et les missions arrivent directement sur votre telephone." },
      ],
      earnings_title: 'Ce que vous pouvez gagner',
      earnings_sub: 'Exemples de revenus journaliers (hors abonnement)',
      th_service: 'Prestation',
      th_price: 'Prix',
      th_volume: 'Volume / jour',
      th_revenue: 'Revenu / jour',
      earnings: [
        { service: 'Lavage Exterieur', price: '1 500 FCFA', missions: '10 missions / jour', total: '15 000 FCFA' },
        { service: 'Lavage Interieur', price: '2 500 FCFA', missions: '8 missions / jour',  total: '20 000 FCFA' },
        { service: 'Lavage Complet',   price: '4 000 FCFA', missions: '6 missions / jour',  total: '24 000 FCFA' },
      ],
      expect_title: 'Ce que nous attendons',
      expect_sub: 'Les criteres pour rester dans le reseau Washapp',
      expectations: [
        'Etre ponctuel a toutes les missions',
        'Prendre des photos avant et apres chaque lavage',
        'Maintenir une bonne note client',
        'Etre equipe du materiel obligatoire',
        "Renouveler l'abonnement chaque semaine",
        'Respecter les clients en toutes circonstances',
        'Signaler tout incident via Washapp',
        'Confirmer la reception des paiements',
      ],
      cta_title: 'Pret a rejoindre Washapp ?',
      cta_sub: 'Postulez maintenant et notre equipe vous contactera sous 48h.',
      cta_btn: 'Deposer ma candidature',
    },
    en: {
      hero_badge: 'Become an independent Washer',
      hero_title_1: 'Generate income by',
      hero_title_2: 'washing vehicles',
      hero_sub: 'Join the Washapp network and receive car wash jobs near you. Work at your own pace, with no commission.',
      hero_cta: 'Apply now',
      adv1_title: 'Zero commission',
      adv1_desc: 'Every cent you earn is yours. Washapp earns only through the weekly subscription.',
      adv2_title: 'Real-time missions',
      adv2_desc: 'Receive jobs directly on your phone. Accept, manage and track everything through Washapp.',
      adv3_title: 'Full support',
      adv3_desc: 'Training, equipment, support and quality monitoring. Washapp gives you all the tools to succeed.',
      steps_title: 'How to become a Washer?',
      steps_sub: '5 steps to join the Washapp network',
      steps: [
        { num: '01', title: 'Mandatory training', desc: 'A full day of training to master professional washing techniques, products and Washapp quality standards.' },
        { num: '02', title: 'Validation test', desc: 'A practical test assessed by our team confirms you are ready to serve our clients at the required quality level.' },
        { num: '03', title: 'Equipment acquisition', desc: 'Before activation, you must have the mandatory equipment: professional cleaning kit, Washapp-approved products.' },
        { num: '04', title: 'Washapp subscription', desc: '35,000 FCFA per week. No commission on your jobs. Everything you earn is yours.' },
        { num: '05', title: 'Activation and first mission', desc: "Your profile is validated by the Washapp team. You go live on the map and missions arrive directly on your phone." },
      ],
      earnings_title: 'What you can earn',
      earnings_sub: 'Examples of daily income (excluding subscription)',
      th_service: 'Service',
      th_price: 'Price',
      th_volume: 'Volume / day',
      th_revenue: 'Revenue / day',
      earnings: [
        { service: 'Exterior wash', price: '1,500 FCFA', missions: '10 jobs / day', total: '15,000 FCFA' },
        { service: 'Interior wash', price: '2,500 FCFA', missions: '8 jobs / day',  total: '20,000 FCFA' },
        { service: 'Full wash',     price: '4,000 FCFA', missions: '6 jobs / day',  total: '24,000 FCFA' },
      ],
      expect_title: 'What we expect',
      expect_sub: 'The criteria to remain in the Washapp network',
      expectations: [
        'Be punctual for all missions',
        'Take before and after photos for each wash',
        'Maintain a good client rating',
        'Have the mandatory equipment',
        'Renew the subscription every week',
        'Respect clients in all circumstances',
        'Report any incident via Washapp',
        'Confirm receipt of payments',
      ],
      cta_title: 'Ready to join Washapp?',
      cta_sub: 'Apply now and our team will contact you within 48 hours.',
      cta_btn: 'Submit my application',
    },
  }[lang];

  return (
    <div className="min-h-screen bg-[#f9fafb]">

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#040c24] text-white py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-8">
            <span className="text-blue-400 text-sm font-semibold">{txt.hero_badge}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-6 leading-tight">
            {txt.hero_title_1}<br />
            <span className="text-blue-400">{txt.hero_title_2}</span>
          </h1>
          <p className="text-lg text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto">
            {txt.hero_sub}
          </p>
          <a
            href="/postuler"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-2xl transition-colors text-lg"
          >
            {txt.hero_cta}
          </a>
        </div>
      </section>

      {/* AVANTAGES */}
      <section className="bg-white border-b border-gray-100 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-emerald-50">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                <Wallet className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">{txt.adv1_title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{txt.adv1_desc}</p>
            </div>
            <div className="p-6 rounded-2xl bg-blue-50">
              <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">{txt.adv2_title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{txt.adv2_desc}</p>
            </div>
            <div className="p-6 rounded-2xl bg-violet-50">
              <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center mb-4">
                <Shield className="w-5 h-5 text-violet-600" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">{txt.adv3_title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{txt.adv3_desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ETAPES */}
      <section id="etapes" className="py-20 px-6 bg-[#f9fafb]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-center text-gray-900 mb-4">{txt.steps_title}</h2>
          <p className="text-center text-gray-500 mb-14">{txt.steps_sub}</p>
          <div className="flex flex-col gap-6">
            {txt.steps.map((step) => (
              <div key={step.num} className="bg-white rounded-2xl p-6 border border-gray-100 flex gap-5 items-start">
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                  <span className="text-white font-black text-sm">{step.num}</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GAINS */}
      <section className="py-20 px-6 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-center text-gray-900 mb-4">{txt.earnings_title}</h2>
          <p className="text-center text-gray-500 mb-14">{txt.earnings_sub}</p>
          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#040c24] text-white">
                  <th className="py-4 px-5 text-left font-semibold">{txt.th_service}</th>
                  <th className="py-4 px-5 text-right font-semibold">{txt.th_price}</th>
                  <th className="py-4 px-5 text-right font-semibold">{txt.th_volume}</th>
                  <th className="py-4 px-5 text-right font-semibold">{txt.th_revenue}</th>
                </tr>
              </thead>
              <tbody>
                {txt.earnings.map((row, i) => (
                  <tr key={row.service} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="py-4 px-5 font-medium text-gray-900">{row.service}</td>
                    <td className="py-4 px-5 text-right text-gray-600">{row.price}</td>
                    <td className="py-4 px-5 text-right text-gray-600">{row.missions}</td>
                    <td className="py-4 px-5 text-right font-bold text-blue-600">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ATTENTES */}
      <section className="py-20 px-6 bg-[#040c24] text-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-4">{txt.expect_title}</h2>
          <p className="text-center text-slate-400 mb-14">{txt.expect_sub}</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {txt.expectations.map((exp) => (
              <div key={exp} className="flex items-start gap-3 bg-white/5 rounded-xl p-4 border border-white/10">
                <Check className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-300">{exp}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-black text-gray-900 mb-4">{txt.cta_title}</h2>
          <p className="text-gray-500 mb-10">{txt.cta_sub}</p>
          <a
            href="/postuler"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-4 rounded-2xl transition-colors text-lg"
          >
            {txt.cta_btn}
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
