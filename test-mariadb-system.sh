#!/bin/bash

echo "=========================================="
echo "🧪 MariaDB 系统测试脚本"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试计数
TOTAL_TESTS=0
PASSED_TESTS=0

function test_item() {
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  echo -n "测试 $TOTAL_TESTS: $1 ... "
}

function test_pass() {
  PASSED_TESTS=$((PASSED_TESTS + 1))
  echo -e "${GREEN}✅ 通过${NC}"
}

function test_fail() {
  echo -e "${RED}❌ 失败${NC}"
  if [ ! -z "$1" ]; then
    echo "   错误: $1"
  fi
}

echo "1️⃣  MariaDB 服务检查"
echo "----------------------------------------"

test_item "MariaDB 服务状态"
if systemctl is-active --quiet mariadb; then
  test_pass
else
  test_fail "MariaDB 未运行"
fi

test_item "MariaDB 数据库连接"
if mysql -u vue_admin_user -pvue_admin_2024 -e "SELECT 1;" >/dev/null 2>&1; then
  test_pass
else
  test_fail "无法连接数据库"
fi

test_item "vue_admin 数据库存在"
DB_EXISTS=$(mysql -u vue_admin_user -pvue_admin_2024 -e "SHOW DATABASES LIKE 'vue_admin';" 2>/dev/null | grep -c "vue_admin")
if [ "$DB_EXISTS" -eq "1" ]; then
  test_pass
else
  test_fail "数据库不存在"
fi

test_item "数据表完整性"
TABLE_COUNT=$(mysql -u vue_admin_user -pvue_admin_2024 vue_admin -e "SHOW TABLES;" 2>/dev/null | wc -l)
if [ "$TABLE_COUNT" -ge "6" ]; then
  test_pass
  echo "   发现 $((TABLE_COUNT - 1)) 个数据表"
else
  test_fail "数据表不完整"
fi

test_item "管理员账号存在"
ADMIN_EXISTS=$(mysql -u vue_admin_user -pvue_admin_2024 vue_admin -e "SELECT COUNT(*) as c FROM users WHERE login_account='admin';" 2>/dev/null | tail -n 1)
if [ "$ADMIN_EXISTS" -ge "1" ]; then
  test_pass
else
  test_fail "管理员账号不存在"
fi

echo ""
echo "2️⃣  后端服务检查"
echo "----------------------------------------"

test_item "后端服务进程"
if pgrep -f "mariadb-server.js" >/dev/null; then
  test_pass
else
  test_fail "后端服务未运行"
fi

test_item "后端端口 3000"
if lsof -i :3000 >/dev/null 2>&1; then
  test_pass
else
  test_fail "端口 3000 未监听"
fi

test_item "健康检查接口"
HEALTH_RESPONSE=$(curl -s http://localhost:3000/health 2>/dev/null)
if echo "$HEALTH_RESPONSE" | grep -q "ok"; then
  test_pass
else
  test_fail "健康检查失败"
fi

test_item "数据库连接测试接口"
TEST_RESPONSE=$(curl -s http://localhost:3000/api/migrate/test-connection 2>/dev/null)
if echo "$TEST_RESPONSE" | grep -q "connected"; then
  test_pass
else
  test_fail "连接测试失败"
fi

test_item "登录接口"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"111111"}' 2>/dev/null)
if echo "$LOGIN_RESPONSE" | grep -q "token"; then
  test_pass
  TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  echo "   Token: ${TOKEN:0:30}..."
else
  test_fail "登录失败"
fi

echo ""
echo "3️⃣  前端服务检查"
echo "----------------------------------------"

test_item "前端服务进程"
if pgrep -f "npm run dev" >/dev/null; then
  test_pass
else
  test_fail "前端服务未运行"
fi

test_item "前端端口 9528"
if lsof -i :9528 >/dev/null 2>&1; then
  test_pass
else
  test_fail "端口 9528 未监听"
fi

test_item "前端配置文件"
if [ -f "/home/vue-element-admin/.env.development" ]; then
  test_pass
else
  test_fail "配置文件不存在"
fi

test_item "数据库模式已启用"
USE_DB=$(grep "VUE_APP_USE_DATABASE" /home/vue-element-admin/.env.development | head -n 1 | grep -c "true")
if [ "$USE_DB" -ge "1" ]; then
  test_pass
else
  test_fail "数据库模式未启用"
fi

echo ""
echo "4️⃣  文件结构检查"
echo "----------------------------------------"

test_item "MariaDB 后端服务文件"
if [ -f "/home/vue-element-admin/backend/mariadb-server.js" ]; then
  test_pass
else
  test_fail "服务文件不存在"
fi

test_item "数据库结构文件"
if [ -f "/home/vue-element-admin/database/schema.sql" ]; then
  test_pass
else
  test_fail "结构文件不存在"
fi

test_item "数据迁移工具"
if [ -f "/home/vue-element-admin/mariadb-migration-tool.html" ]; then
  test_pass
else
  test_fail "迁移工具不存在"
fi

test_item "安装文档"
if [ -f "/home/vue-element-admin/MARIADB-SETUP-COMPLETE.md" ]; then
  test_pass
else
  test_fail "安装文档不存在"
fi

test_item "MySQL2 驱动"
if [ -d "/home/vue-element-admin/backend/node_modules/mysql2" ]; then
  test_pass
else
  test_fail "MySQL2 驱动未安装"
fi

echo ""
echo "=========================================="
echo "📊 测试总结"
echo "=========================================="
echo -e "总测试数: $TOTAL_TESTS"
echo -e "${GREEN}通过: $PASSED_TESTS${NC}"
echo -e "${RED}失败: $((TOTAL_TESTS - PASSED_TESTS))${NC}"

if [ "$PASSED_TESTS" -eq "$TOTAL_TESTS" ]; then
  echo ""
  echo -e "${GREEN}🎉 所有测试通过！系统运行正常！${NC}"
  echo ""
  echo "快速访问:"
  echo "  前端: http://localhost:9528"
  echo "  后端: http://localhost:3000"
  echo "  账号: admin / 111111"
  echo ""
  echo "数据迁移工具:"
  echo "  file:///home/vue-element-admin/mariadb-migration-tool.html"
  echo ""
else
  echo ""
  echo -e "${YELLOW}⚠️  部分测试失败，请检查系统配置${NC}"
  echo ""
fi

echo "=========================================="
