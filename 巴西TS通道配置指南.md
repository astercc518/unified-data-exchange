# 巴西TS通道配置指南

## 当前问题

巴西TS通道 (`http://www.kaolasms.com:7862/smsv2`) 配置不完整，导致短信无法正常发送。

## 需要的API文档信息

为了正确配置巴西TS通道，需要以下信息：

### 1. API请求格式

**示例1：JSON格式**
```json
POST http://www.kaolasms.com:7862/smsv2
Content-Type: application/json

{
  "account": "888055",
  "password": "0VvOqbyu2Y7Z",
  "mobile": "5531983059116",
  "content": "测试短信内容"
}
```

**示例2：表单格式**
```
POST http://www.kaolasms.com:7862/smsv2
Content-Type: application/x-www-form-urlencoded

account=888055&password=0VvOqbyu2Y7Z&mobile=5531983059116&content=测试短信内容
```

**示例3：GET请求**
```
GET http://www.kaolasms.com:7862/smsv2?account=888055&password=0VvOqbyu2Y7Z&mobile=5531983059116&content=测试短信内容
```

### 2. API响应格式

需要知道成功和失败时的响应格式：

**成功响应示例：**
```json
{
  "status": 0,
  "message": "发送成功",
  "messageId": "msg123456",
  "balance": 1000
}
```

**失败响应示例：**
```json
{
  "status": 1,
  "message": "余额不足",
  "code": "INSUFFICIENT_BALANCE"
}
```

### 3. 参数说明

| 参数名 | 是否必填 | 说明 | 示例 |
|--------|----------|------|------|
| account | 是 | 账号 | 888055 |
| password | 是 | 密码 | 0VvOqbyu2Y7Z |
| mobile | 是 | 手机号 | 5531983059116 |
| content | 是 | 短信内容 | 测试短信 |
| ... | ... | 其他参数 | ... |

## 临时解决方案

### 方案1：使用SMS57通道测试

如果SMS57支持巴西号码，可以直接使用现有的SMS57通道：

1. 选择"印度SMS57通道"或"英国SMS57通道"
2. 输入巴西手机号测试
3. 查看SMS57平台是否收到

### 方案2：手动测试API

使用curl命令直接测试巴西TS的API：

```bash
# 测试1：JSON POST请求
curl -X POST http://www.kaolasms.com:7862/smsv2 \
  -H "Content-Type: application/json" \
  -d '{
    "account": "888055",
    "password": "0VvOqbyu2Y7Z",
    "mobile": "5531983059116",
    "content": "Test message"
  }'

# 测试2：表单POST请求
curl -X POST http://www.kaolasms.com:7862/smsv2 \
  -d "account=888055" \
  -d "password=0VvOqbyu2Y7Z" \
  -d "mobile=5531983059116" \
  -d "content=Test message"

# 测试3：GET请求
curl "http://www.kaolasms.com:7862/smsv2?account=888055&password=0VvOqbyu2Y7Z&mobile=5531983059116&content=Test%20message"
```

**请将curl测试结果告诉我，我会根据实际响应配置通道。**

## 配置模板

### 模板1：标准JSON格式

```sql
UPDATE sms_channels SET
  request_template = '{"account":"{account}","password":"{password}","mobile":"{phone}","content":"{content}"}',
  http_headers = '{"Content-Type":"application/json"}',
  response_success_pattern = 'status=0'
WHERE id = 4;
```

### 模板2：SMS57兼容格式

```sql
UPDATE sms_channels SET
  request_template = '{"action":"send","account":"{account}","password":"{password}","mobile":"{phone}","content":"{content}","extno":"10690"}',
  http_headers = '{"Content-Type":"application/json"}',
  response_success_pattern = 'status=0'
WHERE id = 4;
```

### 模板3：简化格式（仅必填字段）

```sql
UPDATE sms_channels SET
  request_template = '{"user":"{account}","pass":"{password}","phone":"{phone}","msg":"{content}"}',
  http_headers = '{"Content-Type":"application/json"}',
  response_success_pattern = 'success=true'
WHERE id = 4;
```

## 调试步骤

### 1. 启用详细日志

查看后端日志：
```bash
pm2 logs vue-admin-server --lines 50
```

### 2. 查看发送记录

```sql
SELECT 
  id, 
  phone_number, 
  content, 
  status, 
  gateway_response, 
  error_message 
FROM sms_records 
WHERE channel_id = 4 
ORDER BY id DESC 
LIMIT 5;
```

### 3. 测试连接

测试网关是否可访问：
```bash
curl -v http://www.kaolasms.com:7862/smsv2
```

## 常见问题

### Q1: 为什么返回 result=0 但没收到短信？

**可能原因：**
- 请求参数格式不对（字段名错误）
- 缺少必填参数
- 手机号格式不对（需要加国家代码？）
- 账号余额不足
- 号码被屏蔽

### Q2: 如何确认API格式是否正确？

**方法：**
1. 联系巴西TS平台技术支持获取API文档
2. 使用curl手动测试各种格式
3. 对比其他工作正常的通道的响应

### Q3: 可以同时配置多种格式吗？

**答：** 不可以。一个通道只能配置一种请求格式。如果需要测试多种格式，可以创建多个测试通道。

## 下一步行动

**请提供以下任一信息：**

1. ✅ 巴西TS平台的API文档
2. ✅ curl测试命令的响应结果
3. ✅ 平台技术支持的配置示例
4. ✅ 其他系统中成功发送的请求日志

有了这些信息，我可以立即帮您完成正确的配置。

---

**当前账号信息：**
- 账号：888055
- 密码：0VvOqbyu2Y7Z
- 网关：http://www.kaolasms.com:7862/smsv2

**测试号码：** 5531983059116
