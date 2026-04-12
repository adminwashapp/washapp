'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Phone, Mail, ArrowRight } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store';

type LoginMode = 'phone' | 'email';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [mode, setMode] = useState<LoginMode>('phone');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.loginClient(
        mode === 'phone' ? { phone, password } : { email, password }
      );
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      const params = new URLSearchParams(window.location.search);
      router.push(params.get('redirect') || '/booking');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Identifiants invalides');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    window.location.href = `${api}/auth/google`;
  };

  const handleDemo = () => {
    setAuth(
      { id: 'demo-001', name: 'Lohrans Demo', phone: '07 00 00 00 00', email: 'demo@washapp.ci', role: 'CLIENT' },
      'demo-token-preview',
      'demo-refresh-preview'
    );
    router.push('/account');
  };

  return (
    <div className="h-screen overflow-hidden flex">

      {/* GAUCHE — formulaire */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-24 py-12 bg-white overflow-y-auto">

        <div className="max-w-[400px] w-full">
          <h1 className="text-[2rem] font-bold text-gray-900 mb-2 leading-tight">
            Bon retour !
          </h1>
          <p className="text-gray-400 text-[15px] mb-8">
            Connectez-vous a votre compte client
          </p>

          {/* Bouton demo */}
          <button
            onClick={handleDemo}
            className="w-full flex items-center justify-center gap-3 bg-blue-50 border border-blue-200 rounded-2xl py-3.5 text-[15px] font-semibold text-[#1558f5] hover:bg-blue-100 transition-colors mb-3">
            Acceder au compte demo (sans backend)
          </button>

          {/* Google */}
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-2xl py-3.5 text-[15px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors mb-4">
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
              <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.826.957 4.039l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continuer avec Google
          </button>

          {/* Separateur */}
          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[13px] text-gray-400 font-medium">ou</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Toggle telephone / email */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            {(['phone', 'email'] as LoginMode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-semibold transition-all ${
                  mode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}>
                {m === 'phone' ? <Phone className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}
                {m === 'phone' ? 'Telephone' : 'Email'}
              </button>
            ))}
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {mode === 'phone' ? (
              <div>
                <label className="block text-[13px] font-medium text-gray-600 mb-1.5">
                  Numero de telephone
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="07 00 00 00 00"
                    required
                    className="input-field pl-11"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-[13px] font-medium text-gray-600 mb-1.5">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.com"
                    required
                    className="input-field pl-11"
                  />
                </div>
              </div>
            )}

            <div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[13px] font-medium text-gray-600">
                  Mot de passe
                </label>
                <a href="/forgot-password" className="text-xs text-blue-600 hover:underline font-semibold">
                  Mot de passe oublié ?
                </a>
              </div>
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-field pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-[15px] py-4 mt-2 flex items-center justify-center gap-2">
              {loading ? 'Connexion...' : (
                <>Se connecter <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-[13px] text-gray-400 mt-6">
            Pas encore de compte ?{' '}
            <Link href="/register" className="text-[#1558f5] font-semibold hover:underline">
              Creer un compte
            </Link>
          </p>

          <p className="text-center text-[13px] text-gray-400 mt-3">
            Vous voulez commander sans compte ?{' '}
            <Link href="/booking" className="text-[#1558f5] font-semibold hover:underline">
              Commander directement
            </Link>
          </p>
        </div>
      </div>

      {/* DROITE — image */}
      <div className="hidden lg:block relative w-[48%] flex-shrink-0">
        <Image
          src="/manphone.png"
          alt="Washapp service"
          fill
          className="object-cover object-top"
          priority
        />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(10,20,60,0.18) 0%, rgba(10,20,60,0.08) 60%, transparent 100%)' }}
        />
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-xl text-center">
          <p className="text-[13px] font-bold text-gray-900 mb-0.5">Service disponible a Abidjan</p>
          <p className="text-[12px] text-gray-400">Washers professionnels · 7j/7</p>
        </div>
      </div>
    </div>
  );
}
