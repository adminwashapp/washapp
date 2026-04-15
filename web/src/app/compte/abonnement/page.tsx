'use client';
import { useEffect, useState } from 'react';
import { clientsApi } from '@/lib/api';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const SERVICE_LABELS: Record<string, string> = {
  EXTERIOR: 'Abonnement Exterieur',
  INTERIOR: 'Abonnement Interieur',
  FULL: 'Abonnement Complet',
};

function AbonnementContent() {
  const params = useSearchParams();
  const justActivated = params.get('activated') === '1';
  const [sub, setSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientsApi.getActiveSubscription()
      .then(r => { setSub(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const count = sub?.completedPaidWashesCount ?? 0;
  const total = 11;
  const pct = Math.min(100, (count / total) * 100);
  const remaining = Math.max(0, total - count);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );

  if (!sub) return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center gap-6 px-6">
      <div className="text-6xl">📋</div>
      <h2 className="text-2xl font-black text-gray-900">Aucun abonnement actif</h2>
      <p className="text-gray-500 text-center max-w-sm">Souscrivez a un abonnement pour profiter de 11 lavages + 1 offert.</p>
      <Link href="/tarifs" className="px-8 py-4 bg-[#1558f5] text-white rounded-2xl font-black text-base hover:bg-blue-700 transition">
        Voir les formules
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <Link href="/account" className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-lg font-black text-gray-900">Mon abonnement</h1>
      </div>

      <div className="max-w-lg mx-auto px-6 py-8 space-y-6">

        {justActivated && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center gap-4">
            <span className="text-3xl">🎉</span>
            <div>
              <p className="font-black text-green-800">Abonnement active !</p>
              <p className="text-sm text-green-600">Votre parcours fidelite a commence.</p>
            </div>
          </div>
        )}

        {/* Carte principale */}
        <div className="bg-[#1558f5] rounded-3xl p-7 text-white shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold opacity-70 uppercase tracking-widest">Formule active</p>
              <h2 className="text-xl font-black mt-1">{SERVICE_LABELS[sub.serviceType] ?? sub.serviceType}</h2>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-xs font-black ${sub.status === 'ACTIVE' ? 'bg-green-400 text-white' : 'bg-gray-400 text-white'}`}>
              {sub.status === 'ACTIVE' ? 'Actif' : sub.status}
            </span>
          </div>

          {/* Barre de progression */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold opacity-80">Lavages valides</span>
              <span className="text-2xl font-black">{count} / {total}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
              <div
                className="h-4 rounded-full transition-all duration-1000"
                style={{ width: `${pct}%`, backgroundColor: pct >= 100 ? '#4ade80' : '#60a5fa' }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs opacity-60">0</span>
              <span className="text-xs opacity-60">11</span>
            </div>
          </div>
        </div>

        {/* Statut lavage offert */}
        {sub.freeWashAvailable ? (
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white shadow-lg">
            <p className="text-2xl font-black">🎁 Votre lavage offert est disponible !</p>
            <p className="text-sm opacity-85 mt-2">Reservez maintenant et votre prochain lavage {SERVICE_LABELS[sub.serviceType]?.toLowerCase()} est gratuit.</p>
            <Link href="/booking" className="mt-4 inline-block px-6 py-3 bg-white text-green-700 rounded-xl font-black text-sm hover:bg-green-50 transition">
              Reserver mon lavage offert →
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <p className="text-base font-black text-gray-900">
              {remaining === 0 ? '🎁 Votre lavage offert est pret !' : `Encore ${remaining} lavage${remaining > 1 ? 's' : ''} avant votre lavage offert`}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {remaining === 0 ? 'Reservez maintenant pour en profiter.' : `Completez ${remaining} lavage${remaining > 1 ? 's' : ''} valide${remaining > 1 ? 's' : ''} pour debloquer le lavage offert.`}
            </p>
            {/* Mini barre de progression */}
            <div className="mt-4 flex gap-1.5">
              {Array.from({ length: 11 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-2 rounded-full ${i < count ? 'bg-[#1558f5]' : 'bg-gray-100'}`}
                />
              ))}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ml-1 ${sub.freeWashAvailable ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                {sub.freeWashAvailable ? '✓' : '🎁'}
              </div>
            </div>
          </div>
        )}

        {/* Infos */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-3xl font-black text-[#1558f5]">{count}</p>
            <p className="text-xs text-gray-500 font-semibold mt-0.5">Lavages valides</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-3xl font-black text-[#059669]">{sub.freeWashAvailable ? '1' : '0'}</p>
            <p className="text-xs text-gray-500 font-semibold mt-0.5">Lavage offert</p>
          </div>
        </div>

        {/* Historique */}
        {sub.missions && sub.missions.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <p className="font-black text-gray-900 text-sm">Historique des lavages</p>
              <p className="text-xs text-gray-400">Lavages comptes dans votre abonnement</p>
            </div>
            <div className="divide-y divide-gray-50">
              {sub.missions.map((m: any, i: number) => (
                <div key={m.id} className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${i < total ? 'bg-blue-50 text-[#1558f5]' : 'bg-green-50 text-[#059669]'}`}>
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{m.address || 'Lavage valide'}</p>
                      <p className="text-xs text-gray-400">{m.validatedAt ? new Date(m.validatedAt).toLocaleDateString('fr-FR') : ''}</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-[#059669]">✓</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bouton reserver */}
        <Link href="/booking" className="block w-full py-4 bg-[#1558f5] text-white text-center rounded-2xl font-black text-base hover:bg-blue-700 transition shadow-lg">
          Reserver un lavage
        </Link>

        {/* Annuler */}
        <div className="text-center">
          <button
            onClick={async () => {
              if (!confirm('Annuler votre abonnement ?')) return;
              await clientsApi.cancelSubscription();
              window.location.href = '/tarifs';
            }}
            className="text-sm text-gray-400 hover:text-red-500 transition font-medium"
          >
            Annuler mon abonnement
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MonAbonnementPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full" /></div>}>
      <AbonnementContent />
    </Suspense>
  );
}