<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['auth'] })

import { ref, reactive, onMounted, computed } from 'vue'

type Goal = { id: string; text: string }
type AboutClinic = {
  heroTitle: string
  foundationTitle: string
  foundationParagraph1: string
  foundationParagraph2: string
  yearsText: string            // "17 лет"
  goals: Goal[]                // карточки в блоке «Наша цель»
  prioritiesTitle: string
  prioritiesP1: string
  prioritiesP2: string
  whyTitle: string
  whyText: string
  heroYearsCardImage?: string  // опционально — если нужна картинка
  priorityImage?: string       // фото в блоке «Приоритеты»
  goalsBackground?: string     // фон секции «Цели»
  seoTitle?: string
  seoDescription?: string
  updatedAt?: string
}

// ------- state -------
const busy = ref(false)
const err = ref('')
const about = ref<AboutClinic | null>(null)

// ------- api -------
async function load() {
  err.value = ''
  try {
    about.value = await $fetch<AboutClinic>('/api/admin/o-klinike')
  } catch (e:any) {
    err.value = e?.data?.message || 'Не удалось загрузить данные'
  }
}
onMounted(load)

async function save() {
  if (!about.value) return
  busy.value = true; err.value = ''
  try {
    about.value = await $fetch<AboutClinic>('/api/admin/o-klinike', {
      method: 'PUT',
      body: about.value,
      credentials: 'include'
    })
  } catch (e:any) {
    err.value = e?.data?.message || 'Ошибка сохранения'
  } finally { busy.value = false }
}

// ------- goals CRUD -------
function addGoal() {
  if (!about.value) return
  about.value.goals.push({ id: crypto.randomUUID(), text: '' })
}
function delGoal(id: string) {
  if (!about.value) return
  about.value.goals = about.value.goals.filter(g => g.id !== id)
}

// ------- upload helper (progress + preview) -------
type UploadState = { progress: number; uploading: boolean }
const up = reactive<Record<string, UploadState>>({
  priorityImage: { progress: 0, uploading: false },
  goalsBackground: { progress: 0, uploading: false },
  heroYearsCardImage: { progress: 0, uploading: false },
})

type ImgKey = 'priorityImage' | 'goalsBackground' | 'heroYearsCardImage'

async function uploadImage(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)

  const res: any = await $fetch('/api/upload', {
    method: 'POST',
    body: fd,
    credentials: 'include', // важно: сервер требует requireAdmin(cookie)
  })

  const url = res?.files?.[0]?.url
  if (!url) throw new Error('Upload failed: no url in response')
  return url as string
}

async function pickAndUpload(key: ImgKey, e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) { err.value = 'Можно загружать только изображения'; return }

  try {
    up[key].uploading = true
    const url = await uploadImage(file)
    if (about.value) (about.value as any)[key] = url
  } catch (e:any) {
    err.value = e?.message || 'Ошибка загрузки файла'
  } finally {
    up[key].uploading = false
    up[key].progress = 0 // прогресс не считаем в этом варианте
  }
}
</script>

