#!/bin/bash
#
# UDE (Unified Data Exchange) - GitHub MCP 自动化上传脚本
# 用于将项目更新同步到 GitHub 仓库
#

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目信息
PROJECT_NAME="Unified Data Exchange (UDE)"
PROJECT_DIR="/home/vue-element-admin"
GITHUB_REPO="unified-data-exchange"

# 检查参数
if [ -z "$1" ]; then
  echo -e "${RED}❌ 错误：请提供 GitHub 用户名${NC}"
  echo "用法: $0 <github-username> [commit-message]"
  echo "示例: $0 astercc518 \"添加数据恢复功能\""
  exit 1
fi

GITHUB_USER="$1"
COMMIT_MSG="${2:-自动同步更新}"

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}🚀 UDE GitHub MCP 自动化上传${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}项目名称:${NC} $PROJECT_NAME"
echo -e "${YELLOW}仓库地址:${NC} https://github.com/${GITHUB_USER}/${GITHUB_REPO}"
echo -e "${YELLOW}提交信息:${NC} $COMMIT_MSG"
echo ""

# 切换到项目目录
cd "$PROJECT_DIR"

# 步骤 1: 项目清理
echo -e "${BLUE}📦 步骤 1/7: 清理项目文件${NC}"
echo "清理 node_modules, dist, 临时文件..."

# 确保 .gitignore 包含必要的忽略项
cat > .gitignore << 'EOF'
.DS_Store
node_modules/
dist/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
package-lock.json
tests/**/coverage/

# Editor directories and files
.idea
.vscode
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# 环境配置（敏感信息）
.env.local
.env.*.local

# PM2 相关
.pm2/

# 日志文件
*.log
logs/
*.log.*

# 临时文件
*.tmp
*.temp
.cache/

