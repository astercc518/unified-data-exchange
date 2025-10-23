#!/bin/bash

# Vue Element Admin 项目备份脚本
# 版本: 1.0.0
# 作者: AI Assistant
# 日期: $(date +%Y-%m-%d)

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目信息
PROJECT_NAME="vue-element-admin"
VERSION="4.4.0"
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backup_${BACKUP_DATE}"

# 输出函数
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
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}           Vue Element Admin 备份工具${NC}"
    echo -e "${BLUE}================================================${NC}"
    echo -e "${GREEN}项目名称: ${PROJECT_NAME}${NC}"
    echo -e "${GREEN}项目版本: ${VERSION}${NC}"
    echo -e "${GREEN}备份时间: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
    echo -e "${BLUE}================================================${NC}"
}

# 检查依赖
check_dependencies() {
    print_info "检查系统依赖..."
    
    local deps=("node" "npm" "git" "tar" "zip")
    local missing_deps=()
    
    for dep in "${deps[@]}"; do
        if ! command -v $dep &> /dev/null; then
            missing_deps+=($dep)
        fi
    done
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "缺少以下依赖: ${missing_deps[*]}"
        print_info "请安装缺少的依赖后重新运行脚本"
        exit 1
    fi
    
    print_success "系统依赖检查通过"
}

# 创建备份目录
create_backup_dir() {
    print_info "创建备份目录: $BACKUP_DIR"
    
    if [ -d "$BACKUP_DIR" ]; then
        print_warning "备份目录已存在，将使用新的时间戳"
        BACKUP_DATE=$(date +%Y%m%d_%H%M%S_%N)
        BACKUP_DIR="backup_${BACKUP_DATE}"
    fi
    
    mkdir -p "$BACKUP_DIR"
    print_success "备份目录创建成功: $BACKUP_DIR"
}

# 备份源代码
backup_source() {
    print_info "备份源代码..."
    
    # 要备份的文件和目录
    local items=(
        "src/"
        "public/"
        "mock/"
        "build/"
        "tests/"
        "plop-templates/"
        "package.json"
        "package-lock.json"
        "vue.config.js"
        "babel.config.js"
        "jest.config.js"
        "jsconfig.json"
        "postcss.config.js"
        "plopfile.js"
        ".env.development"
        ".env.production"
        ".env.staging"
        ".eslintrc.js"
        ".eslintignore"
        ".editorconfig"
        ".gitignore"
        "README.md"
        "README.zh-CN.md"
        "LICENSE"
    )
    
    # 要备份的自定义文件
    local custom_files=(
        "*.html"
        "*.js"
        "*.md"
        "COUNTRY-SELECTOR-UPDATE.md"
        "DATA-TYPE-CUSTOM-REMARK-FEATURE.md"
        "DATA-TYPE-FEATURE.md"
        "TEST-RESULTS.md"
        "系统测试报告.md"
    )
    
    # 复制核心文件
    for item in "${items[@]}"; do
        if [ -e "$item" ]; then
            cp -r "$item" "$BACKUP_DIR/"
            print_info "已备份: $item"
        else
            print_warning "文件不存在，跳过: $item"
        fi
    done
    
    # 复制自定义文件
    for pattern in "${custom_files[@]}"; do
        for file in $pattern; do
            if [ -f "$file" ]; then
                cp "$file" "$BACKUP_DIR/"
                print_info "已备份自定义文件: $file"
            fi
        done 2>/dev/null || true
    done
    
    print_success "源代码备份完成"
}

