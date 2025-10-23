/**
 * 代理角色权限 - 后端API实现示例
 * 
 * 本文件展示如何在后端API中实现代理角色的数据过滤和权限验证
 * 
 * 实施说明:
 * 1. 在现有的后端路由文件中添加权限验证中间件
 * 2. 根据用户角色(userType)过滤返回的数据
 * 3. 确保代理只能访问自己名下的客户数据
 */

const express = require('express');
const router = express.Router();
const { User, Order, Feedback } = require('../models');
const { Op } = require('sequelize');

// ===== 权限验证中间件 =====

/**
 * 验证用户是否为管理员
 */
const requireAdmin = (req, res, next) => {
  const { userType } = req.user;
  
  if (userType !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '权限不足: 仅管理员可访问'
    });
  }
  
  next();
};

/**
 * 验证用户是否为代理或管理员
 */
const requireAgentOrAdmin = (req, res, next) => {
  const { userType } = req.user;
  
  if (userType !== 'agent' && userType !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '权限不足: 仅代理或管理员可访问'
    });
  }
  
  next();
};

/**
 * 验证代理是否有权访问指定客户
 * @param {number} customerId - 客户ID
 */
const verifyCustomerAccess = async (req, res, next) => {
  const { userId, userType } = req.user;
  const customerId = req.params.customerId || req.body.customer_id;
  
  // 管理员可以访问所有客户
  if (userType === 'admin') {
    return next();
  }
  
  // 代理只能访问自己的客户
  if (userType === 'agent') {
    const customer = await User.findByPk(customerId);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: '客户不存在'
      });
    }
    
    if (customer.agent_id !== userId) {
      return res.status(403).json({
        success: false,
        message: '权限不足: 您只能访问自己的客户'
      });
    }
    
    return next();
  }
  
  // 客户只能访问自己
  if (userType === 'customer') {
    if (customerId !== userId) {
      return res.status(403).json({
        success: false,
        message: '权限不足: 您只能访问自己的信息'
      });
    }
    return next();
  }
  
  res.status(403).json({
    success: false,
    message: '权限不足'
  });
};

// ===== 客户管理 API =====

/**
 * 获取客户列表
 * 管理员: 查看所有客户
 * 代理: 只能查看自己的客户
 * 客户: 不可访问
 */
