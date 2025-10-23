<template>
  <div class="sms-records-container">
    <el-card class="filter-card">
      <div class="filter-container">
        <el-form :inline="true" :model="queryParams" class="filter-form">
          <el-form-item label="客户名称">
            <el-input
              v-model="queryParams.customerName"
              placeholder="请输入客户名称"
              clearable
              style="width: 160px"
              @keyup.enter.native="handleFilter"
            />
          </el-form-item>

          <el-form-item label="手机号码">
            <el-input
              v-model="queryParams.phoneNumber"
              placeholder="请输入手机号码"
              clearable
              style="width: 160px"
              @keyup.enter.native="handleFilter"
            />
          </el-form-item>

          <el-form-item label="通道名称">
            <el-select
              v-model="queryParams.channelId"
              placeholder="选择通道"
              clearable
              filterable
              style="width: 160px"
            >
              <el-option
                v-for="channel in channelList"
                :key="channel.id"
                :label="channel.channel_name"
                :value="channel.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="国家">
            <el-select
              v-model="queryParams.country"
              placeholder="选择国家"
              clearable
              style="width: 120px"
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
            <el-button type="success" icon="el-icon-download" @click="handleExport">
              导出
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <el-card class="table-card">
      <div class="table-header">
        <h3>短信发送记录</h3>
        <div class="summary-info">
          <span>总记录数: <strong>{{ total }}</strong></span>
          <span style="margin-left: 20px">成功: <strong style="color: #67C23A">{{ successCount }}</strong></span>
          <span style="margin-left: 20px">失败: <strong style="color: #F56C6C">{{ failedCount }}</strong></span>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="recordList"
        border
        style="width: 100%; margin-top: 20px"
        @sort-change="handleSortChange"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />

        <el-table-column prop="customer_name" label="客户名称" width="120" />

        <el-table-column prop="phone_number" label="手机号码" width="140" />

        <el-table-column prop="country" label="国家" width="100" align="center" />

        <el-table-column prop="channel_name" label="通道名称" width="150" />

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

        <el-table-column prop="sent_at" label="发送时间" width="160" sortable="custom">
          <template slot-scope="scope">
            {{ scope.row.sent_at ? formatDateTime(scope.row.sent_at) : '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="delivered_at" label="送达时间" width="160">
          <template slot-scope="scope">
            {{ scope.row.delivered_at ? formatDateTime(scope.row.delivered_at) : '-' }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              @click="handleViewDetail(scope.row)"
            >
              详情
            </el-button>
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

    <!-- 详情对话框 -->
    <el-dialog title="短信发送详情" :visible.sync="detailDialogVisible" width="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="客户名称">
          {{ currentRecord.customer_name }}
        </el-descriptions-item>
        <el-descriptions-item label="手机号码">
          {{ currentRecord.phone_number }}
        </el-descriptions-item>
        <el-descriptions-item label="国家">
          {{ currentRecord.country }}
        </el-descriptions-item>
        <el-descriptions-item label="通道名称">
          {{ currentRecord.channel_name }}
        </el-descriptions-item>
        <el-descriptions-item label="短信内容">
          {{ currentRecord.content }}
        </el-descriptions-item>
        <el-descriptions-item label="字符数">
          {{ currentRecord.char_count }}
        </el-descriptions-item>
        <el-descriptions-item label="费用">
          ${{ currentRecord.cost ? parseFloat(currentRecord.cost).toFixed(4) : '0.0000' }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentRecord.status)" size="small">
            {{ getStatusText(currentRecord.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发送时间">
          {{ currentRecord.sent_at ? formatDateTime(currentRecord.sent_at) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="送达时间">
          {{ currentRecord.delivered_at ? formatDateTime(currentRecord.delivered_at) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="失败原因">
          {{ currentRecord.error_message || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="网关响应">
          {{ currentRecord.gateway_response || '-' }}
        </el-descriptions-item>
      </el-descriptions>
      <div slot="footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getRecords, getCountries, getChannels } from '@/api/smsAdmin'
import Pagination from '@/components/Pagination'

export default {
  name: 'SmsAdminRecords',
  components: { Pagination },
  data() {
    return {
      loading: false,
      recordList: [],
      countryList: [],
      channelList: [],
      total: 0,
      successCount: 0,
      failedCount: 0,
      queryParams: {
        page: 1,
        limit: 20,
        customerName: '',
        phoneNumber: '',
        channelId: '',
        country: '',
        status: '',
        startDate: '',
        endDate: '',
        sortBy: 'sent_at',
        sortOrder: 'DESC'
      },
      dateRange: [],
      detailDialogVisible: false,
      currentRecord: {}
    }
  },
  created() {
    this.getRecordList()
    this.getCountryList()
    this.getChannelList()
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
      } catch (error) {
        this.$message.error('获取记录失败: ' + (error.message || '未知错误'))
      } finally {
        this.loading = false
      }
    },

    async getCountryList() {
      try {
        const response = await getCountries()
        this.countryList = response.data.countries
      } catch (error) {
        console.error('获取国家列表失败:', error)
      }
    },

    async getChannelList() {
      try {
        const response = await getChannels({ page: 1, limit: 100 })
        this.channelList = response.data
      } catch (error) {
        console.error('获取通道列表失败:', error)
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
        customerName: '',
        phoneNumber: '',
        channelId: '',
        country: '',
        status: '',
        startDate: '',
        endDate: '',
        sortBy: 'sent_at',
        sortOrder: 'DESC'
      }
      this.dateRange = []
      this.getRecordList()
    },

    handleSortChange({ prop, order }) {
      this.queryParams.sortBy = prop || 'sent_at'
      this.queryParams.sortOrder = order === 'ascending' ? 'ASC' : 'DESC'
      this.getRecordList()
    },

    handleViewDetail(row) {
      this.currentRecord = { ...row }
      this.detailDialogVisible = true
    },

    handleExport() {
      this.$message.info('导出功能开发中...')
      // TODO: 实现导出功能
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
</style>
