#!/bin/bash

echo "========================================"
echo "📋 数据库API调用失败 - 诊断脚本"
echo "========================================"
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "🔍 步骤1：检查后端服务状态"
echo "----------------------------------------"
BACKEND_PROCESS=$(ps aux | grep "node.*server.js" | grep -v grep | wc -l)
if [ "$BACKEND_PROCESS" -gt 0 ]; then
    echo -e "${GREEN}✅ 后端服务正在运行${NC}"
    ps aux | grep "node.*server.js" | grep -v grep | awk '{print "   进程ID: "$2", 内存: "$6"KB"}'
else
    echo -e "${RED}❌ 后端服务未运行${NC}"
    echo ""
    echo "请启动后端服务:"
    echo "   cd /home/vue-element-admin/backend"
    echo "   node server.js &"
    exit 1
fi
echo ""

echo "🔍 步骤2：测试API端点连通性"
echo "----------------------------------------"

# 测试基础API
echo "测试 GET /api/data-library"
API1_RESPONSE=$(curl -s -w "\n%{http_code}" 'http://localhost:3000/api/data-library?page=1&limit=1' 2>/dev/null)
API1_CODE=$(echo "$API1_RESPONSE" | tail -1)
API1_BODY=$(echo "$API1_RESPONSE" | head -n -1)

