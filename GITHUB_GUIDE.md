# GitHub 上传和部署指南

本指南将帮助您将项目上传到 GitHub 并部署到服务器。

## 📤 上传到 GitHub

### 1. 创建 GitHub 仓库

1. 访问 [GitHub](https://github.com)
2. 点击右上角 `+` → `New repository`
3. 填写仓库信息：
   - Repository name: `vue-element-admin`（或其他名称）
   - Description: `基于 Vue.js 和 Element UI 的数据管理系统`
   - 选择 `Public` 或 `Private`
   - **不要** 勾选 "Initialize this repository with a README"
4. 点击 `Create repository`

### 2. 初始化本地仓库并上传

在项目根目录执行以下命令：

```bash
# 初始化 Git 仓库（如果还未初始化）
git init

# 添加所有文件到暂存区
git add .

# 提交更改
git commit -m "Initial commit: Vue Element Admin 数据管理系统"

# 添加远程仓库（替换为您的 GitHub 用户名和仓库名）
git remote add origin https://github.com/astercc518/vue-element-admin.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

### 3. 验证上传

1. 刷新 GitHub 仓库页面
2. 确认所有文件已上传
3. 检查 README.md 是否正确显示

## 🔐 配置敏感信息

上传前请确保以下文件已被 `.gitignore` 排除：

- ✅ `backend/config/database.js` - 数据库配置
- ✅ `backend/.env` - 环境变量
- ✅ `node_modules/` - 依赖文件
- ✅ `logs/` - 日志文件
- ✅ `uploads/` - 上传文件

您需要创建 **示例配置文件** 供其他人参考：

### 创建数据库配置示例

```bash
cat > backend/config/database.example.js << 'EOF'
/**
 * 数据库配置示例
 * 使用前请复制为 database.js 并修改配置
 */
module.exports = {
  host: 'localhost',
  port: 3306,
  database: 'vue_admin',
  username: 'root',
  password: 'your_password_here',
  dialect: 'mysql',
  timezone: '+08:00',
  logging: false,
  pool: {
    max: 20,
    min: 2,
    acquire: 60000,
    idle: 30000,
    evict: 60000
  }
};
EOF
```

### 创建环境变量示例

```bash
cat > backend/.env.example << 'EOF'
# 服务器配置
PORT=3000
NODE_ENV=production

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=vue_admin
DB_USER=root
DB_PASSWORD=your_password_here

# JWT 密钥（请修改为随机字符串）
JWT_SECRET=your-secret-key-change-in-production

# 日志配置
LOG_LEVEL=info
EOF
```

## 🚀 从 GitHub 部署

### 方法一：一键部署脚本（推荐）

```bash
# 1. 克隆仓库
git clone https://github.com/astercc518/vue-element-admin.git
cd vue-element-admin

# 2. 运行一键部署脚本
chmod +x deploy.sh
./deploy.sh
```

脚本会自动完成：
- ✅ 环境检查（Node.js, MySQL, PM2）
- ✅ 依赖安装
- ✅ 数据库配置
- ✅ 数据库初始化
- ✅ 前端构建
- ✅ PM2 服务启动

### 方法二：手动部署

#### 1. 克隆项目

```bash
git clone https://github.com/astercc518/vue-element-admin.git
cd vue-element-admin
```

#### 2. 安装依赖

```bash
# 安装前端依赖
npm install --legacy-peer-deps

# 安装后端依赖
cd backend
npm install
cd ..
```

#### 3. 配置数据库

```bash
# 复制配置示例
cp backend/config/database.example.js backend/config/database.js

# 编辑配置文件
vim backend/config/database.js
```

修改数据库连接信息：
```javascript
{
  host: 'localhost',      // 数据库主机
  port: 3306,            // 数据库端口
  database: 'vue_admin', // 数据库名称
  username: 'root',      // 数据库用户名
  password: 'your_password' // 数据库密码
}
```

#### 4. 创建数据库

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS vue_admin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

#### 5. 初始化数据库

```bash
node backend/scripts/init-database.js
```

#### 6. 启动服务

**开发环境：**
```bash
# 启动后端（终端 1）
npm run backend

# 启动前端（终端 2）
npm run dev
```

**生产环境：**
```bash
# 构建前端
npm run build:prod

# 使用 PM2 启动
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🌐 服务器部署

### 1. 准备服务器

系统要求：
- CentOS 7+ / Ubuntu 18.04+ / Debian 10+
- 2GB+ RAM
- 20GB+ 磁盘空间
- 开放端口：22（SSH）、9527（前端）、3000（后端）

### 2. 安装环境

```bash
# 安装 Node.js 14+
curl -fsSL https://rpm.nodesource.com/setup_14.x | sudo bash -
sudo yum install -y nodejs

# 安装 MySQL
sudo yum install -y mysql-server
sudo systemctl start mysqld
sudo systemctl enable mysqld

# 安装 Git
sudo yum install -y git

# 安装 PM2
sudo npm install -g pm2
```

### 3. 克隆并部署

```bash
# 克隆项目
cd /var/www
git clone https://github.com/astercc518/vue-element-admin.git
cd vue-element-admin

# 运行一键部署
chmod +x deploy.sh
./deploy.sh
```

### 4. 配置防火墙

```bash
# CentOS/RHEL
sudo firewall-cmd --zone=public --add-port=9527/tcp --permanent
sudo firewall-cmd --zone=public --add-port=3000/tcp --permanent
sudo firewall-cmd --reload

# Ubuntu/Debian
sudo ufw allow 9527/tcp
sudo ufw allow 3000/tcp
sudo ufw reload
```

### 5. 配置 Nginx（可选，用于反向代理）

```bash
# 安装 Nginx
sudo yum install -y nginx

# 创建配置文件
sudo vim /etc/nginx/conf.d/vue-admin.conf
```

Nginx 配置示例：
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端
    location / {
        proxy_pass http://localhost:9527;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 后端 API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
    }
}
```

启动 Nginx：
```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

