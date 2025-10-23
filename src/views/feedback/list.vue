<template>
  <div class="app-container">
    <!-- 反馈统计卡片 -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-number">{{ formatNumber(statistics.total) }}</div>
            <div class="stat-label">总反馈数</div>
          </div>
          <i class="el-icon-chat-dot-round stat-icon" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-number">{{ formatNumber(statistics.thisMonth) }}</div>
            <div class="stat-label">本月反馈</div>
          </div>
          <i class="el-icon-date stat-icon" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-number">{{ statistics.avgTraffic }}</div>
            <div class="stat-label">平均访问量</div>
          </div>
          <i class="el-icon-view stat-icon" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-number">{{ statistics.conversionRate }}%</div>
            <div class="stat-label">平均转化率</div>
          </div>
          <i class="el-icon-pie-chart stat-icon" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选条件 -->
    <el-card style="margin-bottom: 20px;">
      <div class="filter-container">
        <el-input
          v-model="listQuery.targetSite"
          :placeholder="$t('feedback.targetSite')"
          style="width: 200px;"
          class="filter-item"
          @keyup.enter.native="handleFilter"
        />

        <el-select
          v-model="listQuery.dataSource"
          :placeholder="$t('feedback.dataSource')"
          clearable
          style="width: 150px"
          class="filter-item"
        >
          <el-option label="孟加拉国-3天内" value="bangladesh_3" />
          <el-option label="孟加拉国-30天内" value="bangladesh_30" />
          <el-option label="印度-30天内" value="india_30" />
          <el-option label="印度-30天以上" value="india_30+" />
        </el-select>

        <el-input
          v-model="listQuery.submitter"
          placeholder="提交者"
          style="width: 150px;"
          class="filter-item"
          @keyup.enter.native="handleFilter"
        />

        <el-date-picker
          v-model="listQuery.dateRange"
          type="daterange"
          :range-separator="$t('common.to')"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          class="filter-item"
          style="width: 240px"
        />

        <el-button
          v-waves
          class="filter-item"
          type="primary"
          icon="el-icon-search"
          @click="handleFilter"
        >
          {{ $t('common.search') }}
        </el-button>

        <el-button
          class="filter-item"
          style="margin-left: 10px;"
          type="success"
          icon="el-icon-plus"
          @click="handleCreate"
        >
          {{ $t('feedback.create') }}
        </el-button>
      </div>
    </el-card>

    <!-- 反馈列表 -->
    <el-card>
      <div slot="header" class="clearfix">
        <span>{{ $t('feedback.list') }}</span>
      </div>

      <el-table
        :key="tableKey"
        v-loading="listLoading"
        :data="list"
        border
        fit
        highlight-current-row
        style="width: 100%;"
        @sort-change="sortChange"
      >
        <el-table-column
          label="ID"
          prop="id"
          align="center"
          width="80"
          sortable="custom"
        />
        <el-table-column
          :label="$t('feedback.targetSite')"
          prop="targetSite"
          min-width="150"
        >
          <template slot-scope="{row}">
            <span class="link-type" @click="handleDetail(row)">{{ row.targetSite }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('feedback.dataSource')"
          prop="dataSource"
          width="150"
        />
        <el-table-column
          :label="$t('feedback.traffic')"
          prop="traffic"
          width="100"
          align="center"
        >
          <template slot-scope="{row}">
            {{ formatNumber(row.traffic) }}
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('feedback.registration')"
          prop="registration"
          width="100"
          align="center"
        >
          <template slot-scope="{row}">
            {{ formatNumber(row.registration) }}
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('feedback.recharge')"
          prop="recharge"
          width="100"
          align="center"
        >
          <template slot-scope="{row}">
            {{ formatNumber(row.recharge) }}
          </template>
        </el-table-column>
        <el-table-column
          label="注册转化率"
          width="100"
          align="center"
        >
          <template slot-scope="{row}">
            <span :class="getConversionClass(row.registrationRate)">
              {{ row.registrationRate }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column
          label="充值转化率"
          width="100"
          align="center"
        >
          <template slot-scope="{row}">
            <span :class="getConversionClass(row.rechargeRate)">
              {{ row.rechargeRate }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column
          label="数据质量"
          width="100"
          align="center"
        >
          <template slot-scope="{row}">
            <el-tag :type="getQualityTagType(row.dataQuality)">
              {{ getQualityText(row.dataQuality) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="提交者"
          prop="submitter"
          width="100"
        />
        <el-table-column
          :label="$t('feedback.feedbackTime')"
          prop="feedbackTime"
          width="150"
          align="center"
          sortable="custom"
        >
          <template slot-scope="{row}">
            {{ row.feedbackTime | parseTime('{y}-{m}-{d} {h}:{i}') }}
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('common.operation')"
          align="center"
          width="150"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="{row}">
            <el-button
              type="primary"
              size="mini"
              @click="handleDetail(row)"
            >
              {{ $t('common.detail') }}
            </el-button>
            <el-button
              type="success"
              size="mini"
              @click="handleEdit(row)"
            >
              {{ $t('common.edit') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.limit"
        @pagination="getList"
      />
    </el-card>
  </div>
</template>

<script>
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'
import waves from '@/directive/waves'
import i18nMixin from '@/mixins/i18n'

export default {
  name: 'FeedbackList',
  components: { Pagination },
  directives: { waves },
  filters: {
    parseTime
  },
  mixins: [i18nMixin],
  data() {
    return {
      tableKey: 0,
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        targetSite: undefined,
        dataSource: undefined,
        submitter: undefined,
        dateRange: null,
        sort: '-feedbackTime'
      },
      statistics: {
        total: 0,
        thisMonth: 0,
        avgTraffic: '0',
        conversionRate: '0.0'
      }
    }
  },
  created() {
    this.getList()
    this.getStatistics()
  },
  methods: {
    getList() {
      this.listLoading = true
      // 模拟获取反馈列表
      setTimeout(() => {
        this.list = [
          {
            id: 1,
            targetSite: 'www.example-site1.com',
            dataSource: '孟加拉国-3天内',
            traffic: 15000,
            registration: 850,
            recharge: 120,
            registrationRate: 5.67,
            rechargeRate: 14.12,
            dataQuality: 'excellent',
            submitter: '张三',
            feedbackTime: new Date('2023-12-01 10:30:00'),
            content: '数据质量很好，转化率不错，建议继续采购此类数据。'
          },
          {
            id: 2,
            targetSite: 'app.gaming-platform.com',
            dataSource: '印度-30天内',
            traffic: 8500,
            registration: 320,
            recharge: 45,
            registrationRate: 3.76,
            rechargeRate: 14.06,
            dataQuality: 'good',
            submitter: '李四',
            feedbackTime: new Date('2023-12-01 14:20:00'),
            content: '数据有效性较好，但部分号码重复率较高。'
          },
          {
            id: 3,
            targetSite: 'shop.ecommerce.com',
            dataSource: '孟加拉国-30天内',
            traffic: 12000,
            registration: 280,
            recharge: 35,
            registrationRate: 2.33,
            rechargeRate: 12.50,
            dataQuality: 'average',
            submitter: '王五',
            feedbackTime: new Date('2023-11-30 16:45:00'),
            content: '数据质量一般，建议优化数据源或降低价格。'
          },
          {
            id: 4,
            targetSite: 'finance.lending.com',
            dataSource: '印度-30天以上',
            traffic: 6800,
            registration: 95,
            recharge: 8,
            registrationRate: 1.40,
            rechargeRate: 8.42,
            dataQuality: 'poor',
            submitter: '赵六',
            feedbackTime: new Date('2023-11-29 11:15:00'),
            content: '数据质量较差，转化率低，不建议继续采购。'
          }
        ]
        this.total = this.list.length
        this.listLoading = false
      }, 1000)
    },
    getStatistics() {
      // 模拟获取统计数据
      this.statistics = {
        total: 156,
        thisMonth: 45,
        avgTraffic: '10.5K',
        conversionRate: '4.2'
      }
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleCreate() {
      this.$router.push('/feedback/create')
    },
    handleDetail(row) {
      this.$router.push(`/feedback/detail/${row.id}`)
    },
    handleEdit(row) {
      this.$router.push(`/feedback/create?id=${row.id}`)
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      } else if (prop === 'feedbackTime') {
        this.sortByFeedbackTime(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    sortByFeedbackTime(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+feedbackTime'
      } else {
        this.listQuery.sort = '-feedbackTime'
      }
      this.handleFilter()
    },
    formatNumber(num) {
      return num.toLocaleString()
    },
    getConversionClass(rate) {
      if (rate >= 5) return 'conversion-high'
      if (rate >= 2) return 'conversion-medium'
      return 'conversion-low'
    },
    getQualityTagType(quality) {
      const tagMap = {
        excellent: 'success',
        good: 'primary',
        average: 'warning',
        poor: 'danger'
      }
      return tagMap[quality]
    },
    getQualityText(quality) {
      const textMap = {
        excellent: '优秀',
        good: '良好',
        average: '一般',
        poor: '较差'
      }
      return textMap[quality]
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-container {
  .filter-item {
    display: inline-block;
    vertical-align: middle;
    margin-right: 10px;
  }
}

.stat-card {
  position: relative;
  overflow: hidden;

  .stat-content {
    .stat-number {
      font-size: 24px;
      font-weight: bold;
      color: #409eff;
      margin-bottom: 5px;
    }

    .stat-label {
      font-size: 14px;
      color: #606266;
    }
  }

  .stat-icon {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 40px;
    color: #ddd;
  }
}

.link-type {
  color: #409eff;
  cursor: pointer;

  &:hover {
    color: #66b1ff;
  }
}

.conversion-high {
  color: #67c23a;
  font-weight: bold;
}

.conversion-medium {
  color: #e6a23c;
  font-weight: bold;
}

.conversion-low {
  color: #f56c6c;
  font-weight: bold;
}
</style>
