# 数据库服务状态 404 错误修复报告

## 🐛 问题描述

用户在访问首页时，数据库服务状态检查失败，提示：
```
Request failed with status code 404
```

## 🔍 问题分析

### 1. 错误日志
```
GET /stats/system HTTP/1.1" 404 68
```

后端日志显示前端在请求 `/stats/system` 接口，但返回404错误。

### 2. 根本原因

**问题1：API路径错误**
- 前端请求路径: `/stats/system`
- 后端实际路径: `/api/stats/system`
- 原因: 缺少 `/api` 前缀

**问题2：数据库字段名不匹配**
- 统计路由使用了错误的字段名：
  - `recharge_amount` → 实际字段: `amount`
  - `total_price` → 实际字段: `total_amount`

## ✅ 修复方案

### 修复1：前端API路径
**文件**: `/home/vue-element-admin/src/views/dashboard/admin/components/ServiceStatusCard.vue`

```javascript
// 修复前
const response = await request({
  url: '/stats/system',  // ❌ 缺少 /api 前缀
  method: 'get'
})

// 修复后
const response = await request({
  url: '/api/stats/system',  // ✅ 添加 /api 前缀
  method: 'get'
})
```

### 修复2：后端字段名
**文件**: `/home/vue-element-admin/backend/routes/stats.js`

```javascript
// 修复前
const totalRecharge = await RechargeRecord.sum('recharge_amount');  // ❌ 错误字段名
const totalOrderAmount = await Order.sum('total_price');  // ❌ 错误字段名

// 修复后
const totalRecharge = await RechargeRecord.sum('amount');  // ✅ 正确字段名
const totalOrderAmount = await Order.sum('total_amount');  // ✅ 正确字段名
```

## 📊 字段映射关系

### RechargeRecord 模型
| 使用的字段名 | 实际字段名 | 说明 |
|------------|-----------|------|
| ❌ recharge_amount | ✅ amount | 充值金额 |

### Order 模型
| 使用的字段名 | 实际字段名 | 说明 |
|------------|-----------|------|
| ❌ total_price | ✅ total_amount | 订单总金额 |

## 🧪 测试验证

### 接口测试
```bash
curl http://103.246.246.11:3000/api/stats/system
```

**返回结果**:
```json
{
    "data": {
        "amounts": {
            "totalBalance": 0,
            "totalOrderAmount": 0,
            "totalRecharge": 0
        },
        "counts": {
            "agents": 1,
            "dataLibrary": 0,
            "orders": 0,
            "recharges": 0,
            "users": 0
        },
        "orderStats": []
    },
    "success": true
}
```
✅ **接口正常工作**

### 服务状态
```bash
GET /api/stats/system HTTP/1.1" 200 182
```
✅ **返回200状态码，不再是404**

## 📝 修改文件清单

| 文件 | 修改内容 | 状态 |
|------|---------|------|
| `src/views/dashboard/admin/components/ServiceStatusCard.vue` | API路径添加 `/api` 前缀 | ✅ |
| `backend/routes/stats.js` | 修复字段名 `amount` 和 `total_amount` | ✅ |

## 🔧 后续操作

已完成的操作：
1. ✅ 修复前端API路径
2. ✅ 修复后端字段名
3. ✅ 重启后端服务
4. ✅ 验证接口正常工作

无需额外操作，前端会自动刷新并显示正确的数据库服务状态。

## 💡 经验总结

### 预防措施
1. **API路径规范**: 
   - 后端所有API统一使用 `/api` 前缀
   - 前端请求必须包含完整路径

2. **字段命名一致性**:
   - 数据库模型字段名应与业务逻辑保持一致
   - 建议使用统一的命名规范（如：充值金额统一用 `amount`）

3. **开发建议**:
   - 使用TypeScript接口定义，避免字段名拼写错误
   - 添加集成测试验证API路径正确性
   - 定期检查前后端接口文档一致性

## 🎯 问题解决时间线

| 时间 | 操作 |
|------|------|
| 05:13 | 用户报告数据库服务状态404错误 |
| 05:14 | 检查后端日志，发现请求 `/stats/system` 返回404 |
| 05:15 | 定位前端请求路径缺少 `/api` 前缀 |
| 05:16 | 修复前端API路径 |
| 05:17 | 测试发现数据库字段名错误 |
| 05:18 | 修复 `recharge_amount` → `amount` |
| 05:19 | 修复 `total_price` → `total_amount` |
| 05:20 | 重启后端服务，验证接口正常 |

**总耗时**: ~7分钟

---

## ✨ 结果

✅ 数据库服务状态检查正常  
✅ 前端页面不再显示404错误  
✅ 统计数据正确返回  
✅ 系统状态监控功能恢复正常

**修复时间**: 2025-10-14 05:20  
**验证状态**: 已通过测试
