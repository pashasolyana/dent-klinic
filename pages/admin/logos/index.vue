<script setup>
definePageMeta({ layout: 'admin', middleware: ['auth'] })

import useLogos from '~/composables/useLogos'
const { logos, refresh } = useLogos()

const busy = ref(false)
const err = ref('')

// сортировка
function up(i){ if (!logos.value || i<=0) return; const a=logos.value[i-1]; logos.value[i-1]=logos.value[i]; logos.value[i]=a }
function down(i){ if (!logos.value || i>=logos.value.length-1) return; const a=logos.value[i+1]; logos.value[i+1]=logos.value[i]; logos.value[i]=a }

async function saveOrder(){
  if (!logos.value?.length) return
  busy.value=true; err.value=''
  try{
    await $fetch('/api/admin/logos/reorder', { method:'PUT', credentials:'include', body:{ order: logos.value.map(x=>x.id) } })
    await refresh()
  }catch(e){ err.value = e?.data?.message || 'Ошибка сохранения порядка' }
  finally{ busy.value=false }
}

// редактирование
async function saveItem(row){
  busy.value=true; err.value=''
  try{
    await $fetch(`/api/admin/logos/${row.id}`, { method:'PUT', credentials:'include', body:{ src: row.src, alt: row.alt, href: row.href } })
  }catch(e){ err.value = e?.data?.message || 'Ошибка сохранения' }
  finally{ busy.value=false }
}

async function removeItem(id){
  if (!confirm('Удалить логотип?')) return
  busy.value=true; err.value=''
  try{
    await $fetch(`/api/admin/logos/${id}`, { method:'DELETE', credentials:'include' })
    await refresh()
  }catch(e){ err.value = e?.data?.message || 'Ошибка удаления' }
  finally{ busy.value=false }
}

// загрузка файла для существующего
async function onPick(row, e){
  const file = e.target.files?.[0]; e.target.value=''
  if (!file) return
  const fd = new FormData(); fd.append('file', file)
  busy.value=true; err.value=''
  try{
    const res = await $fetch('/api/upload', { method:'POST', body: fd, credentials:'include' })
    row.src = res?.files?.[0]?.url || row.src
  }catch(e){ err.value = e?.data?.message || 'Не удалось загрузить файл' }
  finally{ busy.value=false }
}

// создание нового
const createForm = reactive({ src:'', alt:'', href:'' })
async function onPickNew(e){
  const file = e.target.files?.[0]; e.target.value=''
  if (!file) return
  const fd = new FormData(); fd.append('file', file)
  try{
    const res = await $fetch('/api/upload', { method:'POST', body: fd, credentials:'include' })
    createForm.src = res?.files?.[0]?.url || ''
  }catch{}
}
async function createItem(){
  if (!createForm.src) { alert('Выберите изображение'); return }
  busy.value=true; err.value=''
  try{
    await $fetch('/api/admin/logos', { method:'POST', credentials:'include', body: createForm })
    Object.assign(createForm, { src:'', alt:'', href:'' })
    await refresh()
  }catch(e){ err.value = e?.data?.message || 'Ошибка создания' }
  finally{ busy.value=false }
}
</script>

