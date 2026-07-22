<template>
  <div>
    <Navbar />
    <main>
      <slot />
    </main>
  </div>
</template>
<style scoped>
body {
  background: var(--bg);
  color: var(--text);
}
</style>
