#!/bin/bash

# ===================================================================
# 短信结算系统 - API 测试脚本
# 使用方法: bash api_test.sh
# ===================================================================

BASE_URL="http://localhost:3000"
API_PREFIX="/api/sms"

echo "=========================================="
echo "短信结算系统 API 测试"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 测试函数
test_api() {
    local name=$1
    local method=$2
    local url=$3
    local data=$4
    
    echo -e "${YELLOW}测试: ${name}${NC}"
    echo "请求: ${method} ${url}"
    
    if [ -z "$data" ]; then
        response=$(curl -s -X ${method} "${BASE_URL}${url}" -H "Content-Type: application/json")
    else
        echo "数据: ${data}"
        response=$(curl -s -X ${method} "${BASE_URL}${url}" \
            -H "Content-Type: application/json" \
            -d "${data}")
    fi
    
    echo "响应: ${response}"
    
    # 检查是否成功
    if echo "$response" | grep -q '"code":200'; then
        echo -e "${GREEN}✓ 成功${NC}"
    else
        echo -e "${RED}✗ 失败${NC}"
    fi
    
    echo ""
    echo "----------------------------------------"
    echo ""
}

# ===================================================================
# 1. 健康检查
# ===================================================================
echo "1. 健康检查"
echo "=========================================="
test_api "服务健康检查" "GET" "/health"

# ===================================================================
# 2. 通道国家配置 API 测试
# ===================================================================
echo "2. 通道国家配置 API"
echo "=========================================="

# 注意：需要先确保有 channel_id=1 的通道存在
CHANNEL_ID=1

test_api "获取通道国家列表" "GET" "${API_PREFIX}/channels/${CHANNEL_ID}/countries"

test_api "添加国家配置 - 中国" "POST" "${API_PREFIX}/channels/${CHANNEL_ID}/countries" \
'{
  "country": "China",
  "country_code": "86",
  "cost_price": 0.0050,
  "sale_price": 0.0080,
  "max_chars": 70,
  "status": 1
}'

test_api "添加国家配置 - 美国" "POST" "${API_PREFIX}/channels/${CHANNEL_ID}/countries" \
'{
  "country": "United States",
  "country_code": "1",
  "cost_price": 0.0075,
  "sale_price": 0.0100,
  "max_chars": 160,
  "status": 1
}'

test_api "添加国家配置 - 英国" "POST" "${API_PREFIX}/channels/${CHANNEL_ID}/countries" \
'{
  "country": "United Kingdom",
  "country_code": "44",
  "cost_price": 0.0080,
  "sale_price": 0.0120,
  "max_chars": 160,
  "status": 1
}'

test_api "获取价格信息 - 中国" "GET" "${API_PREFIX}/channels/${CHANNEL_ID}/countries/price/86"

test_api "获取价格信息 - 美国" "GET" "${API_PREFIX}/channels/${CHANNEL_ID}/countries/price/1"

# ===================================================================
# 3. 结算管理 API 测试
# ===================================================================
echo "3. 结算管理 API"
echo "=========================================="

test_api "获取结算列表" "GET" "${API_PREFIX}/settlements?page=1&limit=20"

test_api "获取统计概览" "GET" "${API_PREFIX}/settlements/statistics/overview?start_date=2025-10-01&end_date=2025-10-31"

# 手动触发结算（使用昨天的日期）
YESTERDAY=$(date -d "yesterday" +%Y-%m-%d 2>/dev/null || date -v-1d +%Y-%m-%d 2>/dev/null || echo "2025-10-20")

test_api "手动触发结算 - ${YESTERDAY}" "POST" "${API_PREFIX}/settlements/calculate" \
"{
  \"date\": \"${YESTERDAY}\"
}"

test_api "生成业绩报表 - 按日期分组" "GET" "${API_PREFIX}/settlements/reports/generate?start_date=2025-10-01&end_date=2025-10-31&group_by=date"

test_api "生成业绩报表 - 按客户分组" "GET" "${API_PREFIX}/settlements/reports/generate?start_date=2025-10-01&end_date=2025-10-31&group_by=customer"

test_api "生成业绩报表 - 按通道分组" "GET" "${API_PREFIX}/settlements/reports/generate?start_date=2025-10-01&end_date=2025-10-31&group_by=channel"

test_api "生成业绩报表 - 按国家分组" "GET" "${API_PREFIX}/settlements/reports/generate?start_date=2025-10-01&end_date=2025-10-31&group_by=country"

# ===================================================================
# 4. 结算明细测试（需要先有结算记录）
# ===================================================================
echo "4. 结算明细 API"
echo "=========================================="

# 获取第一个结算记录的ID
SETTLEMENT_ID=$(curl -s "${BASE_URL}${API_PREFIX}/settlements?page=1&limit=1" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -z "$SETTLEMENT_ID" ]; then
    echo -e "${YELLOW}⚠ 暂无结算记录，跳过明细测试${NC}"
else
    echo "找到结算记录 ID: ${SETTLEMENT_ID}"
    
    test_api "获取结算详情" "GET" "${API_PREFIX}/settlements/${SETTLEMENT_ID}"
    
    test_api "获取结算明细" "GET" "${API_PREFIX}/settlements/${SETTLEMENT_ID}/details?page=1&limit=20"
fi

# ===================================================================
# 5. 批量操作测试
# ===================================================================
echo "5. 批量操作 API"
echo "=========================================="

# 获取通道国家配置ID列表
COUNTRY_IDS=$(curl -s "${BASE_URL}${API_PREFIX}/channels/${CHANNEL_ID}/countries" | grep -o '"id":[0-9]*' | cut -d':' -f2 | head -2 | tr '\n' ',' | sed 's/,$//')

if [ -z "$COUNTRY_IDS" ]; then
    echo -e "${YELLOW}⚠ 暂无国家配置，跳过批量操作测试${NC}"
else
    echo "找到国家配置 IDs: ${COUNTRY_IDS}"
    
    test_api "批量更新状态 - 启用" "PUT" "${API_PREFIX}/channels/${CHANNEL_ID}/countries/batch/status" \
    "{
      \"ids\": [${COUNTRY_IDS}],
      \"status\": 1
    }"
fi

# ===================================================================
# 测试完成
# ===================================================================
echo "=========================================="
echo -e "${GREEN}所有测试完成！${NC}"
echo "=========================================="
echo ""
echo "提示："
echo "1. 如果部分测试失败，请检查："
echo "   - 后端服务是否正常运行"
echo "   - 数据库是否有对应的数据"
echo "   - API路由是否正确注册"
echo ""
echo "2. 查看详细日志："
echo "   pm2 logs vue-admin-server"
echo ""
echo "3. 查看数据库数据："
echo "   mysql -u vue_admin_user -p'vue_admin_2024' vue_admin"
echo "   SELECT * FROM sms_channel_countries;"
echo "   SELECT * FROM sms_settlements;"
echo ""
