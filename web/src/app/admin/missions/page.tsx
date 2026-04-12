'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/api';
import { RefreshCw, ExternalLink } from 'lucide-react';

const STATUS_FILTERS = [
  { value: '', label: 'Toutes' },
  { value: 'SEARCHING', label: 'Recherche' },
  { value: 'ASSIGNED', label: 'Assignées' },
  { value: 'IN_PROGRESS', label: 'En cours' },
  { value: 'COMPLETED', label: 'À valider' },
  { value: 'VALIDATED', label: 'Validées' },
  { value: 'CANCELLED', label: 'Annulées' },
  { value: 'DISPUTED', label: 'Litiges' },
];

const STATUS_COLORS: Record<string, string> = {
  SEARCHING: 'bg-yellow-900 text-yellow-400',
  ASSIGNED: 'bg-blue-900 text-blue-400',
  EN_ROUTE: 'bg-cyan-900 text-cyan-400',
  ARRIVED: 'bg-indigo-900 text-indigo-400',
  IN_PROGRESS: 'bg-purple-900 text-purple-400',
  COMPLETED: 'bg-orange-900 text-orange-400',
  VALIDATED: 'bg-green-900 text-green-400',
  CANCELLED: 'bg-red-900 text-red-400',
  DISPUTED: 'bg-red-900 text-red-300',
};

const STATUS_LABELS: Record<string, string> = {
  SEARCHING: 'Recherche', ASSIGNED: 'Assigné', EN_ROUTE: 'En route',
  ARRIVED: 'Arrivé', IN_PROGRESS: 'En cours', COMPLETED: 'À valider',
  VALIDATED: 'Validé', CANCELLED: 'Annulé', DISPUTED: 'Litige',
};

const SERVICE_LABELS: Record<string, string> = {
  EXTERIOR: 'Extérieur', INTERIOR: 'Intérieur', FULL: 'Complet',
};

const TYPE_LABELS: Record<string, string> = {
  INSTANT: 'Instantané', BOOKING: 'Réservation',
};

export default function AdminMissionsPage() {
  const [missions, setMissions] = useState<any[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getMissions(status || undefined, page);
      setMissions(res.data?.missions || res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [status, page]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Missions</h1>
          <p className="text-gray-500 text-sm mt-1">Toutes les missions de la plateforme</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white bg-gray-800 px-3 py-2 rounded-xl">
          <RefreshCw className="w-4 h-4" /> Actualiser
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
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

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : missions.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
          <p className="text-gray-500">Aucune mission</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800/50">
                <tr>
                  {['Mission', 'Client', 'Washer', 'Service', 'Statut', 'Paiement', 'Prix', 'Date', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {missions.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs text-gray-500">#{m.id?.slice(-8)}</p>
                      <p className="text-xs text-gray-400">{TYPE_LABELS[m.missionType] || m.missionType}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-white">{m.client?.user?.name || '—'}</p>
                      <p className="text-xs text-gray-500">{m.client?.user?.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-white">{m.washer?.user?.name || '—'}</p>
                      <p className="text-xs text-gray-500">{m.washer?.user?.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold text-gray-300">
                        {SERVICE_LABELS[m.serviceType] || m.serviceType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_COLORS[m.status] || 'bg-gray-800 text-gray-400'}`}>
                        {STATUS_LABELS[m.status] || m.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold ${
                        m.paymentMethod === 'ORANGE_MONEY' ? 'text-orange-400' : 'text-gray-400'
                      }`}>
                        {m.paymentMethod === 'ORANGE_MONEY' ? 'OM' : 'Cash'}
                      </span>
                      <p className={`text-xs mt-0.5 ${
                        m.paymentStatus === 'HELD' ? 'text-yellow-400' :
                        m.paymentStatus === 'RELEASED' ? 'text-green-400' : 'text-gray-500'
                      }`}>
                        {m.paymentStatus}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-white">{m.price?.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">FCFA</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(m.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(m.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/mission/${m.id}`} target="_blank" className="text-gray-600 hover:text-blue-400">
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-800 flex items-center justify-between">
            <p className="text-xs text-gray-500">{missions.length} missions</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 bg-gray-800 text-gray-400 rounded-lg text-xs disabled:opacity-40 hover:text-white"
              >
                Précédent
              </button>
              <span className="px-3 py-1.5 text-xs text-gray-400">Page {page}</span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={missions.length < 20}
                className="px-3 py-1.5 bg-gray-800 text-gray-400 rounded-lg text-xs disabled:opacity-40 hover:text-white"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
