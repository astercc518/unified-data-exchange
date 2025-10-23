#!/bin/bash

echo "======================================"
echo "🧪 充值金额重复Bug修复验证"
echo "======================================"

API_BASE="http://localhost:3000"
USER_ID=5

echo ""
echo "1️⃣ 查询客户当前余额..."
RESPONSE=$(curl -s ${API_BASE}/api/users)
OLD_BALANCE=$(echo "$RESPONSE" | grep -o "\"id\":$USER_ID[^}]*\"accountBalance\":[0-9.]*" | grep -o "\"accountBalance\":[0-9.]*" | cut -d: -f2)
echo "   当前余额: ¥$OLD_BALANCE"

echo ""
echo "2️⃣ 测试充值100..."
RECHARGE_AMOUNT=100
echo "   充值金额: ¥$RECHARGE_AMOUNT"

RECHARGE_RESPONSE=$(curl -s -X POST ${API_BASE}/api/recharge-records \
  -H "Content-Type: application/json" \
  -d "{
    \"customer_id\": $USER_ID,
    \"customer_name\": \"KL01880V01\",
    \"amount\": $RECHARGE_AMOUNT,
    \"method\": \"system\",
    \"remark\": \"测试充值Bug修复\"
  }")

if echo "$RECHARGE_RESPONSE" | grep -q '"success":true'; then
  echo "   ✅ 充值API调用成功"
else
  echo "   ❌ 充值API调用失败"
  echo "$RECHARGE_RESPONSE"
  exit 1
fi

echo ""
echo "3️⃣ 验证充值后余额..."
sleep 2
RESPONSE=$(curl -s ${API_BASE}/api/users)
NEW_BALANCE=$(echo "$RESPONSE" | grep -o "\"id\":$USER_ID[^}]*\"accountBalance\":[0-9.]*" | grep -o "\"accountBalance\":[0-9.]*" | cut -d: -f2)
echo "   新余额: ¥$NEW_BALANCE"

echo ""
echo "4️⃣ 计算余额变化..."
EXPECTED_BALANCE=$(echo "$OLD_BALANCE + $RECHARGE_AMOUNT" | bc)
ACTUAL_INCREASE=$(echo "$NEW_BALANCE - $OLD_BALANCE" | bc)

echo "   旧余额: ¥$OLD_BALANCE"
echo "   充值金额: ¥$RECHARGE_AMOUNT"
echo "   预期新余额: ¥$EXPECTED_BALANCE"
echo "   实际新余额: ¥$NEW_BALANCE"
echo "   实际增加: ¥$ACTUAL_INCREASE"

echo ""
echo "5️⃣ 验证结果..."
if [ "$ACTUAL_INCREASE" = "$RECHARGE_AMOUNT" ]; then
  echo "   ✅ 充值金额正确！余额增加了 ¥$ACTUAL_INCREASE"
  echo "   ✅ Bug已修复：充值$RECHARGE_AMOUNT，余额增加$ACTUAL_INCREASE"
else
  echo "   ❌ 充值金额错误！"
  echo "   预期增加: ¥$RECHARGE_AMOUNT"
  echo "   实际增加: ¥$ACTUAL_INCREASE"
  if [ "$(echo "$ACTUAL_INCREASE == $RECHARGE_AMOUNT * 2" | bc)" = "1" ]; then
    echo "   ⚠️  Bug仍然存在：余额被重复更新了！"
  fi
fi

echo ""
echo "======================================"
echo "测试完成！"
echo "======================================"
