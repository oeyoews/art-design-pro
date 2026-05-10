import { defineEventHandler, getQuery } from 'h3'
import { handleRoleList } from '#mock-handlers'

export default defineEventHandler((event) =>
  handleRoleList(getQuery(event) as Record<string, string>)
)