# 备份Git信息
backup_git() {
    print_info "备份Git信息..."
    
    if [ -d ".git" ]; then
        # 获取Git信息
        git log --oneline -10 > "$BACKUP_DIR/git_history.txt" 2>/dev/null || true
        git status > "$BACKUP_DIR/git_status.txt" 2>/dev/null || true
        git branch -a > "$BACKUP_DIR/git_branches.txt" 2>/dev/null || true
        git remote -v > "$BACKUP_DIR/git_remotes.txt" 2>/dev/null || true
        
        # 创建Git信息摘要
        cat > "$BACKUP_DIR/git_info.md" << EOF
# Git 仓库信息

## 当前分支
\`\`\`
$(git branch --show-current 2>/dev/null || echo "无法获取当前分支")
\`\`\`

## 最后提交
\`\`\`
$(git log -1 --pretty=format:"%h %s (%an, %ar)" 2>/dev/null || echo "无法获取提交信息")
\`\`\`

## 仓库状态
\`\`\`
$(git status --porcelain 2>/dev/null || echo "无法获取状态信息")
\`\`\`

## 远程仓库
\`\`\`
$(git remote -v 2>/dev/null || echo "无远程仓库")
\`\`\`
EOF
        
        print_success "Git信息备份完成"
    else
        print_warning "不是Git仓库，跳过Git信息备份"
    fi
}

# 创建项目信息文件
create_project_info() {
    print_info "创建项目信息文件..."
    
    cat > "$BACKUP_DIR/PROJECT_INFO.md" << EOF
# Vue Element Admin 项目备份信息

## 项目基本信息
- **项目名称**: $PROJECT_NAME
- **项目版本**: $VERSION
- **备份时间**: $(date '+%Y-%m-%d %H:%M:%S')
- **备份目录**: $BACKUP_DIR
- **操作系统**: $(uname -a)

## 环境信息
- **Node.js版本**: $(node --version 2>/dev/null || echo "未安装")
- **NPM版本**: $(npm --version 2>/dev/null || echo "未安装")
- **Git版本**: $(git --version 2>/dev/null || echo "未安装")

## 项目结构
\`\`\`
$(tree -L 2 . 2>/dev/null || find . -maxdepth 2 -type d | head -20)
\`\`\`

## 依赖信息
详见 package.json 文件

## 自定义功能特性
1. **数据上传功能** - 支持文件上传和数据类型自定义
2. **资源中心** - 数据展示和购买功能
3. **数据列表管理** - 完整的增删改查和定价功能
4. **用户管理** - 多角色用户系统
5. **国际化支持** - 中英文界面切换
6. **响应式设计** - 支持移动端和桌面端

## 数据存储
- 使用 localStorage 进行前端数据持久化
- 支持数据实时同步和更新
- 按时效性分类数据存储（3天内、30天内、30天以上）

## 部署说明
请参考 DEPLOYMENT.md 文件进行部署

## 联系信息
- 备份创建者: AI Assistant
- 备份日期: $(date '+%Y-%m-%d')
EOF

    print_success "项目信息文件创建完成"
}

# 创建压缩包
create_archive() {
    print_info "创建压缩包..."
    
    local archive_name="${PROJECT_NAME}_backup_${BACKUP_DATE}"
    
    # 创建tar.gz压缩包
    tar -czf "${archive_name}.tar.gz" "$BACKUP_DIR/"
    print_success "创建tar.gz压缩包: ${archive_name}.tar.gz"
    
    # 创建zip压缩包（Windows兼容）
    if command -v zip &> /dev/null; then
        zip -r "${archive_name}.zip" "$BACKUP_DIR/" > /dev/null
        print_success "创建zip压缩包: ${archive_name}.zip"
    fi
    
    # 显示文件大小
    if [ -f "${archive_name}.tar.gz" ]; then
        local size=$(du -h "${archive_name}.tar.gz" | cut -f1)
        print_info "tar.gz 压缩包大小: $size"
    fi
    
    if [ -f "${archive_name}.zip" ]; then
        local size=$(du -h "${archive_name}.zip" | cut -f1)
        print_info "zip 压缩包大小: $size"
    fi
}

# 生成恢复脚本
create_restore_script() {
    print_info "生成恢复脚本..."
    
    cat > "$BACKUP_DIR/restore.sh" << 'EOF'
#!/bin/bash

# Vue Element Admin 项目恢复脚本

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_info "开始恢复 Vue Element Admin 项目..."

# 检查Node.js环境
if ! command -v node &> /dev/null; then
    print_error "Node.js 未安装，请先安装 Node.js (版本 >= 8.9)"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "NPM 未安装，请先安装 NPM"
    exit 1
fi

# 创建项目目录
TARGET_DIR=${1:-"vue-element-admin-restored"}
print_info "创建项目目录: $TARGET_DIR"

if [ -d "$TARGET_DIR" ]; then
    print_warning "目标目录已存在，请选择其他目录或删除现有目录"
    exit 1
fi

mkdir -p "$TARGET_DIR"

# 复制文件
print_info "复制项目文件..."
cp -r * "$TARGET_DIR/" 2>/dev/null || true

# 进入项目目录
cd "$TARGET_DIR"

# 安装依赖
print_info "安装项目依赖..."
npm install

print_success "项目恢复完成！"
print_info "进入项目目录: cd $TARGET_DIR"
print_info "启动开发服务器: npm run dev"
print_info "构建生产版本: npm run build:prod"
EOF

    chmod +x "$BACKUP_DIR/restore.sh"
    print_success "恢复脚本创建完成"
}

# 清理临时文件
cleanup() {
    print_info "清理临时文件..."
    
    if [ "$1" != "keep-dir" ]; then
        if [ -d "$BACKUP_DIR" ]; then
            rm -rf "$BACKUP_DIR"
            print_success "临时目录已清理"
        fi
    fi
}

# 显示完成信息
show_completion() {
    print_success "备份完成！"
    echo
    echo -e "${GREEN}备份文件:${NC}"
    ls -la *backup_${BACKUP_DATE}* 2>/dev/null || true
    echo
    echo -e "${BLUE}使用方法:${NC}"
    echo "1. 解压备份文件到目标目录"
    echo "2. 运行 restore.sh 脚本恢复项目"
    echo "3. 或者参考 DEPLOYMENT.md 进行手动部署"
    echo
    echo -e "${YELLOW}注意事项:${NC}"
    echo "- 确保目标环境已安装 Node.js (>= 8.9) 和 NPM"
    echo "- 如需 Git 仓库，请手动初始化或克隆"
    echo "- 生产部署前请检查环境配置文件"
}

# 主函数
main() {
    # 检查参数
    local keep_temp_dir=false
    for arg in "$@"; do
        case $arg in
            --keep-dir)
                keep_temp_dir=true
                shift
                ;;
            --help|-h)
                echo "Vue Element Admin 备份脚本"
                echo "用法: $0 [选项]"
                echo "选项:"
                echo "  --keep-dir  保留临时备份目录"
                echo "  --help, -h  显示帮助信息"
                exit 0
                ;;
        esac
    done
    
    # 显示头部信息
    print_header
    
    # 执行备份流程
    check_dependencies
    create_backup_dir
    backup_source
    backup_git
    create_project_info
    create_restore_script
    create_archive
    
    # 清理临时文件
    if [ "$keep_temp_dir" = false ]; then
        cleanup
    else
        cleanup "keep-dir"
        print_info "临时目录保留: $BACKUP_DIR"
    fi
    
    # 显示完成信息
    show_completion
}

# 错误处理
trap 'print_error "备份过程中发生错误，正在清理..."; cleanup; exit 1' ERR

# 运行主函数
main "$@"