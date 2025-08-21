<template>
  <header class="hdr" :class="{ 'is-scroll': scrolled }">
    <div class="hdr__inner">
      <!-- ЛОГО -->
      <a href="/" class="hdr__logo" aria-label="На главную">
        <img src="/images/logo.png" alt="Логотип" />
      </a>

      <!-- МЕНЮ -->
      <nav class="hdr__nav" aria-label="Главное меню">
        <a v-for="l in links" :key="l.href" :href="l.href" class="hdr__link">{{ l.label }}</a>
      </nav>

      <!-- CTA + соцсети -->
      <div class="hdr__right">
        <a href="#form" class="hdr__btn"><span>Оставить заявку</span></a>

        <a class="hdr__soc" :href="waHref" target="_blank" rel="noopener" aria-label="WhatsApp">
          <img src="/images/wa.png" alt="" class="hdr__soc-img" />
        </a>
        <a class="hdr__soc" :href="tgHref" target="_blank" rel="noopener" aria-label="Telegram">
          <img src="/images/tg.png" alt="" class="hdr__soc-img" />
        </a>
      </div>

      <!-- Бургер -->
      <button class="hdr__burger" type="button" :aria-expanded="open" aria-controls="mnav" @click="open = !open">
        <span></span><span></span><span></span>
      </button>
    </div>

    <!-- Drawer -->
    <transition name="drawer">
      <aside v-if="open" id="mnav" class="mnav" role="dialog" aria-modal="true" @click.self="open = false">
        <div class="mnav__panel">
          <button class="mnav__close" type="button" aria-label="Закрыть" @click="open = false">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6 L18 18 M18 6 L6 18" />
            </svg>
          </button>

          <nav class="mnav__links" aria-label="Мобильное меню">
            <a v-for="l in links" :key="l.href" :href="l.href" class="mnav__link" @click="open = false">{{ l.label }}</a>
          </nav>

          <a href="#form" class="mnav__cta" @click="open = false">Оставить заявку</a>

          <div class="mnav__social">
            <a class="mnav__soc" :href="waHref" target="_blank" rel="noopener" aria-label="WhatsApp">
              <img src="/images/wa.png" alt="" class="hdr__soc-img" />
            </a>
            <a class="mnav__soc" :href="tgHref" target="_blank" rel="noopener" aria-label="Telegram">
              <img src="/images/tg.png" alt="" class="hdr__soc-img" />
            </a>
          </div>
        </div>
      </aside>
    </transition>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { useHeaderConfig } from '~/composables/useHeaderConfig'

const defaultLinks   = [
  { label: 'О клинике', href: '#about' },
  { label: 'Акции', href: '#sales' },
  { label: 'Врачи', href: '#doctors' },
  { label: 'Услуги', href: '#services' },
  { label: 'Контакты', href: '#contacts' }
]



const props = defineProps<{
  links?: any[]
}>()

const links = computed(() => props.links ?? defaultLinks)
const { waHref, tgHref } = useHeaderConfig()

const scrolled = ref(false)
const open = ref(false)

const onScroll = () => {
  scrolled.value = window.scrollY > 8
}

const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape') open.value = false
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKey)
})

watch(open, (v) => {
  document.documentElement.style.overflow = v ? 'hidden' : ''
})
</script>

<style scoped>
/* Основной стиль хедера */
.hdr {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 8;
  background: transparent;
  transition: background 0.25s ease, backdrop-filter 0.25s ease;
}
.hdr.is-scroll {
  background: rgba(11, 16, 26, 0.72);
  backdrop-filter: blur(6rem);
}
.hdr__inner {
  max-width: 1360px;
  margin: 0 auto;
  height: 120px;
  padding: 0 24px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 48px;
}
.hdr__logo img {
  width: 56px;
  height: 86px;
  object-fit: contain;
}

/* Навигация */
.hdr__nav {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 56px;
}
.hdr__link {
  font: 500 18px/1 "Montserrat", sans-serif;
  color: #dde9f8;
  text-decoration: none;
  padding: 12px 6px;
  border-radius: 8px;
  transition: 0.15s ease;
}
.hdr__link:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
}

