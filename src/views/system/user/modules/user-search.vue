<template>
  <ArtSearchBar
    v-model:filter="searchFormState"
    :items="formItems"
    @reset="handleReset"
    @search="handleSearch"
  />
</template>

<script setup lang="ts">
  import { SearchChangeParams, SearchFormItem } from '@/types'

  interface Emits {
    (e: 'update:modelValue', value: any): void
    (e: 'search', value: any): void
    (e: 'reset'): void
  }

  const emit = defineEmits<Emits>()

  // 定义表单搜索初始值
  const initialSearchState = {
    userName: '',
    phonenumber: undefined,
    // level: 'normal',
    email: undefined,
    daterange: [],
    status: undefined,
  }

  const searchFormState = ref({ ...initialSearchState })

  // 重置表单
  const handleReset = () => {
    searchFormState.value = { ...initialSearchState }
    emit('update:modelValue', { ...initialSearchState })
    emit('reset')
  }

  // 搜索处理
  const handleSearch = () => {
    console.log('搜索参数:', searchFormState.value)
    const { daterange, ...params } = searchFormState.value
    emit('search', {
      ...params,
      startTime: daterange[0],
      endTime: daterange[1]
    })
  }

  // 表单项变更处理
  const handleFormChange = (params: SearchChangeParams): void => {
    console.log('表单项变更:', params)
  }

  // 表单配置项
  const formItems: SearchFormItem[] = [
    {
      label: '用户名',
      prop: 'userName',
      type: 'input',
      config: {
        clearable: true
      },
      onChange: handleFormChange
    },
    {
      label: '电话',
      prop: 'phonenumber',
      type: 'input',
      config: {
        clearable: true
      },
      onChange: handleFormChange
    },
    {
      label: '邮箱',
      prop: 'email',
      type: 'input',
      config: {
        clearable: true
      },
      onChange: handleFormChange
    },
    // 支持 9 种日期类型定义
    // 具体可参考 src/components/core/forms/art-search-bar/widget/art-search-date/README.md
    // {
    //   prop: 'date',
    //   label: '日期',
    //   type: 'date',
    //   config: {
    //     type: 'date',
    //     placeholder: '请选择日期'
    //   }
    // },
    {
      prop: 'daterange',
      label: '日期范围',
      type: 'daterange',
      config: {
        type: 'daterange',
        startPlaceholder: '开始时间',
        endPlaceholder: '结束时间'
      }
    },
    {
      label: '状态',
      prop: 'status',
      type: 'select',
      options: [
        { label: '在线', value: '1' },
        { label: '离线', value: '2' }
      ],
      onChange: handleFormChange
    }
  ]
</script>
