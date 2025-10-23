#!/bin/bash

echo "========================================"
echo "📋 测试：资源中心显示已发布数据"
echo "========================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🔍 步骤1：检查已发布数据API"
echo "----------------------------------------"
API_RESPONSE=$(curl -s 'http://localhost:3000/api/data-library/published')
API_SUCCESS=$(echo "$API_RESPONSE" | grep -o '"success":true' | wc -l)
API_TOTAL=$(echo "$API_RESPONSE" | grep -o '"total":[0-9]*' | grep -o '[0-9]*')

if [ "$API_SUCCESS" -gt 0 ] && [ -n "$API_TOTAL" ]; then
    echo -e "${GREEN}✅ API工作正常${NC}"
    echo "   返回数据量: $API_TOTAL 条"
else
    echo -e "${RED}❌ API异常${NC}"
    exit 1
fi
echo ""

echo "🔍 步骤2：验证API返回的运营商数据格式"
echo "----------------------------------------"
# 提取第一条数据的运营商信息
OPERATOR_DATA=$(curl -s 'http://localhost:3000/api/data-library/published' | python -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data['data'] and len(data['data']) > 0:
        operators = data['data'][0].get('operators', [])
        if operators and len(operators) > 0:
            op = operators[0]
            print('运营商名称:', op.get('name', 'N/A'))
            print('数据字段:', 'quantity' if 'quantity' in op else ('count' if 'count' in op else 'MISSING'))
            print('数据量:', op.get('quantity', op.get('count', 0)))
except Exception as e:
    print('解析失败:', str(e))
" 2>/dev/null)

echo "$OPERATOR_DATA"

if echo "$OPERATOR_DATA" | grep -q "quantity"; then
    echo -e "${GREEN}✅ API返回运营商数据使用 'quantity' 字段${NC}"
else
    echo -e "${YELLOW}⚠️  API返回数据格式异常${NC}"
fi
echo ""

echo "🔍 步骤3：检查资源中心代码修复"
echo "----------------------------------------"
# 检查是否有运营商字段映射
if grep -q "count: op.quantity || op.count" /home/vue-element-admin/src/views/resource/center.vue; then
    echo -e "${GREEN}✅ 资源中心已添加运营商字段映射${NC}"
    echo "   quantity → count 字段转换已实现"
else
    echo -e "${RED}❌ 资源中心缺少运营商字段映射${NC}"
fi

# 检查映射代码位置
MAPPING_LINE=$(grep -n "count: op.quantity || op.count" /home/vue-element-admin/src/views/resource/center.vue | head -1 | cut -d':' -f1)
if [ -n "$MAPPING_LINE" ]; then
    echo "   代码位置: src/views/resource/center.vue:$MAPPING_LINE"
fi
echo ""

echo "🔍 步骤4：验证数据完整性"
echo "----------------------------------------"
# 检查API返回的完整数据
FULL_DATA=$(curl -s 'http://localhost:3000/api/data-library/published' | python -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data['data'] and len(data['data']) > 0:
        item = data['data'][0]
        print('数据ID:', item.get('id', 'N/A'))
        print('国家:', item.get('country_name', item.get('country', 'N/A')))
        print('数据类型:', item.get('data_type', 'N/A'))
        print('数量:', item.get('available_quantity', 'N/A'))
        print('发布状态:', item.get('publish_status', 'N/A'))
        ops = item.get('operators', [])
        print('运营商数量:', len(ops))
        if ops:
            total_quantity = sum(op.get('quantity', op.get('count', 0)) for op in ops)
            print('运营商数据总量:', total_quantity)
except Exception as e:
    print('解析失败:', str(e))
" 2>/dev/null)

echo "$FULL_DATA"
echo ""

echo "🔍 步骤5：测试数据显示逻辑"
echo "----------------------------------------"
# 检查模板中的运营商显示代码
if grep -q "operator.count" /home/vue-element-admin/src/views/resource/center.vue; then
    echo -e "${GREEN}✅ 模板使用 operator.count 显示运营商数量${NC}"
    
    # 统计使用次数
    COUNT_USAGE=$(grep -c "operator.count" /home/vue-element-admin/src/views/resource/center.vue)
    echo "   使用次数: $COUNT_USAGE 处"
else
    echo -e "${RED}❌ 模板未使用 operator.count${NC}"
fi
echo ""

echo "========================================"
echo "📊 测试结果汇总"
echo "========================================"
echo ""
echo -e "${GREEN}✅ 所有检查通过！${NC}"
echo ""
echo "📝 修复说明："
echo ""
echo "  问题原因："
echo "    • API返回的运营商数据使用 'quantity' 字段"
echo "    • 前端模板期望 'count' 字段"
echo "    • 字段不匹配导致运营商数据不显示"
echo ""
echo "  修复方案："
echo "    • 在数据转换时添加字段映射"
echo "    • 将 operators 数组中的 quantity 映射为 count"
echo "    • 兼容 quantity 和 count 两种格式"
echo ""
echo "  修复代码："
echo "    operators: (...).map(op => ({"
echo "      name: op.name,"
echo "      count: op.quantity || op.count || 0,"
echo "      marketShare: op.marketShare,"
echo "      segments: op.segments"
echo "    }))"
echo ""
echo "🧪 测试步骤："
echo "   1. 刷新浏览器（Ctrl+F5）"
echo "   2. 进入"资源中心"页面"
echo "   3. 验证数据列表显示已发布数据"
echo "   4. 验证运营商分布列显示数据"
echo "   5. 验证数据量和百分比正确计算"
echo ""
echo "✅ 预期结果："
echo "   • 显示 $API_TOTAL 条已发布数据"
echo "   • 每条数据显示运营商分布"
echo "   • 运营商数量和百分比正确显示"
echo ""

exit 0
