#!/bin/bash

# Vue Element Admin 数据库环境安装脚本
# 自动安装MySQL并创建项目数据库

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目配置
PROJECT_NAME="vue-element-admin"
DB_NAME="vue_admin"
DB_USER="vue_admin_user"
DB_PASSWORD="vue_admin_2024"
DB_ROOT_PASSWORD="root123456"

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

# 检查系统类型
detect_system() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if [ -f /etc/redhat-release ]; then
            SYSTEM="centos"
            PKG_MANAGER="yum"
        elif [ -f /etc/debian_version ]; then
            SYSTEM="ubuntu"
            PKG_MANAGER="apt"
        else
            SYSTEM="linux"
            PKG_MANAGER="unknown"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        SYSTEM="macos"
        PKG_MANAGER="brew"
    else
        SYSTEM="unknown"
        PKG_MANAGER="unknown"
    fi
    
    log_info "检测到系统类型: $SYSTEM"
}

# 检查MySQL是否已安装
check_mysql() {
    if command -v mysql >/dev/null 2>&1; then
        log_success "MySQL 已安装"
        mysql --version
        return 0
    else
        log_warning "MySQL 未安装"
        return 1
    fi
}

# 安装MySQL
install_mysql() {
    log_info "开始安装 MySQL..."
    
    case $SYSTEM in
        "centos")
            sudo $PKG_MANAGER update -y
            sudo $PKG_MANAGER install -y mysql-server mysql
            sudo systemctl start mysqld
            sudo systemctl enable mysqld
            ;;
        "ubuntu")
            sudo $PKG_MANAGER update
            sudo $PKG_MANAGER install -y mysql-server mysql-client
            sudo systemctl start mysql
            sudo systemctl enable mysql
            ;;
        "macos")
            if ! command -v brew >/dev/null 2>&1; then
                log_error "请先安装 Homebrew"
                exit 1
            fi
            brew install mysql
            brew services start mysql
            ;;
        *)
            log_error "不支持的系统类型: $SYSTEM"
            exit 1
            ;;
    esac
    
    log_success "MySQL 安装完成"
}

# 设置MySQL root密码
setup_mysql_root() {
    log_info "设置 MySQL root 密码..."
    
    if [[ "$SYSTEM" == "ubuntu" ]]; then
        # Ubuntu MySQL 5.7+ 默认使用 auth_socket 认证
        sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$DB_ROOT_PASSWORD';"
        sudo mysql -e "FLUSH PRIVILEGES;"
    else
        # 使用 mysql_secure_installation 的自动化版本
        mysql -u root <<EOF
ALTER USER 'root'@'localhost' IDENTIFIED BY '$DB_ROOT_PASSWORD';
DELETE FROM mysql.user WHERE User='';
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
DROP DATABASE IF EXISTS test;
DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';
FLUSH PRIVILEGES;
EOF
    fi
    
    log_success "MySQL root 密码设置完成"
}

# 创建数据库和用户
create_database() {
    log_info "创建项目数据库和用户..."
    
    mysql -u root -p$DB_ROOT_PASSWORD <<EOF
-- 创建数据库
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
CREATE USER IF NOT EXISTS '$DB_USER'@'%' IDENTIFIED BY '$DB_PASSWORD';

-- 授权
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'%';

-- 刷新权限
FLUSH PRIVILEGES;

-- 显示创建的数据库
SHOW DATABASES LIKE '$DB_NAME';
EOF

    log_success "数据库创建完成"
    log_info "数据库名称: $DB_NAME"
    log_info "用户名: $DB_USER"
    log_info "密码: $DB_PASSWORD"
}

# 执行数据库结构初始化
init_database_schema() {
    log_info "初始化数据库结构..."
    
    local schema_file="./database/schema.sql"
    if [ ! -f "$schema_file" ]; then
        log_error "数据库结构文件不存在: $schema_file"
        log_info "请确保在项目根目录下运行此脚本"
        return 1
    fi
    
    mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME < $schema_file
    
    if [ $? -eq 0 ]; then
        log_success "数据库结构初始化完成"
    else
        log_error "数据库结构初始化失败"
        return 1
    fi
}

# 测试数据库连接
test_connection() {
    log_info "测试数据库连接..."
    
    mysql -u $DB_USER -p$DB_PASSWORD -e "USE $DB_NAME; SHOW TABLES;" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        log_success "数据库连接测试成功"
        
        # 显示表统计
        local table_count=$(mysql -u $DB_USER -p$DB_PASSWORD -se "USE $DB_NAME; SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$DB_NAME';" 2>/dev/null)
        log_info "数据表数量: $table_count"
        
        # 显示表列表
        log_info "数据表列表:"
        mysql -u $DB_USER -p$DB_PASSWORD -e "USE $DB_NAME; SHOW TABLES;" 2>/dev/null
        
        return 0
    else
        log_error "数据库连接测试失败"
        return 1
    fi
}

