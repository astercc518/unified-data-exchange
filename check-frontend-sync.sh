#!/bin/bash

echo "========================================="
echo "🔍 前端数据同步检查"
echo "========================================="
echo ""

echo "1️⃣ 检查前端代码修复状态..."
echo "-----------------------------------"

# 检查资源中心
echo ""
echo "📄 检查 src/views/resource/center.vue:"
if grep -q "this.\$http" /home/vue-element-admin/src/views/resource/center.vue 2>/dev/null; then
    echo "   ❌ 仍在使用 this.\$http (需要修复)"
    ERRORS=$((ERRORS+1))
else
    echo "   ✅ 已正确使用 request 模块"
fi

if grep -q "import request from '@/utils/request'" /home/vue-element-admin/src/views/resource/center.vue 2>/dev/null; then
    echo "   ✅ 已导入 request 模块"
else
    echo "   ❌ 未导入 request 模块"
    ERRORS=$((ERRORS+1))
fi

if grep -q "/api/data-library/published" /home/vue-element-admin/src/views/resource/center.vue 2>/dev/null; then
    echo "   ✅ 使用正确的API端点 /api/data-library/published"
else
    echo "   ⚠️  可能未使用正确的API端点"
fi

# 检查定价管理
echo ""
echo "📄 检查 src/views/data/pricing.vue:"
if grep -q "this.\$http" /home/vue-element-admin/src/views/data/pricing.vue 2>/dev/null; then
    echo "   ❌ 仍在使用 this.\$http (需要修复)"
    ERRORS=$((ERRORS+1))
else
    echo "   ✅ 已正确使用 request 模块"
fi

if grep -q "import request from '@/utils/request'" /home/vue-element-admin/src/views/data/pricing.vue 2>/dev/null; then
    echo "   ✅ 已导入 request 模块"
else
    echo "   ❌ 未导入 request 模块"
    ERRORS=$((ERRORS+1))
fi

if grep -q "/api/data-library/published" /home/vue-element-admin/src/views/data/pricing.vue 2>/dev/null; then
    echo "   ✅ 使用正确的API端点 /api/data-library/published"
else
    echo "   ⚠️  可能未使用正确的API端点"
fi

# 检查数据列表
echo ""
echo "📄 检查 src/views/data/library.vue:"
if grep -q "this.\$http" /home/vue-element-admin/src/views/data/library.vue 2>/dev/null; then
    echo "   ❌ 仍在使用 this.\$http (需要修复)"
    ERRORS=$((ERRORS+1))
else
    echo "   ✅ 已正确使用 request 模块"
fi

if grep -q "import request from '@/utils/request'" /home/vue-element-admin/src/views/data/library.vue 2>/dev/null; then
    echo "   ✅ 已导入 request 模块"
else
    echo "   ❌ 未导入 request 模块"
    ERRORS=$((ERRORS+1))
fi

echo ""
echo "2️⃣ 检查运营商字段映射..."
echo "-----------------------------------"
if grep -q "count: op.quantity || op.count" /home/vue-element-admin/src/views/resource/center.vue 2>/dev/null; then
    echo "   ✅ 资源中心已包含字段映射 (quantity → count)"
else
    echo "   ⚠️  资源中心可能缺少字段映射"
fi

echo ""
echo "3️⃣ 检查自动刷新机制..."
echo "-----------------------------------"
if grep -q "activated()" /home/vue-element-admin/src/views/resource/center.vue 2>/dev/null; then
    echo "   ✅ 资源中心已添加 activated() 钩子"
else
    echo "   ⚠️  资源中心可能缺少自动刷新"
fi

if grep -q "activated()" /home/vue-element-admin/src/views/data/pricing.vue 2>/dev/null; then
    echo "   ✅ 定价管理已添加 activated() 钩子"
else
    echo "   ⚠️  定价管理可能缺少自动刷新"
fi

echo ""
echo "4️⃣ 检查前端开发服务器..."
echo "-----------------------------------"
if curl -s http://localhost:9529 > /dev/null 2>&1; then
    echo "   ✅ 前端服务运行正常 (http://localhost:9529)"
else
    echo "   ❌ 前端服务未运行"
    echo "   启动命令: cd /home/vue-element-admin && npm run dev"
fi

echo ""
echo "========================================="
if [ ${ERRORS:-0} -eq 0 ]; then
    echo "✅ 所有前端代码检查通过"
    echo ""
    echo "📝 下一步操作:"
    echo "   1. 确保后端服务运行在 http://localhost:3000"
    echo "   2. 访问前端: http://localhost:9529"
    echo "   3. 强制刷新浏览器 (Ctrl+F5 或 Cmd+Shift+R)"
    echo "   4. 在数据列表发布数据"
    echo "   5. 在资源中心查看已发布数据"
else
    echo "❌ 发现 $ERRORS 个问题，需要修复"
fi
echo "========================================="
