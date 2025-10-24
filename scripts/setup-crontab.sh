#!/bin/bash
#
# UDE 定时任务配置脚本
# 自动配置 crontab 定时任务
#

echo "========================================="
echo "UDE 定时任务配置"
echo "========================================="

# 备份当前 crontab
crontab -l > /tmp/crontab_backup_$(date +%Y%m%d_%H%M%S).txt 2>/dev/null

# 创建新的 crontab 配置
cat > /tmp/ude_crontab.txt << 'EOF'
# UDE 统一数据交换平台定时任务

# 1. 数据库备份 - 每天凌晨 2 点执行
0 2 * * * /home/vue-element-admin/scripts/backup-database.sh >> /var/log/ude-backup-db.log 2>&1

# 2. 文件备份 - 每周日凌晨 3 点执行
0 3 * * 0 /home/vue-element-admin/scripts/backup-files.sh >> /var/log/ude-backup-files.log 2>&1

# 3. 清理过期日志 - 每天凌晨 4 点执行
0 4 * * * find /tmp -name "pm2-*.log" -type f -mtime +7 -delete

# 4. PM2 进程监控 - 每 5 分钟检查一次
*/5 * * * * pm2 ping > /dev/null 2>&1

# 5. 系统资源监控 - 每小时检查一次磁盘空间
0 * * * * df -h | grep -E '^/dev/' > /var/log/ude-disk-usage.log

EOF

# 追加到现有 crontab
crontab -l 2>/dev/null | cat - /tmp/ude_crontab.txt | crontab -

echo "✅ 定时任务配置完成！"
echo ""
echo "当前定时任务列表："
echo "-------------------"
crontab -l
echo ""
echo "日志文件："
echo "  数据库备份: /var/log/ude-backup-db.log"
echo "  文件备份:   /var/log/ude-backup-files.log"
echo "  磁盘使用:   /var/log/ude-disk-usage.log"
echo ""
echo "========================================="
