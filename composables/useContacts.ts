export function useContacts () {
  const { data, pending, error, refresh } = useAsyncData(
    'contacts',
    () => $fetch('/api/admin/contacts'),
    { default: () => null }
  )
  return { contacts: data, pending, error, refresh }
}
export default useContacts
