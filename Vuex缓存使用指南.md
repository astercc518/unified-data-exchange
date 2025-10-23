# Vuex缓存使用指南 📚

## 简介

Vuex缓存模块提供了一个高效的数据缓存机制，可以减少重复的API请求，提升应用性能和用户体验。

## 快速开始

### 1. 导入缓存工具

```javascript
import cacheManager, { CACHE_KEYS, CACHE_DURATION } from '@/utils/cache-helper'
import request from '@/utils/request'
```

### 2. 基本使用

#### 方式一：自动缓存（推荐）

```javascript
async getList() {
  this.loading = true
  try {
    // 使用缓存，5分钟内不会重复请求
    const users = await cacheManager.get(
      CACHE_KEYS.USER_LIST,
      async () => {
        const response = await request({
          url: '/api/users',
          method: 'GET',
          params: { page: 1, limit: 1000 }
        })
        return response.data || []
      },
      CACHE_DURATION.MEDIUM  // 5分钟缓存
    )
    
    this.list = users
    this.loading = false
  } catch (error) {
    this.$message.error('加载失败')
    this.loading = false
  }
}
```

#### 方式二：手动刷新缓存

```javascript
async refreshList() {
  this.loading = true
  try {
    // 强制刷新，忽略缓存
    const users = await cacheManager.get(
      CACHE_KEYS.USER_LIST,
      async () => {
        const response = await request({
          url: '/api/users',
          method: 'GET'
        })
        return response.data || []
      },
      CACHE_DURATION.MEDIUM,
      true  // forceRefresh = true
    )
    
    this.list = users
    this.loading = false
    this.$message.success('刷新成功')
  } catch (error) {
    this.$message.error('刷新失败')
    this.loading = false
  }
}
```

#### 方式三：创建/更新/删除后清除缓存

```javascript
async createUser(userData) {
  try {
    await request({
      url: '/api/users',
      method: 'POST',
      data: userData
    })
    
    // 清除用户列表缓存，下次获取时会重新请求
    cacheManager.clear(CACHE_KEYS.USER_LIST)
    
    this.$message.success('创建成功')
    this.getList()  // 重新加载列表
  } catch (error) {
    this.$message.error('创建失败')
  }
}
```

## 完整示例

### 用户列表页面

```vue
<template>
  <div>
    <el-button @click="refreshList" :loading="loading">刷新</el-button>
    <el-table :data="list" v-loading="loading">
      <!-- 表格列 -->
    </el-table>
  </div>
</template>

<script>
import cacheManager, { CACHE_KEYS, CACHE_DURATION } from '@/utils/cache-helper'
import request from '@/utils/request'

export default {
  data() {
    return {
      list: [],
      loading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 获取列表（使用缓存）
    async getList() {
      this.loading = true
      try {
        const users = await cacheManager.get(
          CACHE_KEYS.USER_LIST,
          async () => {
            const response = await request({
              url: '/api/users',
              method: 'GET',
              params: { page: 1, limit: 1000 }
            })
            return response.data || []
          },
          CACHE_DURATION.MEDIUM
        )
        this.list = users
      } catch (error) {
        this.$message.error('加载用户列表失败')
        this.list = []
      } finally {
        this.loading = false
      }
    },

    // 刷新列表（强制刷新）
    async refreshList() {
      this.loading = true
      try {
        const users = await cacheManager.get(
          CACHE_KEYS.USER_LIST,
          async () => {
            const response = await request({
              url: '/api/users',
              method: 'GET',
              params: { page: 1, limit: 1000 }
            })
            return response.data || []
          },
          CACHE_DURATION.MEDIUM,
          true  // 强制刷新
        )
        this.list = users
        this.$message.success('刷新成功')
      } catch (error) {
        this.$message.error('刷新失败')
      } finally {
        this.loading = false
      }
    },

    // 删除用户后清除缓存
    async handleDelete(id) {
      try {
        await request({
          url: `/api/users/${id}`,
          method: 'DELETE'
        })
        
        // 清除缓存
        cacheManager.clear(CACHE_KEYS.USER_LIST)
        
        this.$message.success('删除成功')
        this.getList()
      } catch (error) {
        this.$message.error('删除失败')
      }
    }
  }
}
</script>
```

