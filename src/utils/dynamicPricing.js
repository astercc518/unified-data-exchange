/**
 * 动态定价计算工具
 * 根据业务需求实现时效性降价机制
 */

/**
 * 计算数据的当前销售价格
 * @param {Object} dataItem - 数据项
 * @param {Number} dataItem.sellPrice - 原始销售价
 * @param {Number} dataItem.costPrice - 成本价
 * @param {Number} dataItem.publishTime - 发布时间戳
 * @param {Number} currentTime - 当前时间戳（可选，默认为当前时间）
 * @returns {Object} 包含当前销售价、时效显示、降价信息的对象
 */
export function calculateCurrentPrice(dataItem, currentTime = Date.now()) {
  // 验证输入
  if (!dataItem || typeof dataItem !== 'object') {
    console.warn('⚠️ calculateCurrentPrice: 无效的 dataItem', dataItem)
    return {
      currentPrice: 0,
      validityDisplay: '未知',
      discountInfo: '无',
      daysSincePublish: 0,
      originalPrice: 0,
      discountPercent: '0'
    }
  }

  const { sellPrice, costPrice, publishTime } = dataItem

  if (!publishTime || !sellPrice) {
    return {
      currentPrice: sellPrice || 0,
      validityDisplay: '未知',
      discountInfo: '无',
      daysSincePublish: 0,
      originalPrice: sellPrice || 0,
      discountPercent: '0'
    }
  }

  try {
    // 计算距离发布时间的天数
    const daysSincePublish = Math.floor((currentTime - publishTime) / (1000 * 60 * 60 * 24))

    let currentPrice = sellPrice
    let validityDisplay = '未知'
    let discountInfo = '无折扣'
    let totalDiscountRate = 0 // 总降价比例

    if (daysSincePublish <= 3) {
      // 0-3天：原价
      currentPrice = sellPrice
      validityDisplay = '3天内'
      discountInfo = '原价'
      totalDiscountRate = 0
    } else if (daysSincePublish <= 7) {
      // 4-7天：每天降价5%叠加
      const discountDays = daysSincePublish - 3 // 从第4天开始计算
      totalDiscountRate = discountDays * 0.05 // 每天降5%
      currentPrice = sellPrice * (1 - totalDiscountRate)
      validityDisplay = '7天内'
      discountInfo = `第${daysSincePublish}天，每天降5%，已降${(totalDiscountRate * 100).toFixed(0)}%`
    } else if (daysSincePublish <= 15) {
      // 8-15天：在第7天价格基础上，每天降价2%叠加
      const firstPeriodDiscount = 4 * 0.05 // 第4-7天的降价：4天 * 5% = 20%
      const discountDays = daysSincePublish - 7 // 从第8天开始计算
      const secondPeriodDiscount = discountDays * 0.02 // 每天降2%
      totalDiscountRate = firstPeriodDiscount + secondPeriodDiscount
      currentPrice = sellPrice * (1 - totalDiscountRate)
      validityDisplay = '15天内'
      discountInfo = `第${daysSincePublish}天，第4-7天降20%，第8天起每天再降2%，已降${(totalDiscountRate * 100).toFixed(0)}%`
    } else if (daysSincePublish <= 30) {
      // 16-30天：在第15天价格基础上，每天降价1%叠加
      const firstPeriodDiscount = 4 * 0.05 // 第4-7天：20%
      const secondPeriodDiscount = 8 * 0.02 // 第8-15天：8天 * 2% = 16%
      const discountDays = daysSincePublish - 15 // 从第16天开始计算
      const thirdPeriodDiscount = discountDays * 0.01 // 每天降1%
      totalDiscountRate = firstPeriodDiscount + secondPeriodDiscount + thirdPeriodDiscount
      currentPrice = sellPrice * (1 - totalDiscountRate)
      validityDisplay = '30天内'
      discountInfo = `第${daysSincePublish}天，第4-7天降20%，第8-15天再降16%，第16天起每天再降1%，已降${(totalDiscountRate * 100).toFixed(0)}%`
    } else {
      // 30天以上：达到最大降价
      const firstPeriodDiscount = 4 * 0.05 // 20%
      const secondPeriodDiscount = 8 * 0.02 // 16%
      const thirdPeriodDiscount = 15 * 0.01 // 15%
      totalDiscountRate = firstPeriodDiscount + secondPeriodDiscount + thirdPeriodDiscount // 51%
      // 但最大不超过50%
      totalDiscountRate = Math.min(totalDiscountRate, 0.50)
      currentPrice = sellPrice * (1 - totalDiscountRate)
      validityDisplay = '近期'
      discountInfo = `第${daysSincePublish}天，已达最大降价50%`
    }

    // 确保最大降价不超过50%
    const maxDiscountPrice = sellPrice * 0.5
    if (currentPrice < maxDiscountPrice) {
      currentPrice = maxDiscountPrice
      totalDiscountRate = 0.50
      discountInfo += '（已限制为最大陏价50%）'
    }

    // 确保价格不低于成本价
    if (costPrice && currentPrice < costPrice) {
      currentPrice = costPrice
      totalDiscountRate = (sellPrice - costPrice) / sellPrice
      discountInfo += '（已限制为成本价）'
    }

    return {
      currentPrice: Number(currentPrice.toFixed(4)),
      validityDisplay,
      discountInfo,
      daysSincePublish,
      originalPrice: sellPrice,
      discountPercent: (totalDiscountRate * 100).toFixed(1)
    }
  } catch (error) {
    console.error('❌ calculateCurrentPrice 计算出错:', error, dataItem)
    return {
      currentPrice: sellPrice || 0,
      validityDisplay: '错误',
      discountInfo: '计算失败',
      daysSincePublish: 0,
      originalPrice: sellPrice || 0,
      discountPercent: '0'
    }
  }
}

