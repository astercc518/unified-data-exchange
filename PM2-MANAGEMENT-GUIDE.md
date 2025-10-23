# PM2 进程管理快速指南

## 📋 系统配置完成

✅ **PM2 进程管理器已配置完成**
- 前后端服务已使用 PM2 托管
- 已配置开机自启动
- 服务崩溃时自动重启
- SSH 会话断开不影响服务运行

---

## 🚀 服务信息

### 当前运行的服务

| 服务名 | 端口 | 状态 | 说明 |
|--------|------|------|------|
| backend | 3000 | ✅ online | 后端 API 服务 |
| frontend | 9527 | ✅ online | 前端开发服务器 |

### 访问地址

- **前端**: http://localhost:9527
- **后端API**: http://localhost:3000
- **健康检查**: http://localhost:3000/health

---

## 🔧 常用 PM2 命令

### 查看服务状态
```bash
# 查看所有服务状态
pm2 status

# 查看详细信息
pm2 list

# 查看实时监控
pm2 monit
```

### 查看日志
```bash
# 查看所有日志
pm2 logs

# 查看后端日志
pm2 logs backend

# 查看前端日志
pm2 logs frontend

# 清空日志
pm2 flush
```

### 重启服务
```bash
# 重启所有服务
pm2 restart all

# 重启后端
pm2 restart backend

# 重启前端
pm2 restart frontend

# 无停机时间重启（推荐）
pm2 reload all
```

### 停止服务
```bash
# 停止所有服务
pm2 stop all

# 停止后端
pm2 stop backend

# 停止前端
pm2 stop frontend
```

### 启动服务
```bash
# 使用配置文件启动
pm2 start ecosystem.config.js

# 启动单个服务
pm2 start backend
pm2 start frontend
```

### 删除服务
```bash
# 删除所有服务（从 PM2 列表中移除）
pm2 delete all

# 删除单个服务
pm2 delete backend
pm2 delete frontend
```

---

## 📊 监控和诊断

### 查看详细信息
```bash
# 查看服务详细信息
pm2 describe backend
pm2 describe frontend

# 查看内存使用
pm2 monit

# 查看进程信息
pm2 info backend
```

### 性能监控
```bash
# 安装 PM2 Plus（可选的云端监控）
pm2 plus

# 查看 CPU 和内存使用
pm2 monit
```

---

## 🔄 开机自启动

### 当前配置
✅ **已配置开机自启动**
- Systemd 服务: `pm2-root.service`
- 服务将在系统重启后自动启动

### 相关命令
```bash
# 查看自启动状态
systemctl status pm2-root

# 禁用自启动
pm2 unstartup systemd

# 重新启用自启动
pm2 startup
pm2 save
```

---

## 📁 日志文件位置

### PM2 日志
- **后端错误日志**: `/tmp/pm2-backend-error.log`
- **后端输出日志**: `/tmp/pm2-backend-out.log`
- **后端合并日志**: `/tmp/pm2-backend-combined.log`
- **前端错误日志**: `/tmp/pm2-frontend-error.log`
- **前端输出日志**: `/tmp/pm2-frontend-out.log`
- **前端合并日志**: `/tmp/pm2-frontend-combined.log`

### 查看日志
```bash
# 使用 PM2 查看
pm2 logs

# 使用 tail 查看
tail -f /tmp/pm2-backend-out.log
tail -f /tmp/pm2-frontend-out.log
```

---

## ⚙️ 配置文件

### ecosystem.config.js
位置: `/home/vue-element-admin/ecosystem.config.js`

这个配置文件定义了：
- 服务名称和启动脚本
- 运行参数和环境变量
- 日志文件位置
- 自动重启规则
- **内存限制**: 后端2GB，前端3GB（已根据服务器15GB内存优化）
- **重启保护**: 最小运行时间、重启延迟、最大重启次数
- **优雅关闭**: kill_timeout 配置
- **日志时间格式**: 带时间戳的日志记录

### 性能优化配置详情

#### 后端服务
- `max_memory_restart: '2G'` - 内存限制2GB
- `min_uptime: '10s'` - 最小运行10秒才算稳定
- `max_restarts: 10` - 最多重启10次
- `restart_delay: 4000` - 重启延迟4秒
- `kill_timeout: 5000` - 优雅关闭超时5秒
- `listen_timeout: 10000` - 监听超时10秒

#### 前端服务
- `max_memory_restart: '3G'` - 内存限制3GB（编译需要更多内存）
- `min_uptime: '30s'` - 最小运行30秒（编译时间较长）
- `max_restarts: 10` - 最多重启10次
- `restart_delay: 4000` - 重启延迟4秒
- `kill_timeout: 10000` - 优雅关闭超时10秒（前端停止需要更长时间）

**💡 配置说明**: 这些限制值已根据服务器真实性能（Intel Xeon 8核，15GB内存）优化，确保充分利用资源同时保持稳定性。

---

## 🛡️ 高可用特性

### 自动重启
- ✅ 服务崩溃时自动重启
- ✅ 内存超限时自动重启（限制：1GB）
- ✅ 系统重启后自动启动

### 持久化
- ✅ 使用 `pm2 save` 保存当前进程列表
- ✅ 系统重启后自动恢复所有服务
- ✅ 不受 SSH 会话断开影响

---

## 🔍 故障排查

### 服务无法启动
```bash
# 查看详细错误
pm2 logs backend --err
pm2 logs frontend --err

# 查看服务描述
pm2 describe backend
```

### 端口被占用
```bash
# 查看端口占用
netstat -tlnp | grep 3000
netstat -tlnp | grep 9527

# 删除服务并重新启动
pm2 delete all
pm2 start ecosystem.config.js
```

### 内存占用过高
```bash
# 查看内存使用
pm2 monit

# 重启服务释放内存
pm2 restart all
```

---

## 📝 最佳实践

1. **定期保存进程列表**
   ```bash
   pm2 save
   ```

2. **使用配置文件管理服务**
   ```bash
   pm2 start ecosystem.config.js
   ```

3. **定期清理日志**
   ```bash
   pm2 flush
   ```

4. **监控服务状态**
   ```bash
   pm2 monit
   ```

5. **使用 reload 而非 restart**（无停机时间）
   ```bash
   pm2 reload all
   ```

---

## 🆘 紧急操作

### 完全重启系统
```bash
# 1. 停止所有服务
pm2 stop all

# 2. 清理进程
pm2 delete all

# 3. 重新启动
pm2 start ecosystem.config.js

# 4. 保存配置
pm2 save
```

### 卸载 PM2（如需）
```bash
# 1. 停止所有服务
pm2 kill

# 2. 移除自启动
pm2 unstartup systemd

# 3. 卸载 PM2
npm uninstall -g pm2
```

---

## ✅ 验证清单

- [x] PM2 已安装
- [x] 后端服务已启动并运行
- [x] 前端服务已启动并运行
- [x] 开机自启动已配置
- [x] 日志记录已配置
- [x] 健康检查通过
- [x] 端口监听正常（3000, 9527）
- [x] 数据库连接正常

---

## 📞 技术支持

如遇到问题，请检查：
1. PM2 进程状态: `pm2 status`
2. 服务日志: `pm2 logs`
3. 端口监听: `netstat -tlnp | grep -E '3000|9527'`
4. 数据库状态: `systemctl status mariadb`

---

**配置时间**: 2025-10-20  
**配置版本**: PM2 v6.0.13  
**系统环境**: CentOS 7.9.2009
