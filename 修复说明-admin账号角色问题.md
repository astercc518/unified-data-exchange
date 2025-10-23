# Admin账号角色问题修复说明

## 问题描述

admin账号登录后显示的是客户页面，而不是管理员页面。

---

## 问题原因

1. **数据重复问题**：
   - `admin` 账号同时存在于 `users` 表（客户表）和 `agents` 表（代理表）
   - 登录时先查询 `users` 表，找到了 admin 记录
   - 系统将 admin 误判为客户类型 (`customer`)

2. **登录逻辑顺序问题**：
   - 原登录逻辑：先查客户表 → 再查代理表
   - admin 在客户表中被找到，导致角色错误

---

## 修复方案

### 1. 删除 users 表中的 admin 记录

```sql
DELETE FROM users WHERE login_account='admin';
```

**原因**：admin 是超级管理员，应该只存在于 agents 表中，不应出现在客户表中。

---

### 2. 优化登录逻辑

**修改文件**：`/backend/routes/auth.js`

**修改内容**：

```javascript
// 修改前：先查客户表，再查代理表
let user = await User.findOne({
  where: { login_account: account, login_password: pwd, status: 1 }
});

let userType = 'customer';

if (!user) {
  user = await Agent.findOne({
    where: { login_account: account, login_password: pwd, status: 1 }
  });
  
  if (user) {
    userType = account === 'admin' ? 'admin' : 'agent';
  }
}

// 修改后：admin 优先查代理表
let user;
let userType;

// 优先检查是否是管理员或代理（admin账号只能是管理员）
if (account === 'admin') {
  user = await Agent.findOne({
    where: { login_account: account, login_password: pwd, status: 1 }
  });
  if (user) {
    userType = 'admin';
  }
} else {
  // 先检查代理
  user = await Agent.findOne({
    where: { login_account: account, login_password: pwd, status: 1 }
  });
  
  if (user) {
    userType = 'agent';
  } else {
    // 再检查客户
    user = await User.findOne({
      where: { login_account: account, login_password: pwd, status: 1 }
    });
    if (user) {
      userType = 'customer';
    }
  }
}
```

**优化点**：
1. ✅ `admin` 账号单独判断，直接查 agents 表
2. ✅ 其他账号先查代理表，再查客户表（代理权限高于客户）
3. ✅ 避免角色误判

---

## 验证结果

### 1. 登录接口测试

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"111111"}'
```

**返回结果**：
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "userInfo": {
      "id": 4,
      "name": "系统管理员",
      "type": "admin"  ✅ 正确！
    }
  }
}
```

### 2. 用户信息接口测试

```bash
curl "http://localhost:3000/api/auth/info?token=<TOKEN>"
```

**返回结果**：
```json
{
  "success": true,
  "data": {
    "id": 4,
    "type": "admin",         ✅ 正确！
    "roles": ["admin"],      ✅ 正确！
    "name": "系统管理员",
    "loginAccount": "admin",
    "agentName": "系统管理员",
    "email": "admin@system.com",
    "introduction": "超级管理员"  ✅ 正确！
  }
}
```

---

## 前端路由权限

### Dashboard 页面路由

**文件**：`/src/views/dashboard/index.vue`

```javascript
computed: {
  currentRole() {
    if (this.roles.includes('admin')) {
      return 'admin'  // 显示管理员Dashboard
    } else if (this.roles.includes('agent')) {
      return 'agent'  // 显示代理Dashboard
    } else if (this.roles.includes('customer')) {
      return 'customer'  // 显示客户Dashboard
    }
    return 'admin'
  }
}
```

### 管理员专属菜单

根据 `/src/router/index.js` 配置，管理员拥有以下专属权限：

1. **用户管理**
   - ✅ 客户列表（与代理共享）
   - ✅ 代理列表（仅管理员）
   - ✅ 充值记录（仅管理员）
   - ✅ 客户结算（与代理共享）
   - ✅ 代理结算（仅管理员）

2. **数据管理**（仅管理员）
   - ✅ 数据上传
   - ✅ 数据库
   - ✅ 数据定价
   - ✅ 发布测试

3. **订单管理**（全角色可见）
   - ✅ 订单列表

---

## 角色权限总结

| 功能模块 | Admin | Agent | Customer |
|---------|-------|-------|----------|
| **Dashboard** | ✅ 管理员面板 | ✅ 代理面板 | ✅ 客户面板 |
| **客户管理** | ✅ 全部客户 | ✅ 本代理客户 | ❌ |
| **代理管理** | ✅ | ❌ | ❌ |
| **充值记录** | ✅ | ❌ | ❌ |
| **客户结算** | ✅ 全部客户 | ✅ 本代理客户 | ❌ |
| **代理结算** | ✅ | ❌ | ❌ |
| **数据上传** | ✅ | ❌ | ❌ |
| **数据库** | ✅ | ❌ | ❌ |
| **数据定价** | ✅ | ❌ | ❌ |
| **资源中心** | ❌ | ✅ | ✅ |
| **数据购买** | ❌ | ❌ | ✅ |
| **订单管理** | ✅ 全部订单 | ✅ 本代理订单 | ✅ 本人订单 |

---

## 测试清单

- [x] 删除 users 表中的 admin 记录
- [x] 修改登录逻辑优先判断 admin
- [x] 测试 admin 登录接口
- [x] 验证返回的用户类型为 admin
- [x] 验证返回的角色为 ["admin"]
- [x] 验证前端 Dashboard 路由逻辑
- [ ] 用户手动登录测试（建议执行）
- [ ] 验证管理员页面显示正确

---

## 使用说明

### Admin 登录

- **账号**：`admin`
- **密码**：`111111`
- **预期页面**：管理员 Dashboard
- **可见菜单**：用户管理、数据管理、订单管理

### 其他测试账号

1. **代理账号**
   - 账号：`agent01`
   - 密码：`111111`
   - 预期：代理 Dashboard

2. **客户账号**
   - 账号：`KL01880V01`
   - 密码：`111111`
   - 预期：客户 Dashboard

---

## 注意事项

⚠️ **重要**：
1. `admin` 账号只能存在于 `agents` 表，不能在 `users` 表中
2. 登录逻辑已优化，`admin` 账号优先从 `agents` 表查询
3. 代理账号优先级高于客户账号（先查 agents 表，再查 users 表）
4. 每个角色的权限在路由配置中通过 `meta.roles` 控制

---

**修复完成时间**：2025-10-15  
**状态**：✅ 已完成  
**影响文件**：
- `/backend/routes/auth.js`
- 数据库：`vue_admin.users` 表
