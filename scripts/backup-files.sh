#!/bin/bash
#
# UDE 代码和配置文件自动备份脚本
# 每周备份一次
#

# 配置
BACKUP_DIR="/home/vue-element-admin/backups/files"
PROJECT_DIR="/home/vue-element-admin"
RETENTION_DAYS=60  # 保留最近 60 天的备份

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 生成备份文件名
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/ude_files_${TIMESTAMP}.tar.gz"

echo "========================================="
echo "UDE 文件备份开始"
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================="

# 备份重要文件和目录
echo "正在备份项目文件..."
tar -czf "$BACKUP_FILE" \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='logs' \
  --exclude='*.log' \
  --exclude='.git' \
  --exclude='backups' \
  --exclude='uploads/temp' \
  -C "$PROJECT_DIR" \
  backend \
  src \
  public \
  package.json \
  ecosystem.config.js \
  nginx-ude.conf \
  scripts \
  2>/dev/null

# 检查备份是否成功
if [ $? -eq 0 ]; then
  FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  echo "✅ 文件备份成功: $BACKUP_FILE"
  echo "📦 备份文件大小: $FILE_SIZE"
else
  echo "❌ 文件备份失败"
  exit 1
fi

# 清理旧备份
echo "清理 $RETENTION_DAYS 天前的旧备份..."
find "$BACKUP_DIR" -name "ude_files_*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete

REMAINING_COUNT=$(ls -1 "$BACKUP_DIR"/ude_files_*.tar.gz 2>/dev/null | wc -l)
echo "✅ 当前保留 $REMAINING_COUNT 个备份文件"

echo "========================================="
echo "备份完成"
echo "========================================="
