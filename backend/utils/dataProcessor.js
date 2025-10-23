/**
/**
 * 数据处理工具类
 * 提供数据去重、增加国码、去除国码、数据对比、按运营商提取、按条数提取等功能
 */
const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');
const { createReadStream, createWriteStream } = require('fs');

/**
 * 全球国家标准手机号长度配置（不含国码）
 * 数据来源：ITU国际电信联盟标准 + 各国实际使用情况
 * 支持110个国家和地区
 */
const STANDARD_PHONE_LENGTH_MAP = {
  // 亚洲 (26个国家)
  '86': [11],          // 中国
  '91': [10],          // 印度
  '880': [10],         // 孟加拉国
  '92': [10],          // 巴基斯坦
  '62': [9, 10, 11],   // 印度尼西亚
  '81': [10],          // 日本
  '63': [10],          // 菲律宾
  '84': [9, 10],       // 越南
  '66': [9],           // 泰国
  '60': [9, 10],       // 马来西亚
  '65': [8],           // 新加坡
  '82': [9, 10],       // 韩国
  '95': [9, 10],       // 缅甸
  '94': [9],           // 斯里兰卡
  '977': [10],         // 尼泊尔
  '855': [8, 9],       // 柬埔寨
  '856': [10],         // 老挝
  '93': [9],           // 阿富汗
  '98': [10],          // 伊朗
  '964': [10],         // 伊拉克
  '966': [9],          // 沙特阿拉伯
  '971': [9],          // 阿联酋
  '90': [10],          // 土耳其
  '972': [9],          // 以色列
  '7': [10],           // 俄罗斯/哈萨克斯坦
  '998': [9],          // 乌兹别克斯坦
  
  // 欧洲 (21个国家)
  '49': [10, 11],      // 德国
  '44': [10],          // 英国
  '33': [9],           // 法国
  '39': [9, 10],       // 意大利
  '34': [9],           // 西班牙
  '48': [9],           // 波兰
  '380': [9],          // 乌克兰
  '40': [9],           // 罗马尼亚
  '31': [9],           // 荷兰
  '32': [9],           // 比利时
  '30': [10],          // 希腊
  '351': [9],          // 葡萄牙
  '420': [9],          // 捷克
  '36': [9],           // 匈牙利
  '46': [9],           // 瑞典
  '47': [8],           // 挪威
  '45': [8],           // 丹麦
  '358': [9, 10],      // 芬兰
  '41': [9],           // 瑞士
  '43': [10, 11],      // 奥地利
  
  // 北美洲 (11个国家)
  '1': [10],           // 美国/加拿大/多米尼加
  '52': [10],          // 墨西哥
  '502': [8],          // 危地马拉
  '53': [8],           // 古巴
  '509': [8],          // 海地
  '504': [8],          // 洪都拉斯
  '505': [8],          // 尼加拉瓜
  '506': [8],          // 哥斯达黎加
  '507': [8],          // 巴拿马
  
  // 南美洲 (12个国家)
  '55': [10, 11],      // 巴西
  '57': [10],          // 哥伦比亚
  '54': [10],          // 阿根廷
  '51': [9],           // 秘鲁
  '58': [10],          // 委内瑞拉
  '56': [9],           // 智利
  '593': [9],          // 厄瓜多尔
  '591': [8],          // 玻利维亚
  '595': [9],          // 巴拉圭
  '598': [8],          // 乌拉圭
  '592': [7],          // 圭亚那
  '597': [7],          // 苏里南
  
  // 非洲 (30个国家)
  '234': [10],         // 尼日利亚
  '251': [9],          // 埃塞俄比亚
  '20': [10],          // 埃及
  '27': [9],           // 南非
  '254': [9],          // 肯尼亚
  '256': [9],          // 乌干达
  '213': [9],          // 阿尔及利亚
  '249': [9],          // 苏丹
  '212': [9],          // 摩洛哥
  '244': [9],          // 安哥拉
  '233': [9],          // 加纳
  '258': [9],          // 莫桑比克
  '261': [9],          // 马达加斯加
  '237': [9],          // 喀麦隆
  '225': [10],         // 科特迪瓦
  '227': [8],          // 尼日尔
  '226': [8],          // 布基纳法索
  '223': [8],          // 马里
  '265': [9],          // 马拉维
  '260': [9],          // 赞比亚
  '263': [9],          // 津巴布韦
  
  // 大洋洲 (10个国家)
  '61': [9],           // 澳大利亚
  '675': [8],          // 巴布亚新几内亚
  '64': [9, 10],       // 新西兰
  '679': [7],          // 斐济
  '677': [7],          // 所罗门群岛
  '687': [6],          // 新喀里多尼亚
  '689': [8],          // 法属波利尼西亚
  '678': [7],          // 瓦努阿图
  '685': [7],          // 萨摩亚
  '686': [8]           // 基里巴斯
};

/**
 * 获取国家标准手机号长度（不含国码）
 * @param {string} countryCode - 国码，如 "52", "86", "971"
 * @returns {Array} 标准长度数组，如 [10], [9, 10]
 */
function getStandardPhoneLengths(countryCode) {
  return STANDARD_PHONE_LENGTH_MAP[countryCode] || [9, 10, 11];
}

