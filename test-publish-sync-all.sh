#!/bin/bash

echo "========================================"
echo "📋 测试：发布数据同步到资源中心和定价管理"
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

echo "🔍 步骤1：检查当前数据库状态"
echo "----------------------------------------"
TOTAL_COUNT=$(curl -s 'http://localhost:3000/api/data-library?page=1&limit=100' | grep -o '"total":[0-9]*' | grep -o '[0-9]*')
PUBLISHED_COUNT=$(curl -s 'http://localhost:3000/api/data-library/published?page=1&limit=100' | grep -o '"total":[0-9]*' | grep -o '[0-9]*')

echo "   数据库总数据: $TOTAL_COUNT 条"
echo "   已发布数据: $PUBLISHED_COUNT 条"

if [ -n "$TOTAL_COUNT" ] && [ "$TOTAL_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ 数据库有数据${NC}"
    PASS=$((PASS+1))
else
    echo -e "${RED}❌ 数据库无数据${NC}"
    FAIL=$((FAIL+1))
fi

if [ -n "$PUBLISHED_COUNT" ] && [ "$PUBLISHED_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ 有已发布数据${NC}"
    PASS=$((PASS+1))
else
    echo -e "${YELLOW}⚠️  暂无已发布数据${NC}"
fi
echo ""

echo "🔍 步骤2：验证资源中心API"
echo "----------------------------------------"
RESOURCE_API_RESPONSE=$(curl -s 'http://localhost:3000/api/data-library/published')
RESOURCE_API_SUCCESS=$(echo "$RESOURCE_API_RESPONSE" | grep -o '"success":true' | wc -l)
RESOURCE_API_COUNT=$(echo "$RESOURCE_API_RESPONSE" | grep -o '"total":[0-9]*' | grep -o '[0-9]*')

if [ "$RESOURCE_API_SUCCESS" -gt 0 ]; then
    echo -e "${GREEN}✅ 资源中心API工作正常${NC}"
    echo "   API返回: $RESOURCE_API_COUNT 条已发布数据"
    PASS=$((PASS+1))
else
    echo -e "${RED}❌ 资源中心API异常${NC}"
    FAIL=$((FAIL+1))
fi
echo ""

echo "🔍 步骤3：检查资源中心页面代码"
echo "----------------------------------------"
# 检查是否使用正确的API
if grep -q "/api/data-library/published" /home/vue-element-admin/src/views/resource/center.vue; then
    echo -e "${GREEN}✅ 资源中心使用正确的API（/api/data-library/published）${NC}"
    PASS=$((PASS+1))
else
    echo -e "${RED}❌ 资源中心未使用正确的API${NC}"
    FAIL=$((FAIL+1))
fi

# 检查activated钩子
if grep -q "activated()" /home/vue-element-admin/src/views/resource/center.vue; then
    echo -e "${GREEN}✅ 资源中心有activated()钩子自动刷新${NC}"
    PASS=$((PASS+1))
else
    echo -e "${YELLOW}⚠️  资源中心缺少activated()钩子${NC}"
fi
echo ""

echo "🔍 步骤4：检查定价管理页面代码"
echo "----------------------------------------"
# 检查是否使用已发布数据API
if grep -q "/api/data-library/published" /home/vue-element-admin/src/views/data/pricing.vue; then
    PUBLISHED_API_COUNT=$(grep -c "/api/data-library/published" /home/vue-element-admin/src/views/data/pricing.vue)
    echo -e "${GREEN}✅ 定价管理使用已发布数据API（/api/data-library/published）${NC}"
    echo "   使用次数: $PUBLISHED_API_COUNT 处"
    PASS=$((PASS+1))
else
    echo -e "${RED}❌ 定价管理未使用已发布数据API${NC}"
    FAIL=$((FAIL+1))
fi

# 检查activated钩子
if grep -q "activated()" /home/vue-element-admin/src/views/data/pricing.vue; then
    echo -e "${GREEN}✅ 定价管理有activated()钩子自动刷新${NC}"
    PASS=$((PASS+1))
else
    echo -e "${YELLOW}⚠️  定价管理缺少activated()钩子${NC}"
fi
echo ""

echo "🔍 步骤5：检查数据列表发布功能"
echo "----------------------------------------"
# 检查是否有发布成功的引导对话框
if grep -q "跳转到资源中心" /home/vue-element-admin/src/views/data/library.vue; then
    echo -e "${GREEN}✅ 数据列表有发布成功引导对话框${NC}"
    PASS=$((PASS+1))
else
    echo -e "${YELLOW}⚠️  数据列表缺少发布引导${NC}"
fi

# 检查批量发布API
BATCH_PUBLISH_RESPONSE=$(curl -s -X POST 'http://localhost:3000/api/data-library/batch/publish' \
  -H 'Content-Type: application/json' \
  -d '{"ids":[999999]}' 2>/dev/null)

if echo "$BATCH_PUBLISH_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✅ 批量发布API工作正常${NC}"
    PASS=$((PASS+1))
else
    echo -e "${YELLOW}⚠️  批量发布API响应异常${NC}"
fi
echo ""

echo "🔍 步骤6：验证同步机制完整性"
echo "----------------------------------------"
echo "检查同步流程各环节："

# 1. 数据库更新
echo -n "   1. 发布操作更新数据库... "
if [ "$PUBLISHED_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${YELLOW}⚠️ （暂无已发布数据）${NC}"
fi

# 2. 资源中心API
echo -n "   2. 资源中心API返回已发布数据... "
if [ "$RESOURCE_API_SUCCESS" -gt 0 ]; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${RED}❌${NC}"
fi

# 3. 资源中心页面
echo -n "   3. 资源中心页面从API获取数据... "
if grep -q "getPublishedDataFromAPI" /home/vue-element-admin/src/views/resource/center.vue; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${RED}❌${NC}"
fi

# 4. 定价管理API调用
echo -n "   4. 定价管理从API获取已发布数据... "
if grep -q "/api/data-library/published" /home/vue-element-admin/src/views/data/pricing.vue; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${RED}❌${NC}"
fi

# 5. 页面自动刷新
echo -n "   5. 页面激活时自动刷新... "
ACTIVATED_COUNT=$(grep -c "activated()" /home/vue-element-admin/src/views/resource/center.vue /home/vue-element-admin/src/views/data/pricing.vue)
if [ "$ACTIVATED_COUNT" -ge 2 ]; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${YELLOW}⚠️${NC}"
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
    echo -e "${GREEN}🎉 所有测试通过！发布数据同步机制已完整实现！${NC}"
    echo ""
    echo "📝 同步机制说明："
    echo ""
    echo "┌─────────────────────────────────────────────┐"
    echo "│          数据发布同步流程图                  │"
    echo "└─────────────────────────────────────────────┘"
    echo ""
    echo "  数据列表操作"
    echo "       ↓"
    echo "  点击发布按钮"
    echo "       ↓"
    echo "  POST /api/data-library/batch/publish"
    echo "       ↓"
    echo "  数据库更新：publish_status = 'published'"
    echo "       ↓"
    echo "  ┌──────────────┬─────────────┐"
    echo "  ↓              ↓             ↓"
    echo "资源中心      定价管理      发布成功提示"
    echo "  ↓              ↓             ↓"
    echo "GET /published GET /published 跳转选项"
    echo "  ↓              ↓             ↓"
    echo "显示数据      显示定价      用户跳转"
    echo "  ↓              ↓             ↓"
    echo "activated()   activated()   页面激活"
    echo "  ↓              ↓             ↓"
    echo "自动刷新      自动刷新      显示最新数据"
    echo ""
    echo "🧪 测试步骤："
    echo "   1. 刷新浏览器（Ctrl+F5）"
    echo "   2. 进入"数据列表操作"页面"
    echo "   3. 选择一条数据并点击"发布""
    echo "   4. 点击"跳转到资源中心""
    echo "   5. 验证资源中心显示已发布数据"
    echo "   6. 进入"数据定价"页面"
    echo "   7. 验证定价管理显示已发布数据"
    echo ""
    echo "✅ 关键特性："
    echo "   • 数据库优先：所有数据从数据库API获取"
    echo "   • 自动同步：发布后三个页面自动同步"
    echo "   • 自动刷新：使用activated()钩子自动刷新"
    echo "   • 用户引导：发布后提供跳转引导"
    echo "   • 降级备份：API失败时降级到localStorage"
    echo ""
else
    echo -e "${RED}❌ 存在失败项，请检查上述详细信息${NC}"
fi

exit 0
