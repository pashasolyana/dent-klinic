<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useServices } from '~/composables/useServices'
import { useSeoMeta } from '~/composables/useSeoMeta'
import { useJsonLd } from '~/composables/useJsonLd'

type Work = {
  id: string; title: string; price: number|null; oldPrice: number|null;
  note: string|null; order: number; active: boolean
}

definePageMeta({
  layout: 'custom-default',
  headerLinks: [
    { label: 'О клинике', href: '/o-klinike' },
    { label: 'Акции',     href: '/akcii' }, // fix
    { label: 'Врачи',     href: '/vrachi' },
    { label: 'Услуги',    href: '/uslugi' },
    { label: 'Контакты',  href: '#contacts' }
  ]
})

/* список услуг */
const { services, pending: loadingServices, error } = useServices()
const items = computed(() => (services.value || []).filter(s => s.active !== false))

/* состояние аккордеона */
const openSlug = ref<string | null>(null)

/* кэш ленивых загрузок */
const cache = reactive<Record<string, { loading: boolean; error: string|null; works: Work[] }>>({})

const fmt = (v: number|null) =>
  v == null ? '—' : new Intl.NumberFormat('ru-RU').format(v) + ' ₽'

/* раскрытие без программного скролла страницы */
async function toggle(slug: string) {
  const willOpen = openSlug.value !== slug
  openSlug.value = willOpen ? slug : null
  if (!willOpen) return

  if (!cache[slug]) cache[slug] = { loading: false, error: null, works: [] }
  const slot = cache[slug]
  if (slot.works.length || slot.loading) return

  try {
    slot.loading = true; slot.error = null
    const data = await $fetch<Work[]>(`/api/admin/services/${slug}`)
    slot.works = (data || [])
      .filter(w => w.active !== false)
      .slice()
      .sort((a,b)=>a.order - b.order)
  } catch (e:any) {
    slot.error = e?.data?.message || e?.message || 'Не удалось загрузить позиции'
  } finally {
    slot.loading = false
  }
}

/* ===== SEO ===== */
useSeoMeta({
  title: 'Услуги стоматологии — терапия, имплантация, протезирование | Доктор Бронников',
  description: 'Полный спектр стоматологических услуг: лечение кариеса, эндодонтия, имплантация, протезирование, профилактика и гигиена.',
  path: '/uslugi',
  type: 'website',
  image: { url: '/images/og/services.jpg', width: 1200, height: 630, alt: 'Стоматологические услуги клиники' }
})

/* ===== JSON-LD ===== */
const { public: pub } = useRuntimeConfig()
const siteUrl = (pub?.siteUrl || '').replace(/\/$/, '') || 'https://example.com'

// Хлебные крошки
useJsonLd(() => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Главная', item: siteUrl + '/' },
    { '@type': 'ListItem', position: 2, name: 'Услуги',  item: siteUrl + '/uslugi' }
  ]
}))

// Каталог услуг (разделы-«якоря»)
useJsonLd(() => ({
  '@context': 'https://schema.org',
  '@type': 'OfferCatalog',
  name: 'Каталог стоматологических услуг',
  url: siteUrl + '/uslugi',
  itemListElement: (items.value || []).map((s:any, i:number) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: {
      '@type': 'Service',
      name: s.title,
      url: `${siteUrl}/uslugi#${s.slug}`
    }
  }))
}))

/* ===== ТРАНЗИШНЫ ДЛЯ АККОРДЕОНА (оставляем плавное открытие) ===== */
function beforeEnter(el: Element) {
  const e = el as HTMLElement
  e.style.height = '0'
  e.style.opacity = '0'
}
function enter(el: Element) {
  const e = el as HTMLElement
  const h = e.scrollHeight
  e.style.transition = 'height 260ms ease, opacity 240ms ease'
  void e.offsetHeight
  e.style.height = h + 'px'
  e.style.opacity = '1'
}
function afterEnter(el: Element) {
  const e = el as HTMLElement
  e.style.height = 'auto'
  e.style.transition = ''
}
function beforeLeave(el: Element) {
  const e = el as HTMLElement
  e.style.height = e.scrollHeight + 'px'
  e.style.opacity = '1'
}
function leave(el: Element) {
  const e = el as HTMLElement
  e.style.transition = 'height 220ms ease, opacity 200ms ease'
  void e.offsetHeight
  e.style.height = '0'
  e.style.opacity = '0'
}
function afterLeave(el: Element) {
  const e = el as HTMLElement
  e.style.transition = ''
}
</script>

