<template>
  <div class="app-container">
    <!-- 订单统计卡片 -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="8">
        <el-card class="stat-card reviewing-card">
          <div class="stat-content">
            <div class="stat-number">{{ formatNumber(statistics.reviewing) }}</div>
            <div class="stat-label">待审核订单</div>
          </div>
          <i class="el-icon-document-checked stat-icon" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card approved-card">
          <div class="stat-content">
            <div class="stat-number">{{ formatNumber(statistics.approved) }}</div>
            <div class="stat-label">今日已审核</div>
          </div>
          <i class="el-icon-circle-check stat-icon" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card amount-card">
          <div class="stat-content">
            <div class="stat-number">{{ statistics.totalAmount }}</div>
            <div class="stat-label">待审核总金额(U)</div>
          </div>
          <i class="el-icon-money stat-icon" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选条件 -->
    <el-card style="margin-bottom: 20px;">
      <div class="filter-container">
        <el-input
          v-model="listQuery.orderNo"
          placeholder="订单号"
          style="width: 200px;"
          class="filter-item"
          @keyup.enter.native="handleFilter"
        />

        <el-input
          v-model="listQuery.customer"
          placeholder="客户名称"
          style="width: 150px;"
          class="filter-item"
          @keyup.enter.native="handleFilter"
        />

        <el-date-picker
          v-model="listQuery.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          class="filter-item"
          style="width: 240px"
        />

        <el-button
          v-waves
          class="filter-item"
          type="primary"
          icon="el-icon-search"
          @click="handleFilter"
        >
          搜索
        </el-button>

        <el-button
          v-waves
          class="filter-item"
          type="success"
          icon="el-icon-refresh"
          @click="refreshData"
        >
          刷新数据
        </el-button>
      </div>
    </el-card>

    <!-- 订单列表 -->
    <el-card>
      <div slot="header" class="clearfix">
        <span>待审核订单列表</span>
        <el-tag v-if="total > 0" type="warning" style="margin-left: 10px;">
          共 {{ total }} 条待审核订单
        </el-tag>
      </div>

      <el-table
        :key="tableKey"
        v-loading="listLoading"
        :data="list"
        border
        fit
        highlight-current-row
        style="width: 100%;"
        @sort-change="sortChange"
      >
        <el-table-column
          label="订单号"
          prop="orderNo"
          min-width="150"
        >
          <template slot-scope="{row}">
            <span class="link-type" @click="handleDetail(row)">{{ row.orderNo }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="客户"
          prop="customerName"
          width="120"
        />
        <el-table-column
          label="数据类型"
          min-width="150"
        >
          <template slot-scope="{row}">
            <div class="data-type-info">
              <div>{{ row.dataInfo.country }} - {{ getValidityText(row.dataInfo.validity) }}</div>
              <div class="data-source">{{ row.dataInfo.source }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="数量"
          prop="quantity"
          width="100"
          align="center"
        >
          <template slot-scope="{row}">
            {{ formatNumber(row.quantity) }}
          </template>
        </el-table-column>
        <el-table-column
          label="运营商"
          min-width="150"
        >
          <template slot-scope="{row}">
            <div v-for="operator in row.operators" :key="operator.name" class="operator-item">
              <span class="operator-name">{{ operator.name }}:</span>
              <span class="operator-count">{{ formatNumber(operator.count) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="金额"
          prop="amount"
          width="100"
          align="center"
        >
          <template slot-scope="{row}">
            {{ row.amount }} U
          </template>
        </el-table-column>
        <el-table-column
          label="提交时间"
          prop="reviewTime"
          width="150"
          align="center"
          sortable="custom"
        >
          <template slot-scope="{row}">
            {{ row.reviewTime | parseTime('{y}-{m}-{d} {h}:{i}') }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
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
              详情
            </el-button>
            <el-button
              type="success"
              size="mini"
              @click="handleApprove(row)"
            >
              通过
            </el-button>
            <el-button
              size="mini"
              type="danger"
              @click="handleReject(row)"
            >
              拒绝
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

    <!-- 审核对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="reviewDialogVisible"
      width="600px"
    >
      <el-form v-if="currentOrder" label-width="100px">
        <el-form-item label="订单号">
          <span>{{ currentOrder.orderNo }}</span>
        </el-form-item>
        <el-form-item label="客户">
          <span>{{ currentOrder.customerName }}</span>
        </el-form-item>
        <el-form-item label="数据">
          <span>{{ currentOrder.dataInfo.country }} - {{ getValidityText(currentOrder.dataInfo.validity) }}</span>
        </el-form-item>
        <el-form-item label="数量">
          <span>{{ formatNumber(currentOrder.quantity) }} 条</span>
        </el-form-item>
        <el-form-item label="运营商">
          <div v-for="operator in currentOrder.operators" :key="operator.name">
            {{ operator.name }}: {{ formatNumber(operator.count) }} 条
          </div>
        </el-form-item>
        <el-form-item label="金额">
          <span style="color: #f56c6c; font-weight: bold; font-size: 16px;">{{ currentOrder.amount }} U</span>
        </el-form-item>
        <el-form-item v-if="reviewAction === 'reject'" label="拒绝原因">
          <el-input
            v-model="rejectReason"
            type="textarea"
            :rows="3"
            placeholder="请输入拒绝原因"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="reviewDialogVisible = false">取 消</el-button>
        <el-button
          :type="reviewAction === 'approve' ? 'success' : 'danger'"
          :loading="reviewLoading"
          @click="confirmReview"
        >
          {{ reviewAction === 'approve' ? '确认通过' : '确认拒绝' }}
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'
import waves from '@/directive/waves'

export default {
  name: 'ReviewOrders',
  components: { Pagination },
  directives: { waves },
  filters: {
    parseTime
  },
  data() {
    return {
      tableKey: 0,
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        orderNo: undefined,
        customer: undefined,
        dateRange: null,
        sort: '-reviewTime'
      },
      statistics: {
        reviewing: 0,
        approved: 0,
        totalAmount: '0.00'
      },
      reviewDialogVisible: false,
      currentOrder: null,
      reviewLoading: false,
      reviewAction: 'approve', // approve 或 reject
      rejectReason: ''
    }
  },
  computed: {
    dialogTitle() {
      return this.reviewAction === 'approve' ? '审核通过' : '拒绝订单'
    }
  },
  created() {
    this.getList()
    this.getStatistics()
  },
  activated() {
    console.log('🔄 代理审核订单页面被激活，重新加载数据...')
    this.getList()
    this.getStatistics()
  },
  methods: {
    getList() {
      this.listLoading = true
      console.log('📊 开始加载待审核订单列表...')

      const savedOrders = localStorage.getItem('orderList')
      let orders = []

      if (savedOrders) {
        try {
          orders = JSON.parse(savedOrders)
          console.log('✅ 加载到', orders.length, '条订单')
        } catch (e) {
          console.error('解析订单数据失败:', e)
          orders = []
        }
      }

      // 只保留审核中的订单
      orders = orders.filter(order => order.status === 'reviewing')

      console.log('✅ 筛选出', orders.length, '条待审核订单')

      // 转换数据格式
      let processedOrders = orders.map(order => ({
        id: order.id,
        orderNo: order.orderNo,
        customerName: order.customerName,
        dataInfo: {
          country: order.country,
          validity: order.validity,
          source: order.source
        },
        quantity: order.quantity,
        operators: order.operators || [],
        amount: parseFloat(order.totalAmount || 0).toFixed(2),
        status: order.status,
        deliveryEmail: order.deliveryEmail,
        createTime: order.createTime,
        reviewTime: order.reviewTime || order.createTime,
        remark: order.remark
      }))

      // 应用筛选条件
      if (this.listQuery.orderNo) {
        processedOrders = processedOrders.filter(order =>
          order.orderNo.toLowerCase().includes(this.listQuery.orderNo.toLowerCase())
        )
      }

      if (this.listQuery.customer) {
        processedOrders = processedOrders.filter(order =>
          order.customerName.toLowerCase().includes(this.listQuery.customer.toLowerCase())
        )
      }

      if (this.listQuery.dateRange && this.listQuery.dateRange.length === 2) {
        const startTime = this.listQuery.dateRange[0].getTime()
        const endTime = this.listQuery.dateRange[1].getTime() + 24 * 60 * 60 * 1000
        processedOrders = processedOrders.filter(order => {
          const orderTime = order.reviewTime
          return orderTime >= startTime && orderTime < endTime
        })
      }

      // 排序
      processedOrders.sort((a, b) => {
        if (this.listQuery.sort === '-reviewTime') {
          return b.reviewTime - a.reviewTime
        } else if (this.listQuery.sort === '+reviewTime') {
          return a.reviewTime - b.reviewTime
        }
        return 0
      })

      // 分页
      this.total = processedOrders.length
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit
      this.list = processedOrders.slice(start, end)

      console.log('✅ 待审核订单列表加载完成，显示', this.list.length, '条记录')

      setTimeout(() => {
        this.listLoading = false
      }, 300)
    },

    getStatistics() {
      const savedOrders = localStorage.getItem('orderList')
      let orders = []

      if (savedOrders) {
        try {
          orders = JSON.parse(savedOrders)
        } catch (e) {
          console.error('解析订单数据失败:', e)
        }
      }

      const reviewing = orders.filter(o => o.status === 'reviewing')

      // 今日已审核（已完成+待发货状态）
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayTime = today.getTime()
      const approved = orders.filter(o =>
        o.status === 'completed' &&
        o.reviewTime &&
        o.reviewTime >= todayTime
      )

      const totalAmount = reviewing.reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0)

      this.statistics = {
        reviewing: reviewing.length,
        approved: approved.length,
        totalAmount: totalAmount.toFixed(2)
      }
    },

    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },

    refreshData() {
      console.log('🔄 手动刷新待审核订单...')
      this.$message({
        type: 'info',
        message: '正在刷新数据...',
        duration: 1000
      })
      this.tableKey = this.tableKey + 1
      this.getList()
      this.getStatistics()
    },

    handleDetail(row) {
      this.$router.push(`/order/detail/${row.id}`)
    },

    handleApprove(row) {
      this.currentOrder = row
      this.reviewAction = 'approve'
      this.reviewDialogVisible = true
    },

    handleReject(row) {
      this.currentOrder = row
      this.reviewAction = 'reject'
      this.rejectReason = ''
      this.reviewDialogVisible = true
    },

    confirmReview() {
      if (this.reviewAction === 'reject' && !this.rejectReason.trim()) {
        this.$message.warning('请输入拒绝原因')
        return
      }

      this.reviewLoading = true

      setTimeout(() => {
        const savedOrders = localStorage.getItem('orderList')
        if (savedOrders) {
          const orders = JSON.parse(savedOrders)
          const orderIndex = orders.findIndex(o => o.id === this.currentOrder.id)
          if (orderIndex !== -1) {
            if (this.reviewAction === 'approve') {
              // 审核通过，流转到已完成订单，状态为待发货
              orders[orderIndex].status = 'completed'
              orders[orderIndex].deliveryStatus = 'pending'
              orders[orderIndex].approveTime = Date.now()
              console.log('✅ 订单审核通过:', orders[orderIndex].orderNo)
              this.$message.success('审核通过！订单已流转到已完成订单，等待发货')
            } else {
              // 审核拒绝，订单状态改为已取消
              orders[orderIndex].status = 'cancelled'
              orders[orderIndex].rejectReason = this.rejectReason
              orders[orderIndex].rejectTime = Date.now()
              console.log('❌ 订单被拒绝:', orders[orderIndex].orderNo, '原因:', this.rejectReason)
              this.$message.success('订单已拒绝')
            }
            localStorage.setItem('orderList', JSON.stringify(orders))
          }
        }

        this.reviewLoading = false
        this.reviewDialogVisible = false
        this.getList()
        this.getStatistics()
      }, 1500)
    },

    sortChange(data) {
      const { prop, order } = data
      if (prop === 'reviewTime') {
        this.sortByReviewTime(order)
      }
    },

    sortByReviewTime(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+reviewTime'
      } else {
        this.listQuery.sort = '-reviewTime'
      }
      this.handleFilter()
    },

    formatNumber(num) {
      return num.toLocaleString()
    },

    getValidityText(validity) {
      const validityMap = {
        '3': '3天内',
        '30': '30天内',
        '30+': '30天以上'
      }
      return validityMap[validity] || validity
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-container {
  .filter-item {
    display: inline-block;
    vertical-align: middle;
    margin-right: 10px;
  }
}

.stat-card {
  position: relative;
  overflow: hidden;

  &.reviewing-card {
    background: linear-gradient(135deg, #FFF3CD 0%, #FFF8E1 100%);
  }

  &.approved-card {
    background: linear-gradient(135deg, #D4EDDA 0%, #E8F5E9 100%);
  }

  &.amount-card {
    background: linear-gradient(135deg, #CCE5FF 0%, #E3F2FD 100%);
  }

  .stat-content {
    .stat-number {
      font-size: 24px;
      font-weight: bold;
      color: #409eff;
      margin-bottom: 5px;
    }

    .stat-label {
      font-size: 14px;
      color: #606266;
    }
  }

  .stat-icon {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 40px;
    color: rgba(0, 0, 0, 0.1);
  }
}

.link-type {
  color: #409eff;
  cursor: pointer;

  &:hover {
    color: #66b1ff;
  }
}

.data-type-info {
  .data-source {
    color: #909399;
    font-size: 12px;
  }
}

.operator-item {
  margin-bottom: 3px;

  .operator-name {
    font-weight: bold;
    margin-right: 5px;
  }

  .operator-count {
    color: #409eff;
  }
}
</style>
