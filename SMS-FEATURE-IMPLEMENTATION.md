# 短信功能实施文档

## 📋 项目概述

为系统添加完整的短信功能模块，支持管理员配置短信通道和客户发送短信。

---

## ✅ 已完成的工作

### 1. 数据库模型（4个）

#### ✅ SmsChannel - 短信通道
- 文件: `/home/vue-element-admin/backend/models/SmsChannel.js`
- 字段: 通道名称、国家、价格、字符数、网关地址、账号、密码等
- 功能: 存储SMS57等第三方平台对接配置

#### ✅ SmsTask - 短信任务
- 文件: `/home/vue-element-admin/backend/models/SmsTask.js`
- 字段: 任务名称、用户ID、通道ID、内容、发送方式、状态等
- 功能: 管理短信群发任务

#### ✅ SmsRecord - 发送记录
- 文件: `/home/vue-element-admin/backend/models/SmsRecord.js`
- 字段: 手机号、内容、状态、费用、响应信息等
- 功能: 记录每条短信的发送详情

#### ✅ SmsStats - 统计数据
- 文件: `/home/vue-element-admin/backend/models/SmsStats.js`
- 字段: 统计日期、发送数、成功数、失败数、费用等
- 功能: 缓存统计数据提升查询性能

---

### 2. 后端路由（2个）

#### ✅ smsAdmin.js - 管理员路由
- 文件: `/home/vue-element-admin/backend/routes/smsAdmin.js`
- 接口:
  - `GET /channels` - 获取通道列表
  - `POST /channels` - 创建通道
  - `PUT /channels/:id` - 更新通道
  - `DELETE /channels/:id` - 删除通道
  - `GET /records` - 获取发送记录（全局）
  - `GET /statistics` - 获取统计数据（全局）
  - `GET /countries` - 获取国家列表

#### ✅ smsCustomer.js - 客户路由
- 文件: `/home/vue-element-admin/backend/routes/smsCustomer.js`
- 接口:
  - `GET /channels/:country` - 获取指定国家的可用通道
  - `POST /tasks` - 创建短信任务
  - `GET /tasks` - 获取我的任务列表
  - `GET /tasks/:id` - 获取任务详情
  - `POST /tasks/:id/cancel` - 取消任务
  - `GET /records` - 获取我的发送记录
  - `GET /statistics` - 获取我的统计数据
  - `GET /purchased-data` - 获取已购买的数据

---

## 📂 需要创建的前端文件

### 前端API接口（2个文件）

#### 1. `/home/vue-element-admin/src/api/smsAdmin.js`
```javascript
import request from '@/utils/request'

// 通道管理
export function getChannels(params) {
  return request({ url: '/api/sms/admin/channels', method: 'get', params })
}

export function createChannel(data) {
  return request({ url: '/api/sms/admin/channels', method: 'post', data })
}

export function updateChannel(id, data) {
  return request({ url: `/api/sms/admin/channels/${id}`, method: 'put', data })
}

export function deleteChannel(id) {
  return request({ url: `/api/sms/admin/channels/${id}`, method: 'delete' })
}

// 发送记录
export function getSmsRecords(params) {
  return request({ url: '/api/sms/admin/records', method: 'get', params })
}

// 统计数据
export function getSmsStatistics(params) {
  return request({ url: '/api/sms/admin/statistics', method: 'get', params })
}

// 国家列表
export function getCountries() {
  return request({ url: '/api/sms/admin/countries', method: 'get' })
}
```

#### 2. `/home/vue-element-admin/src/api/smsCustomer.js`
```javascript
import request from '@/utils/request'

// 获取可用通道
export function getAvailableChannels(country) {
  return request({ url: `/api/sms/customer/channels/${country}`, method: 'get' })
}

// 任务管理
export function createTask(data) {
  return request({ url: '/api/sms/customer/tasks', method: 'post', data })
}

export function getMyTasks(params) {
  return request({ url: '/api/sms/customer/tasks', method: 'get', params })
}

export function getTaskDetail(id) {
  return request({ url: `/api/sms/customer/tasks/${id}`, method: 'get' })
}

export function cancelTask(id) {
  return request({ url: `/api/sms/customer/tasks/${id}/cancel`, method: 'post' })
}

// 发送记录
export function getMyRecords(params) {
  return request({ url: '/api/sms/customer/records', method: 'get', params })
}

// 统计数据
export function getMyStatistics(params) {
  return request({ url: '/api/sms/customer/statistics', method: 'get', params })
}

// 已购买数据
export function getPurchasedData(params) {
  return request({ url: '/api/sms/customer/purchased-data', method: 'get', params })
}
```

---

### 管理员页面（5个文件）

#### 1. `/home/vue-element-admin/src/views/sms/admin/channels.vue`
- 功能: 通道配置管理
- 包含: 通道列表、新增/编辑通道对话框
- 字段: 通道名称、国家、价格、短信字符、网关地址、账号、密码

#### 2. `/home/vue-element-admin/src/views/sms/admin/records.vue`
- 功能: 查看所有短信发送记录
- 包含: 记录列表、筛选、导出

#### 3. `/home/vue-element-admin/src/views/sms/admin/statistics.vue`
- 功能: 查看统计数据
- 包含: 图表展示、数据报表

---

### 客户页面（5个文件）

#### 1. `/home/vue-element-admin/src/views/sms/customer/send.vue`
- 功能: 短信群发
- 包含: 
  - 选择国家（同步通道）
  - 输入短信内容（自动检测字符）
  - 选择号码（从已购买数据或手动输入）
  - 选择发送方式（立即/定时）

