import { defineEventHandler, getQuery } from 'h3'
import { handleUserList } from '#mock-handlers'

export default defineEventHandler((event) =>
  handleUserList(getQuery(event) as Record<string, string>)
)
