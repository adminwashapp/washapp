'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { CheckCircle, XCircle, ChevronDown, Search, RefreshCw } from 'lucide-react';

const STATUS_FILTERS = [
  { value: '', label: 'Tous' },
  { value: 'PENDING', label: 'En attente' },
  { value: 'ACTIVE', label: 'Actifs' },
  { value: 'SUSPENDED', label: 'Suspendus' },
  { value: 'BANNED', label: 'Bannis' },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-900 text-yellow-400',
  ACTIVE: 'bg-green-900 text-green-400',
  SUSPENDED: 'bg-orange-900 text-orange-400',
  BANNED: 'bg-red-900 text-red-400',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente', ACTIVE: 'Actif', SUSPENDED: 'Suspendu', BANNED: 'Banni',
};

function ValidationDot({ ok }: { ok: boolean }) {
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${ok ? 'bg-green-400' : 'bg-gray-600'}`} />
  );
}

export default function AdminWashersPage() {
  const [washers, setWashers] = useState<any[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getWashers(status || undefined, page);
      setWashers(res.data?.washers || res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [status, page]);

  const action = async (fn: () => Promise<any>, washerId: string, key: string) => {
    setActionLoading(`${washerId}-${key}`);
    try {
      await fn();
      await load();
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = search
    ? washers.filter((w) =>
        w.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        w.user?.phone?.includes(search)
      )
    : washers;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Washers</h1>
          <p className="text-gray-500 text-sm mt-1">Gestion et validation des washers</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white bg-gray-800 px-3 py-2 rounded-xl">
          <RefreshCw className="w-4 h-4" /> Actualiser
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un washer..."
            className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => { setStatus(f.value); setPage(1); }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                status === f.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
          <p className="text-gray-500">Aucun washer trouvé</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800/50">
                <tr>
                  {['Washer', 'Statut', 'Note', 'Validation', 'Abonnement', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.map((w) => (
                  <tr key={w.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-white">{w.user?.name}</p>
                      <p className="text-xs text-gray-500">{w.user?.phone}</p>
                      <p className="text-xs text-gray-600 capitalize">{w.transportType?.toLowerCase()}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[w.accountStatus] || 'bg-gray-800 text-gray-400'}`}>
                        {STATUS_LABELS[w.accountStatus] || w.accountStatus}
                      </span>
                      {w.isOnline && (
                        <span className="ml-1 text-xs bg-emerald-900 text-emerald-400 font-bold px-2 py-0.5 rounded-full">
                          En ligne
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-bold text-white">{w.averageRating?.toFixed(1) || '—'}</p>
                      <p className="text-xs text-gray-500">{w.ratingsCount} notes · {w.complaintsCount} plaintes</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        {[
                          { label: 'Formation', key: 'trainingValidated', fn: () => adminApi.validateTraining(w.id) },
                          { label: 'Test', key: 'testValidated', fn: () => adminApi.validateTest(w.id) },
                          { label: 'Équipement', key: 'equipmentValidated', fn: () => adminApi.validateEquipment(w.id) },
                        ].map(({ label, key, fn }) => (
                          <button
                            key={key}
                            onClick={() => !w[key] && action(fn, w.id, key)}
                            disabled={w[key] || actionLoading === `${w.id}-${key}`}
                            className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg transition-colors ${
                              w[key]
                                ? 'text-green-400 bg-green-900/30 cursor-default'
                                : 'text-gray-400 bg-gray-800 hover:text-white hover:bg-gray-700'
                            }`}
                          >
                            <ValidationDot ok={w[key]} />
                            {label}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        w.subscriptionStatus === 'ACTIVE'
                          ? 'bg-green-900 text-green-400'
                          : 'bg-red-900 text-red-400'
                      }`}>
                        {w.subscriptionStatus === 'ACTIVE' ? 'Actif' : w.subscriptionStatus || 'Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        {w.accountStatus !== 'ACTIVE' && w.accountStatus !== 'BANNED' && (
                          <button
                            onClick={() => action(() => adminApi.activateWasher(w.id), w.id, 'activate')}
                            disabled={!!actionLoading}
                            className="flex items-center gap-1 text-xs bg-green-900 text-green-400 hover:bg-green-800 px-3 py-1.5 rounded-lg font-semibold transition-colors disabled:opacity-50"
                          >
                            <CheckCircle className="w-3 h-3" /> Activer
                          </button>
                        )}
                        {w.accountStatus === 'ACTIVE' && (
                          <button
                            onClick={() => action(() => adminApi.suspendWasher(w.id), w.id, 'suspend')}
                            disabled={!!actionLoading}
                            className="flex items-center gap-1 text-xs bg-orange-900 text-orange-400 hover:bg-orange-800 px-3 py-1.5 rounded-lg font-semibold transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-3 h-3" /> Suspendre
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
