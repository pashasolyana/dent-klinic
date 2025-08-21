<script setup lang="ts">
import { useAboutClinic } from '~/composables/useAboutClinic';
import { useSeoMeta } from '~/composables/useSeoMeta'
import { useJsonLd } from '~/composables/useJsonLd'
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

// auto-import из ~/composables
const { about, goalsBg, heroYearsBg, priorityImg, showPh, onImgError } = await useAboutClinic()

// runtime (для абсолютных ссылок в JSON-LD)
const { public: pub } = useRuntimeConfig()
const siteUrl = (pub?.siteUrl || '').replace(/\/$/, '') || 'https://example.com'
const siteName = pub?.siteName || 'Стоматологическая клиника доктора Бронникова'

// ---------- SEO ----------
useSeoMeta({
  title: 'О клинике — современные технологии и опыт | Доктор Бронников',
  description:
    'История, ценности и подход клиники. Современное оборудование, стандарты стерильности и внимание к эстетике и функциональности.',
  path: '/o-klinike',
  type: 'website',
  image: {
    // если админ загрузил фото приоритетов — используем его как OG
    url: (about?.priorityImage as string) || '/images/og/about.jpg',
    width: 1200,
    height: 630,
    alt: 'Интерьер и оборудование стоматологической клиники'
  },
  siteName
})

// ---------- JSON-LD: Хлебные крошки ----------
useJsonLd(() => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Главная',
      item: siteUrl + '/'
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'О клинике',
      item: siteUrl + '/o-klinike'
    }
  ]
}))

// ---------- JSON-LD: Медицинская клиника ----------
useJsonLd(() => ({
  '@context': 'https://schema.org',
  '@type': 'MedicalClinic',
  name: siteName,
  url: siteUrl + '/o-klinike',
  image: (about?.priorityImage as string)
    ? new URL(about.priorityImage as string, siteUrl).toString()
    : siteUrl + '/images/og/about.jpg',
  // при желании позже добавим:
  // telephone: '+7 (___) ___-__-__',
  // address: { '@type':'PostalAddress', streetAddress:'...', addressLocality:'...', postalCode:'...', addressCountry:'RU' },
  // openingHoursSpecification: [...]
}))
</script>

<template>
  <main class="page">
    {{ priorityImg }}
    <div class="page__bg" aria-hidden="true"></div>

    <!-- HERO -->
    <section class="hero">
      <div class="hero__inner container">
        <div class="hero__left">
          <h1 class="h1">{{ about?.heroTitle || 'О клинике' }}</h1>

          <h2 class="h2">{{ about?.foundationTitle || 'Основание' }}</h2>
          <p class="lead" v-if="about?.foundationParagraph1">{{ about?.foundationParagraph1 }}</p>
          <p class="lead" v-if="about?.foundationParagraph2">{{ about?.foundationParagraph2 }}</p>
        </div>

        <div
      class="hero__card"
      role="img"
      :aria-label="about?.yearsText || 'Лет работы'"
      :style="heroYearsBg ? { backgroundImage: heroYearsBg } : {}"
    >
      <div class="hero__years">{{ about?.yearsText || '—' }}</div>
    </div>
      </div>
      <div class="hero__bg" aria-hidden="true"></div>
    </section>

    <!-- Наша цель -->
    <section class="goals" :style="{ '--goals-bg': null }">
      <div class="container container--wide">
        <h2 class="h1 center">Наша цель</h2>

        <div class="goals__grid">
          <article v-for="g in (about?.goals || [])" :key="g.id" class="goal">
            <p v-html="g.text"></p>
          </article>

          <!-- если админ ещё не заполнил -->
          <article v-if="!about?.goals?.length" class="goal">
            <p>Заполните карточки целей в админ‑панели.</p>
          </article>
        </div>
      </div>
      <div class="goals__overlay" aria-hidden="true"></div>
    </section>

    <!-- Приоритеты -->
    <section class="priorities">
      <div class="container priorities__inner">
        <div class="priorities__text">
          <h2 class="h1">{{ about?.prioritiesTitle || 'Приоритеты' }}</h2>
          <p class="lead" v-if="about?.prioritiesP1" v-html="about?.prioritiesP1"></p>
          <p class="lead" v-if="about?.prioritiesP2" v-html="about?.prioritiesP2"></p>
        </div>

        <div class="priorities__media">
          <img :src="priorityImg" alt="Фотография клиники" @error="onImgError" />
          <div v-if="showPh" class="ph" aria-hidden="true"></div>
        </div>
      </div>
      <div class="priorities__bg" aria-hidden="true"></div>
    </section>

    <!-- Почему мы -->
    <section class="why">
      <div class="container center">
        <h2 class="h1">{{ about?.whyTitle || 'Почему мы?' }}</h2>
        <p class="why__text" v-if="about?.whyText" v-html="about?.whyText"></p>
        <p class="why__text" v-else>
          Заполните блок «Почему мы?» в админ‑панели.
        </p>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* ===== базовые ===== */
:host, .page { box-sizing: border-box; }
*, *::before, *::after { box-sizing: inherit; }

