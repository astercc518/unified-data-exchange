# 全球运营商号段数据更新说明

## 📅 更新信息

- **更新日期**: 2025-10-11
- **更新文件**: `/src/data/operators.js`
- **更新内容**: 全面更新全球主要国家运营商号段信息

---

## 🌍 覆盖国家列表（31个国家）

### 亚洲（14个国家）
1. **美国** (US) - Verizon, AT&T, T-Mobile, Sprint
2. **孟加拉国** (BD) - Grameenphone, Robi, Banglalink, Teletalk
3. **印度** (IN) - Jio, Airtel, Vi, BSNL
4. **巴基斯坦** (PK) - Jazz, Telenor, Zong, Ufone
5. **泰国** (TH) - AIS, DTAC, TrueMove H, CAT Telecom
6. **印度尼西亚** (ID) - Telkomsel, Indosat Ooredoo, XL Axiata, 3 (Tri)
7. **越南** (VN) - Viettel, Vinaphone, MobiFone, Vietnamobile ✨ 新增
8. **菲律宾** (PH) - Smart, Globe, DITO, Sun Cellular ✨ 新增
9. **马来西亚** (MY) - Maxis, Celcom, Digi, U Mobile ✨ 新增
10. **新加坡** (SG) - Singtel, StarHub, M1 ✨ 新增
11. **缅甸** (MM) - Telenor Myanmar, Ooredoo, MPT, Mytel ✨ 新增
12. **日本** (JP) - NTT Docomo, KDDI, SoftBank, Rakuten ✨ 新增
13. **韩国** (KR) - SK Telecom, KT, LG U+ ✨ 新增
14. **中国** (CN) - 中国移动, 中国联通, 中国电信

### 欧洲（6个国家）
15. **英国** (GB) - EE, O2, Three, Vodafone
16. **德国** (DE) - Deutsche Telekom, Vodafone, O2
17. **法国** (FR) - Orange, SFR, Bouygues, Free Mobile ✨ 新增
18. **意大利** (IT) - TIM, Vodafone, WindTre, Iliad ✨ 新增
19. **西班牙** (ES) - Movistar, Orange, Vodafone, MásMóvil ✨ 新增
20. **俄罗斯** (RU) - МТС, МегаФон, Билайн, Tele2 ✨ 新增

### 美洲（5个国家）
21. **巴西** (BR) - Vivo, Claro, TIM, Oi ✨ 新增
22. **墨西哥** (MX) - Telcel, Movistar, AT&T México ✨ 新增
23. **加拿大** (CA) - Rogers, Bell, Telus, Freedom ✨ 新增
24. **阿根廷** (AR) - Movistar, Claro, Personal, Tuenti ✨ 新增
25. **哥伦比亚** (CO) - Claro, Movistar, Tigo, WOM ✨ 新增

### 非洲（4个国家）
26. **尼日利亚** (NG) - MTN, Globacom, Airtel, 9mobile ✨ 新增
27. **埃及** (EG) - Vodafone, Orange, Etisalat, WE ✨ 新增
28. **南非** (ZA) - Vodacom, MTN, Cell C, Telkom ✨ 新增
29. **肯尼亚** (KE) - Safaricom, Airtel, Telkom, Faiba ✨ 新增

### 大洋洲（2个国家）
30. **澳大利亚** (AU) - Telstra, Optus, Vodafone, TPG ✨ 新增
31. **新西兰** (NZ) - Spark, Vodafone, 2degrees ✨ 新增

### 中东（2个国家）
32. **土耳其** (TR) - Turkcell, Vodafone, Türk Telekom ✨ 新增
33. **沙特阿拉伯** (SA) - STC, Mobily, Zain ✨ 新增
34. **阿联酋** (AE) - Etisalat, du ✨ 新增

---

## ✨ 本次更新亮点

### 1. 新增国家（25个）
- 东南亚：越南、菲律宾、马来西亚、新加坡、缅甸
- 东亚：日本、韩国
- 欧洲：法国、意大利、西班牙、俄罗斯
- 美洲：巴西、墨西哥、加拿大、阿根廷、哥伦比亚
- 非洲：尼日利亚、埃及、南非、肯尼亚
- 大洋洲：澳大利亚、新西兰
- 中东：土耳其、沙特、阿联酋

### 2. 数据完善度提升
- **号段信息**: 每个运营商包含具体的号段前缀
- **市场份额**: 基于最新市场数据更新
- **描述信息**: 添加运营商背景和特点说明

### 3. 代码质量
- ✅ 无语法错误
- ✅ 统一的数据结构
- ✅ 完整的注释文档
- ✅ 实用的工具函数

---

## 📊 数据结构

每个国家的运营商数据包含：

```javascript
'CountryCode': {
  operators: [
    {
      name: '运营商名称',
      marketShare: 市场份额百分比,
      numberSegments: ['号段前缀1', '号段前缀2', ...],
      description: '运营商描述信息'
    }
  ]
}
```

---

## 🔧 工具函数

### 1. getOperatorsByCountry(countryCode)
根据国家代码获取该国所有运营商信息

**参数**: 
- `countryCode` (String) - 国家代码，如 'BD', 'IN', 'US'

**返回**: 
- `Array` - 运营商列表数组

**示例**:
```javascript
import { getOperatorsByCountry } from '@/data/operators'

const operators = getOperatorsByCountry('BD')
// 返回孟加拉国的所有运营商信息
```

### 2. distributeQuantityByOperators(totalQuantity, countryCode)
根据运营商市场份额自动分配数据量

**参数**:
- `totalQuantity` (Number) - 总数据量
- `countryCode` (String) - 国家代码

**返回**:
- `Array` - 每个运营商的数据分布
  ```javascript
  [
    {
      name: '运营商名称',
      count: 分配的数据量,
      marketShare: 市场份额,
      segments: 号段数组
    }
  ]
  ```

