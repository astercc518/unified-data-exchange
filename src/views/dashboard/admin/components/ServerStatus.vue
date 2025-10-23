<template>
  <el-card class="server-status-card">
    <div slot="header" class="clearfix">
      <span>服务器状态监控</span>
      <el-button
        style="float: right; padding: 3px 0"
        type="text"
        icon="el-icon-refresh"
        :loading="loading"
        @click="fetchServerStatus"
      >
        刷新
      </el-button>
    </div>

    <div v-loading="loading" class="status-content">
      <!-- 系统信息 -->
      <el-row :gutter="20" class="status-section">
        <el-col :span="24">
          <h4 class="section-title">系统资源</h4>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="info-item">
            <div class="info-label">CPU型号</div>
            <div class="info-value">{{ serverData.system.cpuModel || '-' }}</div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="info-item">
            <div class="info-label">CPU核心数</div>
            <div class="info-value">{{ serverData.system.cpuCores || 0 }} 核</div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="info-item">
            <div class="info-label">系统运行时间</div>
            <div class="info-value">{{ serverData.system.uptime || '-' }}</div>
          </div>
        </el-col>
      </el-row>

      <!-- 内存使用情况 -->
      <el-row :gutter="20" class="status-section">
        <el-col :span="24">
          <h4 class="section-title">内存使用情况</h4>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="info-item">
            <div class="info-label">总内存</div>
            <div class="info-value">{{ serverData.system.totalMemory || '-' }}</div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="info-item">
            <div class="info-label">已使用</div>
            <div class="info-value">{{ serverData.system.usedMemory || '-' }}</div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="info-item">
            <div class="info-label">空闲内存</div>
            <div class="info-value">{{ serverData.system.freeMemory || '-' }}</div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="info-item highlight">
            <div class="info-label">使用率</div>
            <div class="info-value" :class="memoryUsageClass">
              {{ serverData.system.memoryUsage || '-' }}
            </div>
          </div>
        </el-col>
        <el-col :span="24" style="margin-top: 10px;">
          <el-progress
            :percentage="parseFloat(serverData.system.memoryUsage) || 0"
            :status="memoryProgressStatus"
            :stroke-width="18"
          />
        </el-col>
      </el-row>

      <!-- 服务状态 -->
      <el-row :gutter="20" class="status-section">
        <el-col :span="24">
          <h4 class="section-title">服务运行状态</h4>
        </el-col>
        <el-col :span="24">
          <el-table
            :data="serverData.services"
            style="width: 100%"
            size="small"
          >
            <el-table-column prop="name" label="服务名称" width="120" />
            <el-table-column label="状态" width="100">
              <template slot-scope="scope">
                <el-tag
                  :type="scope.row.status === 'online' ? 'success' : 'danger'"
                  size="mini"
                >
                  {{ scope.row.status === 'online' ? '运行中' : '已停止' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="memoryMB" label="内存使用" width="120">
              <template slot-scope="scope">
                {{ scope.row.memoryMB }} MB
              </template>
            </el-table-column>
            <el-table-column prop="cpu" label="CPU" width="80">
              <template slot-scope="scope">
                {{ scope.row.cpu }}%
              </template>
            </el-table-column>
            <el-table-column prop="restarts" label="重启次数" width="100" />
            <el-table-column label="运行时长" min-width="120">
              <template slot-scope="scope">
                {{ formatUptime(scope.row.uptime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-refresh-right"
                  :loading="restartingService === scope.row.name"
                  @click="handleRestartService(scope.row.name)"
                >
                  重启
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>

      <!-- 数据库状态 -->
      <el-row :gutter="20" class="status-section">
        <el-col :span="24">
          <h4 class="section-title">数据库状态</h4>
        </el-col>
        <el-col :span="24">
          <div class="info-item">
            <div class="info-label">连接状态</div>
            <div class="info-value">
              <el-tag
                :type="serverData.database.status === 'connected' ? 'success' : 'danger'"
                size="small"
              >
                {{ serverData.database.status === 'connected' ? '已连接' : '未连接' }}
              </el-tag>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 快捷操作 -->
      <el-row :gutter="20" class="status-section">
        <el-col :span="24">
          <h4 class="section-title">快捷操作</h4>
        </el-col>
        <el-col :span="24">
          <el-button
            type="warning"
            icon="el-icon-refresh-right"
            :loading="restartingService === 'all'"
            @click="handleRestartAll"
          >
            重启所有服务
          </el-button>
          <el-button
            type="info"
            icon="el-icon-view"
            @click="handleViewLogs"
          >
            查看日志
          </el-button>
        </el-col>
      </el-row>

      <!-- 最后更新时间 -->
      <div class="update-time">
        最后更新: {{ lastUpdateTime }}
      </div>
    </div>
  </el-card>
</template>

<script>
import { getServerStatus, restartService } from '@/api/stats'

export default {
  name: 'ServerStatus',
  data() {
    return {
      loading: false,
      restartingService: null,
      lastUpdateTime: '-',
      serverData: {
        system: {
          totalMemory: '-',
          freeMemory: '-',
          usedMemory: '-',
          memoryUsage: '0%',
          cpuModel: '-',
          cpuCores: 0,
          uptime: '-'
        },
        services: [],
        database: {
          status: 'disconnected'
        }
      },
      autoRefreshTimer: null
    }
  },
  computed: {
    memoryUsageClass() {
      const usage = parseFloat(this.serverData.system.memoryUsage)
      if (usage > 80) return 'danger'
      if (usage > 60) return 'warning'
      return 'success'
    },
    memoryProgressStatus() {
      const usage = parseFloat(this.serverData.system.memoryUsage)
      if (usage > 80) return 'exception'
      if (usage > 60) return 'warning'
      return 'success'
    }
  },
  mounted() {
    this.fetchServerStatus()
    // 每30秒自动刷新
    this.autoRefreshTimer = setInterval(() => {
      this.fetchServerStatus()
    }, 30000)
  },
  beforeDestroy() {
    if (this.autoRefreshTimer) {
      clearInterval(this.autoRefreshTimer)
    }
  },
  methods: {
    async fetchServerStatus() {
      this.loading = true
      try {
        const response = await getServerStatus()
        if (response.success) {
          this.serverData = response.data
          this.lastUpdateTime = new Date().toLocaleString('zh-CN')
        } else {
          this.$message.error('获取服务器状态失败')
        }
      } catch (error) {
        console.error('获取服务器状态失败:', error)
        this.$message.error('获取服务器状态失败: ' + error.message)
      } finally {
        this.loading = false
      }
    },
    async handleRestartService(serviceName) {
      this.$confirm(`确定要重启 ${serviceName} 服务吗？`, '确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        this.restartingService = serviceName
        try {
          const response = await restartService(serviceName)
          if (response.success) {
            this.$message.success('服务重启成功')
            // 延迟2秒后刷新状态
            setTimeout(() => {
              this.fetchServerStatus()
            }, 2000)
          } else {
            this.$message.error('服务重启失败: ' + response.message)
          }
        } catch (error) {
          console.error('重启服务失败:', error)
          this.$message.error('服务重启失败: ' + error.message)
        } finally {
          this.restartingService = null
        }
      }).catch(() => {
        // 取消操作
      })
    },
    handleRestartAll() {
      this.$confirm('确定要重启所有服务吗？这将导致短暂的服务中断。', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        this.restartingService = 'all'
        try {
          const response = await restartService('all')
          if (response.success) {
            this.$message.success('所有服务重启成功')
            // 延迟3秒后刷新状态
            setTimeout(() => {
              this.fetchServerStatus()
            }, 3000)
          } else {
            this.$message.error('服务重启失败: ' + response.message)
          }
        } catch (error) {
          console.error('重启所有服务失败:', error)
          this.$message.error('服务重启失败: ' + error.message)
        } finally {
          this.restartingService = null
        }
      }).catch(() => {
        // 取消操作
      })
    },
    handleViewLogs() {
      this.$message.info('日志查看功能开发中...')
    },
    formatUptime(timestamp) {
      if (!timestamp) return '-'
      const now = Date.now()
      const diff = now - timestamp
      const hours = Math.floor(diff / 3600000)
      const minutes = Math.floor((diff % 3600000) / 60000)
      return `${hours}小时${minutes}分钟`
    }
  }
}
</script>

<style lang="scss" scoped>
.server-status-card {
  margin-top: 20px;
  
  .status-content {
    min-height: 200px;
  }

  .status-section {
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid #ebeef5;

    &:last-child {
      border-bottom: none;
    }
  }

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 15px;
    padding-left: 10px;
    border-left: 4px solid #409eff;
  }

  .info-item {
    padding: 12px;
    background: #f5f7fa;
    border-radius: 4px;
    margin-bottom: 10px;

    &.highlight {
      background: #ecf5ff;
      border: 1px solid #d9ecff;
    }

    .info-label {
      font-size: 12px;
      color: #909399;
      margin-bottom: 8px;
    }

    .info-value {
      font-size: 16px;
      font-weight: 600;
      color: #303133;

      &.success {
        color: #67c23a;
      }

      &.warning {
        color: #e6a23c;
      }

      &.danger {
        color: #f56c6c;
      }
    }
  }

  .update-time {
    text-align: center;
    color: #909399;
    font-size: 12px;
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px dashed #dcdfe6;
  }
}
</style>
