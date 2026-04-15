'use client';

import { useState } from 'react';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

type FaqItem = { q: string; a: string };
type Section = { id: string; title: string | null; items: FaqItem[] };
type Group  = { id: string; title: string; emoji: string; sections: Section[] };

const groups: Group[] = [
  {
    id: 'general', title: 'Questions generales', emoji: '💡',
    sections: [{
      id: 'gen', title: null,
      items: [
        { q: "Comment reserver un lavage sur Washapp ?", a: "Vous pouvez reserver directement depuis Washapp en indiquant votre localisation, le type de lavage souhaite, les informations sur votre vehicule et le creneau disponible propose sur la plateforme." },
        { q: "Quand dois-je payer la prestation ?", a: "Le paiement doit etre effectue avant le debut de la prestation. Sans paiement prealable, le washer n'est pas tenu de commencer le lavage." },
        { q: "Puis-je payer en especes ?", a: "Oui. Le paiement en especes est autorise, mais il doit obligatoirement etre remis avant le debut du lavage." },
        { q: "Puis-je annuler ma reservation ?", a: "Oui. Vous pouvez annuler sans frais jusqu'a 1 heure avant l'heure prevue de la prestation." },
        { q: "Que se passe-t-il si j'annule moins d'1 heure avant ?", a: "En cas d'annulation tardive, 50 % du prix de la prestation peuvent etre retenus pour couvrir les frais de deplacement, d'organisation et de mobilisation du washer." },
        { q: "Que se passe-t-il si je suis en retard ?", a: "Des frais d'attente peuvent s'appliquer a partir de 3 minutes d'attente." },
        { q: "Que se passe-t-il apres 10 minutes d'attente ?", a: "A partir de 10 minutes d'attente, le washer peut annuler la prestation. Dans ce cas, il percevra 1 500 F CFA au titre du deplacement et de l'attente." },
        { q: "Comment devenir washer sur Washapp ?", a: "Vous devez vous inscrire sur la plateforme, fournir les informations demandees et respecter les conditions d'acces definies par Washapp." },
      ],
    }],
  },
  {
    id: 'clients', title: 'Pour les clients', emoji: '🚗',
    sections: [
      {
        id: 'resa', title: 'Reservation',
        items: [
          { q: "Comment fonctionne Washapp ?", a: "Washapp est une plateforme qui organise des prestations de lavage de vehicules realisees par des washers independants. Vous reservez depuis la plateforme, vous payez selon les moyens proposes, puis un washer effectue la prestation." },
          { q: "Dois-je creer un compte pour reserver ?", a: "Oui, la creation d'un compte peut etre necessaire pour reserver, suivre vos demandes, recevoir les notifications et gerer vos informations personnelles." },
          { q: "Puis-je reserver pour une autre personne ?", a: "Oui, a condition de fournir les bonnes informations sur le vehicule, la localisation et les coordonnees utiles pour que la prestation puisse etre realisee correctement." },
          { q: "Puis-je reserver plusieurs vehicules ?", a: "Oui, sous reserve de disponibilite sur la plateforme et selon les conditions applicables au moment de la reservation." },
          { q: "Dans quelles zones Washapp est-il disponible ?", a: "Washapp est disponible dans les zones couvertes par la plateforme et selon la disponibilite des washers. Certaines villes, quartiers ou zones peuvent etre desservies avant d'autres." },
        ],
      },
      {
        id: 'paiement-client', title: 'Paiement',
        items: [
          { q: "Comment payer une prestation ?", a: "Le paiement peut etre effectue via Orange Money ou en especes avant le debut de la prestation." },
          { q: "Pourquoi dois-je payer avant la prestation ?", a: "Le paiement avant prestation permet de confirmer la reservation, d'eviter les annulations abusives et de securiser le deplacement du washer." },
          { q: "Que se passe-t-il si je ne paie pas avant ?", a: "Le washer n'est pas oblige de commencer le lavage tant que le paiement n'a pas ete effectue." },
          { q: "Le washer peut-il commencer si je n'ai pas paye ?", a: "Il ne doit pas commencer sans paiement prealable. S'il decide malgre tout d'intervenir, cela releve de sa propre responsabilite." },
        ],
      },
      {
        id: 'annulation', title: 'Annulation et retard',
        items: [
          { q: "Puis-je annuler sans frais ?", a: "Oui, si l'annulation intervient au moins 1 heure avant l'heure prevue." },
          { q: "Pourquoi 50 % sont retenus en cas d'annulation tardive ?", a: "Cette retenue permet de couvrir le deplacement du washer, le temps reserve, ainsi que l'organisation generale de la mission." },
          { q: "Que se passe-t-il si je suis absent ?", a: "Si vous etes absent ou si le vehicule n'est pas accessible, des frais d'attente peuvent s'appliquer, et le washer pourra annuler apres le delai prevu." },
          { q: "Que se passe-t-il si mon vehicule n'est pas accessible ?", a: "Le washer peut patienter selon les regles prevues. Si la situation n'est pas regularisee, la prestation peut etre annulee." },
        ],
      },
      {
        id: 'prestation', title: 'Prestation',
        items: [
          { q: "Dois-je etre present pendant toute la prestation ?", a: "Vous devez au minimum etre disponible au debut de la prestation ou rendre le vehicule accessible dans les conditions prevues." },
          { q: "Que se passe-t-il si mon vehicule est plus sale que prevu ?", a: "Si l'etat reel du vehicule necessite un travail plus important que celui correspondant a la formule choisie, un supplement forfaitaire de 500 F CFA peut etre applique." },
          { q: "Pourquoi un supplement peut-il etre demande ?", a: "Parce qu'un vehicule exceptionnellement sale necessite plus de temps, plus de produits et plus d'effort que prevu initialement." },
          { q: "Le lavage est-il maintenu en cas de pluie ?", a: "Oui, sauf si les conditions meteo sont reellement dangereuses ou rendent la prestation impossible dans de bonnes conditions. Dans ce cas, la mission peut etre reportee." },
          { q: "Que se passe-t-il si la meteo est dangereuse ?", a: "Washapp ou le washer peut proposer un report, une reprogrammation ou une annulation selon les circonstances." },
          { q: "Dois-je retirer mes objets personnels du vehicule ?", a: "C'est fortement conseille. Le client doit eviter de laisser des objets de valeur ou des effets sensibles dans le vehicule." },
          { q: "Puis-je signaler une particularite sur mon vehicule ?", a: "Oui. Il est recommande de signaler tout element utile avant la prestation, notamment une fragilite, un acces difficile ou un etat particulier du vehicule." },
        ],
      },
      {
        id: 'reclamations', title: 'Reclamations',
        items: [
          { q: "Comment signaler un probleme apres la prestation ?", a: "Vous pouvez contacter le support Washapp en expliquant precisement le probleme rencontre." },
          { q: "Dans quel delai puis-je faire une reclamation ?", a: "Toute reclamation doit etre transmise dans un delai de 48 heures apres la fin de la prestation." },
          { q: "Dois-je envoyer des photos ?", a: "Oui, c'est conseille. Les photos, captures ou explications detaillees permettent d'analyser la situation plus rapidement et plus serieusement." },
          { q: "Que faire si je ne suis pas satisfait du resultat ?", a: "Vous pouvez contacter le support Washapp avec tous les elements utiles. Chaque situation pourra etre etudiee au cas par cas." },
        ],
      },
    ],
  },
  {
    id: 'washers', title: 'Pour les washers', emoji: '🧼',
    sections: [
      {
        id: 'devenir', title: 'Devenir washer',
        items: [
          { q: "Qui peut devenir washer sur Washapp ?", a: "Toute personne repondant aux criteres definis par Washapp et acceptant les conditions d'acces a la plateforme peut candidater." },
          { q: "Les washers sont-ils salaries de Washapp ?", a: "Non. Les washers travaillent comme prestataires independants." },
          { q: "Faut-il payer pour avoir acces a la plateforme ?", a: "Oui. L'acces a la plateforme est soumis a un abonnement hebdomadaire." },
          { q: "Que comprend l'abonnement hebdomadaire ?", a: "L'abonnement permet d'acceder a la plateforme Washapp et aux produits ou moyens mis a disposition dans le cadre de l'activite, selon les conditions definies par Washapp." },
          { q: "L'abonnement garantit-il un nombre minimum de prestations ?", a: "Non. L'abonnement donne acces a la plateforme, mais ne garantit pas un volume precis de missions." },
        ],
      },
      {
        id: 'missions', title: 'Missions et fonctionnement',
        items: [
          { q: "Comment recois-je des missions ?", a: "Les missions sont attribuees ou proposees via la plateforme selon les regles internes de fonctionnement de Washapp." },
          { q: "Puis-je choisir mes missions ?", a: "Selon l'organisation retenue par Washapp, certaines missions peuvent etre proposees selon votre disponibilite, votre zone et votre statut sur la plateforme." },
          { q: "Puis-je refuser une mission ?", a: "Washapp peut prevoir des regles specifiques sur le refus de mission, notamment pour preserver la qualite de service et l'organisation generale." },
          { q: "Est-ce que Washapp fixe les prix ?", a: "Oui. Les prix sont fixes par Washapp afin d'assurer une offre claire, homogene et coherente pour les clients." },
          { q: "Puis-je fixer mes propres tarifs ?", a: "Non. Les washers ne fixent pas librement les prix des prestations sur Washapp." },
        ],
      },
      {
        id: 'paiement-washer', title: 'Paiement',
        items: [
          { q: "Comment suis-je paye ?", a: "Les paiements sont traites selon le systeme mis en place par Washapp, notamment via paiement mobile ou tout autre mecanisme de redistribution retenu sur la plateforme." },
          { q: "L'argent passe par ou ?", a: "Lorsqu'un paiement numerique est utilise, les fonds peuvent passer par un systeme d'encaissement, de redistribution ou par un prestataire technique compatible avec la Cote d'Ivoire." },
          { q: "Puis-je commencer une prestation si le client n'a pas paye ?", a: "Non. Le paiement doit etre effectue avant le debut de la prestation." },
          { q: "Que se passe-t-il si je commence quand meme ?", a: "Si vous commencez malgre l'absence de paiement, vous agissez sous votre propre responsabilite. La responsabilite de Washapp ne pourra pas etre engagee pour cette decision." },
        ],
      },
      {
        id: 'retard-washer', title: 'Retard et annulation',
        items: [
          { q: "Que faire si le client est en retard ?", a: "Vous devez attendre selon les conditions prevues par la plateforme." },
          { q: "Quand les frais d'attente commencent-ils ?", a: "Les frais d'attente peuvent commencer a s'appliquer a partir de 3 minutes." },
          { q: "Quand puis-je annuler ?", a: "A partir de 10 minutes d'attente, vous pouvez annuler la prestation." },
          { q: "Que recois-je si j'annule apres 10 minutes d'attente ?", a: "Vous percevez 1 500 F CFA au titre du deplacement et de l'attente." },
        ],
      },
      {
        id: 'qualite', title: 'Qualite et regles',
        items: [
          { q: "Puis-je appliquer un supplement si le vehicule est beaucoup plus sale que prevu ?", a: "Oui, dans les conditions prevues par Washapp, un supplement forfaitaire de 500 F CFA peut etre applique." },
          { q: "Puis-je encaisser directement un paiement hors plateforme ?", a: "Non, sauf cas expressement autorise par Washapp. Tout contournement du fonctionnement prevu peut entrainer des sanctions." },
          { q: "Puis-je recuperer les clients pour moi en dehors de Washapp ?", a: "Non. Le detournement de clientele ou le contournement de la plateforme peut entrainer une suspension ou une exclusion." },
          { q: "Washapp peut-il suspendre mon compte ?", a: "Oui. En cas de fraude, mauvais comportement, absences repetees, encaissement non autorise, non-paiement de l'abonnement ou atteinte a l'image de Washapp, votre acces peut etre suspendu ou supprime." },
          { q: "Dois-je respecter une qualite de service ?", a: "Oui. Le washer doit intervenir avec serieux, ponctualite, respect et professionnalisme." },
        ],
      },
    ],
  },
  {
    id: 'support', title: 'Securite & Support', emoji: '🔒',
    sections: [
      {
        id: 'paiement-gen', title: 'Paiement',
        items: [
          { q: "Pourquoi Washapp impose-t-il le paiement avant prestation ?", a: "Parce que cela securise la reservation, le deplacement du washer et l'organisation generale du service." },
          { q: "Orange Money est-il accepte ?", a: "Oui, Orange Money fait partie des moyens de paiement prevus sur Washapp." },
          { q: "Les especes sont-elles autorisees ?", a: "Oui, mais uniquement avant le debut de la prestation." },
        ],
      },
      {
        id: 'securite', title: 'Securite & Donnees',
        items: [
          { q: "Mes donnees personnelles sont-elles protegees ?", a: "Washapp met en place des regles de confidentialite et de securite pour proteger les informations necessaires au fonctionnement du service." },
          { q: "Quelles informations Washapp collecte-t-il ?", a: "Washapp peut collecter notamment le nom, le prenom, le telephone, l'email, la localisation, la plaque du vehicule, la photo du vehicule, l'historique de reservation et certaines preferences de communication." },
          { q: "Pourquoi Washapp collecte-t-il ces donnees ?", a: "Ces informations permettent de gerer les comptes, les reservations, les paiements, les interventions, les reclamations, les notifications et l'amelioration du service." },
          { q: "Washapp utilise-t-il des cookies ?", a: "Oui, Washapp peut utiliser des cookies techniques, statistiques ou marketing selon les fonctionnalites de la plateforme et les choix de l'utilisateur." },
        ],
      },
      {
        id: 'support-contact', title: 'Support',
        items: [
          { q: "Comment contacter le support Washapp ?", a: "Vous pouvez contacter le support via l'application, le site internet ou l'adresse officielle de contact de Washapp." },
          { q: "Que faire en cas de litige ?", a: "En cas de litige, il faut contacter Washapp rapidement avec le maximum de details possibles pour permettre une analyse serieuse de la situation." },
          { q: "Que dois-je envoyer pour qu'un litige soit etudie ?", a: "Il est conseille d'envoyer une description precise du probleme, des photos si possible, ainsi que toute information utile sur la prestation concernee." },
          { q: "Washapp repond-il a tous les litiges ?", a: "Washapp etudie les reclamations recues dans les delais et dans la mesure ou elles sont suffisamment documentees." },
        ],
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        className="w-full flex items-center justify-between py-5 text-left gap-4"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="font-semibold text-gray-900 text-[15px] leading-snug">{q}</span>
        <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180 text-[#1558f5]' : 'text-gray-400'}`} />
      </button>
      {open && (
        <div className="pb-5 pr-8">
          <p className="text-gray-500 leading-relaxed text-[14.5px]">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const [activeGroup, setActiveGroup] = useState('general');
  const current = groups.find((g) => g.id === activeGroup) ?? groups[0];
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Hero */}
      <div
        className="relative py-16 px-6 text-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #040c24 0%, #0c1e55 55%, #0a3a99 100%)' }}
      >
        <div className="relative">
          <span className="inline-block text-[11px] font-extrabold tracking-[0.2em] uppercase text-blue-300 mb-3">
            Centre d&apos;aide
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Questions frequentes</h1>
          <p className="text-white/60 text-[16px] max-w-xl mx-auto">
            Trouvez rapidement les reponses sur Washapp, les reservations, les paiements et plus encore.
          </p>
        </div>
      </div>

      {/* Group Tabs */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex overflow-x-auto gap-1 py-2" style={{ scrollbarWidth: 'none' }}>
            {groups.map((g) => (
              <button
                key={g.id}
                onClick={() => setActiveGroup(g.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 whitespace-nowrap ${
                  activeGroup === g.id ? 'bg-[#1558f5] text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span>{g.emoji}</span>
                {g.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        {current.sections.map((section) => (
          <div key={section.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {section.title && (
              <div className="px-6 py-4 border-b border-gray-50 bg-gradient-to-r from-blue-50 to-white">
                <h2 className="text-[11px] font-bold text-[#1558f5] uppercase tracking-[1.5px]">{section.title}</h2>
              </div>
            )}
            <div className="px-6">
              {section.items.map((item) => (
                <FAQItem key={item.q} {...item} />
              ))}
            </div>
          </div>
        ))}

        {/* Contact box */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-2xl">
            💬
          </div>
          <h2 className="text-[18px] font-bold text-gray-900 mb-2">Vous n&apos;avez pas trouve votre reponse ?</h2>
          <p className="text-gray-500 text-[14px] mb-5 max-w-sm mx-auto">
            Notre equipe support est disponible. Contactez-nous via l&apos;app ou par email.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-[13px] text-gray-400 mb-6">
            <span>Contact : <span className="font-medium text-gray-600">[a completer]</span></span>
            <span className="hidden sm:block">·</span>
            <span>Tel : <span className="font-medium text-gray-600">[a completer]</span></span>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/legal#mentions-legales" className="text-[13px] text-[#1558f5] hover:underline font-medium">Mentions legales</Link>
            <Link href="/legal#cgu-clients" className="text-[13px] text-[#1558f5] hover:underline font-medium">CGU</Link>
            <Link href="/legal#politique-confidentialite" className="text-[13px] text-[#1558f5] hover:underline font-medium">Politique de confidentialite</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
