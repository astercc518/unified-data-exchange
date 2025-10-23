#!/bin/bash

# Vue Element Admin 完整启动脚本
# 同时启动前端和后端服务

echo "========================================"
echo "  Vue Element Admin 完整启动"
echo "========================================"

# 检查Node.js和npm
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 npm"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"
echo "✅ npm 版本: $(npm -v)"
echo ""

# 检查后端依赖
echo "📦 检查后端依赖..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "⚙️  安装后端依赖..."
    npm install
else
    echo "✅ 后端依赖已安装"
fi
cd ..

# 检查前端依赖
echo "📦 检查前端依赖..."
if [ ! -d "node_modules" ]; then
    echo "⚙️  安装前端依赖..."
    npm install
else
    echo "✅ 前端依赖已安装"
fi

echo ""
echo "========================================"
echo "  启动服务"
echo "========================================"

# 启动后端服务
echo "🚀 启动后端服务..."
cd backend
npm start &
BACKEND_PID=$!
echo "✅ 后端服务已启动 (PID: $BACKEND_PID)"
echo "📍 后端地址: http://localhost:3000"
cd ..

# 等待后端启动
echo "⏳ 等待后端服务启动..."
sleep 5

# 启动前端服务
echo "🚀 启动前端服务..."
npm run dev &
FRONTEND_PID=$!
echo "✅ 前端服务已启动 (PID: $FRONTEND_PID)"
echo "📍 前端地址: http://localhost:9530"

echo ""
echo "========================================"
echo "  服务启动完成"
echo "========================================"
echo "前端地址: http://localhost:9530"
echo "后端地址: http://localhost:3000"
echo "数据库模式: 已启用 (使用 SQLite)"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo "========================================"

# 等待用户中断
wait
