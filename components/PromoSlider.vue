<template>
  <section ref="promoRoot" class="promo">
    <div class="promo__slides">
      <article
        v-for="(s, i) in slides"
        :key="s.id"
        class="promo__slide"
        :style="{ '--bg': `url(${s.img})` }"
        :class="{ active: i === currentIndex }"
      >
        <div class="promo__overlay" aria-hidden="true"></div>

        <div class="promo__content">
          <h3 class="promo__title">«{{ s.title }}»</h3>
          <p class="promo__desc" v-html="s.text"></p>

          <div class="promo__cta">
            <!-- Кнопка только если есть текст -->
            <component
              v-if="hasCta(s)"
              :is="linkHref(s) ? 'a' : 'button'"
              class="promo__btn"
              :href="linkHref(s) || undefined"
              type="button"
              @click="onCtaClick($event, s)"
            >
              {{ btnText(s) }}
            </component>

            <!-- БЕСПЛАТНО — можно одновременно с ценой -->
            <div v-if="isFree(s)" class="promo__free">{{ freeLabel(s) }}</div>

            <!-- Цена -->
            <div v-if="hasAnyPrice(s)" class="promo__price">
              <span v-if="s.price?.new" class="promo__price-new">{{ formatMoney(s.price.new!) }}</span>
              <span v-if="s.price?.old" class="promo__price-old">{{ formatMoney(s.price.old!) }}</span>
            </div>

            <!-- Бейдж скидки -->
            <div v-if="s.discount" class="promo__badge"><span>{{ s.discount }}</span></div>
          </div>
        </div>
      </article>
    </div>

    <!-- Навигация -->
    <button class="promo__nav prev" type="button" aria-label="Предыдущий" data-icon="<" @click.stop.prevent="goPrev"></button>
    <button class="promo__nav next" type="button" aria-label="Следующий" data-icon=">" @click.stop.prevent="goNext"></button>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { usePromo } from '~/composables/usePromo'

type Price = {
  old?: number | string | null
  new?: number | string | null
  label?: string | null
}
export type PromoSlide = {
  id: number
  title: string
  text: string
  img: string
  discount?: string | null
  price?: Price | null
  ctaText?: string
  ctaHref?: string
  free?: boolean
}

const props = defineProps<{
  items?: PromoSlide[]
  ctaText?: string
  ctaHref?: string
}>()

// данные из админки
const { promo } = usePromo()

// приоритет у props.items, иначе берём из API
const slides = computed<PromoSlide[]>(() => {
  if (props.items && props.items.length) return props.items
  return (promo.value as PromoSlide[]) || []
})

// --- CTA ---
const btnText = (s: PromoSlide) =>
  ((s.ctaText ?? props.ctaText ?? '') as string).toString().trim()
const hasCta = (s: PromoSlide) => btnText(s).length > 0
const linkHref = (s: PromoSlide) => s.ctaHref ?? props.ctaHref ?? null

// --- Price helpers ---
const isFree = (s: PromoSlide) =>
  !!s.free || /бесплат/i.test(String(s.price?.label || ''))
const freeLabel = (s: PromoSlide) =>
  (s.price?.label && s.price.label.trim()) || 'БЕСПЛАТНО'
const hasAnyPrice = (s: PromoSlide) => !!(s.price?.old || s.price?.new)

// ₽ + разряды пробелами
function formatMoney(v: number | string): string {
  const raw = String(v).trim().replace(/\s+/g, '')
  if (!/^\d+$/.test(raw)) return String(v) // уже форматировано — не трогаем
  const withSpaces = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return withSpaces + ' ₽'
}

// --- Слайдер ---
const currentIndex = ref(0)
let timer: number | null = null
const delay = 5000

const goPrev = () => {
  const n = slides.value.length
  if (!n) return
  currentIndex.value = (currentIndex.value - 1 + n) % n
  restartAutoplay()
}
const goNext = () => {
  const n = slides.value.length
  if (!n) return
  currentIndex.value = (currentIndex.value + 1) % n
  restartAutoplay()
}
const startAutoplay = () => {
  stopAutoplay()
  if (slides.value.length > 1) timer = window.setInterval(goNext, delay)
}
const stopAutoplay = () => {
  if (timer !== null) { clearInterval(timer); timer = null }
}
const restartAutoplay = () => startAutoplay()

