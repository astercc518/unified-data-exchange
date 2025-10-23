#!/bin/bash

# Vue Element Admin 项目状态检查脚本
# 用法: ./check-status.sh

set -e

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "======================================="
echo "    Vue Element Admin 项目状态检查"
echo "======================================="
echo ""

# 检查后端服务
echo -e "${BLUE}📡 检查后端服务 (端口 3000)...${NC}"
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    HEALTH=$(curl -s http://localhost:3000/health)
    echo -e "${GREEN}✅ 后端服务运行正常${NC}"
    echo "   响应: $HEALTH"
else
    echo -e "${RED}❌ 后端服务未运行${NC}"
    BACKEND_PID=$(pgrep -f "node.*backend/server.js" 2>/dev/null || echo "")
    if [ -n "$BACKEND_PID" ]; then
        echo -e "${YELLOW}⚠️  后端进程存在 (PID: $BACKEND_PID) 但无响应${NC}"
    fi
fi
echo ""

# 检查前端服务
echo -e "${BLUE}📡 检查前端服务 (端口 3001)...${NC}"
if curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 前端服务运行正常${NC}"
else
    echo -e "${RED}❌ 前端服务未运行${NC}"
    FRONTEND_PID=$(pgrep -f "vue-cli-service serve" 2>/dev/null || echo "")
    if [ -n "$FRONTEND_PID" ]; then
        echo -e "${YELLOW}⚠️  前端进程存在 (PID: $FRONTEND_PID) 但无响应${NC}"
    fi
fi
echo ""

# 检查端口占用
echo -e "${BLUE}🔌 检查端口占用...${NC}"
PORT_3000=$(netstat -tlnp 2>/dev/null | grep ":3000 " || echo "")
PORT_3001=$(netstat -tlnp 2>/dev/null | grep ":3001 " || echo "")

if [ -n "$PORT_3000" ]; then
    echo -e "${GREEN}✅ 端口 3000 (后端):${NC}"
    echo "   $PORT_3000"
else
    echo -e "${RED}❌ 端口 3000 未被占用${NC}"
fi

if [ -n "$PORT_3001" ]; then
    echo -e "${GREEN}✅ 端口 3001 (前端):${NC}"
    echo "   $PORT_3001"
else
    echo -e "${RED}❌ 端口 3001 未被占用${NC}"
fi
echo ""

# 检查进程
echo -e "${BLUE}🔍 检查相关进程...${NC}"
BACKEND_PROCESSES=$(ps aux | grep -E "node.*backend/server.js" | grep -v grep || echo "")
FRONTEND_PROCESSES=$(ps aux | grep -E "vue-cli-service serve|npm.*dev" | grep -v grep || echo "")

if [ -n "$BACKEND_PROCESSES" ]; then
    echo -e "${GREEN}✅ 后端进程:${NC}"
    echo "$BACKEND_PROCESSES" | while read line; do
        echo "   $line"
    done
else
    echo -e "${RED}❌ 未找到后端进程${NC}"
fi
echo ""

if [ -n "$FRONTEND_PROCESSES" ]; then
    echo -e "${GREEN}✅ 前端进程:${NC}"
    echo "$FRONTEND_PROCESSES" | while read line; do
        echo "   $line"
    done
else
    echo -e "${RED}❌ 未找到前端进程${NC}"
fi
echo ""

# 检查日志文件
echo -e "${BLUE}📋 检查日志文件...${NC}"
if [ -f "/tmp/backend.log" ]; then
    BACKEND_LOG_SIZE=$(du -h /tmp/backend.log | cut -f1)
    echo -e "${GREEN}✅ 后端日志: /tmp/backend.log ($BACKEND_LOG_SIZE)${NC}"
    echo "   最后 5 行:"
    tail -5 /tmp/backend.log | sed 's/^/   /'
else
    echo -e "${YELLOW}⚠️  后端日志文件不存在${NC}"
fi
echo ""

if [ -f "/tmp/frontend.log" ]; then
    FRONTEND_LOG_SIZE=$(du -h /tmp/frontend.log | cut -f1)
    echo -e "${GREEN}✅ 前端日志: /tmp/frontend.log ($FRONTEND_LOG_SIZE)${NC}"
    echo "   最后 5 行:"
    tail -5 /tmp/frontend.log | sed 's/^/   /'
else
    echo -e "${YELLOW}⚠️  前端日志文件不存在${NC}"
fi
echo ""

# 检查数据库连接
echo -e "${BLUE}💾 检查数据库...${NC}"
if [ -f "/home/vue-element-admin/backend/.env" ]; then
    DB_TYPE=$(grep "^DB_TYPE=" /home/vue-element-admin/backend/.env | cut -d= -f2 || echo "unknown")
    echo -e "${GREEN}✅ 数据库类型: $DB_TYPE${NC}"
else
    echo -e "${YELLOW}⚠️  .env 文件不存在${NC}"
fi
echo ""

# 总结
echo "======================================="
echo -e "${BLUE}📊 状态总结${NC}"
echo "======================================="

BACKEND_OK=$(curl -s http://localhost:3000/health > /dev/null 2>&1 && echo "yes" || echo "no")
FRONTEND_OK=$(curl -s http://localhost:3001 > /dev/null 2>&1 && echo "yes" || echo "no")

if [ "$BACKEND_OK" = "yes" ] && [ "$FRONTEND_OK" = "yes" ]; then
    echo -e "${GREEN}✅ 项目运行正常${NC}"
    echo ""
    echo "🌐 访问地址:"
    echo "   前端: http://localhost:3001"
    echo "   后端: http://localhost:3000"
elif [ "$BACKEND_OK" = "yes" ]; then
    echo -e "${YELLOW}⚠️  后端正常，前端未运行${NC}"
    echo ""
    echo "💡 启动前端:"
    echo "   cd /home/vue-element-admin && npm run dev"
elif [ "$FRONTEND_OK" = "yes" ]; then
    echo -e "${YELLOW}⚠️  前端正常，后端未运行${NC}"
    echo ""
    echo "💡 启动后端:"
    echo "   cd /home/vue-element-admin/backend && node server.js"
else
    echo -e "${RED}❌ 前后端服务均未运行${NC}"
    echo ""
    echo "💡 启动项目:"
    echo "   cd /home/vue-element-admin && ./start-project.sh"
fi
echo ""
