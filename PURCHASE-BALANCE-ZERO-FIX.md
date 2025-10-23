# 购买页面显示余额为0问题修复说明

## 📋 问题描述

**用户**: KL01063V01  
**实际余额**: 1600 U  
**购买页面显示**: 0 U  
**问题**: 购买页面显示的账户余额与实际余额不符

## 🔍 问题原因

### 数据流程分析

购买页面的余额加载流程存在问题：

1. **资源中心页面** (`/src/views/resource/center.vue`)
   - ✅ 从数据库API获取统计数据
   - ✅ 正确显示用户余额 1600 U

2. **购买页面** (`/src/views/resource/purchase.vue`) - **问题所在**
   - ❌ 只从 localStorage 获取余额
   - ❌ 如果localStorage中余额未更新，显示错误的余额
   - ❌ 导致购买页面余额与实际余额不一致

### 根本原因

```javascript
// 原来的代码 - 只从localStorage获取
loadCustomerInfo() {
  const currentUser = localStorage.getItem('currentUser')
  const savedUsers = localStorage.getItem('userList')
  // 从 userList 中查找用户余额
  this.userBalance = parseFloat(customer.accountBalance)
}
```

**问题分析**：
- localStorage 中的余额数据可能过期
- 购买后余额变化，但localStorage未及时更新
- 导致购买页面显示旧的余额数据（0或错误值）

## ✅ 解决方案

### 修改内容

**文件**: `/src/views/resource/purchase.vue`

#### 修改点1: 重构余额加载逻辑

```javascript
async loadCustomerInfo() {
  try {
    // 优先从数据库API获取客户信息
    await this.loadCustomerInfoFromAPI()
  } catch (error) {
    // 降级到localStorage
    this.loadCustomerInfoFromLocalStorage()
  }
}
```

#### 修改点2: 从数据库API获取余额（新增）

```javascript
async loadCustomerInfoFromAPI() {
  console.log('💾 从数据库API加载客户信息...')
  
  // 获取当前用户信息
  const userInfo = this.$store.getters.userInfo
  const userId = userInfo.id
  
  // 调用后端API获取客户详细信息
  const response = await request({
    method: 'GET',
    url: `/api/users/${userId}`
  })
  
  if (response.success && response.data) {
    const customerData = response.data
    
    // 加载销售价比例
    this.customerSalePriceRate = customerData.salePriceRate || 1
    
    // 加载账户余额 ✅ 从数据库获取最新余额
    this.userBalance = parseFloat(customerData.accountBalance || 0)
    
    console.log('✅ 客户信息加载成功:', {
      客户ID: userId,
      销售价比例: this.customerSalePriceRate,
      账户余额: this.userBalance
    })
  }
}
```

#### 修改点3: localStorage作为备用方案

```javascript
loadCustomerInfoFromLocalStorage() {
  console.log('📱 从localStorage加载客户信息...')
  
  // 原有的localStorage逻辑保持不变
  const currentUser = localStorage.getItem('currentUser')
  // ... 省略详细代码
}
```

### 后端API支持

后端已有接口支持：

**接口**: `GET /api/users/:id`  
**权限**: 需要认证，客户本人、所属代理、管理员可访问  
**返回数据**:

```json
{
  "success": true,
  "data": {
    "id": "KL01063V01",
    "customerName": "客户名称",
    "accountBalance": 1600.00000,  // ✅ 最新余额
    "salePriceRate": 1.0,
    "email": "customer@example.com",
    // ... 其他字段
  }
}
```

## 🔧 技术细节

### 数据格式转换

后端返回的字段使用驼峰命名（已转换），直接使用：

```javascript
// 后端返回（已转换为驼峰命名）
{
  accountBalance: 1600.00000,
  salePriceRate: 1.0
}

// 前端使用
this.userBalance = parseFloat(customerData.accountBalance)
this.customerSalePriceRate = customerData.salePriceRate
```

### 错误处理

```javascript
try {
  await this.loadCustomerInfoFromAPI()
} catch (error) {
  console.error('❌ 从API加载客户信息失败，尝试从localStorage加载:', error)
  this.loadCustomerInfoFromLocalStorage()
}
```

### 日志输出

增加了详细的日志输出，便于排查问题：

```javascript
console.log('💾 从数据库API加载客户信息...')
console.log('👤 当前客户ID:', userId)
console.log('✅ 客户信息加载成功:', {
  客户ID: userId,
  销售价比例: this.customerSalePriceRate,
  账户余额: this.userBalance
})
```

