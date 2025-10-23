#!/bin/bash

# Vue Element Admin 一键安装和启动脚本
# 自动完成数据库安装、后端部署、前端启动的完整流程

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo "========================================="
echo "Vue Element Admin 一键安装启动向导"
echo "========================================="
echo

# 步骤1：数据库环境
log_info "步骤 1/5: 安装数据库环境"
if [ -f "./setup-database.sh" ]; then
    chmod +x setup-database.sh
    if ./setup-database.sh; then
        log_success "数据库环境安装完成"
    else
        log_error "数据库安装失败，请检查错误信息"
        exit 1
    fi
else
    log_error "setup-database.sh 文件不存在"
    exit 1
fi

echo
log_info "步骤 2/5: 安装后端依赖"
if [ -d "./backend" ]; then
    cd backend
    if [ ! -d "node_modules" ]; then
        npm install --production
        log_success "后端依赖安装完成"
    else
        log_info "后端依赖已存在，跳过安装"
    fi
    cd ..
else
    log_error "backend 目录不存在"
    exit 1
fi

echo
log_info "步骤 3/5: 安装前端依赖"
if [ ! -d "node_modules" ]; then
    npm install
    log_success "前端依赖安装完成"
else
    log_info "前端依赖已存在，跳过安装"
fi

echo
log_info "步骤 4/5: 配置环境变量"
if [ ! -f ".env.development" ]; then
    cat > .env.development <<EOF
ENV = 'development'
VUE_APP_BASE_API = '/dev-api'
VUE_APP_STORAGE_MODE = 'database'
VUE_APP_API_URL = 'http://localhost:3000'
VUE_APP_USE_DATABASE = true
EOF
    log_success "环境配置创建完成"
fi

echo
log_info "步骤 5/5: 启动完整服务"
chmod +x start-full-stack.sh
./start-full-stack.sh

log_success "安装和启动完成！"