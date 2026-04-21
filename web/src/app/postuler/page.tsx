'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { CheckCircle2, ChevronRight, ChevronLeft, Upload, User, Briefcase, CreditCard, FileText, Loader2 } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Informations personnelles', icon: User },
  { id: 2, label: "Activite",                  icon: Briefcase },
  { id: 3, label: 'Paiement',                  icon: CreditCard },
  { id: 4, label: 'Documents',                 icon: FileText },
];

const TRANSPORT_OPTIONS = [
  { key: 'BIKE',      label: 'Velo' },
  { key: 'SCOOTER',   label: 'Scooter / Moto 50cc' },
  { key: 'MOTORBIKE', label: 'Moto' },
];

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  zone: string;
  transportType: string;
  experience: string;
  waveMoneyNumber: string;
  preferredPayment: string;
  profilePhotoUrl: string;
  idDocumentUrl: string;
  otherDocumentUrl: string;
  availability: string;
  hasEquipment: boolean;
};

const initial: FormData = {
  firstName: '', lastName: '', email: '', phone: '', city: '', zone: '',
  transportType: '', experience: '',
  waveMoneyNumber: '', preferredPayment: 'WAVE',
  profilePhotoUrl: '', idDocumentUrl: '', otherDocumentUrl: '',
  availability: 'FULL_TIME',
  hasEquipment: true,
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`${API_URL}/applications/upload`, { method: 'POST', body: fd });
  if (!res.ok) throw new Error('Upload echoue');
  const data = await res.json();
  return data.url as string;
}

