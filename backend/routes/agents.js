/**
 * 代理管理路由
 */
const express = require('express');
const router = express.Router();
const { models } = require('../config/database');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const { logOperation } = require('../utils/operationLogger');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const { Agent, User } = models;

// 获取代理列表 - 仅管理员可访问
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, keyword } = req.query;
    
    const where = {};
    if (status !== undefined) {
      where.status = parseInt(status);
    }
    if (keyword) {
      where[Op.or] = [
        { login_account: { [Op.like]: `%${keyword}%` } },
        { agent_name: { [Op.like]: `%${keyword}%` } }
      ];
    }
    
    const { count, rows } = await Agent.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['create_time', 'DESC']]
    });
    
    res.json({
      success: true,
      data: rows,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    logger.error('获取代理列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取代理列表失败',
      error: error.message
    });
  }
});

// 创建代理 - 仅管理员可访问
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const agent = await Agent.create({
      ...req.body,
      create_time: Date.now(),
      status: 1
    });
    
    logger.info(`代理创建成功: ${agent.login_account}`);
    
    // 记录操作日志
    await logOperation({
      action: '创建代理',
      description: `创建代理: ${agent.agent_name} (${agent.login_account})`,
      req,
      status: 'success'
    }).catch(err => logger.error('记录日志失败:', err));
    
    res.json({
      success: true,
      data: agent,
      message: '代理创建成功'
    });
  } catch (error) {
    logger.error('创建代理失败:', error);
    res.status(500).json({
      success: false,
      message: '创建代理失败',
      error: error.message
    });
  }
});

// 获取代理详情 - 代理可以查看自己的信息,管理员可以查看所有代理
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const requestedAgentId = parseInt(req.params.id);
    const { userId, userType } = req.user;
    
    // 权限验证: 代理只能查看自己的信息
    if (userType === 'agent' && userId !== requestedAgentId) {
      logger.warn(`代理越权访问: ${req.user.userName} 尝试访问代理ID ${requestedAgentId}`);
      return res.status(403).json({
        success: false,
        message: '权限不足: 您只能查看自己的信息'
      });
    }
    
    // 非管理员和非代理角色,拒绝访问
    if (userType !== 'admin' && userType !== 'agent') {
      return res.status(403).json({
        success: false,
        message: '权限不足: 仅管理员和代理可访问'
      });
    }
    
    const agent = await Agent.findByPk(requestedAgentId);
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: '代理不存在'
      });
    }
    
    // 查询该代理下的客户数量
    const bindUsers = await User.count({
      where: { agent_id: requestedAgentId }
    });
    
    // 返回代理信息,包含客户数量
    const agentData = agent.toJSON();
    agentData.bindUsers = bindUsers;
    
    res.json({
      success: true,
      data: agentData
    });
  } catch (error) {
    logger.error('获取代理详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取代理详情失败',
      error: error.message
    });
  }
});

// 更新代理 - 仅管理员可访问
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const agent = await Agent.findByPk(req.params.id);
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: '代理不存在'
      });
    }
    
    // 将前端驼峰命名转换为数据库下划线命名
    const updateData = {};
    if (req.body.agentName !== undefined) updateData.agent_name = req.body.agentName;
    if (req.body.commission !== undefined) updateData.commission = req.body.commission;
    if (req.body.status !== undefined) updateData.status = req.body.status;
    if (req.body.email !== undefined) updateData.email = req.body.email;
    if (req.body.phone !== undefined) updateData.phone = req.body.phone;
    if (req.body.remark !== undefined) updateData.remark = req.body.remark;
    if (req.body.region !== undefined) updateData.region = req.body.region;
    
    // 添加更新时间
    updateData.update_time = Date.now();
    
    logger.info(`📝 开始更新代理: ${agent.login_account}, 数据:`, updateData);
    
    await agent.update(updateData);
    
    logger.info(`✅ 代理更新成功: ${agent.login_account}`);
    
    // 记录操作日志
    await logOperation({
      action: '更新代理',
      description: `更新代理: ${agent.agent_name} (${agent.login_account})`,
      req,
      status: 'success'
    }).catch(err => logger.error('记录日志失败:', err));
    
    res.json({
      success: true,
      data: agent,
      message: '代理更新成功'
    });
  } catch (error) {
    logger.error('更新代理失败:', error);
    res.status(500).json({
      success: false,
      message: '更新代理失败',
      error: error.message
    });
  }
});

// 删除代理 - 仅管理员可访问
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const agent = await Agent.findByPk(req.params.id);
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: '代理不存在'
      });
    }
    
    const agentInfo = {
      name: agent.agent_name,
      account: agent.login_account
    };
    
    await agent.destroy();
    
    logger.info(`代理删除成功: ${agentInfo.account}`);
    
    // 记录操作日志
    await logOperation({
      action: '删除代理',
      description: `删除代理: ${agentInfo.name} (${agentInfo.account})`,
      req,
      status: 'success'
    }).catch(err => logger.error('记录日志失败:', err));
    
    res.json({
      success: true,
      message: '代理删除成功'
    });
  } catch (error) {
    logger.error('删除代理失败:', error);
    res.status(500).json({
      success: false,
      message: '删除代理失败',
      error: error.message
    });
  }
});

module.exports = router;