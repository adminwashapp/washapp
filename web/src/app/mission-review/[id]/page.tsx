'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

const BEFORE_PHOTOS = [
  'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=600',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
];
const AFTER_PHOTOS = [
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600',
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600',
];

type Step = 'photos' | 'rating' | 'claim' | 'done';

export default function MissionReviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [rating, setRating] = useState(0);
  const [step, setStep] = useState<Step>('photos');
  const [wantsClaim, setWantsClaim] = useState<boolean | null>(null);
  const [claimText, setClaimText] = useState('');
  const [loading, setLoading] = useState(false);
  const [hoverStar, setHoverStar] = useState(0);

  const ratingLabel = (r: number) => {
    if (r === 5) return 'Excellent !';
    if (r === 4) return 'Tres bien';
    if (r === 3) return 'Bien';
    if (r === 2) return 'Peut mieux faire';
    return 'Decevant';
  };

  const submitReview = async (withClaim: boolean) => {
    setLoading(true);
    try {
      await fetch(`/api/missions/${id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment: withClaim ? claimText : undefined }),
      });
      setStep('done');
    } catch {
      alert("Impossible d'enregistrer votre avis. Veuillez reessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleRatingDone = () => {
    if (rating === 0) return;
    if (rating === 5) submitReview(false);
    else setStep('claim');
  };

  if (step === 'done') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
        <div className="text-8xl mb-8">{rating === 5 ? '\uD83D\uDE4C' : '\uD83D\uDC4D'}</div>
        <h1 className="text-3xl font-black text-gray-900 text-center mb-4">Merci pour votre confiance&nbsp;!</h1>
        <p className="text-gray-500 text-center max-w-sm leading-relaxed mb-10">
          {rating === 5
            ? 'Votre retour a ete enregistre. A tres bientot !'
            : 'Votre reclamation a ete envoyee. Notre equipe la traite rapidement.'}
        </p>
        <button
          onClick={() => router.push('/account')}
          className="bg-blue-600 text-white font-bold px-10 py-4 rounded-xl hover:bg-blue-700 transition-colors"
        >
          Retour a mes missions
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <span className="text-gray-700 font-bold text-lg">&larr;</span>
        </button>
        <h1 className="text-lg font-bold text-gray-900">
          {step === 'photos' ? 'Photos du service' : step === 'rating' ? 'Votre avis' : 'Reclamation'}
        </h1>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-8">

        {/* STEP: PHOTOS */}
        {step === 'photos' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Photos avant la prestation</h2>
              <div className="grid grid-cols-2 gap-4">
                {BEFORE_PHOTOS.map((src, i) => (
                  <div key={i} className="relative h-52 rounded-2xl overflow-hidden shadow-md">
                    <Image src={src} alt={`Avant ${i + 1}`} fill className="object-cover" unoptimized />
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-gray-200" />
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Photos apres la prestation</h2>
              <div className="grid grid-cols-2 gap-4">
                {AFTER_PHOTOS.map((src, i) => (
                  <div key={i} className="relative h-52 rounded-2xl overflow-hidden shadow-md">
                    <Image src={src} alt={`Apres ${i + 1}`} fill className="object-cover" unoptimized />
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => setStep('rating')}
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
            >
              Continuer &rarr;
            </button>
          </div>
        )}

        {/* STEP: RATING */}
        {step === 'rating' && (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-black text-gray-900">Est-ce que tout s&apos;est bien pass&eacute;&nbsp;?</h2>
            <p className="text-gray-500">Notez votre experience avec votre washer</p>
            <div className="flex justify-center gap-3 py-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverStar(star)}
                  onMouseLeave={() => setHoverStar(0)}
                  onClick={() => setRating(star)}
                  className="text-5xl transition-transform hover:scale-110 focus:outline-none"
                >
                  <span className={(hoverStar >= star || rating >= star) ? 'text-yellow-400' : 'text-gray-200'}>
                    {(hoverStar >= star || rating >= star) ? '\u2605' : '\u2606'}
                  </span>
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-yellow-500 font-bold text-lg">{ratingLabel(rating)}</p>
            )}
            <button
              onClick={handleRatingDone}
              disabled={rating === 0 || loading}
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enregistrement...' : 'Valider mon avis'}
            </button>
          </div>
        )}

        {/* STEP: CLAIM choice */}
        {step === 'claim' && wantsClaim === null && (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-black text-gray-900">Souhaitez-vous faire une r&eacute;clamation&nbsp;?</h2>
            <p className="text-gray-500">
              Vous avez attribu&eacute; {rating} {rating > 1 ? 'etoiles' : 'etoile'}.<br />
              Souhaitez-vous signaler un probl&egrave;me&nbsp;?
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setWantsClaim(true)}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
              >
                Oui, je signale
              </button>
              <button
                onClick={() => submitReview(false)}
                disabled={loading}
                className="w-full border-2 border-blue-600 text-blue-600 font-bold py-4 rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                {loading ? 'Enregistrement...' : "Non, c\u2019est bon"}
              </button>
            </div>
          </div>
        )}

        {/* STEP: CLAIM form */}
        {step === 'claim' && wantsClaim === true && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900">Expliquez le probl&egrave;me</h2>
            <p className="text-gray-500">Votre r&eacute;clamation sera trait&eacute;e dans les plus brefs d&eacute;lais.</p>
            <textarea
              value={claimText}
              onChange={(e) => setClaimText(e.target.value)}
              placeholder="D&eacute;crivez le probl&egrave;me rencontr&eacute;..."
              rows={6}
              className="w-full border-2 border-gray-200 rounded-xl p-4 text-gray-900 text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
            <button
              onClick={() => submitReview(true)}
              disabled={loading || claimText.trim().length < 10}
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Envoi...' : 'Envoyer la r\u00e9clamation'}
            </button>
            <button
              onClick={() => submitReview(false)}
              className="w-full text-gray-400 font-semibold py-3 hover:text-gray-600 transition-colors"
            >
              Ignorer et terminer
            </button>
          </div>
        )}

      </main>
    </div>
  );
}