#!/bin/bash

echo "======================================"
echo "🧪 测试创建客户API"
echo "======================================"

# 测试数据
TEST_DATA='{
  "loginAccount": "testuser999",
  "loginPassword": "123456",
  "customerName": "测试客户999",
  "email": "test999@example.com",
  "agentId": "1",
  "agentName": "测试代理",
  "salePriceRate": 1.5,
  "accountBalance": 100.00,
  "overdraftAmount": 0.00,
  "status": 1,
  "remark": "API测试创建"
}'

echo ""
echo "📤 发送创建请求..."
echo "数据: $TEST_DATA"
echo ""

RESPONSE=$(curl -s -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d "$TEST_DATA")

echo "📥 响应结果:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"

# 检查是否成功
if echo "$RESPONSE" | grep -q '"success":true'; then
  echo ""
  echo "✅ 创建成功！"
else
  echo ""
  echo "❌ 创建失败！"
fi

echo ""
echo "======================================"
