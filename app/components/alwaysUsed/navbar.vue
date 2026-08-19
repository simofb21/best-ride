<template>
  <v-app-bar elevation="0" class="navbar">
    <!-- Brand -->
    <NuxtLink to="/" class="brand">Best Ride</NuxtLink>

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
        {{ $t("navbar.tutorial") }}
      </v-btn>

      <v-btn
        to="/game"
        variant="text"
        class="nav-link"
        prepend-icon="mdi-controller"
      >
        {{ $t("navbar.playGame") }}
      </v-btn>

      <template v-if="loggedIn">
        <v-btn
          to="/upload"
          variant="text"
          class="nav-link"
          prepend-icon="mdi-upload"
        >
          {{ $t("navbar.upload") }}
        </v-btn>

        <v-btn
          to="/activity-info"
          variant="text"
          class="nav-link"
          prepend-icon="mdi-poll"
        >
          {{ $t("navbar.activity") }}
        </v-btn>

        <v-btn
          to="/records"
          variant="text"
          class="nav-link"
          prepend-icon="mdi-trophy-award"
        >
          {{ $t("navbar.records") }}
        </v-btn>

        <v-btn
          to="/record-custom"
          variant="text"
          class="nav-link"
          prepend-icon="mdi-bullseye-arrow"
        >
          {{ $t("navbar.custom") }}
        </v-btn>

        <v-btn
          to="/profile"
          variant="text"
          class="nav-link"
          prepend-icon="mdi-account"
        >
          {{ $t("navbar.profile") }}
        </v-btn>
      </template>
    </div>

    <v-spacer class="d-none d-md-flex" />

    <!-- LANGUAGE -->
    <ClientOnly>
      <v-menu>
        <template #activator="{ props }">
          <v-btn v-bind="props" variant="text" class="language-btn">
            {{ currentLanguage.flag }}
            {{ currentLanguage.code.toUpperCase() }}
          </v-btn>
        </template>

        <v-list class="language-list">
          <v-list-item
            v-for="language in languages"
            :key="language.code"
            @click="changeLanguage(language.code as 'en' | 'it')"
          >
            <v-list-item-title>
              {{ language.flag }} {{ language.name }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </ClientOnly>

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
          {{ $t("navbar.logout") }}
        </v-btn>
      </template>

      <template v-else>
        <v-btn to="/login" variant="text">
          {{ $t("navbar.login") }}
        </v-btn>
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
        :title="$t('navbar.tutorial')"
        prepend-icon="mdi-cast-education"
        @click="drawer = false"
      />

      <v-list-item
        to="/game"
        :title="$t('navbar.playGame')"
        prepend-icon="mdi-controller"
        @click="drawer = false"
      />

      <template v-if="loggedIn">
        <v-list-item
          to="/upload"
          :title="$t('navbar.upload')"
          prepend-icon="mdi-upload"
          @click="drawer = false"
        />

        <v-list-item
          to="/activity-info"
          :title="$t('navbar.activity')"
          prepend-icon="mdi-poll"
          @click="drawer = false"
        />

        <v-list-item
          to="/records"
          :title="$t('navbar.records')"
          prepend-icon="mdi-trophy-award"
          @click="drawer = false"
        />

        <v-list-item
          to="/record-custom"
          :title="$t('navbar.custom')"
          prepend-icon="mdi-bullseye-arrow"
          @click="drawer = false"
        />

        <v-list-item
          to="/profile"
          :title="$t('navbar.profile')"
          prepend-icon="mdi-account"
          @click="drawer = false"
        />

        <v-list-item
          to="/privacy-policy"
          :title="$t('navbar.privacyPolicy')"
          prepend-icon="mdi-shield-account"
          @click="drawer = false"
        />

        <v-divider class="my-3" />

        <v-list-item
          :title="$t('navbar.logout')"
          prepend-icon="mdi-logout"
          @click="handleLogout"
        />
      </template>

      <template v-else>
        <v-divider class="my-3" />

        <v-list-item
          to="/login"
          :title="$t('navbar.login')"
          prepend-icon="mdi-login"
          @click="drawer = false"
        />
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
const { loggedIn, user, clear } = useUserSession();
const { currentLanguage, languages, changeLanguage } = useLanguage();
const { t } = useI18n();
const appToast = useAppToast();
const colorMode = useColorMode();
const drawer = ref(false);
const loggingOut = ref(false);
function toggleTheme() {
  colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
}
async function handleLogout() {
  if (loggingOut.value) return;
  loggingOut.value = true;

  try {
    await clear();
    drawer.value = false;
    appToast.success(t("notifications.logoutSuccess"), {
      toastId: "logout-success",
    });
    await navigateTo("/login");
  } catch (error) {
    appToast.error(error, t("notifications.logoutFailed"), {
      toastId: "logout-failed",
    });
  } finally {
    loggingOut.value = false;
  }
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
.language-btn {
  color: var(--text) !important;
  text-transform: none;
}
.language-btn:hover {
  color: var(--accent) !important;
}
.language-list {
  background: var(--surface) !important;
  color: var(--text);
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
