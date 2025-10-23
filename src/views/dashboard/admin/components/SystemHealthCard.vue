<template>
  <div class="system-health-card">
    <div class="card-header">
      <h3>{{ $t('dashboard.systemHealth') }}</h3>
      <el-button
        type="text"
        size="small"
        icon="el-icon-refresh"
        :loading="loading"
        @click="refreshSystemHealth"
      />
    </div>

    <div class="health-metrics">
      <!-- CPU使用率 -->
      <div class="metric-item">
        <div class="metric-label">
          <i class="el-icon-cpu" />
          {{ $t('dashboard.cpuUsage') }}
        </div>
        <div class="metric-value">
          <el-progress
            :percentage="systemHealth.cpuUsage"
            :color="getProgressColor(systemHealth.cpuUsage)"
            :show-text="false"
          />
          <span class="percentage">{{ systemHealth.cpuUsage }}{{ $t('dashboard.percent') }}</span>
        </div>
      </div>

      <!-- 内存使用率 -->
      <div class="metric-item">
        <div class="metric-label">
          <i class="el-icon-memory-card" />
          {{ $t('dashboard.memoryUsage') }}
        </div>
        <div class="metric-value">
          <el-progress
            :percentage="systemHealth.memoryUsage"
            :color="getProgressColor(systemHealth.memoryUsage)"
            :show-text="false"
          />
          <span class="percentage">{{ systemHealth.memoryUsage }}{{ $t('dashboard.percent') }}</span>
        </div>
      </div>

      <!-- 磁盘使用率 -->
      <div class="metric-item">
        <div class="metric-label">
          <i class="el-icon-folder" />
          {{ $t('dashboard.diskUsage') }}
        </div>
        <div class="metric-value">
          <el-progress
            :percentage="systemHealth.diskUsage"
            :color="getProgressColor(systemHealth.diskUsage)"
            :show-text="false"
          />
          <span class="percentage">{{ systemHealth.diskUsage }}{{ $t('dashboard.percent') }}</span>
        </div>
      </div>

      <!-- 网络状态 -->
      <div class="metric-item">
        <div class="metric-label">
          <i class="el-icon-connection" />
          {{ $t('dashboard.networkStatus') }}
        </div>
        <div class="metric-value network-status">
          <el-tag
            :type="getNetworkStatusType(systemHealth.networkStatus)"
            size="small"
          >
            {{ getNetworkStatusText(systemHealth.networkStatus) }}
          </el-tag>
          <span class="network-speed">{{ systemHealth.networkSpeed }} MB/s</span>
        </div>
      </div>
    </div>

    <!-- 系统运行时间 -->
    <div class="uptime-section">
      <div class="uptime-label">{{ $t('dashboard.systemUptime') }}</div>
      <div class="uptime-value">{{ formatUptime(systemHealth.uptime) }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SystemHealthCard',
  data() {
    return {
      loading: false,
      systemHealth: {
        cpuUsage: 45, // CPU使用率 %
        memoryUsage: 62, // 内存使用率 %
        diskUsage: 35, // 磁盘使用率 %
        networkStatus: 'normal', // normal, warning, error
        networkSpeed: 125.6, // 网络速度 MB/s
        uptime: 2592000000 // 系统运行时间（毫秒）
      }
    }
  },
  created() {
    this.loadSystemHealth()
    // 每10秒更新一次系统健康状态
    this.healthTimer = setInterval(() => {
      this.loadSystemHealth()
    }, 10000)
  },
  beforeDestroy() {
    if (this.healthTimer) {
      clearInterval(this.healthTimer)
    }
  },
  methods: {
    async refreshSystemHealth() {
      this.loading = true
      try {
        await this.loadSystemHealth()
        this.$message.success(this.$t('dashboard.refreshSuccess'))
      } catch (error) {
        this.$message.error(this.$t('dashboard.refreshFailed'))
      } finally {
        this.loading = false
      }
    },
    async loadSystemHealth() {
      // 模拟API调用获取系统健康状态
      return new Promise((resolve) => {
        setTimeout(() => {
          // 模拟数据变化
          this.systemHealth = {
            cpuUsage: Math.floor(Math.random() * 40) + 30, // 30-70%
            memoryUsage: Math.floor(Math.random() * 30) + 50, // 50-80%
            diskUsage: Math.floor(Math.random() * 20) + 30, // 30-50%
            networkStatus: ['normal', 'normal', 'normal', 'warning'][Math.floor(Math.random() * 4)],
            networkSpeed: (Math.random() * 50 + 100).toFixed(1), // 100-150 MB/s
            uptime: this.systemHealth.uptime + 10000 // 增加10秒
          }
          resolve()
        }, 500)
      })
    },
    getProgressColor(percentage) {
      if (percentage < 50) return '#67C23A'
      if (percentage < 80) return '#E6A23C'
      return '#F56C6C'
    },
    getNetworkStatusType(status) {
      const typeMap = {
        normal: 'success',
        warning: 'warning',
        error: 'danger'
      }
      return typeMap[status] || 'info'
    },
    getNetworkStatusText(status) {
      const textMap = {
        normal: this.$t('dashboard.normal'),
        warning: this.$t('dashboard.warning'),
        error: this.$t('dashboard.error')
      }
      return textMap[status] || this.$t('dashboard.normal')
    },
    formatUptime(milliseconds) {
      const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24))
      const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))

      return `${days}${this.$t('dashboard.days')} ${hours}${this.$t('dashboard.hours')} ${minutes}${this.$t('dashboard.minutes')}`
    }
  }
}
</script>

<style lang="scss" scoped>
.system-health-card {
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

  .health-metrics {
    .metric-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }

      .metric-label {
        display: flex;
        align-items: center;
        font-size: 14px;
        color: #606266;
        min-width: 120px;

        i {
          margin-right: 8px;
          font-size: 16px;
        }
      }

      .metric-value {
        display: flex;
        align-items: center;
        flex: 1;
        margin-left: 16px;

        .el-progress {
          flex: 1;
          margin-right: 12px;
        }

        .percentage {
          font-size: 12px;
          color: #909399;
          min-width: 40px;
          text-align: right;
        }

        &.network-status {
          justify-content: flex-end;

          .network-speed {
            margin-left: 8px;
            font-size: 12px;
            color: #909399;
          }
        }
      }
    }
  }

  .uptime-section {
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid #EBEEF5;
    text-align: center;

    .uptime-label {
      font-size: 12px;
      color: #909399;
      margin-bottom: 4px;
    }

    .uptime-value {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
    }
  }
}
</style>
