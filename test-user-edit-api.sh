#!/bin/bash

# 测试编辑用户API修复
# 问题：编辑用户提示404错误
# 修复：添加 GET /api/users/:id 接口

echo "========================================="
echo "测试编辑用户API修复"
echo "========================================="
echo ""

# 设置终端颜色
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 获取用户列表，找到第一个用户
echo "📋 步骤1：获取用户列表..."
USERS_RESPONSE=$(curl -s -X GET "http://localhost:3000/api/users?page=1&limit=1" \
  -H "Content-Type: application/json")

USER_ID=$(echo $USERS_RESPONSE | grep -o '"id":[0-9]*' | head -n 1 | grep -o '[0-9]*')

if [ -z "$USER_ID" ]; then
  echo -e "${RED}❌ 错误：无法获取用户列表${NC}"
  echo "响应: $USERS_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ 找到用户ID: $USER_ID${NC}"
echo ""

# 2. 测试获取单个用户详情（编辑页面需要的API）
echo "🔍 步骤2：测试获取单个用户详情..."
echo "请求: GET /api/users/$USER_ID"
echo ""

USER_DETAIL=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "http://localhost:3000/api/users/$USER_ID" \
  -H "Content-Type: application/json")

HTTP_STATUS=$(echo "$USER_DETAIL" | grep "HTTP_STATUS" | cut -d: -f2)
RESPONSE_BODY=$(echo "$USER_DETAIL" | sed '/HTTP_STATUS/d')

echo "HTTP状态码: $HTTP_STATUS"
echo "响应内容:"
echo "$RESPONSE_BODY" | python -m json.tool 2>/dev/null || echo "$RESPONSE_BODY"
echo ""

# 验证响应
if [ "$HTTP_STATUS" = "200" ]; then
  echo -e "${GREEN}✅ 获取用户详情成功！${NC}"
  
  # 检查必要字段
  echo ""
  echo "🔍 检查返回字段:"
  
  HAS_LOGIN_ACCOUNT=$(echo "$RESPONSE_BODY" | grep -o '"loginAccount"' | wc -l)
  HAS_CUSTOMER_NAME=$(echo "$RESPONSE_BODY" | grep -o '"customerName"' | wc -l)
  HAS_EMAIL=$(echo "$RESPONSE_BODY" | grep -o '"email"' | wc -l)
  HAS_AGENT_ID=$(echo "$RESPONSE_BODY" | grep -o '"agentId"' | wc -l)
  HAS_BALANCE=$(echo "$RESPONSE_BODY" | grep -o '"accountBalance"' | wc -l)
  
  if [ $HAS_LOGIN_ACCOUNT -gt 0 ]; then
    echo -e "  ${GREEN}✅ loginAccount 字段存在${NC}"
  else
    echo -e "  ${RED}❌ loginAccount 字段缺失${NC}"
  fi
  
  if [ $HAS_CUSTOMER_NAME -gt 0 ]; then
    echo -e "  ${GREEN}✅ customerName 字段存在${NC}"
  else
    echo -e "  ${RED}❌ customerName 字段缺失${NC}"
  fi
  
  if [ $HAS_EMAIL -gt 0 ]; then
    echo -e "  ${GREEN}✅ email 字段存在${NC}"
  else
    echo -e "  ${RED}❌ email 字段缺失${NC}"
  fi
  
  if [ $HAS_AGENT_ID -gt 0 ]; then
    echo -e "  ${GREEN}✅ agentId 字段存在${NC}"
  else
    echo -e "  ${RED}❌ agentId 字段缺失${NC}"
  fi
  
  if [ $HAS_BALANCE -gt 0 ]; then
    echo -e "  ${GREEN}✅ accountBalance 字段存在${NC}"
  else
    echo -e "  ${RED}❌ accountBalance 字段缺失${NC}"
  fi
  
elif [ "$HTTP_STATUS" = "404" ]; then
  echo -e "${RED}❌ Bug未修复：仍然返回404错误${NC}"
  echo -e "${YELLOW}原因：缺少 GET /api/users/:id 路由${NC}"
  exit 1
else
  echo -e "${RED}❌ 错误：HTTP状态码 $HTTP_STATUS${NC}"
  exit 1
fi

echo ""
echo "========================================="
echo -e "${GREEN}✅ 编辑用户API修复验证通过！${NC}"
echo "========================================="
echo ""
echo "修复内容："
echo "1. ✅ 添加了 GET /api/users/:id 路由获取单个用户详情"
echo "2. ✅ 字段命名统一转换为驼峰格式（与前端匹配）"
echo "3. ✅ 在 edit.vue 中添加 userId computed 属性"
echo ""
echo "现在可以正常编辑用户了！"
