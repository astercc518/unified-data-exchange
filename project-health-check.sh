#!/bin/bash

###############################################################################
# 项目健康检查脚本
# UDE (Unified Data Exchange) - 统一数据交换平台
# 自动检查所有关键服务和组件的状态
###############################################################################

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 图标
CHECK="✓"
CROSS="✗"
WARNING="⚠"
INFO="ℹ"

echo ""
echo "========================================================================="
echo -e "${BLUE}UDE 项目健康检查报告${NC}"
echo "========================================================================="
echo -e "检查时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 总体状态
OVERALL_STATUS=0

###############################################################################
# 1. PM2 服务状态检查
###############################################################################
echo -e "${BLUE}【1】PM2 服务状态${NC}"
echo "-------------------------------------------------------------------------"

if command -v pm2 &> /dev/null; then
    # 不使用jq，直接用pm2 list解析
    backend_count=$(pm2 list | grep -c "backend.*online" || echo "0")
    if [ "$backend_count" -ge 2 ]; then
        echo -e "${GREEN}${CHECK} 后端服务: $backend_count 个实例在线${NC}"
    else
        echo -e "${RED}${CROSS} 后端服务: 异常 (期望2个实例，实际${backend_count}个)${NC}"
        OVERALL_STATUS=1
    fi
    
    # 检查前端服务
    if pm2 list | grep -q "frontend.*online"; then
        echo -e "${GREEN}${CHECK} 前端服务: 在线${NC}"
    else
        echo -e "${RED}${CROSS} 前端服务: 离线${NC}"
        OVERALL_STATUS=1
    fi
    
    # 显示重启次数
    backend_restarts=$(pm2 list | grep backend | head -1 | awk '{print $4}' | tr -d '↺' || echo "0")
    if [ ! -z "$backend_restarts" ] && [ "$backend_restarts" -gt 30 ] 2>/dev/null; then
        echo -e "${YELLOW}${WARNING} 后端重启次数: $backend_restarts (偏高，建议检查)${NC}"
    else
        echo -e "${GREEN}${INFO} 后端重启次数: ${backend_restarts:-0}${NC}"
    fi
else
    echo -e "${RED}${CROSS} PM2 未安装${NC}"
    OVERALL_STATUS=1
fi

echo ""

###############################################################################
# 2. 端口监听检查
###############################################################################
echo -e "${BLUE}【2】端口监听状态${NC}"
echo "-------------------------------------------------------------------------"

check_port() {
    local port=$1
    local service=$2
    
    if netstat -tlnp 2>/dev/null | grep -q ":$port "; then
        echo -e "${GREEN}${CHECK} $service (端口 $port): 正在监听${NC}"
    else
        echo -e "${RED}${CROSS} $service (端口 $port): 未监听${NC}"
        OVERALL_STATUS=1
    fi
}

check_port 3000 "后端API"
check_port 9527 "前端开发服务器"
check_port 80 "Nginx HTTP"
check_port 443 "Nginx HTTPS"

echo ""

###############################################################################
# 3. 服务健康检查
###############################################################################
echo -e "${BLUE}【3】服务健康检查${NC}"
echo "-------------------------------------------------------------------------"

# 后端健康检查
backend_health=$(curl -s http://localhost:3000/health 2>/dev/null)
if [ $? -eq 0 ] && echo "$backend_health" | grep -q '"status":"ok"'; then
    # 提取uptime（简单方式）
    uptime=$(echo "$backend_health" | grep -o '"uptime":[0-9.]*' | cut -d: -f2)
    if [ ! -z "$uptime" ]; then
        uptime_min=$(echo "$uptime / 60" | bc 2>/dev/null || echo "N/A")
        echo -e "${GREEN}${CHECK} 后端API健康: 正常 (运行时间: ${uptime_min}分钟)${NC}"
    else
        echo -e "${GREEN}${CHECK} 后端API健康: 正常${NC}"
    fi
else
    echo -e "${RED}${CROSS} 后端API健康: 无法访问${NC}"
    OVERALL_STATUS=1
fi

# 前端访问检查
frontend_check=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:9527 2>/dev/null)
if [ "$frontend_check" = "200" ]; then
    echo -e "${GREEN}${CHECK} 前端页面: 可访问${NC}"
else
    echo -e "${RED}${CROSS} 前端页面: HTTP $frontend_check${NC}"
    OVERALL_STATUS=1
fi

echo ""

###############################################################################
# 4. 数据库状态检查
###############################################################################
echo -e "${BLUE}【4】数据库状态${NC}"
echo "-------------------------------------------------------------------------"

# MariaDB状态
if systemctl is-active --quiet mariadb; then
    echo -e "${GREEN}${CHECK} MariaDB: 运行中${NC}"
    
    # 测试数据库连接
    if mysql -u vue_admin_user -p'vue_admin_2024' vue_admin -e "SELECT 1;" &>/dev/null; then
        echo -e "${GREEN}${CHECK} 数据库连接: 正常${NC}"
    else
        echo -e "${RED}${CROSS} 数据库连接: 失败${NC}"
        OVERALL_STATUS=1
    fi
else
    echo -e "${RED}${CROSS} MariaDB: 未运行${NC}"
    OVERALL_STATUS=1