/**
 * 检查是否为有效的国际手机号码
 * @param {string} phone - 手机号码
 * @param {string} countryCode - 国码（可选）
 * @returns {boolean} 是否有效
 */
function isValidInternationalPhone(phone, countryCode = null) {
  // 去除非数字字符
  const cleaned = phone.replace(/[^\d]/g, '');
  
  // 基本长度检查
  if (cleaned.length < 7 || cleaned.length > 19) {
    return false;
  }
  
  // 如果提供了国码，检查是否符合该国家的标准
  if (countryCode) {
    const standardLengths = getStandardPhoneLengths(countryCode);
    const codeLength = countryCode.length;
    const standardLengthsWithCode = standardLengths.map(len => len + codeLength);
    
    // 检查是否带国码
    const hasCode = cleaned.substring(0, codeLength) === countryCode;
    if (hasCode) {
      return standardLengthsWithCode.includes(cleaned.length);
    } else {
      return standardLengths.includes(cleaned.length);
    }
  }
  
  return true;
}

// 运营商数据需要从数据库或配置文件加载，这里提供一个简单的获取方法
function getOperatorsByCountry(countryCode) {
  // 这里可以从数据库或配置文件加载运营商信息
  // 为了简化，返回空数组，让前端处理
  return [];
}

class DataProcessor {
  /**
   * 读取文件所有行
   */
  static async readLines(filePath) {
    const lines = [];
    const fileStream = createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    for await (const line of rl) {
      const trimmed = line.trim();
      if (trimmed) {
        lines.push(trimmed);
      }
    }
    return lines;
  }

  /**
   * 写入文件
   */
  static async writeLines(filePath, lines) {
    const content = lines.join('\n');
    await fs.writeFile(filePath, content, 'utf-8');
  }

  /**
   * 数据去重
   */
  static async deduplicate(inputPath, outputPath) {
    const lines = await this.readLines(inputPath);
    const uniqueLines = [...new Set(lines)];
    await this.writeLines(outputPath, uniqueLines);
    
    return {
      originalCount: lines.length,
      uniqueCount: uniqueLines.length,
      duplicateCount: lines.length - uniqueLines.length
    };
  }

  /**
   * 增加国码（国际电话区号）
   * 智能校验国码：检查前缀和总长度，避免重复添加
   * @param {string} inputPath - 输入文件路径
   * @param {string} outputPath - 输出文件路径
   * @param {string} countryCode - 国际电话区号数字部分（如 52, 86，不带 + 号）
   * @returns {object} { processedCount, addedCount, skippedCount, countryCode }
   */
  static async addCountryCode(inputPath, outputPath, countryCode) {
    const lines = await this.readLines(inputPath);
    
    let addedCount = 0;
    let skippedCount = 0;
    const codeLength = countryCode.length;
    const standardPhoneLengths = getStandardPhoneLengths(countryCode);
    const standardLengthsWithCode = standardPhoneLengths.map(len => len + codeLength);
    
    const processedLines = lines.map(line => {
      // 清理数据：去除非数字字符
      const cleaned = line.replace(/[^\d]/g, '');
      
      // 检查是否已有该国码前缀
      const prefix = cleaned.substring(0, codeLength);
      const hasCodePrefix = prefix === countryCode;
      
      // 检查总长度是否符合标准（含国码）
      const isStandardLengthWithCode = standardLengthsWithCode.includes(cleaned.length);
      // 检查总长度是否符合标准（不含国码）
      const isStandardLengthWithoutCode = standardPhoneLengths.includes(cleaned.length);
      
      // 情况1：已有国码且总长度符合标准 -> 跳过
      if (hasCodePrefix && isStandardLengthWithCode) {
        skippedCount++;
        return cleaned;
      }
      
      // 情况2：没有国码且总长度符合标准（纯手机号）-> 添加国码
      if (!hasCodePrefix && isStandardLengthWithoutCode) {
        addedCount++;
        return countryCode + cleaned;
      }
      
      // 情况3：已有国码前缀但长度不标准 -> 保留原样（可能是其他国家数据）
      if (hasCodePrefix) {
        skippedCount++;
        return cleaned;
      }
      
      // 情况4：其他情况 -> 先检查是否已经是其他110个国家的有效数据
      // 按国码长度从长到短检查（3位 -> 2位 -> 1位）
      for (let otherCodeLen = 3; otherCodeLen >= 1; otherCodeLen--) {
        const possibleCode = cleaned.substring(0, otherCodeLen);
        
        // 检查是否在标准国码列表中
        if (STANDARD_PHONE_LENGTH_MAP[possibleCode]) {
          const otherStandardLengths = STANDARD_PHONE_LENGTH_MAP[possibleCode];
          const otherStandardLengthsWithCode = otherStandardLengths.map(len => len + otherCodeLen);
          
          // 如果符合其他国家的标准，则保持原样，不添加国码
          if (otherStandardLengthsWithCode.includes(cleaned.length)) {
            skippedCount++;
            return cleaned;
          }
        }
      }
      
      // 没有匹配到任何已知国家，尝试添加国码
      addedCount++;
      return countryCode + cleaned;
    });
    
    await this.writeLines(outputPath, processedLines);
    
    return {
      processedCount: processedLines.length,
      addedCount: addedCount,
      skippedCount: skippedCount,
      countryCode: countryCode
    };
  }

