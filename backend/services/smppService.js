/**
 * SMPP协议短信发送服务
 * 支持标准SMPP 3.4协议
 */
const smpp = require('smpp');
const logger = require('../utils/logger');

class SMPPService {
  /**
   * 创建SMPP会话
   * @param {Object} config - SMPP配置
   * @returns {Promise} session
   */
  static async createSession(config) {
    const {
      smpp_host,
      smpp_port = 2775,
      smpp_system_id,
      password,
      smpp_system_type = 'CMT'
    } = config;

    return new Promise((resolve, reject) => {
      const session = smpp.connect({
        url: `smpp://${smpp_host}:${smpp_port}`,
        auto_enquire_link_period: 10000,
        debug: process.env.NODE_ENV === 'development'
      });

      session.bind_transceiver({
        system_id: smpp_system_id,
        password: password,
        system_type: smpp_system_type,
        interface_version: 1,
        addr_ton: 0,
        addr_npi: 0,
        address_range: ''
      }, (pdu) => {
        if (pdu.command_status === 0) {
          logger.info('SMPP连接成功', { system_id: smpp_system_id });
          resolve(session);
        } else {
          logger.error('SMPP绑定失败', { command_status: pdu.command_status });
          reject(new Error(`SMPP bind failed: ${pdu.command_status}`));
        }
      });

      session.on('error', (error) => {
        logger.error('SMPP会话错误:', error);
        reject(error);
      });
    });
  }

  /**
   * 发送短信
   * @param {Object} config - 通道配置
   * @param {Array} phoneNumbers - 手机号列表
   * @param {String} content - 短信内容
   * @returns {Promise}
   */
  static async send(config, phoneNumbers, content) {
    let session = null;
    
    try {
      session = await this.createSession(config);
      
      const results = [];
      
      for (const phone of phoneNumbers) {
        try {
          const result = await this.sendSingle(session, config, phone, content);
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
      logger.error('SMPP发送失败:', error);
      return {
        success: false,
        status: -1,
        message: `SMPP连接失败: ${error.message}`,
        list: phoneNumbers.map(phone => ({
          mobile: phone,
          result: 1,
          mid: null,
          error: error.message
        }))
      };
    } finally {
      if (session) {
        try {
          session.close();
        } catch (e) {
          // ignore
        }
      }
    }
  }

  /**
   * 发送单条短信
   * @param {Object} session - SMPP会话
   * @param {Object} config - 通道配置
   * @param {String} phone - 手机号
   * @param {String} content - 短信内容
   * @returns {Promise}
   */
  static sendSingle(session, config, phone, content) {
    const {
      account,
      smpp_ton = 0,
      smpp_npi = 0
    } = config;

    // 自动检测内容编码
    const hasUnicode = this.hasNonGsmCharacters(content);
    let shortMessage = content;
    let dataCoding = 0; // 默认GSM 7-bit
    
    if (hasUnicode) {
      // 包含中文或其他Unicode字符，使用UCS-2编码（大端序）
      dataCoding = 8; // UCS-2
      // 使用手动转换的UTF-16BE编码
      shortMessage = this.encodeUtf16BE(content);
      logger.info(`检测到Unicode字符，使用UCS-2编码（大端序）`, { 
        content: content.substring(0, 20),
        bufferLength: shortMessage.length,
        firstBytes: shortMessage.slice(0, 16).toString('hex')
      });
    } else {
      logger.info(`使用GSM 7-bit编码`, { 
        content: content.substring(0, 20),
        length: content.length 
      });
    }

    return new Promise((resolve, reject) => {
      session.submit_sm({
        source_addr: account,
        source_addr_ton: smpp_ton,
        source_addr_npi: smpp_npi,
        destination_addr: phone,
        dest_addr_ton: 1, // International
        dest_addr_npi: 1, // ISDN/E.164
        short_message: shortMessage,
        data_coding: dataCoding, // 自动选择编码
        registered_delivery: 1 // Request delivery report
      }, (pdu) => {
        if (pdu.command_status === 0) {
          resolve({
            success: true,
            message_id: pdu.message_id
          });
        } else {
          resolve({
            success: false,
            error: `Submit failed: ${pdu.command_status}`
          });
        }
      });

      // 超时处理
      setTimeout(() => {
        reject(new Error('SMPP发送超时'));
      }, 30000);
    });
  }

  /**
   * 检测内容是否包含非英文字符（中文、特殊符号等）
   * @param {String} text - 文本内容
   * @returns {Boolean}
   */
  static hasNonGsmCharacters(text) {
    // GSM 7-bit 字符集（基本集）
    const gsmChars = "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞ " +
                     "!\"#¤%&'()*+,-./0123456789:;<=>?" +
                     "¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
    
    // 检查是否有字符不在GSM字符集中
    for (let i = 0; i < text.length; i++) {
      if (gsmChars.indexOf(text[i]) === -1) {
        return true;
      }
    }
    return false;
  }

  /**
   * 手动将字符串转换为UTF-16BE（大端序）Buffer
   * @param {String} str - 字符串
   * @returns {Buffer}
   */
  static encodeUtf16BE(str) {
    const buf = Buffer.alloc(str.length * 2);
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      // 大端序：高位字节在前
      buf[i * 2] = code >> 8;      // 高位字节
      buf[i * 2 + 1] = code & 0xFF; // 低位字节
    }
    return buf;
  }

  /**
   * 获取错误消息
   * @param {Number} status - 状态码
   * @returns {String}
   */
  static getResultMessage(status) {
    const messages = {
      0: '发送成功',
      1: 'Invalid Message Length',
      2: 'Invalid Command Length',
      3: 'Invalid Command ID',
      4: 'Incorrect BIND Status',
      5: 'ESME Already in Bound State',
      6: 'Invalid Priority Flag',
      7: 'Invalid Registered Delivery Flag',
      8: 'System Error',
      9: 'Invalid Source Address',
      10: 'Invalid Dest Addr',
      11: 'Message ID is invalid',
      13: 'Bind Failed',
      14: 'Invalid Password',
      15: 'Invalid System ID'
    };

    return messages[status] || `未知错误(${status})`;
  }
}

module.exports = SMPPService;
