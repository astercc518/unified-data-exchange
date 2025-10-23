<template>
  <div class="app-container">
    <!-- 用户余额卡片 -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="8">
        <el-card class="balance-card">
          <div class="balance-content">
            <div class="balance-number">{{ userBalance }}</div>
            <div class="balance-label">账户余额 (U)</div>
          </div>
          <i class="el-icon-wallet balance-icon" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="balance-card">
          <div class="balance-content">
            <div class="balance-number">{{ formatNumber(totalPurchased) }}</div>
            <div class="balance-label">已购买数据</div>
          </div>
          <i class="el-icon-data-line balance-icon" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="balance-card">
          <div class="balance-content">
            <div class="balance-number">{{ totalSpent }}</div>
            <div class="balance-label">累计消费 (U)</div>
          </div>
          <i class="el-icon-money balance-icon" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 订阅中心说明 -->
    <el-alert
      title="💡 订阅中心"
      type="info"
      :closable="false"
      style="margin-bottom: 20px;"
    >
      <template slot>
        智能推荐您感兴趣的数据：🟢 基于购买历史推荐 | 🟡 您的收藏数据 | 🔵 双重推荐
      </template>
    </el-alert>

    <!-- 订阅数据列表 -->
    <el-card>
      <div slot="header" class="clearfix">
        <i class="el-icon-star-on" style="color: #f39c12; margin-right: 5px;" />
        <span>为您推荐</span>
        <el-button
          style="float: right;"
          type="text"
          icon="el-icon-refresh"
          @click="refreshData"
        >
          刷新
        </el-button>
      </div>

      <div v-if="!isCustomer" class="subscription-notice">
        <el-alert
          title="订阅中心仅对客户开放"
          type="warning"
          :closable="false"
          show-icon
        />
      </div>

      <div v-else>
        <!-- 订阅数据表格 -->
        <el-table
          :key="tableKey"
          v-loading="subscriptionLoading"
          :data="subscriptionList"
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
            label="推荐来源"
            width="120"
            align="center"
          >
            <template slot-scope="{row}">
              <el-tag v-if="row.subscriptionSource === 'favorite'" type="warning" size="small">
                🟡 收藏
              </el-tag>
              <el-tag v-else-if="row.subscriptionSource === 'purchased'" type="success" size="small">
                🟢 已购
              </el-tag>
              <el-tag v-else type="primary" size="small">
                🔵 收藏+已购
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('data.country')"
            prop="country_name"
            width="120"
          />
          <el-table-column
            label="数据类型"
            prop="data_type"
            width="100"
          />
          <el-table-column
            :label="$t('data.validity')"
            width="120"
            align="center"
          >
            <template slot-scope="{row}">
              <el-tag :type="getValidityTagType(row.validity_name)">
                {{ row.validity_name || getValidityText(row.validity) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('data.source')"
            prop="source"
            min-width="150"
          />
          <el-table-column
            :label="$t('data.quantity')"
            prop="available_quantity"
            width="120"
            align="center"
          >
            <template slot-scope="{row}">
              {{ formatNumber(row.available_quantity) }}
            </template>
          </el-table-column>
          <el-table-column
            label="运营商分布"
            min-width="200"
          >
            <template slot-scope="{row}">
              <div class="operator-distribution">
                <div v-for="operator in parseOperators(row.operators)" :key="operator.name" class="operator-item">
                  <span class="operator-name">{{ operator.name }}:</span>
                  <span class="operator-count">{{ formatNumber(operator.count || operator.quantity) }}</span>
                  <span class="operator-percent">({{ ((operator.count || operator.quantity) / row.available_quantity * 100).toFixed(1) }}%)</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('data.sellPrice')"
            width="140"
            align="center"
          >
            <template slot-scope="{row}">
              <div class="price-info">
                <span class="current-price">{{ formatPrice(parseFloat(row.sell_price) * customerSalePriceRate) }} U/条</span>
              </div>
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
                :disabled="userBalance <= 0"
                @click="handlePurchase(row)"
              >
                购买
              </el-button>
              <el-button
                :type="row.isFavorited ? 'warning' : 'info'"
                size="mini"
                :icon="row.isFavorited ? 'el-icon-star-on' : 'el-icon-star-off'"
                @click="handleFavorite(row)"
              >
                {{ row.isFavorited ? '取消' : '收藏' }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <pagination
          v-show="subscriptionTotal>0"
          :total="subscriptionTotal"
          :page.sync="subscriptionQuery.page"
          :limit.sync="subscriptionQuery.limit"
          @pagination="getSubscriptionList"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import waves from '@/directive/waves'
import i18nMixin from '@/mixins/i18n'
import request from '@/utils/request'
import {
  getValidityTagType,
  formatPrice
} from '@/utils/dynamicPricing'

export default {
  name: 'SubscriptionCenter',
  components: { Pagination },
  directives: { waves },
  mixins: [i18nMixin],
  data() {
    return {
      tableKey: 0,
      subscriptionList: [],
      subscriptionTotal: 0,
      subscriptionLoading: false,
      subscriptionQuery: {
        page: 1,
        limit: 20
      },
      userBalance: 0,
      totalPurchased: 0,
      totalSpent: 0,
      customerSalePriceRate: 1,
      customerId: null,
      favoriteIds: new Set()
    }
  },
  computed: {
    isCustomer() {
      return this.$store.getters.roles && this.$store.getters.roles.includes('customer')
    }
  },
  created() {
    this.loadCustomerInfo()
    this.loadAccountStats()
    this.getSubscriptionList()
  },
  activated() {
    console.log('🔄 订阅中心页面被激活，重新加载数据...')
    this.loadAccountStats()
    this.getSubscriptionList()
  },
  methods: {
    // 获取订阅中心数据
    async getSubscriptionList() {
      if (!this.customerId) {
        console.warn('未找到客户ID，无法加载订阅数据')
        return
      }

      this.subscriptionLoading = true
      console.log('🔄 开始加载订阅中心数据...')

      try {
        const response = await request({
          method: 'GET',
          url: `/api/data-library/subscription/${this.customerId}`,
          params: {
            page: this.subscriptionQuery.page,
            limit: this.subscriptionQuery.limit
          }
        })

        if (response.success) {
          this.subscriptionList = response.data || []
          this.subscriptionTotal = response.total || 0

          console.log('✅ 订阅中心数据加载成功:', this.subscriptionList.length, '条')

          // 更新收藏状态
          this.subscriptionList.forEach(item => {
            if (item.isFavorited) {
              this.favoriteIds.add(item.id)
            }
          })

          if (this.subscriptionList.length === 0) {
            this.$message({
              type: 'info',
              message: '暂无订阅数据，请先购买数据或添加收藏',
              duration: 3000
            })
          }
        } else {
          console.error('订阅数据加载失败:', response.message)
          this.$message.error(response.message || '加载订阅数据失败')
        }
      } catch (error) {
        console.error('获取订阅数据失败:', error)
        this.$message.error('获取订阅数据失败：' + (error.message || '未知错误'))
      } finally {
        this.subscriptionLoading = false
      }
    },

    // 加载客户信息
    async loadCustomerInfo() {
      try {
        const userInfo = await this.$store.dispatch('user/getInfo')

        if (userInfo && userInfo.type === 'customer') {
          this.customerId = userInfo.id

          const response = await request({
            url: `/api/users/${userInfo.id}`,
            method: 'GET'
          })

          if (response.data) {
            this.customerSalePriceRate = response.data.salePriceRate || 1
            this.userBalance = parseFloat(response.data.accountBalance || 0)
          }

          await this.loadFavorites()
        }
      } catch (error) {
        console.error('加载客户信息失败:', error)
      }
    },

    // 加载收藏列表
    async loadFavorites() {
      if (!this.customerId) return

      try {
        const response = await request({
          url: `/api/favorites/customer/${this.customerId}`,
          method: 'GET',
          params: { page: 1, limit: 1000 }
        })

        if (response.success && response.data) {
          this.favoriteIds = new Set(response.data.map(fav => fav.dataId))
        }
      } catch (error) {
        console.error('加载收藏列表失败:', error)
      }
    },

    // 加载账户统计信息
    // 加载账户统计信息
    async loadAccountStats() {
      console.log('📊 开始加载账户统计信息...')

      try {
        // 获取当前用户信息
        const userInfo = this.$store.getters.userInfo
        if (!userInfo) {
          console.log('⚠️ 未找到当前用户信息')
          return
        }

        const userType = userInfo.type || 'customer'
        const userId = userInfo.id

        console.log(`👤 当前用户: ${userType} (ID: ${userId})`)

        // 调用后端API获取统计数据
        const response = await request({
          method: 'GET',
          url: `/api/stats/resource-center/${userType}/${userId}`
        })

        if (response.success && response.data) {
          this.userBalance = parseFloat(response.data.totalBalance || 0)
          this.totalPurchased = parseInt(response.data.totalPurchased || 0)
          this.totalSpent = parseFloat(response.data.totalSpent || 0)

          console.log('✅ 统计数据加载成功:')
          console.log(`  - 账户余额: ${this.userBalance} U`)
          console.log(`  - 已购买数据: ${this.totalPurchased.toLocaleString()} 条`)
          console.log(`  - 累计消费: ${this.totalSpent} U`)
        } else {
          console.warn('🔄 API返回失败，使用localStorage备用方案')
          this.loadAccountStatsFromLocalStorage()
        }
      } catch (error) {
        console.error('❌ 加载统计数据失败:', error)
        console.log('🔄 使用localStorage备用方案')
        this.loadAccountStatsFromLocalStorage()
      }
    },

    // 从localStorage加载统计数据（备用方案）
    loadAccountStatsFromLocalStorage() {
      console.log('📱 使用localStorage加载统计数据...')

      const currentUser = localStorage.getItem('currentUser')
      if (!currentUser) {
        console.log('⚠️ 未找到当前用户信息')
        return
      }

      try {
        const userData = JSON.parse(currentUser)
        const userType = userData.type

        const savedUsers = localStorage.getItem('userList')
        const savedOrders = localStorage.getItem('orderList')

        if (userType === 'customer') {
          // 客户：显示本客户的信息
          if (savedUsers) {
            const users = JSON.parse(savedUsers)
            const customer = users.find(u => u.id === userData.id)
            if (customer) {
              this.userBalance = parseFloat(customer.accountBalance || 0)
            }
          }

          if (savedOrders) {
            const orders = JSON.parse(savedOrders)
            const customerOrders = orders.filter(order =>
              order.customerId === userData.id
            )

            this.totalPurchased = customerOrders.reduce((sum, order) =>
              sum + parseInt(order.quantity || 0), 0
            )
            this.totalSpent = customerOrders.reduce((sum, order) =>
              sum + parseFloat(order.totalAmount || 0), 0
            ).toFixed(2)
          }
        }

        console.log('✅ localStorage统计数据加载成功')
        console.log(`  - 账户余额: ${this.userBalance} U`)
        console.log(`  - 已购买数据: ${this.totalPurchased.toLocaleString()} 条`)
        console.log(`  - 累计消费: ${this.totalSpent} U`)
      } catch (error) {
        console.error('❌ localStorage加载统计数据失败:', error)
      }
    },

    // 处理收藏/取消收藏
    async handleFavorite(row) {
      if (!this.customerId) {
        this.$message.error('请先登录')
        return
      }

      try {
        if (row.isFavorited) {
          await request({
            url: `/api/favorites/by-data/${this.customerId}/${row.id}`,
            method: 'DELETE'
          })

          this.favoriteIds.delete(row.id)
          this.$set(row, 'isFavorited', false)
          this.$message.success('取消收藏成功')
        } else {
          await request({
            url: '/api/favorites',
            method: 'POST',
            data: {
              customer_id: this.customerId,
              data_id: row.id
            }
          })

          this.favoriteIds.add(row.id)
          this.$set(row, 'isFavorited', true)
          this.$message.success('收藏成功')
        }
      } catch (error) {
        console.error('收藏操作失败:', error)
        const msg = error.response?.data?.message || error.message || '操作失败'
        this.$message.error(msg)
      }
    },

    // 购买数据
    handlePurchase(row) {
      if (this.userBalance <= 0) {
        this.$message.error(this.$t('resource.insufficientBalance'))
        return
      }
      this.$router.push(`/resource/purchase/${row.id}`)
    },

    // 刷新数据
    refreshData() {
      console.log('🔄 手动刷新订阅数据...')
      this.$message({
        type: 'info',
        message: '正在刷新数据...',
        duration: 1000
      })
      this.tableKey = this.tableKey + 1
      this.getSubscriptionList()
    },

    // 解析运营商数据
    parseOperators(operators) {
      if (!operators) return []
      if (typeof operators === 'string') {
        try {
          return JSON.parse(operators)
        } catch (e) {
          console.error('解析运营商数据失败:', e)
          return []
        }
      }
      return operators
    },

    // 辅助方法
    formatNumber(num) {
      return num ? num.toLocaleString() : '0'
    },

    getValidityTagType(validity) {
      return getValidityTagType(validity)
    },

    formatPrice(price) {
      return formatPrice(price)
    },

    getValidityText(validity) {
      switch (validity) {
        case '3':
          return '3天内'
        case '30':
          return '30天内'
        case '30+':
          return '30天以上'
        default:
          return validity || '未知'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.balance-card {
  position: relative;
  overflow: hidden;

  .balance-content {
    .balance-number {
      font-size: 24px;
      font-weight: bold;
      color: #409eff;
      margin-bottom: 5px;
    }

    .balance-label {
      font-size: 14px;
      color: #606266;
    }
  }

  .balance-icon {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 40px;
    color: #ddd;
  }
}

.operator-distribution {
  .operator-item {
    margin-bottom: 5px;

    .operator-name {
      font-weight: bold;
      margin-right: 5px;
    }

    .operator-count {
      color: #409eff;
      margin-right: 5px;
    }

    .operator-percent {
      color: #909399;
      font-size: 12px;
    }
  }
}

.price-info {
  .current-price {
    color: #f56c6c;
    font-weight: bold;
    font-size: 14px;
  }
}

.subscription-notice {
  padding: 20px;
  text-align: center;
}
</style>
