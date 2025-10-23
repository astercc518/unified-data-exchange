/**
 * Vuex 缓存模块
 * 用于缓存API数据，提升性能，减少重复请求
 */

const state = {
  // 缓存数据存储
  cacheData: {},
  // 缓存时间戳
  cacheTimestamps: {},
  // 默认缓存时间（5分钟）
  defaultCacheDuration: 5 * 60 * 1000
}

const mutations = {
  /**
   * 设置缓存数据
   * @param {Object} state - Vuex state
   * @param {Object} payload - { key, data, duration }
   */
  SET_CACHE(state, { key, data, duration }) {
    state.cacheData = {
      ...state.cacheData,
      [key]: data
    }
    state.cacheTimestamps = {
      ...state.cacheTimestamps,
      [key]: {
        timestamp: Date.now(),
        duration: duration || state.defaultCacheDuration
      }
    }
  },

  /**
   * 清除指定缓存
   * @param {Object} state - Vuex state
   * @param {string} key - 缓存键
   */
  CLEAR_CACHE(state, key) {
    const newCacheData = { ...state.cacheData }
    const newTimestamps = { ...state.cacheTimestamps }
    delete newCacheData[key]
    delete newTimestamps[key]
    state.cacheData = newCacheData
    state.cacheTimestamps = newTimestamps
  },

  /**
   * 清除所有缓存
   * @param {Object} state - Vuex state
   */
  CLEAR_ALL_CACHE(state) {
    state.cacheData = {}
    state.cacheTimestamps = {}
  },

  /**
   * 清除过期缓存
   * @param {Object} state - Vuex state
   */
  CLEAR_EXPIRED_CACHE(state) {
    const now = Date.now()
    const newCacheData = {}
    const newTimestamps = {}

    Object.keys(state.cacheData).forEach(key => {
      const cacheInfo = state.cacheTimestamps[key]
      if (cacheInfo && (now - cacheInfo.timestamp) < cacheInfo.duration) {
        // 未过期，保留
        newCacheData[key] = state.cacheData[key]
        newTimestamps[key] = cacheInfo
      }
    })

    state.cacheData = newCacheData
    state.cacheTimestamps = newTimestamps
  }
}

const actions = {
  /**
   * 获取缓存数据
   * @param {Object} context - Vuex context
   * @param {string} key - 缓存键
   * @returns {any|null} 缓存的数据，如果不存在或已过期则返回null
   */
  getCache({ state }, key) {
    const cacheInfo = state.cacheTimestamps[key]

    // 检查缓存是否存在
    if (!cacheInfo || !state.cacheData[key]) {
      return null
    }

    // 检查缓存是否过期
    const now = Date.now()
    if ((now - cacheInfo.timestamp) >= cacheInfo.duration) {
      // 缓存已过期
      return null
    }

    return state.cacheData[key]
  },

  /**
   * 设置缓存数据
   * @param {Object} context - Vuex context
   * @param {Object} payload - { key, data, duration }
   */
  setCache({ commit }, payload) {
    commit('SET_CACHE', payload)
  },

  /**
   * 刷新缓存（强制更新）
   * @param {Object} context - Vuex context
   * @param {Object} payload - { key, fetchFunction, duration }
   */
  async refreshCache({ commit }, { key, fetchFunction, duration }) {
    try {
      const data = await fetchFunction()
      commit('SET_CACHE', { key, data, duration })
      return data
    } catch (error) {
      console.error(`刷新缓存失败 [${key}]:`, error)
      throw error
    }
  },

  /**
   * 获取缓存数据，如果不存在或过期则调用fetchFunction获取
   * @param {Object} context - Vuex context
   * @param {Object} payload - { key, fetchFunction, duration, forceRefresh }
   */
  async getCacheOrFetch({ state, commit, dispatch }, { key, fetchFunction, duration, forceRefresh = false }) {
    // 如果强制刷新，直接获取新数据
    if (forceRefresh) {
      return await dispatch('refreshCache', { key, fetchFunction, duration })
    }

    // 尝试从缓存获取
    const cachedData = await dispatch('getCache', key)
    if (cachedData !== null) {
      console.log(`✅ 使用缓存数据 [${key}]`)
      return cachedData
    }

    // 缓存不存在或已过期，获取新数据
    console.log(`📡 缓存未命中，获取新数据 [${key}]`)
    return await dispatch('refreshCache', { key, fetchFunction, duration })
  },

  /**
   * 清除指定缓存
   * @param {Object} context - Vuex context
   * @param {string} key - 缓存键
   */
  clearCache({ commit }, key) {
    commit('CLEAR_CACHE', key)
  },

  /**
   * 清除所有缓存
   * @param {Object} context - Vuex context
   */
  clearAllCache({ commit }) {
    commit('CLEAR_ALL_CACHE')
  },

  /**
   * 清除过期缓存
   * @param {Object} context - Vuex context
   */
  clearExpiredCache({ commit }) {
    commit('CLEAR_EXPIRED_CACHE')
  }
}

const getters = {
  /**
   * 获取所有缓存键
   */
  cacheKeys: state => Object.keys(state.cacheData),

  /**
   * 获取缓存数量
   */
  cacheCount: state => Object.keys(state.cacheData).length,

  /**
   * 检查指定缓存是否存在且未过期
   */
  isCacheValid: state => key => {
    const cacheInfo = state.cacheTimestamps[key]
    if (!cacheInfo || !state.cacheData[key]) {
      return false
    }
    const now = Date.now()
    return (now - cacheInfo.timestamp) < cacheInfo.duration
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
