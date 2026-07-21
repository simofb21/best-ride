<template>
  <v-app-bar elevation="0" class="navbar">
    <!-- Brand -->
    <NuxtLink to="/" class="brand"> Best Ride </NuxtLink>
    <NuxtLink to="/" class="logo-link">
      <img src="/favicon.ico" alt="Logo" height="40" width="40" />
    </NuxtLink>
    <v-spacer />
    <!-- NAV DESKTOP -->
    <div class="d-none d-md-flex align-center">
      <v-btn
        to="/tutorial"
        variant="text"
        class="nav-link"
        prepend-icon="mdi-cast-education"
      >
        Tutorial
      </v-btn>

      <template v-if="loggedIn">
        <v-btn
          to="/upload"
          variant="text"
          class="nav-link"
          prepend-icon="mdi-upload"
        >
          Upload
        </v-btn>

        <v-btn
          to="/activity-info"
          variant="text"
          class="nav-link"
          prepend-icon="mdi-poll"
        >
          Activity
        </v-btn>

        <v-btn
          to="/records"
          variant="text"
          class="nav-link"
          prepend-icon="mdi-trophy-award"
        >
          Records
        </v-btn>

        <v-btn
          to="/record-custom"
          variant="text"
          class="nav-link"
          prepend-icon="mdi-bullseye-arrow"
        >
          Custom
        </v-btn>

        <v-btn
          to="/profile"
          variant="text"
          class="nav-link"
          prepend-icon="mdi-account"
        >
          Profile
        </v-btn>
      </template>
    </div>

    <v-spacer class="d-none d-md-flex" />

    <!-- DARK MODE -->
    <ClientOnly>
      <v-btn icon variant="text" class="theme-btn" @click="toggleTheme">
        <v-icon>
          {{
            colorMode.value === "dark"
              ? "mdi-weather-night"
              : "mdi-white-balance-sunny"
          }}
        </v-icon>
      </v-btn>
    </ClientOnly>

    <!-- LOGIN DESKTOP -->
    <div class="d-none d-md-flex align-center">
      <template v-if="loggedIn">
        <span class="user-name">
          {{ user?.firstName || "User" }}
        </span>

        <v-btn
          variant="outlined"
          size="small"
          prepend-icon="mdi-logout"
          @click="handleLogout"
        >
          Logout
        </v-btn>
      </template>
      <template v-else>
        <v-btn to="/login" variant="text"> Login </v-btn>
        <v-btn to="/register" class="signup"> Sign up </v-btn>
      </template>
    </div>
    <!-- MOBILE BUTTON -->
    <v-app-bar-nav-icon class="mobile-menu d-md-none" @click="drawer = true" />
  </v-app-bar>
  <!-- MOBILE DRAWER -->
  <v-navigation-drawer
    v-model="drawer"
    temporary
    location="right"
    class="mobile-drawer"
  >
    <v-list nav>
      <v-list-item
        to="/tutorial"
        title="Tutorial"
        prepend-icon="mdi-cast-education"
        @click="drawer = false"
      />
      <template v-if="loggedIn">
        <v-list-item
          to="/upload"
          title="Upload"
          prepend-icon="mdi-upload"
          @click="drawer = false"
        />
        <v-list-item
          to="/activity-info"
          title="Activity info"
          prepend-icon="mdi-poll"
          @click="drawer = false"
        />
        <v-list-item
          to="/records"
          title="Records"
          prepend-icon="mdi-trophy-award"
          @click="drawer = false"
        />
        <v-list-item
          to="/record-custom"
          title="Custom Records"
          prepend-icon="mdi-bullseye-arrow"
          @click="drawer = false"
        />
        <v-list-item
          to="/profile"
          title="Profile"
          prepend-icon="mdi-account"
          @click="drawer = false"
        />
        <v-list-item
          to="/privacy-policy"
          title="Privacy Policy"
          prepend-icon="mdi-shield-account"
          @click="drawer = false"
        />
        <v-divider class="my-3" />
        <v-list-item
          title="Logout"
          prepend-icon="mdi-logout"
          @click="handleLogout"
        />
      </template>
      <template v-else>
        <v-divider class="my-3" />

        <v-list-item
          to="/login"
          title="Login"
          prepend-icon="mdi-login"
          @click="drawer = false"
        />
        <v-list-item
          to="/register"
          title="Sign up"
          prepend-icon="mdi-account-plus"
          @click="drawer = false"
        />
      </template>
    </v-list>
  </v-navigation-drawer>
</template>
<script setup lang="ts">
const { loggedIn, user, clear } = useUserSession();
const colorMode = useColorMode();
const drawer = ref(false);
function toggleTheme() {
  colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
}
async function handleLogout() {
  await clear();
  drawer.value = false;
  navigateTo("/login");
}
</script>
<style scoped>
.navbar {
  background: var(--surface) !important;
  color: var(--text);
  border-bottom: 1px solid var(--border);
}
/* BRAND */
.brand {
  color: var(--accent-strong);
  font-size: 18px;
  font-weight: 800;
  text-decoration: none;
  margin-left: 16px;
  margin-right: 10px;
}
.logo-link {
  display: flex;
  align-items: center;
}
/* DESKTOP */
.nav-link {
  color: var(--text) !important;
  text-transform: none;
}
.nav-link:hover {
  color: var(--accent) !important;
}
.user-name {
  color: var(--text);
  font-weight: 600;
  margin-right: 12px;
}
/* BOTTONI */
.signup {
  background: var(--accent) !important;
  color: white !important;
}
.theme-btn {
  color: var(--text);
}
/* MOBILE ICON */
.mobile-menu {
  color: var(--text);
}
/* DRAWER MOBILE */
.mobile-drawer {
  background: var(--surface) !important;
  color: var(--text);
}
:deep(.v-list-item-title) {
  color: var(--text);
}
:deep(.v-list-item) {
  color: var(--text);
}
:deep(.v-list-item .v-icon) {
  color: var(--accent);
}
:deep(.v-divider) {
  border-color: var(--border);
}
/* OUTLINED */
:deep(.v-btn--variant-outlined) {
  border-color: var(--accent);
  color: var(--accent);
}
:deep(.v-btn--variant-outlined:hover) {
  background: var(--accent);
  color: white;
}
</style>
