<template>
  <div class="legal-page">
    <!-- Header con Titolo e Switch Lingua -->
    <header class="page-header">
      <div>
        <h1>{{ t.title }}</h1>
        <p class="last-updated">{{ t.lastUpdatedPrefix }}: {{ lastUpdated }}</p>
      </div>

      <!-- Bottone Switch Lingua -->
      <button class="lang-switch-btn" @click="toggleLanguage">
        <span class="flag">{{ currentLang === "it" ? "🇮🇹" : "🇬🇧" }}</span>
        <span>{{ currentLang === "it" ? "IT" : "EN" }}</span>
      </button>
    </header>

    <!-- Contenuto Legale Dinamico -->
    <section v-for="(sec, index) in t.sections" :key="index" class="legal-card">
      <h2>{{ sec.title }}</h2>

      <!-- Contenuto in caso di array di paragrafi/liste -->
      <template v-for="(item, i) in sec.content" :key="i">
        <p v-if="typeof item === 'string'" v-html="item"></p>
        <ul v-else-if="Array.isArray(item)">
          <li v-for="(listItem, j) in item" :key="j" v-html="listItem"></li>
        </ul>
      </template>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

const lastUpdated = "July 2026";

// Gestione della lingua ('it' predefinita, oppure 'en')
const currentLang = ref<"it" | "en">("en");

function toggleLanguage() {
  currentLang.value = currentLang.value === "it" ? "en" : "it";
  document.title =
    currentLang.value === "it"
      ? "Informativa sulla Privacy - Best Ride"
      : "Privacy Policy - Best Ride";
}

onMounted(() => {
  document.title = "Privacy Policy - Best Ride";
});

