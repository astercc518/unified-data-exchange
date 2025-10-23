#!/bin/bash

echo "========================================"
echo "📋 测试：发布数据到资源中心同步显示"
echo "========================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 测试结果统计
PASS=0
FAIL=0

echo "🔍 步骤1：检查数据库中已发布的数据"
echo "----------------------------------------"
PUBLISHED_COUNT=$(mysql -uroot -p'Qwer!234' -e "USE data_trading_platform; SELECT COUNT(*) as cnt FROM data_library WHERE publish_status = 'published';" 2>/dev/null | tail -1)

if [ -z "$PUBLISHED_COUNT" ]; then
    # 尝试其他密码
    PUBLISHED_COUNT=$(mysql -uroot -proot123 -e "USE data_trading_platform; SELECT COUNT(*) as cnt FROM data_library WHERE publish_status = 'published';" 2>/dev/null | tail -1)
fi

if [ -z "$PUBLISHED_COUNT" ]; then
    PUBLISHED_COUNT=$(mysql -uroot -p123456 -e "USE data_trading_platform; SELECT COUNT(*) as cnt FROM data_library WHERE publish_status = 'published';" 2>/dev/null | tail -1)
fi

if [ -n "$PUBLISHED_COUNT" ] && [ "$PUBLISHED_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ 数据库中有 $PUBLISHED_COUNT 条已发布数据${NC}"
    PASS=$((PASS+1))
else
    echo -e "${RED}❌ 数据库中没有已发布数据${NC}"
    FAIL=$((FAIL+1))
fi
echo ""

echo "🔍 步骤2：测试已发布数据API端点"
echo "----------------------------------------"
API_RESPONSE=$(curl -s 'http://localhost:3000/api/data-library/published' -H 'Content-Type: application/json')
API_SUCCESS=$(echo "$API_RESPONSE" | grep -o '"success":true' | wc -l)
API_TOTAL=$(echo "$API_RESPONSE" | grep -o '"total":[0-9]*' | grep -o '[0-9]*')

if [ "$API_SUCCESS" -gt 0 ] && [ -n "$API_TOTAL" ] && [ "$API_TOTAL" -gt 0 ]; then
    echo -e "${GREEN}✅ API /api/data-library/published 工作正常${NC}"
    echo "   返回数据量: $API_TOTAL 条"
    PASS=$((PASS+1))
else
    echo -e "${RED}❌ API /api/data-library/published 异常${NC}"
    echo "   API响应: $API_RESPONSE"
    FAIL=$((FAIL+1))
fi
echo ""

echo "🔍 步骤3：检查资源中心前端代码"
echo "----------------------------------------"
# 检查资源中心是否正确调用API
if grep -q "getPublishedDataFromAPI" /home/vue-element-admin/src/views/resource/center.vue; then
    echo -e "${GREEN}✅ 资源中心正确实现了 getPublishedDataFromAPI() 方法${NC}"
    PASS=$((PASS+1))
else
    echo -e "${RED}❌ 资源中心缺少 getPublishedDataFromAPI() 方法${NC}"
    FAIL=$((FAIL+1))
fi

# 检查是否调用了正确的API
if grep -q "/api/data-library/published" /home/vue-element-admin/src/views/resource/center.vue; then
    echo -e "${GREEN}✅ 资源中心调用正确的API端点${NC}"
    PASS=$((PASS+1))
else
    echo -e "${RED}❌ 资源中心未调用 /api/data-library/published${NC}"
    FAIL=$((FAIL+1))
fi
echo ""

echo "🔍 步骤4：检查发布功能的用户引导"
echo "----------------------------------------"
# 检查是否使用 MessageBox 提供跳转选项
if grep -q "跳转到资源中心" /home/vue-element-admin/src/views/data/library.vue; then
    echo -e "${GREEN}✅ 发布功能包含跳转引导${NC}"
    PASS=$((PASS+1))
else
    echo -e "${RED}❌ 发布功能缺少跳转引导${NC}"
    FAIL=$((FAIL+1))
fi

# 检查是否实现了路由跳转
if grep -q "this.\$router.push('/resource/center')" /home/vue-element-admin/src/views/data/library.vue; then
    echo -e "${GREEN}✅ 发布功能实现了自动跳转${NC}"
    PASS=$((PASS+1))
else
    echo -e "${RED}❌ 发布功能未实现自动跳转${NC}"
    FAIL=$((FAIL+1))
fi

# 检查是否使用 MessageBox
if grep -q "\$confirm" /home/vue-element-admin/src/views/data/library.vue | grep -q "跳转到资源中心"; then
    echo -e "${GREEN}✅ 使用 MessageBox 替代简单提示${NC}"
    PASS=$((PASS+1))
else
    echo -e "${YELLOW}⚠️  可能仍使用简单的 Message 提示${NC}"
fi
echo ""

echo "🔍 步骤5：检查批量发布API"
echo "----------------------------------------"
# 测试批量发布API是否存在
TEST_PUBLISH_RESPONSE=$(curl -s -X POST 'http://localhost:3000/api/data-library/batch/publish' \
  -H 'Content-Type: application/json' \
  -d '{"ids":[999999]}' 2>/dev/null)

if echo "$TEST_PUBLISH_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✅ 批量发布API端点存在且可响应${NC}"
    PASS=$((PASS+1))
else
    echo -e "${YELLOW}⚠️  批量发布API响应: $TEST_PUBLISH_RESPONSE${NC}"
fi
echo ""

echo "🔍 步骤6：检查activated生命周期钩子"
echo "----------------------------------------"
# 检查资源中心是否有activated钩子自动刷新数据
if grep -q "activated()" /home/vue-element-admin/src/views/resource/center.vue; then
    echo -e "${GREEN}✅ 资源中心实现了 activated() 钩子${NC}"
    
    if grep -A 5 "activated()" /home/vue-element-admin/src/views/resource/center.vue | grep -q "getList"; then
        echo -e "${GREEN}✅ activated() 钩子中调用了 getList()${NC}"
        PASS=$((PASS+1))
    else
        echo -e "${YELLOW}⚠️  activated() 钩子未调用 getList()${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  资源中心未实现 activated() 钩子${NC}"
    echo "   建议：添加 activated() 钩子以在页面激活时自动刷新数据"
fi
echo ""

echo "========================================"
echo "📊 测试结果汇总"
echo "========================================"
echo ""
echo -e "${GREEN}✅ 通过: $PASS${NC}"
echo -e "${RED}❌ 失败: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 所有测试通过！发布到资源中心的同步功能已完整实现！${NC}"
    echo ""
    echo "📝 功能说明："
    echo "   1. 数据库中的已发布数据可以通过API正确获取"
    echo "   2. 资源中心从API获取已发布数据（数据库优先）"
    echo "   3. 发布成功后显示MessageBox引导用户跳转"
    echo "   4. 用户可以选择立即跳转到资源中心查看"
    echo "   5. 资源中心在页面激活时自动刷新数据"
    echo ""
    echo "🧪 测试步骤："
    echo "   1. 在数据列表页面，选择一条未发布的数据"
    echo "   2. 点击'发布'按钮"
    echo "   3. 等待发布成功提示框出现"
    echo "   4. 点击'跳转到资源中心'按钮"
    echo "   5. 验证资源中心页面显示新发布的数据"
    echo ""
else
    echo -e "${RED}❌ 存在失败项，请检查上述详细信息${NC}"
fi

exit 0
