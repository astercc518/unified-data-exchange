<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1 class="welcome-title">{{ welcomeMessage }}</h1>
      <p class="welcome-subtitle">这是专属于您的个人工作台，查看账户信息和购买数据</p>
    </div>

    <!-- 客户统计卡片 -->
    <el-row :gutter="20" class="panel-group">
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-money">
            <svg-icon icon-class="money" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">{{ $t('dashboard.accountBalance') }}</div>
            <div class="card-panel-num">¥{{ customerStats.accountBalance }}</div>
          </div>
        </div>
      </el-col>

      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-shopping">
            <svg-icon icon-class="shopping" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">{{ $t('dashboard.totalOrders') }}</div>
            <count-to :start-val="0" :end-val="customerStats.totalOrders" :duration="2600" class="card-panel-num" />
          </div>
        </div>
      </el-col>

      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-data">
            <svg-icon icon-class="documentation" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">{{ $t('dashboard.totalData') }}</div>
            <count-to :start-val="0" :end-val="customerStats.totalData" :duration="3000" class="card-panel-num" />
          </div>
        </div>
      </el-col>

      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-message">
            <svg-icon icon-class="message" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">{{ $t('dashboard.feedbackCount') }}</div>
            <count-to :start-val="0" :end-val="customerStats.feedbackCount" :duration="2800" class="card-panel-num" />
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 客户功能快捷入口 -->
    <el-row :gutter="20" style="margin-top: 30px;">
      <el-col :span="12">
        <el-card class="box-card action-card" shadow="hover">
          <div slot="header" class="card-header">
            <i class="el-icon-s-operation" />
            <span>客户操作</span>
          </div>
          <div class="action-buttons">
            <el-button class="action-btn" type="primary" icon="el-icon-shopping-cart-2" @click="goToResource">
              <span class="btn-text">{{ $t('dashboard.buyData') }}</span>
            </el-button>
            <el-button class="action-btn" type="success" icon="el-icon-view" @click="goToOrders">
              <span class="btn-text">{{ $t('dashboard.viewOrders') }}</span>
            </el-button>
            <el-button class="action-btn" type="warning" icon="el-icon-message" @click="goToFeedback">
              <span class="btn-text">{{ $t('dashboard.submitFeedback') }}</span>
            </el-button>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="box-card data-processing-card" shadow="hover">
          <div slot="header" class="card-header">
            <i class="el-icon-files" />
            <span>数据处理</span>
            <span class="header-badge">快捷入口</span>
          </div>
          <div class="data-processing-content">
            <el-button class="processing-btn" type="success" icon="el-icon-magic-stick" @click="goToDataProcessing">
              <div class="btn-content">
                <span class="btn-title">一键清洗</span>
                <span class="btn-desc">自动校验、去重、去除异常</span>
              </div>
            </el-button>
            <el-divider />
            <div class="processing-functions">
              <el-button class="func-btn" type="text" icon="el-icon-plus" @click="goToDataProcessing">增加国码</el-button>
              <el-button class="func-btn" type="text" icon="el-icon-remove-outline" @click="goToDataProcessing">去除国码</el-button>
              <el-button class="func-btn" type="text" icon="el-icon-files" @click="goToDataProcessing">数据去重</el-button>
              <el-button class="func-btn" type="text" icon="el-icon-s-data" @click="goToDataProcessing">数据对比</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card class="box-card favorites-card" shadow="hover">
          <div slot="header" class="card-header">
            <i class="el-icon-star-on" />
            <span>我的收藏</span>
            <el-button style="margin-left: auto; padding: 3px 8px" type="text" @click="goToResource">更多</el-button>
          </div>
          <div v-if="favorites.length > 0" class="favorite-list">
            <div v-for="fav in favorites" :key="fav.id" class="favorite-item" @click="goToDataDetail(fav)">
              <div class="favorite-info">
                <span class="favorite-country">{{ fav.countryName }}</span>
                <span class="favorite-type">{{ fav.dataType }}</span>
              </div>
              <div class="favorite-meta">
                <span class="favorite-quantity">{{ formatNumber(fav.availableQuantity) }}条</span>
                <span class="favorite-price">{{ fav.sellPrice }} U/条</span>
              </div>
            </div>
          </div>
          <div v-else class="empty-favorites">
            <i class="el-icon-star-off" style="font-size: 48px; color: #ddd;" />
            <p>暂无收藏数据</p>
            <el-button type="primary" size="small" @click="goToResource">去收藏</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 删除服务状态 -->
  </div>
