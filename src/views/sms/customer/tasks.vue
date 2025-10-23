<template>
  <div class="sms-tasks-container">
    <!-- 任务状态标签页 -->
    <el-card>
      <el-tabs v-model="activeTab" @tab-click="handleTabChange">
        <el-tab-pane label="正在发送" name="sending">
          <div class="tab-info">
            <i class="el-icon-loading" /> 当前有 <strong>{{ sendingCount }}</strong> 个任务正在发送
          </div>
        </el-tab-pane>
        <el-tab-pane label="发送完成" name="completed">
          <div class="tab-info">
            <i class="el-icon-success" /> 已完成 <strong>{{ completedCount }}</strong> 个任务
          </div>
        </el-tab-pane>
        <el-tab-pane label="定时任务" name="scheduled">
          <div class="tab-info">
            <i class="el-icon-time" /> 待执行 <strong>{{ scheduledCount }}</strong> 个定时任务
          </div>
        </el-tab-pane>
        <el-tab-pane label="已取消" name="cancelled">
          <div class="tab-info">
            <i class="el-icon-close" /> 已取消 <strong>{{ cancelledCount }}</strong> 个任务
          </div>
        </el-tab-pane>
      </el-tabs>

      <!-- 任务列表 -->
      <el-table
        v-loading="loading"
        :data="taskList"
        border
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-form label-position="left" class="task-detail">
              <el-form-item label="任务ID">
                <span>{{ props.row.id }}</span>
              </el-form-item>
              <el-form-item label="短信内容">
                <div class="content-preview">{{ props.row.content }}</div>
              </el-form-item>
              <el-form-item label="发送号码">
                <el-tag
                  v-for="(phone, index) in getPhoneList(props.row.phone_numbers)"
                  :key="index"
                  size="small"
                  style="margin-right: 5px; margin-bottom: 5px"
                >
                  {{ phone }}
                </el-tag>
              </el-form-item>
              <el-form-item label="进度详情">
                <div class="progress-detail">
                  <el-progress
                    :percentage="calculateProgress(props.row)"
                    :status="getProgressStatus(props.row)"
                  />
                  <span style="margin-left: 10px">
                    已发送: {{ props.row.sent_count || 0 }} / 
                    成功: {{ props.row.success_count || 0 }} / 
                    失败: {{ props.row.failed_count || 0 }}
                  </span>
                </div>
              </el-form-item>
              <el-form-item v-if="props.row.error_message" label="错误信息">
                <el-alert
                  :title="props.row.error_message"
                  type="error"
                  :closable="false"
                />
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>

        <el-table-column label="任务名称" min-width="150">
          <template slot-scope="scope">
            <div class="task-name">
              {{ scope.row.task_name || '短信群发任务' }}
            </div>
            <div class="task-id">ID: {{ scope.row.id }}</div>
          </template>
        </el-table-column>

        <el-table-column prop="country" label="国家" width="100" align="center" />

        <el-table-column prop="channel_name" label="通道" width="150" />

        <el-table-column label="号码数量" width="100" align="center">
          <template slot-scope="scope">
            {{ scope.row.total_numbers || 0 }}
          </template>
        </el-table-column>

        <el-table-column label="字符数" width="80" align="center">
          <template slot-scope="scope">
            {{ scope.row.char_count || 0 }}
          </template>
        </el-table-column>

        <el-table-column label="总费用" width="100" align="center">
          <template slot-scope="scope">
            ${{ parseFloat(scope.row.total_cost || 0).toFixed(2) }}
          </template>
        </el-table-column>

        <el-table-column label="发送进度" width="200" align="center">
          <template slot-scope="scope">
            <el-progress
              :percentage="calculateProgress(scope.row)"
              :status="getProgressStatus(scope.row)"
              :stroke-width="15"
            />
            <div class="progress-text">
              {{ scope.row.sent_count || 0 }} / {{ scope.row.total_numbers || 0 }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="发送时间" width="160">
          <template slot-scope="scope">
            <div v-if="scope.row.send_type === 'scheduled'">
              <div class="time-label">定时:</div>
              <div>{{ formatDateTime(scope.row.scheduled_at) }}</div>
            </div>
            <div v-else>
              <div class="time-label">创建:</div>
              <div>{{ formatDateTime(scope.row.created_at) }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button
              v-if="scope.row.status === 'sending' || scope.row.status === 'scheduled'"
              type="danger"
              size="small"
              @click="handleCancelTask(scope.row)"
            >
              取消任务
            </el-button>
            <el-button
              type="text"
              size="small"
              @click="handleViewRecords(scope.row)"
            >
              查看记录
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.page"
        :limit.sync="queryParams.limit"
        @pagination="getTaskList"
      />
    </el-card>
  </div>
</template>

<script>
import { getTasks, cancelTask } from '@/api/smsCustomer'
import Pagination from '@/components/Pagination'

export default {
  name: 'SmsCustomerTasks',
  components: { Pagination },
  data() {
    return {
      loading: false,
      activeTab: 'sending',
      taskList: [],
      total: 0,
      sendingCount: 0,
      completedCount: 0,
      scheduledCount: 0,
      cancelledCount: 0,
      queryParams: {
        page: 1,
        limit: 20,
        status: 'sending'
      },
      refreshTimer: null
    }
  },
  created() {
    this.getTaskList()
    this.getTaskCounts()
    // 正在发送的任务每30秒刷新一次
    this.startAutoRefresh()
  },
  beforeDestroy() {
    this.stopAutoRefresh()
  },
  methods: {
    async getTaskList() {
      this.loading = true
      try {
        const response = await getTasks(this.queryParams)
        this.taskList = response.data.tasks
        this.total = response.data.total
      } catch (error) {
        this.$message.error('获取任务列表失败: ' + (error.message || '未知错误'))
      } finally {
        this.loading = false
      }
    },

    async getTaskCounts() {
      try {
        const statuses = ['sending', 'completed', 'scheduled', 'cancelled']
        const promises = statuses.map(status =>
          getTasks({ page: 1, limit: 1, status })
        )
        const results = await Promise.all(promises)
        
        this.sendingCount = results[0].data.total
        this.completedCount = results[1].data.total
        this.scheduledCount = results[2].data.total
        this.cancelledCount = results[3].data.total
      } catch (error) {
        console.error('获取任务统计失败:', error)
      }
    },

    handleTabChange(tab) {
      this.queryParams.status = tab.name
      this.queryParams.page = 1
      this.getTaskList()

      // 只在"正在发送"标签页自动刷新
      if (tab.name === 'sending') {
        this.startAutoRefresh()
      } else {
        this.stopAutoRefresh()
      }
    },

    async handleCancelTask(row) {
      try {
        await this.$confirm('确定要取消这个任务吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        await cancelTask(row.id)
        this.$message.success('任务已取消')
        this.getTaskList()
        this.getTaskCounts()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('取消任务失败: ' + (error.message || '未知错误'))
        }
      }
    },

    handleViewRecords(row) {
      this.$router.push({
        path: '/sms/customer/records',
        query: { taskId: row.id }
      })
    },

    getPhoneList(phoneNumbers) {
      try {
        return JSON.parse(phoneNumbers || '[]')
      } catch (e) {
        return []
      }
    },

    calculateProgress(row) {
      const total = row.total_numbers || 0
      const sent = row.sent_count || 0
      if (total === 0) return 0
      return Math.floor((sent / total) * 100)
    },

    getProgressStatus(row) {
      if (row.status === 'completed') return 'success'
      if (row.status === 'cancelled') return 'exception'
      return null
    },

    getStatusType(status) {
      const types = {
        sending: 'warning',
        completed: 'success',
        scheduled: 'info',
        cancelled: 'info',
        failed: 'danger'
      }
      return types[status] || 'info'
    },

    getStatusText(status) {
      const texts = {
        sending: '发送中',
        completed: '已完成',
        scheduled: '待发送',
        cancelled: '已取消',
        failed: '失败'
      }
      return texts[status] || status
    },

    formatDateTime(datetime) {
      if (!datetime) return '-'
      const date = new Date(datetime)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    startAutoRefresh() {
      this.stopAutoRefresh()
      this.refreshTimer = setInterval(() => {
        if (this.activeTab === 'sending') {
          this.getTaskList()
          this.getTaskCounts()
        }
      }, 30000) // 30秒
    },

    stopAutoRefresh() {
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer)
        this.refreshTimer = null
      }
    }
  }
}
</script>

<style scoped>
.sms-tasks-container {
  padding: 20px;
}

.tab-info {
  padding: 10px 0;
  color: #606266;
  font-size: 14px;
}

.tab-info i {
  margin-right: 5px;
}

.tab-info strong {
  color: #409EFF;
  font-size: 16px;
}

.task-detail {
  padding: 20px 40px;
  background: #f5f7fa;
}

.content-preview {
  padding: 10px;
  background: white;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  max-height: 100px;
  overflow-y: auto;
}

.progress-detail {
  display: flex;
  align-items: center;
}

.task-name {
  font-weight: bold;
  color: #303133;
  margin-bottom: 3px;
}

.task-id {
  font-size: 12px;
  color: #909399;
}

.progress-text {
  font-size: 12px;
  color: #606266;
  margin-top: 3px;
}

.time-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 2px;
}
</style>
