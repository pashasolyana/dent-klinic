<script setup lang="ts">
import { z } from 'zod'

const emit = defineEmits<{ submitted: [] }>()
const form = reactive({ name: '', phone: '', message: '', consent: false })

// анти‑спам
const t = ref(Date.now())      // когда показали форму
const hp_company = ref('')     // honeypot (скрытое поле)

// простая валидация
const Schema = z.object({
  name: z.string().min(2, 'Имя слишком короткое'),
  phone: z.string().min(5, 'Укажите телефон'),
  message: z.string().min(1, 'Напишите комментарий'),
  consent: z.literal(true, { errorMap: () => ({ message: 'Нужно согласие' }) })
})
const errors = reactive<{[k:string]: string}>({})

const busy = ref(false)
const done = ref(false)
const err  = ref('')

function validate() {
  errors.name = errors.phone = errors.message = errors.consent = ''
  const res = Schema.safeParse(form)
  if (!res.success) {
    res.error.issues.forEach(i => { errors[i.path[0] as string] = i.message })
    return false
  }
  return true
}

async function submit() {
  err.value = ''; done.value = false
  if (!validate()) return
  busy.value = true
  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: { ...form, t: t.value, hp_company: hp_company.value }
    })
    done.value = true
    emit('submitted')
  } catch (e:any) {
    err.value = e?.data?.statusMessage || 'Не удалось отправить заявку'
  } finally {
    busy.value = false
  }
}

function onPhoneInput(e: Event) {
  let value = (e.target as HTMLInputElement).value
  // оставляем только цифры
  value = value.replace(/\D/g, '')

  // всегда начинаем с 7
  if (!value.startsWith('7')) {
    value = '7' + value.replace(/^7/, '')
  }

  // собираем по шаблону
  let res = '+7'
  if (value.length > 1) res += ' (' + value.substring(1, 4)
  if (value.length >= 5) res += ') ' + value.substring(4, 7)
  if (value.length >= 8) res += '-' + value.substring(7, 9)
  if (value.length >= 10) res += '-' + value.substring(9, 11)

  ;(e.target as HTMLInputElement).value = res
  form.phone = res
}
</script>

<template>
  <div class="lf">
    <h2 class="lf__title">Оставить заявку</h2>
    <div class="lf__divider" aria-hidden="true"></div>
    <p class="lf__subtitle">Мы свяжемся с вами в ближайшее время</p>

    <form class="lf__form" @submit.prevent="submit" novalidate>
      <input v-model="hp_company" autocomplete="off" tabindex="-1" class="hp" aria-hidden="true" />

      <div class="lf__group">
        <input
          class="lf__input"
          :class="{ 'is-error': !!errors.name }"
          v-model.trim="form.name"
          type="text"
          placeholder="Ваше имя"
        />
        <small v-if="errors.name" class="lf__err">{{ errors.name }}</small>
      </div>

      <div class="lf__group">
        <input
          class="lf__input"
          :class="{ 'is-error': !!errors.phone }"
          v-model.trim="form.phone"
          type="tel"
          placeholder="Телефон"
           @input="onPhoneInput"
        />
        <small v-if="errors.phone" class="lf__err">{{ errors.phone }}</small>
      </div>

      <div class="lf__group">
        <textarea
          class="lf__input lf__area"
          :class="{ 'is-error': !!errors.message }"
          v-model.trim="form.message"
          rows="4"
          placeholder="Комментарий"
        />
        <small v-if="errors.message" class="lf__err">{{ errors.message }}</small>
      </div>

      <label class="lf__consent">
        <input type="checkbox" v-model="form.consent" class="lf__checkbox" />
        <span>Я даю согласие на обработку персональных данных, согласно
            <NuxtLink to="/privacy" class="lf__link" target="_blank">политике конфиденциальности</NuxtLink>
        </span>
      </label>
      <small v-if="errors.consent" class="lf__err">{{ errors.consent }}</small>

      <button class="lf__btn" :disabled="busy">
        {{ busy ? 'Отправляем…' : 'Оставить заявку' }}
      </button>

      <p v-if="done" class="lf__ok">Спасибо! Ваша заявка отправлена.</p>
      <p v-if="err" class="lf__err lf__err--global">{{ err }}</p>
    </form>
  </div>
