<script setup lang="ts">
definePageMeta({ layout: 'admin' })
const route = useRoute()

const password = ref('')
const show = ref(false)
const loading = ref(false)
const error = ref('')

useHead({ title: 'Вход' })

onMounted(async () => {
  try {
    const me = await $fetch<{ ok: boolean }>('/api/auth/me', { credentials: 'include' })
    if (me.ok) {
      const redirect = (route.query.redirect as string) || '/admin'
      await navigateTo(redirect)
    }
  } catch {}
})

async function login() {
  if (!password.value || loading.value) return
  loading.value = true
  error.value = ''
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { password: password.value },
      credentials: 'include'
    })
    const redirect = (route.query.redirect as string) || '/admin'
    await navigateTo(redirect)
  } catch (e: any) {
    error.value = e?.data?.message || 'Неверный пароль'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="wrap">
    <form class="card" @submit.prevent="login">
      <h1 class="title">Вход в админку</h1>
      <p class="subtitle">Введите пароль для доступа к панели управления.</p>

      <label class="label" for="pwd">Пароль</label>
      <div class="field">
        <input
          id="pwd"
          :type="show ? 'text' : 'password'"
          v-model="password"
          placeholder="••••••••"
          autocomplete="current-password"
          required
        />
        <button class="eye" type="button" @click="show = !show" :aria-pressed="show">
          <svg v-if="!show" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5c5.5 0 9.5 5.4 9.5 7s-4 7-9.5 7S2.5 13.6 2.5 12 6.5 5 12 5Zm0 3.5A3.5 3.5 0 1 0 15.5 12 3.5 3.5 0 0 0 12 8.5Z"/></svg>
          <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M9.9 6.4A8.7 8.7 0 0 1 12 6c5.5 0 9.5 5.4 9.5 7a9.6 9.6 0 0 1-3.6 4.8M6.2 8.3A9.7 9.7 0 0 0 2.5 13c0 1.6 4 7 9.5 7a9.8 9.8 0 0 0 3.5-.6M9.2 9.3a3.5 3.5 0 0 0 5 5"/></svg>
        </button>
      </div>

      <button class="btn" :disabled="loading">
        {{ loading ? 'Входим…' : 'Войти' }}
      </button>

      <p v-if="error" class="err">{{ error }}</p>
      <p class="hint">Пароль проверяется на сервере, cookie устанавливается автоматически.</p>
    </form>
  </section>
</template>

<style scoped>
:root{
  --accent: #2f6bff;
  --panel: #14182b;
  --panel-2: #0f1220;
  --stroke: #2a2f3a;
  --text: #e7eaf3;
  --muted: #9aa3b2;
  --ring: 0 0 0 4px rgba(47, 107, 255, .22);
}

.wrap{
  width: 100%;
  display: grid;
  place-items: center;
}

.card{
  width: min(440px, 92vw);
  background: var(--panel);
  border: 1px solid var(--stroke);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0,0,0,.25);
}

.title{
  margin: 0 0 6px;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: .2px;
  color: var(--text);
  text-align: center;
}
.subtitle{
  margin: 0 0 18px;
  font-size: 15px;
  color: var(--muted);
  text-align: center;
}

/* label + поле */
.label{
  display: block;
  margin: 4px 0 6px;
  font-size: 14px;
  color: var(--muted);
}

.field{
  position: relative;
  margin-bottom: 14px;
}
input{
  display: block;
  width: 100%;
  height: 48px;
  padding: 0 96px 0 14px;
  border: 1px solid var(--stroke);
  border-radius: 12px;
  background: var(--panel-2);
  color: var(--text);
  font-size: 16px;
  outline: none;
  transition: border-color .15s ease, box-shadow .15s ease, background .15s ease;
}
input::placeholder{ color: #7f8696; }
input:focus{
  border-color: var(--accent);
  box-shadow: var(--ring);
  background: #11152a;
}

/* кнопка «показать» внутри поля */
.eye{
  position: absolute;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);
  display: grid; place-items: center;
  width: 64px; height: 36px;
  border: 1px solid var(--stroke);
  border-radius: 10px;
  background: #151b30;
  color: var(--text);
  cursor: pointer;
}
.eye svg{ width: 18px; height: 18px; fill: currentColor; opacity: .85; }
.eye:hover{ border-color: #3a4460; }

/* кнопка входа */
.btn{
  width: 100%;
  height: 48px;
  margin-top: 6px;
  border: 1px solid transparent;
  border-radius: 12px;
  background: var(--accent);
  color: #fff;
  font-weight: 600;
  font-size: 16px;
  letter-spacing: .2px;
  cursor: pointer;
  transition: transform .05s ease, filter .15s ease, opacity .15s ease;
}
.btn:hover{ filter: brightness(1.05); }
.btn:active{ transform: translateY(1px); }
.btn:disabled{ opacity: .65; cursor: default; }

/* служебные тексты */
.err{
  margin: 10px 0 0;
  color: #f87171;
  font-size: 14px;
  text-align: center;
}
.hint{
  margin: 4px 0 0;
  color: var(--muted);
  font-size: 12px;
  text-align: center;
}
</style>
