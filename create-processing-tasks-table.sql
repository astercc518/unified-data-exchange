-- 创建数据处理任务表
USE vue_admin;

CREATE TABLE IF NOT EXISTS `data_processing_tasks` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '任务ID',
  `customer_id` INT(11) NOT NULL COMMENT '客户ID',
  `customer_name` VARCHAR(100) DEFAULT NULL COMMENT '客户名称',
  `task_type` VARCHAR(50) NOT NULL COMMENT '任务类型: add_code, remove_code, deduplicate, generate, merge, split',
  `task_name` VARCHAR(200) DEFAULT NULL COMMENT '任务名称',
  `input_file_id` INT(11) DEFAULT NULL COMMENT '输入文件ID',
  `input_file_name` VARCHAR(255) DEFAULT NULL COMMENT '输入文件名',
  `output_file_id` INT(11) DEFAULT NULL COMMENT '输出文件ID',
  `output_file_name` VARCHAR(255) DEFAULT NULL COMMENT '输出文件名',
  `total_records` INT(11) DEFAULT 0 COMMENT '总记录数',
  `processed_records` INT(11) DEFAULT 0 COMMENT '已处理记录数',
  `success_records` INT(11) DEFAULT 0 COMMENT '成功记录数',
  `failed_records` INT(11) DEFAULT 0 COMMENT '失败记录数',
  `status` VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '状态: pending, processing, completed, failed, cancelled',
  `progress` DECIMAL(5,2) DEFAULT 0.00 COMMENT '进度百分比',
  `params` TEXT DEFAULT NULL COMMENT '任务参数(JSON)',
  `error_message` TEXT DEFAULT NULL COMMENT '错误信息',
  `started_at` DATETIME DEFAULT NULL COMMENT '开始时间',
  `completed_at` DATETIME DEFAULT NULL COMMENT '完成时间',
  `created_at` DATETIME DEFAULT NULL COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  INDEX `idx_customer_id` (`customer_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数据处理任务表';

-- 显示创建结果
SHOW TABLES LIKE 'data_processing_tasks';
DESC data_processing_tasks;
