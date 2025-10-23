#!/bin/bash

# 后端API权限测试脚本
# 用法: ./test-backend-permissions.sh

BASE_URL="http://localhost:3000"
ADMIN_TOKEN=""
AGENT_TOKEN=""
CUSTOMER_TOKEN=""

echo "🚀 后端API权限测试脚本"
echo "======================================"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试计数器
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 测试函数
test_api() {
    local test_name="$1"
    local method="$2"
    local url="$3"
    local token="$4"
    local expected_status="$5"
    local data="$6"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo ""
    echo "测试 $TOTAL_TESTS: $test_name"
    echo "  方法: $method"
    echo "  URL: $url"
    echo "  预期状态: $expected_status"
    
    if [ -n "$data" ]; then
        if [ -n "$token" ]; then
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$url" \
                -H "Authorization: Bearer $token" \
                -H "Content-Type: application/json" \
                -d "$data")
        else
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$url" \
                -H "Content-Type: application/json" \
                -d "$data")
        fi
    else
        if [ -n "$token" ]; then
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$url" \
                -H "Authorization: Bearer $token")
        else
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$url")
        fi
    fi
    
    http_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq "$expected_status" ]; then
        echo -e "  ${GREEN}✅ 通过${NC} (状态码: $http_code)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "  ${RED}❌ 失败${NC} (实际状态码: $http_code)"
        echo "  响应内容: $body"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# ==================== 第一步: 获取Token ====================
echo ""
echo "📝 第一步: 获取测试Token"
echo "--------------------------------------"

# 登录admin
echo "登录 admin..."
response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"loginAccount":"admin","loginPassword":"111111"}')

ADMIN_TOKEN=$(echo $response | grep -o '"token":"[^"]*"' | sed 's/"token":"\(.*\)"/\1/')

if [ -n "$ADMIN_TOKEN" ]; then
    echo -e "${GREEN}✅ Admin Token获取成功${NC}"
else
    echo -e "${RED}❌ Admin Token获取失败${NC}"
    echo "响应: $response"
    exit 1
fi

# 登录agent (假设存在agent01账号)
echo "登录 agent01..."
response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"loginAccount":"agent01","loginPassword":"123456"}')

AGENT_TOKEN=$(echo $response | grep -o '"token":"[^"]*"' | sed 's/"token":"\(.*\)"/\1/')

if [ -n "$AGENT_TOKEN" ]; then
    echo -e "${GREEN}✅ Agent Token获取成功${NC}"
else
    echo -e "${YELLOW}⚠️ Agent Token获取失败 (可能账号不存在)${NC}"
fi

# 登录customer (假设存在customer01账号)
echo "登录 customer01..."
response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"loginAccount":"customer01","loginPassword":"123456"}')

CUSTOMER_TOKEN=$(echo $response | grep -o '"token":"[^"]*"' | sed 's/"token":"\(.*\)"/\1/')

if [ -n "$CUSTOMER_TOKEN" ]; then
    echo -e "${GREEN}✅ Customer Token获取成功${NC}"
else
    echo -e "${YELLOW}⚠️ Customer Token获取失败 (可能账号不存在)${NC}"
fi

# ==================== 第二步: Token验证测试 ====================
echo ""
echo "🔐 第二步: Token验证测试"
echo "--------------------------------------"

# 测试1: 无Token访问
test_api "无Token访问客户列表" "GET" "/api/users" "" 401

# 测试2: 无效Token访问
test_api "无效Token访问客户列表" "GET" "/api/users" "INVALID_TOKEN" 403

# 测试3: 有效Token访问
if [ -n "$ADMIN_TOKEN" ]; then
    test_api "有效Token访问客户列表 (Admin)" "GET" "/api/users" "$ADMIN_TOKEN" 200
fi

# ==================== 第三步: 客户管理权限测试 ====================
echo ""
echo "👥 第三步: 客户管理权限测试"
echo "--------------------------------------"

