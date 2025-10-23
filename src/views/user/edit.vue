<template>
  <div class="app-container">
    <el-card v-loading="loading">
      <div slot="header" class="clearfix">
        <span>{{ $t('user.edit') }} - {{ userForm.customerName || userForm.loginAccount }}</span>
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
                disabled
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
                clearable
              />
              <div class="field-note">留空则不修改密码</div>
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
          <el-button
            type="warning"
            @click="resetPassword"
          >
            {{ $t('user.resetPassword') }}
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
import { parseTime } from '@/utils'
import i18nMixin from '@/mixins/i18n'
import request from '@/utils/request'

export default {
  name: 'EditUser',
  filters: {
    parseTime
  },
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

    // 密码验证（编辑模式下可选）
    const validatePassword = (rule, value, callback) => {
      // 编辑模式下，如果密码为空或未定义则不验证（表示不修改密码）
      if (!value || value.trim() === '') {
        callback() // 允许为空
        return
      }
      if (value.length < 6) {
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
      loading: false,
      userForm: {
        id: '',
        agentId: '',
        customerName: '',
        loginAccount: '',
        loginPassword: '',
        salePriceRate: 1,
        accountBalance: 0,
        overdraftAmount: 0,
        email: '',
        status: 1,
        remark: '',
        createTime: null
      },
      agentOptions: [],
      rules: {
        agentId: [{ required: true, message: this.$t('user.pleaseSelectAgent'), trigger: 'change' }],
        customerName: [{ required: true, message: this.$t('user.pleaseEnterCustomerName'), trigger: 'blur' }],
        loginAccount: [{ required: true, validator: validateLoginAccount, trigger: 'blur' }],
        loginPassword: [{ validator: validatePassword, trigger: 'blur' }],
        salePriceRate: [{ required: false, message: this.$t('user.pleaseEnterSalePriceRate'), trigger: 'blur' }],
        email: [{ required: true, validator: validateEmail, trigger: 'blur' }]
      },
      submitLoading: false
    }
  },
  computed: {
    userId() {
      return this.$route.params.id
    }
  },
  created() {
    this.loadAgents()
    this.loadUserData()
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
    // 加载用户数据
    async loadUserData() {
      this.loading = true
      try {
        const response = await request({
          url: `/api/users/${this.userId}`,
          method: 'GET'
        })
        const user = response.data
        if (user) {
          this.userForm = {
            loginAccount: user.loginAccount || user.login_account,
            loginPassword: '',
            customerName: user.customerName || user.customer_name,
            email: user.email,
            agentId: String(user.agentId || user.agent_id || ''),
            salePriceRate: parseFloat(user.salePriceRate || user.sale_price_rate || 1),
            accountBalance: parseFloat(user.accountBalance || user.account_balance || 0),
            overdraftAmount: parseFloat(user.overdraftAmount || user.overdraft_amount || 0),
            status: user.status === 1 ? 1 : 0,
            remark: user.remark || ''
          }
        }
        this.loading = false
      } catch (error) {
        console.error('❌ 加载用户数据失败:', error)
        this.$message.error('加载用户数据失败')
        this.loading = false
      }
    },
    submitForm() {
      this.$refs.userForm.validate(async(valid) => {
        if (valid) {
          this.submitLoading = true
          try {
            const selectedAgent = this.agentOptions.find(agent => agent.value === this.userForm.agentId)
            const agentName = selectedAgent ? selectedAgent.label : ''

            const updateData = {
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

            // 如果有新密码，添加到更新数据
            if (this.userForm.loginPassword) {
              updateData.loginPassword = this.userForm.loginPassword
            }

            await request({
              url: `/api/users/${this.userId}`,
              method: 'PUT',
              data: updateData
            })

            this.$message({
              type: 'success',
              message: this.$t('user.updateSuccess')
            })
            this.submitLoading = false
            this.$router.push('/user/customer-list')
          } catch (error) {
            console.error('❌ 更新用户失败:', error)
            this.$message.error('更新用户失败：' + (error.message || '未知错误'))
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
    resetPassword() {
      this.$confirm('确认重置该用户的密码？', this.$t('common.warning'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        // 生成新密码
        const newPassword = Math.random().toString(36).slice(-8)
        this.userForm.loginPassword = newPassword

        this.$alert(`新密码: ${newPassword}`, '密码重置成功', {
          confirmButtonText: '确定',
          type: 'success'
        })
      }).catch(() => {})
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
