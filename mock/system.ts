import type { MockMethod } from 'vite-plugin-mock'
import { ok } from './util'

const userRecords: Api.SystemManage.UserListItem[] = [
  {
    id: 1,
    avatar: 'https://picsum.photos/id/1/80/80',
    status: '1',
    userName: 'admin',
    userGender: '1',
    nickName: '管理员',
    userPhone: '13800138000',
    userEmail: 'admin@example.com',
    userRoles: ['R_SUPER'],
    createBy: 'system',
    createTime: '2024-01-01 10:00:00',
    updateBy: 'system',
    updateTime: '2024-06-01 12:00:00'
  },
  {
    id: 2,
    avatar: 'https://picsum.photos/id/2/80/80',
    status: '1',
    userName: 'editor',
    userGender: '2',
    nickName: '编辑',
    userPhone: '13900139000',
    userEmail: 'editor@example.com',
    userRoles: ['R_ADMIN'],
    createBy: 'admin',
    createTime: '2024-02-01 11:00:00',
    updateBy: 'admin',
    updateTime: '2024-06-02 15:00:00'
  },
  {
    id: 3,
    avatar: 'https://picsum.photos/id/3/80/80',
    status: '2',
    userName: 'guest',
    userGender: '1',
    nickName: '访客',
    userPhone: '13700137000',
    userEmail: 'guest@example.com',
    userRoles: ['R_GUEST'],
    createBy: 'admin',
    createTime: '2024-03-01 09:00:00',
    updateBy: 'admin',
    updateTime: '2024-05-01 10:00:00'
  }
]

const roleRecords: Api.SystemManage.RoleListItem[] = [
  {
    roleId: 1,
    roleName: '超级管理员',
    roleCode: 'R_SUPER',
    description: '全部权限',
    enabled: true,
    createTime: '2024-01-01 10:00:00'
  },
  {
    roleId: 2,
    roleName: '管理员',
    roleCode: 'R_ADMIN',
    description: '业务管理',
    enabled: true,
    createTime: '2024-01-02 10:00:00'
  },
  {
    roleId: 3,
    roleName: '访客',
    roleCode: 'R_GUEST',
    description: '只读',
    enabled: true,
    createTime: '2024-01-03 10:00:00'
  }
]

function pickPage<T>(list: T[], current: number, size: number) {
  const start = (current - 1) * size
  return list.slice(start, start + size)
}

export default [
  {
    url: '/api/user/list',
    method: 'get',
    response: ({ query }: { query: Record<string, string> }) => {
      const current = Number(query.current) || 1
      const size = Number(query.size) || 10
      let list = [...userRecords]
      const { userName, status, userPhone, userEmail, userGender, id } = query
      if (id) list = list.filter((u) => String(u.id) === String(id))
      if (userName) list = list.filter((u) => u.userName.includes(String(userName)))
      if (status) list = list.filter((u) => u.status === status)
      if (userPhone) list = list.filter((u) => u.userPhone.includes(String(userPhone)))
      if (userEmail) list = list.filter((u) => u.userEmail.includes(String(userEmail)))
      if (userGender) list = list.filter((u) => u.userGender === userGender)
      const records = pickPage(list, current, size)
      return ok({
        records,
        current,
        size,
        total: list.length
      })
    }
  },
  {
    url: '/api/role/list',
    method: 'get',
    response: ({ query }: { query: Record<string, string> }) => {
      const current = Number(query.current) || 1
      const size = Number(query.size) || 10
      let list = [...roleRecords]
      const { roleName, roleCode, enabled } = query
      if (roleName) list = list.filter((r) => r.roleName.includes(String(roleName)))
      if (roleCode) list = list.filter((r) => r.roleCode.includes(String(roleCode)))
      if (enabled !== undefined && enabled !== '' && enabled !== 'null') {
        const b = enabled === 'true' || enabled === '1'
        list = list.filter((r) => r.enabled === b)
      }
      const records = pickPage(list, current, size)
      return ok({
        records,
        current,
        size,
        total: list.length
      })
    }
  }
] as MockMethod[]
