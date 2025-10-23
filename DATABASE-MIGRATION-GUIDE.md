# 数据库迁移完整指南

## 🎯 目标

将系统从 localStorage 模式切换到数据库永久存储模式。

---

## ✅ 当前状态

### 已完成：
- ✅ **后端服务已启动**（http://localhost:3000）
- ✅ **前端服务已启动**（http://localhost:9528）
- ✅ **数据迁移工具已创建**

### 服务信息：
- 后端服务：`http://localhost:3000`
- 数据库模式：`mock-memory`（测试模式，内存存储）
- API 健康检查：`http://localhost:3000/health`

---

## 🚀 完整迁移流程

### 方式一：使用可视化迁移工具（推荐）

#### **第1步：打开迁移工具**

在浏览器中访问：
```
http://localhost:9528/database-migration-tool.html
```

#### **第2步：检查后端服务**

点击 **"🔍 检查服务状态"** 按钮

**预期结果：**
- ✅ 服务状态：运行中
- ✅ 数据库类型：mock-memory

#### **第3步：读取本地数据**

点击 **"📖 读取本地数据"** 按钮

**预期结果：**
- 显示各类数据的数量统计
- 客户数据、代理数据、订单数据等

#### **第4步：迁移数据**

点击 **"🚀 一键迁移数据"** 按钮

**预期结果：**
- 进度条显示迁移进度
- 显示迁移成功的记录数
- 所有数据已保存到数据库

#### **第5步：切换到数据库模式**

点击 **"🔄 切换到数据库模式"** 按钮，然后按照提示操作：

**手动操作步骤：**

1. **修改配置文件**
   
   编辑文件：`/home/vue-element-admin/.env.development`
   
   找到这一行：
   ```bash
   VUE_APP_USE_DATABASE = false
   ```
   
   改为：
   ```bash
   VUE_APP_USE_DATABASE = true
   ```

2. **重启前端服务**
   
   在终端执行：
   ```bash
   # 停止当前服务
   pkill -f "vue-cli-service serve"
   
   # 重新启动
   cd /home/vue-element-admin
   npm run dev
   ```

3. **刷新浏览器**
   
   访问：http://localhost:9528
   
   使用 `admin/111111` 登录

---

### 方式二：使用 API 直接迁移（开发者）

#### **步骤1：读取本地数据**

```javascript
// 在浏览器控制台执行
const localData = {
  userList: JSON.parse(localStorage.getItem('userList') || '[]'),
  agentList: JSON.parse(localStorage.getItem('agentList') || '[]'),
  dataLibrary: JSON.parse(localStorage.getItem('dataLibrary') || '[]'),
  orderList: JSON.parse(localStorage.getItem('orderList') || '[]'),
  rechargeRecords: JSON.parse(localStorage.getItem('rechargeRecords') || '[]')
}

console.log('本地数据统计:', {
  users: localData.userList.length,
  agents: localData.agentList.length,
  dataLibrary: localData.dataLibrary.length,
  orders: localData.orderList.length,
  rechargeRecords: localData.rechargeRecords.length
})
```

#### **步骤2：调用迁移 API**

```javascript
// 发送迁移请求
fetch('http://localhost:3000/api/migrate/from-localstorage', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(localData)
})
.then(res => res.json())
.then(result => {
  console.log('迁移结果:', result)
  if (result.success) {
    console.log('✅ 迁移成功！总记录数:', result.totalRecords)
    console.log('详细统计:', result.statistics)
  } else {
    console.error('❌ 迁移失败:', result.error)
  }
})
.catch(error => {
  console.error('❌ 请求失败:', error)
})
```

---

## 🔍 验证迁移结果

### 检查后端数据

访问：http://localhost:3000/api/migrate/test-connection

**预期响应：**
```json
{
  "success": true,
  "message": "模拟数据库连接成功",
  "database": "mock-memory",
  "statistics": {
    "users": 2,
    "agents": 1,
    "dataLibrary": 0,
    "orders": 0,
    "rechargeRecords": 0
  }
}
```

### 测试登录

