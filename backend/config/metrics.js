/**
 * Prometheus 指标监控配置
 * 导出应用性能和业务指标
 */

const promClient = require('prom-client');

// 创建指标注册表
const register = new promClient.Registry();

// 启用默认指标收集（内存、CPU、事件循环延迟等）
promClient.collectDefaultMetrics({ 
  register,
  prefix: 'ude_backend_'
});

// === 业务指标 ===

// HTTP 请求总数
const httpRequestsTotal = new promClient.Counter({
  name: 'ude_backend_http_requests_total',
  help: 'HTTP 请求总数',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

// HTTP 请求持续时间
const httpRequestDuration = new promClient.Histogram({
  name: 'ude_backend_http_request_duration_seconds',
  help: 'HTTP 请求持续时间（秒）',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
  registers: [register]
});

// 数据库查询总数
const dbQueriesTotal = new promClient.Counter({
  name: 'ude_backend_db_queries_total',
  help: '数据库查询总数',
  labelNames: ['operation', 'table'],
  registers: [register]
});

// 数据库查询持续时间
const dbQueryDuration = new promClient.Histogram({
  name: 'ude_backend_db_query_duration_seconds',
  help: '数据库查询持续时间（秒）',
  labelNames: ['operation', 'table'],
  buckets: [0.001, 0.01, 0.05, 0.1, 0.5, 1, 2],
  registers: [register]
});

// Redis 缓存命中率
const redisCacheHits = new promClient.Counter({
  name: 'ude_backend_redis_cache_hits_total',
  help: 'Redis 缓存命中次数',
  registers: [register]
});

const redisCacheMisses = new promClient.Counter({
  name: 'ude_backend_redis_cache_misses_total',
  help: 'Redis 缓存未命中次数',
  registers: [register]
});

// 订单相关指标
const ordersTotal = new promClient.Gauge({
  name: 'ude_backend_orders_total',
  help: '订单总数',
  labelNames: ['status'],
  registers: [register]
});

const orderAmount = new promClient.Gauge({
  name: 'ude_backend_order_amount',
  help: '订单总金额',
  labelNames: ['status'],
  registers: [register]
});

// 用户相关指标
const usersTotal = new promClient.Gauge({
  name: 'ude_backend_users_total',
  help: '用户总数',
  labelNames: ['role'],
  registers: [register]
});

// 充值相关指标
const rechargeAmount = new promClient.Gauge({
  name: 'ude_backend_recharge_amount',
  help: '充值总金额',
  labelNames: ['status'],
  registers: [register]
});

// 数据库连接池状态
const dbConnectionPoolSize = new promClient.Gauge({
  name: 'ude_backend_db_connection_pool_size',
  help: '数据库连接池大小',
  labelNames: ['state'],
  registers: [register]
});

// PM2 进程重启次数（需要从外部采集）
const pm2Restarts = new promClient.Gauge({
  name: 'ude_backend_pm2_restarts_total',
  help: 'PM2 进程重启总次数',
  labelNames: ['app_name'],
  registers: [register]
});

// === 中间件函数 ===

/**
 * HTTP 请求监控中间件
 */
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // 监听响应完成事件
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    
    // 记录请求总数
    httpRequestsTotal.labels(req.method, route, res.statusCode).inc();
    
    // 记录请求持续时间
    httpRequestDuration.labels(req.method, route, res.statusCode).observe(duration);
  });
  
  next();
};

/**
 * 数据库查询监控装饰器
 */
const monitorDbQuery = (operation, table) => {
  return (target, propertyName, descriptor) => {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args) {
      const start = Date.now();
      
      try {
        const result = await originalMethod.apply(this, args);
        const duration = (Date.now() - start) / 1000;
        
        // 记录查询指标
        dbQueriesTotal.labels(operation, table).inc();
        dbQueryDuration.labels(operation, table).observe(duration);
        
        return result;
      } catch (error) {
        const duration = (Date.now() - start) / 1000;
        dbQueriesTotal.labels(operation, table).inc();
        dbQueryDuration.labels(operation, table).observe(duration);
        throw error;
      }
    };
    
    return descriptor;
  };
};

/**
 * 更新业务指标
 */
const updateBusinessMetrics = async (models) => {
  try {
    const { User, Order, RechargeRecord } = models;
    const { Op } = require('sequelize');
    
    // 更新用户统计
    const userCounts = await User.findAll({
      attributes: [
        'role',
        [models.sequelize.fn('COUNT', models.sequelize.col('id')), 'count']
      ],
      group: ['role']
    });
    
    userCounts.forEach(item => {
      usersTotal.labels(item.role).set(parseInt(item.getDataValue('count')));
    });
    
    // 更新订单统计
    const orderStats = await Order.findAll({
      attributes: [
        'status',
        [models.sequelize.fn('COUNT', models.sequelize.col('id')), 'count'],
        [models.sequelize.fn('SUM', models.sequelize.col('total_amount')), 'amount']
      ],
      group: ['status']
    });
    
    orderStats.forEach(item => {
      ordersTotal.labels(item.status).set(parseInt(item.getDataValue('count')));
      orderAmount.labels(item.status).set(parseFloat(item.getDataValue('amount') || 0));
    });
    
    // 更新充值统计
    const rechargeStats = await RechargeRecord.findAll({
      attributes: [
        'status',
        [models.sequelize.fn('SUM', models.sequelize.col('amount')), 'amount']
      ],
      group: ['status']
    });
    
    rechargeStats.forEach(item => {
      rechargeAmount.labels(item.status).set(parseFloat(item.getDataValue('amount') || 0));
    });
    
  } catch (error) {
    console.error('更新业务指标失败:', error);
  }
};

module.exports = {
  register,
  metrics: {
    httpRequestsTotal,
    httpRequestDuration,
    dbQueriesTotal,
    dbQueryDuration,
    redisCacheHits,
    redisCacheMisses,
    ordersTotal,
    orderAmount,
    usersTotal,
    rechargeAmount,
    dbConnectionPoolSize,
    pm2Restarts
  },
  metricsMiddleware,
  monitorDbQuery,
  updateBusinessMetrics
};
