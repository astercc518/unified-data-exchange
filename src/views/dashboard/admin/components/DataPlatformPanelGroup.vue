<template>
  <div>
    <!-- 主要统计数据 -->
    <el-row :gutter="20" class="panel-group">
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel" @click="handleClick('data')">
          <div class="card-panel-icon-wrapper icon-data">
            <svg-icon icon-class="database" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">
              {{ $t('dashboard.totalData') }}
            </div>
            <count-to
              :start-val="0"
              :end-val="statisticsData.totalData"
              :duration="2600"
              class="card-panel-num"
            />
            <span class="card-panel-unit">{{ $t('dashboard.dataItems') }}</span>
          </div>
        </div>
      </el-col>

      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel" @click="handleClick('agents')">
          <div class="card-panel-icon-wrapper icon-agents">
            <svg-icon icon-class="peoples" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">
              {{ $t('dashboard.totalAgents') }}
            </div>
            <count-to
              :start-val="0"
              :end-val="statisticsData.totalAgents"
              :duration="2800"
              class="card-panel-num"
            />
            <span class="card-panel-unit">{{ $t('dashboard.agents') }}</span>
          </div>
        </div>
      </el-col>

      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel" @click="handleClick('customers')">
          <div class="card-panel-icon-wrapper icon-customers">
            <svg-icon icon-class="user" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">
              {{ $t('dashboard.totalCustomers') }}
            </div>
            <count-to
              :start-val="0"
              :end-val="statisticsData.totalCustomers"
              :duration="3000"
              class="card-panel-num"
            />
            <span class="card-panel-unit">{{ $t('dashboard.customers') }}</span>
          </div>
        </div>
      </el-col>

      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel" @click="handleClick('server')">
          <div class="card-panel-icon-wrapper" :class="serverStatusClass">
            <svg-icon icon-class="server" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">
              {{ $t('dashboard.serverStatus') }}
            </div>
            <div class="card-panel-num server-status">
              {{ serverStatusText }}
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 销售额统计 -->
    <el-row :gutter="20" class="panel-group sales-panel">
      <el-col :xs="24" :sm="8" :lg="8" class="card-panel-col">
        <div class="card-panel sales-card">
          <div class="card-panel-icon-wrapper icon-today-sales">
            <svg-icon icon-class="money" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">
              {{ $t('dashboard.todaySales') }}
            </div>
            <count-to
              :start-val="0"
              :end-val="statisticsData.todaySales"
              :duration="2000"
              :decimals="2"
              class="card-panel-num"
            />
            <span class="card-panel-unit">{{ $t('dashboard.yuan') }}</span>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="8" :lg="8" class="card-panel-col">
        <div class="card-panel sales-card">
          <div class="card-panel-icon-wrapper icon-week-sales">
            <svg-icon icon-class="chart" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">
              {{ $t('dashboard.weekSales') }}
            </div>
            <count-to
              :start-val="0"
              :end-val="statisticsData.weekSales"
              :duration="2500"
              :decimals="2"
              class="card-panel-num"
            />
            <span class="card-panel-unit">{{ $t('dashboard.yuan') }}</span>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="8" :lg="8" class="card-panel-col">
        <div class="card-panel sales-card">
          <div class="card-panel-icon-wrapper icon-month-sales">
            <svg-icon icon-class="shopping" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">
              {{ $t('dashboard.monthSales') }}
            </div>
            <count-to
              :start-val="0"
              :end-val="statisticsData.monthSales"
              :duration="3000"
              :decimals="2"
              class="card-panel-num"
            />
            <span class="card-panel-unit">{{ $t('dashboard.yuan') }}</span>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 刷新按钮 -->
    <div class="refresh-section">
      <el-button
        type="primary"
        size="small"
        icon="el-icon-refresh"
        :loading="loading"
        @click="refreshData"
      >
        {{ $t('dashboard.refreshData') }}
      </el-button>
      <span class="last-update">
        {{ $t('dashboard.lastUpdate') }}: {{ lastUpdateTime }}
      </span>
    </div>
  </div>
</template>

<script>
import CountTo from 'vue-count-to'
import { getSystemStats } from '@/api/stats'
import request from '@/utils/request'

