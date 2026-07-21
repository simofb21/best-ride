<template>
  <main class="home-page">
    <img src="/logo.png" alt="Best Ride Logo" class="logo" />
    <h1>Best Ride</h1>
    <p class="tagline">Track your power. Chase your records.</p>

    <div class="content-area">
      <Dashboard v-if="loggedIn" />
      <SiteInfo v-else />
    </div>
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
}
</style>
