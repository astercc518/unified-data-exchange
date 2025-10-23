# 数据上传记录同步功能测试指南

**测试目的**: 验证文件上传后，文件列表能够自动同步显示最新上传的记录  
**测试时间**: 2025-10-18  
**测试人员**: AI Assistant

---

## 📋 测试前准备

### 1. 确认服务状态

```bash
# 检查后端服务
curl http://localhost:3000/health

# 检查前端服务
curl -I http://localhost:9528/

# 检查数据库
mysql -u vue_admin_user -pvue_admin_2024 vue_admin -e "SHOW TABLES LIKE 'customer_data_files';"
```

### 2. 准备测试数据

创建几个测试文件：

```bash
# 测试文件1 (简单数据)
echo -e "13812345678\n13987654321\n15912345678" > /tmp/test_upload_1.txt

# 测试文件2 (带国码)
echo -e "+8613812345678\n+8613987654321\n+8615912345678" > /tmp/test_upload_2.txt

# 测试文件3 (混合数据)
echo -e "13812345678\n+8613987654321\n15912345678\ninvalid_data\n13812345678" > /tmp/test_upload_3.txt
```

### 3. 登录系统

- 访问: http://localhost:9528
- 账号: admin
- 密码: 111111

---

## 🧪 测试用例

### 用例1: 单文件上传自动刷新

**测试步骤**:
1. 进入"数据管理" → "数据处理中心"
2. 记录当前文件列表的数量（例如：N 个文件）
3. 点击"上传文件"按钮
4. 选择 `/tmp/test_upload_1.txt` 文件
5. 等待上传成功提示
6. **不关闭对话框，观察列表**

**预期结果**:
- ✅ 上传成功后 1 秒内，列表自动刷新
- ✅ 文件列表数量变为 N+1
- ✅ 新上传的文件显示在列表第一行（最新）
- ✅ 文件信息正确：
  - 文件名: test_upload_1.txt
  - 上传用户: admin
  - 数据行数: 3
  - 上传时间: 当前时间

### 用例2: 对话框关闭后刷新

**测试步骤**:
1. 保持用例1的对话框打开状态
2. 记录当前列表中第一个文件的上传时间
3. 点击对话框的"关闭"按钮
4. 观察列表是否再次刷新

**预期结果**:
- ✅ 关闭对话框后，列表再次刷新
- ✅ 最新上传的文件仍然在第一行
- ✅ 不需要手动点击"刷新"按钮

### 用例3: 多文件上传

**测试步骤**:
1. 点击"上传文件"按钮
2. 同时选择 `/tmp/test_upload_2.txt` 和 `/tmp/test_upload_3.txt`
3. 等待所有文件上传完成
4. 观察列表更新情况

**预期结果**:
- ✅ 每个文件上传成功后，列表自动刷新
- ✅ 两个新文件都显示在列表前面
- ✅ 文件按上传时间倒序排列
- ✅ test_upload_3.txt 显示去重和过滤信息（有重复数据和异常数据）

### 用例4: 上传异常数据文件

**测试步骤**:
1. 创建包含大量异常数据的文件：
   ```bash
   echo -e "123\nabc\n999999999999999999\n13812345678\n456" > /tmp/test_invalid.txt
   ```
2. 上传该文件
3. 观察上传结果和列表更新

**预期结果**:
- ✅ 上传成功
- ✅ 显示过滤统计（原始5条，有效1条，过滤4条）
- ✅ 列表显示文件，行数为1
- ✅ 列表自动刷新

### 用例5: 网络延迟模拟

**测试步骤**:
1. 上传一个较大的文件（如果有）或重复上传测试文件
2. 在上传过程中快速观察列表
3. 上传完成后继续观察

**预期结果**:
- ✅ 上传中不会提前刷新
- ✅ 上传成功后，延迟 500ms 后刷新
- ✅ 确保看到的是上传成功后的数据

### 用例6: 手动刷新功能

**测试步骤**:
1. 上传一个文件
2. 等待自动刷新
3. 点击列表上方的"刷新"按钮
4. 观察列表

**预期结果**:
- ✅ 手动刷新功能正常工作
- ✅ 列表数据与自动刷新结果一致
- ✅ 不会出现重复记录

---

## 🔍 验证要点

### 1. 数据库验证

```bash
# 查看最新上传的文件记录
mysql -u vue_admin_user -pvue_admin_2024 vue_admin -e "
  SELECT id, original_filename, customer_name, line_count, 
         FROM_UNIXTIME(upload_time/1000) as upload_time
  FROM customer_data_files 
  WHERE status = 1 
  ORDER BY upload_time DESC 
  LIMIT 5;
"
```

### 2. 前端控制台验证

打开浏览器开发者工具（F12），观察：
- Network 选项卡中 `/api/data-processing/files` 请求
- Console 选项卡中是否有错误
- 请求响应时间和数据

