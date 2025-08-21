<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['auth'] })

const router = useRouter()
const logout = async () => {
  try {
    await $fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
  } catch {}
  router.push('/admin/login')
}
</script>

<template>
  <section class="wrap">
    <h1 class="title">Админ-панель</h1>

    <nav class="grid">
      <NuxtLink class="link" to="/admin/header">Навигация</NuxtLink>
      <NuxtLink class="link" to="/admin/about">«О клинике»</NuxtLink>
      <NuxtLink class="link" to="/admin/sales">«Акции»</NuxtLink>
      <NuxtLink class="link" to="/admin/promo">«Промо»</NuxtLink>
         <NuxtLink class="link" to="/admin/doctors">Врачи</NuxtLink>
          <NuxtLink class="link" to="/admin/services">Услуги</NuxtLink>
          <NuxtLink class="link" to="/admin/logos"> Логотипы (марки)</NuxtLink>
          <NuxtLink class="link" to="/admin/contacts">«Контакты»</NuxtLink>
          <NuxtLink class="link" to="/admin/about-klinic">"О клинике" - отд. страница</NuxtLink>
                   <NuxtLink class="link" to="/admin/vrachi">Врачи - Список</NuxtLink>

    </nav>

    <div class="actions">
      <NuxtLink class="ghost" to="/">← На сайт</NuxtLink>
    </div>
  </section>
</template>

<style scoped>
.wrap{ width:min(900px,94vw); margin:0 auto; color:#e7eaf3; }
.title{ text-align:center; font:700 22px/1.2 system-ui; margin:10px 0 16px; }

.grid{
  display:grid; gap:10px;
  grid-template-columns: 1fr;
}
@media (min-width:720px){
  .grid{ grid-template-columns: 1fr 1fr; }
}

.link{
  display:block; padding:12px 16px; border-radius:10px;
  border:1px solid #2a2f3a; background:#15192b; color:#e7eaf3; text-decoration:none;
}
.link:hover{ border-color:#3a4460; background:#182038; }

.actions{
  display:flex; justify-content:space-between; align-items:center; margin-top:14px;
}
.ghost{
  color:#9aa3b2; text-decoration:none; padding:6px 10px; border-radius:8px; border:1px solid #2a2f3a;
  background:#151b30;
}
.logout{
  padding:8px 14px; border-radius:10px; border:1px solid transparent;
  background:#2f6bff; color:#fff; font-weight:600; cursor:pointer;
}
.logout:hover{ filter:brightness(1.05); }
</style>