/**
 * 批量更新数据列表的价格
 * @param {Array} dataList - 数据列表
 * @param {Number} currentTime - 当前时间戳（可选）
 * @returns {Array} 更新价格后的数据列表
 */
export function updateDataListPricing(dataList, currentTime = Date.now()) {
  if (!Array.isArray(dataList)) {
    console.warn('⚠️ updateDataListPricing: dataList 不是数组', dataList)
    return []
  }

  try {
    return dataList.map((item, index) => {
      try {
        // 验证数据项
        if (!item || typeof item !== 'object') {
          console.warn(`⚠️ 索引 ${index} 的数据项无效:`, item)
          return item
        }

        const pricingInfo = calculateCurrentPrice(item, currentTime)
        return {
          ...item,
          currentSellPrice: pricingInfo.currentPrice,
          validityDisplay: pricingInfo.validityDisplay,
          discountInfo: pricingInfo.discountInfo,
          daysSincePublish: pricingInfo.daysSincePublish,
          discountPercent: pricingInfo.discountPercent,
          originalSellPrice: item.sellPrice // 保存原始价格
        }
      } catch (itemError) {
        console.error(`❌ 处理索引 ${index} 的数据项时出错:`, itemError, item)
        // 返回原始数据项，添加默认值
        return {
          ...item,
          currentSellPrice: item.sellPrice || 0,
          validityDisplay: item.validityDisplay || '未知',
          discountInfo: '无法计算',
          daysSincePublish: 0,
          discountPercent: '0',
          originalSellPrice: item.sellPrice || 0
        }
      }
    })
  } catch (error) {
    console.error('❌ updateDataListPricing 出错:', error)
    // 返回原数据，避免页面崩溃
    return dataList
  }
}

/**
 * 获取时效性类型的样式类名
 * @param {String} validityDisplay - 时效显示文本
 * @returns {String} 样式类名
 */
export function getValidityStyleClass(validityDisplay) {
  const styleMap = {
    '3天内': 'validity-fresh',
    '7天内': 'validity-good',
    '15天内': 'validity-normal',
    '30天内': 'validity-old',
    '近期': 'validity-outdated'
  }
  return styleMap[validityDisplay] || 'validity-unknown'
}

/**
 * 获取时效性类型的Element UI标签类型
 * @param {String} validityDisplay - 时效显示文本
 * @returns {String} Element UI标签类型
 */
export function getValidityTagType(validityDisplay) {
  const tagMap = {
    '3天内': 'success',
    '7天内': 'warning',
    '15天内': 'info',
    '30天内': 'warning',
    '近期': 'danger'
  }
  return tagMap[validityDisplay] || 'info'
}

/**
 * 根据原始时效性和发布时间计算当前时效显示
 * @param {String} originalValidity - 原始时效性（3、30、30+）
 * @param {Number} publishTime - 发布时间戳
 * @param {Number} currentTime - 当前时间戳（可选）
 * @returns {String} 当前时效显示
 */
export function calculateValidityDisplay(originalValidity, publishTime, currentTime = Date.now()) {
  if (!publishTime) {
    // 没有发布时间，使用原始时效性
    const validityMap = {
      '3': '3天内',
      '30': '30天内',
      '30+': '30天以上'
    }
    return validityMap[originalValidity] || '未知'
  }

  const daysSincePublish = Math.floor((currentTime - publishTime) / (1000 * 60 * 60 * 24))

  if (daysSincePublish <= 3) {
    return '3天内'
  } else if (daysSincePublish <= 7) {
    return '7天内'
  } else if (daysSincePublish <= 15) {
    return '15天内'
  } else if (daysSincePublish <= 30) {
    return '30天内'
  } else {
    return '近期'
  }
}

/**
 * 预测未来某一天的价格
 * @param {Object} dataItem - 数据项
 * @param {Number} targetDays - 目标天数（从发布时间开始）
 * @returns {Object} 预测价格信息
 */
