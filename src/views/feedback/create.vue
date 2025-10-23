<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="clearfix">
        <span>{{ isEdit ? '编辑反馈' : $t('feedback.create') }}</span>
        <el-button
          style="float: right; padding: 3px 0"
          type="text"
          @click="goBack"
        >
          {{ $t('common.back') }}
        </el-button>
      </div>

      <el-form
        ref="feedbackForm"
        :model="feedbackForm"
        :rules="rules"
        label-width="120px"
        class="feedback-form"
      >
        <!-- 基本信息 -->
        <el-divider content-position="left">基本信息</el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('feedback.targetSite')" prop="targetSite">
              <el-input
                v-model="feedbackForm.targetSite"
                :placeholder="$t('feedback.enterTargetSite')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('feedback.dataSource')" prop="dataSource">
              <el-select
                v-model="feedbackForm.dataSource"
                placeholder="请选择数据源"
                style="width: 100%"
              >
                <el-option label="孟加拉国-3天内" value="bangladesh_3" />
                <el-option label="孟加拉国-30天内" value="bangladesh_30" />
                <el-option label="孟加拉国-30天以上" value="bangladesh_30+" />
                <el-option label="印度-3天内" value="india_3" />
                <el-option label="印度-30天内" value="india_30" />
                <el-option label="印度-30天以上" value="india_30+" />
                <el-option label="巴基斯坦-3天内" value="pakistan_3" />
                <el-option label="巴基斯坦-30天内" value="pakistan_30" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 数据效果 -->
        <el-divider content-position="left">{{ $t('feedback.performance') }}</el-divider>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item :label="$t('feedback.traffic')" prop="traffic">
              <el-input-number
                v-model="feedbackForm.traffic"
                :min="0"
                style="width: 100%"
                controls-position="right"
                :placeholder="$t('feedback.enterTraffic')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('feedback.registration')" prop="registration">
              <el-input-number
                v-model="feedbackForm.registration"
                :min="0"
                style="width: 100%"
                controls-position="right"
                :placeholder="$t('feedback.enterRegistration')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('feedback.recharge')" prop="recharge">
              <el-input-number
                v-model="feedbackForm.recharge"
                :min="0"
                style="width: 100%"
                controls-position="right"
                :placeholder="$t('feedback.enterRecharge')"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 转化率计算显示 -->
        <el-row v-if="feedbackForm.traffic > 0" :gutter="20">
          <el-col :span="12">
            <el-form-item label="注册转化率">
              <div class="conversion-display">
                <span :class="getConversionClass(registrationRate)">
                  {{ registrationRate }}%
                </span>
                <span class="conversion-detail">
                  ({{ feedbackForm.registration }} / {{ feedbackForm.traffic }})
                </span>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="充值转化率">
              <div class="conversion-display">
                <span :class="getConversionClass(rechargeRate)">
                  {{ rechargeRate }}%
                </span>
                <span class="conversion-detail">
                  ({{ feedbackForm.recharge }} / {{ feedbackForm.registration }})
                </span>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 数据质量评价 -->
        <el-form-item label="数据质量评价" prop="dataQuality">
          <el-radio-group v-model="feedbackForm.dataQuality">
            <el-radio label="excellent">优秀 (转化率 > 5%)</el-radio>
            <el-radio label="good">良好 (转化率 3-5%)</el-radio>
            <el-radio label="average">一般 (转化率 1-3%)</el-radio>
            <el-radio label="poor">较差 (转化率 < 1%)</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 详细反馈 -->
        <el-divider content-position="left">详细反馈</el-divider>

        <el-form-item :label="$t('feedback.content')" prop="content">
          <el-input
            v-model="feedbackForm.content"
            :placeholder="$t('feedback.enterContent')"
            type="textarea"
            :rows="6"
          />
          <div class="content-tips">
            请详细描述数据使用效果、质量问题、改进建议等
          </div>
        </el-form-item>

        <!-- 附加信息 -->
        <el-divider content-position="left">附加信息</el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="使用时间段">
              <el-date-picker
                v-model="feedbackForm.usagePeriod"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="使用数据量">
              <el-input-number
                v-model="feedbackForm.dataAmount"
                :min="0"
                style="width: 100%"
                controls-position="right"
                placeholder="使用的数据条数"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="推广渠道">
          <el-checkbox-group v-model="feedbackForm.channels">
            <el-checkbox label="短信营销">短信营销</el-checkbox>
            <el-checkbox label="电话营销">电话营销</el-checkbox>
            <el-checkbox label="邮件营销">邮件营销</el-checkbox>
            <el-checkbox label="社交媒体">社交媒体</el-checkbox>
            <el-checkbox label="其他">其他</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="改进建议">
          <el-input
            v-model="feedbackForm.suggestions"
            placeholder="对数据质量、价格、服务等方面的改进建议"
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
            {{ isEdit ? '保存修改' : $t('common.submit') }}
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
  name: 'CreateFeedback',
  mixins: [i18nMixin],
  data() {
    return {
      isEdit: false,
      feedbackForm: {
        targetSite: '',
        dataSource: '',
        traffic: 0,
        registration: 0,
        recharge: 0,
        dataQuality: 'good',
        content: '',
        usagePeriod: null,
        dataAmount: 0,
        channels: [],
        suggestions: ''
      },
      rules: {
        targetSite: [
          { required: true, message: this.$t('feedback.enterTargetSite'), trigger: 'blur' }
        ],
        dataSource: [
          { required: true, message: '请选择数据源', trigger: 'change' }
        ],
        traffic: [
          { required: true, message: this.$t('feedback.enterTraffic'), trigger: 'blur' },
          { type: 'number', min: 0, message: '访问量不能小于0', trigger: 'blur' }
        ],
        registration: [
          { required: true, message: this.$t('feedback.enterRegistration'), trigger: 'blur' },
          { type: 'number', min: 0, message: '注册数不能小于0', trigger: 'blur' }
        ],
        recharge: [
          { required: true, message: this.$t('feedback.enterRecharge'), trigger: 'blur' },
          { type: 'number', min: 0, message: '充值数不能小于0', trigger: 'blur' }
        ],
        content: [
          { required: true, message: this.$t('feedback.enterContent'), trigger: 'blur' },
          { min: 10, message: '反馈内容至少10个字符', trigger: 'blur' }
        ],
        dataQuality: [
          { required: true, message: '请选择数据质量评价', trigger: 'change' }
        ]
      },
      submitLoading: false
    }
  },
  computed: {
    registrationRate() {
      if (this.feedbackForm.traffic === 0) return '0.00'
      return ((this.feedbackForm.registration / this.feedbackForm.traffic) * 100).toFixed(2)
    },
    rechargeRate() {
      if (this.feedbackForm.registration === 0) return '0.00'
      return ((this.feedbackForm.recharge / this.feedbackForm.registration) * 100).toFixed(2)
    }
  },
  created() {
    const id = this.$route.query && this.$route.query.id
    if (id) {
      this.isEdit = true
      this.fetchFeedbackData(id)
    }
  },
  methods: {
    fetchFeedbackData(id) {
      // 模拟获取反馈数据
      this.feedbackForm = {
        targetSite: 'www.example-site1.com',
        dataSource: 'bangladesh_3',
        traffic: 15000,
        registration: 850,
        recharge: 120,
        dataQuality: 'excellent',
        content: '数据质量很好，转化率不错，建议继续采购此类数据。用户活跃度高，付费意愿强。',
        usagePeriod: [new Date('2023-11-01'), new Date('2023-11-30')],
        dataAmount: 10000,
        channels: ['短信营销', '电话营销'],
        suggestions: '建议增加更多高质量的3天内数据，价格可以适当提高。'
      }
    },
    submitForm() {
      this.$refs.feedbackForm.validate((valid) => {
        if (valid) {
          this.submitLoading = true

          // 模拟提交过程
          setTimeout(() => {
            this.$message.success(
              this.isEdit ? '反馈修改成功' : this.$t('feedback.submitSuccess')
            )
            this.submitLoading = false
            this.$router.push('/feedback/list')
          }, 2000)
        } else {
          return false
        }
      })
    },
    resetForm() {
      this.$refs.feedbackForm.resetFields()
    },
    goBack() {
      this.$router.go(-1)
    },
    getConversionClass(rate) {
      const rateNum = parseFloat(rate)
      if (rateNum >= 5) return 'conversion-high'
      if (rateNum >= 2) return 'conversion-medium'
      return 'conversion-low'
    }
  }
}
</script>

<style lang="scss" scoped>
.feedback-form {
  max-width: 800px;
  margin: 0 auto;
}

.content-tips {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.conversion-display {
  display: flex;
  align-items: center;

  .conversion-detail {
    margin-left: 10px;
    color: #909399;
    font-size: 12px;
  }
}

.conversion-high {
  color: #67c23a;
  font-weight: bold;
  font-size: 16px;
}

.conversion-medium {
  color: #e6a23c;
  font-weight: bold;
  font-size: 16px;
}

.conversion-low {
  color: #f56c6c;
  font-weight: bold;
  font-size: 16px;
}

.el-checkbox-group {
  .el-checkbox {
    margin-right: 20px;
    margin-bottom: 10px;
  }
}
</style>
