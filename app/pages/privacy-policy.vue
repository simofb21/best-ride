<template>
  <div class="legal-page">
    <h1>Privacy Policy</h1>
    <p class="last-updated">Last updated: {{ lastUpdated }}</p>

    <section>
      <h2>1. Who we are</h2>
      <p>
        Best Ride ("we", "us", "our") provides a cycling performance tracking
        application. This policy explains what personal data we collect, why,
        and how you can control it.
      </p>
    </section>

    <section>
      <h2>2. What data we collect</h2>
      <ul>
        <li>
          <strong>Account data:</strong> name, email address, password (stored
          securely, never in plain text).
        </li>
        <li>
          <strong>Physical data:</strong> weight, FTP (Functional Threshold
          Power), anaerobic threshold — used to calculate personalized training
          metrics.
        </li>
        <li>
          <strong>Activity data:</strong> uploaded .fit files and the metrics
          derived from them (power, speed, cadence, heart rate, GPS location if
          present, elevation,number of hours or kilometers done in the year).
        </li>
        <li>
          <strong>Usage data:</strong> basic technical logs (e.g. login times)
          needed to operate the service securely.
        </li>
      </ul>
    </section>

    <section>
      <h2>3. Why we collect it</h2>
      <p>
        We process this data solely to provide the core functionality of the
        app: calculating your power curve, tracking personal records, and
        showing training load metrics (Intensity Factor, TSS). We do not use
        your data for advertising and do not sell it to third parties.
      </p>
    </section>

    <section>
      <h2>4. Legal basis</h2>
      <p>
        We process your data based on your consent (given at registration) and
        on the necessity to perform the service you requested (Art. 6(1)(a) and
        (b) GDPR).
      </p>
    </section>

    <section>
      <h2>5. Data retention</h2>
      <p>
        Your data is retained for as long as your account is active. You can
        request deletion of your account and all associated data at any time by
        contacting us.
      </p>
    </section>

    <section>
      <h2>6. Your rights</h2>
      <p>Under GDPR, you have the right to:</p>
      <ul>
        <li>Access the personal data we hold about you</li>
        <li>Request correction of inaccurate data</li>
        <li>Request deletion of your data ("right to be forgotten")</li>
        <li>Request a copy of your data in a portable format</li>
        <li>Withdraw consent at any time</li>
      </ul>
    </section>

    <section>
      <h2>7. Data storage and security</h2>
      <p>
        Your data is stored on secured servers. Passwords are never stored in
        plain text. We take reasonable technical measures to protect your data
        from unauthorized access.
      </p>
    </section>

    <section>
      <h2>8. Contact</h2>
      <p>
        For any question about your data or to exercise your rights, contact us
        at:
        <a href="mailto:privacy@bestride.example">privacy@bestride.example</a>
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
const lastUpdated = "July 2026"; // aggiorna manualmente quando modifichi il testo
</script>

<style scoped>
.legal-page {
  max-width: 720px;
  margin: 0 auto;
  padding: 48px 24px 80px;
  color: var(--text);
}
.legal-page h1 {
  font-size: 28px;
  margin-bottom: 4px;
}
.last-updated {
  color: var(--text-muted);
  font-size: 13px;
  margin-bottom: 32px;
}
.legal-page section {
  margin-bottom: 28px;
}
.legal-page h2 {
  font-size: 16px;
  margin-bottom: 8px;
}
.legal-page p,
.legal-page li {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-muted);
}
.legal-page ul {
  padding-left: 20px;
}
.legal-page a {
  color: var(--accent-strong);
}
</style>
