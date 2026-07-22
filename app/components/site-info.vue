<template>
  <div class="site-info">
    <section class="about">
      <p>
        Best Ride analyzes your cycling activities directly from your
        <strong>.fit</strong> files — no manual data entry. Upload a ride and
        get an instant, detailed breakdown of your performance.
      </p>
    </section>

    <section class="steps">
      <StepCard icon="mdi-cloud-upload-outline" title="1. Upload">
        Drop your .fit file from any bike computer or app
      </StepCard>
      <StepCard icon="mdi-chart-line" title="2. Analyze">
        Get your full power curve, speed, cadence and heart rate breakdown
      </StepCard>
      <StepCard icon="mdi-trophy-outline" title="3. Beat your records">
        Every ride is checked against your personal bests, automatically
      </StepCard>
    </section>

    <p class="tagline">Some of the Features</p>
    <section class="features">
      <div class="feature-card">
        <v-icon icon="mdi-lightning-bolt-outline" size="24" />
        <span>Power Curve Analysis</span>
      </div>
      <div class="feature-card">
        <v-icon icon="mdi-trophy-outline" size="24" />
        <span>Personal Records</span>
      </div>
      <div class="feature-card">
        <v-icon icon="mdi-gauge" size="24" />
        <span>Training Load (TSS / IF)</span>
      </div>
      <div class="feature-card">
        <v-icon icon="mdi-star-outline" size="24" />
        <span>Custom Challenges</span>
      </div>
    </section>

    <section class="cta">
      <CtaButton to="/register">Get started — it's free</CtaButton>
      <CtaButton to="/login">Already have an account?</CtaButton>
      <CtaButton to="/tutorial" secondary>See how it works</CtaButton>
    </section>
  </div>
</template>

<script setup lang="ts">
// Nessuna logica necessaria per ora — puro contenuto informativo
</script>

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
