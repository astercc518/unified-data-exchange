# 数据处理后台任务功能说明

## 功能概述

数据处理模块已完整实现**后台任务队列**功能,支持在处理大量数据时将任务移至后台队列,并可实时查看处理进度。

## 🎯 核心特性

### 1. 双模式处理
- **立即处理模式**: 适用于小量数据,立即执行并返回结果
- **后台队列模式**: 适用于大量数据,创建后台任务异步处理

### 2. 实时进度追踪
- 任务状态: 待处理、处理中、已完成、失败、已取消
- 进度条显示当前处理百分比
- 显示已处理/总记录数

### 3. 自动刷新机制
- 每5秒自动刷新处理中和待处理的任务
- 无需手动刷新即可看到最新进度

## 📁 文件结构

```
前端文件:
├── src/api/dataProcessing.js              # 任务管理API接口
├── src/views/data/processing-tasks.vue    # 任务列表页面
├── src/views/data/processing.vue          # 数据处理页面(已更新)
└── src/router/index.js                    # 路由配置

后端文件:
├── backend/services/taskQueueService.js   # 后台任务队列服务
├── backend/models/DataProcessingTask.js   # 任务模型
├── backend/routes/dataProcessing.js       # 任务API路由
└── backend/server.js                      # 启动队列服务
```

## 🚀 使用流程

### 用户操作流程

#### 1. 数据处理 - 选择处理方式

在数据处理页面执行操作时,现在有两种处理方式可选:

```
┌─────────────────────────────────┐
│   选择要处理的文件              │
│   [✓] file1.txt (100万行)       │
│   [✓] file2.txt (200万行)       │
└─────────────────────────────────┘

处理方式:
 ◉ 立即处理       ○ 移至后台队列
```

#### 2. 立即处理模式
- 点击"开始处理"后,在当前页面等待处理完成
- 处理完成后自动下载结果文件
- 适用于数据量较小的场景(<10万行)

#### 3. 后台队列模式
- 点击"开始处理"后,创建后台任务
- 弹出提示: "已创建N个后台任务,请在'处理任务'页面查看进度"
- 询问是否跳转到任务列表页面
- 任务在后台队列中自动处理

#### 4. 查看任务进度

在 **数据管理 > 处理任务** 页面:

```
┌─────────────────────────────────────────────────────────────┐
│  全部任务: 15   处理中: 2   待处理: 3   已完成: 10         │
└─────────────────────────────────────────────────────────────┘

筛选: [全部] [待处理] [处理中] [已完成] [失败]   [刷新]

┌────────────────────────────────────────────────────────────┐
│ 任务名称              │ 类型    │ 状态   │ 进度          │
├────────────────────────────────────────────────────────────┤
│ 去重: data.txt        │ 去重    │ 处理中 │ ████▌░░░ 45% │
│                       │         │        │ 450K / 1M    │
├────────────────────────────────────────────────────────────┤
│ 增加国码: phones.txt  │ 增国码  │ 待处理 │ -            │
├────────────────────────────────────────────────────────────┤
│ 去除国码: clean.txt   │ 去国码  │ 已完成 │ ██████ 100%  │
│                       │         │        │ [下载]       │
└────────────────────────────────────────────────────────────┘
```

#### 5. 下载结果文件
- 任务完成后,点击"下载"按钮下载结果文件
- 结果文件保存在服务器的 `backend/uploads/processed_data/` 目录

## 🔧 支持的任务类型

当前支持以下6种任务类型通过后台队列处理:

### 1. 增加国码 (add_code)
```javascript
任务参数:
{
  fileId: 123,           // 文件ID
  countryCode: "86"      // 国家代码(不含+号)
}
```

### 2. 去除国码 (remove_code)
```javascript
任务参数:
{
  fileId: 123,           // 文件ID
  countryCode: "86"      // 要去除的国家代码(可选,留空则去除所有)
}
```

### 3. 数据去重 (deduplicate)
```javascript
任务参数:
{
  fileId: 123            // 文件ID
}
```

