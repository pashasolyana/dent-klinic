<template>
  <section id="services" class="services srv" aria-labelledby="services-title">
    <div class="services__bg" aria-hidden="true"></div>

    <div class="container">
      <h2 id="services-title" class="services__title srvTitle">Услуги</h2>
      <div class="srvGrid">
        <article
          v-for="s in items"
          :key="s.slug"
          class="srvCard"
          role="link"
          :aria-label="s.title"
          tabindex="0"
          @click="go(s.href)"
          @keydown.enter.prevent="go(s.href)"
        >
          <h3 class="srvCard__title">{{ s.title }}</h3>
          <img
            :src="s.img"
            :alt="s.alt || s.title"
            loading="lazy"
            decoding="async"
            class="srvCard__img"
          />
        </article>
        <article class="srvCard srvCard--cta">
          <div class="srvCTA">
            <p class="srvCTA__text">
              Ознакомьтесь со всеми нашими услугами подробнее
            </p>
            <a :href="cta.href" class="srvBtn">{{ cta.text }}</a>
          </div>
          <div class="srvCard__glow" aria-hidden="true"></div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">

import { computed } from 'vue'
import { useServices } from '~/composables/useServices'

type ServiceItem = { title: string; img: string; href: string; slug: string; alt?: string }

const props = defineProps<{ items?: ServiceItem[]; cta?: { text: string; href: string } }>()

const demo: ServiceItem[] = [ /* ...как у тебя... */ ]
const cta = computed(() => props.cta ?? { text: 'Подробнее', href: '/uslugi' })

// берём из админки; если пусто — твой demo
const { services } = useServices()
const items = computed<ServiceItem[]>(() =>
  services.value.length
    ? services.value.map(s => ({ title: s.title, img: s.img, href: s.href, slug: s.slug, alt: s.alt }))
    : (props.items?.length ? props.items : demo)
)

function go(href: string) {
  if (href) window.location.href = href
}
</script>

<style scoped>
.srv {
  --container: 1120rem;
  --gap-x: 22rem;
  --gap-y: 18rem;
  --radius: 40rem;
  --bg-dark: #0E2B40;
  --card-border: rgba(255, 255, 255, 0.10);
  --btn-h: 52rem;
  --btn-px: 24rem;
  --btn-f: 18rem;
  --btn-bw: 2rem;
  --btn-shadow: 0 10rem 22rem rgba(0, 0, 0, 0.38), 0 16rem 28rem rgba(35, 227, 197, 0.14);
  --card-ar: 5 / 4;
  --fz-h: clamp(26rem, 5.6vw, 48rem);
  --fz-b: clamp(15rem, 2.8vw, 22rem);
  --m-card-gap: 20rem;

  position: relative;
  background: var(--bg-dark);
  padding: clamp(28rem, 8vh, 56rem) 16rem clamp(28rem, 10vh, 40rem);
  isolation: isolate;
}

.services__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(900rem 620rem at 85% 82%, rgba(0, 208, 255, 0.07), rgba(0, 208, 255, 0) 60%),
    radial-gradient(720rem 520rem at 15% 78%, rgba(0, 160, 255, 0.06), rgba(0, 160, 255, 0) 55%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.015), rgba(255, 255, 255, 0) 22%);
}

.container {
  max-width: var(--container);
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.srvTitle {
  margin: 0 0 18rem;
  text-align: center;
  font: 800 var(--fz-h) / 1.1 "Montserrat", system-ui;
  color: #F1F6FF;
}

.srvGrid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--gap-y) var(--gap-x);
}