if [ "$API1_CODE" = "200" ]; then
    echo -e "${GREEN}✅ API响应正常 (HTTP $API1_CODE)${NC}"
    SUCCESS_COUNT=$(echo "$API1_BODY" | grep -o '"success":true' | wc -l)
    if [ "$SUCCESS_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✅ 返回数据格式正确${NC}"
    else
        echo -e "${RED}❌ 返回数据格式错误${NC}"
        echo "响应内容: $API1_BODY" | head -5
    fi
else
    echo -e "${RED}❌ API响应异常 (HTTP $API1_CODE)${NC}"
    echo "响应内容: $API1_BODY" | head -10
fi
echo ""

# 测试已发布数据API
echo "测试 GET /api/data-library/published"
API2_RESPONSE=$(curl -s -w "\n%{http_code}" 'http://localhost:3000/api/data-library/published?page=1&limit=1' 2>/dev/null)
API2_CODE=$(echo "$API2_RESPONSE" | tail -1)
API2_BODY=$(echo "$API2_RESPONSE" | head -n -1)

if [ "$API2_CODE" = "200" ]; then
    echo -e "${GREEN}✅ 已发布数据API响应正常 (HTTP $API2_CODE)${NC}"
else
    echo -e "${RED}❌ 已发布数据API响应异常 (HTTP $API2_CODE)${NC}"
    echo "响应内容: $API2_BODY" | head -10
fi
echo ""

echo "🔍 步骤3：检查数据库连接"
echo "----------------------------------------"
# 尝试连接数据库
DB_TEST=$(mysql -uroot -p'Qwer!234' -e "SELECT 1" 2>&1)
if echo "$DB_TEST" | grep -q "ERROR"; then
    echo -e "${RED}❌ 数据库连接失败${NC}"
    echo "错误信息: $DB_TEST"
    
    # 尝试其他密码
    DB_TEST2=$(mysql -uroot -proot123 -e "SELECT 1" 2>&1)
    if echo "$DB_TEST2" | grep -q "ERROR"; then
        echo -e "${RED}❌ 数据库密码错误${NC}"
    else
        echo -e "${YELLOW}⚠️  数据库密码是 root123${NC}"
    fi
else
    echo -e "${GREEN}✅ 数据库连接正常${NC}"
    
    # 检查数据库中的数据
    DATA_COUNT=$(mysql -uroot -p'Qwer!234' -e "USE data_trading_platform; SELECT COUNT(*) FROM data_library;" 2>/dev/null | tail -1)
    echo "   数据库中总数据量: $DATA_COUNT 条"
fi
echo ""

echo "🔍 步骤4：检查CORS和端口"
echo "----------------------------------------"
# 检查端口占用
PORT_3000=$(netstat -tuln 2>/dev/null | grep ":3000" | wc -l)
if [ "$PORT_3000" -gt 0 ]; then
    echo -e "${GREEN}✅ 端口3000正在监听${NC}"
    netstat -tuln | grep ":3000"
else
    echo -e "${RED}❌ 端口3000未监听${NC}"
fi
echo ""

echo "🔍 步骤5：检查前端配置"
echo "----------------------------------------"
# 检查.env文件
if [ -f /home/vue-element-admin/.env.development ]; then
    echo "检查 .env.development 配置:"
    grep "VUE_APP_API_URL" /home/vue-element-admin/.env.development || echo "   未设置 VUE_APP_API_URL"
    grep "VUE_APP_BASE_API" /home/vue-element-admin/.env.development || echo "   未设置 VUE_APP_BASE_API"
else
    echo -e "${YELLOW}⚠️  未找到 .env.development 文件${NC}"
fi
echo ""

echo "🔍 步骤6：检查后端路由配置"
echo "----------------------------------------"
# 检查路由文件
if [ -f /home/vue-element-admin/backend/routes/dataLibrary.js ]; then
    echo -e "${GREEN}✅ 路由文件存在${NC}"
    
    # 检查关键路由
    if grep -q "router.get.*published" /home/vue-element-admin/backend/routes/dataLibrary.js; then
        echo -e "${GREEN}✅ 已发布数据路由已配置${NC}"
    else
        echo -e "${RED}❌ 缺少已发布数据路由${NC}"
    fi
    
    if grep -q "router.post.*batch/publish" /home/vue-element-admin/backend/routes/dataLibrary.js; then
        echo -e "${GREEN}✅ 批量发布路由已配置${NC}"
    else
        echo -e "${RED}❌ 缺少批量发布路由${NC}"
    fi
else
    echo -e "${RED}❌ 路由文件不存在${NC}"
fi
echo ""

echo "🔍 步骤7：检查常见错误"
echo "----------------------------------------"

# 检查是否有Token认证问题
echo "测试无Token的API调用:"
NO_TOKEN_RESPONSE=$(curl -s 'http://localhost:3000/api/data-library?page=1&limit=1' 2>/dev/null)
if echo "$NO_TOKEN_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✅ API不需要Token认证${NC}"
else
    echo -e "${YELLOW}⚠️  API可能需要Token认证${NC}"
    echo "响应: $NO_TOKEN_RESPONSE" | head -5
fi
echo ""

echo "========================================"
echo "📊 诊断总结"
echo "========================================"
echo ""

# 统计问题
ISSUES=0

if [ "$BACKEND_PROCESS" -eq 0 ]; then
    echo -e "${RED}1. 后端服务未运行${NC}"
    ISSUES=$((ISSUES+1))
fi

if [ "$API1_CODE" != "200" ]; then
    echo -e "${RED}2. 基础API调用失败 (HTTP $API1_CODE)${NC}"
    ISSUES=$((ISSUES+1))
fi

if [ "$API2_CODE" != "200" ]; then
    echo -e "${RED}3. 已发布数据API调用失败 (HTTP $API2_CODE)${NC}"
    ISSUES=$((ISSUES+1))
fi

if echo "$DB_TEST" | grep -q "ERROR"; then
    echo -e "${RED}4. 数据库连接失败${NC}"
    ISSUES=$((ISSUES+1))
fi

if [ "$ISSUES" -eq 0 ]; then
    echo -e "${GREEN}🎉 未发现明显问题！${NC}"
    echo ""
    echo "如果前端仍然报错，请检查:"
    echo "   1. 浏览器控制台（F12）的Network标签，查看具体的API请求"
    echo "   2. 浏览器控制台的Console标签，查看错误日志"
    echo "   3. 检查是否有CORS跨域问题"
    echo "   4. 检查Token是否过期（重新登录）"
    echo ""
    echo "建议操作:"
    echo "   1. 强制刷新浏览器: Ctrl+F5"
    echo "   2. 清除localStorage: 打开Console，输入 localStorage.clear()"
    echo "   3. 重新登录系统"
else
    echo -e "${RED}发现 $ISSUES 个问题，请根据上述提示解决${NC}"
fi

echo ""
echo "📝 详细日志位置:"
echo "   后端日志: /home/vue-element-admin/backend/logs/"
echo "   浏览器控制台: F12 → Console / Network"
echo ""

exit 0
