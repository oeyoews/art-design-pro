import type { MockMethod } from 'vite-plugin-mock'
import { handleMenus } from './api-handlers'

export default [
  {
    url: '/api/system/menus',
    method: 'get',
    response: () => handleMenus()
  }
] as MockMethod[]