  /**
   * 去除国码（国际电话区号）
   * 智能去除国码：基于国家标准长度判断是否去除国码
   * @param {string} inputPath - 输入文件路径
   * @param {string} outputPath - 输出文件路径
   * @param {string} countryCode - 指定的国际电话区号数字部分（如 52，不带 + 号），null则智能去除所有国码
   * @returns {object} { processedCount, removedCount, skippedCount }
   */
  static async removeCountryCode(inputPath, outputPath, countryCode = null) {
    const lines = await this.readLines(inputPath);
    
    let removedCount = 0;
    let skippedCount = 0;
    
    const processedLines = lines.map(line => {
      // 清理数据：去除非数字字符
      const cleaned = line.replace(/[^\d]/g, '');
      
      if (countryCode) {
        // 去除指定国码（智能模式）
        const codeLength = countryCode.length;
        const standardPhoneLengths = getStandardPhoneLengths(countryCode);
        const standardLengthsWithCode = standardPhoneLengths.map(len => len + codeLength);
        
        const prefix = cleaned.substring(0, codeLength);
        const hasCodePrefix = prefix === countryCode;
        const isStandardLengthWithCode = standardLengthsWithCode.includes(cleaned.length);
        
        // 如果前缀匹配且总长度符合标准（含国码），则去除国码
        if (hasCodePrefix && isStandardLengthWithCode) {
          removedCount++;
          return cleaned.substring(codeLength);
        }
        
        // 否则保持原样
        skippedCount++;
        return cleaned;
      } else {
        // 智能去除所有国码：尝试匹配110个国家的国码
        let removed = false;
        
        // 按国码长度从长到短检查（3位 -> 2位 -> 1位），避免误判
        for (let codeLen = 3; codeLen >= 1; codeLen--) {
          const possibleCode = cleaned.substring(0, codeLen);
          
          // 检查是否在标准国码列表中
          if (STANDARD_PHONE_LENGTH_MAP[possibleCode]) {
            const standardLengths = STANDARD_PHONE_LENGTH_MAP[possibleCode];
            const standardLengthsWithCode = standardLengths.map(len => len + codeLen);
            
            // 如果总长度符合该国家标准（含国码），去除国码
            if (standardLengthsWithCode.includes(cleaned.length)) {
              removedCount++;
              removed = true;
              return cleaned.substring(codeLen);
            }
          }
        }
        
        // 如果没有匹配到任何国码，保持原样
        if (!removed) {
          skippedCount++;
        }
        return cleaned;
      }
    });
    
    await this.writeLines(outputPath, processedLines);
    
    return {
      processedCount: processedLines.length,
      removedCount: removedCount,
      skippedCount: skippedCount
    };
  }

  /**
   * 数据对比（找出差异）
   */
  static async compareData(file1Path, file2Path, outputPath, mode = 'diff') {
    const lines1 = await this.readLines(file1Path);
    const lines2 = await this.readLines(file2Path);
    const set1 = new Set(lines1);
    const set2 = new Set(lines2);
    
    let result = [];
    
    switch (mode) {
      case 'diff': // 在文件1中但不在文件2中
        result = lines1.filter(line => !set2.has(line));
        break;
      case 'common': // 两个文件共有的
        result = lines1.filter(line => set2.has(line));
        break;
      case 'unique': // 两个文件各自独有的
        const unique1 = lines1.filter(line => !set2.has(line));
        const unique2 = lines2.filter(line => !set1.has(line));
        result = [...unique1, ...unique2];
        break;
    }
    
    await this.writeLines(outputPath, result);
    
    return {
      file1Count: lines1.length,
      file2Count: lines2.length,
      resultCount: result.length,
      mode: mode
    };
  }

  /**
   * 分析文件中的运营商分布
   * @param {string} inputPath - 输入文件路径
   * @param {Object} operatorConfig - 运营商配置 { countryCode: 'BD', operators: [{name, numberSegments}] }
   * @returns {Promise<Object>} 运营商分布统计
   */
  static async analyzeOperatorDistribution(inputPath, operatorConfig) {
    const lines = await this.readLines(inputPath);
    const { countryCode, operators } = operatorConfig;
    
    // 初始化每个运营商的计数器
    const distribution = operators.map(op => ({
      name: op.name,
      numberSegments: op.numberSegments,
      count: 0
    }));
    
    let unmatchedCount = 0;
    
    // 遍历所有数据行，统计每个运营商的数量
    for (const line of lines) {
      const cleaned = line.replace(/[^\d]/g, '');
      let phoneNumber = cleaned;
      
      // 智能去除国码
      if (countryCode) {
        const codeLength = countryCode.length;
        const standardPhoneLengths = getStandardPhoneLengths(countryCode);
        const standardLengthsWithCode = standardPhoneLengths.map(len => len + codeLength);
        
        const prefix = cleaned.substring(0, codeLength);
        const hasCodePrefix = prefix === countryCode;
        const isStandardLengthWithCode = standardLengthsWithCode.includes(cleaned.length);
        
        if (hasCodePrefix && isStandardLengthWithCode) {
          phoneNumber = cleaned.substring(codeLength);
        }
      } else {
        // 未指定国码，尝试自动识别并去除
        let removed = false;
        for (let codeLen = 3; codeLen >= 1 && !removed; codeLen--) {
          const possibleCode = cleaned.substring(0, codeLen);
          if (STANDARD_PHONE_LENGTH_MAP[possibleCode]) {
            const standardLengths = STANDARD_PHONE_LENGTH_MAP[possibleCode];
            const standardLengthsWithCode = standardLengths.map(len => len + codeLen);
            if (standardLengthsWithCode.includes(cleaned.length)) {
              phoneNumber = cleaned.substring(codeLen);
              removed = true;
            }
          }
        }
      }
      
      // 检查该号码属于哪个运营商
      let matched = false;
      for (const dist of distribution) {
        if (dist.numberSegments.some(segment => phoneNumber.startsWith(segment))) {
          dist.count++;
          matched = true;
          break;
        }
      }
      
      if (!matched) {
        unmatchedCount++;
      }
    }
    
    return {
      totalCount: lines.length,
      distribution: distribution.filter(d => d.count > 0), // 只返回有数据的运营商
      unmatchedCount: unmatchedCount
    };
  }

