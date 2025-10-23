# Vue Element Admin 部署指南

## 概述

本文档提供 Vue Element Admin 项目的完整部署指南，包括开发、测试和生产环境的部署方案。

## 系统要求

### 基础环境
- **Node.js**: >= 8.9.0
- **NPM**: >= 3.0.0
- **Git**: 最新版本（可选）

### 操作系统支持
- Linux (推荐)
- macOS
- Windows

### 浏览器支持
- Chrome >= 60
- Firefox >= 60
- Safari >= 12
- Edge >= 79

## 快速开始

### 1. 使用一键部署脚本

```bash
# 给脚本执行权限
chmod +x deploy.sh

# 开发环境部署
./deploy.sh

# 生产环境部署
./deploy.sh production --port 80

# 完整部署（包含 Nginx + SSL）
./deploy.sh production --nginx --ssl --backup
```

### 2. 手动部署

#### 开发环境
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

#### 生产环境
```bash
# 安装依赖
npm install

# 构建生产版本
npm run build:prod

# 部署到 Web 服务器
# 将 dist 目录部署到 Nginx、Apache 等 Web 服务器
```

## 部署选项

### 环境类型

| 环境 | 命令 | 说明 |
|------|------|------|
| 开发环境 | `./deploy.sh dev` | 启动开发服务器，支持热重载 |
| 预发环境 | `./deploy.sh staging` | 构建预发版本，用于测试 |
| 生产环境 | `./deploy.sh production` | 构建生产版本，优化性能 |

### 部署参数

| 参数 | 说明 | 示例 |
|------|------|------|
| `--port PORT` | 指定端口号 | `--port 8080` |
| `--skip-deps` | 跳过依赖安装 | `--skip-deps` |
| `--skip-build` | 跳过构建过程 | `--skip-build` |
| `--clean` | 清理缓存 | `--clean` |
| `--docker` | Docker 部署 | `--docker` |
| `--pm2` | PM2 进程管理 | `--pm2` |
| `--nginx` | 生成 Nginx 配置 | `--nginx` |
| `--ssl` | 配置 SSL 证书 | `--ssl` |
| `--backup` | 部署前备份 | `--backup` |

## 生产环境部署

### 1. 传统 Web 服务器部署

