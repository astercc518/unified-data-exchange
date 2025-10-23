/**
 * 系统安全管理路由
 */
const express = require('express');
const router = express.Router();
const { models, sequelize } = require('../../config/database');
const logger = require('../../utils/logger');
const { logSystemOperation } = require('../../utils/operationLogger');

const { Agent, SystemConfig } = models;

// 修改管理员密码
router.post('/change-password', async (req, res) => {
  try {
    const { adminId, oldPassword, newPassword } = req.body;
    
    if (!adminId || !oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: '参数不完整'
      });
    }
    
    // 查找管理员
    const admin = await Agent.findByPk(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: '管理员不存在'
      });
    }
    
    // 验证旧密码
    if (admin.login_password !== oldPassword) {
      return res.status(400).json({
        success: false,
        message: '原密码错误'
      });
    }
    
    // 更新密码
    await admin.update({
      login_password: newPassword,
      update_time: Date.now()
    });
    
    logger.info(`管理员${admin.login_account}修改密码成功`);
    
    // 记录操作日志
    await logSystemOperation('修改管理员密码', req, `管理员: ${admin.login_account}`).catch(err => 
      logger.error('记录日志失败:', err)
    );
    
    res.json({
      success: true,
      message: '密码修改成功'
    });
  } catch (error) {
    logger.error('修改密码失败:', error);
    res.status(500).json({
      success: false,
      message: '修改密码失败',
      error: error.message
    });
  }
});

// 获取安全配置
router.get('/config', async (req, res) => {
  try {
    let config = await SystemConfig.findOne({
      where: { config_key: 'security_settings' }
    });
    
    if (!config) {
      // 创建默认配置
      config = await SystemConfig.create({
        config_key: 'security_settings',
        config_value: JSON.stringify({
          passwordLevel: 'medium',
          ipRestriction: false,
          allowedIps: []
        }),
        description: '系统安全配置',
        create_time: Date.now()
      });
    }
    
    const settings = JSON.parse(config.config_value);
    
    res.json({
      success: true,
      data: {
        id: config.id,
        passwordLevel: settings.passwordLevel || 'medium',
        ipRestriction: settings.ipRestriction || false,
        allowedIps: settings.allowedIps || []
      }
    });
  } catch (error) {
    logger.error('获取安全配置失败:', error);
    res.status(500).json({
      success: false,
      message: '获取安全配置失败',
      error: error.message
    });
  }
});

// 更新安全配置
router.put('/config', async (req, res) => {
  try {
    const { passwordLevel, ipRestriction, allowedIps } = req.body;
    
    let config = await SystemConfig.findOne({
      where: { config_key: 'security_settings' }
    });
    
    const settings = {
      passwordLevel: passwordLevel || 'medium',
      ipRestriction: ipRestriction || false,
      allowedIps: allowedIps || []
    };
    
    if (config) {
      await config.update({
        config_value: JSON.stringify(settings),
        update_time: Date.now()
      });
    } else {
      config = await SystemConfig.create({
        config_key: 'security_settings',
        config_value: JSON.stringify(settings),
        description: '系统安全配置',
        create_time: Date.now()
      });
    }
    
    logger.info('安全配置更新成功:', settings);
    
    // 记录操作日志
    await logSystemOperation('更新安全配置', req, `密码级别: ${settings.passwordLevel}, IP限制: ${settings.ipRestriction}`).catch(err => 
      logger.error('记录日志失败:', err)
    );
    
    res.json({
      success: true,
      data: settings,
      message: '安全配置更新成功'
    });
  } catch (error) {
    logger.error('更新安全配置失败:', error);
    res.status(500).json({
      success: false,
      message: '更新安全配置失败',
      error: error.message
    });
  }
});

module.exports = router;
