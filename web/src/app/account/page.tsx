'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { missionsApi, clientApi } from '@/lib/api';
import { useAuthStore } from '@/store';
import {
  Car, User, MapPin, History, Package, LogOut, Plus,
  ArrowRight, Clock, Star, Zap, Calendar, CreditCard,
  ChevronRight, Check, Phone, Mail,
} from 'lucide-react';

const SERVICE_LABELS: Record<string, string> = { EXTERIOR: 'Lavage Exterieur', INTERIOR: 'Lavage Interieur', FULL: 'Lavage Complet' };
const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:     { label: 'En attente',   color: '#d97706', bg: '#fffbeb' },
  ACCEPTED:    { label: 'Confirme',     color: '#1558f5', bg: '#eff6ff' },
  IN_PROGRESS: { label: 'En cours',     color: '#059669', bg: '#ecfdf5' },
  DONE:        { label: 'Termine',      color: '#6b7280', bg: '#f9fafb' },
  CANCELLED:   { label: 'Annule',       color: '#ef4444', bg: '#fef2f2' },
  BOOKED:      { label: 'Reserve',      color: '#7c3aed', bg: '#f5f3ff' },
};
const VEHICLE_TYPES: Record<string, string> = { CAR: 'Voiture', SUV: 'SUV', TRUCK: 'Pick-up', MOTO: 'Moto', VAN: 'Van' };

