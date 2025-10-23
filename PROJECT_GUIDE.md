# Vue Element Admin 项目使用指南

## 🚀 快速开始

### 方式一：一键启动（推荐）
```bash
# 快速启动开发服务器
./start.sh
```

### 方式二：完整部署
```bash
# 开发环境部署
./deploy.sh

# 生产环境部署
./deploy.sh production --nginx --backup
```

### 方式三：手动启动
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 📦 脚本工具

| 脚本 | 功能 | 用法 |
|------|------|------|
| `start.sh` | 快速启动 | `./start.sh` |
| `deploy.sh` | 一键部署 | `./deploy.sh [环境] [选项]` |
| `backup.sh` | 项目备份 | `./backup.sh` |

## 🎯 主要功能

### 数据管理系统
- ✅ **数据上传** - 支持文件上传和数据类型自定义
- ✅ **数据列表** - 完整的增删改查和定价功能
- ✅ **资源中心** - 数据展示和购买功能
- ✅ **智能定价** - 根据时效性自动推荐价格

### 用户管理系统
- ✅ **多角色支持** - 管理员、代理、客户
- ✅ **权限控制** - 基于角色的访问控制
- ✅ **用户中心** - 个人信息和账户管理

### 系统功能
- ✅ **国际化** - 中英文界面切换
- ✅ **响应式设计** - 支持移动端和桌面端
- ✅ **数据持久化** - localStorage 数据存储
- ✅ **实时同步** - 数据实时更新和同步

## 🛠️ 技术栈

- **前端框架**: Vue.js 2.6.10
- **UI 组件**: Element UI 2.13.2
- **构建工具**: Vue CLI 4.4.4
- **状态管理**: Vuex 3.1.0
- **路由管理**: Vue Router 3.0.2
- **HTTP 客户端**: Axios 0.18.1
- **样式预处理**: Sass
- **代码规范**: ESLint

## 📱 页面路由

| 路径 | 页面 | 功能 |
|------|------|------|
| `/dashboard` | 首页 | 数据概览和统计 |
| `/data/upload` | 数据上传 | 文件上传和数据录入 |
| `/data/library` | 数据列表 | 数据管理和定价 |
| `/resource/center` | 资源中心 | 数据展示和购买 |
| `/user/customer-list` | 客户列表 | 客户管理 |
| `/agent/list` | 代理列表 | 代理管理 |
| `/order/list` | 订单列表 | 订单管理 |

## 🔧 开发环境

### 环境要求
- Node.js >= 8.9.0
- NPM >= 3.0.0
- 现代浏览器（Chrome、Firefox、Safari、Edge）

### 开发命令
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build:prod

# 构建预发版本
npm run build:stage

# 代码检查
npm run lint

# 运行测试
npm run test:unit
```

## 🚀 部署方案

### 开发环境
```bash
./deploy.sh dev --port 9529
```

### 生产环境
```bash
# 基础部署
./deploy.sh production

# 完整部署（Nginx + SSL + PM2）
./deploy.sh production --nginx --ssl --pm2 --backup

