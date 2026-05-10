import type { MockMethod } from 'vite-plugin-mock'
import type { AppRouteRecord } from '../src/types/router'
import { routeModules } from '../src/router/modules/index'
import { ok } from './util'

function cloneMenus(): AppRouteRecord[] {
  return JSON.parse(JSON.stringify(routeModules)) as AppRouteRecord[]
}

export default [
  {
    url: '/api/v3/system/menus',
    method: 'get',
    response: () => ok(cloneMenus())
  }
] as MockMethod[]
