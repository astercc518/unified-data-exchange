# Vue Element Admin - 数据管理系统

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)
[![Vue](https://img.shields.io/badge/vue-2.6.10-brightgreen.svg)](https://vuejs.org/)

一个基于 Vue.js 和 Element UI 的现代化数据管理系统，提供完整的用户管理、数据管理、订单管理和系统配置功能。

## ✨ 特性

- 🎨 **现代化界面** - 基于 Element UI 的精美界面设计
- 👥 **多角色权限** - 支持管理员、代理、客户三种角色
- 📊 **数据管理** - 完整的数据上传、发布、定价功能
- 🛒 **订单系统** - 购买流程、订单管理、发货管理
- ⭐ **收藏订阅** - 数据收藏和智能推荐订阅中心
- 💰 **财务管理** - 充值记录、结算管理、佣金计算
- 🌐 **国际化** - 支持中英文切换
- 📱 **响应式设计** - 完美适配各种设备

## 🚀 快速开始

### 前置要求

- Node.js >= 14.0.0
- MySQL >= 5.7
- PM2 (生产环境推荐)

### 一键部署

```bash
# 克隆项目
git clone https://github.com/your-username/vue-element-admin.git
cd vue-element-admin

# 运行一键部署脚本
chmod +x deploy.sh
./deploy.sh
```

### 手动部署

#### 1. 安装依赖

```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd backend
npm install
cd ..
```

#### 2. 配置数据库

创建 MySQL 数据库：
```sql
CREATE DATABASE vue_admin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

配置数据库连接（`backend/config/database.js`）：
```javascript
{
  host: 'localhost',
  port: 3306,
  database: 'vue_admin',
  username: 'root',
  password: 'your_password'
}
```

#### 3. 初始化数据库

```bash
node backend/scripts/init-database.js
```

#### 4. 启动服务

**开发环境：**
```bash
# 启动后端
npm run backend

# 启动前端（新终端）
npm run dev
```

**生产环境（使用 PM2）：**
```bash
# 启动所有服务
pm2 start ecosystem.config.js

# 查看服务状态
pm2 status

# 查看日志
pm2 logs

# 重启服务
pm2 restart all
```

## 📖 项目结构

```
vue-element-admin/
├── backend/                 # 后端代码
│   ├── config/             # 配置文件
│   ├── models/             # 数据模型
│   ├── routes/             # API 路由
│   ├── middleware/         # 中间件
│   ├── utils/              # 工具函数
│   └── server.js           # 服务入口
├── src/                    # 前端代码
│   ├── api/               # API 接口
│   ├── components/        # 公共组件
│   ├── layout/            # 布局组件
│   ├── router/            # 路由配置
│   ├── store/             # Vuex 状态管理
│   ├── views/             # 页面组件
│   ├── lang/              # 国际化
│   └── styles/            # 样式文件
├── public/                # 静态资源
├── ecosystem.config.js    # PM2 配置
├── deploy.sh             # 一键部署脚本
├── package.json          # 项目配置
└── README.md            # 项目说明
```

## 🔑 默认账号

| 角色 | 账号 | 密码 | 说明 |
|------|------|------|------|
| 管理员 | admin | admin123 | 拥有全部权限 |
| 代理 | agent001 | agent123 | 管理客户和订单 |
| 客户 | KL08066V01 | 123456 | 查看和购买数据 |

**⚠️ 重要：首次登录后请立即修改默认密码！**

## 📚 功能模块

### 用户管理
- 客户列表和管理
- 代理列表和管理
- 充值记录查询
- 客户结算管理
- 代理结算管理

### 数据管理
- 数据上传（Excel/CSV）
- 数据列表和筛选
- 定价模板管理
- 数据发布测试
- 数据处理工具

### 资源中心
- 可购买数据浏览
- 订阅中心（智能推荐）
- 数据收藏功能
- 数据详情查看

### 订单管理
- 订单列表查询
- 订单审核处理
- 订单发货管理
- 发货配置设置

### 数据反馈
- 反馈提交
- 反馈列表查询
- 反馈详情查看

### 系统管理
- 系统配置（Logo/项目名称）
- 页面样式设置
- 服务器状态监控
- 操作日志查询
- 密码修改
- 安全管理

## 🔧 技术栈

### 前端
- Vue.js 2.6.10
- Element UI 2.13.2
- Vuex 3.1.0
- Vue Router 3.0.6
- Axios 0.18.1
- Vue I18n 8.15.3

### 后端
- Node.js
- Express 4.17.1
- Sequelize 6.x (ORM)
- MySQL
- JSON Web Token (JWT)
- Winston (日志)

## 🌍 环境变量

创建 `backend/.env` 文件：

```env
# 服务器配置
PORT=3000
NODE_ENV=production

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=vue_admin
DB_USER=root
DB_PASSWORD=your_password

# JWT 密钥
JWT_SECRET=your-secret-key-change-in-production

# 日志配置
LOG_LEVEL=info
```

## 📊 API 文档

主要 API 接口：

### 认证相关
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/info` - 获取用户信息
- `POST /api/auth/logout` - 用户登出
- `POST /api/auth/change-password` - 修改密码

### 用户管理
- `GET /api/users` - 获取用户列表
- `POST /api/users` - 创建用户
- `PUT /api/users/:id` - 更新用户
- `DELETE /api/users/:id` - 删除用户

### 数据管理
- `GET /api/data-library/published` - 获取已发布数据
- `GET /api/data-library/subscription/:customerId` - 获取订阅数据
- `POST /api/favorites` - 添加收藏
- `DELETE /api/favorites/:id` - 取消收藏

### 订单管理
- `GET /api/orders` - 获取订单列表
- `POST /api/orders` - 创建订单
- `PUT /api/orders/:id` - 更新订单
- `POST /api/orders/:id/deliver` - 订单发货

## 🛠️ 开发指南

### 添加新页面

1. 在 `src/views/` 创建页面组件
2. 在 `src/router/index.js` 添加路由配置
3. 在 `src/lang/index.js` 添加国际化文本
4. 如需 API，在 `src/api/` 和 `backend/routes/` 添加接口

### 添加新角色权限

1. 在路由配置的 `meta.roles` 中添加角色
2. 在后端中间件添加权限验证
3. 更新前端权限判断逻辑

## 🔒 安全建议

1. **修改默认密码** - 部署后立即修改所有默认账号密码
2. **更新 JWT 密钥** - 使用强随机密钥替换默认值
3. **HTTPS** - 生产环境启用 HTTPS
4. **防火墙** - 配置防火墙规则，仅开放必要端口
5. **定期备份** - 定期备份数据库和重要文件
6. **更新依赖** - 定期更新依赖包，修复安全漏洞

## 📈 性能优化

- 使用 PM2 cluster 模式提高并发处理能力
- 启用 Webpack 缓存加速编译
- 使用 CDN 加载第三方库
- 启用 gzip 压缩
- 数据库连接池优化
- Redis 缓存热点数据（可选）

## 🐛 常见问题

### 1. 端口被占用

```bash
# 查看占用端口的进程
lsof -i :9527
lsof -i :3000

# 杀死进程
kill -9 <PID>
```

### 2. 数据库连接失败

检查：
- 数据库服务是否启动
- 数据库配置是否正确
- 用户权限是否足够

### 3. PM2 服务异常

```bash
# 查看详细日志
pm2 logs --lines 100

# 重启服务
pm2 restart all

# 重载配置
pm2 reload ecosystem.config.js
```

### 4. 前端编译错误

```bash
# 清除缓存
rm -rf node_modules/.cache

# 重新安装依赖
rm -rf node_modules
npm install
```

## 📝 更新日志

### v1.0.0 (2025-10-23)
- ✨ 初始版本发布
- 👥 用户管理系统
- 📊 数据管理功能
- 🛒 订单管理系统
- ⭐ 收藏订阅功能
- 🌐 国际化支持
- 🎨 系统配置功能

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 开源协议

本项目基于 [MIT](LICENSE) 协议开源。

## 👨‍💻 联系方式

- 项目主页：[https://github.com/your-username/vue-element-admin](https://github.com/your-username/vue-element-admin)
- 问题反馈：[https://github.com/your-username/vue-element-admin/issues](https://github.com/your-username/vue-element-admin/issues)

## 🙏 鸣谢

- [Vue.js](https://vuejs.org/)
- [Element UI](https://element.eleme.io/)
- [vue-element-admin](https://github.com/PanJiaChen/vue-element-admin)

---

⭐ 如果这个项目对你有帮助，请给它一个星标！
