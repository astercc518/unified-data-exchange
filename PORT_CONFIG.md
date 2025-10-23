# 项目端口和数据库固定配置

> **生产环境配置文档**  
> 最后更新: 2025-10-18

---

## 📋 固定配置概览

### 🔌 端口配置

| 服务类型 | 端口号 | 说明 |
|---------|--------|------|
| **前端服务** | `9528` | Vue开发服务器，固定不变 |
| **后端API** | `3000` | Node.js Express服务器 |
| **数据库** | `3306` | MariaDB数据库服务 |

### 🗄️ 数据库配置

- **数据库类型**: MariaDB (MySQL兼容)
- **数据库名**: `vue_admin`
- **用户名**: `vue_admin_user`
- **密码**: `vue_admin_2024`
- **主机**: `localhost`
- **端口**: `3306`

---

## 📁 配置文件位置

### 前端配置

#### 1. vue.config.js
```javascript
const port = 9528 // 固定前端端口为 9528
```
**文件路径**: `/home/vue-element-admin/vue.config.js`

#### 2. .env.development
```env
VUE_APP_BASE_API = 'http://103.246.246.11:3000'
VUE_APP_API_URL = 'http://103.246.246.11:3000'
VUE_APP_STORAGE_MODE = 'database'
VUE_APP_USE_DATABASE = true
```
**文件路径**: `/home/vue-element-admin/.env.development`

### 后端配置

#### 1. backend/.env
```env
# 固定后端端口 3000
PORT=3000

# 固定使用 MariaDB
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=vue_admin
DB_USER=vue_admin_user
DB_PASSWORD=vue_admin_2024

# 固定前端端口 9528（用于CORS）
FRONTEND_URL=http://localhost:9528
```
**文件路径**: `/home/vue-element-admin/backend/.env`

#### 2. backend/config/database.js
```javascript
const dbConfig = {
  dialect: 'mysql',  // MariaDB使用mysql驱动
  host: 'localhost',
  port: 3306,
  username: 'vue_admin_user',
  password: 'vue_admin_2024',
  database: 'vue_admin'
}
```
**文件路径**: `/home/vue-element-admin/backend/config/database.js`

---

## 🚀 启动方式

### 推荐：使用启动脚本（生产环境）

```bash
# 重启项目（生产环境推荐）
./restart-project.sh

# 或使用生产环境启动脚本
./production-start.sh
```

### 手动启动

```bash
# 1. 启动后端（端口3000）
cd /home/vue-element-admin/backend
node server.js

# 2. 启动前端（端口9528）
cd /home/vue-element-admin
npm run dev
```

---

## ✅ 验证配置

### 检查服务运行状态

```bash
# 检查端口占用
netstat -tlnp | grep -E ":(9528|3000|3306)"

# 检查后端服务
curl http://localhost:3000/health

# 检查前端服务
curl -I http://localhost:9528/
```

### 检查数据库连接

```bash
# 登录MariaDB
mysql -u vue_admin_user -pvue_admin_2024 -D vue_admin

# 查看数据库信息
SHOW TABLES;
```

---

## 🔒 安全注意事项

1. **生产环境部署前必须修改**:
   - JWT密钥: `backend/.env` 中的 `JWT_SECRET`
   - 数据库密码: 建议修改为更强的密码
   - 允许的访问IP: 配置防火墙规则

2. **当前配置适用于**:
   - 内网开发环境
   - 测试环境
   - 生产环境（修改安全配置后）

---

## 📝 配置修改记录

| 日期 | 修改内容 | 修改人 |
|------|---------|--------|
| 2025-10-18 | 固定前端端口9528，后端3000，数据库MariaDB | System |

---

## 🌐 访问地址

- **前端应用**: http://localhost:9528
- **后端API**: http://localhost:3000
- **API健康检查**: http://localhost:3000/health
- **外网访问**: http://103.246.246.11:9528 (前端)
- **外网API**: http://103.246.246.11:3000 (后端)

---

## 📞 故障排查

### 端口被占用
```bash
# 查找占用进程
lsof -i:9528
lsof -i:3000

# 停止相关进程
pkill -f "vue-cli-service"
pkill -f "node.*server.js"
```

### 数据库连接失败
```bash
# 检查MariaDB服务状态
systemctl status mariadb

# 重启MariaDB
systemctl restart mariadb

# 测试连接
mysql -u vue_admin_user -pvue_admin_2024 -e "SELECT 1;"
```

### 前端无法连接后端
1. 检查后端是否启动: `curl http://localhost:3000/health`
2. 检查防火墙规则
3. 检查 `.env.development` 中的 API 地址配置

---

## 💡 重要提示

1. ✅ **端口已固定**: 前端9528，后端3000，不会再动态改变
2. ✅ **数据库已固定**: 使用MariaDB，配置在 `backend/config/database.js`
3. ✅ **配置已统一**: 所有配置文件已同步更新
4. ⚠️ **重启生效**: 修改配置后需重启服务才能生效
5. ⚠️ **安全配置**: 生产环境部署前务必修改JWT密钥和数据库密码

---

**最后更新**: 2025-10-18  
**配置版本**: v1.0  
**维护状态**: ✅ 已固定配置
