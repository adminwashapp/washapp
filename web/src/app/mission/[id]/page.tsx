'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Car, MapPin, Clock, CheckCircle, Star, AlertTriangle,
  Camera, Phone, ChevronLeft, Loader,
} from 'lucide-react';
import { missionsApi, paymentsApi } from '@/lib/api';
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';

const STATUS_LABELS: Record<string, { label: string; color: string; step: number }> = {
  SEARCHING: { label: 'Recherche d\'un washer...', color: 'text-yellow-600', step: 0 },
  ASSIGNED: { label: 'Washer assigné', color: 'text-blue-600', step: 1 },
  EN_ROUTE: { label: 'En route vers vous', color: 'text-blue-600', step: 1 },
  ARRIVED: { label: 'Arrivé chez vous', color: 'text-indigo-600', step: 2 },
  IN_PROGRESS: { label: 'Lavage en cours', color: 'text-purple-600', step: 3 },
  COMPLETED: { label: 'Terminé - À valider', color: 'text-orange-600', step: 4 },
  VALIDATED: { label: 'Validé', color: 'text-green-600', step: 5 },
  CANCELLED: { label: 'Annulé', color: 'text-red-600', step: -1 },
  DISPUTED: { label: 'En litige', color: 'text-red-600', step: -1 },
};

