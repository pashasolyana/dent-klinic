
<template>
  <section id="contacts" class="contacts">
    <img class="contacts__bg" :src="contacts?.bgSrc || '/images/contacts.png'" alt="Фон секции" />

    <div class="container">
      <h2 class="contacts__title">Контакты</h2>

      <div class="contacts__grid">
        <div class="contacts__left">
          <article class="card card--head">
            <div class="head">
              <div class="head__icon">📞</div>
              <a class="head__tel" :href="`tel:${contacts?.phone}`" >{{ contacts?.phone || '—' }}</a>
              <div class="head__soc">
                <a :href="contacts?.social?.telegramUrl" target="_blank" aria-label="Telegram" v-if="contacts?.social?.telegramUrl">
                  <img src="/images/tg.png" alt="Telegram" />
                </a>
                <a :href="contacts?.social?.whatsappUrl" target="_blank" aria-label="WhatsApp" v-if="contacts?.social?.whatsappUrl">
                  <img src="/images/wa.png" alt="WhatsApp" />
                </a>
              </div>
            </div>
            <a :href="contacts?.ctaHref || '#form'" class="btn">{{ contacts?.ctaLabel || 'Оставить заявку' }}</a>
          </article>

          <article class="card card--row">
            <div class="row__icon">⏰</div>
            <div>
              <h3 class="row__title">Время работы</h3>
              <p class="row__text">{{ contacts?.schedule }}</p>
            </div>
          </article>

          <article class="card card--row">
            <div class="row__icon">📍</div>
            <div>
              <h3 class="row__title">Адрес клиники</h3>
              <p class="row__text">{{ contacts?.address }}</p>
            </div>
          </article>
        </div>

        <div class="contacts__map">
          <iframe
            title="Карта проезда"
            :src="contacts?.mapEmbed"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </div>
  </section>
</template>
  
<script setup lang="ts">
import { useContacts } from '~/composables/useContacts'
const { contacts } = useContacts()
</script>

  
  <style>
 .contacts {
  position: relative;
  background: #f6f8fc;
  padding: 80px 0 88px;
  overflow: hidden;
  border-radius: 24px;
  z-index: 0;
}

.contacts__bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.9;
  pointer-events: none;
  z-index: -1;
}

.container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 20px;
}

.contacts__title {
  font-size: 44px;
  font-weight: 800;
  color: #0e1220;
  margin-bottom: 28px;
  font-family: "Montserrat", sans-serif;
}

.contacts__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
  align-items: stretch;
}

.contacts__left {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.card {
  background: #fff;
  border-radius: 28px;
  box-shadow: 0 18px 44px rgba(16, 24, 40, 0.08);
  padding: 24px;
}

.card--head {
  padding: 28px;
}

.head {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
}

.head__icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: #ecf2ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.head__tel {
  font: 800 24px "Montserrat", sans-serif;
  color: #0e1220;
  text-decoration: none;
  white-space: nowrap;
}

.head__soc {
  display: flex;
  gap: 12px;
  margin-left: auto;
}

.head__soc img {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.btn {
  margin-top: 18px;
  display: inline-block;
  background: #0d67f0;
  color: white;
  border-radius: 1000px;
  padding: 12px 24px;
  font: 600 16px "Montserrat", sans-serif;
  text-decoration: none;
  text-align: center;
  transition: background 0.3s;
}

.btn:hover {
  background: #0b5dd6;
}

.card--row {
  display: flex;
  gap: 16px;
  align-items: center;
}

.row__icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #eef2ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.row__title {
  font: 700 20px "Montserrat", sans-serif;
  color: #2a3345;
  margin-bottom: 4px;
}

.row__text {
  font: 500 16px "Montserrat", sans-serif;
  color: #34405a;
}

.contacts__map {
  min-height: 400px;
  border-radius: 28px;
  overflow: hidden;
  background: #e9eef8;
  box-shadow: 0 18px 44px rgba(16, 24, 40, 0.08);
}

.contacts__map iframe {
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
}

/* ✅ Адаптив */
@media (max-width: 1024px) {
  .contacts__grid {
    grid-template-columns: 1fr;
  }

  .contacts__map {
    min-height: 320px;
  }
}

@media (max-width: 600px) {
  .contacts__title {
    font-size: 34px;
  }

  .head__tel {
    font-size: 20px;
  }

  .btn {
    font-size: 14px;
    padding: 10px 20px;
  }

  .head {
    flex-direction: column;
    align-items: flex-start;
  }

  .head__soc {
    margin-left: 0;
  }
}

  </style>
  