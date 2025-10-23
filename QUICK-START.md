# 🚀 快速开始指南

## ✅ 当前系统状态

### 服务运行状态
- ✅ **MariaDB 数据库**: 运行中 (端口 3306)
- ✅ **后端服务**: 运行中 (端口 3000)
- ✅ **前端服务**: 运行中 (端口 9528)

### 数据库信息
- **数据库类型**: MariaDB 5.5.68
- **数据库名**: vue_admin
- **用户名**: vue_admin_user
- **密码**: vue_admin_2024
- **表数量**: 6 个 (users, agents, data_library, orders, recharge_records, feedbacks)

---

## 🎯 立即开始使用

### 1. 访问系统
打开浏览器访问：
```
http://localhost:9528
```

### 2. 登录账号
```
账号: admin
密码: 111111
```

### 3. 开始使用
登录成功后，所有操作将自动保存到 MariaDB 数据库！

---

## 📊 数据迁移（可选）

如果您之前使用了 localStorage 存储数据，可以将数据迁移到 MariaDB：

### 方式一：使用可视化工具（推荐）
1. 打开迁移工具：
   ```
   file:///home/vue-element-admin/mariadb-migration-tool.html
   ```

2. 按照页面提示操作：
   - 点击"检查数据库连接"
   - 点击"扫描本地数据"
   - 点击"一键迁移所有数据"

### 方式二：手动导入
```bash
# 从 localStorage 导出数据
# 在浏览器控制台执行
localStorage.getItem('userList')

# 然后通过 API 导入
curl -X POST http://localhost:3000/api/migrate/users \
  -H "Content-Type: application/json" \
  -d '{"users": [...]}'
```

---

## 🔧 服务管理

### 启动/停止服务

#### MariaDB 数据库
```bash
# 启动
systemctl start mariadb

# 停止
systemctl stop mariadb

# 重启
systemctl restart mariadb

# 查看状态
systemctl status mariadb
```

#### 后端服务
```bash
# 启动
cd /home/vue-element-admin/backend
node mariadb-server.js

# 后台启动
nohup node mariadb-server.js > server.log 2>&1 &

# 停止
pkill -f "mariadb-server.js"

# 查看日志
tail -f /home/vue-element-admin/backend/server.log
```

#### 前端服务
```bash
# 启动
cd /home/vue-element-admin
npm run dev

# 停止
pkill -f "npm run dev"
```

---

## 🧪 系统测试

运行自动化测试脚本：
```bash
/home/vue-element-admin/test-mariadb-system.sh
```

这将检查：
- MariaDB 服务状态
- 数据库连接
- 后端 API 功能
- 前端服务状态
- 文件完整性

---

## 📝 常用操作

### 查看数据库数据
```bash
# 登录数据库
mysql -u vue_admin_user -pvue_admin_2024 vue_admin

# 查看所有用户
SELECT * FROM users;

# 查看用户数量
SELECT COUNT(*) FROM users;

# 查看最近创建的订单
SELECT * FROM orders ORDER BY create_time DESC LIMIT 10;

# 退出
exit;
```

### 备份数据库
```bash
# 创建备份
mysqldump -u vue_admin_user -pvue_admin_2024 vue_admin > backup.sql

# 带时间戳的备份
mysqldump -u vue_admin_user -pvue_admin_2024 vue_admin > \
  backup_$(date +%Y%m%d_%H%M%S).sql
```

### 恢复数据库
```bash
mysql -u vue_admin_user -pvue_admin_2024 vue_admin < backup.sql
```

---

## 🔍 API 接口测试

### 健康检查
```bash
curl http://localhost:3000/health
```

### 测试登录
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"111111"}'
```

### 获取用户列表
```bash
curl http://localhost:3000/api/users/list
```

### 创建用户
```bash
curl -X POST http://localhost:3000/api/users/create \
  -H "Content-Type: application/json" \
  -d '{
    "loginAccount": "test001",
    "loginPassword": "123456",
    "customerName": "测试用户",
    "email": "test@example.com",
    "userType": "user"
  }'
```

---

## 🌐 访问地址

### Web 界面
- **前端系统**: http://localhost:9528
- **数据迁移工具**: file:///home/vue-element-admin/mariadb-migration-tool.html

### API 接口
- **后端 API**: http://localhost:3000
- **健康检查**: http://localhost:3000/health
- **连接测试**: http://localhost:3000/api/migrate/test-connection

### 文档
- **安装文档**: /home/vue-element-admin/MARIADB-SETUP-COMPLETE.md
- **快速开始**: /home/vue-element-admin/QUICK-START.md (本文件)
- **测试脚本**: /home/vue-element-admin/test-mariadb-system.sh

---

## ❓ 常见问题

### Q1: 登录提示 "Network Error"
**解决方案**:
```bash
# 1. 检查后端服务
curl http://localhost:3000/health

# 2. 如果失败，重启后端
pkill -f "mariadb-server.js"
cd /home/vue-element-admin/backend
node mariadb-server.js
```

### Q2: 数据没有保存
**解决方案**:
```bash
# 1. 确认数据库模式已启用
grep VUE_APP_USE_DATABASE /home/vue-element-admin/.env.development

# 2. 检查数据库连接
mysql -u vue_admin_user -pvue_admin_2024 vue_admin -e "SELECT COUNT(*) FROM users;"

# 3. 查看后端日志
tail -f /home/vue-element-admin/backend/server.log
```

### Q3: MariaDB 服务启动失败
**解决方案**:
```bash
# 查看详细错误
systemctl status mariadb -l

# 查看日志
tail -f /var/log/mariadb/mariadb.log

# 重新启动
systemctl restart mariadb
```

### Q4: 端口被占用
**解决方案**:
```bash
# 查看占用端口的进程
netstat -tlnp | grep 3000

# 停止相关进程
pkill -f "mariadb-server.js"
pkill -f "database-server.js"
```

---

## 📚 详细文档

需要更多信息？查看完整文档：
```bash
cat /home/vue-element-admin/MARIADB-SETUP-COMPLETE.md
```

---

## 🎉 开始使用

一切就绪！现在您可以：

1. ✅ 访问 http://localhost:9528
2. ✅ 使用 `admin` / `111111` 登录
3. ✅ 开始管理您的数据
4. ✅ 所有数据自动保存到 MariaDB

**数据永久存储，重启不丢失！** 🎊
