import type { MockMethod } from 'vite-plugin-mock'
import { handleMenus } from './api-handlers'

export default [
  {
    url: '/api/v3/system/menus',
    method: 'get',
    response: () => handleMenus()
  }
] as MockMethod[]
