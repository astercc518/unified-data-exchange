#!/bin/bash

# GitHub MCP 自动化上传脚本
# 使用方法: ./github-mcp-upload.sh YOUR_GITHUB_USERNAME

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 检查参数
if [ -z "$1" ]; then
    echo -e "${RED}错误: 请提供 GitHub 用户名${NC}"
    echo "使用方法: $0 YOUR_GITHUB_USERNAME"
    echo ""
    echo "示例: $0 zhangsan"
    exit 1
fi

GITHUB_USERNAME="$1"
REPO_NAME="unified-data-exchange"

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   GitHub MCP 自动化上传                        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}GitHub 用户名: ${GITHUB_USERNAME}${NC}"
echo -e "${GREEN}仓库名称: ${REPO_NAME}${NC}"
echo ""
echo -e "${YELLOW}⚠️  请确保您已在 GitHub 创建了仓库: ${REPO_NAME}${NC}"
echo -e "${YELLOW}   创建地址: https://github.com/new${NC}"
echo ""
read -p "按回车键继续..."
echo ""

# 步骤 1: 清理项目
echo -e "${BLUE}[1/10] 清理项目文件...${NC}"
echo "  删除 node_modules..."
rm -rf node_modules backend/node_modules
echo "  删除构建产物..."
rm -rf dist
echo "  删除日志文件..."
rm -rf logs backend/logs
echo "  创建必要目录..."
mkdir -p backend/logs logs uploads
touch backend/logs/.gitkeep logs/.gitkeep uploads/.gitkeep
echo -e "${GREEN}✅ 项目清理完成${NC}"
echo ""

# 步骤 2: 安全检查
echo -e "${BLUE}[2/10] 安全检查...${NC}"
if git check-ignore backend/config/database.js > /dev/null 2>&1; then
    echo -e "${GREEN}✅ database.js 已被 .gitignore 排除${NC}"
else
    echo -e "${YELLOW}⚠️  database.js 未被排除，请检查 .gitignore${NC}"
fi

if git check-ignore backend/.env > /dev/null 2>&1; then
    echo -e "${GREEN}✅ .env 已被 .gitignore 排除${NC}"
else
    echo -e "${GREEN}✅ .env 文件不存在或已排除${NC}"
fi
echo ""

# 步骤 3: 初始化 Git
echo -e "${BLUE}[3/10] 初始化 Git 仓库...${NC}"
if [ ! -d ".git" ]; then
    git init
    echo -e "${GREEN}✅ Git 仓库初始化完成${NC}"
else
    echo -e "${GREEN}✅ Git 仓库已存在${NC}"
fi
echo ""

# 步骤 4: 配置 Git 用户
echo -e "${BLUE}[4/10] 检查 Git 配置...${NC}"
if ! git config user.name > /dev/null 2>&1; then
    echo -e "${YELLOW}未配置 Git 用户信息${NC}"
    read -p "请输入 Git 用户名: " git_username
    read -p "请输入 Git 邮箱: " git_email
    git config --global user.name "$git_username"
    git config --global user.email "$git_email"
    echo -e "${GREEN}✅ Git 用户信息配置完成${NC}"
else
    echo -e "${GREEN}✅ Git 用户: $(git config user.name) <$(git config user.email)>${NC}"
fi
echo ""

# 步骤 5: 添加远程仓库
echo -e "${BLUE}[5/10] 配置远程仓库...${NC}"
REPO_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

if git remote get-url origin > /dev/null 2>&1; then
    current_url=$(git remote get-url origin)
    echo -e "${YELLOW}远程仓库已存在: ${current_url}${NC}"
    read -p "是否更新为新地址？(y/n) [y]: " update_remote
    update_remote=${update_remote:-y}
    
    if [ "$update_remote" = "y" ] || [ "$update_remote" = "Y" ]; then
        git remote set-url origin "$REPO_URL"
        echo -e "${GREEN}✅ 远程仓库地址已更新${NC}"
    fi
else
    git remote add origin "$REPO_URL"
    echo -e "${GREEN}✅ 远程仓库添加成功${NC}"
fi

echo -e "${BLUE}   远程地址: ${REPO_URL}${NC}"
echo ""

# 步骤 6: 创建 .gitkeep
echo -e "${BLUE}[6/10] 创建 .gitkeep 文件...${NC}"
find . -type d -empty -not -path "./.git/*" -exec touch {}/.gitkeep \; 2>/dev/null || true
echo -e "${GREEN}✅ .gitkeep 文件创建完成${NC}"
echo ""

