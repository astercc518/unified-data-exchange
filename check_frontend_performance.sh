#!/bin/bash

# 前端性能验证脚本
# 快速检查前端服务状态和性能

echo "========================================"
echo "  前端性能快速检查"
echo "========================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# 1. 检查前端服务状态
echo -e "${BLUE}1. 检查前端服务状态${NC}"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:9527/ | grep -q "200"; then
    echo -e "   ${GREEN}✅ 前端服务运行正常${NC}"
else
    echo -e "   ${RED}❌ 前端服务异常${NC}"
fi
echo ""

# 2. 检查后端服务状态
echo -e "${BLUE}2. 检查后端服务状态${NC}"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/sms/agent-settlements | grep -q "200"; then
    echo -e "   ${GREEN}✅ 后端服务运行正常${NC}"
else
    echo -e "   ${RED}❌ 后端服务异常${NC}"
fi
echo ""

# 3. 测试前端首页响应速度
echo -e "${BLUE}3. 测试前端首页响应速度${NC}"
RESPONSE_TIME=$(curl -o /dev/null -s -w "%{time_total}" http://localhost:9527/)
echo -e "   响应时间: ${YELLOW}${RESPONSE_TIME}s${NC}"
if (( $(echo "$RESPONSE_TIME < 0.1" | bc -l) )); then
    echo -e "   ${GREEN}✅ 响应速度极快${NC}"
elif (( $(echo "$RESPONSE_TIME < 0.5" | bc -l) )); then
    echo -e "   ${GREEN}✅ 响应速度正常${NC}"
else
    echo -e "   ${YELLOW}⚠️  响应较慢${NC}"
fi
echo ""

# 4. 测试 API 响应速度
echo -e "${BLUE}4. 测试 API 响应速度${NC}"
API_TIME=$(curl -o /dev/null -s -w "%{time_total}" "http://localhost:3000/api/sms/agent-settlements?page=1&limit=20&settlement_month=2025-10")
echo -e "   API响应时间: ${YELLOW}${API_TIME}s${NC}"
if (( $(echo "$API_TIME < 0.1" | bc -l) )); then
    echo -e "   ${GREEN}✅ API响应极快${NC}"
elif (( $(echo "$API_TIME < 0.5" | bc -l) )); then
    echo -e "   ${GREEN}✅ API响应正常${NC}"
else
    echo -e "   ${YELLOW}⚠️  API响应较慢${NC}"
fi
echo ""

# 5. 检查进程状态
echo -e "${BLUE}5. 检查服务进程${NC}"
VUE_PROCESS=$(ps aux | grep "vue-cli-service serve" | grep -v grep | wc -l)
NODE_PROCESS=$(ps aux | grep "node.*backend/server.js" | grep -v grep | wc -l)

echo -e "   前端进程数: ${YELLOW}${VUE_PROCESS}${NC}"
if [ "$VUE_PROCESS" -eq 1 ]; then
    echo -e "   ${GREEN}✅ 前端进程正常${NC}"
elif [ "$VUE_PROCESS" -eq 0 ]; then
    echo -e "   ${RED}❌ 前端进程未运行${NC}"
else
    echo -e "   ${YELLOW}⚠️  前端进程重复（${VUE_PROCESS}个）${NC}"
fi

echo -e "   后端进程数: ${YELLOW}${NODE_PROCESS}${NC}"
if [ "$NODE_PROCESS" -eq 1 ]; then
    echo -e "   ${GREEN}✅ 后端进程正常${NC}"
elif [ "$NODE_PROCESS" -eq 0 ]; then
    echo -e "   ${RED}❌ 后端进程未运行${NC}"
else
    echo -e "   ${YELLOW}⚠️  后端进程重复（${NODE_PROCESS}个）${NC}"
fi
echo ""

# 6. 检查内存使用
echo -e "${BLUE}6. 检查内存使用${NC}"
TOTAL_MEM=$(free -m | awk '/^Mem:/{print $2}')
USED_MEM=$(free -m | awk '/^Mem:/{print $3}')
FREE_MEM=$(free -m | awk '/^Mem:/{print $4}')
MEM_PERCENT=$(echo "scale=1; $USED_MEM * 100 / $TOTAL_MEM" | bc)

echo -e "   总内存: ${YELLOW}${TOTAL_MEM}MB${NC}"
echo -e "   已使用: ${YELLOW}${USED_MEM}MB (${MEM_PERCENT}%)${NC}"
echo -e "   可用: ${YELLOW}${FREE_MEM}MB${NC}"

if (( $(echo "$MEM_PERCENT < 70" | bc -l) )); then
    echo -e "   ${GREEN}✅ 内存充足${NC}"
elif (( $(echo "$MEM_PERCENT < 85" | bc -l) )); then
    echo -e "   ${YELLOW}⚠️  内存使用偏高${NC}"
else
    echo -e "   ${RED}❌ 内存不足${NC}"
fi
echo ""

# 7. 检查缓存目录大小
echo -e "${BLUE}7. 检查缓存目录${NC}"
if [ -d "node_modules/.cache" ]; then
    CACHE_SIZE=$(du -sh node_modules/.cache 2>/dev/null | cut -f1)
    echo -e "   缓存大小: ${YELLOW}${CACHE_SIZE}${NC}"
    echo -e "   ${GREEN}✅ Webpack 缓存已启用${NC}"
else
    echo -e "   ${YELLOW}⚠️  缓存目录不存在（首次运行）${NC}"
fi
echo ""

# 总结
echo "========================================"
echo -e "${GREEN}✅ 性能检查完成${NC}"
echo "========================================"
echo ""

echo -e "${YELLOW}📝 优化建议：${NC}"
echo "1. 使用普通刷新（F5）代替硬刷新（Ctrl+Shift+R）"
echo "2. 保持开发服务器运行，利用热更新"
echo "3. 首次加载较慢是正常现象（Webpack 编译需要时间）"
echo "4. 二次加载应该在 4-6 秒内完成"
echo ""

echo -e "${BLUE}🔗 访问链接：${NC}"
echo "  前端首页: http://localhost:9527/"
echo "  代理结算: http://localhost:9527/#/sms/admin/agent-settlement"
echo "  通道结算: http://localhost:9527/#/sms/admin/channel-settlement"
echo "  客户结算: http://localhost:9527/#/sms/admin/settlements"
echo ""

echo -e "${YELLOW}📚 详细文档：${NC}"
echo "  - 前端页面加载慢问题诊断.md"
echo "  - 前端性能优化说明.md"
echo "  - 性能优化效果对比.md"
echo ""
