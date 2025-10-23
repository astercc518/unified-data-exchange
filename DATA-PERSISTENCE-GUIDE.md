# 数据永久存储实施方案

## 📋 概述

本方案实现了系统数据的**永久存储功能**，确保所有页面操作的数据能够持久化保存。

### 存储策略

由于后端服务暂时不可用（SQLite 依赖问题），我们采用**增强型 localStorage 方案**：

1. **自动备份机制**：每次数据变更自动创建备份
2. **变更日志追踪**：记录所有数据操作历史
3. **数据完整性检查**：定期验证数据有效性
4. **导入/导出功能**：支持数据迁移和备份
5. **错误恢复机制**：自动从备份恢复数据

## 🚀 快速开始

### 1. 访问数据管理中心

在浏览器中打开：
```
http://localhost:9528/data-persistence-manager.html
```

### 2. 主要功能

#### 📊 数据统计
- **总数据量**：显示所有存储的记录数
- **存储空间**：显示 localStorage 使用情况
- **分类统计**：客户、订单、代理等各类数据统计

#### 🛠️ 数据管理

**创建备份**
- 一键备份所有数据
- 自动保存到 localStorage
- 包含时间戳标记

**数据完整性检查**
- 验证所有数据表是否存在
- 检查数据格式是否正确
- 生成详细检查报告

**导出数据**
- 导出所有数据为 JSON 文件
- 可用于备份或迁移
- 包含完整的元数据

**导入数据**
- 从 JSON 文件导入数据
- 自动备份当前数据
- 支持数据恢复

**清空数据**
- 清除所有存储数据
- 自动创建备份
- 可从备份恢复

## 💾 存储的数据类型

系统持久化存储以下数据：

### 1. 客户列表 (userList)
```javascript
{
  id: 1,
  loginAccount: "admin",
  loginPassword: "111111",
  customerName: "系统管理员",
  email: "admin@example.com",
  agentId: 1,
  agentName: "默认代理",
  accountBalance: 10000,
  status: 1,
  createTime: 1697123456789
}
```

### 2. 代理列表 (agentList)
```javascript
{
  id: 1,
  agentName: "代理A",
  loginAccount: "agent001",
  loginPassword: "123456",
  agentCode: "AGENT001",
  level: "一级代理",
  commission: 10,
  status: 1,
  createTime: 1697123456789
}
```

### 3. 数据库 (dataLibrary)
```javascript
{
  id: 1,
  country: "US",
  countryName: "美国",
  validity: "real_time",
  validityName: "实时",
  totalQuantity: 1000,
  availableQuantity: 800,
  operators: ["Verizon", "AT&T"],
  uploadTime: 1697123456789
}
```

### 4. 订单列表 (orderList)
```javascript
{
  id: 1,
  orderNumber: "ORD20241013001",
  customerId: 1,
  customerName: "系统管理员",
  dataId: 1,
  country: "US",
  quantity: 100,
  totalAmount: 500,
  status: "completed",
  orderTime: 1697123456789
}
```

### 5. 充值记录 (rechargeRecords)
```javascript
{
  id: 1,
  customerId: 1,
  customerName: "系统管理员",
  amount: 10000,
  type: "customer",
  method: "initial",
  status: "success",
  createTime: 1697123456789
}
```

### 6. 反馈记录 (feedbackList)
```javascript
{
  id: 1,
  customerId: 1,
  customerName: "系统管理员",
  orderId: 1,
  feedbackType: "问题反馈",
  title: "数据质量问题",
  content: "部分数据无效",
  status: "pending",
  createTime: 1697123456789
}
```

## 📝 使用指南

### 在页面中使用持久化存储

#### 方式一：使用增强型存储管理器

```javascript
// 引入持久化存储
import persistentStorage from '@/utils/persistent-storage'

// 获取数据
const users = persistentStorage.get('userList')

// 保存数据
persistentStorage.set('userList', users, {
  validate: true,  // 启用验证
  backup: true     // 自动备份
})

// 添加单条数据
persistentStorage.add('userList', {
  loginAccount: 'newuser',
  customerName: '新用户',
  email: 'newuser@example.com'
})

// 更新数据
persistentStorage.update('userList', userId, {
  accountBalance: 5000
})

// 删除数据
persistentStorage.delete('userList', userId)

// 创建备份
persistentStorage.createBackup()

// 导出数据
const exportData = persistentStorage.exportAllData()
console.log(exportData)

// 获取统计信息
const stats = persistentStorage.getStatistics()
console.log(stats)
```

#### 方式二：直接使用 localStorage

