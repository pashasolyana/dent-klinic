<!-- components/Promo.vue -->
<template>
  <section ref="promoRoot" class="promo">
    <div class="promo__slides" ref="slidesRoot">
      <article
        v-for="(s, i) in slides"
        :key="s.id"
        class="promo__slide"
        :style="{ '--bg': `url(${s.img})` }"
        :class="{ active: i === currentIndex }"
        :ref="el => setSlideRef(el, i)"
      >
        <div class="promo__overlay" aria-hidden="true"></div>

        <div class="promo__content">
          <h3 class="promo__title">«{{ s.title }}»</h3>
          <p v-if="s.text" class="promo__desc" v-html="s.text"></p>

          <div v-if="visibleOffers(s).length" class="promo__offers">
            <div v-for="ofr in visibleOffers(s)" :key="ofr.id" class="promo__offer">
              <span v-if="!isEmptyHtml(ofr.text)" class="promo__offer-text" v-html="ofr.text"></span>

              <div class="promo__offer-cta">
                <div v-if="isOfferFree(ofr)" class="promo__free">{{ offerFreeLabel(ofr) }}</div>
                <div v-else-if="hasOfferPrice(ofr)" class="promo__price">
                  <span v-if="ofr.price?.new" class="promo__price-new">{{ formatMoney(ofr.price!.new!) }}</span>
                  <span v-if="ofr.price?.old" class="promo__price-old">{{ formatMoney(ofr.price!.old!) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="promo__cta">
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
            <div v-if="s.discount" class="promo__badge"><span>{{ s.discount }}</span></div>
          </div>
        </div>
      </article>
    </div>

    <!-- Навигация -->
    <button
      v-if="slides.length > 1"
      class="promo__nav prev"
      type="button"
      aria-label="Предыдущий"
      data-icon="<"
      @click.stop.prevent="goPrev"
    />
    <button
      v-if="slides.length > 1"
      class="promo__nav next"
      type="button"
      aria-label="Следующий"
      data-icon=">"
      @click.stop.prevent="goNext"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed, nextTick } from 'vue'
import { usePromo } from '~/composables/usePromo'

type Price = { old?: number|string|null; new?: number|string|null; label?: string|null }
type Offer = { id: string; text: string; price?: Price|null; free?: boolean }
export type PromoSlide = {
  id: number
  title: string
  text: string
  img: string
  discount?: string|null
  offers?: Offer[]
  // обратная совместимость
  price?: Price|null
  ctaText?: string
  ctaHref?: string
  free?: boolean
}

const props = defineProps<{ items?: PromoSlide[]; ctaText?: string; ctaHref?: string }>()
const { promo } = usePromo()

const isOfferFree = (o: Offer) => !!o.free || /бесплат/i.test(String(o.price?.label || ''))
const offerFreeLabel = (o: Offer) => (o.price?.label?.trim() || 'БЕСПЛАТНО')
const hasOfferPrice = (o: Offer) => !!(o.price?.old || o.price?.new)
const isEmptyHtml = (s: any) => !String(s ?? '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
const isMeaningfulOffer = (o: Offer) => !isEmptyHtml(o.text) || isOfferFree(o) || hasOfferPrice(o)
const visibleOffers = (s: PromoSlide) => (s.offers || []).filter(isMeaningfulOffer)

const slides = computed<PromoSlide[]>(() => {
  const raw = (props.items?.length ? props.items : (promo.value as PromoSlide[])) || []
  return raw.map(s => {
    if (Array.isArray(s.offers) && s.offers.length) return { ...s, offers: s.offers.filter(isMeaningfulOffer) }
    const migrated: Offer = { id: `legacy-${s.id}`, text: s.text || '', price: s.free ? null : (s.price ?? null), free: !!s.free }
    return { ...s, offers: isMeaningfulOffer(migrated) ? [migrated] : [] }
  })
})

const btnText = (s: PromoSlide) => ((s.ctaText ?? props.ctaText ?? '') + '').trim()
const hasCta  = (s: PromoSlide) => btnText(s).length > 0
const linkHref = (s: PromoSlide) => s.ctaHref ?? props.ctaHref ?? null

function formatMoney(v: number|string): string {
  const raw = String(v).trim().replace(/\s+/g, '')
  if (!/^\d+$/.test(raw)) return String(v)
  return raw.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽'
}

const slidesRoot = ref<HTMLElement|null>(null)
const slideRefs = ref<HTMLElement[]>([])
function setSlideRef(el: HTMLElement | null, i: number) { if (el) slideRefs.value[i] = el }

/* ==== навигация и автоплей ==== */
const currentIndex = ref(0)
let timer: number|null = null
const delay = 5000

const goPrev = () => { const n = slides.value.length; if (!n) return; currentIndex.value = (currentIndex.value - 1 + n) % n; restartAutoplay() }
const goNext = () => { const n = slides.value.length; if (!n) return; currentIndex.value = (currentIndex.value + 1) % n; restartAutoplay() }
const startAutoplay   = () => { stopAutoplay(); if (slides.value.length > 1) timer = window.setInterval(goNext, delay) }
const stopAutoplay    = () => { if (timer !== null) { clearInterval(timer); timer = null } }
const restartAutoplay = () => startAutoplay()

/* ==== защита от пустых ссылок ==== */
const promoRoot = ref<HTMLElement|null>(null)
function onCtaClick(e: MouseEvent, s: PromoSlide) {
  const href = linkHref(s)
  if (!href || href === '#' || href.trim() === '' || href.startsWith('#')) { e.preventDefault(); e.stopPropagation() }
}
function stopHashNav(e: Event) {
  const target = e.target as HTMLElement|null
  const root = promoRoot.value
  if (!target || !root || !root.contains(target)) return
  const a = target.closest?.('a') as HTMLAnchorElement|null
  if (!a) return
  const href = (a.getAttribute('href') || '').trim()
  if (!href || href === '#' || href.startsWith('#')) { e.preventDefault(); e.stopPropagation() }
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

watch(slides, async (arr) => {
  if (!arr?.length) { stopAutoplay(); currentIndex.value = 0; return }
  if (currentIndex.value >= arr.length) currentIndex.value = 0
  await nextTick(); restartAutoplay()
})
</script>

<style scoped>
:host{ --container: 1280rem; }

/* ===== base ===== */
.promo{
  position: relative;
  background: #0E101B;
  overflow: hidden;
  --container: 1280rem;
  --pill-h: 56rem;

  --nav-top: 50%;
  --nav-h: 0rem;
  --arrow-lane: 0rem;

  -webkit-text-size-adjust: 100%;
  -webkit-tap-highlight-color: transparent;
}

/* Контейнер слайдов — CSS Grid, чтобы высота была авто по содержимому активного/большего слайда */
.promo__slides{
  position: relative;
  display: grid;
  grid-auto-rows: auto;
}

/* Слайды все кладём в одну ячейку 1/1 */
.promo__slide{
  grid-area: 1 / 1;
  background-image: var(--bg);
  background-size: cover;
  background-position: center;
  visibility: hidden;  /* скрыт визуально */
  opacity: 0;
  transition: opacity .35s ease, visibility 0s linear .35s;
}
.promo__slide.active{
  visibility: visible; /* остаётся в потоке grid => контейнер имеет правильную высоту */
  opacity: 1;
  transition-delay: 0s;
}

.promo__overlay{
  position: absolute; inset: 0; z-index: 0;
  background: linear-gradient(180deg, rgba(10,16,24,.42) 0%, rgba(10,16,24,.62) 36%, rgba(12,148,172,.33) 86%), rgba(0,0,0,.14);
  pointer-events: none;
}

.promo__content{
  position: relative; z-index: 1;
  max-width: var(--container);
  width: min(100%, var(--container));
  margin: 0 auto;

  padding: clamp(24rem, 5vh, 48rem) calc(20rem + var(--arrow-lane));
  padding-top: calc(clamp(24rem, 5vh, 48rem) + var(--nav-h));

  display: flex; flex-direction: column;
  justify-content: center; align-items: stretch;
  gap: 20rem;
}
.promo__content:not(:has(.promo__desc)){
  gap: 14rem;
  padding-bottom: clamp(16rem, 4vh, 28rem);
}

.promo__title{
  margin: 0;
  font: 800 clamp(26rem, 3.2vw + 12rem, 64rem)/1.12 "Montserrat", system-ui;
  color:#fff; text-shadow:0 2rem 22rem rgba(0,0,0,.35);
  word-break: break-word;
  overflow-wrap: anywhere;
  hyphens: auto;
}
.promo__desc{
  margin: 0; max-width: 1200rem;
  font: 400 clamp(16rem, 1.3vw + 9rem, 34rem)/1.45 "Montserrat", system-ui;
  color:#F3F7FC; text-shadow:0 1rem 18rem rgba(0,0,0,.25);
  word-break: break-word;
  overflow-wrap:anywhere;
  hyphens:auto;
}

/* офферы */
.promo__offers{ display: grid; gap: 12rem; width: 100%; }
.promo__offer{
  width: 100%;
  display: grid; grid-template-columns: 1fr auto;
  align-items: center; gap: 12rem;
  padding: 12rem 14rem;
  border-radius: 14rem;
  background: rgba(12,20,35,.42);
  border: 1rem solid rgba(255,255,255,.09);
  backdrop-filter: blur(3px);
  overflow: hidden;
}
.promo__offer-text{ color:#E9F1F7; font:600 18rem/1.35 "Montserrat"; }
.promo__offer-cta{ display:flex; align-items:center; gap:10rem; flex-wrap:wrap; justify-content:flex-end; }

.promo__price{
  display:grid;
  grid-template-rows: var(--pill-h) auto;
  justify-items:center;
  align-items:center;
  row-gap:6rem;
}
.promo__price-new{
  display:inline-flex; align-items:center; justify-content:center;
  height:var(--pill-h); padding:0 20rem; border-radius:999rem;
  background:#fff; color:#08b5cd; font:800 28rem/1 "Montserrat";
  white-space:nowrap; box-shadow:0 12rem 36rem rgba(0,0,0,.18);
}
.promo__price-old{ color:#8FA1B4; text-decoration:line-through; text-decoration-thickness:3rem; text-decoration-color:rgba(143,161,180,.95); font:700 16rem/1 "Montserrat"; white-space:nowrap; }
.promo__free{ display:inline-flex; align-items:center; justify-content:center; height:var(--pill-h); padding:0 18rem; border-radius:999rem; background:#11C2A3; color:#fff; font:700 16rem/1 "Montserrat"; white-space:nowrap; }

.promo__cta{ display:grid; grid-template-columns:1fr auto; align-items:center; gap:14rem; margin-top:6rem; width:100%; }
.promo__btn{
  display:inline-flex; align-items:center; justify-content:center;
  height:64rem; padding:0 32rem; border-radius:1000rem;
  border:2rem solid #11C2A3; color:#EAF7F5; background:transparent;
  font:700 20rem/1 "Montserrat";
  box-shadow:0 0 0 6rem rgba(17,194,163,.06) inset, 0 10rem 28rem rgba(0,0,0,.25);
  transition:transform .06s ease, box-shadow .15s ease, background-color .15s ease;
  white-space:nowrap;
}
.promo__btn:hover{ background:rgba(17,194,163,.07); box-shadow:0 0 0 6rem rgba(17,194,163,.1) inset, 0 12rem 34rem rgba(0,0,0,.3); }
.promo__btn:active{ transform: translateY(1rem); }
.promo__badge{ min-width:140rem; height:96rem; border-radius:22rem; display:grid; place-items:center; background:#fff; box-shadow:0 12rem 36rem rgba(0,0,0,.25); }
.promo__badge span{ font:800 34rem/1 "Montserrat"; color:#12A9C7; letter-spacing:.02em; }

/* ===== стрелки ===== */
.promo__nav{
  position:absolute;
  top:var(--nav-top);
  transform:translateY(-50%);
  z-index:5;
  background:transparent; border:0;
  font:800 42rem/1 "Montserrat";
  color:#fff;
  text-shadow:0 2rem 14rem rgba(0,0,0,.55);
  cursor:pointer; touch-action: manipulation;
  padding:8rem 12rem;
  user-select:none;
}
.promo__nav.prev{ left:max(8rem, env(safe-area-inset-left)); }
.promo__nav.next{ right:max(8rem, env(safe-area-inset-right)); }
.promo__nav::before{ content:attr(data-icon); }

/* защита от пустых ссылок */
:where(.promo) :deep(a[href="#"]),
:where(.promo) :deep(a[href=""]),
:where(.promo) :deep(a[href^="#"]),
:where(.promo) :deep(a:not([href])){ pointer-events:none; cursor:default; }

/* ===== планшеты ===== */
@media (min-width:600px) and (max-width:1024px) {
  .promo__content {
    gap: 16rem;
    padding: 28rem clamp(20rem, 5vw, 40rem);
    padding-top: calc(28rem + var(--nav-h));
  }

  .promo__title {
    font-size: clamp(22rem, 3.8vw, 42rem);
    line-height: 1.2;
    max-width: 100%;
    word-break: break-word;
  }

  .promo__desc {
    font-size: clamp(15rem, 1.8vw, 22rem);
    max-width: 100%;
    line-height: 1.45;
    overflow-wrap: break-word;
  }

  .promo__offer {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 10rem;
  }

  .promo__offer-text {
    font-size: 16rem;
    word-break: break-word;
    overflow-wrap: break-word;
  }

  .promo__price {
    flex-wrap: wrap;
    justify-content: flex-start;
    gap: 10rem;
  }

  .promo__price-new {
    font-size: 24rem;
    padding: 0 18rem;
    height: auto;
    white-space: nowrap;
  }

  .promo__price-old {
    font-size: 14rem;
    white-space: nowrap;
  }

  .promo__free {
    font-size: 14rem;
    padding: 0 14rem;
  }

  .promo__btn {
    font-size: 17rem;
    height: 52rem;
    padding: 0 24rem;
  }

  .promo__badge {
    min-width: 110rem;
    height: 84rem;
    border-radius: 18rem;
  }

  .promo__badge span {
    font-size: 28rem;
  }

  .promo__nav {
    top: 50%;
    transform: translateY(-50%);
    font-size: 32rem;
    padding: 8rem 10rem;
  }

  .promo__slides {
    overflow-x: hidden;
  }

  /* Safety box for overflowing content */
  .promo__content,
  .promo__desc,
  .promo__offer,
  .promo__offer-text,
  .promo__price,
  .promo__price-new,
  .promo__price-old,
  .promo__free,
  .promo__cta,
  .promo__btn,
  .promo__badge {
    box-sizing: border-box;
    max-width: 100%;
    overflow-wrap: break-word;
    word-break: break-word;
    hyphens: auto;
    overflow: hidden;
  }
}


@media (min-width:768px) and (max-width:1024px) {
  .promo__content {
    max-width: 680rem;
    margin: 0 auto;
    padding: 36rem 24rem;
    gap: 20rem;
  }

  .promo__title {
    font-size: clamp(24rem, 3vw, 38rem);
    text-align: left;
    line-height: 1.2;
    max-width: 100%;
  }

  .promo__desc {
    font-size: clamp(16rem, 1.8vw, 20rem);
    line-height: 1.45;
    max-width: 100%;
    text-align: left;
  }

  .promo__offer {
    flex-direction: column;
    align-items: flex-start;
    gap: 10rem;
    padding: 16rem;
  }

  .promo__offer-cta {
    width: 100%;
    justify-content: space-between;
  }

  .promo__price-new {
    font-size: 24rem;
    padding: 0 18rem;
  }

  .promo__free {
    font-size: 15rem;
  }

  .promo__btn {
    font-size: 18rem;
    height: 56rem;
    padding: 0 28rem;
  }

  .promo__nav {
    font-size: 36rem;
    top: 50%;
    transform: translateY(-50%);
  }

  /* Убираем растягивание вширь */
  .promo__slide,
  .promo__content,
  .promo__desc,
  .promo__title {
    box-sizing: border-box;
    overflow-wrap: break-word;
    word-break: break-word;
  }
}


/* ===== десктоп ===== */
@media (min-width:1280px){
  .promo__content{ padding: 56rem calc(32rem + var(--arrow-lane)); padding-top: calc(56rem + var(--nav-h)); gap: 28rem; }
  .promo__title{ font-size: 64rem; }
  .promo__desc{ font-size: 34rem; max-width: 1100rem; }
  .promo__price-new{ font-size: 30rem; padding: 0 26rem; }
  .promo__btn{ font-size: 22rem; height: 70rem; padding: 0 40rem; }
  .promo__badge span{ font-size: 36rem; }
  .promo{ --nav-top: 50%; --nav-h: 0rem; --arrow-lane: 0rem; }
}

/* ===== телефоны ≤599px (единый блок) ===== */
@media (max-width: 599px) {
  .promo {
    --pill-h: 36rem;
    --nav-top: 50%;
    --nav-h: 0;
    --arrow-lane: 0;
  }

  .promo__content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 10rem;
    padding: 20rem 16rem;
    overflow: hidden;
    max-width: 100%;
  }

  .promo__title {
    font-size: clamp(16rem, 4.8vw, 20rem);
    line-height: 1.3;
    font-weight: 800;
    word-break: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
    max-width: 100%;
  }

  .promo__desc {
    font-size: clamp(13rem, 4.2vw, 15rem);
    line-height: 1.4;
    word-break: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
    max-width: 100%;
  }

  .promo__offers {
    display: flex;
    flex-direction: column;
    gap: 8rem;
    width: 100%;
  }

  .promo__offer {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding: 10rem;
    border-radius: 12rem;
    background: rgba(255,255,255,.06);
    border: 0;
    box-shadow: inset 0 1rem 0 rgba(255,255,255,.06);
    overflow-wrap: anywhere;
  }

  .promo__offer-text {
    font: 600 clamp(12rem, 4vw, 14rem)/1.35 "Montserrat";
    word-break: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
    max-width: 100%;
  }

  .promo__offer-cta {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    gap: 6rem;
    width: 100%;
  }

  .promo__price,
  .promo__price-new,
  .promo__price-old,
  .promo__free {
    max-width: 100%;
    word-break: break-word;
    overflow-wrap: break-word;
    white-space: normal;
  }

  .promo__price {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6rem;
  }

  .promo__price-new {
    font-size: clamp(14rem, 4.8vw, 16rem);
    padding: 0 12rem;
    height: var(--pill-h);
    border-radius: 999rem;
  }

  .promo__price-old {
    font-size: 12.5rem;
    color: #8FA1B4;
    text-decoration-thickness: 2rem;
  }

  .promo__free {
    font-size: clamp(12rem, 4vw, 14rem);
    padding: 0 12rem;
    height: var(--pill-h);
    border-radius: 999rem;
  }

  .promo__cta {
    display: flex;
    flex-direction: column;
    gap: 10rem;
    margin-top: 6rem;
    width: 100%;
  }

  .promo__btn {
    width: 100%;
    font-size: clamp(14rem, 4.5vw, 16rem);
    height: 44rem;
    padding: 0 16rem;
  }

  .promo__badge {
    font-size: clamp(18rem, 5vw, 22rem);
    height: 64rem;
    border-radius: 16rem;
    min-width: 100%;
    display: grid;
    place-items: center;
  }

  .promo__nav {
    position: absolute;
    top: var(--nav-top);
    transform: translateY(-50%);
    font-size: clamp(24rem, 5.8vw, 28rem);
    padding: 6rem 8rem;
    background: transparent;
    border: none;
    cursor: pointer;
    z-index: 5;
    color: #fff;
    text-shadow: 0 2rem 14rem rgba(0,0,0,.55);
  }

  .promo__nav.prev { left: 12rem; }
  .promo__nav.next { right: 12rem; }

  .promo__nav::before { content: attr(data-icon); }

  .promo__content,
.promo__desc,
.promo__offer,
.promo__offer-text,
.promo__price,
.promo__price-new,
.promo__price-old,
.promo__free,
.promo__cta,
.promo__btn,
.promo__badge {
  box-sizing: border-box;
  max-width: 100%;
  overflow-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
  overflow: hidden;
}
}



/* ===== особо узкие ≤380px ===== */
@media (max-width:380px){
  .promo__title{ font-size: clamp(16rem, 5.5vw, 18rem); }
  .promo__desc{ font-size: clamp(11rem, 4vw, 14rem); }
  .promo__price-new{ font-size: clamp(14rem, 4.5vw, 18rem); }
}
</style>
