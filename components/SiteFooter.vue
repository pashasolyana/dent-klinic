<script setup lang="ts">
import { useContacts } from '~/composables/useContacts'
const { contacts } = useContacts()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="sf">
    <div class="sf__inner">
      <p class="sf__copy">© {{ year }} Стоматология доктора Бронникова. Все права защищены.</p>
      <nav class="sf__links">
        <a v-if="contacts?.phone" :href="`tel:${contacts.phone}`" class="sf__link">{{ contacts.phone }}</a>
        <NuxtLink to="/privacy" class="sf__link">Политика конфиденциальности</NuxtLink>
      </nav>
    </div>
  </footer>
</template>

<style scoped>
.sf {
  background: #0b0c12;
  color: #9aa0a6;
  padding: 24px 20px;
}
.sf__inner {
  max-width: 1240px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  gap: 12px 24px;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
}
.sf__copy {
  margin: 0;
}
.sf__links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
}
.sf__link {
  color: #c9ccd3;
  text-decoration: none;
}
.sf__link:hover {
  text-decoration: underline;
}
</style>
