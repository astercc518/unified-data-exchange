-- ===================================================================
-- 短信多国家定价和结算系统 - 数据库迁移脚本
-- 执行时间: 2025-10-21
-- 说明: 创建通道国家定价表、结算表，并修改sms_records表
-- ===================================================================

USE vue_admin;

-- -------------------------------------------------------------------
-- 1. 创建通道国家定价表
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sms_channel_countries` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `channel_id` INT(11) NOT NULL COMMENT '通道ID',
  `country` VARCHAR(50) NOT NULL COMMENT '国家名称',
  `country_code` VARCHAR(10) NOT NULL COMMENT '国家代码',
  `cost_price` DECIMAL(10,4) NOT NULL DEFAULT 0 COMMENT '成本价/条',
  `sale_price` DECIMAL(10,4) NOT NULL DEFAULT 0 COMMENT '销售价/条',
  `max_chars` INT(11) NOT NULL DEFAULT 160 COMMENT '最大字符数',
  `status` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '状态 1启用 0禁用',
  `created_at` DATETIME DEFAULT NULL,
  `updated_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_channel_country` (`channel_id`, `country`),
  KEY `idx_channel_id` (`channel_id`),
  KEY `idx_country` (`country`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通道国家定价配置表';

-- -------------------------------------------------------------------
-- 2. 创建短信结算汇总表
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sms_settlements` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `settlement_date` DATE NOT NULL COMMENT '结算日期',
  `customer_id` INT(11) NOT NULL COMMENT '客户ID',
  `channel_id` INT(11) NOT NULL COMMENT '通道ID',
  `country` VARCHAR(50) NOT NULL COMMENT '国家',
  `total_count` INT(11) NOT NULL DEFAULT 0 COMMENT '总发送数',
  `success_count` INT(11) NOT NULL DEFAULT 0 COMMENT '成功数量',
  `total_cost` DECIMAL(12,4) NOT NULL DEFAULT 0 COMMENT '总成本',
  `total_revenue` DECIMAL(12,4) NOT NULL DEFAULT 0 COMMENT '总销售额',
  `total_profit` DECIMAL(12,4) NOT NULL DEFAULT 0 COMMENT '总利润',
  `cost_price` DECIMAL(10,4) NOT NULL DEFAULT 0 COMMENT '成本价/条',
  `sale_price` DECIMAL(10,4) NOT NULL DEFAULT 0 COMMENT '销售价/条',
  `settlement_status` ENUM('pending','processing','completed','failed') DEFAULT 'pending' COMMENT '结算状态',
  `created_at` DATETIME DEFAULT NULL,
  `updated_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_settlement` (`settlement_date`, `customer_id`, `channel_id`, `country`),
  KEY `idx_settlement_date` (`settlement_date`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_channel_id` (`channel_id`),
  KEY `idx_country` (`country`),
  KEY `idx_status` (`settlement_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='短信结算汇总表';

-- -------------------------------------------------------------------
-- 3. 创建结算明细表
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sms_settlement_details` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `settlement_id` INT(11) NOT NULL COMMENT '结算ID',
  `record_id` INT(11) NOT NULL COMMENT '发送记录ID',
  `phone_number` VARCHAR(20) NOT NULL COMMENT '手机号码',
  `sms_content` TEXT COMMENT '短信内容',
  `cost_price` DECIMAL(10,4) NOT NULL DEFAULT 0 COMMENT '成本价',
  `sale_price` DECIMAL(10,4) NOT NULL DEFAULT 0 COMMENT '销售价',
  `profit` DECIMAL(10,4) NOT NULL DEFAULT 0 COMMENT '利润',
  `sent_at` DATETIME DEFAULT NULL COMMENT '发送时间',
  `created_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_settlement_id` (`settlement_id`),
  KEY `idx_record_id` (`record_id`),
  CONSTRAINT `fk_settlement_details_settlement` 
    FOREIGN KEY (`settlement_id`) REFERENCES `sms_settlements`(`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='结算明细表';

-- -------------------------------------------------------------------
-- 4. 修改sms_records表，添加定价字段
-- -------------------------------------------------------------------

-- 检查字段是否存在，如果不存在则添加
SET @exist_cost_price := (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'vue_admin' 
    AND TABLE_NAME = 'sms_records' 
    AND COLUMN_NAME = 'cost_price'
);

SET @exist_sale_price := (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'vue_admin' 
    AND TABLE_NAME = 'sms_records' 
    AND COLUMN_NAME = 'sale_price'
);

SET @exist_country := (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'vue_admin' 
    AND TABLE_NAME = 'sms_records' 
    AND COLUMN_NAME = 'country'
);

-- 添加 cost_price 字段
SET @sql_cost_price = IF(@exist_cost_price = 0,
  'ALTER TABLE `sms_records` ADD COLUMN `cost_price` DECIMAL(10,4) DEFAULT 0 COMMENT ''成本价/条''',
  'SELECT ''cost_price column already exists'' AS message'
);
PREPARE stmt FROM @sql_cost_price;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 添加 sale_price 字段
SET @sql_sale_price = IF(@exist_sale_price = 0,
  'ALTER TABLE `sms_records` ADD COLUMN `sale_price` DECIMAL(10,4) DEFAULT 0 COMMENT ''销售价/条''',
  'SELECT ''sale_price column already exists'' AS message'
);
PREPARE stmt FROM @sql_sale_price;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 添加 country 字段
SET @sql_country = IF(@exist_country = 0,
  'ALTER TABLE `sms_records` ADD COLUMN `country` VARCHAR(50) COMMENT ''国家''',
  'SELECT ''country column already exists'' AS message'
);
PREPARE stmt FROM @sql_country;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- -------------------------------------------------------------------
-- 5. 插入示例数据（可选）
-- -------------------------------------------------------------------

-- 示例：为现有通道添加一些国家定价配置
-- 注意：需要根据实际的 sms_channels 表数据调整

-- INSERT INTO `sms_channel_countries` 
--   (`channel_id`, `country`, `country_code`, `cost_price`, `sale_price`, `max_chars`, `status`, `created_at`, `updated_at`) 
-- VALUES
--   (1, 'United States', '1', 0.0075, 0.0100, 160, 1, NOW(), NOW()),
--   (1, 'China', '86', 0.0050, 0.0080, 70, 1, NOW(), NOW()),
--   (2, 'United Kingdom', '44', 0.0080, 0.0120, 160, 1, NOW(), NOW());

-- -------------------------------------------------------------------
-- 6. 验证创建结果
-- -------------------------------------------------------------------

SELECT 
  'sms_channel_countries' AS table_name,
  COUNT(*) AS row_count
FROM sms_channel_countries

UNION ALL

SELECT 
  'sms_settlements' AS table_name,
  COUNT(*) AS row_count
FROM sms_settlements

UNION ALL

SELECT 
  'sms_settlement_details' AS table_name,
  COUNT(*) AS row_count
FROM sms_settlement_details;

-- 显示新添加的字段
SHOW COLUMNS FROM sms_records WHERE Field IN ('cost_price', 'sale_price', 'country');

-- -------------------------------------------------------------------
-- 完成提示
-- -------------------------------------------------------------------
SELECT '✅ 数据库迁移完成！' AS message;
SELECT '📊 已创建3个新表：sms_channel_countries, sms_settlements, sms_settlement_details' AS info;
SELECT '🔧 已修改sms_records表，添加cost_price, sale_price, country字段' AS info;
