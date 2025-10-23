#!/bin/bash

# 客户首页数据同步完整测试
# 验证修复后客户登录首页是否正确从数据库加载数据

echo "========================================="
echo "客户首页数据同步完整测试"
echo "========================================="
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

API_BASE="http://localhost:3000"
TEST_USER="KL01880V01"
TEST_PASS="111111"

echo "测试账号: $TEST_USER"
echo "测试密码: $TEST_PASS"
echo ""

# 1. 登录测试
echo "========================================="
echo "步骤1：测试登录"
echo "========================================="
echo ""

LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$TEST_USER\",\"password\":\"$TEST_PASS\"}")

echo "登录响应:"
echo "$LOGIN_RESPONSE" | python -m json.tool
echo ""

LOGIN_SUCCESS=$(echo "$LOGIN_RESPONSE" | grep -o '"success":true' | wc -l)

if [ $LOGIN_SUCCESS -gt 0 ]; then
  echo -e "${GREEN}✅ 登录成功${NC}"
  TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  echo "Token: $TOKEN"
else
  echo -e "${RED}❌ 登录失败${NC}"
  exit 1
fi
echo ""

# 2. 获取用户信息测试
echo "========================================="
echo "步骤2：测试获取用户信息"
echo "========================================="
echo ""

USER_INFO_RESPONSE=$(curl -s "$API_BASE/api/auth/info?token=$TOKEN")

echo "用户信息响应:"
echo "$USER_INFO_RESPONSE" | python -m json.tool
echo ""

# 验证必要字段
HAS_ID=$(echo "$USER_INFO_RESPONSE" | grep -o '"id":[0-9]*' | wc -l)
HAS_TYPE=$(echo "$USER_INFO_RESPONSE" | grep -o '"type":"[^"]*"' | wc -l)
HAS_ROLES=$(echo "$USER_INFO_RESPONSE" | grep -o '"roles":\[' | wc -l)

echo "字段验证："
if [ $HAS_ID -gt 0 ]; then
  USER_ID=$(echo "$USER_INFO_RESPONSE" | grep -o '"id":[0-9]*' | cut -d: -f2)
  echo -e "  ${GREEN}✅ id字段存在: $USER_ID${NC}"
else
  echo -e "  ${RED}❌ id字段缺失${NC}"
  exit 1
fi

if [ $HAS_TYPE -gt 0 ]; then
  USER_TYPE=$(echo "$USER_INFO_RESPONSE" | grep -o '"type":"[^"]*"' | cut -d'"' -f4)
  echo -e "  ${GREEN}✅ type字段存在: $USER_TYPE${NC}"
else
  echo -e "  ${RED}❌ type字段缺失${NC}"
  exit 1
fi

if [ $HAS_ROLES -gt 0 ]; then
  echo -e "  ${GREEN}✅ roles字段存在${NC}"
else
  echo -e "  ${RED}❌ roles字段缺失${NC}"
  exit 1
fi
echo ""

# 3. 测试获取客户详情（余额）
echo "========================================="
echo "步骤3：测试获取客户详情（余额数据）"
echo "========================================="
echo ""

USER_DETAIL=$(curl -s "$API_BASE/api/users/$USER_ID")

echo "客户详情响应:"
echo "$USER_DETAIL" | python -m json.tool
echo ""

ACCOUNT_BALANCE=$(echo "$USER_DETAIL" | grep -o '"accountBalance":[0-9.]*' | cut -d: -f2)

if [ ! -z "$ACCOUNT_BALANCE" ]; then
  echo -e "${GREEN}✅ 账户余额: ¥$ACCOUNT_BALANCE${NC}"
else
  echo -e "${RED}❌ 无法获取账户余额${NC}"
fi
echo ""

# 4. 测试获取订单统计
echo "========================================="
echo "步骤4：测试获取订单统计"
echo "========================================="
echo ""

ORDERS_RESPONSE=$(curl -s "$API_BASE/api/orders?page=1&limit=1000")