### 4. 号码生成 (generate) - 预留
```javascript
任务参数:
{
  regionCode: "US",
  numberSegments: ["201", "202"],
  count: 10000
}
```

### 5. 合并文件 (merge) - 预留
```javascript
任务参数:
{
  fileIds: [1, 2, 3]
}
```

### 6. 拆分文件 (split) - 预留
```javascript
任务参数:
{
  fileId: 123,
  linesPerFile: 10000
}
```

## 💻 技术实现

### 后台队列服务

#### 启动和运行机制
```javascript
// backend/server.js
const taskQueueService = require('./services/taskQueueService');
taskQueueService.start(); // 服务器启动时自动启动

// 队列轮询机制
每5秒检查一次待处理任务
  ↓
找到最早的待处理任务
  ↓
更新状态为"处理中"
  ↓
根据任务类型执行相应处理
  ↓
每处理1000条记录更新进度
  ↓
完成后保存结果文件
  ↓
更新状态为"已完成"
  ↓
继续检查下一个任务
```

#### 任务状态流转
```
pending (待处理)
   ↓
processing (处理中)
   ↓
completed (已完成) / failed (失败) / cancelled (已取消)
```

### API接口

#### 创建任务
```javascript
POST /api/data-processing/create-task

Request:
{
  taskType: "deduplicate",      // 任务类型
  taskName: "去重: data.txt",   // 任务名称
  params: {                      // 任务参数
    fileId: 123
  }
}

Response:
{
  success: true,
  message: "任务已提交,正在后台处理",
  data: {
    taskId: 456
  }
}
```

#### 获取任务列表
```javascript
GET /api/data-processing/tasks?page=1&limit=20&status=processing

Response:
{
  success: true,
  data: {
    tasks: [...],
    total: 100
  }
}
```

#### 获取任务详情
```javascript
GET /api/data-processing/tasks/:id

Response:
{
  success: true,
  data: {
    id: 456,
    task_type: "deduplicate",
    status: "processing",
    progress: "45.5",
    processed_records: 455000,
    total_records: 1000000,
    ...
  }
}
```

#### 取消任务
```javascript
POST /api/data-processing/tasks/:id/cancel

Response:
{
  success: true,
  message: "任务已取消"
}

注意: 只能取消状态为pending的任务
```

## 📊 数据库表结构

### data_processing_tasks 表

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | INT | 主键 |
| customer_id | INT | 用户ID |
| customer_name | VARCHAR(100) | 用户名称 |
| task_type | VARCHAR(50) | 任务类型 |
| task_name | VARCHAR(200) | 任务名称 |
| status | VARCHAR(20) | 任务状态 |
| progress | DECIMAL(5,2) | 进度百分比 |
| total_records | INT | 总记录数 |
| processed_records | INT | 已处理记录数 |
| params | TEXT | 任务参数(JSON) |
| result_file | VARCHAR(500) | 结果文件路径 |
| error_message | TEXT | 错误信息 |
| created_at | DATETIME | 创建时间 |
| started_at | DATETIME | 开始时间 |
| completed_at | DATETIME | 完成时间 |

## 🎨 前端组件

### processing-tasks.vue 页面

#### 主要功能
1. **任务统计卡片**: 显示全部/处理中/待处理/已完成任务数量
2. **任务列表**: 展示所有任务及其状态、进度
3. **筛选功能**: 按状态筛选任务
4. **自动刷新**: 有活动任务时每5秒自动刷新
5. **操作功能**: 取消待处理任务、下载完成任务的结果

#### 关键代码片段

**自动刷新机制:**
```javascript
startAutoRefresh() {
  this.autoRefresh = true
  this.refreshTimer = setInterval(() => {
    const hasActiveTasks = this.taskList.some(
      t => t.status === 'processing' || t.status === 'pending'
    )
    if (hasActiveTasks) {
      this.fetchTasks()
    }
  }, 5000)
}
```

