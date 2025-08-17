/**
 * namespace: SystemApi
 */
declare namespace SystemApi {
  /** 用户类型 */
  namespace Role {
    /** 角色列表项 */
    interface RoleListItem {
      createBy: string | null
      createTime: string | null
      updateBy: string | null
      updateTime: string | null
      remark: string | null
      roleId: number
      roleName: string
      roleKey: string
      roleSort: number
      dataScope: string
      menuCheckStrictly: boolean
      deptCheckStrictly: boolean
      status: '0' | '1' // 0: 正常 1: 停用
      delFlag: '0' | '1' // 0: 未删除 1: 已删除
      flag: boolean
      menuIds: number[] | null
      deptIds: number[] | null
      permissions: string[] | null
      admin: boolean
    }
  }
}
