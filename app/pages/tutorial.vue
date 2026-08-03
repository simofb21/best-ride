<template>
  <div class="tutorial-page">
    <!-- Header con Titolo e Bottone Cambio Lingua -->
    <header class="page-header">
      <div>
        <h1 class="page-title">{{ t.title }}</h1>
        <p class="eyebrow">{{ t.eyebrow }}</p>
      </div>

      <!-- Bottone Switch Lingua -->
      <button class="lang-switch-btn" @click="toggleLanguage">
        <span class="flag">{{ currentLang === "it" ? "🇮🇹" : "🇬🇧" }}</span>
        <span>{{ currentLang === "it" ? "IT" : "EN" }}</span>
      </button>
    </header>

    <!-- ================= DESKTOP LAYOUT ================= -->
    <div class="desktop-layout">
      <!-- Intro Card -->
      <div class="card intro-card">
        <h2>{{ t.introTitle }}</h2>
        <p v-html="t.introText"></p>
        <p class="highlight-text">
          {{ t.introHighlight }}
        </p>
      </div>

      <!-- Steps List -->
      <div class="card steps-card">
        <h2>{{ t.howItWorksTitle }}</h2>
        <div class="steps-list">
          <div v-for="(step, index) in t.steps" :key="index" class="step-item">
            <div class="step-badge">{{ index + 1 }}</div>
            <div class="step-content">
              <h3>
                {{ step.title }}
                <span v-if="step.optional" class="optional-tag">
                  {{ t.optionalTag }}
                </span>
              </h3>
              <p v-html="step.description"></p>

              <!-- Box Esempio FIT / Bryton -->
              <div v-if="step.infoBox" class="info-box">
                <strong>{{ step.infoBox.title }}</strong>
                <p v-html="step.infoBox.description"></p>
                <small>{{ step.infoBox.note }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Outro Card -->
      <div class="card outro-card">
        <h2>{{ t.outroTitle }}</h2>
        <p>{{ t.outroText }}</p>
      </div>
    </div>

    <!-- ================= MOBILE LAYOUT (ACCORDION) ================= -->
    <div class="mobile-layout">
      <!-- Section 1: Intro -->
      <div class="mobile-accordion">
        <button class="accordion-header" @click="toggleSection('intro')">
          <span>{{ t.introTitle }}</span>
          <v-icon
            :icon="
              activeSection === 'intro' ? 'mdi-chevron-up' : 'mdi-chevron-down'
            "
          />
        </button>
        <div v-if="activeSection === 'intro'" class="accordion-content">
          <p v-html="t.introTextMobile"></p>
        </div>
      </div>

      <!-- Section 2: Primi Passi (Steps 1-3) -->
      <div class="mobile-accordion">
        <button class="accordion-header" @click="toggleSection('setup')">
          <span>{{ t.mobileSections.setup }}</span>
          <v-icon
            :icon="
              activeSection === 'setup' ? 'mdi-chevron-up' : 'mdi-chevron-down'
            "
          />
        </button>
        <div
          v-if="activeSection === 'setup'"
          class="accordion-content stack-content"
        >
          <div v-for="i in [0, 1, 2]" :key="i">
            <h3>
              {{ t.steps[i].title }}
              <small v-if="t.steps[i].optional">({{ t.optionalTag }})</small>
            </h3>
            <p v-html="t.steps[i].description"></p>
          </div>
        </div>
      </div>

      <!-- Section 3: Caricamento File (Step 4) -->
      <div class="mobile-accordion">
        <button class="accordion-header" @click="toggleSection('upload')">
          <span>{{ t.mobileSections.upload }}</span>
          <v-icon
            :icon="
              activeSection === 'upload' ? 'mdi-chevron-up' : 'mdi-chevron-down'
            "
          />
        </button>
        <div
          v-if="activeSection === 'upload'"
          class="accordion-content stack-content"
        >
          <p v-html="t.steps[3].description"></p>
          <div v-if="t.steps[3].infoBox" class="info-box">
            <strong>{{ t.steps[3].infoBox.title }}</strong>
            <p v-html="t.steps[3].infoBox.description"></p>
          </div>
        </div>
      </div>

      <!-- Section 4: Analisi e Funzionalità (Steps 5-9) -->
      <div class="mobile-accordion">
        <button class="accordion-header" @click="toggleSection('features')">
          <span>{{ t.mobileSections.features }}</span>
          <v-icon
            :icon="
              activeSection === 'features'
                ? 'mdi-chevron-up'
                : 'mdi-chevron-down'
            "
          />
        </button>
        <div
          v-if="activeSection === 'features'"
          class="accordion-content stack-content"
        >
          <div v-for="i in [4, 5, 6, 7, 8]" :key="i">
            <h3>{{ t.steps[i].title }}</h3>
            <p v-html="t.steps[i].description"></p>
          </div>
        </div>
      </div>

      <!-- Outro Banner Mobile -->
      <div class="card outro-card mobile-outro">
        <h3>{{ t.outroMobile }} 🚴‍♂️</h3>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

// Definizione della lingua attiva ('it' predefinita)
const currentLang = ref<"it" | "en">("it");

// Stato della fisarmonica per Mobile
const activeSection = ref<string | null>("intro");

function toggleSection(section: string) {
  activeSection.value = activeSection.value === section ? null : section;
}

// Funzione per alternare la lingua
function toggleLanguage() {
  currentLang.value = currentLang.value === "it" ? "en" : "it";
  document.title =
    currentLang.value === "it"
      ? "Tutorial & Guide - Best Ride"
      : "Tutorial & Guide - Best Ride";
}

onMounted(() => {
  document.title = "Tutorial & Guide - Best Ride";
});

// Dizionario delle traduzioni
const translations = {
  it: {
    title: "Tutorial & Guida",
    eyebrow:
      "Scopri come sfruttare al massimo Best Ride e analizzare le tue prestazioni in bici.",
    introTitle: "Cosa è Best Ride",
    introText:
      "<strong>Best Ride</strong> è un'applicazione web ideata da <strong>Simone Fusar Bassini</strong>. Lo scopo dell'applicazione è di fornirti un'analisi completa sui tuoi allenamenti in bici, incentrata principalmente sui record.",
    introTextMobile:
      "<strong>Best Ride</strong> è un'applicazione web ideata da <strong>Simone Fusar Bassini</strong> per offrirti un'analisi completa sui tuoi allenamenti in bici, focalizzata sui record e gratuita.",
    introHighlight:
      "L'obiettivo è offrire funzionalità avanzate — che su altre applicazioni concorrenti sono a pagamento — in maniera completamente gratuita.",
    howItWorksTitle: "Come funziona",
    optionalTag: "Opzionale",
    outroTitle: "Pronto a partire?",
    outroText: "Goditi l'esperienza e scopri dove puoi spingere i tuoi limiti!",
    outroMobile: "Goditi l'esperienza!",
    mobileSections: {
      setup: "1. Registrazione & Profilo",
      upload: "2. Caricamento File .FIT",
      features: "3. Analisi, Condivisione & Record",
    },
    steps: [
      {
        title: "Registrazione",
        description:
          "Registrandoti ci autorizzi a trattare alcune tue informazioni personali e private. In questo modo le tue analisi saranno più approfondite, accurate e complete.",
      },
      {
        title: "Compilazione Profilo",
        description:
          "Ti chiediamo di inserire alcuni dati fondamentali, come <strong>FTP, peso, data di nascita</strong> e altre informazioni necessarie per calcolare correttamente le metriche delle tue attività.",
      },
      {
        title: "Inserimento Record Pregressi",
        optional: true,
        description:
          "Dalla pagina dei record, puoi inserire manualmente tutte le tue migliori performance storiche di potenza e non solo. Se preferisci non farlo, la piattaforma inizierà a tracciare automaticamente i tuoi record a partire dalla tua prima attività caricata.",
      },
      {
        title: "Caricamento Attività (.FIT)",
        description:
          "Questa è la parte principale dell'applicazione. Devi caricare il file in formato <code>.fit</code> fornito dal ciclocomputer o dalla sua app di supporto.",
        infoBox: {
          title: "Esempio per Bryton (App Active):",
          description:
            "Una volta scaricata l'attività nell'app, condividi il percorso salvandolo su Google Drive (o altro storage) in formato <code>.zip</code>. Estrai il file zip per ottenere il file <code>.fit</code> da caricare su Best Ride.",
          note: "* Stiamo lavorando per rendere l'importazione automatica e immediata, ma al momento è necessario questo passaggio manuale.",
        },
      },
      {
        title: "Verifica Anteprima",
        description:
          "Una volta completato il caricamento, visualizzerai le informazioni essenziali della singola attività, compresi i primi record eventualmente battuti.",
      },
      {
        title: "Conferma & Elaborazione",
        description:
          "Conferma di voler salvare l'attività come tua ultima uscita per accedere immediatamente all'analisi approfondita e completa.",
      },
      {
        title: "Analisi Dettagliata",
        description:
          "Esplora i grafici, i tempi nei segmenti di potenza e i picchi raggiunti.",
      },
      {
        title: "Condivisione Social & Coach",
        description:
          "Condividi facilmente le tue performance con il tuo preparatore atletico, con gli amici o crea la versione grafica pronta per i tuoi follower sui social network.",
      },
      {
        title: "Record Personalizzati",
        description:
          "Puoi creare e gestire record specifici: ad esempio, se ogni anno o mese affronti una salita test, puoi tracciare i tuoi tempi nella sezione dedicata ai record personalizzati.",
      },
    ],
  },
  en: {
    title: "Tutorial & Guide",
    eyebrow:
      "Discover how to get the most out of Best Ride and analyze your cycling performance.",
    introTitle: "What is Best Ride",
    introText:
      "<strong>Best Ride</strong> is a web application created by <strong>Simone Fusar Bassini</strong>. The purpose of the app is to provide you with a comprehensive analysis of your cycling workouts, focusing primarily on personal records.",
    introTextMobile:
      "<strong>Best Ride</strong> is a free web application created by <strong>Simone Fusar Bassini</strong> to offer you detailed cycling analytics centered around your personal records.",
    introHighlight:
      "The goal is to provide advanced features — which are paid on competing applications — completely free of charge.",
    howItWorksTitle: "How it works",
    optionalTag: "Optional",
    outroTitle: "Ready to go?",
    outroText:
      "Enjoy the experience and discover how far you can push your limits!",
    outroMobile: "Enjoy the experience!",
    mobileSections: {
      setup: "1. Registration & Profile",
      upload: "2. Uploading .FIT Files",
      features: "3. Analytics, Sharing & Records",
    },
    steps: [
      {
        title: "Registration",
        description:
          "By registering, you allow us to process essential personal information. This enables us to provide deeper, more accurate, and complete analytics.",
      },
      {
        title: "Profile Setup",
        description:
          "We ask you to enter key data, such as <strong>FTP, weight, date of birth</strong>, and other details required to accurately compute your activity metrics.",
      },
      {
        title: "Historical Records Entry",
        optional: true,
        description:
          "From the records page, you can manually enter your historical best power outputs and performances. If you prefer to skip this, tracking will begin automatically from your first uploaded activity.",
      },
      {
        title: "Activity Upload (.FIT)",
        description:
          "This is the core feature of the application. Upload the <code>.fit</code> file exported from your bike computer or its companion app.",
        infoBox: {
          title: "Example for Bryton (Active App):",
          description:
            "Once saved in the app, share the file to Google Drive (or another cloud storage) as a <code>.zip</code> archive. Extract the zip file to obtain the <code>.fit</code> file to upload on Best Ride.",
          note: "* We are working on automatic direct syncing, but this manual step is currently required.",
        },
      },
      {
        title: "Preview & Verification",
        description:
          "Once uploaded, you will see key summary stats of the activity, including any initial records broken.",
      },
      {
        title: "Confirm & Process",
        description:
          "Confirm saving the activity to immediately unlock its full, in-depth analytical report.",
      },
      {
        title: "Detailed Analytics",
        description:
          "Explore power graphs, power segment durations, and peak outputs reached.",
      },
      {
        title: "Social & Coach Sharing",
        description:
          "Easily share reports with your coach or friends, or generate ready-to-post graphics for your social media followers.",
      },
      {
        title: "Custom Records",
        description:
          "Create and track custom targets: for example, if you regularly test yourself on a specific climb, track your time progression in the custom records section.",
      },
    ],
  },
};

// Computed property che restituisce le traduzioni correnti in base alla lingua scelta
const t = computed(() => translations[currentLang.value]);
</script>

<style scoped>
.tutorial-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 32px 16px;
  padding-bottom: 80px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 4px;
}



