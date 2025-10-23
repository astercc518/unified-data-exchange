<template>
  <div class="app-container">
    <!-- 搜索和操作栏 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.agentName"
        :placeholder="$t('agent.pleaseEnterAgentName')"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-input
        v-model="listQuery.loginAccount"
        :placeholder="$t('agent.pleaseEnterLoginAccount')"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select
        v-model="listQuery.level"
        :placeholder="$t('agent.level')"
        clearable
        style="width: 120px"
        class="filter-item"
      >
        <el-option :key="1" :label="$t('agent.level1')" :value="1" />
        <el-option :key="2" :label="$t('agent.level2')" :value="2" />
        <el-option :key="3" :label="$t('agent.level3')" :value="3" />
      </el-select>
      <el-select
        v-model="listQuery.status"
        :placeholder="$t('user.status')"
        clearable
        style="width: 120px"
        class="filter-item"
      >
        <el-option :key="1" :label="$t('user.active')" :value="1" />
        <el-option :key="0" :label="$t('user.inactive')" :value="0" />
      </el-select>
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
        type="primary"
        icon="el-icon-plus"
        @click="handleCreate"
      >
        {{ $t('agent.create') }}
      </el-button>
    </div>

    <!-- 代理列表表格 -->
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
        sortable="custom"
        align="center"
        width="80"
      />
      <el-table-column
        :label="$t('agent.agentName')"
        min-width="120px"
      >
        <template slot-scope="{row}">
          <span class="link-type" @click="handleDetail(row)">{{ row.agentName }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('agent.loginAccount')"
        min-width="120px"
      >
        <template slot-scope="{row}">
          <span>{{ row.loginAccount || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('agent.level')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{row}">
          <el-tag :type="getLevelTagType(row.level)">
            {{ getLevelText(row.level) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('agent.commission')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{row}">
          <span>{{ row.commission }}%</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('agent.bindUsers')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{row}">
          <span>{{ row.bindUsers || 0 }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('agent.totalCommission')"
        min-width="120px"
        align="center"
      >
        <template slot-scope="{row}">
          <span>¥{{ row.totalCommission || '0.00' }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('user.email')"
        min-width="150px"
      >
        <template slot-scope="{row}">
          <span>{{ row.email || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('user.status')"
        class-name="status-col"
        width="100"
      >
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status === 1 ? $t('user.active') : $t('user.inactive') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('user.createTime')"
        width="150px"
        align="center"
      >
        <template slot-scope="{row}">
          <span>{{ row.createTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('common.operation')"
        align="center"
        width="280"
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
            type="primary"
            size="mini"
            @click="handleUpdate(row)"
          >
            {{ $t('common.edit') }}
          </el-button>
          <el-dropdown trigger="click" @command="(command) => handleCommand(command, row)">
            <el-button
              size="mini"
              type="info"
            >
              {{ $t('common.more') }}<i class="el-icon-arrow-down el-icon--right" />
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="login">
                <i class="el-icon-user" /> 登录账号
              </el-dropdown-item>
              <el-dropdown-item command="recharge" :divided="true">
                <i class="el-icon-wallet" /> {{ $t('agent.recharge') }}
              </el-dropdown-item>
              <el-dropdown-item command="toggleStatus" :divided="true">
                <i :class="row.status === 1 ? 'el-icon-close' : 'el-icon-check'" />
                {{ row.status === 1 ? $t('user.inactive') : $t('user.active') }}
              </el-dropdown-item>
              <el-dropdown-item command="delete" :divided="true">
                <i class="el-icon-delete" style="color: #F56C6C" /> <span style="color: #F56C6C">{{ $t('common.delete') }}</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
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
  </div>
</template>

<script>
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'
import waves from '@/directive/waves'
import i18nMixin from '@/mixins/i18n'
import request from '@/utils/request'

export default {
  name: 'AgentList',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        1: 'success',
        0: 'info'
      }
      return statusMap[status]
    },
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
        agentName: undefined,
        loginAccount: undefined,
        level: undefined,
        status: undefined,
        sort: '+id'
      }
    }
  },
  created() {
    this.getList()

    // 检查是否需要刷新数据
    this.checkRefreshFlag()
  },
  activated() {
    // 当使用 keep-alive 缓存组件时，组件激活时重新加载数据
    this.checkRefreshFlag()
    this.getList()
  },
  beforeRouteEnter(to, from, next) {
    // 从创建或编辑页面进入时，确保刷新数据
    next(vm => {
      if (from.path && (from.path.includes('/create') || from.path.includes('/edit'))) {
        console.log('🔄 从代理管理页面返回，刷新数据')
        vm.getList()
      }
    })
  },
  methods: {
    // 检查刷新标记
    checkRefreshFlag() {
      // 在数据库模式下，每次都重新获取数据，无需检查localStorage标记
      console.log('🔄 数据库模式：直接刷新代理列表数据')
      // 强制重新渲染表格
      this.tableKey = Date.now()
      this.getList()
    },
    async getList() {
      this.listLoading = true
      console.log('🔄 开始从数据库加载代理列表数据...')

      let agents = []

      try {
        // 从数据库获取代理数据
        const response = await request({
          url: '/api/agents',
          method: 'GET',
          params: {
            page: 1,
            limit: 1000 // 获取所有代理
          }
        })

        agents = response.data || []
        console.log('📄 从数据库加载代理数据:', agents.length, '条')

        // 字段名映射：将后端的下划线命名转换为前端的驼峰命名
        agents = agents.map(agent => ({
          id: agent.id,
          agentName: agent.agent_name,
          loginAccount: agent.login_account,
          loginPassword: agent.login_password,
          agentCode: agent.agent_code,
          parentAgentId: agent.parent_agent_id,
          level: agent.level,
          commission: agent.commission,
          region: agent.region,
          email: agent.email,
          bindUsers: agent.bind_users || 0,
          totalCommission: agent.total_commission || 0,
          monthlyCommission: agent.monthly_commission || 0,
          status: agent.status,
          createTime: agent.create_time,
          updateTime: agent.update_time,
          remark: agent.remark
        }))

        // 数据清洗：确保数据格式正确
        agents.forEach(agent => {
          // 确保createTime是时间戳格式
          if (agent.createTime && typeof agent.createTime !== 'number') {
            const date = new Date(agent.createTime)
            agent.createTime = date.getTime()
          }
          if (!agent.createTime || isNaN(agent.createTime)) {
            agent.createTime = new Date().getTime()
          }
        })

        // 获取用户数据来计算绑定用户数
        const userResponse = await request({
          url: '/api/users',
          method: 'GET',
          params: {
            page: 1,
            limit: 1000
          }
        })
        const users = userResponse.data || []

        agents.forEach(agent => {
          const bindUsersCount = users.filter(u => String(u.agentId) === String(agent.id)).length
          agent.bindUsers = bindUsersCount
        })
      } catch (error) {
        console.error('❌ 从数据库加载代理数据失败:', error)
        this.$message.error('加载代理列表失败，请检查网络连接')
        agents = []
      }

      // 应用筛选和处理逻辑
      this.processAgentList(agents)
      console.log('✅ 代理列表数据加载完成，显示:', this.list.length, '条，总数:', this.total, '条')
    },

    // 处理代理列表数据（筛选、排序等）
    processAgentList(agents) {
      // 过滤掉系统管理员账户
      let filteredList = agents.filter(agent => agent.loginAccount !== 'admin')

      if (this.listQuery.agentName) {
        filteredList = filteredList.filter(agent =>
          agent.agentName && agent.agentName.includes(this.listQuery.agentName)
        )
      }

      if (this.listQuery.loginAccount) {
        filteredList = filteredList.filter(agent =>
          agent.loginAccount && agent.loginAccount.includes(this.listQuery.loginAccount)
        )
      }

      if (this.listQuery.level !== undefined && this.listQuery.level !== null && this.listQuery.level !== '') {
        filteredList = filteredList.filter(agent => agent.level === this.listQuery.level)
      }

      if (this.listQuery.status !== undefined && this.listQuery.status !== null && this.listQuery.status !== '') {
        filteredList = filteredList.filter(agent => agent.status === this.listQuery.status)
      }

      // 排序
      if (this.listQuery.sort === '+id') {
        filteredList.sort((a, b) => a.id - b.id)
      } else if (this.listQuery.sort === '-id') {
        filteredList.sort((a, b) => b.id - a.id)
      }

      this.list = filteredList
      this.total = filteredList.length
      this.listLoading = false
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleCreate() {
      this.$router.push('/user/agent/create')
    },
    handleUpdate(row) {
      this.$router.push(`/user/agent/edit/${row.id}`)
    },
    handleDetail(row) {
      this.$router.push(`/user/agent/detail/${row.id}`)
    },
    handleRecharge(row) {
      this.$router.push(`/user/agent/recharge/${row.id}`)
    },
    async handleDelete(row) {
      this.$confirm(this.$t('agent.confirmDeleteAgent'), this.$t('common.warning'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(async() => {
        try {
          // 从数据库删除代理
          await request({
            url: `/api/agents/${row.id}`,
            method: 'DELETE'
          })

          this.$message({
            type: 'success',
            message: this.$t('agent.deleteAgentSuccess')
          })

          // 重新加载列表
          this.getList()
        } catch (error) {
          console.error('❌ 删除代理失败:', error)
          this.$message.error('删除代理失败：' + (error.message || '未知错误'))
        }
      }).catch(() => {})
    },
    async handleModifyStatus(row, status) {
      try {
        // 更新数据库中的状态
        await request({
          url: `/api/agents/${row.id}`,
          method: 'PUT',
          data: { status }
        })

        this.$message({
          message: this.$t('user.statusChanged'),
          type: 'success'
        })

        // 重新加载列表以反映状态更改
        this.getList()
      } catch (error) {
        console.error('❌ 更新代理状态失败:', error)
        this.$message.error('更新状态失败：' + (error.message || '未知错误'))
      }
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
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
    getLevelTagType(level) {
      const levelMap = {
        1: 'danger',
        2: 'warning',
        3: 'success'
      }
      return levelMap[level]
    },
    getLevelText(level) {
      const levelMap = {
        1: this.$t('agent.level1'),
        2: this.$t('agent.level2'),
        3: this.$t('agent.level3')
      }
      return levelMap[level]
    },
    // 处理下拉菜单命令
    handleCommand(command, row) {
      switch (command) {
        case 'login':
          this.handleLogin(row)
          break
        case 'recharge':
          this.handleRecharge(row)
          break
        case 'toggleStatus':
          this.handleModifyStatus(row, row.status === 1 ? 0 : 1)
          break
        case 'delete':
          this.handleDelete(row)
          break
      }
    },
    // 登录代理账号
    handleLogin(row) {
      if (row.status !== 1) {
        this.$message({
          type: 'error',
          message: '该账号已停用，无法登录'
        })
        return
      }

      this.$confirm(`确认要登录到代理账号"${row.agentName}"吗？`, '登录确认', {
        confirmButtonText: '确认登录',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 重置当前登录状态
        this.$store.dispatch('user/resetToken')

        const loginData = {
          username: row.loginAccount,
          password: row.loginPassword
        }

        this.$store.dispatch('user/login', loginData)
          .then(() => {
            this.$message({
              type: 'success',
              message: `已成功登录到代理账号：${row.agentName}`
            })
            // 跳转到首页
            this.$router.push('/')
          })
          .catch(() => {
            this.$message({
              type: 'error',
              message: '登录失败，请检查账号信息'
            })
          })
      }).catch(() => {
        // 用户取消登录
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-container {
  padding: 20px 0;
  .filter-item {
    display: inline-block;
    vertical-align: middle;
    margin-right: 10px;
  }
}

.link-type {
  color: #409eff;
  cursor: pointer;

  &:hover {
    color: #66b1ff;
  }
}
</style>
