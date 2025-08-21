<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['auth'] })

type HeaderConfig = {
  social: { whatsappUrl: string; telegramUrl: string }
  updatedAt: string
}

const cfg = ref<HeaderConfig | null>(null)
const busy = ref(false)
const err = ref('')
const router = useRouter()

async function load () {
  cfg.value = await $fetch<HeaderConfig>('/api/admin/header')
}

async function save () {
  if (!cfg.value) return
  busy.value = true; err.value = ''
  try {
    cfg.value = await $fetch<HeaderConfig>('/api/admin/header', {
      method: 'PUT',
      body: cfg.value,
      credentials: 'include'
    })
  } catch (e: any) {
    err.value = e?.data?.message || 'Ошибка сохранения'
  } finally { busy.value = false }
}

function goBack () {
  // можно router.back(), но надёжнее явно в /admin
  router.push('/admin')
}

onMounted(load)
</script>

<template>
  <section class="wrap">
    <div v-if="!cfg" class="card"><p>Загрузка…</p></div>

    <form v-else class="card" @submit.prevent="save">
      <div class="topbar">
        <button type="button" class="back" @click="goBack" aria-label="Назад">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>
          <span>Назад</span>
        </button>
      </div>

      <h1 class="title">Хедер — социальные ссылки</h1>
      <p class="subtitle">Редактируйте ссылки для иконок WhatsApp и Telegram в шапке.</p>

      <label class="label">WhatsApp URL (домен: wa.me)</label>
      <input v-model="cfg.social.whatsappUrl" class="inp" placeholder="https://wa.me/79777876837" />

      <label class="label">Telegram URL (домен: t.me)</label>
      <input v-model="cfg.social.telegramUrl" class="inp" placeholder="https://t.me/+79777876837" />

      <div class="row">
        <button class="btn" :disabled="busy">Сохранить</button>
        <span v-if="err" class="err">{{ err }}</span>
        <span v-else class="hint">Обновлено: {{ new Date(cfg.updatedAt).toLocaleString() }}</span>
      </div>
    </form>
  </section>
</template>

<style scoped>
.wrap{ width:100%; display:grid; place-items:center; }
.card{
  width:min(680px,92vw); background:#14182b; border:1px solid #2a2f3a;
  border-radius:16px; padding:24px; box-shadow:0 10px 30px rgba(0,0,0,.25);
  color:#e7eaf3;
}

/* верхняя полоска с Назад */
.topbar{
  display:flex; align-items:center; justify-content:flex-start; margin-bottom:8px;
}
.back{
  display:inline-flex; align-items:center; gap:8px;
  height:36px; padding:0 12px;
  border:1px solid #2a2f3a; border-radius:10px;
  background:#151b30; color:#e7eaf3; cursor:pointer;
}
.back:hover{ border-color:#3a4460; }
.back svg{ width:18px; height:18px; fill:currentColor; transform: translateX(-2px); }

.title{ margin:6px 0 6px; font:700 24px/1.2 system-ui; text-align:center; }
.subtitle{ margin:0 0 18px; font:500 14px/1.4 system-ui; color:#9aa3b2; text-align:center; }
.label{ display:block; margin:14px 0 6px; font:500 13px/1.3 system-ui; color:#9aa3b2; }
.inp{
  width:100%; height:46px; border:1px solid #2a2f3a; border-radius:12px;
  padding:0 14px; background:#0f1220; color:#e7eaf3; font-size:15px;
}
.inp:focus{ outline:none; border-color:#2f6bff; box-shadow:0 0 0 4px rgba(47,107,255,.22); }
.row{ display:flex; gap:10px; align-items:center; margin-top:16px; flex-wrap:wrap; }
.btn{
  height:46px; padding:0 16px; border-radius:12px; border:1px solid transparent;
  background:#2f6bff; color:#fff; font-weight:600; cursor:pointer;
}
.btn:disabled{ opacity:.65; cursor:default; }
.err{ color:#f87171; font-size:14px; }
.hint{ color:#9aa3b2; font-size:12px; }
</style>
