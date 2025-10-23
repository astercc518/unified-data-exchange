<template>
  <div class="sms-statistics-container">
    <!-- 时间筛选 -->
    <el-card class="filter-card">
      <el-form :inline="true" class="filter-form">
        <el-form-item label="统计周期">
          <el-radio-group v-model="timePeriod" @change="handlePeriodChange">
            <el-radio-button label="today">今日</el-radio-button>
            <el-radio-button label="week">本周</el-radio-button>
            <el-radio-button label="month">本月</el-radio-button>
            <el-radio-button label="custom">自定义</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="timePeriod === 'custom'" label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            @change="getStatistics"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" icon="el-icon-refresh" @click="getStatistics">
            刷新数据
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 概览卡片 -->
    <el-row :gutter="20" class="overview-cards">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
            <i class="el-icon-s-promotion" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.total_sent || 0 }}</div>
            <div class="stat-label">总发送量</div>
            <div class="stat-trend">
              <span v-if="statistics.sent_trend > 0" style="color: #67C23A">
                <i class="el-icon-top" />{{ statistics.sent_trend }}%
              </span>
              <span v-else-if="statistics.sent_trend < 0" style="color: #F56C6C">
                <i class="el-icon-bottom" />{{ Math.abs(statistics.sent_trend) }}%
              </span>
              <span v-else style="color: #909399">
                <i class="el-icon-minus" />0%
              </span>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
            <i class="el-icon-success" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.total_success || 0 }}</div>
            <div class="stat-label">成功数量</div>
            <div class="stat-extra">
              成功率: <strong>{{ successRate }}%</strong>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
            <i class="el-icon-coin" />
          </div>
          <div class="stat-content">
            <div class="stat-value">${{ totalCost }}</div>
            <div class="stat-label">总费用</div>
            <div class="stat-extra">
              平均单价: ${{ avgCost }}
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%)">
            <i class="el-icon-document" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.total_tasks || 0 }}</div>
            <div class="stat-label">任务总数</div>
            <div class="stat-extra">
              平均每任务: {{ avgPerTask }}条
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 按国家统计 -->
    <el-row :gutter="20">
      <el-col :xs="24" :md="12">
        <el-card class="chart-card">
          <div slot="header">
            <span class="card-title">按国家统计</span>
          </div>
          <el-table
            :data="countryStats"
            border
            max-height="400"
            :default-sort="{prop: 'total_sent', order: 'descending'}"
          >
            <el-table-column prop="country" label="国家" width="100" align="center" />
            <el-table-column prop="total_sent" label="发送量" sortable align="center" />
            <el-table-column prop="total_success" label="成功" sortable align="center">
              <template slot-scope="scope">
                <span style="color: #67C23A">{{ scope.row.total_success }}</span>
              </template>
            </el-table-column>
            <el-table-column label="成功率" align="center">
              <template slot-scope="scope">
                <el-tag
                  :type="getSuccessRateType(calculateRate(scope.row.total_success, scope.row.total_sent))"
                  size="small"
                >
                  {{ calculateRate(scope.row.total_success, scope.row.total_sent) }}%
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="费用($)" align="center">
              <template slot-scope="scope">
                ${{ parseFloat(scope.row.total_cost || 0).toFixed(2) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="12">
        <el-card class="chart-card">
          <div slot="header">
            <span class="card-title">费用分布</span>
          </div>
          <div class="cost-breakdown">
            <div
              v-for="item in countryStats.slice(0, 5)"
              :key="item.country"
              class="cost-item"
            >
              <div class="cost-item-header">
                <span class="country-name">{{ item.country }}</span>
                <span class="cost-value">${{ parseFloat(item.total_cost || 0).toFixed(2) }}</span>
              </div>
              <el-progress
                :percentage="calculateCostPercentage(item.total_cost)"
                :color="getRandomColor()"
              />
            </div>
            <el-empty v-if="countryStats.length === 0" description="暂无数据" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 发送趋势 -->
    <el-card class="chart-card">
      <div slot="header">
        <span class="card-title">发送趋势</span>
      </div>
      <el-table
        :data="dailyStats"
        border
        max-height="300"
      >
        <el-table-column prop="date" label="日期" width="120" align="center" />
        <el-table-column prop="total_sent" label="发送量" align="center">
          <template slot-scope="scope">
            <div class="trend-bar">
              <span>{{ scope.row.total_sent }}</span>
              <div
                class="trend-bar-bg"
                :style="{ width: calculateBarWidth(scope.row.total_sent) + '%' }"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="total_success" label="成功" align="center">
          <template slot-scope="scope">
            <span style="color: #67C23A">{{ scope.row.total_success }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="total_failed" label="失败" align="center">
          <template slot-scope="scope">
            <span style="color: #F56C6C">{{ scope.row.total_failed }}</span>
          </template>
        </el-table-column>
        <el-table-column label="成功率" align="center">
          <template slot-scope="scope">
            {{ calculateRate(scope.row.total_success, scope.row.total_sent) }}%
          </template>
        </el-table-column>
        <el-table-column label="费用($)" align="center">
          <template slot-scope="scope">
            ${{ parseFloat(scope.row.total_cost || 0).toFixed(2) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { getStatistics } from '@/api/smsCustomer'

export default {
  name: 'SmsCustomerStatistics',
  data() {
    return {
      loading: false,
      timePeriod: 'today',
      dateRange: [],
      statistics: {
        total_sent: 0,
        total_success: 0,
        total_failed: 0,
        total_cost: '0.00',
        total_tasks: 0,
        sent_trend: 0
      },
      countryStats: [],
      dailyStats: []
    }
  },
  computed: {
    successRate() {
      const total = this.statistics.total_sent || 0
      const success = this.statistics.total_success || 0
      return total > 0 ? ((success / total) * 100).toFixed(2) : '0.00'
    },
    totalCost() {
      return parseFloat(this.statistics.total_cost || 0).toFixed(2)
    },
    avgCost() {
      const total = this.statistics.total_sent || 0
      const cost = parseFloat(this.statistics.total_cost || 0)
      return total > 0 ? (cost / total).toFixed(4) : '0.0000'
    },
    avgPerTask() {
      const tasks = this.statistics.total_tasks || 0
      const sent = this.statistics.total_sent || 0
      return tasks > 0 ? Math.round(sent / tasks) : 0
    },
    maxDailySent() {
      if (this.dailyStats.length === 0) return 0
      return Math.max(...this.dailyStats.map(d => d.total_sent))
    }
  },
  created() {
    this.getStatistics()
  },
  methods: {
    async getStatistics() {
      this.loading = true
      try {
        const params = {
          period: this.timePeriod
        }

        if (this.timePeriod === 'custom' && this.dateRange && this.dateRange.length === 2) {
          params.startDate = this.dateRange[0]
          params.endDate = this.dateRange[1]
        }

        const response = await getStatistics(params)
        this.statistics = response.data.overall || {}
        this.countryStats = response.data.byCountry || []
        this.dailyStats = response.data.daily || []
      } catch (error) {
        this.$message.error('获取统计数据失败: ' + (error.message || '未知错误'))
      } finally {
        this.loading = false
      }
    },

    handlePeriodChange() {
      if (this.timePeriod !== 'custom') {
        this.dateRange = []
        this.getStatistics()
      }
    },

    calculateRate(success, total) {
      if (!total || total === 0) return 0
      return parseFloat(((success / total) * 100).toFixed(2))
    },

    calculateCostPercentage(cost) {
      const totalCost = this.countryStats.reduce((sum, item) =>
        sum + parseFloat(item.total_cost || 0), 0
      )
      if (totalCost === 0) return 0
      return parseFloat(((parseFloat(cost) / totalCost) * 100).toFixed(0))
    },

    calculateBarWidth(value) {
      if (this.maxDailySent === 0) return 0
      return (value / this.maxDailySent) * 100
    },

    getSuccessRateType(rate) {
      if (rate >= 90) return 'success'
      if (rate >= 70) return 'warning'
      return 'danger'
    },

    getRandomColor() {
      const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']
      return colors[Math.floor(Math.random() * colors.length)]
    }
  }
}
</script>

<style scoped>
.sms-statistics-container {
  padding: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.overview-cards {
  margin-bottom: 20px;
}

.stat-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-card >>> .el-card__body {
  display: flex;
  align-items: center;
  padding: 20px;
}

.stat-icon {
  width: 70px;
  height: 70px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.stat-icon i {
  font-size: 32px;
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.stat-extra {
  font-size: 12px;
  color: #606266;
}

.stat-trend {
  font-size: 12px;
  margin-top: 5px;
}

.chart-card {
  margin-bottom: 20px;
}

.card-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.cost-breakdown {
  padding: 10px 0;
  min-height: 300px;
}

.cost-item {
  margin-bottom: 20px;
}

.cost-item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.country-name {
  font-weight: bold;
  color: #303133;
}

.cost-value {
  color: #E6A23C;
  font-weight: bold;
}

.trend-bar {
  position: relative;
  padding: 5px 0;
}

.trend-bar span {
  position: relative;
  z-index: 1;
}

.trend-bar-bg {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(to right, #e3f2fd, #2196f3);
  opacity: 0.3;
  transition: width 0.3s;
}
</style>
