#!/bin/bash

# Vue Element Admin 一键部署脚本
# 版本: 1.0.0
# 支持环境: development, staging, production

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 打印横幅
print_banner() {
    echo -e "${GREEN}"
    echo "╔════════════════════════════════════════════════╗"
    echo "║   Vue Element Admin - 一键部署脚本             ║"
    echo "║   Author: Your Name                            ║"
    echo "║   Version: 1.0.0                               ║"
    echo "╚════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 未安装，请先安装 $1"
        return 1
    fi
    return 0
}

# 检查系统环境
check_environment() {
    log_info "检查系统环境..."
    
    # 检查 Node.js
    if ! check_command node; then
        log_error "请安装 Node.js (>= 14.0.0)"
        log_info "下载地址: https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 14 ]; then
        log_error "Node.js 版本过低，需要 >= 14.0.0"
        exit 1
    fi
    log_success "Node.js 版本: $(node -v)"
    
    # 检查 npm
    if ! check_command npm; then
        log_error "npm 未安装"
        exit 1
    fi
    log_success "npm 版本: $(npm -v)"
    
    # 检查 MySQL
    if ! check_command mysql; then
        log_warning "MySQL 客户端未安装，请确保 MySQL 服务器已安装并运行"
    else
        log_success "MySQL 已安装"
    fi
    
    # 检查 PM2
    if ! check_command pm2; then
        log_warning "PM2 未安装，将自动安装..."
        npm install -g pm2
        if [ $? -eq 0 ]; then
            log_success "PM2 安装成功"
        else
            log_error "PM2 安装失败"
            exit 1
        fi
    else
        log_success "PM2 已安装"
    fi
}

# 配置数据库
configure_database() {
    log_info "配置数据库..."
    
    # 读取数据库配置
    read -p "请输入 MySQL 主机地址 [localhost]: " DB_HOST
    DB_HOST=${DB_HOST:-localhost}
    
    read -p "请输入 MySQL 端口 [3306]: " DB_PORT
    DB_PORT=${DB_PORT:-3306}
    
    read -p "请输入数据库名称 [vue_admin]: " DB_NAME
    DB_NAME=${DB_NAME:-vue_admin}
    
    read -p "请输入数据库用户名 [root]: " DB_USER
    DB_USER=${DB_USER:-root}
    
    read -sp "请输入数据库密码: " DB_PASSWORD
    echo ""
    
    # 测试数据库连接
    log_info "测试数据库连接..."
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" &> /dev/null
    
    if [ $? -ne 0 ]; then
        log_error "数据库连接失败，请检查配置"
        exit 1
    fi
    log_success "数据库连接成功"
    
    # 创建数据库（如果不存在）
    log_info "创建数据库..."
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" &> /dev/null
    
    if [ $? -eq 0 ]; then
        log_success "数据库创建成功: $DB_NAME"
    else
        log_error "数据库创建失败"
        exit 1
    fi
    
    # 创建后端配置文件
    log_info "创建后端配置文件..."
    cat > backend/config/database.js << EOF
/**
 * 数据库配置
 */
module.exports = {
  host: '$DB_HOST',
  port: $DB_PORT,
  database: '$DB_NAME',
  username: '$DB_USER',
  password: '$DB_PASSWORD',
  dialect: 'mysql',
  timezone: '+08:00',
  logging: false,
  pool: {
    max: 20,
    min: 2,
    acquire: 60000,
    idle: 30000,
    evict: 60000
  }
};
EOF
    
    log_success "数据库配置文件已创建"
}

# 安装依赖
install_dependencies() {
    log_info "安装项目依赖..."
    
    # 安装前端依赖
    log_info "安装前端依赖..."
    npm install --legacy-peer-deps
    if [ $? -ne 0 ]; then
        log_error "前端依赖安装失败"
        exit 1
    fi
    log_success "前端依赖安装成功"
    
    # 安装后端依赖
    log_info "安装后端依赖..."
    cd backend
    npm install
    if [ $? -ne 0 ]; then
        log_error "后端依赖安装失败"
        exit 1
    fi
    cd ..
    log_success "后端依赖安装成功"
}

# 初始化数据库
initialize_database() {
    log_info "初始化数据库表结构和数据..."
    
    if [ -f "backend/scripts/init-database.js" ]; then
        node backend/scripts/init-database.js
        if [ $? -eq 0 ]; then
            log_success "数据库初始化成功"
        else
            log_error "数据库初始化失败"
            exit 1
        fi
    else
        log_warning "数据库初始化脚本不存在，跳过..."
    fi
}

# 构建前端
build_frontend() {
    log_info "构建前端项目..."
    
    read -p "是否构建生产版本？(y/n) [y]: " BUILD_PROD
    BUILD_PROD=${BUILD_PROD:-y}
    
    if [ "$BUILD_PROD" = "y" ] || [ "$BUILD_PROD" = "Y" ]; then
        npm run build:prod
        if [ $? -eq 0 ]; then
            log_success "前端构建成功"
        else
            log_error "前端构建失败"
            exit 1
        fi
    else
        log_info "跳过前端构建"
    fi
}

# 配置 PM2
configure_pm2() {
    log_info "配置 PM2..."
    
    # 检查 PM2 配置文件
    if [ ! -f "ecosystem.config.js" ]; then
        log_error "PM2 配置文件不存在"
        exit 1
    fi
    
    # 停止现有服务
    pm2 delete all &> /dev/null
    
    # 启动服务
    log_info "启动服务..."
    pm2 start ecosystem.config.js
    
    if [ $? -eq 0 ]; then
        log_success "服务启动成功"
    else
        log_error "服务启动失败"
        exit 1
    fi
    
    # 设置开机自启
    log_info "配置开机自启动..."
    pm2 startup
    pm2 save
    
    log_success "PM2 配置完成"
}

# 显示部署信息
show_deployment_info() {
    echo ""
    log_success "╔════════════════════════════════════════════════╗"
    log_success "║           🎉 部署完成！                        ║"
    log_success "╚════════════════════════════════════════════════╝"
    echo ""
    log_info "访问地址："
    log_info "  前端: http://localhost:9527"
    log_info "  后端: http://localhost:3000"
    echo ""
    log_info "默认账号："
    log_info "  管理员: admin / admin123"
    log_info "  代理: agent001 / agent123"
    log_info "  客户: KL08066V01 / 123456"
    echo ""
    log_warning "⚠️  请立即修改默认密码！"
    echo ""
    log_info "常用命令："
    log_info "  查看服务状态: pm2 status"
    log_info "  查看日志: pm2 logs"
    log_info "  重启服务: pm2 restart all"
    log_info "  停止服务: pm2 stop all"
    echo ""
}

# 主函数
main() {
    print_banner
    
    # 检查是否在项目根目录
    if [ ! -f "package.json" ]; then
        log_error "请在项目根目录运行此脚本"
        exit 1
    fi
    
    log_info "开始部署 Vue Element Admin..."
    echo ""
    
    # 1. 检查环境
    check_environment
    echo ""
    
    # 2. 配置数据库
    configure_database
    echo ""
    
    # 3. 安装依赖
    install_dependencies
    echo ""
    
    # 4. 初始化数据库
    initialize_database
    echo ""
    
    # 5. 构建前端
    build_frontend
    echo ""
    
    # 6. 配置 PM2
    configure_pm2
    echo ""
    
    # 7. 显示部署信息
    show_deployment_info
}

# 执行主函数
main
