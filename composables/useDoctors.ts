import { ref } from 'vue'

export type Doctor = {
  id: string
  name: string
  position?: string | null
  description?: string | null
  photo: string
  order?: number | null
  visible?: boolean
  createdAt?: string
  updatedAt?: string
}

export function useDoctors () {
  const doctors = ref<Doctor[]>([])
  const pending = ref(false)
  const error = ref<string | null>(null)

  async function load (opts?: { visibleOnly?: boolean }) {
    pending.value = true; error.value = null
    try {
      const v = opts?.visibleOnly ?? true
      const q = v ? '?visible=1' : ''
      doctors.value = await $fetch<Doctor[]>(`/api/doctors${q}`)
    } catch (e:any) {
      error.value = e?.data?.message || e?.message || 'Ошибка загрузки'
    } finally { pending.value = false }
  }

  return { doctors, pending, error, load }
}
