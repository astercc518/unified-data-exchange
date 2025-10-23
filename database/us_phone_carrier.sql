-- ========================================
-- 美国号码归属数据库
-- Phone Number Carrier Database for USA
-- ========================================

-- 1. 美国号码归属表
CREATE TABLE IF NOT EXISTS `us_phone_carrier` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `npa` CHAR(3) NOT NULL COMMENT '区号(Area Code / NPA)',
  `nxx` CHAR(3) NOT NULL COMMENT '前缀(Exchange / NXX)',
  `start_range` CHAR(4) NOT NULL COMMENT '起始号段(XXXX)',
  `end_range` CHAR(4) NOT NULL COMMENT '结束号段(XXXX)',
  `carrier_name` VARCHAR(100) NOT NULL COMMENT '运营商名称',
  `carrier_type` VARCHAR(50) DEFAULT NULL COMMENT '运营商类型(Wireless/Landline/VoIP)',
  `ocn` VARCHAR(10) DEFAULT NULL COMMENT '运营商识别码(Operating Company Number)',
  `state` VARCHAR(50) DEFAULT NULL COMMENT '州名',
  `city` VARCHAR(100) DEFAULT NULL COMMENT '城市',
  `lata` VARCHAR(10) DEFAULT NULL COMMENT 'LATA代码',
  `rate_center` VARCHAR(100) DEFAULT NULL COMMENT '费率中心',
  `last_update` BIGINT NOT NULL COMMENT '最后更新时间戳',
  `data_source` VARCHAR(100) DEFAULT 'FCC' COMMENT '数据来源',
  
  UNIQUE KEY `uk_number_range` (`npa`, `nxx`, `start_range`, `end_range`),
  INDEX `idx_npa` (`npa`),
  INDEX `idx_npa_nxx` (`npa`, `nxx`),
  INDEX `idx_carrier_name` (`carrier_name`),
  INDEX `idx_carrier_type` (`carrier_type`),
  INDEX `idx_state` (`state`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='美国号码归属数据库';

-- 2. 运营商主表
CREATE TABLE IF NOT EXISTS `us_carriers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `carrier_name` VARCHAR(100) NOT NULL UNIQUE COMMENT '运营商名称',
  `carrier_code` VARCHAR(50) DEFAULT NULL COMMENT '运营商代码',
  `carrier_type` VARCHAR(50) DEFAULT NULL COMMENT '运营商类型',
  `parent_company` VARCHAR(100) DEFAULT NULL COMMENT '母公司',
  `website` VARCHAR(200) DEFAULT NULL COMMENT '官网',
  `market_share` DECIMAL(5,2) DEFAULT 0.00 COMMENT '市场份额(%)',
  `total_numbers` BIGINT DEFAULT 0 COMMENT '拥有号码总数',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-停用，1-启用',
  `create_time` BIGINT NOT NULL COMMENT '创建时间戳',
  `update_time` BIGINT DEFAULT NULL COMMENT '更新时间戳',
  
  INDEX `idx_carrier_type` (`carrier_type`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='美国运营商主表';

-- 3. 数据更新日志表
CREATE TABLE IF NOT EXISTS `us_carrier_update_log` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `update_type` VARCHAR(50) NOT NULL COMMENT '更新类型：full/incremental',
  `records_added` INT DEFAULT 0 COMMENT '新增记录数',
  `records_updated` INT DEFAULT 0 COMMENT '更新记录数',
  `records_deleted` INT DEFAULT 0 COMMENT '删除记录数',
  `data_source` VARCHAR(100) DEFAULT NULL COMMENT '数据来源',
  `source_file` VARCHAR(200) DEFAULT NULL COMMENT '源文件名',
  `status` VARCHAR(20) DEFAULT 'success' COMMENT '状态：success/failed',
  `error_message` TEXT COMMENT '错误信息',
  `start_time` BIGINT NOT NULL COMMENT '开始时间戳',
  `end_time` BIGINT DEFAULT NULL COMMENT '结束时间戳',
  `duration` INT DEFAULT NULL COMMENT '耗时(秒)',
  `operator` VARCHAR(50) DEFAULT NULL COMMENT '操作人',
  
  INDEX `idx_update_type` (`update_type`),
  INDEX `idx_status` (`status`),
  INDEX `idx_start_time` (`start_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数据更新日志表';

-- ========================================
-- 插入主要运营商基础数据
-- ========================================
INSERT INTO `us_carriers` 
  (`carrier_name`, `carrier_code`, `carrier_type`, `parent_company`, `market_share`, `status`, `create_time`)
VALUES
  ('Verizon Wireless', 'VZW', 'Wireless', 'Verizon Communications', 35.00, 1, UNIX_TIMESTAMP() * 1000),
  ('AT&T Mobility', 'ATT', 'Wireless', 'AT&T Inc.', 32.00, 1, UNIX_TIMESTAMP() * 1000),
  ('T-Mobile USA', 'TMO', 'Wireless', 'T-Mobile US Inc.', 28.00, 1, UNIX_TIMESTAMP() * 1000),
  ('Sprint', 'SPR', 'Wireless', 'T-Mobile US Inc.', 5.00, 1, UNIX_TIMESTAMP() * 1000),
  ('US Cellular', 'USC', 'Wireless', 'United States Cellular Corporation', 3.00, 1, UNIX_TIMESTAMP() * 1000),
  ('Dish Wireless', 'DISH', 'Wireless', 'DISH Network Corporation', 2.00, 1, UNIX_TIMESTAMP() * 1000),
  ('Google Voice', 'GV', 'VoIP', 'Google LLC', 0.50, 1, UNIX_TIMESTAMP() * 1000),
  ('Other Carriers', 'OTHER', 'Mixed', NULL, 0.00, 1, UNIX_TIMESTAMP() * 1000)
ON DUPLICATE KEY UPDATE 
  `market_share` = VALUES(`market_share`),
  `update_time` = UNIX_TIMESTAMP() * 1000;

-- ========================================
-- 插入示例号码归属数据
-- 这里只是示例，实际需要导入完整的FCC数据库
-- ========================================

-- 纽约市 (212区号) - Verizon
INSERT INTO `us_phone_carrier` 
  (`npa`, `nxx`, `start_range`, `end_range`, `carrier_name`, `carrier_type`, `state`, `city`, `last_update`, `data_source`)
VALUES
  ('212', '200', '0000', '9999', 'Verizon Wireless', 'Wireless', 'New York', 'New York', UNIX_TIMESTAMP() * 1000, 'FCC'),
  ('212', '201', '0000', '9999', 'AT&T Mobility', 'Wireless', 'New York', 'New York', UNIX_TIMESTAMP() * 1000, 'FCC'),
  ('212', '202', '0000', '9999', 'T-Mobile USA', 'Wireless', 'New York', 'New York', UNIX_TIMESTAMP() * 1000, 'FCC'),
  
  -- 洛杉矶 (310区号) - 各运营商
  ('310', '200', '0000', '9999', 'Verizon Wireless', 'Wireless', 'California', 'Los Angeles', UNIX_TIMESTAMP() * 1000, 'FCC'),
  ('310', '201', '0000', '9999', 'AT&T Mobility', 'Wireless', 'California', 'Los Angeles', UNIX_TIMESTAMP() * 1000, 'FCC'),
  ('310', '202', '0000', '9999', 'T-Mobile USA', 'Wireless', 'California', 'Los Angeles', UNIX_TIMESTAMP() * 1000, 'FCC'),
  
  -- 芝加哥 (312区号)
  ('312', '200', '0000', '9999', 'Verizon Wireless', 'Wireless', 'Illinois', 'Chicago', UNIX_TIMESTAMP() * 1000, 'FCC'),
  ('312', '201', '0000', '9999', 'AT&T Mobility', 'Wireless', 'Illinois', 'Chicago', UNIX_TIMESTAMP() * 1000, 'FCC'),
  ('312', '202', '0000', '9999', 'T-Mobile USA', 'Wireless', 'Illinois', 'Chicago', UNIX_TIMESTAMP() * 1000, 'FCC')
ON DUPLICATE KEY UPDATE 
  `carrier_name` = VALUES(`carrier_name`),
  `last_update` = VALUES(`last_update`);

-- ========================================
-- 查询功能视图
-- ========================================

-- 创建运营商统计视图
CREATE OR REPLACE VIEW `v_us_carrier_stats` AS
SELECT 
  c.carrier_name,
  c.carrier_type,
  c.market_share,
  COUNT(DISTINCT p.npa) AS area_codes_count,
  COUNT(*) AS number_ranges_count,
  c.status
FROM us_carriers c
LEFT JOIN us_phone_carrier p ON c.carrier_name = p.carrier_name
WHERE c.status = 1
GROUP BY c.id, c.carrier_name, c.carrier_type, c.market_share, c.status
ORDER BY c.market_share DESC;

-- ========================================
-- 查询号码归属的存储过程
-- ========================================
DELIMITER $$

CREATE PROCEDURE `sp_get_phone_carrier`(
  IN p_phone_number VARCHAR(15)
)
BEGIN
  DECLARE v_npa CHAR(3);
  DECLARE v_nxx CHAR(3);
  DECLARE v_xxxx CHAR(4);
  DECLARE v_clean_number VARCHAR(10);
  
  -- 清理号码，只保留数字
  SET v_clean_number = REGEXP_REPLACE(p_phone_number, '[^0-9]', '');
  
  -- 如果是11位（含国码1），去除国码
  IF LENGTH(v_clean_number) = 11 AND LEFT(v_clean_number, 1) = '1' THEN
    SET v_clean_number = SUBSTRING(v_clean_number, 2);
  END IF;
  
  -- 如果长度不是10位，返回错误
  IF LENGTH(v_clean_number) != 10 THEN
    SELECT 
      NULL AS carrier_name,
      NULL AS carrier_type,
      NULL AS state,
      NULL AS city,
      'Invalid phone number format' AS error_message;
  ELSE
    -- 分解号码
    SET v_npa = SUBSTRING(v_clean_number, 1, 3);
    SET v_nxx = SUBSTRING(v_clean_number, 4, 3);
    SET v_xxxx = SUBSTRING(v_clean_number, 7, 4);
    
    -- 查询归属
    SELECT 
      carrier_name,
      carrier_type,
      state,
      city,
      ocn,
      rate_center,
      NULL AS error_message
    FROM us_phone_carrier
    WHERE npa = v_npa
      AND nxx = v_nxx
      AND v_xxxx BETWEEN start_range AND end_range
    LIMIT 1;
  END IF;
END$$

DELIMITER ;

-- ========================================
-- 批量查询号码归属的存储过程
-- ========================================
DELIMITER $$

CREATE PROCEDURE `sp_analyze_phone_carriers`(
  IN p_phone_numbers TEXT
)
BEGIN
  -- 创建临时表存储号码
  CREATE TEMPORARY TABLE IF NOT EXISTS temp_phones (
    phone_number VARCHAR(15),
    npa CHAR(3),
    nxx CHAR(3),
    xxxx CHAR(4)
  );
  
  -- 这里需要在应用层分解号码列表并插入临时表
  -- 然后进行批量查询
  
  SELECT 
    p.phone_number,
    c.carrier_name,
    c.carrier_type,
    c.state,
    c.city
  FROM temp_phones p
  LEFT JOIN us_phone_carrier c 
    ON p.npa = c.npa 
    AND p.nxx = c.nxx
    AND p.xxxx BETWEEN c.start_range AND c.end_range;
    
  DROP TEMPORARY TABLE IF EXISTS temp_phones;
END$$

DELIMITER ;
