<script setup>
definePageMeta({ layout: 'admin', middleware: ['auth'] })

import SimpleHtmlEditor from '~/components/admin/SimpleHtmlEditor.vue'
const route = useRoute()
const router = useRouter()

const isNew = computed(() => route.params.id === 'new')

// НОВОЕ: тип оффера

const form = reactive({
  title: '',
  text: '',
  img: '',
  discount: '',
  // НОВОЕ: офферы
  offers: [],
  // СТАРОЕ (для миграции/совместимости):
  price: { old: '', new: '', label: '' },
  ctaText: '',
  ctaHref: '',
  free: false
})

const busy = ref(false)
const err = ref('')

function uuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

onMounted(async () => {
  if (!isNew.value) {
    const s = await $fetch(`/api/admin/promo/${route.params.id.replace(/[^0-9]/g,'')}`)
      .catch(async () => {
        const all = await $fetch('/api/admin/promo')
        return all.find(x => String(x.id) === String(route.params.id))
      })
    if (!s) return

    // нормализация/миграция
    const hasOffers = Array.isArray(s.offers) && s.offers.length
    const offers = hasOffers ? s.offers.map((o) => ({
      id: o.id || uuid(),
      text: o.text || '',
      price: o.free ? null : (o.price ?? null),
      free: !!o.free
    })) : [{
      id: uuid(),
      text: s.text || '',
      price: s.free ? null : (s.price ?? null),
      free: !!s.free
    }]

    Object.assign(form, {
      title: s.title || '',
      text: s.text || '',
      img: s.img || '',
      discount: s.discount || '',
      offers,
      // старые для совместимости (необязательно показывать)
      price: { old: s.price?.old || '', new: s.price?.new || '', label: s.price?.label || '' },
      ctaText: s.ctaText || '',
      ctaHref: s.ctaHref || '',
      free: !!s.free
    })
  } else {
    // дефолт: один пустой оффер
    form.offers = [{ id: uuid(), text: '', price: null, free: false }]
  }
})

function addOffer() {
  form.offers.push({ id: uuid(), text: '', price: null, free: false })
}
function delOffer(i) {
  form.offers.splice(i,1)
  if (!form.offers.length) addOffer()
}

async function save() {
  busy.value = true; err.value = ''
  try {
    // чистка: если оффер free=true — price=null
    const payload = {
      ...form,
      offers: form.offers.map(o => ({
        id: o.id,
        text: o.text,
        free: !!o.free,
        price: o.free ? null : (o.price ?? null)
      }))
    }

    if (isNew.value) {
      const created = await $fetch('/api/admin/promo', { method:'POST', credentials:'include', body: payload })
      await router.replace(`/admin/promo/${created.id}`)
    } else {
      await $fetch(`/api/admin/promo/${route.params.id}`, { method:'PUT', credentials:'include', body: payload })
    }
    navigateTo('/admin/promo')
  } catch(e) {
    err.value = e?.data?.message || 'Ошибка сохранения'
  } finally {
    busy.value = false
  }
}

async function onPick(e){
  const file = e.target.files?.[0]
  if (!file) return
  const fd = new FormData()
  fd.append('file', file)
  try{
    const res = await $fetch('/api/upload', { method:'POST', body: fd, credentials:'include' })
    form.img = res.files?.[0]?.url || form.img
  }catch(e){
    err.value = e?.data?.message || 'Не удалось загрузить файл'
  }finally{
    e.target.value = ''
  }
}
</script>


