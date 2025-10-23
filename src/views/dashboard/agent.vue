<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1 class="welcome-title">{{ welcomeMessage }}</h1>
      <p class="welcome-subtitle">这里是您的个人工作台，查看客户信息和销售数据</p>
    </div>

    <!-- 代理统计卡片 -->
    <el-row :gutter="20" class="panel-group">
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-people">
            <svg-icon icon-class="peoples" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">{{ $t('dashboard.bindUsers') }}</div>
            <count-to :start-val="0" :end-val="agentStats.bindUsers" :duration="2600" class="card-panel-num" />
          </div>
        </div>
      </el-col>

      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-money">
            <svg-icon icon-class="money" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">{{ $t('dashboard.totalCommission') }}</div>
            <count-to :start-val="0" :end-val="agentStats.totalCommission" :duration="3000" class="card-panel-num" />
          </div>
        </div>
      </el-col>

      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-shopping">
            <svg-icon icon-class="shopping" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">{{ $t('dashboard.monthlyOrders') }}</div>
            <count-to :start-val="0" :end-val="agentStats.monthlyOrders" :duration="3200" class="card-panel-num" />
          </div>
        </div>
      </el-col>

      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-message">
            <svg-icon icon-class="message" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">{{ $t('dashboard.commissionRate') }}</div>
            <count-to :start-val="0" :end-val="agentStats.commissionRate" :duration="2800" class="card-panel-num" />
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 代理功能快捷入口 -->
    <el-row :gutter="20" style="margin-top: 30px;">
      <el-col :span="12">
        <el-card class="box-card action-card" shadow="hover">
          <div slot="header" class="card-header">
            <i class="el-icon-s-operation" />
            <span>客户操作</span>
          </div>
          <div class="action-buttons">
            <el-button class="action-btn" type="primary" icon="el-icon-view" @click="goToCustomers">
              <span class="btn-text">{{ $t('dashboard.viewCustomers') }}</span>
            </el-button>
            <el-button class="action-btn" type="success" icon="el-icon-shopping-cart-2" @click="goToOrders">
              <span class="btn-text">{{ $t('dashboard.viewOrders') }}</span>
            </el-button>
            <el-button class="action-btn" type="warning" icon="el-icon-message" @click="goToFeedback">
              <span class="btn-text">{{ $t('dashboard.viewFeedback') }}</span>
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
            <span>客户热门收藏</span>
            <span class="header-badge">一周内利润率Top5</span>
          </div>
          <div v-if="topFavorites.length > 0" class="top-favorites-list">
            <div v-for="(fav, index) in topFavorites" :key="fav.favoriteId" class="top-favorite-item">
              <div class="rank-badge" :class="`rank-${index + 1}`">
                {{ index + 1 }}
              </div>
              <div class="favorite-content">
                <div class="favorite-header">
                  <span class="favorite-country">{{ fav.country }}</span>
                  <span class="favorite-type">{{ fav.dataType }}</span>
                </div>
                <div class="favorite-meta">
                  <span class="customer-name">客户: {{ fav.customerName }}</span>
                  <span class="profit-margin">利润率: <strong>{{ fav.profitMargin }}%</strong></span>
                </div>
                <div class="favorite-price">
                  <span>售价: {{ fav.sellPrice }} U/条</span>
                  <span>成本: {{ fav.costPrice }} U/条</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-favorites">
            <i class="el-icon-data-line" style="font-size: 48px; color: #ddd;" />
            <p>暂无客户收藏数据</p>
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
  name: 'AgentDashboard',
  components: {
    CountTo
  },
  data() {
    return {
      welcomeMessage: this.$t('dashboard.agentWelcome'), // 默认欢迎信息
      agentStats: {
        bindUsers: 0,
        totalCommission: 0,
        monthlyOrders: 0,
        commissionRate: 0
      },
      topFavorites: [], // 客户热门收藏数据
      recentActivities: []
    }
  },
  created() {
    this.loadAgentStats()
  },
  methods: {
    async loadAgentStats() {
      try {
        // 从数据库获取当前用户信息
        const userInfo = await this.$store.dispatch('user/getInfo')

        if (userInfo && userInfo.type === 'agent') {
          // 设置个性化欢迎信息
          this.setWelcomeMessage(userInfo)
          await this.loadAgentData(userInfo.id)
        }
      } catch (error) {
        console.error('❌ 从数据库加载用户信息失败:', error)
        this.$message.error('加载用户信息失败，请重新登录')
      }
    },
    setWelcomeMessage(userData) {
      // 优先使用loginAccount（平台登录账号），其次使用agentName或username
      const displayName = userData.loginAccount || userData.agentName || userData.username || '代理'
      this.welcomeMessage = `欢迎，${displayName}代理！`
    },
    async loadAgentData(agentId) {
      try {
        // 从数据库获取代理数据
        const response = await request({
          url: `/api/agents/${agentId}`,
          method: 'GET'
        })
        const agent = response.data

        if (agent) {
          // 确保转换为数字类型,避免CountTo组件类型错误
          this.agentStats.commissionRate = parseFloat(agent.commission) || 0
          this.agentStats.totalCommission = parseFloat(agent.totalCommission) || 0
          this.agentStats.bindUsers = parseInt(agent.bindUsers) || 0
        }

        // 获取订单数据统计月度订单
        this.agentStats.monthlyOrders = Math.floor(Math.random() * 50) + 10 // 暂时使用模拟数据

        // 加载客户热门收藏数据
        await this.loadTopFavorites(agentId)
      } catch (error) {
        console.error('❌ 从数据库加载代理数据失败:', error)
        this.$message.error('加载代理数据失败')
      }
    },
    // 加载客户热门收藏数据（按一周内利润率排序）
    async loadTopFavorites(agentId) {
      try {
        const response = await request({
          url: `/api/favorites/agent/${agentId}/top-profit`,
          method: 'GET',
          params: { limit: 5 }
        })

        if (response.success && response.data) {
          this.topFavorites = response.data
        }
      } catch (error) {
        console.error('❗ 从数据库加载热门收藏失败:', error)
        this.topFavorites = []
      }
    },
    goToCustomers() {
      this.$router.push('/user/customer-list')
    },
    goToOrders() {
      this.$router.push('/order/list')
    },
    goToFeedback() {
      this.$router.push('/feedback/list')
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

      .icon-people {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      .icon-money {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }

      .icon-shopping {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }

      .icon-message {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      }
    }

    .icon-people {
      color: #667eea;
    }

    .icon-money {
      color: #f093fb;
    }

    .icon-shopping {
      color: #4facfe;
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

      .header-badge {
        margin-left: auto;
        font-size: 12px;
        color: #67c23a;
        background: #f0f9ff;
        padding: 2px 8px;
        border-radius: 10px;
        font-weight: normal;
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
}

.top-favorites-list {
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

  .top-favorite-item {
    display: flex;
    padding: 14px;
    margin-bottom: 12px;
    background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
    border-radius: 8px;
    border-left: 4px solid #409eff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;

    &:hover {
      transform: translateX(4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .rank-badge {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: #fff;
      margin-right: 12px;
      flex-shrink: 0;

      &.rank-1 {
        background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
        color: #8b6914;
      }

      &.rank-2 {
        background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
        color: #696969;
      }

      &.rank-3 {
        background: linear-gradient(135deg, #cd7f32 0%, #d4a574 100%);
        color: #5c3a1e;
      }

      &.rank-4, &.rank-5 {
        background: #909399;
      }
    }

    .favorite-content {
      flex: 1;

      .favorite-header {
        margin-bottom: 8px;

        .favorite-country {
          font-weight: bold;
          color: #303133;
          margin-right: 12px;
        }

        .favorite-type {
          font-size: 12px;
          color: #909399;
          background: #e9ecef;
          padding: 2px 8px;
          border-radius: 3px;
        }
      }

      .favorite-meta {
        display: flex;
        justify-content: space-between;
        margin-bottom: 6px;

        .customer-name {
          font-size: 12px;
          color: #606266;
        }

        .profit-margin {
          font-size: 12px;
          color: #67c23a;

          strong {
            font-size: 14px;
            margin-left: 4px;
          }
        }
      }

      .favorite-price {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: #909399;
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
}
</style>
