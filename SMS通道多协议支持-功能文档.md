# SMS通道多协议支持功能文档

## 📋 功能概述

短信通道配置现已支持 **HTTP/HTTPS** 和 **SMPP** 协议，可与多种短信平台对接，包括SMS57、Twilio、阿里云、腾讯云及其他第三方SMPP服务器。

**实施时间**: 2025-10-21  
**实施状态**: ✅ 已完成并部署

---

## 🎯 支持的协议和平台

### 1. HTTP/HTTPS 协议
适用于大多数REST API短信平台：
- ✅ **SMS57** - 专用适配器
- ✅ **通用HTTP** - 自定义模板
- ✅ **Twilio** - 可通过通用HTTP配置
- ✅ **阿里云短信** - 可通过通用HTTP配置  
- ✅ **腾讯云短信** - 可通过通用HTTP配置

### 2. SMPP 协议
适用于电信运营商和SMPP网关：
- ✅ **通用SMPP 3.4** - 标准协议实现
- ✅ **电信运营商直连** - 支持TON/NPI配置
- ✅ **第三方SMPP网关** - 完全兼容

---

## 🔧 数据库字段说明

### 新增字段

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| `protocol_type` | VARCHAR(20) | 协议类型: http, https, smpp | http |
| `smpp_host` | VARCHAR(255) | SMPP服务器地址 | NULL |
| `smpp_port` | INT | SMPP端口号 | NULL |
| `smpp_system_id` | VARCHAR(100) | SMPP系统ID | NULL |
| `smpp_system_type` | VARCHAR(50) | SMPP系统类型 | NULL |
| `smpp_ton` | INT | 源地址TON (Type of Number) | 0 |
| `smpp_npi` | INT | 源地址NPI (Numbering Plan Indicator) | 0 |
| `http_method` | VARCHAR(10) | HTTP请求方法: GET, POST | POST |
| `http_headers` | TEXT | HTTP请求头(JSON格式) | NULL |
| `request_template` | TEXT | 请求模板(JSON格式) | NULL |
| `response_success_pattern` | VARCHAR(255) | 成功响应匹配模式 | NULL |

---

## 📝 配置示例

### 示例1: SMS57平台（HTTP）

```json
{
  "channel_name": "印度SMS57通道",
  "country": "India",
  "country_code": "91",
  "platform_type": "sms57",
  "protocol_type": "http",
  "gateway_url": "http://www.kaolasms.com:7862/smsv2",
  "account": "your_account",
  "password": "your_password",
  "extno": "10690"
}
```

### 示例2: 通用HTTP平台

```json
{
  "channel_name": "自定义HTTP通道",
  "country": "USA",
  "country_code": "1",
  "platform_type": "generic_http",
  "protocol_type": "https",
  "http_method": "POST",
  "gateway_url": "https://api.example.com/sms/send",
  "account": "api_user",
  "password": "api_password",
  "http_headers": "{\"Content-Type\": \"application/json\", \"Authorization\": \"Bearer xxx\"}",
  "request_template": "{\"to\": \"{phone}\", \"message\": \"{content}\", \"from\": \"{account}\"}",
  "response_success_pattern": "status.code=0"
}
```

### 示例3: SMPP协议

```json
{
  "channel_name": "电信SMPP通道",
  "country": "China",
  "country_code": "86",
  "platform_type": "generic_smpp",
  "protocol_type": "smpp",
  "smpp_host": "smpp.example.com",
  "smpp_port": 2775,
  "smpp_system_id": "your_system_id",
  "smpp_system_type": "CMT",
  "account": "10690123",
  "password": "your_password",
  "smpp_ton": 0,
  "smpp_npi": 0
}
```

### 示例4: 阿里云短信（HTTP）

```json
{
  "channel_name": "阿里云短信",
  "country": "China",
  "country_code": "86",
  "platform_type": "aliyun",
  "protocol_type": "https",
  "http_method": "POST",
  "gateway_url": "https://dysmsapi.aliyuncs.com/",
  "account": "AccessKeyId",
  "password": "AccessKeySecret",
  "http_headers": "{\"Content-Type\": \"application/x-www-form-urlencoded\"}",
  "request_template": "{\"Action\": \"SendSms\", \"PhoneNumbers\": \"{phone}\", \"SignName\": \"签名\", \"TemplateCode\": \"SMS_12345\", \"TemplateParam\": \"{\\\"code\\\":\\\"{content}\\\"}\"}",
  "response_success_pattern": "Code=OK"
}
```

