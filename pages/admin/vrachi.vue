<script setup>
definePageMeta({ layout: 'admin', middleware: ['auth'] })

const list = ref([])
const draft = ref(null)       // текущая запись для формы (null = форма скрыта)
const busy = ref(false)
const err = ref('')

async function load () {
  list.value = await $fetch('/api/admin/doctors', { credentials: 'include' })
}
onMounted(load)

function newItem () {
  draft.value = {
    id: null,
    name: '',
    position: '',
    description: '',
    photo: '',
    order: (list.value?.[list.value.length - 1]?.order ?? 0) + 10,
    visible: true,
    updatedAt: new Date().toISOString()
  }
}
function editItem (row) {
  draft.value = JSON.parse(JSON.stringify(row))
}
function cancelEdit () {
  draft.value = null
}

async function save () {
  if (!draft.value) return
  busy.value = true; err.value = ''
  try {
    if (draft.value.id) {
      const res = await $fetch(`/api/admin/doctors?id=${draft.value.id}`, {
        method: 'PUT', credentials: 'include', body: draft.value
      })
      draft.value = res.data
    } else {
      const res = await $fetch('/api/admin/doctors', {
        method: 'POST', credentials: 'include', body: draft.value
      })
      draft.value = res.data
    }
    await load()
    draft.value = null
  } catch (e) {
    err.value = e?.data?.message || 'Ошибка сохранения'
  } finally { busy.value = false }
}

async function removeItem (id) {
  if (!id || !confirm('Удалить врача?')) return
  busy.value = true; err.value = ''
  try {
    await $fetch(`/api/admin/doctors?id=${id}`, { method: 'DELETE', credentials: 'include' })
    await load()
  } catch (e) {
    err.value = e?.data?.message || 'Ошибка удаления'
  } finally { busy.value = false }
}

async function onPickPhoto (e) {
  const file = e.target.files?.[0]; e.target.value = ''
  if (!file || !draft.value) return
  const fd = new FormData(); fd.append('file', file)
  busy.value = true; err.value = ''
  try {
    const res = await $fetch('/api/upload', { method: 'POST', body: fd, credentials: 'include' })
    draft.value.photo = res?.files?.[0]?.url || draft.value.photo
  } catch (e) {
    err.value = e?.data?.message || 'Не удалось загрузить файл'
  } finally { busy.value = false }
}
</script>

<template>
  <section class="wrap">
    <div class="topbar">
      <NuxtLink class="back" to="/admin">← Назад</NuxtLink>
      <h1 class="title">Врачи</h1>
      <button class="btn" style="margin-left:auto" @click="newItem">Добавить врача</button>
    </div>

    <!-- Список -->
    <div class="card">
      <div class="thead">
        <div>Фото</div>
        <div>Имя</div>
        <div>Должность</div>
        <div>Порядок</div>
        <div>Видим</div>
        <div></div>
      </div>
      <div v-for="row in list" :key="row.id" class="row">
        <div><img :src="row.photo" alt="" class="ph"></div>
        <div class="nowrap">{{ row.name }}</div>
        <div class="muted nowrap">{{ row.position }}</div>
        <div>{{ row.order ?? '' }}</div>
        <div>{{ row.visible ? 'Да' : 'Нет' }}</div>
        <div class="actions">
          <button class="btn ghost" @click="editItem(row)">Править</button>
          <button class="btn danger" @click="removeItem(row.id)">Удалить</button>
        </div>
      </div>
      <p v-if="!list?.length" class="muted" style="margin-top:8px">Пока пусто</p>
    </div>

    <!-- Форма -->
    <form v-if="draft" class="card" @submit.prevent="save">
      <h2 class="subtitle">{{ draft.id ? 'Правка' : 'Добавление' }}</h2>

      <label class="label">Имя</label>
      <input v-model="draft.name" class="inp" placeholder="ФИО" required />

      <div class="row2">
        <div>
          <label class="label">Должность</label>
          <input v-model="draft.position" class="inp" placeholder="Стоматолог‑ортопед" />
        </div>
        <div>
          <label class="label">Порядок (число)</label>
          <input v-model.number="draft.order" class="inp" type="number" min="0" step="1" />
        </div>
      </div>

      <label class="label">Описание</label>
      <textarea v-model="draft.description" class="inp" rows="6" placeholder="Короткое био"></textarea>

      <div class="row2">
        <div>
          <label class="label">Фото</label>
          <div class="bg">
            <img :src="draft.photo || '/images/placeholder-doctor.jpg'" alt="" />
          </div>
        </div>
        <div class="col">
          <label class="label">Заменить фото</label>
          <input type="file" accept=".png,.jpg,.jpeg,.webp" @change="onPickPhoto" />
          <input v-model="draft.photo" class="inp" placeholder="или вставьте URL" />
          <label class="label chk">
            <input type="checkbox" v-model="draft.visible" />
            <span>Показывать на сайте</span>
          </label>
        </div>
      </div>

      <div class="actions">
        <button class="btn" :disabled="busy">Сохранить</button>
        <button class="btn ghost" type="button" @click="cancelEdit">Отмена</button>
        <span v-if="err" class="err">{{ err }}</span>
        <span v-else class="hint">Обновлено: {{ new Date(draft.updatedAt || Date.now()).toLocaleString() }}</span>
      </div>
    </form>
  </section>