## 🔄 更新项目

### 从 GitHub 拉取更新

```bash
# 进入项目目录
cd /path/to/vue-element-admin

# 拉取最新代码
git pull origin main

# 安装新依赖
npm install --legacy-peer-deps
cd backend && npm install && cd ..

# 重新构建前端
npm run build:prod

# 重启服务
pm2 restart all
```

### 推送本地更改到 GitHub

```bash
# 查看更改
git status

# 添加更改
git add .

# 提交更改
git commit -m "描述你的更改"

# 推送到 GitHub
git push origin main
```

## 📊 监控和维护

### PM2 常用命令

```bash
# 查看服务状态
pm2 status

# 查看日志
pm2 logs

# 重启服务
pm2 restart all

# 停止服务
pm2 stop all

# 删除服务
pm2 delete all

# 查看监控面板
pm2 monit
```

### 数据库备份

```bash
# 备份数据库
mysqldump -u root -p vue_admin > backup_$(date +%Y%m%d_%H%M%S).sql

# 恢复数据库
mysql -u root -p vue_admin < backup_20250123_120000.sql
```

### 日志管理

```bash
# 查看后端日志
pm2 logs backend

# 查看前端日志
pm2 logs frontend

# 清理日志
pm2 flush
```

## 🐛 常见问题

### 1. Git 推送失败

**问题：** `Permission denied (publickey)`

**解决：**
```bash
# 配置 Git 用户信息
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 使用 HTTPS 而不是 SSH
git remote set-url origin https://github.com/astercc518/vue-element-admin.git
```

### 2. 大文件上传失败

**问题：** Git 拒绝上传大文件

**解决：**
```bash
# 增加 Git 缓冲区大小
git config --global http.postBuffer 524288000

# 或使用 Git LFS 管理大文件
git lfs install
git lfs track "*.zip"
```

### 3. 端口被占用

**问题：** 端口 9527 或 3000 已被占用

**解决：**
```bash
# 查找占用端口的进程
lsof -i :9527
lsof -i :3000

# 杀死进程
kill -9 <PID>

# 或修改配置使用其他端口
```

### 4. 数据库连接失败

**问题：** `ER_ACCESS_DENIED_ERROR`

**解决：**
```bash
# 检查 MySQL 用户权限
mysql -u root -p
GRANT ALL PRIVILEGES ON vue_admin.* TO 'root'@'localhost' IDENTIFIED BY 'password';
FLUSH PRIVILEGES;
```

## 🔒 安全建议

1. **使用 HTTPS**
   - 申请 SSL 证书（Let's Encrypt 免费）
   - 配置 Nginx HTTPS

2. **修改默认密码**
   - 修改所有默认账号密码
   - 使用强密码策略

3. **更新 JWT 密钥**
   - 生成随机密钥
   - 定期轮换密钥

4. **配置防火墙**
   - 只开放必要端口
   - 限制 IP 访问

5. **定期备份**
   - 数据库每日备份
   - 代码定期推送到 GitHub

6. **监控日志**
   - 定期检查错误日志
   - 监控异常访问

## 📞 获取帮助

- 📖 阅读 [README.md](README.md)
- 🐛 提交 [Issue](https://github.com/astercc518/vue-element-admin/issues)
- 💬 参与 [Discussions](https://github.com/astercc518/vue-element-admin/discussions)

---

祝您部署成功！🎉
