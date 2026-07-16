// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  css: ["@mdi/font/css/materialdesignicons.min.css", "@/assets/css/theme.css"],
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxtjs/color-mode",
    "@vite-pwa/nuxt",
    "nuxt-auth-utils",
    "vuetify-nuxt-module",
  ],
  colorMode: {
    classSuffix: "", // così ottieni classe "dark"/"light" pulita, senza "-mode" appeso
  },
  vuetify: {
    vuetifyOptions: {
      icons: {
        defaultSet: "mdi",
      },
    },
  },
});