---

## 🎨 前端界面

### 通道配置表单

#### 基础配置
- 通道名称
- 国家选择（自动填充国家代码）
- 价格/条
- 最大字符数

#### 平台选择
- SMS57
- Twilio
- 阿里云
- 腾讯云
- 通用HTTP
- 通用SMPP
- 其他

#### 协议类型（单选）
- HTTP
- HTTPS
- SMPP

### HTTP/HTTPS 配置（动态显示）

当选择 HTTP 或 HTTPS 协议时显示：

1. **HTTP方法**
   - GET
   - POST

2. **网关地址**
   - 支持变量：`{phone}`, `{content}`, `{account}`, `{password}`
   - 示例：`https://api.example.com/send?phone={phone}&msg={content}`

3. **请求头**（可选）
   - JSON格式
   - 示例：`{"Content-Type": "application/json", "Authorization": "Bearer xxx"}`

4. **请求模板**（可选）
   - JSON格式
   - 支持变量替换
   - 示例：`{"mobile": "{phone}", "content": "{content}"}`

5. **成功匹配模式**
   - JSON路径表达式
   - 示例：`status.code=0` 或 `success=true`

### SMPP 配置（动态显示）

当选择 SMPP 协议时显示：

1. **SMPP服务器**
   - 服务器地址
   - 示例：`smpp.example.com`

2. **SMPP端口**
   - 默认：2775
   - 范围：1-65535

3. **系统ID**
   - SMPP系统标识符

4. **系统类型**（可选）
   - 默认：CMT
   - 其他：CP, VMS等

5. **TON**（Type of Number）
   - 0: Unknown
   - 1: International
   - 2: National
   - 3: Network Specific
   - 4: Subscriber Number
   - 5: Alphanumeric
   - 6: Abbreviated

6. **NPI**（Numbering Plan Indicator）
   - 0: Unknown
   - 1: ISDN/E.164
   - 3: Data (X.121)
   - 4: Telex
   - 6: Land Mobile
   - 8: National
   - 9: Private
   - 10: ERMES
   - 14: Internet
   - 18: WAP Client Id

### 通用配置
- 账号
- 密码
- 接入码（SMS57专用）
- API密钥（可选）
- 每日限额
- 状态（启用/禁用）

---

## 🔌 后端服务

### 1. SMS57Service（已有）
路径：`/backend/services/sms57Service.js`

专门用于SMS57平台的适配器。

### 2. GenericHttpService（新增）
路径：`/backend/services/genericHttpService.js`

**功能**：
- 支持GET/POST请求
- 自定义HTTP请求头
- 请求模板变量替换
- 响应成功模式匹配
- 自动提取消息ID

**变量替换**：
- `{phone}` - 手机号
- `{content}` - 短信内容（自动URL编码）
- `{account}` - 账号
- `{password}` - 密码

**成功匹配模式**：
使用JSON路径表达式，如：
- `status.code=0` - 检查 response.status.code 是否等于 0
- `success=true` - 检查 response.success 是否为 true

### 3. SMPPService（新增）
路径：`/backend/services/smppService.js`

**功能**：
- SMPP 3.4协议实现
- 自动绑定和解绑
- TON/NPI配置
- 送达报告支持
- 超时处理

**SMPP状态码**：
- 0: 发送成功
- 1-15: 各种错误码（详见代码注释）

---

## 🧪 测试发送

### 测试流程

1. **选择通道**
   - 点击通道列表的"测试"按钮

2. **填写测试信息**
   - 手机号（不含国家代码）
   - 短信内容

3. **发送测试**
   - 系统根据协议类型调用相应服务
   - HTTP/HTTPS: GenericHttpService 或 SMS57Service
   - SMPP: SMPPService

4. **查看结果**
   - 成功：显示消息ID
   - 失败：显示详细错误信息

### 测试记录

所有测试发送都会保存到数据库：
- `task_id = NULL` - 标识为测试记录
- `cost = 0` - 不计费
- `gateway_response` - 保存完整响应

---

## 📊 API接口

### 创建/更新通道

**请求**：
```http
POST /api/sms/admin/channels
PUT /api/sms/admin/channels/:id
```

