
export function useServices() {
  const { data, pending, error, refresh } =
    useAsyncData<any[]>('services', () => $fetch('/api/admin/services'))

  const services = computed<any[]>(() =>
    (data.value || []).slice().sort((a,b)=>a.order-b.order)
  )

  return { services, pending, error, refresh }
}
