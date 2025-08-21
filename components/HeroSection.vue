<template>
  <section class="hero">
    <!-- фон -->
    <picture class="hero__bg" aria-hidden="true">
      <img src="/images/bg.png" alt="" loading="eager" decoding="async" />
    </picture>

    <!-- затемнение сверху -->
    <div class="hero__topShade" aria-hidden="true"></div>

    <div class="hero__content">
      <h1 class="frontHeading">Стоматологическая клиника доктора бронникова</h1>
      <p class="frontSubtitle">Равновесие функциональности и эстетики</p>
    </div>
  </section>
</template>

<script setup lang="ts">
// импорт не нужен: /public доступен по абсолютному пути /images/...
</script>

<style scoped>
/* контейнер и отступы */
:host{ --max:1120rem; --pad:clamp(14px,3vw,24px); }

.hero{
  position:relative;
  min-height: 100svh;       /* тянем фон на весь экран */
  display:grid; place-items:center;
  overflow:hidden;
}

/* фон */
.hero__bg{ position:absolute; inset:0; z-index:0; }
.hero__bg img{ width:100%; height:100%; object-fit:cover; display:block; }

/* затемнение */
.hero__topShade{
  position:absolute; inset:0; z-index:0; pointer-events:none;
  background: linear-gradient(180deg, rgba(7,10,16,.85) 0%, rgba(7,10,16,.55) 18%, rgba(7,10,16,0) 40%);
}

/* контент по центру */
.hero__content{
  position:relative; z-index:1;
  width:min(var(--max), 92vw);
  margin-top:8vh;
  text-align:center;
  padding-inline: var(--pad);
}

/* === ТВОИ СТИЛИ === */
.frontHeading{
  font-family:"Montserrat", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  font-size:60rem;
  font-weight:400;
  letter-spacing:0;
  text-align:center;
  margin:0 auto 60rem;
  color:#fff;
  width:1100rem;          /* как просил */
  max-width:100%;
  text-transform:uppercase;
  line-height:1.16;
}

.frontSubtitle{
  margin:0 auto;             /* центрируем сам блок */
  font-family:"Montserrat", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  font-size:32rem;
  font-weight:400;
  letter-spacing:0;
  text-align:center;         /* <-- было left */
  color:#fff;
  text-transform:uppercase;
}

/* адаптив */
/* ===== Планшеты ===== */
@media (max-width: 1024px) {
  .hero__content {
    margin-top: 8vh;
    padding-inline: clamp(16px, 4vw, 32px);
  }

  .frontHeading {
    font-size: 32px;
    margin-bottom: 24px;
    line-height: 1.2;
    width: 100%;          /* убираем фиксированную ширину */
    max-width: 92vw;
  }

  .frontSubtitle {
    font-size: 18px;
    line-height: 1.4;
    max-width: 90vw;
  }
}

/* ===== Мобильные телефоны ===== */
@media (max-width: 768px) {
  .hero__content {
    margin-top: 12vh;
    padding-inline: 20px;
  }

  .frontHeading {
    font-size: 24px;
    margin-bottom: 20px;
    width: 100%;
    max-width: 90vw;
    text-align: center;
    word-wrap: break-word;
  }

  .frontSubtitle {
    font-size: 14px;
    max-width: 85vw;
    text-align: center;
    word-wrap: break-word;
  }
}

</style>
