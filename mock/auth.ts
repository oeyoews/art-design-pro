import type { MockMethod } from 'vite-plugin-mock'
import { ok } from './util'

const demoUserInfo: Api.Auth.UserInfo = {
  userId: 1,
  userName: 'Admin',
  email: 'admin@example.com',
  avatar: 'https://picsum.photos/id/64/200/200',
  roles: ['R_SUPER', 'R_ADMIN'],
  buttons: ['view', 'publish', 'add', 'edit', 'delete', 'export']
}

export default [
  {
    url: '/api/auth/login',
    method: 'post',
    response: ({ body }: { body: Record<string, string> }) => {
      const { userName, password } = body
      if (!userName || !password) {
        return { code: 400, msg: '请输入用户名和密码', data: null }
      }
      return ok({
        token: `mock-access-token-${userName}`,
        refreshToken: `mock-refresh-token-${userName}`
      })
    }
  },
  {
    url: '/api/user/info',
    method: 'get',
    response: () => ok(demoUserInfo)
  }
] as MockMethod[]
