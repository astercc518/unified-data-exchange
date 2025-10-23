/**
 * 统计数据路由
 */
const express = require('express');
const router = express.Router();
const { models, sequelize } = require('../config/database');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const os = require('os');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const { User, Agent, DataLibrary, Order, RechargeRecord } = models;

// 导入 parsePhoneNumber 服务
let parsePhoneNumber;
try {
  const awesomePhoneNumber = require('awesome-phonenumber');
  parsePhoneNumber = awesomePhoneNumber.parsePhoneNumber;
} catch (error) {
  logger.warn('awesome-phonenumber 模块未安装');
  parsePhoneNumber = null;
}

// 获取系统统计数据
router.get('/system', async (req, res) => {
  try {
    // 统计各类数据总数
    const [userCount, agentCount, dataCount, orderCount, rechargeCount] = await Promise.all([
      User.count(),
      Agent.count(),
      DataLibrary.count(),
      Order.count(),
      RechargeRecord.count()
    ]);
    
    // 统计订单状态
    const orderStats = await Order.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });
    
    // 统计总金额
    const totalBalance = await User.sum('account_balance');
    const totalRecharge = await RechargeRecord.sum('amount');
    const totalOrderAmount = await Order.sum('total_amount');
    
    res.json({
      success: true,
      data: {
        counts: {
          users: userCount,
          agents: agentCount,
          dataLibrary: dataCount,
          orders: orderCount,
          recharges: rechargeCount
        },
        orderStats: orderStats.map(item => ({
          status: item.status,
          count: parseInt(item.getDataValue('count'))
        })),
        amounts: {
          totalBalance: parseFloat(totalBalance || 0),
          totalRecharge: parseFloat(totalRecharge || 0),
          totalOrderAmount: parseFloat(totalOrderAmount || 0)
        }
      }
    });
  } catch (error) {
    logger.error('获取统计数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取统计数据失败',
      error: error.message
    });
  }
});

// 获取数据统计（按时效性分类）
router.get('/data-library', async (req, res) => {
  try {
    const stats = await DataLibrary.findAll({
      attributes: [
        'validity',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('available_quantity')), 'total_quantity']
      ],
      group: ['validity']
    });
    
    res.json({
      success: true,
      data: stats.map(item => ({
        validity: item.validity,
        count: parseInt(item.getDataValue('count')),
        totalQuantity: parseInt(item.getDataValue('total_quantity') || 0)
      }))
    });
  } catch (error) {
    logger.error('获取数据统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取数据统计失败',
      error: error.message
    });
  }
});

// 获取订单统计（按时间范围）
router.get('/orders', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where = {};
    if (startDate && endDate) {
      where.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    const orders = await Order.findAll({
      where,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_amount']
      ],
      group: ['status']
    });
    
    res.json({
      success: true,
      data: orders.map(item => ({
        status: item.status,
        count: parseInt(item.getDataValue('count')),
        totalAmount: parseFloat(item.getDataValue('total_amount') || 0)
      }))
    });
  } catch (error) {
    logger.error('获取订单统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取订单统计失败',
      error: error.message
    });
  }
});

// 获取充值统计（按时间范围）
router.get('/recharge', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where = {};
    if (startDate && endDate) {
      where.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    const recharges = await RechargeRecord.findAll({
      where,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount']
      ],
      group: ['status']
    });
    
    res.json({
      success: true,
      data: recharges.map(item => ({
        status: item.status,
        count: parseInt(item.getDataValue('count')),
        totalAmount: parseFloat(item.getDataValue('total_amount') || 0)
      }))
    });
  } catch (error) {
    logger.error('获取充值统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取充值统计失败',
      error: error.message
    });
  }
});