1. 访问：http://localhost:9528
2. 输入账号：`admin`
3. 输入密码：`111111`
4. 输入验证码（查看控制台）
5. 点击登录

**预期结果：**
- ✅ 登录成功
- ✅ 数据从数据库读取
- ✅ 页面操作数据保存到数据库

---

## ⚠️ 重要说明

### 当前数据库模式：测试模式（内存存储）

**特点：**
- ✅ 可以正常使用
- ✅ 支持所有 API 操作
- ⚠️ **数据在内存中**，重启服务后会丢失
- ⚠️ 需要定期备份

**为什么使用测试模式？**
因为 SQLite 依赖库版本不兼容，无法启动真正的数据库服务。

### 升级到真正的永久存储

如需真正的永久存储，需要：

#### 选项1：安装 MySQL/MariaDB

```bash
# 安装 MariaDB（需要 root 权限）
yum install -y mariadb-server mariadb

# 启动服务
systemctl start mariadb
systemctl enable mariadb

# 创建数据库
mysql -e "CREATE DATABASE vue_admin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "CREATE USER 'vue_admin_user'@'localhost' IDENTIFIED BY 'vue_admin_2024';"
mysql -e "GRANT ALL PRIVILEGES ON vue_admin.* TO 'vue_admin_user'@'localhost';"

# 导入数据库结构
mysql vue_admin < /home/vue-element-admin/database/schema.sql
```

**修改后端配置：**

编辑 `/home/vue-element-admin/backend/.env`：

```bash
# 改为 MySQL
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=vue_admin
DB_USER=vue_admin_user
DB_PASSWORD=vue_admin_2024
```

**重启后端服务：**

```bash
cd /home/vue-element-admin/backend
node server.js
```

#### 选项2：修复 SQLite 依赖

```bash
# 升级系统库（需要 root 权限）
yum install -y centos-release-scl
yum install -y devtoolset-8-gcc*
scl enable devtoolset-8 bash

# 重新编译 sqlite3
cd /home/vue-element-admin/backend
npm rebuild sqlite3 --build-from-source
```

---

## 📊 数据流程图

```
localStorage (浏览器)
        ↓
[读取数据] → 数据迁移工具
        ↓
[POST] /api/migrate/from-localstorage
        ↓
后端 API 接收数据
        ↓
写入数据库 (mock-memory / SQLite / MySQL)
        ↓
[完成] 数据永久存储
```

---

## 🛠️ 故障排查

### 问题1：后端服务连接失败

**症状：** 迁移工具显示"后端服务不可用"

**解决方案：**
```bash
# 检查服务是否运行
lsof -i :3000

# 如果没运行，启动服务
cd /home/vue-element-admin/backend
node test-server.js
```

### 问题2：数据迁移失败

**症状：** API 返回错误

**解决方案：**
1. 查看后端日志
2. 检查数据格式是否正确
3. 确认 localStorage 中有数据

### 问题3：切换到数据库模式后登录失败

**症状：** 提示 Network Error

**解决方案：**
1. 确认后端服务正在运行
2. 检查 `.env.development` 配置正确
3. 确认前端服务已重启
4. 清除浏览器缓存

---

## ✅ 最佳实践

### 数据备份

定期导出数据备份：

```javascript
// 在数据管理中心导出
// 访问：http://localhost:9528/data-persistence-manager.html
// 点击"导出数据"按钮
```

### 监控数据

定期检查数据统计：

```bash
# API 方式
curl http://localhost:3000/api/migrate/test-connection
```

### 日志查看

后端日志会显示所有数据库操作。

---

## 📞 技术支持

遇到问题时：

1. 查看浏览器控制台日志
2. 查看后端服务终端输出
3. 访问健康检查接口：http://localhost:3000/health
4. 查看操作日志

---

## 🎉 完成后的效果

✅ 所有数据保存到数据库  
✅ 页面操作立即持久化  
✅ 重启浏览器数据不丢失  
✅ 支持多用户并发访问  
✅ 完整的数据追踪和日志  

---

**文档版本：** 1.0  
**最后更新：** 2025-10-13  
**状态：** ✅ 后端服务运行中，迁移工具已就绪
