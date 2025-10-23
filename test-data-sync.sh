#!/bin/bash

echo "========================================="
echo "📊 数据同步诊断脚本"
echo "========================================="
echo ""

# 设置API URL
API_URL="http://localhost:3000"

echo "1️⃣ 检查后端服务状态..."
echo "-----------------------------------"
if curl -s -f "$API_URL/api/health" > /dev/null 2>&1; then
    echo "✅ 后端服务运行正常"
else
    echo "❌ 后端服务未运行或不可访问"
    echo "   请先启动后端服务: cd /path/to/backend && npm start"
    exit 1
fi
echo ""

echo "2️⃣ 查询数据库中的所有数据..."
echo "-----------------------------------"
ALL_DATA=$(curl -s "$API_URL/api/data-library?page=1&limit=100")
TOTAL_COUNT=$(echo "$ALL_DATA" | jq -r '.total // 0')
echo "总数据量: $TOTAL_COUNT 条"
echo ""

echo "3️⃣ 查询数据库中已发布的数据..."
echo "-----------------------------------"
PUBLISHED_DATA=$(curl -s "$API_URL/api/data-library/published?page=1&limit=100")
PUBLISHED_COUNT=$(echo "$PUBLISHED_DATA" | jq -r '.total // 0')
echo "已发布数据量: $PUBLISHED_COUNT 条"
echo ""

if [ "$PUBLISHED_COUNT" -gt 0 ]; then
    echo "📋 已发布数据详情:"
    echo "$PUBLISHED_DATA" | jq -r '.data[] | "  - ID: \(.id) | 国家: \(.country) | 有效期: \(.validity)天 | 数量: \(.available_quantity) | 状态: \(.publish_status)"'
    echo ""
    
    echo "4️⃣ 验证运营商数据格式..."
    echo "-----------------------------------"
    echo "$PUBLISHED_DATA" | jq -r '.data[0] | if .operators then "✅ 运营商数据存在" else "❌ 运营商数据缺失" end'
    
    # 检查运营商字段格式
    OPERATORS_FIELD=$(echo "$PUBLISHED_DATA" | jq -r '.data[0].operators')
    if echo "$OPERATORS_FIELD" | jq -e 'type == "array"' > /dev/null 2>&1; then
        echo "✅ 运营商数据是数组格式"
        # 检查字段名
        FIRST_OP=$(echo "$OPERATORS_FIELD" | jq -r '.[0]')
        if echo "$FIRST_OP" | jq -e 'has("quantity")' > /dev/null 2>&1; then
            echo "✅ 使用 'quantity' 字段"
        elif echo "$FIRST_OP" | jq -e 'has("count")' > /dev/null 2>&1; then
            echo "✅ 使用 'count' 字段"
        else
            echo "⚠️ 运营商对象字段未知"
        fi
    elif echo "$OPERATORS_FIELD" | jq -e 'type == "string"' > /dev/null 2>&1; then
        echo "⚠️ 运营商数据是字符串格式（需要解析）"
    else
        echo "❌ 运营商数据格式异常"
    fi
    echo ""
else
    echo "⚠️ 数据库中没有已发布的数据"
    echo ""
fi

echo "5️⃣ 对比数据列表和资源中心的数据源..."
echo "-----------------------------------"
echo "数据列表页面 (library.vue):"
echo "  - 使用 API: /api/data-library"
echo "  - 显示所有数据（包括待发布和已发布）"
echo ""
echo "资源中心页面 (center.vue):"
echo "  - 使用 API: /api/data-library/published"
echo "  - 只显示已发布数据"
echo ""
echo "定价管理页面 (pricing.vue):"
echo "  - 使用 API: /api/data-library/published"
echo "  - 只显示已发布数据"
echo ""

echo "6️⃣ 检查前端代码是否正确使用 request 模块..."
echo "-----------------------------------"
if grep -q "this.\$http" /home/vue-element-admin/src/views/resource/center.vue 2>/dev/null; then
    echo "❌ center.vue 仍在使用 this.\$http"
else
    echo "✅ center.vue 已使用 request 模块"
fi

if grep -q "this.\$http" /home/vue-element-admin/src/views/data/pricing.vue 2>/dev/null; then
    echo "❌ pricing.vue 仍在使用 this.\$http"
else
    echo "✅ pricing.vue 已使用 request 模块"
fi

if grep -q "this.\$http" /home/vue-element-admin/src/views/data/library.vue 2>/dev/null; then
    echo "❌ library.vue 仍在使用 this.\$http"
else
    echo "✅ library.vue 已使用 request 模块"
fi
echo ""

echo "7️⃣ 同步状态总结..."
echo "-----------------------------------"
if [ "$PUBLISHED_COUNT" -eq 0 ]; then
    echo "❌ 问题: 数据库中没有已发布数据"
    echo "   解决方案: 在数据列表页面发布数据"
elif [ "$PUBLISHED_COUNT" -gt 0 ]; then
    echo "✅ 数据库中有 $PUBLISHED_COUNT 条已发布数据"
    echo "   如果资源中心仍不显示，请:"
    echo "   1. 强制刷新浏览器 (Ctrl+F5 或 Cmd+Shift+R)"
    echo "   2. 清除浏览器缓存"
    echo "   3. 检查浏览器控制台是否有错误"
fi
echo ""

echo "========================================="
echo "✅ 诊断完成"
echo "========================================="
