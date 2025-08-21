<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useDoctors } from '~/composables/useDoctors'
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

const { doctors, load } = useDoctors()
onMounted(() => load({ visibleOnly: true }))

const bgStyle = computed(() => ({
  background: `
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
    ),
    linear-gradient(180deg, rgba(7,10,16,.85) 0%, rgba(7,10,16,.55) 18%, rgba(7,10,16,0) 40%)
  `,
  backgroundRepeat: 'no-repeat',
  backgroundAttachment: 'fixed, scroll, scroll'
}))

useSeoMeta({
  title: 'Врачи клиники — опытные специалисты | Доктор Бронников',
  description: 'Команда профессионалов: терапевты, ортопеды, хирурги‑имплантологи, ортодонты. Внимание к деталям и персональный подход.',
  path: '/vrachi',
  type: 'profile',
  image: { url: '/images/og/doctors.jpg', width: 1200, height: 630, alt: 'Команда врачей клиники' }
})

/* ===== JSON‑LD ===== */
const { public: pub } = useRuntimeConfig()
const siteUrl = (pub?.siteUrl || '').replace(/\/$/, '') || 'https://example.com'
const abs = (p: string) => new URL(p, siteUrl).toString()

// Хлебные крошки
useJsonLd(() => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Главная', item: abs('/') },
    { '@type': 'ListItem', position: 2, name: 'Врачи',   item: abs('/vrachi') }
  ]
}))
// Список специалистов (Person). Если фото нет — пропускаем image.
useJsonLd(() => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  itemListElement: (Array.isArray(doctors.value) ? doctors.value : []).map((d:any, i:number) => {
    const url = abs(`/vrachi#${d.id}`)
    const base: any = {
      '@type': 'Person',
      name: d.name || 'Врач',
      jobTitle: d.position || undefined,
      description: d.description || undefined,
      url
    }
    if (d.photo) base.image = abs(d.photo)
    return { '@type': 'ListItem', position: i + 1, item: base }
  })
}))
</script>

<template>
  <main class="doctors" :style="bgStyle">
    <div class="container">
      <h1 class="title">Врачи</h1>

      <div class="grid">
        <div v-for="d in doctors" :key="d.id" class="item">
          <figure class="ph">
            <img :src="d.photo || '/placeholder.jpg'" :alt="d.name || 'Доктор'" class="ph-img" />

            <!-- DESKTOP: текст поверх фото (overlay) -->
            <figcaption class="overlay">
              <h3 class="name">{{ d.name }}</h3>
              <p v-if="d.position" class="pos">{{ d.position }}</p>
              <p v-if="d.description" class="desc">{{ d.description }}</p>
            </figcaption>
          </figure>

          <!-- MOBILE/TABLET: подпись под фото -->
          <div class="below">
            <h3 class="name">{{ d.name }}</h3>
            <p v-if="d.position" class="pos">{{ d.position }}</p>
            <p v-if="d.description" class="desc">{{ d.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
 .doctors{
  --container: 1200px;
  --gap: 20px;
  --card-radius: 6px; /* поменяешь цифру — изменится везде */
  --text: #ffffff;
  --muted: #e6eef7;

  position:relative;
  min-height:100dvh;
  color:var(--text);
  padding: 120px 0 60px;
}
.container{ width:min(100% - 32px, var(--container)); margin-inline:auto; }
.title{
  text-align:center;
  font-size:clamp(28px,3.5vw,42px);
  font-weight:800;
  letter-spacing:.2px;
  margin:0 0 36px;
  color:#fff;
  text-shadow:0 2px 12px rgba(0,0,0,.6);
}

/* сетка */
.grid{
  display:grid;
  gap:var(--gap);
  row-gap: 36px; /* вертикальное расстояние между карточками */
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  align-items:start;
}
.item{
  background:transparent !important;
  border:0 !important;
  box-shadow:none !important;
  padding:0 !important;
}

/* фото-карточка */
.ph{
  position:relative;
  border-radius:var(--card-radius) !important;
  overflow:hidden;
  aspect-ratio:3 / 4;
  background:transparent;
  box-shadow:0 6px 20px rgba(0,0,0,.5);
  transition:transform .3s ease, box-shadow .3s ease;
  border:2px solid rgba(255,255,255,.25); /* рамка */
  
}
.ph:hover{
  transform:translateY(-6px) scale(1.02);
  box-shadow:0 12px 28px rgba(0,0,0,.65);
  border-color:rgba(255,255,255,.5);
}
.ph-img{
  width:110%; height:110%;
  object-fit:cover; display:block;
}

/* Overlay */
.overlay{
  position:absolute; inset:0;
  display:grid; place-content:end;
  padding:18px;
  background:linear-gradient(180deg, rgba(7,10,16,0) 0%, rgba(7,10,16,.55) 50%, rgba(7,10,16,.92) 100%);
  transform:translateY(100%);
  transition:transform .35s ease;
  color:#fff;
}
.ph:hover .overlay,
.ph:focus-visible .overlay{ transform:translateY(0); }

/* Подпись под фото (мобилка) */
.below{ display:none; padding:12px 4px 0; text-align:center; }

@media (max-width: 991px){
  .overlay{ display:none; }
  .below{ display:block; }
}

/* Текстовые стили */
.name{
  color:#ffffff;
  font-weight:800;
  font-size:clamp(18px, 2vw, 22px);
  margin:0 0 6px;
}
.pos{
  margin:0 0 6px;
  color:#ffffff;
  font-size:14px;
}
.desc{
  margin:0;
  font-size:14px;
  line-height:1.55;
  color:#ffffff;
  opacity:.92;
}
</style>
