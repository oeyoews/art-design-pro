import request from '@/utils/http'

export class UserService {
  // 登录
  static login(params: Api.Auth.LoginParams) {
    return request.post<Api.Auth.LoginResponse>({
      // url: '/api/auth/login',
      url: '/api/login',
      params
      // 自定义请求头
      // headers: {
      //   'X-Custom-Header': 'your-custom-value'
      // }
      // showErrorMessage: false // 不显示错误消息
    })
  }

  // 获取用户信息
  static getUserInfo() {
    return request.get<Api.User.UserInfo>({
      // url: '/api/user/info'
      url: '/api/getInfo'
    })
  }

  // 获取用户列表
  static getUserList(params: Api.Common.PaginatingSearchParams) {
    return request.get<Api.User.UserListData>({
      // url: '/api/user/list',
      url: "/api/system/user/list",
      params
    })
  }
  // 获取角色表
  static getRoleList(params: Api.Common.PaginatingSearchParams) {
    return request.get<Api.User.UserListData>({
      // url: '/api/user/list',
      url: "/api/system/role/list",
      params
    })
  }

  // 删除用户
  static delUser(id: number) {
    return request.del<Api.User.UserListData>({
      url: "/api/system/user/" + id,
    })
  }
  /** 更新用户信息 */
  static editUser(data: any) {
    return request.put<Api.User.UserListData>({
      url: "/api/system/user",
      data
    })
  }
  // test
  static getUserWorkflowList(params: Api.Common.PaginatingSearchParams) {
    return request.get<Api.User.UserListData>({
      url: '/api/workflow/list',
      params
    })
  }
}
