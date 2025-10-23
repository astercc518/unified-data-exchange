#!/bin/bash

# 测试创建用户API
# 首先获取admin token

echo "正在测试创建用户API..."

# 使用admin账号登录获取token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "获取到Token: $TOKEN"

# 调用创建用户API
echo "正在创建用户..."
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "loginAccount": "test001",
    "loginPassword": "test123456",
    "customerName": "测试客户001",
    "email": "test001@test.com",
    "agentId": "4",
    "agentName": "测试代理",
    "salePriceRate": 1.0,
    "accountBalance": 0,
    "overdraftAmount": 0,
    "status": 1,
    "remark": "测试创建"
  }' \
  -w "\n状态码: %{http_code}\n" \
  -v

echo ""
echo "测试完成"
