'use client';

import { useState } from 'react';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { useLang } from '@/contexts/lang';

type FaqItem = { q: string; a: string };
type Section = { id: string; title: string | null; items: FaqItem[] };
type Group  = { id: string; title: string; emoji: string; sections: Section[] };

function buildGroups(lang: 'fr' | 'en'): Group[] {
  if (lang === 'en') {
    return [
      {
        id: 'general', title: 'General questions', emoji: '💡',
        sections: [{
          id: 'gen', title: null,
          items: [
            { q: 'How do I book a wash on Washapp?', a: 'You can book directly on Washapp by providing your location, the type of wash you want, your vehicle details and an available time slot offered on the platform.' },
            { q: 'When do I pay for the service?', a: 'Payment must be made before the service begins. Without prior payment, the washer is not required to start the wash.' },
            { q: 'Can I pay in cash?', a: 'Yes. Cash payment is allowed, but it must be handed over before the wash begins.' },
            { q: 'Can I cancel my booking?', a: 'Yes. You can cancel free of charge up to 1 hour before the scheduled service time.' },
            { q: 'What happens if I cancel less than 1 hour before?', a: "In the event of a late cancellation, 50% of the service price may be retained to cover the washer's travel, organisation and mobilisation costs." },
            { q: 'What happens if I am late?', a: 'Waiting fees may apply after 3 minutes of waiting.' },
            { q: 'What happens after 10 minutes of waiting?', a: 'After 10 minutes of waiting, the washer may cancel the service. In this case, they will receive 1,500 FCFA for travel and waiting time.' },
            { q: 'How do I become a washer on Washapp?', a: 'You must register on the platform, provide the required information and meet the access conditions defined by Washapp.' },
          ],
        }],
      },
      {
        id: 'clients', title: 'For clients', emoji: '🚗',
        sections: [
          {
            id: 'resa', title: 'Booking',
            items: [
              { q: 'How does Washapp work?', a: 'Washapp is a platform that organises vehicle washing services carried out by independent washers. You book through the platform, pay using the available methods, and a washer performs the service.' },
              { q: 'Do I need an account to book?', a: 'Yes, creating an account may be required to book, track your requests, receive notifications and manage your personal information.' },
              { q: 'Can I book on behalf of someone else?', a: 'Yes, as long as you provide the correct vehicle information, location and contact details needed for the service to be carried out properly.' },
              { q: 'Can I book for multiple vehicles?', a: 'Yes, subject to platform availability and the conditions applicable at the time of booking.' },
              { q: 'Which areas does Washapp cover?', a: 'Washapp is available in areas covered by the platform and subject to washer availability. Certain cities, neighbourhoods or zones may be served before others.' },
            ],
          },
          {
            id: 'paiement-client', title: 'Payment',
            items: [
              { q: 'How do I pay for a service?', a: 'Payment can be made via Wave Money or in cash before the service.' },
              { q: 'Why do I have to pay before the service?', a: 'Paying upfront confirms the booking, prevents abusive cancellations and secures the washer\'s travel.' },
              { q: 'What happens if I don\'t pay beforehand?', a: 'The washer is not obliged to start the wash until payment has been received.' },
              { q: 'Can the washer start if I haven\'t paid?', a: 'The washer should not start without prior payment. If they decide to proceed anyway, it is entirely at their own responsibility.' },
            ],
          },
          {
            id: 'annulation', title: 'Cancellation & delays',
            items: [
              { q: 'Can I cancel free of charge?', a: 'Yes, if the cancellation is made at least 1 hour before the scheduled time.' },
              { q: 'Why is 50% retained for late cancellations?', a: 'This retention covers the washer\'s travel, the time reserved and the general organisation of the mission.' },
              { q: 'What happens if I am absent?', a: 'If you are absent or the vehicle is not accessible, waiting fees may apply and the washer may cancel after the prescribed delay.' },
              { q: 'What happens if my vehicle is not accessible?', a: 'The washer may wait according to the platform rules. If the situation is not resolved, the service may be cancelled.' },
            ],
          },
          {
            id: 'prestation', title: 'Service',
            items: [
              { q: 'Do I have to be present throughout the service?', a: 'You must at minimum be available at the start of the service or make the vehicle accessible under the agreed conditions.' },
              { q: 'What if my vehicle is dirtier than expected?', a: 'If the actual condition of the vehicle requires more work than the chosen package, a flat surcharge of 500 FCFA may be applied.' },
              { q: 'Why may a surcharge be requested?', a: 'Because an exceptionally dirty vehicle requires more time, more products and more effort than initially anticipated.' },
              { q: 'Is the wash still carried out if it rains?', a: 'Yes, unless weather conditions are genuinely dangerous or make it impossible to carry out the service properly. In that case, the mission may be rescheduled.' },
              { q: 'What happens if the weather is dangerous?', a: 'Washapp or the washer may propose a rescheduling, postponement or cancellation depending on the circumstances.' },
              { q: 'Should I remove my personal belongings from the vehicle?', a: 'It is strongly advised. The client should avoid leaving valuables or sensitive items in the vehicle.' },
              { q: 'Can I report a specific detail about my vehicle?', a: 'Yes. It is recommended to flag any relevant detail before the service, such as a fragility, difficult access or particular condition of the vehicle.' },
            ],
          },
          {
            id: 'reclamations', title: 'Claims',
            items: [
              { q: 'How do I report a problem after the service?', a: 'You can contact Washapp support by clearly explaining the issue encountered.' },
              { q: 'How long do I have to file a claim?', a: 'Any claim must be submitted within 48 hours of the end of the service.' },
              { q: 'Should I send photos?', a: 'Yes, it is advised. Photos, screenshots or detailed explanations allow the situation to be assessed more quickly and thoroughly.' },
              { q: 'What should I do if I am not satisfied with the result?', a: 'You can contact Washapp support with all relevant information. Each situation will be reviewed on a case-by-case basis.' },
            ],
          },
        ],
      },
      {
        id: 'washers', title: 'For washers', emoji: '🧼',
        sections: [
          {
            id: 'devenir', title: 'Becoming a washer',
            items: [
              { q: 'Who can become a washer on Washapp?', a: 'Anyone who meets the criteria defined by Washapp and accepts the platform access conditions can apply.' },
              { q: 'Are washers employees of Washapp?', a: 'No. Washers work as independent contractors.' },
              { q: 'Do I have to pay to access the platform?', a: 'Yes. Platform access is subject to a weekly subscription.' },
              { q: 'What does the weekly subscription include?', a: 'The subscription gives access to the Washapp platform and to products or tools made available as part of the activity, under the conditions defined by Washapp.' },
              { q: 'Does the subscription guarantee a minimum number of jobs?', a: 'No. The subscription grants access to the platform but does not guarantee a specific volume of missions.' },
            ],
          },
          {
            id: 'missions', title: 'Missions & operations',
            items: [
              { q: 'How do I receive missions?', a: 'Missions are assigned or offered via the platform according to Washapp\'s internal operating rules.' },
              { q: 'Can I choose my missions?', a: 'Depending on the organisation adopted by Washapp, certain missions may be offered based on your availability, zone and status on the platform.' },
              { q: 'Can I refuse a mission?', a: 'Washapp may have specific rules regarding mission refusal, particularly to preserve service quality and general organisation.' },
              { q: 'Does Washapp set the prices?', a: 'Yes. Prices are set by Washapp to ensure a clear, uniform and consistent offer for clients.' },
              { q: 'Can I set my own rates?', a: 'No. Washers do not freely set the prices of services on Washapp.' },
            ],
          },
          {
            id: 'paiement-washer', title: 'Payment',
            items: [
              { q: 'How am I paid?', a: 'Payments are processed according to the system set up by Washapp, including via mobile payment or any other redistribution mechanism retained on the platform.' },
              { q: 'How does the money flow?', a: 'When a digital payment is used, funds may pass through a collection or redistribution system or a technical provider compatible with Côte d\'Ivoire.' },
              { q: 'Can I start a service if the client hasn\'t paid?', a: 'No. Payment must be made before the service begins.' },
              { q: 'What happens if I start anyway?', a: 'If you start despite the absence of payment, you act at your own responsibility. Washapp cannot be held liable for this decision.' },
            ],
          },
          {
            id: 'retard-washer', title: 'Delays & cancellations',
            items: [
              { q: 'What should I do if the client is late?', a: 'You must wait according to the conditions set by the platform.' },
              { q: 'When do waiting fees start?', a: 'Waiting fees may start to apply after 3 minutes.' },
              { q: 'When can I cancel?', a: 'After 10 minutes of waiting, you may cancel the service.' },
              { q: 'What do I receive if I cancel after 10 minutes of waiting?', a: 'You receive 1,500 FCFA for travel and waiting time.' },
            ],
          },
          {
            id: 'qualite', title: 'Quality & rules',
            items: [
              { q: 'Can I apply a surcharge if the vehicle is much dirtier than expected?', a: 'Yes, under the conditions set by Washapp, a flat surcharge of 500 FCFA may be applied.' },
              { q: 'Can I collect payment directly outside the platform?', a: 'No, unless expressly authorised by Washapp. Any circumvention of the intended process may result in sanctions.' },
              { q: 'Can I keep clients for myself outside Washapp?', a: 'No. Diverting clients or circumventing the platform may result in suspension or exclusion.' },
              { q: 'Can Washapp suspend my account?', a: 'Yes. In cases of fraud, misconduct, repeated absences, unauthorised collection, non-payment of the subscription or damage to the Washapp image, your access may be suspended or deleted.' },
              { q: 'Am I required to maintain a quality of service?', a: 'Yes. The washer must operate with seriousness, punctuality, respect and professionalism.' },
            ],
          },
        ],
      },
      {
        id: 'support', title: 'Security & Support', emoji: '🔒',
        sections: [
          {
            id: 'paiement-gen', title: 'Payment',
            items: [
              { q: 'Why does Washapp require payment before the service?', a: 'Because it secures the booking, the washer\'s travel and the general organisation of the service.' },
              { q: 'Is Wave Money accepted?', a: 'Yes, Wave Money is the primary digital payment method on Washapp.' },
              { q: 'Is cash allowed?', a: 'Yes, but only before the service begins.' },
            ],
          },
          {
            id: 'securite', title: 'Security & Data',
            items: [
              { q: 'Is my personal data protected?', a: 'Washapp puts in place privacy and security rules to protect the information necessary for the service to function.' },
              { q: 'What information does Washapp collect?', a: 'Washapp may collect, among other things, your name, first name, phone number, email, location, vehicle registration, vehicle photo, booking history and certain communication preferences.' },
              { q: 'Why does Washapp collect this data?', a: 'This information is used to manage accounts, bookings, payments, interventions, claims, notifications and service improvement.' },
              { q: 'Does Washapp use cookies?', a: 'Yes, Washapp may use technical, statistical or marketing cookies depending on platform features and user choices.' },
            ],
          },
          {
            id: 'support-contact', title: 'Support',
            items: [
              { q: 'How do I contact Washapp support?', a: 'You can contact support via the app, the website or the official Washapp contact address.' },
              { q: 'What should I do in case of a dispute?', a: 'In the event of a dispute, contact Washapp promptly with as many details as possible to allow a thorough analysis of the situation.' },
              { q: 'What should I send for a dispute to be reviewed?', a: 'It is advisable to send a precise description of the problem, photos if possible, and any information relevant to the service concerned.' },
              { q: 'Does Washapp respond to all disputes?', a: 'Washapp reviews claims received within the timeframes and to the extent that they are sufficiently documented.' },
            ],
          },
        ],
      },
    ];
  }

  // French (default)
  return [
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
          { q: "Que se passe-t-il apres 10 minutes d'attente ?", a: "A partir de 10 minutes d'attente, le washer peut annuler la prestation. Dans ce cas, il percevra 1 500 F CFA au titre du deplacement et de l'attente." },
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
            { q: "Comment payer une prestation ?", a: "Le paiement peut etre effectue via Wave Money ou en especes apres la prestation." },
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
            { q: "Que recois-je si j'annule apres 10 minutes d'attente ?", a: "Vous percevez 1 500 F CFA au titre du deplacement et de l'attente." },
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
            { q: "Wave Money est-il accepte ?", a: "Oui, Wave Money est le moyen de paiement numerique principal sur Washapp." },
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
}

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
  const { lang } = useLang();
  const groups = buildGroups(lang);

  const txt = {
    fr: {
      eyebrow: "Centre d'aide",
      hero_title: 'Questions frequentes',
      hero_sub: 'Trouvez rapidement les reponses sur Washapp, les reservations, les paiements et plus encore.',
      no_answer: "Vous n'avez pas trouve votre reponse ?",
      no_answer_sub: "Notre equipe support est disponible. Contactez-nous via l'app ou par email.",
      contact: 'Contact :',
      tel: 'Tel :',
      to_complete: '[a completer]',
      legal: 'Mentions legales',
      cgu: 'CGU',
      privacy: 'Politique de confidentialite',
    },
    en: {
      eyebrow: 'Help centre',
      hero_title: 'Frequently asked questions',
      hero_sub: 'Quickly find answers about Washapp, bookings, payments and more.',
      no_answer: "Didn't find your answer?",
      no_answer_sub: 'Our support team is available. Contact us via the app or by email.',
      contact: 'Contact:',
      tel: 'Phone:',
      to_complete: '[to be filled]',
      legal: 'Legal notices',
      cgu: 'Terms of use',
      privacy: 'Privacy policy',
    },
  }[lang];

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
            {txt.eyebrow}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">{txt.hero_title}</h1>
          <p className="text-white/60 text-[16px] max-w-xl mx-auto">
            {txt.hero_sub}
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
          <h2 className="text-[18px] font-bold text-gray-900 mb-2">{txt.no_answer}</h2>
          <p className="text-gray-500 text-[14px] mb-5 max-w-sm mx-auto">
            {txt.no_answer_sub}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-[13px] text-gray-400 mb-6">
            <span>{txt.contact} <span className="font-medium text-gray-600">{txt.to_complete}</span></span>
            <span className="hidden sm:block">·</span>
            <span>{txt.tel} <span className="font-medium text-gray-600">{txt.to_complete}</span></span>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/legal#mentions-legales" className="text-[13px] text-[#1558f5] hover:underline font-medium">{txt.legal}</Link>
            <Link href="/legal#cgu-clients" className="text-[13px] text-[#1558f5] hover:underline font-medium">{txt.cgu}</Link>
            <Link href="/legal#politique-confidentialite" className="text-[13px] text-[#1558f5] hover:underline font-medium">{txt.privacy}</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
