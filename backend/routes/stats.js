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
const { cacheMiddleware } = require('../config/redis');  // Redis 缓存中间件

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

// 获取系统统计数据 (缓存 5 分钟)
router.get('/system', cacheMiddleware(300), async (req, res) => {
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

// 获取数据统计 (缓存 10 分钟)
router.get('/data-library', cacheMiddleware(600), async (req, res) => {
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

// 获取服务器状态信息 (缓存 30 秒)
router.get('/server-status', cacheMiddleware(30), async (req, res) => {
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
    
    // 获取 Redis 状态
    let redisStatus = {
      status: 'disconnected',
      version: '-',
      usedMemory: '-',
      connectedClients: 0,
      uptimeInDays: 0
    };
    try {
      const redis = require('../config/redis').redisClient;
      if (redis && redis.status === 'ready') {
        const info = await redis.info();
        const lines = info.split('\r\n');
        const redisInfo = {};
        lines.forEach(line => {
          const parts = line.split(':');
          if (parts.length === 2) {
            redisInfo[parts[0]] = parts[1];
          }
        });
        
        redisStatus = {
          status: 'connected',
          version: redisInfo.redis_version || '-',
          usedMemory: redisInfo.used_memory_human || '-',
          connectedClients: parseInt(redisInfo.connected_clients) || 0,
          uptimeInDays: parseInt(redisInfo.uptime_in_days) || 0
        };
      }
    } catch (error) {
      logger.warn('获取 Redis 状态失败:', error.message);
    }
    
    // 获取 Nginx 状态
    let nginxStatus = {
      status: 'unknown',
      version: '-',
      active: false
    };
    try {
      const { stdout: nginxVersion } = await execPromise('nginx -v 2>&1');
      const versionMatch = nginxVersion.match(/nginx\/(\S+)/);
      nginxStatus.version = versionMatch ? versionMatch[1] : '-';
      
      const { stdout: nginxService } = await execPromise('systemctl is-active nginx');
      nginxStatus.active = nginxService.trim() === 'active';
      nginxStatus.status = nginxStatus.active ? 'running' : 'stopped';
    } catch (error) {
      logger.warn('获取 Nginx 状态失败:', error.message);
    }
    
    // 获取 Prometheus 状态
    let prometheusStatus = {
      status: 'unknown',
      metricsAvailable: false,
      endpoint: 'http://localhost:3000/metrics'
    };
    try {
      const http = require('http');
      await new Promise((resolve, reject) => {
        const req = http.get('http://localhost:3000/metrics', (res) => {
          if (res.statusCode === 200) {
            prometheusStatus.status = 'running';
            prometheusStatus.metricsAvailable = true;
          }
          resolve();
        });
        req.on('error', reject);
        req.setTimeout(2000, () => {
          req.abort();
          reject(new Error('timeout'));
        });
      });
    } catch (error) {
      logger.warn('获取 Prometheus 状态失败:', error.message);
      prometheusStatus.status = 'unavailable';
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
        redis: redisStatus,
        nginx: nginxStatus,
        prometheus: prometheusStatus,
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
 * GET /api/stats/parsephone-status
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

/**
 * 获取备份列表
 * GET /api/stats/backups
 */
router.get('/backups', async (req, res) => {
  try {
    const fs = require('fs').promises;
    const path = require('path');
    const backupDir = '/home/vue-element-admin/backups/database';
    
    // 检查备份目录是否存在
    try {
      await fs.access(backupDir);
    } catch (error) {
      return res.json({
        success: true,
        data: {
          backups: [],
          totalSize: '0 MB',
          count: 0
        }
      });
    }
    
    // 读取备份文件
    const files = await fs.readdir(backupDir);
    const backupFiles = files.filter(f => f.endsWith('.sql.gz'));
    
    // 获取文件详细信息
    const backups = await Promise.all(
      backupFiles.map(async (file) => {
        const filePath = path.join(backupDir, file);
        const stats = await fs.stat(filePath);
        return {
          name: file,
          path: filePath,
          size: (stats.size / 1024 / 1024).toFixed(2) + ' MB',
          sizeBytes: stats.size,
          createdAt: stats.mtime,
          formattedDate: new Date(stats.mtime).toLocaleString('zh-CN')
        };
      })
    );
    
    // 按时间排序（最新的在前）
    backups.sort((a, b) => b.createdAt - a.createdAt);
    
    // 计算总大小
    const totalSizeBytes = backups.reduce((sum, b) => sum + b.sizeBytes, 0);
    const totalSize = (totalSizeBytes / 1024 / 1024).toFixed(2) + ' MB';
    
    res.json({
      success: true,
      data: {
        backups,
        totalSize,
        count: backups.length
      }
    });
  } catch (error) {
    logger.error('获取备份列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取备份列表失败',
      error: error.message
    });
  }
});

/**
 * 创建新备份
 * POST /api/stats/backup/create
 */
router.post('/backup/create', async (req, res) => {
  try {
    logger.info('开始创建数据库备份...');
    
    const scriptPath = '/home/vue-element-admin/scripts/backup-database.sh';
    const { stdout, stderr } = await execPromise(`bash ${scriptPath}`);
    
    logger.info('备份脚本输出:', stdout);
    if (stderr) {
      logger.warn('备份脚本警告:', stderr);
    }
    
    res.json({
      success: true,
      message: '备份创建成功',
      output: stdout
    });
  } catch (error) {
    logger.error('创建备份失败:', error);
    res.status(500).json({
      success: false,
      message: '创建备份失败',
      error: error.message
    });
  }
});

/**
 * 删除备份
 * DELETE /api/stats/backup/:filename
 */
router.delete('/backup/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const fs = require('fs').promises;
    const path = require('path');
    
    // 安全检查：只允许删除 .sql.gz 文件
    if (!filename.endsWith('.sql.gz')) {
      return res.status(400).json({
        success: false,
        message: '无效的文件名'
      });
    }
    
    const backupDir = '/home/vue-element-admin/backups/database';
    const filePath = path.join(backupDir, filename);
    
    // 检查文件是否存在
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: '备份文件不存在'
      });
    }
    
    // 删除文件
    await fs.unlink(filePath);
    
    logger.info(`删除备份文件: ${filename}`);
    
    res.json({
      success: true,
      message: '备份删除成功'
    });
  } catch (error) {
    logger.error('删除备份失败:', error);
    res.status(500).json({
      success: false,
      message: '删除备份失败',
      error: error.message
    });
  }
});

/**
 * 下载备份
 * GET /api/stats/backup/download/:filename
 */
router.get('/backup/download/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const path = require('path');
    
    // 安全检查
    if (!filename.endsWith('.sql.gz')) {
      return res.status(400).json({
        success: false,
        message: '无效的文件名'
      });
    }
    
    const backupDir = '/home/vue-element-admin/backups/database';
    const filePath = path.join(backupDir, filename);
    
    // 检查文件是否存在
    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: '备份文件不存在'
      });
    }
    
    // 设置下载头
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Type', 'application/gzip');
    
    // 发送文件
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    logger.info(`下载备份文件: ${filename}`);
  } catch (error) {
    logger.error('下载备份失败:', error);
    res.status(500).json({
      success: false,
      message: '下载备份失败',
      error: error.message
    });
  }
});

