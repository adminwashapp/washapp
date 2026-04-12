'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import {
  Users, Car, AlertTriangle, CreditCard,
  TrendingUp, Clock, CheckCircle, XCircle,
} from 'lucide-react';

function StatCard({
  label, value, sub, icon: Icon, color,
}: {
  label: string; value: string | number; sub?: string;
  icon: any; color: string;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-3xl font-extrabold text-white">{value}</p>
      <p className="text-sm font-medium text-gray-300 mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}

function MissionRow({ m }: { m: any }) {
  const colors: Record<string, string> = {
    VALIDATED: 'bg-green-900 text-green-400',
    IN_PROGRESS: 'bg-blue-900 text-blue-400',
    SEARCHING: 'bg-yellow-900 text-yellow-400',
    CANCELLED: 'bg-red-900 text-red-400',
    DISPUTED: 'bg-orange-900 text-orange-400',
    COMPLETED: 'bg-purple-900 text-purple-400',
  };
  const labels: Record<string, string> = {
    VALIDATED: 'Validé', IN_PROGRESS: 'En cours', SEARCHING: 'Recherche',
    CANCELLED: 'Annulé', DISPUTED: 'Litige', COMPLETED: 'À valider',
    ASSIGNED: 'Assigné', EN_ROUTE: 'En route', ARRIVED: 'Arrivé',
  };
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
      <div>
        <p className="text-sm font-medium text-white">{m.serviceType === 'EXTERIOR' ? 'Extérieur' : m.serviceType === 'INTERIOR' ? 'Intérieur' : 'Complet'}</p>
        <p className="text-xs text-gray-500 truncate max-w-48">{m.fullAddress}</p>
      </div>
      <div className="text-right">
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${colors[m.status] || 'bg-gray-800 text-gray-400'}`}>
          {labels[m.status] || m.status}
        </span>
        <p className="text-xs text-gray-500 mt-1">{m.price?.toLocaleString()} FCFA</p>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getDashboard()
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const stats = data?.stats || {};
  const recentMissions = data?.recentMissions || [];
  const openComplaints = data?.openComplaints || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Vue globale de la plateforme Washapp</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Clients" value={stats.totalClients ?? '—'} icon={Users} color="bg-blue-600" />
        <StatCard label="Washers actifs" value={stats.activeWashers ?? '—'} sub={`${stats.totalWashers ?? '—'} total`} icon={Users} color="bg-emerald-600" />
        <StatCard label="Missions aujourd'hui" value={stats.missionsToday ?? '—'} sub={`${stats.missionsTotal ?? '—'} total`} icon={Car} color="bg-purple-600" />
        <StatCard label="Litiges ouverts" value={stats.openComplaints ?? '—'} icon={AlertTriangle} color="bg-red-600" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Revenus du jour" value={`${(stats.revenueToday ?? 0).toLocaleString()} F`} icon={TrendingUp} color="bg-orange-600" />
        <StatCard label="En attente" value={stats.missionsSearching ?? '—'} icon={Clock} color="bg-yellow-600" />
        <StatCard label="Validées aujourd'hui" value={stats.missionsValidatedToday ?? '—'} icon={CheckCircle} color="bg-teal-600" />
        <StatCard label="Retraits en attente" value={stats.pendingWithdrawals ?? '—'} icon={CreditCard} color="bg-pink-600" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Missions récentes</h2>
          {recentMissions.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-6">Aucune mission</p>
          ) : (
            recentMissions.slice(0, 8).map((m: any) => <MissionRow key={m.id} m={m} />)
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Litiges ouverts</h2>
          {openComplaints.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-6">Aucun litige ouvert</p>
          ) : (
            openComplaints.slice(0, 8).map((c: any) => (
              <div key={c.id} className="flex items-start justify-between py-3 border-b border-gray-800 last:border-0">
                <div>
                  <p className="text-sm font-medium text-white truncate max-w-48">{c.reason}</p>
                  <p className="text-xs text-gray-500">Mission #{c.missionId?.slice(-6)}</p>
                </div>
                <span className="text-xs bg-red-900 text-red-400 font-semibold px-2 py-1 rounded-full">
                  {c.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
