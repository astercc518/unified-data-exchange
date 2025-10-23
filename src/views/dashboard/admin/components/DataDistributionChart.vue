<template>
  <div class="data-distribution-chart">
    <div class="chart-header">
      <h3>{{ $t('dashboard.dataDistribution') }}</h3>
      <el-radio-group v-model="chartType" size="small" @change="handleChartTypeChange">
        <el-radio-button label="validity">{{ $t('dashboard.byValidity') }}</el-radio-button>
        <el-radio-button label="country">{{ $t('dashboard.byCountry') }}</el-radio-button>
      </el-radio-group>
    </div>
    <div ref="chart" class="chart-container" />
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'DataDistributionChart',
  data() {
    return {
      chart: null,
      chartType: 'validity',
      // 按时效性分类的数据（根据数据分类规则）
      validityData: {
        within3Days: { name: '', value: 450000, countries: ['孟加拉国', '印度', '巴基斯坦'] },
        within30Days: { name: '', value: 620000, countries: ['孟加拉国', '印度', '尼泊尔', '斯里兰卡'] },
        over30Days: { name: '', value: 180000, countries: ['孟加拉国', '印度'] }
      },
      // 按国家分类的数据
      countryData: [
        { name: '孟加拉国', value: 850000, color: '#5470c6' },
        { name: '印度', value: 280000, color: '#91cc75' },
        { name: '巴基斯坦', value: 65000, color: '#fac858' },
        { name: '尼泊尔', value: 35000, color: '#ee6666' },
        { name: '斯里兰卡', value: 20000, color: '#73c0de' }
      ]
    }
  },
  mounted() {
    // 初始化国际化文本
    this.validityData.within3Days.name = this.$t('dashboard.within3Days')
    this.validityData.within30Days.name = this.$t('dashboard.within30Days')
    this.validityData.over30Days.name = this.$t('dashboard.over30Days')

    this.initChart()
    this.renderChart()

    // 监听窗口大小变化
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose()
    }
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$refs.chart)
    },
    renderChart() {
      if (this.chartType === 'validity') {
        this.renderValidityChart()
      } else {
        this.renderCountryChart()
      }
    },
    renderValidityChart() {
      const data = [
        {
          name: this.validityData.within3Days.name,
          value: this.validityData.within3Days.value,
          itemStyle: { color: '#67C23A' }
        },
        {
          name: this.validityData.within30Days.name,
          value: this.validityData.within30Days.value,
          itemStyle: { color: '#E6A23C' }
        },
        {
          name: this.validityData.over30Days.name,
          value: this.validityData.over30Days.value,
          itemStyle: { color: '#F56C6C' }
        }
      ]

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: (params) => {
            const percent = ((params.value / data.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)
            return `${params.name}<br/>${this.$t('dashboard.dataCount')}: ${params.value.toLocaleString()}<br/>${this.$t('dashboard.percentage')}: ${percent}%`
          }
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          top: 'middle',
          textStyle: {
            fontSize: 12
          }
        },
        series: [
          {
            name: this.$t('dashboard.dataDistribution'),
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['60%', '50%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '18',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: data
          }
        ]
      }

      this.chart.setOption(option)
    },
    renderCountryChart() {
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: (params) => {
            const total = this.countryData.reduce((sum, item) => sum + item.value, 0)
            const percent = ((params.value / total) * 100).toFixed(1)
            return `${params.name}<br/>${this.$t('dashboard.dataCount')}: ${params.value.toLocaleString()}<br/>${this.$t('dashboard.percentage')}: ${percent}%`
          }
        },
        xAxis: {
          type: 'category',
          data: this.countryData.map(item => item.name),
          axisLabel: {
            rotate: 45,
            fontSize: 12
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: (value) => {
              if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M'
              if (value >= 1000) return (value / 1000).toFixed(1) + 'K'
              return value
            }
          }
        },
        series: [
          {
            data: this.countryData.map(item => ({
              value: item.value,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: item.color },
                  { offset: 1, color: item.color + '80' }
                ])
              }
            })),
            type: 'bar',
            barWidth: '60%',
            label: {
              show: true,
              position: 'top',
              formatter: (params) => {
                if (params.value >= 1000000) return (params.value / 1000000).toFixed(1) + 'M'
                if (params.value >= 1000) return (params.value / 1000).toFixed(1) + 'K'
                return params.value
              }
            }
          }
        ]
      }

      this.chart.setOption(option)
    },
    handleChartTypeChange() {
      this.renderChart()
    },
    handleResize() {
      if (this.chart) {
        this.chart.resize()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.data-distribution-chart {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }

  .chart-container {
    height: 300px;
    width: 100%;
  }
}
</style>
