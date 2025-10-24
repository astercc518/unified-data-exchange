/**
 * Redis 缓存配置
 * 用于缓存热点数据，提升系统性能
 */

const redis = require('redis');

// 导入 Prometheus 指标（避免循环依赖）
let metrics;
try {
  metrics = require('./metrics').metrics;
} catch (error) {
  // 如果 metrics 未初始化，忽略
  metrics = null;
}

// Redis 客户端配置
const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
  },
  // password: process.env.REDIS_PASSWORD, // 如果设置了密码
  database: 0,
  // 重连策略
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('Redis reconnection failed after 10 attempts');
        return new Error('Redis reconnection limit exceeded');
      }
      // 指数退避：等待时间逐渐增加
      return Math.min(retries * 100, 3000);
    }
  }
});

// 连接错误处理
redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redisClient.on('ready', () => {
  console.log('✅ Redis client ready');
});

// 连接 Redis
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error('❌ Failed to connect to Redis:', err);
  }
})();

/**
 * 缓存中间件工厂函数
 * @param {number} duration - 缓存持续时间（秒）
 * @param {function} keyGenerator - 自定义缓存键生成函数
 */
const cacheMiddleware = (duration = 300, keyGenerator = null) => {
  return async (req, res, next) => {
    // 如果 Redis 未连接，跳过缓存
    if (!redisClient.isOpen) {
      return next();
    }

    // 生成缓存键
    const cacheKey = keyGenerator 
      ? keyGenerator(req) 
      : `cache:${req.method}:${req.originalUrl}`;

    try {
      // 尝试从缓存获取数据
      const cachedData = await redisClient.get(cacheKey);
      
      if (cachedData) {
        console.log(`✅ Cache hit: ${cacheKey}`);
        // 记录缓存命中
        if (metrics && metrics.redisCacheHits) {
          metrics.redisCacheHits.inc();
        }
        return res.json(JSON.parse(cachedData));
      }

      console.log(`❌ Cache miss: ${cacheKey}`);
      // 记录缓存未命中
      if (metrics && metrics.redisCacheMisses) {
        metrics.redisCacheMisses.inc();
      }

      // 缓存未命中，拦截响应并缓存
      const originalJson = res.json.bind(res);
      res.json = (data) => {
        // 只缓存成功的响应
        if (res.statusCode === 200) {
          redisClient.setEx(cacheKey, duration, JSON.stringify(data))
            .catch(err => console.error('Redis set error:', err));
        }
        return originalJson(data);
      };

      next();
    } catch (err) {
      console.error('Cache middleware error:', err);
      next();
    }
  };
};

/**
 * 清除缓存
 * @param {string} pattern - 缓存键模式（支持通配符）
 */
const clearCache = async (pattern = '*') => {
  try {
    if (!redisClient.isOpen) {
      console.warn('Redis not connected, cannot clear cache');
      return;
    }

    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`✅ Cleared ${keys.length} cache entries matching "${pattern}"`);
    }
  } catch (err) {
    console.error('Clear cache error:', err);
  }
};

/**
 * 设置缓存
 * @param {string} key - 缓存键
 * @param {any} value - 缓存值
 * @param {number} duration - 过期时间（秒）
 */
const setCache = async (key, value, duration = 300) => {
  try {
    if (!redisClient.isOpen) return;
    await redisClient.setEx(key, duration, JSON.stringify(value));
  } catch (err) {
    console.error('Set cache error:', err);
  }
};

/**
 * 获取缓存
 * @param {string} key - 缓存键
 */
const getCache = async (key) => {
  try {
    if (!redisClient.isOpen) return null;
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Get cache error:', err);
    return null;
  }
};

module.exports = {
  redisClient,
  cacheMiddleware,
  clearCache,
  setCache,
  getCache
};
