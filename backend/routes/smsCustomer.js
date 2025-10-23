/**
 * 短信管理路由（客户端）
 */
const express = require('express');
const router = express.Router();
const { models, sequelize } = require('../config/database');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const SMS57Service = require('../services/sms57Service');

const { SmsChannel, SmsRecord, SmsTask, User, DataLibrary, SmsChannelCountry } = models;

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

// 获取可用通道（按国家）
router.get('/channels/:country', async (req, res) => {
  try {
    const { country } = req.params;
    
    const channels = await SmsChannel.findAll({
      where: {
        country,
        status: 1
      },
      attributes: ['id', 'channel_name', 'country', 'price_per_sms', 'max_chars'],
      order: [['price_per_sms', 'ASC']]
    });
    
    res.json({
      success: true,
      data: channels
    });
  } catch (error) {
    logger.error('获取可用通道失败:', error);
    res.status(500).json({
      success: false,
      message: '获取通道失败',
      error: error.message
    });
  }
});

// 创建短信任务
router.post('/tasks', async (req, res) => {
  try {
    const {
      task_name,
      channel_id,
      country,
      content,
      phone_numbers, // 数组
      send_type,
      scheduled_time
    } = req.body;
    
    const user_id = req.user.id; // 从认证中间件获取
    
    // 验证必填字段
    if (!channel_id || !country || !content || !phone_numbers || phone_numbers.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请填写所有必填字段'
      });
    }
    
    // 获取通道信息
    const channel = await SmsChannel.findByPk(channel_id);
    if (!channel || channel.status !== 1) {
      return res.status(400).json({
        success: false,
        message: '通道不可用'
      });
    }
    
    // 计算字符数
    const char_count = content.length;
    if (char_count > channel.max_chars) {
      return res.status(400).json({
        success: false,
        message: `内容超过最大字符数限制(${channel.max_chars})`
      });
    }
    
    // 计算费用
    const total_cost = phone_numbers.length * parseFloat(channel.price_per_sms);
    
    // 检查余额
    const user = await User.findByPk(user_id);
    if (parseFloat(user.account_balance) < total_cost) {
      return res.status(400).json({
        success: false,
        message: '余额不足'
      });
    }
    
    // 创建任务
    const task = await SmsTask.create({
      task_name: task_name || `短信群发-${new Date().toLocaleString()}`,
      user_id,
      channel_id,
      country,
      content,
      char_count,
      total_numbers: phone_numbers.length,
      send_type: send_type || 'immediate',
      scheduled_time: send_type === 'scheduled' ? scheduled_time : null,
      status: send_type === 'immediate' ? 'pending' : 'scheduled',
      total_cost
    });
    
    // 获取通道国家定价（用于结算）
    const pricing = await getChannelPricing(channel_id, country);
    logger.info(`通道 ${channel_id} 国家 ${country} 定价: 成本 ${pricing.cost_price}, 销售 ${pricing.sale_price}`);
    
    // 创建发送记录
    const records = phone_numbers.map(phone => ({
      task_id: task.id,
      user_id,
      channel_id,
      phone_number: phone,
      country,
      content,
      cost: parseFloat(channel.price_per_sms),
      cost_price: pricing.cost_price,  // 成本价（用于结算）
      sale_price: pricing.sale_price,  // 销售价（用于结算）
      status: 'pending'
    }));
    
    await SmsRecord.bulkCreate(records);
    
    // 如果是立即发送，扣除余额并调用SMS57发送服务
    if (send_type === 'immediate') {
      // 扣除余额
      await user.update({
        account_balance: parseFloat(user.account_balance) - total_cost
      });
      
      // 更新任务状态为发送中
      await task.update({ status: 'sending', start_time: new Date() });
      
      // 调用SMS57发送服务（异步发送）
      setImmediate(async () => {
        try {
          logger.info(`开始发送短信任务: ${task.id}`);
          
          // 调用SMS57 API
          const sendResult = await SMS57Service.send(
            {
              gateway_url: channel.gateway_url,
              account: channel.account,
              password: channel.password,
              extno: channel.extno || '10690'
            },
            phone_numbers,
            content,
            null, // atTime - 立即发送
            `task_${task.id}` // label
          );
          
          logger.info(`SMS57响应:`, sendResult);
          
          if (sendResult.success) {
            // 发送成功，更新记录
            let successCount = 0;
            let failedCount = 0;
            
            for (const item of sendResult.list) {
              const record = await SmsRecord.findOne({
                where: {
                  task_id: task.id,
                  phone_number: item.mobile
                }
              });
              
              if (record) {
                if (item.result === 0) {
                  // 提交成功 - 确保记录了定价信息
                  const updateData = {
                    status: 'success',
                    sent_at: new Date(),
                    gateway_response: JSON.stringify({ mid: item.mid, result: item.result })
                  };
                  
                  // 如果记录中没有定价信息，补充添加
                  if (!record.cost_price || !record.sale_price) {
                    const pricing = await getChannelPricing(channel_id, country);
                    updateData.cost_price = pricing.cost_price;
                    updateData.sale_price = pricing.sale_price;
                  }
                  
                  await record.update(updateData);
                  successCount++;
                } else {
                  // 提交失败
                  await record.update({
                    status: 'failed',
                    error_message: SMS57Service.getResultMessage(item.result),
                    gateway_response: JSON.stringify({ result: item.result })
                  });
                  failedCount++;
                }
              }
            }
            
            // 更新任务状态
            await task.update({
              status: 'completed',
              sent_count: phone_numbers.length,
              success_count: successCount,
              failed_count: failedCount
            });
            
            logger.info(`任务 ${task.id} 完成: 成功 ${successCount}, 失败 ${failedCount}`);
            
          } else {
            // 发送失败
            await task.update({
              status: 'failed',
              error_message: sendResult.message
            });
            
            // 更新所有记录为失败
            await SmsRecord.update(
              {
                status: 'failed',
                error_message: sendResult.message
              },
              {
                where: { task_id: task.id }
              }
            );
            
            logger.error(`任务 ${task.id} 失败: ${sendResult.message}`);
          }
          
        } catch (error) {
          logger.error(`发送短信任务 ${task.id} 异常:`, error);
          
          await task.update({
            status: 'failed',
            error_message: error.message
          });
        }
      });
    }
    
    logger.info(`创建短信任务成功: ${task.id}, 用户: ${user_id}`);
    
    res.json({
      success: true,
      message: '任务创建成功',
      data: task
    });
  } catch (error) {
    logger.error('创建短信任务失败:', error);
    res.status(500).json({
      success: false,
      message: '创建任务失败',
      error: error.message
    });
  }
});

