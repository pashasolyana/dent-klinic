<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { usePromo } from '~/composables/usePromo'
import { useSeoMeta } from '~/composables/useSeoMeta'
import { useJsonLd } from '~/composables/useJsonLd'

type Price = { old?: number|string|null; new?: number|string|null; label?: string|null }
type Offer = { id: string; text: string; price?: Price|null; free?: boolean }
type PromoSlide = {
  id: number; title: string; text: string; img: string;
  discount?: string|null; offers?: Offer[];
  /* обратная совместимость */
  price?: Price|null; ctaText?: string; ctaHref?: string; free?: boolean
}

definePageMeta({
  layout: 'custom-default',
  headerLinks: [
    { label: 'О клинике', href: '/о-klinike' },
    { label: 'Акции',     href: '/akcii' },
    { label: 'Врачи',     href: '/vrachi' },
    { label: 'Услуги',    href: '/uslugi' },
    { label: 'Контакты',  href: '#contacts' }
  ]
})

const { promo } = usePromo()

const isOfferFree = (o: Offer) => !!o.free || /бесплат/i.test(String(o.price?.label || ''))
const offerFreeLabel = (o: Offer) => (o.price?.label?.trim() || 'БЕСПЛАТНО')
const hasOfferPrice = (o: Offer) => !!(o.price?.old || o.price?.new)
const isEmptyHtml = (s: any) => !String(s ?? '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
const isMeaningfulOffer = (o: Offer) => !isEmptyHtml(o.text) || isOfferFree(o) || hasOfferPrice(o)
const visibleOffers = (s: PromoSlide) => (s.offers || []).filter(isMeaningfulOffer)

/* миграция: если нет offers — собираем из text/price/free */
const slides = computed<PromoSlide[]>(() => {
  const raw = (promo.value as PromoSlide[]) || []
  return raw.map(s => {
    if (Array.isArray(s.offers) && s.offers.length) return { ...s, offers: s.offers.filter(isMeaningfulOffer) }
    const migrated: Offer = { id: `legacy-${s.id}`, text: s.text || '', price: s.free ? null : (s.price ?? null), free: !!s.free }
    return { ...s, offers: isMeaningfulOffer(migrated) ? [migrated] : [] }
  })
})

function formatMoney(v: number|string): string {
  const raw = String(v).trim().replace(/\s+/g, '')
  if (!/^\d+$/.test(raw)) return String(v)
  return raw.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽'
}

/* защита от пустых ссылок */
const pageRoot = ref<HTMLElement|null>(null)
function stopHashNav(e: Event) {
  const root = pageRoot.value
  const target = e.target as HTMLElement|null
  if (!root || !target || !root.contains(target)) return
  const a = target.closest?.('a') as HTMLAnchorElement|null
  if (!a) return
  const href = (a.getAttribute('href') || '').trim()
  if (!href || href === '#' || href.startsWith('#')) { e.preventDefault(); e.stopPropagation() }
}
onMounted(() => {
  document.addEventListener('click', stopHashNav, true)
  document.addEventListener('touchend', stopHashNav as EventListener, { capture: true, passive: false } as any)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', stopHashNav, true)
  document.removeEventListener('touchend', stopHashNav as EventListener, true)
})

/* SEO */
useSeoMeta({
  title: 'Акции и спецпредложения | Доктор Бронников',
  description: 'Сезонные скидки, бесплатные консультации и выгодные предложения на стоматологические услуги.',
  path: '/akcii', type: 'website',
  image: { url: '/images/og/promo.jpg', width: 1200, height: 630, alt: 'Скидки и акции клиники' }
})

/* JSON-LD */
const { public: pub } = useRuntimeConfig()
const siteUrl = (pub?.siteUrl || '').replace(/\/$/, '') || 'https://example.com'
const abs = (p: string) => new URL(p, siteUrl).toString()
const strip = (html: string) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()

useJsonLd(() => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Главная', item: abs('/') },
    { '@type': 'ListItem', position: 2, name: 'Акции',   item: abs('/akcii') }
  ]
}))
useJsonLd(() => ({
  '@context': 'https://schema.org',
  '@type': 'OfferCatalog',
  name: 'Акции стоматологической клиники',
  url: abs('/akcii'),
  itemListElement: (slides.value || []).map((s: PromoSlide, i: number) => {
    const free = visibleOffers(s).some(isOfferFree) || !!s.free
    const fromOfferNew = visibleOffers(s).find(o => o.price?.new)?.price?.new
    const rawNew = s.price?.new ?? fromOfferNew
    const priceNumber = free ? 0 : (rawNew && /^\d+$/.test(String(rawNew)) ? Number(rawNew) : undefined)
    const offer: any = {
      '@type': 'Offer',
      name: s.title,
      description: s.text ? strip(s.text) : undefined,
      url: abs('/akcii') + `#${s.id}`,
      image: s.img ? abs(s.img) : undefined,
      priceCurrency: priceNumber != null ? 'RUB' : undefined,
      price:         priceNumber != null ? String(priceNumber) : undefined,
      availability:  'https://schema.org/InStock'
    }
    return { '@type': 'ListItem', position: i + 1, item: offer }
  })
}))
</script>

