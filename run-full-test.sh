#!/bin/bash

# Vue Element Admin 完整项目测试脚本
# 测试日期: 2025-10-13

echo "=========================================="
echo "🧪 Vue Element Admin 完整项目测试"
echo "=========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 测试结果统计
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 测试项目列表
declare -a TEST_ITEMS=(
    "项目结构检查"
    "依赖安装检查"
    "代码语法检查(Lint)"
    "单元测试"
    "组件测试"
    "构建测试"
    "服务状态组件测试"
)

# 测试函数
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}测试 $TOTAL_TESTS: $test_name${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ $test_name - 通过${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}❌ $test_name - 失败${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# 1. 项目结构检查
test_project_structure() {
    echo "检查关键目录和文件..."
    
    local required_dirs=(
        "src"
        "src/views"
        "src/views/dashboard"
        "src/views/dashboard/admin"
        "src/views/dashboard/admin/components"
        "src/components"
        "src/utils"
        "src/lang"
        "backend"
        "tests"
    )
    
    local required_files=(
        "package.json"
        "vue.config.js"
        "jest.config.js"
        "src/main.js"
        "src/views/dashboard/admin/components/ServiceStatusCard.vue"
        "src/lang/index.js"
    )
    
    local missing_count=0
    
    # 检查目录
    for dir in "${required_dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            echo -e "${RED}  ✗ 目录缺失: $dir${NC}"
            missing_count=$((missing_count + 1))
        else
            echo -e "${GREEN}  ✓ 目录存在: $dir${NC}"
        fi
    done
    
    # 检查文件
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            echo -e "${RED}  ✗ 文件缺失: $file${NC}"
            missing_count=$((missing_count + 1))
        else
            echo -e "${GREEN}  ✓ 文件存在: $file${NC}"
        fi
    done
    
    if [ $missing_count -eq 0 ]; then
        echo -e "${GREEN}所有必需的目录和文件都存在${NC}"
        return 0
    else
        echo -e "${RED}发现 $missing_count 个缺失项${NC}"
        return 1
    fi
}

# 2. 依赖检查
test_dependencies() {
    echo "检查node_modules..."
    
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}node_modules 不存在,正在安装依赖...${NC}"
        npm install
        if [ $? -ne 0 ]; then
            echo -e "${RED}依赖安装失败${NC}"
            return 1
        fi
    fi
    
    echo "检查关键依赖包..."
    local required_packages=(
        "vue"
        "element-ui"
        "axios"
        "vuex"
        "vue-router"
        "@vue/test-utils"
        "jest"
    )
    
    local missing_deps=0
    for package in "${required_packages[@]}"; do
        if [ ! -d "node_modules/$package" ]; then
            echo -e "${RED}  ✗ 缺少依赖: $package${NC}"
            missing_deps=$((missing_deps + 1))
        else
            echo -e "${GREEN}  ✓ 依赖已安装: $package${NC}"
        fi
    done
    
    if [ $missing_deps -eq 0 ]; then
        return 0
    else
        return 1
    fi
}

# 3. 代码语法检查
test_lint() {
    echo "运行 ESLint 检查..."
    npm run lint -- --no-fix --max-warnings 10
    return $?
}

# 4. 单元测试
test_unit() {
    echo "运行单元测试..."
    npm run test:unit
    return $?
}

# 5. 组件测试
test_components() {
    echo "测试 ServiceStatusCard 组件..."
    
    # 检查组件文件
    if [ ! -f "src/views/dashboard/admin/components/ServiceStatusCard.vue" ]; then
        echo -e "${RED}ServiceStatusCard.vue 不存在${NC}"
        return 1
    fi
    
    # 检查测试文件
    if [ ! -f "tests/unit/views/dashboard/ServiceStatusCard.spec.js" ]; then
        echo -e "${YELLOW}测试文件不存在,跳过组件测试${NC}"
        return 0
    fi
    
    # 运行特定组件测试
    npx jest tests/unit/views/dashboard/ServiceStatusCard.spec.js
    return $?
}

# 6. 构建测试
test_build() {
    echo "测试项目构建..."
    
    # 清理旧的构建文件
    if [ -d "dist" ]; then
        echo "清理旧的构建目录..."
        rm -rf dist
    fi
    
    # 运行构建(使用staging模式更快)
    echo "开始构建..."
    npm run build:stage
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}构建失败${NC}"
        return 1
    fi
    
    # 检查构建产物
    if [ -d "dist" ] && [ -f "dist/index.html" ]; then
        echo -e "${GREEN}构建成功,产物已生成${NC}"
        
        # 统计构建文件
        local file_count=$(find dist -type f | wc -l)
        local dist_size=$(du -sh dist | cut -f1)
        echo "  - 文件数量: $file_count"
        echo "  - 构建大小: $dist_size"
        
        return 0
    else
        echo -e "${RED}构建产物不完整${NC}"
        return 1
    fi
}

