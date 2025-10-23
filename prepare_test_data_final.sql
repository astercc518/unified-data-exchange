-- ===================================================================
-- 短信结算系统 - 最终版测试数据准备脚本
-- ===================================================================

USE vue_admin;

SET @last_month_date = DATE_SUB(NOW(), INTERVAL 35 DAY);

-- 1. 准备代理数据
INSERT IGNORE INTO agents (id, agent_name, login_account, login_password, commission, email, status, create_time, update_time)
VALUES 
  (100, '测试代理A', 'test_agent_001', MD5('password123'), 15.00, 'agent001@test.com', 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
  (101, '测试代理B', 'test_agent_002', MD5('password123'), 20.00, 'agent002@test.com', 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
  (102, '测试代理C', 'test_agent_003', MD5('password123'), 18.00, 'agent003@test.com', 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP());

-- 2. 准备客户数据
INSERT IGNORE INTO users (id, login_account, login_password, customer_name, email, agent_id, agent_name, account_balance, status, create_time, update_time)
VALUES 
  (1001, 'customer_a1', MD5('password123'), '客户A1', 'cust_a1@test.com', 100, '测试代理A', 5000.00, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
  (1002, 'customer_a2', MD5('password123'), '客户A2', 'cust_a2@test.com', 100, '测试代理A', 3000.00, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
  (1003, 'customer_b1', MD5('password123'), '客户B1', 'cust_b1@test.com', 101, '测试代理B', 6000.00, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
  (1004, 'customer_c1', MD5('password123'), '客户C1', 'cust_c1@test.com', 102, '测试代理C', 7000.00, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP());

-- 3. 为客户A1生成100条上月记录（80%成功率）
INSERT INTO sms_records 
  (customer_id, channel_id, phone_number, country, content, char_count, status,
   sale_price, cost_price, created_at, sent_at, updated_at)
SELECT 
  1001,
  COALESCE((SELECT MIN(id) FROM sms_channels WHERE status = 1), 4),
  CONCAT('+1555000', LPAD(seq, 4, '0')),
  'United States',
  'Test SMS message',
  18,
  CASE WHEN seq % 5 = 0 THEN 'failed' ELSE 'success' END,
  0.0100,
  0.0050,
  @last_month_date,
  @last_month_date,
  @last_month_date
FROM (
  SELECT (@row1 := @row1 + 1) AS seq
  FROM information_schema.columns c1, information_schema.columns c2,
       (SELECT @row1 := 0) init
  LIMIT 100
) nums;

-- 4. 为客户A2生成50条上月记录（90%成功率）
INSERT INTO sms_records 
  (customer_id, channel_id, phone_number, country, content, char_count, status,
   sale_price, cost_price, created_at, sent_at, updated_at)
SELECT 
  1002,
  COALESCE((SELECT MIN(id) FROM sms_channels WHERE status = 1), 4),
  CONCAT('+44777000', LPAD(seq, 3, '0')),
  'United Kingdom',
  'Test SMS message',
  18,
  CASE WHEN seq % 10 = 0 THEN 'failed' ELSE 'success' END,
  0.0095,
  0.0045,
  @last_month_date,
  @last_month_date,
  @last_month_date
FROM (
  SELECT (@row2 := @row2 + 1) AS seq
  FROM information_schema.columns c1, information_schema.columns c2,
       (SELECT @row2 := 0) init
  LIMIT 50
) nums;

-- 5. 为客户B1生成120条上月记录（75%成功率）
INSERT INTO sms_records 
  (customer_id, channel_id, phone_number, country, content, char_count, status,
   sale_price, cost_price, created_at, sent_at, updated_at)
SELECT 
  1003,
  COALESCE((SELECT MIN(id) FROM sms_channels WHERE status = 1), 4),
  CONCAT('+8613800', LPAD(seq, 6, '0')),
  'China',
  'Test SMS message',
  18,
  CASE WHEN seq % 4 = 0 THEN 'failed' ELSE 'success' END,
  0.0080,
  0.0030,
  @last_month_date,
  @last_month_date,
  @last_month_date
FROM (
  SELECT (@row3 := @row3 + 1) AS seq
  FROM information_schema.columns c1, information_schema.columns c2,
       (SELECT @row3 := 0) init
  LIMIT 120
) nums;

-- 6. 为客户C1生成80条上月记录（85%成功率）
INSERT INTO sms_records 
  (customer_id, channel_id, phone_number, country, content, char_count, status,
   sale_price, cost_price, created_at, sent_at, updated_at)
SELECT 
  1004,
  COALESCE((SELECT MIN(id) FROM sms_channels WHERE status = 1), 4),
  CONCAT('+919800', LPAD(seq, 6, '0')),
  'India',
  'Test SMS message',
  18,
  CASE WHEN seq % 7 = 0 THEN 'failed' ELSE 'success' END,
  0.0070,
  0.0025,
  @last_month_date,
  @last_month_date,
  @last_month_date
FROM (
  SELECT (@row4 := @row4 + 1) AS seq
  FROM information_schema.columns c1, information_schema.columns c2,
       (SELECT @row4 := 0) init
  LIMIT 80
) nums;

-- 7. 数据统计
SELECT '=== 测试数据准备完成 ===' as '状态';
SELECT '代理数量' as '类型', COUNT(*) as '数量' FROM agents WHERE id >= 100;
SELECT '客户数量' as '类型', COUNT(*) as '数量' FROM users WHERE id >= 1000;
SELECT '短信记录' as '类型', 
       COUNT(*) as '总数',
       SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as '成功',
       SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as '失败',
       ROUND(SUM(sale_price), 2) as '销售额',
       ROUND(SUM(cost_price), 2) as '成本'
FROM sms_records WHERE customer_id >= 1000;

-- 按代理统计（用于验证结算逻辑）
SELECT 
  a.id as '代理ID',
  a.agent_name as '代理名',
  a.commission as '佣金%',
  COUNT(sr.id) as '总发送',
  SUM(CASE WHEN sr.status = 'success' THEN 1 ELSE 0 END) as '成功数',
  ROUND(SUM(sr.sale_price), 2) as '销售额',
  ROUND(SUM(sr.cost_price), 2) as '成本',
  ROUND(SUM(sr.sale_price - sr.cost_price), 2) as '利润',
  ROUND(SUM(sr.sale_price - sr.cost_price) * a.commission / 100, 2) as '预计佣金'
FROM agents a
LEFT JOIN users u ON u.agent_id = a.id
LEFT JOIN sms_records sr ON sr.customer_id = u.id AND sr.customer_id >= 1000
WHERE a.id >= 100
GROUP BY a.id, a.agent_name, a.commission;

SELECT '=== 可以开始测试结算功能了 ===' as '提示';
