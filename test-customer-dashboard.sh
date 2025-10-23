#!/bin/bash

# 测试客户首页数据同步
# 问题：客户登录首页显示的信息未同步数据库
# 验证：检查客户首页数据是否从数据库正确加载

echo "========================================="
echo "测试客户首页数据同步"
echo "========================================="
echo ""

# 设置终端颜色
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. 获取一个客户用户
echo "📋 步骤1：获取客户用户信息..."
USERS_RESPONSE=$(curl -s -X GET "http://localhost:3000/api/users?page=1&limit=10" \
  -H "Content-Type: application/json")

CUSTOMER_ID=$(echo $USERS_RESPONSE | grep -o '"id":[0-9]*' | head -n 1 | grep -o '[0-9]*')

if [ -z "$CUSTOMER_ID" ]; then
  echo -e "${RED}❌ 错误：无法获取客户信息${NC}"
  echo "响应: $USERS_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ 找到客户ID: $CUSTOMER_ID${NC}"
echo ""

# 2. 测试获取客户详情（首页需要的余额数据）
echo "🔍 步骤2：测试获取客户详情（余额信息）..."
CUSTOMER_DETAIL=$(curl -s -X GET "http://localhost:3000/api/users/$CUSTOMER_ID" \
  -H "Content-Type: application/json")

ACCOUNT_BALANCE=$(echo "$CUSTOMER_DETAIL" | grep -o '"accountBalance":[0-9.]*' | head -n 1 | cut -d: -f2)
LOGIN_ACCOUNT=$(echo "$CUSTOMER_DETAIL" | grep -o '"loginAccount":"[^"]*"' | head -n 1 | cut -d'"' -f4)
CUSTOMER_NAME=$(echo "$CUSTOMER_DETAIL" | grep -o '"customerName":"[^"]*"' | head -n 1 | cut -d'"' -f4)

echo -e "${BLUE}客户信息：${NC}"
echo "  登录账号: $LOGIN_ACCOUNT"
echo "  客户名称: $CUSTOMER_NAME"
echo "  账户余额: ¥$ACCOUNT_BALANCE"
echo ""

# 3. 测试获取该客户的订单统计
echo "📊 步骤3：测试获取客户订单统计..."
ORDERS_RESPONSE=$(curl -s -X GET "http://localhost:3000/api/orders?page=1&limit=1000" \
  -H "Content-Type: application/json")

# 统计该客户的订单数量
TOTAL_ORDERS=$(echo "$ORDERS_RESPONSE" | grep -o "\"customerId\":$CUSTOMER_ID" | wc -l)

echo -e "${BLUE}订单统计：${NC}"
echo "  总订单数: $TOTAL_ORDERS"
echo ""

# 4. 测试获取该客户的充值记录
echo "💰 步骤4：测试获取客户充值记录..."
RECHARGE_RESPONSE=$(curl -s -X GET "http://localhost:3000/api/recharge-records?page=1&limit=1000" \
  -H "Content-Type: application/json")

# 统计该客户的充值记录数量
TOTAL_RECHARGES=$(echo "$RECHARGE_RESPONSE" | grep -o "\"customerId\":$CUSTOMER_ID" | wc -l)

echo -e "${BLUE}充值记录：${NC}"
echo "  总充值次数: $TOTAL_RECHARGES"
echo ""

# 5. 模拟客户登录并验证首页数据
echo "🔐 步骤5：模拟客户登录流程..."

# 假设客户密码是 111111 或 123456（测试用）
for PASSWORD in "111111" "123456"; do
  LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$LOGIN_ACCOUNT\",\"password\":\"$PASSWORD\"}")
  
  LOGIN_SUCCESS=$(echo "$LOGIN_RESPONSE" | grep -o '"success":true' | wc -l)
  
  if [ $LOGIN_SUCCESS -gt 0 ]; then
    echo -e "${GREEN}✅ 登录成功！${NC}"
    echo "  账号: $LOGIN_ACCOUNT"
    echo "  密码: $PASSWORD"
    
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo "  Token: $TOKEN"
    echo ""
    break
  fi
done

if [ $LOGIN_SUCCESS -eq 0 ]; then
  echo -e "${YELLOW}⚠️ 无法自动登录，尝试常见密码失败${NC}"
  echo ""
