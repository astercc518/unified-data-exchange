-- ===================================================================
-- 短信结算系统 - 测试数据准备脚本
-- 功能：准备代理、客户、短信记录等测试数据
-- ===================================================================

USE vue_admin;

-- 1. 检查并准备代理数据
-- ===================================================================
-- 确保有测试代理（如果不存在则插入）
INSERT IGNORE INTO agents (id, agent_name, login_account, login_password, commission, email, status, create_time, update_time)
VALUES 
  (100, '测试代理A', 'test_agent_001', MD5('password123'), 15.00, 'agent001@test.com', 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
  (101, '测试代理B', 'test_agent_002', MD5('password123'), 20.00, 'agent002@test.com', 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
  (102, '测试代理C', 'test_agent_003', MD5('password123'), 18.00, 'agent003@test.com', 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP());

-- 2. 检查并准备客户数据
-- ===================================================================
-- 为每个代理创建2-3个客户
INSERT IGNORE INTO users (id, login_account, login_password, customer_name, email, agent_id, agent_name, account_balance, status, create_time, update_time)
VALUES 
  -- 代理A的客户
  (1001, 'customer_a1', MD5('password123'), '客户A1', 'cust_a1@test.com', 100, '测试代理A', 5000.00, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
  (1002, 'customer_a2', MD5('password123'), '客户A2', 'cust_a2@test.com', 100, '测试代理A', 3000.00, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
  (1003, 'customer_a3', MD5('password123'), '客户A3', 'cust_a3@test.com', 100, '测试代理A', 8000.00, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
  
  -- 代理B的客户
  (1004, 'customer_b1', MD5('password123'), '客户B1', 'cust_b1@test.com', 101, '测试代理B', 6000.00, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
  (1005, 'customer_b2', MD5('password123'), '客户B2', 'cust_b2@test.com', 101, '测试代理B', 4000.00, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
  
  -- 代理C的客户
  (1006, 'customer_c1', MD5('password123'), '客户C1', 'cust_c1@test.com', 102, '测试代理C', 7000.00, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
  (1007, 'customer_c2', MD5('password123'), '客户C2', 'cust_c2@test.com', 102, '测试代理C', 5500.00, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
  (1008, 'customer_c3', MD5('password123'), '客户C3', 'cust_c3@test.com', 102, '测试代理C', 3500.00, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP());

-- 3. 检查并准备短信通道数据
-- ===================================================================
-- 确保有测试通道
INSERT IGNORE INTO sms_channels (id, channel_name, country, country_code, price_per_sms, status, create_time, update_time)
VALUES 
  (201, '测试通道-美国', 'United States', 'US', 0.0050, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
  (202, '测试通道-英国', 'United Kingdom', 'GB', 0.0045, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
  (203, '测试通道-中国', 'China', 'CN', 0.0030, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
  (204, '测试通道-印度', 'India', 'IN', 0.0025, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP());

-- 4. 生成短信发送记录（上个月的数据）
-- ===================================================================
-- 为了测试结算，我们生成上个月的数据

-- 4.1 客户A1的发送记录（成功率80%）
INSERT INTO sms_records 
  (customer_id, channel_id, phone, country, country_code, message, status, 
   sale_price, cost_price, created_at, sent_at, updated_at)
SELECT 
  1001 as customer_id,
  201 as channel_id,
  CONCAT('+1555000', LPAD(seq, 4, '0')) as phone,
  'United States' as country,
  'US' as country_code,
  'Test message from customer A1' as message,
  CASE WHEN seq % 5 = 0 THEN 'failed' ELSE 'success' END as status,
  0.0100 as sale_price,
  0.0050 as cost_price,
  DATE_SUB(NOW(), INTERVAL 1 MONTH) as created_at,
  DATE_SUB(NOW(), INTERVAL 1 MONTH) as sent_at,
  DATE_SUB(NOW(), INTERVAL 1 MONTH) as updated_at
FROM (
  SELECT @row := @row + 1 AS seq
  FROM (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) t1,
       (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) t2,
       (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) t3,
       (SELECT @row := 0) init
  LIMIT 100
) numbers;

-- 4.2 客户A2的发送记录（成功率90%）
INSERT INTO sms_records 
  (customer_id, channel_id, phone, country, country_code, message, status, 
   sale_price, cost_price, created_at, sent_at, updated_at)
SELECT 
  1002 as customer_id,
  202 as channel_id,
  CONCAT('+44777000', LPAD(seq, 3, '0')) as phone,
  'United Kingdom' as country,
  'GB' as country_code,
  'Test message from customer A2' as message,
  CASE WHEN seq % 10 = 0 THEN 'failed' ELSE 'success' END as status,
  0.0095 as sale_price,
  0.0045 as cost_price,
  DATE_SUB(NOW(), INTERVAL 1 MONTH) as created_at,
  DATE_SUB(NOW(), INTERVAL 1 MONTH) as sent_at,
  DATE_SUB(NOW(), INTERVAL 1 MONTH) as updated_at
FROM (
  SELECT @row2 := @row2 + 1 AS seq
  FROM (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) t1,
       (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) t2,
       (SELECT @row2 := 0) init
  LIMIT 50
) numbers;

-- 4.3 客户B1的发送记录（成功率75%）
INSERT INTO sms_records 
  (customer_id, channel_id, phone, country, country_code, message, status, 
   sale_price, cost_price, created_at, sent_at, updated_at)
SELECT 
  1004 as customer_id,
  203 as channel_id,
  CONCAT('+8613800', LPAD(seq, 6, '0')) as phone,
  'China' as country,
  'CN' as country_code,
  'Test message from customer B1' as message,
  CASE WHEN seq % 4 = 0 THEN 'failed' ELSE 'success' END as status,
  0.0080 as sale_price,
  0.0030 as cost_price,
  DATE_SUB(NOW(), INTERVAL 1 MONTH) as created_at,
  DATE_SUB(NOW(), INTERVAL 1 MONTH) as sent_at,
  DATE_SUB(NOW(), INTERVAL 1 MONTH) as updated_at
FROM (
  SELECT @row3 := @row3 + 1 AS seq
  FROM (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) t1,
       (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) t2,
       (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) t3,
       (SELECT @row3 := 0) init
  LIMIT 120
) numbers;

-- 4.4 客户C1的发送记录（成功率85%）
INSERT INTO sms_records 
  (customer_id, channel_id, phone, country, country_code, message, status, 
   sale_price, cost_price, created_at, sent_at, updated_at)
SELECT 
  1006 as customer_id,
  204 as channel_id,
  CONCAT('+919800', LPAD(seq, 6, '0')) as phone,
  'India' as country,
  'IN' as country_code,
  'Test message from customer C1' as message,
  CASE WHEN seq % 7 = 0 THEN 'failed' ELSE 'success' END as status,
  0.0070 as sale_price,
  0.0025 as cost_price,
  DATE_SUB(NOW(), INTERVAL 1 MONTH) as created_at,
  DATE_SUB(NOW(), INTERVAL 1 MONTH) as sent_at,
  DATE_SUB(NOW(), INTERVAL 1 MONTH) as updated_at
FROM (
  SELECT @row4 := @row4 + 1 AS seq
  FROM (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) t1,
       (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) t2,
       (SELECT @row4 := 0) init
  LIMIT 80
) numbers;

-- 5. 生成当月的一些数据（用于月度对比）
-- ===================================================================
INSERT INTO sms_records 
  (customer_id, channel_id, phone, country, country_code, message, status, 
   sale_price, cost_price, created_at, sent_at, updated_at)
SELECT 
  1001 as customer_id,
  201 as channel_id,
  CONCAT('+1555999', LPAD(seq, 4, '0')) as phone,
  'United States' as country,
  'US' as country_code,
  'Test message current month' as message,
  CASE WHEN seq % 5 = 0 THEN 'failed' ELSE 'success' END as status,
  0.0100 as sale_price,
  0.0050 as cost_price,
  NOW() as created_at,
  NOW() as sent_at,
  NOW() as updated_at
FROM (
  SELECT @row5 := @row5 + 1 AS seq
  FROM (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) t1,
       (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3) t2,
       (SELECT @row5 := 0) init
  LIMIT 30
) numbers;

-- 6. 数据统计查询
-- ===================================================================
SELECT '=== 测试数据准备完成 ===' as '状态';

SELECT 
  '代理数据' as '数据类型',
  COUNT(*) as '记录数'
FROM agents 
WHERE id >= 100;

SELECT 
  '客户数据' as '数据类型',
  COUNT(*) as '记录数'
FROM users 
WHERE id >= 1000;

SELECT 
  '通道数据' as '数据类型',
  COUNT(*) as '记录数'
FROM sms_channels 
WHERE id >= 200;

SELECT 
  '短信记录（上月）' as '数据类型',
  COUNT(*) as '记录数',
  SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as '成功数',
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as '失败数',
  ROUND(SUM(sale_price), 2) as '总销售额',
  ROUND(SUM(cost_price), 2) as '总成本'
FROM sms_records 
WHERE created_at < DATE_FORMAT(NOW(), '%Y-%m-01');

SELECT 
  '短信记录（本月）' as '数据类型',
  COUNT(*) as '记录数',
  SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as '成功数',
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as '失败数',
  ROUND(SUM(sale_price), 2) as '总销售额',
  ROUND(SUM(cost_price), 2) as '总成本'
FROM sms_records 
WHERE created_at >= DATE_FORMAT(NOW(), '%Y-%m-01');

-- 7. 按代理统计数据（用于验证代理结算）
-- ===================================================================
SELECT 
  a.id as '代理ID',
  a.agent_name as '代理名称',
  a.commission as '佣金比例(%)',
  COUNT(DISTINCT u.id) as '客户数',
  COUNT(sr.id) as '发送总数',
  SUM(CASE WHEN sr.status = 'success' THEN 1 ELSE 0 END) as '成功数',
  ROUND(SUM(sr.sale_price), 2) as '销售总额',
  ROUND(SUM(sr.cost_price), 2) as '成本总额',
  ROUND(SUM(sr.sale_price - sr.cost_price), 2) as '利润',
  ROUND(SUM(sr.sale_price - sr.cost_price) * a.commission / 100, 2) as '预计佣金'
FROM agents a
LEFT JOIN users u ON u.agent_id = a.id
LEFT JOIN sms_records sr ON sr.customer_id = u.id 
  AND sr.created_at < DATE_FORMAT(NOW(), '%Y-%m-01')
WHERE a.id >= 100
GROUP BY a.id, a.agent_name, a.commission
ORDER BY a.id;

-- 8. 按通道统计数据（用于验证通道结算）
-- ===================================================================
SELECT 
  c.id as '通道ID',
  c.channel_name as '通道名称',
  c.country as '国家',
  COUNT(sr.id) as '发送总数',
  SUM(CASE WHEN sr.status = 'success' THEN 1 ELSE 0 END) as '成功数',
  ROUND(SUM(CASE WHEN sr.status = 'success' THEN sr.cost_price ELSE 0 END), 4) as '成功成本',
  ROUND(AVG(CASE WHEN sr.status = 'success' THEN sr.cost_price ELSE NULL END), 6) as '平均单价'
FROM sms_channels c
LEFT JOIN sms_records sr ON sr.channel_id = c.id 
  AND sr.created_at < DATE_FORMAT(NOW(), '%Y-%m-01')
WHERE c.id >= 200
GROUP BY c.id, c.channel_name, c.country
ORDER BY c.id;

SELECT '=== 测试数据已准备，可以开始测试结算功能 ===' as '提示';
