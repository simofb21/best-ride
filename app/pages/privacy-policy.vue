<template>
  <div class="legal-page">
    <!-- Header -->
    <header class="page-header">
      <div>
        <h1>{{ $t("privacyPolicy.title") }}</h1>

        <p class="last-updated">
          {{ $t("privacyPolicy.lastUpdatedPrefix") }}: {{ lastUpdated }}
        </p>
      </div>
    </header>

    <!-- 1 -->
    <section class="legal-card">
      <h2>{{ $t("privacyPolicy.sections.whoWeAre.title") }}</h2>

      <p>
        {{ $t("privacyPolicy.sections.whoWeAre.text") }}
      </p>
    </section>

    <!-- 2 -->
    <section class="legal-card">
      <h2>{{ $t("privacyPolicy.sections.authentication.title") }}</h2>

      <p>
        {{ $t("privacyPolicy.sections.authentication.intro") }}
      </p>

      <p>
        {{ $t("privacyPolicy.sections.authentication.listIntro") }}
      </p>

      <ul>
        <li
          v-for="(item, index) in $tm(
            'privacyPolicy.sections.authentication.items',
          )"
          :key="index"
        >
          {{ $rt(item) }}
        </li>
      </ul>
    </section>

    <!-- 3 -->
    <section class="legal-card">
      <h2>{{ $t("privacyPolicy.sections.personalData.title") }}</h2>

      <p>
        {{ $t("privacyPolicy.sections.personalData.intro") }}
      </p>

      <ul>
        <li
          v-for="(item, index) in $tm(
            'privacyPolicy.sections.personalData.items',
          )"
          :key="index"
        >
          {{ $rt(item) }}
        </li>
      </ul>
    </section>

    <!-- 4 -->
    <section class="legal-card">
      <h2>{{ $t("privacyPolicy.sections.activityData.title") }}</h2>

      <p>
        {{ $t("privacyPolicy.sections.activityData.intro") }}
      </p>

      <ul>
        <li
          v-for="(item, index) in $tm(
            'privacyPolicy.sections.activityData.items',
          )"
          :key="index"
        >
          {{ $rt(item) }}
        </li>
      </ul>

      <p>
        {{ $t("privacyPolicy.sections.activityData.retention") }}
      </p>
    </section>

    <!-- 5 -->
    <section class="legal-card">
      <h2>{{ $t("privacyPolicy.sections.gps.title") }}</h2>

      <p>
        {{ $t("privacyPolicy.sections.gps.text") }}
      </p>
    </section>

    <!-- 6 -->
    <section class="legal-card">
      <h2>{{ $t("privacyPolicy.sections.whyWeProcess.title") }}</h2>

      <p>
        {{ $t("privacyPolicy.sections.whyWeProcess.intro") }}
      </p>

      <ul>
        <li
          v-for="(item, index) in $tm(
            'privacyPolicy.sections.whyWeProcess.items',
          )"
          :key="index"
        >
          {{ $rt(item) }}
        </li>
      </ul>

      <p>
        {{ $t("privacyPolicy.sections.whyWeProcess.outro") }}
      </p>
    </section>

    <!-- 7 -->
    <section class="legal-card">
      <h2>{{ $t("privacyPolicy.sections.legalBasis.title") }}</h2>

      <p>
        {{ $t("privacyPolicy.sections.legalBasis.text") }}
      </p>
    </section>

    <!-- 8 -->
    <section class="legal-card">
      <h2>{{ $t("privacyPolicy.sections.dataRetention.title") }}</h2>

      <p>
        {{ $t("privacyPolicy.sections.dataRetention.text") }}
      </p>
    </section>

    <!-- 9 -->
    <section class="legal-card">
      <h2>{{ $t("privacyPolicy.sections.security.title") }}</h2>

      <p>
        {{ $t("privacyPolicy.sections.security.text") }}
      </p>
    </section>

    <!-- 10 -->
    <section class="legal-card">
      <h2>{{ $t("privacyPolicy.sections.gdprRights.title") }}</h2>

      <p>
        {{ $t("privacyPolicy.sections.gdprRights.intro") }}
      </p>

      <ul>
        <li
          v-for="(item, index) in $tm(
            'privacyPolicy.sections.gdprRights.items',
          )"
          :key="index"
        >
          {{ $rt(item) }}
        </li>
      </ul>
    </section>

    <!-- 11 -->
    <section class="legal-card">
      <h2>{{ $t("privacyPolicy.sections.thirdParty.title") }}</h2>

      <p>
        {{ $t("privacyPolicy.sections.thirdParty.text") }}
      </p>
    </section>

    <!-- 12 -->
    <section class="legal-card">
      <h2>{{ $t("privacyPolicy.sections.contact.title") }}</h2>

      <p>
        {{ $t("privacyPolicy.sections.contact.text") }}

        <a href="mailto:simofusar@gmail.com"> simofusar@gmail.com </a>
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
const lastUpdated = "August 2026";

useHead({
  title: computed(() => `${$t("privacyPolicy.title")} - Best Ride`),
});
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
