<script setup>
definePageMeta({ layout: 'admin', middleware: ['auth'] })

const cfg = ref(null)
const busy = ref(false)
const err = ref('')

async function load() {
  cfg.value = await $fetch('/api/admin/contacts')
}
onMounted(load)

async function save() {
  if (!cfg.value) return
  busy.value = true; err.value = ''
  try {
    cfg.value = await $fetch('/api/admin/contacts', {
      method: 'PUT', credentials: 'include', body: cfg.value
    })
  } catch (e) {
    err.value = e?.data?.message || 'Ошибка сохранения'
  } finally { busy.value = false }
}

async function onPickBg(e) {
  const file = e.target.files?.[0]; e.target.value = ''
  if (!file) return
  const fd = new FormData(); fd.append('file', file)
  busy.value = true; err.value = ''
  try {
    const res = await $fetch('/api/upload', { method:'POST', body: fd, credentials:'include' })
    cfg.value.bgSrc = res?.files?.[0]?.url || cfg.value.bgSrc
  } catch (e) {
    err.value = e?.data?.message || 'Не удалось загрузить файл'
  } finally { busy.value = false }
}
</script>

<template>
  <section class="wrap">
    <div class="topbar">
      <NuxtLink class="back" to="/admin">← Назад</NuxtLink>
      <h1 class="title">Контакты</h1>
    </div>

    <div v-if="!cfg" class="card"><p>Загрузка…</p></div>

    <form v-else class="card" @submit.prevent="save">
      <h2 class="subtitle">Основное</h2>
      <label class="label">Телефон (как показывать)</label>
      <input v-model="cfg.phone" class="inp" placeholder="+7 (499) 125-53-08" />

      <div class="row2">
        <div>
          <label class="label">Ссылка Telegram</label>
          <input v-model="cfg.social.telegramUrl" class="inp" placeholder="https://t.me/..." />
        </div>
        <div>
          <label class="label">Ссылка WhatsApp</label>
          <input v-model="cfg.social.whatsappUrl" class="inp" placeholder="https://wa.me/..." />
        </div>
      </div>

      <div class="row2">
        <div>
          <label class="label">Время работы</label>
          <input v-model="cfg.schedule" class="inp" placeholder="с 10:00 до 20:00" />
        </div>
        <div>
          <label class="label">Адрес</label>
          <input v-model="cfg.address" class="inp" placeholder="Москва, ул. ..." />
        </div>
      </div>

      <div class="row2">
        <div>
          <label class="label">CTA — подпись кнопки</label>
          <input v-model="cfg.ctaLabel" class="inp" placeholder="Оставить заявку" />
        </div>
        <div>
          <label class="label">CTA — ссылка</label>
          <input v-model="cfg.ctaHref" class="inp" placeholder="#form" />
        </div>
      </div>

      <label class="label">Карта (URL виджета Яндекс)</label>
      <input v-model="cfg.mapEmbed" class="inp"
             placeholder="https://yandex.ru/map-widget/v1/?um=constructor%3A...&source=constructor" />

      <div class="row2">
        <div>
          <label class="label">Фон секции</label>
          <div class="bg">
            <img :src="cfg.bgSrc || '/images/contacts.png'" alt="" />
          </div>
        </div>
        <div class="col">
          <label class="label">Заменить фон</label>
          <input type="file" accept=".png,.jpg,.jpeg,.webp" @change="onPickBg" />
          <p class="hint">Рекомендуется ~1600×900, WEBP/PNG.</p>
        </div>
      </div>

      <div class="actions">
        <button class="btn" :disabled="busy">Сохранить</button>
        <span v-if="err" class="err">{{ err }}</span>
        <span v-else class="hint">Обновлено: {{ new Date(cfg.updatedAt).toLocaleString() }}</span>
      </div>
    </form>
  </section>
</template>

<style scoped>
.wrap{ width:min(900px,94vw); margin:0 auto; color:#e7eaf3; }
.topbar{ display:flex; align-items:center; gap:10px; margin:8px 0 12px; }
.back{ color:#9aa3b2; text-decoration:none; border:1px solid #2a2f3a; border-radius:10px; padding:6px 10px; background:#151b30; }
.title{ margin:0 auto; font:700 20px/1.2 system-ui; }
.card{ background:#14182b; border:1px solid #2a2f3a; border-radius:16px; padding:16px; }
.subtitle{ margin:0 0 10px; font:700 16px/1.2 system-ui; }
.label{ display:block; margin:12px 0 6px; color:#9aa3b2; font:500 13px/1.2 system-ui; }
.inp{ width:100%; height:44px; border:1px solid #2a2f3a; border-radius:10px; background:#0f1220; color:#e7eaf3; padding:0 12px; }
.row2{ display:grid; grid-template-columns: 1fr 1fr; gap:12px; }
@media (max-width:720px){ .row2{ grid-template-columns:1fr; } }
.bg{ width:100%; max-width:360px; aspect-ratio:16/9; border:1px solid #2a2f3a; border-radius:12px; background:#0b0f1e; display:grid; place-items:center; overflow:hidden; }
.bg img{ width:100%; height:100%; object-fit:cover; }
.col{ display:flex; flex-direction:column; gap:8px; align-self:end; }
.actions{ display:flex; gap:10px; align-items:center; margin-top:14px; flex-wrap:wrap; }
.btn{ background:#2f6bff; color:#fff; border:0; border-radius:10px; padding:10px 14px; font-weight:700; }
.err{ color:#f87171; }
.hint{ color:#9aa3b2; font-size:12px; }
</style>
