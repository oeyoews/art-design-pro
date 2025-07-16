<template>
  <div class="advanced-table-demo art-full-height">
    <!-- 搜索区域 -->
    <ArtSearchBar
      label-width="90"
      v-model:filter="searchFormState"
      :items="searchItems"
      :is-expand="false"
      :show-expand="true"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 表格区域 -->
    <ElCard class="art-table-card" shadow="never" style="margin-top: 0">
      <!-- 表格工具栏 -->
      <!-- fullClass 属性用于设置全屏区域，如果需要设置全屏区域，请使用此属性 -->
      <ArtTableHeader
        v-model:columns="columnChecks"
        @refresh="handleRefresh"
        layout="refresh,size,fullscreen,columns,settings"
        fullClass="art-table-card"
      >
        <template #left>
          <div class="toolbar-left">
            <ElButton type="primary" @click="handleAdd" v-ripple>
              <ElIcon><Plus /></ElIcon>
              新增
            </ElButton>

            <ElButton @click="handleBatchDelete" :disabled="selectedRows.length === 0" v-ripple>
              <ElIcon><Delete /></ElIcon>
              批量删除 ({{ selectedRows.length }})
            </ElButton>
          </div>
        </template>
      </ArtTableHeader>

      <ArtTable
        ref="tableRef"
        :loading="isLoading"
        :pagination="paginationState"
        :data="tableData"
        :columns="columns"
        :table-config="{
          height: computedTableHeight,
          emptyHeight: '360px',
        }"
        :layout="{ marginTop: 16, showIndex: false }"
        @row:selection-change="handleSelectionChange"
        @pagination:size-change="onPageSizeChange"
        @pagination:current-change="onCurrentPageChange"
      >

        <!-- 状态列 -->
        <template #status="{ row }">
          <ElTag :type="getUserStatusConfig(row.status).type" effect="light">
            {{ getUserStatusConfig(row.status).text }}
          </ElTag>
        </template>

        <!-- 操作列 -->
        <template #operation="{ row }">
          <div class="operation-buttons">
            <ArtButtonTable type="view" :row="row" @click="handleView(row)" />
            <ArtButtonTable type="add" :row="row" @click="handleAdd()" />
            <ArtButtonTable type="edit" :row="row" @click="handleEdit(row)" />
            <ArtButtonTable type="delete" :row="row" @click="handleDelete(row)" />
          </div>
        </template>

      </ArtTable>
    </ElCard>

  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, nextTick } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Plus, Delete, Edit, Search, Refresh, QuestionFilled } from '@element-plus/icons-vue'
  import { useTable } from '@/composables/useTable'
  import { UserService } from '@/api/usersApi'
  import type { SearchFormItem } from '@/types'

  defineOptions({ name: 'AdvancedTableDemo' })

  type ListItem = {
    id: number
    name: string
    status: string
    date: string
  }

  const { getUserWorkflowList } = UserService

  // 选中的行
  const selectedRows = ref<ListItem[]>([])

  // 表格实例引用
  const tableRef = ref()

  const enableErrorDemo = ref(false)

  // 缓存调试状态
  const cacheDebugLogs = ref<string[]>([])
  const requestParams = ref<any>({
    current: 1,
    size: 20,
    name: '',
    status: '',
    dateRange: undefined
  })

  // 缓存键信息
  const cacheKeys = ref<string[]>([])

  // 事件演示相关
  const eventDemoEnabled = ref(false)
  const eventLogs = ref<Array<{ type: string; message: string; time: string }>>([])

  // 表格配置演示
  const tableConfig = ref({
    showSummary: false,
    height: '100%',
    fixedHeight: false // 新增：是否固定高度的开关
  })

  // 计算实际的表格高度
  const computedTableHeight = computed(() => {
    return tableConfig.value.fixedHeight ? '500px' : '100%'
  })

  // 定义搜索表单的初始状态
  const initialSearchState = {
    name: '',
    status: '',
    owner: '',
    environment: '',
    dateRange: undefined
  }

  // 搜索表单状态
  const searchFormState = ref({ ...initialSearchState })

  // 工作流状态配置
  const WORKFLOW_STATUS_CONFIG = {
    'running': { type: 'success', text: '运行中' },
    'pending': { type: 'info', text: '等待中' },
    'completed': { type: 'primary', text: '已完成' },
    'failed': { type: 'danger', text: '失败' },
    'stopped': { type: 'warning', text: '已停止' }
  } as const

  const getUserStatusConfig = (status: string) => {
    console.log(status)
    // @ts-ignore
    return WORKFLOW_STATUS_CONFIG[status] || { type: '', text: '' }
  }

  // 搜索表单配置
  const searchItems: SearchFormItem[] = [
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

  // 模拟API错误
  const simulateApiError = (originalFn: any) => {
    return async (params: any) => {
      if (enableErrorDemo.value && Math.random() > 0.7) {
        throw new Error('模拟网络错误：请求超时')
      }
      return originalFn(params)
    }
  }

  // 使用 useTable Hook
  const {
    // 数据相关
    tableData,
    isLoading,
    hasError,
    hasData,

    // 分页相关
    paginationState,
    onPageSizeChange,
    onCurrentPageChange,

    // 搜索相关
    searchState, // 搜索参数
    resetSearch,

    // 数据操作
    searchData,
    searchDataDebounced,

    // 刷新策略
    refreshAll,
    refreshSoft,
    refreshAfterCreate,
    refreshAfterUpdate,
    refreshAfterRemove,

    // 缓存控制
    cacheStatistics,
    invalidateCache,
    clearExpiredCache,

    // 请求控制
    abortRequest,
    clearAllData,

    // 列配置
    columns,
    columnChecks
  } = useTable<ListItem>({
    // 核心配置
    core: {
      apiFn: (params) => {
        // 在API调用前添加调试信息
        const requestKey = JSON.stringify(params)
        console.log('🚀 API 请求参数:', params)
        addCacheLog(`🚀 API 请求: current=${params.current}, size=${params.size}`)
        addCacheLog(`🔑 请求键: ${requestKey.substring(0, 100)}...`)

        // 记录缓存键（这里假设会被缓存）
        updateCacheKeys(requestKey)

        return simulateApiError(getUserWorkflowList)(params)
      },
      apiParams: {
        current: 1,
        size: 20,
        // pageNum: 1, // 自定义分页字段映射， 默认为 current
        // pageSize: 20, // 自定义分页字段映射， 默认为 size
        name: '',
        status: '',
        dateRange: undefined
      },
      // 自定义分页字段映射，同时需要在 apiParams 中配置字段名
      // paginationKey: {
      //   current: 'pageNum',
      //   size: 'pageSize'
      // },
      immediate: true,
      columnsFactory: () => [
        { type: 'selection', width: 50 },
        { type: 'globalIndex', width: 60, label: '序号' },
        {
          prop: 'name',
          label: '工作流名称',
          minWidth: 200,
          sortable: true
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
    },

    // 数据处理
    transform: {
      // dataTransformer: (records: any) => {
        // if (!Array.isArray(records)) return []

        // return records.map((item: any, index: number) => ({
        //   ...item,
        //   avatar: ACCOUNT_TABLE_DATA[index % ACCOUNT_TABLE_DATA.length].avatar,
        //   department: ['技术部', '产品部', '运营部', '市场部', '设计部'][
        //     Math.floor(Math.random() * 5)
        //   ],
        //   score: Math.floor(Math.random() * 5) + 1,
        //   status: ['1', '2', '3', '4'][Math.floor(Math.random() * 4)]
        // }))
      // }
      // 自定义响应适配器，处理后端特殊的返回格式
      // responseAdapter: (data: any) => {
      //   const { list, total, pageNum, pageSize } = data
      //   return {
      //     records: list,
      //     total: total,
      //     current: pageNum,
      //     size: pageSize
      //   }
      // }
    },

    // 性能优化
    performance: {
      enableCache: true,
      cacheTime: 5 * 60 * 1000, // 5分钟
      debounceTime: 300,
      maxCacheSize: 100
    },

    // 生命周期钩子
    hooks: {
      onSuccess: (data, response) => {
        console.log('✅ 数据加载成功:', data.length, '条')
        console.log('📊 响应详情:', response)
        addCacheLog(`✅ 网络请求成功: ${data.length} 条数据`)
        addCacheLog(
          `📝 响应信息: total=${response.total}, current=${response.current}, size=${response.size}`
        )
        ElMessage.success(`加载 ${data.length} 条数据成功`)
      },
      onError: (error) => {
        console.error('❌ 数据加载失败:', error)
        addCacheLog(`❌ 请求失败: ${error.message}`)
        ElMessage.error(error.message)
      },
      onCacheHit: (data, response) => {
        console.log('🎯 缓存命中:', data.length, '条')
        console.log('🔑 缓存来源:', response)
        addCacheLog(
          `🎯 缓存命中: ${data.length} 条数据 (current=${response.current}, size=${response.size})`
        )
        ElMessage.info('数据来自缓存')
      },
      resetFormCallback: () => {
        console.log('🔄 表单已重置')
        addCacheLog('🔄 表单已重置')
      }
    },

    // 调试配置
    debug: {
      enableLog: true,
      logLevel: 'info'
    }
  })

  // 事件处理函数
  const handleSelectionChange = (selection: ListItem[]) => {
    selectedRows.value = selection
    logEvent('选择变更', `已选择 ${selection.length} 行数据`)
  }


  // 事件日志记录
  const logEvent = (type: string, message: string) => {
    if (!eventDemoEnabled.value) return

    const time = new Date().toLocaleTimeString()
    eventLogs.value.unshift({ type, message, time })

    // 限制日志数量
    if (eventLogs.value.length > 20) {
      eventLogs.value = eventLogs.value.slice(0, 20)
    }
  }

  const handleSearch = () => {
    console.log('搜索参数:', searchFormState.value)
    // 将搜索表单的值应用到 searchState
    Object.assign(searchState, searchFormState.value)
    // 更新请求参数显示
    requestParams.value = { ...searchState }
    addCacheLog(`🔍 执行搜索: ${JSON.stringify(searchFormState.value)}`)
    searchData()
  }

  const handleReset = () => {
    addCacheLog('🔄 重置搜索')
    // 重置搜索表单状态
    searchFormState.value = { ...initialSearchState }
    resetSearch()
  }

  const handleRefresh = () => {
    addCacheLog('🔄 手动刷新')
    refreshAll()
  }

  // CRUD 操作
  const handleAdd = () => {
    ElMessage.success('新增用户成功')
    setTimeout(() => {
      refreshAfterCreate()
    }, 1000)
  }

  const handleEdit = (row: ListItem) => {
    ElMessage.success(`编辑用户 ${row.name} 成功`)
    setTimeout(() => {
      refreshAfterUpdate()
    }, 1000)
  }

  const handleDelete = async (row: ListItem) => {
    try {
      await ElMessageBox.confirm(`确定要删除用户 ${row.name} 吗？`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      ElMessage.success('删除成功')
      setTimeout(() => {
        refreshAfterRemove()
      }, 1000)
    } catch {
      ElMessage.info('已取消删除')
    }
  }

  const handleView = (row: ListItem) => {
    ElMessage.info(`查看用户 ${row.name}`)
  }

  const handleBatchDelete = async () => {
    try {
      await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedRows.value.length} 个用户吗？`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      ElMessage.success(`批量删除 ${selectedRows.value.length} 个用户成功`)
      selectedRows.value = []
      setTimeout(() => {
        refreshAfterRemove()
      }, 1000)
    } catch {
      ElMessage.info('已取消删除')
    }
  }


  // 添加缓存调试日志
  const addCacheLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    cacheDebugLogs.value.unshift(`[${timestamp}] ${message}`)
    if (cacheDebugLogs.value.length > 20) {
      cacheDebugLogs.value = cacheDebugLogs.value.slice(0, 20)
    }
  }

  // 更新缓存键列表
  const updateCacheKeys = (key: string, operation: 'add' | 'remove' = 'add') => {
    if (operation === 'add' && !cacheKeys.value.includes(key)) {
      cacheKeys.value.push(key)
      addCacheLog(`🔑 新增缓存键: ${getCacheKeySummary(key)}`)
    } else if (operation === 'remove') {
      const index = cacheKeys.value.indexOf(key)
      if (index > -1) {
        cacheKeys.value.splice(index, 1)
        addCacheLog(`🗑️ 移除缓存键: ${getCacheKeySummary(key)}`)
      }
    }
  }

  // 获取缓存键摘要
  const getCacheKeySummary = (key: string) => {
    try {
      const params = JSON.parse(key)
      return `页码: ${params.current || 1}, 大小: ${params.size || 20}${params.name ? ', 名称: ' + params.name : ''}${params.status ? ', 状态: ' + params.status : ''}`
    } catch {
      return '无效的缓存键'
    }
  }

  // 监听分页和搜索状态变化
  watch(
    () => [paginationState.current, paginationState.size, searchFormState.value],
    ([current, size, search]) => {
      requestParams.value = {
        ...(search as any),
        current,
        size
      }
    },
    { deep: true, immediate: true }
  )
</script>

<style lang="scss" scoped>
  @use './style.scss'
</style>
