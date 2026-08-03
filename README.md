# 🚴 Best Ride

[🇮🇹 Italiano](#italiano) | [🇬🇧 English](#english)

<p align="center">

<img src="https://img.shields.io/badge/Nuxt.js-00DC82?style=for-the-badge&logo=nuxtdotjs&logoColor=white" />
<img src="https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white" />
<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" />
<img src="https://img.shields.io/badge/REST%20API-FF6C37?style=for-the-badge" />
<img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
<img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" />
<img src="https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge" />

</p>

---

# 🇮🇹 Italiano

##  Cos'è Best Ride?

**Best Ride** è una Progressive Web App (PWA) dedicata ai ciclisti che vogliono analizzare le proprie prestazioni e monitorare i propri record personali senza la complessità, i costi o la pressione sociale delle piattaforme tradizionali.

 **Demo online:**
https://best-ride.vercel.app

---

#  Il problema che risolve

Molti ciclisti si trovano in una di queste situazioni:

*  Utilizzano ciclocomputer affidabili (come Bryton), ma spesso le applicazioni proprietarie offrono strumenti di analisi limitati.
*  Utilizzano piattaforme come Strava, ma molte funzioni avanzate sono disponibili solamente tramite abbonamento premium.
*  Preferiscono evitare classifiche pubbliche e confronti continui, cercando invece uno spazio personale dedicato al miglioramento individuale.

---

#  Obiettivo del progetto

L'obiettivo di **Best Ride** è dare al ciclista il pieno controllo dei propri dati di allenamento attraverso un'esperienza moderna, privata e focalizzata sulla crescita personale.

Niente classifiche globali.
Niente pressione sociale.

Solo il confronto con il proprio passato.

---

#  Funzionalità principali

##  Analisi attività FIT

L'utente può caricare un file `.fit` generato dal proprio ciclocomputer.

L'applicazione analizza l'attività ed estrae automaticamente:

*  potenza media;
*  picchi di potenza;
*  velocità;
*  distanza;
*  dislivello;
*  statistiche di performance;
* molte altre ancora...

L'elaborazione è pensata per essere leggera, evitando inutili archiviazioni permanenti.

---

##  Personal Records

Un sistema dedicato ai record personali confronta ogni nuova attività con lo storico dell'utente.

Quando viene rilevato un miglioramento:

*  viene mostrato il nuovo record;
*  viene confrontato con il precedente risultato;
*  può essere salvato nel profilo personale;
*  può essere arricchito con una descrizione personalizzata.

Esempi:

* miglior tempo su una salita;
* miglior potenza sui 5 minuti;
* miglior prestazione su una distanza;
* massimo dislivello raggiunto.

---

##  Obiettivi personalizzati

Gli utenti possono creare traguardi personalizzati:

Esempi:

*  migliorare il tempo sullo Stelvio;
*  battere il record del percorso casa-lavoro;
*  creare una classifica personale per i propri percorsi preferiti.

È inoltre possibile inserire manualmente risultati e mantenere una propria **Top 3 storica**.

---

#  Architettura del progetto

Best Ride è un progetto **Full Stack** composto da:

## Frontend

Realizzato con:

*  **Nuxt.js**
*  **Vue.js**

Responsabile dell'interfaccia utente, della PWA e dell'esperienza lato client.

---

## Backend

Realizzato con:

*  **Node.js**

Il backend espone delle **API REST** utilizzate dal frontend per:

* gestione utenti;
* gestione record personali;
* salvataggio dati;
* comunicazione con il database.

---

## Database

Utilizza:

*  **Prisma ORM**
*  **PostgreSQL**

per la gestione strutturata dei dati applicativi.

---

#  Tecnologie utilizzate

| Tecnologia | Utilizzo                  |
| ---------- | ------------------------- |
| Nuxt.js    | Framework frontend        |
| Vue.js     | UI e componenti           |
| Node.js    | Backend e API REST        |
| Prisma     | ORM database              |
| PostgreSQL | Database relazionale      |
| PWA        | Applicazione installabile |

---

#  Sviluppi futuri

Possibili miglioramenti futuri:

* 🇮🇹 aggiunta completa della lingua italiana;
*  caricamento automatico delle attività;
*  integrazione più semplice con dispositivi e piattaforme esterne;
*  miglioramento generale dell'esperienza utente.

---

#  Open Source

Questo è stato il mio primo vero progetto **Full Stack sviluppato completamente in autonomia**, senza collaboratori.

Il progetto è **Open Source**.

---

---

# 🇬🇧 English

##  What is Best Ride?

**Best Ride** is a Progressive Web App (PWA) for cyclists who want to analyze their performances and track personal records without the complexity, costs, or social pressure of traditional platforms.

 **Live demo:**
https://best-ride.vercel.app

---

#  The problem it solves

Many cyclists:

*  use reliable bike computers, but often receive limited analysis tools;
*  use platforms where advanced analytics are locked behind premium subscriptions;
* prefer a private environment focused on personal improvement rather than public rankings.

---

# Project goal

Best Ride gives cyclists full control over their training data through a modern experience focused on personal growth.

No global rankings.
No social pressure.

Only you and your progress.

---

# Main features

## FIT file analysis

Users can upload `.fit` files generated by their bike computer.

The application extracts:

* ⚡ average power;
*  power peaks;
*  speed;
*  distance;
*  elevation gain;
*  performance statistics.

---

##  Personal Records

Best Ride compares every activity with the user's previous achievements.

When a new record is detected:

*  the improvement is highlighted;
*  previous results are compared;
*  records can be saved;
*  custom descriptions can be added.

---

##  Personal Challenges

Users can create custom goals:

Examples:

*  improve a climbing time;
*  beat a commute record;
*  maintain personal leaderboards.

Results can also be manually managed.

---

#  Project architecture

Best Ride is a **Full Stack application** composed of:

## Frontend

Built with:

*  Nuxt.js
*  Vue.js

---

## Backend

Built with:

*  Node.js

The backend provides **REST APIs** for:

* user management;
* personal records;
* data storage;
* database communication.

---

## Database

Using:

*  Prisma ORM
*  PostgreSQL

---

#  Technologies

| Technology | Usage                       |
| ---------- | --------------------------- |
| Nuxt.js    | Frontend framework          |
| Vue.js     | UI framework                |
| Node.js    | Backend and REST APIs       |
| Prisma     | Database ORM                |
| PostgreSQL | Relational database         |
| PWA        | Installable web application |

---

#  Future improvements

Future plans:

* 🇮🇹 full Italian localization;
*  easier activity uploads;
*  better device/platform integrations;
*  improved user experience.

---

# Open Source

This was my first complete **Full Stack project developed independently**, without collaborators.

The project is **Open Source**.
