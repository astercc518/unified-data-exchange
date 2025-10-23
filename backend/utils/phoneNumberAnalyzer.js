/**
 * 电话号码分析工具
 * 基于 awesome-phonenumber (Google libphonenumber) 库
 * 提供真实的运营商识别、号码验证等功能
 */

const { parsePhoneNumber, getCountryCodeForRegionCode } = require('awesome-phonenumber');
const logger = require('./logger');

/**
 * 解析电话号码
 * @param {string} phoneNumber - 电话号码（可以是任何格式，包括国码+号码格式如528661302532）
 * @param {string} regionCode - 国家/地区代码（如 'US', 'CN', 'MX' 等），可选
 * @returns {object} 解析结果
 */
function parsePhone(phoneNumber, regionCode = null) {
  try {
    let cleanedNumber = phoneNumber.trim();
    
    // 确保号码以 + 开头（E.164 格式要求）
    // 对于已包含国码的号码（如528661302532），直接添加+即可
    if (!cleanedNumber.startsWith('+')) {
      cleanedNumber = '+' + cleanedNumber;
    }
    
    // 首先尝试直接解析（适用于已包含国码的完整号码）
    let pn = parsePhoneNumber(cleanedNumber);
    
    // 如果解析失败且提供了国家代码，尝试使用国家代码解析
    if (!pn.valid && regionCode) {
      // 移除 + 再用国家代码解析
      const numberWithoutPlus = phoneNumber.trim().replace(/^\+/, '');
      pn = parsePhoneNumber(numberWithoutPlus, { regionCode });
    }
    
    return {
      valid: pn.valid,
      possible: pn.possible,
      number: {
        e164: pn.number?.e164 || null,
        international: pn.number?.international || null,
        national: pn.number?.national || null,
        rfc3966: pn.number?.rfc3966 || null,
        significant: pn.number?.significant || null  // 本地号码（不含国码）
      },
      regionCode: pn.regionCode || null,  // 国家代码（如 MX）
      countryCode: pn.countryCode || null,  // 国际区号（如 52）
      type: pn.typeIsMobile ? 'mobile' : (pn.typeIsFixedLine ? 'fixed-line' : 'unknown'),
      carrier: pn.canBeInternationallyDialled ? 'international' : 'domestic',
      canBeInternationallyDialled: pn.canBeInternationallyDialled || false
    };
  } catch (error) {
    logger.error('电话号码解析失败:', error.message);
    return {
      valid: false,
      error: error.message
    };
  }
}

/**
 * 批量解析电话号码
 * @param {Array<string>} phoneNumbers - 电话号码数组
 * @param {string} regionCode - 默认国家/地区代码
 * @returns {Array<object>} 解析结果数组
 */
function parsePhones(phoneNumbers, regionCode = null) {
  return phoneNumbers.map(phone => ({
    original: phone,
    ...parsePhone(phone, regionCode)
  }));
}

/**
 * 验证电话号码
 * @param {string} phoneNumber - 电话号码
 * @param {string} regionCode - 国家/地区代码
 * @returns {boolean} 是否有效
 */
function isValidPhoneNumber(phoneNumber, regionCode = null) {
  const result = parsePhone(phoneNumber, regionCode);
  return result.valid;
}

/**
 * 格式化电话号码
 * @param {string} phoneNumber - 电话号码
 * @param {string} format - 格式类型: 'e164', 'international', 'national', 'rfc3966'
 * @param {string} regionCode - 国家/地区代码
 * @returns {string|null} 格式化后的号码
 */
function formatPhoneNumber(phoneNumber, format = 'e164', regionCode = null) {
  const result = parsePhone(phoneNumber, regionCode);
  if (!result.valid) {
    return null;
  }
  return result.number[format] || null;
}

/**
 * 分析文件中号码的国家分布
 * @param {Array<string>} phoneNumbers - 电话号码数组
 * @returns {object} 国家分布统计
 */
function analyzeCountryDistribution(phoneNumbers) {
  const countryStats = {};
  const invalidNumbers = [];
  
  phoneNumbers.forEach((phone, index) => {
    const result = parsePhone(phone);
    
    if (result.valid && result.regionCode) {
      const region = result.regionCode;
      if (!countryStats[region]) {
        countryStats[region] = {
          regionCode: region,
          countryCode: result.countryCode,
          count: 0,
          numbers: []
        };
      }
      countryStats[region].count++;
      countryStats[region].numbers.push({
        original: phone,
        formatted: result.number.e164
      });
    } else {
      invalidNumbers.push({
        index,
        number: phone,
        reason: result.error || '无法识别国家'
      });
    }
  });
  
  return {
    totalCount: phoneNumbers.length,
    validCount: phoneNumbers.length - invalidNumbers.length,
    invalidCount: invalidNumbers.length,
    countries: Object.values(countryStats).sort((a, b) => b.count - a.count),
    invalidNumbers: invalidNumbers.slice(0, 20) // 只返回前20个无效号码
  };
}

