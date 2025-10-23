-- Vue Element Admin 数据库结构
-- MariaDB 5.5 兼容版本

-- 用户表
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `login_account` VARCHAR(50) NOT NULL UNIQUE COMMENT '登录账号',
  `login_password` VARCHAR(100) NOT NULL COMMENT '登录密码',
  `customer_name` VARCHAR(100) NOT NULL COMMENT '客户姓名',
  `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  `account_balance` DECIMAL(10,2) DEFAULT 0.00 COMMENT '账户余额',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `user_type` VARCHAR(20) DEFAULT 'user' COMMENT '用户类型：admin/agent/user',
  `create_time` BIGINT NOT NULL COMMENT '创建时间（时间戳）',
  `update_time` BIGINT DEFAULT NULL COMMENT '更新时间（时间戳）',
  INDEX `idx_login_account` (`login_account`),
  INDEX `idx_status` (`status`),
  INDEX `idx_user_type` (`user_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 代理商表
CREATE TABLE IF NOT EXISTS `agents` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `agent_name` VARCHAR(100) NOT NULL COMMENT '代理商名称',
  `contact_person` VARCHAR(50) DEFAULT NULL COMMENT '联系人',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '联系电话',
  `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
  `address` VARCHAR(200) DEFAULT NULL COMMENT '地址',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `create_time` BIGINT NOT NULL COMMENT '创建时间（时间戳）',
  `update_time` BIGINT DEFAULT NULL COMMENT '更新时间（时间戳）',
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='代理商表';

-- 数据库表
CREATE TABLE IF NOT EXISTS `data_library` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL COMMENT '数据库名称',
  `type` VARCHAR(50) DEFAULT NULL COMMENT '数据库类型',
  `description` TEXT COMMENT '描述',
  `record_count` INT DEFAULT 0 COMMENT '记录数',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `create_time` BIGINT NOT NULL COMMENT '创建时间（时间戳）',
  `update_time` BIGINT DEFAULT NULL COMMENT '更新时间（时间戳）',
  INDEX `idx_type` (`type`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数据库表';

-- 订单表
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_no` VARCHAR(50) NOT NULL UNIQUE COMMENT '订单号',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `product_name` VARCHAR(100) DEFAULT NULL COMMENT '产品名称',
  `amount` DECIMAL(10,2) DEFAULT 0.00 COMMENT '订单金额',
  `status` VARCHAR(20) DEFAULT 'pending' COMMENT '订单状态：pending/completed/cancelled',
  `create_time` BIGINT NOT NULL COMMENT '创建时间（时间戳）',
  `update_time` BIGINT DEFAULT NULL COMMENT '更新时间（时间戳）',
  INDEX `idx_order_no` (`order_no`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- 充值记录表
CREATE TABLE IF NOT EXISTS `recharge_records` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL COMMENT '用户ID',
  `amount` DECIMAL(10,2) NOT NULL COMMENT '充值金额',
  `payment_method` VARCHAR(50) DEFAULT NULL COMMENT '支付方式',
  `status` VARCHAR(20) DEFAULT 'pending' COMMENT '状态：pending/success/failed',
  `transaction_no` VARCHAR(100) DEFAULT NULL COMMENT '交易号',
  `create_time` BIGINT NOT NULL COMMENT '创建时间（时间戳）',
  `update_time` BIGINT DEFAULT NULL COMMENT '更新时间（时间戳）',
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='充值记录表';

-- 反馈表
CREATE TABLE IF NOT EXISTS `feedbacks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL COMMENT '用户ID',
  `title` VARCHAR(200) DEFAULT NULL COMMENT '反馈标题',
  `content` TEXT COMMENT '反馈内容',
  `type` VARCHAR(50) DEFAULT NULL COMMENT '反馈类型',
  `status` VARCHAR(20) DEFAULT 'pending' COMMENT '状态：pending/processing/resolved',
  `reply` TEXT COMMENT '回复内容',
  `create_time` BIGINT NOT NULL COMMENT '创建时间（时间戳）',
  `update_time` BIGINT DEFAULT NULL COMMENT '更新时间（时间戳）',
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='反馈表';

-- 插入默认管理员账号
INSERT INTO `users` 
  (`login_account`, `login_password`, `customer_name`, `email`, `account_balance`, `status`, `user_type`, `create_time`)
VALUES 
  ('admin', '111111', '系统管理员', 'admin@system.com', 10000.00, 1, 'admin', UNIX_TIMESTAMP() * 1000)
ON DUPLICATE KEY UPDATE 
  `login_password` = '111111';

-- Vue Element Admin 数据库设计方案
-- 将localStorage数据永久存储到数据库

-- ========================================
-- 1. 客户列表表 (userList -> users)
-- ========================================
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '客户ID',
  `login_account` varchar(50) NOT NULL COMMENT '登录账号',
  `login_password` varchar(255) NOT NULL COMMENT '登录密码',
  `customer_name` varchar(100) NOT NULL COMMENT '客户名称',
  `email` varchar(100) NOT NULL COMMENT '邮箱地址',
  `agent_id` int(11) DEFAULT NULL COMMENT '所属代理ID',
  `agent_name` varchar(100) DEFAULT NULL COMMENT '所属代理名称',
  `sale_price_rate` decimal(5,2) DEFAULT 1.00 COMMENT '销售价比例',
  `account_balance` decimal(15,5) DEFAULT 0.00000 COMMENT '账户余额',
  `overdraft_amount` decimal(15,5) DEFAULT 0.00000 COMMENT '透支金额',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态：1-激活，0-停用',
  `create_time` bigint(13) NOT NULL COMMENT '创建时间戳',
  `update_time` bigint(13) DEFAULT NULL COMMENT '更新时间戳',
  `remark` text COMMENT '备注',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_login_account` (`login_account`),
  KEY `idx_agent_id` (`agent_id`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='客户列表表';

-- ========================================
-- 2. 代理列表表 (agentList -> agents)
-- ========================================
CREATE TABLE `agents` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '代理ID',
  `agent_name` varchar(100) NOT NULL COMMENT '代理名称',
  `login_account` varchar(50) NOT NULL COMMENT '代理登录账号',
  `login_password` varchar(255) NOT NULL COMMENT '代理登录密码',
  `agent_code` varchar(50) DEFAULT NULL COMMENT '代理编码',
  `parent_agent_id` int(11) DEFAULT NULL COMMENT '上级代理ID',
  `level` varchar(20) DEFAULT NULL COMMENT '代理级别',
  `commission` decimal(5,2) DEFAULT 0.00 COMMENT '佣金比例',
  `region` varchar(100) DEFAULT NULL COMMENT '所在地区',
  `email` varchar(100) DEFAULT NULL COMMENT '邮箱地址',
  `bind_users` int(11) DEFAULT 0 COMMENT '绑定客户数',
  `total_commission` decimal(15,2) DEFAULT 0.00 COMMENT '总佣金',
  `monthly_commission` decimal(15,2) DEFAULT 0.00 COMMENT '月佣金',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态：1-激活，0-停用',
  `create_time` bigint(13) NOT NULL COMMENT '创建时间戳',
  `update_time` bigint(13) DEFAULT NULL COMMENT '更新时间戳',
  `remark` text COMMENT '备注',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_login_account` (`login_account`),
  UNIQUE KEY `uk_agent_code` (`agent_code`),
  KEY `idx_parent_agent_id` (`parent_agent_id`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='代理列表表';

-- ========================================
-- 3. 数据列表表 (dataLibrary -> data_library)
-- ========================================
CREATE TABLE `data_library` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '数据ID',
  `country` varchar(10) NOT NULL COMMENT '国家代码',
  `country_name` varchar(50) NOT NULL COMMENT '国家名称',
  `validity` varchar(20) NOT NULL COMMENT '时效性分类',
  `validity_name` varchar(50) NOT NULL COMMENT '时效性名称',
  `total_quantity` int(11) NOT NULL DEFAULT 0 COMMENT '总数量',
  `available_quantity` int(11) NOT NULL DEFAULT 0 COMMENT '可用数量',
  `operators` json DEFAULT NULL COMMENT '运营商分配情况(JSON)',
  `upload_time` bigint(13) NOT NULL COMMENT '上传时间戳',
  `upload_by` varchar(50) DEFAULT NULL COMMENT '上传人账号',
  `status` varchar(20) DEFAULT 'available' COMMENT '状态：available-可用，sold_out-售罄',
  `create_time` bigint(13) NOT NULL COMMENT '创建时间戳',
  `update_time` bigint(13) DEFAULT NULL COMMENT '更新时间戳',
  PRIMARY KEY (`id`),
  KEY `idx_country` (`country`),
  KEY `idx_validity` (`validity`),
  KEY `idx_status` (`status`),
  KEY `idx_upload_time` (`upload_time`),
  KEY `idx_upload_by` (`upload_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数据列表表';

-- ========================================
-- 4. 订单列表表 (orderList -> orders)
-- ========================================
CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '订单ID',
  `order_number` varchar(50) NOT NULL COMMENT '订单编号',
  `customer_id` int(11) NOT NULL COMMENT '客户ID',
  `customer_name` varchar(100) NOT NULL COMMENT '客户名称',
  `data_id` int(11) NOT NULL COMMENT '数据ID',
  `country` varchar(10) NOT NULL COMMENT '国家代码',
  `country_name` varchar(50) NOT NULL COMMENT '国家名称',
  `validity` varchar(20) NOT NULL COMMENT '时效性分类',
  `validity_name` varchar(50) NOT NULL COMMENT '时效性名称',
  `operators` json DEFAULT NULL COMMENT '选择的运营商(JSON)',
  `quantity` int(11) NOT NULL DEFAULT 0 COMMENT '购买数量',
  `unit_price` decimal(10,5) NOT NULL DEFAULT 0.00000 COMMENT '单价',
  `total_amount` decimal(15,2) NOT NULL DEFAULT 0.00 COMMENT '总金额',
  `status` varchar(20) DEFAULT 'pending' COMMENT '状态：pending-待处理，processing-处理中，completed-已完成，cancelled-已取消',
  `order_time` bigint(13) NOT NULL COMMENT '下单时间戳',
  `delivery_time` bigint(13) DEFAULT NULL COMMENT '发货时间戳',
  `complete_time` bigint(13) DEFAULT NULL COMMENT '完成时间戳',
  `remark` text COMMENT '备注',
  `create_time` bigint(13) NOT NULL COMMENT '创建时间戳',
  `update_time` bigint(13) DEFAULT NULL COMMENT '更新时间戳',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_number` (`order_number`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_data_id` (`data_id`),
  KEY `idx_country` (`country`),
  KEY `idx_status` (`status`),
  KEY `idx_order_time` (`order_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单列表表';

-- ========================================
-- 5. 充值记录表 (rechargeRecords -> recharge_records)
-- ========================================
CREATE TABLE `recharge_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '充值记录ID',
  `customer_id` int(11) NOT NULL COMMENT '客户ID',
  `customer_name` varchar(100) NOT NULL COMMENT '客户名称',
  `type` varchar(20) NOT NULL DEFAULT 'customer' COMMENT '类型：customer-客户，agent-代理',
  `amount` decimal(15,5) NOT NULL DEFAULT 0.00000 COMMENT '充值金额',
  `method` varchar(20) NOT NULL DEFAULT 'system' COMMENT '充值方式：system-系统充值，initial-初始金额，manual-手动充值',
  `status` varchar(20) DEFAULT 'success' COMMENT '状态：pending-待处理，success-成功，failed-失败',
  `create_time` bigint(13) NOT NULL COMMENT '充值时间戳',
  `remark` text COMMENT '备注',
  PRIMARY KEY (`id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_type` (`type`),
  KEY `idx_method` (`method`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='充值记录表';

-- ========================================
-- 6. 反馈记录表 (feedbackList -> feedbacks)
-- ========================================
CREATE TABLE `feedbacks` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '反馈ID',
  `customer_id` int(11) NOT NULL COMMENT '客户ID',
  `customer_name` varchar(100) NOT NULL COMMENT '客户名称',
  `order_id` int(11) DEFAULT NULL COMMENT '关联订单ID',
  `feedback_type` varchar(50) NOT NULL COMMENT '反馈类型',
  `title` varchar(200) NOT NULL COMMENT '反馈标题',
  `content` text NOT NULL COMMENT '反馈内容',
  `status` varchar(20) DEFAULT 'pending' COMMENT '状态：pending-待处理，processing-处理中，resolved-已解决',
  `priority` varchar(20) DEFAULT 'normal' COMMENT '优先级：low-低，normal-普通，high-高，urgent-紧急',
  `create_time` bigint(13) NOT NULL COMMENT '创建时间戳',
  `update_time` bigint(13) DEFAULT NULL COMMENT '更新时间戳',
  `resolve_time` bigint(13) DEFAULT NULL COMMENT '解决时间戳',
  `admin_reply` text COMMENT '管理员回复',
  `remark` text COMMENT '备注',
  PRIMARY KEY (`id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='反馈记录表';

-- ========================================
-- 索引优化
-- ========================================

-- 用户表复合索引
ALTER TABLE `users` ADD INDEX `idx_agent_status` (`agent_id`, `status`);
ALTER TABLE `users` ADD INDEX `idx_status_create_time` (`status`, `create_time`);

-- 代理表复合索引
ALTER TABLE `agents` ADD INDEX `idx_status_create_time` (`status`, `create_time`);

-- 数据库表复合索引
ALTER TABLE `data_library` ADD INDEX `idx_country_validity` (`country`, `validity`);
ALTER TABLE `data_library` ADD INDEX `idx_status_upload_time` (`status`, `upload_time`);

-- 订单表复合索引
ALTER TABLE `orders` ADD INDEX `idx_customer_status` (`customer_id`, `status`);
ALTER TABLE `orders` ADD INDEX `idx_status_order_time` (`status`, `order_time`);

-- 充值记录表复合索引
ALTER TABLE `recharge_records` ADD INDEX `idx_customer_type` (`customer_id`, `type`);
ALTER TABLE `recharge_records` ADD INDEX `idx_status_create_time` (`status`, `create_time`);

-- ========================================
-- 初始化数据
-- ========================================

-- 插入默认代理
INSERT INTO `agents` (`id`, `agent_name`, `login_account`, `login_password`, `agent_code`, `level`, `commission`, `region`, `email`, `status`, `create_time`) VALUES
(1, '默认代理', 'agent001', '123456', 'AGENT001', '一级代理', 10.00, '全国', 'agent001@example.com', 1, UNIX_TIMESTAMP(NOW()) * 1000);

-- 插入系统管理员（如果需要）
INSERT INTO `users` (`id`, `login_account`, `login_password`, `customer_name`, `email`, `agent_id`, `status`, `create_time`) VALUES
(1, 'admin', '111111', '系统管理员', 'admin@example.com', 1, 1, UNIX_TIMESTAMP(NOW()) * 1000);

-- ========================================
-- 视图定义
-- ========================================

-- 客户统计视图
CREATE VIEW `v_customer_stats` AS
SELECT 
    u.id,
    u.customer_name,
    u.login_account,
    u.account_balance,
    COALESCE(o.order_count, 0) AS total_orders,
    COALESCE(o.total_spent, 0) AS total_spent,
    COALESCE(r.total_recharged, 0) AS total_recharged
FROM users u
LEFT JOIN (
    SELECT 
        customer_id,
        COUNT(*) AS order_count,
        SUM(total_amount) AS total_spent
    FROM orders 
    WHERE status = 'completed'
    GROUP BY customer_id
) o ON u.id = o.customer_id
LEFT JOIN (
    SELECT 
        customer_id,
        SUM(amount) AS total_recharged
    FROM recharge_records 
    WHERE status = 'success'
    GROUP BY customer_id
) r ON u.id = r.customer_id;

-- 数据库存量统计视图
CREATE VIEW `v_data_stats` AS
SELECT 
    country,
    country_name,
    validity,
    validity_name,
    COUNT(*) AS data_count,
    SUM(total_quantity) AS total_quantity,
    SUM(available_quantity) AS available_quantity,
    SUM(total_quantity - available_quantity) AS sold_quantity
FROM data_library
WHERE status = 'available'
GROUP BY country, validity;

-- ========================================
-- 存储过程
-- ========================================

-- 客户购买数据存储过程
DELIMITER $$
CREATE PROCEDURE `sp_purchase_data`(
    IN p_customer_id INT,
    IN p_data_id INT,
    IN p_operators JSON,
    IN p_quantity INT,
    IN p_unit_price DECIMAL(10,5),
    OUT p_order_id INT,
    OUT p_result VARCHAR(100)
)
BEGIN
    DECLARE v_available_quantity INT DEFAULT 0;
    DECLARE v_account_balance DECIMAL(15,5) DEFAULT 0;
    DECLARE v_total_amount DECIMAL(15,2);
    DECLARE v_order_number VARCHAR(50);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN
        ROLLBACK;
        SET p_result = 'ERROR: 购买失败，请重试';
        SET p_order_id = 0;
    END;

    START TRANSACTION;

    -- 检查数据是否可用
    SELECT available_quantity INTO v_available_quantity 
    FROM data_library 
    WHERE id = p_data_id AND status = 'available';
    
    IF v_available_quantity < p_quantity THEN
        SET p_result = 'ERROR: 数据库存不足';
        SET p_order_id = 0;
        ROLLBACK;
    ELSE
        -- 检查账户余额
        SELECT account_balance INTO v_account_balance 
        FROM users 
        WHERE id = p_customer_id AND status = 1;
        
        SET v_total_amount = p_quantity * p_unit_price;
        
        IF v_account_balance < v_total_amount THEN
            SET p_result = 'ERROR: 账户余额不足';
            SET p_order_id = 0;
            ROLLBACK;
        ELSE
            -- 生成订单号
            SET v_order_number = CONCAT('ORD', DATE_FORMAT(NOW(), '%Y%m%d'), LPAD(FLOOR(RAND() * 10000), 4, '0'));
            
            -- 创建订单
            INSERT INTO orders (
                order_number, customer_id, data_id, operators, quantity, 
                unit_price, total_amount, status, order_time, create_time
            ) 
            SELECT 
                v_order_number, p_customer_id, p_data_id, p_operators, p_quantity,
                p_unit_price, v_total_amount, 'completed', UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000;
            
            SET p_order_id = LAST_INSERT_ID();
            
            -- 扣除库存
            UPDATE data_library 
            SET available_quantity = available_quantity - p_quantity,
                update_time = UNIX_TIMESTAMP(NOW()) * 1000
            WHERE id = p_data_id;
            
            -- 扣除余额
            UPDATE users 
            SET account_balance = account_balance - v_total_amount,
                update_time = UNIX_TIMESTAMP(NOW()) * 1000
            WHERE id = p_customer_id;
            
            SET p_result = 'SUCCESS: 购买成功';
            COMMIT;
        END IF;
    END IF;
END$$
DELIMITER ;

-- ========================================
-- 数据迁移说明
-- ========================================

/*
localStorage 到数据库的数据迁移映射关系：

1. userList -> users 表
   - id: 保持不变
   - loginAccount -> login_account
   - loginPassword -> login_password  
   - customerName -> customer_name
   - agentId -> agent_id
   - agentName -> agent_name
   - salePriceRate -> sale_price_rate
   - accountBalance -> account_balance
   - overdraftAmount -> overdraft_amount
   - createTime -> create_time

2. agentList -> agents 表
   - id: 保持不变
   - agentName -> agent_name
   - loginAccount -> login_account
   - loginPassword -> login_password
   - agentCode -> agent_code
   - parentAgent -> parent_agent_id
   - bindUsers -> bind_users
   - totalCommission -> total_commission
   - monthlyCommission -> monthly_commission

3. dataLibrary -> data_library 表
   - id: 保持不变
   - country: 保持不变
   - countryName -> country_name
   - validity: 保持不变
   - validityName -> validity_name
   - totalQuantity -> total_quantity
   - availableQuantity -> available_quantity
   - operators: JSON格式保持不变
   - uploadTime -> upload_time
   - uploadBy -> upload_by

4. orderList -> orders 表
   - 新增 order_number 字段作为订单编号
   - customerId -> customer_id
   - customerName -> customer_name
   - dataId -> data_id
   - totalAmount -> total_amount
   - orderTime -> order_time

5. rechargeRecords -> recharge_records 表
   - customerId -> customer_id
   - customerName -> customer_name
   - createTime -> create_time
*/