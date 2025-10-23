<template>
  <div class="dashboard-editor-container">
    <!-- 数据统计面板 -->
    <data-platform-panel-group @handleSetLineChartData="handleSetLineChartData" />

    <!-- 销售趋势图表 -->
    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;border-radius:8px;">
      <div class="chart-title">
        <h3>{{ $t('dashboard.salesTrend') }}</h3>
      </div>
      <line-chart :chart-data="lineChartData" />
    </el-row>

    <!-- 数据分析图表区域 -->
    <el-row :gutter="32">
      <el-col :xs="24" :sm="24" :lg="8">
        <data-distribution-chart />
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <system-health-card />
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <service-status-card />
      </el-col>
    </el-row>

    <!-- parsePhoneNumber 服务状态 -->
    <el-row :gutter="32" style="margin-top:32px;">
      <el-col :xs="24" :sm="24" :lg="8">
        <parse-phone-card />
      </el-col>
    </el-row>

    <!-- 详细信息区域 -->
    <el-row :gutter="32">
      <el-col :xs="24" :sm="24" :lg="16">
        <div class="chart-wrapper">
          <div class="chart-title">
            <h3>{{ $t('dashboard.recentOrders') }}</h3>
          </div>
          <transaction-table />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <div class="chart-title">
            <h3>{{ $t('dashboard.topAgents') }}</h3>
          </div>
          <top-agents-card />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import DataPlatformPanelGroup from './components/DataPlatformPanelGroup'
import LineChart from './components/LineChart'
import DataDistributionChart from './components/DataDistributionChart'
import SystemHealthCard from './components/SystemHealthCard'
import ServiceStatusCard from './components/ServiceStatusCard'
import ParsePhoneCard from './components/ParsePhoneCard'
import TransactionTable from './components/TransactionTable'
import TopAgentsCard from './components/TopAgentsCard'

// 销售趋勿数据
const lineChartData = {
  data: {
    expectedData: [125000, 135000, 148000, 142000, 165000, 185000, 192000],
    actualData: [128000, 142000, 135000, 156000, 178000, 165000, 185000]
  },
  agents: {
    expectedData: [45, 52, 58, 62, 68, 75, 82],
    actualData: [48, 56, 54, 67, 72, 78, 85]
  },
  customers: {
    expectedData: [850, 920, 1050, 1180, 1250, 1380, 1450],
    actualData: [880, 945, 1025, 1205, 1285, 1365, 1485]
  },
  server: {
    expectedData: [95, 96, 97, 96, 98, 97, 99],
    actualData: [94, 97, 95, 98, 96, 98, 97]
  }
}

export default {
  name: 'DashboardAdmin',
  components: {
    DataPlatformPanelGroup,
    LineChart,
    DataDistributionChart,
    SystemHealthCard,
    ServiceStatusCard,
    ParsePhoneCard,
    TransactionTable,
    TopAgentsCard
  },
  data() {
    return {
      lineChartData: lineChartData.data
    }
  },
  methods: {
    handleSetLineChartData(type) {
      this.lineChartData = lineChartData[type] || lineChartData.data
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;
  min-height: calc(100vh - 84px);

  .chart-wrapper {
    background: #fff;
    padding: 20px;
    margin-bottom: 32px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }

  .chart-title {
    margin-bottom: 16px;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }
}

@media (max-width:1024px) {
  .dashboard-editor-container {
    padding: 16px;
  }

  .chart-wrapper {
    padding: 12px;
  }
}
</style>
