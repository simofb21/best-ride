<template>
  <main class="home-page">
    <img src="/logo.png" alt="Best Ride Logo" class="logo" />
    <h1>Best Ride</h1>
    <p class="tagline">Track your power. Chase your records.</p>

    <div class="content-area">
      <Dashboard v-if="loggedIn" />
      <SiteInfo v-else />
    </div>

    <!-- Solo mobile: info sul progetto/autore, già presenti nel footer desktop -->
    <section class="about-mobile">
      <h2>About us</h2>
      <p>
        Best Ride is a project made by <strong>Simone Fusar Bassini</strong>. A
        cyclist who takes care about his performance and wants that him and
        other riders can achieve their goals.
      </p>

      <div class="about-links">
        <NuxtLink to="/privacy-policy" class="footer-bottom-link">
          <v-icon size="18">mdi-shield-account-outline</v-icon>
          Privacy Policy
        </NuxtLink>

        <a
          href="https://www.linkedin.com/in/simone-fusar-bassini-7407003b4"
          class="footer-bottom-link"
        >
          <v-icon size="18">mdi-linkedin</v-icon>
          Simone Fusar Bassini
        </a>

        <a href="https://www.instagram.com/fb.simo_" class="footer-bottom-link">
          <v-icon size="18">mdi-instagram</v-icon>
          fb.simo_
        </a>

        <a href="mailto:simofusar@gmail.com" class="footer-bottom-link">
          <v-icon size="18">mdi-email-outline</v-icon>
          simofusar@gmail.com
        </a>

        <a
          href="https://github.com/simofb21/best-ride"
          class="footer-bottom-link"
        >
          <v-icon size="18">mdi-github</v-icon>
          simofb21
        </a>
      </div>

      <p class="copyright">© 2026 Best Ride</p>
    </section>
  </main>
</template>

<script setup lang="ts">
const { loggedIn } = useUserSession();
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  width: 100%;
  padding: 40px 20px 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: var(--bg);
  color: var(--text);
}

.logo {
  width: 200px;
  height: auto;
  margin: 20px auto 15px;
  display: block;
  filter: drop-shadow(0 15px 25px rgba(0, 0, 0, 0.25));
  transition: transform 0.3s ease;
}
.logo:hover {
  transform: scale(1.05);
}

h1 {
  margin: 10px 0;
  font-size: 3.5rem;
  font-weight: 800;
  letter-spacing: -1px;
  color: var(--text);
}

.tagline {
  margin: 0 auto 50px;
  max-width: 600px;
  font-size: 1.3rem;
  color: var(--text-muted);
}

.content-area {
  width: 100%;
  max-width: 1200px;
  display: flex;
  justify-content: center;
}

.logo,
h1,
.tagline {
  animation: appear 0.7s ease;
}

@keyframes appear {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Sezione About, visibile solo su mobile — su desktop le stesse info sono nel footer */
.about-mobile {
  display: none;
}

@media (max-width: 700px) {
  .logo {
    width: 150px;
  }
  h1 {
    font-size: 2.5rem;
  }
  .tagline {
    font-size: 1.1rem;
  }

  .about-mobile {
    display: block;
    margin-top: 56px;
    padding-top: 32px;
    border-top: 1px solid var(--border);
    max-width: 480px;
  }

  .about-mobile h2 {
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    margin-bottom: 12px;
  }

  .about-mobile p {
    font-size: 13px;
    line-height: 1.6;
    color: var(--text-muted);
    margin: 0 0 20px;
  }
  .about-mobile p strong {
    color: var(--text);
  }

  .about-links {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    margin-bottom: 20px;
  }

  .footer-bottom-link {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--text-muted);
    text-decoration: none;
  }
  .footer-bottom-link:hover {
    color: var(--accent-strong);
  }

  .copyright {
    font-size: 12px;
    color: var(--text-muted);
    margin: 0;
  }
}
</style>
