import { defineEventHandler } from 'h3'
import { isAdmin } from '~/server/utils/auth'

export default defineEventHandler((event) => ({ ok: isAdmin(event) }))
