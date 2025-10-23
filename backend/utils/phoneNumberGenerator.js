/**
 * 电话号码生成工具
 * 基于 awesome-phonenumber (Google libphonenumber) 库
 * 支持全球所有国家按运营商生成号码
 * 优化版：支持流式处理大数据，减少内存消耗
 */

const { parsePhoneNumber, getExample, getCountryCodeForRegionCode } = require('awesome-phonenumber');
const logger = require('./logger');
const fs = require('fs');
const { Writable } = require('stream');

/**
 * 生成指定国家运营商的随机号码（优化版 - 流式处理）
 * @param {string} regionCode - 国家/地区代码（如 'US', 'CN', 'MX'）
 * @param {Array<string>} numberSegments - 号段列表（运营商号段前缀）
 * @param {number} count - 生成数量
 * @param {string} outputPath - 输出文件路径（用于流式写入）
 * @param {object} options - 选项 { includeCountryCode: true, format: 'e164', batchSize: 1000 }
 * @param {function} progressCallback - 进度回调函数 (current, total)
 * @returns {Promise<object>} 生成结果 { count, attempts, preview }
 */
async function generatePhoneNumbersStream(regionCode, numberSegments, count, outputPath, options = {}, progressCallback = null) {
  const {
    includeCountryCode = true,
    format = 'e164',
    batchSize = 1000  // 每批次处理数量
  } = options;

  try {
    // 获取该国家的国码
    const countryCode = getCountryCodeForRegionCode(regionCode);
    if (!countryCode) {
      throw new Error(`无法获取国家 ${regionCode} 的国码`);
    }

    // 获取该国家的示例号码，用于确定号码长度
    const exampleNumber = getExample(regionCode, 'mobile');
    if (!exampleNumber || !exampleNumber.valid) {
      throw new Error(`无法获取国家 ${regionCode} 的示例号码`);
    }

    const nationalNumber = exampleNumber.number.significant;
    const phoneLength = nationalNumber.length;

    logger.info(
      `流式生成号码: 国家=${regionCode}, 国码=${countryCode}, ` +
      `号码长度=${phoneLength}, 号段数=${numberSegments.length}, ` +
      `数量=${count}, 批次大小=${batchSize}`
    );

    // 创建文件写入流
    const writeStream = fs.createWriteStream(outputPath, { encoding: 'utf8' });
    
    let generated = 0;
    let attempts = 0;
    const maxAttempts = count * 10;
    const generatedSet = new Set(); // 用于去重
    const preview = []; // 保存前20条预览
    let batchBuffer = [];

    // 批量写入函数
    const flushBatch = () => {
      if (batchBuffer.length > 0) {
        writeStream.write(batchBuffer.join('\n') + '\n');
        batchBuffer = [];
      }
    };

    while (generated < count && attempts < maxAttempts) {
      attempts++;

      // 随机选择一个号段
      const segment = numberSegments[Math.floor(Math.random() * numberSegments.length)];
      const remainingLength = phoneLength - segment.length;
      
      if (remainingLength <= 0) {
        throw new Error(`号段 ${segment} 长度 (${segment.length}) 超过或等于号码总长度 (${phoneLength})`);
      }

      // 生成剩余的随机数字
      let randomPart = '';
      for (let i = 0; i < remainingLength; i++) {
        randomPart += Math.floor(Math.random() * 10);
      }

      const localNumber = segment + randomPart;
      const fullNumber = '+' + countryCode + localNumber;

      // 使用 libphonenumber 验证号码
      const pn = parsePhoneNumber(fullNumber, { regionCode });

      if (pn.valid && pn.typeIsMobile) {
        let formattedNumber;
        switch (format) {
          case 'e164':
            formattedNumber = pn.number.e164.replace('+', '');
            break;
          case 'national':
            formattedNumber = includeCountryCode 
              ? countryCode + pn.number.significant 
              : pn.number.significant;
            break;
          case 'international':
            formattedNumber = pn.number.international.replace(/\s+/g, '').replace('+', '');
            break;
          default:
            formattedNumber = pn.number.e164.replace('+', '');
        }

        if (!includeCountryCode && formattedNumber.startsWith(countryCode.toString())) {
          formattedNumber = formattedNumber.substring(countryCode.toString().length);
        }

        // 去重检查
        if (!generatedSet.has(formattedNumber)) {
          generatedSet.add(formattedNumber);
          batchBuffer.push(formattedNumber);
          generated++;

          // 保存前20条预览
          if (preview.length < 20) {
            preview.push(formattedNumber);
          }

          // 批量写入
          if (batchBuffer.length >= batchSize) {
            flushBatch();
          }

          // 进度回调
          if (progressCallback && generated % 1000 === 0) {
            progressCallback(generated, count);
          }
        }
      }
    }

    // 写入剩余数据
    flushBatch();

    // 关闭流
    await new Promise((resolve, reject) => {
      writeStream.end(() => resolve());
      writeStream.on('error', reject);
    });

    if (generated < count) {
      logger.warn(`号码生成不足: 目标=${count}, 实际=${generated}, 尝试=${attempts}`);
    }

    logger.info(`流式生成成功: 生成${generated}条，尝试${attempts}次`);

    return {
      count: generated,
      requestedCount: count,
      attempts,
      preview
    };
  } catch (error) {
    logger.error('流式生成号码失败:', error);
    throw error;
  }
}

