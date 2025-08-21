<script setup lang="ts">

import { computed, ref, watch, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ModalForm from '~/components/ModalForm.vue'
import LeadForm from '~/components/LeadForm.vue'
import { useHead } from '@unhead/vue'
import { useRuntimeConfig } from 'nuxt/app'

const route = useRoute()
const router = useRouter()
const { public: pub } = useRuntimeConfig()
const siteUrl = pub?.siteUrl || 'https://bronnikovdent.ru'
useHead({
  link: [
    {
      rel: 'canonical',
      href: siteUrl.replace(/\/$/, '') + route.fullPath
    }
  ]
})

const defaultLinks: any[] = [
  { label: 'О клинике', href: '/o-klinike' },
  { label: 'Акции',     href: '/akcii' },
  { label: 'Врачи',     href: '/vrachi' },
  { label: 'Услуги',    href: '/uslugi' },
  { label: 'Контакты',  href: '/#contacts' } // если отдельной страницы нет — замени на '/#contacts'
]


const showForm = ref(false)
watchEffect(() => { showForm.value = route.hash === '#form' })
watch(showForm, (v) => {
  if (v && route.hash !== '#form') router.replace({ hash: '#form' })
  if (!v && route.hash === '#form') router.replace({ hash: '' })
})

// если страница задала meta.headerLinks — используем их, иначе дефолт
const headerLinks = computed<LinkItem[]>(() => (route.meta?.headerLinks as LinkItem[]) ?? defaultLinks)
</script>

<template>
  <div class="layout">
    <SiteHeader :links="headerLinks" />
    <NuxtPage />
    <Contact />
    
  </div>
    <ModalForm v-model="showForm">
      <LeadForm @submitted="showForm = false" />
    </ModalForm>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');

html{
  /* на десктопе 1920 – 1rem ≈ 1px */
  font-size: 0.0520833333vw;
  font-family: "Montserrat", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
}
body{ margin:0; background:#11111F; }

/* планшет: под контейнер 1120/1360 */
@media (max-width: 1200px){
  html{ font-size: calc(100vw / 1360); } /* 1rem ≈ 1px при ширине 1360 */
}
/* мобильные: читаемый размер */
@media (max-width: 768px){
  html{ font-size: calc(100vw / 430); }  /* iPhone Pro/Pixel 7≈430 */
}
@media (max-width: 480px){
  html{ font-size: calc(100vw / 390); }  /* iPhone mini/SE≈390 */
}

.page-main{ min-height:100svh; }
</style>
