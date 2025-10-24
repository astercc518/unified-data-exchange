/**
 * Vue Element Admin Backend API Server
 * 提供完整的数据库API接口
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const { sequelize } = require('./config/database');
const logger = require('./utils/logger');
const { redisClient } = require('./config/redis');  // Redis 缓存
const { register, metricsMiddleware, updateBusinessMetrics } = require('./config/metrics');  // Prometheus 指标
const { startCleanupTask } = require('./tasks/cleanExpiredFiles');  // 定时清理任务
const { startSettlementTasks } = require('./tasks/settlementScheduler');  // 短信结算定时任务

// 导入路由
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const agentRoutes = require('./routes/agents');
const dataRoutes = require('./routes/data');
const orderRoutes = require('./routes/orders');
const rechargeRoutes = require('./routes/recharge');
const statsRoutes = require('./routes/stats');
const migrateRoutes = require('./routes/migrate');
const uploadRoutes = require('./routes/upload');
const favoriteRoutes = require('./routes/favorites');
const feedbackRoutes = require('./routes/feedbacks');  // 新增反馈路由
const systemLogsRoutes = require('./routes/system/logs');  // 系统日志路由
const systemSecurityRoutes = require('./routes/system/security');  // 系统安全路由
const systemNginxRoutes = require('./routes/system/nginx');  // Nginx 配置路由
const deliveryRoutes = require('./routes/delivery');  // 发货配置路由
const dataProcessingRoutes = require('./routes/dataProcessing');  // 数据处理路由
const usPhoneCarrierRoutes = require('./routes/usPhoneCarrier');  // 美国号码归属查询路由
const pricingTemplatesRoutes = require('./routes/pricingTemplates');  // 定价模板路由
const smsAdminRoutes = require('./routes/smsAdmin');  // 短信管理员路由
const smsCustomerRoutes = require('./routes/smsCustomer');  // 短信客户路由
const smsChannelCountriesRoutes = require('./routes/smsChannelCountries');  // 通道国家配置路由
const settlementsRoutes = require('./routes/settlements');  // 短信结算路由
const agentSettlementsRoutes = require('./routes/agentSettlements');  // 代理结算路由
const channelSettlementsRoutes = require('./routes/channelSettlements');  // 通道结算路由
const systemConfigRoutes = require('./routes/systemConfig');  // 系统配置路由

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(helmet());
app.use(cors({
  origin: '*',  // 允许所有来源，支持IP访问
  credentials: true
}));
app.use(compression());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) }}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Prometheus 指标监控中间件
app.use(metricsMiddleware);

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Prometheus 指标导出接口
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    logger.error('Metrics export error:', error);
    res.status(500).end(error);
  }
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/data-library', dataRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/recharge-records', rechargeRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/migrate', migrateRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/feedbacks', feedbackRoutes);  // 新增反馈路由
app.use('/api/system/logs', systemLogsRoutes);  // 系统日志路由
app.use('/api/system/security', systemSecurityRoutes);  // 系统安全路由
app.use('/api/system/nginx', systemNginxRoutes);  // Nginx 配置路由
app.use('/api/delivery', deliveryRoutes);  // 发货配置路由
app.use('/api/data-processing', dataProcessingRoutes);  // 数据处理路由
app.use('/api/us-phone-carrier', usPhoneCarrierRoutes);  // 美国号码归属查询路由
app.use('/api/pricing-templates', pricingTemplatesRoutes);  // 定价模板路由
app.use('/api/sms/admin', smsAdminRoutes);  // 短信管理员路由
app.use('/api/sms/customer', smsCustomerRoutes);  // 短信客户路由
app.use('/api/sms', smsChannelCountriesRoutes);  // 通道国家配置路由
app.use('/api/sms/settlements', settlementsRoutes);  // 短信结算路由
app.use('/api/sms/agent-settlements', agentSettlementsRoutes);  // 代理结算路由
app.use('/api/sms/channel-settlements', channelSettlementsRoutes);  // 通道结算路由
app.use('/api/system/config', systemConfigRoutes);  // 系统配置路由

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在',
    path: req.originalUrl
  });
});

// 错误处理中间件
app.use((error, req, res, next) => {
  logger.error('Server Error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || '服务器内部错误',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// 数据库连接和服务器启动
async function startServer() {
  try {
    // 测试数据库连接
    await sequelize.authenticate();
    logger.info('✅ 数据库连接成功');
    
    // 同步数据库模型（开发环境）
    // if (process.env.NODE_ENV === 'development') {
    //   await sequelize.sync({ alter: true });
    //   logger.info('📊 数据库模型同步完成');
    // }
    
    // 启动服务器
    app.listen(PORT, () => {
      logger.info(`🚀 服务器启动成功`);
      logger.info(`📍 服务地址: http://localhost:${PORT}`);
      logger.info(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`📱 API文档: http://localhost:${PORT}/api/docs`);
      logger.info(`📊 Prometheus 指标: http://localhost:${PORT}/metrics`);
      
      // 启动定时清理任务
      startCleanupTask();
      
      // 启动短信结算定时任务
      startSettlementTasks();
      
      // 定时更新业务指标（每分钟）
      const { models, sequelize } = require('./config/database');
      setInterval(() => updateBusinessMetrics({ ...models, sequelize }), 60000);
      updateBusinessMetrics({ ...models, sequelize });  // 立即执行一次
    });
    
  } catch (error) {
    logger.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGTERM', async () => {
  logger.info('收到 SIGTERM 信号，正在关闭服务器...');
  try {
    await sequelize.close();
    logger.info('数据库连接已关闭');
    process.exit(0);
  } catch (error) {
    logger.error('关闭数据库连接时出错:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  logger.info('收到 SIGINT 信号，正在关闭服务器...');
  try {
    await sequelize.close();
    logger.info('数据库连接已关闭');
    process.exit(0);
  } catch (error) {
    logger.error('关闭数据库连接时出错:', error);
    process.exit(1);
  }
});

// 未捕获的异常处理
process.on('uncaughtException', (error) => {
  logger.error('未捕获的异常:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的Promise拒绝:', reason);
  process.exit(1);
});

startServer();