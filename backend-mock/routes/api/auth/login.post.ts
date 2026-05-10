import { defineEventHandler, readBody } from 'h3'
import { handleAuthLogin } from '#mock-handlers'

export default defineEventHandler(async (event) => {
  const body = (await readBody(event).catch(() => ({}))) as Record<string, string> | undefined
  return handleAuthLogin(body ?? {})
})
