<template>
  <section class="wrap">
    <div class="card">
      <!-- TOPBAR -->
      <div class="topbar">
        <NuxtLink class="back" to="/admin">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>
          <span>Назад</span>
        </NuxtLink>
        <h1 class="title">Услуги — категории и цены</h1>
      </div>

      <!-- LAYOUT -->
      <div class="pageGrid">
        <!-- ===== LEFT: CATEGORIES ===== -->
        <aside class="side">
          <div class="secHead">
            <h2>Категории</h2>
            <div class="secActions">
              <button class="btn ghost" @click="loadCats" :disabled="busyCats">Обновить</button>
              <button class="btn" @click="openCreateCat()">Новая</button>
            </div>
          </div>

          <div class="panel listPanel">
            <div v-if="busyCats" class="muted">Загрузка категорий…</div>
            <ul v-else class="catList">
              <li
                v-for="(c,i) in categories"
                :key="c.slug"
                class="catItem"
                :class="{active: c.slug===currentSlug}"
              >
                <button class="catMain" @click="pickCat(c.slug)">
                  <span class="dot" :class="{on:c.active}"></span>
                  <span class="catTitle">{{ c.title }}</span>
                  <span class="catSlug">/{{ c.slug }}</span>
                </button>
                <div class="catCtrl">
                  <button class="icon" title="Вверх" @click.stop="reorderCats(i,-1)" :disabled="i===0">▲</button>
                  <button class="icon" title="Вниз"  @click.stop="reorderCats(i,+1)" :disabled="i===categories.length-1">▼</button>
                  <button class="icon danger" title="Удалить" @click.stop="removeCat(c.slug)">✕</button>
                </div>
              </li>
            </ul>
          </div>
        </aside>

        <!-- ===== RIGHT: WORKS ===== -->
        <main class="main">
          <div class="secHead">
            <div class="secHead__titles">
              <h2>Работы / цены</h2>
              <div class="muted" v-if="currentCat">
                Категория: <b>{{ currentCat.title }}</b> (/{{ currentSlug }})
              </div>
            </div>
            <div class="secActions">
              <button class="btn ghost" @click="loadWorks" :disabled="busyWorks || !currentSlug">Обновить</button>
              <button class="btn" @click="openAddWork()" :disabled="!currentSlug">Добавить</button>
            </div>
          </div>

          <div v-if="!currentSlug" class="panel muted">Выберите или создайте категорию слева.</div>

          <!-- CATEGORY EDIT -->
          <form v-if="currentCat" class="panel formGrid" @submit.prevent="saveCat">
            <h3 class="sub spanAll">Параметры категории</h3>

            <label class="field">
              <span class="label">Название</span>
              <input v-model="catForm.title" class="inp" required maxlength="120" />
            </label>

            <label class="field">
              <span class="label">Slug</span>
              <div class="slugBadge">/{{ currentSlug }}</div>
            </label>

            <label class="field">
              <span class="label">Href</span>
              <input v-model="catForm.href" class="inp" />
            </label>

            <label class="field">
              <span class="label">Alt</span>
              <input v-model="catForm.alt" class="inp" />
            </label>

            <label class="field spanAll">
              <span class="label">Картинка (URL)</span>
              <div class="uploadRow uploadGroup">
                <input v-model="catForm.img" class="inp groupInput" />
                <input ref="fileCatEdit" type="file" accept="image/*" hidden @change="onPickCatEdit" />
                <button type="button" class="btn groupBtn" @click="fileCatEdit?.click()">Загрузить</button>
              </div>
            </label>

            <div class="field">
              <span class="label">Активна</span>
              <label class="switch">
                <input type="checkbox" v-model="catForm.active" />
                <span></span>
              </label>
            </div>

            <div class="actions right spanAll">
              <button class="btn" :disabled="busyCats">Сохранить категорию</button>
            </div>
          </form>

          <!-- WORKS TABLE -->
          <div class="panel" v-if="busyWorks">Загрузка работ…</div>
          <div class="panel" v-else-if="works.length">
            <div class="gTable">
              <div class="gHead">
                <span>Название</span>
                <span class="num">Цена</span>
                <span>Примечание</span>
                <span class="act">Действия</span>
              </div>

              <div class="gRow" v-for="(w,i) in works" :key="w.id">
                <div class="cell"><input v-model="w.title" class="inp inp-sm" /></div>
                <div class="cell numCell">
                  <input v-model.number="w.price" class="inp inp-sm inp-num" type="number" min="0" inputmode="numeric" />
                </div>
                <div class="cell"><input v-model="w.note" class="inp inp-sm" /></div>
                <div class="cell actions">
                  <button class="icon" title="Вверх" @click="reorderWorks(i,-1)">▲</button>
                  <button class="icon" title="Вниз" @click="reorderWorks(i,+1)">▼</button>
                  <button class="icon primary" title="Сохранить" @click="saveWork(w)">✓</button>
                  <button class="icon danger" title="Удалить" @click="removeWork(w.id)">✕</button>
                </div>
              </div>
            </div>
          </div>
          <div class="panel muted" v-else-if="currentSlug">Работ пока нет — добавьте первую.</div>

          <div class="actions end">
            <span v-if="err" class="err">{{ err }}</span>
            <span v-else-if="updatedAt" class="hint">Обновлено: {{ updatedAt }}</span>
          </div>
        </main>
      </div>
    </div>

    <!-- ===== MODALS ===== -->
    <!-- Create Category -->
    <div v-if="showCreateCat" class="modal" @keydown.esc="showCreateCat=false">
      <div class="modal__backdrop" @click="showCreateCat=false"></div>
      <div class="modal__dialog" role="dialog" aria-modal="true" aria-label="Создать категорию">
        <h3 class="modal__title">Новая категория</h3>
        <form class="modal__form" @submit.prevent="createCat">
          <div class="formGrid modalGrid">
            <label class="field">
              <span class="label">Название</span>
              <input v-model="newCat.title" class="inp" required maxlength="120" />
              <span class="slugHint">slug: <code>{{ newCat.slug || '—' }}</code></span>
            </label>

            <label class="field">
              <span class="label">Href</span>
              <input v-model="newCat.href" class="inp" placeholder="/uslugi/terapiya" />
            </label>

            <label class="field">
              <span class="label">Alt</span>
              <input v-model="newCat.alt" class="inp" placeholder="Описание изображения" />
            </label>

            <label class="field spanAll">
              <span class="label">Картинка (URL)</span>
              <div class="uploadRow uploadGroup">
                <input v-model="newCat.img" class="inp groupInput" placeholder="/uploads/..." />
                <input ref="fileCat" type="file" accept="image/*" hidden @change="onPickCat" />
                <button type="button" class="btn groupBtn" @click="fileCat?.click()">Загрузить</button>
              </div>
            </label>

            <div class="field">
              <span class="label">Активна</span>
              <label class="switch">
                <input type="checkbox" v-model="newCat.active" />
                <span></span>
              </label>
            </div>

            <div class="actions right spanAll">
              <button type="button" class="btn ghost" @click="showCreateCat=false">Отмена</button>
              <button class="btn" :disabled="busyCats">Создать</button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Add Work -->
    <div v-if="showAddWork" class="modal" @keydown.esc="showAddWork=false">
      <div class="modal__backdrop" @click="showAddWork=false"></div>
      <div class="modal__dialog" role="dialog" aria-modal="true" aria-label="Добавить работу">
        <h3 class="modal__title">Добавить работу</h3>
        <form class="modal__form" @submit.prevent="createWork">
          <div class="formGrid modalGrid">
            <label class="field spanAll">
              <span class="label">Название</span>
              <input v-model="newWork.title" class="inp" required maxlength="200" />
            </label>
            <label class="field">
              <span class="label">Цена</span>
              <input v-model.number="newWork.price" class="inp" type="number" min="0" step="1" inputmode="numeric" />
            </label>
            <label class="field spanAll">
              <span class="label">Примечание</span>
              <input v-model="newWork.note" class="inp" placeholder="напр.: 1 канал" />
            </label>
            <div class="field">
              <span class="label">Активна</span>
              <label class="switch">
                <input type="checkbox" v-model="newWork.active" />
                <span></span>
              </label>
            </div>
            <div class="actions right spanAll">
              <button type="button" class="btn ghost" @click="showAddWork=false">Отмена</button>
              <button class="btn" :disabled="busyWorks">Добавить</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['auth'] })

