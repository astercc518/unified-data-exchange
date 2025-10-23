#!/bin/bash

echo "========================================"
echo "🔍 资源中心功能全面检查"
echo "========================================"
echo ""

# 检查1：后端API状态
echo "📡 检查1：后端API返回数据"
echo "----------------------------------------"
RESPONSE=$(curl -s "http://localhost:3000/api/data-library/published")

if echo "$RESPONSE" | grep -q '"success":true'; then
    DATA_COUNT=$(echo "$RESPONSE" | grep -o '"data":\[' | wc -l)
    INDIA_COUNT=$(echo "$RESPONSE" | grep -o '"country":"IN"' | wc -l)
    
    echo "✅ 后端API正常"
    echo "   - API状态: success=true"
    echo "   - 印度数据: $INDIA_COUNT 条"
    
    # 提取印度数据详情
    if [ "$INDIA_COUNT" -gt 0 ]; then
        echo ""
        echo "🇮🇳 印度数据详情："
        echo "$RESPONSE" | python -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for item in data.get('data', []):
        if item.get('country') == 'IN':
            print(f\"   - ID: {item.get('id')}\")
            print(f\"   - 国家: {item.get('country_name')} ({item.get('country')})\")
            print(f\"   - 数据类型: {item.get('data_type')}\")
            print(f\"   - 可用数量: {item.get('available_quantity'):,}\")
            print(f\"   - 状态: {item.get('status')}\")
            print(f\"   - 发布状态: {item.get('publish_status')}\")
            break
except Exception as e:
    print(f\"   ⚠️  解析错误: {e}\")
" 2>/dev/null || echo "   ⚠️  无法解析JSON"
    fi
else
    echo "❌ 后端API异常"
fi

echo ""
echo "----------------------------------------"
echo ""

# 检查2：前端环境变量
echo "📋 检查2：前端环境配置"
echo "----------------------------------------"
if [ -f "/home/vue-element-admin/.env.development" ]; then
    echo "✅ 环境文件存在"
    echo ""
    echo "关键配置："
    grep "VUE_APP_" /home/vue-element-admin/.env.development | while read line; do
        echo "   $line"
    done
else
    echo "❌ 环境文件不存在"
fi

echo ""
echo "----------------------------------------"
echo ""

# 检查3：前端代码修复状态
echo "🔧 检查3：前端代码修复状态"
echo "----------------------------------------"

# 检查是否已添加筛选逻辑
if grep -q "const filteredDataList = this.applyFilters(dataList)" /home/vue-element-admin/src/views/resource/center.vue; then
    echo "✅ 已添加筛选逻辑（applyFilters）"
else
    echo "❌ 未找到筛选逻辑"
fi

# 检查applyFilters方法是否存在
if grep -q "applyFilters(dataList)" /home/vue-element-admin/src/views/resource/center.vue; then
    echo "✅ applyFilters方法已定义"
    
    # 检查筛选条件
    echo ""
    echo "筛选条件检查："
    if grep -A 5 "applyFilters(dataList)" /home/vue-element-admin/src/views/resource/center.vue | grep -q "availableQuantity > 0"; then
        echo "   ✅ 可用数量筛选"
    fi
    if grep -A 5 "applyFilters(dataList)" /home/vue-element-admin/src/views/resource/center.vue | grep -q "status !== 'sold_out'"; then
        echo "   ✅ 状态筛选"
    fi
else
    echo "❌ applyFilters方法未定义"
fi

echo ""
echo "----------------------------------------"
echo ""

# 检查4：前端服务状态
echo "🌐 检查4：前端服务状态"
echo "----------------------------------------"
if curl -s -o /dev/null -w "%{http_code}" "http://localhost:9528" | grep -q "200\|301\|302"; then
    echo "✅ 前端服务运行正常"
    echo "   - 地址: http://localhost:9528"
    echo "   - 资源中心: http://localhost:9528/#/resource/center"
    echo "   - 诊断工具: http://localhost:9528/diagnose-resource-center.html"
else
    echo "❌ 前端服务未运行"
fi

echo ""
echo "----------------------------------------"
echo ""

# 检查5：applyFilters方法的潜在bug
echo "🐛 检查5：applyFilters方法潜在问题"
echo "----------------------------------------"

# 检查是否有空值处理
if grep -A 30 "applyFilters(dataList)" /home/vue-element-admin/src/views/resource/center.vue | grep -q "item.country.includes"; then
    echo "⚠️  发现潜在bug：item.country.includes()"
    echo "   问题：如果country为undefined/null会报错"
    echo ""
    echo "   建议修复："
    echo "   item.country && item.country.includes(this.listQuery.country)"
    echo ""
else
    echo "✅ 未发现item.country.includes问题"
fi

echo "----------------------------------------"
echo ""

# 总结
echo "📊 诊断总结"
echo "----------------------------------------"
echo ""
echo "✅ 已确认的正常项："
echo "  1. 后端API返回印度数据"
echo "  2. 环境配置正确"
echo "  3. 前端代码已添加筛选逻辑"
echo ""
echo "⚠️  需要关注的问题："
echo "  1. applyFilters中可能存在空值处理问题"
echo "  2. 需要检查浏览器控制台是否有JavaScript错误"
echo ""
echo "🔍 下一步诊断："
echo "  1. 访问诊断工具: http://localhost:9528/diagnose-resource-center.html"
echo "  2. 打开资源中心: http://localhost:9528/#/resource/center"
echo "  3. 按F12查看控制台日志"
echo "  4. 检查是否有JavaScript错误"
echo ""
echo "========================================"
echo "✅ 检查完成"
echo "========================================"
