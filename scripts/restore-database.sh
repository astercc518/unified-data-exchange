#!/bin/bash
#
# UDE 数据库恢复脚本
# 用于从备份文件恢复数据库
#

# 配置
DB_NAME="vue_admin"
DB_USER="vue_admin_user"
DB_PASS="vue_admin_2024"
BACKUP_DIR="/home/vue-element-admin/backups/database"

# 检查参数
if [ -z "$1" ]; then
  echo "❌ 错误：请指定备份文件名"
  echo "用法: $0 <备份文件名>"
  echo "示例: $0 vue_admin_20251024_020001.sql.gz"
  exit 1
fi

BACKUP_FILE="$1"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_FILE"

# 检查备份文件是否存在
if [ ! -f "$BACKUP_PATH" ]; then
  echo "❌ 错误：备份文件不存在: $BACKUP_PATH"
  exit 1
fi

# 检查文件扩展名
if [[ ! "$BACKUP_FILE" =~ \.sql\.gz$ ]]; then
  echo "❌ 错误：无效的备份文件格式（必须是 .sql.gz）"
  exit 1
fi

echo "========================================="
echo "UDE 数据库恢复"
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================="
echo ""
echo "⚠️  警告：此操作将覆盖当前数据库！"
echo "备份文件: $BACKUP_FILE"
echo ""

# 确认操作（仅在交互模式下）
if [ -t 0 ]; then
  read -p "是否继续？(yes/no): " confirm
  if [ "$confirm" != "yes" ]; then
    echo "❌ 操作已取消"
    exit 0
  fi
fi

# 创建临时目录
TEMP_DIR=$(mktemp -d)
TEMP_SQL="$TEMP_DIR/restore.sql"

echo "📦 正在解压备份文件..."
gunzip -c "$BACKUP_PATH" > "$TEMP_SQL"

if [ $? -ne 0 ]; then
  echo "❌ 解压失败"
  rm -rf "$TEMP_DIR"
  exit 1
fi

echo "✅ 解压完成"

# 获取解压后文件大小
FILE_SIZE=$(du -h "$TEMP_SQL" | cut -f1)
echo "📝 SQL 文件大小: $FILE_SIZE"

# 备份当前数据库（安全措施）
SAFETY_BACKUP="$BACKUP_DIR/pre_restore_$(date +%Y%m%d_%H%M%S).sql.gz"
echo ""
echo "🛡️  创建安全备份（恢复前）..."
mysqldump -u"$DB_USER" -p"$DB_PASS" \
  --single-transaction \
  --quick \
  --lock-tables=false \
  --skip-routines \
  --skip-triggers \
  --skip-events \
  "$DB_NAME" | gzip > "$SAFETY_BACKUP"

if [ $? -eq 0 ]; then
  echo "✅ 安全备份已创建: $(basename $SAFETY_BACKUP)"
else
  echo "⚠️  警告：安全备份创建失败，但将继续恢复"
fi

# 删除现有数据库并重建
echo ""
echo "🗑️  正在删除现有数据库..."
mysql -u"$DB_USER" -p"$DB_PASS" -e "DROP DATABASE IF EXISTS $DB_NAME;"
if [ $? -ne 0 ]; then
  echo "❌ 删除数据库失败"
  rm -rf "$TEMP_DIR"
  exit 1
fi

echo "📦 正在创建新数据库..."
mysql -u"$DB_USER" -p"$DB_PASS" -e "CREATE DATABASE $DB_NAME DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
if [ $? -ne 0 ]; then
  echo "❌ 创建数据库失败"
  rm -rf "$TEMP_DIR"
  exit 1
fi

# 恢复数据
echo ""
echo "📥 正在恢复数据..."
mysql -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$TEMP_SQL"

if [ $? -eq 0 ]; then
  echo "✅ 数据恢复成功！"
  
  # 验证恢复
  echo ""
  echo "🔍 验证恢复结果..."
  TABLE_COUNT=$(mysql -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "SHOW TABLES;" | wc -l)
  TABLE_COUNT=$((TABLE_COUNT - 1))  # 减去表头
  echo "✅ 共恢复 $TABLE_COUNT 个数据表"
  
  # 清理临时文件
  rm -rf "$TEMP_DIR"
  
  echo ""
  echo "========================================="
  echo "✅ 数据库恢复完成！"
  echo "========================================="
  echo ""
  echo "📝 提示："
  echo "  - 安全备份: $SAFETY_BACKUP"
  echo "  - 如需回滚，请使用安全备份恢复"
  echo "  - 建议重启后端服务: pm2 restart backend"
  
  exit 0
else
  echo "❌ 数据恢复失败"
  
  # 清理临时文件
  rm -rf "$TEMP_DIR"
  
  echo ""
  echo "⚠️  建议使用安全备份恢复: $SAFETY_BACKUP"
  exit 1
fi
