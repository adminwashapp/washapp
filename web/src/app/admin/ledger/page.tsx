'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { RefreshCw, Search } from 'lucide-react';

const TYPE_COLORS: Record<string, string> = {
  PAYMENT_RECEIVED: 'bg-blue-900 text-blue-400',
  HOLD: 'bg-yellow-900 text-yellow-400',
  RELEASE_TO_WASHER: 'bg-green-900 text-green-400',
  WITHDRAWAL: 'bg-red-900 text-red-400',
  REFUND: 'bg-orange-900 text-orange-400',
  CASH_CONFIRMATION: 'bg-teal-900 text-teal-400',
  ADJUSTMENT: 'bg-gray-800 text-gray-400',
};

const TYPE_LABELS: Record<string, string> = {
  PAYMENT_RECEIVED: 'Paiement reçu',
  HOLD: 'Fonds bloqués',
  RELEASE_TO_WASHER: 'Libéré washer',
  WITHDRAWAL: 'Retrait',
  REFUND: 'Remboursement',
  CASH_CONFIRMATION: 'Cash confirmé',
  ADJUSTMENT: 'Ajustement',
};

export default function AdminLedgerPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getLedger(page);
      setEntries(res.data?.entries || res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page]);

  const total = entries.reduce((acc, e) => {
    return e.direction === 'CREDIT' ? acc + e.amount : acc - e.amount;
  }, 0);

  const filteredEntries = entries.filter(e => {
    const q = search.toLowerCase();
    return (
      e.type?.toLowerCase().includes(q) ||
      (TYPE_LABELS[e.type] || '').toLowerCase().includes(q) ||
      e.reference?.toLowerCase().includes(q) ||
      e.washer?.user?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Ledger</h1>
          <p className="text-gray-500 text-sm mt-1">Tous les mouvements financiers de la plateforme</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white bg-gray-800 px-3 py-2 rounded-xl">
          <RefreshCw className="w-4 h-4" /> Actualiser
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Entrées (crédits)', value: entries.filter((e) => e.direction === 'CREDIT').reduce((a, e) => a + e.amount, 0), color: 'text-green-400' },
          { label: 'Sorties (débits)', value: entries.filter((e) => e.direction === 'DEBIT').reduce((a, e) => a + e.amount, 0), color: 'text-red-400' },
          { label: 'Balance page', value: total, color: total >= 0 ? 'text-green-400' : 'text-red-400' },
        ].map((s) => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-xs text-gray-500 mb-2">{s.label}</p>
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.value.toLocaleString()} FCFA</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-4 pt-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Rechercher une entrée..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800/50">
                <tr>
                  {['Type', 'Direction', 'Montant', 'Washer', 'Mission', 'Statut', 'Référence', 'Date'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredEntries.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${TYPE_COLORS[e.type] || 'bg-gray-800 text-gray-400'}`}>
                        {TYPE_LABELS[e.type] || e.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold ${e.direction === 'CREDIT' ? 'text-green-400' : 'text-red-400'}`}>
                        {e.direction === 'CREDIT' ? '+ Crédit' : '- Débit'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className={`font-bold ${e.direction === 'CREDIT' ? 'text-green-400' : 'text-red-400'}`}>
                        {e.direction === 'CREDIT' ? '+' : '-'}{e.amount?.toLocaleString()} FCFA
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-300">{e.washer?.user?.name || '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs text-gray-500">
                        {e.missionId ? `#${e.missionId.slice(-8)}` : '—'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold ${
                        e.status === 'COMPLETED' ? 'text-green-400' :
                        e.status === 'PENDING' ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs text-gray-600 truncate max-w-24">{e.reference || '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(e.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-800 flex items-center justify-between">
            <p className="text-xs text-gray-500">{entries.length} entrées</p>
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
                disabled={entries.length < 50}
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
