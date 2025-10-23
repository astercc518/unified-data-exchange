/**
 * 通用HTTP/HTTPS短信发送服务
 * 支持自定义HTTP请求模板和响应解析
 */
const axios = require('axios');
const logger = require('../utils/logger');

class GenericHttpService {
  /**
   * 发送短信
   * @param {Object} config - 通道配置
   * @param {Array} phoneNumbers - 手机号列表
   * @param {String} content - 短信内容
   * @returns {Promise}
   */
  static async send(config, phoneNumbers, content) {
    const {
      gateway_url,
      http_method = 'POST',
      http_headers,
      request_template,
      response_success_pattern,
      account,
      password
    } = config;

    try {
      const results = [];

      for (const phone of phoneNumbers) {
        try {
          const result = await this.sendSingle(
            gateway_url,
            http_method,
            http_headers,
            request_template,
            response_success_pattern,
            phone,
            content,
            account,
            password
          );
          results.push({
            mobile: phone,
            result: result.success ? 0 : 1,
            mid: result.message_id || null,
            error: result.error || null
          });
        } catch (error) {
          results.push({
            mobile: phone,
            result: 1,
            mid: null,
            error: error.message
          });
        }
      }

      const successCount = results.filter(r => r.result === 0).length;

      return {
        success: successCount > 0,
        status: successCount === phoneNumbers.length ? 0 : 1,
        message: `发送完成: 成功${successCount}/${phoneNumbers.length}`,
        list: results
      };

    } catch (error) {
      logger.error('HTTP发送失败:', error);
      return {
        success: false,
        status: -1,
        message: `HTTP请求失败: ${error.message}`,
        list: phoneNumbers.map(phone => ({
          mobile: phone,
          result: 1,
          mid: null,
          error: error.message
        }))
      };
    }
  }

  /**
   * 发送单条短信
   * @param {String} gatewayUrl - 网关地址
   * @param {String} method - HTTP方法
   * @param {String} headersJson - 请求头JSON
   * @param {String} templateJson - 请求模板JSON
   * @param {String} successPattern - 成功匹配模式
   * @param {String} phone - 手机号
   * @param {String} content - 短信内容
   * @param {String} account - 账号
   * @param {String} password - 密码
   * @returns {Promise}
   */
  static async sendSingle(
    gatewayUrl,
    method,
    headersJson,
    templateJson,
    successPattern,
    phone,
    content,
    account,
    password
  ) {
    // 替换URL中的变量
    let url = this.replaceVariables(gatewayUrl, phone, content, account, password);

    // 解析请求头
    let headers = {};
    if (headersJson) {
      try {
        headers = JSON.parse(headersJson);
      } catch (e) {
        logger.warn('请求头解析失败，使用默认值');
      }
    }

    // 解析请求体模板
    let requestData = null;
    if (templateJson && (method === 'POST' || method === 'PUT')) {
      try {
        const template = JSON.parse(templateJson);
        requestData = this.replaceTemplateVariables(template, phone, content, account, password);
      } catch (e) {
        logger.warn('请求模板解析失败');
      }
    }

    // 发送请求
    const axiosConfig = {
      method: method.toLowerCase(),
      url,
      headers,
      timeout: 30000
    };

    if (requestData) {
      if (method === 'GET') {
        axiosConfig.params = requestData;
      } else {
        axiosConfig.data = requestData;
      }
    }

    logger.info('HTTP请求配置:', axiosConfig);

    try {
      const response = await axios(axiosConfig);
      logger.info('HTTP响应:', response.data);

      // 检查响应是否成功
      const isSuccess = this.checkSuccess(response.data, successPattern);

      return {
        success: isSuccess,
        message_id: this.extractMessageId(response.data),
        error: isSuccess ? null : '响应不匹配成功模式'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 替换字符串中的变量
   * @param {String} str - 原字符串
   * @param {String} phone - 手机号
   * @param {String} content - 短信内容
   * @param {String} account - 账号
   * @param {String} password - 密码
   * @returns {String}
   */
  static replaceVariables(str, phone, content, account, password) {
    if (!str) return str;
    
    return str
      .replace(/{phone}/g, phone)
      .replace(/{content}/g, encodeURIComponent(content))
      .replace(/{account}/g, account)
      .replace(/{password}/g, password);
  }

  /**
   * 替换模板对象中的变量
   * @param {Object} template - 模板对象
   * @param {String} phone - 手机号
   * @param {String} content - 短信内容
   * @param {String} account - 账号
   * @param {String} password - 密码
   * @returns {Object}
   */
  static replaceTemplateVariables(template, phone, content, account, password) {
    const result = {};
    
    for (const key in template) {
      const value = template[key];
      if (typeof value === 'string') {
        // JSON模板中不需要URL编码，直接替换原始值
        result[key] = value
          .replace(/{phone}/g, phone)
          .replace(/{content}/g, content)  // 不进行URL编码
          .replace(/{account}/g, account)
          .replace(/{password}/g, password);
      } else if (typeof value === 'object' && value !== null) {
        result[key] = this.replaceTemplateVariables(value, phone, content, account, password);
      } else {
        result[key] = value;
      }
    }
    
    return result;
  }

  /**
   * 检查响应是否成功
   * @param {Object} response - 响应数据
   * @param {String} pattern - 成功模式
   * @returns {Boolean}
   */
  static checkSuccess(response, pattern) {
    if (!pattern) {
      // 没有模式，默认HTTP状态200即为成功
      return true;
    }

    // 支持JSON路径表达式，如: status.code=0 或 success=true
    const parts = pattern.split('=');
    if (parts.length === 2) {
      const path = parts[0].trim();
      const expectedValue = parts[1].trim();
      
      const actualValue = this.getValueByPath(response, path);
      
      // 类型转换比较
      return String(actualValue) === expectedValue;
    }

    return false;
  }

  /**
   * 根据路径获取对象值
   * @param {Object} obj - 对象
   * @param {String} path - 路径，如 status.code
   * @returns {*}
   */
  static getValueByPath(obj, path) {
    const parts = path.split('.');
    let current = obj;
    
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }
    
    return current;
  }

  /**
   * 从响应中提取消息ID
   * @param {Object} response - 响应数据
   * @returns {String}
   */
  static extractMessageId(response) {
    // 尝试常见的消息ID字段
    const possibleFields = ['message_id', 'messageId', 'msgId', 'id', 'mid', 'smsId'];
    
    for (const field of possibleFields) {
      const value = this.getValueByPath(response, field);
      if (value) {
        return String(value);
      }
    }
    
    return null;
  }
}

module.exports = GenericHttpService;
