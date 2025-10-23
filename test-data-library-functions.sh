#!/bin/bash

# 数据列表功能全面测试脚本
# 测试所有API端点和功能

API_URL="http://localhost:3000"
TOKEN="admin-token"

echo "=========================================="
echo "数据库管理功能全面测试"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试结果统计
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 测试函数
test_api() {
    local test_name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local expected_status=${5:-200}
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo "----------------------------------------"
    echo "测试 $TOTAL_TESTS: $test_name"
    echo "方法: $method"
    echo "端点: $endpoint"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -H "X-Token: $TOKEN" "$API_URL$endpoint")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST -H "X-Token: $TOKEN" -H "Content-Type: application/json" -d "$data" "$API_URL$endpoint")
    elif [ "$method" = "DELETE" ]; then
        response=$(curl -s -w "\n%{http_code}" -X DELETE -H "X-Token: $TOKEN" "$API_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    echo "HTTP状态码: $http_code"
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ 通过${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        
        # 解析JSON并显示关键信息
        if command -v python &> /dev/null; then
            echo "响应数据:"
            echo "$body" | python -m json.tool 2>/dev/null | head -20
        fi
    else
        echo -e "${RED}❌ 失败 (期望: $expected_status, 实际: $http_code)${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo "响应内容:"
        echo "$body"
    fi
    echo ""
}

# 测试数据库连接
echo "=========================================="
echo "1. 基础连接测试"
echo "=========================================="
echo ""

# 检查后端服务
if curl -s "$API_URL/api/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 后端服务运行正常${NC}"
else
    echo -e "${RED}❌ 后端服务未运行${NC}"
    echo "请先启动后端服务: cd backend && node server.js"
    exit 1
fi

# 检查数据库连接
echo ""
echo "检查数据库连接..."
mysql -u root vue_admin -e "SELECT 1" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 数据库连接正常${NC}"
    
    # 显示当前数据
    echo ""
    echo "当前数据库数据:"
    mysql -u root vue_admin -e "SELECT id, country, data_type, publish_status, status, available_quantity FROM data_library ORDER BY id DESC LIMIT 5;"
else
    echo -e "${RED}❌ 数据库连接失败${NC}"
fi

echo ""
echo "=========================================="
echo "2. 数据列表功能测试"
echo "=========================================="
echo ""

# 测试1: 获取所有数据列表
test_api "获取数据列表（所有数据）" "GET" "/api/data-library?page=1&limit=10"

# 测试2: 获取已发布数据
test_api "获取已发布数据" "GET" "/api/data-library/published?page=1&limit=10"

# 测试3: 按国家筛选
test_api "按国家筛选（印度）" "GET" "/api/data-library?country=IN&page=1&limit=10"

# 测试4: 按时效筛选
test_api "按时效筛选（3天内）" "GET" "/api/data-library?validity=3&page=1&limit=10"

# 测试5: 分页测试
test_api "分页测试（第1页）" "GET" "/api/data-library?page=1&limit=5"

echo ""
echo "=========================================="
echo "3. 数据操作功能测试"
echo "=========================================="
echo ""

# 测试6: 创建新数据
new_data='{
  "country": "BD",
  "country_name": "孟加拉国",
  "data_type": "手机号码",
  "validity": "3",
  "validity_name": "3天内",
  "source": "功能测试",
  "available_quantity": 5000,
  "total_quantity": 5000,
  "sell_price": 0.05,
  "cost_price": 0.03,
  "operators": [{"name": "测试运营商", "quantity": 5000}],
  "upload_by": "admin"
}'

echo "测试数据创建..."
create_response=$(curl -s -X POST -H "X-Token: $TOKEN" -H "Content-Type: application/json" -d "$new_data" "$API_URL/api/data-library")
create_id=$(echo "$create_response" | python -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('id', ''))" 2>/dev/null)

if [ -n "$create_id" ]; then
    echo -e "${GREEN}✅ 数据创建成功，ID: $create_id${NC}"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    PASSED_TESTS=$((PASSED_TESTS + 1))
    
    # 测试7: 发布数据
    echo ""
    test_api "发布新创建的数据" "POST" "/api/data-library/$create_id/publish"
    
    # 测试8: 批量发布
    echo ""
    test_api "批量发布数据" "POST" "/api/data-library/batch/publish" "{\"ids\": [$create_id]}"
    
    # 测试9: 删除数据
    echo ""
    test_api "删除测试数据" "DELETE" "/api/data-library/$create_id"
else
    echo -e "${RED}❌ 数据创建失败${NC}"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

echo ""
echo "=========================================="
echo "4. 统计功能测试"
echo "=========================================="
echo ""

# 测试10: 获取统计数据
test_api "获取数据统计" "GET" "/api/stats/data-library"

