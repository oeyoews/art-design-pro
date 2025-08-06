<!-- 用户搜索栏 -->
<template>
  <ArtSearchBar
    v-model:filter="searchFormState"
    :items="formItems"
    @reset="handleReset"
    @search="handleSearch"
  />
</template>

<script setup lang="ts">
  import type { SearchChangeParams, SearchFormItem } from '@/types'

  interface Emits {
    (e: 'search', params: Record<string, any>): void
    (e: 'reset'): void
  }

  const props = defineProps<{
    filter: Record<string, any>
  }>()

  const emit = defineEmits<Emits>()

  const searchFormState = ref({ ...props.filter })

  watch(
    () => props.filter,
    (newFilter) => {
      searchFormState.value = { ...newFilter }
    },
    { deep: true, immediate: true }
  )

  // 重置表单
  const handleReset = () => {
    searchFormState.value = { ...props.filter }
    emit('reset')
  }

  // 搜索处理
  const handleSearch = () => {
    console.log('搜索参数:', searchFormState.value)
    emit('search', searchFormState.value)
  }

  const handleFormChange = (params: SearchChangeParams): void => {
    console.log('表单项变更:', params)
  }

  // --- 表单配置项 ---
  const formItems: SearchFormItem[] = [
    {
      label: '用户名称',
      prop: 'userName',
      type: 'input',
      config: {
        clearable: true
      },
      onChange: handleFormChange
    },
    {
      label: '手机号码',
      prop: 'phonenumber',
      type: 'input',
      config: {
        clearable: true
      },
      onChange: handleFormChange
    },
    // {
    //   label: '邮箱',
    //   prop: 'email',
    //   type: 'input',
    //   config: {
    //     clearable: true
    //   },
    //   onChange: handleFormChange
    // },
    {
      prop: 'daterange',
      label: '创建时间',
      type: 'daterange',
      config: {
        type: 'daterange',
        startPlaceholder: '开始日期',
        endPlaceholder: '结束日期'
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
