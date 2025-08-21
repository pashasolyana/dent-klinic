<template>
  <section class="wrap">
    <form v-if="hero" class="card" @submit.prevent="save">
      <div class="topbar">
        <NuxtLink class="back" to="/admin">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>
          <span>Назад</span>
        </NuxtLink>
      </div>

      <h1 class="title">Врачи</h1>

      <label class="label">Заголовок</label>
      <input v-model="hero.title" class="inp" required maxlength="120" />

      <label class="label">Подзаголовок</label>
      <textarea v-model="hero.subtitle" class="inp" rows="6" maxlength="800"
                placeholder="Коротко о блоке «Врачи»"></textarea>

      <div class="row2">
        <div>
          <label class="label">Кнопка — текст</label>
          <input v-model="hero.ctaText" class="inp" maxlength="60" :disabled="!hero.showCta" />
        </div>
        <div>
          <label class="label">Кнопка — ссылка</label>
          <input v-model="hero.ctaHref" class="inp" maxlength="300" :disabled="!hero.showCta" />
        </div>
      </div>

      <div class="row2">
        <label class="label check">
          <input type="checkbox" v-model="hero.showCta" />
          <span>Показывать кнопку</span>
        </label>
      </div>

      <div class="row">
        <button class="btn" :disabled="busy">Сохранить</button>
        <span v-if="err" class="err">{{ err }}</span>
        <span v-else-if="hero.updatedAt" class="hint">
          Обновлено: {{ new Date(hero.updatedAt).toLocaleString() }}
        </span>
      </div>
    </form>

    <div v-else class="card">Загрузка…</div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['auth'] })

const hero = ref<any | null>(null)
const busy = ref(false)
const err = ref('')

onMounted(async () => {
  hero.value = await $fetch<any>('/api/admin/doctors-hero')
})

async function save() {
  if (!hero.value) return
  busy.value = true; err.value = ''
  try {
    const res: any = await $fetch('/api/admin/doctors-hero', {
      method: 'PUT',
      body: hero.value,
      credentials: 'include',
    })
    // распаковываем, если сервер вернул { ok, data }
    hero.value = (res && typeof res === 'object' && 'data' in res) ? res.data : res
  } catch (e: any) {
    err.value = e?.data?.message || 'Ошибка сохранения'
  } finally {
    busy.value = false
  }
}
</script>

<style scoped>
.wrap{ width:100%; display:grid; place-items:center; }
.card{ width:min(760px,92vw); background:#14182b; border:1px solid #2a2f3a; border-radius:16px; padding:24px; color:#e7eaf3; }
.topbar{ display:flex; margin:0 0 8px; }
.back{ display:inline-flex; align-items:center; gap:8px; height:36px; padding:0 12px; border:1px solid #2a2f3a; border-radius:10px; background:#151b30; color:#e7eaf3; }
.back svg{ width:18px; height:18px; fill:currentColor; transform:translateX(-2px); }
.title{ margin:6px 0 12px; font:700 22px/1.2 system-ui; text-align:center; }

.label{ display:block; margin:10px 0 6px; color:#9aa3b2; font-size:13px; }
.inp{ width:100%; border:1px solid #2a2f3a; background:#0f1220; color:#e7eaf3; border-radius:12px; padding:10px 12px; font-size:15px; }

.row{ display:flex; gap:10px; align-items:center; margin-top:14px; flex-wrap:wrap; }
.row2{ display:grid; gap:10px; grid-template-columns: 1fr; }
@media (min-width: 640px){ .row2{ grid-template-columns: 1fr 1fr; } }

.check{ display:flex; align-items:center; gap:10px; padding-top:28px; }
.check input{ width:16px; height:16px; }

.btn{ height:44px; padding:0 16px; border-radius:12px; border:1px solid transparent; background:#2f6bff; color:#fff; font-weight:600; }
.err{ color:#f87171; }
.hint{ color:#9aa3b2; font-size:12px; }
</style>