#### Nginx 配置
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/vue-element-admin/dist;
    index index.html;
    
    # 前端路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API 代理
    location /dev-api/ {
        proxy_pass http://your-backend-server/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Apache 配置 (.htaccess)
```apache
RewriteEngine On
RewriteBase /

# 前端路由支持
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# 静态资源缓存
<FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
</FilesMatch>
```

### 2. Docker 部署

#### 构建镜像
```bash
# 生成 Docker 配置
./deploy.sh production --docker

# 构建镜像
docker build -t vue-element-admin .

# 运行容器
docker run -d -p 80:80 --name vue-admin vue-element-admin
```

#### Docker Compose
```bash
# 使用 docker-compose 启动
docker-compose up -d

# 查看状态
docker-compose ps

# 停止服务
docker-compose down
```

### 3. PM2 部署

```bash
# 安装 PM2
npm install -g pm2

# 生成 PM2 配置
./deploy.sh production --pm2

# 启动应用
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs vue-element-admin
```

## CDN 集成

### 1. 配置 CDN 资源

编辑 `vue.config.js`:

```javascript
const cdn = {
  css: [
    'https://cdn.jsdelivr.net/npm/element-ui@2.13.2/lib/theme-chalk/index.css'
  ],
  js: [
    'https://cdn.jsdelivr.net/npm/vue@2.6.10/dist/vue.min.js',
    'https://cdn.jsdelivr.net/npm/element-ui@2.13.2/lib/index.js'
  ]
}

module.exports = {
  chainWebpack: config => {
    config.plugin('html').tap(args => {
      args[0].cdn = cdn
      return args
    })
  },
  
  configureWebpack: {
    externals: {
      'vue': 'Vue',
      'element-ui': 'ELEMENT'
    }
  }
}
```

### 2. 静态资源 CDN

推荐的 CDN 服务：
- **阿里云 OSS**
- **腾讯云 COS**
- **七牛云**
- **又拍云**

## 性能优化

### 1. 构建优化

```javascript
// vue.config.js
module.exports = {
  productionSourceMap: false,
  
  configureWebpack: {
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            name: 'chunk-vendors',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: 'initial'
          },
          elementUI: {
            name: 'chunk-elementUI',
            priority: 20,
            test: /[\\/]node_modules[\\/]_?element-ui(.*)/
          }
        }
      }
    }
  }
}
```

### 2. 服务器优化

- 启用 Gzip 压缩
- 配置静态资源缓存
- 使用 CDN 加速
- 启用 HTTP/2
- 配置缓存策略

## 监控和日志

### 1. 错误监控

推荐集成：
- **Sentry** - 错误追踪
- **LogRocket** - 用户行为录制
- **Bugsnag** - 错误监控

### 2. 性能监控

- **Google Analytics** - 用户分析
- **百度统计** - 访问统计
- **New Relic** - 性能监控

### 3. 日志管理

```javascript
// 生产环境日志配置
if (process.env.NODE_ENV === 'production') {
  // 禁用 console.log
  console.log = () => {}
  console.warn = () => {}
}
```

## 环境配置

### 开发环境 (.env.development)
```bash
NODE_ENV = 'development'
VUE_APP_BASE_API = '/dev-api'
VUE_APP_TITLE = 'Vue Element Admin (Dev)'
```

### 生产环境 (.env.production)
```bash
NODE_ENV = 'production'
VUE_APP_BASE_API = '/prod-api'
VUE_APP_TITLE = 'Vue Element Admin'
```

### 预发环境 (.env.staging)
```bash
NODE_ENV = 'production'
VUE_APP_BASE_API = '/stage-api'
VUE_APP_TITLE = 'Vue Element Admin (Staging)'
```

## HTTPS 配置

### 1. Let's Encrypt 免费证书

```bash
# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 申请证书
sudo certbot --nginx -d yourdomain.com

# 自动续期
sudo crontab -e
# 添加: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 2. 自签名证书（测试用）

```bash
# 生成私钥
openssl genrsa -out private.key 2048

# 生成证书
openssl req -new -x509 -key private.key -out certificate.crt -days 365
```

## 备份和恢复

### 1. 自动备份

```bash
# 执行备份
./backup.sh

# 定时备份 (添加到 crontab)
0 2 * * * /path/to/vue-element-admin/backup.sh
```

### 2. 恢复项目

```bash
# 解压备份文件
tar -xzf vue-element-admin_backup_YYYYMMDD_HHMMSS.tar.gz

# 进入备份目录
cd backup_YYYYMMDD_HHMMSS

# 执行恢复
./restore.sh target-directory
```

## 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 查找占用进程
   lsof -i :9529
   
   # 终止进程
   kill -9 PID
   ```

2. **依赖安装失败**
   ```bash
   # 清理缓存
   npm cache clean --force
   
   # 删除 node_modules
   rm -rf node_modules package-lock.json
   
   # 重新安装
   npm install
   ```

3. **构建失败**
   ```bash
   # 检查 Node.js 版本
   node --version
   
   # 增加内存限制
   export NODE_OPTIONS="--max-old-space-size=4096"
   npm run build:prod
   ```

4. **权限问题**
   ```bash
   # 修改文件权限
   chmod +x deploy.sh backup.sh
   
   # 修改目录权限
   sudo chown -R $USER:$USER /path/to/project
   ```

## 安全建议

1. **生产环境安全**
   - 禁用开发工具
   - 配置 CSP 头部
   - 启用 HTTPS
   - 定期更新依赖

2. **服务器安全**
   - 配置防火墙
   - 定期安全更新
   - 监控异常访问
   - 备份重要数据

3. **代码安全**
   - 不在前端存储敏感信息
   - 验证用户输入
   - 使用 HTTPS API
   - 定期安全审计

## 技术支持

如需技术支持，请联系：
- **开发者**: AI Assistant
- **文档**: 参考项目 README.md
- **更新时间**: $(date '+%Y-%m-%d')

---

*本文档随项目持续更新，请以最新版本为准。*# Vue Element Admin 部署指南

## 概述

本文档提供 Vue Element Admin 项目的完整部署指南，包括开发、测试和生产环境的部署方案。

## 系统要求

### 基础环境
- **Node.js**: >= 8.9.0
- **NPM**: >= 3.0.0
- **Git**: 最新版本（可选）

### 操作系统支持
- Linux (推荐)
- macOS
- Windows

### 浏览器支持
- Chrome >= 60
- Firefox >= 60
- Safari >= 12
- Edge >= 79

## 快速开始

### 1. 使用一键部署脚本

```bash
# 给脚本执行权限
chmod +x deploy.sh

# 开发环境部署
./deploy.sh

# 生产环境部署
./deploy.sh production --port 80

# 完整部署（包含 Nginx + SSL）
./deploy.sh production --nginx --ssl --backup
```

### 2. 手动部署

#### 开发环境
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

#### 生产环境
```bash
# 安装依赖
npm install

# 构建生产版本
npm run build:prod

# 部署到 Web 服务器
# 将 dist 目录部署到 Nginx、Apache 等 Web 服务器
```

## 部署选项

### 环境类型

| 环境 | 命令 | 说明 |
|------|------|------|
| 开发环境 | `./deploy.sh dev` | 启动开发服务器，支持热重载 |
| 预发环境 | `./deploy.sh staging` | 构建预发版本，用于测试 |
| 生产环境 | `./deploy.sh production` | 构建生产版本，优化性能 |

### 部署参数

| 参数 | 说明 | 示例 |
|------|------|------|
| `--port PORT` | 指定端口号 | `--port 8080` |
| `--skip-deps` | 跳过依赖安装 | `--skip-deps` |
| `--skip-build` | 跳过构建过程 | `--skip-build` |
| `--clean` | 清理缓存 | `--clean` |
| `--docker` | Docker 部署 | `--docker` |
| `--pm2` | PM2 进程管理 | `--pm2` |
| `--nginx` | 生成 Nginx 配置 | `--nginx` |
| `--ssl` | 配置 SSL 证书 | `--ssl` |
| `--backup` | 部署前备份 | `--backup` |

## 生产环境部署

### 1. 传统 Web 服务器部署

#### Nginx 配置
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/vue-element-admin/dist;
    index index.html;
    
    # 前端路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API 代理
    location /dev-api/ {
        proxy_pass http://your-backend-server/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Apache 配置 (.htaccess)
```apache
RewriteEngine On
RewriteBase /

# 前端路由支持
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# 静态资源缓存
<FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
</FilesMatch>
```

### 2. Docker 部署

#### 构建镜像
```bash
# 生成 Docker 配置
./deploy.sh production --docker

# 构建镜像
docker build -t vue-element-admin .

# 运行容器
docker run -d -p 80:80 --name vue-admin vue-element-admin
```

#### Docker Compose
```bash
# 使用 docker-compose 启动
docker-compose up -d

# 查看状态
docker-compose ps

# 停止服务
docker-compose down
```

### 3. PM2 部署

```bash
# 安装 PM2
npm install -g pm2

# 生成 PM2 配置
./deploy.sh production --pm2

# 启动应用
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs vue-element-admin
```

## CDN 集成

### 1. 配置 CDN 资源

编辑 `vue.config.js`:

```javascript
const cdn = {
  css: [
    'https://cdn.jsdelivr.net/npm/element-ui@2.13.2/lib/theme-chalk/index.css'
  ],
  js: [
    'https://cdn.jsdelivr.net/npm/vue@2.6.10/dist/vue.min.js',
    'https://cdn.jsdelivr.net/npm/element-ui@2.13.2/lib/index.js'
  ]
}

module.exports = {
  chainWebpack: config => {
    config.plugin('html').tap(args => {
      args[0].cdn = cdn
      return args
    })
  },
  
  configureWebpack: {
    externals: {
      'vue': 'Vue',
      'element-ui': 'ELEMENT'
    }
  }
}
```

### 2. 静态资源 CDN

推荐的 CDN 服务：
- **阿里云 OSS**
- **腾讯云 COS**
- **七牛云**
- **又拍云**

## 性能优化

### 1. 构建优化

```javascript
// vue.config.js
module.exports = {
  productionSourceMap: false,
  
  configureWebpack: {
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            name: 'chunk-vendors',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: 'initial'
          },
          elementUI: {
            name: 'chunk-elementUI',
            priority: 20,
            test: /[\\/]node_modules[\\/]_?element-ui(.*)/
          }
        }
      }
    }
  }
}
```

### 2. 服务器优化

- 启用 Gzip 压缩
- 配置静态资源缓存
- 使用 CDN 加速
- 启用 HTTP/2
- 配置缓存策略

## 监控和日志

### 1. 错误监控

推荐集成：
- **Sentry** - 错误追踪
- **LogRocket** - 用户行为录制
- **Bugsnag** - 错误监控

### 2. 性能监控

- **Google Analytics** - 用户分析
- **百度统计** - 访问统计
- **New Relic** - 性能监控

### 3. 日志管理

```javascript
// 生产环境日志配置
if (process.env.NODE_ENV === 'production') {
  // 禁用 console.log
  console.log = () => {}
  console.warn = () => {}
}
```

## 环境配置

### 开发环境 (.env.development)
```bash
NODE_ENV = 'development'
VUE_APP_BASE_API = '/dev-api'
VUE_APP_TITLE = 'Vue Element Admin (Dev)'
```

### 生产环境 (.env.production)
```bash
NODE_ENV = 'production'
VUE_APP_BASE_API = '/prod-api'
VUE_APP_TITLE = 'Vue Element Admin'
```

### 预发环境 (.env.staging)
```bash
NODE_ENV = 'production'
VUE_APP_BASE_API = '/stage-api'
VUE_APP_TITLE = 'Vue Element Admin (Staging)'
```

## HTTPS 配置

### 1. Let's Encrypt 免费证书

```bash
# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 申请证书
sudo certbot --nginx -d yourdomain.com

# 自动续期
sudo crontab -e
# 添加: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 2. 自签名证书（测试用）

```bash
# 生成私钥
openssl genrsa -out private.key 2048

# 生成证书
openssl req -new -x509 -key private.key -out certificate.crt -days 365
```

## 备份和恢复

### 1. 自动备份

```bash
# 执行备份
./backup.sh

# 定时备份 (添加到 crontab)
0 2 * * * /path/to/vue-element-admin/backup.sh
```

### 2. 恢复项目

```bash
# 解压备份文件
tar -xzf vue-element-admin_backup_YYYYMMDD_HHMMSS.tar.gz

# 进入备份目录
cd backup_YYYYMMDD_HHMMSS

# 执行恢复
./restore.sh target-directory
```

## 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 查找占用进程
   lsof -i :9529
   
   # 终止进程
   kill -9 PID
   ```

2. **依赖安装失败**
   ```bash
   # 清理缓存
   npm cache clean --force
   
   # 删除 node_modules
   rm -rf node_modules package-lock.json
   
   # 重新安装
   npm install
   ```

3. **构建失败**
   ```bash
   # 检查 Node.js 版本
   node --version
   
   # 增加内存限制
   export NODE_OPTIONS="--max-old-space-size=4096"
   npm run build:prod
   ```

4. **权限问题**
   ```bash
   # 修改文件权限
   chmod +x deploy.sh backup.sh
   
   # 修改目录权限
   sudo chown -R $USER:$USER /path/to/project
   ```

## 安全建议

1. **生产环境安全**
   - 禁用开发工具
   - 配置 CSP 头部
   - 启用 HTTPS
   - 定期更新依赖

2. **服务器安全**
   - 配置防火墙
   - 定期安全更新
   - 监控异常访问
   - 备份重要数据

3. **代码安全**
   - 不在前端存储敏感信息
   - 验证用户输入
   - 使用 HTTPS API
   - 定期安全审计

## 技术支持

如需技术支持，请联系：
- **开发者**: AI Assistant
- **文档**: 参考项目 README.md
- **更新时间**: $(date '+%Y-%m-%d')

---

*本文档随项目持续更新，请以最新版本为准。*