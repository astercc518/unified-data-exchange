-- 更新测试记录的国家字段，从手机号识别真实国家
-- 2025-10-22

USE vue_admin;

-- 巴西 (55开头)
UPDATE sms_records 
SET country = 'Brazil' 
WHERE country = 'TEST' 
  AND phone_number LIKE '55%';

-- 越南 (84开头)
UPDATE sms_records 
SET country = 'Vietnam' 
WHERE country = 'TEST' 
  AND phone_number LIKE '84%';

-- 孟加拉 (880开头)
UPDATE sms_records 
SET country = 'Bangladesh' 
WHERE country = 'TEST' 
  AND phone_number LIKE '880%';

-- 中国 (86开头)
UPDATE sms_records 
SET country = 'China' 
WHERE country = 'TEST' 
  AND phone_number LIKE '86%';

-- 美国/加拿大 (1开头)
UPDATE sms_records 
SET country = 'USA' 
WHERE country = 'TEST' 
  AND phone_number LIKE '1%';

-- 印度 (91开头)
UPDATE sms_records 
SET country = 'India' 
WHERE country = 'TEST' 
  AND phone_number LIKE '91%';

-- 印度尼西亚 (62开头)
UPDATE sms_records 
SET country = 'Indonesia' 
WHERE country = 'TEST' 
  AND phone_number LIKE '62%';

-- 菲律宾 (63开头)
UPDATE sms_records 
SET country = 'Philippines' 
WHERE country = 'TEST' 
  AND phone_number LIKE '63%';

-- 泰国 (66开头)
UPDATE sms_records 
SET country = 'Thailand' 
WHERE country = 'TEST' 
  AND phone_number LIKE '66%';

-- 马来西亚 (60开头)
UPDATE sms_records 
SET country = 'Malaysia' 
WHERE country = 'TEST' 
  AND phone_number LIKE '60%';

-- 新加坡 (65开头)
UPDATE sms_records 
SET country = 'Singapore' 
WHERE country = 'TEST' 
  AND phone_number LIKE '65%';

-- 查看更新结果
SELECT country, COUNT(*) as count 
FROM sms_records 
GROUP BY country 
ORDER BY count DESC;
