# 贡献指南

首先，感谢您考虑为 Unified Data Exchange (UDE) 做出贡献！

## 🤝 如何贡献

### 报告 Bug

如果您发现了 Bug，请创建一个 Issue 并包含以下信息：

1. **清晰的标题** - 简明扼要地描述问题
2. **复现步骤** - 详细说明如何复现问题
3. **期望行为** - 描述您期望发生什么
4. **实际行为** - 描述实际发生了什么
5. **环境信息** - Node.js 版本、浏览器版本、操作系统等
6. **截图或日志** - 如果可能，提供截图或错误日志

### 提出新功能

如果您有新功能的想法，请先创建一个 Issue 讨论：

1. **功能描述** - 详细描述新功能
2. **使用场景** - 说明为什么需要这个功能
3. **实现思路** - 如果有，分享您的实现想法
4. **替代方案** - 是否考虑过其他解决方案

### 提交代码

#### 1. Fork 仓库

点击 GitHub 页面右上角的 "Fork" 按钮

#### 2. 克隆仓库

```bash
git clone https://github.com/astercc518/vue-element-admin.git
cd vue-element-admin
```

#### 3. 创建分支

```bash
# 创建功能分支
git checkout -b feature/amazing-feature

# 或创建修复分支
git checkout -b fix/bug-fix
```

分支命名规范：
- `feature/xxx` - 新功能
- `fix/xxx` - Bug 修复
- `docs/xxx` - 文档更新
- `style/xxx` - 代码格式调整
- `refactor/xxx` - 代码重构
- `test/xxx` - 测试相关
- `chore/xxx` - 构建/工具相关

#### 4. 进行修改

请遵循以下规范：

**代码风格：**
- 使用 2 个空格缩进
- 使用单引号而非双引号
- 语句末尾加分号
- 遵循 ESLint 规则

**提交信息：**
- 使用现在时态（"Add feature" 而非 "Added feature"）
- 使用祈使语气（"Move cursor to..." 而非 "Moves cursor to..."）
- 首行限制在 72 字符内
- 必要时添加详细描述

提交信息格式：
```
<type>(<scope>): <subject>

<body>

<footer>
```

类型（type）：
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建/工具相关

示例：
```
feat(user): 添加用户导出功能

- 实现用户列表导出为 Excel
- 支持批量选择导出
- 添加导出进度提示

Closes #123
```

#### 5. 测试

确保您的修改通过所有测试：

```bash
# 运行 ESLint
npm run lint

# 运行测试（如果有）
npm run test

# 本地运行项目
npm run dev
```

#### 6. 提交更改

```bash
git add .
git commit -m "feat: 添加新功能"
```

#### 7. 推送到 GitHub

```bash
git push origin feature/amazing-feature
```

#### 8. 创建 Pull Request

1. 访问您的 Fork 仓库
2. 点击 "Compare & pull request"
3. 填写 PR 描述
4. 等待代码审查

### Pull Request 指南

好的 PR 应该包含：

1. **清晰的标题** - 简明扼要地描述更改
2. **详细的描述** - 说明做了什么、为什么这样做
3. **关联 Issue** - 如果相关，引用 Issue 编号
4. **测试说明** - 说明如何测试您的更改
5. **截图** - 如果是 UI 更改，提供前后对比截图
6. **向后兼容** - 说明是否有破坏性更改

PR 模板：
```markdown
## 📝 描述
简要描述此 PR 的目的

## 🔗 关联 Issue
Closes #123

## 🎯 更改类型
- [ ] 新功能
- [ ] Bug 修复
- [ ] 文档更新
- [ ] 代码重构
- [ ] 性能优化
- [ ] 其他

## ✅ 测试
说明如何测试您的更改

## 📸 截图（如果适用）
提供前后对比截图

## 📋 检查清单
- [ ] 代码遵循项目规范
- [ ] 已添加必要的注释
- [ ] 已更新相关文档
- [ ] 通过了所有测试
- [ ] 无 ESLint 警告
```

