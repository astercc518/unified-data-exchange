# ✅ SMPP字节序问题修复 - 快速参考

## 🚨 问题

**收到的短信全部乱码**：
```
错误：吀栀椀猀 椀猀 愀 琀攀猀琀 洀攀猀猀愀最攀 昀爀漀洀 N捫慓텓
原文：This is a test message from 一正卡发
```

---

## ✅ 原因

**字节序错误**：使用了小端序（Little Endian）而非大端序（Big Endian）

| 编码 | 字节序 | 结果 |
|------|--------|------|
| `'ucs2'` / `'utf16le'` | 小端序 | ❌ 全部乱码 |
| `'utf16be'` | **大端序** | **✅ 正确显示** |

---

## 🔧 修复

### 修改代码

**文件**：`backend/services/smppService.js` 第145行

```diff
- shortMessage = Buffer.from(content, 'ucs2');     // ❌ 小端序
+ shortMessage = Buffer.from(content, 'utf16be');  // ✅ 大端序
```

### 已部署 ✅

- 代码已修改
- 服务已重启
- 待测试验证

---

## 🧪 测试

1. 打开通道管理 → 一正卡发 → 测试
2. 手机号：`84977109485`
3. 内容：`This is a test message from 一正卡发`
4. 发送

**预期结果**：
```
This is a test message from 一正卡发  ✓
```

**不应出现**：
```
吀栀椀猀 椀猀 愀...  ❌
```

---

## 📊 技术说明

### 字节序对比

```
字符 'T' (Unicode U+0054)：

小端序（错误）：
编码：54 00
解析：U+5400 = 吀 ❌

大端序（正确）：
编码：00 54
解析：U+0054 = T ✓
```

### SMPP要求

```
data_coding = 8 (UCS-2)
必须使用：UTF-16 Big Endian（大端序）
```

---

## 📚 详细文档

完整说明：[`SMPP字节序问题修复说明.md`](/home/vue-element-admin/SMPP字节序问题修复说明.md)

---

**修复时间**：2025-10-22  
**状态**：✅ 已修复，待测试
