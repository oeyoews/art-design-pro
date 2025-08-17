<!-- 用户搜索栏 -->
<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    :rules="rules"
    @reset="handleReset"
    @search="handleSearch"
  >
  </ArtSearchBar>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, h } from 'vue'

  interface Props {
    modelValue: Record<string, any>
  }
  interface Emits {
    (e: 'update:modelValue', value: Record<string, any>): void
    (e: 'search', params: Record<string, any>): void
    (e: 'reset'): void
  }
  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 表单数据双向绑定
  const searchBarRef = ref()
  const formData = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  // 校验规则
  const rules = {
    // name: [{ required: true, message: '请输入用户名', trigger: 'blur' }]
  }

  // 表单配置
  const formItems = computed(() => [
  {
      label: '用户名称',
      key: 'userName',
      type: 'input',
      clearable: true
    },
    {
      label: '手机号码',
      key: 'phonenumber',
      type: 'input',
      clearable: true,
      props: {
        // placeholder: "",
      }
    },
    {
      label: '创建时间',
      key: 'createTime',
      type: 'daterange',
      props: {
        type: 'daterange',
        startPlaceholder: '开始日期',
        endPlaceholder: '结束日期'
      }
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      props: {
        options: [
          { label: '正常', value: '0' },
          { label: '禁用', value: '1' }
        ],
      }
    }
  ])

  // 事件
  function handleReset() {
    emit('reset')
  }

  async function handleSearch() {
    await searchBarRef.value.validate()
    emit('search', formData.value)
  }
</script>
