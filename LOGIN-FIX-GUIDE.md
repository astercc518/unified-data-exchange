# 🔧 登录 Network Error 问题解决指南

## 问题描述
使用 admin 账号登录时提示 **Network Error**

## 🎯 问题原因

1. **API路径不匹配**: 前端调用的路径与后端路由不一致
2. **缺少管理员账号**: 数据库中没有 admin 账号数据
3. **导入错误**: user.js 中缺少必要的函数导入

## ✅ 已修复的问题

### 1. 修复 API 导入错误
**文件**: `src/store/modules/user.js`
```javascript
// 修复前
import { getUserList } from '@/api/database'

// 修复后
import { login, getInfo, logout } from '@/api/user'
```

### 2. 修正 API 路径
**文件**: `src/api/user.js`
```javascript
// 修复前
url: '/vue-element-admin/user/login'

// 修复后
url: '/api/auth/login'
```

### 3. 完善后端认证接口
**文件**: `backend/routes/auth.js`
- ✅ 添加 `/api/auth/info` 获取用户信息接口
- ✅ 添加 `/api/auth/logout` 登出接口
- ✅ 支持代理和客户两种用户类型

## 🚀 解决方案（两种方式）

### 方式一：使用初始化工具创建管理员（推荐）

1. **打开初始化工具**
   ```
   在浏览器中打开：file:///home/vue-element-admin/init-admin-database.html
   ```

2. **点击"创建数据库管理员"按钮**
   - 工具会自动连接后端服务
   - 在数据库中创建 admin 管理员账号

3. **点击"测试登录"验证**
   - 确保管理员账号创建成功
   - 验证登录功能正常

4. **返回登录页面登录**
   ```
   用户名: admin
   密码: 111111
   ```

### 方式二：手动创建管理员账号

#### 步骤 1: 确保后端服务运行
```bash
cd /home/vue-element-admin/backend
node server.js
```

#### 步骤 2: 使用 API 创建管理员
```bash
curl -X POST http://localhost:3000/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "loginAccount": "admin",
    "loginPassword": "111111",
    "agentName": "系统管理员",
    "agentCode": "ADMIN001",
    "email": "admin@system.com",
    "phone": "13800138000",
    "level": 1,
    "commission": 0,
    "salePriceRate": 1,
    "status": 1
  }'
```

#### 步骤 3: 验证账号创建
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"111111"}'
```

## 📊 系统架构说明

### 当前登录流程
```
前端登录 → /api/auth/login → 后端验证数据库 → 返回Token → 前端存储 → 获取用户信息
```

### API 端点
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/auth/login` | POST | 用户登录 |
| `/api/auth/info` | GET | 获取用户信息 |
| `/api/auth/logout` | POST | 用户登出 |

### 用户类型
- **agent (代理)**: 具有管理员权限，roles: ['admin', 'agent']
- **customer (客户)**: 普通用户权限，roles: ['customer']

## 🔍 故障排查步骤

### 1. 检查后端服务
```bash
# 检查后端服务是否运行
curl http://localhost:3000/health

# 应该返回
{"status":"ok","timestamp":"...","uptime":...}
```

### 2. 检查前端服务
```bash
# 检查前端服务是否运行
curl http://localhost:9528/

# 应该返回 HTML 内容
```

### 3. 检查数据库连接
```bash
# 检查数据库
mysql -u root -e "USE vue_admin; SELECT * FROM agents WHERE login_account='admin';"
```

### 4. 测试登录API
```bash
# 测试登录接口
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"111111"}'
```

## 🎯 管理员账号信息

创建成功后的管理员账号：

| 字段 | 值 |
|------|------|
| **用户名** | admin |
| **密码** | 111111 |
| **账号类型** | 代理（管理员） |
| **权限** | admin, agent |
| **邮箱** | admin@system.com |
| **电话** | 13800138000 |

## 📝 注意事项

1. **后端服务必须运行**: 确保 `node server.js` 在后台运行
2. **端口不能冲突**: 3000端口用于后端，9528端口用于前端
3. **数据库必须可用**: MariaDB 服务必须正常运行
4. **首次登录**: 必须先创建管理员账号才能登录

## 🆘 常见问题

### Q1: 点击登录后提示 Network Error
**A**: 检查后端服务是否运行，运行 `netstat -tlnp | grep 3000` 确认

### Q2: 提示"用户名或密码错误"
**A**: 确认是否已创建管理员账号，使用初始化工具创建

### Q3: 登录成功但页面空白
**A**: 检查浏览器控制台，可能是权限配置问题

### Q4: 初始化工具无法连接后端
**A**: 
- 检查后端服务状态
- 确认端口 3000 未被占用
- 查看后端日志确认服务启动成功

## 📞 技术支持

如遇到其他问题：

1. 查看后端日志: `cd backend && tail -f logs/*.log`
2. 查看浏览器控制台错误信息
3. 检查网络请求的详细信息（Network 标签）

---

**修复完成时间**: 2025-10-13  
**修复内容**: API路径修正 + 认证接口完善 + 管理员初始化工具  
**当前状态**: ✅ 已修复，可正常登录