echo ""
echo "=========================================="
echo "5. 前端功能检查"
echo "=========================================="
echo ""

# 检查前端文件
frontend_file="/home/vue-element-admin/src/views/data/library.vue"
if [ -f "$frontend_file" ]; then
    echo -e "${GREEN}✅ 前端页面文件存在${NC}"
    
    # 检查关键方法
    echo ""
    echo "检查关键方法实现:"
    
    if grep -q "async getList()" "$frontend_file"; then
        echo -e "${GREEN}✅ getList() 方法已实现${NC}"
    else
        echo -e "${RED}❌ getList() 方法未找到${NC}"
    fi
    
    if grep -q "async publishData" "$frontend_file"; then
        echo -e "${GREEN}✅ publishData() 方法已实现${NC}"
    else
        echo -e "${RED}❌ publishData() 方法未找到${NC}"
    fi
    
    if grep -q "async deleteData" "$frontend_file"; then
        echo -e "${GREEN}✅ deleteData() 方法已实现${NC}"
    else
        echo -e "${RED}❌ deleteData() 方法未找到${NC}"
    fi
    
    if grep -q "async getStatistics" "$frontend_file"; then
        echo -e "${GREEN}✅ getStatistics() 方法已实现${NC}"
    else
        echo -e "${RED}❌ getStatistics() 方法未找到${NC}"
    fi
    
    # 检查API调用
    echo ""
    echo "检查API调用:"
    
    if grep -q "/api/data-library" "$frontend_file"; then
        echo -e "${GREEN}✅ 数据库API调用已配置${NC}"
    else
        echo -e "${YELLOW}⚠️  未找到数据库API调用${NC}"
    fi
    
else
    echo -e "${RED}❌ 前端页面文件不存在${NC}"
fi

echo ""
echo "=========================================="
echo "6. 路由配置检查"
echo "=========================================="
echo ""

# 检查后端路由
routes_file="/home/vue-element-admin/backend/routes/data.js"
if [ -f "$routes_file" ]; then
    echo -e "${GREEN}✅ 后端路由文件存在${NC}"
    
    echo ""
    echo "检查路由定义顺序:"
    
    # 检查关键路由
    if grep -q "router.get('/published'" "$routes_file"; then
        echo -e "${GREEN}✅ /published 路由已定义${NC}"
    else
        echo -e "${RED}❌ /published 路由未找到${NC}"
    fi
    
    if grep -q "router.post('/batch/publish'" "$routes_file"; then
        echo -e "${GREEN}✅ /batch/publish 路由已定义${NC}"
    else
        echo -e "${RED}❌ /batch/publish 路由未找到${NC}"
    fi
    
    if grep -q "router.post('/:id/publish'" "$routes_file"; then
        echo -e "${GREEN}✅ /:id/publish 路由已定义${NC}"
    else
        echo -e "${RED}❌ /:id/publish 路由未找到${NC}"
    fi
    
    # 检查路由顺序（批量发布必须在单条发布之前）
    batch_line=$(grep -n "router.post('/batch/publish'" "$routes_file" | cut -d: -f1)
    single_line=$(grep -n "router.post('/:id/publish'" "$routes_file" | cut -d: -f1)
    
    if [ -n "$batch_line" ] && [ -n "$single_line" ]; then
        if [ "$batch_line" -lt "$single_line" ]; then
            echo -e "${GREEN}✅ 路由顺序正确 (/batch/publish 在 /:id/publish 之前)${NC}"
        else
            echo -e "${RED}❌ 路由顺序错误 (/batch/publish 应该在 /:id/publish 之前)${NC}"
        fi
    fi
else
    echo -e "${RED}❌ 后端路由文件不存在${NC}"
fi

echo ""
echo "=========================================="
echo "7. 数据库表结构检查"
echo "=========================================="
echo ""

echo "检查数据库表结构..."
mysql -u root vue_admin -e "DESCRIBE data_library;" 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 数据库表结构正常${NC}"
else
    echo -e "${RED}❌ 数据库表结构检查失败${NC}"
fi

echo ""
echo "检查索引..."
mysql -u root vue_admin -e "SHOW INDEX FROM data_library;" 2>/dev/null

echo ""
echo "=========================================="
echo "测试总结"
echo "=========================================="
echo ""
echo "总测试数: $TOTAL_TESTS"
echo -e "${GREEN}通过: $PASSED_TESTS${NC}"
echo -e "${RED}失败: $FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo ""
    echo -e "${GREEN}=========================================="
    echo "🎉 所有测试通过！"
    echo "==========================================${NC}"
    exit 0
else
    echo ""
    echo -e "${YELLOW}=========================================="
    echo "⚠️  部分测试失败，请检查上述错误信息"
    echo "==========================================${NC}"
    exit 1
fi
