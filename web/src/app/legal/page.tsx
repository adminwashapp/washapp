'use client';

import Link from 'next/link';
import Footer from '@/components/layout/Footer';

const toc = [
  { id: 'mentions-legales',          num: '1', label: 'Mentions légales' },
  { id: 'cgu-clients',               num: '2', label: 'CGU — Clients' },
  { id: 'cgu-washers',               num: '3', label: 'CGU — Washers' },
  { id: 'politique-confidentialite', num: '4', label: 'Politique de confidentialité' },
  { id: 'politique-cookies',         num: '5', label: 'Politique cookies' },
  { id: 'cases-cocher',              num: '6', label: 'Cases à cocher' },
];

function SectionCard({ id, num, title, children }: { id: string; num: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-4 px-7 py-5 border-b-2 border-[#1558f5] bg-gradient-to-r from-blue-50 to-white">
        <div className="w-10 h-10 bg-[#1558f5] rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">{num}</div>
        <h2 className="text-[17px] font-bold text-[#0c1e55]">{title}</h2>
      </div>
      <div className="px-7 py-7 space-y-6">{children}</div>
    </section>
  );
}

function Article({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pb-6 border-b border-dashed border-gray-100 last:border-0 last:pb-0">
      <h3 className="flex items-center gap-2 text-[15px] font-bold text-[#1558f5] mb-3">
        <span className="w-1 h-5 bg-[#00c4ff] rounded block flex-shrink-0" />
        {title}
      </h3>
      <div className="text-[14.5px] text-gray-600 leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-blue-50 border-l-4 border-[#1558f5] rounded-r-lg px-4 py-3 text-[13.5px] text-gray-700 my-2">
      {children}
    </div>
  );
}

function WarnBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-lg px-4 py-3 text-[13.5px] text-gray-700 my-2">
      {children}
    </div>
  );
}

function Ul({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1 my-2">
      {items.map((it) => (
        <li key={it} className="flex items-start gap-2 text-[14px] text-gray-600">
          <span className="text-[#1558f5] font-bold mt-0.5 flex-shrink-0">›</span>
          {it}
        </li>
      ))}
    </ul>
  );
}

