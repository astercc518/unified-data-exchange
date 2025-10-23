<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="clearfix">
        <span>{{ $t('agent.edit') }} - {{ agentForm.agentName }}</span>
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
        <el-divider content-position="left">{{ $t('user.basicInfo') }}</el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('agent.agentCode')" prop="agentCode">
              <el-input
                v-model="agentForm.agentCode"
                :placeholder="$t('agent.pleaseEnterAgentCode')"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('agent.agentName')" prop="agentName">
              <el-input
                v-model="agentForm.agentName"
                :placeholder="$t('agent.pleaseEnterAgentName')"
              />
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
            <el-form-item :label="$t('user.status')" prop="status">
              <el-radio-group v-model="agentForm.status">
                <el-radio :label="1">{{ $t('user.active') }}</el-radio>
                <el-radio :label="0">{{ $t('user.inactive') }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">{{ $t('user.contactInfo') }}</el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('user.email')" prop="email">
              <el-input
                v-model="agentForm.email"
                :placeholder="$t('user.pleaseEnterEmail')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('user.phone')" prop="phone">
              <el-input
                v-model="agentForm.phone"
                :placeholder="$t('user.pleaseEnterPhone')"
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
  name: 'EditAgent',
  mixins: [i18nMixin],
  data() {
    return {
      agentForm: {
        id: '',
        agentCode: '',
        agentName: '',
        commission: 10.0,
        status: 1,
        email: '',
        phone: '',
        remark: ''
      },
      rules: {
        agentName: [{ required: true, message: this.$t('agent.pleaseEnterAgentName'), trigger: 'blur' }],
        commission: [{ required: true, message: this.$t('agent.pleaseEnterCommission'), trigger: 'blur' }],
        email: [{ required: true, message: this.$t('user.pleaseEnterEmail'), trigger: 'blur' }]
      },
      submitLoading: false
    }
  },
  created() {
    const id = this.$route.params && this.$route.params.id
    this.fetchData(id)
  },
  methods: {
    async fetchData(id) {
      try {
        console.log('🔍 开始加载代理数据, ID:', id)

        // 从数据库获取代理数据
        const response = await request({
          url: `/api/agents/${id}`,
          method: 'GET'
        })

        if (response.success && response.data) {
          const agent = response.data
          this.agentForm = {
            id: agent.id,
            agentCode: agent.agent_code || agent.agentCode,
            agentName: agent.agent_name || agent.agentName,
            commission: parseFloat(agent.commission || 0),
            status: agent.status,
            email: agent.email || '',
            phone: agent.phone || '',
            remark: agent.remark || ''
          }
          console.log('✅ 代理数据加载成功:', this.agentForm)
        } else {
          throw new Error('获取代理数据失败')
        }
      } catch (error) {
        console.error('❌ 加载代理数据失败:', error)
        this.$message.error('加载代理数据失败：' + (error.message || '未知错误'))
        this.$router.go(-1)
      }
    },
    async submitForm() {
      this.$refs.agentForm.validate(async(valid) => {
        if (valid) {
          this.submitLoading = true

          try {
            console.log('📝 开始更新代理信息:', this.agentForm)

            // 准备更新数据（驼峰命名）
            const updateData = {
              agentName: this.agentForm.agentName,
              commission: this.agentForm.commission,
              status: this.agentForm.status,
              email: this.agentForm.email,
              phone: this.agentForm.phone,
              remark: this.agentForm.remark
            }

            // 调用后端API更新代理
            await request({
              url: `/api/agents/${this.agentForm.id}`,
              method: 'PUT',
              data: updateData
            })

            this.$message({
              type: 'success',
              message: this.$t('agent.updateAgentSuccess')
            })

            console.log('✅ 代理信息更新成功')
            this.submitLoading = false

            // 跳转回列表页（正确的路径）
            this.$router.push('/user/agent-list')
          } catch (error) {
            console.error('❌ 更新代理失败:', error)
            this.$message.error('更新代理失败：' + (error.message || '未知错误'))
            this.submitLoading = false
          }
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