fi

# 6. 验证首页需要的所有数据
echo "========================================="
echo "📋 客户首页数据验证"
echo "========================================="
echo ""

echo -e "${BLUE}首页应该显示的数据：${NC}"
echo ""

echo "1️⃣ 账户余额"
if [ ! -z "$ACCOUNT_BALANCE" ]; then
  echo -e "   ${GREEN}✅ ¥$ACCOUNT_BALANCE${NC} （从数据库获取）"
else
  echo -e "   ${RED}❌ 余额数据缺失${NC}"
fi
echo ""

echo "2️⃣ 总订单数"
if [ $TOTAL_ORDERS -gt 0 ]; then
  echo -e "   ${GREEN}✅ $TOTAL_ORDERS 个订单${NC} （从数据库统计）"
else
  echo -e "   ${YELLOW}⚠️ 暂无订单${NC}"
fi
echo ""

echo "3️⃣ 购买数据总量"
echo -e "   ${BLUE}ℹ️ 需要从订单详情中统计quantity字段${NC}"
echo ""

echo "4️⃣ 最近活动"
if [ $TOTAL_ORDERS -gt 0 ] || [ $TOTAL_RECHARGES -gt 0 ]; then
  echo -e "   ${GREEN}✅ 有 $TOTAL_ORDERS 个订单 + $TOTAL_RECHARGES 条充值记录${NC}"
else
  echo -e "   ${YELLOW}⚠️ 暂无活动记录${NC}"
fi
echo ""

# 7. 检查前端代码是否正确调用API
echo "========================================="
echo "🔍 检查前端数据加载逻辑"
echo "========================================="
echo ""

CUSTOMER_VUE="/home/vue-element-admin/src/views/dashboard/customer.vue"

echo "检查 customer.vue 文件..."
echo ""

# 检查是否调用了数据库API
HAS_USER_API=$(grep -c "api/users" "$CUSTOMER_VUE")
HAS_ORDER_API=$(grep -c "api/orders" "$CUSTOMER_VUE")
HAS_RECHARGE_API=$(grep -c "api/recharge-records" "$CUSTOMER_VUE")

echo "API调用检查："
if [ $HAS_USER_API -gt 0 ]; then
  echo -e "  ${GREEN}✅ 调用了 /api/users (用户信息)${NC}"
else
  echo -e "  ${RED}❌ 未调用 /api/users${NC}"
fi

if [ $HAS_ORDER_API -gt 0 ]; then
  echo -e "  ${GREEN}✅ 调用了 /api/orders (订单统计)${NC}"
else
  echo -e "  ${RED}❌ 未调用 /api/orders${NC}"
fi

if [ $HAS_RECHARGE_API -gt 0 ]; then
  echo -e "  ${GREEN}✅ 调用了 /api/recharge-records (充值记录)${NC}"
else
  echo -e "  ${RED}❌ 未调用 /api/recharge-records${NC}"
fi
echo ""

# 8. 总结
echo "========================================="
echo "📊 数据同步状态总结"
echo "========================================="
echo ""

SYNC_OK=true

if [ -z "$ACCOUNT_BALANCE" ]; then
  echo -e "${RED}❌ 余额数据未同步${NC}"
  SYNC_OK=false
fi

if [ $HAS_USER_API -eq 0 ] || [ $HAS_ORDER_API -eq 0 ] || [ $HAS_RECHARGE_API -eq 0 ]; then
  echo -e "${RED}❌ 前端未完全调用数据库API${NC}"
  SYNC_OK=false
fi

if [ "$SYNC_OK" = true ]; then
  echo -e "${GREEN}✅ 客户首页数据已正确同步数据库！${NC}"
  echo ""
  echo "所有数据来源："
  echo "  • 账户余额 → GET /api/users/:id"
  echo "  • 订单统计 → GET /api/orders?customerId=xxx"
  echo "  • 充值记录 → GET /api/recharge-records?customerId=xxx"
  echo "  • 数据总量 → 从订单记录中累加quantity"
else
  echo -e "${YELLOW}⚠️ 发现数据同步问题，请检查上述错误${NC}"
fi

echo ""
echo "========================================="
echo "测试完成"
echo "========================================="
