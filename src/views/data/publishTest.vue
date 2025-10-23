<template>
  <div class="publish-test-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>发布流程测试工具</span>
        <el-button style="float: right; padding: 3px 0" type="text" @click="resetAllData">重置所有数据</el-button>
      </div>

      <!-- 测试步骤指引 -->
      <el-steps :active="currentStep" align-center>
        <el-step title="数据上传" description="上传数据到数据列表" />
        <el-step title="数据列表" description="查看待发布数据" />
        <el-step title="发布数据" description="发布到资源中心" />
        <el-step title="验证结果" description="检查资源中心" />
      </el-steps>

      <!-- 快速测试按钮 -->
      <div class="test-actions" style="margin: 20px 0;">
        <el-button type="primary" @click="simulateUpload">模拟数据上传</el-button>
        <el-button type="success" :disabled="!hasUnpublishedData" @click="simulatePublish">模拟数据发布</el-button>
        <el-button type="info" @click="refreshData">刷新数据状态</el-button>
      </div>

      <!-- 数据状态展示 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card>
            <div slot="header">
              <span>数据列表状态 (dataListData)</span>
              <el-tag :type="dataListCount > 0 ? 'success' : 'info'" style="float: right;">
                {{ dataListCount }} 条数据
              </el-tag>
            </div>
            <div v-if="dataListCount === 0" class="empty-data">暂无待发布数据</div>
            <div v-else>
              <el-table :data="dataListData.slice(0, 3)" size="mini" style="width: 100%">
                <el-table-column prop="title" label="标题" width="120" />
                <el-table-column prop="publishStatus" label="状态" width="80">
                  <template slot-scope="scope">
                    <el-tag :type="getStatusType(scope.row.publishStatus)" size="mini">
                      {{ getStatusText(scope.row.publishStatus) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="uploadTime" label="上传时间" width="120">
                  <template slot-scope="scope">
                    {{ formatTime(scope.row.uploadTime) }}
                  </template>
                </el-table-column>
              </el-table>
              <div v-if="dataListCount > 3" style="text-align: center; margin-top: 10px;">
                <el-tag type="info" size="mini">还有 {{ dataListCount - 3 }} 条数据...</el-tag>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card>
            <div slot="header">
              <span>资源中心状态 (dataList)</span>
              <el-tag :type="resourceCount > 0 ? 'success' : 'info'" style="float: right;">
                {{ resourceCount }} 条数据
              </el-tag>
            </div>
            <div v-if="resourceCount === 0" class="empty-data">暂无已发布数据</div>
            <div v-else>
              <el-table :data="resourceData.slice(0, 3)" size="mini" style="width: 100%">
                <el-table-column prop="title" label="标题" width="120" />
                <el-table-column prop="status" label="状态" width="80">
                  <template slot-scope="scope">
                    <el-tag type="success" size="mini">已发布</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="publishTime" label="发布时间" width="120">
                  <template slot-scope="scope">
                    {{ formatTime(scope.row.publishTime) }}
                  </template>
                </el-table-column>
              </el-table>
              <div v-if="resourceCount > 3" style="text-align: center; margin-top: 10px;">
                <el-tag type="info" size="mini">还有 {{ resourceCount - 3 }} 条数据...</el-tag>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 测试日志 -->
      <el-card style="margin-top: 20px;">
        <div slot="header">
          <span>测试日志</span>
          <el-button style="float: right; padding: 3px 0" type="text" @click="clearLogs">清除日志</el-button>
        </div>
        <div class="test-logs">
          <div v-for="(log, index) in testLogs" :key="index" class="log-item">
            <el-tag :type="log.type" size="mini">{{ log.time }}</el-tag>
            <span style="margin-left: 10px;">{{ log.message }}</span>
          </div>
          <div v-if="testLogs.length === 0" class="empty-data">暂无测试日志</div>
        </div>
      </el-card>

      <!-- 流程验证结果 -->
      <el-card style="margin-top: 20px;">
        <div slot="header">流程验证结果</div>
        <div class="validation-results">
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="validation-item">
                <i :class="uploadValidation.icon" :style="{color: uploadValidation.color}" />
                <span>{{ uploadValidation.text }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="validation-item">
                <i :class="publishValidation.icon" :style="{color: publishValidation.color}" />
                <span>{{ publishValidation.text }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="validation-item">
                <i :class="syncValidation.icon" :style="{color: syncValidation.color}" />
                <span>{{ syncValidation.text }}</span>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'PublishTest',
  data() {
    return {
      currentStep: 0,
      dataListData: [],
      resourceData: [],
      testLogs: []
    }
  },
  computed: {
    dataListCount() {
      return this.dataListData.length
    },
    resourceCount() {
      return this.resourceData.length
    },
    hasUnpublishedData() {
      return this.dataListData.some(item => item.publishStatus === 'pending')
    },
    uploadValidation() {
      const hasUploadData = this.dataListCount > 0
      return {
        icon: hasUploadData ? 'el-icon-success' : 'el-icon-warning',
        color: hasUploadData ? '#67C23A' : '#E6A23C',
        text: hasUploadData ? '上传功能正常' : '缺少上传数据'
      }
    },
    publishValidation() {
      const hasPublishedData = this.resourceCount > 0
      return {
        icon: hasPublishedData ? 'el-icon-success' : 'el-icon-warning',
        color: hasPublishedData ? '#67C23A' : '#E6A23C',
        text: hasPublishedData ? '发布功能正常' : '缺少发布数据'
      }
    },
    syncValidation() {
      // 检查数据同步是否正确
      const publishedInDataList = this.dataListData.filter(item => item.publishStatus === 'published')
      const isSync = publishedInDataList.length === this.resourceCount
      return {
        icon: isSync ? 'el-icon-success' : 'el-icon-error',
        color: isSync ? '#67C23A' : '#F56C6C',
        text: isSync ? '数据同步正常' : '数据同步异常'
      }
    }
  },
  mounted() {
    this.refreshData()
    this.addLog('info', '测试工具已加载')
  },
  methods: {
    refreshData() {
      // 从localStorage读取数据
      const dataListData = localStorage.getItem('dataListData')
      const resourceData = localStorage.getItem('dataList')

      this.dataListData = dataListData ? JSON.parse(dataListData) : []
      this.resourceData = resourceData ? JSON.parse(resourceData) : []

      this.addLog('info', `刷新数据: 数据列表${this.dataListCount}条, 资源中心${this.resourceCount}条`)
    },

    simulateUpload() {
      const testData = {
        id: 'test_' + Date.now(),
        title: '测试数据_' + new Date().toLocaleTimeString(),
        description: '这是一条测试数据',
        category: '数据集',
        format: 'CSV',
        size: '2.5MB',
        uploadTime: Date.now(),
        publishTime: null,
        publishStatus: 'pending',
        status: 'uploaded',
        tags: ['测试', '数据'],
        price: 100
      }

      // 添加到数据列表
      this.dataListData.push(testData)
      localStorage.setItem('dataListData', JSON.stringify(this.dataListData))

      this.addLog('success', `模拟上传成功: ${testData.title}`)
      this.currentStep = Math.max(this.currentStep, 1)
    },

    simulatePublish() {
      const pendingData = this.dataListData.filter(item => item.publishStatus === 'pending')
      if (pendingData.length === 0) {
        this.$message.warning('没有待发布的数据')
        return
      }

      const publishTime = Date.now()

      // 更新数据列表中的发布状态
      pendingData.forEach(item => {
        item.publishStatus = 'published'
        item.publishTime = publishTime
      })
      localStorage.setItem('dataListData', JSON.stringify(this.dataListData))

      // 添加到资源中心
      const newResourceData = pendingData.map(item => ({
        ...item,
        status: 'available'
      }))
      this.resourceData = this.resourceData.concat(newResourceData)
      localStorage.setItem('dataList', JSON.stringify(this.resourceData))

      this.addLog('success', `模拟发布成功: ${pendingData.length}条数据`)
      this.currentStep = Math.max(this.currentStep, 3)
    },

    resetAllData() {
      this.$confirm('确认重置所有测试数据？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        localStorage.removeItem('dataListData')
        localStorage.removeItem('dataList')
        this.refreshData()
        this.clearLogs()
        this.currentStep = 0
        this.$message.success('数据已重置')
      })
    },

    addLog(type, message) {
      const time = new Date().toLocaleTimeString()
      this.testLogs.unshift({ type, time, message })
      if (this.testLogs.length > 20) {
        this.testLogs = this.testLogs.slice(0, 20)
      }
    },

    clearLogs() {
      this.testLogs = []
    },

    getStatusType(status) {
      const typeMap = {
        'pending': 'warning',
        'published': 'success',
        'unpublished': 'info'
      }
      return typeMap[status] || 'info'
    },

    getStatusText(status) {
      const textMap = {
        'pending': '待发布',
        'published': '已发布',
        'unpublished': '已下线'
      }
      return textMap[status] || '未知'
    },

    formatTime(timestamp) {
      if (!timestamp) return '-'
      return new Date(timestamp).toLocaleString()
    }
  }
}
</script>

<style scoped>
.publish-test-container {
  padding: 20px;
}

.test-actions {
  text-align: center;
}

.empty-data {
  text-align: center;
  color: #909399;
  padding: 20px;
}

.test-logs {
  max-height: 200px;
  overflow-y: auto;
}

.log-item {
  margin-bottom: 8px;
  padding: 5px;
  border-left: 3px solid #DCDFE6;
  padding-left: 10px;
}

.validation-results {
  padding: 20px;
}

.validation-item {
  text-align: center;
  font-size: 14px;
}

.validation-item i {
  font-size: 24px;
  display: block;
  margin-bottom: 8px;
}
</style><template>
  <div class="publish-test-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>发布流程测试工具</span>
        <el-button style="float: right; padding: 3px 0" type="text" @click="resetAllData">重置所有数据</el-button>
      </div>

      <!-- 测试步骤指引 -->
      <el-steps :active="currentStep" align-center>
        <el-step title="数据上传" description="上传数据到数据列表"></el-step>
        <el-step title="数据列表" description="查看待发布数据"></el-step>
        <el-step title="发布数据" description="发布到资源中心"></el-step>
        <el-step title="验证结果" description="检查资源中心"></el-step>
      </el-steps>

      <!-- 快速测试按钮 -->
      <div class="test-actions" style="margin: 20px 0;">
        <el-button type="primary" @click="simulateUpload">模拟数据上传</el-button>
        <el-button type="success" @click="simulatePublish" :disabled="!hasUnpublishedData">模拟数据发布</el-button>
        <el-button type="info" @click="refreshData">刷新数据状态</el-button>
      </div>

      <!-- 数据状态展示 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card>
            <div slot="header">
              <span>数据列表状态 (dataListData)</span>
              <el-tag :type="dataListCount > 0 ? 'success' : 'info'" style="float: right;">
                {{ dataListCount }} 条数据
              </el-tag>
            </div>
            <div v-if="dataListCount === 0" class="empty-data">暂无待发布数据</div>
            <div v-else>
              <el-table :data="dataListData.slice(0, 3)" size="mini" style="width: 100%">
                <el-table-column prop="title" label="标题" width="120"></el-table-column>
                <el-table-column prop="publishStatus" label="状态" width="80">
                  <template slot-scope="scope">
                    <el-tag :type="getStatusType(scope.row.publishStatus)" size="mini">
                      {{ getStatusText(scope.row.publishStatus) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="uploadTime" label="上传时间" width="120">
                  <template slot-scope="scope">
                    {{ formatTime(scope.row.uploadTime) }}
                  </template>
                </el-table-column>
              </el-table>
              <div v-if="dataListCount > 3" style="text-align: center; margin-top: 10px;">
                <el-tag type="info" size="mini">还有 {{ dataListCount - 3 }} 条数据...</el-tag>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card>
            <div slot="header">
              <span>资源中心状态 (dataList)</span>
              <el-tag :type="resourceCount > 0 ? 'success' : 'info'" style="float: right;">
                {{ resourceCount }} 条数据
              </el-tag>
            </div>
            <div v-if="resourceCount === 0" class="empty-data">暂无已发布数据</div>
            <div v-else>
              <el-table :data="resourceData.slice(0, 3)" size="mini" style="width: 100%">
                <el-table-column prop="title" label="标题" width="120"></el-table-column>
                <el-table-column prop="status" label="状态" width="80">
                  <template slot-scope="scope">
                    <el-tag type="success" size="mini">已发布</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="publishTime" label="发布时间" width="120">
                  <template slot-scope="scope">
                    {{ formatTime(scope.row.publishTime) }}
                  </template>
                </el-table-column>
              </el-table>
              <div v-if="resourceCount > 3" style="text-align: center; margin-top: 10px;">
                <el-tag type="info" size="mini">还有 {{ resourceCount - 3 }} 条数据...</el-tag>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 测试日志 -->
      <el-card style="margin-top: 20px;">
        <div slot="header">
          <span>测试日志</span>
          <el-button style="float: right; padding: 3px 0" type="text" @click="clearLogs">清除日志</el-button>
        </div>
        <div class="test-logs">
          <div v-for="(log, index) in testLogs" :key="index" class="log-item">
            <el-tag :type="log.type" size="mini">{{ log.time }}</el-tag>
            <span style="margin-left: 10px;">{{ log.message }}</span>
          </div>
          <div v-if="testLogs.length === 0" class="empty-data">暂无测试日志</div>
        </div>
      </el-card>

      <!-- 流程验证结果 -->
      <el-card style="margin-top: 20px;">
        <div slot="header">流程验证结果</div>
        <div class="validation-results">
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="validation-item">
                <i :class="uploadValidation.icon" :style="{color: uploadValidation.color}"></i>
                <span>{{ uploadValidation.text }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="validation-item">
                <i :class="publishValidation.icon" :style="{color: publishValidation.color}"></i>
                <span>{{ publishValidation.text }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="validation-item">
                <i :class="syncValidation.icon" :style="{color: syncValidation.color}"></i>
                <span>{{ syncValidation.text }}</span>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'PublishTest',
  data() {
    return {
      currentStep: 0,
      dataListData: [],
      resourceData: [],
      testLogs: []
    }
  },
  computed: {
    dataListCount() {
      return this.dataListData.length
    },
    resourceCount() {
      return this.resourceData.length
    },
    hasUnpublishedData() {
      return this.dataListData.some(item => item.publishStatus === 'pending')
    },
    uploadValidation() {
      const hasUploadData = this.dataListCount > 0
      return {
        icon: hasUploadData ? 'el-icon-success' : 'el-icon-warning',
        color: hasUploadData ? '#67C23A' : '#E6A23C',
        text: hasUploadData ? '上传功能正常' : '缺少上传数据'
      }
    },
    publishValidation() {
      const hasPublishedData = this.resourceCount > 0
      return {
        icon: hasPublishedData ? 'el-icon-success' : 'el-icon-warning',
        color: hasPublishedData ? '#67C23A' : '#E6A23C',
        text: hasPublishedData ? '发布功能正常' : '缺少发布数据'
      }
    },
    syncValidation() {
      // 检查数据同步是否正确
      const publishedInDataList = this.dataListData.filter(item => item.publishStatus === 'published')
      const isSync = publishedInDataList.length === this.resourceCount
      return {
        icon: isSync ? 'el-icon-success' : 'el-icon-error',
        color: isSync ? '#67C23A' : '#F56C6C',
        text: isSync ? '数据同步正常' : '数据同步异常'
      }
    }
  },
  mounted() {
    this.refreshData()
    this.addLog('info', '测试工具已加载')
  },
  methods: {
    refreshData() {
      // 从localStorage读取数据
      const dataListData = localStorage.getItem('dataListData')
      const resourceData = localStorage.getItem('dataList')

      this.dataListData = dataListData ? JSON.parse(dataListData) : []
      this.resourceData = resourceData ? JSON.parse(resourceData) : []

      this.addLog('info', `刷新数据: 数据列表${this.dataListCount}条, 资源中心${this.resourceCount}条`)
    },

    simulateUpload() {
      const testData = {
        id: 'test_' + Date.now(),
        title: '测试数据_' + new Date().toLocaleTimeString(),
        description: '这是一条测试数据',
        category: '数据集',
        format: 'CSV',
        size: '2.5MB',
        uploadTime: Date.now(),
        publishTime: null,
        publishStatus: 'pending',
        status: 'uploaded',
        tags: ['测试', '数据'],
        price: 100
      }

      // 添加到数据列表
      this.dataListData.push(testData)
      localStorage.setItem('dataListData', JSON.stringify(this.dataListData))

      this.addLog('success', `模拟上传成功: ${testData.title}`)
      this.currentStep = Math.max(this.currentStep, 1)
    },

    simulatePublish() {
      const pendingData = this.dataListData.filter(item => item.publishStatus === 'pending')
      if (pendingData.length === 0) {
        this.$message.warning('没有待发布的数据')
        return
      }

      const publishTime = Date.now()

      // 更新数据列表中的发布状态
      pendingData.forEach(item => {
        item.publishStatus = 'published'
        item.publishTime = publishTime
      })
      localStorage.setItem('dataListData', JSON.stringify(this.dataListData))

      // 添加到资源中心
      const newResourceData = pendingData.map(item => ({
        ...item,
        status: 'available'
      }))
      this.resourceData = this.resourceData.concat(newResourceData)
      localStorage.setItem('dataList', JSON.stringify(this.resourceData))

      this.addLog('success', `模拟发布成功: ${pendingData.length}条数据`)
      this.currentStep = Math.max(this.currentStep, 3)
    },

    resetAllData() {
      this.$confirm('确认重置所有测试数据？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        localStorage.removeItem('dataListData')
        localStorage.removeItem('dataList')
        this.refreshData()
        this.clearLogs()
        this.currentStep = 0
        this.$message.success('数据已重置')
      })
    },

    addLog(type, message) {
      const time = new Date().toLocaleTimeString()
      this.testLogs.unshift({ type, time, message })
      if (this.testLogs.length > 20) {
        this.testLogs = this.testLogs.slice(0, 20)
      }
    },

    clearLogs() {
      this.testLogs = []
    },

    getStatusType(status) {
      const typeMap = {
        'pending': 'warning',
        'published': 'success',
        'unpublished': 'info'
      }
      return typeMap[status] || 'info'
    },

    getStatusText(status) {
      const textMap = {
        'pending': '待发布',
        'published': '已发布',
        'unpublished': '已下线'
      }
      return textMap[status] || '未知'
    },

    formatTime(timestamp) {
      if (!timestamp) return '-'
      return new Date(timestamp).toLocaleString()
    }
  }
}
</script>

<style scoped>
.publish-test-container {
  padding: 20px;
}

.test-actions {
  text-align: center;
}

.empty-data {
  text-align: center;
  color: #909399;
  padding: 20px;
}

.test-logs {
  max-height: 200px;
  overflow-y: auto;
}

.log-item {
  margin-bottom: 8px;
  padding: 5px;
  border-left: 3px solid #DCDFE6;
  padding-left: 10px;
}

.validation-results {
  padding: 20px;
}

.validation-item {
  text-align: center;
  font-size: 14px;
}

.validation-item i {
  font-size: 24px;
  display: block;
  margin-bottom: 8px;
}
</style>
