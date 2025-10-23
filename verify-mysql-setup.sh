#!/bin/bash

# MySQL环境验证脚本
# 用于快速验证MySQL是否正确安装和配置

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
echo " MySQL环境验证脚本"
echo "========================================"
echo

# 数据库配置
DB_NAME="vue_admin"
DB_USER="vue_admin_user"
DB_PASSWORD="vue_admin_2024"
DB_HOST="localhost"
DB_PORT="3306"

# 1. 检查MySQL是否安装
log_info "1/7: 检查MySQL是否安装"
if command -v mysql &> /dev/null; then
    MYSQL_VERSION=$(mysql --version)
    log_success "MySQL已安装: $MYSQL_VERSION"
else
    log_error "MySQL未安装"
    echo
    echo "请先安装MySQL:"
    echo "  CentOS 7: "
    echo "    wget https://dev.mysql.com/get/mysql80-community-release-el7-3.noarch.rpm"
    echo "    sudo yum install mysql80-community-release-el7-3.noarch.rpm"
    echo "    sudo yum install mysql-community-server"
    echo
    exit 1
fi

# 2. 检查MySQL服务状态
log_info "2/7: 检查MySQL服务状态"
if systemctl is-active --quiet mysqld || systemctl is-active --quiet mysql || systemctl is-active --quiet mariadb; then
    log_success "MySQL服务正在运行"
else
    log_error "MySQL服务未运行"
    echo
    echo "启动MySQL服务:"
    echo "  sudo systemctl start mysqld"
    echo "  sudo systemctl enable mysqld"
    echo
    exit 1
fi

# 3. 测试MySQL连接
log_info "3/7: 测试MySQL root连接"
if mysql -h $DB_HOST -P $DB_PORT -u root -e "SELECT 1;" &> /dev/null; then
    log_success "MySQL root连接成功（无密码）"
    MYSQL_ROOT_CMD="mysql -h $DB_HOST -P $DB_PORT -u root"
else
    log_warning "MySQL root需要密码"
    echo -n "请输入MySQL root密码: "
    read -s ROOT_PASSWORD
    echo
    
    if mysql -h $DB_HOST -P $DB_PORT -u root -p"$ROOT_PASSWORD" -e "SELECT 1;" &> /dev/null; then
        log_success "MySQL root连接成功"
        MYSQL_ROOT_CMD="mysql -h $DB_HOST -P $DB_PORT -u root -p$ROOT_PASSWORD"
    else
        log_error "MySQL root连接失败"
        exit 1
    fi
fi

# 4. 检查数据库是否存在
log_info "4/7: 检查数据库 '$DB_NAME'"
if $MYSQL_ROOT_CMD -e "USE $DB_NAME;" &> /dev/null; then
    log_success "数据库 '$DB_NAME' 已存在"
else
    log_warning "数据库 '$DB_NAME' 不存在，正在创建..."
    $MYSQL_ROOT_CMD -e "CREATE DATABASE $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    log_success "数据库 '$DB_NAME' 创建成功"
fi

# 5. 检查用户是否存在
log_info "5/7: 检查数据库用户 '$DB_USER'"
USER_EXISTS=$($MYSQL_ROOT_CMD -sse "SELECT COUNT(*) FROM mysql.user WHERE user='$DB_USER' AND host='localhost';")

if [ "$USER_EXISTS" -eq "1" ]; then
    log_success "用户 '$DB_USER' 已存在"
else
    log_warning "用户 '$DB_USER' 不存在，正在创建..."
    $MYSQL_ROOT_CMD -e "CREATE USER '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';"
    $MYSQL_ROOT_CMD -e "GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';"
    $MYSQL_ROOT_CMD -e "FLUSH PRIVILEGES;"
    log_success "用户 '$DB_USER' 创建成功"
fi

# 6. 测试应用用户连接
log_info "6/7: 测试应用用户连接"
if mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD -D $DB_NAME -e "SELECT 1;" &> /dev/null; then
    log_success "应用用户连接成功"
else
    log_error "应用用户连接失败"
    exit 1
fi

# 7. 检查数据表
log_info "7/7: 检查数据表"
TABLES=$(mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD -D $DB_NAME -sse "SHOW TABLES;")

if [ -z "$TABLES" ]; then
    log_warning "数据库为空，需要导入Schema"
    echo
    echo "导入数据库Schema:"
    echo "  mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME < database/schema.sql"
    echo
    
    # 尝试自动导入
    if [ -f "database/schema.sql" ]; then
        log_info "发现schema.sql文件，是否自动导入? (y/N)"
        read -r IMPORT_CONFIRM
        if [ "$IMPORT_CONFIRM" = "y" ] || [ "$IMPORT_CONFIRM" = "Y" ]; then
            mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_NAME < database/schema.sql
            log_success "Schema导入成功"
            
            # 再次检查表
            TABLES=$(mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD -D $DB_NAME -sse "SHOW TABLES;")
        fi
    fi
fi

if [ -n "$TABLES" ]; then
    log_success "数据表检查完成"
    echo
    echo "数据库表列表:"
    echo "$TABLES" | while read -r table; do
        COUNT=$(mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD -D $DB_NAME -sse "SELECT COUNT(*) FROM $table;")
        echo "  - $table: $COUNT 条记录"
    done
fi

echo
echo "========================================"
log_success "MySQL环境验证完成！"
echo "========================================"
echo
echo "数据库配置信息:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Password: $DB_PASSWORD"
echo
echo "环境变量配置 (backend/.env):"
echo "  DB_TYPE=mysql"
echo "  DB_HOST=$DB_HOST"
echo "  DB_PORT=$DB_PORT"
echo "  DB_NAME=$DB_NAME"
echo "  DB_USER=$DB_USER"
echo "  DB_PASSWORD=$DB_PASSWORD"
echo
echo "下一步:"
echo "  1. 配置backend/.env文件"
echo "  2. 启动后端服务器: cd backend && npm start"
echo "  3. 测试API: curl http://localhost:3000/health"
echo
