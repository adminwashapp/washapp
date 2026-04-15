'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';
import { clientsApi } from '@/lib/api';
import Link from 'next/link';

const PLANS: Record<string, { label: string; price: number; priceUnit: string; color: string; features: string[] }> = {
  EXTERIOR: {
    label: 'Abonnement Exterieur',
    price: 16500,
    priceUnit: '/ 11 lavages',
    color: '#1558f5',
    features: ['Lavage exterieur complet', '11 lavages payants + 1 offert', 'Washer a domicile', 'Economie de 1 500 FCFA'],
  },
  INTERIOR: {
    label: 'Abonnement Interieur',
    price: 27500,
    priceUnit: '/ 11 lavages',
    color: '#1558f5',
    features: ['Lavage interieur complet', '11 lavages payants + 1 offert', 'Washer a domicile', 'Economie de 2 500 FCFA'],
  },
  FULL: {
    label: 'Abonnement Complet',
    price: 44000,
    priceUnit: '/ 11 lavages',
    color: '#111827',
    features: ['Lavage complet (int. + ext.)', '11 lavages payants + 1 offert', 'Washer a domicile', 'Economie de 4 000 FCFA'],
  },
};

function ActivateContent() {
  const params = useSearchParams();
  const router = useRouter();
  const plan = params.get('plan') ?? 'EXTERIOR';
  const info = PLANS[plan] ?? PLANS.EXTERIOR;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleActivate = async () => {
    setLoading(true);
    setError('');
    try {
      await clientsApi.activateSubscription(plan);
      router.push('/compte/abonnement?activated=1');
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      setError(typeof msg === 'string' ? msg : 'Impossible d\'activer l\'abonnement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <Link href="/tarifs" className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-lg font-black text-gray-900">Activer mon abonnement</h1>
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full px-6 py-10 flex flex-col gap-6">

        {/* Indicateur etapes */}
        <div className="flex items-center gap-3">
          {['Formule', 'Confirmation', 'Actif'].map((s, i) => (
            <div key={s} className="flex items-center gap-3 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${i === 1 ? 'bg-[#1558f5] text-white' : i < 1 ? 'bg-[#059669] text-white' : 'bg-gray-200 text-gray-400'}`}>
                {i < 1 ? '✓' : i + 1}
              </div>
              <span className={`text-sm font-bold ${i === 1 ? 'text-[#1558f5]' : 'text-gray-400'}`}>{s}</span>
              {i < 2 && <div className={`flex-1 h-0.5 ${i < 1 ? 'bg-[#059669]' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Carte plan */}
        <div className="rounded-3xl p-8" style={{ backgroundColor: info.color, color: '#fff' }}>
          <p className="text-sm font-bold opacity-75 uppercase tracking-widest mb-2">Formule choisie</p>
          <h2 className="text-2xl font-black mb-1">{info.label}</h2>
          <p className="text-5xl font-black mt-4">{info.price.toLocaleString()} <span className="text-lg font-bold opacity-75">FCFA</span></p>
          <p className="text-sm opacity-70 mt-1">{info.priceUnit}</p>
          <div className="mt-6 space-y-2">
            {info.features.map(f => (
              <div key={f} className="flex items-center gap-2">
                <span className="text-green-300 font-black">✓</span>
                <span className="text-sm font-semibold opacity-90">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Regle 11 + 1 */}
        <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm">
          <p className="text-xs font-black text-[#1558f5] uppercase tracking-widest mb-3">Comment ca marche</p>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                <span className="text-2xl font-black text-[#1558f5]">11</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 font-semibold">Payants</p>
            </div>
            <div className="text-2xl font-black text-gray-300">+</div>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center">
                <span className="text-2xl font-black text-[#059669]">1</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 font-semibold">Offert</p>
            </div>
            <div className="flex-1 bg-gray-50 rounded-xl p-3 ml-2">
              <p className="text-sm font-bold text-gray-700">Apres 11 lavages, le 12eme est <span className="text-[#059669] font-black">offert</span></p>
            </div>
          </div>
        </div>

        {/* Compteur initial */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-black text-gray-700">Votre progression au depart</p>
            <span className="text-[#1558f5] font-black text-lg">0 / 11</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div className="bg-[#1558f5] h-3 rounded-full w-0" />
          </div>
          <p className="text-xs text-gray-400 mt-2 font-medium">Chaque lavage valide compte dans votre progression</p>
        </div>

        {/* Info */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <p className="text-sm text-[#1558f5] font-semibold">
            Votre progression sera visible dans <strong>Mon compte → Mon abonnement</strong>. Le lavage offert est debloque automatiquement apres 11 lavages valides.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 font-semibold">{error}</div>
        )}

        {/* CTA */}
        <button
          onClick={handleActivate}
          disabled={loading}
          className="w-full py-4 rounded-2xl text-white font-black text-base transition shadow-lg hover:shadow-xl disabled:opacity-60"
          style={{ backgroundColor: info.color }}
        >
          {loading ? 'Activation...' : 'Activer cet abonnement'}
        </button>

        <Link href="/tarifs" className="block text-center text-sm font-semibold text-gray-400 hover:text-gray-600 transition py-2">
          Retour aux formules
        </Link>
      </div>
    </div>
  );
}

export default function ActivateSubscriptionPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>}>
      <ActivateContent />
    </Suspense>
  );
}