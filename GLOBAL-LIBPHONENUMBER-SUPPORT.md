# 全球运营商查询 - Google libphonenumber 支持

## 📋 概述

系统已全面升级，**所有国家的运营商查询都统一使用 Google libphonenumber 标准库**（通过 awesome-phonenumber 实现）。

### ✨ 核心特性

- 🌍 **全球支持**：支持所有国家和地区的电话号码
- 🔍 **智能解析**：自动识别号码格式和国家代码
- ✅ **格式验证**：严格的号码有效性检查
- 🎯 **精确匹配**：基于运营商号段的智能分组
- 📊 **统一标准**：所有国家使用相同的分析方法

## 🚀 升级内容

### 之前
- 美国号码：使用 awesome-phonenumber（libphonenumber）
- 其他国家：使用简单号段匹配

### 现在
- **所有国家**：统一使用 awesome-phonenumber（libphonenumber）

## 🔧 技术实现

### 1. 核心工具类

**文件**: `backend/utils/phoneNumberAnalyzer.js`

```javascript
/**
 * 分析任意国家号码的运营商分布
 * @param {Array<string>} phoneNumbers - 电话号码数组
 * @param {Array<object>} operators - 运营商配置
 * @param {string} regionCode - 国家代码（如 'US', 'CN', 'GB'）
 */
function analyzeOperatorDistribution(phoneNumbers, operators, regionCode)
```

**关键特性**：
- ✅ 使用 libphonenumber 验证号码有效性
- ✅ 自动过滤无效号码
- ✅ 支持 1-4 位号段前缀匹配
- ✅ 返回详细的统计信息

### 2. 后端路由

**文件**: `backend/routes/dataProcessing.js`

**国家代码映射表**：
```javascript
const countryCodeMap = {
  '1': 'US',      // 美国
  '86': 'CN',     // 中国
  '91': 'IN',     // 印度
  '44': 'GB',     // 英国
  '81': 'JP',     // 日本
  '82': 'KR',     // 韩国
  '65': 'SG',     // 新加坡
  '60': 'MY',     // 马来西亚
  '66': 'TH',     // 泰国
  '84': 'VN',     // 越南
  '62': 'ID',     // 印度尼西亚
  '63': 'PH',     // 菲律宾
  '880': 'BD',    // 孟加拉国
  '92': 'PK'      // 巴基斯坦
};
```

**统一处理逻辑**：
```javascript
// 所有国家统一使用 awesome-phonenumber
const regionCode = countryCodeMap[countryCode] || null;
const result = PhoneAnalyzer.analyzeOperatorDistribution(
  phoneNumbers, 
  operators, 
  regionCode
);

// 添加分析方法标识
result.analysisMethod = 'awesome-phonenumber';
result.note = '使用 Google libphonenumber 库进行号码解析和验证';
```

### 3. 前端显示

**文件**: `src/views/data/processing.vue`

**所有国家都显示分析方法**：
```javascript
const analysisMethod = response.data.analysisMethod || 'unknown'
const methodText = analysisMethod === 'awesome-phonenumber' 
  ? '使用 Google libphonenumber 库进行智能分析'
  : '使用号段匹配'

this.$message({
  message: `分析完成！检测到 ${distribution.length} 个运营商
    ✓ 分析方法：${methodText}`
})
```

## 📊 支持的国家示例

| 国家 | 国码 | 区域代码 | 号码示例 | 格式 |
|------|------|----------|----------|------|
| 🇺🇸 美国 | +1 | US | 12025551234 | 11位 |
| 🇨🇳 中国 | +86 | CN | 8613800138000 | 13位 |
| 🇮🇳 印度 | +91 | IN | 917700123456 | 12位 |
| 🇬🇧 英国 | +44 | GB | 442071234567 | 12位 |
| 🇯🇵 日本 | +81 | JP | 8180123456789 | 12-13位 |
| 🇰🇷 韩国 | +82 | KR | 821012345678 | 11-12位 |
| 🇸🇬 新加坡 | +65 | SG | 6581234567 | 10位 |

