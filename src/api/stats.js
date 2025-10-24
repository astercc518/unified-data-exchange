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

/**
 * 获取备份列表
 */
export function getBackupList() {
  return request({
    url: '/api/stats/backups',
    method: 'get'
  })
}

/**
 * 创建新备份
 */
export function createBackup() {
  return request({
    url: '/api/stats/backup/create',
    method: 'post'
  })
}

/**
 * 删除备份
 * @param {String} filename - 备份文件名
 */
export function deleteBackup(filename) {
  return request({
    url: `/api/stats/backup/${filename}`,
    method: 'delete'
  })
}

/**
 * 下载备份
 * @param {String} filename - 备份文件名
 */
export function downloadBackup(filename) {
  // 直接返回 URL，由浏览器处理下载
  return `/api/stats/backup/download/${filename}`
}

/**
 * 恢复备份
 * @param {String} filename - 备份文件名
 */
export function restoreBackup(filename) {
  return request({
    url: '/api/stats/backup/restore',
    method: 'post',
    data: { filename }
  })
}
