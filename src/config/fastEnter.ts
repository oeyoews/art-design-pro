/**
 * 快速入口配置
 * 包含：应用列表、快速链接等配置
 */
import { RoutesAlias } from '@/router/routesAlias'
import { WEB_LINKS } from '@/utils/constants'
import type { FastEnterConfig } from '@/types/config'

const fastEnterConfig: FastEnterConfig = {
  // 显示条件（屏幕宽度）
  minWidth: 1200,
  // 应用列表
  applications: [
    {
      name: '工作台',
      description: '系统概览与数据统计',
      icon: '&#xe721;',
      iconColor: '#377dff',
      path: RoutesAlias.Dashboard,
      enabled: true,
      order: 1
    },
    {
      name: '官方文档',
      description: '使用指南与开发文档',
      icon: '&#xe788;',
      iconColor: '#ffb100',
      path: WEB_LINKS.DOCS,
      enabled: true,
      order: 2
    }
  ],
  // 快速链接
  quickLinks: [
    {
      name: '登录',
      path: RoutesAlias.Login,
      enabled: true,
      order: 1
    },
    {
      name: '注册',
      path: RoutesAlias.Register,
      enabled: true,
      order: 2
    },
    {
      name: '忘记密码',
      path: RoutesAlias.ForgetPassword,
      enabled: true,
      order: 3
    },
    {
      name: '个人中心',
      path: RoutesAlias.UserCenter,
      enabled: true,
      order: 4
    }
  ]
}

export default Object.freeze(fastEnterConfig)
