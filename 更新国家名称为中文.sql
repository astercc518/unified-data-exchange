-- 将国家名称从英文更新为中文
-- 2025-10-22

USE vue_admin;

-- 巴西
UPDATE sms_records 
SET country = '巴西' 
WHERE country = 'Brazil';

-- 越南
UPDATE sms_records 
SET country = '越南' 
WHERE country = 'Vietnam';

-- 孟加拉
UPDATE sms_records 
SET country = '孟加拉' 
WHERE country = 'Bangladesh';

-- 中国
UPDATE sms_records 
SET country = '中国' 
WHERE country = 'China';

-- 美国
UPDATE sms_records 
SET country = '美国' 
WHERE country IN ('USA', 'US');

-- 印度
UPDATE sms_records 
SET country = '印度' 
WHERE country = 'India';

-- 印度尼西亚
UPDATE sms_records 
SET country = '印度尼西亚' 
WHERE country = 'Indonesia';

-- 菲律宾
UPDATE sms_records 
SET country = '菲律宾' 
WHERE country = 'Philippines';

-- 泰国
UPDATE sms_records 
SET country = '泰国' 
WHERE country = 'Thailand';

-- 马来西亚
UPDATE sms_records 
SET country = '马来西亚' 
WHERE country = 'Malaysia';

-- 新加坡
UPDATE sms_records 
SET country = '新加坡' 
WHERE country = 'Singapore';

-- 查看更新结果
SELECT country, COUNT(*) as count 
FROM sms_records 
GROUP BY country 
ORDER BY count DESC;