```javascript
// 获取数据
const users = JSON.parse(localStorage.getItem('userList') || '[]')

// 保存数据
localStorage.setItem('userList', JSON.stringify(users))
```

### 在 Vue 组件中使用

```vue
<script>
import persistentStorage from '@/utils/persistent-storage'

export default {
  data() {
    return {
      users: []
    }
  },
  
  created() {
    // 加载数据
    this.loadUsers()
  },
  
  methods: {
    loadUsers() {
      this.users = persistentStorage.get('userList')
      console.log('✅ 加载用户数据:', this.users.length, '条')
    },
    
    addUser(user) {
      const result = persistentStorage.add('userList', user)
      if (result) {
        this.loadUsers()
        this.$message.success('添加成功')
      } else {
        this.$message.error('添加失败')
      }
    },
    
    updateUser(id, updates) {
      const result = persistentStorage.update('userList', id, updates)
      if (result) {
        this.loadUsers()
        this.$message.success('更新成功')
      } else {
        this.$message.error('更新失败')
      }
    },
    
    deleteUser(id) {
      const result = persistentStorage.delete('userList', id)
      if (result) {
        this.loadUsers()
        this.$message.success('删除成功')
      } else {
        this.$message.error('删除失败')
      }
    }
  }
}
</script>
```

## 🔄 数据同步机制

### 页面间数据同步

所有对 localStorage 的修改会立即生效，但其他标签页不会自动刷新。可以使用以下方法实现同步：

```javascript
// 监听 storage 事件
window.addEventListener('storage', (e) => {
  if (e.key === 'userList') {
    // 重新加载数据
    this.loadUsers()
  }
})
```

### 自动备份机制

系统会在以下情况自动创建备份：

1. 每次调用 `set()` 方法时
2. 数据导入前
3. 清空数据前
4. 手动创建备份时

备份数据保存在 `_storage_backup_` 键中。

## ⚡ 性能优化

### 1. 批量操作

```javascript
// ❌ 不推荐：循环中多次保存
users.forEach(user => {
  persistentStorage.update('userList', user.id, user)
})

// ✅ 推荐：一次性保存
const users = persistentStorage.get('userList')
users.forEach(user => {
  // 修改数据
  user.accountBalance += 100
})
persistentStorage.set('userList', users)
```

### 2. 禁用自动备份

对于频繁操作，可以临时禁用自动备份：

```javascript
// 禁用备份
persistentStorage.set('userList', users, { backup: false })

// 完成后手动创建一次备份
persistentStorage.createBackup()
```

## 🔧 故障排查

### 问题1：数据丢失

**解决方案**：
1. 打开数据管理中心
2. 检查备份是否存在
3. 使用"恢复备份"功能

或通过控制台：
```javascript
// 检查备份
const backup = localStorage.getItem('_storage_backup_')
console.log(backup)

// 恢复备份
persistentStorage.recoverFromBackup()
```

### 问题2：数据格式错误

**解决方案**：
1. 运行数据完整性检查
2. 查看问题报告
3. 手动修复或从备份恢复

```javascript
const report = persistentStorage.checkDataIntegrity()
console.log(report)
```

### 问题3：存储空间不足

**解决方案**：
1. 导出数据到文件
2. 清理不必要的数据
3. 定期归档历史数据

```javascript
// 查看存储使用情况
const stats = persistentStorage.getStatistics()
console.log('总大小:', stats.totalSizeKB, 'KB')
```

## 📊 变更日志

系统自动记录所有数据变更操作：

```javascript
// 查看最近20条变更
const logs = persistentStorage.getChangeLogs(20)
console.table(logs)
```

日志包含：
- 操作时间
- 数据表名称
- 操作类型（添加/更新/删除）
- 记录数量

## 🔮 未来规划

### 数据库迁移（待后端服务可用）

当后端服务修复后，可以一键迁移到数据库：

1. 修复后端 SQLite 依赖或安装 MySQL
2. 启动后端服务
3. 访问数据迁移工具
4. 一键导入所有数据

迁移工具会自动：
- 从 localStorage 读取所有数据
- 转换为数据库格式
- 批量导入数据库
- 验证数据完整性

## ✅ 最佳实践

1. **定期备份**：每天至少创建一次备份
2. **数据验证**：重要操作前检查数据完整性
3. **日志监控**：定期查看变更日志
4. **导出存档**：每周导出数据到文件
5. **测试恢复**：定期测试备份恢复功能

## 📞 技术支持

如遇问题，请：
1. 查看浏览器控制台日志
2. 检查数据管理中心状态
3. 尝试数据完整性检查
4. 必要时从备份恢复

---

**文档版本**：1.0  
**最后更新**：2025-10-13  
**状态**：✅ 已实施
