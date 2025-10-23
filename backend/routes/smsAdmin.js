/**
 * 短信管理路由（管理员）
 */
const express = require('express');
const router = express.Router();
const { models, sequelize } = require('../config/database');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

const { SmsChannel, SmsRecord, SmsTask, SmsStats, SmsChannelCountry, User } = models;

/**
 * 根据手机号识别国家
 * @param {string} phoneNumber - 手机号码
 * @returns {string} 国家名称
 */
function getCountryFromPhone(phoneNumber) {
  // 移除所有非数字字符
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  
  // 国家码映射（使用中文名称）
  const countryCodeMap = {
    // 巴西
    '55': '巴西',
    // 越南
    '84': '越南',
    // 孟加拉
    '880': '孟加拉',
    // 中国
    '86': '中国',
    // 美国/加拿大
    '1': '美国',
    // 印度
    '91': '印度',
    // 印度尼西亚
    '62': '印度尼西亚',
    // 菲律宾
    '63': '菲律宾',
    // 泰国
    '66': '泰国',
    // 马来西亚
    '60': '马来西亚',
    // 新加坡
    '65': '新加坡'
  };
  
  // 按照从长到短的顺序匹配国家码
  const sortedCodes = Object.keys(countryCodeMap).sort((a, b) => b.length - a.length);
  
  for (const code of sortedCodes) {
    if (cleanPhone.startsWith(code)) {
      return countryCodeMap[code];
    }
  }
  
  return '未知';  // 未知国家
}

/**
 * 获取通道国家定价信息
 * @param {number} channelId - 通道ID
 * @param {string} country - 国家名称
 * @returns {Object} { cost_price, sale_price }
 */
async function getChannelPricing(channelId, country) {
  try {
    const pricing = await SmsChannelCountry.findOne({
      where: {
        channel_id: channelId,
        country: country,
        status: 1
      }
    });
    
    if (pricing) {
      return {
        cost_price: parseFloat(pricing.cost_price),
        sale_price: parseFloat(pricing.sale_price)
      };
    }
    
    // 如果没有配置国家定价，返回默认值0
    logger.warn(`通道 ${channelId} 国家 ${country} 未配置定价，使用默认值0`);
    return {
      cost_price: 0,
      sale_price: 0
    };
  } catch (error) {
    logger.error('获取通道定价失败:', error);
    return {
      cost_price: 0,
      sale_price: 0
    };
  }
}

// 获取通道列表
router.get('/channels', async (req, res) => {
  try {
    const { page = 1, limit = 20, country, status } = req.query;
    
    const where = {};
    if (country) where.country = country;
    if (status !== undefined) where.status = status;
    
    const { count, rows } = await SmsChannel.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['created_at', 'DESC']]
    });
    
    res.json({
      success: true,
      data: rows,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    logger.error('获取短信通道列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取通道列表失败',
      error: error.message
    });
  }
});

// 创建通道
router.post('/channels', async (req, res) => {
  try {
    const {
      channel_name,
      gateway_url,
      account,
      password,
      protocol_type,
      smpp_host,
      smpp_port,
      smpp_system_id,
      smpp_system_type,
      smpp_ton,
      smpp_npi,
      http_method,
      http_headers,
      request_template,
      response_success_pattern,
      extno,
      api_key,
      extra_params,
      daily_limit
    } = req.body;
    
    // 验证必填字段
    if (!channel_name || !account || !password) {
      return res.status(400).json({
        success: false,
        message: '请填写通道名称、账号和密码'
      });
    }
    
    // 根据协议类型验证
    if (protocol_type === 'smpp') {
      if (!smpp_host || !smpp_port || !smpp_system_id) {
        return res.status(400).json({
          success: false,
          message: 'SMPP协议需要填写服务器地址、端口和系统ID'
        });
      }
    } else {
      if (!gateway_url) {
        return res.status(400).json({
          success: false,
          message: 'HTTP/HTTPS协议需要填写网关地址'
        });
      }
    }
    
    const channel = await SmsChannel.create({
      channel_name,
      gateway_url,
      account,
      password,
      protocol_type: protocol_type || 'http',
      smpp_host,
      smpp_port,
      smpp_system_id,
      smpp_system_type,
      smpp_ton: smpp_ton || 0,
      smpp_npi: smpp_npi || 0,
      http_method: http_method || 'POST',
      http_headers,
      request_template,
      response_success_pattern,
      extno,
      api_key,
      extra_params,
      daily_limit,
      status: 1
    });
    
    logger.info(`创建短信通道成功: ${channel_name}`);
    
    res.json({
      success: true,
      message: '创建通道成功，请在"国家定价"中配置各国家的价格',
      data: channel
    });
  } catch (error) {
    logger.error('创建短信通道失败:', error);
    res.status(500).json({
      success: false,
      message: '创建通道失败',
      error: error.message
    });
  }
});

