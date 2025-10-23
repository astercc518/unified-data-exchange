-- 创建短信功能相关的数据库表
-- 数据库: vue_admin

USE vue_admin;

-- 1. 短信通道表
CREATE TABLE IF NOT EXISTS `sms_channels` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '通道ID',
  `channel_name` VARCHAR(100) NOT NULL COMMENT '通道名称',
  `country` VARCHAR(50) NOT NULL COMMENT '国家',
  `price_per_sms` DECIMAL(10,4) NOT NULL DEFAULT 0.0000 COMMENT '每条短信价格',
  `max_chars` INT(11) NOT NULL DEFAULT 160 COMMENT '最大字符数',
  `gateway_url` VARCHAR(255) DEFAULT NULL COMMENT '网关地址',
  `account` VARCHAR(100) DEFAULT NULL COMMENT '账号',
  `password` VARCHAR(255) DEFAULT NULL COMMENT '密码',
  `platform_type` VARCHAR(50) DEFAULT 'sms57' COMMENT '平台类型',
  `status` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '状态: 1=启用, 0=禁用',
  `created_at` DATETIME DEFAULT NULL COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  INDEX `idx_country` (`country`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='短信通道表';

-- 2. 短信任务表
CREATE TABLE IF NOT EXISTS `sms_tasks` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '任务ID',
  `customer_id` INT(11) NOT NULL COMMENT '客户ID',
  `channel_id` INT(11) NOT NULL COMMENT '通道ID',
  `task_name` VARCHAR(100) DEFAULT NULL COMMENT '任务名称',
  `content` TEXT NOT NULL COMMENT '短信内容',
  `phone_numbers` TEXT NOT NULL COMMENT '手机号码列表(JSON)',
  `total_numbers` INT(11) NOT NULL DEFAULT 0 COMMENT '号码总数',
  `char_count` INT(11) NOT NULL DEFAULT 0 COMMENT '字符数',
  `total_cost` DECIMAL(10,4) NOT NULL DEFAULT 0.0000 COMMENT '总费用',
  `sent_count` INT(11) NOT NULL DEFAULT 0 COMMENT '已发送数量',
  `success_count` INT(11) NOT NULL DEFAULT 0 COMMENT '成功数量',
  `failed_count` INT(11) NOT NULL DEFAULT 0 COMMENT '失败数量',
  `send_type` VARCHAR(20) NOT NULL DEFAULT 'immediate' COMMENT '发送方式: immediate=立即, scheduled=定时',
  `scheduled_at` DATETIME DEFAULT NULL COMMENT '定时发送时间',
  `status` VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '状态: pending=待发送, sending=发送中, completed=已完成, cancelled=已取消, failed=失败',
  `error_message` TEXT DEFAULT NULL COMMENT '错误信息',
  `created_at` DATETIME DEFAULT NULL COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  INDEX `idx_customer_id` (`customer_id`),
  INDEX `idx_channel_id` (`channel_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_send_type` (`send_type`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='短信任务表';

-- 3. 短信发送记录表
CREATE TABLE IF NOT EXISTS `sms_records` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `task_id` INT(11) NOT NULL COMMENT '任务ID',
  `customer_id` INT(11) NOT NULL COMMENT '客户ID',
  `channel_id` INT(11) NOT NULL COMMENT '通道ID',
  `phone_number` VARCHAR(20) NOT NULL COMMENT '手机号码',
  `content` TEXT NOT NULL COMMENT '短信内容',
  `char_count` INT(11) NOT NULL DEFAULT 0 COMMENT '字符数',
  `cost` DECIMAL(10,4) NOT NULL DEFAULT 0.0000 COMMENT '费用',
  `status` VARCHAR(20) NOT NULL DEFAULT 'sending' COMMENT '状态: sending=发送中, success=成功, failed=失败',
  `sent_at` DATETIME DEFAULT NULL COMMENT '发送时间',
  `delivered_at` DATETIME DEFAULT NULL COMMENT '送达时间',
  `error_message` TEXT DEFAULT NULL COMMENT '错误信息',
  `gateway_response` TEXT DEFAULT NULL COMMENT '网关响应',
  `created_at` DATETIME DEFAULT NULL COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  INDEX `idx_task_id` (`task_id`),
  INDEX `idx_customer_id` (`customer_id`),
  INDEX `idx_channel_id` (`channel_id`),
  INDEX `idx_phone_number` (`phone_number`),
  INDEX `idx_status` (`status`),
  INDEX `idx_sent_at` (`sent_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='短信发送记录表';

-- 4. 短信统计表
CREATE TABLE IF NOT EXISTS `sms_stats` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '统计ID',
  `customer_id` INT(11) NOT NULL COMMENT '客户ID',
  `date` DATE NOT NULL COMMENT '统计日期',
  `country` VARCHAR(50) NOT NULL COMMENT '国家',
  `total_sent` INT(11) NOT NULL DEFAULT 0 COMMENT '发送总量',
  `total_success` INT(11) NOT NULL DEFAULT 0 COMMENT '成功数量',
  `total_failed` INT(11) NOT NULL DEFAULT 0 COMMENT '失败数量',
  `total_cost` DECIMAL(10,4) NOT NULL DEFAULT 0.0000 COMMENT '总费用',
  `created_at` DATETIME DEFAULT NULL COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_customer_date_country` (`customer_id`, `date`, `country`),
  INDEX `idx_customer_id` (`customer_id`),
  INDEX `idx_date` (`date`),
  INDEX `idx_country` (`country`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='短信统计表';

-- 显示创建结果
SHOW TABLES LIKE 'sms_%';
