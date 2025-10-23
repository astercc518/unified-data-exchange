# 操作日志功能使用指南

## 📚 快速开始

操作日志功能已经完全集成到系统中,会自动记录所有重要的用户操作。

---

## 🎯 主要功能

### 1. 自动日志记录

系统会自动记录以下操作:

#### 认证相关 (auth.js)
- ✅ 用户登录成功
- ✅ 用户登录失败
- ✅ 用户登出

#### 数据管理 (data.js)
- ✅ 数据上传
- ✅ 数据更新
- ✅ 数据删除
- ✅ 数据发布
- ✅ 批量发布

#### 用户管理 (users.js)
- ✅ 创建客户
- ✅ 更新客户
- ✅ 删除客户

#### 订单管理 (orders.js)
- ✅ 创建订单
- ✅ 购买数据
- ✅ 更新订单
- ✅ 订单发货
- ✅ 审核订单(通过/拒绝)
- ✅ 客户发货

#### 代理管理 (agents.js)
- ✅ 创建代理
- ✅ 更新代理
- ✅ 删除代理

#### 系统安全 (system/security.js)
- ✅ 修改管理员密码
- ✅ 更新安全配置

#### 充值管理 (recharge.js)
- ✅ 客户充值

---

## 🔍 查看操作日志

### 方法1: 前端界面查看

1. 登录管理后台
2. 导航到 **系统管理 > 操作日志**
3. 可以按以下条件筛选:
   - 操作者
   - 操作类型
   - 时间范围
   - 操作状态(成功/失败)

### 方法2: 数据库查询

```sql
-- 查询所有操作日志
SELECT * FROM operation_logs ORDER BY create_time DESC LIMIT 10;

-- 查询登录日志
SELECT * FROM operation_logs WHERE type = 'login' ORDER BY create_time DESC;

-- 查询某个用户的操作
SELECT * FROM operation_logs WHERE operator = 'admin' ORDER BY create_time DESC;

-- 查询失败的操作
SELECT * FROM operation_logs WHERE status = 'failed' ORDER BY create_time DESC;

-- 统计今日操作数量
SELECT COUNT(*) FROM operation_logs 
WHERE create_time >= UNIX_TIMESTAMP(CURDATE()) * 1000;
```

### 方法3: 命令行验证

```bash
# 运行验证脚本
cd /home/vue-element-admin
node verify-operation-logs.js
```

---

## 📊 日志数据结构

每条操作日志包含以下信息:

```javascript
{
  id: 1,                          // 日志ID
  type: 'operation',              // 日志类型: login, operation, system
  operator: 'admin',              // 操作者
  operator_type: 'admin',         // 操作者类型: admin, agent, customer
  action: '创建客户',             // 操作动作
  description: '创建客户: 张三',  // 操作描述
  ip_address: '127.0.0.1',        // IP地址
  user_agent: 'Mozilla/5.0...',   // User-Agent
  status: 'success',              // 操作状态: success, failed
  create_time: 1698765432000      // 创建时间(Unix时间戳)
}
```

---

## 🛠️ 开发者使用指南

### 如何在新路由中添加操作日志

#### 方法1: 使用快捷函数

```javascript
const { logUserOperation, logDataOperation, logOrderOperation, logSystemOperation } = 
  require('../utils/operationLogger');

// 用户管理操作
await logUserOperation('创建用户', req, userId, userName);

// 数据管理操作
await logDataOperation('上传数据', req, dataId, { country: 'MX', dataType: 'SMS' });

// 订单操作
await logOrderOperation('创建订单', req, orderId, orderNo);

// 系统配置操作
await logSystemOperation('更新配置', req, '配置详情');
```

#### 方法2: 使用基础函数

```javascript
const { logOperation } = require('../utils/operationLogger');

await logOperation({
  type: 'operation',           // 可选: login, operation, system
  action: '自定义操作',
  description: '操作的详细描述',
  req,                         // Express request 对象
  status: 'success'           // success 或 failed
});
```

#### 方法3: 使用中间件(适用于简单场景)

```javascript
const { logOperationMiddleware } = require('../utils/operationLogger');

router.post('/some-action', 
  authenticateToken,
  logOperationMiddleware('执行某操作', {
    type: 'operation',
    getDescription: (req, data) => `执行操作: ${req.body.name}`
  }),
  async (req, res) => {
    // 业务逻辑
  }
);
```

---

## ⚠️ 重要注意事项

### 1. 错误处理

所有日志记录操作都使用 `.catch()` 捕获错误,确保日志失败不会影响业务:

```javascript
await logOperation(...).catch(err => logger.error('记录日志失败:', err));
```

### 2. 敏感信息

**不要记录**以下敏感信息:
- ❌ 密码
- ❌ 密钥
- ❌ Token
- ❌ 信用卡号
- ❌ 其他个人隐私信息

**可以记录**:
- ✅ 操作类型
- ✅ 用户名/账号
- ✅ 操作时间
- ✅ IP地址
- ✅ 操作结果(成功/失败)

### 3. 性能考虑

- 日志记录是异步操作,不阻塞主流程
- 使用 `.catch()` 避免日志失败影响业务
- 建议定期归档历史日志

---

## 🔧 故障排查

### 问题1: 日志没有记录

**检查步骤**:
1. 检查数据库连接是否正常
2. 检查 `operation_logs` 表是否存在
3. 查看后端日志是否有错误信息
4. 运行验证脚本: `node verify-operation-logs.js`

### 问题2: 操作者显示为 'unknown'

**原因**: 请求中缺少用户认证信息

**解决方法**:
- 确保路由使用了 `authenticateToken` 中间件
- 检查 JWT Token 是否有效
- 确认 `req.user` 对象包含正确的用户信息

### 问题3: IP地址为空

**原因**: 代理服务器配置问题

**解决方法**:
- 检查 Nginx 配置,确保转发了真实IP
- 使用 `req.headers['x-real-ip']` 或 `req.headers['x-forwarded-for']`

---

## 📈 最佳实践

### 1. 描述要清晰明了

```javascript
// ❌ 不好
description: '操作'

// ✅ 好
description: '创建客户: 张三 (账号: zhangsan)'
```

### 2. 记录关键业务信息

```javascript
// ✅ 记录关键信息
await logOrderOperation('购买数据', req, order.id, order.order_number);
// 描述: 购买数据 - 订单号: ORD20231021001
```

### 3. 区分成功和失败

```javascript
try {
  // 业务逻辑
  await logOperation({ action: '操作', status: 'success', req });
} catch (error) {
  await logOperation({ action: '操作', status: 'failed', req });
  throw error;
}
```

---

## 📞 技术支持

如有问题,请联系开发团队或查看以下文档:

- 完整文档: `/home/vue-element-admin/OPERATION-LOGS-ENHANCEMENT.md`
- 工具源码: `/home/vue-element-admin/backend/utils/operationLogger.js`
- 验证脚本: `node verify-operation-logs.js`

---

**版本**: v1.0  
**更新时间**: 2025-10-21  
**维护者**: 系统开发团队
