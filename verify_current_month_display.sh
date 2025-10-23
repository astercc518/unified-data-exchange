#!/bin/bash

echo "======================================"
echo "  当月实时结算显示功能验证"
echo "======================================"
echo ""

# 获取当前年月
CURRENT_MONTH=$(date +%Y-%m)
echo "📅 当前月份: $CURRENT_MONTH"
echo ""

# 1. 检查10月份结算数据
echo "📊 1. 检查10月份代理结算数据"
echo "-----------------------------------"
mysql -u vue_admin_user -p'vue_admin_2024' vue_admin -e "
SELECT 
  id as 'ID',
  agent_id as '代理',
  settlement_month as '月份',
  total_submitted as '发送',
  total_success as '成功',
  total_revenue as '销售',
  total_profit as '利润',
  agent_commission as '佣金',
  settlement_status as '状态'
FROM sms_agent_settlements 
WHERE settlement_month = '$CURRENT_MONTH'
ORDER BY id DESC;
" 2>/dev/null

echo ""

# 2. 检查10月份短信记录
echo "📱 2. 检查10月份短信发送记录"
echo "-----------------------------------"
mysql -u vue_admin_user -p'vue_admin_2024' vue_admin -e "
SELECT 
  '10月短信' as '类型',
  COUNT(*) as '总数',
  SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as '成功',
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as '失败',
  ROUND(SUM(sale_price), 2) as '销售额',
  ROUND(SUM(cost_price), 2) as '成本',
  ROUND(SUM(sale_price - cost_price), 2) as '利润'
FROM sms_records 
WHERE DATE_FORMAT(created_at, '%Y-%m') = '$CURRENT_MONTH';
" 2>/dev/null

echo ""

# 3. 测试API（当月筛选）
echo "🔗 3. 测试代理结算API（当月筛选）"
echo "-----------------------------------"
response=$(curl -s "http://localhost:3000/api/sms/agent-settlements?page=1&limit=10&settlement_month=$CURRENT_MONTH")
total=$(echo "$response" | grep -o '"total":[0-9]*' | head -1 | grep -o '[0-9]*')

if [ ! -z "$total" ] && [ "$total" -gt 0 ]; then
    echo "✅ API返回 $total 条10月份记录"
else
    echo "⚠️  API返回空数据（可能还没有结算）"
    echo "   请在页面点击'手动结算'触发10月份结算"
fi

echo ""

# 4. 检查前端代码
echo "🎨 4. 检查前端默认筛选设置"
echo "-----------------------------------"

# 检查代理结算页面
if grep -q "const month = String(now.getMonth() + 1)" /home/vue-element-admin/src/views/sms/agentSettlement/index.vue; then
    echo "✅ 代理结算页面: 默认查询当月"
else
    echo "❌ 代理结算页面: 未设置默认当月"
fi

# 检查通道结算页面
if grep -q "const month = String(now.getMonth() + 1)" /home/vue-element-admin/src/views/sms/channelSettlement/index.vue; then
    echo "✅ 通道结算页面: 默认查询当月"
else
    echo "❌ 通道结算页面: 未设置默认当月"
fi

# 检查客户结算页面
if grep -q "const start = new Date(year, month, 1)" /home/vue-element-admin/src/views/sms/settlement/index.vue; then
    echo "✅ 客户结算页面: 默认查询当月"
else
    echo "❌ 客户结算页面: 未设置默认当月"
fi

echo ""

# 5. 历史数据对比
echo "📈 5. 9月 vs 10月数据对比"
echo "-----------------------------------"
mysql -u vue_admin_user -p'vue_admin_2024' vue_admin -e "
SELECT 
  settlement_month as '月份',
  COUNT(*) as '结算记录',
  SUM(total_submitted) as '总发送',
  SUM(total_success) as '总成功',
  ROUND(SUM(total_revenue), 2) as '总销售额',
  ROUND(SUM(total_profit), 2) as '总利润',
  ROUND(SUM(agent_commission), 2) as '总佣金'
FROM sms_agent_settlements
WHERE settlement_month IN ('2025-09', '2025-10')
GROUP BY settlement_month
ORDER BY settlement_month DESC;
" 2>/dev/null

echo ""
echo "======================================"
echo "         验证完成"
echo "======================================"
echo ""
echo "📌 下一步操作:"
echo "   1. 刷新浏览器 (Ctrl + Shift + R)"
echo "   2. 访问代理结算: http://localhost:9527/#/sms/admin/agent-settlement"
echo "   3. 访问客户结算: http://localhost:9527/#/sms/admin/settlements"
echo ""
echo "📋 预期效果:"
echo "   ✅ 代理结算: 月份筛选框显示 '2025-10'"
echo "   ✅ 代理结算: 列表显示3条10月份记录"
echo "   ✅ 客户结算: 日期范围显示 '2025-10-01' 至 '今天'"
echo "   ✅ 统计卡片显示当月汇总数据"
echo ""
echo "💡 提示:"
echo "   - 可以在月份筛选器选择 '2025-09' 查看9月历史数据"
echo "   - 清空月份筛选可以查看所有月份数据"
echo "   - 点击'手动结算'可以重新触发当月结算"
echo ""