export default function MissionTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [mission, setMission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showRating, setShowRating] = useState(false);
  const [showComplaint, setShowComplaint] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [complaintReason, setComplaintReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const fetchMission = async () => {
    try {
      const res = await missionsApi.getById(id as string);
      setMission(res.data);
    } catch {
      router.push('/account/history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMission();

    const token = Cookies.get('accessToken');
    const socket = io(`${process.env.NEXT_PUBLIC_WS_URL}/ws`, {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('mission:status-update', (data) => {
      if (data.missionId === id) fetchMission();
    });

    socket.on('washer:location-update', (data) => {
      if (data.missionId === id) {
        // Update map with washer position
      }
    });

    socket.on('mission:washer-assigned', (data) => {
      if (data.missionId === id) fetchMission();
    });

    const interval = setInterval(fetchMission, 15000);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, [id]);

  const handleValidate = async () => {
    setSubmitting(true);
    try {
      await missionsApi.validate(id as string);
      await fetchMission();
      setShowRating(true);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRate = async () => {
    if (!rating) return;
    setSubmitting(true);
    try {
      await missionsApi.rate(id as string, { stars: rating, comment });
      setShowRating(false);
      await fetchMission();
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplaint = async () => {
    if (!complaintReason) return;
    setSubmitting(true);
    try {
      await missionsApi.complain(id as string, { reason: complaintReason });
      setShowComplaint(false);
      await fetchMission();
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmCash = async () => {
    setSubmitting(true);
    try {
      await paymentsApi.confirmCashClient(id as string);
      await fetchMission();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!mission) return null;

  const statusInfo = STATUS_LABELS[mission.status] || STATUS_LABELS.SEARCHING;
  const progressSteps = ['Recherche', 'Assigné', 'Arrivée', 'En cours', 'Terminé', 'Validé'];


  // ── Full-screen SEARCHING state ─────────────────────────────────────────
  if (mission.status === 'SEARCHING') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-between py-12 px-6">
        <div className="w-full flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-white font-bold">Recherche de washer</p>
            <p className="text-slate-400 text-xs">#{mission.id.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>

        <div className="relative flex items-center justify-center w-60 h-60">
          <div className="absolute w-20 h-20 rounded-full border-2 border-blue-500 animate-ping opacity-30" />
          <div className="absolute w-40 h-40 rounded-full border-2 border-blue-400 animate-ping opacity-20" style={{ animationDelay: '0.8s' }} />
          <div className="absolute w-60 h-60 rounded-full border-2 border-blue-300 animate-ping opacity-10" style={{ animationDelay: '1.6s' }} />
          <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center shadow-2xl z-10">
            <span className="text-4xl">&#x1F697;</span>
          </div>
        </div>

        <div className="text-center space-y-3">
          <h2 className="text-white text-2xl font-black">Recherche d&apos;un washer&hellip;</h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
            Nous trouvons le meilleur washer disponible pr&egrave;s de vous.
          </p>
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white text-sm font-semibold">En cours de recherche</span>
          </div>
        </div>

        <div className="w-full bg-white/5 rounded-2xl p-5 space-y-2 border border-white/10">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Prestation</span>
            <span className="text-white font-semibold">
              {{ EXTERIOR: 'Lavage Ext\u00e9rieur', INTERIOR: 'Lavage Int\u00e9rieur', FULL: 'Lavage Complet' }[mission.serviceType]}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Montant</span>
            <span className="text-blue-400 font-bold">{mission.price?.toLocaleString('fr-FR')} FCFA</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Adresse</span>
            <span className="text-white text-xs text-right max-w-[55%]">{mission.fullAddress}</span>
          </div>
        </div>

        <button onClick={() => router.back()}
          className="w-full py-4 rounded-xl border-2 border-red-500/30 bg-red-500/10 text-red-400 font-semibold hover:bg-red-500/20">
          Annuler la demande
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="font-bold text-gray-900">Suivi de mission</h1>
          <p className="text-xs text-gray-500">#{mission.id.slice(0, 8).toUpperCase()}</p>
        </div>
        <div className={`ml-auto font-semibold text-sm ${statusInfo.color}`}>
          {statusInfo.label}
        </div>
      </div>

      <div className="h-48 bg-gray-200 relative">
        <div id="tracking-map" className="w-full h-full" />
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500">{mission.fullAddress}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {statusInfo.step >= 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              {progressSteps.slice(0, 6).map((s, i) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      i <= statusInfo.step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {i < statusInfo.step ? '✓' : i + 1}
                  </div>
                  {i < progressSteps.length - 1 && (
                    <div className={`h-0.5 w-8 ${i < statusInfo.step ? 'bg-blue-600' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
            <p className="text-center text-sm font-medium text-gray-600">{statusInfo.label}</p>
          </div>
        )}

        {mission.washer && (
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Votre washer</h3>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                <Car className="w-7 h-7 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{mission.washer.user.name}</p>
                <div className="flex items-center gap-1 text-sm text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-medium">{mission.washer.averageRating?.toFixed(1)}</span>
                </div>
              </div>
              <a
                href={`tel:${mission.washer.user.phone}`}
                className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200"
              >
                <Phone className="w-5 h-5 text-blue-600" />
              </a>
            </div>
          </div>
        )}

        <div className="card">
          <h3 className="font-bold text-gray-900 mb-4">Détails</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Prestation</span>
              <span className="font-medium">
                {{ EXTERIOR: 'Extérieur', INTERIOR: 'Intérieur', FULL: 'Complet' }[mission.serviceType]}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Prix</span>
              <span className="font-bold text-blue-600">{mission.price.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Paiement</span>
              <span className="font-medium">
                {mission.paymentMethod === 'ORANGE_MONEY' ? 'Orange Money' : 'Espèces'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Adresse</span>
              <span className="font-medium text-right max-w-56 text-xs">{mission.fullAddress}</span>
            </div>
          </div>
        </div>

        {mission.photos?.length > 0 && (
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-600" />
              Photos
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {mission.photos.map((photo: any) => (
                <div key={photo.id} className="relative">
                  <img
                    src={photo.url}
                    alt={photo.type === 'BEFORE' ? 'Avant' : 'Après'}
                    className="w-full h-32 object-cover rounded-xl"
                  />
                  <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-lg ${
                    photo.type === 'BEFORE' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                  }`}>
                    {photo.type === 'BEFORE' ? 'Avant' : 'Après'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {mission.status === 'COMPLETED' && mission.validationStatus === 'PENDING' && (
          <div className="space-y-3">
            {mission.paymentMethod === 'CASH' && mission.paymentStatus === 'UNPAID' && (
              <button onClick={handleConfirmCash} disabled={submitting} className="btn-primary w-full bg-green-600 hover:bg-green-700">
                J'ai payé le washer en espèces
              </button>
            )}
            <button onClick={handleValidate} disabled={submitting} className="btn-primary w-full">
              <CheckCircle className="w-5 h-5" />
              Valider la mission
            </button>
            <button onClick={() => setShowComplaint(true)} className="w-full py-3 px-6 border-2 border-red-200 text-red-600 rounded-xl font-semibold hover:bg-red-50 flex items-center justify-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Signaler un problème
            </button>
          </div>
        )}

        {mission.status === 'VALIDATED' && !mission.rating && !showRating && (
          <button onClick={() => setShowRating(true)} className="btn-primary w-full">
            <Star className="w-5 h-5" />
            Noter le washer
          </button>
        )}
      </div>

      {showRating && (
        <div className="fixed inset-0 bg-black/60 flex items-end z-50">
          <div className="bg-white w-full rounded-t-3xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Notez votre washer</h3>
            <p className="text-gray-500 text-sm mb-6">Comment s'est passée la mission ?</p>

            <div className="flex gap-2 justify-center mb-6">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setRating(s)} className="p-1">
                  <Star className={`w-10 h-10 ${s <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Un commentaire ? (optionnel)"
              className="input-field mb-4 resize-none h-24"
            />

            <div className="flex gap-3">
              <button onClick={() => setShowRating(false)} className="btn-ghost border border-gray-300 flex-1">
                Plus tard
              </button>
              <button onClick={handleRate} disabled={!rating || submitting} className="btn-primary flex-1">
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}

      {showComplaint && (
        <div className="fixed inset-0 bg-black/60 flex items-end z-50">
          <div className="bg-white w-full rounded-t-3xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Signaler un problème</h3>
            <p className="text-gray-500 text-sm mb-4">Décrivez le problème rencontré.</p>

            <textarea
              value={complaintReason}
              onChange={(e) => setComplaintReason(e.target.value)}
              placeholder="Décrivez le problème..."
              className="input-field mb-4 resize-none h-28"
            />

            <div className="flex gap-3">
              <button onClick={() => setShowComplaint(false)} className="btn-ghost border border-gray-300 flex-1">
                Annuler
              </button>
              <button onClick={handleComplaint} disabled={!complaintReason || submitting} className="btn-primary flex-1 bg-red-600 hover:bg-red-700">
                Signaler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}