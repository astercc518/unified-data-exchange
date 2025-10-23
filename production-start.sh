#!/bin/bash

# 生产环境快速启动脚本
# 使用测试服务器快速上线，后续可升级到MySQL

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[!]${NC} $1"; }
log_error() { echo -e "${RED}[✗]${NC} $1"; }

echo "========================================"
echo " Vue Element Admin 生产环境快速启动"
echo "========================================"
echo

# 检查Node.js版本
log_info "检查Node.js环境"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    log_success "Node.js已安装: $NODE_VERSION"
else
    log_error "Node.js未安装，请先安装Node.js 16+"
    exit 1
fi

# 检查当前目录
if [ ! -f "package.json" ]; then
    log_error "请在项目根目录下运行此脚本"
    exit 1
fi

# 停止已运行的服务
log_info "停止已运行的服务"
pkill -f "node.*test-server" 2>/dev/null || true
pkill -f "vue-cli-service" 2>/dev/null || true
log_success "已停止旧服务"

# 检查MySQL是否可用
log_info "检查MySQL环境"
if command -v mysql &> /dev/null && systemctl is-active --quiet mysqld 2>/dev/null; then
    log_success "MySQL已安装并运行"
    USE_MYSQL=true
    
    # 测试数据库连接
    if mysql -u vue_admin_user -pvue_admin_2024 -D vue_admin -e "SELECT 1;" &> /dev/null 2>&1; then
        log_success "数据库连接成功"
        SERVER_TYPE="production"
    else
        log_warning "数据库连接失败，将使用测试服务器"
        USE_MYSQL=false
        SERVER_TYPE="test"
    fi
else
    log_warning "MySQL未安装，将使用测试服务器（内存存储）"
    USE_MYSQL=false
    SERVER_TYPE="test"
fi

# 安装后端依赖
log_info "检查后端依赖"
cd backend
if [ ! -d "node_modules" ]; then
    log_info "安装后端依赖..."
    npm install
    log_success "后端依赖安装完成"
else
    log_success "后端依赖已存在"
fi

# 启动后端服务器
log_info "启动后端服务器（$SERVER_TYPE 模式）"
if [ "$USE_MYSQL" = true ]; then
    # 创建.env文件
    cat > .env << EOF
# 生产环境配置
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=vue_admin
DB_USER=vue_admin_user
DB_PASSWORD=vue_admin_2024

PORT=3000
NODE_ENV=production
FRONTEND_URL=http://localhost:9529
EOF
    
    nohup node server.js > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    log_success "生产服务器已启动 (PID: $BACKEND_PID)"
else
    nohup node test-server.js > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    log_success "测试服务器已启动 (PID: $BACKEND_PID)"
fi

cd ..

# 等待后端启动
log_info "等待后端服务器启动..."
sleep 3

# 测试后端健康检查
if curl -s http://localhost:3000/health &> /dev/null; then
    log_success "后端服务器运行正常"
    
    # 显示健康检查结果
    HEALTH_INFO=$(curl -s http://localhost:3000/health)
    echo "$HEALTH_INFO" | head -n 5
else
    log_error "后端服务器启动失败，请检查日志: logs/backend.log"
    exit 1
fi

# 安装前端依赖
log_info "检查前端依赖"
if [ ! -d "node_modules" ]; then
    log_info "安装前端依赖..."
    npm install
    log_success "前端依赖安装完成"
else
    log_success "前端依赖已存在"
fi

# 启动前端开发服务器
log_info "启动前端开发服务器"
nohup npm run dev > logs/frontend.log 2>&1 &
FRONTEND_PID=$!
log_success "前端服务器已启动 (PID: $FRONTEND_PID)"

# 等待前端启动
log_info "等待前端服务器启动..."
sleep 5

echo
echo "========================================"
log_success "系统启动成功！"
echo "========================================"
echo
echo "服务信息:"
echo "  后端服务器: http://localhost:3000"
echo "  前端应用:   http://localhost:9529"
echo "  服务器类型: $SERVER_TYPE"
echo
echo "进程信息:"
echo "  后端 PID: $BACKEND_PID"
echo "  前端 PID: $FRONTEND_PID"
echo
echo "默认账号:"
echo "  管理员: admin / 111111"
echo "  测试客户: KL01880V01 / 123456"
echo "  代理: agent001 / agent123"
echo
echo "日志文件:"
echo "  后端日志: logs/backend.log"
echo "  前端日志: logs/frontend.log"
echo
echo "停止服务:"
echo "  pkill -f 'node.*test-server'"
echo "  pkill -f 'vue-cli-service'"
echo
echo "查看日志:"
echo "  tail -f logs/backend.log"
echo "  tail -f logs/frontend.log"
echo

if [ "$USE_MYSQL" = false ]; then
    echo "========================================"
    log_warning "当前使用测试服务器（内存存储）"
    echo "========================================"
    echo
    echo "数据将在服务重启后丢失。"
    echo
    echo "升级到MySQL生产环境:"
    echo "  1. 安装MySQL: ./setup-database.sh"
    echo "  2. 重启服务: ./production-start.sh"
    echo
fi

# 保存PID到文件
mkdir -p .runtime
echo "$BACKEND_PID" > .runtime/backend.pid
echo "$FRONTEND_PID" > .runtime/frontend.pid

log_success "系统已成功上线！"