export default function PostulerPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initial);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const profileRef = useRef<HTMLInputElement>(null);
  const idRef      = useRef<HTMLInputElement>(null);
  const otherRef   = useRef<HTMLInputElement>(null);

  const set = (k: keyof FormData, v: any) => setForm(f => ({ ...f, [k]: v }));
  const err = (k: string, msg: string) => setErrors(e => ({ ...e, [k]: msg }));
  const clearErr = (k: string) => setErrors(e => { const n = { ...e }; delete n[k]; return n; });

  const validate = () => {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (!form.firstName.trim()) e.firstName = 'Requis';
      if (!form.lastName.trim())  e.lastName  = 'Requis';
      if (!form.phone.trim())     e.phone     = 'Requis';
      if (!form.city.trim())      e.city      = 'Requis';
      if (!form.zone.trim())      e.zone      = 'Requis';
      if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email invalide';
    }
    if (step === 2) {
      if (!form.transportType) e.transportType = 'Requis';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate()) setStep(s => Math.min(s + 1, 4)); };
  const prev = () => setStep(s => Math.max(s - 1, 1));

  const handleUpload = async (field: 'profilePhotoUrl' | 'idDocumentUrl' | 'otherDocumentUrl', file: File) => {
    setUploading(u => ({ ...u, [field]: true }));
    try {
      const url = await uploadFile(file);
      set(field, url);
    } catch {
      alert("Erreur lors de l'upload. Verifiez la taille du fichier (max 10 Mo).");
    } finally {
      setUploading(u => ({ ...u, [field]: false }));
    }
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      await api.post('/applications', {
        ...form,
      });
      setDone(true);
    } catch (e: any) {
      alert(e?.response?.data?.message || "Une erreur est survenue. Verifiez vos informations.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col items-center justify-center px-6 py-16">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-3">Candidature envoyee !</h1>
          <p className="text-gray-500 leading-relaxed mb-8">
            Merci pour votre candidature. Notre equipe va examiner votre dossier et vous contacter dans les meilleurs delais.
          </p>
          <button onClick={() => router.push('/')} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors">
            Retour a l&apos;accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button onClick={() => router.push('/devenir-washer')} className="text-gray-400 hover:text-gray-700 transition-colors text-sm font-medium">
            &larr; Retour
          </button>
          <span className="text-sm font-semibold text-gray-500">Etape {step} sur {STEPS.length}</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = step === s.id;
            const done   = step > s.id;
            return (
              <div key={s.id} className="flex items-center flex-1">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                  active ? 'bg-blue-600 text-white' : done ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {done ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <Icon className="w-4 h-4 flex-shrink-0" />}
                  <span className={`text-xs font-semibold hidden sm:inline ${active ? 'text-white' : ''}`}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${step > s.id ? 'bg-green-300' : 'bg-gray-200'}`} />}
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">

          {/* STEP 1 — Informations personnelles */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-gray-900">Informations personnelles</h2>
                <p className="text-gray-500 text-sm mt-1">Vos coordonnees de base</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Prenom *" error={errors.firstName}>
                  <input value={form.firstName} onChange={e => { set('firstName', e.target.value); clearErr('firstName'); }}
                    className={input(errors.firstName)} placeholder="Jean" />
                </Field>
                <Field label="Nom *" error={errors.lastName}>
                  <input value={form.lastName} onChange={e => { set('lastName', e.target.value); clearErr('lastName'); }}
                    className={input(errors.lastName)} placeholder="Kouassi" />
                </Field>
              </div>
              <Field label="Telephone *" error={errors.phone}>
                <input value={form.phone} onChange={e => { set('phone', e.target.value); clearErr('phone'); }}
                  className={input(errors.phone)} placeholder="+225 07 00 00 00 00" type="tel" />
              </Field>
              <Field label="Email" error={errors.email}>
                <input value={form.email} onChange={e => { set('email', e.target.value); clearErr('email'); }}
                  className={input(errors.email)} placeholder="jean@example.com" type="email" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Ville / Commune *" error={errors.city}>
                  <input value={form.city} onChange={e => { set('city', e.target.value); clearErr('city'); }}
                    className={input(errors.city)} placeholder="Abidjan" />
                </Field>
                <Field label="Zone d'intervention *" error={errors.zone}>
                  <input value={form.zone} onChange={e => { set('zone', e.target.value); clearErr('zone'); }}
                    className={input(errors.zone)} placeholder="Cocody, Plateau..." />
                </Field>
              </div>
            </div>
          )}

          {/* STEP 2 — Activite */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-gray-900">Votre activite</h2>
                <p className="text-gray-500 text-sm mt-1">Comment vous intervenez</p>
              </div>
              <Field label="Moyen de deplacement *" error={errors.transportType}>
                <div className="grid grid-cols-1 gap-2 mt-1">
                  {TRANSPORT_OPTIONS.map(t => (
                    <label key={t.key} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      form.transportType === t.key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="transport" value={t.key}
                        checked={form.transportType === t.key}
                        onChange={() => { set('transportType', t.key); clearErr('transportType'); }}
                        className="accent-blue-600" />
                      <span className={`font-semibold text-sm ${form.transportType === t.key ? 'text-blue-700' : 'text-gray-700'}`}>{t.label}</span>
                    </label>
                  ))}
                </div>
              </Field>
              <Field label="Experience dans le lavage auto (optionnel)">
                <textarea value={form.experience} onChange={e => set('experience', e.target.value)}
                  className={`${input()} resize-none`} rows={3}
                  placeholder="Decrivez brievement votre experience si vous en avez une..." />
              </Field>
            </div>
          )}

          {/* STEP 3 — Paiement */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-gray-900">Informations de paiement</h2>
                <p className="text-gray-500 text-sm mt-1">Pour recevoir vos revenus</p>
              </div>
              <div className="bg-blue-50 rounded-2xl p-4 text-sm text-blue-700 font-medium">
                Vos gains seront verses via Wave Money apres chaque mission validee.
              </div>
              <Field label="Numero Wave Money">
                <input value={form.waveMoneyNumber} onChange={e => set('waveMoneyNumber', e.target.value)}
                  className={input()} placeholder="+225 07 00 00 00 00" type="tel" />
              </Field>
              <Field label="Moyen de paiement prefere">
                <div className="space-y-2 mt-1">
                  {[{ k: 'WAVE', l: 'Wave Money' }, { k: 'CASH', l: 'Especes' }].map(p => (
                    <label key={p.k} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      form.preferredPayment === p.k ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="payment" value={p.k} checked={form.preferredPayment === p.k}
                        onChange={() => set('preferredPayment', p.k)} className="accent-blue-600" />
                      <span className={`font-semibold text-sm ${form.preferredPayment === p.k ? 'text-blue-700' : 'text-gray-700'}`}>{p.l}</span>
                    </label>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {/* STEP 4 — Documents */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-gray-900">Vos documents</h2>
                <p className="text-gray-500 text-sm mt-1">Pour valider votre dossier (JPG, PNG, PDF — max 10 Mo)</p>
              </div>

              <UploadField
                label="Photo de profil"
                hint="Une photo claire de votre visage"
                value={form.profilePhotoUrl}
                loading={uploading.profilePhotoUrl}
                inputRef={profileRef}
                onChange={f => handleUpload('profilePhotoUrl', f)}
              />
              <UploadField
                label="Piece d'identite"
                hint="CNI, passeport ou permis de conduire"
                value={form.idDocumentUrl}
                loading={uploading.idDocumentUrl}
                inputRef={idRef}
                onChange={f => handleUpload('idDocumentUrl', f)}
              />
              <UploadField
                label="Document supplementaire (optionnel)"
                hint="Tout autre justificatif utile"
                value={form.otherDocumentUrl}
                loading={uploading.otherDocumentUrl}
                inputRef={otherRef}
                onChange={f => handleUpload('otherDocumentUrl', f)}
              />

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <p className="text-amber-800 text-sm font-medium">
                  En soumettant ce formulaire, vous acceptez que Washapp utilise vos informations pour traiter votre candidature.
                  Vos donnees sont traitees de facon confidentielle.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
            {step > 1 && (
              <button onClick={prev} className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:border-gray-300 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Precedent
              </button>
            )}
            <div className="flex-1" />
            {step < 4 ? (
              <button onClick={next} className="flex items-center gap-2 bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                Suivant <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={submitting}
                className="flex items-center gap-2 bg-green-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-200 disabled:opacity-60"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Envoyer ma candidature
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Helper components
function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function input(error?: string) {
  return `w-full border-2 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none transition-colors ${
    error ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
  } bg-white`;
}

function UploadField({
  label, hint, value, loading, inputRef, onChange,
}: {
  label: string; hint: string; value: string; loading?: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>; onChange: (f: File) => void;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-1">{label}</p>
      <p className="text-xs text-gray-400 mb-2">{hint}</p>
      <input ref={inputRef} type="file" accept="image/*,.pdf" className="hidden"
        onChange={e => { if (e.target.files?.[0]) onChange(e.target.files[0]); }} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className={`w-full border-2 border-dashed rounded-xl py-5 flex flex-col items-center gap-2 transition-all ${
          value ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
        } disabled:opacity-60`}
      >
        {loading ? (
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
        ) : value ? (
          <>
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            <span className="text-green-700 text-xs font-semibold">Fichier uploade</span>
          </>
        ) : (
          <>
            <Upload className="w-6 h-6 text-gray-400" />
            <span className="text-gray-500 text-xs font-medium">Cliquez pour choisir un fichier</span>
          </>
        )}
      </button>
    </div>
  );
}
