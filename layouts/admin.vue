<script setup lang="ts">
useHead({ titleTemplate: (t) => (t ? `${t} — Admin` : 'Admin') })
</script>

<template>
  <div class="admin-layout">
    <main class="admin-main">
      <slot/>
    </main>
  </div>
</template>

<style scoped>
/* базовая типографика для админки */
.admin-layout{
  min-height: 100dvh;
  background: #0e101b;
  color: #e7eaf3;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
  font-size: 16px;           /* ВАЖНО: фиксим «слишком мелкий текст» */
  line-height: 1.45;
}
.admin-main{
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: 24px;
}
:global(.admin-layout *){
  box-sizing: border-box;
}
</style>
