import Link from 'next/link';
import Footer from '@/components/layout/Footer';
import { Check, ArrowRight, Sparkles } from 'lucide-react';

const services = [
  {
    id: 'exterior',
    badge: null,
    name: 'Lavage extérieur',
    desc: 'Carrosserie, vitres, jantes et finition propre.',
    price: '1 500',
    features: ['Carrosserie complète', 'Vitres et pare-brise', 'Jantes et pneus', 'Séchage finition'],
    highlight: false,
  },
  {
    id: 'full',
    badge: 'Le plus populaire',
    name: 'Lavage complet',
    desc: "L'extérieur et l'intérieur réunis dans une formule simple.",
    price: '4 000',
    features: ['Carrosserie complète', 'Vitres et pare-brise', 'Jantes et pneus', 'Sièges et tissu', 'Tableau de bord', 'Tapis et aspiration'],
    highlight: true,
  },
  {
    id: 'interior',
    badge: null,
    name: 'Lavage intérieur',
    desc: 'Sièges, tableau de bord, tapis et aspiration.',
    price: '2 500',
    features: ['Sièges et tissu', 'Tableau de bord', 'Tapis complets', 'Aspiration profonde'],
    highlight: false,
  },
];

const subscriptions = [
  {
    name: 'Abonnement Extérieur',
    price: '16 500',
    saving: '1 500',
    highlight: false,
    plan: 'EXTERIOR',
  },
  {
    name: 'Abonnement Complet',
    price: '44 000',
    saving: '4 000',
    highlight: true,
    plan: 'FULL',
  },
  {
    name: 'Abonnement Intérieur',
    price: '27 500',
    saving: '2 500',
    highlight: false,
    plan: 'INTERIOR',
  },
];

export default function TarifsPage() {
  return (
    <div className="min-h-screen bg-[#f9fafb]">

      {/* ── HERO ─────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <span className="inline-block text-[11px] font-bold tracking-[0.18em] text-[#1558f5] uppercase mb-5">
            Formules
          </span>
          <h1 className="text-[2.75rem] sm:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight mb-5">
            Des prix clairs,<br className="hidden sm:block" /> pensés pour vous
          </h1>
          <p className="text-[1.05rem] text-gray-500 max-w-xl mx-auto leading-relaxed">
            Commandez en toute simplicité. Le prix affiché est le prix payé,
            avec un service clair et sans mauvaise surprise.
          </p>
        </div>
      </section>

      {/* ── PRESTATIONS ──────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-[1.6rem] font-bold text-gray-900 mb-2">Prestations à l&apos;unité</h2>
        <p className="text-gray-400 text-[0.95rem] mb-10">
          Choisissez la formule adaptée à votre véhicule, réservez en quelques secondes.
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
                Réserver maintenant
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
              Abonnements
            </span>
            <h2 className="text-[1.7rem] font-bold text-gray-900 mb-3">
              Gagnez en confort avec nos abonnements
            </h2>
            <p className="text-gray-400 text-[0.95rem] max-w-xl">
              Pour les besoins réguliers, profitez d&apos;une formule plus avantageuse
              avec 12 lavages et 1 lavage offert.
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
                    Meilleure valeur
                  </span>
                )}

                <div>
                  <h3 className={`text-[1.05rem] font-bold mb-1 ${s.highlight ? 'text-white' : 'text-gray-900'}`}>
                    {s.name}
                  </h3>
                  <p className={`text-[0.8rem] ${s.highlight ? 'text-slate-400' : 'text-gray-400'}`}>
                    12 lavages — 1 offert
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
                  Économie de {s.saving} FCFA
                </p>

                <Link
                  href={`/abonnements/activer?plan=${s.plan}`}
                  className={`mt-auto flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[0.875rem] font-bold transition-all ${
                    s.highlight
                      ? 'bg-white text-[#0f172a] hover:bg-gray-100'
                      : 'bg-[#1558f5] text-white hover:bg-[#1045e1]'
                  }`}
                >
                  S&apos;abonner
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
          Besoin d&apos;aide pour choisir ?
        </h2>
        <p className="text-gray-400 text-[0.95rem] mb-8 max-w-md mx-auto leading-relaxed">
          Notre équipe vous accompagne pour trouver la formule adaptée à votre usage.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/faq"
            className="px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold text-[0.9rem] hover:border-[#1558f5] hover:text-[#1558f5] transition-all"
          >
            Voir la FAQ
          </Link>
          <Link
            href="/booking"
            className="px-6 py-3 rounded-xl bg-[#1558f5] text-white font-semibold text-[0.9rem] hover:bg-[#1045e1] transition-all flex items-center gap-2 shadow-[0_4px_16px_rgba(21,88,245,0.3)]"
          >
            Réserver maintenant
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
