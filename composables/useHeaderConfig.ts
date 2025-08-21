// composables/useHeaderConfig.ts
export interface HeaderConfig {
  social: { whatsappUrl: string; telegramUrl: string }
  updatedAt?: string
}

const DEFAULTS: HeaderConfig = {
  social: {
    whatsappUrl: 'https://wa.me/79777876837',
    telegramUrl: 'https://t.me/+79777876837'
  },
  updatedAt: ''
}

export function useHeaderConfig() {
  // Один запрос на приложение (кэш по ключу)
  const { data, pending, error, refresh } = useAsyncData(
    'header-config',
    () => $fetch<HeaderConfig>('/api/admin/header'),
    { default: () => DEFAULTS }
  )

  const waHref = computed(
    () => data.value?.social.whatsappUrl || DEFAULTS.social.whatsappUrl
  )
  const tgHref = computed(
    () => data.value?.social.telegramUrl || DEFAULTS.social.telegramUrl
  )

  return {
    header: data,     // ref<HeaderConfig>
    waHref, tgHref,   // computed<string>
    pending, error,   // состояния
    refresh           // можно дернуть после сохранения в админке
  }
}