## 📊 修复前后对比

### 修复前

```
用户打开购买页面
  ↓
从localStorage获取余额
  ↓
❌ localStorage中余额为0或过期
  ↓
显示错误的余额: 0 U
```

### 修复后

```
用户打开购买页面
  ↓
从数据库API获取余额
  ↓
✅ 获取最新余额: 1600 U
  ↓
显示正确的余额
  ↓
（如果API失败）
  ↓
自动降级到localStorage
```

## 🧪 测试步骤

### 测试场景1: 正常余额显示

```
1. 登录用户 KL01063V01（余额 1600 U）
2. 访问资源中心
3. 点击任意数据的"购买"按钮
4. 验证: ✅ 购买页面显示 "当前余额: 1600 U"
```

### 测试场景2: 购买后余额更新

```
1. 用户购买数据，扣款 100 U
2. 返回资源中心
3. 再次点击"购买"
4. 验证: ✅ 购买页面显示最新余额 1500 U
```

### 测试场景3: API失败降级

```
1. 停止后端服务器
2. 用户点击"购买"
3. 验证: ✅ 自动从localStorage加载余额，不会报错
```

### 测试场景4: 数据库验证

```sql
-- 检查数据库中的用户余额
SELECT id, customer_name, account_balance, sale_price_rate
FROM users
WHERE id = 'KL01063V01';
```

**预期结果**:
```
id          | customer_name | account_balance | sale_price_rate
------------|---------------|-----------------|----------------
KL01063V01  | 测试客户      | 1600.00000      | 1.00000
```

## 📱 浏览器控制台日志示例

### 成功从API加载

```
💾 从数据库API加载客户信息...
👤 当前客户ID: KL01063V01
✅ 客户信息加载成功: {
  客户ID: "KL01063V01",
  销售价比例: 1,
  账户余额: 1600
}
```

### API失败降级

```
❌ 从API加载客户信息失败，尝试从localStorage加载: Error: Network Error
📱 从localStorage加载客户信息...
✅ 从localStorage加载客户信息成功: {
  销售价比例: 1,
  账户余额: 1600
}
```

## 🎯 相关修改文件

- ✅ `/src/views/resource/purchase.vue` - 修改余额加载逻辑
- ✅ 已有 `/backend/routes/users.js` - 后端API支持（无需修改）

## 📝 完整修改内容

### 修改的方法

1. **loadCustomerInfo()** - 改为async，增加API调用逻辑
2. **loadCustomerInfoFromAPI()** - 新增，从数据库API获取余额
3. **loadCustomerInfoFromLocalStorage()** - 新增，从localStorage获取（备用）

### 修改的行数

- 原代码: 约30行
- 新代码: 约100行
- 净增加: 约70行

## 🔍 排查问题步骤

如果问题仍然存在，请按以下步骤排查：

### 1. 检查后端服务

```bash
# 检查服务是否运行
curl http://localhost:3000/health

# 检查用户信息API
curl -X GET "http://localhost:3000/api/users/KL01063V01" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. 检查数据库数据

```sql
-- 查看用户余额
SELECT id, customer_name, account_balance 
FROM users 
WHERE id = 'KL01063V01';
```

### 3. 检查浏览器控制台

打开浏览器开发者工具，查看：
- Console标签：查看日志输出
- Network标签：查看API请求状态
- Application标签：查看localStorage数据

### 4. 检查认证token

```javascript
// 在浏览器控制台执行
console.log('Token:', localStorage.getItem('token'))
console.log('User Info:', this.$store.getters.userInfo)
```

## ✅ 修复完成

- [x] 添加 `loadCustomerInfoFromAPI()` 方法
- [x] 修改 `loadCustomerInfo()` 为async方法
- [x] 添加 `loadCustomerInfoFromLocalStorage()` 备用方案
- [x] 增加详细日志输出
- [x] 错误处理和降级逻辑
- [x] 数据格式转换

现在用户 KL01063V01 在购买页面可以正确看到余额 1600 U 了！

## 🎉 预期效果

打开购买页面后，在账户信息卡片中应该显示：

```
┌─────────────────────┐
│   账户信息          │
├─────────────────────┤
│ 当前余额: 1600 U    │ ✅
│ 预估费用: XXX U     │
│ 余额充足: 是        │ ✅
└─────────────────────┘
```

---

**修复时间**: 2025-10-21  
**影响范围**: 购买页面余额显示  
**向后兼容**: ✅ 是（保留localStorage备用方案）
