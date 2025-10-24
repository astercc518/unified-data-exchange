#!/bin/bash
#
# UDE 系统健康检查脚本
# 快速检查所有服务状态
#

echo "========================================"
echo "UDE 系统健康检查"
echo "检查时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查函数
check_service() {
    local service_name=$1
    local check_command=$2
    
    printf "%-30s" "$service_name: "
    if eval "$check_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ 运行中${NC}"
        return 0
    else
        echo -e "${RED}✗ 未运行${NC}"
        return 1
    fi
}

# 检查端口
check_port() {
    local port=$1
    local service=$2
    
    printf "%-30s" "  端口 $port ($service): "
    if netstat -tuln 2>/dev/null | grep -q ":$port " || ss -tuln 2>/dev/null | grep -q ":$port "; then
        echo -e "${GREEN}✓ 监听中${NC}"
        return 0
    else
        echo -e "${RED}✗ 未监听${NC}"
        return 1
    fi
}

# 1. PM2 进程检查
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. PM2 进程状态"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_service "PM2 Daemon" "pm2 ping"
echo ""
pm2 list
echo ""

# 2. 服务端口检查
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. 服务端口检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_port 80 "Nginx"
check_port 3000 "后端 API"
check_port 6379 "Redis"
check_port 9527 "前端开发服务器"
echo ""

# 3. 系统服务检查
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. 系统服务状态"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_service "Nginx" "systemctl is-active nginx"
check_service "Redis" "systemctl is-active redis"
check_service "MySQL" "systemctl is-active mysqld || systemctl is-active mariadb"
echo ""

# 4. 健康检查端点
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. 健康检查端点"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

printf "%-30s" "Nginx 健康检查: "
if curl -s http://localhost/health | grep -q "healthy"; then
    echo -e "${GREEN}✓ 正常${NC}"
else
    echo -e "${RED}✗ 异常${NC}"
fi

printf "%-30s" "后端 API 健康检查: "
if curl -s http://localhost:3000/health | grep -q "ok"; then
    echo -e "${GREEN}✓ 正常${NC}"
else
    echo -e "${RED}✗ 异常${NC}"
fi

printf "%-30s" "Prometheus 指标: "
if curl -s http://localhost:3000/metrics | grep -q "ude_backend"; then
    echo -e "${GREEN}✓ 正常${NC}"
else
    echo -e "${RED}✗ 异常${NC}"
fi

printf "%-30s" "Redis 连接: "
if redis-cli ping 2>/dev/null | grep -q "PONG"; then
    echo -e "${GREEN}✓ 正常${NC}"
else
    echo -e "${RED}✗ 异常${NC}"
fi
echo ""

# 5. 系统资源使用
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. 系统资源使用"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 内存使用
TOTAL_MEM=$(free -h | awk '/^Mem:/ {print $2}')
USED_MEM=$(free -h | awk '/^Mem:/ {print $3}')
MEM_PERCENT=$(free | awk '/^Mem:/ {printf "%.1f", $3/$2 * 100}')

printf "%-30s" "内存使用: "
if (( $(echo "$MEM_PERCENT < 80" | bc -l) )); then
    echo -e "${GREEN}$USED_MEM / $TOTAL_MEM (${MEM_PERCENT}%)${NC}"
elif (( $(echo "$MEM_PERCENT < 90" | bc -l) )); then
    echo -e "${YELLOW}$USED_MEM / $TOTAL_MEM (${MEM_PERCENT}%)${NC}"
else
    echo -e "${RED}$USED_MEM / $TOTAL_MEM (${MEM_PERCENT}%)${NC}"
fi

# 磁盘使用
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
DISK_INFO=$(df -h / | awk 'NR==2 {print $3 " / " $2}')

printf "%-30s" "磁盘使用: "
if [ "$DISK_USAGE" -lt 80 ]; then
    echo -e "${GREEN}$DISK_INFO (${DISK_USAGE}%)${NC}"
elif [ "$DISK_USAGE" -lt 90 ]; then
    echo -e "${YELLOW}$DISK_INFO (${DISK_USAGE}%)${NC}"
else
    echo -e "${RED}$DISK_INFO (${DISK_USAGE}%)${NC}"
fi