function KVTable({ rows }: { rows: [string, string][] }) {
  return (
    <table className="w-full text-[13.5px] my-3 border-collapse">
      <tbody>
        {rows.map(([k, v]) => (
          <tr key={k} className="border-b border-gray-100 last:border-0">
            <td className="py-2 pr-4 font-semibold text-gray-400 whitespace-nowrap w-44 align-top">{k}</td>
            <td className="py-2 text-gray-700 align-top">{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">

      {/* Hero */}
      <div
        className="relative py-14 px-6 text-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #040c24 0%, #0c1e55 55%, #0a3a99 100%)' }}
      >
        <div className="relative">
          <span className="inline-block text-[11px] font-extrabold tracking-[0.2em] uppercase text-blue-300 mb-3">
            Washapp
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Documents légaux</h1>
          <p className="text-white/60 text-[15px] max-w-lg mx-auto">
            Mentions légales, CGU, politique de confidentialité et cookies — Côte d&apos;Ivoire · Cadre OHADA
          </p>
        </div>
      </div>

      {/* Layout */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 flex gap-8 items-start">

        {/* Sommaire */}
        <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4" style={{ background: 'linear-gradient(135deg, #1558f5, #00c4ff)' }}>
              <h3 className="text-white font-bold text-[13px]">Sommaire</h3>
            </div>
            <nav className="py-1">
              {toc.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="flex items-center gap-3 px-4 py-3 text-[13px] text-gray-600 hover:bg-blue-50 hover:text-[#1558f5] transition-colors border-b border-gray-50 last:border-0"
                >
                  <span className="w-6 h-6 bg-[#e8f0fe] text-[#1558f5] rounded-md flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                    {item.num}
                  </span>
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Contenu principal */}
        <main className="flex-1 min-w-0 space-y-6">

          {/* ========== 1. MENTIONS LÉGALES ========== */}
          <SectionCard id="mentions-legales" num="1" title="Mentions légales — Washapp">

            <Article title="1. Éditeur de la plateforme">
              <p>La plateforme Washapp est éditée par une société en cours de constitution, devant être immatriculée en Côte d&apos;Ivoire sous la forme d&apos;une Société par Actions Simplifiée (SAS) relevant du cadre juridique OHADA.</p>
              <KVTable rows={[
                ['Dénomination sociale', 'Washapp'],
                ['Forme juridique', 'Société par Actions Simplifiée (SAS)'],
                ['Statut', 'Société en cours de constitution'],
                ['Siège social prévu', 'Cocody, Côte d’Ivoire'],
                ['RCCM', 'En cours d’attribution'],
                ['N° compte contribuable', 'En cours d’attribution'],
                ['Capital social', 'À compléter'],
                ['Représentant légal / Président', 'Arthur Alloufou'],
                ['Email de contact', 'À compléter'],
                ['Téléphone', 'À compléter'],
              ]} />
            </Article>

            <Article title="2. Directeur de publication">
              <p>Le directeur de publication de la plateforme est <strong>Arthur Alloufou</strong>.</p>
            </Article>

            <Article title="3. Hébergement">
              <p>La plateforme Washapp est hébergée par :</p>
              <KVTable rows={[
                ['Hébergeur', 'Render'],
                ['Qualité', 'Hébergeur technique'],
                ['Coordonnées', 'À compléter selon l’entité contractante retenue'],
              ]} />
            </Article>

            <Article title="4. Activité de la plateforme">
              <p>Washapp est une plateforme numérique de réservation et d&apos;organisation de services de lavage automobile en Côte d&apos;Ivoire. Washapp agit comme organisateur du service et structure notamment :</p>
              <Ul items={[
                "l’accès à la plateforme ;",
                "le référencement des washers ;",
                "les conditions générales d’utilisation du service ;",
                "les conditions tarifaires applicables aux clients ;",
                "le paiement préalable de la prestation ;",
                "l’encadrement des règles d’annulation, d’attente, de réclamation et de redistribution.",
              ]} />
              <p>Les prestations matérielles de lavage sont réalisées par des <strong>washers indépendants</strong>.</p>
            </Article>

            <Article title="5. Paiement">
              <p>La plateforme peut proposer des paiements par :</p>
              <Ul items={['Wave Money ;', 'espèces dans les conditions prévues par les CGU.']} />
              <InfoBox>Wave Money est disponible en Côte d&apos;Ivoire. CinetPay annonce la prise en charge d&apos;Orange Money Côte d&apos;Ivoire. Le mécanisme exact dépendra du prestataire effectivement retenu par Washapp.</InfoBox>
            </Article>

            <Article title="6. Propriété intellectuelle">
              <p>Tous les éléments composant Washapp sont protégés par les règles applicables à la propriété intellectuelle, notamment la marque, le nom de domaine, la charte graphique, les logos, les textes, les interfaces, les visuels, les bases de données, les développements techniques et les contenus éditoriaux.</p>
              <WarnBox>Toute reproduction, représentation, adaptation, extraction, modification, diffusion ou exploitation, totale ou partielle, sans autorisation écrite préalable de Washapp, est strictement interdite.</WarnBox>
            </Article>

            <Article title="7. Disponibilité">
              <p>Washapp s&apos;efforce d&apos;assurer un accès continu à la plateforme. Celle-ci peut être temporairement indisponible pour maintenance, évolution, incident technique, contrainte liée à un prestataire tiers ou force majeure. Washapp ne garantit pas une disponibilité ininterrompue.</p>
            </Article>

            <Article title="8. Contact">
              <KVTable rows={[['Email', 'À compléter'], ['Téléphone', 'À compléter']]} />
            </Article>

          </SectionCard>

          {/* ========== 2. CGU CLIENTS ========== */}
          <SectionCard id="cgu-clients" num="2" title="Conditions Générales d’Utilisation et de Service — Clients">

            <Article title="Article 1 — Objet">
              <p>Les présentes Conditions Générales définissent les conditions dans lesquelles toute personne accède à la plateforme Washapp, crée un compte, réserve une prestation, règle le prix du service, interagit avec un washer et, plus généralement, utilise les services proposés par Washapp.</p>
            </Article>

            <Article title="Article 2 — Champ d’application">
              <p>Les présentes conditions s&apos;appliquent à toute utilisation de Washapp, sur site web, application mobile ou tout autre support numérique opéré sous la marque Washapp, ainsi qu&apos;à toute réservation de prestation de lavage automobile.</p>
            </Article>

            <Article title="Article 3 — Acceptation">
              <p>L&apos;utilisation de Washapp implique l&apos;acceptation pleine et entière des présentes conditions. L&apos;utilisateur reconnaît avoir pris connaissance des présentes CGU/CGS, de la politique de confidentialité, de la politique cookies et des conditions tarifaires affichées avant réservation.</p>
            </Article>

            <Article title="Article 4 — Description du service">
              <p>Washapp permet au client de réserver une prestation de lavage automobile réalisée par un washer indépendant. Washapp agit comme organisateur du service et fixe notamment :</p>
              <Ul items={[
                "les prix des prestations ;",
                "les règles de réservation ;",
                "les règles d’attente ;",
                "les règles d’annulation ;",
                "certains standards d’exécution ;",
                "les modalités de paiement.",
              ]} />
              <InfoBox>Le washer reste indépendant dans l&apos;exécution matérielle de la prestation.</InfoBox>
            </Article>

            <Article title="Article 5 — Conditions d’accès">
              <p>Le client s&apos;engage à :</p>
              <Ul items={[
                "ne pas créer un compte frauduleux ;",
                "ne pas utiliser l’identité d’un tiers ;",
                "ne pas renseigner de fausses informations ;",
                "conserver ses identifiants confidentiels ;",
                "informer Washapp en cas d’usage non autorisé de son compte.",
              ]} />
            </Article>

            <Article title="Article 6 — Informations client et exactitude">
              <p>Le client s&apos;engage à fournir des informations exactes relatives à son identité, ses coordonnées, la localisation du véhicule, la plaque et les caractéristiques utiles du véhicule.</p>
              <p>Toute erreur, omission ou fausse déclaration peut entraîner un refus de prestation, une annulation, une surfacturation ou une suspension de compte en cas de mauvaise foi.</p>
            </Article>

            <Article title="Article 7 — Réservation d’une prestation">
              <p>La réservation n&apos;est réputée confirmée qu&apos;après :</p>
              <Ul items={[
                "sélection de la prestation ;",
                "validation des informations utiles ;",
                "affichage du prix ;",
                "acceptation des présentes conditions ;",
                "paiement préalable lorsque celui-ci est requis.",
              ]} />
            </Article>

            <Article title="Article 8 — Prix">
              <p>Les prix des prestations sont fixés par Washapp et affichés sur la plateforme avant validation. Ils peuvent dépendre du type de prestation, de la catégorie de véhicule, de la localisation, du créneau et des options choisies.</p>
            </Article>

            <Article title="Article 9 — Paiement">
              <p><strong>Paiement préalable :</strong> Le client doit régler la prestation avant son exécution. À défaut, le washer n&apos;est pas tenu de commencer.</p>
              <p><strong>Moyens de paiement :</strong></p>
              <Ul items={["Wave Money ;", "espèces avant prestation."]} />
              <WarnBox>En paiement espèces, le client doit régler avant le début du lavage. Si le washer décide d&apos;exécuter sans paiement préalable, cette décision est prise sous sa seule responsabilité et la responsabilité de Washapp ne pourra pas être engagée.</WarnBox>
              <p>Pour les paiements numériques, Washapp peut recourir à un prestataire opérable en Côte d&apos;Ivoire, compatible avec Wave Money (ex : CinetPay).</p>
            </Article>

            <Article title="Article 10 — Annulation par le client">
              <p>Annulation sans frais jusqu&apos;à <strong>1 heure avant</strong> l&apos;heure prévue.</p>
              <WarnBox>En cas d&apos;annulation moins d&apos;une heure avant l&apos;heure prévue, une pénalité de <strong>50 % du prix de la prestation</strong> sera appliquée pour couvrir l&apos;organisation, l&apos;immobilisation du washer et le déplacement engagé.</WarnBox>
            </Article>

            <Article title="Article 11 — Retard, attente, absence et accessibilité">
              <Ul items={[
                "À partir de 3 minutes d’attente : frais d’attente facturables ;",
                "À partir de 10 minutes : le washer peut annuler la prestation ;",
                "Indemnité forfaitaire de 1 500 F CFA due au titre du déplacement et de l’attente.",
              ]} />
              <p>Le washer peut mettre fin à la mission si le client est absent, le véhicule inaccessible, le client injoignable ou les conditions matérielles défavorables.</p>
            </Article>

            <Article title="Article 12 — Véhicule anormalement sale">
              <p>Si le véhicule est significativement plus sale que prévisible, un <strong>supplément forfaitaire de 500 F CFA</strong> pourra être appliqué. Le washer ou Washapp pourra également proposer une formule supérieure, requalifier ou refuser la prestation.</p>
              <p>Sont notamment susceptibles de justifier un refus ou une requalification : état d&apos;insalubrité manifeste, présence de matières dangereuses, déchets biologiques, objets susceptibles de blesser ou situation exposant le washer à un risque anormal.</p>
            </Article>

            <Article title="Article 13 — Conditions météo">
              <p>En cas de météo réellement dangereuse (orages violents, pluies fortes persistantes, vents dangereux), Washapp ou le washer peut reporter, proposer un nouveau créneau ou annuler sans faute.</p>
            </Article>

            <Article title="Article 14 — Obligations du client">
              <Ul items={[
                "payer avant prestation ;",
                "fournir des informations exactes ;",
                "rester joignable ;",
                "rendre le véhicule accessible ;",
                "retirer, autant que possible, les objets de valeur ;",
                "signaler tout élément sensible du véhicule ;",
                "ne pas adopter de comportement irrespectueux, menaçant ou frauduleux.",
              ]} />
              <InfoBox>Tout objet laissé dans le véhicule demeure sous la responsabilité du client. Le washer n&apos;a pas vocation à gérer les effets personnels.</InfoBox>
            </Article>

            <Article title="Article 15 — Comportements interdits">
              <Ul items={[
                "la fraude ;",
                "le non-paiement ;",
                "les faux comptes ;",
                "l’usurpation d’identité ;",
                "les demandes contraires aux lois ou à la sécurité ;",
                "les insultes, menaces ou violences ;",
                "toute tentative de contournement illicite de la plateforme.",
              ]} />
            </Article>

            <Article title="Article 16 — Réclamations">
              <p>Toute réclamation doit être adressée à Washapp dans un délai maximal de <strong>48 heures</strong> après la fin de la prestation, avec l&apos;identité du client, la référence de réservation, la description précise du problème et toute pièce utile (photos, messages, justificatifs).</p>
              <p>Au-delà de ce délai, la prestation pourra être réputée acceptée.</p>
            </Article>

            <Article title="Article 17 — Responsabilité">
              <p>Washapp est tenu d&apos;une <strong>obligation de moyens</strong> dans l&apos;organisation du service, et non d&apos;une obligation de résultat absolu.</p>
              <p>Washapp ne pourra pas être tenu responsable notamment d&apos;une erreur du client, d&apos;un défaut d&apos;accessibilité du véhicule, d&apos;un non-paiement lorsque le washer intervient malgré cela, d&apos;un cas de force majeure ou d&apos;un dysfonctionnement imputable à un tiers.</p>
              <WarnBox>Sauf faute démontrée, Washapp ne répond pas des défauts préexistants, micro-rayures antérieures, conséquences d&apos;instructions erronées ou objets oubliés dans le véhicule.</WarnBox>
            </Article>

            <Article title="Article 18 — Suspension ou suppression du compte">
              <p>Washapp peut suspendre ou supprimer tout compte en cas de fraude, impayé, faux renseignements, comportements abusifs, atteinte au bon fonctionnement de la plateforme ou non-respect répété des conditions.</p>
            </Article>

            <Article title="Articles 19 à 22 — Données, Propriété intellectuelle, Droit applicable">
              <p>Les données du client sont traitées conformément à la politique de confidentialité et à la <strong>loi n°2013-450 du 19 juin 2013</strong>. Les présentes conditions sont soumises au <strong>droit ivoirien</strong> et au cadre <strong>OHADA</strong>.</p>
            </Article>

          </SectionCard>

          {/* ========== 3. CGU WASHERS ========== */}
          <SectionCard id="cgu-washers" num="3" title="Conditions Générales d’Accès et d’Utilisation — Washers">

            <Article title="Article 1 — Objet">
              <p>Les présentes conditions régissent l&apos;accès des washers à la plateforme Washapp, leurs obligations, leur statut, les règles d&apos;usage de la plateforme et les conditions économiques applicables.</p>
            </Article>

            <Article title="Article 2 — Statut du washer">
              <p>Le washer intervient comme <strong>prestataire indépendant</strong>. Son inscription sur Washapp ne crée ni contrat de travail, ni lien de subordination salariale. Le washer demeure responsable de son statut juridique et de ses obligations déclaratives, fiscales, sociales et administratives.</p>
            </Article>

            <Article title="Article 3 — Conditions d’accès à la plateforme">
              <p>Pour accéder à Washapp, le washer peut devoir transmettre : pièce d&apos;identité, coordonnées, photo, numéro de téléphone, moyen de réception de paiement, justificatifs complémentaires selon les besoins.</p>
              <p>Washapp se réserve le droit d&apos;accepter, refuser, suspendre ou désactiver tout accès à la plateforme.</p>
            </Article>

            <Article title="Article 4 — Abonnement hebdomadaire">
              <p>L&apos;accès à la plateforme est soumis au paiement d&apos;un <strong>abonnement hebdomadaire</strong> donnant accès à la plateforme, aux missions selon disponibilité et aux produits ou consommables fournis ou mis à disposition par Washapp.</p>
              <KVTable rows={[['Montant hebdomadaire', 'À compléter']]} />
              <WarnBox>Le paiement de l&apos;abonnement ne garantit aucun chiffre d&apos;affaires minimum, aucun volume minimum de réservations, ni aucune exclusivité territoriale.</WarnBox>
            </Article>

            <Article title="Article 5 — Prix des prestations">
              <p>Les prix des prestations sont fixés par Washapp. Le washer s&apos;interdit de modifier unilatéralement les prix, d&apos;imposer un supplément non autorisé ou de négocier hors cadre les tarifs fixés.</p>
              <InfoBox>Seuls les suppléments expressément prévus par Washapp peuvent être appliqués.</InfoBox>
            </Article>

            <Article title="Article 6 — Paiement préalable et discipline d’encaissement">
              <WarnBox>Le washer ne doit pas commencer une prestation tant que le paiement préalable requis n&apos;a pas été effectué. En paiement espèces, le paiement doit être reçu avant le début du lavage. Toute violation engage la seule responsabilité du washer.</WarnBox>
            </Article>

            <Article title="Article 7 — Reversement et distribution">
              <p>Les sommes perçues peuvent être centralisées par Washapp ou un prestataire de paiement opérable en Côte d&apos;Ivoire (Orange Money, CinetPay), puis redistribuées selon les règles de la plateforme. Le calendrier et les règles de redistribution dépendent du dispositif de paiement effectivement déployé.</p>
            </Article>

            <Article title="Article 8 — Produits et matériel">
              <p>Le washer s&apos;engage à utiliser les produits fournis, autorisés ou validés par Washapp, à respecter les consignes d&apos;usage et à signaler toute anomalie ou rupture.</p>
            </Article>

            <Article title="Article 9 — Obligations générales du washer">
              <Ul items={[
                "être ponctuel ;",
                "intervenir avec courtoisie ;",
                "respecter le client ;",
                "respecter les prix fixés ;",
                "ne pas détourner les clients hors plateforme ;",
                "ne pas encaisser en violation des règles applicables ;",
                "respecter les consignes de sécurité ;",
                "refuser les prestations dangereuses ou anormalement risquées ;",
                "informer Washapp de tout incident important.",
              ]} />
            </Article>

            <Article title="Article 10 — Annulations, attente et retard du client">
              <Ul items={[
                "Attente facturable à partir de 3 minutes ;",
                "Annulation possible à partir de 10 minutes ;",
                "Indemnité forfaitaire de 1 500 F CFA dans les conditions prévues.",
              ]} />
              <p>Le washer doit documenter toute annulation fondée sur l&apos;absence du client, l&apos;inaccessibilité du véhicule, le défaut de paiement ou une situation dangereuse.</p>
            </Article>

            <Article title="Article 11 — Véhicule trop sale et situations anormales">
              <p>Le washer peut appliquer le supplément de <strong>500 F CFA</strong> en cas de véhicule anormalement sale selon les règles prévues. Il peut refuser ou interrompre la prestation si l&apos;état est incompatible avec la formule, s&apos;il existe un risque pour la santé ou si le lieu est dangereux.</p>
            </Article>

            <Article title="Article 12 — Interdiction de contournement">
              <WarnBox>Le washer s&apos;interdit de détourner la clientèle, de solliciter des paiements hors cadre, d&apos;organiser directement des prestations avec un client rencontré via Washapp ou d&apos;utiliser les données clients à des fins personnelles non autorisées.</WarnBox>
            </Article>

            <Article title="Article 13 — Suspension, désactivation et résiliation">
              <p>Washapp peut suspendre ou résilier l&apos;accès du washer sans préavis en cas de faute grave, notamment :</p>
              <Ul items={[
                "non-paiement de l’abonnement ;",
                "fraude ;",
                "encaissement irrégulier ;",
                "faux documents ;",
                "absences répétées ;",
                "mauvaise exécution répétée ;",
                "plaintes sérieuses et récurrentes ;",
                "comportement irrespectueux ;",
                "atteinte à l’image de Washapp ;",
                "contournement de la plateforme.",
              ]} />
            </Article>

            <Article title="Article 14 — Responsabilité">
              <p>Le washer est responsable de l&apos;exécution matérielle des prestations qu&apos;il réalise. Il doit signaler immédiatement à Washapp tout incident, difficulté majeure, dommage constaté ou contestation du client.</p>
            </Article>

            <Article title="Article 15 — Données personnelles et confidentialité">
              <p>Le washer s&apos;engage à traiter les données des clients avec confidentialité et uniquement dans le cadre de la mission. Il lui est interdit de les conserver au-delà du nécessaire, de les utiliser pour démarcher, de les céder ou de les exploiter à des fins étrangères au service.</p>
            </Article>

          </SectionCard>

          {/* ========== 4. POLITIQUE DE CONFIDENTIALITÉ ========== */}
          <SectionCard id="politique-confidentialite" num="4" title="Politique de Confidentialité — Washapp">

            <Article title="1 — Objet">
              <p>Cette politique explique la manière dont Washapp collecte, utilise, conserve, protège et communique les données à caractère personnel des utilisateurs.</p>
              <InfoBox>Cadre légal : <strong>loi n°2013-450 du 19 juin 2013</strong> relative à la protection des données à caractère personnel en Côte d&apos;Ivoire.</InfoBox>
            </Article>

            <Article title="2 — Responsable du traitement">
              <KVTable rows={[
                ['Société', 'Washapp (en cours de constitution)'],
                ['Siège prévu', 'Cocody, Côte d’Ivoire'],
                ['Représentant', 'Arthur Alloufou'],
                ['Email', 'À compléter'],
              ]} />
            </Article>

            <Article title="3 — Catégories de données collectées">
              <p><strong>Données clients :</strong> nom, prénom, téléphone, email, localisation, plaque, photo du véhicule, historique des réservations, données de paiement, préférences de communication, données techniques de connexion.</p>
              <p><strong>Données washers :</strong> identité, coordonnées, photo, documents justificatifs, informations de paiement, historique d&apos;activité, données de performance et d&apos;utilisation de la plateforme.</p>
              <p><strong>Cookies et données techniques :</strong> adresse IP, type d&apos;appareil, logs techniques, identifiants de session, traceurs selon préférences.</p>
            </Article>

            <Article title="4 — Finalités des traitements">
              <Ul items={[
                "créer et gérer les comptes ;",
                "organiser les réservations ;",
                "affecter les prestations ;",
                "traiter les paiements ;",
                "gérer les annulations et réclamations ;",
                "lutter contre la fraude ;",
                "améliorer la plateforme ;",
                "assurer la sécurité des systèmes ;",
                "envoyer des messages opérationnels ;",
                "envoyer des offres commerciales lorsque autorisé.",
              ]} />
            </Article>

            <Article title="5 — Fondements de traitement">
              <Ul items={[
                "exécution de la relation contractuelle ;",
                "respect d’obligations légales ;",
                "intérêt légitime de Washapp à sécuriser et améliorer son service ;",
                "consentement, notamment pour usages marketing ou cookies non nécessaires.",
              ]} />
            </Article>

            <Article title="6 — Destinataires">
              <Ul items={[
                "équipes autorisées de Washapp ;",
                "washers concernés par une mission ;",
                "prestataires techniques et d’hébergement ;",
                "prestataires de paiement ;",
                "outils de notification et de mesure d’audience ;",
                "autorités légalement habilitées.",
              ]} />
            </Article>

            <Article title="7 — Prestataires tiers et transferts">
              <p>L&apos;hébergement est assuré par <strong>Render</strong>. Les paiements peuvent transiter par <strong>Orange Money</strong> et, le cas échéant, <strong>CinetPay</strong>. Certains prestataires peuvent être localisés hors de Côte d&apos;Ivoire ; Washapp s&apos;efforce de recourir à des solutions présentant des garanties adaptées en matière de sécurité et de confidentialité.</p>
            </Article>

            <Article title="8 — Durée de conservation">
              <Ul items={[
                "données de compte : pendant la durée de vie du compte ;",
                "données de réservation : durée nécessaire à la gestion des litiges et obligations légales ;",
                "données de paiement : selon les exigences comptables et probatoires ;",
                "données marketing : jusqu’au retrait du consentement ou de l’opposition ;",
                "logs et cookies : selon une durée technique adaptée.",
              ]} />
            </Article>

            <Article title="9 — Sécurité">
              <p>Washapp met en œuvre des mesures techniques et organisationnelles raisonnables pour empêcher l&apos;accès non autorisé, limiter la divulgation et prévenir la perte ou l&apos;altération des données.</p>
              <WarnBox>Toutefois, aucun système n&apos;étant infaillible, Washapp ne peut garantir une sécurité absolue.</WarnBox>
            </Article>

            <Article title="10 — Droits des personnes">
              <p>Les utilisateurs peuvent demander :</p>
              <Ul items={[
                "l’accès à leurs données ;",
                "la rectification de données inexactes ;",
                "l’effacement de certaines données ;",
                "l’opposition à certains traitements ;",
                "la limitation de certains usages.",
              ]} />
              <InfoBox>Contact : À compléter (email)</InfoBox>
            </Article>

            <Article title="11 — Données des mineurs">
              <p>Washapp n&apos;a pas vocation à fournir ses services à des mineurs agissant seuls. Les utilisateurs doivent avoir la capacité juridique requise pour utiliser les services.</p>
            </Article>

            <Article title="12 — Marketing">
              <p>Washapp peut adresser des communications promotionnelles par notification push, SMS ou email, sous réserve des préférences de l&apos;utilisateur et des règles applicables. L&apos;utilisateur peut se désinscrire ou s&apos;opposer à tout moment.</p>
            </Article>

          </SectionCard>

          {/* ========== 5. POLITIQUE COOKIES ========== */}
          <SectionCard id="politique-cookies" num="5" title="Politique Cookies — Washapp">

            <Article title="1 — Définition">
              <p>Un cookie est un traceur déposé sur le terminal de l&apos;utilisateur lors de sa navigation ou de son utilisation de la plateforme.</p>
            </Article>

            <Article title="2 — Cookies strictement nécessaires">
              <p>Indispensables au fonctionnement du service, ils permettent :</p>
              <Ul items={[
                "l’authentification ;",
                "la sécurisation de session ;",
                "le bon fonctionnement des pages ;",
                "la mémorisation de préférences techniques ;",
                "la navigation au sein du service.",
              ]} />
            </Article>

            <Article title="3 — Cookies de mesure d’audience">
              <p>Ces cookies permettent de mesurer la fréquentation, d&apos;analyser l&apos;usage des pages, d&apos;identifier les parcours utilisateurs et d&apos;améliorer les performances et l&apos;ergonomie.</p>
            </Article>

            <Article title="4 — Cookies marketing et de personnalisation">
              <p>Ils peuvent être utilisés pour personnaliser les messages, mesurer l&apos;efficacité de campagnes et adapter l&apos;exposition à des contenus promotionnels.</p>
            </Article>

            <Article title="5 — Consentement et gestion des préférences">
              <p>Les cookies non strictement nécessaires sont soumis au choix de l&apos;utilisateur. L&apos;utilisateur peut accepter, refuser ou personnaliser ses préférences depuis le bandeau ou les paramètres de son navigateur.</p>
              <InfoBox>Le refus des cookies non nécessaires n&apos;empêche pas l&apos;accès de base au service, mais certaines fonctionnalités peuvent être limitées.</InfoBox>
            </Article>

            <Article title="6 — Durée">
              <p>Les cookies sont conservés pour une durée limitée, adaptée à leur finalité et à la configuration technique choisie.</p>
            </Article>

            <Article title="7 — Contact">
              <KVTable rows={[['Email', 'À compléter']]} />
            </Article>

          </SectionCard>

          {/* ========== 6. CASES À COCHER ========== */}
          <SectionCard id="cases-cocher" num="6" title="Formulations — Cases à cocher">
            <p className="text-[13.5px] text-gray-400 mb-4">Textes à afficher directement à côté des cases dans les formulaires.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Inscription', text: "Je reconnais avoir lu et accepté les Conditions Générales d’Utilisation ainsi que la Politique de Confidentialité de Washapp." },
                { label: 'Réservation', text: "Je confirme ma réservation et j’accepte les conditions tarifaires, les frais d’annulation, les règles d’attente et les conditions d’exécution de Washapp." },
                { label: 'Paiement', text: "Je comprends que le paiement doit être effectué avant le début de la prestation. En cas de paiement en espèces, je m’engage à régler avant le lavage." },
                { label: 'Marketing', text: "J’accepte de recevoir des offres, promotions et communications commerciales de la part de Washapp." },
                { label: 'Cookies', text: "J’accepte l’utilisation de cookies et traceurs conformément à mes préférences de confidentialité." },
              ].map(({ label, text }) => (
                <div key={label} className="border border-gray-100 rounded-xl p-4 hover:border-[#1558f5] hover:shadow-sm transition-all">
                  <p className="text-[12px] font-bold text-[#1558f5] mb-2">{label}</p>
                  <p className="text-[13px] text-gray-500 italic border-l-2 border-[#00c4ff] pl-3 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link href="#mentions-legales" className="text-[13px] text-[#1558f5] hover:underline">
                Retour en haut
              </Link>
            </div>
          </SectionCard>

        </main>
      </div>
      <Footer />
    </div>
  );
}
