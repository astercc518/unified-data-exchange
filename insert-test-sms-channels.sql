-- 插入测试短信通道数据

USE vue_admin;

-- 插入测试通道
INSERT INTO `sms_channels` (
  `channel_name`,
  `country`,
  `price_per_sms`,
  `max_chars`,
  `gateway_url`,
  `account`,
  `password`,
  `platform_type`,
  `status`,
  `created_at`,
  `updated_at`
) VALUES
(
  '印度SMS57通道',
  'India',
  0.0050,
  160,
  'https://api.sms57.com/send',
  'test_account',
  'test_password',
  'sms57',
  1,
  NOW(),
  NOW()
),
(
  '美国SMS57通道',
  'USA',
  0.0080,
  160,
  'https://api.sms57.com/send',
  'test_account',
  'test_password',
  'sms57',
  0,
  NOW(),
  NOW()
),
(
  '英国SMS57通道',
  'UK',
  0.0060,
  160,
  'https://api.sms57.com/send',
  'test_account',
  'test_password',
  'sms57',
  1,
  NOW(),
  NOW()
);

-- 查看插入结果
SELECT * FROM `sms_channels`;
