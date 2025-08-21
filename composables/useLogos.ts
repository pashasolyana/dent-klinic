export function useLogos () {
  const { data, pending, error, refresh } = useAsyncData(
    'logos',
    () => $fetch('/api/admin/logos'),
    { default: () => [] }
  )
  return { logos: data, pending, error, refresh }
}
export default useLogos
