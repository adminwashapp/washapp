'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Phone, Mail, CheckCircle } from 'lucide-react';
import { authApi } from '@/lib/api';

type Step = 'form' | 'sent';
type Mode = 'phone' | 'email';

export default function ForgotPasswordPage() {
  const [step, setStep]       = useState<Step>('form');
  const [mode, setMode]       = useState<Mode>('phone');
  const [value, setValue]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [devCode, setDevCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!value.trim()) { setError('Veuillez renseigner ce champ'); return; }
    setLoading(true);
    try {
      const payload = mode === 'phone' ? { phone: value } : { email: value };
      const res = await authApi.forgotPassword(payload);
      setDevCode(res.data._devCode ?? '');
      setStep('sent');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Retour à la connexion
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {step === 'form' ? (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-black text-gray-900">Mot de passe oublié</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Entrez votre identifiant. Vous recevrez un code de réinitialisation.
                </p>
              </div>

              {/* Mode toggle */}
              <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
                {(['phone', 'email'] as Mode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setMode(m); setValue(''); setError(''); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
                      mode === m ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {m === 'phone' ? <Phone className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                    {m === 'phone' ? 'Téléphone' : 'Email'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {mode === 'phone' ? 'Numéro de téléphone' : 'Adresse email'}
                  </label>
                  <input
                    type={mode === 'phone' ? 'tel' : 'email'}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={mode === 'phone' ? '+225 07 00 00 00 00' : 'exemple@email.com'}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-60"
                >
                  {loading ? 'Envoi...' : 'Envoyer le code'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-black text-gray-900">Code envoyé !</h2>
              <p className="text-gray-500 text-sm">
                Un code de réinitialisation a été généré.{' '}
                {mode === 'phone' ? 'Il sera envoyé par SMS à votre numéro.' : 'Vérifiez votre boîte email.'}
              </p>

              {/* Dev mode notice */}
              {devCode && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">Mode développement</p>
                  <p className="text-xs text-amber-600">Code de réinitialisation :</p>
                  <p className="text-2xl font-black text-amber-800 tracking-widest mt-1">{devCode}</p>
                  <p className="text-xs text-amber-500 mt-1">En production, ce code sera envoyé par SMS/email.</p>
                </div>
              )}

              <Link
                href={`/reset-password?${mode}=${encodeURIComponent(value)}`}
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors text-center"
              >
                Saisir mon code
              </Link>
              <button
                onClick={() => { setStep('form'); setValue(''); setDevCode(''); }}
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                Essayer un autre identifiant
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}