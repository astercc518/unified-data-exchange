import request from '@/utils/request'

/**
 * 获取系统统计数据
 */
export function getSystemStats() {
  return request({
    url: '/api/stats/system',
    method: 'get'
  })
}

/**
 * 获取数据库统计信息
 */
export function getDataLibraryStats() {
  return request({
    url: '/api/stats/data-library',
    method: 'get'
  })
}

/**
 * 获取订单统计信息
 * @param {Object} params - 查询参数 { startDate, endDate }
 */
export function getOrderStats(params) {
  return request({
    url: '/api/stats/orders',
    method: 'get',
    params
  })
}

/**
 * 获取充值统计信息
 * @param {Object} params - 查询参数 { startDate, endDate }
 */
export function getRechargeStats(params) {
  return request({
    url: '/api/stats/recharge',
    method: 'get',
    params
  })
}

/**
 * 获取服务器状态信息
 */
export function getServerStatus() {
  return request({
    url: '/api/stats/server-status',
    method: 'get'
  })
}

/**
 * 重启服务
 * @param {String} serviceName - 服务名称（backend/frontend/all）
 */
export function restartService(serviceName) {
  return request({
    url: '/api/stats/restart-service',
    method: 'post',
    data: { serviceName }
  })
}
