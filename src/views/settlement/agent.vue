<template>
  <div class="app-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value">¥{{ totalStats.totalCommission }}</div>
            <div class="stat-label">{{ $t('agent.totalCommission') }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value settled">¥{{ totalStats.settledCommission }}</div>
            <div class="stat-label">{{ $t('settlement.settledAmount') }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value unsettled">¥{{ totalStats.unsettledCommission }}</div>
            <div class="stat-label">{{ $t('settlement.unsettledAmount') }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value processing">{{ totalStats.processingCount }}</div>
            <div class="stat-label">{{ $t('settlement.processing') }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索和操作栏 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.agentName"
        :placeholder="$t('agent.pleaseEnterAgentName')"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
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
        @click="handleBatchSettlement"
      >
        {{ $t('settlement.settlement') }}
      </el-button>
    </div>

    <!-- 代理结算列表表格 -->
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        width="55"
        align="center"
      />
      <el-table-column
        label="ID"
        prop="id"
        align="center"
        width="80"
      />
      <el-table-column
        :label="$t('agent.agentCode')"
        min-width="120px"
      >
        <template slot-scope="{row}">
          <span class="link-type" @click="handleDetail(row)">{{ row.agentCode }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('agent.agentName')"
        min-width="120px"
      >
        <template slot-scope="{row}">
          <span>{{ row.agentName }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('agent.level')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{row}">
          <el-tag :type="getLevelTagType(row.level)">
            {{ getLevelText(row.level) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('settlement.settlementDate')"
        width="120px"
        align="center"
      >
        <template slot-scope="{row}">
          <span>{{ row.settlementDate }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('settlement.settlementAmount')"
        min-width="120px"
        align="center"
      >
        <template slot-scope="{row}">
          <span>¥{{ row.settlementAmount }}</span>
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
        :label="$t('user.createTime')"
        width="150px"
        align="center"
      >
        <template slot-scope="{row}">
          <span>{{ row.createTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('common.operation')"
        align="center"
        width="200"
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
  </div>
</template>

<script>
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'
import waves from '@/directive/waves'
import i18nMixin from '@/mixins/i18n'

export default {
  name: 'AgentSettlement',
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
        totalCommission: '68,950.80',
        settledCommission: '45,200.30',
        unsettledCommission: '23,750.50',
        processingCount: 3
      },
      listQuery: {
        page: 1,
        limit: 20,
        agentName: undefined,
        dateRange: [],
        status: undefined
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      // 模拟获取代理结算列表数据
      setTimeout(() => {
        this.list = [
          {
            id: 1,
            agentCode: 'AGENT001',
            agentName: '一级代理商A',
            level: 1,
            settlementDate: '2023-12-01',
            settlementAmount: '2680.50',
            status: 'settled',
            createTime: new Date('2023-12-01')
          },
          {
            id: 2,
            agentCode: 'AGENT002',
            agentName: '二级代理商B',
            level: 2,
            settlementDate: '2023-12-01',
            settlementAmount: '1950.30',
            status: 'unsettled',
            createTime: new Date('2023-12-01')
          },
          {
            id: 3,
            agentCode: 'AGENT003',
            agentName: '三级代理商C',
            level: 3,
            settlementDate: '2023-12-01',
            settlementAmount: '680.80',
            status: 'processing',
            createTime: new Date('2023-12-01')
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
      this.$message.info(`查看代理 ${row.agentName} 的结算详情`)
    },
    handleSettlement(row) {
      this.$confirm(this.$t('settlement.confirmSettlement'), this.$t('common.warning'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        this.$message({
          type: 'success',
          message: this.$t('settlement.settlementSuccess')
        })
        row.status = 'settled'
      }).catch(() => {})
    },
    handleBatchSettlement() {
      if (this.multipleSelection.length === 0) {
        this.$message.warning('请选择需要结算的记录')
        return
      }
      this.$confirm(`确认结算选中的 ${this.multipleSelection.length} 条记录？`, this.$t('common.warning'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        this.$message({
          type: 'success',
          message: `批量结算${this.multipleSelection.length}条记录成功`
        })
        this.multipleSelection.forEach(item => {
          item.status = 'settled'
        })
        this.multipleSelection = []
      }).catch(() => {})
    },
    handleSelectionChange(selection) {
      this.multipleSelection = selection
    },
    getLevelTagType(level) {
      const levelMap = {
        1: 'danger',
        2: 'warning',
        3: 'success'
      }
      return levelMap[level]
    },
    getLevelText(level) {
      const levelMap = {
        1: this.$t('agent.level1'),
        2: this.$t('agent.level2'),
        3: this.$t('agent.level3')
      }
      return levelMap[level]
    },
    getStatusText(status) {
      const statusMap = {
        settled: this.$t('settlement.settled'),
        unsettled: this.$t('settlement.unsettled'),
        processing: this.$t('settlement.processing')
      }
      return statusMap[status]
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

.link-type {
  color: #409eff;
  cursor: pointer;

  &:hover {
    color: #66b1ff;
  }
}

.stat-card {
  text-align: center;

  .stat-item {
    .stat-value {
      font-size: 28px;
      font-weight: bold;
      color: #303133;

      &.settled {
        color: #67C23A;
      }

      &.unsettled {
        color: #E6A23C;
      }

      &.processing {
        color: #909399;
      }
    }

    .stat-label {
      margin-top: 8px;
      color: #606266;
      font-size: 14px;
    }
  }
}
</style>
