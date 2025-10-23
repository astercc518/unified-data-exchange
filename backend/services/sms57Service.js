/**
 * SMS57短信发送服务
 * 文档：SMS57群发短信接口
 */
const axios = require('axios');
const crypto = require('crypto');
const logger = require('../utils/logger');

class SMS57Service {
  /**
   * 发送短信
   * @param {Object} config - 通道配置
   * @param {string} config.gateway_url - 网关地址
   * @param {string} config.account - 账号
   * @param {string} config.password - 密码
   * @param {string} config.extno - 接入码
   * @param {Array} phoneNumbers - 手机号码数组
   * @param {string} content - 短信内容
   * @param {string} atTime - 定时发送时间（可选）格式：2022-12-05 18:00:00
   * @param {string} label - 标签（可选）
   * @returns {Promise<Object>} 发送结果
   */
  static async send(config, phoneNumbers, content, atTime = null, label = null) {
    try {
      // 验证参数
      if (!config.gateway_url || !config.account || !config.password) {
        throw new Error('通道配置不完整');
      }

      if (!phoneNumbers || phoneNumbers.length === 0) {
        throw new Error('手机号码不能为空');
      }

      if (!content) {
        throw new Error('短信内容不能为空');
      }

      // 接入码（从配置中获取，如果没有使用默认值）
      const extno = config.extno || '10690';

      // 将号码数组转换为逗号分隔的字符串
      const mobile = phoneNumbers.join(',');

      // 构建请求参数
      const requestData = {
        action: 'send',
        account: config.account,
        password: config.password, // 非加密模式
        mobile: mobile,
        content: content,
        extno: extno
      };

      // 添加可选参数
      if (atTime) {
        requestData.atTime = atTime;
      }

      if (label) {
        requestData.label = label;
      }

      logger.info('SMS57发送请求:', {
        account: config.account,
        mobile_count: phoneNumbers.length,
        content_length: content.length,
        atTime: atTime
      });

      // 发送HTTP请求
      const response = await axios.post(config.gateway_url, requestData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30秒超时
      });

      logger.info('SMS57响应:', response.data);

      // 解析响应
      const result = response.data;

      if (result.status === 0) {
        // 发送成功
        return {
          success: true,
          status: result.status,
          balance: result.balance, // 余额（单位：厘）
          list: result.list, // 每个号码的发送结果
          message: '短信发送成功'
        };
      } else {
        // 发送失败
        return {
          success: false,
          status: result.status,
          message: this.getStatusMessage(result.status),
          rawResponse: result
        };
      }
    } catch (error) {
      logger.error('SMS57发送失败:', error);
      
      if (error.response) {
        // HTTP错误
        return {
          success: false,
          message: `HTTP错误: ${error.response.status}`,
          error: error.response.data
        };
      } else if (error.request) {
        // 网络错误
        return {
          success: false,
          message: '网络连接失败',
          error: error.message
        };
      } else {
        // 其他错误
        return {
          success: false,
          message: error.message,
          error: error.toString()
        };
      }
    }
  }

  /**
   * 使用MD5加密密码发送短信（加密模式）
   * password = MD5(password + extno + mobile + content)
   */
  static async sendWithEncryption(config, phoneNumbers, content, atTime = null, label = null) {
    try {
      const extno = config.extno || '10690';
      const mobile = phoneNumbers.join(',');

      // MD5加密：password + extno + mobile + content
      const rawPassword = config.password + extno + mobile + content;
      const encryptedPassword = crypto.createHash('md5')
        .update(rawPassword)
        .digest('hex')
        .toUpperCase();

      const requestData = {
        action: 'send',
        account: config.account,
        password: encryptedPassword,
        mobile: mobile,
        content: content,
        extno: extno
      };

      if (atTime) {
        requestData.atTime = atTime;
      }

      if (label) {
        requestData.label = label;
      }

      logger.info('SMS57加密发送请求:', {
        account: config.account,
        mobile_count: phoneNumbers.length,
        encrypted: true
      });

      const response = await axios.post(config.gateway_url, requestData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      const result = response.data;

      if (result.status === 0) {
        return {
          success: true,
          status: result.status,
          balance: result.balance,
          list: result.list,
          message: '短信发送成功'
        };
      } else {
        return {
          success: false,
          status: result.status,
          message: this.getStatusMessage(result.status),
          rawResponse: result
        };
      }
    } catch (error) {
      logger.error('SMS57加密发送失败:', error);
      return {
        success: false,
        message: error.message,
        error: error.toString()
      };
    }
  }

  /**
   * 获取状态码对应的错误信息
   */
  static getStatusMessage(status) {
    const messages = {
      0: '成功',
      1: '参数错误',
      2: '账号或密码错误',
      3: '余额不足',
      4: '内容含有敏感词',
      5: '接口访问受限',
      6: '号码格式错误',
      7: '内容为空',
      8: '号码为空',
      9: '系统错误',
      10: '账号被禁用'
    };

    return messages[status] || `未知错误(${status})`;
  }

  /**
   * 获取单个号码发送结果的错误信息
   */
  static getResultMessage(result) {
    const messages = {
      0: '提交成功',
      1: '号码格式错误',
      2: '号码在黑名单',
      3: '号码重复',
      4: '其他错误'
    };

    return messages[result] || `未知错误(${result})`;
  }
}

module.exports = SMS57Service;
