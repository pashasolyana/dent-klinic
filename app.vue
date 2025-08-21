<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const route = useRoute()
const runtime = useRuntimeConfig()
const siteUrl = (runtime.public.siteUrl || '').replace(/\/$/, '')
const siteName = runtime.public.siteName || 'Доктор Бронников'
const twitterSite = runtime.public.twitterSite || ''
const twitterCreator = runtime.public.twitterCreator || ''
const ogW = Number(runtime.public.defaultOgWidth || 1200)
const ogH = Number(runtime.public.defaultOgHeight || 630)

const isProd  = process.env.NODE_ENV === 'production'

// абсолютная картинка в проде, относительная в dev (для локальных превью)
const defaultOgImage = isProd && siteUrl ? `${siteUrl}/og-cover.jpg` : '/og-cover.jpg'

// Хелпер для канонического URL
const makeCanonical = (path: string) =>
  siteUrl ? siteUrl + (path.startsWith('/') ? path : `/${path}`) : undefined

// Глобальные дефолты SEO (страницы смогут переопределять)
useSeoMeta({
  // Title + description по умолчанию
  title: 'Стоматологическая клиника доктора Бронникова',
  description:
    'Стоматологическая клиника доктора Бронникова — равновесие функциональности и эстетики. Диагностика, терапия, имплантация, протезирование и профилактика.',

  // Open Graph defaults
  ogType: 'website',
  ogSiteName: siteName,
  ogTitle: 'Стоматологическая клиника доктора Бронникова',
  ogDescription:
    'Стоматологическая клиника доктора Бронникова — равновесие функциональности и эстетики. Диагностика, терапия, имплантация, протезирование и профилактика.',
  ogImage: defaultOgImage,
  ogImageWidth: String(ogW),
  ogImageHeight: String(ogH),
  // og:url ставим ниже через useHead, чтобы совпадал с canonical
})

// canonical + og:url (и dev noindex)
const applyRouteHead = (path: string) => {
  const canonical = makeCanonical(path)

  useHead({
    link: canonical ? [{ key: 'canonical', rel: 'canonical', href: canonical }] : [],
    meta: [
      // синхронизируем og:url с canonical
      ...(canonical ? [{ key: 'og:url', property: 'og:url', content: canonical }] : []),
      // В dev — noindex, чтобы не индексировать предпросмотр
      ...(isProd ? [] : [{ key: 'robots', name: 'robots', content: 'noindex, nofollow' }])
    ]
  })
}

// первичная установка
applyRouteHead(route.fullPath)

// обновление при SPA-навигации без накопления дублей
watch(() => route.fullPath, (p) => applyRouteHead(p))
</script>
