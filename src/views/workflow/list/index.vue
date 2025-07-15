<template>
  <div class="console">
    <el-row :gutter="20">
      <el-col :sm="24" :md="12" :lg="10">
        <ActiveUser />
      </el-col>
      <el-col :sm="24" :md="12" :lg="14">
        <SalesOverview />
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :sm="24" :md="24" :lg="12">
        <NewUser />
      </el-col>
      <el-col :sm="24" :md="12" :lg="6">
        <Dynamic />
      </el-col>
      <el-col :sm="24" :md="12" :lg="6">
        <TodoList />
      </el-col>
    </el-row>

    <AboutProject />
  </div>
</template>

<script setup lang="ts">
  import { useCommon } from '@/composables/useCommon'

  defineOptions({ name: 'workflow-list' })

  useCommon().scrollToTop()
</script>

<style lang="scss" scoped>
</style>
