<template>
  <div class="app-container">
    <!-- 订单统计卡片 -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-number">{{ formatNumber(statistics.total) }}</div>
            <div class="stat-label">总订单数</div>
          </div>
          <i class="el-icon-s-order stat-icon" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-number">{{ formatNumber(statistics.pending) }}</div>
            <div class="stat-label">待处理</div>
          </div>
          <i class="el-icon-time stat-icon" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-number">{{ formatNumber(statistics.completed) }}</div>
            <div class="stat-label">已完成</div>
          </div>
          <i class="el-icon-circle-check stat-icon" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-number">{{ statistics.totalAmount }}</div>
            <div class="stat-label">总交易额(U)</div>
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
          :placeholder="$t('order.orderNo')"
          style="width: 200px;"
          class="filter-item"
          @keyup.enter.native="handleFilter"
        />

        <el-select
          v-model="listQuery.status"
          :placeholder="$t('order.status')"
          clearable
          style="width: 120px"
          class="filter-item"
        >
          <el-option :label="$t('order.pending')" value="pending" />
          <el-option :label="$t('order.processing')" value="processing" />
          <el-option :label="$t('order.completed')" value="completed" />
          <el-option :label="$t('order.cancelled')" value="cancelled" />
        </el-select>

        <el-input
          v-model="listQuery.customer"
          :placeholder="$t('order.customer')"
          style="width: 150px;"
          class="filter-item"
          @keyup.enter.native="handleFilter"
        />

        <el-date-picker
          v-model="listQuery.dateRange"
          type="daterange"
          :range-separator="$t('common.to')"
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
          {{ $t('common.search') }}
        </el-button>
      </div>
    </el-card>

    <!-- 订单列表 -->
    <el-card>
      <div slot="header" class="clearfix">
        <span>{{ $t('order.list') }}</span>
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
          :label="$t('order.orderNo')"
          prop="orderNo"
          min-width="150"
        >
          <template slot-scope="{row}">
            <span class="link-type" @click="handleDetail(row)">{{ row.orderNo }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('order.customer')"
          prop="customerName"
          width="120"
        />
        <el-table-column
          :label="$t('order.dataType')"
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
          :label="$t('order.quantity')"
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
          :label="$t('order.amount')"
          prop="amount"
          width="100"
          align="center"
        >
          <template slot-scope="{row}">
            {{ row.amount }} U
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('order.status')"
          prop="status"
          width="100"
          align="center"
        >
          <template slot-scope="{row}">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('order.createTime')"
          prop="createTime"
          width="150"
          align="center"
          sortable="custom"
        >
          <template slot-scope="{row}">
            {{ row.createTime | parseTime('{y}-{m}-{d} {h}:{i}') }}
          </template>
        </el-table-column>
        <el-table-column
          label="发货状态"
          prop="deliveryStatus"
          width="100"
          align="center"
        >
          <template slot-scope="{row}">
            <el-tag v-if="row.deliveryStatus === 'delivered'" type="success">
              {{ $t('order.delivered') }}
            </el-tag>
            <el-tag v-else-if="row.deliveryStatus === 'processing'" type="warning">
              处理中
            </el-tag>
            <el-tag v-else type="info">
              未发货
            </el-tag>
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
              v-if="row.status === 'pending'"
              type="success"
              size="mini"
              @click="handleProcess(row)"
            >
              处理
            </el-button>
            <el-button
              v-if="row.status === 'processing' && row.deliveryStatus !== 'delivered'"
              type="warning"
              size="mini"
              @click="handleDeliver(row)"
            >
              发货
            </el-button>
            <el-button
              v-if="['pending', 'processing'].includes(row.status)"
              size="mini"
              type="danger"
              @click="handleCancel(row)"
            >
              取消
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

    <!-- 发货对话框 -->
    <el-dialog
      title="发货确认"
      :visible.sync="deliveryDialogVisible"
      width="500px"
    >
      <div v-if="currentOrder">
        <p>确认向 <strong>{{ currentOrder.deliveryEmail }}</strong> 发货？</p>
        <p>订单号: {{ currentOrder.orderNo }}</p>
        <p>数据数量: {{ formatNumber(currentOrder.quantity) }} 条</p>
        <p>运营商分布:</p>
        <ul>
          <li v-for="operator in currentOrder.operators" :key="operator.name">
            {{ operator.name }}: {{ formatNumber(operator.count) }} 条
          </li>
        </ul>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deliveryDialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="deliveryLoading" @click="confirmDelivery">确认发货</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'
import waves from '@/directive/waves'
import request from '@/utils/request'
import i18nMixin from '@/mixins/i18n'

export default {
  name: 'OrderList',
  components: { Pagination },
  directives: { waves },
  filters: {
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
        orderNo: undefined,
        status: undefined,
        customer: undefined,
        dateRange: null,
        sort: '-createTime'
      },
      statistics: {
        total: 0,
        pending: 0,
        completed: 0,
        totalAmount: '0.00'
      },
      deliveryDialogVisible: false,
      currentOrder: null,
      deliveryLoading: false
    }
  },
  created() {
    this.getList()
    this.getStatistics()
  },
  activated() {
    // 当组件被激活时（从购买页面返回），重新加载数据
    console.log('🔄 订单列表页面被激活，重新加载数据...')
    this.getList()
    this.getStatistics()
  },
  methods: {
    async getList() {
      this.listLoading = true
      console.log('📊 开始加载订单列表...')

      try {
        // 从数据库获取订单数据
        const response = await request({
          url: '/api/orders',
          method: 'GET',
          params: {
            page: 1,
            limit: 1000
          }
        })

        const orders = response.data || []
        console.log('✅ 加载到', orders.length, '条订单')

        // 转换数据格式以适应列表显示
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
          status: order.status || 'pending',
          deliveryStatus: order.deliveryStatus || 'pending',
          deliveryEmail: order.deliveryEmail,
          createTime: order.createTime,
          deliveryTime: order.deliveryTime,
          remark: order.remark
        }))

        // 应用筛选条件
        if (this.listQuery.orderNo) {
          processedOrders = processedOrders.filter(order =>
            order.orderNo.toLowerCase().includes(this.listQuery.orderNo.toLowerCase())
          )
        }

        if (this.listQuery.status) {
          processedOrders = processedOrders.filter(order => order.status === this.listQuery.status)
        }

        if (this.listQuery.customer) {
          processedOrders = processedOrders.filter(order =>
            order.customerName.toLowerCase().includes(this.listQuery.customer.toLowerCase())
          )
        }

        if (this.listQuery.dateRange && this.listQuery.dateRange.length === 2) {
          const startTime = this.listQuery.dateRange[0].getTime()
          const endTime = this.listQuery.dateRange[1].getTime() + 24 * 60 * 60 * 1000 // 包括结束日期当天
          processedOrders = processedOrders.filter(order => {
            const orderTime = order.createTime
            return orderTime >= startTime && orderTime < endTime
          })
        }

        // 排序
        processedOrders.sort((a, b) => {
          if (this.listQuery.sort === '-createTime') {
            return b.createTime - a.createTime
          } else if (this.listQuery.sort === '+createTime') {
            return a.createTime - b.createTime
          }
          return 0
        })

        // 分页
        this.total = processedOrders.length
        const start = (this.listQuery.page - 1) * this.listQuery.limit
        const end = start + this.listQuery.limit
        this.list = processedOrders.slice(start, end)

        console.log('✅ 订单列表加载完成，显示', this.list.length, '条记录')

        this.listLoading = false
      } catch (error) {
        console.error('❌ 加载订单列表失败:', error)
        this.$message.error('加载订单失败，请检查网络连接')
        this.list = []
        this.total = 0
        this.listLoading = false
      }
    },

    async getStatistics() {
      try {
        // 从数据库获取订单统计数据
        const response = await request({
          url: '/api/orders',
          method: 'GET',
          params: {
            page: 1,
            limit: 1000
          }
        })

        const orders = response.data || []

        this.statistics = {
          total: orders.length,
          pending: orders.filter(o => o.status === 'pending').length,
          completed: orders.filter(o => o.status === 'completed').length,
          totalAmount: orders.reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0).toFixed(2)
        }
      } catch (error) {
        console.error('❌ 加载订单统计失败:', error)
        this.statistics = {
          total: 0,
          pending: 0,
          completed: 0,
          totalAmount: '0.00'
        }
      }
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleDetail(row) {
      this.$router.push(`/order/detail/${row.id}`)
    },
    handleProcess(row) {
      this.$confirm('确认处理该订单？', this.$t('common.warning'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        // 模拟处理过程
        row.status = 'processing'
        this.$message.success('订单处理成功')
        this.getList()
      }).catch(() => {})
    },
    handleDeliver(row) {
      this.currentOrder = row
      this.deliveryDialogVisible = true
    },
    confirmDelivery() {
      this.deliveryLoading = true

      // 模拟发货过程
      setTimeout(() => {
        this.currentOrder.deliveryStatus = 'delivered'
        this.currentOrder.status = 'completed'
        this.currentOrder.deliveryTime = new Date()

        this.$message.success('发货成功！系统已自动发送数据到客户邮箱')
        this.deliveryLoading = false
        this.deliveryDialogVisible = false
        this.getList()
      }, 2000)
    },
    handleCancel(row) {
      this.$confirm('确认取消该订单？', this.$t('common.warning'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        row.status = 'cancelled'
        this.$message.success('订单取消成功')
        this.getList()
      }).catch(() => {})
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'createTime') {
        this.sortByCreateTime(order)
      }
    },
    sortByCreateTime(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+createTime'
      } else {
        this.listQuery.sort = '-createTime'
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
    },
    getStatusType(status) {
      const statusMap = {
        pending: 'warning',
        processing: 'primary',
        completed: 'success',
        cancelled: 'danger'
      }
      return statusMap[status]
    },
    getStatusText(status) {
      const statusMap = {
        pending: this.$t('order.pending'),
        processing: this.$t('order.processing'),
        completed: this.$t('order.completed'),
        cancelled: this.$t('order.cancelled')
      }
      return statusMap[status]
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
    color: #ddd;
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
