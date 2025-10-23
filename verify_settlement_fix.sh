#!/bin/bash

echo "======================================"
echo "   结算显示问题修复验证"
echo "======================================"
echo ""

# 1. 检查数据库结算记录
echo "📊 1. 检查数据库结算记录"
echo "-----------------------------------"
mysql -u vue_admin_user -p'vue_admin_2024' vue_admin -e "
SELECT 
  id as 'ID',
  agent_id as '代理ID',
  settlement_month as '月份',
  total_submitted as '发送数',
  total_success as '成功数',
  total_revenue as '销售额',
  total_profit as '利润',
  agent_commission as '佣金'
FROM sms_agent_settlements 
ORDER BY id DESC;
" 2>/dev/null

echo ""

# 2. 测试API（不带月份筛选）
echo "🔗 2. 测试API（显示所有月份）"
echo "-----------------------------------"
response=$(curl -s "http://localhost:3000/api/sms/agent-settlements?page=1&limit=10")
total=$(echo "$response" | grep -o '"total":[0-9]*' | grep -o '[0-9]*')

if [ ! -z "$total" ] && [ "$total" -gt 0 ]; then
    echo "✅ API返回 $total 条记录"
    echo "$response" | python -m json.tool 2>/dev/null | grep -A 5 '"settlement_month"' | head -n 20
else
    echo "❌ API返回空数据"
fi

echo ""

# 3. 检查前端修复
echo "🎨 3. 检查前端代码修复"
echo "-----------------------------------"
if grep -q "this.listQuery.settlement_month = ''" /home/vue-element-admin/src/views/sms/agentSettlement/index.vue; then
    echo "✅ 代理结算页面: 已修复（不设置默认月份）"
else
    echo "❌ 代理结算页面: 未修复"
fi

if grep -q "this.listQuery.settlement_month = ''" /home/vue-element-admin/src/views/sms/channelSettlement/index.vue; then
    echo "✅ 通道结算页面: 已修复（不设置默认月份）"
else
    echo "❌ 通道结算页面: 未修复"
fi

echo ""

# 4. 统计结算数据
echo "📈 4. 结算数据统计汇总"
echo "-----------------------------------"
mysql -u vue_admin_user -p'vue_admin_2024' vue_admin -e "
SELECT 
  '代理结算' as '类型',
  COUNT(*) as '记录数',
  COUNT(DISTINCT agent_id) as '代理数',
  COUNT(DISTINCT settlement_month) as '月份数',
  SUM(total_submitted) as '总发送',
  SUM(total_success) as '总成功',
  ROUND(SUM(total_revenue), 2) as '总销售额',
  ROUND(SUM(total_profit), 2) as '总利润',
  ROUND(SUM(agent_commission), 2) as '总佣金'
FROM sms_agent_settlements;
" 2>/dev/null

echo ""
echo "======================================"
echo "         验证完成"
echo "======================================"
echo ""
echo "📌 下一步操作:"
echo "   1. 刷新浏览器页面 (Ctrl + Shift + R)"
echo "   2. 访问: http://localhost:9527/#/sms/admin/agent-settlement"
echo "   3. 应该立即看到 3 条结算记录"
echo ""
echo "📋 预期效果:"
echo "   ✅ 月份筛选框为空"
echo "   ✅ 显示3条9月份的结算记录"
echo "   ✅ 统计卡片显示汇总数据"
echo "   ✅ 可以点击查看明细"
echo ""