</template>

<script>
import CountTo from 'vue-count-to'
import request from '@/utils/request'

export default {
  name: 'CustomerDashboard',
  components: {
    CountTo
  },
  data() {
    return {
      welcomeMessage: this.$t('dashboard.customerWelcome'), // 默认欢迎信息
      customerStats: {
        accountBalance: '0.00000',
        totalOrders: 0,
        totalData: 0,
        feedbackCount: 0
      },
      favorites: [], // 收藏列表
      recentActivities: []
    }
  },
  created() {
    this.loadCustomerStats()
  },
  methods: {
    async loadCustomerStats() {
      try {
        // 从数据库获取当前用户信息
        const userInfo = await this.$store.dispatch('user/getInfo')

        if (userInfo && userInfo.type === 'customer') {
          // 设置个性化欢迎信息
          this.setWelcomeMessage(userInfo)
          await this.loadCustomerData(userInfo.id)
        }
      } catch (error) {
        console.error('❌ 从数据库加载用户信息失败:', error)
        this.$message.error('加载用户信息失败，请重新登录')
      }
    },
    setWelcomeMessage(userData) {
      // 优先使用loginAccount（平台登录账号），其次使用customerName或username
      const displayName = userData.loginAccount || userData.customerName || userData.username || '客户'
      this.welcomeMessage = `欢迎尊敬的${displayName}客户`
    },
    async loadCustomerData(customerId) {
      try {
        // 从数据库获取客户数据
        const response = await request({
          url: `/api/users/${customerId}`,
          method: 'GET'
        })
        const customer = response.data

        if (customer) {
          this.customerStats.accountBalance = parseFloat(customer.accountBalance || 0).toFixed(5)
        }

        // 加载实际的统计数据
        await this.loadRealStats(customerId)

        // 加载收藏列表
        await this.loadFavorites(customerId)

        // 加载最近活动记录
        await this.loadRecentActivities(customerId)
      } catch (error) {
        console.error('❌ 从数据库加载客户数据失败:', error)
        this.$message.error('加载客户数据失败')
      }
    },

    // 加载收藏列表
    async loadFavorites(customerId) {
      try {
        const response = await request({
          url: `/api/favorites/customer/${customerId}`,
          method: 'GET',
          params: { page: 1, limit: 5 }
        })

        if (response.success && response.data) {
          this.favorites = response.data
        }
      } catch (error) {
        console.error('❗ 从数据库加载收藏失败:', error)
        this.favorites = []
      }
    },

    // 加载真实的统计数据
    async loadRealStats(customerId) {
      // 加载订单数量
      await this.loadOrderStats(customerId)

      // 加载数据购买量
      await this.loadDataStats(customerId)

      // 加载反馈数量（暂时使用模拟数据）
      this.customerStats.feedbackCount = 0 // 待反馈功能实现后更新
    },

    // 加载订单统计
    async loadOrderStats(customerId) {
      try {
        const response = await request({
          url: '/api/orders',
          method: 'GET',
          params: {
            customerId: customerId,
            page: 1,
            limit: 1000
          }
        })
        const orders = response.data || []

        // 统计该客户的订单数量
        this.customerStats.totalOrders = orders.filter(order => order.customerId === customerId).length
      } catch (error) {
        console.error('❌ 从数据库加载订单统计失败:', error)
        this.customerStats.totalOrders = 0
      }
    },

    // 加载数据购买量统计
    async loadDataStats(customerId) {
      try {
        const response = await request({
          url: '/api/orders',
          method: 'GET',
          params: {
            customerId: customerId,
            page: 1,
            limit: 1000
          }
        })
        const orders = response.data || []

        // 统计该客户购买的数据总量
        const customerOrders = orders.filter(order => order.customerId === customerId)
        this.customerStats.totalData = customerOrders.reduce((total, order) => {
          return total + (order.quantity || 0)
        }, 0)
      } catch (error) {
        console.error('❌ 从数据库加载数据统计失败:', error)
        this.customerStats.totalData = 0
      }
    },

    // 加载最近活动记录
    async loadRecentActivities(customerId) {
      try {
        const activities = []

        // 从数据库获取订单记录
        const orderResponse = await request({
          url: '/api/orders',
          method: 'GET',
          params: {
            customerId: customerId,
            page: 1,
            limit: 100
          }
        })
        const orders = orderResponse.data || []

        const customerOrders = orders
          .filter(order => order.customerId === customerId)
          .sort((a, b) => b.createTime - a.createTime)
          .slice(0, 2) // 只取最近2条

        customerOrders.forEach(order => {
          activities.push({
            id: `order_${order.id}`,
            icon: 'el-icon-shopping-cart-2',
            color: '#409EFF',
            text: `购买${order.country}数据 ${this.formatNumber(order.quantity)}条`,
            time: this.formatTime(order.createTime)
          })
        })

        // 从数据库获取充值记录
        const rechargeResponse = await request({
          url: '/api/recharge-records',
          method: 'GET',
          params: {
            customerId: customerId,
            page: 1,
            limit: 100
          }
        })
        const records = rechargeResponse.data || []

        const customerRecords = records
          .filter(record => record.customerId === customerId && parseFloat(record.amount) > 0)
          .sort((a, b) => b.createTime - a.createTime)
          .slice(0, 2) // 只取最近2条

        customerRecords.forEach(record => {
          activities.push({
            id: `recharge_${record.id}`,
            icon: 'el-icon-wallet',
            color: '#67C23A',
            text: `账户充值 ${record.amount}U`,
            time: this.formatTime(record.createTime)
          })
        })

        // 按时间排序并只保留最近4条
        this.recentActivities = activities
          .sort((a, b) => {
            const timeA = this.parseTimeString(a.time)
            const timeB = this.parseTimeString(b.time)
            return timeB - timeA
          })
          .slice(0, 4)

        // 如果没有活动记录，显示默认提示
        if (this.recentActivities.length === 0) {
          this.recentActivities = [{
            id: 'no_activity',
            icon: 'el-icon-info',
            color: '#909399',
            text: '暂无活动记录',
            time: ''
          }]
        }
      } catch (error) {
        console.error('❌ 从数据库加载活动记录失败:', error)
        // 如果加载失败，显示默认提示
        this.recentActivities = [{
          id: 'no_activity',
          icon: 'el-icon-info',
          color: '#909399',
          text: '暂无活动记录',
          time: ''
        }]
      }
    },

    // 格式化时间
    formatTime(timestamp) {
      const now = Date.now()
      const diff = now - timestamp

      const minute = 60 * 1000
      const hour = minute * 60
      const day = hour * 24

      if (diff < minute) {
        return '刚刚'
      } else if (diff < hour) {
        return Math.floor(diff / minute) + '分钟前'
      } else if (diff < day) {
        return Math.floor(diff / hour) + '小时前'
      } else {
        return Math.floor(diff / day) + '天前'
      }
    },

    // 解析时间字符串（用于排序）
    parseTimeString(timeStr) {
      const now = Date.now()
      if (timeStr === '刚刚') return now
      if (timeStr.includes('分钟前')) {
        const minutes = parseInt(timeStr)
        return now - minutes * 60 * 1000
      }
      if (timeStr.includes('小时前')) {
        const hours = parseInt(timeStr)
        return now - hours * 60 * 60 * 1000
      }
      if (timeStr.includes('天前')) {
        const days = parseInt(timeStr)
        return now - days * 24 * 60 * 60 * 1000
      }
      return 0
    },

    // 格式化数字
    formatNumber(num) {
      return num.toLocaleString()
    },
    // 格式化数字
    formatNumber(num) {
      return num.toLocaleString()
    },
    // 跳转到数据详情
    goToDataDetail(fav) {
      if (fav.currentData && fav.currentData.status === 'available') {
        this.$router.push(`/resource/purchase/${fav.dataId}`)
      } else {
        this.$message.warning('该数据已下架或售罄')
      }
    },
    goToResource() {
      this.$router.push('/resource/center')
    },
    goToOrders() {
      this.$router.push('/order/list')
    },
    goToFeedback() {
      this.$router.push('/feedback/create')
    },
    goToDataProcessing() {
      this.$router.push('/data/processing')
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: calc(100vh - 84px);
}

.dashboard-header {
  text-align: center;
  margin-bottom: 32px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

  .welcome-title {
    font-size: 32px;
    font-weight: 600;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 12px;
  }

  .welcome-subtitle {
    font-size: 16px;
    color: #606266;
    opacity: 0.8;
  }
}

.panel-group {
  margin-bottom: 24px;

  .card-panel-col {
    margin-bottom: 20px;
  }

  .card-panel {
    height: 120px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px 0 rgba(0, 0, 0, 0.15);

      .card-panel-icon-wrapper {
        color: #fff;
      }

      .icon-money {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }

      .icon-shopping {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }

      .icon-data {
        background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
      }

      .icon-message {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      }
    }

    .icon-money {
      color: #f093fb;
    }

    .icon-shopping {
      color: #4facfe;
    }

    .icon-data {
      color: #fa709a;
    }

    .icon-message {
      color: #43e97b;
    }

    .card-panel-icon-wrapper {
      float: left;
      margin: 14px 0 0 14px;
      padding: 18px;
      transition: all 0.38s ease-out;
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.05);
    }

    .card-panel-icon {
      float: left;
      font-size: 48px;
    }

    .card-panel-description {
      float: right;
      font-weight: bold;
      margin: 26px;
      margin-left: 0px;

      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
      }

      .card-panel-num {
        font-size: 24px;
        font-weight: 600;
        color: #303133;
      }
    }
  }
}

