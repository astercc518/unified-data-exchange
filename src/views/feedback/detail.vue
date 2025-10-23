<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="clearfix">
        <span>{{ $t('feedback.detail') }}</span>
        <el-button
          style="float: right; padding: 3px 0"
          type="text"
          @click="goBack"
        >
          {{ $t('common.back') }}
        </el-button>
      </div>

      <div v-if="feedbackDetail">
        <el-row :gutter="20">
          <!-- 反馈基本信息 -->
          <el-col :span="16">
            <el-card class="detail-card">
              <div slot="header">反馈基本信息</div>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="反馈ID">
                  {{ feedbackDetail.id }}
                </el-descriptions-item>
                <el-descriptions-item :label="$t('feedback.targetSite')">
                  <a :href="'http://' + feedbackDetail.targetSite" target="_blank" class="site-link">
                    {{ feedbackDetail.targetSite }}
                  </a>
                </el-descriptions-item>
                <el-descriptions-item :label="$t('feedback.dataSource')">
                  {{ feedbackDetail.dataSource }}
                </el-descriptions-item>
                <el-descriptions-item label="数据质量评价">
                  <el-tag :type="getQualityTagType(feedbackDetail.dataQuality)">
                    {{ getQualityText(feedbackDetail.dataQuality) }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="提交者">
                  {{ feedbackDetail.submitter }}
                </el-descriptions-item>
                <el-descriptions-item :label="$t('feedback.feedbackTime')">
                  {{ feedbackDetail.feedbackTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}
                </el-descriptions-item>
                <el-descriptions-item label="使用数据量">
                  {{ formatNumber(feedbackDetail.dataAmount) }} 条
                </el-descriptions-item>
                <el-descriptions-item label="使用时间段">
                  {{ feedbackDetail.usagePeriod[0] | parseTime('{y}-{m}-{d}') }} 至
                  {{ feedbackDetail.usagePeriod[1] | parseTime('{y}-{m}-{d}') }}
                </el-descriptions-item>
              </el-descriptions>
            </el-card>

            <!-- 数据效果分析 -->
            <el-card class="detail-card" style="margin-top: 20px;">
              <div slot="header">{{ $t('feedback.effectAnalysis') }}</div>
              <el-row :gutter="20">
                <el-col :span="12">
                  <div class="effect-item">
                    <div class="effect-label">{{ $t('feedback.traffic') }}</div>
                    <div class="effect-value traffic">{{ formatNumber(feedbackDetail.traffic) }}</div>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="effect-item">
                    <div class="effect-label">{{ $t('feedback.registration') }}</div>
                    <div class="effect-value registration">{{ formatNumber(feedbackDetail.registration) }}</div>
                  </div>
                </el-col>
                <el-col :span="12" style="margin-top: 20px;">
                  <div class="effect-item">
                    <div class="effect-label">{{ $t('feedback.recharge') }}</div>
                    <div class="effect-value recharge">{{ formatNumber(feedbackDetail.recharge) }}</div>
                  </div>
                </el-col>
                <el-col :span="12" style="margin-top: 20px;">
                  <div class="effect-item">
                    <div class="effect-label">有效数据率</div>
                    <div class="effect-value effective">{{ feedbackDetail.effectiveRate }}%</div>
                  </div>
                </el-col>
              </el-row>

              <!-- 转化率图表 -->
              <el-divider>转化率分析</el-divider>
              <el-row :gutter="20">
                <el-col :span="12">
                  <div class="conversion-chart">
                    <div class="chart-title">注册转化率</div>
                    <div class="chart-value">
                      <span :class="getConversionClass(feedbackDetail.registrationRate)">
                        {{ feedbackDetail.registrationRate }}%
                      </span>
                    </div>
                    <div class="chart-detail">
                      {{ feedbackDetail.registration }} / {{ feedbackDetail.traffic }}
                    </div>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="conversion-chart">
                    <div class="chart-title">充值转化率</div>
                    <div class="chart-value">
                      <span :class="getConversionClass(feedbackDetail.rechargeRate)">
                        {{ feedbackDetail.rechargeRate }}%
                      </span>
                    </div>
                    <div class="chart-detail">
                      {{ feedbackDetail.recharge }} / {{ feedbackDetail.registration }}
                    </div>
                  </div>
                </el-col>
              </el-row>
            </el-card>

            <!-- 详细反馈内容 -->
            <el-card class="detail-card" style="margin-top: 20px;">
              <div slot="header">详细反馈内容</div>
              <div class="feedback-content">
                {{ feedbackDetail.content }}
              </div>
            </el-card>

            <!-- 推广渠道和建议 -->
            <el-card class="detail-card" style="margin-top: 20px;">
              <div slot="header">推广渠道和改进建议</div>
              <el-descriptions :column="1" border>
                <el-descriptions-item label="使用的推广渠道">
                  <el-tag
                    v-for="channel in feedbackDetail.channels"
                    :key="channel"
                    style="margin-right: 10px;"
                  >
                    {{ channel }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="改进建议">
                  {{ feedbackDetail.suggestions || '无' }}
                </el-descriptions-item>
              </el-descriptions>
            </el-card>
          </el-col>

          <!-- 操作面板和相关数据 -->
          <el-col :span="8">
            <el-card class="action-card">
              <div slot="header">操作</div>
              <div class="action-buttons">
                <el-button
                  type="primary"
                  size="medium"
                  style="width: 100%; margin-bottom: 10px;"
                  @click="handleEdit"
                >
                  编辑反馈
                </el-button>

                <el-button
                  type="success"
                  size="medium"
                  style="width: 100%; margin-bottom: 10px;"
                  @click="handleExport"
                >
                  导出报告
                </el-button>

                <el-button
                  type="warning"
                  size="medium"
                  style="width: 100%; margin-bottom: 10px;"
                  @click="handleShare"
                >
                  分享反馈
                </el-button>
              </div>
            </el-card>

            <!-- 相关统计 -->
            <el-card style="margin-top: 20px;">
              <div slot="header">相关统计</div>
              <div class="related-stats">
                <div class="stat-item">
                  <div class="stat-label">该数据源总反馈</div>
                  <div class="stat-value">15 条</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">平均转化率</div>
                  <div class="stat-value">4.2%</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">该站点历史反馈</div>
                  <div class="stat-value">3 条</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">数据质量评级</div>
                  <div class="stat-value">
                    <el-rate
                      v-model="qualityRating"
                      disabled
                      show-score
                      text-color="#ff9900"
                    />
                  </div>
                </div>
              </div>
            </el-card>

            <!-- 推荐数据源 -->
            <el-card style="margin-top: 20px;">
              <div slot="header">推荐数据源</div>
              <div class="recommended-sources">
                <div v-for="source in recommendedSources" :key="source.name" class="source-item">
                  <div class="source-name">{{ source.name }}</div>
                  <div class="source-quality">
                    <el-tag :type="getQualityTagType(source.quality)" size="mini">
                      {{ getQualityText(source.quality) }}
                    </el-tag>
                  </div>
                  <div class="source-rate">转化率: {{ source.conversionRate }}%</div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script>
import { parseTime } from '@/utils'
import i18nMixin from '@/mixins/i18n'

export default {
  name: 'FeedbackDetail',
  filters: {
    parseTime
  },
  mixins: [i18nMixin],
  data() {
    return {
      feedbackDetail: null,
      qualityRating: 4.5,
      recommendedSources: [
        {
          name: '孟加拉国-3天内',
          quality: 'excellent',
          conversionRate: 5.2
        },
        {
          name: '印度-3天内',
          quality: 'good',
          conversionRate: 4.8
        },
        {
          name: '巴基斯坦-3天内',
          quality: 'good',
          conversionRate: 4.1
        }
      ]
    }
  },
  created() {
    const id = this.$route.params && this.$route.params.id
    this.fetchFeedbackDetail(id)
  },
  methods: {
    fetchFeedbackDetail(id) {
      // 模拟获取反馈详情
      this.feedbackDetail = {
        id: id,
        targetSite: 'www.example-site1.com',
        dataSource: '孟加拉国-3天内',
        traffic: 15000,
        registration: 850,
        recharge: 120,
        registrationRate: 5.67,
        rechargeRate: 14.12,
        effectiveRate: 89.5,
        dataQuality: 'excellent',
        submitter: '张三',
        feedbackTime: new Date('2023-12-01 10:30:00'),
        content: '数据质量很好，转化率不错，建议继续采购此类数据。用户活跃度高，付费意愿强。通过短信和电话双重营销，效果显著提升。建议在高峰时段推送，转化效果更佳。数据中的年轻用户群体对游戏类产品兴趣浓厚，建议针对性推广。',
        dataAmount: 10000,
        usagePeriod: [new Date('2023-11-01'), new Date('2023-11-30')],
        channels: ['短信营销', '电话营销', '社交媒体'],
        suggestions: '建议增加更多高质量的3天内数据，价格可以适当提高。希望能提供更精细的用户标签，如年龄段、兴趣爱好等，以便精准营销。'
      }
    },
    handleEdit() {
      this.$router.push(`/feedback/create?id=${this.feedbackDetail.id}`)
    },
    handleExport() {
      this.$message.success('反馈报告导出成功')
    },
    handleShare() {
      this.$message.success('反馈链接已复制到剪贴板')
    },
    goBack() {
      this.$router.go(-1)
    },
    formatNumber(num) {
      return num.toLocaleString()
    },
    getConversionClass(rate) {
      if (rate >= 5) return 'conversion-high'
      if (rate >= 2) return 'conversion-medium'
      return 'conversion-low'
    },
    getQualityTagType(quality) {
      const tagMap = {
        excellent: 'success',
        good: 'primary',
        average: 'warning',
        poor: 'danger'
      }
      return tagMap[quality]
    },
    getQualityText(quality) {
      const textMap = {
        excellent: '优秀',
        good: '良好',
        average: '一般',
        poor: '较差'
      }
      return textMap[quality]
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-card {
  margin-bottom: 20px;
}

.action-card {
  height: fit-content;

  .action-buttons {
    display: flex;
    flex-direction: column;
  }
}

.site-link {
  color: #409eff;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

.effect-item {
  text-align: center;
  padding: 20px;

  .effect-label {
    font-size: 14px;
    color: #606266;
    margin-bottom: 10px;
  }

  .effect-value {
    font-size: 24px;
    font-weight: bold;

    &.traffic {
      color: #409eff;
    }

    &.registration {
      color: #67c23a;
    }

    &.recharge {
      color: #e6a23c;
    }

    &.effective {
      color: #f56c6c;
    }
  }
}

.conversion-chart {
  text-align: center;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;

  .chart-title {
    font-size: 14px;
    color: #606266;
    margin-bottom: 10px;
  }

  .chart-value {
    margin-bottom: 5px;
  }

  .chart-detail {
    font-size: 12px;
    color: #909399;
  }
}

.conversion-high {
  color: #67c23a;
  font-weight: bold;
  font-size: 28px;
}

.conversion-medium {
  color: #e6a23c;
  font-weight: bold;
  font-size: 28px;
}

.conversion-low {
  color: #f56c6c;
  font-weight: bold;
  font-size: 28px;
}

.feedback-content {
  line-height: 1.8;
  color: #606266;
  font-size: 14px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}

.related-stats {
  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;

    .stat-label {
      font-size: 14px;
      color: #606266;
    }

    .stat-value {
      font-weight: bold;
      color: #409eff;
    }
  }
}

.recommended-sources {
  .source-item {
    padding: 10px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    margin-bottom: 10px;

    .source-name {
      font-weight: bold;
      margin-bottom: 5px;
    }

    .source-quality {
      margin-bottom: 5px;
    }

    .source-rate {
      font-size: 12px;
      color: #909399;
    }
  }
}
</style>
