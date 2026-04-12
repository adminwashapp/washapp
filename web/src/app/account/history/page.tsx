'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { missionsApi } from '@/lib/api';
import { useAuthStore } from '@/store';
import { Car, Clock, CheckCircle, XCircle, Star, ChevronRight } from 'lucide-react';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  SEARCHING: { label: 'Recherche...', color: 'bg-yellow-100 text-yellow-700' },
  ASSIGNED: { label: 'Assigné', color: 'bg-blue-100 text-blue-700' },
  IN_PROGRESS: { label: 'En cours', color: 'bg-purple-100 text-purple-700' },
  COMPLETED: { label: 'À valider', color: 'bg-orange-100 text-orange-700' },
  VALIDATED: { label: 'Validé', color: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Annulé', color: 'bg-red-100 text-red-700' },
  DISPUTED: { label: 'Litige', color: 'bg-red-100 text-red-700' },
};

const SERVICE_LABELS: Record<string, string> = {
  EXTERIOR: 'Extérieur',
  INTERIOR: 'Intérieur',
  FULL: 'Complet',
};

export default function HistoryPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    missionsApi.getMy().then((r) => setMissions(r.data)).finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Car className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-gray-900">Washapp</span>
        </Link>
        <nav className="flex items-center gap-4 ml-8 text-sm">
          <Link href="/account" className="text-gray-500 hover:text-gray-900">Mon compte</Link>
          <span className="font-semibold text-gray-900 border-b-2 border-blue-600 pb-1">Historique</span>
          <Link href="/account/subscriptions" className="text-gray-500 hover:text-gray-900">Abonnements</Link>
        </nav>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Historique des missions</h1>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Chargement...</div>
        ) : missions.length === 0 ? (
          <div className="card text-center py-16">
            <Car className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Aucune mission pour l'instant</p>
            <Link href="/booking" className="btn-primary mt-6 inline-flex">
              Réserver maintenant
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {missions.map((m) => {
              const statusInfo = STATUS_LABELS[m.status] || STATUS_LABELS.SEARCHING;
              return (
                <Link key={m.id} href={`/mission/${m.id}`} className="card block hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Car className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900">
                            {SERVICE_LABELS[m.serviceType] || m.serviceType}
                          </span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate max-w-xs">{m.fullAddress}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(m.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                          {m.washer && (
                            <span>{m.washer.user?.name}</span>
                          )}
                        </div>
                        {m.rating && (
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < m.rating.stars ? 'text-yellow-400 fill-current' : 'text-gray-200'}`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-blue-600">{m.price?.toLocaleString()} FCFA</p>
                      <ChevronRight className="w-4 h-4 text-gray-400 ml-auto mt-2" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
