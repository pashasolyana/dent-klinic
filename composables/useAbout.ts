
const DEFAULT_ABOUT: any = {
  title: 'О клинике',
  text: 'Наша клиника – не просто место, где люди получают стоматологическую помощь.\nЭто особое пространство, где соединяется наука, искусство и трудолюбие.',
  ctaLabel: 'Узнать больше',
  ctaHref: '/o-klinike',
  updatedAt: ''
}

export function useAbout() {
  const { data, pending, error, refresh } = useAsyncData(
    'about-section',
    () => $fetch<any>('/api/admin/about'),
    { default: () => DEFAULT_ABOUT }
  )
  return {
    about: data,      // ref<AboutSection>
    pending, error,
    refresh
  }
}
export default useAbout
