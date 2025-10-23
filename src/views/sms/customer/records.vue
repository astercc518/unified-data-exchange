<template>
  <div class="sms-records-container">
    <el-card class="filter-card">
      <div class="filter-container">
        <el-form :inline="true" :model="queryParams" class="filter-form">
          <el-form-item label="手机号码">
            <el-input
              v-model="queryParams.phoneNumber"
              placeholder="请输入手机号码"
              clearable
              style="width: 180px"
              @keyup.enter.native="handleFilter"
            />
          </el-form-item>

          <el-form-item label="国家">
            <el-select
              v-model="queryParams.country"
              placeholder="选择国家"
              clearable
              style="width: 150px"
            >
              <el-option
                v-for="country in countryList"
                :key="country"
                :label="country"
                :value="country"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="状态">
            <el-select
              v-model="queryParams.status"
              placeholder="选择状态"
              clearable
              style="width: 120px"
            >
              <el-option label="成功" value="success" />
              <el-option label="失败" value="failed" />
              <el-option label="发送中" value="sending" />
            </el-select>
          </el-form-item>

          <el-form-item label="发送时间">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="yyyy-MM-dd"
              style="width: 240px"
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="handleFilter">
              查询
            </el-button>
            <el-button icon="el-icon-refresh" @click="handleReset">
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <el-card class="table-card">
      <div class="table-header">
        <h3>下行日志</h3>
        <div class="summary-info">
          <span>总记录数: <strong>{{ total }}</strong></span>
          <span style="margin-left: 20px">成功: <strong style="color: #67C23A">{{ successCount }}</strong></span>
          <span style="margin-left: 20px">失败: <strong style="color: #F56C6C">{{ failedCount }}</strong></span>
          <span style="margin-left: 20px">总费用: <strong style="color: #E6A23C">${{ totalCost }}</strong></span>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="recordList"
        border
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-form label-position="left" class="record-detail">
              <el-form-item label="记录ID">
                <span>{{ props.row.id }}</span>
              </el-form-item>
              <el-form-item label="任务ID">
                <span>{{ props.row.task_id }}</span>
              </el-form-item>
              <el-form-item label="短信内容">
                <div class="content-preview">{{ props.row.content }}</div>
              </el-form-item>
              <el-form-item label="通道信息">
                <span>{{ props.row.channel_name }} ({{ props.row.country }})</span>
              </el-form-item>
              <el-form-item label="字符数">
                <span>{{ props.row.char_count }}</span>
              </el-form-item>
              <el-form-item label="费用">
                <span>${{ parseFloat(props.row.cost).toFixed(4) }}</span>
              </el-form-item>
              <el-form-item label="发送时间">
                <span>{{ formatDateTime(props.row.sent_at) }}</span>
              </el-form-item>
              <el-form-item label="送达时间">
                <span>{{ props.row.delivered_at ? formatDateTime(props.row.delivered_at) : '未送达' }}</span>
              </el-form-item>
              <el-form-item v-if="props.row.error_message" label="错误信息">
                <el-alert
                  :title="props.row.error_message"
                  type="error"
                  :closable="false"
                />
              </el-form-item>
              <el-form-item v-if="props.row.gateway_response" label="网关响应">
                <pre class="gateway-response">{{ props.row.gateway_response }}</pre>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>

        <el-table-column type="index" label="序号" width="60" align="center" />

        <el-table-column prop="phone_number" label="手机号码" width="140" />

        <el-table-column prop="country" label="国家" width="100" align="center" />

        <el-table-column prop="content" label="短信内容" min-width="200" show-overflow-tooltip />

        <el-table-column prop="char_count" label="字符数" width="80" align="center" />

        <el-table-column prop="cost" label="费用($)" width="100" align="center">
          <template slot-scope="scope">
            <span>${{ parseFloat(scope.row.cost).toFixed(4) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag
              :type="getStatusType(scope.row.status)"
              size="small"
            >
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="sent_at" label="发送时间" width="160">
          <template slot-scope="scope">
            {{ scope.row.sent_at ? formatDateTime(scope.row.sent_at) : '-' }}
          </template>
        </el-table-column>

        <el-table-column label="送达情况" width="120" align="center">
          <template slot-scope="scope">
            <div v-if="scope.row.status === 'success'">
              <el-tag type="success" size="mini">已送达</el-tag>
              <div v-if="scope.row.delivered_at" class="delivered-time">
                {{ formatDeliveryTime(scope.row.sent_at, scope.row.delivered_at) }}
              </div>
            </div>
            <el-tag v-else-if="scope.row.status === 'failed'" type="danger" size="mini">
              发送失败
            </el-tag>
            <el-tag v-else type="info" size="mini">
              发送中
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.page"
        :limit.sync="queryParams.limit"
        @pagination="getRecordList"
      />
    </el-card>
  </div>
</template>

<script>
import { getRecords } from '@/api/smsCustomer'
import Pagination from '@/components/Pagination'

export default {
  name: 'SmsCustomerRecords',
  components: { Pagination },
  data() {
    return {
      loading: false,
      recordList: [],
      countryList: [],
      total: 0,
      successCount: 0,
      failedCount: 0,
      totalCost: '0.00',
      queryParams: {
        page: 1,
        limit: 20,
        phoneNumber: '',
        country: '',
        status: '',
        startDate: '',
        endDate: '',
        taskId: ''
      },
      dateRange: []
    }
  },
  created() {
    // 从URL参数获取taskId
    if (this.$route.query.taskId) {
      this.queryParams.taskId = this.$route.query.taskId
    }
    this.getRecordList()
  },
  methods: {
    async getRecordList() {
      this.loading = true
      try {
        // 处理日期范围
        if (this.dateRange && this.dateRange.length === 2) {
          this.queryParams.startDate = this.dateRange[0]
          this.queryParams.endDate = this.dateRange[1]
        } else {
          this.queryParams.startDate = ''
          this.queryParams.endDate = ''
        }

        const response = await getRecords(this.queryParams)
        this.recordList = response.data.records
        this.total = response.data.total
        this.successCount = response.data.successCount || 0
        this.failedCount = response.data.failedCount || 0
        this.totalCost = parseFloat(response.data.totalCost || 0).toFixed(2)

        // 提取国家列表
        const countries = new Set(this.recordList.map(r => r.country))
        this.countryList = Array.from(countries)
      } catch (error) {
        this.$message.error('获取记录失败: ' + (error.message || '未知错误'))
      } finally {
        this.loading = false
      }
    },

    handleFilter() {
      this.queryParams.page = 1
      this.getRecordList()
    },

    handleReset() {
      this.queryParams = {
        page: 1,
        limit: 20,
        phoneNumber: '',
        country: '',
        status: '',
        startDate: '',
        endDate: '',
        taskId: this.$route.query.taskId || ''
      }
      this.dateRange = []
      this.getRecordList()
    },

    getStatusType(status) {
      const types = {
        success: 'success',
        failed: 'danger',
        sending: 'warning'
      }
      return types[status] || 'info'
    },

    getStatusText(status) {
      const texts = {
        success: '成功',
        failed: '失败',
        sending: '发送中'
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
        minute: '2-digit',
        second: '2-digit'
      })
    },

    formatDeliveryTime(sentAt, deliveredAt) {
      if (!sentAt || !deliveredAt) return ''
      const sent = new Date(sentAt)
      const delivered = new Date(deliveredAt)
      const diffSeconds = Math.floor((delivered - sent) / 1000)
      
      if (diffSeconds < 60) {
        return `${diffSeconds}秒`
      } else if (diffSeconds < 3600) {
        return `${Math.floor(diffSeconds / 60)}分钟`
      } else {
        return `${Math.floor(diffSeconds / 3600)}小时`
      }
    }
  }
}
</script>

<style scoped>
.sms-records-container {
  padding: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-container {
  padding: 10px 0;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
}

.table-card {
  min-height: 600px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.table-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.summary-info {
  font-size: 14px;
  color: #606266;
}

.summary-info strong {
  font-size: 16px;
}

.record-detail {
  padding: 20px 40px;
  background: #f5f7fa;
}

.content-preview {
  padding: 10px;
  background: white;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  max-height: 150px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.gateway-response {
  padding: 10px;
  background: #f5f5f5;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 12px;
  max-height: 200px;
  overflow-y: auto;
  margin: 0;
}

.delivered-time {
  font-size: 11px;
  color: #909399;
  margin-top: 2px;
}
</style>
