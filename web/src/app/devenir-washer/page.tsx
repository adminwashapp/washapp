import Link from 'next/link';
import Footer from '@/components/layout/Footer';
import { Check, Wallet, Shield, Clock, Star, ArrowRight, Smartphone, Zap } from 'lucide-react';

const steps = [
  { num: '01', title: 'Formation obligatoire', desc: 'Une journee de formation complete pour maitriser les techniques de lavage professionnel, les produits et les attentes qualite Washapp.', icon: '🎓' },
  { num: '02', title: 'Test de validation', desc: 'Un test pratique evalue par notre equipe. Il atteste que vous etes pret a servir nos clients avec le niveau de qualite requis.', icon: '✅' },
  { num: '03', title: 'Acquisition du materiel', desc: 'Avant activation, vous devez posseder le materiel obligatoire : kit de nettoyage professionnel, produits agrees Washapp.', icon: '🧴' },
  { num: '04', title: 'Abonnement Washapp', desc: '35 000 FCFA par semaine. Sans commission sur vos missions — tout ce que vous gagnez est a vous.', icon: '💳' },
  { num: '05', title: 'Activation et premiere mission', desc: "Votre profil est valide par l'equipe Washapp. Vous passez en ligne sur la carte et les missions arrivent directement sur votre telephone.", icon: '🚀' },
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
      <section
        className="relative overflow-hidden"
        style={{
          backgroundImage: 'url("/Pagewasher.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay sombre pour lisibilite du texte */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(4,12,36,0.88) 0%, rgba(12,30,85,0.80) 55%, rgba(21,88,245,0.65) 100%)' }} />

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-24 md:py-32">
          <div className="max-w-3xl">
            <span className="inline-block text-[11px] font-bold tracking-[0.2em] uppercase text-blue-400 mb-5">
              Rejoindre Washapp
            </span>
            <h1 className="text-[2.8rem] sm:text-[3.5rem] font-extrabold text-white leading-tight tracking-tight mb-6">
              Devenez Washer.<br />
              <span className="text-blue-400">Gagnez a votre rythme.</span>
            </h1>
            <p className="text-[1.1rem] text-white/70 leading-relaxed mb-10 max-w-xl">
              Rejoignez la plateforme Washapp et transformez votre savoir-faire en activite rentable.
              Zero commission. Vous gardez 100% de vos revenus.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-8">
              {[
                { value: '0%', label: 'Commission' },
                { value: '35K', label: 'FCFA / semaine' },
                { value: '100%', label: 'Revenus pour vous' },
              ].map(({ value, label }) => (
                <div key={label} className="flex flex-col">
                  <span className="text-[2.2rem] font-extrabold text-white leading-none">{value}</span>
                  <span className="text-[13px] text-blue-300 mt-1">{label}</span>
                </div>
              ))}
            </div>
          </div>

            {/* CTA POSTULER */}
            <div className="mt-10 flex flex-wrap gap-4">
              <a href="/postuler" className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold px-8 py-4 rounded-2xl transition-colors shadow-lg shadow-blue-900/30 text-[1rem]">
                Postuler maintenant &rarr;
              </a>
              <a href="#etapes" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-2xl transition-colors border border-white/20 text-[1rem]">
                Voir comment ca marche
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* AVANTAGES */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: Wallet, title: 'Zero commission', desc: "Chaque centime que vous gagnez vous appartient. Washapp se retribue uniquement via l'abonnement hebdomadaire.", color: '#059669', bg: '#ecfdf5' },
              { icon: Zap, title: 'Missions en temps reel', desc: 'Recevez les missions directement sur votre telephone. Acceptez, gerez et suivez tout depuis Washapp.', color: '#1558f5', bg: '#eff6ff' },
              { icon: Shield, title: 'Accompagnement complet', desc: 'Formation, materiel, support et suivi qualite. Washapp vous donne tous les outils pour reussir.', color: '#7c3aed', bg: '#f5f3ff' },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="p-6 rounded-2xl" style={{ backgroundColor: bg }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${color}18` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <h3 className="text-[1rem] font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-[0.875rem] text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ETAPES */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <span className="inline-block text-[11px] font-bold tracking-[0.18em] text-[#1558f5] uppercase mb-3">Processus</span>
          <h2 className="text-[1.9rem] font-extrabold text-gray-900 mb-3">Les etapes pour rejoindre Washapp</h2>
          <p className="text-gray-400 text-[0.95rem] max-w-md mx-auto">Un parcours clair, structure et accompagne du debut a la fin.</p>
        </div>
        <div className="relative">
          <div className="absolute left-[27px] top-6 bottom-6 w-[2px] bg-gray-100 hidden sm:block" />
          <div className="flex flex-col gap-8">
            {steps.map((step) => (
              <div key={step.num} className="flex gap-6 items-start relative">
                <div className="w-14 h-14 rounded-2xl bg-[#1558f5] flex items-center justify-center flex-shrink-0 shadow-[0_4px_16px_rgba(21,88,245,0.25)] relative z-10">
                  <span className="text-white font-extrabold text-[15px]">{step.num}</span>
                </div>
                <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">{step.icon}</span>
                    <h3 className="text-[1.05rem] font-bold text-gray-900">{step.title}</h3>
                  </div>
                  <p className="text-[0.875rem] text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVENUS */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <span className="inline-block text-[11px] font-bold tracking-[0.18em] text-[#1558f5] uppercase mb-3">Revenus</span>
            <h2 className="text-[1.9rem] font-extrabold text-gray-900 mb-3">Vos revenus potentiels</h2>
            <p className="text-gray-400 text-[0.95rem]">Estimations basees sur une journee active a Abidjan.</p>
          </div>
          <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.05)]">
            <table className="w-full text-[0.875rem]">
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #040c24 0%, #1558f5 100%)' }}>
                  <th className="text-left px-6 py-4 font-bold text-white/80 text-[12px] uppercase tracking-wide">Prestation</th>
                  <th className="text-left px-6 py-4 font-bold text-white/80 text-[12px] uppercase tracking-wide">Prix unitaire</th>
                  <th className="text-left px-6 py-4 font-bold text-white/80 text-[12px] uppercase tracking-wide">Volume / jour</th>
                  <th className="text-left px-6 py-4 font-bold text-white text-[12px] uppercase tracking-wide">Revenu / jour</th>
                </tr>
              </thead>
              <tbody>
                {earnings.map((row, i) => (
                  <tr key={row.service} className={`border-t border-gray-50 ${i === earnings.length - 1 ? 'rounded-b-3xl' : ''}`}>
                    <td className="px-6 py-4 font-semibold text-gray-900">{row.service}</td>
                    <td className="px-6 py-4 text-gray-500">{row.price}</td>
                    <td className="px-6 py-4 text-gray-500">{row.missions}</td>
                    <td className="px-6 py-4 font-extrabold text-[#1558f5] text-[1rem]">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[12px] text-gray-400 text-center mt-4">
            Estimations indicatives. Vos revenus reels dependent de votre activite, de votre zone et de votre note.
          </p>
        </div>
      </section>

      {/* OBLIGATIONS */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <span className="inline-block text-[11px] font-bold tracking-[0.18em] text-[#1558f5] uppercase mb-3">Exigences</span>
          <h2 className="text-[1.9rem] font-extrabold text-gray-900 mb-3">Ce que Washapp attend de vous</h2>
          <p className="text-gray-400 text-[0.95rem]">La qualite et la confiance sont au coeur de notre service.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {expectations.map((item) => (
            <div key={item} className="flex items-center gap-3.5 bg-white rounded-2xl border border-gray-100 px-5 py-4 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
              <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <p className="text-[0.875rem] font-medium text-gray-700">{item}</p>
            </div>
          ))}
        </div>
      </section>

      {/* APP DOWNLOAD */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="rounded-3xl overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, #040c24 0%, #0f2260 50%, #1558f5 100%)' }}>
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #60a5fa 0%, transparent 70%)' }} />
          <div className="px-8 sm:px-14 py-14 text-center relative z-10">
            <span className="inline-block text-[11px] font-extrabold tracking-[0.2em] uppercase text-blue-400 mb-4">Application mobile</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
              Telechargez l&apos;app Washapp
            </h2>
            <p className="text-white/60 text-[16px] mb-9 max-w-md mx-auto leading-relaxed">
              Missions en temps reel, wallet, revenus, historique — tout depuis votre telephone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href="#" className="hover:opacity-90 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" width="160" height="54" viewBox="0 0 160 54">
                  <rect width="160" height="54" rx="9" fill="white"/>
                  <text x="47" y="19" fontFamily="-apple-system, BlinkMacSystemFont, Arial, sans-serif" fontSize="10" fill="#1a1a1a" letterSpacing="0.3">Download on the</text>
                  <text x="40" y="40" fontFamily="-apple-system, BlinkMacSystemFont, Arial, sans-serif" fontSize="21" fontWeight="700" fill="#1a1a1a">App Store</text>
                  <path d="M27 10.5c-1.7 2-1.6 5 .2 6.9-1 .1-2.5-.5-3.5-1.6-1.3-1.5-1.3-4 0-5.4.9-1 2.2-1.6 3.3-1.5zm.4-3.5c1.5 0 2.8.7 3.6 1.9-1.5.8-2.4 2.4-2.4 4.1 0 1.8 1 3.4 2.6 4.2-.5 1.3-1.1 2.3-2 3.1-.8.8-1.5 1.2-2.4 1.2-.8 0-1.4-.3-2-.6-.6-.3-1.2-.6-2-.6-.8 0-1.4.3-2 .6-.6.3-1.2.6-2 .6-1.9 0-3.8-2.1-4.6-4.3-.5-1.3-.8-2.7-.8-4 0-3.8 2.4-5.8 4.8-5.8.9 0 1.7.3 2.4.6.6.3 1.1.5 1.6.5.5 0 1-.2 1.6-.5.7-.3 1.5-.6 2.6-.5zm-.2-4c.1 1-.3 2-1 2.8-.7.8-1.7 1.3-2.7 1.2-.1-1 .3-2 1-2.7.7-.8 1.8-1.3 2.7-1.3z" fill="#1a1a1a"/>
                </svg>
              </a>
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
      </section>

      <Footer />
    </div>
  );
}