// Donnees demo quand le backend est hors ligne
const MOCK_MISSIONS = [
  { id: 'm1', status: 'BOOKED', serviceType: 'FULL', missionType: 'BOOKING', fullAddress: 'Cocody, Rue des Jardins, Abidjan', scheduledAt: new Date(Date.now() + 3600000 * 24).toISOString(), createdAt: new Date().toISOString() },
  { id: 'm2', status: 'DONE',   serviceType: 'EXTERIOR', missionType: 'INSTANT', fullAddress: 'Plateau, Avenue Terrasson, Abidjan', scheduledAt: null, createdAt: new Date(Date.now() - 3600000 * 48).toISOString() },
  { id: 'm3', status: 'DONE',   serviceType: 'INTERIOR', missionType: 'BOOKING', fullAddress: 'Marcory, Zone 4, Abidjan', scheduledAt: null, createdAt: new Date(Date.now() - 3600000 * 96).toISOString() },
  { id: 'm4', status: 'CANCELLED', serviceType: 'FULL', missionType: 'INSTANT', fullAddress: 'Yopougon, Maroc, Abidjan', scheduledAt: null, createdAt: new Date(Date.now() - 3600000 * 144).toISOString() },
];
const MOCK_VEHICLES = [
  { id: 'v1', brand: 'Toyota', model: 'Corolla', plateNumber: 'AB 1234 CI', type: 'CAR', color: 'Blanc' },
  { id: 'v2', brand: 'Hyundai', model: 'Tucson', plateNumber: 'CD 5678 CI', type: 'SUV', color: 'Gris' },
];

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  const [missions, setMissions]   = useState<any[]>([]);
  const [vehicles, setVehicles]   = useState<any[]>([]);
  const [loadingM, setLoadingM]   = useState(true);
  const [loadingV, setLoadingV]   = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ type: 'CAR', brand: '', model: '', plateNumber: '', color: '' });
  const [addingVehicle, setAddingVehicle] = useState(false);
  const [payMethod, setPayMethod] = useState<'WAVE_MONEY' | 'CASH'>('WAVE_MONEY');

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }

    const isDemo = user?.id === 'demo-001';
    setIsDemoMode(isDemo);

    if (isDemo) {
      setMissions(MOCK_MISSIONS);
      setVehicles(MOCK_VEHICLES);
      setLoadingM(false);
      setLoadingV(false);
      return;
    }

    missionsApi.getMy().then((r) => setMissions(r.data || [])).catch(() => { setMissions(MOCK_MISSIONS); setIsDemoMode(true); }).finally(() => setLoadingM(false));
    clientApi.getVehicles().then((r) => setVehicles(r.data || [])).catch(() => { setVehicles(MOCK_VEHICLES); setIsDemoMode(true); }).finally(() => setLoadingV(false));
  }, [isAuthenticated]);

  const handleLogout = async () => { await logout(); router.push('/'); };

  const handleAddVehicle = async () => {
    if (!newVehicle.brand || !newVehicle.model || !newVehicle.plateNumber) return;
    if (isDemoMode) {
      setVehicles((v) => [...v, { ...newVehicle, id: 'v' + Date.now() }]);
      setShowAddVehicle(false);
      setNewVehicle({ type: 'CAR', brand: '', model: '', plateNumber: '', color: '' });
      return;
    }
    setAddingVehicle(true);
    try {
      const res = await clientApi.addVehicle(newVehicle);
      setVehicles((v) => [...v, res.data]);
      setShowAddVehicle(false);
      setNewVehicle({ type: 'CAR', brand: '', model: '', plateNumber: '', color: '' });
    } catch {} finally { setAddingVehicle(false); }
  };

  if (!isAuthenticated) return null;

  const activeMissions = missions.filter((m) => ['PENDING','ACCEPTED','IN_PROGRESS','BOOKED'].includes(m.status));
  const pastMissions   = missions.filter((m) => ['DONE','CANCELLED'].includes(m.status));
  const currentMission = activeMissions[0] || null;
  const recentHistory  = pastMissions.slice(0, 4);
  const firstName      = user?.name?.split(' ')[0] || 'Client';

  return (
    <div className="min-h-screen bg-[#f4f6fb]">

      {/* Bandeau demo */}
      {isDemoMode && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-center text-[13px] font-semibold py-2 px-4">
          Mode apercu — donnees fictives. Connectez-vous avec un vrai compte pour acceder a vos donnees.
        </div>
      )}

      {/* HEADER DASHBOARD */}
      <div style={{ background: 'linear-gradient(135deg, #040c24 0%, #0c1e55 60%, #1558f5 100%)' }} className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(99,179,237,0.6) 0%, transparent 50%)' }} />
        <div className="relative z-10 max-w-4xl mx-auto px-5 py-10 sm:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
                <span className="text-white font-extrabold text-xl">{firstName[0]?.toUpperCase()}</span>
              </div>
              <div>
                <p className="text-white/60 text-[13px] mb-0.5">Bonjour</p>
                <h1 className="text-white font-extrabold text-[1.4rem] leading-tight">{user?.name || 'Client'}</h1>
              </div>
            </div>
            <Link href="/booking" className="hidden sm:flex items-center gap-2 bg-white text-[#1558f5] font-bold px-5 py-2.5 rounded-xl text-[14px] hover:bg-blue-50 transition-all shadow-lg">
              <Zap className="w-4 h-4" />
              Reserver
            </Link>
          </div>

          {/* Quick stats */}
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { label: 'Missions', value: missions.length },
              { label: 'Effectuees', value: pastMissions.filter(m => m.status === 'DONE').length },
              { label: 'Vehicules', value: vehicles.length },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/10 backdrop-blur rounded-2xl px-4 py-3 border border-white/10">
                <p className="text-white font-extrabold text-[1.6rem] leading-none">{loadingM ? '—' : value}</p>
                <p className="text-white/60 text-[12px] mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENU */}
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-8 space-y-6">

        {/* CTA Mobile */}
        <Link href="/booking" className="sm:hidden flex items-center justify-center gap-2 bg-[#1558f5] text-white font-bold py-4 rounded-2xl text-[15px] shadow-[0_4px_16px_rgba(21,88,245,0.3)]">
          <Zap className="w-5 h-5" />
          Reserver un lavage
        </Link>

        {/* MISSION EN COURS */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[1rem] font-bold text-gray-900">Mission en cours</h2>
            {activeMissions.length > 1 && <Link href="/account/history" className="text-[13px] text-[#1558f5] font-semibold flex items-center gap-1">Voir tout <ChevronRight className="w-3.5 h-3.5" /></Link>}
          </div>

          {loadingM ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse h-28" />
          ) : currentMission ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="text-[12px] font-bold px-2.5 py-1 rounded-full"
                      style={{ color: STATUS_LABELS[currentMission.status]?.color, backgroundColor: STATUS_LABELS[currentMission.status]?.bg }}>
                      {STATUS_LABELS[currentMission.status]?.label || currentMission.status}
                    </span>
                    {currentMission.missionType === 'INSTANT' && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                        <Zap className="w-3 h-3" /> Instantanee
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-gray-900 text-[1rem] mb-1.5">
                    {SERVICE_LABELS[currentMission.serviceType] || currentMission.serviceType}
                  </p>
                  {currentMission.fullAddress && (
                    <p className="flex items-center gap-1.5 text-[13px] text-gray-500">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      {currentMission.fullAddress}
                    </p>
                  )}
                  {currentMission.scheduledAt && (
                    <p className="flex items-center gap-1.5 text-[13px] text-gray-500 mt-1">
                      <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                      {new Date(currentMission.scheduledAt).toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', hour:'2-digit', minute:'2-digit' })}
                    </p>
                  )}
                </div>
                <Link href={`/mission/${currentMission.id}`}
                  className="flex items-center gap-2 bg-[#1558f5] text-white text-[13px] font-bold px-4 py-2.5 rounded-xl hover:bg-[#1045e1] transition-all flex-shrink-0">
                  Suivre <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-7 text-center">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Car className="w-6 h-6 text-gray-300" />
              </div>
              <p className="font-semibold text-gray-400 text-[0.9rem] mb-3">Aucune mission en cours</p>
              <Link href="/booking" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#1558f5] hover:underline">
                Commander un lavage <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </section>

        {/* HISTORIQUE */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[1rem] font-bold text-gray-900">Historique recent</h2>
            <Link href="/account/history" className="text-[13px] text-[#1558f5] font-semibold flex items-center gap-1">
              Voir tout <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            {loadingM ? (
              <div className="p-6 animate-pulse space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 rounded-xl" />)}
              </div>
            ) : recentHistory.length === 0 ? (
              <div className="p-7 text-center">
                <History className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-[0.875rem]">Aucun historique</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentHistory.map((m) => {
                  const st = STATUS_LABELS[m.status] || { label: m.status, color: '#6b7280', bg: '#f9fafb' };
                  return (
                    <div key={m.id} className="flex items-center justify-between px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <Car className="w-4 h-4 text-[#1558f5]" />
                        </div>
                        <div>
                          <p className="text-[0.875rem] font-semibold text-gray-900">
                            {SERVICE_LABELS[m.serviceType] || m.serviceType}
                          </p>
                          <p className="text-[12px] text-gray-400">
                            {m.createdAt ? new Date(m.createdAt).toLocaleDateString('fr-FR', { day:'numeric', month:'short' }) : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[12px] font-bold px-2.5 py-1 rounded-full" style={{ color: st.color, backgroundColor: st.bg }}>
                          {st.label}
                        </span>
                        {m.status === 'DONE' && (
                          <a href={`/mission-review/${m.id}`} className="text-[11px] text-blue-600 font-semibold hover:underline">
                            {String.fromCodePoint(11088)} Donner mon avis
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* VEHICULES + ABONNEMENTS */}
        <div className="grid sm:grid-cols-2 gap-6">

          {/* Mes vehicules */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[1rem] font-bold text-gray-900">Mes vehicules</h2>
              <button onClick={() => setShowAddVehicle(!showAddVehicle)}
                className="flex items-center gap-1 text-[13px] text-[#1558f5] font-semibold hover:underline">
                <Plus className="w-3.5 h-3.5" /> Ajouter
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              {showAddVehicle && (
                <div className="p-4 bg-blue-50 border-b border-blue-100">
                  <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                    <select value={newVehicle.type} onChange={(e) => setNewVehicle({...newVehicle, type: e.target.value})}
                      className="col-span-2 input-field bg-white text-[13px]">
                      {Object.entries(VEHICLE_TYPES).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    <input placeholder="Marque *" value={newVehicle.brand} onChange={(e) => setNewVehicle({...newVehicle, brand: e.target.value})} className="input-field bg-white text-[13px]" />
                    <input placeholder="Modele *" value={newVehicle.model} onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})} className="input-field bg-white text-[13px]" />
                    <input placeholder="Plaque *" value={newVehicle.plateNumber} onChange={(e) => setNewVehicle({...newVehicle, plateNumber: e.target.value})} className="input-field bg-white text-[13px]" />
                    <input placeholder="Couleur" value={newVehicle.color} onChange={(e) => setNewVehicle({...newVehicle, color: e.target.value})} className="input-field bg-white text-[13px]" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleAddVehicle} disabled={addingVehicle}
                      className="flex-1 bg-[#1558f5] text-white text-[13px] font-bold py-2.5 rounded-xl hover:bg-[#1045e1] transition disabled:opacity-50">
                      {addingVehicle ? 'Ajout...' : 'Ajouter'}
                    </button>
                    <button onClick={() => setShowAddVehicle(false)}
                      className="flex-1 border border-gray-200 text-gray-600 text-[13px] font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition">
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {loadingV ? (
                <div className="p-5 animate-pulse space-y-2">
                  {[1,2].map(i => <div key={i} className="h-10 bg-gray-100 rounded-xl" />)}
                </div>
              ) : vehicles.length === 0 ? (
                <div className="p-6 text-center">
                  <Car className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-gray-400 text-[0.8rem]">Aucun vehicule enregistre</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {vehicles.map((v) => (
                    <div key={v.id} className="flex items-center gap-3 px-4 py-3.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Car className="w-4 h-4 text-[#1558f5]" />
                      </div>
                      <div>
                        <p className="text-[0.875rem] font-semibold text-gray-900">{v.brand} {v.model}</p>
                        <p className="text-[11px] text-gray-400">{v.plateNumber} · {VEHICLE_TYPES[v.type] || v.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Mes abonnements */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[1rem] font-bold text-gray-900">Mes abonnements</h2>
              <Link href="/compte/abonnement" className="text-[13px] text-[#1558f5] font-semibold flex items-center gap-1">
                Voir <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5">
              {isDemoMode ? (
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-[#1558f5]" />
                    </div>
                    <div>
                      <p className="text-[0.875rem] font-bold text-gray-900">Abonnement 12 Lavages</p>
                      <p className="text-[12px] text-gray-400">8 lavages restants</p>
                    </div>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-[#1558f5] h-2 rounded-full" style={{ width: '66%' }} />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5 text-right">8 / 12 lavages</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <Package className="w-10 h-10 text-gray-200 mb-3" />
                  <p className="text-gray-400 text-[0.875rem] mb-3">Aucun abonnement actif</p>
                  <Link href="/tarifs" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#1558f5] bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition">
                    Voir nos formules <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* MOYENS DE PAIEMENT */}
        <section>
          <h2 className="text-[1rem] font-bold text-gray-900 mb-3">Moyens de paiement</h2>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setPayMethod('WAVE_MONEY')}
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${payMethod === 'WAVE_MONEY' ? 'border-[#00b9f5] bg-blue-50' : 'border-gray-100 hover:border-[#bae6fd]'}`}>
                <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-orange-600 font-extrabold text-[13px]">OM</span>
                </div>
                <div className="text-left">
                  <p className="text-[0.875rem] font-bold text-gray-900">Wave Money</p>
                  <p className="text-[11px] text-gray-400">Mobile securise</p>
                </div>
                {payMethod === 'WAVE_MONEY' && <Check className="w-4 h-4 text-blue-500 ml-auto" />}
              </button>
              <button onClick={() => setPayMethod('CASH')}
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${payMethod === 'CASH' ? 'border-green-400 bg-green-50' : 'border-gray-100 hover:border-green-200'}`}>
                <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-700 font-extrabold text-[13px]">XOF</span>
                </div>
                <div className="text-left">
                  <p className="text-[0.875rem] font-bold text-gray-900">Especes</p>
                  <p className="text-[11px] text-gray-400">Avant la prestation</p>
                </div>
                {payMethod === 'CASH' && <Check className="w-4 h-4 text-green-500 ml-auto" />}
              </button>
            </div>
            <p className="text-[11px] text-gray-400 mt-3 text-center">
              Votre methode preferee sera selectionnee par defaut a la reservation.
            </p>
          </div>
        </section>

        {/* PROFIL */}
        <section>
          <h2 className="text-[1rem] font-bold text-gray-900 mb-3">Mon profil</h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            {[
              { icon: User, label: 'Nom complet', value: user?.name || 'Non renseigne' },
              { icon: Phone, label: 'Telephone', value: user?.phone || 'Non renseigne' },
              { icon: Mail, label: 'Email', value: user?.email || 'Non renseigne' },
            ].map(({ icon: Icon, label, value }, i) => (
              <div key={label} className={`flex items-center gap-4 px-5 py-4 ${i < 2 ? 'border-b border-gray-50' : ''}`}>
                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] text-gray-400">{label}</p>
                  <p className="text-[0.875rem] font-semibold text-gray-900">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* DECONNEXION */}
        <button onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2.5 border-2 border-red-100 text-red-500 font-bold py-3.5 rounded-2xl hover:bg-red-50 transition-all text-[0.9rem]">
          <LogOut className="w-4 h-4" />
          Deconnexion
        </button>

        <div className="h-6" />
      </div>
    </div>
  );
}
