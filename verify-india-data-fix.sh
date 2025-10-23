#!/bin/bash

echo "========================================"
echo "🇮🇳 印度数据显示问题修复验证"
echo "========================================"
echo ""

# 测试1：检查后端API
echo "📡 测试1：检查后端API返回"
echo "----------------------------------------"
RESPONSE=$(curl -s "http://localhost:3000/api/data-library/published?country=IN")

if echo "$RESPONSE" | grep -q '"country":"IN"'; then
    echo "✅ 后端API返回印度数据"
    
    # 提取关键字段
    COUNTRY_NAME=$(echo "$RESPONSE" | grep -o '"country_name":"[^"]*"' | cut -d'"' -f4)
    DATA_TYPE=$(echo "$RESPONSE" | grep -o '"data_type":"[^"]*"' | cut -d'"' -f4)
    QUANTITY=$(echo "$RESPONSE" | grep -o '"available_quantity":[0-9]*' | cut -d':' -f2)
    STATUS=$(echo "$RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    PUBLISH_STATUS=$(echo "$RESPONSE" | grep -o '"publish_status":"[^"]*"' | cut -d'"' -f4)
    
    echo "   - 国家名称: $COUNTRY_NAME"
    echo "   - 数据类型: $DATA_TYPE"
    echo "   - 可用数量: $QUANTITY"
    echo "   - 数据状态: $STATUS"
    echo "   - 发布状态: $PUBLISH_STATUS"
    
    # 验证数据是否符合筛选条件
    echo ""
    echo "🔍 验证数据是否符合筛选条件："
    
    if [ "$QUANTITY" -gt 0 ]; then
        echo "   ✅ 可用数量 > 0: $QUANTITY"
    else
        echo "   ❌ 可用数量 <= 0: $QUANTITY"
    fi
    
    if [ "$STATUS" != "sold_out" ]; then
        echo "   ✅ 状态不是sold_out: $STATUS"
    else
        echo "   ❌ 状态是sold_out: $STATUS"
    fi
    
    if [ "$PUBLISH_STATUS" == "published" ]; then
        echo "   ✅ 发布状态是published: $PUBLISH_STATUS"
    else
        echo "   ⚠️  发布状态不是published: $PUBLISH_STATUS"
    fi
else
    echo "❌ 后端API未返回印度数据"
    echo "响应内容:"
    echo "$RESPONSE" | head -c 500
fi

echo ""
echo "----------------------------------------"
echo ""

# 测试2：检查前端修复
echo "📝 测试2：检查前端代码修复"
echo "----------------------------------------"

if grep -q "const filteredDataList = this.applyFilters(dataList)" /home/vue-element-admin/src/views/resource/center.vue; then
    echo "✅ 前端代码已添加筛选逻辑"
    echo "   - 修复文件: /src/views/resource/center.vue"
    echo "   - 修复方法: getPublishedDataFromAPI()"
    echo "   - 修复内容: 在数据转换后调用 applyFilters()"
else
    echo "❌ 前端代码未找到筛选逻辑"
fi

echo ""
echo "----------------------------------------"
echo ""

# 测试3：前端服务状态
echo "🌐 测试3：检查前端服务状态"
echo "----------------------------------------"

if curl -s -o /dev/null -w "%{http_code}" "http://localhost:9528" | grep -q "200\|301\|302"; then
    echo "✅ 前端服务运行正常"
    echo "   - 访问地址: http://localhost:9528"
    echo "   - 资源中心: http://localhost:9528/resource/center"
    echo "   - 测试工具: http://localhost:9528/test-india-data.html"
else
    echo "❌ 前端服务未运行"
    echo "   请运行: npm run dev"
fi

echo ""
echo "----------------------------------------"
echo ""

# 验证总结
echo "📊 验证总结"
echo "----------------------------------------"
echo ""
echo "修复内容："
echo "  1. 在API模式下添加 applyFilters() 调用"
echo "  2. 统一API模式和localStorage模式的处理流程"
echo "  3. 数据处理流程：转换 → 筛选 → 定价 → 折扣"
echo ""
echo "验证步骤："
echo "  1. 打开浏览器访问: http://localhost:9528/resource/center"
echo "  2. 打开浏览器控制台 (F12)"
echo "  3. 查看日志应包含："
echo "     - ✅ 数据库API返回数据: 1 条"
echo "     - 🔍 应用筛选条件..."
echo "     - ✅ 筛选完成，剩余: 1 条"
echo "     - 💰 应用动态定价逻辑..."
echo "     - ✅ 动态定价应用成功"
echo "  4. 在资源中心表格中应该能看到印度数据"
echo ""
echo "如果仍然无法显示，请："
echo "  1. 打开测试工具: http://localhost:9528/test-india-data.html"
echo "  2. 执行所有测试步骤"
echo "  3. 检查具体哪一步出现问题"
echo ""
echo "========================================"
echo "✅ 验证脚本执行完成"
echo "========================================"
