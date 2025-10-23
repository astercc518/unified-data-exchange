<template>
  <div class="app-container">
    <!-- 统计概览卡片 -->
    <el-row :gutter="20" class="overview-cards">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <i class="el-icon-s-data stat-icon" style="color: #409EFF" />
            <div class="stat-content">
              <div class="stat-value">{{ overview.total_settlements || 0 }}</div>
              <div class="stat-label">结算记录数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <i class="el-icon-pie-chart stat-icon" style="color: #67C23A" />
            <div class="stat-content">
              <div class="stat-value">${{ overview.total_revenue || '0.0000' }}</div>
              <div class="stat-label">总销售额</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <i class="el-icon-wallet stat-icon" style="color: #E6A23C" />
            <div class="stat-content">
              <div class="stat-value">${{ overview.total_cost || '0.0000' }}</div>
              <div class="stat-label">总成本</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <i class="el-icon-money stat-icon" style="color: #F56C6C" />
            <div class="stat-content">
              <div class="stat-value">${{ overview.total_profit || '0.0000' }}</div>
              <div class="stat-label">总利润 ({{ overview.avg_profit_margin || '0%' }})</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选栏 -->
    <div class="filter-container">
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        align="right"
        unlink-panels
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :picker-options="pickerOptions"
        value-format="yyyy-MM-dd"
        class="filter-item"
        style="width: 340px"
        @change="handleFilter"
      />
      
      <el-select
        v-model="listQuery.customer_id"
        placeholder="选择客户"
        clearable
        filterable
        style="width: 200px"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option
          v-for="item in customerList"
          :key="item.id"
          :label="item.customerName || item.customer_name"
          :value="item.id"
        />
      </el-select>

      <el-select
        v-model="listQuery.channel_id"
        placeholder="选择通道"
        clearable
        filterable
        style="width: 200px"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option
          v-for="item in channelList"
          :key="item.id"
          :label="item.channel_name"
          :value="item.id"
        />
      </el-select>

      <el-input
        v-model="listQuery.country"
        placeholder="国家"
        style="width: 150px;"
        class="filter-item"
        clearable
        @keyup.enter.native="handleFilter"
        @clear="handleFilter"
      />

      <el-select
        v-model="listQuery.settlement_status"
        placeholder="结算状态"
        clearable
        style="width: 150px"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option label="待结算" value="pending" />
        <el-option label="结算中" value="processing" />
        <el-option label="已完成" value="completed" />
        <el-option label="失败" value="failed" />
      </el-select>

      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button class="filter-item" type="success" icon="el-icon-refresh" @click="handleRefresh">
        刷新
      </el-button>
      <el-button
        class="filter-item"
        type="warning"
        icon="el-icon-download"
        :loading="exportLoading"
        @click="handleExport"
      >
        导出CSV
      </el-button>
      <el-button
        class="filter-item"
        type="primary"
        icon="el-icon-document"
        @click="handleGenerateReport"
      >
        生成报表
      </el-button>
      <el-button
        class="filter-item"
        type="info"
        icon="el-icon-plus"
        @click="handleManualSettle"
      >
        手动结算
      </el-button>
    </div>

    <!-- 结算列表表格 -->
    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="handleSortChange"
    >
      <el-table-column label="结算日期" prop="settlement_date" align="center" width="120" sortable="custom" />
      
      <el-table-column label="客户" min-width="150">
        <template slot-scope="{row}">
          <div>{{ row.customer ? row.customer.customer_name : '-' }}</div>
          <div style="font-size: 12px; color: #909399">{{ row.customer ? row.customer.email : '' }}</div>
        </template>
      </el-table-column>

      <el-table-column label="通道" min-width="150">
        <template slot-scope="{row}">
          <div>{{ row.channel ? row.channel.channel_name : '-' }}</div>
          <div style="font-size: 12px; color: #909399">{{ row.channel ? row.channel.protocol_type : '' }}</div>
        </template>
      </el-table-column>

      <el-table-column label="国家" prop="country" width="100" align="center" />

      <el-table-column label="发送数/成功数" width="140" align="center">
        <template slot-scope="{row}">
          <div>{{ row.total_count }} / {{ row.success_count }}</div>
          <div style="font-size: 12px; color: #67C23A">
            {{ ((row.success_count / row.total_count) * 100).toFixed(1) }}%
          </div>
        </template>
      </el-table-column>

      <el-table-column label="成本价" width="100" align="right">
        <template slot-scope="{row}">
          ${{ formatPrice(row.cost_price) }}
        </template>
      </el-table-column>

      <el-table-column label="销售价" width="100" align="right">
        <template slot-scope="{row}">
          ${{ formatPrice(row.sale_price) }}
        </template>
      </el-table-column>

      <el-table-column label="总成本" width="120" align="right">
        <template slot-scope="{row}">
          <span style="color: #E6A23C">${{ formatPrice(row.total_cost) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="总收入" width="120" align="right">
        <template slot-scope="{row}">
          <span style="color: #67C23A">${{ formatPrice(row.total_revenue) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="总利润" width="120" align="right">
        <template slot-scope="{row}">
          <span :style="{ color: row.total_profit >= 0 ? '#67C23A' : '#F56C6C' }">
            ${{ formatPrice(row.total_profit) }}
          </span>
        </template>
      </el-table-column>

      <el-table-column label="利润率" width="100" align="center">
        <template slot-scope="{row}">
          {{ calculateProfitMargin(row.total_profit, row.total_revenue) }}
        </template>
      </el-table-column>

      <el-table-column label="状态" width="100" align="center">
        <template slot-scope="{row}">
          <el-tag :type="getStatusType(row.settlement_status)" size="small">
            {{ getStatusLabel(row.settlement_status) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="180" fixed="right">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleViewDetails(row)">
            查看明细
          </el-button>
          <el-button
            type="warning"
            size="mini"
            :disabled="row.settlement_status === 'processing'"
            @click="handleResettle(row)"
          >
            重新结算
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <!-- 手动结算对话框 -->
    <el-dialog title="手动触发结算" :visible.sync="settleDialogVisible" width="400px">
      <el-form :model="settleForm" label-width="100px">
        <el-form-item label="结算日期">
          <el-date-picker
            v-model="settleForm.date"
            type="date"
            placeholder="选择日期"
            value-format="yyyy-MM-dd"
            style="width: 100%"
          />
        </el-form-item>
        <el-alert
          type="warning"
          :closable="false"
          style="margin-bottom: 20px"
        >
          将结算选定日期的所有成功发送记录
        </el-alert>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="settleDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="settling" @click="confirmManualSettle">
          {{ settling ? '结算中...' : '确认结算' }}
        </el-button>
      </div>
    </el-dialog>

    <!-- 报表生成对话框 -->
    <el-dialog title="生成业绩报表" :visible.sync="reportDialogVisible" width="600px">
      <el-form :model="reportForm" label-width="100px">
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="reportDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="分组维度">
          <el-radio-group v-model="reportForm.group_by">
            <el-radio label="date">按日期</el-radio>
            <el-radio label="customer">按客户</el-radio>
            <el-radio label="channel">按通道</el-radio>
            <el-radio label="country">按国家</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="reportDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="generating" @click="confirmGenerateReport">
          {{ generating ? '生成中...' : '生成报表' }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getSettlements,
  getSettlementOverview,
  calculateSettlement,
  reSettlement,
  exportSettlementsCSV
} from '@/api/smsSettlement'
import { getChannels } from '@/api/smsAdmin'
import request from '@/utils/request'
import Pagination from '@/components/Pagination'

export default {
  name: 'SmsSettlements',
  components: { Pagination },
  data() {
    return {
      list: [],
      total: 0,
      listLoading: true,
      overview: {
        total_settlements: 0,
        total_revenue: '0.0000',
        total_cost: '0.0000',
        total_profit: '0.0000',
        avg_profit_margin: '0%'
      },
      dateRange: [],
      listQuery: {
        page: 1,
        limit: 20,
        start_date: '',
        end_date: '',
        customer_id: undefined,
        channel_id: undefined,
        country: '',
        settlement_status: undefined,
        sort: '-settlement_date'
      },
      customerList: [],
      channelList: [],
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      settleDialogVisible: false,
      settling: false,
      settleForm: {
        date: ''
      },
      reportDialogVisible: false,
      generating: false,
      reportForm: {
        group_by: 'date'
      },
      reportDateRange: [],
      exportLoading: false
    }
  },
  async created() {
    this.initDefaultDateRange()
    // 并行执行所有请求，提升页面加载速度
    await Promise.all([
      this.getList(),
      this.getOverview(),
      this.loadCustomers(),
      this.loadChannels()
    ])
  },
  methods: {
    initDefaultDateRange() {
      // 默认显示当月的实时结算信息
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth()
      
      // 当月第一天
      const start = new Date(year, month, 1)
      // 当前日期
      const end = now
      
      this.dateRange = [
        this.formatDate(start),
        this.formatDate(end)
      ]
      this.listQuery.start_date = this.dateRange[0]
      this.listQuery.end_date = this.dateRange[1]
    },
    formatDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    async getList() {
      this.listLoading = true
      try {
        const { data } = await getSettlements(this.listQuery)
        // 后端返回格式: { code, message, data: { total, page, limit, list } }
        this.list = data.data?.list || []
        this.total = data.data?.total || 0
      } catch (error) {
        console.error('获取结算列表失败:', error)
        this.$message.error('获取结算列表失败')
        this.list = []
        this.total = 0
      } finally {
        this.listLoading = false
      }
    },
    async getOverview() {
      try {
        const params = {
          start_date: this.listQuery.start_date,
          end_date: this.listQuery.end_date,
          customer_id: this.listQuery.customer_id
        }
        const { data } = await getSettlementOverview(params)
        // 确保数据结构正确
        this.overview = {
          total_settlements: data.data?.total_settlements || 0,
          total_revenue: data.data?.total_revenue || '0.0000',
          total_cost: data.data?.total_cost || '0.0000',
          total_profit: data.data?.total_profit || '0.0000',
          avg_profit_margin: data.data?.avg_profit_margin || '0%'
        }
      } catch (error) {
        console.error('获取统计概览失败', error)
        // 出错时保持默认值
        this.overview = {
          total_settlements: 0,
          total_revenue: '0.0000',
          total_cost: '0.0000',
          total_profit: '0.0000',
          avg_profit_margin: '0%'
        }
      }
    },
    async loadCustomers() {
      try {
        const { data } = await request({
          url: '/api/users',
          method: 'get',
          params: { page: 1, limit: 1000 }
        })
        this.customerList = data.data || []
      } catch (error) {
        console.error('加载客户列表失败', error)
      }
    },
    async loadChannels() {
      try {
        const { data } = await getChannels({ page: 1, limit: 1000 })
        this.channelList = data.data || data || []
      } catch (error) {
        console.error('加载通道列表失败', error)
      }
    },
    handleFilter() {
      if (this.dateRange && this.dateRange.length === 2) {
        this.listQuery.start_date = this.dateRange[0]
        this.listQuery.end_date = this.dateRange[1]
      } else {
        this.listQuery.start_date = ''
        this.listQuery.end_date = ''
      }
      this.listQuery.page = 1
      // 并行执行列表和统计请求
      Promise.all([
        this.getList(),
        this.getOverview()
      ])
    },
    handleRefresh() {
      // 并行执行列表和统计请求
      Promise.all([
        this.getList(),
        this.getOverview()
      ])
    },
    handleSortChange({ prop, order }) {
      if (order === 'ascending') {
        this.listQuery.sort = prop
      } else {
        this.listQuery.sort = '-' + prop
      }
      this.getList()
    },
    handleManualSettle() {
      this.settleForm.date = this.formatDate(new Date(Date.now() - 86400000)) // 昨天
      this.settleDialogVisible = true
    },
    async confirmManualSettle() {
      if (!this.settleForm.date) {
        this.$message.warning('请选择结算日期')
        return
      }
      
      this.settling = true
      try {
        await calculateSettlement({ date: this.settleForm.date })
        this.$message.success('结算成功')
        this.settleDialogVisible = false
        // 并行刷新列表和统计数据
        await Promise.all([
          this.getList(),
          this.getOverview()
        ])
      } catch (error) {
        this.$message.error(error.response?.data?.message || '结算失败')
      } finally {
        this.settling = false
      }
    },
    handleResettle(row) {
      this.$confirm(`确认重新结算 ${row.settlement_date} 的数据吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          await reSettlement(row.id)
          this.$message.success('重新结算成功')
          // 并行刷新列表和统计数据
          await Promise.all([
            this.getList(),
            this.getOverview()
          ])
        } catch (error) {
          this.$message.error(error.response?.data?.message || '重新结算失败')
        }
      })
    },
    handleViewDetails(row) {
      this.$router.push({
        name: 'SmsSettlementDetails',
        params: { id: row.id },
        query: { date: row.settlement_date }
      })
    },
    handleGenerateReport() {
      this.reportDateRange = this.dateRange
      this.reportDialogVisible = true
    },
    async confirmGenerateReport() {
      if (!this.reportDateRange || this.reportDateRange.length !== 2) {
        this.$message.warning('请选择日期范围')
        return
      }
      
      this.generating = true
      try {
        const params = {
          start_date: this.reportDateRange[0],
          end_date: this.reportDateRange[1],
          customer_id: this.listQuery.customer_id,
          channel_id: this.listQuery.channel_id,
          country: this.listQuery.country,
          group_by: this.reportForm.group_by
        }
        
        // 跳转到报表页面
        this.$router.push({
          name: 'SmsSettlementReport',
          query: params
        })
        
        this.reportDialogVisible = false
      } catch (error) {
        this.$message.error('生成报表失败')
      } finally {
        this.generating = false
      }
    },
    async handleExport() {
      this.exportLoading = true
      try {
        const params = {
          start_date: this.listQuery.start_date,
          end_date: this.listQuery.end_date,
          customer_id: this.listQuery.customer_id,
          channel_id: this.listQuery.channel_id
        }
        
        const response = await exportSettlementsCSV(params)
        
        // 创建下载链接
        const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `settlements_${Date.now()}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        this.$message.success('导出成功')
      } catch (error) {
        this.$message.error('导出失败')
      } finally {
        this.exportLoading = false
      }
    },
    formatPrice(price, decimals = 4) {
      return parseFloat(price || 0).toFixed(decimals)
    },
    calculateProfitMargin(profit, revenue) {
      const p = parseFloat(profit || 0)
      const r = parseFloat(revenue || 0)
      if (r === 0) return '0%'
      return ((p / r) * 100).toFixed(2) + '%'
    },
    getStatusLabel(status) {
      const map = {
        pending: '待结算',
        processing: '结算中',
        completed: '已完成',
        failed: '失败'
      }
      return map[status] || status
    },
    getStatusType(status) {
      const map = {
        pending: 'info',
        processing: 'warning',
        completed: 'success',
        failed: 'danger'
      }
      return map[status] || 'info'
    }
  }
}
</script>

<style lang="scss" scoped>
.overview-cards {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  
  .stat-icon {
    font-size: 40px;
    margin-right: 15px;
  }
  
  .stat-content {
    flex: 1;
    
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      line-height: 1.2;
    }
    
    .stat-label {
      font-size: 13px;
      color: #909399;
      margin-top: 5px;
    }
  }
}

.filter-container {
  margin-bottom: 20px;
  
  .filter-item {
    margin-right: 10px;
    margin-bottom: 10px;
  }
}
</style>