## 🧪 测试验证

### 测试文件

已创建多国测试数据文件：
```
backend/test_data/multi_country_numbers.txt
```

包含以下国家的号码：
- 美国 (US) - 8条
- 中国 (CN) - 10条
- 英国 (GB) - 5条
- 印度 (IN) - 5条
- 新加坡 (SG) - 4条

### 运行测试

```bash
# 1. 运行单元测试
cd /home/vue-element-admin/backend
node test-awesome-phonenumber.js

# 2. 上传测试文件进行完整测试
# - 登录系统
# - 上传 multi_country_numbers.txt
# - 点击"按运营商提取"
# - 查看分析结果
```

### 预期结果

所有国家的分析结果都应显示：
```
✓ 分析方法：使用 Google libphonenumber 库进行智能分析
```

统计信息包括：
- ✅ 总数据量
- ✅ 有效号码数
- ✅ 无效号码数
- ✅ 未匹配号码数
- ✅ 运营商分布详情

## 📝 使用说明

### 1. 文件上传

上传包含电话号码的文本文件，支持多种格式：
```
12025551234
(202) 555-1234
202-555-1234
+1-202-555-1234
```

### 2. 智能识别

系统会自动：
- 识别号码所属国家
- 验证号码有效性
- 标准化为 E.164 格式
- 过滤无效号码

### 3. 运营商分析

点击"按运营商提取"：
- 查看运营商分布统计
- 显示分析方法（Google libphonenumber）
- 选择运营商进行提取
- 下载提取结果

### 4. 结果说明

分析结果包含：
```json
{
  "totalCount": 100,        // 总数据量
  "validCount": 95,         // 有效号码
  "invalidCount": 3,        // 无效号码
  "unmatchedCount": 2,      // 未匹配运营商
  "analysisMethod": "awesome-phonenumber",
  "note": "使用 Google libphonenumber 库进行号码解析和验证",
  "regionCode": "US",       // 国家代码
  "distribution": [...]     // 运营商分布
}
```

## 🎯 优势

### 1. 标准化
- 使用 Google 官方标准库
- 全球通用的号码验证规则
- 统一的数据处理流程

### 2. 准确性
- 严格的号码格式验证
- 自动识别国家和区号
- 智能处理各种输入格式

### 3. 灵活性
- 支持所有国家和地区
- 自动适配不同号码格式
- 可扩展的运营商配置

### 4. 可维护性
- 统一的代码实现
- 清晰的模块划分
- 完善的错误处理

## 🔄 向后兼容

保留了旧函数以确保兼容性：

```javascript
// 旧函数（已废弃但仍可用）
function analyzeUSOperatorDistribution(phoneNumbers, operators) {
  return analyzeOperatorDistribution(phoneNumbers, operators, 'US');
}
```

建议新代码使用通用函数：
```javascript
// 新函数（推荐）
analyzeOperatorDistribution(phoneNumbers, operators, 'US')  // 美国
analyzeOperatorDistribution(phoneNumbers, operators, 'CN')  // 中国
analyzeOperatorDistribution(phoneNumbers, operators, 'GB')  // 英国
```

## 📚 相关文档

- [awesome-phonenumber 集成说明](./AWESOME-PHONENUMBER-INTEGRATION.md)
- [快速开始指南](./AWESOME-PHONENUMBER-QUICKSTART.md)
- [集成完成总结](./AWESOME-PHONENUMBER-COMPLETE.md)

## 🎉 总结

系统现已全面支持 Google libphonenumber 标准：
- ✅ 所有国家统一使用智能分析
- ✅ 提供准确的号码验证
- ✅ 支持多种号码格式
- ✅ 完善的错误处理
- ✅ 向后兼容旧代码

**升级时间**: 2025-10-17  
**影响范围**: 全球所有国家  
**测试状态**: ✅ 已通过测试
