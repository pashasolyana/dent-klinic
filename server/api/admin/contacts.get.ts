import { defineEventHandler } from 'h3'
import { readJson, writeJson } from '~/server/utils/jsondb'

export default defineEventHandler(async () => {
  try {
    return await readJson('contacts.json')
  } catch {
    const seed = {
      phone: '8 (499) 125-53-08',
      phoneHref: 'tel:+74991255308',
      social: {
        telegramUrl: 'https://t.me/+79777876837',
        whatsappUrl: 'https://wa.me/79777876837'
      },
      schedule: 'с 10:00 до 20:00',
      address: '117218, Москва, ул. Профсоюзная, 7/12',
      ctaLabel: 'Оставить заявку',
      ctaHref: '#form',
      mapEmbed: 'https://yandex.ru/map-widget/v1/?um=constructor%3Ac2b5c2321f1897ac47b63077878e4aba736fcfc1dc88fb33a0a76aa5b246cfaf&source=constructor',
      bgSrc: '/images/contacts.png',
      updatedAt: new Date().toISOString()
    }
    await writeJson('contacts.json', seed)
    return seed
  }
})