function slugify(input: string): string {
  const map: Record<string, string> = {
    а:'a', б:'b', в:'v', г:'g', д:'d', е:'e', ё:'e', ж:'zh', з:'z', и:'i', й:'y',
    к:'k', л:'l', м:'m', н:'n', о:'o', п:'p', р:'r', с:'s', т:'t', у:'u', ф:'f',
    х:'h', ц:'c', ч:'ch', ш:'sh', щ:'sch', ъ:'', ы:'y', ь:'', э:'e', ю:'yu', я:'ya'
  }
  return input.toLowerCase().split('').map(ch => map[ch] ?? ch).join('')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

type Cat = { slug: string; title: string; img: string; href: string; alt?: string; order: number; active: boolean }
type Work = { id: string; title: string; price: number; oldPrice?: number | null; note?: string | null; order: number; active: boolean; updatedAt?: string }

const categories = ref<Cat[]>([])
const currentSlug = ref<string | null>(null)
const currentCat = computed<Cat | null>(() => categories.value.find(c => c.slug === currentSlug.value) || null)

const works = ref<Work[]>([])
const busyCats = ref(false)
const busyWorks = ref(false)
const err = ref('')

const updatedAt = computed(() => {
  const last = works.value.reduce<string | null>((acc, w) =>
    !acc || (w.updatedAt && w.updatedAt > acc) ? (w.updatedAt || acc) : acc, null)
  return last ? new Date(last).toLocaleString() : ''
})

const showCreateCat = ref(false)
const showAddWork = ref(false)
function openCreateCat(){ showCreateCat.value = true }
function openAddWork(){ if(currentSlug.value) showAddWork.value = true }

/* LOADERS */
onMounted(async () => { await loadCats() })

async function loadCats() {
  busyCats.value = true; err.value = ''
  try {
    categories.value = await $fetch<Cat[]>('/api/admin/services', { credentials: 'include' })
    if (!currentSlug.value && categories.value.length) currentSlug.value = categories.value[0].slug
  } catch (e:any) { err.value = e?.data?.message || 'Ошибка загрузки категорий' }
  finally { busyCats.value = false; await loadWorks() }
}
watch(currentSlug, () => loadWorks())

async function loadWorks() {
  if (!currentSlug.value) { works.value = []; return }
  busyWorks.value = true; err.value = ''
  try {
    works.value = await $fetch<Work[]>(`/api/admin/services/${currentSlug.value}/works`, { credentials:'include' })
  } catch (e:any) { err.value = e?.data?.message || 'Ошибка загрузки работ' }
  finally { busyWorks.value = false }
}

/* CREATE CAT (modal) */
const newCat = reactive<any>({ title:'', slug:'', href:'', img:'', alt:'', active:true })
watch(() => newCat.title, (t) => { newCat.slug = slugify(t || '') })

async function createCat(){
  busyCats.value = true; err.value = ''
  try{
    const payload:any = { ...newCat }; if (!payload.slug) delete payload.slug
    const created = await $fetch<Cat>('/api/admin/services',{ method:'POST', body:payload, credentials:'include' })
    categories.value.push(created)
    Object.assign(newCat,{ title:'', slug:'', href:'', img:'', alt:'', active:true })
    currentSlug.value = created.slug
    showCreateCat.value = false
  }catch(e:any){ err.value = e?.data?.statusMessage || e?.data?.message || 'Не удалось создать категорию' }
  finally{ busyCats.value = false }
}

/* EDIT CAT */
const catForm = reactive<any>({ slug:'', title:'', img:'', href:'', alt:'', active:true })
watch(currentCat,(c)=>{ if(c) Object.assign(catForm, JSON.parse(JSON.stringify(c))) })

async function saveCat(){
  if(!currentCat.value) return
  busyCats.value = true; err.value = ''
  try{
    const { slug, ...rest } = catForm
    const updated = await $fetch<Cat>(`/api/admin/services/${currentCat.value.slug}`,{ method:'PUT', body:rest, credentials:'include' })
    const i = categories.value.findIndex(x=>x.slug===currentCat.value!.slug)
    if(i>=0) categories.value[i] = updated
  }catch(e:any){ err.value = e?.data?.message || 'Ошибка сохранения категории' }
  finally{ busyCats.value = false }
}

async function removeCat(slug:string){
  if(!confirm('Удалить категорию? Работы не тронем (файл останется).')) return
  busyCats.value = true; err.value=''
  try{
    await $fetch(`/api/admin/services/${slug}`,{ method:'DELETE', credentials:'include' })
    const i = categories.value.findIndex(x=>x.slug===slug)
    if(i>=0) categories.value.splice(i,1)
    if(currentSlug.value===slug) currentSlug.value = categories.value[0]?.slug || null
  }catch(e:any){ err.value = e?.data?.message || 'Ошибка удаления' }
  finally{ busyCats.value=false }
}

async function reorderCats(i:number, dir:number){
  const j = i + dir; if (j<0 || j>=categories.value.length) return
  const arr = categories.value; [arr[i], arr[j]] = [arr[j], arr[i]]
  await $fetch('/api/admin/services/reorder',{ method:'PUT', body:arr.map(x=>x.slug), credentials:'include' })
}

/* WORKS */
const newWork = reactive<any>({ title:'', price:0, note:'', active:true })

async function createWork(){
  if(!currentSlug.value) return
  busyWorks.value = true; err.value=''
  try{
    const payload = { ...newWork, oldPrice: null }
    const created = await $fetch<Work>(`/api/admin/services/${currentSlug.value}/works`,{
      method:'POST', body:payload, credentials:'include'
    })
    works.value.push(created)
    Object.assign(newWork,{ title:'', price:0, note:'', active:true })
    showAddWork.value = false
  }catch(e:any){ err.value = e?.data?.message || 'Не удалось добавить работу' }
  finally{ busyWorks.value=false }
}
async function saveWork(w:Work){
  if(!currentSlug.value) return
  const body = { ...w, oldPrice: null }
  await $fetch<Work>(`/api/admin/services/${currentSlug.value}/works/${w.id}`,{
    method:'PUT', body, credentials:'include'
  })
}
async function removeWork(id:string){
  if(!currentSlug.value) return
  if(!confirm('Удалить работу?')) return
  await $fetch(`/api/admin/services/${currentSlug.value}/works/${id}`,{ method:'DELETE', credentials:'include' })
  works.value = works.value.filter(x=>x.id!==id)
}
async function reorderWorks(i:number, dir:number){
  const j = i + dir; if (j<0 || j>=works.value.length) return
  const arr = works.value; [arr[i], arr[j]] = [arr[j], arr[i]]
  await $fetch(`/api/admin/services/${currentSlug.value}/works/reorder`,{ method:'PUT', body:arr.map(x=>x.id), credentials:'include' })
}

/* uploads */
const fileCat = ref<HTMLInputElement|null>(null)
const fileCatEdit = ref<HTMLInputElement|null>(null)
async function uploadFile(file:File):Promise<string>{
  const fd = new FormData(); fd.append('file', file)
  const res:any = await $fetch('/api/upload',{ method:'POST', body:fd, credentials:'include' })
  return res?.url || ''
}
async function onPickCat(e:Event){ const f=(e.target as HTMLInputElement).files?.[0]; if(!f) return; newCat.img = await uploadFile(f) }
async function onPickCatEdit(e:Event){ const f=(e.target as HTMLInputElement).files?.[0]; if(!f) return; catForm.img = await uploadFile(f) }
function pickCat(slug:string){ currentSlug.value = slug }
</script>

<style scoped>
:host{ --h:40px; --h-sm:32px; --radius:12px; --gap:12px; --w:1520px; }
*,*::before,*::after{ box-sizing:border-box; }

.wrap{ width:100%; padding:16px 0 24px; display:grid; place-items:center; }
.card{ width:min(var(--w),98vw); background:#14182b; border:1px solid #2a2f3a; border-radius:16px; padding:24px; color:#e7eaf3; }

.topbar{ display:flex; align-items:center; gap:10px; margin-bottom:16px; }
.back{ display:inline-flex; align-items:center; gap:8px; height:var(--h); padding:0 12px; border:1px solid #2a2f3a; border-radius:10px; background:#151b30; color:#e7eaf3; text-decoration:none; }
.back svg{ width:18px; height:18px; fill:currentColor; transform:translateX(-2px); }
.title{ flex:1; text-align:center; font:700 20px/1 system-ui; }

/* Layout */
.pageGrid{ display:grid; gap:16px; grid-template-columns:1fr; }
@media (min-width:1080px){ .pageGrid{ grid-template-columns:minmax(290px,360px) minmax(0,1fr); gap:18px; } }
@media (min-width:1400px){ .pageGrid{ grid-template-columns:minmax(320px,400px) minmax(0,1fr); } }
.side,.main{ display:flex; flex-direction:column; gap:12px; }
.main{ min-width:0; }

/* Headers */
.secHead{ display:flex; align-items:end; gap:12px; }
.secHead__titles{ display:flex; flex-direction:column; gap:6px; }
.secActions{ display:flex; gap:8px; margin-left:auto; }

.panel{ background:#0f1220; border:1px solid #2a2f3a; border-radius:12px; padding:16px; min-width:0; }
.sub{ margin:4px 0 10px; color:#bfc7d6; font:600 14px/1.2 system-ui; }
.muted{ color:#9aa3b2; }

/* Form grid */
.formGrid{ display:grid; gap:12px; grid-template-columns:repeat(2,minmax(0,1fr)); align-items:start; }
.formGrid .spanAll{ grid-column:1 / -1; }
@media (max-width:920px){ .formGrid{ grid-template-columns:1fr; } }
.field{ display:flex; flex-direction:column; gap:6px; min-width:0; }
.label{ color:#9aa3b2; font-size:13px; }

/* Inputs */
.inp{ width:100%; height:var(--h); border:1px solid #2a2f3a; background:#0f1220; color:#e7eaf3; border-radius:var(--radius); padding:0 12px; font-size:15px; }
.inp-sm{ height:var(--h-sm); padding:0 10px; font-size:14px; }
input.inp[type="number"]{ text-align:right; appearance:textfield; -moz-appearance:textfield; }
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button{ -webkit-appearance:none; margin:0; }

/* Upload group */
.uploadRow{ display:grid; grid-template-columns:1fr auto; gap:8px; align-items:center; }
.uploadGroup{ align-items:stretch; }
.groupInput{ border-top-right-radius:0; border-bottom-right-radius:0; }
.groupBtn{ height:var(--h); border-top-left-radius:0; border-bottom-left-radius:0; white-space:nowrap; }

.slugHint{ margin-top:4px; color:#8a92a6; font-size:12px; }
.slugHint code{ background:#0b1320; border:1px solid #2a2f3a; padding:2px 6px; border-radius:6px; }
.slugBadge{ display:inline-grid; place-items:center; height:var(--h); padding:0 10px; border-radius:10px; background:#0b1320; border:1px solid #2a2f3a; font-family:ui-monospace,monospace; }

/* Switch */
.switch{ position:relative; display:inline-block; width:44px; height:28px; }
.switch input{ opacity:0; width:0; height:0; position:absolute; }
.switch span{ position:absolute; inset:0; background:#0f1220; border:1px solid #2a2f3a; border-radius:999px; transition:.15s; }
.switch span::after{ content:''; position:absolute; top:3px; left:3px; width:20px; height:20px; background:#e7eaf3; border-radius:50%; transition:.15s; }
.switch input:checked + span{ background:#2f6bff; border-color:#2f6bff; }
.switch input:checked + span::after{ transform:translateX(16px); }

/* Buttons */
.actions{ display:flex; gap:10px; align-items:center; margin-top:6px; }
.actions.right{ justify-content:flex-end; }
.actions.end{ justify-content:flex-end; margin-top:14px; }

.btn{ height:var(--h); padding:0 14px; border-radius:12px; border:1px solid transparent; background:#2f6bff; color:#fff; font-weight:600; }
.btn-xs{ height:var(--h-sm); padding:0 12px; }
.btn.ghost{ background:transparent; border-color:#2a2f3a; }
.btn.danger{ background:#ef4444; }

.icon{ width:32px; height:var(--h-sm); border-radius:10px; border:1px solid #2a2f3a; background:#151b30; color:#e7eaf3; display:inline-grid; place-items:center; }
.icon.primary{ border-color:#254fcf; background:#254fcf; color:#fff; font-weight:700; }
.icon.danger{ border-color:#4b1f28; background:#2b0f16; color:#ff9aa5; }

/* Category list */
.catList{ display:grid; gap:8px; margin:0; padding:0; list-style:none; }
.catItem{ display:grid; grid-template-columns:1fr auto; gap:8px; align-items:center; }
.catMain{ display:grid; grid-template-columns:auto 1fr auto; gap:8px; padding:10px 12px; border-radius:10px; background:#0f1220; color:#e7eaf3; border:1px solid #2a2f3a; min-width:0; }
.catItem.active .catMain{ border-color:#2f6bff; box-shadow:0 0 0 1px #2f6bff inset; }
.catTitle{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-align:left; }
.catSlug{ color:#8a92a6; font-family:ui-monospace,monospace; font-size:12px; }
.catCtrl{ display:grid; grid-auto-flow:column; gap:6px; }
.dot{ width:8px; height:8px; border-radius:999px; background:#5b6475; }
.dot.on{ background:#22c55e; }

@media (min-width:1080px){
  .side .listPanel{ position:sticky; top:12px; max-height:calc(100dvh - 140px); overflow:auto; }
}

/* Works table (compact, no "old price") */
.gTable{
  --col-title:  minmax(260px,1fr);
  --col-price:  clamp(84px,7.5vw,110px);
  --col-note:   minmax(180px,0.9fr);
  --col-actions: clamp(150px,16vw,200px);
  display:grid; gap:10px; overflow-x:auto;
}
@media (min-width:1400px){
  .gTable{ --col-title:minmax(320px,1fr); --col-price:120px; --col-note:minmax(220px,0.9fr); --col-actions:220px; }
}
.gHead,.gRow{
  display:grid;
  grid-template-columns:var(--col-title) var(--col-price) var(--col-note) var(--col-actions);
  gap:10px;
}
.gHead{ padding:0 6px 2px; color:#9aa3b2; font:600 13px/1.2 system-ui; }
.gRow{ align-items:center; background:#0f1220; border:1px solid #2a2f3a; border-radius:10px; padding:6px; }
.cell{ min-width:0; display:flex; align-items:center; }
.numCell{ display:flex; align-items:center; }
.inp-num{ width:9ch; text-align:right; }
.gRow .actions{ display:grid; grid-auto-flow:column; gap:8px; justify-content:end; align-items:center; white-space:nowrap; }

@media (max-width:920px){
  .gHead{ display:none; }
  .gRow{ grid-template-columns:1fr 1fr; grid-auto-rows:auto; gap:8px; }
  .gRow .actions{ grid-column:1 / -1; justify-content:flex-end; }
}

.err{ color:#f87171; }
.hint{ color:#9aa3b2; font-size:12px; }

/* ===== Modals ===== */
.modal{ position:fixed; inset:0; z-index:1000; }
.modal__backdrop{ position:absolute; inset:0; background:rgba(0,0,0,.55); backdrop-filter:saturate(120%) blur(2px); }
.modal__dialog{
  position:absolute; inset:auto; top:50%; left:50%;
  transform:translate(-50%,-50%);
  width:min(720px,92vw); max-height:86vh; overflow:auto;
  background:#0f1220; border:1px solid #2a2f3a; border-radius:16px; padding:16px;
}
.modal__title{ margin:0 0 12px; font:700 18px/1.2 system-ui; }
.modal__form{ display:block; }
.modalGrid{ grid-template-columns:repeat(2,minmax(0,1fr)); }
@media (max-width:720px){ .modalGrid{ grid-template-columns:1fr; } }
</style>
