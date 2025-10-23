#!/bin/bash

echo "======================================"
echo "✅ 客户列表单价修复验证"
echo "======================================"

echo ""
echo "1️⃣ 检查后端服务状态..."
if ps aux | grep "node server.js" | grep -v grep > /dev/null; then
  echo "   ✅ 后端服务运行中"
else
  echo "   ❌ 后端服务未运行"
  exit 1
fi

echo ""
echo "2️⃣ 测试API返回数据..."
RESPONSE=$(curl -s http://localhost:3000/api/users)

if echo "$RESPONSE" | grep -q '"success":true'; then
  echo "   ✅ API调用成功"
else
  echo "   ❌ API调用失败"
  exit 1
fi

echo ""
echo "3️⃣ 检查unitPrice字段..."
if echo "$RESPONSE" | grep -q '"unitPrice"'; then
  echo "   ❌ 仍然包含unitPrice字段（未修复）"
  echo "$RESPONSE" | grep -o '"unitPrice":[^,}]*'
else
  echo "   ✅ unitPrice字段已移除"
fi

echo ""
echo "4️⃣ 检查salePriceRate字段..."
if echo "$RESPONSE" | grep -q '"salePriceRate"'; then
  echo "   ✅ salePriceRate字段存在"
  echo "$RESPONSE" | grep -o '"salePriceRate":[^,}]*' | head -n 3
else
  echo "   ❌ salePriceRate字段缺失"
fi

echo ""
echo "5️⃣ 显示完整数据示例..."
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null | head -n 30 || echo "$RESPONSE" | head -c 500

echo ""
echo "======================================"
echo "✅ 验证完成！"
echo "======================================"