// 更新通道
router.put('/channels/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const channel = await SmsChannel.findByPk(id);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: '通道不存在'
      });
    }
    
    await channel.update(updateData);
    
    logger.info(`更新短信通道成功: ${id}`);
    
    res.json({
      success: true,
      message: '更新成功',
      data: channel
    });
  } catch (error) {
    logger.error('更新短信通道失败:', error);
    res.status(500).json({
      success: false,
      message: '更新失败',
      error: error.message
    });
  }
});

// 删除通道
router.delete('/channels/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const channel = await SmsChannel.findByPk(id);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: '通道不存在'
      });
    }
    
    await channel.destroy();
    
    logger.info(`删除短信通道成功: ${id}`);
    
    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    logger.error('删除短信通道失败:', error);
    res.status(500).json({
      success: false,
      message: '删除失败',
      error: error.message
    });
  }
});

// 获取发送记录（管理员）
router.get('/records', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      customerName,
      phoneNumber,
      channelId,
      user_id, 
      channel_id, 
      status, 
      start_date, 
      end_date, 
      phone_number 
    } = req.query;
    
    const where = {};
    
    // 处理各种查询条件
    if (user_id) where.customer_id = user_id;
    if (channelId) where.channel_id = channelId; // 优先使用channelId
    else if (channel_id) where.channel_id = channel_id;
    if (status) where.status = status;
    
    // 手机号码查询（支持两种参数名）
    if (phoneNumber) {
      where.phone_number = { [Op.like]: `%${phoneNumber}%` };
    } else if (phone_number) {
      where.phone_number = { [Op.like]: `%${phone_number}%` };
    }
    
    // 日期范围查询
    if (start_date && end_date) {
      where.sent_at = {
        [Op.between]: [new Date(start_date), new Date(end_date + ' 23:59:59')]
      };
    }
    
    // 构建include条件
    const include = [
      {
        model: models.User,
        as: 'customer',
        attributes: ['id', 'customer_name', 'email', 'login_account'],
        required: false
      },
      {
        model: SmsChannel,
        as: 'channel',
        attributes: ['id', 'channel_name'],
        required: false
      }
    ];
    
    // 如果有客户名称搜索，添加关联表的where条件
    if (customerName) {
      include[0].where = {
        [Op.or]: [
          { customer_name: { [Op.like]: `%${customerName}%` } },
          { login_account: { [Op.like]: `%${customerName}%` } }
        ]
      };
      include[0].required = true; // 必须INNER JOIN
    }
    
    const { count, rows } = await SmsRecord.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['sent_at', 'DESC']],
      include,
      distinct: true // 避免JOIN导致的计数错误
    });
    
    // 转换数据格式，将关联对象的字段提升到一级
    const records = rows.map(row => {
      const record = row.toJSON();
      
      // 处理客户名称：如果customer_id为1且login_account为admin，显示"admin"
      let customerName = '-';
      if (record.customer) {
        customerName = record.customer.customer_name || record.customer.login_account || '-';
      } else if (record.customer_id === 1) {
        customerName = 'admin';
      }
      
      // 计算字符数：使用实际内容长度
      const charCount = record.content ? record.content.length : 0;
      
      return {
        ...record,
        customer_name: customerName,
        channel_name: record.channel?.channel_name || '-',
        char_count: charCount,
        // 确保时间字段正确
        sent_at: record.sent_at || record.send_time || record.created_at,
        delivered_at: record.delivered_at || record.delivery_time
      };
    });
    
    // 计算成功和失败数量
    const successCount = rows.filter(r => r.status === 'success').length;
    const failedCount = rows.filter(r => r.status === 'failed').length;

    res.json({
      success: true,
      data: {
        records,
        total: count,
        successCount,
        failedCount
      },
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    logger.error('获取短信发送记录失败:', error);
    res.status(500).json({
      success: false,
      message: '获取发送记录失败',
      error: error.message
    });
  }
});

