import type { MockMethod } from 'vite-plugin-mock'
import { handleRoleList, handleUserList } from './api-handlers'

export default [
  {
    url: '/api/user/list',
    method: 'get',
    response: ({ query }: { query: Record<string, string> }) => handleUserList(query)
  },
  {
    url: '/api/role/list',
    method: 'get',
    response: ({ query }: { query: Record<string, string> }) => handleRoleList(query)
  }
] as MockMethod[]
