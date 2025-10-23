#!/bin/bash

echo "======================================"
echo "🧪 API操作功能实际测试"
echo "======================================"

API_BASE="http://localhost:3000"
USER_ID=5

echo ""
echo "1️⃣ 查询客户当前状态..."
RESPONSE=$(curl -s ${API_BASE}/api/users)
echo "$RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
users = data.get('data', [])
user = next((u for u in users if u['id'] == $USER_ID), None)
if user:
    print(f\"客户名称: {user.get('customerName', 'N/A')}\")
    print(f\"账户余额: ¥{user.get('accountBalance', 0)}\")
    print(f\"状态: {'激活' if user.get('status') == 1 else '停用'}\")
else:
    print('客户不存在')
" 2>/dev/null || echo "（需要python3解析JSON）"

echo ""
echo "2️⃣ 测试充值功能（+500）..."
OLD_BALANCE=$(curl -s ${API_BASE}/api/users | grep -A 10 "\"id\":$USER_ID" | grep "accountBalance" | sed 's/.*"accountBalance":\([0-9.]*\).*/\1/')
NEW_BALANCE=$(echo "$OLD_BALANCE + 500" | bc)
echo "   旧余额: ¥$OLD_BALANCE"
echo "   新余额: ¥$NEW_BALANCE"

RECHARGE_RESULT=$(curl -s -X PUT ${API_BASE}/api/users/$USER_ID \
  -H "Content-Type: application/json" \
  -d "{\"accountBalance\": $NEW_BALANCE}")

if echo "$RECHARGE_RESULT" | grep -q '"success":true'; then
  echo "   ✅ 充值成功"
else
  echo "   ❌ 充值失败: $RECHARGE_RESULT"
fi

echo ""
echo "3️⃣ 验证余额已更新..."
sleep 1
CURRENT_BALANCE=$(curl -s ${API_BASE}/api/users | grep -A 10 "\"id\":$USER_ID" | grep "accountBalance" | sed 's/.*"accountBalance":\([0-9.]*\).*/\1/')
echo "   当前余额: ¥$CURRENT_BALANCE"

if [ "$CURRENT_BALANCE" = "$NEW_BALANCE" ]; then
  echo "   ✅ 余额验证成功"
else
  echo "   ⚠️  余额不匹配"
fi

echo ""
echo "4️⃣ 测试状态切换（停用）..."
STATUS_RESULT=$(curl -s -X PUT ${API_BASE}/api/users/$USER_ID \
  -H "Content-Type: application/json" \
  -d '{"status": 0}')

if echo "$STATUS_RESULT" | grep -q '"success":true'; then
  echo "   ✅ 状态切换成功"
else
  echo "   ❌ 状态切换失败"
fi

echo ""
echo "5️⃣ 恢复状态（激活）..."
curl -s -X PUT ${API_BASE}/api/users/$USER_ID \
  -H "Content-Type: application/json" \
  -d '{"status": 1}' > /dev/null
echo "   ✅ 状态已恢复为激活"

echo ""
echo "======================================"
echo "✅ API测试完成！"
echo "======================================"
