/**
 * 身份认证和权限验证中间件
 */
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const { models } = require('../config/database');

const { User, Agent } = models;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Token验证中间件
 * 从请求头或URL查询参数中提取token并验证,将用户信息注入req.user
 */
const authenticateToken = async (req, res, next) => {
  try {
    // 优先从请求头获取token
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    // 如果请求头中没有token，尝试从URL查询参数中获取
    if (!token && req.query.token) {
      token = req.query.token;
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
    }
    
    // 验证token
    const decoded = jwt.verify(token, JWT_SECRET);
    const { userId, userType } = decoded;
    
    // 获取用户信息
    let user;
    if (userType === 'agent' || userType === 'admin') {
      user = await Agent.findByPk(userId);
    } else {
      user = await User.findByPk(userId);
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    // 将用户信息注入请求对象
    req.user = {
      userId,
      userType,
      loginAccount: userType === 'agent' || userType === 'admin' ? user.login_account : user.login_account,
      userName: userType === 'agent' || userType === 'admin' ? user.agent_name : user.customer_name,
      user  // 完整的用户对象
    };
    
    next();
  } catch (error) {
    logger.error('Token验证失败:', error);
    return res.status(403).json({
      success: false,
      message: '无效的认证令牌'
    });
  }
};

/**
 * 仅管理员可访问
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: '请先登录'
    });
  }
  
  if (req.user.userType !== 'admin') {
    logger.warn(`非管理员尝试访问管理员功能: ${req.user.userName} (${req.user.userType})`);
    return res.status(403).json({
      success: false,
      message: '权限不足: 仅管理员可访问'
    });
  }
  
  next();
};

/**
 * 代理或管理员可访问
 */
const requireAgentOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: '请先登录'
    });
  }
  
  if (req.user.userType !== 'agent' && req.user.userType !== 'admin') {
    logger.warn(`无权限用户尝试访问: ${req.user.userName} (${req.user.userType})`);
    return res.status(403).json({
      success: false,
      message: '权限不足: 仅代理或管理员可访问'
    });
  }
  
  next();
};

/**
 * 验证客户访问权限
 * 代理只能访问自己的客户
 * 管理员可以访问所有客户
 * 客户只能访问自己
 */
const verifyCustomerAccess = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: '请先登录'
    });
  }
  
  const customerId = parseInt(req.params.id || req.params.customerId || req.body.customer_id);
  
  // 管理员可以访问所有客户
  if (req.user.userType === 'admin') {
    return next();
  }
  
  // 代理只能访问自己的客户
  if (req.user.userType === 'agent') {
    const customer = await User.findByPk(customerId);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: '客户不存在'
      });
    }
    
    if (customer.agent_id !== req.user.userId) {
      logger.warn(`代理越权访问: ${req.user.userName} 尝试访问客户 ${customerId}`);
      return res.status(403).json({
        success: false,
        message: '权限不足: 您只能访问自己的客户'
      });
    }
    
    return next();
  }
  
  // 客户只能访问自己
  if (req.user.userType === 'customer') {
    if (customerId !== req.user.userId) {
      logger.warn(`客户越权访问: ${req.user.userName} 尝试访问客户 ${customerId}`);
      return res.status(403).json({
        success: false,
        message: '权限不足: 您只能访问自己的信息'
      });
    }
    return next();
  }
  
  return res.status(403).json({
    success: false,
    message: '权限不足'
  });
};

/**
 * 验证订单访问权限
 */
const verifyOrderAccess = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: '请先登录'
    });
  }
  
  const orderId = parseInt(req.params.id);
  const { Order } = models;
  
  const order = await Order.findByPk(orderId);
  
  if (!order) {
    return res.status(404).json({
      success: false,
      message: '订单不存在'
    });
  }
  
  // 管理员可以访问所有订单
  if (req.user.userType === 'admin') {
    req.order = order;  // 注入订单对象
    return next();
  }
  
  // 代理只能访问自己客户的订单
  if (req.user.userType === 'agent') {
    const customer = await User.findByPk(order.customer_id);
    
    if (!customer || customer.agent_id !== req.user.userId) {
      logger.warn(`代理越权访问订单: ${req.user.userName} 尝试访问订单 ${orderId}`);
      return res.status(403).json({
        success: false,
        message: '权限不足: 您只能访问自己客户的订单'
      });
    }
    
    req.order = order;
    return next();
  }
  
  // 客户只能访问自己的订单
  if (req.user.userType === 'customer') {
    if (order.customer_id !== req.user.userId) {
      logger.warn(`客户越权访问订单: ${req.user.userName} 尝试访问订单 ${orderId}`);
      return res.status(403).json({
        success: false,
        message: '权限不足: 您只能访问自己的订单'
      });
    }
    
    req.order = order;
    return next();
  }
  
  return res.status(403).json({
    success: false,
    message: '权限不足'
  });
};

/**
 * 操作日志记录中间件
 * @deprecated 请使用 utils/operationLogger.js 中的 logOperationMiddleware
 */
const logOperation = (operation) => {
  return (req, res, next) => {
    if (req.user) {
      logger.info(`📋 操作日志: [${req.user.userType}] ${req.user.userName} (ID: ${req.user.userId}) - ${operation}`);
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireAgentOrAdmin,
  verifyCustomerAccess,
  verifyOrderAccess,
  logOperation
};
