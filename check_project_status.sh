#!/bin/bash

echo "======================================"
echo "   项目运行状态全面检查报告"
echo "======================================"
echo ""

# 1. 检查进程状态
echo "📦 1. 服务进程状态"
echo "-----------------------------------"
if ps aux | grep "npm run dev" | grep -v grep > /dev/null; then
    echo "✅ 前端服务: 运行中 (端口 9527)"
    echo "   进程: $(ps aux | grep 'npm run dev' | grep -v grep | awk '{print $2}')"
else
    echo "❌ 前端服务: 未运行"
fi

if ps aux | grep "backend/server.js" | grep -v grep > /dev/null; then
    echo "✅ 后端服务: 运行中 (端口 3000)"
    echo "   进程: $(ps aux | grep 'backend/server.js' | grep -v grep | awk '{print $2}')"
else
    echo "❌ 后端服务: 未运行"
fi

echo ""

# 2. 检查端口监听
echo "🔌 2. 端口监听状态"
echo "-----------------------------------"
if lsof -i :9527 2>/dev/null | grep LISTEN > /dev/null; then
    echo "✅ 端口 9527 (前端): 正常监听"
else
    echo "❌ 端口 9527 (前端): 未监听"
fi

if lsof -i :3000 2>/dev/null | grep LISTEN > /dev/null; then
    echo "✅ 端口 3000 (后端): 正常监听"
else
    echo "❌ 端口 3000 (后端): 未监听"
fi

echo ""

# 3. 检查数据库连接
echo "💾 3. 数据库连接状态"
echo "-----------------------------------"
if mysql -u vue_admin_user -p'vue_admin_2024' -e "SELECT 1" vue_admin 2>/dev/null | grep -q 1; then
    echo "✅ MySQL数据库: 连接正常"
    echo "   数据库: vue_admin"
else
    echo "❌ MySQL数据库: 连接失败"
fi

echo ""

# 4. 检查结算表
echo "📊 4. 结算表数据状态"
echo "-----------------------------------"
mysql -u vue_admin_user -p'vue_admin_2024' vue_admin -e "
SELECT 
    TABLE_NAME as '表名',
    TABLE_ROWS as '记录数'
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA='vue_admin' 
AND TABLE_NAME LIKE 'sms_%settlement%' 
ORDER BY TABLE_NAME;
" 2>/dev/null

echo ""

# 5. 测试后端API
echo "🔗 5. 后端API测试"
echo "-----------------------------------"

# 客户结算API
response1=$(curl -s "http://localhost:3000/api/sms/settlements?page=1&limit=5")
if echo "$response1" | grep -q '"code":200'; then
    echo "✅ 客户结算API: 正常"
    count=$(echo "$response1" | grep -o '"total":[0-9]*' | grep -o '[0-9]*')
    echo "   记录数: $count"
else
    echo "❌ 客户结算API: 异常"
fi

# 代理结算API
response2=$(curl -s "http://localhost:3000/api/sms/agent-settlements?page=1&limit=5")
if echo "$response2" | grep -q '"code":200'; then
    echo "✅ 代理结算API: 正常"
    count=$(echo "$response2" | grep -o '"total":[0-9]*' | grep -o '[0-9]*')
    echo "   记录数: $count"
else
    echo "❌ 代理结算API: 异常"
fi

# 通道结算API
response3=$(curl -s "http://localhost:3000/api/sms/channel-settlements?page=1&limit=5")
if echo "$response3" | grep -q '"code":200'; then
    echo "✅ 通道结算API: 正常"
    count=$(echo "$response3" | grep -o '"total":[0-9]*' | grep -o '[0-9]*')
    echo "   记录数: $count"
else
    echo "❌ 通道结算API: 异常"
fi

echo ""

# 6. 检查前端资源
echo "🎨 6. 前端资源状态"
echo "-----------------------------------"
if curl -s http://localhost:9527 | grep -q "Vue 后台管理系统"; then
    echo "✅ 前端首页: 可访问"
else
    echo "❌ 前端首页: 无法访问"
fi

# 检查修复的文件
if [ -f "/home/vue-element-admin/src/views/sms/settlement/index.vue" ]; then
    if grep -q "data.data?.list" "/home/vue-element-admin/src/views/sms/settlement/index.vue"; then
        echo "✅ 客户结算页面: 已修复"
    else
        echo "⚠️  客户结算页面: 未修复"
    fi
fi

if [ -f "/home/vue-element-admin/src/views/sms/agentSettlement/index.vue" ]; then
    if grep -q "data.data?.list" "/home/vue-element-admin/src/views/sms/agentSettlement/index.vue"; then
        echo "✅ 代理结算页面: 已修复"
    else
        echo "⚠️  代理结算页面: 未修复"
    fi
fi

if [ -f "/home/vue-element-admin/src/views/sms/channelSettlement/index.vue" ]; then
    if grep -q "data.data?.list" "/home/vue-element-admin/src/views/sms/channelSettlement/index.vue"; then
        echo "✅ 通道结算页面: 已修复"
    else
        echo "⚠️  通道结算页面: 未修复"
    fi
fi

echo ""

# 7. 系统资源占用
echo "💻 7. 系统资源占用"
echo "-----------------------------------"
frontend_mem=$(ps aux | grep 'vue-cli-service serve' | grep -v grep | awk '{print $6}')
backend_mem=$(ps aux | grep 'backend/server.js' | grep -v grep | awk '{print $6}')
frontend_mem_mb=$((frontend_mem / 1024))
backend_mem_mb=$((backend_mem / 1024))
echo "   前端内存: ${frontend_mem_mb} MB"
echo "   后端内存: ${backend_mem_mb} MB"

echo ""
echo "======================================"
echo "         检查完成！"
echo "======================================"
echo ""
echo "📌 访问地址:"
echo "   前端: http://localhost:9527"
echo "   后端: http://localhost:3000"
echo ""
echo "🔗 结算页面:"
echo "   客户结算: http://localhost:9527/#/sms/admin/settlements"
echo "   代理结算: http://localhost:9527/#/sms/admin/agent-settlement"
echo "   通道结算: http://localhost:9527/#/sms/admin/channel-settlement"
echo ""
