#!/bin/bash

# Vue Element Admin 项目启动脚本
# 用法: ./start-project.sh

set -e

echo "======================================="
echo "    Vue Element Admin 项目启动脚本"
echo "======================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 Node.js
echo "📦 检查 Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js 未安装${NC}"
    exit 1
fi
NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js 已安装: $NODE_VERSION${NC}"

# 检查 npm
echo "📦 检查 npm..."
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm 未安装${NC}"
    exit 1
fi
NPM_VERSION=$(npm --version)
echo -e "${GREEN}✅ npm 已安装: $NPM_VERSION${NC}"
echo ""

# 进入项目目录
cd "$(dirname "$0")"
PROJECT_ROOT=$(pwd)

# 停止已运行的进程
echo "🛑 停止已运行的进程..."
pkill -f "node.*backend/server.js" 2>/dev/null || true
pkill -f "vue-cli-service serve" 2>/dev/null || true
sleep 2
echo ""

# 启动后端服务
echo "🚀 启动后端服务..."
cd "$PROJECT_ROOT/backend"

# 检查 node_modules
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  后端依赖未安装，正在安装...${NC}"
    npm install
fi

# 启动后端
nohup node server.js > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✅ 后端服务已启动 (PID: $BACKEND_PID)${NC}"

# 等待后端启动
echo "⏳ 等待后端服务启动..."
for i in {1..10}; do
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 后端服务已就绪${NC}"
        break
    fi
    if [ $i -eq 10 ]; then
        echo -e "${RED}❌ 后端服务启动超时${NC}"
        echo "后端日志:"
        tail -20 /tmp/backend.log
        exit 1
    fi
    sleep 1
    echo -n "."
done
echo ""

# 启动前端服务
echo "🚀 启动前端服务..."
cd "$PROJECT_ROOT"

# 检查 node_modules
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  前端依赖未安装，正在安装...${NC}"
    npm install
fi

# 启动前端
nohup npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✅ 前端服务已启动 (PID: $FRONTEND_PID)${NC}"

# 等待前端启动
echo "⏳ 等待前端服务启动..."
for i in {1..30}; do
    if curl -s http://localhost:3001 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 前端服务已就绪${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${YELLOW}⚠️  前端服务启动较慢，请稍候...${NC}"
        break
    fi
    sleep 1
    echo -n "."
done
echo ""

# 显示服务状态
echo "======================================="
echo -e "${GREEN}✅ 项目启动成功！${NC}"
echo "======================================="
echo ""
echo "📍 服务地址:"
echo "   后端服务: http://localhost:3000"
echo "   前端服务: http://localhost:3001"
echo ""
echo "📊 进程信息:"
echo "   后端 PID: $BACKEND_PID"
echo "   前端 PID: $FRONTEND_PID"
echo ""
echo "📋 日志文件:"
echo "   后端日志: /tmp/backend.log"
echo "   前端日志: /tmp/frontend.log"
echo ""
echo "🛑 停止服务:"
echo "   pkill -f 'node.*backend/server.js'"
echo "   pkill -f 'vue-cli-service serve'"
echo ""
echo "💡 查看日志:"
echo "   tail -f /tmp/backend.log"
echo "   tail -f /tmp/frontend.log"
echo ""
