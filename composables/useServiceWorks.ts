

export function useServiceWorks(slug: string) {
  const key = `service-works:${slug}`
  const { data, pending, error, refresh } =
    useAsyncData<any[]>(key, () => $fetch(`/api/services/${slug}`))

  const works = computed<any[]>(() =>
    (data.value || []).slice().sort((a,b)=>a.order-b.order)
  )

  return { works, pending, error, refresh }
}