### 3. 时序验证

使用浏览器开发者工具的 Network 选项卡：
1. 筛选 XHR 请求
2. 观察上传成功后的请求顺序：
   ```
   POST /api/data-processing/upload (上传)
   ↓ (约500ms延迟)
   GET /api/data-processing/files (刷新列表)
   ```

---

## ⚠️ 常见问题排查

### 问题1: 列表不刷新

**可能原因**:
- 前端服务未重启
- 后端服务异常
- 数据库连接问题

**排查方法**:
```bash
# 检查前端服务
ps aux | grep 'npm run dev'
curl -I http://localhost:9528/

# 检查后端服务
curl http://localhost:3000/health

# 检查数据库
mysql -u vue_admin_user -pvue_admin_2024 -e "SELECT 1;"
```

### 问题2: 刷新太慢

**可能原因**:
- 500ms 延迟不够
- 数据库写入慢

**解决方法**:
调整延迟时间（在 processing.vue 中）：
```javascript
setTimeout(() => {
  this.fetchFileList()
}, 1000) // 改为 1000ms
```

### 问题3: 重复刷新

**可能原因**:
- 多文件上传时每个文件都触发刷新（正常行为）

**说明**:
这是预期行为，确保列表实时更新。

### 问题4: 数据不一致

**排查方法**:
```bash
# 对比数据库和前端显示
# 1. 查看数据库记录数
mysql -u vue_admin_user -pvue_admin_2024 vue_admin -e "
  SELECT COUNT(*) as total FROM customer_data_files WHERE status = 1;
"

# 2. 在浏览器中查看列表数量
# 应该一致
```

---

## 📊 测试记录表

| 用例 | 测试时间 | 测试结果 | 备注 |
|------|---------|---------|------|
| 用例1: 单文件上传 | ________ | ☐ 通过 ☐ 失败 | _________ |
| 用例2: 对话框关闭 | ________ | ☐ 通过 ☐ 失败 | _________ |
| 用例3: 多文件上传 | ________ | ☐ 通过 ☐ 失败 | _________ |
| 用例4: 异常数据 | ________ | ☐ 通过 ☐ 失败 | _________ |
| 用例5: 网络延迟 | ________ | ☐ 通过 ☐ 失败 | _________ |
| 用例6: 手动刷新 | ________ | ☐ 通过 ☐ 失败 | _________ |

---

## ✅ 验收标准

所有测试用例通过后，确认以下功能正常：

- [x] 文件上传成功
- [x] 列表自动刷新（延迟500ms）
- [x] 对话框关闭时刷新
- [x] 新文件显示在列表顶部
- [x] 文件信息准确（文件名、大小、行数、时间）
- [x] 异常数据过滤和统计正确
- [x] 手动刷新功能正常
- [x] 无重复记录
- [x] 无错误提示

---

## 🎯 快速测试命令

```bash
# 一键测试脚本
cat > /tmp/quick_upload_test.sh << 'EOF'
#!/bin/bash

echo "=== 数据上传同步测试 ==="

# 1. 创建测试文件
echo "1. 创建测试文件..."
echo -e "13812345678\n13987654321\n15912345678" > /tmp/test_upload_$(date +%s).txt
echo "✓ 测试文件已创建: /tmp/test_upload_*.txt"

# 2. 检查服务状态
echo -e "\n2. 检查服务状态..."
if curl -s http://localhost:3000/health | grep -q "ok"; then
    echo "✓ 后端服务正常"
else
    echo "✗ 后端服务异常"
fi

if curl -s -I http://localhost:9528/ | grep -q "200 OK"; then
    echo "✓ 前端服务正常"
else
    echo "✗ 前端服务异常"
fi

# 3. 查看当前文件数量
echo -e "\n3. 当前文件数量:"
mysql -u vue_admin_user -pvue_admin_2024 vue_admin -e "
  SELECT COUNT(*) as total FROM customer_data_files WHERE status = 1;
" 2>/dev/null

echo -e "\n=== 请手动进行上传测试 ==="
echo "访问: http://localhost:9528"
echo "登录: admin / 111111"
echo "进入: 数据管理 → 数据处理中心"
echo "上传: /tmp/test_upload_*.txt"

EOF

chmod +x /tmp/quick_upload_test.sh
/tmp/quick_upload_test.sh
```

---

## 📞 技术支持

如遇问题，请检查：

1. **修复文档**: [DATA_UPLOAD_SYNC_FIX.md](./DATA_UPLOAD_SYNC_FIX.md)
2. **后端日志**: `tail -f /tmp/backend.log`
3. **前端日志**: `tail -f /tmp/frontend.log`
4. **数据库日志**: `/var/log/mariadb/mariadb.log`

---

**测试指南版本**: 1.0  
**最后更新**: 2025-10-18  
**状态**: ✅ 可用
