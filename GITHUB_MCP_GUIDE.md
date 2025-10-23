# GitHub MCP 自动化上传指南

本指南将帮助您通过 GitHub MCP（Model Context Protocol）完成项目上传到 GitHub 的所有步骤。

## 📋 准备工作检查清单

### ✅ 已完成的准备工作

1. **核心文档** ✅
   - [x] README.md - 项目说明文档
   - [x] LICENSE - MIT 开源协议
   - [x] .gitignore - Git 忽略文件配置
   - [x] CONTRIBUTING.md - 贡献指南
   - [x] CHANGELOG.md - 更新日志

2. **配置示例文件** ✅
   - [x] backend/config/database.example.js - 数据库配置示例
   - [x] backend/.env.example - 环境变量示例

3. **自动化脚本** ✅
   - [x] deploy.sh - 一键部署脚本
   - [x] git-upload.sh - Git 快速上传脚本

4. **辅助文档** ✅
   - [x] GITHUB_GUIDE.md - GitHub 部署详细指南
   - [x] UPLOAD_CHECKLIST.md - 上传检查清单
   - [x] 快速上传指南.md - 快速上传步骤

## 🚀 通过 GitHub MCP 完成上传

### 步骤 1️⃣：清理和准备项目

在上传前，我们需要清理临时文件和敏感信息：

```bash
# 清理 node_modules（会被 .gitignore 排除）
echo "清理依赖包目录..."
rm -rf node_modules backend/node_modules

# 清理构建产物
echo "清理构建产物..."
rm -rf dist

# 清理日志文件
echo "清理日志文件..."
rm -rf logs backend/logs

# 创建必要的目录结构（避免空目录丢失）
mkdir -p backend/logs
mkdir -p logs
mkdir -p uploads

# 创建 .gitkeep 文件保留目录结构
touch backend/logs/.gitkeep
touch logs/.gitkeep
touch uploads/.gitkeep

echo "✅ 项目清理完成！"
```

### 步骤 2️⃣：安全检查

确保敏感信息不会被上传：

```bash
# 检查是否有硬编码的密码
echo "🔍 检查硬编码密码..."
grep -r "password.*:" --include="*.js" --include="*.vue" . | grep -v "node_modules" | grep -v ".git" | grep -v "example" || echo "✅ 未发现硬编码密码"

# 检查数据库配置文件是否会被排除
echo "🔍 检查 .gitignore 配置..."
if git check-ignore backend/config/database.js > /dev/null 2>&1; then
    echo "✅ database.js 已被 .gitignore 排除"
else
    echo "⚠️  警告: database.js 未被排除，请检查 .gitignore"
fi

# 检查环境变量文件是否会被排除
if git check-ignore backend/.env > /dev/null 2>&1; then
    echo "✅ .env 已被 .gitignore 排除"
else
    echo "⚠️  警告: .env 未被排除（如果存在），请检查 .gitignore"
fi

echo "✅ 安全检查完成！"
```

### 步骤 3️⃣：初始化 Git 仓库

```bash
# 检查是否已初始化 Git
if [ ! -d ".git" ]; then
    echo "📦 初始化 Git 仓库..."
    git init
    echo "✅ Git 仓库初始化完成"
else
    echo "✅ Git 仓库已存在"
fi

# 配置 Git 用户信息（如果未配置）
if ! git config user.name > /dev/null 2>&1; then
    echo "⚠️  请配置 Git 用户信息："
    echo "git config --global user.name \"Your Name\""
    echo "git config --global user.email \"your.email@example.com\""
else
    echo "✅ Git 用户信息已配置"
    echo "   用户名: $(git config user.name)"
    echo "   邮箱: $(git config user.email)"
fi
```

### 步骤 4️⃣：创建 GitHub 仓库

**在 GitHub 网站上手动操作：**

1. 访问 https://github.com/new
2. 填写仓库信息：
   - **Repository name**: `vue-element-admin`（或您喜欢的名称）
   - **Description**: `基于 Vue.js 和 Element UI 的数据管理系统`
   - **Visibility**: 选择 Public 或 Private
   - **❌ 不要勾选** "Add a README file"
   - **❌ 不要勾选** "Add .gitignore"
   - **❌ 不要勾选** "Choose a license"
3. 点击 **"Create repository"**
4. 复制仓库地址（HTTPS）：
   ```
   https://github.com/astercc518/vue-element-admin.git
   ```

### 步骤 5️⃣：添加远程仓库

```bash
# 替换 astercc518 为您的 GitHub 用户名
GITHUB_USERNAME="astercc518"
REPO_NAME="vue-element-admin"

# 添加远程仓库
echo "📡 添加远程仓库..."
if git remote get-url origin > /dev/null 2>&1; then
    echo "远程仓库已存在，更新地址..."
    git remote set-url origin "https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"
else
    git remote add origin "https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"
fi

echo "✅ 远程仓库配置完成"
echo "   地址: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"
```

