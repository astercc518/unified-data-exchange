-- ===================================================================
-- 短信结算系统重构 - 数据库迁移脚本
-- 执行时间: 2025-10-22
-- 说明: 创建代理结算和通道结算相关表
-- ===================================================================

USE vue_admin;

-- -------------------------------------------------------------------
-- 1. 代理月度结算表
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sms_agent_settlements` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `settlement_month` VARCHAR(7) NOT NULL COMMENT '结算月份 YYYY-MM',
  `agent_id` INT(11) NOT NULL COMMENT '代理ID',
  
  -- 提交统计（按提交计费）
  `total_submitted` INT(11) NOT NULL DEFAULT 0 COMMENT '总提交数（含成功和失败）',
  `total_success` INT(11) NOT NULL DEFAULT 0 COMMENT '成功数',
  `total_failed` INT(11) NOT NULL DEFAULT 0 COMMENT '失败数',
  `success_rate` DECIMAL(5,2) DEFAULT 0 COMMENT '成功率 %',
  
  -- 财务统计
  `total_revenue` DECIMAL(15,4) NOT NULL DEFAULT 0 COMMENT '总销售额（客户支付）',
  `total_cost` DECIMAL(15,4) NOT NULL DEFAULT 0 COMMENT '总成本（通道费用）',
  `total_profit` DECIMAL(15,4) NOT NULL DEFAULT 0 COMMENT '总利润',
  `profit_rate` DECIMAL(5,2) DEFAULT 0 COMMENT '利润率 %',
  
  -- 代理佣金
  `agent_commission_rate` DECIMAL(5,2) DEFAULT 0 COMMENT '代理佣金比例 %',
  `agent_commission` DECIMAL(15,4) DEFAULT 0 COMMENT '代理佣金金额',
  
  -- 客户统计
  `customer_count` INT(11) DEFAULT 0 COMMENT '活跃客户数',
  
  -- 结算状态
  `settlement_status` ENUM('pending','processing','completed','paid','cancelled') DEFAULT 'pending' COMMENT '结算状态',
  `settlement_date` DATE COMMENT '结算日期',
  `payment_date` DATE COMMENT '支付日期',
  `remark` TEXT COMMENT '备注',
  
  -- 时间戳
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_agent_month` (`agent_id`, `settlement_month`),
  KEY `idx_settlement_month` (`settlement_month`),
  KEY `idx_agent_id` (`agent_id`),
  KEY `idx_status` (`settlement_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='代理月度结算表';

-- -------------------------------------------------------------------
-- 2. 代理结算明细表
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sms_agent_settlement_details` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `settlement_id` INT(11) NOT NULL COMMENT '代理结算ID',
  `customer_id` INT(11) NOT NULL COMMENT '客户ID',
  `customer_name` VARCHAR(100) COMMENT '客户名称',
  
  -- 提交统计
  `submitted_count` INT(11) NOT NULL DEFAULT 0 COMMENT '提交数',
  `success_count` INT(11) NOT NULL DEFAULT 0 COMMENT '成功数',
  `failed_count` INT(11) NOT NULL DEFAULT 0 COMMENT '失败数',
  
  -- 财务数据
  `revenue` DECIMAL(15,4) NOT NULL DEFAULT 0 COMMENT '销售额',
  `cost` DECIMAL(15,4) NOT NULL DEFAULT 0 COMMENT '成本',
  `profit` DECIMAL(15,4) NOT NULL DEFAULT 0 COMMENT '利润',
  
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_settlement_id` (`settlement_id`),
  KEY `idx_customer_id` (`customer_id`),
  CONSTRAINT `fk_agent_settlement_details` 
    FOREIGN KEY (`settlement_id`) REFERENCES `sms_agent_settlements`(`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='代理结算明细表';

-- -------------------------------------------------------------------
-- 3. 通道月度结算表
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sms_channel_settlements` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `settlement_month` VARCHAR(7) NOT NULL COMMENT '结算月份 YYYY-MM',
  `channel_id` INT(11) NOT NULL COMMENT '通道ID',
  `country` VARCHAR(50) DEFAULT NULL COMMENT '国家（可选，按国家细分）',
  
  -- 发送统计（只统计成功的）
  `total_success` INT(11) NOT NULL DEFAULT 0 COMMENT '成功发送数',
  `total_submitted` INT(11) NOT NULL DEFAULT 0 COMMENT '总提交数',
  `success_rate` DECIMAL(5,2) DEFAULT 0 COMMENT '成功率 %',
  
  -- 成本统计
  `total_cost` DECIMAL(15,4) NOT NULL DEFAULT 0 COMMENT '总成本',
  `avg_cost_price` DECIMAL(10,4) DEFAULT 0 COMMENT '平均成本单价',
  
  -- 结算状态
  `settlement_status` ENUM('pending','processing','completed','paid','cancelled') DEFAULT 'pending' COMMENT '结算状态',
  `settlement_date` DATE COMMENT '结算日期',
  `payment_date` DATE COMMENT '支付日期',
  `remark` TEXT COMMENT '备注',
  
  -- 时间戳
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_channel_month_country` (`channel_id`, `settlement_month`, `country`),
  KEY `idx_settlement_month` (`settlement_month`),
  KEY `idx_channel_id` (`channel_id`),
  KEY `idx_country` (`country`),
  KEY `idx_status` (`settlement_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通道月度结算表';

-- -------------------------------------------------------------------
-- 4. 通道结算明细表
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sms_channel_settlement_details` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `settlement_id` INT(11) NOT NULL COMMENT '通道结算ID',
  `record_id` INT(11) NOT NULL COMMENT '发送记录ID',
  `phone_number` VARCHAR(20) COMMENT '手机号',
  `country` VARCHAR(50) COMMENT '国家',
  `cost_price` DECIMAL(10,4) DEFAULT 0 COMMENT '成本价',
  `sent_at` DATETIME COMMENT '发送时间',
  
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_settlement_id` (`settlement_id`),
  KEY `idx_record_id` (`record_id`),
  CONSTRAINT `fk_channel_settlement_details` 
    FOREIGN KEY (`settlement_id`) REFERENCES `sms_channel_settlements`(`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通道结算明细表';

-- -------------------------------------------------------------------
-- 5. 验证创建结果
-- -------------------------------------------------------------------

SELECT 
  'sms_agent_settlements' AS table_name,
  COUNT(*) AS row_count
FROM sms_agent_settlements

UNION ALL

SELECT 
  'sms_agent_settlement_details' AS table_name,
  COUNT(*) AS row_count
FROM sms_agent_settlement_details

UNION ALL

SELECT 
  'sms_channel_settlements' AS table_name,
  COUNT(*) AS row_count
FROM sms_channel_settlements

UNION ALL

SELECT 
  'sms_channel_settlement_details' AS table_name,
  COUNT(*) AS row_count
FROM sms_channel_settlement_details;

-- -------------------------------------------------------------------
-- 完成提示
-- -------------------------------------------------------------------
SELECT '✅ 新结算系统数据库迁移完成！' AS message;
SELECT '📊 已创建4个新表：' AS info;
SELECT '   - sms_agent_settlements (代理月度结算表)' AS info;
SELECT '   - sms_agent_settlement_details (代理结算明细表)' AS info;
SELECT '   - sms_channel_settlements (通道月度结算表)' AS info;
SELECT '   - sms_channel_settlement_details (通道结算明细表)' AS info;
SELECT '🎯 代理结算：按提交计费，按月结算' AS info;
SELECT '🎯 通道结算：按成功计费，按月结算' AS info;
