'use client';

declare const google: any;

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader } from '@googlemaps/js-api-loader';
import {
  MapPin, Zap, Calendar, Phone, Mail, User, Lock,
  Car, Check, AlertCircle, ArrowRight,
  Clock,
} from 'lucide-react';
import { api, missionsApi, paymentsApi } from '@/lib/api';
import { useAuthStore } from '@/store';

const SERVICES = [
  { key: 'EXTERIOR', label: 'Exterieur', basePrice: 1500, icon: '🚿', desc: 'Carrosserie, vitres, jantes' },
  { key: 'INTERIOR', label: 'Interieur', basePrice: 2500, icon: '✨', desc: 'Sieges, tableau de bord, tapis' },
  { key: 'FULL', label: 'Complet', basePrice: 4000, icon: '⭐', desc: 'Exterieur + interieur' },
] as const;

const VEHICLE_TYPES = [
  { key: 'standard', label: 'Citadine / Berline', desc: 'Voiture compacte ou standard', surcharge: 0 },
  { key: 'large', label: 'SUV / 4x4 / Break', desc: 'Grand gabarit', surcharge: 500 },
] as const;

function BookingContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { isAuthenticated, user, setAuth } = useAuthStore();

  const [mode, setMode] = useState<'instant' | 'booking'>(
    params.get('mode') === 'booking' ? 'booking' : 'instant'
  );
  const isBookingMode = mode === 'booking';

  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phase, setPhase] = useState<'form' | 'searching' | 'done'>('form');
  const [missionId, setMissionId] = useState('');

  const [address, setAddress] = useState('');
  const [lat, setLat] = useState(5.3484);
  const [lng, setLng] = useState(-4.0169);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');

  const [vehicleType, setVehicleType] = useState<'standard' | 'large'>('standard');
  const [service, setService] = useState<'EXTERIOR' | 'INTERIOR' | 'FULL'>('EXTERIOR');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'WAVE_MONEY' | 'CASH'>('WAVE_MONEY');

  const currentService = SERVICES.find((s) => s.key === service)!;
  const surcharge = VEHICLE_TYPES.find((v) => v.key === vehicleType)!.surcharge;
  const totalPrice = currentService.basePrice + surcharge;

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '',
      version: 'weekly',
      libraries: ['places'],
    });
    loader.load().then(() => setMapLoaded(true)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = new google.maps.Map(mapRef.current, {
      center: { lat, lng },
      zoom: 14,
      disableDefaultUI: true,
      zoomControl: true,
      styles: [
        { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'off' }] },
      ],
    });
    const marker = new google.maps.Marker({
      position: { lat, lng },
      map,
      draggable: true,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#1558f5',
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 3,
      },
    });
    const geocoder = new google.maps.Geocoder();
    const updatePos = (lt: number, ln: number) => {
      geocoder.geocode({ location: { lat: lt, lng: ln } }, (res: any, st: any) => {
        if (st === 'OK' && res?.[0]) setAddress(res[0].formatted_address);
      });
    };
    navigator.geolocation?.getCurrentPosition((pos) => {
      const lt = pos.coords.latitude;
      const ln = pos.coords.longitude;
      map.setCenter({ lat: lt, lng: ln });
      marker.setPosition({ lat: lt, lng: ln });
      updatePos(lt, ln);
    });
    marker.addListener('dragend', () => {
      const p = marker.getPosition();
      if (p) updatePos(p.lat(), p.lng());
    });
    map.addListener('click', (e: any) => {
      if (e.latLng) {
        marker.setPosition(e.latLng);
        updatePos(e.latLng.lat(), e.latLng.lng());
      }
    });
    const input = document.getElementById('address-input') as HTMLInputElement;
    if (input) {
      const autocomplete = new google.maps.places.Autocomplete(input, {
        componentRestrictions: { country: 'ci' },
      });
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry?.location) {
          const lt = place.geometry.location.lat();
          const ln = place.geometry.location.lng();
          map.setCenter({ lat: lt, lng: ln });
          marker.setPosition({ lat: lt, lng: ln });
          setAddress(place.formatted_address || place.name || '');
          setLat(lt);
          setLng(ln);
        }
      });
    }
  }, [mapLoaded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !phone) { setError('Adresse et numero de telephone requis'); return; }
    setError('');
    setLoading(true);
    setPhase('searching');
    try {
      if (!isAuthenticated) {
        const res = await api.post('/auth/register-client', {
          name: name || phone, phone,
          email: email || undefined,
          password: password || phone,
        });
        setAuth(res.data.user, res.data.accessToken, res.data.refreshToken || '');
      }
      const scheduledAt = isBookingMode && scheduledDate && scheduledTime
        ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
        : undefined;
      const res = await missionsApi.create({
        fullAddress: address, lat, lng,
        missionType: isBookingMode ? 'BOOKING' : 'INSTANT',
        serviceType: service, paymentMethod, scheduledAt,
      });
      setMissionId(res.data.id);
      
      setPhase('done');
      setTimeout(() => router.push(`/mission/${res.data.id}`), 1500);
    } catch (e: any) {
      const msg = e.response?.data?.message || '';
      if (msg.includes('existe') || msg.includes('already') || msg.includes('Conflict')) {
        try {
          const loginRes = await api.post('/auth/login-client', { phone, password: password || phone });
          setAuth(loginRes.data.user, loginRes.data.accessToken, loginRes.data.refreshToken || '');
          const scheduledAt = isBookingMode && scheduledDate && scheduledTime
            ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
            : undefined;
          const res = await missionsApi.create({
            fullAddress: address, lat, lng,
            missionType: isBookingMode ? 'BOOKING' : 'INSTANT',
            serviceType: service, paymentMethod, scheduledAt,
          });
          setMissionId(res.data.id);
          
          setPhase('done');
          setTimeout(() => router.push(`/mission/${res.data.id}`), 1500);
        } catch {
          setError('Ce numero est deja utilise. Connectez-vous dabord.');
          setPhase('form');
        }
      } else {
        setError(msg || 'Une erreur est survenue. Reessayez.');
        setPhase('form');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col-reverse lg:flex-row overflow-auto lg:overflow-hidden">
        {/* GAUCHE formulaire */}
        <div className="lg:w-[480px] xl:w-[520px] flex-shrink-0 overflow-y-auto bg-white border-r border-gray-100">
          <div className="p-6 lg:p-8">

            {phase === 'done' ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Mission cree !</h2>
                <p className="text-gray-500 text-sm">Redirection vers le suivi...</p>
              </div>
            ) : phase === 'searching' ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                  <Zap className="w-8 h-8 text-[#1558f5]" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Recherche en cours</h2>
                <p className="text-gray-400 text-sm">On cherche le washer le plus proche disponible</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-7">

                {/* TOGGLE TABS */}
                <div className="bg-gray-100 rounded-2xl p-1 flex gap-1">
                  <button
                    type="button"
                    onClick={() => setMode('instant')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-[13.5px] font-bold transition-all duration-200 ${
                      mode === 'instant'
                        ? 'bg-white shadow-sm text-gray-900'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Zap className={`w-4 h-4 flex-shrink-0 ${mode === 'instant' ? 'text-yellow-500' : 'text-gray-400'}`} />
                    Demande instantanee
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('booking')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-[13.5px] font-bold transition-all duration-200 ${
                      mode === 'booking'
                        ? 'bg-white shadow-sm text-gray-900'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Calendar className={`w-4 h-4 flex-shrink-0 ${mode === 'booking' ? 'text-[#1558f5]' : 'text-gray-400'}`} />
                    Reservation
                  </button>
                </div>

                <div>
                  <p className="text-[13px] text-gray-400">
                    {isBookingMode
                      ? "Choisissez une date et un creneau - on vous envoie un washer a l'heure prevue."
                      : "Aucun compte requis - votre profil est cree automatiquement"}
                  </p>
                </div>

                {error && (
                  <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* 1. Adresse */}
                <section>
                  <h2 className="text-[13px] font-bold text-gray-500 uppercase tracking-wide mb-3">1 · Votre adresse</h2>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="address-input"
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Ex : Cocody, Abidjan"
                      required
                      className="input-field pl-10 text-[14px]"
                    />
                  </div>
                  <p className="text-[12px] text-gray-400 mt-1.5">Deplacez le pin sur la carte si besoin</p>
                </section>

                {/* 2. Type de vehicule */}
                <section>
                  <h2 className="text-[13px] font-bold text-gray-500 uppercase tracking-wide mb-3">2 · Type de vehicule</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {VEHICLE_TYPES.map(({ key, label, desc, surcharge: s }) => (
                      <button key={key} type="button" onClick={() => setVehicleType(key as any)}
                        className={`text-left p-3.5 rounded-xl border-2 transition-all ${
                          vehicleType === key ? 'border-[#1558f5] bg-blue-50' : 'border-gray-200 hover:border-blue-200'
                        }`}>
                        <Car className="w-4 h-4 mb-2 text-gray-600" />
                        <p className="text-[13px] font-semibold text-gray-900">{label}</p>
                        <p className="text-[11px] text-gray-400">{desc}</p>
                        {s > 0 && <p className="text-[11px] font-semibold text-[#1558f5] mt-1">+{s} FCFA</p>}
                      </button>
                    ))}
                  </div>
                </section>

                {/* 3. Type de lavage */}
                <section>
                  <h2 className="text-[13px] font-bold text-gray-500 uppercase tracking-wide mb-3">3 · Type de lavage</h2>
                  <div className="space-y-2.5">
                    {SERVICES.map(({ key, label, basePrice, icon, desc }) => (
                      <button key={key} type="button" onClick={() => setService(key as any)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                          service === key ? 'border-[#1558f5] bg-blue-50' : 'border-gray-200 hover:border-blue-200'
                        }`}>
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{icon}</span>
                          <div className="text-left">
                            <p className="text-[14px] font-semibold text-gray-900">{label}</p>
                            <p className="text-[12px] text-gray-400">{desc}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-[14px] font-bold text-[#1558f5]">{(basePrice + surcharge).toLocaleString()} FCFA</p>
                          {service === key && <Check className="w-4 h-4 text-[#1558f5] ml-auto" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </section>

                {/* 4. Date + heure (booking seulement) */}
                {isBookingMode && (
                  <section>
                    <h2 className="text-[13px] font-bold text-gray-500 uppercase tracking-wide mb-3">4 · Date et heure</h2>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[12px] text-gray-500 mb-1.5">Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input type="date" required={isBookingMode}
                            min={new Date(Date.now() + 2 * 3600000).toISOString().split('T')[0]}
                            value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)}
                            className="input-field pl-9 text-[13px]" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[12px] text-gray-500 mb-1.5">Heure</label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input type="time" required={isBookingMode}
                            value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)}
                            className="input-field pl-9 text-[13px]" />
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* 4/5. Vos infos */}
                <section>
                  <h2 className="text-[13px] font-bold text-gray-500 uppercase tracking-wide mb-3">
                    {isBookingMode ? '5' : '4'} · Vos informations
                  </h2>
                  {isAuthenticated ? (
                    <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="w-9 h-9 bg-[#1558f5] rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-gray-900">{user?.name}</p>
                        <p className="text-[12px] text-gray-500">{user?.phone}</p>
                      </div>
                      <Check className="w-4 h-4 text-[#1558f5] ml-auto" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[12px] text-gray-500 mb-1.5">Prenom <span className="text-gray-300">(optionnel)</span></label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                              placeholder="Kouame" className="input-field pl-9 text-[13px]" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[12px] text-gray-500 mb-1.5">Telephone <span className="text-red-400">*</span></label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                              placeholder="07 XX XX XX XX" required className="input-field pl-9 text-[13px]" />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[12px] text-gray-500 mb-1.5">Email <span className="text-gray-300">(optionnel)</span></label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                            placeholder="vous@exemple.com" className="input-field pl-9 text-[13px]" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[12px] text-gray-500 mb-1.5">Mot de passe <span className="text-gray-300">(optionnel)</span></label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                            placeholder="Pour retrouver votre compte" className="input-field pl-9 text-[13px]" />
                        </div>
                      </div>
                      <p className="text-[12px] text-gray-400">
                        Deja un compte ?{' '}
                        <Link href="/login?redirect=/booking" className="text-[#1558f5] font-semibold">Se connecter</Link>
                      </p>
                    </div>
                  )}
                </section>

                {/* 5/6. Paiement */}
                <section>
                  <h2 className="text-[13px] font-bold text-gray-500 uppercase tracking-wide mb-3">
                    {isBookingMode ? '6' : '5'} · Paiement
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setPaymentMethod('WAVE_MONEY')}
                      className={`p-3.5 rounded-xl border-2 text-center transition-all ${
                        paymentMethod === 'WAVE_MONEY' ? 'border-[#00b9f5] bg-blue-50' : 'border-gray-200'
                      }`}>
                      <p className="text-[13px] font-bold text-gray-900">Wave Money</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Paiement apres la prestation</p>
                    </button>
                    <button type="button" onClick={() => setPaymentMethod('CASH')}
                      className={`p-3.5 rounded-xl border-2 text-center transition-all ${
                        paymentMethod === 'CASH' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                      }`}>
                      <p className="text-[13px] font-bold text-gray-900">Especes</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Directement au washer</p>
                    </button>
                  </div>
                </section>

                {/* Recap + CTA */}
                <div className="sticky bottom-0 bg-white pt-4 pb-2 -mx-8 px-8 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-[13px] text-gray-500">{currentService.label} · {VEHICLE_TYPES.find(v => v.key === vehicleType)!.label}</p>
                      <p className="text-[22px] font-extrabold text-gray-900">{totalPrice.toLocaleString()} <span className="text-[14px] font-medium text-gray-400">FCFA</span></p>
                    </div>
                    <button type="submit" disabled={loading || !address || !phone}
                      className="btn-primary px-8 py-4 text-[15px] flex items-center gap-2 disabled:opacity-50">
                      {loading ? 'En cours...' : (
                        <>{isBookingMode ? 'Reserver' : 'Commander'}<ArrowRight className="w-4 h-4" /></>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* DROITE carte */}
        <div className="flex-1 relative min-h-[300px] lg:min-h-0 bg-gray-100">
        <div className="flex-1 relative h-[280px] lg:h-auto lg:min-h-0 bg-gray-100 order-first lg:order-last">
          {!mapLoaded && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-[#1558f5] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-[13px] text-gray-400">Chargement de la carte</p>
              </div>
            </div>
          )}
          <div className="absolute top-4 right-4 bg-white rounded-xl shadow-md px-3 py-2 text-[12px] text-gray-600 font-medium">
            Deplacez le pin pour ajuster
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense>
      <BookingContent />
    </Suspense>
  );
}
