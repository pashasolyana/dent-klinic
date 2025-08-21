<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePromo } from '~/composables/usePromo'
import { useSeoMeta } from '~/composables/useSeoMeta'
import { useJsonLd } from '~/composables/useJsonLd'


type Price = { old?: number | string | null; new?: number | string | null; label?: string | null }
type PromoSlide = {
  id: number; title: string; text: string; img: string;
  discount?: string | null; price?: Price | null; ctaText?: string; ctaHref?: string; free?: boolean
}

definePageMeta({
  layout: 'custom-default',
  headerLinks: [
    { label: 'О клинике', href: '/o-klinike' },
    { label: 'Акции',     href: '/akcii' },
    { label: 'Врачи',     href: '/vrachi' },
    { label: 'Услуги',    href: '/uslugi' },
    { label: 'Контакты',  href: '#contacts' }
  ]
})

const { promo } = usePromo()
const items = computed<PromoSlide[]>(() => (promo.value as PromoSlide[]) || [])

const btnText = (s: PromoSlide) => (s.ctaText ?? '').toString().trim()
const hasCta = (s: PromoSlide) => btnText(s).length > 0
const linkHref = (s: PromoSlide) => s.ctaHref || null

const isFree = (s: PromoSlide) => !!s.free || /бесплат/i.test(String(s.price?.label || ''))
const freeLabel = (s: PromoSlide) => (s.price?.label && s.price.label.trim()) || 'БЕСПЛАТНО'
const hasAnyPrice = (s: PromoSlide) => !!(s.price?.old || s.price?.new)

function formatMoney(v: number | string): string {
  const raw = String(v).trim().replace(/\s+/g, '')
  if (!/^\d+$/.test(raw)) return String(v)
  return raw.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽'
}

/* ===== SEO ===== */
useSeoMeta({
  title: 'Акции и спецпредложения | Доктор Бронников',
  description: 'Сезонные скидки, бесплатные консультации и выгодные предложения на стоматологические услуги.',
  path: '/akcii',
  type: 'website',
  image: { url: '/images/og/promo.jpg', width: 1200, height: 630, alt: 'Скидки и акции клиники' }
})

/* ===== JSON‑LD ===== */
const { public: pub } = useRuntimeConfig()
const siteUrl = (pub?.siteUrl || '').replace(/\/$/, '') || 'https://example.com'
const abs = (p: string) => new URL(p, siteUrl).toString()
const strip = (html: string) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()

// Хлебные крошки
useJsonLd(() => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Главная', item: abs('/') },
    { '@type': 'ListItem', position: 2, name: 'Акции',   item: abs('/akcii') }
  ]
}))