// 获取统计数据（管理员）
router.get('/statistics', async (req, res) => {
  try {
    const { period, startDate, endDate, country } = req.query;
    
    // 构建时间范围
    let dateRange = {};
    const now = new Date();
    
    if (period === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateRange = {
        [Op.gte]: today
      };
    } else if (period === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateRange = {
        [Op.gte]: weekAgo
      };
    } else if (period === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateRange = {
        [Op.gte]: monthAgo
      };
    } else if (period === 'custom' && startDate && endDate) {
      dateRange = {
        [Op.between]: [new Date(startDate), new Date(endDate + ' 23:59:59')]
      };
    }
    
    // 构建查询条件
    const where = {};
    if (Object.keys(dateRange).length > 0) {
      where.sent_at = dateRange;
    }
    if (country) {
      where.country = country;
    }
    
    // 总体统计
    const overall = await SmsRecord.findAll({
      where,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_sent'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'success' THEN 1 ELSE 0 END")), 'total_success'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'failed' THEN 1 ELSE 0 END")), 'total_failed'],
        [sequelize.fn('SUM', sequelize.col('cost')), 'total_cost']
      ],
      raw: true
    });
    
    const overallData = overall[0] || {};
    overallData.total_sent = parseInt(overallData.total_sent) || 0;
    overallData.total_success = parseInt(overallData.total_success) || 0;
    overallData.total_failed = parseInt(overallData.total_failed) || 0;
    overallData.total_cost = parseFloat(overallData.total_cost) || 0;
    
    // 按国家统计
    const byCountry = await SmsRecord.findAll({
      where,
      attributes: [
        'country',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_sent'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'success' THEN 1 ELSE 0 END")), 'total_success'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'failed' THEN 1 ELSE 0 END")), 'total_failed'],
        [sequelize.fn('SUM', sequelize.col('cost')), 'total_cost']
      ],
      group: ['country'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      raw: true
    });
    
    // 按客户统计 (Top 10)
    const byCustomer = await SmsRecord.findAll({
      where,
      attributes: [
        'customer_id',
        [sequelize.fn('COUNT', sequelize.col('SmsRecord.id')), 'total_sent'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN SmsRecord.status = 'success' THEN 1 ELSE 0 END")), 'total_success'],
        [sequelize.fn('SUM', sequelize.col('cost')), 'total_cost']
      ],
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['customer_name', 'login_account'],  // 增加login_account字段
          required: false
        }
      ],
      group: ['customer_id', 'customer.id'],
      order: [[sequelize.fn('COUNT', sequelize.col('SmsRecord.id')), 'DESC']],
      limit: 10,
      subQuery: false
    });
    
    // 格式化客户统计数据
    const customerData = byCustomer.map(item => {
      let customerName = '未知客户';
      
      // 判断是否是管理员测试（customer_id = 1）
      if (item.customer_id === 1) {
        customerName = 'admin';  // 管理员测试记录显示为admin
      } else if (item.customer && item.customer.customer_name) {
        customerName = item.customer.customer_name;
      } else if (item.customer && item.customer.login_account === 'admin') {
        customerName = 'admin';
      }
      
      return {
        customer_id: item.customer_id,
        customer_name: customerName,
        total_sent: parseInt(item.get('total_sent')) || 0,
        total_success: parseInt(item.get('total_success')) || 0,
        total_cost: parseFloat(item.get('total_cost')) || 0
      };
    });
    
    // 按通道统计
    const byChannel = await SmsRecord.findAll({
      where,
      attributes: [
        'channel_id',
        'country',
        [sequelize.fn('COUNT', sequelize.col('SmsRecord.id')), 'total_sent'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN SmsRecord.status = 'success' THEN 1 ELSE 0 END")), 'total_success'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN SmsRecord.status = 'failed' THEN 1 ELSE 0 END")), 'total_failed'],
        [sequelize.fn('SUM', sequelize.col('cost')), 'total_cost']
      ],
      include: [
        {
          model: SmsChannel,
          as: 'channel',
          attributes: ['channel_name'],
          required: false
        }
      ],
      group: ['channel_id', 'country', 'channel.id'],
      order: [[sequelize.fn('COUNT', sequelize.col('SmsRecord.id')), 'DESC']],
      subQuery: false
    });
    
    // 格式化通道统计数据
    const channelData = byChannel.map(item => ({
      channel_id: item.channel_id,
      channel_name: item.channel ? item.channel.channel_name : '未知通道',
      country: item.country,
      total_sent: parseInt(item.get('total_sent')) || 0,
      total_success: parseInt(item.get('total_success')) || 0,
      total_failed: parseInt(item.get('total_failed')) || 0,
      total_cost: parseFloat(item.get('total_cost')) || 0
    }));
    
    res.json({
      success: true,
      data: {
        overall: overallData,
        byCountry: byCountry,
        byCustomer: customerData,
        byChannel: channelData
      }
    });
  } catch (error) {
    logger.error('获取短信统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取统计失败',
      error: error.message
    });
  }
});

