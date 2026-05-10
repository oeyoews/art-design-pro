import type { MockMethod } from 'vite-plugin-mock'
import { handleAuthLogin, handleUserInfo } from './api-handlers'

export default [
  {
    url: '/api/auth/login',
    method: 'post',
    response: ({ body }: { body: Record<string, string> }) => handleAuthLogin(body)
  },
  {
    url: '/api/user/info',
    method: 'get',
    response: () => handleUserInfo()
  }
] as MockMethod[]
