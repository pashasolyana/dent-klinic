<script setup lang="ts">
const modelValue = defineModel<boolean>({ default: false })
const close = () => (modelValue.value = false)

// Закрытие по ESC и клику на оверлей
onMounted(() => {
  const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
  window.addEventListener('keydown', onKey)
  onUnmounted(() => window.removeEventListener('keydown', onKey))
})
</script>

<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="modelValue" class="mf__overlay" @click.self="close">
        <div class="mf__modal" role="dialog" aria-modal="true">
          <button class="mf__close" @click="close" aria-label="Закрыть">✕</button>
          <slot />
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.mf__overlay{
  position:fixed;inset:0;background:rgba(0,0,0,.55);
  display:grid;place-items:center;z-index:1000;padding:16px
}
.mf__modal{
  position:relative;width:min(720px,100%);
  background:#0f1116;            /* совпадает с --lf-bg */
  border:1px solid rgba(255,255,255,.06);
  border-radius:20px;padding:28px 28px 32px;color:#fff;
  box-shadow: 0 22px 60px rgba(0,0,0,.55);
}
.mf__close{
  position:absolute;top:14px;right:14px;border:0;background:transparent;
  color:#9aa0a6;font-size:20px;cursor:pointer;line-height:1;
  transition: opacity .15s ease;
}
.mf__close:hover{ opacity:.8 }

.fade-enter-active,.fade-leave-active{transition:opacity .2s}
.fade-enter-from,.fade-leave-to{opacity:0}
</style>
