<template>
  <div class="legal-page">
    <h1>Privacy Policy</h1>
    <p class="last-updated">Last updated: {{ lastUpdated }}</p>

    <section>
      <h2>1. Who we are</h2>
      <p>
        Best Ride ("we", "us", "our") is a cycling performance tracking web
        application created by Simone Fusar Bassini, also available as an
        installable Progressive Web App (PWA). This Privacy Policy explains what
        personal data we collect, why we collect it, and how users can control
        their information.
      </p>
    </section>

    <section>
      <h2>2. Authentication and account data</h2>
      <p>
        Best Ride uses Google OAuth for authentication. We do not store
        passwords.
      </p>
      <p>
        When you sign in with Google, we receive and store the following
        information:
      </p>
      <ul>
        <li>Name</li>
        <li>Email address</li>
        <li>Google account identifier (Google ID)</li>
      </ul>
    </section>

    <section>
      <h2>3. Personal and cycling data we collect</h2>
      <p>To provide personalized cycling performance analysis, we collect:</p>
      <ul>
        <li>Name and surname</li>
        <li>Date of birth</li>
        <li>Sex</li>
        <li>Weight</li>
        <li>Functional Threshold Power (FTP)</li>
        <li>Anaerobic threshold</li>
        <li>Total cycling distance and hours recorded</li>
      </ul>
    </section>

    <section>
      <h2>4. Activity data</h2>
      <p>
        Users can manually upload cycling activity files in .fit format. These
        files may contain:
      </p>
      <ul>
        <li>Power data</li>
        <li>Speed</li>
        <li>Cadence</li>
        <li>Heart rate</li>
        <li>GPS coordinates, if available in the file</li>
        <li>Elevation data</li>
        <li>Distance and duration</li>
      </ul>
      <p>
        Uploaded activities are processed to calculate performance metrics,
        training load, personal records, and other cycling statistics. Processed
        activity data is retained until the user uploads a newer activity file
        or deletes their account.
      </p>
    </section>

    <section>
      <h2>5. Use of GPS data</h2>
      <p>
        If GPS information is included in an uploaded activity file, it may be
        used to display the route map of the cycling activity. GPS data is not
        used for advertising or tracking purposes.
      </p>
    </section>

    <section>
      <h2>6. Why we process your data</h2>
      <p>
        We process your data only to provide Best Ride's core functionality,
        including:
      </p>
      <ul>
        <li>Performance analysis</li>
        <li>Power curve calculation</li>
        <li>Personal records tracking</li>
        <li>Training metrics calculation</li>
        <li>Visualization of cycling activities</li>
      </ul>
      <p>
        We do not sell personal data and we do not use personal information for
        advertising purposes.
      </p>
    </section>

    <section>
      <h2>7. Legal basis</h2>
      <p>
        We process personal data based on your consent and because processing is
        necessary to provide the service you requested, according to Article
        6(1)(a) and 6(1)(b) of the GDPR.
      </p>
    </section>

    <section>
      <h2>8. Data retention</h2>
      <p>
        Your personal data is stored while your account remains active. You can
        delete your account at any time using the account deletion feature
        available in the application. Account deletion removes your associated
        personal data.
      </p>
    </section>

    <section>
      <h2>9. Data security</h2>
      <p>
        We apply reasonable technical and organizational measures to protect
        your personal data against unauthorized access, alteration, disclosure,
        or destruction.
      </p>
    </section>

    <section>
      <h2>10. Your rights under GDPR</h2>
      <p>You have the right to:</p>
      <ul>
        <li>Access your personal data</li>
        <li>Correct inaccurate information</li>
        <li>Request deletion of your data</li>
        <li>Receive your data in a portable format</li>
        <li>Withdraw your consent</li>
      </ul>
    </section>

    <section>
      <h2>11. Third-party services</h2>
      <p>
        Best Ride uses Google OAuth to authenticate users. Google may process
        personal data according to its own privacy policy.
      </p>
    </section>

    <section>
      <h2>12. Contact</h2>
      <p>
        For questions about this Privacy Policy or requests regarding your
        personal data, contact us at:
        <a href="mailto:simofusar@gmail.com"> simofusar@gmail.com </a>
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";

onMounted(() => {
  document.title = "Privacy Policy - Best Ride";
});
const lastUpdated = "July 2026";
</script>