</template>

<style scoped>
:root{
  --lf-text:#ffffff;
  --lf-muted:#c9ccd3;
  --lf-ring:rgba(77,138,255,.28);
  --lf-danger:#ff5c5c;
  --lf-ok:#36c07e;
  --lf-primary:#2f6bff;
}

.hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}

.lf{
  box-sizing:border-box;
  width:min(760px, 100%);
  max-width:100%;
  margin:0 auto;
  padding:20px;
  color:var(--lf-text);
}

.lf__title{
  font-size:34px;
  font-weight:800;
  text-align:center;
  margin:4px 0 8px;
}
.lf__divider{
  width:64px;height:2px;margin:0 auto 8px;border-radius:2px;
  background:rgba(255,255,255,.25)
}
.lf__subtitle{
  text-align:center;
  font-size:18px;
  color:var(--lf-muted);
  margin:0 0 16px;
}

.lf__form{
  display:flex;
  flex-direction:column;
  gap:16px;
}

.lf__group{display:flex;flex-direction:column;gap:6px}

.lf__input{
  display:block;
  width:100%;
  box-sizing:border-box;
  border:1px solid rgba(255,255,255,.15);
  background:#fff;
  color:#0c0d10;
  border-radius:20px;
  padding:16px 20px;
  font-size:17px;              /* текст крупнее */
  outline:none;
  transition:border-color .15s ease, box-shadow .15s ease;
}
.lf__input::placeholder{color:#8a9099;font-size:16px}
.lf__area{border-radius:16px;min-height:120px;resize:vertical;overflow:auto}

.lf__input:focus{
  border-color:var(--lf-primary);
  box-shadow:0 0 0 2px var(--lf-ring);
}
.lf__input.is-error{
  border-color:var(--lf-danger);
  box-shadow:0 0 0 2px rgba(255,92,92,.25);
}

.lf__consent{
  display:flex;gap:10px;align-items:flex-start;
  font-size:15px;line-height:1.4;
  color:var(--lf-muted);
}
.lf__checkbox{
  width:18px;height:18px;appearance:none;cursor:pointer;
  border-radius:6px;border:1px solid rgba(255,255,255,.25);
  background:#151924;position:relative;flex:0 0 18px;outline:none;
}
.lf__checkbox:checked{background:var(--lf-primary);border-color:var(--lf-primary)}
.lf__checkbox:checked::after{
  content:'';position:absolute;inset:3px;
  border:2px solid #fff;border-top:0;border-left:0;transform:rotate(45deg)
}

.lf__link {
  color: var(--lf-primary);
  text-decoration: underline;
  cursor: pointer;
}
.lf__link:hover {
  text-decoration: none;
}

/* кнопка — всегда синяя, без изменения оттенка */
.lf__btn{
  margin-top:2px;
  background:var(--lf-primary);
  color:#fff;
  border:0;
  border-radius:999px;
  padding:16px 24px;
  font-size:17px;
  font-weight:600;
  cursor:pointer;
  width:100%;
}
.lf__btn:disabled{opacity:.65;cursor:default}

.lf__err{color:var(--lf-danger);font-size:13px;margin:0 6px}
.lf__err--global{text-align:center;margin-top:6px}
.lf__ok{color:var(--lf-ok);text-align:center;margin-top:8px}

@media (max-width:480px){
  .lf{padding:16px}
  .lf__title{font-size:28px}
  .lf__subtitle{font-size:16px}
  .lf__input{font-size:16px;padding:14px 16px}
}
</style>
