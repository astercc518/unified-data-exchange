/**
 * Vuex缓存辅助工具
 * 提供便捷的缓存操作方法
 */

import store from '@/store'

/**
 * 缓存键常量
 */
export const CACHE_KEYS = {
  // 用户相关
  USER_LIST: 'user_list',
  USER_DETAIL: 'user_detail_',

  // 代理相关
  AGENT_LIST: 'agent_list',
  AGENT_DETAIL: 'agent_detail_',

  // 订单相关
  ORDER_LIST: 'order_list',
  ORDER_STATISTICS: 'order_statistics',

  // 数据相关
  DATA_LIST: 'data_list',
  DATA_LIBRARY: 'data_library',

  // 充值相关
  RECHARGE_RECORDS: 'recharge_records',

  // 仪表盘相关
  DASHBOARD_STATS: 'dashboard_stats',
  DASHBOARD_CUSTOMER: 'dashboard_customer',
  DASHBOARD_AGENT: 'dashboard_agent'
}

/**
 * 缓存时长常量（毫秒）
 */
export const CACHE_DURATION = {
  SHORT: 2 * 60 * 1000, // 2分钟
  MEDIUM: 5 * 60 * 1000, // 5分钟
  LONG: 10 * 60 * 1000, // 10分钟
  VERY_LONG: 30 * 60 * 1000 // 30分钟
}

/**
 * 缓存管理器
 */
class CacheManager {
  /**
   * 获取缓存或从API获取数据
   * @param {string} key - 缓存键
   * @param {Function} fetchFunction - 获取数据的函数
   * @param {number} duration - 缓存时长（毫秒）
   * @param {boolean} forceRefresh - 是否强制刷新
   * @returns {Promise<any>} 数据
   */
  async get(key, fetchFunction, duration = CACHE_DURATION.MEDIUM, forceRefresh = false) {
    try {
      return await store.dispatch('cache/getCacheOrFetch', {
        key,
        fetchFunction,
        duration,
        forceRefresh
      })
    } catch (error) {
      console.error(`缓存获取失败 [${key}]:`, error)
      throw error
    }
  }

  /**
   * 设置缓存
   * @param {string} key - 缓存键
   * @param {any} data - 数据
   * @param {number} duration - 缓存时长（毫秒）
   */
  set(key, data, duration = CACHE_DURATION.MEDIUM) {
    store.dispatch('cache/setCache', { key, data, duration })
  }

  /**
   * 刷新缓存
   * @param {string} key - 缓存键
   * @param {Function} fetchFunction - 获取数据的函数
   * @param {number} duration - 缓存时长（毫秒）
   * @returns {Promise<any>} 数据
   */
  async refresh(key, fetchFunction, duration = CACHE_DURATION.MEDIUM) {
    try {
      return await store.dispatch('cache/refreshCache', {
        key,
        fetchFunction,
        duration
      })
    } catch (error) {
      console.error(`缓存刷新失败 [${key}]:`, error)
      throw error
    }
  }

  /**
   * 清除指定缓存
   * @param {string} key - 缓存键
   */
  clear(key) {
    store.dispatch('cache/clearCache', key)
  }

  /**
   * 清除所有缓存
   */
  clearAll() {
    store.dispatch('cache/clearAllCache')
  }

  /**
   * 清除过期缓存
   */
  clearExpired() {
    store.dispatch('cache/clearExpiredCache')
  }

  /**
   * 检查缓存是否有效
   * @param {string} key - 缓存键
   * @returns {boolean} 是否有效
   */
  isValid(key) {
    return store.getters['cache/isCacheValid'](key)
  }

  /**
   * 获取缓存数量
   * @returns {number} 缓存数量
   */
  getCount() {
    return store.getters['cache/cacheCount']
  }

  /**
   * 获取所有缓存键
   * @returns {string[]} 缓存键数组
   */
  getKeys() {
    return store.getters['cache/cacheKeys']
  }
}

// 创建单例
const cacheManager = new CacheManager()

// 自动清理过期缓存（每10分钟）
setInterval(() => {
  cacheManager.clearExpired()
  console.log('🧹 自动清理过期缓存完成')
}, 10 * 60 * 1000)

export default cacheManager
