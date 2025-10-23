/**
 * 操作日志工具
 * 记录用户在系统中的所有重要操作
 */
const { models } = require('../config/database');
const logger = require('./logger');

const { OperationLog } = models;

/**
 * 记录操作日志到数据库
 * @param {Object} options 日志选项
 * @param {string} options.type 日志类型: login/operation
 * @param {string} options.operator 操作人
 * @param {string} options.operatorType 操作人类型: admin/agent/customer/unknown
 * @param {string} options.action 操作动作
 * @param {string} options.description 操作描述
 * @param {Object} options.req Express request 对象 (可选)
 * @param {string} options.ipAddress IP地址 (可选)
 * @param {string} options.userAgent 用户代理 (可选)
 * @param {string} options.status 状态: success/failed
 * @returns {Promise<void>}
 */
async function logOperation(options) {
  try {
    const {
      type = 'operation',
      operator,
      operatorType,
      action,
      description,
      req,
      ipAddress,
      userAgent,
      status = 'success'
    } = options;

    // 从request对象中提取IP和User-Agent(如果提供)
    const ip = ipAddress || (req ? (req.ip || req.connection?.remoteAddress) : null);
    const ua = userAgent || (req ? req.get('user-agent') : null);

    // 创建操作日志记录
    await OperationLog.create({
      type,
      operator: operator || (req?.user?.userName) || 'unknown',
      operator_type: operatorType || (req?.user?.userType) || 'unknown',
      action,
      description,
      ip_address: ip,
      user_agent: ua,
      status,
      create_time: Date.now()
    });

    // 同时写入文件日志
    logger.info(`📋 操作日志: [${operatorType}] ${operator} - ${action} - ${status}`);
  } catch (error) {
    // 日志记录失败不应影响主业务
    logger.error('记录操作日志失败:', error);
  }
}

/**
 * Express中间件: 自动记录操作日志
 * @param {string} action 操作动作描述
 * @param {Object} options 可选配置
 * @param {string} options.type 日志类型,默认'operation'
 * @param {Function} options.getDescription 动态生成描述的函数
 * @returns {Function} Express中间件
 */
function logOperationMiddleware(action, options = {}) {
  return async (req, res, next) => {
    // 保存原始的res.json方法
    const originalJson = res.json.bind(res);
    
    // 重写res.json方法以在响应后记录日志
    res.json = function(data) {
      // 判断操作是否成功
      const success = data && (data.success !== false);
      const status = success ? 'success' : 'failed';
      
      // 生成描述
      let description = action;
      if (options.getDescription && typeof options.getDescription === 'function') {
        try {
          description = options.getDescription(req, data) || action;
        } catch (err) {
          description = action;
        }
      }
      
      // 异步记录日志(不阻塞响应)
      logOperation({
        type: options.type || 'operation',
        operator: req.user?.userName || req.user?.loginAccount || 'unknown',
        operatorType: req.user?.userType || 'unknown',
        action,
        description,
        req,
        status
      }).catch(err => {
        logger.error('中间件记录日志失败:', err);
      });
      
      // 调用原始的res.json
      return originalJson(data);
    };
    
    next();
  };
}

/**
 * 快捷方法: 记录用户管理操作
 */
async function logUserOperation(action, req, userId, userName) {
  return logOperation({
    type: 'operation',
    operator: req.user?.userName || req.user?.loginAccount,
    operatorType: req.user?.userType,
    action: `用户管理 - ${action}`,
    description: `${action}用户: ${userName} (ID: ${userId})`,
    req,
    status: 'success'
  });
}

/**
 * 快捷方法: 记录数据管理操作
 */
async function logDataOperation(action, req, dataId, dataInfo) {
  const desc = dataInfo ? 
    `${action}数据: ${dataInfo.country} - ${dataInfo.dataType} (ID: ${dataId})` :
    `${action}数据 (ID: ${dataId})`;
    
  return logOperation({
    type: 'operation',
    operator: req.user?.userName || req.user?.loginAccount,
    operatorType: req.user?.userType,
    action: `数据管理 - ${action}`,
    description: desc,
    req,
    status: 'success'
  });
}

/**
 * 快捷方法: 记录订单操作
 */
async function logOrderOperation(action, req, orderId, orderNo) {
  return logOperation({
    type: 'operation',
    operator: req.user?.userName || req.user?.loginAccount,
    operatorType: req.user?.userType,
    action: `订单管理 - ${action}`,
    description: `${action}订单: ${orderNo} (ID: ${orderId})`,
    req,
    status: 'success'
  });
}

/**
 * 快捷方法: 记录系统配置操作
 */
async function logSystemOperation(action, req, detail) {
  return logOperation({
    type: 'operation',
    operator: req.user?.userName || req.user?.loginAccount,
    operatorType: req.user?.userType,
    action: `系统管理 - ${action}`,
    description: detail || action,
    req,
    status: 'success'
  });
}

module.exports = {
  logOperation,
  logOperationMiddleware,
  logUserOperation,
  logDataOperation,
  logOrderOperation,
  logSystemOperation
};
