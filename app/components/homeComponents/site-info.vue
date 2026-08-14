<template>
  <div class="site-info">
    <section class="about">
      <p>
        {{ $t("site-info.about") }}
      </p>
    </section>

    <section class="steps">
      <StepCard
        icon="mdi-cloud-upload-outline"
        :title="$t('site-info.steps.upload.title')"
      >
        {{ $t("site-info.steps.upload.description") }}
      </StepCard>

      <StepCard
        icon="mdi-chart-line"
        :title="$t('site-info.steps.analyze.title')"
      >
        {{ $t("site-info.steps.analyze.description") }}
      </StepCard>

      <StepCard
        icon="mdi-trophy-outline"
        :title="$t('site-info.steps.records.title')"
      >
        {{ $t("site-info.steps.records.description") }}
      </StepCard>
    </section>

    <p class="tagline">
      {{ $t("site-info.features.title") }}
    </p>

    <section class="features">
      <div class="feature-card">
        <v-icon icon="mdi-lightning-bolt-outline" size="24" />
        <span>{{ $t("site-info.features.powerCurve") }}</span>
      </div>

      <div class="feature-card">
        <v-icon icon="mdi-trophy-outline" size="24" />
        <span>{{ $t("site-info.features.personalRecords") }}</span>
      </div>

      <div class="feature-card">
        <v-icon icon="mdi-gauge" size="24" />
        <span>{{ $t("site-info.features.trainingLoad") }}</span>
      </div>

      <div class="feature-card">
        <v-icon icon="mdi-star-outline" size="24" />
        <span>{{ $t("site-info.features.customChallenges") }}</span>
      </div>
    </section>

    <section class="cta">
      <CtaButton to="/login">
        {{ $t("site-info.cta.getStarted") }}
      </CtaButton>

      <CtaButton to="/login">
        {{ $t("site-info.cta.alreadyAccount") }}
      </CtaButton>

      <CtaButton to="/tutorial" secondary>
        {{ $t("site-info.cta.seeHowItWorks") }}
      </CtaButton>
    </section>
  </div>
</template>

<style scoped>
.site-info {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 56px;
}
.tagline {
  margin: 0 auto 50px;
  max-width: 600px;
  font-size: 1.3rem;
  color: var(--text-muted);
  margin-bottom: 1rem;
}
.about p {
  max-width: 640px;
  margin: 0 auto;
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-muted);
}
.about strong {
  color: var(--accent-strong);
}

.steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.features {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.feature-card {
  background: var(--surface-alt);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 18px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
}
.feature-card .v-icon {
  color: var(--accent-strong);
}

.cta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

@media (max-width: 700px) {
  .steps,
  .features {
    grid-template-columns: 1fr;
  }
  .features {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
