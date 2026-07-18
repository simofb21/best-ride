<!-- app/components/Navbar.vue -->
<template>
  <v-app-bar color="surface" elevation="0" class="navbar-border">
    <NuxtLink to="/" class="brand">Best Ride</NuxtLink>

    <v-spacer />

    <!-- Link centrali, solo desktop -->
    <div class="nav-links d-none d-md-flex">
      <v-btn to="/tutorial" variant="text" class="nav-link">Tutorial</v-btn>

      <template v-if="loggedIn">
        <v-btn to="/upload" variant="text" class="nav-link">Upload</v-btn>
        <v-btn to="/records" variant="text" class="nav-link">Records</v-btn>
        <v-btn to="/records/custom" variant="text" class="nav-link"
          >Custom Records</v-btn
        >
        <v-btn to="/profile" variant="text" class="nav-link">Profile</v-btn>
      </template>
    </div>

    <v-spacer class="d-none d-md-flex" />

    <!-- Toggle tema, sempre visibile -->
    <ClientOnly>
      <v-btn icon variant="text" @click="toggleTheme">
        <v-icon
          :icon="
            colorMode.value === 'dark'
              ? 'mdi-weather-night'
              : 'mdi-white-balance-sunny'
          "
        />
      </v-btn>
    </ClientOnly>

    <!-- Azioni login/logout, solo desktop -->
    <div class="d-none d-md-flex align-center">
      <template v-if="loggedIn">
        <span class="user-name">{{ user?.firstName || "Error" }}</span>
        <v-btn
          variant="outlined"
          size="small"
          @click="handleLogout"
          prepend-icon="mdi-logout"
        >
          Logout
        </v-btn>
      </template>
      <template v-else>
        <v-btn to="/login" variant="text">Login</v-btn>
        <v-btn to="/register" color="primary">Sign up</v-btn>
      </template>
    </div>

    <!-- Hamburger, solo mobile -->
    <v-app-bar-nav-icon
      class="d-flex d-md-none"
      @click="isDrawerOpen = !isDrawerOpen"
    />
  </v-app-bar>

  <!-- Menu mobile a scomparsa -->
  <v-navigation-drawer v-model="isDrawerOpen" temporary location="right">
    <v-list nav>
      <v-list-item
        to="/tutorial"
        title="Tutorial"
        @click="isDrawerOpen = false"
      />

      <template v-if="loggedIn">
        <v-list-item
          to="/upload"
          title="Upload"
          @click="isDrawerOpen = false"
        />
        <v-list-item
          to="/records"
          title="Records"
          @click="isDrawerOpen = false"
        />
        <v-list-item
          to="/records/custom"
          title="Custom Records"
          @click="isDrawerOpen = false"
        />
        <v-list-item
          to="/profile"
          title="Profile"
          @click="isDrawerOpen = false"
        />
        <v-divider class="my-2" />
        <v-list-item
          title="Logout"
          prepend-icon="mdi-logout"
          @click="handleLogout"
        />
      </template>
      <template v-else>
        <v-divider class="my-2" />
        <v-list-item to="/login" title="Login" @click="isDrawerOpen = false" />
        <v-list-item
          to="/register"
          title="Sign up"
          @click="isDrawerOpen = false"
        />
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
const { loggedIn, user, clear } = useUserSession();
const colorMode = useColorMode();
const isDrawerOpen = ref(false);

function toggleTheme() {
  colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
}

async function handleLogout() {
  await clear();
  isDrawerOpen.value = false;
  await navigateTo("/login");
}
</script>

<style scoped>
.brand {
  font-weight: 800;
  font-size: 18px;
  color: var(--accent-strong);
  text-decoration: none;
  margin-left: 16px;
  margin-right: 8px;
}

.nav-link {
  text-transform: none;
  font-weight: 500;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  margin-right: 12px;
}

.navbar-border {
  border-bottom: 1px solid var(--border);
}
</style>
