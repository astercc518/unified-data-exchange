# 数据处理后台队列功能指南

## 📋 概述

数据处理模块现已支持后台任务队列，可以处理大量数据而不阻塞用户操作。用户可以查看处理中的任务进度和状态。

---

## 🗄️ 数据库表

### data_processing_tasks 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 任务ID |
| customer_id | INT | 客户ID |
| customer_name | VARCHAR(100) | 客户名称 |
| task_type | VARCHAR(50) | 任务类型 |
| task_name | VARCHAR(200) | 任务名称 |
| input_file_id | INT | 输入文件ID |
| input_file_name | VARCHAR(255) | 输入文件名 |
| output_file_id | INT | 输出文件ID |
| output_file_name | VARCHAR(255) | 输出文件名 |
| total_records | INT | 总记录数 |
| processed_records | INT | 已处理记录数 |
| success_records | INT | 成功记录数 |
| failed_records | INT | 失败记录数 |
| status | VARCHAR(20) | 状态 |
| progress | DECIMAL(5,2) | 进度百分比 |
| params | TEXT | 任务参数(JSON) |
| error_message | TEXT | 错误信息 |
| started_at | DATETIME | 开始时间 |
| completed_at | DATETIME | 完成时间 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

---

## 🎯 支持的任务类型

| task_type | 说明 | 参数 |
|-----------|------|------|
| add_code | 添加国家代码 | { fileId, countryCode } |
| remove_code | 移除国家代码 | { fileId } |
| deduplicate | 去重处理 | { fileId } |
| generate | 生成号码 | { countryCode, quantity, startNumber } |
| merge | 合并文件 | { fileIds: [] } |
| split | 拆分文件 | { fileId, linesPerFile } |

---

## 📝 任务状态流转

```
pending (待处理)
    ↓
processing (处理中)
    ├→ completed (已完成)
    ├→ failed (失败)
    └→ cancelled (已取消)
```

---

## 🔧 后端API

### 1. 创建后台处理任务

**接口**: `POST /api/data-processing/create-task`

**请求参数**:
```json
{
  "taskType": "add_code",
  "taskName": "添加印度国家代码",
  "params": {
    "fileId": 123,
    "countryCode": "91"
  }
}
```

**响应**:
```json
{
  "success": true,
  "message": "任务已提交，正在后台处理",
  "data": {
    "taskId": 1,
    "taskName": "添加印度国家代码",
    "status": "pending"
  }
}
```

### 2. 获取任务列表

**接口**: `GET /api/data-processing/tasks`

**查询参数**:
- `page` - 页码
- `limit` - 每页数量
- `status` - 任务状态

**响应**:
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": 1,
        "task_name": "添加印度国家代码",
        "task_type": "add_code",
        "status": "processing",
        "progress": 45.50,
        "total_records": 10000,
        "processed_records": 4550,
        "created_at": "2025-10-20 10:00:00",
        "started_at": "2025-10-20 10:00:05"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20
  }
}
```

### 3. 获取任务详情

**接口**: `GET /api/data-processing/tasks/:id`

**响应**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "customer_id": 5,
    "customer_name": "张三",
    "task_type": "add_code",
    "task_name": "添加印度国家代码",
    "input_file_name": "india_numbers.txt",
    "output_file_name": "加号_india_numbers.txt",
    "total_records": 10000,
    "processed_records": 10000,
    "success_records": 10000,
    "failed_records": 0,
    "status": "completed",
    "progress": 100.00,
    "params": "{\"fileId\":123,\"countryCode\":\"91\"}",
    "started_at": "2025-10-20 10:00:05",
    "completed_at": "2025-10-20 10:02:30",
    "created_at": "2025-10-20 10:00:00"
  }
}
```

### 4. 取消任务

**接口**: `POST /api/data-processing/tasks/:id/cancel`

**响应**:
```json
{
  "success": true,
  "message": "任务已取消"
}
```

---

## 🎨 前端实现建议

### 1. 任务列表页面

创建文件: `src/views/data/processing-tasks.vue`

