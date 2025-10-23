<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="clearfix">
        <span>操作日志查询</span>
      </div>

      <!-- 筛选条件 -->
      <div class="filter-container">
        <el-select
          v-model="listQuery.type"
          placeholder="日志类型"
          clearable
          style="width: 150px"
          class="filter-item"
        >
          <el-option value="login" label="登录日志" />
          <el-option value="operation" label="操作日志" />
        </el-select>
        <el-input
          v-model="listQuery.operator"
          placeholder="操作人"
          style="width: 200px;"
          class="filter-item"
          clearable
        />
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          class="filter-item"
          style="width: 240px"
          @change="handleDateChange"
        />
        <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
          搜索
        </el-button>
        <el-button class="filter-item" @click="resetQuery">
          重置
        </el-button>
        <el-button class="filter-item" icon="el-icon-refresh" @click="handleRefresh">
          刷新
        </el-button>
        <el-button class="filter-item" type="danger" icon="el-icon-delete" @click="handleClear">
          清空历史
        </el-button>
        <el-switch
          v-model="autoRefresh"
          active-text="自动刷新"
          inactive-text=""
          class="filter-item"
          style="margin-left: 10px;"
          @change="toggleAutoRefresh"
        />
      </div>

      <!-- 数据表格 -->
      <el-table
        v-loading="listLoading"
        :data="list"
        border
        fit
        highlight-current-row
        style="width: 100%; margin-top: 20px;"
      >
        <el-table-column label="ID" prop="id" width="80" align="center" />
        <el-table-column label="日志类型" width="100" align="center">
          <template slot-scope="{row}">
            <el-tag :type="row.type === 'login' ? 'success' : 'primary'">
              {{ row.type === 'login' ? '登录' : '操作' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作人" prop="operator" width="120" />
        <el-table-column label="操作人类型" width="100" align="center">
          <template slot-scope="{row}">
            <el-tag :type="getOperatorTypeTag(row.operatorType)" size="small">
              {{ getOperatorTypeText(row.operatorType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作动作" prop="action" width="150" />
        <el-table-column label="操作描述" prop="description" min-width="200" show-overflow-tooltip />
        <el-table-column label="IP地址" prop="ipAddress" width="150" />
        <el-table-column label="状态" width="80" align="center">
          <template slot-scope="{row}">
            <el-tag :type="row.status === 'success' ? 'success' : 'danger'" size="small">
              {{ row.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作时间" width="180" align="center">
          <template slot-scope="{row}">
            {{ formatTime(row.createTime) }}
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
import request from '@/utils/request'
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'

export default {
  name: 'OperationLogs',
  components: { Pagination },
  data() {
    return {
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        type: undefined,
        operator: undefined,
        startDate: undefined,
        endDate: undefined
      },
      dateRange: null,
      autoRefresh: true, // 默认开启自动刷新
      refreshTimer: null, // 定时器
      refreshInterval: 30000 // 刷新间隔30秒
    }
  },
  created() {
    this.getList()
    // 启动自动刷新
    if (this.autoRefresh) {
      this.startAutoRefresh()
    }
  },
  beforeDestroy() {
    // 组件销毁时清除定时器
    this.stopAutoRefresh()
  },
  methods: {
    formatTime(timestamp) {
      return parseTime(timestamp, '{y}-{m}-{d} {h}:{i}:{s}')
    },
    async getList() {
      this.listLoading = true
      try {
        const response = await request({
          url: '/api/system/logs',
          method: 'get',
          params: this.listQuery
        })

        this.list = response.data || []
        this.total = response.total || 0
        this.listLoading = false
      } catch (error) {
        this.listLoading = false
        this.$message.error('加载操作日志失败')
      }
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetQuery() {
      this.listQuery = {
        page: 1,
        limit: 20,
        type: undefined,
        operator: undefined,
        startDate: undefined,
        endDate: undefined
      }
      this.dateRange = null
      this.getList()
    },
    handleDateChange(value) {
      if (value) {
        this.listQuery.startDate = new Date(value[0]).getTime()
        this.listQuery.endDate = new Date(value[1]).getTime()
      } else {
        this.listQuery.startDate = undefined
        this.listQuery.endDate = undefined
      }
    },
    handleClear() {
      this.$confirm('确定要清空90天前的历史日志吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          await request({
            url: '/api/system/logs/clear',
            method: 'delete',
            params: { days: 90 }
          })
          this.$message.success('清空成功')
          this.getList()
        } catch (error) {
          this.$message.error('清空失败')
        }
      })
    },
    getOperatorTypeTag(type) {
      const typeMap = {
        admin: 'danger',
        agent: 'warning',
        customer: 'info'
      }
      return typeMap[type] || 'info'
    },
    getOperatorTypeText(type) {
      const typeMap = {
        admin: '管理员',
        agent: '代理',
        customer: '客户'
      }
      return typeMap[type] || type
    },
    // 手动刷新
    handleRefresh() {
      this.$message.success('正在刷新...')
      this.getList()
    },
    // 开启自动刷新
    startAutoRefresh() {
      this.stopAutoRefresh() // 先清除已有的定时器
      this.refreshTimer = setInterval(() => {
        // 静默刷新,不显示loading
        const originalLoading = this.listLoading
        this.listLoading = false
        this.getList().finally(() => {
          this.listLoading = originalLoading
        })
      }, this.refreshInterval)
      console.log('✅ 自动刷新已启动(每30秒)')
    },
    // 停止自动刷新
    stopAutoRefresh() {
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer)
        this.refreshTimer = null
        console.log('⏸ 自动刷新已停止')
      }
    },
    // 切换自动刷新
    toggleAutoRefresh(value) {
      if (value) {
        this.startAutoRefresh()
        this.$message.success('已开启自动刷新(每30秒)')
      } else {
        this.stopAutoRefresh()
        this.$message.info('已关闭自动刷新')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-container {
  padding: 10px 0;
  .filter-item {
    display: inline-block;
    vertical-align: middle;
    margin-right: 10px;
    margin-bottom: 10px;
  }
}
</style>
