<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="clearfix">
        <span>{{ $t('user.userRecharge') }} - {{ userInfo.username }}</span>
        <el-button
          style="float: right; padding: 3px 0"
          type="text"
          @click="goBack"
        >
          {{ $t('common.back') }}
        </el-button>
      </div>

      <!-- 用户信息 -->
      <el-row :gutter="20" style="margin-bottom: 20px;">
        <el-col :span="8">
          <el-card class="user-info-card">
            <div class="user-info">
              <el-avatar :size="60" :src="userInfo.avatar" icon="el-icon-user-solid" />
              <div style="margin-left: 15px;">
                <h3>{{ userInfo.realName || userInfo.username }}</h3>
                <p>{{ $t('recharge.balance') }}: <span class="balance">¥{{ userInfo.balance || '0.00' }}</span></p>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-form
        ref="rechargeForm"
        :model="rechargeForm"
        :rules="rules"
        label-width="120px"
        class="recharge-form"
      >
        <el-divider content-position="left">{{ $t('recharge.title') }}</el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('recharge.amount')" prop="amount">
              <el-input-number
                v-model="rechargeForm.amount"
                :min="0.01"
                :max="999999.99"
                :precision="2"
                style="width: 100%"
                controls-position="right"
                :placeholder="$t('recharge.pleaseEnterAmount')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('recharge.type')" prop="type">
              <el-select
                v-model="rechargeForm.type"
                :placeholder="$t('recharge.pleaseSelectType')"
                style="width: 100%"
              >
                <el-option
                  v-for="type in typeOptions"
                  :key="type.value"
                  :label="type.label"
                  :value="type.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('recharge.method')" prop="method">
              <el-select
                v-model="rechargeForm.method"
                :placeholder="$t('recharge.pleaseSelectMethod')"
                style="width: 100%"
              >
                <el-option
                  v-for="method in methodOptions"
                  :key="method.value"
                  :label="method.label"
                  :value="method.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('recharge.status')" prop="status">
              <el-radio-group v-model="rechargeForm.status">
                <el-radio label="pending">{{ $t('recharge.pending') }}</el-radio>
                <el-radio label="success">{{ $t('recharge.success') }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item :label="$t('recharge.remark')" prop="remark">
          <el-input
            v-model="rechargeForm.remark"
            :placeholder="$t('recharge.remark')"
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
            {{ $t('common.confirm') }}
          </el-button>
          <el-button @click="resetForm">
            {{ $t('common.reset') }}
          </el-button>
          <el-button @click="goBack">
            {{ $t('common.cancel') }}
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 充值记录 -->
      <el-divider content-position="left">{{ $t('recharge.rechargeRecord') }}</el-divider>

      <el-table
        :data="rechargeRecords"
        border
        style="width: 100%"
      >
        <el-table-column
          :label="$t('recharge.amount')"
          prop="amount"
          width="120"
        >
          <template slot-scope="{row}">
            <span>¥{{ row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('recharge.type')"
          prop="type"
          width="100"
        />
        <el-table-column
          :label="$t('recharge.method')"
          prop="method"
          width="100"
        />
        <el-table-column
          :label="$t('recharge.status')"
          prop="status"
          width="100"
        >
          <template slot-scope="{row}">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('recharge.createTime')"
          prop="createTime"
          width="180"
        />
        <el-table-column
          :label="$t('recharge.remark')"
          prop="remark"
        />
      </el-table>
    </el-card>
  </div>
</template>

<script>
import i18nMixin from '@/mixins/i18n'

export default {
  name: 'UserRecharge',
  mixins: [i18nMixin],
  data() {
    return {
      userInfo: {},
      rechargeForm: {
        amount: 0,
        type: 'cash',
        method: 'bank',
        status: 'success',
        remark: ''
      },
      typeOptions: [
        { value: 'cash', label: '现金充值' },
        { value: 'bonus', label: '奖金充值' }
      ],
      methodOptions: [
        { value: 'cash', label: '现金' },
        { value: 'bank', label: '银行转账' },
        { value: 'alipay', label: '支付宝' },
        { value: 'wechat', label: '微信支付' }
      ],
      rechargeRecords: [],
      rules: {
        amount: [
          { required: true, message: this.$t('recharge.pleaseEnterAmount'), trigger: 'blur' },
          { type: 'number', min: 0.01, message: '充值金额必须大于0.01', trigger: 'blur' }
        ],
        type: [{ required: true, message: this.$t('recharge.pleaseSelectType'), trigger: 'change' }],
        method: [{ required: true, message: this.$t('recharge.pleaseSelectMethod'), trigger: 'change' }]
      },
      submitLoading: false
    }
  },
  created() {
    const userId = this.$route.params && this.$route.params.id
    this.fetchUserInfo(userId)
    this.fetchRechargeRecords(userId)
  },
  methods: {
    fetchUserInfo(userId) {
      // 模拟获取用户信息
      this.userInfo = {
        id: userId,
        username: 'admin',
        realName: '系统管理员',
        avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
        balance: '1250.80'
      }
    },
    fetchRechargeRecords(userId) {
      // 模拟获取充值记录
      this.rechargeRecords = [
        {
          amount: '500.00',
          type: '现金充值',
          method: '银行转账',
          status: 'success',
          createTime: '2023-12-01 10:30:00',
          remark: '银行转账充值'
        },
        {
          amount: '200.00',
          type: '现金充值',
          method: '支付宝',
          status: 'success',
          createTime: '2023-11-25 14:20:00',
          remark: '支付宝充值'
        }
      ]
    },
    submitForm() {
      this.$refs.rechargeForm.validate((valid) => {
        if (valid) {
          this.$confirm(this.$t('recharge.confirmRecharge'), this.$t('common.warning'), {
            confirmButtonText: this.$t('common.confirm'),
            cancelButtonText: this.$t('common.cancel'),
            type: 'warning'
          }).then(() => {
            this.submitLoading = true
            // 模拟充值请求
            setTimeout(() => {
              this.$message({
                type: 'success',
                message: this.$t('recharge.rechargeSuccess')
              })
              this.submitLoading = false
              // 更新余额
              this.userInfo.balance = (parseFloat(this.userInfo.balance) + this.rechargeForm.amount).toFixed(2)
              // 重新获取充值记录
              this.fetchRechargeRecords(this.userInfo.id)
              this.resetForm()
            }, 1500)
          }).catch(() => {})
        } else {
          return false
        }
      })
    },
    resetForm() {
      this.$refs.rechargeForm.resetFields()
    },
    goBack() {
      this.$router.go(-1)
    },
    getStatusType(status) {
      const statusMap = {
        'pending': 'warning',
        'success': 'success',
        'failed': 'danger'
      }
      return statusMap[status]
    },
    getStatusText(status) {
      const statusMap = {
        'pending': this.$t('recharge.pending'),
        'success': this.$t('recharge.success'),
        'failed': this.$t('recharge.failed')
      }
      return statusMap[status]
    }
  }
}
</script>

<style lang="scss" scoped>
.recharge-form {
  max-width: 800px;
  margin: 0 auto;
}

.user-info-card {
  .user-info {
    display: flex;
    align-items: center;

    h3 {
      margin: 0 0 10px 0;
      color: #303133;
    }

    p {
      margin: 0;
      color: #606266;

      .balance {
        color: #67C23A;
        font-weight: bold;
        font-size: 16px;
      }
    }
  }
}
</style>
