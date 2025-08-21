<template>
  <section id="doctors" class="heroDoctors">
    <!-- Фоновое изображение -->
    <img class="heroBg" :src="hero.bgUrl || '/images/bg.png'" alt="" loading="eager" decoding="async" />

    <div class="container">
      <h1 class="title">{{ hero.title }}</h1>

      <p class="subtitle">
        {{ hero.subtitle }}
      </p>

      <a v-if="hero.showCta" :href="hero.ctaHref" class="cta">
        {{ hero.ctaText }}
      </a>
    </div>

    <!-- Слои фона -->
    <div class="bgLayer" aria-hidden="true"></div>
  </section>
</template>

<script setup lang="ts">
import { useDoctorsHero } from '~/composables/useDoctorsHero'

const { hero } = useDoctorsHero()
// при необходимости: const { pending, error, refresh } = useDoctorsHero()
</script>
<style scoped>
/* Секция + флюидные токены (как в About/Sales) */
.heroDoctors{
  position: relative;
  isolation: isolate;
  min-block-size: 100svh;
  display: flex;
  align-items: center;
  justify-content: center;
  place-items: center;
  padding-inline: 24rem;
  background-color: #091019;
  overflow: clip;

  /* базовые размеры шрифтов */
  --fz-h: clamp(26rem, 5.6vw, 48rem);  /* заголовок */
  --fz-b: clamp(15rem, 2.8vw, 30rem);  /* текст */

  /* производные размеры кнопки (пропорции как в About) */
  --cta-f:  max(14rem, calc(var(--fz-b) * .82));
  --cta-h:  max(44rem, calc(var(--fz-b) * 2.55));
  --cta-px: max(24rem, calc(var(--fz-b) * 1.64));
  --cta-ring:max(5rem,  calc(var(--fz-b) * .27));
}

/* Фон */
.heroBg{
  position:absolute; inset:0; width:100%; height:100%;
  object-fit:cover; z-index:0; display:block;
}

/* Контент */
.container{
  position: relative; z-index: 2;
  max-width: 1120rem; width: 100%; margin-inline: auto;
  display: flex; flex-direction: column; align-items: center; text-align: center;
  gap: clamp(18rem, 3.2vw, 28rem);
  padding-block: clamp(60rem, 10vh, 140rem);
}

/* Типографика */
.title{
  margin:0; font-weight:800;
  font-size: var(--fz-h); line-height:1.1;
  color:#fff; text-shadow:0 2rem 22rem rgba(0,0,0,.34);
}
.subtitle{
  margin:0; max-width:980rem; font-weight:500;
  font-size: var(--fz-b); line-height:1.6;
  color:#DDE9F8; text-shadow:0 1rem 14rem rgba(0,0,0,.22);
}

/* Кнопка */
.cta{
  display:inline-flex; align-items:center; justify-content:center;
  height: var(--cta-h);
  padding: 0 var(--cta-px);
  border-radius: 1000rem;
  border: 2rem solid #11c2a3;
  color:#eaf7f5; background:transparent; text-decoration:none;
  font: 700 var(--cta-f)/1 "Montserrat";
  box-shadow: 0 0 0 var(--cta-ring) rgba(17,194,163,.06) inset,
              0 8rem 28rem rgba(0,0,0,.25);
  transition: background-color .15s, box-shadow .15s, transform .05s;
}
.cta:hover{
  background: rgba(17,194,163,.07);
  box-shadow: 0 0 0 var(--cta-ring) rgba(17,194,163,.10) inset,
              0 10rem 34rem rgba(0,0,0,.30);
}
.cta:active{ transform: translateY(1rem); }

/* Оверлейные слои фона */
.bgLayer{
  position:absolute; inset:0; z-index:1; pointer-events:none;
  background:
    radial-gradient(780rem 520rem at 50% 55%,
      rgba(9,159,178,.55) 0%,
      rgba(9,159,178,.34) 32%,
      rgba(9,159,178,.18) 52%,
      rgba(9,159,178,0) 70%
    ),
    linear-gradient(180deg,
      rgba(6,10,18,.58) 0%,
      rgba(6,10,18,.72) 48%,
      rgba(6,10,18,.86) 100%
    );
}

/* ===== Планшеты (740–1200) ===== */
@media (min-width:740px) and (max-width:1200px){
  .heroDoctors{
    --fz-h: clamp(40rem, 5.4vw, 90rem);
    --fz-b: clamp(19rem, 2.8vw, 32rem);
  }
  .container{ gap: 24rem; padding-block: clamp(72rem, 12vh, 128rem); }
  .bgLayer{
    background:
      radial-gradient(70vw 46vh at 50% 44%,
        rgba(9,159,178,.55) 0%,
        rgba(9,159,178,.33) 32%,
        rgba(9,159,178,.16) 54%,
        rgba(9,159,178,0) 78%
      ),
      linear-gradient(180deg,
        rgba(6,10,18,.56) 0%,
        rgba(6,10,18,.72) 46%,
        rgba(6,10,18,.86) 100%
      );
  }
}

/* ===== ТЕЛЕФОНЫ (<=768): ПЕРЕНОС из «О клинике» (центр, safe-area, те же отступы) ===== */
@media (max-width:768px){
  .heroDoctors{
    padding-inline: calc(16rem + env(safe-area-inset-left, 0px))
                    calc(16rem + env(safe-area-inset-right, 0px));
    justify-items: stretch !important;  /* растягиваем контейнер на всю ширину */
  }
  .container{
    width: 100%;
    max-width: none;
    margin-inline: auto;
    text-align: center !important;
    align-items: center !important;
    gap: clamp(14rem, 3.5vw, 20rem);
    padding-block: clamp(40rem, 12vh, 80rem); /* как в About */
  }
  .title,
  .subtitle{
    text-align: center !important;
    margin-inline: auto !important;
  }
  .subtitle{
    max-width: min(92vw, 720rem); /* как в About */
  }

  /* фон можно оставить фирменный для «Врачи» */
  .bgLayer{
    background:
      radial-gradient(110vw 50vh at 50% 50%,
        rgba(9,159,178,.50) 0%,
        rgba(9,159,178,.28) 36%,
        rgba(9,159,178,.14) 58%,
        rgba(9,159,178,0) 84%
      ),
      linear-gradient(180deg,
        rgba(6,10,18,.52) 0%,
        rgba(6,10,18,.70) 48%,
        rgba(6,10,18,.86) 100%
      );
  }
}

/* reduce-motion */
@media (prefers-reduced-motion: reduce){
  .cta{ transition:none; }
}

</style>
