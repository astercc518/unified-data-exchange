#!/bin/bash

echo "========================================="
echo "📦 安装后端依赖"
echo "========================================="
echo ""

cd /home/vue-element-admin/backend

echo "当前目录: $(pwd)"
echo ""

if [ ! -f "package.json" ]; then
    echo "❌ 错误: package.json 文件不存在"
    exit 1
fi

echo "📋 package.json 存在"
echo ""

echo "🔍 检查 npm 版本..."
npm --version
echo ""

echo "🔍 检查 node 版本..."
node --version
echo ""

echo "📦 开始安装依赖..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 依赖安装成功！"
    echo ""
    echo "📁 node_modules 目录:"
    ls -la node_modules | head -10
else
    echo ""
    echo "❌ 依赖安装失败"
    exit 1
fi

echo ""
echo "========================================="
echo "✅ 安装完成"
echo "========================================="