// Traduzioni IT / EN
const translations = {
  en: {
    title: "Privacy Policy",
    lastUpdatedPrefix: "Last updated",
    sections: [
      {
        title: "1. Who we are",
        content: [
          'Best Ride ("we", "us", "our") is a cycling performance tracking web application created by Simone Fusar Bassini, also available as an installable Progressive Web App (PWA). This Privacy Policy explains what personal data we collect, why we collect it, and how users can control their information.',
        ],
      },
      {
        title: "2. Authentication and account data",
        content: [
          "Best Ride uses Google OAuth for authentication. We do not store passwords.",
          "When you sign in with Google, we receive and store the following information:",
          ["Name", "Email address", "Google account identifier (Google ID)"],
        ],
      },
      {
        title: "3. Personal and cycling data we collect",
        content: [
          "To provide personalized cycling performance analysis, we collect:",
          [
            "Name and surname",
            "Date of birth",
            "Sex",
            "Weight",
            "Functional Threshold Power (FTP)",
            "Anaerobic threshold",
            "Total cycling distance and hours recorded",
          ],
        ],
      },
      {
        title: "4. Activity data",
        content: [
          "Users can manually upload cycling activity files in .fit format. These files may contain:",
          [
            "Power data",
            "Speed",
            "Cadence",
            "Heart rate",
            "GPS coordinates, if available in the file",
            "Elevation data",
            "Distance and duration",
          ],
          "Uploaded activities are processed to calculate performance metrics, training load, personal records, and other cycling statistics. Processed activity data is retained until the user uploads a newer activity file or deletes their account.",
        ],
      },
      {
        title: "5. Use of GPS data",
        content: [
          "If GPS information is included in an uploaded activity file, it may be used to display the route map of the cycling activity. GPS data is not used for advertising or tracking purposes.",
        ],
      },
      {
        title: "6. Why we process your data",
        content: [
          "We process your data only to provide Best Ride's core functionality, including:",
          [
            "Performance analysis",
            "Power curve calculation",
            "Personal records tracking",
            "Training metrics calculation",
            "Visualization of cycling activities",
          ],
          "We do not sell personal data and we do not use personal information for advertising purposes.",
        ],
      },
      {
        title: "7. Legal basis",
        content: [
          "We process personal data based on your consent and because processing is necessary to provide the service you requested, according to Article 6(1)(a) and 6(1)(b) of the GDPR.",
        ],
      },
      {
        title: "8. Data retention",
        content: [
          "Your personal data is stored while your account remains active. You can delete your account at any time using the account deletion feature available in the application. Account deletion removes your associated personal data.",
        ],
      },
      {
        title: "9. Data security",
        content: [
          "We apply reasonable technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.",
        ],
      },
      {
        title: "10. Your rights under GDPR",
        content: [
          "You have the right to:",
          [
            "Access your personal data",
            "Correct inaccurate information",
            "Request deletion of your data",
            "Receive your data in a portable format",
            "Withdraw your consent",
          ],
        ],
      },
      {
        title: "11. Third-party services",
        content: [
          "Best Ride uses Google OAuth to authenticate users. Google may process personal data according to its own privacy policy.",
        ],
      },
      {
        title: "12. Contact",
        content: [
          'For questions about this Privacy Policy or requests regarding your personal data, contact us at: <a href="mailto:simofusar@gmail.com">simofusar@gmail.com</a>',
        ],
      },
    ],
  },
  it: {
    title: "Informativa sulla Privacy",
    lastUpdatedPrefix: "Ultimo aggiornamento",
    sections: [
      {
        title: "1. Chi siamo",
        content: [
          'Best Ride ("noi", "nostro") è un\'applicazione web per il tracciamento delle prestazioni ciclistiche creata da Simone Fusar Bassini, disponibile anche come Progressive Web App (PWA) installabile. Questa Informativa sulla Privacy spiega quali dati personali raccogliamo, perché li raccogliamo e come gli utenti possono gestire le proprie informazioni.',
        ],
      },
      {
        title: "2. Autenticazione e dati dell'account",
        content: [
          "Best Ride utilizza Google OAuth per l'autenticazione. Non memorizziamo password.",
          "Quando effettui l'accesso con Google, riceviamo e salviamo le seguenti informazioni:",
          [
            "Nome",
            "Indirizzo e-mail",
            "Identificativo dell'account Google (Google ID)",
          ],
        ],
      },
      {
        title: "3. Dati personali e ciclistici raccolti",
        content: [
          "Per fornire un'analisi personalizzata delle prestazioni ciclistiche, raccogliamo:",
          [
            "Nome e cognome",
            "Data di nascita",
            "Sesso",
            "Peso",
            "Potenza alla Soglia Funzionale (FTP)",
            "Soglia anaerobica",
            "Distanza totale e ore di ciclismo registrate",
          ],
        ],
      },
      {
        title: "4. Dati delle attività",
        content: [
          "Gli utenti possono caricare manualmente i file delle attività ciclistiche in formato .fit. Questi file possono contenere:",
          [
            "Dati di potenza",
            "Velocità",
            "Cadenza",
            "Frequenza cardiaca",
            "Coordinate GPS, se disponibili nel file",
            "Dati di altitudine",
            "Distanza e durata",
          ],
          "Le attività caricate vengono elaborate per calcolare metriche di prestazione, carico di allenamento, record personali e altre statistiche. I dati elaborati vengono conservati finché l'utente non carica un nuovo file o elimina il proprio account.",
        ],
      },
      {
        title: "5. Utilizzo dei dati GPS",
        content: [
          "Se le informazioni GPS sono incluse nel file dell'attività, possono essere utilizzate per mostrare la mappa del percorso. I dati GPS non vengono usati a fini pubblicitari o di tracciamento commerciale.",
        ],
      },
      {
        title: "6. Perché elaboriamo i tuoi dati",
        content: [
          "Trattiamo i tuoi dati esclusivamente per fornire le funzionalità principali di Best Ride, tra cui:",
          [
            "Analisi delle prestazioni",
            "Calcolo della curva di potenza",
            "Tracciamento dei record personali",
            "Calcolo delle metriche di allenamento",
            "Visualizzazione delle attività ciclistiche",
          ],
          "Non vendiamo dati personali e non li utilizziamo per scopi pubblicitari.",
        ],
      },
      {
        title: "7. Base giuridica",
        content: [
          "Trattiamo i dati personali in base al tuo consenso e perché il trattamento è necessario per fornire il servizio richiesto, ai sensi dell'Articolo 6(1)(a) e 6(1)(b) del GDPR.",
        ],
      },
      {
        title: "8. Conservazione dei dati",
        content: [
          "I tuoi dati personali sono conservati finché il tuo account rimane attivo. Puoi eliminare il tuo account in qualsiasi momento tramite la funzione presente nell'applicazione. L'eliminazione comporta la rimozione dei dati personali associati.",
        ],
      },
      {
        title: "9. Sicurezza dei dati",
        content: [
          "Adottiamo ragionevoli misure tecniche e organizzative per proteggere i tuoi dati personali da accessi non autorizzati, alterazioni, divulgazioni o distruzioni.",
        ],
      },
      {
        title: "10. I tuoi diritti secondo il GDPR",
        content: [
          "Hai il diritto di:",
          [
            "Accedere ai tuoi dati personali",
            "Correggere informazioni inesatte",
            "Richiedere la cancellazione dei tuoi dati",
            "Ricevere i tuoi dati in un formato portabile",
            "Revocare il tuo consenso",
          ],
        ],
      },
      {
        title: "11. Servizi di terze parti",
        content: [
          "Best Ride utilizza Google OAuth per l'autenticazione. Google potrebbe trattare i dati personali in base alla propria informativa sulla privacy.",
        ],
      },
      {
        title: "12. Contatti",
        content: [
          'Per domande su questa Informativa o per richieste relative ai tuoi dati personali, contattaci a: <a href="mailto:simofusar@gmail.com">simofusar@gmail.com</a>',
        ],
      },
    ],
  },
};

const t = computed(() => translations[currentLang.value]);
</script>

<style scoped>
.legal-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 16px;
  padding-bottom: 80px;
}

/* Header & Switch Lingua */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 4px 0;
}

.last-updated {
  font-size: 0.88rem;
  color: var(--text-muted, #888);
  margin: 0;
}

.lang-switch-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--surface, #1e1e1e);
  border: 1px solid var(--border, #333);
  color: var(--text, #fff);
  padding: 8px 14px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.lang-switch-btn:hover {
  border-color: var(--primary, #00dc82);
  background: rgba(255, 255, 255, 0.05);
}

.lang-switch-btn .flag {
  font-size: 16px;
}

/* Schede per le sezioni */
.legal-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 16px;
}

.legal-card h2 {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text);
  margin-top: 0;
  margin-bottom: 12px;
}

.legal-card p {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text-muted, #ccc);
  margin: 0 0 10px 0;
}

.legal-card p:last-child {
  margin-bottom: 0;
}

.legal-card ul {
  margin: 8px 0 12px 20px;
  padding: 0;
}

.legal-card li {
  font-size: 0.93rem;
  line-height: 1.5;
  color: var(--text-muted, #ccc);
  margin-bottom: 6px;
}

:deep(a) {
  color: var(--primary, #00dc82);
  text-decoration: none;
  font-weight: 600;
}

:deep(a:hover) {
  text-decoration: underline;
}
</style>