## 💻 开发环境设置

### 1. 安装依赖

```bash
# 安装前端依赖
npm install --legacy-peer-deps

# 安装后端依赖
cd backend
npm install
cd ..
```

### 2. 配置数据库

```bash
cp backend/config/database.example.js backend/config/database.js
# 编辑 database.js 填入您的数据库配置
```

### 3. 初始化数据库

```bash
node backend/scripts/init-database.js
```

### 4. 启动开发服务器

```bash
# 启动后端（终端 1）
npm run backend

# 启动前端（终端 2）
npm run dev
```

## 📐 代码规范

### JavaScript/Vue 规范

```javascript
// ✅ 好的写法
export default {
  name: 'UserList',
  components: {
    Pagination
  },
  data() {
    return {
      list: [],
      total: 0
    }
  },
  methods: {
    async fetchList() {
      try {
        const { data } = await getUsers()
        this.list = data.list
        this.total = data.total
      } catch (error) {
        this.$message.error('获取列表失败')
      }
    }
  }
}

// ❌ 不好的写法
export default {
  data() {
    return {
      list: [],
      total: 0,
    }
  },
  methods: {
    fetchList() {
      getUsers().then(res => {
        this.list = res.data.list;
        this.total = res.data.total;
      })
    },
  },
}
```

### CSS 规范

```css
/* ✅ 好的写法 */
.user-list {
  padding: 20px;
}

.user-list__item {
  margin-bottom: 10px;
}

.user-list__item--active {
  background-color: #409eff;
}

/* ❌ 不好的写法 */
.userList {
  padding: 20px;
}

.item {
  margin-bottom: 10px;
}
```

### 命名规范

- **文件名**: 小写 + 连字符（kebab-case）
  - `user-list.vue`
  - `data-library.js`

- **组件名**: 大驼峰（PascalCase）
  - `UserList`
  - `DataLibrary`

- **变量/函数**: 小驼峰（camelCase）
  - `userList`
  - `fetchData()`

- **常量**: 大写 + 下划线
  - `API_BASE_URL`
  - `MAX_RETRY_COUNT`

## 🔍 代码审查

所有 PR 都需要经过代码审查。审查者会关注：

1. **代码质量** - 是否遵循最佳实践
2. **功能正确性** - 是否实现了预期功能
3. **性能影响** - 是否有性能问题
4. **安全性** - 是否有安全隐患
5. **测试覆盖** - 是否有足够的测试
6. **文档完整性** - 是否更新了文档

## 📖 文档贡献

文档同样重要！您可以帮助：

- 修正拼写/语法错误
- 改进文档结构
- 添加示例代码
- 翻译文档
- 补充缺失的说明

## 💬 社区行为准则

### 我们的承诺

为了营造一个开放和友好的环境，我们承诺：

- 使用友好和包容的语言
- 尊重不同的观点和经验
- 优雅地接受建设性批评
- 关注对社区最有利的事情
- 对其他社区成员表示同理心

### 不可接受的行为

- 使用性化的语言或图像
- 人身攻击或侮辱性评论
- 公开或私下骚扰
- 未经许可发布他人信息
- 其他不道德或不专业的行为

## 🎓 学习资源

如果您是新手，这些资源可能有帮助：

- [Vue.js 官方文档](https://vuejs.org/)
- [Element UI 文档](https://element.eleme.io/)
- [Git 教程](https://git-scm.com/book/zh/v2)
- [如何参与开源项目](https://opensource.guide/zh-hans/how-to-contribute/)

## ❓ 需要帮助？

如果您有任何问题，可以：

- 查看 [FAQ](README.md#常见问题)
- 创建 [Issue](https://github.com/astercc518/vue-element-admin/issues)
- 参与 [Discussions](https://github.com/astercc518/vue-element-admin/discussions)

## 🙏 致谢

感谢所有为这个项目做出贡献的人！

---

再次感谢您的贡献！🎉