// 获取资源中心统计数据（根据用户角色）
router.get('/resource-center/:userType/:userId', async (req, res) => {
  try {
    const { userType, userId } = req.params;
    
    let totalBalance = 0;
    let totalPurchased = 0;
    let totalSpent = 0;
    
    if (userType === 'admin') {
      // 管理员：显示所有客户的总额
      const allCustomers = await User.findAll({
        attributes: ['account_balance']
      });
      
      totalBalance = allCustomers.reduce((sum, customer) => 
        sum + parseFloat(customer.account_balance || 0), 0
      );
      
      const allOrders = await Order.findAll({
        attributes: ['quantity', 'total_amount']
      });
      
      totalPurchased = allOrders.reduce((sum, order) => 
        sum + parseInt(order.quantity || 0), 0
      );
      
      totalSpent = allOrders.reduce((sum, order) => 
        sum + parseFloat(order.total_amount || 0), 0
      );
      
    } else if (userType === 'agent') {
      // 代理：显示本代理下所有客户的总额
      const agentCustomers = await User.findAll({
        where: { agent_id: userId },
        attributes: ['id', 'account_balance']
      });
      
      totalBalance = agentCustomers.reduce((sum, customer) => 
        sum + parseFloat(customer.account_balance || 0), 0
      );
      
      const customerIds = agentCustomers.map(c => c.id);
      
      if (customerIds.length > 0) {
        const customerOrders = await Order.findAll({
          where: { customer_id: { [Op.in]: customerIds } },
          attributes: ['quantity', 'total_amount']
        });
        
        totalPurchased = customerOrders.reduce((sum, order) => 
          sum + parseInt(order.quantity || 0), 0
        );
        
        totalSpent = customerOrders.reduce((sum, order) => 
          sum + parseFloat(order.total_amount || 0), 0
        );
      }
      
    } else if (userType === 'customer') {
      // 客户：显示本客户的信息
      const customer = await User.findByPk(userId, {
        attributes: ['account_balance']
      });
      
      if (customer) {
        totalBalance = parseFloat(customer.account_balance || 0);
      }
      
      const customerOrders = await Order.findAll({
        where: { customer_id: userId },
        attributes: ['quantity', 'total_amount']
      });
      
      totalPurchased = customerOrders.reduce((sum, order) => 
        sum + parseInt(order.quantity || 0), 0
      );
      
      totalSpent = customerOrders.reduce((sum, order) => 
        sum + parseFloat(order.total_amount || 0), 0
      );
    }
    
    res.json({
      success: true,
      data: {
        totalBalance: totalBalance.toFixed(2),
        totalPurchased,
        totalSpent: totalSpent.toFixed(2)
      }
    });
    
  } catch (error) {
    logger.error('获取资源中心统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取资源中心统计失败',
      error: error.message
    });
  }
});

// 获取服务器状态信息
router.get('/server-status', async (req, res) => {
  try {
    // 获取系统内存信息
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsage = ((usedMemory / totalMemory) * 100).toFixed(2);
    
    // 获取 CPU 信息
    const cpus = os.cpus();
    const cpuModel = cpus[0].model;
    const cpuCores = cpus.length;
    
    // 获取系统运行时间
    const uptime = os.uptime();
    
    // 获取 PM2 进程信息
    let pm2Status = [];
    try {
      const { stdout } = await execPromise('pm2 jlist');
      const pm2List = JSON.parse(stdout);
      pm2Status = pm2List.map(proc => ({
        name: proc.name,
        status: proc.pm2_env.status,
        cpu: proc.monit.cpu,
        memory: proc.monit.memory,
        memoryMB: (proc.monit.memory / 1024 / 1024).toFixed(2),
        uptime: proc.pm2_env.pm_uptime,
        restarts: proc.pm2_env.restart_time
      }));
    } catch (error) {
      logger.warn('获取 PM2 状态失败:', error.message);
    }
    
    // 获取数据库连接状态
    let dbStatus = 'disconnected';
    try {
      await sequelize.authenticate();
      dbStatus = 'connected';
    } catch (error) {
      logger.error('数据库连接检查失败:', error);
    }
    
    res.json({
      success: true,
      data: {
        system: {
          totalMemory: (totalMemory / 1024 / 1024 / 1024).toFixed(2) + ' GB',
          freeMemory: (freeMemory / 1024 / 1024 / 1024).toFixed(2) + ' GB',
          usedMemory: (usedMemory / 1024 / 1024 / 1024).toFixed(2) + ' GB',
          memoryUsage: memoryUsage + '%',
          cpuModel,
          cpuCores,
          uptime: Math.floor(uptime / 3600) + ' 小时'
        },
        services: pm2Status,
        database: {
          status: dbStatus
        },
        parsePhone: {
          available: false,
          version: null,
          testResult: null,
          message: '请稍后刷新查看 parsePhoneNumber 服务状态',
          lastCheck: '-'
        }
      }
    });
  } catch (error) {
    logger.error('获取服务器状态失败:', error);
    res.status(500).json({
      success: false,
      message: '获取服务器状态失败',
      error: error.message
    });
  }
});

