export function useJsonLd(data: Record<string, any> | (() => Record<string, any>)) {
  const payload = typeof data === 'function' ? data : () => data
  useHead({
    script: [{
      type: 'application/ld+json',
      // @ts-expect-error: функция допустима
      children: () => JSON.stringify(payload())
    }]
  })
}
