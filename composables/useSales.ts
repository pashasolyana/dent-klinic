const DEFAULT_SALES = {
  title: 'Акции',
  textHtml:
    'Мы с радостью представляем вам уникальные акции, которые проводятся в нашей клинике. ' +
    '<a href="#contacts" class="sales__link">Позаботьтесь о своём здоровье</a> ' +
    'и красоте зубов, воспользовавшись привлекательными предложениями, которые мы специально создали для вас.',
  updatedAt: ''
}

export function useSales() {
  const { data, pending, error, refresh } = useAsyncData(
    'sales-section',
    () => $fetch('/api/admin/sales'),
    { default: () => DEFAULT_SALES }
  )
  return { sales: data, pending, error, refresh }
}
export default useSales
