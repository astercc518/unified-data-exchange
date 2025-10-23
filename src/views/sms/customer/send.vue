<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>短信群发</span>
      </div>

      <el-form ref="smsForm" :model="smsForm" :rules="rules" label-width="120px">
        <!-- 选择国家 -->
        <el-form-item label="短信国家" prop="country">
          <el-select
            v-model="smsForm.country"
            filterable
            placeholder="请选择国家"
            style="width: 300px"
            @change="handleCountryChange"
          >
            <el-option
              v-for="item in countryList"
              :key="item.name"
              :label="`${item.nameCn} (${item.name}) +${item.code}`"
              :value="item.name"
            >
              <span style="float: left">{{ item.nameCn }} ({{ item.name }})</span>
              <span style="float: right; color: #8492a6; font-size: 13px">+{{ item.code }}</span>
            </el-option>
          </el-select>
        </el-form-item>

        <!-- 选择通道 -->
        <el-form-item label="短信通道" prop="channel_id">
          <el-select
            v-model="smsForm.channel_id"
            placeholder="请选择通道"
            style="width: 300px"
            :disabled="!smsForm.country"
          >
            <el-option
              v-for="channel in availableChannels"
              :key="channel.id"
              :label="`${channel.channel_name} ($${channel.price_per_sms}/条)`"
              :value="channel.id"
            />
          </el-select>
        </el-form-item>

        <!-- 短信内容 -->
        <el-form-item label="短信内容" prop="content">
          <el-input
            v-model="smsForm.content"
            type="textarea"
            :rows="5"
            placeholder="请输入短信内容"
            maxlength="500"
            show-word-limit
            @input="handleContentChange"
          />
          <div class="char-info">
            <span>字符数: {{ charCount }}</span>
            <span v-if="selectedChannel" style="margin-left: 20px">
              最大字符: {{ selectedChannel.max_chars }}
            </span>
          </div>
        </el-form-item>

        <!-- 发送号码选择 -->
        <el-form-item label="发送号码">
          <el-radio-group v-model="numberSource" @change="handleNumberSourceChange">
            <el-radio label="purchased">从已购买数据选择</el-radio>
            <el-radio label="manual">手动输入</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 从已购买数据选择 -->
        <el-form-item v-if="numberSource === 'purchased'" label="选择数据">
          <el-select
            v-model="selectedDataId"
            placeholder="请选择数据"
            style="width: 400px"
            @change="handleDataSelect"
          >
            <el-option
              v-for="data in purchasedData"
              :key="data.id"
              :label="`${data.file_name} (${data.available_quantity}条)`"
              :value="data.id"
            />
          </el-select>
        </el-form-item>

        <!-- 手动输入号码 -->
        <el-form-item v-if="numberSource === 'manual'" label="手机号码" prop="phone_numbers">
          <el-input
            v-model="phoneNumbersText"
            type="textarea"
            :rows="8"
            placeholder="每行一个号码&#10;例如:&#10;13800138000&#10;13900139000"
            @input="handlePhoneInput"
          />
          <div class="phone-info">
            号码数量: {{ phoneNumbers.length }}
          </div>
        </el-form-item>

        <!-- 发送方式 -->
        <el-form-item label="发送方式" prop="send_type">
          <el-radio-group v-model="smsForm.send_type">
            <el-radio label="immediate">立即发送</el-radio>
            <el-radio label="scheduled">定时发送</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 定时发送时间 -->
        <el-form-item v-if="smsForm.send_type === 'scheduled'" label="发送时间" prop="scheduled_time">
          <el-date-picker
            v-model="smsForm.scheduled_time"
            type="datetime"
            placeholder="选择日期时间"
            value-format="yyyy-MM-dd HH:mm:ss"
            :picker-options="pickerOptions"
          />
        </el-form-item>

        <!-- 费用预估 -->
        <el-form-item label="费用预估">
          <div class="cost-estimate">
            <span>发送数量: {{ phoneNumbers.length }}</span>
            <span style="margin-left: 20px">
              预计费用: ${{ estimatedCost.toFixed(4) }}
            </span>
            <span style="margin-left: 20px; color: #67C23A">
              账户余额: ${{ userBalance }}
            </span>
          </div>
        </el-form-item>

        <!-- 提交按钮 -->
        <el-form-item>
          <el-button
            type="primary"
            :loading="submitting"
            @click="handleSubmit"
          >
            {{ smsForm.send_type === 'immediate' ? '立即发送' : '创建定时任务' }}
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { getAvailableChannels, createTask, getPurchasedData } from '@/api/smsCustomer'
import countries from '@/utils/countries'

