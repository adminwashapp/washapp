'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { RefreshCw, CheckCircle, Search } from 'lucide-react';

const STATUS_FILTERS = [
  { value: '', label: 'Tous' },
  { value: 'OPEN', label: 'Ouverts' },
  { value: 'REVIEWING', label: 'En examen' },
  { value: 'RESOLVED', label: 'Résolus' },
  { value: 'REJECTED', label: 'Rejetés' },
];

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-red-900 text-red-400',
  REVIEWING: 'bg-yellow-900 text-yellow-400',
  RESOLVED: 'bg-green-900 text-green-400',
  REJECTED: 'bg-gray-800 text-gray-500',
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Ouvert', REVIEWING: 'En examen', RESOLVED: 'Résolu', REJECTED: 'Rejeté',
};

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [status, setStatus] = useState('OPEN');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const [note, setNote] = useState('');
  const [resolveLoading, setResolveLoading] = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getComplaints(status || undefined);
      setComplaints(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [status]);

  const handleResolve = async () => {
    if (!selected || !note.trim()) return;
    setResolveLoading(true);
    try {
      await adminApi.resolveComplaint(selected.id, note);
      setSelected(null);
      setNote('');
      await load();
    } finally {
      setResolveLoading(false);
    }
  };

  const filteredComplaints = complaints.filter(c => {
    const q = search.toLowerCase();
    return (
      c.reason?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      c.status?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Litiges</h1>
          <p className="text-gray-500 text-sm mt-1">Gestion des plaintes et résolution des conflits</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white bg-gray-800 px-3 py-2 rounded-xl">
          <RefreshCw className="w-4 h-4" /> Actualiser
        </button>
      </div>

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

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : complaints.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
              <p className="text-gray-500">Aucun litige</p>
            </div>
          ) : (
            <>
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Rechercher une plainte..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              {filteredComplaints.map((c) => (
              <button
                key={c.id}
                onClick={() => { setSelected(c); setNote(''); }}
                className={`w-full text-left bg-gray-900 border rounded-2xl p-5 hover:border-blue-500 transition-colors ${
                  selected?.id === c.id ? 'border-blue-500' : 'border-gray-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <p className="font-semibold text-white">{c.reason}</p>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${STATUS_COLORS[c.status] || 'bg-gray-800 text-gray-400'}`}>
                    {STATUS_LABELS[c.status] || c.status}
                  </span>
                </div>
                {c.description && (
                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">{c.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span>Client : {c.client?.user?.name || '—'}</span>
                  <span>Washer : {c.washer?.user?.name || '—'}</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {new Date(c.createdAt).toLocaleDateString('fr-FR')} — Mission #{c.missionId?.slice(-8)}
                </p>
                {c.resolutionNote && (
                  <div className="mt-3 bg-green-900/20 border border-green-900 rounded-xl p-3">
                    <p className="text-xs text-green-400 font-semibold mb-1">Résolution :</p>
                    <p className="text-xs text-green-300">{c.resolutionNote}</p>
                  </div>
                )}
              </button>
            ))}
            </>
          )}
        </div>

        <div className="sticky top-6">
          {selected ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
              <h2 className="text-lg font-bold text-white">Résoudre le litige</h2>

              <div className="space-y-3 text-sm">
                <div className="bg-gray-800 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Raison</p>
                  <p className="font-medium text-white">{selected.reason}</p>
                </div>
                {selected.description && (
                  <div className="bg-gray-800 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Description</p>
                    <p className="text-gray-300">{selected.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">Client</p>
                    <p className="font-medium text-white text-sm">{selected.client?.user?.name}</p>
                    <p className="text-xs text-gray-500">{selected.client?.user?.phone}</p>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">Washer</p>
                    <p className="font-medium text-white text-sm">{selected.washer?.user?.name}</p>
                    <p className="text-xs text-gray-500">{selected.washer?.user?.phone}</p>
                  </div>
                </div>
              </div>

              {selected.status === 'OPEN' || selected.status === 'REVIEWING' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Note de résolution *
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Décrivez votre décision..."
                      rows={4}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none"
                    />
                  </div>
                  <button
                    onClick={handleResolve}
                    disabled={!note.trim() || resolveLoading}
                    className="w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {resolveLoading ? 'Résolution...' : 'Marquer comme résolu'}
                  </button>
                </>
              ) : (
                <div className="bg-green-900/20 border border-green-800 rounded-xl p-4">
                  <p className="text-xs text-green-400 font-semibold mb-1">Litige {STATUS_LABELS[selected.status]?.toLowerCase()}</p>
                  {selected.resolutionNote && (
                    <p className="text-sm text-green-300">{selected.resolutionNote}</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
              <p className="text-gray-600 text-sm">Sélectionnez un litige pour le gérer</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
