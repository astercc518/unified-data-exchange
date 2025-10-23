/**
 * 认证路由
 */
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { models } = require('../config/database');
const logger = require('../utils/logger');

const { User, Agent, OperationLog } = models;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// 登录
router.post('/login', async (req, res) => {
  try {
    const { loginAccount, loginPassword, username, password } = req.body;
    
    // 兼容两种字段名
    const account = loginAccount || username;
    const pwd = loginPassword || password;
    
    if (!account || !pwd) {
      return res.status(400).json({
        success: false,
        message: '请输入用户名和密码'
      });
    }
    
    let user;
    let userType;
    
    // 优先检查是否是管理员或代理（admin账号只能是管理员）
    if (account === 'admin') {
      user = await Agent.findOne({
        where: { login_account: account, login_password: pwd, status: 1 }
      });
      if (user) {
        userType = 'admin';
      }
    } else {
      // 先检查代理
      user = await Agent.findOne({
        where: { login_account: account, login_password: pwd, status: 1 }
      });
      
      if (user) {
        userType = 'agent';
      } else {
        // 再检查客户
        user = await User.findOne({
          where: { login_account: account, login_password: pwd, status: 1 }
        });
        if (user) {
          userType = 'customer';
        }
      }
    }
    
    if (!user) {
      // 记录登录失败日志
      try {
        await OperationLog.create({
          type: 'login',
          operator: account,
          operator_type: 'unknown',
          action: '用户登录失败',
          description: '用户名或密码错误',
          ip_address: req.ip || req.connection.remoteAddress,
          user_agent: req.get('user-agent'),
          status: 'failed',
          create_time: Date.now()
        });
      } catch (logError) {
        logger.error('记录登录失败日志错误:', logError);
      }
      
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }
    
    // 生成JWT Token
    const token = jwt.sign(
      {
        userId: user.id,
        userType: userType,
        loginAccount: account
      },
      JWT_SECRET,
      { expiresIn: '24h' }  // Token有24小时有效
    );
    
    logger.info(`✅ 用户登录成功: ${account} (${userType})`);
    
    // 记录登录日志
    try {
      await OperationLog.create({
        type: 'login',
        operator: account,
        operator_type: userType,
        action: '用户登录',
        description: `${userType === 'admin' ? '管理员' : (userType === 'agent' ? '代理' : '客户')}登录系统`,
        ip_address: req.ip || req.connection.remoteAddress,
        user_agent: req.get('user-agent'),
        status: 'success',
        create_time: Date.now()
      });
    } catch (logError) {
      logger.error('记录登录日志失败:', logError);
      // 日志记录失败不影响登录
    }
    
    res.json({
      success: true,
      data: {
        token,
        userInfo: {
          id: user.id,
          name: userType === 'customer' ? user.customer_name : user.agent_name,
          type: userType
        }
      }
    });
  } catch (error) {
    logger.error('登录失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 用户信息缓存（内存缓存，10分钟过期）
const userInfoCache = new Map();
const CACHE_EXPIRY = 10 * 60 * 1000; // 10分钟

// 获取用户信息
router.get('/info', async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token不能为空'
      });
    }
    
    // 检查缓存
    const cached = userInfoCache.get(token);
    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
      return res.json({
        success: true,
        data: cached.data
      });
    }
    
    // 验证JWT Token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      logger.warn(`Token验证失败: ${error.message}`);
      userInfoCache.delete(token); // 清除无效token的缓存
      return res.status(401).json({
        success: false,
        message: 'Token无效或已过期'
      });
    }
    
    const { userId, userType } = decoded;
    
    let user;
    let roles = [];
    let name = '';
    
    if (userType === 'agent' || userType === 'admin') {
      user = await Agent.findByPk(userId, {
        attributes: ['id', 'agent_name', 'login_account', 'email'] // 只查询需要的字段
      });
      if (user) {
        name = user.agent_name;
        roles = userType === 'admin' ? ['admin'] : ['agent'];
      }
    } else {
      user = await User.findByPk(userId, {
        attributes: ['id', 'customer_name', 'login_account', 'email'] // 只查询需要的字段
      });
      if (user) {
        name = user.customer_name;
        roles = ['customer'];
      }
    }
    
    if (!user) {
      userInfoCache.delete(token); // 清除无效用户的缓存
      return res.status(401).json({
        success: false,
        message: '用户不存在或已被删除'
      });
    }
    
    const userData = {
      id: user.id,
      type: userType,
      roles,
      name,
      loginAccount: user.login_account,
      customerName: userType === 'customer' ? user.customer_name : undefined,
      agentName: (userType === 'agent' || userType === 'admin') ? user.agent_name : undefined,
      email: user.email,
      avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
      introduction: userType === 'admin' ? '超级管理员' : (userType === 'agent' ? '销售代理' : '普通客户')
    };
    
    // 更新缓存
    userInfoCache.set(token, {
      data: userData,
      timestamp: Date.now()
    });
    
    // 定期清理过期缓存（每30分钟）
    if (!router.cacheCleanupInterval) {
      router.cacheCleanupInterval = setInterval(() => {
        const now = Date.now();
        for (const [key, value] of userInfoCache.entries()) {
          if (now - value.timestamp > CACHE_EXPIRY) {
            userInfoCache.delete(key);
          }
        }
      }, 30 * 60 * 1000);
    }
    
    res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    logger.error('获取用户信息失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 登出
router.post('/logout', async (req, res) => {
  try {
    // 获取token信息
    const token = req.headers.authorization?.replace('Bearer ', '') || req.body.token || req.query.token;
    
    if (token) {
      // 清除缓存
      userInfoCache.delete(token);
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const { userId, userType, loginAccount } = decoded;
        
        // 记录登出日志
        await OperationLog.create({
          type: 'login',
          operator: loginAccount || 'unknown',
          operator_type: userType || 'unknown',
          action: '用户登出',
          description: `${userType === 'admin' ? '管理员' : (userType === 'agent' ? '代理' : '客户')}登出系统`,
          ip_address: req.ip || req.connection.remoteAddress,
          user_agent: req.get('user-agent'),
          status: 'success',
          create_time: Date.now()
        });
        
        logger.info(`✅ 用户登出: ${loginAccount} (${userType})`);
      } catch (error) {
        // Token无效也允许登出
        logger.warn('登出时Token解析失败:', error.message);
      }
    }
    
    res.json({
      success: true,
      message: '登出成功'
    });
  } catch (error) {
    logger.error('登出失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 修改密码
router.post('/change-password', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token不能为空'
      });
    }
    
    // 验证JWT Token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token无效或已过期'
      });
    }
    
    const { userId, userType, loginAccount } = decoded;
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: '请输入原密码和新密码'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: '新密码长度不能少于6位'
      });
    }
    
    // 查找用户并验证原密码
    let user;
    if (userType === 'agent' || userType === 'admin') {
      user = await Agent.findByPk(userId);
    } else {
      user = await User.findByPk(userId);
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    // 验证原密码
    if (user.login_password !== oldPassword) {
      // 记录密码修改失败日志
      await OperationLog.create({
        type: 'security',
        operator: loginAccount,
        operator_type: userType,
        action: '修改密码失败',
        description: '原密码错误',
        ip_address: req.ip || req.connection.remoteAddress,
        user_agent: req.get('user-agent'),
        status: 'failed',
        create_time: Date.now()
      });
      
      return res.status(400).json({
        success: false,
        message: '原密码错误'
      });
    }
    
    // 更新密码
    user.login_password = newPassword;
    await user.save();
    
    // 清除缓存
    userInfoCache.delete(token);
    
    // 记录密码修改成功日志
    await OperationLog.create({
      type: 'security',
      operator: loginAccount,
      operator_type: userType,
      action: '修改密码',
      description: `${userType === 'admin' ? '管理员' : (userType === 'agent' ? '代理' : '客户')}修改登录密码`,
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.get('user-agent'),
      status: 'success',
      create_time: Date.now()
    });
    
    logger.info(`✅ 用户修改密码成功: ${loginAccount} (${userType})`);
    
    res.json({
      success: true,
      message: '密码修改成功'
    });
  } catch (error) {
    logger.error('修改密码失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;