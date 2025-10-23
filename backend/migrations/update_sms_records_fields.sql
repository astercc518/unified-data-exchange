-- 更新短信记录表，添加缺失字段并调整字段名称以匹配模型定义
-- 执行时间：2025-10-22

USE vue_admin;

-- 1. 添加缺失的字段
ALTER TABLE `sms_records` 
  ADD COLUMN IF NOT EXISTS `retry_count` INT NOT NULL DEFAULT 0 COMMENT '重试次数' AFTER `error_message`,
  ADD COLUMN IF NOT EXISTS `message_id` VARCHAR(100) NULL COMMENT '第三方消息ID' AFTER `cost`,
  ADD COLUMN IF NOT EXISTS `response_code` VARCHAR(50) NULL COMMENT '响应码' AFTER `message_id`,
  ADD COLUMN IF NOT EXISTS `response_message` TEXT NULL COMMENT '响应消息' AFTER `response_code`,
  ADD COLUMN IF NOT EXISTS `send_time` DATETIME NULL COMMENT '发送时间' AFTER `response_message`,
  ADD COLUMN IF NOT EXISTS `delivery_time` DATETIME NULL COMMENT '送达时间' AFTER `send_time`;

-- 2. 如果 sent_at 字段存在且 send_time 不存在数据，则复制数据
UPDATE `sms_records` 
SET `send_time` = `sent_at` 
WHERE `send_time` IS NULL AND `sent_at` IS NOT NULL;

-- 3. 如果 delivered_at 字段存在且 delivery_time 不存在数据，则复制数据
UPDATE `sms_records` 
SET `delivery_time` = `delivered_at` 
WHERE `delivery_time` IS NULL AND `delivered_at` IS NOT NULL;

-- 4. 添加索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_retry_count ON `sms_records` (`retry_count`);
CREATE INDEX IF NOT EXISTS idx_message_id ON `sms_records` (`message_id`);

-- 5. 验证表结构
DESCRIBE `sms_records`;

-- 完成信息
SELECT '✅ sms_records 表字段更新完成' AS status;
SELECT COUNT(*) AS total_records FROM `sms_records`;