<template>
  <main id="services" class="srv">
    <div class="container">
      <h1 class="srv__title">Услуги</h1>

      <div v-if="error" class="alert error">Не удалось загрузить услуги. Попробуйте обновить страницу.</div>

      <div v-else-if="loadingServices" class="stack">
        <div v-for="i in 6" :key="i" class="skeleton"></div>
      </div>

      <div v-else class="list">
        <section
          v-for="s in items"
          :key="s.slug"
          :id="s.slug"
          class="card"
          :class="{ open: openSlug === s.slug }"
        >
          <button
            class="card__head"
            :id="`hdr-${s.slug}`"
            type="button"
            :aria-expanded="openSlug === s.slug"
            :aria-controls="`panel-${s.slug}`"
            @click="toggle(s.slug)"
          >
            <h2 class="card__title">{{ s.title }}</h2>
            <svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5"/></svg>
          </button>

          <!-- Плавный переход панели -->
          <Transition
            @before-enter="beforeEnter"
            @enter="enter"
            @after-enter="afterEnter"
            @before-leave="beforeLeave"
            @leave="leave"
            @after-leave="afterLeave"
          >
            <div
              v-if="openSlug === s.slug"
              class="card__panel"
              :id="`panel-${s.slug}`"
              role="region"
              :aria-labelledby="`hdr-${s.slug}`"
            >
              <div class="panel__inner">
                <div v-if="cache[s.slug]?.loading" class="panel__loading">
                  <span class="spinner" aria-hidden="true"></span> Загрузка…
                </div>

                <div v-else-if="cache[s.slug]?.error" class="alert error">
                  {{ cache[s.slug]?.error }}
                </div>

                <ul v-else class="works">
                  <li
                    v-for="w in (cache[s.slug]?.works || [])"
                    :key="w.id"
                    class="work"
                  >
                    <div class="work__title">
                      {{ w.title }}
                      <small v-if="w.note" class="work__note"> — {{ w.note }}</small>
                    </div>
                    <div class="work__price">
                      <span v-if="w.oldPrice" class="old">{{ fmt(w.oldPrice) }}</span>
                      <span class="new">{{ fmt(w.price) }}</span>
                    </div>
                  </li>

                  <li v-if="(cache[s.slug]?.works || []).length === 0" class="work muted">
                    Позиции скоро появятся.
                  </li>
                </ul>
              </div>
            </div>
          </Transition>
        </section>
      </div>
    </div>
  </main>
</template>

<style scoped>
.srv {
  --container: 1240rem;
  --radius: 20rem;
  --pad-x: clamp(20rem, 3.2vw, 28rem);
  --pad-y: clamp(16rem, 2.8vw, 24rem);
  --gap: 14rem;
  --hdr-off: 96rem;

  padding: calc(var(--hdr-off) + 40rem) var(--pad-x) 64rem;
  background:
    radial-gradient(60% 42% at 50% 0%, rgba(12, 18, 26, 0.55) 0%, rgba(12, 18, 26, 0) 70%),
    linear-gradient(180deg, #0b0f16 0%, #0e101b 60%, #0e101b 100%);
}

/* ===== СТРАНИЦА */
.container {
  max-width: var(--container);
  margin: 0 auto;
}

.srv__title {
  margin-top: 16rem;
  margin-bottom: 32rem;
  text-align: center;
  color: #F6FAFF;
  letter-spacing: .2px;
  font: 800 clamp(26rem, 5.2vw, 42rem)/1.14 "Montserrat", system-ui;
  text-shadow: 0 1px 0 rgba(0, 0, 0, .25);
}

/* ===== СПИСОК КАРТОЧЕК */
.list {
  display: flex;
  flex-direction: column;
  gap: var(--gap);
}

.card {
  border-radius: var(--radius);
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, .04), rgba(255, 255, 255, .01)),
    radial-gradient(100% 100% at 20% 10%, #dbe9f5 0%, #a8c4de 50%, #8ba7c4 100%);
  filter: saturate(.9) brightness(.95);
  box-shadow: 0 10rem 28rem rgba(0, 6, 14, .35);
  border: 1px solid rgba(255, 255, 255, .12);
}

