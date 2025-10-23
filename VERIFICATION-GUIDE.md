# 全球运营商查询功能验证指南

## 🎯 验证目标

验证**所有国家的运营商查询都使用 Google libphonenumber 标准库**功能是否正常工作。

## ✅ 前置检查

### 1. 服务状态确认

```bash
# 检查后端服务
ps aux | grep "node.*server.js" | grep -v grep

# 检查前端服务
curl -s http://localhost:9528 | head -5
```

**预期结果**：
- ✅ 后端服务进程正在运行（端口 3000）
- ✅ 前端服务正常响应（端口 9528）

### 2. 依赖检查

```bash
# 检查 awesome-phonenumber 是否已安装
cd /home/vue-element-admin/backend
npm list awesome-phonenumber
```

**预期结果**：
```
└── awesome-phonenumber@7.5.0
```

## 🧪 测试步骤

### 测试 1：单元测试

```bash
cd /home/vue-element-admin/backend
node test-awesome-phonenumber.js
```

**预期结果**：
- ✅ 所有测试通过
- ✅ 美国号码验证成功
- ✅ 中国号码验证成功
- ✅ 英国号码验证成功
- ✅ 运营商分布分析正确

### 测试 2：美国号码测试

#### 步骤：
1. 访问 http://localhost:9528
2. 登录系统（如果未登录）
3. 进入"数据管理" -> "数据处理"
4. 上传测试文件：`backend/test_data/us_phone_numbers.txt`
5. 等待文件预览完成
6. 查看运营商分布信息

#### 预期结果：
```
分析完成！检测到 3 个运营商
✓ 分析方法：使用 Google libphonenumber 库进行智能分析

运营商分布：
- Verizon: 4条
- AT&T: 2条
- T-Mobile: 2条

总数据: 8条
有效号码: 8条
无效号码: 0条
```

#### 关键验证点：
- ✅ 显示"使用 Google libphonenumber 库进行智能分析"
- ✅ 准确识别运营商
- ✅ 统计数据正确

### 测试 3：多国号码测试

#### 步骤：
1. 上传测试文件：`backend/test_data/multi_country_numbers.txt`
2. 查看文件预览信息
3. 点击"按运营商提取"

#### 预期结果：

**文件包含**：
- 🇺🇸 美国号码: 8条
- 🇨🇳 中国号码: 10条
- 🇬🇧 英国号码: 5条
- 🇮🇳 印度号码: 5条
- 🇸🇬 新加坡号码: 4条

**关键验证**：
- ✅ 所有国家都显示"使用 Google libphonenumber 库进行智能分析"
- ✅ 自动识别各国号码
- ✅ 正确统计有效/无效号码

### 测试 4：中国号码测试

#### 创建测试文件：
```bash
cat > /tmp/china_test.txt << EOF
8613800138000
8613800138001
8613900139000
8615000150000
8618000180000
EOF
```

#### 步骤：
1. 上传 `/tmp/china_test.txt`
2. 查看运营商分布

#### 预期结果：
```
分析完成！检测到运营商
✓ 分析方法：使用 Google libphonenumber 库进行智能分析

总数据: 5条
有效号码: 5条
国家识别: CN (中国)
```

### 测试 5：号码提取功能

#### 步骤：
1. 在任何已上传文件上点击"按运营商提取"
2. 选择要提取的运营商
3. 设置提取条数（可选）
4. 点击"开始提取"
5. 下载提取结果

#### 预期结果：
- ✅ 提取成功
- ✅ 数量正确
- ✅ 文件格式正确
- ✅ 号码格式统一（E.164）

## 📊 验证检查表

### 功能验证

- [ ] 美国号码识别正确
- [ ] 中国号码识别正确
- [ ] 英国号码识别正确
- [ ] 印度号码识别正确
- [ ] 新加坡号码识别正确
- [ ] 所有国家都显示分析方法
- [ ] 运营商分布统计准确
- [ ] 有效/无效号码统计正确
- [ ] 提取功能正常工作

