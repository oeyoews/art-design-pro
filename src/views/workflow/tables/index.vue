<!-- 高级表格能力展示 -->
<!-- 实际开发中根据需求选择使用哪些功能，可参考功能示例下面的最小化示例进行开发 -->
<template>
  <div class="advanced-table-demo art-full-height">
    <!-- 搜索区域 -->
    <ArtSearchBar
      v-model:filter="searchFormState"
      :items="searchItems"
      :is-expand="false"
      :show-expand="true"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 表格区域 -->
    <ElCard class="art-table-card" shadow="never" style="margin-top: 0">
      <!-- <template #header>
        <div class="table-header-wrapper">
          <h4>用户数据表格</h4>
          <div class="table-info">
            <ElTag v-if="hasError" type="danger">{{ hasError.message }}</ElTag>
            <ElTag v-else-if="isLoading" type="warning">加载中...</ElTag>
            <ElTag v-else type="success">{{ tableData.length }} 条数据</ElTag>
          </div>
        </div>
      </template> -->

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
          showSummary: tableConfig.showSummary,
          summaryMethod: handleSummaryMethod,
          sumText: '合计'
        }"
        :layout="{ marginTop: 16, showIndex: false }"
        @row:selection-change="handleSelectionChange"
        @row:click="handleRowClick"
        @row:dblclick="handleRowDblclick"
        @row:contextmenu="handleRowContextmenu"
        @cell:click="handleCellClick"
        @cell:dblclick="handleCellDblclick"
        @header:click="handleHeaderClick"
        @sort:change="handleSortChange"
        @pagination:size-change="onPageSizeChange"
        @pagination:current-change="onCurrentPageChange"
      >
        <!-- 用户信息列 -->
        <template #avatar="{ row }">
          <div class="user-info">
            <ElAvatar :src="row.avatar" :size="40" />
            <div class="user-details">
              <p class="user-name">{{ row.userName }}</p>
              <p class="user-email">{{ row.userEmail }}</p>
            </div>
          </div>
        </template>

        <!-- 自定义用户信息表头 -->
        <template #avatar-header="{ column }">
          <div style="display: flex; gap: 5px; align-items: center">
            <span>{{ column.label }}</span>
            <ElTooltip content="包含头像、姓名和邮箱" placement="top">
              <ElIcon class="help-icon"><QuestionFilled /></ElIcon>
            </ElTooltip>
          </div>
        </template>

        <!-- 状态列 -->
        <template #status="{ row }">
          <ElTag :type="getUserStatusConfig(row.status).type" effect="light">
            {{ getUserStatusConfig(row.status).text }}
          </ElTag>
        </template>

        <!-- 评分列 -->
        <template #score="{ row }">
          <ElRate v-model="row.score" disabled size="small" />
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

        <!-- 自定义手机号表头 -->
        <template #userPhone-header="{ column }">
          <ElPopover placement="bottom" :width="200" trigger="hover">
            <template #reference>
              <div class="custom-header">
                <span>{{ column.label }}</span>
                <ElIcon><Search /></ElIcon>
              </div>
            </template>
            <ElInput
              v-model="phoneSearch"
              placeholder="搜索手机号"
              size="small"
              @input="handlePhoneSearch"
            >
              <template #prefix>
                <ElIcon><Search /></ElIcon>
              </template>
            </ElInput>
          </ElPopover>
        </template>
      </ArtTable>
    </ElCard>

  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, nextTick } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Plus, Delete, Edit, Search, Refresh, QuestionFilled } from '@element-plus/icons-vue'
  import { useTable, CacheInvalidationStrategy } from '@/composables/useTable'
  import { UserService } from '@/api/usersApi'
  import { ACCOUNT_TABLE_DATA } from '@/mock/temp/formData'
  import type { SearchFormItem } from '@/types'

  defineOptions({ name: 'AdvancedTableDemo' })

  type UserListItem = Api.User.UserListItem

  const { getUserList } = UserService

  // 选中的行
  const selectedRows = ref<UserListItem[]>([])

  // 表格实例引用
  const tableRef = ref()

  // 调试面板状态
  const showDebugPanel = ref(false)
  const debugActiveNames = ref(['cache', 'request', 'logs'])
  const enableErrorDemo = ref(false)

  // 缓存调试状态
  const cacheDebugLogs = ref<string[]>([])
  const requestParams = ref<any>({
    current: 1,
    size: 20,
    name: '',
    phone: '',
    status: '',
    department: '',
    dateRange: undefined
  })

  // 缓存键信息
  const cacheKeys = ref<string[]>([])

  // 手机号搜索
  const phoneSearch = ref('')

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
    phone: '',
    status: '',
    department: '',
    dateRange: undefined
  }

  // 搜索表单状态
  const searchFormState = ref({ ...initialSearchState })

  // 用户状态配置
  const USER_STATUS_CONFIG = {
    '1': { type: 'success' as const, text: '在线' },
    '2': { type: 'info' as const, text: '离线' },
    '3': { type: 'warning' as const, text: '异常' },
    '4': { type: 'danger' as const, text: '注销' }
  } as const

  // 搜索表单配置
  // 日期选择器有多种类型，具体可以查看 src/components/core/forms/art-search-bar/widget/art-search-date/README.md 文档
  const searchItems: SearchFormItem[] = [
    {
      prop: 'name',
      label: '用户名',
      type: 'input',
      config: {
        placeholder: '请输入用户名'
      }
    },
    {
      prop: 'phone',
      label: '手机号',
      type: 'input',
      config: {
        placeholder: '请输入手机号'
      }
    },
    {
      prop: 'status',
      label: '状态',
      type: 'select',
      options: [
        { label: '全部', value: '' },
        { label: '在线', value: '1' },
        { label: '离线', value: '2' },
        { label: '异常', value: '3' },
        { label: '注销', value: '4' }
      ]
    },
    {
      prop: 'department',
      label: '部门',
      type: 'select',
      options: [
        { label: '全部', value: '' },
        { label: '技术部', value: '技术部' },
        { label: '产品部', value: '产品部' },
        { label: '运营部', value: '运营部' },
        { label: '市场部', value: '市场部' },
        { label: '设计部', value: '设计部' }
      ]
    },
    {
      prop: 'dateRange',
      label: '注册时间',
      type: 'daterange',
      config: {
        type: 'daterange',
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD'
      }
    }
  ]

  // 导出列配置
  const exportColumns = computed(() => ({
    userName: { title: '用户名', width: 15 },
    userEmail: { title: '邮箱', width: 20 },
    userPhone: { title: '手机号', width: 15 },
    userGender: { title: '性别', width: 10 },
    department: { title: '部门', width: 15 },
    status: {
      title: '状态',
      width: 10,
      formatter: (value: string) => getUserStatusConfig(value).text
    }
  }))

  // 获取用户状态配置
  const getUserStatusConfig = (status: string) => {
    return (
      USER_STATUS_CONFIG[status as keyof typeof USER_STATUS_CONFIG] || {
        type: 'info' as const,
        text: '未知'
      }
    )
  }

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
  } = useTable<UserListItem>({
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

        return simulateApiError(getUserList)(params)
      },
      apiParams: {
        current: 1,
        size: 20,
        // pageNum: 1, // 自定义分页字段映射， 默认为 current
        // pageSize: 20, // 自定义分页字段映射， 默认为 size
        name: '',
        phone: '',
        status: '',
        department: '',
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
        // { type: 'index', width: 60, label: '序号' }, // 本地序号列
        { type: 'globalIndex', width: 60, label: '序号' }, // 全局序号列
        {
          prop: 'avatar',
          label: '用户信息',
          minWidth: 200,
          useSlot: true,
          useHeaderSlot: true,
          sortable: false
        },
        {
          prop: 'userGender',
          label: '性别',
          sortable: true,
          formatter: (row) => row.userGender || '未知'
        },
        {
          prop: 'userPhone',
          label: '手机号',
          useHeaderSlot: true,
          sortable: true
        },
        {
          prop: 'department',
          label: '部门',
          sortable: true
        },
        {
          prop: 'score',
          label: '评分',
          useSlot: true,
          sortable: true
        },
        {
          prop: 'status',
          label: '状态',
          useSlot: true,
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
      dataTransformer: (records: any) => {
        if (!Array.isArray(records)) return []

        return records.map((item: any, index: number) => ({
          ...item,
          avatar: ACCOUNT_TABLE_DATA[index % ACCOUNT_TABLE_DATA.length].avatar,
          department: ['技术部', '产品部', '运营部', '市场部', '设计部'][
            Math.floor(Math.random() * 5)
          ],
          score: Math.floor(Math.random() * 5) + 1,
          status: ['1', '2', '3', '4'][Math.floor(Math.random() * 4)]
        }))
      }
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
  const handleSelectionChange = (selection: UserListItem[]) => {
    selectedRows.value = selection
    logEvent('选择变更', `已选择 ${selection.length} 行数据`)
  }

  const handleRowClick = (row: UserListItem) => {
    console.log('行点击:', row)
    logEvent('行点击', `点击了用户: ${row.userName}`)
  }

  const handleRowDblclick = (row: UserListItem) => {
    console.log('行双击:', row)
    logEvent('行双击', `双击了用户: ${row.userName}`)
    ElMessage.info(`双击查看 ${row.userName} 的详细信息`)
  }

  const handleRowContextmenu = (row: UserListItem) => {
    console.log('行右键菜单:', row)
    logEvent('行右键', `右键点击用户: ${row.userName}`)
    ElMessage.info(`右键菜单 - ${row.userName}`)
  }

  const handleCellClick = (row: UserListItem, column: any) => {
    console.log('单元格点击:', row, column)
    logEvent('单元格点击', `点击了 ${row.userName} 的 ${column.label} 列`)
  }

  const handleCellDblclick = (row: UserListItem, column: any) => {
    console.log('单元格双击:', row, column)
    logEvent('单元格双击', `双击了 ${row.userName} 的 ${column.label} 列`)
  }

  const handleHeaderClick = (column: any) => {
    console.log('表头点击:', column)
    logEvent('表头点击', `点击了 ${column.label} 列表头`)
  }

  const handleSortChange = (sortInfo: any) => {
    console.log('排序事件:', sortInfo)
    console.log('排序字段:', sortInfo.prop)
    console.log('排序方向:', sortInfo.order)
    logEvent('排序变更', `字段: ${sortInfo.prop}, 方向: ${sortInfo.order}`)
  }

  // 自定义合计方法
  const handleSummaryMethod = ({ columns, data }: { columns: any[]; data: any[] }) => {
    const sums: string[] = []
    columns.forEach((column, index) => {
      if (index === 0) {
        sums[index] = '合计'
        return
      }
      if (column.property === 'score') {
        const scores = data.map((item) => Number(item.score || 0))
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
        sums[index] = `平均: ${avgScore.toFixed(1)}`
      } else if (column.property === 'userPhone') {
        sums[index] = `${data.length} 个用户`
      } else {
        sums[index] = ''
      }
    })
    return sums
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

  // 获取事件类型样式
  const getEventType = (type: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
    const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
      行点击: 'primary',
      行双击: 'success',
      行右键: 'warning',
      单元格点击: 'info',
      单元格双击: 'success',
      表头点击: 'primary',
      选择变更: 'warning',
      排序变更: 'success'
    }
    return typeMap[type] || 'info'
  }

  // 演示功能方法
  const toggleEventDemo = () => {
    eventDemoEnabled.value = !eventDemoEnabled.value
    if (eventDemoEnabled.value) {
      ElMessage.success('事件监听已开启，请与表格交互查看效果')
    } else {
      ElMessage.info('事件监听已关闭')
    }
  }

  const clearEventLogs = () => {
    eventLogs.value = []
    ElMessage.info('事件日志已清空')
  }

  const handleScrollToTop = () => {
    tableRef.value?.scrollToTop()
    ElMessage.info('已滚动到顶部')
  }

  const handleScrollToPosition = () => {
    tableRef.value?.scrollToPosition(200)
    ElMessage.info('已滚动到指定位置')
  }

  const handleToggleSelection = () => {
    if (selectedRows.value.length === 0) {
      tableRef.value?.toggleAllSelection()
      ElMessage.info('已全选')
    } else {
      tableRef.value?.clearSelection()
      ElMessage.info('已取消全选')
    }
  }

  // 自定义功能相关方法
  const handleRefreshLayout = () => {
    tableRef.value?.doLayout()
    ElMessage.success('已刷新表格布局')
  }

  const handleGetTableInfo = () => {
    const info = {
      数据条数: tableData.value.length,
      选中条数: selectedRows.value.length,
      列数: columns?.value?.length ?? 0,
      当前页: paginationState.current,
      每页大小: paginationState.size,
      总条数: paginationState.total
    }

    console.log('表格信息:', info)
    ElMessage.info(`表格信息已输出到控制台，当前 ${info.数据条数} 条数据`)
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

  const handlePhoneSearch = (value: string) => {
    searchFormState.value.phone = value
    searchState.phone = value
    requestParams.value = { ...searchState, phone: value }
    addCacheLog(`📱 手机号搜索: ${value}`)
    searchDataDebounced()
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

  const handleEdit = (row: UserListItem) => {
    ElMessage.success(`编辑用户 ${row.userName} 成功`)
    setTimeout(() => {
      refreshAfterUpdate()
    }, 1000)
  }

  const handleDelete = async (row: UserListItem) => {
    try {
      await ElMessageBox.confirm(`确定要删除用户 ${row.userName} 吗？`, '警告', {
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

  const handleView = (row: UserListItem) => {
    ElMessage.info(`查看用户 ${row.userName}`)
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

  // 导入导出
  const handleExportSuccess = (filename: string, count: number) => {
    ElMessage.success(`导出 ${count} 条数据成功`)
  }

  const handleImportSuccess = (data: any[]) => {
    ElMessage.success(`导入 ${data.length} 条数据成功`)
    refreshAfterCreate()
  }

  const handleImportError = (error: Error) => {
    ElMessage.error(`导入失败：${error.message}`)
  }

  // 调试功能
  const handleClearCache = () => {
    invalidateCache(CacheInvalidationStrategy.CLEAR_ALL, '手动清空')
    cacheKeys.value = [] // 清空缓存键列表
    addCacheLog('🗑️ 手动清空所有缓存')
    ElMessage.success('缓存已清空')
  }

  const handleCleanExpiredCache = () => {
    const count = clearExpiredCache()
    addCacheLog(`🧹 清理了 ${count} 条过期缓存`)
    ElMessage.info(`清理了 ${count} 条过期缓存`)
  }

  const handleCancelRequest = () => {
    abortRequest()
    addCacheLog('❌ 取消当前请求')
    ElMessage.info('请求已取消')
  }

  const handleClearData = () => {
    clearAllData()
    addCacheLog('🗑️ 清空所有数据')
    ElMessage.info('数据已清空')
  }

  const handleTestCache = () => {
    // 模拟快速切换页面来测试缓存
    const testPages = [1, 2, 3, 2, 1] // 测试页面序列

    ElMessage.info('开始缓存测试...')
    addCacheLog('🧪 开始缓存测试')

    let index = 0
    const testInterval = setInterval(() => {
      if (index >= testPages.length) {
        clearInterval(testInterval)
        addCacheLog('✅ 缓存测试完成')
        ElMessage.success('缓存测试完成！观察缓存统计的变化')
        return
      }

      const page = testPages[index]
      addCacheLog(`📄 测试切换到第 ${page} 页`)
      // 更新请求参数
      requestParams.value = { ...requestParams.value, current: page }

      // 切换到测试页面
      onCurrentPageChange(page)
      index++
    }, 1000)
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

  // 强制刷新缓存信息
  const forceRefreshCacheInfo = () => {
    // 模拟更新缓存键信息
    const currentStats = cacheStatistics.value
    addCacheLog(`🔄 缓存信息刷新: ${currentStats.total} 条缓存`)

    // 重置缓存键列表，因为我们无法直接访问缓存内容
    if (currentStats.total === 0) {
      cacheKeys.value = []
    }

    // 触发缓存统计的重新计算
    nextTick(() => {
      console.log('当前缓存统计:', cacheStatistics.value)
    })
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
  .advanced-table-demo {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-bottom: 20px;

    .intro-card {
      .intro-header {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;
        justify-content: space-between;

        h3 {
          margin: 0;
        }

        .intro-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
      }

      .intro-content {
        .intro-text {
          margin: 0 0 16px;
          line-height: 1.6;
          color: var(--el-text-color-regular);
        }

        .debug-panel {
          margin: 16px 0;

          .debug-info {
            display: flex;
            flex-direction: column;
            gap: 8px;

            .stat-item {
              display: flex;
              align-items: center;
              justify-content: space-between;

              .label {
                font-weight: 500;
                color: var(--el-text-color-regular);
              }

              .value {
                font-weight: 600;
                color: var(--el-color-primary);
              }
            }

            .debug-actions {
              display: flex;
              gap: 8px;
              margin-top: 8px;
            }
          }
        }

        .feature-toggles {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-top: 16px;
        }
      }
    }

    .art-table-card {
      flex: 1;

      .table-header-wrapper {
        display: flex;
        align-items: center;
        justify-content: space-between;

        h4 {
          margin: 0;
        }

        .table-info {
          display: flex;
          gap: 8px;
        }
      }

      .toolbar-left {
        display: flex;
        gap: 8px;
        align-items: center;

        .table-actions {
          margin-left: 8px;
        }
      }

      .user-info {
        display: flex;
        gap: 12px;
        align-items: center;

        .user-details {
          .user-name {
            margin: 0;
            font-weight: 500;
            color: var(--el-text-color-primary);
          }

          .user-email {
            margin: 4px 0 0;
            font-size: 12px;
            color: var(--el-text-color-regular);
          }
        }
      }

      .operation-buttons {
        display: flex;
      }

      .custom-header {
        display: flex;
        gap: 4px;
        align-items: center;
        color: var(--el-color-primary);
        cursor: pointer;

        &:hover {
          color: var(--el-color-primary-light-3);
        }
      }
    }

    .advanced-features-card {
      .feature-demo-section {
        display: flex;
        flex-direction: column;
        gap: 24px;

        .demo-group {
          padding: 16px;
          background: var(--el-bg-color-page);
          border: 1px solid var(--el-border-color-lighter);
          border-radius: 8px;

          h5 {
            margin: 0 0 16px;
            font-size: 14px;
            font-weight: 600;
            color: var(--el-text-color-primary);
          }

          .demo-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 12px;

            &:last-child {
              margin-bottom: 0;
            }
          }

          .config-toggles {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            margin-bottom: 12px;

            .el-switch {
              --el-switch-on-color: var(--el-color-primary);
            }
          }

          .event-logs {
            padding: 12px;
            margin-top: 12px;
            background: var(--el-bg-color-page);
            border: 1px solid var(--el-border-color-light);
            border-radius: 6px;

            .log-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 8px;
              font-weight: 500;
              color: var(--el-text-color-regular);
            }

            .log-list {
              display: flex;
              flex-direction: column;
              gap: 4px;
              max-height: 200px;
              overflow-y: auto;

              .log-item {
                display: flex;
                gap: 8px;
                align-items: center;
                padding: 6px 8px;
                font-size: 12px;
                background: var(--el-bg-color);
                border-left: 3px solid var(--el-border-color);
                border-radius: 4px;

                .log-message {
                  flex: 1;
                  color: var(--el-text-color-regular);
                }

                .log-time {
                  font-size: 11px;
                  color: var(--el-text-color-placeholder);
                }
              }
            }
          }

          .performance-info {
            margin-top: 12px;

            .el-alert {
              --el-alert-padding: 12px;
            }
          }
        }
      }
    }

    .refresh-demo-card {
      .refresh-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
    }
  }

  // 响应式设计
  @media (width <= 768px) {
    .advanced-table-demo {
      .intro-card .intro-header {
        flex-direction: column;
        align-items: flex-start;

        .intro-badges {
          width: 100%;
        }
      }

      .art-table-card .toolbar-left {
        flex-direction: column;
        gap: 8px;
        align-items: flex-start;

        .table-actions {
          margin-left: 0;
        }
      }

      .refresh-demo-card .refresh-buttons {
        flex-direction: column;
      }
    }
  }

  .request-params {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .params-display {
      max-height: 200px;
      padding: 8px;
      overflow-y: auto;
      font-size: 12px;
      background: var(--el-bg-color-page);
      border: 1px solid var(--el-border-color-light);
      border-radius: 6px;
    }
  }

  .logs-container {
    max-height: 200px;
    overflow-y: auto;

    .empty-logs {
      padding: 20px;
      text-align: center;
    }

    .log-list {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .log-item {
        padding: 6px 8px;
        font-size: 12px;
        line-height: 1.4;
        background: var(--el-bg-color-page);
        border-left: 3px solid var(--el-border-color);
        border-radius: 4px;

        &.log-success {
          background: rgb(103 194 58 / 10%);
          border-left-color: var(--el-color-success);
        }

        &.log-cache {
          background: rgb(64 158 255 / 10%);
          border-left-color: var(--el-color-primary);
        }

        &.log-error {
          background: rgb(245 108 108 / 10%);
          border-left-color: var(--el-color-danger);
        }
      }
    }
  }
</style>