.page{ position: relative; overflow-x: hidden; background: #0A0C15; }
.page > *{ position: relative; z-index: 1; }

/* общий задний фон */
.page__bg{
  position: absolute; inset: 0; z-index: 0; pointer-events: none;
  background:
    radial-gradient(52vw 38vh at 50% 46%,
      rgba(7,128,150,.55) 0%,
      rgba(7,128,150,.35) 32%,
      rgba(7,128,150,.18) 50%,
      rgba(7,128,150,0) 72%
    ),
    radial-gradient(140% 100% at 50% -10%,
      rgba(10,14,22,0) 0%,
      rgba(10,14,22,.25) 40%,
      rgba(10,14,22,.60) 100%
    );
  background-repeat: no-repeat;
  background-attachment: fixed, scroll;
}

/* контейнеры */
.container{ width:min(1320rem,96vw); margin-inline:auto; padding-inline: clamp(16rem, 3.5vw, 24rem); }
.container--wide{ width:min(1440rem,98vw); }
.center{ text-align:center; }
.h1{ margin:0 0 18rem; font:700 clamp(26rem,5.6vw,48rem)/1.2 "Montserrat",system-ui; color:#fff; }
.h2{ margin:0 0 16rem; font:700 clamp(22rem,4.4vw,36rem)/1.25 "Montserrat",system-ui; color:#fff; }
.lead{ color:#DDE9F8; font:500 clamp(16rem,2.6vw,24rem)/1.6 "Montserrat",system-ui; margin:0 0 16rem; }
.accent{ color:#10B9DC; }

/* ===== HERO ===== */
.hero{ position: relative; padding: clamp(220rem, 18vh, 220rem) 0; overflow: clip; }
.hero__inner{
  display:grid; grid-template-columns:1.1fr minmax(360rem,620rem);
  gap:clamp(28rem,5vw,56rem); align-items:center;
}
.hero__left .h1{ margin-bottom:32rem; }
.hero__card{
  align-self:stretch; border-radius:28rem;
  box-shadow:0 14rem 44rem rgba(0,0,0,.35), inset 0 0 0 1px rgba(255,255,255,.08);
  display:flex; align-items:center; justify-content:center;
  min-height:clamp(300rem,40vh,520rem);
  background-size: cover; 
}
.hero__years{ font:800 clamp(54rem,9vw,108rem)/1 "Montserrat"; color:#fff; letter-spacing:.5rem; }
.hero__bg{
  position:absolute; inset:0; z-index:-1; pointer-events:none;
  background:
    radial-gradient(60vw 42vh at 50% 60%, rgba(7,128,150,.35), rgba(7,128,150,0) 70%),
    radial-gradient(120% 100% at 50% -10%, rgba(10,14,22,0) 0%, rgba(10,14,22,.6) 100%);
}

/* ===== GOALS ===== */
.goals{ min-height: 100vh; display: flex; align-items: center; position: relative; }
.goals::before{
  content:""; position:absolute; inset:0; z-index:-2;
  background: var(--goals-bg) center/cover no-repeat; opacity:.22;
}
.goals__overlay{
  position:absolute; inset:0; z-index:-1;
  background:
    linear-gradient(180deg, rgba(3,9,20,.75) 0%, rgba(9,14,25,.85) 100%),
    radial-gradient(80vw 40vh at 50% 90%, rgba(16,185,220,.12), rgba(0,0,0,0) 70%);
}
.goals__grid{
  margin-top: clamp(22rem,3.6vw,36rem);
  display:grid; grid-template-columns: repeat(2, minmax(0,1fr));
  gap: clamp(28rem, 3.4vw, 44rem);
}
.goal{
  border-radius: 30rem; padding: clamp(40rem, 4.2vw, 64rem);
  background: rgba(7,128,150,.06);
  box-shadow: 0 14rem 44rem rgba(0,0,0,.28), inset 0 0 0 1px rgba(16,185,220,.38);
  color: #DDE9F8; min-height: 360rem; display:flex; align-items:center;
  font-size: clamp(18rem, 2.3vw, 24rem); line-height: 1.6;
}
.goal p{ margin: 0; }

/* очень широкие — можно 3 колонки */
@media (min-width: 1440px){
  .goals__grid{ grid-template-columns: repeat(3, minmax(0,1fr)); }
}

/* ===== PRIORITIES ===== */
.priorities { min-height: 100vh; display: flex; align-items: center; }
.priorities__inner {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: clamp(28rem, 5vw, 56rem); align-items: center; width: 100%;
}
.priorities__text{ align-self:center; }
.priorities__media{ position:relative; min-height:520rem; }
.priorities__media img{
  position:absolute; inset:0; width:100%; height:100%; object-fit:cover;
  border-radius:18rem; box-shadow:0 14rem 44rem rgba(0,0,0,.35); display:block;
}
.priorities__media .ph{
  position:absolute; inset:0; border-radius:18rem; background:#fff; box-shadow:0 14rem 44rem rgba(0,0,0,.35);
}
.priorities__bg{
  position:absolute; inset:0; z-index:-1; pointer-events:none;
  background:
    radial-gradient(80vw 54vh at 60% 80%, rgba(7,128,150,.35), rgba(7,128,150,0) 70%),
    radial-gradient(160% 110% at 50% -20%, rgba(10,14,22,0) 0%, rgba(10,14,22,.64) 100%);
}

/* ===== WHY ===== */
.why {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  text-align: center; padding: 0 20rem;
}
.why__text{
  margin-top:clamp(10rem,1.8vw,16rem); color:#EAF3FF;
  font:700 clamp(20rem,3vw,28rem)/1.4 "Montserrat"; text-wrap:balance;
}

/* ===== адаптив ===== */
@media (max-width: 1200px){
  .hero__inner{ grid-template-columns:1fr; }
  .priorities__inner{ grid-template-columns:1fr; }
  .priorities__media{ min-height:420rem; }
}
@media (max-width: 900px){
  .container, .container--wide{ width: 100%; }
  .goals__grid{ grid-template-columns: 1fr; }
  .goal{ min-height: 240rem; padding: clamp(28rem, 6vw, 40rem); }
  .priorities{ padding: clamp(56rem, 12vh, 100rem) 0; }
  .priorities__media{ min-height: 320rem; }
  .why{ padding: clamp(56rem, 12vh, 100rem) 0; }
  .page__bg{ background-attachment: scroll, scroll; }
}
</style>