.box-card {
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;

  &.action-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

    .card-header {
      color: #fff;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }
  }

  &.favorites-card {
    .card-header {
      display: flex;
      align-items: center;
      gap: 8px;

      i {
        font-size: 18px;
        color: #f5a623;
      }

      .el-button--text {
        color: #409eff;
        font-weight: 500;

        &:hover {
          color: #66b1ff;
        }
      }
    }
  }

  &.data-processing-card {
    background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);

    .card-header {
      color: #fff;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);

      i {
        font-size: 18px;
      }

      .header-badge {
        margin-left: auto;
        font-size: 12px;
        color: #67c23a;
        background: rgba(255, 255, 255, 0.9);
        padding: 2px 8px;
        border-radius: 10px;
        font-weight: normal;
      }
    }

    .data-processing-content {
      .processing-btn {
        width: 100%;
        height: 60px;
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: #fff;
        transition: all 0.3s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.02);
        }

        .btn-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;

          .btn-title {
            font-size: 16px;
            font-weight: bold;
          }

          .btn-desc {
            font-size: 12px;
            opacity: 0.9;
          }
        }
      }

      .el-divider {
        margin: 16px 0;
        background-color: rgba(255, 255, 255, 0.3);
      }

      .processing-functions {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;

        .func-btn {
          color: #fff;
          font-size: 14px;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          transition: all 0.3s ease;

          &:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateX(4px);
          }
        }
      }
    }
  }

  .card-header {
    font-size: 16px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;

    i {
      font-size: 18px;
    }
  }

  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .action-btn {
      width: 100%;
      height: 44px;
      font-size: 15px;
      border: none;
      transition: all 0.3s ease;

      &.el-button--primary {
        background: rgba(255, 255, 255, 0.2);
        color: #fff;

        &:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateX(4px);
        }
      }

      &.el-button--success {
        background: rgba(255, 255, 255, 0.2);
        color: #fff;

        &:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateX(4px);
        }
      }

      &.el-button--warning {
        background: rgba(255, 255, 255, 0.2);
        color: #fff;

        &:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateX(4px);
        }
      }

      .btn-text {
        margin-left: 8px;
      }
    }
  }

  .favorite-list {
    max-height: 420px;
    overflow-y: auto;
    padding: 4px;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: #dcdfe6;
      border-radius: 3px;
    }

    .favorite-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px;
      margin-bottom: 10px;
      background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      border-left: 4px solid #409eff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

      &:hover {
        background: linear-gradient(135deg, #e9ecef 0%, #ffffff 100%);
        transform: translateX(4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .favorite-info {
        display: flex;
        flex-direction: column;

        .favorite-country {
          font-weight: bold;
          color: #303133;
          margin-bottom: 4px;
        }

        .favorite-type {
          font-size: 12px;
          color: #909399;
        }
      }

      .favorite-meta {
        display: flex;
        flex-direction: column;
        align-items: flex-end;

        .favorite-quantity {
          font-size: 14px;
          color: #409eff;
          margin-bottom: 4px;
        }

        .favorite-price {
          font-size: 12px;
          color: #67c23a;
          font-weight: bold;
        }
      }
    }
  }

  .empty-favorites {
    text-align: center;
    padding: 50px 20px;

    i {
      color: #c0c4cc;
      margin-bottom: 16px;
    }

    p {
      color: #909399;
      margin: 16px 0;
      font-size: 14px;
    }

    .el-button {
      margin-top: 8px;
    }
  }
}
</style>
