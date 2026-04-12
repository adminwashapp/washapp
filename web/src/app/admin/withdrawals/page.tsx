'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { RefreshCw, CheckCircle, XCircle, CreditCard } from 'lucide-react';

const STATUS_FILTERS = [
  { value: '', label: 'Tous' },
  { value: 'PENDING', label: 'En attente' },
  { value: 'APPROVED', label: 'Approuvés' },
  { value: 'PAID', label: 'Payés' },
  { value: 'REJECTED', label: 'Rejetés' },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-900 text-yellow-400',
  APPROVED: 'bg-blue-900 text-blue-400',
  PAID: 'bg-green-900 text-green-400',
  FAILED: 'bg-red-900 text-red-400',
  REJECTED: 'bg-gray-800 text-gray-500',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente', APPROVED: 'Approuvé', PAID: 'Payé', FAILED: 'Échoué', REJECTED: 'Rejeté',
};

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [status, setStatus] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getWithdrawals(status || undefined);
      setWithdrawals(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [status]);

  const handleAction = async (id: string, action: 'APPROVED' | 'PAID' | 'REJECTED') => {
    setActionLoading(`${id}-${action}`);
    try {
      await adminApi.processWithdrawal(id, action);
      await load();
    } finally {
      setActionLoading(null);
    }
  };

  const totalPending = withdrawals
    .filter((w) => w.status === 'PENDING' || w.status === 'APPROVED')
    .reduce((acc, w) => acc + w.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Retraits</h1>
          <p className="text-gray-500 text-sm mt-1">Demandes de retrait Orange Money des washers</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white bg-gray-800 px-3 py-2 rounded-xl">
          <RefreshCw className="w-4 h-4" /> Actualiser
        </button>
      </div>

      {status === 'PENDING' && totalPending > 0 && (
        <div className="bg-yellow-900/30 border border-yellow-800 rounded-2xl p-5 flex items-center gap-4">
          <CreditCard className="w-8 h-8 text-yellow-400 flex-shrink-0" />
          <div>
            <p className="font-bold text-yellow-300">Total à traiter</p>
            <p className="text-2xl font-extrabold text-yellow-400">{totalPending.toLocaleString()} FCFA</p>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatus(f.value)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              status === f.value ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
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
      ) : withdrawals.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
          <p className="text-gray-500">Aucune demande de retrait</p>
        </div>
      ) : (
        <div className="space-y-3">
          {withdrawals.map((w) => (
            <div key={w.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <p className="font-bold text-white text-lg">{w.amount?.toLocaleString()} FCFA</p>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[w.status] || 'bg-gray-800 text-gray-400'}`}>
                      {STATUS_LABELS[w.status] || w.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Washer</p>
                      <p className="font-medium text-white">{w.washer?.user?.name || '—'}</p>
                      <p className="text-xs text-gray-500">{w.washer?.user?.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Numéro Orange Money</p>
                      <p className="font-mono font-bold text-orange-400">{w.orangeMoneyNumber}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-3">
                    Demande le {new Date(w.createdAt).toLocaleDateString('fr-FR')} à {new Date(w.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {w.processedAt && (
                    <p className="text-xs text-gray-600">
                      Traitée le {new Date(w.processedAt).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>

                {(w.status === 'PENDING' || w.status === 'APPROVED') && (
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {w.status === 'PENDING' && (
                      <button
                        onClick={() => handleAction(w.id, 'APPROVED')}
                        disabled={!!actionLoading}
                        className="flex items-center gap-2 text-xs bg-blue-900 text-blue-400 hover:bg-blue-800 px-3 py-2 rounded-xl font-semibold disabled:opacity-50 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approuver
                      </button>
                    )}
                    {w.status === 'APPROVED' && (
                      <button
                        onClick={() => handleAction(w.id, 'PAID')}
                        disabled={!!actionLoading}
                        className="flex items-center gap-2 text-xs bg-green-900 text-green-400 hover:bg-green-800 px-3 py-2 rounded-xl font-semibold disabled:opacity-50 transition-colors"
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Marquer payé
                      </button>
                    )}
                    <button
                      onClick={() => handleAction(w.id, 'REJECTED')}
                      disabled={!!actionLoading}
                      className="flex items-center gap-2 text-xs bg-red-950 text-red-400 hover:bg-red-900 px-3 py-2 rounded-xl font-semibold disabled:opacity-50 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Rejeter
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
