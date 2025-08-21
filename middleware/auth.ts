// middleware/auth.ts
export default defineNuxtRouteMiddleware(async (to) => {
  // логин не трогаем
  if (to.path === '/admin/login') return
  // интересуют только /admin/*
  if (!to.path.startsWith('/admin')) return

  const { data, error } = await useFetch<{ ok: boolean }>('/api/auth/me', {
    credentials: 'include'
  })

  if (error.value || !data.value?.ok) {
    return navigateTo(`/admin/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