/* Bottone Cambio Lingua */
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

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 24px;
}

.card h2 {
  font-size: 18px;
  font-weight: 700;
  margin-top: 0;
  margin-bottom: 16px;
  color: var(--text);
}

.highlight-text {
  margin-top: 12px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.03);
  border-left: 3px solid var(--primary, #00dc82);
  border-radius: 4px;
  font-size: 0.9rem;
}

/* DESKTOP LAYOUT CONFIGURATION */
.desktop-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.step-item {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.step-badge {
  background: var(--primary, #00dc82);
  color: #000;
  font-weight: 700;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.step-content h3 {
  font-size: 15px;
  font-weight: 700;
  margin: 0 0 6px 0;
  color: var(--text);
}

.step-content p {
  font-size: 14px;
  margin: 0;
  color: var(--text-muted, #ccc);
  line-height: 1.5;
}

.optional-tag {
  font-size: 11px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 6px;
}

.info-box {
  margin-top: 10px;
  background: rgba(0, 0, 0, 0.15);
  border: 1px dashed var(--border);
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
}

.info-box strong {
  color: var(--text);
  display: block;
  margin-bottom: 4px;
}

.info-box small {
  display: block;
  margin-top: 8px;
  opacity: 0.7;
}

:deep(code) {
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
}

.outro-card {
  text-align: center;
}

.outro-card h2 {
  margin-bottom: 8px;
}

.outro-card p {
  margin: 0;
  color: var(--text-muted, #aaa);
}

/* MOBILE LAYOUT CONFIGURATION */
.mobile-layout {
  display: none;
  flex-direction: column;
  gap: 12px;
}

.mobile-accordion {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
  overflow: hidden;
}

.accordion-header {
  width: 100%;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: transparent;
  border: none;
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
  cursor: pointer;
  text-align: left;
}

.accordion-content {
  padding: 16px;
  border-top: 1px solid var(--border);
  font-size: 14px;
  line-height: 1.5;
}

.stack-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stack-content h3 {
  font-size: 14px;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.stack-content p {
  margin: 0;
  color: var(--text-muted, #ccc);
}

.mobile-outro {
  text-align: center;
  padding: 16px;
}

.mobile-outro h3 {
  margin: 0;
  font-size: 15px;
}

/* MEDIA QUERIES */
@media (max-width: 768px) {
  .desktop-layout {
    display: none;
  }

  .mobile-layout {
    display: flex;
  }
}
</style>
