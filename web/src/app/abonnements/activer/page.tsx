'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import { clientsApi } from '@/lib/api';
import Link from 'next/link';
import { useAuthStore } from '@/store';

const PLANS: Record<string, { label: string; price: number; color: string; features: string[] }> = {
  EXTERIOR: { label: 'Abonnement Exterieur', price: 16500, color: '#1558f5', features: ['Lavage exterieur complet', '11 lavages payants + 1 offert', 'Economie de 1 500 FCFA'] },
  INTERIOR: { label: 'Abonnement Interieur', price: 27500, color: '#1558f5', features: ['Lavage interieur complet', '11 lavages payants + 1 offert', 'Economie de 2 500 FCFA'] },
  FULL: { label: 'Abonnement Complet', price: 44000, color: '#111827', features: ['Lavage complet (int. + ext.)', '11 lavages payants + 1 offert', 'Economie de 4 000 FCFA'] },
};

function ActivateContent() {
  const params = useSearchParams();
  const router = useRouter();
  const plan = params.get('plan') ?? 'EXTERIOR';
  const info = PLANS[plan] ?? PLANS.EXTERIOR;

  const [checking, setChecking] = useState(true);
  const [alreadyActive, setAlreadyActive] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuthStore();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      const redirect = encodeURIComponent('/abonnements/activer?plan=' + plan);
      router.replace('/login?redirect=' + redirect);
    }
  }, [isAuthenticated, plan, router]);

  useEffect(() => {
    // Check if already subscribed
    Promise.all([
      clientsApi.getActiveSubscription().catch(() => ({ data: null })),
      clientsApi.getVehicles?.()?.catch(() => ({ data: [] })) ?? Promise.resolve({ data: [] }),
    ]).then(([subRes, vehRes]) => {
      if (subRes.data) {
        setAlreadyActive(true);
      }
      setVehicles(vehRes.data ?? []);
      if (vehRes.data?.length > 0) setSelectedVehicle(vehRes.data[0]);
      setChecking(false);
    });
  }, []);

  // Auto-redirect if already subscribed
  useEffect(() => {
    if (!checking && alreadyActive) {
      router.replace('/compte/abonnement?existing=1');
    }
  }, [checking, alreadyActive, router]);

  const handleActivate = async () => {
    setLoading(true);
    setError('');
    try {
      await clientsApi.activateSubscription(plan, selectedVehicle?.plateNumber, selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.model}` : undefined);
      router.push('/compte/abonnement?activated=1');
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      if (typeof msg === 'string' && msg.toLowerCase().includes('deja')) {
        router.replace('/compte/abonnement?existing=1');
      } else {
        setError(typeof msg === 'string' ? msg : "Impossible d'activer l'abonnement.");
      }
    } finally { setLoading(false); }
  };

  if (checking || alreadyActive) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <Link href="/tarifs" className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <h1 className="text-lg font-black text-gray-900">Activer mon abonnement</h1>
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full px-6 py-10 flex flex-col gap-6">

        {/* Plan card */}
        <div className="rounded-3xl p-8" style={{ backgroundColor: info.color, color: '#fff' }}>
          <p className="text-xs font-bold opacity-70 uppercase tracking-widest mb-2">Formule choisie</p>
          <h2 className="text-2xl font-black">{info.label}</h2>
          <p className="text-5xl font-black mt-4">{info.price.toLocaleString()} <span className="text-lg font-bold opacity-75">FCFA</span></p>
          <div className="mt-5 space-y-2">{info.features.map(f => <div key={f} className="flex items-center gap-2"><span className="text-green-300 font-black">✓</span><span className="text-sm font-semibold opacity-90">{f}</span></div>)}</div>
        </div>

        {/* Regle 11+1 */}
        <div className="bg-white rounded-2xl p-5 border border-blue-100 shadow-sm">
          <p className="text-xs font-black text-[#1558f5] uppercase tracking-widest mb-3">Regle de l abonnement</p>
          <div className="flex items-center gap-4">
            <div className="text-center"><div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center"><span className="text-2xl font-black text-[#1558f5]">11</span></div><p className="text-xs text-gray-500 mt-1 font-semibold">Payants</p></div>
            <div className="text-2xl font-black text-gray-300">+</div>
            <div className="text-center"><div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center"><span className="text-2xl font-black text-[#059669]">1</span></div><p className="text-xs text-gray-500 mt-1 font-semibold">Offert</p></div>
            <div className="flex-1 bg-gray-50 rounded-xl p-3 ml-2"><p className="text-sm font-bold text-gray-700">Compteur depart <span className="text-[#1558f5] font-black">0 / 11</span></p><p className="text-xs text-gray-400 mt-0.5">Suivi dans Mon compte</p></div>
          </div>
        </div>

        {/* Vehicule */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Vehicule associe</p>
          {vehicles.length > 0 ? (
            <div className="space-y-2">
              {vehicles.map(v => (
                <button key={v.id} type="button" onClick={() => setSelectedVehicle(v)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition ${selectedVehicle?.id === v.id ? 'border-[#1558f5] bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}>
                  <span className="text-2xl">🚗</span>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{v.brand} {v.model}</p>
                    <p className="text-xs text-gray-500 font-semibold tracking-wider">{v.plateNumber}</p>
                  </div>
                  {selectedVehicle?.id === v.id && <span className="ml-auto text-[#1558f5] font-black">✓</span>}
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-amber-800">Aucun vehicule enregistre. Vous pouvez en ajouter un dans <strong>Mon compte → Mes vehicules</strong>.</p>
            </div>
          )}
          {selectedVehicle && (
            <div className="mt-3 bg-blue-50 rounded-xl p-3 flex items-center gap-3">
              <span className="text-sm font-black text-[#1558f5]">Abonnement lie a :</span>
              <span className="text-sm font-bold text-gray-700">{selectedVehicle.brand} {selectedVehicle.model}</span>
              <span className="ml-auto text-xs font-black text-gray-500 bg-white rounded-lg px-2 py-1">{selectedVehicle.plateNumber}</span>
            </div>
          )}
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 font-semibold">{error}</div>}

        <button onClick={handleActivate} disabled={loading}
          className="w-full py-4 rounded-2xl text-white font-black text-base transition shadow-lg hover:shadow-xl disabled:opacity-60"
          style={{ backgroundColor: info.color }}>
          {loading ? 'Activation...' : 'Activer cet abonnement'}
        </button>
        <Link href="/tarifs" className="block text-center text-sm font-semibold text-gray-400 hover:text-gray-600 transition py-2">Retour aux formules</Link>
      </div>
    </div>
  );
}

export default function ActivateSubscriptionPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full" /></div>}>
      <ActivateContent />
    </Suspense>
  );
}