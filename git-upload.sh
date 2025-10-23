#!/bin/bash

# Git 快速上传到 GitHub 脚本
# 使用说明：./git-upload.sh

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Git 快速上传到 GitHub                       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

# 检查是否已配置 Git
if ! git config user.name &> /dev/null; then
    echo -e "${YELLOW}未配置 Git 用户信息，请先配置：${NC}"
    read -p "请输入您的 Git 用户名: " git_username
    read -p "请输入您的 Git 邮箱: " git_email
    git config --global user.name "$git_username"
    git config --global user.email "$git_email"
    echo -e "${GREEN}✓ Git 用户信息配置完成${NC}"
    echo ""
fi

# 检查是否已初始化 Git
if [ ! -d ".git" ]; then
    echo -e "${BLUE}初始化 Git 仓库...${NC}"
    git init
    echo -e "${GREEN}✓ Git 仓库初始化完成${NC}"
    echo ""
fi

# 检查是否已配置远程仓库
if ! git remote get-url origin &> /dev/null; then
    echo -e "${YELLOW}请输入您的 GitHub 仓库地址：${NC}"
    echo -e "${BLUE}格式示例: https://github.com/YOUR_USERNAME/vue-element-admin.git${NC}"
    read -p "仓库地址: " repo_url
    git remote add origin "$repo_url"
    echo -e "${GREEN}✓ 远程仓库配置完成${NC}"
    echo ""
else
    current_origin=$(git remote get-url origin)
    echo -e "${BLUE}当前远程仓库: ${current_origin}${NC}"
    read -p "是否修改远程仓库地址？(y/n) [n]: " change_origin
    if [ "$change_origin" = "y" ] || [ "$change_origin" = "Y" ]; then
        read -p "新的仓库地址: " repo_url
        git remote set-url origin "$repo_url"
        echo -e "${GREEN}✓ 远程仓库地址已更新${NC}"
    fi
    echo ""
fi

# 检查工作区状态
echo -e "${BLUE}检查工作区状态...${NC}"
git status --short

echo ""
read -p "是否继续提交所有更改？(y/n) [y]: " confirm
confirm=${confirm:-y}

if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo -e "${YELLOW}操作已取消${NC}"
    exit 0
fi

# 添加文件
echo -e "${BLUE}添加文件到暂存区...${NC}"
git add .
echo -e "${GREEN}✓ 文件添加完成${NC}"
echo ""

# 输入提交信息
echo -e "${YELLOW}请输入提交信息：${NC}"
read -p "提交信息: " commit_message
commit_message=${commit_message:-"Update project files"}

# 提交更改
echo -e "${BLUE}提交更改...${NC}"
git commit -m "$commit_message"
echo -e "${GREEN}✓ 提交完成${NC}"
echo ""

# 检查分支
current_branch=$(git branch --show-current)
if [ -z "$current_branch" ]; then
    current_branch="main"
    git branch -M main
fi

echo -e "${BLUE}当前分支: ${current_branch}${NC}"
echo ""

# 推送到 GitHub
echo -e "${BLUE}推送到 GitHub...${NC}"
read -p "是否强制推送？(y/n) [n]: " force_push
force_push=${force_push:-n}

if [ "$force_push" = "y" ] || [ "$force_push" = "Y" ]; then
    echo -e "${YELLOW}警告: 强制推送将覆盖远程分支！${NC}"
    read -p "确认强制推送？(yes/no): " confirm_force
    if [ "$confirm_force" = "yes" ]; then
        git push -f origin "$current_branch"
    else
        echo -e "${YELLOW}操作已取消${NC}"
        exit 0
    fi
else
    # 尝试普通推送
    if git push origin "$current_branch" 2>&1; then
        echo -e "${GREEN}✓ 推送成功${NC}"
    else
        echo -e "${YELLOW}推送失败，可能需要先拉取远程更改${NC}"
        read -p "是否先拉取再推送？(y/n) [y]: " pull_first
        pull_first=${pull_first:-y}
        
        if [ "$pull_first" = "y" ] || [ "$pull_first" = "Y" ]; then
            git pull origin "$current_branch" --rebase
            git push origin "$current_branch"
            echo -e "${GREEN}✓ 推送成功${NC}"
        else
            echo -e "${RED}✗ 操作已取消${NC}"
            exit 1
        fi
    fi
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   🎉 成功上传到 GitHub！                      ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
echo ""

# 显示远程仓库信息
repo_url=$(git remote get-url origin)
echo -e "${BLUE}仓库地址: ${repo_url}${NC}"

# 提取 GitHub URL
if [[ $repo_url =~ github.com[:/]([^/]+)/([^.]+) ]]; then
    username="${BASH_REMATCH[1]}"
    reponame="${BASH_REMATCH[2]}"
    web_url="https://github.com/${username}/${reponame}"
    echo -e "${BLUE}访问地址: ${web_url}${NC}"
fi

echo ""
echo -e "${YELLOW}提示：${NC}"
echo -e "  - 查看提交历史: git log --oneline"
echo -e "  - 查看远程分支: git branch -r"
echo -e "  - 拉取最新代码: git pull origin ${current_branch}"
echo ""