  /**
   * 按运营商提取数据（根据号段匹配）
   * 支持全球110个国家，智能识别国码后匹配号段
   * @param {string} inputPath - 输入文件路径
   * @param {string} outputPath - 输出文件路径
   * @param {Array} numberSegments - 号段列表（不含国码的号段前缀）
   * @param {string} countryCode - 国码（可选），指定后会更准确地去除国码
   * @param {number} limit - 提取条数限制（可选），不指定则提取所有匹配数据
   * @returns {object} { totalCount, matchedCount, unmatchedCount, segments }
   */
  static async extractByOperator(inputPath, outputPath, numberSegments, countryCode = null, limit = null) {
    const lines = await this.readLines(inputPath);
    
    let matchedLines = [];
    let unmatchedCount = 0;
    
    // 提取匹配号段的数据
    for (const line of lines) {
      // 如果已达到限制条数，停止提取
      if (limit && matchedLines.length >= limit) {
        break;
      }
      
      // 清理数据：去除所有非数字字符
      const cleaned = line.replace(/[^\d]/g, '');
      
      let phoneNumber = cleaned;
      
      // 智能去除国码
      if (countryCode) {
        // 如果指定了国码，检查并去除
        const codeLength = countryCode.length;
        const standardPhoneLengths = getStandardPhoneLengths(countryCode);
        const standardLengthsWithCode = standardPhoneLengths.map(len => len + codeLength);
        
        const prefix = cleaned.substring(0, codeLength);
        const hasCodePrefix = prefix === countryCode;
        const isStandardLengthWithCode = standardLengthsWithCode.includes(cleaned.length);
        
        // 如果前缀匹配且总长度符合标准，去除国码
        if (hasCodePrefix && isStandardLengthWithCode) {
          phoneNumber = cleaned.substring(codeLength);
        }
      } else {
        // 未指定国码，尝试自动识别并去除所有已知国码
        let removed = false;
        
        // 按国码长度从长到短检查（3位 -> 2位 -> 1位）
        for (let codeLen = 3; codeLen >= 1 && !removed; codeLen--) {
          const possibleCode = cleaned.substring(0, codeLen);
          
          if (STANDARD_PHONE_LENGTH_MAP[possibleCode]) {
            const standardLengths = STANDARD_PHONE_LENGTH_MAP[possibleCode];
            const standardLengthsWithCode = standardLengths.map(len => len + codeLen);
            
            if (standardLengthsWithCode.includes(cleaned.length)) {
              phoneNumber = cleaned.substring(codeLen);
              removed = true;
            }
          }
        }
      }
      
      // 检查是否匹配任一号段
      const isMatch = numberSegments.some(segment => phoneNumber.startsWith(segment));
      
      if (isMatch) {
        matchedLines.push(cleaned);  // 保存原始数据（含国码）
      } else {
        unmatchedCount++;
      }
    }
    
    await this.writeLines(outputPath, matchedLines);
    
    return {
      totalCount: lines.length,
      matchedCount: matchedLines.length,
      unmatchedCount: unmatchedCount,
      segments: numberSegments,
      countryCode: countryCode,
      limitReached: limit && matchedLines.length >= limit
    };
  }

  /**
   * 按条数提取数据
   */
  static async extractByCount(inputPath, outputPath, count, startFrom = 0) {
    const lines = await this.readLines(inputPath);
    const extractedLines = lines.slice(startFrom, startFrom + count);
    await this.writeLines(outputPath, extractedLines);
    
    return {
      totalCount: lines.length,
      extractedCount: extractedLines.length,
      startFrom: startFrom,
      endAt: startFrom + extractedLines.length
    };
  }

  /**
   * 获取文件行数
   */
  static async getLineCount(filePath) {
    const lines = await this.readLines(filePath);
    return lines.length;
  }

  /**
   * 获取文件大小
   */
  static async getFileSize(filePath) {
    const stats = await fs.stat(filePath);
    return stats.size;
  }