fi

echo ""

###############################################################################
# 5. Nginx 状态检查
###############################################################################
echo -e "${BLUE}【5】Nginx 状态${NC}"
echo "-------------------------------------------------------------------------"

if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}${CHECK} Nginx: 运行中${NC}"
    
    # 配置文件语法检查
    if nginx -t &>/dev/null; then
        echo -e "${GREEN}${CHECK} Nginx 配置: 语法正确${NC}"
    else
        echo -e "${YELLOW}${WARNING} Nginx 配置: 可能存在问题${NC}"
    fi
else
    echo -e "${RED}${CROSS} Nginx: 未运行${NC}"
    OVERALL_STATUS=1
fi

echo ""

###############################################################################
# 6. 系统资源检查
###############################################################################
echo -e "${BLUE}【6】系统资源使用${NC}"
echo "-------------------------------------------------------------------------"

# 磁盘空间
disk_usage=$(df -h /home | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$disk_usage" -lt 80 ]; then
    echo -e "${GREEN}${CHECK} 磁盘使用: ${disk_usage}%${NC}"
elif [ "$disk_usage" -lt 90 ]; then
    echo -e "${YELLOW}${WARNING} 磁盘使用: ${disk_usage}% (建议清理)${NC}"
else
    echo -e "${RED}${CROSS} 磁盘使用: ${disk_usage}% (严重不足)${NC}"
    OVERALL_STATUS=1
fi

# 内存使用
mem_usage=$(free | awk 'NR==2 {printf "%.0f", $3/$2 * 100}')
if [ "$mem_usage" -lt 80 ]; then
    echo -e "${GREEN}${CHECK} 内存使用: ${mem_usage}%${NC}"
elif [ "$mem_usage" -lt 90 ]; then
    echo -e "${YELLOW}${WARNING} 内存使用: ${mem_usage}% (需关注)${NC}"
else
    echo -e "${RED}${CROSS} 内存使用: ${mem_usage}% (过高)${NC}"
fi

echo ""

###############################################################################
# 7. 日志检查（最近错误）
###############################################################################
echo -e "${BLUE}【7】最近错误日志${NC}"
echo "-------------------------------------------------------------------------"

error_count=$(tail -100 /tmp/pm2-backend-error.log 2>/dev/null | grep -c "Error\|错误" || echo "0")
if [ "$error_count" -eq 0 ]; then
    echo -e "${GREEN}${CHECK} 最近100行日志: 无错误${NC}"
else
    echo -e "${YELLOW}${WARNING} 最近100行日志: 发现 $error_count 个错误${NC}"
    echo -e "${YELLOW}    建议检查: tail -50 /tmp/pm2-backend-error.log${NC}"
fi

echo ""

###############################################################################
# 8. Prometheus 指标检查
###############################################################################
echo -e "${BLUE}【8】业务指标监控${NC}"
echo "-------------------------------------------------------------------------"

metrics=$(curl -s http://localhost:3000/metrics 2>/dev/null)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}${CHECK} Prometheus 指标: 可访问${NC}"
    
    # 显示关键指标
    users=$(echo "$metrics" | grep "ude_backend_users_total" | grep -v "#" | awk '{sum+=$2} END {print sum}')
    echo -e "${GREEN}${INFO} 系统用户总数: $users${NC}"
else
    echo -e "${YELLOW}${WARNING} Prometheus 指标: 无法访问${NC}"
fi

echo ""

###############################################################################
# 9. Git 状态检查
###############################################################################
echo -e "${BLUE}【9】代码仓库状态${NC}"
echo "-------------------------------------------------------------------------"

cd /home/vue-element-admin

# 未提交的更改
changed_files=$(git status --short 2>/dev/null | wc -l)
if [ "$changed_files" -eq 0 ]; then
    echo -e "${GREEN}${CHECK} 代码状态: 干净 (无未提交更改)${NC}"
else
    echo -e "${YELLOW}${WARNING} 代码状态: $changed_files 个文件有更改${NC}"
    echo -e "${YELLOW}    建议: git status 查看详情${NC}"
fi

# 未跟踪的文件
untracked=$(git status --short 2>/dev/null | grep "^??" | wc -l)
if [ "$untracked" -gt 0 ]; then
    echo -e "${YELLOW}${INFO} 未跟踪文件: $untracked 个${NC}"
fi

echo ""

###############################################################################
# 总结
###############################################################################
echo "========================================================================="
if [ $OVERALL_STATUS -eq 0 ]; then
    echo -e "${GREEN}【总体状态】✅ 所有检查通过 - 系统运行正常${NC}"
else
    echo -e "${RED}【总体状态】❌ 发现问题 - 请检查上述标记的错误项${NC}"
fi
echo "========================================================================="
echo ""

# 快捷操作提示
echo -e "${BLUE}【快捷操作】${NC}"
echo "  查看服务状态: pm2 status"
echo "  查看后端日志: pm2 logs backend"
echo "  重启后端:     pm2 restart backend"
echo "  重启前端:     pm2 restart frontend"
echo "  重启所有:     pm2 restart all"
echo "  查看错误日志: tail -50 /tmp/pm2-backend-error.log"
echo ""

exit $OVERALL_STATUS