**请求体示例**：
```json
{
  "channel_name": "测试通道",
  "country": "India",
  "country_code": "91",
  "price_per_sms": 0.01,
  "max_chars": 160,
  "platform_type": "generic_http",
  "protocol_type": "https",
  "http_method": "POST",
  "gateway_url": "https://api.example.com/send",
  "account": "api_user",
  "password": "api_password",
  "http_headers": "{\"Content-Type\": \"application/json\"}",
  "request_template": "{\"to\": \"{phone}\", \"message\": \"{content}\"}",
  "response_success_pattern": "status=success",
  "status": 1
}
```

### 测试发送

**请求**：
```http
POST /api/sms/admin/channels/:id/test
```

**请求体**：
```json
{
  "phone_number": "9876543210",
  "content": "Test message"
}
```

**响应（成功）**：
```json
{
  "success": true,
  "message": "测试发送成功",
  "data": {
    "mid": "MSG123456",
    "result": 0,
    "service": "Generic HTTP"
  }
}
```

**响应（失败）**：
```json
{
  "success": false,
  "message": "发送失败: 账号或密码错误",
  "data": {
    "mobile": "9876543210",
    "result": 1,
    "error": "Authentication failed"
  }
}
```

---

## 🔍 变量替换规则

### URL和模板中的变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `{phone}` | 手机号（不含国家代码） | 9876543210 |
| `{content}` | 短信内容（URL自动编码） | Hello%20World |
| `{account}` | 账号 | api_user |
| `{password}` | 密码 | api_password |

### 使用示例

**URL变量**：
```
https://api.example.com/send?to={phone}&msg={content}&user={account}&pwd={password}
```

**请求模板变量**：
```json
{
  "destination": "{phone}",
  "message": "{content}",
  "username": "{account}",
  "password": "{password}"
}
```

---

## ⚙️ 配置参考

### SMPP TON值

| 值 | 说明 | 适用场景 |
|----|------|---------|
| 0 | Unknown | 不确定号码类型 |
| 1 | International | 国际号码（+86...） |
| 2 | National | 国内号码 |
| 3 | Network Specific | 网络特定 |
| 4 | Subscriber Number | 用户号码 |
| 5 | Alphanumeric | 字母数字（短代码） |

### SMPP NPI值

| 值 | 说明 | 适用场景 |
|----|------|---------|
| 0 | Unknown | 未知 |
| 1 | ISDN/E.164 | 标准电话号码 |
| 3 | Data (X.121) | 数据网络 |
| 8 | National | 国内号码 |
| 9 | Private | 私有编号 |

---

## 🚀 部署信息

### 文件清单

| 文件 | 类型 | 说明 |
|------|------|------|
| `/backend/models/SmsChannel.js` | 修改 | 添加协议相关字段 |
| `/backend/services/smppService.js` | 新增 | SMPP协议服务 |
| `/backend/services/genericHttpService.js` | 新增 | 通用HTTP服务 |
| `/backend/routes/smsAdmin.js` | 修改 | 测试接口支持多协议 |
| `/src/views/sms/admin/channels.vue` | 修改 | 添加协议配置UI |

### 数据库变更

```sql
-- 新增字段
ALTER TABLE sms_channels 
ADD COLUMN protocol_type VARCHAR(20) DEFAULT 'http',
ADD COLUMN smpp_host VARCHAR(255),
ADD COLUMN smpp_port INT,
ADD COLUMN smpp_system_id VARCHAR(100),
ADD COLUMN smpp_system_type VARCHAR(50),
ADD COLUMN smpp_ton INT DEFAULT 0,
ADD COLUMN smpp_npi INT DEFAULT 0,
ADD COLUMN http_method VARCHAR(10) DEFAULT 'POST',
ADD COLUMN http_headers TEXT,
ADD COLUMN request_template TEXT,
ADD COLUMN response_success_pattern VARCHAR(255);
```

### 依赖包

需要安装SMPP协议库：
```bash
cd /home/vue-element-admin/backend
npm install smpp --save
```

---

## 📋 使用指南

### 配置HTTP通道

1. 登录系统 → 短信管理 → 通道配置
2. 点击"新建通道"
3. 填写基础信息（名称、国家、价格）
4. 选择平台类型："通用HTTP"
5. 选择协议类型："HTTP" 或 "HTTPS"
6. 选择HTTP方法："GET" 或 "POST"
7. 填写网关地址（支持变量）
8. 填写请求头（可选，JSON格式）
9. 填写请求模板（可选，JSON格式）
10. 填写成功匹配模式
11. 填写账号和密码
12. 点击"确定"保存
13. 点击"测试"验证配置

