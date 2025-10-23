-- ============================================
-- 速率控制字段迁移 - 简化版
-- ============================================
-- 执行方法：
--   mysql -u root -p sms_system < 迁移速率控制字段-简化版.sql
-- ============================================

USE sms_system;

-- 添加速率控制字段（新的默认值）
ALTER TABLE sms_channels 
  ADD COLUMN rate_limit_enabled TINYINT(1) DEFAULT 1 
    COMMENT '是否启用速率控制' AFTER daily_limit,
  ADD COLUMN rate_limit_per_second INT DEFAULT 100 
    COMMENT '每秒最大请求数' AFTER rate_limit_enabled,
  ADD COLUMN rate_limit_per_minute INT DEFAULT NULL 
    COMMENT '每分钟最大请求数' AFTER rate_limit_per_second,
  ADD COLUMN rate_limit_per_hour INT DEFAULT NULL 
    COMMENT '每小时最大请求数' AFTER rate_limit_per_minute,
  ADD COLUMN rate_limit_concurrent INT DEFAULT 1 
    COMMENT '最大并发请求数' AFTER rate_limit_per_hour;

-- 显示结果
SELECT '✅ 速率控制字段添加成功！' AS status;

-- 显示新添加的字段
SELECT 
  COLUMN_NAME AS '字段名',
  COLUMN_TYPE AS '类型',
  COLUMN_DEFAULT AS '默认值',
  COLUMN_COMMENT AS '注释'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'sms_system'
  AND TABLE_NAME = 'sms_channels'
  AND COLUMN_NAME LIKE 'rate_limit%'
ORDER BY ORDINAL_POSITION;