### 步骤 6️⃣：创建 .gitkeep 文件

确保空目录被保留：

```bash
# 为空目录添加 .gitkeep
find . -type d -empty -not -path "./.git/*" -exec touch {}/.gitkeep \;

echo "✅ .gitkeep 文件创建完成"
```

### 步骤 7️⃣：添加文件并提交

```bash
# 查看将要添加的文件
echo "📄 查看文件状态..."
git status --short

# 添加所有文件
echo "➕ 添加文件到暂存区..."
git add .

# 查看暂存的文件
echo "📊 暂存的文件："
git status --short

# 创建初始提交
echo "💾 创建初始提交..."
git commit -m "Initial commit: Vue Element Admin 数据管理系统

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

License: MIT"

echo "✅ 提交创建完成"
```

### 步骤 8️⃣：推送到 GitHub

```bash
# 创建并切换到 main 分支
echo "🌿 切换到 main 分支..."
git branch -M main

# 推送到 GitHub
echo "📤 推送到 GitHub..."
echo "⚠️  首次推送可能需要输入 GitHub 用户名和密码（或 Personal Access Token）"
echo ""

# 推送
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 推送成功！"
    echo ""
    echo "🎉 您的项目已成功上传到 GitHub！"
    echo ""
    echo "📍 仓库地址: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}"
    echo "📍 访问地址: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}"
else
    echo ""
    echo "❌ 推送失败，请检查："
    echo "   1. GitHub 仓库是否已创建"
    echo "   2. 远程地址是否正确"
    echo "   3. 是否有推送权限"
    echo "   4. 网络连接是否正常"
    echo ""
    echo "💡 提示: 如果需要身份验证，请使用 Personal Access Token"
    echo "   创建 Token: https://github.com/settings/tokens"
fi
```

### 步骤 9️⃣：更新文档中的链接

推送成功后，更新文档中的占位符：

```bash
# 替换文档中的 astercc518
echo "📝 更新文档中的仓库链接..."

# 替换 README.md
sed -i "s/astercc518/${GITHUB_USERNAME}/g" README.md

# 替换其他文档
sed -i "s/astercc518/${GITHUB_USERNAME}/g" GITHUB_GUIDE.md
sed -i "s/astercc518/${GITHUB_USERNAME}/g" CHANGELOG.md
sed -i "s/astercc518/${GITHUB_USERNAME}/g" CONTRIBUTING.md
sed -i "s/astercc518/${GITHUB_USERNAME}/g" 快速上传指南.md

echo "✅ 文档链接更新完成"

# 提交更新
git add README.md GITHUB_GUIDE.md CHANGELOG.md CONTRIBUTING.md 快速上传指南.md
git commit -m "docs: 更新仓库链接为实际 GitHub 地址"
git push origin main

echo "✅ 文档更新已推送到 GitHub"
```

### 步骤 🔟：验证和完善

```bash
echo "🔍 验证上传结果..."
echo ""
echo "请访问以下地址检查："
echo "1. 仓库主页: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}"
echo "2. 检查 README.md 是否正确显示"
echo "3. 检查文件结构是否完整"
echo "4. 确认敏感文件未被上传"
echo ""
echo "✅ 所有步骤完成！"
```

## 🎯 完整自动化脚本

如果您希望一次性执行所有步骤，可以使用以下脚本：

