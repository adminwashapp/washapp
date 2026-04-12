'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clientApi } from '@/lib/api';
import { useAuthStore } from '@/store';
import { Car, Package, CheckCircle, Clock, ChevronRight } from 'lucide-react';

const PLANS = [
  { type: 'EXTERIOR', name: 'Abonnement Extérieur', qty: 12, price: 16500, desc: '12 lavages extérieurs' },
  { type: 'INTERIOR', name: 'Abonnement Intérieur', qty: 12, price: 27500, desc: '12 lavages intérieurs' },
  { type: 'FULL', name: 'Abonnement Complet', qty: 12, price: 44000, desc: '12 lavages complets', highlight: true },
];

const SERVICE_LABEL: Record<string, string> = {
  EXTERIOR: 'Extérieur',
  INTERIOR: 'Intérieur',
  FULL: 'Complet',
};

export default function SubscriptionsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    clientApi.getSubscriptions()
      .then((r) => setSubscriptions(r.data))
      .catch(() => setSubscriptions([]))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  const activeSub = subscriptions.find((s) => s.status === 'ACTIVE');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Car className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-gray-900">Washapp</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/account" className="text-gray-500 hover:text-gray-900">Mon compte</Link>
          <Link href="/account/history" className="text-gray-500 hover:text-gray-900">Historique</Link>
          <span className="font-semibold text-gray-900 border-b-2 border-blue-600 pb-1">Abonnements</span>
        </nav>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mes abonnements</h1>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Chargement...</div>
        ) : activeSub ? (
          <div className="bg-blue-600 rounded-2xl p-6 text-white mb-8">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-300" />
              <span className="font-bold text-lg">Abonnement actif</span>
            </div>
            <p className="text-2xl font-extrabold mb-1">{SERVICE_LABEL[activeSub.serviceType] || activeSub.serviceType}</p>
            <div className="flex items-center gap-6 mt-4">
              <div>
                <p className="text-3xl font-extrabold">{activeSub.remaining ?? '—'}</p>
                <p className="text-blue-200 text-sm">lavages restants</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold">{activeSub.total ?? 12}</p>
                <p className="text-blue-200 text-sm">lavages total</p>
              </div>
            </div>
            {activeSub.expiresAt && (
              <div className="flex items-center gap-2 mt-4 text-blue-200 text-sm">
                <Clock className="w-4 h-4" />
                Expire le {new Date(activeSub.expiresAt).toLocaleDateString('fr-FR')}
              </div>
            )}
            <Link
              href="/booking"
              className="mt-6 inline-block bg-white text-blue-600 font-bold py-3 px-6 rounded-xl hover:bg-blue-50 text-sm"
            >
              Utiliser un lavage →
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center mb-8">
            <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="font-semibold text-gray-700 mb-2">Aucun abonnement actif</p>
            <p className="text-gray-400 text-sm">Souscrivez à un abonnement pour bénéficier de tarifs réduits.</p>
          </div>
        )}

        <h2 className="text-xl font-bold text-gray-900 mb-4">Nos abonnements</h2>
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {PLANS.map((plan) => (
            <div
              key={plan.type}
              className={`rounded-2xl p-5 border-2 ${
                plan.highlight ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-100 bg-white'
              }`}
            >
              {plan.highlight && (
                <span className="text-xs font-bold bg-white text-blue-600 px-2 py-1 rounded-full mb-3 inline-block">
                  POPULAIRE
                </span>
              )}
              <h3 className={`font-bold mb-1 ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
              <p className={`text-sm mb-3 ${plan.highlight ? 'text-blue-200' : 'text-gray-500'}`}>{plan.desc}</p>
              <p className={`text-3xl font-extrabold mb-4 ${plan.highlight ? 'text-white' : 'text-blue-600'}`}>
                {plan.price.toLocaleString()}
                <span className={`text-sm font-normal ml-1 ${plan.highlight ? 'text-blue-200' : 'text-gray-400'}`}>FCFA</span>
              </p>
              <Link
                href="/booking"
                className={`block text-center py-2.5 rounded-xl text-sm font-semibold ${
                  plan.highlight ? 'bg-white text-blue-600 hover:bg-blue-50' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Souscrire
              </Link>
            </div>
          ))}
        </div>

        {subscriptions.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Historique</h2>
            <div className="space-y-3">
              {subscriptions.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{SERVICE_LABEL[s.serviceType] || s.serviceType}</p>
                    <p className="text-xs text-gray-500">{new Date(s.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      s.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      s.status === 'EXPIRED' ? 'bg-gray-100 text-gray-500' :
                      'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {s.status === 'ACTIVE' ? 'Actif' : s.status === 'EXPIRED' ? 'Expiré' : s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