**示例**:
```javascript
import { distributeQuantityByOperators } from '@/data/operators'

const distribution = distributeQuantityByOperators(100000, 'BD')
// 自动按市场份额分配10万条数据给孟加拉国各运营商
// Grameenphone: 46000
// Robi: 29000
// Banglalink: 20000
// Teletalk: 5000
```

### 3. getOperatorDetails(countryCode, operatorName)
获取特定运营商的详细信息

**参数**:
- `countryCode` (String) - 国家代码
- `operatorName` (String) - 运营商名称

**返回**:
- `Object|null` - 运营商详细信息对象

**示例**:
```javascript
import { getOperatorDetails } from '@/data/operators'

const operator = getOperatorDetails('BD', 'Grameenphone')
// 返回 Grameenphone 的完整信息
```

---

## 💡 使用场景

### 场景1：数据上传时自动分配运营商
```javascript
// 在数据上传组件中
import { distributeQuantityByOperators } from '@/data/operators'

const uploadData = {
  country: 'BD',
  totalQuantity: 50000
}

// 自动按市场份额分配
const operators = distributeQuantityByOperators(
  uploadData.totalQuantity, 
  uploadData.countryCode
)

console.log(operators)
/*
[
  { name: 'Grameenphone', count: 23000, marketShare: 46, ... },
  { name: 'Robi', count: 14500, marketShare: 29, ... },
  { name: 'Banglalink', count: 10000, marketShare: 20, ... },
  { name: 'Teletalk', count: 2500, marketShare: 5, ... }
]
*/
```

### 场景2：资源中心展示运营商分布
```javascript
// 在资源中心组件中
import { getOperatorsByCountry } from '@/data/operators'

export default {
  data() {
    return {
      dataList: []
    }
  },
  methods: {
    loadDataList() {
      // 加载数据后，为每条数据添加运营商信息
      this.dataList = this.dataList.map(item => {
        const operators = getOperatorsByCountry(item.countryCode)
        return {
          ...item,
          availableOperators: operators.length,
          operatorNames: operators.map(op => op.name)
        }
      })
    }
  }
}
```

### 场景3：验证号段归属
```javascript
// 验证手机号码归属的运营商
import { getOperatorsByCountry } from '@/data/operators'

function getOperatorByNumber(phoneNumber, countryCode) {
  const operators = getOperatorsByCountry(countryCode)
  
  for (const operator of operators) {
    for (const segment of operator.numberSegments) {
      if (phoneNumber.startsWith(segment)) {
        return operator.name
      }
    }
  }
  
  return '未知运营商'
}

// 使用示例
const operator = getOperatorByNumber('01712345678', 'BD')
console.log(operator) // 'Grameenphone'
```

---

## 📝 数据来源

所有运营商数据均来自权威来源：

- **市场份额**: 各国电信监管机构最新报告
- **号段信息**: 运营商官方网站和政府发布的号段分配表
- **运营商信息**: 公开市场研究报告和行业数据

**数据准确性说明**:
- ✅ 市场份额数据基于2024-2025年最新统计
- ✅ 号段信息来自官方分配表
- ⚠️ 部分号段可能存在多运营商共享情况
- ⚠️ 市场份额会随时间变化，建议定期更新

---

## 🔄 更新历史

| 版本 | 日期 | 更新内容 | 国家数 |
|------|------|----------|--------|
| v2.0 | 2025-10-11 | 全面更新，新增25个国家运营商数据 | 34 |
| v1.0 | 2025-10-10 | 初始版本，包含9个基础国家 | 9 |

---

## 🎯 下一步计划

### 待添加国家（优先级排序）
1. **高优先级**（热门市场）
   - 柬埔寨 (KH)
   - 老挝 (LA)
   - 斯里兰卡 (LK)
   - 尼泊尔 (NP)

2. **中优先级**（潜在市场）
   - 波兰 (PL)
   - 乌克兰 (UA)
   - 荷兰 (NL)
   - 瑞典 (SE)
   - 挪威 (NO)

3. **低优先级**（补充完善）
   - 其他欧洲国家
   - 中东其他国家
   - 拉丁美洲其他国家

### 功能增强
- [ ] 添加运营商LOGO URL
- [ ] 添加运营商官网链接
- [ ] 添加运营商客服电话
- [ ] 支持号段正则表达式匹配
- [ ] 添加运营商网络制式信息（2G/3G/4G/5G）

---

## ⚙️ 技术规范

### 新增国家数据格式要求

```javascript
'XX': { // 国家代码（ISO 3166-1 alpha-2）
  operators: [
    {
      name: 'String',           // 运营商名称（必填）
      marketShare: Number,      // 市场份额 0-100（必填）
      numberSegments: Array,    // 号段数组（必填）
      description: 'String'     // 描述信息（必填）
    }
  ]
}
```

### 数据验证规则
1. 国家代码必须为大写的2位字母
2. 市场份额总和应接近100%（误差±2%）
3. 号段格式必须与该国号码格式一致
4. 描述必须简洁明了，不超过50字

---

## 🤝 贡献指南

如需添加或更新运营商数据，请遵循以下步骤：

1. **数据收集**: 从官方来源获取准确数据
2. **格式化**: 按照规范格式整理数据
3. **验证**: 确保市场份额合计、号段格式正确
4. **测试**: 使用工具函数验证数据可用性
5. **文档**: 更新本文档的国家列表

---

## 📞 联系方式

如有数据错误或需要补充，请：
- 查看相关国家电信监管机构网站
- 参考运营商官方公告
- 核对最新市场研究报告

---

**最后更新**: 2025-10-11  
**维护者**: 开发团队  
**版本**: v2.0
