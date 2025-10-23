-- ===================================================================
-- 为历史短信记录补充定价信息
-- 执行时间: 2025-10-21
-- 说明: 为集成前发送的历史记录补充 cost_price 和 sale_price
-- ===================================================================

USE vue_admin;

-- -------------------------------------------------------------------
-- 1. 检查需要更新的记录数量
-- -------------------------------------------------------------------
SELECT 
  '需要更新的记录数' AS info,
  COUNT(*) AS count
FROM sms_records
WHERE (cost_price IS NULL OR cost_price = 0)
  AND (sale_price IS NULL OR sale_price = 0)
  AND status = 'success';

-- -------------------------------------------------------------------
-- 2. 为历史记录补充定价信息
-- -------------------------------------------------------------------
UPDATE sms_records sr
JOIN sms_channel_countries scc 
  ON sr.channel_id = scc.channel_id 
  AND sr.country = scc.country
  AND scc.status = 1
SET 
  sr.cost_price = scc.cost_price,
  sr.sale_price = scc.sale_price
WHERE 
  (sr.cost_price IS NULL OR sr.cost_price = 0)
  AND (sr.sale_price IS NULL OR sr.sale_price = 0)
  AND sr.status = 'success';

-- 显示更新结果
SELECT ROW_COUNT() AS '已更新记录数';

-- -------------------------------------------------------------------
-- 3. 验证更新结果
-- -------------------------------------------------------------------
SELECT 
  '更新后统计' AS info,
  COUNT(*) AS total_records,
  SUM(CASE WHEN cost_price > 0 AND sale_price > 0 THEN 1 ELSE 0 END) AS records_with_pricing,
  SUM(CASE WHEN cost_price IS NULL OR cost_price = 0 THEN 1 ELSE 0 END) AS records_without_pricing
FROM sms_records
WHERE status = 'success';

-- -------------------------------------------------------------------
-- 4. 查看按国家统计的定价情况
-- -------------------------------------------------------------------
SELECT 
  country,
  COUNT(*) AS total_records,
  SUM(CASE WHEN cost_price > 0 THEN 1 ELSE 0 END) AS with_cost_price,
  SUM(CASE WHEN sale_price > 0 THEN 1 ELSE 0 END) AS with_sale_price,
  AVG(cost_price) AS avg_cost_price,
  AVG(sale_price) AS avg_sale_price
FROM sms_records
WHERE status = 'success'
GROUP BY country
ORDER BY total_records DESC;

-- -------------------------------------------------------------------
-- 5. 查看最新的10条记录
-- -------------------------------------------------------------------
SELECT 
  id,
  phone_number,
  country,
  cost_price,
  sale_price,
  ROUND(sale_price - cost_price, 4) AS profit,
  status,
  sent_at
FROM sms_records
WHERE status = 'success'
  AND cost_price > 0
  AND sale_price > 0
ORDER BY id DESC
LIMIT 10;

-- -------------------------------------------------------------------
-- 完成提示
-- -------------------------------------------------------------------
SELECT '✅ 历史数据定价信息更新完成！' AS message;
