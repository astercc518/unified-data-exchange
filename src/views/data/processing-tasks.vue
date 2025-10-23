<template>
  <div class="processing-tasks-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">
        <i class="el-icon-s-order" /> 数据处理任务
      </h2>
      <p class="page-description">查看和管理数据处理任务的进度与结果</p>
    </div>

    <!-- 任务统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card stat-card-total" shadow="hover">
          <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
            <i class="el-icon-s-order" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ taskStats.total }}</div>
            <div class="stat-label">全部任务</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card stat-card-processing" shadow="hover">
          <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
            <i class="el-icon-loading" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ taskStats.processing }}</div>
            <div class="stat-label">处理中</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card stat-card-pending" shadow="hover">
          <div class="stat-icon" style="background: linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)">
            <i class="el-icon-time" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ taskStats.pending }}</div>
            <div class="stat-label">待处理</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card stat-card-completed" shadow="hover">
          <div class="stat-icon" style="background: linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)">
            <i class="el-icon-circle-check" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ taskStats.completed }}</div>
            <div class="stat-label">已完成</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 任务列表卡片 -->
    <el-card class="tasks-list-card">
      <div slot="header" class="clearfix">
        <span class="card-title"><i class="el-icon-document" /> 任务列表</span>
        <div style="float: right">
          <el-radio-group v-model="filterStatus" size="small" @change="handleFilterChange">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="pending">待处理</el-radio-button>
            <el-radio-button label="processing">处理中</el-radio-button>
            <el-radio-button label="completed">已完成</el-radio-button>
            <el-radio-button label="failed">失败</el-radio-button>
          </el-radio-group>
          <el-button
            style="margin-left: 10px"
            type="text"
            icon="el-icon-refresh"
            :loading="autoRefresh"
            @click="fetchTasks"
          >
            {{ autoRefresh ? '自动刷新中' : '刷新' }}
          </el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="taskList"
        border
        stripe
      >
        <el-table-column type="expand">
          <template slot-scope="{row}">
            <div class="task-detail">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="任务ID">
                  <code>{{ row.id }}</code>
                </el-descriptions-item>
                <el-descriptions-item label="任务类型">
                  <el-tag :type="getTaskTypeTag(row.task_type)" size="small">
                    {{ getTaskTypeLabel(row.task_type) }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="创建时间">
                  {{ formatTime(row.created_at) }}
                </el-descriptions-item>
                <el-descriptions-item label="开始时间">
                  {{ row.started_at ? formatTime(row.started_at) : '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="完成时间">
                  {{ row.completed_at ? formatTime(row.completed_at) : '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="处理时长">
                  {{ row.started_at && row.completed_at ? calculateDuration(row.started_at, row.completed_at) : '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="任务参数" :span="2">
                  <pre style="margin: 0; font-size: 12px; color: #606266">{{ formatParams(row.params) }}</pre>
                </el-descriptions-item>
                <el-descriptions-item v-if="row.error_message" label="错误信息" :span="2">
                  <el-alert :title="row.error_message" type="error" :closable="false" />
                </el-descriptions-item>
                <el-descriptions-item v-if="row.result_file" label="结果文件" :span="2">
                  <el-button
                    type="success"
                    size="small"
                    icon="el-icon-download"
                    @click="downloadResult(row)"
                  >
                    下载结果文件
                  </el-button>
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="task_name" label="任务名称" min-width="200" show-overflow-tooltip />

        <el-table-column label="任务类型" width="120" align="center">
          <template slot-scope="{row}">
            <el-tag :type="getTaskTypeTag(row.task_type)" size="small">
              {{ getTaskTypeLabel(row.task_type) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="120" align="center">
          <template slot-scope="{row}">
            <el-tag :type="getStatusType(row.status)" size="medium">
              <i :class="getStatusIcon(row.status)" />
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="进度" width="200" align="center">
          <template slot-scope="{row}">
            <div v-if="row.status === 'processing' || row.status === 'completed'">
              <el-progress
                :percentage="parseFloat(row.progress || 0)"
                :status="row.status === 'completed' ? 'success' : null"
                :color="progressColors"
              />
              <div style="margin-top: 5px; font-size: 12px; color: #909399">
                {{ formatNumber(row.processed_records || 0) }} / {{ formatNumber(row.total_records || 0) }}
              </div>
            </div>
            <span v-else style="color: #909399">-</span>
          </template>
        </el-table-column>

        <el-table-column label="创建时间" width="160" align="center">
          <template slot-scope="{row}">
            {{ formatTime(row.created_at) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template slot-scope="{row}">
            <el-button
              v-if="row.status === 'pending'"
              type="warning"
              size="mini"
              icon="el-icon-close"
              @click="handleCancel(row)"
            >
              取消
            </el-button>
            <el-button
              v-if="row.status === 'completed' && row.result_file"
              type="success"
              size="mini"
              icon="el-icon-download"
              @click="downloadResult(row)"
            >
              下载
            </el-button>
            <el-button
              v-if="row.status === 'processing'"
              type="text"
              size="mini"
              icon="el-icon-refresh"
              :loading="true"
            >
              处理中
            </el-button>
            <span v-if="row.status === 'failed'" style="color: #F56C6C">
              <i class="el-icon-circle-close" /> 失败
            </span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-if="total > 0"
        :current-page="currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; text-align: right"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </el-card>
  </div>
</template>

<script>
import { getTasks, getTaskDetail, cancelTask, downloadTaskResult } from '@/api/dataProcessing'

export default {
  name: 'ProcessingTasks',
  data() {
    return {
      loading: false,
      taskList: [],
      total: 0,
      currentPage: 1,
      pageSize: 20,
      filterStatus: '',
      autoRefresh: false,
      refreshTimer: null,
      taskStats: {
        total: 0,
        processing: 0,
        pending: 0,
        completed: 0
      },
      progressColors: [
        { color: '#f56c6c', percentage: 20 },
        { color: '#e6a23c', percentage: 40 },
        { color: '#5cb87a', percentage: 60 },
        { color: '#1989fa', percentage: 80 },
        { color: '#6f7ad3', percentage: 100 }
      ]
    }
  },
  mounted() {
    this.fetchTasks()
    this.startAutoRefresh()
  },
  beforeDestroy() {
    this.stopAutoRefresh()
  },
  methods: {
    /**
     * 获取任务列表
     */
    async fetchTasks() {
      this.loading = true
      try {
        const params = {
          page: this.currentPage,
          limit: this.pageSize
        }
        if (this.filterStatus) {
          params.status = this.filterStatus
        }

        const response = await getTasks(params)
        if (response.success) {
          this.taskList = response.data.tasks
          this.total = response.data.total
          this.updateStats()
        }
      } catch (error) {
        this.$message.error('获取任务列表失败：' + error.message)
      } finally {
        this.loading = false
      }
    },

    /**
     * 更新统计数据
     */
    updateStats() {
      this.taskStats.total = this.taskList.length
      this.taskStats.processing = this.taskList.filter(t => t.status === 'processing').length
      this.taskStats.pending = this.taskList.filter(t => t.status === 'pending').length
      this.taskStats.completed = this.taskList.filter(t => t.status === 'completed').length
    },

    /**
     * 启动自动刷新（每5秒）
     */
    startAutoRefresh() {
      this.autoRefresh = true
      this.refreshTimer = setInterval(() => {
        // 只有当有处理中或待处理的任务时才自动刷新
        const hasActiveTasks = this.taskList.some(
          t => t.status === 'processing' || t.status === 'pending'
        )
        if (hasActiveTasks) {
          this.fetchTasks()
        }
      }, 5000)
    },

    /**
     * 停止自动刷新
     */
    stopAutoRefresh() {
      this.autoRefresh = false
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer)
        this.refreshTimer = null
      }
    },

    /**
     * 取消任务
     */
    async handleCancel(row) {
      try {
        await this.$confirm('确定要取消该任务吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const response = await cancelTask(row.id)
        if (response.success) {
          this.$message.success('任务已取消')
          this.fetchTasks()
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('取消任务失败：' + error.message)
        }
      }
    },

    /**
     * 下载结果文件
     */
    downloadResult(row) {
      if (!row.result_file) {
        this.$message.warning('结果文件不存在')
        return
      }

      const filename = row.result_file.split('/').pop()
      const downloadUrl = downloadTaskResult(filename)
      
      // 创建隐藏的下载链接
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      this.$message.success('开始下载结果文件')
    },

    /**
     * 筛选状态改变
     */
    handleFilterChange() {
      this.currentPage = 1
      this.fetchTasks()
    },

    /**
     * 分页大小改变
     */
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.fetchTasks()
    },

    /**
     * 页码改变
     */
    handlePageChange(val) {
      this.currentPage = val
      this.fetchTasks()
    },

    /**
     * 获取状态标签类型
     */
    getStatusType(status) {
      const typeMap = {
        pending: 'info',
        processing: 'warning',
        completed: 'success',
        failed: 'danger',
        cancelled: 'info'
      }
      return typeMap[status] || 'info'
    },

    /**
     * 获取状态图标
     */
    getStatusIcon(status) {
      const iconMap = {
        pending: 'el-icon-time',
        processing: 'el-icon-loading',
        completed: 'el-icon-circle-check',
        failed: 'el-icon-circle-close',
        cancelled: 'el-icon-remove-outline'
      }
      return iconMap[status] || 'el-icon-question'
    },

    /**
     * 获取状态标签文字
     */
    getStatusLabel(status) {
      const labelMap = {
        pending: '待处理',
        processing: '处理中',
        completed: '已完成',
        failed: '失败',
        cancelled: '已取消'
      }
      return labelMap[status] || status
    },

    /**
     * 获取任务类型标签
     */
    getTaskTypeTag(type) {
      const tagMap = {
        add_code: 'primary',
        remove_code: 'warning',
        deduplicate: 'success',
        generate: 'info',
        merge: 'primary',
        split: 'warning'
      }
      return tagMap[type] || 'info'
    },

    /**
     * 获取任务类型标签文字
     */
    getTaskTypeLabel(type) {
      const labelMap = {
        add_code: '增加国码',
        remove_code: '去除国码',
        deduplicate: '数据去重',
        generate: '号码生成',
        merge: '合并文件',
        split: '拆分文件'
      }
      return labelMap[type] || type
    },

    /**
     * 格式化任务参数
     */
    formatParams(params) {
      try {
        const obj = typeof params === 'string' ? JSON.parse(params) : params
        return JSON.stringify(obj, null, 2)
      } catch (e) {
        return params
      }
    },

    /**
     * 格式化时间
     */
    formatTime(timestamp) {
      if (!timestamp) return '-'
      const date = new Date(timestamp)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    },

    /**
     * 格式化数字
     */
    formatNumber(num) {
      if (!num && num !== 0) return '0'
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },

    /**
     * 计算处理时长
     */
    calculateDuration(startTime, endTime) {
      const start = new Date(startTime)
      const end = new Date(endTime)
      const diff = end - start
      
      const seconds = Math.floor(diff / 1000)
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)
      
      if (hours > 0) {
        return `${hours}小时${minutes % 60}分${seconds % 60}秒`
      } else if (minutes > 0) {
        return `${minutes}分${seconds % 60}秒`
      } else {
        return `${seconds}秒`
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.processing-tasks-container {
  padding: 20px;

  .page-header {
    margin-bottom: 20px;

    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 8px 0;
      display: flex;
      align-items: center;

      i {
        margin-right: 8px;
        color: #409EFF;
      }
    }

    .page-description {
      color: #909399;
      font-size: 14px;
      margin: 0;
    }
  }

  .stats-row {
    margin-bottom: 20px;

    .stat-card {
      cursor: default;
      transition: all 0.3s;
      border: none;
      border-radius: 12px;
      overflow: hidden;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
      }

      ::v-deep .el-card__body {
        padding: 20px;
        display: flex;
        align-items: center;
      }

      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;

        i {
          font-size: 28px;
          color: white;
        }
      }

      .stat-content {
        flex: 1;

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #303133;
          line-height: 1;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 14px;
          color: #909399;
        }
      }
    }
  }

  .tasks-list-card {
    border-radius: 8px;

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;

      i {
        margin-right: 5px;
        color: #409EFF;
      }
    }

    .task-detail {
      padding: 20px;
      background: #f5f7fa;
      border-radius: 4px;
    }
  }
}
</style>
