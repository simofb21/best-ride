// nuxt.config.ts
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
    },
    moduleOptions: {
      importComposables: false,
    },
  },

  pwa: {
    registerType: "autoUpdate",

    manifest: {
      name: "Best Ride",
      short_name: "Best Ride",
      description: "Track your power. Chase your records.",
      theme_color: "#22c55e",
      background_color: "#0b0f14",
      display: "standalone",
      orientation: "portrait",
      start_url: "/",
      lang: "it",
      icons: [
        {
          src: "/icons/launchericon-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/icons/launchericon-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
        {
          src: "/icons/launchericon-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
      share_target: {
        action: "/share-upload",
        method: "POST",
        enctype: "multipart/form-data",
        params: {
          files: [
            {
              name: "file",
              accept: [
                ".fit",
                ".zip",
                "application/zip",
                "application/octet-stream",
                "application/x-zip-compressed",
                "application/x-zip",
                "multipart/x-zip",
                "application/fit",
                "application/vnd.ant.fit",
                "image/png", 
              ],
            },
          ],
        },
      },
    },

    workbox: {
      navigateFallback: "/",
      globPatterns: ["**/*.{js,css,html,png,svg,ico,woff,woff2}"],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: "CacheFirst",
          options: {
            cacheName: "google-fonts-cache",
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365, // 1 anno
            },
          },
        },
        {
          urlPattern: /^\/api\/.*/i,
          handler: "NetworkFirst",
          options: {
            cacheName: "api-cache",
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 5, // 5 minuti
            },
          },
        },
      ],
    },

    devOptions: {
      enabled: true,
      type: "module",
    },
  },
});
