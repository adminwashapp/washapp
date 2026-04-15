'use client'
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, CheckCircle, KeyRound } from 'lucide-react';
import { authApi } from '@/lib/api';

function ResetPasswordContent() {
  const router       = useRouter();
  const params       = useSearchParams();
  const [phone, setPhone]       = useState('');
  const [email, setEmail]       = useState('');
  const [code, setCode]         = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [done, setDone]         = useState(false);

  useEffect(() => {
    setPhone(params.get('phone') ?? '');
    setEmail(params.get('email') ?? '');
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!code.trim() || code.length !== 6) { setError('Le code doit contenir 6 chiffres'); return; }
    if (password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères'); return; }
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas'); return; }

    setLoading(true);
    try {
      const payload: any = { code, newPassword: password };
      if (phone) payload.phone = phone;
      else if (email) payload.email = email;
      await authApi.resetPassword(payload);
      setDone(true);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Code invalide ou expiré');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center space-y-5">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Mot de passe modifié !</h2>
          <p className="text-gray-500 text-sm">Votre mot de passe a été mis à jour avec succès. Vous pouvez maintenant vous connecter.</p>
          <Link href="/login" className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/forgot-password" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Retour
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <KeyRound className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-black text-gray-900">Nouveau mot de passe</h1>
            <p className="text-gray-500 text-sm mt-1">
              Saisissez le code reçu et choisissez un nouveau mot de passe.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Code OTP */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Code de vérification (6 chiffres)</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="_ _ _ _ _ _"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl font-bold tracking-widest"
              />
            </div>

            {/* New password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nouveau mot de passe</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 caractères"
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmer le mot de passe</label>
              <input
                type={showPwd ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Répétez le mot de passe"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Password strength indicator */}
            {password.length > 0 && (
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                    password.length >= i * 3 ? (password.length >= 10 ? 'bg-green-500' : 'bg-amber-400') : 'bg-gray-200'
                  }`} />
                ))}
              </div>
            )}

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
              {loading ? 'Mise à jour...' : 'Réinitialiser le mot de passe'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-4">
            Code expiré ?{' '}
            <Link href="/forgot-password" className="text-blue-600 hover:underline font-semibold">
              Renvoyer un code
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
import { Suspense } from 'react';
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}