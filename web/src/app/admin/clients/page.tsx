'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Users, Phone, Mail, Calendar, ShoppingBag,
  AlertTriangle, Ban, CheckCircle, ChevronLeft, ChevronRight,
  Eye, RefreshCw, UserX, UserCheck,
} from 'lucide-react';
import { adminApi } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  active:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  inactive: 'bg-red-50 text-red-700 border-red-200',
};

function fmt(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Client Detail Modal ──────────────────────────────────────────────────────
function ClientDetailModal({ client, onClose, onBanToggle }: {
  client: any; onClose: () => void; onBanToggle: (id: string) => Promise<void>;
}) {
  const [banning, setBanning] = useState(false);
  const isActive = client.user?.isActive !== false;

  const handleBan = async () => {
    setBanning(true);
    try { await onBanToggle(client.id); onClose(); }
    finally { setBanning(false); }
  };

  const SERVICE_LABELS: Record<string, string> = {
    EXTERIOR: 'Extérieur', INTERIOR: 'Intérieur', FULL: 'Complet',
  };
  const STATUS_MISSION: Record<string, { label: string; color: string }> = {
    SEARCHING:  { label: 'Recherche',  color: 'text-amber-600' },
    ASSIGNED:   { label: 'Assignée',   color: 'text-blue-600' },
    EN_ROUTE:   { label: 'En route',   color: 'text-blue-600' },
    IN_PROGRESS:{ label: 'En cours',   color: 'text-violet-600' },
    COMPLETED:  { label: 'Terminée',   color: 'text-emerald-600' },
    VALIDATED:  { label: 'Validée',    color: 'text-emerald-700' },
    CANCELLED:  { label: 'Annulée',    color: 'text-gray-400' },
    DISPUTED:   { label: 'Litige',     color: 'text-red-600' },
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-black text-blue-600">
              {client.user?.name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">{client.user?.name ?? '—'}</h2>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${isActive ? STATUS_COLORS.active : STATUS_COLORS.inactive}`}>
                {isActive ? 'Actif' : 'Banni'}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Infos */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: <Phone className="w-4 h-4" />, label: 'Téléphone', value: client.user?.phone ?? '—' },
              { icon: <Mail className="w-4 h-4" />, label: 'Email', value: client.user?.email ?? '—' },
              { icon: <Calendar className="w-4 h-4" />, label: 'Inscrit le', value: fmt(client.user?.createdAt) },
              { icon: <ShoppingBag className="w-4 h-4" />, label: 'Total missions', value: client._count?.missions ?? 0 },
              { icon: <AlertTriangle className="w-4 h-4" />, label: 'Réclamations', value: client._count?.complaints ?? 0 },
              { icon: <CheckCircle className="w-4 h-4" />, label: 'ID Client', value: client.id.slice(0, 12) + '…' },
            ].map((info) => (
              <div key={info.label} className="bg-gray-50 rounded-xl p-3 flex gap-3 items-start">
                <span className="text-gray-400 mt-0.5">{info.icon}</span>
                <div>
                  <p className="text-xs text-gray-500 font-medium">{info.label}</p>
                  <p className="text-sm font-bold text-gray-800 break-all">{info.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Missions */}
          {client.missions?.length > 0 && (
            <div>
              <h3 className="text-sm font-black text-gray-700 uppercase tracking-wide mb-3">
                Dernières missions ({client.missions.length})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {client.missions.map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {SERVICE_LABELS[m.serviceType] ?? m.serviceType}
                        {m.washer?.user?.name ? <span className="text-gray-400 font-normal"> · {m.washer.user.name}</span> : null}
                      </p>
                      <p className="text-xs text-gray-400">{fmt(m.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-bold ${STATUS_MISSION[m.status]?.color ?? 'text-gray-500'}`}>
                        {STATUS_MISSION[m.status]?.label ?? m.status}
                      </p>
                      <p className="text-sm font-black text-gray-800">{(m.price ?? 0).toLocaleString('fr-FR')} F</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Complaints */}
          {client.complaints?.length > 0 && (
            <div>
              <h3 className="text-sm font-black text-red-600 uppercase tracking-wide mb-3">
                Réclamations ({client.complaints.length})
              </h3>
              <div className="space-y-2">
                {client.complaints.slice(0, 5).map((c: any) => (
                  <div key={c.id} className="bg-red-50 rounded-xl px-4 py-3 border border-red-100">
                    <p className="text-sm text-red-800 font-medium">{c.reason ?? '—'}</p>
                    <p className="text-xs text-red-400 mt-1">{fmt(c.createdAt)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
              Fermer
            </button>
            <button
              onClick={handleBan}
              disabled={banning}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold ${
                isActive
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white'
              } disabled:opacity-60`}
            >
              {banning ? <RefreshCw className="w-4 h-4 animate-spin" /> : isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
              {isActive ? 'Bannir ce client' : 'Réactiver ce client'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminClientsPage() {
  const router = useRouter();
  const [clients, setClients]       = useState<any[]>([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [search, setSearch]         = useState('');
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const LIMIT = 20;

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getClients({ search: search || undefined, page, limit: LIMIT });
      setClients(res.data.clients ?? []);
      setTotal(res.data.total ?? 0);
    } catch (e: any) {
      if (e.response?.status === 401) router.push('/admin/login');
    } finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };

  const openDetail = async (client: any) => {
    setDetailLoading(true);
    try {
      const res = await adminApi.getClientById(client.id);
      setSelected(res.data);
    } catch { setSelected(client); }
    finally { setDetailLoading(false); }
  };

  const handleBanToggle = async (id: string) => {
    await adminApi.toggleClientBan(id);
    await fetchClients();
  };

  const totalPages = Math.ceil(total / LIMIT);
  const isActive = (c: any) => c.user?.isActive !== false;

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Clients</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {total.toLocaleString('fr-FR')} client{total > 1 ? 's' : ''} inscrit{total > 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={fetchClients} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100">
          <RefreshCw className="w-4 h-4" /> Actualiser
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher par nom, téléphone ou email..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total inscrits', value: total, icon: <Users className="w-5 h-5 text-blue-500" />, bg: 'bg-blue-50' },
          { label: 'Actifs', value: clients.filter(isActive).length, icon: <CheckCircle className="w-5 h-5 text-emerald-500" />, bg: 'bg-emerald-50' },
          { label: 'Bannis', value: clients.filter(c => !isActive(c)).length, icon: <Ban className="w-5 h-5 text-red-500" />, bg: 'bg-red-50' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
            <div className={`${s.bg} p-2.5 rounded-lg`}>{s.icon}</div>
            <div>
              <p className="text-xl font-black text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" /> Chargement...
          </div>
        ) : clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
            <Users className="w-12 h-12" />
            <p className="text-sm font-medium">{search ? 'Aucun résultat pour cette recherche' : 'Aucun client inscrit'}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Client', 'Contact', 'Inscription', 'Missions', 'Réclamations', 'Statut', ''].map((h) => (
                  <th key={h} className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {clients.map((client) => {
                const active = isActive(client);
                return (
                  <tr key={client.id} className="hover:bg-gray-50/60 transition-colors group">
                    {/* Avatar + name */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-black text-base flex-shrink-0">
                          {client.user?.name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{client.user?.name ?? '—'}</p>
                          <p className="text-xs text-gray-400 font-mono">{client.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    {/* Contact */}
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-700 font-medium">{client.user?.phone ?? '—'}</p>
                      <p className="text-xs text-gray-400">{client.user?.email ?? ''}</p>
                    </td>
                    {/* Date */}
                    <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">{fmt(client.user?.createdAt)}</td>
                    {/* Missions */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold">
                        <ShoppingBag className="w-3 h-3" /> {client._count?.missions ?? 0}
                      </span>
                    </td>
                    {/* Complaints */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        (client._count?.complaints ?? 0) > 0
                          ? 'bg-red-50 text-red-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        <AlertTriangle className="w-3 h-3" /> {client._count?.complaints ?? 0}
                      </span>
                    </td>
                    {/* Status */}
                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${active ? STATUS_COLORS.active : STATUS_COLORS.inactive}`}>
                        {active ? 'Actif' : 'Banni'}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-4">
                      <button
                        onClick={() => openDetail(client)}
                        disabled={detailLoading}
                        className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Voir
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Page {page} / {totalPages} · {total} résultats
            </p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <ClientDetailModal
          client={selected}
          onClose={() => setSelected(null)}
          onBanToggle={handleBanToggle}
        />
      )}
    </div>
  );
}