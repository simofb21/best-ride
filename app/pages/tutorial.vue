<template>
  <div class="tutorial-page">
    <h1 class="page-title">Tutorial & Guida</h1>
    <p class="subtitle">
      Scopri come sfruttare al massimo Best Ride e analizzare le tue prestazioni
      in bici.
    </p>

    <!-- ================= DESKTOP LAYOUT ================= -->
    <div class="desktop-layout">
      <!-- Intro Card -->
      <div class="card intro-card">
        <h2>Cosa è Best Ride</h2>
        <p>
          <strong>Best Ride</strong> è un'applicazione web ideata da
          <strong>Simone Fusar Bassini</strong>. Lo scopo dell'applicazione è di
          fornirti un'analisi completa sui tuoi allenamenti in bici, incentrata
          principalmente sui record.
        </p>
        <p class="highlight-text">
          L'obiettivo è offrire funzionalità avanzate — che su altre
          applicazioni concorrenti sono a pagamento — in maniera completamente
          gratuita.
        </p>
      </div>

      <!-- Steps Grid / Timeline -->
      <div class="card steps-card">
        <h2>Come funziona</h2>
        <div class="steps-list">
          <div class="step-item">
            <div class="step-badge">1</div>
            <div class="step-content">
              <h3>Registrazione</h3>
              <p>
                Registrandoti ci autorizzi a trattare alcune tue informazioni
                personali e private. In questo modo le tue analisi saranno più
                approfondite, accurate e complete.
              </p>
            </div>
          </div>

          <div class="step-item">
            <div class="step-badge">2</div>
            <div class="step-content">
              <h3>Compilazione Profilo</h3>
              <p>
                Ti chiediamo di inserire alcuni dati fondamentali, come
                <strong>FTP, peso, data di nascita</strong> e altre informazioni
                necessarie per calcolare correttamente le metriche delle tue
                attività.
              </p>
            </div>
          </div>

          <div class="step-item">
            <div class="step-badge">3</div>
            <div class="step-content">
              <h3>
                Inserimento Record Pregressi
                <span class="optional-tag">Opzionale</span>
              </h3>
              <p>
                Dalla pagina dei record, puoi inserire manualmente tutte le tue
                migliori performance storiche di potenza e non solo. Se
                preferisci non farlo, la piattaforma inizierà a tracciare
                automaticamente i tuoi record a partire dalla tua prima attività
                caricata.
              </p>
            </div>
          </div>

          <div class="step-item">
            <div class="step-badge">4</div>
            <div class="step-content">
              <h3>Caricamento Attività (.FIT)</h3>
              <p>
                Questa è la parte principale dell'applicazione. Devi caricare il
                file in formato <code>.fit</code> fornito dal ciclocomputer o
                dalla sua app di supporto.
              </p>
              <div class="info-box">
                <strong>Esempio per Bryton (App Active):</strong>
                <p>
                  Una volta scaricata l'attività nell'app, condividi il percorso
                  salvandolo su Google Drive (o altro storage) in formato
                  <code>.zip</code>. Estrai il file zip per ottenere il file
                  <code>.fit</code> da caricare su Best Ride.
                </p>
                <small
                  >* Stiamo lavorando per rendere l'importazione automatica e
                  immediata, ma al momento è necessario questo passaggio
                  manuale.</small
                >
              </div>
            </div>
          </div>

          <div class="step-item">
            <div class="step-badge">5</div>
            <div class="step-content">
              <h3>Verifica Anteprima</h3>
              <p>
                Una volta completato il caricamento, visualizzerai le
                informazioni essenziali della singola attività, compresi i primi
                record eventualmente battuti.
              </p>
            </div>
          </div>

          <div class="step-item">
            <div class="step-badge">6</div>
            <div class="step-content">
              <h3>Conferma & Elaborazione</h3>
              <p>
                Conferma di voler salvare l'attività come tua ultima uscita per
                accedere immediatamente all'analisi approfondita e completa.
              </p>
            </div>
          </div>

          <div class="step-item">
            <div class="step-badge">7</div>
            <div class="step-content">
              <h3>Analisi Dettagliata</h3>
              <p>
                Esplora i grafici, i tempi nei segmenti di potenza e i picchi
                raggiunti.
              </p>
            </div>
          </div>

          <div class="step-item">
            <div class="step-badge">8</div>
            <div class="step-content">
              <h3>Condivisione Social & Coach</h3>
              <p>
                Condividi facilmente le tue performance con il tuo preparatore
                atletico, con gli amici o crea la versione grafica pronta per i
                tuoi follower sui social network.
              </p>
            </div>
          </div>

          <div class="step-item">
            <div class="step-badge">9</div>
            <div class="step-content">
              <h3>Record Personalizzati</h3>
              <p>
                Puoi creare e gestire record specifici: ad esempio, se ogni anno
                o mese affronti una salita test, puoi tracciare i tuoi tempi
                nella sezione dedicata ai record personalizzati.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Outro Card -->
      <div class="card outro-card">
        <h2>Pronto a partire?</h2>
        <p>Goditi l'esperienza e scopri dove puoi spingere i tuoi limiti!</p>
      </div>
    </div>

    <!-- ================= MOBILE LAYOUT (ACCORDION RECTANGLES) ================= -->
    <div class="mobile-layout">
      <!-- Section 1: Intro -->
      <div class="mobile-accordion">
        <button class="accordion-header" @click="toggleSection('intro')">
          <span>Cosa è Best Ride</span>
          <v-icon
            :icon="
              activeSection === 'intro' ? 'mdi-chevron-up' : 'mdi-chevron-down'
            "
          />
        </button>
        <div v-if="activeSection === 'intro'" class="accordion-content">
          <p>
            <strong>Best Ride</strong> è un'applicazione web ideata da
            <strong>Simone Fusar Bassini</strong> per offrirti un'analisi
            completa sui tuoi allenamenti in bici, focalizzata sui record e
            gratuita.
          </p>
        </div>
      </div>

      <!-- Section 2: Primi Passi -->
      <div class="mobile-accordion">
        <button class="accordion-header" @click="toggleSection('setup')">
          <span>1. Registrazione & Profilo</span>
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
          <div>
            <h3>Registrazione</h3>
            <p>
              Con la registrazione ci autorizzi al trattamento dei dati
              necessari per rendere le analisi personalizzate ed approfondite.
            </p>
          </div>
          <div>
            <h3>Compilazione Profilo</h3>
            <p>
              Inserisci FTP, peso e data di nascita per un calcolo preciso delle
              zone e delle metriche di potenza.
            </p>
          </div>
          <div>
            <h3>Record Pregressi <small>(Opzionale)</small></h3>
            <p>
              Puoi caricare manualmente i tuoi storici migliori oppure iniziare
              direttamente con la prima attività per farli tracciare in
              automatico.
            </p>
          </div>
        </div>
      </div>

      <!-- Section 3: Caricamento Attività -->
      <div class="mobile-accordion">
        <button class="accordion-header" @click="toggleSection('upload')">
          <span>2. Caricamento File .FIT</span>
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
          <p>
            Scarica ed estrai il file <code>.fit</code> generato dal tuo
            ciclocomputer e caricalo nel sistema.
          </p>
          <div class="info-box">
            <strong>Esempio Bryton:</strong>
            <p>
              Dall'app Active, condividi il percorso (es. su Google Drive in
              formato .zip), unzippalo e seleziona il file .fit da caricare.
            </p>
          </div>
        </div>
      </div>

      <!-- Section 4: Analisi e Condivisione -->
      <div class="mobile-accordion">
        <button class="accordion-header" @click="toggleSection('features')">
          <span>3. Analisi, Condivisione & Record</span>
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
          <div>
            <h3>Analisi & Conferma</h3>
            <p>
              Visualizza l'anteprima, conferma l'upload per sbloccare il report
              dettagliato della sessione.
            </p>
          </div>
          <div>
            <h3>Condivisione</h3>
            <p>
              Esporta report e grafici per il tuo preparatore atletico o da
              condividere sui social.
            </p>
          </div>
          <div>
            <h3>Record Personalizzati</h3>
            <p>Traccia le tue salite test periodiche nella sezione dedicata.</p>
          </div>
        </div>
      </div>

      <!-- Outro Banner Mobile -->
      <div class="card outro-card mobile-outro">
        <h3>Goditi l'esperienza! 🚴‍♂️</h3>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

// Se utilizzi il middleware di autenticazione come nella pagina profilati
definePageMeta({ middleware: "auth" });

// Stato della fisarmonica per Mobile (aperta di default sulla intro)
const activeSection = ref<string | null>("intro");

function toggleSection(section: string) {
  activeSection.value = activeSection.value === section ? null : section;
}
</script>

<style scoped>
.tutorial-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 32px 16px;
  padding-bottom: 80px;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 4px;
}

.subtitle {
  color: var(--text-muted, #888);
  margin-bottom: 24px;
  font-size: 0.95rem;
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

code {
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

/* SWITCH MEDIA QUERIES */
@media (max-width: 768px) {
  .desktop-layout {
    display: none;
  }

  .mobile-layout {
    display: flex;
  }
}
</style>
