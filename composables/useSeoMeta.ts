type ImageInput = string | { url: string; width?: number; height?: number; alt?: string }

export type SeoInput = {
  /** Заголовок страницы */
  title: string
  /** Короткое описание */
  description?: string
  /** Путь (если не указать — возьмём текущий маршрут) */
  path?: string
  /** OG тип: website | article | product и т.п. */
  type?: 'website' | 'article' | 'product' | 'profile' | 'video.other'
  /** OG изображение */
  image?: ImageInput
  /** Для статей/новостей */
  publishedTime?: string
  modifiedTime?: string
  /** Индексация */
  noindex?: boolean
  /** Альтернативные локали */
  alternates?: Array<{ hrefLang: string; href: string }>
  /** Язык страницы (og:locale) */
  locale?: string
  /** Имя сайта (og:site_name) */
  siteName?: string
}

function toAbsolute(url: string, base: string) {
  try {
    return new URL(url, base).toString()
  } catch {
    return url
  }
}

function normalizeImage(img: ImageInput | undefined, base: string) {
  if (!img) return null
  if (typeof img === 'string') return { url: toAbsolute(img, base) }
  return { ...img, url: toAbsolute(img.url, base) }
}

export function useSeoMeta(input: SeoInput) {
  const route = useRoute()
  const { public: pub } = useRuntimeConfig()
  const siteUrl: string = (pub?.siteUrl as string) || 'https://example.com'
  const defaultImage: string | undefined = pub?.ogImage as string | undefined
  const siteName: string = input.siteName || (pub?.siteName as string) || 'Сайт'

  const url = toAbsolute(input.path || route.fullPath || '/', siteUrl)
  const img = normalizeImage(input.image ?? defaultImage, siteUrl)
  const title = input.title
  const desc = input.description || ''
  const type = input.type || 'website'
  const locale = input.locale || (pub?.locale as string) || 'ru_RU'

  const robots = input.noindex ? 'noindex, nofollow' : 'index, follow'

  useHead({
    title,
    meta: [
      // базовое
      { name: 'description', content: desc },
      { name: 'robots', content: robots },
      { name: 'googlebot', content: robots },

      // Open Graph
      { property: 'og:title', content: title },
      { property: 'og:description', content: desc },
      { property: 'og:type', content: type },
      { property: 'og:url', content: url },
      { property: 'og:site_name', content: siteName },
      { property: 'og:locale', content: locale },
      ...(img ? [
        { property: 'og:image', content: img.url },
        ...(img.width ? [{ property: 'og:image:width', content: String(img.width) }] : []),
        ...(img.height ? [{ property: 'og:image:height', content: String(img.height) }] : []),
        ...(img.alt ? [{ property: 'og:image:alt', content: img.alt }] : []),
      ] : []),

      // Article (если тип article)
      ...(type === 'article' && input.publishedTime ? [
        { property: 'article:published_time', content: input.publishedTime },
      ] : []),
      ...(type === 'article' && input.modifiedTime ? [
        { property: 'article:modified_time', content: input.modifiedTime },
      ] : []),
    ],
    link: [
      { rel: 'canonical', href: url },
      ...(input.alternates?.map(a => ({
        rel: 'alternate',
        hrefLang: a.hrefLang,
        href: toAbsolute(a.href, siteUrl)
      })) || []),
    ]
  })
}
