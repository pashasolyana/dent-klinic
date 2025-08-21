<template>
  <main class="page-main">
    <slot />
  </main>
</template>

<script setup lang="ts">
/* Ничего лишнего — только слот */
</script>

<style>
html {
  font-family: "Montserrat", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
}
body {
  margin: 0;
  background: #11111F;
}

.page-main {
  min-height: 100svh;
  padding: 0;
}
</style>
