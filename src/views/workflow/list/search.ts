import type { SearchFormItem } from '@/types'

// 搜索表单配置
export const searchItems: SearchFormItem[] = [
  {
    prop: 'name',
    label: '工作流名称',
    type: 'input',
    config: {
      placeholder: '请输入工作流名称'
    }
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    options: [
      { label: '全部', value: '' },
      { label: '运行中', value: 'running' },
      { label: '等待中', value: 'pending' },
      { label: '已完成', value: 'completed' },
      { label: '失败', value: 'failed' },
      { label: '已停止', value: 'stopped' }
    ]
  },
  {
    prop: 'owner',
    label: '所有者',
    type: 'input',
    config: {
      placeholder: '请输入所有者'
    }
  },
  {
    prop: 'environment',
    label: '环境',
    type: 'select',
    options: [
      { label: '全部', value: '' },
      { label: '开发', value: 'dev' },
      { label: '测试', value: 'test' },
      { label: '生产', value: 'prod' }
    ]
  },
  {
    prop: 'dateRange',
    label: '执行时间',
    type: 'daterange',
    config: {
      type: 'daterange',
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD'
    }
  }
]
