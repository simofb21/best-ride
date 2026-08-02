// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  css: ["@mdi/font/css/materialdesignicons.min.css", "@/assets/css/theme.css"],

  compatibilityDate: "2025-07-15",

  devtools: {
    enabled: true,
  },

  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxtjs/color-mode",
    "@vite-pwa/nuxt",
    "nuxt-auth-utils",
    "vuetify-nuxt-module",
  ],

  imports: {
    exclude: ["useLayout"],
  },

  colorMode: {
    classSuffix: "",
  },

  vuetify: {
    vuetifyOptions: {
      icons: {
        defaultSet: "mdi",
      },
      moduleOptions: {
        importComposables: false,
      },
    },
  },

  pwa: {
    manifest: {
      name: "La mia PWA",
      short_name: "MyPWA",
      display: "standalone",

      share_target: {
        action: "/share",
        method: "POST",
        enctype: "multipart/form-data",
        params: {
          files: [
            {
              name: "file",
              accept: [
                ".zip",
                ".fit",
                "application/zip",
                "application/octet-stream",
              ],
            },
          ],
        },
      },
    },
  },
});
