// ~/composables/useAboutClinic.ts
import { ref, computed, watch } from 'vue'

export type Goal = { id: string; text: string }
export type AboutClinic = {
  heroTitle: string
  foundationTitle: string
  foundationParagraph1: string
  foundationParagraph2: string
  yearsText: string
  goals: Goal[]
  prioritiesTitle: string
  prioritiesP1: string
  prioritiesP2: string
  whyTitle: string
  whyText: string
  priorityImage?: string
  goalsBackground?: string
  heroYearsCardImage?: string
  seoTitle?: string
  seoDescription?: string
  updatedAt?: string
}

export async function useAboutClinic() {
  const { data, pending, error, refresh } = await useFetch<AboutClinic>('/api/admin/o-klinike', {
    key: 'about-clinic',
    server: true,         // выполним на SSR
    // Байпас кэша на клиенте после правок в админке:
    params: process.client ? { v: Date.now() } : undefined,
    default: () => ({
      heroTitle: 'О клинике',
      foundationTitle: 'Основание',
      foundationParagraph1: '',
      foundationParagraph2: '',
      yearsText: '—',
      goals: [],
      prioritiesTitle: 'Приоритеты',
      prioritiesP1: '',
      prioritiesP2: '',
      whyTitle: 'Почему мы?',
      whyText: '',
      priorityImage: '',
      goalsBackground: '',
      heroYearsCardImage: '',
      seoTitle: 'О клинике',
      seoDescription: ''
    })
  })

  // media helpers
  const showPh = ref(false)
  const priorityImg = computed(() => data.value?.priorityImage || '')
  watch(priorityImg, v => { if (v) showPh.value = false })

  function onImgError(e: Event) {
    (e.target as HTMLImageElement).style.display = 'none'
    showPh.value = true
  }

  const goalsBg = computed(() =>
    data.value?.goalsBackground ? `url('${data.value.goalsBackground}')` : ''
  )
  const heroYearsBg = computed(() =>
    data.value?.heroYearsCardImage ? `url('${data.value.heroYearsCardImage}')` : ''
  )

  if (process.client) {
    watch(
      () => [data.value?.seoTitle, data.value?.seoDescription],
      () => {
        if (!data.value) return
        useSeoMeta({
          title: data.value.seoTitle || 'О клинике',
          description: data.value.seoDescription || ''
        })
      },
      { immediate: true }
    )
  }

  return { about: data, pending, error, refresh, goalsBg, heroYearsBg, priorityImg, showPh, onImgError }
}