// Каталог предложений (OfferCatalog -> Offer[])
useJsonLd(() => ({
  '@context': 'https://schema.org',
  '@type': 'OfferCatalog',
  name: 'Акции стоматологической клиники',
  url: abs('/akcii'),
  itemListElement: (items.value || []).map((s: PromoSlide, i: number) => {
    // цена: если "бесплатно" — 0 RUB, иначе берём новую цену, если есть
    const priceNumber = isFree(s) ? 0 : (s.price?.new && /^\d+$/.test(String(s.price.new)) ? Number(s.price.new) : undefined)
    const offer: any = {
      '@type': 'Offer',
      name: s.title,
      description: s.text ? strip(s.text) : undefined,
      url: s.ctaHref ? abs(s.ctaHref) : abs('/akcii') + `#${s.id}`,
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
  <main class="deals">
    <header class="deals__head">
      <h1 class="deals__title">Акции</h1>
    </header>

    <section v-if="items.length" class="deals__list">
      <article
        v-for="s in items"
        :key="s.id"
        class="deal"
        :style="{ '--bg': `url(${s.img})` }"
      >
        <div class="deal__overlay"></div>
        <div class="deal__content">
          <!-- Текст слева -->
          <div class="deal__text">
            <h3 class="deal__title">«{{ s.title }}»</h3>
            <p class="deal__desc" v-html="s.text"></p>
          </div>

          <!-- Цены справа -->
          <div class="deal__cta">
            <div v-if="isFree(s)" class="deal__free">{{ freeLabel(s) }}</div>
            <div v-if="hasAnyPrice(s)" class="deal__price">
              <span v-if="s.price?.new" class="deal__price-new">{{ formatMoney(s.price.new!) }}</span>
              <span v-if="s.price?.old" class="deal__price-old">{{ formatMoney(s.price.old!) }}</span>
            </div>
            <div v-if="s.discount" class="deal__badge"><span>{{ s.discount }}</span></div>
          </div>
        </div>
      </article>
    </section>
  </main>
</template>



<style scoped>
:host {
  --container: 1280rem;
  --gap: 56rem;
}

/* Заголовок */
.deals__head {
  text-align: center;
  padding: 120rem 18rem 80rem;
}
.deals__title {
  margin: 0;
  font: 800 clamp(38rem, 4.4vw + 12rem, 72rem)/1.2 "Montserrat", system-ui;
  color: #fff;
}

/* Список акций */
.deals__list {
  max-width: var(--container);
  margin: 0 auto;
  padding: 0 40rem;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  margin-bottom: 40rem;
}

/* Карточка */
.deal {
  position: relative;
  border-radius: 22rem;
  margin-top: 52rem;
  background-image: var(--bg);
  background-size: cover;
  background-position: center;
  box-shadow: 0 18rem 60rem rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-height: 440rem;
  margin-bottom: var(--gap);
}

/* Затемнение */
.deal__overlay {
  position: absolute;
  inset: 0;
  z-index: 0;
}

/* Контент */
.deal__content {
  flex: 1;
  position: relative;
  z-index: 1;
  padding: clamp(28rem, 6vw, 48rem);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  box-sizing: border-box;
  color: #F3F7FC;
  text-shadow: 0 1rem 18rem rgba(0, 0, 0, 0.25);
  gap: 32rem;
}

/* Левая часть */
.deal__text {
  display: flex;
  flex-direction: column;
  gap: 20rem;
  flex: 1;
}

.deal__title {
  margin: 0;
  font: 800 clamp(28rem, 3.6vw + 10rem, 46rem)/1.15 "Montserrat";
  color: #fff;
}

.deal__desc {
  margin: 0;
  max-width: 1000rem;
  font: 400 clamp(18rem, 1.5vw + 8rem, 28rem)/1.45 "Montserrat";
}

/* Правая часть */
.deal__cta {
  align-self: flex-end;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 14rem;
  padding-top: 40rem;
}

/* Цена / скидка */
.deal__free {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 60rem;
  padding: 0 24rem;
  border-radius: 999rem;
  background: #11C2A3;
  color: #fff;
  font: 700 20rem/1 "Montserrat";
  white-space: nowrap;
}

.deal__price {
  display: grid;
  grid-template-rows: auto auto;
  justify-items: end;
  row-gap: 8rem;
}

.deal__price-new {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 60rem;
  padding: 0 28rem;
  border-radius: 999rem;
  background: #fff;
  color: #08b5cd;
  font: 800 32rem/1 "Montserrat";
  box-shadow: 0 12rem 36rem rgba(0, 0, 0, 0.18);
}
.deal__price-old {
  color: #8FA1B4;
  text-decoration: line-through;
  font: 700 20rem/1 "Montserrat";
}

.deal__badge {
  min-width: 130rem;
  height: 96rem;
  border-radius: 20rem;
  display: grid;
  place-items: center;
  background: #fff;
  box-shadow: 0 12rem 36rem rgba(0, 0, 0, 0.25);
}
.deal__badge span {
  font: 800 34rem/1 "Montserrat";
  color: #12A9C7;
}

/* 📱 МОБИЛЬНЫЕ */
@media (max-width: 600px) {
  .deal__content {
    flex-direction: column;
    align-items: stretch;
    padding: 24rem;
    gap: 20rem;
    overflow-wrap: break-word;
    word-break: break-word;
  }

  .deal__text {
    width: 100%;
    overflow-wrap: break-word;
    word-break: break-word;
  }

  .deal__title {
    font-size: 24rem;
    line-height: 1.2;
  }

  .deal__desc {
    font-size: 14rem;
    line-height: 1.45;
    max-width: 100%;
  }

  .deal__cta {
    align-self: center;
    align-items: center;
    text-align: center;
    margin-top: 24rem;
    padding-top: 0;
  }

  .deal__price {
    justify-items: center;
  }
}

/* 💻 ПЛАНШЕТЫ */
@media (max-width: 1024px) and (min-width: 601px) {
  .deal__content {
    flex-direction: column;
    align-items: stretch;
    padding: 32rem;
    gap: 28rem;
  }

  .deal__cta {
    align-self: flex-end;
    align-items: flex-end;
    text-align: right;
    margin-top: auto;
    padding-top: 20rem;
  }

  .deal__price {
    justify-items: end;
  }

  .deal__title {
    font-size: 32rem;
  }

  .deal__desc {
    font-size: 18rem;
  }

  .deal__price-new {
    font-size: 26rem;
    height: 52rem;
    padding: 0 20rem;
  }

  .deal__price-old {
    font-size: 16rem;
  }

  .deal__free {
    font-size: 16rem;
    height: 50rem;
    padding: 0 20rem;
  }

  .deal__badge {
    height: 80rem;
    min-width: 110rem;
  }

  .deal__badge span {
    font-size: 28rem;
  }
}



</style>
