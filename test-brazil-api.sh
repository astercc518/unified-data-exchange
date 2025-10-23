#!/bin/bash
# 巴西TS API测试脚本

GATEWAY="http://www.kaolasms.com:7862/smsv2"
ACCOUNT="888055"
PASSWORD="0VvOqbyu2Y7Z"
MOBILE="5531983059116"
CONTENT="Test message from system"

echo "========================================="
echo "巴西TS API 测试工具"
echo "========================================="
echo ""

# 测试1: JSON POST请求
echo "测试1: JSON POST 请求"
echo "-----------------------------------"
curl -X POST "$GATEWAY" \
  -H "Content-Type: application/json" \
  -d "{\"account\":\"$ACCOUNT\",\"password\":\"$PASSWORD\",\"mobile\":\"$MOBILE\",\"content\":\"$CONTENT\"}" \
  -w "\nHTTP状态码: %{http_code}\n" \
  2>&1
echo ""
echo ""

# 测试2: 表单POST请求
echo "测试2: 表单 POST 请求"
echo "-----------------------------------"
curl -X POST "$GATEWAY" \
  -d "account=$ACCOUNT" \
  -d "password=$PASSWORD" \
  -d "mobile=$MOBILE" \
  -d "content=$CONTENT" \
  -w "\nHTTP状态码: %{http_code}\n" \
  2>&1
echo ""
echo ""

# 测试3: GET请求
echo "测试3: GET 请求"
echo "-----------------------------------"
curl -X GET "$GATEWAY?account=$ACCOUNT&password=$PASSWORD&mobile=$MOBILE&content=Test%20message" \
  -w "\nHTTP状态码: %{http_code}\n" \
  2>&1
echo ""
echo ""

# 测试4: SMS57兼容格式
echo "测试4: SMS57 兼容格式 (带action和extno)"
echo "-----------------------------------"
curl -X POST "$GATEWAY" \
  -H "Content-Type: application/json" \
  -d "{\"action\":\"send\",\"account\":\"$ACCOUNT\",\"password\":\"$PASSWORD\",\"mobile\":\"$MOBILE\",\"content\":\"$CONTENT\",\"extno\":\"10690\"}" \
  -w "\nHTTP状态码: %{http_code}\n" \
  2>&1
echo ""
echo ""

echo "========================================="
echo "测试完成！"
echo "========================================="
echo ""
echo "请查看哪个测试返回了正确的响应，"
echo "并将结果告诉我，我会据此配置通道。"
echo ""
