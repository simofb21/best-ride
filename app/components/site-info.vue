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
      <div class="step">
        <v-icon icon="mdi-cloud-upload-outline" size="30" />
        <h3>1. Upload</h3>
        <p>Drop your .fit file from any bike computer or app</p>
      </div>
      <div class="step">
        <v-icon icon="mdi-chart-line" size="30" />
        <h3>2. Analyze</h3>
        <p>
          Get your full power curve, speed, cadence and heart rate breakdown
        </p>
      </div>
      <div class="step">
        <v-icon icon="mdi-trophy-outline" size="30" />
        <h3>3. Beat your records</h3>
        <p>Every ride is checked against your personal bests, automatically</p>
      </div>
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
      <NuxtLink to="/register" class="cta-btn"
        >Get started — it's free</NuxtLink
      >
      <NuxtLink to="/login" class="cta-btn">Already have an account?</NuxtLink>
      <NuxtLink to="/tutorial" class="cta-secondary">See how it works</NuxtLink>
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

.step {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 28px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.step .v-icon {
  color: var(--accent-strong);
  margin-bottom: 4px;
}
.step h3 {
  margin: 0;
  font-size: 15px;
  color: var(--text);
}
.step p {
  margin: 0;
  font-size: 13px;
  color: var(--text-muted);
}

.features {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.feature-card {
  background: var(--surface-alt);
  border-radius: 12px;
  padding: 18px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
  border: 1px solid black;
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

.cta-btn {
  background: var(--accent);
  color: #fff;
  padding: 14px 32px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 15px;
  text-decoration: none;
}
.cta-btn:hover {
  background: var(--accent-strong);
}

.cta-secondary {
  color: var(--text-muted);
  font-size: 13px;
  text-decoration: underline;
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
