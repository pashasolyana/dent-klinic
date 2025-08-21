<script setup lang="ts">
import SimpleHtmlEditor from '~/components/admin/SimpleHtmlEditor.vue'


definePageMeta({ layout: 'admin' , middleware: ['auth'] })

const sales = ref(null)
const busy = ref(false)
const err = ref('')

onMounted(async () => {
  sales.value = await $fetch('/api/admin/sales')
})

async function save () {
  if (!sales.value) return
  busy.value = true; err.value = ''
  try {
    sales.value = await $fetch('/api/admin/sales', {
      method: 'PUT',
      body: sales.value,
      credentials: 'include'
    })
  } catch (e) {
    err.value = e?.data?.message || 'Ошибка сохранения'
  } finally { busy.value = false }
}
</script>

<template>
  <section class="wrap">
    <form v-if="sales" class="card" @submit.prevent="save">
      <div class="topbar">
        <NuxtLink class="back" to="/admin">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>
          <span>Назад</span>
        </NuxtLink>
      </div>

      <h1 class="title">Акции</h1>

      <label class="label">Заголовок</label>
      <input v-model="sales.title" class="inp" />

      <label class="label">Текст</label>
      <SimpleHtmlEditor v-model="sales.textHtml" placeholder="Введите текст акции…" />

      <div class="row">
        <button class="btn" :disabled="busy">Сохранить</button>
        <span v-if="err" class="err">{{ err }}</span>
        <span v-else class="hint">Обновлено: {{ new Date(sales.updatedAt).toLocaleString() }}</span>
      </div>
    </form>

    <div v-else class="card">Загрузка…</div>
  </section>
</template>

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
.btn{ height:44px; padding:0 16px; border-radius:12px; border:1px solid transparent; background:#2f6bff; color:#fff; font-weight:600; }
.err{ color:#f87171; }
.hint{ color:#9aa3b2; font-size:12px; }
</style>
