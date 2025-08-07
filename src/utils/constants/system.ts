export const sexOptions = [
  {
    value: '0',
    label: '男'
  },
  {
    value: '1',
    label: '女'
  }
]

// 用户状态配置
export const USER_STATUS_CONFIG = {
  0: { type: 'success' as const, text: '正常' },
  1: { type: 'info' as const, text: '停用' },
  // 2: { type: 'warning' as const, text: '异常' },
  // 3: { type: 'danger' as const, text: '注销' }
} as const
