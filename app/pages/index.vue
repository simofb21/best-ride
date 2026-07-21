<template>
  <main>
    <img src="/logo.png" alt="Best Ride Logo" class="logo" />
    <h2>Best Ride</h2>
    <p class="tagline">Track your power. Chase your records.</p>
    <div v-if="loggedIn">
      <Dashboard />
    </div>
    <div v-else>
      <SiteInfo />
    </div>
  </main>
</template>
<script setup lang="ts">
const loggedIn = useUserSession();
</script>
<style scoped>
main {
  min-height: 100vh;
  width: 100%;
  padding: 40px 20px 80px;

  display: flex;
  flex-direction: column;
  align-items: center;

  text-align: center;
}

/* LOGO */
.logo {
  width: 200px;
  height: auto;
  margin: 20px auto 15px;
  display: block;
  filter: drop-shadow(0 15px 25px rgba(0, 0, 0, 0.4));
  transition: transform 0.3s ease;
}
.logo:hover {
  transform: scale(1.05);
}

/* TITOLO */
h2 {
  margin: 10px 0;
  font-size: 3.5rem;
  font-weight: 800;
  letter-spacing: -1px;
}

/* TAGLINE */
.tagline {
  margin: 0 auto 50px;
  max-width: 600px;
  font-size: 1.3rem;
}

/* CONTENITORE SITEINFO / DASHBOARD */
main > div {
  width: 100%;
  max-width: 1200px;
  display: flex;
  justify-content: center;
}

/* evita che SiteInfo si attacchi ai bordi */
:deep(.site-info) {
  width: 100%;
}

/* ANIMAZIONE */
.logo,
h2,
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

/* MOBILE */
@media (max-width: 700px) {
  .logo {
    width: 150px;
  }

  h2 {
    font-size: 2.5rem;
  }

  .tagline {
    font-size: 1.1rem;
  }
}
</style>