```bash
#!/bin/bash

# GitHub 自动化上传脚本
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
    exit 1
fi

GITHUB_USERNAME="$1"
REPO_NAME="vue-element-admin"

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   GitHub MCP 自动化上传                        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}GitHub 用户名: ${GITHUB_USERNAME}${NC}"
echo -e "${GREEN}仓库名称: ${REPO_NAME}${NC}"
echo ""

# 步骤 1: 清理项目
echo -e "${BLUE}[1/10] 清理项目...${NC}"
rm -rf node_modules backend/node_modules dist logs backend/logs
mkdir -p backend/logs logs uploads
touch backend/logs/.gitkeep logs/.gitkeep uploads/.gitkeep
echo -e "${GREEN}✅ 项目清理完成${NC}"
echo ""

# 步骤 2: 安全检查
echo -e "${BLUE}[2/10] 安全检查...${NC}"
if git check-ignore backend/config/database.js > /dev/null 2>&1; then
    echo -e "${GREEN}✅ database.js 已被 .gitignore 排除${NC}"
else
    echo -e "${YELLOW}⚠️  database.js 未被排除${NC}"
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
    echo -e "${YELLOW}请配置 Git 用户信息：${NC}"
    read -p "Git 用户名: " git_username
    read -p "Git 邮箱: " git_email
    git config --global user.name "$git_username"
    git config --global user.email "$git_email"
fi
echo -e "${GREEN}✅ Git 用户: $(git config user.name)${NC}"
echo ""

# 步骤 5: 添加远程仓库
echo -e "${BLUE}[5/10] 配置远程仓库...${NC}"
if git remote get-url origin > /dev/null 2>&1; then
    git remote set-url origin "https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"
else
    git remote add origin "https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"
fi
echo -e "${GREEN}✅ 远程仓库: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git${NC}"
echo ""

# 步骤 6: 创建 .gitkeep
echo -e "${BLUE}[6/10] 创建 .gitkeep 文件...${NC}"
find . -type d -empty -not -path "./.git/*" -exec touch {}/.gitkeep \; 2>/dev/null || true
echo -e "${GREEN}✅ .gitkeep 文件创建完成${NC}"
echo ""

# 步骤 7: 添加文件
echo -e "${BLUE}[7/10] 添加文件到 Git...${NC}"
git add .
echo -e "${GREEN}✅ 文件添加完成${NC}"
echo ""

# 步骤 8: 创建提交
echo -e "${BLUE}[8/10] 创建初始提交...${NC}"
git commit -m "Initial commit: Vue Element Admin 数据管理系统

主要功能：
- ✨ 完整的用户管理系统
- 📊 数据管理和订单系统
- 💰 充值和结算管理
- ⭐ 资源中心和订阅功能
- 🌐 国际化支持
- 🚀 一键部署

技术栈：
- Vue.js + Element UI
- Node.js + Express
- MySQL + Sequelize
- PM2 部署

License: MIT"
echo -e "${GREEN}✅ 提交创建完成${NC}"
echo ""

# 步骤 9: 推送到 GitHub
echo -e "${BLUE}[9/10] 推送到 GitHub...${NC}"
git branch -M main
echo -e "${YELLOW}⚠️  即将推送，可能需要输入 GitHub 凭据${NC}"
echo ""

if git push -u origin main; then
    echo ""
    echo -e "${GREEN}✅ 推送成功！${NC}"
    echo ""
    
    # 步骤 10: 更新文档链接
    echo -e "${BLUE}[10/10] 更新文档链接...${NC}"
    sed -i "s/astercc518/${GITHUB_USERNAME}/g" README.md GITHUB_GUIDE.md CHANGELOG.md CONTRIBUTING.md 快速上传指南.md 2>/dev/null || true
    
    git add README.md GITHUB_GUIDE.md CHANGELOG.md CONTRIBUTING.md 快速上传指南.md
    git commit -m "docs: 更新仓库链接"
    git push origin main
    
    echo -e "${GREEN}✅ 文档链接更新完成${NC}"
    echo ""
    
    echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   🎉 上传完成！                               ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}📍 仓库地址: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}❌ 推送失败${NC}"
    echo -e "${YELLOW}请检查：${NC}"
    echo "  1. GitHub 仓库是否已创建"
    echo "  2. 远程地址是否正确"
    echo "  3. 是否有推送权限"
    echo ""
    exit 1
fi
```

## 📌 重要提示

### GitHub Personal Access Token

如果推送时需要身份验证，建议使用 Personal Access Token：

1. **创建 Token**:
   - 访问 https://github.com/settings/tokens
   - 点击 "Generate new token" → "Generate new token (classic)"
   - 勾选 `repo` 权限
   - 点击 "Generate token"
   - **复制 Token**（只显示一次）

2. **使用 Token**:
   ```bash
   # 推送时使用 Token
   git push https://YOUR_TOKEN@github.com/astercc518/vue-element-admin.git main
   
   # 或配置为远程地址
   git remote set-url origin https://YOUR_TOKEN@github.com/astercc518/vue-element-admin.git
   ```

### 常见问题

**Q1: 推送被拒绝 (rejected)**
```bash
# 先拉取远程更改
git pull origin main --rebase
git push origin main
```

**Q2: 文件太大**
```bash
# 检查大文件
du -sh * | sort -h | tail -5

# 如果误提交大文件，使用 git filter-branch 或 BFG 清理
```

**Q3: .gitignore 不生效**
```bash
# 清除 Git 缓存
git rm -r --cached .
git add .
git commit -m "fix: 更新 .gitignore"
```

## 🎓 后续操作

### 设置仓库信息

在 GitHub 仓库页面：

1. **About 区域** - 添加描述和网站
2. **Topics** - 添加标签: `vue`, `element-ui`, `admin`, `data-management`
3. **Settings** - 启用 Issues 和 Discussions
4. **README** - 确认显示正常

### 从 GitHub 部署

其他人可以这样使用：

```bash
git clone https://github.com/astercc518/vue-element-admin.git
cd vue-element-admin
./deploy.sh
```

---

**祝您上传成功！** 🚀

如果遇到问题，请查看：
- [GITHUB_GUIDE.md](GITHUB_GUIDE.md) - 详细部署指南
- [UPLOAD_CHECKLIST.md](UPLOAD_CHECKLIST.md) - 检查清单
- [快速上传指南.md](快速上传指南.md) - 快速参考
