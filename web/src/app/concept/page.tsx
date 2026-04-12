import { Zap, Car, Sparkles, Shield, CheckCircle } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export default function ConceptPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* HERO */}
      <section className="py-24 px-6 text-center bg-gradient-to-b from-[#f0f6ff] to-white">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block text-[11px] font-extrabold tracking-[0.25em] uppercase text-[#1558f5] mb-4">Le concept</span>
          <h1 className="text-[2.6rem] sm:text-[3.4rem] font-extrabold text-gray-900 leading-tight mb-5">
            Lavage auto à domicile,<br className="hidden sm:block" /> simple et rapide.
          </h1>
          <p className="text-[17px] text-gray-500 leading-relaxed max-w-xl mx-auto mb-8">
            Réservez en quelques secondes. Un professionnel se déplace et nettoie votre véhicule sur place.
          </p>
          <Link href="/booking" className="inline-flex items-center gap-2 bg-[#1558f5] text-white font-bold py-3.5 px-8 rounded-2xl text-[15px] hover:bg-[#1045e1] transition-colors">
            <Zap className="w-4 h-4" /> Réserver maintenant
          </Link>
        </div>
      </section>

      {/* COMMENT CA MARCHE */}
      <section className="py-20 px-6">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-[11px] font-extrabold tracking-[0.25em] uppercase text-[#1558f5] mb-3">Fonctionnement</span>
            <h2 className="text-[2rem] sm:text-[2.4rem] font-extrabold text-gray-900">Comment ça marche</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { icon: Zap,      color: '#1558f5', bg: '#eff4ff', title: 'Réservation rapide',    desc: 'Choisissez votre formule et réservez en quelques clics.' },
              { icon: Car,      color: '#0891b2', bg: '#f0f9ff', title: 'Intervention sur place',  desc: 'Un washer se déplace directement à votre position.' },
              { icon: Sparkles, color: '#d97706', bg: '#fffbeb', title: 'Résultat impeccable',   desc: 'Votre véhicule est nettoyé sur place, sans effort de votre part.' },
              { icon: Shield,   color: '#16a34a', bg: '#f0fdf4', title: 'Paiement sécurisé',    desc: "Vous payez à l’avance. L’intervention démarre uniquement après validation." },
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
            <span className="inline-block text-[11px] font-extrabold tracking-[0.25em] uppercase text-[#1558f5] mb-3">Nos engagements</span>
            <h2 className="text-[2rem] sm:text-[2.4rem] font-extrabold text-gray-900">Un service conçu pour vous rassurer</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {[
              'Des professionnels fiables — Washers sélectionnés pour leur sérieux.',
              'Qualité garantie — Photos avant / après pour chaque prestation.',
              'Transparence totale — Le prix affiché est le prix payé, sans surprise.',
              'Paiement sécurisé — Transactions protégées via Orange Money.',
              'Support disponible — Une équipe prête à vous aider en cas de besoin.',
            ].map((item) => (
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
            <h2 className="text-[2rem] sm:text-[2.4rem] font-extrabold mb-3">Essayez Washapp dès aujourd’hui.</h2>
            <p className="text-blue-100 mb-8 text-[16px]">Disponible à Abidjan. Réservez votre lavage en quelques secondes.</p>
            <Link href="/booking" className="inline-flex items-center gap-2 bg-white text-[#1558f5] font-bold py-3.5 px-8 rounded-2xl text-[15px] hover:bg-blue-50 transition-colors">
              <Zap className="w-4 h-4" /> Réserver maintenant
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}