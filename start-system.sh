#!/bin/bash

echo "========================================="
echo "🚀 Vue Element Admin 完整系统启动"
echo "========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 检查并启动后端
echo "1️⃣ 检查后端服务..."
echo "-----------------------------------"

if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 后端服务已运行${NC}"
else
    echo -e "${YELLOW}⚠️  后端服务未运行，正在启动...${NC}"
    
    cd /home/vue-element-admin/backend
    
    # 检查依赖
    if [ ! -d "node_modules" ]; then
        echo "   📦 安装后端依赖..."
        npm install > /tmp/backend-install.log 2>&1
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}   ✅ 依赖安装成功${NC}"
        else
            echo -e "${RED}   ❌ 依赖安装失败，请查看: /tmp/backend-install.log${NC}"
            exit 1
        fi
    fi
    
    # 启动后端
    echo "   🚀 启动后端服务..."
    nohup node server.js > /tmp/backend.log 2>&1 &
    BACKEND_PID=$!
    echo "   后端进程 PID: $BACKEND_PID"
    
    # 等待后端就绪
    echo "   ⏳ 等待后端就绪..."
    for i in {1..30}; do
        if curl -s http://localhost:3000/health > /dev/null 2>&1; then
            echo -e "${GREEN}   ✅ 后端服务就绪${NC}"
            break
        fi
        echo -n "."
        sleep 1
    done
    echo ""
fi

echo ""

# 2. 检查并启动前端
echo "2️⃣ 检查前端服务..."
echo "-----------------------------------"

if curl -s -I http://localhost:9527 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 前端服务已运行${NC}"
else
    echo -e "${YELLOW}⚠️  前端服务未运行，正在启动...${NC}"
    
    cd /home/vue-element-admin
    
    # 启动前端
    echo "   🚀 启动前端开发服务器..."
    nohup npm run dev > /tmp/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo "   前端进程 PID: $FRONTEND_PID"
    
    # 等待前端就绪
    echo "   ⏳ 等待前端编译..."
    sleep 10
fi

echo ""

# 3. 验证服务状态
echo "3️⃣ 验证服务状态..."
echo "-----------------------------------"

# 检查后端
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 后端服务: 正常 (http://localhost:3000)${NC}"
    HEALTH=$(curl -s http://localhost:3000/health | head -1)
    echo "   $HEALTH"
else
    echo -e "${RED}❌ 后端服务: 异常${NC}"
    echo "   请查看日志: tail -f /tmp/backend.log"
fi

# 检查前端
if curl -s -I http://localhost:9527 | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ 前端服务: 正常 (http://localhost:9527)${NC}"
else
    echo -e "${YELLOW}⚠️  前端服务: 编译中...${NC}"
    echo "   请查看日志: tail -f /tmp/frontend.log"
fi

echo ""

# 4. 系统信息
echo "========================================="
echo "✅ 系统启动完成"
echo "========================================="
echo ""
echo "📍 访问地址:"
echo "   前端: ${GREEN}http://localhost:9527${NC}"
echo "   后端: ${GREEN}http://localhost:3000${NC}"
echo ""
echo "📝 查看日志:"
echo "   后端: tail -f /tmp/backend.log"
echo "   前端: tail -f /tmp/frontend.log"
echo ""
echo "🔍 检查进程:"
echo "   ps aux | grep node"
echo ""
echo "🛑 停止服务:"
echo "   pkill -f 'node server.js'"
echo "   pkill -f 'npm run dev'"
echo ""
echo "⚠️  ${YELLOW}重要提示${NC}:"
echo "   访问前端后请${YELLOW}强制刷新浏览器${NC} (Ctrl+F5 或 Cmd+Shift+R)"
echo "   以确保加载最新的代码修复"
echo ""
echo "========================================="
