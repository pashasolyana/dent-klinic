// composables/useDoctorsHero.ts
export type DoctorsHero = {
  title: string
  subtitle: string
  ctaText: string
  ctaHref: string
  showCta: boolean
  bgUrl: string
}

const FALLBACK: DoctorsHero = {
  title: 'Врачи',
  subtitle:
    'Наши врачи — настоящие профессионалы своего дела, обладающие многолетним опытом и глубокими знаниями в области стоматологии.',
  ctaText: 'Подробнее',
  ctaHref: '/vrachi',
  showCta: true,
  bgUrl: '/images/bg.png',
}

export function useDoctorsHero() {
  // путь соответствует файлу server/api/admin/doctors-hero.get.ts
  const { data, pending, error, refresh } = useAsyncData<DoctorsHero>(
    'doctors-hero',
    () => $fetch('/api/admin/doctors-hero').catch(() => FALLBACK)
  )

  // надёжные значения с дефолтами
  const hero = computed<DoctorsHero>(() => ({ ...FALLBACK, ...(data.value || {}) }))

  return { hero, pending, error, refresh }
}
