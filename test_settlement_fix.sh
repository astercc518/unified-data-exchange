#!/bin/bash

# 测试三个结算API是否正常工作

echo "======================================"
echo "测试结算API修复效果"
echo "======================================"

echo ""
echo "1. 测试客户结算API..."
response1=$(curl -s "http://localhost:3000/api/sms/settlements?page=1&limit=10")
echo "响应: $response1" | head -c 200
if echo "$response1" | grep -q '"code":200'; then
    echo "... ✅ 成功"
else
    echo "... ❌ 失败"
fi

echo ""
echo "2. 测试代理结算API..."
response2=$(curl -s "http://localhost:3000/api/sms/agent-settlements?page=1&limit=10")
echo "响应: $response2" | head -c 200
if echo "$response2" | grep -q '"code":200'; then
    echo "... ✅ 成功"
else
    echo "... ❌ 失败"
fi

echo ""
echo "3. 测试通道结算API..."
response3=$(curl -s "http://localhost:3000/api/sms/channel-settlements?page=1&limit=10")
echo "响应: $response3" | head -c 200
if echo "$response3" | grep -q '"code":200'; then
    echo "... ✅ 成功"
else
    echo "... ❌ 失败"
fi

echo ""
echo "======================================"
echo "修复总结:"
echo "======================================"
echo ""
echo "✅ 修复了三个页面的数据访问问题："
echo "   - 客户结算页面 (src/views/sms/settlement/index.vue)"
echo "   - 代理结算页面 (src/views/sms/agentSettlement/index.vue)"  
echo "   - 通道结算页面 (src/views/sms/channelSettlement/index.vue)"
echo ""
echo "修改内容："
echo "   - getList() 方法：添加了安全访问 data.data?.list"
echo "   - getDetails() 方法：添加了安全访问 data.data?.list"  
echo "   - 添加了错误处理和默认值兜底"
echo "   - 添加了详细的错误日志"
echo ""
echo "现在请刷新浏览器页面重新访问："
echo "   - http://localhost:9527/#/sms/admin/settlements"
echo "   - http://localhost:9527/#/sms/admin/agent-settlement"
echo "   - http://localhost:9527/#/sms/admin/channel-settlement"
echo ""
echo "======================================"
