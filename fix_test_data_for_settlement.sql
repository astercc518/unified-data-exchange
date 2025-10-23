-- ===================================================================
-- 修复结算测试数据 - 为现有客户添加9月份的短信记录
-- ===================================================================

USE vue_admin;

SET @settlement_month = '2025-09-17 12:00:00';

-- 1. 为代理3 (KL01) 的客户生成测试数据
-- 客户5: 生成100条记录
INSERT INTO sms_records 
  (customer_id, channel_id, phone_number, country, content, char_count, status,
   sale_price, cost_price, created_at, sent_at, updated_at)
SELECT 
  5,
  COALESCE((SELECT MIN(id) FROM sms_channels WHERE status = 1), 4),
  CONCAT('+1555', LPAD(seq, 7, '0')),
  'United States',
  'Test SMS for settlement',
  25,
  CASE WHEN seq % 5 = 0 THEN 'failed' ELSE 'success' END,
  0.0100,
  0.0050,
  @settlement_month,
  @settlement_month,
  @settlement_month
FROM (
  SELECT (@row1 := @row1 + 1) AS seq
  FROM information_schema.columns c1, information_schema.columns c2,
       (SELECT @row1 := 0) init
  LIMIT 100
) nums;

-- 客户11: 生成80条记录
INSERT INTO sms_records 
  (customer_id, channel_id, phone_number, country, content, char_count, status,
   sale_price, cost_price, created_at, sent_at, updated_at)
SELECT 
  11,
  COALESCE((SELECT MIN(id) FROM sms_channels WHERE status = 1), 4),
  CONCAT('+44777', LPAD(seq, 6, '0')),
  'United Kingdom',
  'Test SMS for settlement',
  25,
  CASE WHEN seq % 6 = 0 THEN 'failed' ELSE 'success' END,
  0.0095,
  0.0045,
  @settlement_month,
  @settlement_month,
  @settlement_month
FROM (
  SELECT (@row2 := @row2 + 1) AS seq
  FROM information_schema.columns c1, information_schema.columns c2,
       (SELECT @row2 := 0) init
  LIMIT 80
) nums;

-- 客户13: 生成60条记录
INSERT INTO sms_records 
  (customer_id, channel_id, phone_number, country, content, char_count, status,
   sale_price, cost_price, created_at, sent_at, updated_at)
SELECT 
  13,
  COALESCE((SELECT MIN(id) FROM sms_channels WHERE status = 1), 4),
  CONCAT('+8613', LPAD(seq, 9, '0')),
  'China',
  'Test SMS for settlement',
  25,
  CASE WHEN seq % 7 = 0 THEN 'failed' ELSE 'success' END,
  0.0080,
  0.0030,
  @settlement_month,
  @settlement_month,
  @settlement_month
FROM (
  SELECT (@row3 := @row3 + 1) AS seq
  FROM information_schema.columns c1, information_schema.columns c2,
       (SELECT @row3 := 0) init
  LIMIT 60
) nums;

-- 2. 为代理7 (KL02) 的客户生成测试数据
-- 客户9: 生成120条记录
INSERT INTO sms_records 
  (customer_id, channel_id, phone_number, country, content, char_count, status,
   sale_price, cost_price, created_at, sent_at, updated_at)
SELECT 
  9,
  COALESCE((SELECT MIN(id) FROM sms_channels WHERE status = 1), 4),
  CONCAT('+9198', LPAD(seq, 8, '0')),
  'India',
  'Test SMS for settlement',
  25,
  CASE WHEN seq % 4 = 0 THEN 'failed' ELSE 'success' END,
  0.0070,
  0.0025,
  @settlement_month,
  @settlement_month,
  @settlement_month
FROM (
  SELECT (@row4 := @row4 + 1) AS seq
  FROM information_schema.columns c1, information_schema.columns c2,
       (SELECT @row4 := 0) init
  LIMIT 120
) nums;

-- 3. 为代理9 (KL08) 的客户生成测试数据
-- 客户14: 生成90条记录
INSERT INTO sms_records 
  (customer_id, channel_id, phone_number, country, content, char_count, status,
   sale_price, cost_price, created_at, sent_at, updated_at)
SELECT 
  14,
  COALESCE((SELECT MIN(id) FROM sms_channels WHERE status = 1), 4),
  CONCAT('+336', LPAD(seq, 8, '0')),
  'France',
  'Test SMS for settlement',
  25,
  CASE WHEN seq % 5 = 0 THEN 'failed' ELSE 'success' END,
  0.0085,
  0.0035,
  @settlement_month,
  @settlement_month,
  @settlement_month
FROM (
  SELECT (@row5 := @row5 + 1) AS seq
  FROM information_schema.columns c1, information_schema.columns c2,
       (SELECT @row5 := 0) init
  LIMIT 90
) nums;

-- 4. 统计验证
SELECT '=== 测试数据添加完成 ===' as '状态';

SELECT 
  '9月份短信记录' as '类型',
  COUNT(*) as '总数',
  SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as '成功',
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as '失败',
  ROUND(SUM(sale_price), 2) as '销售额',
  ROUND(SUM(cost_price), 2) as '成本'
FROM sms_records 
WHERE DATE_FORMAT(created_at, '%Y-%m') = '2025-09';

-- 按代理统计
SELECT 
  a.id as '代理ID',
  a.agent_name as '代理名',
  a.commission as '佣金%',
  COUNT(sr.id) as '发送数',
  SUM(CASE WHEN sr.status = 'success' THEN 1 ELSE 0 END) as '成功数',
  ROUND(SUM(sr.sale_price), 2) as '销售额',
  ROUND(SUM(sr.cost_price), 2) as '成本',
  ROUND(SUM(sr.sale_price - sr.cost_price), 2) as '利润',
  ROUND(SUM(sr.sale_price - sr.cost_price) * a.commission / 100, 2) as '预计佣金'
FROM agents a
LEFT JOIN users u ON u.agent_id = a.id AND u.status = 1
LEFT JOIN sms_records sr ON sr.customer_id = u.id 
  AND DATE_FORMAT(sr.created_at, '%Y-%m') = '2025-09'
WHERE a.id IN (3, 7, 9)
GROUP BY a.id, a.agent_name, a.commission
ORDER BY a.id;

SELECT '=== 现在可以执行代理结算了 ===' as '提示';