# CPU 负载
LOAD_AVG=$(uptime | awk -F'load average:' '{print $2}' | xargs)
printf "%-30s" "CPU 负载 (1/5/15分钟): "
echo -e "${GREEN}$LOAD_AVG${NC}"

echo ""

# 6. 日志和备份
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6. 日志和备份"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# PM2 日志大小
PM2_LOG_SIZE=$(du -sh /tmp/pm2-*.log 2>/dev/null | awk '{sum+=$1} END {print sum}')
printf "%-30s" "PM2 日志总大小: "
if [ -z "$PM2_LOG_SIZE" ]; then
    echo -e "${GREEN}0 (已轮转)${NC}"
else
    echo -e "${YELLOW}${PM2_LOG_SIZE}${NC}"
fi

# 数据库备份
DB_BACKUP_COUNT=$(ls -1 /home/vue-element-admin/backups/database/*.sql.gz 2>/dev/null | wc -l)
printf "%-30s" "数据库备份数量: "
if [ "$DB_BACKUP_COUNT" -gt 0 ]; then
    echo -e "${GREEN}$DB_BACKUP_COUNT 个${NC}"
else
    echo -e "${YELLOW}$DB_BACKUP_COUNT 个 (请执行首次备份)${NC}"
fi

# 最新备份时间
if [ "$DB_BACKUP_COUNT" -gt 0 ]; then
    LATEST_BACKUP=$(ls -t /home/vue-element-admin/backups/database/*.sql.gz 2>/dev/null | head -1)
    BACKUP_TIME=$(stat -c %y "$LATEST_BACKUP" 2>/dev/null | cut -d' ' -f1,2 | cut -d'.' -f1)
    printf "%-30s" "最新备份时间: "
    echo -e "${GREEN}$BACKUP_TIME${NC}"
fi

echo ""

# 7. 性能指标 (Prometheus)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7. 性能指标"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# HTTP 请求总数
HTTP_REQUESTS=$(curl -s http://localhost:3000/metrics 2>/dev/null | grep "ude_backend_http_requests_total" | grep -v "#" | awk '{sum+=$2} END {print sum}')
printf "%-30s" "HTTP 请求总数: "
if [ -n "$HTTP_REQUESTS" ]; then
    echo -e "${GREEN}${HTTP_REQUESTS:-0}${NC}"
else
    echo -e "${YELLOW}N/A${NC}"
fi

# Redis 缓存命中
CACHE_HITS=$(curl -s http://localhost:3000/metrics 2>/dev/null | grep "ude_backend_redis_cache_hits_total" | grep -v "#" | awk '{print $2}')
CACHE_MISSES=$(curl -s http://localhost:3000/metrics 2>/dev/null | grep "ude_backend_redis_cache_misses_total" | grep -v "#" | awk '{print $2}')

if [ -n "$CACHE_HITS" ] && [ -n "$CACHE_MISSES" ]; then
    TOTAL_CACHE=$((CACHE_HITS + CACHE_MISSES))
    if [ $TOTAL_CACHE -gt 0 ]; then
        CACHE_HIT_RATE=$(echo "scale=2; $CACHE_HITS * 100 / $TOTAL_CACHE" | bc)
        printf "%-30s" "Redis 缓存命中率: "
        if (( $(echo "$CACHE_HIT_RATE >= 60" | bc -l) )); then
            echo -e "${GREEN}${CACHE_HIT_RATE}% (${CACHE_HITS}/${TOTAL_CACHE})${NC}"
        elif (( $(echo "$CACHE_HIT_RATE >= 30" | bc -l) )); then
            echo -e "${YELLOW}${CACHE_HIT_RATE}% (${CACHE_HITS}/${TOTAL_CACHE})${NC}"
        else
            echo -e "${RED}${CACHE_HIT_RATE}% (${CACHE_HITS}/${TOTAL_CACHE})${NC}"
        fi
    fi
fi

echo ""

# 总结
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 系统健康检查完成"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 提示:"
echo "  - 运行 'pm2 monit' 实时监控进程"
echo "  - 运行 'pm2 logs' 查看应用日志"
echo "  - 访问 http://localhost:3000/metrics 查看 Prometheus 指标"
echo "  - 访问配置报告: /home/vue-element-admin/PERFORMANCE_OPTIMIZATION_REPORT.md"
echo ""
