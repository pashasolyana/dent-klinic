export function usePromo() {
  const { data, pending, error, refresh } = useAsyncData(
    'promo-slides',
    () => $fetch('/api/admin/promo'),
    { default: () => [] }
  )
  return { promo: data, pending, error, refresh }
}
export default usePromo