/* Кнопка + соцсети */
.hdr__right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.hdr__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 229px;
  height: 46px;
  background: #0d67f0;
  color: white;
  border-radius: 1000px;
  font: 600 16px "Montserrat", sans-serif;
  text-decoration: none;
}
.hdr__soc {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
}
.hdr__soc-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Бургер */
.hdr__burger {
  display: none;
  position: relative;
  width: 44px;
  height: 44px;
  border: none;
  background: transparent;
  cursor: pointer;
}
.hdr__burger span {
  position: absolute;
  left: 12px;
  right: 12px;
  height: 2px;
  background: #e7f0ff;
  border-radius: 2px;
}
.hdr__burger span:nth-child(1) {
  top: 13px;
}
.hdr__burger span:nth-child(2) {
  top: 21px;
}
.hdr__burger span:nth-child(3) {
  top: 29px;
}

/* Адаптив */
@media (max-width: 1200px) {
  .hdr__nav,
  .hdr__right {
    display: none;
  }
  .hdr__burger {
    display: block;
    margin-left: auto;
  }
  .hdr__inner {
    height: 78px;
  }
  .hdr__logo img {
    width: 44px;
    height: 64px;
  }
}
@media (max-width: 480px) {
  .hdr__inner {
    height: 66px;
  }
  .hdr__logo img {
    width: 36px;
    height: 52px;
  }
}

/* === DRAWER === */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.22s ease;
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.mnav {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: grid;
  background: rgba(0, 0, 0, 0.45);
}

/* === DRAWER PANEL === */
.mnav__panel {
  width: 100vw;
  height: 100vh;
  background: #11121b;
  color: #eaf2ff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-top: calc(env(safe-area-inset-top, 0px) + 16px);
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 20px);
}
@media (max-width: 768px) {
  .mnav__panel {
    padding-top: calc(env(safe-area-inset-top, 0px) + 8px);
    padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 14px);
  }
}

/* Кнопка закрытия */
.mnav__close {
  position: fixed;
  top: calc(env(safe-area-inset-top, 0px) + 10px);
  right: calc(env(safe-area-inset-right, 0px) + 10px);
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border: none;
  background: rgba(0, 0, 0, 0.24);
  backdrop-filter: blur(2px);
  border-radius: 12px;
  cursor: pointer;
  z-index: 2100;
  -webkit-tap-highlight-color: transparent;
}
.mnav__close svg {
  width: 22px;
  height: 22px;
  stroke: #fff;
  stroke-width: 2.2;
  stroke-linecap: round;
  fill: none;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.6));
}
@media (min-width: 600px) {
  .mnav__close {
    width: 52px;
    height: 52px;
    top: calc(env(safe-area-inset-top, 0px) + 16px);
    right: calc(env(safe-area-inset-right, 0px) + 16px);
  }
  .mnav__close svg {
    width: 26px;
    height: 26px;
  }
}

/* Меню */
.mnav__links {
  width: min(520px, 86vw);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(12px, 3.2vw, 20px);
  text-align: center;
}
.mnav__link {
  display: block;
  font: 700 clamp(17px, 4vw, 21px)/1.25 "Montserrat", sans-serif;
  color: #fff;
  text-decoration: none;
  padding: 10px 14px;
  border-radius: 12px;
}
.mnav__link:hover {
  background: rgba(255, 255, 255, 0.06);
}

/* CTA */
.mnav__cta {
  display: flex;
  align-items: center;
  justify-content: center;
  width: min(320px, 86vw);
  height: clamp(44px, 9vw, 52px);
  background: #0d67f0;
  color: #fff;
  text-decoration: none;
  border-radius: 1000px;
  font: 700 clamp(15px, 3.6vw, 18px)/1 "Montserrat";
}

/* Соцсети */
.mnav__social {
  display: flex;
  justify-content: center;
  gap: clamp(14px, 3.6vw, 22px);
}
.mnav__soc {
  width: clamp(36px, 9vw, 44px);
  height: clamp(36px, 9vw, 44px);
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: transparent;
  border: none;
}
.mnav__soc img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* фикс: бургер строго в правом углу строки */
.hdr__burger{
  grid-column: 3 / 4;      /* всегда третья колонка грида */
  justify-self: end;       /* прижать к правому краю колонки */
  align-self: center;      /* по вертикали по центру */
  margin-left: 0;          /* на всякий случай убираем авто-отступы */
}

/* на планшетах/мобилках показываем и сохраняем выравнивание */
@media (max-width: 1200px){
  .hdr__burger{
    display: block;
    grid-column: 3 / 4;
    justify-self: end;
  }
}
</style>
