# Best Ride

[Italiano](#italiano) | [English](#english)

<p align="center">
  <img src="https://img.shields.io/badge/Nuxt.js-00DC82?style=for-the-badge&logo=nuxtdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Nitro-FF6C37?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />
</p>

<p align="center">
  <strong>Live demo: <a href="https://best-ride.vercel.app">best-ride.vercel.app</a></strong>
</p>

---

# Italiano

## Cos'è Best Ride?

**Best Ride** è una Progressive Web App (PWA) dedicata ai ciclisti che vogliono analizzare le proprie prestazioni e monitorare i propri record personali, senza la complessità, i costi o la pressione sociale delle piattaforme tradizionali.

---

## Il problema che risolve

Molti ciclisti si trovano in una di queste situazioni:

- Utilizzano ciclocomputer affidabili, ma le applicazioni proprietarie offrono strumenti di analisi limitati
- Usano piattaforme come Strava, ma le funzioni avanzate richiedono un abbonamento premium
- Preferiscono uno spazio privato focalizzato sul miglioramento personale, senza classifiche pubbliche

---

## Obiettivo

L'obiettivo di **Best Ride** è dare al ciclista il pieno controllo dei propri dati di allenamento attraverso un'esperienza moderna, privata e focalizzata sulla crescita personale.

> Niente classifiche globali. Niente pressione sociale. Solo il confronto con il proprio passato.

---

## Funzionalità principali

### Analisi attività FIT
Carica un file `.fit` o `.zip` generato dal tuo ciclocomputer. L'app estrae automaticamente:
- Potenza media, normalizzata (NP) e picchi
- Power curve (best effort per ogni durata)
- Velocità, distanza, dislivello
- Frequenza cardiaca e cadenza
- Stress dell'allenamento, fattore di intensità, calorie
- Mappa GPS del percorso
- Tempo nelle zone di potenza e frequenza cardiaca
- Analisi dei lap

### Personal Records
Ogni attività viene confrontata automaticamente con lo storico personale. Quando viene rilevato un miglioramento:
- Viene evidenziato il nuovo record con medaglia (oro/argento/bronzo)
- Viene mostrato il confronto con il risultato precedente
- Il record può essere arricchito con una descrizione personalizzata

Categorie di record:
- Potenza (breve, media, lunga durata)
- Frequenza cardiaca
- Distanza, dislivello, durata
- Velocità massima, kilojoule

### Record personalizzati
Crea i tuoi traguardi personali — miglior tempo sullo Stelvio, record casa-lavoro, qualsiasi cosa — con una classifica personale Top 3 e possibilità di inserimento manuale.

### Power Profile
Grafico radar con 8 assi che mostra il profilo fisiologico del ciclista (neuromuscolare, anaerobico, VO2max, soglia) calibrato per sesso e fascia d'età.

### Profilo atleta
Zone di allenamento personalizzate basate su FTP e soglia anaerobica, con w/kg e messaggio motivazionale basato sul livello.

### PWA installabile
Best Ride funziona come app nativa su Android e desktop. Su Android è possibile condividere file `.fit` e `.zip` direttamente da altre app verso Best Ride.

---

## Architettura

| Layer | Tecnologia |
|-------|------------|
| Frontend | Nuxt 4, Vue 3, Vuetify |
| Backend/API | Nitro (server Nuxt) |
| ORM | Prisma 7 |
| Database | PostgreSQL (Neon) |
| Auth | Google OAuth (nuxt-auth-utils) |
| Deploy | Vercel |
| PWA | @vite-pwa/nuxt |

---

## Avviare il progetto in locale

### Prerequisiti
- Node.js 18+
- Un account [Neon](https://neon.tech) (PostgreSQL serverless) o PostgreSQL locale
- Credenziali Google OAuth ([Google Cloud Console](https://console.cloud.google.com))

### Installazione

```bash
# 1. Clona il repository
git clone https://github.com/simofb21/best-ride
cd best-ride

# 2. Installa le dipendenze
npm install

# 3. Configura le variabili d'ambiente
cp .env.example .env
# Modifica .env con i tuoi valori

# 4. Crea le tabelle nel database
npx prisma migrate dev

# 5. Avvia il server di sviluppo
npm run dev
```

### Variabili d'ambiente richieste

Crea un file `.env` nella root del progetto:

```env
DATABASE_URL=postgresql://...

NUXT_SESSION_PASSWORD=una-stringa-random-di-almeno-32-caratteri

NUXT_OAUTH_GOOGLE_CLIENT_ID=il-tuo-client-id
NUXT_OAUTH_GOOGLE_CLIENT_SECRET=il-tuo-client-secret
```

Per le credenziali Google OAuth, aggiungi questi URI di redirect autorizzati nella Google Cloud Console:
- `http://localhost:3000/auth/google` (sviluppo)
- `https://tuodominio.vercel.app/auth/google` (produzione)

### Build per produzione

```bash
npm run build
```

Lo script esegue automaticamente `prisma generate && prisma migrate deploy && nuxt build`.

---

## Sviluppi futuri

- Localizzazione italiana completa
- Grafici di andamento potenza/frequenza/cadenza nel tempo
- Integrazione con Garmin Connect e Wahoo
- Apple Sign In
- Recupero password via email

---

## Open Source

Questo è stato il mio primo progetto **Full Stack sviluppato completamente in autonomia**.

Il progetto è **Open Source** — contribuzioni, segnalazioni di bug e suggerimenti sono benvenuti.

---

---

# English

## What is Best Ride?

**Best Ride** is a Progressive Web App (PWA) for cyclists who want to analyze their performances and track personal records without the complexity, costs, or social pressure of traditional platforms.

---

## The problem it solves

Many cyclists:

- Use reliable bike computers but receive limited analysis tools from proprietary apps
- Use platforms like Strava where advanced analytics require a premium subscription
- Prefer a private environment focused on personal improvement rather than public rankings

---

## Goal

> No global rankings. No social pressure. Only you and your progress.

---

## Main features

### FIT file analysis
Upload a `.fit` or `.zip` file from your bike computer. The app automatically extracts:
- Average, normalized (NP) and peak power
- Power curve (best effort for each duration)
- Speed, distance, elevation gain
- Heart rate and cadence
- Training stress, intensity factor, calories
- GPS route map
- Time in power and heart rate zones
- Lap analysis

### Personal Records
Every activity is automatically compared against your history. When a new record is detected:
- It is highlighted with a medal (gold/silver/bronze)
- Previous results are shown for comparison
- Records can be enriched with a custom description

Record categories:
- Power (short, medium, long duration)
- Heart rate
- Distance, elevation, duration
- Max speed, kilojoules

### Custom Records
Create your own personal goals — best time on a climb, commute record, anything — with a personal Top 3 leaderboard and manual entry support.

### Power Profile
Radar chart with 8 axes showing the cyclist's physiological profile (neuromuscular, anaerobic, VO2max, threshold), calibrated by sex and age bracket.

### Athlete Profile
Personalized training zones based on FTP and anaerobic threshold, with W/kg display and motivational message based on current level.

### Installable PWA
Best Ride works as a native app on Android and desktop. On Android, `.fit` and `.zip` files can be shared directly from other apps to Best Ride.

---

## Architecture

| Layer | Technology |
|-------|------------|
| Frontend | Nuxt 4, Vue 3, Vuetify |
| Backend/API | Nitro (Nuxt server) |
| ORM | Prisma 7 |
| Database | PostgreSQL (Neon) |
| Auth | Google OAuth (nuxt-auth-utils) |
| Deploy | Vercel |
| PWA | @vite-pwa/nuxt |

---

## Running locally

### Prerequisites
- Node.js 18+
- A [Neon](https://neon.tech) account (serverless PostgreSQL) or local PostgreSQL
- Google OAuth credentials ([Google Cloud Console](https://console.cloud.google.com))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/simofb21/best-ride
cd best-ride

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your values

# 4. Create database tables
npx prisma migrate dev

# 5. Start the development server
npm run dev
```

### Required environment variables

```env
DATABASE_URL=postgresql://...

NUXT_SESSION_PASSWORD=a-random-string-of-at-least-32-characters

NUXT_OAUTH_GOOGLE_CLIENT_ID=your-client-id
NUXT_OAUTH_GOOGLE_CLIENT_SECRET=your-client-secret
```

For Google OAuth, add these authorized redirect URIs in Google Cloud Console:
- `http://localhost:3000/auth/google` (development)
- `https://yourdomain.vercel.app/auth/google` (production)

### Production build

```bash
npm run build
```

The script automatically runs `prisma generate && prisma migrate deploy && nuxt build`.

---

## Future improvements

- Full Italian localization
- Power/HR/cadence time series charts
- Garmin Connect and Wahoo integration
- Apple Sign In
- Email password recovery

---

## Open Source

This was my first complete **Full Stack project developed independently**, without collaborators.

The project is **Open Source** — contributions, bug reports and suggestions are welcome.