/**
 * 批量生成多个运营商的号码（优化版 - 流式处理）
 * @param {string} regionCode - 国家/地区代码
 * @param {Array<object>} operators - 运营商配置数组 [{name, numberSegments, count}]
 * @param {string} outputDir - 输出目录
 * @param {object} options - 全局选项
 * @param {function} progressCallback - 进度回调 (operatorName, current, total)
 * @returns {Promise<object>} 生成结果
 */
async function generateMultipleOperatorsStream(regionCode, operators, outputDir, options = {}, progressCallback = null) {
  try {
    const results = {
      regionCode,
      total: 0,
      operators: []
    };

    for (const operator of operators) {
      const { name, numberSegments, count } = operator;

      logger.info(`开始流式生成 ${name} 运营商号码, 数量=${count}`);

      const timestamp = Date.now();
      const outputFilename = `operator_${name}_${timestamp}.txt`;
      const outputPath = require('path').join(outputDir, outputFilename);

      const opProgressCallback = progressCallback ? 
        (current, total) => progressCallback(name, current, total) : null;

      const result = await generatePhoneNumbersStream(
        regionCode, 
        numberSegments, 
        count, 
        outputPath,
        options,
        opProgressCallback
      );

      results.operators.push({
        name,
        count: result.count,
        segments: numberSegments,
        outputPath,
        preview: result.preview
      });

      results.total += result.count;
    }

    logger.info(`流式批量生成完成: 运营商数=${operators.length}, 总号码数=${results.total}`);

    return results;
  } catch (error) {
    logger.error('流式批量生成失败:', error);
    throw error;
  }
}

/**
 * 获取国家支持的号段长度范围
 * @param {string} regionCode - 国家/地区代码
 * @returns {object} { minLength, maxLength, exampleNumber }
 */
function getCountryNumberFormat(regionCode) {
  try {
    const exampleNumber = getExample(regionCode, 'mobile');
    
    if (!exampleNumber || !exampleNumber.valid) {
      return {
        error: `无法获取国家 ${regionCode} 的号码格式信息`
      };
    }

    const nationalNumber = exampleNumber.number.significant;
    const countryCode = exampleNumber.countryCode;

    return {
      regionCode,
      countryCode,
      exampleNumber: exampleNumber.number.e164,
      nationalNumber,
      phoneLength: nationalNumber.length,
      minLength: nationalNumber.length - 1,
      maxLength: nationalNumber.length + 1
    };
  } catch (error) {
    logger.error('获取国家号码格式失败:', error);
    return {
      error: error.message
    };
  }
}

/**
 * 验证号段是否有效
 * @param {string} regionCode - 国家/地区代码
 * @param {Array<string>} numberSegments - 号段列表
 * @returns {object} 验证结果
 */
function validateNumberSegments(regionCode, numberSegments) {
  try {
    const formatInfo = getCountryNumberFormat(regionCode);
    
    if (formatInfo.error) {
      return {
        valid: false,
        error: formatInfo.error
      };
    }

    const invalidSegments = [];
    const validSegments = [];

    for (const segment of numberSegments) {
      // 号段长度不能超过号码总长度
      if (segment.length >= formatInfo.phoneLength) {
        invalidSegments.push({
          segment,
          reason: `号段长度 ${segment.length} 超过号码总长度 ${formatInfo.phoneLength}`
        });
      } else if (!/^\d+$/.test(segment)) {
        invalidSegments.push({
          segment,
          reason: '号段必须全为数字'
        });
      } else {
        validSegments.push(segment);
      }
    }

    return {
      valid: invalidSegments.length === 0,
      validSegments,
      invalidSegments,
      totalSegments: numberSegments.length,
      formatInfo
    };
  } catch (error) {
    logger.error('验证号段失败:', error);
    return {
      valid: false,
      error: error.message
    };
  }
}

module.exports = {
  generatePhoneNumbersStream,
  generateMultipleOperatorsStream,
  getCountryNumberFormat,
  validateNumberSegments
};
