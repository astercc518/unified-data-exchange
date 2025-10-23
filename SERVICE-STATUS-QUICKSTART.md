# 服务状态功能快速启动指南

## 🚀 5分钟快速体验

### 第一步: 启动后端服务

```bash
# 进入后端目录
cd /home/vue-element-admin/backend

# 安装依赖(如果还未安装)
npm install

# 启动后端服务
npm start
```

**预期输出**:
```
✅ 数据库连接成功
📊 数据库模型同步完成
🚀 服务器启动成功
📍 服务地址: http://localhost:3000
```

### 第二步: 启动前端服务

```bash
# 在项目根目录打开新终端
cd /home/vue-element-admin

# 启动前端开发服务器
npm run dev
```

**预期输出**:
```
App running at:
- Local:   http://localhost:9528/
```

### 第三步: 访问首页查看服务状态

1. 打开浏览器访问: `http://localhost:9528`
2. 使用默认账号登录:
   - 用户名: `admin`
   - 密码: `123456`
3. 登录成功后,在首页Dashboard右侧查看"服务状态"卡片

### 第四步: 测试功能

#### 场景1: 查看正常状态
所有服务应显示绿色"运行中"状态

#### 场景2: 测试服务停止
1. 停止后端服务(Ctrl+C)
2. 等待30秒或点击"立即检查"
3. 后端和数据库服务应显示"已停止"

#### 场景3: 手动刷新
1. 点击"立即检查"按钮
2. 观察加载动画
3. 查看更新后的状态

## 🔍 使用独立测试工具

如果不想启动完整项目,可以使用独立的测试工具:

```bash
# 1. 确保后端服务正在运行
cd backend && npm start

# 2. 在浏览器中打开测试工具
# 方式1: 直接打开文件
file:///home/vue-element-admin/service-status-checker.html

# 方式2: 通过HTTP服务器
npx http-server . -p 8080
# 然后访问: http://localhost:8080/service-status-checker.html
```

## 📱 查看效果

### 管理员首页
服务状态卡片显示在首页右侧,与数据分布和系统健康卡片并列

### 客户首页
服务状态卡片显示在页面底部,在最近活动下方

### 代理首页
服务状态卡片显示在页面底部,在最近活动下方

## ⚙️ 配置说明

### 后端地址配置
如果后端不在默认端口3000,需要修改:

**文件**: `.env.development`
```env
VUE_APP_API_URL = 'http://localhost:3000'  # 修改为实际端口
```

### 刷新间隔配置
如果要修改自动刷新间隔(默认30秒):

**文件**: `src/views/dashboard/admin/components/ServiceStatusCard.vue`
```javascript
// 修改第196行
this.checkTimer = setInterval(() => {
  this.checkAllServices(true)
}, 30000)  // 改为需要的毫秒数
```

## 🛠️ 故障排查

### 问题1: 后端服务显示"已停止"

**原因**: 后端未启动或端口不对
**解决**:
```bash
# 检查后端是否运行
ps aux | grep "node.*server.js"

# 启动后端
cd backend && npm start
```

### 问题2: 数据库服务显示"错误"

**原因**: 数据库未启动或连接失败
**解决**:
```bash
# 检查MySQL/MariaDB状态
systemctl status mysql
# 或
systemctl status mariadb

# 启动数据库
sudo systemctl start mysql
```

### 问题3: CORS错误

**原因**: 跨域配置问题
**解决**: 检查`backend/server.js`中的CORS配置:
```javascript
app.use(cors({
  origin: 'http://localhost:9528',  // 确保与前端地址一致
  credentials: true
}))
```

### 问题4: 组件不显示

**原因**: 组件未正确导入
**解决**: 检查Dashboard文件是否正确导入:
```javascript
import ServiceStatusCard from './admin/components/ServiceStatusCard'

components: {
  ServiceStatusCard
}
```

## 📚 更多信息

- 详细功能说明: [首页服务状态功能说明.md](./首页服务状态功能说明.md)
- 实施总结: [首页服务状态实施总结.md](./首页服务状态实施总结.md)
- 项目启动: [QUICK-START.md](./QUICK-START.md)

## ✅ 验证清单

使用此清单验证功能是否正常:

- [ ] 后端服务已启动(http://localhost:3000)
- [ ] 前端服务已启动(http://localhost:9528)
- [ ] 可以成功登录系统
- [ ] 首页可以看到服务状态卡片
- [ ] 前端服务显示"运行中"(绿色)
- [ ] 后端服务显示"运行中"(绿色)
- [ ] 数据库服务显示"运行中"(绿色)
- [ ] 响应时间正常显示(<500ms)
- [ ] 可以点击"立即检查"手动刷新
- [ ] 30秒后自动刷新状态
- [ ] 停止后端后显示"已停止"状态
- [ ] 整体健康状态正确显示

## 🎯 下一步

功能验证通过后,可以:

1. 根据实际需求调整刷新间隔
2. 自定义服务状态卡片样式
3. 添加更多监控指标
4. 集成告警通知功能
5. 部署到生产环境

---

**快速启动指南版本**: v1.0
**更新时间**: 2025-10-13
