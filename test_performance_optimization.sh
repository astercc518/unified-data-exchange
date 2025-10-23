#!/bin/bash

# 前端性能优化验证脚本
# 用于测试并行请求优化后的API响应速度

echo "========================================"
echo "  前端性能优化验证"
echo "========================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 测试代理结算API
echo -e "${BLUE}📊 测试1: 代理结算列表API${NC}"
echo "URL: http://localhost:3000/api/sms/agent-settlements?page=1&limit=20&settlement_month=2025-10"
curl -o /dev/null -s -w "  响应时间: %{time_total}s\n  HTTP状态: %{http_code}\n" \
  "http://localhost:3000/api/sms/agent-settlements?page=1&limit=20&settlement_month=2025-10"
echo ""

# 测试代理结算统计API
echo -e "${BLUE}📊 测试2: 代理结算统计API${NC}"
echo "URL: http://localhost:3000/api/sms/agent-settlements/overview?settlement_month=2025-10"
curl -o /dev/null -s -w "  响应时间: %{time_total}s\n  HTTP状态: %{http_code}\n" \
  "http://localhost:3000/api/sms/agent-settlements/overview?settlement_month=2025-10"
echo ""

# 测试代理列表API
echo -e "${BLUE}📊 测试3: 代理列表API${NC}"
echo "URL: http://localhost:3000/api/agents?page=1&limit=1000"
curl -o /dev/null -s -w "  响应时间: %{time_total}s\n  HTTP状态: %{http_code}\n" \
  "http://localhost:3000/api/agents?page=1&limit=1000"
echo ""

# 测试通道结算API
echo -e "${BLUE}📊 测试4: 通道结算列表API${NC}"
echo "URL: http://localhost:3000/api/sms/channel-settlements?page=1&limit=20&settlement_month=2025-10"
curl -o /dev/null -s -w "  响应时间: %{time_total}s\n  HTTP状态: %{http_code}\n" \
  "http://localhost:3000/api/sms/channel-settlements?page=1&limit=20&settlement_month=2025-10"
echo ""

# 测试通道结算统计API
echo -e "${BLUE}📊 测试5: 通道结算统计API${NC}"
echo "URL: http://localhost:3000/api/sms/channel-settlements/overview?settlement_month=2025-10"
curl -o /dev/null -s -w "  响应时间: %{time_total}s\n  HTTP状态: %{http_code}\n" \
  "http://localhost:3000/api/sms/channel-settlements/overview?settlement_month=2025-10"
echo ""

# 测试通道列表API
echo -e "${BLUE}📊 测试6: 通道列表API${NC}"
echo "URL: http://localhost:3000/api/channels?page=1&limit=1000"
curl -o /dev/null -s -w "  响应时间: %{time_total}s\n  HTTP状态: %{http_code}\n" \
  "http://localhost:3000/api/channels?page=1&limit=1000"
echo ""

# 测试客户结算API
echo -e "${BLUE}📊 测试7: 客户结算列表API${NC}"
echo "URL: http://localhost:3000/api/sms/settlements?page=1&limit=20"
curl -o /dev/null -s -w "  响应时间: %{time_total}s\n  HTTP状态: %{http_code}\n" \
  "http://localhost:3000/api/sms/settlements?page=1&limit=20"
echo ""

# 测试客户结算统计API
echo -e "${BLUE}📊 测试8: 客户结算统计API${NC}"
echo "URL: http://localhost:3000/api/sms/settlements/overview"
curl -o /dev/null -s -w "  响应时间: %{time_total}s\n  HTTP状态: %{http_code}\n" \
  "http://localhost:3000/api/sms/settlements/overview"
echo ""

# 测试客户列表API
echo -e "${BLUE}📊 测试9: 客户列表API${NC}"
echo "URL: http://localhost:3000/api/users?page=1&limit=1000"
curl -o /dev/null -s -w "  响应时间: %{time_total}s\n  HTTP状态: %{http_code}\n" \
  "http://localhost:3000/api/users?page=1&limit=1000"
echo ""

echo "========================================"
echo -e "${GREEN}✅ 性能测试完成${NC}"
echo "========================================"
echo ""
echo -e "${YELLOW}📝 优化说明：${NC}"
echo "1. 代理结算页面打开时，同时发起3个请求（列表+统计+代理列表）"
echo "2. 通道结算页面打开时，同时发起3个请求（列表+统计+通道列表）"
echo "3. 客户结算页面打开时，同时发起4个请求（列表+统计+客户列表+通道列表）"
echo ""
echo -e "${YELLOW}🚀 性能提升：${NC}"
echo "  优化前（串行）：总耗时 = 所有请求耗时之和"
echo "  优化后（并行）：总耗时 = 最慢的请求耗时"
echo "  预期提速：2-4倍"
echo ""
echo -e "${BLUE}💡 提示：${NC}"
echo "  请在浏览器中打开以下页面，使用开发者工具的Network面板查看实际效果："
echo "  - 代理结算：http://localhost:9527/#/sms/admin/agent-settlement"
echo "  - 通道结算：http://localhost:9527/#/sms/admin/channel-settlement"
echo "  - 客户结算：http://localhost:9527/#/sms/admin/settlements"
echo ""
