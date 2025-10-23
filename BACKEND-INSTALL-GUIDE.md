# 后端依赖安装指南

**时间**: 2025-10-13  
**目标**: 安装 Vue Element Admin 后端依赖

---

## 📦 安装步骤

### 方法1: 直接安装（推荐）

打开终端，执行以下命令：

```bash
# 1. 进入后端目录
cd /home/vue-element-admin/backend

# 2. 查看当前目录（确认路径正确）
pwd
# 应该显示: /home/vue-element-admin/backend

# 3. 查看 package.json（确认文件存在）
ls -la package.json

# 4. 安装依赖
npm install
```

**预期过程**:
```
npm install
npm WARN deprecated ...（一些警告可以忽略）
added 500+ packages in 30s
```

**安装时间**: 通常需要 **30-120秒**，取决于网络速度

---

### 方法2: 使用国内镜像（如果npm很慢）

```bash
cd /home/vue-element-admin/backend

# 使用淘宝镜像
npm install --registry=https://registry.npmmirror.com
```

---

### 方法3: 使用cnpm

```bash
# 1. 安装cnpm（如果还没有）
npm install -g cnpm --registry=https://registry.npmmirror.com

# 2. 使用cnpm安装
cd /home/vue-element-admin/backend
cnpm install
```

---

## ✅ 验证安装

### 1. 检查 node_modules 目录

```bash
cd /home/vue-element-admin/backend
ls -la node_modules | head -20
```

**预期结果**: 应该看到大量的包目录（500+个）

### 2. 检查关键依赖

```bash
ls node_modules | grep -E "express|sequelize|mysql2|sqlite3|cors"
```

**预期输出**:
```
cors
express
mysql2
sequelize
sqlite3
```

### 3. 查看安装的包数量

```bash
ls node_modules | wc -l
```

**预期结果**: 应该 > 500

---

## 📋 需要安装的依赖列表

根据 package.json，需要安装的依赖包括：

### 生产依赖 (dependencies)

| 包名 | 版本 | 用途 |
|------|------|------|
| bcryptjs | ^2.4.3 | 密码加密 |
| compression | ^1.7.4 | 响应压缩 |
| cors | ^2.8.5 | 跨域支持 |
| dotenv | ^16.3.1 | 环境变量 |
| express | ^4.18.2 | Web框架 |
| helmet | ^7.1.0 | 安全头 |
| joi | ^17.11.0 | 数据验证 |
| jsonwebtoken | ^9.0.2 | JWT认证 |
| moment | ^2.29.4 | 时间处理 |
| morgan | ^1.10.0 | 日志中间件 |
| multer | ^2.0.2 | 文件上传 |
| mysql2 | ^3.15.2 | MySQL驱动 |
| sequelize | ^6.35.1 | ORM框架 |
| sqlite3 | ^5.1.7 | SQLite驱动 |
| winston | ^3.11.0 | 日志系统 |

### 开发依赖 (devDependencies)

| 包名 | 版本 | 用途 |
|------|------|------|
| @types/jest | ^29.5.8 | Jest类型定义 |
| jest | ^29.7.0 | 测试框架 |
| nodemon | ^3.0.2 | 开发热重载 |
| supertest | ^6.3.3 | API测试 |

**总计**: 约 **19个直接依赖** + **500+个间接依赖**

---

## 🐛 常见问题

### 问题1: npm install 卡住不动

**原因**: 网络问题或镜像源慢

**解决方案**:
```bash
# 1. 取消当前安装 (Ctrl+C)

# 2. 清理缓存
npm cache clean --force

# 3. 使用国内镜像重试
npm install --registry=https://registry.npmmirror.com
```

### 问题2: EACCES 权限错误

**原因**: 没有写入权限

**解决方案**:
```bash
# 检查目录权限
ls -la /home/vue-element-admin/backend

# 如果需要，修改权限
chmod -R 755 /home/vue-element-admin/backend
```

### 问题3: sqlite3 编译错误

**错误信息**: `node-gyp rebuild failed`

**解决方案**:
```bash
# 安装编译工具
yum install -y gcc-c++ make python3

# 或使用预编译版本
npm install sqlite3 --build-from-source=false
```

### 问题4: 网络超时

**错误信息**: `network timeout`

**解决方案**:
```bash
# 增加超时时间
npm install --fetch-timeout=600000

# 或使用cnpm
npm install -g cnpm --registry=https://registry.npmmirror.com
cnpm install
```

---

## 📊 安装后检查

### 完整的验证步骤

```bash
# 1. 进入后端目录
cd /home/vue-element-admin/backend

# 2. 检查 node_modules
ls node_modules | wc -l
# 应该 > 500

# 3. 检查关键依赖
ls node_modules | grep -E "express|sequelize|mysql2|sqlite3"

# 4. 尝试启动服务
node server.js
```

**预期启动输出**:
```
✅ 数据库连接成功
📊 数据库模型同步完成
🚀 服务器启动成功
📍 服务地址: http://localhost:3000
🌍 环境: development
```

---

## 🚀 安装完成后的下一步

### 1. 启动后端服务

```bash
cd /home/vue-element-admin/backend
node server.js
```

### 2. 验证服务

打开新终端：
```bash
curl http://localhost:3000/health
```

**预期返回**:
```json
{
  "status": "ok",
  "timestamp": "2025-10-13T...",
  "uptime": 123.456
}
```

### 3. 测试API

```bash
# 测试数据库API
curl "http://localhost:3000/api/data-library?page=1&limit=10"
```

---

## 📝 快速参考

### 一键安装命令

```bash
cd /home/vue-element-admin/backend && npm install
```

### 使用国内镜像

```bash
cd /home/vue-element-admin/backend && npm install --registry=https://registry.npmmirror.com
```

### 验证安装

```bash
cd /home/vue-element-admin/backend && ls node_modules | wc -l && node server.js
```

---

## ⏱️ 预计时间

| 步骤 | 预计时间 |
|------|---------|
| npm install | 30-120秒 |
| 验证安装 | 10秒 |
| 启动服务 | 5秒 |
| **总计** | **1-3分钟** |

---

## ✅ 完成标志

安装成功的标志：

1. ✅ node_modules 目录存在
2. ✅ node_modules 包含 500+ 个包
3. ✅ 关键依赖（express、sequelize等）已安装
4. ✅ node server.js 可以启动
5. ✅ http://localhost:3000/health 返回正常

---

**准备好了吗？现在就打开终端执行安装吧！** 🚀
