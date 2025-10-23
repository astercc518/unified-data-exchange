-- ============================================
-- 添加通道速率控制字段
-- ============================================
-- 
-- 使用方法：
-- mysql -u root -p sms_system < add-rate-limit-fields.sql
--
-- ============================================

USE sms_system;

-- 添加速率控制相关字段
ALTER TABLE sms_channels 
  ADD COLUMN rate_limit_enabled TINYINT(1) DEFAULT 1 COMMENT '是否启用速率控制' AFTER daily_limit,
  ADD COLUMN rate_limit_per_second INT DEFAULT 100 COMMENT '每秒最大请求数' AFTER rate_limit_enabled,
  ADD COLUMN rate_limit_per_minute INT DEFAULT NULL COMMENT '每分钟最大请求数' AFTER rate_limit_per_second,
  ADD COLUMN rate_limit_per_hour INT DEFAULT NULL COMMENT '每小时最大请求数' AFTER rate_limit_per_minute,
  ADD COLUMN rate_limit_concurrent INT DEFAULT 1 COMMENT '最大并发请求数' AFTER rate_limit_per_hour;

-- 验证字段是否添加成功
SELECT 
  COLUMN_NAME,
  COLUMN_TYPE,
  COLUMN_DEFAULT,
  COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'sms_system'
  AND TABLE_NAME = 'sms_channels'
  AND COLUMN_NAME LIKE 'rate_limit%'
ORDER BY ORDINAL_POSITION;

-- 显示结果
SELECT '✅ 速率控制字段添加成功！' AS status;

SELECT '
字段说明：
┌─────────────────────────────────────────────┐
│ rate_limit_enabled      - 是否启用速率控制  │
│ rate_limit_per_second   - 每秒最大请求数    │
│ rate_limit_per_minute   - 每分钟最大请求数  │
│ rate_limit_per_hour     - 每小时最大请求数  │
│ rate_limit_concurrent   - 最大并发请求数    │
└─────────────────────────────────────────────┘
' AS '';
