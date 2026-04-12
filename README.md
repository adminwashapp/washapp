# Washapp

Plateforme de lavage de véhicules à la demande — Abidjan.

3 interfaces : web client (Next.js), app mobile client (Expo), app mobile washer (Expo).
Backend central NestJS + Prisma + PostgreSQL + Socket.io.

---

## Architecture

```
washapp/
├── api/              — Backend NestJS (REST + WebSocket)
├── web/              — Web client Next.js
├── mobile-client/    — App mobile client React Native/Expo
└── mobile-washer/    — App mobile washer React Native/Expo
```

---

## Prérequis

- Node.js >= 20
- PostgreSQL >= 15
- npm >= 10
- Expo CLI : `npm install -g expo-cli`
- Android Studio ou Xcode pour les builds natifs

---

## Installation

### 1. Cloner et installer les dépendances

```bash
git clone <repo-url>
cd washapp
npm install
```

### 2. Configurer le backend

```bash
cd api
cp env.example .env
# Editer .env avec vos valeurs (DATABASE_URL, JWT_SECRET, Firebase, etc.)
```

Créer la base de données et appliquer les migrations :

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 3. Configurer le web

```bash
cd web
cp env.example .env.local
# Renseigner NEXT_PUBLIC_API_URL et NEXT_PUBLIC_GOOGLE_MAPS_KEY
```

### 4. Configurer les apps mobiles

```bash
cd mobile-client
cp env.example .env

cd ../mobile-washer
cp env.example .env
```

---

## Démarrage

### Backend API

```bash
cd api
npm run start:dev
# API disponible sur http://localhost:3001/api
# WebSocket sur ws://localhost:3001/ws
```

### Web

```bash
cd web
npm run dev
# Disponible sur http://localhost:3000
```

### App mobile client

```bash
cd mobile-client
npx expo start
# Scanner le QR code avec Expo Go
```

### App mobile washer

```bash
cd mobile-washer
npx expo start
# Scanner le QR code avec Expo Go
```

### Commandes depuis la racine

```bash
npm run api        # Démarre le backend
npm run web        # Démarre le web
npm run db:migrate # Applique les migrations Prisma
npm run db:studio  # Ouvre Prisma Studio
```

---

## Variables d'environnement

### api/.env

| Variable | Description |
|---|---|
| `DATABASE_URL` | Connexion PostgreSQL |
| `JWT_SECRET` | Clé secrète JWT (256 bits minimum) |
| `JWT_REFRESH_SECRET` | Clé secrète refresh token |
| `FIREBASE_PROJECT_ID` | Projet Firebase (notifications push) |
| `FIREBASE_PRIVATE_KEY` | Clé privée Firebase Admin SDK |
| `FIREBASE_CLIENT_EMAIL` | Email service account Firebase |
| `ORANGE_MONEY_API_URL` | URL API Orange Money CI |
| `ORANGE_MONEY_MERCHANT_KEY` | Clé marchand Orange Money |
| `CLOUDINARY_CLOUD_NAME` | Stockage photos missions |
| `CLOUDINARY_API_KEY` | Clé API Cloudinary |
| `CLOUDINARY_API_SECRET` | Secret Cloudinary |

### web/.env.local

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL backend (ex: http://localhost:3001/api) |
| `NEXT_PUBLIC_SOCKET_URL` | URL WebSocket (ex: http://localhost:3001) |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | Clé Google Maps API |

### mobile-client/.env et mobile-washer/.env

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_API_URL` | URL backend |
| `EXPO_PUBLIC_SOCKET_URL` | URL WebSocket |
| `EXPO_PUBLIC_GOOGLE_MAPS_KEY` | Clé Google Maps |

---

## Structure backend (modules NestJS)

| Module | Rôle |
|---|---|
| `auth` | Login, register, JWT, refresh token |
| `users` | Profils utilisateurs |
| `clients` | Profil client, véhicules, adresses |
| `washers` | Profil washer, statut, go online/offline |
| `missions` | Création, workflow, validation, photos |
| `dispatch` | Moteur d'attribution (instantané + réservation) |
| `payments` | Orange Money, cash, flux paiement |
| `wallet` | Solde washer (available + pending) |
| `ledger` | Traçabilité financière complète |
| `withdrawals` | Demandes de retrait Orange Money |
| `ratings` | Notes et avis |
| `complaints` | Plaintes et litiges |
| `subscriptions` | Abonnements washer + client |
| `notifications` | Push FCM (Firebase) |
| `admin` | Panel admin |

---

## Modèle économique

- **0% de commission** sur les missions
- **Abonnement washer** : 35 000 FCFA/semaine (dont 5 000 FCFA pour litiges)
- **Paiement Orange Money** : argent bloqué → libéré après validation
- **Paiement cash** : direct washer → confirmation double (client + washer)

---

## Règles métier critiques

### Dispatch instantané
1. Client demande une mission
2. Backend cherche les washers actifs, en ligne, abonnement valide
3. Tri par proximité
4. Envoi Socket.io + push FCM au washer
5. **Countdown 20 secondes** pour accepter
6. Si refus ou expiration → washer suivant
7. Si accepté → mission ASSIGNED

### Dispatch réservation
- Countdown **2 minutes**
- Priorité aux mieux notés
- Anti-retard : un washer ayant une réservation dans l'heure ne reçoit pas de missions risquant de le mettre en retard

### Photos obligatoires
- `BEFORE` et `AFTER` requis pour passer la mission en COMPLETED
- Impossible de terminer sans les deux photos

### Wallet + Ledger
- Tout mouvement financier = une entrée LedgerEntry
- `availableBalance` = argent retirable
- `pendingBalance` = argent bloqué en attente de validation

### Qualité
- Note < 3 → suspension automatique
- 3 plaintes confirmées → exclusion

---

## Pages web

| Route | Description |
|---|---|
| `/` | Accueil |
| `/concept` | Concept Washapp |
| `/tarifs` | Tarifs prestations + abonnements |
| `/devenir-washer` | Page marketing washer |
| `/faq` | FAQ |
| `/login` | Connexion client |
| `/register` | Inscription client |
| `/booking` | Réservation / instantané |
| `/mission/[id]` | Suivi mission temps réel |
| `/account` | Compte client |
| `/account/history` | Historique missions |
| `/account/subscriptions` | Abonnements client |

---

## Écrans app mobile client

- Splash, Hero, Auth (login/register)
- Home Map (carte Google)
- Booking flow (service → mode → washer trouvé → paiement)
- Mission tracking (carte, statut, photos, validation)
- Historique missions
- Compte

## Écrans app mobile washer

- Splash, Hero, Auth
- **Carte principale** (home après login)
- Mission popup Uber-like (countdown 20s, sonnerie, vibration)
- Mission active (arrivée, photo avant, démarrage, photo après, terminer)
- Réservations (reçues, acceptées, à venir)
- Revenus / Wallet (solde disponible, en attente, historique, retrait)
- Compte (profil, note, validation, abonnement)

---

## Services externes requis

| Service | Usage |
|---|---|
| **Google Maps API** | Cartes, géolocalisation, itinéraires |
| **Firebase (FCM)** | Notifications push mobiles |
| **Orange Money API** | Paiements mobiles CI |
| **Cloudinary** | Stockage photos avant/après missions |
| **PostgreSQL** | Base de données principale |

---

## Développement

```bash
# Générer le client Prisma après modif schema
npm run db:generate

# Créer une migration
cd api && npx prisma migrate dev --name <nom>

# Voir la DB visuellement
npm run db:studio

# Linter
cd api && npm run lint
cd web && npm run lint
```
