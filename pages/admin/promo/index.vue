<script setup>
import usePromo from '~/composables/usePromo'

definePageMeta({ layout: 'admin' , middleware: ['auth'] })

const { promo, refresh } =usePromo()
const busy = ref(false)
const err = ref('')

function up(i){
  if (!promo.value || i<=0) return
  const a = promo.value[i-1]; promo.value[i-1] = promo.value[i]; promo.value[i] = a
}
function down(i){
  if (!promo.value || i>=promo.value.length-1) return
  const a = promo.value[i+1]; promo.value[i+1] = promo.value[i]; promo.value[i] = a
}

async function saveOrder(){
  if (!promo.value) return
  busy.value = true; err.value=''
  try{
    const order = promo.value.map(s=>s.id)
    await $fetch('/api/admin/promo/reorder', { method:'PUT', body:{ order }, credentials:'include' })
    await refresh()
  }catch(e){ err.value = e?.data?.message || 'Ошибка сохранения порядка' }
  finally{ busy.value = false }
}

async function remove(id){
  if (!confirm('Удалить слайд?')) return
  busy.value = true; err.value=''
  try{
    await $fetch(`/api/admin/promo/${id}`, { method:'DELETE', credentials:'include' })
    await refresh()
  }catch(e){ err.value = e?.data?.message || 'Ошибка удаления' }
  finally{ busy.value = false }
}
</script>

<template>
  <section class="wrap">
    <div class="stack">
      <div class="topbar">
        <NuxtLink class="back" to="/admin">
          <svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>
          <span>Назад</span>
        </NuxtLink>
        <NuxtLink class="new" to="/admin/promo/new">+ Новый слайд</NuxtLink>
      </div>

      <div v-if="!promo?.length" class="card">Пока нет слайдов. Создайте первый.</div>

      <ul v-else class="list">
        <li v-for="(s,i) in promo" :key="s.id" class="item">
          <img :src="s.img" alt="" class="thumb" />
          <div class="meta">
            <div class="title">{{ s.title }}</div>
            <div class="sub">
              <span v-if="s.discount" class="badge">Скидка: {{ s.discount }}</span>
              <span v-if="s.free" class="badge">Бесплатно</span>
              <span v-else-if="s.price?.new" class="badge">Цена: {{ s.price.new }}</span>
            </div>
          </div>
          <div class="actions">
            <button @click="up(i)" :disabled="i===0">↑</button>
            <button @click="down(i)" :disabled="i===promo.length-1">↓</button>
            <NuxtLink class="edit" :to="`/admin/promo/${s.id}`">Редактировать</NuxtLink>
            <button class="del" @click="remove(s.id)">Удалить</button>
          </div>
        </li>
      </ul>

      <div class="row">
        <button class="btn" :disabled="busy || !promo?.length" @click="saveOrder">Сохранить порядок</button>
        <span v-if="err" class="err">{{ err }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.wrap{ width:100%; display:grid; place-items:center; }
.stack{ width:min(1100px,96vw); color:#e7eaf3; }
.topbar{ display:flex; gap:10px; align-items:center; margin:0 0 12px; }
.back{ display:inline-flex; align-items:center; gap:8px; height:36px; padding:0 12px; border:1px solid #2a2f3a; border-radius:10px; background:#151b30; color:#e7eaf3; }
.back svg{ width:18px; height:18px; fill:currentColor; transform:translateX(-2px); }
.new{ margin-left:auto; display:inline-flex; align-items:center; height:36px; padding:0 12px; border-radius:10px; background:#2f6bff; color:#fff; }
.card{ background:#14182b; border:1px solid #2a2f3a; border-radius:16px; padding:20px; }

.list{ list-style:none; padding:0; margin:0; display:grid; gap:10px; }
.item{ display:grid; grid-template-columns: 120px 1fr auto; gap:12px; align-items:center; background:#14182b; border:1px solid #2a2f3a; border-radius:12px; padding:10px; }
.thumb{ width:120px; height:72px; object-fit:cover; border-radius:8px; background:#0f1220; }
.meta .title{ font-weight:700; margin-bottom:4px; }
.sub{ display:flex; gap:10px; flex-wrap:wrap; color:#9aa3b2; }
.badge{ border:1px solid #2a2f3a; padding:2px 8px; border-radius:999px; font-size:12px; }
.actions{ display:flex; gap:8px; align-items:center; }
.actions button,.edit,.del{ border:1px solid #2a2f3a; background:#151b30; color:#e7eaf3; padding:6px 10px; border-radius:8px; }
.edit{ text-decoration:none; }
.del{ border-color:#4e2a2a; }
.row{ display:flex; gap:10px; align-items:center; margin-top:12px; }
.btn{ border:1px solid transparent; background:#2f6bff; color:#fff; padding:10px 14px; border-radius:10px; }
.err{ color:#f87171; }
</style>
