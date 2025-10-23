/**
 * 发货配置管理路由
 */
const express = require('express');
const router = express.Router();
const { models } = require('../config/database');
const logger = require('../utils/logger');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const { DeliveryConfig } = models;

// 获取发货配置
router.get('/config/:type', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { type } = req.params;  // email 或 tgbot
    
    let config = await DeliveryConfig.findOne({
      where: { config_type: type }
    });
    
    if (!config) {
      // 返回默认配置
      const defaultConfig = type === 'email' ? {
        smtp_host: '',
        smtp_port: 587,
        smtp_secure: false,
        smtp_user: '',
        smtp_pass: '',
        sender_name: '数据平台'
      } : {
        bot_token: '',
        bot_username: '',
        webhook_url: ''
      };
      
      return res.json({
        success: true,
        data: {
          config_type: type,
          config_data: defaultConfig,
          status: 0
        }
      });
    }
    
    res.json({
      success: true,
      data: {
        id: config.id,
        config_type: config.config_type,
        config_data: config.config_data,
        status: config.status,
        remark: config.remark
      }
    });
  } catch (error) {
    logger.error('获取发货配置失败:', error);
    res.status(500).json({
      success: false,
      message: '获取发货配置失败',
      error: error.message
    });
  }
});

// 更新发货配置
router.put('/config/:type', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { type } = req.params;
    const { config_data, status, remark } = req.body;
    
    let config = await DeliveryConfig.findOne({
      where: { config_type: type }
    });
    
    if (config) {
      await config.update({
        config_data,
        status: status !== undefined ? status : config.status,
        remark,
        update_time: Date.now()
      });
    } else {
      config = await DeliveryConfig.create({
        config_type: type,
        config_data,
        status: status !== undefined ? status : 1,
        remark,
        create_time: Date.now()
      });
    }
    
    logger.info(`发货配置更新成功: ${type}`);
    
    res.json({
      success: true,
      data: config,
      message: '配置保存成功'
    });
  } catch (error) {
    logger.error('更新发货配置失败:', error);
    res.status(500).json({
      success: false,
      message: '更新发货配置失败',
      error: error.message
    });
  }
});

// 测试邮箱配置
router.post('/config/email/test', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { config_data, test_email } = req.body;
    
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransport({
      host: config_data.smtp_host,
      port: config_data.smtp_port,
      secure: config_data.smtp_secure || false,
      auth: {
        user: config_data.smtp_user,
        pass: config_data.smtp_pass
      }
    });
    
    const info = await transporter.sendMail({
      from: `"${config_data.sender_name || '数据平台'}" <${config_data.smtp_user}>`,
      to: test_email,
      subject: '邮箱配置测试',
      html: `
        <h2>邮箱配置测试</h2>
        <p>这是一封测试邮件，用于验证邮箱配置是否正确。</p>
        <p><strong>发送时间：</strong>${new Date().toLocaleString('zh-CN')}</p>
        <hr>
        <p style="color: #999; font-size: 12px;">此邮件由系统自动发送。</p>
      `
    });
    
    logger.info(`测试邮件发送成功: ${info.messageId}`);
    
    res.json({
      success: true,
      message: '测试邮件发送成功',
      messageId: info.messageId
    });
  } catch (error) {
    logger.error('测试邮件发送失败:', error);
    res.status(500).json({
      success: false,
      message: '测试邮件发送失败',
      error: error.message
    });
  }
});

// 测试TGBot配置
router.post('/config/tgbot/test', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { config_data, test_chat_id } = req.body;
    
    const TelegramBot = require('node-telegram-bot-api');
    const bot = new TelegramBot(config_data.bot_token);
    
    await bot.sendMessage(test_chat_id, `
🤖 TGBot配置测试

这是一条测试消息，用于验证TGBot配置是否正确。

发送时间：${new Date().toLocaleString('zh-CN')}
    `.trim());
    
    logger.info(`测试消息发送成功，ChatID: ${test_chat_id}`);
    
    res.json({
      success: true,
      message: '测试消息发送成功'
    });
  } catch (error) {
    logger.error('测试消息发送失败:', error);
    res.status(500).json({
      success: false,
      message: '测试消息发送失败',
      error: error.message
    });
  }
});

module.exports = router;
