<!-- app/app.vue -->
<template>
  <v-app>
    <Navbar />
    <v-main>
      <NuxtPage />
    </v-main>
    <Footer />
  </v-app>
</template>
<style>
.app-root {
  background: var(--bg) !important;
}
</style>
<script setup lang="ts">
import Navbar from "~/components/alwaysUsed/navbar.vue";
import Footer from "~/components/alwaysUsed/footer.vue";
</script>
