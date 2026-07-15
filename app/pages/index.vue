<template>
  <!-- Sfondo scurissimo (stile Garmin/Strava) che copre tutto lo schermo -->
  <div class="min-h-screen bg-zinc-950 text-zinc-50 font-sans flex flex-col">
    <!-- HEADER / NAVBAR -->
    <header
      class="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur sticky top-0 z-50"
    >
      <div
        class="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between"
      >
        <!-- Logo -->
        <div class="flex items-center gap-2">
          <span class="text-2xl">🏆</span>
          <span
            class="font-black tracking-tight text-xl bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent"
          >
            PERSONAL BEST
          </span>
        </div>
        <!-- Finto Profilo / Stato Utente -->
        <div class="flex items-center gap-3">
          <div class="text-right hidden sm:block">
            <p class="text-xs text-zinc-400">Bentornato,</p>
            <p class="text-sm font-semibold text-zinc-200">Ciclista Anonimo</p>
          </div>
          <div
            class="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-emerald-400"
          >
            C
          </div>
        </div>
      </div>
    </header>

    <!-- CONTENUTO PRINCIPALE -->
    <main class="flex-1 max-w-5xl w-full mx-auto px-4 py-8 flex flex-col gap-8">
      <!-- Sezione Titolo/Benvenuto -->
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight sm:text-4xl">
          La tua bacheca
        </h1>
        <p class="text-zinc-400 mt-1">
          Carica un file .fit per analizzare la tua uscita o controlla i tuoi
          record personali.
        </p>
      </div>

      <!-- Qui inseriremo il box di Drag & Drop nel prossimo step -->
      <div
        class="border-2 border-dashed border-zinc-800 rounded-2xl p-12 text-center bg-zinc-900/20 hover:border-emerald-500/50 transition-colors cursor-pointer"
      >
        <p class="text-zinc-500">Box Drag & Drop (In arrivo...)</p>
      </div>
    </main>
  </div>
</template>