// защита от хэш-ссылок
const promoRoot = ref<HTMLElement | null>(null)
function onCtaClick(e: MouseEvent, s: PromoSlide) {
  const href = linkHref(s)
  if (!href || href === '#' || href.trim() === '' || href.startsWith('#')) {
    e.preventDefault(); e.stopPropagation()
  }
}
function stopHashNav(e: Event) {
  const target = e.target as HTMLElement | null
  const root = promoRoot.value
  if (!target || !root || !root.contains(target)) return
  const a = target.closest?.('a') as HTMLAnchorElement | null
  if (!a) return
  const href = (a.getAttribute('href') || '').trim()
  if (!href || href === '#' || href.startsWith('#')) {
    e.preventDefault(); e.stopPropagation()
  }
}

onMounted(() => {
  startAutoplay()
  document.addEventListener('click', stopHashNav, true)
  document.addEventListener('touchend', stopHashNav as EventListener, { capture: true, passive: false } as any)
})
onBeforeUnmount(() => {
  stopAutoplay()
  document.removeEventListener('click', stopHashNav, true)
  document.removeEventListener('touchend', stopHashNav as EventListener, true)
})

// перезапуск при подгрузке/смене слайдов
watch(slides, (arr) => {
  if (!arr?.length) { stopAutoplay(); currentIndex.value = 0; return }
  if (currentIndex.value >= arr.length) currentIndex.value = 0
  restartAutoplay()
})
</script>




<style scoped>
:host{ --container: 1280rem; }

/* ===== Базовый блок ===== */
.promo{
  position: relative;
  background:#0E101B;
  overflow: hidden;
  --container: 1280rem;
  --pill-h: 56rem;              /* единая высота капсул: "Бесплатно" и новая цена */
}
.promo__slides{ position: relative; height: 680rem; }

.promo__slide{
  position:absolute; inset:0;
  background-image: var(--bg);
  background-size: cover;
  background-position: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity .65s ease;
}
.promo__slide.active{ opacity:1; pointer-events:auto; }

.promo__overlay{
  position:absolute; inset:0; z-index:0;
  background:
    linear-gradient(180deg, rgba(10,16,24,.42) 0%, rgba(10,16,24,.62) 36%, rgba(12,148,172,.33) 86%),
    rgba(0,0,0,.14);
  pointer-events:none;
}

.promo__content{
  position:relative; z-index:1;
  max-width: var(--container);
  margin: 0 auto;
  padding: clamp(28rem, 6vh, 48rem) 24rem;
  height: 100%;
  display:flex; flex-direction:column; justify-content:center; align-items:flex-start;
  gap: 28rem; text-align:left;
}

.promo__title{
  margin:0;
  font: 800 clamp(28rem, 3.6vw + 12rem, 64rem)/1.1 "Montserrat", system-ui;
  color:#fff; text-shadow: 0 2rem 22rem rgba(0,0,0,.35);
}
.promo__desc{
  margin:0; max-width: 1200rem;
  font: 400 clamp(18rem, 1.5vw + 10rem, 36rem)/1.45 "Montserrat", system-ui;
  color:#F3F7FC; text-shadow: 0 1rem 18rem rgba(0,0,0,.25);
}

/* ===== CTA + Цена ===== */
.promo__cta{
  display:flex;
  align-items:center;
  gap:16rem;
  flex-wrap:wrap;
}

.promo__btn{
  display:inline-flex; align-items:center; justify-content:center;
  height: 66rem; padding: 0 36rem; border-radius: 1000rem;
  border: 2rem solid #11C2A3; color:#EAF7F5; background: transparent;
  font: 700 20rem/1 "Montserrat"; text-decoration:none;
  box-shadow: 0 0 0 6rem rgba(17,194,163,.06) inset, 0 10rem 28rem rgba(0,0,0,.25);
  transition: transform .06s ease, box-shadow .15s ease, background-color .15s ease;
  white-space: nowrap;
}
.promo__btn:hover{ background: rgba(17,194,163,.07); box-shadow:0 0 0 6rem rgba(17,194,163,.1) inset, 0 12rem 34rem rgba(0,0,0,.3); }
.promo__btn:active{ transform: translateY(1rem); }