  /**
   * 验证是否为有效的手机号数据文件
   * 支持全球110个国家，只进行基础验证，允许包含各种格式的数据
   * @param {string} filePath - 文件路径
   * @param {string} countryCode - 指定国家（可选），用于更严格的验证
   * @returns {object} { valid, error, lineCount, countryCode }
   */
  static async validateDataFile(filePath, countryCode = null) {
    const lines = await this.readLines(filePath);
    if (lines.length === 0) {
      return { valid: false, error: '文件为空' };
    }
    
    // 检查前20行数据格式（采样更多数据）
    const sampleSize = Math.min(20, lines.length);
    const sampleLines = lines.slice(0, sampleSize);
    
    let validLines = 0;
    const invalidReasons = [];
    
    sampleLines.forEach((line, index) => {
      const cleaned = line.replace(/[^\d]/g, '');
      
      // 基础验证
      if (cleaned.length === 0 || !/^\d+$/.test(cleaned)) {
        invalidReasons.push({ line: index + 1, reason: '包含非数字字符' });
        return;
      }
      
      if (cleaned.length < 7 || cleaned.length > 19) {
        invalidReasons.push({ line: index + 1, reason: `长度不符(${cleaned.length}位)` });
        return;
      }
      
      // 如果指定了国家，验证是否符合该国家标准
      if (countryCode) {
        if (!isValidInternationalPhone(cleaned, countryCode)) {
          invalidReasons.push({ line: index + 1, reason: `不符合${countryCode}国家标准` });
          return;
        }
      }
      
      validLines++;
    });
    
    // 只要超过70%的数据符合格式就认为有效（更宽容）
    if (validLines < sampleSize * 0.7) {
      return { 
        valid: false, 
        error: `数据格式不正确。检测到 ${sampleSize} 条样本中只有 ${validLines} 条符合格式。应为纯数字手机号，每行一个，长度7-19位`,
        invalidReasons: invalidReasons.slice(0, 5)
      }; 
    }
    
    return { 
      valid: true, 
      lineCount: lines.length,
      countryCode: countryCode,
      validSampleRate: (validLines / sampleSize * 100).toFixed(2) + '%'
    };
  }

  /**
   * 检测数据的国码
   * 智能识别全球110个国家的国码
   * @param {string} filePath - 文件路径
   * @param {number} sampleSize - 采样数量
   * @returns {object} { detectedCodes, primaryCode, confidence, hasCode, totalLines, samples }
   */
  static async detectCountryCode(filePath, sampleSize = 100) {
    const lines = await this.readLines(filePath);
    const samples = lines.slice(0, sampleSize);
    
    // 统计国码出现频率
    const codeFrequency = {};
    let withCodeCount = 0;
    let totalValidLines = 0;
    
    samples.forEach(line => {
      const cleaned = line.replace(/[^\d]/g, '');
      if (cleaned.length < 7) return;  // 过短的数据跳过
      
      totalValidLines++;
      
      // 按国码长度从长到短检查（3位 -> 2位 -> 1位）
      let detected = false;
      for (let codeLen = 3; codeLen >= 1 && !detected; codeLen--) {
        const possibleCode = cleaned.substring(0, codeLen);
        
        // 检查是否在标准国码列表中
        if (STANDARD_PHONE_LENGTH_MAP[possibleCode]) {
          const standardLengths = STANDARD_PHONE_LENGTH_MAP[possibleCode];
          const standardLengthsWithCode = standardLengths.map(len => len + codeLen);
          
          // 如果总长度符合该国家标准（含国码）
          if (standardLengthsWithCode.includes(cleaned.length)) {
            const code = possibleCode;
            codeFrequency[code] = (codeFrequency[code] || 0) + 1;
            withCodeCount++;
            detected = true;
          }
        }
      }
    });
    
    // 如果大部分数据没有国码
    if (withCodeCount < totalValidLines * 0.3) {
      return {
        detectedCodes: [],
        primaryCode: null,
        confidence: 0,
        hasCode: false,
        totalLines: lines.length,
        validSamples: totalValidLines,
        samples: samples.slice(0, 20)
      };
    }
    
    // 找出最频繁的国码
    let primaryCode = null;
    let maxCount = 0;
    const detectedCodes = [];
    
    for (const [code, count] of Object.entries(codeFrequency)) {
      detectedCodes.push({ code, count, percentage: (count / totalValidLines * 100).toFixed(2) + '%' });
      if (count > maxCount) {
        primaryCode = code;
        maxCount = count;
      }
    }
    
    // 按频率排序
    detectedCodes.sort((a, b) => b.count - a.count);
    
    return {
      detectedCodes: detectedCodes,
      primaryCode: primaryCode,
      confidence: (maxCount / totalValidLines * 100).toFixed(2) + '%',
      hasCode: true,
      totalLines: lines.length,
      validSamples: totalValidLines,
      samples: samples.slice(0, 20)
    };
  }

