<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
    width="30%"
    align-center
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <ElFormItem label="用户昵称" prop="nickName">
        <ElInput v-model="formData.nickName" />
      </ElFormItem>
      <ElFormItem label="用户名称" prop="userName" v-if="!isEdit">
        <ElInput v-model="formData.userName" />
      </ElFormItem>
      <ElFormItem label="手机号" prop="phonenumber">
        <ElInput v-model="formData.phonenumber" maxlength="11" show-word-limit/>
      </ElFormItem>
      <ElFormItem label="用户密码" prop="password" v-if="!isEdit">
        <ElInput type="password" v-model="formData.password" show-password/>
      </ElFormItem>
      <ElFormItem label="状态" prop="status" >
        <ElRadioGroup v-model="formData.status">
          <ElRadio v-for="(item, key) in USER_STATUS_CONFIG" :key="key" :label="item.text" :value="key">
          </ElRadio>
          <!-- <ElRadio label="0">正常</ElRadio>
          <ElRadio label="1">停用</ElRadio> -->
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem label="用户性别" prop="sex">
        <ElSelect v-model="formData.sex" clearable>
          <ElOption
            v-for="item in sexOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="角色" prop="role">
        <ElSelect v-model="formData.role" multiple>
          <ElOption
            v-for="role in roleList"
            :key="role.roleCode"
            :value="role.roleCode"
            :label="role.roleName"
          />
        </ElSelect>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">提交</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { UserService } from '@/api/system/usersApi'
  import { ROLE_LIST_DATA } from '@/mock/temp/formData'
  import { sexOptions, USER_STATUS_CONFIG } from '@/utils/constants/system'
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage } from 'element-plus'
  const { getUserList, delUser, getUser, addUser, editUser } = UserService

  interface Props {
    visible: boolean
    type: string
    userData?: any
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 角色列表数据
  const roleList = ref(ROLE_LIST_DATA)

  // 对话框显示控制
  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const dialogType = computed(() => props.type)

  // 表单实例
  const formRef = ref<FormInstance>()
  const isEdit = ref(false);

  const defaultFormValues = {
    nickName: '',
    userName: '',
    phonenumber: '',
    status: '0', // 用户账号状态
    sex: '0',
    role: [] as string[],
    password: 123456
  }

  // 表单数据
  const formData = reactive({ ...defaultFormValues })

  // 表单验证规则
  const rules: FormRules = {
    userName: [
      { required: true, message: '请输入用户名称', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    nickName: [
      { required: true, message: '请输入用户昵称', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    phonenumber: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入初始密码', trigger: 'blur' },
    ]
    // sex: [{ required: true, message: '请选择性别', trigger: 'blur' }]
    // role: [{ required: true, message: '请选择角色', trigger: 'blur' }]
  }

  // 初始化表单数据
  const initFormData = () => {
    isEdit.value = props.type === 'edit' && props.userData?.userId;
    const row = props.userData

    // 编辑：请求接口获取表单数据
    if (isEdit.value) {
      getUser(row.userId).then((res) => {
        Object.assign(formData, res.data)
      })
    } else {
    // 新增：重置表单数据
      Object.assign(formData, defaultFormValues)
    }
  }

  // 统一监听对话框状态变化
  watch(
    () => [props.visible, props.type, props.userData],
    ([visible]) => {
      if (visible) {
        initFormData()
        nextTick(() => {
          formRef.value?.clearValidate()
        })
      }
    },
    { immediate: true }
  )

  // 提交表单
  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate((valid) => {
      if (valid) {
        const action = isEdit.value ? editUser : addUser;
        const tipText  = isEdit.value ? '更新用户信息成功' : '新增用户成功'

        action(formData).then(() => {
          ElMessage.success(tipText)
          dialogVisible.value = false
          emit('submit')
        })
      }
    })
  }
</script>
