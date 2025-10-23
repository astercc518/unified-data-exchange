-- ============================================
-- 更新速率控制字段默认值
-- ============================================
-- 将默认值从 0 改为 1（开启）
-- 将每秒限制从 NULL 改为 100
-- 将最大并发数从 NULL 改为 1
-- ============================================

USE vue_admin;

-- 修改字段默认值
ALTER TABLE sms_channels 
  MODIFY COLUMN rate_limit_enabled TINYINT(1) DEFAULT 1 
    COMMENT '是否启用速率控制';

ALTER TABLE sms_channels 
  MODIFY COLUMN rate_limit_per_second INT DEFAULT 100 
    COMMENT '每秒最大请求数';

ALTER TABLE sms_channels 
  MODIFY COLUMN rate_limit_concurrent INT DEFAULT 1 
    COMMENT '最大并发请求数';

-- 验证修改结果
SELECT 
  COLUMN_NAME AS '字段名',
  COLUMN_TYPE AS '类型',
  COLUMN_DEFAULT AS '默认值',
  COLUMN_COMMENT AS '注释'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'vue_admin'
  AND TABLE_NAME = 'sms_channels'
  AND COLUMN_NAME LIKE 'rate_limit%'
ORDER BY ORDINAL_POSITION;

-- 显示成功消息
SELECT '✅ 速率控制字段默认值更新成功！' AS status;
SELECT '
新的默认值：
  - rate_limit_enabled:      1 (默认开启)
  - rate_limit_per_second:   100 (每秒100次)
  - rate_limit_per_minute:   NULL (不限制)
  - rate_limit_per_hour:     NULL (不限制)
  - rate_limit_concurrent:   1 (并发数1)
' AS '';
