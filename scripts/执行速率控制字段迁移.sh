#!/bin/bash

# ============================================
# 速率控制字段数据库迁移脚本
# ============================================

echo "========================================"
echo "  短信通道 - 速率控制字段迁移"
echo "========================================"
echo ""
echo "即将添加以下字段到 sms_channels 表："
echo "  - rate_limit_enabled      (是否启用速率控制)"
echo "  - rate_limit_per_second   (每秒最大请求数)"
echo "  - rate_limit_per_minute   (每分钟最大请求数)"
echo "  - rate_limit_per_hour     (每小时最大请求数)"
echo "  - rate_limit_concurrent   (最大并发请求数)"
echo ""
echo "========================================"
echo ""

# 提示用户输入MySQL密码
echo "请输入MySQL root密码："
read -s MYSQL_PASSWORD

echo ""
echo "正在执行迁移..."
echo ""

# 执行SQL
mysql -u root -p"${MYSQL_PASSWORD}" sms_system << 'EOF'

-- 添加速率控制字段
ALTER TABLE sms_channels 
  ADD COLUMN rate_limit_enabled TINYINT(1) DEFAULT 1 
    COMMENT '是否启用速率控制' AFTER daily_limit,
  ADD COLUMN rate_limit_per_second INT DEFAULT 100 
    COMMENT '每秒最大请求数' AFTER rate_limit_enabled,
  ADD COLUMN rate_limit_per_minute INT DEFAULT NULL 
    COMMENT '每分钟最大请求数' AFTER rate_limit_per_second,
  ADD COLUMN rate_limit_per_hour INT DEFAULT NULL 
    COMMENT '每小时最大请求数' AFTER rate_limit_per_minute,
  ADD COLUMN rate_limit_concurrent INT DEFAULT 1 
    COMMENT '最大并发请求数' AFTER rate_limit_per_hour;

-- 验证字段
SELECT 
  COLUMN_NAME AS '字段名',
  COLUMN_TYPE AS '类型',
  COLUMN_DEFAULT AS '默认值',
  COLUMN_COMMENT AS '注释'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'sms_system'
  AND TABLE_NAME = 'sms_channels'
  AND COLUMN_NAME LIKE 'rate_limit%'
ORDER BY ORDINAL_POSITION;

EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo "  ✅ 迁移成功！"
    echo "========================================"
    echo ""
    echo "下一步操作："
    echo "  1. 刷新浏览器页面（Ctrl+F5）"
    echo "  2. 打开通道管理页面"
    echo "  3. 点击【新增】或【编辑】通道"
    echo "  4. 滚动到【速率控制】区域"
    echo "  5. 配置参数并保存"
    echo ""
else
    echo ""
    echo "========================================"
    echo "  ❌ 迁移失败！"
    echo "========================================"
    echo ""
    echo "请检查："
    echo "  1. MySQL密码是否正确"
    echo "  2. sms_system数据库是否存在"
    echo "  3. sms_channels表是否存在"
    echo "  4. 字段是否已经存在"
    echo ""
fi