// 获取我的任务列表
router.get('/tasks', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const user_id = req.user.id;
    
    const where = { user_id };
    if (status) where.status = status;
    
    const { count, rows } = await SmsTask.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['created_at', 'DESC']],
      include: [
        {
          model: SmsChannel,
          as: 'channel',
          attributes: ['id', 'channel_name', 'country']
        }
      ]
    });
    
    res.json({
      success: true,
      data: rows,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    logger.error('获取任务列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取任务列表失败',
      error: error.message
    });
  }
});

// 获取任务详情
router.get('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    
    const task = await SmsTask.findOne({
      where: { id, user_id },
      include: [
        {
          model: SmsChannel,
          as: 'channel'
        }
      ]
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: '任务不存在'
      });
    }
    
    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    logger.error('获取任务详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取任务详情失败',
      error: error.message
    });
  }
});

// 取消任务
router.post('/tasks/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    
    const task = await SmsTask.findOne({
      where: { id, user_id }
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: '任务不存在'
      });
    }
    
    if (task.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: '已完成的任务不能取消'
      });
    }
    
    await task.update({ status: 'cancelled' });
    
    // 如果是定时任务，退还费用
    if (task.send_type === 'scheduled') {
      const user = await User.findByPk(user_id);
      await user.update({
        account_balance: parseFloat(user.account_balance) + parseFloat(task.total_cost)
      });
    }
    
    res.json({
      success: true,
      message: '任务已取消'
    });
  } catch (error) {
    logger.error('取消任务失败:', error);
    res.status(500).json({
      success: false,
      message: '取消任务失败',
      error: error.message
    });
  }
});

