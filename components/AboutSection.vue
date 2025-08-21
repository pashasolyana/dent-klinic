<template>
<section id="about" class="aboutUs">
    <div class="container">
      <h2 class="aboutUsHeading">{{ about?.title || FALLBACK.title }}</h2>

      <p class="aboutUsText">
        {{ about?.text || FALLBACK.text }}
      </p>

      <a :href="about?.ctaHref || FALLBACK.ctaHref" class="cta">
        {{ about?.ctaLabel || FALLBACK.ctaLabel }}
      </a>
    </div>

    <!-- фоновая аура -->
    <div class="aboutBg" aria-hidden="true"></div>
  </section>
</template>

<script setup lang="ts">
import useAbout from '~/composables/useAbout';


const { about } = useAbout()

// Фоллбеки — текущий статический текст
const FALLBACK = {
  title: 'О клинике',
  text:
    'Наша клиника – не просто место, где люди получают стоматологическую помощь.\n' +
    'Это особое пространство, где соединяется наука, искусство и трудолюбие.',
  ctaLabel: 'Узнать больше',
  ctaHref: '/о-klinike'.replace('о','o') // защита от случайной кириллицы в пути :)
}
</script>

<style scoped>
/* Токены */
:host{
  --container: 1120rem;
  --hdr-off: var(--header-offset, 80rem);
  --bg: #0E101B;
}

/* Секция */
.aboutUs{
  position: relative;
  isolation: isolate;
  min-block-size: 100svh;
  display: grid;
  place-items: center;
  padding-inline: 24rem;
  overflow: clip;
  background: var(--bg);
  scroll-margin-top: var(--hdr-off);

  /* базовые «флюидные» размеры — от них считается CTA */
  --fz-h: clamp(26rem, 5.6vw, 48rem);  /* заголовок */
  --fz-b: clamp(15rem, 2.8vw, 30rem);  /* абзац */

  /* производные для кнопки: держим одинаковую пропорцию с текстом */
  --cta-f: max(14rem, calc(var(--fz-b) * .82));     /* ~как 18 при 22 */
  --cta-h: max(44rem, calc(var(--fz-b) * 2.55));    /* ~56 при 22 */
  --cta-px: max(24rem, calc(var(--fz-b) * 1.64));   /* ~36 при 22 */
  --cta-ring: max(5rem, calc(var(--fz-b) * .27));   /* «ореол» ~6 при 22 */
}

/* Контейнер */
.container{
  width: min(var(--container), 94vw);
  margin-inline: auto;
  text-align: center;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: clamp(18rem, 3.2vw, 28rem);
  padding-block: clamp(56rem, 12vh, 120rem);
}

/* Заголовок */
.aboutUsHeading{
  margin: 0;
  font-family: "Montserrat", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  font-weight: 700;
  color: #fff;
  text-wrap: balance;
  font-size: var(--fz-h);
}

/* Текст */
.aboutUsText{
  margin: 0;
  max-width: clamp(560rem, 82vw, 980rem);
  font-family: "Montserrat", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  color: #DDE9F8;
  text-wrap: pretty;
  font-size: var(--fz-b);
  line-height: clamp(1.46, 2.2vw, 1.6);
}

/* Кнопка — масштабируется от текста (var(--fz-b)) */
.cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  height: var(--cta-h);
  padding: 0 var(--cta-px);
  border-radius: 1000rem;
  border: 2rem solid #11c2a3;
  color: #eaf7f5;
  background: transparent;
  text-decoration: none;
  font: 700 var(--cta-f)/1 "Montserrat";

  box-shadow:
    0 0 0 var(--cta-ring) rgba(17, 194, 163, 0.06) inset,
    0 8rem 28rem rgba(0, 0, 0, 0.25);
  transition: background-color 0.15s, box-shadow 0.15s, transform 0.05s;
}
.cta:hover {
  background: rgba(17, 194, 163, 0.07);
  box-shadow:
    0 0 0 var(--cta-ring) rgba(17, 194, 163, 0.10) inset,
    0 10rem 34rem rgba(0, 0, 0, 0.30);
}
.cta:active { transform: translateY(1rem); }

/* Фон-аура (адаптивный) */
.aboutBg{
  position: absolute; inset: 0; z-index: -1; pointer-events: none;
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

/* ===== ПЛАНШЕТЫ (740–1200): крупнее текст — CTA масштабируется автоматически ===== */
@media (min-width: 740px) and (max-width: 1200px){
  .aboutUs{
    --fz-h: clamp(40rem, 5.4vw, 90rem);
    --fz-b: clamp(19rem, 2.8vw, 32rem);
  }
  .container{
    gap: 24rem;
    padding-block: clamp(64rem, 12vh, 112rem);
  }
  .aboutBg{
    background:
      radial-gradient(70vw 46vh at 50% 42%,
        rgba(7,128,150,.55) 0%,
        rgba(7,128,150,.33) 32%,
        rgba(7,128,150,.16) 52%,
        rgba(7,128,150,0) 76%
      ),
      radial-gradient(160% 110% at 50% -14%,
        rgba(10,14,22,0) 0%,
        rgba(10,14,22,.28) 42%,
        rgba(10,14,22,.62) 100%
      );
  }
}

/* ===== ТЕЛЕФОНЫ (<=768): фон ниже и шире ===== */
@media (max-width: 768px){
  .container{ padding-block: clamp(40rem, 12vh, 80rem); gap: clamp(14rem, 3.5vw, 20rem); }
  .aboutBg{
    background:
      radial-gradient(110vw 50vh at 50% 44%,
        rgba(7,128,150,.50) 0%,
        rgba(7,128,150,.28) 34%,
        rgba(7,128,150,.14) 56%,
        rgba(7,128,150,0) 82%
      ),
      radial-gradient(180% 120% at 50% -20%,
        rgba(10,14,22,0) 0%,
        rgba(10,14,22,.30) 42%,
        rgba(10,14,22,.64) 100%
      );
  }
}

/* ===== Очень узкие (<=360) — минимум размеров сохранён переменными ===== */
@media (max-width: 360px){
  /* ничего дополнительно не нужно: var(--cta-h/f/px) уже имеют минимумы */
}

/* respect reduce-motion */
@media (prefers-reduced-motion: reduce){
  .cta{ transition: none; }
}
</style>
