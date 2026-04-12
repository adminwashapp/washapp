'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { RefreshCw } from 'lucide-react';

const SUB_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-900 text-yellow-400',
  ACTIVE: 'bg-green-900 text-green-400',
  EXPIRED: 'bg-gray-800 text-gray-500',
  CANCELLED: 'bg-red-900 text-red-400',
};

const SUB_STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente', ACTIVE: 'Actif', EXPIRED: 'Expiré', CANCELLED: 'Annulé',
};

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ACTIVE');

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getSubscriptions();
      setSubscriptions(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = filter
    ? subscriptions.filter((s) => s.status === filter)
    : subscriptions;

  const expiringThisWeek = subscriptions.filter((s) => {
    if (s.status !== 'ACTIVE') return false;
    const daysLeft = Math.ceil((new Date(s.endsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 3 && daysLeft >= 0;
  });

  const totalRevenue = subscriptions
    .filter((s) => s.status === 'ACTIVE')
    .reduce((acc, s) => acc + (s.amount || 35000), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Abonnements</h1>
          <p className="text-gray-500 text-sm mt-1">Abonnements washers — 35 000 FCFA/semaine</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white bg-gray-800 px-3 py-2 rounded-xl">
          <RefreshCw className="w-4 h-4" /> Actualiser
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p className="text-xs text-gray-500 mb-2">Actifs</p>
          <p className="text-3xl font-extrabold text-green-400">
            {subscriptions.filter((s) => s.status === 'ACTIVE').length}
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p className="text-xs text-gray-500 mb-2">Expirent dans 3 jours</p>
          <p className={`text-3xl font-extrabold ${expiringThisWeek.length > 0 ? 'text-orange-400' : 'text-gray-400'}`}>
            {expiringThisWeek.length}
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p className="text-xs text-gray-500 mb-2">Revenus abonnements actifs</p>
          <p className="text-2xl font-extrabold text-blue-400">{totalRevenue.toLocaleString()} FCFA</p>
        </div>
      </div>

      {expiringThisWeek.length > 0 && (
        <div className="bg-orange-900/20 border border-orange-800 rounded-2xl p-4">
          <p className="text-sm font-bold text-orange-400 mb-2">⚠️ Expirations imminentes (3 jours)</p>
          <div className="flex flex-wrap gap-2">
            {expiringThisWeek.map((s) => {
              const daysLeft = Math.ceil((new Date(s.endsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              return (
                <span key={s.id} className="text-xs bg-orange-900 text-orange-300 px-3 py-1 rounded-full font-semibold">
                  {s.washer?.user?.name} — J-{daysLeft}
                </span>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {[
          { value: 'ACTIVE', label: 'Actifs' },
          { value: 'PENDING', label: 'En attente' },
          { value: 'EXPIRED', label: 'Expirés' },
          { value: 'CANCELLED', label: 'Annulés' },
          { value: '', label: 'Tous' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              filter === f.value ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
          <p className="text-gray-500">Aucun abonnement</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800/50">
                <tr>
                  {['Washer', 'Montant', 'Statut', 'Début', 'Fin', 'Restant'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.map((s) => {
                  const daysLeft = Math.ceil((new Date(s.endsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  const expired = daysLeft < 0;
                  return (
                    <tr key={s.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-white">{s.washer?.user?.name || '—'}</p>
                        <p className="text-xs text-gray-500">{s.washer?.user?.phone}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-bold text-white">{(s.amount || 35000).toLocaleString()} FCFA</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${SUB_STATUS_COLORS[s.status] || 'bg-gray-800 text-gray-400'}`}>
                          {SUB_STATUS_LABELS[s.status] || s.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-xs text-gray-400">
                          {new Date(s.startsAt).toLocaleDateString('fr-FR')}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-xs text-gray-400">
                          {new Date(s.endsAt).toLocaleDateString('fr-FR')}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        {s.status === 'ACTIVE' && (
                          <span className={`text-xs font-bold ${
                            expired ? 'text-red-400' :
                            daysLeft <= 2 ? 'text-orange-400' :
                            'text-green-400'
                          }`}>
                            {expired ? 'Expiré' : `J-${daysLeft}`}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