# Docker 部署
./deploy.sh production --docker
```

## 📊 数据存储结构

### localStorage 数据键

| 键名 | 数据类型 | 说明 |
|------|---------|------|
| `dataList` | Array | 上传的数据列表 |
| `userList` | Array | 用户列表 |
| `agentList` | Array | 代理列表 |
| `orderList` | Array | 订单列表 |
| `currentUser` | Object | 当前登录用户 |

### 数据分类规则
根据时效性将数据归类到三个大库：
- **3天内** - 高时效数据，价格较高
- **30天内** - 中等时效数据，价格适中  
- **30天以上** - 长期有效数据，价格较低

## 🎨 自定义功能

### 1. 数据上传功能
- 支持 TXT 文件上传
- 自动计算文件行数
- 数据类型自定义输入
- 运营商分布按市场份额分配
- 支持备注信息

### 2. 数据列表管理
- 实时显示已上传数据
- 支持多维度筛选
- 增删改查操作
- 智能定价推荐
- 利润率计算

### 3. 资源中心
- 数据展示和搜索
- 国家智能搜索
- 购买流程
- 价格计算

## 🔒 权限系统

### 角色权限
- **管理员 (admin)**: 完整系统访问权限
- **代理 (agent)**: 部分管理功能
- **客户 (customer)**: 购买和查看权限

### 页面权限控制
```javascript
// 路由守卫示例
{
  path: '/data/library',
  meta: {
    roles: ['admin'] // 仅管理员可访问
  }
}
```

## 🌐 国际化支持

### 支持语言
- 中文 (zh-CN)
- 英文 (en-US)

### 语言文件
- `/src/lang/index.js` - 语言配置

## 📱 响应式设计

### 断点设置
- **手机**: < 768px
- **平板**: 768px - 1024px
- **桌面**: > 1024px

### 适配特性
- 导航菜单自适应折叠
- 表格横向滚动
- 表单布局自适应
- 图表响应式缩放

## 🔍 测试工具

项目包含多个测试页面：
- `data-library-test.html` - 数据列表功能测试
- `debug-data-sync.html` - 数据同步调试
- `system-test.html` - 系统功能测试
- `database-rename-verification.html` - 功能验证

## 📝 更新日志

### v4.4.0 (最新)
- ✅ 数据库功能重构为数据列表
- ✅ 增加智能定价系统
- ✅ 优化数据同步机制
- ✅ 完善国家搜索功能
- ✅ 添加完整的备份部署脚本

### 历史版本
详见 `TEST-RESULTS.md` 和相关文档

## 🛠️ 故障排除

### 常见问题
1. **端口占用**: 使用 `./start.sh` 自动处理
2. **依赖安装失败**: 清理缓存后重新安装
3. **页面无法访问**: 检查服务器状态和端口配置
4. **数据不显示**: 检查 localStorage 和控制台错误

### 调试工具
- 浏览器开发者工具
- Vue DevTools 插件
- 项目内置调试页面

## 📞 技术支持

- **开发者**: AI Assistant
- **项目地址**: `/home/vue-element-admin`
- **文档更新**: 2025-10-10
- **技术栈版本**: Vue 2.x + Element UI 2.x

---

## 🎉 快速体验

想要快速体验系统功能？只需要一个命令：

```bash
./start.sh
```

系统将自动检查环境、安装依赖、启动服务器，然后访问 http://localhost:9529 即可开始使用！

---

*本指南涵盖了项目的主要功能和使用方法，如有疑问请参考相关文档或联系技术支持。*# Vue Element Admin 项目使用指南

## 🚀 快速开始

### 方式一：一键启动（推荐）
```bash
# 快速启动开发服务器
./start.sh
```

### 方式二：完整部署
```bash
# 开发环境部署
./deploy.sh

# 生产环境部署
./deploy.sh production --nginx --backup
```

### 方式三：手动启动
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 📦 脚本工具

| 脚本 | 功能 | 用法 |
|------|------|------|
| `start.sh` | 快速启动 | `./start.sh` |
| `deploy.sh` | 一键部署 | `./deploy.sh [环境] [选项]` |
| `backup.sh` | 项目备份 | `./backup.sh` |

## 🎯 主要功能

### 数据管理系统
- ✅ **数据上传** - 支持文件上传和数据类型自定义
- ✅ **数据列表** - 完整的增删改查和定价功能
- ✅ **资源中心** - 数据展示和购买功能
- ✅ **智能定价** - 根据时效性自动推荐价格

### 用户管理系统
- ✅ **多角色支持** - 管理员、代理、客户
- ✅ **权限控制** - 基于角色的访问控制
- ✅ **用户中心** - 个人信息和账户管理

### 系统功能
- ✅ **国际化** - 中英文界面切换
- ✅ **响应式设计** - 支持移动端和桌面端
- ✅ **数据持久化** - localStorage 数据存储
- ✅ **实时同步** - 数据实时更新和同步

## 🛠️ 技术栈

- **前端框架**: Vue.js 2.6.10
- **UI 组件**: Element UI 2.13.2
- **构建工具**: Vue CLI 4.4.4
- **状态管理**: Vuex 3.1.0
- **路由管理**: Vue Router 3.0.2
- **HTTP 客户端**: Axios 0.18.1
- **样式预处理**: Sass
- **代码规范**: ESLint

## 📱 页面路由

| 路径 | 页面 | 功能 |
|------|------|------|
| `/dashboard` | 首页 | 数据概览和统计 |
| `/data/upload` | 数据上传 | 文件上传和数据录入 |
| `/data/library` | 数据列表 | 数据管理和定价 |
| `/resource/center` | 资源中心 | 数据展示和购买 |
| `/user/customer-list` | 客户列表 | 客户管理 |
| `/agent/list` | 代理列表 | 代理管理 |
| `/order/list` | 订单列表 | 订单管理 |

## 🔧 开发环境

### 环境要求
- Node.js >= 8.9.0
- NPM >= 3.0.0
- 现代浏览器（Chrome、Firefox、Safari、Edge）

### 开发命令
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build:prod

# 构建预发版本
npm run build:stage

# 代码检查
npm run lint

# 运行测试
npm run test:unit
```

