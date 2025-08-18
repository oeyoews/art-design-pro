import { RoutesAlias } from '../routesAlias'
import { AppRouteRecord } from '@/types/router'

/** 系统管理菜单 */
export const systemRoutes: AppRouteRecord[] = [
  {
    path: 'user-center',
    name: 'UserCenter',
    component: RoutesAlias.UserCenter,
    meta: {
      title: '用户中心',
      isHide: true,
      keepAlive: true,
      isHideTab: true
    }
  },
  {
    path: '/system',
    name: 'System',
    component: RoutesAlias.Layout,
    meta: {
      title: '系统管理',
      icon: '&#xe7b9;',
      roles: ['R_SUPER', 'R_ADMIN', 'admin']
    },
    children: [
      {
        path: 'user',
        name: 'User',
        component: RoutesAlias.User,
        meta: {
          title: '用户管理',
          icon: '&#xe608;',
          keepAlive: true,
          roles: ['R_SUPER', 'R_ADMIN']
        }
      },
      {
        path: 'role',
        name: 'Role',
        component: RoutesAlias.Role,
        meta: {
          title: '角色管理',
          iconType: 'iconfont-oeyoews',
          icon: "&#xe640;",
          keepAlive: true,
          roles: ['R_SUPER']
        }
      },
      {
        path: 'menu',
        name: 'Menus',
        component: RoutesAlias.Menu,
        meta: {
          title: '菜单管理',
          keepAlive: true,
          roles: ['R_SUPER'],
          icon: "&#xe662;",
          authList: [
            {
              title: '新增',
              authMark: 'add'
            },
            {
              title: '编辑',
              authMark: 'edit'
            },
            {
              title: '删除',
              authMark: 'delete'
            }
          ]
        }
      },
    ]
  },
]
