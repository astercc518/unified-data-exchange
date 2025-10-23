/**
 * 客户管理路由
 */
const express = require('express');
const router = express.Router();
const { models, sequelize } = require('../config/database');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const { logUserOperation } = require('../utils/operationLogger');
const {
  authenticateToken,
  requireAdmin,
  requireAgentOrAdmin,
  verifyCustomerAccess
} = require('../middleware/auth');

const { User } = models;

// 获取单个客户详情 - 代理、管理员和客户本人可访问
router.get('/:id', authenticateToken, verifyCustomerAccess, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '客户不存在'
      });
    }
    
    // 将数据库下划线命名转换为前端驼峰命名
    const userData = user.toJSON();
    const formattedData = {
      id: userData.id,
      loginAccount: userData.login_account,
      loginPassword: userData.login_password,
      customerName: userData.customer_name,
      email: userData.email,
      agentId: userData.agent_id,
      agentName: userData.agent_name,
      salePriceRate: parseFloat(userData.sale_price_rate),
      accountBalance: parseFloat(userData.account_balance),
      overdraftAmount: parseFloat(userData.overdraft_amount),
      status: userData.status,
      createTime: userData.create_time,
      updateTime: userData.update_time,
      remark: userData.remark
    };
    
    res.json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    logger.error('获取客户详情失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取客户列表 - 代理和管理员可访问
router.get('/', authenticateToken, requireAgentOrAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, agentId, keyword } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    
    // 权限过滤: 代理只能查看自己的客户
    if (req.user.userType === 'agent') {
      where.agent_id = req.user.userId;
      logger.info(`🔒 代理权限过滤: agent_id = ${req.user.userId}`);
    }
    // admin可以查看所有客户,不添加过滤条件
    
    if (status !== undefined) where.status = status;
    if (agentId && req.user.userType === 'admin') {
      // 只有管理员可以按agentId过滤
      where.agent_id = agentId;
    }
    if (keyword) {
      where[Op.or] = [
        { customer_name: { [Op.like]: `%${keyword}%` }},
        { login_account: { [Op.like]: `%${keyword}%` }}
      ];
    }
    
    const { count, rows } = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['create_time', 'DESC']]
    });
    
    // 将数据库下划线命名转换为前端驼峰命名
    const formattedRows = rows.map(user => {
      const userData = user.toJSON();
      return {
        id: userData.id,
        loginAccount: userData.login_account,
        loginPassword: userData.login_password,
        customerName: userData.customer_name,
        email: userData.email,
        agentId: userData.agent_id,
        agentName: userData.agent_name,
        salePriceRate: parseFloat(userData.sale_price_rate),
        // unitPrice 已移除 - 客户价格基于 salePriceRate 动态计算
        accountBalance: parseFloat(userData.account_balance),
        overdraftAmount: parseFloat(userData.overdraft_amount),
        status: userData.status,
        createTime: userData.create_time,
        updateTime: userData.update_time,
        remark: userData.remark
      };
    });
    
    res.json({
      success: true,
      data: formattedRows,
      total: count,
      page: parseInt(page),
      pageSize: parseInt(limit)
    });
  } catch (error) {
    logger.error('获取客户列表失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 创建客户 - 仅管理员可访问
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // 打印接收到的请求体，用于调试
    logger.info('📥 接收到创建客户请求，请求体:', req.body);
    
    // 将前端驼峰命名转换为数据库下划线命名
    const userData = {
      login_account: req.body.loginAccount,
      login_password: req.body.loginPassword,
      customer_name: req.body.customerName,
      email: req.body.email,
      agent_id: req.body.agentId ? parseInt(req.body.agentId) : null,
      agent_name: req.body.agentName || '',
      sale_price_rate: req.body.salePriceRate || 1.00,
      account_balance: req.body.accountBalance || 0.00000,
      overdraft_amount: req.body.overdraftAmount || 0.00000,
      status: req.body.status !== undefined ? req.body.status : 1,
      remark: req.body.remark || '',
      create_time: Date.now()
    };
    
    logger.info('📝 转换后的用户数据:', userData);
    
    const user = await User.create(userData);
    logger.info('创建客户成功:', user.id);
    
    // 记录操作日志
    await logUserOperation('创建客户', req, user.id, user.customer_name).catch(err => 
      logger.error('记录日志失败:', err)
    );
    
    res.json({
      success: true,
      data: user,
      message: '创建成功'
    });
  } catch (error) {
    logger.error('创建客户失败:', error);
    
    // 处理唯一约束冲突错误
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = Object.keys(error.fields)[0];
      let message = '创建失败';
      
      if (field === 'login_account') {
        message = `登录账号 "${error.fields[field]}" 已存在，请使用其他账号`;
      } else if (field === 'email') {
        message = `邮箱 "${error.fields[field]}" 已被使用，请使用其他邮箱`;
      } else {
        message = `${field} 已存在，请修改后重试`;
      }
      
      return res.status(400).json({ success: false, message });
    }
    
    // 其他错误
    res.status(500).json({ success: false, message: error.message });
  }
});

// 更新客户 - 仅管理员可访问
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '客户不存在'
      });
    }
    
    // 将前端驼峰命名转换为数据库下划线命名
    const updateData = {
      update_time: Date.now()
    };
    
    // 只更新提供的字段
    if (req.body.loginAccount !== undefined) updateData.login_account = req.body.loginAccount;
    if (req.body.loginPassword !== undefined) updateData.login_password = req.body.loginPassword;
    if (req.body.customerName !== undefined) updateData.customer_name = req.body.customerName;
    if (req.body.email !== undefined) updateData.email = req.body.email;
    if (req.body.agentId !== undefined) updateData.agent_id = req.body.agentId ? parseInt(req.body.agentId) : null;
    if (req.body.agentName !== undefined) updateData.agent_name = req.body.agentName;
    if (req.body.salePriceRate !== undefined) updateData.sale_price_rate = req.body.salePriceRate;
    if (req.body.accountBalance !== undefined) updateData.account_balance = req.body.accountBalance;
    if (req.body.overdraftAmount !== undefined) updateData.overdraft_amount = req.body.overdraftAmount;
    if (req.body.status !== undefined) updateData.status = req.body.status;
    if (req.body.remark !== undefined) updateData.remark = req.body.remark;
    
    await User.update(updateData, { where: { id }});
    
    // 记录操作日志
    await logUserOperation('更新客户', req, id, user.customer_name).catch(err => 
      logger.error('记录日志失败:', err)
    );
    
    res.json({
      success: true,
      message: '更新成功'
    });
  } catch (error) {
    logger.error('更新客户失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 删除客户 - 仅管理员可访问
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '客户不存在'
      });
    }
    
    const userName = user.customer_name;
    await user.destroy();
    logger.info('删除客户成功:', id);
    
    // 记录操作日志
    await logUserOperation('删除客户', req, id, userName).catch(err => 
      logger.error('记录日志失败:', err)
    );
    
    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    logger.error('删除客户失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;