  /**
   * 处理上传文件
   * 自动过滤不正常的手机号数据，支持全球110个国家
   * @param {string} inputPath - 输入文件路径
   * @param {string} outputPath - 输出文件路径
   * @param {object} options - 选项 { filterInvalid, countryCode }
   * @returns {object} { originalCount, validCount, invalidCount, preview, invalidReasons }
   */
  static async processUpload(inputPath, outputPath, options = {}) {
    const { 
      filterInvalid = true,  // 是否过滤异常数据
      countryCode = null     // 指定国家（可选），用于更精确的验证
    } = options;
    
    let lines = await this.readLines(inputPath);
    const originalCount = lines.length;
    let invalidCount = 0;
    const invalidReasons = {
      nonDigit: 0,        // 包含非数字字符
      tooShort: 0,        // 长度过短
      tooLong: 0,         // 长度过长
      repeating: 0,       // 超过8位连续相同数字
      invalidFormat: 0    // 不符合国家标准格式
    };
    
    // 过滤异常数据，只保留正常的国际手机号码
    if (filterInvalid) {
      const beforeCount = lines.length;
      
      // 过滤规则：保留正常的国际手机号码
      lines = lines.filter(line => {
        // 去除所有非数字字符
        const cleaned = line.replace(/[^\d]/g, '');
        
        // 检查1: 必须全是数字
        if (cleaned.length === 0 || !/^\d+$/.test(cleaned)) {
          invalidReasons.nonDigit++;
          return false;
        }

        // 检查2: 长度在7-19位之间（支持带国码的国际手机号）
        if (cleaned.length < 7) {
          invalidReasons.tooShort++;
          return false;
        }
        if (cleaned.length > 19) {
          invalidReasons.tooLong++;
          return false;
        }

        // 检查3: 不能有超过8位连续相同的数字
        if (/(\d)\1{7,}/.test(cleaned)) {
          invalidReasons.repeating++;
          return false;
        }

        // 检查4: 如果指定了国家，验证是否符合该国家标准格式
        if (countryCode) {
          if (!isValidInternationalPhone(cleaned, countryCode)) {
            invalidReasons.invalidFormat++;
            return false;
          }
        }

        return true;
      });
      
      invalidCount = beforeCount - lines.length;
    }
    
    // 保存过滤后的数据
    await this.writeLines(outputPath, lines);
    
    return {
      originalCount: originalCount,
      validCount: lines.length,
      invalidCount: invalidCount,
      invalidReasons: invalidReasons,
      preview: lines.slice(0, 20)
    };
  }

