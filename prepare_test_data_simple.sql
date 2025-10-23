-- ===================================================================
-- 短信结算系统 - 简化版测试数据准备脚本
-- ===================================================================

USE vue_admin;

-- 1. 准备代理数据
-- ===================================================================
INSERT IGNORE INTO agents (id, agent_name, login_account, login_password, commission, email, status, create_time, update_time)
VALUES 
  (100, '测试代理A', 'test_agent_001', MD5('password123'), 15.00, 'agent001@test.com', 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
  (101, '测试代理B', 'test_agent_002', MD5('password123'), 20.00, 'agent002@test.com', 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
  (102, '测试代理C', 'test_agent_003', MD5('password123'), 18.00, 'agent003@test.com', 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP());

-- 2. 准备客户数据
-- ===================================================================
INSERT IGNORE INTO users (id, login_account, login_password, customer_name, email, agent_id, agent_name, account_balance, status, create_time, update_time)
VALUES 
  (1001, 'customer_a1', MD5('password123'), '客户A1', 'cust_a1@test.com', 100, '测试代理A', 5000.00, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
  (1002, 'customer_a2', MD5('password123'), '客户A2', 'cust_a2@test.com', 100, '测试代理A', 3000.00, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
  (1003, 'customer_b1', MD5('password123'), '客户B1', 'cust_b1@test.com', 101, '测试代理B', 6000.00, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
  (1004, 'customer_c1', MD5('password123'), '客户C1', 'cust_c1@test.com', 102, '测试代理C', 7000.00, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP());

-- 3. 准备短信通道（使用已有通道或创建新的）
-- ===================================================================
-- 先检查是否有可用通道
SELECT '检查现有通道...' as 'Status';
SELECT id, channel_name, country, price_per_sms FROM sms_channels WHERE status = 1 LIMIT 5;

-- 4. 生成上个月的短信记录
-- ===================================================================
-- 使用第一个可用通道ID（假设为1，如果不存在会失败，这是正常的）

-- 为客户A1生成100条记录（80%成功率）
INSERT INTO sms_records 
  (customer_id, channel_id, phone, country, country_code, message, status, 
   sale_price, cost_price, created_at, sent_at, updated_at)
SELECT 
  1001 as customer_id,
  COALESCE((SELECT MIN(id) FROM sms_channels WHERE status = 1), 1) as channel_id,
  CONCAT('+1555000', LPAD(seq, 4, '0')) as phone,
  'United States' as country,
  'US' as country_code,
  'Test message' as message,
  CASE WHEN seq % 5 = 0 THEN 'failed' ELSE 'success' END as status,
  0.0100 as sale_price,
  0.0050 as cost_price,
  DATE_SUB(NOW(), INTERVAL 35 DAY) as created_at,
  DATE_SUB(NOW(), INTERVAL 35 DAY) as sent_at,
  DATE_SUB(NOW(), INTERVAL 35 DAY) as updated_at
FROM (
  SELECT (@row_a1 := @row_a1 + 1) AS seq
  FROM information_schema.columns c1, information_schema.columns c2,
       (SELECT @row_a1 := 0) init
  LIMIT 100
) numbers;

-- 为客户A2生成50条记录（90%成功率）
INSERT INTO sms_records 
  (customer_id, channel_id, phone, country, country_code, message, status, 
   sale_price, cost_price, created_at, sent_at, updated_at)
SELECT 
  1002 as customer_id,
  COALESCE((SELECT MIN(id) FROM sms_channels WHERE status = 1), 1) as channel_id,
  CONCAT('+44777000', LPAD(seq, 3, '0')) as phone,
  'United Kingdom' as country,
  'GB' as country_code,
  'Test message' as message,
  CASE WHEN seq % 10 = 0 THEN 'failed' ELSE 'success' END as status,
  0.0095 as sale_price,
  0.0045 as cost_price,
  DATE_SUB(NOW(), INTERVAL 35 DAY) as created_at,
  DATE_SUB(NOW(), INTERVAL 35 DAY) as sent_at,
  DATE_SUB(NOW(), INTERVAL 35 DAY) as updated_at
FROM (
  SELECT (@row_a2 := @row_a2 + 1) AS seq
  FROM information_schema.columns c1, information_schema.columns c2,
       (SELECT @row_a2 := 0) init
  LIMIT 50
) numbers;

-- 为客户B1生成120条记录（75%成功率）
INSERT INTO sms_records 
  (customer_id, channel_id, phone, country, country_code, message, status, 
   sale_price, cost_price, created_at, sent_at, updated_at)
SELECT 
  1003 as customer_id,
  COALESCE((SELECT MIN(id) FROM sms_channels WHERE status = 1), 1) as channel_id,
  CONCAT('+8613800', LPAD(seq, 6, '0')) as phone,
  'China' as country,
  'CN' as country_code,
  'Test message' as message,
  CASE WHEN seq % 4 = 0 THEN 'failed' ELSE 'success' END as status,
  0.0080 as sale_price,
  0.0030 as cost_price,
  DATE_SUB(NOW(), INTERVAL 35 DAY) as created_at,
  DATE_SUB(NOW(), INTERVAL 35 DAY) as sent_at,
  DATE_SUB(NOW(), INTERVAL 35 DAY) as updated_at
FROM (
  SELECT (@row_b1 := @row_b1 + 1) AS seq
  FROM information_schema.columns c1, information_schema.columns c2,
       (SELECT @row_b1 := 0) init
  LIMIT 120
) numbers;

-- 为客户C1生成80条记录（85%成功率）
INSERT INTO sms_records 
  (customer_id, channel_id, phone, country, country_code, message, status, 
   sale_price, cost_price, created_at, sent_at, updated_at)
SELECT 
  1004 as customer_id,
  COALESCE((SELECT MIN(id) FROM sms_channels WHERE status = 1), 1) as channel_id,
  CONCAT('+919800', LPAD(seq, 6, '0')) as phone,
  'India' as country,
  'IN' as country_code,
  'Test message' as message,
  CASE WHEN seq % 7 = 0 THEN 'failed' ELSE 'success' END as status,
  0.0070 as sale_price,
  0.0025 as cost_price,
  DATE_SUB(NOW(), INTERVAL 35 DAY) as created_at,
  DATE_SUB(NOW(), INTERVAL 35 DAY) as sent_at,
  DATE_SUB(NOW(), INTERVAL 35 DAY) as updated_at
FROM (
  SELECT (@row_c1 := @row_c1 + 1) AS seq
  FROM information_schema.columns c1, information_schema.columns c2,
       (SELECT @row_c1 := 0) init
  LIMIT 80
) numbers;

-- 5. 数据统计
-- ===================================================================
SELECT '=== 测试数据准备完成 ===' as '状态';

SELECT '代理数据' as '类型', COUNT(*) as '数量' FROM agents WHERE id >= 100;
SELECT '客户数据' as '类型', COUNT(*) as '数量' FROM users WHERE id >= 1000;
SELECT '短信记录' as '类型', COUNT(*) as '总数',
       SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as '成功',
       SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as '失败'
FROM sms_records WHERE customer_id >= 1000;

-- 按代理统计
SELECT 
  a.id as '代理ID',
  a.agent_name as '代理名',
  a.commission as '佣金%',
  COUNT(sr.id) as '发送数',
  SUM(CASE WHEN sr.status = 'success' THEN 1 ELSE 0 END) as '成功数',
  ROUND(SUM(sr.sale_price), 2) as '销售额',
  ROUND(SUM(sr.cost_price), 2) as '成本',
  ROUND(SUM(sr.sale_price - sr.cost_price), 2) as '利润'
FROM agents a
LEFT JOIN users u ON u.agent_id = a.id
LEFT JOIN sms_records sr ON sr.customer_id = u.id
WHERE a.id >= 100
GROUP BY a.id, a.agent_name, a.commission;
