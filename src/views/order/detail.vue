<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="clearfix">
        <span>{{ $t('order.detail') }}</span>
        <el-button
          style="float: right; padding: 3px 0"
          type="text"
          @click="goBack"
        >
          {{ $t('common.back') }}
        </el-button>
      </div>

      <div v-if="loading" v-loading="true" style="height: 400px;" />

      <div v-else-if="error" class="error-container">
        <el-alert
          :title="error"
          type="error"
          show-icon
          :closable="false"
        />
      </div>

      <div v-else-if="orderDetail">
        <el-row :gutter="20">
          <!-- 订单基本信息 -->
          <el-col :span="16">
            <el-card class="detail-card">
              <div slot="header">{{ $t('order.orderInfo') }}</div>
              <el-descriptions :column="2" border>
                <el-descriptions-item :label="$t('order.orderNo')">
                  <span class="order-no">{{ orderDetail.orderNo }}</span>
                </el-descriptions-item>
                <el-descriptions-item :label="$t('order.status')">
                  <el-tag :type="getStatusType(orderDetail.status)">
                    {{ getStatusText(orderDetail.status) }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item :label="$t('order.customer')">
                  {{ orderDetail.customerName }}
                </el-descriptions-item>
                <el-descriptions-item :label="$t('order.amount')">
                  <span class="amount-highlight">{{ orderDetail.amount }} U</span>
                </el-descriptions-item>
                <el-descriptions-item :label="$t('order.createTime')">
                  {{ orderDetail.createTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}
                </el-descriptions-item>
                <el-descriptions-item :label="$t('order.deliveryTime')">
                  {{ orderDetail.deliveryTime ? (orderDetail.deliveryTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}')) : '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="支付状态">
                  <el-tag type="success">已支付</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="发货状态">
                  <el-tag v-if="orderDetail.deliveryStatus === 'delivered'" type="success">
                    {{ $t('order.delivered') }}
                  </el-tag>
                  <el-tag v-else-if="orderDetail.deliveryStatus === 'processing'" type="warning">
                    处理中
                  </el-tag>
                  <el-tag v-else type="info">
                    未发货
                  </el-tag>
                </el-descriptions-item>
              </el-descriptions>
            </el-card>

            <!-- 数据信息 -->
            <el-card class="detail-card" style="margin-top: 20px;">
              <div slot="header">{{ $t('order.dataInfo') }}</div>
              <el-descriptions :column="2" border>
                <el-descriptions-item :label="$t('data.country')">
                  {{ orderDetail.dataInfo.country }}
                </el-descriptions-item>
                <el-descriptions-item :label="$t('data.validity')">
                  <el-tag :type="getValidityTagType(orderDetail.dataInfo.validity)">
                    {{ getValidityText(orderDetail.dataInfo.validity) }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item :label="$t('data.source')">
                  {{ orderDetail.dataInfo.source }}
                </el-descriptions-item>
                <el-descriptions-item :label="$t('order.quantity')">
                  {{ formatNumber(orderDetail.quantity) }} 条
                </el-descriptions-item>
                <el-descriptions-item label="单价">
                  {{ (orderDetail.amount / orderDetail.quantity).toFixed(4) }} U/条
                </el-descriptions-item>
                <el-descriptions-item label="总价">
                  {{ orderDetail.amount }} U
                </el-descriptions-item>
              </el-descriptions>
            </el-card>

            <!-- 运营商分布 -->
            <el-card class="detail-card" style="margin-top: 20px;">
              <div slot="header">运营商分布</div>
              <el-table
                :data="orderDetail.operators"
                border
                style="width: 100%"
              >
                <el-table-column
                  label="运营商"
                  prop="name"
                  width="150"
                />
                <el-table-column
                  label="数量"
                  prop="count"
                  width="120"
                  align="center"
                >
                  <template slot-scope="{row}">
                    {{ formatNumber(row.count) }}
                  </template>
                </el-table-column>
                <el-table-column
                  label="占比"
                  width="100"
                  align="center"
                >
                  <template slot-scope="{row}">
                    {{ (row.count / orderDetail.quantity * 100).toFixed(1) }}%
                  </template>
                </el-table-column>
                <el-table-column
                  label="金额(U)"
                  align="center"
                >
                  <template slot-scope="{row}">
                    {{ (row.count * orderDetail.amount / orderDetail.quantity).toFixed(2) }}
                  </template>
                </el-table-column>
              </el-table>
            </el-card>

            <!-- 发货信息 -->
            <el-card class="detail-card" style="margin-top: 20px;">
              <div slot="header">{{ $t('order.deliveryInfo') }}</div>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="发货邮箱">
                  {{ orderDetail.deliveryEmail }}
                </el-descriptions-item>
                <el-descriptions-item label="发货方式">
                  TXT文件自动发送
                </el-descriptions-item>
                <el-descriptions-item label="发货时间">
                  {{ orderDetail.deliveryTime ? (orderDetail.deliveryTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}')) : '未发货' }}
                </el-descriptions-item>
                <el-descriptions-item label="文件名">
                  {{ orderDetail.deliveryTime ? `${orderDetail.orderNo}_data.txt` : '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="备注" :span="2">
                  {{ orderDetail.remark || '无' }}
                </el-descriptions-item>
              </el-descriptions>
            </el-card>
          </el-col>

          <!-- 操作面板 -->
          <el-col :span="8">
            <el-card class="action-card">
              <div slot="header">订单操作</div>
              <div class="action-buttons">
                <el-button
                  v-if="orderDetail.status === 'pending'"
                  type="success"
                  size="medium"
                  style="width: 100%; margin-bottom: 10px;"
                  @click="handleProcess"
                >
                  处理订单
                </el-button>

                <el-button
                  v-if="orderDetail.status === 'processing' && orderDetail.deliveryStatus !== 'delivered'"
                  type="primary"
                  size="medium"
                  style="width: 100%; margin-bottom: 10px;"
                  @click="handleDeliver"
                >
                  发货
                </el-button>

                <el-button
                  v-if="['pending', 'processing'].includes(orderDetail.status)"
                  type="danger"
                  size="medium"
                  style="width: 100%; margin-bottom: 10px;"
                  @click="handleCancel"
                >
                  取消订单
                </el-button>

                <el-button
                  v-if="orderDetail.deliveryStatus === 'delivered'"
                  type="warning"
                  size="medium"
                  style="width: 100%; margin-bottom: 10px;"
                  @click="handleResend"
                >
                  重新发货
                </el-button>
              </div>
            </el-card>

            <!-- 订单进度 -->
            <el-card style="margin-top: 20px;">
              <div slot="header">订单进度</div>
              <el-steps
                :active="getStepActive()"
                direction="vertical"
                :process-status="getProcessStatus()"
              >
                <el-step title="订单创建" :description="orderDetail.createTime | parseTime('{y}-{m}-{d} {h}:{i}')">
                  <i slot="icon" class="el-icon-edit-outline" />
                </el-step>
                <el-step title="订单处理" :description="orderDetail.processTime ? (orderDetail.processTime | parseTime('{y}-{m}-{d} {h}:{i}')) : ''">
                  <i slot="icon" class="el-icon-loading" />
                </el-step>
                <el-step title="数据发货" :description="orderDetail.deliveryTime ? (orderDetail.deliveryTime | parseTime('{y}-{m}-{d} {h}:{i}')) : ''">
                  <i slot="icon" class="el-icon-truck" />
                </el-step>
                <el-step title="订单完成" :description="orderDetail.completeTime ? (orderDetail.completeTime | parseTime('{y}-{m}-{d} {h}:{i}')) : ''">
                  <i slot="icon" class="el-icon-circle-check" />
                </el-step>
              </el-steps>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <div v-else class="no-data">
        <el-empty description="未找到订单信息" />
      </div>
    </el-card>
  </div>
</template>

<script>
import { parseTime } from '@/utils'
import i18nMixin from '@/mixins/i18n'

export default {
  name: 'OrderDetail',
  filters: {
    parseTime
  },
  mixins: [i18nMixin],
  data() {
    return {
      orderDetail: null,
      loading: true,
      error: null
    }
  },
  created() {
    const id = this.$route.params && this.$route.params.id
    this.fetchOrderDetail(id)
  },
  methods: {
    fetchOrderDetail(id) {
      this.loading = true
      this.error = null

      // 从localStorage获取真实订单数据
      const savedOrders = localStorage.getItem('orderList')
      if (savedOrders) {
        try {
          const orders = JSON.parse(savedOrders)
          const order = orders.find(o => o.id === parseInt(id))

          if (order) {
            // 转换数据格式以适应详情页显示
            this.orderDetail = {
              id: order.id,
              orderNo: order.orderNo,
              customerName: order.customerName,
              customerId: order.customerId,
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
              processTime: order.processTime,
              deliveryTime: order.deliveryTime,
              completeTime: order.completeTime,
              remark: order.remark || ''
            }
            this.loading = false
          } else {
            this.error = '订单不存在'
            this.loading = false
            setTimeout(() => {
              this.$router.push('/order/list')
            }, 2000)
          }
        } catch (e) {
          console.error('解析订单数据失败:', e)
          this.error = '加载订单详情失败'
          this.loading = false
          setTimeout(() => {
            this.$router.push('/order/list')
          }, 2000)
        }
      } else {
        this.error = '暂无订单数据'
        this.loading = false
        setTimeout(() => {
          this.$router.push('/order/list')
        }, 2000)
      }
    },
    // 更新订单状态到localStorage
    updateOrderStatus(orderId, updates) {
      const savedOrders = localStorage.getItem('orderList')
      if (savedOrders) {
        try {
          const orders = JSON.parse(savedOrders)
          const orderIndex = orders.findIndex(o => o.id === orderId)

          if (orderIndex !== -1) {
            // 更新订单数据
            Object.assign(orders[orderIndex], updates)
            localStorage.setItem('orderList', JSON.stringify(orders))

            // 更新本地显示数据
            Object.assign(this.orderDetail, updates)
          }
        } catch (e) {
          console.error('更新订单状态失败:', e)
        }
      }
    },
    handleProcess() {
      this.$confirm('确认处理该订单？', this.$t('common.warning'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        const processTime = new Date().getTime()
        this.updateOrderStatus(this.orderDetail.id, {
          status: 'processing',
          processTime: processTime
        })
        this.$message.success('订单处理成功')
      }).catch(() => {})
    },
    handleDeliver() {
      this.$confirm(`确认向 ${this.orderDetail.deliveryEmail} 发货？`, '发货确认', {
        confirmButtonText: '确认发货',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const deliveryTime = new Date().getTime()
        this.updateOrderStatus(this.orderDetail.id, {
          deliveryStatus: 'delivered',
          status: 'completed',
          deliveryTime: deliveryTime,
          completeTime: deliveryTime
        })
        this.$message.success('发货成功！系统已自动发送数据到客户邮箱')
      }).catch(() => {})
    },
    handleCancel() {
      this.$confirm('确认取消该订单？', this.$t('common.warning'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        this.updateOrderStatus(this.orderDetail.id, {
          status: 'cancelled'
        })
        this.$message.success('订单取消成功')
      }).catch(() => {})
    },
    handleResend() {
      this.$confirm('确认重新发货到客户邮箱？', '重新发货', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.success('重新发货成功')
      }).catch(() => {})
    },
    getStepActive() {
      const statusMap = {
        pending: 1,
        processing: 2,
        completed: 4,
        cancelled: 1
      }
      return statusMap[this.orderDetail.status] || 0
    },
    getProcessStatus() {
      return this.orderDetail.status === 'cancelled' ? 'error' : 'process'
    },
    goBack() {
      this.$router.go(-1)
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
    getValidityTagType(validity) {
      const tagMap = {
        '3': 'danger',
        '30': 'warning',
        '30+': 'success'
      }
      return tagMap[validity]
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
.detail-card {
  margin-bottom: 20px;
}

.action-card {
  height: fit-content;

  .action-buttons {
    display: flex;
    flex-direction: column;
  }
}

.order-no {
  font-family: monospace;
  font-weight: bold;
  color: #409eff;
}

.amount-highlight {
  color: #f56c6c;
  font-weight: bold;
  font-size: 16px;
}

.el-steps {
  .el-step__icon {
    font-size: 14px;
  }
}

.error-container {
  margin: 20px 0;
}

.no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}
</style>