<template>
  <section class="wrap">
    <div class="card">
      <div class="topbar">
        <NuxtLink class="back" to="/admin">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>
          <span>Назад</span>
        </NuxtLink>
        <h1 class="title">О клинике — админ</h1>
        <button class="btn primary ml-auto" :disabled="busy || !about" @click="save">
          {{ busy ? 'Сохраняю...' : 'Сохранить' }}
        </button>
      </div>

      <p v-if="err" class="error">{{ err }}</p>
      <div v-if="!about" class="skeleton">Загрузка...</div>

      <form v-if="about" class="form" @submit.prevent="save">
        <!-- HERO -->
        <fieldset>
          <legend>Hero</legend>
          <div class="grid">
            <label>
              <span>Заголовок (h1)</span>
              <input v-model="about.heroTitle" type="text" placeholder="О клинике" />
            </label>
            <label>
              <span>Текст блока «Основание» (подзаголовок)</span>
              <input v-model="about.foundationTitle" type="text" placeholder="Основание" />
            </label>
          </div>
          <label>
            <span>Абзац 1</span>
            <textarea v-model="about.foundationParagraph1" rows="3" />
          </label>
          <label>
            <span>Абзац 2</span>
            <textarea v-model="about.foundationParagraph2" rows="3" />
          </label>
          <div class="grid">
            <label>
              <span>Текст лет (на карточке):</span>
              <input v-model="about.yearsText" type="text" placeholder="17 лет" />
            </label>
            <div class="upload">
              <span>Картинка карточки лет (необязательно)</span>
              <div class="upload__row">
                <input type="file" accept="image/*" @change="e => pickAndUpload('heroYearsCardImage', e)" />
                <progress v-if="up.heroYearsCardImage.uploading" :value="up.heroYearsCardImage.progress" max="100"/>
              </div>
              <img v-if="about.heroYearsCardImage" :src="about.heroYearsCardImage" alt="" class="preview"/>
            </div>
          </div>
        </fieldset>

        <!-- ЦЕЛИ -->
        <fieldset>
          <legend>Наша цель — карточки</legend>
          <div class="upload">
            <span>Фон секции (большое фото)</span>
            <div class="upload__row">
              <input type="file" accept="image/*" @change="e => pickAndUpload('goalsBackground', e)" />
              <progress v-if="up.goalsBackground.uploading" :value="up.goalsBackground.progress" max="100"/>
            </div>
            <img v-if="about.goalsBackground" :src="about.goalsBackground" alt="" class="preview"/>
          </div>

          <div class="goals">
            <div v-for="g in about.goals" :key="g.id" class="goal">
              <textarea v-model="g.text" rows="2" placeholder="Текст карточки цели" />
              <button type="button" class="btn danger" @click="delGoal(g.id)">Удалить</button>
            </div>
          </div>
          <button type="button" class="btn ghost" @click="addGoal">+ Добавить карточку</button>
        </fieldset>

        <!-- ПРИОРИТЕТЫ -->
        <fieldset>
          <legend>Приоритеты</legend>
          <div class="grid">
            <label>
              <span>Заголовок</span>
              <input v-model="about.prioritiesTitle" type="text" placeholder="Приоритеты" />
            </label>
            <div class="upload">
              <span>Фото (правый блок)</span>
              <div class="upload__row">
                <input type="file" accept="image/*" @change="e => pickAndUpload('priorityImage', e)" />
                <progress v-if="up.priorityImage.uploading" :value="up.priorityImage.progress" max="100"/>
              </div>
              <img v-if="about.priorityImage" :src="about.priorityImage" alt="" class="preview"/>
            </div>
          </div>
          <label>
            <span>Абзац 1</span>
            <textarea v-model="about.prioritiesP1" rows="3" />
          </label>
          <label>
            <span>Абзац 2</span>
            <textarea v-model="about.prioritiesP2" rows="3" />
          </label>
        </fieldset>

        <!-- ПОЧЕМУ МЫ -->
        <fieldset>
          <legend>Почему мы?</legend>
          <div class="grid">
            <label>
              <span>Заголовок</span>
              <input v-model="about.whyTitle" type="text" placeholder="Почему мы?" />
            </label>
          </div>
          <label>
            <span>Текст</span>
            <textarea v-model="about.whyText" rows="3" />
          </label>
        </fieldset>

        <!-- SEO -->
        <fieldset>
          <legend>SEO</legend>
          <label>
            <span>SEO Title</span>
            <input v-model="about.seoTitle" type="text" />
          </label>
          <label>
            <span>SEO Description</span>
            <textarea v-model="about.seoDescription" rows="2" />
          </label>
          <p class="muted" v-if="about.updatedAt">Последнее изменение: {{ new Date(about.updatedAt).toLocaleString() }}</p>
        </fieldset>

        <div class="actions">
          <button class="btn primary" :disabled="busy">{{ busy ? 'Сохраняю...' : 'Сохранить' }}</button>
        </div>
      </form>
    </div>
  </section>
</template>

<style scoped>
.wrap{ padding: 24px; }
.card{
  background: #0f1320; border: 1px solid rgba(255,255,255,.06); border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,.24); padding: 20px 20px 28px; color:#eef3ff;
}
.topbar{ display:flex; align-items:center; gap:12px; margin-bottom:16px; }
.topbar .title{ font-size:20px; font-weight:700; margin:0 8px; }
.back{ display:flex; align-items:center; gap:6px; color:#9db7ff; }
.btn{ padding:10px 14px; border-radius:10px; border:1px solid rgba(255,255,255,.12); background:transparent; color:#fff; cursor:pointer; }
.btn.primary{ background:#2a6df4; border-color:#2a6df4; }
.btn.ghost{ background:transparent; }
.btn.danger{ background:#b81e3e; border-color:#b81e3e; }
.ml-auto{ margin-left:auto; }
.error{ color:#ff9aa2; margin:8px 0 0; }
.skeleton{ padding:40px 0; opacity:.6; }

.form{ display:grid; gap:24px; }
fieldset{ border:1px solid rgba(255,255,255,.08); border-radius:14px; padding:16px; }
legend{ padding:0 6px; opacity:.85; }
label{ display:grid; gap:8px; margin-bottom:12px; }
input, textarea{
  background:#0b0f1a; border:1px solid rgba(255,255,255,.08); color:#fff; border-radius:10px;
  padding:10px 12px; width:100%;
}
textarea{ resize:vertical; }
.grid{ display:grid; grid-template-columns: 1fr 1fr; gap:16px; }
@media (max-width: 860px){ .grid{ grid-template-columns:1fr; } }

.goals{ display:grid; gap:12px; }
.goal{
  display:grid; grid-template-columns: 1fr auto; gap:8px; align-items:start;
}
.upload{ display:grid; gap:8px; }
.upload__row{ display:flex; align-items:center; gap:10px; }
progress{ width:160px; height:8px; }
.preview{ width:220px; height:130px; object-fit:cover; border-radius:10px; border:1px solid rgba(255,255,255,.08); }

.muted{ opacity:.7; font-size:12px; }
.actions{ display:flex; justify-content:flex-end; gap:10px; }
</style>
