<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="clearfix">
        <span>{{ $t('agent.create') }}</span>
        <el-button
          style="float: right; padding: 3px 0"
          type="text"
          @click="goBack"
        >
          {{ $t('common.back') }}
        </el-button>
      </div>

      <el-form
        ref="agentForm"
        :model="agentForm"
        :rules="rules"
        label-width="120px"
        class="agent-form"
      >
        <!-- 基本信息 -->
        <el-divider content-position="left">{{ $t('user.basicInfo') }}</el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('agent.agentName')" prop="agentName">
              <el-input
                v-model="agentForm.agentName"
                :placeholder="$t('agent.pleaseEnterAgentName')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('agent.loginAccount')" prop="loginAccount">
              <el-input
                v-model="agentForm.loginAccount"
                :placeholder="$t('agent.pleaseEnterLoginAccount')"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('agent.loginPassword')" prop="loginPassword">
              <el-input
                v-model="agentForm.loginPassword"
                type="password"
                :placeholder="$t('agent.pleaseEnterLoginPassword')"
                show-password
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('agent.level')" prop="level">
              <el-select
                v-model="agentForm.level"
                :placeholder="$t('agent.pleaseSelectLevel')"
                style="width: 100%"
              >
                <el-option
                  v-for="level in levelOptions"
                  :key="level.value"
                  :label="level.label"
                  :value="level.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('agent.commission')" prop="commission">
              <el-input-number
                v-model="agentForm.commission"
                :min="0"
                :max="100"
                :precision="2"
                style="width: 100%"
                controls-position="right"
              />
              <span style="margin-left: 10px;">%</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('user.email')" prop="email">
              <el-input
                v-model="agentForm.email"
                :placeholder="$t('user.pleaseEnterEmail')"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item :label="$t('user.remark')" prop="remark">
          <el-input
            v-model="agentForm.remark"
            :placeholder="$t('user.remark')"
            type="textarea"
            :rows="3"
          />
        </el-form-item>

        <!-- 操作按钮 -->
        <el-form-item>
          <el-button
            type="primary"
            :loading="submitLoading"
            @click="submitForm"
          >
            {{ $t('common.save') }}
          </el-button>
          <el-button @click="resetForm">
            {{ $t('common.reset') }}
          </el-button>
          <el-button @click="goBack">
            {{ $t('common.cancel') }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import i18nMixin from '@/mixins/i18n'
import request from '@/utils/request'

export default {
  name: 'CreateAgent',
  mixins: [i18nMixin],
  data() {
    // 登录账号验证
    const validateLoginAccount = (rule, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('agent.pleaseEnterLoginAccount')))
      } else if (value.length < 3) {
        callback(new Error('登录账号至少3个字符'))
      } else {
        callback()
      }
    }

    // 密码验证
    const validatePassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('agent.pleaseEnterLoginPassword')))
      } else if (value.length < 6) {
        callback(new Error('密码至少6个字符'))
      } else {
        callback()
      }
    }

    // 邮箱验证
    const validateEmail = (rule, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('user.pleaseEnterEmail')))
      } else {
        const emailReg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
        if (!emailReg.test(value)) {
          callback(new Error(this.$t('user.invalidEmail')))
        } else {
          callback()
        }
      }
    }

    return {
      agentForm: {
        agentName: '',
        loginAccount: '',
        loginPassword: '',
        level: 1,
        commission: 10.0,
        email: '',
        remark: ''
      },
      levelOptions: [
        { value: 1, label: '一级代理' },
        { value: 2, label: '二级代理' },
        { value: 3, label: '三级代理' }
      ],
      rules: {
        agentName: [{ required: true, message: this.$t('agent.pleaseEnterAgentName'), trigger: 'blur' }],
        loginAccount: [{ required: true, validator: validateLoginAccount, trigger: 'blur' }],
        loginPassword: [{ required: true, validator: validatePassword, trigger: 'blur' }],
        level: [{ required: true, message: this.$t('agent.pleaseSelectLevel'), trigger: 'change' }],
        commission: [{ required: true, message: this.$t('agent.pleaseEnterCommission'), trigger: 'blur' }],
        email: [{ required: true, validator: validateEmail, trigger: 'blur' }]
      },
      submitLoading: false
    }
  },
  methods: {
    submitForm() {
      this.$refs.agentForm.validate(async(valid) => {
        if (valid) {
          this.submitLoading = true
          console.log('📝 提交代理表单...', this.agentForm)

          try {
            // 优先尝试保存到数据库
            const agentData = {
              agent_name: this.agentForm.agentName,
              login_account: this.agentForm.loginAccount,
              login_password: this.agentForm.loginPassword,
              level: this.agentForm.level,
              commission: this.agentForm.commission,
              email: this.agentForm.email,
              remark: this.agentForm.remark,
              status: 1,
              bind_users: 0,
              total_commission: 0,
              create_time: new Date().getTime()
            }

            const response = await request({
              url: '/api/agents',
              method: 'POST',
              data: agentData
            })
            console.log('✅ 代理创建成功:', response.data)

            this.$message({
              type: 'success',
              message: this.$t('agent.createAgentSuccess')
            })

            this.submitLoading = false
            this.$router.replace('/user/agent-list')
          } catch (error) {
            console.error('❌ 数据库保存失败:', error)
            this.$message.error('创建代理失败：' + (error.message || '未知错误'))
            this.submitLoading = false
          }
        } else {
          return false
        }
      })
    },
    resetForm() {
      this.$refs.agentForm.resetFields()
    },
    goBack() {
      this.$router.go(-1)
    }
  }
}
</script>

<style lang="scss" scoped>
.agent-form {
  max-width: 800px;
  margin: 0 auto;
}
</style>