# 测试4: Admin查看客户列表
if [ -n "$ADMIN_TOKEN" ]; then
    test_api "Admin查看客户列表" "GET" "/api/users" "$ADMIN_TOKEN" 200
fi

# 测试5: Agent查看客户列表 (应该只返回自己的客户)
if [ -n "$AGENT_TOKEN" ]; then
    test_api "Agent查看客户列表 (数据过滤)" "GET" "/api/users" "$AGENT_TOKEN" 200
fi

# 测试6: Customer尝试查看客户列表 (应该被拒绝)
if [ -n "$CUSTOMER_TOKEN" ]; then
    test_api "Customer尝试查看客户列表 (应拒绝)" "GET" "/api/users" "$CUSTOMER_TOKEN" 403
fi

# 测试7: Admin创建客户
if [ -n "$ADMIN_TOKEN" ]; then
    test_api "Admin创建客户" "POST" "/api/users" "$ADMIN_TOKEN" 200 \
        '{"loginAccount":"testuser","loginPassword":"123456","customerName":"测试用户","email":"test@example.com"}'
fi

# 测试8: Agent尝试创建客户 (应该被拒绝)
if [ -n "$AGENT_TOKEN" ]; then
    test_api "Agent尝试创建客户 (应拒绝)" "POST" "/api/users" "$AGENT_TOKEN" 403 \
        '{"loginAccount":"testuser2","loginPassword":"123456","customerName":"测试用户2","email":"test2@example.com"}'
fi

# ==================== 第四步: 订单管理权限测试 ====================
echo ""
echo "📦 第四步: 订单管理权限测试"
echo "--------------------------------------"

# 测试9: Admin查看订单列表
if [ -n "$ADMIN_TOKEN" ]; then
    test_api "Admin查看订单列表" "GET" "/api/orders" "$ADMIN_TOKEN" 200
fi

# 测试10: Agent查看订单列表 (应该只返回自己客户的订单)
if [ -n "$AGENT_TOKEN" ]; then
    test_api "Agent查看订单列表 (数据过滤)" "GET" "/api/orders" "$AGENT_TOKEN" 200
fi

# 测试11: Customer查看订单列表 (应该只返回自己的订单)
if [ -n "$CUSTOMER_TOKEN" ]; then
    test_api "Customer查看订单列表 (数据过滤)" "GET" "/api/orders" "$CUSTOMER_TOKEN" 200
fi

# ==================== 第五步: 反馈管理权限测试 ====================
echo ""
echo "💬 第五步: 反馈管理权限测试"
echo "--------------------------------------"

# 测试12: Admin查看反馈列表
if [ -n "$ADMIN_TOKEN" ]; then
    test_api "Admin查看反馈列表" "GET" "/api/feedbacks" "$ADMIN_TOKEN" 200
fi

# 测试13: Agent查看反馈列表 (应该只返回自己客户的反馈)
if [ -n "$AGENT_TOKEN" ]; then
    test_api "Agent查看反馈列表 (数据过滤)" "GET" "/api/feedbacks" "$AGENT_TOKEN" 200
fi

# 测试14: Customer查看反馈列表 (应该只返回自己的反馈)
if [ -n "$CUSTOMER_TOKEN" ]; then
    test_api "Customer查看反馈列表 (数据过滤)" "GET" "/api/feedbacks" "$CUSTOMER_TOKEN" 200
fi

# ==================== 测试总结 ====================
echo ""
echo "======================================"
echo "📊 测试总结"
echo "======================================"
echo "总测试数: $TOTAL_TESTS"
echo -e "通过: ${GREEN}$PASSED_TESTS${NC}"
echo -e "失败: ${RED}$FAILED_TESTS${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 所有测试通过!${NC}"
    exit 0
else
    echo -e "${RED}⚠️ 有 $FAILED_TESTS 个测试失败${NC}"
    exit 1
fi