## 🚀 部署方案

### 开发环境
```bash
./deploy.sh dev --port 9529
```

### 生产环境
```bash
# 基础部署
./deploy.sh production

# 完整部署（Nginx + SSL + PM2）
./deploy.sh production --nginx --ssl --pm2 --backup

# Docker 部署
./deploy.sh production --docker
```

## 📊 数据存储结构

### localStorage 数据键

| 键名 | 数据类型 | 说明 |
|------|---------|------|
| `dataList` | Array | 上传的数据列表 |
| `userList` | Array | 用户列表 |
| `agentList` | Array | 代理列表 |
| `orderList` | Array | 订单列表 |
| `currentUser` | Object | 当前登录用户 |

### 数据分类规则
根据时效性将数据归类到三个大库：
- **3天内** - 高时效数据，价格较高
- **30天内** - 中等时效数据，价格适中  
- **30天以上** - 长期有效数据，价格较低

## 🎨 自定义功能

### 1. 数据上传功能
- 支持 TXT 文件上传
- 自动计算文件行数
- 数据类型自定义输入
- 运营商分布按市场份额分配
- 支持备注信息

### 2. 数据列表管理
- 实时显示已上传数据
- 支持多维度筛选
- 增删改查操作
- 智能定价推荐
- 利润率计算

### 3. 资源中心
- 数据展示和搜索
- 国家智能搜索
- 购买流程
- 价格计算

## 🔒 权限系统

### 角色权限
- **管理员 (admin)**: 完整系统访问权限
- **代理 (agent)**: 部分管理功能
- **客户 (customer)**: 购买和查看权限

### 页面权限控制
```javascript
// 路由守卫示例
{
  path: '/data/library',
  meta: {
    roles: ['admin'] // 仅管理员可访问
  }
}
```

## 🌐 国际化支持

### 支持语言
- 中文 (zh-CN)
- 英文 (en-US)

### 语言文件
- `/src/lang/index.js` - 语言配置

## 📱 响应式设计

### 断点设置
- **手机**: < 768px
- **平板**: 768px - 1024px
- **桌面**: > 1024px

### 适配特性
- 导航菜单自适应折叠
- 表格横向滚动
- 表单布局自适应
- 图表响应式缩放

## 🔍 测试工具

项目包含多个测试页面：
- `data-library-test.html` - 数据列表功能测试
- `debug-data-sync.html` - 数据同步调试
- `system-test.html` - 系统功能测试
- `database-rename-verification.html` - 功能验证

## 📝 更新日志

### v4.4.0 (最新)
- ✅ 数据库功能重构为数据列表
- ✅ 增加智能定价系统
- ✅ 优化数据同步机制
- ✅ 完善国家搜索功能
- ✅ 添加完整的备份部署脚本

### 历史版本
详见 `TEST-RESULTS.md` 和相关文档

## 🛠️ 故障排除

### 常见问题
1. **端口占用**: 使用 `./start.sh` 自动处理
2. **依赖安装失败**: 清理缓存后重新安装
3. **页面无法访问**: 检查服务器状态和端口配置
4. **数据不显示**: 检查 localStorage 和控制台错误

### 调试工具
- 浏览器开发者工具
- Vue DevTools 插件
- 项目内置调试页面

## 📞 技术支持

- **开发者**: AI Assistant
- **项目地址**: `/home/vue-element-admin`
- **文档更新**: 2025-10-10
- **技术栈版本**: Vue 2.x + Element UI 2.x

---

## 🎉 快速体验

想要快速体验系统功能？只需要一个命令：

```bash
./start.sh
```

系统将自动检查环境、安装依赖、启动服务器，然后访问 http://localhost:9529 即可开始使用！

---

*本指南涵盖了项目的主要功能和使用方法，如有疑问请参考相关文档或联系技术支持。*