// 重启服务
router.post('/restart-service', async (req, res) => {
  try {
    const { serviceName } = req.body;
    
    if (!serviceName) {
      return res.status(400).json({
        success: false,
        message: '请指定要重启的服务名称'
      });
    }
    
    // 验证服务名称
    const validServices = ['backend', 'frontend', 'all'];
    if (!validServices.includes(serviceName)) {
      return res.status(400).json({
        success: false,
        message: '无效的服务名称'
      });
    }
    
    logger.info(`正在重启服务: ${serviceName}`);
    
    // 执行 PM2 重启命令
    const command = serviceName === 'all' 
      ? 'pm2 restart all' 
      : `pm2 restart ${serviceName}`;
    
    await execPromise(command);
    
    logger.info(`服务重启成功: ${serviceName}`);
    
    res.json({
      success: true,
      message: `服务 ${serviceName} 重启成功`
    });
  } catch (error) {
    logger.error('重启服务失败:', error);
    res.status(500).json({
      success: false,
      message: '重启服务失败',
      error: error.message
    });
  }
});

/**
 * 获取 parsePhoneNumber 服务状态
 * GET /api/stats/parsephon e-status
 */
router.get('/parsephone-status', async (req, res) => {
  try {
    const status = {
      available: false,
      version: null,
      testResult: null,
      message: '',
      lastCheck: new Date().toISOString()
    };

    // 检查模块是否可用
    if (!parsePhoneNumber) {
      status.message = 'awesome-phonenumber 模块未安装';
      return res.json({
        success: true,
        data: status
      });
    }

    // 获取版本信息
    try {
      const packageJson = require('awesome-phonenumber/package.json');
      status.version = packageJson.version;
    } catch (error) {
      logger.warn('无法获取 awesome-phonenumber 版本信息');
    }

    // 执行测试验证
    const testNumbers = [
      { number: '+12025551234', regionCode: 'US', name: '美国' },
      { number: '+528661302532', regionCode: 'MX', name: '墨西哥' },
      { number: '+8613800138000', regionCode: 'CN', name: '中国' }
    ];

    const testResults = [];
    let successCount = 0;

    for (const test of testNumbers) {
      try {
        const pn = parsePhoneNumber(test.number);
        const isValid = pn.valid && pn.regionCode === test.regionCode;
        
        if (isValid) successCount++;
        
        testResults.push({
          country: test.name,
          number: test.number,
          valid: isValid,
          parsedRegion: pn.regionCode,
          expectedRegion: test.regionCode
        });
      } catch (error) {
        testResults.push({
          country: test.name,
          number: test.number,
          valid: false,
          error: error.message
        });
      }
    }

    status.available = successCount === testNumbers.length;
    status.testResult = {
      total: testNumbers.length,
      success: successCount,
      failed: testNumbers.length - successCount,
      details: testResults
    };
    status.message = status.available 
      ? 'parsePhoneNumber 服务运行正常' 
      : `部分测试失败（${successCount}/${testNumbers.length}）`;

    logger.info(`parsePhoneNumber 状态检查: ${status.message}`);

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('parsePhoneNumber 状态检查失败:', error);
    res.status(500).json({
      success: false,
      message: 'parsePhoneNumber 状态检查失败',
      error: error.message
    });
  }
});

module.exports = router;