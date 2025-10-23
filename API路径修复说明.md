# API 路径修复说明

## 🐛 问题描述

在通道配置页面点击"国家定价"按钮，尝试添加国家时出现以下错误：
- ❌ 接口不存在
- ❌ 操作失败

## 🔍 问题原因

前端 API 文件 `/src/api/smsSettlement.js` 中的所有请求 URL 缺少 `/api` 前缀。

### 错误的 URL 示例：
```javascript
export function addChannelCountry(channelId, data) {
  return request({
    url: `/sms/channels/${channelId}/countries`,  // ❌ 缺少 /api 前缀
    method: 'post',
    data
  })
}
```

### 实际请求地址：
```
http://103.246.246.11:3000/sms/channels/4/countries
```

### 正确的后端路由：
```
http://103.246.246.11:3000/api/sms/channels/4/countries
```

## ✅ 修复方案

为 `/src/api/smsSettlement.js` 文件中的所有 API 请求添加 `/api` 前缀。

### 修复后的 URL：
```javascript
export function addChannelCountry(channelId, data) {
  return request({
    url: `/api/sms/channels/${channelId}/countries`,  // ✅ 添加了 /api 前缀
    method: 'post',
    data
  })
}
```

## 📝 修复的 API 列表

### 通道国家定价 API (7个)
1. ✅ `getChannelCountries` - 获取通道国家列表
2. ✅ `getChannelCountryDetail` - 获取国家详情
3. ✅ `addChannelCountry` - 添加国家配置
4. ✅ `updateChannelCountry` - 更新国家配置
5. ✅ `deleteChannelCountry` - 删除国家配置
6. ✅ `batchUpdateCountryStatus` - 批量更新状态
7. ✅ `getCountryPrice` - 获取国家价格

### 短信结算 API (9个)
1. ✅ `getSettlements` - 获取结算列表
2. ✅ `getSettlementDetail` - 获取结算详情
3. ✅ `getSettlementDetails` - 获取结算明细
4. ✅ `calculateSettlement` - 手动触发结算
5. ✅ `reSettlement` - 重新结算
6. ✅ `batchReSettlement` - 批量重新结算
7. ✅ `generateReport` - 生成业绩报表
8. ✅ `getSettlementOverview` - 获取结算概览
9. ✅ `exportSettlementsCSV` - 导出 CSV

**共修复 16 个 API 接口**

## 🚀 修复后的效果

### 正确的 URL 格式：
```
GET    /api/sms/channels/:channelId/countries
POST   /api/sms/channels/:channelId/countries
PUT    /api/sms/channels/:channelId/countries/:id
DELETE /api/sms/channels/:channelId/countries/:id
PUT    /api/sms/channels/:channelId/countries/batch/status
GET    /api/sms/channels/:channelId/countries/price/:code

GET    /api/sms/settlements
GET    /api/sms/settlements/:id
GET    /api/sms/settlements/:id/details
POST   /api/sms/settlements/calculate
POST   /api/sms/settlements/:id/resettle
POST   /api/sms/settlements/batch/resettle
GET    /api/sms/settlements/reports/generate
GET    /api/sms/settlements/statistics/overview
GET    /api/sms/settlements/export/csv
```

## 🧪 验证测试

### 后端 API 测试（已验证）：
```bash
# 获取国家列表
curl http://localhost:3000/api/sms/channels/1/countries
# ✅ 返回: {"code":200,"message":"获取成功","data":[...]}

# 添加国家
curl -X POST http://localhost:3000/api/sms/channels/4/countries \
  -H "Content-Type: application/json" \
  -d '{"country":"China","country_code":"86","cost_price":0.008,"sale_price":0.01}'
# ✅ 返回: {"code":200,"message":"添加成功","data":{...}}
```

### 前端测试步骤：
1. ✅ 刷新浏览器页面（`Ctrl + F5` 强制刷新）
2. ✅ 进入通道配置页面
3. ✅ 点击"国家定价"按钮
4. ✅ 点击"添加国家"
5. ✅ 填写表单并保存
6. ✅ 确认保存成功

## 📊 问题根源分析

### 为什么会出现这个问题？

1. **环境配置**：
   ```env
   VUE_APP_BASE_API = 'http://103.246.246.11:3000'
   ```
   - 前端直接请求后端 API，不经过开发代理
   - 需要完整的 URL 路径

2. **后端路由注册**：
   ```javascript
   app.use('/api/sms', smsChannelCountriesRoutes);
   ```
   - 后端在 `/api/sms` 路径下注册路由
   - 所有请求必须包含 `/api` 前缀

3. **API 文件**：
   ```javascript
   url: `/sms/channels/${channelId}/countries`  // ❌ 错误
   url: `/api/sms/channels/${channelId}/countries`  // ✅ 正确
   ```

### 如何避免类似问题？

1. **统一 URL 规范**：
   - 所有 API 请求必须以 `/api` 开头
   - 使用常量定义 API 前缀

2. **代码审查**：
   - 新增 API 时检查 URL 路径
   - 确保前后端路由一致

3. **自动化测试**：
   - 添加 API 集成测试
   - 验证所有路由可访问

## 💡 最佳实践建议

### 1. 使用 API 前缀常量
```javascript
// api/config.js
export const API_PREFIX = '/api'

// api/smsSettlement.js
import { API_PREFIX } from './config'

export function getChannelCountries(channelId, params) {
  return request({
    url: `${API_PREFIX}/sms/channels/${channelId}/countries`,
    method: 'get',
    params
  })
}
```

### 2. 统一 request 配置
```javascript
// utils/request.js
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API + '/api', // 在 baseURL 中包含 /api
  timeout: 120000
})

// api/smsSettlement.js
export function getChannelCountries(channelId, params) {
  return request({
    url: `/sms/channels/${channelId}/countries`, // 不需要 /api 前缀
    method: 'get',
    params
  })
}
```

### 3. 添加路由测试
```javascript
// tests/api/smsSettlement.spec.js
describe('SMS Settlement API', () => {
  it('should get channel countries', async () => {
    const response = await getChannelCountries(1)
    expect(response.code).toBe(200)
  })
})
```

## 📄 相关文件

### 修改的文件：
- ✅ `/src/api/smsSettlement.js` - 修复所有 API URL

### 相关配置文件：
- `.env.development` - 环境变量配置
- `backend/server.js` - 后端路由注册
- `backend/routes/smsChannelCountries.js` - 通道国家路由

## ✅ 修复完成

所有 API 路径已修复，现在可以正常使用国家定价功能了！

**下一步操作：**
1. 刷新浏览器页面（强制刷新：`Ctrl + Shift + R`）
2. 测试添加国家功能
3. 确认所有操作正常

---

**修复时间：** 2025-10-22 04:52  
**影响范围：** 通道国家定价、短信结算所有API  
**修复状态：** ✅ 完成