/* Контейнер цены: капсула сверху, старая цена ниже и по центру */
.promo__price{
  display:grid;
  grid-template-rows: var(--pill-h) auto;
  justify-items:center;
  align-items:center;
  min-width:max-content;
  row-gap:10rem;
}
.promo__price-new{
  display:inline-flex; align-items:center; justify-content:center;
  height: var(--pill-h);
  padding: 0 26rem;
  border-radius: 999rem;
  background:#fff;
  color:#08b5cd;
  font: 800 36rem/1 "Montserrat";
  white-space:nowrap;
  box-shadow:0 12rem 36rem rgba(0,0,0,.18);
}
.promo__price-old{
  justify-self:center;
  color:#8FA1B4;
  opacity:.95;
  text-decoration: line-through;
  text-decoration-thickness: 3rem;
  text-decoration-color: rgba(143,161,180,.95);
  font: 700 22rem/1 "Montserrat";
  white-space:nowrap;
  margin: 0;
}

/* Капсула "Бесплатно" той же высоты */
.promo__free{
  display:inline-flex; align-items:center; justify-content:center;
  height: var(--pill-h);
  padding: 0 20rem;
  border-radius:999rem;
  background:#11C2A3;
  color:#fff;
  font:700 18rem/1 "Montserrat";
  white-space:nowrap;
}

/* ===== Бейдж скидки ===== */
.promo__badge{
  min-width:160rem; height:120rem; border-radius:28rem;
  display:grid; place-items:center; background:#fff;
  box-shadow:0 12rem 36rem rgba(0,0,0,.25);
}
.promo__badge span{ font:800 46rem/1 "Montserrat"; color:#12A9C7; letter-spacing:.02em; }

/* ===== Стрелки ===== */
.promo__nav{
  position:absolute; top:50%; transform: translateY(-50%); z-index:5;
  background: transparent; border:0; border-radius:0;
  font: 800 40rem/1 "Montserrat", system-ui; color:#fff;
  text-shadow: 0 2rem 14rem rgba(0,0,0,.45);
  user-select:none; cursor:pointer;
  padding: 8rem 12rem; -webkit-tap-highlight-color: transparent; touch-action: manipulation;
}
.promo__nav.prev{ left: 12rem; }
.promo__nav.next{ right: 12rem; }
.promo__nav::before{ content: attr(data-icon); display:block; }
.promo__nav:hover{ opacity:.9; }
.promo__nav:active{ transform: translateY(-50%) scale(.98); }

/* деактивируем любые "хэш-ссылки" внутри promo */
:where(.promo) :deep(a[href="#"]),
:where(.promo) :deep(a[href=""]),
:where(.promo) :deep(a[href^="#"]),
:where(.promo) :deep(a:not([href])) {
  pointer-events: none;
  cursor: default;
}

/* ===== Планшеты ===== */
@media (max-width: 1200px){
  .promo__slides{ height: 620rem; }
  .promo__badge{ min-width: 140rem; height: 110rem; }
  .promo__badge span{ font-size: 40rem; }
}

/* ===== Небольшие ноутбуки ===== */
@media (max-width: 1024px){
  .promo__nav{ font-size:34rem; padding:10rem 12rem; top:50%; transform:translateY(-50%); }
}

/* ===== Мобильные ===== */
@media (max-width: 600px){
  .promo{ --pill-h: 50rem; }
  .promo__slides{ height: 480rem; }
  .promo__content{ gap: 16rem; padding: 24rem 18rem 22rem; }
  .promo__title{ font-size: clamp(22rem, 6.4vw, 30rem); }
  .promo__desc{ font-size: 14rem; max-width: 94%; }

  .promo__cta{
    width:100%;
    flex-direction: column;
    align-items: flex-start;
    gap:12rem;
  }
  .promo__btn{ height: 50rem; padding: 0 22rem; font-size: 16rem; }

  .promo__price{ row-gap:8rem; }
  .promo__price-new{ font-size:22rem; padding:0 18rem; }
  .promo__price-old{ font-size:16rem; }
  .promo__free{ font-size:14rem; padding:0 14rem; }

  .promo__badge{ min-width: 110rem; height: 84rem; border-radius: 20rem; }
  .promo__badge span{ font-size: 28rem; }

  .promo__nav { font-size: 20rem; padding: 6rem; opacity: .5; }
  .promo__nav.prev { left: 4rem; }
  .promo__nav.next { right: 4rem; }
}
</style>

