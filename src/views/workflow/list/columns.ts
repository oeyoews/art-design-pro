import type { ColumnOption } from '@/types/component'

export const columns: ColumnOption[] = [
  { type: 'selection', width: 50 },
  { type: 'globalIndex', width: 60, label: '序号' },
  {
    prop: 'name',
    label: '工作流名称',
    minWidth: 150,
    sortable: false
  },
  {
    prop: 'status',
    label: '状态',
    width: 100,
    useSlot: true,
    sortable: true
  },
  {
    prop: 'executions',
    label: '执行次数',
    width: 120,
    sortable: true
  },
  {
    prop: 'avgTime',
    label: '平均耗时',
    width: 120,
    sortable: true
  },
  {
    prop: 'successRate',
    label: '成功率',
    width: 120,
    sortable: true,
    // @ts-ignore
    formatter: (row) => `${row.successRate}%`
  },
  {
    prop: 'priority',
    label: '优先级',
    width: 100,
    sortable: true
  },
  {
    prop: 'owner',
    label: '所有者',
    width: 120,
    sortable: true
  },
  {
    prop: 'environment',
    label: '环境',
    width: 100,
    useSlot: true,
    sortable: true
  },
  {
    prop: 'startTime',
    label: '开始时间',
    width: 160,
    sortable: true
  },
  {
    prop: 'endTime',
    label: '结束时间',
    width: 160,
    sortable: true
  },
  {
    prop: 'operation',
    label: '操作',
    width: 190,
    useSlot: true,
    fixed: 'right'
  }
]