<template>
  <main class="deals" ref="pageRoot">
    <header class="deals__head">
      <h1 class="deals__title">Акции</h1>
    </header>

    <!-- каждая акция — отдельная карточка -->
    <section v-if="slides.length" class="deals__list">
      <article
        v-for="s in slides"
        :key="s.id"
        class="deal"
        :id="String(s.id)"
        :style="{ '--bg': `url(${s.img})` }"
      >
        <div class="deal__overlay" aria-hidden="true"></div>

        <div class="deal__content" :class="{'deal__content--single': !s.discount}">
          <div class="deal__text">
            <h3 class="deal__title">«{{ s.title }}»</h3>
            <p v-if="s.text" class="deal__desc" v-html="s.text"></p>

            <div v-if="visibleOffers(s).length" class="deal__offers">
              <div v-for="ofr in visibleOffers(s)" :key="ofr.id" class="deal__offer">
                <span v-if="!isEmptyHtml(ofr.text)" class="deal__offer-text" v-html="ofr.text"></span>

                <div class="deal__offer-cta">
                  <div v-if="isOfferFree(ofr)" class="deal__free">{{ offerFreeLabel(ofr) }}</div>
                  <div v-else-if="hasOfferPrice(ofr)" class="deal__price">
                    <span v-if="ofr.price?.new" class="deal__price-new">{{ formatMoney(ofr.price!.new!) }}</span>
                    <span v-if="ofr.price?.old" class="deal__price-old">{{ formatMoney(ofr.price!.old!) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- справа оставляем ТОЛЬКО бейдж скидки; если скидки нет — правой колонки нет -->
          <div v-if="s.discount" class="deal__cta">
            <div class="deal__badge"><span>{{ s.discount }}</span></div>
          </div>
        </div>
      </article>
    </section>
  </main>
</template>

<style scoped>
:host{ --container: 1200px; --v-gap: clamp(24px, 3.5vw, 48px); }

/* Заголовок */
.deals__head{
  text-align:center;
  padding: clamp(64px, 8vw, 96px) 18px clamp(28px, 4vw, 48px);
}
.deals__title{
  margin:0;
  font:800 clamp(32px, 4.4vw, 64px)/1.2 "Montserrat",system-ui;
  color:#fff;
}

/* Список */
.deals__list{
  max-width: var(--container);
  margin: 0 auto;
  padding: 0 clamp(16px, 3vw, 24px) clamp(48px, 6vw, 80px);
  padding-bottom: calc(clamp(48px, 6vw, 80px) + env(safe-area-inset-bottom, 0px));
  display: flex;
  flex-direction: column;
}

/* Карточка */
.deal{
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  background-image: var(--bg);
  background-size: cover;
  background-position: center;
  min-height: clamp(380px, 48vh, 560px);
  box-shadow: 0 18px 60px rgba(0,0,0,.25);
  isolation: isolate;
  margin-bottom: 50rem;
}
.deal__overlay{
  position:absolute; inset:0; z-index:0;
  background: linear-gradient(180deg, rgba(10,16,24,.60) 0%, rgba(10,16,24,.72) 55%, rgba(12,148,172,.38) 100%);
}

/* Контент карточки */
.deal__content{
  position: relative; z-index: 1; color: #F3F7FC;
  text-shadow: 0 1px 6px rgba(0,0,0,.3);
  display: grid;
  grid-template-columns: 1fr auto;
  gap: clamp(16px, 2.5vw, 28px);
  padding: clamp(20px, 4.5vw, 40px);
  min-height: clamp(340px, 45vh, 520px);
  align-content: center;
}
.deal__content--single{ grid-template-columns: 1fr; }

/* Текстовая колонка */
.deal__text{
  display:flex; flex-direction:column;
  gap: clamp(10px, 2vw, 16px);
  max-width: 980px;
}
.deal__title{
  margin: 0; color:#fff;
  text-shadow: 0 2px 8px rgba(0,0,0,.45);
  font: 800 clamp(24px, 3.4vw, 38px)/1.18 "Montserrat",sans-serif;
  word-break: normal;
}
.deal__desc{
  margin:0;
  font: 400 clamp(15px, 1.5vw, 19px)/1.5 "Montserrat",sans-serif;
  overflow-wrap: anywhere;
}

/* офферы */
.deal__offers{
  display: grid;
  gap: clamp(10px, 2vw, 14px);
  margin-top: 6px;
}
.deal__offer{
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: center;
  padding: clamp(10px, 2.2vw, 14px);
  border-radius: 14px;
  background: rgba(255,255,255,.08);
  border:1px solid rgba(255,255,255,.12);
  backdrop-filter: blur(4px);
}
.deal__offer-text{
  color:#E9F1F7;
  font:600 clamp(15px, 1.2vw, 18px)/1.4 "Montserrat";
}
.deal__offer-cta{
  display:flex; align-items:center; gap:10px; flex-wrap:wrap; justify-content:flex-end;
}
.deal__price{
  display:flex; flex-direction:column; align-items:flex-end; gap:6px;
}
.deal__price-new{
  display:inline-flex; align-items:center; justify-content:center;
  height: clamp(44px, 6.4vw, 52px);
  padding: 0 clamp(16px, 2vw, 22px);
  border-radius: 999px;
  background:#fff; color:#08b5cd;
  font:800 clamp(18px, 1.6vw, 24px)/1 "Montserrat";
  white-space:nowrap;
}
.deal__price-old{
  color:#8FA1B4; text-decoration:line-through;
  font:600 clamp(13px, 1.1vw, 15px)/1 "Montserrat";
  white-space:nowrap;
}
.deal__free{
  display:inline-flex; align-items:center; justify-content:center;
  height: clamp(44px, 6.4vw, 52px);
  padding: 0 clamp(14px, 1.8vw, 20px);
  border-radius: 999px;
  background:#11C2A3; color:#fff;
  font:700 clamp(15px, 1.2vw, 18px)/1 "Montserrat";
  white-space:nowrap;
}

/* Правая колонка (только бейдж) */
.deal__cta{
  display:flex; flex-direction:column; align-items:flex-end; gap: 10px; padding-top: 2px;
}
.deal__badge{
  min-width: clamp(110px, 14vw, 140px);
  height: clamp(72px, 10vw, 96px);
  border-radius: 18px;
  display:grid; place-items:center;
  background:#fff;
  box-shadow:0 12px 36px rgba(0,0,0,.18);
}
.deal__badge span{
  font:800 clamp(22px, 2.2vw, 32px)/1 "Montserrat";
  color:#12A9C7;
}

/* 📱 Мобилки */
@media (max-width: 767px){
  .deal{
    min-height: clamp(360px, 60vh, 540px);
  }
  .deal__content{
    grid-template-columns: 1fr;
    text-align:center;
    padding: clamp(18px, 5.5vw, 28px);
    row-gap: clamp(14px, 4vw, 20px);
    max-width: 680px;
    margin: 0 auto;
    align-items: center;
    justify-items: center;
  }
  .deal__text{
    max-width: 640px;
    margin: 0 auto;
    align-items: center;
  }
  .deal__offers{
    width: 100%;
  }
  .deal__offer{
    grid-template-columns: 1fr;
    text-align:center;
  }
  .deal__offer-cta{
    justify-content:center;
  }
  .deal__price{
    align-items:center;
  }
  .deal__cta{
    align-items:center;
    width: 100%;
  }
  .deal__badge{
    width: min(340px, 100%);
    min-width:auto;
  }
}

/* 💻 Планшеты */
@media (min-width:768px) and (max-width: 1024px){
  .deal__content{
    grid-template-columns: 1fr auto;
    max-width: 1000px;
    margin: 0 auto;
  }
}

/* Защита от пустых ссылок локально */
:where(.deals) :deep(a[href="#"]),
:where(.deals) :deep(a[href=""]),
:where(.deals) :deep(a[href^="#"]),
:where(.deals) :deep(a:not([href])){
  pointer-events:none; cursor:default; opacity:.7;
}

</style>

