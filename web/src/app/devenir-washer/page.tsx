import Footer from '@/components/layout/Footer';
import { Check, Wallet, Zap, Shield } from 'lucide-react';

const steps = [
  { num: '01', title: 'Formation obligatoire', desc: 'Une journee de formation complete pour maitriser les techniques de lavage professionnel, les produits et les attentes qualite Washapp.' },
  { num: '02', title: 'Test de validation', desc: 'Un test pratique evalue par notre equipe atteste que vous etes pret a servir nos clients avec le niveau de qualite requis.' },
  { num: '03', title: 'Acquisition du materiel', desc: 'Avant activation, vous devez posseder le materiel obligatoire : kit de nettoyage professionnel, produits agrees Washapp.' },
  { num: '04', title: 'Abonnement Washapp', desc: '35 000 FCFA par semaine. Sans commission sur vos missions. Tout ce que vous gagnez est a vous.' },
  { num: '05', title: 'Activation et premiere mission', desc: "Votre profil est valide par l'equipe Washapp. Vous passez en ligne sur la carte et les missions arrivent directement sur votre telephone." },
];

const earnings = [
  { service: 'Lavage Exterieur', price: '1 500 FCFA', missions: '10 missions / jour', total: '15 000 FCFA' },
  { service: 'Lavage Interieur', price: '2 500 FCFA', missions: '8 missions / jour',  total: '20 000 FCFA' },
  { service: 'Lavage Complet',   price: '4 000 FCFA', missions: '6 missions / jour',  total: '24 000 FCFA' },
];

const expectations = [
  'Etre ponctuel a toutes les missions',
  'Prendre des photos avant et apres chaque lavage',
  'Maintenir une bonne note client',
  'Etre equipe du materiel obligatoire',
  "Renouveler l'abonnement chaque semaine",
  'Respecter les clients en toutes circonstances',
  'Signaler tout incident via Washapp',
  'Confirmer la reception des paiements',
];

export default function DevenirWasherPage() {
  return (
    <div className="min-h-screen bg-[#f9fafb]">

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#040c24] text-white py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-8">
            <span className="text-blue-400 text-sm font-semibold">Devenez Washer independant</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-6 leading-tight">
            Gagnez votre vie en<br />
            <span className="text-blue-400">lavant des vehicules</span>
          </h1>
          <p className="text-lg text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto">
            Rejoignez le reseau Washapp et recevez des missions de lavage pres de chez vous.
            Travaillez a votre rythme, sans commission.
          </p>
          <a
            href="/postuler"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-2xl transition-colors text-lg"
          >
            Postuler maintenant
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
              <h3 className="text-base font-bold text-gray-900 mb-2">Zero commission</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Chaque centime que vous gagnez vous appartient. Washapp se retribue uniquement via l&apos;abonnement hebdomadaire.</p>
            </div>
            <div className="p-6 rounded-2xl bg-blue-50">
              <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Missions en temps reel</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Recevez les missions directement sur votre telephone. Acceptez, gerez et suivez tout depuis Washapp.</p>
            </div>
            <div className="p-6 rounded-2xl bg-violet-50">
              <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center mb-4">
                <Shield className="w-5 h-5 text-violet-600" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Accompagnement complet</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Formation, materiel, support et suivi qualite. Washapp vous donne tous les outils pour reussir.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ETAPES */}
      <section id="etapes" className="py-20 px-6 bg-[#f9fafb]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-center text-gray-900 mb-4">Comment devenir Washer ?</h2>
          <p className="text-center text-gray-500 mb-14">5 etapes pour rejoindre le reseau Washapp</p>
          <div className="flex flex-col gap-6">
            {steps.map((step) => (
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
          <h2 className="text-3xl font-black text-center text-gray-900 mb-4">Ce que vous pouvez gagner</h2>
          <p className="text-center text-gray-500 mb-14">Exemples de revenus journaliers (hors abonnement)</p>
          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#040c24] text-white">
                  <th className="py-4 px-5 text-left font-semibold">Prestation</th>
                  <th className="py-4 px-5 text-right font-semibold">Prix</th>
                  <th className="py-4 px-5 text-right font-semibold">Volume / jour</th>
                  <th className="py-4 px-5 text-right font-semibold">Revenu / jour</th>
                </tr>
              </thead>
              <tbody>
                {earnings.map((row, i) => (
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
          <h2 className="text-3xl font-black text-center mb-4">Ce que nous attendons</h2>
          <p className="text-center text-slate-400 mb-14">Les criteres pour rester dans le reseau Washapp</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {expectations.map((exp) => (
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
          <h2 className="text-3xl font-black text-gray-900 mb-4">Pret a rejoindre Washapp ?</h2>
          <p className="text-gray-500 mb-10">Postulez maintenant et notre equipe vous contactera sous 48h.</p>
          <a
            href="/postuler"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-4 rounded-2xl transition-colors text-lg"
          >
            Deposer ma candidature
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}