## 缓存键（CACHE_KEYS）

```javascript
CACHE_KEYS.USER_LIST          // 用户列表
CACHE_KEYS.AGENT_LIST         // 代理列表
CACHE_KEYS.ORDER_LIST         // 订单列表
CACHE_KEYS.DATA_LIST          // 数据列表
CACHE_KEYS.RECHARGE_RECORDS   // 充值记录
CACHE_KEYS.DASHBOARD_STATS    // 仪表盘统计
```

## 缓存时长（CACHE_DURATION）

```javascript
CACHE_DURATION.SHORT      // 2分钟  - 频繁变化的数据
CACHE_DURATION.MEDIUM     // 5分钟  - 一般数据（推荐）
CACHE_DURATION.LONG       // 10分钟 - 较稳定的数据
CACHE_DURATION.VERY_LONG  // 30分钟 - 很少变化的数据
```

## API方法

### cacheManager.get(key, fetchFunction, duration, forceRefresh)
获取缓存数据，如果不存在或过期则调用fetchFunction获取

### cacheManager.set(key, data, duration)
手动设置缓存

### cacheManager.refresh(key, fetchFunction, duration)
刷新指定缓存

### cacheManager.clear(key)
清除指定缓存

### cacheManager.clearAll()
清除所有缓存

### cacheManager.clearExpired()
清除过期缓存

### cacheManager.isValid(key)
检查缓存是否有效

## 最佳实践

### 1. ✅ 何时使用缓存

- 列表数据（用户列表、订单列表等）
- 统计数据（仪表盘数据、报表数据等）
- 配置数据（国家列表、运营商列表等）
- 查询结果（搜索结果、筛选结果等）

### 2. ⚠️ 何时清除缓存

- 创建数据后
- 更新数据后
- 删除数据后
- 用户手动刷新时

### 3. 🎯 选择合适的缓存时长

- **实时数据**：不使用缓存
- **频繁变化**：SHORT (2分钟)
- **一般数据**：MEDIUM (5分钟) ⭐推荐
- **稳定数据**：LONG (10分钟)
- **配置数据**：VERY_LONG (30分钟)

### 4. 💡 性能优化技巧

```javascript
// 页面卸载时不需要清除缓存，让其他页面也能使用
// beforeDestroy() {
//   // ❌ 不要这样做
//   cacheManager.clear(CACHE_KEYS.USER_LIST)
// }

// 只在数据变更时清除缓存
async handleUpdate() {
  await updateAPI()
  cacheManager.clear(CACHE_KEYS.USER_LIST)  // ✅ 正确
}
```

## 注意事项

1. **缓存键唯一性**：确保不同的数据使用不同的缓存键
2. **及时清除缓存**：数据变更后记得清除相关缓存
3. **合理设置时长**：根据数据特性选择合适的缓存时长
4. **错误处理**：缓存失败时应有降级方案

## 监控和调试

```javascript
// 查看缓存状态
console.log('缓存数量:', cacheManager.getCount())
console.log('缓存键列表:', cacheManager.getKeys())
console.log('缓存是否有效:', cacheManager.isValid(CACHE_KEYS.USER_LIST))
```

## 迁移指南

### 从localStorage迁移

```javascript
// ❌ 旧代码（localStorage）
const savedUsers = localStorage.getItem('userList')
if (savedUsers) {
  this.list = JSON.parse(savedUsers)
} else {
  const response = await request({ url: '/api/users' })
  this.list = response.data
  localStorage.setItem('userList', JSON.stringify(this.list))
}

// ✅ 新代码（Vuex缓存）
this.list = await cacheManager.get(
  CACHE_KEYS.USER_LIST,
  async () => {
    const response = await request({ url: '/api/users' })
    return response.data || []
  },
  CACHE_DURATION.MEDIUM
)
```

## 总结

Vuex缓存模块提供了：

- ✅ 自动过期管理
- ✅ 统一的缓存接口
- ✅ 灵活的缓存时长
- ✅ 强制刷新功能
- ✅ 自动清理机制

使用Vuex缓存可以：

- 🚀 提升页面加载速度
- 📉 减少服务器压力
- 💰 降低网络流量
- 😊 改善用户体验
