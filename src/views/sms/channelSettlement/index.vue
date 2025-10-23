<template>
  <div class="app-container">
    <!-- 统计概览 -->
    <el-row :gutter="20" class="statistics-row">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="background: #409EFF;">
              <i class="el-icon-document" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overview.total_settlements }}</div>
              <div class="stat-label">结算记录数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="background: #67C23A;">
              <i class="el-icon-s-data" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overview.total_success }}</div>
              <div class="stat-label">成功发送数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="background: #E6A23C;">
              <i class="el-icon-pie-chart" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overview.avg_success_rate }}</div>
              <div class="stat-label">平均成功率</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="background: #F56C6C;">
              <i class="el-icon-coin" />
            </div>
            <div class="stat-content">
              <div class="stat-value">¥{{ overview.total_cost }}</div>
              <div class="stat-label">总成本</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选条件 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="listQuery" class="filter-form">
        <el-form-item label="结算月份">
          <el-date-picker
            v-model="listQuery.settlement_month"
            type="month"
            placeholder="选择月份"
            value-format="yyyy-MM"
            style="width: 200px;"
          />
        </el-form-item>
        <el-form-item label="通道">
          <el-select v-model="listQuery.channel_id" placeholder="选择通道" clearable filterable style="width: 200px;">
            <el-option
              v-for="channel in channelList"
              :key="channel.id"
              :label="channel.channel_name"
              :value="channel.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="国家">
          <el-input v-model="listQuery.country" placeholder="输入国家" clearable style="width: 150px;" />
        </el-form-item>
        <el-form-item label="结算状态">
          <el-select v-model="listQuery.settlement_status" placeholder="选择状态" clearable style="width: 150px;">
            <el-option label="待结算" value="pending" />
            <el-option label="结算中" value="processing" />
            <el-option label="已完成" value="completed" />
            <el-option label="已支付" value="paid" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
          <el-button icon="el-icon-refresh" @click="handleRefresh">刷新</el-button>
          <el-button type="success" icon="el-icon-plus" @click="handleManualSettle">手动结算</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table
        v-loading="listLoading"
        :data="list"
        border
        fit
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column label="ID" prop="id" width="80" align="center" />
        <el-table-column label="结算月份" prop="settlement_month" width="120" align="center" />
        <el-table-column label="通道名称" width="180">
          <template slot-scope="{row}">
            <span>{{ row.channel ? row.channel.channel_name : '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="国家" prop="country" width="120" align="center" />
        <el-table-column label="总提交数" prop="total_submitted" width="100" align="center" />
        <el-table-column label="成功数" prop="total_success" width="90" align="center" />
        <el-table-column label="成功率" width="90" align="center">
          <template slot-scope="{row}">
            <el-tag :type="row.success_rate >= 95 ? 'success' : row.success_rate >= 80 ? '' : 'warning'">
              {{ row.success_rate }}%
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="总成本" width="120" align="right">
          <template slot-scope="{row}">
            <span style="color: #F56C6C; font-weight: bold;">¥{{ row.total_cost }}</span>
          </template>
        </el-table-column>
        <el-table-column label="平均单价" width="100" align="right">
          <template slot-scope="{row}">
            <span>¥{{ row.avg_cost_price }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template slot-scope="{row}">
            <el-tag :type="getStatusType(row.settlement_status)">
              {{ getStatusLabel(row.settlement_status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="结算日期" width="110" align="center">
          <template slot-scope="{row}">
            {{ row.settlement_date | formatDate }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="200" fixed="right">
          <template slot-scope="{row}">
            <el-button type="text" size="small" @click="handleViewDetails(row)">查看明细</el-button>
            <el-button v-if="row.settlement_status === 'completed'" type="text" size="small" @click="handlePay(row)">标记支付</el-button>
            <el-button v-if="row.settlement_status === 'pending'" type="text" size="small" style="color: #F56C6C;" @click="handleDelete(row)">删除</el-button>
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
    </el-card>

    <!-- 手动结算对话框 -->
    <el-dialog title="手动触发通道结算" :visible.sync="settleDialogVisible" width="500px">
      <el-form :model="settleForm" label-width="100px">
        <el-form-item label="结算月份">
          <el-date-picker
            v-model="settleForm.settlement_month"
            type="month"
            placeholder="选择月份"
            value-format="yyyy-MM"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="通道">
          <el-select v-model="settleForm.channel_id" placeholder="选择通道（留空则结算所有）" clearable filterable style="width: 100%;">
            <el-option
              v-for="channel in channelList"
              :key="channel.id"
              :label="channel.channel_name"
              :value="channel.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="国家">
          <el-input v-model="settleForm.country" placeholder="留空则按所有国家分别结算" clearable />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="settleDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="settling" @click="confirmManualSettle">
          {{ settling ? '结算中...' : '开始结算' }}
        </el-button>
      </div>
    </el-dialog>

    <!-- 明细对话框 -->
    <el-dialog title="结算明细" :visible.sync="detailDialogVisible" width="80%">
      <el-table
        v-loading="detailLoading"
        :data="detailList"
        border
        style="width: 100%;"
        max-height="500"
      >
        <el-table-column label="记录ID" prop="record_id" width="90" align="center" />
        <el-table-column label="手机号" prop="phone_number" width="150" />
        <el-table-column label="国家" prop="country" width="120" align="center" />
        <el-table-column label="成本价" width="100" align="right">
          <template slot-scope="{row}">
            <span>¥{{ row.cost_price }}</span>
          </template>
        </el-table-column>
        <el-table-column label="发送时间" width="160" align="center">
          <template slot-scope="{row}">
            {{ row.sent_at }}
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="detailTotal>0"
        :total="detailTotal"
        :page.sync="detailQuery.page"
        :limit.sync="detailQuery.limit"
        @pagination="getDetails"
      />
    </el-dialog>

    <!-- 支付对话框 -->
    <el-dialog title="标记为已支付" :visible.sync="payDialogVisible" width="500px">
      <el-form :model="payForm" label-width="100px">
        <el-form-item label="支付日期">
          <el-date-picker
            v-model="payForm.payment_date"
            type="date"
            placeholder="选择日期"
            value-format="yyyy-MM-dd"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="payForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="payDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="paying" @click="confirmPay">
          {{ paying ? '提交中...' : '确认支付' }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getChannelSettlements,
  getChannelSettlementDetails,
  calculateChannelSettlement,
  getChannelSettlementOverview,
  payChannelSettlement,
  deleteChannelSettlement,
  settlementStatusMap
} from '@/api/channelSettlement'
import { getChannels } from '@/api/smsAdmin'
import Pagination from '@/components/Pagination'

export default {
  name: 'ChannelSettlement',
  components: { Pagination },
  filters: {
    formatDate(date) {
      if (!date) return '-'
      return date.substring(0, 10)
    }
  },
  data() {
    return {
      list: [],
      total: 0,
      listLoading: true,
      overview: {
        total_settlements: 0,
        total_success: 0,
        total_submitted: 0,
        total_cost: '0.0000',
        avg_success_rate: '0%',
        avg_cost_price: '0.0000'
      },
      listQuery: {
        page: 1,
        limit: 20,
        settlement_month: '',
        channel_id: undefined,
        country: '',
        settlement_status: undefined
      },
      channelList: [],
      settleDialogVisible: false,
      settling: false,
      settleForm: {
        settlement_month: '',
        channel_id: undefined,
        country: ''
      },
      detailDialogVisible: false,
      detailLoading: false,
      detailList: [],
      detailTotal: 0,
      detailQuery: {
        page: 1,
        limit: 50
      },
      currentDetailId: null,
      payDialogVisible: false,
      paying: false,
      payForm: {
        payment_date: '',
        remark: ''
      },
      currentPayId: null
    }
  },
  async created() {
    this.initDefaultMonth()
    // 并行执行所有请求，提升页面加载速度
    await Promise.all([
      this.getList(),
      this.getOverview(),
      this.loadChannels()
    ])
  },
  methods: {
    initDefaultMonth() {
      // 默认显示当月的实时结算信息
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      this.listQuery.settlement_month = `${year}-${month}`
    },
    async getList() {
      this.listLoading = true
      try {
        const { data } = await getChannelSettlements(this.listQuery)
        // 后端返回格式: { code, message, data: { total, page, limit, list } }
        this.list = data.data?.list || []
        this.total = data.data?.total || 0
      } catch (error) {
        console.error('获取通道结算列表失败:', error)
        this.$message.error('获取通道结算列表失败')
        this.list = []
        this.total = 0
      } finally {
        this.listLoading = false
      }
    },
    async getOverview() {
      try {
        const params = {
          settlement_month: this.listQuery.settlement_month,
          channel_id: this.listQuery.channel_id
        }
        const { data } = await getChannelSettlementOverview(params)
        this.overview = {
          total_settlements: data.data?.total_settlements || 0,
          total_success: data.data?.total_success || 0,
          total_submitted: data.data?.total_submitted || 0,
          total_cost: data.data?.total_cost || '0.0000',
          avg_success_rate: data.data?.avg_success_rate || '0%',
          avg_cost_price: data.data?.avg_cost_price || '0.0000'
        }
      } catch (error) {
        console.error('获取统计概览失败', error)
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
    handleManualSettle() {
      const now = new Date()
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const year = lastMonth.getFullYear()
      const month = String(lastMonth.getMonth() + 1).padStart(2, '0')
      this.settleForm.settlement_month = `${year}-${month}`
      this.settleForm.channel_id = undefined
      this.settleForm.country = ''
      this.settleDialogVisible = true
    },
    async confirmManualSettle() {
      if (!this.settleForm.settlement_month) {
        this.$message.warning('请选择结算月份')
        return
      }

      this.settling = true
      try {
        await calculateChannelSettlement(this.settleForm)
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
    handleViewDetails(row) {
      this.currentDetailId = row.id
      this.detailQuery.page = 1
      this.getDetails()
      this.detailDialogVisible = true
    },
    async getDetails() {
      this.detailLoading = true
      try {
        const { data } = await getChannelSettlementDetails(this.currentDetailId, this.detailQuery)
        this.detailList = data.data?.list || []
        this.detailTotal = data.data?.total || 0
      } catch (error) {
        console.error('获取明细失败:', error)
        this.$message.error('获取明细失败')
        this.detailList = []
        this.detailTotal = 0
      } finally {
        this.detailLoading = false
      }
    },
    handlePay(row) {
      this.currentPayId = row.id
      this.payForm.payment_date = this.formatDate(new Date())
      this.payForm.remark = ''
      this.payDialogVisible = true
    },
    formatDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    async confirmPay() {
      this.paying = true
      try {
        await payChannelSettlement(this.currentPayId, this.payForm)
        this.$message.success('标记支付成功')
        this.payDialogVisible = false
        this.getList()
      } catch (error) {
        this.$message.error('操作失败')
      } finally {
        this.paying = false
      }
    },
    handleDelete(row) {
      this.$confirm('确定要删除这条结算记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          await deleteChannelSettlement(row.id)
          this.$message.success('删除成功')
          // 并行刷新列表和统计数据
          await Promise.all([
            this.getList(),
            this.getOverview()
          ])
        } catch (error) {
          this.$message.error('删除失败')
        }
      })
    },
    getStatusLabel(status) {
      return settlementStatusMap[status]?.label || status
    },
    getStatusType(status) {
      return settlementStatusMap[status]?.type || 'info'
    }
  }
}
</script>

<style scoped>
.statistics-row {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.stat-icon i {
  font-size: 28px;
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.filter-card,
.table-card {
  margin-bottom: 20px;
}

.filter-form {
  margin-bottom: 0;
}
</style>