**进度条配置:**
```javascript
progressColors: [
  { color: '#f56c6c', percentage: 20 },
  { color: '#e6a23c', percentage: 40 },
  { color: '#5cb87a', percentage: 60 },
  { color: '#1989fa', percentage: 80 },
  { color: '#6f7ad3', percentage: 100 }
]
```

## 🔐 权限控制

### 任务访问权限
- **管理员**: 可查看所有用户的任务
- **代理**: 只能查看自己创建的任务
- **客户**: 只能查看自己创建的任务

### 任务操作权限
- **取消任务**: 只能取消自己创建的且状态为pending的任务
- **下载结果**: 只能下载自己任务的结果文件

## 📝 使用建议

### 何时使用后台队列模式?

**建议使用后台队列的场景:**
- ✅ 数据量超过10万行
- ✅ 需要同时处理多个文件
- ✅ 处理时间预计超过30秒
- ✅ 需要稍后查看结果,不必立即下载

**建议使用立即处理的场景:**
- ✅ 数据量小于5万行
- ✅ 只处理单个小文件
- ✅ 需要立即看到结果
- ✅ 快速验证处理效果

### 性能优化建议

1. **批量创建任务**: 如果需要处理多个大文件,建议一次性创建所有任务,队列会自动依次处理

2. **合理设置任务数量**: 后台队列一次只处理一个任务,避免创建过多任务导致等待时间过长

3. **及时清理已完成任务**: 定期删除或归档已完成的任务记录,保持列表整洁

4. **监控失败任务**: 关注失败的任务,查看错误信息,及时调整参数重试

## 🐛 故障排查

### 常见问题

#### 1. 任务一直停留在"待处理"状态
**可能原因:**
- 后台队列服务未启动
- 前面有其他任务正在处理

**解决方法:**
```bash
# 检查后台服务日志
pm2 logs backend

# 查看是否有"任务队列服务已启动"的日志
# 如果没有,重启后端服务
pm2 restart backend
```

#### 2. 任务处理失败
**可能原因:**
- 文件不存在或已被删除
- 任务参数错误
- 服务器资源不足

**解决方法:**
- 展开任务详情查看错误信息
- 检查文件是否存在
- 使用正确的参数重新创建任务

#### 3. 进度长时间不更新
**可能原因:**
- 处理的数据量非常大
- 服务器负载过高

**解决方法:**
- 等待处理完成(每1000条更新一次进度)
- 检查服务器资源使用情况

## 🔄 维护和监控

### 日志查看
```bash
# 查看后端日志
pm2 logs backend

# 关键日志信息:
# - "任务队列服务已启动"
# - "开始处理任务: [任务ID]"
# - "任务处理完成: [任务ID]"
# - "任务处理失败: [任务ID]"
```

### 数据库监控
```sql
-- 查看当前活动任务
SELECT * FROM data_processing_tasks 
WHERE status IN ('pending', 'processing') 
ORDER BY created_at;

-- 统计任务状态分布
SELECT status, COUNT(*) as count 
FROM data_processing_tasks 
GROUP BY status;

-- 查看失败的任务
SELECT * FROM data_processing_tasks 
WHERE status = 'failed' 
ORDER BY created_at DESC;
```

### 清理旧任务
```sql
-- 删除30天前已完成的任务
DELETE FROM data_processing_tasks 
WHERE status = 'completed' 
AND completed_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

## 📈 未来扩展

### 计划功能
1. ✨ 任务优先级设置
2. ✨ 任务批量取消
3. ✨ 任务执行历史记录
4. ✨ 邮件/短信通知任务完成
5. ✨ 更多任务类型支持(合并、拆分等)
6. ✨ 并发处理多个任务(当前为顺序处理)

## 📞 技术支持

如有问题,请查看:
1. `DATA-PROCESSING-QUEUE-GUIDE.md` - 后台队列服务详细文档
2. 后端日志: `pm2 logs backend`
3. 数据库任务表: `data_processing_tasks`

---

**版本**: 1.0.0  
**更新时间**: 2025-10-20  
**状态**: ✅ 已完成并测试
