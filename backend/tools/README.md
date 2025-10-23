# 运营商号段分析工具集

这些工具用于分析真实数据并补全运营商号段配置。

## 🛠️ 工具列表

### 1. analyze-country-segments.js
**分析国家号段分布**

分析上传的数据文件，提取实际使用的所有号段。

**用法**：
```bash
node tools/analyze-country-segments.js <国家代码> <数据文件路径>
```

**示例**：
```bash
# 分析泰国数据
node tools/analyze-country-segments.js TH /path/to/thailand-data.txt

# 分析马来西亚数据
node tools/analyze-country-segments.js MY malaysia.txt
```

**输出**：
- 号段分布统计（1-4位）
- 配置建议（JSON格式）
- 详细分析报告（保存到 analysis-results/）

---

### 2. verify-country-config.js
**验证配置匹配率**

验证operators.js中的配置是否能达到100%匹配率。

**用法**：
```bash
node tools/verify-country-config.js <国家代码> <数据文件路径>
```

**示例**：
```bash
# 验证泰国配置
node tools/verify-country-config.js TH thailand.txt

# 验证印度配置
node tools/verify-country-config.js IN india-data.txt
```

**输出**：
- 匹配率统计
- 运营商分布
- 未匹配号段分析
- 配置优化建议
- 验证报告（保存到 verification-results/）

---

## 📋 完整处理流程

### 步骤1：上传数据
将数据文件放到任意位置，或直接提供文件路径。

### 步骤2：运行分析
```bash
node tools/analyze-country-segments.js TH thailand.txt
```

**查看输出**：
- 号段分布情况
- 建议的配置（复制JSON）

### 步骤3：更新配置
编辑 `/home/vue-element-admin/src/data/operators.js`：

```javascript
'TH': {
  operators: [
    { 
      name: 'AIS', 
      numberSegments: ['81', '82', '83', ...],  // 从分析结果复制
      marketShare: 45
    },
    // ... 其他运营商
  ]
}
```

### 步骤4：验证配置
```bash
node tools/verify-country-config.js TH thailand.txt
```

**期望结果**：
```
📊 匹配率: 100.00%
✅ 匹配率达到100%，配置完美！
```

### 步骤5：迭代优化
如果匹配率未达100%：
1. 查看"未匹配号段分布"
2. 将这些号段添加到相应运营商
3. 重新验证，直到100%

---

## 📁 输出目录

### analysis-results/
存储号段分析报告：
- `th-segments-analysis.json` - 泰国分析结果
- `my-segments-analysis.json` - 马来西亚分析结果
- ...

### verification-results/
存储验证报告：
- `th-verification-2025-10-17.json` - 泰国验证（日期）
- `my-verification-2025-10-17.json` - 马来西亚验证
- ...

---

## 🎯 支持的国家

**高优先级**（需要数据）：
- 🇮🇳 印度（IN）
- 🇵🇰 巴基斯坦（PK）
- 🇹🇭 泰国（TH）
- 🇲🇾 马来西亚（MY）
- 🇬🇧 英国（GB）

**其他35个国家**：
TH, MY, IN, PK, GB, KR, LK, NP, LA, AF, IR, IQ, SA, IL, KZ, UZ, 
PL, RO, BE, PT, CZ, HU, SE, NO, DK, FI, CH, AT, AR, VE, EG, ZA, 
UG, TZ, NZ

---

## 💡 使用提示

### 数据质量要求
- **数量**：至少5,000条（推荐10,000+）
- **格式**：国码+完整号码（如：66812345678）
- **质量**：真实有效的号码

### 常见问题

**Q: 分析结果显示多个号段长度，该用哪个？**
A: 工具会自动推荐最合适的长度。通常：
- 1-2位：欧洲、南美国家
- 3位：亚洲大部分国家
- 4位：缅甸、巴基斯坦等

**Q: 如何判断号段归属哪个运营商？**
A: 
1. 参考分析结果中的号段使用量
2. 查询该国官方电信监管机构网站
3. 按市场份额分配高频号段

**Q: 匹配率只有95%，如何处理剩余5%？**
A: 
1. 查看"未匹配号段分布"
2. 将高频未匹配号段添加到配置
3. 如果是新运营商号段，创建新运营商条目
4. 重新验证直到100%

---

## 📚 相关文档

- [运营商号段补全指南](../../OPERATOR-SEGMENT-COMPLETION-GUIDE.md)
- [全球修复总览](../../GLOBAL-OPERATOR-FIXES-SUMMARY.md)
- [快速参考](../../OPERATOR-QUICK-REFERENCE.md)

---

## ✨ 成功案例

### 菲律宾（PH）
- **数据量**：15,705条
- **处理时间**：25分钟
- **结果**：46.6% → 100% ✅
- **新增号段**：29个

详见：[PHILIPPINES-OPERATOR-FIX.md](../../PHILIPPINES-OPERATOR-FIX.md)

---

**工具版本**: 1.0  
**最后更新**: 2025-10-17  
**维护者**: System