// 获取我的发送记录
router.get('/records', async (req, res) => {
  try {
    const { page = 1, limit = 20, task_id, status, start_date, end_date } = req.query;
    const user_id = req.user.id;
    
    const where = { user_id };
    if (task_id) where.task_id = task_id;
    if (status) where.status = status;
    
    if (start_date && end_date) {
      where.send_time = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }
    
    const { count, rows } = await SmsRecord.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['created_at', 'DESC']],
      include: [
        {
          model: SmsChannel,
          as: 'channel',
          attributes: ['id', 'channel_name', 'country']
        }
      ]
    });
    
    res.json({
      success: true,
      data: rows,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    logger.error('获取发送记录失败:', error);
    res.status(500).json({
      success: false,
      message: '获取发送记录失败',
      error: error.message
    });
  }
});

// 获取我的统计数据
router.get('/statistics', async (req, res) => {
  try {
    const { period, startDate, endDate } = req.query;
    const user_id = req.user.id;
    
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
    const where = { customer_id: user_id };
    if (Object.keys(dateRange).length > 0) {
      where.sent_at = dateRange;
    }
    
    // 总体统计
    const overall = await SmsRecord.findAll({
      where,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_sent'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'success' THEN 1 ELSE 0 END")), 'total_success'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'failed' THEN 1 ELSE 0 END")), 'total_failed'],
        [sequelize.fn('SUM', sequelize.col('cost')), 'total_cost'],
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('task_id'))), 'total_tasks']
      ],
      raw: true
    });
    
    const overallData = overall[0] || {};
    overallData.total_sent = parseInt(overallData.total_sent) || 0;
    overallData.total_success = parseInt(overallData.total_success) || 0;
    overallData.total_failed = parseInt(overallData.total_failed) || 0;
    overallData.total_cost = parseFloat(overallData.total_cost) || 0;
    overallData.total_tasks = parseInt(overallData.total_tasks) || 0;
    overallData.sent_trend = 0; // TODO: 计算趋势
    
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
    
    // 按日期统计（趋势图）
    const daily = await SmsRecord.findAll({
      where,
      attributes: [
        [sequelize.fn('DATE', sequelize.col('sent_at')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_sent'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'success' THEN 1 ELSE 0 END")), 'total_success'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'failed' THEN 1 ELSE 0 END")), 'total_failed'],
        [sequelize.fn('SUM', sequelize.col('cost')), 'total_cost']
      ],
      group: [sequelize.fn('DATE', sequelize.col('sent_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('sent_at')), 'ASC']],
      raw: true
    });
    
    res.json({
      success: true,
      data: {
        overall: overallData,
        byCountry: byCountry,
        daily: daily
      }
    });
  } catch (error) {
    logger.error('获取统计数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取统计失败',
      error: error.message
    });
  }
});

// 获取已购买的数据（用于选择号码）
router.get('/purchased-data', async (req, res) => {
  try {
    const { country } = req.query;
    const user_id = req.user.id;
    
    const where = { upload_by: user_id };
    if (country) where.country = country;
    
    const dataList = await DataLibrary.findAll({
      where,
      attributes: ['id', 'country', 'available_quantity', 'file_name'],
      order: [['created_at', 'DESC']]
    });
    
    res.json({
      success: true,
      data: dataList
    });
  } catch (error) {
    logger.error('获取已购买数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取数据失败',
      error: error.message
    });
  }
});

module.exports = router;
