<template>
  <div class="parse-phone-card">
    <el-card shadow="hover" :body-style="{ padding: '20px' }">
      <div class="card-header">
        <div class="icon-wrapper">
          <i class="el-icon-phone-outline" />
        </div>
        <div class="header-text">
          <h3>parsePhoneNumber</h3>
          <p>号码解析服务</p>
        </div>
      </div>

      <div v-loading="loading" class="card-content">
        <!-- 服务状态 -->
        <div class="status-row">
          <span class="label">服务状态:</span>
          <el-tag
            :type="parsePhoneData && parsePhoneData.available ? 'success' : 'danger'"
            size="small"
            effect="dark"
          >
            {{ parsePhoneData && parsePhoneData.available ? '正常运行' : '不可用' }}
          </el-tag>
        </div>

        <!-- 版本信息 -->
        <div v-if="parsePhoneData && parsePhoneData.version" class="status-row">
          <span class="label">版本:</span>
          <span class="value">v{{ parsePhoneData.version }}</span>
        </div>

        <!-- 测试结果 -->
        <div v-if="parsePhoneData && parsePhoneData.testResult" class="status-row">
          <span class="label">测试通过率:</span>
          <span class="value">
            {{ parsePhoneData.testResult.success }}/{{ parsePhoneData.testResult.total }}
            <span :class="testPassRateClass">
              ({{ testPassRate }}%)
            </span>
          </span>
        </div>

        <!-- 支持国家数 -->
        <div class="status-row">
          <span class="label">支持国家:</span>
          <span class="value">70+ 个国家/地区</span>
        </div>

        <!-- 最后检查时间 -->
        <div class="status-row">
          <span class="label">最后检查:</span>
          <span class="value time">{{ (parsePhoneData && parsePhoneData.lastCheck) || '-' }}</span>
        </div>

        <!-- 状态消息 -->
        <div v-if="parsePhoneData && parsePhoneData.message" class="message-box">
          <el-alert
            :title="parsePhoneData.message"
            :type="parsePhoneData && parsePhoneData.available ? 'success' : 'warning'"
            :closable="false"
            show-icon
          />
        </div>

        <!-- 操作按钮 -->
        <div class="actions">
          <el-button
            type="primary"
            size="small"
            icon="el-icon-refresh"
            :loading="loading"
            @click="checkStatus"
          >
            立即检查
          </el-button>
          <el-button
            type="info"
            size="small"
            icon="el-icon-document"
            @click="viewDetails"
          >
            查看详情
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'ParsePhoneCard',
  data() {
    return {
      loading: false,
      parsePhoneData: {
        available: false,
        version: null,
        testResult: null,
        message: '',
        lastCheck: '-'
      },
      autoRefreshTimer: null
    }
  },
  computed: {
    testPassRate() {
      if (!this.parsePhoneData || !this.parsePhoneData.testResult) return 0
      const { success, total } = this.parsePhoneData.testResult
      return total > 0 ? Math.round((success / total) * 100) : 0
    },
    testPassRateClass() {
      const rate = this.testPassRate
      if (rate === 100) return 'success'
      if (rate >= 80) return 'warning'
      return 'danger'
    }
  },
  mounted() {
    this.checkStatus()
    // 每2分钟自动检查一次
    this.autoRefreshTimer = setInterval(() => {
      this.checkStatus(true)
    }, 120000)
  },
  beforeDestroy() {
    if (this.autoRefreshTimer) {
      clearInterval(this.autoRefreshTimer)
    }
  },
  methods: {
    async checkStatus(silent = false) {
      this.loading = !silent
      try {
        const response = await request({
          url: '/api/stats/parsephone-status',
          method: 'get'
        })
        
        if (response.success) {
          this.parsePhoneData = response.data
          // 格式化时间
          if (response.data.lastCheck) {
            this.parsePhoneData.lastCheck = new Date(response.data.lastCheck).toLocaleString('zh-CN')
          }
        }
      } catch (error) {
        console.error('获取 parsePhoneNumber 状态失败:', error)
        this.parsePhoneData = {
          available: false,
          message: '无法连接到 parsePhoneNumber 服务',
          lastCheck: new Date().toLocaleString('zh-CN')
        }
      } finally {
        this.loading = false
      }
    },
    viewDetails() {
      // 显示测试详情
      if (this.parsePhoneData.testResult && this.parsePhoneData.testResult.details) {
        const details = this.parsePhoneData.testResult.details
        const html = details.map(item => 
          `<p><strong>${item.country}:</strong> ${item.number} - ${item.valid ? '✓ 通过' : '✗ 失败'}</p>`
        ).join('')
        
        this.$alert(html, '测试详情', {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '关闭'
        })
      } else {
        this.$message.info('暂无测试详情')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.parse-phone-card {
  height: 100%;
  margin-bottom: 32px;

  .el-card {
    height: 100%;
    min-height: 400px;
    border-radius: 8px;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }
  }

  .card-header {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 12px;
    border-bottom: 2px solid #f0f0f0;

    .icon-wrapper {
      width: 45px;
      height: 45px;
      border-radius: 10px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;

      i {
        font-size: 24px;
        color: white;
      }
    }

    .header-text {
      flex: 1;

      h3 {
        margin: 0 0 4px 0;
        font-size: 15px;
        font-weight: 600;
        color: #303133;
      }

      p {
        margin: 0;
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .card-content {
    .status-row {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      padding: 6px 0;

      .label {
        font-size: 13px;
        color: #606266;
        min-width: 90px;
        font-weight: 500;
      }

      .value {
        font-size: 13px;
        color: #303133;

        &.time {
          font-size: 11px;
          color: #909399;
        }

        .success {
          color: #67c23a;
          font-weight: 600;
        }

        .warning {
          color: #e6a23c;
          font-weight: 600;
        }

        .danger {
          color: #f56c6c;
          font-weight: 600;
        }
      }
    }

    .message-box {
      margin: 12px 0;
    }

    .actions {
      margin-top: 15px;
      padding-top: 12px;
      border-top: 1px solid #f0f0f0;
      display: flex;
      gap: 8px;

      .el-button {
        flex: 1;
      }
    }
  }
}
</style>