#### 2. `/home/vue-element-admin/src/views/sms/customer/tasks.vue`
- 功能: 任务管理
- 包含: 正在发送、发送完成的任务列表

#### 3. `/home/vue-element-admin/src/views/sms/customer/records.vue`
- 功能: 下行日志（发送记录）
- 包含: 发送详情、状态查询

#### 4. `/home/vue-element-admin/src/views/sms/customer/statistics.vue`
- 功能: 数据统计
- 包含: 统计图表、成功率分析

---

## 🔧 需要配置的路由

### 管理员路由
```javascript
{
  path: '/sms-admin',
  component: Layout,
  redirect: '/sms-admin/channels',
  name: 'SmsAdmin',
  meta: {
    title: '短信管理',
    icon: 'message',
    roles: ['admin']
  },
  children: [
    {
      path: 'channels',
      component: () => import('@/views/sms/admin/channels'),
      name: 'SmsChannels',
      meta: { title: '通道配置', roles: ['admin'] }
    },
    {
      path: 'records',
      component: () => import('@/views/sms/admin/records'),
      name: 'SmsAdminRecords',
      meta: { title: '发送记录', roles: ['admin'] }
    },
    {
      path: 'statistics',
      component: () => import('@/views/sms/admin/statistics'),
      name: 'SmsAdminStatistics',
      meta: { title: '短信统计', roles: ['admin'] }
    }
  ]
}
```

### 客户路由
```javascript
{
  path: '/sms',
  component: Layout,
  redirect: '/sms/send',
  name: 'SmsManagement',
  meta: {
    title: '短信管理',
    icon: 'message',
    roles: ['customer']
  },
  children: [
    {
      path: 'send',
      component: () => import('@/views/sms/customer/send'),
      name: 'SmsSend',
      meta: { title: '短信群发', roles: ['customer'] }
    },
    {
      path: 'tasks',
      component: () => import('@/views/sms/customer/tasks'),
      name: 'SmsTasks',
      meta: { title: '任务管理', roles: ['customer'] }
    },
    {
      path: 'records',
      component: () => import('@/views/sms/customer/records'),
      name: 'SmsRecords',
      meta: { title: '发送记录', roles: ['customer'] }
    },
    {
      path: 'statistics',
      component: () => import('@/views/sms/customer/statistics'),
      name: 'SmsStatistics',
      meta: { title: '数据统计', roles: ['customer'] }
    }
  ]
}
```

---

## 🔌 后端集成步骤

### 1. 注册模型
在 `/home/vue-element-admin/backend/config/database.js` 中注册新模型:
```javascript
models.SmsChannel = require('../models/SmsChannel')(sequelize);
models.SmsTask = require('../models/SmsTask')(sequelize);
models.SmsRecord = require('../models/SmsRecord')(sequelize);
models.SmsStats = require('../models/SmsStats')(sequelize);
```

### 2. 设置关联关系
```javascript
// SmsRecord 关联
models.SmsRecord.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
models.SmsRecord.belongsTo(models.SmsChannel, { foreignKey: 'channel_id', as: 'channel' });

// SmsTask 关联
models.SmsTask.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
models.SmsTask.belongsTo(models.SmsChannel, { foreignKey: 'channel_id', as: 'channel' });
```

### 3. 注册路由
在 `/home/vue-element-admin/backend/server.js` 中:
```javascript
const smsAdminRoutes = require('./routes/smsAdmin');
const smsCustomerRoutes = require('./routes/smsCustomer');

app.use('/api/sms/admin', smsAdminRoutes);
app.use('/api/sms/customer', smsCustomerRoutes);
```

---

## 📊 数据库表结构

### sms_channels (短信通道表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| channel_name | VARCHAR(100) | 通道名称 |
| country | VARCHAR(50) | 国家 |
| country_code | VARCHAR(10) | 国家代码 |
| price_per_sms | DECIMAL(10,4) | 每条价格 |
| max_chars | INT | 最大字符数 |
| gateway_url | VARCHAR(255) | 网关地址 |
| account | VARCHAR(100) | 账号 |
| password | VARCHAR(255) | 密码 |
| status | INT | 状态 |

### sms_tasks (短信任务表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| user_id | INT | 用户ID |
| channel_id | INT | 通道ID |
| content | TEXT | 短信内容 |
| send_type | VARCHAR(20) | 发送方式 |
| status | VARCHAR(20) | 任务状态 |
| total_numbers | INT | 总号码数 |
| sent_count | INT | 已发送 |
| success_count | INT | 成功数 |

### sms_records (发送记录表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| task_id | INT | 任务ID |
| phone_number | VARCHAR(20) | 手机号 |
| status | VARCHAR(20) | 发送状态 |
| cost | DECIMAL(10,4) | 费用 |
| send_time | DATETIME | 发送时间 |

---

## ⚠️ 待实现功能

1. **SMS57对接**: 需要实际调用SMS57 API发送短信
2. **定时任务**: 需要使用定时器处理scheduled任务
3. **统计数据更新**: 需要定时任务计算每日统计
4. **余额扣除**: 已实现基本逻辑，需要完善事务处理
5. **消息队列**: 大批量发送需要使用队列处理

---

## 🚀 下一步操作

请告知是否需要我继续创建:
1. 前端API文件（2个）
2. 管理员页面（3个）
3. 客户页面（4个）
4. 路由配置更新
5. 数据库配置更新

我将按照您的快速批量处理偏好，一次性完成所有前端文件的创建。