export default {
  name: 'DataPlatformPanelGroup',
  components: {
    CountTo
  },
  data() {
    return {
      loading: false,
      lastUpdateTime: '',
      statisticsData: {
        totalData: 0, // 总数据量
        totalAgents: 0, // 代理总数
        totalCustomers: 0, // 客户总数
        todaySales: 0, // 今日销售额
        weekSales: 0, // 本周销售额
        monthSales: 0 // 本月销售额
      },
      serverStatus: 'online' // online, offline, warning
    }
  },
  computed: {
    serverStatusText() {
      const statusMap = {
        online: this.$t('dashboard.online'),
        offline: this.$t('dashboard.offline'),
        warning: this.$t('dashboard.warning')
      }
      return statusMap[this.serverStatus] || this.$t('dashboard.offline')
    },
    serverStatusClass() {
      return {
        'icon-server-online': this.serverStatus === 'online',
        'icon-server-offline': this.serverStatus === 'offline',
        'icon-server-warning': this.serverStatus === 'warning'
      }
    }
  },
  created() {
    this.updateLastUpdateTime()
    this.loadStatisticsData()
    // 每30秒更新一次时间
    this.timer = setInterval(() => {
      this.updateLastUpdateTime()
    }, 30000)
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  methods: {
    handleClick(type) {
      // 点击卡片时触发相应的操作
      const routeMap = {
        data: '/data/library',
        agents: '/agent/list',
        customers: '/user/list',
        server: '#'
      }

      if (routeMap[type] && routeMap[type] !== '#') {
        this.$router.push(routeMap[type])
      }

      this.$emit('handleSetLineChartData', type)
    },
    async refreshData() {
      this.loading = true
      try {
        await this.loadStatisticsData()
        this.$message.success('数据刷新成功')
      } catch (error) {
        this.$message.error('数据刷新失败')
        console.error('刷新数据失败:', error)
      } finally {
        this.loading = false
      }
    },
    async loadStatisticsData() {
      try {
        console.log('📈 从数据库API加载统计数据...')

        // 直接从后端统计API获取数据
        const response = await getSystemStats()

        if (response.success && response.data) {
          const statsData = response.data

          console.log('✅ 统计数据加载成功:', statsData)

          // 计算总数据量
          this.statisticsData.totalData = statsData.counts.dataLibrary || 0

          // 代理总数
          this.statisticsData.totalAgents = statsData.counts.agents || 0

          // 客户总数（用户总数）
          this.statisticsData.totalCustomers = statsData.counts.users || 0

          // 销售额统计（从订单金额计算）
          const totalOrderAmount = statsData.amounts.totalOrderAmount || 0
          const totalRechargeAmount = statsData.amounts.totalRecharge || 0

          // 从订单列表获取详细数据以计算时间段销售额
          await this.calculateSalesData()

          // 服务器状态设为在线
          this.serverStatus = 'online'
          this.updateLastUpdateTime()

          console.log('✅ 首页统计数据更新完成')
        } else {
          throw new Error('统计数据格式错误')
        }
      } catch (error) {
        console.error('❌ 从数据库加载统计数据失败:', error)
        this.serverStatus = 'warning'
        this.$message.error('加载统计数据失败，请检查网络连接')
      }
    },

    // 计算销售额数据
    async calculateSalesData() {
      try {
        // 获取订单和充值记录
        const [orderResponse, rechargeResponse] = await Promise.all([
          request({ url: '/api/orders', method: 'GET', params: { page: 1, limit: 1000 }}),
          request({ url: '/api/recharge-records', method: 'GET', params: { page: 1, limit: 1000 }})
        ])

        // 直接使用 response.data，而不是 response.data.data
        const orderList = orderResponse.data || []
        const rechargeRecords = rechargeResponse.data || []

        console.log('📈 获取到订单数据:', orderList.length, '条')
        console.log('📋 获取到充值记录:', rechargeRecords.length, '条')

        // 计算时间范围
        const now = new Date()
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()

        // 从订单中计算销售额（已完成的订单）
        const completedOrders = orderList.filter(order => order.status === 'completed')

        this.statisticsData.todaySales = completedOrders
          .filter(order => new Date(order.created_at).getTime() >= todayStart)
          .reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0)

        this.statisticsData.weekSales = completedOrders
          .filter(order => new Date(order.created_at).getTime() >= weekStart)
          .reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0)

        this.statisticsData.monthSales = completedOrders
          .filter(order => new Date(order.created_at).getTime() >= monthStart)
          .reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0)

        // 从充值记录中添加销售额（成功的充值）
        const successRecharges = rechargeRecords.filter(record => record.status === 'success')

        this.statisticsData.todaySales += successRecharges
          .filter(record => new Date(record.created_at).getTime() >= todayStart)
          .reduce((sum, record) => sum + (parseFloat(record.amount) || 0), 0)

        this.statisticsData.weekSales += successRecharges
          .filter(record => new Date(record.created_at).getTime() >= weekStart)
          .reduce((sum, record) => sum + (parseFloat(record.amount) || 0), 0)

        this.statisticsData.monthSales += successRecharges
          .filter(record => new Date(record.created_at).getTime() >= monthStart)
          .reduce((sum, record) => sum + (parseFloat(record.amount) || 0), 0)
      } catch (error) {
        console.error('计算销售额失败:', error)
        // 如果计算失败，销售额保持为0
      }
    },

    // 处理统计数据
    async processStatisticsData(dataLibraryList, agentList, userList, orderList, rechargeRecords) {
      try {
        // 计算总数据量（所有数据库的记录数总和）
        this.statisticsData.totalData = dataLibraryList.reduce((sum, item) => {
          return sum + (parseInt(item.recordCount) || 0)
        }, 0)

        // 代理总数
        this.statisticsData.totalAgents = agentList.filter(agent => agent.status === 1).length

        // 客户总数（除去 admin 类型用户）
        this.statisticsData.totalCustomers = userList.filter(user =>
          user.status === 1 && user.userType !== 'admin'
        ).length

        // 计算销售额（从订单和充值记录中计算）
        const now = new Date()
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()

        // 从订单中计算销售额
        const completedOrders = orderList.filter(order => order.status === 'completed')

        this.statisticsData.todaySales = completedOrders
          .filter(order => order.createTime >= todayStart)
          .reduce((sum, order) => sum + (parseFloat(order.amount) || 0), 0)

        this.statisticsData.weekSales = completedOrders
          .filter(order => order.createTime >= weekStart)
          .reduce((sum, order) => sum + (parseFloat(order.amount) || 0), 0)

        this.statisticsData.monthSales = completedOrders
          .filter(order => order.createTime >= monthStart)
          .reduce((sum, order) => sum + (parseFloat(order.amount) || 0), 0)

        // 从充值记录中添加销售额
        const successRecharges = rechargeRecords.filter(record => record.status === 'success')

        this.statisticsData.todaySales += successRecharges
          .filter(record => record.createTime >= todayStart)
          .reduce((sum, record) => sum + (parseFloat(record.amount) || 0), 0)

        this.statisticsData.weekSales += successRecharges
          .filter(record => record.createTime >= weekStart)
          .reduce((sum, record) => sum + (parseFloat(record.amount) || 0), 0)

        this.statisticsData.monthSales += successRecharges
          .filter(record => record.createTime >= monthStart)
          .reduce((sum, record) => sum + (parseFloat(record.amount) || 0), 0)

        // 服务器状态检查
        try {
          const response = await fetch('/dev-api/health')
          this.serverStatus = response.ok ? 'online' : 'warning'
        } catch (error) {
          this.serverStatus = 'warning'
        }

        this.updateLastUpdateTime()
      } catch (error) {
        console.error('加载统计数据失败:', error)
        // 即使出错也要显示 0 而不是旧数据
        this.statisticsData = {
          totalData: 0,
          totalAgents: 0,
          totalCustomers: 0,
          todaySales: 0,
          weekSales: 0,
          monthSales: 0
        }
        this.serverStatus = 'offline'
        throw error
      }
    },
    updateLastUpdateTime() {
      const now = new Date()
      this.lastUpdateTime = now.toLocaleTimeString('zh-CN', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.panel-group {
  margin-top: 18px;

  .card-panel-col {
    margin-bottom: 20px;
  }

  .card-panel {
    height: 108px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
    border-color: rgba(0, 0, 0, .05);
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 4px 4px 50px rgba(0, 0, 0, .1);

      .card-panel-icon-wrapper {
        color: #fff;
      }

      .icon-data {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      .icon-agents {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }

      .icon-customers {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }

      .icon-server-online {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      }

      .icon-server-warning {
        background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
      }

      .icon-server-offline {
        background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
      }

      .icon-today-sales {
        background: linear-gradient(135deg, #d299c2 0%, #fef9d7 100%);
      }

      .icon-week-sales {
        background: linear-gradient(135deg, #89fffd 0%, #ef32d9 100%);
      }

      .icon-month-sales {
        background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
      }
    }

    .icon-data {
      color: #667eea;
    }

    .icon-agents {
      color: #f093fb;
    }

    .icon-customers {
      color: #4facfe;
    }

    .icon-server-online {
      color: #43e97b;
    }

    .icon-server-warning {
      color: #fa709a;
    }

    .icon-server-offline {
      color: #a8edea;
    }

    .icon-today-sales {
      color: #d299c2;
    }

    .icon-week-sales {
      color: #89fffd;
    }

    .icon-month-sales {
      color: #a8edea;
    }

    .card-panel-icon-wrapper {
      float: left;
      margin: 14px 0 0 14px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 8px;
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
        font-size: 20px;
        color: #1890ff;

        &.server-status {
          font-size: 16px;
          font-weight: 600;
        }
      }

      .card-panel-unit {
        font-size: 12px;
        color: #999;
        margin-left: 4px;
      }
    }
  }
}

.sales-panel {
  margin-top: 32px;

  .sales-card {
    background: linear-gradient(135deg, #ffecd1 0%, #fcb69f 100%);
    border: none;

    &:hover {
      background: linear-gradient(135deg, #fcb69f 0%, #ffecd1 100%);
    }
  }
}

.refresh-section {
  margin-top: 20px;
  text-align: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;

  .last-update {
    margin-left: 16px;
    color: #666;
    font-size: 12px;
  }
}

@media (max-width:550px) {
  .card-panel-description {
    display: none;
  }

  .card-panel-icon-wrapper {
    float: none !important;
    width: 100%;
    height: 100%;
    margin: 0 !important;

    .svg-icon {
      display: block;
      margin: 14px auto !important;
      float: none !important;
    }
  }
}
</style>
