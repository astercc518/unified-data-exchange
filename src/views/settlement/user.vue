<template>
  <div class="app-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ formatCurrency(totalStats.totalPurchaseAmount) }}</div>
            <div class="stat-label">总购买金额</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value settled">{{ formatCurrency(totalStats.settledAmount) }}</div>
            <div class="stat-label">{{ $t('settlement.settledAmount') }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value unsettled">{{ formatCurrency(totalStats.unsettledAmount) }}</div>
            <div class="stat-label">{{ $t('settlement.unsettledAmount') }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value processing">{{ formatNumber(totalStats.totalDataPurchased) }}</div>
            <div class="stat-label">购买数据总量</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索和操作栏 -->
    <el-card style="margin-bottom: 20px;">
      <div class="filter-container">
        <el-input
          v-model="listQuery.username"
          :placeholder="$t('user.pleaseEnterUsername')"
          style="width: 150px;"
          class="filter-item"
          @keyup.enter.native="handleFilter"
        />

        <el-select
          v-model="listQuery.dataSource"
          placeholder="数据源"
          clearable
          style="width: 150px"
          class="filter-item"
        >
          <el-option label="孟加拉国" value="bangladesh" />
          <el-option label="印度" value="india" />
          <el-option label="巴基斯坦" value="pakistan" />
        </el-select>

        <el-date-picker
          v-model="listQuery.dateRange"
          type="daterange"
          :placeholder="$t('settlement.pleaseSelectDate')"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
          style="width: 250px;"
          class="filter-item"
        />

        <el-select
          v-model="listQuery.status"
          :placeholder="$t('settlement.settlementStatus')"
          clearable
          style="width: 120px"
          class="filter-item"
        >
          <el-option :key="'settled'" :label="$t('settlement.settled')" value="settled" />
          <el-option :key="'unsettled'" :label="$t('settlement.unsettled')" value="unsettled" />
          <el-option :key="'processing'" :label="$t('settlement.processing')" value="processing" />
        </el-select>

        <el-button
          v-waves
          class="filter-item"
          type="primary"
          icon="el-icon-search"
          @click="handleFilter"
        >
          {{ $t('common.search') }}
        </el-button>

        <el-button
          class="filter-item"
          style="margin-left: 10px;"
          type="success"
          icon="el-icon-check"
          :disabled="multipleSelection.length === 0"
          @click="handleBatchSettlement"
        >
          批量结算
        </el-button>

        <el-button
          class="filter-item"
          type="warning"
          icon="el-icon-download"
          @click="handleExport"
        >
          导出数据
        </el-button>
      </div>
    </el-card>

    <!-- 用户结算列表表格 -->
    <el-card>
      <div slot="header" class="clearfix">
        <span>{{ $t('settlement.userSettlement') }}</span>
      </div>

      <el-table
        :key="tableKey"
        v-loading="listLoading"
        :data="list"
        border
        fit
        highlight-current-row
        style="width: 100%;"
        @selection-change="handleSelectionChange"
        @sort-change="sortChange"
      >
        <el-table-column
          type="selection"
          width="55"
          align="center"
        />
        <el-table-column
          label="ID"
          prop="id"
          sortable="custom"
          align="center"
          width="80"
        />
        <el-table-column
          :label="$t('user.username')"
          min-width="120px"
        >
          <template slot-scope="{row}">
            <span class="link-type" @click="handleDetail(row)">{{ row.username }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="购买数据源"
          min-width="120px"
        >
          <template slot-scope="{row}">
            <div v-for="source in row.dataSources" :key="source.name" class="data-source-item">
              <span class="source-name">{{ source.name }}</span>
              <span class="source-count">({{ formatNumber(source.quantity) }}条)</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="购买金额(U)"
          width="120px"
          align="center"
          sortable="custom"
        >
          <template slot-scope="{row}">
            <span class="amount-highlight">{{ row.purchaseAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="数据效果"
          width="120px"
          align="center"
        >
          <template slot-scope="{row}">
            <div class="effect-summary">
              <div>转化率: <span :class="getConversionClass(row.conversionRate)">{{ row.conversionRate }}%</span></div>
              <div>数据质量: <el-tag :type="getQualityTagType(row.dataQuality)" size="mini">{{ getQualityText(row.dataQuality) }}</el-tag></div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="结算周期"
          width="120px"
          align="center"
        >
          <template slot-scope="{row}">
            <span>{{ row.settlementCycle }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('settlement.settlementAmount')"
          min-width="120px"
          align="center"
        >
          <template slot-scope="{row}">
            <span class="settlement-amount">{{ formatCurrency(row.settlementAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('settlement.settlementStatus')"
          class-name="status-col"
          width="120"
        >
          <template slot-scope="{row}">
            <el-tag :type="row.status | statusFilter">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="最后购买时间"
          width="150px"
          align="center"
          sortable="custom"
        >
          <template slot-scope="{row}">
            <span>{{ row.lastPurchaseTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('common.operation')"
          align="center"
          width="250"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="{row}">
            <el-button
              type="primary"
              size="mini"
              @click="handleDetail(row)"
            >
              {{ $t('common.detail') }}
            </el-button>
            <el-button
              v-if="row.status === 'unsettled'"
              type="success"
              size="mini"
              @click="handleSettlement(row)"
            >
              {{ $t('settlement.settlement') }}
            </el-button>
            <el-button
              type="warning"
              size="mini"
              @click="handleViewFeedback(row)"
            >
              查看反馈
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.limit"
        @pagination="getList"
      />
    </el-card>

    <!-- 结算详情对话框 -->
    <el-dialog
      title="结算详情"
      :visible.sync="settlementDialogVisible"
      width="800px"
    >
      <div v-if="currentSettlement">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户名">
            {{ currentSettlement.username }}
          </el-descriptions-item>
          <el-descriptions-item label="购买总金额">
            {{ formatCurrency(currentSettlement.purchaseAmount) }}
          </el-descriptions-item>
          <el-descriptions-item label="数据使用效果">
            转化率 {{ currentSettlement.conversionRate }}%
          </el-descriptions-item>
          <el-descriptions-item label="结算金额">
            <span class="settlement-amount">{{ formatCurrency(currentSettlement.settlementAmount) }}</span>
          </el-descriptions-item>
        </el-descriptions>

        <el-divider>购买数据明细</el-divider>
        <el-table :data="currentSettlement.dataSources" border style="width: 100%">
          <el-table-column label="数据源" prop="name" width="150" />
          <el-table-column label="数量" prop="quantity" width="100" align="center">
            <template slot-scope="{row}">
              {{ formatNumber(row.quantity) }}
            </template>
          </el-table-column>
          <el-table-column label="单价(U)" prop="unitPrice" width="100" align="center" />
          <el-table-column label="总价(U)" width="100" align="center">
            <template slot-scope="{row}">
              {{ (row.quantity * row.unitPrice).toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="购买时间" prop="purchaseTime" align="center">
            <template slot-scope="{row}">
              {{ row.purchaseTime | parseTime('{y}-{m}-{d} {h}:{i}') }}
            </template>
          </el-table-column>
        </el-table>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="settlementDialogVisible = false">取 消</el-button>
        <el-button
          v-if="currentSettlement && currentSettlement.status === 'unsettled'"
          type="primary"
          :loading="settlementLoading"
          @click="confirmSettlement"
        >
          确认结算
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'
import waves from '@/directive/waves'
import i18nMixin from '@/mixins/i18n'

export default {
  name: 'UserSettlement',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        settled: 'success',
        unsettled: 'warning',
        processing: 'info'
      }
      return statusMap[status]
    },
    parseTime
  },
  mixins: [i18nMixin],
  data() {
    return {
      tableKey: 0,
      list: [],
      total: 0,
      listLoading: true,
      multipleSelection: [],
      totalStats: {
        totalPurchaseAmount: 125680.50,
        settledAmount: 98450.30,
        unsettledAmount: 27230.20,
        totalDataPurchased: 2850000
      },
      listQuery: {
        page: 1,
        limit: 20,
        username: undefined,
        dataSource: undefined,
        dateRange: [],
        status: undefined,
        sort: '+id'
      },
      settlementDialogVisible: false,
      currentSettlement: null,
      settlementLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      // 模拟获取用户结算列表数据
      setTimeout(() => {
        this.list = [
          {
            id: 1,
            username: 'customer001',
            realName: '张三',
            dataSources: [
              { name: '孟加拉国-3天内', quantity: 10000, unitPrice: 0.05, purchaseTime: new Date('2023-12-01') },
              { name: '印度-30天内', quantity: 5000, unitPrice: 0.04, purchaseTime: new Date('2023-12-02') }
            ],
            purchaseAmount: 700.00,
            conversionRate: 5.2,
            dataQuality: 'excellent',
            settlementCycle: '月结',
            settlementAmount: 700.00,
            status: 'settled',
            lastPurchaseTime: new Date('2023-12-02')
          },
          {
            id: 2,
            username: 'customer002',
            realName: '李四',
            dataSources: [
              { name: '孟加拉国-30天内', quantity: 8000, unitPrice: 0.04, purchaseTime: new Date('2023-12-01') }
            ],
            purchaseAmount: 320.00,
            conversionRate: 3.8,
            dataQuality: 'good',
            settlementCycle: '周结',
            settlementAmount: 320.00,
            status: 'unsettled',
            lastPurchaseTime: new Date('2023-12-01')
          },
          {
            id: 3,
            username: 'customer003',
            realName: '王五',
            dataSources: [
              { name: '印度-30天以上', quantity: 15000, unitPrice: 0.03, purchaseTime: new Date('2023-11-30') },
              { name: '巴基斯坦-3天内', quantity: 3000, unitPrice: 0.05, purchaseTime: new Date('2023-12-01') }
            ],
            purchaseAmount: 600.00,
            conversionRate: 2.1,
            dataQuality: 'average',
            settlementCycle: '月结',
            settlementAmount: 600.00,
            status: 'processing',
            lastPurchaseTime: new Date('2023-12-01')
          }
        ]
        this.total = this.list.length
        this.listLoading = false
      }, 1000)
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleDetail(row) {
      this.currentSettlement = row
      this.settlementDialogVisible = true
    },
    handleSettlement(row) {
      this.currentSettlement = row
      this.settlementDialogVisible = true
    },
    handleViewFeedback(row) {
      this.$router.push(`/feedback/list?customer=${row.username}`)
    },
    handleExport() {
      this.$message.success('数据导出成功')
    },
    confirmSettlement() {
      this.settlementLoading = true

      setTimeout(() => {
        this.currentSettlement.status = 'settled'
        this.$message.success(this.$t('settlement.settlementSuccess'))
        this.settlementLoading = false
        this.settlementDialogVisible = false
        this.getList()
      }, 2000)
    },
    handleBatchSettlement() {
      if (this.multipleSelection.length === 0) {
        this.$message.warning('请选择需要结算的记录')
        return
      }

      this.$confirm(
        `确认结算选中的 ${this.multipleSelection.length} 条记录？`,
        this.$t('common.warning'),
        {
          confirmButtonText: this.$t('common.confirm'),
          cancelButtonText: this.$t('common.cancel'),
          type: 'warning'
        }
      ).then(() => {
        this.$message.success('批量结算成功')
        this.getList()
      }).catch(() => {})
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      } else if (prop === 'purchaseAmount') {
        this.sortByAmount(order)
      } else if (prop === 'lastPurchaseTime') {
        this.sortByTime(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    sortByAmount(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+purchaseAmount'
      } else {
        this.listQuery.sort = '-purchaseAmount'
      }
      this.handleFilter()
    },
    sortByTime(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+lastPurchaseTime'
      } else {
        this.listQuery.sort = '-lastPurchaseTime'
      }
      this.handleFilter()
    },
    getStatusText(status) {
      const statusMap = {
        settled: this.$t('settlement.settled'),
        unsettled: this.$t('settlement.unsettled'),
        processing: this.$t('settlement.processing')
      }
      return statusMap[status]
    },
    formatNumber(num) {
      return num.toLocaleString()
    },
    formatCurrency(amount) {
      return `${amount} U`
    },
    getConversionClass(rate) {
      if (rate >= 5) return 'conversion-high'
      if (rate >= 2) return 'conversion-medium'
      return 'conversion-low'
    },
    getQualityTagType(quality) {
      const tagMap = {
        excellent: 'success',
        good: 'primary',
        average: 'warning',
        poor: 'danger'
      }
      return tagMap[quality]
    },
    getQualityText(quality) {
      const textMap = {
        excellent: '优秀',
        good: '良好',
        average: '一般',
        poor: '较差'
      }
      return textMap[quality]
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-container {
  padding: 20px 0;
  .filter-item {
    display: inline-block;
    vertical-align: middle;
    margin-right: 10px;
  }
}

.stat-card {
  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;

    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #409eff;
      margin-bottom: 8px;

      &.settled {
        color: #67c23a;
      }

      &.unsettled {
        color: #f56c6c;
      }

      &.processing {
        color: #e6a23c;
      }
    }

    .stat-label {
      font-size: 14px;
      color: #606266;
    }
  }
}

.link-type {
  color: #409eff;
  cursor: pointer;

  &:hover {
    color: #66b1ff;
  }
}

.data-source-item {
  margin-bottom: 5px;

  .source-name {
    font-weight: bold;
    margin-right: 5px;
  }

  .source-count {
    color: #909399;
    font-size: 12px;
  }
}

.amount-highlight {
  color: #f56c6c;
  font-weight: bold;
  font-size: 14px;
}

.settlement-amount {
  color: #67c23a;
  font-weight: bold;
  font-size: 16px;
}

.effect-summary {
  div {
    margin-bottom: 3px;
    font-size: 12px;
  }
}

.conversion-high {
  color: #67c23a;
  font-weight: bold;
}

.conversion-medium {
  color: #e6a23c;
  font-weight: bold;
}

.conversion-low {
  color: #f56c6c;
  font-weight: bold;
}
</style>
