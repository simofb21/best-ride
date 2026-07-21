<!-- app/components/Footer.vue -->
<template>
  <!-- FOOTER DESKTOP -->
  <footer class="app-footer">
    <div class="footer-inner">
      <div class="footer-col brand-col">
        <p class="footer-brand">Best Ride</p>
        <p class="footer-tagline">Track your power. Chase your records.</p>
        <p class="footer-tagline">
          Best Ride is a project made by Simone Fusar Bassini. A cyclist who
          takes care about his performance and wants that him and other riders
          can achieve their goals.
        </p>

        <p v-if="loggedIn" class="footer-user">
          <v-icon icon="mdi-account-circle-outline" size="14" />
          {{ user?.firstName }} {{ user?.lastName }}
        </p>
      </div>

      <div class="footer-col">
        <p class="footer-heading">Navigate</p>
        <NuxtLink to="/upload" class="footer-link">Upload Activity</NuxtLink>
        <NuxtLink to="/activity-info" class="footer-link">Latest Ride</NuxtLink>
        <NuxtLink to="/records" class="footer-link">My Records</NuxtLink>
        <NuxtLink to="/record-custom" class="footer-link"
          >Custom Records</NuxtLink
        >
      </div>

      <div class="footer-col">
        <p class="footer-heading">Account</p>
        <NuxtLink to="/profile" class="footer-link">Profile</NuxtLink>
        <NuxtLink to="/tutorial" class="footer-link">How it works</NuxtLink>
        <NuxtLink to="/privacy-policy" class="footer-link"
          >Privacy Policy</NuxtLink
        >
      </div>

      <div class="footer-col stats-col" v-if="loggedIn && yearlyStats">
        <p class="footer-heading">This year</p>
        <p class="footer-stat">
          <strong>{{ yearlyStats.yearlyDistanceKm ?? 0 }}</strong> km ridden
        </p>
        <p class="footer-stat">
          <strong>{{ yearlyStats.yearlyHours ?? 0 }}</strong> hours on the bike
        </p>
      </div>
    </div>

    <div class="footer-bottom">
      <span>© {{ currentYear }} Best Ride</span>
      <span class="dot">·</span>

      <NuxtLink to="/privacy-policy" class="footer-bottom-link">
        <v-icon size="18">mdi-shield-account-outline</v-icon>
        Privacy Policy
      </NuxtLink>

      <span class="dot">·</span>

      <a
        href="https://www.linkedin.com/in/simone-fusar-bassini-7407003b4"
        class="footer-bottom-link"
      >
        <v-icon size="18">mdi-linkedin</v-icon>
        Simone Fusar Bassini
      </a>

      <span class="dot">·</span>

      <a href="https://www.instagram.com/fb.simo_" class="footer-bottom-link">
        <v-icon size="18">mdi-instagram</v-icon>
        fb.simo_
      </a>

      <span class="dot">·</span>

      <span class="dot">·</span>

      <a href="mailto:simofusar@gmail.com" class="footer-bottom-link">
        <v-icon size="18">mdi-email-outline</v-icon>
        simofusar@gmail.com
      </a>

      <span class="dot">·</span>

      <a
        href="https://github.com/simofb21/best-ride"
        class="footer-bottom-link"
      >
        <v-icon size="18">mdi-github</v-icon>
        simofb21
      </a>
    </div>
  </footer>

  <!-- BOTTOM TAB BAR MOBILE -->
  <nav v-if="loggedIn" class="bottom-tab-bar">
    <NuxtLink
      to="/upload"
      class="tab-item"
      :class="{ active: isActive('/upload') }"
    >
      <v-icon icon="mdi-cloud-upload-outline" size="22" />
      <span>Upload</span>
    </NuxtLink>
    <NuxtLink
      to="/activity-info"
      class="tab-item"
      :class="{ active: isActive('/activity-info') }"
    >
      <v-icon icon="mdi-chart-line" size="22" />
      <span>Latest</span>
    </NuxtLink>
    <NuxtLink
      to="/records"
      class="tab-item"
      :class="{ active: isActive('/records') }"
    >
      <v-icon icon="mdi-trophy-outline" size="22" />
      <span>Records</span>
    </NuxtLink>
    <NuxtLink
      to="/records-custom"
      class="tab-item"
      :class="{ active: isActive('/record-custom') }"
    >
      <v-icon icon="mdi-star-outline" size="22" />
      <span>Custom</span>
    </NuxtLink>
    <NuxtLink
      to="/profile"
      class="tab-item"
      :class="{ active: isActive('/profile') }"
    >
      <v-icon icon="mdi-account-outline" size="22" />
      <span>Profile</span>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
const { loggedIn, user } = useUserSession();
const route = useRoute();

const currentYear = new Date().getFullYear();

function isActive(path: string) {
  return route.path === path;
}

// Riusiamo lo stesso endpoint del profilo per mostrare i km/ore dell'anno nel footer
const yearlyStats = ref<{
  yearlyDistanceKm: number | null;
  yearlyHours: number | null;
} | null>(null);

watchEffect(async () => {
  if (loggedIn.value) {
    try {
      yearlyStats.value = await $fetch("/api/profile");
    } catch {
      yearlyStats.value = null;
    }
  }
});
</script>

<style scoped>
/* ============ FOOTER DESKTOP ============ */
.app-footer {
  border-top: 1px solid var(--border);
  background: var(--surface);
  margin-top: 60px;
  padding: 40px 32px 0;
}

.footer-inner {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 32px;
  padding-bottom: 32px;
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-brand {
  font-weight: 800;
  font-size: 16px;
  color: var(--accent-strong);
  margin: 0;
}
.footer-tagline {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}
.footer-user {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted);
  margin: 8px 0 0;
}

.footer-heading {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin: 0 0 2px;
}

.footer-link {
  font-size: 13px;
  color: var(--text);
  text-decoration: none;
}
.footer-link:hover {
  color: var(--accent-strong);
}

.stats-col .footer-stat {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}
.stats-col .footer-stat strong {
  font-family: var(--mono);
  color: var(--accent-strong);
  font-size: 15px;
}

.footer-bottom {
  border-top: 1px solid var(--border);
  padding: 16px 0;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: var(--text-muted);
  justify-content: space-between;
  align-items: center;
}
.dot {
  opacity: 0.5;
}

/* ============ BOTTOM TAB BAR MOBILE ============ */
.bottom-tab-bar {
  display: none;
}

@media (max-width: 768px) {
  .app-footer {
    display: none; /* su mobile il footer desktop lascia spazio alla tab bar */
  }

  .bottom-tab-bar {
    display: flex;
    justify-content: space-around;
    align-items: center;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--surface);
    border-top: 1px solid var(--border);
    padding: 6px 4px calc(6px + env(safe-area-inset-bottom));
    z-index: 60;
  }

  .tab-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    text-decoration: none;
    color: var(--text-muted);
    font-size: 10px;
    padding: 4px 8px;
    border-radius: 8px;
    flex: 1;
  }
  .tab-item.active {
    color: var(--accent-strong);
  }
}
.footer-bottom-link {
  color: var(--text-muted);
  text-decoration: underline;
}
</style>
