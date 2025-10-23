# SMS通道多协议支持 - 快速配置指南

## 🚀 快速开始

### 1️⃣ 配置HTTP通道（5分钟）

#### SMS57平台
```
平台类型: SMS57
协议类型: HTTP
网关地址: http://www.kaolasms.com:7862/smsv2
账号: 您的SMS57账号
密码: 您的SMS57密码
接入码: 10690
```

#### 阿里云短信
```
平台类型: 阿里云
协议类型: HTTPS
HTTP方法: POST
网关地址: https://dysmsapi.aliyuncs.com/
账号: AccessKeyId
密码: AccessKeySecret
请求头: {"Content-Type": "application/x-www-form-urlencoded"}
请求模板: {"Action": "SendSms", "PhoneNumbers": "{phone}", "SignName": "您的签名", "TemplateCode": "SMS_12345", "TemplateParam": "{\"code\":\"{content}\"}"}
成功匹配: Code=OK
```

#### 腾讯云短信
```
平台类型: 腾讯云
协议类型: HTTPS
HTTP方法: POST
网关地址: https://sms.tencentcloudapi.com/
账号: SecretId
密码: SecretKey
请求头: {"Content-Type": "application/json"}
请求模板: {"PhoneNumberSet": ["{phone}"], "SmsSdkAppId": "您的AppId", "SignName": "您的签名", "TemplateId": "模板ID", "TemplateParamSet": ["{content}"]}
成功匹配: Response.SendStatusSet.0.Code=Ok
```

### 2️⃣ 配置SMPP通道（10分钟）

```
平台类型: 通用SMPP
协议类型: SMPP
SMPP服务器: smpp.example.com
SMPP端口: 2775
系统ID: your_system_id
系统类型: CMT
账号: 源地址/短代码
密码: SMPP密码
TON: 1 (国际号码) 或 0 (未知)
NPI: 1 (ISDN/E.164)
```

### 3️⃣ 测试通道（2分钟）

1. 点击通道的"测试"按钮
2. 输入手机号（不含国家代码）
3. 输入测试内容
4. 点击"发送测试短信"
5. 查看发送结果

---

## 📋 配置模板

### 通用HTTP GET

```json
{
  "channel_name": "通用HTTP-GET通道",
  "country": "India",
  "country_code": "91",
  "platform_type": "generic_http",
  "protocol_type": "http",
  "http_method": "GET",
  "gateway_url": "http://api.example.com/send?user={account}&pwd={password}&mobile={phone}&content={content}",
  "account": "api_username",
  "password": "api_password",
  "response_success_pattern": "status=success"
}
```

### 通用HTTP POST

```json
{
  "channel_name": "通用HTTP-POST通道",
  "country": "USA",
  "country_code": "1",
  "platform_type": "generic_http",
  "protocol_type": "https",
  "http_method": "POST",
  "gateway_url": "https://api.example.com/v1/sms",
  "account": "api_key",
  "password": "api_secret",
  "http_headers": "{\"Content-Type\": \"application/json\", \"Authorization\": \"Bearer {password}\"}",
  "request_template": "{\"to\": \"+{phone}\", \"message\": \"{content}\", \"from\": \"{account}\"}",
  "response_success_pattern": "success=true"
}
```

---

## 🔧 变量说明

| 变量 | 说明 | 示例 |
|------|------|------|
| `{phone}` | 手机号（不含国家代码） | 9876543210 |
| `{content}` | 短信内容 | Hello World |
| `{account}` | 账号 | api_user |
| `{password}` | 密码 | api_password |

---

## ⚡ 成功模式示例

| 平台 | 响应格式 | 匹配模式 |
|------|----------|---------|
| 阿里云 | `{"Code":"OK"}` | `Code=OK` |
| 腾讯云 | `{"Response":{"SendStatusSet":[{"Code":"Ok"}]}}` | `Response.SendStatusSet.0.Code=Ok` |
| 通用 | `{"status":{"code":0}}` | `status.code=0` |
| 通用 | `{"success":true}` | `success=true` |

---

## ⚠️ 常见错误

### 错误1: "响应不匹配成功模式"
**解决**: 
1. 检查实际响应格式
2. 调整成功匹配模式
3. 使用后端日志查看完整响应

### 错误2: "SMPP连接失败"
**解决**:
1. 检查服务器地址和端口
2. 确认系统ID和密码
3. 测试网络连通性

### 错误3: "变量未替换"
**解决**:
1. 检查变量格式（使用大括号）
2. 确认变量名正确
3. 查看请求日志

---

## 📞 快速测试

### 测试HTTP连接
```bash
curl -X POST https://api.example.com/send \
  -H "Content-Type: application/json" \
  -d '{"to": "1234567890", "message": "test"}'
```

### 测试SMPP连接
```bash
telnet smpp.example.com 2775
```

---

## ✅ 配置检查清单

- [ ] 通道名称已填写
- [ ] 国家和国家代码已选择
- [ ] 平台类型已选择
- [ ] 协议类型已选择
- [ ] 网关地址已填写（HTTP）或服务器地址已填写（SMPP）
- [ ] 账号和密码已填写
- [ ] 特殊配置已填写（请求模板、成功模式等）
- [ ] 已测试发送并成功

---

**版本**: 1.0  
**更新时间**: 2025-10-21
