// composables/useAdminDoctors.ts
import { ref } from 'vue'
import type { Doctor } from './useDoctors'

export function useAdminDoctors () {
  const list = ref<Doctor[]>([])
  const pending = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll () {
    pending.value = true; error.value = null
    try { list.value = await $fetch<Doctor[]>('/api/admin/doctors') }
    catch (e:any) { error.value = e?.data?.message || e?.message || 'Ошибка' }
    finally { pending.value = false }
  }

  async function create (payload: Partial<Doctor>) {
    const res = await $fetch<{ ok: true, data: Doctor }>('/api/admin/doctors', {
      method: 'POST', body: payload
    })
    await fetchAll()
    return res.data
  }

  async function update (id: string, patch: Partial<Doctor>) {
    const res = await $fetch<{ ok: true, data: Doctor }>(`/api/admin/doctors?id=${id}`, {
      method: 'PUT', body: patch
    })
    await fetchAll()
    return res.data
  }

  async function remove (id: string) {
    await $fetch(`/api/admin/doctors?id=${id}`, { method: 'DELETE' })
    await fetchAll()
  }

  return { list, pending, error, fetchAll, create, update, remove }
}