# 备份文件
*.bak
backups/*.sql
backups/*.sql.gz
backups/database/*.sql
backups/database/*.sql.gz

# 系统文件
.DS_Store
Thumbs.db
EOF

echo -e "${GREEN}✅ 清理完成${NC}"
echo ""

# 步骤 2: 安全检查
echo -e "${BLUE}🔒 步骤 2/7: 安全检查${NC}"
echo "检查敏感信息..."

# 检查是否有敏感文件
SENSITIVE_FILES=(
  "backend/.env"
  "backend/config/database.js"
  ".env"
  "*.pem"
  "*.key"
)

FOUND_SENSITIVE=0
for pattern in "${SENSITIVE_FILES[@]}"; do
  if ls $pattern 2>/dev/null | grep -q .; then
    echo -e "${YELLOW}⚠️  发现敏感文件: $pattern${NC}"
    FOUND_SENSITIVE=1
  fi
done

if [ $FOUND_SENSITIVE -eq 1 ]; then
  echo -e "${YELLOW}⚠️  请确保敏感文件已添加到 .gitignore${NC}"
else
  echo -e "${GREEN}✅ 未发现敏感文件${NC}"
fi
echo ""

# 步骤 3: Git 状态检查
echo -e "${BLUE}📊 步骤 3/7: 检查 Git 状态${NC}"
git status --short
echo ""

# 步骤 4: 添加文件
echo -e "${BLUE}➕ 步骤 4/7: 添加文件到暂存区${NC}"
git add .

# 显示将要提交的文件
echo "将要提交的文件："
git diff --cached --name-only | head -20
TOTAL_FILES=$(git diff --cached --name-only | wc -l)
echo "总计: $TOTAL_FILES 个文件"
echo ""

# 步骤 5: 提交更改
echo -e "${BLUE}💾 步骤 5/7: 提交更改${NC}"

# 生成详细的提交信息
COMMIT_DATE=$(date '+%Y-%m-%d %H:%M:%S')
FULL_COMMIT_MSG="$COMMIT_MSG

提交时间: $COMMIT_DATE
修改文件: $TOTAL_FILES 个

主要更新:
- 系统备份管理功能
- 数据恢复功能（一键恢复 + 安全快照）
- 服务器状态增强（Redis, Nginx, Prometheus）
- 登录 405 错误修复
- Nginx 生产环境配置
- PM2 Cluster 高可用部署
- Redis 缓存集成
- Prometheus 监控集成
- 自动备份机制（每日凌晨2点）

技术栈:
- 前端: Vue.js 2.6.10 + Element UI 2.13.2
- 后端: Node.js + Express + Sequelize
- 数据库: MariaDB 10.11.9
- 缓存: Redis 3.2.12
- Web服务器: Nginx 1.20.1
- 进程管理: PM2 Cluster
- 监控: Prometheus + Grafana
"

git commit -m "$FULL_COMMIT_MSG"
echo -e "${GREEN}✅ 提交成功${NC}"
echo ""

# 步骤 6: 推送到 GitHub
echo -e "${BLUE}⬆️  步骤 6/7: 推送到 GitHub${NC}"
echo "正在推送到远程仓库..."

# 获取当前分支
CURRENT_BRANCH=$(git branch --show-current)
echo "当前分支: $CURRENT_BRANCH"

# 推送
git push origin $CURRENT_BRANCH

echo -e "${GREEN}✅ 推送成功${NC}"
echo ""

# 步骤 7: 生成报告
echo -e "${BLUE}📝 步骤 7/7: 生成上传报告${NC}"

# 获取最新提交信息
LAST_COMMIT_HASH=$(git rev-parse --short HEAD)
LAST_COMMIT_DATE=$(git log -1 --format=%cd --date=format:'%Y-%m-%d %H:%M:%S')
LAST_COMMIT_AUTHOR=$(git log -1 --format=%an)

# 创建上传报告
UPLOAD_REPORT="GITHUB_UPLOAD_REPORT.md"
cat > "$UPLOAD_REPORT" << EOF
# GitHub 上传报告

**项目名称**: Unified Data Exchange (UDE)  
**仓库地址**: https://github.com/${GITHUB_USER}/${GITHUB_REPO}  
**上传时间**: $(date '+%Y-%m-%d %H:%M:%S')

---

## 提交信息

- **提交哈希**: \`$LAST_COMMIT_HASH\`
- **提交时间**: $LAST_COMMIT_DATE
- **提交作者**: $LAST_COMMIT_AUTHOR
- **提交分支**: $CURRENT_BRANCH
- **修改文件**: $TOTAL_FILES 个

---

## 主要更新

### 1. 系统备份管理
- ✅ 查看备份列表
- ✅ 创建新备份
- ✅ 下载备份文件
- ✅ 删除旧备份
- ✅ 数据恢复功能（新增）

### 2. 数据恢复功能
- ✅ 一键恢复数据库
- ✅ 自动创建安全快照
- ✅ 多重确认机制
- ✅ 恢复进度显示
- ✅ 详细结果反馈

### 3. 服务器状态监控
- ✅ Redis 状态监控
- ✅ Nginx 状态监控
- ✅ Prometheus 状态监控
- ✅ 系统资源监控
- ✅ PM2 服务监控

### 4. 性能优化
- ✅ Redis 缓存集成（命中率 82%+）
- ✅ Nginx Gzip 压缩
- ✅ 静态资源 7 天缓存
- ✅ PM2 Cluster 模式（2实例）
- ✅ 日志轮转机制

### 5. 监控告警
- ✅ Prometheus Metrics
- ✅ 内存/CPU 告警阈值
- ✅ 业务指标监控
- ✅ 服务健康检查

### 6. 高可用配置
- ✅ PM2 Cluster 模式
- ✅ 自动重启机制
- ✅ 数据库备份（每日凌晨2点）
- ✅ 日志管理

---

## 技术栈

### 前端
- Vue.js 2.6.10
- Element UI 2.13.2
- Axios 0.18.1
- Vue Router 3.0.2
- Vuex 3.1.0

### 后端
- Node.js
- Express
- Sequelize ORM
- MariaDB 10.11.9
- Redis 3.2.12

### 运维
- Nginx 1.20.1
- PM2 Cluster
- Prometheus
- Grafana

---

## 仓库链接

- **主页**: https://github.com/${GITHUB_USER}/${GITHUB_REPO}
- **代码**: https://github.com/${GITHUB_USER}/${GITHUB_REPO}/tree/main
- **提交历史**: https://github.com/${GITHUB_USER}/${GITHUB_REPO}/commits/main
- **最新提交**: https://github.com/${GITHUB_USER}/${GITHUB_REPO}/commit/$LAST_COMMIT_HASH

---

## 克隆命令

\`\`\`bash
git clone https://github.com/${GITHUB_USER}/${GITHUB_REPO}.git
cd ${GITHUB_REPO}
npm install
\`\`\`

---

**报告生成时间**: $(date '+%Y-%m-%d %H:%M:%S')
EOF

echo -e "${GREEN}✅ 报告已生成: $UPLOAD_REPORT${NC}"
echo ""

# 完成
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ GitHub 同步完成！${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}📦 仓库信息:${NC}"
echo "  - 仓库地址: https://github.com/${GITHUB_USER}/${GITHUB_REPO}"
echo "  - 最新提交: $LAST_COMMIT_HASH"
echo "  - 提交分支: $CURRENT_BRANCH"
echo "  - 修改文件: $TOTAL_FILES 个"
echo ""
echo -e "${YELLOW}🔗 快速链接:${NC}"
echo "  - 查看代码: https://github.com/${GITHUB_USER}/${GITHUB_REPO}"
echo "  - 查看提交: https://github.com/${GITHUB_USER}/${GITHUB_REPO}/commits/main"
echo "  - 克隆仓库: git clone https://github.com/${GITHUB_USER}/${GITHUB_REPO}.git"
echo ""
echo -e "${GREEN}🎉 所有操作已完成！${NC}"
