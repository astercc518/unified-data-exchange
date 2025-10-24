#!/bin/bash
#
# UDE 数据库自动备份脚本
# 每天凌晨 2 点自动备份数据库
#

# 配置
BACKUP_DIR="/home/vue-element-admin/backups/database"
DB_NAME="vue_admin"
DB_USER="vue_admin_user"
DB_PASS="vue_admin_2024"
RETENTION_DAYS=30  # 保留最近 30 天的备份

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 生成备份文件名（包含时间戳）
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql"
BACKUP_FILE_GZ="${BACKUP_FILE}.gz"

echo "========================================="
echo "UDE 数据库备份开始"
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================="

# 执行备份
echo "正在备份数据库: $DB_NAME"
mysqldump -u"$DB_USER" -p"$DB_PASS" \
  --single-transaction \
  --quick \
  --lock-tables=false \
  --skip-routines \
  --skip-triggers \
  --skip-events \
  "$DB_NAME" > "$BACKUP_FILE"

# 检查备份是否成功
if [ $? -eq 0 ]; then
  echo "✅ 数据库备份成功: $BACKUP_FILE"
  
  # 压缩备份文件
  echo "正在压缩备份文件..."
  gzip "$BACKUP_FILE"
  
  if [ $? -eq 0 ]; then
    echo "✅ 压缩完成: $BACKUP_FILE_GZ"
    
    # 获取文件大小
    FILE_SIZE=$(du -h "$BACKUP_FILE_GZ" | cut -f1)
    echo "📦 备份文件大小: $FILE_SIZE"
  else
    echo "❌ 压缩失败"
  fi
else
  echo "❌ 数据库备份失败"
  exit 1
fi

# 清理旧备份（保留最近 N 天）
echo "清理 $RETENTION_DAYS 天前的旧备份..."
find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete

REMAINING_COUNT=$(ls -1 "$BACKUP_DIR"/${DB_NAME}_*.sql.gz 2>/dev/null | wc -l)
echo "✅ 当前保留 $REMAINING_COUNT 个备份文件"

echo "========================================="
echo "备份完成"
echo "========================================="
