# SMS57短信平台集成指南

## 📋 概述

系统已完整集成SMS57短信平台的群发接口，支持立即发送和定时发送功能。

---

## 🔧 已实现功能

### 1. SMS57服务模块
**文件**: `backend/services/sms57Service.js`

#### 核心方法

##### 1.1 普通发送（非加密）
```javascript
SMS57Service.send(config, phoneNumbers, content, atTime, label)
```

**参数说明**:
- `config.gateway_url` - 网关地址（必填）
- `config.account` - 账号（必填）
- `config.password` - 密码（必填）
- `config.extno` - 接入码（默认：10690）
- `phoneNumbers` - 手机号码数组（必填）
- `content` - 短信内容（必填）
- `atTime` - 定时时间（可选）格式：2022-12-05 18:00:00
- `label` - 标签（可选）

**请求示例**:
```json
{
  "action": "send",
  "account": "123456",
  "password": "123456",
  "mobile": "15100000000,15100000001",
  "content": "【测试】TEST",
  "extno": "10690",
  "atTime": "2022-12-05 18:00:00"
}
```

**响应示例**:
```json
{
  "status": 0,
  "balance": 520,
  "list": [
    {
      "mid": "C6AB1C83865A0001",
      "mobile": "15100000000",
      "result": 0
    },
    {
      "mid": "C6AB1C83865A0002",
      "mobile": "15100000001",
      "result": 0
    }
  ]
}
```

##### 1.2 加密发送（MD5密码）
```javascript
SMS57Service.sendWithEncryption(config, phoneNumbers, content, atTime, label)
```

**密码加密规则**:
```
password = MD5(password + extno + mobile + content).toUpperCase()
```

---

## 📊 数据库表结构

### 短信通道表（sms_channels）

新增字段：
```sql
`extno` VARCHAR(20) DEFAULT '10690' COMMENT 'SMS57接入码'
```

**完整字段**:
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| channel_name | VARCHAR(100) | 通道名称 |
| country | VARCHAR(50) | 国家 |
| price_per_sms | DECIMAL(10,4) | 价格/条 |
| max_chars | INT | 最大字符数 |
| gateway_url | VARCHAR(255) | 网关地址 |
| account | VARCHAR(100) | SMS57账号 |
| password | VARCHAR(255) | SMS57密码 |
| extno | VARCHAR(20) | SMS57接入码 |
| platform_type | VARCHAR(50) | 平台类型 |
| status | TINYINT | 状态：0=禁用 1=启用 |

---

## 🚀 发送流程

### 客户端发送流程

1. **创建任务** (`POST /api/sms/customer/tasks`)
   ```javascript
   {
     "channel_id": 1,
     "country": "India",
     "content": "【测试】Hello World",
     "phone_numbers": ["+919876543210", "+919876543211"],
     "send_type": "immediate" // 或 "scheduled"
   }
   ```

2. **系统处理**:
   - ✅ 验证通道状态
   - ✅ 检查字符数限制
   - ✅ 计算总费用
   - ✅ 验证账户余额
   - ✅ 扣除账户余额
   - ✅ 创建任务和记录

3. **调用SMS57** (立即发送):
   ```javascript
   SMS57Service.send(
     {
       gateway_url: channel.gateway_url,
       account: channel.account,
       password: channel.password,
       extno: channel.extno
     },
     phone_numbers,
     content
   )
   ```

4. **更新记录**:
   - 根据SMS57响应中的`list`数组
   - 每个号码的`result`：
     - `0` = 提交成功 → 更新为`success`
     - `非0` = 提交失败 → 更新为`failed`
   - 记录`mid`（消息ID）用于后续状态报告

---

## 📝 错误代码说明

### STATUS错误代码（整体请求状态）

| status | 说明 |
|--------|------|
| 0 | 成功 |
| 1 | 参数错误 |
| 2 | 账号或密码错误 |
| 3 | 余额不足 |
| 4 | 内容含有敏感词 |
| 5 | 接口访问受限 |
| 6 | 号码格式错误 |
| 7 | 内容为空 |
| 8 | 号码为空 |
| 9 | 系统错误 |
| 10 | 账号被禁用 |

