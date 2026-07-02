<script setup lang="ts">
const accepted = useCookie<boolean>('cookie_notice_ack', {
  maxAge: 60 * 60 * 24 * 365,
  sameSite: 'lax'
})

function accept() {
  accepted.value = true
}
</script>

<template>
  <transition name="cb-fade">
    <div v-if="!accepted" class="cb" role="dialog" aria-live="polite">
      <p class="cb__text">
        Сайт использует технически необходимые файлы cookie для корректной работы. Подробнее — в
        <NuxtLink to="/privacy" class="cb__link">политике конфиденциальности</NuxtLink>.
      </p>
      <button type="button" class="cb__btn" @click="accept">Понятно</button>
    </div>
  </transition>
</template>

<style scoped>
.cb {
  position: fixed;
  left: 16px;
  right: 16px;
  bottom: 16px;
  z-index: 2000;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  max-width: 720px;
  margin: 0 auto;
  padding: 16px 20px;
  border-radius: 14px;
  background: #14161f;
  color: #e7e9ee;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.35);
}

.cb__text {
  flex: 1 1 260px;
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

.cb__link {
  color: #4d8aff;
  text-decoration: underline;
}

.cb__btn {
  flex: 0 0 auto;
  background: #2f6bff;
  color: #fff;
  border: 0;
  border-radius: 999px;
  padding: 10px 22px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.cb-fade-enter-active,
.cb-fade-leave-active {
  transition: opacity 0.2s ease;
}
.cb-fade-enter-from,
.cb-fade-leave-to {
  opacity: 0;
}

@media (max-width: 480px) {
  .cb {
    left: 12px;
    right: 12px;
    bottom: 12px;
    padding: 14px 16px;
  }
}
</style>