/**
 * 恢复备份
 * POST /api/stats/backup/restore
 */
router.post('/backup/restore', async (req, res) => {
  try {
    const { filename } = req.body;
    
    if (!filename) {
      return res.status(400).json({
        success: false,
        message: '请指定要恢复的备份文件'
      });
    }
    
    // 安全检查
    if (!filename.endsWith('.sql.gz')) {
      return res.status(400).json({
        success: false,
        message: '无效的备份文件格式'
      });
    }
    
    const fs = require('fs').promises;
    const path = require('path');
    const backupDir = '/home/vue-element-admin/backups/database';
    const filePath = path.join(backupDir, filename);
    
    // 检查文件是否存在
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: '备份文件不存在'
      });
    }
    
    logger.info(`开始恢夏数据库，使用备份: ${filename}`);
    
    // 执行恢复脚本（非交互模式）
    const scriptPath = '/home/vue-element-admin/scripts/restore-database.sh';
    const { stdout, stderr } = await execPromise(`echo "yes" | bash ${scriptPath} ${filename}`);
    
    logger.info('恢复脚本输出:', stdout);
    if (stderr) {
      logger.warn('恢复脚本警告:', stderr);
    }
    
    // 检查是否成功
    if (stdout.includes('数据库恢复完成')) {
      res.json({
        success: true,
        message: '数据库恢复成功，建议重启后端服务',
        output: stdout
      });
    } else {
      res.status(500).json({
        success: false,
        message: '数据库恢复失败',
        output: stdout,
        error: stderr
      });
    }
  } catch (error) {
    logger.error('恢复备份失败:', error);
    res.status(500).json({
      success: false,
      message: '恢复备份失败',
      error: error.message
    });
  }
});

module.exports = router;