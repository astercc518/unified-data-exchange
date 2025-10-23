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

        <el-form-item label="国家">
          <el-select
            v-model="selectedCountry"
            placeholder="全部国家"
            clearable
            style="width: 150px"
            @change="getStatistics"
          >
            <el-option
              v-for="country in countryList"
              :key="country"
              :label="country"
              :value="country"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" icon="el-icon-refresh" @click="getStatistics">
            刷新
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 概览卡片 -->
    <el-row :gutter="20" class="overview-cards">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #409EFF">
            <i class="el-icon-s-promotion" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.total_sent || 0 }}</div>
            <div class="stat-label">总发送量</div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #67C23A">
            <i class="el-icon-success" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.total_success || 0 }}</div>
            <div class="stat-label">成功数量</div>
            <div class="stat-extra">
              成功率: {{ successRate }}%
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #F56C6C">
            <i class="el-icon-error" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.total_failed || 0 }}</div>
            <div class="stat-label">失败数量</div>
            <div class="stat-extra">
              失败率: {{ failureRate }}%
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #E6A23C">
            <i class="el-icon-coin" />
          </div>
          <div class="stat-content">
            <div class="stat-value">${{ totalCost }}</div>
            <div class="stat-label">总费用</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 按国家统计 -->
    <el-card class="chart-card">
      <div slot="header">
        <span class="card-title">按国家统计</span>
      </div>
      <el-table
        :data="countryStats"
        border
        style="width: 100%"
        :default-sort="{prop: 'total_sent', order: 'descending'}"
      >
        <el-table-column prop="country" label="国家" width="120" align="center" />
        <el-table-column prop="total_sent" label="发送总量" sortable align="center" />
        <el-table-column prop="total_success" label="成功数量" sortable align="center" />
        <el-table-column prop="total_failed" label="失败数量" sortable align="center" />
        <el-table-column label="成功率" sortable align="center">
          <template slot-scope="scope">
            <el-progress
              :percentage="calculateRate(scope.row.total_success, scope.row.total_sent)"
              :color="getProgressColor(calculateRate(scope.row.total_success, scope.row.total_sent))"
            />
          </template>
        </el-table-column>
        <el-table-column label="总费用($)" sortable align="center">
          <template slot-scope="scope">
            ${{ parseFloat(scope.row.total_cost || 0).toFixed(2) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 按客户统计 -->
    <el-card class="chart-card">
      <div slot="header">
        <span class="card-title">按客户统计 (Top 10)</span>
      </div>
      <el-table
        :data="customerStats"
        border
        style="width: 100%"
      >
        <el-table-column type="index" label="排名" width="60" align="center" />
        <el-table-column prop="customer_name" label="客户名称" width="150" />
        <el-table-column prop="total_sent" label="发送总量" sortable align="center" />
        <el-table-column prop="total_success" label="成功数量" sortable align="center" />
        <el-table-column label="成功率" align="center">
          <template slot-scope="scope">
            {{ calculateRate(scope.row.total_success, scope.row.total_sent) }}%
          </template>
        </el-table-column>
        <el-table-column label="总费用($)" sortable align="center">
          <template slot-scope="scope">
            ${{ parseFloat(scope.row.total_cost || 0).toFixed(2) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 按通道统计 -->
    <el-card class="chart-card">
      <div slot="header">
        <span class="card-title">按通道统计</span>
      </div>
      <el-table
        :data="channelStats"
        border
        style="width: 100%"
      >
        <el-table-column prop="channel_name" label="通道名称" width="180" />
        <el-table-column prop="country" label="国家" width="100" align="center" />
        <el-table-column prop="total_sent" label="发送总量" sortable align="center" />
        <el-table-column prop="total_success" label="成功数量" sortable align="center" />
        <el-table-column prop="total_failed" label="失败数量" sortable align="center" />
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
        <el-table-column label="总费用($)" sortable align="center">
          <template slot-scope="scope">
            ${{ parseFloat(scope.row.total_cost || 0).toFixed(2) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { getStatistics, getCountries } from '@/api/smsAdmin'

export default {
  name: 'SmsAdminStatistics',
  data() {
    return {
      loading: false,
      timePeriod: 'today',
      dateRange: [],
      selectedCountry: '',
      countryList: [],
      statistics: {
        total_sent: 0,
        total_success: 0,
        total_failed: 0,
        total_cost: '0.00'
      },
      countryStats: [],
      customerStats: [],
      channelStats: []
    }
  },
  computed: {
    successRate() {
      const total = this.statistics.total_sent || 0
      const success = this.statistics.total_success || 0
      return total > 0 ? ((success / total) * 100).toFixed(2) : '0.00'
    },
    failureRate() {
      const total = this.statistics.total_sent || 0
      const failed = this.statistics.total_failed || 0
      return total > 0 ? ((failed / total) * 100).toFixed(2) : '0.00'
    },
    totalCost() {
      return parseFloat(this.statistics.total_cost || 0).toFixed(2)
    }
  },
  created() {
    this.getStatistics()
    this.getCountryList()
  },
  methods: {
    async getStatistics() {
      this.loading = true
      try {
        const params = {
          period: this.timePeriod,
          country: this.selectedCountry
        }

        if (this.timePeriod === 'custom' && this.dateRange && this.dateRange.length === 2) {
          params.startDate = this.dateRange[0]
          params.endDate = this.dateRange[1]
        }

        const response = await getStatistics(params)
        this.statistics = response.data.overall || {}
        this.countryStats = response.data.byCountry || []
        this.customerStats = response.data.byCustomer || []
        this.channelStats = response.data.byChannel || []
      } catch (error) {
        this.$message.error('获取统计数据失败: ' + (error.message || '未知错误'))
      } finally {
        this.loading = false
      }
    },

    async getCountryList() {
      try {
        const response = await getCountries()
        this.countryList = response.data.countries
      } catch (error) {
        console.error('获取国家列表失败:', error)
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

    getProgressColor(rate) {
      if (rate >= 90) return '#67C23A'
      if (rate >= 70) return '#E6A23C'
      return '#F56C6C'
    },

    getSuccessRateType(rate) {
      if (rate >= 90) return 'success'
      if (rate >= 70) return 'warning'
      return 'danger'
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
  display: flex;
  align-items: center;
  padding: 10px;
  margin-bottom: 20px;
}

.stat-card >>> .el-card__body {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.stat-icon i {
  font-size: 30px;
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 3px;
}

.stat-extra {
  font-size: 12px;
  color: #606266;
}

.chart-card {
  margin-bottom: 20px;
}

.card-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}
</style>