.srvCard {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 14rem 16rem 16rem;
  background: radial-gradient(160% 120% at 30% 20%, #BFE3FF 0%, #8CCBFF 52%, #79C1FF 100%);
  border: 1px solid var(--card-border);
  border-radius: var(--radius);
  box-shadow: 0 10rem 28rem rgba(0, 0, 0, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.18);
  aspect-ratio: var(--card-ar);
  overflow: hidden;
  isolation: isolate;
}

.srvCard__title {
  margin: 0;
  color: #fff;
  font: 800 clamp(18rem, 2.2vw, 26rem) / 1.25 "Montserrat";
}

.srvCard__img {
  margin-top: auto;
  align-self: center;
  width: min(72%, 360rem);
  height: auto;
  filter: drop-shadow(0 8rem 14rem rgba(0, 0, 0, 0.22));
}

/* CTA card */
.srvCard--cta {
  background:
    radial-gradient(120% 120% at 60% 40%, rgba(8, 150, 170, 0.22), rgba(8, 150, 170, 0.08) 46%, rgba(2, 16, 28, 0) 74%),
    linear-gradient(180deg, #0B1824 0%, #0A1520 100%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

.srvCTA {
  display: grid;
  place-content: center;
  justify-items: center;
  text-align: center;
  gap: 14rem;
  margin-inline: auto;
  height: 100%;
  max-width: min(820rem, 92%);
}

.srvCTA__text {
  margin: 0;
  color: #DBE7F6;
  max-width: 30ch;
  font: 600 var(--fz-b) / 1.35 "Montserrat";
}

.srvCard__glow {
  position: absolute;
  inset: -20%;
  pointer-events: none;
  z-index: -1;
  background: radial-gradient(60% 60% at 50% 50%, rgba(0, 235, 255, 0.06), rgba(0, 235, 255, 0) 70%);
  filter: blur(16rem);
}

.srvBtn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  white-space: nowrap;
  line-height: 1;
  height: var(--btn-h);
  padding: 0 var(--btn-px);
  border-radius: 999rem;
  font: 700 var(--btn-f) / 1 "Montserrat";
  color: #fff;
  text-decoration: none;
  border: var(--btn-bw) solid transparent;
  background: linear-gradient(#0E2632, #0E2632) padding-box, linear-gradient(90deg, #23E3C5, #0BC0E6) border-box;
  box-shadow: var(--btn-shadow);
  width: clamp(160px, 26vw, 240px);
  margin-inline: auto;
}

.srvBtn::before {
  content: "";
  position: absolute;
  inset: 10% 12% 62% 12%;
  border-radius: inherit;
  background: radial-gradient(120% 100% at 50% 0%, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0) 70%);
  pointer-events: none;
}

.srvBtn::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: -10rem;
  transform: translateX(-50%);
  width: 82%;
  height: var(--btn-h);
  border-radius: 999rem;
  background: radial-gradient(65% 120% at 50% 0%, rgba(35, 227, 197, 0.48),
    rgba(35, 227, 197, 0) 70%);
  filter: blur(5rem);
  z-index: -1;
}

/* ----------------------------------- Responsive Adjustments ----------------------------------- */

/* Small phones: single column layout */
@media (max-width: 599px) {
  .srv {
    padding-top: clamp(44rem, 10vh, 64rem);
    overflow-x: hidden;
  }
  .srvGrid {
    grid-template-columns: 1fr;
    justify-items: center;
    gap: var(--m-card-gap);
  }
  .srvGrid > * {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
  .srvCard,
  .srvCard--cta {
    aspect-ratio: 16 / 10;
    padding: 12rem 14rem;
    border-radius: 24rem;
  }
}

/* Narrow tablets: two-column layout */
@media (min-width: 600px) and (max-width: 899px) {
  .srv {
    padding-top: clamp(40rem, 9vh, 60rem);
  }
  .srvGrid {
    grid-template-columns: repeat(2, 1fr);
    justify-items: center;
  }
  .srvGrid > * {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
}

/* Desktops: standard layout with CTA spanning two columns */
@media (min-width: 1200px) {
  .srvGrid {
    grid-template-columns: repeat(3, 1fr);
  }
  .srvCard--cta {
    grid-column: span 2;
    aspect-ratio: 2.7;
    padding: 14rem 16rem 16rem;
  }
}
</style>