# 创建数据库配置文件
create_db_config() {
    log_info "创建数据库配置文件..."
    
    cat > database/config.json <<EOF
{
  "development": {
    "host": "localhost",
    "port": 3306,
    "database": "$DB_NAME",
    "username": "$DB_USER",
    "password": "$DB_PASSWORD",
    "dialect": "mysql",
    "charset": "utf8mb4",
    "timezone": "+08:00"
  },
  "production": {
    "host": "localhost",
    "port": 3306,
    "database": "$DB_NAME",
    "username": "$DB_USER",
    "password": "$DB_PASSWORD",
    "dialect": "mysql",
    "charset": "utf8mb4",
    "timezone": "+08:00"
  }
}
EOF

    # 创建环境变量文件
    cat > .env.database <<EOF
# MySQL 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_CHARSET=utf8mb4
DB_TIMEZONE=+08:00

# 连接池配置
DB_POOL_MIN=5
DB_POOL_MAX=20
DB_POOL_ACQUIRE=30000
DB_POOL_IDLE=10000

# 日志配置
DB_LOGGING=true
EOF

    log_success "配置文件创建完成"
    log_info "配置文件位置:"
    log_info "  - database/config.json"
    log_info "  - .env.database"
}

# 生成连接示例
generate_connection_examples() {
    log_info "生成数据库连接示例..."
    
    mkdir -p examples
    
    # Node.js 连接示例
    cat > examples/mysql-connection-nodejs.js <<EOF
/**
 * Node.js MySQL 连接示例
 */
const mysql = require('mysql2/promise');

// 数据库配置
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: '$DB_USER',
  password: '$DB_PASSWORD',
  database: '$DB_NAME',
  charset: 'utf8mb4',
  timezone: '+08:00'
};

// 创建连接池
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 测试连接
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ 数据库连接成功');
    
    const [rows] = await connection.execute('SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = ?', ['$DB_NAME']);
    console.log(\`📊 数据表数量: \${rows[0].table_count}\`);
    
    connection.release();
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
  }
}

testConnection();

module.exports = pool;
EOF

    # Python 连接示例
    cat > examples/mysql-connection-python.py <<EOF
#!/usr/bin/env python3
"""
Python MySQL 连接示例
"""
import pymysql
from contextlib import contextmanager

# 数据库配置
DB_CONFIG = {
    'host': 'localhost',
    'port': 3306,
    'user': '$DB_USER',
    'password': '$DB_PASSWORD',
    'database': '$DB_NAME',
    'charset': 'utf8mb4'
}

@contextmanager
def get_db_connection():
    """数据库连接上下文管理器"""
    connection = None
    try:
        connection = pymysql.connect(**DB_CONFIG)
        yield connection
    except Exception as e:
        print(f'❌ 数据库连接失败: {e}')
        if connection:
            connection.rollback()
        raise
    finally:
        if connection:
            connection.close()

def test_connection():
    """测试数据库连接"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = %s", ('$DB_NAME',))
            table_count = cursor.fetchone()[0]
            print(f'✅ 数据库连接成功')
            print(f'📊 数据表数量: {table_count}')
    except Exception as e:
        print(f'❌ 连接测试失败: {e}')

if __name__ == '__main__':
    test_connection()
EOF

    chmod +x examples/mysql-connection-python.py
    
    log_success "连接示例生成完成"
    log_info "示例文件位置:"
    log_info "  - examples/mysql-connection-nodejs.js"
    log_info "  - examples/mysql-connection-python.py"
}

# 主函数
main() {
    echo "========================================="
    echo "Vue Element Admin 数据库环境安装向导"
    echo "========================================="
    
    # 检查是否为 root 用户
    if [[ $EUID -eq 0 ]]; then
        log_warning "建议不要使用 root 用户运行此脚本"
        read -p "是否继续? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    # 检测系统
    detect_system
    
    # 检查MySQL
    if ! check_mysql; then
        read -p "是否要安装 MySQL? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            install_mysql
        else
            log_error "MySQL 是必需的，请手动安装后重新运行此脚本"
            exit 1
        fi
    fi
    
    # 设置root密码
    read -p "是否要设置 MySQL root 密码? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        setup_mysql_root
    fi
    
    # 创建数据库
    create_database
    
    # 初始化数据库结构
    init_database_schema
    
    # 测试连接
    test_connection
    
    # 创建配置文件
    create_db_config
    
    # 生成连接示例
    generate_connection_examples
    
    echo "========================================="
    log_success "数据库环境安装完成!"
    echo "========================================="
    
    echo
    log_info "📋 安装摘要:"
    echo "  数据库名: $DB_NAME"
    echo "  用户名: $DB_USER"
    echo "  密码: $DB_PASSWORD"
    echo "  主机: localhost"
    echo "  端口: 3306"
    echo
    
    log_info "📁 生成的文件:"
    echo "  - database/config.json (数据库配置)"
    echo "  - .env.database (环境变量)"
    echo "  - examples/mysql-connection-nodejs.js (Node.js示例)"
    echo "  - examples/mysql-connection-python.py (Python示例)"
    echo
    
    log_info "🚀 下一步:"
    echo "  1. 实现后端API服务"
    echo "  2. 配置前端环境"
    echo "  3. 执行数据迁移"
    echo
}

# 脚本入口
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi