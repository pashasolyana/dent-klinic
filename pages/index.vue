<template>
  <HeroSection />
  <AboutSection />
  <SalesSection />
  <PromoSlider :items="[]" />
  <DoctorSection />
  <ServicesPage />
  <LogoSection :items="logos || []" :logo-height="140" title="Производители" />
  <Contact />
</template>

<script setup lang="ts">
import HeroSection from '~/components/HeroSection.vue'
import AboutSection from '~/components/AboutSection.vue'
import SalesSection from '~/components/SalesSection.vue'
import PromoSlider from '~/components/PromoSlider.vue'
import DoctorSection from '~/components/DoctorSection.vue'
import ServicesPage from '~/components/ServicesPage.vue'
import LogoSection from '~/components/LogoSection.vue'
import Contact from '~/components/Contact.vue'
import { useLogos } from '~/composables/useLogos'
import { useSeoMeta } from '~/composables/useSeoMeta'
import { useJsonLd } from '~/composables/useJsonLd'

const { logos } = useLogos()

// -------- SEO: главная страница --------
useSeoMeta({
  title: 'Стоматологическая клиника доктора Бронникова — равновесие функциональности и эстетики',
  description:
    'Диагностика, терапия, имплантация, протезирование и профилактика. Современное оборудование, опытные врачи и комфортный сервис.',
  path: '/',                  // canonical и og:url соберутся автоматически
  type: 'website',
  image: {                    // og:image (рекомендуемый размер 1200×630)
    url: '/images/og/home.jpg',
    width: 1200,
    height: 630,
    alt: 'Интерьер стоматологической клиники доктора Бронникова'
  },
  // при необходимости можно добавить alternates: [{ hrefLang: 'ru', href: '/' }]
})

// -------- JSON-LD: WebSite + Organization --------
const { public: pub } = useRuntimeConfig()
const siteUrl = (pub?.siteUrl || '').replace(/\/$/, '') || 'https://example.com'
const orgName = 'Стоматологическая клиника доктора Бронникова'

// Структурированные данные: сайт
useJsonLd(() => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: orgName,
  url: siteUrl,
  inLanguage: 'ru-RU'
  // Если появится поиск по сайту — можно добавить potentialAction: SearchAction
}))

// Структурированные данные: организация (клиника)
useJsonLd(() => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: orgName,
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,   // желательно квадрат 512×512/1024×1024
  sameAs: [
    // сюда можно добавить ссылки на официальные страницы/каталоги:
    // 'https://vk.com/yourclinic',
    // 'https://2gis.ru/...'
  ]
}))
</script>