# 步骤 7: 添加文件
echo -e "${BLUE}[7/10] 添加文件到 Git...${NC}"
git add .

# 显示将要提交的文件统计
added_files=$(git status --short | wc -l)
echo -e "${GREEN}✅ ${added_files} 个文件已添加到暂存区${NC}"
echo ""

# 步骤 8: 创建提交
echo -e "${BLUE}[8/10] 创建初始提交...${NC}"
git commit -m "Initial commit: Unified Data Exchange (UDE) 统一数据交换平台

主要功能：
- ✨ 完整的用户管理系统（客户、代理、管理员）
- 📊 数据管理和订单系统
- 💰 充值和结算管理
- ⭐ 资源中心和订阅功能
- 💬 数据反馈系统
- ⚙️ 系统配置和监控
- 🌐 中英文国际化支持
- 📱 响应式设计

技术栈：
- 前端: Vue.js 2.6.10 + Element UI 2.13.2
- 后端: Node.js + Express + Sequelize
- 数据库: MySQL
- 部署: PM2 + Nginx

文档：
- README.md - 完整的项目说明
- GITHUB_GUIDE.md - 部署指南
- deploy.sh - 一键部署脚本
- CONTRIBUTING.md - 贡献指南

License: MIT" > /dev/null

echo -e "${GREEN}✅ 提交创建完成${NC}"
echo ""

# 步骤 9: 推送到 GitHub
echo -e "${BLUE}[9/10] 推送到 GitHub...${NC}"
git branch -M main

echo -e "${YELLOW}⚠️  即将推送到 GitHub，可能需要输入凭据${NC}"
echo -e "${YELLOW}   如果使用 Personal Access Token，请在密码处输入 Token${NC}"
echo ""

if git push -u origin main 2>&1; then
    echo ""
    echo -e "${GREEN}✅ 推送成功！${NC}"
    echo ""
    
    # 步骤 10: 更新文档链接
    echo -e "${BLUE}[10/10] 更新文档链接...${NC}"
    
    # 更新所有文档中的 YOUR_USERNAME
    for file in README.md GITHUB_GUIDE.md CHANGELOG.md CONTRIBUTING.md 快速上传指南.md GITHUB_MCP_GUIDE.md; do
        if [ -f "$file" ]; then
            sed -i "s/YOUR_USERNAME/${GITHUB_USERNAME}/g" "$file"
            echo "  ✓ 更新 $file"
        fi
    done
    
    git add README.md GITHUB_GUIDE.md CHANGELOG.md CONTRIBUTING.md 快速上传指南.md GITHUB_MCP_GUIDE.md
    git commit -m "docs: 更新仓库链接为 @${GITHUB_USERNAME}"
    git push origin main
    
    echo -e "${GREEN}✅ 文档链接更新完成${NC}"
    echo ""
    
    # 显示成功信息
    echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   🎉 恭喜！项目已成功上传到 GitHub！          ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}📍 仓库地址:${NC}"
    echo -e "   https://github.com/${GITHUB_USERNAME}/${REPO_NAME}"
    echo ""
    echo -e "${BLUE}📚 下一步操作:${NC}"
    echo "   1. 访问仓库页面检查文件"
    echo "   2. 在 About 区域添加项目描述"
    echo "   3. 添加 Topics 标签: vue, element-ui, admin, data-management"
    echo "   4. 启用 Issues 和 Discussions"
    echo ""
    echo -e "${BLUE}🚀 部署项目:${NC}"
    echo "   git clone https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"
    echo "   cd ${REPO_NAME}"
    echo "   ./deploy.sh"
    echo ""
    echo -e "${GREEN}感谢使用！如果项目对您有帮助，请给个 ⭐ Star！${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}❌ 推送失败${NC}"
    echo ""
    echo -e "${YELLOW}可能的原因：${NC}"
    echo "  1. GitHub 仓库尚未创建"
    echo "     → 访问 https://github.com/new 创建仓库"
    echo ""
    echo "  2. 远程地址不正确"
    echo "     → 检查仓库地址: ${REPO_URL}"
    echo ""
    echo "  3. 身份验证失败"
    echo "     → 使用 Personal Access Token 替代密码"
    echo "     → 创建 Token: https://github.com/settings/tokens"
    echo ""
    echo "  4. 网络连接问题"
    echo "     → 检查网络连接"
    echo "     → 尝试使用 VPN"
    echo ""
    echo -e "${BLUE}💡 重试推送：${NC}"
    echo "   git push -u origin main"
    echo ""
    exit 1
fi
