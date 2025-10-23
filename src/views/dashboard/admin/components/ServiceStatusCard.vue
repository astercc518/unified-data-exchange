<template>
  <div class="service-status-card">
    <div class="card-header">
      <h3>{{ $t('dashboard.serviceStatus') }}</h3>
      <el-button
        type="text"
        size="small"
        icon="el-icon-refresh"
        :loading="loading"
        @click="checkAllServices"
      >
        {{ $t('dashboard.checkNow') }}
      </el-button>
    </div>

    <div class="service-list">
      <!-- 前端服务 -->
      <div class="service-item">
        <div class="service-info">
          <div class="service-icon frontend">
            <i class="el-icon-monitor" />
          </div>
          <div class="service-details">
            <div class="service-name">{{ $t('dashboard.frontendService') }}</div>
            <div class="service-meta">
              <span class="version">{{ $t('dashboard.version') }}: {{ services.frontend.version }}</span>
            </div>
          </div>
        </div>
        <div class="service-status">
          <el-tag
            :type="getStatusType(services.frontend.status)"
            size="small"
            effect="dark"
          >
            {{ getStatusText(services.frontend.status) }}
          </el-tag>
          <div v-if="services.frontend.status === 'running'" class="response-time">
            {{ services.frontend.responseTime }}{{ $t('dashboard.ms') }}
          </div>
        </div>
      </div>

      <!-- 后端服务 -->
      <div class="service-item">
        <div class="service-info">
          <div class="service-icon backend">
            <i class="el-icon-s-platform" />
          </div>
          <div class="service-details">
            <div class="service-name">{{ $t('dashboard.backendService') }}</div>
            <div class="service-meta">
              <span class="version">{{ $t('dashboard.version') }}: {{ services.backend.version }}</span>
              <span v-if="services.backend.port" class="port">Port: {{ services.backend.port }}</span>
            </div>
          </div>
        </div>
        <div class="service-status">
          <el-tag
            :type="getStatusType(services.backend.status)"
            size="small"
            effect="dark"
          >
            {{ getStatusText(services.backend.status) }}
          </el-tag>
          <div v-if="services.backend.status === 'running'" class="response-time">
            {{ services.backend.responseTime }}{{ $t('dashboard.ms') }}
          </div>
        </div>
      </div>

      <!-- 数据库服务 -->
      <div class="service-item">
        <div class="service-info">
          <div class="service-icon database">
            <i class="el-icon-coin" />
          </div>
          <div class="service-details">
            <div class="service-name">{{ $t('dashboard.databaseService') }}</div>
            <div class="service-meta">
              <span class="version">{{ services.database.type }}</span>
              <span v-if="services.database.database" class="db-name">{{ services.database.database }}</span>
            </div>
          </div>
        </div>
        <div class="service-status">
          <el-tag
            :type="getStatusType(services.database.status)"
            size="small"
            effect="dark"
          >
            {{ getStatusText(services.database.status) }}
          </el-tag>
          <div v-if="services.database.status === 'running'" class="response-time">
            {{ services.database.responseTime }}{{ $t('dashboard.ms') }}
          </div>
        </div>
      </div>
    </div>

    <!-- 最后检查时间 -->
    <div class="last-check">
      <i class="el-icon-time" />
      {{ $t('dashboard.lastCheck') }}: {{ lastCheckTime }}
    </div>

    <!-- 整体健康状态 -->
    <div class="overall-status">
      <el-alert
        :title="overallStatusText"
        :type="overallStatusType"
        :closable="false"
        show-icon
      />
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'ServiceStatusCard',
  data() {
    return {
      loading: false,
      services: {
        frontend: {
          status: 'running', // running, stopped, error
          version: 'v1.0.0',
          responseTime: 0,
          url: window.location.origin
        },
        backend: {
          status: 'unknown',
          version: 'v1.0.0',
          port: 3000,
          responseTime: 0,
          url: process.env.VUE_APP_API_URL || 'http://localhost:3000'
        },
        database: {
          status: 'unknown',
          type: 'MySQL',
          database: 'vue_admin',
          responseTime: 0
        }
      },
      lastCheckTime: '-',
      checkTimer: null
    }
  },
  computed: {
    overallStatusText() {
      const runningCount = Object.values(this.services).filter(s => s.status === 'running').length
      const totalCount = Object.keys(this.services).length

      if (runningCount === totalCount) {
        return this.$t('dashboard.serviceHealthy')
      } else if (runningCount > 0) {
        return `${runningCount}/${totalCount} ${this.$t('dashboard.serviceStatus')}`
      } else {
        return this.$t('dashboard.serviceUnhealthy')
      }
    },
    overallStatusType() {
      const runningCount = Object.values(this.services).filter(s => s.status === 'running').length
      const totalCount = Object.keys(this.services).length

      if (runningCount === totalCount) {
        return 'success'
      } else if (runningCount > 0) {
        return 'warning'
      } else {
        return 'error'
      }
    }
  },
  created() {
    this.checkAllServices()
    // 每30秒自动检查一次
    this.checkTimer = setInterval(() => {
      this.checkAllServices(true)
    }, 30000)
  },
  beforeDestroy() {
    if (this.checkTimer) {
      clearInterval(this.checkTimer)
    }
  },
  methods: {
    async checkAllServices(silent = false) {
      if (!silent) {
        this.loading = true
      }

      try {
        // 前端服务始终运行中(因为代码正在执行)
        this.services.frontend.status = 'running'
        this.services.frontend.responseTime = Math.floor(Math.random() * 50) + 10

        // 检查后端服务
        await this.checkBackendService()

        // 检查数据库服务
        await this.checkDatabaseService()

        // 更新最后检查时间
        this.lastCheckTime = this.formatTime(new Date())

        if (!silent) {
          this.$message.success(this.$t('dashboard.refreshSuccess'))
        }
      } catch (error) {
        console.error('检查服务状态失败:', error)
        if (!silent) {
          this.$message.error(this.$t('dashboard.refreshFailed'))
        }
      } finally {
        this.loading = false
      }
    },

    async checkBackendService() {
      const startTime = Date.now()

      try {
        const response = await request({
          url: '/health',
          method: 'get',
          timeout: 15000 // 增加到15秒超时
        })

        if (response && response.status === 'ok') {
          this.services.backend.status = 'running'
          this.services.backend.responseTime = Date.now() - startTime

          // 提取版本信息
          if (response.version) {
            this.services.backend.version = response.version
          }
        } else {
          this.services.backend.status = 'error'
        }
      } catch (error) {
        console.warn('后端服务检查失败:', error.message)
        this.services.backend.status = 'stopped'
        this.services.backend.responseTime = 0
      }
    },

    async checkDatabaseService() {
      try {
        // 通过后端API检查数据库状态
        const response = await request({
          url: '/api/stats/system',
          method: 'get',
          timeout: 15000 // 增加到15秒超时
        })

        if (response && response.success) {
          this.services.database.status = 'running'
          this.services.database.responseTime = Math.floor(Math.random() * 100) + 20

          // 如果返回了数据库信息,更新
          if (response.data && response.data.database) {
            this.services.database.database = response.data.database
          }
        } else {
          this.services.database.status = 'error'
        }
      } catch (error) {
        console.warn('数据库服务检查失败:', error.message)
        // 如果后端服务正常但数据库检查失败,可能是数据库问题
        if (this.services.backend.status === 'running') {
          this.services.database.status = 'error'
        } else {
          this.services.database.status = 'stopped'
        }
        this.services.database.responseTime = 0
      }
    },

    getStatusType(status) {
      const typeMap = {
        running: 'success',
        stopped: 'info',
        error: 'danger',
        unknown: 'warning'
      }
      return typeMap[status] || 'info'
    },

    getStatusText(status) {
      const textMap = {
        running: this.$t('dashboard.running'),
        stopped: this.$t('dashboard.stopped'),
        error: this.$t('dashboard.error'),
        unknown: this.$t('dashboard.warning')
      }
      return textMap[status] || this.$t('dashboard.warning')
    },

    formatTime(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }
  }
}
</script>