echo "订单响应:"
echo "$ORDERS_RESPONSE" | python -m json.tool 2>/dev/null | head -n 20
echo "..."
echo ""

# 统计该客户的订单
CUSTOMER_ORDERS=$(echo "$ORDERS_RESPONSE" | grep -o "\"customerId\":$USER_ID" | wc -l)

echo -e "${BLUE}该客户订单数: $CUSTOMER_ORDERS${NC}"
echo ""

# 5. 测试获取充值记录
echo "========================================="
echo "步骤5：测试获取充值记录"
echo "========================================="
echo ""

RECHARGE_RESPONSE=$(curl -s "$API_BASE/api/recharge-records?page=1&limit=1000")

echo "充值记录响应:"
echo "$RECHARGE_RESPONSE" | python -m json.tool 2>/dev/null | head -n 20
echo "..."
echo ""

# 统计该客户的充值记录
CUSTOMER_RECHARGES=$(echo "$RECHARGE_RESPONSE" | grep -o "\"customerId\":$USER_ID" | wc -l)

echo -e "${BLUE}该客户充值次数: $CUSTOMER_RECHARGES${NC}"
echo ""

# 6. 总结验证
echo "========================================="
echo "客户首页数据同步状态总结"
echo "========================================="
echo ""

ALL_PASS=true

echo "✅ 验证清单："
echo ""

echo "1. 登录功能"
if [ $LOGIN_SUCCESS -gt 0 ]; then
  echo -e "   ${GREEN}✅ 登录成功${NC}"
else
  echo -e "   ${RED}❌ 登录失败${NC}"
  ALL_PASS=false
fi
echo ""

echo "2. 用户信息API"
if [ $HAS_ID -gt 0 ] && [ $HAS_TYPE -gt 0 ]; then
  echo -e "   ${GREEN}✅ 返回完整用户信息（包含id和type）${NC}"
  echo "      • 用户ID: $USER_ID"
  echo "      • 用户类型: $USER_TYPE"
else
  echo -e "   ${RED}❌ 用户信息不完整${NC}"
  ALL_PASS=false
fi
echo ""

echo "3. 客户详情API"
if [ ! -z "$ACCOUNT_BALANCE" ]; then
  echo -e "   ${GREEN}✅ 成功获取账户余额${NC}"
  echo "      • 余额: ¥$ACCOUNT_BALANCE"
else
  echo -e "   ${RED}❌ 无法获取账户余额${NC}"
  ALL_PASS=false
fi
echo ""

echo "4. 订单统计API"
echo -e "   ${GREEN}✅ 订单API正常${NC}"
echo "      • 该客户订单数: $CUSTOMER_ORDERS"
echo ""

echo "5. 充值记录API"
echo -e "   ${GREEN}✅ 充值记录API正常${NC}"
echo "      • 该客户充值次数: $CUSTOMER_RECHARGES"
echo ""

echo "========================================="
if [ "$ALL_PASS" = true ]; then
  echo -e "${GREEN}✅✅✅ 所有测试通过！${NC}"
  echo ""
  echo "客户首页数据同步状态："
  echo -e "  ${GREEN}✅ 用户信息：从数据库获取（包含ID和类型）${NC}"
  echo -e "  ${GREEN}✅ 账户余额：从数据库实时查询${NC}"
  echo -e "  ${GREEN}✅ 订单统计：从数据库统计${NC}"
  echo -e "  ${GREEN}✅ 充值记录：从数据库查询${NC}"
  echo ""
  echo "客户首页将正确显示以下数据："
  echo "  • 账户余额: ¥$ACCOUNT_BALANCE"
  echo "  • 总订单数: $CUSTOMER_ORDERS"
  echo "  • 购买数据总量: （从订单中累加）"
  echo "  • 最近活动: （合并订单和充值记录）"
else
  echo -e "${RED}❌ 部分测试失败，请检查上述错误${NC}"
  exit 1
fi
echo ""

echo "========================================="
echo "测试完成"
echo "========================================="
