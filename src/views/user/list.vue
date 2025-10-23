<template>
  <div class="app-container">
    <!-- 搜索和操作栏 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.username"
        :placeholder="$t('user.pleaseEnterUsername')"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-input
        v-model="listQuery.email"
        :placeholder="$t('user.pleaseEnterEmail')"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select
        v-model="listQuery.status"
        :placeholder="$t('user.status')"
        clearable
        style="width: 120px"
        class="filter-item"
      >
        <el-option :key="1" :label="$t('user.active')" :value="1" />
        <el-option :key="0" :label="$t('user.inactive')" :value="0" />
      </el-select>
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >
        {{ $t('common.search') }}
      </el-button>
      <el-button
        v-if="isAdmin"
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-plus"
        @click="handleCreate"
      >
        {{ $t('user.create') }}
      </el-button>
    </div>

    <!-- 用户列表表格 -->
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column
        label="ID"
        prop="id"
        sortable="custom"
        align="center"
        width="80"
      />
      <el-table-column
        :label="$t('user.loginAccount')"
        min-width="120px"
      >
        <template slot-scope="{row}">
          <span class="link-type" @click="handleDetail(row)">{{ row.loginAccount }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('user.customerName')"
        min-width="120px"
      >
        <template slot-scope="{row}">
          <span>{{ row.customerName || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('user.agentName')"
        min-width="120px"
      >
        <template slot-scope="{row}">
          <span>{{ row.agentName || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('user.email')"
        min-width="150px"
      >
        <template slot-scope="{row}">
          <span>{{ row.email }}</span>
        </template>
      </el-table-column>
      <!-- unitPrice列已移除 - 客户价格根据salePriceRate动态计算 -->
      <el-table-column
        :label="$t('user.salePriceRate')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{row}">
          <span>{{ row.salePriceRate || 1 }}x</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('user.accountBalance')"
        min-width="110px"
        align="center"
      >
        <template slot-scope="{row}">
          <span>￥{{ parseFloat(row.accountBalance).toFixed(5) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('user.status')"
        class-name="status-col"
        width="100"
      >
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status === 1 ? $t('user.active') : $t('user.inactive') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('user.createTime')"
        width="150px"
        align="center"
      >
        <template slot-scope="{row}">
          <span>{{ row.createTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('common.operation')"
        align="center"
        :width="isAdmin ? 280 : 100"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{row}">
          <el-button
            type="primary"
            size="mini"
            @click="handleDetail(row)"
          >
            {{ $t('common.detail') }}
          </el-button>
          <!-- 编辑按钮仅管理员可见 -->
          <el-button
            v-if="isAdmin"
            type="primary"
            size="mini"
            @click="handleUpdate(row)"
          >
            {{ $t('common.edit') }}
          </el-button>
          <!-- 更多操作 - 管理员和代理可见 -->
          <el-dropdown v-if="isAdmin || isAgent" trigger="click" @command="(command) => handleCommand(command, row)">
            <el-button
              size="mini"
              type="info"
            >
              {{ $t('common.more') }}<i class="el-icon-arrow-down el-icon--right" />
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <!-- 登录账号 - 管理员和代理都可以 -->
              <el-dropdown-item command="login">
                <i class="el-icon-user" /> 登录账号
              </el-dropdown-item>
              <!-- 重置密码 - 管理员和代理都可以 -->
              <el-dropdown-item command="resetPassword">
                <i class="el-icon-lock" /> {{ $t('user.resetPassword') }}
              </el-dropdown-item>
              <!-- 以下仅管理员可见 -->
              <el-dropdown-item v-if="isAdmin" command="recharge" :divided="true">
                <i class="el-icon-wallet" /> {{ $t('user.recharge') }}
              </el-dropdown-item>
              <el-dropdown-item v-if="isAdmin" command="deduct">
                <i class="el-icon-minus" /> {{ $t('user.deduct') }}
              </el-dropdown-item>
              <el-dropdown-item v-if="isAdmin" command="toggleStatus" :divided="true">
                <i :class="row.status === 1 ? 'el-icon-close' : 'el-icon-check'" />
                {{ row.status === 1 ? $t('user.inactive') : $t('user.active') }}
              </el-dropdown-item>
              <el-dropdown-item v-if="isAdmin" command="delete" :divided="true">
                <i class="el-icon-delete" style="color: #F56C6C" /> <span style="color: #F56C6C">{{ $t('common.delete') }}</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <!-- 充值对话框 -->
    <el-dialog
      :title="$t('user.recharge')"
      :visible.sync="rechargeDialogVisible"
      width="500px"
    >
      <el-form ref="rechargeForm" :model="rechargeForm" :rules="rechargeRules" label-width="100px">
        <el-form-item :label="$t('user.customerName')">
          <el-input v-model="currentUser.customerName" disabled />
        </el-form-item>
        <el-form-item :label="$t('user.currentBalance')">
          <el-input v-model="currentUser.accountBalance" disabled>
            <template slot="prepend">¥</template>
          </el-input>
        </el-form-item>
        <el-form-item :label="$t('user.rechargeAmount')" prop="amount">
          <el-input-number
            v-model="rechargeForm.amount"
            :min="0.01"
            :precision="2"
            :step="100"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item :label="$t('user.remark')">
          <el-input
            v-model="rechargeForm.remark"
            type="textarea"
            :rows="3"
            :placeholder="$t('user.pleaseEnterRemark')"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rechargeDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="confirmRecharge">{{ $t('common.confirm') }}</el-button>
      </span>
    </el-dialog>

    <!-- 扣款对话框 -->
    <el-dialog
      :title="$t('user.deduct')"
      :visible.sync="deductDialogVisible"
      width="500px"
    >
      <el-form ref="deductForm" :model="deductForm" :rules="deductRules" label-width="100px">
        <el-form-item :label="$t('user.customerName')">
          <el-input v-model="currentUser.customerName" disabled />
        </el-form-item>
        <el-form-item :label="$t('user.currentBalance')">
          <el-input v-model="currentUser.accountBalance" disabled>
            <template slot="prepend">¥</template>
          </el-input>
        </el-form-item>
        <el-form-item :label="$t('user.deductAmount')" prop="amount">
          <el-input-number
            v-model="deductForm.amount"
            :min="0.01"
            :max="currentUser.accountBalance"
            :precision="2"
            :step="100"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item :label="$t('user.remark')">
          <el-input
            v-model="deductForm.remark"
            type="textarea"
            :rows="3"
            :placeholder="$t('user.pleaseEnterRemark')"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deductDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="confirmDeduct">{{ $t('common.confirm') }}</el-button>
      </span>
    </el-dialog>

    <!-- 重置密码对话框 -->
    <el-dialog
      :title="$t('user.resetPassword')"
      :visible.sync="resetPasswordDialogVisible"
      width="500px"
    >
      <el-form ref="passwordForm" :model="passwordForm" :rules="passwordRules" label-width="100px">
        <el-form-item :label="$t('user.customerName')">
          <el-input v-model="currentUser.customerName" disabled />
        </el-form-item>
        <el-form-item :label="$t('user.loginAccount')">
          <el-input v-model="currentUser.loginAccount" disabled />
        </el-form-item>
        <el-form-item :label="$t('user.newPassword')" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            :placeholder="$t('user.pleaseEnterNewPassword')"
            show-password
          />
        </el-form-item>
        <el-form-item :label="$t('user.confirmPassword')" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            :placeholder="$t('user.pleaseEnterConfirmPassword')"
            show-password
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="resetPasswordDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="confirmResetPassword">{{ $t('common.confirm') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'
import waves from '@/directive/waves'
import i18nMixin from '@/mixins/i18n'
import request from '@/utils/request'
import cacheManager, { CACHE_KEYS, CACHE_DURATION } from '@/utils/cache-helper'

export default {
  name: 'UserList',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        1: 'success',
        0: 'info'
      }
      return statusMap[status]
    },
    parseTime
  },
  mixins: [i18nMixin],
  data() {
    // 确认密码验证
    const validateConfirmPassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('user.pleaseEnterConfirmPassword')))
      } else if (value !== this.passwordForm.newPassword) {
        callback(new Error(this.$t('user.passwordMismatch')))
      } else {
        callback()
      }
    }

    return {
      tableKey: 0,
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        username: undefined,
        email: undefined,
        status: undefined,
        sort: '+id'
      },
      // 充值相关
      rechargeDialogVisible: false,
      rechargeForm: {
        amount: 0,
        remark: ''
      },
      rechargeRules: {
        amount: [{ required: true, message: this.$t('user.pleaseEnterRechargeAmount'), trigger: 'blur' }]
      },
      // 扣款相关
      deductDialogVisible: false,
      deductForm: {
        amount: 0,
        remark: ''
      },
      deductRules: {
        amount: [{ required: true, message: this.$t('user.pleaseEnterDeductAmount'), trigger: 'blur' }]
      },
      // 重置密码相关
      resetPasswordDialogVisible: false,
      passwordForm: {
        newPassword: '',
        confirmPassword: ''
      },
      passwordRules: {
        newPassword: [
          { required: true, message: this.$t('user.pleaseEnterNewPassword'), trigger: 'blur' },
          { min: 6, message: '密码至少6个字符', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, validator: validateConfirmPassword, trigger: 'blur' }
        ]
      },
      // 当前操作的用户
      currentUser: {}
    }
  },
  computed: {
    // 判断是否为管理员
    isAdmin() {
      return this.$store.getters.roles.includes('admin')
    },
    // 判断是否为代理
    isAgent() {
      return this.$store.getters.roles.includes('agent')
    }
  },
  created() {
    this.getList()
  },
  activated() {
    // 当从其他页面返回时，强制刷新列表
    console.log('🔄 客户列表页面被激活，强制刷新数据')
    this.getList(true)
  },
  methods: {
    async getList(forceRefresh = false) {
      this.listLoading = true

      try {
        // 使用Vuex缓存，5分钟内不会重复请求
        const users = await cacheManager.get(
          CACHE_KEYS.USER_LIST,
          async() => {
            const response = await request({
              url: '/api/users',
              method: 'GET',
              params: {
                page: 1,
                limit: 1000
              }
            })
            return response.data || []
          },
          CACHE_DURATION.MEDIUM,
          forceRefresh
        )

        console.log('✅ 加载到', users.length, '条用户')

        // 应用筛选条件
        let filteredList = [...users]
        if (this.listQuery.username) {
          filteredList = filteredList.filter(user =>
            user.loginAccount && user.loginAccount.toLowerCase().includes(this.listQuery.username.toLowerCase())
          )
        }
        if (this.listQuery.email) {
          filteredList = filteredList.filter(user =>
            user.email && user.email.toLowerCase().includes(this.listQuery.email.toLowerCase())
          )
        }
        if (this.listQuery.status !== undefined) {
          filteredList = filteredList.filter(user => user.status === this.listQuery.status)
        }

        this.total = filteredList.length
        this.list = filteredList
        this.listLoading = false
      } catch (error) {
        console.error('❌ 加载用户列表失败:', error)
        this.$message.error('加载用户列表失败，请检查网络连接')
        this.list = []
        this.total = 0
        this.listLoading = false
      }
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleCreate() {
      this.$router.push('/user/customer/create')
    },
    handleUpdate(row) {
      this.$router.push(`/user/customer/edit/${row.id}`)
    },
    handleDetail(row) {
      this.$router.push(`/user/customer/detail/${row.id}`)
    },
    async handleDelete(row) {
      this.$confirm(this.$t('user.confirmDelete'), this.$t('common.warning'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(async() => {
        try {
          // 从数据库删除用户
          await request({
            url: `/api/users/${row.id}`,
            method: 'DELETE'
          })

          // 清除缓存
          cacheManager.clear(CACHE_KEYS.USER_LIST)

          this.$message({
            type: 'success',
            message: this.$t('user.deleteSuccess')
          })
          this.getList(true)
        } catch (error) {
          console.error('❌ 删除用户失败:', error)
          this.$message.error('删除用户失败：' + (error.message || '未知错误'))
        }
      }).catch(() => {})
    },
    async handleModifyStatus(row, status) {
      try {
        // 更新数据库中的用户状态
        await request({
          url: `/api/users/${row.id}`,
          method: 'PUT',
          data: { status }
        })

        // 清除缓存
        cacheManager.clear(CACHE_KEYS.USER_LIST)

        this.$message({
          message: this.$t('user.statusChanged'),
          type: 'success'
        })
        this.getList(true)
      } catch (error) {
        console.error('❌ 更新用户状态失败:', error)
        this.$message.error('更新状态失败：' + (error.message || '未知错误'))
      }
    },
    // 下拉菜单命令处理
    handleCommand(command, row) {
      this.currentUser = { ...row }
      switch (command) {
        case 'login':
          this.handleLogin(row)
          break
        case 'recharge':
          this.handleRecharge(row)
          break
        case 'deduct':
          this.handleDeduct(row)
          break
        case 'resetPassword':
          this.handleResetPassword(row)
          break
        case 'toggleStatus':
          this.handleModifyStatus(row, row.status === 1 ? 0 : 1)
          break
        case 'delete':
          this.handleDelete(row)
          break
      }
    },
    // 登录客户账号
    handleLogin(row) {
      // 检查账号状态
      if (row.status !== 1) {
        this.$message({
          type: 'error',
          message: '该账号已停用，无法登录'
        })
        return
      }

      this.$confirm(`确认要登录到客户账号"${row.customerName}"吗？`, '登录确认', {
        confirmButtonText: '确认登录',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const loading = this.$loading({
          lock: true,
          text: '正在切换账号...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })

        try {
          // 1. 清除当前登录状态
          await this.$store.dispatch('user/resetToken')
          
          // 2. 执行登录(获取token)
          await this.$store.dispatch('user/login', {
            username: row.loginAccount,
            password: row.loginPassword
          })
          
          this.$message({
            type: 'success',
            message: `已成功登录到客户账号：${row.customerName}`
          })
          
          // 3. 刷新页面，让路由守卫重新加载用户信息和动态路由
          // 这样可以确保路由完全重新初始化，避免缓存问题
          setTimeout(() => {
            window.location.href = '/'
          }, 500)
        } catch (error) {
          loading.close()
          this.$message({
            type: 'error',
            message: '登录失败：' + (error.message || '未知错误')
          })
        }
      }).catch(() => {
        // 用户取消登录
      })
    },
    // 打开充值对话框
    handleRecharge(row) {
      this.currentUser = { ...row }
      this.rechargeForm = {
        amount: 0,
        remark: ''
      }
      this.rechargeDialogVisible = true
      this.$nextTick(() => {
        this.$refs.rechargeForm && this.$refs.rechargeForm.clearValidate()
      })
    },
    // 确认充值
    async confirmRecharge() {
      this.$refs.rechargeForm.validate(async(valid) => {
        if (valid) {
          try {
            // 只调用充值记录API，后端会自动更新余额
            await request({
              url: '/api/recharge-records',
              method: 'POST',
              data: {
                customer_id: this.currentUser.id,
                customer_name: this.currentUser.customerName,
                amount: parseFloat(this.rechargeForm.amount),
                method: 'system',
                remark: this.rechargeForm.remark || '系统充值'
              }
            })

            // 清除缓存
            cacheManager.clear(CACHE_KEYS.USER_LIST)

            this.$message({
              type: 'success',
              message: `充值成功！充值金额：¥${parseFloat(this.rechargeForm.amount).toFixed(5)}`
            })
            this.rechargeDialogVisible = false
            this.getList(true)
          } catch (error) {
            console.error('❌ 充值失败:', error)
            this.$message.error('充值失败：' + (error.message || '未知错误'))
          }
        }
      })
    },
    // 打开扣款对话框
    handleDeduct(row) {
      this.currentUser = { ...row }
      this.deductForm = {
        amount: 0,
        remark: ''
      }
      this.deductDialogVisible = true
      this.$nextTick(() => {
        this.$refs.deductForm && this.$refs.deductForm.clearValidate()
      })
    },
    // 确认扣款
    async confirmDeduct() {
      this.$refs.deductForm.validate(async(valid) => {
        if (valid) {
          if (this.deductForm.amount > this.currentUser.accountBalance) {
            this.$message({
              type: 'error',
              message: this.$t('user.insufficientBalance')
            })
            return
          }

          try {
            // 只调用充值记录API（负数金额），后端会自动更新余额
            await request({
              url: '/api/recharge-records',
              method: 'POST',
              data: {
                customer_id: this.currentUser.id,
                customer_name: this.currentUser.customerName,
                amount: -parseFloat(this.deductForm.amount),
                method: 'system',
                remark: this.deductForm.remark || '系统扣款'
              }
            })

            // 清除缓存
            cacheManager.clear(CACHE_KEYS.USER_LIST)

            this.$message({
              type: 'success',
              message: `扣款成功！扣款金额：¥${this.deductForm.amount}`
            })
            this.deductDialogVisible = false
            this.getList(true)
          } catch (error) {
            console.error('❌ 扣款失败:', error)
            this.$message.error('扣款失败：' + (error.message || '未知错误'))
          }
        }
      })
    },
    // 打开重置密码对话框
    handleResetPassword(row) {
      this.currentUser = { ...row }
      this.passwordForm = {
        newPassword: '',
        confirmPassword: ''
      }
      this.resetPasswordDialogVisible = true
      this.$nextTick(() => {
        this.$refs.passwordForm && this.$refs.passwordForm.clearValidate()
      })
    },
    // 确认重置密码
    async confirmResetPassword() {
      this.$refs.passwordForm.validate(async(valid) => {
        if (valid) {
          try {
            // 调用后端API重置密码
            await request({
              url: `/api/users/${this.currentUser.id}`,
              method: 'PUT',
              data: {
                loginPassword: this.passwordForm.newPassword
              }
            })

            // 清除缓存
            cacheManager.clear(CACHE_KEYS.USER_LIST)

            this.$message({
              type: 'success',
              message: this.$t('user.passwordReset')
            })
            this.resetPasswordDialogVisible = false
            this.getList(true)
          } catch (error) {
            console.error('❌ 重置密码失败:', error)
            this.$message.error('重置密码失败：' + (error.message || '未知错误'))
          }
        }
      })
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-container {
  padding: 20px 0;
  .filter-item {
    display: inline-block;
    vertical-align: middle;
    margin-right: 10px;
  }
}

.link-type {
  color: #409eff;
  cursor: pointer;

  &:hover {
    color: #66b1ff;
  }
}
</style>