### 显示验证

- [ ] 文件预览显示分析方法
- [ ] 所有国家显示 "Google libphonenumber"
- [ ] 统计信息完整显示
- [ ] 错误提示友好

### 性能验证

- [ ] 大文件处理速度正常
- [ ] 内存占用合理
- [ ] 无明显卡顿

## 🐛 常见问题排查

### 问题 1：显示"使用号段匹配"而非"Google libphonenumber"

**原因**：后端代码未更新或服务未重启

**解决**：
```bash
# 重启后端服务
pkill -f "node.*server.js"
cd /home/vue-element-admin/backend
nohup node server.js > server.log 2>&1 &

# 检查日志
tail -f server.log
```

### 问题 2：所有号码显示为无效

**原因**：号码格式不正确或缺少国码

**解决**：
- 确保号码包含国码（如 1, 86, 44）
- 检查号码格式是否符合标准

### 问题 3：运营商未识别

**原因**：号段配置不完整

**解决**：
- 检查运营商配置文件
- 确保号段定义正确
- 添加缺失的号段

### 问题 4：API 请求失败

**原因**：后端服务未启动或端口冲突

**解决**：
```bash
# 检查端口占用
netstat -tlnp | grep 3000

# 检查后端日志
tail -50 /home/vue-element-admin/backend/server.log
```

## 📝 测试报告模板

### 基本信息
- 测试日期: _______________
- 测试人员: _______________
- 环境: 生产环境 / 测试环境

### 测试结果

| 测试项 | 结果 | 备注 |
|--------|------|------|
| 单元测试 | ☑️ 通过 / ☐ 失败 | |
| 美国号码 | ☑️ 通过 / ☐ 失败 | |
| 中国号码 | ☑️ 通过 / ☐ 失败 | |
| 多国号码 | ☑️ 通过 / ☐ 失败 | |
| 提取功能 | ☑️ 通过 / ☐ 失败 | |
| 显示正确 | ☑️ 通过 / ☐ 失败 | |

### 发现的问题
1. _____________________
2. _____________________
3. _____________________

### 测试结论
☑️ 通过验收，可以上线
☐ 需要修复后再测试

## 🎯 验收标准

### 必须满足：
- ✅ 所有国家都使用 Google libphonenumber
- ✅ 准确识别号码国家
- ✅ 正确验证号码有效性
- ✅ 运营商统计准确
- ✅ 前端正确显示分析方法

### 建议满足：
- ✅ 处理速度满足要求（< 5秒/1000条）
- ✅ 错误提示友好清晰
- ✅ 界面显示美观
- ✅ 文档齐全

## 📚 相关文档

- [全球支持说明](./GLOBAL-LIBPHONENUMBER-SUPPORT.md)
- [更新日志](./UPDATE-LOG-GLOBAL-LIBPHONENUMBER.md)
- [集成文档](./AWESOME-PHONENUMBER-INTEGRATION.md)
- [快速开始](./AWESOME-PHONENUMBER-QUICKSTART.md)

## ✅ 快速验证命令

```bash
# 1. 检查服务状态
ps aux | grep "node.*server.js" | grep -v grep

# 2. 运行单元测试
cd /home/vue-element-admin/backend && node test-awesome-phonenumber.js

# 3. 检查后端日志
tail -20 /home/vue-element-admin/backend/server.log

# 4. 访问前端
echo "前端地址: http://localhost:9528"
echo "后端地址: http://localhost:3000"
```

## 🎉 验证完成

如果所有测试都通过，说明：
- ✅ 全球运营商查询功能正常
- ✅ 所有国家统一使用 Google libphonenumber
- ✅ 系统稳定可靠
- ✅ 可以投入使用

**更新时间**: 2025-10-17  
**验证状态**: 待执行  
**验证人**: _______________
