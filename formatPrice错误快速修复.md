# formatPrice 错误快速修复

## 🎯 错误信息
```
TypeError: _vm.formatPrice is not a function
```

## 🔍 问题原因
`formatPrice` 已导入但未在 `methods` 中声明

## 🔧 修复方案

**文件**: `/src/views/resource/center.vue`

**添加位置**: methods 对象中（第1095-1104行）

**添加代码**:
```javascript
// 辅助方法：格式化价格
formatPrice(price) {
  return formatPrice(price)
},
```

## ✅ 修复效果

### 修复前
- ❌ TypeError 错误
- ❌ 价格列无法显示
- ❌ 页面渲染失败

### 修复后
- ✅ 价格正常显示
- ✅ 格式化为4位小数
- ✅ 无控制台错误

## 📊 验证方法

访问资源中心：
```
http://localhost:9528/#/resource/center
```

检查价格列应显示：
```
0.0500 U/条
```

## 📚 原理说明

**为什么需要在 methods 中声明？**

Vue 模板只能访问组件实例的方法，即使在 `<script>` 中导入了函数，也需要在 `methods` 中声明：

```javascript
// 1. 导入函数
import { formatPrice } from '@/utils/dynamicPricing'

// 2. 在 methods 中声明（必需）
methods: {
  formatPrice(price) {
    return formatPrice(price)
  }
}

// 3. 模板中使用
{{ formatPrice(100) }}
```

---

详细报告：[`formatPrice错误修复报告.md`](/home/vue-element-admin/formatPrice错误修复报告.md)
