<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="clearfix">
        <span>{{ $t('agent.agentRecharge') }} - {{ agentInfo.agentName }}</span>
        <el-button
          style="float: right; padding: 3px 0"
          type="text"
          @click="goBack"
        >
          {{ $t('common.back') }}
        </el-button>
      </div>

      <!-- 代理信息 -->
      <el-row :gutter="20" style="margin-bottom: 20px;">
        <el-col :span="8">
          <el-card class="agent-info-card">
            <div class="agent-info">
              <h3>{{ agentInfo.agentName }}</h3>
              <p>{{ $t('agent.agentCode') }}: {{ agentInfo.agentCode }}</p>
              <p>{{ $t('recharge.balance') }}: <span class="balance">¥{{ agentInfo.balance || '0.00' }}</span></p>
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
                <el-option label="佣金充值" value="commission" />
                <el-option label="现金充值" value="cash" />
              </el-select>
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
    </el-card>
  </div>
</template>

<script>
import i18nMixin from '@/mixins/i18n'

export default {
  name: 'AgentRecharge',
  mixins: [i18nMixin],
  data() {
    return {
      agentInfo: {},
      rechargeForm: {
        amount: 0,
        type: 'commission',
        remark: ''
      },
      rules: {
        amount: [
          { required: true, message: this.$t('recharge.pleaseEnterAmount'), trigger: 'blur' },
          { type: 'number', min: 0.01, message: '充值金额必须大于0.01', trigger: 'blur' }
        ],
        type: [{ required: true, message: this.$t('recharge.pleaseSelectType'), trigger: 'change' }]
      },
      submitLoading: false
    }
  },
  created() {
    const agentId = this.$route.params && this.$route.params.id
    this.fetchAgentInfo(agentId)
  },
  methods: {
    fetchAgentInfo(agentId) {
      this.agentInfo = {
        id: agentId,
        agentCode: 'AGENT001',
        agentName: '一级代理商A',
        balance: '5680.30'
      }
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
            setTimeout(() => {
              this.$message({
                type: 'success',
                message: this.$t('recharge.rechargeSuccess')
              })
              this.submitLoading = false
              this.agentInfo.balance = (parseFloat(this.agentInfo.balance) + this.rechargeForm.amount).toFixed(2)
              this.resetForm()
            }, 1500)
          }).catch(() => {})
        }
      })
    },
    resetForm() {
      this.$refs.rechargeForm.resetFields()
    },
    goBack() {
      this.$router.go(-1)
    }
  }
}
</script>

<style lang="scss" scoped>
.recharge-form {
  max-width: 800px;
  margin: 0 auto;
}

.agent-info-card {
  .agent-info {
    text-align: center;

    h3 {
      margin: 0 0 10px 0;
      color: #303133;
    }

    p {
      margin: 5px 0;
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