/* ===== ЗАГОЛОВОК КАРТОЧКИ */
.card__head {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 14rem;
  padding: 22rem var(--pad-x);
  background: transparent;
  border: 0;
  cursor: pointer;
  text-align: left;
  min-height: 88rem;
}

.card__title {
  margin: 0;
  color: #07131f;
  font: 800 clamp(18rem, 3.2vw, 28rem)/1.2 "Montserrat";
  text-shadow: none;
}

.card.open .card__title { color: #06101b; }

.chev {
  width: 26rem;
  height: 26rem;
  justify-self: end;
  fill: none;
  stroke: #0b2236;
  stroke-width: 2;
  opacity: .85;
  transition: transform .24s ease, opacity .2s;
}
.card.open .chev { transform: rotate(180deg); opacity: .95; }

/* ===== ПАНЕЛЬ (анимация) */
.card__panel {
  background: linear-gradient(180deg, rgba(0, 0, 0, .06), rgba(0, 0, 0, 0) 40%);
  will-change: height, opacity;
}
.panel__inner {
  padding: 10rem var(--pad-x) var(--pad-y);
  animation: panelFadeIn 260ms ease both;
}
@keyframes panelFadeIn {
  from { transform: translateY(-4px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

/* ===== ПОЗИЦИИ УСЛУГ */
.works {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10rem;
}

.work {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 14rem;
  padding: 14rem 16rem;
  border-radius: 14rem;
  background: rgba(255, 255, 255, .16);
  border: 1px solid rgba(255, 255, 255, .24);
  color: #0b2236;
  backdrop-filter: blur(2px);
}
.work.muted { opacity: .8; }

.work__title { font: 600 clamp(14rem, 2.2vw, 18rem)/1.35 "Montserrat"; }
.work__note  { opacity: .8; }

.work__price {
  display: flex;
  align-items: center;
  gap: 10rem;
  white-space: nowrap;
}
.work__price .old {
  color: #334b63;
  text-decoration: line-through;
  opacity: .7;
  font-weight: 600;
}
.work__price .new {
  font: 800 clamp(14rem, 2.6vw, 18rem)/1 "Montserrat";
  padding: 6rem 10rem;
  border-radius: 999rem;
  background: rgba(255, 255, 255, .22);
  border: 1px solid rgba(255, 255, 255, .32);
  color: #07131f;
}

/* ===== ЛОАДЕР И ОШИБКИ */
.panel__loading {
  display: flex;
  align-items: center;
  gap: 10rem;
  color: #0b2236;
}
.spinner {
  width: 16rem;
  height: 16rem;
  border: 2px solid rgba(11, 34, 54, .25);
  border-top-color: rgba(11, 34, 54, .8);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.alert {
  padding: 12rem 14rem;
  border-radius: 12rem;
}
.alert.error {
  background: #FFDEE0;
  color: #5A0C17;
}

/* ===== СКЕЛЕТОНЫ */
.stack { display: flex; flex-direction: column; gap: 12rem; }
.skeleton {
  height: 96rem;
  border-radius: var(--radius);
  background: linear-gradient(90deg, rgba(255, 255, 255, .06), rgba(255, 255, 255, .12), rgba(255, 255, 255, .06));
  animation: sk 1.1s infinite linear;
}
@keyframes sk { 0% { background-position: 0 0; } 100% { background-position: 420px 0; } }

/* ===== АДАПТИВ + reduce-motion */
@media (max-width: 900px) {
  .srv { padding: calc(var(--hdr-off) + 24rem) 14rem 56rem; }
}
@media (max-width: 640px) {
  .card__head { min-height: 72rem; padding: 18rem var(--pad-x); }
  .panel__inner { padding: 8rem var(--pad-x) var(--pad-y); }
  .work { grid-template-columns: 1fr; align-items: start; }
  .work__price { justify-content: flex-start; }
}
@media (prefers-reduced-motion: reduce) {
  .chev { transition: none; }
  .panel__inner { animation: none !important; }
}

/* scroll anchoring: не тянем вьюпорт при изменении высоты панели */
.srv, .list, .card, .panel__inner { overflow-anchor: auto; }
.card__panel { overflow-anchor: none; }

/* отключаем возможный глобальный smooth-scroll только на этой странице */
:global(html){ scroll-behavior: auto; }

/* убираем экспериментальные хаки, которые могли вызывать скачок */
.card__panel {
  content-visibility: visible;
  contain-intrinsic-size: auto;
}
</style>
