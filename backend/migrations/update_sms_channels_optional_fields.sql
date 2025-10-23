-- 更新短信通道表，将国家相关字段设置为可选
-- 这些字段已迁移到 sms_channel_countries 表进行多国家管理

-- 1. 修改字段为可选（允许NULL）
ALTER TABLE `sms_channels` 
  MODIFY COLUMN `country` VARCHAR(50) NULL COMMENT '国家（已废弃，使用sms_channel_countries表）',
  MODIFY COLUMN `country_code` VARCHAR(10) NULL COMMENT '国家代码（已废弃）',
  MODIFY COLUMN `price_per_sms` DECIMAL(10,4) NULL DEFAULT 0 COMMENT '每条短信价格（已废弃）',
  MODIFY COLUMN `max_chars` INT NULL DEFAULT 160 COMMENT '最大字符数（已废弃）',
  MODIFY COLUMN `platform_type` VARCHAR(50) NULL COMMENT '平台类型（已废弃，通道支持多国家）';

-- 2. 为现有数据添加说明（可选）
-- UPDATE `sms_channels` 
-- SET `channel_name` = CONCAT(`channel_name`, ' - ', `country`) 
-- WHERE `country` IS NOT NULL AND `channel_name` NOT LIKE '%-%';

-- 说明：
-- 1. 旧的通道记录仍然保留 country、price_per_sms 等字段的值，不会丢失数据
-- 2. 新创建的通道不需要填写这些字段
-- 3. 所有定价信息应该在 sms_channel_countries 表中配置
-- 4. 如果需要迁移现有通道的定价到新表，可以执行以下SQL：

/*
INSERT INTO `sms_channel_countries` 
  (`channel_id`, `country`, `country_code`, `cost_price`, `sale_price`, `max_chars`, `status`, `created_at`, `updated_at`)
SELECT 
  `id` as `channel_id`,
  `country`,
  `country_code`,
  `price_per_sms` * 0.8 as `cost_price`, -- 假设成本价是销售价的80%，请根据实际情况调整
  `price_per_sms` as `sale_price`,
  `max_chars`,
  `status`,
  NOW() as `created_at`,
  NOW() as `updated_at`
FROM `sms_channels`
WHERE `country` IS NOT NULL 
  AND NOT EXISTS (
    SELECT 1 FROM `sms_channel_countries` 
    WHERE `channel_id` = `sms_channels`.`id` 
      AND `country` = `sms_channels`.`country`
  );
*/
