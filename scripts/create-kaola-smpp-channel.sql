-- ============================================
-- 考拉短信 SMPP 通道自动配置 SQL 脚本
-- ============================================
-- 
-- 使用方法：
-- mysql -u root -p sms_system < create-kaola-smpp-channel.sql
--
-- 或在 MySQL 客户端中执行：
-- source /home/vue-element-admin/scripts/create-kaola-smpp-channel.sql
--
-- ============================================

USE sms_system;

-- 检查是否已存在同名通道
SELECT '正在检查是否存在同名通道...' AS status;

SELECT 
    id,
    channel_name,
    protocol_type,
    status,
    created_at
FROM sms_channels 
WHERE channel_name = '考拉短信SMPP';

-- 如果上面的查询有结果，说明通道已存在，请先删除或修改名称
-- 如果没有结果，继续执行下面的插入语句

-- ============================================
-- 创建通道记录
-- ============================================

INSERT INTO sms_channels (
    channel_name,
    protocol_type,
    
    -- SMPP 配置
    smpp_host,
    smpp_port,
    smpp_system_id,
    smpp_system_type,
    smpp_ton,
    smpp_npi,
    
    -- 通用配置
    account,
    password,
    extno,
    api_key,
    daily_limit,
    status,
    
    -- HTTP 配置（SMPP 不需要，保留空值）
    gateway_url,
    http_method,
    http_headers,
    request_template,
    response_success_pattern,
    
    -- 时间戳
    created_at,
    updated_at
) VALUES (
    '考拉短信SMPP',           -- channel_name
    'smpp',                    -- protocol_type
    
    -- SMPP 配置
    'www.kaolasms.com',        -- smpp_host
    7099,                      -- smpp_port
    '888888',                  -- smpp_system_id
    'CMT',                     -- smpp_system_type
    0,                         -- smpp_ton
    0,                         -- smpp_npi
    
    -- 通用配置
    '888888',                  -- account
    'LI3pMBo',                 -- password
    '10690',                   -- extno
    '',                        -- api_key
    0,                         -- daily_limit (0=不限制)
    1,                         -- status (1=启用)
    
    -- HTTP 配置
    '',                        -- gateway_url
    'POST',                    -- http_method
    '',                        -- http_headers
    '',                        -- request_template
    '',                        -- response_success_pattern
    
    -- 时间戳
    NOW(),                     -- created_at
    NOW()                      -- updated_at
);

-- 获取刚创建的通道ID
SET @channel_id = LAST_INSERT_ID();

-- 显示创建结果
SELECT '✅ 通道创建成功！' AS status;

SELECT 
    @channel_id AS '通道ID',
    '考拉短信SMPP' AS '通道名称',
    'SMPP' AS '协议类型',
    '启用' AS '状态',
    'www.kaolasms.com:7099' AS 'SMPP服务器';

-- ============================================
-- 推荐：创建常用国家定价配置
-- ============================================

SELECT '正在创建常用国家定价配置...' AS status;

-- 中国
INSERT INTO sms_channel_countries (
    channel_id,
    country,
    country_code,
    cost_price,
    sale_price,
    max_chars,
    status,
    created_at,
    updated_at
) VALUES (
    @channel_id,
    'China',
    '86',
    0.0080,
    0.0100,
    160,
    1,
    NOW(),
    NOW()
);

-- 印度
INSERT INTO sms_channel_countries (
    channel_id,
    country,
    country_code,
    cost_price,
    sale_price,
    max_chars,
    status,
    created_at,
    updated_at
) VALUES (
    @channel_id,
    'India',
    '91',
    0.0070,
    0.0090,
    160,
    1,
    NOW(),
    NOW()
);

-- 美国
INSERT INTO sms_channel_countries (
    channel_id,
    country,
    country_code,
    cost_price,
    sale_price,
    max_chars,
    status,
    created_at,
    updated_at
) VALUES (
    @channel_id,
    'United States',
    '1',
    0.0120,
    0.0150,
    160,
    1,
    NOW(),
    NOW()
);

-- 孟加拉国
INSERT INTO sms_channel_countries (
    channel_id,
    country,
    country_code,
    cost_price,
    sale_price,
    max_chars,
    status,
    created_at,
    updated_at
) VALUES (
    @channel_id,
    'Bangladesh',
    '880',
    0.0070,
    0.0085,
    160,
    1,
    NOW(),
    NOW()
);

-- 显示已创建的国家定价
SELECT '✅ 国家定价配置完成！' AS status;

SELECT 
    country AS '国家',
    country_code AS '国家代码',
    CONCAT('$', cost_price) AS '成本价',
    CONCAT('$', sale_price) AS '销售价',
    CONCAT(ROUND((sale_price - cost_price) / sale_price * 100, 2), '%') AS '利润率',
    max_chars AS '最大字符',
    CASE status WHEN 1 THEN '启用' ELSE '禁用' END AS '状态'
FROM sms_channel_countries
WHERE channel_id = @channel_id
ORDER BY country;

-- ============================================
-- 配置摘要
-- ============================================

SELECT '
╔════════════════════════════════════════════╗
║      考拉短信 SMPP 通道配置完成            ║
╚════════════════════════════════════════════╝

📋 通道信息：
   - 通道ID:        ' AS '';
SELECT @channel_id AS '   ';
SELECT '   - 通道名称:      考拉短信SMPP
   - 协议类型:      SMPP
   - 状态:          启用

🔧 SMPP 配置：
   - 服务器地址:    www.kaolasms.com
   - 服务器端口:    7099
   - 系统ID:        888888
   - 系统类型:      CMT
   - TON:           0
   - NPI:           0

🔐 认证信息：
   - 账号:          888888
   - 密码:          LI3pMBo
   - 接入码:        10690

📊 已配置国家：
   - 中国 (China)
   - 印度 (India)
   - 美国 (United States)
   - 孟加拉国 (Bangladesh)

📝 后续步骤：
   1. 登录系统查看通道配置
   2. 执行测试发送验证通道
   3. 根据需要调整国家定价
   4. 监控发送成功率和性能

' AS '';

-- ============================================
-- 验证脚本
-- ============================================

-- 验证通道创建
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ 通道记录验证成功'
        ELSE '❌ 通道记录不存在'
    END AS '验证结果'
FROM sms_channels
WHERE id = @channel_id;

-- 验证国家定价
SELECT 
    CASE 
        WHEN COUNT(*) >= 4 THEN CONCAT('✅ 国家定价验证成功 (', COUNT(*), ' 个国家)')
        ELSE CONCAT('❌ 国家定价配置不完整 (', COUNT(*), ' 个国家)')
    END AS '验证结果'
FROM sms_channel_countries
WHERE channel_id = @channel_id;

-- ============================================
-- 完成
-- ============================================

SELECT '
✅ 配置脚本执行完成！

请访问系统管理界面：
👉 短信管理 → 通道管理

查看并测试新创建的通道。
' AS '';
