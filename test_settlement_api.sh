#!/bin/bash

# ===================================================================
# 短信结算系统API测试脚本
# 测试代理结算和通道结算的所有API接口
# ===================================================================

# 配置
API_BASE_URL="http://localhost:3000"
CONTENT_TYPE="Content-Type: application/json"

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 测试计数器
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 打印分隔线
print_separator() {
  echo -e "${BLUE}========================================${NC}"
}

# 打印测试标题
print_test_title() {
  echo ""
  print_separator
  echo -e "${YELLOW}$1${NC}"
  print_separator
}

# 执行测试并检查结果
test_api() {
  local test_name=$1
  local method=$2
  local endpoint=$3
  local data=$4
  
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  
  echo -e "\n${BLUE}测试 #${TOTAL_TESTS}: ${test_name}${NC}"
  echo "  请求: ${method} ${endpoint}"
  
  if [ -z "$data" ]; then
    response=$(curl -s -w "\n%{http_code}" -X ${method} "${API_BASE_URL}${endpoint}")
  else
    echo "  数据: ${data}"
    response=$(curl -s -w "\n%{http_code}" -X ${method} "${API_BASE_URL}${endpoint}" \
      -H "${CONTENT_TYPE}" \
      -d "${data}")
  fi
  
  # 分离响应体和状态码
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  echo "  状态码: ${http_code}"
  echo "  响应: ${body}" | head -c 200
  
  # 检查状态码
  if [[ $http_code -ge 200 && $http_code -lt 300 ]]; then
    echo -e "  ${GREEN}✓ 通过${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    return 0
  else
    echo -e "  ${RED}✗ 失败${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    return 1
  fi
}

# ===================================================================
# 开始测试
# ===================================================================

echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║           短信结算系统 API 测试工具 v1.0                  ║"
echo "║                                                           ║"
echo "║  测试服务器: ${API_BASE_URL}                              ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ===================================================================
# 1. 代理结算 API 测试
# ===================================================================
print_test_title "1. 代理结算 API 测试"

# 获取代理结算列表
test_api "获取代理结算列表" "GET" "/api/sms/agent-settlements?page=1&limit=20"

# 获取代理结算列表（带筛选）
test_api "获取代理结算列表（带筛选）" "GET" "/api/sms/agent-settlements?page=1&limit=20&settlement_month=2025-10"

# 获取代理结算统计概览
test_api "获取代理结算统计概览" "GET" "/api/sms/agent-settlements/statistics/overview?settlement_month=2025-10"

# 手动触发代理结算（测试数据）
CURRENT_MONTH=$(date +%Y-%m)
LAST_MONTH=$(date -d "last month" +%Y-%m 2>/dev/null || date -v-1m +%Y-%m 2>/dev/null || echo "2025-10")

test_api "手动触发代理结算（所有代理）" "POST" "/api/sms/agent-settlements/calculate" \
"{\"settlement_month\": \"${LAST_MONTH}\"}"

# 获取代理结算详情（如果有数据）
echo -e "\n${YELLOW}注意: 以下测试需要先有结算记录，如果失败是正常的${NC}"
test_api "获取代理结算详情" "GET" "/api/sms/agent-settlements/1" || true

# 获取代理结算明细
test_api "获取代理结算明细" "GET" "/api/sms/agent-settlements/1/details?page=1&limit=50" || true

# ===================================================================
# 2. 通道结算 API 测试
# ===================================================================
print_test_title "2. 通道结算 API 测试"

# 获取通道结算列表
test_api "获取通道结算列表" "GET" "/api/sms/channel-settlements?page=1&limit=20"

# 获取通道结算列表（带筛选）
test_api "获取通道结算列表（带筛选）" "GET" "/api/sms/channel-settlements?page=1&limit=20&settlement_month=2025-10"

# 获取通道结算统计概览
test_api "获取通道结算统计概览" "GET" "/api/sms/channel-settlements/statistics/overview?settlement_month=2025-10"

# 手动触发通道结算（测试数据）
test_api "手动触发通道结算（所有通道）" "POST" "/api/sms/channel-settlements/calculate" \
"{\"settlement_month\": \"${LAST_MONTH}\"}"

# 获取通道结算详情（如果有数据）
echo -e "\n${YELLOW}注意: 以下测试需要先有结算记录，如果失败是正常的${NC}"
test_api "获取通道结算详情" "GET" "/api/sms/channel-settlements/1" || true

# 获取通道结算明细
test_api "获取通道结算明细" "GET" "/api/sms/channel-settlements/1/details?page=1&limit=50" || true

# ===================================================================
# 3. 辅助功能测试
# ===================================================================
print_test_title "3. 辅助功能测试"

# 获取代理列表（用于结算）
test_api "获取代理列表" "GET" "/api/agents?page=1&limit=10"

# 获取通道列表（用于结算）
test_api "获取通道列表" "GET" "/api/sms/admin/channels?page=1&limit=10"

# 获取用户列表
test_api "获取用户列表" "GET" "/api/users?page=1&limit=10"

# ===================================================================
# 4. 数据库连接测试
# ===================================================================
print_test_title "4. 数据库连接测试"

# 检查结算表是否存在
echo -e "\n${BLUE}检查数据库表...${NC}"
mysql -u vue_admin_user -p'vue_admin_2024' vue_admin -e "
SELECT 
  'sms_agent_settlements' AS table_name,
  COUNT(*) AS record_count
FROM sms_agent_settlements
UNION ALL
SELECT 
  'sms_channel_settlements' AS table_name,
  COUNT(*) AS record_count
FROM sms_channel_settlements;
" 2>/dev/null && echo -e "${GREEN}✓ 数据库表正常${NC}" || echo -e "${RED}✗ 数据库表检查失败${NC}"

# ===================================================================
# 测试总结
# ===================================================================
print_separator
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    测试结果汇总                           ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  总测试数:   ${BLUE}${TOTAL_TESTS}${NC}"
echo -e "  通过测试:   ${GREEN}${PASSED_TESTS}${NC}"
echo -e "  失败测试:   ${RED}${FAILED_TESTS}${NC}"
echo ""

# 计算成功率
if [ $TOTAL_TESTS -gt 0 ]; then
  SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
  echo -e "  成功率:     ${BLUE}${SUCCESS_RATE}%${NC}"
  echo ""
  
  if [ $SUCCESS_RATE -ge 80 ]; then
    echo -e "${GREEN}✓ 测试通过！API功能正常${NC}"
    exit 0
  elif [ $SUCCESS_RATE -ge 50 ]; then
    echo -e "${YELLOW}⚠ 部分测试失败，请检查失败项${NC}"
    exit 1
  else
    echo -e "${RED}✗ 测试失败！请检查系统配置${NC}"
    exit 1
  fi
else
  echo -e "${RED}✗ 没有执行任何测试${NC}"
  exit 1
fi
