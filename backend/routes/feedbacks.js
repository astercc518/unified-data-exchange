/**
 * 数据反馈管理路由
 */
const express = require('express');
const router = express.Router();
const { models } = require('../config/database');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const {
  authenticateToken,
  requireAdmin,
  logOperation
} = require('../middleware/auth');

const { Feedback, User, Order } = models;

// 获取反馈列表
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, dataQuality, keyword } = req.query;
    
    const where = {};
    
    // 权限过滤: 根据用户类型过滤数据
    if (req.user.userType === 'agent') {
      // 代理: 查询该代理下所有客户的反馈
      const customers = await User.findAll({
        where: { agent_id: req.user.userId },
        attributes: ['id']
      });
      const customerIds = customers.map(c => c.id);
      where.customer_id = { [Op.in]: customerIds };
      logger.info(`🔒 代理权限过滤反馈: 客户IDs = [${customerIds.join(', ')}]`);
      
    } else if (req.user.userType === 'customer') {
      // 客户: 只能查看自己的反馈
      where.customer_id = req.user.userId;
      logger.info(`🔒 客户权限过滤反馈: customer_id = ${req.user.userId}`);
    }
    // admin: 不添加过滤条件,查看所有反馈
    
    if (dataQuality) {
      where.data_quality = dataQuality;
    }
    if (keyword) {
      where[Op.or] = [
        { target_site: { [Op.like]: `%${keyword}%` } },
        { content: { [Op.like]: `%${keyword}%` } }
      ];
    }
    
    const { count, rows } = await Feedback.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['create_time', 'DESC']],
      include: [
        { model: User, as: 'customer', attributes: ['id', 'customer_name'] },
        { model: Order, as: 'order', attributes: ['id', 'order_number'] }
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
    logger.error('获取反馈列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取反馈列表失败',
      error: error.message
    });
  }
});

// 创建反馈 - 客户可创建
router.post('/', authenticateToken, logOperation('创建反馈'), async (req, res) => {
  try {
    // 客户只能为自己创建反馈
    if (req.user.userType === 'customer' && req.body.customer_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: '权限不足: 您只能为自己创建反馈'
      });
    }
    
    const feedback = await Feedback.create({
      ...req.body,
      create_time: Date.now()
    });
    
    logger.info(`反馈创建成功: ${feedback.id}`);
    
    res.json({
      success: true,
      data: feedback,
      message: '反馈创建成功'
    });
  } catch (error) {
    logger.error('创建反馈失败:', error);
    res.status(500).json({
      success: false,
      message: '创建反馈失败',
      error: error.message
    });
  }
});

// 编辑反馈 - 代理、客户、管理员都可以
router.put('/:id', authenticateToken, logOperation('编辑反馈'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const feedback = await Feedback.findByPk(id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: '反馈不存在'
      });
    }
    
    // 权限验证
    if (req.user.userType === 'agent') {
      // 代理: 验证是否为自己的客户
      const customer = await User.findByPk(feedback.customer_id);
      if (!customer || customer.agent_id !== req.user.userId) {
        logger.warn(`代理越权编辑反馈: ${req.user.userName} 尝试编辑反馈 ${id}`);
        return res.status(403).json({
          success: false,
          message: '权限不足: 您只能编辑自己客户的反馈'
        });
      }
    } else if (req.user.userType === 'customer') {
      // 客户: 只能编辑自己的反馈
      if (feedback.customer_id !== req.user.userId) {
        logger.warn(`客户越权编辑反馈: ${req.user.userName} 尝试编辑反馈 ${id}`);
        return res.status(403).json({
          success: false,
          message: '权限不足: 您只能编辑自己的反馈'
        });
      }
    }
    
    // 更新反馈
    await feedback.update({
      ...req.body,
      update_time: Date.now()
    });
    
    logger.info(`反馈更新成功: ${id}, 编辑人: ${req.user.userName}`);
    
    res.json({
      success: true,
      message: '反馈更新成功',
      data: feedback
    });
    
  } catch (error) {
    logger.error('更新反馈失败:', error);
    res.status(500).json({
      success: false,
      message: '更新反馈失败',
      error: error.message
    });
  }
});

// 删除反馈 - 仅管理员
router.delete('/:id', authenticateToken, requireAdmin, logOperation('删除反馈'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const feedback = await Feedback.findByPk(id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: '反馈不存在'
      });
    }
    
    await feedback.destroy();
    logger.info(`反馈删除成功: ${id}`);
    
    res.json({
      success: true,
      message: '反馈删除成功'
    });
  } catch (error) {
    logger.error('删除反馈失败:', error);
    res.status(500).json({
      success: false,
      message: '删除反馈失败',
      error: error.message
    });
  }
});

module.exports = router;
