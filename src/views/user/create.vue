<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="clearfix">
        <span>{{ $t('user.create') }}</span>
        <el-button
          style="float: right; padding: 3px 0"
          type="text"
          @click="goBack"
        >
          {{ $t('common.back') }}
        </el-button>
      </div>

      <el-form
        ref="userForm"
        :model="userForm"
        :rules="rules"
        label-width="120px"
        class="user-form"
      >
        <!-- 基本信息 -->
        <el-divider content-position="left">{{ $t('user.basicInfo') }}</el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('user.agentName')" prop="agentId">
              <el-select
                v-model="userForm.agentId"
                :placeholder="$t('user.pleaseSelectAgent')"
                style="width: 100%"
                filterable
              >
                <el-option
                  v-for="agent in agentOptions"
                  :key="agent.value"
                  :label="agent.label"
                  :value="agent.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('user.customerName')" prop="customerName">
              <el-input
                v-model="userForm.customerName"
                :placeholder="$t('user.pleaseEnterCustomerName')"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('user.loginAccount')" prop="loginAccount">
              <el-input
                v-model="userForm.loginAccount"
                :placeholder="$t('user.pleaseEnterLoginAccount')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('user.loginPassword')" prop="loginPassword">
              <el-input
                v-model="userForm.loginPassword"
                type="password"
                :placeholder="$t('user.pleaseEnterLoginPassword')"
                show-password
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('user.salePriceRate')" prop="salePriceRate">
              <el-input-number
                v-model="userForm.salePriceRate"
                :placeholder="$t('user.pleaseEnterSalePriceRate')"
                :precision="2"
                :min="0"
                :step="0.1"
                style="width: 100%"
              />
              <div class="field-note">{{ $t('user.salePriceRateNote') }}</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('user.email')" prop="email">
              <el-input
                v-model="userForm.email"
                :placeholder="$t('user.pleaseEnterEmail')"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 账户信息 -->
        <el-divider content-position="left">{{ $t('user.accountInfo') }}</el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('user.accountBalance')" prop="accountBalance">
              <el-input-number
                v-model="userForm.accountBalance"
                :placeholder="$t('user.accountBalance')"
                :precision="5"
                :min="0"
                :step="1"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('user.overdraftAmount')" prop="overdraftAmount">
              <el-input-number
                v-model="userForm.overdraftAmount"
                :placeholder="$t('user.overdraftAmount')"
                :precision="5"
                :min="0"
                :step="1"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 其他信息 -->
        <el-divider content-position="left">{{ $t('user.contactInfo') }}</el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('user.status')" prop="status">
              <el-radio-group v-model="userForm.status">
                <el-radio :label="1">{{ $t('user.active') }}</el-radio>
                <el-radio :label="0">{{ $t('user.inactive') }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item :label="$t('user.remark')" prop="remark">
          <el-input
            v-model="userForm.remark"
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
import cacheManager from '@/utils/cache-helper'
import { CACHE_KEYS } from '@/utils/cache-helper'

export default {
  name: 'CreateUser',
  mixins: [i18nMixin],
  data() {
    // 登录账号验证
    const validateLoginAccount = (rule, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('user.pleaseEnterLoginAccount')))
      } else if (value.length < 3) {
        callback(new Error('登录账号至少3个字符'))
      } else {
        callback()
      }
    }

    // 密码验证
    const validatePassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('user.pleaseEnterLoginPassword')))
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
      userForm: {
        agentId: '',
        customerName: '',
        loginAccount: '',
        loginPassword: '',
        salePriceRate: 1,
        accountBalance: 0,
        overdraftAmount: 0,
        email: '',
        status: 1,
        remark: ''
      },
      agentOptions: [],
      rules: {
        agentId: [{ required: true, message: this.$t('user.pleaseSelectAgent'), trigger: 'change' }],
        customerName: [{ required: true, message: this.$t('user.pleaseEnterCustomerName'), trigger: 'blur' }],
        loginAccount: [{ required: true, validator: validateLoginAccount, trigger: 'blur' }],
        loginPassword: [{ required: true, validator: validatePassword, trigger: 'blur' }],
        salePriceRate: [{ required: false, message: this.$t('user.pleaseEnterSalePriceRate'), trigger: 'blur' }],
        email: [{ required: true, validator: validateEmail, trigger: 'blur' }]
      },
      submitLoading: false
    }
  },
  created() {
    this.loadAgents()
  },
  methods: {
    // 加载代理列表
    async loadAgents() {
      try {
        const response = await request({
          url: '/api/agents',
          method: 'GET',
          params: { page: 1, limit: 1000 }
        })
        const agents = response.data || []
        // 只显示激活状态的代理，并过滤掉系统管理员账户
        this.agentOptions = agents
          .filter(agent => agent.status === 1 && agent.login_account !== 'admin')
          .map(agent => ({
            value: String(agent.id),
            label: agent.agentName || agent.agent_name
          }))
      } catch (error) {
        console.error('加载代理数据失败:', error)
        this.agentOptions = []
      }
    },
    submitForm() {
      this.$refs.userForm.validate(async(valid) => {
        if (valid) {
          this.submitLoading = true

          try {
            // 查找代理名称
            const selectedAgent = this.agentOptions.find(agent => agent.value === this.userForm.agentId)
            const agentName = selectedAgent ? selectedAgent.label : ''

            // 创建新用户数据
            const userData = {
              loginAccount: this.userForm.loginAccount,
              loginPassword: this.userForm.loginPassword,
              customerName: this.userForm.customerName,
              email: this.userForm.email,
              agentId: this.userForm.agentId,
              agentName: agentName,
              salePriceRate: this.userForm.salePriceRate,
              accountBalance: this.userForm.accountBalance,
              overdraftAmount: this.userForm.overdraftAmount,
              status: this.userForm.status,
              remark: this.userForm.remark
            }

            // 📦 打印发送的数据，用于调试
            console.log('📦 准备发送的用户数据:', JSON.stringify(userData, null, 2))
            console.log('🔍 各字段值:')
            console.log('  - loginAccount:', this.userForm.loginAccount)
            console.log('  - loginPassword:', this.userForm.loginPassword)
            console.log('  - customerName:', this.userForm.customerName)
            console.log('  - email:', this.userForm.email)
            console.log('  - agentId:', this.userForm.agentId)
            console.log('  - agentName:', agentName)

            // 调用API创建用户
            await request({
              url: '/api/users',
              method: 'POST',
              data: userData
            })

            // 清除用户列表缓存，确保返回后显示最新数据
            cacheManager.clear(CACHE_KEYS.USER_LIST)
            console.log('✅ 已清除用户列表缓存')

            this.$message({
              type: 'success',
              message: this.$t('user.createSuccess')
            })
            this.submitLoading = false
            this.$router.push('/user/customer-list')
          } catch (error) {
            console.error('❌ 创建用户失败:', error)
            this.$message.error('创建用户失败：' + (error.message || '未知错误'))
            this.submitLoading = false
          }
        } else {
          return false
        }
      })
    },
    resetForm() {
      this.$refs.userForm.resetFields()
    },
    goBack() {
      this.$router.go(-1)
    }
  }
}
</script>

<style lang="scss" scoped>
.user-form {
  max-width: 900px;
  margin: 0 auto;
}

.field-note {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
</style>