export function predictPriceAtDay(dataItem, targetDays) {
  const { sellPrice, costPrice, publishTime } = dataItem

  if (!publishTime || !sellPrice) {
    return {
      predictedPrice: sellPrice || 0,
      validityDisplay: '未知',
      discountInfo: '无'
    }
  }

  // 模拟目标时间
  const targetTime = publishTime + (targetDays * 24 * 60 * 60 * 1000)

  return calculateCurrentPrice(dataItem, targetTime)
}

/**
 * 获取价格趋势数据（用于图表展示）
 * @param {Object} dataItem - 数据项
 * @param {Number} days - 预测天数（默认60天）
 * @returns {Array} 价格趋势数据数组
 */
export function getPriceTrend(dataItem, days = 60) {
  const { sellPrice, publishTime } = dataItem

  if (!sellPrice || !publishTime) {
    return []
  }

  const trendData = []

  for (let day = 0; day <= days; day++) {
    const prediction = predictPriceAtDay(dataItem, day)
    trendData.push({
      day,
      price: prediction.predictedPrice,
      validity: prediction.validityDisplay,
      discount: prediction.discountInfo
    })
  }

  return trendData
}

/**
 * 计算定价调整对收益的影响
 * @param {Object} dataItem - 数据项
 * @param {Number} newSellPrice - 新的销售价
 * @param {Number} period - 计算周期（天数）
 * @returns {Object} 收益影响分析
 */
export function analyzePricingImpact(dataItem, newSellPrice, period = 30) {
  const { sellPrice, costPrice, availableQuantity } = dataItem

  // 计算原价格收益
  const originalRevenue = calculatePeriodRevenue(
    { ...dataItem, sellPrice },
    period
  )

  // 计算新价格收益
  const newRevenue = calculatePeriodRevenue(
    { ...dataItem, sellPrice: newSellPrice },
    period
  )

  const revenueDifference = newRevenue - originalRevenue
  const percentageChange = originalRevenue > 0 ? (revenueDifference / originalRevenue * 100) : 0

  return {
    originalRevenue,
    newRevenue,
    revenueDifference,
    percentageChange: Number(percentageChange.toFixed(2)),
    recommendation: getRecommendation(percentageChange, revenueDifference)
  }
}

/**
 * 计算指定周期内的预期收益
 * @param {Object} dataItem - 数据项
 * @param {Number} period - 周期（天数）
 * @returns {Number} 预期收益
 */
function calculatePeriodRevenue(dataItem, period) {
  const { availableQuantity, costPrice } = dataItem
  let totalRevenue = 0

  // 假设每天销售数量递减
  const dailySales = availableQuantity / period

  for (let day = 1; day <= period; day++) {
    const pricingInfo = predictPriceAtDay(dataItem, day)
    const profit = pricingInfo.predictedPrice - costPrice
    totalRevenue += dailySales * profit
  }

  return totalRevenue
}

/**
 * 获取定价建议
 * @param {Number} percentageChange - 收益变化百分比
 * @param {Number} revenueDifference - 收益差异
 * @returns {String} 建议文本
 */
function getRecommendation(percentageChange, revenueDifference) {
  if (percentageChange > 10) {
    return '强烈建议调价：预期收益显著提升'
  } else if (percentageChange > 5) {
    return '建议调价：预期收益有所提升'
  } else if (percentageChange > -5) {
    return '可以考虑：收益影响较小'
  } else if (percentageChange > -10) {
    return '谨慎调价：可能影响收益'
  } else {
    return '不建议调价：可能显著降低收益'
  }
}

/**
 * 格式化价格显示
 * @param {Number} price - 价格
 * @param {Number} precision - 精度（小数位数）
 * @returns {String} 格式化后的价格字符串
 */
export function formatPrice(price, precision = 4) {
  if (typeof price !== 'number') return '0.0000'
  return price.toFixed(precision)
}

/**
 * 格式化时间差显示
 * @param {Number} publishTime - 发布时间戳
 * @param {Number} currentTime - 当前时间戳（可选）
 * @returns {String} 格式化的时间差字符串
 */
export function formatTimeDifference(publishTime, currentTime = Date.now()) {
  if (!publishTime) return '未知时间'

  const diffMs = currentTime - publishTime
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (diffDays > 0) {
    return `${diffDays}天前`
  } else if (diffHours > 0) {
    return `${diffHours}小时前`
  } else {
    return '刚刚发布'
  }
}

export default {
  calculateCurrentPrice,
  updateDataListPricing,
  getValidityStyleClass,
  getValidityTagType,
  calculateValidityDisplay,
  predictPriceAtDay,
  getPriceTrend,
  analyzePricingImpact,
  formatPrice,
  formatTimeDifference
}
