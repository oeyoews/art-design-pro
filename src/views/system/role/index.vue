<!-- 角色管理 -->
<template>
  <div class="user-page art-full-height">
    <!-- 搜索栏 -->
    <Search v-model="searchForm" @search="handleSearch" @reset="resetSearchParams" />

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" @refresh="refreshData">
        <template #left>
          <ElButton @click="showDialog('add')">新增角色</ElButton>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>

      <!-- 弹窗 -->
      <Dialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :user-data="currentUserData"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { ElMessageBox, ElMessage, ElTag } from 'element-plus'
  import { useTable } from '@/composables/useTable'
  import * as rolesApi from '@/api/system/rolesApi'
  import Search from './modules/search.vue'
  import Dialog from './modules/dialog.vue'
  import { USER_STATUS_CONFIG } from '@/utils/constants/system'

  defineOptions({ name: 'User' })

  type RoleListItem = SystemApi.Role.RoleListItem
  const { getRole, listRole, delRole } = rolesApi

  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentUserData = ref<Partial<RoleListItem>>({})

  // 选中行
  const selectedRows = ref<RoleListItem[]>([])

  // 表单搜索初始值
  const searchForm = ref({
    // roleName: null,
    // status: null,
    // phonenumber: null,
  })

  /**
   * 获取用户状态配置
   */
  const getUserStatusConfig = (status: string) => {
    return (
      USER_STATUS_CONFIG[Number(status) as keyof typeof USER_STATUS_CONFIG] || {
        type: 'info' as const,
        text: ''
      }
    )
  }

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getData,
    searchParams,
    handleSizeChange,
    handleCurrentChange,
    resetSearchParams,
    refreshData
  } = useTable<RoleListItem>({
    // 核心配置
    core: {
      apiFn: listRole,
      apiParams: {
        current: 1,
        size: 20,
        ...searchForm.value,
        pageNum: 1,
        pageSize: 20
      },
      excludeParams: ['daterange'],
      // 自定义分页字段映射，同时需要在 apiParams 中配置字段名
      paginationKey: {
        current: 'pageNum',
        size: 'pageSize'
      },
      columnsFactory: () => [
        // { type:"selection" }, // 序号
        { prop: 'roleId', width: 80, label: '角色编号' }, // 序号
        { prop: 'roleName', label: '角色名称' },
        { prop: 'roleKey', label: '权限字符' },
        { prop: 'roleSort', label: '显示顺序' },
        {
          prop: 'status',
          label: '状态',
          formatter: (row) => {
            const statusConfig = getUserStatusConfig(row.status)
            return h(ElTag, { type: statusConfig.type }, () => statusConfig.text)
          }
        },
        {
          prop: 'createTime',
          label: '创建时间'
          // sortable: true
        },
        {
          prop: 'operation',
          label: '操作',
          width: 120,
          fixed: 'right', // 固定列
          formatter: (row) =>
            // 禁止管理员修改自身数据
            !row.admin &&
            h('div', [
              h(ArtButtonTable, {
                type: 'edit',
                onClick: () => showDialog('edit', row)
              }),
              h(ArtButtonTable, {
                type: 'delete',
                onClick: () => deleteUser(row)
              })
            ])
        }
      ]
    },
  })

  /**
   * 搜索处理
   * @param params 参数
   */
  const handleSearch = (params: Record<string, any>) => {
    // 处理日期区间参数，把 daterange 转换为 startTime 和 endTime
    const { daterange, ...filtersParams } = params
    const [startTime, endTime] = Array.isArray(daterange) ? daterange : [null, null]
    // 搜索参数赋值
    Object.assign(searchParams, { ...filtersParams, startTime, endTime })
    getData()
  }

  /**
   * 显示用户弹窗
   */
  const showDialog = (type: Form.DialogType, row?: RoleListItem): void => {
    console.log('打开弹窗:', { type, row })
    dialogType.value = type
    currentUserData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  /**
   * 删除用户
   */
  const deleteUser = (row: RoleListItem): void => {
    console.log('删除用户:', row)
    ElMessageBox.confirm(`确定要删除吗？`, '删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(() => {
      delRole(row.roleId).then(() => {
        ElMessage.success('注销成功')
        refreshData()
      })
    })
  }

  /**
   * 处理弹窗提交事件
   */
  const handleDialogSubmit = async () => {
    try {
      dialogVisible.value = false
      currentUserData.value = {}
      refreshData();
    } catch (error) {
      console.error('提交失败:', error)
    }
  }

  /**
   * 处理表格行选择变化
   */
  const handleSelectionChange = (selection: RoleListItem[]): void => {
    selectedRows.value = selection
    console.log('选中行数据:', selectedRows.value)
  }
</script>

<style lang="scss" scoped>
  .user-page {
    :deep(.user) {
      .avatar {
        width: 24px;
        height: 24px;
        border-radius: 50%;
      }

      > div {
        margin-left: 10px;

        .user-name {
          font-weight: 500;
          color: var(--art-text-gray-800);
        }
      }
    }
  }
</style>
