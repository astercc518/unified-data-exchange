#!/bin/bash

echo "=========================================="
echo "🔧 动态定价功能修复验证"
echo "=========================================="
echo ""

# 1. 检查修复文件
echo "1️⃣ 检查修复文件..."
echo "-----------------------------------"

if grep -q "if (!Array.isArray(dataList))" /home/vue-element-admin/src/utils/dynamicPricing.js; then
    echo "✅ dynamicPricing.js - updateDataListPricing() 已修复"
else
    echo "❌ dynamicPricing.js - updateDataListPricing() 未修复"
fi

if grep -q "if (!dataItem || typeof dataItem !== 'object')" /home/vue-element-admin/src/utils/dynamicPricing.js; then
    echo "✅ dynamicPricing.js - calculateCurrentPrice() 已修复"
else
    echo "❌ dynamicPricing.js - calculateCurrentPrice() 未修复"
fi

if grep -q "} catch (pricingError) {" /home/vue-element-admin/src/views/resource/center.vue; then
    echo "✅ center.vue - 错误处理已添加"
else
    echo "❌ center.vue - 错误处理未添加"
fi
echo ""

# 2. 检查服务状态
echo "2️⃣ 检查服务状态..."
echo "-----------------------------------"

if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ 后端服务运行正常"
else
    echo "❌ 后端服务未运行"
fi

if curl -s http://localhost:9528 > /dev/null 2>&1; then
    echo "✅ 前端服务运行正常"
else
    echo "⚠️  前端服务未运行"
fi
echo ""

# 3. 测试API数据
echo "3️⃣ 测试API数据..."
echo "-----------------------------------"

API_RESPONSE=$(curl -s http://localhost:3000/api/data-library/published?page=1\&limit=5)

if echo "$API_RESPONSE" | grep -q '"success":true'; then
    echo "✅ API 返回数据正常"
    
    if command -v python &> /dev/null; then
        COUNT=$(echo "$API_RESPONSE" | python -c "import sys, json; data = json.load(sys.stdin); print(len(data.get('data', [])))" 2>/dev/null)
        echo "   📊 数据条数: $COUNT"
    fi
else
    echo "⚠️  API 返回异常"
fi
echo ""

# 4. 显示验证指南
echo "=========================================="
echo "✅ 自动验证完成"
echo "=========================================="
echo ""
echo "📍 手动验证步骤:"
echo ""
echo "1. 访问测试页面:"
echo "   http://localhost:9528/test-dynamic-pricing-fix.html"
echo ""
echo "2. 访问资源中心:"
echo "   http://localhost:9528/#/resource/center"
echo ""
echo "3. 打开浏览器控制台 (F12)，检查:"
echo "   - 无 JavaScript 错误"
echo "   - 显示 '✅ 动态定价应用成功'"
echo "   - 数据列表正常显示"
echo ""
echo "4. 检查数据项:"
echo "   - 价格显示正常"
echo "   - 时效标签显示"
echo "   - 折扣信息显示"
echo ""
echo "📚 相关文档:"
echo "   - 修复报告: DYNAMIC-PRICING-FIX.md"
echo "   - 测试页面: test-dynamic-pricing-fix.html"
echo ""
echo "=========================================="
