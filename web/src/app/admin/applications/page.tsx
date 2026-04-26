'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api, adminApi, applicationsApi } from '@/lib/api';
import { Trash, CheckCircle2, XCircle, Clock, AlertTriangle, User, Phone, Mail,
  MapPin, Truck, Calendar, FileText, ChevronDown, ChevronUp, RefreshCw, ExternalLink,
} from 'lucide-react';

type CandidatureStatus = 'PENDING' | 'VALIDATED' | 'REJECTED' | 'INCOMPLETE';

interface Application {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  zone: string;
  transportType: string;
  availability: string;
  experience?: string;
  hasEquipment: boolean;
  waveMoneyNumber?: string;
  preferredPayment?: string;
  profilePhotoUrl?: string;
  idDocumentUrl?: string;
  otherDocumentUrl?: string;
  status: CandidatureStatus;
  adminNote?: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<CandidatureStatus, { label: string; color: string; bg: string; icon: any }> = {
  PENDING:    { label: 'En attente',   color: '#d97706', bg: '#fffbeb',  icon: Clock },
  VALIDATED:  { label: 'Valide',       color: '#059669', bg: '#ecfdf5',  icon: CheckCircle2 },
  REJECTED:   { label: 'Refuse',       color: '#ef4444', bg: '#fef2f2',  icon: XCircle },
  INCOMPLETE: { label: 'A completer',  color: '#7c3aed', bg: '#f5f3ff',  icon: AlertTriangle },
};

const TRANSPORT_LABELS: Record<string, string> = {
  BIKE: 'Velo', SCOOTER: 'Scooter / Moto 50cc', MOTORBIKE: 'Moto',
};

const STATUS_TABS: { key: string; label: string }[] = [
  { key: '',           label: 'Toutes' },
  { key: 'PENDING',    label: 'En attente' },
  { key: 'VALIDATED',  label: 'Valides' },
  { key: 'REJECTED',   label: 'Refuses' },
  { key: 'INCOMPLETE', label: 'A completer' },
];

export default function AdminApplicationsPage() {
  const router = useRouter();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/applications', { params: filterStatus ? { status: filterStatus } : {} });
      setApps(res.data || []);
    } catch (e: any) {
      if (e?.response?.status === 401) router.push('/admin');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, router]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: CandidatureStatus) => {
    setActionLoading(a => ({ ...a, [`${id}_${status}`]: true }));
    try {
      const note = noteInputs[id];
      await applicationsApi.updateStatus(id, status, note);
      setApps(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    } catch {
      alert('Erreur lors de la mise à jour du statut.');
    } finally {
      setActionLoading(a => { const n = { ...a }; delete n[`${id}_${status}`]; return n; });
    }
  };

  const deleteApplication = async (id: string) => {
    if (!confirm('Supprimer definitivement cette candidature ? Cette action est irreversible.')) return;
    setActionLoading(a => ({ ...a, [`${id}_delete`]: true }));
    try {
      await api.delete(`/applications/${id}`);
      setApps(prev => prev.filter(a => a.id !== id));
    } catch {
      alert('Erreur lors de la suppression.');
    } finally {
      setActionLoading(a => { const n = { ...a }; delete n[`${id}_delete`]; return n; });
    }
  };

  const counts = {
    all: apps.length,
    PENDING: apps.filter(a => a.status === 'PENDING').length,
    VALIDATED: apps.filter(a => a.status === 'VALIDATED').length,
    REJECTED: apps.filter(a => a.status === 'REJECTED').length,
    INCOMPLETE: apps.filter(a => a.status === 'INCOMPLETE').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900">Candidatures Washers</h1>
            <p className="text-sm text-gray-500">{counts.all} candidature{counts.all > 1 ? 's' : ''} au total</p>
          </div>
          <button onClick={load} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(['PENDING', 'VALIDATED', 'REJECTED', 'INCOMPLETE'] as CandidatureStatus[]).map(s => {
            const cfg = STATUS_CONFIG[s];
            const Icon = cfg.icon;
            return (
              <div key={s} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: cfg.bg }}>
                    <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                  </div>
                  <span className="text-sm font-semibold text-gray-500">{cfg.label}</span>
                </div>
                <p className="text-2xl font-black text-gray-900">{counts[s]}</p>
              </div>
            );
          })}
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map(t => (
            <button key={t.key} onClick={() => setFilterStatus(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                filterStatus === t.key ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}>
              {t.label}
              {t.key === '' ? ` (${counts.all})` : t.key && ` (${counts[t.key as CandidatureStatus]})`}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
          </div>
        ) : apps.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-gray-400 font-medium">Aucune candidature</p>
          </div>
        ) : (
          <div className="space-y-3">
            {apps.map(app => {
              const cfg = STATUS_CONFIG[app.status];
              const StatusIcon = cfg.icon;
              const isOpen = expanded === app.id;
              const date = new Date(app.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

              return (
                <div key={app.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Row summary */}
                  <div
                    className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpanded(isOpen ? null : app.id)}
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm">{app.firstName} {app.lastName}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{app.phone} &middot; {app.city} &middot; {date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold px-2.5 py-1.5 rounded-full flex items-center gap-1.5"
                        style={{ color: cfg.color, background: cfg.bg }}>
                        <StatusIcon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div className="border-t border-gray-100 px-6 py-6 space-y-6">
                      {/* Info grid */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <InfoRow icon={Phone}    label="Telephone"   value={app.phone} />
                        <InfoRow icon={Mail}     label="Email"       value={app.email || '—'} />
                        <InfoRow icon={MapPin}   label="Ville"       value={`${app.city} — ${app.zone}`} />
                        <InfoRow icon={Truck}    label="Transport"   value={TRANSPORT_LABELS[app.transportType] || app.transportType} />
                        <InfoRow icon={Calendar} label="Disponibilites" value={app.availability} />
                        <InfoRow icon={CheckCircle2} label="Materiel"  value={app.hasEquipment ? 'Possede le materiel' : 'Pas encore de materiel'} />
                        {app.waveMoneyNumber && <InfoRow icon={FileText} label="Wave Money" value={app.waveMoneyNumber} />}
                      </div>

                      {app.experience && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Experience</p>
                          <p className="text-sm text-gray-700">{app.experience}</p>
                        </div>
                      )}

                      {/* Documents */}
                      {(app.profilePhotoUrl || app.idDocumentUrl || app.otherDocumentUrl) && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Documents</p>
                          <div className="flex flex-wrap gap-3">
                            {app.profilePhotoUrl && (
                              <a href={app.profilePhotoUrl} target="_blank" rel="noreferrer"
                                className="flex items-center gap-2 text-sm text-blue-600 font-semibold bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors">
                                <ExternalLink className="w-3.5 h-3.5" /> Photo de profil
                              </a>
                            )}
                            {app.idDocumentUrl && (
                              <a href={app.idDocumentUrl} target="_blank" rel="noreferrer"
                                className="flex items-center gap-2 text-sm text-blue-600 font-semibold bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors">
                                <ExternalLink className="w-3.5 h-3.5" /> Piece d&apos;identite
                              </a>
                            )}
                            {app.otherDocumentUrl && (
                              <a href={app.otherDocumentUrl} target="_blank" rel="noreferrer"
                                className="flex items-center gap-2 text-sm text-blue-600 font-semibold bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors">
                                <ExternalLink className="w-3.5 h-3.5" /> Document supplementaire
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Admin note */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Note interne</p>
                        {app.adminNote && (
                          <p className="text-sm text-gray-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-3">{app.adminNote}</p>
                        )}
                        <textarea
                          value={noteInputs[app.id] ?? app.adminNote ?? ''}
                          onChange={e => setNoteInputs(n => ({ ...n, [app.id]: e.target.value }))}
                          placeholder="Ajouter une note interne..."
                          rows={2}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 resize-none transition-colors"
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3 pt-2">
                        {(['VALIDATED', 'REJECTED', 'INCOMPLETE', 'PENDING'] as CandidatureStatus[]).filter(s => s !== app.status).map(s => {
                          const c = STATUS_CONFIG[s];
                          const I = c.icon;
                          const loading = actionLoading[`${app.id}_${s}`];
                          return (
                            <button
                              key={s}
                              onClick={() => updateStatus(app.id, s)}
                              disabled={loading}
                              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-60"
                              style={{ background: c.bg, color: c.color, border: `2px solid ${c.color}30` }}
                            >
                              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <I className="w-3.5 h-3.5" />}
                              {c.label}
                            </button>
                          );
                        })}
                        {/* Bouton supprimer */}
                        <button
                          onClick={() => deleteApplication(app.id)}
                          disabled={actionLoading[`${app.id}_delete`]}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-60 ml-auto"
                          style={{ background: '#fef2f2', color: '#dc2626', border: '2px solid #dc262630' }}
                        >
                          {actionLoading[`${app.id}_delete`] ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash className="w-3.5 h-3.5" />}
                          Supprimer definitivement
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-gray-500" />
      </div>
      <div>
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}