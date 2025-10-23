<template>
  <div>
    <el-table
      v-loading="loading"
      :data="list"
      style="width: 100%;padding-top: 15px;"
      element-loading-text="加载中..."
    >
      <el-table-column :label="$t('dashboard.orderNo')" min-width="200">
        <template slot-scope="scope">
          {{ scope.row.order_no | orderNoFilter }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('dashboard.price')" width="195" align="center">
        <template slot-scope="scope">
          ¥{{ scope.row.price | toThousandFilter }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('dashboard.status')" width="100" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

    <!-- 空数据提示 -->
    <div v-if="!loading && list.length === 0" style="text-align: center; padding: 30px 0; color: #909399;">
      <i class="el-icon-document" style="font-size: 48px; margin-bottom: 10px;" />
      <p>暂无订单数据</p>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        completed: 'success',
        pending: 'warning',
        processing: 'primary',
        cancelled: 'info'
      }
      return statusMap[status] || 'info'
    },
    orderNoFilter(str) {
      return str ? str.substring(0, 30) : ''
    }
  },
  data() {
    return {
      list: [],
      loading: false
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      try {
        this.loading = true
        const response = await request({
          url: '/api/orders',
          method: 'get',
          params: {
            page: 1,
            limit: 8
          }
        })

        if (response && response.success && response.data) {
          // 转换数据格式以适配模板
          this.list = response.data.map(order => ({
            order_no: order.order_number,
            price: order.total_amount,
            status: order.status
          }))
        } else {
          this.list = []
        }
      } catch (error) {
        console.warn('获取订单列表失败:', error.message)
        // 容错处理：使用空数组，避免页面崩溃
        this.list = []
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