// 获取国家列表（从通道国家定价表中获取）
router.get('/countries', async (req, res) => {
  try {
    const { SmsChannelCountry } = require('../config/database').models;
    
    // 从 sms_channel_countries 表查询所有不同的国家
    const countries = await SmsChannelCountry.findAll({
      attributes: [
        'country',
        'country_code'
      ],
      where: { status: 1 },
      group: ['country', 'country_code'],
      order: [['country', 'ASC']],
      raw: true
    });
    
    // 转换为简单数组
    const countryList = countries.map(c => c.country);
    
    res.json({
      success: true,
      data: {
        countries: countryList
      }
    });
  } catch (error) {
    logger.error('获取国家列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取国家列表失败',
      error: error.message
    });
  }
});

// 测试发送短信
router.post('/channels/:id/test', async (req, res) => {
  try {
    const { id } = req.params;
    const { phone_number, content } = req.body;
    
    // 验证必填字段
    if (!phone_number || !content) {
      return res.status(400).json({
        success: false,
        message: '请填写手机号和短信内容'
      });
    }
    
    // 获取通道信息
    const channel = await SmsChannel.findByPk(id);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: '通道不存在'
      });
    }
    
    // 根据协议类型调用不同的发送服务
    let sendResult;
    let serviceName = '';
    
    try {
      if (channel.protocol_type === 'smpp') {
        // 使用SMPP协议
        const SMPPService = require('../services/smppService');
        serviceName = 'SMPP';
        
        sendResult = await SMPPService.send(
          {
            smpp_host: channel.smpp_host,
            smpp_port: channel.smpp_port,
            smpp_system_id: channel.smpp_system_id,
            password: channel.password,
            smpp_system_type: channel.smpp_system_type,
            account: channel.account,
            smpp_ton: channel.smpp_ton,
            smpp_npi: channel.smpp_npi
          },
          [phone_number],
          content
        );
      } else {
        // 使用通用HTTP服务
        const GenericHttpService = require('../services/genericHttpService');
        serviceName = 'HTTP';
        
        sendResult = await GenericHttpService.send(
          {
            gateway_url: channel.gateway_url,
            http_method: channel.http_method || 'POST',
            http_headers: channel.http_headers,
            request_template: channel.request_template,
            response_success_pattern: channel.response_success_pattern,
            account: channel.account,
            password: channel.password
          },
          [phone_number],
          content
        );
      }
      
      logger.info(`通道 ${id} (${serviceName}) 测试发送结果:`, sendResult);
      
      if (sendResult.success && sendResult.list && sendResult.list.length > 0) {
        // 从手机号识别国家
        const country = getCountryFromPhone(phone_number);
        
        // 记录测试发送（不计费）
        await SmsRecord.create({
          task_id: null,
          customer_id: req.user?.id || 1, // 管理员测试
          channel_id: id,
          phone_number,
          country: country, // 从手机号识别国家
          content,
          char_count: content.length, // 计算字符数
          cost: 0, // 测试不计费
          cost_price: 0,
          sale_price: 0,
          status: sendResult.list[0].result === 0 ? 'success' : 'failed',
          sent_at: new Date(),
          gateway_response: JSON.stringify(sendResult.list[0]),
          error_message: sendResult.list[0].error || null
        });
        
        if (sendResult.list[0].result === 0) {
          return res.json({
            success: true,
            message: '测试发送成功',
            data: {
              mid: sendResult.list[0].mid,
              result: sendResult.list[0].result,
              service: serviceName
            }
          });
        } else {
          return res.status(400).json({
            success: false,
            message: `发送失败: ${sendResult.list[0].error || '未知错误'}`,
            data: sendResult.list[0]
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: `发送失败: ${sendResult.message || '未知错误'}`,
          error: sendResult
        });
      }
    } catch (serviceError) {
      logger.error(`${serviceName}发送失败:`, serviceError);
      return res.status(500).json({
        success: false,
        message: `${serviceName}发送失败: ${serviceError.message}`
      });
    }
    
  } catch (error) {
    logger.error('测试发送短信失败:', error);
    res.status(500).json({
      success: false,
      message: '测试发送失败',
      error: error.message
    });
  }
});

module.exports = router;
