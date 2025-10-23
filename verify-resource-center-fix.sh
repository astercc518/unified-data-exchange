#!/bin/bash

echo "=========================================="
echo "🔧 资源中心数据同步问题修复验证"
echo "=========================================="
echo ""

# 1. 测试后端API
echo "1️⃣ 测试后端 API..."
echo "-----------------------------------"
API_RESPONSE=$(curl -s http://localhost:3000/api/data-library/published?page=1\&limit=20)

if echo "$API_RESPONSE" | grep -q '"success":true'; then
    echo "✅ 后端 API 正常"
    
    # 提取数据条数
    DATA_COUNT=$(echo "$API_RESPONSE" | grep -o '"data":\[' | wc -l)
    if [ $DATA_COUNT -gt 0 ]; then
        # 使用 python 解析 JSON（如果可用）
        if command -v python &> /dev/null; then
            COUNT=$(echo "$API_RESPONSE" | python -c "import sys, json; data = json.load(sys.stdin); print(len(data.get('data', [])))" 2>/dev/null)
            TOTAL=$(echo "$API_RESPONSE" | python -c "import sys, json; data = json.load(sys.stdin); print(data.get('total', 0))" 2>/dev/null)
            echo "   📊 返回数据: $COUNT 条"
            echo "   📊 总计: $TOTAL 条"
        else
            echo "   📊 数据格式正确"
        fi
    fi
else
    echo "❌ 后端 API 异常"
    echo "   响应: $API_RESPONSE"
fi
echo ""

# 2. 检查修复文件
echo "2️⃣ 检查修复文件..."
echo "-----------------------------------"
if grep -q "response.success && response.data && response.data.length" /home/vue-element-admin/src/views/resource/center.vue; then
    echo "✅ 代码修复已应用"
else
    echo "❌ 代码修复未应用"
fi
echo ""

# 3. 检查前端服务
echo "3️⃣ 检查前端服务..."
echo "-----------------------------------"
if curl -s http://localhost:9528 > /dev/null 2>&1; then
    echo "✅ 前端服务运行正常"
else
    echo "⚠️  前端服务未运行"
fi
echo ""

# 4. 显示访问地址
echo "=========================================="
echo "✅ 验证完成"
echo "=========================================="
echo ""
echo "📍 验证步骤:"
echo ""
echo "1. 访问资源中心页面:"
echo "   http://localhost:9528/#/resource/center"
echo ""
echo "2. 打开浏览器控制台 (F12)，查看日志"
echo ""
echo "3. 预期看到的日志:"
echo "   💾 从数据库API获取已发布数据..."
echo "   🔍 API响应结构: { success: true, hasData: true }"
echo "   ✅ 数据库API返回数据: X 条"
echo "   ✅ 数据加载完成，最终显示: X 条"
echo ""
echo "4. 访问测试页面验证:"
echo "   http://localhost:9528/test-resource-center-fix.html"
echo ""
echo "📚 相关文档:"
echo "   - 修复报告: RESOURCE-CENTER-API-FIX.md"
echo ""
echo "=========================================="
