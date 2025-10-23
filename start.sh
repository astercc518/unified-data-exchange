#!/bin/bash

# Vue Element Admin 快速启动脚本
# 一键安装、配置和启动项目

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    clear
    echo -e "${CYAN}================================================${NC}"
    echo -e "${CYAN}        Vue Element Admin 快速启动脚本${NC}"
    echo -e "${CYAN}================================================${NC}"
    echo -e "${GREEN}版本: 4.4.0${NC}"
    echo -e "${GREEN}时间: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
    echo -e "${CYAN}================================================${NC}"
    echo
}

# 检查是否在项目目录
check_project_dir() {
    if [ ! -f "package.json" ] || [ ! -d "src" ]; then
        print_error "请在 Vue Element Admin 项目根目录下运行此脚本"
        exit 1
    fi
}

# 一键启动
quick_start() {
    print_header
    
    print_info "正在检查项目环境..."
    check_project_dir
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js 未安装，请先安装 Node.js"
        exit 1
    fi
    
    # 检查依赖
    if [ ! -d "node_modules" ]; then
        print_info "检测到未安装依赖，开始安装..."
        npm install
        print_success "依赖安装完成"
    fi
    
    # 检查端口
    local port=9527
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "端口 $port 已被占用"
        local pid=$(lsof -ti:$port)
        print_info "占用进程 PID: $pid"
        kill -9 $pid 2>/dev/null || true
        sleep 2
    fi
    
    print_success "环境检查完成，准备启动开发服务器..."
    print_info "访问地址: http://localhost:$port"
    print_info "按 Ctrl+C 停止服务器"
    echo
    
    # 启动开发服务器
    npm run dev
}

# 显示帮助
show_help() {
    echo "Vue Element Admin 快速启动脚本"
    echo
    echo "用法:"
    echo "  ./start.sh          快速启动开发服务器"
    echo "  ./start.sh --help   显示帮助信息"
    echo
    echo "功能:"
    echo "  - 自动检查环境依赖"
    echo "  - 自动安装 npm 依赖"
    echo "  - 自动处理端口冲突"
    echo "  - 启动开发服务器"
    echo
    echo "注意事项:"
    echo "  - 请确保已安装 Node.js (>= 8.9.0)"
    echo "  - 请在项目根目录下运行此脚本"
    echo "  - 首次启动需要安装依赖，可能需要几分钟"
}

# 主函数
main() {
    case "${1:-}" in
        --help|-h)
            show_help
            ;;
        "")
            quick_start
            ;;
        *)
            print_error "未知参数: $1"
            echo "使用 --help 查看帮助信息"
            exit 1
            ;;
    esac
}

# 错误处理
trap 'print_error "启动过程中发生错误"; exit 1' ERR

# 运行主函数
main "$@"