</template>

<style scoped>
/* базовые стили как на странице contacts */
.wrap{ width:min(1000px,94vw); margin:0 auto; color:#e7eaf3; }
.topbar{ display:flex; align-items:center; gap:10px; margin:8px 0 12px; }
.back{ color:#9aa3b2; text-decoration:none; border:1px solid #2a2f3a; border-radius:10px; padding:6px 10px; background:#151b30; }
.title{ margin:0; font:700 20px/1.2 system-ui; }
.card{ background:#14182b; border:1px solid #2a2f3a; border-radius:16px; padding:16px; margin-bottom:12px; }
.subtitle{ margin:0 0 10px; font:700 16px/1.2 system-ui; }

.label{ display:block; margin:12px 0 6px; color:#9aa3b2; font:500 13px/1.2 system-ui; }
.inp{ width:100%; min-height:44px; border:1px solid #2a2f3a; border-radius:10px; background:#0f1220; color:#e7eaf3; padding:10px 12px; }
textarea.inp{ min-height:120px; resize:vertical; }
.row2{ display:grid; grid-template-columns: 1fr 1fr; gap:12px; }
@media (max-width:820px){ .row2{ grid-template-columns:1fr; } }

.bg{ width:100%; max-width:360px; aspect-ratio:3/4; border:1px solid #2a2f3a; border-radius:12px; background:#0b0f1e; display:grid; place-items:center; overflow:hidden; }
.bg img{ width:100%; height:100%; object-fit:cover; }
.col{ display:flex; flex-direction:column; gap:8px; align-self:end; }
.chk{ display:flex; align-items:center; gap:8px; margin-top:8px; }

/* таблица */
.thead, .row{
  display:grid; gap:12px; align-items:center;
  grid-template-columns: 72px 1.2fr 1fr 100px 80px 200px;
}
.thead{ color:#9aa3b2; padding:6px 0; border-bottom:1px solid #2a2f3a; font-size:13px; }
.row{ padding:10px 0; border-bottom:1px dashed #1f2a3d; }
.ph{ width:64px; height:64px; object-fit:cover; border-radius:10px; }
.nowrap{ white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

.actions{ display:flex; gap:8px; justify-content:flex-end; }
.btn{ background:#2f6bff; color:#fff; border:0; border-radius:10px; padding:10px 14px; font-weight:700; cursor:pointer; }
.btn.ghost{ background:transparent; border:1px solid #2a2f3a; color:#cfe1ff; }
.btn.danger{ background:#b00020; }
.err{ color:#f87171; }
.hint{ color:#9aa3b2; font-size:12px; }
</style>