### 配置SMPP通道

1. 登录系统 → 短信管理 → 通道配置
2. 点击"新建通道"
3. 填写基础信息
4. 选择平台类型："通用SMPP"
5. 选择协议类型："SMPP"
6. 填写SMPP服务器地址
7. 填写SMPP端口（默认2775）
8. 填写系统ID
9. 填写系统类型（可选，默认CMT）
10. 设置TON和NPI（根据运营商要求）
11. 填写账号（源地址）和密码
12. 点击"确定"保存
13. 点击"测试"验证连接

---

## ⚠️ 注意事项

### HTTP/HTTPS配置

1. **变量必须正确**
   - 使用 `{phone}` 而不是 `${phone}` 或 `{{phone}}`
   - 变量区分大小写

2. **JSON格式**
   - 请求头和模板必须是有效的JSON
   - 使用双引号而不是单引号

3. **成功模式**
   - 使用点号分隔JSON路径
   - 等号两边的值会转为字符串比较

4. **URL编码**
   - `{content}` 会自动进行URL编码
   - 其他变量不编码

### SMPP配置

1. **网络连接**
   - 确保服务器能访问SMPP服务器
   - 检查防火墙规则

2. **TON/NPI**
   - 咨询运营商要求的值
   - 错误的TON/NPI可能导致发送失败

3. **系统类型**
   - 大多数情况使用 "CMT"
   - 特殊要求咨询运营商

4. **超时设置**
   - SMPP发送超时30秒
   - 可在代码中调整

### 测试建议

1. **先测试后启用**
   - 新通道配置后先测试
   - 测试成功再启用

2. **真实号码**
   - 使用真实手机号测试
   - 测试会实际发送短信

3. **错误处理**
   - 查看后端日志了解详细错误
   - 检查网关返回的响应

---

## 🐛 常见问题

### Q1: HTTP通道测试失败，提示"响应不匹配成功模式"？

**A**: 检查以下几点：
1. 成功匹配模式是否正确
2. 使用浏览器开发工具查看实际响应
3. 确认JSON路径是否正确
4. 尝试使用简单的匹配模式，如 `success=true`

### Q2: SMPP连接失败？

**A**: 排查步骤：
1. 检查SMPP服务器地址和端口是否正确
2. 测试网络连通性：`telnet smpp_host smpp_port`
3. 确认系统ID和密码正确
4. 查看后端日志了解详细错误

### Q3: 变量替换不生效？

**A**: 检查：
1. 变量格式是否正确（使用大括号）
2. 变量名是否正确（phone, content, account, password）
3. 在请求模板中是否正确使用了变量

### Q4: 如何查看测试记录？

**A**: 
```sql
SELECT * FROM sms_records 
WHERE task_id IS NULL 
ORDER BY created_at DESC 
LIMIT 10;
```

### Q5: 支持批量发送吗？

**A**: 
- 测试发送：仅支持单条
- 正式发送：通过任务系统支持批量

---

## 📞 技术支持

### 查看日志

```bash
# 后端日志
pm2 logs vue-admin-server --lines 100

# 过滤SMPP相关
pm2 logs vue-admin-server | grep SMPP

# 过滤HTTP相关
pm2 logs vue-admin-server | grep "HTTP"
```

### 测试连接

```bash
# 测试HTTP连接
curl -X POST https://api.example.com/send \
  -H "Content-Type: application/json" \
  -d '{"to": "1234567890", "message": "test"}'

# 测试SMPP连接
telnet smpp.example.com 2775
```

---

## ✅ 验收清单

- [x] 数据库字段添加成功
- [x] 模型定义更新
- [x] 前端协议选择UI
- [x] HTTP/HTTPS动态配置表单
- [x] SMPP动态配置表单
- [x] GenericHttpService实现
- [x] SMPPService实现
- [x] 测试接口支持多协议
- [x] 前端编译成功
- [x] 后端服务启动成功
- [x] API接口正常工作
- [x] 文档完整

---

**版本**: 1.0  
**最后更新**: 2025-10-21  
**状态**: 已部署上线