```vue
<template>
  <div class="processing-tasks-container">
    <!-- 任务状态标签 -->
    <el-tabs v-model="activeTab" @tab-click="handleTabChange">
      <el-tab-pane label="处理中" name="processing">
        <span slot="label">
          <i class="el-icon-loading" />
          处理中 ({{ processingCount }})
        </span>
      </el-tab-pane>
      <el-tab-pane label="待处理" name="pending">
        <span slot="label">
          <i class="el-icon-time" />
          待处理 ({{ pendingCount }})
        </span>
      </el-tab-pane>
      <el-tab-pane label="已完成" name="completed">
        <span slot="label">
          <i class="el-icon-success" />
          已完成 ({{ completedCount }})
        </span>
      </el-tab-pane>
      <el-tab-pane label="失败" name="failed">
        <span slot="label">
          <i class="el-icon-error" />
          失败 ({{ failedCount }})
        </span>
      </el-tab-pane>
    </el-tabs>

    <!-- 任务列表 -->
    <el-table :data="taskList" border>
      <el-table-column prop="task_name" label="任务名称" width="200" />
      <el-table-column label="类型" width="120">
        <template slot-scope="{row}">
          {{ getTaskTypeText(row.task_type) }}
        </template>
      </el-table-column>
      <el-table-column label="进度" width="200">
        <template slot-scope="{row}">
          <el-progress
            :percentage="parseFloat(row.progress || 0)"
            :status="getProgressStatus(row.status)"
          />
          <div style="font-size: 12px; color: #909399">
            {{ row.processed_records }} / {{ row.total_records }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template slot-scope="{row}">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="160">
        <template slot-scope="{row}">
          {{ formatTime(row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template slot-scope="{row}">
          <el-button
            v-if="row.status === 'pending'"
            type="danger"
            size="mini"
            @click="handleCancel(row)"
          >
            取消
          </el-button>
          <el-button
            v-if="row.status === 'completed'"
            type="primary"
            size="mini"
            @click="handleDownload(row)"
          >
            下载结果
          </el-button>
          <el-button
            type="text"
            size="mini"
            @click="handleViewDetail(row)"
          >
            详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      :total="total"
      :page.sync="queryParams.page"
      :limit.sync="queryParams.limit"
      @pagination="getTaskList"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeTab: 'processing',
      taskList: [],
      total: 0,
      processingCount: 0,
      pendingCount: 0,
      completedCount: 0,
      failedCount: 0,
      queryParams: {
        page: 1,
        limit: 20,
        status: 'processing'
      },
      refreshTimer: null
    }
  },
  created() {
    this.getTaskList()
    this.getTaskCounts()
    this.startAutoRefresh()
  },
  beforeDestroy() {
    this.stopAutoRefresh()
  },
  methods: {
    async getTaskList() {
      // 调用API获取任务列表
      const response = await this.$axios.get('/api/data-processing/tasks', {
        params: this.queryParams
      })
      this.taskList = response.data.data.tasks
      this.total = response.data.data.total
    },
    async getTaskCounts() {
      // 获取各状态任务数量
      const statuses = ['processing', 'pending', 'completed', 'failed']
      for (const status of statuses) {
        const response = await this.$axios.get('/api/data-processing/tasks', {
          params: { status, limit: 1 }
        })
        this[`${status}Count`] = response.data.data.total
      }
    },
    handleTabChange(tab) {
      this.queryParams.status = tab.name
      this.queryParams.page = 1
      this.getTaskList()
    },
    startAutoRefresh() {
      // 处理中的任务每5秒刷新一次
      this.refreshTimer = setInterval(() => {
        if (this.activeTab === 'processing' || this.activeTab === 'pending') {
          this.getTaskList()
          this.getTaskCounts()
        }
      }, 5000)
    },
    stopAutoRefresh() {
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer)
      }
    },
    getTaskTypeText(type) {
      const types = {
        add_code: '添加号码',
        remove_code: '去除号码',
        deduplicate: '去重',
        generate: '生成号码',
        merge: '合并文件',
        split: '拆分文件'
      }
      return types[type] || type
    },
    getStatusType(status) {
      const types = {
        pending: 'info',
        processing: 'warning',
        completed: 'success',
        failed: 'danger',
        cancelled: 'info'
      }
      return types[status]
    },
    getStatusText(status) {
      const texts = {
        pending: '待处理',
        processing: '处理中',
        completed: '已完成',
        failed: '失败',
        cancelled: '已取消'
      }
      return texts[status]
    },
    getProgressStatus(status) {
      if (status === 'completed') return 'success'
      if (status === 'failed') return 'exception'
      return null
    },
    formatTime(time) {
      if (!time) return '-'
      return new Date(time).toLocaleString('zh-CN')
    },
    async handleCancel(row) {
      await this.$confirm('确定要取消此任务吗？', '提示', {
        type: 'warning'
      })
      await this.$axios.post(`/api/data-processing/tasks/${row.id}/cancel`)
      this.$message.success('任务已取消')
      this.getTaskList()
      this.getTaskCounts()
    },
    handleDownload(row) {
      // 下载结果文件
      window.open(`/api/data-processing/download/${row.output_file_id}`)
    },
    handleViewDetail(row) {
      // 查看详情
      this.$router.push(`/data/processing-task/${row.id}`)
    }
  }
}
</script>
```

