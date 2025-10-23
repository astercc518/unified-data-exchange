<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.country"
        placeholder="国家"
        style="width: 200px;"
        class="filter-item"
        clearable
        @keyup.enter.native="handleFilter"
      />
      <el-select
        v-model="listQuery.status"
        placeholder="状态"
        clearable
        style="width: 120px"
        class="filter-item"
      >
        <el-option label="启用" :value="1" />
        <el-option label="禁用" :value="0" />
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handleCreate">
        新建通道
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="ID" prop="id" align="center" width="80" />
      <el-table-column label="通道名称" prop="channel_name" min-width="200" />
      <el-table-column label="协议类型" prop="protocol_type" width="100" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.protocol_type === 'smpp' ? 'warning' : 'primary'" size="mini">
            {{ row.protocol_type ? row.protocol_type.toUpperCase() : 'HTTP' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="网关地址" min-width="250" show-overflow-tooltip>
        <template slot-scope="{row}">
          <span v-if="row.protocol_type === 'smpp'">
            {{ row.smpp_host ? `${row.smpp_host}:${row.smpp_port}` : '-' }}
          </span>
          <span v-else>
            {{ row.gateway_url || '-' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="账号" prop="account" width="150" />
      <el-table-column label="连接状态" width="120" align="center">
        <template slot-scope="{row}">
          <el-tooltip :content="getConnectionStatusText(row)" placement="top">
            <div>
              <el-tag :type="getConnectionStatusType(row)" size="small">
                <i :class="getConnectionStatusIcon(row)" />
                {{ getConnectionStatusLabel(row) }}
              </el-tag>
            </div>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="启用状态" width="100" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
            {{ row.status === 1 ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="成功率" prop="success_rate" width="100">
        <template slot-scope="{row}">
          {{ row.success_rate ? row.success_rate + '%' : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="400" fixed="right">
        <template slot-scope="{row}">
          <el-button 
            :type="row.status === 1 ? 'warning' : 'success'" 
            size="mini" 
            @click="handleToggleStatus(row)"
          >
            {{ row.status === 1 ? '停用' : '启用' }}
          </el-button>
          <el-button type="warning" size="mini" @click="handleCountryPricing(row)">
            国家定价
          </el-button>
          <el-button type="success" size="mini" @click="handleTest(row)">
            测试
          </el-button>
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button type="danger" size="mini" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <!-- 创建/编辑对话框 -->
    <el-dialog :title="dialogStatus==='create'?'创建通道':'编辑通道'" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="120px"
        style="width: 600px; margin-left:50px;"
      >
        <el-form-item label="通道名称" prop="channel_name">
          <el-input v-model="temp.channel_name" placeholder="请输入通道名称" />
          <span style="font-size: 12px; color: #909399">提示：创建后可通过"国家定价"按钮配置多国家定价</span>
        </el-form-item>
        
        <!-- 协议类型 -->
        <el-form-item label="协议类型">
          <el-radio-group v-model="temp.protocol_type" @change="handleProtocolChange">
            <el-radio label="http">HTTP</el-radio>
            <el-radio label="https">HTTPS</el-radio>
            <el-radio label="smpp">SMPP</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- HTTP/HTTPS 配置 -->
        <div v-if="temp.protocol_type === 'http' || temp.protocol_type === 'https'">
          <el-form-item label="HTTP方法">
            <el-radio-group v-model="temp.http_method">
              <el-radio label="GET">GET</el-radio>
              <el-radio label="POST">POST</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label="网关地址" prop="gateway_url">
            <el-input v-model="temp.gateway_url" placeholder="https://api.example.com/send" />
            <span style="font-size: 12px; color: #909399">支持变量：{phone}, {content}, {account}, {password}</span>
          </el-form-item>

          <el-form-item label="请求头">
            <el-input
              v-model="temp.http_headers"
              type="textarea"
              :rows="3"
              placeholder='{"Content-Type": "application/json", "Authorization": "Bearer xxx"}'
            />
            <span style="font-size: 12px; color: #909399">JSON格式，可选</span>
          </el-form-item>

          <el-form-item label="请求模板">
            <el-input
              v-model="temp.request_template"
              type="textarea"
              :rows="4"
              placeholder='{"mobile": "{phone}", "content": "{content}", "account": "{account}"}'
            />
            <span style="font-size: 12px; color: #909399">JSON模板，支持变量：{phone}, {content}, {account}, {password}</span>
          </el-form-item>

          <el-form-item label="成功匹配">
            <el-input
              v-model="temp.response_success_pattern"
              placeholder="status.code=0 或 success=true"
            />
            <span style="font-size: 12px; color: #909399">JSON路径表达式，如: status.code=0</span>
          </el-form-item>
        </div>

        <!-- SMPP 配置 -->
        <div v-if="temp.protocol_type === 'smpp'">
          <el-form-item label="SMPP服务器" prop="smpp_host">
            <el-input v-model="temp.smpp_host" placeholder="smpp.example.com" />
          </el-form-item>

          <el-form-item label="SMPP端口" prop="smpp_port">
            <el-input-number v-model="temp.smpp_port" :min="1" :max="65535" placeholder="2775" />
          </el-form-item>

          <el-form-item label="系统ID" prop="smpp_system_id">
            <el-input v-model="temp.smpp_system_id" placeholder="system_id" />
          </el-form-item>

          <el-form-item label="系统类型">
            <el-input v-model="temp.smpp_system_type" placeholder="CMT" />
            <span style="font-size: 12px; color: #909399">可选，默认为CMT</span>
          </el-form-item>

          <el-form-item label="TON">
            <el-input-number v-model="temp.smpp_ton" :min="0" :max="7" />
            <span style="font-size: 12px; color: #909399; margin-left: 10px">Type of Number (0-7)</span>
          </el-form-item>

          <el-form-item label="NPI">
            <el-input-number v-model="temp.smpp_npi" :min="0" :max="18" />
            <span style="font-size: 12px; color: #909399; margin-left: 10px">Numbering Plan Indicator (0-18)</span>
          </el-form-item>
        </div>

        <!-- 通用配置 -->
        <el-form-item label="账号" prop="account">
          <el-input v-model="temp.account" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="temp.password" type="password" show-password />
        </el-form-item>
        
        <el-form-item label="接入码" prop="extno">
          <el-input v-model="temp.extno" placeholder="如需要" />
          <span style="font-size: 12px; color: #909399">部分平台需要的接入码参数，如SMS57的extno</span>
        </el-form-item>
        <el-form-item label="API密钥">
          <el-input v-model="temp.api_key" placeholder="如需要" />
        </el-form-item>
        <el-form-item label="每日限额">
          <el-input-number v-model="temp.daily_limit" :min="0" placeholder="0表示不限制" style="width: 100%" />
          <span style="font-size: 12px; color: #909399">每日最大发送条数，0表示不限制</span>
        </el-form-item>
        
        <!-- 速率控制配置 -->
        <el-divider content-position="left">速率控制</el-divider>
        
        <el-form-item label="启用速率控制">
          <el-switch
            v-model="temp.rate_limit_enabled"
            active-text="开启"
            inactive-text="关闭"
          />
          <span style="font-size: 12px; color: #909399; margin-left: 10px">防止超频请求，保护通道稳定性</span>
        </el-form-item>
        
        <div v-if="temp.rate_limit_enabled">
          <el-form-item label="每秒限制">
            <el-input-number 
              v-model="temp.rate_limit_per_second" 
              :min="0" 
              :max="1000"
              placeholder="每秒最大请求数" 
              style="width: 100%"
            />
            <span style="font-size: 12px; color: #909399">每秒最大发送请求数，0表示不限制</span>
          </el-form-item>
          
          <el-form-item label="每分钟限制">
            <el-input-number 
              v-model="temp.rate_limit_per_minute" 
              :min="0" 
              :max="60000"
              placeholder="每分钟最大请求数" 
              style="width: 100%"
            />
            <span style="font-size: 12px; color: #909399">每分钟最大发送请求数，0表示不限制</span>
          </el-form-item>
          
          <el-form-item label="每小时限制">
            <el-input-number 
              v-model="temp.rate_limit_per_hour" 
              :min="0" 
              :max="3600000"
              placeholder="每小时最大请求数" 
              style="width: 100%"
            />
            <span style="font-size: 12px; color: #909399">每小时最大发送请求数，0表示不限制</span>
          </el-form-item>
          
          <el-form-item label="最大并发数">
            <el-input-number 
              v-model="temp.rate_limit_concurrent" 
              :min="1" 
              :max="100"
              placeholder="最大并发请求数" 
              style="width: 100%"
            />
            <span style="font-size: 12px; color: #909399">同时发送的最大请求数</span>
          </el-form-item>
          
          <el-alert
            type="info"
            :closable="false"
            show-icon
            style="margin-bottom: 15px"
          >
            <template slot="title">
              <div style="font-size: 12px">
                <strong>速率控制说明：</strong><br>
                • 每秒限制：适用于高频短信发送，防止瞬间流量过大<br>
                • 每分钟/小时：控制总体发送量，防止超出供应商限制<br>
                • 最大并发数：限制同时进行的请求数，保证服务稳定
              </div>
            </template>
          </el-alert>
        </div>
        <el-form-item label="状态">
          <el-radio-group v-model="temp.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确定
        </el-button>
      </div>
    </el-dialog>

    <!-- 国家定价配置对话框 -->
    <channel-country-pricing
      v-if="currentChannelId"
      :visible.sync="pricingDialogVisible"
      :channel-id="currentChannelId"
      :channel-name="currentChannelName"
    />

    <!-- 测试发送对话框 -->
    <el-dialog title="测试发送短信" :visible.sync="testDialogVisible" width="500px">
      <el-form
        ref="testForm"
        :model="testData"
        :rules="testRules"
        label-width="100px"
      >
        <el-alert
          :closable="false"
          type="info"
          style="margin-bottom: 20px"
        >
          <template slot="title">
            <div>通道: {{ currentChannel.channel_name }}</div>
            <div>协议: {{ currentChannel.protocol_type ? currentChannel.protocol_type.toUpperCase() : 'HTTP' }}</div>
          </template>
        </el-alert>
        
        <el-form-item label="手机号码" prop="phone_number">
          <el-input
            v-model="testData.phone_number"
            placeholder="请输入完整手机号（含国家代码）"
          />
          <span style="font-size: 12px; color: #909399">示例：8613800138000（中国）或12025551234（美国）</span>
        </el-form-item>
        
        <el-form-item label="短信内容" prop="content">
          <el-input
            v-model="testData.content"
            type="textarea"
            :rows="4"
            placeholder="请输入短信内容"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="testDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="testSending"
          @click="sendTestSms"
        >
          {{ testSending ? '发送中...' : '发送测试短信' }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getChannels, createChannel, updateChannel, deleteChannel, testSendSms } from '@/api/smsAdmin'
import Pagination from '@/components/Pagination'
import ChannelCountryPricing from '@/components/SmsChannelCountryPricing'

export default {
  name: 'SmsChannels',
  components: { 
    Pagination,
    ChannelCountryPricing
  },
  data() {
    return {
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        country: undefined,
        status: undefined
      },
      temp: {
        id: undefined,
        channel_name: '',
        gateway_url: '',
        account: '',
        password: '',
        protocol_type: 'http',
        smpp_host: '',
        smpp_port: 2775,
        smpp_system_id: '',
        smpp_system_type: 'CMT',
        smpp_ton: 0,
        smpp_npi: 0,
        http_method: 'POST',
        http_headers: '',
        request_template: '',
        response_success_pattern: '',
        extno: '',
        api_key: '',
        daily_limit: 0,
        // 速率控制字段
        rate_limit_enabled: true,
        rate_limit_per_second: 100,
        rate_limit_per_minute: 0,
        rate_limit_per_hour: 0,
        rate_limit_concurrent: 1,
        status: 1
      },
      dialogFormVisible: false,
      dialogStatus: '',
      rules: {
        channel_name: [{ required: true, message: '请输入通道名称', trigger: 'blur' }],
        account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      },
      // 测试发送相关
      testDialogVisible: false,
      testSending: false,
      currentChannel: {},
      testData: {
        phone_number: '',
        content: ''
      },
      testRules: {
        phone_number: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^[0-9]{7,15}$/, message: '请输入有效的手机号', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请输入短信内容', trigger: 'blur' },
          { min: 1, max: 500, message: '内容长度为 1-500 个字符', trigger: 'blur' }
        ]
      },
      // 国家定价相关
      pricingDialogVisible: false,
      currentChannelId: null,
      currentChannelName: ''
    }
  },
  created() {
    this.getList()
  },
  methods: {
    async getList() {
      this.listLoading = true
      try {
        const response = await getChannels(this.listQuery)
        this.list = response.data
        this.total = response.total
      } catch (error) {
        this.$message.error('获取列表失败')
      }
      this.listLoading = false
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        channel_name: '',
        gateway_url: '',
        account: '',
        password: '',
        protocol_type: 'http',
        smpp_host: '',
        smpp_port: 2775,
        smpp_system_id: '',
        smpp_system_type: 'CMT',
        smpp_ton: 0,
        smpp_npi: 0,
        http_method: 'POST',
        http_headers: '',
        request_template: '',
        response_success_pattern: '',
        extno: '',
        api_key: '',
        daily_limit: 0,
        // 速率控制字段
        rate_limit_enabled: true,
        rate_limit_per_second: 100,
        rate_limit_per_minute: 0,
        rate_limit_per_hour: 0,
        rate_limit_concurrent: 1,
        status: 1
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate(async(valid) => {
        if (valid) {
          try {
            await createChannel(this.temp)
            this.dialogFormVisible = false
            this.$message.success('创建成功')
            this.getList()
          } catch (error) {
            this.$message.error('创建失败')
          }
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate(async(valid) => {
        if (valid) {
          try {
            await updateChannel(this.temp.id, this.temp)
            this.dialogFormVisible = false
            this.$message.success('更新成功')
            this.getList()
          } catch (error) {
            this.$message.error('更新失败')
          }
        }
      })
    },
    handleDelete(row) {
      this.$confirm('确定要删除此通道吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          await deleteChannel(row.id)
          this.$message.success('删除成功')
          this.getList()
        } catch (error) {
          this.$message.error('删除失败')
        }
      })
    },
    // 协议变更处理
    handleProtocolChange(protocol) {
      // 根据协议类型设置默认值
      if (protocol === 'smpp') {
        if (!this.temp.smpp_port) {
          this.temp.smpp_port = 2775
        }
        if (!this.temp.smpp_system_type) {
          this.temp.smpp_system_type = 'CMT'
        }
      }
    },
    // 测试发送短信
    handleTest(row) {
      this.currentChannel = Object.assign({}, row)
      this.testData = {
        phone_number: '',
        content: 'This is a test message from ' + row.channel_name
      }
      this.testDialogVisible = true
      this.$nextTick(() => {
        if (this.$refs['testForm']) {
          this.$refs['testForm'].clearValidate()
        }
      })
    },
    // 打开国家定价配置对话框
    handleCountryPricing(row) {
      this.currentChannelId = row.id
      this.currentChannelName = row.channel_name
      this.pricingDialogVisible = true
    },
    // 切换通道启用/停用状态
    handleToggleStatus(row) {
      const action = row.status === 1 ? '停用' : '启用'
      this.$confirm(`确定要${action}该通道吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          const newStatus = row.status === 1 ? 0 : 1
          await updateChannel(row.id, { status: newStatus })
          row.status = newStatus
          this.$message.success(`${action}成功`)
          this.getList() // 刷新列表
        } catch (error) {
          this.$message.error(`${action}失败`)
        }
      }).catch(() => {
        // 用户取消操作
      })
    },
    // 获取连接状态标签
    getConnectionStatusLabel(row) {
      if (row.status === 0) {
        return '已停用'
      }
      
      if (row.protocol_type === 'smpp') {
        // SMPP 通道状态判断逻辑：
        // 1. 如果有 connection_status 字段，使用该字段
        // 2. 如果没有，则根据启用状态推断（启用 = 已连接）
        if (row.connection_status) {
          return row.connection_status === 'connected' ? '已连接' : '未连接'
        }
        // 默认：如果通道已启用，假定为已连接
        return '已连接'
      }
      
      // HTTP/HTTPS 通道
      // 如果有成功率数据，根据成功率判断
      if (row.success_rate !== null && row.success_rate !== undefined) {
        return row.success_rate > 0 ? '正常' : '异常'
      }
      // 如果没有成功率数据，但通道已启用，显示为正常
      return '正常'
    },
    getConnectionStatusType(row) {
      if (row.status === 0) {
        return 'info'
      }
      
      if (row.protocol_type === 'smpp') {
        // 如果有明确的连接状态，使用该状态
        if (row.connection_status) {
          return row.connection_status === 'connected' ? 'success' : 'danger'
        }
        // 默认：启用的通道显示为已连接（绿色）
        return 'success'
      }
      
      // HTTP/HTTPS 通道
      if (row.success_rate !== null && row.success_rate !== undefined) {
        if (row.success_rate >= 95) return 'success'
        if (row.success_rate >= 80) return 'warning'
        if (row.success_rate > 0) return 'warning'
        return 'danger'
      }
      
      // 没有成功率数据，但通道已启用，显示为成功（绿色）
      return 'success'
    },
    getConnectionStatusIcon(row) {
      if (row.status === 0) {
        return 'el-icon-remove-outline'
      }
      
      if (row.protocol_type === 'smpp') {
        // 如果有明确的连接状态
        if (row.connection_status) {
          return row.connection_status === 'connected' ? 'el-icon-link' : 'el-icon-connection'
        }
        // 默认：启用的通道显示已连接图标
        return 'el-icon-link'
      }
      
      // HTTP/HTTPS 通道
      if (row.success_rate !== null && row.success_rate !== undefined) {
        if (row.success_rate >= 95) return 'el-icon-circle-check'
        if (row.success_rate >= 80) return 'el-icon-warning'
        if (row.success_rate > 0) return 'el-icon-warning'
        return 'el-icon-close'
      }
      
      // 没有成功率数据，显示正常图标
      return 'el-icon-circle-check'
    },
    getConnectionStatusText(row) {
      if (row.status === 0) {
        return '通道已停用，不提供服务'
      }
      
      if (row.protocol_type === 'smpp') {
        if (row.connection_status) {
          if (row.connection_status === 'connected') {
            return `SMPP 连接正常 - ${row.smpp_host}:${row.smpp_port}`
          }
          return `SMPP 连接异常 - ${row.smpp_host}:${row.smpp_port}`
        }
        // 默认提示
        return `SMPP 服务器: ${row.smpp_host}:${row.smpp_port} (通道已启用)`
      }
      
      // HTTP/HTTPS 通道
      if (row.success_rate !== null && row.success_rate !== undefined) {
        return `成功率: ${row.success_rate}%`
      }
      
      // 没有发送记录，但通道已启用
      return `通道正常 - ${row.gateway_url || '未配置网关'}`
    },
    // 发送测试短信
    sendTestSms() {
      this.$refs['testForm'].validate(async(valid) => {
        if (!valid) {
          return
        }
        
        this.testSending = true
        try {
          const response = await testSendSms(this.currentChannel.id, this.testData)
          this.$message.success('测试短信发送成功!')
          this.testDialogVisible = false
          
          // 显示发送结果
          this.$notify({
            title: '发送成功',
            message: `消息ID: ${response.data.mid || 'N/A'}`,
            type: 'success',
            duration: 5000
          })
        } catch (error) {
          const errorMsg = error.response?.data?.message || error.message || '测试发送失败'
          this.$message.error(errorMsg)
          
          // 显示详细错误
          this.$notify({
            title: '发送失败',
            message: errorMsg,
            type: 'error',
            duration: 10000
          })
        } finally {
          this.testSending = false
        }
      })
    }
  }
}
</script>

<style scoped>
.filter-container {
  margin-bottom: 20px;
}
</style>
