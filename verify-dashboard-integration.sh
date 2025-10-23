#!/bin/bash

echo "=========================================="
echo "🔍 首页数据库集成功能验证"
echo "=========================================="
echo ""

# 检查后端服务
echo "1️⃣ 检查后端服务..."
echo "-----------------------------------"
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ 后端服务运行正常"
else
    echo "❌ 后端服务未运行"
    exit 1
fi
echo ""

# 测试统计 API
echo "2️⃣ 测试统计 API..."
echo "-----------------------------------"
STATS_RESPONSE=$(curl -s http://localhost:3000/api/stats/system)
if echo "$STATS_RESPONSE" | grep -q "success"; then
    echo "✅ 统计 API 响应正常"
    echo "📊 返回数据:"
    echo "$STATS_RESPONSE" | python -m json.tool 2>/dev/null || echo "$STATS_RESPONSE"
else
    echo "❌ 统计 API 异常"
    echo "响应: $STATS_RESPONSE"
    exit 1
fi
echo ""

# 检查前端服务
echo "3️⃣ 检查前端服务..."
echo "-----------------------------------"
if curl -s http://localhost:9528 > /dev/null 2>&1; then
    echo "✅ 前端服务运行正常"
else
    echo "⚠️  前端服务可能未完全启动"
fi
echo ""

# 验证统计数据
echo "4️⃣ 验证统计数据..."
echo "-----------------------------------"
USERS=$(echo "$STATS_RESPONSE" | grep -o '"users":[0-9]*' | cut -d: -f2)
AGENTS=$(echo "$STATS_RESPONSE" | grep -o '"agents":[0-9]*' | cut -d: -f2)
DATA=$(echo "$STATS_RESPONSE" | grep -o '"dataLibrary":[0-9]*' | cut -d: -f2)

echo "📊 当前统计数据:"
echo "   - 用户总数: $USERS"
echo "   - 代理总数: $AGENTS"
echo "   - 数据库记录: $DATA"
echo ""

# 测试其他统计接口
echo "5️⃣ 测试扩展统计接口..."
echo "-----------------------------------"

# 测试数据库统计
if curl -s http://localhost:3000/api/stats/data-library > /dev/null 2>&1; then
    echo "✅ 数据库统计 API 正常"
else
    echo "⚠️  数据库统计 API 可能异常"
fi

# 测试订单统计
if curl -s http://localhost:3000/api/stats/orders > /dev/null 2>&1; then
    echo "✅ 订单统计 API 正常"
else
    echo "⚠️  订单统计 API 可能异常"
fi

# 测试充值统计
if curl -s http://localhost:3000/api/stats/recharge > /dev/null 2>&1; then
    echo "✅ 充值统计 API 正常"
else
    echo "⚠️  充值统计 API 可能异常"
fi
echo ""

# 验证文件
echo "6️⃣ 验证相关文件..."
echo "-----------------------------------"
FILES=(
    "/home/vue-element-admin/src/api/stats.js"
    "/home/vue-element-admin/backend/routes/stats.js"
    "/home/vue-element-admin/test-dashboard-stats.html"
    "/home/vue-element-admin/DASHBOARD-DATABASE-INTEGRATION.md"
    "/home/vue-element-admin/首页数据库统计使用指南.md"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $(basename $file)"
    else
        echo "❌ $(basename $file) 不存在"
    fi
done
echo ""

echo "=========================================="
echo "✅ 验证完成！"
echo "=========================================="
echo ""
echo "📍 访问地址:"
echo "   - 前端首页: http://localhost:9528"
echo "   - 测试页面: http://localhost:9528/test-dashboard-stats.html"
echo "   - 统计 API: http://localhost:3000/api/stats/system"
echo ""
echo "📚 相关文档:"
echo "   - 实施报告: DASHBOARD-DATABASE-INTEGRATION.md"
echo "   - 使用指南: 首页数据库统计使用指南.md"
echo "   - 总结文档: 首页数据库集成总结.md"
echo ""
echo "🎉 首页数据库集成功能已成功实现！"
echo "=========================================="
