<template>
  <section
    id="sales"
    class="sales sales--short sales--dark"
    style="--sales-left: clamp(260rem, 20vw, 520rem); --sales-top: clamp(110rem, 14vh, 190rem);"
  >
    <picture class="sales__bg" aria-hidden="true">
      <img src="/images/bg2.png" alt="" loading="eager" decoding="async" />
    </picture>

    <div class="sales__shade" aria-hidden="true"></div>

    <div class="sales__inner">
      <h2 class="sales__title">{{ sales?.title }}</h2>
      <!-- ВАЖНО: div, не p -->
      <div class="sales__text" v-html="sales?.textHtml"></div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useSales } from '~/composables/useSales'
const { sales } = useSales()
</script>

<style scoped>
/* Базовые токены и флюидные размеры (как в блоке «О клинике») */
.sales{
  position: relative;
  overflow: hidden;
  background:#0B1824;
  color:#F1F6FF;

  display:flex; align-items:center; justify-content:center;

  min-height: clamp(420rem, 65vh, 720rem);
  padding-inline: 16rem;

  /* Флюидные размеры шрифтов — те же, что и в About */
  --fz-h: clamp(26rem, 5.6vw, 48rem);  /* заголовок */
  --fz-b: clamp(15rem, 2.8vw, 30rem);  /* абзац */
}

/* фон */
.sales__bg{ position:absolute; inset:0; z-index:0; pointer-events:none; }
.sales__bg img{ width:100%; height:100%; object-fit:cover; display:block; }

.sales__shade{
  position:absolute; inset:0; z-index:1; pointer-events:none;
  background: linear-gradient(to bottom, rgba(11,24,36,.95), rgba(11,24,36,0));
}

/* Контент */
.sales__inner{
  position:relative; z-index:2;
  text-align:center;
  max-width: 960rem;
  margin: 0 auto;
  display:flex; flex-direction:column; gap: 18rem;
}

.sales__title{
  margin:0;
  font: 800 var(--fz-h)/1.2 "Montserrat", system-ui;
  color:#fff;
}

.sales__text{
  margin:0;
  font: 500 var(--fz-b)/1.6 "Montserrat", system-ui;
  color:#DBE7F6;
}

/* Ссылка в тексте */
.sales__link{
  color:#0BC0E6; font-weight:600;
  text-decoration:underline; text-underline-offset:3rem;
  transition: color .2s ease;
}
.sales__link:hover{ color:#23E3C5; }

/* ===== Планшеты (740–1200): те же крупные размеры, что вы просили ===== */
@media (min-width:740px) and (max-width:1200px){
  .sales{
    --fz-h: clamp(40rem, 5.4vw, 90rem);
    --fz-b: clamp(19rem, 2.8vw, 32rem);
  }
  .sales__inner{ gap: 24rem; }
}

/* ===== Телефоны (<=768): размер такой же, как в About — единый вид по всем вкладкам ===== */
@media (max-width:768px){
  /* базовые --fz-h/--fz-b уже задают нужный флюидный масштаб для мобилок,
     дополнительно лишь чуть увеличим вертикальный ритм */
  .sales__inner{ gap: clamp(14rem, 3.5vw, 20rem); }
}

/* Очень узкие (<=360) — ничего менять не нужно: clamp уже ограничивает минимума */
</style>
