<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="clearfix">
        <span>{{ $t('navbar.rechargeRecord') }}</span>
      </div>

      <!-- 筛选条件 -->
      <div class="filter-container">
        <el-input
          v-model="listQuery.customerName"
          :placeholder="$t('user.customerName')"
          style="width: 200px;"
          class="filter-item"
          @keyup.enter.native="handleFilter"
        />
        <el-select
          v-model="listQuery.type"
          :placeholder="$t('recharge.type')"
          clearable
          style="width: 120px"
          class="filter-item"
        >
          <el-option value="customer" :label="$t('navbar.customerRecharge')" />
          <el-option value="agent" :label="$t('navbar.agentRecharge')" />
        </el-select>
        <el-select
          v-model="listQuery.status"
          :placeholder="$t('recharge.status')"
          clearable
          style="width: 120px"
          class="filter-item"
        >
          <el-option value="success" :label="$t('recharge.success')" />
          <el-option value="pending" :label="$t('recharge.pending')" />
          <el-option value="failed" :label="$t('recharge.failed')" />
        </el-select>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          :range-separator="$t('common.to')"
          :start-placeholder="$t('common.startDate')"
          :end-placeholder="$t('common.endDate')"
          class="filter-item"
          style="width: 240px"
          @change="handleDateChange"
        />
        <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
          {{ $t('common.search') }}
        </el-button>
        <el-button class="filter-item" style="margin-left: 10px;" @click="resetQuery">
          {{ $t('common.reset') }}
        </el-button>
      </div>

      <!-- 数据表格 -->
      <el-table
        :key="tableKey"
        v-loading="listLoading"
        :data="list"
        border
        fit
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column
          label="ID"
          prop="id"
          align="center"
          width="80"
        />
        <el-table-column
          :label="$t('user.customerName')"
          min-width="120px"
        >
          <template slot-scope="{row}">
            <span>{{ row.customerName }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('recharge.type')"
          width="100px"
          align="center"
        >
          <template slot-scope="{row}">
            <el-tag :type="row.type === 'customer' ? 'primary' : 'success'">
              {{ row.type === 'customer' ? $t('navbar.customerRecharge') : $t('navbar.agentRecharge') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('recharge.amount')"
          width="150px"
          align="center"
        >
          <template slot-scope="{row}">
            <span style="color: #67C23A; font-weight: bold;">¥{{ parseFloat(row.amount).toFixed(5) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('recharge.method')"
          width="100px"
          align="center"
        >
          <template slot-scope="{row}">
            <span>{{ getMethodLabel(row.method) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('recharge.status')"
          width="100px"
          align="center"
        >
          <template slot-scope="{row}">
            <el-tag :type="row.status | statusFilter">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('recharge.createTime')"
          width="160px"
          align="center"
        >
          <template slot-scope="{row}">
            <span>{{ row.createTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('recharge.remark')"
          min-width="150px"
        >
          <template slot-scope="{row}">
            <span>{{ row.remark || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('common.operation')"
          align="center"
          width="120"
        >
          <template slot-scope="{row}">
            <el-button
              type="primary"
              size="mini"
              @click="handleDetail(row)"
            >
              {{ $t('common.detail') }}
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

    <!-- 详情对话框 -->
    <el-dialog
      :title="$t('recharge.detail')"
      :visible.sync="detailDialogVisible"
      width="600px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="$t('user.customerName')">
          {{ currentRecord.customerName }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('recharge.type')">
          <el-tag :type="currentRecord.type === 'customer' ? 'primary' : 'success'">
            {{ currentRecord.type === 'customer' ? $t('navbar.customerRecharge') : $t('navbar.agentRecharge') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('recharge.amount')">
          <span style="color: #67C23A; font-weight: bold;">¥{{ parseFloat(currentRecord.amount || 0).toFixed(5) }}</span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('recharge.method')">
          {{ getMethodLabel(currentRecord.method) }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('recharge.status')">
          <el-tag :type="currentRecord.status | statusFilter">
            {{ getStatusLabel(currentRecord.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('recharge.createTime')">
          {{ currentRecord.createTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('recharge.remark')" :span="2">
          {{ currentRecord.remark || '-' }}
        </el-descriptions-item>
      </el-descriptions>
      <span slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">{{ $t('common.close') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'
import waves from '@/directive/waves'
import i18nMixin from '@/mixins/i18n'

export default {
  name: 'RechargeRecord',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        success: 'success',
        pending: 'warning',
        failed: 'danger'
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
      listQuery: {
        page: 1,
        limit: 20,
        customerName: undefined,
        type: undefined,
        status: undefined,
        startDate: undefined,
        endDate: undefined
      },
      dateRange: null,
      detailDialogVisible: false,
      currentRecord: {}
    }
  },
  created() {
    this.getList()
  },
  methods: {
    async getList() {
      this.listLoading = true

      try {
        // 从数据库获取充值记录
        const response = await request({
          url: '/api/recharge-records',
          method: 'GET',
          params: {
            page: 1,
            limit: 1000
          }
        })

        const rechargeRecords = response.data || []
        console.log('✅ 加载到', rechargeRecords.length, '条充值记录')

        // 应用筛选条件
        let filteredList = [...rechargeRecords]

        if (this.listQuery.customerName) {
          filteredList = filteredList.filter(item =>
            item.customerName && item.customerName.toLowerCase().includes(this.listQuery.customerName.toLowerCase())
          )
        }

        if (this.listQuery.type) {
          filteredList = filteredList.filter(item => item.type === this.listQuery.type)
        }

        if (this.listQuery.status) {
          filteredList = filteredList.filter(item => item.status === this.listQuery.status)
        }

        if (this.listQuery.startDate && this.listQuery.endDate) {
          const startTime = new Date(this.listQuery.startDate).getTime()
          const endTime = new Date(this.listQuery.endDate).getTime() + 86400000 // +1天
          filteredList = filteredList.filter(item => {
            const itemTime = typeof item.createTime === 'number' ? item.createTime : new Date(item.createTime).getTime()
            return itemTime >= startTime && itemTime <= endTime
          })
        }

        // 按创建时间降序排列
        filteredList.sort((a, b) => {
          const timeA = typeof a.createTime === 'number' ? a.createTime : new Date(a.createTime).getTime()
          const timeB = typeof b.createTime === 'number' ? b.createTime : new Date(b.createTime).getTime()
          return timeB - timeA
        })

        this.list = filteredList
        this.total = filteredList.length
        this.listLoading = false
      } catch (error) {
        console.error('❌ 加载充值记录失败:', error)
        this.$message.error('加载充值记录失败，请检查网络连接')
        this.list = []
        this.total = 0
        this.listLoading = false
      }
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetQuery() {
      this.listQuery = {
        page: 1,
        limit: 20,
        customerName: undefined,
        type: undefined,
        status: undefined,
        startDate: undefined,
        endDate: undefined
      }
      this.dateRange = null
      this.getList()
    },
    handleDateChange(value) {
      if (value) {
        this.listQuery.startDate = value[0]
        this.listQuery.endDate = value[1]
      } else {
        this.listQuery.startDate = undefined
        this.listQuery.endDate = undefined
      }
    },
    handleDetail(row) {
      this.currentRecord = { ...row }
      this.detailDialogVisible = true
    },
    getMethodLabel(method) {
      const methodMap = {
        alipay: this.$t('recharge.alipay'),
        wechat: this.$t('recharge.wechat'),
        bank: this.$t('recharge.bank'),
        cash: this.$t('recharge.cash'),
        initial: '初始金额',
        system: '系统充值'
      }
      return methodMap[method] || method
    },
    getStatusLabel(status) {
      const statusMap = {
        success: this.$t('recharge.success'),
        pending: this.$t('recharge.pending'),
        failed: this.$t('recharge.failed')
      }
      return statusMap[status] || status
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
</style>
