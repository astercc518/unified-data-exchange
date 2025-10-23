<template>
  <div class="app-container">
    <el-page-header :content="'订单发货 - ' + (orderInfo.orderNo || '')" @back="goBack" />

    <el-card v-loading="loading" style="margin-top: 20px;">
      <!-- 数据基本信息 -->
      <div class="section-title">
        <i class="el-icon-data-line" />
        数据基本信息
      </div>
      <el-descriptions :column="2" border class="info-section">
        <el-descriptions-item label="订单号">
          <span class="order-no">{{ orderInfo.orderNo }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <el-tag type="success">已完成</el-tag>
          <el-tag type="warning" style="margin-left: 10px;">待发货</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="数据国家">
          {{ orderInfo.country }}
        </el-descriptions-item>
        <el-descriptions-item label="数据时效">
          {{ getValidityText(orderInfo.validity) }}
        </el-descriptions-item>
        <el-descriptions-item label="数据来源">
          {{ orderInfo.source }}
        </el-descriptions-item>
        <el-descriptions-item label="数据数量">
          <span class="highlight-number">{{ formatNumber(orderInfo.quantity) }} 条</span>
        </el-descriptions-item>
        <el-descriptions-item label="运营商分布" :span="2">
          <div v-for="operator in orderInfo.operators" :key="operator.name" class="operator-item">
            <el-tag size="small" type="info">{{ operator.name }}</el-tag>
            <span class="operator-count">{{ formatNumber(operator.count) }} 条</span>
          </div>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 客户基本信息 -->
      <div class="section-title">
        <i class="el-icon-user" />
        客户基本信息
      </div>
      <el-descriptions :column="2" border class="info-section">
        <el-descriptions-item label="客户名称">
          {{ orderInfo.customerName }}
        </el-descriptions-item>
        <el-descriptions-item label="下单时间">
          {{ orderInfo.createTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}
        </el-descriptions-item>
        <el-descriptions-item label="订单金额">
          <span class="highlight-amount">{{ orderInfo.totalAmount }} U</span>
        </el-descriptions-item>
        <el-descriptions-item label="审核通过时间">
          {{ orderInfo.approveTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 发货方式 -->
      <div class="section-title">
        <i class="el-icon-message" />
        选择发货方式
      </div>
      <el-form ref="deliveryForm" :model="deliveryForm" :rules="deliveryRules" label-width="120px" class="delivery-form">
        <el-form-item label="发货方式" prop="deliveryMethod">
          <el-radio-group v-model="deliveryForm.deliveryMethod">
            <el-radio label="email">
              <i class="el-icon-message" /> 邮箱发货
            </el-radio>
            <el-radio label="tgbot">
              <i class="el-icon-chat-dot-round" /> TGbot 发货
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 邮箱发货 -->
        <el-form-item v-if="deliveryForm.deliveryMethod === 'email'" label="接收邮箱" prop="deliveryEmail">
          <el-input
            v-model="deliveryForm.deliveryEmail"
            placeholder="请输入接收邮箱地址"
            style="width: 400px;"
          >
            <template slot="prepend">
              <i class="el-icon-message" />
            </template>
          </el-input>
          <div class="form-tip">
            <i class="el-icon-info" /> 系统将自动将数据文件发送到此邮箱
          </div>
        </el-form-item>

        <!-- TGbot发货 -->
        <el-form-item v-if="deliveryForm.deliveryMethod === 'tgbot'" label="Chat ID" prop="chatId">
          <el-input
            v-model="deliveryForm.chatId"
            placeholder="请输入您的Telegram Chat ID"
            style="width: 400px;"
          >
            <template slot="prepend">
              <i class="el-icon-chat-dot-round" />
            </template>
          </el-input>
          <div class="form-tip">
            <i class="el-icon-info" /> 向系统TGBot发送任意消息即可获取Chat ID
          </div>
        </el-form-item>

        <el-form-item label="备注信息">
          <el-input
            v-model="deliveryForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入发货备注（选填）"
            style="width: 400px;"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" size="medium" :loading="submitting" @click="submitDelivery">
            <i class="el-icon-s-promotion" /> 确认发货
          </el-button>
          <el-button size="medium" @click="goBack">
            <i class="el-icon-back" /> 返回
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { parseTime } from '@/utils'
import request from '@/utils/request'

export default {
  name: 'OrderDelivery',
  filters: {
    parseTime
  },
  data() {
    // 邮箱验证规则
    const validateEmail = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入接收邮箱'))
      } else if (!/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(value)) {
        callback(new Error('请输入正确的邮箱格式'))
      } else {
        callback()
      }
    }

    // Chat ID验证规则
    const validateChatId = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入Chat ID'))
      } else {
        callback()
      }
    }

    return {
      loading: false,
      submitting: false,
      orderId: null,
      orderInfo: {
        orderNo: '',
        country: '',
        validity: '',
        source: '',
        quantity: 0,
        operators: [],
        customerName: '',
        createTime: null,
        totalAmount: '0.00',
        approveTime: null
      },
      deliveryForm: {
        deliveryMethod: 'email',
        deliveryEmail: '',
        chatId: '',
        remark: ''
      },
      deliveryRules: {
        deliveryMethod: [
          { required: true, message: '请选择发货方式', trigger: 'change' }
        ],
        deliveryEmail: [
          { required: true, validator: validateEmail, trigger: 'blur' }
        ],
        chatId: [
          { required: true, validator: validateChatId, trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.orderId = parseInt(this.$route.params.id)
    this.loadOrderInfo()
  },
  methods: {
    async loadOrderInfo() {
      this.loading = true

      try {
        const response = await request({
          url: `/api/orders/${this.orderId}`,
          method: 'get'
        })

        if (response.success && response.data) {
          const order = response.data
          this.orderInfo = {
            orderNo: order.order_number,
            country: order.country_name,
            validity: order.validity,
            source: order.data_source || '',
            quantity: order.quantity,
            operators: order.operators || [],
            customerName: order.customer_name,
            createTime: order.create_time,
            totalAmount: order.total_amount,
            approveTime: order.update_time
          }

          // 如果订单已绑定邮箱，自动填充
          if (order.delivery_address && order.delivery_method === 'email') {
            this.deliveryForm.deliveryEmail = order.delivery_address
          }
        }
      } catch (error) {
        this.$message.error('加载订单信息失败')
      } finally {
        this.loading = false
      }
    },

    submitDelivery() {
      this.$refs.deliveryForm.validate(valid => {
        if (!valid) {
          return false
        }

        this.$confirm('确认发货？数据将发送到指定地址', '发货确认', {
          confirmButtonText: '确认发货',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.doDelivery()
        }).catch(() => {})
      })
    },

    async doDelivery() {
      this.submitting = true

      try {
        const deliveryData = {
          delivery_method: this.deliveryForm.deliveryMethod,
          delivery_address: this.deliveryForm.deliveryMethod === 'email'
            ? this.deliveryForm.deliveryEmail
            : this.deliveryForm.chatId
        }

        const response = await request({
          url: `/api/orders/${this.orderId}/customer-deliver`,
          method: 'post',
          data: deliveryData
        })

        if (response.success) {
          this.$message({
            type: 'success',
            message: '发货成功！数据已发送到指定地址',
            duration: 3000
          })

          setTimeout(() => {
            this.$router.back()
          }, 1500)
        }
      } catch (error) {
        this.$message.error(error.message || '发货失败，请稍后重试')
      } finally {
        this.submitting = false
      }
    },

    goBack() {
      this.$router.back()
    },

    formatNumber(num) {
      return num ? num.toLocaleString() : '0'
    },

    getValidityText(validity) {
      const validityMap = {
        'within_3_days': '3天内',
        'within_30_days': '30天内',
        'over_30_days': '30天以上',
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
.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin: 30px 0 15px 0;
  padding-left: 10px;
  border-left: 4px solid #409eff;

  i {
    margin-right: 8px;
    color: #409eff;
  }

  &:first-child {
    margin-top: 0;
  }
}

.info-section {
  margin-bottom: 20px;
}

.order-no {
  font-weight: bold;
  color: #409eff;
  font-size: 14px;
}

.highlight-number {
  font-weight: bold;
  color: #67c23a;
  font-size: 16px;
}

.highlight-amount {
  font-weight: bold;
  color: #f56c6c;
  font-size: 18px;
}

.operator-item {
  display: inline-block;
  margin-right: 20px;
  margin-bottom: 5px;

  .operator-count {
    margin-left: 8px;
    color: #409eff;
    font-weight: bold;
  }
}

.delivery-form {
  margin-top: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;

  .form-tip {
    margin-top: 5px;
    font-size: 12px;
    color: #909399;

    i {
      margin-right: 5px;
    }
  }
}

::v-deep .el-radio {
  margin-right: 30px;
  font-size: 14px;

  i {
    margin-right: 5px;
  }
}
</style>