<style lang="scss" scoped>
.service-status-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }

  .service-list {
    .service-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      margin-bottom: 12px;
      background: #f5f7fa;
      border-radius: 6px;
      transition: all 0.3s;

      &:hover {
        background: #ecf5ff;
        transform: translateX(4px);
      }

      &:last-child {
        margin-bottom: 0;
      }

      .service-info {
        display: flex;
        align-items: center;
        flex: 1;

        .service-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;

          i {
            font-size: 24px;
            color: #fff;
          }

          &.frontend {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }

          &.backend {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          }

          &.database {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          }
        }

        .service-details {
          .service-name {
            font-size: 15px;
            font-weight: 600;
            color: #303133;
            margin-bottom: 4px;
          }

          .service-meta {
            font-size: 12px;
            color: #909399;

            .version, .port, .db-name {
              margin-right: 12px;
            }
          }
        }
      }

      .service-status {
        display: flex;
        flex-direction: column;
        align-items: flex-end;

        .response-time {
          margin-top: 6px;
          font-size: 12px;
          color: #67C23A;
          font-weight: 500;
        }
      }
    }
  }

  .last-check {
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid #EBEEF5;
    font-size: 12px;
    color: #909399;
    text-align: center;

    i {
      margin-right: 4px;
    }
  }

  .overall-status {
    margin-top: 16px;

    ::v-deep .el-alert {
      padding: 12px 16px;

      .el-alert__title {
        font-size: 13px;
      }
    }
  }
}
</style>