  /**
   * 一键清洗数据
   * 按照正常国际手机号码格式处理
   */
  static async cleanData(inputPath, outputPath, options = {}) {
    const { 
      countryCode = null,
      autoAddCode = true,
      autoDeduplicate = true,
      removeInvalid = true
    } = options;
    
    let lines = await this.readLines(inputPath);
    const originalCount = lines.length;
    
    let stats = {
      originalCount: originalCount,
      invalidCount: 0,
      duplicateCount: 0,
      addedCodeCount: 0,
      skippedCount: 0,
      finalCount: 0,
      steps: [],
      // 新增：详细预览数据
      invalidDataPreview: [],      // 异常数据预览
      duplicateDataPreview: [],    // 重复数据预览
      addedCodePreview: [],        // 添加国码的数据预览
      removedCodePreview: []       // 去除国码的数据预览（如果有）
    };
    
    // 定义各国标准手机号长度（不含国码）
    // 数据来源：ITU国际电信联盟标准 + 各国实际使用情况
    const standardPhoneLengthMap = {
      // 亚洲
      '86': [11],          // 中国
      '91': [10],          // 印度
      '880': [10],         // 孟加拉国
      '92': [10],          // 巴基斯坦
      '62': [9, 10, 11],   // 印度尼西亚
      '81': [10],          // 日本
      '63': [10],          // 菲律宾
      '84': [9, 10],       // 越南
      '66': [9],           // 泰国
      '60': [9, 10],       // 马来西亚
      '65': [8],           // 新加坡
      '82': [9, 10],       // 韩国
      '95': [9, 10],       // 缅甸
      '94': [9],           // 斯里兰卡
      '977': [10],         // 尼泊尔
      '855': [8, 9],       // 柬埔寨
      '856': [10],         // 老挝
      '93': [9],           // 阿富汗
      '98': [10],          // 伊朗
      '964': [10],         // 伊拉克
      '966': [9],          // 沙特阿拉伯
      '971': [9],          // 阿联酋
      '90': [10],          // 土耳其
      '972': [9],          // 以色列
      '7': [10],           // 俄罗斯/哈萨克斯坦
      '998': [9],          // 乌兹别克斯坦
      
      // 欧洲
      '49': [10, 11],      // 德国
      '44': [10],          // 英国
      '33': [9],           // 法国
      '39': [9, 10],       // 意大利
      '34': [9],           // 西班牙
      '48': [9],           // 波兰
      '380': [9],          // 乌克兰
      '40': [9],           // 罗马尼亚
      '31': [9],           // 荷兰
      '32': [9],           // 比利时
      '30': [10],          // 希腊
      '351': [9],          // 葡萄牙
      '420': [9],          // 捷克
      '36': [9],           // 匈牙利
      '46': [9],           // 瑞典
      '47': [8],           // 挪威
      '45': [8],           // 丹麦
      '358': [9, 10],      // 芬兰
      '41': [9],           // 瑞士
      '43': [10, 11],      // 奥地利
      
      // 北美洲
      '1': [10],           // 美国/加拿大/多米尼加
      '52': [10],          // 墨西哥
      '502': [8],          // 危地马拉
      '53': [8],           // 古巴
      '509': [8],          // 海地
      '504': [8],          // 洪都拉斯
      '505': [8],          // 尼加拉瓜
      '506': [8],          // 哥斯达黎加
      '507': [8],          // 巴拿马
      
      // 南美洲
      '55': [10, 11],      // 巴西
      '57': [10],          // 哥伦比亚
      '54': [10],          // 阿根廷
      '51': [9],           // 秘鲁
      '58': [10],          // 委内瑞拉
      '56': [9],           // 智利
      '593': [9],          // 厄瓜多尔
      '591': [8],          // 玻利维亚
      '595': [9],          // 巴拉圭
      '598': [8],          // 乌拉圭
      '592': [7],          // 圭亚那
      '597': [7],          // 苏里南
      
      // 非洲
      '234': [10],         // 尼日利亚
      '251': [9],          // 埃塞俄比亚
      '20': [10],          // 埃及
      '27': [9],           // 南非
      '254': [9],          // 肯尼亚
      '256': [9],          // 乌干达
      '213': [9],          // 阿尔及利亚
      '249': [9],          // 苏丹
      '212': [9],          // 摩洛哥
      '244': [9],          // 安哥拉
      '233': [9],          // 加纳
      '258': [9],          // 莫桑比克
      '261': [9],          // 马达加斯加
      '237': [9],          // 喀麦隆
      '225': [10],         // 科特迪瓦
      '227': [8],          // 尼日尔
      '226': [8],          // 布基纳法索
      '223': [8],          // 马里
      '265': [9],          // 马拉维
      '260': [9],          // 赞比亚
      '263': [9],          // 津巴布韦
      
      // 大洋洲
      '61': [9],           // 澳大利亚
      '675': [8],          // 巴布亚新几内亚
      '64': [9, 10],       // 新西兰
      '679': [7],          // 斐济
      '677': [7],          // 所罗门群岛
      '687': [6],          // 新喀里多尼亚
      '689': [8],          // 法属波利尼西亚
      '678': [7],          // 瓦努阿图
      '685': [7],          // 萨摩亚
      '686': [8]           // 基里巴斯
    };
    
    // 步骤1: 去除异常数据
    if (removeInvalid) {
      const beforeCount = lines.length;
      const invalidData = [];  // 记录异常数据
      
      lines = lines.map(line => line.replace(/[^\d]/g, ''));
      lines = lines.filter(line => {
        let isValid = true;
        let reason = '';
        
        if (line.length < 7 || line.length > 19) {
          isValid = false;
          reason = line.length < 7 ? '长度过短' : '长度过长';
        } else if (/(\d)\1{7,}/.test(line)) {
          isValid = false;
          reason = '超过8位连续相同数字';
        }
        
        // 记录异常数据（前20条）
        if (!isValid && invalidData.length < 20) {
          invalidData.push({
            data: line,
            length: line.length,
            reason: reason
          });
        }
        
        return isValid;
      });
      
      const removedCount = beforeCount - lines.length;
      stats.invalidCount = removedCount;
      stats.invalidDataPreview = invalidData;
      stats.steps.push({
        step: '去除异常数据',
        removed: removedCount,
        remaining: lines.length,
        description: '去除7-19位范围外的数据和超过8位连续相同数字的数据'
      });
    } else {
      lines = lines.map(line => line.replace(/[^\d]/g, ''));
    }
    
    // 步骤2: 自动去重
    if (autoDeduplicate) {
      const beforeCount = lines.length;
      const duplicateData = [];  // 记录重复数据
      const dataCount = {};  // 统计每个数据出现的次数
      
      // 第一遍：统计每个数据出现的次数
      lines.forEach(line => {
        dataCount[line] = (dataCount[line] || 0) + 1;
      });
      
      // 第二遍：收集重复数据（出现次数>1的）
      const collected = new Set();  // 避免重复收集同一个数据
      lines.forEach(line => {
        if (dataCount[line] > 1 && !collected.has(line) && duplicateData.length < 20) {
          duplicateData.push({
            data: line
          });
          collected.add(line);
        }
      });
      
      // 去重
      lines = [...new Set(lines)];
      const removedCount = beforeCount - lines.length;
      stats.duplicateCount = removedCount;
      stats.duplicateDataPreview = duplicateData;
      stats.steps.push({
        step: '数据去重',
        removed: removedCount,
        remaining: lines.length
      });
    }
    
    // 步骤3: 智能校验国码
    if (autoAddCode && countryCode) {
      let modifiedCount = 0;  // 已修正的数量（添加了国码）
      let abnormalCount = 0;  // 国码异常总数（包括已修正+保留原样）
      let skippedCount = 0;   // 正常数据数量（已有正确国码+其他国家数据）
      const codeLength = countryCode.length;
      const standardPhoneLengths = standardPhoneLengthMap[countryCode] || [9, 10, 11];
      const standardLengthsWithCode = standardPhoneLengths.map(len => len + codeLength);

      // 调试日志：记录处理细节
      const debugLogs = [];
      const codeAbnormalData = [];  // 记录国码异常数据（需要修正的数据，前20条）

      lines = lines.map((line, index) => {
        const prefix = line.substring(0, codeLength);
        const hasCodePrefix = prefix === countryCode;
        const isStandardLengthWithCode = standardLengthsWithCode.includes(line.length);
        const isStandardLengthWithoutCode = standardPhoneLengths.includes(line.length);

        let result;
        let reason;
        let isAbnormal = false;  // 标记是否为国码异常数据

        if (hasCodePrefix && isStandardLengthWithCode) {
          // 情况1：已有国码且总长度符合标准 → 跳过（正常数据）
          skippedCount++;
          result = line;
          reason = '已有国码且长度符合标准';
        } else if (!hasCodePrefix && isStandardLengthWithoutCode) {
          // 情况2：没有国码且总长度符合标准 → 添加国码（国码异常：缺少国码）
          modifiedCount++;
          abnormalCount++;
          result = countryCode + line;
          reason = '缺少国码';
          isAbnormal = true;
        } else if (hasCodePrefix) {
          // 情况3：已有国码前缀但长度不标准 → 保留原样（国码异常：长度异常）
          abnormalCount++;  // 只统计异常数，不统计修正数
          result = line;
          reason = '已有国码但长度异常';
          isAbnormal = true;
        } else {
          // 情况4：其他情况 → 先检查是否为其他110个国家的有效数据
          let isOtherCountryData = false;
          
          // 按国码长度从长到短检查（3位 → 2位 → 1位）
          for (let otherCodeLen = 3; otherCodeLen >= 1 && !isOtherCountryData; otherCodeLen--) {
            const possibleCode = line.substring(0, otherCodeLen);
            
            // 检查是否在标准国码列表中（排除当前国码）
            if (possibleCode !== countryCode && STANDARD_PHONE_LENGTH_MAP[possibleCode]) {
              const otherStandardLengths = STANDARD_PHONE_LENGTH_MAP[possibleCode];
              const otherStandardLengthsWithCode = otherStandardLengths.map(len => len + otherCodeLen);
              
              // 如果符合其他国家的标准，则保持原样，不添加国码（正常数据）
              if (otherStandardLengthsWithCode.includes(line.length)) {
                skippedCount++;
                result = line;
                reason = `识别为其他国家(${possibleCode})的有效数据`;
                isOtherCountryData = true;
              }
            }
          }
          
          // 如果不是其他国家数据，则尝试添加国码（国码异常：缺少国码）
          if (!isOtherCountryData) {
            modifiedCount++;
            abnormalCount++;
            result = countryCode + line;
            reason = '缺少国码';
            isAbnormal = true;
          }
        }

        // 记录国码异常数据（前20条）- 包括缺少国码和国码长度异常的数据
        if (isAbnormal && codeAbnormalData.length < 20) {
          codeAbnormalData.push({
            original: line,
            result: result,
            reason: reason,
            status: line === result ? '保留原样' : '已修正'
          });
        }

        // 记录前20条的详细日志
        if (index < 20) {
          debugLogs.push({
            index: index + 1,
            original: line,
            result: result,
            prefix: prefix,
            length: line.length,
            hasPrefix: hasCodePrefix,
            isStdWithCode: isStandardLengthWithCode,
            isStdWithoutCode: isStandardLengthWithoutCode,
            reason: reason
          });
        }

        return result;
      });

      stats.addedCodeCount = abnormalCount;  // 国码异常总数（Z的数量）
      stats.skippedCount = skippedCount;     // 正常数据数量
      stats.debugLogs = debugLogs;           // 添加调试日志到返回结果
      stats.addedCodePreview = codeAbnormalData;  // 国码异常数据预览（包括缺少国码和长度异常）

      if (modifiedCount > 0 && skippedCount > 0) {
        stats.steps.push({
          step: '智能校验国码',
          added: modifiedCount,      // 已修正的数量
          abnormal: abnormalCount,   // 国码异常总数
          skipped: skippedCount,     // 正常数据数量
          countryCode: countryCode,
          description: `检查前${codeLength}位是否为${countryCode}，且长度符合标准`
        });
      } else if (modifiedCount > 0) {
        stats.steps.push({ 
          step: '添加国码', 
          added: modifiedCount, 
          abnormal: abnormalCount,
          countryCode: countryCode 
        });
      } else if (skippedCount > 0) {
        stats.steps.push({ 
          step: '国码已存在', 
          skipped: skippedCount, 
          countryCode: countryCode 
        });
      }
    }
    
    stats.finalCount = lines.length;
    await this.writeLines(outputPath, lines);
    return { ...stats, preview: lines.slice(0, 20) };
  }
  
  /**
   * 检测数据中的异常数据
   */
  static async detectInvalidData(filePath, sampleSize = 100) {
    const lines = await this.readLines(filePath);
    const samples = lines.slice(0, sampleSize);
    
    const invalidLines = [];
    samples.forEach((line, index) => {
      const numberOnly = line.replace(/^\+?(\d{1,4})?/, '');
      if (!/^\d{7,}$/.test(numberOnly)) {
        invalidLines.push({
          line: index + 1,
          data: line,
          reason: numberOnly.length < 7 ? '位数少于7位' : '包含非数字字符'
        });
      }
    });
    
    return {
      totalSamples: samples.length,
      invalidCount: invalidLines.length,
      invalidLines: invalidLines.slice(0, 10),
      hasInvalid: invalidLines.length > 0
    };
  }
}

module.exports = DataProcessor;