router.get('/api/users', requireAgentOrAdmin, async (req, res) => {
  try {
    const { userId, userType } = req.user;
    const { page = 1, limit = 20 } = req.query;
    
    // 构建查询条件
    let whereCondition = {};
    
    if (userType === 'agent') {
      // 代理只能查看自己的客户
      whereCondition.agent_id = userId;
      console.log(`🔒 代理权限过滤: agent_id = ${userId}`);
    }
    // 管理员可以查看所有客户,不添加过滤条件
    
    // 查询数据
    const { count, rows } = await User.findAndCountAll({
      where: whereCondition,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['create_time', 'DESC']]
    });
    
    // 数据格式转换
    const formattedData = rows.map(user => ({
      id: user.id,
      loginAccount: user.login_account,
      customerName: user.customer_name,
      email: user.email,
      agentId: user.agent_id,
      agentName: user.agent_name,
      salePriceRate: parseFloat(user.sale_price_rate),
      accountBalance: parseFloat(user.account_balance),
      status: user.status,
      createTime: user.create_time
    }));
    
    res.json({
      success: true,
      data: formattedData,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit)
    });
    
  } catch (error) {
    console.error('❌ 获取客户列表失败:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * 获取客户详情
 * 管理员: 查看所有客户详情
 * 代理: 只能查看自己的客户详情
 */
router.get('/api/users/:id', requireAgentOrAdmin, verifyCustomerAccess, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '客户不存在'
      });
    }
    
    // 数据格式转换
    const formattedData = {
      id: user.id,
      loginAccount: user.login_account,
      customerName: user.customer_name,
      email: user.email,
      agentId: user.agent_id,
      agentName: user.agent_name,
      salePriceRate: parseFloat(user.sale_price_rate),
      accountBalance: parseFloat(user.account_balance),
      overdraftAmount: parseFloat(user.overdraft_amount),
      status: user.status,
      createTime: user.create_time,
      updateTime: user.update_time,
      remark: user.remark
    };
    
    res.json({
      success: true,
      data: formattedData
    });
    
  } catch (error) {
    console.error('❌ 获取客户详情失败:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * 创建客户 - 仅管理员
 */
router.post('/api/users', requireAdmin, async (req, res) => {
  // ... 创建客户逻辑 ...
  res.json({ success: true, message: '仅管理员可创建客户' });
});

/**
 * 更新客户 - 仅管理员
 */
router.put('/api/users/:id', requireAdmin, async (req, res) => {
  // ... 更新客户逻辑 ...
  res.json({ success: true, message: '仅管理员可更新客户' });
});

/**
 * 删除客户 - 仅管理员
 */
router.delete('/api/users/:id', requireAdmin, async (req, res) => {
  // ... 删除客户逻辑 ...
  res.json({ success: true, message: '仅管理员可删除客户' });
});

// ===== 订单管理 API =====

/**
 * 获取订单列表
 * 管理员: 查看所有订单
 * 代理: 只能查看自己客户的订单
 * 客户: 只能查看自己的订单
 */
router.get('/api/orders', async (req, res) => {
  try {
    const { userId, userType } = req.user;
    const { page = 1, limit = 20, status } = req.query;
    
    let whereCondition = {};
    
    // 根据角色过滤数据
    if (userType === 'agent') {
      // 代理: 查询该代理下所有客户的订单
      const customers = await User.findAll({
        where: { agent_id: userId },
        attributes: ['id']
      });
      const customerIds = customers.map(c => c.id);
      whereCondition.customer_id = { [Op.in]: customerIds };
      console.log(`🔒 代理权限过滤: 客户IDs = [${customerIds.join(', ')}]`);
      
    } else if (userType === 'customer') {
      // 客户: 只能查看自己的订单
      whereCondition.customer_id = userId;
      console.log(`🔒 客户权限过滤: customer_id = ${userId}`);
    }
    // 管理员: 不添加过滤条件
    
    // 订单状态过滤
    if (status) {
      whereCondition.status = status;
    }
    
    const { count, rows } = await Order.findAndCountAll({
      where: whereCondition,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
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
    console.error('❌ 获取订单列表失败:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * 审核订单 - 仅代理和管理员
 */
router.post('/api/orders/:id/review', requireAgentOrAdmin, async (req, res) => {
  try {
    const { userId, userType } = req.user;
    const { id } = req.params;
    const { action, rejectReason } = req.body; // action: 'approve' | 'reject'
    
    const order = await Order.findByPk(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }
    
    // 验证订单状态
    if (order.status !== 'reviewing') {
      return res.status(400).json({
        success: false,
        message: '订单状态不是审核中,无法审核'
      });
    }
    
    // 代理权限验证: 只能审核自己客户的订单
    if (userType === 'agent') {
      const customer = await User.findByPk(order.customer_id);
      if (!customer || customer.agent_id !== userId) {
        return res.status(403).json({
          success: false,
          message: '权限不足: 您只能审核自己客户的订单'
        });
      }
    }
    
    // 执行审核
    if (action === 'approve') {
      order.status = 'completed';
      order.delivery_status = 'pending';
      order.approve_time = Date.now();
      await order.save();
      
      console.log(`✅ 订单审核通过: ${order.order_no}, 审核人: ${userType} ${userId}`);
      
      res.json({
        success: true,
        message: '订单审核通过'
      });
      
    } else if (action === 'reject') {
      if (!rejectReason) {
        return res.status(400).json({
          success: false,
          message: '拒绝审核必须填写原因'
        });
      }
      
      order.status = 'cancelled';
      order.reject_reason = rejectReason;
      order.reject_time = Date.now();
      await order.save();
      
      console.log(`❌ 订单审核拒绝: ${order.order_no}, 原因: ${rejectReason}`);
      
      res.json({
        success: true,
        message: '订单已拒绝'
      });
      
    } else {
      return res.status(400).json({
        success: false,
        message: '无效的审核操作'
      });
    }
    
  } catch (error) {
    console.error('❌ 审核订单失败:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * 订单发货 - 仅代理和管理员
 */
router.post('/api/orders/:id/delivery', requireAgentOrAdmin, async (req, res) => {
  try {
    const { userId, userType } = req.user;
    const { id } = req.params;
    const { deliveryMethod, deliveryAddress, remark } = req.body;
    
    const order = await Order.findByPk(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }
    
    // 验证订单状态
    if (order.status !== 'completed' || order.delivery_status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: '订单状态不符合发货条件'
      });
    }
    
    // 代理权限验证
    if (userType === 'agent') {
      const customer = await User.findByPk(order.customer_id);
      if (!customer || customer.agent_id !== userId) {
        return res.status(403).json({
          success: false,
          message: '权限不足: 您只能发货自己客户的订单'
        });
      }
    }
    
    // 执行发货
    order.delivery_status = 'delivered';
    order.delivery_method = deliveryMethod;
    order.delivery_address = deliveryAddress;
    order.delivery_remark = remark;
    order.delivery_time = Date.now();
    await order.save();
    
    console.log(`📦 订单发货成功: ${order.order_no}, 发货人: ${userType} ${userId}`);
    
    res.json({
      success: true,
      message: '发货成功'
    });
    
  } catch (error) {
    console.error('❌ 订单发货失败:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ===== 数据反馈 API =====

/**
 * 获取反馈列表
 * 管理员: 查看所有反馈
 * 代理: 只能查看自己客户的反馈
 * 客户: 只能查看自己的反馈
 */
router.get('/api/feedbacks', async (req, res) => {
  try {
    const { userId, userType } = req.user;
    const { page = 1, limit = 20 } = req.query;
    
    let whereCondition = {};
    
    if (userType === 'agent') {
      // 代理: 查询该代理下所有客户的反馈
      const customers = await User.findAll({
        where: { agent_id: userId },
        attributes: ['id']
      });
      const customerIds = customers.map(c => c.id);
      whereCondition.customer_id = { [Op.in]: customerIds };
      
    } else if (userType === 'customer') {
      // 客户: 只能查看自己的反馈
      whereCondition.customer_id = userId;
    }
    
    const { count, rows } = await Feedback.findAndCountAll({
      where: whereCondition,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['create_time', 'DESC']]
    });
    
    res.json({
      success: true,
      data: rows,
      total: count
    });
    
  } catch (error) {
    console.error('❌ 获取反馈列表失败:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * 编辑反馈 - 代理、客户、管理员都可以
 * 但代理只能编辑自己客户的反馈
 */
router.put('/api/feedbacks/:id', async (req, res) => {
  try {
    const { userId, userType } = req.user;
    const { id } = req.params;
    
    const feedback = await Feedback.findByPk(id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: '反馈不存在'
      });
    }
    
    // 权限验证
    if (userType === 'agent') {
      // 代理: 验证是否为自己的客户
      const customer = await User.findByPk(feedback.customer_id);
      if (!customer || customer.agent_id !== userId) {
        return res.status(403).json({
          success: false,
          message: '权限不足: 您只能编辑自己客户的反馈'
        });
      }
    } else if (userType === 'customer') {
      // 客户: 只能编辑自己的反馈
      if (feedback.customer_id !== userId) {
        return res.status(403).json({
          success: false,
          message: '权限不足: 您只能编辑自己的反馈'
        });
      }
    }
    
    // 更新反馈
    await feedback.update(req.body);
    
    res.json({
      success: true,
      message: '反馈更新成功',
      data: feedback
    });
    
  } catch (error) {
    console.error('❌ 更新反馈失败:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ===== 操作日志记录 =====

/**
 * 记录操作日志
 */
const logOperation = async (req, operation, details) => {
  const { userId, userType, userName } = req.user;
  
  console.log(`📋 操作日志: [${userType}] ${userName} (ID: ${userId}) - ${operation}`);
  console.log(`   详情:`, details);
  
  // 这里可以将日志写入数据库
  // await OperationLog.create({
  //   user_id: userId,
  //   user_type: userType,
  //   operation,
  //   details: JSON.stringify(details),
  //   ip_address: req.ip,
  //   create_time: Date.now()
  // });
};

// ===== 使用示例 =====

/**
 * 示例: 在审核订单时记录日志
 */
router.post('/api/orders/:id/review-with-log', requireAgentOrAdmin, async (req, res) => {
  try {
    // ... 审核逻辑 ...
    
    // 记录操作日志
    await logOperation(req, '审核订单', {
      orderId: req.params.id,
      action: req.body.action,
      rejectReason: req.body.rejectReason
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

/**
 * ===== 实施步骤 =====
 * 
 * 1. 在现有路由文件中引入权限验证中间件:
 *    const { requireAdmin, requireAgentOrAdmin, verifyCustomerAccess } = require('./middleware/auth');
 * 
 * 2. 为需要权限控制的路由添加中间件:
 *    router.get('/api/users', requireAgentOrAdmin, async (req, res) => { ... });
 * 
 * 3. 在查询数据时添加权限过滤:
 *    if (userType === 'agent') {
 *      whereCondition.agent_id = userId;
 *    }
 * 
 * 4. 测试验证:
 *    - 使用代理账号登录
 *    - 尝试访问各个API
 *    - 验证只能获取自己的客户数据
 * 
 * 5. 添加操作日志:
 *    - 记录所有敏感操作
 *    - 包括审核、发货、编辑等
 * 
 * ===== 注意事项 =====
 * 
 * 1. 前后端双重验证:
 *    - 前端控制UI显示
 *    - 后端验证实际权限
 * 
 * 2. 数据过滤一定要在后端实现:
 *    - 不能依赖前端过滤
 *    - 防止API被绕过
 * 
 * 3. 所有修改操作都要验证权限:
 *    - 创建、更新、删除
 *    - 审核、发货等业务操作
 * 
 * 4. 错误信息要明确:
 *    - 404: 资源不存在
 *    - 403: 权限不足
 *    - 400: 请求参数错误
 */