/**
 * 分析任意国家号码的运营商分布（基于号段的智能分组）
 * 注意：awesome-phonenumber 提供号码验证和解析，运营商匹配基于号段配置
 * @param {Array<string>} phoneNumbers - 电话号码数组
 * @param {Array<object>} operators - 运营商配置
 * @param {string} regionCode - 国家代码（如 'US', 'CN'）
 * @returns {object} 运营商分布统计
 */
function analyzeOperatorDistribution(phoneNumbers, operators, regionCode) {
  const distribution = operators.map(op => ({
    name: op.name,
    numberSegments: op.numberSegments,
    count: 0,
    numbers: []
  }));
  
  let validCount = 0;
  let invalidCount = 0;
  let unmatchedCount = 0;
  
  phoneNumbers.forEach(phone => {
    // 解析号码
    const result = parsePhone(phone, regionCode);
    
    if (!result.valid) {
      invalidCount++;
      return;
    }
    
    // 如果指定了国家代码，验证号码是否属于该国家
    if (regionCode && result.regionCode !== regionCode) {
      invalidCount++;
      return;
    }
    
    validCount++;
    
    // 获取本地号码（去除国码）
    const nationalNumber = result.number.significant;
    
    if (!nationalNumber) {
      unmatchedCount++;
      return;
    }
    
    // 提取号段前缀（用于匹配运营商）
    // 不同国家的号段长度不同，这里尝试多种长度
    let matchedSegment = null;
    
    // 尝试从最长的号段到最短的号段（4位 -> 3位 -> 2位 -> 1位）
    for (let segmentLen = 4; segmentLen >= 1; segmentLen--) {
      const segment = nationalNumber.substring(0, segmentLen);
      
      // 检查是否匹配任何运营商
      for (const dist of distribution) {
        if (dist.numberSegments.includes(segment)) {
          matchedSegment = segment;
          dist.count++;
          dist.numbers.push({
            original: phone,
            formatted: result.number.e164,
            segment: segment
          });
          break;
        }
      }
      
      if (matchedSegment) {
        break;
      }
    }
    
    if (!matchedSegment) {
      unmatchedCount++;
    }
  });
  
  return {
    totalCount: phoneNumbers.length,
    validCount: validCount,
    invalidCount: invalidCount,
    unmatchedCount: unmatchedCount,
    distribution: distribution.filter(d => d.count > 0)
  };
}

/**
 * 分析美国号码的运营商分布（为了兼容性保留）
 * @deprecated 请使用 analyzeOperatorDistribution 代替
 */
function analyzeUSOperatorDistribution(phoneNumbers, operators) {
  return analyzeOperatorDistribution(phoneNumbers, operators, 'US');
}

/**
 * 获取国家的国际区号
 * @param {string} regionCode - 国家代码（如 'US', 'CN'）
 * @returns {number|null} 国际区号
 */
function getCountryCode(regionCode) {
  try {
    return getCountryCodeForRegionCode(regionCode);
  } catch (error) {
    return null;
  }
}

/**
 * 标准化电话号码数组（转换为E.164格式）
 * @param {Array<string>} phoneNumbers - 电话号码数组
 * @param {string} regionCode - 默认国家代码
 * @returns {Array<object>} 标准化结果
 */
function normalizePhoneNumbers(phoneNumbers, regionCode = null) {
  return phoneNumbers.map(phone => {
    const result = parsePhone(phone, regionCode);
    return {
      original: phone,
      normalized: result.valid ? result.number.e164 : phone,
      valid: result.valid,
      regionCode: result.regionCode,
      countryCode: result.countryCode
    };
  });
}

module.exports = {
  parsePhone,
  parsePhones,
  isValidPhoneNumber,
  formatPhoneNumber,
  analyzeCountryDistribution,
  analyzeOperatorDistribution,
  analyzeUSOperatorDistribution,  // 保留以保持兼容性
  getCountryCode,
  normalizePhoneNumbers
};
