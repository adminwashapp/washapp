import Link from 'next/link';
import { Shield, Lock, Eye, Server, Trash2, Mail } from 'lucide-react';

export const metadata = {
  title: 'Politique de confidentialité — Washapp',
  description: 'Comment Washapp collecte, utilise et protège vos données personnelles.',
};

const SECTIONS = [
  {
    icon: Eye,
    title: '1. Données collectées',
    content: [
      {
        subtitle: 'Lors de votre inscription',
        items: [
          'Nom et prénom',
          'Numéro de téléphone',
          'Adresse email',
          'Mot de passe (haché, jamais stocké en clair)',
        ],
      },
      {
        subtitle: 'Lors d\'une réservation',
        items: [
          'Adresse de la prestation',
          'Localisation GPS (position du client ou du washer)',
          'Plaque d\'immatriculation du véhicule',
          'Marque, modèle et couleur du véhicule',
          'Type de prestation choisie',
        ],
      },
      {
        subtitle: 'Lors des paiements',
        items: [
          'Numéro de téléphone Wave Money',
          'Historique des transactions',
          'Montants et dates',
        ],
      },
      {
        subtitle: 'Données techniques',
        items: [
          'Adresse IP',
          'Type de navigateur ou appareil',
          'Journaux d\'utilisation (logs)',
        ],
      },
    ],
  },
  {
    icon: Lock,
    title: '2. Finalités du traitement',
    content: [
      {
        subtitle: null,
        items: [
          'Création et gestion de votre compte client ou washer',
          'Mise en relation entre clients et washers',
          'Traitement des réservations et suivi des missions',
          'Traitement des paiements et émission des factures',
          'Envoi de notifications relatives à vos missions',
          'Amélioration des services Washapp',
          'Gestion des litiges et réclamations',
          'Respect de nos obligations légales',
        ],
      },
    ],
  },
  {
    icon: Server,
    title: '3. Conservation des données',
    content: [
      {
        subtitle: null,
        items: [
          'Données de compte : pendant toute la durée de votre inscription, et 3 ans après clôture',
          'Données de mission : 5 ans (obligations comptables et fiscales)',
          'Données de paiement : 10 ans (loi comptable OHADA)',
          'Journaux techniques : 12 mois',
          'Photos de mission (avant/après) : 6 mois après validation de la mission',
        ],
      },
    ],
  },
  {
    icon: Shield,
    title: '4. Partage des données',
    content: [
      {
        subtitle: 'Nous partageons vos données uniquement avec :',
        items: [
          'Le washer attribué à votre mission (nom, adresse de prestation, numéro de téléphone si nécessaire)',
          'Nos prestataires techniques (hébergement, paiement) soumis à des obligations de confidentialité',
          'Les autorités compétentes en cas d\'obligation légale',
        ],
      },
      {
        subtitle: 'Nous ne vendons jamais vos données à des tiers.',
        items: [],
      },
    ],
  },
  {
    icon: Lock,
    title: '5. Sécurité',
    content: [
      {
        subtitle: null,
        items: [
          'Mots de passe hachés (bcrypt) — jamais stockés en clair',
          'Communications chiffrées via HTTPS / TLS',
          'Accès aux données restreint au personnel habilité',
          'Authentification par token JWT sécurisé',
          'Journaux d\'accès et surveillance des anomalies',
        ],
      },
    ],
  },
  {
    icon: Eye,
    title: '6. Vos droits',
    content: [
      {
        subtitle: 'Conformément à la réglementation applicable, vous disposez des droits suivants :',
        items: [
          'Droit d\'accès : obtenir une copie de vos données',
          'Droit de rectification : corriger des informations inexactes',
          'Droit à l\'effacement : demander la suppression de votre compte et données associées',
          'Droit à la portabilité : recevoir vos données dans un format structuré',
          'Droit d\'opposition : vous opposer à certains traitements',
          'Droit de retrait du consentement : à tout moment, sans effet rétroactif',
        ],
      },
    ],
  },
  {
    icon: Trash2,
    title: '7. Cookies et traceurs',
    content: [
      {
        subtitle: null,
        items: [
          'Cookies de session : nécessaires au fonctionnement de l\'application (pas de consentement requis)',
          'Cookies analytiques : uniquement avec votre consentement',
          'Aucune publicité ciblée ni tracking marketing tiers',
          'Vous pouvez désactiver les cookies dans les paramètres de votre navigateur',
        ],
      },
    ],
  },
];

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600/20 border border-blue-500/30 rounded-2xl mb-5">
            <Shield className="w-7 h-7 text-blue-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
            Politique de confidentialité
          </h1>
          <p className="text-slate-400 text-sm">
            Dernière mise à jour : janvier 2026 · Washapp — Abidjan, Côte d&apos;Ivoire
          </p>
        </div>
      </div>

      {/* Intro */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-10">
          <p className="text-sm text-blue-800 leading-relaxed">
            Washapp s&apos;engage à protéger vos données personnelles. Cette politique explique
            quelles données nous collectons, pourquoi, comment nous les protégeons et quels
            sont vos droits. En utilisant Washapp, vous acceptez les termes ci-dessous.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 bg-gray-50">
                  <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4.5 h-4.5 text-blue-600" />
                  </div>
                  <h2 className="text-base font-black text-gray-900">{section.title}</h2>
                </div>
                <div className="px-6 py-5 space-y-5">
                  {section.content.map((block, bi) => (
                    <div key={bi}>
                      {block.subtitle && (
                        <p className={`text-sm mb-3 ${
                          block.items.length === 0
                            ? 'font-bold text-gray-900'
                            : 'font-semibold text-gray-700'
                        }`}>
                          {block.subtitle}
                        </p>
                      )}
                      {block.items.length > 0 && (
                        <ul className="space-y-2">
                          {block.items.map((item, ii) => (
                            <li key={ii} className="flex items-start gap-2.5 text-sm text-gray-600">
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact */}
        <div className="mt-10 bg-slate-900 rounded-2xl p-8 text-center">
          <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-lg font-black text-white mb-2">Exercer vos droits</h3>
          <p className="text-slate-400 text-sm mb-5 max-w-md mx-auto">
            Pour toute demande relative à vos données personnelles, contactez-nous.
            Nous répondons sous 30 jours ouvrés.
          </p>
          <a
            href="mailto:privacy@washapp.ci"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors"
          >
            <Mail className="w-4 h-4" />
            privacy@washapp.ci
          </a>
        </div>

        {/* Footer nav */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8 pb-8 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-700">Accueil</Link>
          <span>·</span>
          <Link href="/legal" className="hover:text-gray-700">Mentions légales</Link>
          <span>·</span>
          <Link href="/faq" className="hover:text-gray-700">FAQ</Link>
        </div>
      </div>
    </div>
  );
}