<template>
  <section class="wrap">
    <div class="topbar">
      <NuxtLink class="back" to="/admin">
        <svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>
        <span>Назад</span>
      </NuxtLink>
      <h1 class="title">Логотипы (бегущая строка)</h1>
    </div>

    <div class="card">
      <ul v-if="logos?.length" class="list">
        <li v-for="(row,i) in logos" :key="row.id" class="item">
          <img :src="row.src" alt="" class="thumb" />
          <div class="grow">
            <label>ALT</label>
            <input v-model="row.alt" class="inp" placeholder="Подпись (ALT)" />
            <label>Ссылка (необязательно)</label>
            <input v-model="row.href" class="inp" placeholder="https://..." />
          </div>
          <div class="actions">
            <input type="file" accept=".png,.jpg,.jpeg,.webp,.svg" @change="onPick(row, $event)" title="Заменить изображение" />
            <button @click="up(i)" :disabled="i===0">↑</button>
            <button @click="down(i)" :disabled="i===logos.length-1">↓</button>
            <button class="save" @click="saveItem(row)">Сохранить</button>
            <button class="del" @click="removeItem(row.id)">Удалить</button>
          </div>
        </li>
      </ul>
      <p v-else class="muted">Пока нет логотипов.</p>

      <div class="row">
        <button class="btn" :disabled="busy || !logos?.length" @click="saveOrder">Сохранить порядок</button>
        <span v-if="err" class="err">{{ err }}</span>
      </div>
    </div>

    <div class="card">
      <h2 class="subtitle">Добавить логотип</h2>
      <div class="new">
        <div class="preview">
          <img v-if="createForm.src" :src="createForm.src" alt="" />
          <span v-else>Нет изображения</span>
        </div>
        <div class="fields">
          <label>Изображение</label>
          <input type="file" accept=".png,.jpg,.jpeg,.webp,.svg" @change="onPickNew" />
          <label>ALT</label>
          <input v-model="createForm.alt" class="inp" />
          <label>Ссылка (необязательно)</label>
          <input v-model="createForm.href" class="inp" placeholder="https://..." />
        </div>
        <div class="col-actions">
          <button class="btn" :disabled="busy" @click="createItem">Создать</button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.wrap{ width:min(1100px,96vw); margin:0 auto; color:#e7eaf3; }
.topbar{ display:flex; align-items:center; gap:10px; margin: 8px 0 12px; }
.back{ display:inline-flex; align-items:center; gap:8px; height:36px; padding:0 12px; border:1px solid #2a2f3a; border-radius:10px; background:#151b30; color:#e7eaf3; text-decoration:none; }
.back svg{ width:18px; height:18px; fill:currentColor; transform:translateX(-2px); }
.title{ margin-left:auto; margin-right:auto; font:700 20px/1 system-ui; }

.card{ background:#14182b; border:1px solid #2a2f3a; border-radius:16px; padding:16px; margin-bottom:14px; }
.muted{ color:#9aa3b2; }

.list{ list-style:none; padding:0; margin:0; display:grid; gap:10px; }
.item{ display:grid; grid-template-columns: 160px 1fr auto; gap:12px; align-items:center; background:#0f1220; border:1px solid #2a2f3a; border-radius:12px; padding:10px; }
.thumb{ width:160px; height:90px; object-fit:contain; background:#0b0f1e; border-radius:8px; }

.grow{ display:grid; grid-template-columns: 1fr; gap:6px; }
label{ color:#9aa3b2; font-size:12px; }
.inp{ width:100%; border:1px solid #2a2f3a; background:#0b0f1e; color:#e7eaf3; border-radius:10px; padding:8px 10px; font-size:14px; }

.actions{ display:flex; gap:8px; align-items:center; }
.actions input[type="file"]{ max-width:210px; }
.actions button{ border:1px solid #2a2f3a; background:#151b30; color:#e7eaf3; padding:6px 10px; border-radius:8px; cursor:pointer; }
.actions button:disabled{ opacity:.6; cursor:default; }
.actions .save{ background:#2f6bff; border-color:#2f6bff; }
.actions .del{ border-color:#4e2a2a; }

.row{ display:flex; gap:10px; align-items:center; margin-top:12px; }
.btn{ border:1px solid transparent; background:#2f6bff; color:#fff; padding:10px 14px; border-radius:10px; }
.err{ color:#f87171; }

/* Новый */
.subtitle{ margin:0 0 10px; font:700 16px/1.2 system-ui; }
.new{ display:grid; grid-template-columns: 200px 1fr auto; gap:14px; align-items:start; }
.preview{ width:200px; height:112px; background:#0b0f1e; border:1px solid #2a2f3a; border-radius:10px; display:grid; place-items:center; }
.preview img{ max-width:100%; max-height:100%; object-fit:contain; }
.col-actions{ display:flex; align-items:center; }
</style>