### RESULT错误代码（单个号码提交结果）

| result | 说明 |
|--------|------|
| 0 | 提交成功 |
| 1 | 号码格式错误 |
| 2 | 号码在黑名单 |
| 3 | 号码重复 |
| 4 | 其他错误 |

---

## 🎯 使用示例

### 1. 配置SMS57通道

进入"短信管理 → 通道配置"，创建通道：

```
通道名称: 印度SMS57通道
国家: India
价格/条: 0.0050
最大字符数: 160
网关地址: https://api.sms57.com/send
账号: your_sms57_account
密码: your_sms57_password
接入码: 10690
平台类型: sms57
状态: 启用
```

### 2. 发送短信（客户端）

进入"短信发送 → 短信群发"：

1. 选择国家：India
2. 输入内容：【测试】This is a test message
3. 选择号码：
   - 从已购买数据选择
   - 或手动输入：
     ```
     +919876543210
     +919876543211
     ```
4. 选择发送方式：立即发送
5. 点击"发送"按钮

### 3. 查看发送结果

进入"短信发送 → 发送记录"：
- 查看每条短信的状态
- 成功：显示消息ID (mid)
- 失败：显示错误原因

---

## 🔍 日志示例

### 成功发送日志
```
INFO: SMS57发送请求: {
  account: '123456',
  mobile_count: 2,
  content_length: 28,
  atTime: null
}

INFO: SMS57响应: {
  status: 0,
  balance: 520,
  list: [
    { mid: 'C6AB1C83865A0001', mobile: '+919876543210', result: 0 },
    { mid: 'C6AB1C83865A0002', mobile: '+919876543211', result: 0 }
  ]
}

INFO: 任务 123 完成: 成功 2, 失败 0
```

### 失败发送日志
```
ERROR: SMS57发送失败: {
  success: false,
  status: 2,
  message: '账号或密码错误'
}

ERROR: 任务 124 失败: 账号或密码错误
```

---

## ⚙️ 配置说明

### 环境要求
- Node.js >= 14
- axios >= 1.0
- 数据库：MariaDB/MySQL

### 依赖安装
```bash
cd backend
npm install axios
```

### 服务重启
```bash
pm2 restart backend
pm2 restart frontend
```

---

## 🔐 安全建议

1. **密码保护**:
   - 建议使用加密模式（MD5）
   - 定期更换SMS57密码

2. **接入码管理**:
   - 每个通道使用独立的接入码
   - 记录接入码用途

3. **余额监控**:
   - 定期检查SMS57账户余额
   - 设置余额预警

4. **错误处理**:
   - 记录所有发送错误
   - 分析失败原因

---

## 📞 测试建议

### 1. 测试通道配置
- 使用少量号码测试（1-3个）
- 验证账号密码正确性
- 检查接入码配置

### 2. 测试发送功能
- 测试立即发送
- 测试定时发送
- 测试错误处理

### 3. 测试记录查询
- 验证记录状态更新
- 检查消息ID (mid)
- 确认费用计算

---

## 🚧 注意事项

1. **号码格式**:
   - 必须包含国家码（如：+91）
   - 多个号码用逗号分隔
   - 系统自动去重

2. **内容限制**:
   - 不超过通道设置的最大字符数
   - 避免敏感词
   - 建议包含签名【】

3. **发送限制**:
   - 单次建议不超过1000个号码
   - 大批量分批发送
   - 注意SMS57平台限制

4. **费用扣除**:
   - 立即发送：立即扣款
   - 定时发送：创建时扣款
   - 失败不退款

---

## ✅ 验收清单

- [x] SMS57服务模块创建完成
- [x] 通道表添加extno字段
- [x] 模型更新完成
- [x] 客户端发送接口集成SMS57
- [x] 前端通道配置页面添加extno字段
- [x] 测试通道数据更新
- [x] 服务重启完成
- [x] 文档编写完成

---

**🎉 SMS57短信平台已完整集成！**

系统现在支持通过SMS57平台发送短信，包括完整的错误处理、状态跟踪和记录管理功能。