export default {
  name: 'SmsSend',
  data() {
    return {
      smsForm: {
        country: '',
        channel_id: '',
        content: '',
        send_type: 'immediate',
        scheduled_time: ''
      },
      rules: {
        country: [{ required: true, message: '请选择国家', trigger: 'change' }],
        channel_id: [{ required: true, message: '请选择通道', trigger: 'change' }],
        content: [{ required: true, message: '请输入短信内容', trigger: 'blur' }],
        phone_numbers: [{ required: true, message: '请输入手机号码', trigger: 'blur' }],
        scheduled_time: [{ required: true, message: '请选择发送时间', trigger: 'change' }]
      },
      countryList: countries, // 使用全球国家列表
      availableChannels: [],
      purchasedData: [],
      numberSource: 'manual',
      selectedDataId: '',
      phoneNumbersText: '',
      phoneNumbers: [],
      charCount: 0,
      submitting: false,
      userBalance: 0,
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now()
        }
      }
    }
  },
  computed: {
    selectedChannel() {
      return this.availableChannels.find(c => c.id === this.smsForm.channel_id)
    },
    estimatedCost() {
      if (!this.selectedChannel || !this.phoneNumbers.length) {
        return 0
      }
      return this.phoneNumbers.length * parseFloat(this.selectedChannel.price_per_sms)
    }
  },
  created() {
    this.loadUserBalance()
  },
  methods: {
    async loadUserBalance() {
      // 从用户信息中获取余额
      const userInfo = this.$store.getters.userInfo
      this.userBalance = userInfo.account_balance || 0
    },
    async handleCountryChange(country) {
      this.smsForm.channel_id = ''
      this.availableChannels = []
      
      try {
        const response = await getAvailableChannels(country)
        this.availableChannels = response.data
        
        // 加载该国家的已购买数据
        if (this.numberSource === 'purchased') {
          await this.loadPurchasedData()
        }
      } catch (error) {
        this.$message.error('获取通道失败')
      }
    },
    async loadPurchasedData() {
      try {
        const response = await getPurchasedData({ country: this.smsForm.country })
        this.purchasedData = response.data
      } catch (error) {
        this.$message.error('获取已购买数据失败')
      }
    },
    handleContentChange() {
      this.charCount = this.smsForm.content.length
      
      // 检查是否超过限制
      if (this.selectedChannel && this.charCount > this.selectedChannel.max_chars) {
        this.$message.warning(`内容超过最大字符限制 ${this.selectedChannel.max_chars}`)
      }
    },
    handleNumberSourceChange() {
      this.phoneNumbers = []
      this.phoneNumbersText = ''
      this.selectedDataId = ''
      
      if (this.numberSource === 'purchased' && this.smsForm.country) {
        this.loadPurchasedData()
      }
    },
    handleDataSelect(dataId) {
      // 实际应用中需要从服务器获取该数据的号码列表
      this.$message.info('从数据中提取号码功能待实现')
    },
    handlePhoneInput() {
      const lines = this.phoneNumbersText.split('\n')
      this.phoneNumbers = lines
        .map(line => line.trim())
        .filter(line => line.length > 0)
    },
    handleSubmit() {
      this.$refs.smsForm.validate(async(valid) => {
        if (!valid) {
          return
        }
        
        if (this.phoneNumbers.length === 0) {
          this.$message.warning('请输入至少一个手机号码')
          return
        }
        
        if (!this.selectedChannel) {
          this.$message.warning('请选择通道')
          return
        }
        
        if (this.charCount > this.selectedChannel.max_chars) {
          this.$message.warning('短信内容超过最大字符限制')
          return
        }
        
        if (this.estimatedCost > this.userBalance) {
          this.$message.warning('余额不足，请先充值')
          return
        }
        
        this.$confirm(
          `将向 ${this.phoneNumbers.length} 个号码发送短信，预计费用 $${this.estimatedCost.toFixed(4)}，是否继续？`,
          '确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).then(async() => {
          this.submitting = true
          try {
            await createTask({
              ...this.smsForm,
              phone_numbers: this.phoneNumbers
            })
            this.$message.success('任务创建成功')
            this.$router.push('/sms/tasks')
          } catch (error) {
            this.$message.error(error.message || '创建任务失败')
          } finally {
            this.submitting = false
          }
        })
      })
    },
    handleReset() {
      this.$refs.smsForm.resetFields()
      this.phoneNumbers = []
      this.phoneNumbersText = ''
      this.charCount = 0
    }
  }
}
</script>

<style scoped>
.char-info {
  margin-top: 5px;
  font-size: 12px;
  color: #909399;
}

.phone-info {
  margin-top: 5px;
  font-size: 12px;
  color: #409EFF;
}

.cost-estimate {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}
</style>
