#!/bin/bash

# Vue Element Admin 项目重启脚本
# 用于快速重启前后端服务并验证系统状态

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_DIR="/home/vue-element-admin"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  Vue Element Admin 项目重启    ${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# 1. 停止所有相关服务
echo -e "${YELLOW}[1/6] 停止现有服务...${NC}"
pkill -f "node.*server.js" 2>/dev/null || true
pkill -f "vue-cli-service" 2>/dev/null || true
sleep 2
echo -e "${GREEN}✓ 服务已停止${NC}"
echo ""

# 2. 检查端口占用（固定端口：前端9527，后端3000）
echo -e "${YELLOW}[2/6] 检查端口占用...固定配置：前端9527 后端3000 数据库MariaDB${NC}"
if netstat -tlnp 2>/dev/null | grep -q ":3000 "; then
    echo -e "${RED}✗ 端口 3000 仍被占用，尝试强制清理...${NC}"
    fuser -k 3000/tcp 2>/dev/null || true
    sleep 1
fi

if netstat -tlnp 2>/dev/null | grep -q ":9527 "; then
    echo -e "${RED}✗ 端口 9527 仍被占用，尝试强制清理...${NC}"
    fuser -k 9527/tcp 2>/dev/null || true
    sleep 1
fi
echo -e "${GREEN}✓ 端口检查完成${NC}"
echo ""

# 3. 检查数据库服务
echo -e "${YELLOW}[3/6] 检查数据库服务...${NC}"
if ! systemctl is-active --quiet mariadb; then
    echo -e "${RED}✗ MariaDB 服务未运行，尝试启动...${NC}"
    systemctl start mariadb
    sleep 2
fi

if mysql -u root -e "SELECT 1;" &>/dev/null; then
    echo -e "${GREEN}✓ 数据库连接正常${NC}"
else
    echo -e "${RED}✗ 数据库连接失败${NC}"
    exit 1
fi
echo ""

# 4. 启动后端服务
echo -e "${YELLOW}[4/6] 启动后端服务...${NC}"
cd "$PROJECT_DIR/backend"
nohup node server.js > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "后端服务 PID: $BACKEND_PID"

# 等待后端启动
echo -n "等待后端启动"
for i in {1..10}; do
    sleep 1
    echo -n "."
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        echo ""
        echo -e "${GREEN}✓ 后端服务启动成功 (http://localhost:3000)${NC}"
        break
    fi
    if [ $i -eq 10 ]; then
        echo ""
        echo -e "${RED}✗ 后端服务启动超时${NC}"
        echo "查看日志: tail -f /tmp/backend.log"
        exit 1
    fi
done
echo ""

# 5. 启动前端服务
echo -e "${YELLOW}[5/6] 启动前端服务...${NC}"
cd "$PROJECT_DIR"
nohup npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "前端服务 PID: $FRONTEND_PID"

# 等待前端启动
echo -n "等待前端编译"
for i in {1..30}; do
    sleep 2
    echo -n "."
    if curl -s http://localhost:9527/ > /dev/null 2>&1; then
        echo ""
        echo -e "${GREEN}✓ 前端服务启动成功 (http://localhost:9527)${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo ""
        echo -e "${RED}✗ 前端服务启动超时${NC}"
        echo "查看日志: tail -f /tmp/frontend.log"
        exit 1
    fi
done
echo ""

# 6. 系统验证
echo -e "${YELLOW}[6/6] 系统功能验证...${NC}"

# 检查健康接口
if curl -s http://localhost:3000/health | grep -q "ok"; then
    echo -e "${GREEN}✓ 后端健康检查通过${NC}"
else
    echo -e "${RED}✗ 后端健康检查失败${NC}"
fi

# 检查API接口
if curl -s http://localhost:3000/api/users | grep -q "success"; then
    echo -e "${GREEN}✓ API接口响应正常${NC}"
else
    echo -e "${RED}✗ API接口响应异常${NC}"
fi

# 检查前端页面
if curl -s http://localhost:9527/ | grep -q "Vue"; then
    echo -e "${GREEN}✓ 前端页面加载正常${NC}"
else
    echo -e "${RED}✗ 前端页面加载失败${NC}"
fi

echo ""
echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}  ✓ 项目重启完成！${NC}"
echo -e "${BLUE}================================${NC}"
echo ""
echo -e "📊 服务信息："
echo -e "  ${BLUE}前端地址:${NC} http://localhost:9527"
echo -e "  ${BLUE}后端API:${NC}  http://localhost:3000"
echo -e "  ${BLUE}API文档:${NC}  http://localhost:3000/api/docs"
echo ""
echo -e "🔑 管理员账号："
echo -e "  ${BLUE}用户名:${NC} admin"
echo -e "  ${BLUE}密码:${NC}   111111"
echo ""
echo -e "📝 日志文件："
echo -e "  ${BLUE}后端日志:${NC} /tmp/backend.log"
echo -e "  ${BLUE}前端日志:${NC} /tmp/frontend.log"
echo ""
echo -e "🔍 查看日志："
echo -e "  ${YELLOW}tail -f /tmp/backend.log${NC}"
echo -e "  ${YELLOW}tail -f /tmp/frontend.log${NC}"
echo ""
echo -e "🛑 停止服务："
echo -e "  ${YELLOW}pkill -f 'node.*server.js'${NC}"
echo -e "  ${YELLOW}pkill -f 'vue-cli-service'${NC}"
echo ""
