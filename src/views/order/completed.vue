<template>
  <div class="app-container">
    <!-- 订单统计卡片 -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="8">
        <el-card class="stat-card completed-card">
          <div class="stat-content">
            <div class="stat-number">{{ formatNumber(statistics.completed) }}</div>
            <div class="stat-label">已完成订单</div>
          </div>
          <i class="el-icon-circle-check stat-icon" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card quantity-card">
          <div class="stat-content">
            <div class="stat-number">{{ formatNumber(statistics.totalQuantity) }}</div>
            <div class="stat-label">总数据量</div>
          </div>
          <i class="el-icon-data-line stat-icon" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card amount-card">
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
        handleDeliver(row) {
        // 跳转到发货页面
        this.$router.push({
        path: `/order/delivery/${row.id}`
        })
        },

        <el-button
          v-waves
          class="filter-item"
          type="success"
          icon="el-icon-refresh"
          @click="refreshData"
        >
          刷新数据
        </el-button>

        <el-button
          v-waves
          class="filter-item"
          type="info"
          icon="el-icon-download"
          @click="exportData"
        >
          导出数据
        </el-button>
      </div>
    </el-card>

    <!-- 订单列表 -->
    <el-card>
      <div slot="header" class="clearfix">
        <span>已完成订单列表</span>
        <el-tag v-if="total > 0" type="success" style="margin-left: 10px;">
          共 {{ total }} 条已完成订单
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
          label="发货状态"
          prop="deliveryStatus"
          width="100"
          align="center"
        >
          <template slot-scope="{row}">
            <el-tag v-if="row.deliveryStatus === 'pending'" type="warning">
              待发货
            </el-tag>
            <el-tag v-else-if="row.deliveryStatus === 'delivered'" type="success">
              {{ $t('order.delivered') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="完成时间"
          prop="deliveryTime"
          width="150"
          align="center"
          sortable="custom"
        >
          <template slot-scope="{row}">
            {{ row.deliveryTime | parseTime('{y}-{m}-{d} {h}:{i}') }}
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
              v-if="row.deliveryStatus === 'pending'"
              type="success"
              size="mini"
              @click="handleDeliver(row)"
            >
              发货
            </el-button>
            <el-button
              v-if="row.deliveryStatus === 'delivered'"
              type="info"
              size="mini"
              icon="el-icon-download"
              @click="handleDownload(row)"
            >
              下载
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
  </div>
</template>

<script>
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'
import waves from '@/directive/waves'
import i18nMixin from '@/mixins/i18n'

export default {
  name: 'CompletedOrders',
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
        customer: undefined,
        dateRange: null,
        sort: '-deliveryTime'
      },
      statistics: {
        completed: 0,
        totalQuantity: 0,
        totalAmount: '0.00'
      }
    }
  },
  created() {
    this.getList()
    this.getStatistics()
  },
  activated() {
    // 当组件被激活时（从其他页面返回），重新加载数据
    console.log('🔄 已完成订单页面被激活，重新加载数据...')
    this.getList()
    this.getStatistics()
  },
  methods: {
    getList() {
      this.listLoading = true
      console.log('📊 开始加载已完成订单列表...')

      // 从localStorage获取真实订单数据
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
      } else {
        console.log('⚠️ 未找到订单数据')
      }

      // 只保留已完成的订单
      orders = orders.filter(order => order.status === 'completed')

      console.log('✅ 筛选出', orders.length, '条已完成订单')

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
        deliveryStatus: order.deliveryStatus || 'delivered',
        deliveryEmail: order.deliveryEmail,
        createTime: order.createTime,
        deliveryTime: order.deliveryTime || order.createTime,
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
          const orderTime = order.deliveryTime || order.createTime
          return orderTime >= startTime && orderTime < endTime
        })
      }

      // 排序
      processedOrders.sort((a, b) => {
        if (this.listQuery.sort === '-deliveryTime') {
          return (b.deliveryTime || b.createTime) - (a.deliveryTime || a.createTime)
        } else if (this.listQuery.sort === '+deliveryTime') {
          return (a.deliveryTime || a.createTime) - (b.deliveryTime || b.createTime)
        }
        return 0
      })

      // 分页
      this.total = processedOrders.length
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit
      this.list = processedOrders.slice(start, end)

      console.log('✅ 已完成订单列表加载完成，显示', this.list.length, '条记录')

      setTimeout(() => {
        this.listLoading = false
      }, 300)
    },

    getStatistics() {
      // 从localStorage获取统计数据
      const savedOrders = localStorage.getItem('orderList')
      let orders = []

      if (savedOrders) {
        try {
          orders = JSON.parse(savedOrders)
        } catch (e) {
          console.error('解析订单数据失败:', e)
        }
      }

      const completed = orders.filter(o => o.status === 'completed')
      const totalQuantity = completed.reduce((sum, o) => sum + (o.quantity || 0), 0)
      const totalAmount = completed.reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0)

      this.statistics = {
        completed: completed.length,
        totalQuantity: totalQuantity,
        totalAmount: totalAmount.toFixed(2)
      }
    },

    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },

    refreshData() {
      console.log('🔄 手动刷新已完成订单...')
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

    handleDeliver(row) {
      // 跳转到发货页面
      console.log('🚀 跳转到发货页面，订单ID:', row.id)
      this.$router.push({
        path: `/order/delivery/${row.id}`
      })
    },

    handleDownload(row) {
      this.$message({
        type: 'success',
        message: `正在下载订单 ${row.orderNo} 的数据...`
      })
      // 这里可以实现实际的下载逻辑
      console.log('下载订单数据:', row)
    },

    exportData() {
      this.$message({
        type: 'info',
        message: '导出功能开发中...'
      })
      // 这里可以实现实际的导出逻辑
    },

    sortChange(data) {
      const { prop, order } = data
      if (prop === 'deliveryTime') {
        this.sortByDeliveryTime(order)
      }
    },

    sortByDeliveryTime(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+deliveryTime'
      } else {
        this.listQuery.sort = '-deliveryTime'
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

  &.completed-card {
    background: linear-gradient(135deg, #D4EDDA 0%, #E8F5E9 100%);
  }

  &.quantity-card {
    background: linear-gradient(135deg, #CCE5FF 0%, #E3F2FD 100%);
  }

  &.amount-card {
    background: linear-gradient(135deg, #FFF3CD 0%, #FFF8E1 100%);
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