### 2. 修改数据处理页面

在现有的数据处理功能中，将同步处理改为创建后台任务：

```javascript
// 原来的同步处理
await this.$axios.post('/api/data-processing/add-code', { fileId, countryCode })

// 改为创建后台任务
await this.$axios.post('/api/data-processing/create-task', {
  taskType: 'add_code',
  taskName: `添加国家代码 +${countryCode}`,
  params: { fileId, countryCode }
})

this.$message.success('任务已提交到后台处理队列，请在"处理任务"中查看进度')
this.$router.push('/data/processing-tasks')
```

---

## 🚀 使用流程

### 用户操作流程

1. **选择处理功能**
   - 用户在数据处理页面选择功能（如"添加国家代码"）
   - 填写参数（文件、国家代码等）
   - 点击"提交处理"

2. **任务提交**
   - 系统创建后台任务记录
   - 返回任务ID
   - 跳转到任务列表页面

3. **查看进度**
   - 任务列表实时显示处理进度
   - 每5秒自动刷新
   - 显示已处理数量和百分比

4. **获取结果**
   - 任务完成后状态变为"已完成"
   - 点击"下载结果"获取处理后的文件
   - 结果文件自动保存到客户数据文件列表

### 系统处理流程

1. **任务创建**
   ```
   用户提交 → 创建任务记录(pending) → 返回任务ID
   ```

2. **任务处理**
   ```
   队列服务检测 → 获取pending任务 → 更新为processing
       ↓
   开始处理 → 每1000条更新进度 → 完成处理
       ↓
   保存结果文件 → 更新为completed → 记录文件ID
   ```

3. **进度更新**
   ```
   每处理1000条记录:
   - processed_records += 1000
   - progress = (processed / total) * 100
   - 更新数据库
   ```

---

## 📊 性能优化

### 1. 批量更新进度
```javascript
// 每1000条更新一次，避免频繁数据库操作
if (processedCount % 1000 === 0) {
  await task.update({
    processed_records: processedCount,
    progress: ((processedCount / total) * 100).toFixed(2)
  })
}
```

### 2. 异步处理
```javascript
// 任务提交后立即返回
// 实际处理在后台队列中进行
// 不阻塞用户操作
```

### 3. 自动重试
```javascript
// 失败任务可以手动重试
// 或配置自动重试机制
```

---

## ⚡ 优势

1. **不阻塞操作** - 用户提交任务后可立即进行其他操作
2. **进度可见** - 实时查看处理进度和状态
3. **批量处理** - 支持大量数据处理（百万级）
4. **错误追踪** - 失败任务记录详细错误信息
5. **资源优化** - 一次只处理一个任务，避免服务器过载

---

## ✅ 已实现功能

- [x] 数据库表创建
- [x] 任务模型定义
- [x] 后台队列服务
- [x] 创建任务API
- [x] 查询任务API
- [x] 取消任务API
- [x] 任务详情API
- [x] 6种任务类型处理逻辑
- [x] 进度实时更新
- [x] 自动轮询队列
- [x] 错误处理和日志

---

## 🎉 总结

数据处理后台队列功能已完整实现！用户现在可以:
- ✅ 提交大量数据处理任务到后台
- ✅ 实时查看处理进度
- ✅ 管理待处理任务
- ✅ 下载处理结果
- ✅ 查看任务历史

系统会自动处理队列中的任务，每5秒检查一次新任务，确保所有任务都能被及时处理。
