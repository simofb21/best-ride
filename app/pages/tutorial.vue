<template>
  <div class="tutorial-page">
    <!-- HEADER -->
    <header class="page-header">
      <div>
        <h1 class="page-title">
          {{ $t("tutorial.title") }}
        </h1>

        <p class="eyebrow">
          {{ $t("tutorial.eyebrow") }}
        </p>
      </div>
    </header>

    <!-- DESKTOP -->
    <div class="desktop-layout">
      <!-- INTRO -->
      <div class="card intro-card">
        <h2>
          {{ $t("tutorial.intro.title") }}
        </h2>

        <p>
          <strong>Best Ride</strong>
          {{ $t("tutorial.intro.text") }}
          <strong>Simone Fusar Bassini</strong>.
        </p>

        <p class="highlight-text">
          {{ $t("tutorial.intro.highlight") }}
        </p>
      </div>

      <!-- STEPS -->
      <div class="card steps-card">
        <h2>
          {{ $t("tutorial.howItWorks") }}
        </h2>

        <div class="steps-list">
          <div v-for="(step, index) in steps" :key="index" class="step-item">
            <div class="step-badge">
              {{ index + 1 }}
            </div>

            <div class="step-content">
              <h3>
                {{ $t(`tutorial.steps.${index}.title`) }}

                <span v-if="step.optional" class="optional-tag">
                  {{ $t("tutorial.optional") }}
                </span>
              </h3>

              <p>
                {{ $t(`tutorial.steps.${index}.description`) }}
              </p>

              <!-- INFO BOX -->
              <div v-if="step.infoBox" class="info-box">
                <strong>
                  {{ $t(`tutorial.steps.${index}.infoBox.title`) }}
                </strong>

                <p>
                  {{ $t(`tutorial.steps.${index}.infoBox.description`) }}
                </p>

                <small>
                  {{ $t(`tutorial.steps.${index}.infoBox.note`) }}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- OUTRO -->
      <div class="card outro-card">
        <h2>
          {{ $t("tutorial.outro.title") }}
        </h2>

        <p>
          {{ $t("tutorial.outro.text") }}
        </p>
      </div>
    </div>

    <!-- MOBILE -->
    <div class="mobile-layout">
      <!-- INTRO -->
      <div class="mobile-accordion">
        <button class="accordion-header" @click="toggleSection('intro')">
          <span>
            {{ $t("tutorial.intro.title") }}
          </span>

          <v-icon
            :icon="
              activeSection === 'intro' ? 'mdi-chevron-up' : 'mdi-chevron-down'
            "
          />
        </button>

        <div v-if="activeSection === 'intro'" class="accordion-content">
          <p>
            <strong>Best Ride</strong>
            {{ $t("tutorial.intro.mobileText") }}
          </p>
        </div>
      </div>

      <!-- SETUP -->
      <div class="mobile-accordion">
        <button class="accordion-header" @click="toggleSection('setup')">
          <span>
            {{ $t("tutorial.mobileSections.setup") }}
          </span>

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
              {{ $t(`tutorial.steps.${i}.title`) }}

              <small v-if="steps[i].optional">
                ({{ $t("tutorial.optional") }})
              </small>
            </h3>

            <p>
              {{ $t(`tutorial.steps.${i}.description`) }}
            </p>
          </div>
        </div>
      </div>

      <!-- UPLOAD -->
      <div class="mobile-accordion">
        <button class="accordion-header" @click="toggleSection('upload')">
          <span>
            {{ $t("tutorial.mobileSections.upload") }}
          </span>

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
            {{ $t("tutorial.steps.3.description") }}
          </p>

          <div v-if="steps[3].infoBox" class="info-box">
            <strong>
              {{ $t("tutorial.steps.3.infoBox.title") }}
            </strong>

            <p>
              {{ $t("tutorial.steps.3.infoBox.description") }}
            </p>
          </div>
        </div>
      </div>

      <!-- FEATURES -->
      <div class="mobile-accordion">
        <button class="accordion-header" @click="toggleSection('features')">
          <span>
            {{ $t("tutorial.mobileSections.features") }}
          </span>

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
            <h3>
              {{ $t(`tutorial.steps.${i}.title`) }}
            </h3>

            <p>
              {{ $t(`tutorial.steps.${i}.description`) }}
            </p>
          </div>
        </div>
      </div>

      <!-- OUTRO MOBILE -->
      <div class="card outro-card mobile-outro">
        <h3>{{ $t("tutorial.outro.mobile") }} 🚴‍♂️</h3>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const activeSection = ref<string | null>("intro");

function toggleSection(section: string) {
  activeSection.value = activeSection.value === section ? null : section;
}

/*
 * Questi dati servono solamente per sapere quali step
 * hanno elementi opzionali/infoBox.
 * I testi vengono tutti presi da i18n.
 */
const steps = [
  {
    optional: false,
    infoBox: false,
  },
  {
    optional: false,
    infoBox: false,
  },
  {
    optional: true,
    infoBox: false,
  },
  {
    optional: false,
    infoBox: true,
  },
  {
    optional: false,
    infoBox: false,
  },
  {
    optional: false,
    infoBox: false,
  },
  {
    optional: false,
    infoBox: false,
  },
  {
    optional: false,
    infoBox: false,
  },
  {
    optional: false,
    infoBox: false,
  },
];
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