# 7. 服务状态组件特定测试
test_service_status_component() {
    echo "测试服务状态监控组件..."
    
    # 检查组件导入
    if grep -q "ServiceStatusCard" src/views/dashboard/admin/index.vue; then
        echo -e "${GREEN}  ✓ 管理员Dashboard已导入组件${NC}"
    else
        echo -e "${RED}  ✗ 管理员Dashboard未导入组件${NC}"
        return 1
    fi
    
    if grep -q "ServiceStatusCard" src/views/dashboard/customer.vue; then
        echo -e "${GREEN}  ✓ 客户Dashboard已导入组件${NC}"
    else
        echo -e "${RED}  ✗ 客户Dashboard未导入组件${NC}"
        return 1
    fi
    
    if grep -q "ServiceStatusCard" src/views/dashboard/agent.vue; then
        echo -e "${GREEN}  ✓ 代理Dashboard已导入组件${NC}"
    else
        echo -e "${RED}  ✗ 代理Dashboard未导入组件${NC}"
        return 1
    fi
    
    # 检查国际化键值
    if grep -q "serviceStatus" src/lang/index.js; then
        echo -e "${GREEN}  ✓ 国际化配置已添加${NC}"
    else
        echo -e "${RED}  ✗ 国际化配置缺失${NC}"
        return 1
    fi
    
    # 检查文档
    if [ -f "首页服务状态功能说明.md" ]; then
        echo -e "${GREEN}  ✓ 功能说明文档存在${NC}"
    else
        echo -e "${YELLOW}  ⚠ 功能说明文档缺失${NC}"
    fi
    
    if [ -f "SERVICE-STATUS-QUICKSTART.md" ]; then
        echo -e "${GREEN}  ✓ 快速启动文档存在${NC}"
    else
        echo -e "${YELLOW}  ⚠ 快速启动文档缺失${NC}"
    fi
    
    return 0
}

# 主测试流程
main() {
    echo "开始时间: $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
    
    # 检查是否在项目根目录
    if [ ! -f "package.json" ]; then
        echo -e "${RED}错误: 请在项目根目录运行此脚本${NC}"
        exit 1
    fi
    
    # 运行测试
    run_test "项目结构检查" "test_project_structure"
    run_test "依赖安装检查" "test_dependencies"
    run_test "代码语法检查" "test_lint"
    run_test "单元测试" "test_unit"
    run_test "组件测试" "test_components"
    run_test "服务状态组件测试" "test_service_status_component"
    
    # 可选: 构建测试(耗时较长)
    if [ "$1" == "--full" ]; then
        run_test "构建测试" "test_build"
    else
        echo -e "${YELLOW}提示: 使用 --full 参数运行完整测试(包括构建)${NC}"
    fi
    
    # 测试总结
    echo ""
    echo "=========================================="
    echo "📊 测试总结"
    echo "=========================================="
    echo -e "总测试数: ${BLUE}$TOTAL_TESTS${NC}"
    echo -e "通过: ${GREEN}$PASSED_TESTS${NC}"
    echo -e "失败: ${RED}$FAILED_TESTS${NC}"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}✅ 所有测试通过!${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        exit 0
    else
        echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${RED}❌ 有 $FAILED_TESTS 个测试失败${NC}"
        echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        exit 1
    fi
}

# 运行主程序
main "$@"
