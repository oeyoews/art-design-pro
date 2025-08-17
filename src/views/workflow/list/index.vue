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

        <template #environment="{ row }">
          <ElTag :type="getEnvText(row.environment).type" effect="light">
            {{ getEnvText(row.environment).text }}
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
  import { columns as columnList} from './columns'
  import { ref, computed, watch, nextTick } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Plus, Delete, Edit, Search, Refresh, QuestionFilled } from '@element-plus/icons-vue'
  import { useTable } from '@/composables/useTable'
  import { UserService } from '@/api/system/usersApi'
  import { searchItems } from './search'

  defineOptions({ name: 'WorkflowList' })

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

  const defaultObj = {
    type: "primary", text:""
  }

  const getUserStatusConfig = (status: string) => {
    // @ts-ignore
    return WORKFLOW_STATUS_CONFIG[status] || defaultObj;
  }

  const ENV_DICT = {
    'dev': { type: 'danger', text: '开发' },
    'test': { type: 'primary', text: '测试' },
    'prod': { type: 'success', text: '生产' }
  } as const;

  const getEnvText = (value: string) => {
    // @ts-ignore
    return ENV_DICT[value] || defaultObj;
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

    // 分页相关
    paginationState,
    onPageSizeChange,
    onCurrentPageChange,

    // 搜索相关
    searchState, // 搜索参数
    resetSearch,

    // 数据操作
    searchData,

    // 刷新策略
    refreshAll,
    refreshAfterCreate,
    refreshAfterUpdate,
    refreshAfterRemove,

    // 列配置
    columns,
    columnChecks
  } = useTable<ListItem>({
    // 核心配置
    core: {
      apiFn: (params) => {
        console.log('🚀 API 请求参数:', params)

        return simulateApiError(getUserWorkflowList)(params)
      },
      apiParams: {
        current: 1,
        size: 20,
        pageNum: 1, // 自定义分页字段映射， 默认为 current
        pageSize: 20, // 自定义分页字段映射， 默认为 size
        name: '',
        status: '',
        dateRange: undefined
      },
      // 自定义分页字段映射，同时需要在 apiParams 中配置字段名
      paginationKey: {
        current: 'pageNum',
        size: 'pageSize'
      },
      immediate: true,
      columnsFactory: () => columnList
    },

    // 生命周期钩子
    hooks: {
      onSuccess: (data, response) => {
        console.log('✅ 数据加载成功:', data.length, '条')
        console.log('📊 响应详情:', response)
        // ElMessage.success(`加载 ${data.length} 条数据成功`)
      },
      onError: (error) => {
        console.error('❌ 数据加载失败:', error)
        ElMessage.error(error.message)
      },
      resetFormCallback: () => {
        console.log('🔄 表单已重置')
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
  }

  const handleSearch = () => {
    console.log('搜索参数:', searchFormState.value)
    // 将搜索表单的值应用到 searchState
    Object.assign(searchState, searchFormState.value)
    searchData()
  }

  const handleReset = () => {
    // 重置搜索表单状态
    searchFormState.value = { ...initialSearchState }
    resetSearch()
  }

  const handleRefresh = () => {
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

</script>

<style lang="scss" scoped>
  @use './style.scss'
</style>