<template>
  <section class="wrap">
    <form class="card" @submit.prevent="save">
      <div class="topbar">
        <NuxtLink class="back" to="/admin/promo">
          <svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>
          <span>Назад</span>
        </NuxtLink>
        <h1 class="title">{{ isNew ? 'Новый слайд' : 'Редактирование слайда' }}</h1>
      </div>

      <div class="grid">
        <div class="left">
          <label class="label">Заголовок</label>
          <input v-model="form.title" class="inp" required />

          <label class="label">Текст (WYSIWYG)</label>
          <SimpleHtmlEditor v-model="form.text" placeholder="Описание акции…" />

          <div class="row">
            <div class="col">
              <label class="label">CTA — текст</label>
              <input v-model="form.ctaText" class="inp" placeholder="Напр., «Записаться»" />
            </div>
            <div class="col">
              <label class="label">CTA — ссылка</label>
              <input v-model="form.ctaHref" class="inp" placeholder="/akcii /#form https://…" />
            </div>
          </div>

          <div class="row">
            <div class="col">
              <label class="label">Скидка (бейдж на слайде)</label>
              <input v-model="form.discount" class="inp" placeholder="-30%" />
            </div>
          </div>

          <!-- НОВОЕ: редактор офферов -->
          <label class="label" style="margin-top:16px">Офферы (пункты с ценой/«Бесплатно»)</label>
          <div class="offers">
            <div v-for="(o,i) in form.offers" :key="o.id" class="offer">
              <div class="offer-head">
                <span class="offer-idx">#{{ i+1 }}</span>
                <button type="button" class="mini danger" @click="delOffer(i)">Удалить</button>
              </div>

              <label class="sublabel">Текст оффера (допускается базовый HTML)</label>
              <SimpleHtmlEditor v-model="o.text" placeholder="Например: «Первичная консультация стоматолога»" />

              <div class="row">
                <div class="col">
                  <label class="sublabel">Бесплатно</label>
                  <label class="switch">
                    <input type="checkbox" v-model="o.free" />
                    <span></span>
                  </label>
                </div>

                <template v-if="!o.free">
                  <div class="col">
                    <label class="sublabel">Старая цена</label>
                    <input v-model="(o.price ||= {}).old" class="inp" placeholder="6 900" />
                  </div>
                  <div class="col">
                    <label class="sublabel">Новая цена</label>
                    <input v-model="(o.price ||= {}).new" class="inp" placeholder="4 900" />
                  </div>
                  <div class="col">
                    <label class="sublabel">Лейбл (например «По акции»)</label>
                    <input v-model="(o.price ||= {}).label" class="inp" placeholder="По акции" />
                  </div>
                </template>
              </div>
            </div>

            <button type="button" class="mini" @click="addOffer">+ Добавить оффер</button>
          </div>
        </div>

        <div class="right">
          <label class="label">Обложка (изображение)</label>
          <div class="imgbox" :class="{ empty: !form.img }">
            <img v-if="form.img" :src="form.img" alt="" />
            <span v-else>Нет изображения</span>
          </div>
          <input type="file" accept=".png,.jpg,.jpeg,.webp,.gif,.svg" @change="onPick" />
          <p class="hint">Поддерживаются: png, jpg, webp, gif, svg. До 10 МБ.</p>
        </div>
      </div>

      <div class="actions">
        <button class="btn" :disabled="busy">{{ isNew ? 'Создать' : 'Сохранить' }}</button>
        <span v-if="err" class="err">{{ err }}</span>
      </div>
    </form>
  </section>
</template>


<style scoped>
.wrap{ width:100%; display:grid; place-items:center; }
.card{ width:min(1100px,96vw); background:#14182b; border:1px solid #2a2f3a; border-radius:16px; padding:20px; color:#e7eaf3; }
.topbar{ display:flex; align-items:center; gap:10px; margin-bottom:12px; }
.back{ display:inline-flex; align-items:center; gap:8px; height:36px; padding:0 12px; border:1px solid #2a2f3a; border-radius:10px; background:#151b30; color:#e7eaf3; text-decoration:none; }
.back svg{ width:18px; height:18px; fill:currentColor; transform:translateX(-2px); }
.title{ margin-left:auto; margin-right:auto; font:700 20px/1 system-ui; }

.grid{ display:grid; grid-template-columns: 1fr; gap:16px; }
@media (min-width: 980px){ .grid{ grid-template-columns: 2fr 1fr; } }

.label{ display:block; margin:10px 0 6px; color:#9aa3b2; font-size:13px; }
.inp{ width:100%; border:1px solid #2a2f3a; background:#0f1220; color:#e7eaf3; border-radius:12px; padding:10px 12px; font-size:15px; }
.row{ display:grid; gap:10px; grid-template-columns: 1fr; }
.row .col{ display:flex; flex-direction:column; }
@media (min-width: 720px){ .row{ grid-template-columns: 1fr 1fr; } }
@media (min-width: 980px){ .row{ grid-template-columns: 1fr 1fr 1fr; } }

.imgbox{ width:100%; aspect-ratio: 16/9; background:#0f1220; border:1px solid #2a2f3a; border-radius:12px; display:grid; place-items:center; overflow:hidden; }
.imgbox.empty{ color:#7f8696; }
.imgbox img{ width:100%; height:100%; object-fit:cover; }

.switch{ position:relative; display:inline-flex; align-items:center; gap:8px; }
.switch input{ position:absolute; inset:0; opacity:0; }
.switch span{
  width:44px; height:28px; border-radius:999px; background:#0f1220; border:1px solid #2a2f3a; display:inline-block; position:relative;
}
.switch span::after{
  content:''; position:absolute; top:3px; left:3px; width:20px; height:20px; border-radius:50%; background:#e7eaf3; transition: transform .15s;
}
.switch input:checked + span{ background:#2f6bff; border-color:#2f6bff; }
.switch input:checked + span::after{ transform: translateX(16px); }

.actions{ display:flex; gap:10px; align-items:center; margin-top:14px; }
.btn{ height:44px; padding:0 16px; border-radius:12px; border:1px solid transparent; background:#2f6bff; color:#fff; font-weight:600; }
.err{ color:#f87171; }

.offers{ display:grid; gap:12px; }
.offer{
  border:1px solid #2a2f3a; background:#0f1220; border-radius:12px; padding:12px;
}
.offer-head{ display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
.offer-idx{ color:#9aa3b2; font:600 13px/1 system-ui; }
.sublabel{ display:block; margin:8px 0 6px; color:#9aa3b2; font-size:13px; }

.mini{
  height:32px; padding:0 10px; border-radius:10px; border:1px solid #2a2f3a; background:#151b30; color:#e7eaf3;
}
.mini.danger{ border-color:#3b2330; background:#2a141b; color:#ffd3db; }
</style>
