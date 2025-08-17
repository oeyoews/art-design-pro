import { RoutesAlias } from '../routesAlias'
import { AppRouteRecord } from '@/types/router'

/**
 * 菜单列表、异步路由
 *
 * 支持两种模式:
 * 前端静态配置 - 直接使用本文件中定义的路由配置
 * 后端动态配置 - 后端返回菜单数据，前端解析生成路由
 *
 * 菜单标题（title）:
 * 可以是 i18n 的 key，也可以是字符串，比如：'用户列表'
 *
 * RoutesAlias.Layout 指向的是布局组件，后端返回的菜单数据中，component 字段需要指向 /index/index
 * 路由元数据（meta）：异步路由在 asyncRoutes 中配置，静态路由在 staticRoutes 中配置
 */
export const asyncRoutes: AppRouteRecord[] = [
  {
    path: '/home',
    name: 'Console',
    component: RoutesAlias.Dashboard,
    meta: {
      title: '首页',
      keepAlive: false,
      icon: '&#xe7c0;',
    }
  },
  {
    name: 'Workflow',
    path: '/workflow',
    component: RoutesAlias.Layout,
    meta: {
      title: "工作流",
      icon: '&#xe7f3;',
      iconType: 'iconfont-oeyoews',
      roles: ['R_SUPER', 'R_ADMIN']
    },
    children: [
      {
        path: 'treelist',
        name: 'treelist',
        component: RoutesAlias.WorkflowTree,
        meta: {
          title: "左右布局",
          keepAlive: false,
          fixedTab: false,
        }
      },
      {
        path: 'basic',
        name: 'basic',
        component: RoutesAlias.WorkflowBasic,
        meta: {
          title: "基本表格",
          keepAlive: false,
          fixedTab: true,
        }
      },
      {
        path: 'table',
        name: 'table',
        component: RoutesAlias.Workflow,
        meta: {
          title: "列表示例",
          keepAlive: false,
          fixedTab: true,
        }
      }
    ]
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
    ]
  },
  {
    path: '/result',
    name: 'Result',
    component: RoutesAlias.Layout,
    meta: {
      title: 'menus.result.title',
      isHide: true,
      icon: '&#xe715;'
    },
    children: [
      {
        path: 'success',
        name: 'ResultSuccess',
        component: RoutesAlias.Success,
        meta: {
          title: 'menus.result.success',
          keepAlive: true
        }
      },
      {
        path: 'fail',
        name: 'ResultFail',
        component: RoutesAlias.Fail,
        meta: {
          title: 'menus.result.fail',
          keepAlive: true
        }
      }
    ]
  },
  {
    path: '/exception',
    name: 'Exception',
    component: RoutesAlias.Layout,
    meta: {
      title: 'menus.exception.title',
      isHide: true,
      icon: '&#xe820;'
    },
    children: [
      {
        path: '403',
        name: '403',
        component: RoutesAlias.Exception403,
        meta: {
          title: 'menus.exception.forbidden',
          keepAlive: true
        }
      },
      {
        path: '404',
        name: '404',
        component: RoutesAlias.Exception404,
        meta: {
          title: 'menus.exception.notFound',
          keepAlive: true
        }
      },
      {
        path: '500',
        name: '500',
        component: RoutesAlias.Exception500,
        meta: {
          title: 'menus.exception.serverError',
          keepAlive: true
        }
      }
    ]
  }
]
